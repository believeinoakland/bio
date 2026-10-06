/* publication — the editions a finding is published in (R37) and the pinning reads ratification's scope arms use (R38).
   The case relation and the revision flags (R4–R6) moved to `case-tensions` (its R1–R3, T33-62) with their tests.
   Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, NOW } from "./fixture.mjs";
import { RESTING_PINS_MAX } from "../../../src/publication/index.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: r.role ?? "load_bearing" }));

/* A ratified case edition (CASE-2026-0001, 1) over F at its pin, published. */
function ratified({ strength = [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, strength });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  return { w, proj, pin, roles };
}

test("R37 publishedEditionsOf answers every ratified case edition naming a finding, with its pin, role and frozen pair per axis, never composed", () => {
  const { w, proj, pin } = ratified();
  assert.equal(w.p.publishedEditionsOf({ finding: "" }).reason, "NO_ID");
  assert.deepEqual(w.p.publishedEditionsOf({ finding: G }).items, []);
  const got = w.p.publishedEditionsOf({ finding: F });
  assert.deepEqual(got.items, [{ case: "CASE-2026-0001", edition: 1, project: proj, version_sha: pin, role: "load_bearing",
    strength: { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } } }]);
  assert.deepEqual(w.p.publishedEditionsOf({ finding: F, version: "0".repeat(64) }).items, []);
  assert.deepEqual(w.p.publishedEditionsOf({ finding: F, project: "PROJ-OTHER" }).items, []);
  assert.equal(w.p.publishedEditionsOf({ finding: F, version: pin, project: proj }).items.length, 1);
  /* an unsigned preparation is never an edition here */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.p.publishedEditionsOf({ finding: F }).items.length, 1);
  /* a case older than DEC-72 answers its project as null */
  w.st.sql.exec(`DELETE FROM cases`);
  assert.equal(w.p.publishedEditionsOf({ finding: F }).items[0].project, null);
});

test("R38 pinnedCaseEditionsOf, ratifiedFindingsRestingOn and caseClaimsOf answer the ratified pins, what rests on a bundle and the cases a finding is in", () => {
  const { w, proj, pin } = ratified();
  assert.deepEqual(w.p.pinnedCaseEditionsOf(F, pin), [{ case_id: "CASE-2026-0001", edition: 1, role: "load_bearing" }]);
  assert.deepEqual(w.p.pinnedCaseEditionsOf(F, "0".repeat(64)), []);
  /* the published graph at the PINNED bytes says F rests on DOC, a served (cites) edge */
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(DOC),
    { findings: [{ case_id: "CASE-2026-0001", finding: F, project: proj }], limit: RESTING_PINS_MAX, cursor: null });
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(G), { findings: [], limit: RESTING_PINS_MAX, cursor: null });
  assert.deepEqual(w.p.caseClaimsOf(F), ["CASE-2026-0001"]);
  assert.deepEqual(w.p.caseClaimsOf("NOPE"), []);
  /* prepared, not yet pinned: the claim is the unsigned preparation */
  w.inquiry(G);
  w.prepare("CASE-2026-0003", 1, { project: proj, roles: [{ target: G, version_sha: w.head(G) }] });
  assert.deepEqual(w.p.caseClaimsOf(G), ["CASE-2026-0003"]);
});

/* R38 (N308): ratifiedFindingsRestingOn reads by the pin cursor. A world of `n` ratified cases, each over its own finding
   resting on DOC (a served cites edge at the pinned bytes), plus one unsigned preparation that never counts. */
function resting(n) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  const out = [];
  for (let i = 1; i <= n; i++) {
    const f = `INQ-2026-${String(i).padStart(4, "0")}`, c = `CASE-2026-${String(i).padStart(4, "0")}`;
    w.inquiry(f, { legs: [{ target: DOC }] });
    const roles = [{ target: f, version_sha: w.head(f) }];
    w.prepare(c, 1, { project: proj, roles });
    assert.equal(w.signCase(c, 1, { project: proj, roster: roster(roles) }).ok, true);
    out.push({ case_id: c, finding: f, project: proj, pin: roles[0].version_sha });
  }
  return { w, proj, out };
}
const follow = (w, id, limit) => {
  const pages = [];
  let after = null;
  do { const r = w.p.ratifiedFindingsRestingOn(id, { after, limit }); pages.push(r); after = r.cursor; } while (after);
  return pages;
};

test("R38 ratifiedFindingsRestingOn pages by the pin cursor <case>#<member>#<sha>, in case, member and sha order, reading at most limit pins", () => {
  const { w, out } = resting(3);
  const want = out.map(({ case_id, finding, project }) => ({ case_id, finding, project }));
  /* one page at the default answers every resting finding, cursor null */
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(DOC), { findings: want, limit: RESTING_PINS_MAX, cursor: null });
  /* at a limit of 1, each page reads one pin, its cursor that pin, and the last page's cursor is null */
  const pages = follow(w, DOC, 1);
  assert.deepEqual(pages.map((p) => p.findings), want.map((x) => [x]));
  assert.deepEqual(pages.map((p) => p.cursor),
    [`${out[0].case_id}#${out[0].finding}#${out[0].pin}`, `${out[1].case_id}#${out[1].finding}#${out[1].pin}`, null]);
  assert.ok(pages.every((p) => p.limit === 1));
  /* at limit 2: two pins, then the third */
  assert.deepEqual(follow(w, DOC, 2).map((p) => p.findings.length), [2, 1]);
  /* exactly at the limit (3 pins, limit 3): one page, no cursor */
  assert.equal(w.p.ratifiedFindingsRestingOn(DOC, { limit: 3 }).cursor, null);
  /* after the last pin: nothing more */
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(DOC, { after: pages[1].cursor }),
    { findings: [want[2]], limit: RESTING_PINS_MAX, cursor: null });
  /* a case id alone starts after that case */
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(DOC, { after: out[0].case_id }).findings, want.slice(1));
  /* limit clamped to 1–1,000, 1,000 by default, floored */
  for (const [asked, got] of [[0, 1000], [-3, 1], [9999, 1000], ["x", 1000], [2.7, 2], [null, 1000]])
    assert.equal(w.p.ratifiedFindingsRestingOn(DOC, { limit: asked }).limit, got, `limit ${asked}`);
  /* the bundle asked about is not a pin of its own: F rests on nothing here */
  assert.deepEqual(w.p.ratifiedFindingsRestingOn(out[0].finding, { limit: 1 }).findings, []);
});

test("R38 a page may answer no finding while its cursor is set; the caller follows it to the finding past it", () => {
  const { w, proj, out } = resting(1);
  /* two ratified pins sorting BEFORE the resting one, whose bytes rest on nothing */
  for (const [c, f] of [["CASE-2026-0000A", "INQ-2026-9001"], ["CASE-2026-0000B", "INQ-2026-9002"]]) {
    w.inquiry(f);
    const roles = [{ target: f, version_sha: w.head(f) }];
    w.prepare(c, 1, { project: proj, roles });
    w.signCase(c, 1, { project: proj, roster: roster(roles) });
  }
  const first = w.p.ratifiedFindingsRestingOn(DOC, { limit: 2 });
  assert.deepEqual(first.findings, [], "two pins read, neither rests on DOC");
  assert.equal(first.cursor, `CASE-2026-0000B#INQ-2026-9002#${w.head("INQ-2026-9002")}`);
  const second = w.p.ratifiedFindingsRestingOn(DOC, { after: first.cursor, limit: 2 });
  assert.deepEqual(second, { findings: [{ case_id: out[0].case_id, finding: out[0].finding, project: proj }], limit: 2, cursor: null });
});

test("R38 at its ceiling: 1,001 pins answer 1,000 on the first page with a cursor, and the last on the next; it writes nothing", () => {
  const w = world();
  w.member("olive");
  w.doc(DOC);
  /* pins whose bytes this store cannot read rest on nothing (undetermined is never admitted), so they bound the page alone */
  for (let i = 0; i < RESTING_PINS_MAX + 1; i++) {
    const c = `CASE-${String(i).padStart(5, "0")}`;
    w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES (?, 1, ?)`, c, NOW);
    w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                   VALUES (?, 1, 0, 'INQ-X', ?, 'load_bearing')`, c, "a".repeat(64));
  }
  /* a second edition of one case pinning the same sha is the same pin, never a second */
  w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES ('CASE-00000', 2, ?)`, NOW);
  w.st.sql.exec(`INSERT INTO published_case_members (case_id, edition, ord, bundle_id, version_sha, role)
                 VALUES ('CASE-00000', 2, 0, 'INQ-X', ?, 'load_bearing')`, "a".repeat(64));
  const before = w.snapshot();
  const first = w.p.ratifiedFindingsRestingOn(DOC);
  assert.deepEqual([first.findings.length, first.limit, first.cursor], [0, 1000, `CASE-00999#INQ-X#${"a".repeat(64)}`]);
  const second = w.p.ratifiedFindingsRestingOn(DOC, { after: first.cursor });
  assert.deepEqual([second.findings.length, second.cursor], [0, null]);
  assert.deepEqual(w.snapshot(), before, "viewer-free, it writes nothing");
});
