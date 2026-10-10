/* wizard-scripts: the front door (R23 as amended at T41; D52, D53; N821) and the assistant's proposal for a tangled
   message (R28), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, approved, registration, V, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const F = V("frank"), D = V("dave");
/* A world registered with a front door: a finder that answers what it is asked, recording each call, and a pointer. */
function doored({ findExisting, pointer } = {}) {
  const w = seeded({ register: false });
  const calls = [];
  const door = {
    findExisting: findExisting ?? ((message, viewer) => { calls.push([message, viewer]); return [
      { kind: "question", id: "QST-1", name: "Who paid for the fence?" }, { kind: "project", id: w.P, name: "budget" },
      { kind: "step", id: "STP-1", name: "How a budget is read" }]; }),
    pointer: pointer ?? ((viewer) => ({ text: "the profile's pointer", for: viewer })),
  };
  const r = w.wz.wizardRegister(registration({ door }));
  assert.equal(r.ok, true);
  return { w, calls };
}

test("R23 (T41; D52, D53) startFrom answers one front door for both paths: the guided starts (scripts), the design stream's doors, the six routes in order (a new project, its own-matter form hidden; an existing question or project; a lead, optionally watched, which may become a project; a step for understanding, group- or project-placed; an action; not Civicsmith's, with the registered pointer), a blank start, and the existing work matching a message; it names no words, place or law", () => {
  const { w, calls } = doored();
  const a = approved(w, { name: "Ours" });
  const before = w.snapshot();
  const r = w.wz.startFrom({ viewer: F, message: "  The fence on our street was paid twice  " });
  assert.deepEqual(r.routes.map((x) => x.route), ["project", "existing", "lead", "step", "action", "elsewhere"]);
  assert.deepEqual(r.routes[0], { route: "project", own_matter: { visibility: "hidden" } }, "a member's own matter goes to a hidden project of hers (D53)");
  assert.deepEqual(r.routes[1], { route: "existing", finds: ["question", "project"] });
  assert.deepEqual(r.routes[2], { route: "lead", watch: "optional", becomes: ["project"] });
  assert.deepEqual(r.routes[3], { route: "step", placed: ["group", "project"] });
  assert.deepEqual(r.routes[4], { route: "action" });
  assert.deepEqual(r.routes[5], { route: "elsewhere", pointer: { text: "the profile's pointer", for: F } }, "the pointer is the registration's, never named here");
  assert.equal(r.blank, true, "a blank start is always allowed");
  assert.deepEqual(r.matches, [{ kind: "question", id: "QST-1", name: "Who paid for the fence?" }, { kind: "project", id: w.P, name: "budget" },
                               { kind: "step", id: "STP-1", name: "How a budget is read" }]);
  assert.deepEqual(calls, [["The fence on our street was paid twice", F]], "the finder is asked once, with the message and the viewer");
  assert.ok(r.scripts.some((s) => s.id === a.script) && r.scripts.some((s) => s.id === LIBRARY[1].id), "the guided starts");
  assert.ok(!("proposal" in r), "no reading given, no proposal");
  assert.deepEqual(w.snapshot(), before, "writes nothing, records no use");
  assert.deepEqual(wz.START_ROUTES.map((x) => x.route), r.routes.map((x) => x.route));
  assert.ok(Object.isFrozen(wz.START_ROUTES) && Object.isFrozen(wz.START_ROUTES[0]));
  for (const local of [/oakland/i, /california/i, /court/i, /council/i]) assert.ok(!local.test(JSON.stringify(wz.START_ROUTES)), String(local));
  /* through the op table, the message from the body */
  const viaOp = wz.wizardScriptsOps(w.wz, new URL(`https://x/?op=startfrom&viewer=${encodeURIComponent(F)}`), { message: "The fence on our street was paid twice" }).startfrom();
  assert.deepEqual(viaOp, r);
});

test("R23 matches: none without a message or without a finder; a finder that throws or answers nonsense answers none; only well-formed question, project and step entries, each once, at most 20; a viewer the rule admits to nothing asks no finder; the pointer is null with none registered", () => {
  const { w, calls } = doored();
  for (const message of [undefined, null, "", "   ", 7]) assert.deepEqual(w.wz.startFrom({ viewer: F, message }).matches, [], String(message));
  assert.equal(calls.length, 0, "no message, no search");
  assert.deepEqual(w.wz.startFrom({ viewer: "nobody", message: "x" }).matches, []);
  assert.equal(calls.length, 0, "a viewer admitted to nothing asks no finder");
  const odd = doored({ findExisting: () => [null, 3, { kind: "person", id: "P-1" }, { kind: "question", id: "" }, { kind: "question", id: "Q-1", name: 9 },
                                            { kind: "question", id: "Q-1", name: "again" }, ...Array.from({ length: 30 }, (_, i) => ({ kind: "step", id: `S-${i}`, name: `s${i}` }))] });
  const m = odd.w.wz.startFrom({ viewer: F, message: "x" }).matches;
  assert.equal(m.length, wz.MATCHES_MAX);
  assert.deepEqual(m[0], { kind: "question", id: "Q-1", name: null }, "a kind the door does not show, an empty id and a repeat are dropped");
  for (const findExisting of [() => { throw new Error("down"); }, () => "nonsense", () => null])
    assert.deepEqual(doored({ findExisting }).w.wz.startFrom({ viewer: F, message: "x" }).matches, [], "never throws");
  /* with no door registered */
  const bare = seeded();
  const r = bare.wz.startFrom({ viewer: F, message: "x" });
  assert.deepEqual([r.matches, r.routes[5]], [[], { route: "elsewhere", pointer: null }]);
  assert.equal(doored({ pointer: () => { throw new Error("x"); } }).w.wz.startFrom({ viewer: F }).routes[5].pointer, null);
  /* D54's sight is the finder's: a member who cannot see P is asked for as herself */
  const seen = doored();
  seen.w.wz.startFrom({ viewer: D, message: "x" });
  assert.deepEqual(seen.calls, [["x", D]]);
});

test("R28 proposeStart: a message read as tangled is proposed as one project with several questions when its parts share a subject, and as separate projects otherwise; a rumour is proposed as a lead, never as a question aimed at a person; labelled the machine's, the member decides; startFrom answers it with the assistant's reading", () => {
  const one = wz.proposeStart({ parts: [{ text: "The fence was paid twice", subject: "Fence contract" }, { text: "Who signed it?", subject: " fence  CONTRACT " }] });
  assert.deepEqual(one, { ok: true, proposals: [{ route: "project", subject: "Fence contract", questions: [0, 1] }], label: { kind: "machine" }, decides: "member" });
  const two = wz.proposeStart({ parts: [{ text: "The fence was paid twice", subject: "Fence contract" }, { text: "The library closes early", subject: "Library hours" }] });
  assert.deepEqual(two.proposals, [{ route: "project", subject: "Fence contract", questions: [0] }, { route: "project", subject: "Library hours", questions: [1] }]);
  const rumour = wz.proposeStart({ parts: [{ text: "The fence was paid twice", subject: "Fence contract" },
                                           { text: "People say the director's brother got the contract", subject: "Fence contract", rumour: true }] });
  assert.deepEqual(rumour.proposals, [{ route: "project", subject: "Fence contract", questions: [0] }, { route: "lead", part: 1, watch: false }],
                   "the rumour is a lead, never a question, though it shares the subject");
  assert.ok(!rumour.proposals.some((p) => p.route === "project" && p.questions.includes(1)));
  /* negative controls: a part that is not a rumour stays a question; no subject is its own project; nonsense is skipped */
  assert.deepEqual(wz.proposeStart({ parts: [{ subject: "A", rumour: "true" }, { text: "no subject" }, null, 3] }).proposals,
                   [{ route: "project", subject: "A", questions: [0] }, { route: "project", subject: null, questions: [1] }]);
  for (const odd of [undefined, {}, { parts: "x" }, { parts: [] }]) assert.deepEqual(wz.proposeStart(odd).proposals, []);
  assert.equal(wz.proposeStart({ parts: Array.from({ length: 80 }, () => ({ subject: "A" })) }).proposals[0].questions.length, wz.PARTS_MAX);
  /* through the front door: the assistant's reading of the message, proposed; nothing written */
  const w = seeded();
  const before = w.snapshot();
  const r = w.wz.startFrom({ viewer: F, message: "a tangle", parts: [{ subject: "Fence" }, { subject: "Fence", rumour: true }] });
  assert.deepEqual(r.proposal.proposals, [{ route: "project", subject: "Fence", questions: [0] }, { route: "lead", part: 1, watch: false }]);
  assert.deepEqual(w.snapshot(), before);
  const op = wz.wizardScriptsOps(w.wz, new URL(`https://x/?viewer=${encodeURIComponent(F)}`), { message: "a tangle", parts: [{ subject: "Fence" }] }).startfrom();
  assert.deepEqual(op.proposal.proposals, [{ route: "project", subject: "Fence", questions: [0] }]);
});
