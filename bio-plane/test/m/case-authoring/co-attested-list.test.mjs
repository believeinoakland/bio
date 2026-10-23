/* case-authoring (K4240; B10; screens-publish J9 (3)): the pre-flight's step three lists each capture the case rests on that is
   not co-attested as {capture, by, findings}: the member the record holds as capturing it, and the findings resting on it.
   Over the real provenance, capture and attestation modules; the module's interface, as the pre-flight tests call it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
/* A co-attestation as capture R20 and attestation R2–R3 record it at capture. */
const CO_ATTESTED = { attestations: [{ kind: "rfc3161", service: "tsa.example", file: "snapshots/timestamp-abc.tsr",
                                       sha256: "d".repeat(64) }],
                      co_archive: { service: "archive.example", locator: "https://archive.example/web/x" } };
const REASON = "the site refuses the archive's crawler";
const AUTH = { author: "alice", scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
               subjectJustification: "A public record.", biasAcknowledgement: "We read the minutes as the account.",
               excluded: [], tieAttested: true };
const args = (P, targets, over = {}) => ({ ...AUTH, project: P, targets, viewer: V("alice"),
  roles: Object.fromEntries(targets.map((t) => [t, "load_bearing"])), ...over });
const CAPTURED_AT = "2026-09-27T12:00:00Z";

/* Q rests on a co-attested Grade B document (DOC) and on a Grade B one that is not co-attested (DOC2); Q2 rests on DOC2 too. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const a = w.graded(DOC, CO_ATTESTED), b = w.graded(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P, a, b };
}
/* The member who captured a document, as the capture module records it (`capture_actors`, its R69). */
const capturedBy = (w, sha, actor = "member:alice") =>
  w.st.sql.exec(`INSERT INTO capture_actors (capture_sha, actor, at) VALUES (?, ?, ?)`, sha, actor, CAPTURED_AT);

/* C40 (K4365) added the capture's own facts to each row; these tests hold the original three fields. */
const core = (rows) => rows.map(({ capture, by, findings }) => ({ capture, by, findings }));

test("R82 (B10, K4240): step three lists each capture the case rests on that is not co-attested as {capture, by, findings}: the member recorded as capturing it, and each finding resting on it, once; a co-attested capture is not listed", () => {
  const { w, P, a, b } = setup();
  capturedBy(w, b);
  const pre = w.ca.publishPreflight(args(P, [Q, Q2], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  const list = pre.steps[2].not_co_attested;
  assert.deepEqual(core(list), [{ capture: b, by: "alice", findings: [Q, Q2] }]);
  assert.ok(!list.some((x) => x.capture === a), "a co-attested capture is never listed");
});

test("R82 (B10, K4240) control: a capture no finding of the case rests on is not listed, and each finding names only the captures it rests on: a case over Q2 alone lists DOC2 with Q2 alone", () => {
  const { w, P, b } = setup();
  capturedBy(w, b);
  const held = w.graded(DOC3);
  const all = w.ca.publishPreflight(args(P, [Q, Q2], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.equal(all.first, null, JSON.stringify(all.first).slice(0, 300));
  assert.ok(!all.steps[2].not_co_attested.some((x) => x.capture === held), "a capture no finding rests on is not listed");
  const only = w.ca.publishPreflight(args(P, [Q2], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.equal(only.first, null, JSON.stringify(only.first).slice(0, 300));
  assert.deepEqual(core(only.steps[2].not_co_attested), [{ capture: b, by: "alice", findings: [Q2] }]);
});

test("R82 (B10, K4240): a capture with no member recorded as capturing it, or only a machine, answers by: null; the pre-flight writes nothing", () => {
  const { w, P, b } = setup();
  const before = w.snapshot();
  const pre = w.ca.publishPreflight(args(P, [Q, Q2], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.deepEqual(core(pre.steps[2].not_co_attested), [{ capture: b, by: null, findings: [Q, Q2] }]);
  assert.deepEqual(w.snapshot(), before, "the pre-flight writes nothing");
  /* a machine actor is not a member: the capture still answers by: null */
  capturedBy(w, b, "machine:agent-1");
  const machine = w.ca.publishPreflight(args(P, [Q, Q2], { selfAttested: [{ capture: b, reason: REASON }] }));
  assert.deepEqual(core(machine.steps[2].not_co_attested), [{ capture: b, by: null, findings: [Q, Q2] }]);
});
