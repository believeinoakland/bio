/* screens-inquiry T51 fix round 11 (B89; walks C and E): C-M2 (a typing a second member has checked draws no "Not yet checked", and that member is offered no
 * form; R97, content R57), C-M5 (a passage answered "No" is in no part, even when a "Yes, because of" names it; R23, DEC-32), C-M13 (a lead a member flagged is
 * not drawn as the assistant's guess; R105). On interface-shell's served page; the question's partition by real acts over the world (K5054), the typings and the
 * candidate by the plane where no act makes them. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { CONTRADICTION_SCREEN } from "../../../src/screens-inquiry/contradiction.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { open, plane, main, press, actsIn, storeWorld, word, P, SHA, D, DOCUMENT_MD } from "./fixtures.mjs";

/* ---- C-M2 ---- */
const TYPED = (attestations) => ok({ ok: true, transcriptions: [{ content_id: "c".repeat(64), transcriber: "rosa", at: "2026-10-05T09:00:00Z",
  extent: { kind: "pdf-page", page: 7 }, attestations }] });
const docAt = "/app/document/" + D;
const typedBox = (p) => main(p).querySelector("[data-fold=typed]");

test("R97 C-M2 a typing another member has checked (a confirmation that counts) draws no 'Not yet checked', and the member who checked it is offered no form; control: an unchecked typing keeps both", async () => {
  const checkedByOther = await open(docAt, { plane: { transcriptions: TYPED([{ attestor: "ana", at: "2026-10-06T09:00:00Z", counts: true }]) } });
  const box = typedBox(checkedByOther);
  assert.ok(box, "the typed page is drawn");
  assert.ok(!box.textContent.includes(word("screen.document.attest.status", { name: "rosa" })), "the page does not say it is not yet checked");
  const mineChecked = await open(docAt, { plane: { transcriptions: TYPED([{ attestor: "mai", at: "2026-10-06T09:00:00Z", counts: true }]) } });
  assert.ok(!actsIn(typedBox(mineChecked)).includes("transcriptionattest"), "the member who confirmed it is offered no form");
  assert.equal(mineChecked.doc.getElementById("document-attest-note-" + "c".repeat(64)), null, "and no note field");
  const unchecked = await open(docAt, { plane: { transcriptions: TYPED([]) } });
  assert.ok(typedBox(unchecked).textContent.includes(word("screen.document.attest.status", { name: "rosa" })), "control: an unchecked typing says so");
  assert.ok(actsIn(typedBox(unchecked)).includes("transcriptionattest"), "control: and offers this member the confirmation");
});

/* ---- C-M5 ---- */
const GRADES = ["B", "B", "C"];
const stateB = async (n = 2) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const docs = [];
  for (let i = 0; i < n; i++) docs.push((await world.recipes.hold(ann, "Passage " + (i + 1), "The Director shall repair each reported pothole, part " + (i + 1) + ".", project)).bundle);
  const legs = docs.map((target, i) => ({ target, role: "supports", grade: GRADES[i], grade_axis: "capture", grade_source: "capture" }));
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs, draw: true })).id;
  const { door, session } = world.boot(ann);
  const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id });
  await p.settle();
  p.question = id;
  return p;
};
const tick = (p, id) => { p.doc.getElementById(id).checked = true; };
const save = async (p) => { await press(p, "inquiryground", { reason: "my reading" }); return p.byOp("inquiryground").at(-1).body; };

test("R23 C-M5 a passage answered 'Yes, because of' another that is answered 'No' does not join it to its part: the 'No' passage is in no ground; control: a 'Yes' that names a 'Yes' joins it", async () => {
  const p = await stateB(2);
  tick(p, "ask-0-0"); /* passage 0: "No, my answer falls" */
  tick(p, "ask-1-1"); tick(p, "ask-which-1-0"); /* passage 1: "Yes, because of" passage 0 */
  const body = await save(p);
  assert.deepEqual(body.grounds, [{ ground: "part 1", legs: [1] }], "passage 1 stands as its own ground");
  assert.ok(body.grounds.every((g) => !g.legs.includes(0)), "the 'No' passage is in no ground");
  const q = await stateB(2);
  tick(q, "ask-0-1"); tick(q, "ask-1-1"); tick(q, "ask-which-1-0");
  assert.deepEqual((await save(q)).grounds, [{ ground: "part 1", legs: [0, 1] }], "control: two 'Yes' passages joined as before");
});

/* ---- C-M13 ---- */
const S = "screen.contradiction.";
const CAND = "c0".repeat(32), A_DOC = "INFO-2026-0011", B_DOC = "INFO-2026-0012";
const docMd = (id, title) => DOCUMENT_MD.replace("INFO-2026-0004", id).replace(/title: ".*"/, `title: "${title}"`);
const SIDE_A = { kind: "extent", content_id: "CNT-A", capture_sha: SHA, ref: "pdf-page:2", extent_kind: "pdf-page", text: "The rent adjustment takes effect on November 1, 2026.",
  source: { bundle: A_DOC, ref: "pdf-page:2" }, date: "2024-03-04", doctype: "amendment" };
const SIDE_B = { ...SIDE_A, content_id: "CNT-B", text: "The adjusted rent is due beginning December 1, 2026.", source: { bundle: B_DOC, ref: "pdf-page:0" }, date: "2026-09-12", doctype: "notice" };
const MACHINE = { label: "world", reason: "A lease amendment and a later notice date the same adjustment differently.", run: "RUN-1", proposed_by: "member:x", at: "2026-10-10T09:00:00Z", origin: "machine", machine_work: true };
const cand = (o = {}) => ({ candidate: CAND, key: "K4", why: "Two documents about one lease give different dates.", a: SIDE_A, b: SIDE_B, machine: MACHINE,
  weight: "lead", state: "open", resolution: null, inquiry: null, recommendations: [], reach: { projects: [P], truncated: false },
  default_question: "Which date does the rent adjustment take effect?", ...o });
const answer = (c) => ok({ ok: true, wrote: false, on: { candidate: CAND }, candidates: [c], empty: null });
const IMAGES = { [A_DOC]: { "bundle.md": docMd(A_DOC, "Lease amendment, March 2024") }, [B_DOC]: { "bundle.md": docMd(B_DOC, "Rent notice, September 2026") } };
const SERVED = [...SCREENS.filter((s) => s.id !== "contradiction"), CONTRADICTION_SCREEN];
const openLead = async (c) => {
  const p = await boot({ screens: SERVED, path: "/app/contradiction/" + CAND, plane: plane({ images: IMAGES, plane: {
    contradictioncandidates: answer(c), contradictionfacts: ok({ ok: true, candidate: CAND, key: "K4", facts: [] }), contradictionnotices: ok({ ok: true, notices: [] }) } }) });
  await p.settle();
  return p;
};

test("R105 C-M13 a lead a member flagged is not drawn as the assistant's guess; control: a machine's lead is drawn as the assistant's guess", async () => {
  const flagged = await openLead(cand({ machine: null, flagged_by: { member: "u-7", at: "2026-10-11T09:00:00Z", reason: "The notice and the amendment give two different dates." } }));
  assert.ok(!main(flagged).textContent.includes(word(S + "this.is.a.lead.the.assistant")), "the assistant's guess is not drawn for a member's flag");
  const machine = await openLead(cand());
  assert.ok(main(machine).textContent.includes(word(S + "this.is.a.lead.the.assistant")), "control: a machine's lead keeps its sentence");
});
