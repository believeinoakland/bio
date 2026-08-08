#!/usr/bin/env node
/* PL-12's NEGATIVE-CONTROL HARNESS. Lives in THIS WORKTREE and nowhere shared.
 *
 * On 2026-08-07 a worker's harness was overwritten mid-turn by another running
 * worker, and a harness silently replaced between ARM and RESTORE reports a
 * restore it never performed. So: this file is inside the worktree it mutates,
 * every ARM proves its anchor is UNIQUE and that the bytes actually CHANGED
 * before any suite runs, and every RESTORE is verified by CONTENT as well as by
 * sha256 — a hash comparison alone cannot tell "restored" from "the harness was
 * replaced by one that hashes the file it just wrote".
 *
 *   node test/nc-pl12.mjs            run every arm  (from bio-plane/)
 *   node test/nc-pl12.mjs <n> [<n>]  run only these arm numbers
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PLANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (s) => createHash("sha256").update(s).digest("hex");

const runSuite = (name) => {
  const r = spawnSync(process.execPath, [join("test", `${name}.test.mjs`)],
    { cwd: PLANE, encoding: "utf8", timeout: 300_000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = [...out.matchAll(/(\d+)\s+pass,\s+(\d+)\s+fail/g)].pop();
  const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((x) => x[1].trim().slice(0, 110));
  return { code: r.status, pass: m ? +m[1] : null, fail: m ? +m[2] : null, fails, threw: /Error:/.test(out) && r.status !== 0 };
};

/* ARM: mutate, prove the mutation LANDED, run, restore, prove the restore. */
/* `marker` is the string the MUTATION introduces and the restore must remove.
 * CORRECTED ON FIRST RUN, and the correction is the point of having it: the
 * first version checked that the restored file no longer contained
 * `to.slice(0, 40)` — but every `to` here BEGINS with the anchor it replaces, so
 * the check read a correct restore as a failure. It failed SAFE, which is the
 * only acceptable direction for a restore check, and it is now explicit rather
 * than derived: each arm names the bytes it adds. */
const arm = ({ n, what, file, from, to, marker, all = false, suites, expect }) => {
  const path = join(PLANE, file);
  const before = readFileSync(path, "utf8");
  const beforeSha = sha(before);
  const hits = before.split(from).length - 1;
  console.log(`\n=== ARM ${n}: ${what}`);
  /* `all` is for a rule whose pushes are SEVERAL — C-25.1 has six, because the
     shape half of statement anatomy refuses six different absences. Neutering
     one of six would leave the rule enforced and the arm would prove nothing, so
     that arm removes the RULE and every other C-number keeps firing, which is
     what keeps the failure attributable. */
  if (all ? hits < 1 : hits !== 1) { console.log(`  ABORTED: anchor occurs ${hits} times in ${file}, must be ${all ? "at least 1" : "exactly 1"}`); return false; }
  const after = all ? before.split(from).join(to) : before.replace(from, to);
  if (after === before) { console.log("  ABORTED: replacement changed no bytes"); return false; }
  writeFileSync(path, after);
  const check = readFileSync(path, "utf8");
  if (sha(check) === beforeSha || !check.includes(marker)) {
    writeFileSync(path, before);
    console.log("  ABORTED: the mutation did not land on disk"); return false;
  }
  console.log(`  ARMED: ${file} ${beforeSha.slice(0, 12)} -> ${sha(check).slice(0, 12)}`);

  const results = {};
  try {
    for (const s of suites) {
      const r = runSuite(s);
      results[s] = r;
      console.log(`  ${s}: exit ${r.code}, ${r.pass} pass, ${r.fail} fail`);
      for (const f of r.fails.slice(0, 6)) console.log(`      FAILED: ${f}`);
    }
  } finally {
    /* RESTORE, and VERIFIED TWO WAYS. */
    writeFileSync(path, before);
    const back = readFileSync(path, "utf8");
    const okSha = sha(back) === beforeSha;
    const okContent = back === before && !back.includes(marker);
    console.log(`  RESTORED: sha256 ${okSha ? "OK" : "MISMATCH"} · content ${okContent ? "OK (byte-identical AND the mutation is gone)" : "MISMATCH"}`);
    if (!okSha || !okContent) { console.log("  *** RESTORE FAILED — STOP ***"); process.exit(2); }
  }
  const verdict = expect(results);
  console.log(`  VERDICT: ${verdict ? "the control FAILED the suite, as required" : "*** THE SUITE STAYED GREEN — the control proves nothing ***"}`);
  return verdict;
};

const named = (r, re) => r.fails.some((f) => re.test(f));

const ARMS = [
  { n: 1, what: "THE FENCE — a manifest reaches a SEARCH sub-session's spawn payload",
    file: "src/store.mjs",
    from: "      standard_pair: row.standard_pair,",
    to: "      standard_pair: row.standard_pair,\n      bias: row.bias_manifest,",
    marker: "bias: row.bias_manifest,",
    suites: ["bias"],
    expect: (r) => r.bias.fail > 0 && named(r.bias, /ARM F1|ARM F3/) },

  ...["C-25.1", "C-25.2", "C-25.3", "C-25.4", "C-25.5", "C-25.6", "C-25.7"].map((c, i) => ({
    n: `2${String.fromCharCode(97 + i)}`,
    what: `A MALFORMED BIAS BUNDLE — ${c}'s arm removed from checkBiasExtension, alone`,
    file: "checks/bio-checks.mjs",
    /* One arm at a time. Each C-number's FIRST push inside checkBiasExtension is
       neutered by sending it to a throwaway array; every other arm keeps firing,
       which is what makes the arm's own failure attributable. */
    from: `f('${c}', 'error'`,
    all: true,
    to: `f('NEUTERED-${c}', 'error'`,
    marker: `NEUTERED-${c}`,
    suites: ["bias"],
    expect: (r) => r.bias.fail > 0,
  })),

  { n: 3, what: "INHALE INSTALLS RATHER THAN PROPOSES (DEC-54 c, the quietest of the four)",
    file: "src/store.mjs",
    from: "    const cap = Math.max(1, Math.min(Store.BIAS_INHALE_LIMIT_MAX,",
    to: "    this.sql.exec(`INSERT INTO bias_adoptions (scope_type,scope_id,bundle_id,bundle_sha,author,at)"
      + " VALUES ('instance','','BIAS-INSTALLED','x','machine','2026-01-01T00:00:00Z')`);\n"
      + "    const cap = Math.max(1, Math.min(Store.BIAS_INHALE_LIMIT_MAX,",
    marker: "BIAS-INSTALLED",
    suites: ["bias"],
    expect: (r) => r.bias.fail > 0 && named(r.bias, /ARM I5|ARM I6/) },

  { n: 4, what: "A NEW TABLE ABSENT FROM purge (D-113)",
    file: "src/store.mjs",
    from: `"action_basis", "correspondence", "bias_statements", "bias_adoptions"`,
    to: `"action_basis", "correspondence", "bias_adoptions"`,
    marker: `"correspondence", "bias_adoptions"`,
    suites: ["hygiene", "bias"],
    expect: (r) => r.hygiene.fail > 0 && r.bias.fail > 0 },

  { n: 5, what: "A CARRIED-FORWARD ACKNOWLEDGEMENT (DEC-46, C-21.1's byte-check) — the refusal removed",
    file: "src/store.mjs",
    from: `const REASON = { bias_acknowledgement: "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD" };`,
    to: `const REASON = { bias_acknowledgement_disabled: "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD" };`,
    marker: "bias_acknowledgement_disabled",
    suites: ["publish", "publishedcase", "bias"],
    expect: (r) => r.publish.fail > 0 || r.publishedcase.fail > 0 || r.bias.fail > 0 },

  { n: 6, what: "OVER-STRICTNESS — the malformedness predicate widened to catch strong language",
    file: "checks/bio-checks.mjs",
    from: "const BIAS_VERDICT_SPEAKER = [",
    to: "const BIAS_VERDICT_SPEAKER = [\n  /\\b(reliable|track record|motive|discretion)\\b/i,",
    marker: "reliable|track record|motive|discretion",
    suites: ["bias"],
    /* A CRASH IS A FAILURE. `fail` reads null when a suite dies before its tally,
       so a control that KILLED the suite must not be scored as "stayed green" —
       which is how this arm first read. The block wrapper in bias.test.mjs now
       keeps the suite alive, and this predicate accepts either shape. */
    expect: (r) => (r.bias.code !== 0) && named(r.bias, /OVER-STRICTNESS/) },
];

const want = process.argv.slice(2);
const selected = want.length ? ARMS.filter((a) => want.includes(String(a.n))) : ARMS;
let good = 0;
for (const a of selected) if (arm(a)) good++;
console.log(`\n${good}/${selected.length} arms proved the suite fails when its subject is broken.`);
process.exit(good === selected.length ? 0 : 1);
