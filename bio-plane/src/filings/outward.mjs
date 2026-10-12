/* What filings reads in a text it prepares (requirements: `build/requirements/filings.md`, T45: R24, R34–R40, R43–R49;
 * Actions v0.2 rules 2, 3, 5, 8, 9, 12, 19, 21). Pure: nothing here reads the record or a module; `index.mjs` hands each
 * function what the record and the modules it uses answered. The one sentence split every check reads (R34, R43), the
 * classes this module gives a sentence itself (`question`, `own_doing`; reconciliation R7), the record check's verdicts
 * from `case-checker.checkAccount`'s departures (R34), the asking sentences of a notice (R38), the disclosures printed
 * first (R24, R35), and the keyed sentences whose words are the design stream's (each held here under its key, as
 * `words.json` holds it since T46, R52). */

/** The keyed sentences this module writes into what it prepares, each answered with its key beside the words. R52 (T46;
 *  DEC-194, N913): each is the words `words.json` (`docs/development/ux-substrate/screens/words.json`) holds for its key,
 *  `en` verbatim, read by key (as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are), its
 *  `{placeholders}` as `words.json` names them, filled from the record. The design stream's words: re-worded there, then
 *  re-taken here by key. Kept in T46, each returned to BOB until its sentence and the requirement agree (R52):
 *  `phrasing.no_list` (R43: `words.json`'s names "Civicsmith" bare, DEC-149 "your group's Civicsmith"), `rfc.quoting`
 *  (R40: its refusal looks for the sentence in the approved text, so new words would refuse every request for comment
 *  prepared before them); `filings.secondapproval.waiting` (R42) is not taken. `filings.review_copy.*` (R46), which
 *  `words.json` does not hold, keep theirs. */
export const KEYED = Object.freeze({
  /* R35 */
  "prepared.rests.held": "Rests on findings checked for publication on {date}, not yet published.",
  "prepared.rests.accepted": "Rests on findings of {group} (edition of {date}), accepted by us on {date_accepted}.",
  /* R10 */
  "packet.privileged": "Privileged and confidential: prepared for counsel",
  "packet.privileged.warning": "This packet belongs to a counsel matter. Sharing it outside the group may end its privilege. "
    + "Share it only with your lawyer.",
  /* R39 */
  "filings.election.notice": "This names a pending measure or candidate. {fact} ({citation})",
  /* R45 */
  "recognition.staff_public": "This thanks staff by name in public. Check that they are willing to be named.",
  /* the pointers: R34, R39, R38, R48 */
  "pointer.record.supported": "Supported by the record: {findings}",
  "pointer.record.unsupported": "The record doesn't support this sentence. You may still send it.",
  "pointer.record.contradicted": "The record contradicts this sentence. It is held until you rewrite it, or release it with a reason.",
  "pointer.position": "Reads as a policy position: remove it, or comment as yourself.",
  "pointer.selfbenefit": "Asks for something for your group: rewrite it before approving.",
  "pointer.staff": "Names staff below the official responsible (the assistant's reading).",
  "pointer.staff.notrun": "Staff names weren't checked: the assistant is off.",
  /* R44 */
  "voice.group": "For the group",
  "voice.group.means": "Approved and sent as your group's act.",
  "voice.self": "As myself",
  "voice.self.means": "Your own notes for speaking as yourself. It is not the group's act, and it is never recorded as sent "
    + "or published.",
  /* R42 */
  "filings.secondapproval.given": "Second approval given by {member} on {date}.",
  /* kept in T46 (R52) */
  "rfc.quoting": "Your reply may be quoted unless it says otherwise.",
  "phrasing.no_list": "Nothing could be pointed out: no phrasing list is held for this language.",
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
               text: `${keyed("prepared.rests.accepted", { group: d.group ?? "a group not named", date: d.edition_date ?? "a date not stated",
                                                          date_accepted: d.accepted_at ?? "a date not stated" })} ${identityWords(d)}` };
    if (d.kind === "override") return { key: "filings.override", kind: d.kind, text: overrideDisclosure({ ...(override || {}), ...d }) };
    return { key: `filings.disclosure.${d.kind}`, kind: d.kind ?? null, text: `Disclosed: ${JSON.stringify(d)}` };
  });
}
