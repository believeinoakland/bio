/* REC-103's NEGATIVE CONTROL DRIVER — `node test/nc-rec103.mjs [arm|all]`.
 *
 * THE DRIVER is committed INSIDE THIS WORKTREE; its PEN is not — since M0-182 the
 * pristine copies go to `controlPen("rec103")`, a fresh `mkdtemp`, never a shared
 * scratchpad: two workers have reported the shared one is not isolated between sessions.
 *
 * EACH ARM ALONE, every other defence held open. Each mutation passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard. Every
 * restore is verified by sha256 AND by `cmp` against a PRISTINE copy named
 * UNIQUELY PER ARM, with a byte count printed and a minimum guarded — because
 * `git checkout --` restores to HEAD and has twice silently discarded a
 * session's own uncommitted work in this repository.
 *
 * AN OPENING AND A CLOSING BASELINE ROW BRACKET THE RUN. A harness that reported
 * the same answer for every arm INCLUDING the baseline is on record here, and
 * without a baseline row six reds read exactly like six arms working.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const PEN = controlPen("rec103");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): observation-log (T5, its R13) took the row fence out of
   `store.mjs` (`#observationBundles` and the frontier's compiled gate) into `src/observation-log/index.mjs`:
   `#rowBundles` (which bundles a row names), `rowVisible` (one row; retrieval's frontier asks it) and `rowGate`
   (compiled once; the store's `#frontierDocumentVisible` asks it). The member and DENY scope lines now exist once in
   EACH of the two, so an arm on them patches both, which is what patching the one gate did. The run referent's
   delegated gate is the resolver the store registers (`registerAuthority("run", …)`, N39). Each arm is now a list of
   [anchor, replacement] pairs in one file, every anchor guarded exactly-once. */
const OBSLOG = fileURLToPath(new URL("../src/observation-log/index.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./observation-log.test.mjs", import.meta.url));
const MIN_BYTES = { [STORE]: 500000, [OBSLOG]: 50000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const MEMBER_ONE = ["    if (gate.scope === \"member\") return true;\n    if (gate.scope === \"DENY\" || !row",
                    "    if (gate.scope === \"DENY\" || !row"];
const MEMBER_GATE = ["    if (gate.scope === \"member\") return () => true;\n    if (gate.scope === \"DENY\") return () => false;",
                     "    if (gate.scope === \"DENY\") return () => false;"];

/* Each arm: [file, [[anchor, replacement], …], declared]. */
const ARMS = {
  fence: [OBSLOG, [
    [MEMBER_ONE[0], "    if (true) return true;\n    if (gate.scope === \"DENY\" || !row"],
    [MEMBER_GATE[0], "    if (true) return () => true;\n    if (gate.scope === \"DENY\") return () => false;"]],
    "MUST FAIL I1 I2 I3 I8 (the leak returns); MUST NOT FAIL I4 I4b (over-strictness)"],
  authority: [OBSLOG, [
    ["    if (row.authority != null && row.authority !== \"\") {",
     "    if (false && row.authority != null && row.authority !== \"\") {"]],
    "MUST FAIL I1 I8 (the AUTHORITY half alone); MUST NOT FAIL I2 I3 I4 I4b "
    + "(the result_ref half still fires) — REC-94's fall-through shape"],
  overstrict: [OBSLOG, [
    ["  #rowBundles(row, viewer) {\n    const out = [];\n    let unresolved = false, answer = null;",
     "  #rowBundles(row, viewer) {\n    const out = [];\n    let unresolved = true, answer = null;"]],
    "MUST FAIL I4 I4b I8b (the open bundle's rows vanish); MUST NOT FAIL I1 I2 I3 (still withheld)"],
  machine: [OBSLOG, [
    ["    if (gate.scope === \"member\") return true;",
     "    if (gate.scope === \"member\" && false) return true;"],
    ["    if (gate.scope === \"member\") return () => true;",
     "    if (gate.scope === \"member\" && false) return () => true;"]],
    "MUST FAIL I0 I1 I2 I3 I4b I7 (the machine credential loses rows)"],
  run: [STORE, [
    ["    observations.registerAuthority(\"run\", (run, viewer) => this.aiRunLog({ run, viewer, limit: 1 }).found === true);",
     "    observations.registerAuthority(\"run\", (run, viewer) => true || this.aiRunLog({ run, viewer, limit: 1 }).found === true);"]],
    "MUST FAIL I9b (the delegated run gate); MUST NOT FAIL I9 I4 I4b — the referent this resolver "
    + "DELEGATES rather than resolves is the one most in need of an arm"],
  deny: [OBSLOG, [
    ["    if (gate.scope === \"DENY\" || !row || typeof row !== \"object\") return false;",
     "    if ((gate.scope === \"DENY\" && false) || !row || typeof row !== \"object\") return false;"],
    ["    if (gate.scope === \"DENY\") return () => false;\n    const memo",
     "    if (gate.scope === \"DENY\" && false) return () => false;\n    const memo"]],
    "DECLARED MUST FAIL I5 — see the run's own note if it does not"],
};

const run = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { text: out, code: 0 };
  } catch (e) { return { text: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? -1 }; }
};
const report = (label, r) => {
  const foot = /observation-log: (\d+) pass, (\d+) fail/.exec(r.text);
  const failed = [...r.text.matchAll(/^ {2}FAIL {2}(\w+):/gm)].map((m) => m[1]);
  console.log(`  ${label.padEnd(12)} exit=${String(r.code).padEnd(3)} `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT — the suite did not reach its own tally (report -1, never 0)"}`
    + `  failing: ${failed.length ? failed.join(" ") : "(none)"}`);
  return failed;
};

const want = process.argv[2] || "all";
console.log(`REC-103 negative control · ${new Date().toISOString()}`);
console.log(`store.mjs ${statSync(STORE).size} bytes · sha ${sha(STORE).slice(0, 16)} · observation-log/index.mjs ${statSync(OBSLOG).size} bytes · sha ${sha(OBSLOG).slice(0, 16)}`);

report("BASELINE", run());

for (const [name, [file, edits, declared]] of Object.entries(ARMS)) {
  if (want !== "all" && want !== name) continue;
  const pristine = penPath(file, `pristine-rec103-${name}`);
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const beforeSha = sha(file);
  if (statSync(pristine).size < MIN_BYTES[file])
    throw new Error(`REFUSED: pristine copy for ${name} is ${statSync(pristine).size} bytes, under the floor`);
  let after = before;
  for (const [anchor, repl] of edits) {
    const n = after.split(anchor).length - 1;
    if (n !== 1) throw new Error(`REFUSED: arm ${name}'s anchor occurs ${n} times, not once — an arm that `
      + `patches zero sites or two is a finding about the arm`);
    after = after.replace(anchor, repl);
  }
  writeFileSync(file, after);
  if (sha(file) === beforeSha) throw new Error(`REFUSED: arm ${name} changed no bytes`);
  console.log(`\n  ARM ${name} — ${declared}`);
  report(name, run());
  copyFileSync(pristine, file);
  const ok = sha(file) === beforeSha;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, pristine]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`  restored byte-identically: ${ok && cmpOk ? "YES" : "NO"} `
    + `(sha ${ok ? "match" : "MISMATCH"}, cmp ${cmpOk ? "match" : "MISMATCH"}, ${statSync(file).size} bytes)`);
  if (!ok || !cmpOk) throw new Error(`REFUSED: arm ${name} did not restore — STOP, the tree is dirty`);
  unlinkSync(pristine);
}

report("BASELINE", run());
