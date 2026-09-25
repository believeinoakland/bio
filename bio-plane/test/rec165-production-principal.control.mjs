/* rec165-production-principal.control.mjs — the NEGATIVE CONTROL for `test/rec165-production-principal.test.mjs`
 * (REC-165, INVESTIGATIVE-SESSION.md §11 item 5 rule 1 and its target, BOB #25 / BOB #28).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec165-production-principal.control.mjs [arm]`. REC-152's driver's shape
 * (`airun-principal.control.mjs`): every arm patches a COPY of `src/` and `checks/` in a fresh temporary tree,
 * asserting its anchor occurs EXACTLY ONCE (or the arm reports it did not arm), runs the suite against the copy,
 * and compares the failing arms with what was DECLARED before arming — missing and unexpected failures are both
 * printed. The real sources are hashed (byte count and sha256) before and after, so a control that touched them
 * says so; nothing is ever restored because nothing real is ever edited. Each arm breaks ONE thing.
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
const SUITE = join(PLANE, "test", "rec165-production-principal.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* The relay is written field by field (never a spread: the DEC-49 guard's inherited-verdict ceiling), so each
   anchor is the `if` and the first line of its own return — unique to its site by the fields that follow. */
const SUGGEST_GATE = "    if (notPrincipal)\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, target, run,\n";
const EXTRACT_GATE = "    if (notPrincipal)\n      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,\n"
  + "               translation: notPrincipal.translation, detail: notPrincipal.detail, run: runId,\n";
const SUGGEST_SIGHT = "    const runSeen = !!runRow && this.#aiRunInSight(run, args.viewer ?? null);\n";
const EXTRACT_SIGHT = "    if (!r || !this.#aiRunInSight(runId, viewer))\n";
const CONTEXT = "    const inContext = target === ctxId\n"
  + "      || (String(runRow.context_type) === \"project\" && this.#citesInto(target).confirmed.includes(ctxId));\n";
const STAMP = "    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))\n"
  + "      inner.searchParams.set(\"principal\",\n        viaSession ? sessIdentity\n";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the gate in `suggest`. Every refusal of ANOTHER PRINCIPAL on op=suggest must fail by
     name — from a session AND from a credential (a liar gating one kind would leave half of these green) — and
     the arms that depend on position being asked FIRST move with them: N3 (cora is then told the run's status)
     and X6 (she is then told the context). S5 and F1 fail because the refused acts now WRITE. Nothing on
     op=extractpropose may move (F3 asserts both ops in one assertion, so it fails on its suggest half). */
  "drop-gate-suggest": {
    patches: [["store.mjs", SUGGEST_GATE, SUGGEST_GATE.replace("if (notPrincipal)", "if (false)")]],
    mustFail: ["ARM S1 ", "ARM S2 ", "ARM S3:", "ARM S4:", "ARM S5 ", "ARM N3 ", "ARM F1 ", "ARM F3 ", "ARM X6 "],
  },

  /* The same gate dropped in `extractpropose`: the E arms and the forged extract arms, and nothing on suggest. */
  "drop-gate-extract": {
    patches: [["store.mjs", EXTRACT_GATE, EXTRACT_GATE.replace("if (notPrincipal)", "if (false)")]],
    mustFail: ["ARM E1 ", "ARM E2 ", "ARM E3 ", "ARM F2 ", "ARM F3 "],
  },

  /* BOB #28's CONTROL: drop the context check. The outside-target arms must fail by name, and X4 with them (the
     refused suggestions now write); the order arms X6/X7 must NOT move — position and sight answer first. */
  "drop-context": {
    patches: [["store.mjs", CONTEXT, "    const inContext = true;\n"]],
    mustFail: ["ARM X1 ", "ARM X2 ", "ARM X3 ", "ARM X4 "],
  },

  /* SIGHT DROPPED on suggest: a caller who cannot see the run's context is refused positionally instead of
     answered as absent. U1 and X7 (the two byte arms on suggest) must fail; U2 (extractpropose) must not. */
  "no-sight-suggest": {
    patches: [["store.mjs", SUGGEST_SIGHT, "    const runSeen = !!runRow;\n"]],
    mustFail: ["ARM U1 ", "ARM X7 "],
  },

  /* SIGHT DROPPED on extractpropose: only U2. */
  "no-sight-extract": {
    patches: [["store.mjs", EXTRACT_SIGHT, "    if (!r)\n"]],
    mustFail: ["ARM U2 "],
  },

  /* COMPARE WITH A SENT FIELD: the stamp honours a `principal` the caller put in its own query. Every honest
     arm stays green — that is the lie — and only the FORGED arms may fail. */
  "sent-field": {
    patches: [["index.mjs", STAMP,
      STAMP.replace("        viaSession ? sessIdentity\n",
        "        url.searchParams.get(\"principal\") ? url.searchParams.get(\"principal\") : viaSession ? sessIdentity\n")]],
    mustFail: ["ARM F1 ", "ARM F2 ", "ARM F3 "],
  },

  /* A FENCE TIGHTER THAN BOB #28's RULE: a run's context is its own id ONLY, so a project run may not land on a
     question its project cites. Exactly the cited-question arm must fail. */
  "context-too-tight": {
    patches: [["store.mjs", CONTEXT, "    const inContext = target === ctxId;\n"]],
    mustFail: ["ARM X5 "],
  },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate — the citing projects read
     through `#runContextProjects` (the other direction of the same live-cites predicate). Nothing may fail. */
  "context-by-projects": {
    patches: [["store.mjs", CONTEXT, "    const inContext = target === ctxId\n"
      + "      || (String(runRow.context_type) === \"project\" && this.#runContextProjects(\"inquiry\", target).includes(ctxId));\n"]],
    mustFail: [],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec165-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC165_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec165-production-principal: (\d+) pass, (\d+) fail/.exec(out);
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
