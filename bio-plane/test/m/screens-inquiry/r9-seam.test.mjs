/* screens-inquiry fix round 9 (T51), the seams (R-SEAM) of R130 and R131: the whole path from the member's own upload to what the Document page draws, over the REAL plane
 * (Miniflare) and the real merged providers, nothing scripted. R130 (G135a, G135e; SCAN A5, A2; DOCS R1): an RTF and a GIF the member files are read by reading-pipeline as
 * `UNSUPPORTED_FORMAT {kind}` (final) and the page names the kind and offers no read act; control: a plain text file is read and offers none either. R131 (G134d; DOCS O4): a DOCX with
 * a footnote, filed by the member, is read with its footnote a unit of its own kind and the page shows that kind beside the footnote's words. The sentences are rows other modules
 * own (`reading-pipeline.index.unsupported_*`, `content.part_kind.*`), held once setup-words' rows are regenerated: red by name `UNKNOWN_WORD` until then (K4640). */
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
import { boot } from "../interface-shell/harness.mjs";
import { generate } from "../../docgen.mjs";
import { SCREENS, main, actsIn, word } from "./fixtures.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r9seam-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r9seam-0123456789abcdef", PROBE_TOKEN: "prb-r9seam-0123456789abcdef", VERSION: "4.6.0", INSTANCE_NAME: "r9seam-town" },
});
after(() => mf.dispose());
const ORIGIN = "https://group.example";
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
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
const upload = async (auth, bytes, name, type) => (await (await door(`/api/?op=captureupload&statement=r9seam&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: bytes })).json()).result;
const until = async (p, done, ms = 60000) => {
  const end = Date.now() + ms;
  for (;;) { await p.settle(20); if (done()) return true; if (Date.now() > end) return false; await new Promise((r) => setTimeout(r, 100)); }
};
/** The member's own filing of a file (the screen's promotion), the plane's reading of it waited for, and its Document page open. */
async function filed(auth, bytes, name, type) {
  const cs = screenCall(auth);
  const up = await upload(auth, bytes, name, type);
  const promoted = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: name, locator: up.document.locator, project: "" });
  assert.equal(promoted.refused, undefined, JSON.stringify(promoted).slice(0, 300));
  let reading = null;
  for (const end = Date.now() + 90000; Date.now() < end;) {
    reading = (await (await door(`/api/?op=reading&sha256=${up.capture.sha256}`, { headers: auth })).json()).result;
    if (reading && reading.found === true && reading.more !== true) break;
    await new Promise((x) => setTimeout(x, 300));
  }
  const p = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/document/" + promoted.bundleId });
  await until(p, () => !!main(p).querySelector("[data-text-state]"));
  return { p, reading, sha: up.capture.sha256 };
}
/* other modules' code-origin rows, held in variables (the words check judges a literal key against `words.json` alone) */
const UNSUPPORTED = "reading-pipeline.index.unsupported_", PART_KIND = "content.part_kind.";
const text = (el) => String(el && el.textContent || "");
const READ_ACTS = ["readheld", "pdfstructure", "pagetranscribe", "transcribe"];

const RTF = Buffer.from("{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 The hearing is set for Tuesday.\\par }");
/* a 1 x 1 GIF (GIF89a, one frame) */
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

test("R130 G135a G135e (the real plane) an RTF and a GIF the member filed: the plane states each `UNSUPPORTED_FORMAT` with its kind, and the page names the kind and offers no read act; control: a plain text file offers none and names no kind", async () => {
  const auth = await founder();
  for (const [name, bytes, type, kind] of [["hearing.rtf", RTF, "application/rtf", "rtf"], ["pixel.gif", GIF, "image/gif", "gif"]]) {
    const { p, reading } = await filed(auth, bytes, name, type);
    assert.ok(reading && reading.found === true, `${kind}: the plane holds a reading: ${JSON.stringify(reading).slice(0, 300)}`);
    const rd = reading.reading || {};
    assert.equal(rd.reason, "UNSUPPORTED_FORMAT", `${kind}: the plane states the reason: ${JSON.stringify(rd).slice(0, 300)}`);
    assert.equal(rd.kind, kind, `${kind}: and the kind`);
    const m = main(p);
    const note = m.querySelector('[data-reading="unsupported"]');
    assert.ok(note, `${kind}: the page names it`);
    assert.equal(text(note).trim(), word(UNSUPPORTED + kind), kind);
    assert.ok(!actsIn(m).some((a) => READ_ACTS.includes(a)), `${kind}: no read act: ${actsIn(m)}`);
  }
  const plain = await filed(auth, Buffer.from("Line one of the plain text.\nLine two.\n"), "plain.txt", "text/plain");
  assert.equal(main(plain.p).querySelector('[data-reading="unsupported"]'), null, "control: a text file names no unread kind");
  assert.ok(!actsIn(main(plain.p)).some((a) => ["readheld", "pagetranscribe"].includes(a)), "and offers no read act");
});

test("R131 G134d DOCS O4 (the real plane) a DOCX the member filed with a footnote: the page shows the footnote's kind beside the footnote's words, and the body's beside the body's", async () => {
  const auth = await founder();
  const doc = generate({ kind: "docx", seed: 9134, size: { units: 3 }, parts: ["footnote"] });
  const bytes = await doc.bytes();
  const { p, reading } = await filed(auth, Buffer.from(bytes), "memo.docx", doc.type);
  assert.ok(reading && reading.found === true && Array.isArray(reading.text_units), "the plane holds a reading with units: " + JSON.stringify(reading).slice(0, 300));
  const kinds = new Set(reading.text_units.map((u) => u.kind));
  assert.ok(kinds.has("footnote") && kinds.has("body"), `the units carry their kinds: ${[...kinds]}`);
  const tags = main(p).querySelectorAll("[data-part-kind]");
  const drawn = new Set(tags.map((t) => t.getAttribute("data-part-kind")));
  assert.ok(drawn.has("footnote") && drawn.has("body"), `the page shows both: ${[...drawn]}`);
  const footnote = reading.text_units.find((u) => u.kind === "footnote");
  const quote = main(p).querySelectorAll("blockquote").find((b) => text(b).includes(String(footnote.text).trim().slice(0, 12)));
  assert.ok(quote, "the footnote's words are drawn");
  assert.equal(text(quote.querySelector("[data-part-kind]")).trim(), word(PART_KIND + "footnote"), "with its kind beside them");
});
