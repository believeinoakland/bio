/* retrieval R94 (fix round 4b, F3 verification 2; K4512; provenance R72, R73), at the frontier's interface: a capture held in
   parts is one capture. The register lists wholes alone (provenance R74: the parts are rows of `register_parts`, never of
   `register`), so the content and meaning levels list a capture the record holds with no row at that level by its whole: before
   any row one capture is missing, and once the whole has its rows nothing of it stays in `never_looked` or
   `missing_unexplained`. The fixture is a capture of three parts promoted by the real chain, as screens-intake promotes one. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, infoMd } from "./fixture.mjs";

const MIB = 1024 * 1024;
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const LEVELS = ["content", "meaning"];

function heldInParts(w, id, label) {
  const sizes = [8 * MIB, 8 * MIB, 4 * MIB + 17];
  const held = sizes.map((bytes, i) => ({ file: `snapshots/${label}.part${i}`, sha256: sha(`${label}:p${i}`), bytes }));
  const whole = sha(`${label}:whole`);
  const doc = { file: `snapshots/${label}`, locator: `https://example.org/snapshots/${label}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: sizes.reduce((a, b) => a + b, 0) },
    origin: { kind: "named_request" }, parts: held };
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `mp-${label}`, author: "member:ann", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(id) }, { path: "data/provenance.json", text: JSON.stringify({ documents: [doc] }, null, 1) },
            ...held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: [{ sha256: whole, path: doc.file, encoding: "binary", bytes: doc.capture.bytes,
                 parts: held.map((p) => ({ sha256: p.sha256, path: p.file, bytes: p.bytes })) }] });
  assert.equal(r.ok, true, `the real chain promotes the multipart capture: ${JSON.stringify(r).slice(0, 300)}`);
  return { whole, parts: held.map((p) => p.sha256) };
}

/** The captures a level lists as missing a row, by both lists. */
const missing = (w, level, extra = {}) => {
  const f = w.retrieval.frontier({ level, viewer: V("vera"), ...extra });
  return { f, subjects: [...f.never_looked, ...f.missing_unexplained].filter((x) => (x.subject_kind ?? "capture") === "capture").map((x) => x.subject) };
};
const observeAll = (w, level, subject, id) => w.observe({ level, subject_kind: "capture", subject, authority_kind: "extract", authority: id,
  state: level === "content" ? "LOOKED_INDETERMINATE" : "PRESENT", ...(level === "content" ? { condition: "scanned" } : {}) });

test("R94: before any row a capture held in three parts is one capture missing at the content and meaning levels, never four", () => {
  const w = world();
  const id = "INFO-2026-0001-big";
  const m = heldInParts(w, id, "a");
  for (const level of LEVELS) {
    const { subjects } = missing(w, level);
    assert.deepEqual(subjects, [m.whole], `${level}: the whole alone`);
  }
});

test("R94: once the whole has its content and meaning rows nothing of the document stays in never_looked or missing_unexplained", () => {
  const w = world();
  const id = "INFO-2026-0001-big";
  const m = heldInParts(w, id, "b");
  for (const level of LEVELS) observeAll(w, level, m.whole, id);
  for (const level of LEVELS) {
    const { f, subjects } = missing(w, level);
    assert.deepEqual(subjects, [], `${level}: none missing`);
    assert.equal(f.never_looked_count, 0);
    assert.equal(f.missing_unexplained_count, 0);
    assert.ok(!f.looked.some((r) => m.parts.includes(r.subject)), "no part is in what was looked at");
  }
});

test("R94: the parts do not spend the level's bound: a limit of one walks the whole and a single capture, one at a time, and never a part", () => {
  const w = world();
  const id = "INFO-2026-0001-big";
  const m = heldInParts(w, id, "c");
  const c = w.cap("ctl", "ctl bytes");
  w.doc("INFO-2026-0002-ctl", {}, { captures: [c] });
  for (const level of LEVELS) {
    const walked = [];
    for (let i = 0; i < 6; i++) {
      const { f, subjects } = missing(w, level, { limit: 1 });
      if (!subjects.length) break;
      assert.equal(subjects.length, 1);
      walked.push(subjects[0]);
      assert.equal(f.truncated, walked.length < 2, `${level}: truncated while another capture remains`);
      observeAll(w, level, subjects[0], id);
    }
    assert.deepEqual(walked.sort(), [m.whole, c.sha].sort(), `${level}: the two captures, no part`);
  }
});

test("R94 control: single captures are listed as before, each once, and a hidden bundle's capture is listed for no one who may not see it", () => {
  const w = world();
  const a = w.cap("a", "bytes of a"), b = w.cap("b", "bytes of b");
  w.doc("INFO-2026-0003-two", {}, { captures: [a, b] });
  for (const level of LEVELS) assert.deepEqual(missing(w, level).subjects.sort(), [a.sha, b.sha].sort(), level);
  const m = heldInParts(w, "INFO-2026-0004-big", "d");
  const p = w.project("Private", "ann", { captures: [] });
  w.st.sql.exec(`UPDATE bundles SET project = ? WHERE bundle_id = ?`, p, "INFO-2026-0004-big");
  for (const level of LEVELS) {
    const subjects = missing(w, level).subjects;
    assert.ok(!subjects.includes(m.whole) && !subjects.some((s) => m.parts.includes(s)), `${level}: nothing of a bundle vera may not see`);
  }
});
