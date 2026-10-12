/* screens-intake R5, R6: the `open-file` screen's reads, its states and its five acts, over the stand-in kit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { pageScreen, kit, viewOf, press, ok } from "./kit.mjs";

const S = pageScreen(SCREENS.find((s) => s.id === "open-file"));
const draw = (view, opts) => S.render(kit(S, view, opts).cs, view);
const SHA = "f".repeat(64);
const NOTE = { note_id: 1, kind: "scan", tool: "Built-in scanner", engine: "ClamAV", engine_version: "1.4.2", scanned_at: "2026-10-06T03:10:00Z", result: "clean", findings: [] };
const states = {
  low: { threat: ok({ threat: "low", reasons: [], scan_hold: null }), state: ok({ may_open: true, path: "plain", why: null }) },
  highWarned: { threat: ok({ threat: "high", reasons: [{ code: "active:macro", translation: "It contains a macro." }], scan_hold: null }),
                state: ok({ may_open: true, path: "warned", why: null }) },
  highDeeper: { threat: ok({ threat: "high", reasons: [], scan_hold: null }), state: ok({ may_open: true, path: "deeper", why: null }) },
  highClosed: { threat: ok({ threat: "high", reasons: [], scan_hold: null }), state: ok({ may_open: false, path: null, why: "NOT_SCANNED" }) },
  held: { threat: ok({ threat: "high", reasons: [{ code: "scan_hold", translation: "A scanner found something." }], scan_hold: { names: ["Xls.Downloader"] } }),
          state: ok({ may_open: false, path: null, why: "SCAN_HOLD" }),
          findings: ok({ findings: [{ captureSha: SHA, findings: ["Xls.Downloader.Agent-917"], held: true }, { captureSha: "0".repeat(64), findings: ["Other"] }] }) },
};
const view = (k, extra = {}) => viewOf(S, { subject: SHA, data: { notes: ok({ notes: [NOTE] }), findings: ok({ findings: [] }), ...states[k] }, ...extra });

test("R5 reads threatof, originalstate, verdictnotes and scanfindings for the capture; scanstatus only for a session that administers", () => {
  const reads = S.reads(viewOf(S, { subject: SHA.toUpperCase() }));
  assert.deepEqual(Object.fromEntries(Object.entries(reads).map(([k, r]) => [k, r.op])),
                   { threat: "threatof", state: "originalstate", notes: "verdictnotes", findings: "scanfindings" });
  for (const k of ["threat", "state", "notes"]) assert.deepEqual({ ...reads[k].query }, { capture: SHA });
  const admin = S.reads(viewOf(S, { subject: SHA, me: { member: "MEM-1", administer: true } }));
  assert.equal(admin.status.op, "scanstatus");
  /* control: no capture named, nothing read */
  assert.deepEqual(Object.keys(S.reads(viewOf(S, { subject: "not-a-digest" }))), []);
  assert.match(draw(viewOf(S, { subject: null })), /this screen opens from a capture/);
});

test("R5 a low-risk file draws openoriginal with its checks, and offers no warned path", () => {
  const html = draw(view("low"));
  assert.match(html, /data-risk="low"/);
  assert.match(html, /data-act="openoriginal"/);
  assert.match(html, /Built-in scanner · ClamAV 1\.4\.2: clean/);
  assert.doesNotMatch(html, /data-act="openwithwarning"/);
  assert.doesNotMatch(html, /data-act="releasescanhold"/);
});

test("R5 a high-risk file draws safeview first and deepercheck; openwithwarning only on the warned path with both confirmations", async () => {
  const html = draw(view("highWarned"));
  assert.match(html, /data-risk="high"/);
  assert.ok(html.indexOf('data-act="safeview"') < html.indexOf('data-act="deepercheck"'));
  assert.ok(html.indexOf('data-act="safeview"') < html.indexOf('data-act="openwithwarning"'));
  assert.match(html, /It contains a macro\./);
  assert.match(html, /id="co-device"/);
  assert.match(html, /id="co-macros"/);
  const one = await press(S, view("highWarned"), "openwithwarning", { values: { "co-device": true } });
  assert.equal(one.refused.key, "screen.open-file.warn.both");
  assert.equal(one.kit.requests.length, 0, "nothing sent before both are ticked");
  const both = await press(S, view("highWarned"), "openwithwarning", { values: { "co-device": true, "co-macros": true },
    answers: { openwithwarning: { bytes: 10, name: "memo.docx" } } });
  assert.deepEqual(both.kit.requests.map((q) => [q.kind, q.op, q.query, q.body]),
                   [["download", "openwithwarning", { capture: SHA }, { warned: { own_device: true, no_macros: true } }]]);
  /* control: no path open (not checked this week), no warned path drawn; the reason stated */
  const closed = draw(view("highClosed"));
  assert.doesNotMatch(closed, /data-act="openwithwarning"/);
  assert.doesNotMatch(closed, /data-act="openoriginal"/);
  assert.match(closed, /can't be opened now: NOT_SCANNED/);
  /* the deeper path (a fresh clean deeper check) opens the original by override */
  const deeper = await press(S, view("highDeeper"), "openoriginal", { dataset: { override: "1" }, answers: { openoriginal: { bytes: 1 } } });
  assert.deepEqual(deeper.kit.requests[0].query, { capture: SHA, override: "1" });
  assert.match(draw(view("highDeeper")), /data-act="openoriginal" data-override="1"/);
});

test("R5 a file held after a finding: no way to open the original, the finding named, releasescanhold with a reason", async () => {
  const html = draw(view("held"));
  assert.match(html, /data-risk="held"/);
  assert.doesNotMatch(html, /data-act="openoriginal"/);
  assert.doesNotMatch(html, /data-act="openwithwarning"/);
  assert.match(html, /What was found: Xls\.Downloader\.Agent-917/);
  assert.doesNotMatch(html, /Other/, "another capture's finding is not this file's");
  assert.match(html, /data-act="releasescanhold"/);
  const v = view("held");
  const r = await press(S, v, "releasescanhold", { reason: "The city's own file.", answers: { releasescanhold: { ok: true, state: "pending_second" } } });
  assert.deepEqual(r.request.query, { capture: SHA });
  assert.deepEqual(r.request.body, { reason: "The city's own file." });
  assert.match(draw(v), /A second member's reason releases it/);
  const v2 = view("held");
  await press(S, v2, "releasescanhold", { reason: "Second.", answers: { releasescanhold: { ok: true, state: "released", by: ["a", "b"] } } });
  assert.match(draw(v2), /Released: the original can be opened again/);
  /* control: releasescanhold is offered only while file-safety answers the file held */
  assert.doesNotMatch(draw(view("highWarned")), /data-act="releasescanhold"/);
});

test("R5 the safe view: marked machine work, a safe copy derived from the original, cite the original; a sheet drawn as data", async () => {
  const html = draw(view("highWarned"));
  assert.match(html, /data-mark="origin\.machine">Machine work<\/span> Derived · a safe copy of the original\. Cite the original, never the safe copy/);
  const v = view("highWarned");
  const r = await press(S, v, "safeview", { answers: { safeview: { kind: "data", derived: true, sheets: [{ name: "FY22", cells: [{ ref: "A1", value: "Transfer", type: "s" }] }] } } });
  assert.deepEqual(r.kit.requests.map((q) => [q.kind, q.op, q.query]), [["download", "safeview", { capture: SHA }]]);
  assert.match(draw(v), /Sheet: FY22[\s\S]*<td>A1<\/td><td>Transfer<\/td>/);
  const v2 = view("highWarned");
  await press(S, v2, "safeview", { answers: { safeview: { bytes: 99, pages: 4, source_pages: 4 } } });
  assert.match(draw(v2), /The safe copy is ready[\s\S]*4 pages, each a picture/);
  /* a refusal is drawn with the owner's words */
  const v3 = view("highWarned");
  await press(S, v3, "safeview", { answers: { safeview: { ok: false, reason: "SAFE_VIEW_PENDING", translation: "The safe view is being made." } } });
  assert.match(draw(v3), /role="alert">The safe view is being made\./);
});

test("R5 deepercheck asks for the capture and draws its state", async () => {
  const v = view("highWarned");
  const r = await press(S, v, "deepercheck", { answers: { deepercheck: { ok: true, state: "queued", check_id: "c1" } } });
  assert.deepEqual(r.request.query, { capture: SHA });
  assert.match(draw(v), /Deeper check: asked for, waiting its turn/);
});

test("R5 an administrator sees the scanners' status; nobody else reads it", () => {
  const v = view("low", { me: { administer: true } });
  v.data.status = ok({ queued: 3, overdue: 1, held: 0 });
  assert.match(draw(v), /3 files waiting for a check, 1 overdue, 0 held\./);
  assert.doesNotMatch(draw(view("low")), /files waiting for a check/);
});

test("R6 opening the original is a download under the session (the kit's), its address naming only the capture; no link carries a token", async () => {
  const v = view("low");
  const r = await press(S, v, "openoriginal", { answers: { openoriginal: { bytes: 2048, name: "policy.pdf" } } });
  assert.equal(r.sent, false, "the act's own send makes the one request");
  assert.deepEqual(r.kit.requests.map((q) => [q.kind, q.op, q.query, q.body]), [["download", "openoriginal", { capture: SHA }, undefined]]);
  assert.deepEqual(r.kit.saved, [{ op: "openoriginal", name: "policy.pdf" }]);
  assert.match(draw(v), /handed to your browser as a file/);
  for (const k of Object.keys(states)) assert.doesNotMatch(draw(view(k)), /token|bearer|Authorization/i);
  /* a refusal is drawn beside the act with the owner's words, and nothing is saved */
  const v2 = view("low");
  const no = await press(S, v2, "openoriginal", { answers: { openoriginal: { ok: false, reason: "SCAN_PENDING", translation: "It is being checked." } } });
  assert.deepEqual(no.kit.saved, []);
  assert.match(draw(v2), /It is being checked\./);
});
