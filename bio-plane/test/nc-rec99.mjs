/* NEGATIVE CONTROL DRIVER for REC-99 / D-365 — `cd bio-plane && node test/nc-rec99.mjs`.
 *
 * The same shape as `nc-rec66.mjs` beside it, and for the same reason: an arm is only worth
 * what its RESTORE is worth, so every file is copied to a PRISTINE copy named UNIQUELY PER ARM
 * and verified back by sha256 AND by `cmp`, with a byte count printed and a minimum guarded.
 *
 * EVERY ARM IS ARMED ALONE, every other held open, and each arm DECLARES before it runs what
 * MUST fail and what MUST NOT — an arm whose surprise is smoothed away is not a control.
 *
 * AND EVERY ARM ASSERTS IT ACTUALLY ARMED: the patch must match EXACTLY ONCE. An arm that
 * matched zero times, or twice, is a finding about the arm and is reported as one — three arms
 * in this estate have failed that way and passed as green.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const PEN = controlPen("rec99");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

const STORE = new URL("../src/store.mjs", import.meta.url).pathname;
const SUITE = new URL("./derivation-bounds.test.mjs", import.meta.url).pathname;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const size = (p) => readFileSync(p).length;

const run = (name) => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [new URL(`./${name}.test.mjs`, import.meta.url).pathname],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through NO assertion and ends the module with the
     tally reading clean, so a MISSING tally is reported as -1 and never as 0. */
  const tally = m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
  const census = /CENSUS ROSTER \((\d+) methods/.exec(out);
  const violations = [...out.matchAll(/^\s+FAIL\s+(TRUNCATION SOURCE[^\n]*)/gm)].length;
  const names = [...out.matchAll(/got\s+(\[[^\n]*\))\]/g)].map((x) => x[1]);
  return { ...tally, census: census ? +census[1] : -1, violations, out, names };
};

/* Each arm: [label, file, find, replace, declared] — `find` must occur EXACTLY ONCE. */
const ARMS = [
  ["(7) THE RATCHET'S OWN FIGURE RAISED BY ONE BY HAND (103 -> 104) — the arm that proves the "
 + "census is GRADED rather than reported", SUITE,
    "const SCANNING_MEASURED_2026_09_15 = 103;",
    "const SCANNING_MEASURED_2026_09_15 = 104;",
    "MUST FAIL: the CENSUS FLOOR, naming the count. MUST NOT: the ceiling, the truncation arms, "
  + "the class ratchet, anything live."],

  ["(8) `LIMIT ?` AND ITS `cap + 1` REMOVED FROM `resolutionsForCapture` — D-365's own arm, the "
 + "one that left every bounds suite green", STORE,
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`, captureSha, cap + 1);",
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id`, captureSha);",
    "MUST FAIL: the TRUNCATION SOURCE arm NAMING `resolutionsForCapture`, plus the census CEILING "
  + "(103 -> 104). MUST NOT: the envelope arms in `bounds`/`meaning-bounds`, which is exactly what "
  + "D-365 measured and what makes the two halves independent."],

  ["(9) THE SAME ON `documentsConcerning`", STORE,
    "FROM resolutions WHERE entity_id=? ORDER BY grade, bundle_id, capture_sha LIMIT ?`, entityId, cap + 1);",
    "FROM resolutions WHERE entity_id=? ORDER BY grade, bundle_id, capture_sha`, entityId);",
    "MUST FAIL: the TRUNCATION SOURCE arm NAMING `documentsConcerning`, plus the census CEILING."],

  ["(9b) THE SAME ON `connectionsFor`'s ENTITY ARM — the read D-224's k(k-1)/2 curve was raised "
 + "for, and the arm that proves a method assigning its scan in TWO branches is graded on BOTH",
    STORE,
    "`SELECT * FROM connections WHERE entity_id=? ORDER BY grade, a_capture_sha, b_capture_sha LIMIT ?`, entityId, cap + 1);",
    "`SELECT * FROM connections WHERE entity_id=? ORDER BY grade, a_capture_sha, b_capture_sha`, entityId);",
    "MUST FAIL: the TRUNCATION SOURCE arm NAMING `connectionsFor`, plus the census CEILING. MUST "
  + "NOT: the capture arm's own grading, which is untouched and must stay graded."],

  ["(10) THE CAP THAT IS NOT THE PUBLISHED CAP — `LIMIT ?`/`cap + 1` replaced by a LITERAL "
 + "`LIMIT 5000` on `resolutionsForCapture`. THE ARM THAT DECIDES WHETHER HALF (2) EARNS ITS "
 + "PLACE: the SQL is still bounded, so the CENSUS CANNOT MOVE", STORE,
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`, captureSha, cap + 1);",
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT 5000`, captureSha);",
    "MUST FAIL: the TRUNCATION SOURCE arm NAMING `resolutionsForCapture` as `SQL bound is not the "
  + "published cap`. MUST NOT: the census ceiling or floor — the figure MUST stay at 103, and if "
  + "it moves this arm has proved something other than what it claims."],

  ["(11) OVER-STRICTNESS — a CORRECT read in a spelling this grader did not anticipate: the cap "
 + "passed through an ALIAS (`const window = cap + 1`) instead of inline. It must PASS", STORE,
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`, captureSha, cap + 1);",
    "FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`, captureSha, window);",
    "MUST NOT FAIL — anything. The read is correct and only its spelling changed; a grader that "
  + "reds here is tighter than its rule, which is an undeclared interface change wearing the "
  + "costume of caution."],
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). Arm (11)'s alias edit below
   is an unchecked replace (>= 1 site), quoted here from the loop. */
anchorTable([...ARMS.map(([label, file, find, put]) => ({ arm: label.slice(1, label.indexOf(")")), file, find, put })),
  { arm: "11", file: STORE, find: "const cap = Math.max(1, Math.min(Number(limit) || Store.#MEANING_LIMIT_DEFAULT, Store.#MEANING_LIMIT_MAX));\n    /* cap + 1 is asked", sites: "any" }]);

const base = run("derivation-bounds");
console.log(`BASELINE ROW FIRST — derivation-bounds ${base.pass}/${base.fail}, census ${base.census}`);
const baseBounds = run("bounds"), baseMeaning = run("meaning-bounds");
console.log(`  siblings at baseline: bounds ${baseBounds.pass}/${baseBounds.fail} · `
          + `meaning-bounds ${baseMeaning.pass}/${baseMeaning.fail}`);
if (base.fail !== 0 || base.pass < 1) { console.log("REFUSING TO ARM: the baseline is not clean."); process.exit(1); }

let armed = 0;
for (const [label, file, find, replace, declared] of ARMS) {
  const tag = label.slice(1, label.indexOf(")")).replace(/\W/g, "");
  const pristine = penPath(file, `pristine-rec99-arm${tag}`);
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const occurrences = before.split(find).length - 1;
  console.log(`\n=== ARM ${label}`);
  console.log(`    DECLARED: ${declared}`);
  if (occurrences !== 1) {
    console.log(`    *** THE ARM DID NOT ARM: the patch matched ${occurrences} time(s), not 1. `
              + `That is a finding about the ARM and is reported as one.`);
    unlinkSync(pristine); continue;
  }
  /* arm (11) needs the alias to exist as well as be used */
  let patched = before.replace(find, replace);
  if (tag === "11") patched = patched.replace(
    "const cap = Math.max(1, Math.min(Number(limit) || Store.#MEANING_LIMIT_DEFAULT, Store.#MEANING_LIMIT_MAX));\n    /* cap + 1 is asked",
    "const cap = Math.max(1, Math.min(Number(limit) || Store.#MEANING_LIMIT_DEFAULT, Store.#MEANING_LIMIT_MAX));\n    const window = cap + 1;\n    /* cap + 1 is asked");
  writeFileSync(file, patched);
  armed++;

  const db = run("derivation-bounds");
  const bd = run("bounds"), mb = run("meaning-bounds");
  console.log(`    MEASURED: derivation-bounds ${db.pass}/${db.fail} (census ${db.census}) · `
            + `bounds ${bd.pass}/${bd.fail} · meaning-bounds ${mb.pass}/${mb.fail}`);
  for (const line of db.out.split("\n").filter((l) => /^\s+FAIL/.test(l)))
    console.log(`      FAILED: ${line.trim().slice(0, 150)}`);
  const got = /got\s+(\[.*)/.exec(db.out);
  if (got) console.log(`      NAMED: ${got[1].slice(0, 220)}`);

  writeFileSync(file, readFileSync(pristine));
  const ok = sha(file) === sha(pristine);
  let identical = false;
  try { execFileSync("cmp", [file, pristine]); identical = true; } catch { identical = false; }
  console.log(`    RESTORED byte-identically: ${ok && identical ? "YES" : "NO"} `
            + `(sha256 ${ok ? "equal" : "DIFFERENT"}, cmp ${identical ? "identical" : "DIFFERENT"}, `
            + `${size(file)} bytes)`);
  if (size(file) < 50000) console.log("    *** THE RESTORE IS BELOW ITS FLOOR — a restore over a truncated file agrees for free.");
  if (!ok || !identical) { console.log("    *** STOPPING: an unrestored tree makes every later arm meaningless."); process.exit(1); }
  unlinkSync(pristine);
}
console.log(`\n${armed} of ${ARMS.length} arms armed. Pristine copies: ${ARMS.map(([l]) => penPath(STORE, `pristine-rec99-arm${l.slice(1, l.indexOf(")")).replace(/\W/g, "")}`)).filter(existsSync).length} left behind (must be 0).`);
const after = run("derivation-bounds");
console.log(`CLOSING BASELINE — derivation-bounds ${after.pass}/${after.fail}, census ${after.census} `
          + `(must equal the opening row ${base.pass}/${base.fail}, census ${base.census})`);
