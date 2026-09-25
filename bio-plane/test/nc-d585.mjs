/* D-585's negative control for `test/textshown.test.mjs`. Each arm ALONE; every file an arm touches is copied to a
 * uniquely-named pristine in the pen, restored by cp, verified by sha256 AND by byte comparison, byte count floored.
 *
 *   A  THE ROW'S ARM — count a bare `BT` as text again (added to TEXT_SHOWING_OPERATORS, the ONE list).  MUST FAIL
 *      on BOTH halves by name: tier 1 stops marking the CAFR-shape page AND the renderer refuses it.
 *   B  the renderer alone: its old `SHOW_TEXT_BLOCK` test joins `hasTextOps` again.  MUST FAIL at the renderer's
 *      admission; MUST NOT fail tier 1's marker.
 *   C  tier 1 alone: its condition back to "no font declared".  MUST FAIL at tier 1's marker; MUST NOT fail the
 *      renderer's admission.
 *   D1 `null` read as `false` on the FORM path (a drawn form that does not resolve counted as "shows nothing").
 *      MUST FAIL at the unresolvable-form arms; MUST NOT fail the undecodable-stream arm.
 *   D2 `null` read as `false` on the PAGE path (the page's own undecodable stream counted as "shows nothing").
 *      MUST FAIL at the undecodable-stream arm AND tier 1's "UNDETERMINED is not NO"; MUST NOT fail the form arm.
 *   E  OVER-STRICTNESS — the operator list reordered.  DECLARED GREEN.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const PDFS = fileURLToPath(new URL("../src/pdfstructure.mjs", import.meta.url));
const PIX = fileURLToPath(new URL("../../pdf-worker/src/pagepixels.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./textshown.test.mjs", import.meta.url));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const PEN = controlPen("d585");
const FILES = { [PDFS]: readFileSync(PDFS), [PIX]: readFileSync(PIX) };
for (const [f, b] of Object.entries(FILES))
  if (b.length < 20000) throw new Error(`pristine ${f} is ${b.length} bytes — refusing to arm`);
const H0 = Object.fromEntries(Object.entries(FILES).map(([f, b]) => [f, hash(b)]));

const OPS = `export const TEXT_SHOWING_OPERATORS = Object.freeze(["Tj", "TJ", "'", '"']);`;
const TIER1 = "tier 1 MARKS the CAFR-shape page";
const RENDER = "the OCR member's renderer ADMITS the CAFR-shape page";
const ARMS = [
  { id: "A", declared: "FAIL", must: [TIER1, RENDER],
    patch: [[PDFS, OPS, `export const TEXT_SHOWING_OPERATORS = Object.freeze(["Tj", "TJ", "'", '"', "BT"]);`]] },
  { id: "B", declared: "FAIL", must: [RENDER], mustNot: [TIER1],
    patch: [[PIX, "    hasTextOps: textShown === true,", "    hasTextOps: textShown === true || /(^|\\s)BT(\\s|$)/.test(masked),"]] },
  { id: "C", declared: "FAIL", must: [TIER1], mustNot: [RENDER],
    patch: [[PDFS, "      && (!fontDict || (await pageShowsText(doc, pageMap)) === false)) {", "      && !fontDict) {"]] },
  /* D WAS ONE ARM ON THE FIRST RUN, and it disagreed — a finding about the ARM. It was declared at the undecodable-
     STREAM assertion and armed at `unread`; that fixture never reaches `unread`, it leaves by the early return when
     the page's own streams do not decode. It failed instead at the unresolvable-FORM arms, which is what `unread`
     governs. So there are two `null`s and two arms, each declared at the path it actually breaks. */
  { id: "D1", declared: "FAIL", must: ["UNDETERMINED: a Do naming nothing answers null", "nor one drawing a form that does not resolve"],
    mustNot: ["UNDETERMINED: an undecodable content stream answers null"],
    patch: [[PDFS, "  return unread ? null : false;", "  return false;"]] },
  { id: "D2", declared: "FAIL", must: ["UNDETERMINED: an undecodable content stream answers null", "UNDETERMINED is not NO"],
    mustNot: ["UNDETERMINED: a Do naming nothing answers null"],
    patch: [[PDFS, "  if (top.text == null) return null;\n  let unread = false;", "  if (top.text == null) return false;\n  let unread = false;"]] },
  { id: "E", declared: "GREEN",
    patch: [[PDFS, OPS, `export const TEXT_SHOWING_OPERATORS = Object.freeze(['"', "'", "TJ", "Tj"]);`]] },
];

const rows = [];
for (const arm of ARMS) {
  const touched = [...new Set(arm.patch.map(([f]) => f))];
  const aside = Object.fromEntries(touched.map((f) => [f, `${PEN}/${f.split("/").pop()}.nc-d585-${arm.id}.pristine`]));
  for (const f of touched) copyFileSync(f, aside[f]);
  const text = Object.fromEntries(touched.map((f) => [f, FILES[f].toString("utf8")]));
  let armed = true;
  for (const [f, from, to] of arm.patch) {
    const n = text[f].split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${arm.id}: anchor matched ${n} times in ${f.split("/").pop()} — NOT ARMED`); break; }
    text[f] = text[f].replace(from, to);
  }
  let exit = null, out = "";
  if (armed) {
    for (const f of touched) writeFileSync(f, text[f]);
    const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000 });
    exit = r.status; out = (r.stdout || "") + (r.stderr || "");
  }
  let restored = true;
  for (const f of touched) {
    copyFileSync(aside[f], f); rmSync(aside[f]);
    const back = readFileSync(f);
    restored = restored && hash(back) === H0[f] && Buffer.compare(back, FILES[f]) === 0;
  }
  const foot = out.match(/textshown: (\d+) passed, (\d+) failed/);
  const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
  const actual = !armed ? "NOT ARMED" : !foot || /SUITE ENDED BEFORE/.test(out) ? "NO FOOT (-1)" : exit === 0 ? "GREEN" : "FAIL";
  const named = (arm.must || []).every((m) => failed.some((l) => l.startsWith(m)))
             && (arm.mustNot || []).every((m) => !failed.some((l) => l.startsWith(m)));
  const asDeclared = actual === arm.declared && (actual !== "FAIL" || named);
  rows.push({ id: arm.id, declared: arm.declared, actual, named, asDeclared, restored, failed,
              tally: foot ? `${foot[1]} pass, ${foot[2]} fail` : "-1" });
}
for (const r of rows) {
  console.log(`  arm ${r.id}: declared ${r.declared}, actual ${r.actual}${r.actual === "FAIL" ? ` (named ${r.named ? "as declared" : "NOT as declared"})` : ""} · ${r.tally} · restore ${r.restored ? "sha256+cmp identical" : "MISMATCH"} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const l of r.failed) console.log(`      FAIL ${l}`);
}
const now = Object.keys(FILES).every((f) => hash(readFileSync(f)) === H0[f]);
const ok = rows.every((r) => r.asDeclared && r.restored) && now;
console.log(`nc-d585: ${rows.filter((r) => r.asDeclared).length}/${rows.length} arms as declared · sources ${now ? "restored" : "NOT RESTORED"} (pdfstructure ${H0[PDFS].slice(0, 12)}, pagepixels ${H0[PIX].slice(0, 12)})`);
process.exitCode = ok ? 0 : 1;
