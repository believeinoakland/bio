/* `courtlistener_api`: CourtListener's docket-entries answer, read as the same register `courtlistener_docket`
 * reads from the page (R18–R20).
 *
 * ASSUMED, NOT SEEN. M-R5 did not confirm that a free token reads `/docket-entries/`, its date filter or its
 * coverage; the shape below is assumed from CourtListener's published description and is checked on no real
 * answer (the fixture beside the tests says so). The answer is a JSON object `{count, next, previous,
 * results}`; each result is an entry holding `entry_number` (null for an unnumbered minute entry),
 * `date_filed`, `description`, and `recap_documents` (each with its `document_number`,
 * `attachment_number`, `description` and `is_sealed`). The paging is a cursor, so it states no page number.
 * Every reading says all this (`provisional`, `key_basis`; R18) until a fixture captured from a member's
 * authenticated call replaces the assumed one (M-R9).
 *
 * The address it is served at comes from the view, as the page's does (R15): the `courtlistener_docket`
 * system's, its path widened by `jurisdictions` to also match the docket-entries path. Nothing is fetched
 * and nothing is followed (R20). */
import { CONFIDENCE, CONTRACT, row, reading, assessRegister, detectAnswer } from "./common.mjs";
import { localize } from "../bio-plane/src/setup-words/index.mjs";

const KEY = "courtlistener_api";
const LABEL = localize("court-doctypes.courtlistener_api.label", "a CourtListener docket-entries answer");

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** The answer's JSON, or null when the bytes are not a JSON object. */
function answerOf(ctx) {
  try {
    const j = JSON.parse(String((ctx && ctx.text) || ""));
    return isObj(j) ? j : null;
  } catch { return null; }
}

/** An entry as the answer states it: an entry number (a number or null) and a filing date. */
const isEntry = (e) => isObj(e) && Object.hasOwn(e, "entry_number") && typeof e.date_filed === "string"
  && (e.entry_number === null || Number.isInteger(e.entry_number));

/** Whether the answer is a page of docket entries: `results` entries and a `next` that is a string or null. */
const isEntries = (j) => !!j && Array.isArray(j.results) && j.results.length > 0 && j.results.every(isEntry)
  && (j.next === null || typeof j.next === "string");

/** Why a body that is not docket entries is not: HTML, a JSON that is not an object, a refusal the service
 *  gave (a login failure or an error body names itself in `detail`), or simply another JSON. */
function notEntriesWhy(ctx) {
  const j = answerOf(ctx);
  if (!j) return localize("court-doctypes.courtlistener_api.not_json", "this answer is not a JSON object, so it is not {what}", { what: LABEL });
  const detail = str(j.detail) || str(j.error) || str(j.message);
  if (detail) return localize("court-doctypes.courtlistener_api.refusal", "this answer is a refusal by the service (\"{detail}\"), not {what}", { detail, what: LABEL });
  if (Array.isArray(j.results) && !j.results.length)
    return localize("court-doctypes.courtlistener_api.no_entries", "this answer holds no entries, so there is no register to read in it");
  return localize("court-doctypes.courtlistener_api.lacks", "this answer lacks {what}'s own structure (results that are entries with an entry number and a filing date, and a next that is a string or null)", { what: LABEL });
}

function detect(ctx) {
  const j = answerOf(ctx);
  if (!isEntries(j)) return { match: false, confidence: CONFIDENCE.NONE, signals: [], why: notEntriesWhy(ctx) };
  return detectAnswer({ ctx, key: "courtlistener_docket", label: LABEL, what: LABEL, structure: true,
    structureSignals: [localize("court-doctypes.courtlistener_api.signal", "docket entries (results with an entry number and a filing date)")] });
}

/** A document's own label as the answer numbers it: its number, and its attachment number where it has one. */
function documentLabel(d) {
  const n = d.document_number == null ? null : String(d.document_number);
  return n != null && d.attachment_number != null ? `${n}.${d.attachment_number}` : n;
}

function readEntry(e) {
  const number = e.entry_number;
  const docs = (Array.isArray(e.recap_documents) ? e.recap_documents : []).filter(isObj);
  const documents = docs.map((d) => ({ document: documentLabel(d), description: str(d.description) }));
  const links = [];
  docs.forEach((d, i) => {
    for (const field of ["absolute_url", "filepath_local", "filepath_ia"]) {
      const href = str(d[field]);
      if (href) links.push({ document: documents[i].document, description: documents[i].description, label: field, href, fee: false });
    }
  });
  const date = str(e.date_filed), text = str(e.description);
  const r = row({
    key: number != null ? `entry:${number}`
      : `minute:${date ?? ""}|${text ?? documents.map((x) => x.description || x.document || "").join("; ")}`,
    entry_id: number != null ? String(number) : null,
    date, text, filer: str(e.filer), links, documents,
  });
  /* the answer's own statement that a document is sealed is the row's statement (R9), as its words are */
  if (!r.sealing && docs.some((d) => d.is_sealed === true)) r.sealing = "sealed";
  if (number == null && date == null && text == null && !documents.length)
    return { unkeyed: { why: localize("court-doctypes.courtlistener_api.unkeyed", "an unnumbered entry with neither a date nor a text, so it has no key") } };
  return { row: r };
}

function parse(ctx) {
  const j = answerOf(ctx);
  const entries = isEntries(j);
  const rows = [], unkeyed = [];
  if (entries) for (const e of j.results) {
    const r = readEntry(e);
    if (r.row) rows.push(r.row); else unkeyed.push(r.unkeyed);
  }
  const next = entries ? j.next : null;
  const mayContinue = typeof next === "string";
  /* complete only when the answer holds every row it states: no next, no earlier page, and its count met */
  const earlier = entries && typeof j.previous === "string";
  const short = entries && Number.isInteger(j.count) && j.count > j.results.length;
  const complete = entries && !mayContinue && !earlier && !short;
  const why = mayContinue ? localize("court-doctypes.courtlistener_api.more", "this answer has a next cursor, so it holds only some of the register's entries")
    : earlier ? localize("court-doctypes.courtlistener_api.earlier", "this answer has an earlier page, so it holds only some of the register's entries")
    : short ? localize("court-doctypes.courtlistener_api.count", "this answer states {count} entries and holds {length}, so it holds only some of them", { count: String(j.count), length: String(j.results.length) })
    : null;
  const stated = localize("court-doctypes.courtlistener_api.states_no", "the answer does not state it");
  const proceeding = {
    number: null, number_as_written: null, caption: null, forum_as_written: null, kind_as_written: null,
    status_as_written: null, filed: null, source: null, docket_number_core: null,
    why: { number: stated, caption: stated, forum_as_written: stated, kind_as_written: stated, status_as_written: stated, filed: stated, docket_number_core: stated },
  };
  return reading({
    type: KEY, proceeding, parties: [], rows,
    pagination: { page: { n: null, of: null, may_continue: mayContinue }, complete, complete_why: complete ? null : why },
    provisional: true, at: (ctx && ctx.at) || null,
    failed: entries ? null : notEntriesWhy(ctx),
    key_basis: localize("court-doctypes.courtlistener_api.key_basis", "courtlistener_api (PROVISIONAL): a numbered entry is keyed by the entry number the answer gives it (entry_id); an unnumbered (minute) entry by its date and its text as written (or, with no text, its documents' descriptions), and twins on one reading by their order among themselves; the JSON shape is assumed from CourtListener's published description and has not been checked on a real answer, until a fixture captured from a member's authenticated call replaces the assumed one"),
    notes: unkeyed.length ? { unkeyed } : null,
  });
}

export default {
  key: KEY, label: LABEL, version: 1,
  contract: CONTRACT.MEMBERSHIP,
  detect, parse,
  /* the same row diff as the page's, across the two forms too (R19) */
  assess(before, after) { return assessRegister(before, after); },
};
