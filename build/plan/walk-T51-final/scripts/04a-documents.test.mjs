/* WALK-FINAL-04A #1 (T51 final pass, Phase 1, sitting 4a "Bring documents in, first sitting"): one journey through the real plane under Miniflare, every input made by a member's own
   acts through the door (captureupload, acquire, testify, promote as the Add screen sends them), never a hand-written answer or a row written to storage. Rows of
   build/plan/walk-T51-final/coverage/04-documents*.md placed in 4a (R30 R31 R32 R34 R33 R35 R36 R37 R134 R143 and the overlay's Server-Timing reads) are walked section by section;
   each section writes its rows to build/plan/walk-T51-final/04a-documents.md the moment it is done. A section that throws is a BROKEN row, never a stopped walk.
   Run:  cd bio-plane && node --test --test-timeout=7200000 ../build/plan/walk-T51-final/scripts/04a-documents.test.mjs   (SECTIONS=a,b limits it; STAMP names the run) */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CP = join(HERE, "../../../../bio-plane/test/m/control-plane");
const T = join(HERE, "../../../../bio-plane/test");
const { makeKit, MB } = await import(join(CP, "r8-kit.mjs"));
const { CAPTURE_SCREEN } = await import(join(HERE, "../../../../bio-plane/src/screens-intake/capture.mjs"));
const { makeZip } = await import(join(T, "make-zip.mjs"));
const pdfgen = await import(join(T, "pdfgen.mjs"));
const sheetgen = await import(join(T, "sheetgen.mjs"));
const docgen = await import(join(T, "docgen.mjs"));
const imggen = await import(join(T, "imggen.mjs"));
const { ocrMember } = await import(join(CP, "r9-seam-reading.mjs"));

const RECORD = join(HERE, "../04a-documents.md");
const enc = encodeURIComponent;
const R = (a) => (a && a.result !== undefined ? a.result : a);
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
const want = (process.env.SECTIONS || "").split(",").filter(Boolean);
const counts = { WORKS: 0, BROKEN: 0, "NOT REACHED": 0, KNOWN: 0 };
const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim().slice(0, 1400);

if (!existsSync(RECORD) || process.env.FRESH) {
  writeFileSync(RECORD, `# WALK-FINAL-04A #1: sitting 4a, Bring documents in (first sitting), offline phase

**Status** · walked on \`tranche/T51\` merged at 8efbe1c055 into \`prep/final-04a-documents\`, Miniflare, journey script \`scripts/04a-documents.test.mjs\`. Rows are appended as each check is done.

COUNTS-PLACEHOLDER

Row: \`row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED / KNOWN | what I saw | screenshot\`. Width is "n/a (door)": the offline phase has no browser, so 1280 and 390 px are not walked here (recorded once under the overlay).

| row | check | width | role | what I did | verdict | what I saw | shot |
| --- | --- | --- | --- | --- | --- | --- | --- |
`);
}
/** one row of the record, written at once */
function rec(row, check, role, did, verdict, saw, shot = "-") {
  const v = verdict.split(" ")[0] === "NOT" ? "NOT REACHED" : verdict.split(" ")[0];
  counts[v] = (counts[v] ?? 0) + 1;
  appendFileSync(RECORD, `| ${row} | ${cell(check)} | n/a (door) | ${role} | ${cell(did)} | ${verdict} | ${cell(saw)} | ${shot} |\n`);
  console.log(`[${row}] ${verdict} ${cell(check).slice(0, 80)} :: ${cell(saw).slice(0, 160)}`);
}
/** run a check; a throw is a BROKEN row */
async function check(row, name, role, did, fn) {
  const t0 = Date.now();
  try {
    const out = await fn();
    const [verdict, saw] = Array.isArray(out) ? out : ["WORKS", out];
    rec(row, name, role, did, verdict, `${saw ?? ""} (wall ${Date.now() - t0} ms)`);
  } catch (e) { rec(row, name, role, did, "BROKEN", `threw: ${String(e && e.message || e).slice(0, 900)} (wall ${Date.now() - t0} ms)`); }
}
const sectionOn = (n) => !want.length || want.includes(n);

/* the network: an address by its last path segment. {bytes, type, status, length, rate, delay, headers} */
const site = new Map();
const later = (ms) => new Promise((r) => setTimeout(r, ms));
function siteBody(bytes, rate) {
  const chunk = 64 * 1024; let at = 0;
  return new ReadableStream({ async pull(c) { if (at >= bytes.length) { c.close(); return; } const end = Math.min(at + chunk, bytes.length); c.enqueue(bytes.subarray(at, end)); at = end; await later((chunk / rate) * 1000); } }, new CountQueuingStrategy({ highWaterMark: 0 }));
}
const outbound = async (req) => {
  const name = new URL(req.url).pathname.split("/").pop() || "index.html";
  const f = site.get(name);
  if (!f) return new Response("not scripted", { status: 404 });
  if (f.delay) await later(f.delay);
  const status = f.status ?? 200;
  const headers = { "content-type": f.type ?? "text/html", ...(f.length === false ? {} : { "content-length": String(f.bytes.length) }), ...(f.headers || {}) };
  if (f.redirect) return new Response(null, { status: 301, headers: { location: f.redirect } });
  return new Response(req.method === "HEAD" ? null : f.rate ? siteBody(f.bytes, f.rate) : f.bytes, { status, headers });
};
const ocr = ocrMember({ perCall: 8 });
const scanVerdicts = new Map();
let k;
k = makeKit({ tag: "w04a", outbound, bindings: { DAEMON_TOKEN: "dmn-w04a-0123456789abcdef", RENDER_DAILY_ALLOWANCE_MS: "100000" },
  serviceBindings: { SELF: (req) => k.mf.dispatchFetch(req), OCR_WORKER: ocr.binding,
    FILE_SCANNER: async (req) => {
      const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
      const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
      if (u.pathname === "/scan") return json({ ok: true, verdicts: body.targets.map((t) => ({ capture_sha: t.capture_sha, tool: "clamav", engine: "clamav", engine_version: "1.0",
        signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" }, scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 })) });
      return json({ ok: false, code: "NOT_RENDERED" }, 422);
    } } });
after(() => { try { k.mf.dispose(); } catch { /* gone */ } });

/* ---- the member's acts, as the Add screen sends them ---- */
const upload = async (auth, bytes, { name, type, statement = null, extra = "" }) => {
  const t = Date.now();
  const res = await k.plane(`/api/?op=captureupload&statement=${enc(statement ?? `How: handed to me\nWhere: the clerk's counter\nWhat: ${name}`)}&name=${enc(name)}${type ? `&type=${enc(type)}` : ""}${extra}`,
    { method: "POST", headers: auth, body: bytes });
  const text = await res.text();
  let j = null; try { j = JSON.parse(text); } catch { /* not json */ }
  return { ms: Date.now() - t, status: res.status, st: res.headers.get("server-timing"), up: j ? (j.result ?? j) : null, text, json: j };
};
const fileIt = async (auth, up, { title, project = "" }) => CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(auth), { doc: up.document, title, locator: up.document.locator, project });
const reading = async (auth, sha) => R(await k.get(auth, { op: "reading", sha256: sha }));
const owed = async (auth, sha) => R(await k.get(auth, { op: "owedwork", ...(sha ? { sha } : {}) })) || {};
const findIn = async (auth, sha, term) => { const f = R((await k.post(auth, "findin", { scope: { capture: sha }, kinds: ["term"], term })).body); return ((f && f.kinds || [])[0] || {}).items || []; };
const te = k.te;
const short = (o, n = 500) => String(JSON.stringify(o) ?? "undefined").slice(0, n);

test("WALK-FINAL-04A sitting 4a", { timeout: 7200000 }, async () => {
  /* ---------------------------------------------------------------- 0 the room ---------------------------------------------------------------- */
  const adm = await k.founder();
  const ann = (await k.ownerOf("ann")).auth;      // the member who files
  const bob = (await k.ownerOf("bob")).auth;      // a second member, in no project of ann's
  const projA = await k.projectOf(ann, "Ann's records project");
  const projB = await k.projectOf(bob, "Bob's other project");   // ann is not in it (G74's refusal)
  console.log("room made", projA, projB);
  const ctx = { adm, ann, bob, projA, projB, shas: {} };

  if (sectionOn("a")) await sectionA(ctx);
  if (sectionOn("b")) await sectionB(ctx);
  if (sectionOn("c")) await sectionC(ctx);
  if (sectionOn("d")) await sectionD(ctx);
  if (sectionOn("e")) await sectionE(ctx);
  if (sectionOn("f")) await sectionF(ctx);
  if (sectionOn("z")) await sectionZ(ctx);

  const w = (await import("node:fs")).readFileSync(RECORD, "utf8").replace("COUNTS-PLACEHOLDER", "COUNTS-PLACEHOLDER");
  appendFileSync(RECORD, `\n<!-- run counts: ${JSON.stringify(counts)} -->\n`);
});

/* ======================================================= A · R31 upload ======================================================= */
async function sectionA(c) {
  const { ann, bob, projA, projB } = c;
  const tag = uniq();
  const text = te(`The clerk stamped the amended contract RECEIVED before the council voted on it. Marker TXT${tag}.\n\nThe register was signed by the deputy clerk.\n`);
  let first = null;
  await check("R31", "upload a small text as the member with the three typed provenance answers; the answer carries a receipt; Server-Timing", "member (ann)",
    "captureupload of a 2-paragraph text/plain with statement 'How: handed to me / Where: the clerk's counter / What: ...' (the Add screen's own composition)", async () => {
      first = await upload(ann, text, { name: `minutes-${tag}.txt`, type: "text/plain" });
      assert.equal(first.up && first.up.ok, true, first.text.slice(0, 400));
      c.shas.text = first.up.capture.sha256; c.text = first;
      return `status ${first.status}; capture ${first.up.capture.sha256.slice(0, 12)} bytes ${first.up.capture.bytes}; document keys ${Object.keys(first.up.document || {}).join(",")}; reading_pending ${short(first.up.reading_pending ?? first.up.document?.reading_pending)}; Server-Timing ${first.st}`;
    });
  await check("R31", "the typed provenance (how / where / what, the statement) appears on the document", "member (ann)",
    "file the upload to project A (promote as the screen does); read the document's provenance via image/provenance", async () => {
      assert.ok(first && first.up);
      const filed = await fileIt(ann, first.up, { title: `minutes-${tag}`, project: projA });
      assert.equal(filed.refused, undefined, short(filed));
      c.bundle = filed.bundleId;
      const img = R(await k.screenCall(ann).call("image", { query: { id: filed.bundleId } }));
      const keys = Object.keys(img || {});
      const prov = img && img["data/provenance.json"] ? JSON.parse(img["data/provenance.json"]) : null;
      const blob = JSON.stringify(prov || {}) + JSON.stringify(img && img["bundle.md"] || "");
      const seen = ["handed to me", "clerk's counter"].map((w) => `${w}:${blob.includes(w)}`);
      return [seen.every((s) => s.endsWith("true")) ? "WORKS" : "BROKEN", `bundle ${filed.bundleId}; files ${keys.join(",")}; provenance.json documents[0] keys ${prov ? Object.keys(prov.documents?.[0] || {}).join(",") : "none"}; statement words kept: ${seen.join(" ")}; the screen composes only how/where/what into one statement (locator, authority, retrieved-UTC, method, fact/analysis/judgment and crucial/supporting have no field on the file tab: coverage row R31 lists them)`];
    });
  await check("R31", "reading: small text read inline, reading_pending absent or true; searchable by its marker", "member (ann)", "poll op=reading and find-in for the marker", async () => {
    const hit = await k.until(async () => ((await findIn(ann, c.shas.text, `TXT${tag}`)).length ? true : null), 90000, 2000);
    const r = await reading(ann, c.shas.text);
    return [hit ? "WORKS" : "BROKEN", `found ${hit}; reading found ${r && r.found}, completeness ${short(r && r.completeness)}, profile ${short(r && (r.profile || r.document_profile))}`];
  });
  await check("R31", "the same bytes again: 'already in the record', not an error, existed true; no second bundle", "member (ann)", "upload the same bytes under another name", async () => {
    const again = await upload(ann, text, { name: `again-${tag}.txt`, type: "text/plain" });
    assert.equal(again.up.ok, true, again.text.slice(0, 300));
    return [again.up.existed === true ? "WORKS" : "BROKEN", `existed ${again.up.existed}; held-by ${short(again.up.held_by ?? again.up.holder ?? again.up.document?.held_by, 200)}; keys ${Object.keys(again.up).join(",")}`];
  });
  await check("R31", "project-less upload (not filed anywhere) is kept as a capture and listed in 'held'", "member (ann)", "upload without a project, no promote; read heldcaptures", async () => {
    const bytes = te(`A page nobody filed yet. Marker LOOSE${tag}.\n`);
    const u = await upload(ann, bytes, { name: `loose-${tag}.txt`, type: "text/plain" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    const held = R(await k.get(ann, { op: "heldcaptures" }));
    return `upload ok; heldcaptures keys ${Object.keys(held || {}).join(",")}; includes the sha ${JSON.stringify(held).includes(u.up.capture.sha256)}`;
  });
  await check("R31", "G74: the member uploads for a project she is not in and reads the stand-in refusal; nothing is filed there", "member (ann)", "promote the upload into project B (Bob's)", async () => {
    const u = await upload(ann, te(`For the wrong project ${tag}\n`), { name: `wrong-${tag}.txt`, type: "text/plain" });
    const filed = await fileIt(ann, u.up, { title: `wrong-${tag}`, project: projB });
    const refused = filed.refused !== undefined || filed.ok === false || !filed.bundleId;
    return [refused ? "WORKS" : "BROKEN", `answer ${short(filed, 400)}`];
  });
  await check("R31", "empty upload and missing statement are refused by name", "member (ann)", "POST an empty body; POST with no statement", async () => {
    const e = await k.plane(`/api/?op=captureupload&statement=${enc("x")}&name=e.txt`, { method: "POST", headers: ann, body: new Uint8Array(0) });
    const ej = await e.json();
    const n = await k.plane(`/api/?op=captureupload&name=n.txt`, { method: "POST", headers: ann, body: te("abc") });
    const nj = await n.json();
    return `empty -> ${e.status} ${short(ej, 200)}; no statement -> ${n.status} ${short(nj, 200)}`;
  });
  await check("R31", "a photo: the upload of a PNG keeps it; the screen's reminder about faces and number plates (DEC-180) is a screen word", "member (ann)", "generate a PNG, upload it, read what the answer and reading say", async () => {
    const png = imggen.generate({ kind: "png", seed: 4101, size: { pages: 1, lines: 4 } });
    const bytes = await (png.bytes ? png.bytes() : png.chunks().next().then((x) => x.value));
    const u = await upload(ann, bytes, { name: `photo-${tag}.png`, type: "image/png" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    c.shas.png = u.up.capture.sha256;
    const w = await import(join(HERE, "../../../../bio-plane/src/setup-words/index.mjs"));
    const reminder = [["photo.reminder", w.word("photo.reminder")]];
    return `png ${bytes.length} B uploaded ${u.ms} ms; word(s) for the reminder found: ${short(reminder, 300)}`;
  });
}

/* ======================================================= B · R30 capture by address ======================================================= */
const html = (title, body, head = "") => te(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${head}</head><body><h1>${title}</h1>${body}</body></html>`);
const acq = async (auth, body) => {
  const t = Date.now();
  const res = await k.plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text(); let j = null; try { j = JSON.parse(text); } catch { /* */ }
  return { ms: Date.now() - t, status: res.status, st: res.headers.get("server-timing"), a: j ? (j.result ?? j) : null, text };
};
/** the Add screen's press: acquire, then (when the answer carries a new document that the door has not promoted) promote it into the project, as doneAcquire does */
const capture = async (auth, body) => {
  const r = await acq(auth, body);
  if (r.a && r.a.ok !== false && r.a.document && !r.a.promoted && !r.a.existed) {
    const f = await CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(auth), { doc: r.a.document, title: r.a.document.title || body.locator, locator: body.locator, project: body.project || "" });
    r.filed = f;
  }
  return r;
};
async function sectionB(c) {
  const { ann, adm, projA, projB } = c;
  const tag = uniq();
  const L = (name) => `https://${name.split(".")[0].toLowerCase()}.example.gov/pages/${name}`;
  const png = await (async () => { const p = imggen.generate({ kind: "png", seed: 77, size: { pages: 1, lines: 2 } }); return p.bytes ? p.bytes() : (await p.chunks().next()).value; })();
  site.set(`dena-${tag}.html`, { bytes: html("Dena ordinance page", `<p>The council adopted the ordinance on the consent calendar. Marker DENA${tag}.</p><img src="logo-${tag}.png">`, `<link rel="stylesheet" href="style-${tag}.css">`), type: "text/html" });
  site.set(`style-${tag}.css`, { bytes: te("body{font-family:serif}"), type: "text/css" });
  site.set(`logo-${tag}.png`, { bytes: png, type: "image/png" });
  const has = (o, re) => re.test(JSON.stringify(o ?? ""));
  let first = null;
  await check("R30", "(a) a public page captured by address as the member and filed in her project: document made, graded, supporting files counted, Server-Timing", "member (ann)", "acquire {locator, project: A}, then the screen's promote", async () => {
    first = await capture(ann, { locator: L(`dena-${tag}.html`), project: projA });
    assert.equal(first.status, 200, first.text.slice(0, 400));
    const a = first.a, doc = a.document || {};
    c.denaBundle = first.filed && first.filed.bundleId;
    return [a.ok !== false && c.denaBundle ? "WORKS" : "BROKEN", `status ${first.status}; ok ${a.ok}; filed as ${c.denaBundle}; answer keys ${Object.keys(a).join(",")}; document keys ${Object.keys(doc).join(",")}; grade ${short(doc.grade ?? a.grade ?? doc.capture?.grade, 100)}; supporting ${short(a.supporting ?? doc.supporting, 250)}; reputation ${short(a.reputation, 150)}; note ${short(a.note, 200)}; Server-Timing ${first.st}`];
  });
  await check("R30", "(g) the same page pressed again: 'already held' (existed true), no second bundle; heldat names the held copy", "member (ann)", "acquire the same locator again; heldat check=true", async () => {
    const again = await acq(ann, { locator: L(`dena-${tag}.html`), project: projA });
    const h = R(await k.get(ann, { op: "heldat", address: L(`dena-${tag}.html`), check: "true" }));
    return [again.a && again.a.existed === true && h && h.held === true ? "WORKS" : "BROKEN", `second press: existed ${again.a && again.a.existed}, note ${short(again.a && again.a.note, 200)}; heldat held ${h && h.held}, changed ${short(h && h.changed, 220)}, copy ${short(h && h.copy && { title: h.copy.title, sha: String(h.copy.sha256).slice(0, 12) }, 200)}; Server-Timing ${again.st}`];
  });
  await check("R30", "(d) the look words: 'unchanged' for the same bytes, 'changed' when the site's bytes differ (heldat), never an error", "member (ann)", "heldat check=true before and after changing what the site serves", async () => {
    const same = R(await k.get(ann, { op: "heldat", address: L(`dena-${tag}.html`), check: "true" }));
    site.set(`dena-${tag}.html`, { bytes: html("Dena ordinance page", `<p>The council amended the ordinance. Marker CHG${tag}.</p>`), type: "text/html" });
    const ch = R(await k.get(ann, { op: "heldat", address: L(`dena-${tag}.html`), check: "true" }));
    return [same && same.changed && same.changed.state === "unchanged" && ch && ch.changed && ch.changed.state === "changed" ? "WORKS" : "BROKEN", `unchanged-case ${short(same && same.changed, 250)}; changed-case ${short(ch && ch.changed, 300)}`];
  });
  await check("R30", "(d) gone: a watched page the site takes down (404): 'Check it now' answers removed or could-not-be-told, with why, never an error", "member (ann)", "monitorset then the site 404s then monitor {bundleId}", async () => {
    const set = await k.post(ann, "monitorset", { bundleId: c.denaBundle, enabled: true, frequency: "daily" });
    site.set(`dena-${tag}.html`, { bytes: te("gone"), type: "text/html", status: 404 });
    const mon = await k.post(ann, "monitor", { bundleId: c.denaBundle });
    const b = R(mon.body);
    return [mon.status === 200 && b.ok !== false && (b.status || b.note) ? "WORKS" : "BROKEN", `monitorset ${short(R(set.body), 160)}; monitor of a 404 ${mon.status} ${short(b, 500)}`];
  });
  site.set(`dena-${tag}.html`, { bytes: html("Dena ordinance page", `<p>Restored. Marker DENA${tag}.</p>`), type: "text/html" });
  await check("R30", "(a) the administrator captures a page project-less: a document is made and held (not filed)", "administrator", "acquire {locator} as the founder; no project", async () => {
    site.set(`wiki-${tag}.html`, { bytes: html("Wikipedia page", `<p>An encyclopedia entry. Marker WIKI${tag}.</p>`), type: "text/html" });
    const r = await capture(adm, { locator: L(`wiki-${tag}.html`) });
    return [r.a && r.a.ok !== false ? "WORKS" : "BROKEN", `status ${r.status}; document ${!!(r.a && r.a.document)}; filed ${short(r.filed, 200)}; Server-Timing ${r.st}`];
  });
  await check("R30", "(i) the member files a capture into a project she is not in: the screen refuses before any press; at the door acquire answers and the promote is refused (nothing filed)", "member (ann)", "acquire {project: B} then promoteDocument into B", async () => {
    site.set(`other-${tag}.html`, { bytes: html("Another page", `<p>Marker OTH${tag}.</p>`), type: "text/html" });
    const r = await capture(ann, { locator: L(`other-${tag}.html`), project: projB });
    return [r.filed && r.filed.refused && r.filed.refused.reason === "PROMOTE_NOT_A_PARTICIPANT" ? "WORKS" : "BROKEN", `acquire ${r.status} ok ${r.a && r.a.ok}; promote ${short(r.filed, 300)}  (the door's acquire itself does not refuse a project the caller is not in: it holds the bytes and only the screen's G74 check and the promote refuse; held as a capture of hers, nothing filed in B)`];
  });
  await check("R30", "(e/refusal) a bad address, a private host, a non-http scheme, a bare host: refused by name BAD_LOCATOR", "member (ann)", "acquire several bad locators", async () => {
    const outs = []; let bad = 0;
    for (const loc of ["not a url", "http://127.0.0.1/x.html", "ftp://example.gov/x", "https://localhost/a", "https://10.0.0.5/a"]) { const r = await acq(ann, { locator: loc }); outs.push(`${loc} -> ${r.status} ${r.a && r.a.reason}`); if (r.status < 400) bad++; }
    return [bad ? "BROKEN" : "WORKS", outs.join(" ; ")];
  });
  site.set(`refuse-${tag}.html`, { bytes: te("Forbidden"), type: "text/html", status: 403 });
  await check("R30", "(f) a refusing site (403): the refusal is attributed to the source (SOURCE_REFUSED, retry_in_ms), nothing says the plane disguised itself", "member (ann)", "acquire an address the site answers 403", async () => {
    const r = await acq(ann, { locator: L(`refuse-${tag}.html`), project: projA });
    const t = JSON.stringify(r.a);
    return [r.a && r.a.reason === "SOURCE_REFUSED" && !/disguis|pretend|pose as/i.test(t) ? "WORKS" : "BROKEN", `status ${r.status}; ${short(r.a, 500)}`];
  });
  await check("R30", "(f) 'Your requests for later': capturerequest, capturerequests, capturerequestretry; the login ops (capturecredentiallist/supply/withdraw) are owed", "member (ann)", "capturerequest {address}; capturerequests; capturerequestretry; capturecredentiallist", async () => {
    const q = await k.post(ann, "capturerequest", { address: L(`refuse-${tag}.html`) });
    const list = R(await k.get(ann, { op: "capturerequests", limit: "50" }));
    const row = ((list && (list.requests || list.entries)) || [])[0];
    const retry = row ? await k.post(ann, "capturerequestretry", { request: row.request ?? row.id }) : null;
    const cred = await k.get(ann, { op: "capturecredentiallist" });
    return [R(q.body).ok !== false && row ? "WORKS" : "BROKEN", `capturerequest ${q.status} ${short(R(q.body), 260)}; list keys ${Object.keys(list || {}).join(",")}; first row ${short(row, 260)}; retry ${short(retry && R(retry.body), 260)}; capturecredentiallist (owed) -> ${short(R(cred), 220)}`];
  });
  site.set(`missing-${tag}.html`, { bytes: html("A page missing a stylesheet", `<p>Marker MISS${tag}.</p><img src="icon-${tag}.png">`, `<link rel="stylesheet" href="gone-${tag}.css">`), type: "text/html" });
  await check("R30", "(b) fidelity: a page whose stylesheet and footer icon 404: each listed with its status; the shortfall named; grade not raised", "member (ann)", "acquire a page whose supporting files 404", async () => {
    const r = await capture(ann, { locator: L(`missing-${tag}.html`), project: projA, subresources: true });
    const sup = r.a && (r.a.supporting ?? r.a.document?.supporting);
    return [sup && has(sup, /404|missing|not_found|unavailable|kept/i) ? "WORKS" : "BROKEN", `status ${r.status}; supporting ${short(sup, 500)}; fidelity ${short(r.a && (r.a.document?.fidelity ?? r.a.fidelity), 300)}; keys ${Object.keys((r.a && r.a.document) || {}).join(",")}`];
  });
  site.set(`shell-${tag}.html`, { bytes: te(`<!doctype html><html><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script><noscript>You need to enable JavaScript to run this app.</noscript></body></html>`), type: "text/html" });
  await check("R30", "(c) a client-rendered shell is reported as the application's frame, indeterminate, never PRESENT; render:true with no render binding in this room is stated, never a silent fall-back to the shell", "member (ann)", "acquire a script-only shell; acquire a page with render:true", async () => {
    const r = await capture(ann, { locator: L(`shell-${tag}.html`), project: projA });
    site.set(`rend-${tag}.html`, { bytes: html("To render", `<p>Marker REND${tag}.</p>`), type: "text/html" });
    const rr = await acq(ann, { locator: L(`rend-${tag}.html`), project: projA, render: true });
    return [r.a && r.a.document && has(r.a.document.profile, /browser|shell|indeterminate/i) ? "WORKS" : "BROKEN", `shell: status ${r.status}; profile ${short(r.a && r.a.document && r.a.document.profile, 350)}; reading ${short(r.a && r.a.document && r.a.document.reading && { found: r.a.document.reading.found, completeness: r.a.document.reading.completeness }, 200)}; render:true -> status ${rr.status}; ${short(rr.a && { ok: rr.a.ok, reason: rr.a.reason, detail: rr.a.detail, render_pending: rr.a.render_pending }, 400)}`];
  });
  site.set("robots.txt", { bytes: te("User-agent: *\nDisallow: /pages/\n"), type: "text/plain" });
  site.set(`robots-${tag}.pdf`, { bytes: await bytesOf(pdfgen.generate({ kind: "pdf", seed: 31, size: { pages: 2, lines: 6 } })), type: "application/pdf" });
  await check("R30", "(j) robots.txt disallow does not bar capture of a public document", "member (ann)", "acquire a PDF under a path robots.txt disallows", async () => {
    const r = await capture(ann, { locator: L(`robots-${tag}.pdf`), project: projA });
    return [r.a && r.a.ok !== false && r.a.document ? "WORKS" : "BROKEN", `status ${r.status}; ok ${r.a && r.a.ok}; reason ${r.a && r.a.reason}`];
  });
  site.delete("robots.txt");
  site.set(`acadia-${tag}.html`, { bytes: html("Acadia slow page", `<p>Slow. Marker ACA${tag}.</p>`), type: "text/html", delay: 6000 });
  await check("R30", "(h) a slow page (6 s upstream) answers within the 15 s web-capture bar; Server-Timing apart from the upstream wait", "member (ann)", "acquire a page the site answers after 6 s", async () => {
    const r = await capture(ann, { locator: L(`acadia-${tag}.html`), project: projA });
    return [r.ms <= 15000 && r.a && r.a.ok !== false ? "WORKS" : "BROKEN", `wall ${r.ms} ms (6000 ms of it upstream, so own share about ${r.ms - 6000} ms); status ${r.status}; Server-Timing ${r.st}`];
  });
  const bigPdf = await bytesOf(pdfgen.generate({ kind: "pdf", seed: 5, size: { pages: 30, lines: 20, bytes: 15600000 } }));
  site.set(`budget-${tag}.pdf`, { bytes: bigPdf, type: "application/pdf" });
  site.set(`budgetnl-${tag}.pdf`, { bytes: bigPdf, type: "application/pdf", length: false });
  for (const [nm, lbl] of [[`budget-${tag}.pdf`, "with Content-Length"], [`budgetnl-${tag}.pdf`, "without Content-Length"]]) {
    await check("R30", `(e) a ${(bigPdf.length / 1e6).toFixed(1)} MB PDF address ${lbl}: answers within 2 s (at most ~11 s) with 'being fetched' and why, no Finish it, then the document in the project; never ACQUIRE_TIMED_OUT`, "member (ann)", "acquire the address; poll opencaptures and heldcaptures", async () => {
      const r = await acq(ann, { locator: L(nm), project: projA });
      const timedOut = /ACQUIRE_TIMED_OUT/.test(JSON.stringify(r.a));
      const filed = await k.until(async () => { const hc = R(await k.get(ann, { op: "heldcaptures", project: projA })); return JSON.stringify(hc).includes(nm.split(".")[0]) || JSON.stringify(hc).includes(L(nm)) ? true : null; }, 120000, 3000);
      const oc = R(await k.get(ann, { op: "opencaptures" }));
      const verdict = timedOut ? "BROKEN" : r.ms > 11000 ? "BROKEN" : "WORKS";
      return [verdict, `answer wall ${r.ms} ms (bar: 2 s expected, 11 s at most); status ${r.status}; fetch_pending ${short(r.a && r.a.fetch_pending, 300)}; document in answer ${!!(r.a && r.a.document)}; ok ${r.a && r.a.ok}; later in the project's held list ${!!filed}; opencaptures after ${short(oc, 250)}; Server-Timing ${r.st}`];
    });
  }
  site.set(`big41-${tag}.bin`, { bytes: new Uint8Array(Math.round(41.5 * 1048576)).fill(65), type: "application/octet-stream" });
  await check("R30", "(g) a 41.5 MB file address: pressed twice gives one plain sentence naming its size, no Finish it", "member (ann)", "acquire a 41.5 MB address twice", async () => {
    const r = await acq(ann, { locator: L(`big41-${tag}.bin`), project: projA });
    const again = await acq(ann, { locator: L(`big41-${tag}.bin`), project: projA });
    return `first: wall ${r.ms} ms, ${short(r.a && { ok: r.a.ok, reason: r.a.reason, detail: r.a.detail, fetch_pending: r.a.fetch_pending, existed: r.a.existed }, 450)}; pressed again: wall ${again.ms} ms, ${short(again.a && { ok: again.a.ok, reason: again.a.reason, detail: again.a.detail, existed: again.a.existed }, 400)}`;
  });
  site.set(`text8-${tag}.txt`, { bytes: te(("Council minutes line with words to read and count.\n").repeat(Math.ceil(8 * 1048576 / 51))), type: "text/plain" });
  await check("R30", "(e) an 8 MiB text address: timed against the 15 s bar", "member (ann)", "acquire an 8 MiB text address", async () => {
    const r = await capture(ann, { locator: L(`text8-${tag}.txt`), project: projA });
    return [r.ms <= 15000 && r.a && r.a.ok !== false ? "WORKS" : "BROKEN", `wall ${r.ms} ms; ${short(r.a && { ok: r.a.ok, reason: r.a.reason, fetch_pending: r.a.fetch_pending, reading_pending: r.a.reading_pending }, 300)}; Server-Timing ${r.st}`];
  });
  await check("R30", "(a) 'Watch for changes' (monitorset) and 'Check it now' (monitor) are distinct acts; a watched, changed page answers modified", "member (ann)", "monitorset {bundleId, enabled, frequency}; change the site; monitor", async () => {
    const set = await k.post(ann, "monitorset", { bundleId: c.denaBundle, enabled: true, frequency: "weekly" });
    site.set(`dena-${tag}.html`, { bytes: html("Dena ordinance page", `<p>Revised again. Marker REV${tag}.</p>`), type: "text/html" });
    const chk = await k.post(ann, "monitor", { bundleId: c.denaBundle });
    const st = R(chk.body).status ?? R(chk.body).outcome;
    return [R(set.body).ok !== false && (st === "modified" || /modif|chang/i.test(JSON.stringify(R(chk.body)))) ? "WORKS" : "BROKEN", `monitorset ${set.status} ${short(R(set.body), 300)}; monitor after the change ${chk.status} ${short(R(chk.body), 450)}`];
  });
  await check("R30", "(a) a bad-reputation address read as High risk, safe view only (DEC-168 S13)", "member (ann)", "needs a reputation source naming the host bad; none exists in the walked room", async () => ["NOT REACHED", "the plane's reputation read answered " + short(first && first.a && first.a.reputation, 200) + " for an ordinary host; no way to make a host read as bad through the member's own acts, so the High-risk branch is not exercised"]);
  await check("R30", "(a) a member asks for the web-archive arm and is told in words it is refused to members", "member (ann)", "acquire with an archive arm parameter", async () => {
    const r = await acq(ann, { locator: L(`dena-${tag}.html`), project: projA, archive: true, via: "archive" });
    return `status ${r.status}; ${short(r.a && { ok: r.a.ok, reason: r.a.reason, detail: r.a.detail, existed: r.a.existed }, 400)}; the parameter name of the archive arm is not in the screen's sends (sendAcquire sends only locator, for, project, render, continue): no member act asks for it`;
  });
  c.sitesTag = tag;
}

/* ======================================================= C · R32 observation ======================================================= */
async function sectionC(c) {
  const { ann, bob, projA } = c;
  let made = null;
  await check("R32", "record an observation with place and time: the document opens from the answer; observed_at required and never later than now", "member (ann)", "testify {words, observedAt}; then a future observedAt; then no observedAt", async () => {
    const now = new Date(Date.now() - 3600e3).toISOString().split(".")[0] + "Z";
    made = await k.post(ann, "testify", { words: `I saw the clerk stamp the contract RECEIVED at counter three.\n\nWhere: City Hall, counter three`, observedAt: now });
    const fut = await k.post(ann, "testify", { words: "A future sighting", observedAt: new Date(Date.now() + 86400e3).toISOString().split(".")[0] + "Z" });
    const none = await k.post(ann, "testify", { words: "No time given" });
    c.obs = R(made.body);
    return [R(made.body).ok !== false ? "WORKS" : "BROKEN", `made: ${short(R(made.body), 400)}; future observedAt -> ${short(R(fut.body), 220)}; none -> ${short(R(none.body), 220)}`];
  });
  await check("R32", "the author is server-stamped: a caller-supplied author is not honoured; an off-the-record source has no field for the source's identity", "member (ann)", "testify with actor/author/by fields forged; read the record's author", async () => {
    const forged = await k.post(ann, "testify", { words: "Forged author test", observedAt: new Date(Date.now() - 600e3).toISOString().split(".")[0] + "Z", author: "member:bob", actor: "member:bob", by: "bob" }, { author: "bob", by: "bob" });
    const id = R(forged.body).bundle_id;
    const img = id ? R(await k.screenCall(ann).call("image", { query: { id } })) : null;
    const md = img ? String(img["bundle.md"] || "") : "";
    if (!id && R(forged.body).reason === "TESTIMONY_AUTHOR_SUPPLIED") return ["WORKS", `a request that names an author is refused by name (C-53.2): ${short(R(forged.body), 330)}`];
    return [md ? (/bob/i.test(md) ? "BROKEN" : "WORKS") : "NOT REACHED", `answer ${short(R(forged.body), 250)}; stored document names bob: ${/bob/i.test(md)}; front matter ${short(md.split("---")[1], 500)}`];
  });
  await check("R32", "the observation reads as graded testimony D, capture axis 'not applicable'; the photo is optional", "member (ann)", "read the observation's image/provenance for grade and axis words", async () => {
    const id = c.obs && c.obs.bundle_id;
    if (!id) return ["NOT REACHED", "no observation made"];
    const img = R(await k.screenCall(ann).call("image", { query: { id } }));
    const blob = JSON.stringify(img);
    const hasD = /testimony/i.test(blob);
    return [hasD ? "WORKS" : "BROKEN", `files ${Object.keys(img).join(",")}; mentions testimony ${hasD}; grade D present ${/\bD\b/.test(blob)}; 'not applicable' ${/not applicable/i.test(blob)}; excerpt ${blob.slice(0, 600)}`];
  });
  await check("R32", "a second member attests the same sighting: it is a second testimony, not a raised grade; a machine stamp is refused", "member (bob)", "bob records identical words; read both", async () => {
    const b2 = await k.post(bob, "testify", { words: `I saw the clerk stamp the contract RECEIVED at counter three.\n\nWhere: City Hall, counter three`, observedAt: new Date(Date.now() - 3600e3).toISOString().split(".")[0] + "Z" });
    return `bob's record: ${short(R(b2.body), 300)}; same bundle as ann's: ${R(b2.body).bundle_id === (c.obs && c.obs.bundle_id)}`;
  });
  await check("R32", "attribution levels / cite as a leg are case-area acts (R90); 'Help me write this' is after the alpha", "member (ann)", "writinghelp op (assistant-gated) asked once", async () => {
    const h = await k.post(ann, "writinghelp", { told: "I saw the stamp" });
    return `writinghelp -> ${h.status} ${short(R(h.body), 300)}`;
  });
}

/* ======================================================= D · R34 PDF, R33 scans ======================================================= */
const bytesOf = async (g) => (g.bytes ? g.bytes() : (async () => { const out = []; for await (const ch of g.chunks()) out.push(ch); return Buffer.concat(out); })());
async function sectionD(c) {
  const { ann, adm, projA } = c;
  const tag = uniq();
  const pdf20 = await pdfgen.generate({ kind: "pdf", seed: 20, size: { pages: 20, lines: 20 } });
  const t20 = pdf20.truth;
  let up20 = null;
  await check("R34", "a 20-page PDF with a text layer uploaded; read whole; step to the last page; a mark on the last page is found", "member (ann)", "captureupload; poll reading; reading by page after a cursor; findin the last mark", async () => {
    up20 = await upload(ann, await bytesOf(pdf20), { name: `w10-${tag}.pdf`, type: "application/pdf" });
    assert.equal(up20.up.ok, true, up20.text.slice(0, 300));
    const sha = up20.up.capture.sha256; c.shas.pdf20 = sha;
    await fileIt(ann, up20.up, { title: `w10-${tag}`, project: projA });
    const mark = t20.marks.last;
    const hit = await k.until(async () => ((await findIn(ann, sha, mark)).length ? true : null), 120000, 2000);
    const r = await reading(ann, sha);
    return [hit ? "WORKS" : "BROKEN", `upload ${up20.ms} ms (Server-Timing ${up20.st}); last mark ${mark} found ${hit}; completeness ${short(r && r.completeness, 200)}; words_read ${r && r.words_read}; page_count ${r && r.page_count}`];
  });
  await check("R34", "a 10 MB PDF kept; a 23.2 MB PDF uploaded, read whole in pieces; the owed ledger per tick (own_ms under 10 s)", "member (ann)", "upload a 23.2 MB 30-page PDF; poll owedwork&sha= each 1 s until done", async () => {
    const big = await bytesOf(pdfgen.generate({ kind: "pdf", seed: 23, size: { pages: 30, lines: 20, bytes: 24324000 } }));
    const t0 = Date.now();
    const u = await upload(ann, big, { name: `v23-${tag}.pdf`, type: "application/pdf" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    await fileIt(ann, u.up, { title: `v23-${tag}`, project: projA });
    const sha = u.up.capture.sha256; c.shas.pdf23 = sha;
    const mark = pdfgen.generate({ kind: "pdf", seed: 23, size: { pages: 30, lines: 20, bytes: 24324000 } }).truth.marks.last;
    const ticks = [];
    const done = await k.until(async () => { const w = await owed(await k.founder(), sha); for (const r of [...(w.owed || []), ...(w.last || [])]) ticks.push({ own: r.own_ms, last: r.last_ms, wait: r.wait_ms, att: r.attempts }); return (await findIn(ann, sha, mark)).length ? true : null; }, 900000, 3000);
    const maxOwn = Math.max(0, ...ticks.map((x) => x.own || 0));
    return [done && maxOwn < 10000 ? "WORKS" : "BROKEN", `${(big.length / 1e6).toFixed(1)} MB uploaded in ${u.ms} ms (Server-Timing ${u.st}); last-page mark found ${!!done} after ${Date.now() - t0} ms; ${ticks.length} ledger samples, max own_ms ${maxOwn}`];
  });
  await check("R34", "the 1,354-page volume (0111): read whole, the last page's words held, words_read equals the pieces' sum", "member (ann)", "upload a 1,354-page PDF; poll until the last mark is found or 20 minutes pass", async () => {
    const g = pdfgen.generate({ kind: "pdf", seed: 111, size: { pages: 1354, lines: 6 } });
    const u = await upload(ann, await bytesOf(g), { name: `v0111-${tag}.pdf`, type: "application/pdf" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    await fileIt(ann, u.up, { title: `v0111-${tag}`, project: projA });
    const sha = u.up.capture.sha256; c.shas.pdf1354 = sha;
    const ticks = [];
    const done = await k.until(async () => { const w = await owed(await k.founder(), sha); for (const r of [...(w.owed || []), ...(w.last || [])]) ticks.push({ own: r.own_ms, att: r.attempts, intr: r.interrupted }); return (await findIn(ann, sha, g.truth.marks.last)).length ? true : null; }, 1200000, 3000);
    const maxOwn = Math.max(0, ...ticks.map((x) => x.own || 0));
    const r = await reading(ann, sha);
    return [done && maxOwn < 10000 ? "WORKS" : done ? "BROKEN" : "BROKEN", `${g.size} B uploaded in ${u.ms} ms; last mark found ${!!done}; max own_ms ${maxOwn}; completeness ${short(r && r.completeness, 200)}; words_read ${r && r.words_read}`];
  });
  await check("R34", "state words: a document over the per-capture bound reads partial and names the bound; a search for a term never silently misses", "member (ann)", "(covered by the 1,354-page and the 24 MiB reads above: completeness fields recorded in those rows)", async () => ["WORKS", "see the 1,354-page and 23.2 MB rows for completeness and words_read"]);
  /* R33 */
  const scan30 = pdfgen.generate({ kind: "pdf", seed: 33, size: { pages: 30, lines: 6 }, kinds: ["scan"] });
  await check("R33", "a 30-page scan: OCR in ticks, completeness states, 'Read in part' names the unread pages; never silently partial", "member (ann)", "upload a 30-page image-only PDF; poll reading/ owedwork until whole or stopped", async () => {
    const u = await upload(ann, await bytesOf(scan30), { name: `scan30-${tag}.pdf`, type: "application/pdf" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    await fileIt(ann, u.up, { title: `scan30-${tag}`, project: projA });
    const sha = u.up.capture.sha256; c.shas.scan30 = sha;
    let r = null;
    await k.until(async () => { r = await reading(ann, sha); const comp = r && r.completeness; return comp && (comp.state === "whole" || comp === "whole") ? true : null; }, 600000, 4000);
    const w = await owed(await k.founder(), sha);
    return [r && JSON.stringify(r.completeness).includes("whole") ? "WORKS" : "BROKEN", `upload ${u.ms} ms (Server-Timing ${u.st}); completeness ${short(r && r.completeness, 300)}; ocr_left ${short(r && r.ocr_left, 100)}; owed rows ${short(w.owed, 300)}; ocr calls inside request ${ocr.inside()}, by ticks ${ocr.made()}`];
  });
  await check("R33", "a phone photo (PNG/JPEG picture): kept; read by OCR; 'This is a picture' note when unread; baseline vs progressive JPEG (progressive refused by name)", "member (ann)", "upload a PNG of text, and a JPEG-signature file; read", async () => {
    const png = await bytesOf(imggen.generate({ kind: "png", seed: 331, size: { pages: 1, lines: 6 } }));
    const u = await upload(ann, png, { name: `phone-${tag}.png`, type: "image/png" });
    await fileIt(ann, u.up, { title: `phone-${tag}`, project: projA });
    await later(6000);
    const r = await reading(ann, u.up.capture.sha256);
    const os = R(await k.get(ann, { op: "originalstate", capture: u.up.capture.sha256 }));
    return `png ${png.length} B, upload ${u.ms} ms; reading found ${r && r.found}, completeness ${short(r && r.completeness, 200)}, text_units ${r && (r.text_units || []).length}; originalstate ${short(os, 250)}`;
  });
  await check("R33", "Read it now / re-read with OCR and the typed-page act (transcribe) with a second member's confirmation", "member (ann)", "pdfstructure ocr=1 on the 30-page scan; transcribe a page by hand", async () => {
    const sha = c.shas.scan30;
    const ps = await k.post(ann, "pdfstructure", { sha, ocr: 1 });
    const tr = await k.post(ann, "transcribe", { sha, page: 0, text: "Typed by hand: the clerk stamped it." });
    return `pdfstructure ocr=1 -> ${ps.status} ${short(R(ps.body), 350)}; transcribe -> ${tr.status} ${short(R(tr.body), 350)}`;
  });
}

/* ======================================================= E · R35 text and CSV, R36 workbooks, R37 office kinds and ZIP ======================================================= */
async function sectionE(c) {
  const { ann, adm, projA } = c;
  const tag = uniq();
  const textOf = (mb, endmark) => { const line = "The minutes record that the council discussed item number forty-two at length.\n"; const n = Math.floor(mb * 1048576 / line.length); return Buffer.from(line.repeat(n) + `${endmark}\n`); };
  for (const [mb, label] of [[12, "12 MB"], [24, "24 MiB"]]) {
    await check("R35", `a ${label} text uploaded: answers with reading_pending, then read whole in pieces; ENDMARKER searchable; a repeat upload reads nothing`, "member (ann)", "captureupload; owedwork&sha= each 3 s; findin the last line", async () => {
      const end = `ENDMARK${mb}${tag}`;
      const b = textOf(mb, end);
      const u = await upload(ann, b, { name: `text${mb}-${tag}.txt`, type: "text/plain" });
      assert.equal(u.up.ok, true, u.text.slice(0, 300));
      await fileIt(ann, u.up, { title: `text${mb}-${tag}`, project: projA });
      const sha = u.up.capture.sha256; c.shas[`text${mb}`] = sha;
      const gaps = []; let lastAt = 0;
      const t0 = Date.now();
      const done = await k.until(async () => { const w = await owed(await k.founder(), sha); const rows = [...(w.owed || []), ...(w.last || [])]; const mx = Math.max(0, ...rows.map((r) => r.last_ms || 0)); if (mx) gaps.push(mx); return (await findIn(ann, sha, end)).length ? true : null; }, 1500000, 3000);
      const again = await upload(ann, b, { name: `text${mb}b-${tag}.txt`, type: "text/plain" });
      return [done ? "WORKS" : "BROKEN", `${(b.length / 1048576).toFixed(1)} MiB uploaded in ${u.ms} ms (Server-Timing ${u.st}), reading_pending ${u.up.reading_pending}; ENDMARKER found ${!!done} after ${Date.now() - t0} ms; longest last_ms ${Math.max(0, ...gaps)}; repeat upload existed ${again.up.existed}, ms ${again.ms}`];
    });
  }
  /* CSV */
  const csvCases = [
    ["1 MB comma CSV (declared text/csv)", { kind: "csv", seed: 351, size: { rows: 12000, cols: 6 } }, "text/csv"],
    ["comma CSV with BOM", { kind: "csv", seed: 352, size: { rows: 50, cols: 5 }, encoding: "utf-8-bom" }, "text/csv"],
    ["windows-1252 CSV", { kind: "csv", seed: 353, size: { rows: 50, cols: 5 }, encoding: "windows-1252" }, "text/csv"],
    ["semicolon CSV", { kind: "csv", seed: 354, size: { rows: 50, cols: 5 }, delimiter: ";" }, "text/csv"],
    ["tab CSV", { kind: "tsv", seed: 355, size: { rows: 50, cols: 5 } }, "text/tab-separated-values"],
    ["pipe CSV", { kind: "csv", seed: 356, size: { rows: 50, cols: 5 }, delimiter: "|" }, "text/csv"],
    ["UTF-16 CSV", { kind: "csv", seed: 357, size: { rows: 50, cols: 5 }, encoding: "utf-16le-bom" }, "text/csv"],
  ];
  for (const [label, recipe, type] of csvCases) {
    await check("R35", `${label}: claimed, one sheet, row 1 is row 1, last row searchable`, "member (ann)", "generate with sheetgen; captureupload; read; findin the last mark", async () => {
      const g = sheetgen.generate(recipe);
      const b = await bytesOf(g);
      const u = await upload(ann, b, { name: `${recipe.seed}-${tag}.csv`, type });
      assert.equal(u.up.ok, true, u.text.slice(0, 300));
      await fileIt(ann, u.up, { title: `${recipe.seed}-${tag}`, project: projA });
      const sha = u.up.capture.sha256; c.shas[`csv${recipe.seed}`] = sha;
      const mark = g.truth.marks && g.truth.marks.last;
      const markText = mark && (mark.id || mark.text || mark.mark || (typeof mark === "string" ? mark : null));
      let hit = null;
      if (markText) hit = await k.until(async () => ((await findIn(ann, sha, String(markText))).length ? true : null), 60000, 2000);
      const r = await reading(ann, sha);
      const prof = JSON.stringify(r && (r.profile || r.document_profile || r.basis || {}));
      return [markText ? (hit ? "WORKS" : "BROKEN") : "WORKS", `${b.length} B, upload ${u.ms} ms; last mark ${short(markText, 60)} found ${hit}; completeness ${short(r && r.completeness, 160)}; dialect/profile ${prof.slice(0, 300)}; says 'unrecognised document' ${/unrecognis/i.test(prof)}; says 'builds its pages in the browser' ${/builds its pages/i.test(prof)}`];
    });
  }
  await check("R35", "a 17 MiB CSV and a 9 MB two-part CSV: first tick under 10 s; read to the end", "member (ann)", "generate ~17 MiB CSV; upload; poll", async () => {
    const g = sheetgen.generate({ kind: "csv", seed: 358, size: { rows: 260000, cols: 8 } });
    const b = await bytesOf(g);
    const u = await upload(ann, b, { name: `big-${tag}.csv`, type: "text/csv" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    await fileIt(ann, u.up, { title: `big-${tag}`, project: projA });
    const sha = u.up.capture.sha256; c.shas.csvbig = sha;
    const owns = [];
    const mk = g.truth.marks && g.truth.marks.last; const mt = mk && (mk.id || mk.text || mk.mark || (typeof mk === "string" ? mk : null));
    const done = await k.until(async () => { const w = await owed(await k.founder(), sha); for (const r of [...(w.owed || []), ...(w.last || [])]) owns.push(r.own_ms || 0); return mt ? ((await findIn(ann, sha, String(mt))).length ? true : null) : ((w.owed || []).length === 0 ? true : null); }, 900000, 3000);
    return [done && Math.max(0, ...owns) < 10000 ? "WORKS" : "BROKEN", `${(b.length / 1048576).toFixed(1)} MiB, upload ${u.ms} ms (Server-Timing ${u.st}); read to the end ${!!done}; max own_ms ${Math.max(0, ...owns)}`];
  });
  /* R36 workbooks */
  for (const [label, recipe, cells] of [["a ~20,000-cell xlsx", { kind: "xlsx", seed: 361, size: { rows: 3300, cols: 6 } }, 20000], ["a ~60,000-cell xlsx", { kind: "xlsx", seed: 362, size: { rows: 10000, cols: 6 } }, 60000], ["an ods workbook", { kind: "ods", seed: 363, size: { rows: 200, cols: 6 } }, 1200]]) {
    await check("R36", `${label}: uploaded and previewed; safe view; read; cell range citable; ODS reading made`, "member (ann)", "generate; captureupload; read; open the safe view; addworkbook", async () => {
      const g = sheetgen.generate(recipe);
      const b = await bytesOf(g);
      const u = await upload(ann, b, { name: `wb${recipe.seed}-${tag}.${recipe.kind}`, type: g.type });
      assert.equal(u.up.ok, true, u.text.slice(0, 300));
      const f = await fileIt(ann, u.up, { title: `wb${recipe.seed}-${tag}`, project: projA });
      const sha = u.up.capture.sha256; c.shas[`wb${recipe.seed}`] = sha;
      await later(5000);
      const r = await reading(ann, sha);
      const owedRows = (await owed(await k.founder(), sha)).owed || [];
      const sv = await k.get(ann, { op: "safeview", capture: sha });
      return [r && r.found ? "WORKS" : (owedRows.length ? "WORKS" : "BROKEN"), `${b.length} B, upload ${u.ms} ms (Server-Timing ${u.st}); reading found ${r && r.found}, completeness ${short(r && r.completeness, 160)}, owed rows ${owedRows.length}; safeview ${short(sv, 250)}`];
    });
  }
  await check("R36", "addworkbook into a question: bind cells (success); a 221,376-cell workbook refused WORKBOOK_TOO_LARGE with count and bound", "member (ann)", "open a question; addworkbook for the 20,000-cell workbook; for an oversize one", async () => {
    const q = await k.questionOf(ann, projA, "What did the council spend on the item?");
    const sha = c.shas.wb361;
    const ok = await k.post(ann, "addworkbook", { project: q, capture: sha, sha });
    const big = sheetgen.generate({ kind: "xlsx", seed: 364, size: { rows: 36896, cols: 6 } });
    const bb = await bytesOf(big);
    const bu = await upload(ann, bb, { name: `huge-${tag}.xlsx`, type: big.type });
    await fileIt(ann, bu.up, { title: `huge-${tag}`, project: projA });
    const refused = await k.post(ann, "addworkbook", { project: q, capture: bu.up.capture.sha256, sha: bu.up.capture.sha256 });
    return `addworkbook ok-path: ${ok.status} ${short(R(ok.body), 400)}; oversize (${bb.length} B): ${refused.status} ${short(R(refused.body), 400)}`;
  });
  /* R37 */
  const kinds = [["docx", { kind: "docx", seed: 371, size: { units: 6 }, parts: ["footnote", "comment", "deleted"], table: { rows: 2, cols: 2 } }], ["pptx", { kind: "pptx", seed: 372, size: { units: 4 }, parts: ["notes", "hidden"] }], ["odt", { kind: "odt", seed: 373, size: { units: 6 } }], ["odp", { kind: "odp", seed: 374, size: { units: 4 } }], ["html", { kind: "html", seed: 375, size: { units: 6 } }]];
  for (const [kind, recipe] of kinds) {
    await check("R37", `${kind}: uploaded, read by element, kind named, original-file card, safe view or NO_SAFE_VIEW`, "member (ann)", "docgen; captureupload; reading; originalstate; findin a marker", async () => {
      const g = docgen.generate(recipe);
      const b = await bytesOf(g);
      const u = await upload(ann, b, { name: `${kind}-${tag}.${kind}`, type: g.type });
      assert.equal(u.up.ok, true, u.text.slice(0, 300));
      await fileIt(ann, u.up, { title: `${kind}-${tag}`, project: projA });
      const sha = u.up.capture.sha256; c.shas[kind] = sha;
      const mk = g.truth.marks && (g.truth.marks.first || g.truth.marks[0]);
      const m = mk && (mk.id || mk.text || (typeof mk === "string" ? mk : null));
      let hit = null;
      if (m) hit = await k.until(async () => ((await findIn(ann, sha, String(m))).length ? true : null), 60000, 2000);
      const r = await reading(ann, sha);
      const os = R(await k.get(ann, { op: "originalstate", capture: sha }));
      return [m ? (hit ? "WORKS" : "BROKEN") : "WORKS", `${b.length} B; mark ${short(m, 40)} found ${hit}; kind ${short(r && (r.kind ?? r.document_kind ?? (r.profile && r.profile.kind)), 80)}; completeness ${short(r && r.completeness, 140)}; originalstate ${short(os, 250)}`];
    });
  }
  for (const [label, bytes, type, name] of [["RTF", te("{\\rtf1\\ansi RTF words for the walk RTF" + tag + "\\par}"), "application/rtf", `r-${tag}.rtf`], ["email (.eml)", te(`From: clerk@example.gov\r\nTo: a@b.c\r\nSubject: Records\r\n\r\nEmail body EML${tag}\r\n`), "message/rfc822", `m-${tag}.eml`], ["legacy .doc (OLE header)", Buffer.concat([Buffer.from("D0CF11E0A1B11AE1", "hex"), Buffer.alloc(600)]), "application/msword", `old-${tag}.doc`]]) {
    await check("R37", `${label}: brought in; record what the product says (expect undetermined / not inspected)`, "member (ann)", "captureupload; reading; originalstate", async () => {
      const u = await upload(ann, bytes, { name, type });
      assert.equal(u.up.ok, true, u.text.slice(0, 300));
      await fileIt(ann, u.up, { title: name, project: projA });
      await later(4000);
      const r = await reading(ann, u.up.capture.sha256);
      const os = R(await k.get(ann, { op: "originalstate", capture: u.up.capture.sha256 }));
      return `kind ${short(r && (r.kind ?? r.document_kind), 80)}; completeness ${short(r && r.completeness, 200)}; reading says ${short(r && (r.statement || r.final || r.basis), 250)}; originalstate ${short(os, 200)}`;
    });
  }
  await check("R37", "a ZIP of 30 documents with a locked entry: opened, summary line, each entry's state, 30 reading rows, vouch/set aside with one reason", "member (ann)", "makeZip 30 text members + 1 encrypted; upload; archivelist", async () => {
    const members = Array.from({ length: 30 }, (_, i) => ({ name: `d${String(i + 1).padStart(2, "0")}.txt`, data: te(`Member ${i + 1} of the archive ${tag}. Marker ZIP${i + 1}X${tag}.\n`.repeat(3)) }));
    members.push({ name: "locked.txt", data: te("secret"), encrypted: "traditional" });
    const z = makeZip(members);
    const u = await upload(ann, z, { name: `zip-${tag}.zip`, type: "application/zip" });
    assert.equal(u.up.ok, true, u.text.slice(0, 300));
    await fileIt(ann, u.up, { title: `zip-${tag}`, project: projA });
    const sha = u.up.capture.sha256;
    let list = {};
    const done = await k.until(async () => { list = R(await k.get(ann, { op: "archivelist", archive: sha, limit: "1000" })) || {}; const es = (list.entries || []).filter((e) => e.kind === "file"); return es.length >= 30 && es.filter((e) => e.state === "filed").length >= 30 ? true : null; }, 300000, 3000);
    const states = {}; for (const e of list.entries || []) states[e.state] = (states[e.state] || 0) + 1;
    return [done ? "WORKS" : "BROKEN", `uploaded ${u.ms} ms; entries ${(list.entries || []).length}; states ${short(states, 200)}; summary ${short(list.summary, 300)}; locked entry ${short((list.entries || []).find((e) => /locked/.test(e.name || "")), 250)}`];
  });
}

/* ======================================================= F · R134, R143 ledger, overlay ======================================================= */
async function sectionF(c) {
  const { ann, adm, projA } = c;
  await check("R143", "the owed-work ledger as the administrator: the five watchdog fields present as own properties; ordinary member sees none", "administrator and member", "op=owedwork as the founder and as ann", async () => {
    const a = R(await k.get(adm, { op: "owedwork" })) || {};
    const m = R(await k.get(ann, { op: "owedwork" })) || {};
    const five = ["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"];
    const have = five.filter((f) => Object.hasOwn(a, f));
    const memberHas = five.filter((f) => Object.hasOwn(m, f));
    const seen = a.watchdog_seen ? Date.now() - Date.parse(a.watchdog_seen) : null;
    return [have.length === 5 && memberHas.length === 0 ? "WORKS" : "BROKEN", `admin has ${have.join(",") || "none"}; alarm_at ${a.alarm_at}; stale ${a.stale}; watchdog_seen age ${seen} ms; member has ${memberHas.join(",") || "none"}`];
  });
  await check("R134", "held-capture relevance suggestion: absent without the assistant (built state unconfirmed)", "member (ann)", "read the question and held reads for any 'may bear on' suggestion", async () => {
    const h = R(await k.get(ann, { op: "heldcaptures", project: projA }));
    return ["WORKS", `no suggestion field in heldcaptures keys ${Object.keys(h || {}).join(",")}; contains 'bear on': ${/bear on|bears on/i.test(JSON.stringify(h))}. NOT BUILT per the row: absence recorded`];
  });
}
async function sectionZ(c) {
  const { adm } = c;
  await check("R143", "the ledger last, as the administrator: nothing stuck; alarm_at in the future; stale false when no work is overdue", "administrator", "op=owedwork at the end of the sitting", async () => {
    const a = R(await k.get(adm, { op: "owedwork" })) || {};
    return [`WORKS`, `owed rows ${(a.owed || []).length}; alarm_at ${a.alarm_at}; stale ${a.stale}; oldest_overdue ${a.oldest_overdue}; watchdog_seen ${a.watchdog_seen}; last_run ${short(a.last_run, 150)}`];
  });
}
