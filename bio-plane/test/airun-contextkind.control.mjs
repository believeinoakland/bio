/* airun-contextkind.control.mjs — the NEGATIVE CONTROL for `test/airun-contextkind.test.mjs` (REC-153).
 * NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/airun-contextkind.control.mjs            every arm
 *   node test/airun-contextkind.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source: `project-disclosure.control.mjs`'s method. Each arm
 * copies `src/` into a uniquely-named temporary tree, applies its patch there (asserting each anchor
 * occurs EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the suite with
 * AIRUN_CONTEXTKIND_SRC pointed at the copy. The real `src/index.mjs`, `src/store.mjs` and `src/airun.mjs`
 * are hashed (sha256 and byte length) before the first arm and after the last; the run fails if any moved.
 *
 * EACH ARM BREAKS ONE THING, and what it MUST fail (by label fragment) is DECLARED BEFORE ARMING; every
 * other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/airun-contextkind.test.mjs` and the IC.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "airun-contextkind.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const CALL = "    const kind = checkRunContextKind({ contextType, contextId,\n"
           + "      found: this.#runContextKind(contextId, viewer), member: !!(actor != null && String(actor).trim()) });\n";
const MISLABELLED = ["REC-153 MISLABELLED: olga", "REC-153 MISLABELLED: ruth", "REC-153 MISLABELLED: sam",
                     "REC-153 MISLABELLED: a machine", "REC-153 MISLABELLED: olga opening it as `Project`",
                     "REC-153 MISLABELLED: and as a kind", "REC-153 MISLABELLED: sam opening the QUESTION",
                     "the refusal carries its C-number", "a refused open WRITES NOTHING", "ORDER: a mislabelled open"];
const UNSEEN = ["REC-153 UNSEEN REFUSED: vera opening", "REC-153 UNSEEN REFUSED: and a never-minted"];
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S NEGATIVE CONTROL: drop the kind check — the call in `aiRunOpen` answers "no refusal" for
     every open. Every MISLABELLED arm must fail by name, and the two UNSEEN-REFUSED arms with them. The
     byte-identity arms are DECLARED TO STAY GREEN, and that is a finding about those arms stated before
     the run: without the check, vera's opens over the hidden project and over a never-minted id are both
     PERMITTED on the INQUIRY ground with a count of 0 — identical bytes — so a byte arm proves NO BIT and
     only the REFUSED arms prove the refusal (the suite's liar (c)). */
  "kind-check-dropped": {
    patches: [["store.mjs", CALL, "    const kind = null;\n"]],
    mustFail: [...MISLABELLED, ...UNSEEN],
  },

  /* THE ROW'S LIAR: refuse every `inquiry`-context open. The liar's arms must fail, and every arm that
     expects an `inquiry` open to START (the machine's never-minted id, the agent's). Everything that
     already refused keeps refusing by the same code, which is the lie's cover — so every byte arm, which
     compares two refusals, stays green. */
  "refuse-every-inquiry": {
    patches: [["airun.mjs", "  const said = String(contextType ?? \"\");\n",
               "  const said = String(contextType ?? \"\");\n  if (said === \"inquiry\") return refusal(\"AI_RUN_NO_SUCH_CONTEXT\", \"no\");\n"]],
    mustFail: ["REC-153 LIAR'S ARM", "FIXTURE: an `ai` credential", "MACHINE: an `inquiry` run over a never-minted",
               "REC-153 AGENT SIGHT", "ORDER: a correctly labelled open"],
  },

  /* LIAR (b): refuse only the SEEN mismatch; an unseen id goes through for everybody. vera's
     UNSEEN-REFUSED arms must fail; vera's byte arms stay green (both permitted — liar (c) again).
     DECLARATION WIDENED 2026-09-19 from this arm's own first run (32/3, NOT AS DECLARED): olga's ONE ANSWER
     arm fails too, and correctly — her SEEN mismatch is refused while her never-minted id is now permitted,
     so the two answers differ. The arm was right and the declaration was short; a third catcher of the same
     defect, not a new one. */
  "unseen-permitted": {
    patches: [["airun.mjs", "  if (!seen && (!member || runConsultsProjects(said))) return null;\n", "  if (!seen) return null;\n"]],
    mustFail: [...UNSEEN, "ONE ANSWER:"],
  },

  /* SIGHT NOT ASKED: the bundle's type read with no viewer, so a project hidden from the caller is
     "seen" as a project. For a MEMBER nothing moves (the refusal is one object whichever branch builds
     it — by construction), so the member byte arms stay green; the `ai` credential, which carries a
     member's sight and no actor, is where sight changes the answer: its open over the hidden project is
     then REFUSED while its never-minted open is PERMITTED — the refusal is the bit. */
  "sight-not-asked": {
    patches: [["store.mjs", "    if (viewer !== null && viewer !== undefined && !this.#inSight(id, viewer)) return null;\n", ""]],
    mustFail: ["REC-153 AGENT SIGHT"],
  },

  /* ONE ANSWER BROKEN: the mismatch branch says what the bundle IS. Only the arm comparing a SEEN
     mismatch with a never-minted id may fail (olga's); vera sees neither project, so her byte arms stay
     green, and the machine's and agent's arms never reach the mismatch branch with a hidden id. */
  "mismatch-names-kind": {
    patches: [["airun.mjs", "  if (seen && found === said) return null;\n",
               "  if (seen && found === said) return null;\n"
               + "  if (seen) return refusal(\"AI_RUN_NO_SUCH_CONTEXT\", `that is a ${found}, not a ${said}`);\n"]],
    mustFail: ["ONE ANSWER:"],
  },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate — the store asks sight
     through the roster acts' form (`#rosterInSight`), which answers "not asked" only for a viewer that was
     never sent; the control plane always sends one on the run verbs. Nothing may fail. */
  "sight-via-roster-form": {
    patches: [["store.mjs", "    if (viewer !== null && viewer !== undefined && !this.#inSight(id, viewer)) return null;\n",
               "    if (!this.#rosterInSight(id, viewer)) return null;\n"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `airun-contextkind-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, AIRUN_CONTEXTKIND_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /airun-contextkind: (\d+) passed, (\d+) failed/.exec(out);
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
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
