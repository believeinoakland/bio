/* hypotheses: the leg check every promotion of an inquiry runs (R5, R6), through `promotion` (its R39), with the real
   `explore` re-deriving a derived connection over a registry holding stand-in owners of a derived, a declared and an
   evidentiary kind. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, INQ, E1, E2, E3 } from "./fixture.mjs";
import { createRegistry, derivedId, DECLARED_LABEL, LOWEST_GRADE } from "../../../src/connection-grammar/index.mjs";
import { exploreOf } from "../../../src/explore/index.mjs";

const VALID = { from: "2000-01-01", to: "2099-12-31", precision: "day", zone: "UTC" };
const AS_OF = "2026-09-01";
const METHOD = "shared-officer/1";

/* A registry with three stand-in owners: `std-ev` (evidentiary), `std-dec` (declared) and `std-der` (derived), whose
   derived connections E1→E2 rest on the inputs named in `inputs`. */
function standIns() {
  const registry = createRegistry();
  const ev = { id: "LIN-2026-evidentiary00001", from: E1, to: E3, kind: "std-ev", owner: "std-ev", valid: VALID,
               evidence: [{ source: "capture:abc" }], grade: { assertion: "B", ends: ["B", "B"] }, derived: null };
  const dec = { id: "REL-2026-0001", from: E1, to: E3, kind: "std-dec", owner: "std-dec", valid: VALID, evidence: [],
                grade: { assertion: LOWEST_GRADE, ends: [LOWEST_GRADE, LOWEST_GRADE] }, derived: null, label: DECLARED_LABEL };
  const at = (c, node) => c.from === node || c.to === node;
  registry.registerOwner({ owner: "std-ev", kinds: [{ kind: "std-ev", word: "an officer in common", class: "evidentiary" }],
                           neighbours: ({ node }) => ({ items: [ev].filter((c) => at(c, node)) }) });
  registry.registerOwner({ owner: "std-dec", kinds: [{ kind: "std-dec", word: "declared part of", class: "declared" }],
                           neighbours: ({ node }) => ({ items: [dec].filter((c) => at(c, node)) }) });
  const derived = [];
  const der = (kind, input) => {
    const c = { from: E1, to: E2, kind, owner: "std-der", valid: VALID, evidence: [{ source: "derivation" }],
                grade: { assertion: "B", ends: ["B", "B"] }, derived: { method: METHOD, inputs: [input], as_of: AS_OF } };
    c.id = derivedId({ kind, from: E1, to: E2, as_of: AS_OF, method: METHOD });
    derived.push(c);
    return c;
  };
  const onEv = der("std-der-ev", ev.id), onDec = der("std-der-dec", dec.id);
  registry.registerOwner({ owner: "std-der", kinds: [{ kind: "std-der-ev", word: "linked through an officer", class: "derived" },
                                                    { kind: "std-der-dec", word: "linked through a grouping", class: "derived" }],
                           neighbours: ({ node, kinds }) => ({ items: derived.filter((c) => at(c, node) && (!kinds || kinds.includes(c.kind))) }) });
  return { registry, onEv, onDec, dec };
}

/* A leg citing a derived connection, its derivation in the five flat fields a document's frontmatter holds. */
const derivedLeg = (c) => ({ target: c.id, derivation_kind: c.kind, derivation_from: c.from, derivation_to: c.to,
                             derivation_as_of: AS_OF, derivation_method: METHOD });

test("R5 every promotion of an inquiry with a leg whose target is a hypothesis id is refused inside BASIS_REFUSED, HYPOTHESIS_NOT_A_LEG naming the leg, and nothing is written; a leg on an ordinary record is not refused", () => {
  const w = world();
  w.bundle(INQ);
  const hyp = w.hold();
  const id = "INQ-2026-0002-q";
  const ok = w.promote(id, [{ target: "INFO-2026-0001-doc" }]);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const sha = w.record.head(id).bundleSha;
  for (const legs of [[{ target: hyp }], [{ target: "INFO-2026-0001-doc" }, { target: hyp, role: "weakens" }], [{ target: "HYP-2026-0404" }]]) {
    const r = w.promote(id, legs);
    assert.equal(r.reason, "BASIS_REFUSED");
    assert.equal(r.findings.length, 1);
    const f = r.findings[0];
    assert.deepEqual([f.code, f.check, f.ord, f.target], ["HYPOTHESIS_NOT_A_LEG", "C-134.10", legs.length - 1, legs[legs.length - 1].target]);
    assert.ok(f.detail.includes(legs[legs.length - 1].target) && f.translation.length > 10);
    assert.equal(w.record.head(id).bundleSha, sha, "nothing was written");
  }
  /* a creation, and the legRefusals read itself */
  assert.equal(w.promote("INQ-2026-0003-q", [{ target: hyp }]).reason, "BASIS_REFUSED");
  assert.equal(w.record.head("INQ-2026-0003-q"), null);
  assert.deepEqual(w.h.legRefusals({ legs: [{ target: ` ${hyp} ` }, { target: "INFO-2026-0001-doc" }] }).map((f) => [f.code, f.ord]), [["HYPOTHESIS_NOT_A_LEG", 0]]);
  /* another type's basis is not an inquiry's leg */
  const p = w.promotion.promote({ bundleId: "INFO-2026-0009-doc", base: null, snapKey: "info", author: ANN,
    files: [{ path: "bundle.md", text: ["---", "id: INFO-2026-0009-doc", "object_type: information", "schema: information@1",
      'title: "D"', "current_state: collected", "prior_state: null", 'created: "2026-10-03T00:00:00Z"',
      'last_updated: "2026-10-03T00:00:00Z"', "references: []", "state_history: []", "criticality: supporting",
      "basis:", `  - target: ${hyp}`, "---", "", "body", ""].join("\n") }], meta: { object_type: "information" } });
  assert.notEqual(p.reason, "BASIS_REFUSED");
});

test("R6 a leg on a derived connection id is re-derived through explore: one whose chain carries a declared hop is refused LEAD_NOT_A_LEG naming the hop; one on an evidentiary chain passes; one that cannot be re-derived is refused, never passed", () => {
  const { registry, onEv, onDec, dec } = standIns();
  const w = world({ registry, explore: exploreOf(undefined, { registry }) });
  const id = "INQ-2026-0002-q";
  const pass = w.promote(id, [derivedLeg(onEv)]);
  assert.equal(pass.ok, true, JSON.stringify(pass).slice(0, 400));
  const lead = w.promote(id, [derivedLeg(onDec)]);
  assert.equal(lead.reason, "BASIS_REFUSED");
  assert.deepEqual(lead.findings.map((f) => [f.code, f.check, f.ord, f.target, f.hop]), [["LEAD_NOT_A_LEG", "C-134.11", 0, onDec.id, dec.id]]);
  assert.ok(lead.findings[0].detail.includes(dec.id));
  /* cannot be re-derived: no derivation, a wrong id, a derivation the owner does not hold, a viewer refused */
  const cases = [
    { target: onEv.id },
    { ...derivedLeg(onEv), target: "f".repeat(64) },
    { ...derivedLeg(onEv), derivation_method: "other/1" },
    { ...derivedLeg(onEv), derivation_kind: "std-ev" },
  ];
  for (const leg of cases) {
    const r = w.promote(id, [leg]);
    assert.equal(r.reason, "BASIS_REFUSED", JSON.stringify(leg));
    assert.deepEqual([r.findings[0].code, r.findings[0].check], ["LEG_NOT_REDERIVED", "C-134.12"]);
  }
  assert.equal(w.h.legRefusals({ legs: [{ target: onEv.id, derivation: { kind: onEv.kind, from: E1, to: E2, as_of: AS_OF, method: METHOD } }], viewer: null })[0].code,
    "LEG_NOT_REDERIVED", "an absent viewer re-derives nothing");
  assert.deepEqual(w.h.legRefusals({ legs: [{ target: onEv.id, derivation: { kind: onEv.kind, from: E1, to: E2, as_of: AS_OF, method: METHOD } }], viewer: ANN }), [],
    "the object form of a derivation passes too");
});

test("R6 a hunch hop in the chain is a lead; explore failing, throwing or absent is refused, never passed", () => {
  const leg = { target: "a".repeat(64), derivation: { kind: "k", from: E1, to: E2, as_of: AS_OF, method: METHOD } };
  const answers = [
    [{ ok: true, matches: true, declared_or_hunch: true, rests_on: [{ input: "HYP-2026-0001", class: "hunch", connection: { id: "HYP-2026-0001" } }] }, "LEAD_NOT_A_LEG"],
    [{ ok: true, matches: false, why: "no such" }, "LEG_NOT_REDERIVED"],
    [{ refused: "VIEWER_MISSING", why: "x" }, "LEG_NOT_REDERIVED"],
    ["throw", "LEG_NOT_REDERIVED"],
    [Promise.resolve({ ok: true, matches: true, declared_or_hunch: false }), "LEG_NOT_REDERIVED"],
    [{ ok: true, matches: true, declared_or_hunch: false, rests_on: [] }, null],
  ];
  for (const [answer, code] of answers) {
    const explore = { rederive: () => { if (answer === "throw") throw new Error("boom"); return answer; } };
    const w = world({ explore });
    const got = w.h.legRefusals({ legs: [leg], viewer: ANN });
    assert.deepEqual(got.map((f) => f.code), code ? [code] : [], JSON.stringify(answer));
    if (code === "LEAD_NOT_A_LEG") assert.equal(got[0].hop, "HYP-2026-0001");
  }
});

test("R6 a leg's derived connection is re-derived with the leg's inquiry as scope: one resting on a hunch of that inquiry is a lead, LEAD_NOT_A_LEG naming the hunch; without the inquiry's scope it cannot be re-derived, never passed", () => {
  const { registry } = standIns();
  const explore = exploreOf(undefined, { registry });
  const asked = [];
  const w = world({ registry, explore: { rederive: (a) => { asked.push(a.scope ?? null); return explore.rederive(a); } } });
  assert.equal(w.promote(INQ, []).ok, true, "the inquiry, held through a promotion");
  const hunch = w.hold({ about: { from: E1, to: E3 } });
  const c = { from: E1, to: E2, kind: "std-der-hunch", owner: "std-der2", valid: VALID, evidence: [{ source: "derivation" }],
              grade: { assertion: "B", ends: ["B", "B"] }, derived: { method: METHOD, inputs: [hunch], as_of: AS_OF } };
  c.id = derivedId({ kind: c.kind, from: E1, to: E2, as_of: AS_OF, method: METHOD });
  registry.registerOwner({ owner: "std-der2", kinds: [{ kind: "std-der-hunch", word: "linked through a hunch", class: "derived" }],
                           neighbours: ({ node }) => ({ items: [c].filter((x) => x.from === node || x.to === node) }) });
  const leg = derivedLeg(c);
  /* the check every promotion runs passes the promoted inquiry as the scope */
  const r = w.promote(INQ, [leg]);
  assert.equal(r.reason, "BASIS_REFUSED", JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.findings.map((f) => [f.code, f.check, f.ord, f.target, f.hop]), [["LEAD_NOT_A_LEG", "C-134.11", 0, c.id, hunch]]);
  assert.deepEqual(asked.at(-1), { inquiry: INQ });
  /* the read itself, with and without the inquiry */
  assert.deepEqual(w.h.legRefusals({ legs: [leg], viewer: ANN, inquiry: INQ }).map((f) => [f.code, f.hop]), [["LEAD_NOT_A_LEG", hunch]]);
  assert.deepEqual(w.h.legRefusals({ legs: [leg], viewer: ANN }).map((f) => f.code), ["LEG_NOT_REDERIVED"], "no scope: the hunch is not read, so the chain is not settled");
  assert.equal(asked.at(-1), null, "no scope is passed without an inquiry");
  /* another inquiry's scope does not see the hunch: refused, never passed */
  w.bundle("INQ-2026-0002-other");
  assert.deepEqual(w.h.legRefusals({ legs: [leg], viewer: ANN, inquiry: "INQ-2026-0002-other" }).map((f) => f.code), ["LEG_NOT_REDERIVED"]);
  /* a viewer who may not see the inquiry: refused, never passed */
  const fenced = w.fenced("INQ-2026-0009-hidden");
  w.hold({ inquiry: fenced, about: { from: E1, to: E3 } });
  assert.deepEqual(w.h.legRefusals({ legs: [leg], viewer: OUTSIDER, inquiry: fenced }).map((f) => f.code), ["LEG_NOT_REDERIVED"]);
  /* negative control: an evidentiary derivation passes in scope */
  const ev = standIns();
  const w2 = world({ registry: ev.registry, explore: exploreOf(undefined, { registry: ev.registry }) });
  w2.bundle(INQ);
  assert.deepEqual(w2.h.legRefusals({ legs: [derivedLeg(ev.onEv)], viewer: ANN, inquiry: INQ }), []);
});

test("R6 a calculation leg (either CALC- form) is read synchronously through calculations.gradeFactsOf with the promotion's author: an input naming a hypothesis is HYPOTHESIS_NOT_A_LEG; one naming a derived connection is judged as a leg on it; a calculation not found, or a read that throws or answers no such shape, is LEG_NOT_REDERIVED, never passed", () => {
  const { registry, onEv, onDec } = standIns();
  const dv = (c) => ({ kind: c.kind, from: E1, to: E2, as_of: AS_OF, method: METHOD });
  const OPAQUE = "CALC-2026-abcdefgh12345678";
  const facts = (inputs) => ({ found: true, accepted: true, capture: { grade: "B", why: "w" }, inputs, method: { recipe: {}, method_version: "1" } });
  const held = {
    "CALC-2026-0001": facts([{ name: "t", kind: "table", ref: "c".repeat(64), grade: "B", why: "w" },
                             { name: "f", kind: "figure", ref: "d".repeat(64), grade: "B", why: "w" },
                             { name: "s", kind: "set", ref: "e".repeat(64), grade: null, not_graded: true, why: "w" },
                             { name: "v", kind: "value", ref: 12, grade: "D", why: "w" }]),
    "CALC-2026-0002": facts([{ name: "link", kind: "value", ref: onDec.id, derivation: dv(onDec), grade: "D", why: "w" }]),
    "CALC-2026-0003": facts([{ name: "link", kind: "value", ref: onEv.id, derivation: dv(onEv), grade: "D", why: "w" }]),
    "CALC-2026-0004": facts([{ name: "h", kind: "set", ref: ["ENT-2026-0001", " HYP-2026-0007"], grade: null, why: "w" }]),
    "CALC-2026-0005": facts([{ name: "link", kind: "value", ref: onEv.id, grade: "D", why: "w" }]),
    "CALC-2026-0006": facts([{ name: "m", kind: "money", ref: "HYP-2026-0008", grade: null, why: "w" }]),
    [OPAQUE]: facts([{ name: "link", kind: "value", ref: onDec.id, derivation: dv(onDec), grade: "D", why: "w" }]),
    "CALC-2026-0007": "throw",
    "CALC-2026-0008": Promise.resolve(facts([])),
    "CALC-2026-0009": { found: true },
    "CALC-2026-0010": null,
  };
  const viewers = [];
  const calculations = { gradeFactsOf: ({ calcId, viewer }) => {
    viewers.push(viewer);
    const f = Object.hasOwn(held, calcId) ? held[calcId] : { found: false };
    if (f === "throw") throw new Error("boom");
    return f;
  } };
  const w = world({ registry, explore: exploreOf(undefined, { registry }), calculations });
  const codes = (calc, viewer = ANN) => w.h.legRefusals({ legs: [{ target: calc }], viewer, inquiry: INQ }).map((f) => f.code);
  assert.deepEqual(codes("CALC-2026-0001"), [], "a table's, a figure's and a set's sha are not connections; a value is no id");
  assert.deepEqual(codes("CALC-2026-0002"), ["LEAD_NOT_A_LEG"]);
  assert.deepEqual(codes("CALC-2026-0003"), [], "an evidentiary derivation passes");
  assert.deepEqual(codes("CALC-2026-0004"), ["HYPOTHESIS_NOT_A_LEG"]);
  assert.deepEqual(codes("CALC-2026-0005"), ["LEG_NOT_REDERIVED"], "an input whose derivation the answer does not carry");
  assert.deepEqual(codes("CALC-2026-0006"), ["HYPOTHESIS_NOT_A_LEG"], "a hypothesis in any input's reference");
  assert.deepEqual(codes(OPAQUE), ["LEAD_NOT_A_LEG"], "the opaque form is read too");
  for (const calc of ["CALC-2026-0404", "CALC-2026-0007", "CALC-2026-0008", "CALC-2026-0009", "CALC-2026-0010"]) {
    const f = w.h.legRefusals({ legs: [{ target: calc }], viewer: ANN });
    assert.deepEqual(f.map((x) => [x.code, x.check, x.target]), [["LEG_NOT_REDERIVED", "C-134.12", calc]], calc);
    assert.ok(f[0].detail.includes(calc));
  }
  assert.deepEqual(codes("CALC-2026-0003", null), ["LEG_NOT_REDERIVED"], "no viewer: the read answers not found, refused");
  /* through a promotion: the author is the viewer, and the finding names the leg */
  viewers.length = 0;
  const r = w.promote("INQ-2026-0002-q", [{ target: "INFO-2026-0001-doc" }, { target: "CALC-2026-0004" }], { author: "member:outsider" });
  assert.deepEqual([r.reason, r.findings[0].code, r.findings[0].ord, r.findings[0].target], ["BASIS_REFUSED", "HYPOTHESIS_NOT_A_LEG", 1, "CALC-2026-0004"]);
  assert.deepEqual(viewers, ["member:outsider"]);
  assert.equal(w.promote("INQ-2026-0003-q", [{ target: "CALC-2026-0001" }]).ok, true, "the negative control lands");
  /* the arm always asks: a calculations instance that answers nothing refuses, and none reachable refuses */
  const none = world({ calculations: {} });
  assert.deepEqual(none.h.legRefusals({ legs: [{ target: "CALC-2026-0001" }], viewer: ANN }).map((f) => f.code), ["LEG_NOT_REDERIVED"]);
  const bare = world();
  assert.deepEqual(bare.h.legRefusals({ legs: [{ target: "CALC-2026-0002" }], viewer: ANN }).map((f) => f.code), ["LEG_NOT_REDERIVED"]);
});
