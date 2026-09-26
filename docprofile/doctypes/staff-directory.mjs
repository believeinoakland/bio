/* A staff directory: a document whose BODY IS a list of one organisation's people (or
 * offices) with the points at which each can be reached.
 *
 * FW-20, the FOURTH and last class in M0-32's measured order (`MEASUREMENTS.md` M-18;
 * `EXTRACTION-BREADTH-DESIGN.md` §2's table, row 4) — ~395 items (+/-272) scaled to the
 * text-bearing stratum, the smallest class by a wide margin.
 *
 * WHY THIS TYPE WAS NOT WRITTEN BY FW-18, AND WHAT CHANGED. FW-18 measured 0 of 30
 * name-matched directory PDFs decodable at TIER 1 and withheld the type (D-376), calling
 * the class "a tier-3 gap wearing a content-type gap's clothes". FW-20 re-took that
 * census through the plane WITH ITS FLEET BOUND (`bio-plane/scripts/fw20-decode-census.mjs`,
 * `docs/development/measurements/M-121.md`) and the premise did not survive: the undetermined markers
 * on those documents are `no_tounicode` — fonts with no Unicode map — which is TIER 2's
 * case, not a missing text layer, so tier 3 is never asked. With the tier-2 member bound,
 * 56 of 57 name-matched documents read from text. The class was never unreadable to the
 * plane; it was unreadable to the tier-1-only instrument that measured it.
 *
 * MEASURED ON REAL DOCUMENTS, fetched from `cao-94612.s3.amazonaws.com` on 2026-09-23
 * and read through the plane's own `op=acquire` with the committed pdf-worker bundle:
 *
 *   A · documents/Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf — the City's
 *       "Neighborhood Services Staff Beat & Program Directory". 30,870 bytes, 1 page,
 *       2,092 characters at tier 2 (1,303 `no_tounicode` markers at tier 1). Each row is
 *       a coordinator, the police beats assigned to them, an @oaklandca.gov address and
 *       an extension.
 *   B · documents/Neighborhood-Services-Division-Staff-0823.pdf — the same division's
 *       staff sheet, laid out in TWO COLUMNS, so a name and its address sit on different
 *       lines. Its file name matches none of FW-18's name patterns: M0-32 measured that
 *       a name-only census recovers 0% of directories, and this is one it would miss.
 *
 * THE DEFECT THIS TYPE WAS BUILT NOT TO MAKE — the liar's pass. A recogniser that
 * matches "a list of names with phone numbers and addresses" matches a great deal that is
 * not a staff directory, and four real documents from the same bucket spring it:
 *
 *   - the 2018 ELECTION CANDIDATE CONTACT LIST: fifty-odd people, each with a phone and
 *     an address — but at gmail, yahoo, sonic and their own campaign domains. They are
 *     candidates, not one organisation's staff;
 *   - the NCPC ZOOM MEETING DATES: every row names a City coordinator and her
 *     @oaklandca.gov address — ONE domain, the directory's own signature — but every
 *     row is a MEETING, dated. A calendar that names its contacts. This is M0-32's one
 *     defect class, a REFERENCE (to staff) read as MEMBERSHIP (of a directory), and it
 *     is the negative this type is fenced against by name;
 *   - the BUSINESS RECYCLING SERVICE PROVIDER DIRECTORY, which names itself a directory
 *     on its first line and carries the City's own contact address — a directory, of
 *     businesses, that REFERENCES the City's staff;
 *   - the WORKFORCE DEVELOPMENT BOARD roster: a list of people with no contact points.
 *
 * THE PRINCIPLE, and it is three facts rather than a list of spellings:
 *   (1) DENSITY — contact points are the body of the document, not a line in it. At
 *       least DIRECTORY_FLOOR distinct addresses.
 *   (2) ONE ORGANISATION — a staff directory lists the people of ONE body, so their
 *       addresses share that body's domain. The candidate list fails here.
 *   (3) NOT DATED — a directory's entries are people; a schedule's entries are events
 *       that name people. When the document carries dates in the same order of number
 *       as its contact points, the contacts are attributes of dated rows and the
 *       document is a calendar. The NCPC dates fail here.
 * Self-naming (a title line calling the document a directory, staff list, roster or
 * contacts) raises LIKELY to CERTAIN and is never sufficient alone — the recycling
 * directory names itself and is refused by (1).
 *
 * WHAT THIS MATCHER CANNOT SEE, stated because the sentence is load-bearing:
 *   - a directory with NO EMAIL ADDRESSES (phone numbers only, or names and titles only
 *     — the Council's committee roster and the org charts in the same bucket are of this
 *     shape). (2) cannot be established from a phone number, so these are NOT
 *     recognised; they fall to `generic`, which is noisy and honest.
 *   - a directory of OFFICES at one domain is recognised exactly as a directory of
 *     people is. M0-32's class definition ("a roster of people OR OFFICES with contact
 *     points") includes both, so this is the class, not an overreach — but the reader
 *     does not tell them apart.
 *   - an organisation whose staff use personal addresses fails (2).
 *   - it does not pair a name with an address across lines. On a two-column page
 *     (document B) an address's own line may carry two people's text or none; the
 *     entry's `line` fact is that line, verbatim, never a pairing this reader guessed. */
import { CONFIDENCE, CONTRACT, entity, diffEntities, flatten, alsoSatisfies } from "./index.mjs";
import { event, worstSignificance, isMeaningful, bySeverity } from "../events.mjs";

/* The smallest number of distinct addresses at one domain that makes contact points the
   BODY of a document rather than a signature block. A staff report names one contact;
   the recycling directory names the City twice. Five is below every real directory
   measured (the smallest, document B, carries 11) and above every reference measured
   except the NCPC schedule, which (3) refuses. */
export const DIRECTORY_FLOOR = 5;
/* The share of a document's distinct addresses that must sit at its commonest domain.
   MEASURED, AND THE FIRST DRAFT WAS WRONG IN THE LIAR'S DIRECTION: at 0.6 the 2018
   candidate contact list PASSED — 19 of its 31 addresses are at gmail.com (61%), so a
   free-mail provider read as "one organisation". The eleven distinct documents this type
   recognises sit at 0.88-1.00 (the lowest is a CRO/NCPC revision whose five non-City addresses are
   community groups'); the candidate list at 0.61. 0.8 is the separation, not a guess.
   RESIDUE, stated: a list of unrelated people who ALL use one mail provider would still
   pass (2). Mail providers are not enumerated — a list of spellings goes stale the day
   a fifth is written — so that case is a named blind spot rather than a hidden one. */
export const ONE_ORGANISATION = 0.8;

const SD_EMAIL = /\b[A-Za-z0-9][A-Za-z0-9._%+-]*@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})\b/g;
const SD_PHONE = /(?:\(\d{3}\)\s?|\b\d{3}[-.\s])?\b\d{3}[-.]\d{4}\b/g;
/* A DATE, in the forms a published schedule uses: a month named with a day, or a
   three-part numeric date. A bare `08/23` (a revision stamp) is not a date here. */
const SD_DATE = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi;
const SD_SELF_NAMING = /\b(?:directory|staff|roster|contacts)\b/i;

/** The addresses in a document, by domain. Distinct, case-folded. */
function sdAddresses(raw) {
  const all = new Map();
  for (const m of raw.matchAll(SD_EMAIL)) {
    const a = m[0].toLowerCase().replace(/\.+$/, "");
    if (!all.has(a)) all.set(a, { address: a, domain: m[1].toLowerCase().replace(/\.+$/, ""), offset: m.index });
  }
  const byDomain = new Map();
  for (const x of all.values()) byDomain.set(x.domain, (byDomain.get(x.domain) || 0) + 1);
  let domain = null, atDomain = 0;
  for (const [d, n] of byDomain) if (n > atDomain) { domain = d; atDomain = n; }
  return { all: [...all.values()], domain, atDomain };
}

/** The title line, if the document names itself as this kind in its first lines. A
    title, not a mention: only the first five non-empty lines are read. */
function sdTitleLine(raw) {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 5);
  return lines.find((l) => SD_SELF_NAMING.test(l)) || null;
}

/** The entries verified unchanged, or null when none was (R16). */
function sdConfirmed(a, b) {
  const intact = (a.entities || []).filter((e) =>
    (b.entities || []).some((x) => x.key === e.key && JSON.stringify(x.facts) === JSON.stringify(e.facts))).length;
  return intact ? { entries: (b.entities || []).length, intact } : null;
}

export default {
  key: "staff_directory",
  label: "a staff directory",
  version: 1,
  /* A directory is a LIST: what matters is which entries are present and whether each
     still says what it said. Declared on the content type (CONSTRUCTS Step 0 #4). */
  contract: CONTRACT.MEMBERSHIP,

  detect(ctx) {
    const raw = String(ctx.text || "");
    const { all, domain, atDomain } = sdAddresses(raw);
    /* (1) DENSITY at (2) ONE ORGANISATION — THE DECIDING LEG. Every match passes
       through it; nothing else can make a directory. */
    if (atDomain < DIRECTORY_FLOOR || atDomain / all.length < ONE_ORGANISATION)
      return { match: false, confidence: CONFIDENCE.NONE };
    const signals = [`${atDomain} distinct contact address(es) at one organisation's domain (${domain}), `
                   + `${Math.round((atDomain / all.length) * 100)}% of the ${all.length} in the document`];
    /* (3) NOT DATED. A schedule names its contacts; its rows are events. */
    const dates = (flatten(raw).match(SD_DATE) || []).length;
    if (dates >= Math.max(3, atDomain / 2)) return { match: false, confidence: CONFIDENCE.NONE };
    const phones = new Set((raw.match(SD_PHONE) || []).map((p) => p.replace(/\D/g, ""))).size;
    if (phones) signals.push(`${phones} distinct phone number(s)`);
    const title = sdTitleLine(raw);
    if (title) {
      signals.push(`it names itself in its title line ("${title.slice(0, 80)}")`);
      return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    }
    return { match: true, confidence: CONFIDENCE.LIKELY, signals };
  },

  /** What is in it: one entry per distinct address, keyed by the address.
   *
   *  THE KEY IS THE ADDRESS, NEVER THE NAME. An address is the identifier the document
   *  itself assigns to an entry and is stable across revisions of the sheet; a person's
   *  name is not a source-assigned id (framework §7, and the minutes reader's own rule).
   *
   *  FW-17 / IC-86 — each entry carries WHERE it was read, from `ctx.locate` at the
   *  address's own RAW offset. `rect` is null: tier-1 and tier-2 text carry no geometry. */
  parse(ctx) {
    const raw = String(ctx.text || "");
    const locate = typeof ctx.locate === "function" ? ctx.locate : () => null;
    const { all, domain, atDomain } = sdAddresses(raw);
    const entities = [];
    for (const a of all) {
      const start = raw.lastIndexOf("\n", a.offset) + 1;
      const endAt = raw.indexOf("\n", a.offset);
      const line = raw.slice(start, endAt < 0 ? raw.length : endAt).replace(/\s+/g, " ").trim();
      const phones = [...new Set(line.match(SD_PHONE) || [])];
      entities.push(entity(`contact:${a.address}`, "contact", line.slice(0, 160) || a.address,
        { address: a.address, organisation: a.domain === domain, line, phone: phones.join(", ") || null },
        locate(a.offset)));
    }
    const title = sdTitleLine(raw);
    return {
      entities,
      domain,
      entries: atDomain,
      title,
      title_why: title ? null : "no line among the first five names this document as a directory, staff list, roster or contacts",
      also_satisfies: alsoSatisfies(ctx, "staff_directory"),
      at: ctx.at || null,
    };
  },

  /** Given two parses of the same directory's address, who came, who went, and whose
   *  entry now says something else. Graded with the catalogue's list events: an entry
   *  gone is `item_pulled` (the record can no longer say this person is reached here),
   *  an entry added is `item_added`, an entry whose line moved is `item_changed`. */
  assess(a, b) {
    /* Nothing read on EITHER side is a failed reader (R16, R33), never a directory
       emptied of everyone the other side listed. */
    if (!(a.entities || []).length || !(b.entities || []).length)
      return { meaningful: null, significance: null, events: [], confirmed: null,
               why: "no entry could be read from this directory this time, so nothing is claimed about it either way" };
    const d = diffEntities(a.entities || [], b.entities || []);
    const events = [];
    for (const e of d.gone)
      events.push(event("item_pulled", { key: e.key, label: e.label, why: "this address is no longer listed in the directory" }));
    for (const e of d.appeared)
      events.push(event("item_added", { key: e.key, label: e.label, why: "the directory now lists an address it did not" }));
    for (const x of d.altered)
      events.push(event("item_changed", { key: x.entity.key, label: x.entity.label, moved: x.moved,
        why: "this entry's line in the directory now says something else" }));
    bySeverity(events);
    return {
      meaningful: isMeaningful(events), significance: worstSignificance(events), events,
      confirmed: sdConfirmed(a, b),
      why: events.length ? `${events.length} change(s) to the directory's entries`
                         : "the directory lists the same addresses, each saying what it said",
    };
  },
};
