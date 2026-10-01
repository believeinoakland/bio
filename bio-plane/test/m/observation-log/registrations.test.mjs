/* observation-log: the writers it registers where legacy-store registered them (R30, R31), each driven through the
   module that raises it: provenance's testimony slot (its R52) and capture's `observation` event (its R26). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, storage, extractionNotice, sha } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf, TESTIMONY_PATH } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";

const DETAIL = "first extraction; a member's authored observation: its bytes ARE its text, as written, so the whole "
             + "document is text and no extraction step stands between them";

/** A promotion's step context carrying the testimony path (provenance R28's fields). */
const testimony = (bundleId, captureSha, author = "alice") => ({ bundleId, pkg: { [TESTIMONY_PATH]: {
  captureSha, author, observedAt: "2026-09-27T02:00:00Z", recordedAt: "2026-09-27T03:00:00Z", words: "the words" } } });

/** A host built in the order given, so a test can register observation-log before content. */
function host(order, { content = true } = {}) {
  const st = storage();
  const h = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const record = recordOf(h, { evidence: null, evidencePrefix: "bio/captures/" }); record.migrate();
  const membership = membershipOf(h, { record }); membership.migrate();
  const prov = provenanceOf(h, { record, membership, now: () => "2026-09-27T03:00:00Z" }); prov.migrate();
  const ex = extractionNotice();
  const now = () => Date.parse("2026-09-27T03:00:00Z");
  const make = {
    content: () => content && contentOf(h, { record, membership, provenance: prov, extraction: ex, now: () => "2026-09-27T03:00:00Z" }).migrate(),
    obs: () => observationLogOf(h, { record, membership, provenance: prov, extraction: ex, now }).migrate(),
  };
  for (const m of order) make[m]();
  st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
               VALUES ('INFO-2026-0001', 'information', 'g', 't', 'forming', 't', 't', 'sha')`);
  const cap = sha("the words");
  st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0001', 'x', 'utf8', 9, 't')`, cap);
  return { st, prov, cap, log: () => st.sql.exec(`SELECT * FROM observation_log ORDER BY seq`).toArray(),
           count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n };
}

test("R30 the testimony look: registered once at start in provenance's testimony slot and run after content's, whatever order the modules were made in; one content-level extract row — actor class member, actor the path's author, authority the bundle, subject the capture, PRESENT, no condition, the content row content's projection named as its referent, the first-extraction detail; it answers nothing into the promotion's answer", () => {
  for (const order of [["content", "obs"], ["obs", "content"]]) {
    const h = host(order);
    assert.equal(h.prov.testimonySlot().check(testimony("INFO-2026-0001", h.cap)), null, order.join(","));
    const answer = h.prov.testimonySlot().project(testimony("INFO-2026-0001", h.cap));
    const contentId = h.st.sql.exec(`SELECT content_id FROM content WHERE capture_sha = ?`, h.cap).one().content_id;
    assert.deepEqual(answer, { testimony: { content_id: contentId } }, "the promotion's answer is content's alone");
    const rows = h.log();
    assert.equal(rows.length, 1, order.join(","));
    const r = rows[0];
    assert.deepEqual(
      [r.actor_class, r.actor, r.authority_kind, r.authority, r.level, r.subject_kind, r.subject, r.state, r.governed,
       r.condition, r.bound, r.terminal, r.result_kind, r.result_ref, r.detail, r.at],
      ["member", "alice", "extract", "INFO-2026-0001", "content", "capture", h.cap, "PRESENT", 0,
       null, null, 0, "content", contentId, DETAIL, "2026-09-27T03:00:00Z"], order.join(","));
  }
  // a promotion without the testimony path runs nothing and writes nothing
  const h = host(["content", "obs"]);
  assert.equal(h.prov.testimonySlot().project({ bundleId: "INFO-2026-0001", pkg: {} }), null);
  assert.equal(h.count("observation_log"), 0);
  // registered once: a second registration under this module's name is refused by provenance
  assert.equal(h.prov.onTestimony("observation-log", { project: () => null }).ok, false);
});

test("R30 so op=contentaxis finds an extract row for the authored capture: its latest extract row is this look, never nobody looked", () => {
  const w = world();
  const [cap] = w.doc("INFO-2026-0001", ["the words"]);
  assert.equal(w.obs.contentRows(cap).extraction, null, "before the promotion, no extract row");
  w.prov.testimonySlot().project(testimony("INFO-2026-0001", cap, "bob"));
  const ex = w.obs.contentRows(cap).extraction;
  assert.deepEqual([ex.state, ex.authority_kind, ex.authority, ex.actor_class, ex.actor], ["PRESENT", "extract", "INFO-2026-0001", "member", "bob"]);
  assert.equal(w.obs.verification("content", "capture", cap).last_verified, "2026-09-27T03:00:00Z");
});

test("R30 a refused row throws, carrying its refusal, and writes nothing, so the promotion rolls back whole: with no content row named, the look's PRESENT has no referent (C-22.10)", () => {
  const h = host(["obs"], { content: false });
  let thrown = null;
  try {
    h.st.transactionSync(() => {
      h.st.sql.exec(`INSERT INTO leads (lead_id, author, words, at) VALUES ('LEAD-2026-0927-aaaaaaaaaaaa', 'alice', 'w', 't')`);
      return h.prov.testimonySlot().project(testimony("INFO-2026-0001", h.cap));
    });
  } catch (e) { thrown = e; }
  assert.ok(thrown, "the projection throws");
  assert.deepEqual([thrown.refusal.code, thrown.refusal.check], ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
  assert.match(thrown.message, /C-22\.10/);
  assert.equal(h.count("observation_log"), 0);
  assert.equal(h.count("leads"), 0, "the transaction it ran in rolled back whole");
});

test("R31 capture's observation rows: registered once at start on capture's observation event; each row a reuse verdict maps to is appended through observe at the verdict's instant; a refusal is what capture reports among its observation_refusals; a look not taken writes no row", () => {
  const w = world();
  const cap = captureOf(w.host, { record: w.record, provenance: w.prov });
  cap.migrate();
  assert.equal(w.obs.listenToCapture(cap), true);
  assert.equal(w.obs.listenToCapture(cap), true, "a second call registers nothing more");
  assert.equal(cap.on("observation", "observation-log", () => null).ok, false, "held once under this module's name");
  const [b1, b2] = ["b".repeat(64), "c".repeat(64)];
  const r = cap.recordReuseVerdicts({ bundleId: "INFO-2026-0001", at: "2026-09-27T04:05:06Z", verdicts: [
    { source_capture: "a".repeat(64), address_norm: "https://example.org/x", verdict: "confirmed", reused_sha: b1 },
    { source_capture: "a".repeat(64), address_norm: "https://example.org/v", verdict: "changed", reused_sha: b1, observed_sha: b2 },
    { source_capture: "a".repeat(64), address_norm: "https://example.org/y", verdict: "unreachable", reused_sha: b1 },
    { source_capture: "a".repeat(64), address_norm: "https://example.org/z", verdict: "not_attempted", reused_sha: b1 },
    { source_capture: "a".repeat(64), address_norm: "https://example.org/w", verdict: "confirmed", reused_sha: "" },
  ] });
  assert.deepEqual([r.ok, r.recorded], [true, 5]);
  assert.deepEqual(w.log().map((o) => [o.actor_class, o.authority_kind, o.authority, o.level, o.subject_kind, o.subject,
                                      o.state, o.result_kind, o.result_ref, o.detail, o.at]), [
    ["plane", "ratify", "INFO-2026-0001", "document", "address", "https://example.org/x", "PRESENT", "capture", b1, "unchanged", "2026-09-27T04:05:06Z"],
    ["plane", "ratify", "INFO-2026-0001", "document", "address", "https://example.org/v", "PRESENT", "capture", b2, "changed", "2026-09-27T04:05:06Z"],
    ["plane", "ratify", "INFO-2026-0001", "document", "address", "https://example.org/y", "LOOKED_INDETERMINATE", null, null, "unreachable", "2026-09-27T04:05:06Z"],
  ]);
  // the confirmed verdict with no reused capture is a PRESENT naming nothing: observe refuses it, and capture reports it
  assert.equal(r.observation_refusals.length, 1);
  assert.deepEqual([r.observation_refusals[0].code, r.observation_refusals[0].check], ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
});

test("R31 the factory registers on capture's observation event when it is handed capture at start", () => {
  const st = storage();
  const h = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const record = recordOf(h, { evidence: null, evidencePrefix: "bio/captures/" }); record.migrate();
  const membership = membershipOf(h, { record }); membership.migrate();
  const prov = provenanceOf(h, { record, membership }); prov.migrate();
  const cap = captureOf(h, { record, provenance: prov }); cap.migrate();
  const obs = observationLogOf(h, { record, membership, provenance: prov, extraction: null, capture: cap });
  obs.migrate();
  assert.equal(obs.listenToCapture(cap), true, "already listening");
  cap.recordReuseVerdicts({ bundleId: "INFO-2026-0001", at: "2026-09-27T04:05:06Z", verdicts: [
    { source_capture: "a".repeat(64), address_norm: "https://example.org/y", verdict: "unreachable", reused_sha: "b".repeat(64) }] });
  assert.equal(st.sql.exec(`SELECT COUNT(*) AS n FROM observation_log`).one().n, 1);
});
