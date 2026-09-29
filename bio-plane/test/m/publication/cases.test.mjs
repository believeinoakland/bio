/* publication — the reads later modules page through: a case's cited parts (R41) and the ratified cases (R43), which
   reevaluation's R14 case half reads through its R26 registration, and the captures published findings rest on (R42),
   which monitoring R33 follows. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, sha, SIG, NOW } from "./fixture.mjs";
import { CITED_PARTS_MAX, RATIFIED_CASES_MAX, RESTING_CAPTURES_MAX } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", H = "INQ-2026-0003";
const DOC1 = "INFO-2026-0001-minutes", DOC2 = "INFO-2026-0002-budget", DOC3 = "INFO-2026-0003-memo",
      DOC4 = "INFO-2026-0004-parent";
const captureOf = (id) => sha(`the text of ${id}`);

/* CASE-2026-0001 edition 1 over F and G at their pins, both published, so the edition is ratified. */
function ratified() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F); w.inquiry(G);
  const roles = [{ target: F, version_sha: w.head(F) }, { target: G, version_sha: w.head(G) }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  w.signCase("CASE-2026-0001", 1, { project: proj,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
  w.signFinding(F, { sig: SIG(2) });
  w.signFinding(G, { sig: SIG(3) });
  return { w, proj, roles };
}

test("R41 caseCitedParts answers a ratified case edition's members at their pins, the latest ratified edition by default, with its owning project, bounded and viewer-free", () => {
  const { w, proj, roles } = ratified();
  const pins = roles.map((r) => ({ bundle_id: r.target, bundle_sha: r.version_sha }));
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001" }),
                   { ok: true, case: "CASE-2026-0001", edition: 1, project: proj, parts: pins, limit: CITED_PARTS_MAX,
                     truncated: false });
  assert.equal(CITED_PARTS_MAX, 1000);
  /* a later edition: while unratified the latest ratified one answers; once ratified it does */
  w.prepare("CASE-2026-0001", 2, { project: proj, roles: [roles[1]] });
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES ('CASE-2026-0001', 2, ?)`, NOW);
  w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                 VALUES ('CASE-2026-0001', 2, 0, ?, ?, 'load_bearing')`, G, roles[1].version_sha);
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001" }).edition, 1);
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: 2 }).reason, "NO_SUCH_CASE_EDITION");
  w.st.sql.exec(`UPDATE published_cases SET ratified_at=? WHERE edition=2`, NOW);
  assert.deepEqual([w.p.caseCitedParts({ case: "CASE-2026-0001" }).edition, w.p.caseCitedParts({ case: "CASE-2026-0001" }).parts],
                   [2, [pins[1]]]);
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: 1 }).parts, pins, "an earlier ratified edition by name");
  assert.deepEqual(w.p.caseCitedParts({ caseId: "CASE-2026-0001", edition: "1" }).parts, pins);
  /* a member rostered with no pin has no capture to grade and is no part */
  w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                 VALUES ('CASE-2026-0001', 1, 5, 'INQ-2020-0001-legacy', NULL, NULL)`);
  assert.deepEqual(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: 1 }).parts, pins);
  /* a case older than DEC-72 owns no project: null */
  w.st.sql.exec(`DELETE FROM cases`);
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001" }).project, null);
  /* no case named; a case never ratified; an edition that is not a number */
  assert.equal(w.p.caseCitedParts({}).reason, "NO_ID");
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0404" }).reason, "NO_SUCH_CASE_EDITION");
  assert.equal(w.p.caseCitedParts({ case: "CASE-2026-0001", edition: "x" }).reason, "NO_SUCH_CASE_EDITION");
  /* at most CITED_PARTS_MAX, and says so */
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES ('CASE-2026-0009', 1, ?, ?)`, NOW, NOW);
  for (let i = 0; i <= CITED_PARTS_MAX; i++)
    w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                   VALUES ('CASE-2026-0009', 1, ?, ?, ?, 'supporting')`, i, `INQ-2026-${String(i).padStart(5, "0")}`, `v${i}`);
  const big = w.p.caseCitedParts({ case: "CASE-2026-0009" });
  assert.deepEqual([big.parts.length, big.truncated, big.parts[0].bundle_id], [CITED_PARTS_MAX, true, "INQ-2026-00000"]);
});

test("R41 R43 are registered together as reevaluation's registerCaseParts (its R26): one registration, the case half reads them", () => {
  const { w } = ratified();
  const again = w.r.registerCaseParts("someone-else", { parts: () => null, cases: () => ({ cases: [], cursor: null }) });
  assert.equal(again.ok, false);
  assert.equal(again.reason, "LISTENER_DECLARED", "publication already holds the one registration");
  const sweep = w.r.raiseNotices({});
  assert.equal(sweep.ok, true);
  assert.equal("case_parts_absent" in sweep, false, "the case half found the registration");
  assert.ok(sweep.examined >= 2, "each ratified case's cited parts were read");
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
