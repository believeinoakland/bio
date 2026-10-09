/* T20 layer 6 (K861, plane R10): R47, this module's share of the instance's figures, a source shaped as record-core
   R63's `counts(hid)` with its key list, which `plane` registers under this module's name. Proved at the interface: the
   source alone, then registered through the REAL record-core's R63 and read as `op=stats` and purge's proof read it,
   each answer held against R47's own statement of the count, pinned below (`count(*)` less the rows whose key, read as
   `COALESCE(key, '')`, is in `hid`; `basisVersions` keyed on `bundle_id`, `basisVersionLegs` on `bundle_id` and
   `target_id`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, block, version, merge, V } from "./fixture.mjs";
import { BasisVersions } from "../../../src/basis-versions/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";
import { recordCoreOps } from "../../../src/record-core/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const KEYS = ["basisVersions", "basisVersionLegs"];
const pick = (o) => Object.fromEntries(KEYS.map((k) => [k, o[k]]));

/* R47's count, stated as its own SQL: what the source must answer exactly. */
function stated(sql, hid) {
  const nx = (t, keys) => {
    const conds = [], args = [];
    if (hid) for (const k of keys) { conds.push(`COALESCE(${k}, '') NOT IN ${hid.sql}`); args.push(...hid.args); }
    return sql.exec(`SELECT count(*) c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`, ...args)[0].c;
  };
  return { basisVersions: nx("inquiry_basis_versions", ["bundle_id"]),
           basisVersionLegs: nx("inquiry_basis_version_legs", ["bundle_id", "target_id"]) };
}
/* `hid` as R63 hands it: a viewer never sent is the direct internal call, counted whole. */
const hidOf = (viewer) => (viewer === undefined ? null : hiddenBundles(viewer));

const OPEN = "INFO-2026-0001-open", HID = "INFO-2026-0002-in-project";
const INQ_A = "INQ-2026-0001-public", INQ_B = "INQ-2026-0002-in-project";

/* A project ann owns (so joined); zed outside it; root an active administrator. INQ_A (outside any project) holds
   `plain` (one leg, on OPEN) and `wide` (two legs, on OPEN and on HID, a document inside the project); INQ_B, inside
   the project, holds `inner` (one leg, on OPEN). Every row is written by the module's own projection (R7). */
function build() {
  const w = world();
  for (const id of ["ann", "zed"]) w.member(id);
  w.member("root", { role: "admin" });
  w.doc(OPEN);
  w.doc(HID);
  assert.equal(w.inquiry(INQ_A, block(merge(version("plain", [OPEN]), version("wide", [OPEN, HID])))).ok, true);
  assert.equal(w.inquiry(INQ_B, block(version("inner", [OPEN]))).ok, true);
  const proj = w.project("Oversight", "ann");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id IN (?, ?)`, proj, HID, INQ_B);
  return { w, proj };
}

const WHOLE = { basisVersions: 3, basisVersionLegs: 4 };
/* Outside the (hidden) project: less INQ_B's version and its leg (its bundle hidden), less wide's leg on HID (its
   target hidden). */
const OUTSIDE = { basisVersions: 2, basisVersionLegs: 2 };
/* Each viewer, what it is told: whole, less what lies in the project it is outside, or nothing. D54 (K2408, K2442;
   membership R43, R44, R88): an administrator, the founder included, neither invited nor joined, sees a HIDDEN project
   only at EXISTENCE, so its contents are outside its count like any non-participant's; a discoverable project, and an
   invited administrator, are the negative controls in the first test. */
const VIEWERS = [
  [undefined, WHOLE, "a viewer never sent: the direct internal call, counted whole"],
  ["admin", OUTSIDE, "the founder, neither invited nor joined, is outside a hidden project's contents (D54)"],
  [`${MACHINE_CLASS_PREFIX}admin`, WHOLE, "a machine credential sees every bundle"],
  [V("root"), OUTSIDE, "an active administrator, neither invited nor joined, is outside a hidden project's contents (D54)"],
  [V("ann"), WHOLE, "a participant of the project sees all of it"],
  [V("zed"), OUTSIDE, "outside the project"],
  ["junk", { basisVersions: 0, basisVersionLegs: 0 }, "a viewer the gate refuses: every bundle hidden"],
];

test("R47 the figure source: its key list, and counts(hid) — versions less those whose bundle is in hid, legs less those whose bundle or target is — whole for a null hid, exactly as R47 states the count", () => {
  assert.deepEqual([...BasisVersions.COUNT_KEYS], KEYS);
  assert.ok(Object.isFrozen(BasisVersions.COUNT_KEYS));
  const { w, proj } = build();
  assert.deepEqual([w.count("inquiry_basis_versions"), w.count("inquiry_basis_version_legs")], [3, 4], "the fixture is real");
  assert.deepEqual(w.bv.counts(), WHOLE, "no hid: whole");
  assert.deepEqual(w.bv.counts(null), WHOLE);
  for (const [viewer, want, why] of VIEWERS) {
    const got = w.bv.counts(hidOf(viewer));
    assert.deepEqual(Object.keys(got), KEYS, `${why}: every key, in the list's order`);
    assert.deepEqual(got, want, why);
    assert.deepEqual(got, stated(w.st.sql, hidOf(viewer)), `${why}: exactly R47's statement`);
  }
  /* each arm alone: a leg whose BUNDLE is hidden (INQ_B's) and one whose TARGET is hidden (wide's on HID) */
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, INQ_B);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), { basisVersions: 3, basisVersionLegs: 3 }, "only the target arm");
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, HID);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, proj, INQ_B);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), { basisVersions: 2, basisVersionLegs: 3 }, "only the bundle arm");
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), stated(w.st.sql, hiddenBundles(V("zed"))));
  /* sight follows the record: inviting zed into the project moves zed's count at once */
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, proj, HID);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), VIEWERS.find(([v]) => v === V("zed"))[1]);
  /* D54's negative controls: the same project set DISCOVERABLE is counted whole for an administrator and the founder
     (unchanged by D54), still not for zed; set hidden again, they are outside it again */
  const vis = (setting) => assert.equal(w.membership.projectVisibilitySet({ projectId: proj, setting, by: "ann",
                                                                             viewer: V("ann") }).ok, true, setting);
  vis("discoverable");
  for (const v of ["admin", V("root")]) {
    assert.deepEqual(w.bv.counts(hiddenBundles(v)), WHOLE, `${v}: a discoverable project is counted whole`);
    assert.deepEqual(w.bv.counts(hiddenBundles(v)), stated(w.st.sql, hiddenBundles(v)));
  }
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), OUTSIDE, "a member outside a discoverable project is still outside");
  vis("hidden");
  for (const v of ["admin", V("root")]) assert.deepEqual(w.bv.counts(hiddenBundles(v)), OUTSIDE, `${v}: hidden again`);
  /* an INVITED administrator is a participant: counted whole, while the founder, not invited, is still outside */
  assert.equal(w.membership.projectInvite({ projectId: proj, handle: "h_root", by: "ann", viewer: V("ann") }).ok, true);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("root"))), WHOLE, "the invited administrator");
  assert.deepEqual(w.bv.counts(hiddenBundles(V("root"))), stated(w.st.sql, hiddenBundles(V("root"))));
  assert.deepEqual(w.bv.counts(hiddenBundles("admin")), OUTSIDE, "the founder, not invited");
  assert.equal(w.membership.projectInvite({ projectId: proj, handle: "h_zed", by: "ann", viewer: V("ann") }).ok, true);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), WHOLE);
  assert.deepEqual(w.bv.counts(hiddenBundles(V("zed"))), stated(w.st.sql, hiddenBundles(V("zed"))));
});

test("R47 a NULL key names no bundle, so hid never drops its row; it writes nothing", () => {
  /* A store whose tables were made without NOT NULL on the keys: the module's CREATE IF NOT EXISTS keeps them. */
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT, project TEXT)`);
  db.exec(`CREATE TABLE inquiry_basis_versions (bundle_id TEXT, name TEXT, ord INTEGER, description TEXT,
             relationship TEXT, state TEXT, derived_from TEXT, hidden INTEGER, claim TEXT, run TEXT, author TEXT,
             at TEXT, regroup_by TEXT, regroup_at TEXT, regroup_note TEXT, composition TEXT, leg_count INTEGER)`);
  db.exec(`CREATE TABLE inquiry_basis_version_legs (bundle_id TEXT, name TEXT, ord INTEGER, target_id TEXT,
             target_type TEXT, role TEXT, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT,
             ground TEXT)`);
  const sql = { exec: (q, ...a) => { const st = db.prepare(q); return st.columns().length ? st.all(...a) : (st.run(...a), []); } };
  const bv = new BasisVersions({ storage: { sql } });
  bv.migrate();
  db.exec(`INSERT INTO bundles VALUES ('INQ-1','inquiry','Q',NULL)`);
  for (const id of ["INQ-1", null]) {
    db.prepare(`INSERT INTO inquiry_basis_versions (bundle_id, name) VALUES (?, 'v')`).run(id);
    db.prepare(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id) VALUES (?, 'v', 0, 'INQ-1')`).run(id);
  }
  db.prepare(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id) VALUES (NULL, 'v', 1, NULL)`).run();
  const snapshot = () => JSON.stringify(sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map(({ name }) => [name, sql.exec(`SELECT * FROM "${name}"`)]));
  const before = snapshot();
  const all = hiddenBundles("junk");   // every bundle hidden
  assert.deepEqual(bv.counts(all), { basisVersions: 1, basisVersionLegs: 1 }, "only the row whose keys are all NULL stays");
  assert.deepEqual(bv.counts(all), stated(sql, all));
  assert.deepEqual(bv.counts(null), { basisVersions: 2, basisVersionLegs: 3 });
  assert.deepEqual(bv.counts(null), stated(sql, null));
  assert.equal(snapshot(), before, "writes nothing");
});

test("R47 registered through record-core R63 under basis-versions' name, it answers op=stats through each viewer's sight and purge's proof whole, exactly as R47 states the count; basis-versions registers nothing itself", () => {
  const { w } = build();
  const rc = w.record;
  /* the module registered nothing at its start: no figure of its is held by record-core */
  for (const k of KEYS) assert.equal(k in rc.counts(null), false, `${k}: not registered by basis-versions itself`);
  /* the registration plane makes, under this module's name */
  assert.deepEqual(rc.registerCounts("basis-versions", [...BasisVersions.COUNT_KEYS], (hid) => w.bv.counts(hid)),
    { ok: true, module: "basis-versions", keys: KEYS });
  for (const [viewer, want, why] of VIEWERS) {
    assert.deepEqual(pick(rc.counts(hidOf(viewer))), want, `R63 ${why}`);
    assert.deepEqual(pick(rc.counts(hidOf(viewer))), stated(w.st.sql, hidOf(viewer)), `R63 ${why}: R47's statement`);
  }
  /* op=stats and purge's proof, read through a stats source composed as plane composes it (R65: the registered
     figures, through the caller's sight, a viewer never sent counted whole) */
  assert.equal(rc.registerStatsSource("plane", ({ viewer }) => rc.counts(hidOf(viewer))).ok, true);
  for (const [viewer, want, why] of VIEWERS) {
    const s = viewer === undefined ? rc.stats({}) : rc.stats({ viewer });
    assert.deepEqual(pick(s), want, `op=stats ${why}`);
  }
  assert.deepEqual(pick(rc.proofCounts()), WHOLE, "purge's proof is whole");
  /* purge proves what it took: the question inside the project, its version and its leg */
  const p = recordCoreOps(rc, new URL(`http://x/?op=purge&bundleId=${INQ_B}`), null).purge();
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.deepEqual(KEYS.map((k) => [p.before[k], p.after[k]]), [[3, 2], [4, 3]]);
  assert.deepEqual(pick(p.after), stated(w.st.sql, null), "after: R47's statement, whole");
  /* a second registration under its name is refused, naming the holder (R63) */
  const again = rc.registerCounts("basis-versions", [...BasisVersions.COUNT_KEYS], (hid) => w.bv.counts(hid));
  assert.deepEqual([again.ok, again.reason, again.heldBy], [false, "COUNTS_DECLARED", "basis-versions"]);
});
