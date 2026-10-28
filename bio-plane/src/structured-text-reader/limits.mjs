/* structured-text-reader: the ceilings this module keeps (R1, R6, R7, R9) and the one way a parser stops (R5).
 * Every ceiling is read from `runtime-limits`' one table through `boundOf` (its R37 rows); none is a literal here. */
import { boundOf, statement } from "../read-bounds.mjs";

/* The rows each ceiling is quoted from (runtime-limits R37): the text bound, the nesting limit, the calendar's events. */
const ROWS = Object.freeze({
  bytes: ["text", "bytes"],
  nesting: ["text", "nesting"],
  events: ["text", "calendar_events"],
});

/** The text bound: the most bytes a file of any kind this module reads may hold (100 MB, K5427). */
export const TEXT_BYTES_MAX = boundOf(...ROWS.bytes);
/** The deepest a JSON or XML value may nest (1,000, K5439); one level deeper refuses the file whole. */
export const NESTING_MAX = boundOf(...ROWS.nesting);
/** The most events one calendar file may hold (100,000, K5439); one more refuses the file whole. */
export const CALENDAR_EVENTS_MAX = boundOf(...ROWS.events);
/** The longest XML tag (`runtime-limits`' xml tag row); a longer one stops the reading there. */
export const XML_TAG_MAX = boundOf("xml", "tag");

/** `statement` for one of this module's ceilings: `{size, bound, key}`. */
export const statementOf = (name, size) => statement(...ROWS[name], size);

/** A parser's stop: `refuse` true when a limit refuses the file whole (R6, R7), else the file is malformed at `line` (R5). */
export class Stop extends Error {
  constructor(code, { line = null, refuse = false, limit = null, why = null } = {}) {
    super(code);
    this.code = code;
    this.line = line;
    this.refuse = refuse;
    this.limit = limit;
    this.why = why;
  }
}

export const malformed = (line, why) => new Stop("MALFORMED", { line, why });
export const overNesting = (line) => new Stop("NESTING_OVER_LIMIT", { line, refuse: true, limit: "nesting" });
export const overEvents = (line) => new Stop("EVENTS_OVER_LIMIT", { line, refuse: true, limit: "events" });
