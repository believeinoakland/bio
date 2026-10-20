/* wizard-scripts R46 (T51 fix round; K4202, K4213): each op this module declares in DECLARED_OPS is held true against the op as the
   door runs it (test-support's `declaredOpHolds`): only its requires raise no refusal naming a declared field, a call without each
   required one is refused naming it, and a field outside accepts is dropped or refused naming it. Every row's description is its
   `act.<op>.does` word. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { seeded, draft, STEPS, V } from "./fixture.mjs";
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
    field: "note", told: "The fence was paid twice", state: "draft", message: "a tangle", parts: [{ subject: "Fence" }] };
  const given = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v === `sample-${k}` ? real[k] : v]));
  if (op === "writinghelp") {
    return w.wz.writingHelp({ op: "casenote", field: given.field, told: given.told, draftHeld: given.draftHeld,
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

test("R46 control: a declaration whose required field the arm never reads is caught by name", async () => {
  const bad = { ...wz.DECLARED_OPS.wizards, fields: { accepts: ["state"], requires: ["nothere"] } };
  await assert.rejects(declaredOpHolds({ op: "wizards", declaration: bad, call: call("wizards"), refusedNaming }), /nothere/);
});
