/* screens-daily R87 over the real roster (project-roster R42; fix round 3, C14 P2.2; K4370): the rows Home draws are the rows `projectList` answers over the REAL
   store (store-request's `storeWorld()`, op-tables §5.3), whose door wires review's reader (control-plane R118): the projects, questions, the draft shared
   for review and the project whose summary is not known are made by the real acts. Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open as openRaw, text, settle, word } from "./page.mjs";

/** A team: the founder (an administrator) with three projects, two questions drawn into the first and one into the third, a draft of the third shared for
 *  review until a day (`casedraft`, `reviewgrant`), and a fourth, hidden project of a member since removed (the rescue is open to the administrator:
 *  the roster knows nothing of its questions or drafts, R39). All by the real acts. */
async function roster() {
  const w = await storeWorld({ group: null, now: Date.now() });
  const ann = await w.signIn("admin");
  const mo = await w.signIn("mo", { capabilities: ["contribute", "create_projects"] });
  const [one, two, three] = [await w.recipes.project(ann, "Pothole repairs"), await w.recipes.project(ann, "Bus stops"), await w.recipes.project(ann, "Library hours")];
  await w.recipes.questions(ann, one, 2);
  await w.recipes.questions(ann, three, 1);
  const draft = await ann.act("casedraft", { body: { project: three, statement: "A draft for review"} });
  await ann.act("reviewgrant", { body: { draft: draft.draftId, recipient: "A neighbour", until: new Date(w.now() + 5 * 86400000).toISOString() } });
  const stranded = await w.recipes.project(mo, "Stranded plans");
  await mo.act("projectvisibilityset", { query: { projectId: stranded, setting: "hidden", reason: "mine for now" } });
  await ann.act("memberset", { body: { memberId: "mo", status: "revoked" } });
  const rows = (await ann.read("projectlist")).projects;
  return { w, ann, rows, ids: { one, two, three, stranded } };
}

test("R87 (real path): Home draws the counts the real roster answers and reads the drafts of the one project it says shares one; a row whose summary is not known (null) is read for none", async () => {
  const { w, ann, rows, ids } = await roster();
  const row = (id) => rows.find((r) => r.id === id);
  assert.deepEqual([ids.one, ids.two, ids.three].map((id) => row(id).question_count), [2, 0, 1]);
  assert.deepEqual([row(ids.three).shared_drafts.count, row(ids.one).shared_drafts.count], [1, 0], "the roster says which project shares a draft");
  assert.deepEqual([row(ids.stranded).rescue_open, row(ids.stranded).shared_drafts, row(ids.stranded).question_count], [true, null, null], "the summary of the stranded project is not known");
  const p = await openRaw("/app", {}, w.boot(ann));
  await settle();
  assert.deepEqual(p.byOp("casedrafts").map((r) => r.query.projects), [ids.three], "only the project the roster says shares a draft (the one with an unknown summary is not read)");
  assert.ok(text(p).includes(word("screen.home.questions.many", { n: "2" })) && text(p).includes(word("screen.home.questions.one")), "the counts are the roster's");
});
