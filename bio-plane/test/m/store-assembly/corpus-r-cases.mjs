/* store-assembly's copy of plane's test helper. The corpus R set's cases (fix round 9 plan section 7 item 3; K4785 (3), K4798): `pdfgen`, `imggen`, `sheetgen` and `docgen` (test-support's seeded generators) through plane's shape runner
   (`shape/harness.mjs`), 16 seeded variations: 8 FIXED seeds and 8 DERIVED from the tranche commit (so a new tranche commit draws new files and a red is reproducible from the commit it names).
   A case is one generator at one seed: a recipe whose shape (size, fonts, kinds, encodings, structure) is a pure function of the seed, so the same seed always makes the same file. The file is made once into
   `BIO_FIXTURE_CACHE` (never committed), fed by the member's path, and read to its end by the ledger. A case's pass is the contract of its file's size: READ WHOLE (completeness whole, read through = total, no unit
   owed) within the bound the reading keeps, or REFUSED with its size and the limit it was judged against, size over limit (a reading that is neither is a product finding, never a pass).
   Pure data and builders; no test runs here. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generate as pdfGenerate } from "../../pdfgen.mjs";
import { generate as imgGenerate } from "../../imggen.mjs";
import { generate as sheetGenerate } from "../../sheetgen.mjs";
import { generate as docGenerate } from "../../docgen.mjs";
import { hash32 } from "../../seeded.mjs";

/** the 8 fixed seeds */
export const FIXED_SEEDS = Object.freeze(["corpus-r-1", "corpus-r-2", "corpus-r-3", "corpus-r-4", "corpus-r-5", "corpus-r-6", "corpus-r-7", "corpus-r-8"]);

/** the tranche commit the derived seeds come from: `BIO_TRANCHE_COMMIT`, else the merge base of HEAD with `origin/tranche/T51` (a prep branch keeps the tranche's commit as it commits), else "no-commit" */
export function trancheCommit() {
  if (process.env.BIO_TRANCHE_COMMIT) return process.env.BIO_TRANCHE_COMMIT;
  try { return execFileSync("git", ["merge-base", "HEAD", "origin/tranche/T51"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return "no-commit"; }
}
/** the 8 seeds derived from a commit: sha256(`<commit>:<i>`), 10 hex digits */
export const derivedSeeds = (commit) => Array.from({ length: 8 }, (_, i) => `d${i + 1}-` + createHash("sha256").update(`${commit}:${i + 1}`).digest("hex").slice(0, 10));
/** the 16 seeded variations: [{ n, kind: "fixed"|"derived", seed }] */
export const variations = (commit = trancheCommit()) => [...FIXED_SEEDS.map((seed, i) => ({ n: i + 1, kind: "fixed", seed })), ...derivedSeeds(commit).map((seed, i) => ({ n: 9 + i, kind: "derived", seed }))];

const pick = (seed, tag, list) => list[hash32(`${seed}|${tag}`) % list.length];
const range = (seed, tag, lo, hi) => lo + (hash32(`${seed}|${tag}`) % (hi - lo + 1));

/* the recipes: one per generator, the shape drawn from the seed. Sizes stay inside the alpha's bounds (the boundary cases are the sets of G124f and G128i) so a case's honest answer is a whole reading. */
export const RECIPES = {
  pdf: (seed) => ({ kind: "pdf", seed, size: { pages: range(seed, "pages", 3, 24), lines: range(seed, "lines", 12, 40) },
    fonts: ["type0"],   /* tier 1 decodes a text only through a ToUnicode map (type0); the other fonts need the pdf-worker member, which the shape harness does not stand up */
    structure: pick(seed, "structure", ["classic", "xref-stream", "object-streams", "linearized"]), compress: hash32(`${seed}|z`) % 2 === 0 }),
  /* imggen writes a bmp in RGB and a gif in P alone; the page is drawn at 100 or 150 dpi so the file stays near a megabyte (a 300 dpi RGB page is 25 MB, over the whole-read ceiling: the boundary cases are G128i's) */
  image: (seed) => { const kind = pick(seed, "kind", ["png", "png", "tiff", "gif", "bmp"]); const mode = kind === "bmp" ? "RGB" : kind === "gif" ? "P" : pick(seed, "mode", ["L", "RGB"]);
    return { kind, seed, size: { pages: 1, lines: range(seed, "lines", 6, 14) }, dpi: pick(seed, "dpi", [100, 150]), mode }; },
  sheet: (seed) => ({ kind: pick(seed, "kind", ["csv", "tsv", "xlsx", "ods"]), seed, size: { rows: range(seed, "rows", 200, 4000), cols: range(seed, "cols", 3, 12) }, header: "one" }),
  doc: (seed) => ({ kind: pick(seed, "kind", ["docx", "pptx", "odt", "odp", "html", "text"]), seed, size: { units: range(seed, "units", 20, 600) } }),
};
export const GENERATORS = Object.freeze({ pdf: pdfGenerate, image: imgGenerate, sheet: sheetGenerate, doc: docGenerate });

/** the cases: every generator at every variation. `id` is `<generator>@<n>` */
export function cases(commit = trancheCommit()) {
  return variations(commit).flatMap((v) => Object.keys(RECIPES).map((generator) => ({ id: `${generator}@${v.n}`, generator, variation: v, recipe: RECIPES[generator](v.seed) })));
}

/** the file of a case, made once into the fixture cache by the recipe's key: `{ path, bytes, name, type, ext, truth }` */
export async function fileOf(c) {
  const g = GENERATORS[c.generator](c.recipe);
  const dir = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures"); mkdirSync(dir, { recursive: true });
  const key = createHash("sha256").update(JSON.stringify(c.recipe)).digest("hex").slice(0, 20);
  const path = join(dir, `corpus-r-${c.generator}-${key}.${g.ext}`);
  if (!existsSync(path)) { const parts = []; for await (const ch of g.chunks()) parts.push(Buffer.from(ch)); writeFileSync(path, Buffer.concat(parts)); }
  return { path, bytes: statSync(path).size, name: `corpus-${c.generator}.${g.ext}`, type: g.type, ext: g.ext, truth: g.truth };
}

/** the shape harness's `doc` for a case's file (the harness feeds any path by the member's upload) */
export const docOf = (f) => ({ kind: "file", path: f.path, bytes: f.bytes, name: f.name, type: f.type, marks: [] });

/** what a run must be, as a list of failures (empty: it passes). A run PASSES when the child lived and the reading is either
 *  WHOLE: completeness `whole`, read through equal to the total, nothing left owed, or
 *  REFUSED with its size and its limit: `reading.refusal` carries `reason`, a numeric `size` over a numeric `bound`
 *  (or, for a picture alone, STATED: the shape harness stands up no OCR member and the product reads TIFF, GIF and BMP "not read yet", so a picture can be neither whole nor over a bound;
 *  it passes only as `completeness.state === "stated"` with a `why`, `failure: "final"`, nothing claimed: never silent, never a unit).
 *  A reading that is partial, that ended `failed` with neither, or that was never made is a failure (the answer names which). */
export function judge(r, f, { picture = false } = {}) {
  if (r.died) return [`the child died (${r.signal || "exit " + r.code}${r.timedOut ? ", timed out" : ""}): ${r.error || r.stderr}`];
  const out = [];
  const g = r.reading;
  if (picture && g && g.completeness && g.completeness.state === "stated") {
    if (!g.completeness.why) out.push("a picture stated without a reason");
    if (g.unitsInAnswer) out.push(`a picture stated but ${g.unitsInAnswer} unit(s) were claimed`);
    return out;
  }
  if (!g) return [`no reading was made${r.readingDied ? " (the child died asking for it)" : ""}; ledger left [${(r.done && r.done.left) || ""}]`];
  if (g.refusal) {
    const { reason, size, bound } = g.refusal;
    if (!reason) out.push("a refusal without a reason");
    if (!Number.isFinite(Number(size))) out.push(`a refusal without its size (${size})`);
    if (!Number.isFinite(Number(bound))) out.push(`a refusal without its limit (${bound})`);
    if (Number.isFinite(Number(size)) && Number.isFinite(Number(bound)) && !(Number(size) > Number(bound))) out.push(`a refusal whose size ${size} is not over its limit ${bound}`);
    return out;
  }
  const state = g.completeness && g.completeness.state;
  if (state !== "whole") out.push(`the reading is not whole: completeness ${JSON.stringify(g.completeness && { state: g.completeness.state, why: g.completeness.why })}, read_through ${g.read_through}/${g.total}`);
  if (g.total != null && g.read_through != null && g.read_through !== g.total) out.push(`read through ${g.read_through} of ${g.total}`);
  if (r.done && r.done.left && r.done.left.length) out.push(`work still owed in the ledger: [${r.done.left}]`);
  return out;
}
