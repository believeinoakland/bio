/* reader-container's ceilings (R3, R5, R6, R7): every one is a row of runtime-limits' READ_BOUNDS, read through
 * `boundOf`, by the row names K5578 (2) set (its R37 per-kind rows); this module holds no numeric literal for a ceiling.
 * Pure; nothing at load but the frozen table. */
import { boundOf, statement } from '../../bio-plane/src/read-bounds.mjs';

/* R6: the bound a whole file of each route is judged against before any read, as its READ_BOUNDS row */
export const BYTE_ROWS = Object.freeze({
  document: ['document', 'bytes'],
  spreadsheet: ['spreadsheet', 'bytes'],
  image: ['image', 'bytes'],
  archive: ['archive', 'uploaded_bytes'],
});
/* the most pages one document or multi-page picture yields (N1267's 5,000; a TIFF's pages count toward it) */
export const PAGES_ROW = ['document', 'pages'];

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
  pages: boundOf(...PAGES_ROW),
});

/* the most time one container request may take: the file scanner's row, the other container member's (milliseconds);
 * the table keeps no row of the container reader's own */
export const TIME_ROW = ['scan', 'time_ms'];
export const TIME_MS = boundOf(...TIME_ROW);

/* the bound of a route's whole file, and the statement a refusal carries (size, bound, key) */
export const byteBound = (route) => boundOf(...BYTE_ROWS[route]);
export const byteStatement = (route, size) => statement(...BYTE_ROWS[route], size);
export { statement };
