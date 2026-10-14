/* setup-words' generator (R10): `docs/development/ux-substrate/screens/words.json` as it stands in the product tree
   becomes `bio-plane/src/setup-words/rows.mjs`. Run from the repository root:
     node bio-plane/src/setup-words/build.mjs            write rows.mjs
     node bio-plane/src/setup-words/build.mjs --check    exit 1, naming the first difference, when rows.mjs is stale
   `--words <file>` and `--out <file>` name other paths (the tests' fixtures). Never imported by the module (R4), so
   never bundled. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
export const WORDS_PATH = join(ROOT, "docs/development/ux-substrate/screens/words.json");
export const ROWS_PATH = join(ROOT, "bio-plane/src/setup-words/rows.mjs");

/* R1's sibling rule: the nearest dotted prefix of at least two segments holding `<prefix>.means` or `<prefix>.does`
   other than the word itself; a word whose key ends in `.means` or `.does` has none. */
function meaningOf(key, byKey) {
  const s = key.split(".");
  if (s.at(-1) === "means" || s.at(-1) === "does") return null;
  for (let n = s.length - 1; n >= 2; n--)
    for (const end of ["means", "does"]) {
      const k = `${s.slice(0, n).join(".")}.${end}`;
      if (k !== key && byKey.has(k)) return byKey.get(k).en;
    }
  return null;
}

/* The rows R1 describes, from the file's bytes. */
export function rowsOf(bytes) {
  const file = JSON.parse(bytes.toString("utf8"));
  if (!Array.isArray(file.words)) throw new Error("setup-words build: the file holds no words list");
  const byKey = new Map();
  for (const w of file.words) {
    if (typeof w.key !== "string" || typeof w.en !== "string") throw new Error(`setup-words build: a word without a string key and en (${w.key})`);
    if (byKey.has(w.key)) throw new Error(`setup-words build: key ${w.key} is not distinct`);
    byKey.set(w.key, w);
  }
  return file.words.map((w) => [w.key, w.en, w.note ?? null, meaningOf(w.key, byKey), w.protected === true]);
}

export const versionOf = (bytes) => createHash("sha256").update(bytes).digest("hex");

/* The text of rows.mjs for the file's bytes. */
export function render(bytes) {
  const rows = rowsOf(bytes);
  const sha = versionOf(bytes);
  const protectedCount = rows.filter((r) => r[4]).length;
  const body = rows.map((r) => `  ${JSON.stringify(r)},`).join("\n");
  return `/* GENERATED: do not edit by hand. setup-words R10 (R1's rule; DEC-179, DEC-257; K3366): the interface's word list,
   docs/development/ux-substrate/screens/words.json (${rows.length} words, ${protectedCount} protected; SHA-256
   ${sha}), each [key, en, note, means, protected]: key, en, note (or null) and protected as the file gives
   them, means the en of the word's sibling .means or .does entry (the nearest dotted prefix of at least two segments
   holding one), or null. WORDS_COMMIT is the first 10 hex digits of that SHA-256. The list and each row are frozen (R3). Written by
   \`node bio-plane/src/setup-words/build.mjs\` from the repository root (\`--check\` finds it stale);
   bio-plane/test/m/setup-words/word-list.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(sha.slice(0, 10))};
export const WORD_ROWS = Object.freeze([
${body}
].map((row) => Object.freeze(row)));
`;
}

/* The first difference between the file on disk and what the generator writes, or null: a word first (by its key, in
   the file's order), then the rest of the text. */
export function firstDifference(have, want) {
  if (have === want) return null;
  const a = have.split("\n"), b = want.split("\n");
  const rowsOnly = (lines) => lines.filter((l) => l.startsWith("  [\""));
  const ra = rowsOnly(a), rb = rowsOnly(b);
  for (let i = 0; i < Math.max(ra.length, rb.length); i++)
    if (ra[i] !== rb[i]) {
      const key = (rb[i] ?? ra[i]).match(/^ {2}\["((?:[^"\\]|\\.)*)"/)?.[1];
      return `word ${i + 1} (${key}): have ${JSON.stringify(ra[i] ?? null)}, the file gives ${JSON.stringify(rb[i] ?? null)}`;
    }
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    if (a[i] !== b[i]) return `line ${i + 1}: have ${JSON.stringify(a[i] ?? null)}, the file gives ${JSON.stringify(b[i] ?? null)}`;
  return "differs";
}

function main(argv) {
  const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; };
  const bytes = readFileSync(opt("--words", WORDS_PATH));
  const out = opt("--out", ROWS_PATH);
  const want = render(bytes);
  if (argv.includes("--check")) {
    let have = null;
    try { have = readFileSync(out, "utf8"); } catch { /* absent */ }
    const d = have === null ? "the generated list is absent" : firstDifference(have, want);
    if (d) { process.stderr.write(`setup-words: ${out} is stale: ${d}\n`); return 1; }
    process.stdout.write("setup-words: rows.mjs matches words.json\n");
    return 0;
  }
  writeFileSync(out, want);
  process.stdout.write(`setup-words: wrote ${out}\n`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
