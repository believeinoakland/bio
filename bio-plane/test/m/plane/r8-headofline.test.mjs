/* plane G91 (fix round 9; plan section 3, job 20; diagnosis-R8-watchdog.md Findings 1 and 4; K4807 (2), K4811 (4)), the platform check L: A SLOW CONSUMER AHEAD OF `pending-work` MUST NOT HOLD THE READING'S DUE TICK.
   On workerd under Miniflare, the plane's own Worker and `Store` with the REAL alarm (`r8-headofline-entry.mjs`); `FILE_SCANNER` is a service binding that answers `/scan` and `/render` after a stated delay and
   RECORDS each call's start and end as an ordered event, each end stating how many reading passes the object had completed by then (the object answers `/r8/state` while the scanner call is in flight). A ~1 MB
   text is uploaded through the real door (`POST /api?op=captureupload`); the object's alarm reads it and scans it. Counts and order only (R-CLOCK): no assertion reads a time from the object.
   RED BY NAME until the scheduler's budget and rotation (job 33) and file-safety's bounded scan (job 26) merge, green at plane-2's merge:
   - the 40 s scanner (HEAVY: run alone, five runs, R-NOLOAD): the first pass of the text precedes the first `scan-end`, every pass precedes the first `render-end`, and the scan still completes after the handler returned
     (its end is seen and its note is written; a call outlasting the budget is not abandoned and not started twice);
   - the 3 s scanner: counts only: a scan is made once, a pass is made, and the text is read;
   - the founder's `op=owedwork` asked every 500 ms never answers an `alarm_at` in the past (the test's own clock outside the object, as the bullet states). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./r8-headofline-entry.mjs", import.meta.url));
const ADMIN = "adm-r8";
/* the plan names ~1 MB; a 1 MB text is read INSIDE the request (the door's own reading, no ledger pass), so the head of the line has nothing to hold. 4 MB is the smallest size seen deferred to the ledger (R-FOUR (3)): the
   reading is then the ledger's, pass by pass, and a slow consumer ahead of `pending-work` holds its first one. */
const TEXT_BYTES = 4_000_060;
const LINE = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".") + "\n";
const textBody = () => { const n = Math.floor((TEXT_BYTES - 60) / 100); const parts = []; for (let i = 0; i < n; i++) parts.push(LINE(i)); parts.push("ENDMARKER" + " ".repeat(TEXT_BYTES - n * 100 - 9)); return Buffer.from(parts.join("")); };
const clean = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
  scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 });

/** one world: a Miniflare with the scanner stub answering after `scanMs`, and the ordered events it records */
function world({ scanMs, renderMs = scanMs }) {
  const events = []; let stub = null, seq = 0;
  const passes = async () => (await (await stub.fetch("http://do/r8/state")).json()).passes;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Headline", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: ADMIN, DAEMON_TOKEN: "dmn-r8", PROBE_TOKEN: "prb-r8" },
    durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r8-hol-")),
    serviceBindings: { FILE_SCANNER: async (req) => {
      const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
      if (u.pathname === "/scan") {
        events.push({ seq: ++seq, kind: "scan-start", targets: body.targets.length });
        await new Promise((r) => setTimeout(r, scanMs));
        events.push({ seq: ++seq, kind: "scan-end", passes: await passes() });
        return new Response(JSON.stringify({ ok: true, verdicts: body.targets.map((t) => clean(t.capture_sha)) }), { headers: { "content-type": "application/json" } });
      }
      if (u.pathname === "/render") {
        events.push({ seq: ++seq, kind: "render-start" });
        await new Promise((r) => setTimeout(r, renderMs));
        events.push({ seq: ++seq, kind: "render-end", passes: await passes() });
        // fixtures-generic: NOT_RENDERED the head-of-line probe needs the scanner's render to end in any refusal, held for `renderMs`; no code is asserted and the plane treats every refusal alike
        return new Response(JSON.stringify({ ok: false, code: "NOT_RENDERED" }), { status: 422, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true, name: "file-scanner", version: "1.0.0" }), { headers: { "content-type": "application/json" } });
    } },
  });
  return { mf, events, bind: async () => { const ns = await mf.getDurableObjectNamespace("STORE"); stub = ns.get(ns.idFromName("bio")); return stub; } };
}
const live = [];
after(() => Promise.all(live.map((m) => m.dispose().catch(() => {}))));

const sessionOf = async (stub, as = "member") => (await (await stub.fetch(`http://do/r8/session?as=${as}`)).json()).token;
async function upload(mf, stub) {
  const token = await sessionOf(stub);
  const r = await mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: textBody() });
  const j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j).slice(0, 300));
  const up = j.result ?? j;
  /* the capture screen then files the document, so the reading has a home */
  const filed = await (await stub.fetch("http://do/r8/file", { method: "POST", body: JSON.stringify({ document: up.document, sha: up.capture.sha256, bytes: up.capture.bytes }) })).json();
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
  return up;
}
const owedwork = async (mf, token) => { const r = await mf.dispatchFetch("http://plane/api/?op=owedwork", { headers: { authorization: `Bearer ${token}` } }); const j = await r.json(); return { at: Date.now(), body: j.result ?? j }; };

/** run one world until the scan has ended and the text has `wantPasses` completed passes (the reading's retries back off, so its end is not waited for); the founder's owedwork asked every 500 ms; returns what was seen */
async function runWorld(scanMs, { maxPolls = 400, wantPasses = 2 } = {}) {
  const w = world({ scanMs }); live.push(w.mf);
  const stub = await w.bind();
  const up = await upload(w.mf, stub);
  assert.ok(up.ok !== false, JSON.stringify(up).slice(0, 300));
  const founder = await sessionOf(stub, "founder"), asks = []; let last = null;
  for (let polls = 0; polls < maxPolls; polls++) {
    asks.push(await owedwork(w.mf, founder));
    last = await (await stub.fetch("http://do/r8/rows")).json();
    if (process.env.R8_DEBUG && polls % 10 === 0) console.log("# poll", polls, JSON.stringify({ results: (await (await stub.fetch("http://do/r8/state")).json()).results, passes: last.passes, pending: last.pending.map((p) => [p.kind, p.attempts, p.final_why, p.last_why]), events: w.events, alarm: last.alarm, health: last.health }));
    const read = last.pending.length === 0 || last.passes >= wantPasses;
    const scanned = w.events.some((e) => e.kind === "scan-end");
    if (read && scanned) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const notes = await (await stub.fetch("http://do/r8/notes")).json();
  return { events: w.events, asks, last, notes, passes: last.passes };
}

test("R93 G91 L (3 s scanner, counts only): the text uploaded through the real door is read pass by pass and scanned: two passes are made beside the scan, the scan is made once and its verdict written", { timeout: 300_000 }, async () => {
  const r = await runWorld(3_000);
  assert.ok(r.passes >= 1, `passes ${r.passes}`);
  assert.equal(r.events.filter((e) => e.kind === "scan-start").length, 1, "the scan is made once");
  assert.equal(r.events.filter((e) => e.kind === "scan-end").length, 1);
  assert.ok(r.passes >= 2, "the reading goes on pass by pass beside the scan");
  assert.ok(r.notes.notes >= 1, "the scan's verdict is written");
});

test("R93 G91 L (40 s scanner, HEAVY: run alone, five runs): the first pass of the text precedes the first scan-end; every pass precedes the first render-end, if one is made; the scan completes after the handler returned and is written", { timeout: 900_000 }, async () => {
  const r = await runWorld(40_000);
  const end = r.events.find((e) => e.kind === "scan-end");
  assert.ok(end, "the scan ended (a call outlasting the budget is not abandoned)");
  assert.ok(end.passes >= 1, `by the first scan-end the text had ${end.passes} completed passes: the slow scan held the reading's due tick`);
  const render = r.events.find((e) => e.kind === "render-end");
  if (render) assert.equal(render.passes, r.passes, "every pass precedes the first render-end");
  assert.equal(r.events.filter((e) => e.kind === "scan-start").length, 1, "the scan is not started twice");
  assert.ok(r.notes.notes >= 1, "the scan still completes after the handler returned: its verdict is written");
  assert.ok(r.passes >= 2, "the reading goes on after the scan ended");
});

test("R80 G91 L: the founder's owedwork, asked every 500 ms while a 12 s scan holds the object, never answers an alarm_at in the past", { timeout: 300_000 }, async () => {
  const r = await runWorld(12_000);
  const answered = r.asks.map((a) => a.body).filter((b) => b && Object.hasOwn(b, "alarm_at"));
  assert.ok(answered.length >= 5, `the administrator's answers carry alarm_at (${answered.length} of ${r.asks.length})`);
  const past = r.asks.filter((a) => a.body && typeof a.body.alarm_at === "number" && a.body.alarm_at < a.at - 2_000);
  assert.deepEqual(past.map((a) => [a.body.alarm_at, a.at]), [], "an alarm_at in the past (more than the poll's own 2 s of slack)");
  /* workerd clears the object's alarm while `alarm()` runs (getAlarm() answers null until the firing sets the next one): a null `alarm_at` is the platform's, true only of an answer
     that says a firing is in progress (`running_since` set); with no firing in progress it would be a lost alarm (K4787, K4966, K5180) */
  const nulls = answered.filter((b) => b.alarm_at === null && !Number.isFinite(b.running_since)).length;
  assert.equal(nulls, 0, `alarm_at was null in ${nulls} answers with no firing in progress`);
});
