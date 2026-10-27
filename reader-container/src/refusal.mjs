/* Every refusal and failure the module answers is a stated result (R6, R8): { ok: false, code, key, detail, ... } with
 * `key` the word id of the sentence a member reads and `detail` that sentence (setup-words' `localize`; K3930, K3943,
 * K3985). A bound's refusal carries the size and the limit (R6). No place is named in any of them (R8). Pure. */
import { localize } from '../../bio-plane/src/setup-words/index.mjs';

const MiB = 1048576, GiB = 1073741824;
/* a size in plain words: MB and GB count 2^20 and 2^30 bytes (K4840 (1)) */
export function sizeWords(n) {
  if (n >= GiB) return `${trim(n / GiB)} GB`;
  if (n >= MiB) return `${trim(n / MiB)} MB`;
  if (n >= 1024) return `${trim(n / 1024)} KB`;
  return `${n} bytes`;
}
const trim = (x) => (Math.round(x * 10) / 10).toString();
const count = (n) => Number(n).toLocaleString('en-US');

const refusal = (code, key, detail, extra = {}) => ({ ok: false, code, key, detail, final: true, ...extra });

/* R6: a whole file over its route's bound, before any read */
export function overBound(route, size, limit) {
  const vars = { size: sizeWords(size), limit: sizeWords(limit) };
  const by = {
    document: () => refusal('OVER_BOUND', 'reader-container.refusal.document_over_bound', localize('reader-container.refusal.document_over_bound', 'This document is {size}, over the limit of {limit} for a document, so it was not read.', vars), { size, limit }),
    spreadsheet: () => refusal('OVER_BOUND', 'reader-container.refusal.spreadsheet_over_bound', localize('reader-container.refusal.spreadsheet_over_bound', 'This spreadsheet is {size}, over the limit of {limit} for a spreadsheet, so it was not read.', vars), { size, limit }),
    image: () => refusal('OVER_BOUND', 'reader-container.refusal.picture_over_bound', localize('reader-container.refusal.picture_over_bound', 'This picture is {size}, over the limit of {limit} for a picture, so it was not read.', vars), { size, limit }),
    archive: () => refusal('OVER_BOUND', 'reader-container.refusal.archive_over_bound', localize('reader-container.refusal.archive_over_bound', 'This archive is {size}, over the limit of {limit} for an archive as uploaded, so it was not opened.', vars), { size, limit }),
  };
  return by[route]();
}

export const rarRefused = () => refusal('RAR_REFUSED', 'reader-container.refusal.rar',
  localize('reader-container.refusal.rar', 'RAR archives are not opened. Unpack it and add the files, or add it as a ZIP.'));

export const notContainerKind = (kind) => refusal('NOT_READ_HERE', 'reader-container.refusal.not_read_here',
  localize('reader-container.refusal.not_read_here', 'This kind of file ({kind}) is not read by the container reader.', { kind: String(kind) }), { kind: String(kind) });

/* R5: the one nesting count, along the chain */
export const nestedTooDeep = (depth, limit) => refusal('NESTED_TOO_DEEP', 'reader-container.refusal.nested',
  localize('reader-container.refusal.nested', 'This archive is nested more than {limit} levels deep (level {depth}), so it was not opened.', { limit: String(limit), depth: String(depth) }), { depth, limit });

export const tooManyMembers = (members, limit) => refusal('TOO_MANY_MEMBERS', 'reader-container.refusal.members',
  localize('reader-container.refusal.members', 'This archive holds more than {limit} files, so it was not opened.', { limit: count(limit) }), { members, limit });

export const ratioOver = (name, ratio, limit) => refusal('RATIO_OVER', 'reader-container.refusal.ratio',
  localize('reader-container.refusal.ratio', 'A file in this archive unpacks to more than {limit} times its packed size, which no ordinary archive does, so the archive was not opened.', { limit: count(limit) }), { member: name, ratio, limit });

export const unpackedOver = (size, limit) => refusal('UNPACKED_OVER', 'reader-container.refusal.unpacked',
  localize('reader-container.refusal.unpacked', 'This archive unpacks to more than {limit}, so it was not opened.', { limit: sizeWords(limit) }), { size, limit });

export const memberOver = (name, size, limit) => refusal('MEMBER_OVER', 'reader-container.refusal.member',
  localize('reader-container.refusal.member', 'A file in this archive is {size}, over the limit of {limit} for one file, so the archive was not opened.', { size: sizeWords(size), limit: sizeWords(limit) }), { member: name, size, limit });

export const nameOver = (length, limit) => refusal('NAME_OVER', 'reader-container.refusal.name',
  localize('reader-container.refusal.name', 'A file in this archive has a name longer than {limit} characters, so the archive was not opened.', { limit: count(limit) }), { length, limit });

/* R3: a picture over the pixel limit, or a multi-page picture over the page count */
export const pixelsOver = (pixels, limit) => refusal('PIXELS_OVER', 'reader-container.refusal.pixels',
  localize('reader-container.refusal.pixels', 'This picture is {pixels} pixels, over the limit of {limit} pixels, so it was not read.', { pixels: count(pixels), limit: count(limit) }), { pixels, limit });

export const pagesOver = (pages, limit) => refusal('PAGES_OVER', 'reader-container.refusal.pages',
  localize('reader-container.refusal.pages', 'This picture has {pages} pages, over the limit of {limit} pages, so it was not read.', { pages: count(pages), limit: count(limit) }), { pages, limit });

export const unreadable = (why) => refusal('UNREADABLE', 'reader-container.refusal.unreadable',
  localize('reader-container.refusal.unreadable', 'This file could not be read: it is damaged or not what its type says.'), { why: String(why ?? '') });

export const unreachable = () => ({ ...refusal('UNREACHABLE', 'reader-container.refusal.unreachable',
  localize('reader-container.refusal.unreachable', 'The reader could not be reached. The file is kept; it will be read when the reader is back.')), final: false });
