/* control-plane R17, R29 (fix round 10, final pass; K5138, K5148; build/plan/fix-round-10-T51.md item 73; provenance R80, tasks R20; WALK-FINAL-04B R146): the walker's case through the real door.
   A member captures a document by its address into her project and files it (`acquire`, `promoteDocument`); the scheduler's drain makes the authority task (`op=tasks`); she decides it (`taskdecide`,
   outcome `determined`, the issuer and her basis). Then `GET op=authority&bundleId=` answers the standing authority the decision made: state determined, the issuer, her basis, `by` her handle, `reviewed` false,
   the history ending in the decision. Control: before the decision the same read answers the register's acquisition-time value alone (no decision in its history); a second document decided
   `undetermined_after_review` reads undetermined and reviewed. The drain is the plane's own alarm, awaited by reading `op=tasks`. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wauthdec" });
after(() => kit.mf.dispose());
const R = kit.R;

async function filed(auth, cs, file, words, project) {
  kit.serve(file, kit.pdfOf(words, 6000));
  const got = await kit.acquire(auth, { locator: `https://docs.example.org/authority/${file}`, project });
  const a = R(got.body);
  assert.ok(a && a.document, "the capture is held: " + JSON.stringify(got.body).slice(0, 500));
  const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: a.document, title: file.replace(/\.pdf$/, ""), locator: a.document.locator, project });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  return made.bundleId;
}
const taskFor = (auth, bundle) => kit.until(async () => (R(await kit.get(auth, { op: "tasks", refers: bundle })).tasks || [])[0] || null, 120000, 2000);
const authorityOf = async (auth, bundleId) => R(await kit.get(auth, { op: "authority", bundleId }));

test("R17, R29 (provenance R80, tasks R20): after the member's `taskdecide` of the authority task, `op=authority` reads the decision (determined, issuer, basis, by, reviewed false, history); before it, the register's value alone; an undetermined_after_review decision reads reviewed", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("wauthdec-ann");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Authority walk, WALK-FINAL-04B R146");
  const one = await filed(own.auth, cs, "wauthdec-agenda.pdf", "The council agenda for the next meeting is posted.", project);
  const two = await filed(own.auth, cs, "wauthdec-notice.pdf", "A second notice from the clerk about the budget hearing.", project);
  const task = await taskFor(own.auth, one);
  assert.ok(task, "the drain made the task: " + JSON.stringify(R(await kit.get(own.auth, { op: "tasks" }))).slice(0, 800));
  assert.equal(task.assignee, "wauthdec-ann", JSON.stringify(task).slice(0, 400));

  /* control: before any decision the read answers the register's acquisition-time value alone */
  const before = await authorityOf(own.auth, one);
  assert.equal(before.ok, true, JSON.stringify(before).slice(0, 400));
  assert.equal(before.bundleId, one);
  assert.equal(before.captures.length, 1, JSON.stringify(before).slice(0, 400));
  assert.ok(!(before.captures[0].authority?.history || []).some((h) => h.source === "decision"), "no decision yet: " + JSON.stringify(before.captures[0]).slice(0, 500));

  const decided = await kit.post(own.auth, "taskdecide", { id: task.id, outcome: "determined", authority: "City Clerk of Oakland", basis: "The letterhead and the seal on the first page name the clerk." });
  assert.equal(R(decided.body).ok, true, kit.gateLine(decided));

  const after1 = await authorityOf(own.auth, one);
  assert.equal(after1.ok, true, JSON.stringify(after1).slice(0, 400));
  assert.equal(after1.captures.length, 1);
  const cap = after1.captures[0];
  assert.ok(cap.capture_sha, JSON.stringify(cap).slice(0, 300));
  const a = cap.authority;
  assert.ok(a, "the standing authority is stated: " + JSON.stringify(cap).slice(0, 600));
  assert.equal(a.authority_state, "determined", JSON.stringify(a).slice(0, 600));
  assert.equal(a.authority, "City Clerk of Oakland", JSON.stringify(a).slice(0, 600));
  assert.equal(a.basis, "The letterhead and the seal on the first page name the clerk.");
  assert.equal(a.by, "wauthdec-ann");
  assert.ok(a.at, "dated");
  assert.equal(a.reviewed, false);
  const last = a.history[a.history.length - 1];
  assert.equal(last.source, "decision", JSON.stringify(a.history).slice(0, 600));
  assert.equal(last.outcome, "determined");
  /* the named capture reads the same */
  const named = await kit.get(own.auth, { op: "authority", bundleId: one, capture: cap.capture_sha });
  assert.deepEqual(R(named).captures, after1.captures, "naming the capture answers the same entry");

  /* the other document, decided undetermined after review */
  const task2 = await taskFor(own.auth, two);
  assert.ok(task2, "the second task");
  const d2 = await kit.post(own.auth, "taskdecide", { id: task2.id, outcome: "undetermined_after_review", basis: "The page names no issuer and the site's owner could not be reached." });
  assert.equal(R(d2.body).ok, true, kit.gateLine(d2));
  const a2 = (await authorityOf(own.auth, two)).captures[0].authority;
  assert.equal(a2.authority_state, "undetermined", JSON.stringify(a2).slice(0, 600));
  assert.equal(a2.reviewed, true, JSON.stringify(a2).slice(0, 600));
  assert.equal(a2.by, "wauthdec-ann");
});
