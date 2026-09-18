/* REC-86's NEGATIVE CONTROL HARNESS. Declared in `test/narrow.test.mjs`, run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-rec86.mjs            # every arm, in order, baseline first
 *     node test/nc-rec86.mjs wider      # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-rec84.mjs` is its shape, arm for arm, because a second
 * harness idiom would be a second set of rules about what a control proves.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; a BASELINE row that arms nothing; every arm declares BEFORE it runs
 * what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match
 * count that is not exactly 1 is a finding, never a retry); every restore is
 * verified against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded — never
 * `git checkout --`; a surprising green is a finding about the ARM.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* Pristine copies live INSIDE this worktree, in a dot-directory `.gitignore`
   names on its own line — not in the shared scratchpad. */
const SAFE = join(REPO, ".rec86-control-pristine");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/narrow.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /narrow: (\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING tally is -1, never 0 — a module that ended early reached no foot. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           /* `note  ` lines ride along: the suite prints WHICH gate refused the act when
              an arm stops it landing, so the arm's record names what fired. */
           failing: out.split("\n").filter((l) => l.includes("FAIL  ") || l.includes("note  the act"))
             .map((l) => l.trim().slice(0, 400)) };
};

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  inplace: {
    files: [STORE],
    why: "THE 5.8 ARM: the act writes its rows UNDER THE SOURCE READING'S NAME — a narrowing that would move the OLD version's citation. The old reading must not move, so the act must not land",
    mustFail: ["the act lands: a new reading",
               "A NEW READING exists with the same number of legs"],
    /* DECLARATION CORRECTED AFTER THE FIRST RUN, not the assertion: this read "the
       refusal arms (wider, same, sideways, elsewhere, by a machine)", and wider/same/
       sideways went red with it — because they are asked of the NARROWED reading this
       arm prevents from existing, so they answer NO_SUCH_VERSION. They depend on the
       landing; the refusals that do not are the ones that must stay green. */
    mustPass: "the refusals that do not depend on a landed narrowing — a machine, no part, a stray field, id-and-extent, a malformed extent, a later copy, an absent question/reading/leg",
    patch: () => arm(STORE,
      "    let text = Store.#appendFmRows(src.text, \"basis_versions\", [vRow.join(\"\\n\")]);",
      "    const __swap = (r) => r.split(q(nameWritten)).join(q(src.vname));\n"
      + "    gRows.splice(0, gRows.length, ...gRows.map(__swap));\n"
      + "    lRows.splice(0, lRows.length, ...lRows.map(__swap));\n"
      + "    let text = Store.#appendFmRows(src.text, \"basis_versions\", [__swap(vRow.join(\"\\n\"))]);"),
  },
  wider: {
    files: [STORE],
    why: "neuter the NOT_NARROWER gate: a WIDER, the SAME or a SIDEWAYS part is accepted as a narrowing",
    mustFail: ["a narrowing to a WIDER extent is refused BY NAME",
               "the SAME part is refused",
               "a region of a DIFFERENT page is refused"],
    mustPass: "the legal narrowings and every other refusal",
    patch: () => arm(STORE, "    if (relation !== \"narrower\")", "    if (false)"),
  },
  grade: {
    files: [STORE],
    why: "carry the OLD leg's grade onto the narrowed leg — the whole document's A borrowed by a page",
    mustFail: ["THE NARROWED LEG LANDS UNGRADED"],
    mustPass: "the refusal arms",
    patch: () => arm(STORE,
      "        if (i === src.k && (EXTENT_KEYS.has(key) || GRADE_KEYS.has(key))) {",
      "        if (i === src.k && EXTENT_KEYS.has(key)) {"),
  },
  capture: {
    files: [STORE],
    why: "neuter the same-capture comparison: a part of a LATER COPY, or of ANOTHER document, is taken as a narrowing (5.8)",
    mustFail: ["a part of a LATER COPY of the same document is refused",
               "a part of a DIFFERENT document is refused by the same name"],
    mustPass: "the in-capture narrowings, and the wider/same/sideways refusals",
    patch: () => arm(STORE,
      "      if (chosenRow.bundle_id !== src.leg.target || chosenRow.capture_sha !== src.row.capture_sha)",
      "      if (false)"),
  },
  machine: {
    files: [STORE],
    why: "neuter the member fence: a MACHINE credential chooses the part",
    mustFail: ["a MACHINE credential is refused by name"],
    mustPass: "every member path",
    /* RE-ANCHORED AFTER ITS FIRST RUN, and the first run is the finding: the bare
       condition `if (!who || isMachineIdentity(who))` occurs 13 times in store.mjs,
       so the arm reported `ARMED NO (patch matched 13x)` and the suite stayed green —
       an arm that did not arm, caught by the match count rather than believed. The
       anchor now includes the refusal it guards, which occurs exactly once. */
    patch: () => arm(STORE, "    if (!who || isMachineIdentity(who))\n      return refusal(\"NARROW_NOT_A_MEMBER\",",
                            "    if (!who)\n      return refusal(\"NARROW_NOT_A_MEMBER\","),
  },
  unlabelled: {
    files: [STORE],
    why: "the plane's own reading's candidates stop saying they are machine work",
    mustFail: ["EVERY candidate is labelled machine work"],
    mustPass: "the act and its refusals — the label is a property of the READ",
    patch: () => arm(STORE,
      "             content_id: null, mint: Store.#mintLabel(CONTENT_MINTED_BY_PLANE), machine_work: true,",
      "             content_id: null, mint: Store.#mintLabel(CONTENT_MINTED_BY_PLANE), machine_work: false,"),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION: `extentRelation` answers document -> part as DISJOINT, so the one act the ruling licenses is refused",
    mustFail: ["document -> a page is NARROWER",
               "the act lands: a new reading"],
    /* DECLARATION CORRECTED AFTER THE FIRST RUN, for the `inplace` arm's reason: the
       wider/same/sideways arms are asked of a reading this arm stops from landing. */
    mustPass: "the refusals that do not depend on a landed narrowing — a fence tighter than its rule is not a safer fence, and this arm proves the suite can see one",
    patch: () => arm(CHECKS, "  if (ca.kind === 'document') return 'narrower';", "  if (ca.kind === 'document') return 'disjoint';"),
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
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
