/* publication — T38 (T38-29): C-122.6 `PHOTO_MARKS_CHANGED_SINCE` takes `words.json`'s `photo.refused.changed`,
   verbatim (R33; DEC-183 (4), K2291), and the commit answers it with that translation (R57). The words file is read
   here by key, so a re-wording there is a red here until the row follows it. The last test drives the real
   case-carriage (its R9–R14): a real photo marked, its copy carried, the mark withdrawn, and a photo carried whole.
   Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { planeWorld as world, infoMd, sha, V, NOW } from "./fixture.mjs";
import { rowOf, CASE_SOURCES_CHECKS } from "../../../src/publication/checks.mjs";
import { caseCarriageOf, OBSCURED_LABEL } from "../../../src/case-carriage/index.mjs";

const WORDS = new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url);
const word = (key) => {
  const list = JSON.parse(readFileSync(WORDS, "utf8"));
  const hits = (Array.isArray(list) ? list : list.words || []).filter((w) => w && w.key === key);
  assert.equal(hits.length, 1, `${key} is one word in words.json`);
  return hits[0];
};

test("R33 (T38) C-122.6 PHOTO_MARKS_CHANGED_SINCE's translation is words.json's photo.refused.changed, verbatim and protected, held once in the C-122 family", () => {
  const w = word("photo.refused.changed");
  assert.equal(w.protected, true);
  assert.equal(w.note, "PHOTO_MARKS_CHANGED_SINCE");
  assert.deepEqual(rowOf("PHOTO_MARKS_CHANGED_SINCE"), { code: "PHOTO_MARKS_CHANGED_SINCE", check: "C-122.6", translation: w.en });
  assert.equal(w.en, "A mark changed after this case was prepared. Prepare it again before signing.");
  assert.equal(Object.values(CASE_SOURCES_CHECKS).filter((x) => x.check === "C-122.6").length, 1, "held once");
});

test("R57 (T38) R33 every row case-carriage answers lapsed (a mark withdrawn since preparation, a photo carried whole, marks that cannot be read) refuses the commit with words.json's photo.refused.changed, naming each, and nothing is committed", () => {
  const en = word("photo.refused.changed").en;
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const p = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  assert.equal(p.ok, true, JSON.stringify(p));
  const roles = [{ target: "INFO-2026-0101-first", version_sha: p.bundleSha }];
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  const cc = caseCarriageOf(w.host);
  const sha = "ab".repeat(32);
  const lapses = [
    [{ ref: "INFO-2026-0020-photo", sha, why: "a mark was withdrawn since the case was prepared" }],
    [{ ref: "INFO-2026-0020-photo", sha, why: "a photo carried whole" }],
    null,
  ];
  w.prepare("CASE-2026-0001", 1, { project: proj, roles });
  const before = w.snapshot();
  for (const answer of lapses) {
    cc.marksLapsed = () => answer;
    const r = w.signCase("CASE-2026-0001", 1, { project: proj, roster });
    assert.equal(r.ok, false);
    assert.deepEqual({ reason: r.reason, code: r.code, check: r.check, translation: r.translation },
                     { reason: "PHOTO_MARKS_CHANGED_SINCE", code: "PHOTO_MARKS_CHANGED_SINCE", check: "C-122.6", translation: en });
    assert.deepEqual(r.photos, answer ?? [{ ref: null, sha: null, why: "the photos' marks could not be read" }]);
    assert.deepEqual(w.snapshot(), before, "nothing is committed");
  }
  cc.marksLapsed = () => [];
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster }).ok, true, "none lapsed commits");
});

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

test("R57 (T38) R33 over the real case-carriage: a photo carried as the copy its marks derive commits; a mark withdrawn since preparation, or a photo carried whole, refuses the commit PHOTO_MARKS_CHANGED_SINCE with words.json's photo.refused.changed, naming the photo, and nothing is committed", async () => {
  const en = word("photo.refused.changed").en;
  const held = new Map(), bucket = {
    put: async (k, b) => { held.set(k, Buffer.from(b)); return { key: k }; },
    get: async (k) => (held.has(k) ? { arrayBuffer: async () => held.get(k) } : null),
    head: async (k) => (held.has(k) ? { size: held.get(k).length } : null) };
  const w = world({ carriage: { bucket, store: "bio" } });
  w.member("olive");
  const proj = w.project("Parks", "olive");
  /* the photo: a capture of an information bundle, held in the evidence store, its provenance an image's */
  const evidence = new Map();
  w.record.evidenceStore = () => ({ head: async (d) => (evidence.has(String(d)) ? { size: evidence.get(String(d)).length } : null),
                                    get: async (d) => (evidence.has(String(d)) ? { arrayBuffer: async () => evidence.get(String(d)) } : null),
                                    put: (d, b) => evidence.set(String(d), Buffer.from(b)) });
  const PHOTO = "INFO-2026-0020-photo", bytes = png(20, 20), p = sha(bytes), path = "snapshots/photo.png";
  w.doc(PHOTO);
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                p, PHOTO, path, bytes.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`, PHOTO, path, p, bytes.length, p);
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
                JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", grade: "B", sha256: p, encoding: "binary",
                                                                       bytes: bytes.length, content_type: "image/png" } }] }), PHOTO);
  evidence.set(p, bytes);
  const cc = caseCarriageOf(w.host);
  assert.equal(w.p.caseCarriage, cc);
  const m1 = await cc.obscureMark({ captureSha: p, areas: [{ rect: [1, 1, 6, 6], kind: "person" }], by: V("olive") });
  const m2 = await cc.obscureMark({ captureSha: p, areas: [{ rect: [10, 10, 15, 15], kind: "plate" }], by: V("olive") });
  assert.equal(m1.ok && m2.ok, true, JSON.stringify([m1, m2]));
  const copy = m2.copy.sha256;

  const f = w.promote("INFO-2026-0101-first", infoMd("INFO-2026-0101-first"), "information");
  const roles = [{ target: "INFO-2026-0101-first", version_sha: f.bundleSha }];
  const roster = roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha }));
  const row = (over) => ({ ref: PHOTO, kind: "document", sha: p, text_sha: null, origin: null, archived_copy: null,
                           rests_under: "load_bearing", ...over });
  const asCopy = row({ included: false, obscured: { copy, label: OBSCURED_LABEL } }), whole = row({ included: true });
  const refused = (r, why) => {
    assert.deepEqual({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation },
                     { ok: false, reason: "PHOTO_MARKS_CHANGED_SINCE", code: "PHOTO_MARKS_CHANGED_SINCE", check: "C-122.6", translation: en });
    assert.deepEqual(r.photos.map((x) => [x.ref, x.sha]), [[PHOTO, p]]);
    assert.match(r.photos[0].why, why);
  };

  /* a photo carried whole lapses always, marked or not (N779) */
  w.prepare("CASE-2026-0001", 1, { project: proj, roles, materials: [whole] });
  let before = w.snapshot();
  refused(w.signCase("CASE-2026-0001", 1, { project: proj, roster }), /./);
  assert.deepEqual(w.snapshot(), before, "nothing is committed");

  /* a withdrawal since preparation (case-carriage R14) lapses the copy the case names */
  w.prepare("CASE-2026-0002", 1, { project: proj, roles, materials: [asCopy] });
  const wd = await cc.obscureMarkWithdraw({ captureSha: p, mark: m2.mark, reason: "not a plate after all", by: V("olive") });
  assert.equal(wd.ok, true, JSON.stringify(wd));
  assert.notEqual(wd.copy?.sha256 ?? null, copy);
  const after = w.snapshot();
  refused(w.signCase("CASE-2026-0002", 1, { project: proj, roster }), /withdrawn/);
  assert.deepEqual(w.snapshot(), after, "nothing is committed");

  /* negative control: a preparation naming the current copy commits */
  w.prepare("CASE-2026-0003", 1, { project: proj, roles,
    materials: [row({ included: false, obscured: { copy: wd.copy.sha256, label: OBSCURED_LABEL } })] });
  const ok = w.signCase("CASE-2026-0003", 1, { project: proj, roster });
  assert.equal(ok.ok, true, JSON.stringify(ok));
});
