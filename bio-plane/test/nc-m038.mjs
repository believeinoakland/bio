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
 *
 * RE-DERIVED 2026-09-29 (legacy-tests T12, B5; after QUEUE #2, K409): EVERY ANCHOR WAS DEAD. This driver patched
 * `src/store.mjs` alone, and each subject had left it — `documentsNamingEntity` for entities (`namingDocuments`, T5),
 * `biasInhale` and `biasManifest` for bias (T5), `frontier` for retrieval's Frontier reader (T5), `queueFeed` for the
 * queue (T12). Each part now NAMES THE FILE under `src/` it patches (`[[file, find], replace]`, mint-ledger's driver's
 * convention), and the driver snapshots, restores and verifies EVERY file an arm touches. Arms (12), (13), (14), (16)
 * and (17) are the same edit at the method's new home; arm (15)'s subject no longer exists in the shape it armed
 * (the frontier's `looked` page is fetched through its own `#page` helper since D-389/T5, OUT OF REACH already, and no
 * frontier claim is SOURCE GRADED any more), so the arm is re-derived onto a claim that IS source graded today —
 * calibration's `worseSupersessions:page` — with the SAME edit: its row source called with a figure the published cap
 * does not control. The declarations are re-read against the suite as it now is (names, figures) and state it.
 *
 * RESULTS, RUN 2026-09-29 by legacy-tests T12 in a scratch `git worktree` at d3f5329855 carrying the job's tests (never
 * in the working tree): BASELINE derivation-bounds 75/0, census 206 · bounds 229/0 · meaning-bounds 90/6 (red at
 * baseline, not this driver's). (12) 74/1 · (13) 74/1 · (14) 74/1, bounds 227/2 · (16) 68/7, census 205 · (17) 75/0 —
 * AS DECLARED (14's declaration corrected to one failure, see it). (15) first NOT AS DECLARED (75/0 on calibration, the
 * instrument finding at the arm), re-derived and re-run alone: 73/2, AS DECLARED. Every restore sha256 + cmp YES, 0
 * pristine copies left, CLOSING baseline 75/0 census 206 = OPENING; the worktree's src/ sha256 manifest identical
 * before and after.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { controlPen } from "./pen.mjs";

const PEN = controlPen("m038");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

const SRC = (f) => new URL(`../src/${f}`, import.meta.url).pathname;
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
  ["12", "THE IN-MEMORY CUT MADE AT A BOUND THE ANSWER DOES NOT PUBLISH — entities' `namingDocuments` "
 + "(was `documentsNamingEntity`) keeps `limit: cap` and `truncated: merged.length > cap` and CUTS AT 5000. THE ARM "
 + "THIS ROW EXISTS FOR: before this block nothing anywhere failed on it",
    [[["entities/index.mjs", "    const documents = merged.slice(0, cap);"],
      "    const documents = merged.slice(0, 5000);"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm, naming `entities/index:namingDocuments:merged (cut at a bound "
  + "the published claim does not name)`. MUST NOT: the CENSUS (no SQL changed, so the count "
  + "CANNOT move and if it does this arm proved something else), REC-99's truncation-source arms, "
  + "the out-of-reach roster, `bounds`, `meaning-bounds`."],

  ["13", "THE SAME ON bias' `biasInhale` — a second method, so the arm measures the PROPERTY and not one "
 + "site",
    [[["bias/index.mjs", "      bars: bars.slice(0, cap), bars_count: bars.length,"],
      "      bars: bars.slice(0, 5000), bars_count: bars.length,"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm naming `bias/index:biasInhale:bars`. MUST NOT: the census, the "
  + "out-of-reach roster, the siblings."],

  ["14", "THE CUT REMOVED ENTIRELY — the queue's `queueFeed` publishes `truncated: items.length > out.length` "
 + "over an `out` that is no longer a cut of anything. The claim survives; the cut does not",
    [[["queue/index.mjs", "    const out = items.slice(0, cap);"], "    const out = items;"]],
    "MUST FAIL: the IN-MEMORY TRUNCATION arm naming `queue/index:queueFeed:items (claims a cut this method "
  + "does not make)`, and with it the FLOOR that says the in-memory claims are REC-99's ungradeable ones "
  + "(the claim now reads as a violation, not a cut) — CORRECTED after the T12 run: that FLOOR stayed green, since it "
  + "counts violations beside graded cuts, so the measured failure is the one arm. MUST NOT: the census, the SET 2 rosters "
  + "(`queueFeed` still publishes a bound and still scans unbounded). "
  + "**AND `bounds` MAY MOVE HERE AND ONLY HERE, which is recorded rather than "
  + "smoothed:** this is the one arm whose edit changes the ANSWER as well as the claim — the feed "
  + "now returns every item — so the envelope suite legitimately catches it too (measured 165/2 at M0-38). "
  + "That is why (12) and (13) are the arms that carry this item: they change ONLY where the cut "
  + "was made, and this block is the sole instrument that fails."],

  ["15", "THE SOURCE BOUND MIGRATING OUT OF REACH — reevaluation's `notices` (SOURCE GRADED: `rows` is declared as the "
 + "cap-carrying call `#noticeRows(…, [cap + 1])`) has its row source called with a figure that is no longer the published "
 + "cap (`[5000]`). The CUT is untouched and must stay graded; what moves is which roster the figure is on. RE-DERIVED at "
 + "T12: the arm's first subject, `frontier`'s document page, has been OUT OF REACH since D-389/T5",
    [[["reevaluation/index.mjs", "`ORDER BY notice_id LIMIT ?`, [cap + 1]);"], "`ORDER BY notice_id LIMIT ?`, [5000]);"]],
    "MUST FAIL: the OUT-OF-REACH roster pin, naming the arrival `reevaluation/index:notices:rows`; and the CENSUS (K365) "
  + "pin, which holds this very call text (`[cap + 1]`) as the reason `#noticeRows` is a misread and not an unbounded "
  + "read — the same edit seen by a second arm, declared rather than smoothed. MUST NOT: the IN-MEMORY TRUNCATION arm "
  + "(the cut is still at the published cap), the census count (the SQL is still `LIMIT ?`), the count arm. "
  + "**NOT AS DECLARED ON ITS FIRST T12 RUN, AND THE FINDING IS ABOUT THE INSTRUMENT:** the arm was first re-derived onto "
  + "calibration's `worseSupersessions` (both branches' `cap + 1` -> `5000`) and came back 75/0, GREEN. `capIdentifiers` "
  + "reads `const cols = (t) => [\"calibration_id\", …, \"cap\", …]` as an ALIAS of the cap, because `mentions` "
  + "matches the word `cap` inside a STRING LITERAL, and the row source's SQL interpolates `${cols(\"s\")}` — so the "
  + "source still 'mentions the cap' with the cap gone. That method's SOURCE GRADED verdict is therefore held by a "
  + "column name, not by its bound (REPORTED; the reader is not changed here). The arm moved to a claim whose source "
  + "grading does not rest on that blind spot."],

  ["16", "SET 2's ROSTER IS A RATCHET IN BOTH DIRECTIONS — bias' `biasManifest`'s row source "
 + "bounded, so the method leaves the census AND leaves both SET 2 rosters. A roster that only "
 + "grows is not a roster; a departure nobody notices is REC-60's shrunken 27",
    /* CORRECTED 2026-09-24 (REC-187), not exempted: `biasManifest` now reads each adopted set's
       statements out of the PINNED revision's bytes (one `#memberTextAtSha` lookup per pin, a keyed
       read) instead of scanning the `bias_statements` projection, so it holds ONE row source, not two.
       The second part named a line that no longer exists and would have reported this arm NOT ARMED;
       bounding the one remaining scan is now the whole of "both". */
    [[["bias/index.mjs", "          ORDER BY a.bundle_id`, type, id, ...seen.args);"],
      "          ORDER BY a.bundle_id LIMIT 500`, type, id, ...seen.args);"]],
    "MUST FAIL: the CENSUS FLOOR (206 -> 205), the SET 2 roster pin and the SET 2 PARTITION pin, "
  + "each naming the departure `bias/index:biasManifest`; and, recorded at M0-38 as the surplus of this arm, "
  + "REC-66's CLASS ratchet FLOOR, its dispatched-members pin and the CLASS roster by name (the method leaves the "
  + "class too, `biasmanifest->bias/index:biasManifest` out of CLASS OPS) and the pin tying the rosters to the count. "
  + "MUST NOT: the IN-MEMORY TRUNCATION arm, the out-of-reach roster, the UNREAD-FORMS roster (`biasManifest` "
  + "still publishes its offset form)."],

  ["17", "OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST HERE — a CORRECT in-memory cut in a "
 + "spelling this grader did not anticipate: the cap passed through an ALIAS (`const take = cap`) "
 + "instead of inline. A grading that refuses correct work is worse than the gap it closed",
    [[["entities/index.mjs", "    const cap = Math.max(1, Math.min(Number(limit) || NAMING_LIMIT_DEFAULT, NAMING_LIMIT_MAX));"],
      "    const cap = Math.max(1, Math.min(Number(limit) || NAMING_LIMIT_DEFAULT, NAMING_LIMIT_MAX));\n    const take = cap;"],
     [["entities/index.mjs", "    const documents = merged.slice(0, cap);"],
      "    const documents = merged.slice(0, take);"]],
    "MUST NOT FAIL — ANYTHING. The cut is correct and only its spelling changed. This is REC-99's "
  + "own arm (11) discipline applied to the in-memory half."],
];

/* T12 (legacy-tests): `node test/nc-m038.mjs [arm]` arms only the named arm, the baseline rows still taken. */
const ONLY = process.argv[2] || null;
const base = run("derivation-bounds");
console.log(`BASELINE ROW FIRST — derivation-bounds ${base.pass}/${base.fail}, census ${base.census}`);
const baseBounds = run("bounds"), baseMeaning = run("meaning-bounds");
console.log(`  siblings at baseline: bounds ${baseBounds.pass}/${baseBounds.fail} · `
          + `meaning-bounds ${baseMeaning.pass}/${baseMeaning.fail}`);
if (base.fail !== 0 || base.pass < 1) { console.log("REFUSING TO ARM: the baseline is not clean."); process.exit(1); }

let armed = 0;
for (const [tag, label, parts, declared] of ARMS) {
  if (ONLY && tag !== ONLY) continue;
  console.log(`\n=== ARM (${tag}) ${label}`);
  console.log(`    DECLARED: ${declared}`);
  /* Every file this arm touches, snapshotted to its own uniquely-named pristine copy BEFORE any is written. */
  const files = [...new Set(parts.map(([[f]]) => f))];
  const texts = new Map(files.map((f) => [f, readFileSync(SRC(f), "utf8")]));
  let ok = true;
  for (const [[f, find], replace] of parts) {
    const text = texts.get(f);
    const n = text.split(find).length - 1;
    if (n !== 1) {
      console.log(`    *** THE ARM DID NOT ARM: a patch in ${f} matched ${n} time(s), not 1. That is a `
                + `finding about the ARM and is reported as one.`);
      ok = false; break;
    }
    texts.set(f, text.replace(find, () => replace));
  }
  if (!ok) continue;
  const pristine = (f) => penPath(SRC(f), `pristine-m038-arm${tag}`);
  for (const f of files) copyFileSync(SRC(f), pristine(f));
  for (const f of files) writeFileSync(SRC(f), texts.get(f));
  armed++;

  const db = run("derivation-bounds");
  const bd = run("bounds"), mb = run("meaning-bounds");
  console.log(`    MEASURED: derivation-bounds ${db.pass}/${db.fail} (census ${db.census}) · `
            + `bounds ${bd.pass}/${bd.fail} · meaning-bounds ${mb.pass}/${mb.fail}`);
  for (const line of db.out.split("\n").filter((l) => /^\s+FAIL/.test(l)))
    console.log(`      FAILED: ${line.trim().slice(0, 130)}`);
  for (const line of db.out.split("\n").filter((l) => /^\s+got\s/.test(l)))
    console.log(`      NAMED : ${line.trim().slice(0, 220)}`);

  let restoredAll = true;
  for (const f of files) {
    writeFileSync(SRC(f), readFileSync(pristine(f)));
    const same = sha(SRC(f)) === sha(pristine(f));
    let identical = false;
    try { execFileSync("cmp", [SRC(f), pristine(f)]); identical = true; } catch { identical = false; }
    console.log(`    RESTORED src/${f} byte-identically: ${same && identical ? "YES" : "NO"} `
              + `(sha256 ${same ? "equal" : "DIFFERENT"}, cmp ${identical ? "identical" : "DIFFERENT"}, `
              + `${size(SRC(f))} bytes)`);
    if (size(SRC(f)) < 10000) console.log("    *** THE RESTORE IS BELOW ITS FLOOR — a restore over a truncated file agrees for free.");
    if (!same || !identical) restoredAll = false;
    else unlinkSync(pristine(f));
  }
  if (!restoredAll) { console.log("    *** STOPPING: an unrestored tree makes every later arm meaningless."); process.exit(1); }
}
console.log(`\n${armed} of ${ARMS.length} arms armed. Pristine copies left behind: `
          + `${ARMS.flatMap(([tag, , parts]) => parts.map(([[f]]) => penPath(SRC(f), `pristine-m038-arm${tag}`))).filter(existsSync).length} (must be 0).`);
const after = run("derivation-bounds");
console.log(`CLOSING BASELINE — derivation-bounds ${after.pass}/${after.fail}, census ${after.census} `
          + `(must equal the opening row ${base.pass}/${base.fail}, census ${base.census})`);
