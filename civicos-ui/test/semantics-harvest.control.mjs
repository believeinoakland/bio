#!/usr/bin/env node
/* D-545's NEGATIVE CONTROL DRIVER — the arms for `semantics-harvest.test.mjs`.
 *
 * Run from the REPO ROOT:
 *     node civicos-ui/test/semantics-harvest.control.mjs            # every arm
 *     node civicos-ui/test/semantics-harvest.control.mjs typeof     # one arm
 *
 * Each arm edits `civicos-ui/check-semantics.mjs` ALONE, with every other arm held open, runs the suite,
 * and restores the check from a uniquely-named per-arm pristine copy kept OUTSIDE the worktree, verified
 * by sha256 AND `cmp` with the byte count printed and a minimum guarded. Never `git checkout --`.
 * THE DRIVER LAW (VERIFICATION.md, D-331): every arm's anchor is counted in the file BEFORE anything is
 * armed and the whole table printed; a count other than 1 refuses the run with nothing armed. The arm
 * tally is DECLARED here and ASSERTED at the foot. The pen is restored on EVERY exit, from an exit hook.
 *
 * ARMS DECLARED: 7 (baseline + a..f)
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync, execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const CHECK = ROOT + "civicos-ui/check-semantics.mjs";
const SUITE = ROOT + "civicos-ui/test/semantics-harvest.test.mjs";
const ARMS_DECLARED = 7;

const RAW = { from: "const storeCode = stripComments(store);", to: "const storeCode = store;" };
const TYPEOF = { from: "if (/\\btypeof\\s+", to: "if (false && /\\btypeof\\s+" };
const CATALOGUE = { from: "else if (!CATALOGUE_STATES.has(m[1]))", to: "else if (false)" };
const SILENT = { from: "if (u.fails) bad(line.trim()); else console.log(line);", to: "console.log(line);" };
const EATEN = { from: RAW.from, to: "const storeCode = store.replace(/[^\\n]/g, \" \");" };

/* `mustFail` is a fragment of each assertion that MUST fail; every other assertion MUST pass. Declared
   here, before anything runs, so a surprising result is a finding and not a description. */
const ARMS = {
  baseline: { patches: [], mustFail: [], why: "nothing armed: MUST be green, and it is what proves the others are real" },
  /* raw and eaten were DECLARED TOO NARROWLY on their first run (2026-09-24, D-545): raw also loses both
     "blanked" labels (nothing is blanked any more), and eaten leaves F1's and F2's set comparisons trivially
     equal over an empty harvest while failing every GREEN and every naming. Both arms broke MORE than
     declared, never less; the declarations below are corrected to what each arm, reasoned through, must do. */
  raw:       { patches: [RAW], mustFail: ["F1: still GREEN", "F1: the line comment", "F1: the block comment"],
               why: "(a) harvest the raw file again: the commented-out quote is read as code and `nobody_wrote` fails by name" },
  typeof:    { patches: [TYPEOF], mustFail: ["F1: still GREEN", "F1: the typeof guard is an UNRECOGNISED MATCH"],
               why: "(b) the `typeof` guard disarmed: `string` is read as an uncatalogued literal and fails by name" },
  predefect: { patches: [RAW, TYPEOF, CATALOGUE],
               mustFail: ["F1: still GREEN", "F1: the state set is UNCHANGED", "F1: none of", "F1: the typeof guard",
                          "F1: the line comment", "F1: the block comment", "F2: neither is counted"],
               outHas: "states the store writes with no semantics row",
               why: "(c) the pre-D-545 instrument: the planted guard is read AS A STATE, failing by name — the measured defect" },
  catalogue: { patches: [CATALOGUE], mustFail: ["F2: neither is counted"],
               why: "(d) the catalogue guard disarmed alone: `zombie` is counted as a state (the reach itself survives)" },
  silent:    { patches: [SILENT], mustFail: ["F2: the check FAILS", "F2: it fails NAMING `zombie`", "F2: it fails NAMING `revenant`"],
               why: "(e) 'fewer states' passing for the fix: an uncatalogued code literal reported but not failing" },
  eaten:     { patches: [EATEN], mustFail: ["F0: check-semantics is GREEN", "F0: the harvest printed", "F0: the harvest reached",
                                            "F1: still GREEN", "F1: the typeof guard", "F2: it fails NAMING", "F3:"],
               why: "(f) the lexer eats the whole store: the reach floor must refuse a harvest of nothing" },
};

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const only = process.argv[2];
if (only && !ARMS[only]) { console.error(`no such arm: ${only}\n  arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
const names = only ? [only] : Object.keys(ARMS);

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map((p) => ({ arm, file: CHECK, find: p.from, put: p.to }))));

/* PREFLIGHT: every anchor this invocation will write, counted in the file, the whole table printed. */
const src0 = fs.readFileSync(CHECK, "utf8");
let dead = 0;
console.log("PREFLIGHT (anchor counts in check-semantics.mjs; each must be 1):");
for (const n of names) for (const p of ARMS[n].patches) {
  const c = src0.split(p.from).length - 1;
  console.log(`  ${n.padEnd(10)} ${String(c).padStart(2)}  ${JSON.stringify(p.from)}`);
  if (c !== 1) dead++;
}
if (dead) { console.error(`REFUSED: ${dead} anchor(s) do not match exactly once; nothing armed`); process.exit(3); }

const pen = fs.mkdtempSync(path.join(os.tmpdir(), "d545-control-"));
let live = null;                                   // { pristine, before } while an arm is armed
function restore() {
  if (!live) return true;
  fs.copyFileSync(live.pristine, CHECK);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", CHECK, live.pristine]); } catch (_) { cmpOk = false; }
  const bytes = fs.statSync(CHECK).size, good = sha(CHECK) === live.before && cmpOk && bytes > 10000;
  console.log(`  restored: sha256 ${sha(CHECK) === live.before ? "EQUAL" : "*** MISMATCH ***"} · cmp ${cmpOk ? "identical" : "*** DIFFERS ***"} · ${bytes} bytes`);
  live = null;
  return good;
}
process.on("exit", () => { restore(); fs.rmSync(pen, { recursive: true, force: true }); });
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => process.exit(130));

let broke = 0, wrong = 0, ran = 0;
for (const n of names) {
  const arm = ARMS[n];
  console.log(`\n=== ${n} — ${arm.why}`);
  const pristine = path.join(pen, `check-semantics.pristine-${n}.mjs`);
  fs.copyFileSync(CHECK, pristine);
  live = { pristine, before: sha(CHECK) };
  let s = fs.readFileSync(CHECK, "utf8");
  for (const p of arm.patches) s = s.replace(p.from, p.to);
  fs.writeFileSync(CHECK, s);
  if (arm.patches.length && sha(CHECK) === live.before) { console.log("  *** ARM DID NOT ARM ***"); broke++; restore(); continue; }
  const r = spawnSync("node", [SUITE], { encoding: "utf8", cwd: ROOT });
  const out = (r.stdout || "") + (r.stderr || "");
  const failed = out.split("\n").filter((l) => l.startsWith("  FAIL ")).map((l) => l.slice(7));
  const tally = /semantics-harvest: (\d+) pass, (\d+) fail/.exec(out);
  ran++;
  console.log(`  RUN: ${tally ? `${tally[1]} pass, ${tally[2]} fail` : "NO TALLY (-1)"} · suite exit ${r.status}`);
  for (const f of failed) console.log("    failed: " + f);
  const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
  const extra = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
  const outOk = !arm.outHas || out.includes(arm.outHas);
  const asDeclared = tally && missing.length === 0 && extra.length === 0 && outOk
    && (arm.mustFail.length ? r.status === 1 : r.status === 0);
  console.log(`  ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`
    + (missing.length ? ` · did not fail: ${missing.join(" | ")}` : "")
    + (extra.length ? ` · failed unexpectedly: ${extra.join(" | ")}` : "")
    + (outOk ? "" : ` · output lacks "${arm.outHas}"`));
  if (!asDeclared) wrong++;
  if (!restore()) broke++;
}

const tallyOk = only ? ran === 1 : ran === ARMS_DECLARED;
console.log(`\n${"=".repeat(78)}\narms run ${ran} (declared ${only ? 1 : ARMS_DECLARED}) · ${wrong} not as declared · ${broke} failed to arm or restore`);
process.exit(broke || wrong || !tallyOk ? 1 : 0);
