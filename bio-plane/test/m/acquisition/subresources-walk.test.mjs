/* acquisition: the supporting-files walk (`subresources: true`) at the module's interface, `acquire(store, body, opts)`
   over a scripted network, an evidence bucket, and the store handed in (fixture.mjs). Converts acquisition's share of
   two legacy suites: `test/cap14-reused-from.test.mjs` (acquire → site assets → reuse: a reused part names the capture
   whose fetch served it, or is undetermined, never inferred) and `test/subresources.test.mjs` (op=acquire with
   subresources, and the transport headers). What those suites asserted of subresources' own library, of capture's store
   routes, of connections, instance-setup or promotion is theirs and not carried here. Each test names the requirement
   ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, HTML, page, text } from "./fixture.mjs";
import { normalizeAddress, normalizeCitation } from "../../../src/subresources.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const O = "https://w.example";
const CSS_MAIN = `@import url("deep.css");\nbody { background: url(img/bg.png) repeat; }\n.evil { background: url("javascript:alert(1)"); }\n`;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 1, 2, 3, 4]);
const SCRIPT = "window.tracked=1;";
const PAGE = `<!doctype html>
<html><head><title>Transfers</title>
<link rel="stylesheet" href="/css/main.css">
<link rel="icon" href="favicon.ico">
<link rel="stylesheet" href="http://w.example/css/insecure.css">
<link rel="stylesheet" href="https://localhost/css/internal.css">
<link rel="stylesheet" href="https://198.51.100.7/css/internal.css">
<script src="/js/analytics.js"></script>
<script>window.tracked = true;</script>
</head>
<body onload="steal()">
<img src="/img/chart.png" alt="chart">
<img src="/img/gone.png">
<a href="/next-page.html">next</a>
<a href="#findings">jump</a>
<a href="/report.pdf#page=12">page 12</a>
<a href="/report.pdf#page=40">page 40</a>
<a href="javascript:void(0)">dead</a>
<iframe src="https://w.example/frame.html"></iframe>
</body></html>`;
const BODIES = new Map([
  ["/page.html", [PAGE, "text/html; charset=utf-8"]], ["/css/main.css", [CSS_MAIN, "text/css"]], ["/css/deep.css", [".deep{}", "text/css"]],
  ["/js/analytics.js", [SCRIPT, "application/javascript"]], ["/favicon.ico", [PNG, "image/x-icon"]],
  ["/css/img/bg.png", [PNG, "image/png"]], ["/img/chart.png", [PNG, "image/png"]],
]);
/* The scripted source: one host, every body above, 404 for the rest; `extra` overrides a path. */
const source = (extra = {}) => (u) => {
  const x = new URL(u);
  if (x.hostname !== "w.example") return new Response("off-limits", { status: 500 });
  const b = extra[x.pathname] || BODIES.get(x.pathname);
  if (b instanceof Error) throw b;
  return b ? new Response(b[0], { headers: { "content-type": b[1] } }) : new Response("nope", { status: 404 });
};
const LOC = `${O}/page.html`;
const read = (w, digest) => Buffer.from(w.bytesOf(digest)).toString("utf8");

test("R19 R26: with subresources the answer carries the walk, the snapshot, the files and the renditions; without it the answer is the plain capture's, and the primary is the same bytes", async () => {
  const w = world();
  const plain = await run(w, source(), { locator: LOC });
  assert.equal(plain.status, 200);
  assert.equal("subresources" in plain.body, false, "without the flag the contract is what it was");
  for (const k of ["snapshot", "files"]) assert.equal(k in plain.body, false, k);
  assert.equal("renditions" in plain.body.document, false, "and no renditions are claimed");
  assert.equal(plain.net.seen.length, 1, "nothing but the page is fetched");
  const r = await run(w, source(), { locator: LOC, subresources: true });
  assert.equal(r.status, 200); assert.equal(r.body.ok, true);
  const d = r.body.document;
  assert.equal(d.capture.sha256, plain.body.document.capture.sha256, "the primary is unchanged by the walk");
  assert.equal(d.capture.sha256, sha(PAGE));
  assert.equal(d.capture.grade, EARNED_CAPTURE_CEILING, "the grade is still the direct fetch's");
  assert.ok(Array.isArray(r.body.subresources));
  assert.ok(r.body.subresources.some((s) => /main\.css$/.test(s.url) && s.ok), "the stylesheet came back");
  const snap = r.body.snapshot;
  assert.deepEqual([snap.render_file, snap.manifest_file], ["snapshots/page.html.render.html", "data/snapshot-manifest.json"]);
  for (const k of ["manifest_sha256", "render_sha256", "discovered", "attempted", "truncated", "fetched", "failed", "refused",
                   "scripts_held_unreferenced", "complete", "outstanding", "platform", "reuse", "part_fetch_spread", "compute"]) assert.ok(k in snap, k);
  assert.equal(snap.complete, true); assert.equal(snap.continuation, undefined, "complete: nothing parked");
  assert.deepEqual(r.body.files, { "snapshots/page.html.render.html": snap.render_sha256, "data/snapshot-manifest.json": snap.manifest_sha256 });
  assert.deepEqual(d.renditions.map((x) => x.kind), ["render_companion", "snapshot_manifest"], "named as renditions, not acquisitions");
  assert.ok(d.renditions.every((x) => x.from_file === "snapshots/page.html"), "each names what it was made from");
  assert.ok(d.renditions.every((x) => x.transform && x.reason), "and says what was done and why, in words");
  /* R25: the walk writes no bundle or register row */
  const count = w.rows(`SELECT (SELECT count(*) FROM bundles) b, (SELECT count(*) FROM files) f, (SELECT count(*) FROM history) h`)[0];
  assert.deepEqual({ ...count }, { b: 0, f: 0, h: 0 }, "intake writes nothing, subresources or not");
});

test("R19 R26: every part, the manifest and the companion are held under their own digests; the raw bytes are never rewritten; the companion is derived, inert and names its primary; the script is held and never referenced", async () => {
  const w = world();
  const r = await run(w, source(), { locator: LOC, subresources: true });
  const snap = r.body.snapshot, d = r.body.document;
  const css = r.body.subresources.find((s) => /main\.css$/.test(s.url));
  assert.equal(css.sha256, sha(CSS_MAIN), "the hash the manifest tells the viewer to expect");
  assert.equal(read(w, css.sha256), CSS_MAIN, "byte-identical to what the source served, its own url() unrewritten");
  assert.equal(read(w, d.capture.sha256), PAGE, "the primary is still the bytes the source served");
  assert.notEqual(snap.render_sha256, d.capture.sha256, "the companion is not the primary");
  assert.equal(sha(w.bytesOf(snap.render_sha256)), snap.render_sha256, "the companion hashes to what the record says");
  assert.equal(sha(w.bytesOf(snap.manifest_sha256)), snap.manifest_sha256);
  const man = JSON.parse(read(w, snap.manifest_sha256));
  assert.equal(typeof man.version, "number", "the manifest reads back and parses");
  assert.deepEqual([man.derived, man.of_sha256, man.render_sha256], [true, d.capture.sha256, snap.render_sha256]);
  assert.deepEqual(man.part_fetch_spread, snap.part_fetch_spread, "the stored manifest is the one the answer summarises");
  const c = read(w, snap.render_sha256);
  assert.match(c, /DERIVED ARTIFACT, not evidence/);
  assert.ok(c.includes(d.capture.sha256), "it names the capture it was derived from");
  assert.equal(/<script|<iframe|onload=/i.test(c), false, "nothing executable survives into it");
  const js = r.body.subresources.find((s) => /analytics\.js$/.test(s.url));
  assert.deepEqual([js.ok, js.sha256, read(w, sha(SCRIPT))], [true, sha(SCRIPT), SCRIPT], "the script's bytes ARE held");
  assert.equal(c.includes(sha(SCRIPT)), false, "and the companion references them nowhere");
  assert.equal(snap.scripts_held_unreferenced, 1);
  /* a failure is recorded, because a 404 is part of what was served */
  const gone = r.body.subresources.find((s) => /gone\.png$/.test(s.url));
  assert.deepEqual([gone.ok, gone.status, gone.reason], [false, 404, "SOURCE_REFUSED"]);
});

test("R9 R19 R24 R28: a refused reference never leaves; every fetch of the walk is through the governor under the legible agent, which impersonates no browser", async () => {
  const w = world();
  const r = await run(w, source(), { locator: LOC, subresources: true });
  assert.equal(r.status, 200);
  assert.ok(!r.net.seen.some((x) => /insecure|localhost|198\.51\.100/.test(x.url)), "nothing refused was ever fetched");
  for (const reason of ["REFUSED_LOCATOR"]) assert.ok(r.body.subresources.some((s) => s.reason === reason), "recorded as refused, not dropped");
  const pageUa = r.net.seen.find((x) => x.url === LOC).init.headers["user-agent"];
  assert.match(pageUa, /^Civicsmith\/9\.9\.9 \(\+https:\/\/\S+; instance inst; acquire\)$/, "product, version, contact, instance and purpose");
  assert.equal(/Mozilla|Chrome|Safari|Gecko/.test(pageUa), false, "it does not impersonate a browser");
  const walk = r.net.seen.filter((x) => x.url !== LOC && new URL(x.url).hostname === "w.example" && /\/(css|img|js|favicon)/.test(x.url));
  assert.ok(walk.length >= 4);
  for (const x of walk) {
    assert.equal(x.init.headers["user-agent"], pageUa, x.url);
    assert.ok(w.gov.calls.some((g) => g[0] === "isHeld" && g[1] === "w.example"), "the governor asked of the walk's host");
  }
  assert.ok(w.gov.calls.some((g) => g[0] === "report" && g[1] === "w.example" && g[2] === 404), "every outcome reported, a refusal too");
});

/* A reusable stylesheet as the store's site assets report it (capture R24): its digest, the documents that carried it,
   when and by which capture it was last fetched. */
const known = (css, extra = {}) => ({ sha256: sha(css), bytes: css.length, content_type: "text/css", kind: "stylesheet",
  documents: 2, last_fetched: new Date().toISOString(), stable_since: "2026-01-01T00:00:00Z", changes: 0, ...extra });
const S_CSS = ".s { color: red }";
const S = normalizeAddress(`${O}/s.css`);
const reusePage = (body = "") => `<html><head><link rel="stylesheet" href="/s.css"></head><body><p>x</p>${body}</body></html>`;
const hold = (w, bytes) => w.b.held.set(`bio/captures/${sha(bytes)}`, new Uint8Array(Buffer.from(bytes)));

test("R19: a stylesheet the store reports seen on two documents within the window is reused, never fetched; reused_from is the store's last_fetched_by, the detail names it, and the observation reaches recordSiteAssets", async () => {
  const w = world();
  const P2 = "b2".repeat(32);
  hold(w, S_CSS);
  w.store.state.assets.set("w.example", [[S, known(S_CSS, { last_fetched_by: P2 })]]);
  const r = await run(w, source({ "/p3.html": [reusePage(), "text/html"], "/s.css": [S_CSS, "text/css"] }), { locator: `${O}/p3.html`, subresources: true });
  assert.equal(r.status, 200);
  const P3 = r.body.document.capture.sha256;
  const part = r.body.subresources.find((s) => s.url === `${O}/s.css`);
  assert.equal(r.net.seen.some((x) => x.url === `${O}/s.css`), false, "no request made for it");
  assert.deepEqual([part.ok, part.sha256, part.fetched_this_capture], [true, sha(S_CSS), false]);
  assert.deepEqual([part.reused_from, part.reused_from === P3], [P2, false], "the capture whose FETCH served it, never the reusing capture");
  assert.ok(part.detail.includes(`by capture ${P2}`), "the detail sentence names that capture");
  assert.equal(r.body.snapshot.reuse.reused, 1);
  assert.match(r.body.snapshot.reuse.note, /ratified as evidence must re-fetch/);
  const rec = w.store.state.siteRecords;
  assert.deepEqual([rec.length, rec[0].host, rec[0].primarySha], [1, "w.example", P3]);
  const obs = rec[0].observations.find((o) => o.address_norm === S);
  assert.deepEqual([obs.reused, obs.reused_from, obs.sha256], [true, P2, sha(S_CSS)], "handed on with reused and reused_from");
});

test("R19: a reuse whose record names no fetcher, served the same second, reads undetermined (null), never inferred from the timestamp", async () => {
  const w = world();
  hold(w, S_CSS);
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  w.store.state.assets.set("w.example", [[S, known(S_CSS, { last_fetched: now })]]);
  const r = await run(w, source({ "/p.html": [reusePage(), "text/html"] }), { locator: `${O}/p.html`, subresources: true });
  const part = r.body.subresources.find((s) => s.url === `${O}/s.css`);
  assert.equal(part.fetched_this_capture, false);
  assert.equal(part.reused_from, null, "no source named: undetermined");
  assert.match(part.detail, /undetermined/); assert.equal(/by capture [0-9a-f]{64}/.test(part.detail), false);
  assert.equal(part.reused_from_fetched_at, now);
  assert.equal(w.store.state.siteRecords[0].observations.find((o) => o.address_norm === S).reused_from, null, "and handed on as null");
  /* a reused_from that the store reports tracks the store at walk time: a later fetcher is named by a later reuse */
  const P4 = "d4".repeat(32);
  w.store.state.assets.set("w.example", [[S, known(S_CSS, { last_fetched_by: P4 })]]);
  const later = await run(w, source({ "/p5.html": [reusePage("<i>5</i>"), "text/html"] }), { locator: `${O}/p5.html`, subresources: true });
  assert.equal(later.body.subresources.find((s) => s.url === `${O}/s.css`).reused_from, P4);
});

test("R19: only furniture the store reports as shared and fresh is reused; the same address as an image, one document or a stale fetch is fetched and handed on as fetched", async () => {
  const routes = (pg) => source({ "/p.html": [pg, "text/html"], "/s.css": [S_CSS, "text/css"] });
  for (const [label, k, pg] of [["an image, which is evidence", known(S_CSS, { last_fetched_by: "a".repeat(64) }), `<html><body><img src="/s.css"></body></html>`],
                                ["one document", known(S_CSS, { documents: 1 }), reusePage()],
                                ["seen served too long ago", known(S_CSS, { last_fetched: "2026-01-01T00:00:00Z" }), reusePage()]]) {
    const w = world();
    w.store.state.assets.set("w.example", [[S, k]]);
    const r = await run(w, routes(pg), { locator: `${O}/p.html`, subresources: true });
    const part = r.body.subresources.find((s) => s.url === `${O}/s.css`);
    assert.equal(r.net.seen.filter((x) => x.url === `${O}/s.css`).length, 1, label);
    assert.deepEqual([part.ok, part.fetched_this_capture, part.reused_from], [true, true, undefined], label);
    const obs = w.store.state.siteRecords[0].observations.find((o) => o.address_norm === S);
    assert.deepEqual([obs.reused, obs.sha256], [false, sha(S_CSS)], label);
  }
  /* the store's site assets are asked for this page's host only, and an unreadable answer reuses nothing */
  const w = world();
  const asked = [];
  w.store.siteAssets = (a) => { asked.push(a.host); throw new Error("down"); };
  const r = await run(w, routes(reusePage()), { locator: `${O}/p.html`, subresources: true });
  assert.deepEqual([r.status, asked], [200, ["w.example"]]);
  assert.equal(r.body.subresources.find((s) => s.url === `${O}/s.css`).fetched_this_capture, true);
});

const imgs = (n, pre = "n") => `<html><body>${Array.from({ length: n }, (_, i) => `<img src="/img/${pre}${i}.png">`).join("")}</body></html>`;
const imgSource = (html, onImg) => (u) => new URL(u).pathname === "/p.html" ? page(html)
  : /\/img\//.test(u) ? (onImg ? onImg(u) : new Response(PNG, { headers: { "content-type": "image/png" } })) : null;

test("R19: the platform ceiling is the store's observed one unless a probe is due; the runtime's refusal is recorded with recordCaptureLimit, and a run never refused records null", async () => {
  const spy = (w) => { const calls = []; const orig = w.store.recordCaptureLimit.bind(w.store);
    w.store.recordCaptureLimit = (a) => { calls.push(a); return orig(a); }; return calls; };
  /* a clean run learned nothing: null is recorded, never a guess */
  const clean = world(); const cc = spy(clean);
  const c = await run(clean, imgSource(imgs(1)), { locator: `${O}/p.html`, subresources: true });
  assert.deepEqual(cc, [{ runtime: "subrequests", observed: null }]);
  assert.equal(c.body.snapshot.platform.observed_ceiling, null);
  assert.deepEqual(c.body.snapshot.limit_recorded, { runtime: "subrequests", observed: null, recorded: false });
  /* the runtime says no: where it did is recorded, and the rest is outstanding, not failed */
  const hit = world(); const hc = spy(hit);
  let n = 0;
  const h = await run(hit, imgSource(imgs(30), () => (++n > 8 ? new Error("Too many subrequests by single Worker invocation.")
    : new Response(PNG, { headers: { "content-type": "image/png" } }))), { locator: `${O}/p.html`, subresources: true });
  const seen = h.body.snapshot.platform.observed_ceiling;
  assert.ok(Number.isInteger(seen) && seen > 0);
  assert.deepEqual(hc, [{ runtime: "subrequests", observed: seen }]);
  assert.equal(hit.store.state.limits.get("subrequests"), seen);
  assert.deepEqual([h.body.snapshot.complete, h.body.snapshot.failed], [false, 0], "no reference is recorded as the source failing");
  assert.ok(h.body.snapshot.continuation.session, "parked");
  /* given the number back, the next run stops on its own terms and the runtime is never made to refuse */
  let n2 = 0;
  const k = await run(hit, imgSource(imgs(30, "k"), () => (++n2 > 8 ? new Error("Too many subrequests by single Worker invocation.")
    : new Response(PNG, { headers: { "content-type": "image/png" } }))), { locator: `${O}/p.html`, subresources: true });
  assert.equal(k.body.snapshot.platform.limited, false);
  assert.ok(k.body.snapshot.fetched < seen && k.body.snapshot.fetched > 0, "a margin short of the observed ceiling");
  assert.equal(k.body.snapshot.complete, false);
  /* a probe due: the remembered ceiling is not used, so the walk runs to its end */
  const probe = world();
  probe.store.captureLimit = () => ({ runtime: "subrequests", observed: 3, probeDue: true });
  const p = await run(probe, imgSource(imgs(12)), { locator: `${O}/p.html`, subresources: true });
  assert.deepEqual([p.body.snapshot.complete, p.body.snapshot.fetched], [true, 12]);
  const known3 = world(); known3.store.recordCaptureLimit({ runtime: "subrequests", observed: 10 });
  const kk = await run(known3, imgSource(imgs(12)), { locator: `${O}/p.html`, subresources: true });
  assert.equal(kk.body.snapshot.complete, false, "negative control: the same ceiling, no probe due, is used");
});

test("R12 R19: a page that needs a session completes across ticks through the act: parked with serialisable state, continued against the same primary, nothing fetched twice, dropped when done", async () => {
  const w = world();
  w.store.recordCaptureLimit({ runtime: "subrequests", observed: 18 });
  const big = `<html><head><link rel=stylesheet href=/css/main.css></head><body>${Array.from({ length: 40 }, (_, i) => `<img src="/img/b${i}.png">`).join("")}`
    + `${Array.from({ length: 10 }, (_, i) => `<a href="/page${i}.html">p${i}</a>`).join("")}</body></html>`;
  const extra = { "/big.html": [big, "text/html"] };
  for (let i = 0; i < 40; i++) extra[`/img/b${i}.png`] = [PNG, "image/png"];
  const loc = `${O}/big.html`;
  const fetched = [];
  const routes = (u) => { fetched.push(u); return source(extra)(u); };
  let res = await run(w, routes, { locator: loc, subresources: true });
  assert.equal(res.body.ok, true, "the act survives a page that needs a session");
  assert.equal(res.body.snapshot.complete, false);
  const cont = res.body.snapshot.continuation;
  assert.ok(cont.session); assert.match(cont.how, /call op=acquire again with/, "saying how");
  assert.equal(cont.outstanding, res.body.snapshot.outstanding);
  const saved = w.store.state.sessionSaves[0];
  assert.deepEqual([saved.session, saved.locator, saved.primarySha, saved.primaryFile, saved.base],
                   [cont.session, loc, sha(big), "snapshots/big.html", loc]);
  assert.equal(typeof JSON.parse(JSON.stringify(saved.state)), "object", "the state crosses a tick as JSON");
  assert.equal(JSON.stringify(saved.state).includes("<html>"), false, "and carries no copy of the primary");
  const first = res.body.document.capture.sha256;
  let ticks = 1, session = cont.session;
  while (session && ticks < 25) {
    res = await run(w, routes, { locator: loc, subresources: true, continue: session });
    if (!res.body.ok) break;
    ticks++;
    session = (res.body.snapshot.continuation || {}).session || null;
  }
  assert.equal(res.body.snapshot.complete, true, "it completes across ticks");
  assert.ok(ticks > 1);
  assert.equal(res.body.continued.primary.sha256, first, "the same primary throughout");
  assert.equal("document" in res.body, false, "a continuation files no document of its own");
  assert.equal(fetched.filter((u) => u === loc).length, 1, "the page was fetched once, on the first tick");
  assert.deepEqual(fetched.filter((u) => u !== loc && !/\/page\d/.test(u)).length, new Set(fetched.filter((u) => u !== loc)).size, "nothing fetched twice");
  assert.deepEqual([res.body.snapshot.outstanding, session], [0, null]);
  assert.deepEqual([w.store.state.sessions.size, w.store.state.sessionDrops], [0, [cont.session]], "no session is left behind");
  assert.ok(w.store.state.sessionSaves.length >= 1 && w.store.state.sessionSaves.every((s) => s.session === cont.session), "each tick re-parks the one session");
  const gone = await run(w, routes, { locator: loc, subresources: true, continue: "cs_does_not_exist" });
  assert.equal(gone.body.subresources_skipped.reason, "NO_SUCH_SESSION", "refused by name, not ignored");
});

test("R19: the page's links are handed to recordLinks under this capture, each element citation its own row sharing one resource key", async () => {
  const w = world();
  const r = await run(w, source(), { locator: LOC, subresources: true });
  const st = w.store.state.links;
  assert.equal(st.length, 1);
  assert.deepEqual([st[0].sourceCapture, st[0].capturedAt], [r.body.document.capture.sha256, r.body.document.retrieved]);
  const L = st[0].links;
  assert.ok(L.every((l) => l.address && l.address_norm === normalizeAddress(l.address)), "every row has an address and its resource key");
  const pdf = L.filter((l) => l.address_norm === normalizeAddress(`${O}/report.pdf`));
  assert.deepEqual(pdf.map((l) => l.fragment).sort(), ["page=12", "page=40"]);
  assert.deepEqual(pdf.map((l) => l.citation_norm).sort(), [normalizeCitation(`${O}/report.pdf#page=12`), normalizeCitation(`${O}/report.pdf#page=40`)]);
  assert.ok(L.some((l) => l.address_norm === normalizeAddress(`${O}/next-page.html`) && l.type === "deferred"));
  const anchor = L.find((l) => l.type === "anchor");
  assert.ok(anchor && anchor.fragment === "findings" && anchor.citation_norm === normalizeCitation(`${LOC}#findings`), "an in-page anchor is an element of this document");
  assert.deepEqual(L.filter((l) => /javascript:/.test(l.address)).map((l) => l.type), ["refused"], "a refused link is filed as refused, never as a target");
  /* a failed link write never fails the capture */
  const bk = world(); bk.store.recordLinks = () => { throw new Error("down"); };
  assert.equal((await run(bk, source(), { locator: LOC, subresources: true })).status, 200);
});

test("R19: the snapshot's compute is counted work, never a millisecond, and is handed to the store's listeners rather than recorded by the act", async () => {
  const w = world();
  const r = await run(w, source(), { locator: LOC, subresources: true });
  const c = r.body.snapshot.compute;
  assert.equal(c.measured_ms, null, "no millisecond figure is claimed");
  assert.ok(c.work_calls > 0 && c.work_bytes > 0, "work is counted instead");
  assert.ok(Object.keys(c.segments).length > 2);
  assert.equal("compute_recorded" in r.body.snapshot, false, "the answer claims no recording it did not make");
  assert.deepEqual(w.store.state.emitted.map(([e, m]) => [e, m.metric, m.value]), [["compute", "capture_work_bytes", c.work_bytes]]);
});

test("R19: a composite states the fetch spread of its parts per clock: reused parts on the record's clock, a mix of reused and fetched never ordered across the two; the stored manifest carries the same", async () => {
  const iso = (ms) => new Date(ms).toISOString().split(".")[0] + "Z";
  const T_A = iso(Date.now() - 2 * 3600e3), T_B = iso(Date.now() - 3600e3);
  const A = ".a { color: red }", B = ".b { color: blue }", C = ".c { color: green }";
  const pageOf = (...css) => `<html><head>${css.map((x) => `<link rel="stylesheet" href="${x}">`).join("")}</head><body><p>d</p></body></html>`;
  const extra = { "/a.css": [A, "text/css"], "/b.css": [B, "text/css"], "/c.css": [C, "text/css"],
                  "/both.html": [pageOf("/a.css", "/b.css"), "text/html"], "/mixed.html": [pageOf("/a.css", "/c.css"), "text/html"] };
  const w = world();
  for (const x of [A, B]) hold(w, x);
  w.store.state.assets.set("w.example", [[normalizeAddress(`${O}/a.css`), known(A, { last_fetched: T_A, last_fetched_by: "a1".repeat(32) })],
                                         [normalizeAddress(`${O}/b.css`), known(B, { last_fetched: T_B, last_fetched_by: "b1".repeat(32) })]]);
  const both = await run(w, source(extra), { locator: `${O}/both.html`, subresources: true });
  assert.equal(both.body.subresources.filter((s) => s.ok && s.fetched_this_capture === false).length, 2, "a composite of two reused parts");
  const sp = both.body.snapshot.part_fetch_spread;
  assert.deepEqual([sp.earliest, sp.latest, sp.state, sp.clock], [T_A, T_B, "one_clock", "record"]);
  assert.equal(sp.clocks.record.parts, 2); assert.equal(!!sp.clocks.capture, false, "a reused part's instant is the fetch that served it");
  assert.deepEqual(JSON.parse(read(w, both.body.snapshot.manifest_sha256)).part_fetch_spread, sp, "the stored manifest carries the same");
  const mixed = await run(w, source(extra), { locator: `${O}/mixed.html`, subresources: true });
  const mp = mixed.body.snapshot.part_fetch_spread;
  const fetchedC = mixed.body.subresources.find((s) => /\/c\.css$/.test(s.url));
  assert.deepEqual(mixed.body.subresources.filter((s) => s.ok).map((s) => s.fetched_this_capture).sort(), [false, true]);
  assert.deepEqual([mp.clocks.record.earliest, mp.clocks.capture.earliest], [T_A, fetchedC.fetched_at]);
  assert.deepEqual([mp.state, mp.clock, mp.earliest, mp.latest], ["two_clocks_not_compared", null, null, null]);
});

test("R13 R19: asking for supporting files of something that has none is said, not swallowed, and the capture and its receipt are filed as for any other", async () => {
  const w = world();
  for (const [path, body, ct] of [["/img/chart.png", PNG, "image/png"], ["/staff-report.pdf", "%PDF-1.4 pretend report", "application/pdf"]]) {
    const r = await run(w, { [`${O}${path}`]: new Response(body, { headers: { "content-type": ct } }) }, { locator: `${O}${path}`, subresources: true });
    assert.deepEqual([r.status, r.body.ok, r.body.subresources_skipped.reason], [200, true, "NOT_HTML"], path);
    assert.equal(r.body.snapshot, undefined);
    assert.deepEqual([w.prov.receipts.at(-1).address, w.prov.receipts.at(-1).captureSha], [`${O}${path}`, r.body.document.capture.sha256], "its address is filed");
  }
  const plain = await run(w, { [`${O}/plain.html`]: page(HTML("<p>no support material requested</p>")) }, { locator: `${O}/plain.html` });
  assert.equal(plain.status, 200);
  assert.deepEqual([w.prov.receipts.at(-1).address, w.prov.receipts.at(-1).captureSha], [`${O}/plain.html`, plain.body.document.capture.sha256]);
  assert.equal(w.store.state.siteRecords.length + w.store.state.links.length, 0, "no walk, no walk's bookkeeping");
});

test("R14: the whole response is recorded on a walked page's document, because headers cannot be recovered later", async () => {
  const w = world();
  const r = await run(w, source({ "/page.html": [PAGE, "text/html; charset=utf-8"] }), { locator: LOC, subresources: true });
  const tr = r.body.document.capture.transport;
  const names = tr.http_headers.map((h) => h[0]);
  assert.ok(names.includes("content-type"));
  const withMore = await run(w, { [LOC]: page(PAGE, { "last-modified": "Wed, 01 Jul 2026 00:00:00 GMT", etag: '"v"' }) }, { locator: LOC, subresources: true });
  const tr2 = withMore.body.document.capture.transport;
  assert.ok(tr2.http_headers.length > 1 && ["last-modified", "etag"].every((k) => tr2.http_headers.some((h) => h[0] === k)), "every header, not a chosen few");
  assert.deepEqual([tr.requested, tr.resolved, tr.redirected, tr.status], [LOC, LOC, false, 200]);
  assert.equal(tr.peer_address, null); assert.match(tr.peer_address_unavailable, /does not expose the peer address/, "and says why");
});
