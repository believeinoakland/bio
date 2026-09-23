#!/usr/bin/env node
/* gateverdict.mjs — M0-127: the GitHub gate's verdict annotation, composed from the gate's own log.
 *
 * WHY. `.github/workflows/gates.yml` wrote its `gate verdict` annotation in shell, and its FAILED= field was
 * the battery's `  FAILED:` line and nothing else. On tree 6ef503c4 the run read RED with 282/282 suites green,
 * and the annotation said `FAILED=none`: the red was D-186's residue check (M-111), which is not a suite. A red
 * GitHub run emails Bob as an ALARM (TREE-SHARING §3), so a red that names nothing is a false-looking alarm.
 * The composition moved here, where a suite can drive it on planted logs (`bio-plane/test/gateverdict.test.mjs`);
 * the workflow runs this file and nothing else decides the annotation.
 *
 * THE RULE. The annotation reads `FAILED=none` ONLY on GREEN. Every other verdict names at least one cause:
 *   - `gates: CAUSES <token> …` — the gate's own line (tools/gates.mjs), every failed step's causes;
 *   - failing that (a gate that died mid-battery), the battery's own `  FAILED:` and `  RESIDUE (D-186):` and
 *     `LOG SHARED (D-425)` lines;
 *   - no RECORDED line: `gate:no-record:<after=<last step>|before-any-step>:exit=<n>` — a crash before or during
 *     the battery, npm, a cancel — and `gate:not-recorded` when the gate said NOT RECORDED (a tree that moved);
 *   - and if a RED still named nothing, `unnamed:RED-recorded-with-no-named-cause`: the liar is SAID, never `none`.
 * The token grammar is `tools/pushguard.mjs` parseVerdictAnnotation's (`kind:detail`, or a bare suite file).
 *
 * usage: node tools/gateverdict.mjs --log <file> --tree <hex> --exit <n> [--t0 <epoch s> --t1 <epoch s>]
 *   prints the `::notice title=gate verdict::…` line; appends the summary to $GITHUB_STEP_SUMMARY when set;
 *   exits 0 on GREEN only (the job succeeds only on GREEN), else the gate's exit or 1. */
import { appendFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
/* The gate's half of the grammar (stepCauses, causesLine) lives beside its reader, parseVerdictAnnotation, in
   pushguard.mjs: tools/gates.mjs already imports that module, and every fixture that copies gates.mjs copies it. */
import { tokenSafe } from "./pushguard.mjs";

const RECORD_RE = /^gates: RECORDED (GREEN|RED|NOT MEASURED) for tree .*$/gm;
/* ---- the workflow's half ---------------------------------------------------------------------------------- */

export function composeVerdict({ log = "", tree = "", exit = 0, wall = null } = {}) {
  const text = String(log);
  const recs = [...text.matchAll(RECORD_RE)];
  const rec = recs.length ? recs[recs.length - 1] : null;
  const verdict = rec ? rec[1] : "UNDETERMINED";
  const cls = rec ? ((/\(class ([A-Z]*)\)/.exec(rec[0]) || [])[1] || "?") : "?";
  const failed = [];
  const causeLines = [...text.matchAll(/^gates: CAUSES (.*)$/gm)];
  if (causeLines.length) failed.push(...causeLines[causeLines.length - 1][1].trim().split(/\s+/).filter(Boolean));
  else {
    /* the gate printed no CAUSES line (it died, or it predates M0-127): the battery's own lines */
    for (const m of text.matchAll(/^ {2}FAILED: (.*)$/gm)) failed.push(...m[1].split(/[\s,]+/).filter(Boolean).map(tokenSafe));
    for (const m of text.matchAll(/^ {2}RESIDUE \(D-186\): (\S+) — .*$/gm)) {
      const by = /left by (\S+) \(pid (\d+)/.exec(m[0]);
      failed.push(`residue:${tokenSafe(m[1])}:by=${by ? by[1] : "UNDETERMINED"}:pid=${by ? by[2] : "unknown"}`);
    }
    /* a battery that predates the RESIDUE lines printed only its LEAKING line (tree 6ef503c4's shape): its names */
    if (!/^ {2}RESIDUE \(D-186\): /m.test(text))
      for (const m of text.matchAll(/^ {2}LEAKING .*\(D-186\): (.*)$/gm))
        for (const n of m[1].split(/,\s*/).filter(Boolean))
          failed.push(`residue:${tokenSafe(n)}:by=UNDETERMINED:pid=${(/^bio-battery-(\d+)-/.exec(n) || [])[1] || "unknown"}`);
    if (/^LOG SHARED \(D-425\)/m.test(text)) failed.push("sharedlog:battery");
  }
  if (!rec) {
    const steps = [...text.matchAll(/^=== gates · (.+?): /gm)];
    const where = steps.length ? `after=${tokenSafe(steps[steps.length - 1][1].replace(/\s+/g, "-"))}` : "before-any-step";
    if (/^gates: NOT RECORDED/m.test(text)) failed.push("gate:not-recorded");
    failed.push(`gate:no-record:${where}:exit=${exit}`);
  }
  if (verdict === "GREEN") failed.length = 0;
  else if (!failed.length) failed.push(`unnamed:${verdict.replace(/\s+/g, "-")}-recorded-with-no-named-cause`);
  const FAILED = failed.length ? [...new Set(failed)].join(" ") : "none";
  const annotation = `VERDICT=${verdict} TREE=${tree} CLASS=${cls} EXIT=${exit}${wall === null ? "" : ` WALL=${wall}s`} FAILED=${FAILED}`;
  const doneLines = [...text.matchAll(/^.*(?:suites green|suites? .*(?:FAILED|failed)).*$/gm)];
  const done = doneLines.length ? doneLines[doneLines.length - 1][0] : "";
  return { verdict, cls, failed: FAILED === "none" ? [] : FAILED.split(" "), annotation, done,
           exitCode: verdict === "GREEN" ? 0 : (Number(exit) || 1) };
}

const main = () => {
  const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };
  let log = "";
  try { log = readFileSync(arg("log"), "utf8"); } catch (e) { log = ""; console.log(`gateverdict: the gate log could not be read (${e.code || e.message})`); }
  const t0 = Number(arg("t0")), t1 = Number(arg("t1"));
  const wall = Number.isFinite(t0) && Number.isFinite(t1) && arg("t0") !== undefined ? t1 - t0 : null;
  const v = composeVerdict({ log, tree: arg("tree") || "", exit: Number(arg("exit") ?? 1), wall });
  console.log(`::notice title=gate verdict::${v.annotation}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const iso = (s) => (Number.isFinite(s) ? new Date(s * 1000).toISOString().replace(/\.\d{3}Z$/, "Z") : "?");
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      `### gate: ${v.verdict} · class ${v.cls} · tree ${arg("tree") || "?"}`, "",
      `exit ${arg("exit")} · wall ${wall ?? "?"} s · ${iso(t0)} to ${iso(t1)}`, "",
      v.done || "no battery completion line", "",
      `FAILED: ${v.failed.length ? v.failed.join(" ") : "none"}`, ""].join("\n"));
  }
  process.exit(v.exitCode);
};
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
