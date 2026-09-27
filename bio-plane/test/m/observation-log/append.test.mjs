/* observation-log: the one append site and the log's invariants (R2, R3, R4, R22, R23, R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, entry } from "./fixture.mjs";
import { OBSERVATION_AUTHORITY_KINDS, OBSERVATION_STATES, CONDITION_KINDS, OBSERVATION_REFERENT_FAULTS } from "../../../src/observation-log/index.mjs";

const refused = (r) => (r ? [r.code, r.check] : null);

test("R2 each refusal by its check, in order, writing nothing: C-22.6, C-22.9, C-22.1, C-22.2, C-22.3, C-22.10 (with its four faults), C-22.4", () => {
  const w = world();
  // one entry wrong in every way answers the first in the order
  const all = entry({ bundle: "INFO-2026-0001", authority_kind: "member", state: "MAYBE", governed: true,
                      condition: "no-such-condition", result_ref: null });
  assert.deepEqual(refused(w.obs.observe(all)), ["AI_LOG_NOT_A_BUNDLE", "C-22.6"]);
  assert.deepEqual(refused(w.obs.observe({ ...all, bundle: null })), ["OBS_AUTHORITY_UNNAMED", "C-22.9"]);
  assert.deepEqual(refused(w.obs.observe(entry({ authority_kind: null }))), ["OBS_AUTHORITY_UNNAMED", "C-22.9"]);
  assert.deepEqual(refused(w.obs.observe({ ...all, bundle: null, authority_kind: "acquire" })), ["AI_LOG_STATE_UNKNOWN", "C-22.1"]);
  for (const s of ["LOOKED_ABSENT", "PRESENT"])
    assert.deepEqual(refused(w.obs.observe(entry({ governed: true, state: s, result_kind: "capture", result_ref: "x" }))),
      ["AI_LOG_GOVERNED_ABSENCE", "C-22.2"], s);
  assert.deepEqual(refused(w.obs.observe(entry({ state: "PRESENT", condition: "client-rendered-shell", result_kind: "capture", result_ref: "x" }))),
    ["AI_LOG_SHELL_PRESENT", "C-22.3"]);
  assert.deepEqual(refused(w.obs.observe(entry({ state: "PRESENT" }))), ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
  assert.deepEqual(refused(w.obs.observe(entry({ state: "LOOKED_INDETERMINATE", condition: "no-such-condition" }))),
    ["AI_RUN_CONDITION_UNKNOWN", "C-22.4"]);
  assert.equal(w.count("observation_log"), 0, "a refused entry writes nothing");
  // every refusal carries its translation
  const r = w.obs.observe(entry({ state: "PRESENT" }));
  assert.ok(typeof r.translation === "string" && r.translation.length > 20 && r.ok === false);
  // negative controls: the governed, shell and condition arms admit what they must
  assert.equal(w.obs.observe(entry({ governed: true, state: "LOOKED_INDETERMINATE" })), null);
  assert.equal(w.obs.observe(entry({ state: "LOOKED_INDETERMINATE", condition: "client-rendered-shell" })), null);
  for (const c of Object.keys(CONDITION_KINDS)) assert.equal(w.obs.observe(entry({ state: "LOOKED_INDETERMINATE", condition: c })), null, c);
  for (const k of Object.keys(OBSERVATION_AUTHORITY_KINDS)) assert.equal(w.obs.observe(entry({ authority_kind: k })), null, k);
});

test("R2 C-22.10's observation referent: an earlier PRESENT row of the same authority backs it; not_earlier, unresolved, other_authority and not_present are named", () => {
  const w = world();
  const run = (o) => entry({ authority_kind: "run", authority: "RUN-1", level: "document", subject_kind: "unstated", ...o });
  assert.equal(w.obs.observe(run({ state: "PRESENT", result_kind: "capture", result_ref: "c" })), null);            // seq 1
  assert.equal(w.obs.observe(run({ state: "LOOKED_ABSENT" })), null);                                              // seq 2
  assert.equal(w.obs.observe(entry({ authority_kind: "run", authority: "RUN-2", state: "PRESENT", result_kind: "capture", result_ref: "d" })), null); // seq 3
  const fault = (ref) => { const r = w.obs.observe(run({ state: "PRESENT", result_kind: "observation", result_ref: ref })); return r && r.referent_fault; };
  assert.equal(fault("99"), "not_earlier");
  assert.equal(fault("4"), "not_earlier", "the seq this row would take is not earlier");
  assert.equal(fault("x"), "unresolved");
  assert.equal(fault("3"), "other_authority");
  assert.equal(fault("2"), "not_present");
  assert.deepEqual(Object.keys(OBSERVATION_REFERENT_FAULTS).sort(), ["not_earlier", "not_present", "other_authority", "unresolved"]);
  assert.equal(w.count("observation_log"), 3);
  assert.equal(w.obs.observe(run({ state: "PRESENT", result_kind: "observation", result_ref: "1" })), null, "a rollup on its own earlier PRESENT row");
  // every fault refuses under the one code
  const r = w.obs.observe(run({ state: "PRESENT", result_kind: "observation", result_ref: "2" }));
  assert.deepEqual(refused(r), ["OBS_PRESENT_NO_REFERENT", "C-22.10"]);
});

test("R3 NEVER_LOOKED is refused at the append (C-22.1) and never stored, but for a run's terminal rollup (K148); every state a look can store is accepted", () => {
  const w = world();
  const r = w.obs.observe(entry({ state: "NEVER_LOOKED" }));
  assert.deepEqual(refused(r), ["AI_LOG_STATE_UNKNOWN", "C-22.1"]);
  assert.match(r.detail, /never stored/);
  assert.equal(w.count("observation_log"), 0);
  for (const s of Object.keys(OBSERVATION_STATES).filter((s) => s !== "NEVER_LOOKED"))
    assert.equal(w.obs.observe(entry({ state: s, result_kind: s === "PRESENT" ? "capture" : null, result_ref: s === "PRESENT" ? "c" : null })), null, s);
  assert.equal(w.row(`SELECT COUNT(*) n FROM observation_log WHERE state = 'NEVER_LOOKED'`).n, 0);
  // a run's own ticks are refused too; the one exception (K148) is a run's terminal rollup (ai-runs R14)
  const run = entry({ authority_kind: "run", authority: "RUN-1", subject_kind: "unstated", state: "NEVER_LOOKED" });
  assert.equal(w.obs.observe(run).check, "C-22.1");
  assert.equal(w.obs.observe({ ...run, authority_kind: "sweep" }, null, 1).check, "C-22.1", "only a run's terminal entry");
  assert.equal(w.obs.observe(run, null, 1), null);
  assert.deepEqual(w.log().at(-1) && [w.log().at(-1).state, w.log().at(-1).terminal], ["NEVER_LOOKED", 1]);
});

test("R4 an accepted entry is one row with a store-wide seq that only increases, `at` the writer's instant else now to the second; it answers null", () => {
  const w = world({ now: "2026-09-27T03:00:15.678Z" });
  assert.equal(w.obs.observe(entry({ level: "internet" })), null);
  assert.equal(w.obs.observe(entry({ level: "meaning", subject_kind: "entity", subject: "ENT-1" }), "2026-01-02T03:04:05Z"), null);
  w.obs.observe(entry({ state: "NEVER_LOOKED" }));            // refused: spends no seq
  assert.equal(w.obs.observe(entry({ level: "content", subject_kind: "capture" })), null);
  const rows = w.log();
  assert.deepEqual(rows.map((r) => r.seq), [1, 2, 3]);
  assert.deepEqual(rows.map((r) => r.at), ["2026-09-27T03:00:15Z", "2026-01-02T03:04:05Z", "2026-09-27T03:00:15Z"]);
  const r = rows[0];
  assert.deepEqual([r.actor_class, r.authority_kind, r.authority, r.level, r.subject_kind, r.subject, r.state, r.governed, r.terminal],
    ["plane", "acquire", "INFO-2026-0001", "internet", "address", "https://example.org/a", "LOOKED_ABSENT", 0, 0]);
  // the table's shape and the legacy callers' camelCase spelling write the same row; `terminal` is the third argument
  assert.equal(w.obs.observe({ actorClass: "machine", actor: "class:ai", authorityKind: "run", authority: "RUN-9", level: "document",
    subjectKind: "unstated", subject: "s", state: "PRESENT", resultKind: "capture", resultRef: "c", governed: false }, null, 1), null);
  const last = w.log().at(-1);
  assert.deepEqual([last.seq, last.actor_class, last.actor, last.result_kind, last.result_ref, last.terminal], [4, "machine", "class:ai", "capture", "c", 1]);
});

test("R22 the log is append-only: no service updates or deletes a row; a whole-store purge alone clears it", () => {
  const w = world();
  w.obs.observe(entry());
  w.obs.observe(entry({ state: "LOOKED_INDETERMINATE" }));
  const before = JSON.stringify(w.log());
  // every read and act of the module leaves existing rows as they were
  w.obs.latest("document"); w.obs.byAuthority("acquire", "INFO-2026-0001"); w.obs.verification("document", "address", "x");
  w.obs.observe(entry({ state: "NEVER_LOOKED" }));
  const l = w.obs.lead({ words: "w", author: "alice" });
  w.obs.leadLook({ lead: l.lead_id, state: "LOOKED_ABSENT", looker: "alice", viewer: "member:alice" });
  assert.equal(JSON.stringify(w.log().slice(0, 2)), before);
  w.record.purge({ bundleId: "INFO-2026-0001" });
  assert.equal(w.count("observation_log"), 3, "a per-bundle purge leaves the log");
  w.record.purge({});
  assert.equal(w.count("observation_log"), 0, "the whole-store purge clears it");
});

test("R23 nothing is written into a bundle (C-22.6); observation_log and leads carry no bundle_id and clear only with the whole store; lead_shares carries bundle_id and is declared to purge", () => {
  const w = world();
  assert.equal(w.obs.observe(entry({ bundle: "INFO-2026-0001" })).check, "C-22.6");
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
  assert.ok(!cols("observation_log").includes("bundle_id"));
  assert.ok(!cols("leads").includes("bundle_id"));
  assert.ok(cols("lead_shares").includes("bundle_id"));
  w.project("PROJ-A"); w.participant("PROJ-A", "alice");
  const l = w.obs.lead({ words: "w", author: "alice" });
  assert.equal(w.obs.leadShare({ lead: l.lead_id, project: "PROJ-A", sharer: "alice", viewer: "member:alice" }).ok, true);
  w.obs.observe(entry());
  const one = w.record.purge({ bundleId: "PROJ-A" });
  assert.deepEqual([one.removed.lead_shares, one.removed.observation_log, one.removed.leads], [1, 0, 0],
    "the declaration names all three, and a per-bundle purge touches only the keyed one");
  assert.equal(w.count("lead_shares"), 0, "a per-bundle purge of the project clears its shares");
  assert.equal(w.count("leads"), 1);
  assert.equal(w.count("observation_log"), 1);
  w.record.purge({});
  assert.deepEqual([w.count("leads"), w.count("observation_log")], [0, 0]);
});

test("R24 a look is recorded only under an authority the record can name: `member` and an absent authority are refused, so a member's own searching writes nothing", () => {
  const w = world();
  for (const k of [null, "", "member", "search", "browse"])
    assert.equal(w.obs.observe(entry({ authority_kind: k, actor_class: "member", actor: "alice" })).check, "C-22.9", String(k));
  assert.equal(w.count("observation_log"), 0);
  // reads write nothing
  w.obs.latest("internet"); w.obs.leadList({ viewer: "member:alice" });
  assert.equal(w.count("observation_log"), 0);
});
