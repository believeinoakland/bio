/* T20 layer 5 (K861, plane R10): R32, this module's share of the instance's figures, a source shaped as record-core
   R63's `counts(hid)` with its key list, which `plane` registers under this module's name. Proved at the interface: the
   source alone, then registered through the REAL record-core's R63 and read as `op=stats` and purge's proof read it,
   each answer held against the pinned count: every row of `observation_log` and every row of `leads`, a `count(*)` with
   no key, so no row is ever subtracted by `hid`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, storage, entry, V, MACHINE } from "./fixture.mjs";
import { ObservationLog } from "../../../src/observation-log/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";
import { recordCoreOps } from "../../../src/record-core/index.mjs";

const KEYS = ["observations", "leads"];

/* The pinned count, statement for statement: what R32 must answer exactly. */
const pinned = (w) => ({ observations: w.count("observation_log"), leads: w.count("leads") });
/* `hid` as plane hands it to a registered source: a viewer never sent is the direct internal call, counted whole. */
const hidOf = (viewer) => (viewer === undefined ? null : hiddenBundles(viewer));
const pick = (o) => Object.fromEntries(KEYS.map((k) => [k, o[k]]));

/* An open document and a hidden project PROJ-H joined by `inner`; `outer` is outside it. The log holds a row naming
   each, a run's rows, and lead looks; alice and inner each wrote a lead, inner's shared into PROJ-H. */
function build() {
  const w = world();
  const [open] = w.doc("INFO-2026-0001", ["open bytes"]);
  const hidden = w.projectDoc("PROJ-H", "hidden bytes");
  w.participant("PROJ-H", "inner");
  assert.equal(w.obs.observe(entry({ state: "PRESENT", result_kind: "capture", result_ref: open })), null);
  assert.equal(w.obs.observe(entry({ authority_kind: "extract", authority: "PROJ-H", level: "content", subject_kind: "capture",
    subject: hidden, state: "PRESENT", result_kind: "reading", result_ref: hidden })), null);
  assert.equal(w.obs.observe(entry({ authority_kind: "run", authority: "RUN-1", subject_kind: "unstated", state: "LOOKED_ABSENT" })), null);
  assert.equal(w.obs.observe(entry({ authority_kind: "run", authority: "RUN-1", subject_kind: "unstated", state: "NEVER_LOOKED" }), null, 1), null);
  const a = w.obs.lead({ words: "alice was told", author: "alice" }).lead_id;
  const i = w.obs.lead({ words: "inner was told", author: "inner" }).lead_id;
  assert.equal(w.obs.leadShare({ reason: "the project is following this up", lead: i, project: "PROJ-H", sharer: "inner", viewer: V("inner") }).ok, true);
  assert.equal(w.obs.leadLook({ detail: "searched the clerk's archive", lead: a, state: "LOOKED_ABSENT", looker: "alice", viewer: V("alice") }).ok, true);
  assert.equal(w.obs.leadLook({ detail: "searched the clerk's archive", lead: i, state: "PRESENT", resultKind: "capture", resultRef: hidden, looker: "inner",
                                viewer: V("inner") }).ok, true);
  return w;
}

const WHOLE = { observations: 6, leads: 2 };
/* Every viewer is told the whole: neither table names a bundle, so no viewer's sight subtracts a row. */
const VIEWERS = [
  [undefined, "a viewer never sent: the direct internal call"],
  ["admin", "the founder"],
  [MACHINE, "a machine credential"],
  [V("inner"), "a member inside the hidden project"],
  [V("outer"), "a member outside it"],
  [V("alice"), "a lead's author outside it"],
  ["junk", "a viewer membership refuses: every bundle hidden"],
];

test("R32 the figure source: its key list, and counts(hid) every row of observation_log (lead looks and run rows included) and every lead, whole for every hid, null included, as the pinned count counts them", () => {
  assert.deepEqual([...ObservationLog.COUNT_KEYS], KEYS);
  assert.ok(Object.isFrozen(ObservationLog.COUNT_KEYS));
  const w = build();
  assert.deepEqual(pinned(w), WHOLE);
  assert.equal(w.row(`SELECT count(*) AS n FROM observation_log WHERE authority_kind = 'lead'`).n, 2, "lead looks are in the log");
  assert.equal(w.row(`SELECT count(*) AS n FROM observation_log WHERE authority_kind = 'run'`).n, 2, "and run rows");
  assert.deepEqual(w.obs.counts(), WHOLE, "no hid: whole");
  assert.deepEqual(w.obs.counts(null), WHOLE);
  for (const [viewer, why] of VIEWERS) {
    const got = w.obs.counts(hidOf(viewer));
    assert.deepEqual(Object.keys(got), KEYS, `${why}: every key, in the list's order`);
    assert.deepEqual(got, WHOLE, why);
    assert.deepEqual(got, pinned(w), `${why}: exactly the pinned count`);
  }
  /* the figures follow the record: a lead and a look move them at once, for every viewer */
  w.obs.lead({ words: "one more", author: "outer" });
  w.obs.observe(entry({ state: "LOOKED_INDETERMINATE" }));
  for (const [viewer, why] of VIEWERS) assert.deepEqual(w.obs.counts(hidOf(viewer)), { observations: 7, leads: 3 }, why);
  assert.deepEqual(w.obs.counts(), pinned(w));
});

test("R32 a table that cannot be read is left out, so R63 answers it null, never zero; it writes nothing", () => {
  const w = build();
  const snapshot = () => JSON.stringify(["observation_log", "leads", "lead_shares"].map((t) => w.rows(`SELECT * FROM ${t}`)));
  const before = snapshot();
  w.obs.counts(); w.obs.counts(hiddenBundles("junk"));
  assert.equal(snapshot(), before, "writes nothing");
  /* a store whose log was never made: the instance answers the figure it can read and leaves the other out */
  const st = storage();
  st.db.exec(`CREATE TABLE leads (lead_id TEXT PRIMARY KEY, author TEXT NOT NULL, words TEXT NOT NULL, locator TEXT, at TEXT NOT NULL)`);
  st.db.exec(`INSERT INTO leads VALUES ('LEAD-2026-0927-aaaaaaaaaaaa', 'alice', 'w', NULL, 't')`);
  const bare = new ObservationLog({ storage: st, record: null, membership: null });
  assert.deepEqual(bare.counts(), { leads: 1 }, "observations unread: left out, not zero");
  w.record.registerCounts("observation-log", [...ObservationLog.COUNT_KEYS], (hid) => bare.counts(hid));
  assert.deepEqual(pick(w.record.counts(null)), { observations: null, leads: 1 }, "R63 answers the unread figure null");
});

test("R32 registered through record-core R63 under observation-log's name, purge's proof counts the whole log, lead rows included, and the leads, and op=stats' answer carries neither key; observation-log registers nothing itself", () => {
  const w = build();
  const rc = w.record;
  /* observation-log registered nothing at its start: no figure of its is held by record-core */
  for (const k of KEYS) assert.equal(k in rc.counts(null), false, `${k}: not registered by observation-log itself`);
  /* the registration plane makes, under this module's name */
  assert.deepEqual(rc.registerCounts("observation-log", [...ObservationLog.COUNT_KEYS], (hid) => w.obs.counts(hid)),
    { ok: true, module: "observation-log", keys: KEYS });
  for (const [viewer, why] of VIEWERS) {
    assert.deepEqual(pick(rc.counts(hidOf(viewer))), WHOLE, `R63 ${why}`);
    assert.deepEqual(pick(rc.counts(hidOf(viewer))), pinned(w), `R63 ${why}: the pinned count`);
  }
  /* op=stats and purge's proof, read through a stats source composed as plane composes it (record-core R65: the
     registered figures, through the caller's sight, a viewer never sent counted whole) */
  assert.equal(rc.registerStatsSource("plane", ({ viewer }) => rc.counts(hidOf(viewer))).ok, true);
  for (const [viewer, why] of VIEWERS) {
    for (const capacity of [false, true]) {
      const s = viewer === undefined ? rc.stats({ capacity }) : rc.stats({ viewer, capacity });
      for (const k of KEYS) assert.equal(k in s, false, `op=stats carries no ${k}: ${why}`);
    }
  }
  const proof = rc.proofCounts();
  assert.deepEqual(pick(proof), WHOLE, "purge's proof is whole: every row of the log, lead looks included, and every lead");
  assert.deepEqual(pick(proof), pinned(w));
  /* purge proves what it took: a per-bundle purge leaves both (neither table names a bundle, R23), the whole-store
     purge takes every row */
  const purge = (q) => recordCoreOps(rc, new URL(`http://x/?op=purge${q}`), null).purge();
  const one = purge("&bundleId=PROJ-H");
  assert.equal(one.ok, true);
  assert.deepEqual([pick(one.before), pick(one.after), one.removed.leads], [WHOLE, WHOLE, 0]);
  const all = purge("");
  assert.equal(all.ok, true);
  assert.deepEqual([pick(all.before), pick(all.after), all.removed.leads], [WHOLE, { observations: 0, leads: 0 }, 2]);
  assert.deepEqual(pick(all.after), pinned(w), "after: the pinned count");
  /* a second registration under its name is refused, naming the holder (R63) */
  const again = rc.registerCounts("observation-log", [...ObservationLog.COUNT_KEYS], (hid) => w.obs.counts(hid));
  assert.deepEqual([again.ok, again.reason, again.heldBy], [false, "COUNTS_DECLARED", "observation-log"]);
});
