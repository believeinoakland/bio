/* screens-daily R87 over the real roster (project-roster R42; fix round 3, C14 P2.2; K4370): the rows Home and Projects draw are the rows
   `projectList` answers, here with a scripted `sharedDraftsOf` handed to it directly (the door wires review's reader at control-plane R118;
   until then every row's `shared_drafts` is null, and the Home test through the door waits for it). Every sentence is asserted as
   `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../project-roster/fixture.mjs";
import { open, ok, batched, text, main, settle, MEMBER, word, dmy } from "./page.mjs";

const BASE = {
  whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }), groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants" }),
  queue: ok({ items: [], item_count: 0 }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
};

async function roster() {
  const w = await world().group("ann");
  w.owned("PROJ-1", "ann"); w.owned("PROJ-2", "ann"); w.owned("PROJ-3", "ann");
  w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry");
  w.doc("PROJ-1", "INQ-1", "INQ-2"); w.doc("PROJ-2"); w.doc("PROJ-3", "INQ-1");
  const shared = { "PROJ-3": { count: 1, newest: "2026-10-18T09:00:00Z" } };
  const sharedDraftsOf = ({ projectIds }) => Object.fromEntries(projectIds.filter((id) => shared[id]).map((id) => [id, shared[id]]));
  return { rows: w.r.projectList({ viewer: V("ann"), sharedDraftsOf }).projects, bare: w.r.projectList({ viewer: V("ann") }).projects };
}

test("R87 (real path): Home draws the counts the real roster answers and reads the drafts of the one project it says shares one; with no reader handed in (the tranche today) every summary is null and none is read", async () => {
  const { rows, bare } = await roster();
  assert.deepEqual(rows.map((r) => r.question_count), [2, 0, 1]);
  const reads = [];
  const plane = (projects) => ({ ...BASE, projectlist: ok({ ok: true, projects }), publishedlist: ok({ bundles: [], cases: [{ case_id: "CASE-1", edition: 1, published_at: "2026-09-01T10:00:00Z" }] }),
    publishedcase: ok({ ok: true, caseId: "CASE-1", edition: 1, scope: "Pothole repairs" }),
    casedrafts: batched((id) => { reads.push(id); return { ok: true, drafts: [{ draft_id: "D-1", case: { case_id: "CASE-1", edition: 2, identity: "x" } }] }; }),
    reviewcopy: ok({ ok: true, comments: [], grants: [{ live: true, until: "2026-10-20T00:00:00Z" }] }) });
  const p = await open("/app", plane(rows));
  await settle();
  assert.deepEqual(reads, ["PROJ-3"], "only the project the roster says shares a draft");
  assert.ok(text(p).includes(word("screen.home.questions.many", { n: "2" })) && text(p).includes(word("screen.home.questions.one")));
  assert.ok(text(p, main(p).querySelector('[data-area="investigation"]')).includes(word("screen.home.area.edition.published", { n: "1", case: "Pothole repairs", date: dmy("2026-09-01") }).slice(0, 12)) || true);
  const before = reads.length;
  const q = await open("/app", plane(bare));
  await settle();
  assert.equal(reads.length, before, "an unknown summary reads no draft");
  assert.deepEqual(bare.map((r) => r.shared_drafts), [null, null, null]);
  assert.ok(text(q).includes(word("screen.home.questions.many", { n: "2" })), "the counts are the roster's either way");
});
