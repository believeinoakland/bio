/* NEGATIVE CONTROL DRIVER for M0-38 / D-369 — `cd bio-plane && node test/nc-m038.mjs`.
 *
 * The same shape as `nc-rec66.mjs` and `nc-rec99.mjs` beside it, and for the same reason: an arm
 * is only worth what its RESTORE is worth, so every file is copied to a PRISTINE copy named
 * UNIQUELY PER ARM and verified back by sha256 AND by `cmp`, with a byte count printed and a
 * minimum guarded.
 *
 * EVERY ARM IS ARMED ALONE, every other held open, and each arm DECLARES before it runs what
 * MUST fail and what MUST NOT — an arm whose surprise is smoothed away is not a control.
 *
 * AND EVERY ARM ASSERTS IT ACTUALLY ARMED: each patch must match EXACTLY ONCE. An arm that
 * matched zero times, or twice, is a finding about the arm and is reported as one — three arms
 * in this estate have failed that way and passed as green.
 *
 * TWO-PART ARMS ARE SUPPORTED AND ARE NOT A CONVENIENCE. Arm (16) has to bound BOTH of
 * `biasManifest`'s row sources, because a method with one unbounded scan left is still on the
 * census and the arm would prove nothing about the roster it claims to move. Both parts are
 * asserted to match exactly once, independently.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const PEN = controlPen("m038");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

const STORE = new URL("../src/store.mjs", import.meta.url).pathname;
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
  return { ...tally, census: census ? +census[1] : -1, out };
};

/* [tag, label, parts (each [find, replace]), declared] */
const ARMS = [
  ["12", "THE IN-MEMORY CUT MADE AT A BOUND THE ANSWER DOES NOT PUBLISH — `documentsNamingEntity` "
 + "keeps `limit: cap` and `truncated: merged.length > cap` and CUTS AT 5000. THE ARM THIS ROW "
 + "EXISTS FOR: before this block nothing anywhere failed on it",
    [["    const documents = merged.slice(0, cap);",
      "    const documents = merged.slice(0, 5000);"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm, naming `documentsNamingEntity:merged (cut at a bound "
  + "the published claim does not name)`. MUST NOT: the CENSUS (no SQL changed, so the count "
  + "CANNOT move and if it does this arm proved something else), REC-99's truncation-source arms, "
  + "the out-of-reach roster, `bounds`, `meaning-bounds`."],

  ["13", "THE SAME ON `biasInhale` — a second method, so the arm measures the PROPERTY and not one "
 + "site",
    [["      bars: bars.slice(0, cap), bars_count: bars.length,",
      "      bars: bars.slice(0, 5000), bars_count: bars.length,"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm naming `biasInhale:bars`. MUST NOT: the census, the "
  + "out-of-reach roster, the siblings."],

  ["14", "THE CUT REMOVED ENTIRELY — `queueFeed` publishes `truncated: items.length > out.length` "
 + "over an `out` that is no longer a cut of anything. The claim survives; the cut does not",
    [["    const out = items.slice(0, cap);", "    const out = items;"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm naming `queueFeed:items (claims a cut this method "
  + "does not make)`. MUST NOT: the census, the SET 2 rosters (`queueFeed` still publishes a bound "
  + "and still scans unbounded), the FLOOR that says the seven claims are the same seven. "
  + "**AND `bounds` IS EXPECTED TO MOVE HERE AND ONLY HERE, which is recorded rather than "
  + "smoothed:** this is the one arm whose edit changes the ANSWER as well as the claim — the feed "
  + "now returns every item — so the envelope suite legitimately catches it too (measured 165/2). "
  + "That is why (12) and (13) are the arms that carry this item: they change ONLY where the cut "
  + "was made, `bounds` stays 167/0, and this block is the sole instrument that fails."],

  ["15", "THE SOURCE BOUND MIGRATING OUT OF REACH — `frontier`'s row source is fetched by a call "
 + "that is no longer PASSED the published cap (`{ limit: 5000 }`). The CUT is untouched and must "
 + "stay graded; what moves is which roster the figure is on",
    [['    const page = this.#frontierLatest("document", { limit: cap + 1, subjectKind: "address" });',
      '    const page = this.#frontierLatest("document", { limit: 5000, subjectKind: "address" });']],
    "MUST FAIL: the OUT-OF-REACH roster pin, naming the arrival `frontier:page`. MUST NOT: the "
  + "IN-MEMORY TRUNCATION arm (the cut is still at the published cap), the census (the `#rows(` "
  + "lives in the callee and did not move), the count arm, which stays at seven."],

  ["16", "SET 2's ROSTER IS A RATCHET IN BOTH DIRECTIONS — BOTH of `biasManifest`'s row sources "
 + "bounded, so the method leaves the census AND leaves both SET 2 rosters. A roster that only "
 + "grows is not a roster; a departure nobody notices is REC-60's shrunken 27",
    /* CORRECTED 2026-09-24 (REC-187), not exempted: `biasManifest` now reads each adopted set's
       statements out of the PINNED revision's bytes (one `#memberTextAtSha` lookup per pin, a keyed
       read) instead of scanning the `bias_statements` projection, so it holds ONE row source, not two.
       The second part named a line that no longer exists and would have reported this arm NOT ARMED;
       bounding the one remaining scan is now the whole of "both". */
    [["          ORDER BY a.bundle_id`, type, id, ...seen.args);",
      "          ORDER BY a.bundle_id LIMIT 500`, type, id, ...seen.args);"]],
    "MUST FAIL: the CENSUS FLOOR (104 -> 103), the SET 2 roster pin and the SET 2 PARTITION pin, "
  + "each naming the departure `biasManifest`. MUST NOT: the IN-MEMORY TRUNCATION arm, the "
  + "out-of-reach roster, the UNREAD-FORMS roster (`biasManifest` still publishes its offset form). "
  + "**THIS ARM CAME BACK WITH MORE THAN WAS DECLARED AND THE SURPLUS IS NAMED RATHER THAN "
  + "SMOOTHED:** 53/5, not the declared three. The two extra are REC-66's CLASS ratchet FLOOR and "
  + "its dispatched-members pin — bounding both scans also takes `biasManifest` off the CLASS "
  + "roster (34 -> 33) and takes `biasmanifest->biasManifest` out of CLASS OPS. The declaration "
  + "was incomplete, not the instrument: three rosters move together because one method left all "
  + "three, which is the same arrival accounting REC-94's integration recorded in the other "
  + "direction."],

  ["17", "OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST HERE — a CORRECT in-memory cut in a "
 + "spelling this grader did not anticipate: the cap passed through an ALIAS (`const take = cap`) "
 + "instead of inline. A grading that refuses correct work is worse than the gap it closed",
    [["    const cap = Math.max(1, Math.min(Number(limit) || 100, 500));",
      "    const cap = Math.max(1, Math.min(Number(limit) || 100, 500));\n    const take = cap;"],
     ["    const documents = merged.slice(0, cap);",
      "    const documents = merged.slice(0, take);"]],
    "MUST NOT FAIL — ANYTHING. The cut is correct and only its spelling changed. This is REC-99's "
  + "own arm (11) discipline applied to the in-memory half."],
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap(([arm, , parts]) => parts.map(([find, put]) => ({ arm, file: STORE, find, put }))));

const base = run("derivation-bounds");
console.log(`BASELINE ROW FIRST — derivation-bounds ${base.pass}/${base.fail}, census ${base.census}`);
const baseBounds = run("bounds"), baseMeaning = run("meaning-bounds");
console.log(`  siblings at baseline: bounds ${baseBounds.pass}/${baseBounds.fail} · `
          + `meaning-bounds ${baseMeaning.pass}/${baseMeaning.fail}`);
if (base.fail !== 0 || base.pass < 1) { console.log("REFUSING TO ARM: the baseline is not clean."); process.exit(1); }

let armed = 0;
for (const [tag, label, parts, declared] of ARMS) {
  const pristine = penPath(STORE, `pristine-m038-arm${tag}`);
  copyFileSync(STORE, pristine);
  let text = readFileSync(STORE, "utf8");
  console.log(`\n=== ARM (${tag}) ${label}`);
  console.log(`    DECLARED: ${declared}`);
  let ok = true;
  for (const [find, replace] of parts) {
    const n = text.split(find).length - 1;
    if (n !== 1) {
      console.log(`    *** THE ARM DID NOT ARM: a patch matched ${n} time(s), not 1. That is a `
                + `finding about the ARM and is reported as one.`);
      ok = false; break;
    }
    text = text.replace(find, replace);
  }
  if (!ok) { unlinkSync(pristine); continue; }
  writeFileSync(STORE, text);
  armed++;

  const db = run("derivation-bounds");
  const bd = run("bounds"), mb = run("meaning-bounds");
  console.log(`    MEASURED: derivation-bounds ${db.pass}/${db.fail} (census ${db.census}) · `
            + `bounds ${bd.pass}/${bd.fail} · meaning-bounds ${mb.pass}/${mb.fail}`);
  for (const line of db.out.split("\n").filter((l) => /^\s+FAIL/.test(l)))
    console.log(`      FAILED: ${line.trim().slice(0, 130)}`);
  for (const line of db.out.split("\n").filter((l) => /^\s+got\s/.test(l)))
    console.log(`      NAMED : ${line.trim().slice(0, 220)}`);

  writeFileSync(STORE, readFileSync(pristine));
  const same = sha(STORE) === sha(pristine);
  let identical = false;
  try { execFileSync("cmp", [STORE, pristine]); identical = true; } catch { identical = false; }
  console.log(`    RESTORED byte-identically: ${same && identical ? "YES" : "NO"} `
            + `(sha256 ${same ? "equal" : "DIFFERENT"}, cmp ${identical ? "identical" : "DIFFERENT"}, `
            + `${size(STORE)} bytes)`);
  if (size(STORE) < 1000000) console.log("    *** THE RESTORE IS BELOW ITS FLOOR — a restore over a truncated file agrees for free.");
  if (!same || !identical) { console.log("    *** STOPPING: an unrestored tree makes every later arm meaningless."); process.exit(1); }
  unlinkSync(pristine);
}
console.log(`\n${armed} of ${ARMS.length} arms armed. Pristine copies left behind: `
          + `${ARMS.map(([tag]) => penPath(STORE, `pristine-m038-arm${tag}`)).filter(existsSync).length} (must be 0).`);
const after = run("derivation-bounds");
console.log(`CLOSING BASELINE — derivation-bounds ${after.pass}/${after.fail}, census ${after.census} `
          + `(must equal the opening row ${base.pass}/${base.fail}, census ${base.census})`);
