/* A staff report: written BY staff TO a body, recommending that it act.
 *
 * FW-18, the SECOND class in M0-32's measured order (`MEASUREMENTS.md` M-18;
 * `EXTRACTION-BREADTH-DESIGN.md` §2's table, row 2). ~3,012 items (+/-716) scaled to
 * the text-bearing stratum — the LARGEST unregistered class by point estimate, and it
 * is second only because the census's PAIRED comparison could not separate it from
 * minutes (z = 0.78), which left §2's standing rule standing. It is not rarer than
 * minutes and the table says so.
 *
 * MEASURED ON A REAL DOCUMENT, fetched and read through the plane's own Tier-1
 * extraction and flattened by `readtext.mjs`'s `flattenText`:
 *
 *   cao-94612.s3.amazonaws.com/documents/2020.06.23-Errata-3-Agenda-Report-Exhibits-
 *   and-Resolution.pdf — the Director of Finance's AGENDA REPORT to the City
 *   Administrator on the FY 2020-21 mid-cycle budget errata, 58 pages, 286,846
 *   characters decoded. Read 2026-09-15.
 *
 * A SECOND DOCUMENT WAS READ AS A CONTROL and it is the more instructive one:
 * cao-94612.../documents/30-Agenda-FOT-7-15-20-PACKET.pdf, the Fox Oakland Theater
 * board's meeting packet. A crude first matcher — the presence of `TO:`/`SUBJECT:` and
 * the word RECOMMENDATION — called it a staff report; the rule below does not, because
 * it carries none of the template sections and no sign-off. It is in the pen as the
 * over-firing arm this type had to survive.
 *
 * WHAT THE DOCUMENT ACTUALLY LOOKS LIKE.
 *
 *   A MEMORANDUM HEADER at the very top, four labels in one block:
 *   `TO : Edard D. Reiskin ... FROM: Adam Benson ... SUBJECT: FY 2020-21 Proposed
 *   Mid-cycle Budget Errata No. 3 - Supplemental DATE: June 19, 2020`. Measured: the
 *   three-label span is 79 characters and it begins 42 characters into the document.
 *
 *   THE AGENDA-REPORT TEMPLATE'S SECTION HEADINGS, each alone on its line and in
 *   capitals: RECOMMENDATION, REASON FOR SUPPLEMENTAL, BACKGROUND / LEGISLATIVE
 *   HISTORY, ANALYSIS AND POLICY ALTERNATIVES, FISCAL IMPACT, PUBLIC OUTREACH /
 *   INTEREST, COORDINATION, SUSTAINABLE OPPORTUNITIES, ACTION REQUESTED OF THE CITY
 *   COUNCIL. Eight of the ten this type knows about fired.
 *
 *   A SIGN-OFF: `Respectfully submitted,` then the author and `Prepared by:`.
 *
 *   A RUNNING FOOTER repeating the subject, the date and a page number on every page.
 *
 *   AND A WHOLE RESOLUTION INSIDE IT — `OAKLAND CITY COUNCIL / RESOLUTION NO. ____
 *   C.M.S.`, six WHEREAS recitals and eleven operative clauses. This document is a
 *   LIVE INSTANCE of M0-32's 52-in-600 multi-class finding, and the `regulation` type
 *   registered beside this one detects it as well. Neither reading is wrong; the
 *   document is both things, and `also_satisfies` says so rather than letting one
 *   verdict stand for the whole document.
 *
 * WHY THE PHRASES ARE MATCHED OVER FLATTENED TEXT. This producer is not Legistar.
 * Tier-1 over the City's own published PDFs breaks words and phrases across lines
 * wherever the page laid them out — `TO\n:\n`, `P\nage 1`, `ben\nefit` — so a
 * line-anchored phrase test finds nothing and looks like a document that is not a
 * staff report. `flatten` in ./index.mjs carries the measurement. LINE ANCHORING is
 * kept only for the SECTION HEADINGS, where being alone on a line is the whole signal
 * that distinguishes a heading from the same words inside a sentence.
 *
 * WHY THIS TYPE MATTERS. A staff report is where a recommendation to a public body is
 * MADE and where the reasoning behind it is written down, so it is the document a
 * member most often needs when the minutes record only that a body accepted something.
 * What this reading claims is exactly: who addressed whom, on what subject, what was
 * recommended, and which instruments and code sections the report points at. It does
 * not evaluate the recommendation and does not treat the report's account of a fact as
 * the fact.
 */
import { CONFIDENCE, CONTRACT, entity, diffEntities, flatten, alsoSatisfies } from "./index.mjs";
import { event, worstSignificance, isMeaningful, bySeverity } from "../events.mjs";

/* The memorandum header's four labels. Matched over flattened text and as a BLOCK —
   see `memoHeader`. */
const MEMO_LABEL = /\b(TO|FROM|SUBJECT|DATE)\s*:/gi;

/* The agenda-report template's sections, as PRINCIPLES rather than one literal each:
   a report of this kind states what it recommends, why, what it costs, who was
   consulted and what it asks the body to do. Each is tested as a HEADING — alone on
   its line — because the same words inside a sentence are not a section. */
const REPORT_SECTIONS = [
  /^RECOMMENDATION\b/i,
  /^EXECUTIVE\s+SUMMARY\b/i,
  /^(BACKGROUND|LEGISLATIVE\s+HISTORY|BACKGROUND\s*\/\s*LEGISLATIVE\s+HISTORY)\b/i,
  /^ANALYSIS(\s+AND\s+POLICY\s+ALTERNATIVES)?\b/i,
  /^FISCAL\s+IMPACT\b/i,
  /^PUBLIC\s+OUTREACH\b/i,
  /^COORDINATION\b/i,
  /^SUSTAINABLE\s+OPPORTUNITIES\b/i,
  /^ACTION\s+REQUESTED\b/i,
  /^REASON\s+FOR\b/i,
];
/* A heading line is short: the template's headings are titles, and a sentence that
   happens to open with one of these words is not a section. 64 characters admits
   `ACTION REQUESTED OF THE CITY COUNCIL` (36) with room and excludes prose. */
const HEADING_MAX = 64;

const SIGNOFF = /\bRespectfully\s+submitted\b/i;
const PREPARED = /\bPrepared\s+by\s*:/i;
/* Self-naming, on a line of its own. Unlike a masthead this appears ONCE, on the
   title page — measured at 1 in the real document — so it is never a rate here. */
const REPORT_TITLE = /^(AGENDA|STAFF|INFORMATIONAL|CITY\s+ADMINISTRATOR'?S?)\s+REPORT\b/i;

/** The memorandum header as a BLOCK, which is the whole discipline of this family.
 *
 *  A MEETING AGENDA AND A SET OF MINUTES BOTH CARRY `Subject:` AND `From:` — 41 and 61
 *  times respectively in the documents read for `meeting_minutes` — one pair per item,
 *  scattered the length of the document. A memorandum header is FOUR LABELS IN ONE
 *  PLACE AT THE TOP. Measured: the real staff report's three-label span is 79
 *  characters beginning at offset 42; the agenda's and the minutes' tightest such spans
 *  are 116-128 characters beginning at offsets 1,572 to 54,013.
 *
 *  So the test is the span AND the position, never the presence of the labels. Returns
 *  the block's fields when one is found, else null. */
function memoHeader(flat) {
  const hits = [...flat.matchAll(MEMO_LABEL)].map((m) => ({ i: m.index, k: m[1].toUpperCase() }));
  for (let a = 0; a < hits.length; a++) {
    if (hits[a].i > 2500) break;              /* a memorandum header is at the TOP */
    const seen = new Map();
    for (let b = a; b < hits.length; b++) {
      if (!seen.has(hits[b].k)) seen.set(hits[b].k, hits[b].i);
      if (seen.size < 3) continue;
      if (hits[b].i - hits[a].i > 250) break; /* one block, not four scattered labels */
      /* Every label of the block, not only the three that reached the threshold: the
         measured document's `DATE:` is the fourth and sat just past it, and stopping
         at three dropped a field the document plainly carries. */
      for (let c = b + 1; c < hits.length && hits[c].i - hits[a].i <= 250; c++)
        if (!seen.has(hits[c].k)) seen.set(hits[c].k, hits[c].i);
      /* EACH FIELD ENDS WHERE THE NEXT LABEL BEGINS. Taking a fixed 120 characters
         made every field swallow the rest of the header — `to` came back as the whole
         block — which is the record carrying a value that is not the value. */
      /* Bounded by the next label ANYWHERE in the document, not only by the next one
         inside the block — the LAST field of the block has no successor inside it, and
         bounding it by a character count instead made `date` come back as
         `June 19, 2020 City Administrator Approval Date: RECOMMENDATION Staff
         Recommends...`. The document's own next label (`Approval Date:`) is the
         boundary it actually has. */
      const all = hits.map((h) => h.i);
      const at = {};
      for (const [k, i] of seen) {
        const next = all.find((x) => x > i);
        const rest = flat.slice(i, next != null ? Math.min(next, i + 200) : i + 160)
          .replace(/^\s*\w+\s*:\s*/, "");
        at[k.toLowerCase()] = rest.trim() || null;
      }
      return { fields: at, labels: seen.size, span: hits[b].i - hits[a].i, at: hits[a].i };
    }
  }
  return null;
}

/** Which of the template's sections appear as HEADINGS in this document. */
function reportSections(raw) {
  const found = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const l = line.trim();
    if (!l || l.length > HEADING_MAX) continue;
    for (let i = 0; i < REPORT_SECTIONS.length; i++)
      if (REPORT_SECTIONS[i].test(l) && !found.includes(i)) found.push(i);
  }
  return found;
}

/* The instruments a report points at, matched over RAW text with `\s+` between tokens
   so a wrapped citation is still found AND `match.index` stays a RAW offset — which is
   the only coordinate `ctx.locate` understands. */
const INSTRUMENT_REF = /\b(Ordinance|Resolution)\s+No\.?\s*(\d{3,6})\b/gi;
/* A Legistar file number cited inline. Not line-anchored here: a staff report is about
   ONE matter and cites its number in prose, which is the opposite of the agenda's
   item-per-line list. */
const FILE_REF = /\b(\d{2}-\d{4})\b/g;
/* A municipal code section the report names. */
const CODE_REF = /\b(?:O\.?M\.?C\.?|Oakland\s+Municipal\s+Code)\s+(?:Section|Chapter)\s+([\d.]+[\w.]*)/gi;

export default {
  key: "staff_report",
  label: "a staff report to a public body",
  version: 1,
  /* A narrative document making a case, not a list, so what matters is its SUBSTANCE.
     Declared on the content type (CONSTRUCTS Step 0 #4). */
  contract: CONTRACT.SUBSTANCE,

  /** Is this a staff report?
   *
   *  FOUR INDEPENDENT FAMILIES on M0-32's discipline: (1) a memorandum header as a
   *  block at the top, (2) the agenda-report template's sections as headings, (3) a
   *  sign-off, (4) self-naming on a line of its own.
   *
   *  CERTAIN needs (1) AND (2), and that pair is what separates the measured document
   *  from every other document in this item's pen: a staff report is BOTH addressed as
   *  a memorandum AND sectioned by the template. Neither alone will do — the minutes
   *  and the agenda each produce a memo-shaped label span somewhere, and `RECOMMENDATION`
   *  appears as a heading in one set of minutes. */
  detect(ctx) {
    const t = String(ctx.text || "");
    const flat = flatten(t);
    const signals = [];

    const memo = memoHeader(flat);
    if (memo) signals.push(`a memorandum header of ${memo.labels} labels in ${memo.span} characters at the top`);
    const secs = reportSections(t);
    if (secs.length) signals.push(`${secs.length} agenda-report template section heading(s)`);
    const signoff = SIGNOFF.test(flat) || PREPARED.test(flat);
    if (signoff) signals.push("a staff sign-off");
    const titled = String(t).split(/\r?\n/).some((l) => REPORT_TITLE.test(l.trim()));
    if (titled) signals.push("names itself as a report on a line of its own");

    if (memo && secs.length >= 3) return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    /* LIKELY on the evidence a report in a house style this type has not met can still
       produce. The over-strictness direction is deliberate: a fence tighter than its
       rule is not a safer fence, and a merely-likely recogniser declines to narrow. */
    if (secs.length >= 3 && (signoff || titled)) return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    if (memo && signoff && titled) return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    return { match: false, confidence: CONFIDENCE.NONE };
  },

  /** What is in it: who addressed whom about what, what was recommended, and every
   *  instrument and code section the report points at.
   *
   *  FW-17 / IC-86 — THIS READER CAN SAY WHERE, WITH A LIMIT IT MUST STATE. Its
   *  references are cited INLINE in prose rather than alone on a line, so the
   *  reference's own offset is the offset of the match — which is why every pattern
   *  above is run over the RAW text with `\s+` standing in for a line break, never over
   *  the flattened copy: a flattened offset addresses a string no container ever
   *  emitted, and handing that to `ctx.locate` would produce a confident wrong page.
   *  As everywhere on this path, `rect` is null because Tier-1 text has no geometry,
   *  and a reader may emit ONLY a source `locate` gave it.
   *
   *  WHAT IT CANNOT PLACE: a citation this producer split mid-word (`R` / `ESOLUTION`
   *  from a drop cap, measured in a real ordinance) is not matched at all, so it is
   *  absent rather than mispositioned — the safe direction, and named here because a
   *  reference this reader never saw must not read as one the document lacks. */
  parse(ctx) {
    const raw = String(ctx.text || "");
    const flat = flatten(raw);
    const locate = typeof ctx.locate === "function" ? ctx.locate : () => null;

    const memo = memoHeader(flat);
    const f = (memo && memo.fields) || {};
    const secs = reportSections(raw);

    /* THE RECOMMENDATION, which is the point of the document. Read from the
       `RECOMMENDATION` heading forward to the next heading — bounded, so it can never
       swallow the rest of the report — or from the `Staff Recommends That` sentence
       where the house style has no heading. Null is first-class and means this reader
       could not find one, never that the report recommends nothing. */
    let recommendation = null;
    {
      const lines = raw.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (!/^RECOMMENDATION\b/i.test(lines[i].trim()) || lines[i].trim().length > HEADING_MAX) continue;
        const body = [];
        for (let j = i + 1; j < lines.length && body.join(" ").length < 600; j++) {
          const l = lines[j].trim();
          if (!l) continue;
          if (l.length <= HEADING_MAX && REPORT_SECTIONS.some((re, k) => k !== 0 && re.test(l))) break;
          body.push(l);
        }
        if (body.length) recommendation = flatten(body.join(" ")).slice(0, 600).trim();
        break;
      }
      if (!recommendation) {
        const m = /\bStaff\s+Recommends\s+That\b[^.]{0,500}\./i.exec(flat);
        if (m) recommendation = m[0].trim();
      }
    }

    /* The references. Each key is one the SOURCE assigned — an instrument number, a
       Legistar file number, a code section — never a position in a list and never a
       person's name. A reference cited twice is one reference; the FIRST sighting
       carries the position, because that is where the reader actually read it. */
    const entities = [];
    const seen = new Set();
    const take = (key, kind, label, facts, offset) => {
      if (seen.has(key)) return;
      seen.add(key);
      entities.push(entity(key, kind, label, facts, locate(offset)));
    };
    for (const m of raw.matchAll(INSTRUMENT_REF))
      take(`${m[1].toLowerCase()}:${m[2]}`, "instrument",
           `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} No. ${m[2]}`,
           { instrument: m[1].toLowerCase(), number: m[2] }, m.index);
    for (const m of raw.matchAll(FILE_REF))
      take(`file:${m[1]}`, "legislation", `legislation ${m[1]}`, { file: m[1] }, m.index);
    for (const m of raw.matchAll(CODE_REF))
      take(`omc:${m[1]}`, "code_section", `O.M.C. ${m[1]}`, { section: m[1] }, m.index);

    return {
      entities,
      to: f.to || null,
      from: f.from || null,
      subject: f.subject || null,
      date: f.date || null,
      recommendation,
      sections: secs.length,
      signed_off: SIGNOFF.test(flat) || PREPARED.test(flat),
      also_satisfies: alsoSatisfies(ctx, "staff_report"),
      at: ctx.at || null,
    };
  },

  /** Given two parses of the same report address, what happened to it. */
  assess(a, b) {
    /* A read that found no recommendation AND no references is a failed reader, never
       a report that says nothing. */
    if (!a.entities.length && !b.entities.length && !a.recommendation && !b.recommendation)
      return { meaningful: null, significance: null, events: [], confirmed: null,
               why: "nothing could be read from this report this time, so nothing is claimed "
                  + "about it either way" };

    const events = [];
    /* THE RECOMMENDATION MOVING IS THE SERIOUS ONE. A staff report is the document a
       member cites for what staff advised a body to do; that advice changing after
       publication, at the same address, is the record's own subject rather than drift. */
    if (String(a.recommendation || "") !== String(b.recommendation || ""))
      events.push(event("recommendation_changed", {
        was: a.recommendation || null, now: b.recommendation || null,
        why: "what this report recommends the body do is not what it recommended before" }));
    /* The memorandum header moving is worth showing and is not the same fact. */
    for (const k of ["to", "from", "subject", "date"])
      if (String(a[k] || "") !== String(b[k] || ""))
        events.push(event("item_changed", { key: k, label: k, moved: [{ fact: k, was: a[k], now: b[k] }],
          why: `this report's ${k} changed` }));

    const d = diffEntities(a.entities || [], b.entities || []);
    for (const e of d.gone)
      events.push(event("item_pulled", { key: e.key, label: e.label,
        why: "an instrument or code section this report pointed at is no longer cited in it" }));
    for (const e of d.appeared)
      events.push(event("item_added", { key: e.key, label: e.label,
        why: "this report now points at an instrument or code section it did not cite before" }));

    bySeverity(events);
    return {
      meaningful: isMeaningful(events), significance: worstSignificance(events), events,
      confirmed: { entries: (b.entities || []).length,
                   intact: (a.entities || []).filter((e) => (b.entities || []).some((x) => x.key === e.key)).length },
      why: events.length
        ? `${events.length} change(s): ${d.gone.length} citation(s) gone, ${d.appeared.length} added`
          + (String(a.recommendation || "") !== String(b.recommendation || "") ? ", and the recommendation moved" : "")
        : "this report says what it said, and points at the same instruments",
    };
  },
};
