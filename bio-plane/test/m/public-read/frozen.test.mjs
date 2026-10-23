/* public-read — R38 `publishedFrozen` (T51-75; DEC-330 A37): what each published case froze for a question, with its
   signers and the pin check, at the module's interface (the method and `op=publishedfrozen` as the plane store's op map
   runs it). Each arm names the id; the answers are read by key, never against a sentence people read (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SIG } from "./fixture.mjs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { PUBLIC_READ_OWN_OPS } from "../../../src/public-read/reads.mjs";

const F = "INQ-2026-0001", G = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";
const C1 = "CASE-2026-0001", C2 = "CASE-2026-0002";
const PUBLISHED = ["published_bundles", "published_shas", "published_cases", "published_case_members", "cases",
                   "published_edges", "case_documents"];
const BC = [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }];
const T_A = "2026-10-01T10:00:00Z", T_B = "2026-10-02T10:00:00Z";

/* F published and pinned by C1 (pair B/C, signed by olive); a second case C2 pins the same bytes at its own pair, signed
   by bo, when `second` is true. */
function twoCases({ second = true, secondStrength = [{ target: F, axis: "capture", grade: "D" }, { target: F, axis: "connection", grade: "A" },
                                                     { target: F, axis: "testimony", grade: "B" }] } = {}) {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  const proj2 = w.project("Streets", "bo");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  const roster = [{ bundle_id: F, version_sha: pin, role: "load_bearing" }];
  w.prepare(C1, 1, { project: proj, roles, strength: BC });
  assert.equal(w.signCase(C1, 1, { project: proj, roster, at: T_A }).ok, true);
  assert.equal(w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }], at: T_A }).ok, true);
  if (second) {
    w.prepare(C2, 1, { project: proj2, roles, strength: secondStrength });
    assert.equal(w.signCase(C2, 1, { project: proj2, roster, signer: "bo", sig: SIG(2), at: T_B }).ok, true);
  }
  return { w, pin, proj, proj2, roles, roster };
}

test("R38 a finding two cases pin answers one entry for each, in case order, each with its own frozen pair, its signers and `pinned: true`", () => {
  const { w, pin, proj, proj2 } = twoCases();
  const r = w.read("publishedfrozen", { id: F });
  assert.deepEqual([r.ok, r.id, r.detail], [true, F, word("public-read.frozen.detail.cases")]);
  assert.deepEqual(r.cases.map((c) => [c.case_id, c.edition, c.project]), [[C1, 1, proj], [C2, 1, proj2]]);
  const [a, b] = r.cases;
  assert.deepEqual([a.finding, b.finding], [{ edition: 1, bundle_sha: pin }, { edition: 1, bundle_sha: pin }],
                   "the finding edition is the member's own, never the case's");
  assert.deepEqual([a.version_sha, a.pinned, b.version_sha, b.pinned], [pin, true, pin, true]);
  assert.deepEqual([a.strength.capture.grade, a.strength.connection.grade, "testimony" in a.strength], ["B", "C", false],
                   "a pair without a testimony axis carries none");
  assert.deepEqual([b.strength.capture.grade, b.strength.connection.grade, b.strength.testimony.grade], ["D", "A", "B"],
                   "the case that froze a testimony axis carries it");
  assert.deepEqual([a.strength_from, b.strength_from], ["case_document", "case_document"]);
  assert.deepEqual([a.signed_by.member, b.signed_by.member], ["h_olive", "h_bo"], "each case document's own signer, named by her handle (R41)");
  assert.deepEqual([a.delivered_by, b.delivered_by], [{ kind: "member", member: "h_olive" }, { kind: "member", member: "h_bo" }],
                   "the deliverer beside the signer, a second fact (R12)");
  assert.deepEqual([a.finding_signed_by.member, b.finding_signed_by.member], ["h_olive", "h_olive"], "the finding's own signer");
  assert.equal(typeof a.signed_by.key_b64, "string");
  assert.deepEqual([a.signed_at, a.published_at, b.signed_at, b.published_at].map((x) => typeof x), ["string", "string", "string", "string"]);
  assert.deepEqual([a.withdrawn, b.withdrawn, a.withheld, b.withheld], [null, null, null, null]);
});

test("R38 each entry's pair is what `publishedCase` of that case and edition answers for the finding, and nothing composes a strength across entries", () => {
  const { w } = twoCases();
  const r = w.read("publishedfrozen", { id: F });
  for (const c of r.cases) {
    const f = w.pr.publishedCase({ id: c.case_id, edition: c.edition }).findings.find((x) => x.bundle_id === F);
    for (const row of f.strength) assert.deepEqual(c.strength[row.axis], row, `${c.case_id} ${row.axis}`);
    assert.deepEqual(Object.keys(c.strength).sort(), f.strength.map((x) => x.axis).sort());
    assert.deepEqual(c.signed_by, w.pr.publishedCase({ id: c.case_id }).document.attestor);
    assert.deepEqual(c.finding_signed_by, f.attestor);
  }
  const top = Object.keys(r).sort();
  assert.deepEqual(top, ["cases", "detail", "id", "ok"], "no field beside the entries names a pair");
  for (const k of ["strength", "capture", "connection", "grade"]) assert.equal(k in r, false, `no top-level ${k}`);
  assert.equal(JSON.stringify(r.cases[0].strength).includes('"D"'), false, "one case's pair never shows in another's entry");
});

test("R38 `pinned` is read from the bytes: a pin-less member answers null, never true by default; a pin that differs from the published finding's hash answers false", () => {
  const { w, pin, proj } = twoCases({ second: false });
  /* a case rostering the finding with no pin (the model before the pin), read at the finding's edition */
  w.prepare(C2, 1, { project: proj, roles: [{ target: F, version_sha: null }], strength: [{ target: F, axis: "capture", grade: "A" }] });
  assert.equal(w.signCase(C2, 1, { project: proj, roster: [{ bundle_id: F, version_sha: null, role: "load_bearing" }] }).ok, true);
  const r = w.read("publishedfrozen", { id: F });
  const none = r.cases.find((c) => c.case_id === C2);
  assert.deepEqual([none.version_sha, none.pinned, none.finding.bundle_sha], [null, null, pin]);
  assert.equal(r.cases.find((c) => c.case_id === C1).pinned, true);
  /* a third case pins other bytes than the ones the finding's edition 1 is published at */
  const other = "ab".repeat(32);
  w.prepare("CASE-2026-0003", 1, { project: proj, roles: [{ target: F, version_sha: other, edition: 1 }],
                                    strength: [{ target: F, axis: "capture", grade: "C" }] });
  assert.equal(w.signCase("CASE-2026-0003", 1, { project: proj, roster: [{ bundle_id: F, version_sha: other, role: "load_bearing" }] }).ok, true);
  const bad = w.read("publishedfrozen", { id: F }).cases.find((c) => c.case_id === "CASE-2026-0003");
  assert.deepEqual([bad.pinned, bad.version_sha, bad.finding], [false, other, { edition: 1, bundle_sha: pin }]);
  assert.equal(bad.strength.capture.grade, "C", "the pair is still that case's own reading, with the pin check beside it");
});

test("R38 a finding in no case answers `cases: []` and says so; an edition not yet published is absent; a pin naming nothing published lists no case", () => {
  const { w, pin, proj, roles } = twoCases({ second: false });
  w.doc("INFO-2026-0002-loose");
  assert.equal(w.signFinding("INFO-2026-0002-loose", {}).ok, true);
  const loose = w.read("publishedfrozen", { id: "INFO-2026-0002-loose" });
  assert.deepEqual([loose.ok, loose.id, loose.cases], [true, "INFO-2026-0002-loose", []]);
  assert.equal(loose.detail, word("public-read.frozen.detail.none"), "and its statement is not the one a case-holding answer makes");
  /* a case edition prepared but never signed has no published row: it pins nothing here */
  w.prepare(C2, 1, { project: proj, roles, strength: [{ target: F, axis: "capture", grade: "A" }] });
  assert.deepEqual(w.read("publishedfrozen", { id: F }).cases.map((c) => c.case_id), [C1], "an unsigned preparation is not listed");
  assert.equal(w.read("publishedfrozen", { id: F }).cases[0].finding.bundle_sha, pin);
  /* a case whose pin names bytes nothing published holds and whose document states an edition nothing published holds pins no
     published edition of this finding */
  w.prepare("CASE-2026-0005", 1, { project: proj, roles: [{ target: F, version_sha: "cd".repeat(32), edition: 9 }] });
  assert.equal(w.signCase("CASE-2026-0005", 1, { project: proj, roster: [{ bundle_id: F, version_sha: "cd".repeat(32), role: "load_bearing" }] }).ok, true);
  assert.deepEqual(w.read("publishedfrozen", { id: F }).cases.map((c) => c.case_id), [C1], "a pin naming nothing published is not listed");
  w.inquiry(G);
  w.prepare("CASE-2026-0004", 1, { project: proj, roles: [{ target: G, version_sha: w.head(G) }] });
  assert.equal(w.signCase("CASE-2026-0004", 1, { project: proj, roster: [{ bundle_id: G, version_sha: w.head(G), role: "load_bearing" }] }).ok, true);
  assert.deepEqual(w.read("publishedfrozen", { id: G }).reason, "NOT_PUBLISHED", "a finding with no published edition is not published");
});

test("R38 no id is NO_ID; an id never published and an id of working material answer one and the same NOT_PUBLISHED bytes, publishedCase's for an absent case", () => {
  const { w } = twoCases();
  w.inquiry("INQ-2026-0009-working");
  const none = w.read("publishedfrozen", {});
  assert.deepEqual([none.ok, none.reason], [false, "NO_ID"]);
  assert.deepEqual(w.pr.publishedFrozen({ id: "  " }), none, "a blank id is no id");
  const never = w.read("publishedfrozen", { id: "INQ-2099-0001-nothing" });
  const working = w.read("publishedfrozen", { id: "INQ-2026-0009-working" });
  assert.deepEqual([never.reason, never.check, never.translation], ["NOT_PUBLISHED", "C-98.8", rowOf("NOT_PUBLISHED").translation]);
  assert.equal(JSON.stringify(working), JSON.stringify(never), "working material answers as what does not exist (R14)");
  assert.equal(JSON.stringify(never), JSON.stringify(w.pr.publishedCase({})), "the same bytes as publishedCase for an absent case");
  assert.equal(JSON.stringify(w.read("publishedfrozen", { id: C1 })), JSON.stringify(never), "a case's id is not a question's");
});

test("R38 a court order withholding an edition whole lists it with `withheld` and no pair or signer of the case; the other case is untouched", () => {
  const { w } = twoCases();
  w.stamps.stamp({ case: C1, editions: [1], entry: { seq: 4 }, effect: "remove" });
  const r = w.read("publishedfrozen", { id: F });
  const [a, b] = r.cases;
  assert.deepEqual([a.case_id, a.withheld.whole, a.withheld.document, Array.isArray(a.withheld.orders)], [C1, true, true, true]);
  assert.deepEqual([a.strength, a.strength_from, a.signed_by, a.delivered_by], [null, null, null, null]);
  assert.deepEqual([a.finding.edition, a.pinned], [1, true], "its identity and pin check stay: both are public");
  assert.deepEqual([b.case_id, b.withheld, b.strength.capture.grade, b.signed_by.member], [C2, null, "D", "h_bo"]);
  assert.equal(JSON.stringify(a).includes('"B"'), false, "nothing of the withheld pair is served");
});

test("R38 a court order withholding only a case document lists the edition withheld, its pair and signer not served", () => {
  const { w } = twoCases();
  const doc = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, C2).doc_sha;
  w.stamps.stamp({ case: C2, editions: [1], entry: { seq: 5 }, effect: "seal", parts: [doc] });
  const [a, b] = w.read("publishedfrozen", { id: F }).cases;
  assert.deepEqual([a.withheld, a.strength.capture.grade], [null, "B"]);
  assert.deepEqual([b.withheld.whole, b.withheld.document, b.strength, b.signed_by], [false, true, null, null]);
});

test("R38 a withdrawn case edition carries its docket stamp (R20), and the stamp changes no pair", () => {
  const { w } = twoCases();
  w.docket.place(C1, { seq: 2, kind: "withdrawal", edition: 1, date: "2026-10-05", reason: "superseded", digest: "e".repeat(64) });
  const [a, b] = w.read("publishedfrozen", { id: F }).cases;
  assert.deepEqual([a.withdrawn.seq, a.withdrawn.reason, b.withdrawn], [2, "superseded", null]);
  assert.equal(a.strength.capture.grade, "B");
});

test("R38 it needs no credential and writes nothing: two calls answer the same bytes, no table moves, and the op is one this module owns", () => {
  const { w } = twoCases();
  const before = JSON.stringify(w.snapshot(PUBLISHED));
  const one = JSON.stringify(w.read("publishedfrozen", { id: F }));
  const two = JSON.stringify(w.pr.publishedFrozen({ id: F }));
  assert.equal(one, two);
  assert.equal(JSON.stringify(w.snapshot(PUBLISHED)), before, "reading wrote nothing");
  assert.ok(PUBLIC_READ_OWN_OPS.includes("publishedfrozen"), "a registered read may not take its name");
  assert.equal(w.pr.registerPublicReads("x", { publishedfrozen: () => 1 }).reason, "PROVIDER_MALFORMED");
});

test("R38 a pre-/2 case document, which states no pair of its own, is read from the member's own signed pair and says so", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare(C1, 1, { format: "bio-case-document/1", project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signLegacy(C1, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F, { memberCarriesBlocks: true,
    strength: [{ axis: "capture", state: "graded", grade: "A" }, { axis: "connection", state: "graded", grade: "B" }] }).ok, true);
  const [a] = w.read("publishedfrozen", { id: F }).cases;
  assert.deepEqual([a.strength_from, a.strength.capture.grade, a.strength.connection.grade], ["member_bytes", "A", "B"]);
  assert.equal(a.signed_by.member, "h_olive", "the case document's signer is stated apart from the finding's");
});

test("R38 the four sentences it says are read from the word table by key, and each key is held", () => {
  const keys = ["detail.cases", "detail.none", "strength_detail.none", "signer_detail.unstated"].map((k) => `public-read.frozen.${k}`);
  for (const k of keys) assert.equal(hasWord(k), true, k);
  const { w, proj, roles } = twoCases({ second: false });
  /* strength_detail: a case edition recording no pair for the finding */
  w.prepare(C2, 1, { project: proj, roles, strength: [] });
  assert.equal(w.signCase(C2, 1, { project: proj, roster: [{ bundle_id: F, version_sha: roles[0].version_sha, role: "load_bearing" }] }).ok, true);
  const none = w.read("publishedfrozen", { id: F }).cases.find((c) => c.case_id === C2);
  assert.deepEqual([none.strength, none.strength_detail], [null, word("public-read.frozen.strength_detail.none")]);
  /* signer_detail: no signed case document is held, so the signer is unstated */
  w.st.sql.exec(`UPDATE case_documents SET ratified_at=NULL WHERE case_id=? AND edition=1`, C2);
  const unsigned = w.read("publishedfrozen", { id: F }).cases.find((c) => c.case_id === C2);
  assert.deepEqual([unsigned.signed_by, unsigned.signer_detail], [null, word("public-read.frozen.signer_detail.unstated")]);
});
