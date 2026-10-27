/* The kinds the container reads, by the name `format-registry` answers (its R33), and the route each takes (R1, R3,
 * R5): `convert` (legacy and macro Office and RTF, to the open format the existing readers take), `frames` (every
 * picture kind) and `archive`. RAR is a kind of its own, refused by name (R5). Pure. */

/* R1: the kind converted, the open format it becomes, and the byte route its bound is read from (R6) */
export const CONVERT = Object.freeze({
  doc: { to: 'docx', bound: 'document' },
  docm: { to: 'docx', bound: 'document' },
  rtf: { to: 'docx', bound: 'document' },
  ppt: { to: 'pptx', bound: 'document' },
  pptm: { to: 'pptx', bound: 'document' },
  xls: { to: 'xlsx', bound: 'spreadsheet' },
  xlsm: { to: 'xlsx', bound: 'spreadsheet' },
});

/* R3: every picture kind decoded to frames; `pages` when a file holds more than one */
export const FRAMES = Object.freeze({
  jpeg: {}, png: {}, tiff: { pages: true }, heic: {}, heif: {}, avif: {}, gif: { first: true }, webp: {}, bmp: {}, jp2: {},
});

/* R5: the archives opened as streams; a single-file `.gz`, `.bz2` or `.xz` is a one-member archive */
export const ARCHIVES = Object.freeze({ zip: {}, tar: {}, gz: { stream: true }, bz2: { stream: true }, xz: { stream: true }, '7z': {} });
export const REFUSED_BY_NAME = Object.freeze(['rar']);

/* A kind is `format-registry`'s answer or its `format`; a macro sibling (`variant: "macro"` on `docx`, `pptx`) is its
 * own kind here, `docm` or `pptm`. */
export function kindOf(kind) {
  if (typeof kind === 'string') return kind;
  if (!kind || typeof kind !== 'object' || typeof kind.format !== 'string') return null;
  if (kind.variant === 'macro' && (kind.format === 'docx' || kind.format === 'pptx')) return kind.format === 'docx' ? 'docm' : 'pptm';
  return kind.format;
}

/* the route of a kind: { route, bound } or null for a kind this module does not read */
export function routeOf(kind) {
  if (Object.hasOwn(CONVERT, kind)) return { route: 'convert', bound: CONVERT[kind].bound };
  if (Object.hasOwn(FRAMES, kind)) return { route: 'frames', bound: 'image' };
  if (Object.hasOwn(ARCHIVES, kind)) return { route: 'archive', bound: 'archive' };
  if (REFUSED_BY_NAME.includes(kind)) return { route: 'refused', bound: null };
  return null;
}
