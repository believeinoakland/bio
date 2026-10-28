/* reader-container's calls (R1-R8). The caller hands a source `{size, readRange(offset, length)}` (reading-pipeline
 * R45) and the kind `format-registry` detected, and a `container` (the container's fetch: a function or an object with
 * `fetch`), and gets back a stated result, never a throw (R8):
 *
 *   plan(source, kind)                         → { ok: true, kind, route, size, bound } | refusal     (R6: no byte read)
 *   read(source, kind, { container, depth })   → convert: { ok, route: 'convert', kind, to, bytes, original, macros }
 *                                                frames:  { ok, route: 'frames', kind, frames, facts }
 *                                                archive: { ok, route: 'archive', kind, depth, members } (an async
 *                                                         iterable of members, then possibly one refusal)
 *   collect(result)                            → an archive's members gathered: { ok, members, refusal }
 *
 * The original is never changed: a conversion's copy is a derived copy and the answer cites the original by its size
 * and SHA-256 (R1, R8). Nothing converted, decoded or unpacked is run or fetched (R2); the module keeps no record. */
import { kindOf, routeOf, CONVERT, FRAMES } from './kinds.mjs';
import { ARCHIVE, IMAGE, TIME_MS, byteBound } from './limits.mjs';
import { macrosIn, signatureOf, zipEnd, zip64End, zipEntries, ZIP_TAIL } from './inspect.mjs';
import { readRecords } from './records.mjs';
import * as refuse from './refusal.mjs';
import { localize } from '../../bio-plane/src/setup-words/index.mjs';

const WINDOW = 8 * 1048576;

/* R6: judged from the size the source states and the kind, before any byte is read */
export function plan(source, kind) {
  const k = kindOf(kind);
  const r = routeOf(k);
  if (!r) return refuse.notContainerKind(k);
  if (r.route === 'refused') return refuse.rarRefused();
  const size = source?.size;
  if (!Number.isSafeInteger(size) || size < 0 || typeof source.readRange !== 'function') return refuse.unreadable('source');
  const bound = byteBound(r.bound);
  if (size > bound) return refuse.overBound(r.bound, size, bound);
  return { ok: true, kind: k, route: r.route, size, bound };
}

async function readAll(source) {
  const out = new Uint8Array(source.size);
  for (let at = 0; at < source.size; at += WINDOW) {
    const part = await source.readRange(at, Math.min(WINDOW, source.size - at));
    if (!(part instanceof Uint8Array) || part.length !== Math.min(WINDOW, source.size - at)) return null;
    out.set(part, at);
  }
  return out;
}

/* the source as a request body, window by window, so an archive is never held whole by the caller */
function streamOf(source) {
  let at = 0;
  return new ReadableStream({
    async pull(controller) {
      if (at >= source.size) { controller.close(); return; }
      const n = Math.min(WINDOW, source.size - at);
      const part = await source.readRange(at, n);
      at += n;
      controller.enqueue(part);
    },
  });
}

const fetchOf = (container) => (typeof container === 'function' ? container : container?.fetch?.bind(container));

async function ask(container, path, bounds, body) {
  const f = fetchOf(container);
  if (!f) return null;
  try {
    const res = await f(new Request(`http://reader-container${path}`, {
      method: 'POST', body, duplex: 'half', headers: { 'x-reader-bounds': JSON.stringify(bounds), 'content-type': 'application/octet-stream' },
    }));
    return res?.ok && res.body ? res : null;
  } catch { return null; }
}

/* the container's refusal record as the module's stated refusal */
function fromRecord(h, route, plan) {
  switch (h.code) {
    case 'OVER_BOUND': return refuse.overBound(routeOf(plan.kind).bound, h.size ?? plan.size, h.limit ?? plan.bound);
    case 'TOO_MANY_MEMBERS': return refuse.tooManyMembers(h.members, h.limit);
    case 'NAME_OVER': return refuse.nameOver(h.length, h.limit);
    case 'MEMBER_OVER': return refuse.memberOver(h.member, h.size ?? h.limit + 1, h.limit);
    case 'UNPACKED_OVER': return refuse.unpackedOver(h.size, h.limit);
    case 'RATIO_OVER': return refuse.ratioOver(h.member, h.ratio, h.limit);
    case 'PIXELS_OVER': return refuse.pixelsOver(h.pixels, h.limit);
    case 'PAGES_OVER': return refuse.pagesOver(h.pages, h.limit);
    default: return refuse.unreadable(h.why ?? route);
  }
}

async function sha256(bytes) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* R2: the sentence the document page shows when a document holds macros */
export const macrosNote = () => ({ key: 'reader-container.note.macros', detail: localize('reader-container.note.macros', 'This document holds macros. They were not run.') });
/* R5: the sentence beside an encrypted member */
export const encryptedNote = () => ({ key: 'reader-container.note.encrypted', detail: localize('reader-container.note.encrypted', 'This file is locked with a password, so it was kept but not opened.') });

async function readConvert(source, p, container) {
  const bytes = await readAll(source);
  if (!bytes) return refuse.unreadable('source');
  if (!signatureOf(p.kind, bytes)) return refuse.unreadable('signature');
  const present = macrosIn(p.kind, bytes);
  const to = CONVERT[p.kind].to;
  const res = await ask(container, `/convert?kind=${p.kind}&to=${to}`, { bytes: p.bound, timeMs: TIME_MS }, bytes);
  if (!res) return refuse.unreachable();
  for await (const { header, payload } of readRecords(res.body)) {
    if (header.type === 'refusal') return fromRecord(header, 'convert', p);
    if (header.type === 'converted' && payload) {
      return {
        ok: true, route: 'convert', kind: p.kind, to, bytes: payload, derived: true,
        original: { size: p.size, sha256: await sha256(bytes) },
        macros: { present, ran: false, ...(present ? { note: macrosNote() } : {}) },
      };
    }
  }
  return refuse.unreadable('cut');
}

async function readFrames(source, p, container) {
  const bytes = await readAll(source);
  if (!bytes) return refuse.unreadable('source');
  const bounds = { bytes: p.bound, pixels: IMAGE.pixels, edge: IMAGE.edge, timeMs: TIME_MS, pages: IMAGE.pages };
  const res = await ask(container, `/frames?kind=${p.kind}`, bounds, bytes);
  if (!res) return refuse.unreachable();
  const frames = [];
  for await (const { header, payload } of readRecords(res.body)) {
    if (header.type === 'refusal') return fromRecord(header, 'frames', p);
    if (header.type === 'frame' && payload) frames.push({ page: header.page, width: header.width, height: header.height, png: payload });
    if (header.type === 'facts') {
      const { time = null, place = null, orientation = null } = header;
      return { ok: true, route: 'frames', kind: p.kind, frames, facts: { time, place, orientation }, original: { size: p.size, sha256: await sha256(bytes) } };
    }
  }
  return refuse.unreadable('cut');
}

/* R5: a ZIP's directory, read through the source's tail before any member is inflated */
async function zipDirectoryOf(source) {
  const tailLen = Math.min(source.size, ZIP_TAIL);
  const base = source.size - tailLen;
  const tail = await source.readRange(base, tailLen);
  const end = zipEnd(tail, base);
  if (!end) return null;
  let { count, offset } = end;
  if (end.zip64At != null) {
    const z = zip64End(await source.readRange(end.zip64At, Math.min(56, source.size - end.zip64At)));
    if (!z) return { ok: false, why: 'directory' };
    ({ count, offset } = z);
  }
  const length = end.absolute - offset;
  if (!(offset >= 0 && length >= 0 && length <= source.size)) return { ok: false, why: 'directory' };
  if (count > ARCHIVE.members) return { ok: true, tooMany: count };
  return zipEntries(await source.readRange(offset, length), count);
}

/* the bounds a ZIP's directory breaks, as a refusal, or null */
function zipBreaks(dir, size) {
  if (dir.tooMany) return refuse.tooManyMembers(dir.tooMany, ARCHIVE.members);
  const files = dir.members.filter((m) => !m.directory);
  if (files.length > ARCHIVE.members) return refuse.tooManyMembers(files.length, ARCHIVE.members);
  let total = 0;
  for (const m of files) {
    if (m.name.length > ARCHIVE.name) return refuse.nameOver(m.name.length, ARCHIVE.name);
    if (m.size > ARCHIVE.member) return refuse.memberOver(m.name, m.size, ARCHIVE.member);
    if (m.size > 0 && (m.packed === 0 || m.size / m.packed > ARCHIVE.ratio)) return refuse.ratioOver(m.name, m.packed ? m.size / m.packed : null, ARCHIVE.ratio);
    total += m.size;
  }
  if (total > ARCHIVE.unpacked) return refuse.unpackedOver(total, ARCHIVE.unpacked);
  /* members that share packed bytes (a bomb's one kernel) pass one by one; the whole archive's ratio does not */
  if (total > ARCHIVE.ratio * Math.max(size, 1)) return refuse.ratioOver(null, total / Math.max(size, 1), ARCHIVE.ratio);
  return null;
}

async function readArchive(source, p, container, depth, name) {
  if (!(Number.isInteger(depth) && depth >= 1)) return refuse.unreadable('depth');
  if (depth > ARCHIVE.depth) return refuse.nestedTooDeep(depth, ARCHIVE.depth);
  if (p.kind === 'zip') {
    const dir = await zipDirectoryOf(source);
    if (!dir || !dir.ok) return refuse.unreadable('directory');
    const broken = zipBreaks(dir, source.size);
    if (broken) return broken;
  }
  const bounds = { bytes: p.bound, unpacked: ARCHIVE.unpacked, ratio: ARCHIVE.ratio, members: ARCHIVE.members, member: ARCHIVE.member, name: ARCHIVE.name, timeMs: TIME_MS };
  const query = `/archive?kind=${encodeURIComponent(p.kind)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
  const res = await ask(container, query, bounds, streamOf(source));
  if (!res) return refuse.unreachable();
  const records = readRecords(res.body)[Symbol.asyncIterator]();
  /* the first record decides whether the archive opened at all: a refusal before any member is the answer itself */
  const first = await records.next();
  if (first.done) return refuse.unreadable('cut');
  if (first.value.header.type === 'refusal') return fromRecord(first.value.header, 'archive', p);
  const memberOf = ({ header, payload }) => ({
    ok: true, name: header.name, size: header.size, depth: depth + 1,
    encrypted: !!header.encrypted, bytes: header.encrypted || header.unreadable ? null : payload ?? new Uint8Array(0),
    ...(header.encrypted ? { note: encryptedNote() } : {}), ...(header.unreadable ? { unreadable: true } : {}),
  });
  async function* members() {
    let rec = first;
    while (!rec.done) {
      const { header } = rec.value;
      if (header.type === 'member') yield memberOf(rec.value);
      else if (header.type === 'refusal') { yield fromRecord(header, 'archive', p); return; }
      else if (header.type === 'end') return;
      else if (header.type === 'cut') { yield refuse.unreadable('cut'); return; }
      rec = await records.next();
    }
    yield refuse.unreadable('cut');
  }
  return { ok: true, route: 'archive', kind: p.kind, depth, members: members() };
}

/* R1-R6: the source read by its route; `depth` is the archive's place in the one nesting count (1 for a file that is
 * not inside another), `name` the file's own name (a single-stream archive's member is named from it) */
export async function read(source, kind, { container, depth = 1, name = null } = {}) {
  const p = plan(source, kind);
  if (!p.ok) return p;
  try {
    if (p.route === 'convert') return await readConvert(source, p, container);
    if (p.route === 'frames') return await readFrames(source, p, container);
    return await readArchive(source, p, container, depth, name);
  } catch (e) {
    return refuse.unreadable(e?.message ?? e);
  }
}

/* an archive's members gathered: { ok, members, refusal } (ok false when the walk ended in a refusal) */
export async function collect(result) {
  if (!result?.ok) return { ok: false, members: [], refusal: result };
  const members = [];
  for await (const m of result.members) {
    if (!m.ok) return { ok: false, members, refusal: m };
    members.push(m);
  }
  return { ok: true, members, refusal: null };
}

export { FRAMES };
