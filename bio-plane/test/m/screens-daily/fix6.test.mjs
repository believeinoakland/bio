/* screens-daily, T51 fix round 6 (G12c-casedrafts; K4570, K4571): Home asks for the drafts shared for review once, however many projects
   share one, and draws each project's drafts from its own entry of the answer. Entered by the member opening Home; every sentence is
   asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { resultOf } from "../store-request/door.mjs";
import { open as openRaw, ok, refused, text, main, settle, dmy, word, batched } from "./page.mjs";

const open = (w, as, path, plane = {}) => openRaw(path, plane, w.boot(as));
const SHARED = { count: 1, newest: "2026-10-10T10:00:00Z" };
/** The world's own `projectlist` answer, each row's `shared_drafts` set by `shared(id)` (a plain async function, not a held gate). */
const LIST = (w, as, shared) => async (req) => {
  const a = await w.door(req, as);
  const result = a && a.json && a.json.result;
  if (result) for (const r of result.projects || []) r.shared_drafts = shared(r.id);
  return a;
};
const area = (p, k) => text(p, main(p).querySelector(`[data-area="${k}"]`));
const PUBLISHED = ok({ bundles: [], cases: Array.from({ length: 5 }, (_, i) => ({ case_id: "CASE-" + (i + 1), edition: 1, published_at: "2026-09-0" + (i + 1) + "T10:00:00Z" })) });
// The walker's Home: five projects (made by the real act), each sharing a draft for its own case; the grant of each ends on a distinct day.
async function walker() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const ids = [];
  for (let i = 1; i <= 5; i++) { ids.push(await w.recipes.project(rosa, "Project " + i)); w.tick(1000); }
  return { w, rosa, ids };
}
// The editions of a published case and the drafts of a case shared with a link a recipient holds are made by no act of the door a test can use today
// (a ratified edition is signed by the member's own key, a draft names an existing published case): `casedrafts`, `reviewcopy`, `publishedlist` and
// `publishedcase` are the test's own answers (reported); the page, the team, the projects and the roster are the real store's.
const draftsOf = (ids) => (id) => { const n = ids.indexOf(id) + 1; return { ok: true, project: id, count: 1, drafts: [{ draft_id: "DRAFT-" + n, case: { case_id: "CASE-" + n, edition: 2, identity: "x" } }] }; };
const plane = (w, rosa, ids, casedrafts, shared = () => SHARED) => ({
  projectlist: LIST(w, rosa, (id) => shared(ids.indexOf(id) + 1)), publishedlist: PUBLISHED,
  publishedcase: (req) => ok({ ok: true, caseId: req.query.caseId, edition: Number(req.query.edition), scope: "Scope of " + req.query.caseId }),
  casedrafts, reviewcopy: (req) => ok({ ok: true, comments: [], grants: [{ live: true, until: "2026-10-2" + req.query.draft.slice(-1) + "T00:00:00Z" }] }),
});
const lineOf = (n) => word("screen.home.area.edition", { n: "1", case: "Scope of CASE-" + n, date: dmy("2026-09-0" + n), until: dmy("2026-10-2" + n) });

test("R99, R87, R64 (G12c): Home with five projects that share a draft sends ONE casedrafts read for all of them, and draws each project's draft line as the five single reads drew it", async () => {
  const { w, rosa, ids } = await walker();
  const p = await open(w, rosa, "/app", plane(w, rosa, ids, batched(draftsOf(ids))));
  await settle();
  const reads = p.byOp("casedrafts");
  assert.equal(reads.length, 1, "one casedrafts read, not one for each project");
  assert.deepEqual(reads[0].query.projects.split(",").sort(), [...ids].sort(), "it names every project whose row says a draft is shared");
  assert.equal(reads[0].query.project, undefined, "and none of them singly");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 4, 5]) assert.ok(inv.includes(lineOf(n)), "the draft line of project " + n);
  assert.deepEqual(p.byOp("reviewcopy").map((r) => r.query.draft).sort(), ["DRAFT-1", "DRAFT-2", "DRAFT-3", "DRAFT-4", "DRAFT-5"], "each draft's grant is still read once");
});

test("R99, R87, R64 (G12c): a project the viewer may not see answers as the single read answers it: drawn failed in the Investigation block, the other four drawn as before", async () => {
  const { w, rosa, ids } = await walker();
  // The dead answer is the real one: the store's answer for a project the viewer has no standing in (one that does not exist answers alike, review R19).
  const DEAD = resultOf(await w.door({ url: "/api/?op=casedrafts&project=PROJ-NO-SUCH-PROJECT" }, rosa));
  assert.equal(DEAD.ok, false);
  const p = await open(w, rosa, "/app", plane(w, rosa, ids, batched((id) => (id === ids[3] ? DEAD : draftsOf(ids)(id)))));
  await settle();
  assert.equal(p.byOp("casedrafts").length, 1);
  const block = main(p).querySelector('[data-area="investigation"]');
  assert.equal(block.querySelectorAll('[data-state="failed"]').length, 1, "the hidden project is drawn failed, never as none");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 5]) assert.ok(inv.includes(lineOf(n)), "the draft line of project " + n);
  assert.ok(!inv.includes(lineOf(4)) && !p.byOp("reviewcopy").some((r) => r.query.draft === "DRAFT-4"), "nothing is drawn or read for the hidden project");
});

test("R99, R87, R64 (G12c): controls: no project sharing a draft sends no casedrafts read; the whole read failing is drawn failed once", async () => {
  const { w, rosa, ids } = await walker();
  const none = await open(w, rosa, "/app", plane(w, rosa, ids, batched(draftsOf(ids)), () => ({ count: 0, newest: null })));
  await settle();
  assert.equal(none.byOp("casedrafts").length, 0, "no draft read when no row says one is shared");
  const down = await open(w, rosa, "/app", plane(w, rosa, ids, refused("STORE_DID_NOT_ANSWER", null, 502)));
  await settle();
  assert.equal(down.byOp("casedrafts").length, 1);
  assert.equal(main(down).querySelector('[data-area="investigation"]').querySelectorAll('[data-state="failed"]').length, 1, "one failed row, not one for each project");
});
