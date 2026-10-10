/* file-safety R4, R5, R15–R19: scanning, the scanner's state, scan holds and their release. At the module's interface,
   over the scripted scanner binding (fixture.mjs), which records each request. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, T0, DAY } from "./fixture.mjs";
import { RESCAN_INTERVAL_MS, SCAN_BATCH_MAX, FILE_SAFETY_CHECKS, findingKind } from "../../../src/file-safety/index.mjs";

const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const WARNED = { own_device: true, no_macros: true };

test("R4: `scanBatch` sends the due files, oldest due first, at most `limit` and SCAN_BATCH_MAX, to /scan in one request, one note per verdict; due is never scanned or the newest ClamAV note older than RESCAN_INTERVAL_MS; it answers {ok, scanned, found, not_scanned, remaining}; with no scanner bound SCANNER_ABSENT and no note", async () => {
  /* no scanner bound */
  const none = world({ bound: false });
  const x = await none.capture(pdf(false, "x"));
  const a = await none.fs.scanBatch({});
  assert.deepEqual({ ok: a.ok, code: a.code, check: a.check, translation: a.translation }, { ok: false, code: "SCANNER_ABSENT", ...row("SCANNER_ABSENT") });
  assert.equal(none.fs.verdictNotes({ captureSha: x }).notes.length, 0);

  const found = sha(pdf(false, "f3"));
  const w = world({ scan: { clamav: (s) => (s === found ? { result: "found", findings: ["Pdf.Trojan.A-1"] } : s === sha(pdf(false, "f4")) ? { result: "not_scanned", reason: "TOO_LARGE" } : { result: "clean" }) } });
  const shas = [];
  for (let i = 1; i <= 5; i++) { shas.push(await w.capture(pdf(false, `f${i}`))); w.tick(1000); }
  /* oldest due first, at most `limit` */
  const first = await w.fs.scanBatch({ limit: 2 });
  w.tick(1000);
  assert.deepEqual(first, { ok: true, scanned: 2, found: 0, not_scanned: 0, remaining: 3 });
  assert.equal(w.calls("/scan").length, 1, "one request");
  assert.deepEqual(w.calls("/scan")[0].body.targets.map((t) => t.capture_sha), shas.slice(0, 2));
  const second = await w.fs.scanBatch({});
  assert.deepEqual(second, { ok: true, scanned: 2, found: 1, not_scanned: 1, remaining: 0 });
  assert.deepEqual(w.calls("/scan")[1].body.targets.map((t) => t.capture_sha), shas.slice(2));
  for (const s of shas) assert.equal(w.fs.verdictNotes({ captureSha: s }).notes.length, 1, "one note per verdict");
  /* nothing is due within the week, except the file never scanned (its verdict was not_scanned) */
  w.tick(RESCAN_INTERVAL_MS - 10_000);
  const third = await w.fs.scanBatch({});
  assert.deepEqual(w.calls("/scan")[2].body.targets.map((t) => t.capture_sha), [shas[3]]);
  assert.equal(third.not_scanned, 1);
  /* a week after its last scan a file is due again, the oldest due first: the file never scanned (due since it was
     queued), then those scanned first, then the second batch's */
  w.tick(20_000);
  await w.fs.scanBatch({});
  const order = w.calls("/scan")[3].body.targets.map((t) => t.capture_sha);
  assert.equal(order[0], shas[3]);
  assert.deepEqual(order.slice(1, 3).sort(), [shas[0], shas[1]].sort(), "scanned together, due together");
  assert.deepEqual(order.slice(3).sort(), [shas[2], shas[4]].sort());
  /* SCAN_BATCH_MAX bounds a batch whatever `limit` asks */
  const big = world();
  for (let i = 0; i < SCAN_BATCH_MAX + 3; i++) await big.capture(pdf(false, `big${i}`));
  const b = await big.fs.scanBatch({ limit: 10_000 });
  assert.equal(big.calls("/scan")[0].body.targets.length, SCAN_BATCH_MAX);
  assert.equal(b.remaining, 3);
});

test("R4 (K1949), R32: each tool on with use routine and kind scan also scans each due file (/provider/scan), one note per engine's verdict, within its monthly limit; an on-request tool does not", async () => {
  const w = world({ scan: { provider: { "metadefender-core": () => [{ engine: "avira", result: "clean" }, { engine: "eset", result: "found", findings: ["Win.Trojan.X"] }] } } });
  const routine = await w.tool("metadefender-core", { use: "routine", monthlyLimit: 2, config: { host: "md.example.org" } });
  await w.tool("scanii", { config: { region: "eu1" } });
  const shas = [];
  for (let i = 0; i < 3; i++) shas.push(await w.capture(pdf(false, `r${i}`)));
  await w.fs.scanBatch({});
  const calls = w.calls("/provider/scan");
  assert.deepEqual(calls.map((c) => [c.body.tool.tool_id, c.body.target.capture_sha]), [[routine, shas[0]], [routine, shas[1]]], "within its monthly limit; scanii is on request");
  const notes = w.fs.verdictNotes({ captureSha: shas[0] }).notes.filter((n) => n.tool === "metadefender-core");
  assert.deepEqual(notes.map((n) => [n.kind, n.engine, n.result]), [["scan", "avira", "clean"], ["scan", "eset", "found"]]);
  const status = await w.fs.scanStatus({ viewer: "member:boss" });
  assert.deepEqual(status.tools.find((t) => t.tool_id === routine), { tool_id: routine, state: "on", used_this_month: 2, monthly_limit: 2 });
});

test("R5: `scanStatus` answers administrators only (NOT_AN_ADMIN otherwise, a machine credential included) {scanner, renderer, signatures_age_ms, queued, overdue, held, tools, reputation_list_age_ms}; `overdue` counts files due for more than a day", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "held")) ? { result: "found", findings: ["X.Y.Z"] } : { result: "clean" }), lists: [{ tool_id: "r", fetched_at: new Date(T0 - 7_200_000).toISOString() }] } });
  for (const v of ["member:m1", "class:admin", "", undefined]) assert.equal((await w.fs.scanStatus({ viewer: v })).code, "NOT_AN_ADMIN", String(v));
  const held = await w.capture(pdf(false, "held"));
  await w.fs.scanBatch({});
  await w.capture(pdf(false, "late"));
  w.tick(DAY + 1000);
  await w.capture(pdf(false, "fresh"));
  const tool = await w.tool("scanii", { monthlyLimit: 5 });
  const s = await w.fs.scanStatus({ viewer: "member:boss" });
  assert.equal(s.ok, true);
  assert.deepEqual(Object.keys(s).sort(), ["held", "ok", "overdue", "queued", "renderer", "reputation_list_age_ms", "scanner", "signatures_age_ms", "tools"]);
  assert.deepEqual([s.queued, s.overdue, s.held], [2, 1, 1]);
  assert.equal(s.signatures_age_ms, 3_600_000);
  assert.equal(s.reputation_list_age_ms, 7_200_000 + DAY + 1000);
  assert.deepEqual([s.scanner.bound, s.scanner.clamav_version, s.renderer.bound], [true, "1.4.3", true]);
  assert.deepEqual(s.tools, [{ tool_id: tool, state: "on", used_this_month: 0, monthly_limit: 5 }]);
  assert.ok(held);
  /* no scanner bound is stated, never silent */
  const n = world({ bound: false });
  const ns = await n.fs.scanStatus({ viewer: "member:boss" });
  assert.deepEqual([ns.ok, ns.scanner.bound, ns.signatures_age_ms], [true, false, null]);
});

test("R15: `scanFindings` answers {ok, findings: [{captureSha, note_id, tool, engine, findings, at, held}], cursor, truncated}: every found note (a copy note excluded) in the order written, after `after`, at most `limit` (default 200, clamped to 1–1,000); with `since` only notes at or after it, a `since` that is no instant answering none with since_invalid; `held` true exactly when an open hold covers the note's names at the call; `cursor` the last note answered when more follow, else null; no member is named; a viewer reads only files they may see; it writes nothing and never throws", async () => {
  const bad = new Set([sha(pdf(false, "b1")), sha(pdf(false, "b2")), sha(pdf(false, "b3"))]);
  const w = world({ scan: { clamav: (s) => (bad.has(s) ? { result: "found", findings: [`Win.Trojan.${s.slice(0, 4)}`] } : { result: "clean" }),
                            copyScan: () => ({ result: "found", findings: ["Pdf.Copy.Found"] }) } });
  const s1 = await w.capture(pdf(false, "b1")); w.tick(1000); await w.capture(pdf(false, "ok")); w.tick(1000);
  const s2 = await w.capture(pdf(false, "b2")); w.tick(1000); const s3 = await w.capture(pdf(false, "b3"));
  await w.fs.scanBatch({});
  /* a copy's found note is the copy's, never a finding */
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  await w.fs.requestSafeCopy({ captureSha: s1, viewer: "member:m1" });
  assert.ok(w.rows("SELECT * FROM fs_notes WHERE kind = 'copy' AND result = 'found'").length === 1);
  const tables = w.tables();
  const all = w.fs.scanFindings({ viewer: "member:m1" });
  assert.deepEqual([all.ok, all.cursor, all.truncated], [true, null, false], "nothing follows: the cursor is null");
  assert.deepEqual(all.findings.map((f) => f.captureSha), [s1, s2, s3]);
  assert.deepEqual(Object.keys(all.findings[0]).sort(), ["at", "captureSha", "engine", "findings", "held", "note_id", "tool"]);
  const n1 = w.fs.verdictNotes({ captureSha: s1 }).notes.find((n) => n.kind === "scan");
  assert.deepEqual(all.findings[0], { captureSha: s1, note_id: n1.note_id, tool: "clamav", engine: "clamav", findings: [`Win.Trojan.${s1.slice(0, 4)}`], at: n1.scanned_at, held: true });
  assert.doesNotMatch(JSON.stringify(all), /m1|m2|boss/, "no member is named");
  /* `after` and `limit`: the cursor is the last note answered while more follow */
  const p1 = w.fs.scanFindings({ limit: 2, viewer: "member:m1" });
  assert.deepEqual([p1.findings.length, p1.truncated, p1.cursor], [2, true, String(w.row("SELECT seq FROM fs_notes WHERE note_id = ?", p1.findings[1].note_id).seq)]);
  const p2 = w.fs.scanFindings({ after: p1.cursor, limit: 2, viewer: "member:m1" });
  assert.deepEqual([p2.findings.map((f) => f.captureSha), p2.cursor, p2.truncated], [[s3], null, false]);
  for (const [limit, n] of [[0, 1], [-5, 1], ["x", 3], [null, 3], [1, 1], [2.7, 2], [1_000_000, 3]]) assert.equal(w.fs.scanFindings({ limit, viewer: "member:m1" }).findings.length, n, String(limit));
  /* the clamp: 1,000 at most, 200 by default */
  const many = world({ scan: { clamav: () => ({ result: "found", findings: ["X.Y.Z"] }) } });
  for (let i = 0; i < 1003; i++) many.exec(`INSERT INTO fs_notes (note_id, capture_sha, kind, tool, engine, scanned_at, result, findings) VALUES (?, ?, 'scan', 'clamav', 'clamav', ?, 'found', '["X.Y.Z"]')`,
    `FSN-${i}`, s1, new Date(T0 + i).toISOString());
  many.exec(`INSERT INTO fs_files (capture_sha, queued_at) VALUES (?, '2026-10-08T00:00:00Z')`, s1);
  assert.deepEqual([many.fs.scanFindings({}).findings.length, many.fs.scanFindings({ limit: 5000 }).findings.length, many.fs.scanFindings({ limit: 5000 }).truncated], [200, 1000, true]);
  /* since: only notes at or after it; the order, after, limit and cursor unchanged */
  w.tick(DAY);
  const later = sha(pdf(false, "b4")); bad.add(later);
  const s4 = await w.capture(pdf(false, "b4"));
  await w.fs.scanBatch({});
  const since = new Date(T0 + DAY).toISOString();
  assert.deepEqual(w.fs.scanFindings({ since, viewer: "member:m1" }).findings.map((f) => f.captureSha), [s4]);
  assert.deepEqual(w.fs.scanFindings({ since: T0 + DAY, viewer: "member:m1" }).findings.map((f) => f.captureSha), [s4], "an instant in ms too");
  assert.deepEqual(w.fs.scanFindings({ since: new Date(T0).toISOString(), limit: 2, viewer: "member:m1" }).findings.map((f) => f.captureSha), [s1, s2]);
  assert.deepEqual(w.fs.scanFindings({ since: new Date(T0).toISOString(), after: p1.cursor, viewer: "member:m1" }).findings.map((f) => f.captureSha), [s3, s4]);
  for (const bad of ["not an instant", "", {}, NaN]) {
    const r = w.fs.scanFindings({ since: bad, viewer: "member:m1" });
    assert.deepEqual([r.ok, r.findings, r.cursor, r.since_invalid], [true, [], null, true], String(bad));
  }
  /* held: an open hold covers the names at the call; released, it is false; a pending release still holds */
  w.fs.releaseScanHold({ captureSha: s2, by: "m1", reason: "a" });
  assert.equal(w.fs.scanFindings({ viewer: "member:m1" }).findings.find((f) => f.captureSha === s2).held, true, "pending_second still holds");
  w.fs.releaseScanHold({ captureSha: s2, by: "m2", reason: "b" });
  assert.deepEqual(w.fs.scanFindings({ viewer: "member:m1" }).findings.map((f) => [f.captureSha, f.held]), [[s1, true], [s2, false], [s3, true], [s4, true]]);
  /* sight */
  w.project("PROJ-1", "m1");
  w.home(s2, "INFO-P", { project: "PROJ-1" });
  assert.deepEqual(w.fs.scanFindings({ viewer: "member:m2" }).findings.map((f) => f.captureSha), [s1, s3, s4]);
  const sp = w.fs.scanFindings({ viewer: "member:m2", limit: 1, after: w.fs.scanFindings({ viewer: "member:m2", limit: 1 }).cursor });
  assert.deepEqual(sp.findings.map((f) => f.captureSha), [s3], "a hidden note is passed over, never answered");
  /* D54: an administrator, the founder included, neither invited nor joined to the hidden project passes over its notes
     too; the project's participant still reads them (the negative control) */
  for (const admin of ["member:boss", "admin"])
    assert.deepEqual(w.fs.scanFindings({ viewer: admin }).findings.map((f) => f.captureSha), [s1, s3, s4], admin);
  assert.deepEqual(w.fs.scanFindings({ viewer: "member:m1" }).findings.map((f) => f.captureSha), [s1, s2, s3, s4]);
  /* it writes nothing, and never throws */
  const before = JSON.stringify(w.tables());
  w.fs.scanFindings({ viewer: "member:m1" }); w.fs.scanFindings({ since: "x" });
  assert.equal(JSON.stringify(w.tables()), before);
  assert.ok(tables);
  w.exec("DROP TABLE fs_notes");
  assert.deepEqual(w.fs.scanFindings({ viewer: "member:m1" }), { ok: true, findings: [], cursor: null, truncated: false });
});

test("R16: a found note from any engine of any tool places a scan hold: its original does not open on any path; its safe view, its place in the record, its promotion state and its grade are unchanged; the hold names the finding names and engines it covers", async () => {
  const w = world({ scan: { clamav: () => ({ result: "clean" }), provider: { scanii: () => [{ engine: "scanii", result: "found", findings: ["Xls.Downloader.Agent-917"] }] } } });
  const s = await w.capture(pdf(false, "x"));
  w.home(s, "INFO-1");
  const grade = w.prov.captureGrade(s);
  const tool = await w.tool("scanii");
  await w.fs.scanBatch({});
  assert.equal(w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" }).state, "queued");
  await w.fs.deeperBatch({});
  const g = await w.fs.threatOf({ captureSha: s });
  assert.deepEqual(g.scan_hold && { names: g.scan_hold.names, engines: g.scan_hold.engines }, { names: ["Xls.Downloader.Agent-917"], engines: [{ tool: "scanii", engine: "scanii" }] });
  assert.ok(g.reasons.some((r) => r.code === "scan_hold"));
  for (const args of [{}, { override: true }, { warned: WARNED }]) {
    const o = await w.fs.openOriginal({ captureSha: s, viewer: "member:m1", ...args });
    assert.deepEqual({ code: o.code, check: o.check }, { code: "SCAN_HOLD", check: row("SCAN_HOLD").check }, JSON.stringify(args));
  }
  await w.fs.renderBatch({});
  assert.equal((await w.fs.safeView({ captureSha: s, viewer: "member:m1" })).status, 200, "the safe view stays");
  assert.deepEqual(w.prov.homeOf(s).bundleId, "INFO-1");
  assert.deepEqual(w.prov.captureGrade(s), grade);
  assert.equal(w.row("SELECT current_state FROM bundles WHERE bundle_id = 'INFO-1'").current_state, "collected");
  assert.ok(tool);
});

test("R17: `releaseScanHold` is an act of record: MACHINE_CANNOT_RELEASE_HOLD for a machine or AI identity, HOLD_NO_REASON for an empty reason or one over 2,000 characters, NOT_HELD, SAME_MEMBER when `by` made the pending act; the first act answers pending_second, a second by a different member releases it, {state: released, by: [a, b]}", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "h")) ? { result: "found", findings: ["Doc.Dropper.Agent-1"] } : { result: "clean" }) } });
  const s = await w.capture(pdf(false, "h"));
  const clean = await w.capture(pdf(false, "c"));
  await w.fs.scanBatch({});
  for (const by of ["class:daemon", "claude", "agent", "", null]) {
    const r = w.fs.releaseScanHold({ captureSha: s, by, reason: "fine" });
    assert.deepEqual({ code: r.code, ...{ check: r.check, translation: r.translation } }, { code: "MACHINE_CANNOT_RELEASE_HOLD", ...row("MACHINE_CANNOT_RELEASE_HOLD") }, String(by));
  }
  for (const reason of ["", "   ", null, "x".repeat(2001)]) assert.equal(w.fs.releaseScanHold({ captureSha: s, by: "m1", reason }).code, "HOLD_NO_REASON");
  assert.equal(w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "x".repeat(2000) }).state, "pending_second", "2,000 characters is a reason");
  assert.equal(w.fs.releaseScanHold({ captureSha: clean, by: "m1", reason: "r" }).code, "NOT_HELD");
  const same = w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "again" });
  assert.deepEqual({ code: same.code, check: same.check }, { code: "SAME_MEMBER", check: row("SAME_MEMBER").check });
  assert.equal((await w.fs.threatOf({ captureSha: s })).scan_hold.state, "pending_second", "still held while pending");
  assert.equal((await w.fs.openOriginal({ captureSha: s, viewer: "member:m1" })).code, "SCAN_HOLD");
  const done = w.fs.releaseScanHold({ captureSha: s, by: "member:m2", reason: "read it; a false match" });
  assert.deepEqual(done, { ok: true, captureSha: s, state: "released", by: ["m1", "m2"] });
  assert.equal((await w.fs.threatOf({ captureSha: s })).scan_hold, null);
  assert.equal(w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "r" }).code, "NOT_HELD");
  /* the act is of record: who and why are kept beside the hold */
  const h = w.row("SELECT * FROM fs_holds WHERE capture_sha = ?", s);
  assert.deepEqual([h.pending_by, JSON.parse(h.released_by), h.released_reason, h.released_how], ["m1", ["m1", "m2"], "read it; a false match", "members"]);
});

test("R18: a hold whose findings all come from the built-in ClamAV is released by a deeper check on the same bytes that passed the structure check with a clean verdict from an engine of a different family, {released_by: second_engine, note_id, tool, engine}; a hold with any finding from another engine (one engine of a multi-engine tool included) is released only by two members", async () => {
  const target = sha(pdf(false, "cl"));
  const w = world({ scan: { clamav: (s) => (s === target ? { result: "found", findings: ["Pdf.Heuristic.X"] } : { result: "clean" }),
                             provider: { scanii: () => [{ engine: "scanii", result: "clean" }],
                                         "metadefender-core": () => [{ engine: "clamav", result: "found", findings: ["Pdf.Heuristic.X"] }, { engine: "avira", result: "clean" }] } } });
  const s = await w.capture(pdf(false, "cl"));
  await w.fs.scanBatch({});
  await w.tool("scanii");
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  const d = await w.fs.deeperBatch({});
  const rel = d.done[0].releases;
  assert.equal(rel.length, 1);
  assert.deepEqual({ ...rel[0], names: undefined }, { released_by: "second_engine", note_id: d.done[0].note_id, tool: "scanii", engine: "scanii", names: undefined });
  assert.equal((await w.fs.threatOf({ captureSha: s })).scan_hold, null);
  /* a hold an outside engine found (here an engine inside a multi-engine tool, ClamAV's own family among its engines) */
  const v = world({ scan: { clamav: () => ({ result: "clean" }),
                             provider: { "metadefender-core": () => [{ engine: "clamav", result: "found", findings: ["Win.Trojan.Y"] }], scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  const t = await v.capture(pdf(false, "md"));
  await v.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  await v.fs.scanBatch({});
  assert.ok((await v.fs.threatOf({ captureSha: t })).scan_hold, "held by the outside engine");
  v.exec("UPDATE fs_tools SET state = 'off' WHERE provider_id = 'metadefender-core'");
  await v.tool("scanii");
  v.fs.requestDeeperCheck({ captureSha: t, viewer: "member:m1" });
  const e = await v.fs.deeperBatch({});
  assert.deepEqual(e.done[0].releases, [], "only members release it");
  assert.ok((await v.fs.threatOf({ captureSha: t })).scan_hold);
  /* a ClamAV hold an outside engine then confirms is no longer ClamAV's alone */
  const u = world({ scan: { clamav: () => ({ result: "found", findings: ["Pdf.Heuristic.Z"] }),
                             provider: { "metadefender-core": () => [{ engine: "avira", result: "found", findings: ["Pdf.Heuristic.Z"] }], scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  const q = await u.capture(pdf(false, "both"));
  await u.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  await u.fs.scanBatch({});
  assert.deepEqual((await u.fs.threatOf({ captureSha: q })).scan_hold.engines, [{ tool: "clamav", engine: "clamav" }, { tool: "metadefender-core", engine: "avira" }]);
  u.exec("UPDATE fs_tools SET state = 'off' WHERE provider_id = 'metadefender-core'");
  await u.tool("scanii");
  u.fs.requestDeeperCheck({ captureSha: q, viewer: "member:m1" });
  assert.deepEqual((await u.fs.deeperBatch({})).done[0].releases, []);
  /* no release without the structure check passing: a file whose structure check flags */
  const p = world({ scan: { clamav: () => ({ result: "found", findings: ["Zip.Bad.X"] }), provider: { scanii: () => [{ engine: "scanii", result: "clean" }] } } });
  const unread = await p.capture(new TextEncoder().encode("\u0000\u0001 not a format any reader reads"));
  await p.fs.scanBatch({});
  await p.tool("scanii");
  p.fs.requestDeeperCheck({ captureSha: unread, viewer: "member:m1" });
  assert.deepEqual((await p.fs.deeperBatch({})).done[0].releases, []);
});

test("R19: a release covers the finding names its hold named; a later note finding the same name places no new hold, one finding another name places a new hold", async () => {
  let names = ["Win.Trojan.A"];
  const w = world({ scan: { clamav: () => ({ result: "found", findings: names }) } });
  const s = await w.capture(pdf(false, "n"));
  await w.fs.scanBatch({});
  w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "a" });
  assert.equal(w.fs.releaseScanHold({ captureSha: s, by: "m2", reason: "b" }).state, "released");
  w.tick(RESCAN_INTERVAL_MS + 1);
  await w.fs.scanBatch({});
  assert.equal((await w.fs.threatOf({ captureSha: s })).scan_hold, null, "the same name again: still released");
  names = ["Win.Trojan.A", "Doc.Macro.B"];
  w.tick(RESCAN_INTERVAL_MS + 1);
  await w.fs.scanBatch({});
  const h = (await w.fs.threatOf({ captureSha: s })).scan_hold;
  assert.deepEqual(h.names, ["Doc.Macro.B"], "a new hold for the new name only");
  assert.equal(w.rows("SELECT * FROM fs_holds WHERE capture_sha = ?", s).length, 2);
  assert.equal(findingKind("Doc.Macro.B").threat_kind, "Macro");
});
