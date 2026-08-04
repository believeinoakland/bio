/* A meeting agenda: the list of legislation a body will take up, item by item.
 *
 * MEASURED on a real document, per the standing rule that an unmeasured content
 * type is not written: oakland.legistar.com View.ashx?M=A&ID=1425405 (the *Rules
 * & Legislation Committee agenda for 2026-07-16, SUPPLEMENTAL), fetched
 * 2026-08-03 and read through Tier-1 text extraction (60,865 chars, 99.9%
 * decode — the agenda class Tier 1 fully serves, MEASUREMENTS.md CPDF-5).
 * Every rule below points at something in that text:
 *
 *   Each item of legislation carries a FILE NUMBER on its own line ("26-0910"),
 *   41 of them in the document, each unique. This is Legistar's own stable id
 *   for the legislation — the same number the body's minutes, later agendas and
 *   LegislationDetail pages carry — so it is the entity key (an id the source
 *   assigned is a key, framework §7).
 *
 *   An item's description precedes its number as labelled blocks, the label on
 *   its own line and the value on the next: "Subject: / Grand Performance
 *   Mural", "From: / Councilmember Wang", then "Recommendation: ..." inline.
 *   The ITEM NUMBER ("3.1") sits on its own line immediately before the file
 *   number. Section-level items ("2" / "26-0844") have no Subject block; their
 *   heading is the non-furniture line above the item number.
 *
 *   Page furniture repeats through the text ("Page 12", "City of Oakland",
 *   "Printed on 7/15/2026 ...", the meeting date, the body name, the "Agenda"
 *   banner) and can fall BETWEEN an item's description and its file number at a
 *   page break, so nothing here assumes a block is contiguous.
 *
 *   The meeting date is the document's first line ("Thursday, July 16, 2026")
 *   and the body name repeats as a header line ("*Rules & Legislation
 *   Committee").
 *
 * WHY THIS TYPE MATTERS. The agenda is the document class the citation graph is
 * keyed on (MEASUREMENTS: the agenda decodes free; the substance it links to is
 * where Tier 1 stops), and its file numbers are the references that connect a
 * meeting to the legislation it took up. A reading of an agenda is therefore a
 * list of legislation references — nothing more is claimed. What the body DID
 * with each item is the minutes' business, not the agenda's.
 */
import { CONFIDENCE, CONTRACT, entity, diffEntities } from "./index.mjs";
import { event, worstSignificance, isMeaningful, bySeverity } from "../events.mjs";

/* A Legistar legislation file number, alone on its line: two-digit year, dash,
   four-digit serial. Line-anchored on purpose — an inline mention inside a
   recommendation's prose is a cross-reference, not an item on THIS agenda, and
   the measured document carries each item's number on its own line exactly once. */
const FILE_LINE = /^(\d{2}-\d{4})$/;
const ITEM_LINE = /^\d+(?:\.\d+)*$/;

/* The page furniture the measured document repeats; skipped when scanning back
   for a section heading. Deliberately narrow: an unrecognised line is treated as
   substance (the conservative direction), not as furniture. */
const FURNITURE = [
  /^Page \d+$/i,
  /^City of Oakland$/i,
  /^Printed on /i,
  /^Agenda(?:\s*-.*)?$/i,
  /^View Report$/i,
  /^Attachments:$/i,
  /^Sponsors:$/i,
  /^[A-Z][a-z]+day, [A-Z][a-z]+ \d{1,2}, \d{4}$/,
];
const isFurniture = (l) => FURNITURE.some((re) => re.test(l));

const MONTHS = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6,
                 august: 7, september: 8, october: 9, november: 10, december: 11 };
const parseLongDate = (s) => {
  const m = /([A-Za-z]+) (\d{1,2}), (\d{4})/.exec(String(s || ""));
  if (!m) return null;
  const mo = MONTHS[m[1].toLowerCase()];
  if (mo == null) return null;
  return new Date(Date.UTC(+m[3], mo, +m[2])).toISOString().slice(0, 10);
};

export default {
  key: "meeting_agenda",
  label: "a meeting agenda",
  version: 1,
  /* A list of items, so what matters is its MEMBERSHIP — which legislation is
     before the body and whether each item still says what it said. Declared on
     the content type (CONSTRUCTS Step 0 #4). */
  contract: CONTRACT.MEMBERSHIP,

  detect(ctx) {
    const t = String(ctx.text || "");
    const signals = [];
    /* Line-anchored file numbers are the definitive signal: HTML never carries
       them alone on a line, and a staff report about ONE file does not list
       them item after item. */
    const files = t.match(/^\s*\d{2}-\d{4}\s*$/gm) || [];
    if (files.length) signals.push(`${files.length} legislation file number line(s)`);
    if (/\bSubject:/.test(t) && /\bRecommendation:/.test(t))
      signals.push("Subject:/Recommendation: item blocks");
    if (/\bAgenda\b/i.test(t)) signals.push("an agenda heading");
    if (/Roll Call|Office of the City Clerk/i.test(t)) signals.push("meeting front matter");
    /* The heading alone is far too common a word; it never matches by itself.
       Certain needs the file-number lines AND the item blocks AND the heading —
       all three were measured on the real packet. */
    if (files.length && signals.includes("Subject:/Recommendation: item blocks")
        && signals.includes("an agenda heading"))
      return { match: true, confidence: CONFIDENCE.CERTAIN, signals };
    if (signals.includes("an agenda heading") && signals.length >= 3)
      return { match: true, confidence: CONFIDENCE.LIKELY, signals };
    return { match: false, confidence: CONFIDENCE.NONE };
  },

  /** What is in it: the meeting's own facts, and one entity per item of
   *  legislation, keyed by the source-assigned file number. */
  parse(ctx) {
    const raw = String(ctx.text || "");
    const lines = raw.split(/\r?\n/).map((l) => l.trim());

    /* The meeting's facts. Date: the first long-form date line (the measured
       document opens with it). Body: the first header-ish line naming a body.
       Both may honestly be null — an unread fact is never invented. */
    let date = null, body = null;
    for (const l of lines.slice(0, 60)) {
      if (!date && /^[A-Za-z]+day, [A-Za-z]+ \d{1,2}, \d{4}$/.test(l)) date = parseLongDate(l);
      if (!body && /(Committee|City Council|Commission|Board|Authority)\s*$/.test(l) && !/^Councilmember/i.test(l))
        body = l.replace(/^[*\s]+/, "").trim();
      if (date && body) break;
    }

    const entities = [];
    const seen = new Set();
    let pendingSubject = null, pendingFrom = null, expect = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      /* Labelled blocks: the label sits on its own line and the value follows
         (measured), or the value rides the label's own line. */
      const lab = /^(Subject|From):\s*(.*)$/.exec(line);
      if (lab) {
        if (lab[2]) { if (lab[1] === "Subject") pendingSubject = lab[2]; else pendingFrom = lab[2]; expect = null; }
        else expect = lab[1];
        continue;
      }
      if (expect) {
        if (expect === "Subject") pendingSubject = line; else pendingFrom = line;
        expect = null;
        continue;
      }
      const file = FILE_LINE.exec(line);
      if (!file) continue;
      const key = file[1];
      /* The same file listed twice is one item of legislation; first mention
         carries the description in the measured layout. */
      if (seen.has(key)) continue;
      seen.add(key);
      /* The item number immediately precedes the file line; a section item with
         no Subject block takes its heading from the nearest substantive line
         above the item number. */
      let item = null, heading = null;
      for (let j = i - 1, hops = 0; j >= 0 && hops < 8; j--) {
        const prev = lines[j];
        if (!prev) continue;
        hops++;
        if (item == null && ITEM_LINE.test(prev)) { item = prev; continue; }
        if (isFurniture(prev) || FILE_LINE.test(prev)) { if (FILE_LINE.test(prev)) break; continue; }
        heading = prev;
        break;
      }
      const label = pendingSubject || heading || `legislation ${key}`;
      entities.push(entity(key, "legislation", String(label).slice(0, 160), {
        subject: pendingSubject || null,
        from: pendingFrom || null,
        item: item || null,
      }));
      pendingSubject = null; pendingFrom = null;
    }

    return { entities, body, date, at: ctx.at || null };
  },

  /** Given two parses of the same agenda address, what happened to the list. */
  assess(a, b) {
    /* A read that found nothing is a failed reader, never an emptied agenda. */
    if (!a.entities.length || !b.entities.length)
      return { meaningful: null, significance: null, events: [], confirmed: null,
               why: "the items on this agenda could not be read this time, so nothing is "
                  + "claimed about them either way" };

    const d = diffEntities(a.entities, b.entities);
    const events = [];
    /* An item REMOVED from a published agenda is the quiet-substitution class:
       the document still answers at the same address and no longer offers what
       it offered. There is no moving window here to excuse it (the calendar's
       lesson does not transfer: an agenda is one meeting's list, not a range). */
    for (const e of d.gone)
      events.push(event("item_pulled", { key: e.key, label: e.label,
        why: "an item of legislation this agenda listed is no longer on it" }));
    for (const alt of d.altered)
      events.push(event("item_changed", { key: alt.entity.key, label: alt.entity.label,
        moved: alt.moved,
        why: "what this agenda says about an item changed" }));
    /* Items arriving is what a supplemental agenda IS (the measured document is
       one); routine, and recorded. */
    for (const e of d.appeared)
      events.push(event("item_added", { key: e.key, label: e.label,
        why: "an item of legislation was added to this agenda" }));

    bySeverity(events);
    const intact = a.entities.filter((e) =>
      b.entities.some((x) => x.key === e.key && JSON.stringify(x.facts) === JSON.stringify(e.facts))).length;
    return {
      meaningful: isMeaningful(events), significance: worstSignificance(events), events,
      confirmed: { entries: b.entities.length, intact },
      why: events.length
        ? `${intact} of ${a.entities.length} items unchanged; ${d.gone.length} pulled, ${d.appeared.length} added, ${d.altered.length} altered`
        : `all ${b.entities.length} items on this agenda are unchanged`,
    };
  },
};
