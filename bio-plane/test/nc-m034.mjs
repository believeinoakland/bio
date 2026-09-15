/* M0-34's negative-control driver — D-367: `tools/decided.mjs`'s ruling MARKER matched the
 * ruling index's OWN FILENAME, because `.` is a word boundary and `DECIDED.md` therefore
 * satisfied `/\b(…|DECIDED|…)\b/`. Prose that merely NAMED the index minted a ruling row,
 * attributed to whatever id the sentence happened to mention. Re-run in one step from
 * `bio-plane/`:
 *
 *     node test/nc-m034.mjs            all arms, in order
 *     node test/nc-m034.mjs A2         one arm (BASE A1 A2 A3 A4 A5 A6)
 *
 * IT DRIVES THE CLI, NOT THE EXPORT. The tool's own `--control` exercises `scan()` in
 * memory and is the cheap arm that runs after any pattern change; this driver PLANTS PROSE
 * IN A REAL CORPUS FILE ON DISK and reads the GENERATED `docs/DECIDED.md` back, because
 * what the defect produced was a ROW IN A FILE A SESSION READS — and a store-level check is
 * not evidence that a reader was served.
 *
 * D-331: every anchor is VALIDATED BEFORE ANYTHING IS ARMED — a patch that matched zero
 * times reads exactly like a green, and an arm that did not arm is a finding.
 * CLAUDE.md's `git checkout --` trap: every restore is a cp-back from a UNIQUELY-NAMED
 * per-arm pristine copy, verified by sha256 AND by `cmp` AND by a floored byte count.
 *
 * THE ANCHOR IS THE WHOLE REGEX TAIL AND NOT THE CLAUSE, and that is a measurement rather
 * than a preference: the bare string `(?!\.md\b)` occurs THREE times in `tools/decided.mjs`
 * (the regex plus the two comments that explain it), so an arm anchored on the clause would
 * have mutated a COMMENT and reported a green. Caught by the uniqueness assertion below
 * before anything was armed — the "anchor occurred twice" class, met on the first draft.
 *
 * DECLARED BEFORE ARMING — what MUST hold and what MUST NOT:
 *   BASE  nothing armed          -> `--check` exit 0 (the committed index is current) AND
 *                                   `--control` exit 0. The row that tells six-arms-working
 *                                   from six-arms-broken.
 *   A1    the plant alone, tool AS COMMITTED
 *                                -> the planted sentence yields **0** rows. A line of prose
 *                                   naming `DECIDED.md` beside an id is not a ruling.
 *   A2    the plant AND the `(?!\.md\b)` clause removed
 *                                -> the SAME sentence yields **1** row, attributed to the id
 *                                   it merely MENTIONS. THE ARM THAT PROVES THE DEFECT WAS
 *                                   REAL, driven in both directions rather than argued.
 *   A3    OVER-STRICTNESS: a planted sentence carrying a REAL marker with a `.md` filename
 *         elsewhere in it        -> **1** row. A ruling does not lose its place because a
 *                                   filename shares its sentence.
 *   A4    OVER-STRICTNESS: a planted sentence whose marker ENDS it (`… was SETTLED.`)
 *                                -> **1** row. `.` is still a word boundary and must stay one.
 *   A5    OVER-STRICTNESS over the REAL CORPUS, nothing armed
 *                                -> none of the eight rows D-367 names carries a bullet
 *                                   quoting `DECIDED.md`, and the index is still FLOORED
 *                                   above 850 rulings — an artifact was removed, not a corpus.
 *   A6    THE CLAUSE'S OWN ARM: the clause removed, nothing planted
 *                                -> all EIGHT named rows COME BACK. This is what makes the
 *                                   clause a mechanism rather than a comment, and it is the
 *                                   regression guard: delete the clause and this goes red.
 *
 * RESULT, 2026-09-15: all six plus BASE AS DECLARED on the first run, every restore
 * byte-identical (sha256 + `cmp` + floored byte count).
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");            /* the repo root: test/ -> bio-plane/ -> . */
const PEN = mkdtempSync(join(tmpdir(), "nc-m034-"));
const ONLY = process.argv[2] || null;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const TOOL = join(ROOT, "tools/decided.mjs");
const INDEX = join(ROOT, "docs/DECIDED.md");
const HOST = join(ROOT, "docs/development/MEASUREMENTS.md");   /* the corpus file planted in */

/* Floors, so a restore over a TRUNCATED file cannot read clean — the `e3b0c442…` lesson.
   Each sits far below the real size and is asserted on every restore, never assumed. */
const FLOOR = { [TOOL]: 4000, [INDEX]: 100000, [HOST]: 400000 };

/* THE ANCHOR — the regex TAIL, asserted to occur exactly once before any arm removes it.
   See the header: the clause alone occurs three times and would mutate a comment. */
const ANCHOR = "CONCEDED)\\b(?!\\.md\\b)/;";
const DISARMED = "CONCEDED)\\b/;";

/* THE PLANTS. Each is one line appended to a real corpus file, carrying a phrase no other
   line in the corpus carries — so the count is of THIS sentence and not of a neighbour
   that happens to look like it. */
/* THE TAG IS DELIBERATELY NOT AN ID, and that is this driver's own first finding rather
   than foresight. The first draft tagged each plant `M0-34 nc plant alpha …`; A2 then
   reported the minted row NOT attributed to REC-85 and went red over a working subject,
   because `ID.exec` takes the FIRST id in the quoted sentence and `M0-34` — the driver's
   own label — was it. The declaration was what was wrong, so it is CORRECTED here rather
   than relaxed: the tag is now a token in no namespace (`NC`), leaving exactly one id in
   the sentence, so "attributed to an id it merely MENTIONS" is a claim about the subject
   instead of about the fixture. */
const PLANTS = {
  /* A1/A2 — prose that merely NAMES the index, beside an id. The defect's exact shape. */
  filename: "NC PLANT ALPHA — REC-85's claim added one path, `docs/DECIDED.md`, regenerated by the tool and never hand-edited.",
  /* A3 — a REAL ruling whose sentence happens to carry a `.md` filename elsewhere. */
  realWithFile: "NC PLANT BETA — DEC-32 was RULED on 2026-08-01 and it lives in `docs/development/DECISIONS.md` to this day.",
  /* A4 — a real ruling whose marker is the last word of its sentence. */
  sentenceEnd: "NC PLANT GAMMA — the scope of the archive scan was SETTLED. Nothing has reopened it in the time since.",
};
const PHRASE = { filename: "NC PLANT ALPHA", realWithFile: "NC PLANT BETA", sentenceEnd: "NC PLANT GAMMA" };

/* The eight rows D-367 names as the artifact — the CONTROL: absent after the fix, present
   the moment the clause is removed. */
const NAMED = ["D-293", "D-311", "IC-82", "C-7.1", "REC-85", "UI-31", "UI-58", "UI-59"];

function run(args) {
  try { return { code: 0, out: execFileSync("node", ["tools/decided.mjs", ...args], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) }; }
  catch (e) { return { code: e.status ?? -1, out: (e.stdout || "") + (e.stderr || "") }; }
}

/* One BULLET in the generated index is one ruling row. */
const bulletsQuoting = (text, phrase) =>
  text.split("\n").filter((l) => l.startsWith("- ") && l.includes(phrase)).length;

/* A named id's bullet that QUOTES the index's own filename — the phantom's signature. */
const phantomBullets = (text) => {
  const lines = text.split("\n");
  return NAMED.filter((id) => lines.some((l) => l.startsWith(`- **${id}**`) && l.includes("DECIDED.md")));
};
const rulingCount = (text) => { const m = text.match(/^(\d+) rulings across/m); return m ? +m[1] : -1; };

/* ---------------------------------------------------------------- arming and restoring */
let failures = 0;
const say = (ok, line) => { if (!ok) failures++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${line}`); };
const rel = (f) => f.replace(ROOT + "/", "");

function armed(name, files, mutate, check) {
  if (ONLY && ONLY !== name) return;
  console.log(`\n[${name}]`);
  const pristine = {};
  for (const f of files) { pristine[f] = join(PEN, `${name}-${f.split("/").pop()}`); copyFileSync(f, pristine[f]); }
  try { mutate(); check(); }
  finally {
    for (const f of files) {
      copyFileSync(pristine[f], f);
      const bytes = statSync(f).size;
      let cmpOk = true;
      try { execFileSync("cmp", ["-s", pristine[f], f]); } catch { cmpOk = false; }
      const ok = sha(f) === sha(pristine[f]) && cmpOk && bytes >= FLOOR[f];
      say(ok, `restore ${rel(f)} byte-identical: ${ok ? "YES" : "NO"} (${bytes} bytes, floor ${FLOOR[f]}, cmp ${cmpOk ? "ok" : "DIFFERS"})`);
    }
  }
}

const plantInto = (file, line) => writeFileSync(file, readFileSync(file, "utf8").replace(/\n?$/, () => `\n\n${line}\n`));

function stripClause() {
  const src = readFileSync(TOOL, "utf8");
  const n = src.split(ANCHOR).length - 1;
  if (n !== 1) { say(false, `ANCHOR NOT UNIQUE — it occurs ${n} time(s) in tools/decided.mjs; THE ARM DID NOT ARM.`); return false; }
  writeFileSync(TOOL, src.replace(ANCHOR, DISARMED));
  return true;
}

/* ---------------------------------------------------------------- the arms */
console.log(`nc-m034 — D-367's marker clause, driven in both directions. pen ${PEN}`);
{
  const n = readFileSync(TOOL, "utf8").split(ANCHOR).length - 1;
  say(n === 1, `ANCHOR VALIDATED BEFORE ANY ARM — the regex tail occurs exactly once in tools/decided.mjs (${n})`);
}

armed("BASE", [], () => {}, () => {
  const chk = run(["--check"]);
  say(chk.code === 0, `BASE  the committed index is CURRENT (\`--check\` exit ${chk.code})`);
  const ctl = run(["--control"]);
  say(ctl.code === 0, `BASE  the tool's own \`--control\` exits ${ctl.code}`);
});

armed("A1", [HOST, INDEX], () => plantInto(HOST, PLANTS.filename), () => {
  run([]);
  const n = bulletsQuoting(readFileSync(INDEX, "utf8"), PHRASE.filename);
  say(n === 0, `A1  a planted line NAMING \`DECIDED.md\` beside an id yields ${n} row(s) — declared 0`);
});

armed("A2", [HOST, INDEX, TOOL], () => { plantInto(HOST, PLANTS.filename); stripClause(); }, () => {
  run([]);
  const idx = readFileSync(INDEX, "utf8");
  const n = bulletsQuoting(idx, PHRASE.filename);
  const attributed = idx.split("\n").some((l) => l.startsWith("- **REC-85**") && l.includes(PHRASE.filename));
  say(n === 1, `A2  THE DEFECT, RENDERED: with the clause removed the SAME line yields ${n} row(s) — declared 1`);
  say(attributed, `A2  and it is attributed to REC-85, an id the sentence merely MENTIONS: ${attributed}`);
});

armed("A3", [HOST, INDEX], () => plantInto(HOST, PLANTS.realWithFile), () => {
  run([]);
  const n = bulletsQuoting(readFileSync(INDEX, "utf8"), PHRASE.realWithFile);
  say(n === 1, `A3  OVER-STRICTNESS: a real RULED sentence carrying a \`.md\` filename elsewhere yields ${n} row(s) — declared 1`);
});

armed("A4", [HOST, INDEX], () => plantInto(HOST, PLANTS.sentenceEnd), () => {
  run([]);
  const n = bulletsQuoting(readFileSync(INDEX, "utf8"), PHRASE.sentenceEnd);
  say(n === 1, `A4  OVER-STRICTNESS: a marker ENDING its sentence (\`SETTLED.\`) yields ${n} row(s) — declared 1`);
});

armed("A5", [], () => {}, () => {
  const idx = readFileSync(INDEX, "utf8");
  const hit = phantomBullets(idx), count = rulingCount(idx);
  say(hit.length === 0, `A5  of the eight rows D-367 names, ${hit.length} still quote \`DECIDED.md\`${hit.length ? ": " + hit.join(", ") : ""} — declared 0`);
  say(count > 850, `A5  the corpus is FLOORED, not emptied — the committed index holds ${count} rulings (floor 850)`);
});

armed("A6", [INDEX, TOOL], () => { if (stripClause()) run([]); }, () => {
  const hit = phantomBullets(readFileSync(INDEX, "utf8"));
  say(hit.length === 8, `A6  THE CLAUSE'S OWN ARM: remove it and ${hit.length} of 8 named rows come back — declared 8 (${hit.join(", ") || "none"})`);
});

console.log(`\nnc-m034: ${failures} failing check(s).`);
process.exit(failures ? 1 : 0);
