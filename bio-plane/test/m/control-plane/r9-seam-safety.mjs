/* control-plane (fix round 9, K4842; job 43; R-SEAM, R-ONE, R-CLOCK): THE SAFETY HALF OF THE SEAM, sections 16-18 of `t51-round9-seam.test.mjs` (plan 3b). Written so far: section 16
   (G136a): the scanner's states through the real plane and a scripted `FILE_SCANNER` service binding (the file-scanner's own container files run in its container job; this is the plane's
   side: what a verdict of `encrypted` or a limit hit becomes for the member). Sections 17 (G137c) and 18 (G125, G133c) are the next session's (record, job 43 notes). Counts, rows and fields. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { makeKit } from "./r8-kit.mjs";
import { makeZip } from "../../make-zip.mjs";
import { generate as docGenerate } from "../../docgen.mjs";
import { put, fileIt, uniq, bytesOf } from "./r9-seam-parts.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");

export function sections(kit, counting) {
  void kit; void counting;
  const verdicts = new Map();   /* capture digest -> {result, reason?} the scanner double answers with; a digest not named is clean */
  const calls = [];
  const verdictOf = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
    scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1, ...(verdicts.get(sha) || {}) });
  const scanner = async (req) => {
    const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
    const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
    if (u.pathname === "/scan") { calls.push(...body.targets.map((t) => t.capture_sha)); return json({ ok: true, verdicts: body.targets.map((t) => verdictOf(t.capture_sha)) }); }
    if (u.pathname === "/render") return json({ ok: false, code: "NOT_RENDERED" }, 422);
    return json({ ok: true, name: "file-scanner", version: "1.0.0", bounds: {} });
  };
  const k = makeKit({ tag: "r9safety", serviceBindings: { FILE_SCANNER: scanner } });
  after(() => k.mf.dispose());
  const owner = () => k.ownerOf("r9s-ann").then((o) => o.auth);
  /* upload, file, and wait until the scanner has been asked about the digest and the member's state has left "waiting" */
  async function scanned(bytes, { name, type }) {
    const auth = await owner();
    const { up } = await put(k, auth, bytes, { name, type });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, auth, up, { title: name });
    const sha = up.capture.sha256;
    let os = null, notes = [];
    await k.until(async () => {
      os = (await k.get(auth, { op: "originalstate", capture: sha })).result;
      notes = ((await k.get(auth, { op: "verdictnotes", capture: sha })).result || {}).notes || [];
      return calls.includes(sha) && (notes.length || (os && os.may_open === true)) ? true : null;
    }, 150000, 2000);
    return { auth, sha, os, notes };
  }

  test("R9 seam §16 (G136a, DOCS S1, I21; R100 R123): a scanner that cannot look inside a file says so: an encrypted ZIP and an encrypted DOCX are `NOT_SCANNED` `ENCRYPTED` with the note `encrypted`, never clean, and neither may be opened as safe; a clean text is the control", { timeout: 900000 }, async () => {
    const t = uniq();
    const zip = makeZip([{ name: "a.txt", data: Buffer.from(`secret words ${t}`), encrypted: "traditional" }]);
    const docx = await bytesOf(docGenerate({ kind: "docx", seed: 9800, size: { units: 3 }, encryptedMember: true }));
    const text = Buffer.from(`ordinary minutes ${t}\n`);
    for (const b of [zip, docx]) verdicts.set(sha256(b), { result: "encrypted" });
    const bad = [];
    for (const [label, bytes, type] of [["zip", zip, "application/zip"], ["docx", docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]) {
      const r = await scanned(bytes, { name: `enc.${label}`, type });
      if (!(r.os && r.os.why === "NOT_SCANNED" && r.os.not_scanned === "ENCRYPTED" && r.os.may_open === false)) bad.push(`${label}: originalstate is ${JSON.stringify(r.os).slice(0, 240)}`);
      if (!r.notes.some((n) => n.result === "encrypted")) bad.push(`${label}: no note says encrypted: ${JSON.stringify(r.notes.map((n) => n.result))}`);
      if (r.notes.some((n) => n.result === "clean")) bad.push(`${label}: a note says clean`);
    }
    const control = await scanned(text, { name: "ok.txt", type: "text/plain" });
    if (!(control.os && !control.os.not_scanned && control.os.may_open === true)) bad.push(`control: a clean text opens: ${JSON.stringify(control.os).slice(0, 240)}`);
    if (control.notes.some((n) => ["encrypted", "unscannable"].includes(n.result))) bad.push("control: a note says it could not be scanned");
    assert.deepEqual(bad, []);
  });

  test("R9 seam §16 (G136a, G136b, SCAN D13, I21; R100 R123): a scan that hit a limit (the scanner answers `unknown`, reason `LIMIT:ScanTime`) is the note `unscannable` with the limit named, not a permanent `NOT_SCANNED` with the reason lost", { timeout: 900000 }, async () => {
    const bytes = Buffer.from(`minutes that exhaust the scan time ${uniq()}\n`);
    verdicts.set(sha256(bytes), { result: "unknown", reason: "LIMIT:ScanTime" });
    const r = await scanned(bytes, { name: "slow.txt", type: "text/plain" });
    const shown = JSON.stringify([r.os, r.notes]);
    const note = r.notes.find((n) => n.result === "unscannable");
    assert.ok(note, "the note says unscannable: " + shown.slice(0, 1400));
    assert.ok(String(note.reason).includes("ScanTime"), "and keeps the limit's name: " + String(note.reason));
    assert.notEqual(r.os && r.os.not_scanned, "SCANNER_ABSENT", "and the member's state is the scan's, not an absent scanner");
  });
}
