/* publication — the case relation (R4), the revision flags (R5, R6), the editions a finding is published in (R37) and
   the pinning reads ratification's scope arms use (R38). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, NOW } from "./fixture.mjs";
import { CASE_FLAGS_LIMIT, RESTING_PINS_MAX } from "../../../src/publication/index.mjs";

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

test("R4 caseRelation answers the ratified editions pinning the finding's CURRENT sha and any unsigned preparation naming it; it is promotion's fact caseMember", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  assert.deepEqual(w.p.caseRelation(F), { member: false, pinned: [], prepared: null });
  assert.deepEqual(w.p.caseRelation("NOPE"), { member: false, pinned: [], prepared: null });
  assert.deepEqual(w.promotion.fact("caseMember", F), { ok: true, fact: "caseMember", value: false });
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.deepEqual(w.p.caseRelation(F), { member: true, pinned: [], prepared: { case_id: "CASE-2026-0001", edition: 1 } });
  assert.equal(w.promotion.fact("caseMember", F).value, true);
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "supporting" }] });
  assert.deepEqual(w.p.caseRelation(F), { member: true, prepared: null,
    pinned: [{ case_id: "CASE-2026-0001", edition: 1, version_sha: pin, role: "supporting" }] });
  /* a revision moves the finding off its pin: an abandoned preparation or a stale pin no longer makes it a member */
  w.inquiry(F, { question: "Revised?" });
  assert.deepEqual(w.p.caseRelation(F), { member: false, pinned: [], prepared: null });
});

test("R5 a promotion replacing a pinned sha raises one flag per case edition, member and new sha, with the owning project and the instant, never twice", () => {
  const { w, proj, pin } = ratified();
  assert.equal(w.count("case_revision_flags"), 0);
  w.clock.now = "2026-09-28T02:00:00Z";
  w.inquiry(F, { question: "Revised once?", legs: [{ target: DOC }] });
  const first = w.head(F);
  const rows = w.rows(`SELECT * FROM case_revision_flags`);
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].case_id, rows[0].edition, rows[0].bundle_id, rows[0].pinned_sha, rows[0].revised_sha,
                    rows[0].project_id, rows[0].acted_at], ["CASE-2026-0001", 1, F, pin, first, proj, null]);
  assert.match(rows[0].since, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  /* the same event again (the same pin, the same head) is the same row: never twice */
  assert.equal(w.p.flagCasesOnRevision(F, pin, NOW).length, 1);
  assert.equal(w.count("case_revision_flags"), 1);
  /* a second revision moves from a sha no edition pins: nothing more is raised */
  w.inquiry(F, { question: "Revised twice?", legs: [{ target: DOC }] });
  assert.equal(w.count("case_revision_flags"), 1);
  /* a pin whose hash did not move raises nothing */
  assert.deepEqual(w.p.flagCasesOnRevision(G, pin, NOW), []);
});

test("R5 a case older than DEC-72 owns no project, and its flag says so with null", () => {
  const { w, pin } = ratified();
  w.st.sql.exec(`DELETE FROM cases`);
  w.inquiry(F, { question: "Revised?", legs: [{ target: DOC }] });
  assert.equal(w.row(`SELECT project_id FROM case_revision_flags`).project_id, null);
  assert.equal(w.row(`SELECT pinned_sha FROM case_revision_flags`).pinned_sha, pin);
});

test("R5 dischargeCaseFlags discharges a case's outstanding flags, recording by whom and at which edition, and nothing wider", () => {
  const { w, pin } = ratified();
  w.inquiry(F, { question: "Revised?", legs: [{ target: DOC }] });
  w.st.sql.exec(`INSERT INTO case_revision_flags (case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since)
                 VALUES ('CASE-2026-0009', 1, ?, ?, 'other', 'PROJ-X', ?)`, F, pin, NOW);
  assert.equal(w.p.dischargeCaseFlags("CASE-2026-0001", 2, "olive", "2026-09-29T00:00:00Z"), 1);
  const mine = w.row(`SELECT * FROM case_revision_flags WHERE case_id='CASE-2026-0001'`);
  assert.deepEqual([mine.acted_at, mine.acted_by, mine.acted_edition], ["2026-09-29T00:00:00Z", "olive", 2]);
  assert.equal(w.row(`SELECT acted_at FROM case_revision_flags WHERE case_id='CASE-2026-0009'`).acted_at, null,
               "another case's flag is untouched");
  assert.equal(w.p.dischargeCaseFlags("CASE-2026-0001", 3, "bo", "2026-09-30T00:00:00Z"), 0, "only outstanding rows");
  assert.equal(w.row(`SELECT acted_by FROM case_revision_flags WHERE case_id='CASE-2026-0001'`).acted_by, "olive");
  assert.equal(w.p.dischargeCaseFlags("", 1, "olive", NOW), 0);
});

test("R6 caseFlags answers flags by instant, case, edition and member, limit clamped to [1, 500] and 500 by default, with truncated", () => {
  const w = world();
  const add = (c, e, b, since, acted = null) => w.st.sql.exec(
    `INSERT INTO case_revision_flags (case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since, acted_at, acted_by, acted_edition)
     VALUES (?,?,?,?,?,?,?,?,?,?)`, c, e, b, "p", `r-${c}-${e}-${b}`, "PROJ-1", since, acted, acted ? "olive" : null, acted ? e + 1 : null);
  add("CASE-B", 1, "X", "2026-09-02T00:00:00Z");
  add("CASE-A", 2, "Y", "2026-09-01T00:00:00Z");
  add("CASE-A", 1, "Z", "2026-09-01T00:00:00Z");
  add("CASE-A", 1, "W", "2026-09-01T00:00:00Z", "2026-09-03T00:00:00Z");
  const all = w.op("caseflags", {});
  assert.deepEqual(all.flags.map((f) => [f.case_id, f.edition, f.bundle_id]),
                   [["CASE-A", 1, "W"], ["CASE-A", 1, "Z"], ["CASE-A", 2, "Y"], ["CASE-B", 1, "X"]]);
  assert.deepEqual([all.limit, all.truncated, all.count, all.outstanding], [CASE_FLAGS_LIMIT, false, 4, 3]);
  assert.equal(CASE_FLAGS_LIMIT, 500);
  assert.deepEqual(all.flags[0].acted, { at: "2026-09-03T00:00:00Z", by: "olive", edition: 2 });
  assert.equal(all.flags[1].acted, null);
  assert.deepEqual(all.projects_owing, ["PROJ-1"]);
  const one = w.op("caseflags", { limit: 1 });
  assert.deepEqual([one.flags.length, one.limit, one.truncated], [1, 1, true]);
  for (const [asked, got] of [[0, 500], [-3, 1], [9999, 500], ["x", 500], [2.7, 2], [0.5, 500]])
    assert.equal(w.p.caseFlags({ limit: asked }).limit, got, `limit ${asked}`);
  assert.deepEqual(w.op("caseflags", { case: "CASE-A", outstanding: "1" }).flags.map((f) => f.bundle_id), ["Z", "Y"]);
  assert.deepEqual(w.op("caseflags", { target: "X" }).flags.map((f) => f.case_id), ["CASE-B"]);
});

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
