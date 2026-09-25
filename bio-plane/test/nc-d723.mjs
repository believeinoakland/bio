/* D-723's NEGATIVE CONTROL HARNESS. Declared in `test/content-chain-kind.test.mjs`'s `NEGATIVE CONTROL:`
 * header, run from `bio-plane/` in one step:
 *
 *     node test/nc-d723.mjs                # every arm, in order, baseline first
 *     node test/nc-d723.mjs lastappended   # one arm
 *
 * `nc-d710.mjs`'s shape and rules, a deliberate COPY (a harness that shares machinery with another item's
 * harness shares that harness's defects): NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs; ONE
 * ARM AT A TIME; a BASELINE row; every arm DECLARES before it runs what MUST fail and what MUST NOT; every arm
 * reports whether it ARMED (a match count that is not exactly 1 is a FINDING); every restore is verified
 * against a uniquely-named per-arm pristine copy by sha256 AND by content, with the byte count printed and a
 * minimum guarded; a surprising green is a finding about the ARM.
 *
 * THE ROW'S NAMED CONTROL (BOB #36 11:05Z: "restore the last-appended rule, and the shared-page arm fails by
 * name") is `lastappended`. `stepblind` breaks what makes a part ONE reading (`pixels` then `ocr`), `unreadafter`
 * the undetermined answer for an unreadable extent behind a covering part, and `overstrict` spells the page walk
 * differently and correctly and must PASS. */
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
const SAFE = controlPen("d723");
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

const SHARED_1B = "D-723: a page two parts share (D-635) reads `mixed`";
const SHARED_OP = "D-723: the page both parts read (D-635) reads `mixed` through the op";

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  lastappended: {
    files: [TEXTCHAIN],
    why: "THE ROW'S ARM: D-686's 09:05Z page rule restored — the first covering step from the end answers, so a "
       + "page two parts share reads the part appended LAST (`ocr`) and the layer's text is called machine-read",
    mustFail: [SHARED_1B, "every row is RECOMPUTED per unit", SHARED_OP,
               "the units `content:ocr`'s equality selects are the OCR-only page alone"],
    mustPass: "every partitioned-page arm, the whole-document `mixed` arms, capture_text's KEPT arm",
    patch: () => arm(TEXTCHAIN, "    if (ext.includes(page) && !byPart.has(key)) byPart.set(key, derivations[i].step);",
                                "    if (ext.includes(page)) return derivations[i].step;"),
  },
  stepblind: {
    files: [TEXTCHAIN],
    why: "EVERY STEP ITS OWN PART: a part's `pixels` and `ocr` are compared as two readings, so an OCR'd page "
       + "reads `mixed` — the over-reach of the rule this row builds",
    mustFail: ["D-723: a part's own steps are ONE reading", "the OCR'd page of the same document reads `ocr`"],
    mustPass: "the text-layer page arms (one step, one part)",
    patch: () => arm(TEXTCHAIN, "    const key = partKeyOf(derivations[i]);", "    const key = i;"),
  },
  unreadafter: {
    files: [TEXTCHAIN],
    why: "AN UNREADABLE EXTENT BEHIND A COVERING PART IS SKIPPED: it could be a second part covering the page, "
       + "so skipping it answers a kind the record cannot support",
    mustFail: ["D-723: an unreadable extent earlier in the chain than a covering part could be a second part"],
    mustPass: "every other arm",
    patch: () => arm(TEXTCHAIN, "    if (ext === \"unreadable\") return null;\n    if (ext === \"all\") {",
                                "    if (ext === \"unreadable\") { if (byPart.size) continue; return null; }\n    if (ext === \"all\") {"),
  },
  overstrict: {
    files: [TEXTCHAIN],
    why: "OVER-STRICTNESS: the per-part page walk spelled as a FORWARD scan over the steps after the last "
       + "unscoped one — a different, correct spelling. Everything MUST PASS",
    mustFail: [], mustPass: "everything", passArm: true,
    patch: () => arm(TEXTCHAIN, "  const byPart = new Map();\n  for (let i = derivations.length - 1; i >= 0; i--) {\n    const ext = extentOf(derivations[i]);\n    if (ext === \"unreadable\") return null;\n    if (ext === \"all\") {\n      if (!byPart.size) return derivations[i].step;\n      break;\n    }\n    const key = partKeyOf(derivations[i]);\n    if (ext.includes(page) && !byPart.has(key)) byPart.set(key, derivations[i].step);\n  }\n  if (!byPart.size) return null;\n  const partKinds = new Set(byPart.values());\n  return partKinds.size === 1 ? [...partKinds][0] : CHAIN_KIND_MIXED;",
      "  const lastAll = derivations.findLastIndex((s) => extentOf(s) === \"all\");\n  const tail = derivations.slice(lastAll + 1);\n  if (tail.some((s) => extentOf(s) === \"unreadable\")) return null;\n  const covering = tail.filter((s) => extentOf(s).includes(page));\n  if (!covering.length) return lastAll > -1 ? derivations[lastAll].step : null;\n  const lastOf = new Map();\n  for (const s of covering) lastOf.set(partKeyOf(s), s.step);\n  const ks = new Set(lastOf.values());\n  return ks.size === 1 ? [...ks][0] : CHAIN_KIND_MIXED;"),
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

/* MEASURED 2026-09-25 by D-723's worker, on the final sources (stacked on land/worker/D-710 @ f34c4c9f),
 * content-chain-kind / content-arm, pass/fail:
 *   baseline      57/0 · 110/0   AS DECLARED
 *   lastappended  49/8 · 110/0   AS DECLARED  (THE ROW'S ARM: 1b's shared page, 2b's recompute, section 3's
 *                                              shared page and both `content:ocr` arms, by name)
 *   stepblind     48/9 · 106/4   AS DECLARED  (every OCR'd page reads `mixed`; content-arm's OCR arms too)
 *   unreadafter   56/1 · 110/0   AS DECLARED  (1b's D-723 undetermined arm alone)
 *   overstrict    57/0 · 110/0   AS DECLARED
 * Every restore byte-identical by sha256 and content (textchain.mjs 98084 bytes). nc-d686.mjs (with
 * `wholechain` and `overstrict` re-anchored) and nc-d710.mjs re-run on the same sources: every arm AS DECLARED;
 * lastkind 51/6, wholechain 40/17, generated 43/14. */
