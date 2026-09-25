/* memoryshare — D-312's instrument: NO LIVE SITE READS MEMORY AS A SHARE OF 128 MB.
 *
 * THE RULE (INTERFACES.md §"The memory bound, and how it is expressed"): a memory bound is stated
 * as a WORKLOAD SIZE and never as a share of 128 MB. The platform's `memoryUsageBytes` reads
 * 132–240 MB on invocations the platform itself marks `success`, and the kill lands at 278.7 MB
 * reported (CPDF-15), so "120.4 MB of 128" is a percentage of nothing — a wrong answer carrying
 * full confidence. A shipped bound (agent-worker's segment bound) was sized on that reading.
 *
 * WHAT THIS SUITE WALKS. Every TRACKED `.mjs`/`.js` file under `bio-plane/src`, `bio-plane/test`,
 * `bio-plane/scripts`, `agent-worker/src`, `pdf-worker/src`, `ocr-worker/src`, and the three members'
 * shipped bundles (`<member>/dist/*.bundled.mjs`), plus `docs/development/INTERFACES.md` — the
 * live contract. Each file is read TWICE: whole, and with comments and regex literals blanked
 * (`walkfloor.mjs` `stripComments`, strings KEPT), so the report says how many sites are CODE
 * (a string that ships, an expression that divides) and how many are comments that tell a reader
 * the wrong thing. Both counts must be ZERO.
 *
 * THE CLASS, by what makes it recognisable IN PRINCIPLE — a quantity set against 128 MB as its
 * denominator — and not by the four sites the row listed:
 *   (P1) "of 128 MB" / "of a 128 MB …" / "of 128" after a figure ("120.4 MB of 128")
 *   (P2) "against a|the 128 MB …" (a workload set against the isolate as its budget)
 *   (P3) a division by 128 MiB in any spelling: `/ (128 * 1024 * 1024)`, `/ 128e6`, `/ 134217728`,
 *        or a percentage `/ 128 * 100`
 * WHAT IT CANNOT SEE, stated because that sentence is what lets the next reader tell a clean
 * result from a walk in the wrong place: a share spelled in words that name no figure ("nearly the
 * whole isolate"); a denominator held in a variable (`x / ISOLATE_BYTES`); any file outside the
 * roots above. And it deliberately does NOT walk the DATED RECORDS — `MEASUREMENTS.md` and
 * `measurements/` — because an entry is a statement about its own day and is corrected by a
 * newer entry, never rewritten (CPDF-15's entry already corrects FL-1's).
 *
 * DELIBERATE CLOSURES, which the class matcher must NOT grade (the precision arm, section 3):
 *   · "never as a share of 128 MB" / "NOT a share of any ceiling" — the rule, stated.
 *   · "Cloudflare's documented 128 MiB isolate limit (their claim)" — a vendor claim, labelled.
 *   · `128 * 1024` as a TEXT cap (128 KiB) or a `maxBuffer` — a byte count, not a memory share.
 *   · `524,288 / 128` — a unit resolution, not memory.
 *
 * NEGATIVE CONTROL: (RUN 2026-09-25 by WORKER D-312, RE-RUN after the ledger exclusion became a regex; baseline 21 pass / 0 fail) each arm ALONE against a
 * pristine copy of agent-worker/src/index.mjs (77,960 B), restored and verified by sha256 (e9ff3f31…) AND cmp.
 *   (N1) plant "120.4 MB of 128 MB" into the shipped BOUND_SOURCE string -> exit 1, **19 pass, 2 FAIL**: both
 *        section-1 arms fail NAMING `agent-worker/src/index.mjs:177` (a CODE site, comments stripped);
 *        sections 2 and 3 held, 3/3 reached. AS DECLARED.
 *   (N2) OVER-STRICTNESS — plant a closure spelled as nobody wrote one, "never a share of  128 MB" (two
 *        spaces) -> exit 0, 21 pass / 0 fail. AS DECLARED: the rule stated is not graded.
 * The cross-line spelling (INTERFACES.md's "120.4 MB against\na 128 MB ceiling") was MISSED by the first,
 * per-line draft of this matcher and found only by comparing its hits to the row's named sites — recorded
 * because a per-line grep reads that site clean.
 */

import "./stdio.mjs";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "../scripts/walkfloor.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SELF = "bio-plane/test/memoryshare.test.mjs";
let pass = 0, fail = 0, reached = 0;
const SECTIONS = 3;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `  — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`);
};

/* THE CLASS. Exported shape kept local: one list, each with a name the failure prints. */
export const CLASS = [
  { id: "P1", re: /(?<!\bshare\s+)\bof\s+(?:a\s+|the\s+)?128\s?Mi?B\b/gi },
  { id: "P1", re: /\bMi?B\s+of\s+128\b/gi },
  { id: "P2", re: /\bagainst\s+(?:a\s+|the\s+)?128\s?Mi?B\b/gi },
  { id: "P3", re: /\/\s*\(?\s*128\s*\*\s*1024\s*\*\s*1024|\/\s*128e6\b|\/\s*134217728\b|\/\s*128\s*\)?\s*\*\s*100\b/g },
];
/* Matched over the WHOLE text, not line by line: a site wrapped across a line break ("120.4 MB
   against\na 128 MB ceiling", INTERFACES.md) is invisible to a per-line grep, and was. The site is
   reported at the line its match STARTS on, once per line. */
export function sitesIn(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  const lineOf = (off) => { let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= off) lo = m; else hi = m - 1; } return lo + 1; };
  const seen = new Map();
  for (const c of CLASS) {
    c.re.lastIndex = 0;
    for (const m of text.matchAll(c.re)) {
      const line = lineOf(m.index);
      if (!seen.has(line)) seen.set(line, { line, id: c.id,
        text: text.slice(starts[line - 1], text.indexOf("\n", m.index) < 0 ? undefined : text.indexOf("\n", m.index)).trim().slice(0, 140) });
    }
  }
  return [...seen.values()].sort((a, b) => a.line - b.line);
}

const ls = execFileSync("git", ["ls-files", "-z", "--",
  "bio-plane/src", "bio-plane/test", "bio-plane/scripts", "tools",
  "agent-worker/src", "pdf-worker/src", "ocr-worker/src",
  "agent-worker/test", "pdf-worker/test", "ocr-worker/test",
  "agent-worker/dist", "pdf-worker/dist", "ocr-worker/dist",
  "docs/architecture", "docs/development"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  .split("\0").filter(Boolean)
  .filter((p) => /\.(mjs|js|md)$/.test(p))
  /* THE DATED RECORDS ARE NOT WALKED, on purpose (header): an entry is corrected by a newer one. Written as a
     REGEX, not a path string: `gates.mjs` keeps strings (a path IS a string, D-301), so a string naming the ledger
     here read as a READ of it and put this suite in every ledger-only change's plan — a change that cannot move
     this verdict, because the ledger is exactly what is excluded (statepaths' 42-unit arm caught it). */
  .filter((p) => !/^docs\/development\/(?:MEASUREMENTS\.md$|measurements\/)/.test(p))
  .filter((p) => !/\/dist\//.test(p) || /\.bundled\.mjs$/.test(p))
  .filter((p) => p !== SELF);   // this file quotes the class to define it; it would find itself

/* ============================================================ 1 · THE LIVE SITES ARE CLEAN */
console.log("--- 1 · no live site reads memory as a share of 128 MB ---");
{
  let bytes = 0;
  const code = [], all = [];
  for (const p of ls) {
    let src; try { src = readFileSync(join(ROOT, p), "utf8"); } catch { continue; }
    bytes += src.length;
    for (const s of sitesIn(src)) all.push({ file: p, ...s });
    if (/\.(mjs|js)$/.test(p)) for (const s of sitesIn(stripComments(src))) code.push({ file: p, ...s });
  }
  console.log(`  corpus: ${ls.length} files, ${bytes} chars (floor: 500 files)`);
  t("the walk reached a real corpus", ls.length >= 500 && bytes > 5_000_000, true);
  t("the dated records are NOT inside the walk (header)",
    ls.filter((p) => /^docs\/development\/(?:MEASUREMENTS\.md$|measurements\/)/.test(p)), []);
  t("...while the live contract is", ls.includes("docs/development/INTERFACES.md"), true);
  t("the row's four named sites are inside the walk",
    ["agent-worker/src/index.mjs", "bio-plane/test/fl1-cpu-probe.mjs", "docs/development/INTERFACES.md",
     "pdf-worker/src/pagepixels.mjs"].every((p) => ls.includes(p)), true);
  for (const s of code) console.log(`    CODE     ${s.file}:${s.line} [${s.id}] ${s.text}`);
  for (const s of all.filter((a) => !code.some((c) => c.file === a.file && c.line === a.line)))
    console.log(`    COMMENT  ${s.file}:${s.line} [${s.id}] ${s.text}`);
  t("CODE sites (comments stripped) reading memory as a share of 128 MB", code.map((s) => `${s.file}:${s.line}`), []);
  t("ALL sites, comments included", all.map((s) => `${s.file}:${s.line}`), []);
  reached++;
}

/* ============================================================ 2 · THE MATCHER CAN FIRE (sensitivity) */
console.log("\n--- 2 · every spelling of the class is caught ---");
{
  const FIRES = [
    `const BOUND_SOURCE = "FL-1 memory curve (120.4 MB P99 of 128 MB at 200 turns)";`,
    ` * in a 128 MB isolate (FL-1: 120.4 MB of 128 while CPU sat at 2.5%`,
    `memoryUsageBytesP99 = 120.4 MB against a 128 MB isolate`,
    `const pct = mem / (128 * 1024 * 1024);`,
    `const pct = (mem / 128) * 100;`,
    `share = bytes / 134217728`,
    `reached 94% of the 128 MiB ceiling`,
  ];
  for (const f of FIRES) t(`fires on: ${f.slice(0, 70)}`, sitesIn(f).length, 1);
  reached++;
}

/* ============================================================ 3 · THE MATCHER DOES NOT FIRE ON A CLOSURE (precision) */
console.log("\n--- 3 · deliberate closures are not graded ---");
{
  const QUIET = [
    `**As a WORKLOAD SIZE and never as a share of 128 MB.** D-312: the platform's`,
    ` *  in bytes. **A WORKLOAD SIZE, NEVER A SHARE OF 128 MB** — D-312 exists because`,
    `node's walk at the bound costs 254.5 MiB of heap against Cloudflare's documented 128 MiB isolate limit (their claim)`,
    `const TEXT_CAP = 128 * 1024;   // per column`,
    `maxBuffer: 128 * 1024 * 1024 });`,
    `resolution the adjacent constants already use (524,288 / 128 = 4,096 exactly).`,
    `an RGBA frame of 61.3 MB completes and one of 75.7 MB is KILLED (exceededMemory)`,
    `     \`memoryUsageBytes\` is not a share\n     of 128 MB, and walking the loop found it flat`,
  ];
  for (const q of QUIET) t(`quiet on: ${q.slice(0, 70)}`, sitesIn(q).length, 0);
  reached++;
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`memoryshare: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
