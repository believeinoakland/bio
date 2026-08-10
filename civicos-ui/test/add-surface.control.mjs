#!/usr/bin/env node
/* add-surface.control.mjs — UI-54'S NEGATIVE CONTROL DRIVER (DEC-51).
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs and
 * `civicos-ui/test/run.mjs` discovers `*.test.mjs`; a driver the harness picked
 * up would mutate `app.html` underneath every other suite. UI-42's
 * `version-review.control.mjs` set the shape and UI-53's followed it; this is
 * the same shape again.
 *
 *     node civicos-ui/test/add-surface.control.mjs
 *
 * IT HOLDS NO COPY OF THE RECORD'S SENTENCE, AND THAT IS NOT TIDINESS — IT IS
 * THE SUBJECT. Arm 2's whole point is that a hand-typed copy of `op=acquire`'s
 * note agrees with the plane at zero cost. A driver that typed the note out to
 * plant it would BE that copy, sitting in the tree the sweep guards, and
 * detector (C) would red the suite forever until somebody weakened it. So every
 * arm that needs the record's words IMPORTS them and serialises them into the
 * patch at run time — which also keeps each arm a function of the enforced
 * ceiling, so they still fire the day the doctrine moves.
 *
 * THE PRACTICES, each of which this estate has paid for:
 *   - EACH ARM IS ARMED ALONE, every other defence held open.
 *   - THERE IS A BASELINE ARM that patches NOTHING and must come back GREEN.
 *   - EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS: RED or GREEN, and for a
 *     RED arm the text the failure must contain. A surprising GREEN is a FINDING
 *     ABOUT THE ARM and is printed as one.
 *   - EVERY PATCH IS ASSERTED TO HAVE ARMED: the anchor must occur EXACTLY ONCE
 *     and the bytes must differ afterwards.
 *   - THE PEN IS INSIDE THIS WORKTREE (`.ui54-harness/`), never a shared
 *     scratchpad two sessions can collide in.
 *
 * ------------------------------------------------------------ RESULTS, RUN
 *
 * RUN 2026-08-10 in worktree `agent-afd442fede94e63fe`. FIVE arms, each armed
 * ALONE; every restore verified by sha256 AND `cmp` against two independent
 * pristine copies, byte counts printed and floored.
 * FINAL: 5 arms, 5 AS DECLARED, 0 not. Both watched files came back
 * byte-identical.
 *
 *   (1) THE ARM THIS ITEM EXISTS FOR — `addCaptureNote` drops the note's last
 *       clause, the one describing CO-ATTESTATION, which is the tidy any careful
 *       reader reaches for because the act is unavailable at this surface.
 *       DECLARED: RED, naming DEC-51's whole-not-split ruling. ACTUAL: RED —
 *       exit 1, failing at *"DEC-51 — WHOLE, NOT SPLIT: the note reaches the
 *       member entire. A rendering that is merely MOST of it is the split Bob
 *       refused"*. (The suite is FAIL-FAST — `ok` calls `process.exit(1)` on the
 *       first failure — so it reports ONE and stops, and no pass tally is
 *       printed under any RED arm. That is stated rather than inferred.)
 *   (2) THE HAND COPY — the suite's expectation is repointed from the plane's
 *       export to a literal carrying exactly the same characters. Every §3a
 *       assertion stays GREEN under it, which is the zero-cost agreement stated
 *       as a measurement rather than as a worry. DECLARED: RED at the sweep.
 *       ACTUAL: RED — the run reaches the foot of the file and detector (C)
 *       names the file: *"NOR DOES ANY FILE UNDER civicos-ui/ HOLD A WHOLE
 *       PUBLICATION AS A LITERAL"*.
 *   (3) A SURFACE-COMPUTED GRADE LETTER RETURNS — `addCaptureNote` prefixes the
 *       plane's sentence with a letter this surface derived. UI-32's removal
 *       stands and rendering the plane's sentence does not reopen it. DECLARED:
 *       RED at the assertion that NAMES UI-32. ACTUAL: RED — *"UI-32 STANDS:
 *       the rendering states no grade letter this surface derived"*, reached
 *       before the string-for-string equality because the assertions are ordered
 *       for exactly that reason.
 *   (3b) OVER-STRICTNESS, THE SAME LETTER IN A CODE COMMENT beside the renderer.
 *       DECLARED: GREEN. ACTUAL: GREEN — 167/167. The rule is about what a
 *       MEMBER READS; a fence tighter than its rule is an undeclared interface
 *       change wearing the costume of caution, and this estate treats that as
 *       the worse defect because a guard that refuses correct work gets switched
 *       off.
 *   (4) BASELINE — no patch at all. DECLARED: GREEN. ACTUAL: GREEN — 167/167.
 *       Without this row, every arm failing for the wrong reason looks like
 *       every arm working.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
/* THE RECORD'S OWN WORDS AND THE ENFORCED RULE, IMPORTED. Nothing below spells
   a grade letter or a doctrine sentence; the patches are composed from these. */
import { ACQUIRE_GRADE_NOTE } from "../../bio-plane/src/affordances.mjs";
import { EARNED_CAPTURE_CEILING } from "../../bio-plane/checks/bio-checks.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const APP = path.join(UI, "app.html");
const MINE = path.join(HERE, "add-surface.test.mjs");
const PEN = path.join(UI, ".ui54-harness");
fs.mkdirSync(PEN, { recursive: true });

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const same = (a, b) => { try { execFileSync("cmp", ["-s", a, b]); return true; } catch (_) { return false; } };

/* THE PRISTINE-OF-RECORD, taken ONCE before any arm and never overwritten. Every
   copy's byte count is PRINTED and FLOORED: two harnesses in this project have
   reported a restore byte-identical OVER AN EMPTY FILE, caught only because a
   digest read `e3b0c442…`, the sha256 of the empty string. */
const WATCHED = { app: APP, mine: MINE };
const RECORD = {};
for (const [k, p] of Object.entries(WATCHED)) {
  RECORD[k] = path.join(PEN, `record.${path.basename(p)}`);
  fs.copyFileSync(p, RECORD[k]);
  const bytes = fs.statSync(RECORD[k]).size;
  if (bytes < 2000) { console.error(`PRISTINE-OF-RECORD ${k} is ${bytes} bytes — refusing to run over an empty file`); process.exit(1); }
  console.log(`pristine-of-record ${k.padEnd(6)}: ${String(bytes).padStart(8)} bytes, sha256 ${sha(RECORD[k]).slice(0, 16)}…`);
}
const keyOf = (f) => Object.entries(WATCHED).find(([, p]) => p === f)[0];

const ARMS = [
  /* (1) THE ITEM. DEC-51 ruled the note is rendered WHOLE, and named the
     co-attestation clause as the part a tidying edit removes — it describes an
     act this surface cannot offer, so dropping it looks like care. This arm is
     that edit. It takes the note apart on its own sentence boundaries and drops
     the last one, which is the SPLIT the ruling refused. */
  { id: "1-co-attestation-clause-dropped", file: APP, run: [MINE], mustFail: true,
    says: "WHOLE, NOT SPLIT",
    what: "THE CO-ATTESTATION CLAUSE IS TIDIED AWAY — `addCaptureNote` renders every sentence of the note but the last, the one describing an act this surface does not offer. DEC-51 calls that the defect rather than the caution, and an assertion must go RED naming the whole-not-split ruling",
    patch: (t) => {
      const a = '  const said = (note == null ? "" : String(note)).trim();';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  const said = (note == null ? "" : String(note)).trim()\n'
        + '    .split(". ").slice(0, -1).join(". ");');
    } },

  /* (2) THE ZERO-COST AGREEMENT. The suite's expectation is repointed from the
     plane's export to a literal holding the same characters. Nothing in §3a can
     see the difference — that IS the finding — so what must catch it is the
     structural detector at the foot of the file. The literal is SERIALISED FROM
     THE IMPORT rather than typed here, so this driver holds no copy of its own
     and the arm still fires the day the enforced ceiling moves. */
  { id: "2-a-hand-typed-copy-in-the-harness", file: MINE, run: [MINE], mustFail: true,
    says: "HOLD A WHOLE PUBLICATION AS A LITERAL",
    what: "THE HARNESS IS REPOINTED AT A HAND COPY — same characters, no import. Every behavioural assertion stays green, because two copies of a sentence agree at zero cost forever; only a structural detector can tell them apart",
    patch: (t) => {
      const a = "  const NOTE = ACQUIRE_GRADE_NOTE;";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  const NOTE = " + JSON.stringify(ACQUIRE_GRADE_NOTE) + ";");
    } },

  /* (3) UI-32 STANDS. Rendering the plane's SENTENCE is not a licence to state a
     letter this surface derived, and the two are one line apart in the same
     renderer — which is precisely why the arm exists. */
  { id: "3-a-surface-computed-letter-returns", file: APP, run: [MINE], mustFail: true,
    says: "UI-32 STANDS",
    what: "A SURFACE-COMPUTED GRADE LETTER IS PREFIXED to the plane's sentence in `addCaptureNote`. UI-32 removed the computed letter from this form and that removal is not reopened by this item",
    patch: (t) => {
      const a = '  h.innerHTML = said ? `<div class="teach" id="a-note-said">${esc(said)}</div>` : "";';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  h.innerHTML = said ? `<div class="teach" id="a-note-said">'
        + "<b>Grade " + EARNED_CAPTURE_CEILING + '.</b> ${esc(said)}</div>` : "";');
    } },

  /* (3b) THE OVER-STRICTNESS PAIR OF (3). The same letter, in a place no member
     can read. It MUST stay GREEN: the rule is about what is rendered, and a
     detector that fired on a comment would have to be weakened until it found
     nothing — the failure mode UI-32's own sweep was built to avoid. */
  { id: "3b-the-same-letter-in-a-comment", file: APP, run: [MINE], mustFail: false,
    what: "OVER-STRICTNESS — the grade letter in a CODE COMMENT beside the renderer. A comment is not rendered and must PASS",
    patch: (t) => {
      const a = "function addCaptureNote(note){";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "/* UI-54 CONTROL 3b: a capture from this surface earns Grade "
        + EARNED_CAPTURE_CEILING + ", and saying so in a comment reaches nobody. */\n" + a);
    } },

  { id: "4-baseline", file: APP, run: [MINE], mustFail: false,
    what: "BASELINE — no patch at all. Without this row, every arm failing for the wrong reason looks like every arm working",
    patch: (t) => t },
];

const runSuite = (s) => {
  try { return { code: 0, out: execFileSync("node", [s], { encoding: "utf8", stdio: "pipe" }) }; }
  catch (e) { return { code: e.status === undefined ? -1 : e.status,
                       out: String(e.stdout || "") + String(e.stderr || "") }; }
};

const results = [];
let broken = 0;
for (const arm of ARMS) {
  const key = path.basename(arm.file);
  const pristine = path.join(PEN, `${arm.id}.${key}.pristine`);   // UNIQUE per arm, never path alone
  fs.copyFileSync(arm.file, pristine);
  const before = fs.readFileSync(arm.file, "utf8");
  const after = arm.patch(before);
  const armed = after !== null && (arm.id === "4-baseline" || after !== before);
  if (after === null || !armed) {
    console.error(`ARM ${arm.id}: THE PATCH NEVER ARMED — its anchor did not appear exactly once. This is a FINDING about the arm, not about the subject.`);
    broken++;
    fs.copyFileSync(pristine, arm.file);
    results.push({ arm, armed: false, asDeclared: false });
    continue;
  }
  fs.writeFileSync(arm.file, after);

  const runs = arm.run.map((s) => ({ s: path.basename(s), ...runSuite(s) }));

  /* RESTORE, THEN VERIFY TWICE AND AGAINST TWO COPIES. */
  fs.copyFileSync(pristine, arm.file);
  const rec = RECORD[keyOf(arm.file)];
  const okSha = sha(arm.file) === sha(pristine) && sha(arm.file) === sha(rec);
  const okCmp = same(arm.file, pristine) && same(arm.file, rec);
  const bytes = fs.statSync(arm.file).size;
  if (!okSha || !okCmp || bytes < 2000) {
    console.error(`ARM ${arm.id}: RESTORE FAILED (sha256 ${okSha}, cmp ${okCmp}, ${bytes} bytes) — STOPPING`);
    process.exit(1);
  }

  const failed = runs.some((r) => r.code !== 0);
  const saidIt = !arm.says || !arm.mustFail || runs.some((r) => r.out.includes(arm.says));
  const asDeclared = failed === arm.mustFail && saidIt;
  if (!asDeclared) broken++;
  results.push({ arm, armed, runs, failed, asDeclared });

  console.log(`ARM ${arm.id.padEnd(36)} armed=${armed} declared=${arm.mustFail ? "RED" : "GREEN"} `
    + `actual=${failed ? "RED" : "GREEN"} ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`
    + `  restore: sha256 ok, cmp ok, ${bytes} bytes`);
  for (const r of runs) {
    const tally = (r.out.split("\n").find((l) => /\d+ assertions/.test(l)) || "").trim();
    console.log(`    ${r.s.padEnd(26)} exit=${r.code}  ${tally}`);
    for (const l of r.out.split("\n").filter((l) => /^FAIL /.test(l)).slice(0, 3))
      console.log(`        ${l.trim().slice(0, 200)}`);
  }
}

console.log(`\n${results.length} arms run, ${results.filter((x) => x.asDeclared).length} as declared, ${broken} NOT`);
/* A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, never smoothed. */
for (const r of results.filter((x) => !x.asDeclared))
  console.log(`  *** ${r.arm.id}: declared ${r.arm.mustFail ? "RED" : "GREEN"}, got ${r.armed ? (r.failed ? "RED" : "GREEN") : "NEVER ARMED"} — ${r.arm.what}`);

/* FINAL SWEEP: every watched file byte-identical to its pristine-of-record. */
let dirty = 0;
for (const [k, p] of Object.entries(WATCHED)) {
  const clean = sha(p) === sha(RECORD[k]) && same(p, RECORD[k]);
  if (!clean) { dirty++; console.error(`  *** ${k} (${p}) DID NOT COME BACK CLEAN`); }
}
console.log(dirty ? `${dirty} file(s) left dirty — THIS IS A FINDING` : "all watched files restored byte-identical (sha256 + cmp)");
if (!dirty) fs.rmSync(PEN, { recursive: true, force: true });
process.exit(broken || dirty ? 1 : 0);
