/* R3, R4: a picture of any supported kind decoded to upright PNG frames for OCR (every page of a TIFF, the first frame
 * of a GIF, the primary image of any other kind), within the pixel limit and the page count the caller sends, with
 * the facts the file states (when and where taken, its orientation) for file-safety's one redraw. Decoding is
 * ImageMagick's (libheif for HEIC, HEIF and AVIF, OpenJPEG for JPEG 2000); the facts are ExifTool's. Every copy is
 * removed when the decode ends (R8). */
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from './run.mjs';

const EXT = { jpeg: 'jpg', png: 'png', tiff: 'tif', heic: 'heic', heif: 'heif', avif: 'avif', gif: 'gif', webp: 'webp', bmp: 'bmp', jp2: 'jp2' };
/* HEIF-family pictures carry their rotation in the container, which the decoder applies itself; EXIF's orientation
 * is applied for every other kind */
const SELF_ORIENTED = new Set(['heic', 'heif', 'avif']);

/* EXIF's eight orientations, by ImageMagick's names */
const ORIENT = { 1: 'TopLeft', 2: 'TopRight', 3: 'BottomRight', 4: 'BottomLeft', 5: 'LeftTop', 6: 'RightTop', 7: 'RightBottom', 8: 'LeftBottom' };

const pngSize = (b) => ({ width: b.readUInt32BE(16), height: b.readUInt32BE(20) });

/* "YYYY:MM:DD HH:MM:SS" as "YYYY-MM-DDTHH:MM:SS"; anything else as it is stated */
const timeOf = (t) => (typeof t === 'string' && /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/.test(t) ? `${t.slice(0, 10).replace(/:/g, '-')}T${t.slice(11, 19)}` : t ?? null);

/* R4: the facts a picture states, read as data: { time, place: { latitude, longitude } | null, orientation } */
export async function factsOf(path, { timeMs } = {}) {
  const r = await run('exiftool', ['-j', '-n', '-DateTimeOriginal', '-CreateDate', '-GPSLatitude', '-GPSLongitude', '-Orientation', path], { timeMs });
  let row = {};
  try { row = JSON.parse(r.stdout.toString())[0] ?? {}; } catch { row = {}; }
  const lat = Number(row.GPSLatitude), lon = Number(row.GPSLongitude);
  return {
    time: timeOf(row.DateTimeOriginal ?? row.CreateDate ?? null),
    place: Number.isFinite(lat) && Number.isFinite(lon) && 'GPSLatitude' in row ? { latitude: lat, longitude: lon } : null,
    orientation: Number.isInteger(row.Orientation) ? row.Orientation : null,
  };
}

/* bytes of `kind` → { ok: true, frames: [{ page, width, height, png }], facts } or { ok: false, code, ... } */
export async function decode(bytes, kind, bounds, { timeMs } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'rc-frames-'));
  try {
    const input = join(dir, `in.${EXT[kind]}`);
    writeFileSync(input, bytes);
    const spec = kind === 'tiff' ? input : `${input}[0]`;
    const id = await run('identify', ['-ping', '-format', '%w %h\n', spec], { timeMs });
    const dims = id.stdout.toString().trim().split('\n').filter(Boolean).map((l) => l.split(' ').map(Number));
    if (id.status !== 0 || !dims.length || dims.some(([w, h]) => !(w > 0 && h > 0))) return { ok: false, code: 'UNREADABLE', why: id.stderr.toString().slice(0, 300) };
    if (bounds.pages != null && dims.length > bounds.pages) return { ok: false, code: 'PAGES_OVER', pages: dims.length, limit: bounds.pages };
    for (const [w, h] of dims) {
      if (w * h > bounds.pixels || w > bounds.edge || h > bounds.edge) return { ok: false, code: 'PIXELS_OVER', pixels: w * h, limit: bounds.pixels };
    }
    const facts = await factsOf(input, { timeMs });
    /* the orientation the file states, applied explicitly (ImageMagick does not read it from every kind itself) */
    const orient = SELF_ORIENTED.has(kind) ? [] : ['-orient', ORIENT[facts.orientation] ?? 'TopLeft', '-auto-orient'];
    const made = await run('convert', [spec, ...orient, '-strip', '+repage', join(dir, 'f-%05d.png')], { timeMs });
    const files = readdirSync(dir).filter((f) => /^f-\d+\.png$/.test(f)).sort();
    if (made.status !== 0 || !files.length) return { ok: false, code: 'UNREADABLE', why: made.stderr.toString().slice(0, 300) };
    const frames = files.map((f, page) => {
      const png = readFileSync(join(dir, f));
      return { page, ...pngSize(png), png: new Uint8Array(png) };
    });
    return { ok: true, frames, facts };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
