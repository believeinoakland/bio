/* D-675's NEGATIVE CONTROL HARNESS. Declared in `test/content-store-param.test.mjs`, run from `bio-plane/`:
 *
 *     node test/nc-d675.mjs              # every arm, in order, baseline first
 *     node test/nc-d675.mjs passthrough  # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite: it EDITS src/index.mjs while it runs. `nc-rec83.mjs`'s shape, copied
 * rather than imported (a harness that shares machinery shares its defects). One arm at a time; a baseline row;
 * every arm declares what MUST fail and what MUST pass BEFORE it runs, and BOTH halves are checked; an arm that
 * does not match its anchor exactly once is a FINDING; every restore is verified by sha256 AND by content against
 * a uniquely-named per-arm pristine copy in a `controlPen` outside the worktree (M0-182), with a byte floor.
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
const SAFE = controlPen("d675");
mkdirSync(SAFE, { recursive: true });
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // index.mjs is far over a megabyte; a restore over a stub must fail loudly.
/* Captured to a buffer, never a pipe read by a wrapper (D-282); a missing tally is -1, never 0. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-store-param.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const lines = out.split("\n");
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: lines.filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           passing: lines.filter((l) => l.includes("PASS  ")).map((l) => l.trim()) };
};
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}
const FORWARD = `if (k !== "token" && k !== "op" && k !== "store") inner.searchParams.set(k, v);`;
const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that tells every-arm-broken from every-arm-working",
    mustFail: [], mustPass: [], patch: () => ({ armed: true, matches: 0 }),
  },
  passthrough: {
    files: [INDEX],
    why: "THE ROW'S OWN ARM — the generic DO forward passes `store` into the store's URL again, which is "
       + "origin/main before D-675; op=content's accept set refuses it by name",
    /* DECLARATION CORRECTED AFTER THE FIRST RUN (2026-09-25), recorded rather than smoothed: the predicate
       refusal was first declared HELD OPEN and it failed — correctly, because with `store` passed through the
       refusal names ["store","where"], not ["where"]. The arm genuinely breaks it, so it moved to mustFail;
       the assertion was not touched. */
    mustFail: ["store=scratch answers THE SCRATCH ROW", "store=bio answers THE BIO ROW",
               "a PREDICATE beside store=scratch is still refused, and ONLY the predicate is named"],
    mustPass: ["a namespace that does not exist is still refused at the front door",
               "no store= at all still addresses bio"],
    patch: () => arm(INDEX, FORWARD, `if (k !== "token" && k !== "op") inner.searchParams.set(k, v);`),
  },
  swallow: {
    files: [INDEX],
    why: "THE WRONG FIX — the forward drops EVERY caller parameter but `id`, which also makes store= "
       + "answerable but silently discards a predicate the caller believes was applied",
    mustFail: ["a PREDICATE beside store=scratch is still refused, and ONLY the predicate is named"],
    mustPass: ["store=scratch answers THE SCRATCH ROW", "store=bio answers THE BIO ROW"],
    patch: () => arm(INDEX, FORWARD, `if (k === "id") inner.searchParams.set(k, v);`),
  },
  onestore: {
    files: [INDEX],
    why: "every non-probe class is scoped to `bio` whatever store= says, so both seeds share one Durable "
       + "Object — an answer with no refusal would then prove nothing about which namespace was read",
    mustFail: ["the SCRATCH row is not in bio", "and the BIO row is not in scratch"],
    mustPass: ["store=bio answers THE BIO ROW", "a PREDICATE beside store=scratch is still refused"],
    patch: () => arm(INDEX, `return { name: asked === SCRATCH ? SCRATCH : "bio" };`, `return { name: "bio" };`),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass.length ? a.mustPass.join(" | ") : "(everything)"}`);
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
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
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
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const held = a.mustPass.filter((m) => r.passing.some((l) => l.includes(m)));
    const ok = r.pass >= 0 && hit.length === a.mustFail.length && held.length === a.mustPass.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s), `
              + `${held.length}/${a.mustPass.length} held open, ${r.fail} total failing`);
    if (!ok) {
      finding++;
      for (const m of a.mustFail.filter((x) => !r.failing.some((l) => l.includes(x))))
        console.log(`  MISSING    declared failure did NOT occur: ${m}`);
      for (const m of a.mustPass.filter((x) => !r.passing.some((l) => l.includes(x))))
        console.log(`  BROKE      declared held-open assertion did NOT pass: ${m}`);
    }
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(finding ? 1 : 0);
