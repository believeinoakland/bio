/* D-633's NEGATIVE CONTROL HARNESS. Declared in the suite it drives
 * (`d633-tier2-image-marker.test.mjs`), run from `bio-plane/` in one step:
 *
 *     node test/nc-d633.mjs               # every arm, baseline first
 *     node test/nc-d633.mjs nocarry       # one arm
 *
 * NOT a `.test.mjs`: it EDITS A REAL SOURCE while it runs, so the battery's discovery must not find it. The
 * machinery is `nc-d627.mjs`'s, copied: `mustNotFail` is CHECKED, an arm that does not arm is a finding, and
 * every restore is verified by sha256 AND by content, with a byte count printed and a minimum guarded — never
 * `git checkout --`. Pristine copies live in `controlPen("d633")` (`test/pen.mjs`), outside the worktree.
 *
 * THE ARMS:
 *   nocarry  — THE ROW'S DECLARED CONTROL: `mergeTier2Text` takes tier 2's markers alone on a page tier 2 wins,
 *              as before D-633. The tier-2-wins arms read no marker and the OCR member is asked about nothing, by
 *              name, while the page tier 1 keeps, tier 2's own markers and the award hold.
 *   noregrade — BOB #35's control (2026-09-25 08:05Z): the carry keeps tier 1's grade, so a tier-2 page of 30
 *              glyphs still reads `unread` and is routed; every REGRADE arm but 4 fails by name.
 *   carryall — the carry takes EVERY base marker, not only the image-content ones: tier 1's `no_tounicode` rides
 *              onto a page tier 2 decoded, so TIER 2'S OWN, AWARD UNMOVED and NO DUPLICATE's whole-list arm fail
 *              while the carried marker and the route hold.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("d633");
mkdirSync(SAFE, { recursive: true });

const TEXTCHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 50000;   // textchain.mjs is far larger; a restore over a stub must fail loudly.

const SUITES = { d633: "test/d633-tier2-image-marker.test.mjs" };
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, () => replace));
  return { armed: true, matches: n };
}

const WINS_UNREAD = "TIER-2-WINS: a page carrying image_content_unread that tier 2 wins keeps the marker";
const WINS_UNDET = "TIER-2-WINS: image_content_undetermined is carried the same way";
const WINS_TEXT = "TIER-2-WINS: the page's text and tier are tier 2's";
const OWN_ONLY = "TIER 2'S OWN: tier 1's decode markers do NOT ride along";
const OWN_PLAIN = "TIER 2'S OWN: a page tier 2 wins with no image marker";
const KEEPS = "TIER 1 KEEPS";
const DOC_LIST = "NO DUPLICATE: the document list";
const NO_DOUBLE = "NO DUPLICATE: a marker tier 2 already states";
const AWARD = "AWARD UNMOVED";
const ASKED_T2 = "THE ROUTE: tier 2 was asked and answered";
const ROUTE = "THE ROUTE: with tier 2 winning every page";

const CARRY_SITE = "undetermined: images.length ? [...own, ...images] : own,";
const REGRADE = ".map((u) => regradeImageMark(u, t2Glyphs)).filter(Boolean);";
const RG = ["REGRADE 5:", "REGRADE 21:", "REGRADE 22:", "REGRADE 30: tier 2 decodes 30", "REGRADE COUNTS WHAT THE PAGE SHOWS",
            "REGRADE 30: the dropped marker", "REGRADE 30 THROUGH THE OP"];
const RG4 = "REGRADE 4:";
const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that tells two arms broken from two arms working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },
  nocarry: {
    files: [TEXTCHAIN],
    why: "drop the carry: a page tier 2 wins reads no image marker and routes nowhere, by name",
    /* REGRADE 4 and the shown-glyph page lose their marker too (nothing is carried); REGRADE 22/30 and the op's
       page 8 hold, since a dropped marker and no marker read alike. */
    mustFail: [WINS_UNREAD, WINS_UNDET, OWN_ONLY, DOC_LIST, ROUTE, RG4, "REGRADE 5:", "REGRADE 21:", "REGRADE COUNTS WHAT THE PAGE SHOWS"],
    /* "REGRADE 30 THROUGH THE OP" was held open and failed on the first run: the assertion read a null `sent`
       (no page asked) as a failure. The ASSERTION was corrected, not this declaration (W29). */
    mustNotFail: [WINS_TEXT, OWN_PLAIN, KEEPS, NO_DOUBLE, AWARD, ASKED_T2, "REGRADE 22:", "REGRADE 30 THROUGH THE OP"],
    patch: () => arm(TEXTCHAIN, "undetermined: images.length ? [...own, ...images] : own,", "undetermined: own,"),
  },
  carryall: {
    files: [TEXTCHAIN],
    /* RESPELLED with the re-grade: the first spelling widened the carry FILTER, so tier 1's decode markers also
       went through `regradeImageMark` and came out as image markers, moving two variables. This spelling appends
       them unchanged beside the carry, which moves one. */
    why: "carry every base marker: tier 1's decode markers ride onto a page tier 2 decoded",
    /* NO_DOUBLE is declared to fail since the first run (2026-09-25) showed it: that assertion compares page 0's
       WHOLE marker list, so tier 1's `no_tounicode` riding on is seen there too. The first declaration held it
       open, and was wrong about the assertion, not the code (W29). */
    mustFail: [OWN_ONLY, OWN_PLAIN, AWARD, NO_DOUBLE],
    mustNotFail: [WINS_UNREAD, WINS_UNDET, WINS_TEXT, KEEPS, DOC_LIST, ROUTE, ...RG, RG4],
    patch: () => arm(TEXTCHAIN, CARRY_SITE, "undetermined: [...own, ...images, ...(b.undetermined || []).filter((u) => u && !IMAGE_CONTENT_REASONS.includes(u.reason))],"),
  },
  noregrade: {
    files: [TEXTCHAIN],
    why: "BOB #35's control: the carry keeps tier 1's grade, so a page tier 2 reads 30 glyphs on still says unread",
    /* RG4 fails too: the un-re-graded carry keeps tier 1's glyphs (3) where tier 2's page shows 4. The first
       declaration held it open; the declaration was wrong, not the code (W29). */
    mustFail: [...RG, RG4],
    mustNotFail: [WINS_UNREAD, WINS_UNDET, KEEPS, NO_DOUBLE, AWARD, ROUTE],
    patch: () => arm(TEXTCHAIN, REGRADE, ";"),
  },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) {
  console.error(`no such arm: ${only}. Arms: ${Object.keys(ARMS).join(", ")}`);
  process.exit(2);
}

let notAsDeclared = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY          ${a.why}`);
  console.log(`  MUST FAIL    ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST NOT     ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing — baseline)"}`);
  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE     ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }
  const armed = a.patch();
  console.log(`  ARMED        ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);
  const results = ["d633"].map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT       ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`               ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED     ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT        a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }
  if (!armed.armed) { console.log("  VERDICT      ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  const broke = a.mustNotFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length && broke.length === 0;
  console.log(`  VERDICT      ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
    + `${broke.length}/${a.mustNotFail.length} held-open assertion(s) ALSO broken, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`               DECLARED BUT NOT SEEN: ${m}`);
    for (const m of broke) console.log(`               HELD OPEN BUT BROKEN: ${m}`);
    notAsDeclared++;
  }
}
console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
process.exit(notAsDeclared ? 1 : 0);
