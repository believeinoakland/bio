/* Large-file fixtures for the csv-reader suite (fix round 4b, F7; R9): a real body over the 20 MiB bound, built
 * from a seeded generator so a run draws nothing from a clock or the system's randomness, and returned with the
 * document text its reader must give back, computed here by a route that shares no code with the reader. */
import { enc } from "./fixtures.mjs";

const ALNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** xorshift32: the same sequence for the same seed. */
export function prng(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x;
  };
}

/** `n` characters of letters and digits: close to incompressible. */
export function randomText(rand, n) {
  let s = "";
  for (let i = 0; i < n; i++) s += ALNUM[rand() % 62];
  return s;
}

export const MIB = 1024 * 1024;

/** One RFC 4180 field, quoted when it holds a delimiter, a quote or a line break. */
export function csvField(v) {
  return /[",\r\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v;
}

/** A comma-separated body of `rows` records of six fields; every 7th record
 *  after the 60th (the delimiter signature reads the first 50 lines) holds a quoted field with a comma, a doubled quote and a bare line break,
 *  and every 11th an empty field. */
export function bigCsv({ rows, strLen = 400, seed = 17 }) {
  const rand = prng(seed);
  const out = [];
  const lines = [];
  for (let r = 1; r <= rows; r++) {
    const fields = [String(r)];
    for (let c = 0; c < 5; c++) fields.push(randomText(rand, strLen));
    if (r > 60 && r % 7 === 0) fields[2] = `a,b "quoted"\nsecond line ${fields[2].slice(0, 20)}`;
    if (r % 11 === 0) fields[3] = "";
    out.push(fields.map(csvField).join(","));
    lines.push(fields.filter((f) => f !== "").join("\t"));
  }
  const bytes = enc(out.join("\r\n") + "\r\n");
  return { bytes, expected: lines.join("\n"), declared: bytes.length, rows };
}
