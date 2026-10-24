/* file-safety R11 (fix round 9, G137a, G137b; K4831 (10); DOCS Q3/S2, SHEET B-6/E-26/X03): the safe view is a view, not a reading, and says so;
   the 500 pages are stated; a sheet pages by `next_row`. At the module's interface through the op the screens send (`safeview`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc } from "./fixture.mjs";
import { fileSafetyOps, SAFE_VIEW_CELLS_MAX, SAFE_VIEW_PAGES_MAX } from "../../../src/file-safety/index.mjs";
import { smallSheetXml, xlsxOf } from "./g44-fixtures.mjs";

const V = "member:m1";
const op = (w, sha, extra = "") => fileSafetyOps(w.fs, new URL(`http://x/safeview?capture=${sha}&viewer=${V}${extra}`), {}, w.env).safeview();
const described = async (r) => JSON.parse(r.headers.get("x-file-safety"));

test("R11 G137a: a view cut at the page cap says by key that it is the first pages of the document's source pages, with both figures, and that it is a view and not a reading; a view of a whole document says only that it is a view", async () => {
  assert.equal(SAFE_VIEW_PAGES_MAX, 500);
  const w = world({ scan: { render: (sha) => (sha === w600 ? { bytes: enc("%PDF-1.4 600"), pages: 500, sourcePages: 600, truncated: true } : { bytes: enc("%PDF-1.4 500"), pages: 500, sourcePages: 500, truncated: false }) } });
  const a = await w.capture(pdf(false, "six hundred")); w.tick(1000);
  const b = await w.capture(pdf(false, "five hundred"));
  var w600 = a;   // eslint-disable-line no-var
  await w.fs.renderBatch({}); await w.fs.renderBatch({});
  const da = await described(await w.fs.safeView({ captureSha: a, viewer: V }));
  assert.deepEqual([da.pages, da.source_pages, da.truncated], [500, 600, true]);
  assert.equal(da.statement.key, "file-safety.index.safe_view_first_pages");
  assert.deepEqual([da.statement.pages, da.statement.source_pages], [500, 600]);
  assert.match(da.statement.words, /first 500 pages/);
  assert.match(da.statement.words, /\b600\b/);
  assert.match(da.statement.words, /not a reading/);
  const db = await described(await w.fs.safeView({ captureSha: b, viewer: V }));
  assert.deepEqual([db.pages, db.source_pages, db.truncated], [500, 500, false]);
  assert.equal(db.statement.key, "file-safety.index.safe_view_is_a_view");
  assert.doesNotMatch(db.statement.words, /first/);
  assert.match(db.statement.words, /not a reading/);
});

test("R11 G137b: a spreadsheet window starts at fromRow of the sheet named, answers whole rows within SAFE_VIEW_CELLS_MAX cells with next_row, null at the last row; following next_row call by call reaches the last row of a sheet (12,000 rows here; the corpus run takes 100,000)", async () => {
  const w = world();
  const rows = 12_000;   /* the walker's sheet is 100,000 rows; the corpus run takes it whole (one call per screen of cells) */
  const s = await w.capture(xlsxOf([{ name: "Big", xml: smallSheetXml(rows) }, { name: "Second", xml: smallSheetXml(5, "b") }]));
  let from = 1, calls = 0, seen = 0, last = 0;
  for (;;) {
    const r = await op(w, s, `&sheet=Big&fromRow=${from}`);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
    assert.deepEqual([r.sheets.length, r.sheets[0].name], [1, "Big"]);
    const sh = r.sheets[0];
    assert.ok(sh.cells.length > 0 && sh.cells.length <= SAFE_VIEW_CELLS_MAX);
    assert.equal(sh.rows.from, from, "the window starts where it was asked");
    seen += sh.cells.length; last = sh.rows.to; calls++;
    assert.deepEqual([r.sheets_total, r.sheets_truncated], [2, true], "the other sheet is not shown in a window");
    if (sh.next_row === null) { assert.equal(sh.truncated, false); break; }
    assert.equal(sh.next_row, sh.rows.to + 1);
    assert.equal(sh.truncated, true);
    from = sh.next_row;
    assert.ok(calls < 500, "it ends");
  }
  assert.equal(last, rows, "the last row of the sheet");
  assert.equal(seen, rows, "every cell once");
  assert.equal(calls, Math.ceil(rows / SAFE_VIEW_CELLS_MAX), "by count of calls");
  /* the first screen with no window is what it was; the second sheet by name and by position; a row past the end; a sheet the workbook lacks */
  const first = await op(w, s);
  assert.deepEqual([first.sheets.length, first.sheets[0].rows.from, first.sheets[0].next_row], [2, 1, SAFE_VIEW_CELLS_MAX + 1]);
  const two = await op(w, s, "&sheet=Second");
  assert.deepEqual([two.sheets[0].name, two.sheets[0].cells.length, two.sheets[0].next_row], ["Second", 5, null]);
  const pos = await op(w, s, "&sheet=1&fromRow=3");
  assert.deepEqual([pos.sheets[0].name, pos.sheets[0].rows.from], ["Second", 3]);
  const past = await op(w, s, "&sheet=Second&fromRow=99");
  assert.deepEqual([past.ok, past.sheets[0].cells.length, past.sheets[0].next_row], [true, 0, null]);
  const lack = await op(w, s, "&sheet=Nope");
  assert.deepEqual([lack.ok, lack.code, lack.renderer_reason], [false, "SAFE_VIEW_FAILED", "SHEET_NOT_HELD"]);
});
