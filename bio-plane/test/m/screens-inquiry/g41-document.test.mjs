/* screens-inquiry fix round 6 (T51), G41 D5: the Document page states what is interpreted (K4636). A sheet whose cells the reading does not list (`cells_held`, the
 * names of the sheets) draws one quiet line, read by key: its text is read whole and every line can be searched and cited, its cells are interpreted for a range when
 * opened or cited; a reading stated too large to keep whole (`failure: "final"`, `too_large` `{bytes, key}`) is drawn as that statement, not "Nothing here". The seam test
 * makes its reading by the real plane (Miniflare, the platform's own value limit) from the member's own upload of a 1 MB CSV; the others copy the shapes it answers.
 * Red by name `UNKNOWN_WORD` until EXTRACTION #38 adds the code-origin rows `screen.document.cells_held` and `screen.document.reading.too_large` (K4640's pattern);
 * red by the 1 MB CSV's storing until READING-PIPELINE #26 and EXTRACTION #38 merge. Every expectation is a word read by key (R44). */
import "../../sandbox.mjs";
import "./fixtures.mjs"; /* registers every owner's declarations before anything reads an op (R81) */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { ok, boot } from "../interface-shell/harness.mjs";
import { SCREENS, open, main, actsIn, word, D, SHA } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const CELLS_HELD = "screen.document.cells_held", TOO_LARGE = "screen.document.reading.too_large";
const held = (m) => m.querySelector("[data-cells-held]");
const stateOf = (m) => { const e = m.querySelector("[data-text-state]"); return e && e.getAttribute("data-text-state"); };

/* the reading a held sheet's capture answers (the shape `op=reading` composes for a CSV past the inline cells bound: `cells` absent, `cells_held` naming the sheet) */
const sheetReading = (o = {}, rd = {}) => ok({ ok: true, found: true, capture_sha: SHA, content_type: "text/csv", format: "csv", bytes: 1048660,
  reading: { content_type: "text/csv", found: true, text_container: "csv", cells_held: ["csv"], ...rd },
  text_units: [{ seq: 1, extent: { kind: "sheet-range", sheet: "csv", range: "A1:D18098" }, reference: "u1", truncated: false, text: "name,value\nr0,a" }], units_total: 1, ...o });

test("R3 R96 G41 (a) the page of a CSV whose reading names a held sheet draws the held-cells line, once, read by key; the text is whole so the fact line says so", async () => {
  const p = await open(at, { plane: { reading: sheetReading() } });
  const m = main(p);
  assert.equal(m.querySelectorAll("[data-cells-held]").length, 1, "one line");
  assert.equal(String(held(m).textContent).trim(), word(CELLS_HELD), "the sentence is the word held for the key");
  assert.equal(stateOf(m), "full", "its text is drawn whole beside it");
});

test("R3 R96 G41 (a) a reading naming two held sheets draws the one line, no sheet name", async () => {
  const p = await open(at, { plane: { reading: sheetReading({}, { cells_held: ["Budget", "Staff"] }) } });
  const m = main(p);
  assert.equal(m.querySelectorAll("[data-cells-held]").length, 1);
  assert.ok(!String(m.textContent).includes("Staff"), "a sheet's name is not drawn");
});

test("R3 R96 G41 (b) controls: a 3-row CSV (cells listed), a PDF and a reading with an empty `cells_held` draw no held-cells line", async () => {
  const small = await open(at, { plane: { reading: sheetReading({ bytes: 40 }, { cells_held: undefined, cells: [{ ref: "csv!A1" }] }) } });
  assert.equal(held(main(small)), null, "a small sheet lists its cells and draws none");
  const pdf = await open(at, {});
  assert.equal(held(main(pdf)), null, "a PDF draws none");
  const none = await open(at, { plane: { reading: sheetReading({}, { cells_held: [] }) } });
  assert.equal(held(main(none)), null, "an empty list names no sheet");
});

test("R96 G13 G41 (c) while the text is still being read the line is not drawn: the 'being read' state stands alone and claims nothing whole", async () => {
  const p = await open(at, { plane: { reading: sheetReading({ more: true, read_through: 524288, total: 1048660, next: "u1" }) } });
  const m = main(p);
  assert.equal(stateOf(m), "reading");
  assert.equal(held(m), null, "no sentence that says the text is read whole");
});

test("R3 R96 G41 (b) a reading stated too large to keep whole is drawn as that statement with its size and largest part, for a table document too; no 'Nothing here', no OCR re-read", async () => {
  const BYTES = 1572864;
  const tooLarge = (rd) => sheetReading({ text_units: [], units_total: 0, bytes: BYTES, format: "xlsx" }, { found: false, failure: "final", cells_held: undefined,
    basis: "the reading is too large to keep whole", too_large: { bytes: BYTES, key: "cells" }, ...rd });
  const p = await open(at, { plane: { reading: tooLarge() } });
  const m = main(p);
  assert.ok(String(m.textContent).includes(word(TOO_LARGE, { size: word("size.mb", { n: (BYTES / 1048576).toFixed(1) }), key: "cells" })), "the statement, with {size} and {key}");
  assert.ok(m.querySelector('[data-reading="stated"]'), "it is its own element");
  assert.ok(!String(m.textContent).includes(word("state.empty")), "never 'Nothing here'");
  assert.ok(!actsIn(m).includes("pdfstructure") && !actsIn(m).includes("readheld"), "no act after a statement that stands");
  assert.equal(held(m), null, "and no held-cells line");
  const str = await open(at, { plane: { reading: tooLarge({ too_large: undefined }) } });
  assert.ok(main(str).querySelector('[data-reading="stated"]') && !String(main(str).textContent).includes(word(TOO_LARGE, { size: "x", key: "cells" }).split("x")[0]),
    "control: a basis that is a string is drawn as the statement it was, not as the too-large one");
});

/* ---- the seam: the real plane, a 1 MB CSV the member filed ---- */
const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-g41-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-g41-0123456789abcdef", PROBE_TOKEN: "prb-g41-0123456789abcdef", VERSION: "4.6.0", INSTANCE_NAME: "g41-town" },
});
after(() => mf.dispose());
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, "https://group.example").href, init);
async function founder() {
  await (await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await door(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const forwarded = (auth) => Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
  const r = await door(`/api/?${new URLSearchParams({ ...req.query, op })}`, { method: req.body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
    ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }) });
  return { status: r.status, json: await r.json().catch(() => null) };
}]));
const upload = async (auth, bytes, name, type) => (await (await door(`/api/?op=captureupload&statement=g41&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: bytes })).json()).result;
const until = async (p, done, ms = 60000) => {
  const end = Date.now() + ms;
  for (;;) { await p.settle(20); if (done()) return true; if (Date.now() > end) return false; await new Promise((r) => setTimeout(r, 100)); }
};
/** A CSV of `rows` rows of four short columns (about 58 B a row: 18,098 rows is 1 MB), its last row the marker. */
const csv = (rows) => { const out = ["id,name,amount,note"]; for (let i = 1; i < rows; i++) out.push(`r${i},name ${i},${(i * 7) % 1000},note ${i}`); out.push(`LASTROW,marker,0,end`); return Buffer.from(out.join("\n")); };
const filedPage = async (auth, bytes, name) => {
  const cs = screenCall(auth);
  const up = await upload(auth, bytes, name, "text/csv");
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: name, locator: up.document.locator, project: "" });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 300));
  const sha = up.capture.sha256;
  let r = null;
  for (const end = Date.now() + 120000; Date.now() < end;) {
    r = (await (await door(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
    if (r && r.found === true && r.more !== true) break;
    await new Promise((x) => setTimeout(x, 500));
  }
  return { sha, stored: r, bundle: filed.bundleId };
};

test("R3 R96 G41 (a) (the real plane) the 1 MB CSV the member filed is read whole, its last row found, and its page draws the held-cells line; the 3-row CSV draws none (control)", async () => {
  const auth = await founder();
  const big = await filedPage(auth, csv(18098), "big.csv");
  assert.ok(big.stored && big.stored.found === true && big.stored.more !== true && !(big.stored.reading && big.stored.reading.failure), "the reading is stored and whole: " + JSON.stringify(big.stored).slice(0, 300));
  assert.ok(big.stored.reading.cells_held.length > 0, "it names its held sheet");
  const p = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/document/" + big.bundle });
  await until(p, () => !!main(p).querySelector("[data-text-state]"));
  assert.equal(String(held(main(p)) && held(main(p)).textContent).trim(), word(CELLS_HELD), "the page states what is interpreted");
  const small = await filedPage(auth, csv(3), "small.csv");
  const q = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/document/" + small.bundle });
  await until(q, () => !!main(q).querySelector("[data-text-state]"));
  assert.equal(held(main(q)), null, "a small sheet lists its cells and draws none");
});
