/* D-710's NEGATIVE CONTROL HARNESS. Declared in `test/content-chain-kind.test.mjs`'s `NEGATIVE CONTROL:`
 * header, run from `bio-plane/` in one step:
 *
 *     node test/nc-d710.mjs             # every arm, in order, baseline first
 *     node test/nc-d710.mjs laststep    # one arm
 *
 * `nc-d686.mjs`'s shape and rules, a deliberate COPY (a harness that shares machinery with another item's
 * harness shares that harness's defects): NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs; ONE
 * ARM AT A TIME; a BASELINE row; every arm DECLARES before it runs what MUST fail and what MUST NOT; every arm
 * reports whether it ARMED (a match count that is not exactly 1 is a FINDING); every restore is verified
 * against a uniquely-named per-arm pristine copy by sha256 AND by content, with the byte count printed and a
 * minimum guarded; a surprising green is a finding about the ARM.
 *
 * THE ROW'S NAMED CONTROL ("the old last-step answer (`ocr`) fails by name", BOB #35 09:35Z) is `nc-d686.mjs`'s
 * `lastkind` arm: 591ecfa6 built `mixed` on D-686's branch before this row ran, and D-710 re-runs that arm
 * rather than copy it. THIS harness controls what D-710 adds on top: `unscopedfirst` (an unscoped step before
 * scoped parts answers undetermined, not the parts' kind), `endasnull` (capture_text's KEEP, through the op),
 * and `overstrict` (the guard spelled differently and correctly must PASS).
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
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32), through the one spelling. */
const SAFE = controlPen("d710");
mkdirSync(SAFE, { recursive: true });


const STORE = join(PLANE, "src/store.mjs");
const SCHEMA = join(PLANE, "src/schema.mjs");
const TEXTCHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

/* Each suite captured whole, not through a pipe — D-282. A MISSING tally is -1, never 0. */
const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { file, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           tail: m ? [] : out.trimEnd().split("\n").slice(-6) };
};
const SUITES = ["test/content-chain-kind.test.mjs", "test/content-arm.test.mjs"];

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  unscopedfirst: {
    files: [TEXTCHAIN],
    why: "D-710's GUARD REMOVED: a whole-document unit whose chain has an unscoped step BEFORE scoped parts is "
       + "answered from the named pages alone, so `[layer, ocr(p1), ocr(p2)]` reads `ocr` though pages only "
       + "the layer read are uncounted",
    mustFail: ["D-710: an unscoped step BEFORE the parts leaves pages only it read uncounted"],
    mustPass: "every other arm — the mixed and one-kind answers of 591ecfa6, the page answers, capture_text",
    patch: () => arm(TEXTCHAIN, "        && derivations.findIndex((s) => extentOf(s) === \"all\") < lastScoped) return null;",
                                "        && derivations.findIndex((s) => extentOf(s) === \"all\") < lastScoped) {}"),
  },
  endasnull: {
    files: [STORE],
    why: "THE capture_text WRITER ASKS ABOUT NO PAGE instead of `CHAIN_LAST` — the column BOB #35 KEPT as the "
       + "document-level last step (09:05Z) silently becomes the unit answer and reads `mixed`",
    mustFail: ["ARMED + KEPT: the mixed document's three capture_text rows read the chain's last step"],
    mustPass: "every content arm — the content writer and the recompute are untouched",
    patch: () => arm(STORE, "chainKindFor(chain, CHAIN_LAST) || \"layer\"", "chainKindFor(chain) || \"layer\""),
  },
  overstrict: {
    files: [TEXTCHAIN],
    why: "OVER-STRICTNESS: the guard spelled as 'some unscoped step sits before some scoped step' by a forward "
       + "scan — a different, correct spelling. Everything MUST PASS",
    mustFail: [], mustPass: "everything", passArm: true,
    patch: () => arm(TEXTCHAIN,
      "    if (derivations.findIndex((s) => extentOf(s) === \"all\") > -1\n"
    + "        && derivations.findIndex((s) => extentOf(s) === \"all\") < lastScoped) return null;",
      "    let seenAll = false;\n"
    + "    for (const [i, s] of derivations.entries()) { if (extentOf(s) === \"all\") seenAll = true;"
    + " else if (seenAll && i <= lastScoped) return null; }"),
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
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed) { console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`); finding++; }
  const results = SUITES.map(runSuite);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && same ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && same)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  let fails = 0;
  const failing = [];
  for (const r of results) {
    console.log(`  RESULT     ${r.file}: ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`
              );
    for (const l of r.failing) console.log(`             ${l}`);
    for (const l of r.tail) console.log(`             NO FOOT | ${l}`);
    fails += Math.max(r.fail, 0) + (r.pass < 0 ? 1 : 0);
    failing.push(...r.failing);
  }
  let ok;
  if (name === "baseline" || a.passArm) {
    ok = fails === 0 && results.every((r) => r.pass > 0);
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
    ok = fails > 0 && hit.length === a.mustFail.length;
    for (const m of a.mustFail.filter((x) => !failing.some((l) => l.includes(x))))
      console.log(`  MISSING    declared failure did NOT occur: ${m}`);
  }
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  if (!ok) finding++;
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);

/* MEASURED 2026-09-25 by D-710's worker, on the final sources (stacked on land/worker/D-686 @ 526cc17f):
 *   baseline       content-chain-kind 52/0 · content-arm 110/0                                AS DECLARED
 *   unscopedfirst  content-chain-kind 51/1 (1b's D-710 undetermined arm, by name) · 110/0     AS DECLARED
 *   endasnull      content-chain-kind 51/1 (section 3's capture_text KEPT arm, by name) · 110/0  AS DECLARED
 *   overstrict     content-chain-kind 52/0 · content-arm 110/0                                AS DECLARED
 * Every restore byte-identical by sha256 and content (textchain.mjs 96771 bytes, store.mjs 3475280).
 * nc-d686.mjs re-run on the same sources: all eight arms AS DECLARED; lastkind 48/4. */
