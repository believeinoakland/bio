/* What filings reads in a text it prepares (requirements: `build/requirements/filings.md`, T45: R24, R34–R40, R43–R49;
 * Actions v0.2 rules 2, 3, 5, 8, 9, 12, 19, 21). Pure: nothing here reads the record or a module; `index.mjs` hands each
 * function what the record and the modules it uses answered. The one sentence split every check reads (R34, R43), the
 * classes this module gives a sentence itself (`question`, `own_doing`; reconciliation R7), the record check's verdicts
 * from `case-checker.checkAccount`'s departures (R34), the asking sentences of a notice (R38), the disclosures printed
 * first (R24, R35), and the keyed sentences whose words are the design stream's (each held here under its key, plain
 * working words until that stream gives them). */

/** The keyed sentences this module writes into what it prepares (words the design stream's, canon's where it gives
 *  them: `prepared.rests.*`). Each answer names its key beside the words. */
export const KEYED = Object.freeze({
  "prepared.rests.held": "Rests on findings checked for publication on {date}, not yet published.",
  "prepared.rests.accepted": "Rests on findings of {group} (edition of {edition}), accepted by us on {accepted}.",
  "rfc.quoting": "Your reply may be quoted unless it says otherwise.",
  "packet.privileged": "Privileged and confidential: prepared for counsel in a counsel matter.",
  "packet.privileged.warning": "Sharing this outside the counsel matter may waive its privilege.",
  "filings.election.notice": "This text names a pending measure or a candidate: the campaign-spending rule applies.",
  "recognition.staff_public": "Thanks that name staff name them publicly.",
  "phrasing.no_list": "Nothing could be pointed out: no phrasing list is held for this language.",
  "filings.staff.not_run": "The check for staff named below the responsible official did not run: the assistant is off.",
  "filings.voice.self": "These are your own notes, not the group's act: they are never approved, sent or recorded as the group's.",
  "filings.review_copy.no_embargo": "No embargo is stated for this copy.",
  "filings.review_copy.terms": "Review copy. Embargoed until {embargo}; for release at {release}.",
});
/** A keyed sentence with its `{name}`s filled. */
export const keyed = (key, fill = {}) => KEYED[key].replace(/\{(\w+)\}/g, (_, n) => (fill[n] ?? `{${n}}`));

/** R34, R43: the one split: a sentence ends at `.`, `!` or `?` before white space, or at a line break; each is kept
 *  whole and trimmed, and an empty one is dropped (the rule `wizard-scripts`' writing help reads, its R25). */
export function sentencesOf(text) {
  return String(text ?? "").split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
}

/** R34: a sentence that asks (it ends in a question mark, quotes and brackets after it aside). A question is never
 *  flagged. */
export const isQuestion = (s) => /\?["'”’)\]]*$/.test(String(s).trim());

/** R34: the verdicts the record check gives a sentence, and the two classes this module gives itself. */
export const VERDICTS = Object.freeze(["supported", "unsupported", "contradicted", "undetermined", "question", "own_doing"]);

/** R34: each sentence's verdict from `checkAccount`'s answer over the sentences `judged` (their `index`es, each its
 *  account row's `ord`): no departure, `supported` naming what it cites; `ACCOUNT_CONTRADICTED_BY_RECORD`, `contradicted`
 *  naming what contradicts it (the departure's own words); any other departure `unsupported` with its words. An answer
 *  that is not `ok` reads every judged sentence undetermined, never supported. */
export function verdictsOf(judged, answer, cites) {
  const out = new Map();
  if (!answer || answer.ok !== true || !Array.isArray(answer.departures)) {
    for (const i of judged) out.set(i, { verdict: "undetermined", why: "the record check could not be run, so this sentence is not judged" });
    return out;
  }
  for (const i of judged) out.set(i, { verdict: "supported", by: cites });
  for (const d of answer.departures) {
    if (!out.has(d.ord)) continue;
    const prior = out.get(d.ord);
    if (d.code === "ACCOUNT_CONTRADICTED_BY_RECORD")
      out.set(d.ord, { verdict: "contradicted", code: d.code, contradicted_by: d.detail });
    else if (prior.verdict !== "contradicted") out.set(d.ord, { verdict: "unsupported", code: d.code, why: d.detail });
  }
  return out;
}

/** R38: a sentence that asks something of its reader (a request, a demand or an instruction), questions aside. */
const ASKING_RE = /\b(?:we (?:ask|request|demand|call on|urge|expect|require)|(?:you|the \w+) (?:must|shall|should|need to|are asked to|is asked to)|please|we would like)\b/i;
export const asks = (s) => !isQuestion(s) && ASKING_RE.test(String(s));

/* Lower case, white space collapsed, plain quotes. */
const flat = (s) => String(s ?? "").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

/** R38: whether an asking sentence asks only for what the record lets a notice ask: what a standard requires (the
 *  determination's comparison rows), remedy of a recorded consequence (its affected part) or a route the profile names
 *  (an action kind's label or a procedure guide's route). `allowed` is `[{what, words, source}]`; answers the first that
 *  the sentence names, or null. */
export function askAllowed(sentence, allowed) {
  const s = flat(sentence);
  for (const a of allowed) {
    const w = flat(a.words);
    if (w && w.length >= 4 && s.includes(w)) return a;
  }
  return null;
}

/** R24: an override's ground in words (actions R74: a legal deadline with its citation and date, or an imminent
 *  irreversible act with what and when); null for an override stated before T45, which states none. */
export function groundWords(g) {
  if (!g || typeof g !== "object") return null;
  if (g.kind === "legal_deadline") return `a legal deadline, ${g.citation ?? "its citation not stated"}, falling on ${g.date ?? "a date not stated"}`;
  if (g.kind === "irreversible_act") return `an imminent irreversible act, ${g.what ?? "what is not stated"}, at ${g.when ?? "a time not stated"}`;
  return null;
}

/** R24: the words a draft, packet or communication prepared from an action carrying a premise override opens with. */
export const OVERRIDE_HEAD = "Rests on an unestablished premise:";
/** R24: the disclosure line, from the override as the action's read answers it (actions R8, R74): its reason, its
 *  ground where one is stated, who stated it and when. */
export function overrideDisclosure(o) {
  const g = groundWords(o.ground);
  return `${OVERRIDE_HEAD} ${o.reason}${g ? `; on the ground of ${g}` : ""} (stated by ${o.by ?? "an author the record does not name"} `
    + `at ${o.at ?? "a time the record does not state"})`;
}

/** R35: a group's public identity and declared stake in words, as the disclosure carries them (`actions` R75, from
 *  conformance R32): undetermined where the import recorded none. */
function identityWords(d) {
  const id = d.identity && typeof d.identity === "object" ? d.identity : null;
  const name = id ? [id.name ?? id.display_name, id.domain].filter(Boolean).join(", ") : "";
  const stake = d.stake == null ? "none declared" : String(d.stake);
  return `Its public identity: ${name || "undetermined"}. Its declared stake: ${stake}.`;
}

/** R24, R35: every disclosure an action's read answers (`actions` R75), in its order, as lines printed first on what is
 *  prepared from it, each `{key, kind, text}`; the held and accepted sentences canon's (keyed), the override R24's. With
 *  no `disclosures` read (an action read before T45), the override alone. A disclosure of another kind is printed by
 *  its kind, never dropped. */
export function disclosureLines(disclosures, override) {
  const list = Array.isArray(disclosures) ? disclosures.filter((d) => d && typeof d === "object") : null;
  if (!list) return override ? [{ key: "filings.override", kind: "override", text: overrideDisclosure(override) }] : [];
  return list.map((d) => {
    if (d.kind === "checked_held")
      return { key: "prepared.rests.held", kind: d.kind, text: keyed("prepared.rests.held", { date: d.checked_at ?? "a date not stated" }) };
    if (d.kind === "accepted")
      return { key: "prepared.rests.accepted", kind: d.kind,
               text: `${keyed("prepared.rests.accepted", { group: d.group ?? "a group not named", edition: d.edition_date ?? "a date not stated",
                                                          accepted: d.accepted_at ?? "a date not stated" })} ${identityWords(d)}` };
    if (d.kind === "override") return { key: "filings.override", kind: d.kind, text: overrideDisclosure({ ...(override || {}), ...d }) };
    return { key: `filings.disclosure.${d.kind}`, kind: d.kind ?? null, text: `Disclosed: ${JSON.stringify(d)}` };
  });
}
