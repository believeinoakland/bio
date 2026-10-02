/* extraction: `read`'s wiring (R1, R18) at the module's interface, `Extraction#read` over a stored capture with the
   evidence bucket standing in for the store. The pipeline it hands the store and the view to (the tiers, the chain,
   the reading's shape) is `reading-pipeline`'s since N513, and its cases moved there with it. Each test names the
   requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc } from "./fixture.mjs";
import { identify, doctypeFor } from "../../../../docprofile/registry.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { acquireReadingOp } from "../../../src/extraction/ops.mjs";

const ROW = (id, name, date) => `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=X">${name}</a></td><td>${date}</td><td><a href="View.ashx?M=A&ID=5${id}">Agenda</a></td></tr>`;
const CAL = (rows) => ['<!DOCTYPE html><html><head><title>Council Calendar</title></head><body><form id="aspnetForm" method="post">',
  '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE" />', '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>', rows, '</table></main></form></body></html>'].join("");
const ASPNET = [["content-type", "text/html; charset=utf-8"], ["x-powered-by", "ASP.NET"], ["server", "Microsoft-IIS/10.0"]];

test("R1 R45: the bytes come from the evidence store under the digest; no store, no digest or no object is a failed reading saying so, and no caller field supplies text", async () => {
  const noStore = fresh({ evidence: null });
  const a = await noStore.x.read(doc({ digest: "a".repeat(64), fromText: true }));
  assert.equal(a.reading.found, false);
  assert.match(a.reading.basis, /no evidence store/);
  const w = fresh();
  const absent = await w.x.read(doc({ digest: "b".repeat(64), fromText: true }));
  assert.equal(absent.reading.found, false);
  assert.match(absent.reading.basis, /not held in the evidence store/);
  const none = await w.x.read({ ...doc({ digest: "c".repeat(64) }), capture: {} });
  assert.match(none.reading.basis, /names no capture digest/);
  /* a caller's text and reading on the document are ignored: the stored bytes are read */
  const html = CAL(ROW("2101", "City Council", "7/15/2026"));
  const d = await hold(w.evidence, html);
  const r = await w.x.read({ ...doc({ digest: d, bytes: html.length, fromText: true, headers: ASPNET }),
                             text: "meeting:9999", reading: { entities: [{ kind: "meeting", key: "9999" }] } });
  assert.deepEqual(r.reading.entities.map((e) => e.ref), ["meeting:2101"]);
  assert.ok(w.evidence.calls.some(([op, k]) => op === "get" && k === `bio/captures/${d}`));
});

test("R1: op=acquire's wire answer still carries the reading and its text units on the document", async () => {
  const answer = { ok: true, document: { file: "snapshots/x", locator: "l", retrieved: "r", profile: {}, capture: { sha256: "a" } } };
  const store = { fetch: async (path, init) => {
    assert.match(String(path), /\/extractread\?store=bio/);
    assert.deepEqual(JSON.parse(init.body).document, answer.document);
    return new Response(JSON.stringify({ ok: true, result: { reading: { found: true }, text_units: [{ seq: 0 }], text_units_over_bound: 2,
                                                             text_units_skipped: [{ units: 2 }] } }));
  } };
  const out = await acquireReadingOp(answer, store, { storeSilent: () => "silent", storeName: "bio" });
  assert.deepEqual(out.body.document.reading, { found: true });
  assert.deepEqual(out.body.document.text_units, [{ seq: 0 }]);
  assert.equal(out.body.document.text_units_over_bound, 2);
  assert.deepEqual(out.body.document.text_units_skipped, [{ units: 2 }]);
  const silent = await acquireReadingOp(answer, { fetch: async () => new Response("{}") }, { storeSilent: () => "silent", storeName: "bio" });
  assert.equal(silent.response, "silent");
});

test("R1 R22 R36 (reading-pipeline R15): a csv capture read from the evidence store, then written, holds its sheet as one sheet-range unit at the used range its reader names, and the index reads whole", async () => {
  const w = fresh();
  const csv = "name,place\nAna,Hall\nBo,Park\n";
  const d = await hold(w.evidence, csv);
  const r = await w.x.read(doc({ digest: d, bytes: csv.length, ct: "text/csv", format: "csv", fromText: true, headers: [["content-type", "text/csv"]] }));
  assert.equal(r.text_units.length, 1);
  assert.equal(r.text_units[0].extent.kind, "sheet-range");
  assert.match(r.text_units[0].extent.range, /^A1:B3$/);
  w.s.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES ('B-1','information','g','t','collected','2026-01-01','2026-01-01','x',1)`);
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: r.reading, textUnits: r.text_units });
  const u = w.x.unitsOf(d);
  assert.equal(u.state, "whole");
  assert.deepEqual(u.units.map((x) => [x.extent.kind, x.ref]), [["sheet-range", `${r.text_units[0].extent.sheet}!A1:B3`]]);
  assert.equal(u.chain_kind, "layer");
});

test("R18 R50: every recogniser runs over the instance's jurisdiction view, the combination of record-core's jurisdiction_profiles", async () => {
  const w = fresh();
  const memo = "OFFICER'S MEMORANDUM\nPROPOSAL\nThe Officer Proposes that the Selectboard adopt P.E.B.L. 4.\nCOSTS\nNone.\nCONSULTATION\nThe Harbour Commission.\n";
  const d = await hold(w.evidence, memo);
  const ctx = { headers: {}, locator: "https://a.example/x", content_type: "text/plain", text: memo };
  const view = combine(["test-port-ellery"]).view;
  const withView = doctypeFor({ ...ctx, handler: identify(ctx).handler, view });
  const withEmpty = doctypeFor({ ...ctx, handler: identify(ctx).handler, view: combine([]).view });
  assert.notEqual(withView.type.key, withEmpty.type.key, "the fixture separates the two views");
  w.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  assert.deepEqual(w.x.view(), view);
  const r = (await w.x.read(doc({ digest: d, format: "undetermined", ct: "text/plain", fromText: true, headers: [] }))).reading;
  assert.equal(r.content_type, withView.type.key);
  w.core.setSetting("jurisdiction_profiles", [], "member:admin");
  const e = (await w.x.read(doc({ digest: d, format: "undetermined", ct: "text/plain", fromText: true, headers: [] }))).reading;
  assert.equal(e.content_type, withEmpty.type.key);
  /* R50: nothing this module says names the place a profile describes */
  const oakland = /oakland|alameda/i;
  for (const said of [r.basis, e.basis]) assert.doesNotMatch(said, oakland);
});
