/* reader-container's ceilings (R3, R5, R6, R7): every one is a row of runtime-limits' READ_BOUNDS, read through
 * `boundOf`; this module holds no numeric literal for a ceiling. The per-kind byte rows of N1267 (image, document,
 * spreadsheet, and the page count) are runtime-limits' T53 entry; until a row is in the table the nearest row it
 * already keeps stands in (`rowOr`), so nothing here is a figure of its own. Pure; nothing at load but the frozen table. */
import { READ_BOUNDS, boundOf, statement } from '../../bio-plane/src/read-bounds.mjs';

const has = (kind, name) => Object.hasOwn(READ_BOUNDS, kind) && Object.hasOwn(READ_BOUNDS[kind], name);
/* the first row of `rows` the table holds, as [kind, name]; null when it holds none */
const rowOr = (...rows) => rows.find(([kind, name]) => has(kind, name)) ?? null;

/* R6: the bound a whole file of each route is judged against before any read, as its READ_BOUNDS row */
export const BYTE_ROWS = Object.freeze({
  document: rowOr(['document', 'bytes'], ['pdf', 'bytes']),
  spreadsheet: rowOr(['spreadsheet', 'bytes'], ['workbook', 'bytes']),
  image: rowOr(['image', 'bytes'], ['image', 'cover_bytes']),
  archive: ['archive', 'uploaded_bytes'],
});
/* the most pages one document or multi-page image yields (N1267's 5,000), when the table holds the row */
export const PAGES_ROW = rowOr(['document', 'pages']);

export const ARCHIVE = Object.freeze({
  uploaded: boundOf('archive', 'uploaded_bytes'),
  unpacked: boundOf('archive', 'unpacked_bytes'),
  depth: boundOf('archive', 'depth'),
  ratio: boundOf('archive', 'ratio'),
  members: boundOf('archive', 'members'),
  name: boundOf('archive', 'name'),
  member: boundOf('archive', 'member_bytes'),
});

export const IMAGE = Object.freeze({
  pixels: boundOf('image', 'pixels'),
  edge: boundOf('image', 'edge'),
  pages: PAGES_ROW ? boundOf(...PAGES_ROW) : null,
});

/* the most time one container request may take: the container's own row once runtime-limits keeps one, until then the
 * file scanner's, the other container member (both milliseconds) */
export const TIME_ROW = rowOr(['container', 'time_ms'], ['scan', 'time_ms']);
export const TIME_MS = boundOf(...TIME_ROW);

/* the bound of a route's whole file, and the statement a refusal carries (size, bound, key) */
export const byteBound = (route) => boundOf(...BYTE_ROWS[route]);
export const byteStatement = (route, size) => statement(...BYTE_ROWS[route], size);
export { statement };
