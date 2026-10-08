/* ratification R42 (T39; N805, K2308): a scheduled publication stopped by the commit's own refusal. A case edition
   carrying a real photo as the copy its marks derive (case-carriage R9–R14, reached through publication) is signed
   for a set time (`op=publishat`, R40) into publication's real waiting list (its R66); a mark on the photo is withdrawn
   after signing; publication's own `publishDue` (its R67), run past the time, hands the edition to the publisher this
   module registered (R43), whose commit is refused C-122.6 `PHOTO_MARKS_CHANGED_SINCE`. The edition is stopped
   `SCHEDULED_CHECK_REFUSED` (C-58.10), its `cause` the commit's own code, check and translation, and nothing is
   committed. Driven at the module's interface, over the real publication and case-carriage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { world, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V, NOW, sha } from "./fixture.mjs";
import { caseRatifyOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines, rowOf } from "../../../src/ratification/index.mjs";
import { rowOf as publicationRowOf } from "../../../src/publication/checks.mjs";
import { materialsLines } from "../../../src/case-grammar/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001", PHOTO = "INFO-2026-0020-photo";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const AT = { date: "2026-10-09", time: "09:30" };

/* A small RGB PNG (8-bit, not interlaced), never black. */
function png(width, height) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const tb = Buffer.from(t, "latin1"), l = Buffer.alloc(4), c = Buffer.alloc(4);
    l.writeUInt32BE(d.length); c.writeUInt32BE(crc(Buffer.concat([tb, d]))); return Buffer.concat([l, tb, d, c]); };
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) raw.set([40 + x * 7, 40 + y * 11, 120], y * (width * 3 + 1) + 1 + x * 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr),
                        chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/* The world with publication's real set-time services (R66, R67) and case-carriage holding obscured copies; a photo
   captured by an information bundle and marked twice; a /6 case document Alice (the project's owner, with an attesting
   key) may sign, carrying the photo as the copy its marks derive; signed for a set time through op=publishat. */
async function signedForLater() {
  const held = new Map(), bucket = {
    put: async (k, b) => { held.set(k, Buffer.from(b)); return { key: k }; },
    get: async (k) => (held.has(k) ? { arrayBuffer: async () => held.get(k) } : null),
    head: async (k) => (held.has(k) ? { size: held.get(k).length } : null) };
  const w = world({ carriage: { bucket, store: "bio" } });
  const key = await newKey();
  w.member("alice", { signer: key });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  w.r.registerHoldReader({ holdsOn: () => ({ held: false }) });
  const P = w.project("Team", "alice");
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);

  /* the photo: a capture of an information bundle, held in the evidence store, registered (provenance's `register`
     read contract) and recorded with an image's type */
  const bytes = png(20, 20), p = sha(bytes), path = "snapshots/photo.png";
  w.info(PHOTO);
  w.st.db.exec(`CREATE TABLE IF NOT EXISTS register (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, path TEXT NOT NULL,
                encoding TEXT, bytes INTEGER, registered TEXT, PRIMARY KEY (capture_sha, bundle_id, path))`);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                p, PHOTO, path, bytes.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                PHOTO, path, p, bytes.length, p);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 0, ?)`,
                PHOTO, JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", grade: "B", sha256: p,
                  encoding: "binary", bytes: bytes.length, content_type: "image/png" } }] }), "0".repeat(64));
  w.evidence.set(`bio/captures/${p}`, bytes);
  const cc = w.realPub.caseCarriage;
  const m1 = await cc.obscureMark({ captureSha: p, areas: [{ rect: [1, 1, 6, 6], kind: "person" }], by: V("alice") });
  const m2 = await cc.obscureMark({ captureSha: p, areas: [{ rect: [10, 10, 15, 15], kind: "plate" }], by: V("alice") });
  assert.equal(m1.ok && m2.ok, true, JSON.stringify([m1, m2]));

  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const { materials, ...doc } = cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  assert.deepEqual(materials, []);
  const asCopy = { ref: PHOTO, kind: "document", sha: p, text_sha: null, origin: null, archived_copy: null,
                   rests_under: "supporting", obscured: { copy: m2.copy.sha256, label: "Parts of this photo are covered." } };
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc), ...materialsLines([asCopy])],
                             body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await signCase(key, CASE, 1, docSha);
  const body = { caseId: CASE, edition: 1, docSha, sigArmored: sig, attestorKey: key.keyB64, attestorMember: "alice",
                 gateVersion: "g1", deliveredBy: "member:alice", at: AT };
  const waiting = w.op("publishat", {}, body);
  assert.equal(waiting.ok, true, JSON.stringify(waiting));
  assert.equal(waiting.state, "waiting");
  const pastItsTime = new Date(Date.parse(waiting.publish_at) + 3600e3).toISOString();
  return { w, cc, p, m2, pastItsTime, body, docSha, sig };
}

const nothingCommitted = (w) => {
  assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, CASE).sig_armored, null, "the document is unsigned");
  assert.equal(w.count("published_cases"), 0, "no case edition committed");
};

test("R42 (T39): a photo's mark withdrawn after signing stops the waiting edition at its time: publishDue finds it stopped SCHEDULED_CHECK_REFUSED (C-58.10), its cause the commit's own PHOTO_MARKS_CHANGED_SINCE (C-122.6) with that row's translation, and nothing is committed", async () => {
  const s = await signedForLater();
  const wd = await s.cc.obscureMarkWithdraw({ captureSha: s.p, mark: s.m2.mark, reason: "not a plate after all", by: V("alice") });
  assert.equal(wd.ok, true, JSON.stringify(wd));
  const due = await s.w.realPub.publishDue(s.pastItsTime);
  assert.equal(due.ok, true, JSON.stringify(due));
  assert.equal(due.taken.length, 1);
  const [taken] = due.taken;
  assert.equal(taken.state, "stopped", JSON.stringify(taken));
  const commitsOwn = publicationRowOf("PHOTO_MARKS_CHANGED_SINCE");
  assert.equal(commitsOwn.translation, "A mark changed after this case was prepared. Prepare it again before signing.");
  assert.equal(taken.reasons.length, 1, JSON.stringify(taken.reasons));
  const [stop] = taken.reasons;
  assert.deepEqual([stop.code, stop.check, stop.translation],
                   ["SCHEDULED_CHECK_REFUSED", "C-58.10", rowOf("SCHEDULED_CHECK_REFUSED").translation]);
  assert.deepEqual([stop.cause.code, stop.cause.check, stop.cause.translation],
                   [commitsOwn.code, commitsOwn.check, commitsOwn.translation], "the commit's own code, check and translation");
  assert.match(stop.cause.detail, /photo/);
  /* publication R67 records the stop with that cause, as listed (its R69) */
  const listed = s.w.realPub.scheduledEditions({ case: CASE });
  const entry = (listed.editions || []).find((e) => Number(e.edition) === 1);
  assert.equal(entry.state, "stopped", JSON.stringify(listed));
  nothingCommitted(s.w);
});

test("R42 (T39): negative control: with the marks as signed, publishDue past the time publishes the same waiting edition", async () => {
  const s = await signedForLater();
  const due = await s.w.realPub.publishDue(s.pastItsTime);
  assert.equal(due.taken.length, 1);
  assert.equal(due.taken[0].state, "published", JSON.stringify(due.taken[0]));
  assert.equal(s.w.count("published_cases"), 1);
});

/* publication R57 (T39; K2370): when C-122.6 and C-122.7 both hold, the commit answers both in `refusals`, the first
   also at top level, each `{reason, code, check, translation, photos|documents, detail}`. Built against that stated
   shape until publication's merge: the commit here answers it as stated, over the real case and signature. */
const PHOTO_REFUSAL = { ok: false, ...publicationRowOf("PHOTO_MARKS_CHANGED_SINCE"), reason: "PHOTO_MARKS_CHANGED_SINCE",
  photos: [{ ref: PHOTO, sha: "ab".repeat(32), why: "a mark was withdrawn since the case was prepared" }],
  detail: "1 photo(s) this case document carries cannot be published as prepared" };
const DOCUMENT_REFUSAL = { ok: false, reason: "DOCUMENT_COPY_CHANGED_SINCE", code: "DOCUMENT_COPY_CHANGED_SINCE",
  check: "C-122.7", translation: "A document's publication copy changed after this case was prepared.",
  documents: [{ ref: "INFO-2026-0030-letter", sha: "cd".repeat(32), why: "its copy is no longer the one the case names" }],
  detail: "1 member document(s) this case document carries cannot be published as prepared" };
const BOTH = { ...PHOTO_REFUSAL, caseId: CASE, edition: 1, refusals: [PHOTO_REFUSAL, DOCUMENT_REFUSAL] };

test("R42 (T39; K2370): a commit refusing both C-122.6 and C-122.7 stops the waiting edition with one SCHEDULED_CHECK_REFUSED entry per refusal, each cause that refusal's own code, check and translation, in the commit's order; nothing committed", async () => {
  const s = await signedForLater();
  s.w.publication.commitCaseEdition = () => BOTH;
  const due = await s.w.realPub.publishDue(s.pastItsTime);
  const [taken] = due.taken;
  assert.equal(taken.state, "stopped", JSON.stringify(taken));
  assert.deepEqual(taken.reasons.map((x) => [x.code, x.check, x.translation]),
                   [["SCHEDULED_CHECK_REFUSED", "C-58.10", rowOf("SCHEDULED_CHECK_REFUSED").translation],
                    ["SCHEDULED_CHECK_REFUSED", "C-58.10", rowOf("SCHEDULED_CHECK_REFUSED").translation]]);
  assert.deepEqual(taken.reasons.map((x) => [x.cause.code, x.cause.check, x.cause.translation, x.cause.detail]),
                   [PHOTO_REFUSAL, DOCUMENT_REFUSAL].map((r) => [r.code, r.check, r.translation, r.detail]));
  nothingCommitted(s.w);
  /* one refusal alone, with no `refusals` list, is one entry */
  const one = await signedForLater();
  one.w.publication.commitCaseEdition = () => ({ ...DOCUMENT_REFUSAL, caseId: CASE, edition: 1 });
  const [t1] = (await one.w.realPub.publishDue(one.pastItsTime)).taken;
  assert.deepEqual(t1.reasons.map((x) => [x.code, x.cause.code, x.cause.check]),
                   [["SCHEDULED_CHECK_REFUSED", "DOCUMENT_COPY_CHANGED_SINCE", "C-122.7"]]);
  nothingCommitted(one.w);
});

test("R3 (T39; K2370): op=caseratify's answer relays the commit's refusals as the commit answered them, at the store half and through the Worker half; nothing committed", async () => {
  const s = await signedForLater();
  s.w.publication.scheduledEditions = () => ({ editions: [], cursor: null });   /* nothing waiting: the commit is asked */
  s.w.publication.commitCaseEdition = () => BOTH;
  const store = await s.w.r.ratifyCaseDocument({ ...s.body, at: undefined });
  assert.deepEqual(store, BOTH);
  const p = plane(s.w);
  const res = await caseRatifyOp(p.request({ caseId: CASE, edition: 1, expectedSha: s.docSha, sig: s.sig }), p.stub, p.ctx);
  assert.equal(res.status, 409, JSON.stringify(res.body));
  assert.deepEqual([res.body.reason, res.body.check, res.body.refusals], [BOTH.reason, BOTH.check, BOTH.refusals]);
  nothingCommitted(s.w);
});
