/* case-carriage — a member document and its copy (R15–R17; T39, N806, K2315, K2333): queued from each receipt that is
   not a fetch and from each miss, derived by `doc-clean` on the scheduler's wake, its state answered synchronously,
   and carried in a case only as its copy, or whole when it carries nothing doc-clean removes (R1, R8, R13). The
   documents are doc-clean's own test documents (a PDF whose JPEG carries EXIF with GPS and whose /Info names its
   author), held only in the evidence store, as a member's upload is; `doc-clean` runs for real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, makePng, sha, NOW, supplied } from "./fixture.mjs";
import { pdf, has, SECRETS } from "../doc-clean/fixtures.mjs";
import { makeZip, zipChunks64 } from "../../make-zip.mjs";
import { docx, unzipCopy, enc } from "../doc-clean/fixtures.mjs";
import { CLEAN_MAX_BYTES } from "../../../src/doc-clean/index.mjs";
import { DOCUMENT_COPY_BATCH_MAX, DOCUMENT_COPY_RETRY_MS, COPY_NOW_MAX_BYTES, COPY_CLEANED_LABEL, OBSCURED_LABEL, CASE_CARRIAGE_CHECKS,
         CASE_CARRIAGE_DOCUMENT_TABLES, MEMBER_DOCUMENT_ONLY_AS_COPY, ARCHIVE_SUPPLIED_BY_MEMBER, obscuredKey }
  from "../../../src/case-carriage/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const CASE = "CASE-2026-0001";
const KNOCKED = pdf();                                                    // EXIF with GPS in its image, /Info, XMP
const REFUSED = pdf({ ops: "q 8 0 0 8 0 0 cm BI /W 8 /H 8 /CS /G /BPC 8 /F /DCT ID \xff\xd8\xff EI Q" });   // an inline JPEG
const CSV = Buffer.from("street,count\nMain,3\n");                         // carries nothing to remove
const docRow = (ref, s, over = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                         included: true, rests_under: "load_bearing", ...over });
const copyRow = (ref, s, copy) => docRow(ref, s, { included: false, obscured: { copy, label: COPY_CLEANED_LABEL } });
const LATER = (ms) => new Date(Date.parse(NOW) + ms).toISOString().replace(".000Z", "Z");

const queue = (w) => w.rows(`SELECT capture, queued, tried FROM document_copy_queue ORDER BY queued, capture`);
const copies = (w) => w.rows(`SELECT capture, state, sha256, refused_code FROM document_copies ORDER BY seq`);

/* ---------------------------------------------------------------- R15 */

test("R15 what gets queued: one row per digest for each receipt that is not a fetch (a knock, an unpacked file, a route no ruling names), inside the receipt's transaction; a fetch queues nothing; a second receipt adds no row", () => {
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  assert.deepEqual(queue(w), [{ capture: knock, queued: NOW, tried: null }]);
  w.receipt(knock, "doorbell");
  w.receipt(knock, "some-mirror");
  assert.equal(queue(w).length, 1, "one row per digest");
  const fetched = supplied(w, "INFO-2026-0102-fetched", REFUSED, { via: "direct" });
  for (const via of ["archive.org", "capture-request"]) w.receipt(sha(`fetched by ${via}`), via);
  assert.equal(queue(w).some((q) => q.capture === fetched || q.capture === sha("fetched by archive.org")), false, "a fetch is not queued");
  const cut = sha("a file cut from an archive");
  w.receipt(cut, "unpacked", `zip:${sha("an archive")}!0`);
  assert.deepEqual(queue(w).map((q) => q.capture).sort(), [knock, cut].sort());
  /* inside the receipt's transaction: a receipt rolled back leaves no row */
  const before = queue(w);
  assert.throws(() => w.record.transact(() => { w.receipt(sha("rolled back"), "doorbell"); throw new Error("the act fails"); }), /the act fails/);
  assert.deepEqual(queue(w), before);
  /* a capture already derived is not queued again by a later receipt */
  w.st.sql.exec(`INSERT INTO document_copies (capture, state, at) VALUES (?, 'clean', ?)`, sha("derived"), NOW);
  w.receipt(sha("derived"), "doorbell");
  assert.equal(queue(w).some((q) => q.capture === sha("derived")), false);
});

test("R15 copyBatch: a knock PDF whose image carries EXIF is cleaned by doc-clean; the copy is held under <store>/obscured/<sha>, labelled derived and naming its original, never registered; the original is unchanged; the answer counts each outcome", async () => {
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  const refused = supplied(w, "INFO-2026-0103-refused", REFUSED, { via: null });
  const csv = supplied(w, "INFO-2026-0104-csv", CSV, { via: "doorbell", name: "counts.csv", type: "text/csv" });
  assert.equal(w.cc.documentCopy(refused).state, "pending", "a capture with no receipt is queued at its miss");
  const register = w.count("register");
  const r = await w.cc.copyBatch({});
  assert.deepEqual(r, { ok: true, copied: 1, clean: 1, public: 0, refused: 1, failed: 0, remaining: 0 });
  const k = w.cc.documentCopy(knock);
  assert.equal(k.state, "copy");
  const held = w.bucket.held.get(obscuredKey("bio", k.copy));
  assert.ok(held, "held beside a photo's copy");
  assert.equal(sha(held.bytes), k.copy);
  assert.deepEqual(held.opts.customMetadata, { derived: "cleaned", original: knock, label: COPY_CLEANED_LABEL });
  for (const secret of SECRETS) assert.equal(has(held.bytes, secret), false, `${secret} is not in the copy`);
  assert.ok(has(KNOCKED, "GPSSECRET") && has(KNOCKED, "AUTHORSECRET"), "negative control: the original carries them");
  assert.equal(sha(w.evidence.held.get(knock)), knock, "original digest unchanged");
  assert.equal(w.count("register"), register, "the copy is never registered");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM register WHERE capture_sha=?`, k.copy).n, 0);
  assert.deepEqual(w.cc.documentCopy(refused), { state: "refused", copy: null,
    refused: { code: "IMAGE_NOT_CLEANABLE", detail: w.row(`SELECT refused_detail FROM document_copies WHERE capture=?`, refused).refused_detail } });
  assert.match(w.cc.documentCopy(refused).refused.detail, /inline JPEG/);
  assert.deepEqual(w.cc.documentCopy(csv), { state: "clean", copy: null, refused: null });
  assert.deepEqual(queue(w), [], "each outcome recorded, the queue emptied");
});

test("R15 copyBatch asks R62 again (fetched since: public, no copy); a register byte count over CLEAN_MAX_BYTES is refused DOCUMENT_TOO_LARGE unread; a photo found queued leaves the queue; oldest first, at most limit (default and bound DOCUMENT_COPY_BATCH_MAX)", async () => {
  assert.equal(DOCUMENT_COPY_BATCH_MAX, 10);
  const w = world();
  const later = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  w.receipt(later, "direct");
  const big = supplied(w, "INFO-2026-0105-big", REFUSED, { stated: CLEAN_MAX_BYTES + 1 });
  const photo = w.photo("INFO-2026-0106-photo", makePng(4, 4));
  w.receipt(photo, "doorbell");
  const r = await w.cc.copyBatch({ limit: 50 });
  assert.deepEqual(r, { ok: true, copied: 0, clean: 0, public: 1, refused: 1, failed: 0, remaining: 0 });
  assert.deepEqual(copies(w).map((c) => [c.capture, c.state, c.refused_code]).sort(),
                   [[later, "public", null], [big, "refused", "DOCUMENT_TOO_LARGE"]].sort());
  assert.equal(w.evidence.calls.some(([op, k]) => op === "get" && k === big), false, "the oversize document is never read");
  assert.equal(w.bucket.calls.length, 0, "no copy made for either");
  assert.deepEqual(w.cc.documentCopy(photo).state, "photo");
  /* oldest first, at most the limit; the bound caps a larger limit */
  const w2 = world();
  const many = Array.from({ length: DOCUMENT_COPY_BATCH_MAX + 3 }, (_, i) => {
    w2.clock.now = LATER(i * 1000);
    return supplied(w2, `INFO-2026-${String(200 + i)}-n`, Buffer.from(`row,${i}\n`), { name: "n.csv", type: "text/csv" });
  });
  const two = await w2.cc.copyBatch({ limit: 2 });
  assert.deepEqual([two.clean, two.remaining], [2, many.length - 2]);
  assert.deepEqual(copies(w2).map((c) => c.capture), many.slice(0, 2), "the oldest first");
  const rest = await w2.cc.copyBatch({ limit: 1000 });
  assert.deepEqual([rest.clean, rest.remaining], [DOCUMENT_COPY_BATCH_MAX, 1], "bounded by DOCUMENT_COPY_BATCH_MAX");
  assert.equal((await w2.cc.copyBatch()).remaining, 0, "default limit");
});

test("R15 a read of the evidence store that fails leaves the document queued, tried no sooner than DOCUMENT_COPY_RETRY_MS after; with no evidence store bound copyBatch answers DOCUMENT_COPY_NO_STORE (C-141.11) and derives nothing", async () => {
  assert.equal(DOCUMENT_COPY_RETRY_MS, 300000);
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  w.evidence.held.delete(knock);
  const r = await w.cc.copyBatch({});
  assert.deepEqual(r, { ok: true, copied: 0, clean: 0, public: 0, refused: 0, failed: 1, remaining: 1 });
  assert.deepEqual(queue(w), [{ capture: knock, queued: NOW, tried: NOW }]);
  assert.equal(w.cc.documentCopy(knock).state, "pending");
  w.evidence.held.set(knock, Buffer.from(KNOCKED));
  w.clock.now = LATER(DOCUMENT_COPY_RETRY_MS - 1000);
  assert.equal((await w.cc.copyBatch({})).failed + copies(w).length, 0, "not retried before its time");
  w.clock.now = LATER(DOCUMENT_COPY_RETRY_MS);
  assert.equal((await w.cc.copyBatch({})).copied, 1, "retried at its time");
  /* bytes at another digest are not read as the document */
  const w3 = world();
  const s3 = supplied(w3, "INFO-2026-0101-knock", KNOCKED);
  w3.evidence.held.set(s3, Buffer.from("other bytes"));
  assert.equal((await w3.cc.copyBatch({})).failed, 1);
  /* no store bound */
  const w2 = world();
  const s = supplied(w2, "INFO-2026-0101-knock", KNOCKED);
  w2.record.evidenceStore = () => null;
  const before = w2.snapshot();
  const no = await w2.cc.copyBatch({});
  assert.deepEqual({ ok: no.ok, code: no.code, check: no.check, translation: no.translation },
                   { ok: false, code: "DOCUMENT_COPY_NO_STORE", check: "C-141.11", translation: CASE_CARRIAGE_CHECKS.DOCUMENT_COPY_NO_STORE.translation });
  assert.equal(CASE_CARRIAGE_CHECKS.DOCUMENT_COPY_NO_STORE.translation,
               word("refusal.DOCUMENT_COPY_NO_STORE"));
  assert.deepEqual(w2.snapshot(), before, "nothing derived or written");
  assert.equal(w2.cc.documentCopy(s).state, "pending");
});

test("R15 copyWake: null while nothing is queued; now while a queued document has not been tried; else the earliest retry instant, never before now; read from the tables, so it survives a restart; writes nothing, never throws", async () => {
  const w = world();
  const now = Date.parse(NOW);
  assert.equal(w.cc.copyWake(now), null, "nothing queued");
  const a = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  assert.equal(w.cc.copyWake(now), now, "untried: now");
  assert.equal(w.cc.copyWake(NOW), NOW, "in the form given");
  w.evidence.held.delete(a);
  await w.cc.copyBatch({});
  assert.equal(w.cc.copyWake(now), now + DOCUMENT_COPY_RETRY_MS, "its last try plus the retry");
  assert.equal(w.cc.copyWake(NOW), new Date(now + DOCUMENT_COPY_RETRY_MS).toISOString());
  assert.equal(w.cc.copyWake(now + DOCUMENT_COPY_RETRY_MS + 5), now + DOCUMENT_COPY_RETRY_MS + 5, "never before now");
  w.clock.now = LATER(60000);
  supplied(w, "INFO-2026-0102-second", REFUSED, { via: null });
  w.cc.documentCopy(sha(REFUSED));
  assert.equal(w.cc.copyWake(now + 60000), now + 60000, "a new untried document: now");
  /* the instants live in the tables: a fresh instance over the same storage answers alike */
  const { CaseCarriage } = await import("../../../src/case-carriage/index.mjs");
  const again = new CaseCarriage({ storage: w.st, record: w.record, provenance: w.prov, bucket: w.bucket });
  assert.equal(again.copyWake(now + 60000), now + 60000);
  const before = w.snapshot();
  for (const bad of [null, undefined, "not a time", {}, NaN]) assert.equal(w.cc.copyWake(bad), null);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  w.st.sql.exec(`DROP TABLE document_copy_queue`);
  assert.equal(w.cc.copyWake(now), null, "never throws");
});

/* ---------------------------------------------------------------- R16 */

test("R16 documentCopy answers synchronously each state: public, clean, copy, refused, pending, undetermined, photo; a miss is queued (its one write) and answered pending; never throws", async () => {
  const w = world();
  const fetched = supplied(w, "INFO-2026-0102-fetched", Buffer.from("a page this copy fetched"), { via: "direct" });
  assert.deepEqual(w.cc.documentCopy(fetched), { state: "public", copy: null, refused: null });
  const photo = w.photo("INFO-2026-0106-photo", makePng(4, 4));
  assert.deepEqual(w.cc.documentCopy(photo), { state: "photo", copy: null, refused: null });
  /* a miss: one queue row and nothing else */
  const member = supplied(w, "INFO-2026-0101-knock", KNOCKED, { via: null });
  const before = w.snapshot();
  assert.deepEqual(w.cc.documentCopy(`sha256:${member.toUpperCase()}`), { state: "pending", copy: null, refused: null });
  const after = w.snapshot();
  assert.deepEqual(Object.keys(after).filter((t) => after[t] !== before[t]), ["document_copy_queue"], "the one write");
  assert.deepEqual(w.cc.documentCopy(member), { state: "pending", copy: null, refused: null });
  assert.equal(queue(w).length, 1, "queued once");
  assert.equal(typeof w.cc.documentCopy(member).then, "undefined", "synchronous");
  await w.cc.copyBatch({});
  const c = w.cc.documentCopy(member);
  assert.equal(c.state, "copy");
  assert.match(c.copy, /^[0-9a-f]{64}$/);
  assert.deepEqual(w.bucket.calls.filter(([op]) => op === "get"), [], "documentCopy reads no bucket");
  /* undetermined: its tables, or R62, cannot be read */
  const other = supplied(w, "INFO-2026-0103-other", REFUSED, { via: null });
  const prov = w.cc.provenance;
  w.cc.provenance = { fetchedByThisCopy: () => { throw new Error("down"); } };
  assert.deepEqual(w.cc.documentCopy(other), { state: "undetermined", copy: null, refused: null });
  w.cc.provenance = null;
  assert.equal(w.cc.documentCopy(other).state, "undetermined");
  w.cc.provenance = prov;
  w.st.sql.exec(`DROP TABLE document_copies`);
  assert.equal(w.cc.documentCopy(other).state, "undetermined");
  for (const bad of [null, undefined, "", "abc", 42, {}]) assert.equal(w.cc.documentCopy(bad).state, "undetermined");
});

/* ---------------------------------------------------------------- R17 */

test("R17 onCopyWork: a listener registers once and is called once with {at} (copyWake as it then stands) after an act that queues a member document commits; never inside a rolled-back act; one that throws or rejects changes nothing; no call names a member or a file", () => {
  const w = world();
  const calls = [];
  assert.deepEqual(w.cc.onCopyWork("scheduler", (a) => calls.push(a)), { ok: true, module: "scheduler" });
  const twice = w.cc.onCopyWork("scheduler", () => {});
  assert.deepEqual([twice.ok, twice.code], [false, "LISTENER_DECLARED"]);
  const bad = w.cc.onCopyWork("other", "not a function");
  assert.deepEqual([bad.ok, bad.code], [false, "LISTENER_MALFORMED"]);
  assert.equal(w.cc.onCopyWork("thrower", () => { throw new Error("boom"); }).ok, true);
  assert.equal(w.cc.onCopyWork("rejecter", () => Promise.reject(new Error("boom"))).ok, true);
  /* a receipt that queues */
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  assert.deepEqual(calls, [{ at: Date.parse(NOW) }]);
  assert.equal(queue(w).length, 1, "the act stands though listeners threw");
  /* a receipt that queues nothing new, a fetch: no call */
  w.receipt(knock, "doorbell");
  supplied(w, "INFO-2026-0102-fetched", REFUSED, { via: "direct" });
  assert.equal(calls.length, 1);
  /* a miss queued by documentCopy */
  const miss = supplied(w, "INFO-2026-0103-miss", CSV, { via: null, name: "c.csv", type: "text/csv" });
  assert.equal(w.cc.documentCopy(miss).state, "pending");
  assert.equal(calls.length, 2);
  /* inside a transaction: only after the commit, and never when it rolls back */
  const s = sha("in a transaction");
  w.record.transact(() => { w.receipt(s, "doorbell"); assert.equal(calls.length, 2, "not before the commit"); });
  assert.equal(calls.length, 3);
  assert.throws(() => w.record.transact(() => { w.receipt(sha("rolled back"), "doorbell"); throw new Error("x"); }));
  assert.equal(calls.length, 3, "a rolled-back act calls nothing");
  for (const c of calls) assert.deepEqual(Object.keys(c), ["at"]);
  assert.doesNotMatch(JSON.stringify(calls), /member|INFO-|[0-9a-f]{64}/);
});

/* ---------------------------------------------------------------- R1, R8 */

test("R1 a knock PDF with EXIF is carried as its copy only: the copy held derived, kind obscured; no byte, text, token or archive of the original; carried whole it is answered unheld; a fetched PDF is held whole", async () => {
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  const fetched = supplied(w, "INFO-2026-0102-fetched", KNOCKED.slice().reverse(), { via: "direct" });
  await w.cc.copyBatch({});
  const { copy } = w.cc.documentCopy(knock);
  const bytes = w.bucket.held.get(obscuredKey("bio", copy)).bytes.length;
  w.units.set(knock, { units: [{ seq: 0, extent: null, ref: "¶1", text: "Hello", truncated: false }], state: "whole" });
  const r = w.cc.holdMaterials(caseFm({ materials: [copyRow("INFO-2026-0101-knock", knock, copy), docRow("INFO-2026-0102-fetched", fetched)] }),
                               { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: copy, held: "derived" }, { sha: fetched, held: "evidence" }]);
  assert.deepEqual(r.files[0], { sha256: copy, ref: "INFO-2026-0101-knock", path: `materials/${copy}`, kind: "obscured", bytes });
  assert.equal(JSON.stringify(r.materials).includes(knock), false, "nothing of the original");
  assert.equal(w.unitCalls.includes(knock), false, "its extracted text not even asked");
  /* carried whole while it needs a copy: unheld, nothing written */
  const before = w.snapshot();
  const whole = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0101-knock", knock)] }), { caseId: CASE, edition: 2, at: NOW });
  assert.deepEqual([whole.materials, whole.files], [[], []]);
  assert.deepEqual(whole.unheld, [{ ref: "INFO-2026-0101-knock", kind: "document", sha256: knock, why: word("case-carriage.member_document_only_as_copy") }]);
  assert.equal(MEMBER_DOCUMENT_ONLY_AS_COPY, word("case-carriage.member_document_only_as_copy"));
  assert.deepEqual(w.snapshot(), before);
  /* the same for a pending, a refused and an undetermined one; a clean one is carried whole */
  const pending = supplied(w, "INFO-2026-0107-pending", REFUSED.slice(1), { via: null });
  const refused = supplied(w, "INFO-2026-0103-refused", REFUSED);
  const clean = supplied(w, "INFO-2026-0104-csv", CSV, { name: "c.csv", type: "text/csv" });
  await w.cc.copyBatch({});
  assert.deepEqual([w.cc.documentCopy(refused).state, w.cc.documentCopy(clean).state], ["refused", "clean"]);
  const rows = [docRow("A", pending), docRow("B", refused), docRow("C", clean)];
  const r2 = w.cc.holdMaterials(caseFm({ materials: rows }), { caseId: CASE, edition: 3, at: NOW });
  assert.deepEqual(r2.unheld.filter((u) => u.kind === "document").map((u) => [u.ref, u.why]),
                   [["A", MEMBER_DOCUMENT_ONLY_AS_COPY], ["B", MEMBER_DOCUMENT_ONLY_AS_COPY]]);
  assert.deepEqual(r2.materials, [{ sha: clean, held: "evidence" }]);
  /* a copy not held at the digest the row names */
  const wrong = w.cc.holdMaterials(caseFm({ materials: [copyRow("X", knock, sha("no such copy"))] }), { caseId: CASE, edition: 4, at: NOW });
  assert.deepEqual(wrong.unheld, [{ ref: "X", kind: "obscured", sha256: sha("no such copy"), why: word("case-carriage.why.obscured_copy_held") }]);
});

test("R8 a member document carries none of R8's files, carried whole (clean) or as its copy; a walk that reaches an archive this copy did not fetch carries it for no material and stops", async () => {
  const w = world();
  const zip = Buffer.from(makeZip([{ name: "notes.txt", data: "the notes", method: 0 }]));
  const archiveSha = sha(zip);
  w.doc("INFO-2026-0010-archive", { text: "the archive's page" });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0010-archive', 'snapshots/a.zip', 'binary', ?, ?)`,
                archiveSha, zip.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-2026-0010-archive', 'snapshots/a.zip', NULL, ?, ?, ?)`,
                archiveSha, zip.length, archiveSha);
  w.listing(archiveSha, [{ name: "notes.txt" }]);
  w.receipt(archiveSha, "doorbell");   // a member's archive
  const member = (id, fetched) => {
    const s = w.doc(id, { text: "the notes", fetched });
    w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents: [{
      file: `snapshots/${id}.txt`, capture: { method: "unpacked", sha256: s },
      container: { archive_sha256: archiveSha, index: 0, path: "notes.txt", member_sha256: s } }] }), id);
    return s;
  };
  /* a document also fetched directly, cut from the member's archive: the archive is carried for no material */
  const notes = member("INFO-2026-0011-notes", true);
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0011-notes", notes)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.files.map((f) => f.kind), ["document", "container"]);
  assert.deepEqual(r.unheld.filter((u) => u.kind === "archive"),
                   [{ ref: "INFO-2026-0011-notes", kind: "archive", sha256: archiveSha, why: ARCHIVE_SUPPLIED_BY_MEMBER }]);
  assert.equal(ARCHIVE_SUPPLIED_BY_MEMBER, word("case-carriage.archive_supplied_by_member"));
  /* negative control: the archive fetched, it is carried */
  w.receipt(archiveSha, "direct");
  const fetchedArchive = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0011-notes", notes)] }), { caseId: CASE, edition: 2, at: NOW });
  assert.deepEqual(fetchedArchive.files.map((f) => f.kind), ["document", "container", "archive"]);
  /* a member document (no fetch of its own) that is clean is carried whole with none of R8's files */
  const w2 = world();
  const s2 = supplied(w2, "INFO-2026-0104-csv", CSV, { name: "c.csv", type: "text/csv" });
  w2.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents: [{
    file: "snapshots/c.csv", capture: { method: "unpacked", sha256: s2, content_type: "text/csv" },
    container: { archive_sha256: sha("an archive"), index: 0, path: "c.csv", member_sha256: s2 } }] }), "INFO-2026-0104-csv");
  await w2.cc.copyBatch({});
  assert.equal(w2.cc.documentCopy(s2).state, "clean");
  const r2 = w2.cc.holdMaterials(caseFm({ materials: [docRow("C", s2)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r2.files.map((f) => f.kind), ["document"]);
  assert.deepEqual(r2.unheld.map((u) => u.kind), ["extracted_text"], "no container, archive or archive token answered");
});

/* ---------------------------------------------------------------- R13 */

test("R13 (T39) kind document: a row stating a member document's copy that is not its current copy lapses, and a member document carried whole whose state is not clean or public; undetermined lapses (fail closed); each row names its kind", async () => {
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  const fetched = supplied(w, "INFO-2026-0102-fetched", REFUSED, { via: "direct" });
  const clean = supplied(w, "INFO-2026-0104-csv", CSV, { name: "c.csv", type: "text/csv" });
  const pending = supplied(w, "INFO-2026-0107-pending", REFUSED.slice(1), { via: null });
  await w.cc.copyBatch({});
  const { copy } = w.cc.documentCopy(knock);
  const before = w.snapshot();
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [copyRow("K", knock, copy), docRow("F", fetched), docRow("C", clean)] })), [],
                   "the current copy, a fetched document whole and a clean one whole stand");
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [docRow("U", sha("never captured"))] })), [],
                   "a digest the record holds no capture under is no member document (R1 answers it unheld)");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  const lapsed = w.cc.marksLapsed(caseFm({ materials: [copyRow("K", knock, sha("an older copy")), docRow("W", knock), docRow("P", pending)] }));
  assert.deepEqual(lapsed.map((x) => [x.ref, x.kind]), [["K", "document"], ["W", "document"], ["P", "document"]]);
  assert.deepEqual(lapsed.map((x) => x.sha), [knock, knock, pending]);
  for (const x of lapsed) assert.ok(typeof x.why === "string" && x.why.length > 10);
  assert.deepEqual(w.snapshot(), before, "a miss here is not queued");
  /* a fetched document stated as a copy: no current copy, so it lapses */
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [copyRow("F", fetched, copy)] })).map((x) => x.kind), ["document"]);
  /* undetermined */
  w.cc.provenance = { fetchedByThisCopy: () => { throw new Error("down"); } };
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [copyRow("K", knock, copy), docRow("C", clean)] })).map((x) => [x.ref, x.kind, x.why]),
    [["K", "document", word("case-carriage.document_unread")],
     ["C", "document", word("case-carriage.document_unread")]]);
});

/* ---------------------------------------------------------------- R12, the label */

test("R12 (T39) the queue and the record of member documents' copies are declared to record-core with their classes; the record is append-only: a batch never rewrites or removes a row; COPY_CLEANED_LABEL is held once, mirroring OBSCURED_LABEL", async () => {
  const w = world();
  assert.deepEqual(w.cc.marksDeclaration, { ok: true });
  assert.deepEqual(CASE_CARRIAGE_DOCUMENT_TABLES.map((t) => [t.name, t.version_chain]), [["document_copy_queue", false], ["document_copies", true]]);
  for (const t of CASE_CARRIAGE_DOCUMENT_TABLES) {
    assert.ok(w.tables().includes(t.name));
    const again = w.record.declareTable(`probe-${t.name}`, [{ ...t }]);
    assert.equal(again.ok, false, `${t.name} is held by case-carriage`);
  }
  const a = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  await w.cc.copyBatch({});
  const kept = w.rows(`SELECT * FROM document_copies`);
  w.receipt(a, "direct");
  supplied(w, "INFO-2026-0104-csv", CSV, { name: "c.csv", type: "text/csv" });
  await w.cc.copyBatch({});
  const now = w.rows(`SELECT * FROM document_copies`);
  assert.deepEqual(now.slice(0, kept.length), kept, "never rewritten or removed");
  assert.equal(now.length, kept.length + 1);
  assert.equal(COPY_CLEANED_LABEL, word("document.cleaned.label"));
  assert.notEqual(COPY_CLEANED_LABEL, OBSCURED_LABEL);
});

/* ---------------------------------------------------------------- R15 (T40), R18 (T40) */

test("R15 (T40; N816, K2380) copyWake answers null while no evidence store or bucket is bound, whatever is queued; bound again, it answers as before (negative control)", async () => {
  const w = world();
  const now = Date.parse(NOW);
  const a = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  assert.equal(w.cc.copyWake(now), now, "negative control: bound, a queued untried document wakes now");
  const store = w.record.evidenceStore, bucket = w.cc.bucket;
  for (const [label, spoil] of [["no evidence store", () => { w.record.evidenceStore = () => null; }],
                                ["an evidence store that throws", () => { w.record.evidenceStore = () => { throw new Error("unbound"); }; }],
                                ["no bucket", () => { w.cc.bucket = null; }]]) {
    spoil();
    const before = w.snapshot();
    assert.equal(w.cc.copyWake(now), null, label);
    assert.equal(w.cc.copyWake(NOW), null, `${label}, an ISO instant`);
    assert.deepEqual(w.snapshot(), before, `${label}: writes nothing`);
    assert.deepEqual(queue(w).map((q) => q.capture), [a], `${label}: still queued`);
    /* copyBatch, unbound, refuses before stamping a try, so nothing would re-arm it (K2380) */
    assert.equal((await w.cc.copyBatch({})).code, "DOCUMENT_COPY_NO_STORE", label);
    assert.equal(queue(w)[0].tried, null, `${label}: no try stamped`);
    w.record.evidenceStore = store;
    w.cc.bucket = bucket;
    assert.equal(w.cc.copyWake(now), now, `${label}: bound again, it wakes now`);
  }
  /* bound, after a failed read: the retry instant, as before */
  w.evidence.held.delete(a);
  await w.cc.copyBatch({});
  assert.equal(w.cc.copyWake(now), now + DOCUMENT_COPY_RETRY_MS);
  w.cc.bucket = null;
  assert.equal(w.cc.copyWake(now), null, "unbound, null even with a retry pending");
});

test("R18 (T40; N818, K2383) a refused onReceipt registration ({ok: false}, a throw, or none to ask) is a start-up fault: kept, answered by faults() as {notice: \"onReceipt\", reason, detail}, and logged; a registration that stands leaves no fault (negative control); faults() writes nothing and never throws", async () => {
  const { CaseCarriage } = await import("../../../src/case-carriage/index.mjs");
  const w = world();
  /* negative control: the fixture's instance registered with the real provenance at creation, and a receipt queues */
  assert.deepEqual(w.cc.faults(), []);
  supplied(w, "INFO-2026-0101-knock", KNOCKED);
  assert.equal(queue(w).length, 1, "the listener stands");
  const logged = [], error = console.error;
  console.error = (...a) => logged.push(a.join(" "));
  try {
    /* the real provenance refuses a second registration by this module (membership R81's LISTENER_DECLARED) */
    const second = w.cc.start();
    assert.deepEqual([second.ok, second.code], [false, "LISTENER_DECLARED"]);
    assert.deepEqual(w.cc.faults(), [{ notice: "onReceipt", reason: second.reason ?? second.code, detail: second.detail ?? null }]);
    const cases = [
      ["an answer {ok: false}", { onReceipt: () => ({ ok: false, reason: "LISTENER_MALFORMED", detail: "refused here" }) },
       { notice: "onReceipt", reason: "LISTENER_MALFORMED", detail: "refused here" }],
      ["a throw", { onReceipt: () => { throw new Error("provenance is down"); } },
       { notice: "onReceipt", reason: "REGISTRATION_THREW", detail: "provenance is down" }],
      ["no onReceipt to ask", {}, { notice: "onReceipt", reason: "NO_RECEIPT_NOTICE", detail: localize("case-carriage.index.no_provenance_onreceipt", "no provenance onReceipt to register the receipt listener with") }],
      ["an answer that is no answer", { onReceipt: () => undefined },
       { notice: "onReceipt", reason: "REGISTRATION_UNANSWERED", detail: "the registration answered undefined" }],
    ];
    for (const [label, provenance, fault] of cases) {
      const cc = new CaseCarriage({ storage: w.st, record: w.record, provenance });
      assert.deepEqual(cc.faults(), [], `${label}: none before start`);
      const r = cc.start();
      assert.equal(r.ok, false, label);
      assert.deepEqual(cc.faults(), [fault], label);
      const f = cc.faults();
      f[0].reason = "changed by the caller";
      assert.deepEqual(cc.faults(), [fault], `${label}: answered as a copy`);
    }
    assert.equal(logged.length, 5, "each fault logged");
    assert.ok(logged.every((l) => l.startsWith("case-carriage: the onReceipt notice refused its registration")), logged.join("\n"));
    /* negative control: a registration that stands keeps no fault and logs nothing */
    const ok = new CaseCarriage({ storage: w.st, record: w.record, provenance: { onReceipt: (m) => ({ ok: true, module: m }) } });
    assert.deepEqual(ok.start(), { ok: true, module: "case-carriage" });
    assert.deepEqual(ok.faults(), []);
    assert.equal(logged.length, 5);
  } finally { console.error = error; }
  const before = w.snapshot();
  assert.doesNotThrow(() => w.cc.faults());
  assert.deepEqual(w.snapshot(), before, "faults() writes nothing");
});

/* ---------------------------------------------------------------- R15 (T51; K4570 G9) copyNow */

test("R15 (T51; G9) copyNow: a queued 356-byte text document is made in the act, awaited: copyNow answers it clean and the next documentCopy answers clean, with no scheduler tick; a 5 MB document is not copied by copyNow, is never read, and stays queued for the alarm's copyBatch", async () => {
  assert.equal(COPY_NOW_MAX_BYTES, 2 * 1024 * 1024);
  const w = world();
  const text = Buffer.from("street,count\n".padEnd(356, "x"));
  assert.equal(text.length, 356);
  const small = supplied(w, "INFO-2026-0101-small", text, { name: "notes.txt", type: "text/plain" });
  const big = supplied(w, "INFO-2026-0102-big", Buffer.alloc(5 * 1024 * 1024, "a"), { name: "big.txt", type: "text/plain" });
  assert.equal(w.cc.documentCopy(small).state, "pending", "the prepare's own answer, before copyNow: queued, nothing runs");
  const r = await w.cc.copyNow({ shas: [small, big], maxBytes: COPY_NOW_MAX_BYTES });
  assert.deepEqual(r, { ok: true, copied: 0, clean: 1, public: 0, refused: 0, failed: 0, skipped: 1, remaining: 1 });
  assert.deepEqual(w.cc.documentCopy(small), { state: "clean", copy: null, refused: null });
  assert.equal(w.cc.documentCopy(big).state, "pending", "the large one is left to the alarm");
  assert.deepEqual(queue(w).map((q) => q.capture), [big]);
  assert.equal(w.evidence.calls.some(([op, k]) => op === "get" && k === big), false, "a document over the bound is not read");
  const alarm = await w.cc.copyBatch({});
  assert.deepEqual([alarm.clean, alarm.remaining], [1, 0], "the alarm path makes it");
  assert.equal(w.cc.documentCopy(big).state, "clean");
});

test("R15 (T51; G9) copyNow keeps copyBatch's rules: only documents named and queued are made; a maxBytes above COPY_NOW_MAX_BYTES is held to it; a read that fails leaves the document queued; with no evidence store it answers DOCUMENT_COPY_NO_STORE and derives nothing; a document with a doc-clean refusal is recorded refused; a copy is held as copyBatch holds it", async () => {
  const w = world();
  const a = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  const other = supplied(w, "INFO-2026-0104-csv", CSV, { name: "c.csv", type: "text/csv" });
  const refused = supplied(w, "INFO-2026-0103-refused", REFUSED, { via: null });
  w.cc.documentCopy(refused);
  const r = await w.cc.copyNow({ shas: [a, refused, sha("never captured"), "not a digest"], maxBytes: 1e12 });
  assert.deepEqual(r, { ok: true, copied: 1, clean: 0, public: 0, refused: 1, failed: 0, skipped: 0, remaining: 1 });
  assert.deepEqual(queue(w).map((q) => q.capture), [other], "a document not named stays queued");
  const k = w.cc.documentCopy(a);
  assert.equal(k.state, "copy");
  assert.ok(w.bucket.held.get(obscuredKey("bio", k.copy)), "held as copyBatch holds it");
  assert.equal(w.cc.documentCopy(refused).refused.code, "IMAGE_NOT_CLEANABLE");
  /* the bound is held whatever maxBytes says */
  const w2 = world();
  const huge = supplied(w2, "INFO-2026-0105-huge", REFUSED, { stated: COPY_NOW_MAX_BYTES + 1 });
  assert.equal((await w2.cc.copyNow({ shas: [huge], maxBytes: 1e12 })).skipped, 1);
  assert.equal(w2.evidence.calls.some(([op]) => op === "get"), false);
  /* a read that fails leaves it queued */
  const w3 = world();
  const s3 = supplied(w3, "INFO-2026-0101-knock", KNOCKED);
  w3.evidence.held.delete(s3);
  const f = await w3.cc.copyNow({ shas: [s3] });
  assert.deepEqual([f.failed, f.remaining], [1, 1]);
  assert.equal(w3.cc.documentCopy(s3).state, "pending");
  /* no store bound: nothing derived */
  const w4 = world();
  const s4 = supplied(w4, "INFO-2026-0101-knock", KNOCKED);
  w4.record.evidenceStore = () => null;
  const before = w4.snapshot();
  assert.equal((await w4.cc.copyNow({ shas: [s4] })).code, "DOCUMENT_COPY_NO_STORE");
  assert.deepEqual(w4.snapshot(), before);
  /* never rejects on bad input */
  for (const bad of [undefined, null, {}, { shas: "x" }, { shas: [] }]) assert.equal((await w.cc.copyNow(bad)).ok, true);
});

test("R15 (T51; G136c) the attempt is stamped (tried) before the clean runs, so a cleaner that crashes mid-clean is not re-run on every wake: a clean that throws is attempted once and not again until DOCUMENT_COPY_RETRY_MS; copyWake reads the stamp; a clean that succeeds after a stamped attempt stores as before", async () => {
  /* the stamp is in the table while the clean is still running (a crash there leaves it) */
  const w = world();
  const knock = supplied(w, "INFO-2026-0101-knock", KNOCKED);
  const real = w.cc.clean;
  let seen = null;
  w.cc.clean = async (bytes) => { seen = queue(w); return real(bytes); };
  const ok = await w.cc.copyBatch({});
  assert.deepEqual(seen, [{ capture: knock, queued: NOW, tried: NOW }], "tried is stamped before the clean is called");
  assert.deepEqual([ok.copied, ok.failed, ok.remaining], [1, 0, 0], "a clean that succeeds stores as before");
  assert.equal(w.cc.documentCopy(knock).state, "copy");
  assert.deepEqual(queue(w), []);
  /* a clean that throws: attempted once; the next wake does not call it until its back-off */
  const t = world();
  const crash = supplied(t, "INFO-2026-0101-crash", KNOCKED);
  let calls = 0;
  t.cc.clean = async () => { calls++; throw new Error("the cleaner crashed mid-clean"); };
  const first = await t.cc.copyBatch({});
  assert.deepEqual([calls, first.failed, first.remaining], [1, 1, 1]);
  const now = Date.parse(NOW);
  assert.equal(t.cc.copyWake(now), now + DOCUMENT_COPY_RETRY_MS, "the wake waits for the back-off");
  t.clock.now = LATER(1000);
  assert.equal((await t.cc.copyBatch({})).failed, 0);
  assert.equal(calls, 1, "the next wake does not call the cleaner again");
  t.clock.now = LATER(DOCUMENT_COPY_RETRY_MS);
  await t.cc.copyBatch({});
  assert.equal(calls, 2, "after the back-off it is tried again");
  assert.equal(t.cc.documentCopy(crash).state, "pending");
  /* copyNow stamps before too (it ignores the delay, as the act asked) */
  const n = world();
  const named = supplied(n, "INFO-2026-0101-named", KNOCKED);
  const realN = n.cc.clean;
  let sawNow = null;
  n.cc.clean = async (bytes) => { sawNow = queue(n)[0].tried; return realN(bytes); };
  await n.cc.copyNow({ shas: [named] });
  assert.equal(sawNow, NOW, "copyNow stamps before the clean");
});

/* The entry count a ZIP's end record states: the 16-bit field, or ZIP64's 64-bit one when that is 0xffff. */
function endCount(z) {
  const b = Buffer.from(z), e = b.length - 22;
  assert.equal(b.readUInt32LE(e), 0x06054b50, "an end record at the end");
  const c16 = b.readUInt16LE(e + 10);
  if (c16 !== 0xffff) return c16;
  assert.equal(b.readUInt32LE(e - 20), 0x07064b50, "ZIP64's locator precedes the end record");
  return Number(b.readBigUInt64LE(Number(b.readBigUInt64LE(e - 20 + 8)) + 32));
}

test("R15 (T51; G136c, DOCS C1) a 70,009-entry DOCX through the real doc-clean: a cleaner that crashes after its work is attempted once and not re-run on the next wake; after the back-off the copy is made with its written count equal to the read count", async () => {
  const entries = unzipCopy(docx({ meta: false })).parts.map((p) => ({ name: p.name, data: p.data, method: p.method }));
  for (let i = 0; i < 70000; i++) entries.push({ name: `x/${i}`, data: enc("p"), method: 0, zip64: false });
  const chunks = [];
  for await (const c of zipChunks64(entries)) chunks.push(c);
  const big = new Uint8Array(Buffer.concat(chunks));
  const read = endCount(big);
  assert.equal(read, entries.length, "the fixture states its entries all");
  const w = world();
  const s = supplied(w, "INFO-2026-0101-big", big, { name: "file.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const real = w.cc.clean;
  let calls = 0, made = null;
  w.cc.clean = async (bytes) => {
    calls++;
    made = await real(bytes);
    if (calls === 1) throw new Error("the cleaner died after its work");
    return made;
  };
  const first = await w.cc.copyBatch({});
  assert.deepEqual([calls, first.failed, first.remaining], [1, 1, 1]);
  w.clock.now = LATER(1000);
  await w.cc.copyBatch({});
  assert.equal(calls, 1, "the next wake does not loop");
  w.clock.now = LATER(DOCUMENT_COPY_RETRY_MS);
  const again = await w.cc.copyBatch({});
  assert.equal(calls, 2);
  assert.equal(made.ok, true, made.detail);
  assert.equal(again.copied + again.clean, 1, "the copy is made after the back-off");
  assert.equal(again.remaining, 0);
  if (made.bytes) assert.equal(endCount(made.bytes), read, "written count == read count");
});
