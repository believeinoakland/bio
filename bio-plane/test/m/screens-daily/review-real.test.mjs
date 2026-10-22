/* screens-daily, T51 fix round 6 (G12c-casedrafts; R-SEAM, K4427): Home over the REAL review module. Five projects each hold a draft shared
   for review, made by the member's own acts through review's ops (`draft`, `grant`); the roster rows' summaries are review's own
   `sharedDraftsByProject`; `casedrafts` and `reviewcopy` are answered by review's op map with the control plane's stamp (`viewer`).
   Home sends one `casedrafts` and draws every project's line. Review's batch (`projects`, R19) is a provider of this round: until it
   merges, this file is red by name (the real list reads `project` only and answers every id dead). */
import test from "node:test";
import assert from "node:assert/strict";
import { standard, V, sha } from "../review/fixture.mjs";
import { reviewOps } from "../../../src/review/index.mjs";
import { open, ok, text, main, settle, dmy, word, MEMBER } from "./page.mjs";

const IDS = ["PROJ-2026-0011-a", "PROJ-2026-0012-b", "PROJ-2026-0013-c", "PROJ-2026-0014-d", "PROJ-2026-0015-e"];
const UNTIL = "2026-11-05T00:00:00.000Z";
const OUTSIDE = "PROJ-2026-0002-q"; // quinn's: ann has no standing there

function build() {
  const w = standard();
  const cases = IDS.map((id, i) => ({ id, caseId: "CASE-2026-001" + (i + 1) }));
  const drafts = {};
  for (const c of cases) {
    w.project(c.id, { owners: ["ann"] });
    w.publishedCase(c.caseId, c.id, 1, { scope: "Scope of " + c.caseId });
    const d = w.r.act({ act: "draft", author: "ann", project: c.id, statement: "S", caseId: c.caseId });
    assert.ok(d.ok !== false, "the draft is made by review's own act");
    const g = w.r.act({ act: "grant", author: "ann", draft: d.draftId, recipient: "Reviewer " + c.id, secretSha: sha("secret-" + c.id), until: UNTIL });
    assert.ok(g.ok !== false, "the grant is made by review's own act");
    drafts[c.id] = d.draftId;
  }
  return { w, cases, drafts };
}

// The control plane's door: review's op map with the viewer stamped, the answer as the plane serves it.
const door = (w, viewer) => (req) => {
  const url = new URL("http://plane/?" + new URLSearchParams({ ...req.query, viewer: V(viewer) }));
  const op = req.op || "";
  return ok(reviewOps(w.r, url, null)[op]());
};

test("R87, R64 (G12c, seam): Home over the real review module sends one casedrafts and draws every project's draft line from review's own answers", async () => {
  const { w, cases } = build();
  const summaries = w.r.sharedDraftsByProject({ projectIds: IDS, viewer: V("ann") });
  const rows = IDS.map((id, i) => ({ id, name: "Project " + (i + 1), stage: "investigating", lastChange: "2026-10-12T15:00:00Z", question_count: 1, shared_drafts: summaries[id] }));
  assert.deepEqual(rows.map((r) => r.shared_drafts.count), [1, 1, 1, 1, 1], "review's own summary says each shares a draft");
  const seen = [];
  const p = await open("/app", {
    whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }),
    groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "x" }),
    queue: ok({ items: [], item_count: 0 }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
    startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
    projectlist: ok({ ok: true, count: 5, limit: 200, truncated: false, projects: rows }),
    publishedlist: ok({ bundles: [], cases: cases.map((c) => ({ case_id: c.caseId, edition: 1, published_at: "2026-09-01T10:00:00Z" })) }),
    publishedcase: (req) => ok({ ok: true, caseId: req.query.caseId, edition: 1, scope: "Scope of " + req.query.caseId }),
    casedrafts: (req) => { seen.push(req.query); return door(w, "ann")({ ...req, op: "casedrafts" }); },
    reviewcopy: (req) => door(w, "ann")({ ...req, op: "reviewcopy" }),
  });
  await settle();
  assert.equal(seen.length, 1, "one casedrafts read for the five projects");
  const inv = text(p, main(p).querySelector('[data-area="investigation"]'));
  for (const c of cases) {
    assert.ok(inv.includes(word("screen.home.area.edition", { n: "1", case: "Scope of " + c.caseId, date: dmy("2026-09-01"), until: dmy(UNTIL.slice(0, 10)) })), "the draft line of " + c.caseId);
  }
  assert.equal(main(p).querySelector('[data-area="investigation"]').querySelectorAll('[data-state="failed"]').length, 0, "nothing is drawn failed");
});

test("R87, R64 (G12c, seam): control: a project the viewer has no standing in is review's own dead answer in the batch: one failed row, the others drawn", async () => {
  const { w, cases } = build();
  const rows = [...IDS, OUTSIDE].map((id, i) => ({ id, name: "Project " + (i + 1), stage: "investigating", lastChange: "2026-10-12T15:00:00Z", question_count: 1, shared_drafts: { count: 1, newest: "2026-10-10T10:00:00Z" } }));
  const p = await open("/app", {
    whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }),
    groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "x" }),
    queue: ok({ items: [], item_count: 0 }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
    startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
    projectlist: ok({ ok: true, count: 6, limit: 200, truncated: false, projects: rows }),
    publishedlist: ok({ bundles: [], cases: cases.map((c) => ({ case_id: c.caseId, edition: 1, published_at: "2026-09-01T10:00:00Z" })) }),
    publishedcase: (req) => ok({ ok: true, caseId: req.query.caseId, edition: 1, scope: "Scope of " + req.query.caseId }),
    casedrafts: (req) => door(w, "ann")({ ...req, op: "casedrafts" }),
    reviewcopy: (req) => door(w, "ann")({ ...req, op: "reviewcopy" }),
  });
  await settle();
  const block = main(p).querySelector('[data-area="investigation"]');
  assert.equal(block.querySelectorAll('[data-state="failed"]').length, 1, "the project she has no standing in is drawn failed, once");
  const inv = text(p, block);
  for (const c of cases) assert.ok(inv.includes(word("screen.home.area.edition", { n: "1", case: "Scope of " + c.caseId, date: dmy("2026-09-01"), until: dmy(UNTIL.slice(0, 10)) })), "the five she may see are drawn: " + c.caseId);
});
