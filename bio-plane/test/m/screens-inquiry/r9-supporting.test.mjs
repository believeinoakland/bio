/* screens-inquiry fix round 9 (T51), G110b (re-walk 8 A; K4853; diagnosis `build/plan/diagnosis-R9-rewalk8-A.md` section 1): the Document page drew a capture's renderer
 * reasons verbatim ("89 / 241 · the renderer did not deliver this response's bytes (... CDP No resource with given identifier found) ×152"). The reasons are drawn by their
 * code's sentence (the Add screen's own rows, `screen.capture.supporting.*`), the count kept, the renderer's words (`detail`) and the bare `not_walked` code never. A sentence
 * for a page not walked at all is the row owed `screen.document.supporting.notwalked.<kind>`, stood in as its key until UX-DESIGN's row lands (R44, R-WORDS).
 * Through the real screen (interface-shell's served page); the walker's reasons are copied from the real `supportingOf` shape (acquisition R108). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, main, word, D, SHA, DOCUMENT_MD } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
const doc = (sup) => ({ [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA, supporting: sup } }] }) } });
/* a sentence by its key: the row when the list holds it, else the key it is stood in as (a row owed is drawn as its key, K4640) */
const said = (key, vars) => (hasWord(key) ? word(key, vars) : key);
/* the machine words the walker met, read through the table so no test copies a sentence (K3810) */
const RENDERER = word("render.renderer_deliver_response", { is_str: " (the browser would not give the body: CDP No resource with given identifier found)", bytes: "" });
const MACHINE = [/CDP/, /No resource with given identifier/, /renderer did not deliver/, /RENDER_PENDING/, /BODY_NOT_KEPT/, /PRIMARY_TOO_LARGE/, /CAP_REACHED/, /TOO_LARGE/, /BUDGET_EXHAUSTED/, /×\s*\d/];

test("R3 G19 G110b the walker's 89 of 246 supporting files: each kind of reason is drawn by its code's sentence with its count; the renderer's words and the codes are drawn nowhere", async () => {
  const sup = { kept: 89, skipped: 157, total: 246, reasons: [{ reason: "BODY_NOT_KEPT", count: 152, detail: RENDERER }, { reason: "CAP_REACHED", count: 3, limit: 400 },
    { reason: "TOO_LARGE", count: 2 }], not_walked: "RENDER_PENDING" };
  assert.match(RENDERER, /CDP/, "the fixture holds the walker's machine words");
  const p = await open(at, { images: doc(sup) });
  const line = main(p).querySelector("[data-supporting]");
  assert.ok(line, "the line is drawn");
  const t = text(line);
  assert.ok(t.includes(word("screen.capture.supporting.kept", { kept: "89", total: "246" })), "kept of all");
  assert.ok(t.includes(word("screen.capture.supporting.unavailable", { n: "152" })), "the renderer's 152: unavailable, the count kept");
  assert.ok(t.includes(word("screen.capture.supporting.cap", { n: "3", cap: "400" })), "the cap, with its figure");
  assert.ok(t.includes(word("screen.capture.supporting.toolarge", { n: "2" })), "too large, with its count");
  assert.ok(t.includes(said("screen.document.supporting.notwalked.pending")), "a page not walked says so by its code's kind");
  for (const re of MACHINE) assert.ok(!re.test(t), `no machine word ${re}: ${t}`);
  assert.deepEqual([...line.querySelectorAll("[data-supporting-why]")].map((e) => e.getAttribute("data-supporting-why")), ["cap", "toolarge", "unavailable"], "one line for each kind, in order");
});

test("R3 G110b codes sharing a sentence add their counts; every other code is unavailable; a detail alone is never drawn", async () => {
  const sup = { kept: 10, skipped: 9, total: 19, reasons: [{ reason: "TOO_LARGE", count: 4 }, { reason: "BUDGET_EXHAUSTED", count: 1 }, { reason: "NOT_FOUND", count: 3, detail: RENDERER },
    { reason: "BODY_NOT_KEPT", count: 1, detail: RENDERER }] };
  const p = await open(at, { images: doc(sup) });
  const t = text(main(p).querySelector("[data-supporting]"));
  assert.ok(t.includes(word("screen.capture.supporting.toolarge", { n: "5" })), "TOO_LARGE and BUDGET_EXHAUSTED share a sentence: 4 + 1");
  assert.ok(t.includes(word("screen.capture.supporting.unavailable", { n: "4" })), "two other codes: 3 + 1");
  for (const re of MACHINE) assert.ok(!re.test(t), `no machine word ${re}`);
});

test("R3 G110b a page not walked at all (nothing kept, nothing skipped) says so by the sentence of its code's kind: too large to parse, still being made, or unreadable; never the code", async () => {
  for (const [code, kind] of [["TOO_LARGE_TO_PARSE", "toolarge"], ["PRIMARY_TOO_LARGE", "toolarge"], ["RENDER_PENDING", "pending"], ["PRIMARY_UNREADABLE", "unavailable"], ["stopped", "unavailable"]]) {
    const p = await open(at, { images: doc({ kept: 0, skipped: 0, total: 0, reasons: [], not_walked: code }) });
    const line = main(p).querySelector("[data-supporting]");
    assert.ok(line, `${code}: drawn`);
    assert.equal(line.querySelector("[data-supporting-notwalked]").getAttribute("data-supporting-notwalked"), kind, code);
    assert.ok(text(line).includes(said("screen.document.supporting.notwalked." + kind)), `${code}: ${kind}`);
    assert.ok(!text(line).includes(code), `${code}: the code is not drawn`);
    assert.ok(!text(line).includes(word("screen.capture.supporting.kept", { kept: "0", total: "0" })), `${code}: and no count at zero`);
  }
});

test("R3 G110b control: nothing skipped draws nothing; a walked page whose every file was kept draws nothing", async () => {
  const none = await open(at, { images: doc({ kept: 12, skipped: 0, total: 12, reasons: [] }) });
  assert.equal(main(none).querySelector("[data-supporting]"), null);
  const absent = await open(at, { images: { [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA } }] }) } } });
  assert.equal(main(absent).querySelector("[data-supporting]"), null);
});
