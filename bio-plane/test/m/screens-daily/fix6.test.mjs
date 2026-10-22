/* screens-daily, T51 fix round 6 (G12c-casedrafts; K4570, K4571): Home asks for the drafts shared for review once, however many projects
   share one, and draws each project's drafts from its own entry of the answer. Entered by the member opening Home; every sentence is
   asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, main, settle, dmy, word, MEMBER, batched } from "./page.mjs";

const BASE = {
  whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }),
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents and leases on city land." }),
  queue: ok({ items: [], item_count: 0 }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
  startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
};
const SHARED = { count: 1, newest: "2026-10-10T10:00:00Z" };
const PROJ = (id, name, shared) => ({ id, name, stage: "investigating", lastChange: "2026-10-12T15:00:00Z", question_count: 1, shared_drafts: shared });
const LIST = (projects) => ok({ ok: true, count: projects.length, limit: 200, truncated: false, projects });
const area = (p, k) => text(p, main(p).querySelector(`[data-area="${k}"]`));
const PUBLISHED = ok({ bundles: [], cases: Array.from({ length: 5 }, (_, i) => ({ case_id: "CASE-" + (i + 1), edition: 1, published_at: "2026-09-0" + (i + 1) + "T10:00:00Z" })) });
// The walker's Home: five projects, each sharing a draft for its own case; the grant of each ends on a distinct day.
const ROWS = ["PROJ-1", "PROJ-2", "PROJ-3", "PROJ-4", "PROJ-5"].map((id, i) => PROJ(id, "Project " + (i + 1), SHARED));
const DEAD = { ok: false, code: "NO_REVIEW_COPY" };
const draftsOf = (id) => ({ ok: true, project: id, count: 1, drafts: [{ draft_id: "DRAFT-" + id.slice(-1), case: { case_id: "CASE-" + id.slice(-1), edition: 2, identity: "x" } }] });
const plane = (casedrafts) => ({
  ...BASE, projectlist: LIST(ROWS), publishedlist: PUBLISHED,
  publishedcase: (req) => ok({ ok: true, caseId: req.query.caseId, edition: Number(req.query.edition), scope: "Scope of " + req.query.caseId }),
  casedrafts, reviewcopy: (req) => ok({ ok: true, comments: [], grants: [{ live: true, until: "2026-10-2" + req.query.draft.slice(-1) + "T00:00:00Z" }] }),
});
const lineOf = (n) => word("screen.home.area.edition", { n: "1", case: "Scope of CASE-" + n, date: dmy("2026-09-0" + n), until: dmy("2026-10-2" + n) });

test("R87, R64 (G12c): Home with five projects that share a draft sends ONE casedrafts read for all of them, and draws each project's draft line as the five single reads drew it", async () => {
  const p = await open("/app", plane(batched(draftsOf)));
  await settle();
  const reads = p.byOp("casedrafts");
  assert.equal(reads.length, 1, "one casedrafts read, not one for each project");
  assert.deepEqual(reads[0].query.projects.split(","), ROWS.map((r) => r.id), "it names every project whose row says a draft is shared");
  assert.equal(reads[0].query.project, undefined, "and none of them singly");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 4, 5]) assert.ok(inv.includes(lineOf(n)), "the draft line of project " + n);
  assert.deepEqual(p.byOp("reviewcopy").map((r) => r.query.draft).sort(), ["DRAFT-1", "DRAFT-2", "DRAFT-3", "DRAFT-4", "DRAFT-5"], "each draft's grant is still read once");
});

test("R87, R64 (G12c): a project the viewer may not see answers as the single read answers it: drawn failed in the Investigation block, the other four drawn as before", async () => {
  const p = await open("/app", plane(batched((id) => (id === "PROJ-4" ? DEAD : draftsOf(id)))));
  await settle();
  assert.equal(p.byOp("casedrafts").length, 1);
  const block = main(p).querySelector('[data-area="investigation"]');
  assert.equal(block.querySelectorAll('[data-state="failed"]').length, 1, "the hidden project is drawn failed, never as none");
  const inv = area(p, "investigation");
  for (const n of [1, 2, 3, 5]) assert.ok(inv.includes(lineOf(n)), "the draft line of project " + n);
  assert.ok(!inv.includes(lineOf(4)) && !p.byOp("reviewcopy").some((r) => r.query.draft === "DRAFT-4"), "nothing is drawn or read for the hidden project");
});

test("R87, R64 (G12c): controls: no project sharing a draft sends no casedrafts read; the whole read failing is drawn failed once", async () => {
  const none = await open("/app", { ...plane(batched(draftsOf)), projectlist: LIST(ROWS.map((r) => ({ ...r, shared_drafts: { count: 0, newest: null } }))) });
  await settle();
  assert.equal(none.byOp("casedrafts").length, 0, "no draft read when no row says one is shared");
  const down = await open("/app", plane(refused("STORE_DID_NOT_ANSWER", null, 502)));
  await settle();
  assert.equal(down.byOp("casedrafts").length, 1);
  assert.equal(main(down).querySelector('[data-area="investigation"]').querySelectorAll('[data-state="failed"]').length, 1, "one failed row, not one for each project");
});
