/* semantics-harvest.test.mjs — D-545: `check-semantics.mjs` §3 harvests the STORE'S states, and a thing
 * that merely LOOKS like a state is not one.
 *
 * THE DEFECT. §3 ran `current_state\s*[!=]==?\s*"([a-z_]+)"` over the RAW store text, comments included.
 * A `typeof x.current_state === "string"` guard was read as a state named `string`, a comment quoting the
 * pattern was read as a state too, and the check went RED — "states the store writes with no semantics
 * row" — naming a state nobody wrote. It cost REC-210 two full gate rounds.
 *
 * WHAT THIS SUITE PINS, over copies of the REAL store with lines planted at its foot (the check takes a
 * store path as its argument, so no source in the tree is touched):
 *   F0  the real store: GREEN, the harvest floored on its own reach, and its state set is the baseline.
 *   F1  a planted `typeof` guard and two commented-out quotes: GREEN, the state set UNCHANGED, and each
 *       one printed as an UNRECOGNISED MATCH at its line.
 *   F2  THE CHECK'S REAL REACH: a state the store genuinely writes (`#setScalar`) and genuinely gates on
 *       (`!==`) that the catalogue never blessed and no semantics row explains must STILL FAIL, BY NAME,
 *       and must not be counted as a state. This is what stops "fewer states" passing for the fix.
 *   F3  over-strictness: a catalogue state spelled with no spaces, on a line where an UNRELATED `typeof`
 *       comes first and a string holding `//` sits before it, is harvested as a state.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/semantics-harvest.control.mjs`, each arm edits
 *   `civicos-ui/check-semantics.mjs` ALONE and restores it by sha256 and cmp. RUN 2026-09-24 by D-545:
 *   (a) harvest the raw file again (`storeCode = store`) -> F1 FAILS naming `nobody_wrote` from the comment;
 *   (b) disarm the `typeof` guard -> F1 FAILS naming `string`;
 *   (c) the pre-D-545 instrument (raw, no typeof guard, no catalogue guard) -> F1 FAILS with
 *       "states the store writes with no semantics row" naming `string` — the measured defect, recreated;
 *   (d) disarm the catalogue guard alone -> F2 FAILS: `zombie` is counted as a state;
 *   (e) an unrecognised code literal reported but not failing -> F2 FAILS: the check goes GREEN;
 *   (f) the lexer eats the whole store -> F0 FAILS on the reach floor.
 *   Figures of each run: `docs/development/measurements/M-148.md`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

const CHECK = new URL("../check-semantics.mjs", import.meta.url).pathname;
const STORE = new URL("../../bio-plane/src/store.mjs", import.meta.url).pathname;
const REAL = fs.readFileSync(STORE, "utf8");

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (detail ? "\n       " + detail : "")); }
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d545-harvest-"));
/* Plant `lines` at the store's foot and run the check over the copy. Returns the exit, the output, the
   harvested state set, and the 1-based line each planted line landed on. */
function run(tag, lines = []) {
  const base = REAL.endsWith("\n") ? REAL : REAL + "\n";
  const first = base.split("\n").length;            // the line the first planted line lands on
  const file = path.join(dir, `store-${tag}.mjs`);
  fs.writeFileSync(file, base + lines.join("\n") + "\n");
  const r = spawnSync("node", [CHECK, file], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const seen = /^store literals seen:\s*(.*)$/m.exec(out);
  const states = seen ? new Set(seen[1].split(",").map((s) => s.trim()).filter(Boolean)) : null;
  return { code: r.status, out, states, at: (k) => first + k };
}
const same = (a, b) => a && b && a.size === b.size && [...a].every((x) => b.has(x));
const unrec = (out, line) => out.split("\n").filter((l) => l.includes(`UNRECOGNISED MATCH store.mjs:${line} `));

try {
  /* F0 */
  console.log("F0 · the real store");
  const f0 = run("f0");
  ok(`F0: check-semantics is GREEN over the real store (exit ${f0.code})`, f0.code === 0, f0.out.slice(-600));
  ok(`F0: the harvest printed its state set — ${f0.states ? f0.states.size : -1} state(s), floor 8`,
     f0.states && f0.states.size >= 8 && f0.states.has("open"));
  const reach = /^store harvest reach:.*current_state compared (\d+)/m.exec(f0.out);
  ok(`F0: the harvest reached ${reach ? reach[1] : -1} current_state comparison(s) in code, floor 10`,
     reach && Number(reach[1]) >= 10);

  /* F1 */
  console.log("F1 · a planted typeof guard and two commented-out quotes");
  const f1 = run("f1", [
    "function d545Planted(x) {",
    "  if (typeof x.current_state === \"string\") return 1;",
    "  // if (x.current_state === \"nobody_wrote\") return 2;",
    "  /* x.current_state !== \"nobody_quoted\" */",
    "}",
  ]);
  ok(`F1: still GREEN (exit ${f1.code})`, f1.code === 0, f1.out.split("\n").filter((l) => /FAIL/.test(l)).join("\n       "));
  ok("F1: the state set is UNCHANGED from F0", same(f0.states, f1.states),
     `F0 ${f0.states && [...f0.states].sort()} · F1 ${f1.states && [...f1.states].sort()}`);
  ok("F1: none of `string`, `nobody_wrote`, `nobody_quoted` is counted as a state",
     f1.states && !["string", "nobody_wrote", "nobody_quoted"].some((s) => f1.states.has(s)));
  ok(`F1: the typeof guard is an UNRECOGNISED MATCH at store.mjs:${f1.at(1)}, named as a typeof guard`,
     unrec(f1.out, f1.at(1)).some((l) => /typeof/.test(l) && !/FAIL/.test(l)));
  ok(`F1: the line comment is an UNRECOGNISED MATCH at store.mjs:${f1.at(2)}, named as blanked`,
     unrec(f1.out, f1.at(2)).some((l) => /blanked by the lexer/.test(l)));
  ok(`F1: the block comment is an UNRECOGNISED MATCH at store.mjs:${f1.at(3)}, named as blanked`,
     unrec(f1.out, f1.at(3)).some((l) => /blanked by the lexer/.test(l)));

  /* F2 */
  console.log("F2 · a state the store genuinely writes, with no semantics row");
  const f2 = run("f2", [
    "function d545Genuine(id, row) {",
    "  this.#setScalar(id, \"current_state\", \"zombie\");",
    "  if (row.current_state !== \"revenant\") return 1;",
    "}",
  ]);
  ok(`F2: the check FAILS (exit ${f2.code})`, f2.code === 1);
  ok(`F2: it fails NAMING \`zombie\`, the written state, at store.mjs:${f2.at(1)}`,
     f2.out.split("\n").some((l) => /FAIL/.test(l) && /zombie/.test(l)), f2.out.slice(-800));
  ok(`F2: it fails NAMING \`revenant\`, the gated state, at store.mjs:${f2.at(2)}`,
     f2.out.split("\n").some((l) => /FAIL/.test(l) && /revenant/.test(l)));
  ok("F2: neither is counted as a state — each is an UNRECOGNISED MATCH",
     f2.states && !f2.states.has("zombie") && !f2.states.has("revenant")
     && unrec(f2.out, f2.at(1)).length === 1 && unrec(f2.out, f2.at(2)).length === 1);

  /* F3 */
  console.log("F3 · over-strictness: a real state in an unanticipated spelling");
  const f3 = run("f3", [
    "function d545Spelling(x, y) {",
    "  const u = \"http://example.invalid/a\"; if (typeof y === \"object\" && x.current_state===\"matured\") return u;",
    "}",
  ]);
  ok(`F3: GREEN (exit ${f3.code})`, f3.code === 0, f3.out.split("\n").filter((l) => /FAIL/.test(l)).join("\n       "));
  ok("F3: `matured` is harvested AS A STATE, and it was not in F0's set (so the arm can see it)",
     f0.states && !f0.states.has("matured") && f3.states && f3.states.has("matured"));
  ok("F3: and it is not reported as unrecognised", unrec(f3.out, f3.at(1)).length === 0);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log(`semantics-harvest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
