/* review T51 (fix round 3): the list says what each draft has prepared and published (R19, case-authoring R83), and the
   drafts shared for review, by project (R43). case-authoring's `draftEditions` is a scripted double (`ca.editions`) until
   that module merges. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, Q, V, SECRET } from "./fixture.mjs";

const draft = (w, extra = {}, author = "ann", project = P) => w.r.act({ act: "draft", author, project, statement: "S", ...extra });
const grant = (w, d, n, author = "ann", until) => w.r.act({ act: "grant", author, draft: d.draftId, recipient: `R${n}`, secretSha: SECRET(n),
                                                            ...(until ? { until } : {}) });

test("R19: each draft of the list states what it has prepared and published, as case-authoring's draftEditions answers for the draft's case identity; a draft never prepared states nulls (editions)", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const prepared = draft(w), published = draft(w, { caseId: "CASE-2026-0001" }), never = draft(w, { newCase: true });
  const address = "/app/published/CASE-2026-0001/1";
  w.ca.editions = ({ caseId, draft: row }) => {
    const id = row && typeof row === "object" ? row.draft_id : row;
    return id === prepared.draftId ? { prepared: 1, published: null, case: "CASE-2026-0002" }
         : id === published.draftId ? { prepared: null, published: { edition: 1, address }, case: "CASE-2026-0001" }
         : { prepared: null, published: null, case: null };
  };
  w.calls.editions.length = 0;
  const l = w.r.list({ project: P, viewer: V("ann") });
  const by = Object.fromEntries(l.drafts.map((d) => [d.draft_id, d.editions]));
  assert.deepEqual(by[prepared.draftId], { prepared: 1, published: null, case: "CASE-2026-0002" });
  assert.deepEqual(by[published.draftId], { prepared: null, published: { edition: 1, address }, case: "CASE-2026-0001" });
  assert.deepEqual(by[never.draftId], { prepared: null, published: null, case: null }, "control: never prepared");
  /* asked once per row, at the draft's own case identity (the case it names, else none) and the draft itself */
  assert.equal(w.calls.editions.length, 3);
  const asked = Object.fromEntries(w.calls.editions.map((a) => [(a.draft.draft_id ?? a.draft), a.caseId]));
  assert.deepEqual([asked[prepared.draftId], asked[published.draftId], asked[never.draftId]], [null, "CASE-2026-0001", null]);
});

test("R19: a list whose case-authoring cannot answer states nulls for every draft and still answers (editions, control)", () => {
  const w = standard();
  draft(w);
  w.ca.editions = () => { throw new Error("no answer"); };
  assert.deepEqual(w.r.list({ project: P, viewer: V("ann") }).drafts[0].editions, { prepared: null, published: null, case: null });
});

test("R19 (C48): a draft prepared for a new case states that case id as editions.case, with no preparation it states case null (editions, case)", () => {
  const w = standard();
  const prepared = draft(w, { newCase: true }), never = draft(w);
  w.ca.editions = ({ draft: row }) => {
    const id = row && typeof row === "object" ? row.draft_id : row;
    return id === prepared.draftId ? { prepared: 1, published: null, case: "CASE-2026-0003" }
         : { prepared: null, published: null, case: null };
  };
  const by = Object.fromEntries(w.r.list({ project: P, viewer: V("ann") }).drafts.map((d) => [d.draft_id, d.editions]));
  assert.equal(by[prepared.draftId].case, "CASE-2026-0003", "the case the preparation belongs to");
  assert.equal(by[never.draftId].case, null, "control: a draft never prepared");
});

test("R43: sharedDraftsByProject answers, for each project asked, the count of the drafts the viewer may see that are shared under R8 and the newest grant's instant; a project the viewer may not see, or none, is {0, null}", () => {
  const w = standard();
  w.project("PROJ-2026-0003-r", { owners: ["ann"] });
  w.project("PROJ-2026-0004-s", { owners: ["ann"] });
  const R = "PROJ-2026-0003-r", S = "PROJ-2026-0004-s";
  const at = (i) => { w.clock.now = `2026-09-28T0${i}:00:00.000Z`; };
  const d1 = draft(w), d2 = draft(w), d3 = draft(w);                       // P: d1, d2 shared (d1 twice), d3 not
  at(1); grant(w, d1, 1); at(2); grant(w, d1, 2); at(3); grant(w, d2, 3);
  const e = draft(w, {}, "ann", S); at(4); grant(w, e, 4);                 // S: one; R: none
  const outside = draft(w, {}, "quinn", Q); at(5); grant(w, outside, 5, "quinn");
  const before = w.snapshot();
  const got = w.r.sharedDraftsByProject({ projectIds: [P, R, S, Q, "PROJ-2026-9999-none"], viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(got, {
    [P]: { count: 2, newest: "2026-09-28T03:00:00.000Z" },
    [R]: { count: 0, newest: null },
    [S]: { count: 1, newest: "2026-09-28T04:00:00.000Z" },
    [Q]: { count: 0, newest: null },
    "PROJ-2026-9999-none": { count: 0, newest: null },
  });
  assert.equal(d3.ok, true);
  /* control: an empty list answers {}; quinn sees his own project's share */
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: [], viewer: V("ann") }), {});
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: [Q], viewer: V("quinn") })[Q], { count: 1, newest: "2026-09-28T05:00:00.000Z" });
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: [P], viewer: V("out") })[P], { count: 0, newest: null }, "no standing");
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: [P], viewer: null })[P], { count: 0, newest: null }, "no viewer");
});

test("R43: a grant revoked, lapsed, or dead because its case edition is published is not counted; the newest is the newest live one", () => {
  const w = standard();
  w.publishedCase("CASE-2026-0001", P, 1);
  const at = (i) => { w.clock.now = `2026-09-28T0${i}:00:00.000Z`; };
  const named = draft(w, { caseId: "CASE-2026-0001" }), revoked = draft(w), lapsing = draft(w), live = draft(w);
  at(1); grant(w, named, 1); at(2); const gr = grant(w, revoked, 2); at(3); grant(w, lapsing, 3, "ann", "2026-09-28T05:00:00.000Z");
  at(4); grant(w, live, 4);
  const ask = () => w.r.sharedDraftsByProject({ projectIds: [P], viewer: V("ann") })[P];
  assert.deepEqual(ask(), { count: 4, newest: "2026-09-28T04:00:00.000Z" });
  w.r.act({ act: "revoke", author: "ann", grant: gr.grantId });
  w.publishedCase("CASE-2026-0001", P, 2);                                  // the named draft's edition is published
  assert.deepEqual(ask(), { count: 2, newest: "2026-09-28T04:00:00.000Z" }, "revoked and published are not counted");
  w.clock.now = "2026-09-28T06:00:00.000Z";                                  // past the lapsing grant's end
  assert.deepEqual(ask(), { count: 1, newest: "2026-09-28T04:00:00.000Z" }, "a lapsed one is not counted");
  w.st.sql.exec(`UPDATE review_grants SET revoked_at='2026-09-28T06:30:00.000Z' WHERE secret_sha=?`, SECRET(4));
  assert.deepEqual(ask(), { count: 0, newest: null }, "none live: zero and no newest");
});
