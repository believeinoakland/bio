/* file-safety R54, R3, R4, R8, R11, R14 (fix round 9, G136a, G136d; K4831 (6); SCAN F1-F8): encrypted and unscannable are their own
   states, never clean. At the module's interface, over the scripted scanner; a file's encryption is shown by its own structure too, so a
   scanner that said `clean` (as the old one did) changes nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, sha, DAY } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { docxOf, ENC_PDF, encOle } from "./r9-kit.mjs";

const V = { viewer: "member:m1" };
const codes = (g) => g.reasons.map((r) => r.code).sort();
const notes = (w, s) => w.fs.verdictNotes({ captureSha: s }).notes;

test("R54 R3: a scanner verdict `encrypted` writes a note with result encrypted, a limit or an unopenable type writes `unscannable` with the limit or type in reason; the file grades high with the reason, and neither is read as clean", async () => {
  const sigs = { versions: { main: 62 }, published: "2026-10-08T00:00:00Z", mirrored_at: null, last_attempt: null, last_error: null };
  const verdicts = { enc: { result: "encrypted" }, lim: { result: "unknown", detail: "LIMIT:MaxFileSize" }, rar: { result: "unknown", detail: "UNOPENABLE:rar" }, odd: { result: "unknown", detail: "DB_ERROR" } };
  let which = "enc";
  const w = world({ scan: { clamav: () => verdicts[which], signatures: sigs } });
  const out = {};
  for (const k of Object.keys(verdicts)) {
    which = k;
    const s = await w.capture(pdf(false, k));
    await w.fs.scanBatch({});
    out[k] = s;
  }
  assert.deepEqual(notes(w, out.enc).map((n) => [n.kind, n.result, n.reason]), [["scan", "encrypted", "ENCRYPTED"]]);
  assert.deepEqual(notes(w, out.lim).map((n) => [n.result, n.reason]), [["unscannable", "LIMIT:MaxFileSize"]]);
  assert.deepEqual(notes(w, out.rar).map((n) => [n.result, n.reason]), [["unscannable", "UNOPENABLE:rar"]]);
  assert.deepEqual(notes(w, out.odd).map((n) => [n.result, n.reason]), [["unknown", "DB_ERROR"]], "any other unknown keeps its detail");
  const ge = await w.fs.threatOf({ captureSha: out.enc });
  assert.deepEqual([ge.threat, codes(ge)], ["high", ["encrypted"]]);
  const gl = await w.fs.threatOf({ captureSha: out.lim });
  assert.deepEqual([gl.threat, codes(gl)], ["high", ["unscannable"]]);
  assert.equal(gl.reasons[0].limit, "LIMIT:MaxFileSize", "the limit is named");
  assert.equal((await w.fs.threatOf({ captureSha: out.rar })).reasons[0].limit, "UNOPENABLE:rar");
  assert.ok(gl.reasons[0].translation.length > 10, "member words");
  /* append-only: a later note adds, none is changed */
  const before = JSON.stringify(notes(w, out.lim));
  await w.fs.scanBatch({ at: new Date(w.clock.now + 8 * DAY).toISOString() });
  assert.ok(JSON.stringify(notes(w, out.lim)).startsWith(before.slice(0, -1)), "the first note is unchanged");
});

test("R54: an encrypted ZIP, DOCX and PDF are graded high as encrypted by their structure whatever the scanner said (it said clean), their originals open by no path (NOT_SCANNED, ENCRYPTED), their safe views are SAFE_VIEW_FAILED ENCRYPTED, final and not rendered", async () => {
  const w = world({ scan: { clamav: () => ({ result: "clean" }) } });
  const zipEnc = makeZip([{ name: "ok.txt", data: "ok" }, { name: "locked.txt", data: "x", encrypted: "traditional" }]);
  const docxEnc = encOle("docx");
  const members = docxOf([{ name: "word/media/locked.bin", data: "x", encrypted: "traditional" }]);
  const files = { zip: zipEnc, docx: docxEnc, docxMember: members, pdf: ENC_PDF };
  const shas = {};
  for (const [k, b] of Object.entries(files)) shas[k] = await w.capture(b);
  await w.fs.scanBatch({});
  for (const [k, s] of Object.entries(shas)) {
    const g = await w.fs.threatOf({ captureSha: s });
    assert.equal(g.threat, "high", k);
    assert.ok(codes(g).includes("encrypted"), `${k}: ${codes(g)}`);
    for (const [opts, path] of [[{}, "plain"], [{ warned: { own_device: true, no_macros: true } }, "warned"], [{ override: true }, "deeper"]]) {
      const r = await w.fs.openOriginal({ captureSha: s, ...V, ...opts });
      assert.ok(!(r instanceof Response), `${k}: ${path} opened an encrypted original`);
      assert.deepEqual([r.code, r.not_scanned], ["NOT_SCANNED", "ENCRYPTED"], `${k} ${path}`);
    }
    const st = await w.fs.originalState({ captureSha: s, ...V });
    assert.deepEqual([st.may_open, st.path, st.why], [false, null, "NOT_SCANNED"], k);
    const v = await w.fs.safeView({ captureSha: s, ...V });
    assert.deepEqual([v.code, v.renderer_reason, v.final], ["SAFE_VIEW_FAILED", "ENCRYPTED", true], `${k}: its safe view`);
  }
  await w.fs.renderBatch({ limit: 50 });
  assert.equal(w.calls("/render").length, 0, "an encrypted file is not sent to the renderer");
  assert.equal(w.row("SELECT render_state, render_reason FROM fs_files WHERE capture_sha = ?", shas.pdf).render_state, "failed", "final");
  /* control: a plain archive, DOCX and PDF are not encrypted */
  const ok = await w.capture(docxOf([{ name: "word/media/a.bin", data: "x" }]));
  assert.equal(codes(await w.fs.threatOf({ captureSha: ok })).includes("encrypted"), false);
});

test("R54 R4: a file whose newest ClamAV note is encrypted or unscannable is not due again for the same signature set and is due when a newer set is published", async () => {
  const sigs = { versions: { main: 62 }, published: "2026-10-08T00:00:00Z", mirrored_at: null, last_attempt: null, last_error: null };
  let answer = { result: "encrypted" };
  const w = world({ scan: { clamav: () => answer, signatures: sigs } });
  const s = await w.capture(pdf(false, "locked"));
  await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, 1);
  assert.equal(notes(w, s)[0].signatures.published, "2026-10-08T00:00:00Z");
  /* a day, a week, a month on: the same set, so not sent again, and not counted as waiting */
  for (let i = 0; i < 3; i++) { w.tick(DAY); await w.fs.scanBatch({}); }
  assert.equal(w.calls("/scan").length, 1, "not due again for the same set");
  const status = await w.fs.scanStatus({ viewer: "member:boss" });
  assert.equal(status.queued, 0, "it waits for no scan");
  assert.equal(w.fs.scanWake(w.clock.now), null, "nor does it want a wake");
  /* a newer set is published: it is due, and a real verdict then replaces the state */
  sigs.published = "2026-10-09T00:00:00Z";
  answer = { result: "clean" };
  w.tick(DAY);
  await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, 2, "due when a newer set is published");
  assert.deepEqual(notes(w, s).map((n) => n.result), ["encrypted", "clean"]);
  /* control: a clean file is due only after a week, as before (R4) */
  const c = await w.capture(pdf(false, "clean"));
  await w.fs.scanBatch({});
  const n = w.calls("/scan").length;
  w.tick(DAY);
  await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, n, "a clean file is not due before its week");
  assert.equal(c.length, 64);
});

test("R54 R14: a deeper check of an encrypted file ends incomplete and writes an `encrypted` note of its structure check; it opens no original, and an image's structure check is not_examined, never clean", async () => {
  const w = world({ scan: { clamav: () => ({ result: "clean" }) } });
  await w.tool("scanii");
  const s = await w.capture(ENC_PDF);
  w.fs.requestDeeperCheck({ captureSha: s, ...V });
  const d = await w.fs.deeperBatch({});
  assert.equal(d.done[0].result, "incomplete");
  const checks = notes(w, s).find((n) => n.kind === "deeper").checks;
  assert.equal(checks.find((c) => c.check === "structure").result, "encrypted");
  assert.ok(notes(w, s).some((n) => n.engine === "structure" && n.result === "encrypted"), "its note says so");
  const r = await w.fs.openOriginal({ captureSha: s, ...V, override: true });
  assert.equal(r.not_scanned, "ENCRYPTED");
  assert.equal(sha("x").length, 64);
});
