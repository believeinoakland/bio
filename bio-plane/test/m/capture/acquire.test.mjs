/* capture: the acquisition act (R1–R20, R33–R38, R41, R42, R55) at the module's interface, `Capture#acquire` and
   `archiveLookup`, over a scripted network, an evidence bucket, and host-governor's and provenance's services as their
   Provides state them (fixture.mjs). Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, governor, provenance, network, sha, receipt, H } from "./fixture.mjs";
import { RENDER_DEFAULTS, renderLocaleFor } from "../../../src/render.mjs";
import { EARNED_CAPTURE_CEILING, DRIVE_CAPTURE_CHECKS, RENDER_CAPTURE_CHECKS, CAPTURE_REQUEST_CHECKS } from "../../../checks/bio-checks.mjs";
import { SUBRESOURCE_STAGGER_SETTING, REACHABILITY_SETTINGS } from "../../../src/capture/index.mjs";
import { ARCHIVE_CAPTURE_GRADE } from "../../../src/provenance/index.mjs";

const HTML = (body = "<p>hello</p>") => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
const page = (body, headers = {}, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

function world(opts = {}) {
  const b = bucket();
  const gov = governor(opts.gov || {});
  const f = fresh({ evidence: b, gov, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9", ...(opts.env || {}) }, prov: opts.prov });
  if (opts.prov === undefined) f.c.provenance = provenance(f.s, opts.provOpts || {});
  f.core.setSetting(SUBRESOURCE_STAGGER_SETTING, 0, "member:admin");
  return { ...f, b, gov, prov: f.c.provenance };
}
async function run(w, routes, body, o = {}) {
  const net = network(routes);
  try { const r = await w.c.acquire(body, { cls: "member", member: true, sessMember: "m1", storeName: "bio", ...o }); return { ...r, net }; }
  finally { net.restore(); }
}
const held = (w, digest) => w.b.held.has(`bio/captures/${digest}`);

test("R1: a daemon is refused except on the archive and capture-request arms; the archive arm is admin, probe and daemon only; capture-request from outside is C-28.13", async () => {
  const w = world();
  const d = await run(w, {}, { locator: "https://a.example/x" }, { cls: "daemon", member: false });
  assert.deepEqual([d.status, d.body.reason], [403, "NOT_PERMITTED"]);
  const m = await run(w, {}, { via: "archive.org", address: "https://a.example/x" }, { cls: "member" });
  assert.deepEqual([m.status, m.body.reason], [403, "NOT_PERMITTED"]);
  for (const cls of ["admin", "probe", "daemon", "member"]) {
    const r = await run(w, {}, { via: "capture-request", request: "CR-1", locator: "https://a.example/x" }, { cls });
    assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.translation],
                     [403, "CAPTURE_NOT_DRAINING", CAPTURE_REQUEST_CHECKS.CAPTURE_NOT_DRAINING.check, CAPTURE_REQUEST_CHECKS.CAPTURE_NOT_DRAINING.translation]);
    assert.equal(r.net.seen.length, 0);
  }
  /* the trusted in-process arm: everything that leaves comes from the row */
  const inproc = await run(w, { "https://row.example/doc": page("row bytes", { "content-type": "text/plain" }) },
    { locator: "https://evil.example/", render: true }, { cls: "daemon", member: false,
      captureRequest: { locator: "https://row.example/doc", purpose: "investigation", agent: "Mozilla/5.0 Member", render: false } });
  assert.equal(inproc.status, 200);
  assert.deepEqual(inproc.net.seen.map((x) => x.url), ["https://row.example/doc"]);
  assert.equal(inproc.net.seen[0].init.headers["user-agent"], "Mozilla/5.0 Member", "the delegated agent the row named");
});

test("R2 R35: the fetched address must be a public locator, and no caller-supplied hop, locator, export fact, grade or receipt reaches the answer", async () => {
  const w = world();
  for (const bad of ["http://a.example/x", "https://127.0.0.1/x", "https://localhost/x", "https://u:p@a.example/x", "https://intranet/x", 42]) {
    const r = await run(w, {}, { locator: bad });
    assert.deepEqual([r.status, r.body.reason], [400, "BAD_LOCATOR"], String(bad));
    assert.equal(r.net.seen.length, 0);
  }
  const r = await run(w, { "https://a.example/x": page("bytes", { "content-type": "text/plain" }) },
    { locator: "https://a.example/x", provenance_chain: [{ who: "me" }], grade: "A", capture: { grade: "A" }, retrieval_locator: "https://evil/", receipt: {} });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.provenance_chain.length, 1);
  assert.match(r.body.document.provenance_chain[0].who, /^instance inst/);
  assert.equal(r.body.document.capture.grade, EARNED_CAPTURE_CEILING);
  assert.equal(w.prov.receipts[0].retrievalLocator, "https://a.example/x");
  const drive = await run(w, {}, { locator: "https://docs.google.com/document/d/abcdefghijk/edit", export_address: "https://evil/" });
  assert.equal(drive.body.reason, "DRIVE_HOP_FACT_SUPPLIED");
});

const CDX = (rows) => new Response(JSON.stringify([["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"], ...rows]),
                                   { headers: { "content-type": "application/json" } });
const cdxRow = (ts, original = "https://gone.example/doc", status = "200") => ["gone.example)/doc", ts, original, "text/plain", status, "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "123"];
async function eligible(w, addr = "https://gone.example/doc") {
  for (let i = 0; i < 3; i++) await w.c.recordSourceOutcome({ addressNorm: addr, outcome: "source_refused", status: 404 });
}

test("R3: the archive arm needs an eligible address, queries the CDX through the governor at 24 a minute, and files the chosen replay under the CDX original with the archive's hop", async () => {
  const w = world();
  const addr = "https://gone.example/doc";
  const bad = await run(w, {}, { via: "archive.org", locator: addr }, { cls: "admin" });
  assert.equal(bad.body.reason, "BAD_ADDRESS");
  const ne = await run(w, {}, { via: "archive.org", address: addr }, { cls: "admin" });
  assert.deepEqual([ne.status, ne.body.reason, ne.body.reachability.fallback_eligible], [409, "NOT_ELIGIBLE", false]);
  await eligible(w);
  const routes = (u) => u.startsWith("https://web.archive.org/cdx/") ? CDX([cdxRow("20250101000000"), cdxRow("20250601000000", addr, "301")])
    : u === `https://web.archive.org/web/20250101000000id_/${addr}` ? page("archived bytes", { "content-type": "text/plain" }) : null;
  const r = await run(w, routes, { via: "archive.org", address: addr }, { cls: "admin", member: false });
  assert.equal(r.status, 200);
  assert.deepEqual(w.gov.configured, [{ host: "web.archive.org", appetite_per_min: 24 }]);
  assert.ok(w.gov.calls.some((c) => c[0] === "admit" && c[1] === "web.archive.org"), "the CDX query through the governor");
  assert.equal(w.prov.receipts[0].address, addr, "document address is the CDX original");
  assert.equal(w.prov.receipts[0].via, "archive.org");
  assert.equal(w.prov.receipts[0].retrievalLocator, `https://web.archive.org/web/20250101000000id_/${addr}`);
  const chain = r.body.document.provenance_chain;
  assert.equal(chain.length, 2); assert.equal(chain[1].via, "archive.org"); assert.equal(chain[1].who, "Internet Archive Wayback Machine");
  assert.equal(r.body.document.capture.authority, "Internet Archive");
  /* provenance R34 (K59): the archive-sourced capture's receipt is signed */
  assert.deepEqual(w.prov.signed.map((x) => [x.captureSha, x.retrievalLocator]), [[sha("archived bytes"), `https://web.archive.org/web/20250101000000id_/${addr}`]]);
  assert.deepEqual(r.body.receipt_signature, { ok: true, signed: true });
  /* the named failures */
  await eligible(w);
  const thrown = await run(w, (u) => (u.includes("/cdx/") ? new Error("dns") : null), { via: "archive.org", address: addr }, { cls: "admin" });
  assert.equal(thrown.body.reason, "ARCHIVE_UNREACHABLE");
  await eligible(w);
  const refused = await run(w, (u) => (u.includes("/cdx/") ? new Response("no", { status: 503 }) : null), { via: "archive.org", address: addr }, { cls: "admin" });
  assert.deepEqual([refused.body.reason, refused.body.status], ["ARCHIVE_REFUSED", 503]);
  await eligible(w);
  const none = await run(w, (u) => (u.includes("/cdx/") ? CDX([cdxRow("20250101000000", addr, "404")]) : null), { via: "archive.org", address: addr }, { cls: "admin" });
  assert.equal(none.body.reason, "NO_USABLE_CAPTURE"); assert.equal(none.body.considered.length, 1);
  const cool = world({ gov: { refuse: ["web.archive.org"] } }); await eligible(cool);
  const c2 = await run(cool, routes, { via: "archive.org", address: addr }, { cls: "admin" });
  assert.deepEqual([c2.status, c2.body.reason], [429, "HOST_COOLING_OFF"]);
  /* archiveLookup decides and reports the same without capturing */
  const net = network(routes);
  try {
    const before = w.prov.receipts.length;
  await eligible(w);
    const look = await w.c.archiveLookup({ address: addr });
    assert.equal(look.status, 200);
    assert.equal(look.body.retrieval_locator, `https://web.archive.org/web/20250101000000id_/${addr}`);
    assert.equal(look.body.provenance_hop.via, "archive.org");
    assert.equal(w.prov.receipts.length, before, "nothing captured");
    assert.equal((await w.c.archiveLookup({ address: "https://fresh.example/" })).body.reason, "NOT_ELIGIBLE");
    assert.equal((await w.c.archiveLookup({ address: "ftp://x" })).body.reason, "BAD_ADDRESS");
  } finally { net.restore(); }
});

test("R4: the Drive arm refuses hop facts, folders, undetermined kinds and unknown shapes, fetches the composed export, never files the shell, and keeps the link", async () => {
  const w = world();
  const link = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit";
  const exp = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt";
  const row = (code) => [DRIVE_CAPTURE_CHECKS[code].check, DRIVE_CAPTURE_CHECKS[code].translation];
  const cases = [["https://drive.google.com/drive/folders/1AbCdEfGhIjK", "DRIVE_FOLDER_NOT_A_DOCUMENT"],
                 ["https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view", "DRIVE_KIND_UNDETERMINED"],
                 ["https://docs.google.com/weird/path", "DRIVE_SHAPE_UNRECOGNISED"]];
  for (const [loc, code] of cases) {
    const r = await run(w, {}, { locator: loc });
    assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.translation], [422, code, ...row(code)]);
    assert.equal(r.net.seen.length, 0);
  }
  const hop = await run(w, {}, { locator: "https://a.example/x", producer: "me" });
  assert.deepEqual([hop.status, hop.body.reason, hop.body.supplied], [400, "DRIVE_HOP_FACT_SUPPLIED", ["producer"]], "whatever its address");
  const unreach = await run(w, { [exp]: new Response("no", { status: 403 }) }, { locator: link });
  assert.deepEqual([unreach.body.reason, unreach.body.check], ["DRIVE_EXPORT_UNREACHABLE", row("DRIVE_EXPORT_UNREACHABLE")[0]]);
  assert.deepEqual(unreach.net.seen.map((x) => x.url), [exp], "the application page is never fetched in its place");
  let bodyRead = false;
  const shellBody = new ReadableStream({ pull(c) { bodyRead = true; c.enqueue(new TextEncoder().encode("<html>")); c.close(); } }, { highWaterMark: 0 });
  const shell = await run(w, { [exp]: () => new Response(shellBody, { headers: { "content-type": "text/html" } }) }, { locator: link });
  assert.equal(shell.body.reason, "DRIVE_EXPORT_IS_THE_SHELL"); assert.equal(bodyRead, false, "the shell's body is never read");
  const sniffed = await run(w, { [exp]: new Response("<!doctype html><html><body>app</body></html>", { headers: { "content-type": "application/vnd.oasis.opendocument.text" } }) }, { locator: link });
  assert.equal(sniffed.body.reason, "DRIVE_EXPORT_BYTES_ARE_THE_SHELL");
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, 0, "nothing filed for any of them");
  const odt = new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new TextEncoder().encode("mimetypeapplication/vnd.oasis.opendocument.text rest")]);
  const ok = await run(w, { [exp]: new Response(odt, { headers: { "content-type": "application/vnd.oasis.opendocument.text" } }) }, { locator: link });
  assert.equal(ok.status, 200);
  assert.equal(w.prov.receipts.at(-1).address, link, "the Drive link as given");
  assert.equal(w.prov.receipts.at(-1).retrievalLocator, exp);
  const g = ok.body.document.provenance_chain[1];
  assert.equal(g.who, "Google Drive (Google Drive export)"); assert.equal(g.bound, false);
});

function rendererEnv(answer) {
  const calls = [];
  return { calls, RENDERER: { fetch: async (u, init) => { calls.push(JSON.parse(init.body)); return new Response(JSON.stringify(typeof answer === "function" ? answer() : answer)); } } };
}
const renderAnswer = { ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 1234, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: "https://r.example/page", status: 200, requests: [], scripts: [],
  wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } };

test("R5 R6 R41: the render arm refuses before any fetch, admits against the allowance, files a pair, releases what it reserved, and asks the view's locale", async () => {
  const w = world();
  const row = (code) => RENDER_CAPTURE_CHECKS[code].check;
  const r0 = await run(w, {}, { locator: "https://r.example/page", render: "yes" });
  assert.deepEqual([r0.status, r0.body.reason, r0.body.check], [400, "RENDER_FLAG_MALFORMED", row("RENDER_FLAG_MALFORMED")]);
  for (const b of [{ via: "archive.org", address: "https://r.example/page" }, { locator: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit" }, { locator: "https://r.example/page", continue: "cs_x" }]) {
    const r = await run(w, {}, { ...b, render: true }, { cls: "admin" });
    if (b.via) assert.ok(["RENDER_ARM_CONFLICT", "NOT_ELIGIBLE"].includes(r.body.reason));
    else assert.equal(r.body.reason, "RENDER_ARM_CONFLICT");
  }
  const none = await run(w, {}, { locator: "https://r.example/page", render: true });
  assert.deepEqual([none.status, none.body.reason], [501, "RENDER_NO_RENDERER"]);
  const env = rendererEnv(renderAnswer);
  const cool = world({ env, gov: { refuse: ["r.example"] } });
  const c = await run(cool, {}, { locator: "https://r.example/page", render: true });
  assert.deepEqual([c.status, c.body.reason, c.net.seen.length], [429, "RENDER_HOST_COOLING_OFF", 0]);
  const full = world({ env });
  for (let i = 0; i < 10; i++) full.c.renderAdmit({ allowanceMs: 1e12, reserveMs: 1000, cap: 10 });
  const cap = await run(full, {}, { locator: "https://r.example/page", render: true });
  assert.deepEqual([cap.status, cap.body.reason, cap.body.render.state], [429, "RENDER_AT_CAPACITY", "waiting"]);
  const spent = world({ env: { ...env, RENDER_DAILY_ALLOWANCE_MS: "1" } });
  const def = await run(spent, {}, { locator: "https://r.example/page", render: true });
  assert.deepEqual([def.status, def.body.reason, def.body.render.state], [429, "RENDER_DEFERRED", "deferred"]);
  /* not a page: released at no charge */
  const w2 = world({ env });
  const nap = await run(w2, { "https://r.example/doc.pdf": new Response("%PDF-1.4", { headers: { "content-type": "application/pdf" } }) }, { locator: "https://r.example/doc.pdf", render: true });
  assert.equal(nap.body.reason, "RENDER_NOT_A_PAGE");
  const day = w2.rows(`SELECT spent_ms, reserved_ms FROM render_allowance`)[0];
  assert.deepEqual([day.spent_ms, day.reserved_ms], [0, 0]);
  /* failed render: nothing filed */
  const w3 = world({ env: rendererEnv({ ok: false, error: "crashed" }) });
  const fail = await run(w3, { "https://r.example/page": page(HTML()) }, { locator: "https://r.example/page", render: true });
  assert.deepEqual([fail.status, fail.body.reason, fail.body.filed], [502, "RENDER_FAILED", false]);
  assert.equal(w3.prov.receipts.length, 0);
  /* the pair, with the view's locale asked (R41) */
  const w4 = world({ env });
  w4.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  const ok = await run(w4, { "https://r.example/page": page(HTML("<div id=app></div>")) }, { locator: "https://r.example/page", render: true });
  assert.equal(ok.status, 200);
  const d = ok.body.document;
  const shellSha = sha(HTML("<div id=app></div>"));
  assert.equal(d.capture.method, "rendered");
  assert.equal(d.capture.sha256, sha(renderAnswer.html)); assert.notEqual(d.capture.sha256, shellSha);
  assert.deepEqual(d.pair, { primary: "rendered", rendered: { file: d.file, sha256: d.capture.sha256 }, shell: { file: `${d.file}.shell.html`, sha256: shellSha } });
  assert.equal(d.render.of, shellSha); assert.equal(d.shell.sha256, shellSha);
  assert.ok(held(w4, shellSha) && held(w4, d.capture.sha256), "both held under their own digests");
  assert.equal(ok.body.files[`${d.file}.shell.html`], shellSha);
  assert.equal(d.capture.transport, undefined, "the HTTP exchange belongs to the shell");
  assert.ok(d.authority_state, "content authority is renderedAuthority's");
  const rDay = w4.rows(`SELECT spent_ms, reserved_ms FROM render_allowance`)[0];
  assert.deepEqual([rDay.spent_ms, rDay.reserved_ms], [1234, 0], "released with the render's elapsed time");
  const view = (await import("../../../../jurisdictions/index.mjs")).combine(["test-port-ellery"]).view;
  assert.equal(env.calls.at(-1).locale, renderLocaleFor(view), "R41: the locale renderLocaleFor answers for R17's view");
  assert.equal(env.calls.at(-1).timezone, "UTC");
});

test("R7 R36: every outbound fetch goes through the governor under a legible agent; a refusal is HOST_COOLING_OFF 429 with retry_in_ms", async () => {
  const w = world();
  const r = await run(w, { "https://a.example/x": page("bytes", { "content-type": "text/plain", "retry-after": "7" }) }, { locator: "https://a.example/x" });
  assert.equal(r.status, 200);
  assert.deepEqual(w.gov.calls.slice(0, 2), [["admit", "a.example"], ["report", "a.example", 200, 7000]]);
  assert.match(r.net.seen[0].init.headers["user-agent"], /CivicOS/); assert.match(r.net.seen[0].init.headers["user-agent"], /inst/);
  assert.match(r.net.seen[0].init.headers["user-agent"], /acquire/);
  const cool = world({ gov: { refuse: ["a.example"] } });
  const c = await run(cool, {}, { locator: "https://a.example/x" });
  assert.deepEqual([c.status, c.body.reason, c.body.retry_in_ms, c.net.seen.length], [429, "HOST_COOLING_OFF", 5000, 0]);
  assert.equal(cool.c.sourceReachability({ addressNorm: "https://a.example/x" }).governed_refusals, 1, "R8: governed, counted apart");
});

test("R9 R8: hashed as it arrives, stored in parts of 8 MiB; each refusal named; every attempt recorded against the document address", async () => {
  const w = world();
  const ft = await run(w, { "https://a.example/t": new Error("reset") }, { locator: "https://a.example/t" });
  assert.deepEqual([ft.status, ft.body.reason], [502, "FETCH_FAILED"]);
  const sr = await run(w, { "https://a.example/r": new Response("no", { status: 410 }) }, { locator: "https://a.example/r" });
  assert.deepEqual([sr.status, sr.body.reason, sr.body.status], [502, "SOURCE_REFUSED", 410]);
  const em = await run(w, { "https://a.example/e": new Response(new Uint8Array(0)) }, { locator: "https://a.example/e" });
  assert.equal(em.body.reason, "EMPTY");
  const nb = await run(w, { "https://a.example/n": new Response(null) }, { locator: "https://a.example/n" });
  assert.ok(["NO_BODY", "EMPTY"].includes(nb.body.reason));
  assert.equal(w.c.sourceReachability({ addressNorm: "https://a.example/t" }).last_outcome, "fetch_failed");
  assert.equal(w.c.sourceReachability({ addressNorm: "https://a.example/r" }).last_outcome, "source_refused");
  /* multipart: 8 MiB parts, each under its own digest */
  const big = new Uint8Array(8 * 1024 * 1024 + 10).fill(7);
  const mp = await run(w, { "https://a.example/big": () => new Response(big, { headers: { "content-type": "application/octet-stream" } }) }, { locator: "https://a.example/big" });
  assert.equal(mp.status, 200);
  assert.equal(mp.body.document.capture.sha256, sha(big));
  assert.equal(mp.body.parts, 2);
  for (const p of mp.body.document.parts) assert.ok(held(w, p.sha256));
  assert.equal(mp.body.document.parts.reduce((n, p) => n + p.bytes, 0), big.length);
  assert.deepEqual(mp.body.document.parts.map((p) => p.bytes), [8 * 1024 * 1024, 10], "parts of 8 MiB, whatever the chunking");
  assert.ok(w.b.calls.filter((c) => c[0] === "put").every((c) => c[2] && c[2].sha256), "each part stored with its checksum");
  assert.equal(w.c.sourceReachability({ addressNorm: "https://a.example/big" }).last_outcome, "success");
  /* over 256 MiB: TOO_LARGE, the stream cancelled */
  let cancelled = false, sent = 0;
  const huge = new ReadableStream({ pull(c) { if (sent > 320 * 1024 * 1024) { c.close(); return; } sent += 4 * 1024 * 1024; c.enqueue(new Uint8Array(4 * 1024 * 1024)); }, cancel() { cancelled = true; } }, { highWaterMark: 0 });
  const tl = await run(w, { "https://a.example/huge": () => new Response(huge) }, { locator: "https://a.example/huge" });
  assert.deepEqual([tl.status, tl.body.reason, cancelled], [413, "TOO_LARGE", true]);
  /* a single part whose digest differs from the running hash */
  const orig = crypto.subtle.digest.bind(crypto.subtle);
  crypto.subtle.digest = async (alg, data) => { const d = new Uint8Array(await orig(alg, data)); d[0] ^= 1; return d.buffer; };
  try {
    const hd = await run(w, { "https://a.example/h": page("abc", { "content-type": "text/plain" }) }, { locator: "https://a.example/h" });
    assert.deepEqual([hd.status, hd.body.reason], [500, "HASH_DISAGREEMENT"]);
  } finally { crypto.subtle.digest = orig; }
});

test("R10: existed for one part is whether it was held before this call; for several, true only when registered, else null with the stated reason", async () => {
  const w = world();
  const route = { "https://a.example/x": () => page("same bytes", { "content-type": "text/plain" }) };
  assert.equal((await run(w, route, { locator: "https://a.example/x" })).body.existed, false);
  assert.equal((await run(w, route, { locator: "https://a.example/x" })).body.existed, true);
  const big = new Uint8Array(8 * 1024 * 1024 + 1).fill(1);
  const mr = { "https://a.example/big": () => new Response(big) };
  const m1 = await run(w, mr, { locator: "https://a.example/big" });
  assert.equal(m1.body.existed, null); assert.match(m1.body.existed_undetermined, /NOT a finding that the bytes are new/);
  const m2 = await run(w, mr, { locator: "https://a.example/big" });
  assert.equal(m2.body.existed, null, "several parts never answer false, even when every part was held");
  assert.match(m2.body.existed_undetermined, /2 of this fetch's 2 parts were already held/);
  const reg = world({ provOpts: { registered: [sha(big)] } });
  assert.equal((await run(reg, mr, { locator: "https://a.example/big" })).body.existed, true);
  const silent = world({ prov: { recordReceipt() {}, registerHolds() { throw new Error("down"); } } });
  const s = await run(silent, mr, { locator: "https://a.example/big" });
  assert.equal(s.body.existed, null); assert.match(s.body.existed_undetermined, /could not be consulted/);
});

test("R12: one receipt per filed capture under the document address (the resolved address for a direct fetch), via and retrieval locator; a failed write fails nothing", async () => {
  const w = world();
  await run(w, { "https://a.example/x": page("pdf?", { "content-type": "application/pdf" }) }, { locator: "https://a.example/x" });
  assert.equal(w.prov.receipts.length, 1);
  assert.deepEqual([w.prov.receipts[0].address, w.prov.receipts[0].addressNorm, w.prov.receipts[0].via, w.prov.receipts[0].retrievalLocator],
                   ["https://a.example/x", "https://a.example/x", "direct", "https://a.example/x"]);
  assert.match(w.prov.receipts[0].retrieved, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const failing = world({ prov: { recordReceipt() { throw new Error("down"); }, registerHolds: () => ({}) } });
  assert.equal((await run(failing, { "https://a.example/x": page("b", { "content-type": "text/plain" }) }, { locator: "https://a.example/x" })).status, 200);
});

test("R13 R16: transport, the chain, the capture block, the origin and the file", async () => {
  const w = world();
  const r = await run(w, { "https://a.example/dir/report.txt": page("body text", { "content-type": "text/plain; charset=utf-8", "x-a": "1", "etag": "e" }) },
                      { locator: "https://a.example/dir/report.txt", matchedSweep: "SWEEP-1" }, { cls: "member", member: true, sessMember: "m1" });
  const d = r.body.document;
  assert.deepEqual(Object.keys(d.capture.transport).sort(), ["http_headers", "peer_address", "peer_address_unavailable", "redirected", "requested", "resolved", "status"]);
  assert.equal(d.capture.transport.peer_address, null); assert.match(d.capture.transport.peer_address_unavailable, /does not expose/);
  assert.ok(d.capture.transport.http_headers.some(([k, v]) => k === "etag" && v === "e"));
  assert.deepEqual([d.capture.transport.requested, d.capture.transport.status, d.capture.transport.redirected], ["https://a.example/dir/report.txt", 200, false]);
  const hop = d.provenance_chain[0];
  assert.equal(hop.who, "instance inst (CivicOS/9.9.9)");
  assert.equal(hop.asserts, `these bytes were served for https://a.example/dir/report.txt at ${d.retrieved}`);
  assert.deepEqual([hop.bound, hop.via], [false, "direct"]);
  assert.deepEqual([d.capture.method, d.capture.actor_class, d.capture.encoding, d.capture.bytes, d.capture.content_type],
                   ["bio-plane acquire, https fetch, hashed at receipt", "member", "binary", 9, "text/plain"]);
  assert.equal(d.capture.sha256, sha("body text"));
  assert.deepEqual(d.origin, { kind: "sweep", matched_sweep: "SWEEP-1", deeming_actor: "m1" });
  assert.equal(d.file, "snapshots/report.txt");
  assert.match(d.retrieved, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const probe = await run(w, { "https://a.example/y": page("y", { "content-type": "text/plain" }) }, { locator: "https://a.example/y", file: "named/ file" }, { cls: "probe", member: false });
  assert.equal(probe.body.document.capture.actor_class, "session");
  assert.equal(probe.body.document.file, "snapshots/named--file");
  assert.deepEqual(probe.body.document.origin, { kind: "named_request" });
  const daemonArch = await run(w, { "https://a.example/z": page("z", { "content-type": "text/plain" }) }, { locator: "https://a.example/z" }, { cls: "admin", member: false });
  assert.equal(daemonArch.body.document.capture.actor_class, "daemon");
});

test("R14: an asserted authority is determined with a dated basis; none is undetermined and enqueues one event per digest; a failed enqueue fails nothing", async () => {
  const w = world();
  const route = { "https://a.example/x": () => page("x", { "content-type": "text/plain" }) };
  const det = await run(w, route, { locator: "https://a.example/x", authority: " City Clerk " });
  assert.deepEqual([det.body.document.authority, det.body.document.authority_state], ["City Clerk", "determined"]);
  assert.match(det.body.document.authority_basis, /asserted by the capturing member at intake, \d{4}-/);
  assert.equal(w.c.taskEventCount(), 0);
  const un = await run(w, route, { locator: "https://a.example/x" });
  assert.equal(un.body.document.authority_state, "undetermined"); assert.match(un.body.document.authority_basis, /no assertion was supplied/);
  await run(w, route, { locator: "https://a.example/x" });
  assert.equal(w.c.taskEventCount(), 1, "one per capture digest");
  assert.equal(w.c.taskEvents({ limit: 5 })[0].subject, "https://a.example/x");
  const link = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit";
  const odt = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]);
  await run(w, { "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt": new Response(odt) }, { locator: link });
  assert.equal(w.c.taskEvents({ limit: 5 }).find((e) => e.captureSha === sha(odt)).subject, link, "the Drive link for a Drive export");
  const failing = world();
  failing.c.taskEnqueue = async () => { throw new Error("queue down"); };
  assert.equal((await run(failing, route, { locator: "https://a.example/x" })).status, 200);
});

test("R17: the profile is docprofile's over what was fetched, under the combined view of the active profiles, with the format and the digests", async () => {
  const w = world();
  w.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  const r = await run(w, { "https://a.example/p": page(HTML("<p>minutes</p>")) }, { locator: "https://a.example/p" });
  const p = r.body.document.profile;
  for (const k of ["handler", "handler_label", "handler_version", "confidence", "signals", "content_type", "content_type_label",
                   "content_type_version", "content_type_confidence", "content_type_signals", "contract", "normalised", "boundary", "format", "digests"])
    assert.ok(k in p, k);
  assert.deepEqual(p.jurisdiction_view, ["test-port-ellery"], "the view the content type was judged under");
  assert.equal(p.format.format, "html"); assert.equal(p.profiled_from_text, true); assert.equal(p.source_content_type, "text/html");
  assert.equal(typeof p.digests.determined, "boolean"); assert.ok(p.digests.basis);
  const pdf = await run(w, { "https://a.example/d.pdf": new Response("%PDF-1.7 rest", { headers: { "content-type": "application/octet-stream" } }) }, { locator: "https://a.example/d.pdf" });
  assert.equal(pdf.body.document.profile.format.format, "pdf", "detected from the bytes read back, not the declared type");
  assert.equal(pdf.body.document.profile.profiled_from_text, false);
  const none = world();
  const n = await run(none, { "https://a.example/p": page(HTML()) }, { locator: "https://a.example/p" });
  assert.equal(n.body.document.profile.jurisdiction_view, null, "no setting: no view is claimed");
});

test("R18: the grade is the ceiling for a direct fetch and the archive letter for the archive arm, each read from its one definition", async () => {
  const w = world();
  const d = await run(w, { "https://a.example/x": page("x", { "content-type": "text/plain" }) }, { locator: "https://a.example/x" });
  assert.equal(d.body.document.capture.grade, EARNED_CAPTURE_CEILING);
  await eligible(w);
  const addr = "https://gone.example/doc";
  const a = await run(w, (u) => u.includes("/cdx/") ? CDX([cdxRow("20250101000000")]) : u.includes("/web/") ? page("a", { "content-type": "text/plain" }) : null,
                      { via: "archive.org", address: addr }, { cls: "admin" });
  assert.equal(a.body.document.capture.grade, ARCHIVE_CAPTURE_GRADE, "provenance's one definition");
  assert.notEqual(ARCHIVE_CAPTURE_GRADE, EARNED_CAPTURE_CEILING);
});

const SITE = (links) => HTML(`<link rel="stylesheet" href="/s.css"><img src="/i.png"><nav><a href="/about">About</a></nav>${links || ""}`);
test("R19 R55: the walk of a single HTML page's supporting files, its bookkeeping, the governor's cool-off, the skips, and the compute measurement handed to listeners", async () => {
  const w = world();
  const heard = [];
  w.c.on("compute", "instance-setup", (m) => { heard.push(m); });
  w.c.on("compute", "broken", () => { throw new Error("x"); });
  const routes = { "https://s.example/p": () => page(SITE('<a href="https://t.example/x">x</a>')), "https://s.example/s.css": () => new Response("body{}", { headers: { "content-type": "text/css" } }),
                   "https://s.example/i.png": () => new Response(new Uint8Array([137, 80, 78, 71]), { headers: { "content-type": "image/png" } }) };
  const r = await run(w, routes, { locator: "https://s.example/p", subresources: true });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.subresources));
  const snap = r.body.snapshot;
  for (const k of ["manifest_sha256", "render_sha256", "discovered", "attempted", "complete", "outstanding", "platform", "reuse", "part_fetch_spread", "compute"]) assert.ok(k in snap, k);
  assert.equal(snap.compute_recorded, undefined, "R55: the store's reply is not in the answer");
  assert.equal(heard.length, 1);
  assert.equal(heard[0].metric, "capture_work_bytes"); assert.equal(heard[0].value, snap.compute.work_bytes);
  assert.match(heard[0].detail, /compute calls over \d+ bytes; \d+ fetched, \d+ discovered/);
  assert.deepEqual(Object.keys(r.body.files).sort(), ["data/snapshot-manifest.json", "snapshots/p.render.html"]);
  assert.ok(held(w, snap.manifest_sha256) && held(w, snap.render_sha256));
  assert.ok(w.c.linksTo({ address_norm: "https://t.example/x" }).count === 1, "links recorded");
  assert.ok(w.c.siteAssets({ host: "s.example" }).count >= 1, "site observations recorded");
  assert.ok(w.rows(`SELECT count(*) n FROM capture_limits`)[0].n >= 0);
  assert.ok(w.gov.calls.some((c) => c[0] === "report" && c[1] === "s.example"), "every subresource outcome reported");
  /* a host cooling off stops the rest */
  const cw = world({ gov: { held: ["s.example"] } });
  const c = await run(cw, routes, { locator: "https://s.example/p", subresources: true });
  assert.ok(c.body.subresources.some((s) => s.reason === "HOST_COOLING_OFF" || s.status === 0));
  /* the skips: the capture is unaffected */
  const nh = await run(w, { "https://s.example/t.txt": page("t", { "content-type": "text/plain" }) }, { locator: "https://s.example/t.txt", subresources: true });
  assert.deepEqual([nh.status, nh.body.subresources_skipped.reason], [200, "NOT_HTML"]);
  const big = "x".repeat(8 * 1024 * 1024 + 1);
  const tl = await run(w, { "https://s.example/big": page(big) }, { locator: "https://s.example/big", subresources: true });
  assert.equal(tl.body.subresources_skipped.reason, "TOO_LARGE_TO_PARSE");
  const gone = world();
  const origGet = gone.b.get; gone.b.get = async (k) => (k.includes("/captures/") ? null : origGet.call(gone.b, k));
  const pu = await run(gone, routes, { locator: "https://s.example/p", subresources: true });
  assert.equal(pu.body.subresources_skipped.reason, "PRIMARY_UNREADABLE");
  const ns = await run(w, routes, { locator: "https://s.example/p", subresources: true, continue: "cs_none" });
  assert.deepEqual([ns.status, ns.body.subresources_skipped.reason], [200, "NO_SUCH_SESSION"]);
  /* a failed bookkeeping write never fails the capture */
  const bk = world();
  bk.c.recordLinks = () => { throw new Error("x"); }; bk.c.recordSiteAssets = () => { throw new Error("x"); }; bk.c.recordCaptureLimit = () => { throw new Error("x"); };
  assert.equal((await run(bk, routes, { locator: "https://s.example/p", subresources: true })).status, 200);
});

test("R11 R22: a continuation resumes the session's outstanding files against the session's own primary and never fetches the primary again", async () => {
  const w = world();
  w.c.recordCaptureLimit({ runtime: "subrequests", observed: 7 });
  const many = Array.from({ length: 6 }, (_, i) => `<link rel="stylesheet" href="/c${i}.css">`).join("");
  const routes = (u) => u === "https://s.example/p" ? page(HTML(many)) : u.endsWith(".css") ? new Response("a{}", { headers: { "content-type": "text/css" } }) : null;
  const first = await run(w, routes, { locator: "https://s.example/p", subresources: true });
  const cont = first.body.snapshot.continuation;
  assert.ok(cont && cont.session, "the walk was cut short by the observed ceiling and parked");
  const primary = first.body.document.capture.sha256;
  const second = await run(w, routes, { locator: "https://s.example/p", subresources: true, continue: cont.session });
  assert.equal(second.status, 200);
  assert.ok(!second.net.seen.some((x) => x.url === "https://s.example/p"), "the primary is not fetched again");
  assert.equal(second.body.continued.primary.sha256, primary, "against the session's own primary");
  assert.equal(second.body.document, undefined, "a continuation files no new document");
});

test("R20: every capture requests a timestamp and, wherever the source permits, a co-archive, recording each attempt; a failure is an attempt", async () => {
  const w = world();
  const d = await run(w, { "https://a.example/x": page("x", { "content-type": "text/plain" }) }, { locator: "https://a.example/x" });
  assert.deepEqual(w.prov.attests[0], { sha256: sha("x"), archive: true, locator: "https://a.example/x" });
  assert.deepEqual(d.body.document.attestation_attempts.map((a) => [a.service, a.attempted, a.ok, a.at]),
                   [["tsa.test", true, true, "2026-09-27T00:00:00Z"], ["archive.test (anonymous)", true, false, "2026-09-27T00:00:00Z"]],
                   "each attempt in the register's shape (C-18.1): {service, attempted, ok}, the instant kept");
  await eligible(w);
  await run(w, (u) => u.includes("/cdx/") ? CDX([cdxRow("20250101000000")]) : u.includes("/web/") ? page("a", { "content-type": "text/plain" }) : null,
            { via: "archive.org", address: "https://gone.example/doc" }, { cls: "admin" });
  assert.equal(w.prov.attests.at(-1).archive, false, "the archive arm's locator is itself an archive replay");
  const failing = world({ provOpts: {} });
  failing.prov.attest = async () => { throw new Error("tsa down"); };
  const f = await run(failing, { "https://a.example/x": page("x", { "content-type": "text/plain" }) }, { locator: "https://a.example/x" });
  assert.equal(f.status, 200);
  assert.deepEqual([f.body.document.attestation_attempts[0].attempted, f.body.document.attestation_attempts[0].ok,
                    f.body.document.attestation_attempts[0].note], [false, false, "tsa down"]);
  /* provenance's own attest, over a network where no authority answers: every attempt recorded, the capture filed,
     and each authority asked through the governor under this instance's agent (R36) */
  const real = world({ prov: { recordReceipt() {}, registerHolds: () => ({ registered: false, acquired: true }) } });
  const u = await run(real, (url) => url === "https://a.example/x" ? page("x", { "content-type": "text/plain" }) : new Response("no", { status: 503 }),
                      { locator: "https://a.example/x" });
  assert.equal(u.status, 200);
  assert.ok(u.body.document.attestation_attempts.length >= 1);
  assert.ok(u.body.document.attestation_attempts.every((a) => a.service && typeof a.attempted === "boolean" && typeof a.ok === "boolean"),
            "provenance's own attempts recorded in the register's shape");
  const others = u.net.seen.filter((x) => x.url !== "https://a.example/x");
  assert.ok(others.length >= 1, "the authorities were asked");
  for (const o of others) {
    assert.match(o.init.headers["user-agent"], /CivicOS/);
    assert.ok(real.gov.calls.some((c) => c[0] === "admit" && c[1] === new URL(o.url).host), `${o.url} through the governor`);
  }
});

test("R33 R34 R42: acquire writes no bundle or register row, keeps the raw bytes under their own digest beside separate derived artifacts, and answers no reading", async () => {
  const w = world();
  const before = w.rows(`SELECT (SELECT count(*) FROM bundles) b, (SELECT count(*) FROM register) r, (SELECT count(*) FROM files) f`)[0];
  const routes = { "https://s.example/p": () => page(SITE()), "https://s.example/s.css": () => new Response("x{}", { headers: { "content-type": "text/css" } }) };
  const r = await run(w, routes, { locator: "https://s.example/p", subresources: true });
  const after = w.rows(`SELECT (SELECT count(*) FROM bundles) b, (SELECT count(*) FROM register) r, (SELECT count(*) FROM files) f`)[0];
  assert.deepEqual({ ...after }, { ...before });
  const d = r.body.document;
  assert.ok(held(w, d.capture.sha256));
  const bytes = w.b.held.get(`bio/captures/${d.capture.sha256}`);
  assert.equal(sha(bytes), d.capture.sha256, "the raw bytes as served");
  assert.notEqual(r.body.snapshot.render_sha256, d.capture.sha256, "the companion is separate");
  assert.ok(d.renditions && d.renditions.length === 2);
  assert.equal("reading" in d, false); assert.equal("text_units" in d, false); assert.equal("reading" in r.body, false);
});

test("R37 R38: each refusal carries its catalogue row, and nothing in the answers names a place", async () => {
  const w = world();
  const answers = [];
  for (const b of [{ locator: "https://drive.google.com/drive/folders/1AbCdEfGhIjK" }, { locator: "https://r.example/p", render: "x" },
                   { via: "capture-request", request: "r" }, { locator: "https://a.example/x" }])
    answers.push((await run(w, { "https://a.example/x": page("x", { "content-type": "text/plain" }) }, b)).body);
  for (const a of answers.slice(0, 3)) assert.ok(a.check && a.translation, `${a.reason} carries its row`);
  assert.ok(!/oakland|alameda/i.test(JSON.stringify(answers)));
});
