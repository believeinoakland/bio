/* D-394's NEGATIVE CONTROL HARNESS. Declared in `test/versionnotice.test.mjs`, run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-d394.mjs             # every arm, in order, baseline first
 *     node test/nc-d394.mjs persist     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-rec86.mjs` is its shape, with ONE addition: an arm
 * declares the assertions that MUST NOT fail by name, and a verdict requires
 * both halves — an arm that takes down more than it declared is NOT AS DECLARED.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; the patch's anchor must match EXACTLY ONCE or the arm reports it
 * did not arm; every edited file is copied first to a uniquely-named per-arm
 * pristine copy in a pen OUTSIDE this worktree (`controlPen("d394")` from
 * `test/pen.mjs`; M0-182, BOB #32), and restored from it and verified by sha256 AND by
 * byte comparison, with the byte count printed and a minimum guarded. Never
 * `git checkout --`. A missing tally is -1, never 0.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("d394");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/versionnotice.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /versionnotice: (\d+) pass, (\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};

function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The assertions that carry each claim, by the label prefix the suite prints. */
const CERTAINTY = ["CERTAINTY: ", "and it names the NEWEST capture", "CERTAINTY holds where the passage is not matched",
                   "a re-capture into the SAME bundle"];
const WRITTEN = ["NOTHING WRITTEN (the counters)", "NOTHING WRITTEN (the whole store)"];
const SILENCE = ["a chain of one: no_newer_capture", "NO ADDRESS: the chain could not be read"];
const LABEL = ["THE CANDIDATE IS LABELLED A CANDIDATE"];

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: [], patch: () => ({ armed: true, matches: 0 }),
  },
  persist: {
    files: [STORE],
    why: "THE LIAR THE ROW NAMES FIRST: the read PERSISTS its candidate — mints a content row at the matched extent of the newer capture",
    mustFail: WRITTEN,
    mustPass: [...CERTAINTY, ...SILENCE, ...LABEL],
    patch: () => arm(STORE,
      "      const test = this.#extentTestAcross(extent, v.capture_sha);\n",
      "      const test = this.#extentTestAcross(extent, v.capture_sha);\n"
      + "      if (test.holds) this.mintContent({ bundleId: v.bundle_id, captureSha: v.capture_sha, extent });\n"),
  },
  nochain: {
    files: [STORE],
    why: "DROP THE NEWER-VERSION CHECK: every chain is read as having nothing after the cited capture",
    mustFail: CERTAINTY,
    mustPass: [...WRITTEN, ...SILENCE],
    patch: () => arm(STORE, "      const after = at.total - 1 - at.at_index;", "      const after = 0;"),
  },
  unreadlie: {
    files: [STORE],
    why: "'no newer version' answered for a chain that was NEVER READ — the lie that reads like earned silence",
    mustFail: ["NO ADDRESS: the chain could not be read"],
    mustPass: [...CERTAINTY, ...WRITTEN, "a chain of one: no_newer_capture"],
    patch: () => arm(STORE,
      "    const newer = newerBySha.size > 0 ? true : allRead ? false : null;",
      "    const newer = newerBySha.size > 0 ? true : false;"),
  },
  identity: {
    files: [STORE],
    why: "a match is called THE SAME PASSAGE: the candidate stops being labelled a candidate",
    mustFail: LABEL,
    mustPass: [...CERTAINTY, ...WRITTEN, ...SILENCE],
    patch: () => arm(STORE,
      "               candidate_only: true, identity: \"not_established\",",
      "               candidate_only: false, identity: \"same_passage\","),
  },
  unheld: {
    files: [STORE],
    why: "an UNHELD bound is read as a fit — the checker's permissiveness turned into a claim",
    mustFail: ["UNDETERMINED, bound NOT HELD"],
    mustPass: [...CERTAINTY, ...WRITTEN, ...SILENCE, "page 1 exists in the newest capture's page set"],
    patch: () => arm(STORE, "    const unheld = Store.#extentBoundUnheld(extent, ctx);", "    const unheld = null;"),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: a positive extent test is never admitted, so a real candidate is withheld",
    mustFail: ["page 1 exists in the newest capture's page set"],
    mustPass: [...CERTAINTY, ...WRITTEN, ...SILENCE, "the whole document is at the same extent",
               "UNDETERMINED, extent OUTSIDE", "UNDETERMINED, bound NOT HELD"],
    patch: () => arm(STORE,
      "    return { holds: true, reason: \"extent_in_newer_capture\",",
      "    return { holds: false, reason: \"extent_in_newer_capture\","),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2] || null;
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass.length ? a.mustPass.join(" | ") : "everything"}`);
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
    const wrong = a.mustPass.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length && wrong.length === 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
              + `${wrong.length} must-pass assertion(s) failed${wrong.length ? ` (${wrong.join(" | ")})` : ""}, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
