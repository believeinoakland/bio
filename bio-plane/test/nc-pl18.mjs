/* PL-18's NEGATIVE-CONTROL HARNESS. Run it: `node bio-plane/test/nc-pl18.mjs`
 *
 * NINE ARMS PLUS A BASELINE, each broken ALONE with the other eight held open,
 * each DECLARED before it is armed, each restored and the restore VERIFIED by
 * sha256 AND by `cmp` against a per-arm pristine copy NAMED FOR ITS ARM so two
 * arms can never share one backup.
 *
 * THE ARM THIS HARNESS EXISTS FOR IS (a). PL-18's whole content is that the
 * refusal NAMES WHICH OF THE TWO FAILED, and the way that claim goes wrong is
 * not by producing no refusal — it is by producing a refusal that says the
 * wrong thing. So arm (a) collapses the two refusals into one and the DECLARED
 * result is deliberately asymmetric: **the arms that assert a refusal OCCURRED
 * must stay GREEN, and only the arms that assert its SENTENCE may go red.** An
 * outcome that costs nothing to produce is not evidence, and (a) is what proves
 * this suite is not buying one.
 *
 * WHY THERE IS A BASELINE ROW: a harness whose first run reported the same
 * thing for every arm INCLUDING the baseline is one of this repository's
 * receipts, and only the baseline row distinguished all-arms-broken from
 * all-arms-working. Arm 0 edits nothing and must be GREEN.
 *
 * WHY EACH ARM REFUSES TO ARM BLIND: an anchor that does not occur EXACTLY ONCE
 * is a planter scoring a delta against nothing. This is an acute hazard here —
 * the gate is called from THREE sites with near-identical lines — so every
 * anchor below carries the following line that tells its site from the others.
 *
 * ONE THING THAT IS DELIBERATELY *NOT* AN ARM, and it is recorded rather than
 * smoothed: `index.mjs`'s `inner.searchParams.delete("actor")` is
 * BEHAVIOURALLY INVISIBLE today. The `set` two lines below it runs
 * unconditionally for all three run verbs and `URLSearchParams.set` replaces
 * every existing value, so removing the `delete` changes nothing any arm can
 * see. It is kept as a structural guard against a future refactor that makes
 * the `set` conditional — the same shape REC-75 measured when reverting a write
 * to raw args turned out to be invisible because `#fmSafe` is idempotent. Arm
 * (i) breaks the `set` instead, which is the half that CAN be seen.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const STORE = P("../src/store.mjs");
const AIRUN = P("../src/airun.mjs");
const INDEX = P("../src/index.mjs");
const CHECKS = P("../checks/bio-checks.mjs");
const SUITE = P("./airun-projectgate.test.mjs");
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const ARMS = [
  { id: "0-BASELINE", file: null,
    declared: "nothing is edited. The suite must be GREEN, or every row below is measuring a "
            + "broken tree rather than a broken subject.",
    mustFail: "(none)", mustNotFail: "everything" },

  { id: "a-collapse-the-detail", file: AIRUN,
    declared: "THE ARM THIS ITEM EXISTS FOR. Make the participation refusal speak the CAPABILITY "
            + "refusal's words — the collapse PL-18 forbids. Deliberately asymmetric: a refusal "
            + "still happens and still carries C-22.8, so every arm that merely asserts *a refusal "
            + "occurred* MUST STAY GREEN.",
    mustFail: "B4 (the detail says contribute would not have helped) and C3 (neither refusal "
            + "carries the other's subject)",
    mustNotFail: "B1, B2 — a refusal still occurs and still carries the code. If these went red "
               + "the arm would prove nothing about the SENTENCE.",
    from: "    `starting or continuing a run over ${label} is work inside the project it belongs to, `\n"
        + "    + `and this account has joined none of them (DEC-63). This is not a capability: holding `\n"
        + "    + `contribute would not change it, and an owner of that project inviting you would`);",
    to:   "    `this account does not hold the contribute capability. Capabilities are set by an `\n"
        + "    + `administrator, so ask one to grant it rather than looking for another route.`);" },

  { id: "b-collapse-the-translation", file: CHECKS,
    declared: "the same collapse one layer out: give C-22.8 the CAPABILITY sentence as its canned "
            + "translation. This is the one a surface would actually render, so it is the more "
            + "expensive half of the collapse.",
    mustFail: "B2 (the translation is compared against the catalogue) and B3 (the sentence names "
            + "participation and the remedy)",
    mustNotFail: "B1 — the refusal still happens.",
    from: "    translation: 'Asking the system to look into a question is work inside the project that question '\n"
        + "      + 'belongs to, and this account is not one of that project\\'s participants. This is not about '\n"
        + "      + 'what the account is allowed to do in general — it is about which piece of work it is part '\n"
        + "      + 'of. Someone who owns that project can invite you to it.',",
    to:   "    translation: 'This account does not hold the contribute capability. Capabilities are set by an '\n"
        + "      + 'administrator, so ask one to grant it rather than looking for another route.'," },

  { id: "c-no-gate-on-open", file: STORE,
    declared: "remove the gate from `aiRunOpen` ALONE, leaving the tick and the close gated. This "
            + "is the RULING arm — DEC-63 is about who may START an investigation.",
    mustFail: "B (all), E2, F1, F2, G3, S1, S2, L1 — every refusal at the open",
    mustNotFail: "C (the capability floor is a different fence) and H1/H2 (the tick and close "
               + "keep their own gate, which is what proves the three are gated independently)",
    from: "    const gate = this.#aiRunProjectGate({ actor, contextType, contextId });\n    if (!gate.permitted)",
    to:   "    const gate = this.#aiRunProjectGate({ actor, contextType, contextId });\n    if (false && !gate.permitted)" },

  { id: "d-no-gate-on-tick", file: STORE,
    declared: "remove the gate from `aiRunTick` ALONE. IS-6's own argument is the subject: gating "
            + "the open and leaving the tick free would let an account that may not start a run "
            + "still spend its budget.",
    mustFail: "H1 (pia ticks) and H3 (the run is no longer untouched)",
    mustNotFail: "H2 — the close keeps its gate, so the two are not one fence measured twice.",
    from: "    const gate = this.#aiRunProjectGate({ actor, contextType: row.context_type, contextId: row.context_id });\n"
        + "    if (!gate.permitted)\n      return { run, ticked: false, found: true, status: row.status,",
    to:   "    const gate = this.#aiRunProjectGate({ actor, contextType: row.context_type, contextId: row.context_id });\n"
        + "    if (false && !gate.permitted)\n      return { run, ticked: false, found: true, status: row.status," },

  { id: "e-projectless-silent-deny", file: AIRUN,
    declared: "DEC-17's CASE, ARMED THE WRONG WAY. Make an inquiry outside any project fall through "
            + "to the refusal — the silent deny the item was told to decide against. *An inquiry "
            + "outside any project has no bar and inherits none.*",
    mustFail: "D1, D2, D3 — the projectless run is refused, and the stated ground goes with it",
    mustNotFail: "A, B, C — every arm about a question that IS in a project.",
    from: "  if (all.length === 0)\n    return { permitted: true, applied: false, ground: \"PROJECTLESS\",",
    to:   "  if (false)\n    return { permitted: true, applied: false, ground: \"PROJECTLESS\"," },

  { id: "f-over-strict-all-projects", file: AIRUN,
    declared: "OVER-STRICTNESS ARM ONE. Require participation in EVERY project that draws on the "
            + "question rather than any one of them — a fence tighter than DEC-63's rule, which "
            + "says *a member of the project* and not *of every project*. Correct work in a "
            + "spelling the fence did not anticipate must not be refused.",
    mustFail: "G1 and G2 — both members of the shared question, each in only one of its two projects",
    mustNotFail: "A1 (sam's question has ONE project, so a tightened fence does not reach it), B, "
               + "C, D — which is what shows the arm is about the MANY-PROJECT case specifically.",
    from: "  if (mine.length > 0)\n    return { permitted: true, applied: true, ground: \"PARTICIPANT\",",
    to:   "  if (mine.length === all.length)\n    return { permitted: true, applied: true, ground: \"PARTICIPANT\"," },

  { id: "g-over-strict-admit-invited", file: STORE,
    declared: "OVER-STRICTNESS ARM TWO, in the OPPOSITE direction: admit any participation row, so "
            + "`invited` and `leaving` count as participating. A gate loosened past its rule is "
            + "the same defect as one tightened past it.",
    mustFail: "F1 (an invited member opens a run) and L1 (a member who asked to leave opens one)",
    mustNotFail: "A, B, C, G — the settled states are unaffected.",
    from: "          return !!part && part.state === \"joined\";",
    to:   "          return !!part;" },

  { id: "h-neuter-the-capability-floor", file: INDEX,
    declared: "neuter the CAPABILITY FLOOR at the control plane, leaving the participation gate "
            + "intact. THE OTHER HALF OF THE ITEM: `contribute` stays as the floor beneath the "
            + "gate, and a floor nothing enforces is not a floor.",
    mustFail: "C1, C2 (vera, a participant with no contribute, is no longer stopped) and D4 (nor "
            + "over a projectless question)",
    mustNotFail: "B — pia still holds contribute and is still outside the project, so the GATE "
               + "still refuses her. That is the pair proving the two fences are independent.",
    from: "      if (needs && !(op === \"capture\" && req.method === \"GET\") && !sessCaps.has(needs))",
    to:   "      if (false && needs && !(op === \"capture\" && req.method === \"GET\") && !sessCaps.has(needs))" },

  { id: "i-drop-the-actor-stamp", file: INDEX,
    declared: "stop stamping `actor` server-side, so the value reaches the store from the CALLER'S "
            + "OWN QUERY. A gate that trusts the caller's word about who they are is not a gate.",
    mustFail: "S1 (pia borrows sam's participation by naming him) and A2/D2/H4 (a caller who names "
            + "nobody now reads as a machine credential and the stated ground collapses)",
    mustNotFail: "C1 — the capability floor is decided from the SESSION and is untouched by this.",
    from: "    if (RUN_VERB_ACTIONS.includes(op))\n      inner.searchParams.set(\"actor\", viaSession ? sessMember : \"\");",
    to:   "    if (false && RUN_VERB_ACTIONS.includes(op))\n      inner.searchParams.set(\"actor\", viaSession ? sessMember : \"\");" },
];

const runSuite = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) { return { out: `${e.stdout ?? ""}${e.stderr ?? ""}`, code: e.status ?? -1 }; }
};
const tally = (out) => {
  const mm = /airun-projectgate: (\d+) pass, (\d+) fail/.exec(out);
  /* A suite that never reached its own FOOT reports NO tally, and that is a
     different claim from "0 fail". Reported as `null`, never as zero. */
  return mm ? { pass: +mm[1], fail: +mm[2] } : { pass: null, fail: null };
};
/* THE ARM LABELS THAT WENT RED, not merely how many — an arm is only evidence
   if what broke is what was declared to break. */
const failedArms = (out) => [...new Set(out.split("\n").filter((l) => l.includes("FAIL  "))
  .map((l) => (/FAIL\s+(FIXTURE|ARM\s+[A-Z]\d*[a-z]?)/.exec(l) || [, "?"])[1].replace(/\s+/g, " ")))];

const rows = [];
for (const arm of ARMS) {
  console.log(`\n=== ARM ${arm.id} ===\n  DECLARED : ${arm.declared}`);
  console.log(`  MUST FAIL: ${arm.mustFail}`);
  console.log(`  MUST NOT : ${arm.mustNotFail}`);
  let before = null, backup = null;
  if (arm.file) {
    backup = `${arm.file}.pristine.${arm.id}`;
    copyFileSync(arm.file, backup);
    before = sha(arm.file);
    const src = readFileSync(arm.file, "utf8");
    const hits = src.split(arm.from).length - 1;
    if (hits !== 1)
      throw new Error(`ARM ${arm.id} REFUSED TO ARM: its anchor occurs ${hits} time(s) in `
        + `${arm.file}, so this arm would score a delta against nothing.`);
    writeFileSync(arm.file, src.replace(arm.from, arm.to));
    if (sha(arm.file) === before) throw new Error(`ARM ${arm.id} NEVER ARMED: the file did not change.`);
    console.log(`  ARMED    : 1 site edited in ${arm.file.split("/").pop()}`);
  }

  const { out, code } = runSuite();
  const { pass, fail } = tally(out);
  const red = failedArms(out);
  console.log(`  ACTUAL   : exit ${code} · ${pass === null ? "NO TALLY (the suite did not reach its own foot)" : `${pass} pass, ${fail} fail`}`);
  console.log(`  RED ARMS : ${red.length ? red.join(", ") : "(none)"}`);
  rows.push({ arm: arm.id, code, pass, fail, red });

  if (arm.file) {
    copyFileSync(backup, arm.file);
    const after = sha(arm.file);
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", arm.file, backup]); } catch { cmpOk = false; }
    const bytes = readFileSync(arm.file).length;
    console.log(`  RESTORED : ${bytes} bytes · sha256 ${after === before ? "IDENTICAL" : "*** DIFFERS ***"} · `
      + `cmp ${cmpOk ? "identical" : "*** DIFFERS ***"}`);
    /* A restore verified over an empty or truncated file is one of this
       repository's receipts (two harnesses agreed byte-identical over an EMPTY
       manifest, caught only because a digest read e3b0c442…). Floored. */
    if (bytes < 4096) throw new Error(`ARM ${arm.id}: restored file is ${bytes} bytes — implausible. Stopping.`);
    if (after !== before || !cmpOk) throw new Error(`ARM ${arm.id}: restore FAILED. Stopping.`);
    unlinkSync(backup);
  }
}

console.log("\n=== SUMMARY ===");
for (const r of rows)
  console.log(`  ${r.arm.padEnd(28)} exit ${String(r.code).padStart(2)} · `
    + `${r.pass === null ? "NO TALLY" : `${String(r.pass).padStart(2)} pass / ${String(r.fail).padStart(2)} fail`} · ${r.red.join(" ") || "(none red)"}`);
