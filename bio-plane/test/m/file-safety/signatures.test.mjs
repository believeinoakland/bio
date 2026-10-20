/* file-safety R46, R47 (T51; FR-12; K4182, K4194): the safety state says what is true when the scanner has no signatures, and a
   `not_scanned` verdict is recorded once for a file and reason. At the module's interface, over the scripted scanner binding
   (fixture.mjs). The sentences are never copied here: the answer's keys are asserted, and the words are read from the answer
   (setup-words R14 answers the sentence the code wrote while the list is stale). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, DAY, T0 } from "./fixture.mjs";

const NONE = { versions: null, published: null, mirrored_at: null, last_attempt: "2026-10-19T03:00:00.000Z", last_error: "REFUSED:main.cvd:403" };
const ABSENT = { result: "not_scanned", reason: "SIGNATURES_ABSENT" };
const boss = "member:boss";
const scans = (w, sha) => w.rows("SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'scan' ORDER BY seq", sha);

test("R46: with no signatures the safety state names the date it has had none since and why, by key, never 'waiting'; with signatures obtained it carries neither", async () => {
  const w = world({ scan: { signatures: NONE, clamav: () => ABSENT } });
  await w.capture(pdf(false, "a"));
  await w.fs.scanBatch({});
  w.tick(DAY);
  await w.capture(pdf(false, "b"));
  await w.fs.scanBatch({});
  const s = await w.fs.scanStatus({ viewer: boss });
  assert.equal(s.ok, true);
  assert.equal(s.queued, 2, "both files are still due: nothing here has scanned them");
  const n = s.no_signatures;
  assert.ok(n, "the state carries what is true");
  assert.equal(n.since, new Date(T0).toISOString(), "since the first file the scanner could not scan for want of signatures, not the latest");
  assert.equal(n.reason, "REFUSED:main.cvd:403", "the scanner's own reason, as it states it");
  assert.equal(n.key, "file-safety.index.no_signatures_since");
  assert.equal(n.reason_key, "file-safety.index.signatures_refused");
  assert.ok(n.words.includes("2026-10-08"), "the date is filled into the sentence");
  assert.ok(n.reason_words.includes("403"), "the refusal's status is filled into the reason");
  assert.ok(!/waiting/i.test(`${n.words} ${n.reason_words}`), "never 'waiting'");

  /* a reason the scanner does not state, and no note yet: the date it last tried, else none */
  const quiet = world({ scan: { signatures: { ...NONE, last_error: null } } });
  const q = (await quiet.fs.scanStatus({ viewer: boss })).no_signatures;
  assert.deepEqual([q.since, q.reason, q.key, q.reason_key], [NONE.last_attempt, "SIGNATURES_ABSENT", "file-safety.index.no_signatures_since", "file-safety.index.signatures_not_fetched"]);
  const never = world({ scan: { signatures: { ...NONE, last_error: "NETWORK", last_attempt: null } } });
  const v = (await never.fs.scanStatus({ viewer: boss })).no_signatures;
  assert.deepEqual([v.since, v.reason, v.key, v.reason_key], [null, "NETWORK", "file-safety.index.no_signatures", "file-safety.index.signatures_failed"]);
  assert.ok(!v.words.includes("{"), "every fill is filled");

  /* control: signatures obtained, the state carries neither the date nor the reason */
  const ok = world();
  await ok.capture(pdf(false, "c"));
  const t = await ok.fs.scanStatus({ viewer: boss });
  assert.equal("no_signatures" in t, false);
  assert.equal(JSON.stringify(t).includes("SIGNATURES_ABSENT"), false);
  /* control: a scanner that did not answer is not claimed to have none, and one unbound says it is unbound */
  const down = world({ scan: { signatures: NONE } });
  down.scanner.fetch = async () => { throw new Error("down"); };
  assert.equal("no_signatures" in (await down.fs.scanStatus({ viewer: boss })), false);
  const unbound = world({ bound: false });
  assert.equal("no_signatures" in (await unbound.fs.scanStatus({ viewer: boss })), false);
});

test("R47 (amends R46): a not_scanned verdict is recorded once for a file and reason, over three passes and two openings; a changed reason, or a real verdict, writes a new note", async () => {
  let answer = ABSENT;
  const w = world({ scan: { clamav: () => answer } });
  const a = await w.capture(pdf(false, "a"));
  const b = await w.capture(pdf(false, "b"));
  for (let i = 0; i < 3; i++) {
    const r = await w.fs.scanBatch({});
    assert.deepEqual([r.ok, r.not_scanned, r.scanned], [true, 2, 0], "the pass still answers what the scanner said");
    w.tick(300_000);
  }
  for (let i = 0; i < 2; i++) {
    const o = await w.fs.openOriginal({ captureSha: a, viewer: "member:m1" });
    assert.equal(o.code, "NOT_SCANNED");
    assert.equal(o.not_scanned, "SIGNATURES_ABSENT", "the opening still states why");
  }
  assert.equal(scans(w, a).length, 1, "one note for the file");
  assert.equal(scans(w, b).length, 1, "one note for the other file: once per file");
  assert.equal((await w.fs.scanStatus({ viewer: boss })).queued, 2, "the files stay due (R4)");

  /* control: the reason changes, a new note; the first reason again after it is a change too */
  answer = { result: "not_scanned", reason: "SIGNATURES_STALE" };
  await w.fs.scanBatch({});
  assert.deepEqual(scans(w, a).map((n) => n.reason), ["SIGNATURES_ABSENT", "SIGNATURES_STALE"]);
  await w.fs.scanBatch({});
  assert.equal(scans(w, a).length, 2, "the same stale reason is not written again");
  answer = ABSENT;
  await w.fs.scanBatch({});
  assert.deepEqual(scans(w, a).map((n) => n.reason), ["SIGNATURES_ABSENT", "SIGNATURES_STALE", "SIGNATURES_ABSENT"]);

  /* control: a real verdict is a note, and a not_scanned after it is recorded again */
  answer = { result: "clean" };
  await w.fs.scanBatch({});
  assert.deepEqual(scans(w, a).map((n) => n.result), ["not_scanned", "not_scanned", "not_scanned", "clean"]);
  answer = ABSENT;
  w.tick(8 * DAY);
  await w.fs.scanBatch({});
  assert.deepEqual(scans(w, a).map((n) => n.result), ["not_scanned", "not_scanned", "not_scanned", "clean", "not_scanned"]);
  /* nothing else changed: the notes are append-only (R3), none is ever read as clean */
  assert.equal(w.fs.verdictNotes({ captureSha: a }).notes.length, 5);
});

test("R47: a safe copy's not_scanned note is recorded once for the file and reason, asked again or not", async () => {
  const w = world({ scan: { copyScan: () => ({ result: "not_scanned", reason: "SIGNATURES_ABSENT" }) } });
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  const a = await w.capture(pdf(false, "a"));
  const first = await w.fs.requestSafeCopy({ captureSha: a, viewer: "member:m1" });
  assert.equal(first.state, "withheld");
  /* the copy is asked for again after a failure; the scanner still cannot read it for the same reason */
  w.exec("UPDATE fs_copies SET state = 'failed' WHERE capture_sha = ?", a);
  const again = await w.fs.requestSafeCopy({ captureSha: a, viewer: "member:m1" });
  assert.equal(again.state, "withheld");
  const copies = w.rows("SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'copy'", a);
  assert.equal(copies.length, 1);
  assert.equal(w.row("SELECT note_id FROM fs_copies WHERE capture_sha = ?", a).note_id, copies[0].note_id, "the copy keeps pointing at its note");
  /* control: a real verdict is a note each time it is given */
  const w2 = world({ scan: { copyScan: () => ({ result: "found", findings: ["Pdf.Copy.Found"] }) } });
  await w2.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  const c = await w2.capture(pdf(false, "c"));
  await w2.fs.requestSafeCopy({ captureSha: c, viewer: "member:m1" });
  w2.exec("UPDATE fs_copies SET state = 'failed' WHERE capture_sha = ?", c);
  await w2.fs.requestSafeCopy({ captureSha: c, viewer: "member:m1" });
  assert.equal(w2.rows("SELECT * FROM fs_notes WHERE capture_sha = ? AND kind = 'copy'", c).length, 2, "a real verdict is a note each time it is given");
});
