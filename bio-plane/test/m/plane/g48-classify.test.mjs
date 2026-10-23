/* plane R86 (proposed, fix round 6, G48; K4673, K4685; docprofile R5, R19, R38), THE COMPOSITION OF THE CLASSIFICATION: the one place that registers all 17 real types (`registerReaders()`) and reads every
   module's fixtures through them. (c1) The shared second pass and the bounded view change no answer for a text under the bound: `doctypeFor` and `readText` over every doctype, roster, budget and court fixture
   give, byte for byte, what the 17 types gave on the tip before G48 (`fixtures/g48-plane-answers.json`, recorded by `make-g48-plane-answers.mjs` on 713e63be2e), and `also` is `alsoFor`'s. (c2) A 3 MiB sheet of a
   roster's, a directory's, a chart's, a budget table's and a budget volume's rows is classified from a stated view and gets the type, confidence and `also` keys the whole text gets; a 1 MiB sheet is classified whole,
   stating nothing. (c3) The named limit: a block an absolute-count type needs (an enacting clause and recitals, a masthead and motions, file-number lines and item blocks, a report's lines, a directory) set wholly in a
   gap between the view's windows is not seen (generic, `classified_over` stated) while the whole text gives the type; the same block in a window gives the type. Each difference is pinned and fails loudly if it moves. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { corpus } from "./g48-corpus.mjs";
import { flattenText, identify, doctypeFor, alsoFor, readText } from "../../../../docprofile/registry.mjs";
import { budgetVolumeText } from "../../../../roster-reader/test/shape-texts.mjs";
import { view as dtView, PORT_ALDER, PA_BYLAW, PA_MINUTES, PA_AGENDA, PA_REPORT, PA_DIRECTORY } from "../../../../doctypes/test/fixtures.mjs";
import { firstView as budgetView } from "../../../../budget-doctypes/test/helpers.mjs";

const MiB = 1048576, NOW = "2026-03-20T12:00:00Z";
const recorded = JSON.parse(fs.readFileSync(new URL("./fixtures/g48-plane-answers.json", import.meta.url), "utf8")).readings;
const CORPUS = new Map(corpus().map(([id, s, c]) => [id, [s, c]]));
const wholeOf = (supplied, ctx) => {
  const flat = flattenText(supplied), pages = supplied && typeof supplied === "object" && Array.isArray(supplied.pages) ? supplied.pages : [];
  const dctx = { ...ctx, text: flat.text, pages }, stack = identify(dctx), kctx = { ...dctx, handler: stack.handler, kind: stack.kind };
  return { flat, stack, kctx, d: doctypeFor(kctx) };
};
const keys = (also) => (also || []).map((x) => x.key);
/** `chars` characters made of whole lines of `text`, repeated (a row of the fixture is a row of the sheet) */
function repeated(text, chars) {
  const lines = text.split("\n").filter((l) => l.trim()); const out = []; let n = 0;
  for (let i = 0; n < chars; i++) { const l = lines[i % lines.length]; out.push(l); n += l.length + 1; }
  return out.join("\n");
}
const sheetOf = (t) => ({ document: t, sheets: [{ name: "Sheet1", text: t }], container: "csv" });
const CSV = { content_type: "text/csv" };

test("R86 G48 (c1): doctypeFor and readText over every fixture of the doctype, roster, budget and court modules, through all 17 real types, give what the tip before G48 gave, and also is alsoFor's", () => {
  assert.deepEqual([...CORPUS.keys()], Object.keys(recorded));
  let withAlso = 0;
  for (const [id, [supplied, ctx]] of CORPUS) {
    const { flat, kctx, d } = wholeOf(supplied, ctx), rt = readText(supplied, ctx), want = recorded[id];
    const got = JSON.parse(JSON.stringify({ chars: flat.text.length, type: d.type.key, confidence: d.confidence, signals: d.signals, considered: d.considered, also: d.also, why: d.why ?? null,
      read: { determined: rt.determined, type: rt.doctype && rt.doctype.type.key, confidence: rt.doctype && rt.doctype.confidence, also: rt.doctype && rt.doctype.also, parse_error: rt.parse_error,
              stack: rt.stack && { handler: rt.stack.handler && rt.stack.handler.key, kind: rt.stack.kind } } }));
    assert.deepEqual(got, want, id);
    assert.equal("classified_over" in rt, false, `${id}: nothing here is a sheet over the bound`);
    assert.deepEqual(d.also, alsoFor(kctx, d.type.key), id);
    withAlso += d.also.length ? 1 : 0;
  }
  assert.ok(withAlso >= 1, "the corpus holds a reading with an also");
});

const C2 = [
  ["a staff roster's rows", () => repeated(flattenText(CORPUS.get("roster:roster_committee")[0]).text, 0), "roster:roster_committee", "staff_roster"],
  ["a staff directory's rows", null, "doctypes:fw20:directory_nss@held", "staff_directory"],
  ["an org chart's rows", null, "roster:chart_opd", "org_chart"],
];
function sheetsC2() {
  const base = (id) => flattenText(CORPUS.get(id)[0]).text, ctxOf = (id) => ({ ...CORPUS.get(id)[1], ...CSV });
  const budgetRows = base("budget:fy2019-21-adopted.csv").split("\n").slice(1).map((l) => l.replaceAll(",", "\t")).join("\n");
  return [
    { what: "a staff roster's rows", text: (n) => repeated(base("roster:roster_committee"), n), ctx: ctxOf("roster:roster_committee"), type: "staff_roster" },
    { what: "a staff directory's rows", text: (n) => repeated(base("doctypes:fw20:directory_nss@held"), n), ctx: ctxOf("doctypes:fw20:directory_nss@held"), type: "staff_directory" },
    { what: "an org chart's rows", text: (n) => repeated(base("roster:chart_opd"), n), ctx: ctxOf("roster:chart_opd"), type: "org_chart" },
    { what: "a budget table (a fund and an amount header)", text: (n) => repeated("Fund\tDepartment\tAmount\n" + budgetRows, n), ctx: { view: budgetView(), now: NOW, ...CSV }, type: "budget_table" },
    { what: "a budget volume's text", text: (n) => budgetVolumeText(n), ctx: { view: budgetView(), now: NOW, ...CSV }, type: "generic" },
  ];
}
for (const c of sheetsC2()) {
  test(`R86 G48 (c2): a 3 MiB sheet of ${c.what} is classified from a stated view and gets the type, confidence and also keys the whole text gets; a 1 MiB sheet is classified whole and states nothing`, { timeout: 600_000 }, () => {
    for (const [chars, sampled] of [[3 * MiB, true], [1 * MiB, false]]) {
      const text = c.text(chars), rt = readText(sheetOf(text), c.ctx), w = wholeOf(text, c.ctx);
      assert.equal(w.d.type.key, c.type, "the whole text gives the type the sheet is of");
      assert.equal(rt.doctype.type.key, w.d.type.key); assert.equal(rt.doctype.confidence, w.d.confidence);
      assert.deepEqual(keys(rt.doctype.also), keys(w.d.also));
      assert.deepEqual(rt.stack, w.stack, "the stack is identify's over the whole text");
      assert.equal(!!rt.classified_over, sampled, `classified_over is ${sampled ? "stated" : "absent"} at ${chars} characters`);
      if (sampled) assert.ok(rt.classified_over.chars < rt.classified_over.of && /judged from/.test(rt.why || ""), "the view is stated in why");
    }
  });
}

/* (c3) the named limit: the blocks are the fixtures' own whole documents, set in a table of rows, in the gap between two windows of the result's own `classified_over`, and in a window */
const PA = { view: dtView(PORT_ALDER), now: NOW, ...CSV };
const rowsTable = (chars) => repeated(Array.from({ length: 200 }, (_, i) => `row ${i}\tvalue ${i * 7}\tPA-${100 + (i % 50)}`).join("\n"), chars).split("\n").map((l, i) => l + i).join("\n");
const lineAt = (t, at) => { const nl = t.indexOf("\n", at); return nl < 0 ? t.length : nl + 1; };
const DECIDERS = [["a regulation's enacting clause and recitals", PA_BYLAW, "regulation"], ["minutes' masthead and motions", PA_MINUTES, "meeting_minutes"],
                  ["an agenda's file-number lines and item blocks", PA_AGENDA, "meeting_agenda"], ["a staff report's lines", PA_REPORT, "staff_report"], ["a staff directory", PA_DIRECTORY, "staff_directory"]];
for (const [what, block, type] of DECIDERS) {
  test(`R86 G48 (c3): ${what} set wholly in a gap between the windows of a 3 MiB sheet is not seen (generic, classified_over stated) while the whole text is ${type}; set inside a window it is ${type}`, { timeout: 600_000 }, () => {
    const b = Array.isArray(block) ? block.join("\n") : String(block), base = rowsTable(3 * MiB);
    const co = readText(sheetOf(base), PA).classified_over;
    assert.ok(co && co.windows.length >= 2);
    const at = { gap: Math.floor((co.windows[4].to + co.windows[5].from) / 2), window: Math.floor((co.windows[3].from + co.windows[3].to) / 2) };
    for (const where of ["gap", "window"]) {
      const p = lineAt(base, at[where]), t = base.slice(0, p) + b + "\n" + base.slice(p);
      const rt = readText(sheetOf(t), PA), w = wholeOf(t, PA);
      const inView = rt.classified_over.windows.some((x) => p >= x.from && p + b.length <= x.to) || p + b.length <= rt.classified_over.head_chars;
      assert.equal(inView, where === "window", `the block lies ${where === "window" ? "inside a window" : "in a gap"} of the result's own view`);
      assert.equal(w.d.type.key, type, "the whole text gives the type");
      assert.ok(rt.classified_over, "classified_over is stated");
      assert.equal(rt.doctype.type.key, where === "gap" ? "generic" : type, `${where}: the sampled answer`);
    }
  });
}

const BUDGET_SHEET = "Fund\tDepartment\tAmount\n" + Array.from({ length: 20 }, (_, i) => `100${i}\tPolice ${i}\t${i * 1000}`).join("\n");
const BOOK_CTX = { view: budgetView(), now: NOW, content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
const bookOf = (parts) => ({ document: parts.map((x) => x.text).join("\n"), sheets: parts, container: "xlsx" });

test("R86 G48 (c3): a small budget sheet (a fund and an amount header, no cells) that lies in a gap of a large workbook is read through the sheet heads: budget_table, where the whole text gives generic (stated as a difference)", { timeout: 600_000 }, () => {
  const base = rowsTable(3 * MiB), co = readText(sheetOf(base), BOOK_CTX).classified_over;
  const p = lineAt(base, Math.floor((co.windows[4].to + co.windows[5].from) / 2));
  const supplied = bookOf([{ name: "Rows", text: base.slice(0, p - 1) }, { name: "Budget", text: BUDGET_SHEET }, { name: "More rows", text: base.slice(p) }]);
  const rt = readText(supplied, BOOK_CTX), w = wholeOf(supplied.document, BOOK_CTX);
  assert.equal(w.d.type.key, "generic", "today's whole-text answer: only the first 20 lines of the text are read for the header row");
  assert.equal(rt.doctype.type.key, "budget_table", "the sampled answer reads the budget sheet's head");
  assert.ok(rt.classified_over.heads_used === true && rt.classified_over.sheet_heads.length >= 1, `the head used is stated: ${JSON.stringify([rt.classified_over.heads_used, rt.classified_over.sheet_heads])}`);
});

test("R86 G48 (c3): a small budget sheet that is the LAST sheet of a large workbook lies in the view's last window, after the rows, so its header is not among the first 20 lines the type reads: generic, as the whole text gives (pinned)", { timeout: 600_000 }, () => {
  const supplied = bookOf([{ name: "Rows", text: rowsTable(3 * MiB) }, { name: "Budget", text: BUDGET_SHEET }]);
  const rt = readText(supplied, BOOK_CTX), w = wholeOf(supplied.document, BOOK_CTX);
  assert.equal(w.d.type.key, "generic");
  assert.equal(rt.doctype.type.key, "generic");
  assert.ok(rt.classified_over && rt.classified_over.sheet_heads.length === 0);
});
