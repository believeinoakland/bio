/* screens-intake R5, R6: the `open-file` screen on the real served page: its reads, its three states and its five acts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, bytes, ADMIN, rawKeys } from "./page.mjs";

const SHA = "f".repeat(64);
const NOTE = { note_id: 1, kind: "scan", tool: "Built-in scanner", engine: "ClamAV", engine_version: "1.4.2", scanned_at: "2026-10-06T03:10:00Z", result: "clean", findings: [] };
const BASE = { verdictnotes: ok({ ok: true, notes: [NOTE] }), scanfindings: ok({ ok: true, findings: [] }) };
const STATES = {
  low: { threatof: ok({ ok: true, threat: "low", reasons: [], scan_hold: null }), originalstate: ok({ may_open: true, path: "plain", why: null }) },
  warned: { threatof: ok({ ok: true, threat: "high", reasons: [{ code: "active:macro", translation: "It contains a macro." }], scan_hold: null }),
            originalstate: ok({ may_open: true, path: "warned", why: null }) },
  deeper: { threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }), originalstate: ok({ may_open: true, path: "deeper", why: null }) },
  closed: { threatof: ok({ ok: true, threat: "high", reasons: [], scan_hold: null }), originalstate: ok({ may_open: false, path: null, why: "NOT_SCANNED" }) },
  held: { threatof: ok({ ok: true, threat: "high", reasons: [{ code: "scan_hold", translation: "A scanner found something." }], scan_hold: { names: ["X"] } }),
          originalstate: ok({ may_open: false, path: null, why: "SCAN_HOLD" }),
          scanfindings: ok({ ok: true, findings: [{ captureSha: SHA, findings: ["Xls.Downloader.Agent-917"], held: true }, { captureSha: "0".repeat(64), findings: ["Other"] }] }) },
};
const at = (k, plane = {}, o = {}) => open(`/app/open-file/${SHA}`, { plane: { ...BASE, ...STATES[k], ...plane }, ...o });

test("R5 reads threatof, originalstate, verdictnotes and scanfindings for the capture; scanstatus only for a session that administers", async () => {
  const p = await at("low");
  for (const op of ["threatof", "originalstate", "verdictnotes"]) assert.equal(p.byOp(op)[0].query.capture, SHA, op);
  assert.equal(p.byOp("scanfindings").length, 1);
  assert.equal(p.byOp("scanstatus").length, 0);
  const a = await at("low", { scanstatus: ok({ queued: 3, overdue: 1, held: 0 }) }, { me: ADMIN });
  assert.equal(a.byOp("scanstatus").length, 1);
  assert.match(text(a), /3 files waiting for a check, 1 overdue\./);
  /* control: no capture named, nothing read */
  const n = await open("/app/open-file");
  assert.equal(n.byOp("threatof").length, 0);
  assert.doesNotMatch(text(n), /Name a file/);
});

test("R5 a low-risk file draws openoriginal with its checks, and offers no warned path and no release", async () => {
  const p = await at("low");
  assert.ok(main(p).querySelector('[data-risk="low"]'));
  assert.ok(btn(p, "openoriginal"));
  assert.match(text(p), /Built-in scanner · ClamAV 1\.4\.2: clean/);
  assert.match(text(p), /checked on 6 October 2026/);
  assert.equal(btn(p, "openwithwarning"), null);
  assert.equal(btn(p, "releasescanhold"), null);
  assert.deepEqual(rawKeys(p), []);
});

test("R5 a high-risk file draws safeview first and deepercheck; openwithwarning only on the warned path, sent only with both confirmations", async () => {
  const p = await at("warned", { openwithwarning: bytes("doc-bytes", "application/msword") });
  const h = html(p);
  assert.ok(main(p).querySelector('[data-risk="high"]'));
  assert.ok(h.indexOf('data-act="safeview"') < h.indexOf('data-act="deepercheck"'));
  assert.ok(h.indexOf('data-act="safeview"') < h.indexOf('data-act="openwithwarning"'));
  assert.match(text(p), /It contains a macro\./);
  fill(p, { "co-device": true });
  const r = await press(p, "openwithwarning");
  assert.equal(p.byOp("openwithwarning").length, 0, "nothing sent before both are ticked");
  assert.match(r.slot().textContent, /Tick both before it opens/);
  fill(p, { "co-device": true, "co-macros": true });
  await press(p, "openwithwarning");
  const q = p.byOp("openwithwarning")[0];
  assert.equal(q.query.capture, SHA);
  assert.deepEqual(q.body, { warned: { own_device: true, no_macros: true } });
  assert.equal(p.files.length, 1, "handed to the browser as a file");
  /* control: no path open (not checked this week): no warned path, no original; the reason stated */
  const c = await at("closed");
  assert.equal(btn(c, "openwithwarning"), null);
  assert.equal(btn(c, "openoriginal"), null);
  assert.match(text(c), /can't be opened now: NOT_SCANNED/);
  /* the deeper path (a fresh clean deeper check) opens the original by override */
  const d = await at("deeper", { openoriginal: bytes("pdf") });
  await press(d, "openoriginal");
  assert.equal(d.byOp("openoriginal")[0].query.override, "1");
});

test("R5 a file held after a finding: no way to open the original, the finding named, releasescanhold with a reason", async () => {
  const p = await at("held", { releasescanhold: ok({ ok: true, state: "pending_second" }) });
  assert.ok(main(p).querySelector('[data-risk="held"]'));
  assert.equal(btn(p, "openoriginal"), null);
  assert.equal(btn(p, "openwithwarning"), null);
  assert.match(text(p), /What was found: Xls\.Downloader\.Agent-917/);
  assert.doesNotMatch(text(p), /Other/, "another capture's finding is not this file's");
  await press(p, "releasescanhold", { reason: "The city's own file." });
  const q = p.byOp("releasescanhold")[0];
  assert.equal(q.query.capture, SHA);
  assert.deepEqual(q.body, { reason: "The city's own file." });
  assert.match(text(p), /A second member's reason releases it/);
  const r = await at("held", { releasescanhold: ok({ ok: true, state: "released", by: ["a", "b"] }) });
  await press(r, "releasescanhold", { reason: "Second." });
  assert.match(text(r), /Released: the original can be opened again/);
  /* control: offered only while file-safety answers the file held */
  assert.equal(btn(await at("warned"), "releasescanhold"), null);
});

test("R5 the safe view: marked machine work, a safe copy derived from the original, cite the original; a sheet drawn as data", async () => {
  const p = await at("warned", { safeview: ok({ ok: true, kind: "data", derived: true, sheets: [{ name: "FY22", cells: [{ ref: "A1", value: "Transfer", type: "s" }] }] }) });
  assert.ok(main(p).querySelector('[data-origin="machine"]'));
  assert.match(text(p), /Derived · a safe copy of the original\. Cite the original, never the safe copy/);
  await press(p, "safeview", { reason: "to read it" });
  assert.equal(p.byOp("safeview")[0].query.capture, SHA);
  assert.match(html(p), /Sheet: FY22[\s\S]*<td>A1<\/td><td>Transfer<\/td>/);
  assert.equal(p.files.length, 0, "a sheet is drawn, not downloaded");
  const q = await at("warned", { safeview: bytes("%PDF") });
  await press(q, "safeview", { reason: "to read it" });
  assert.equal(q.files.length, 1);
  assert.match(text(q), /The safe copy is ready/);
  /* a refusal is drawn with the owner's words */
  const r = await at("warned", { safeview: refused("SAFE_VIEW_PENDING", "The safe view is being made.") });
  await press(r, "safeview", { reason: "to read it" });
  assert.match(text(r), /The safe view is being made\./);
});

test("R5 deepercheck asks for the capture and draws its state", async () => {
  const p = await at("warned", { deepercheck: ok({ ok: true, state: "queued", check_id: "c1" }) });
  await press(p, "deepercheck", { reason: "check it" });
  assert.equal(p.byOp("deepercheck")[0].query.capture, SHA);
  assert.match(text(p), /Deeper check: asked for, waiting its turn/);
});

test("R6 opening the original is a download under the session header, its address naming only the capture; its object address released; no link carries a token", async () => {
  const p = await at("low", { openoriginal: bytes("%PDF-1.7") });
  await press(p, "openoriginal");
  const q = p.byOp("openoriginal")[0];
  assert.deepEqual(Object.keys(q.query).sort(), ["capture", "op"]);
  assert.equal(q.headers.Authorization, "Bearer tok-1");
  assert.doesNotMatch(q.url, /tok-1/);
  assert.equal(p.files.length, 1);
  assert.ok(p.objectUrls.every((u) => u.released), "the object address is released");
  assert.match(text(p), /handed to your browser as a file/);
  for (const k of Object.keys(STATES)) assert.doesNotMatch((await at(k)).root().innerHTML, /tok-1/);
  /* a refusal is drawn beside the act with the owner's words, and nothing is saved */
  const r = await at("low", { openoriginal: refused("SCAN_PENDING", "It is being checked.") });
  await press(r, "openoriginal");
  assert.equal(r.files.length, 0);
  assert.match(text(r), /It is being checked\./);
});
