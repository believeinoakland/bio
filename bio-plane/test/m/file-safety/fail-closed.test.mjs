/* file-safety R51 (fix round 4b; F3a, F3b, F10; D6): fail closed, and never forget a scan or a safe view. At the module's interface,
   through the ops the screens send (`openoriginal`, `safeview`) and the batches the scheduler wakes (`scanBatch`, `renderBatch`).
   A multipart capture is built as the screen leaves it: the parts in the store, a bundle whose `data/provenance.json` names them,
   and a register that names the parts alone (today), or the parts and the whole (provenance D1, once it lands). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, sha, enc } from "./fixture.mjs";
import { fileSafetyOps, GRADE_READ_MAX, WAITING_RECHECK_MS } from "../../../src/file-safety/index.mjs";

const MIB = 1024 * 1024;
const HOUR = 3_600_000;

/* A capture of 16 + 16 + 4 MiB held in three parts, as `op=acquire` leaves it: the parts in the store, and (with `whole`) the whole
   under its own digest. `pdfLike` starts the first part with a PDF header so the whole is a PDF. */
function multipart(w, { sizes = [16 * MIB, 16 * MIB, 4 * MIB], pdfLike = false, project = null, wholeRow = false } = {}) {
  const chunks = sizes.map((n, i) => {
    const b = new Uint8Array(n).fill(65 + i);
    if (pdfLike && i === 0) b.set(enc("%PDF-1.4\n"), 0);
    return b;
  });
  const whole = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0; for (const c of chunks) { whole.set(c, o); o += c.length; }
  const wsha = sha(whole);
  const parts = chunks.map((c, i) => ({ file: `snapshots/doc.part${i + 1}`, sha256: sha(c), bytes: c.length }));
  const bundleId = "INFO-MP";
  const doc = { file: "snapshots/doc.pdf", locator: "https://example.org/doc.pdf", retrieved: "2026-09-27T00:00:00Z", authority: "the publisher",
    authority_state: "determined", authority_basis: "named", capture: { method: "acquire", grade: "B", actor_class: "session", sha256: wsha, encoding: "binary", bytes: whole.length },
    origin: { kind: "named_request" }, parts };
  const prov = JSON.stringify({ documents: [doc] });
  w.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
          VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, bundleId, project);
  w.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'data/provenance.json', ?, ?, ?)`, bundleId, prov, prov.length, sha(prov));
  for (const p of parts)
    w.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered, authored) VALUES (?, ?, ?, 'binary', ?, '2026-01-01T00:00:00Z', 0)`,
           p.sha256, bundleId, p.file, p.bytes);
  if (wholeRow)   /* provenance D1: the whole's own row, marked whole, naming the same bundle */
    w.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered, authored) VALUES (?, ?, 'snapshots/doc.pdf', 'binary', ?, '2026-01-01T00:00:00Z', 0)`,
           wsha, bundleId, whole.length);
  const put = async () => { for (const [i, c] of chunks.entries()) await w.bucket.put(`bio/captures/${parts[i].sha256}`, c); };
  const receipt = () => w.prov.recordReceipt({ address: "https://files.example/doc.pdf", addressNorm: "https://files.example/doc.pdf", captureSha: wsha,
    retrieved: new Date(w.clock.now).toISOString().replace(/\.\d+Z$/, "Z"), via: "direct", retrievalLocator: "https://files.example/doc.pdf" });
  return { wsha, parts, whole, chunks, bundleId, put, receipt, keepWhole: () => w.bucket.put(`bio/captures/${wsha}`, whole) };
}

const op = (w, name, captureSha, viewer) =>
  fileSafetyOps(w.fs, new URL(`http://x/?capture=${captureSha}&viewer=${encodeURIComponent(viewer)}`), {}, w.env)[name]();
const refusedAs = (r, code) => {
  assert.ok(!(r instanceof Response), `${code}: it was served`);
  assert.deepEqual([r.ok, r.code], [false, code]);
};

test("R51 (D6, F3a): a 36 MiB capture (16+16+4) in a private project, registered by its parts alone as the screen registers it today, is served to no one the sight check cannot place: another member's openoriginal and safeview are refused as an absent file, never served without the sight check", async () => {
  const w = world();
  w.project("PROJ-1", "m1");
  const mp = multipart(w, { project: "PROJ-1", pdfLike: true });
  await mp.put(); await mp.keepWhole(); mp.receipt();
  assert.equal(w.prov.homeOf(mp.wsha), null, "premise: no home for the whole's digest (the register names the parts alone)");
  /* another member, who takes no part in the project */
  refusedAs(await op(w, "openoriginal", mp.wsha, "member:m2"), "FILE_NOT_HELD");
  refusedAs(await op(w, "safeview", mp.wsha, "member:m2"), "FILE_NOT_HELD");
  refusedAs(await op(w, "openwithwarning", mp.wsha, "member:m2"), "FILE_NOT_HELD");
  /* a refusal that is the same for a capture never held, so none tells them apart (DEC-36) */
  const unheld = await op(w, "openoriginal", sha("never held"), "member:m2");
  const hidden = await op(w, "openoriginal", mp.wsha, "member:m2");
  assert.deepEqual([hidden.code, hidden.check, hidden.translation], [unheld.code, unheld.check, unheld.translation]);
  /* nothing was scanned or served on the way */
  assert.equal(w.calls("/scan").length, 0);
});

test("R51 (D6): with the whole's own register row (provenance D1) the sight check has its home: the project's member opens it, another member is refused, and the scan target is the parts when no whole is held", async () => {
  const w = world();
  w.project("PROJ-1", "m1");
  const mp = multipart(w, { project: "PROJ-1", pdfLike: true, wholeRow: true });
  await mp.put(); mp.receipt();      /* the parts are held; the whole is not (over 32 MiB: its keep is the alarm's) */
  refusedAs(await op(w, "openoriginal", mp.wsha, "member:m2"), "FILE_NOT_HELD");
  await w.fs.scanBatch({});
  const sent = w.calls("/scan");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.targets[0].parts.map((p) => p.sha256), mp.parts.map((p) => p.sha256), "the parts, in order, are the target");
  assert.equal(sent[0].body.targets[0].capture_sha, mp.wsha);
  const notes = w.fs.verdictNotes({ captureSha: mp.wsha, viewer: "member:m1" });
  assert.deepEqual(notes.notes.map((n) => [n.kind, n.result]), [["scan", "clean"]]);
  assert.equal(w.fs.verdictNotes({ captureSha: mp.wsha, viewer: "member:m2" }).code, "FILE_NOT_HELD");
});

test("R51 (F3a): a scan answered not_scanned NOT_FOUND (the bytes are not held yet) writes one note and waits for them: it is not sent again at every batch, only once an hour looked at, and sent when the parts or the whole are held; a real verdict ends the wait", async () => {
  let found = false;
  const w = world({ scan: { clamav: () => (found ? { result: "clean" } : { result: "not_scanned", reason: "NOT_FOUND" }) } });
  const mp = multipart(w, { sizes: [3 * MIB, 3 * MIB, MIB], wholeRow: true });
  mp.receipt();
  const notes = () => w.fs.verdictNotes({ captureSha: mp.wsha }).notes.map((n) => [n.result, n.reason]);
  await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, 1);
  assert.deepEqual(notes(), [["not_scanned", "NOT_FOUND"]]);
  /* batches over the next hour: not sent, no note, nothing held to send */
  for (let i = 0; i < 5; i++) { w.tick(10 * 60_000); await w.fs.scanBatch({}); }
  assert.equal(w.calls("/scan").length, 1, "not sent again");
  assert.deepEqual(notes(), [["not_scanned", "NOT_FOUND"]], "one note");
  /* an hour on: the file is looked at (its bytes are still absent: heads only, no scan) */
  w.tick(HOUR); await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, 1);
  assert.equal(w.fs.scanWake(w.clock.now) > w.clock.now, true, "the wake is the next look, not now");
  /* the parts arrive: the next look sends it, with its parts */
  await mp.put(); found = true;
  w.tick(HOUR); await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, 2);
  assert.equal(w.calls("/scan")[1].body.targets[0].parts.length, 3);
  assert.deepEqual(notes(), [["not_scanned", "NOT_FOUND"], ["clean", undefined]]);
  assert.equal(w.row("SELECT scan_wait_at AS t FROM fs_files WHERE capture_sha = ?", mp.wsha).t, null, "a real verdict ended the wait");
  /* control: another reason for not scanning is not a wait, the file stays due as R4 and R47 state */
  const w2 = world({ scan: { clamav: () => ({ result: "not_scanned", reason: "SIGNATURES_ABSENT" }) } });
  const s2 = await w2.capture(pdf(false, "x"));
  await w2.fs.scanBatch({}); w2.tick(10 * 60_000); await w2.fs.scanBatch({});
  assert.equal(w2.calls("/scan").length, 2);
  assert.equal(w2.row("SELECT scan_wait_at AS t FROM fs_files WHERE capture_sha = ?", s2).t, null);
});

test("R51 (R-OLD): a file whose newest ClamAV note is already not_scanned NOT_FOUND (sent at every batch before this) waits for its bytes from the next start, and a safe view failed NOT_FOUND is a waiting one", async () => {
  const w = world({ scan: { clamav: () => ({ result: "not_scanned", reason: "NOT_FOUND" }) } });
  const s = await w.capture(pdf(false, "old"));
  w.fs.scanBatch({}).then(() => {});
  await w.fs.scanBatch({});
  w.exec(`UPDATE fs_files SET scan_wait_at = NULL, render_state = 'failed', render_reason = 'NOT_FOUND' WHERE capture_sha = ?`, s);   /* as stored before */
  w.fs.migrate();
  const r = w.row("SELECT scan_wait_at, render_state FROM fs_files WHERE capture_sha = ?", s);
  assert.ok(r.scan_wait_at, "waiting for the bytes");
  assert.equal(r.render_state, "waiting");
  const before = w.calls("/scan").length;
  w.tick(10 * 60_000); await w.fs.scanBatch({});
  assert.equal(w.calls("/scan").length, before, "not sent again");
  /* a file with another newest note is untouched */
  const w2 = world();
  const s2 = await w2.capture(pdf(false, "fine"));
  await w2.fs.scanBatch({}); w2.fs.migrate();
  assert.equal(w2.row("SELECT scan_wait_at AS t FROM fs_files WHERE capture_sha = ?", s2).t, null);
});

test("R51 (F3b): a safe view whose bytes are not held when its render comes (the receipt came before the keep) waits, answering SAFE_VIEW_PENDING, and is made once the bytes are held; never left failed NOT_FOUND", async () => {
  const w = world();
  const bytes = pdf(false, "late");
  const s = sha(bytes);
  w.prov.recordReceipt({ address: "https://files.example/late", addressNorm: "https://files.example/late", captureSha: s,
    retrieved: new Date(w.clock.now).toISOString().replace(/\.\d+Z$/, "Z"), via: "direct", retrievalLocator: "https://files.example/late" });
  w.home(s, "INFO-LATE");
  const a = await w.fs.renderBatch({});
  assert.equal(a.ok, true);
  assert.equal(w.row("SELECT render_state AS r FROM fs_files WHERE capture_sha = ?", s).r, "waiting");
  assert.equal((await w.fs.safeView({ captureSha: s, viewer: "member:m1" })).code, "SAFE_VIEW_PENDING");
  assert.equal(w.calls("/render").length, 0);
  /* the keep lands; an hour on, the view is queued and made */
  await w.bucket.put(`bio/captures/${s}`, bytes);
  assert.equal(w.fs.renderWake(w.clock.now) >= w.clock.now + WAITING_RECHECK_MS, true, "looked at again in an hour");
  w.tick(WAITING_RECHECK_MS);
  const b = await w.fs.renderBatch({});
  assert.equal(b.rendered, 1);
  const view = await w.fs.safeView({ captureSha: s, viewer: "member:m1" });
  assert.ok(view instanceof Response && view.status === 200, "the safe view is served");
  /* bytes still absent an hour later: it keeps waiting, rendering nothing */
  const w2 = world();
  const s2 = sha(pdf(false, "never"));
  w2.prov.recordReceipt({ address: "https://files.example/never", addressNorm: "https://files.example/never", captureSha: s2,
    retrieved: new Date(w2.clock.now).toISOString().replace(/\.\d+Z$/, "Z"), via: "direct", retrievalLocator: "https://files.example/never" });
  await w2.fs.renderBatch({}); w2.tick(2 * WAITING_RECHECK_MS); await w2.fs.renderBatch({}); w2.tick(2 * WAITING_RECHECK_MS); await w2.fs.renderBatch({});
  assert.equal(w2.row("SELECT render_state AS r FROM fs_files WHERE capture_sha = ?", s2).r, "waiting");
  assert.equal(w2.calls("/render").length, 0);
});

test("R51 (F10): the grade never loads a whole above GRADE_READ_MAX into this object: a 36 MiB PDF is graded by its start, high with its content unread, and its safe view is still made by the renderer; a 36 MiB capture held in parts with no whole is read by its first part's start; a file under the bound is read whole as before", async () => {
  const w = world();
  w.project("PROJ-1", "m1");
  /* a whole 36 MiB PDF, counting every load of its bytes */
  const big = new Uint8Array(36 * MIB).fill(66); big.set(enc("%PDF-1.4\n"), 0);
  const bs = sha(big);
  await w.bucket.put(`bio/captures/${bs}`, big);
  const loads = [];
  const get = w.bucket.get.bind(w.bucket);
  w.bucket.get = async (k) => {
    const o = await get(k);
    if (!o) return o;
    return { ...o, arrayBuffer: async () => { loads.push(k); return o.arrayBuffer(); } };
  };
  w.prov.recordReceipt({ address: "https://files.example/big", addressNorm: "https://files.example/big", captureSha: bs,
    retrieved: new Date(w.clock.now).toISOString().replace(/\.\d+Z$/, "Z"), via: "direct", retrievalLocator: "https://files.example/big" });
  w.home(bs, "INFO-BIG");
  assert.ok(big.length > GRADE_READ_MAX);
  const g = await w.fs.threatOf({ captureSha: bs, viewer: "member:m1" });
  assert.equal(g.ok, true);
  assert.deepEqual([g.format, g.threat], ["pdf", "high"]);
  assert.ok(g.reasons.some((r) => r.code === "unread"), "its content is stated unread");
  assert.deepEqual(loads, [], "the whole was never loaded");
  const st = await w.fs.originalState({ captureSha: bs, viewer: "member:m1" });
  assert.deepEqual([st.may_open, st.path], [true, "warned"], "a high file opens by the warned path alone");
  assert.deepEqual(loads, []);
  /* the safe view is the renderer's work, in its own memory: the file is queued and rendered */
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 1);
  assert.deepEqual(loads, []);
  /* in parts, no whole */
  const mp = multipart(w, { pdfLike: true, wholeRow: true });
  await mp.put(); mp.receipt();
  const gp = await w.fs.threatOf({ captureSha: mp.wsha, viewer: "member:m1" });
  assert.deepEqual([gp.format, gp.threat], ["pdf", "high"]);
  assert.ok(gp.reasons.some((r) => r.code === "unread"));
  assert.deepEqual(loads, [], "no part was loaded whole");
  /* the deeper check does not read it either: its structure check says it was too large */
  assert.equal(w.fs.requestDeeperCheck({ captureSha: bs, viewer: "member:m1" }).code, "NO_OUTSIDE_TOOL");
  /* control: a small PDF is read whole as before and is low */
  const small = pdf(false, "small");
  const ss = await w.capture(small);
  const gs = await w.fs.threatOf({ captureSha: ss, viewer: "member:m1" });
  assert.deepEqual([gs.format, gs.threat], ["pdf", "low"]);
  /* control: a PDF between the start's bound and GRADE_READ_MAX is loaded whole, as before */
  const mid = new Uint8Array(2 * MIB).fill(67); mid.set(pdf(false, "mid"), 0);
  const ms = await w.capture(mid);
  assert.equal((await w.fs.threatOf({ captureSha: ms, viewer: "member:m1" })).format, "pdf");
  assert.ok(loads.includes(`bio/captures/${ms}`), "read whole as before");
});
