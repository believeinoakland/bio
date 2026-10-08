/* file-safety R1–R3, R21, R34 (its note): intake on every receipt, the append-only verdict notes, and the constants. At
   the module's interface: captures arrive through provenance's real `recordReceipt` as acquisition writes them, and the
   module's services answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, enc, T0, DAY } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { RESCAN_INTERVAL_MS, DEEPER_CHECK_FRESH_MS, DEEPER_CHECKS_PER_MONTH, SCAN_BATCH_MAX, LOG_COUNT_KINDS, FILE_SAFETY_CHECKS }
  from "../../../src/file-safety/index.mjs";
import * as SCANNER_LIMITS from "../../../../file-scanner/src/limits.mjs";

const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

test("R1: every receipt (direct, web archive, doorbell, and each member of an unpacked archive as its own capture) puts its capture in the scan queue, one row per digest; R12 renders only those with a safe-view route; nothing changes the receipt or its answer, and a failure here never fails it", async () => {
  const w = world();
  const a = await w.capture(pdf(false, "direct"));
  const b = await w.capture(pdf(false, "archive"), { via: "archive.org" });
  const c = await w.capture(PNG, { via: "doorbell", address: "knock:KNOCK-1" });
  /* the same bytes fetched again, at another address: still one row */
  await w.capture(pdf(false, "direct"), { address: "https://files.example/again" });
  const queued = w.rows("SELECT capture_sha FROM fs_files ORDER BY capture_sha").map((r) => r.capture_sha);
  assert.deepEqual(queued, [a, b, c].sort());
  /* an archive, captured and unpacked by acquisition's real act: each file it cuts is its own capture, queued too */
  const z = makeZip([{ name: "one.txt", data: "first file" }, { name: "two.txt", data: "second file" }]);
  const zs = await w.capture(z);
  w.home(zs, "INFO-ZIP");
  const u = await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: zs, by: "m1", member: true });
  assert.equal(u.ok, true, JSON.stringify(u).slice(0, 300));
  for (const m of [sha("first file"), sha("second file")])
    assert.ok(w.row("SELECT 1 AS x FROM fs_files WHERE capture_sha = ?", m), "a member of an unpacked archive is queued as its own capture");
  /* the scan queue: every file is due once (R4's batch sends them all) */
  const s = await w.fs.scanBatch({});
  assert.equal(s.scanned, 6);
  /* the render queue: only files with a safe-view route reach /render; the image and the archive's text files do not */
  await w.fs.renderBatch({ limit: 50 });
  assert.deepEqual(w.calls("/render").map((x) => x.body.target.capture_sha).sort(), [a, b].sort());
  assert.equal(w.row("SELECT render_state FROM fs_files WHERE capture_sha = ?", c).render_state, "none");
  /* the receipt and its answer are provenance's alone; the listener ran inside it */
  const r = w.prov.recordReceipt({ address: "https://files.example/x", addressNorm: "https://files.example/x", captureSha: sha("x"),
                                   retrieved: "2026-10-08T12:00:00Z", via: "direct" });
  assert.equal(r.recorded, true);
  assert.deepEqual(r.listeners.find((l) => l.module === "file-safety").outcome, "ran");
  /* a failure here never fails the receipt: with this module's queue gone, the receipt is still recorded */
  w.exec("DROP TABLE fs_files");
  const f = w.prov.recordReceipt({ address: "https://files.example/y", addressNorm: "https://files.example/y", captureSha: sha("y"),
                                   retrieved: "2026-10-08T12:00:00Z", via: "direct" });
  assert.equal(f.recorded, true);
  assert.ok(w.row("SELECT 1 AS x FROM captured_locators WHERE capture_sha = ?", sha("y")));
});

test("R1, R34: a receipt carrying a reputation answer adds a `reputation` note (listed or not listed, its categories as findings); one with no answer adds none; the capture is never refused, delayed or changed for it", async () => {
  const w = world();
  const listed = await w.capture(pdf(false, "bad"), { reputation: { tool: "rep-1", listed: true, categories: ["malware", "phishing"], checked_at: "2026-10-08T11:59:00Z" } });
  const clean = await w.capture(pdf(false, "good"), { reputation: { tool: "rep-1", listed: false, categories: [], checked_at: "2026-10-08T11:59:00Z" } });
  const none = await w.capture(pdf(false, "none"), { reputation: { tool: null, listed: null, categories: [], checked_at: "2026-10-08T11:59:00Z", unanswered: "NO_TOOL" } });
  const n = (s) => w.fs.verdictNotes({ captureSha: s }).notes;
  assert.deepEqual(n(listed).map((x) => [x.kind, x.tool, x.result, x.findings, x.scanned_at]),
                   [["reputation", "rep-1", "listed", ["malware", "phishing"], "2026-10-08T11:59:00Z"]]);
  assert.deepEqual(n(clean).map((x) => [x.kind, x.result, x.findings]), [["reputation", "not_listed", []]]);
  assert.deepEqual(n(none), [], "no answer is no note, never not_listed");
  /* the listed file is graded high for it (R6, S13), and its capture is held as it was fetched */
  const g = await w.fs.threatOf({ captureSha: listed });
  assert.equal(g.threat, "high");
  assert.ok(g.reasons.some((r) => r.code === "bad_reputation"));
  assert.ok(w.bucket.held.has(`bio/captures/${listed}`));
  assert.equal((await w.fs.threatOf({ captureSha: clean })).threat, "low");
});

test("R2: `verdictNotes` answers the capture's notes oldest first, each {note_id, kind, tool, engine, engine_version, signatures, scanned_at, result, findings} with reason, checks and vendor_ref when they apply; FILE_NOT_HELD for a digest the record holds nothing under (and a malformed one), and exactly the same answer for a capture the viewer may not see (K2098)", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "f")) ? { result: "found", findings: ["Pdf.Exploit.X-1"] } : { result: "not_scanned", reason: "SIGNATURES_STALE" }) } });
  const s = await w.capture(pdf(false, "f"));
  const t = await w.capture(pdf(false, "t"));
  await w.fs.scanBatch({});
  w.tick(RESCAN_INTERVAL_MS + 1);
  await w.fs.scanBatch({});
  const r = w.fs.verdictNotes({ captureSha: s, viewer: "member:m1" });
  assert.equal(r.ok, true);
  assert.equal(r.notes.length, 2, "a re-scan adds a note");
  const [first, second] = r.notes;
  assert.ok(first.scanned_at < second.scanned_at, "oldest first");
  assert.match(first.note_id, /^FSN-[0-9a-f]{16}$/);
  assert.deepEqual(Object.keys(first).sort(), ["engine", "engine_version", "findings", "kind", "note_id", "result", "scanned_at", "signatures", "tool"]);
  assert.deepEqual([first.kind, first.tool, first.engine, first.engine_version, first.result, first.findings],
                   ["scan", "clamav", "clamav", "1.0", "found", ["Pdf.Exploit.X-1"]]);
  assert.deepEqual(first.signatures, { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" });
  const tn = w.fs.verdictNotes({ captureSha: t }).notes[0];
  assert.deepEqual([tn.result, tn.reason], ["not_scanned", "SIGNATURES_STALE"]);
  /* refusals */
  for (const bad of [sha("never held"), "zz", null]) {
    const x = w.fs.verdictNotes({ captureSha: bad, viewer: "member:m1" });
    assert.equal(x.code, "FILE_NOT_HELD");
    assert.deepEqual({ check: x.check, translation: x.translation }, row("FILE_NOT_HELD"));
  }
  /* sight: a capture homed in a project m2 does not take part in */
  w.project("PROJ-1", "m1");
  w.home(s, "INFO-P", { project: "PROJ-1" });
  assert.equal(w.fs.verdictNotes({ captureSha: s, viewer: "member:m1" }).ok, true);
  const hidden = w.fs.verdictNotes({ captureSha: s, viewer: "member:m2" });
  /* K2098: exactly as an absent one, so a hidden capture cannot be told from one never held */
  const never = w.fs.verdictNotes({ captureSha: sha("never held either"), viewer: "member:m2" });
  assert.equal(hidden.code, "FILE_NOT_HELD");
  assert.deepEqual({ ...hidden, captureSha: null }, { ...never, captureSha: null });
  assert.equal(w.fs.verdictNotes({ captureSha: s, viewer: "" }).code, "FILE_NOT_HELD", "an unstamped viewer sees nothing");
  assert.equal(w.fs.verdictNotes({ captureSha: s, viewer: "member:boss" }).ok, true, "an administrator sees every capture");
});

test("R3: notes are append-only — no act of this module changes or removes one (scan, hold, release, render, re-scan), a re-scan adds one, and `unknown`, `suspicious` and `not_scanned` are never read as clean (no path opens the original on them)", async () => {
  let verdict = { result: "found", findings: ["Win.Trojan.Agent-1"] };
  const w = world({ scan: { clamav: () => verdict } });
  const s = await w.capture(pdf(false, "x"));
  await w.fs.scanBatch({});
  const before = w.rows("SELECT * FROM fs_notes ORDER BY seq");
  w.fs.releaseScanHold({ captureSha: s, by: "m1", reason: "a" });
  w.fs.releaseScanHold({ captureSha: s, by: "m2", reason: "b" });
  await w.fs.renderBatch({});
  w.tick(RESCAN_INTERVAL_MS + 1);
  verdict = { result: "clean" };
  await w.fs.scanBatch({});
  const after = w.rows("SELECT * FROM fs_notes ORDER BY seq");
  assert.deepEqual(after.slice(0, before.length), before, "every earlier note unchanged");
  assert.equal(after.length, before.length + 1, "the re-scan added one");
  /* never read as clean: a file whose only ClamAV notes are unknown, suspicious or not_scanned is not opened as clean */
  for (const result of ["unknown", "suspicious", "not_scanned"]) {
    const v = world({ scan: { clamav: () => ({ result, reason: result === "not_scanned" ? "SIGNATURES_ABSENT" : undefined, findings: result === "suspicious" ? ["Heuristics.X"] : [] }) } });
    const f = await v.capture(pdf(true, result));
    await v.fs.scanBatch({});
    const o = await v.fs.openOriginal({ captureSha: f, viewer: "member:m1", warned: { own_device: true, no_macros: true } });
    assert.ok(!(o instanceof Response), `${result}: the warned path does not open on it`);
    assert.ok(["NOT_SCANNED", "SCAN_PENDING"].includes(o.code), `${result}: ${o.code}`);
    assert.equal((await v.fs.originalState({ captureSha: f, viewer: "member:m1" })).path === "deeper", false);
  }
});

test("R21: the constants, exported by name: RESCAN_INTERVAL_MS 604,800,000; DEEPER_CHECK_FRESH_MS 86,400,000; DEEPER_CHECKS_PER_MONTH 900 (a tool's default monthlyLimit); SCAN_BATCH_MAX and LOG_COUNT_KINDS, file-scanner's own", async () => {
  assert.equal(RESCAN_INTERVAL_MS, 604_800_000);
  assert.equal(DEEPER_CHECK_FRESH_MS, 86_400_000);
  assert.equal(DEEPER_CHECKS_PER_MONTH, 900);
  assert.equal(SCAN_BATCH_MAX, SCANNER_LIMITS.SCAN_BATCH_MAX);
  assert.equal(LOG_COUNT_KINDS, SCANNER_LIMITS.LOG_COUNT_KINDS);
  assert.equal(RESCAN_INTERVAL_MS, 7 * DAY);
  /* DEEPER_CHECKS_PER_MONTH is the default allowance of a tool added without one */
  const w = world();
  const id = await w.tool("scanii");
  assert.equal(w.fs.securityTools({ viewer: "member:boss" }).tools.find((t) => t.tool_id === id).monthly_limit, DEEPER_CHECKS_PER_MONTH);
  assert.ok(T0 > 0 && enc("x").length === 1);
});
