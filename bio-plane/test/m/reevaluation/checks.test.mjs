/* reevaluation's invariants: C-10.1 registered with promotion as a check and with record-core's audit (R22), the checks
   that moved here with their numbers (R23), and no place named in its behaviour or outward text (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, infoMd, V, MACHINE, U } from "./fixture.mjs";
import { checkReevalPending, REEVAL_SOURCES, REEVAL_POLICY_AGE_DAYS, VERSION_NOTICE_SUBJECT_CHECKS,
         REEVALUATION_ACT_CHECKS } from "../../../src/reevaluation/index.mjs";
import { checkBundle, VERSION_NOTICE_CHECKS } from "../../../checks/bio-checks.mjs";

const NOW = Date.parse("2026-09-28T00:00:00Z");
const arm = (rp) => checkReevalPending(rp === undefined ? {} : { reeval_pending: rp }, { nowMs: NOW })
  .map((f) => [f.check, f.severity]);

test("R22: C-10.1's arms: a record or a legacy boolean; each other shape an error; a stale flag reported; the four sources", () => {
  assert.deepEqual(REEVAL_SOURCES, ["deletion", "source_status", "wp_retraction", "annotation"]);
  assert.equal(REEVAL_POLICY_AGE_DAYS, 30);
  assert.deepEqual(arm(undefined), [], "absence is C-2's");
  assert.deepEqual(arm(false), []);
  assert.deepEqual(arm(true), [["C-10.1", "warn"]], "a legacy true warns");
  for (const bad of ["yes", 3, null, ["x"]]) assert.deepEqual(arm(bad), [["C-10.1", "error"]], `any other type errors: ${JSON.stringify(bad)}`);
  assert.deepEqual(arm({ flag: "true", since: null, source: null }), [["C-10.1", "error"]], "a non-boolean flag errors");
  assert.deepEqual(arm({ flag: false, since: null, source: null }), []);
  assert.deepEqual(arm({ flag: false, since: "2026-09-01T00:00:00Z", source: null }), [["C-10.1", "warn"]]);
  assert.deepEqual(arm({ flag: false, since: null, source: "deletion" }), [["C-10.1", "warn"]]);
  assert.deepEqual(arm({ flag: true, since: "2026-09-27T00:00:00Z", source: "deletion" }), [], "a fresh, well-formed flag");
  assert.deepEqual(arm({ flag: true, since: "yesterday", source: "deletion" }), [["C-10.1", "error"]], "since not ISO-8601 UTC");
  assert.deepEqual(arm({ flag: true, since: "2026-08-01T00:00:00Z", source: "annotation" }), [["C-10.1", "info"]], "older than the policy age");
  assert.deepEqual(checkReevalPending({ reeval_pending: { flag: true, since: "2026-09-20T00:00:00Z", source: "annotation" } },
    { nowMs: NOW, maxReevalAgeDays: 5 }).map((f) => f.severity), ["info"], "the policy age may be set");
  assert.deepEqual(arm({ flag: true, since: "2026-09-27T00:00:00Z", source: "gossip" }), [["C-10.1", "error"]], "an unknown source");
  for (const s of REEVAL_SOURCES) assert.deepEqual(arm({ flag: true, since: "2026-09-27T00:00:00Z", source: s }), []);
});

test("R22: registered with promotion, C-10.1's errors refuse a promotion that is not a replay; with record-core's audit, every arm is counted", async () => {
  const w = world();
  const doc = (id, extra) => w.promotion.promote({ bundleId: id, base: null, snapKey: `s-${id}`, author: "member:alice",
    files: [{ path: "bundle.md", text: infoMd(id, extra) }], meta: { object_type: "information" } });
  const bad = doc("INFO-2026-0001-bad", ["reeval_pending: nope"]);
  assert.deepEqual([bad.ok, bad.reason, bad.findings[0].check], [false, "REEVAL_PENDING_REFUSED", "C-10.1"]);
  assert.equal(w.record.head("INFO-2026-0001-bad"), null, "nothing written");
  assert.equal(doc("INFO-2026-0002-warn", ["reeval_pending: true"]).ok, true, "a warning does not refuse");
  const good = doc("INFO-2026-0003-ok", ["reeval_pending:", "  flag: true", '  since: "2026-09-27T00:00:00Z"', "  source: deletion"]);
  assert.equal(good.ok, true, JSON.stringify(good).slice(0, 300));
  const replay = w.promotion.promote({ bundleId: "INFO-2026-0004-old", base: null, snapKey: "s-old", author: "member:alice",
    replay: true, files: [{ path: "bundle.md", text: infoMd("INFO-2026-0004-old", ["reeval_pending: nope"]) }],
    meta: { object_type: "information" } });
  assert.equal(replay.ok, true, "a replay holds the record's history verbatim");
  const audit = await w.record.auditPass({ limit: 50 });
  assert.equal(audit.tally["C-10.1"], 1, "the audit counts the replayed bundle's error");
  assert.ok(audit.offenders.some((o) => o.bundleId === "INFO-2026-0004-old"));
});

test("R23: C-10.1, C-80.1 and C-80.2 moved here with their numbers and translations; the catalogue no longer holds them", async () => {
  assert.deepEqual(Object.entries(VERSION_NOTICE_SUBJECT_CHECKS).map(([k, v]) => [k, v.check]),
    [["VERSION_NOTICE_NO_SUBJECT", "C-80.1"], ["VERSION_NOTICE_NO_INQUIRY", "C-80.2"]]);
  assert.deepEqual(Object.values(VERSION_NOTICE_CHECKS).map((v) => v.check), ["C-80.3"], "C-80.3 is content's");
  for (const row of [...Object.values(VERSION_NOTICE_SUBJECT_CHECKS), ...Object.values(REEVALUATION_ACT_CHECKS)]) {
    assert.match(row.where, /^src\/reevaluation\/index\.mjs #?\w+ > is-[a-z-]+$/);
    assert.ok(row.translation.length > 60);
  }
  assert.deepEqual(Object.values(REEVALUATION_ACT_CHECKS).map((v) => v.check),
    ["C-110.1", "C-110.2", "C-110.3", "C-110.4", "C-110.5", "C-110.6", "C-110.7", "C-110.8", "C-110.9"]);
  /* the catalogue's own frontmatter check no longer runs C-10.1: its one home is this module */
  const md = infoMd("INFO-2026-0001-x", ["reeval_pending: nope", "group: g", "schema: information@1"]);
  const { findings } = await checkBundle({ folderName: "INFO-2026-0001-x", files: new Map([["bundle.md", md]]),
    sha256: async () => "0".repeat(64) });
  assert.deepEqual(findings.filter((f) => f.check === "C-10.1"), []);
});

test("R24: no place is named in this module's behaviour or outward text", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc("INFO-2026-0001-old", [a]); w.doc("INFO-2026-0002-new", [b]);
  w.read(a.sha, [U(0, "x"), U(1, "y")]); w.read(b.sha, [U(0, "x"), U(1, "z")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage("INFO-2026-0001-old", a.sha);
  w.inquiry("INQ-2026-0001-t", {});
  w.inquiry("INQ-2026-0002-q", { legs: [{ target: "INFO-2026-0001-old", content_id: cid }, { target: "INQ-2026-0001-t" }] });
  w.promote("INQ-2026-0001-t", inquiryMd("INQ-2026-0001-t", { state: "deferred", disposition: '"x"' }));
  const said = JSON.stringify([
    VERSION_NOTICE_SUBJECT_CHECKS, REEVALUATION_ACT_CHECKS,
    w.r.reevaluations({ viewer: "class:admin" }), w.r.versionNotice({ target: "INQ-2026-0002-q", viewer: "class:admin" }),
    w.r.versionNotice({}), w.r.changedFromAudit({}), w.r.raiseNotices({}), w.r.notices({ viewer: "class:admin" }),
    w.r.changesOf({ findings: ["INQ-2026-0001-t"], contents: [cid], viewer: "class:admin" }),
    w.r.keepVersion({ notice: "x", author: MACHINE }), w.r.recordReevaluation({ author: V("a"), note: "n" }),
  ]);
  assert.doesNotMatch(said, /oakland|alameda|california|berkeley/i);
});
