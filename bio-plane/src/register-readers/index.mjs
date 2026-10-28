/* register-readers: the bytes of a public register file read into rows under a definition, filtered by a team's
 * criteria, the columns that must not be kept dropped before any other code sees a row, and the reduced copy that is
 * stored. Pure: no record, store, clock or network, and no AI (R11). Requirements: `build/requirements/register-readers.md`. */
export { readRows, createRowParser, encodingOf, ROW_KEY_SEPARATOR, DELIMITERS, CONTACT_ROLES } from "./rows.mjs";
export { listMembers, streamZipMember, crc32, createInflate, SUPPORTED_METHODS } from "./zip.mjs";
export { reduce, droppedColumns, contactShape, createReducer, FREE_TEXT_ROLES, WITHHELD } from "./reduce.mjs";
export { indexTerms, nameTokens, readAmount, readDate, validateFilter, matches, autoWatchable, filterFingerprint, prefillFrom,
  CRITERIA, NAMES_MAX, IDS_MAX } from "./terms.mjs";
export { estimate } from "./estimate.mjs";
