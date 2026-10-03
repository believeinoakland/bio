/* publication — the reads later modules page through: a case's cited parts (R41) and the ratified cases (R43), which
   reevaluation's R14 case half reads through its R26 registration, and the captures published findings rest on (R42),
   which monitoring R33 follows. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, sha, SIG, NOW } from "./fixture.mjs";
import { CITED_PARTS_MAX, RATIFIED_CASES_MAX, RESTING_CAPTURES_MAX, RESTING_FINDINGS_PER_CAPTURE,
         RESTING_FINDINGS_PER_PAGE } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", H = "INQ-2026-0003";
const DOC1 = "INFO-2026-0001-minutes", DOC2 = "INFO-2026-0002-budget", DOC3 = "INFO-2026-0003-memo",
      DOC4 = "INFO-2026-0004-parent";
const captureOf = (id) => sha(`the text of ${id}`);

/* CASE-2026-0001 edition 1 over F and G at their pins, both published, so the edition is ratified; its signed document
   cites `citations`. */
function ratified({ citations = [], format = undefined } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F); w.inquiry(G);
  const roles = [{ target: F, version_sha: w.head(F) }, { target: G, version_sha: w.head(G) }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, citations, ...(format ? { format } : {}) });
  /* an older format is signed as a store signed it before T28 (R58 refuses committing one now) */
  (format ? w.signLegacy : w.signCase)("CASE-2026-0001", 1, { project: proj,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
  w.signFinding(F, { sig: SIG(2) });
  w.signFinding(G, { sig: SIG(3) });
  return { w, proj, roles };
}
const C1 = sha("capture one"), C2 = sha("capture two"), C3 = sha("capture three");

test("R41 caseCitedParts answers the documents a ratified case edition's signed citations pin to a capture, the latest ratified edition by default, with its owning project, bounded and viewer-free; never a member finding", () => {
  const { w, proj, roles } = ratified({ citations: [
    { target: DOC1, version: "pinned", capture: C1 }, { target: DOC2, version: "only_capture", capture: C2 },
    { target: DOC3, version: "undetermined", capture: null }, { target: DOC4, version: "no_capture", capture: null },
    { target: F, version: "no_bytes", capture: null }, { target: DOC1, version: "pinned", capture: C1 },
    { target: DOC1, version: "only_capture", capture: C3 }] });
  const parts = [{ bundle_id: DOC1, capture_sha: C1 }, { bundle_id: DOC2, capture_sha: C2 }, { bundle_id: DOC1, capture_sha: C3 }];
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001" }),
                   { ok: true, case: "CASE-2026-0001", edition: 1, project: proj, parts, limit: CITED_PARTS_MAX,
                     truncated: false }, "each (document, capture) once, in the document's order; nothing uncaptured, no finding");
  assert.equal(CITED_PARTS_MAX, 1000);
  for (const r of roles) assert.equal(JSON.stringify(w.p.caseCitedParts({ case: "CASE-2026-0001" }).parts).includes(r.target), false);
  /* a later edition: while unratified the latest ratified one answers; once signed and ratified, it does */
  w.prepare("CASE-2026-0001", 2, { project: proj, roles: [roles[1]], citations: [{ target: DOC3, version: "pinned", capture: C3 }] });
  w.signCase("CASE-2026-0001", 2, { project: proj, roster: [{ bundle_id: G, version_sha: roles[1].version_sha }], sig: SIG(8) });
  w.st.sql.exec(`UPDATE published_cases SET ratified_at=NULL WHERE edition=2`);
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001" }).edition, 1);
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: 2 }).reason, "NO_SUCH_CASE_EDITION");
  w.st.sql.exec(`UPDATE published_cases SET ratified_at=? WHERE edition=2`, NOW);
  const two = w.p.caseCitedParts({ case: "CASE-2026-0001" });
  assert.deepEqual([two.edition, two.parts], [2, [{ bundle_id: DOC3, capture_sha: C3 }]]);
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: 1 }).parts, parts, "an earlier ratified edition by name");
  assert.deepEqual(w.p.caseCitedParts({ caseId: "CASE-2026-0001", edition: "1" }).parts, parts);
  /* a case older than DEC-72 owns no project: null */
  w.st.sql.exec(`DELETE FROM cases`);
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001" }).project, null);
  /* no case named; a case never ratified; an edition that is not a number */
  assert.equal(w.p.caseCitedParts({}).reason, "NO_ID");
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0404" }).reason, "NO_SUCH_CASE_EDITION");
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: "x" }).reason, "NO_SUCH_CASE_EDITION");
});

test("R41 a document older than /4 signed no citations, so it has no parts; at most CITED_PARTS_MAX, and the answer says so", () => {
  const { w } = ratified({ format: "bio-case-document/3", citations: [{ target: DOC1, version: "pinned", capture: C1 }] });
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001" }).parts, []);
  const many = Array.from({ length: CITED_PARTS_MAX + 1 }, (_, i) => ({ target: `INFO-2026-${String(i).padStart(5, "0")}`,
                                                                    version: "pinned", capture: sha(`c${i}`) }));
  const { w: w2 } = ratified({ citations: many });
  const big = w2.p.caseCitedParts({ case: "CASE-2026-0001" });
  assert.deepEqual([big.parts.length, big.truncated, big.parts[0]], [CITED_PARTS_MAX, true,
                   { bundle_id: "INFO-2026-00000", capture_sha: sha("c0") }]);
});

test("R41 R43 are registered together as reevaluation's registerCaseParts (its R26): one registration, the case half reads them", () => {
  const { w } = ratified();
  const again = w.r.registerCaseParts("someone-else", { parts: () => null, cases: () => ({ cases: [], cursor: null }) });
  assert.equal(again.ok, false);
  assert.equal(again.reason, "LISTENER_DECLARED", "publication already holds the one registration");
  const sweep = w.r.raiseNotices({});
  assert.equal(sweep.ok, true);
  assert.equal("case_parts_absent" in sweep, false, "the case half found the registration");
});

test("R43 ratifiedCases answers the cases holding a ratified edition, in id order after `after`, at most `limit`, the cursor null exactly when no case follows", () => {
  const { w } = ratified();
  const add = (id, ratifiedAt, edition = 1) => w.st.sql.exec(
    `INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES (?, ?, ?, ?)`, id, edition, NOW, ratifiedAt);
  add("CASE-2026-0005", NOW); add("CASE-2026-0003", NOW); add("CASE-2026-0003", null, 2); add("CASE-2026-0004", null);
  add("CASE-2026-0002", NOW); add("CASE-2026-0002", NOW, 2);
  const all = ["CASE-2026-0001", "CASE-2026-0002", "CASE-2026-0003", "CASE-2026-0005"];
  const before = w.snapshot();
  assert.deepEqual(w.p.ratifiedCases({}), { ok: true, cases: all, limit: RATIFIED_CASES_MAX, cursor: null });
  assert.equal(RATIFIED_CASES_MAX, 1000);
  /* followed by its cursor to the end, a page at a time */
  const seen = [];
  let after = null, pages = 0;
  do {
    const page = w.p.ratifiedCases({ after, limit: 3 });
    seen.push(...page.cases);
    after = page.cursor;
    pages++;
  } while (after !== null && pages < 10);
  assert.deepEqual([seen, pages], [all, 2]);
  assert.deepEqual(w.p.ratifiedCases({ limit: 3 }).cursor, "CASE-2026-0003");
  assert.deepEqual(w.p.ratifiedCases({ limit: 4 }).cursor, null, "a page that ends exactly at the last case has no cursor");
  assert.deepEqual(w.p.ratifiedCases({ after: "CASE-2026-0003" }).cases, ["CASE-2026-0005"]);
  assert.deepEqual(w.p.ratifiedCases({ after: 7 }).cases, all, "an `after` that is no case id starts at the beginning");
  for (const [asked, got] of [[0, 1000], [-3, 1], [5000, 1000], ["x", 1000], [2.7, 2], [null, 1000]])
    assert.equal(w.p.ratifiedCases({ limit: asked }).limit, got, `limit ${asked}`);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
});

/* F rests on DOC1 (published) and DOC2 (not yet published: held), names DOC4 as its division parent; F is in a
   ratified case. H, published in no case, rests on DOC3. */
function resting() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  for (const d of [DOC1, DOC2, DOC3, DOC4]) w.doc(d);
  w.signFinding(DOC1, { sig: SIG(4) });
  w.inquiry(F, { legs: [{ target: DOC1 }, { target: DOC2 }] });
  const roles = [{ target: F, version_sha: w.head(F) }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: roles[0].version_sha }] });
  w.signFinding(F, { sig: SIG(5), edges: [{ to: DOC1, kind: "cites", disclosure: "serve" },
                                           { to: DOC2, kind: "cites", disclosure: "serve" },
                                           { to: DOC4, kind: "division_parent", disclosure: "name" }] });
  w.inquiry(H, { legs: [{ target: DOC3 }] });
  w.signFinding(H, { sig: SIG(6), edges: [{ to: DOC3, kind: "cites", disclosure: "serve" }] });
  return { w, proj, roles };
}

test("R42 restingCapturesOf answers each capture a ratified finding's published basis rests on, served or held, with the findings and their owning projects, in capture order", () => {
  const { w, proj, roles } = resting();
  const byOrder = (xs) => [...xs].sort();
  const got = w.p.restingCapturesOf({});
  assert.deepEqual(got.captures.map((c) => c.capture_sha), byOrder([captureOf(DOC1), captureOf(DOC2)]),
                   "DOC1 served, DOC2 held; never DOC3 (its finding is in no case) nor DOC4 (a name, not a rest)");
  for (const c of got.captures) assert.deepEqual(c.findings, [{ bundle_id: F, projects: [proj] }]);
  assert.deepEqual([got.limit, got.truncated, got.cursor], [RESTING_CAPTURES_MAX, false, null]);
  assert.equal(RESTING_CAPTURES_MAX, 1000);
  /* once DOC2 is published the held reference is a serve edge, and it still answers once */
  w.signFinding(DOC2, { sig: SIG(7) });
  assert.deepEqual(w.p.restingCapturesOf({}).captures.map((c) => c.capture_sha), byOrder([captureOf(DOC1), captureOf(DOC2)]));
  /* a second case of another project pinning F: each capture names both projects; a pre-DEC-72 case, null */
  const other = w.project("Roads", "olive");
  w.prepare("CASE-2026-0002", 1, { project: other, roles });
  w.signCase("CASE-2026-0002", 1, { project: other, roster: [{ bundle_id: F, version_sha: roles[0].version_sha }] });
  assert.deepEqual(w.p.restingCapturesOf({}).captures[0].findings, [{ bundle_id: F, projects: byOrder([proj, other]) }]);
  w.st.sql.exec(`DELETE FROM cases WHERE case_id='CASE-2026-0002'`);
  assert.deepEqual(w.p.restingCapturesOf({}).captures[0].findings[0].projects, [null, proj]);
  /* a capture homed on a bundle that no longer exists rests nothing */
  w.st.sql.exec(`UPDATE register SET bundle_id='GONE-1' WHERE capture_sha=?`, captureOf(DOC2));
  assert.deepEqual(w.p.restingCapturesOf({}).captures.map((c) => c.capture_sha), [captureOf(DOC1)]);
});

test("R42 restingCapturesOf pages by capture after `after`, limit clamped to 1–1,000, its cursor followed to the end, writing nothing", () => {
  const { w } = resting();
  /* many captures homed on DOC1 */
  const extra = Array.from({ length: 25 }, (_, i) => sha(`capture ${i}`));
  for (const c of extra)
    w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'utf8', 1, ?)`,
                  c, DOC1, `snapshots/${c}.txt`, NOW);
  const all = [...extra, captureOf(DOC1), captureOf(DOC2)].sort();
  const before = w.snapshot();
  const seen = [];
  let after = null, pages = 0, last = null;
  do {
    last = w.p.restingCapturesOf({ after, limit: 7 });
    assert.ok(last.captures.length <= 7);
    seen.push(...last.captures.map((c) => c.capture_sha));
    assert.equal(last.truncated, last.cursor !== null);
    after = last.cursor;
    pages++;
  } while (after !== null && pages < 20);
  assert.deepEqual([seen, pages], [all, 4]);
  assert.equal(w.p.restingCapturesOf({ limit: 27 }).cursor, null, "a page ending at the last capture has no cursor");
  assert.equal(w.p.restingCapturesOf({ after: all[25] }).captures.length, 1);
  for (const [asked, got] of [[0, 1000], [-3, 1], [5000, 1000], ["x", 1000], [2.7, 2]])
    assert.equal(w.p.restingCapturesOf({ limit: asked }).limit, got, `limit ${asked}`);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
});

/* N315: `n` ratified findings resting on DOC1 (a served edge each, a published edition each, rostered by one ratified
   case edition of PROJ-1), and `captures` more captures homed on DOC1 beside its own. Written as the rows R22 writes. */
function crowded(n, captures = 0) {
  const w = world();
  w.member("olive");
  w.doc(DOC1);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0001', 'PROJ-1', ?)`, NOW);
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES ('CASE-2026-0001', 1, ?, ?)`, NOW, NOW);
  const ids = Array.from({ length: n }, (_, i) => `INQ-2026-${String(i + 1).padStart(5, "0")}`);
  ids.forEach((f, i) => {
    w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                   VALUES ('CASE-2026-0001', 1, ?, ?, ?, 'load_bearing')`, i, f, sha(f));
    w.st.sql.exec(`INSERT INTO published_bundles (bundle_id, edition, bundle_sha, ratified_at, attestor_key, gate_version, sig_armored)
                   VALUES (?, 1, ?, ?, 'k', 'g', 's')`, f, sha(f), NOW);
    w.st.sql.exec(`INSERT INTO published_edges (from_bundle, to_bundle, kind, disclosure, published) VALUES (?, ?, 'cites', 'serve', ?)`,
                  f, DOC1, NOW);
  });
  const extra = Array.from({ length: captures }, (_, i) => sha(`capture ${i}`));
  for (const c of extra)
    w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'utf8', 1, ?)`,
                  c, DOC1, `snapshots/${c}.txt`, NOW);
  return { w, ids, all: [...extra, captureOf(DOC1)].sort() };
}

test("R42 each capture answers at most 200 of its resting findings, in finding id order, findings_truncated stating when more rest on it", () => {
  assert.equal(RESTING_FINDINGS_PER_CAPTURE, 200);
  /* exactly at the bound: all 200, not truncated */
  const at = crowded(200);
  const one = at.w.p.restingCapturesOf({}).captures;
  assert.equal(one.length, 1);
  assert.deepEqual(one[0].findings.map((f) => f.bundle_id), at.ids);
  assert.equal(one[0].findings_truncated, false);
  assert.deepEqual(one[0].findings[0].projects, ["PROJ-1"]);
  /* one past it: the first 200 by id, and it says more rest on it */
  const over = crowded(201);
  const cut = over.w.p.restingCapturesOf({}).captures[0];
  assert.deepEqual(cut.findings.map((f) => f.bundle_id), over.ids.slice(0, 200));
  assert.equal(cut.findings_truncated, true);
  /* a finding several projects own still counts once toward the bound */
  over.w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES ('CASE-2026-0002', 'PROJ-2', ?)`, NOW);
  over.w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES ('CASE-2026-0002', 1, ?, ?)`, NOW, NOW);
  over.w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                      SELECT 'CASE-2026-0002', 1, ord, bundle_id, version_sha, role FROM published_case_members WHERE case_id='CASE-2026-0001'`);
  const both = over.w.p.restingCapturesOf({}).captures[0];
  assert.equal(both.findings.length, 200);
  assert.deepEqual(both.findings[0].projects, ["PROJ-1", "PROJ-2"]);
  assert.equal(both.findings_truncated, true);
});

test("R42 a page answers at most 10,000 resting findings, ending at the last capture answered whole, its cursor followed on", () => {
  assert.equal(RESTING_FINDINGS_PER_PAGE, 10000);
  /* 51 captures of 200 findings each: 10,200 > 10,000, so the page ends after the 50th */
  const { w, all } = crowded(200, 50);
  assert.equal(all.length, 51);
  const before = w.snapshot();
  const first = w.p.restingCapturesOf({});
  assert.equal(first.captures.length, 50);
  assert.equal(first.captures.reduce((n, c) => n + c.findings.length, 0), 10000);
  assert.ok(first.captures.every((c) => c.findings.length === 200 && c.findings_truncated === false), "each answered whole");
  assert.deepEqual([first.truncated, first.cursor], [true, all[49]]);
  const second = w.p.restingCapturesOf({ after: first.cursor });
  assert.deepEqual([second.captures.map((c) => c.capture_sha), second.truncated, second.cursor], [[all[50]], false, null]);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* exactly at the bound: 50 captures of 200 is 10,000, one page and no cursor */
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha=?`, all[50]);
  const whole = w.p.restingCapturesOf({});
  assert.deepEqual([whole.captures.length, whole.truncated, whole.cursor], [50, false, null]);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'x', 'utf8', 1, ?)`,
                all[50], DOC1, NOW);
  /* a smaller `limit` still bounds the page first */
  assert.deepEqual(w.p.restingCapturesOf({ limit: 3 }).captures.map((c) => c.capture_sha), all.slice(0, 3));
});
