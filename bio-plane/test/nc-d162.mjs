/* D-162's NEGATIVE CONTROL HARNESS. Declared in `test/theme.test.mjs`, run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-d162.mjs              # every arm, in order, baseline first
 *     node test/nc-d162.mjs legonly      # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-mk4.mjs` is its shape, arm for arm — fence 4 reuses the
 * lead's refusal pattern, so its control reuses the lead's harness.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; a BASELINE row that arms nothing; every arm declares BEFORE it runs
 * what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match
 * count other than the one declared is a finding, never a retry); every restore
 * is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded — never
 * `git checkout --`; a surprising green is a finding about the ARM.
 *
 * The pristine copies live in `$D162_PEN` (default /tmp/d162-theme/pen), a
 * directory only this item uses — not the shared scratchpad, and not the tree.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = process.env.D162_PEN || "/tmp/d162-theme/pen";
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const AFF = join(PLANE, "src/affordances.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/theme.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /\ntheme: (\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING tally is -1, never 0 — a module that ended early reached no foot. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};
/* Every patch in an arm must match EXACTLY the declared number of times, or the
   arm did not arm — and nothing is written. */
function arm(patches) {
  const byFile = new Map();
  for (const [file, find, replace, expect = 1] of patches) {
    const src = byFile.get(file) ?? readFileSync(file, "utf8");
    const n = src.split(find).length - 1;
    if (n !== expect) return { armed: false, matches: `${n} (expected ${expect}) for ${JSON.stringify(find.slice(0, 60))}` };
    byFile.set(file, src.split(find).join(replace));
  }
  for (const [f, s] of byFile) writeFileSync(f, s);
  return { armed: true, matches: patches.map((p) => p[3] ?? 1).join("+") };
}

const ARMS = {
  baseline: {
    files: [CHECKS],
    why: "nothing armed: the suite must be green on the tree as it is",
    mustFail: [],
    mustPass: "every assertion",
    patch: () => ({ armed: true, matches: "0 (baseline)" }),
  },
  legonly: {
    files: [CHECKS],
    why: "THE ROW'S CONTROL: drop the leg refusal (C-81.1) at every door — both of its branches. The id "
       + "shape still keeps a bare theme out of a bundle-id grammar, so those legs are refused under the "
       + "WRONG NAME; a leg claiming membership (`theme:`) on a real document is then ACCEPTED",
    mustFail: ["ACCEPTS-WHEN: op=promote REFUSES an inquiry whose basis[].target is a THEME",
               "the VERSION-LEG grammar refuses a theme BY NAME",
               "the ACTION-BASIS grammar refuses a theme BY NAME",
               "a leg on a real document that claims it THROUGH the theme"],
    mustPass: "declaration, placement, hunch, liar and visibility arms",
    patch: () => arm([[CHECKS, "    if (v && THEME_REF_RE.test(v)) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\",",
                               "    if (false) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\","],
                      [CHECKS, "    if (named) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\",",
                               "    if (false) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\","]]),
  },
  liar: {
    files: [AFF],
    why: "THE LIAR THE ROW NAMES: a theme as an ELEVENTH ENTITY KIND — a named, citable thing the "
       + "registry will create",
    mustFail: ["`theme` is NOT in ENTITY_KINDS", "the subject registry REFUSES a theme as an entity kind"],
    mustPass: "the leg refusals — they do not consult the registry",
    patch: () => arm([[AFF, "\"person\", \"body\", \"ordinance\", \"parcel\", \"contract\", \"fund\",\n];",
                            "\"person\", \"body\", \"ordinance\", \"parcel\", \"contract\", \"fund\", \"theme\",\n];"]]),
  },
  notest: {
    files: [STORE],
    why: "fence 2 dropped: a theme may be declared without its TEST",
    mustFail: ["A DECLARATION WITHOUT A TEST IS REFUSED", "a test of whitespace is no test",
               "none of the refused declarations wrote a theme"],
    mustPass: "the name, length and machine refusals",
    patch: () => arm([[STORE, "    if (!criterion.trim())\n      return refusal(\"THEME_NO_TEST\",",
                              "    if (false)\n      return refusal(\"THEME_NO_TEST\","]]),
  },
  machinedeclare: {
    files: [STORE],
    why: "fence 1 dropped: a machine credential may declare a theme",
    mustFail: ["the MEMBER token is a machine credential", "and the ADMIN token is a machine credential too"],
    mustPass: "the member's own declaration",
    patch: () => arm([[STORE, "    if (!who || isMachineIdentity(who))\n      return refusal(\"THEME_NOT_A_MEMBER\",",
                              "    if (!who)\n      return refusal(\"THEME_NOT_A_MEMBER\","]]),
  },
  stamp: {
    files: [INDEX],
    why: "the declarer is no longer stamped by the control plane: the caller's query-string `declarer` "
       + "names who declared it",
    mustFail: ["the declarer is SERVER-STAMPED"],
    mustPass: "the placement arms — `placer` is a separate stamp",
    patch: () => arm([[INDEX, "    if (op === \"themedeclare\")\n      inner.searchParams.set(\"declarer\",",
                              "    if (op === \"themedeclare\" && false)\n      inner.searchParams.set(\"declarer\","]]),
  },
  machineplace: {
    files: [STORE],
    why: "fence 3 dropped at the ACT: a machine credential may place, so its judgement becomes membership",
    mustFail: ["a MACHINE credential cannot PLACE"],
    mustPass: "the proposal arms",
    patch: () => arm([[STORE, "    if (!who || isMachineIdentity(who))\n      return refusal(\"THEME_PLACEMENT_NOT_A_MEMBER\",",
                              "    if (!who)\n      return refusal(\"THEME_PLACEMENT_NOT_A_MEMBER\","]]),
  },
  hunchcounts: {
    files: [STORE],
    why: "fence 3 dropped at the ROW: a proposal is written as MEMBERSHIP (state member, grade D) — the "
       + "hunch that counts",
    mustFail: ["READS AS A HUNCH", "on the reading the hunch is listed APART"],
    mustPass: "the member placements",
    patch: () => arm([[STORE, "         VALUES (?, ?, ?, ?, 'hunch', 'C', ?, ?, ?)`,",
                              "         VALUES (?, ?, ?, ?, 'member', 'D', ?, ?, ?)`,"]]),
  },
  ungated: {
    files: [STORE],
    why: "the reading is no longer gated per placement: a document the reader cannot see is listed",
    mustFail: ["otto — no position in that project — reads the theme WITHOUT it",
               "and nothing on otto's reading mentions it"],
    mustPass: "the placement refusal — the act's gate is a different site (`#themeTarget`)",
    patch: () => arm([[STORE, "        WHERE p.theme_id = ? AND p.state = ? AND (${g.sql}) ORDER BY p.target LIMIT ?`,\n      T.theme_id, state, ...g.args, cap + 1);",
                              "        WHERE p.theme_id = ? AND p.state = ? ORDER BY p.target LIMIT ?`,\n      T.theme_id, state, cap + 1);"]]),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION: C-81.1 claims any value merely CONTAINING 'theme' — a fence "
       + "tighter than its rule refuses a document that happens to be about themes",
    mustFail: ["a document whose id merely contains 'theme' is NOT refused",
               "a malformed THEME- string is left to the target grammar"],
    mustPass: "every BY-NAME refusal still fires",
    patch: () => arm([[CHECKS, "    if (v && THEME_REF_RE.test(v)) {", "    if (v && /theme/i.test(v)) {"]]),
  },
  overstrictkey: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION, at the membership branch: a leg is refused for merely CARRYING a "
       + "`theme` key, even a null one",
    mustFail: ["a leg whose `theme` is null, or whose NOTE mentions a theme, is not claimed"],
    mustPass: "the real `theme:` claim is still refused",
    patch: () => arm([[CHECKS, "    if (named) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\",",
                               "    if (named || key in l) {\n      findings.push(refusal(\"THEME_NOT_EVIDENCE\","]]),
  },
};
const want = process.argv[2] || null;
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches})`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
    continue;
  }
  const hit = a.mustFail.map((w) => r.failing.some((l) => l.includes(w)));
  const ok = armed.armed && r.pass >= 0 && hit.every(Boolean);
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${hit.every(Boolean) ? "" : ` — did not fail: ${a.mustFail.filter((_, i) => !hit[i]).join(" | ")}`}`);
  if (!ok) finding++;
}
console.log(`\nnc-d162: ${finding} finding(s) across ${names.length} arm(s)`);
process.exit(finding ? 1 : 0);
