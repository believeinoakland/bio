/* journey-check R21 (the carried states beside the design's), R24 (the published frame): over the design mock at the checkout's own
   commit, and a fixture instance, each with a control that holds. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { browser } from "../../../src/journey-check/run.mjs";
import { Walk, FAIL } from "../../../src/journey-check/walker.mjs";
import { designMock, WIDTHS } from "../../../src/journey-check/design.mjs";
import { CARRIED_STATES, walkStates } from "../../../src/journey-check/states.mjs";
import { walkPublished } from "../../../src/journey-check/published.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const COMMIT = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
let B, dir, mock;
before(async () => { B = await browser(); dir = mkdtempSync(join(tmpdir(), "jc-frames-")); mock = await designMock(B, { dir: join(dir, "design"), commit: COMMIT }); });
after(async () => { await mock?.close(); await B?.close(); rmSync(dir, { recursive: true, force: true }); });

test("R21: the design mock offers every carried state the walk pairs, drawn by its own control at both widths; control: a state the mock does not offer fails by its name", { timeout: 300000 }, async () => {
  for (const st of CARRIED_STATES) for (const w of WIDTHS) {
    const d = await mock.drawState(st.screen, st.control, st.option, w);
    assert.ok(d.png, `${st.screen}, ${st.state} at ${w}px: ${d.why}`);
  }
  const walk = new Walk({ out: join(dir, "a"), arm: "live" });
  await walkStates(walk, B, mock, { out: walk.out, states: [{ screen: "document", state: "compare", control: "mk-dst", option: "compare" }] });
  assert.deepEqual(walk.failures.map((f) => f.kind), [FAIL.DESIGN]);
  assert.match(walk.failures[0].detail, /^document, compare: the mock's mk-dst offers no state like \/compare\//);
});

test("R21: a state the live screen reaches is paired at both widths; control: a state the live instance does not hold is a note, never a pass and never a failure", { timeout: 300000 }, async () => {
  const walk = new Walk({ out: join(dir, "b"), arm: "live" });
  const ctx = await B.newContext(); const page = await ctx.newPage();
  const states = CARRIED_STATES.filter((s) => s.screen === "project").slice(0, 2);
  const written = await walkStates(walk, B, mock, { out: walk.out, page, base: "http://x", states,
    reach: { [`${states[0].screen}, ${states[0].state}`]: async (p) => { await p.setContent("<main>the live state</main>"); return true; } } });
  await ctx.close();
  assert.equal(written.length, 2, "one state, two widths");
  for (const f of written) assert.ok(existsSync(join(walk.out, f)), f);
  assert.deepEqual(walk.failures, []);
  assert.deepEqual(walk.notes, [`${states[1].screen}, ${states[1].state}: not reached on this instance`]);
});

/* a fixture instance holding a published case, drawn as the screen draws it: the minimum strength, the filtered view's notice and
   its way back, a finding's page, and a press on Print the case; `bad` makes the minimum a request */
function publishedInstance({ bad = false } = {}) {
  const seen = [];
  const page = (body) => `<!doctype html><html><head><title>Published</title><link rel="stylesheet" href="/app/assets/civicsmith.css"></head><body><main id="cs-main" data-screen="published">${body}</main></body></html>`;
  const whole = `<h1>Case</h1><label for="min">${word("screen.published.show.only.findings.this.strong")}</label><select id="min"><option>Any</option><option>Firm</option></select>
<p id="notice" hidden>${word("screen.published.this.is.part.of.the.many", { n: 1, total: 3, hidden: 2 })} <a id="back" href="/app/published/c1">${word("screen.published.back.to.the.whole.case")}</a></p>
<a href="/app/published/c1/finding/1">${word("screen.published.finding", { n: 1 })}</a>
<button id="print">${word("act.owed_pubprint.label.published")}</button>
<footer>${word("screen.published.signed.for.lakeshore.tenants.by", { team: "Lakeshore Tenants", member: "Rosa", date: "1 October 2026", fingerprint: "ab12" })}</footer>
<script>document.getElementById("min").onchange = () => { ${bad ? 'fetch("/api/?op=minimum", { method: "POST", body: "{}" });' : ""} document.getElementById("notice").hidden = false; };
document.getElementById("print").onclick = () => window.print();</script>`;
  const server = createServer((req, res) => {
    seen.push(`${req.method} ${req.url}${req.headers.authorization ? " AUTH" : ""}`);
    const send = (s, t, b) => { res.writeHead(s, { "content-type": t }); res.end(b); };
    if (req.url.startsWith("/app/assets/")) return send(200, "text/css", "main{}");
    if (req.url.startsWith("/api/")) return send(200, "application/json", '{"ok":true}');
    if (req.url.includes("/finding/")) return send(200, "text/html", page("<h1>Finding 1</h1>"));
    return send(200, "text/html", page(whole));
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({ base: `http://127.0.0.1:${server.address().port}`, seen, close: () => server.close() })));
}

test("R24: with a published case on the instance, the live arm opens it signed out at both widths, pairs it, sets a minimum, opens a finding's page and presses Print the case with print stubbed; it sends no Authorization header", { timeout: 300000 }, async () => {
  const inst = await publishedInstance();
  try {
    const walk = new Walk({ out: join(dir, "c"), arm: "live" });
    walk.copyHost = new URL(inst.base).host;
    await walkPublished(walk, B, inst.base, mock, { path: "/app/published/c1", out: walk.out });
    assert.deepEqual(walk.failures, [], walk.failures.map((f) => f.detail).join(" | "));
    assert.equal(walk.pairs.filter((p) => /^pairs\/published-(1280|390)\.png$/.test(p)).length, 2);
    assert.ok(walk.steps.some((s) => /Print the case/.test(s.label) && s.ok));
    assert.ok(!inst.seen.some((x) => /AUTH$/.test(x)), "no request carried an Authorization header");
  } finally { inst.close(); }
});

test("R24 control: a page that sets a minimum by a request fails; with no case the note is written and nothing is walked", { timeout: 300000 }, async () => {
  const inst = await publishedInstance({ bad: true });
  try {
    const walk = new Walk({ out: join(dir, "d"), arm: "live" });
    walk.copyHost = new URL(inst.base).host;
    await walkPublished(walk, B, inst.base, mock, { path: "/app/published/c1", out: walk.out });
    assert.ok(walk.failures.some((f) => /setting a minimum strength sent a request/.test(f.detail)), JSON.stringify(walk.failures));
  } finally { inst.close(); }
  const none = new Walk({ out: join(dir, "e"), arm: "live" });
  await walkPublished(none, B, "http://127.0.0.1:9", mock, { path: "", out: none.out });
  assert.deepEqual(none.notes, ["published: no case on this instance"]);
  assert.deepEqual(none.steps, []);
});
