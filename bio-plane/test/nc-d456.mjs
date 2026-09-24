/* D-456's negative control for `test/d456-namespace-scope.test.mjs`. Each arm ALONE against a uniquely-named pristine
 * copy of `src/index.mjs`; restore by cp, verified by sha256 AND by byte comparison, byte count floored.
 *
 *   A  THE BRIEF'S ARM — restore the fall-through to `bio` (the gate answers nothing, `scopeFor` defaults again,
 *      i.e. the pre-D-456 plane).  MUST FAIL at section 1's NAMESPACE_UNKNOWN assertions AND at the witness.
 *   B  the front-door gate alone disabled (`scopeFor` still strict).  MUST FAIL at section 1 (credentialed classes
 *      then meet SCOPE_REFUSED, and the no-credential path is answered).
 *   C  `scopeFor`'s own strictness alone reverted (the gate kept).  DECLARED GREEN: every op meets the gate first, so
 *      `scopeFor`'s refusal is depth that no op can reach — recorded, not smoothed.
 *   D  OVER-STRICTNESS — the gate refuses `bio` as well.  MUST FAIL at section 3 (bio answers as today).
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./d456-namespace-scope.test.mjs", import.meta.url));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const PEN = controlPen("d456");
const PRISTINE = readFileSync(SRC);
if (PRISTINE.length < 100000) throw new Error(`pristine index.mjs is ${PRISTINE.length} bytes — refusing to arm`);
const H0 = hash(PRISTINE);

const GATE_ON = `  if (NAMESPACES.includes(asked)) return null;\n  /* DEC-49 REGION is-namespace-gate */`;
const SCOPE_ON = `  if (named && !NAMESPACES.includes(asked))\n    return { error:`;
const ARMS = [
  { id: "A", declared: "FAIL", must: /FAIL  admin · read op=stats · store="biosmoke-pdf" -> 400 NAMESPACE_UNKNOWN/,
    also: /FAIL  witness: the REAL record's counters did not move/,
    patch: [[GATE_ON, `  return null;\n  /* DEC-49 REGION is-namespace-gate */`],
            [SCOPE_ON, `  if (false)\n    return { error:`]] },
  { id: "B", declared: "FAIL", must: /FAIL  member · mutating op=promote · store="Scratch" -> 400 NAMESPACE_UNKNOWN/,
    also: /FAIL  none · mutating op=enroll · store="biosmoke-pdf"/,
    patch: [[GATE_ON, `  return null;\n  /* DEC-49 REGION is-namespace-gate */`]] },
  { id: "C", declared: "GREEN", patch: [[SCOPE_ON, `  if (false)\n    return { error:`]] },
  { id: "D", declared: "FAIL", must: /FAIL  admin · whoami · store=bio -> ok, store bio/,
    patch: [[`  if (NAMESPACES.includes(asked)) return null;`, `  if (asked === "scratch") return null;`]] },
];

const rows = [];
for (const arm of ARMS) {
  const aside = `${PEN}/index.mjs.nc-d456-${arm.id}.pristine`;
  copyFileSync(SRC, aside);
  let text = PRISTINE.toString("utf8"), armed = true;
  for (const [from, to] of arm.patch) {
    const n = text.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${arm.id}: anchor matched ${n} times — NOT ARMED`); break; }
    text = text.replace(from, to);
  }
  let exit = null, out = "";
  if (armed) {
    writeFileSync(SRC, text);
    const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000 });
    exit = r.status; out = (r.stdout || "") + (r.stderr || "");
  }
  copyFileSync(aside, SRC); rmSync(aside);
  const back = readFileSync(SRC);
  const restored = hash(back) === H0 && Buffer.compare(back, PRISTINE) === 0;
  const foot = out.match(/d456-namespace-scope: (\d+) passed, (\d+) failed/);
  let actual = !armed ? "NOT ARMED" : !foot ? "NO FOOT (-1)" : exit === 0 ? "GREEN" : "FAIL";
  let named = true;
  if (actual === "FAIL" && arm.must) named = arm.must.test(out) && (!arm.also || arm.also.test(out));
  const asDeclared = actual === arm.declared && named;
  rows.push({ id: arm.id, declared: arm.declared, actual, named, asDeclared, restored,
              tally: foot ? `${foot[1]}/${Number(foot[1]) + Number(foot[2])}` : "-1" });
  if (!asDeclared) console.log(out.split("\n").filter((l) => /FAIL|Error/.test(l)).slice(0, 12).join("\n"));
}
for (const r of rows)
  console.log(`  arm ${r.id}: declared ${r.declared}, actual ${r.actual}${r.actual === "FAIL" ? ` (named assertion ${r.named ? "seen" : "NOT SEEN"})` : ""} · ${r.tally} · restore ${r.restored ? "sha256+cmp identical" : "MISMATCH"} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
const ok = rows.every((r) => r.asDeclared && r.restored) && hash(readFileSync(SRC)) === H0;
console.log(`nc-d456: ${rows.filter((r) => r.asDeclared).length}/${rows.length} arms as declared · index.mjs sha256 ${H0.slice(0, 12)} ${hash(readFileSync(SRC)) === H0 ? "restored" : "NOT RESTORED"}`);
process.exitCode = ok ? 0 : 1;
