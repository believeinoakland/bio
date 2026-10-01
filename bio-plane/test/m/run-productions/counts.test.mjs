/* run-productions: its share of the instance's figures (R20; K861, plane R10), with R17's purge and the caller's sight.
   The export is registered here as plane registers it (`src/plane/stats.mjs`: record-core R63, under this module's
   name), and read as plane's stats source reads it: through membership's `hiddenBundles` for a viewer sent, whole for
   none. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { RunProductions, RUN_PRODUCTIONS_MODULE } from "../../../src/run-productions/index.mjs";
import { recordCoreOps } from "../../../src/record-core/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";
import { world, Q, DOC, HIDDEN_PROJ, RUN, ALICE, BOB, MACHINE, sha } from "./fixture.mjs";

const AK = "class:ai/k1";
const CAROL = "member:carol";
const HIDDEN_DOC = "INFO-2026-0007-h", HIDDEN_Q = "INQ-2026-0007-h", GONE = "INFO-2099-0000-gone";

/* Rows in and out of a project only carol may see: proposals and stored refusals made through the module's own ops on
   a visible document and question, and rows of the same tables naming the hidden project, a document and a question
   inside it, and a bundle the record no longer holds. */
function figuresWorld() {
  const w = world();
  w.inquiry(Q);
  w.run(RUN);
  w.doc(DOC);
  w.run("RUN-E", { mode: "extract", principal_plane: AK, mints: 5 });
  w.project(HIDDEN_PROJ, ["carol"]);
  w.doc(HIDDEN_DOC, "hidden bytes"); w.inquiry(HIDDEN_Q);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id IN (?, ?)`, HIDDEN_PROJ, HIDDEN_DOC, HIDDEN_Q);
  for (const id of [HIDDEN_DOC, HIDDEN_Q]) w.membership.reindexProjectSight(id);
  const propose = (ref) => w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
    refs: [{ ref, refKind: "k", refKey: ref }], proposedBy: AK, viewer: ALICE, caller: AK });
  assert.equal(propose("k:1").ok, true); assert.equal(propose("k:2").ok, true);
  assert.equal(w.suggest({ name: "b1", description: "tbd" }).code, "SUGGEST_BOILERPLATE");
  assert.equal(w.suggest({ name: "b2", description: "n/a" }).code, "SUGGEST_BOILERPLATE");
  const pr = (bundle, ref) => w.st.sql.exec(`INSERT INTO proposed_readings (run, capture_sha, bundle_id, ref, fn, fn_version,
    chain, earned, proposed_by, at) VALUES ('RUN-H', ?, ?, ?, 'propose-reading', '0.1.0', '[]', 'B', ?, 't')`, sha(bundle), bundle, ref, AK);
  pr(HIDDEN_DOC, "h:1"); pr(HIDDEN_DOC, "h:2"); pr(HIDDEN_PROJ, "h:3"); pr(GONE, "g:1");
  const sr = (target, n) => w.st.sql.exec(`INSERT INTO suggest_refusals (target, submission, base_sha, code, payload,
    first_at, last_at, repeats) VALUES (?, ?, 'sha', 'SUGGEST_BOILERPLATE', '{}', 't', 't', 0)`, target, `s${n}`);
  sr(HIDDEN_Q, 1); sr(HIDDEN_Q, 2); sr(HIDDEN_Q, 3); sr(GONE, 4);
  return w;
}

/* The two figures as R20 defines them, computed from the rows in JS: a row is dropped when the column
   that names its bundle names one the viewer cannot see (the gate's own answer, read row by row). */
function expectedFigures(w, viewer) {
  const hidden = viewer === undefined ? new Set()
    : new Set(w.rows(`SELECT bundle_id FROM bundles`).map((r) => r.bundle_id).filter((id) => !w.membership.inSight(id, viewer)));
  const n = (t, k) => w.rows(`SELECT ${k} AS k FROM ${t}`).filter((r) => !(r.k !== null && hidden.has(r.k))).length;
  return { proposedReadings: n("proposed_readings", "bundle_id"), suggestRefusals: n("suggest_refusals", "target") };
}
const pick = (o) => Object.fromEntries(RunProductions.COUNT_KEYS.map((k) => [k, o[k]]));

test("R20: the exported figure source answers exactly its listed keys — proposedReadings by bundle_id, suggestRefusals by target — whole for a null hid and, through the caller's sight, less every row naming a bundle the caller cannot see", () => {
  const w = figuresWorld();
  assert.deepEqual(RunProductions.COUNT_KEYS, ["proposedReadings", "suggestRefusals"], "its key list, in order");
  assert.ok(Object.isFrozen(RunProductions.COUNT_KEYS));
  const whole = expectedFigures(w, undefined);
  assert.deepEqual(whole, { proposedReadings: 6, suggestRefusals: 6 });
  assert.deepEqual(w.p.counts(null), whole, "a null hid counts whole");
  assert.deepEqual(w.p.counts(), whole);
  /* bob is outside the hidden project: none of its rows count; the row naming a bundle no longer held stays */
  const bob = hiddenBundles(BOB);
  assert.ok(bob, "bob's sight subtracts");
  assert.deepEqual(w.p.counts(bob), expectedFigures(w, BOB));
  assert.deepEqual(w.p.counts(bob), { proposedReadings: 3, suggestRefusals: 3 });
  assert.deepEqual(Object.keys(w.p.counts(bob)), [...RunProductions.COUNT_KEYS], "exactly its keys, in order");
  /* carol, a participant, sees the project; a machine credential's sight subtracts nothing (null); a viewer the gate
     refuses sees no bundle, so only the row naming no held bundle stays */
  assert.deepEqual(w.p.counts(hiddenBundles(CAROL)), expectedFigures(w, CAROL));
  assert.deepEqual(w.p.counts(hiddenBundles(CAROL)), whole);
  assert.equal(hiddenBundles(MACHINE), null);
  assert.deepEqual(w.p.counts(hiddenBundles("nobody")), { proposedReadings: 1, suggestRefusals: 1 });
  /* it follows the tables, and writes nothing */
  const before = w.snapshot();
  w.p.counts(bob); w.p.counts(null);
  assert.deepEqual(w.snapshot(), before);
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, HIDDEN_Q); w.membership.reindexProjectSight(HIDDEN_Q);
  assert.deepEqual(w.p.counts(hiddenBundles(BOB)), { proposedReadings: 3, suggestRefusals: 6 }, "a question leaving the project is counted again");
  /* a table it cannot read is left out, never zero, and it never throws */
  w.st.db.exec(`DROP TABLE suggest_refusals`);
  assert.deepEqual(w.p.counts(null), { proposedReadings: 6 });
  assert.deepEqual(w.p.counts({ sql: "(no sql", args: [] }), {});
});

test("R20 R17: registered through record-core R63 under this module's name, as plane registers it, the export answers both figures as R20 defines them, through the caller's sight; the module registers nothing itself", () => {
  const w = figuresWorld();
  const rc = w.record;
  assert.deepEqual(RunProductions.COUNT_KEYS.filter((k) => k in rc.counts(null)), [], "nothing registered by the module itself");
  assert.deepEqual(rc.registerCounts(RUN_PRODUCTIONS_MODULE, [...RunProductions.COUNT_KEYS], (hid) => w.p.counts(hid)),
                   { ok: true, module: "run-productions", keys: ["proposedReadings", "suggestRefusals"] }, "the name and keys are free for plane to register");
  assert.deepEqual(pick(rc.counts(null)), expectedFigures(w, undefined));
  assert.deepEqual(pick(rc.counts(hiddenBundles(BOB))), expectedFigures(w, BOB));
  assert.deepEqual(pick(rc.counts(hiddenBundles(BOB))), { proposedReadings: 3, suggestRefusals: 3 }, "a member outside the hidden project counts none of its rows");
  assert.deepEqual(pick(rc.counts(hiddenBundles(CAROL))), expectedFigures(w, CAROL));
  /* a figure that cannot be read is null through R63, never zero */
  w.st.db.exec(`DROP TABLE proposed_readings`);
  assert.deepEqual(pick(rc.counts(null)), { proposedReadings: null, suggestRefusals: 6 });
});

test("R20 R17 R64: in purge's proof, through a stats source reading R63's figures as plane's does, both are whole before and after a purge, removed is their difference, and op=stats takes them through the viewer's sight", () => {
  const w = figuresWorld();
  const rc = w.record;
  rc.registerCounts(RUN_PRODUCTIONS_MODULE, [...RunProductions.COUNT_KEYS], (hid) => w.p.counts(hid));
  /* plane's source: membership's hiddenBundles for a viewer sent, whole for one never sent (purge asks with none) */
  const asked = [];
  rc.registerStatsSource("plane", ({ viewer, proof }) => {
    asked.push([viewer, proof]);
    return { ...rc.counts(viewer === undefined ? null : hiddenBundles(viewer)) };
  });
  assert.deepEqual(pick(rc.stats({ viewer: BOB })), expectedFigures(w, BOB), "op=stats through bob's sight");
  assert.deepEqual(pick(rc.stats({ viewer: BOB })), { proposedReadings: 3, suggestRefusals: 3 });
  assert.deepEqual(pick(rc.stats({})), expectedFigures(w, undefined), "a viewer never sent counts whole");
  const whole = expectedFigures(w, undefined);
  const ops = (p) => { const u = new URL("https://plane.invalid/?op=purge"); for (const [k, v] of Object.entries(p)) u.searchParams.set(k, v); return recordCoreOps(rc, u, null).purge(); };
  const one = ops({ bundleId: HIDDEN_DOC });
  assert.deepEqual(asked.slice(-2), [[undefined, true], [undefined, true]], "the proof is asked whole, before and after");
  assert.deepEqual(pick(one.before), whole, "before: whole, the hidden project's rows included");
  assert.deepEqual(pick(one.after), expectedFigures(w, undefined));
  assert.deepEqual(pick(one.after), { proposedReadings: 4, suggestRefusals: 6 }, "the document's proposals went (R17, by bundle)");
  assert.equal(one.removed.suggestRefusals, 0);
  const q = ops({ bundleId: HIDDEN_Q });
  assert.deepEqual(pick(q.after), { proposedReadings: 4, suggestRefusals: 3 }, "the question's refusals went (R17, by target)");
  assert.equal(q.removed.suggestRefusals, 3, "removed: before less after");
  const all = ops({});
  assert.deepEqual(pick(all.after), { proposedReadings: 0, suggestRefusals: 0 });
  assert.equal(all.removed.suggestRefusals, 3);
});
