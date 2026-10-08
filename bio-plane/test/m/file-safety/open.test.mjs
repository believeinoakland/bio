/* file-safety R8–R10 (DEC-173): opening the original, its state without opening, and no record of who opened or confirmed.
   At the module's interface: `openOriginal` answers the bytes as capture's R21 get serves them, or its refusal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, DAY } from "./fixture.mjs";
import { FILE_SAFETY_CHECKS, RESCAN_INTERVAL_MS, DEEPER_CHECK_FRESH_MS, fileSafetyOps } from "../../../src/file-safety/index.mjs";

const WARNED = { own_device: true, no_macros: true };
const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const opened = async (r, s, bytes) => {
  assert.ok(r instanceof Response, JSON.stringify(r));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-capture-sha256"), s);
  assert.equal(r.headers.get("content-type"), "application/octet-stream");
  assert.deepEqual(new Uint8Array(await r.arrayBuffer()), bytes);
};
const refused = (r, code) => {
  assert.ok(!(r instanceof Response), `${code}: it opened`);
  assert.deepEqual({ ok: r.ok, code: r.code, check: r.check, translation: r.translation }, { ok: false, code, ...row(code) });
};

test("R8: a low file opens as capture.getCapture serves it when a ClamAV clean note is newer than a week; else the scan before first opening runs on demand: clean opens, found places the hold and answers SCAN_HOLD, not_scanned or unknown answer NOT_SCANNED with the reason, a scan not finished within the call SCAN_PENDING; with no scanner bound the bytes open, stated not_scanned SCANNER_ABSENT; NO_SUCH_CAPTURE and the sight refusal (NO_SUCH_CAPTURE, K2098) first", async () => {
  let next = { result: "clean" };
  const w = world({ scan: { clamav: () => next } });
  const bytes = pdf(false, "low");
  const s = await w.capture(bytes);
  /* the first two refusals */
  refused(await w.fs.openOriginal({ captureSha: sha("not held"), viewer: "member:m1" }), "NO_SUCH_CAPTURE");
  w.project("PROJ-1", "m1"); w.home(s, "INFO-P", { project: "PROJ-1" });
  assert.equal((await w.fs.openOriginal({ captureSha: s, viewer: "member:m2" })).code, "NO_SUCH_CAPTURE");
  /* no note yet: the scan runs on demand, clean, and it opens; the note is written */
  await opened(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" }), s, bytes);
  assert.equal(w.calls("/scan").length, 1);
  assert.deepEqual(w.fs.verdictNotes({ captureSha: s }).notes.map((n) => [n.kind, n.result]), [["scan", "clean"]]);
  /* a clean note within the week: no scan */
  w.tick(RESCAN_INTERVAL_MS - 1000);
  await opened(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" }), s, bytes);
  assert.equal(w.calls("/scan").length, 1);
  /* past the week: scanned again; each outcome */
  w.tick(2000);
  next = { result: "not_scanned", reason: "SIGNATURES_STALE" };
  const ns = await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" });
  refused(ns, "NOT_SCANNED");
  assert.equal(ns.not_scanned, "SIGNATURES_STALE");
  next = { result: "unknown", detail: "LIMIT:MaxRecursion" };
  assert.equal((await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" })).not_scanned, "LIMIT:MaxRecursion");
  next = "hang";
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" }), "SCAN_PENDING");
  next = { result: "found", findings: ["Pdf.Exploit.New-1"] };
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" }), "SCAN_HOLD");
  assert.deepEqual((await w.fs.threatOf({ captureSha: s })).scan_hold.names, ["Pdf.Exploit.New-1"], "the found verdict placed the hold");
  /* no scanner bound (K1928 Q4): a low file opens, stated */
  const n = world({ bound: false });
  const t = await n.capture(bytes);
  const r = await n.fs.openOriginal({ captureSha: t, viewer: "member:m1" });
  await opened(r, t, bytes);
  assert.equal(r.headers.get("x-file-safety-not-scanned"), "SCANNER_ABSENT");
});

test("R8 (DEC-173): a high file, in order: SCAN_HOLD (no path opens a held file); the deeper path (override, a deeper check that ended clean under 24 hours ago with no found note since); the warned path (warned exactly {own_device: true, no_macros: true}, else WARNING_NOT_CONFIRMED), opening with a ClamAV clean note newer than a week, else after the scan before first opening (SCAN_PENDING, a found holds, clean opens), a scan that cannot run answering SCAN_STALE (a clean note older than a week) or NOT_SCANNED; never opened with no scanner bound; reached by neither path, SAFE_VIEW_ONLY", async () => {
  let next = { result: "clean" };
  const w = world({ scan: { clamav: () => next, provider: { scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  const bytes = pdf(true, "high");
  const s = await w.capture(bytes);
  assert.equal((await w.fs.threatOf({ captureSha: s })).threat, "high");
  /* neither path */
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" }), "SAFE_VIEW_ONLY");
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", override: true }), "SAFE_VIEW_ONLY");
  /* the warned path's confirmations, exactly */
  for (const warned of [{}, { own_device: true }, { own_device: true, no_macros: "yes" }, { own_device: true, no_macros: true, extra: 1 }, [true, true], "yes", true])
    refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned }), "WARNING_NOT_CONFIRMED");
  assert.equal(w.calls("/scan").length, 0, "a refused confirmation scans nothing");
  /* warned, no clean note: the scan runs on demand; pending, then clean opens */
  next = "hang";
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED }), "SCAN_PENDING");
  next = { result: "clean" };
  await opened(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED }), s, bytes);
  /* within the week the clean note opens it without a scan */
  const scans = w.calls("/scan").length;
  w.tick(RESCAN_INTERVAL_MS - 1000);
  await opened(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED }), s, bytes);
  assert.equal(w.calls("/scan").length, scans);
  /* older than a week and the scan cannot run: SCAN_STALE; with no clean note at all, NOT_SCANNED */
  w.tick(2000);
  next = { result: "not_scanned", reason: "SIGNATURES_ABSENT" };
  const st = await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", warned: WARNED });
  refused(st, "SCAN_STALE");
  assert.equal(st.not_scanned, "SIGNATURES_ABSENT");
  const fresh = await w.capture(pdf(true, "never clean"));
  next = { result: "unknown", detail: "LIMIT:x" };
  refused(await w.fs.openOriginal({ captureSha: fresh, viewer: "member:m1", warned: WARNED }), "NOT_SCANNED");
  /* the deeper path: a fresh clean deeper check opens it with override, to any member who may see it */
  next = { result: "clean" };
  await w.tool("scanii");
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  const d = await w.fs.deeperBatch({});
  assert.equal(d.done[0].result, "clean");
  await opened(await w.fs.openOriginal({ captureSha: s, viewer: "member:m2", override: true }), s, bytes);
  /* not after 24 hours */
  w.tick(DEEPER_CHECK_FRESH_MS + 1);
  refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m2", override: true }), "SAFE_VIEW_ONLY");
  /* a found note since the deeper check closes the deeper path, and a hold closes every path */
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  await w.fs.deeperBatch({});
  next = { result: "found", findings: ["Pdf.Exploit.Later"] };
  w.tick(RESCAN_INTERVAL_MS + 1);
  await w.fs.scanBatch({});
  w.tick(-RESCAN_INTERVAL_MS);
  for (const args of [{ override: true }, { warned: WARNED }, {}]) refused(await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", ...args }), "SCAN_HOLD");
  /* no scanner bound: never for a high file (K1928 Q4 not extended) */
  const n = world({ bound: false });
  const t = await n.capture(bytes);
  const r = await n.fs.openOriginal({ captureSha: t, viewer: "member:m1", warned: WARNED });
  refused(r, "NOT_SCANNED");
  assert.equal(r.not_scanned, "SCANNER_ABSENT");
  /* `op=openwithwarning` serves the warned path, `op=openoriginal` the deeper one */
  const k = world();
  const u = await k.capture(bytes);
  const op = (name, body) => fileSafetyOps(k.fs, new URL(`http://x/${name}?capture=${u}&viewer=member%3Am1`), body, k.env)[name]();
  refused(await op("openoriginal", {}), "SAFE_VIEW_ONLY");
  await opened(await op("openwithwarning", { warned: WARNED }), u, bytes);
});

test("R9: `originalState` answers {may_open, path, why}, what R8 would answer now, without opening, scanning or serving anything: path plain for a low file, deeper for a high file with a fresh clean deeper check (tried first), warned for one the warned path opens after both confirmations, null with R8's refusal otherwise", async () => {
  let next = { result: "clean" };
  const w = world({ scan: { clamav: () => next, provider: { scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  const low = await w.capture(pdf(false, "l"));
  const high = await w.capture(pdf(true, "h"));
  const st = async (s, v = "member:m1") => { const r = await w.fs.originalState({ captureSha: s, viewer: v }); return [r.may_open, r.path, r.why]; };
  assert.deepEqual(await st(low), [true, "plain", null]);
  assert.deepEqual(await st(high), [true, "warned", null]);
  assert.equal(w.calls("/scan").length, 0, "nothing was scanned");
  assert.equal(w.rows("SELECT * FROM fs_notes").length, 0, "nothing was written");
  assert.equal(w.bucket.calls.filter((c) => c[0] === "put").length, 2, "nothing was stored but the captures");
  /* a fresh clean deeper check: deeper */
  await w.tool("scanii");
  w.fs.requestDeeperCheck({ captureSha: high, viewer: "member:m1" });
  await w.fs.deeperBatch({});
  assert.deepEqual(await st(high), [true, "deeper", null]);
  /* a scan hold: no path */
  next = { result: "found", findings: ["Win.Trojan.H"] };
  w.tick(RESCAN_INTERVAL_MS + 1);
  await w.fs.scanBatch({});
  assert.deepEqual(await st(high), [false, null, "SCAN_HOLD"]);
  assert.deepEqual(await st(low), [false, null, "SCAN_HOLD"]);
  /* no scanner bound: a low file still opens (stated); a high one has no path */
  const n = world({ bound: false });
  const a = await n.capture(pdf(false, "nl")), b = await n.capture(pdf(true, "nh"));
  const sa = await n.fs.originalState({ captureSha: a, viewer: "member:m1" });
  assert.deepEqual([sa.may_open, sa.path, sa.why, sa.stated], [true, "plain", null, { not_scanned: "SCANNER_ABSENT" }]);
  const sb = await n.fs.originalState({ captureSha: b, viewer: "member:m1" });
  assert.deepEqual([sb.may_open, sb.path, sb.why], [false, null, "NOT_SCANNED"]);
  /* the refusals R8 answers first */
  assert.equal((await w.fs.originalState({ captureSha: sha("none"), viewer: "member:m1" })).code, "NO_SUCH_CAPTURE");
});

test("R10 (K1892; DEC-173 (4)): no record of who opened, downloaded or asked about which file: two members open files, one by the warned path, ask for notes, grades, states, safe views and a deeper check, and neither member's id nor any confirmation is in any row this module wrote, any line it logged or any record it forwarded", async () => {
  const w = world({ scan: { provider: { scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  await w.tool("scanii");
  await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  const low = await w.capture(pdf(false, "l")), high = await w.capture(pdf(true, "h"));
  const lines = [];
  const was = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  for (const k of Object.keys(was)) console[k] = (...a) => lines.push(a.map(String).join(" "));
  let forwarded;
  try {
    for (const m of ["member:alice", "member:bob"]) w.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m.slice(7));
    await w.fs.openOriginal({ captureSha: low, viewer: "member:alice" });
    await w.fs.openOriginal({ captureSha: high, viewer: "member:bob", warned: { own_device: true, no_macros: true } });
    for (const v of ["member:alice", "member:bob"]) {
      w.fs.verdictNotes({ captureSha: high, viewer: v });
      await w.fs.threatOf({ captureSha: high, viewer: v });
      await w.fs.originalState({ captureSha: high, viewer: v });
      await w.fs.safeView({ captureSha: high, viewer: v });
    }
    w.fs.requestDeeperCheck({ captureSha: high, viewer: "member:bob" });
    await w.fs.deeperBatch({});
    await w.fs.renderBatch({});
    await w.fs.safeView({ captureSha: low, viewer: "member:alice" });
    const f = await w.fs.forwardSecurityCounts({ from: "2026-10-08T00:00:00Z", to: "2026-10-09T00:00:00Z" });
    forwarded = JSON.stringify(w.calls("/provider/forward").map((c) => c.body.record));
    assert.equal(f.sent.length, 1);
  } finally { Object.assign(console, was); }
  const written = JSON.stringify(w.tables());
  for (const what of ["alice", "bob", "own_device", "no_macros"]) {
    assert.doesNotMatch(written, new RegExp(what), `${what} in a row`);
    assert.doesNotMatch(lines.join("\n"), new RegExp(what), `${what} in a log line`);
    assert.doesNotMatch(forwarded, new RegExp(what), `${what} in a forwarded record`);
  }
  /* and no forwarded record names a file */
  for (const s of [low, high]) assert.doesNotMatch(forwarded, new RegExp(s.slice(0, 16)));
  /* negative control: the rows are read (the administrator who added the tools is named beside no file) */
  assert.match(written, /boss/);
});
