/* content R57 (T51; K4259): the transcriptions of one document, listed (`op=transcriptions`). Driven through the ops map as the
   door calls it, with the control plane's stamps in the query and the fields in the body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { contentOps, CONTENT_OP_NAMES, DECLARED_OPS } from "../../../src/content/ops.mjs";

const DOC = "INFO-2026-0001-a";

function setup() {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 4 });
  w.inquiry("INQ-2026-0001-q");
  w.doc("INFO-2026-0002-other", [w.cap("b")]);
  w.read(w.cap("b").sha, { pageCount: 2 });
  const tr = (page, o = {}) => w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page }, text: `page ${page} typed`,
    transcriber: V("ty"), viewer: V("ty"), ...o });
  /* the door's call: the stamps in the query, the fields in the body */
  const ask = (body, viewer = V("ty")) => {
    const url = new URL(`http://x/?op=transcriptions&viewer=${encodeURIComponent(viewer ?? "")}`);
    return contentOps(w.content, url, body).transcriptions();
  };
  return { w, a, tr, ask };
}

test("R57 a typed document lists its typings with their attestations, the text left to op=transcription", () => {
  const { tr, w, ask } = setup();
  const t1 = tr(1), t0 = tr(0);
  assert.equal(w.content.transcriptionAttest({ contentId: t1.content_id, attestor: V("zed"), viewer: V("zed"),
    at: "2026-09-28T00:00:00Z", note: "Compared with the scan." }).ok, true);
  assert.equal(w.content.transcriptionAttest({ contentId: t1.content_id, attestor: V("amy"), viewer: V("amy"),
    at: "2026-09-27T00:00:00Z", note: "Read it twice." }).ok, true);
  const r = ask({ bundleId: DOC });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.transcriptions.map((x) => x.content_id), [t0.content_id, t1.content_id].sort());
  const row = r.transcriptions.find((x) => x.content_id === t1.content_id);
  assert.deepEqual(Object.keys(row).sort(), ["attestations", "bundle_id", "capture_sha", "content_id", "extent", "extent_kind",
    "at", "ref", "text_sha256", "transcriber"].sort());
  assert.deepEqual([row.bundle_id, row.capture_sha, row.extent_kind, row.extent, row.ref, row.transcriber, row.at, row.text_sha256],
    [DOC, t1.capture_sha, "pdf-page", t1.extent, t1.ref, V("ty"), w.row(`SELECT at FROM transcriptions WHERE content_id=?`, t1.content_id).at, t1.text_sha256]);
  assert.deepEqual(row.attestations, [{ attestor: V("amy"), at: "2026-09-27T00:00:00Z", counts: true },
                                     { attestor: V("zed"), at: "2026-09-28T00:00:00Z", counts: true }]);
  assert.deepEqual(r.transcriptions.find((x) => x.content_id === t0.content_id).attestations, []);
  assert.deepEqual([r.truncated, r.cursor], [false, null]);
  assert.equal(JSON.stringify(r).includes("typed"), false, "the typed text is not listed");
});

test("R57 a typing attested by its own typist is listed with counts false, as op=transcription reads it", () => {
  const { tr, w, ask } = setup();
  const t = tr(2);
  w.st.sql.exec(`INSERT INTO transcription_attestations (content_id,bundle_id,attestor,at,note) VALUES (?,?,?,?,?)`,
    t.content_id, DOC, V("ty"), "2026-09-29T00:00:00Z", "own");
  const row = ask({ bundleId: DOC }).transcriptions[0];
  assert.deepEqual(row.attestations, [{ attestor: V("ty"), at: "2026-09-29T00:00:00Z", counts: false }]);
  assert.deepEqual(row.attestations, w.content.transcriptionRead({ id: t.content_id, viewer: V("ty") })
    .attestations.map(({ attestor, at, counts }) => ({ attestor, at, counts })));
});

test("R57 a document nothing has typed lists no typings, and another document's typings are not listed", () => {
  const { tr, ask } = setup();
  assert.deepEqual(ask({ bundleId: "INFO-2026-0002-other" }).transcriptions, []);
  tr(0);
  assert.deepEqual(ask({ bundleId: "INFO-2026-0002-other" }).transcriptions, []);
  assert.equal(ask({ bundleId: "INFO-2026-0002-other" }).ok, true);
});

test("R57 an unseen document answers as an absent one", () => {
  const { tr, w, ask } = setup();
  tr(1);
  const absent = ask({ bundleId: "INFO-2026-0404-none" });
  const unseen = ask({ bundleId: DOC }, "nobody");
  assert.equal(absent.ok, false);
  assert.equal(absent.reason, "NO_SUCH_BUNDLE");
  assert.deepEqual(unseen, { ...absent, target: unseen.target, detail: unseen.detail });
  assert.equal(unseen.reason, "NO_SUCH_BUNDLE");
  assert.equal(ask({ bundleId: DOC }, "").reason, "NO_SUCH_BUNDLE");
  assert.equal(ask({ bundleId: DOC }, V("ty")).ok, true, "the control: the same call by a member who sees it lists");
  assert.equal(w.count("transcriptions"), 1);
});

test("R57 refusals: no document named, a thing that is not a document", () => {
  const { ask } = setup();
  assert.equal(ask({}).reason, "NO_TARGET");
  assert.equal(ask(null).reason, "NO_TARGET");
  assert.equal(ask({ bundleId: "  " }).reason, "NO_TARGET");
  const inq = ask({ bundleId: "INQ-2026-0001-q" });
  assert.deepEqual([inq.ok, inq.reason], [false, "NOT_A_DOCUMENT"]);
  assert.ok(inq.detail);
});

test("R57 a page is bounded by limit, ordered by content id, and its cursor reads the next page to the end", () => {
  const { tr, ask } = setup();
  const ids = [0, 1, 2, 3].map((p) => tr(p).content_id).sort();
  const p1 = ask({ bundleId: DOC, limit: 3 });
  assert.deepEqual(p1.transcriptions.map((x) => x.content_id), ids.slice(0, 3));
  assert.deepEqual([p1.truncated, p1.cursor, p1.limit], [true, ids[2], 3]);
  const p2 = ask({ bundleId: DOC, limit: 3, after: p1.cursor });
  assert.deepEqual(p2.transcriptions.map((x) => x.content_id), ids.slice(3));
  assert.deepEqual([p2.truncated, p2.cursor], [false, null]);
  assert.equal(ask({ bundleId: DOC, limit: 4 }).truncated, false, "exactly a page is not truncated");
  assert.equal(ask({ bundleId: DOC, limit: 0 }).limit, 50, "a limit that is not a positive number is the default");
  assert.equal(ask({ bundleId: DOC, limit: 100000 }).limit, 200, "clamped to the maximum");
  assert.equal(ask({ bundleId: DOC, after: ids[3] }).transcriptions.length, 0);
});

test("R57 the op is declared: one row, a read, requiring the document", () => {
  assert.ok(CONTENT_OP_NAMES.includes("transcriptions"));
  const d = DECLARED_OPS.transcriptions;
  assert.deepEqual([d.mutating, d.weight, d.fields.requires], [false, "read", ["bundleId"]]);
  assert.deepEqual(d.fields.accepts, ["bundleId", "limit", "after"]);
  assert.deepEqual(d.classes, DECLARED_OPS.transcriptionattest.classes.concat("probe"));
});
