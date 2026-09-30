/* acquisition: converts the acquisition share of two legacy suites, `test/d57selflink.test.mjs` (D-57: a page that links
   to itself, captured through op=acquire) and `test/d522-unattended-render.test.mjs` (D-522: an unattended render through
   the capture-request arm, within the day's allowance). What those suites assert about link resolution, tallies and
   verdicts (capture R27, `resolveLinks`), the render allowance's ledger (capture R39), and the drain's rows and run log
   (capture-requests) is not this module's and is not carried here. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, HTML, page, rendererEnv } from "./fixture.mjs";
import { RENDER_DEFAULTS, RENDERED_METHOD, renderReserveMs } from "../../../src/render.mjs";
import { normalizeAddress } from "../../../src/subresources.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../checks/bio-checks.mjs";
import { RENDER_CAPTURE_CHECKS } from "../../../src/acquisition/index.mjs";

/* d57selflink's page: a calendar that links to itself, beside two other same-host pages. */
const HOST = "www.city.example";
const CAL = `https://${HOST}/calendar.html`;
const B_URL = `https://${HOST}/churned.html`;
const C_URL = `https://${HOST}/sameinstant.html`;
const CAL_PAGE = HTML(`<h1>Meetings</h1>
<a href="/calendar.html">This month</a>
<a href="/churned.html">A page that changed</a>
<a href="/sameinstant.html">A page captured at the same instant</a>`);

test("R19: a self-linking page's own link is handed to recordLinks with the page's own digest as its source, its address normalised, listed beside the others and never dropped", async () => {
  const w = world();
  const r = await run(w, { [CAL]: () => page(CAL_PAGE) }, { locator: CAL, authority: "City Clerk", subresources: true });
  assert.equal(r.status, 200, "the page is acquired");
  const SHA = r.body.document.capture.sha256;
  assert.match(SHA, /^[0-9a-f]{64}$/, "and names its capture");
  assert.equal(SHA, sha(CAL_PAGE), "the digest of the bytes served");
  /* what the act hands the store's recordLinks (capture R27 resolves it; this module only records it) */
  const st = w.store.state;
  assert.equal(st.links.length, 1, "one recordLinks call for the capture");
  const rec = st.links[0];
  assert.equal(rec.sourceCapture, SHA, "the source capture is this very page's digest");
  assert.equal(rec.capturedAt, r.body.document.retrieved, "recorded at the capture's own retrieval instant");
  const by = Object.fromEntries(rec.links.map((l) => [l.address_norm, l]));
  const self = by[normalizeAddress(CAL)];
  assert.ok(self, "HOW A LIAR PASSES: the self-link is still listed");
  assert.deepEqual([self.ref, self.address, self.address_norm, self.citation_norm, self.fragment, self.type, self.origin, self.chrome, self.chrome_basis],
                   ["/calendar.html", CAL, normalizeAddress(CAL), normalizeAddress(CAL), null, "deferred", "same_host", false, null],
                   "resolved to its absolute address, normalised, deferred to the store (never dropped as offsite or intra)");
  assert.equal(self.address_norm, normalizeAddress(r.body.document.locator), "its target address is the page's own");
  /* one step wider and the over-strictness arm: the other two targets are listed the same way, three in all */
  assert.deepEqual(rec.links.map((l) => l.address_norm).sort(), [CAL, B_URL, C_URL].map(normalizeAddress).sort(),
                   "all three held targets are handed in, the self-link among them");
  for (const u of [B_URL, C_URL]) assert.deepEqual([by[normalizeAddress(u)].type, by[normalizeAddress(u)].origin], ["deferred", "same_host"], u);
  /* the answer and the manifest say the same about it */
  assert.deepEqual(r.body.subresources, [], "a link is not a supporting file");
  assert.deepEqual(r.net.seen.map((x) => x.url), [CAL], "the self-link is not fetched again: the page was asked for once");
  assert.equal(r.body.files["data/snapshot-manifest.json"], r.body.snapshot.manifest_sha256);
  const manifest = JSON.parse(Buffer.from(w.bytesOf(r.body.snapshot.manifest_sha256)).toString("utf-8"));
  assert.deepEqual(manifest.counts.links, { anchor: 0, intra: 0, deferred: 3, refused: 0 }, "the manifest counts the self-link");
  const mSelf = manifest.links.find((l) => l.address === CAL);
  assert.ok(mSelf, "and lists it");
  assert.deepEqual([mSelf.type, mSelf.held_at_capture], ["deferred", false], "deferred, not held at capture (this capture was not yet filed)");
  /* `as_of` is the walk's own clock (subresources R15), read after the page's retrieval, so it is never before it. */
  assert.ok(Date.parse(mSelf.as_of) >= Date.parse(r.body.document.retrieved), "as of the walk, never before the page's retrieval");
  /* negative control: without `subresources: true` nothing is walked, so no links are handed in */
  const plain = world();
  const p = await run(plain, { [CAL]: () => page(CAL_PAGE) }, { locator: CAL });
  assert.equal(p.status, 200);
  assert.deepEqual([plain.store.state.links.length, p.body.subresources, p.body.snapshot], [0, undefined, undefined]);
});

/* d522's source: a client-rendered portal whose served document is only the frame. */
const PORTAL = "portal.example.gov";
const RENDER_PAGE = `https://${PORTAL}/agendas/council-2026-09`;
const RENDER_PAGE_2 = `https://${PORTAL}/agendas/council-2026-10`;
const SHELL = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head><body><div id="root"></div></body></html>`;
const renderedHtml = (p) => `<!doctype html><html><head><title>Portal</title></head><body><main><h1>Council agenda</h1><p>Rendered unattended for ${p}.</p></main></body></html>`;
const renderAnswer = { ok: true, html: renderedHtml("/agendas/council-2026-09"), engine: "chromium", engine_version: "fixture-d522",
  viewport: { width: 1280, height: 800 }, dpr: 1, locale: "en-US", timezone: "UTC", wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" },
  elapsed_ms: 1000, navigated_to: RENDER_PAGE, status: 200,
  requests: [{ url: RENDER_PAGE, type: "document", outcome: "completed", status: 200 }, { url: `https://${PORTAL}/app.js`, type: "script", outcome: "completed", status: 200 }],
  scripts: [{ url: `https://${PORTAL}/app.js` }] };

/* The drain's in-process arm (K58) as capture-requests fires it: the daemon, not a member. */
const arm = (w, routes, captureRequest) => run(w, routes, {}, { cls: "daemon", member: false, sessMember: null,
  captureRequest: { purpose: "investigate", agent: null, ...captureRequest } });

test("R5 R6 R21: the capture-request arm with render: true renders once as the daemon, files the rendered document as primary with the shell held beside it, and a second render the day's allowance cannot hold is RENDER_DEFERRED with nothing fetched", async () => {
  const RESERVE = renderReserveMs(RENDER_DEFAULTS);
  assert.ok(RESERVE > renderAnswer.elapsed_ms, "a reservation is positive and larger than the render's elapsed time: a zero would defer the success arm and prove nothing");
  assert.equal(/Council agenda/.test(SHELL), false, "the shell carries no content, so a capture holding it would be the defect");
  const env = rendererEnv(renderAnswer);
  /* exactly one render's reservation: the first is admitted at 0 + 0 + R <= R and spends 1000 ms; the second reads 1000 + 0 + R > R */
  const w = world({ env: { ...env, RENDER_DAILY_ALLOWANCE_MS: String(RESERVE) } });
  const routes = { [RENDER_PAGE]: () => page(SHELL), [RENDER_PAGE_2]: () => page(SHELL) };
  const SHELL_SHA = sha(SHELL);
  const WANT = sha(renderedHtml("/agendas/council-2026-09"));

  /* A: the unattended render succeeds */
  const r = await arm(w, routes, { locator: RENDER_PAGE, render: true });
  assert.equal(r.status, 200, "the daemon's arm captured it, not refused");
  assert.deepEqual(r.net.seen.map((x) => x.url), [RENDER_PAGE], "the source was asked once for its served document");
  assert.equal(env.calls.length, 1, "and the renderer once for the page");
  assert.equal(env.calls[0].url, RENDER_PAGE);
  const d = r.body.document;
  assert.deepEqual([d.capture.sha256 === WANT, d.capture.sha256 === SHELL_SHA], [true, false],
                   "THE ACCEPTS-WHEN: the primary is the rendered document, never the served shell");
  assert.equal(d.capture.method, RENDERED_METHOD, "filed under the method render.mjs names");
  assert.equal(d.capture.grade, EARNED_CAPTURE_CEILING, "the ordinary direct-capture grade: rendering is not a lesser capture");
  assert.equal(d.capture.actor_class, "daemon", "the daemon's capture, not a member's");
  assert.deepEqual(d.origin, { kind: "named_request" }, "R21: with no drain origin, a named request");
  assert.match(Buffer.from(w.bytesOf(WANT)).toString("utf-8"), /Rendered unattended for \/agendas\/council-2026-09/,
               "the bytes held under that digest are the renderer's page");
  assert.deepEqual(d.pair, { primary: "rendered", rendered: { file: d.file, sha256: WANT }, shell: { file: `${d.file}.shell.html`, sha256: SHELL_SHA } },
                   "THE PAIR: the served shell beside it under its own digest");
  assert.equal(Buffer.from(w.bytesOf(SHELL_SHA)).toString("utf-8"), SHELL, "the shell is held as served");
  assert.equal(r.body.files[`${d.file}.shell.html`], SHELL_SHA);
  assert.deepEqual([w.store.state.render.spent_ms, w.store.state.render.reserved_ms, w.store.state.render.renders], [1000, 0, 1],
                   "the reservation released with the render's elapsed time");

  /* C: the next render the day cannot pay for is deferred before anything leaves */
  const receipts = w.prov.receipts.length, puts = w.b.calls.filter((c) => c[0] === "put").length;
  const r2 = await arm(w, routes, { locator: RENDER_PAGE_2, render: true });
  assert.deepEqual([r2.status, r2.body.ok, r2.body.reason, r2.body.check, r2.body.translation, r2.body.render.state],
                   [429, false, "RENDER_DEFERRED", RENDER_CAPTURE_CHECKS.RENDER_DEFERRED.check, RENDER_CAPTURE_CHECKS.RENDER_DEFERRED.translation, "deferred"],
                   "RENDER_DEFERRED under its catalogue row: the first render spent the allowance");
  assert.equal(r2.net.seen.length, 0, "nothing left the instance for it: no fetch");
  assert.equal(env.calls.length, 1, "THE RENDERER WAS REACHED EXACTLY ONCE, for the page that asked");
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length, r2.body.document], [receipts, puts, undefined],
                   "nothing filed: the shell is not filed in the render's place");
  assert.equal(w.store.state.admits.at(-1).reserveMs, RESERVE, "the reservation asked is renderReserveMs(RENDER_DEFAULTS)");
});

test("R5 R21: over-strictness, a plain capture-request (render: false) files the served document and never reaches the renderer, even with a render body", async () => {
  const env = rendererEnv(renderAnswer);
  const w = world({ env: { ...env, RENDER_DAILY_ALLOWANCE_MS: String(renderReserveMs(RENDER_DEFAULTS)) } });
  const PLAIN = `https://${PORTAL}/agendas/plain-2026-09`;
  const r = await run(w, { [PLAIN]: () => page(SHELL) }, { render: true }, { cls: "daemon", member: false, sessMember: null,
    captureRequest: { locator: PLAIN, purpose: "investigate", agent: null, render: false } });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.sha256, sha(SHELL), "the document as the site serves it: an ask nobody made is never upgraded");
  assert.equal(r.body.document.pair, undefined);
  assert.deepEqual([env.calls.length, w.store.state.admits.length], [0, 0], "the renderer was not reached and no allowance asked");
});
