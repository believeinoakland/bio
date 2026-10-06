/* Decisions: disposeProposal (R20–R22), and purge (R29). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { PROGRESSION_CHECKS, GENERIC_CODES, DISPOSITIONS, PROGRESSIONS_TABLES, notADisposition } from "../../../src/progressions/index.mjs";
import * as PROGRESSIONS_CHECKS_MODULE from "../../../src/progressions/checks.mjs";
import { DISPOSITIONS as PROMOTION_DISPOSITIONS, REOPENABLE_FROM } from "../../../src/promotion/index.mjs";

const X = (w, b = {}) => w.p.disposeProposal({ key: "proc::award", to: "deferred", reason: "later", definitionVersion: 1,
                                               decidedBy: "member:alice", ...b });

test("R21: refusals in order, each writing nothing", () => {
  const w = seeded();
  w.define();
  const before = w.snapshot();
  const order = [
    [{ key: "", progressionKey: "" }, "NO_KEY"], [{ key: "proc::" }, "NO_STAGE"], [{ to: "adopted" }, "NOT_A_DISPOSITION"],
    [{ reason: "  " }, "NO_REASON"], [{ reason: 'say "no"' }, "BAD_REASON"], [{ decidedBy: " " }, "NO_DECIDER"],
    [{ key: "nope::award" }, "NO_SUCH_PROGRESSION"], [{ key: "proc::bid" }, "BAD_STAGE"],
    [{ definitionVersion: null }, "NO_DEFINITION_VERSION"], [{ definitionVersion: 2 }, "DEFINITION_MOVED"],
  ];
  for (let i = 0; i < order.length; i++) {
    const faults = Object.assign({}, ...order.slice(i).map(([f]) => f).reverse());   // the earliest fault of a field wins
    const r = X(w, faults);
    assert.equal(r.reason, order[i][1], `step ${i}`);
    const row = GENERIC_CODES.includes(r.reason) ? {} : PROGRESSION_CHECKS[r.reason];   // R27: a generic code has no row (N118)
    assert.equal(r.check, row.check);
    assert.equal(r.translation, row.translation);
  }
  // BAD_REASON: over 160 characters, a quote, a backslash, a line break; 160 plain characters pass
  for (const bad of ["x".repeat(161), 'a"b', "a\\b", "a\nb", "a\rb"]) assert.equal(X(w, { reason: bad }).reason, "BAD_REASON");
  // NO_DEFINITION_VERSION: absent, not a positive integer, a boolean
  for (const v of [undefined, null, "", "x", 0, -1, 1.5, true, false, [1], { v: 1 }])
    assert.equal(X(w, { definitionVersion: v }).reason, "NO_DEFINITION_VERSION", JSON.stringify(v));
  // DEFINITION_MOVED: not the current version, earlier or never held
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  const moved = X(w, { definitionVersion: 1 });
  assert.equal(moved.reason, "DEFINITION_MOVED");
  assert.equal(moved.current_definition_version, 2);
  assert.equal(X(w, { definitionVersion: 9 }).reason, "DEFINITION_MOVED");
  assert.equal(w.count("proposal_dispositions"), 0);
  assert.equal(before.proposal_dispositions, w.snapshot().proposal_dispositions);
  assert.equal(X(w, { reason: "x".repeat(160), definitionVersion: "2" }).ok, true);   // a string holding the number is read
  assert.deepEqual([...DISPOSITIONS], ["deferred", "dismissed"]);
});

test("R35: notADisposition is the one answer to a word that is no disposition: null for either word, else its full refusal; extra adds and never replaces; writes nothing, never throws", () => {
  const w = seeded();
  w.define();
  const before = w.snapshot();
  // N340: DISPOSITIONS is promotion's one list (its R51), re-exported by identity, never a copy, and frozen
  assert.equal(DISPOSITIONS, PROMOTION_DISPOSITIONS);
  assert.equal(PROGRESSIONS_CHECKS_MODULE.DISPOSITIONS, PROMOTION_DISPOSITIONS);
  assert.equal(DISPOSITIONS, REOPENABLE_FROM);
  assert.deepEqual([...DISPOSITIONS], ["deferred", "dismissed"]);
  assert.ok(Object.isFrozen(DISPOSITIONS));
  assert.throws(() => { "use strict"; DISPOSITIONS.push("adopted"); }, TypeError);
  assert.deepEqual([...DISPOSITIONS], ["deferred", "dismissed"]);
  for (const word of DISPOSITIONS) assert.equal(notADisposition(word), null, word);
  const TRANSLATION = "Setting something down means deferring it (set aside for now) or dismissing it (declined); taking it up "
    + "is a different act. Choose deferred or dismissed. Nothing was written.";
  const row = PROGRESSION_CHECKS.NOT_A_DISPOSITION;
  assert.deepEqual(row, { check: "C-100.20", where: "src/progressions/checks.mjs notADisposition > is-disposition-word", translation: TRANSLATION });
  // every other word, compared exactly (a caller trims first), with `to` as given and null when blank
  const cases = [["adopted", "adopted"], ["Deferred", "Deferred"], [" deferred", " deferred"], ["dismiss", "dismiss"], [7, 7],
                 [["deferred"], ["deferred"]], ["", null], ["   ", null], [null, null], [undefined, null]];
  let detail = null;
  for (const [to, given] of cases) {
    const r = notADisposition(to);
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "dispositions", "ok", "reason", "to", "translation"], JSON.stringify(to));
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_A_DISPOSITION", "NOT_A_DISPOSITION", "C-100.20", TRANSLATION]);
    assert.deepEqual(r.to, given, JSON.stringify(to));
    assert.deepEqual([...r.dispositions], ["deferred", "dismissed"]);
    assert.equal(r.dispositions, PROMOTION_DISPOSITIONS);
    assert.ok(typeof r.detail === "string" && r.detail.length > 20);
    if (detail === null) detail = r.detail;
    assert.equal(r.detail, detail, "one fixed sentence");
  }
  // extra adds a caller's fields and never replaces the answer's own
  const x = notADisposition("adopted", { key: "k", reason: "X", code: "X", check: "X", translation: "X", to: "X", dispositions: [], detail: "X", ok: true });
  assert.deepEqual(x, { ...notADisposition("adopted"), key: "k" });
  assert.equal(notADisposition("deferred", { key: "k" }), null);
  for (const extra of [null, undefined, "str", 5]) assert.deepEqual(notADisposition("no", extra), notADisposition("no"));
  // R21's refusal is exactly this answer, the word as disposeProposal trimmed it
  const r = w.p.disposeProposal({ key: "proc::award", to: " adopted ", reason: "r", definitionVersion: 1, decidedBy: "member:alice" });
  assert.deepEqual(r, notADisposition("adopted"));
  assert.deepEqual(w.p.disposeProposal({ key: "proc::award", to: "", reason: "r", definitionVersion: 1, decidedBy: "member:alice" }),
                   notADisposition(null));
  assert.deepEqual(w.snapshot(), before);
});

test("R22 R26: one decision per (progression, stage), replaced on re-decision, the decider stamped, the current version; nothing else written", () => {
  const w = seeded();
  w.define();
  const before = w.snapshot();
  w.clock.now = "2026-09-05T00:00:00.000Z";
  const r = w.p.disposeProposal({ progressionKey: "proc", stageKey: "award", to: "deferred", reason: "later", definitionVersion: 1,
                                  decidedBy: "member:alice" });
  assert.deepEqual(r, { ok: true, key: "proc::award", progression_key: "proc", stage_key: "award", to: "deferred", state: "deferred",
                        reason: "later", decided_by: "member:alice", at: "2026-09-05T00:00:00.000Z", bundle: null, definition_version: 1 });
  w.clock.now = "2026-09-06T00:00:00.000Z";
  X(w, { state: "dismissed", to: undefined, reason: "not worth it", decidedBy: "member:bea" });
  const rows = w.rows(`SELECT * FROM proposal_dispositions`);
  assert.deepEqual(rows, [{ progression_key: "proc", stage_key: "award", state: "dismissed", reason: "not worth it",
                            decided_by: "member:bea", at: "2026-09-06T00:00:00.000Z", definition_version: 1 }]);
  const after = w.snapshot();
  for (const t of Object.keys(before)) if (t !== "proposal_dispositions") assert.equal(after[t], before[t], t);
});

test("R22: with items, each item is decided on its own; the decider forced onto every item; a shared version overridable per item", () => {
  const w = seeded();
  w.define();
  w.p.defineProgression({ progressionKey: "meet", label: "Meeting", declaredBy: "member:alice", basis: "b",
    stages: [{ key: "meeting", cardinality: "1", required: "always" }, { key: "minutes", after: "meeting", cardinality: "1", required: "always" }] });
  w.p.defineProgression({ progressionKey: "meet", label: "Meeting", declaredBy: "member:alice", basis: "b", citation: "c",
    stages: [{ key: "meeting", cardinality: "1", required: "always" }, { key: "minutes", after: "meeting", cardinality: "1", required: "usually" }] });
  const r = w.p.disposeProposal({ to: "dismissed", reason: "known", definitionVersion: 1, decidedBy: "member:alice", items: [
    { key: "proc::award" },
    { progressionKey: "proc", stageKey: "bid" },
    { key: "meet::minutes", definitionVersion: 2 },
    { key: "proc::need", decidedBy: "member:mallory" },
  ] });
  assert.equal(r.ok, false);                 // one item retained: the set answers so, the applied items stand
  assert.equal(r.reason, "SET_ITEMS_RETAINED");
  assert.equal(r.weight, "per-item");
  assert.equal(r.count, 4);
  assert.deepEqual(r.items.map((i) => i.outcome), ["applied", "retained", "applied", "applied"]);
  assert.equal(r.items[1].reason, "BAD_STAGE");
  const rows = w.rows(`SELECT progression_key, stage_key, decided_by, definition_version FROM proposal_dispositions ORDER BY progression_key, stage_key`);
  assert.deepEqual(rows, [{ progression_key: "meet", stage_key: "minutes", decided_by: "member:alice", definition_version: 2 },
                          { progression_key: "proc", stage_key: "award", decided_by: "member:alice", definition_version: 1 },
                          { progression_key: "proc", stage_key: "need", decided_by: "member:alice", definition_version: 1 }]);
  assert.equal(w.p.disposeProposal({ to: "deferred", reason: "r", definitionVersion: 1, decidedBy: "member:alice", items: [] }).ok, false);
});

test("R20: a decision applies when its version is current; with none recorded, only when the definition was declared strictly before it", async () => {
  const w = seeded();
  w.clock.now = "2026-09-01T00:00:00.000Z";
  w.define();
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }],
                             threadedBy: "member:alice", viewer: MEMBER });
  const view = (stage) => w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER })
    .findings.find((f) => f.stage_key === stage).disposition;
  const raw = (stage, at, version) => w.st.sql.exec(
    `INSERT OR REPLACE INTO proposal_dispositions (progression_key,stage_key,state,reason,decided_by,at,definition_version)
     VALUES ('proc',?,'deferred','r','member:x',?,?)`, stage, at, version);
  raw("award", "2026-09-02T00:00:00.000Z", 1);
  assert.deepEqual([view("award").applies, view("award").applies_because], [true, "decided_against_current_version"]);
  raw("award", "2026-09-02T00:00:00.000Z", null);   // not recorded; declared strictly before the decision
  assert.deepEqual([view("award").applies, view("award").applies_because, view("award").definition_version_state],
                   [true, "version_not_recorded_definition_not_declared_since", "not recorded"]);
  raw("award", "2026-09-01T00:00:00.000Z", null);   // the same instant: order undetermined
  assert.deepEqual([view("award").applies, view("award").applies_because], [false, "version_not_recorded_order_undetermined"]);
  raw("award", null, null);                         // a missing instant
  assert.deepEqual([view("award").applies, view("award").applies_because], [false, "version_not_recorded_order_undetermined"]);
  raw("award", "2026-08-01T00:00:00.000Z", null);   // declared since
  assert.deepEqual([view("award").applies, view("award").applies_because], [false, "version_not_recorded_definition_declared_since"]);
  w.clock.now = "2026-09-03T00:00:00.000Z";
  w.define("proc", { contract: { within: "3 weeks" } }, { basis: "b", citation: "c" });
  raw("award", "2026-09-02T00:00:00.000Z", 1);
  assert.deepEqual([view("award").applies, view("award").applies_because], [false, "decided_against_earlier_version"]);
  // the sixth answer: a decision about a progression no longer declared
  const f = w.p.proposalsFeed(0);
  assert.equal(f.dispositions.length, 1);
  w.st.sql.exec(`INSERT INTO proposal_dispositions (progression_key,stage_key,state,reason,decided_by,at,definition_version)
                 VALUES ('gone','x','deferred','r','member:x','t',1)`);
  assert.equal(w.p.proposalsFeed(0).dispositions.find((d) => d.progression_key === "gone").applies_because, "definition_not_declared");
});

test("R29: instances and exceptions (with their versions) clear with their bundle; definitions and decisions only with the whole store", async () => {
  const w = seeded();
  w.define();
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }],
                             threadedBy: "member:alice", viewer: MEMBER });
  w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "contract", captureSha: "sa", reason: "r", citation: "c",
                       declaredBy: "member:alice", viewer: MEMBER });
  X(w);
  const names = PROGRESSIONS_TABLES.map((t) => (typeof t === "string" ? t : t.name));
  assert.deepEqual(names.sort(), ["progression_def_versions", "progression_defs", "progression_exception_versions", "progression_exceptions",
    "progression_instances", "progression_stage_versions", "progression_stages", "progression_thread_placements", "progression_threads",
    "proposal_dispositions"]);
  w.record.purge({ bundleId: "INFO-A" });
  assert.deepEqual(w.rows(`SELECT capture_sha FROM progression_instances`), [{ capture_sha: "sb" }]);
  assert.equal(w.count("progression_exceptions"), 0);
  assert.equal(w.count("progression_exception_versions"), 0);
  assert.deepEqual(w.rows(`SELECT capture_sha FROM progression_thread_placements`), [{ capture_sha: "sb" }]);
  assert.equal(w.count("progression_defs"), 1);
  assert.equal(w.count("proposal_dispositions"), 1);
  assert.equal(w.count("progression_threads"), 1);
  // the instance honestly re-reads with that stage unfilled
  assert.ok(w.p.readInstance({ progressionKey: "proc", entityId: "ENT-1", viewer: MEMBER }).findings.some((f) => f.stage_key === "need"));
  w.record.purge({});
  for (const t of names) assert.equal(w.count(t), 0, t);
});

test("R34: progression_instances' named columns and every R29 table's row count are readable in a later module's own SQL", async () => {
  const w = seeded();
  w.bundle("PROJ-1", "project");
  w.resolve("ENT-1", "sp", "PROJ-1", "A");
  w.define();
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sp" }],
                             threadedBy: "member:alice", viewer: MEMBER });
  const cols = w.rows(`PRAGMA table_info(progression_instances)`).map((c) => [c.name, c.type]);
  for (const [c, t] of [["progression_key", "TEXT"], ["entity_id", "TEXT"], ["stage_key", "TEXT"], ["capture_sha", "TEXT"], ["bundle_id", "TEXT"]])
    assert.ok(cols.some(([n, ty]) => n === c && ty === t), c);
  // queue's sight join, as it is written: the bundles a viewer may see among an instance's placements
  const seen = w.rows(`SELECT DISTINCT pi.bundle_id FROM progression_instances pi JOIN bundles b ON b.bundle_id = pi.bundle_id
                        WHERE pi.progression_key=? AND pi.entity_id=? AND b.object_type <> 'project' ORDER BY pi.bundle_id`, "proc", "ENT-1");
  assert.deepEqual(seen, [{ bundle_id: "INFO-A" }]);
  // the meaning: one row per placement of the CURRENT threading, keyed to the bundle the document is filed in
  assert.deepEqual(w.rows(`SELECT stage_key, capture_sha, bundle_id FROM progression_instances ORDER BY stage_key`),
    [{ stage_key: "award", capture_sha: "sp", bundle_id: "PROJ-1" }, { stage_key: "need", capture_sha: "sa", bundle_id: "INFO-A" }]);
  for (const t of PROGRESSIONS_TABLES.map((x) => (typeof x === "string" ? x : x.name)))
    assert.equal(typeof w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n, "number", t);
});

test("R42 R29: every table declared explicitly through record-core's declareTable with its classes; the versions and the versioned rows are chains, bundle-keyed ones take the bundle's sight", () => {
  const w = seeded();
  const mine = w.record.declaredTables().filter((d) => d.module === "progressions");
  const view = Object.fromEntries(mine.map((d) => [d.name, [d.purge, d.expunge, d.export, d.sight, d.derive, d.version_chain]]));
  const B = (chain) => ["clear", "none", "admin-only", "bundle", "stored", chain], G = (chain) => ["clear", "none", "admin-only", "group", "stored", chain];
  assert.deepEqual(view, {
    progression_instances: B(true), progression_exceptions: B(true), progression_thread_placements: B(true),
    progression_exception_versions: B(true), progression_defs: G(false), progression_stages: G(false),
    progression_def_versions: G(true), progression_stage_versions: G(true), progression_threads: G(true),
    proposal_dispositions: G(false) });
  // declared once: a second declaration by this module, or another's of one of its tables, is refused
  assert.equal(w.record.declareTable("progressions", [{ name: "progression_defs", purge: "clear", expunge: "none", export: "admin-only",
    sight: "group", derive: "stored", version_chain: false }]).reason, "TABLE_DECLARED");
  // the definitions and decisions are keyed to no bundle (a bundle's purge leaves them, R29's test above)
  for (const t of PROGRESSIONS_TABLES) assert.equal(t.keys === undefined, ["progression_instances", "progression_exceptions",
    "progression_thread_placements", "progression_exception_versions"].includes(t.name), t.name);
});
