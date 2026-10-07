/* public-read — R31 (DEC-145 (2), (6); `publication` R72, K2011): `publishedCase` answers the edition's criteria exactly
   as `publication`'s R53 state froze them at the commit, each row with its label and access words, in member then leg
   order; `[]` where no member targets a standard; null, stated as not recorded and never filled, for an edition
   committed before T35; a standard not freely readable shows nothing of its text but the passages R72 holds; nothing is
   recomputed or re-read from `standards` at serving time. `standards` and `entities` are stand-ins answering the shapes
   `publication` R72 reads (`standards.standardRead`, `standards.bindsAt`, `entities.readEntity`), every call kept; the
   members are document bundles stating `subject_entity` and `basis` legs, as publication's own R72 tests write them.
   Driven at the module's interface: `publishedCase` and the `publishedcase` op. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { infoMd, KEY, SIG, NOW } from "../publication/fixture.mjs";
import { CRITERIA_NOT_A_CASE_SENTENCE } from "../../../src/public-read/index.mjs";

const CASE = "CASE-2026-0001";
const A = "STD-2026-0001-policy", B = "STD-2026-0002-standard";
const CLERK = "ENT-2026-0001", BOARD = "ENT-2026-0002";
const c = (n) => String(n).repeat(32);
const C1 = c("a1"), C2 = c("b2"), C4 = c("d4"), C5 = c("e5");

/* A: a free policy holding C1, C2 (requires C1); B: a paywalled standard holding C4, C5 (requires C4). A binds the clerk. */
function standardsOf() {
  const calls = [];
  const table = {
    [A]: { designation: "AI 4.12", edition: "2024", issuer: "ENT-2026-0009", label: "Public Works", cite: "AI 4.12 §3",
           access: "free", texts: [C1, C2], requires: [C1], quoted: { [C1]: "Each request is logged." } },
    [B]: { designation: "NFPA 1710", edition: "2020 edition", issuer: "NFPA", label: "NFPA", cite: "NFPA 1710 (2020)",
           access: "paywalled", texts: [C4, C5], requires: [C4], quoted: { [C4]: "Turnout within 80 seconds.", [C5]: "Other text." } },
  };
  const binding = { [`${A}|${CLERK}`]: "binds" };
  return { calls, table, binding,
    standardRead({ id, viewer }) {
      calls.push(["standardRead", id, viewer]);
      const s = table[id];
      if (!s) return { ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", standard: id };
      return { ok: true, id, cite: s.cite, kind: "policy", issuer: s.issuer, designation: s.designation, edition: s.edition,
               access: s.access, owner: { issuer: s.issuer, label: s.label }, requires: s.requires,
               texts: s.texts.map((t) => ({ content_id: t, standing: null, newer: null })),
               requires_quoted: s.requires.map((t) => ({ content_id: t, text: s.quoted[t] ?? null })), says: {} };
    },
    bindsAt({ standard, body, date, viewer }) {
      calls.push(["bindsAt", standard, body, date, viewer]);
      return { ok: true, standard, body, date, state: binding[`${standard}|${body}`] || "benchmark", why: "", rests_on: [] };
    } };
}
const NAMES = { [CLERK]: "City Clerk", [BOARD]: "Water Board" };
const entities = { readEntity: ({ entityId }) => (NAMES[entityId]
  ? { ok: true, found: true, entity: { entity_id: entityId, label: NAMES[entityId] } }
  : { ok: true, found: false, entity_id: entityId, entity: null }) };

function member(w, id, { subject = null, legs = [] } = {}) {
  const lines = [...(subject ? [`subject_entity: ${subject}`] : []), "basis:",
    ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports", ...(l.portion ? [`    target_portion: "${l.portion}"`] : []),
                            ...(l.content ? [`    content_id: ${l.content}`] : [])])];
  const r = w.promote(id, infoMd(id).replace("references: []", [...lines, "references: []"].join("\n")), "information");
  assert.equal(r.ok, true, JSON.stringify(r));
  return { target: id, version_sha: r.bundleSha };
}
function base() {
  const standards = standardsOf();
  const w = world({ standards, entities });
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc("INFO-2026-0001-minutes");
  return { w, proj, standards };
}
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
function sign(w, proj, caseId, edition, roles, legacy = false) {
  w.prepare(caseId, edition, { project: proj, roles });
  const r = legacy ? w.signLegacy(caseId, edition, { project: proj, roster: roster(roles) })
                   : w.signCase(caseId, edition, { project: proj, roster: roster(roles) });
  if (!legacy) assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
}

test("R31 publishedCase answers criteria exactly as publication's R53 state froze them, each row with its label and access_words, in member then leg order, and the publishedcase op the same", () => {
  const { w, proj } = base();
  const roles = [
    member(w, "INFO-2026-0101-first", { subject: CLERK, legs: [{ target: A, portion: "s.3", content: C1 }, { target: B }] }),
    member(w, "INFO-2026-0102-second", { subject: BOARD, legs: [{ target: A, portion: "s.3", content: C2 }] }),
  ];
  sign(w, proj, CASE, 1, roles);
  const frozen = w.p.caseEditionState(CASE, 1).criteria;
  const got = w.pr.publishedCase({ caseId: CASE });
  assert.deepEqual(got.criteria, frozen, "exactly R53's criteria");
  assert.equal("criteria_detail" in got, false, "nothing stated over a recorded list");
  assert.deepEqual(w.read("publishedcase", { id: CASE }).criteria, frozen, "the op serves the same");
  assert.deepEqual(got.criteria.map((r) => [r.standard, r.body, r.label, r.access_words]), [
    [A, CLERK, "Standard · binds City Clerk", "Free to read"],
    [B, CLERK, "Benchmark · not binding on City Clerk", "Behind a paywall"],
    [A, BOARD, "Benchmark · not binding on Water Board", "Free to read"],
  ], "member then leg order, each row labelled");
  /* a standard not freely readable: nothing of its text but the passages R72 holds */
  const paywalled = got.criteria.find((r) => r.standard === B);
  assert.deepEqual(paywalled.passages, [{ content: C4, text: "Turnout within 80 seconds." }]);
  assert.equal(JSON.stringify(got).includes("Other text."), false, "C5's words are served nowhere");
  assert.equal(JSON.stringify(got).includes(C5), false, "nor its id");
});

test("R31 nothing is recomputed or re-read from standards at serving time: a later change to the standard or its bindingness changes nothing served", () => {
  const { w, proj, standards } = base();
  const roles = [member(w, "INFO-2026-0101-first", { subject: BOARD, legs: [{ target: A, content: C1 }] })];
  sign(w, proj, CASE, 1, roles);
  const first = w.pr.publishedCase({ caseId: CASE }).criteria;
  const n = standards.calls.length;
  standards.binding[`${A}|${BOARD}`] = "binds";
  standards.table[A].edition = "2026";
  standards.table[A].access = "paywalled";
  standards.table[A].quoted[C1] = "Re-worded.";
  const again = w.pr.publishedCase({ caseId: CASE });
  w.read("publishedcase", { id: CASE });
  assert.deepEqual(again.criteria, first);
  assert.deepEqual([again.criteria[0].label, again.criteria[0].edition, again.criteria[0].access_words],
                   ["Benchmark · not binding on Water Board", "2024", "Free to read"]);
  assert.equal(standards.calls.length, n, "no standards read at serving");
  /* negative control: the stand-in does answer the changed standard when asked */
  assert.equal(standards.standardRead({ id: A, viewer: "admin" }).edition, "2026");
});

test("R31 R13 criteria [] where the edition's members target no standard; null, stated as not recorded and never filled, for an edition committed before T35; null for a loose bundle, which is no case", () => {
  const { w, proj, standards } = base();
  const plain = [member(w, "INFO-2026-0104-plain", { subject: CLERK, legs: [{ target: "INFO-2026-0001-minutes" }] })];
  sign(w, proj, "CASE-2026-0002", 1, plain);
  const none = w.pr.publishedCase({ caseId: "CASE-2026-0002" });
  assert.deepEqual([none.criteria, "criteria_detail" in none], [[], false]);
  /* committed before T35 */
  const roles = [member(w, "INFO-2026-0101-first", { subject: CLERK, legs: [{ target: A, content: C1 }] })];
  const n = standards.calls.length;
  sign(w, proj, CASE, 1, roles, true);
  const old = w.pr.publishedCase({ caseId: CASE });
  assert.equal(old.criteria, null, "never filled as []");
  assert.equal(old.criteria_detail, w.p.caseEditionState(CASE, 1).criteria_detail, "stated in publication's words");
  assert.match(old.criteria_detail, /not recorded/);
  assert.equal(standards.calls.length, n, "nothing read to fill it");
  /* a loose bundle: no case, no criteria */
  const L = "INFO-2026-0001-minutes", lsha = w.head(L);
  assert.equal(w.record.transact(() => w.p.commitEdition({ bundleId: L, bundleSha: lsha, title: "Minutes", completeness: null,
    strength: null, memberCarriesBlocks: false, group: "test-group", edges: [],
    shas: [{ sha256: lsha, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(w.text(L)) }],
    attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: SIG(9), at: NOW })).ok, true);
  const loose = w.pr.publishedCase({ id: L });
  assert.deepEqual([loose.ok, loose.caseId, loose.criteria, loose.criteria_detail], [true, null, null, CRITERIA_NOT_A_CASE_SENTENCE]);
  /* negative control: a recorded edition beside them does carry rows */
  sign(w, proj, CASE, 2, roles);
  assert.equal(w.pr.publishedCase({ caseId: CASE, id: CASE, edition: 2 }).criteria.length, 1);
});
