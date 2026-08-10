/* NEGATIVE CONTROL: (run 2026-08-10, D-282) FOUR ARMS, declared in and RUN in one step by `node test/tally-through-pipe.control.mjs [arm]` from bio-plane/ — 4 of 4 AS DECLARED, 0 restore failures, exit 0. Each armed ALONE with the others held open, each DECLARING BEFORE IT RAN what must fail and what must NOT, every edited file restored against a uniquely-named pristine pre-arm copy verified by sha256 AND by content with a 1,000-byte floor (stdio.mjs d5b47499… 6,360 B, tally-through-pipe.test.mjs e93573cb… 12,095 B). The driver captures every child to a FILE and never to a pipe, because a control that reads its subject through the channel the subject is about cannot tell a failing subject from a failing harness — that is the correction D-249's arm earned. (0) `baseline` — nothing armed: this suite 13 pass 0 fail, hygiene 611 pass 0 fail. (1) `unflush` — THE ARM THIS ITEM EXISTS FOR: neuter `test/stdio.mjs` so it stops making the streams synchronous, i.e. the exact pre-D-282 tree -> 8 pass, 5 FAIL. The fixture wrote 1,000,156 bytes to a FILE and 65,587 through a PIPE. Arm A (the tally is readable through a pipe) FAILS, arm B (byte equality) FAILS, and THREE of arm C's four fail — MIDDLE, TAIL, byte-identity — while `C. the HEAD of the diagnosis arrives` STILL PASSES, which is the defect's own signature rather than a gap in the arm: the early lines survive and the TAIL is discarded, which is why D-282 reads as FAILED lines with no count. Arm D stays GREEN (it measures the defect, not the fix) and HYGIENE STAYS GREEN AT 611/0 — a finding rather than a comfort, because the census there is a SPELLING check that cannot see a neutered module, so the behavioural half is the load-bearing one. (2) `overstrict` — THE ARM THAT DECIDED BETWEEN THE TWO FIXES D-282's ROW OFFERED: apply the alternative, a CAP on the `got` dump, to a genuinely large but perfectly READABLE 1,000,156-byte diagnosis -> 8 pass, 4 FAIL, and the SHAPE of the four is the argument. THE CAP MAKES EVERY ARM THAT MEASURES LOSS GO GREEN — arm A, arm B and byte-identity all PASS at 312 bytes to a file and 312 through a pipe, because a capped dump fits in the pipe buffer and the two captures then agree perfectly — while the MIDDLE and the TAIL of the diagnosis are destroyed and both VACUITY guards fire to say the suite's own subject has been capped out of existence. The cap is the fix that would have looked green while the diagnosis was gone, and a fix that makes every large failure unreadable is the opposite defect and worse than the bug. (3) `d93` — D-93's ORIGINAL SHAPE re-run against this tree, and it is INDEPENDENT of this item rather than the same thing measured twice: two probe suites are planted, one that dies mid-run printing NO tally and one after it, and the real runner is driven over both -> battery exit 1, the crashing suite reported `assertions unknown` and NAMED under `reported no assertion count` (never zero, never green), and the suite planted AFTER it still ran and reported its own 2 pass. Green before and after. **TWO OF THE FOUR DECLARATIONS CAME BACK NOT AS DECLARED ON THE FIRST RUN AND BOTH TIMES THE ARM WAS RIGHT AND THE DECLARATION WAS WRONG** — `unflush` was declared to fail all four C assertions when the HEAD must survive, and `overstrict` was declared to fail arm B when capping changes what the child SAYS and not what the pipe delivers. Corrected and recorded rather than quietly rewritten; it is the inverse of the way D-282 itself was found, where the harness was wrong and the arm was right. THE PLATFORM CAVEAT IS PART OF THE DECLARATION: node writes to a pipe synchronously on Linux and Windows and ASYNCHRONOUSLY on macOS, so on a synchronous platform arm A cannot fail — arm D runs the unfixed fixture and reports NOT-EXHIBITED BY NAME rather than letting the suite pass quietly, because an arm that could not have failed is not evidence. */
/* D-282: A SUITE'S OWN EXIT MUST NOT DISCARD THE SUITE'S OWN TALLY.
 *
 * `scripts/battery.mjs` spawns every suite with default stdio, which is a PIPE,
 * and reads each suite's assertion count off the last line the suite prints. On
 * darwin, node's writes to a pipe are asynchronous, so `process.exit()` — which
 * `hygiene.test.mjs` REQUIRES every suite to end on — returns to the OS with the
 * tail still queued. The tail is where the tally lives, and D-93 exists precisely
 * because a suite that reports no tally reads as a suite that was never run.
 *
 * `test/stdio.mjs` is the fix and carries the argument for choosing it over
 * capping `t()`'s dump. THIS suite is the thing that keeps the fix honest: it
 * builds a child that deliberately floods, runs it through a REAL pipe exactly
 * the way the battery does, and asserts the count arrives. The fix reaches into
 * node's private `_handle.setBlocking`, so the day a node release closes that
 * door the battery goes RED here instead of going quiet.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, openSync, closeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const GROUND = mkdtempSync(join(tmpdir(), "tally-pipe-"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- the runner's own reader, and it is COPIED ON PURPOSE ------------------
   `scripts/battery.mjs` executes on import, so it cannot be imported for its
   `tally()`. The regex below is therefore a copy — and a copy that drifts is
   this repository's most-repeated finding, so arm E asserts character for
   character that it is still the literal `battery.mjs` uses. A suite asserting
   that a tally is readable by a reader nobody runs would prove nothing. */
const TALLY_RE = /(\d+)\s+pass(?:ed)?,\s+(\d+)\s+fail(?:ed)?(?:,\s+(\d+)\s+skip(?:ped)?\s*\(([^)]*)\))?/g;
const tally = (out) => {
  const m = [...out.matchAll(new RegExp(TALLY_RE.source, "g"))].pop();
  return m ? { pass: +m[1], fail: +m[2] } : null;
};

/* ---- the flooding fixture --------------------------------------------------
   A child in the shape every suite here has: it prints, it prints a `want …
   got …` dump big enough to matter, it prints its tally last, and it exits with
   `process.exit(fail ? 1 : 0)`. `FIXED` decides whether it takes the fix; the
   `unflush` control arm flips it, which is the only difference between the
   pre-D-282 tree and this one. MARK_HEAD/MID/TAIL exist for the over-strictness
   arm: a cap that truncated the dump would eat MID and leave HEAD. */
const MARK_HEAD = "MARKER-HEAD-4f1a";
const MARK_MID = "MARKER-MIDDLE-9c72";
const MARK_TAIL = "MARKER-TAIL-b30e";

const STDIO_URL = pathToFileURL(join(DIR, "stdio.mjs")).href;

const fixtureSource = ({ fixed, bytes }) => `${fixed ? `import "${STDIO_URL}";` : "/* D-282's pre-fix state: no flush before exit */"}
const filler = "z".repeat(${Math.max(1, Math.floor(bytes / 2))});
console.log("  FAIL  a check whose diagnosis is genuinely large");
console.log("         want []");
console.log("         got  ${MARK_HEAD}" + filler + "${MARK_MID}" + filler + "${MARK_TAIL}");
console.log("\\nflood: 3 pass, 1 fail");
process.exit(1);
`;

const writeFixture = (name, opts) => {
  const p = join(GROUND, name);
  writeFileSync(p, fixtureSource(opts));
  return p;
};

/* Default stdio IS a pipe — this is `battery.mjs:411` in miniature and
   deliberately not a paraphrase of it. */
const viaPipe = (script) => new Promise((res) => {
  const c = spawn(process.execPath, [script]);
  let out = "";
  c.stdout.on("data", (d) => { out += d; });
  c.stderr.on("data", (d) => { out += d; });
  c.on("close", (code) => res({ out, bytes: Buffer.byteLength(out), code }));
});

/* The same child with a FILE for stdout. A file write is synchronous on POSIX,
   so this capture is the ground truth for what the child MEANT to say. */
const viaFile = (script, tag) => new Promise((res) => {
  const p = join(GROUND, `${tag}.out`);
  const fd = openSync(p, "w");
  const c = spawn(process.execPath, [script], { stdio: ["ignore", fd, fd] });
  c.on("close", (code) => {
    closeSync(fd);
    const out = readFileSync(p, "utf8");
    res({ out, bytes: Buffer.byteLength(out), code });
  });
});

const BYTES = 1000000;   /* ~1 MB of dump, fifteen times the 65,536-byte pipe buffer */

console.log("\n--- A. a deliberately flooding suite reports its TALLY through a pipe ---");

const fixed = writeFixture("flood-fixed.mjs", { fixed: true, bytes: BYTES });
const fixedPipe = await viaPipe(fixed);
const fixedFile = await viaFile(fixed, "fixed");

console.log(`  the fixture wrote ${fixedFile.bytes} bytes to a FILE and ${fixedPipe.bytes} through a PIPE`);
t("the fixture floods past the pipe buffer, so this suite is not vacuous", fixedFile.bytes > 200000, true);
t("A. the flooding suite's tally is readable through a PIPE", tally(fixedPipe.out), { pass: 3, fail: 1 });
t("A. and its exit status still arrives", fixedPipe.code, 1);

console.log("\n--- B. nothing is lost: the pipe capture equals the file capture ---");
t("B. the same child delivers the same byte count through a pipe and through a file",
  fixedPipe.bytes === fixedFile.bytes, true);
if (fixedPipe.bytes !== fixedFile.bytes) {
  console.log(`         file ${fixedFile.bytes} - pipe ${fixedPipe.bytes} = ${fixedFile.bytes - fixedPipe.bytes} bytes of TAIL discarded`);
}

console.log("\n--- C. a large diagnosis arrives INTACT, head, middle and tail ---");
/* THE OVER-STRICTNESS ARM. D-282's row offered capping `t()`'s `got` dump as the
   alternative fix. A cap truncates by construction, and a fix that makes every
   large failure unreadable is the opposite defect and worse than the bug — so
   this arm pins that the whole diagnosis survives. If anyone later adds a cap,
   MIDDLE is the marker that disappears and this is where it is noticed. */
t("C. the head of the diagnosis arrives", fixedPipe.out.includes(MARK_HEAD), true);
t("C. the MIDDLE of the diagnosis arrives — a cap would eat this one", fixedPipe.out.includes(MARK_MID), true);
t("C. the tail of the diagnosis arrives", fixedPipe.out.includes(MARK_TAIL), true);
t("C. and the pipe capture is byte-identical to the file capture", fixedPipe.out === fixedFile.out, true);

console.log("\n--- D. the reach arm: this platform can actually exhibit the defect ---");
/* An arm that could not have failed proves nothing. Node writes to a pipe
   synchronously on Linux and Windows and ASYNCHRONOUSLY on macOS, so on a
   synchronous platform arm A passes without the fix doing anything. This arm
   runs the SAME fixture WITHOUT the fix and says which world it is in — NAMED
   either way, never assumed. It is deliberately NOT an assertion that the tally
   is lost: that would make a correct platform fail. */
const unfixed = writeFixture("flood-unfixed.mjs", { fixed: false, bytes: BYTES });
const unfixedPipe = await viaPipe(unfixed);
const unfixedFile = await viaFile(unfixed, "unfixed");
const exhibits = unfixedPipe.bytes < unfixedFile.bytes;
console.log(`  without the fix: ${unfixedFile.bytes} bytes to a FILE, ${unfixedPipe.bytes} through a PIPE` +
  `${exhibits ? ` — ${unfixedFile.bytes - unfixedPipe.bytes} bytes of TAIL discarded, tally ${tally(unfixedPipe.out) ? "present" : "MISSING"}` : ""}`);
if (exhibits) {
  t("D. the defect is EXHIBITED on this platform, so arm A had something to prove", exhibits, true);
} else {
  console.log(`  D. NOT EXHIBITED on ${process.platform}: this platform writes to a pipe synchronously,`);
  console.log("     so arm A above cannot fail here and certifies the fix on darwin only.");
  console.log("     Stated rather than counted — an arm that could not have failed is not evidence.");
}
t("D. the unfixed child's FILE capture is whole either way, which is what makes the pipe figure a LOSS",
  unfixedFile.bytes > 200000, true);

console.log("\n--- E. the reader this suite asserts against is the reader the battery runs ---");
const batterySrc = readFileSync(join(DIR, "..", "scripts", "battery.mjs"), "utf8");
t("E. battery.mjs still reads a tally with the exact regex this suite copied",
  batterySrc.includes(TALLY_RE.source), true);
/* And that the subject is still LIVE: if `battery.mjs` ever stops handing its
   children a pipe, this suite is still correct but no longer about the runner,
   and that change must be noticed rather than inferred. */
const spawnAt = batterySrc.indexOf("spawn(process.execPath, [rel]");
const spawnOpts = spawnAt < 0 ? "" : batterySrc.slice(spawnAt, batterySrc.indexOf("\n  });", spawnAt));
t("E. battery.mjs still spawns its suites with DEFAULT stdio, which is the pipe this suite's subject needs",
  spawnAt >= 0 && !spawnOpts.includes("stdio:"), true);

console.log("\n--- F. every suite in this estate takes the fix ---");
/* The census itself lives in `hygiene.test.mjs`, beside the dispose and the exit
   rules it belongs with. What is asserted HERE is that the census exists, so the
   two halves cannot be separated: a fix that every suite must adopt and nothing
   enforces is a rule that goes stale the moment a 153rd suite is written. */
const hygieneSrc = readFileSync(join(DIR, "hygiene.test.mjs"), "utf8");
t("F. hygiene.test.mjs carries the check that a suite without the import fails the battery",
  hygieneSrc.includes("./stdio.mjs") && /flushes before it exits|takes the D-282 fix/.test(hygieneSrc), true);

console.log(`\ntally-through-pipe: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
