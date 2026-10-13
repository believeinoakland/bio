/* case-authoring R75 (T47; N683; DEC-147; ratification R44): the pre-flight's sign step offers "Publish at…" exactly as
   ratification's pre-flight answers it, read from the one call R34 makes; and R76 (T47; K1490, K3041; case-disclosures
   R27): the signing act takes the publishing member's confirmation of no undeclared tie, refused without it. Over the
   real ratification, provenance, capture and case-disclosures; the zone is the active profiles' `time_zone`
   (record-core's `jurisdiction_profiles`, as ratification's own tests set it). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { PUBLISH_AT_NOT_REACHED_SENTENCE, PUBLISH_AT_UNANSWERED_SENTENCE, CASE_DISCLOSURE_CHECKS }
  from "../../../src/case-authoring/index.mjs";
import { memberTiesOf } from "../../../src/case-disclosures/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const REASON = "the site refuses the archive's crawler";
const docOf = (w, r) => w.row(`SELECT * FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo"]) w.member(m);
  const capture = w.graded(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  return { w, P, capture };
}
const args = (x, over = {}) => ({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: x.P, targets: [Q],
  roles: { [Q]: "load_bearing" }, selfAttested: [{ capture: x.capture, reason: REASON }], viewer: V("alice"),
  author: "alice", ...over });
const sign = (pre) => pre.steps.find((s) => s.name === "sign");

test("R75: the sign step answers publish_at exactly as ratification's pre-flight answers it — {offered: false, zone: null, reason: PUBLISH_AT_NO_ZONE} with no time_zone held, {offered: true, zone} with one — never a blocker, never first, never changing ready, and nothing is written", () => {
  const none = setup();
  const before = none.w.snapshot();
  const a = none.w.ca.publishPreflight(args(none));
  assert.deepEqual(none.w.snapshot(), before, "nothing written");
  assert.equal(a.first, null, JSON.stringify(a.first).slice(0, 300));
  assert.equal(sign(a).ratification.reached, true);
  assert.deepEqual(sign(a).publish_at, { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE" });
  assert.equal("publish_at_stated" in sign(a), false, "an answer read is stated as answered");
  /* the same answer ratification gives directly over the document op=publish stores */
  const r = none.w.ca.publishCase(args(none));
  assert.deepEqual(none.w.ratification.caseRatifyPreflight({ text: docOf(none.w, r).text, signer: "alice",
                                                             viewer: V("alice") }).publish_at, sign(a).publish_at);
  /* with the group's zone held */
  const zoned = setup();
  zoned.w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  const b = zoned.w.ca.publishPreflight(args(zoned));
  assert.equal(sign(b).publish_at.offered, true);
  assert.equal(typeof sign(b).publish_at.zone, "string");
  assert.ok(sign(b).publish_at.zone.length);
  const r2 = zoned.w.ca.publishCase(args(zoned));
  assert.deepEqual(sign(b).publish_at, zoned.w.ratification.caseRatifyPreflight({ text: docOf(zoned.w, r2).text,
    signer: "alice", viewer: V("alice") }).publish_at, "exactly as ratification R44 answers it");
  /* control: the offer moves nothing else of the answer */
  assert.deepEqual([b.ready, b.first, b.blockers], [a.ready, a.first, a.blockers]);
  assert.ok(![...b.blockers, b.first].some((x) => x && /PUBLISH_AT/.test(JSON.stringify(x))), "never a blocker or first");
});

test("R75: when the pre-flight's ratification check is not reached the sign step answers publish_at null with the sentence saying so, never an offer; a ratification answer carrying no offer is stated, never filled", () => {
  const x = setup();
  x.w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  const refused = x.w.ca.publishPreflight(args(x, { statement: "" }));
  assert.equal(refused.first.reason, "NO_STATEMENT");
  assert.equal(sign(refused).ratification.reached, false);
  assert.deepEqual([sign(refused).publish_at, sign(refused).publish_at_stated], [null, PUBLISH_AT_NOT_REACHED_SENTENCE]);
  /* reached, but the check answers no offer: null, and it says only "Publish now" is offered */
  const bare = setup({ ratification: (real) => new Proxy(real, { get: (t, k) => (k === "caseRatifyPreflight"
    ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[k] === "function" ? t[k].bind(t) : t[k]) }) });
  const p = bare.w.ca.publishPreflight(args(bare));
  assert.equal(sign(p).ratification.reached, true);
  assert.deepEqual([sign(p).publish_at, sign(p).publish_at_stated], [null, PUBLISH_AT_UNANSWERED_SENTENCE]);
  assert.equal(p.ready, true, "never changes ready");
});

test("R76: op=publish without tieAttested is refused TIE_ATTESTATION_MISSING naming the signer to herself only, and nothing is written; tieAttested \"yes\" (or any value but true) is no confirmation and is refused alike; the pre-flight answers it first", () => {
  const x = setup();
  const before = x.w.snapshot();
  const row = CASE_DISCLOSURE_CHECKS.TIE_ATTESTATION_MISSING;
  for (const tieAttested of [undefined, null, false, "yes", "true", 1, [{ signer: "alice", at: "2026-09-28T01:00:00Z" }]]) {
    const r = x.w.ca.publishCase(args(x, { tieAttested }));
    assert.deepEqual([r.ok, r.code, r.check, r.translation, r.missing], [false, "TIE_ATTESTATION_MISSING", row.check,
      row.translation, ["alice"]], JSON.stringify(tieAttested));
  }
  assert.deepEqual(x.w.snapshot(), before, "nothing written");
  /* the pre-flight answers exactly the act's refusal first */
  const pre = x.w.ca.publishPreflight(args(x, { tieAttested: "yes" }));
  assert.deepEqual(pre.first, x.w.ca.publishCase(args(x, { tieAttested: "yes" })));
  assert.equal(pre.ready, false);
  /* asked as another viewer, the signer is not named to them */
  const other = x.w.ca.publishCase(args(x, { tieAttested: undefined, viewer: V("bo") }));
  assert.notDeepEqual(other.missing, ["alice"]);
});

test("R76: with tieAttested true the stored document carries the signer's attestation with her and this act's instant, in the document she signs and nowhere else; control: the same act without it stores nothing", () => {
  const x = setup();
  const r = x.w.ca.publishCase(args(x, { tieAttested: true }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(memberTiesOf(x.w.fm(docOf(x.w, r).text)).filter((t) => t.row === "attestation")
    .map((t) => [t.signer, t.at]), [["alice", x.w.clock.now]]);
  const y = setup();
  const before = y.w.snapshot();
  assert.equal(y.w.ca.publishCase(args(y, { tieAttested: undefined })).code, "TIE_ATTESTATION_MISSING");
  assert.deepEqual(y.w.snapshot(), before);
});
