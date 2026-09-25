/* airun-principal.control.mjs — the NEGATIVE CONTROL for `test/airun-principal.test.mjs` (REC-152).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not
 * discover it. Run from `bio-plane/`: `node test/airun-principal.control.mjs [arm]`.
 *
 * Every arm patches a COPY of `src/` and `checks/` (asserting its anchor occurs EXACTLY ONCE, or the arm
 * reports it did not arm), runs the suite against the copy, and compares the failing arms with what was
 * DECLARED before arming: missing and unexpected failures are both printed. The real sources are hashed
 * before and after, so a control that touched them says so.
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
const SUITE = join(PLANE, "test", "airun-principal.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* RE-ANCHORED 2026-09-22 by REC-165: the stamp's condition now also names `RUN_PRODUCTION_ACTIONS` (the one
   expression extended to op=suggest and op=extractpropose, §11 item 5 rule 1). The old anchor occurred ZERO
   times after that landing, so this arm would have reported "did not arm" rather than measuring anything. */
const STAMP = "    if (RUN_VERB_ACTIONS.includes(op) || RUN_PRODUCTION_ACTIONS.includes(op))\n      inner.searchParams.set(\"principal\",\n";
const FOLD = "  return i < 0 ? s : s.slice(0, i);\n";
const SIGHT_TICK = "    if (!this.#aiRunInSight(run, viewer)) return { run: run || null, found: false,\n";
const SIGHT_CLOSE = "      if (!this.#aiRunInSight(run, viewer)) return { run, found: false,\n";
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: compare with the SENT field. The control plane's stamp honours a `principal` the
     caller put in its own query, so the store compares the run's principal with what the caller SAID.
     Every honest arm stays green — that is the lie — and the FORGED-ACTOR arms must fail by name.
     THE ARM'S FIRST SPELLING NEVER ARMED, and that is recorded rather than smoothed (REC-152's first run,
     27/0, "NOT AS DECLARED"): it prefixed the stamp's ternary with `sent ||`, and `a || b ? c : d` parses
     as `(a || b) ? c : d` — so the patched line still answered the SESSION'S identity and the forger was
     refused by the real rule. The anchor occurred once and the file changed; only the declared-vs-actual
     comparison could see that the patch changed nothing. The sent value is now its own ternary arm. */
  "sent-field": {
    patches: [["index.mjs", STAMP + "        viaSession ? sessIdentity\n",
               STAMP + "        url.searchParams.get(\"principal\") ? url.searchParams.get(\"principal\") : viaSession ? sessIdentity\n"]],
    mustFail: ["ARM F1 (THE FORGED ACTOR)", "ARM F2 (THE FORGED ACTOR)"],
  },

  /* THE RULE REMOVED: the positional predicate permits everybody. Every refusal of a caller who CAN see
     the context must fail, and the read-back with them (the refused acts now write); the absent-run arms
     and the principal's own arms must not move. */
  "no-principal-check": {
    patches: [["airun.mjs", "  if (who && owner && who === owner) return null;\n", "  return null;\n"]],
    mustFail: ["ARM A1:", "ARM A2:", "ARM A3:", "ARM B1:", "ARM B2:", "ARM G1:", "ARM F1 (THE FORGED ACTOR)",
               "ARM F2 (THE FORGED ACTOR)", "ARM R1:", "ARM M1:", "ARM M4:", "ARM K1:",
               /* R1's runs are ticked and closed by the refused callers, so the principal's own later tick
                  counts and closes move: declared, not discovered. */
               "ARM P1:", "ARM P2:", "ARM P3:", "ARM M2:"],
  },

  /* SIGHT DROPPED at both verbs: a caller who cannot see the context is refused positionally instead of
     answered as absent — the refusal tells her the run exists. Only the U arms may fail. */
  "no-sight": {
    patches: [["store.mjs", SIGHT_TICK, "    if (false) return { run: run || null, found: false,\n"],
              ["store.mjs", SIGHT_CLOSE, "      if (false) return { run, found: false,\n"]],
    mustFail: ["ARM U1:", "ARM U2:", "ARM U3:"],
  },

  /* A FENCE TIGHTER THAN THE RULE: compare the whole stamped string, so a member and the credential minted
     for her are two principals. The arms that drive that pairing must fail by name; nothing else. */
  "exact-compare": {
    patches: [["airun.mjs", FOLD, "  return s;\n"]],
    mustFail: ["ARM M2:", "ARM M3:", "ARM P3:"],
  },

  /* OVER-STRICTNESS: the same fold in a spelling the suite did not anticipate. Nothing may fail. */
  "fold-by-split": {
    patches: [["airun.mjs", FOLD, "  return s.split(\"/\")[0];\n"]],
    mustFail: [],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `airun-principal-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, AIRUN_PRINCIPAL_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /airun-principal: (\d+) pass, (\d+) fail/.exec(out);
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
