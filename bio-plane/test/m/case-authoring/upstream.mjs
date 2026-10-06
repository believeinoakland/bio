/* Stand-ins for the upstream services case-authoring's T33 entry asks that their L8 jobs have not yet merged (K1563 (1)):
   case-grammar's `calculationsLines`/`calculationsOf` and `timelineLines`/`timelineOf` (its R18, R20) and case-disclosures'
   `peopleNamed`, `peopleJudged`, `tieAttestationJudged`, `peopleLines`, `memberTieLines` (its R24, R25, R27, R28). Each is
   coded to those requirements' interface, and is used only where the real module does not yet answer the name: once
   case-grammar and case-disclosures merge, the real ones are read and these fall away (the tests are re-pointed at the
   real modules before COMPLETE). A test controls what the people judgments answer through `people`. */
import * as caseGrammar from "../../../src/case-grammar/index.mjs";

const q = (v) => (v == null ? "null" : typeof v === "number" ? String(v) : `"${String(v).replace(/["\\\r\n]/g, " ")}"`);

/* case-grammar R18: one flat row per calculation; R20: one flat row per timeline item, the lanes apart. */
function calculationsLines(rows) {
  return ["calculations:", ...(rows || []).flatMap((r) => [
    `  - calc: ${r.calc}`, `    recipe: ${q(r.recipe == null ? null : JSON.stringify(r.recipe))}`,
    `    inputs: ${q(JSON.stringify(r.inputs || []))}`, `    method_version: ${q(r.method_version)}`,
    `    results: ${q(r.results == null ? null : JSON.stringify(r.results))}`, `    result_key: ${q(r.result_key)}`,
    `    recompute: ${r.recompute}`, `    disclosed: ${q(r.disclosed)}`])];
}
function calculationsOf(fm) { return Array.isArray(fm && fm.calculations) ? fm.calculations : []; }
function timelineLines(rows) {
  const lane = (l) => (rows || []).filter((r) => r.lane === l);
  return ["timeline:", ...[...lane("they_did"), ...lane("we_did")].flatMap((r) => [
    `  - lane: ${r.lane}`, `    ord: ${r.ord}`, `    when: ${q(r.when)}`, `    label: ${q(r.label)}`,
    `    ref: ${q(r.ref)}`, `    source: ${q(r.source)}`])];
}
function timelineOf(fm) {
  const rows = Array.isArray(fm && fm.timeline) ? fm.timeline : [];
  return { they_did: rows.filter((r) => r.lane === "they_did"), we_did: rows.filter((r) => r.lane === "we_did") };
}

/** case-grammar with R18's and R20's spellings, the real one's wherever it has them. */
export const grammar = { ...caseGrammar,
  calculationsLines: caseGrammar.calculationsLines ?? calculationsLines, calculationsOf: caseGrammar.calculationsOf ?? calculationsOf,
  timelineLines: caseGrammar.timelineLines ?? timelineLines, timelineOf: caseGrammar.timelineOf ?? timelineOf };

/** case-disclosures' one instance with R24–R28 added where it has none. `people` is the test's control: `named` (the
 *  people R24 answers, each `{person, places}`), and what R25 and R27 refuse; `asked` records each call. */
export function withPeople(real, people = { named: [], asked: [] }) {
  const own = {
    peopleNamed: (prepared, parts, viewer) => { people.asked.push({ peopleNamed: { parts, viewer } });
      return { named: people.named.slice(), unresolved: [] }; },
    peopleJudged: (named, bases, viewer) => {
      people.asked.push({ peopleJudged: { named, bases, viewer } });
      const given = new Map((Array.isArray(bases) ? bases : []).map((b) => [b && b.person, b]));
      const missing = named.named.filter((n) => !given.has(n.person));
      return missing.length
        ? { refusals: [{ ok: false, reason: "PERSON_BASIS_UNRECORDED", code: "PERSON_BASIS_UNRECORDED", people: missing.map((m) => m.person) }], rows: [] }
        : { refusals: [], rows: named.named.map((n) => ({ person: n.person, places: n.places, basis: given.get(n.person).basis,
                                                           ref: given.get(n.person).ref ?? null })) };
    },
    tieAttestationJudged: (signers, named, moneyParties, attested, viewer) => {
      people.asked.push({ tieAttestationJudged: { signers, moneyParties, attested, viewer } });
      return people.tiesRequired && !attested
        ? { refusals: [{ ok: false, reason: "TIE_ATTESTATION_MISSING", code: "TIE_ATTESTATION_MISSING", signers }], rows: [] }
        : { refusals: [], rows: [] };
    },
    peopleLines: (rows) => ["people:", ...rows.flatMap((r) => [`  - person: ${r.person}`, `    basis: ${r.basis}`,
                                                               `    ref: ${q(r.ref)}`])],
    memberTieLines: (rows) => ["member_ties:", ...rows.flatMap((r) => [`  - member: ${r.member}`, `    entity: ${r.entity}`])],
  };
  return new Proxy(real, { get: (t, k) => (typeof t[k] === "function" ? t[k].bind(t) : t[k] !== undefined ? t[k] : own[k]) });
}
