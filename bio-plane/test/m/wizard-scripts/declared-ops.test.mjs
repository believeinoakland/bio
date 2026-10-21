/* wizard-scripts R46 (T51 fix round; K4202, K4213): each op this module declares in DECLARED_OPS is held true against the op as the
   door runs it (test-support's `declaredOpHolds`): only its requires raise no refusal naming a declared field, a call without each
   required one is refused naming it, and a field outside accepts is dropped or refused naming it. Every row's description is its
   `act.<op>.does` word. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { seeded, draft, MACHINE, STEPS, V } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const A = V("alice"), F = V("frank");
const OPS = ["wizards", "startfrom", "writinghelp", "wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove", "wizardretire"];

/* a refusal names a field as the owner's answer does: its code's own field (a missing id is `NO_SUCH_WIZARD`, one answer for the
   version and the script; a missing `told` is `WRITING_HELP_NOTHING_TOLD`), else the field as a whole word of its code or detail */
const NAMED = { NO_SUCH_WIZARD: ["version", "script"], WRITING_HELP_NOTHING_TOLD: ["told"] };
/* `ASSISTANT_DRAFT_UNAVAILABLE`'s words say the field is unchanged: prose about the field, not a refusal of it */
const PROSE = ["ASSISTANT_DRAFT_UNAVAILABLE"];
const refusedNaming = (answer, field) => {
  if (!answer || typeof answer !== "object" || PROSE.includes(answer.code)) return false;
  if ((NAMED[answer.code] ?? []).includes(field)) return true;
  /* a writing-help body without `op` is refused WRITING_HELP_REFUSED, its answer echoing the missing `op` as null (writingHelp's `asked`) */
  if (field === "op" && answer.code === "WRITING_HELP_REFUSED" && answer.op === null) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].filter(Boolean).join(" "));
};
/* two answers are the same when they agree on their outcome: a fresh world mints its own ids, so the answers are compared by code */
const same = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

/* the op as the door runs it, over a fresh world: a real draft of frank's in the budget project stands for `version` and `script`,
   the project for `project`, and the sample a declaration's probe names is replaced by the real value it stands for. `approve`
   is run by an owner (alice) on a version frank has submitted. `writinghelp` is routed by the door, which calls `writingHelp`
   with its own `assistant` (the account it resolves). */
const call = (op) => (fields) => {
  const w = seeded();
  const d = draft(w, {});
  if (op === "wizardapprove") w.wz.wizardSubmit({ version: d.version, author: F, viewer: F });
  const real = { version: d.version, script: d.script, project: w.P, name: "Check the fence", steps: STEPS, reason: "Changed my mind",
    field: "note", told: "The fence was paid twice", state: "draft", message: "a tangle", parts: [{ subject: "Fence" }], op: "casenote" };
  const given = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v === `sample-${k}` ? real[k] : v]));
  if (op === "writinghelp") {
    return w.wz.writingHelp({ op: given.op, field: given.field, told: given.told, draftHeld: given.draftHeld,
      assistant: { on: true, account: "ACC-test" }, by: F, viewer: F });
  }
  const author = op === "wizardapprove" ? A : F;
  const url = new URL(`https://x/?op=${op}&author=${encodeURIComponent(author)}&viewer=${encodeURIComponent(author)}`);
  return wz.wizardScriptsOps(w.wz, url, given)[op]();
};

test("R46 DECLARED_OPS holds exactly the eight ops the fix round names", () => {
  assert.deepEqual(Object.keys(wz.DECLARED_OPS).sort(), [...OPS].sort());
});

for (const op of OPS) {
  test(`R46 ${op}: its declared fields hold against the op as the door runs it`, async () => {
    await declaredOpHolds({ op, declaration: wz.DECLARED_OPS[op], call: call(op), refusedNaming, same });
  });

  test(`R46 ${op}: its description is its act word, not a sentence of this module's own`, () => {
    assert.equal(wz.DECLARED_OPS[op].description, word(`act.${op}.does`));
  });
}

test("R46 control: a writinghelp body without op is refused naming it", async () => {
  const answer = await call("writinghelp")({ told: "The fence was paid twice" });
  assert.equal(answer.ok, false);
  assert.equal(refusedNaming(answer, "op"), true);
});

test("R46 control: a declaration whose required field the arm never reads is caught by name", async () => {
  const bad = { ...wz.DECLARED_OPS.wizards, fields: { accepts: ["state"], requires: ["nothere"] } };
  await assert.rejects(declaredOpHolds({ op: "wizards", declaration: bad, call: call("wizards"), refusedNaming }), /nothere/);
});

test("R46 control: wizardrevise with adopt and no steps is not refused: the proposal's steps are the revision", () => {
  const w = seeded();
  const d = draft(w, {});
  const p = w.wz.wizardPropose({ script: d.script, steps: STEPS, why: "w", proposer: MACHINE, viewer: MACHINE });
  const url = new URL(`https://x/?op=wizardrevise&author=${encodeURIComponent(F)}&viewer=${encodeURIComponent(F)}`);
  const answer = wz.wizardScriptsOps(w.wz, url, { version: d.version, adopt: p.proposal.id })["wizardrevise"]();
  assert.deepEqual([answer.ok, answer.adopted], [true, p.proposal.id]);
  assert.equal(refusedNaming(answer, "steps"), false);
});

/* T51 fix round 3, small 2 (K4230; K4208): the screen sends `state` in the body, so the declaration accepts it there and the arm
   reads it through `pick` (body first, then the query). The census agrees with the arm: the declared field is the one it reads. */
test("R46 (T51 fix round 3, small 2; K4230, K4208) wizards declares `state` as the body field its arm reads, and the arm reads it from the body", () => {
  assert.deepEqual(wz.DECLARED_OPS.wizards.fields.accepts, ["state"]);
  const w = seeded();
  const d = draft(w, {});
  const url = new URL(`https://x/?op=wizards&viewer=${encodeURIComponent(F)}`);
  const listed = wz.wizardScriptsOps(w.wz, url, { state: "draft" })["wizards"]().scripts.map((x) => x.id);
  assert.ok(listed.includes(d.script), "the body's state=draft lists the draft");
});

test("R46 control (small 2): the wizards arm still reads state from the query: ?state=draft lists the viewer's draft, and no query without it lists it as offered", () => {
  const w = seeded();
  const d = draft(w, {});
  const listed = (query) => wz.wizardScriptsOps(w.wz, new URL(`https://x/?op=wizards${query}&viewer=${encodeURIComponent(F)}`), {})["wizards"]().scripts.map((x) => x.id);
  assert.ok(listed("&state=draft").includes(d.script), "the query's state=draft lists the draft");
  assert.ok(!listed("").includes(d.script), "without the query the draft is not offered: the state came from the query");
});
