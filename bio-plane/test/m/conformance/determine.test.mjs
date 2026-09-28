/* conformance: the determination act (R1–R8), who may make one (R13) and what it rests on (R14). Every test drives
   `conformance` at its interface over the real modules it uses (./fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE, F, DOC } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, OUTCOMES, SIGNIFICANCE_KEYS, REASON_MAX, LIMITS } from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
  if (CONFORMANCE_CHECKS[code])
    assert.deepEqual([r.code, r.check, r.translation], [code, CONFORMANCE_CHECKS[code].check,
      CONFORMANCE_CHECKS[code].translation]);
};
/* Every refusal writes nothing: the tables are byte-identical across it. */
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

test("R1 R13: a machine or empty author is refused first; a member who has joined determines (negative control)", () => {
  const { w, input } = scene();
  for (const author of [MACHINE, "", null, "class:ai", "   "])
    refused(nothing(w, () => w.c.determine(input({ author, viewer: V("olive") }))), "MACHINE_CANNOT_DETERMINE");
  /* first: before the project is even looked at */
  refused(w.c.determine(input({ author: MACHINE, project: "PROJ-2026-9999-none" })), "MACHINE_CANNOT_DETERMINE");
  const ok = w.c.determine(input());
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  assert.equal(w.c.determine(input({ author: V("pat"), viewer: V("pat") })).ok, true, "a joined participant");
});

test("R1: refusals in R1's order, each asked only once the ones before it pass", () => {
  const { w, proj, std, ev } = scene();
  const unpublished = "INQ-2026-0002-unpublished";
  w.inquiry(unpublished);
  /* every part wrong at once; each step mends the one refused, so the next in R1's order answers */
  const bad = { author: MACHINE, viewer: V("olive"), project: "PROJ-2026-9999-none", act: {}, findings: [],
                standards: [], rows: [], score: 3 };
  const steps = [
    ["MACHINE_CANNOT_DETERMINE", { author: V("olive") }],
    ["NO_SUCH_PROJECT", { project: proj }],
    ["ACT_INCOMPLETE", { act: { description: "Closed the playground", actor: { role: "Director", body: "Parks" },
                                 at: "2026-03-02", evidence: [ev.content] } }],
    ["NO_FINDINGS", { findings: [unpublished] }],
    ["FINDING_NOT_PUBLISHED", { findings: [F] }],
    ["NO_STANDARDS", { standards: [{ standard: "STD-2026-0099-none" }] }],
    ["NO_SUCH_STANDARD", { standards: [{ standard: std }] }],
    ["ROWS_INCOMPLETE", { rows: [{ standard: std, requires: "notice", did: "none", reading: "diverges" }] }],
    ["OUTCOME_UNKNOWN", { standards: [{ standard: std, outcome: "unclear" }] }],
    ["UNCLEAR_NO_QUESTION", { questions: [{ question: "Was notice posted elsewhere?" }] }],
    ["SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT", { score: undefined }],
  ];
  let cur = { ...bad };
  for (const [code, mend] of steps) {
    refused(nothing(w, () => w.c.determine(cur)), code);
    cur = { ...cur, ...mend };
    if (mend.score === undefined && "score" in mend) delete cur.score;
  }
  assert.equal(w.c.determine(cur).ok, true, "every part mended, the determination is recorded");
  /* NOT_A_PARTICIPANT sits between the project and the act: an administrator sees the project and has not joined */
  refused(w.c.determine({ ...bad, author: V("ron"), viewer: V("ron"), project: proj }), "NOT_A_PARTICIPANT");
  /* STANDARD_NOT_IN_FORCE sits between NO_SUCH_STANDARD and ROWS_INCOMPLETE */
  const old = w.standard("Repealed Code 1", { period: { from: "2001-01-01", to: "2010-12-31" } });
  refused(w.c.determine({ ...cur, standards: [{ standard: old, outcome: "compliant" }], rows: [] }), "STANDARD_NOT_IN_FORCE");
});

test("R1: NO_SUCH_PROJECT for an absent id, a bundle that is not a project and a project not seen, one answer; membership's existence answer for a discoverable one", () => {
  const { w, input } = scene();
  const hidden = w.project("Hidden", "olive");
  const open = w.project("Open", "olive", { visibility: "discoverable" });
  for (const project of ["PROJ-2026-9999-none", DOC, F, "", null]) refused(w.c.determine(input({ project })), "NO_SUCH_PROJECT");
  const unseen = nothing(w, () => w.c.determine(input({ project: hidden, author: V("quinn"), viewer: V("quinn") })));
  const absent = w.c.determine(input({ project: "PROJ-2026-9999-none", author: V("quinn"), viewer: V("quinn") }));
  refused(unseen, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...unseen, project: null, detail: null }, { ...absent, project: null, detail: null }, "absent and unseen alike");
  const ex = w.c.determine(input({ project: open, author: V("quinn"), viewer: V("quinn") }));
  assert.equal(ex.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R1: NOT_A_PARTICIPANT for an author who has not joined (invited only, an administrator, the founder), translated in one line from membership's", () => {
  const { w, proj, input } = scene();
  w.membership.projectInvite({ projectId: proj, handle: "h_sam", by: "olive", viewer: V("olive") });
  for (const [author, viewer] of [[V("sam"), V("sam")], [V("ron"), V("ron")], ["admin", "admin"]]) {
    const r = nothing(w, () => w.c.determine(input({ author, viewer })));
    refused(r, "NOT_A_PARTICIPANT");
    assert.equal(r.project, proj);
  }
  /* a participant who asked to leave is still joined (membership R54's joined-or-leaving) */
  w.membership.projectLeave({ projectId: proj, by: "pat", comment: "moving on", viewer: V("pat") });
  assert.equal(w.c.determine(input({ author: V("pat"), viewer: V("pat") })).ok, true);
});

test("R1: ACT_INCOMPLETE names the missing or unreadable part: description, actor role and body, date or period, evidence, content not held, an act id this project never determined", () => {
  const { w, ev, input } = scene();
  const base = input().act;
  const cases = [
    [{ ...base, description: "  " }, "description"],
    [{ ...base, actor: { role: "Director" } }, "actor"],
    [{ ...base, actor: { body: "Parks" } }, "actor"],
    [{ ...base, actor: "Jane Doe" }, "actor"],
    [{ ...base, at: undefined }, "at"],
    [{ ...base, at: "March 2" }, "at"],
    [{ ...base, at: "2026-02-30" }, "at"],
    [{ ...base, at: undefined, period: { from: "2026-03-01" } }, "period"],
    [{ ...base, at: undefined, period: { from: "2026-03-05", to: "2026-03-01" } }, "period"],
    [{ ...base, evidence: [] }, "evidence"],
    [{ ...base, evidence: undefined }, "evidence"],
    [{ ...base, evidence: [ev.content, ""] }, "evidence"],
    [{ ...base, evidence: ["f".repeat(64)] }, "evidence"],
    [{ id: "ACT-2026-0099" }, "id"],
  ];
  for (const [act, part] of cases) {
    const r = nothing(w, () => w.c.determine(input({ act })));
    refused(r, "ACT_INCOMPLETE");
    assert.equal(r.part, part, JSON.stringify(act));
  }
  assert.deepEqual(w.c.determine(input({ act: { ...base, evidence: ["f".repeat(64)] } })).unresolved, ["f".repeat(64)]);
  /* a period with both ends is a date */
  assert.equal(w.c.determine(input({ act: { ...base, at: undefined, period: { from: "2026-03-01", to: "2026-03-05" } } })).ok, true);
});

test("R1 R2 R14: a determination rests on findings this project published in a ratified case edition, and pins that edition and version", () => {
  const { w, proj, pin, input } = scene();
  refused(nothing(w, () => w.c.determine(input({ findings: [] }))), "NO_FINDINGS");
  refused(w.c.determine(input({ findings: undefined })), "NO_FINDINGS");
  /* not published at all, and an unsigned preparation is not published */
  const G = "INQ-2026-0002-prepared";
  w.inquiry(G);
  w.publication.storeCaseDocument({ case: "CASE-2026-0007", edition: 1, author: V("olive"), at: "2026-09-28T01:00:00Z",
    text: "---\nformat: bio-case-document/4\ncase_id: CASE-2026-0007\ncase_edition: 1\n---\n" });
  for (const findings of [[G], ["INQ-2026-0099-none"], [DOC], [""]]) {
    const r = nothing(w, () => w.c.determine(input({ findings })));
    refused(r, "FINDING_NOT_PUBLISHED");
  }
  /* published only by another project */
  const other = w.project("Libraries", "olive");
  const H = "INQ-2026-0003-other";
  w.inquiry(H);
  w.publish(H, other, { caseId: "CASE-2026-0002" });
  const r = w.c.determine(input({ findings: [F, H] }));
  refused(r, "FINDING_NOT_PUBLISHED");
  assert.equal(r.finding, H);
  /* a version the project never published */
  refused(w.c.determine(input({ findings: [{ finding: F, version: "0".repeat(64) }] })), "FINDING_NOT_PUBLISHED");
  refused(w.c.determine(input({ findings: [{ finding: F, case: "CASE-2026-0002" }] })), "FINDING_NOT_PUBLISHED");
  /* the pin: case, edition, version and role as the ratified edition holds them */
  const ok = w.c.determine(input());
  assert.deepEqual(ok.findings.map(({ finding, case: c, edition, version_sha, role }) => ({ finding, c, edition, version_sha, role })),
    [{ finding: F, c: "CASE-2026-0001", edition: 1, version_sha: pin, role: "load_bearing" }]);
  /* a later edition is pinned when none is named; a named edition is pinned as named */
  w.inquiry(F, { legs: [{ target: DOC }], question: "Revised?" });
  const pin2 = w.publish(F, proj, { edition: 2 });
  assert.notEqual(pin2, pin);
  const latest = w.c.determine(input());
  assert.deepEqual([latest.findings[0].edition, latest.findings[0].version_sha], [2, pin2]);
  const named = w.c.determine(input({ findings: [{ finding: F, edition: 1 }] }));
  assert.deepEqual([named.findings[0].edition, named.findings[0].version_sha], [1, pin]);
  const byVersion = w.c.determine(input({ findings: [{ finding: F, version: pin }] }));
  assert.equal(byVersion.findings[0].edition, 1);
  /* R14: every determination recorded rests on at least one published finding and one standard */
  for (const row of w.rows(`SELECT determination_id FROM determinations`)) {
    assert.ok(w.row(`SELECT COUNT(*) AS n FROM determination_findings WHERE determination_id=?`, row.determination_id).n >= 1);
    assert.ok(w.row(`SELECT COUNT(*) AS n FROM determination_standards WHERE determination_id=?`, row.determination_id).n >= 1);
  }
});

test("R1 R3 R14: each standard is one the record holds, read through standards.inForce at the act's date or each end of its period: not in force refused, undetermined accepted and stated", () => {
  const { w, std, input } = scene();
  refused(nothing(w, () => w.c.determine(input({ standards: [] }))), "NO_STANDARDS");
  for (const standard of ["STD-2026-0099-none", F, ""]) {
    const r = nothing(w, () => w.c.determine(input({ standards: [{ standard, outcome: "compliant" }] })));
    refused(r, "NO_SUCH_STANDARD");
  }
  const repealed = w.standard("Old Code 3", { period: { from: "2001-01-01", to: "2010-12-31" } });
  const later = w.standard("New Code 4", { period: { from: "2027-01-01", to: "2030-12-31" } });
  for (const s of [repealed, later]) {
    const r = nothing(w, () => w.c.determine(input({ standards: [{ standard: s, outcome: "compliant" }],
                                                     rows: [{ standard: s, requires: "x", did: "y", reading: "aligns" }] })));
    refused(r, "STANDARD_NOT_IN_FORCE");
    assert.deepEqual([r.standard, r.date], [s, "2026-03-02"]);
  }
  /* a period: each end is read; out of force at either end is refused */
  const endsMid = w.standard("Sunset Code 5", { period: { from: "2020-01-01", to: "2026-03-03" } });
  const act = { ...input().act, at: undefined, period: { from: "2026-03-01", to: "2026-03-05" } };
  const r = w.c.determine(input({ act, standards: [{ standard: endsMid, outcome: "compliant" }],
                                  rows: [{ standard: endsMid, requires: "x", did: "y", reading: "aligns" }] }));
  refused(r, "STANDARD_NOT_IN_FORCE");
  assert.equal(r.date, "2026-03-05");
  /* undetermined (a bound the record does not state) is accepted and stated beside that standard */
  const open = w.standard("Open Code 6", { period: { from: "2020-01-01", to: null } });
  const ok = w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }, { standard: open, outcome: "unclear" }],
    rows: [...input().rows, { standard: open, requires: "x", did: "y", reading: "open" }],
    questions: [{ question: "Did the ordinance's sunset clause run?" }] }));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(ok.standards.map((s) => [s.standard, s.in_force]), [[std, "in_force"], [open, "undetermined"]]);
  assert.equal(ok.standards[0].in_force_why, null);
  assert.match(ok.standards[1].in_force_why, /2026-03-02/);
  assert.match(w.text(ok.id), /whether it was in force is undetermined/);
});

test("R1: ROWS_INCOMPLETE for a standard with no row or a row missing what it requires, what was done or its reading; OUTCOME_UNKNOWN for a missing or unknown outcome", () => {
  const { w, std, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const row = input().rows[0];
  const rowsCases = [
    [],
    [{ ...row, requires: "" }],
    [{ ...row, did: undefined }],
    [{ ...row, reading: "breaks" }],
    [{ ...row, reading: undefined }],
    [{ ...row, standard: "STD-2026-0099-none" }],
    ["a sentence"],
  ];
  for (const rows of rowsCases) refused(nothing(w, () => w.c.determine(input({ rows }))), "ROWS_INCOMPLETE");
  /* two standards, one row: the bare standard is named */
  const bare = w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }, { standard: second, outcome: "compliant" }] }));
  refused(bare, "ROWS_INCOMPLETE");
  assert.equal(bare.standard, second);
  for (const standards of [[{ standard: std }], [std], [{ standard: std, outcome: "breach" }],
                           [{ standard: std, outcome: "compliant" }, { standard: std, outcome: "noncompliant" }]])
    refused(nothing(w, () => w.c.determine(input({ standards }))), "OUTCOME_UNKNOWN");
  assert.deepEqual(OUTCOMES, ["compliant", "noncompliant", "unclear"]);
  for (const outcome of OUTCOMES)
    assert.equal(w.c.determine(input({ standards: [{ standard: std, outcome }],
      ...(outcome === "unclear" ? { questions: [{ question: "Open?" }] } : {}) })).ok, true, outcome);
});

test("R4: the outcome is given per standard and never composed; a disagreement with the rows is accepted and stated beside it, never corrected", () => {
  const { w, std, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const two = w.c.determine(input({
    standards: [{ standard: std, outcome: "noncompliant" }, { standard: second, outcome: "compliant" }],
    rows: [{ standard: std, requires: "notice", did: "none", reading: "diverges" },
           { standard: second, requires: "a posted sign", did: "a sign was posted", reading: "aligns" }] }));
  assert.equal(two.ok, true);
  assert.deepEqual(two.standards.map((s) => [s.standard, s.outcome, s.disagreement]),
    [[std, "noncompliant", null], [second, "compliant", null]]);
  for (const key of ["outcome", "verdict", "overall", "compliance", "result"]) assert.equal(key in two, false, key);
  /* all rows align and the member says noncompliant; a row diverges and the member says compliant */
  const a = w.c.determine(input({ rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.deepEqual([a.ok, a.standards[0].outcome], [true, "noncompliant"]);
  assert.match(a.standards[0].disagreement, /every row reads aligns/);
  const b = w.c.determine(input({ standards: [{ standard: std, outcome: "compliant" }] }));
  assert.deepEqual([b.ok, b.standards[0].outcome], [true, "compliant"]);
  assert.match(b.standards[0].disagreement, /diverges/);
  /* the stored outcome is the member's, and the read says so again */
  assert.equal(w.c.determinationRead({ id: b.id, viewer: V("olive") }).standards[0].outcome, "compliant");
});

test("R5: a compliant determination carries exactly a noncompliant one's obligations and is read by the same services", () => {
  const { w, std, input } = scene();
  const nc = w.c.determine(input());
  const act = { id: nc.act.id };
  const c = w.c.determine(input({ act, standards: [{ standard: std, outcome: "compliant" }],
                                  rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.equal(c.ok, true);
  const shape = (x) => JSON.stringify(Object.keys(x).sort());
  assert.equal(shape(c), shape(nc));
  assert.equal(shape(c.act), shape(nc.act));
  assert.equal(shape(c.standards[0]), shape(nc.standards[0]));
  assert.equal(shape(c.findings[0]), shape(nc.findings[0]));
  /* the same refusals hold for either outcome */
  for (const outcome of ["compliant", "noncompliant"]) {
    refused(w.c.determine(input({ standards: [{ standard: std, outcome }], rows: [] })), "ROWS_INCOMPLETE");
    refused(w.c.determine(input({ standards: [{ standard: std, outcome }], findings: [] })), "NO_FINDINGS");
    refused(w.c.determine(input({ standards: [{ standard: std, outcome }], act: { description: "x" } })), "ACT_INCOMPLETE");
  }
  /* the same reads answer both */
  const list = w.c.determinationsFor({ act: act.id, viewer: V("pat") });
  assert.deepEqual(list.items.map((i) => [i.id, i.outcomes[0].outcome]), [[nc.id, "noncompliant"], [c.id, "compliant"]]);
  assert.deepEqual(w.c.determinationsFor({ outcome: "compliant", viewer: V("pat") }).items.map((i) => i.id), [c.id]);
  assert.equal(w.c.determinationRead({ id: c.id, viewer: V("pat") }).ok, true);
});

test("R6: an unclear outcome names at least one question, each an inquiry the author may see or a new one opened in the same act, in the project", () => {
  const { w, proj, std, input } = scene();
  const unclear = (questions) => input({ standards: [{ standard: std, outcome: "unclear" }], questions,
                                         rows: [{ ...input().rows[0], reading: "open" }] });
  for (const questions of [undefined, [], [{ question: "" }], [{ inquiry: F }], [{ question: "Q?", inquiry: "INQ-2026-0099-none" }],
                           [{ question: "Q?", inquiry: DOC }]])
    refused(nothing(w, () => w.c.determine(unclear(questions))), "UNCLEAR_NO_QUESTION");
  const E = "INQ-2026-0005-existing";
  w.inquiry(E);
  const r = w.c.determine(unclear([{ question: "Was notice posted on the city's site instead?", inquiry: E },
                                   { question: "Did the closure fall under the emergency exception?" }]));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.questions.length, 2);
  assert.deepEqual([r.questions[0].inquiry, r.questions[0].opened], [E, false]);
  const opened = r.questions[1].inquiry;
  assert.equal(r.questions[1].opened, true);
  assert.match(opened, /^INQ-2026-\d{4}-question$/);
  /* the new inquiry: open, titled from the question, readable, named in the project by this module */
  const fm = w.fm(opened);
  assert.deepEqual([fm.object_type, fm.current_state, fm.title],
    ["inquiry", "open", "Did the closure fall under the emergency exception?"]);
  assert.match(w.text(opened), new RegExp(`${r.id} in the project ${proj}`));
  assert.deepEqual(w.rows(`SELECT inquiry_id, opened, project_id FROM determination_questions WHERE determination_id=? ORDER BY ord`, r.id),
    [{ inquiry_id: E, opened: 0, project_id: proj }, { inquiry_id: opened, opened: 1, project_id: proj }]);
  /* questions beside a determination with no unclear outcome are kept too */
  assert.equal(w.c.determine(input({ questions: [{ question: "Anything else?" }] })).questions.length, 1);
});

test("R6: the determination and every inquiry it opens land together or not at all; a refused determination rolls back the inquiry and spends no id", () => {
  const { w, std, input } = scene();
  /* the next determination id is already held (a replay, which conformance's step does not ask), so the determination's
     own promotion is refused EXISTS after its inquiry was promoted */
  const probe = w.record.allocId("PROBE", "2026");
  assert.ok(probe.id);
  const nextConf = "CONF-2026-0001-determination";
  const held = w.promotion.promote({ bundleId: nextConf, base: null, snapKey: "replay1", author: V("olive"), replay: true,
    files: [{ path: "bundle.md", text: ["---", `id: ${nextConf}`, "object_type: determination", "schema: determination@1",
      'title: "Held"', "current_state: recorded", "prior_state: null", 'created: "2026-09-28T00:00:00Z"',
      'last_updated: "2026-09-28T00:00:00Z"', "references: []", "state_history: []", "---", "", "held", ""].join("\n") }],
    meta: { object_type: "determination" } });
  assert.equal(held.ok, true, JSON.stringify(held));
  const inquiriesBefore = w.rows(`SELECT bundle_id FROM bundles WHERE object_type='inquiry' ORDER BY bundle_id`);
  const before = w.snapshot(["determinations", "determination_questions", "bundles", "manifest", "seq"]);
  const r = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }],
                                  rows: [{ ...input().rows[0], reading: "open" }],
                                  questions: [{ question: "Was the exception invoked?" }] }));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "EXISTS");
  assert.deepEqual(w.rows(`SELECT bundle_id FROM bundles WHERE object_type='inquiry' ORDER BY bundle_id`), inquiriesBefore,
    "the inquiry it opened is not held");
  assert.deepEqual(w.snapshot(["determinations", "determination_questions", "bundles", "manifest", "seq"]), before,
    "no row, no manifest entry, no id spent");
});

test("R7: a determination is never edited; a later one names the act by its id; supersedes names an earlier determination of the same act in the same project, once, with a reason, and both reads name the link", () => {
  const { w, proj, std, input } = scene();
  const first = w.c.determine(input());
  assert.match(first.act.id, /^ACT-2026-\d{4}$/);
  /* the act named by id: the act as recorded, whatever else is sent beside the id */
  const again = w.c.determine(input({ act: { id: first.act.id, description: "something else" } }));
  assert.deepEqual(again.act, first.act);
  /* the same act is the id's equality, never the description's */
  const twin = w.c.determine(input());
  assert.notEqual(twin.act.id, first.act.id);
  refused(nothing(w, () => w.c.determine(input({ supersedes: first.id }))), "BAD_REASON");
  refused(w.c.determine(input({ supersedes: first.id, reason: "x".repeat(REASON_MAX + 1) })), "BAD_REASON");
  refused(w.c.determine(input({ supersedes: first.id, reason: "   " })), "BAD_REASON");
  const other = w.c.determine(input({ act: { id: twin.act.id }, supersedes: first.id, reason: "the act was misdated" }));
  refused(other, "SUPERSEDES_ANOTHER_ACT");
  assert.deepEqual([other.act, other.predecessor_act], [twin.act.id, first.act.id]);
  refused(w.c.determine(input({ supersedes: "CONF-2026-0099-determination", reason: "r" })), "NO_SUCH_DETERMINATION");
  /* another project's determination is not one to supersede here */
  const libs = w.project("Libraries", "olive");
  const H = "INQ-2026-0009-lib";
  w.inquiry(H);
  w.publish(H, libs, { caseId: "CASE-2026-0003" });
  const theirs = w.c.determine(input({ project: libs, findings: [H] }));
  assert.equal(theirs.ok, true, JSON.stringify(theirs).slice(0, 300));
  refused(w.c.determine(input({ supersedes: theirs.id, reason: "r" })), "NO_SUCH_DETERMINATION");
  /* the supersession: the act carried from the predecessor, the reason recorded, the earlier one readable */
  const firstText = w.text(first.id);
  const next = w.c.determine(input({ act: undefined, supersedes: first.id, reason: "a second notice rule applies",
                                     standards: [{ standard: std, outcome: "compliant" }],
                                     rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.equal(next.ok, true, JSON.stringify(next).slice(0, 300));
  assert.deepEqual([next.act.id, next.supersedes, next.reason, next.live], [first.act.id, first.id, "a second notice rule applies", true]);
  const earlier = w.c.determinationRead({ id: first.id, viewer: V("olive") });
  assert.deepEqual([earlier.ok, earlier.superseded_by, earlier.live, earlier.standards[0].outcome],
                   [true, next.id, false, "noncompliant"]);
  assert.equal(w.text(first.id), firstText, "never edited");
  assert.equal(w.record.head(first.id).rowVersion, 1);
  /* at most once */
  const second = w.c.determine(input({ supersedes: first.id, reason: "again" }));
  refused(second, "ALREADY_SUPERSEDED");
  assert.equal(second.superseded_by, next.id);
  assert.equal(proj, next.project);
});

test("R8: no input carries a significance, severity, priority, urgency, rank or score, at any depth and in any case; no answer carries one", () => {
  const { w, input } = scene();
  assert.deepEqual(SIGNIFICANCE_KEYS, ["significance", "severity", "priority", "urgency", "rank", "score"]);
  for (const key of SIGNIFICANCE_KEYS) {
    const base = input();
    const places = [
      { ...base, [key]: "high" },
      { ...base, [key.toUpperCase()]: 1 },
      { ...base, act: { ...base.act, [key]: 2 } },
      { ...base, rows: [{ ...base.rows[0], [key]: "low" }] },
      { ...base, standards: [{ ...base.standards[0], [key]: 5 }] },
      { ...base, findings: [{ finding: F, [key]: 1 }] },
      { ...base, questions: [{ question: "Q?", meta: { [key]: 1 } }] },
    ];
    for (const inp of places) {
      const r = nothing(w, () => w.c.determine(inp));
      refused(r, "SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT");
      assert.ok(r.keys.length >= 1);
    }
  }
  /* no answer carries one, at any depth */
  const ok = w.c.determine(input());
  const answers = [ok, w.c.determinationRead({ id: ok.id, viewer: V("olive") }),
                   w.c.determinationsFor({ viewer: V("olive") })];
  const walk = (v) => Array.isArray(v) ? v.forEach(walk) : v && typeof v === "object"
    ? Object.entries(v).forEach(([k, x]) => { assert.equal(SIGNIFICANCE_KEYS.includes(k.toLowerCase()), false, k); walk(x); }) : null;
  answers.forEach(walk);
});

test("R1 R18: a determination carries at most the bounded number of findings, standards, rows, questions and evidence ids", () => {
  const { w, input, std, ev } = scene();
  const over = {
    findings: Array(LIMITS.findings + 1).fill(F),
    standards: Array(LIMITS.standards + 1).fill({ standard: std, outcome: "noncompliant" }),
    rows: Array(LIMITS.rows + 1).fill(input().rows[0]),
    questions: Array(LIMITS.questions + 1).fill({ question: "Q?" }),
  };
  for (const [part, v] of Object.entries(over)) {
    const r = nothing(w, () => w.c.determine(input({ [part]: v })));
    refused(r, "DETERMINATION_TOO_LARGE");
    assert.deepEqual([r.part, r.max], [part, LIMITS[part]]);
  }
  const r = w.c.determine(input({ act: { ...input().act, evidence: Array(LIMITS.evidence + 1).fill(ev.content) } }));
  refused(r, "DETERMINATION_TOO_LARGE");
  assert.equal(r.part, "evidence");
  /* at the bound it is accepted */
  assert.equal(w.c.determine(input({ findings: Array(LIMITS.findings).fill(F) })).ok, true);
});

test("R13: nothing a machine writes is a determination or an outcome: the act refuses a machine, and a raw promotion or a revision of a determination is refused", () => {
  const { w, input } = scene();
  refused(w.c.determine(input({ author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_DETERMINE");
  const id = "CONF-2026-0050-determination";
  const md = ["---", `id: ${id}`, "object_type: determination", "schema: determination@1", 'title: "Raw"',
    "current_state: recorded", "prior_state: null", 'created: "2026-09-28T00:00:00Z"', 'last_updated: "2026-09-28T00:00:00Z"',
    "references: []", "state_history: []", "---", "", "raw", ""].join("\n");
  for (const author of [MACHINE, V("olive")]) {
    const raw = nothing(w, () => w.promotion.promote({ bundleId: id, base: null, snapKey: `raw-${author}`, author,
      files: [{ path: "bundle.md", text: md }], meta: { object_type: "determination" } }));
    refused(raw, "DETERMINATION_ONLY_BY_ITS_ACT");
  }
  const ok = w.c.determine(input());
  const rev = w.promotion.promote({ bundleId: ok.id, base: w.head(ok.id), snapKey: "rev1", author: V("olive"),
    files: [{ path: "bundle.md", text: w.text(ok.id).replace("noncompliant", "compliant") }],
    meta: { object_type: "determination" } });
  refused(rev, "DETERMINATION_ONLY_BY_ITS_ACT");
  assert.equal(w.c.determinationRead({ id: ok.id, viewer: V("olive") }).standards[0].outcome, "noncompliant");
  /* nothing in the record of determinations was written by a machine */
  assert.deepEqual(w.rows(`SELECT author FROM determinations`).filter((r) => /^class:/.test(r.author)), []);
});
