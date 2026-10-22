/* interface-shell R120 (fix round 4, C81; K4429; amends R62): a row whose first part is empty lays out with its act. Measured in Chromium at 390 px and at
   1280 px over stand-in screens that draw the walker's two real rows through the kit exactly as the screens do (`cs.row("", text, "", act)` for the case
   editor's "Remove a citation", `cs.row("", text, meta, act)` for the review copy's "Stop sharing"), with a live-sized number of them. Needs playwright-core and
   Chromium (see chromium.mjs). Each test was seen failing first. */
import test from "node:test";
import assert from "node:assert/strict";
import { fitSend } from "./harness.mjs";
import { inChromium } from "./chromium.mjs";

const ROWS = 30;
const LONG = "legislation:26-0788 and the quoted passage it cites, a sentence long enough to fill most of the width of a phone and wrap onto a second line";

/* the case editor's cites list (screens-publish `case-editor.mjs`:176) and the review copy's readers (`review-copy.mjs`:64), as the screens call the kit */
const EDITOR = {
  id: "case-editor", words: [], reads: () => ({}),
  render: new Function("cs", "view", `
    const rows = Array.from({ length: ${ROWS} }, function (_, i) {
      return cs.row("", '<span class="rec" data-cited="c' + i + '">' + cs.esc(${JSON.stringify(LONG)} + " " + i) + "</span>", "", cs.act("sever", { data: { handle: "c" + i } }));
    }).join("");
    return cs.title("Case") + cs.sec("screen.case-editor.the_passages_this_case_cites", cs.sheet(rows));
  `),
  acts: [{ op: "sever", send: fitSend("sever") }],
};
const COPY = {
  id: "review-copy", words: [], reads: () => ({}),
  render: new Function("cs", "view", `
    const rows = Array.from({ length: ${ROWS} }, function (_, i) {
      return cs.row("", "<b>" + cs.esc("A named reader " + i) + "</b>", '<span class="meta" data-grant-until="open">can read until 3 November, ' + cs.esc(${JSON.stringify(LONG)}) + '</span>',
        cs.act("reviewrevoke", { data: { grant: "g" + i } }));
    }).join("");
    return cs.title("Review copy") + cs.sec("screen.review-copy.readers", cs.sheet(rows));
  `),
  acts: [{ op: "reviewrevoke", send: fitSend("reviewrevoke") }],
};
/* a row WITH a first part (the control): an icon leads, then the text and the act */
const LED = {
  id: "case-editor", words: [], reads: () => ({}),
  render: new Function("cs", "view", `
    return cs.title("Case") + cs.sheet(Array.from({ length: 3 }, function (_, i) {
      return cs.row(cs.icon("sever"), cs.esc(${JSON.stringify(LONG)}), "", cs.act("sever", { data: { handle: "c" + i } }));
    }).join(""));
  `),
  acts: [{ op: "sever", send: fitSend("sever") }],
};

/* each row's text, its act button and the row, measured; every box is the border box on screen */
function measureRows({ W, sel }) {
  {
    const box = (e) => { const r = e.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) }; };
    const lines = (e) => { const range = document.createRange(); range.selectNodeContents(e); const tops = new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top))); return tops.size; };
    return {
      mainScroll: document.getElementById("cs-main").scrollWidth,
      rows: Array.from(document.querySelectorAll(sel)).map((row) => {
        const btn = row.querySelector("button[data-act]"), text = row.firstElementChild;
        return { row: box(row), text: box(text), btn: box(btn), btnLines: lines(btn.firstChild && btn.firstChild.nodeType === 3 ? btn : btn), label: btn.textContent, tracks: getComputedStyle(row).gridTemplateColumns.split(" ").length };
      }),
      W,
    };
  }
}
const measure = (screen, width, sel = ".cs-main .cs-row") => inChromium([screen], { width, path: "/app/" + screen.id + "/P1", ready: "#cs-main .cs-row" }, (page) => page.evaluate(measureRows, { W: width, sel }));

for (const [screen, name] of [[EDITOR, "Remove a citation"], [COPY, "Stop sharing"]]) {
  test(`R120 (C81) at 390 px the ${screen.id}'s "${name}" is one line, over 200 px wide, inside the screen and as tall as its text, in each of ${ROWS} rows`, { timeout: 120000 }, async () => {
    const natural = (await measure(screen, 1280)).rows[0];
    const m = await measure(screen, 390);
    assert.equal(m.rows.length, ROWS, "a live-sized number of rows");
    assert.ok(m.mainScroll <= 390, "no sideways scroll: " + m.mainScroll);
    for (const r of m.rows) {
      assert.ok(r.label.includes(name), "the walker's act: " + r.label);
      assert.ok(r.btn.width > 200, `${name}: over 200 px wide (was squeezed to 44): ${r.btn.width}`);
      assert.ok(r.btn.right <= 390, `${name}: inside the screen: ${r.btn.right}`);
      assert.ok(r.btn.height <= Math.max(natural.btn.height, 44) + 1, `${name}: as tall as its own text on one line, the phone's 44 px target at most (${natural.btn.height}): ${r.btn.height}`);
      assert.ok(r.btn.width >= natural.btn.width - 1, `${name}: never narrower than its own text on one line (${natural.btn.width}): ${r.btn.width}`);
      assert.ok(r.text.width > 200, "the row's text is not squeezed either: " + r.text.width);
    }
  });

  test(`R120 (C81) at 1280 px the ${screen.id}'s "${name}" is not narrowed by a long text beside it`, { timeout: 120000 }, async () => {
    const m = await measure(screen, 1280);
    const natural = m.rows[0].btn;
    for (const r of m.rows) {
      assert.ok(r.btn.width >= natural.width - 1 && r.btn.height <= natural.height + 1, `${name} keeps its own size: ${JSON.stringify(r.btn)}`);
      assert.ok(r.btn.right <= 1280 && r.text.right <= 1280, "inside the screen");
    }
  });
}

test("R120 (C81) control: a row with a first part keeps its two-column phone layout, the lead, then the text with the act beneath it, and the desktop's three columns", { timeout: 120000 }, async () => {
  const phone = await measure(LED, 390), wide = await measure(LED, 1280);
  for (const r of phone.rows) {
    assert.equal(r.tracks, 2, "the lead and the text: " + r.tracks);
    assert.ok(r.text.width < 60 && r.btn.left > r.text.left, "the lead is narrow and the act sits beneath the text, to its right: " + JSON.stringify(r));
    assert.ok(r.btn.width > 200 && r.btn.right <= 390);
  }
  for (const r of wide.rows) assert.equal(r.tracks, 3, "the design's lead, text and act: " + r.tracks);
});
