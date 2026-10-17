/* What filings reads in a text it prepares (requirements: `build/requirements/filings.md`, T45: R24, R34–R40, R43–R49;
 * Actions v0.2 rules 2, 3, 5, 8, 9, 12, 19, 21). Pure: nothing here reads the record or a module; `index.mjs` hands each
 * function what the record and the modules it uses answered. The one sentence split every check reads (R34, R43), the
 * classes this module gives a sentence itself (`question`, `own_doing`; reconciliation R7), the record check's verdicts
 * from `case-checker.checkAccount`'s departures (R34), the asking sentences of a notice (R38), the disclosures printed
 * first (R24, R35), and the keyed sentences whose words are the design stream's (each held here under its key, as
 * `words.json` holds it since T46, R52). */

import { word } from "./words.mjs";

/** A keyed sentence with its `{name}`s filled: the words `words.json` holds for `key`, read through setup-words' `word`
 *  (layer 1), never a copy (R52; T50, N1116, DEC-259). Every sentence this module writes into what it prepares, or
 *  answers beside it, is read this way: the pointers (R34, R38, R39, R48), the notices (R39, R45, R49), the voices
 *  (R44), the second approval (R42), the disclosures (R24, R35), the stake (R61, R63) and the review copy (R46). */
export const keyed = (key, fill = {}) => word(key, fill);

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
    for (const i of judged) out.set(i, { verdict: "undetermined", code: "RECORD_CHECK_UNREAD" });
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
  if (g.kind === "legal_deadline")
    return word("filings.legal_deadline_falling", { citation: g.citation ?? word("filings.citation_stated"),
                                                    date: g.date ?? word("filings.date_stated") });
  if (g.kind === "irreversible_act")
    return word("filings.imminent_irreversible_act", { what: g.what ?? word("filings.stated"), when: g.when ?? word("filings.time_stated") });
  return null;
}

/** R24: the words a draft, packet or communication prepared from an action carrying a premise override opens with. */
export const OVERRIDE_HEAD = word("filings.rests_unestablished_premise");
/** R24: the disclosure line, from the override as the action's read answers it (actions R8, R74): its reason, its
 *  ground where one is stated, who stated it and when. */
export function overrideDisclosure(o) {
  const g = groundWords(o.ground);
  return word("filings.stated_by_at", { override_head: OVERRIDE_HEAD, reason: o.reason,
                                        grade: g ? word("filings.ground", { grade: g }) : "",
                                        by: o.by ?? word("filings.author_record_name"), at: o.at ?? word("filings.date_record_state") });
}

/** R61, R63 (T50; N933): a matter stake in words, as `{stake, set_by, set_at, source}` (R60) or the string
 *  `"undetermined"` (conformance R41): null for none. An unread stake is told as unread, never as none
 *  (`stake.unreadable`). With `source` true the line names who set it and when (the in-band block, R61); without, only
 *  the stake (an accepted source's, R63, whose stating group is not ours). */
export function matterWords(m, { source = false } = {}) {
  if (m == null) return null;
  const s = m && typeof m === "object" ? m.stake : m;
  if (s === null || s === undefined) return null;
  const head = word("stake.inmatter");
  if (s === "undetermined") return `${head}: ${word("stake.unreadable")}`;
  if (!source || !m || typeof m !== "object") return `${head}: ${s}`;
  const key = m.source === "action" ? "stake.source.action" : "stake.source.project";
  const date = typeof m.set_at === "string" && m.set_at ? m.set_at.slice(0, 10) : word("filings.date_record_state");
  return `${head}: ${s} (${word(key, { who: m.set_by || word("filings.author_record_name"), date })})`;
}

/** R35, R63: a group's public identity and declared stake in words, as the disclosure carries them (`actions` R75, from
 *  conformance R32): undetermined where the import recorded none; (T50) its stake in the matter after them, when the
 *  disclosure carries one (`matter_stake`, `actions` R105), and nothing added when it carries none. */
function identityWords(d) {
  const id = d.identity && typeof d.identity === "object" ? d.identity : null;
  const name = id ? [id.name ?? id.display_name, id.domain].filter(Boolean).join(", ") : "";
  const stake = d.stake == null ? "none declared" : String(d.stake);
  const matter = matterWords(d.matter_stake);
  const head = word("filings.public_identity_declared", { name: name || "undetermined", stake });
  return matter ? `${head} ${matter}.` : head;
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
      return { key: "prepared.rests.held", kind: d.kind, text: word("prepared.rests.held", { date: d.checked_at ?? word("filings.date_stated") }) };
    if (d.kind === "accepted")
      return { key: "prepared.rests.accepted", kind: d.kind,
               text: `${word("prepared.rests.accepted", { group: d.group ?? word("filings.group_named"),
                                                           date: d.edition_date ?? word("filings.date_stated"),
                                                           date_accepted: d.accepted_at ?? word("filings.date_stated") })} ${identityWords(d)}` };
    if (d.kind === "override") return { key: "filings.override", kind: d.kind, text: overrideDisclosure({ ...(override || {}), ...d }) };
    return { key: `filings.disclosure.${d.kind}`, kind: d.kind ?? null, text: word("filings.disclosed", { date: JSON.stringify(d) }) };
  });
}
