/* Stand-ins for the upstream services case-authoring's T33 entry asks that their L8 jobs have not yet merged (K1563 (1)):
   case-disclosures' `peopleNamed`, `peopleJudged`, `tieAttestationJudged`, `peopleLines`, `memberTieLines` (its R24, R25, R27, R28). Each is
   coded to those requirements' interface, and is used only where the real module does not yet answer the name: once
   case-grammar and case-disclosures merge, the real ones are read and these fall away (the tests are re-pointed at the
   real modules before COMPLETE). A test controls what the people judgments answer through `people`. case-grammar's
   R18 and R20 are the real module's since its merge (K1636). */

const q = (v) => (v == null ? "null" : typeof v === "number" ? String(v) : `"${String(v).replace(/["\\\r\n]/g, " ")}"`);

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
