/* case-import: re-running another group's work in a project of this group (R29 declare, R30 pair, R31 read, R32 invariants;
   T51; K4169; UC-076), at the module's interface through the door (`op=rerunstart`, `rerunpair`, `rerunread`). Every refusal
   is shown with its negative control; the project refusals are membership's, relayed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowOk, seeded, imp, caseFile, door, V, MACHINE, F1, F2, F3 } from "./fixture.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { CASE_IMPORT_TABLES, caseImportOwns, LENS_LIMIT, RERUN_DISAGREEMENT, REGRADE_NO_OWN_LENS } from "../../../src/case-import/index.mjs";

const g = (grade) => ({ state: "graded", grade });
const S1 = "scrutiny-official-statements", S2 = "pattern-late-filings", S9 = "inference-by-silence";
const PRINTED = [
  { bundle: "BIA-src", id: S1, kind: "scrutiny", subject: "official statements", text: "Check each official statement twice.", justification: "j", citations: [] },
  { bundle: "BIA-src", id: S2, kind: "pattern", subject: "late filings", text: "Late filings are usual here.", justification: "j", citations: [] },
];
const APPS = [{ finding: F1, ord: 0, target: "leg", statement: S1, effect: "grade_lowered", from: "B", to: "C" }];
const P1 = "PRJ-2026-0001-rerun", P2 = "PRJ-2026-0002-bos", P3 = "PRJ-2026-0003-idle";
const OWN1 = "INQ-2026-0101-own-transfers", OWN2 = "INQ-2026-0102-own-contracts", OWN3 = "INQ-2026-0103-own-payroll", FOREIGN = "INQ-2026-0201-bos";
const own = (cap, con) => ({ capture: cap ? g(cap) : { state: "unrated", grade: null }, connection: con ? g(con) : { state: "unrated", grade: null } });
const stmt = (id, kind, subject, text) => ({ statement_id: id, bundle_id: "BIA-own", scope: "project", kind, subject, text });
const rows = (r) => r.map(({ kind, subject, text }) => ({ kind, subject, text }));

async function setup() {
  const w = seeded();
  w.member("erin");
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("C"), connection: g("C") } });
  const a = await imp(w, caseFile({ apps: APPS, printedLens: PRINTED }));
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  /* alice owns P1 and bob has joined it; erin was only invited; bob owns P2, out of alice's sight */
  w.project(P1, { owner: "alice", joined: ["bob"], invited: ["erin"] });
  w.project(P2, { owner: "bob" });
  w.project(P3, { owner: "alice" });
  w.ownFinding(P1, OWN1, own("B", "C"));
  w.ownFinding(P1, OWN2, own("B", "C"));
  w.ownFinding(P1, OWN3, own(null, null));
  w.ownFinding(P2, FOREIGN, own("A", "A"));
  const start = (x = {}, who = "alice") => door(w, "rerunstart", { viewer: V(who), by: V(who), project: P1, import: a.import, edition: 1, ...x });
  const pair = (x = {}, who = "alice") => door(w, "rerunpair", { viewer: V(who), by: V(who), project: P1,
    source_finding: importedFindingRef(a.import, F1), own_finding: OWN1, ...x });
  const read = (x = {}, who = "alice") => door(w, "rerunread", { viewer: V(who), project: P1, ...x });
  return { w, a, start, pair, read };
}
const pairs = (r, f) => r.reruns[0].findings.find((x) => x.finding === f);

/* ================================================================ R29 */

test("R29 an owner declares a project a rerun of an imported edition: one row of this module's own, the import untouched and nothing endorsed", async () => {
  const { w, a, start } = await setup();
  const accepted = w.count("case_import_acceptances");
  const bundles = w.snapshot("bundles");
  const r = await start();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.project, r.import, r.edition, r.by], [P1, a.import, 1, V("alice").replace("member:", "")]);
  assert.equal(typeof r.at, "string");
  assert.equal(w.count("case_import_reruns"), 1);
  assert.equal(w.count("case_import_acceptances"), accepted, "a rerun is not an acceptance");
  assert.deepEqual(w.snapshot("bundles"), bundles, "the project's record is not touched: no bundle written");
});

test("R29 refusals, in order, each writing nothing: a machine; a project not seen or absent; a participant who is not the owner; an import or edition not held; and RERUN_ALREADY with its control", async () => {
  const { w, a, start } = await setup();
  const before = () => w.snapshot();
  const check = async (call, code, row = true) => {
    const b = before();
    const r = await call();
    if (row) rowOk(r, code); else { assert.equal(r.ok, false); assert.equal(r.code, code, JSON.stringify(r).slice(0, 200)); }
    assert.deepEqual(w.snapshot(), b, `${code}: nothing written`);
    return r;
  };
  /* 1 a machine, an AI or operator credential, and an unstamped by */
  for (const by of [MACHINE, "token:operator", null]) await check(() => door(w, "rerunstart", { viewer: V("alice"), by, project: P1, import: a.import, edition: 1 }), "MACHINE_CANNOT_RERUN");
  /* 2 a project the viewer cannot see, one absent and one that is no project, alike */
  const unseen = await check(() => start({ project: P2 }), "NO_SUCH_PROJECT", false);
  const absent = await check(() => start({ project: "PRJ-9999" }), "NO_SUCH_PROJECT", false);
  const notProject = await check(() => start({ project: OWN1 }), "NO_SUCH_PROJECT", false);
  assert.deepEqual({ ...unseen, project: null }, { ...absent, project: null }, "an unseen project is answered as an absent one");
  assert.deepEqual({ ...notProject, project: null }, { ...absent, project: null });
  /* 3 the owner's act: bob has joined P1 and may not direct it */
  await check(() => start({}, "bob"), "PROJECT_ACT_NOT_THE_OWNER", false);
  /* 4 an import or an edition not held; a viewer who is not an active member never reaches here (R4's absence) */
  await check(() => start({ import: "0".repeat(64) }), "IMPORT_NO_SUCH_EDITION");
  await check(() => start({ edition: 9 }), "IMPORT_NO_SUCH_EDITION");
  /* the control: the owner declares; then a second declaration for the same pair */
  assert.equal((await start()).ok, true);
  const again = await check(() => start(), "RERUN_ALREADY");
  assert.match(again.detail, /\bedition\b/);
  /* and the next edition succeeds: one project may rerun a later edition */
  const two = await imp(w, caseFile({ edition: 2, apps: APPS, printedLens: PRINTED }));
  assert.equal(two.import, a.import, "edition 2 lands in the same import");
  assert.equal((await start({ edition: 2 })).ok, true);
  assert.equal(w.count("case_import_reruns"), 2);
  /* a second project may rerun the same edition */
  assert.equal((await start({ project: P3 })).ok, true);
});

/* ================================================================ R30 */

test("R30 pair, withdraw and re-pair are read back in order, an own finding pairing with several source findings and the reverse; the latest entry for a pair stands", async () => {
  const { w, a, start, pair, read } = await setup();
  await start();
  const ref = (f) => importedFindingRef(a.import, f);
  const p1 = await pair();
  assert.equal(p1.ok, true, JSON.stringify(p1).slice(0, 300));
  assert.deepEqual([p1.project, p1.import, p1.edition, p1.source_finding, p1.own_finding, p1.withdrawn], [P1, a.import, 1, ref(F1), OWN1, false]);
  assert.equal((await pair({ source_finding: ref(F2) })).ok, true, "one own finding with several source findings");
  assert.equal((await pair({ own_finding: OWN2 })).ok, true, "and one source finding with several own findings");
  const w1 = await pair({ withdraw: true });
  assert.equal(w1.ok, true);
  assert.equal(w1.withdrawn, true);
  assert.deepEqual(pairs(await read(), F1).pairings.map((x) => x.own_finding), [OWN2], "the withdrawn pairing no longer stands");
  assert.equal((await pair()).ok, true, "re-paired");
  const r = await read();
  assert.deepEqual(pairs(r, F1).pairings.map((x) => x.own_finding).sort(), [OWN1, OWN2]);
  assert.deepEqual(r.reruns[0].pairing_history.map((x) => [x.source_finding, x.own_finding, x.withdrawn]),
    [[ref(F1), OWN1, false], [ref(F2), OWN1, false], [ref(F1), OWN2, false], [ref(F1), OWN1, true], [ref(F1), OWN1, false]], "append-only, in order");
  assert.equal(w.count("case_import_rerun_pairs"), 5);
  /* a joined participant who is not the owner pairs too (R30) */
  assert.equal((await pair({ source_finding: ref(F3), own_finding: OWN3 }, "bob")).ok, true);
});

test("R30 refusals, in order, each writing nothing: a machine; a project not seen; a member who has not joined; a source finding that is absent; no rerun of that edition; a finding the edition lacks; an own finding of another project", async () => {
  const { w, a, start, pair } = await setup();
  await start();
  const ref = importedFindingRef(a.import, F1);
  const check = async (call, code, row = true) => {
    const b = w.snapshot();
    const r = await call();
    if (row) rowOk(r, code); else { assert.equal(r.ok, false); assert.equal(r.code, code, JSON.stringify(r).slice(0, 200)); }
    assert.deepEqual(w.snapshot(), b, `${code}: nothing written`);
    return r;
  };
  for (const by of [MACHINE, null]) await check(() => door(w, "rerunpair", { viewer: V("alice"), by, project: P1, source_finding: ref, own_finding: OWN1 }), "MACHINE_CANNOT_RERUN");
  await check(() => pair({ project: P2 }), "NO_SUCH_PROJECT", false);
  /* invited, not joined: the project is seen, and the work in it is not hers (membership R55) */
  await check(() => pair({}, "erin"), "PROJECT_ACT_NOT_A_PARTICIPANT", false);
  const absentRef = await check(() => pair({ source_finding: undefined }), "NO_SUCH_SOURCE_FINDING");
  assert.match(absentRef.detail, /source_finding/);
  await check(() => pair({ source_finding: "not a reference" }), "NO_SUCH_SOURCE_FINDING");
  /* a project declared no rerun of that import, and of that edition */
  await check(() => pair({ project: P3 }), "NOT_A_RERUN");
  await check(() => pair({ edition: 2 }), "NOT_A_RERUN");
  await check(() => pair({ edition: "latest" }), "NOT_A_RERUN");   /* an edition that is no number is not the latest by default */
  /* the declared edition holds no such finding */
  const lacking = await check(() => pair({ source_finding: importedFindingRef(a.import, "INQ-2026-9999-nothing") }), "NO_SUCH_SOURCE_FINDING");
  assert.match(lacking.detail, /source_finding/);
  /* an own finding that is absent, of another project, and one that is no finding at all, alike */
  const absentOwn = await check(() => pair({ own_finding: undefined }), "NO_SUCH_OWN_FINDING");
  assert.match(absentOwn.detail, /own_finding/);
  const foreign = await check(() => pair({ own_finding: FOREIGN }), "NO_SUCH_OWN_FINDING");
  const missing = await check(() => pair({ own_finding: "INQ-9999" }), "NO_SUCH_OWN_FINDING");
  assert.deepEqual({ ...foreign, own_finding: null }, { ...missing, own_finding: null }, "another project's finding is answered as an absent one");
  await check(() => pair({ own_finding: P1 }), "NO_SUCH_OWN_FINDING");
  /* the control: the same call with an own finding of the project is accepted */
  assert.equal((await pair()).ok, true);
});

/* ================================================================ R31 */

test("R31 a rerun with two source findings, one paired and disagreeing: both pairs, agree false and the differing statements; the other paired false", async () => {
  const { w, a, start, pair, read } = await setup();
  await start();
  w.lens.project.set(P1, [stmt(S1, "scrutiny", "official statements", PRINTED[0].text), stmt(S9, "inference", "silence", "Silence is not consent.")]);
  await pair();                                 /* F1 (capture C, connection C as published) with OWN1 (B, C) */
  const r = await read();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const run = r.reruns[0];
  assert.deepEqual([run.import, run.edition, run.project, run.declared_by], [a.import, 1, P1, "alice"]);
  assert.deepEqual(run.findings.map((f) => f.finding), [F1, F2, F3], "in the edition's order");
  const f1 = pairs(r, F1);
  assert.deepEqual(f1.source.pair, { capture: g("C"), connection: g("C") }, "the source's pair as published");
  assert.deepEqual(rows(f1.source.lens_statements), [{ kind: "scrutiny", subject: "official statements", text: PRINTED[0].text }], "its published lens statements");
  assert.equal(f1.paired, true);
  assert.deepEqual(f1.pairings.map((x) => [x.own_finding, x.pair, x.agree]), [[OWN1, { capture: g("B"), connection: g("C") }, false]]);
  assert.equal(pairs(r, F2).paired, false);
  assert.deepEqual(pairs(r, F2).pairings, []);
  /* the lens difference, once per rerun: the edition prints S1 and S2, this project's lens holds S1 and S9 */
  assert.deepEqual(rows(run.lens_difference.only_source), [{ kind: "pattern", subject: "late filings", text: PRINTED[1].text }]);
  assert.deepEqual(rows(run.lens_difference.only_own), [{ kind: "inference", subject: "silence", text: "Silence is not consent." }]);
  assert.equal(run.lens_difference.shared, 1);
  assert.deepEqual(w.lens.manifestAsked.at(-1), { scope: "project", scopeId: P1, viewer: V("alice") }, "the project's own effective lens, at project scope");
  /* the honesty: the disagreement is the lens difference and the pairings, not a cause; the checker's limit beside */
  assert.equal(r.disagreement_note, RERUN_DISAGREEMENT);
  assert.equal(r.limit, LENS_LIMIT);
  assert.equal(r.limit, word("case-checker.lens_limit_statement"));
});

test("R31 control: equal lens statements leave lens_difference empty, and an unrated own finding agrees undetermined", async () => {
  const { w, start, pair, read, a } = await setup();
  await start();
  w.lens.project.set(P1, PRINTED.map((p) => stmt(p.id, p.kind, p.subject, p.text)));
  await pair({ own_finding: OWN3 });
  const run = (await read()).reruns[0];
  assert.deepEqual(run.lens_difference, { only_source: [], only_own: [], shared: 2 });
  assert.equal(pairs({ reruns: [run] }, F1).pairings[0].agree, "undetermined");
  /* and equal pairs agree true: own finding graded C, C like the source's F1 */
  w.pairs.set(OWN2, { ok: true, bundleId: OWN2, ...own("C", "C") });
  await pair({ own_finding: OWN2 });
  const agree = pairs(await read(), F1).pairings.find((x) => x.own_finding === OWN2);
  assert.equal(agree.agree, true);
});

test("R31 a lens that cannot be read leaves lens_difference null with its sentence, never an empty difference; no manifest in force is the project's lens with no statement", async () => {
  const { w, start, read } = await setup();
  await start();
  w.lens.project.set(P1, null);
  const run = (await read()).reruns[0];
  assert.equal(run.lens_difference, null);
  assert.equal(typeof run.lens_difference_stated, "string");
  /* no manifest in force at project scope: the project's lens has no statement, so the edition's two are the source's alone */
  w.lens.project.set(P1, false);
  const none = (await read()).reruns[0].lens_difference;
  assert.equal(none.only_source.length, 2);
  assert.deepEqual([none.only_own, none.shared], [[], 0]);
  assert.equal(typeof REGRADE_NO_OWN_LENS, "string");
});

test("R31 a viewer who does not see the project at full, an absent id and an id that is no project are answered NO_SUCH_PROJECT alike; a project with no rerun answers an empty list", async () => {
  const { w, start, read } = await setup();
  await start();
  const unseen = await read({ project: P2 });
  assert.equal(unseen.code, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...unseen, project: null }, { ...(await read({ project: "PRJ-9999" })), project: null });
  assert.equal((await read({ project: OWN1 })).code, "NO_SUCH_PROJECT");
  assert.equal((await read({}, "dave")).code, "NO_SUCH_PROJECT");
  const empty = await read({ project: P3 });
  assert.deepEqual([empty.ok, empty.reruns], [true, []]);
  assert.equal((await read({}, "bob")).ok, true, "a participant sees it");
});

/* ================================================================ R32 */

test("R32 a rerun and a pairing leave every imported edition's bytes, every acceptance and every finding of the project unchanged, and write no bundle", async () => {
  const { w, a, start, pair } = await setup();
  w.ci.acceptImported({ import: a.import, edition: 1, findings: [F1], checked: "the passages", reason: "they hold", by: V("alice"), viewer: V("alice") });
  const tables = CASE_IMPORT_TABLES.filter((t) => t !== "case_import_reruns" && t !== "case_import_rerun_pairs");
  const snap = () => Object.fromEntries([...tables, "bundles", "project_participants", "group_strength_bar"].map((t) => [t, w.snapshot(t)[t]]));
  const before = snap();
  const pairsBefore = JSON.stringify([...w.pairs]);
  await start();
  await pair();
  await pair({ withdraw: true });
  assert.deepEqual(snap(), before, "imports, acceptances, bundles and the roster are byte-identical");
  assert.equal(JSON.stringify([...w.pairs]), pairsBefore, "the own finding keeps its own grade: a pairing never feeds strength");
  assert.equal(w.ci.acceptanceOf({ import: a.import, edition: 1, finding: F1 }).by, "alice");
  assert.equal(w.count("case_import_reruns"), 1);
  /* the two tables are the import's own record: declared whole to purge, cleared with it */
  for (const t of ["case_import_reruns", "case_import_rerun_pairs"]) assert.ok(CASE_IMPORT_TABLES.includes(t) && caseImportOwns(t), t);
});

test("R32 the whole-store purge clears the rerun tables with the import", async () => {
  const w = seeded({ minimal: true });
  w.script.set(F1, { role: "load_bearing", result: "recreated", pair: { capture: g("C"), connection: g("C") } });
  const a = await imp(w, caseFile({ apps: APPS, printedLens: PRINTED }));
  w.project(P1, { owner: "alice" });
  w.ownFinding(P1, OWN1, own("B", "C"));
  assert.equal((await door(w, "rerunstart", { viewer: V("alice"), by: V("alice"), project: P1, import: a.import, edition: 1 })).ok, true);
  assert.equal((await door(w, "rerunpair", { viewer: V("alice"), by: V("alice"), project: P1, source_finding: importedFindingRef(a.import, F1), own_finding: OWN1 })).ok, true);
  const report = w.record.purge({});
  for (const t of ["case_import_reruns", "case_import_rerun_pairs"]) {
    assert.equal(w.count(t), 0, `${t} cleared`);
    assert.ok(t in report.removed, `${t} named in the purge's report`);
  }
});
