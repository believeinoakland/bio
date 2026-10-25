/* control-plane R17, R29 (fix round 10, final pass; K5138, K5148; WALK-FINAL-04B R146, diag2-04.md section 6; tasks COMPLETE TASKS #21, item 70, build/jobs/T51/tasks.md J11): the walker's case through the real door.
   A member captures a document by its address into her project (`acquire`, a scripted fetch) and files it as the Add screen files it (`promoteDocument` with the project); the scheduler's alarm drains
   the capture's authority event and the task is routed to the first active owner of the project the document is filed in: `op=tasks` shows her as the assignee. Before the fix `#routeTask` read only a
   project bundle itself or a `cites` edge, so every such task read `unassigned`, role group-admin, in a team whose only administrator is the founder. Control: a document filed in no project is
   routed by the administrator rule, as before (not to the project's owner). The drain is the plane's own alarm (about a second after the filing), awaited by reading `op=tasks`. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wtasks" });
after(() => kit.mf.dispose());
const R = kit.R;

/* the member's capture as the Add screen makes it: the address fetched (`acquire`), the document filed (`promote`), in a project or in none */
async function filed(auth, cs, file, words, project) {
  kit.serve(file, kit.pdfOf(words, 6000));
  const got = await kit.acquire(auth, { locator: `https://docs.example.org/tasks/${file}`, ...(project ? { project } : {}) });
  const a = R(got.body);
  assert.ok(a && a.document, "the capture is held: " + JSON.stringify(got.body).slice(0, 500));
  const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: a.document, title: file.replace(/\.pdf$/, ""), locator: a.document.locator, project: project || "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  return made.bundleId;
}
/* the member's own task list, read until the drain has made the task for the document (the alarm runs about a second after the filing) */
const taskFor = (auth, bundle) => kit.until(async () => (R(await kit.get(auth, { op: "tasks", refers: bundle })).tasks || [])[0] || null, 120000, 2000);

test("R17, R29 (tasks R1; diag2-04 section 6): a captured document filed in the member's project is routed to the first active owner of that project: after the drain `op=tasks` shows her as the assignee; control: a document filed in no project is not routed to her", { timeout: 600000 }, async () => {
  const own = await kit.ownerOf("wtasks-owner");
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Tasks walk, WALK-FINAL-04B R146");
  const inProject = await filed(own.auth, cs, "wtasks-agenda.pdf", "The council agenda for the next meeting is posted.", project);
  const outside = await filed(own.auth, cs, "wtasks-loose.pdf", "A loose notice filed in no project at all.", null);
  const task = await taskFor(own.auth, inProject);
  assert.ok(task, "the drain made the task: " + JSON.stringify(R(await kit.get(own.auth, { op: "tasks" }))).slice(0, 800));
  assert.equal(task.refers_to, inProject);
  assert.notEqual(task.assignee, "unassigned", "the task is routed: " + JSON.stringify(task).slice(0, 600));
  assert.equal(task.assignee, "wtasks-owner", "to the owner of the project the document is filed in: " + JSON.stringify(task).slice(0, 600));
  /* control: the same drain routed the document filed in no project by the administrator rule, not to the project's owner */
  const loose = await taskFor(own.auth, outside);
  assert.ok(loose, "the drain made the second task");
  assert.doesNotMatch(String(loose.assignee), /wtasks-owner/, "the unfiled document is not her task: " + JSON.stringify(loose).slice(0, 600));
});
