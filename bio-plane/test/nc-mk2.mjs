/* MK-2's NEGATIVE CONTROL HARNESS. Declared in `test/testimonyaxis.test.mjs`, run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-mk2.mjs              # every arm, in order, baseline first
 *     node test/nc-mk2.mjs capwrite     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-mk1.mjs` is its shape, arm for arm.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; a BASELINE row that arms nothing; every arm declares BEFORE it runs
 * what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match
 * count other than the one declared is a finding, never a retry); every restore
 * is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded — never
 * `git checkout --`; a surprising green is a finding about the ARM.
 *
 * ONE ARM IS A MEASUREMENT RATHER THAN A BREAK: `preitem` runs
 * `test/mk2-pristine-probe.mjs` over the working tree AND over the source MK-2
 * is merged onto (`$BASE` below, extracted into the pen), removes the
 * new tree's `testimony` keys, and requires the two answers BYTE-IDENTICAL —
 * the over-strictness claim ("an ordinary basis reads exactly as before") as a
 * comparison against the thing itself rather than a figure typed into a suite.
 *
 * The pristine copies live in `$MK2_PEN` (default /tmp/mk2-pen-<checkout hash>), a
 * directory only this item uses — not the shared scratchpad, and not the tree.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pen is keyed by THIS CHECKOUT's path (a WORKER.md rule: a generic /tmp
   name is an identity nobody owns — two worktrees running this harness would
   otherwise share pristine copies). It read "/tmp/conduct4-mk2/pen" until the
   resumed MK-2 run of 2026-09-18. */
const SAFE = process.env.MK2_PEN
  || join("/tmp", `mk2-pen-${createHash("sha256").update(REPO).digest("hex").slice(0, 12)}`);
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
/* THE PRE-ITEM SOURCE: the origin/main commit MK-2 is merged onto, i.e. main
   WITHOUT this item. It read f426f519 while the WIP sat on that base; the
   resumed run merged onto 27ad8b4f (MK-4 and REC-130 landed between), and a
   comparison against the older base would attribute THEIR changes to this
   item. Override with MK2_BASE=<sha> after a further merge. */
const BASE = process.env.MK2_BASE || "27ad8b4f";
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/testimonyaxis.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /\n(\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING tally is -1, never 0 — a module that ended early reached no foot. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};
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
    files: [STORE], why: "nothing armed — the suite must be green on the tree as it is",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: "0 (nothing)" }),
  },
  /* THE ROW'S FIRST ARM, in its words: the testimony cap removed -> a testimony
     leg grades above D. All three layers of the cap at once — the write's
     letter check, the write's registry comparison, and the read cap — because a
     leg can only GRADE above D when none of them stands. */
  cap: {
    files: [CHECKS, STORE],
    why: "THE TESTIMONY CAP REMOVED, every layer: a testimony letter above D lands at the write AND is read as written",
    mustFail: ["ANY testimony grade other than D", "nothing was written: none of those questions exists to grade above D",
               "A REPLAYED revision holding testimony B"],
    mustPass: "a leg citing the observation at testimony D (source testimony) is ACCEPTED",
    patch: () => arm([
      [CHECKS, "  if (leg.grade !== TESTIMONY_GRADE) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade}: a member's",
               "  if (false) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade}: a member's"],
      [CHECKS, "  if (leg.grade !== observation.grade) {", "  if (false) {"],
      [STORE, "          : axis === \"testimony\" && stated != null && stated !== TESTIMONY_GRADE\n",
              "          : false\n"]]),
  },
  /* Each layer ALONE, so each is shown load-bearing on its own. */
  capwrite: {
    files: [CHECKS],
    why: "the write's letter check and registry comparison removed: a testimony B leg lands (the read cap still reads it at D)",
    mustFail: ["ANY testimony grade other than D", "nothing was written: none of those questions exists to grade above D",
               "a leg claiming the observation at testimony C because it was attested"],
    mustPass: "A REPLAYED revision holding testimony B is admitted",
    patch: () => arm([
      [CHECKS, "  if (leg.grade !== TESTIMONY_GRADE) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade}: a member's",
               "  if (false) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade}: a member's"],
      [CHECKS, "  if (leg.grade !== observation.grade) {", "  if (false) {"]]),
  },
  capread: {
    files: [STORE],
    why: "the READ cap removed: a replayed row carrying testimony B is read at B",
    mustFail: ["A REPLAYED revision holding testimony B"],
    mustPass: "ANY testimony grade other than D — refused at the write",
    patch: () => arm([[STORE, "          : axis === \"testimony\" && stated != null && stated !== TESTIMONY_GRADE\n",
                              "          : false\n"]]),
  },
  /* THE ROW'S SECOND ARM: attestation allowed to raise it. No op lets a second
     member co-sign another member's observation (op=attesttext refuses one:
     NO_READING), so the forbidden rule is armed at the one place it could live —
     the registry — as "another leg already resting on this observation counts as
     agreement and raises it". */
  attest: {
    files: [STORE],
    why: "a second member's agreement RAISES the observation: the registry counts legs already resting on it and lifts the letter",
    mustFail: ["AFTER sam's attestation, the registry still holds testimony D", "while the same leg at D is accepted",
               "TWO WITNESSES"],
    mustPass: "a leg citing the observation at testimony D (source testimony) is ACCEPTED — the first, before anyone agreed",
    patch: () => arm([[STORE, "          mode: \"value\", grade: TESTIMONY_GRADE, authored: e.authored,",
      "          mode: \"value\", grade: this.#one(\"SELECT count(*) AS c FROM inquiry_basis WHERE target_id=? AND grade_axis='testimony'\", bundleId).c ? \"C\" : TESTIMONY_GRADE, authored: e.authored,"]]),
  },
  /* THE LIAR, the row's third: the capture axis reused with a label. Two
     places it could enter, each armed alone. */
  /* FIRST RUN, 2026-09-18, NOT AS DECLARED AND IT IS A FINDING ABOUT THE ARM:
     this arm first declared "capture is NOT dragged to D" as well, and that
     stayed GREEN — because MK-1's capture bound for an authored document
     (CAPTURE_AXIS_AUTHORED, a null ceiling) caps the smuggled leg to NOTHING on
     the capture axis, so the liar in the arithmetic is caught by the NAMING
     (the leg's reason changes) while the letter is held by a second defence.
     Declared now as what it is; `liarfull` removes both defences and shows the
     second assertion bite. */
  liar: {
    files: [STORE],
    why: "THE LIAR in the ARITHMETIC: a testimony leg is counted in the CAPTURE population — capture with a label (MK-1's null capture bound still holds the letter)",
    mustFail: ["THE LIAR REFUSED IN THE ARITHMETIC"],
    mustPass: "capture is NOT dragged to D — held by MK-1's CAPTURE_AXIS_AUTHORED bound, a second defence",
    patch: () => arm([[STORE, "        const onAxis = leg.grade_axis === axis;",
                              "        const onAxis = leg.grade_axis === axis || (axis === \"capture\" && leg.grade_axis === \"testimony\");"]]),
  },
  liarfull: {
    files: [STORE],
    why: "THE LIAR with MK-1's authored capture bound ALSO removed: the observation counts as a capture AND its testimony leg joins the capture population",
    mustFail: ["THE LIAR REFUSED IN THE ARITHMETIC", "capture is NOT dragged to D"],
    mustPass: "every write refusal (the write reads neither line)",
    patch: () => arm([[STORE, "        const onAxis = leg.grade_axis === axis;",
                              "        const onAxis = leg.grade_axis === axis || (axis === \"capture\" && leg.grade_axis === \"testimony\");"],
                      [STORE, "      if (r.authored === 1) { e.authored++; continue; }",
                              "      if (false) { e.authored++; continue; }"]]),
  },
  liarwrite: {
    files: [CHECKS],
    why: "THE LIAR at the WRITE: the named refusal of a capture grade on an observation removed",
    mustFail: ["ANY capture grade on a leg citing the observation"],
    mustPass: "every testimony-axis refusal",
    patch: () => arm([[CHECKS, "  if (leg.grade_axis === 'capture' && targetType === 'information' && observation) {",
                               "  if (false) {"]]),
  },
  notauthored: {
    files: [CHECKS],
    why: "testimony on a document that is NOT an observation admitted — a captured source passing for a member's word",
    mustFail: ["testimony on a document that is NOT an observation"],
    mustPass: "every other refusal",
    patch: () => arm([[CHECKS, "  if (!observation) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade for ${target}, which is not",
                               "  if (false) {\n    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade for ${target}, which is not"]]),
  },
  unfrozen: {
    files: [STORE],
    why: "the case freezes only capture and connection — a case resting on a member's word says nothing about it",
    mustFail: ["THE CASE RESTING ON TESTIMONY", "the member's frozen bytes carry the same three rows"],
    mustPass: "OVER-STRICTNESS: an ORDINARY case freezes exactly the two rows",
    patch: () => arm([[STORE, "      axis !== \"testimony\" || (pair[axis] && pair[axis].state !== \"unrated\"));",
                              "      axis !== \"testimony\");"]]),
  },
  /* FIRST RUN, 2026-09-18, NOT AS DECLARED — MY DECLARATION WAS WRONG, not the
     subject: it named "testimony row REMOVED is refused", but a member with the
     testimony row removed HAS two rows, which the old predicate still admits, so
     that refusal still fires. What the old predicate loses is every member with
     MORE than two rows — the three-row member, and the malformed four-row ones
     the ceremony exists to refuse. Declared now as that. */
  pair2: {
    files: [CHECKS],
    why: "the case-member predicate back to `length === 2` — a member with more than two frozen rows is not a case member, and the ceremony never runs over it",
    mustFail: ["IS a case member to the catalogue", "a row for an axis this record does not measure is refused",
               "a second testimony row is refused"],
    mustPass: "the frozen rows of an ordinary case",
    patch: () => arm([[CHECKS, "  return Array.isArray(s) && s.length >= 2\n", "  return Array.isArray(s) && s.length === 2\n"]]),
  },
  /* THE OVER-STRICTNESS DIRECTION — a fence tighter than its rule.
     FIRST RUN, 2026-09-18, NOT AS DECLARED AND THE ARM WAS THE DEFECT: the first
     draft applied the READ cap to the capture axis too, and stayed green (51/0),
     because a capture leg with a registry entry takes the capture bound's branch
     first and never reaches the testimony cap — an arm that armed and could not
     be honoured. Replaced by two arms at the WRITE, where tightening is real. */
  overstrict: {
    files: [CHECKS],
    why: "OVER-STRICTNESS: the capture-grade refusal applied to EVERY document, not only an observation — an ordinary capture leg refused",
    mustFail: ["OVER-STRICTNESS: an ordinary capture leg (the uploaded document", "OVER-STRICTNESS PIN: an ordinary capture leg grades EXACTLY as before"],
    mustPass: "every refusal of a leg on the observation",
    patch: () => arm([[CHECKS, "  if (leg.grade_axis === 'capture' && targetType === 'information' && observation) {",
                               "  if (leg.grade_axis === 'capture' && targetType === 'information') {"]]),
  },
  overconn: {
    files: [CHECKS],
    why: "OVER-STRICTNESS: a CONNECTION-axis grade on an observation refused — a refusal §7 does not list",
    mustFail: ["OVER-STRICTNESS: a CONNECTION-axis testimony D on the observation is NOT refused"],
    mustPass: "every §7 refusal",
    patch: () => arm([[CHECKS, "  if (leg.grade_axis !== 'testimony') return;\n",
                               "  if (leg.grade_axis !== 'testimony') { if (observation) findings.push(f('C-2.8', 'error', 'overstrict', null, 'testimony-overstrict')); return; }\n"]]),
  },
};

/* `preitem` — THE MEASUREMENT against the pre-item source. */
function preitem() {
  console.log(`\n===== ARM preitem (a MEASUREMENT, not a break) =====`);
  console.log(`  WHY        an ordinary basis must answer BYTE-IDENTICALLY to the source MK-2 was built on (${BASE}), testimony keys removed`);
  /* Keyed by BASE: the extraction is cached, and a cache that outlives a
     change of base would compare against the wrong source while naming the
     right sha. */
  const root = join(SAFE, `pristine-${BASE}`);
  if (!existsSync(join(root, "bio-plane", "src", "index.mjs"))) {
    mkdirSync(root, { recursive: true });
    const tar = execFileSync("git", ["-C", REPO, "archive", BASE, "bio-plane/src", "bio-plane/checks", "docprofile", "jurisdictions"],
      { maxBuffer: 256 * 1024 * 1024 });
    execFileSync("tar", ["-x", "-C", root], { input: tar });
  }
  const probe = (planeRoot) => {
    const r = spawnSync(process.execPath, ["test/mk2-pristine-probe.mjs", ...(planeRoot ? [planeRoot] : [])],
      { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    try { return JSON.parse((r.stdout || "").trim().split("\n").pop()); } catch { return { unreadable: (r.stdout || "").slice(0, 200) }; }
  };
  const before = probe(join(root, "bio-plane"));
  const after = probe(null);
  for (const s of Object.values(after.strength || {})) if (s && typeof s === "object") delete s.testimony;
  const a = JSON.stringify(before), b = JSON.stringify(after);
  const nonEmpty = !before.threw && !after.threw && before.strength && Object.keys(before.strength).length === 6
    && typeof before.frozenBlock === "string" && Array.isArray(before.publishStrength);
  console.log(`  CORPUS     ${Object.keys(before.strength || {}).length} inquiries, earnedbasis over 2 documents, 1 published case; ${a.length} vs ${b.length} bytes`);
  console.log(`  RESULT     ${a === b ? "BYTE-IDENTICAL" : "DIFFERENT"}${nonEmpty ? "" : " — BUT THE CORPUS IS EMPTY OR THE PROBE THREW, so this proves nothing"}`);
  if (a !== b) for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { console.log(`  FIRST DIFF  before …${a.slice(Math.max(0, i - 120), i + 120)}…\n              after  …${b.slice(Math.max(0, i - 120), i + 120)}…`); break; }
  const ok = a === b && nonEmpty;
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  return ok;
}

const want = process.argv[2] || null;
const names = want ? [want] : [...Object.keys(ARMS), "preitem"];
if (want && !ARMS[want] && want !== "preitem") { console.error(`unknown arm '${want}'. arms: ${[...Object.keys(ARMS), "preitem"].join(", ")}`); process.exit(2); }
let finding = 0;
for (const name of names) {
  if (name === "preitem") { if (!preitem()) finding++; continue; }
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
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
