/* basis-versions: a conclusion belongs to a PROJECT's relationship with the question (R31, R18, R22), a reading with no
 * claim cannot be adopted (R17), the no-project conclusion is no project's (R11, R22, R23), and a hand-authored adoption
 * its reading does not bear out reads undetermined (R23).
 *
 * Carried from the old battery's `test/conclude-project.test.mjs` (REC-124, REC-136; Miniflare, driven through the ops).
 * Its share here: §1's two projects concluding one shared question on DIFFERENT readings with DIFFERENT claims (the
 * shared-state liar's defence: with one claim echoed to every project, same words would hide it), each reading back its
 * own, neither moving the other nor the question, and A's re-conclude leaving B unmoved; §1/§2's drawing project that
 * concluded nothing reading null, never another team's; §2's NO_CLAIM doors, each writing nothing, including a project
 * standing on an ACCEPTED reading that states no claim (the door `conclude.test.mjs` R17 drives only without a
 * project), and the free-text refusal writing nothing; §3/§3b's no-project conclusion not inherited by a project drawing
 * on the question — even one standing on the very reading adopted — and a project concluding a question whose own state
 * is concluded leaving that conclusion untouched; §3b's hand-authored adoption naming a reading the inquiry DOES carry
 * but whose claim differs (R23's existing-reading case; `conclude.test.mjs` drives only the missing-reading case), with
 * the matching pair as its negative control.
 *
 * Not carried: §1 item 3 and §5's notices (the `shared-inquiry-concluded-by-another-project` finding, its filing,
 * `basis.elsewhere`, muting) are queue-producers'; §4's strength pair is strength's (`op=versionstrength`); §5's op=audit
 * C-5.1 over a rewritten `conclusions` history is the audit catalogue's, not this module's; the refusal order, R18's row
 * bytes, R19's writes, R20's withdrawal, R22's record reads, R23's legacy undetermined and R32's append-only history are
 * already proven by `conclude.test.mjs`, R11's absent fields by `reads.test.mjs`; the Session Log regexes on minted ids
 * and the `entriesIn` byte counts are replaced here by the module's own record reads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V } from "./fixture.mjs";

const LEDGER = "INFO-2026-4124-ledger", MINUTES = "INFO-2026-4124-minutes", AUDIT = "INFO-2026-4124-audit";
const Q = "INQ-2026-4124-sewer-transfers";
const NP = "INQ-2026-4136-no-project", LEG = "INQ-2026-4124-legacy-question";
const FORGED = "INQ-2026-4136-forged-adoption", MATCHED = "INQ-2026-4136-matched-adoption";
const T = "2026-09-27T00:00:00Z", NOW = "2026-09-28T01:00:00Z", RUTH = "member:ruth";
const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const CLAIM_NP = "The ledger shows the transfer was booked before the council met.";
const CLAIM_L = "The legacy question has a claimed answer.";
const LEGACY_TEXT = "The legacy transfer was authorised.";
const VA = "paper trail", VB = "the audit", VN = "no claim stated", VNP = "booked early", VL = "legacy reading";
const ACC = { state: "accepted", state_by: RUTH, state_at: T, state_reason: "" };

/* a project's current_versions block, one row per [inquiry, version] */
const standsOn = (...pairs) => ["current_versions:", ...pairs.flatMap(([q, v]) =>
  [`  - inquiry: "${q}"`, `    version: "${v}"`, `    at: "${T}"`, `    by: "${RUTH}"`])];

function setup() {
  const w = world({ now: NOW });
  for (const d of [LEDGER, MINUTES, AUDIT]) w.doc(d);
  w.member("ruth");
  const q = w.inquiry(Q, block(merge(version(VA, [LEDGER, MINUTES], { ...ACC, claim: CLAIM_A }),
    version(VB, [AUDIT], { ...ACC, claim: CLAIM_B }), version(VN, [LEDGER], ACC),
    { basis: [{ target: LEDGER, role: "supports" }, { target: MINUTES, role: "supports" }], refs: [LEDGER, MINUTES, AUDIT] })),
    { author: RUTH });
  assert.equal(q.ok, true, JSON.stringify(q).slice(0, 300));
  const np = w.inquiry(NP, block(merge(version(VNP, [LEDGER], { ...ACC, claim: CLAIM_NP }),
    { basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] })), { author: RUTH });
  assert.equal(np.ok, true, JSON.stringify(np).slice(0, 300));
  /* LEG is concluded IN ITS OWN BYTES, the legacy shape the act can no longer write; its reading VL is accepted */
  const leg = w.promotion.promote({ bundleId: LEG, base: null, snapKey: "legacy", author: RUTH, meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(LEG, [...block(merge(version(VL, [LEDGER], { ...ACC, claim: CLAIM_L }),
      { basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] })),
      `conclusion: "${LEGACY_TEXT}"`, 'falsifier: "a rescinding minute"'], { state: "concluded" }) }] });
  assert.equal(leg.ok, true, JSON.stringify(leg).slice(0, 300));
  /* A and B share Q on DIFFERENT readings; C does not draw on Q; D draws and stands on nothing; E stands on VN */
  const A = w.project("Oversight", "ruth", [Q, LEG, NP], { extra: standsOn([Q, VA], [LEG, VL], [NP, VNP]) });
  const B = w.project("Budget", "ruth", [Q], { extra: standsOn([Q, VB]) });
  const C = w.project("Unrelated", "ruth", []);
  const D = w.project("Undecided", "ruth", [Q]);
  const E = w.project("Claimless", "ruth", [Q], { extra: standsOn([Q, VN]) });
  return { w, A, B, C, D, E };
}
const conclude = (w, o) => w.bv.conclude({ author: RUTH, viewer: V("ruth"), identity: RUTH, ...o });
const read = (w, id, project) => w.bv.basisVersions({ id, viewer: V("ruth"), limit: 50, ...(project ? { project } : {}) });

test("R31, R18, R22: two projects sharing one question conclude on different readings — each reads back its OWN claim, neither moves the other, and the shared question's bytes, state and own conclusion do not move; a re-conclude by one leaves the other as it was", () => {
  const { w, A, B } = setup();
  assert.notEqual(CLAIM_A, CLAIM_B, "the fixture is real: two distinct claims, so a shared-state echo cannot hide");
  const qSha = w.sha(Q), qText = w.text(Q);
  const ra = conclude(w, { target: Q, project: A, falsifier: "a council minute rescinding the 2024 process" });
  assert.deepEqual([ra.ok, ra.project, ra.relationship, ra.claim, ra.version, ra.inquiry_moved, ra.inquiry_state],
    [true, A, "project", { state: "adopted", text: CLAIM_A, version: VA }, VA, false, "open"]);
  const bBefore = w.sha(B);
  const rb = conclude(w, { target: Q, project: B, falsifier: "a recorded council vote on the transfer" });
  assert.deepEqual([rb.ok, rb.project, rb.claim.text, rb.version], [true, B, CLAIM_B, VB]);
  assert.notEqual(w.sha(B), bBefore);

  const ca = read(w, Q, A).conclusion, cb = read(w, Q, B).conclusion;
  assert.deepEqual([ca.project, ca.state, ca.version, ca.claim, ca.claim_state], [A, "concluded", VA, CLAIM_A, "adopted"], "A's own");
  assert.deepEqual([cb.project, cb.state, cb.version, cb.claim, cb.claim_state], [B, "concluded", VB, CLAIM_B, "adopted"], "B's own, not A's");
  assert.notEqual(ca.claim, cb.claim, "the two reads differ in the claim concluded");
  assert.deepEqual([w.bv.conclusionOf(A, Q, V("ruth")).claim, w.bv.conclusionOf(B, Q, V("ruth")).claim], [CLAIM_A, CLAIM_B]);
  assert.deepEqual([read(w, Q, A).conclusion_history.length, read(w, Q, B).conclusion_history.length], [1, 1],
    "each record holds its own one row, never the other's");

  assert.equal(w.sha(Q), qSha, "the shared question's bundle_sha does not move");
  assert.equal(w.text(Q), qText, "nor its bytes");
  assert.equal(w.row(`SELECT current_state FROM bundles WHERE bundle_id=?`, Q).current_state, "open");
  assert.equal(read(w, Q).no_project_conclusion, null, "nobody concluded in the no-project relationship");
  assert.ok(!w.text(Q).includes("conclusions:"), "never written on the shared question");
  assert.deepEqual([w.text(B).includes(CLAIM_B), w.text(B).includes(CLAIM_A)], [true, false], "B's bytes carry B's claim, not A's");

  /* A moves to VB and concludes again: the record appends, naming the entry it follows; B does not move */
  assert.equal(w.bv.versionCurrent({ target: Q, version: VB, project: A, author: RUTH, viewer: V("ruth"), identity: RUTH }).ok, true);
  const bSha = w.sha(B);
  const ra2 = conclude(w, { target: Q, project: A, falsifier: "a recorded council vote on the transfer" });
  assert.deepEqual([ra2.ok, ra2.claim.text, ra2.prior.act, ra2.prior.claim, ra2.prior.version, ra2.history_length],
    [true, CLAIM_B, "concluded", CLAIM_A, VA, 2]);
  const ha = read(w, Q, A);
  assert.deepEqual([ha.conclusion_history.map((e) => [e.act, e.version, e.claim]), ha.conclusion_stance, ha.conclusion.version],
    [[["concluded", VA, CLAIM_A], ["concluded", VB, CLAIM_B]], "concluded", VB], "both of A's conclusions stay readable");
  assert.equal(w.sha(B), bSha, "A's second act wrote nothing on B");
  assert.deepEqual(read(w, Q, B).conclusion_history.map((e) => [e.version, e.claim]), [[VB, CLAIM_B]]);
  assert.equal(w.sha(Q), qSha, "nor on the question");
});

test("R22, R11: a project drawing on the question that concluded nothing reads null — never another team's — while two others have concluded", () => {
  const { w, A, B, D, E } = setup();
  assert.equal(conclude(w, { target: Q, project: A, falsifier: "f" }).ok, true);
  assert.equal(conclude(w, { target: Q, project: B, falsifier: "f" }).ok, true);
  for (const [p, stands] of [[D, null], [E, VN]]) {
    const r = read(w, Q, p);
    assert.deepEqual([r.current?.version ?? null, r.conclusion, r.conclusion_stance, r.conclusion_history], [stands, null, "none", []], p);
    assert.equal(w.bv.conclusionOf(p, Q, V("ruth")), null, p);
    assert.deepEqual(w.bv.conclusionRecordOf(p, Q, V("ruth")), { history: [], stance: null }, p);
  }
});

test("R17, R16: every NO_CLAIM door — including a project standing on an ACCEPTED reading that states no claim — is refused by name with its detail and writes nothing; free text beside a project is CONCLUSION_IS_THE_CLAIM and writes nothing", () => {
  const { w, A, B, C, D, E } = setup();
  assert.equal(conclude(w, { target: Q, project: B, falsifier: "f" }).ok, true);
  const ids = [Q, A, B, C, D, E];
  const shas = () => ids.map((id) => w.sha(id));
  const before = shas();
  assert.equal(w.row(`SELECT state, claim FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, Q, VN).state, "accepted",
    "the fixture is real: E's reading is accepted and states no claim");
  const e = conclude(w, { target: Q, project: E, falsifier: "x" });
  assert.deepEqual([e.ok, e.reason, e.project, e.version], [false, "NO_CLAIM", E, VN]);
  assert.match(e.detail, /states no claim/);
  for (const [label, p] of [
    ["a project that does not draw on the question", { project: C, falsifier: "x" }],
    ["a project that stands on no reading", { project: D, falsifier: "x" }],
    ["commentary with no project", { conclusion: "It did.", falsifier: "x", commentary: "a note", version: VA }],
    ["no project and no version named", { conclusion: "It did.", falsifier: "x" }],
    ["no project, a reading the inquiry does not carry", { conclusion: "It did.", falsifier: "x", version: "no such reading" }],
    ["a project naming a reading other than its CURRENT", { project: B, falsifier: "x", version: VA }],
  ]) {
    const r = conclude(w, { target: Q, ...p });
    assert.deepEqual([r.ok, r.reason, typeof r.detail === "string" && r.detail.length > 40], [false, "NO_CLAIM", true], label);
  }
  const free = conclude(w, { target: Q, project: B, conclusion: "The transfer was improper.", falsifier: "x" });
  assert.deepEqual([free.ok, free.reason], [false, "CONCLUSION_IS_THE_CLAIM"]);
  assert.deepEqual(shas(), before, "nothing was written: the question and every project are byte-identical");
  assert.equal(w.row(`SELECT current_state FROM bundles WHERE bundle_id=?`, Q).current_state, "open");
  assert.deepEqual([w.bv.conclusionOf(E, Q, V("ruth")), w.bv.conclusionOf(D, Q, V("ruth"))], [null, null]);
  assert.equal(w.bv.conclusionOf(B, Q, V("ruth")).claim, CLAIM_B, "B's conclusion survived the refused attempts unchanged");
  /* negative control: the same door with a claim on the reading is accepted */
  assert.equal(conclude(w, { target: Q, project: A, falsifier: "x" }).ok, true);
});

test("R11, R22, R23, R19, R31: the no-project conclusion is no project's — a project drawing on the question, even standing on the very reading adopted, inherits nothing; a project may conclude a question concluded in its own bytes, and that conclusion stays untouched", () => {
  const { w, A } = setup();
  const aSha = w.sha(A);
  const r = conclude(w, { target: NP, conclusion: "It was booked before the meeting.",
    falsifier: "a booking entry dated after the meeting", version: VNP });
  assert.deepEqual([r.ok, r.relationship, r.project, r.claim], [true, "no_project", null, { state: "adopted", text: CLAIM_NP, version: VNP }]);
  assert.ok(w.text(NP).includes(`Adopted: reading '${VNP}', claim: ${CLAIM_NP}`), "the Session Log names the adoption");
  assert.equal(w.sha(A), aSha, "the no-project act wrote nothing on the project");
  const np = read(w, NP, A);
  assert.deepEqual([np.current.version, np.conclusion, np.conclusion_stance, np.conclusion_history], [VNP, null, "none", []],
    "A stands on the adopted reading and still inherits no conclusion");
  assert.deepEqual([np.no_project_conclusion.relationship, np.no_project_conclusion.claim.state, np.no_project_conclusion.claim.text],
    ["no_project", "adopted", CLAIM_NP], "the no-project conclusion is still answered, as the question's own");
  assert.equal(w.bv.conclusionOf(A, NP, V("ruth")), null);

  /* the legacy question, concluded in its own bytes */
  const lg = read(w, LEG, A);
  assert.deepEqual([lg.current.version, lg.conclusion, lg.conclusion_stance, lg.no_project_conclusion.conclusion,
                    lg.no_project_conclusion.claim.state], [VL, null, "none", LEGACY_TEXT, "undetermined"]);
  const legSha = w.sha(LEG), legText = w.text(LEG);
  const pa = conclude(w, { target: LEG, project: A, falsifier: "a rescinding minute" });
  assert.deepEqual([pa.ok, pa.claim.text, pa.inquiry_moved, pa.inquiry_state], [true, CLAIM_L, false, "concluded"],
    "the other relationship's state does not bar A concluding for itself");
  assert.deepEqual([w.sha(LEG) === legSha, w.text(LEG) === legText], [true, true], "the question's own conclusion is untouched");
  const after = read(w, LEG, A);
  assert.deepEqual([after.conclusion.claim, after.conclusion.version, after.no_project_conclusion.conclusion,
                    after.no_project_conclusion.claim.state, after.no_project_conclusion.claim.text],
    [CLAIM_L, VL, LEGACY_TEXT, "undetermined", null], "A reads its own; the no-project one is neither replaced nor back-filled");
});

test("R23: a hand-authored adoption naming a reading the question DOES carry, whose claim differs from the one recorded, reads undetermined with why; the same pair matching the reading's claim reads adopted", () => {
  const w = world({ now: NOW });
  w.doc(LEDGER);
  const put = (id, claim) => w.promotion.promote({ bundleId: id, base: null, snapKey: id, author: RUTH, meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(id, [...block(merge(version(VNP, [LEDGER], { ...ACC, claim: CLAIM_NP }),
      { basis: [{ target: LEDGER, role: "supports" }], refs: [LEDGER] })),
      'conclusion: "It was booked early."', 'falsifier: "a later booking entry"',
      `conclusion_version: "${VNP}"`, `conclusion_claim: "${claim}"`], { state: "concluded" }) }] });
  for (const [id, claim] of [[FORGED, "A claim the reading never stated."], [MATCHED, CLAIM_NP]])
    assert.equal(put(id, claim).ok, true, id);
  assert.equal(w.row(`SELECT claim FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, FORGED, VNP).claim, CLAIM_NP,
    "the fixture is real: the named reading is carried, stating another claim");
  const fg = w.bv.noProjectConclusionOf(FORGED);
  assert.deepEqual([fg.relationship, fg.conclusion, fg.claim.state, fg.claim.text, fg.claim.version],
    ["no_project", "It was booked early.", "undetermined", null, null]);
  assert.match(fg.claim.detail, /does not state the claim recorded/);
  assert.doesNotMatch(fg.claim.detail, /carries no such reading/);
  assert.deepEqual(read(w, FORGED).no_project_conclusion, fg, "op=basisversions answers the same");
  assert.deepEqual(w.bv.noProjectConclusionOf(MATCHED).claim, { state: "adopted", text: CLAIM_NP, version: VNP }, "negative control");
});
