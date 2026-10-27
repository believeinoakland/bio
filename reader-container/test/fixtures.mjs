/* reader-container's test fixtures, made when a test runs from test-support's generators (imggen, docgen, sheetgen,
 * make-zip) and the programs a test machine has; none is stored. */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate as picture } from '../../bio-plane/test/imggen.mjs';
import { scratch } from './helpers.mjs';

const PY = join(dirname(fileURLToPath(import.meta.url)), 'py');
const py = (script, ...args) => execFileSync('python3', ['-I', join(PY, script), ...args], { timeout: 300000 }).toString();

/* a page of text lines (imggen), as a PNG file path, with its truth */
export async function page(seed = 'rc', lines = 4) {
  const g = picture({ kind: 'png', seed, size: { lines }, mode: 'RGB' });
  const dir = scratch('page');
  const path = join(dir, 'page.png');
  writeFileSync(path, await g.bytes());
  return { path, truth: g.truth };
}

/* the picture at `png` as `kind`, as bytes (HEIC and HEIF by libheif's encoder, the rest by Pillow; lossless where the
 * kind allows) */
export function encodeAs(png, kind) {
  const dir = scratch(`as-${kind}`);
  const out = join(dir, `p.${kind}`);
  if (kind === 'heic' || kind === 'heif') execFileSync('heif-enc', ['--lossless', '-o', out, png], { stdio: 'ignore', timeout: 300000 });
  else if (kind === 'bmp' || kind === 'gif') execFileSync('convert', [png, out], { stdio: 'ignore' });
  else py('pictures.py', 'encode', png, out, kind);
  return new Uint8Array(readFileSync(out));
}

/* the mean absolute difference of two pictures' RGB samples, and their sizes */
export const diff = (a, b) => JSON.parse(py('pictures.py', 'diff', a, b));

/* a lossless PNG of `png` turned `degrees` counter-clockwise */
export function turned(png, degrees) {
  const out = join(scratch('turn'), 't.png');
  py('pictures.py', 'turn', png, out, String(degrees));
  return out;
}

/* bytes to a file of their own, for a tool to read */
export function fileOf(bytes, name) {
  const path = join(scratch('file'), name);
  writeFileSync(path, bytes);
  return path;
}

/* ExifTool writes facts into a picture's copy: { time: 'YYYY:MM:DD HH:MM:SS', latitude, longitude, orientation } */
export function withFacts(bytes, kind, { time, latitude, longitude, orientation }) {
  const path = fileOf(bytes, `f.${kind}`);
  const args = ['-overwrite_original', '-n'];
  if (time) args.push(`-DateTimeOriginal=${time}`);
  if (latitude != null) args.push(`-GPSLatitude=${Math.abs(latitude)}`, `-GPSLatitudeRef=${latitude < 0 ? 'S' : 'N'}`, `-GPSLongitude=${Math.abs(longitude)}`, `-GPSLongitudeRef=${longitude < 0 ? 'W' : 'E'}`);
  if (orientation) args.push(`-Orientation=${orientation}`);
  execFileSync('exiftool', [...args, path], { stdio: 'ignore' });
  return new Uint8Array(readFileSync(path));
}
