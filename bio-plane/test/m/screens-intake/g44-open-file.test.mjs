/* screens-intake R5, R36 (G44): the safe view of a spreadsheet draws what the answer says, a cut or an unreadable sheet and a file no
 * preview can show stated by key; the answers are built to file-safety's contract (no `uses` edge to it). The rows of the five new words
 * are file-safety's, in setup-words' table once BOB regenerates it: until then the drawing tests that name them stop at UNKNOWN_WORD. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, press, ok, refused, word, says, rawKeys } from "./page.mjs";

const SHA = "f".repeat(64);
const STATE = { threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }), originalstate: ok({ may_open: true, path: "warned", why: null }),
  verdictnotes: ok({ ok: true, notes: [] }), scanfindings: ok({ ok: true, findings: [] }) };
const cells = (n) => Array.from({ length: n }, (_, i) => ({ ref: `A${i + 1}`, value: `v${i + 1}`, type: "s" }));
const drawn = async (safeview) => { const p = await open(`/app/open-file/${SHA}`, { plane: { ...STATE, safeview } }); await press(p, "safeview", { reason: "to read it" }); return p; };
const data = (sheets, more = {}) => ok({ ok: true, kind: "data", derived: true, sheets, sheets_total: sheets.length, sheets_truncated: false, ...more });
const MB = (n) => (n / 1048576).toFixed(1);
const cutWords = ["screen.open-file.safe.cut", "screen.open-file.safe.cut.more", "screen.open-file.safe.sheetscut", "screen.open-file.safe.sheet.unreadable"];

test("R5 R36 a cut sheet draws the rows shown of the total by key; a sheet of unknown total says the same without it", async () => {
  const p = await drawn(data([{ name: "FY22", cells: cells(3), rows: { from: 1, to: 3 }, total_rows: 9000, truncated: true, next_row: 4 }]));
  assert.ok(says(p, "screen.open-file.safe.cut", { from: 1, to: 3, total: 9000 }));
  assert.match(html(p), /<td>A3<\/td><td>v3<\/td>/);
  const q = await drawn(data([{ name: "FY22", cells: cells(3), rows: { from: 1, to: 3 }, total_rows: null, truncated: true, next_row: 4 }]));
  assert.ok(says(q, "screen.open-file.safe.cut.more", { from: 1, to: 3 }));
  assert.deepEqual(rawKeys(q), []);
});

test("R5 R36 a whole sheet and an answer from an older record draw no cut, no sheet statement", async () => {
  const whole = await drawn(data([{ name: "FY22", cells: cells(2), rows: { from: 1, to: 2 }, total_rows: 2, truncated: false, next_row: null }]));
  const old = await drawn(ok({ ok: true, kind: "data", derived: true, sheets: [{ name: "FY22", cells: cells(2) }] }));
  for (const p of [whole, old]) {
    assert.match(html(p), /<td>A2<\/td><td>v2<\/td>/);
    /* no sentence of the four is in the page: their keys are not even asked for when nothing is cut */
    assert.equal(main(p).querySelectorAll(".mk-note").length, 0);
  }
});

test("R5 R36 a cut list of sheets says how many of how many are shown; a sheet that could not be shown says so, with no empty table", async () => {
  const sheets = [{ name: "One", cells: cells(1), rows: { from: 1, to: 1 }, total_rows: 1, truncated: false, next_row: null },
    { name: "Two", cells: [], rows: null, total_rows: null, truncated: false, next_row: null, reason: "sheet_unreadable" }];
  const p = await drawn(data(sheets, { sheets_total: 40, sheets_truncated: true }));
  assert.ok(says(p, "screen.open-file.safe.sheetscut", { shown: 2, total: 40 }));
  assert.ok(says(p, "screen.open-file.safe.sheet.unreadable", { name: "Two" }));
  assert.equal(main(p).querySelectorAll("table").length, 1, "only the readable sheet draws a table");
  for (const k of cutWords) assert.ok(typeof word(k, { from: 1, to: 1, total: 1, shown: 1, name: "x" }) === "string", k);
});

test("R5 R36 a refusal with a size and a bound draws the no-preview sentence in MB; one without them draws as before", async () => {
  for (const reason of ["TOO_LARGE", "PREVIEW_NOT_DRAWN"]) {
    const size = 30 * 1048576 + 52429, bound = 25 * 1048576;
    const p = await drawn(refused("SAFE_VIEW_FAILED", "The safe view could not be made.", 422, { renderer_reason: reason, size, bound, format: "xlsx" }));
    assert.ok(says(p, "screen.open-file.safe.notdrawn", { size: MB(size), bound: MB(bound) }), reason);
    assert.ok(!text(p).includes("The safe view could not be made."), "not the generic sentence alone");
    assert.equal(main(p).querySelectorAll("table").length, 0, "never an empty table");
  }
  const plain = await drawn(refused("SAFE_VIEW_FAILED", "The safe view could not be made.", 422, { renderer_reason: "TOO_LARGE" }));
  assert.match(text(plain), /The safe view could not be made\./);
});
