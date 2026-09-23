/* finallyexit.mjs — A SUITE WHOSE `finally` EXITS MUST FOLLOW A CATCH THAT COUNTS (M0-134).
 *
 * THE DEFECT, measured rather than reasoned about. A suite shaped
 *
 *     try { ...assertions... } finally { await mf.dispose(); console.log(tally); process.exit(fail ? 1 : 0); }
 *
 * with NO `catch` turns a thrown fixture into a GREEN: the throw leaves the `try`,
 * the `finally` runs, prints the tally counted SO FAR and calls `process.exit(0)` —
 * and `process.exit` discards the pending exception, so node never reports it.
 * `test/severedhomes.test.mjs` ran exactly that way from REC-141 (IC-158) until
 * this row: it threw PROJECT_ID_SUPPLIED at its second fixture and printed
 * "1 pass, 0 fail", exit 0, for every battery in between.
 *
 * THE RULE. For every `finally` block whose body calls `process.exit(`, the clause
 * before it must be a `catch`, and that catch's body must COUNT A FAILURE — one of:
 *
 *   - increment a variable the finally's exit expression reads (`fail++`, `++fail`,
 *     `fail += n` where n is not a literal 0), or
 *   - call `process.exit(<non-zero literal>)`, or set `process.exitCode = <non-zero>`.
 *
 * An EMPTY `catch {}`, a catch that only logs, and a catch that re-throws are all
 * REFUSED: a re-throw is discarded by the finally's own `process.exit`, so it
 * reaches nobody. That is the liar this rule exists to reject.
 *
 * WHAT THIS CANNOT SEE, stated rather than implied:
 *   - It is a scanner over `stripToCode` (the estate's one lexer, imported from
 *     `walkfloor.mjs`, never copied), not a parser. Comments, strings and template
 *     text are blanked before any brace is counted.
 *   - A failure counted through a HELPER (`t("threw", false, true)`) is not
 *     recognised, and is reported as a catch that does not count — the strict
 *     direction, on purpose: write the increment where the rule can see it.
 *   - A suite that exits from somewhere other than a `finally` (a bare tail
 *     `process.exit`) is not this rule's subject: there a throw is an unhandled
 *     rejection and node exits non-zero by itself.
 *   - A `process.exit` reached through a function the finally CALLS is not seen.
 */

import { stripToCode } from "./walkfloor.mjs";

const matchForward = (code, open) => {          // index of the `}` closing the `{` at `open`
  let depth = 0;
  for (let k = open; k < code.length; k++) {
    if (code[k] === "{") depth++;
    else if (code[k] === "}" && --depth === 0) return k;
  }
  return -1;
};
const matchBackward = (code, close) => {        // index of the `{` opening the `}` at `close`
  let depth = 0;
  for (let k = close; k >= 0; k--) {
    if (code[k] === "}") depth++;
    else if (code[k] === "{" && --depth === 0) return k;
  }
  return -1;
};
const lineOf = (src, at) => src.slice(0, at).split("\n").length;

/** Does a catch body count a failure the finally's exit will read?
 *  `exitVars` are the identifiers the exit expression names (`["fail"]` for
 *  `process.exit(fail ? 1 : 0)`); an increment of any one of them counts. */
export function catchCounts(body, exitVars) {
  if (/process\.exit\(\s*[1-9]/.test(body)) return true;
  if (/process\.exitCode\s*=\s*[1-9]/.test(body)) return true;
  for (const exitVar of [].concat(exitVars || [])) {
    const v = exitVar.replace(/[$]/g, "\\$");
    if (new RegExp(`(?<![\\w$.])${v}\\s*\\+\\+|\\+\\+\\s*${v}(?![\\w$])`).test(body)) return true;
    const plus = new RegExp(`(?<![\\w$.])${v}\\s*\\+=\\s*([^;\\n]+)`).exec(body);
    if (plus && !/^0+\s*$/.test(plus[1].trim())) return true;
  }
  return false;
}

/** Every `finally` that exits, in one source. Each entry:
 *  { line, exitVars, hasCatch, counts, verdict } where verdict is
 *  "ok" | "no-catch" | "catch-does-not-count". */
export function scanFinallyExits(src) {
  const code = stripToCode(src);
  const out = [];
  for (const m of code.matchAll(/(?<![\w$.])finally\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    const close = matchForward(code, open);
    if (close < 0) continue;
    const body = code.slice(open, close + 1);
    /* The subject is an exit that CAN say 0. A finally that only ever exits with a
       non-zero literal (a control driver's `process.exit(3)` on a failed restore)
       cannot turn a throw into a green, so it is not this rule's business. */
    const exit = [...body.matchAll(/process\.exit\(([^)]*)\)/g)].find((e) => !/^\s*[1-9]\d*\s*$/.test(e[1]));
    if (!exit) continue;
    const exitVars = [...new Set((exit[1].match(/(?<![\w$.])[A-Za-z_$][\w$]*/g) || [])
      .filter((w) => !["true", "false", "null", "undefined", "typeof"].includes(w)))];
    // the clause before `finally`: its closing `}` and the keyword before its `{`
    let k = m.index - 1;
    while (k >= 0 && /\s/.test(code[k])) k--;
    let hasCatch = false, counts = false;
    if (code[k] === "}") {
      const cOpen = matchBackward(code, k);
      const head = code.slice(Math.max(0, cOpen - 200), cOpen);
      if (/(?<![\w$.])catch\s*(\([^()]*\))?\s*$/.test(head)) {
        hasCatch = true;
        counts = catchCounts(code.slice(cOpen, k + 1), exitVars);
      }
    }
    out.push({ line: lineOf(src, m.index), exitVars, hasCatch, counts,
      verdict: !hasCatch ? "no-catch" : counts ? "ok" : "catch-does-not-count" });
  }
  return out;
}
