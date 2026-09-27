/* bias R1–R7, R29, R31, R32: a bias set's own checks and the C-26 family, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkBiasSet, checkBiasImage, withBiasChecks, BIAS_CHECKS, BIAS_STATEMENT_KINDS, BIAS_VERDICT_WHOLESALE,
         BIAS_VERDICT_SPEAKER, BIAS_BAR_PHRASING, biasOf } from "../../../src/bias/index.mjs";
import { BIAS_CHECKS as CATALOGUE_BIAS_CHECKS } from "../../../checks/bio-checks.mjs";
import { FM, S, biasMd, RESIDUE, world } from "./world.mjs";

const ID = "BIAS-2026-0001-house-lens";
const errs = (fm, residue = RESIDUE) =>
  checkBiasSet(fm, new Map([["bundle.md", biasMd(fm, residue)]])).filter((x) => x.severity === "error").map((x) => x.check);
const clean = (over = {}) => FM(ID, { current_state: "adopted", prior_state: "proposed", ...over });

test("R1: only a bundle whose type normalises to bias is judged; any other answers no findings", () => {
  assert.deepEqual(errs(clean()), []);
  const broken = { statements: [{ id: "", kind: "standard", subject: "the mayor", text: "everything from X is false" }] };
  assert.deepEqual(errs(clean({ object_type: "information", ...broken })), []);
  assert.deepEqual(errs(clean({ object_type: "inquiry", ...broken })), []);
  assert.deepEqual(checkBiasSet(null, new Map()), []);
  assert.ok(errs(clean(broken)).length > 0, "the same statements in a bias set are judged");
});

test("R2: C-26.1 — no statements[], a non-object entry, no id, a repeated id, a kind outside the three, neither text nor nullifies", () => {
  assert.deepEqual(errs(clean({ statements: undefined })), ["C-26.1"]);
  assert.ok(errs(clean({ statements: [S("s1"), "just a string"] })).includes("C-26.1"));
  assert.ok(errs(clean({ statements: [S("s1", { id: "" })] })).includes("C-26.1"));
  assert.ok(errs(clean({ statements: [S("s1"), S("s1")] })).includes("C-26.1"));
  for (const kind of ["standard", "bar", "", "Scrutiny"]) assert.ok(errs(clean({ statements: [S("s1", { kind })] })).includes("C-26.1"), kind);
  assert.ok(errs(clean({ statements: [S("s1", { text: "" })] })).includes("C-26.1"));
  /* negative controls: each of the three kinds passes, and a pure nullification (nullifies, no text) passes */
  for (const kind of BIAS_STATEMENT_KINDS)
    assert.deepEqual(errs(clean({ statements: [S("s1", { kind, citations: ["INFO-2026-0001-x"] })] })), [], kind);
  assert.deepEqual(errs(clean({ statements: [S("p1", { text: "", nullifies: "s1" })] })), []);
  assert.deepEqual(BIAS_STATEMENT_KINDS, ["scrutiny", "inference", "pattern"]);
});

test("R3: C-26.2 a subject that is not a registry key; C-26.3 no justification on every kind, a nullification included", () => {
  for (const subject of ["the city attorney", "ENT-26-7", "ent-2026-0007", "", undefined])
    assert.ok(errs(clean({ statements: [S("s1", { subject })] })).includes("C-26.2"), String(subject));
  assert.ok(!errs(clean({ statements: [S("s1", { subject: "ENT-2031-9999" })] })).includes("C-26.2"));
  for (const kind of BIAS_STATEMENT_KINDS)
    assert.ok(errs(clean({ statements: [S("s1", { kind, justification: " ", citations: ["x"] })] })).includes("C-26.3"), kind);
  assert.ok(errs(clean({ statements: [S("p1", { text: "", nullifies: "s1", justification: "" })] })).includes("C-26.3"));
});

test("R4: C-26.4 a pattern statement with no non-empty citation, in a set not at draft", () => {
  for (const state of ["proposed", "adopted", "retired"])
    assert.ok(errs(clean({ current_state: state, statements: [S("s1", { kind: "pattern", citations: [] })] })).includes("C-26.4"), state);
  assert.ok(errs(clean({ statements: [S("s1", { kind: "pattern", citations: ["", " "] })] })).includes("C-26.4"));
  assert.ok(!errs(clean({ current_state: "draft", prior_state: null, statements: [S("s1", { kind: "pattern" })] })).includes("C-26.4"));
  assert.ok(!errs(clean({ statements: [S("s1", { kind: "pattern", citations: ["INFO-2026-0001-a"] })] })).includes("C-26.4"));
  assert.ok(!errs(clean({ statements: [S("s1", { kind: "scrutiny", citations: [] })] })).includes("C-26.4"));
});

test("R5: C-26.5 a wholesale truth verdict or a speaker called a liar; strong scrutiny language without a verdict passes", () => {
  for (const text of ["Everything from the Tribune is false and should be ignored.",
                      "All reports from this office are fabricated.",
                      "The spokesman is a liar.", "The council members are never credible.",
                      "The agency always lies about its budget.", "That official never tells the truth."])
    assert.ok(errs(clean({ statements: [S("s1", { text })] })).includes("C-26.5"), text);
  /* over-strictness arms: an evidenced scrutiny statement about a source's reliability passes */
  for (const text of ["Claims from this office need independent corroboration before they bear load, because its record is poor.",
                      "Treat the agency's figures with heightened scrutiny: they have been revised twice this year.",
                      "This source's reliability on budget matters is weak and each claim needs a second record."])
    assert.ok(!errs(clean({ statements: [S("s1", { text })] })).includes("C-26.5"), text);
});

test("R6: C-26.6 a statement carrying required_strength or bar, or text setting a threshold; a sentence about sources with no count passes", () => {
  assert.ok(errs(clean({ statements: [S("s1", { required_strength: "B" })] })).includes("C-26.6"));
  assert.ok(errs(clean({ statements: [S("s1", { bar: "two sources" })] })).includes("C-26.6"));
  for (const text of ["Stories require more than one source before they run.", "At least two independent sources are needed.",
                      "A claim must reach grade B before we assert it.", "Every finding needs 3 or more sources."])
    assert.ok(errs(clean({ statements: [S("s1", { text })] })).includes("C-26.6"), text);
  for (const text of ["Weigh the source's track record, position and motive before relying on it.",
                      "Sources close to the matter deserve a second look at what they could know."])
    assert.ok(!errs(clean({ statements: [S("s1", { text })] })).includes("C-26.6"), text);
});

test("R7: C-26.7 an adopted set whose What This Does Not Enforce section is absent or empty", () => {
  assert.ok(errs(clean(), null).includes("C-26.7"));
  assert.ok(errs(clean(), "   ").includes("C-26.7"));
  assert.ok(!errs(clean(), RESIDUE).includes("C-26.7"));
  for (const state of ["draft", "proposed"]) assert.ok(!errs(clean({ current_state: state }), null).includes("C-26.7"), state);
});

test("R29: every C-26 row, C-26.1–C-26.20, is here with its check, where and translation; C-26.12 is the catalogue's own row", () => {
  const rows = Object.entries(BIAS_CHECKS);
  const ids = rows.map(([, r]) => r.check).sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]));
  assert.deepEqual(ids, Array.from({ length: 20 }, (_, i) => `C-26.${i + 1}`));
  for (const [code, r] of rows) {
    assert.ok(typeof r.where === "string" && r.where.length > 10, code);
    assert.ok(typeof r.translation === "string" && r.translation.length > 40, code);
  }
  assert.equal(new Set(rows.map(([, r]) => r.translation)).size, rows.length, "no translation is a copy of another's");
  assert.equal(BIAS_CHECKS.BIAS_ILLEGAL_TRANSITION, CATALOGUE_BIAS_CHECKS.BIAS_ILLEGAL_TRANSITION);
  assert.deepEqual(Object.keys(CATALOGUE_BIAS_CHECKS), ["BIAS_ILLEGAL_TRANSITION"], "the catalogue holds only promotion's row");
});

test("R29: C-26.1–C-26.7 run in the audit (record-core R59) and at the ratification gate (withBiasChecks), over the same image", async () => {
  const w = world();
  const img = { "bundle.md": biasMd(clean({ statements: [S("s1", { text: "The spokesman is a liar." })] })) };
  assert.deepEqual(checkBiasImage(img).map((x) => x.check), ["C-26.5"]);
  assert.deepEqual(checkBiasImage(new Map(Object.entries(img))).map((x) => x.check), ["C-26.5"]);
  assert.deepEqual(checkBiasImage({ "bundle.md": { blobSha: "x" } }), [], "a blob-held document is not read");
  const gate = { gateVersion: "v", ok: true, findings: [], warnings: 0 };
  const g = withBiasChecks(img, gate);
  assert.equal(g.ok, false);
  assert.deepEqual(g.findings.map((x) => x.check), ["C-26.5"]);
  assert.equal(withBiasChecks({ "bundle.md": biasMd(clean()) }, gate), gate, "a clean set leaves the gate's answer as it was");
  /* the audit: a bias set written by a replay (so not judged at the write) is found by the audit pass */
  const id = "BIAS-2026-0009-replayed";
  const r = w.promote(id, FM(id, { statements: [S("s1", { text: "The spokesman is a liar." })] }), { replay: true });
  assert.equal(r.ok, true);
  const audit = await w.record.auditPass({ limit: 10 });
  assert.equal(audit.tally["C-26.5"], 1);
  assert.equal(biasOf(w.ctx), w.bias);
});

test("R31: one predicate, one place — the three predicates the checks use are exported here, and the inhale uses the same", () => {
  const w = world();
  const verdict = "Everything from the Tribune is false and should be ignored.";
  const bar = "Stories require more than one source before they run.";
  assert.ok(BIAS_VERDICT_WHOLESALE.test(verdict) && BIAS_BAR_PHRASING.some((re) => re.test(bar)));
  assert.ok(BIAS_VERDICT_SPEAKER.some((re) => re.test("The spokesman is a liar.")));
  assert.ok(errs(clean({ statements: [S("s1", { text: verdict })] })).includes("C-26.5"));
  const inhaled = w.bias.biasInhale({ policy: `${verdict}\n\n${bar}` });
  assert.equal(inhaled.residue[0].check, "C-26.5");
  assert.equal(inhaled.bars[0].text, bar);
});

test("R32: no place is named in this module's outward text", () => {
  const PLACE = /oakland|alameda|california|san francisco|berkeley/i;
  for (const [code, r] of Object.entries(BIAS_CHECKS)) assert.ok(!PLACE.test(r.translation), code);
  const w = world();
  const texts = [JSON.stringify(w.bias.biasInhale({ policy: "Verify every claim with direct knowledge." })),
                 JSON.stringify(w.bias.biasManifest({})), JSON.stringify(w.bias.biasDebt({ run: "x" })),
                 JSON.stringify(w.bias.biasAdopt({})), JSON.stringify(w.bias.biasDebtResolve({ run: "r", actor: "a" }))];
  for (const t of texts) assert.ok(!PLACE.test(t), t.slice(0, 80));
});
