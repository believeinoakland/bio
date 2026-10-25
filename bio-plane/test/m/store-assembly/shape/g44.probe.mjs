/* store-assembly's copy of plane's shape helper. G44 at the platform's shape (K4426 (4); plan G44 (4); K4662, K4665): a workbook added as a workbook and a file previewed in the safe view are asked of the REAL DOOR (the object's own `fetch`:
 * `/workbookadd`, `/safeview`, `/workbook`, `/workbooklint`, `/workbookinputs`) in a child under TEST-SUPPORT #9's value limit whose old space is the cap `capFor(N)` (the one convention, G123a) for a file of N MB (
 * `diagnosis-R6-g40.md` section 1; 165 for the 1.44 MB workbook), the file HELD (its bytes put in the evidence store as the PDF's are; no reading ticks run, so the peaks are the ops'), a project and a member
 * set up (`spec.project`). Whether the door reaches both ops this way: it does (`harness.mjs` `spec.ops`, answers `{ok, result}` as the frame's). Pass, per case, is the contract of plan G44:
 *   add10    the 10 MiB-declared short-row workbook (73,843 rows, 221,529 cells, a 1.4 MB file): the add is refused WORKBOOK_TOO_LARGE with {cells, bound_cells}, nothing written, the child alive
 *   view10   the same file: the safe view answers kind "data" within its bound, the first sheet's truncated, next_row and total_rows stated, the child alive
 *   small    a workbook of about 20,000 cells (the re-walk's): added, read, linted, its inputs read, previewed (the cut, if any, stated)
 *   sheets   a workbook of 60 sheets: the view answers at most SAFE_VIEW_SHEETS_MAX sheets and states the total
 *   ods      an ODS above file-safety's ODS bound (25 MiB declared): the view states its refusal with size and bound, never ok without cells; odssmall one inside it, cut and stated
 *   big26    a workbook of 26.2 MB declared (over the entry's 20 MiB): the add refused WORKBOOK_FILE_TOO_LARGE {size, bound}, the view refused PREVIEW_NOT_DRAWN with size and bound
 *   csv4     a 4 MB CSV and csv17 a 17.7 MB CSV: the safe view answers alive with the cut stated (truncated, next_row, total_rows)
 *   node g44.probe.mjs [case ...]     (default: all; one run at a time) */
import { fileURLToPath } from "node:url";
import { shapeRun, capFor, xlsxDoc, odsDoc, heldCsvDoc, report } from "./harness.mjs";

export const SAFE_VIEW_ANSWER_MAX = 262_144;   /* the diagnosis measured 45 KB for the 10 MiB workbook; a bound well under the 2 MB an answer may take */
export const g44Cap = (bytes) => capFor(bytes / 1048576);   /* G123a: the one cap convention (the 39 is no second constant) */
const ME = "member:ann";
const viewQ = "/safeview?capture=$SHA&viewer=" + ME;
const readQ = (op) => `/${op}?capture=$SHA&project=$PROJECT&viewer=${ME}`;
const addBody = { captureSha: "$SHA", question: "What does the service cost?", period: "FY2025", project: "$PROJECT", by: ME };
const ADD = { op: "workbookadd", path: "/workbookadd", body: addBody };
const VIEW = { op: "safeview", path: viewQ };

export const CASES = {
  /* K4945: the add's cells row is 250,000 since G137e (K4831 (10), K4936): the 10 MiB-declared workbook (221,529 cells) is held whole,
     and the refusal is shown on one past the row (xlsxDoc(11.3), WORKBOOKS #6's J6) */
  add10: async () => ({ label: "G44 add of a workbook past the 250,000-cell row", doc: await xlsxDoc(11.3), ops: [ADD], check: (r, ops) => refusedAdd(ops[0], r) }),
  hold10: async () => ({ label: "G44 add of the 10 MiB-declared workbook, held whole", doc: await xlsxDoc(10), ops: [ADD], check: (r, ops) => (ops[0].ok === true ? [] : [`the add answered ${JSON.stringify([ops[0].ok, ops[0].reason])}`]) }),
  view10: async () => ({ label: "G44 safe view of the 10 MiB-declared workbook", doc: await xlsxDoc(10), ops: [VIEW], check: (r, ops) => cutView(ops[0], { sheets: 1, minTotal: 70_000 }) }),
  small: async () => ({ label: "G44 20,000-cell workbook (add, read, lint, inputs, view)", doc: await xlsxDoc(0.9), ops: [ADD, { op: "workbook", path: readQ("workbook") }, { op: "workbooklint", path: readQ("workbooklint") }, { op: "workbookinputs", path: readQ("workbookinputs") }, VIEW],
                        check: (r, ops) => [...(ops[0].ok === true ? [] : [`the add answered ${JSON.stringify([ops[0].ok, ops[0].reason])}`]),
                                            ...ops.slice(1, 4).flatMap((o) => (o.status === 200 && o.ok !== false ? [] : [`${o.op} answered ${JSON.stringify([o.status, o.ok, o.reason, o.err])}`])), ...viewStated(ops[4])] }),
  sheets: async () => ({ label: "G44 safe view of a 60-sheet workbook", doc: await xlsxDoc(0.5, { sheets: 60, rowsPerSheet: 100 }), ops: [VIEW],
                         check: (r, ops) => { const o = ops[0]; return o.sheets_total === 60 && (o.sheets.length === 60 || o.sheets_truncated === true) ? [] : [`sheets ${o.sheets && o.sheets.length}, sheets_total ${o.sheets_total}, sheets_truncated ${o.sheets_truncated}`]; } }),
  ods: async () => ({ label: "G44 safe view of an ODS of 25 MiB declared", doc: await odsDoc(25), ops: [VIEW], check: (r, ops) => statedNoPreview(ops[0]) }),
  odssmall: async () => ({ label: "G44 safe view of an ODS inside file-safety's bound (about 6 MB declared)", doc: await odsDoc(2.5), ops: [VIEW], check: (r, ops) => viewStated(ops[0]).concat(ops[0].ok === true ? [] : [`not drawn: ${ops[0].renderer_reason}`]) }),
  big26: async () => ({ label: "G44 add and safe view of a workbook above the entry's 20 MiB declared bound (26.2 MB)", doc: await xlsxDoc(26.2), ops: [ADD, VIEW],
                        check: (r, ops) => [...((ops[0].ok === false && ops[0].reason === "WORKBOOK_FILE_TOO_LARGE" && Number.isFinite(Number(ops[0].size)) && Number.isFinite(Number(ops[0].bound))) ? [] : [`the add answered ${JSON.stringify({ ok: ops[0].ok, reason: ops[0].reason, size: ops[0].size, bound: ops[0].bound })}, not WORKBOOK_FILE_TOO_LARGE with size and bound`]), ...statedNoPreview(ops[1])] }),
  csv4: async () => ({ label: "G44 safe view of a 4 MB CSV", doc: await heldCsvDoc(4 * 1048576), ops: [VIEW], check: (r, ops) => cutView(ops[0], { sheets: 1 }) }),
  csv17: async () => ({ label: "G44 safe view of a 17.7 MB CSV", doc: await heldCsvDoc(17_700_000), ops: [VIEW], check: (r, ops) => cutView(ops[0], { sheets: 1 }) }),
};

const viewStated = (o) => {
  if (!o || o.status !== 200 || o.err) return [`the safe view was not answered: ${JSON.stringify([o && o.status, o && o.err])}`];
  if (o.ok === true && o.kind === "data") { const s = (o.sheets || [])[0]; return s && typeof s.truncated === "boolean" && (s.truncated === false || (Number.isInteger(s.next_row) && "total_rows" in s)) ? [] : [`the first sheet does not state its cut: ${JSON.stringify(s)}`]; }
  return statedNoPreview(o);
};
const statedNoPreview = (o) => (o && o.ok === false && ["PREVIEW_NOT_DRAWN", "TOO_LARGE"].includes(o.renderer_reason) && Number.isFinite(o.size) && Number.isFinite(o.bound)) ? []
  : [`the view neither drew a stated cut nor stated its refusal with size and bound: ${JSON.stringify(o && { ok: o.ok, kind: o.kind, reason: o.reason, renderer_reason: o.renderer_reason, size: o.size, bound: o.bound })}`];
const cutView = (o, { sheets, minTotal = 0 }) => {
  if (!o || o.status !== 200 || o.err) return [`the safe view was not answered: ${JSON.stringify([o && o.status, o && o.err])}`];
  const f = [];
  if (o.ok !== true || o.kind !== "data") return [`the safe view did not answer data: ${JSON.stringify({ ok: o.ok, reason: o.reason, renderer_reason: o.renderer_reason })}`];
  if (o.answerBytes >= SAFE_VIEW_ANSWER_MAX) f.push(`the answer is ${o.answerBytes} B, not under ${SAFE_VIEW_ANSWER_MAX}`);
  const s = (o.sheets || [])[0];
  if (!s || !(s.n > 0)) f.push("the first sheet shows no cells");
  else if (s.truncated !== true || !Number.isInteger(s.next_row) || !Number.isInteger(s.total_rows) || s.total_rows < minTotal) f.push(`the first sheet does not state its cut: ${JSON.stringify(s)}`);
  if (sheets && (o.sheets || []).length !== sheets) f.push(`${(o.sheets || []).length} sheets, not ${sheets}`);
  return f;
};
const refusedAdd = (o, r) => {
  const f = [];
  if (!o || o.status !== 200 || o.err) return [`the add was not answered: ${JSON.stringify([o && o.status, o && o.err])}`];
  if (o.ok !== false || o.reason !== "WORKBOOK_TOO_LARGE") f.push(`the add answered ${JSON.stringify({ ok: o.ok, reason: o.reason })}, not WORKBOOK_TOO_LARGE`);
  else if (!Number.isFinite(o.cells) || !Number.isFinite(o.bound_cells)) f.push(`the refusal states no cells and bound_cells: ${JSON.stringify({ cells: o.cells, bound_cells: o.bound_cells })}`);
  const w = r.done && r.done.wbRows; if (w && (w.workbooks || w.cells)) f.push(`the refused add wrote ${JSON.stringify(w)}`);
  return f;
};

/** one case: the run, and the list of what failed (empty: pass) */
export async function runCase(name, capOverride = null) {
  const c = await CASES[name]();
  const cap = capOverride ?? g44Cap(c.doc.bytes);
  const r = await shapeRun({ doc: c.doc, feed: "held", project: true, noReading: true, readingFor: false, ops: c.ops }, { capMB: cap });
  return { name, label: c.label, cap, r, failed: r.died ? [`the child died: ${r.error || r.stderr || r.signal || "exit " + r.code}`] : [...c.check(r, r.ops), ...(r.overBound ? [`a stored value of ${r.largestStored} B is over 1 MiB`] : [])] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = process.argv.slice(2).filter((a) => CASES[a]); let worst = 0;
  for (const name of names.length ? names : Object.keys(CASES)) {
    const out = await runCase(name);
    console.log(report(out.label, out.r));
    console.log(`  ${out.failed.length ? "FAIL: " + out.failed.join("; ") : "PASS"} (cap ${out.cap} MB)`);
    if (out.failed.length) worst = 1;
  }
  process.exit(worst);
}
