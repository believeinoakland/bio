/* observation-log: the reads over the log (R9, R10, R11, R12). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, entry } from "./fixture.mjs";
import { contentAxisFor } from "../../../src/observation-log/index.mjs";

test("R9 latest: the latest row per (level, subject kind, subject), newest first, at most `limit`, narrowed by subject kind", () => {
  const w = world();
  const at = (s) => `2026-09-27T03:00:${String(s).padStart(2, "0")}Z`;
  w.obs.observe(entry({ subject: "a", state: "LOOKED_ABSENT" }), at(1));                                     // 1
  w.obs.observe(entry({ subject: "b", state: "LOOKED_INDETERMINATE" }), at(2));                              // 2
  w.obs.observe(entry({ subject: "a", state: "PRESENT", result_kind: "capture", result_ref: "c" }), at(3));  // 3
  w.obs.observe(entry({ subject_kind: "unstated", subject: "a", state: "LOOKED_ABSENT" }), at(4));           // 4: another kind
  w.obs.observe(entry({ level: "internet", subject: "a", state: "LOOKED_ABSENT" }), at(5));                  // 5: another level
  w.obs.observe(entry({ subject_kind: "unstated", subject: null, state: "LOOKED_ABSENT" }), at(6));          // 6
  w.obs.observe(entry({ subject_kind: "unstated", subject: null, state: "partial" }), at(7));                // 7: a null subject is one subject
  assert.deepEqual(w.obs.latest("document").map((r) => [r.seq, r.subject_kind, r.subject, r.state]),
    [[7, "unstated", null, "partial"], [4, "unstated", "a", "LOOKED_ABSENT"], [3, "address", "a", "PRESENT"], [2, "address", "b", "LOOKED_INDETERMINATE"]]);
  assert.deepEqual(w.obs.latest("document", { limit: 2 }).map((r) => r.seq), [7, 4]);
  assert.deepEqual(w.obs.latest("document", { subjectKind: "address" }).map((r) => r.seq), [3, 2]);
  assert.deepEqual(w.obs.latest("internet").map((r) => r.seq), [5]);
  assert.deepEqual(w.obs.latest("meaning"), []);
  const r = w.obs.latest("document", { limit: 1, subjectKind: "address" })[0];
  assert.deepEqual(Object.keys(r).sort(), ["actor_class", "at", "authority", "authority_kind", "condition", "detail", "governed",
    "level", "result_kind", "result_ref", "seq", "state", "subject", "subject_kind"]);
});

test("R9 byAuthority: one authority's rows in seq order, at most `limit`; firstRowAt: the earliest `at` at a level, or null", () => {
  const w = world();
  w.obs.observe(entry({ authority_kind: "run", authority: "RUN-1", level: "meaning" }), "2026-09-27T03:00:09Z");
  w.obs.observe(entry({ authority_kind: "run", authority: "RUN-2" }), "2026-09-27T03:00:01Z");
  w.obs.observe(entry({ authority_kind: "run", authority: "RUN-1", state: "partial" }), "2026-09-27T03:00:05Z");
  w.obs.observe(entry({ authority_kind: "run", authority: "RUN-1", state: "LOOKED_INDETERMINATE" }), "2026-09-27T03:00:02Z");
  assert.deepEqual(w.obs.byAuthority("run", "RUN-1").map((r) => [r.seq, r.state]),
    [[1, "LOOKED_ABSENT"], [3, "partial"], [4, "LOOKED_INDETERMINATE"]]);
  assert.deepEqual(w.obs.byAuthority("run", "RUN-1", { limit: 2 }).map((r) => r.seq), [1, 3]);
  assert.deepEqual(w.obs.byAuthority("run", "RUN-9"), []);
  assert.equal(w.obs.firstRowAt("document"), "2026-09-27T03:00:01Z", "the earliest instant, not the first seq");
  assert.equal(w.obs.firstRowAt("meaning"), "2026-09-27T03:00:09Z");
  assert.equal(w.obs.firstRowAt("content"), null);
});

test("R10 verification: last_verified is the latest PRESENT row's `at`, unreachable_since the earliest LOOKED_INDETERMINATE after it; each null when there is none", () => {
  const w = world();
  const s = (at, state) => w.obs.observe(entry({ subject: "x", state, result_kind: state === "PRESENT" ? "capture" : null,
                                                 result_ref: state === "PRESENT" ? "c" : null }), at);
  assert.deepEqual(w.obs.verification("document", "address", "x"), { last_verified: null, unreachable_since: null });
  s("2026-09-01T00:00:00Z", "LOOKED_INDETERMINATE");
  assert.deepEqual(w.obs.verification("document", "address", "x"), { last_verified: null, unreachable_since: null });
  s("2026-09-02T00:00:00Z", "PRESENT");
  assert.deepEqual(w.obs.verification("document", "address", "x"), { last_verified: "2026-09-02T00:00:00Z", unreachable_since: null });
  s("2026-09-03T00:00:00Z", "LOOKED_INDETERMINATE");
  s("2026-09-04T00:00:00Z", "LOOKED_INDETERMINATE");
  assert.deepEqual(w.obs.verification("document", "address", "x"), { last_verified: "2026-09-02T00:00:00Z", unreachable_since: "2026-09-03T00:00:00Z" });
  s("2026-09-05T00:00:00Z", "PRESENT");
  assert.deepEqual(w.obs.verification("document", "address", "x"), { last_verified: "2026-09-05T00:00:00Z", unreachable_since: null });
  assert.deepEqual(w.obs.verification("content", "address", "x"), { last_verified: null, unreachable_since: null });
});

test("R11 missingCauseAt reads the level's first row: purged with no row at the level, the tie inside one second never_looked, the band, and pre_log on the artifact", () => {
  const w = world();
  assert.equal(w.obs.missingCauseAt("content", { registeredAt: "2026-09-27T03:00:00Z" }), "purged");
  w.obs.observe(entry({ level: "content", subject_kind: "capture" }), "2026-09-27T03:00:15Z");
  assert.equal(w.obs.missingCauseAt("content", { registeredAt: "2026-09-27T03:00:15.400Z" }), "never_looked");
  assert.equal(w.obs.missingCauseAt("content", { registeredAt: "2026-09-27T03:00:14.600Z" }), "watermark_band");
  assert.equal(w.obs.missingCauseAt("content", { registeredAt: "2026-09-27T03:00:10Z" }), "purged");
  assert.equal(w.obs.missingCauseAt("content", { registeredAt: null }), "purged");
  assert.equal(w.obs.missingCauseAt("content", { hasArtifact: true }), "pre_log");
  assert.equal(w.obs.missingCauseAt("meaning", { registeredAt: "2026-09-28T00:00:00Z" }), "purged", "levels are read apart");
});

test("R12 one capture's content axis from its latest extract and derive rows and R11's cause, the two axes never merged", () => {
  const w = world();
  const c = "cap-1";
  const axis = (registeredAt) => {
    const { extraction, index } = w.obs.contentRows(c);
    return contentAxisFor({ observed: extraction ? extraction.state : null, unitIndex: true,
      unitsComplete: index ? index.state === "PRESENT" : null, indexObserved: index ? index.state : null,
      indexReason: index ? (index.bound || index.detail) : null,
      missingCause: extraction ? null : w.obs.missingCauseAt("content", { registeredAt }) });
  };
  assert.deepEqual([axis("t").state, axis("t").missing_cause], ["undetermined", "purged"]);
  w.obs.observe(entry({ level: "content", subject_kind: "capture", subject: "other" }), "2026-09-27T03:00:00Z");
  assert.equal(axis("2026-09-27T04:00:00Z").state, "not_extracted");
  w.obs.observeIndexed("B", c, { written: 3, offered: 3, bytes: 9, over_bound: 0 }, { hadText: true });
  assert.equal(w.obs.contentRows(c).extraction, null, "an index row is never read as the extraction");
  assert.equal(axis("2026-09-27T04:00:00Z").state, "not_extracted");
  w.obs.observe(entry({ level: "content", subject_kind: "capture", subject: c, authority_kind: "extract", state: "PRESENT", result_kind: "reading", result_ref: c }));
  assert.equal(axis(null).state, "indexed_full");
  w.obs.observeIndexed("B", c, { written: 2, offered: 5, bytes: 9, over_bound: 3 }, { hadText: true });
  assert.equal(axis(null).state, "indexed_partial");
  const rows = w.obs.contentRows(c);
  assert.deepEqual([rows.extraction.authority_kind, rows.index.authority_kind, rows.index.state], ["extract", "derive", "partial"]);
});
