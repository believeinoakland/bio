/* control-plane (fix round 9, K4842; job 43; R-SEAM, R-ONE, R-CLOCK): THE SAFETY HALF OF THE SEAM, sections 16-18 of `t51-round9-seam.test.mjs` (plan 3b). Written so far: section 16
   (G136a): the scanner's states through the real plane and a scripted `FILE_SCANNER` service binding (the file-scanner's own container files run in its container job; this is the plane's
   side: what a verdict of `encrypted` or a limit hit becomes for the member). Sections 17 (G137c) and 18 (G125, G133c) are the next session's (record, job 43 notes). Counts, rows and fields. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { makeKit } from "./r8-kit.mjs";
import { makeZip } from "../../make-zip.mjs";
import { generate as docGenerate } from "../../docgen.mjs";
import { put, fileIt, uniq, bytesOf } from "./r9-seam-parts.mjs";
import { SAFE_VIEW_PAGES_MAX, SAFE_VIEW_BYTES_MAX } from "../../../src/file-safety/index.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");

export function sections(kit, counting) {
  void kit; void counting;
  const verdicts = new Map();   /* capture digest -> {result, reason?} the scanner double answers with; a digest not named is clean */
  const calls = [];
  const renders = new Map();   /* capture digest -> (call number) => Response the scanner double answers /render with; a digest not named is not renderable */
  const renderCalls = new Map();
  const verdictOf = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
    scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1, ...(verdicts.get(sha) || {}) });
  const scanner = async (req) => {
    const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
    const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
    if (u.pathname === "/scan") { calls.push(...body.targets.map((t) => t.capture_sha)); return json({ ok: true, verdicts: body.targets.map((t) => verdictOf(t.capture_sha)) }); }
    if (u.pathname === "/render") {
      const sha = body.target.capture_sha, n = (renderCalls.get(sha) || 0) + 1;
      renderCalls.set(sha, n);
      return renders.has(sha) ? renders.get(sha)(n) : json({ ok: false, code: "NOT_RENDERED" }, 422);
    }
    return json({ ok: true, name: "file-scanner", version: "1.0.0", bounds: {} });
  };
  const k = makeKit({ tag: "r9safety", serviceBindings: { FILE_SCANNER: scanner } });
  after(() => k.mf.dispose());
  const owner = () => k.ownerOf("r9s-ann").then((o) => o.auth);
  /* upload, file, and wait until the scanner has been asked about the digest and the member's state has left "waiting" */
  async function scanned(bytes, { name, type }) {
    const auth = await owner();
    const { up } = await put(k, auth, bytes, { name, type });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, auth, up, { title: name });
    const sha = up.capture.sha256;
    let os = null, notes = [];
    await k.until(async () => {
      os = (await k.get(auth, { op: "originalstate", capture: sha })).result;
      notes = ((await k.get(auth, { op: "verdictnotes", capture: sha })).result || {}).notes || [];
      return (os && os.not_scanned) || (calls.includes(sha) && (notes.length || (os && os.may_open === true))) ? true : null;
    }, 150000, 2000);
    return { auth, sha, os, notes };
  }

  test("R9 seam §16 (G136a, DOCS S1, I21; R100 R123): a scanner that cannot look inside a file says so: an encrypted ZIP and an encrypted DOCX are `NOT_SCANNED` `ENCRYPTED` with the note `encrypted`, never clean, and neither may be opened as safe; a clean text is the control", { timeout: 900000 }, async () => {
    const t = uniq();
    const zip = makeZip([{ name: "a.txt", data: Buffer.from(`secret words ${t}`), encrypted: "traditional" }]);
    const docx = await bytesOf(docGenerate({ kind: "docx", seed: 9800, size: { units: 3 }, encryptedMember: true }));
    const text = Buffer.from(`ordinary minutes ${t}\n`);
    for (const b of [zip, docx]) verdicts.set(sha256(b), { result: "encrypted" });
    const bad = [];
    for (const [label, bytes, type] of [["zip", zip, "application/zip"], ["docx", docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]) {
      const r = await scanned(bytes, { name: `enc.${label}`, type });
      if (!(r.os && r.os.why === "NOT_SCANNED" && r.os.not_scanned === "ENCRYPTED" && r.os.may_open === false)) bad.push(`${label}: originalstate is ${JSON.stringify(r.os).slice(0, 240)}`);
      /* the scanner is asked about a ZIP and says encrypted; an encrypted Word file is known so from its structure and is not sent to the scanner (file-safety R54): its state is the answer, no note is owed */
      if (label === "zip" && !r.notes.some((n) => n.result === "encrypted")) bad.push(`${label}: no note says encrypted: ${JSON.stringify(r.notes).slice(0, 500)}; originalstate ${JSON.stringify(r.os).slice(0, 200)}`);
      if (r.notes.some((n) => n.result === "clean")) bad.push(`${label}: a note says clean`);
    }
    const control = await scanned(text, { name: "ok.txt", type: "text/plain" });
    if (!(control.os && !control.os.not_scanned && control.os.may_open === true)) bad.push(`control: a clean text opens: ${JSON.stringify(control.os).slice(0, 240)}`);
    if (control.notes.some((n) => ["encrypted", "unscannable"].includes(n.result))) bad.push("control: a note says it could not be scanned");
    assert.deepEqual(bad, []);
  });

  test("R9 seam §16 (G136a, G136b, SCAN D13, I21; R100 R123): a scan that hit a limit (the scanner answers `unknown`, reason `LIMIT:ScanTime`) is the note `unscannable` with the limit named, not a permanent `NOT_SCANNED` with the reason lost", { timeout: 900000 }, async () => {
    const bytes = Buffer.from(`minutes that exhaust the scan time ${uniq()}\n`);
    verdicts.set(sha256(bytes), { result: "unknown", reason: "LIMIT:ScanTime" });
    const r = await scanned(bytes, { name: "slow.txt", type: "text/plain" });
    const shown = JSON.stringify([r.os, r.notes]);
    const note = r.notes.find((n) => n.result === "unscannable");
    assert.ok(note, "the note says unscannable: " + shown.slice(0, 1400));
    assert.ok(String(note.reason).includes("ScanTime"), "and keeps the limit's name: " + String(note.reason));
    assert.notEqual(r.os && r.os.not_scanned, "SCANNER_ABSENT", "and the member's state is the scan's, not an absent scanner");
  });

  /* ---- the safe view's render half (G136b, G137a): a Word file the scanner double renders as scripted, then the view asked for through the door ---- */
  const pdfAnswer = (bytes, { pages, source, truncated }) => new Response(bytes, { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": sha256(bytes),
    "x-pages": String(pages), "x-source-pages": String(source), "x-truncated": truncated ? "true" : "false" } });
  const refusing = (code, extra = {}, status = 422) => new Response(JSON.stringify({ ok: false, code, ...extra }), { status, headers: { "content-type": "application/json" } });
  const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  /* a Word file made for this case, filed, with the double told how to render it; the view is asked until it is no longer \`SAFE_VIEW_PENDING\` (or \`until\` says stop) */
  async function viewOf(render, { until = (v) => v.pending === false, ms = 240000 } = {}) {
    const auth = await owner();
    const bytes = await bytesOf(docGenerate({ kind: "docx", seed: 9810 + renders.size, size: { units: 3 } }));
    const sha = sha256(bytes);
    renders.set(sha, render);
    const { up } = await put(k, auth, bytes, { name: "view.docx", type: DOCX });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, auth, up, { title: "view.docx" });
    let v = null;
    await k.until(async () => {
      const res = await k.plane(`/api/?${new URLSearchParams({ op: "safeview", capture: sha })}`, { headers: auth });
      const type = res.headers.get("content-type") || "";
      if (type.includes("application/pdf")) v = { pending: false, ok: true, described: JSON.parse(res.headers.get("x-file-safety")), bytes: new Uint8Array(await res.arrayBuffer()) };
      else {
        const body = await res.json();
        const r = body.result && typeof body.result === "object" ? body.result : body;
        v = { ok: false, code: r.code || r.error || (r.refusal && r.refusal.code), refusal: r, pending: JSON.stringify(r).includes("SAFE_VIEW_PENDING") };
      }
      return until(v) ? v : null;
    }, ms, 3000);
    return { auth, sha, view: v };
  }

  test("R9 seam §16 (G137a, DOCS Q3, S2; R100): the safe view of a document of more pages than the cap says \"the first N of M\" by key and figures, and a document within the cap says it is a view; neither is a reading", { timeout: 900000 }, async () => {
    const bytes = k.pdfOf("a view of the first pages", 4000);
    const cut = await viewOf(() => pdfAnswer(bytes, { pages: SAFE_VIEW_PAGES_MAX, source: SAFE_VIEW_PAGES_MAX + 100, truncated: true }));
    assert.equal(cut.view.ok, true, JSON.stringify(cut.view).slice(0, 600));
    const d = cut.view.described;
    assert.equal(d.truncated, true);
    assert.equal(d.pages, SAFE_VIEW_PAGES_MAX);
    assert.equal(d.source_pages, SAFE_VIEW_PAGES_MAX + 100);
    assert.equal(d.statement.key, "file-safety.index.safe_view_first_pages");
    assert.equal(d.statement.pages, SAFE_VIEW_PAGES_MAX);
    assert.equal(d.statement.source_pages, SAFE_VIEW_PAGES_MAX + 100);
    const whole = await viewOf(() => pdfAnswer(bytes, { pages: 3, source: 3, truncated: false }));
    assert.equal(whole.view.ok, true, JSON.stringify(whole.view).slice(0, 600));
    assert.equal(whole.view.described.truncated, false);
    assert.equal(whole.view.described.statement.key, "file-safety.index.safe_view_is_a_view", "within the cap, only that it is a view");
  });

  test("R9 seam §16 (G136b, DOCS S2, S4, X17; R100): a render larger than the byte bound is refused \`OVER_BOUND\`, final and not held, and the member is told so", { timeout: 900000 }, async () => {
    let pulled = 0;   /* (a service binding streams eagerly, so how far the body was pulled says nothing of where the reader stopped) */
    const big = () => new Response(new ReadableStream({ pull(c) { if (pulled > SAFE_VIEW_BYTES_MAX + 8 * 1024 * 1024) { c.close(); return; } const n = 1024 * 1024; pulled += n; c.enqueue(new Uint8Array(n)); } }),
      { status: 200, headers: { "content-type": "application/pdf", "x-derived-sha256": "ab".repeat(32), "x-pages": "9", "x-source-pages": "9", "x-truncated": "false" } });
    const r = await viewOf(big);
    assert.equal(r.view.ok, false, "no view is held");
    assert.ok(JSON.stringify(r.view.refusal).includes("OVER_BOUND"), "the refusal says OVER_BOUND: " + JSON.stringify(r.view.refusal).slice(0, 600));
    assert.equal(renderCalls.get(r.sha), 1, "final: the scanner is not asked again");
  });

  test("R9 seam §16 (G136b, DOCS S5, X19; R100): a render that failed for a time limit or an unreachable scanner is queued to be tried again (pending, not failed, not asked again at once); a file that cannot be rendered is refused final", { timeout: 900000 }, async () => {
    const timed = await viewOf(() => refusing("TIME_LIMIT", { class: "transient" }), { until: () => false, ms: 20000 });
    assert.ok(timed.view.pending, "a time limit is pending, not failed: " + JSON.stringify(timed.view).slice(0, 600));
    const unreachable = await viewOf(() => { throw new Error("no scanner"); }, { until: () => false, ms: 20000 });
    assert.ok(unreachable.view.pending, "an unreachable scanner is pending, not failed: " + JSON.stringify(unreachable.view).slice(0, 600));
    const final = await viewOf(() => refusing("NOT_RENDERABLE", { detail: "not a document" }));
    assert.equal(final.view.ok, false);
    assert.ok(JSON.stringify(final.view.refusal).includes("NOT_RENDERABLE"), "classed: " + JSON.stringify(final.view.refusal).slice(0, 600));
    assert.ok(!final.view.pending, "and final, not pending");
    assert.ok((renderCalls.get(timed.sha) || 0) <= 2, `a time limit is not retried at once: ${renderCalls.get(timed.sha)} calls in 20 s`);
  });

  /* ---- section 17 (G137c, X23, DOCS V4-V7): the visitor render, through the real door over a scripted RENDERER service binding ---- */
  const asked = new Map();   /* page name -> the renderer's calls for it */
  const script = new Map();  /* page name -> (call number) => the renderer's answer object */
  const RENDERED = "<html><body><main><p>the page as a visitor saw it</p></main></body></html>";
  const okAnswer = (url, more = {}) => ({ ok: true, html: RENDERED, elapsed_ms: 800, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 }, dpr: 1, locale: "en-US", timezone: "UTC",
    navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" }, ...more });
  const renderer = async (req) => {
    const { url } = await req.json();
    const name = new URL(url).pathname.split("/").pop(), n = (asked.get(name) || 0) + 1;
    asked.set(name, n);
    const a = script.has(name) ? script.get(name)(n, url) : okAnswer(url);
    return new Response(JSON.stringify(a), { status: 200, headers: { "content-type": "application/json" } });
  };
  const kv = makeKit({ tag: "r9visitor", bindings: { RENDER_DAILY_ALLOWANCE_MS: "100000" }, serviceBindings: { RENDERER: renderer } });
  after(() => kv.mf.dispose());
  const SHELL = Buffer.from("<html><body><div id=app>loading</div><script src=/app.js></script></body></html>");
  async function visit(name, answers) {
    script.set(name, typeof answers === "function" ? answers : () => answers);
    kv.serve(name, SHELL, { type: "text/html" });
    const auth = await kv.ownerOf("r9v-ann").then((o) => o.auth);
    const r = await kv.acquire(auth, { locator: `https://www.example.gov/pages/${name}`, render: true });
    return { r, calls: asked.get(name) || 0 };
  }
  const reasonOf = (r) => (r.body.result && r.body.result.reason) || r.body.reason || (r.body.result && r.body.result.render && r.body.result.render.state) || null;
  const bodyOf = (r) => (r.body.result && typeof r.body.result === "object" ? r.body.result : r.body);

  test("R9 seam §17 (G137c, X23, DOCS V4; R115): a failed render is charged the time it took, not its whole reservation: eight quick failures never reach the day's allowance", { timeout: 900000 }, async () => {
    const t = uniq();
    const quick = [];
    for (let i = 0; i < 8; i++) {
      const { r } = await visit(`quick-${t}-${i}`, { ok: false, error: "net::ERR_CONNECTION_REFUSED", failure_class: "permanent", elapsed_ms: 1000 });
      quick.push(JSON.stringify([r.status, bodyOf(r).reason]));
    }
    assert.ok(quick.every((x) => x.includes("RENDER_FAILED")), "each quick failure is a failed render, none deferred by the day's account: " + quick.join(" "));
  });

  test("R9 seam §17 (G137c, X23, DOCS V5, V6; R115): a page that answered 403 or ended on the browser's own error page, or came back empty, is not filed as the document: \"the page did not render\", permanent; a good page is the control", { timeout: 900000 }, async () => {
    const t = uniq();
    const cases = { forbidden: (u) => okAnswer(u, { status: 403 }), errorpage: (u) => okAnswer(u, { navigated_to: "chrome-error://chromewebdata/" }),
                    emptyshell: (u) => okAnswer(u, { html: "<html><head></head><body></body></html>" }) };
    const bad = [];
    for (const [label, make] of Object.entries(cases)) {
      const { r } = await visit(`${label}-${t}`, (n, u) => make(u));
      const b = bodyOf(r);
      if (!(r.status >= 400 && b.reason === "RENDER_FAILED" && b.filed === false && b.failure_class === "permanent")) bad.push(`${label}: ${r.status} ${JSON.stringify(b).slice(0, 300)}`);
    }
    const good = await visit(`good-${t}`, (n, u) => okAnswer(u));
    if (!(good.r.status === 200 && bodyOf(good.r).ok === true)) bad.push(`good page: ${good.r.status} ${JSON.stringify(bodyOf(good.r)).slice(0, 300)}`);
    assert.deepEqual(bad, []);
  });

  test("R9 seam §17 (G137c, X23, DOCS V7; R115): a transient failure (a session refused) is tried up to three times and then reported transient; a permanent one once; a transient one that clears is filed", { timeout: 900000 }, async () => {
    const t = uniq();
    const bad = [];
    const flaky = await visit(`flaky-${t}`, (n, u) => (n < 3 ? { ok: false, error: "session refused", failure_class: "transient", elapsed_ms: 500 } : okAnswer(u)));
    if (!(flaky.r.status === 200 && flaky.calls === 3)) bad.push(`clears on the third: status ${flaky.r.status}, ${flaky.calls} calls`);
    const down = await visit(`down-${t}`, () => ({ ok: false, error: "session refused", failure_class: "transient", elapsed_ms: 500 }));
    if (!(down.calls === 3 && bodyOf(down.r).reason === "RENDER_FAILED" && bodyOf(down.r).failure_class === "transient")) bad.push(`always refused: ${down.calls} calls, ${JSON.stringify(bodyOf(down.r)).slice(0, 300)}`);
    const never = await visit(`never-${t}`, () => ({ ok: false, error: "the page is not HTML", failure_class: "permanent", elapsed_ms: 500 }));
    if (!(never.calls === 1 && bodyOf(never.r).failure_class === "permanent")) bad.push(`permanent: ${never.calls} calls, ${JSON.stringify(bodyOf(never.r)).slice(0, 300)}`);
    assert.deepEqual(bad, []);
  });

  test("R9 seam §17 (G137c, X23, DOCS V4; R115): the control: failures that took 40 s each do spend the day (allowance 100 s here), and the refusal shows the account", { timeout: 900000 }, async () => {
    const t = uniq();
    const slow = [];
    for (let i = 0; i < 4; i++) slow.push((await visit(`slow-${t}-${i}`, { ok: false, error: "navigation timeout", failure_class: "permanent", elapsed_ms: 40000 })).r);
    const deferred = slow.find((r) => bodyOf(r).reason === "RENDER_DEFERRED");
    assert.ok(deferred, "failures that took 40 s each spend the day: " + JSON.stringify(slow.map((r) => bodyOf(r).reason)));
    const acct = bodyOf(deferred).render.allowance;
    assert.ok(acct.spent_ms >= 80000, `the day's account shows what the failures took: ${JSON.stringify(acct)}`);
    assert.equal(acct.allowance_ms, 100000);
  });
}
