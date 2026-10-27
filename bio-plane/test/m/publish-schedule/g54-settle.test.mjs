/* publish-schedule — T51 fix round 6, G54 (3)(a): the settled row states each edition's case-file outcome AT SETTLE
   (R2; K4565, K4571; `build/plan/diagnosis-R6-g54-cause.md`). `ratification`'s publisher (merge 116) answers
   `{published, published_at, after: {containers: [{case, edition, built, code?}]}}`; the seam is written against that
   contract here, with a stand-in publisher that commits through `publication` R22, the real module, as
   `ratification`'s does. Driven at the module's interface, as `t34.test.mjs` is. Whether the real scheduler's tick passes
   the `taken` entry on unchanged is `plane`'s to prove: `scheduler` is a later module, which this module's tests may not
   import. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG, KEY } from "./fixture.mjs";
import { migratePublishSchedule } from "../../../src/publish-schedule/schema.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001", CASE2 = "CASE-2026-0002";
const AT = { date: "2026-10-01", time: "09:00" };
const DUE = "2026-10-01T12:00:00Z";

function base({ cases = [CASE] } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const roles = [{ target: F, version_sha: w.head(F) }];
  for (const c of cases) w.prepare(c, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  return { w, proj, roles };
}
const docOf = (w, c) => w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=?`, c, 1);
const sched = (w, c = CASE) => w.record.transact(() => w.ps.scheduleEdition({
  case: c, edition: 1, docSha: docOf(w, c).doc_sha, signature: SIG(1), signer: "olive", deliveredBy: V("olive"),
  at: AT, checked: { sources: [], ties: [], holds: [] }, by: V("olive") }));
const stored = (w, c = CASE) => w.row(`SELECT state, case_file FROM scheduled_editions WHERE case_id=?`, c);

/* ratification's publisher, played: commits through `publication` R22, then answers as told (`after` is what the test
   gives; `throwAfter` makes it throw once the edition is committed). */
function publisher(w, proj, roles, { after = undefined, throwAfter = false } = {}) {
  return { publishScheduled(entry, now) {
    const r = w.record.transact(() => w.p.commitCaseEdition({ case: entry.case, edition: entry.edition, project: proj,
      scope: "The question.", roster: roles.map((x) => ({ bundle_id: x.target, version_sha: x.version_sha, role: "load_bearing" })),
      sigArmored: entry.signature, attestorKey: KEY, attestorMember: entry.signer, gateVersion: "plane-gate/test",
      deliveredBy: entry.delivered_by, at: now }));
    if (!r.ok) return { stopped: [{ code: r.reason, translation: "no" }] };
    if (throwAfter) throw new Error("the case file's assembly threw");
    return { published: true, published_at: now, ...(after === undefined ? {} : { after }) };
  } };
}

test("R2 G54 a publisher's after.containers is stored at settle and returned in the taken entry and R4's entry: a failed edition's outcome is stated, and the row still settles published because it is signed", async () => {
  const { w, proj, roles } = base();
  sched(w);
  const containers = [{ case: CASE, edition: 1, built: false, code: "STORE_SILENT" }];
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { after: { containers, container: { ok: false } } }));
  const out = await w.ps.publishDue(DUE);
  assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "published", published_at: DUE, case_file_at_settle: containers }]);
  assert.equal(stored(w).state, "published");
  assert.deepEqual(JSON.parse(stored(w).case_file), containers, "stored at settle");
  assert.deepEqual(w.ps.scheduledEditions({ case: CASE }).editions[0].case_file_at_settle, containers, "R4 answers the row");
  /* the list may hold several editions' results, a built one with no code */
  const b = base({ cases: [CASE, CASE2] });
  sched(b.w, CASE); sched(b.w, CASE2);
  const two = [{ case: CASE, edition: 1, built: true }, { case: CASE2, edition: 1, built: false, code: "MATERIAL_MISSING" }];
  b.w.ps.registerScheduledPublisher("ratification", publisher(b.w, b.proj, b.roles, { after: { containers: two } }));
  const both = await b.w.ps.publishDue(DUE);
  const failedFirst = [two[1], two[0]];
  assert.deepEqual(both.taken.map((t) => t.case_file_at_settle), [failedFirst, failedFirst], "each row keeps the list, a failed edition before a built one");
});

test("R2 G54 an absent after, an after without a list, or a list of nothing valid is stored unknown, never null; an empty list is stored as an empty list", async () => {
  for (const after of [undefined, null, {}, { container: { ok: true } }, { containers: "built" }, { containers: [null, 3, "x", { built: true }] }]) {
    const { w, proj, roles } = base();
    sched(w);
    w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { after }));
    const out = await w.ps.publishDue(DUE);
    assert.equal(out.taken[0].state, "published");
    assert.equal(out.taken[0].case_file_at_settle, "unknown", String(JSON.stringify(after)));
    assert.equal(JSON.parse(stored(w).case_file), "unknown", "the column holds a value, never null");
  }
  const { w, proj, roles } = base();
  sched(w);
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { after: { containers: [] } }));
  assert.deepEqual((await w.ps.publishDue(DUE)).taken[0].case_file_at_settle, [], "none to assemble is stated as none");
});

test("R2 G54 a publisher that throws after its commit settles published with the case file unknown, never null; one that stops stores no case file", async () => {
  const { w, proj, roles } = base();
  sched(w);
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { throwAfter: true }));
  const out = await w.ps.publishDue(DUE);
  assert.deepEqual(out.taken, [{ case: CASE, edition: 1, state: "published", published_at: DUE, case_file_at_settle: "unknown" }]);
  assert.equal(JSON.parse(stored(w).case_file), "unknown");
  /* controls: a stopped edition committed nothing and has no case file to state */
  for (const pub of [null, { publishScheduled: () => ({ stopped: [{ code: "X", translation: "x" }] }) }]) {
    const s = base();
    sched(s.w);
    if (pub) s.w.ps.registerScheduledPublisher("ratification", pub);
    const t = (await s.w.ps.publishDue(DUE)).taken[0];
    assert.equal(t.state, "stopped");
    assert.equal("case_file_at_settle" in t, false);
    assert.equal(stored(s.w).case_file, null);
    assert.equal("case_file_at_settle" in s.w.ps.scheduledEditions({}).editions[0], false);
  }
});

test("R2 G54 the stored entries are bounded to {case, edition, built, code?}: other keys, a long code and a long list are cut, so a publisher's detail or text never reaches the row", async () => {
  const { w, proj, roles } = base();
  sched(w);
  const many = Array.from({ length: 80 }, (_, i) => ({ case: `CASE-2026-${String(i + 1).padStart(4, "0")}`, edition: 1, built: true }));
  const after = { containers: [{ case: CASE, edition: 1, built: false, code: "X".repeat(500), step: "bucket_put", error: "secret text",
                                 detail: "more" }, ...many] };
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { after }));
  const list = (await w.ps.publishDue(DUE)).taken[0].case_file_at_settle;
  assert.deepEqual(Object.keys(list[0]).sort(), ["built", "case", "code", "edition"]);
  assert.equal(list[0].code.length <= 64, true);
  assert.equal(list.length <= 50, true);
  assert.equal(stored(w).case_file.includes("secret text"), false);
});

test("R2 G54 a row settled before the column reads not_recorded, in the entry and in R4, and is never back-filled; the column is added once and a second boot adds nothing; the stored value is the state at settle and later reads or takes leave it as it was", async () => {
  const { w, proj, roles } = base();
  sched(w);
  const containers = [{ case: CASE, edition: 1, built: false, code: "BUCKET_FAILED" }];
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles, { after: { containers } }));
  await w.ps.publishDue(DUE);
  /* the store as an older plane left it: no column, the row published */
  w.st.sql.exec(`ALTER TABLE scheduled_editions DROP COLUMN case_file`);
  const cols = () => [...w.st.sql.exec(`PRAGMA table_info(scheduled_editions)`)].map((r) => r.name).filter((n) => n === "case_file");
  assert.deepEqual(cols(), []);
  migratePublishSchedule(w.st.sql);
  assert.deepEqual(cols(), ["case_file"], "added once");
  migratePublishSchedule(w.st.sql);
  assert.deepEqual(cols(), ["case_file"], "a second boot adds nothing");
  assert.equal(stored(w).case_file, null, "never back-filled");
  assert.equal(w.ps.scheduledEditions({ case: CASE }).editions[0].case_file_at_settle, "not_recorded");
  /* a settled value is not rewritten by a later take or read */
  w.st.sql.exec(`UPDATE scheduled_editions SET case_file=? WHERE case_id=?`, JSON.stringify(containers), CASE);
  assert.deepEqual((await w.ps.publishDue("2026-10-09T00:00:00Z")).taken, []);
  assert.deepEqual(w.ps.scheduledEditions({ case: CASE }).editions[0].case_file_at_settle, containers);
  assert.deepEqual(JSON.parse(stored(w).case_file), containers);
});

test("R2 G54 a waiting, cancelled or stopped entry carries no case file, and a published row with no list states unknown (controls)", async () => {
  const { w, proj, roles } = base({ cases: [CASE, CASE2] });
  sched(w, CASE); sched(w, CASE2);
  const waiting = w.ps.scheduledEditions({}).editions;
  assert.deepEqual(waiting.map((e) => "case_file_at_settle" in e), [false, false]);
  assert.equal(w.op("publishatcancel", { by: V("olive") }, { case: CASE2, edition: 1 }).state, "cancelled");
  assert.equal("case_file_at_settle" in w.ps.scheduledEditions({ case: CASE2 }).editions[0], false);
  w.ps.registerScheduledPublisher("ratification", publisher(w, proj, roles));
  const out = await w.ps.publishDue(DUE);
  assert.deepEqual(out.taken.map((t) => t.case_file_at_settle), ["unknown"]);
});
