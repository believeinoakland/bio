/* rec168-capturerequest-principal.control.mjs — the NEGATIVE CONTROL for `test/rec168-capturerequest-principal.test.mjs`
 * (REC-168, INVESTIGATIVE-SESSION.md §11 item 5, the `op=capturerequest` paragraph, BOB #28).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec168-capturerequest-principal.control.mjs [arm]`. REC-165's driver's shape:
 * every arm patches a COPY of `src/` and `checks/` in a fresh temporary tree, asserting its anchor occurs EXACTLY
 * ONCE (or the arm reports it did not arm), runs the suite against the copy, and compares the failing arms with what
 * was DECLARED before arming — missing and unexpected failures are both printed. The real sources are hashed (byte
 * count and sha256) before and after, so a control that touched them says so; nothing is ever restored because
 * nothing real is ever edited. Each arm breaks ONE thing.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "rec168-capturerequest-principal.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* Each anchor is unique to `captureRequest` by the fields that follow it (REC-165's `suggest` relay carries
   `target, run,`; this one `run,` alone). */
const GATE = "    if (notPrincipal)\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, run,\n";
const SIGHT = "    const requestRunSeen = !!runRow && this.#aiRunInSight(run, args.viewer ?? null);\n";
const RECORD = "    const callerPlane = String(args.caller ?? \"\").trim();\n";
const CALL = "    const notPrincipal = runPrincipalGate({ caller: args.caller ?? null, principal: runRow.principal_plane,\n"
  + "                                            act: \"requesting a capture under a run\" });\n";
const ROUTE = "             overwritten rather than believed. */\n          caller: url.searchParams.get(\"principal\"),\n        }),\n"
  + "        capturerequestdrain:";
const STAMP = "    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))\n"
  + "      inner.searchParams.set(\"principal\",\n        viaSession ? sessIdentity\n";
/* CORRECTED at c22-batch29 (merge of REC-147), never exempted: REC-147 added `contradictionpropose` to the list, so
   the old anchor occurred 0 times and the no-stamp arm DID NOT ARM. The arm still removes exactly `capturerequest`. */
const LIST = "const RUN_PRODUCTION_ACTIONS = [\"suggest\", \"extractpropose\", \"capturerequest\", \"contradictionpropose\"];\n";

/* Every refusal of ANOTHER principal, and every arm that rests on one. */
const OTHER_PRINCIPAL = ["ARM R1 ", "ARM R2 ", "ARM R3:", "ARM R4:", "ARM R5:", "ARM R6 ", "ARM S3 ", "ARM U2 ",
                         "ARM F1 ", "ARM F2 ", "ARM F3 ", "ARM I1:"];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the gate. Every other-principal arm must fail by name, from a session AND from a
     credential; the caller's own arms and the no-run arms must NOT move. */
  "drop-gate": {
    patches: [["store.mjs", GATE, GATE.replace("if (notPrincipal)", "if (false)")]],
    mustFail: OTHER_PRINCIPAL,
  },

  /* THE LIAR, EACH WAY: a gate asked of ONE caller kind. Sessions only (a credential's stamp carries `/`): the
     credential arms fail. Credentials only: the session arms fail. Both halves must be caught. */
  "gate-sessions-only": {
    patches: [["store.mjs", GATE, GATE.replace("if (notPrincipal)",
      "if (notPrincipal && !String(args.caller ?? \"\").includes(\"/\"))")]],
    mustFail: ["ARM R2 ", "ARM R6 ", "ARM S3 ", "ARM F2 ", "ARM F3 ", "ARM I1:"],
  },
  "gate-credentials-only": {
    patches: [["store.mjs", GATE, GATE.replace("if (notPrincipal)",
      "if (notPrincipal && String(args.caller ?? \"\").includes(\"/\"))")]],
    mustFail: ["ARM R1 ", "ARM R3:", "ARM R4:", "ARM R5:", "ARM R6 ", "ARM S3 ", "ARM U2 ", "ARM F1 ", "ARM F3 ", "ARM I1:"],
  },

  /* THE STAMP NOT EXTENDED: `capturerequest` taken out of RUN_PRODUCTION_ACTIONS, so the store receives no
     caller. The gate fails CLOSED (no empty bypass): every request under a run is refused, the caller's own
     included — so the landing arms fail, and the other-principal arms stay green (refused, for the wrong reason).
     CORRECTED AT THE FIRST RUN (2026-09-23), THE ARM RIGHT AND THE DECLARATION WRONG: F1-F3 fail too, because with
     no stamp nothing OVERWRITES the `principal` cora forged into her query — it reaches the store and is believed.
     The stamp is a SET, not just a supply, and this arm is what shows it. (And `ARM S2:` was a mis-spelled marker.) */
  "no-stamp": {
    patches: [["index.mjs", LIST, "const RUN_PRODUCTION_ACTIONS = [\"suggest\", \"extractpropose\", \"contradictionpropose\"];\n"]],
    mustFail: ["ARM L1 ", "ARM L2 ", "ARM L3 ", "ARM L4 ", "ARM S1 ", "ARM S2 ", "ARM F1 ", "ARM F2 ", "ARM F3 ",
               "ARM F4 ", "ARM I0 "],
  },

  /* SIGHT DROPPED: a caller who cannot see the run's context is refused positionally instead of answered as
     absent. Only U1 may fail. */
  "no-sight": {
    patches: [["store.mjs", SIGHT, "    const requestRunSeen = !!runRow;\n"]],
    mustFail: ["ARM U1 "],
  },

  /* THE ROW RECORDS THE RUN'S PRINCIPAL AGAIN (the pre-item write, gate kept): the arms that tell the caller from
     the run's copy fail — L2 (a credential under a session's run), L3 (a session under a credential's run), L4. */
  "record-run-principal": {
    patches: [["store.mjs", RECORD, "    const callerPlane = String(runRow.principal_plane ?? \"\").trim();\n"]],
    mustFail: ["ARM L2 ", "ARM L3 ", "ARM L4 "],
  },

  /* COMPARE WITH A SENT FIELD, two ways. (a) the stamp honours a `principal` the caller put in its own query;
     (b) the store's route lets the BODY's `caller` win. Every honest arm stays green — that is the lie. */
  "sent-field-query": {
    patches: [["index.mjs", STAMP,
      STAMP.replace("        viaSession ? sessIdentity\n",
        "        url.searchParams.get(\"principal\") ? url.searchParams.get(\"principal\") : viaSession ? sessIdentity\n")]],
    mustFail: ["ARM F1 ", "ARM F2 ", "ARM F3 "],
  },
  "sent-field-body": {
    /* Spelled WHOLE rather than as a `.replace` of a sub-literal: the sub-literal occurs at `suggest`'s route too, and
       m025-arm-anchor-witness (A5) reads every `.replace(` literal as an anchor into the subject. */
    patches: [["store.mjs", ROUTE,
      "             overwritten rather than believed. */\n          caller: (body || {}).caller ?? url.searchParams.get(\"principal\"),\n        }),\n"
      + "        capturerequestdrain:"]],
    mustFail: ["ARM F1 ", "ARM F2 ", "ARM F3 ", "ARM F4 "],
  },

  /* A FENCE TIGHTER THAN THE RULE: the caller's stamp compared to the run's WHOLE string, so a member's credential
     and her session stop being one principal. Exactly the cross-kind arms must fail. CORRECTED AT THE FIRST RUN
     (2026-09-23): S2 as well — her credential under her session's ENDED run is then told the run is not hers
     before its status, which is the same over-tight fence seen from the order arm. */
  "exact-match": {
    /* Spelled WHOLE for the reason `sent-field-body` gives. */
    patches: [["store.mjs", CALL,
      "    const notPrincipal = runPrincipalGate({ caller: String(args.caller ?? \"\") === String(runRow.principal_plane ?? \"\") ? runRow.principal_plane : \"member:nobody\", principal: runRow.principal_plane,\n"
      + "                                            act: \"requesting a capture under a run\" });\n"]],
    mustFail: ["ARM L2 ", "ARM L3 ", "ARM L4 ", "ARM S2 "],
  },

  /* OVER-STRICTNESS: the same sight rule in a spelling the suite did not anticipate — the run id read off the row
     rather than the request. Nothing may fail. */
  "sight-by-row": {
    patches: [["store.mjs", SIGHT, "    const requestRunSeen = !!runRow && this.#aiRunInSight(runRow.run, args.viewer ?? null);\n"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec168-${name}-`));
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
      writeFileSync(p, s.replace(from, () => to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC168_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec168-capturerequest-principal: (\d+) pass, (\d+) fail/.exec(out);
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
