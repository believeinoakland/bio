/* d85-surface-run.control.mjs — the NEGATIVE CONTROL for `test/d85-surface-run.test.mjs`
 * (D-85, INVESTIGATIVE-SESSION.md §11 item 5, rules 2 and 3, BOB #25).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/d85-surface-run.control.mjs [arm]`. REC-168's driver's shape: every arm patches a
 * COPY of `src/` and `checks/` in a fresh temporary tree, asserting its anchor occurs EXACTLY ONCE (or the arm reports
 * it did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED before
 * arming — missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256)
 * before and after, so a control that touched them says so; nothing is ever restored because nothing real is ever
 * edited. Each arm breaks ONE thing.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d85-surface-run.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS, each a whole line (or lines) of the subject, each occurring once. */
const GATE_CALL = "      if (refusedSurface) return refusedSurface;\n";
const GATE_CALL_OFF = "      if (false) return refusedSurface;\n";
const SIGHT = "    const runSeen = !!runRow && this.#aiRunInSight(run, pkg.actorViewer ?? null);\n";
const SIGHT_OFF = "    const runSeen = !!runRow;\n";
const SIGHT_BY_ROW = "    const runSeen = !!runRow && this.#aiRunInSight(runRow.run, pkg.actorViewer ?? null);\n";
const PRINCIPAL = "    if (notPrincipal)\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, run,\n"
  + "               note: \"an assistant opens a question only inside a run it holds. Nothing was created\" };\n";
const PRINCIPAL_OFF = "    if (false)\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, run,\n"
  + "               note: \"an assistant opens a question only inside a run it holds. Nothing was created\" };\n";
const PRINCIPAL_CRED_RUNS_ONLY = "    if (notPrincipal && String(runRow.principal_plane).includes(\"/\"))\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, run,\n"
  + "               note: \"an assistant opens a question only inside a run it holds. Nothing was created\" };\n";
const CALL = "    const notPrincipal = runPrincipalGate({ caller, principal: runRow.principal_plane,\n"
  + "                                            act: \"opening a question under a run\" });\n";
const CALL_EXACT = "    const notPrincipal = runPrincipalGate({ caller: caller === String(runRow.principal_plane ?? \"\") ? caller : \"member:nobody\", principal: runRow.principal_plane,\n"
  + "                                            act: \"opening a question under a run\" });\n";
const STATUS = "    if (runRow.status !== \"running\")\n      return refusal(\"SURFACE_RUN_NOT_RUNNING\",\n";
const STATUS_OFF = "    if (false)\n      return refusal(\"SURFACE_RUN_NOT_RUNNING\",\n";
const NO_BOUND = "    if (!bound || !(Number(bound.allowed) > 0))\n      return refusal(\"SURFACE_NO_BOUND\",\n";
const NO_BOUND_OFF = "    if (false)\n      return refusal(\"SURFACE_NO_BOUND\",\n";
const CAP = "    if (Number(bound.consumed) >= Number(bound.allowed))\n      return refusal(\"SURFACE_BOUND_REACHED\",\n";
const CAP_OFF = "    if (false)\n      return refusal(\"SURFACE_BOUND_REACHED\",\n";
/* CORRECTED 2026-09-23 by REC-171: the stamp is now set for EVERY non-session caller (BOB #30, rule 2's reach), so its
   anchor is the two-line form; removing it still removes the `ai` credential's stamp, which is this arm's subject. */
const STAMP = "        if (!viaSession)\n"
  + "          b.assistantPrincipal = cls === \"ai\" ? `${aiCred.principal}/${aiCred.tokenId}` : `${MACHINE_CLASS_PREFIX}${cls}`;\n";
const STAMP_OFF = "        /* the stamp removed by the control */\n";
const DELETE = "        delete b.assistantPrincipal;\n";
const DELETE_OFF = "        /* the delete removed by the control */\n";
const LINK = "          `INSERT INTO inquiry_run_surfacings (bundle_id, run, principal, at) VALUES (?,?,?,?)`,\n"
  + "          bundleId, surfacing.run, surfacing.principal, ts);\n";
const LINK_OFF = "          `SELECT ? AS a, ? AS b, ? AS c, ? AS d`,\n"
  + "          bundleId, surfacing.run, surfacing.principal, ts);\n";
const HAND = "    const handOf = (handedSha) => (!atOpen ? null : handedSha === openSha ? \"in_force\" : \"stale\");\n";
const HAND_BY_NOW = "    const handOf = (handedSha) => (!atOpen ? null : handedSha === nowSha ? \"in_force\" : \"stale\");\n";
const MOVED = "             moved: atOpen\n               ? openSha !== nowSha\n";
const MOVED_BY_HAND = "             moved: atOpen\n               ? recordedSha !== nowSha\n";
/* D-637: re-anchored — REC-207 appended `rerun_of` after the lens, so the line now ends `lensAtOpen,` not `);`. */
const LENS_WRITE = "        JSON.stringify(state == null ? {} : state), lensAtOpen,\n";
const LENS_WRITE_OFF = "        JSON.stringify(state == null ? {} : state), null,\n";

/* The arms that rest on a refusal of ANOTHER principal. CORRECTED AT THE FIRST RUN (2026-09-23), THE ARMS RIGHT
   AND THE DECLARATION WRONG: L1 and L7 fail too wherever a refusal becomes a landing, because cora's credential then
   LANDS a question under alice's QRUN and SPENDS its bound before L1 reads `consumed: 1`. That is the refusal's
   absence seen from the bound, not a second variable. */
const OTHER_PRINCIPAL = ["ARM R1 ", "ARM R2 ", "ARM R3:", "ARM R4:", "ARM R5 ", "ARM F1:", "ARM F2:", "ARM U2 ",
                         "ARM S2 ", "ARM M3:", "ARM L1 ", "ARM L7 "];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the run check — the gate is never asked. The outside-a-run arm must fail BY NAME, with
     every other refusal; the landings and the member's own arms must not move. */
  "drop-run-check": {
    patches: [["store.mjs", GATE_CALL, GATE_CALL_OFF]],
    mustFail: ["ARM O1 ", "ARM O2:", "ARM O3 ", ...OTHER_PRINCIPAL, "ARM U0 ", "ARM U1 ", "ARM S1:", "ARM B1 ",
               "ARM B3 "],
  },

  /* SIGHT DROPPED: pia is told the run is not hers instead of answered as for a run never minted. Only U1. */
  "no-sight": { patches: [["store.mjs", SIGHT, SIGHT_OFF]], mustFail: ["ARM U1 "] },

  /* POSITION DROPPED: every other-principal arm lands instead. */
  "no-principal": { patches: [["store.mjs", PRINCIPAL, PRINCIPAL_OFF]], mustFail: OTHER_PRINCIPAL },

  /* THE LIAR, ONE RUN KIND: position asked only of runs a CREDENTIAL opened. R1 (a session's run) and R3 (cora's
     session run) must fail; R2 (a credential's run) must not. */
  "gate-credential-runs-only": {
    patches: [["store.mjs", PRINCIPAL, PRINCIPAL_CRED_RUNS_ONLY]],
    mustFail: ["ARM R1 ", "ARM R3:", "ARM R4:", "ARM R5 ", "ARM F1:", "ARM F2:", "ARM U2 ", "ARM S2 ", "ARM M3:",
               "ARM L1 ", "ARM L7 "],
  },

  /* A FENCE TIGHTER THAN THE RULE: the stamp compared WHOLE, so a member and her credential stop being one
     principal. The credential under her SESSION's run (L1) must fail, and what rests on it. CORRECTED AT THE FIRST
     RUN (2026-09-23), THE ARM RIGHT: B1 too (her credential under her session's run with no bound is told the run is
     not hers before the bound is asked) and M3 (B2 never landed, so BRUN reads [1, 0]). */
  "exact-match": {
    patches: [["store.mjs", CALL, CALL_EXACT]],
    mustFail: ["ARM L1 ", "ARM L3 ", "ARM L4 ", "ARM L5 ", "ARM L6 ", "ARM L7 ", "ARM B2 ", "ARM B3 ", "ARM B4 ",
               "ARM S1:", "ARM N3 ", "ARM P1 ", "ARM B1 ", "ARM M3:"],
  },

  "no-status": { patches: [["store.mjs", STATUS, STATUS_OFF]], mustFail: ["ARM S1:"] },
  "no-bound-required": { patches: [["store.mjs", NO_BOUND, NO_BOUND_OFF]], mustFail: ["ARM B1 "] },
  /* CORRECTED AT THE FIRST RUN (2026-09-23): M3 fails too — the second question LANDS past the cap, so BRUN reads
     [1, 2], which is the overspend itself read from the member's arm. */
  "no-bound-cap": { patches: [["store.mjs", CAP, CAP_OFF]], mustFail: ["ARM B3 ", "ARM M3:"] },

  /* THE STAMP NOT SET: the store never learns an assistant is asking, so the gate is never asked (the row's
     control from the other side) and nothing is linked. */
  "no-stamp": {
    patches: [["index.mjs", STAMP, STAMP_OFF]],
    mustFail: ["ARM O1 ", "ARM O2:", "ARM O3 ", ...OTHER_PRINCIPAL, "ARM U0 ", "ARM U1 ", "ARM S1:", "ARM B1 ",
               "ARM B2 ", "ARM B3 ", "ARM B4 ", "ARM L1 ", "ARM L2 ", "ARM L3 ", "ARM L4 ", "ARM L5 ", "ARM L7 ",
               "ARM N3 ", "ARM P1 ", "ARM T6 ", "ARM W1:"],
  },

  /* THE SENT FIELD BELIEVED: the delete removed, so a SESSION that sends `assistantPrincipal` is taken for an
     assistant. Only the member's forged shape may fail. CORRECTED AT THE FIRST RUN (2026-09-23), THE DECLARATION
     WRONG: M2 stays green — the forged session is REFUSED (M1), so it writes no link and carries no `surfaced_in`. */
  "stamp-not-deleted": { patches: [["index.mjs", DELETE, DELETE_OFF]], mustFail: ["ARM M1:"] },

  /* THE ROW NOT WRITTEN: every creation still lands and spends, and no question can say its run. */
  "no-link-row": {
    patches: [["store.mjs", LINK, LINK_OFF]],
    mustFail: ["ARM L4 ", "ARM L5 ", "ARM N3 ", "ARM P1 ", "ARM T6 ", "ARM W1:"],
  },

  /* RULE 3's LIARS. (a) stale decided against the lens NOW: correct once the lens moves (T5) and for the run
     opened before any lens (T4). (b) moved decided against the HAND (the pre-item behaviour): a stale hand reads
     moved (T2, T6). (c) the lens at the open never recorded. */
  "hand-by-now": { patches: [["store.mjs", HAND, HAND_BY_NOW]], mustFail: ["ARM T4 ", "ARM T5 "] },
  "moved-by-hand": { patches: [["store.mjs", MOVED, MOVED_BY_HAND]], mustFail: ["ARM T2 ", "ARM T6 "] },
  "no-lens-at-open": {
    patches: [["store.mjs", LENS_WRITE, LENS_WRITE_OFF]],
    mustFail: ["ARM L4 ", "ARM T1 ", "ARM T2 ", "ARM T3 ", "ARM T4 ", "ARM T5 ", "ARM T6 "],
  },

  /* OVER-STRICTNESS: the same sight rule in a spelling the suite did not anticipate. Nothing may fail. */
  "sight-by-row": { patches: [["store.mjs", SIGHT, SIGHT_BY_ROW]], mustFail: [] },
};
/* M0-197: the arms' anchors as data (each patches a COPY of src/; counted in the real file it copies). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d85-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D85_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d85-surface-run: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
