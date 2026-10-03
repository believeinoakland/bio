/* basis-versions R3 (N522; DEC-112 (6), DEC-96 item 1): a version's leg on another group's finding. Its form is judged
   by inquiry-grammar R11 (C-21.3) in place of C-25.10 and C-25.14; whether an acceptance is in force at the edition it
   names is accepted-work R3's (C-21.4, C-21.5), asked only when the leg is new or changed against the version it
   derives from. The edition is inside the composition, so the freeze (R6, R29) sees it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V } from "./fixture.mjs";
import { basisVersionFindings, versionsIn, versionAsWritten } from "../../../src/basis-versions/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const IMP = "a".repeat(64);
const REF = `imported:${IMP}/INQ-2026-0040-x`, REF2 = `imported:${IMP}/INQ-2026-0041-y`;

/* accepted-work's leg check as the test controls it: `accepted` holds `ref@edition` keys in force; every call is kept */
function acceptance(accepted = new Set()) {
  const calls = [];
  const acceptedLegRefusals = ({ legs, viewer }) => {
    calls.push({ legs: legs.map((l) => `${l.target}@${l.target_edition}`), viewer });
    return legs.filter((l) => !accepted.has(`${l.target}@${l.target_edition}`)).map((l) => ({
      check: "C-21.4", code: "IMPORTED_NOT_ACCEPTED", translation: "not accepted at that edition", ord: l.ord, ref: l.target,
      detail: `${l.target} is not accepted at edition ${l.target_edition}` }));
  };
  return { calls, accepted, acceptedLegRefusals };
}

/* one version over DOC and the given imported legs, each `[ref, edition, extra]` */
function withRefs(name, refs, extra = {}) {
  const b = version(name, [DOC], extra);
  for (const [ref, edition, more] of refs)
    b.legs.push({ version: name, target: ref, target_edition: edition, role: "supports", ground: "main", ...(more || {}) });
  return b;
}

const fm = (b) => ({ id: Q, object_type: "inquiry", basis_versions: b.versions, basis_version_grounds: b.grounds,
                     basis_version_legs: b.legs });

test("R3: a version's leg on an imported finding reference passes C-25.10 and C-25.14 when inquiry-grammar R11 judges its form, and a malformed one is R11's C-21.3, never C-25.10", () => {
  const ok = [];
  basisVersionFindings(fm(withRefs("first", [[REF, 2]])), ok);
  assert.deepEqual(ok, [], "a well-formed leg on another group's finding raises nothing");
  for (const bad of [{ target_edition: undefined }, { grade: "A" }, { grade_axis: "capture" }, { extent_kind: "page", extent_page: 1 },
                     { content_id: "f".repeat(64) }, { extent_capture: "e".repeat(64) }]) {
    const b = withRefs("first", [[REF, 2, bad]]);
    if ("target_edition" in bad) delete b.legs[1].target_edition;
    const f = [];
    basisVersionFindings(fm(b), f);
    assert.ok(f.length >= 1, JSON.stringify(bad));
    assert.ok(f.every((x) => x.check === "C-21.3"), `${JSON.stringify(bad)}: ${JSON.stringify(f.map((x) => x.check))}`);
  }
  /* the role arm still asks it; a local id that is not a ref is judged as before */
  const role = [];
  basisVersionFindings(fm(withRefs("first", [[REF, 2, { role: "decorates" }]])), role);
  assert.deepEqual(role.map((x) => x.check), ["C-25.10"]);
  const notRef = [];
  basisVersionFindings(fm(withRefs("first", [[`imported:${IMP}`, 2]])), notRef);
  assert.ok(notRef.some((x) => x.check === "C-25.10"), "a spelling R11 does not match is not a ref");
});

test("R3, R6: at the promotion a malformed leg on another group's finding is BASIS_VERSION_REFUSED with R11's C-21.3 finding and its translation, and accepted-work is not asked", () => {
  const aw = acceptance();
  const w = world({ acceptedWork: aw });
  w.doc(DOC);
  const r = w.inquiry(Q, block(withRefs("first", [[REF, 2, { grade: "A" }]])));
  assert.equal(r.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(r.findings.map((f) => [f.check, f.code, typeof f.translation]), [["C-21.3", "IMPORTED_LEG_MALFORMED", "string"]]);
  assert.deepEqual(aw.calls, []);
});

test("R3, R5: the edition a leg on another group's finding names is in the composition after the leg_capture lines, and a composition without one is unchanged", () => {
  const [v] = versionsIn(fm(withRefs("first", [[REF, 2]])));
  const lines = v.composition.split("\n");
  assert.equal(lines[lines.length - 1], "leg_edition\t1\t2");
  const [plain] = versionsIn(fm(version("first", [DOC])));
  assert.ok(!plain.composition.includes("leg_edition"));
  const w = versionAsWritten({ name: "x", description: "a reading of it", author: "member:alice", at: "2026-09-27T00:00:00Z",
    legs: [{ target: REF, target_edition: 3, role: "supports" }, { target: DOC, role: "supports" }] });
  assert.equal(w.legs[0].target_edition, 3);
  assert.ok(!("extent_kind" in w.legs[0]), "a leg on another group's finding carries no extent");
  assert.equal(w.legs[1].extent_kind, "document");
});

test("R3: a new version's leg on another group's finding not accepted at its edition is refused BASIS_VERSION_REFUSED with accepted-work R3's finding (C-21.4), and nothing is written", () => {
  const aw = acceptance(new Set([`${REF}@2`]));
  const w = world({ acceptedWork: aw });
  w.doc(DOC);
  const r = w.inquiry(Q, block(withRefs("first", [[REF, 2], [REF2, 1]])), { author: V("alice") });
  assert.equal(r.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(r.findings.map((f) => [f.check, f.code, f.version, f.ref]), [["C-21.4", "IMPORTED_NOT_ACCEPTED", "first", REF2]]);
  assert.match(r.findings[0].detail, /basis_version_legs\[2\] \(version 'first'\)/);
  assert.equal(w.record.head(Q), null);
  assert.deepEqual(aw.calls, [{ legs: [`${REF}@2`, `${REF2}@1`], viewer: V("alice") }], "asked once, as the promotion's author");
  /* accepted at that edition: it lands, the ref projected as spelled with no content row */
  aw.accepted.add(`${REF2}@1`);
  assert.equal(w.inquiry(Q, block(withRefs("first", [[REF, 2], [REF2, 1]]))).ok, true);
  const legs = w.rows(`SELECT ord, target_id, content_id, target_edition FROM inquiry_basis_version_legs WHERE bundle_id=? ORDER BY ord`, Q);
  assert.deepEqual(legs.map((l) => [l.target_id, l.content_id === null, l.target_edition]),
                   [[DOC, false, null], [REF, true, 2], [REF2, true, 1]], "the edition is stored on the leg's row (K1305)");
  /* the read of a version's legs answers the edition, so strength reads it there */
  const read = w.bv.basisVersions({ id: Q, viewer: V("alice") });
  assert.deepEqual(read.versions[0].legs.map((l) => [l.target_id, l.target_edition]), [[DOC, null], [REF, 2], [REF2, 1]]);
});

test("R3: a leg is asked only when new or changed against the version it derives from; a held version is never asked again, so a withdrawal never refuses an unrelated revision", () => {
  const aw = acceptance(new Set([`${REF}@2`]));
  const w = world({ acceptedWork: aw });
  w.doc(DOC);
  assert.equal(w.inquiry(Q, block(withRefs("first", [[REF, 2]]))).ok, true);
  aw.accepted.clear();   /* the acceptance is withdrawn */
  aw.calls.length = 0;
  /* an unrelated revision (a state move) of the held version: not asked */
  const moved = w.revise(Q, inqMd(Q, block(withRefs("first", [[REF, 2]], { state: "considering", state_by: "member:bo",
    state_at: "2026-09-28T00:00:00Z", state_reason: "looking again at it" }))));
  assert.equal(moved.ok, true, JSON.stringify(moved).slice(0, 300));
  /* a derived version carrying the same leg at the same edition: not asked */
  const held = withRefs("first", [[REF, 2]], { state: "considering", state_by: "member:bo", state_at: "2026-09-28T00:00:00Z",
                                                state_reason: "looking again at it" });
  const same = w.revise(Q, inqMd(Q, block(merge(held, withRefs("second", [[REF, 2]], { derived_from: "first" })))));
  assert.equal(same.ok, true, JSON.stringify(same).slice(0, 300));
  assert.deepEqual(aw.calls, []);
  /* a derived version naming another edition: asked, and refused */
  const other = w.revise(Q, inqMd(Q, block(merge(held, withRefs("second", [[REF, 2]], { derived_from: "first" }),
    withRefs("third", [[REF, 3]], { derived_from: "first" })))));
  assert.equal(other.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(aw.calls.map((c) => c.legs), [[`${REF}@3`]]);
  assert.equal(other.findings[0].version, "third");
  /* a fresh version (no parent) is asked for every such leg */
  aw.calls.length = 0;
  w.revise(Q, inqMd(Q, block(merge(held, withRefs("second", [[REF, 2]], { derived_from: "first" }), withRefs("fourth", [[REF, 2]])))));
  assert.deepEqual(aw.calls.map((c) => c.legs), [[`${REF}@2`]]);
});

test("R3, R6, R29: changing the edition of a held version's leg is VERSION_FROZEN, never re-asked", () => {
  const aw = acceptance(new Set([`${REF}@2`, `${REF}@3`]));
  const w = world({ acceptedWork: aw });
  w.doc(DOC);
  assert.equal(w.inquiry(Q, block(withRefs("first", [[REF, 2]]))).ok, true);
  aw.calls.length = 0;
  const r = w.revise(Q, inqMd(Q, block(withRefs("first", [[REF, 3]]))));
  assert.deepEqual([r.reason, r.changed], ["VERSION_FROZEN", "leg_edition changed"]);
  assert.deepEqual(aw.calls, []);
});

test("R3: narrowing a version that holds a leg on another group's finding copies that leg whole, and the copy is not asked again", () => {
  const aw = acceptance(new Set([`${REF}@2`]));
  const w = world({ acceptedWork: aw });
  w.doc(DOC);
  assert.equal(w.inquiry(Q, block(withRefs("first", [[REF, 2]]))).ok, true);
  /* the ref leg itself has no part to name */
  const noPart = w.bv.narrowCandidates({ target: Q, version: "first", ord: 1, viewer: V("alice") });
  assert.equal(noPart.reason, "NARROW_NO_PART");
  aw.accepted.clear();
  aw.calls.length = 0;
  const r = w.bv.narrow({ target: Q, version: "first", ord: 0, name: "narrower", author: "member:alice", viewer: V("alice"),
                          description: "points at page three, where the vote is recorded",
                          extent: { extent_kind: "pdf-page", extent_page: "2" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const legs = w.rows(`SELECT ord, target_id FROM inquiry_basis_version_legs WHERE bundle_id=? AND name='narrower' ORDER BY ord`, Q);
  assert.deepEqual(legs.map((l) => l.target_id), [DOC, REF]);
  assert.match(w.row(`SELECT composition FROM inquiry_basis_versions WHERE bundle_id=? AND name='narrower'`, Q).composition,
               /\nleg_edition\t1\t2$/, "the copy carries the edition");
  assert.deepEqual(aw.calls, [], "the copied leg is the parent's, so it is not asked");
});

test("R3: a leg check that fails is not a pass — the leg is refused BASIS_VERSION_REFUSED and nothing is written", () => {
  const w = world({ acceptedWork: { acceptedLegRefusals: () => { throw new Error("broken"); } } });
  w.doc(DOC);
  const r = w.inquiry(Q, block(withRefs("first", [[REF, 2]])));
  assert.equal(r.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(r.findings.map((f) => [f.code, f.version]), [["ACCEPTED_WORK_UNREADABLE", "first"]]);
  assert.equal(w.record.head(Q), null);
});

test("R3: through accepted-work's own instance — with nothing registered the leg is C-21.5, at an edition not accepted C-21.4, and accepted at that edition it lands", () => {
  const w = world();
  w.doc(DOC);
  const none = w.inquiry(Q, block(withRefs("first", [[REF, 2]])));
  assert.equal(none.reason, "BASIS_VERSION_REFUSED");
  assert.deepEqual(none.findings.map((f) => [f.check, f.code, f.version, typeof f.translation]),
                   [["C-21.5", "ACCEPTED_WORK_UNREADABLE", "first", "string"]]);
  const aw = acceptedWorkOf(w.host);
  const asked = [];
  assert.equal(aw.registerAcceptedWork("case-import", {
    finding: ({ ref, edition, viewer }) => { asked.push([ref, edition, viewer]);
      return edition === 2 ? { ref, edition, acceptance: { by: "member:bo", at: "2026-09-27T00:00:00Z", reason: "checked" } }
                           : { ref, edition, acceptance: null }; },
    openFlags: () => ({ flags: [], complete: true }), withdrawals: () => ({ withdrawals: [], cursor: null }) }).ok, true);
  const other = w.inquiry(Q, block(withRefs("first", [[REF, 3]])));
  assert.deepEqual(other.findings.map((f) => [f.check, f.code]), [["C-21.4", "IMPORTED_NOT_ACCEPTED"]]);
  assert.equal(w.inquiry(Q, block(withRefs("first", [[REF, 2]]))).ok, true);
  assert.deepEqual(asked.at(-1), [REF, 2, V("alice")], "asked as the promotion's author");
});
