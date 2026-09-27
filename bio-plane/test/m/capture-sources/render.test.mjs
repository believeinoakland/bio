/* capture-sources: the rendered capture's record (`render.mjs`), tested at the module's
 * interface (build/requirements/capture-sources.md R1–R18, R47–R50, R54). Each test names
 * the requirement id it checks in its title. No browser, no store: every renderer answer,
 * `put` and `sha256` below is this file's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  RENDER_DEFAULTS, RENDER_NAVIGATION_TIMEOUT_MS, RENDERED_METHOD, NON_DATA_TYPES,
  RENDER_TICK_UNDETERMINED, RENDER_INCOMPLETE_READING, RENDER_DAILY_ALLOWANCE_MS_DEFAULT,
  RENDER_CONCURRENCY_CAP_DEFAULT, renderLocaleFor, waitFiredClass, completenessReading,
  renderAllowanceMs, renderConcurrencyCap, renderReserveMs, keepRenderBodies, originKey,
  renderBlock, renderedAuthority, rendererFor,
} from "../../../src/render.mjs";
import { SUBRESOURCE_CAP, SUBRESOURCE_MAX, SUBRESOURCE_BUDGET } from "../../../src/subresources.mjs";

const HOST = "portal.example.gov";
const PAGE = `https://${HOST}/agenda`;
const SHELL_SHA = "a".repeat(64);
const AT = "2026-09-27T02:00:00Z";
const hex = (b) => createHash("sha256").update(b).digest("hex");
const enc = (s) => new TextEncoder().encode(s);
const b64 = (s) => Buffer.from(s).toString("base64");

/* A full answer, every field reported; a test removes or changes what it is about. */
const answer = (over = {}) => ({
  ok: true, html: "<!DOCTYPE html>\n<html><body><main>Agenda</main></body></html>",
  engine: "HeadlessChrome", engine_version: "124.0.6367.207",
  viewport: { width: 1280, height: 800 }, dpr: 1, locale: "en-US", timezone: "UTC",
  wait: { condition: RENDER_DEFAULTS.wait, fired: "networkidle" },
  elapsed_ms: 2345, navigated_to: PAGE, status: 200,
  requests: [
    { url: PAGE, type: "document", outcome: "completed", status: 200 },
    { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", status: 200 },
    { url: `https://${HOST}/app.css`, type: "stylesheet", outcome: "completed", status: 200 },
    { url: `https://${HOST}/api/items.json`, type: "xhr", outcome: "completed", status: 200 },
  ],
  scripts: [{ url: `https://${HOST}/app.js` }],
  ...over,
});
const block = (a, opts = {}) => renderBlock(a, { pageUrl: PAGE, shellSha: SHELL_SHA, at: AT, ...opts });

test("R1: RENDER_DEFAULTS, RENDERED_METHOD and NON_DATA_TYPES are exactly as stated, and frozen", () => {
  assert.equal(RENDER_NAVIGATION_TIMEOUT_MS, 10000);
  assert.deepEqual(RENDER_DEFAULTS, {
    navigation_timeout_ms: 10000, viewport: { width: 1280, height: 800 }, dpr: 1, locale: "en-US",
    timezone: "UTC", wait: { until: "networkidle", timeout_ms: 15000 },
  });
  assert.ok(Object.isFrozen(RENDER_DEFAULTS) && Object.isFrozen(RENDER_DEFAULTS.viewport) && Object.isFrozen(RENDER_DEFAULTS.wait));
  assert.equal(RENDERED_METHOD, "rendered");
  assert.deepEqual({ ...NON_DATA_TYPES }, { script: "code", stylesheet: "layout", font: "layout" });
  assert.ok(Object.isFrozen(NON_DATA_TYPES));
  /* Every other type is data, including one never seen and a capitalised spelling of a
     data type; the three listed types (in any case) never are. */
  const types = ["document", "xhr", "fetch", "image", "other", "never-seen-type", "Script", "FONT", "Stylesheet", "font"];
  const r = block(answer({ requests: types.map((t, i) => ({ url: `https://${HOST}/r${i}`, type: t, outcome: "completed" })) }));
  assert.deepEqual(r.render.data.map((d) => d.type), ["document", "xhr", "fetch", "image", "other", "never-seen-type"]);
});

test("R2: the tick's sentence and the incomplete reading are the one copy of each", () => {
  assert.equal(RENDER_TICK_UNDETERMINED, "content undetermined — not watched: this source renders its content in the browser");
  assert.equal(RENDER_INCOMPLETE_READING, "render may be incomplete (wait timed out)");
  /* The record and the reading use this copy (R14, R4). */
  const r = block(answer({ wait: { fired: "timeout" } })).render;
  assert.equal(completenessReading(r), RENDER_INCOMPLETE_READING);
  assert.ok(r.undetermined.some((u) => u.includes(RENDER_INCOMPLETE_READING)));
});

test("R54: the render locale is the one the combined profiles name, else the fallback; never throws", () => {
  /* A view as `jurisdictions.combine` gives one: a one-value fact with its basis and profile. */
  assert.equal(renderLocaleFor({ id: "testland", locale: { value: "fr-CA", basis: "TEST", profile: "testland" } }), "fr-CA");
  assert.equal(renderLocaleFor({ id: "a+b", locale: { value: "es", basis: "M-1", profile: "a" } }), "es");
  assert.equal(renderLocaleFor({ id: "x", locale: { value: "zh-Hant-TW", basis: "M-2" } }), "zh-Hant-TW");
  /* No profile names one, the fact was withheld as a conflict, or the value is not a tag. */
  for (const v of [undefined, null, 7, "fr-CA", {}, { id: "x" }, { locale: null }, { locale: "fr-CA" },
                   { locale: { value: "" } }, { locale: { value: "not a tag!" } }, { locale: { value: 42 } },
                   { locale: { value: "e" } }, { locale: { value: "en_US" } }])
    assert.equal(renderLocaleFor(v), RENDER_DEFAULTS.locale, JSON.stringify(v));
  const hostile = { get locale() { throw new Error("boom"); } };
  assert.equal(renderLocaleFor(hostile), "en-US");
});

test("R3: waitFiredClass reads the renderer's word into four classes; never throws", () => {
  const asked = { until: "networkidle", timeout_ms: 15000 };
  for (const w of ["timeout", "timed out", "Timed-Out", "time-out", "TIMEOUT", " wait timeout "])
    assert.equal(waitFiredClass(w, asked), "timeout", w);
  for (const w of ["quiet_excluding_long_lived", " Quiet_Excluding_Long_Lived "])
    assert.equal(waitFiredClass(w, asked), "settled", w);
  assert.equal(waitFiredClass("networkidle", asked), "condition");
  assert.equal(waitFiredClass(" NetworkIdle ", { until: " networkidle " }), "condition");
  assert.equal(waitFiredClass("load", { until: "load" }), "condition");
  for (const [w, a] of [["load", asked], ["", asked], [null, asked], [42, asked], [undefined, asked],
                        ["#selector", asked], ["networkidle", null], ["networkidle", {}], ["networkidle", { until: 5 }]])
    assert.equal(waitFiredClass(w, a), "undetermined", JSON.stringify([w, a]));
});

test("R4: completenessReading answers each completeness its reading; never throws", () => {
  assert.equal(completenessReading({ completeness: "condition_met", wait: { fired_class: "condition" } }), null);
  assert.equal(completenessReading({ completeness: "undetermined", wait: { fired_class: "timeout" } }), RENDER_INCOMPLETE_READING);
  assert.equal(completenessReading({ completeness: "undetermined", wait: { fired_class: "undetermined" } }),
    "render completeness is undetermined (which wait ended the render was not established)");
  assert.equal(completenessReading({ completeness: "undetermined" }),
    "render completeness is undetermined (which wait ended the render was not established)");
  assert.equal(completenessReading({ completeness: "settled_with_open_requests", wait: { fired_class: "settled", long_lived: { count: 2 } } }),
    "settled; 2 long-lived request(s) still open were not waited for");
  assert.equal(completenessReading({ completeness: "settled_with_open_requests", wait: { fired_class: "settled" } }),
    "settled; an unstated number of long-lived request(s) still open were not waited for");
  for (const v of [null, undefined, {}, 5, "x"]) assert.equal(completenessReading(v), null);
});

test("R5: renderAllowanceMs is the setting floored when a finite number >= 0, else the default; never throws", () => {
  assert.equal(RENDER_DAILY_ALLOWANCE_MS_DEFAULT, 1200000);
  assert.equal(renderAllowanceMs({ RENDER_DAILY_ALLOWANCE_MS: "600000" }), 600000);
  assert.equal(renderAllowanceMs({ RENDER_DAILY_ALLOWANCE_MS: 1234.9 }), 1234);
  assert.equal(renderAllowanceMs({ RENDER_DAILY_ALLOWANCE_MS: "0" }), 0);
  for (const v of [undefined, null, "", " ", "abc", "-1", -5, Infinity, "Infinity", NaN, true, [], {}])
    assert.equal(renderAllowanceMs({ RENDER_DAILY_ALLOWANCE_MS: v }), 1200000, String(v));
  assert.equal(renderAllowanceMs(undefined), 1200000);
  assert.equal(renderAllowanceMs(null), 1200000);
});

test("R6: renderConcurrencyCap is a positive whole setting, else the default, never 'no renders' or 'no cap'", () => {
  assert.equal(RENDER_CONCURRENCY_CAP_DEFAULT, 10);
  assert.equal(renderConcurrencyCap({ RENDER_CONCURRENCY_CAP: "3" }), 3);
  assert.equal(renderConcurrencyCap({ RENDER_CONCURRENCY_CAP: 25 }), 25);
  for (const v of [undefined, null, "", " ", "0", 0, "-2", "2.5", 2.5, "x", Infinity, true, []])
    assert.equal(renderConcurrencyCap({ RENDER_CONCURRENCY_CAP: v }), 10, String(v));
  assert.equal(renderConcurrencyCap(null), 10);
});

test("R7: renderReserveMs is ceil(wait + navigation timeout), each falling back to the default's own", () => {
  assert.equal(renderReserveMs(), 25000);
  assert.equal(renderReserveMs(RENDER_DEFAULTS), 25000);
  assert.equal(renderReserveMs({ navigation_timeout_ms: 2000, wait: { timeout_ms: 3000.2 } }), 5001);
  assert.equal(renderReserveMs({ navigation_timeout_ms: 0, wait: { timeout_ms: 0 } }), 0);
  assert.equal(renderReserveMs({ navigation_timeout_ms: -1, wait: { timeout_ms: 4000 } }), 14000);
  assert.equal(renderReserveMs({ navigation_timeout_ms: 1000, wait: { timeout_ms: null } }), 16000);
  assert.equal(renderReserveMs({ navigation_timeout_ms: "x", wait: {} }), 25000);
  assert.equal(renderReserveMs({}), 25000);
  assert.equal(renderReserveMs(null), 25000);
});

/* A store for R8–R9: `put` keeps, `sha256` hashes; either can be made to fail. */
const store = ({ failPut = false, failHash = false } = {}) => {
  const kept = new Map();
  return { kept,
    put: async (d, b) => { if (failPut) throw new Error("bucket unavailable"); kept.set(d, b); },
    sha256: async (b) => { if (failHash) throw new Error("no digest"); return hex(b); } };
};

test("R8: keepRenderBodies keeps each completed load's bytes, hashed and stored before it answers", async () => {
  assert.equal(await keepRenderBodies({ requests: null }, store()), null);
  assert.equal(await keepRenderBodies(null, store()), null);
  const s = store();
  const reqs = [
    { url: `https://${HOST}/a.js`, outcome: "completed", body_base64: b64("let a = 1;") },
    { url: `https://${HOST}/b.css`, outcome: "completed", body_text: "b { color: red } /* café */" },
    { url: `https://${HOST}/c`, outcome: "failed" },
    { url: `https://${HOST}/d`, outcome: "blocked" },
    { url: `https://${HOST}/e`, outcome: "pending" },
    { outcome: "completed", body_text: "no url" },
    null,
  ];
  const out = await keepRenderBodies({ requests: reqs }, s);
  assert.equal(out.length, reqs.length);
  assert.deepEqual(out.slice(2), [null, null, null, null, null]);
  const a = enc("let a = 1;"), b = enc("b { color: red } /* café */");
  assert.deepEqual(out[0], { sha256: hex(a), bytes: a.length, body_as: "bytes", kept: true });
  assert.deepEqual(out[1], { sha256: hex(b), bytes: b.length, body_as: "decoded_text", kept: true });
  assert.deepEqual([...s.kept.keys()].sort(), [hex(a), hex(b)].sort());
  assert.deepEqual(s.kept.get(hex(b)), b);
});

test("R9: a completed load not kept reads undetermined with its reason; a reported digest is renderer_sha256 only", async () => {
  const claim = "f".repeat(64);
  const big = "A".repeat(Math.ceil((SUBRESOURCE_MAX + 3) / 3) * 4);
  const out = await keepRenderBodies({ requests: [
    { url: "https://x.example/1", outcome: "completed", body_unavailable: "evicted by the browser", sha256: claim },
    { url: "https://x.example/2", outcome: "completed", body_base64: "not*base64" },
    { url: "https://x.example/3", outcome: "completed", body_base64: big },
    { url: "https://x.example/4", outcome: "completed", sha256: claim },
  ] }, store());
  assert.equal(out[0].sha256, "undetermined");
  assert.match(out[0].digest_reason, /did not deliver this response's bytes \(evicted by the browser\)/);
  assert.equal(out[0].renderer_sha256, claim);
  assert.match(out[1].digest_reason, /not valid base64/);
  assert.match(out[2].digest_reason, new RegExp(`over the ${SUBRESOURCE_MAX}-byte per-subresource ceiling`));
  assert.deepEqual([out[3].sha256, out[3].renderer_sha256], ["undetermined", claim]);
  assert.ok(out.every((o) => o.kept !== true && !("bytes" in o)));
  /* A hex digest a renderer reported beside kept bytes is its claim, never the digest. */
  const kept = await keepRenderBodies({ requests: [{ url: "https://x.example/5", outcome: "completed", body_text: "x", sha256: claim }] }, store());
  assert.deepEqual(kept[0], { sha256: hex(enc("x")), bytes: 1, body_as: "decoded_text", kept: true, renderer_sha256: claim });

  /* Past the count ceiling, past the byte budget. */
  const many = Array.from({ length: SUBRESOURCE_CAP + 2 }, (_, i) => ({ url: `https://x.example/n${i}`, outcome: "completed", body_text: `n${i}` }));
  const capped = await keepRenderBodies({ requests: many }, store());
  assert.equal(capped.filter((o) => o.kept).length, SUBRESOURCE_CAP);
  assert.match(capped.at(-1).digest_reason, new RegExp(`past the ${SUBRESOURCE_CAP}-body per-capture ceiling`));
  const body = (i) => "B".repeat(SUBRESOURCE_MAX - 4) + String(i).padStart(4, "0");
  const n = Math.floor(SUBRESOURCE_BUDGET / SUBRESOURCE_MAX) + 1;
  const budget = await keepRenderBodies({ requests: Array.from({ length: n }, (_, i) => ({ url: `https://x.example/b${i}`, outcome: "completed", body_text: body(i) })) }, store());
  assert.equal(budget.filter((o) => o.kept).length, n - 1);
  assert.match(budget.at(-1).digest_reason, new RegExp(`${SUBRESOURCE_BUDGET}-byte subresource budget was spent`));

  /* A failing put or sha256 becomes the entry; it never throws. */
  for (const s of [store({ failPut: true }), store({ failHash: true })]) {
    const o = await keepRenderBodies({ requests: [{ url: "https://x.example/f", outcome: "completed", body_text: "x" }] }, s);
    assert.equal(o[0].sha256, "undetermined");
    assert.match(o[0].digest_reason, /could not keep the bytes \((bucket unavailable|no digest)\)/);
    assert.equal(s.kept.size, 0);
  }
});

test("R10: originKey is scheme//host, or null when unparseable", () => {
  assert.equal(originKey("https://Cdn.Example.com:8443/a/b?c#d"), "https://cdn.example.com:8443");
  assert.equal(originKey("http://example.org/x"), "http://example.org");
  for (const v of ["not a url", "", null, undefined, 5]) assert.equal(originKey(v), null);
});

test("R11: renderBlock refuses only an answer that is not ok or has no document", () => {
  assert.match(block({ ok: false, error: "browser crashed" }).problem, /did not answer ok \(browser crashed\)/);
  assert.match(block(null).problem, /no answer/);
  assert.equal(block(answer({ html: "" })).ok, false);
  assert.match(block(answer({ html: 5 })).problem, /no rendered document/);
  /* Anything short of that is recorded with its gaps named. */
  const r = block({ ok: true, html: "<html></html>" });
  assert.equal(r.ok, true);
  assert.ok(r.render.undetermined.length >= 8);
});

test("R12: requests counted by outcome; subresources and data carry the plane's digests and origins", async () => {
  const reqs = [
    { url: PAGE, type: "document", outcome: "completed", body_text: "<html>" },
    { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", body_base64: b64("x()") },
    { url: `https://cdn.example.net/lib.css`, type: "Stylesheet", outcome: "completed" },
    { url: `https://data.example.gov/items.json`, type: "xhr", outcome: "completed", body_text: "[]" },
    { url: `https://api.other.org/q`, type: "fetch", outcome: "completed", body_text: "{}" },
    { url: `https://ads.example/p.gif`, type: "image", outcome: "blocked", blocked_by: "inspector" },
    { url: `https://ads.example/q.gif`, type: "image", outcome: "blocked" },
    { url: `https://${HOST}/missing`, type: "xhr", outcome: "failed" },
    { url: `https://${HOST}/slow`, type: "xhr", outcome: "pending" },
    { url: "", type: "xhr", outcome: "completed" },
    { type: "xhr", outcome: "completed" },
  ];
  const a = answer({ requests: reqs });
  const digests = await keepRenderBodies(a, store());
  const r = block(a, { digests }).render;
  assert.deepEqual(r.requests, { made: 9, completed: 5, failed: 1, blocked: 2, blocked_by: { inspector: 1, unstated: 1 }, outcome_unstated: 1 });
  assert.deepEqual(r.subresources.map((x) => x.address), reqs.slice(0, 5).map((q) => q.url));
  const js = r.subresources[1];
  assert.deepEqual(js, { address: `https://${HOST}/app.js`, type: "script", sha256: hex(enc("x()")), bytes: 3, body_as: "bytes", digest_by: "plane" });
  assert.equal(r.subresources[2].sha256, "undetermined");
  assert.match(r.subresources[2].digest_reason, /did not deliver/);
  /* data: the non-code, non-layout completed loads, origin against the page's host. */
  assert.deepEqual(r.data.map((d) => [d.address, d.origin, d.host, d.approximate === true, d.reported_by]), [
    [PAGE, "same_host", HOST, false, "renderer"],
    ["https://data.example.gov/items.json", "same_site", "data.example.gov", true, "renderer"],
    ["https://api.other.org/q", "third_party", "api.other.org", false, "renderer"],
  ]);
  assert.equal(r.data[1].sha256, hex(enc("[]")));
  /* No digests passed: every load reads undetermined saying so, a reported digest kept as its claim. */
  const claim = "e".repeat(64);
  const n = block(answer({ requests: [{ url: PAGE, type: "document", outcome: "completed", sha256: claim }] })).render;
  assert.deepEqual(n.subresources[0], { address: PAGE, type: "document", sha256: "undetermined",
    digest_reason: "the plane did not keep this render's subresource bytes", renderer_sha256: claim });
  assert.equal(n.data[0].sha256, "undetermined");
  /* The page host is navigated_to's, else pageUrl's. */
  const moved = block(answer({ navigated_to: "https://moved.example.org/p",
    requests: [{ url: "https://moved.example.org/d", type: "xhr", outcome: "completed" }] })).render;
  assert.equal(moved.data[0].origin, "same_host");
  const unparsed = block(answer({ navigated_to: "::not a url::",
    requests: [{ url: `https://${HOST}/d`, type: "xhr", outcome: "completed" }] })).render;
  assert.equal(unparsed.data[0].origin, "same_host");
  /* No requests recorded: all three null, and said. */
  const none = block(answer({ requests: null })).render;
  assert.deepEqual([none.requests, none.subresources, none.data], [null, null, null]);
  assert.ok(none.undetermined.some((u) => /did not record the page's requests/.test(u)));
});

test("R13: scripts_executed and third_party_executed are sorted origins, or 'undetermined', never []", () => {
  const r = block(answer({ scripts: [
    { url: `https://${HOST}/b.js` }, { url: `https://${HOST}/a.js` }, { url: "https://cdn.example.gov/x.js" },
    { url: "https://zz.analytics.net/t.js" }, { url: "https://aa.analytics.net/t.js" }, { url: "" }, { url: "::bad::" }, null,
  ] })).render;
  assert.deepEqual(r.scripts_executed, ["https://aa.analytics.net", "https://cdn.example.gov", `https://${HOST}`, "https://zz.analytics.net"]);
  /* same_site (cdn.example.gov beside portal.example.gov) counts as another origin. */
  assert.deepEqual(r.third_party_executed, ["https://aa.analytics.net", "https://cdn.example.gov", "https://zz.analytics.net"]);
  const e = block(answer({ scripts: [] })).render;
  assert.deepEqual([e.scripts_executed, e.third_party_executed], [[], []]);
  const u = block(answer({ scripts: null })).render;
  assert.deepEqual([u.scripts_executed, u.third_party_executed], ["undetermined", "undetermined"]);
  assert.ok(u.undetermined.some((x) => /could not record which scripts executed/.test(x)));
});

test("R14: render.wait and render.completeness follow R3's class, each gap stated", () => {
  const asked = { ...RENDER_DEFAULTS, wait: { until: "networkidle", timeout_ms: 12000 } };
  const met = block(answer(), { asked }).render;
  assert.deepEqual(met.wait, { asked: asked.wait, fired: "networkidle", fired_class: "condition" });
  assert.equal(met.completeness, "condition_met");
  assert.ok(!met.undetermined.some((u) => u.startsWith("completeness")));

  const to = block(answer({ wait: { fired: "timeout" } }), { asked }).render;
  assert.deepEqual([to.wait.fired_class, to.completeness], ["timeout", "undetermined"]);
  const s = to.undetermined.find((u) => u.startsWith("completeness"));
  for (const part of [RENDER_INCOMPLETE_READING, "12000 ms asked", "`networkidle` condition", "grade and its method"])
    assert.ok(s.includes(part), part);

  const settled = block(answer({ wait: { fired: "quiet_excluding_long_lived",
    long_lived: { older_than_s: 6, count: 1, urls: ["https://stream.example.com/ev"] } } }), { asked }).render;
  assert.deepEqual([settled.wait.fired_class, settled.completeness], ["settled", "settled_with_open_requests"]);
  assert.ok(settled.undetermined.some((u) => u.includes("settled; 1 long-lived request(s) still open were not waited for")));

  const odd = block(answer({ wait: { fired: "#root" } }), { asked }).render;
  assert.deepEqual([odd.wait.fired_class, odd.completeness], ["undetermined", "undetermined"]);
  assert.ok(odd.undetermined.some((u) => /fired on `#root`, which is neither/.test(u)));
  const silent = block(answer({ wait: null }), { asked }).render;
  assert.deepEqual([silent.wait.fired, silent.wait.fired_class, silent.completeness], [null, "undetermined", "undetermined"]);
  assert.ok(silent.undetermined.includes("wait.fired: not reported by the renderer"));
  assert.ok(silent.undetermined.some((u) => /did not report which wait ended the render/.test(u)));
});

test("R15: the render's facts are the renderer's or null with their absence stated; nothing defaulted", () => {
  const asked = { ...RENDER_DEFAULTS, locale: "fr-CA" };
  const r = block(answer(), { asked }).render;
  assert.equal(r.of, SHELL_SHA);
  assert.deepEqual([r.engine, r.engine_version, r.viewport, r.dpr, r.locale, r.timezone, r.elapsed_ms, r.navigated_to, r.status, r.at],
    ["HeadlessChrome", "124.0.6367.207", { width: 1280, height: 800 }, 1, "en-US", "UTC", 2345, PAGE, 200, AT]);
  assert.deepEqual(r.asked, { viewport: RENDER_DEFAULTS.viewport, dpr: 1, locale: "fr-CA", timezone: "UTC" });
  const bare = block({ ok: true, html: "<html></html>", viewport: { width: "1280", height: 800 }, dpr: "1", elapsed_ms: NaN }, { at: undefined }).render;
  for (const k of ["engine", "engine_version", "viewport", "dpr", "locale", "timezone", "elapsed_ms"]) {
    assert.equal(bare[k], null, k);
    assert.ok(bare.undetermined.includes(`${k}: not reported by the renderer`), k);
  }
  assert.deepEqual([bare.navigated_to, bare.status, bare.at], [null, null, null]);
});

test("R16: authority is determined only when asserted, all data same_host and no other origin ran code", () => {
  const r = block(answer()).render;
  const a = renderedAuthority({ asserted: "Example Council", render: r, at: AT });
  assert.equal(a.authority_state, "determined");
  assert.equal(a.authority, "Example Council");
  assert.match(a.authority_basis, new RegExp(`only from the page's own host.*${AT}`));
  assert.ok(!("authority_other_origins" in a));
});

test("R17: otherwise undetermined, the dated basis naming every reason and the other origins", () => {
  const r = block(answer({
    requests: [
      { url: PAGE, type: "document", outcome: "completed" },
      { url: "https://data.example.gov/x.json", type: "xhr", outcome: "completed" },
      { url: "https://api.vendor.net/y", type: "fetch", outcome: "completed" },
    ],
    scripts: [{ url: `https://${HOST}/a.js` }, { url: "https://cdn.vendor.net/b.js" }],
  })).render;
  const a = renderedAuthority({ asserted: null, render: r, at: AT });
  assert.equal(a.authority_state, "undetermined");
  assert.ok(!("authority" in a));
  for (const part of [`rendered capture, ${AT}`, "no assertion was supplied",
    "https://data.example.gov supplied data (same_site, which approximates and is not the host)",
    "https://api.vendor.net supplied data (third_party)", "https://cdn.vendor.net ran code",
    "A person resolves this by an assertion carrying its basis"])
    assert.ok(a.authority_basis.includes(part), part);
  assert.deepEqual(a.authority_other_origins, ["https://api.vendor.net", "https://cdn.vendor.net", "https://data.example.gov"]);

  /* Neither list known: the origins are undetermined, and both unknowns are named. */
  const u = renderedAuthority({ asserted: "Example Council", render: block(answer({ requests: null, scripts: null })).render, at: AT });
  assert.equal(u.authority_other_origins, "undetermined");
  assert.match(u.authority_basis, /which origins supplied data is undetermined.*which scripts executed is undetermined/);
  /* One list known: the union of what is known. */
  const half = renderedAuthority({ asserted: "Example Council", render: block(answer({ scripts: null })).render, at: AT });
  assert.deepEqual(half.authority_other_origins, []);
  assert.equal(half.authority_state, "undetermined");
});

test("R18: rendererFor chooses the service, then a browser binding, then names what is missing", async () => {
  const sent = [];
  const svc = rendererFor({ RENDERER: { fetch: async (u, init) => { sent.push([u, init.method, JSON.parse(init.body)]); return new Response(JSON.stringify({ ok: true, html: "<p>" })); } },
                            BROWSER: { fetch: async () => { throw new Error("not reached"); } } });
  assert.equal(svc.kind, "service");
  assert.deepEqual(await svc.render({ url: PAGE }), { ok: true, html: "<p>" });
  assert.deepEqual(sent, [["http://renderer/render", "POST", { url: PAGE }]]);
  const notJson = rendererFor({ RENDERER: { fetch: async () => new Response("oops", { status: 502 }) } });
  assert.deepEqual(await notJson.render({}), { ok: false, error: "the renderer answered HTTP 502 with no JSON" });
  const down = rendererFor({ RENDERER: { fetch: async () => { throw new Error("connection refused"); } } });
  const d = await down.render({});
  assert.equal(d.ok, false);
  assert.match(d.error, /could not be reached: connection refused/);

  const br = rendererFor({ BROWSER: { fetch: async () => new Response("no", { status: 503 }) } });
  assert.equal(br.kind, "browser-binding");
  const fails = await br.render({ url: PAGE, navigation_timeout_ms: 1000, wait: { timeout_ms: 1000 } });
  assert.equal(fails.ok, false);
  assert.match(fails.error, /refused a session: HTTP 503/);
  assert.deepEqual(rendererFor({ BROWSER: "not-a-fetcher" }), { kind: "browser-binding-without-driver", render: null });
  assert.deepEqual(rendererFor({ RENDERER: {} }), { kind: "none", render: null });
  assert.deepEqual(rendererFor({}), { kind: "none", render: null });
  assert.deepEqual(rendererFor(undefined), { kind: "none", render: null });
});

test("R47: pure, with no store or binding of its own: the same inputs give the same record", async () => {
  const a = answer();
  const one = JSON.stringify(block(a)), two = JSON.stringify(block(structuredClone(a)));
  assert.equal(one, two);
  const s1 = store(), s2 = store();
  assert.deepEqual(await keepRenderBodies({ requests: [{ url: PAGE, outcome: "completed", body_text: "x" }] }, s1),
                   await keepRenderBodies({ requests: [{ url: PAGE, outcome: "completed", body_text: "x" }] }, s2));
  /* Every byte kept went through the caller's own put. */
  assert.equal(s1.kept.size, 1);
});

test("R48: every hex digest on a rendered capture is the plane's over bytes it kept", async () => {
  const claim = "c".repeat(64);
  const reqs = [
    { url: `https://${HOST}/k`, type: "xhr", outcome: "completed", body_text: "kept", sha256: claim },
    { url: `https://${HOST}/r`, type: "xhr", outcome: "completed", sha256: claim },
  ];
  const s = store();
  const a = answer({ requests: reqs });
  const r = block(a, { digests: await keepRenderBodies(a, s) }).render;
  for (const x of [...r.subresources, ...r.data]) {
    if (/^[0-9a-f]{64}$/.test(x.sha256)) { assert.ok(s.kept.has(x.sha256)); assert.notEqual(x.sha256, claim); }
    else assert.equal(x.sha256, "undetermined");
  }
  assert.equal(r.subresources[1].renderer_sha256, claim);
  /* A digest a caller passes that is neither hex nor undetermined is not taken. */
  const forged = block(a, { digests: [{ sha256: "forged" }, null] }).render;
  assert.deepEqual(forged.subresources.map((x) => x.sha256), ["undetermined", "undetermined"]);
});

test("R49: what could not be observed is undetermined or null with its reason, never [] or a default", () => {
  const r = block({ ok: true, html: "<html></html>" }).render;
  assert.deepEqual([r.requests, r.data, r.subresources], [null, null, null]);
  assert.deepEqual([r.scripts_executed, r.third_party_executed], ["undetermined", "undetermined"]);
  assert.deepEqual([r.locale, r.viewport, r.engine], [null, null, null]);
  assert.equal(r.completeness, "undetermined");
  for (const re of [/requests/, /scripts/, /locale/, /completeness/]) assert.ok(r.undetermined.some((u) => re.test(u)), re);
});

test("R50: completeness and authority are separate axes: a timed-out same-host render is still determined", () => {
  const to = block(answer({ wait: { fired: "timeout" } })).render;
  assert.equal(to.completeness, "undetermined");
  assert.equal(renderedAuthority({ asserted: "Example Council", render: to, at: AT }).authority_state, "determined");
  /* and a complete render with a vendor's data is never determined as the host */
  const vendor = block(answer({ requests: [{ url: "https://vendor.example.com/d.json", type: "xhr", outcome: "completed" }] })).render;
  assert.equal(vendor.completeness, "condition_met");
  assert.equal(renderedAuthority({ asserted: "Example Council", render: vendor, at: AT }).authority_state, "undetermined");
  /* The record never carries a grade or method of its own to lower. */
  assert.ok(!("grade" in to) && !("method" in to));
  assert.ok(to.undetermined.some((u) => /keeps its grade and its method/.test(u)));
});
