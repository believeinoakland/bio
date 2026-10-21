/* case-authoring (T51 fix round 2; C3, C67; K4303): the pre-flight's step three lists the captures the case rests on whether
   or not op=publish refused (R82), and a case cites only its own findings (R16). Over the real provenance, capture and
   attestation modules, through the module's interface as the pre-flight tests call it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const CO_ATTESTED = { attestations: [{ kind: "rfc3161", service: "tsa.example", file: "snapshots/timestamp-abc.tsr",
                                       sha256: "d".repeat(64) }],
                      co_archive: { service: "archive.example", locator: "https://archive.example/web/x" } };
const REASON = "the site refuses the archive's crawler";
const AUTH = { author: "alice", scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
               subjectJustification: "A public record.", biasAcknowledgement: "We read the minutes as the account.",
               excluded: [], tieAttested: true };
const args = (P, targets, over = {}) => ({ ...AUTH, project: P, targets, viewer: V("alice"),
  roles: Object.fromEntries(targets.map((t) => [t, "load_bearing"])), ...over });

/* Q rests on a co-attested Grade B document (DOC) and on a Grade B one that is not co-attested (DOC2). */
function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const a = w.graded(DOC, CO_ATTESTED), b = w.graded(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P, a, b };
}
const REFUSED = "CO_ATTESTATION_UNACKNOWLEDGED";

test("R82 (C3, K4303): a pre-flight of a case whose publish is refused CO_ATTESTATION_UNACKNOWLEDGED lists the unacknowledged captures in step three, and the refusal stays in first", () => {
  const { w, P, a, b } = setup();
  const pub = w.ca.publishCase(args(P, [Q]));
  assert.equal(pub.reason, REFUSED, "the act itself refuses it");
  const pre = w.ca.publishPreflight(args(P, [Q]));
  assert.equal(pre.first && pre.first.reason, REFUSED, "a refusal stays in first");
  assert.equal(pre.ready, false);
  const step = pre.steps[2];
  assert.deepEqual(step.not_co_attested.map(({ capture, by, findings }) => ({ capture, by, findings })), [{ capture: b, by: null, findings: [Q] }]);
  assert.ok(!step.not_co_attested.some((x) => x.capture === a), "a co-attested capture is not listed");
  assert.deepEqual(step.self_attested, [], "none is stated as self-attested yet");
  assert.ok(pre.steps[0].stated, "the steps that need the act still state they were not reached");
});

test("R82 (C3, K4303) control: the same case with its reason listed is ready of this refusal and lists both the not-co-attested capture and its self_attested row; the list is the same with and without the refusal", () => {
  const { w, P, b } = setup();
  const refused = w.ca.publishPreflight(args(P, [Q]));
  const pre = w.ca.publishPreflight(args(P, [Q], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.deepEqual(pre.steps[2].not_co_attested, refused.steps[2].not_co_attested);
  assert.deepEqual(pre.steps[2].self_attested.map((x) => [x.capture, x.member, x.reason]), [[b, Q, REASON]]);
});

test("R82 (C3, K4303): when another refusal comes first the captures are still known and listed; when the roster cannot be judged, step three states it and lists none, never an empty list", () => {
  const { w, P, b } = setup();
  const noStatement = w.ca.publishPreflight(args(P, [Q], { statement: "" }));
  assert.equal(noStatement.first.reason, "NO_STATEMENT");
  assert.deepEqual(noStatement.steps[2].not_co_attested.map(({ capture, by, findings }) => ({ capture, by, findings })), [{ capture: b, by: null, findings: [Q] }]);
  const noRoles = w.ca.publishPreflight(args(P, [Q], { roles: null }));
  assert.equal(noRoles.first.reason, "NO_MEMBER_ROLE");
  assert.equal("not_co_attested" in noRoles.steps[2], false, "unknown roles: nothing listed");
  assert.ok(noRoles.steps[2].stated, "and the step says so");
  const gone = w.ca.publishPreflight(args(P, ["INQ-2026-0099-x"]));
  assert.equal(gone.first.reason, "NO_SUCH_BUNDLE");
  assert.equal("not_co_attested" in gone.steps[2], false);
  assert.ok(gone.steps[2].stated);
});

test("R82 (C3, K4303): the pre-flight of a refused publish writes nothing", () => {
  const { w, P } = setup();
  const before = w.snapshot();
  w.ca.publishPreflight(args(P, [Q]));
  assert.deepEqual(w.snapshot(), before);
});

test("R16 (C67, K4303): a case cites only its own findings — a project citing the findings of an earlier draft carries none of them into the case; documents it cites are carried as before", () => {
  const { w } = setup();
  w.finding(Q3, [{ target: DOC }]);
  const P = w.project("Many", "alice", [Q, Q2, Q3, DOC, DOC2]);
  const r = w.publish(P, "alice", [Q3], { tieAttested: true });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.case_citations.map((x) => x.target), [Q3, DOC, DOC2], "Q and Q2 are another draft's findings");
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
  assert.equal(text.includes(Q) || text.includes(Q2), false, "neither earlier finding is in the signed bytes");
  assert.ok(text.includes(Q3));
});

test("R16 (C67, K4303) control: a finding that is a member of the case is cited; with two members both are", () => {
  const { w, b } = setup();
  const P = w.project("Many", "alice", [Q, Q2, DOC]);
  const both = w.publish(P, "alice", [Q, Q2], { tieAttested: true, selfAttested: [{ capture: b, reason: REASON }] });
  assert.equal(both.ok, true, JSON.stringify(both).slice(0, 300));
  assert.deepEqual(both.case_citations.map((x) => x.target), [Q, Q2, DOC]);
});

test("R82 (C40, K4365): each not_co_attested row carries the capture's own facts — after a late timestamp it is timestamp_late with late_words and the co-archive still missing; a capture with no attempt misses both and is not late (control)", () => {
  const { w, P, b } = setup();
  const row = () => w.ca.publishPreflight(args(P, [Q])).steps[2].not_co_attested.find((x) => x.capture === b);
  const none = row();
  assert.deepEqual([none.missing, none.timestamp_late, none.late, none.late_words, none.timestamp_at, none.co_archive],
                   [["timestamp", "co_archive"], false, false, null, null, null]);
  const at = "2026-09-28T00:05:00Z";
  w.st.sql.exec(`INSERT INTO late_attestations (capture_sha, seq, kind, service, ok, at, by, outcome) VALUES (?, 1, 'timestamp',
    'tsa.example', 1, ?, 'alice', ?)`, b, at, JSON.stringify({ late: true, kind: "timestamp", ok: true, at }));
  const late = row();
  assert.deepEqual([late.missing, late.timestamp_late, late.late, late.timestamp_at, late.co_archive, late.by, late.findings],
                   [["co_archive"], true, true, at, null, null, [Q]]);
  assert.equal(typeof late.late_words, "string");
  assert.ok(late.late_words.includes(at));
});
