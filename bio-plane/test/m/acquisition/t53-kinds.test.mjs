/* acquisition T53 (T53-98, T53-99; N1266, K5436, K5574, K3656): R138 a held-and-named file is filed whole with its reading owed, R139 a refused file
   is not filed (a fetch before anything is stored; an archive's entry as `not_filed`), K5574 a challenge or CAPTCHA page in place of the document is
   recognised at the fetch, refused, counted for the host, and never worked around. At the module's interface (`acquire`, `unpack`), over a scripted
   network. The member words are read from the word table, never copied. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, page, text, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, challengesByHost, ARCHIVE_CHECKS } from "../../../src/acquisition/index.mjs";
import { challengeOf } from "../../../src/acquisition/challenge.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const U = (name) => `https://files.example/${name}`;
const bin = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + (typeof p === "number" ? p : p.length), 0)); let at = 0; for (const p of parts) { if (typeof p !== "number") { out.set(p, at); at += p.length; } else at += p; } return out; };
const ascii = (s) => new TextEncoder().encode(s);
const RAR = bin(ascii("Rar!\x1a\x07\x00"), 4096);
const EXE = (() => { const b = new Uint8Array(512); b[0] = 0x4d; b[1] = 0x5a; b[60] = 0x80; b.set(ascii("PE\0\0"), 0x80); return b; })();
const ISO = (() => { const b = new Uint8Array(0x8800 + 64); b.set(ascii("CD001"), 0x8001); return b; })();
const SQLITE = bin(ascii("SQLite format 3\0"), 2048);
const octet = (b) => () => new Response(b, { headers: { "content-type": "application/octet-stream" } });
const nothingKept = (w, what) => {
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0], `${what}: no receipt, nothing stored`);
};

test("R139: a fetched RAR, program, disk image and script is not filed: the refusal names the type and the reason in plain words, before anything is stored", async () => {
  const cases = [["a RAR", "a.rar", RAR, "rar"], ["a Windows program", "setup.exe", EXE, "exe"], ["a disk image", "disc.iso", ISO, "iso"],
                 ["a script", "run.sh", ascii("#!/bin/sh\necho hello\n"), "sh"]];
  for (const [what, name, bytes, kind] of cases) {
    const w = world();
    const r = await run(w, { [U(name)]: octet(bytes) }, { locator: U(name) });
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.code, r.body.check], [415, false, "FILE_TYPE_REFUSED", "FILE_TYPE_REFUSED", ARCHIVE_CHECKS.FILE_TYPE_REFUSED.check], what);
    assert.equal(r.body.translation, ARCHIVE_CHECKS.FILE_TYPE_REFUSED.translation);
    assert.equal(r.body.refused.kind, kind, `${what}: the registry's own kind`);
    assert.ok(r.body.detail.includes(r.body.kind_text), `${what}: the detail names the type`);
    if (r.body.reason_text) assert.ok(r.body.detail.includes(r.body.reason_text), `${what}: and the reason`);
    nothingKept(w, what);
  }
  /* the RAR's words are the table's */
  const w = world();
  const rar = await run(w, { [U("a.rar")]: octet(RAR) }, { locator: U("a.rar") });
  assert.equal(rar.body.kind_text, word("file.kind.rar"));
  assert.equal(rar.body.reason_text, word("file.refused.reason.rar"));
});

test("R139: a refused file is refused before the body is read to its end: the stream is cancelled", async () => {
  const w = world();
  let cancelled = false, sent = 0;
  const body = () => new Response(new ReadableStream({
    pull(c) { if (sent === 0) c.enqueue(bin(ascii("Rar!\x1a\x07\x00"), 65536)); else c.enqueue(new Uint8Array(65536)); sent++; if (sent > 5000) c.close(); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 }));
  const r = await run(w, { [U("big.rar")]: body }, { locator: U("big.rar") });
  assert.deepEqual([r.status, r.body.reason, cancelled], [415, "FILE_TYPE_REFUSED", true]);
  assert.ok(sent < 20, `only the head was read (${sent} chunks)`);
  nothingKept(w, "a long RAR");
});

test("R139 control: a listed type and an unlisted one are filed; a script-like word in a page is not a script", async () => {
  const w = world();
  const pdf = await run(w, { [U("a.pdf")]: octet(ascii("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF")) }, { locator: U("a.pdf") });
  assert.equal(pdf.status, 200);
  const html = await run(w, { [U("p")]: page("<html><title>x</title><body>#!/bin/sh is how a script starts</body></html>") }, { locator: U("p") });
  assert.equal(html.status, 200);
  const db = await run(w, { [U("d.sqlite")]: octet(SQLITE) }, { locator: U("d.sqlite") });
  assert.equal(db.status, 200, "an unlisted type is filed");
});

test("R138: an unlisted file is filed whole, named, with its reading held and owed; a listed type states none; an unlisted file with no name says only that it is held", async () => {
  const w = world();
  const r = await run(w, { [U("d.sqlite")]: octet(SQLITE) }, { locator: U("d.sqlite") });
  assert.equal(r.status, 200);
  const p = r.body.document.profile;
  assert.deepEqual([p.format.format, p.format.named], ["unlisted", "sqlite"]);
  assert.equal(p.held_unread.state, "held-unread");
  assert.equal(p.held_unread.named, "sqlite");
  assert.ok(p.held_unread.text.includes(word("file.kind.sqlite")), "held, not read: the table's name for the kind");
  assert.ok(w.held(r.body.document.capture.sha256), "filed whole");
  assert.equal(r.body.document.capture.bytes, SQLITE.length);
  /* control: a listed type */
  const pdf = await run(w, { [U("a.pdf")]: octet(ascii("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF")) }, { locator: U("a.pdf") });
  assert.equal(pdf.body.document.profile.held_unread, undefined);
  /* no name: bytes that are not text and match nothing */
  const odd = await run(w, { [U("x.bin")]: octet(new Uint8Array([0, 1, 2, 3, 250, 251, 252, 253, 0, 0, 0, 7, 9, 200])) }, { locator: U("x.bin") });
  assert.equal(odd.status, 200);
  assert.deepEqual([odd.body.document.profile.format.format, odd.body.document.profile.format.named, odd.body.document.profile.held_unread.named], ["unlisted", null, null]);
  assert.ok(odd.body.document.profile.held_unread.text.includes(word("file.kind.other")));
});

test("R138 R139: in an archive an unlisted entry is `filed`, and a refused entry is `not_filed` with its type and reason while its other entries are filed", async () => {
  const w = world();
  const zip = makeZip([{ name: "notes.txt", data: "minutes of the meeting" }, { name: "data.sqlite", data: SQLITE }, { name: "setup.exe", data: EXE }, { name: "old.rar", data: RAR }]);
  const r = await run(w, { [U("bundle.zip")]: () => new Response(zip, { headers: { "content-type": "application/zip" } }) }, { locator: U("bundle.zip") });
  assert.equal(r.status, 200);
  const u = r.body.unpack;
  assert.equal(u.ok, true);
  assert.deepEqual(u.documents.map((d) => d.container.path).sort(), ["data.sqlite", "notes.txt"], "the text and the unlisted file are filed");
  const db = u.documents.find((d) => d.container.path === "data.sqlite");
  assert.equal(db.profile.held_unread.named, "sqlite");
  assert.deepEqual(u.not_filed.map((n) => [n.code, n.check]).sort(), [["FILE_TYPE_REFUSED", "C-139.22"], ["FILE_TYPE_REFUSED", "C-139.22"]]);
  const exe = u.not_filed.find((n) => n.kind === "program");
  assert.equal(exe.kind_text, word("file.kind.program"));
  assert.equal(exe.reason_text, word("file.refused.reason.runs"));
  assert.ok(exe.detail.includes(exe.kind_text));
  /* no receipt or document for either refused entry; the archive is complete */
  assert.equal(u.complete, true);
  const refusedShas = [sha(EXE), sha(RAR)];
  for (const s of refusedShas) assert.deepEqual([...w.rows("SELECT 1 FROM archive_entries WHERE sha256=? AND state='filed'", s)], [], "no filed row");
  assert.ok(!w.prov.receipts.some((x) => refusedShas.includes(x.captureSha)), "no receipt names a refused file");
  /* the listing states them */
  const list = await w.acq.archiveList({ archiveSha: sha(zip), viewer: "member:m1", state: "not_filed" });
  assert.deepEqual(list.entries.map((e) => e.code), ["FILE_TYPE_REFUSED", "FILE_TYPE_REFUSED"]);
  /* control: an archive with no such entry is filed whole as before */
  const plain = makeZip([{ name: "a.txt", data: "one" }, { name: "b.txt", data: "two" }]);
  const p = await run(world(), { [U("p.zip")]: () => new Response(plain, { headers: { "content-type": "application/zip" } }) }, { locator: U("p.zip") });
  assert.deepEqual([p.body.unpack.documents.length, p.body.unpack.not_filed.length], [2, 0]);
});

/* ---------------- K5574 ---------------- */
const CF_PAGE = `<!DOCTYPE html><html><head><title>Just a moment...</title></head><body><script>window._cf_chl_opt={cvId:'3'};</script><noscript>Enable JavaScript and cookies to continue</noscript></body></html>`;
const challenged = (body = CF_PAGE, status = 403, headers = {}) => () => new Response(body, { status, headers: { "content-type": "text/html; charset=UTF-8", server: "cloudflare", ...headers } });

test("K5574: a challenge page in place of the document is refused with its own reason, never filed, counted for the host, and the source is asked once", async () => {
  const w = world();
  const url = "https://www.guarded.example/records/minutes.pdf";
  const cases = [
    ["Cloudflare's header", challenged("<html></html>", 403, { "cf-mitigated": "challenge" })],
    ["Cloudflare's page on a 403", challenged()],
    ["Cloudflare's page on a 503", challenged(CF_PAGE, 503)],
    ["the same page served as a success", challenged(CF_PAGE, 200)],
    ["the header on a success", challenged("<html></html>", 200, { "cf-mitigated": "challenge" })],
  ];
  let n = 0;
  for (const [what, route] of cases) {
    const r = await run(w, { [url]: route }, { locator: url });
    n++;
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.code, r.body.check], [403, false, "CHALLENGE_PAGE", "CHALLENGE_PAGE", ARCHIVE_CHECKS.CHALLENGE_PAGE.check], what);
    assert.equal(r.body.translation, ARCHIVE_CHECKS.CHALLENGE_PAGE.translation);
    assert.deepEqual([r.body.host, r.body.challenge.kind, r.body.counted], ["www.guarded.example", "cloudflare", { host: "www.guarded.example", challenges: n }], what);
    assert.equal(r.net.seen.length, 1, `${what}: one request, nothing done to get past it (K3656)`);
    assert.equal(r.body.document, undefined);
    nothingKept(w, what);
  }
  /* counted for the host, read back */
  const other = await run(w, { "https://other.example/x": challenged() }, { locator: "https://other.example/x" });
  assert.equal(other.body.reason, "CHALLENGE_PAGE");
  assert.deepEqual(challengesByHost(w.store).map((x) => [x.host, x.challenges]), [["www.guarded.example", 5], ["other.example", 1]]);
});

test("K5574: other bot-protection pages are recognised from their own text; a CAPTCHA widget is a challenge only when it is all the page is", () => {
  const dd = challengeOf({ status: 403, headers: { "content-type": "text/html" }, text: `<html><script src="https://geo.captcha-delivery.com/captcha/?initialCid=1"></script></html>` });
  assert.equal(dd.kind, "datadome");
  const px = challengeOf({ status: 403, headers: { "content-type": "text/html" }, text: `<div id="px-captcha"></div>` });
  assert.equal(px.kind, "perimeterx");
  const widgetError = challengeOf({ status: 403, headers: { "content-type": "text/html" }, text: `<form><div class="g-recaptcha" data-sitekey="k"></div></form>` });
  assert.equal(widgetError.kind, "captcha");
  const widgetPage = challengeOf({ status: 200, headers: { "content-type": "text/html" }, text: `<h1>Please verify you are human</h1><div class="h-captcha" data-sitekey="k"></div>`, total: 400 });
  assert.equal(widgetPage.kind, "captcha");
  /* controls: a contact form with a widget on a real page, a protection script on an ordinary page, a PDF, an empty answer */
  assert.equal(challengeOf({ status: 200, headers: { "content-type": "text/html" }, text: `<article>${"minutes ".repeat(5000)}</article><form><div class="g-recaptcha" data-sitekey="k"></div></form>`, total: 40000 }), null);
  assert.equal(challengeOf({ status: 200, headers: { "content-type": "text/html" }, text: `<html><title>Minutes</title><script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script></html>` }), null);
  assert.equal(challengeOf({ status: 200, headers: { "content-type": "application/pdf" }, text: "Just a moment..." }), null);
  assert.equal(challengeOf({}), null);
  assert.equal(challengeOf({ status: 403, headers: { "content-type": "text/html" }, text: "<h1>Forbidden</h1>" }), null);
});

test("K5574 control: an ordinary refusal stays SOURCE_REFUSED, and a page that carries a protection script or a form widget is filed as the document", async () => {
  const w = world();
  const plain403 = await run(w, { [U("no")]: () => new Response("<h1>Forbidden</h1>", { status: 403, headers: { "content-type": "text/html", server: "cloudflare" } }) }, { locator: U("no") });
  assert.deepEqual([plain403.status, plain403.body.reason], [502, "SOURCE_REFUSED"]);
  const tooMany = await run(w, { [U("slow")]: () => new Response("slow down", { status: 429, headers: { "retry-after": "30" } }) }, { locator: U("slow") });
  assert.equal(tooMany.body.reason, "SOURCE_REFUSED");
  assert.deepEqual(challengesByHost(w.store), [], "nothing counted for them");
  const guarded = await run(w, { [U("minutes.html")]: () => page(`<!doctype html><html><head><title>Minutes of May</title></head><body><p>The council met.</p>
    <script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script><form><div class="g-recaptcha" data-sitekey="k"></div></form></body></html>`) }, { locator: U("minutes.html") });
  assert.equal(guarded.status, 200, "an ordinary page is filed");
  assert.equal(guarded.body.document.title, "Minutes of May");
  assert.deepEqual(challengesByHost(w.store), []);
});
