/* D-444 — the negative-control arms for the `--- D-444 ---` block of
 * `affordances.test.mjs`, committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/ while it runs, so the battery must not discover it
 * (`rec-183-reinstate-retired.control.mjs` set the precedent).
 *
 *   node test/d444-reinstate-project-arm.control.mjs        baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs. The first is the row's own; the other three exist because
 * this item's real subject — ONE predicate rather than two that agree — is invisible to behaviour.
 *
 *   revert      the PROJECT arm keys back on `cites_out.severed`, the count REC-183 left it on.
 *               MUST FAIL: §0 (the arm names the bare count again), §1 (the retired-only project is
 *               offered an act the store refuses — the defect, re-entered) and §4 (the same project
 *               once its live edge is back). MUST HOLD: §2 and §3 — the offer and the acceptance on
 *               a live target were never the defect and must not move.
 *   drop        the PROJECT arm is removed from `reinstate` altogether — HOW A LIAR PASSES, named
 *               on the row itself: it satisfies "never offer what the store refuses" for free.
 *               MUST FAIL: §0 and §2's offer. MUST HOLD: §1, §3, §4, and above all §2's ACCEPTANCE
 *               — the op still honours reinstate, so only the publication is lying.
 *   copy        `affordanceFacts` asks its OWN copy of the retired predicate instead of
 *               `#retiredNotCitable`, spelled identically. MUST FAIL: §0 ALONE. MUST HOLD: every
 *               behavioural arm — an identical copy agrees at zero cost (REC-35's finding, here on a
 *               predicate), which is why the structural pin is the whole of this control.
 *   blind       the fact is stated but never counted (`severed_reinstatable` stays 0), so the act is
 *               withheld from every project. The over-strictness direction from the STORE's side
 *               rather than the catalogue's. MUST FAIL: §2's offer. MUST HOLD: §0, §1, §3, §4 and
 *               §2's acceptance.
 *
 * D-553 (2026-09-25) ADDS THREE ARMS, all on the store and all STRUCTURAL, because BOB #34's one
 * type-blind helper is invisible to behaviour today (no project can be `retired`, and `op=cite`'s
 * NOT_INFORMATION refuses a bias before the retired question is reached):
 *   citecopy    THE ROW'S OWN — `op=cite`'s `is-cite-retired` region restores D-168's inline copy,
 *               Information-typed. MUST FAIL: §0 ALONE. MUST HOLD: every behavioural arm.
 *   suggestcopy the suggest path's CHECK 1 asks its own type-blind copy of the column inside the
 *               viewer-gated query, as it did before D-553. MUST FAIL: §0 ALONE. MUST HOLD: the rest.
 *   typed       the helper regains its Information test (the rule on the TYPE, not the state).
 *               MUST FAIL: §0 ALONE. MUST HOLD: the rest.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm
 * pristine copy, and the pristine copy's size is printed and floored.
 *
 * THE PRISTINE COPIES ARE KEPT OUTSIDE THE WORKTREE — `$D444_CONTROL_SNAP`, else the process's
 * TMPDIR. RULED BY BOB #32, 2026-09-24, superseding the "inside your own worktree" practice the
 * REC-183 control still follows: a file in the worktree is walked by repository-reading suites, trips
 * the gate's under-inclusion check and makes the tree dirty, which is how REC-185 moved the battery's
 * assertion total with no source change. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { controlPen } from "./pen.mjs";
const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src/store.mjs");
const AFF = join(PLANE, "src/affordances.mjs");
const SUITE = join(HERE, "affordances.test.mjs");
/* M0-182's one spelling (moved at c20-batch27 by CONDUCT #20): both old branches were already outside the
   worktree, but the env-var-first expression is one the pen sweep cannot resolve (UNCLASSIFIED). */
const SNAP = controlPen("d444");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const PROJ_ARM = `|| (ty === "project" && (f.cites_out.severed_reinstatable ?? 0) > 0\n`
               + `                         && f.project_participant !== false) },`;
const FACT = `          if (typeof r.target === "string" && !this.#retiredNotCitable(r.target))\n`
           + `            citesOut.severed_reinstatable++;`;
const COPY = `          if (typeof r.target === "string") {\n`
           + `            const tb = this.#one(\`SELECT object_type, current_state FROM bundles WHERE bundle_id=?\`, r.target);\n`
           + `            if (!(tb && normalizeType(tb.object_type) === "information"\n`
           + `                  && String(tb.current_state ?? "").trim() === "retired"))\n`
           + `              citesOut.severed_reinstatable++;\n`
           + `          }`;

const CITE_ONE = `    const retiredMembers = sel.members.filter((id) => this.#retiredNotCitable(id));\n`;
const CITE_COPY = `    const retiredMembers = [];\n`
                + `    for (const id of sel.members) {\n`
                + `      const b = this.#one(\`SELECT object_type, current_state FROM bundles WHERE bundle_id=?\`, id);\n`
                + `      if (b && normalizeType(b.object_type) === "information"\n`
                + `          && String(b.current_state ?? "").trim() === "retired") retiredMembers.push(id);\n`
                + `    }\n`;
const SUG_ONE = `      const retired = this.#retiredNotCitable(t);\n`
              + `      const row = this.#one(\n`
              + `        \`SELECT b.bundle_id FROM bundles b\n`;
const SUG_COPY = `      const row = this.#one(\n`
               + `        \`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b\n`;
const SUG_USE = `      if (retired) unreachable.push(`;
const HELPER = `    const b = this.#one(\`SELECT current_state FROM bundles WHERE bundle_id=?\`, id);\n`
             + `    return !!b && String(b.current_state ?? "").trim() === "retired";\n`;
const HELPER_TYPED = `    const b = this.#one(\`SELECT object_type, current_state FROM bundles WHERE bundle_id=?\`, id);\n`
                   + `    return !!b && normalizeType(b.object_type) === "information"\n`
                   + `        && String(b.current_state ?? "").trim() === "retired";\n`;

const S0 = "§0 STRUCTURAL", S1 = "§1 a project whose ONLY severed edge", S3 = "§3 the project-side offer";
const OFFER = "§2 the project IS offered reinstate again", ACCEPT = "§2 ... and the store ACCEPTS it";
const S4 = "§4 after the live edge is reinstated";

const ARMS = {
  revert: { file: AFF, floor: 100_000, from: PROJ_ARM,
    to: `|| (ty === "project" && f.cites_out.severed > 0\n                         && f.project_participant !== false) },`,
    mustFail: [S0, S1, S4], mustHold: [OFFER, ACCEPT, S3] },
  drop: { file: AFF, floor: 100_000, from: PROJ_ARM, to: `},`,
    mustFail: [S0, OFFER], mustHold: [S1, ACCEPT, S3, S4] },
  copy: { file: STORE, floor: 1_000_000, from: FACT, to: COPY,
    mustFail: [S0], mustHold: [S1, OFFER, ACCEPT, S3, S4] },
  blind: { file: STORE, floor: 1_000_000, from: FACT,
    to: `          if (false && typeof r.target === "string" && !this.#retiredNotCitable(r.target))\n`
      + `            citesOut.severed_reinstatable++;`,
    mustFail: [OFFER], mustHold: [S0, S1, ACCEPT, S3, S4] },
  citecopy: { file: STORE, floor: 1_000_000, from: CITE_ONE, to: CITE_COPY,
    mustFail: [S0], mustHold: [S1, OFFER, ACCEPT, S3, S4] },
  suggestcopy: { file: STORE, floor: 1_000_000, from: SUG_ONE, to: SUG_COPY,
    also: [SUG_USE, `      if (String(row.current_state ?? "").trim() === "retired") unreachable.push(`],
    mustFail: [S0], mustHold: [S1, OFFER, ACCEPT, S3, S4] },
  typed: { file: STORE, floor: 1_000_000, from: HELPER, to: HELPER_TYPED,
    mustFail: [S0], mustHold: [S1, OFFER, ACCEPT, S3, S4] },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /affordances: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
/* THE BASELINE ROW EXISTS SO A RUN WITH EVERY ARM BROKEN IS DISTINGUISHABLE FROM ONE WITH EVERY ARM
   WORKING — a harness that reported `null` for its baseline as well as for its arms is on record. */
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 99) {
  console.log("baseline is not green at >= 99 pass; no arm can mean anything"); process.exit(2);
}

for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(a.file);
  const what = a.file === STORE ? "src/store.mjs" : "src/affordances.mjs";
  if (bytes.length < a.floor) { console.log(`REFUSING: ${what} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(SNAP, `${arm}--${a.file === STORE ? "src_store" : "src_affordances"}.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine ${what} ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times`); bad++; continue; }
  let armed = text.replace(a.from, a.to);
  /* D-553: an arm may move a SECOND anchor in the same file (`also: [from, to]`), each held to one match. */
  if (a.also) {
    const m = armed.split(a.also[0]).length - 1;
    if (m !== 1) { console.log(`  ARM DID NOT ARM: second anchor matched ${m} times`); bad++; continue; }
    armed = armed.replace(a.also[0], a.also[1]);
  }
  writeFileSync(a.file, Buffer.from(armed, "latin1"));
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(a.file, bytes);
    const now = readFileSync(a.file), pristine = readFileSync(dest);
    const eq = sha(now) === sha(pristine) && now.equals(pristine);
    console.log(`  restored: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} ${sha(now).slice(0, 12)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"} · ${now.length} B`);
    if (!eq) process.exit(2);
  }
  console.log(`  result: exit ${r.code} · ${r.foot ? `${r.foot.pass} pass / ${r.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
  for (const f of r.failed) console.log(`    failed: ${f.split("\n")[0].slice(0, 110)}`);
  const hit = (p) => r.failed.some((f) => f.startsWith(p));
  const missing = a.mustFail.filter((p) => !hit(p)), leaked = a.mustHold.filter(hit);
  const ok = r.foot && !missing.length && !leaked.length;
  console.log(`  verdict: ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${missing.length ? ` · did not fail: ${missing.join(" | ")}` : ""}`
    + `${leaked.length ? ` · failed but must hold: ${leaked.join(" | ")}` : ""}`);
  if (!ok) bad++;
}
rmSync(SNAP, { recursive: true, force: true });
console.log(`\nd444 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
