/* D-461's negative control for `test/d461-pinned-namespace.test.mjs`. Each arm ALONE against a uniquely-named pristine
 * copy of `src/index.mjs`; restore by cp, verified by sha256 AND by byte comparison, byte count floored.
 *
 *   A  THE BRIEF'S ARM — accept and ignore the parameter again (the gate answers nothing, i.e. the pre-D-461 plane).
 *      MUST FAIL at section 1's knock assertion BY NAME AND at the witness (the knock lands in `bio`).
 *   B  a partial fix — `knock` added to the exemption list, every other pinned op still refused.  MUST FAIL at the
 *      knock assertion and the witness, and at the exemption-list pin.
 *   C  OVER-STRICTNESS — the gate refuses ANY named `store=`, `bio` included.  MUST FAIL at section 3
 *      (`op=verify · store=bio -> not NAMESPACE_PINNED`).
 *   D  OVER-STRICTNESS — the exemption list emptied, so the three ops that do address scratch are refused too.
 *      MUST FAIL at section 3 (`exempt · op=instancegroup · store=scratch -> answered from scratch`).
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./d461-pinned-namespace.test.mjs", import.meta.url));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const PEN = controlPen("d461");
const PRISTINE = readFileSync(SRC);
if (PRISTINE.length < 100000) throw new Error(`pristine index.mjs is ${PRISTINE.length} bytes — refusing to arm`);
const H0 = hash(PRISTINE);

/* RE-ANCHORED 2026-09-24 by CONDUCT #19 (c19-batch11): the plane's list gained `groupidentity` at the union (REC-164's op
   addresses scratch itself); the anchor follows it, and arm B appends after it. The arms are otherwise unchanged. */
const EXEMPT = `const SCRATCH_ADDRESSING_PUBLIC_OPS = Object.freeze(["invitelook", "enroll", "instancegroup", "groupidentity"]);`;
const ASKED = `  if (url.searchParams.get("store") !== SCRATCH) return null;\n  /* DEC-49 REGION is-pinned-namespace-gate */`;
const KNOCK_FAIL = /FAIL  no credential · op=knock · store=scratch -> 400 NAMESPACE_PINNED/;
const WITNESS_FAIL = /FAIL  witness: after the refused knock the REAL record's counters did not move/;
const ARMS = [
  { id: "A", declared: "FAIL", must: [KNOCK_FAIL, WITNESS_FAIL],
    patch: [[ASKED, `  return null;\n  /* DEC-49 REGION is-pinned-namespace-gate */`]] },
  { id: "B", declared: "FAIL", must: [KNOCK_FAIL, WITNESS_FAIL, /FAIL  the plane's exemption list is exactly the four/],
    patch: [[EXEMPT, EXEMPT.replace(`"groupidentity"]`, `"groupidentity", "knock"]`)]] },
  { id: "C", declared: "FAIL", must: [/FAIL  op=verify · store=bio -> not NAMESPACE_PINNED/],
    patch: [[ASKED, `  if (!url.searchParams.has("store")) return null;\n  /* DEC-49 REGION is-pinned-namespace-gate */`]] },
  { id: "D", declared: "FAIL", must: [/FAIL  exempt · op=instancegroup · store=scratch -> answered from scratch/],
    patch: [[EXEMPT, `const SCRATCH_ADDRESSING_PUBLIC_OPS = Object.freeze([]);`]] },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patch.map(([find, put]) => ({ arm: a.id, file: SRC, find, put }))));

const rows = [];
for (const arm of ARMS) {
  const aside = `${PEN}/index.mjs.nc-d461-${arm.id}.pristine`;
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
  const foot = out.match(/d461-pinned-namespace: (\d+) passed, (\d+) failed/);
  const actual = !armed ? "NOT ARMED" : !foot ? "NO FOOT (-1)" : exit === 0 ? "GREEN" : "FAIL";
  const named = actual !== "FAIL" || (arm.must || []).every((re) => re.test(out));
  const asDeclared = actual === arm.declared && named;
  rows.push({ id: arm.id, declared: arm.declared, actual, named, asDeclared, restored,
              tally: foot ? `${foot[1]}/${Number(foot[1]) + Number(foot[2])}` : "-1" });
  if (!asDeclared) console.log(out.split("\n").filter((l) => /FAIL|Error/.test(l)).slice(0, 12).join("\n"));
}
for (const r of rows)
  console.log(`  arm ${r.id}: declared ${r.declared}, actual ${r.actual}${r.actual === "FAIL" ? ` (named assertions ${r.named ? "seen" : "NOT SEEN"})` : ""} · ${r.tally} · restore ${r.restored ? "sha256+cmp identical" : "MISMATCH"} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
const ok = rows.every((r) => r.asDeclared && r.restored) && hash(readFileSync(SRC)) === H0;
console.log(`nc-d461: ${rows.filter((r) => r.asDeclared).length}/${rows.length} arms as declared · index.mjs sha256 ${H0.slice(0, 12)} ${hash(readFileSync(SRC)) === H0 ? "restored" : "NOT RESTORED"} (${PRISTINE.length} bytes)`);
process.exitCode = ok ? 0 : 1;
