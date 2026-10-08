/* citation: who cited a captured passage (R13; T36-21, N715, DEC-164 (4); K2126), in `events` R49's shape, read at the
   module's interface and through the real `retrieval.findIn` it registers with (retrieval R73, R76). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha, projMd } from "./fixture.mjs";
import { Citation, CITE_CHECKS, CITE_EXTENT_CHECKS, RECORDED_LIMIT_DEFAULT, RECORDED_LIMIT_MAX } from "../../../src/citation/index.mjs";
import { RECORDED_NONE_REGISTERED } from "../../../src/retrieval/findin.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const VERA = { viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") };
/* An extent as an item carries it: content's canonical string parsed back (K2114). */
const C = (e) => JSON.parse(canonicalExtent(e));
const DOC = C({ kind: "document" });

/* The manifest entry of `id` written last: who wrote it and when, as the record's history holds them. */
const lastEntry = (w, id) => {
  const e = JSON.parse(w.record.readImage(id)["_history/manifest.json"]).entries;
  return e.sort((a, b) => a.seq - b.seq).at(-1);
};
const item = (record, kind, extent, e, extra = {}) => ({
  module: "citation", record, kind, field: kind === "leg" ? "basis" : "references", extent, relation: null,
  by: e.author, at: e.created, withdrawn: false, ...extra });

/* A document with one capture whose second page says "budget", the real match for it, two questions and a case. */
function setup() {
  const w = world();
  const cap = w.info("INFO-2026-0001");
  const cap2 = w.info("INFO-2026-0002");
  const pages = { [cap]: ["Nothing here.", "The budget line is set."] };
  const [match] = w.find("INFO-2026-0001", "budget", { pages });
  w.inquiry("INQ-2026-0001");
  w.inquiry("INQ-2026-0002");
  return { w, cap, cap2, match, p: w.project(), q: "INQ-2026-0001", read: (a) => w.cit.recordedBy(a) };
}

test("R13: a found match cited onto a question, then the same findIn names its member under `recorded`, relation same, by and at as the question's history holds them; registration ends 'none registered'", () => {
  const { w, match, q } = setup();
  const before = w.retrieval.findIn({ scope: { ids: ["INFO-2026-0001"] }, kinds: ["term"], term: "budget", viewer: V("ann") });
  assert.deepEqual(before.kinds[0].items[0].recorded, []);
  assert.equal(w.cit.cite({ project: q, found: match, ...ANN, role: "supports" }).ok, true);
  const e = lastEntry(w, q);
  assert.equal(e.author, "member:ann");
  const r = w.retrieval.findIn({ scope: { ids: ["INFO-2026-0001"] }, kinds: ["term"], term: "budget", viewer: V("ann") });
  assert.deepEqual(r.kinds[0].items[0].recorded, [{ module: "citation", record: q, kind: "leg", field: "basis",
    extent: C({ kind: "pdf-page", page: 1 }), relation: "same", by: "member:ann", at: e.created, withdrawn: false }]);
  assert.ok(r.recorded_read.includes("citation"), JSON.stringify(r.recorded_read));
  assert.deepEqual(r.recorded_not_read.filter((x) => x.module === null || x.module === "citation"), [],
                   `not "${RECORDED_NONE_REGISTERED}"`);
  assert.deepEqual(w.retrieval.recordedReads().filter((x) => x.registered).map((x) => x.module), ["citation"]);
});

test("R13: the read answers events R49's shape — a leg's part, `narrower` and `wider` against an asked extent, `document` for a leg naming none, and `disjoint` parts left out", async () => {
  const { w, cap, match, q, read } = setup();
  w.cit.cite({ project: q, found: match, ...ANN, role: "supports" });
  const q2 = w.inquiry("INQ-2026-0003");
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: q2, handle: h, ...ANN, role: "cuts_against",
               extent: { extent_kind: "pdf-page", extent_page: "1", extent_rect: "[0, 0, 10, 10]" } });
  const q3 = w.inquiry("INQ-2026-0004");
  w.cit.cite({ project: q3, handle: h, ...ANN, role: "supports" });
  const all = read({ captureSha: cap, viewer: V("ann") });
  assert.deepEqual(Object.keys(all).sort(), ["capture_sha", "items", "module", "ok", "truncated"]);
  assert.deepEqual([all.ok, all.module, all.capture_sha, all.truncated], [true, "citation", cap, false]);
  /* Ordered by the canonical extent's string (code units), then record, then field (K2114): a rectangle's `[` sorts
     before an absent one's `null`. */
  assert.deepEqual(all.items.map((i) => [i.record, i.extent, i.relation]),
    [[q3, DOC, null], [q2, C({ kind: "pdf-page", page: 1, rect: [0, 0, 10, 10] }), null], [q, C({ kind: "pdf-page", page: 1 }), null]]);
  for (const i of all.items) assert.deepEqual(Object.keys(i).sort(), ["at", "by", "extent", "field", "kind", "module", "record", "relation", "withdrawn"]);
  const page1 = read({ captureSha: cap, extent: { kind: "pdf-page", page: 1 }, viewer: V("ann") });
  assert.deepEqual(page1.items.map((i) => [i.record, i.relation]), [[q3, "wider"], [q2, "narrower"], [q, "same"]]);
  /* Another page: the leg on page 1 is disjoint and left out; the document leg holds it. */
  const page0 = read({ captureSha: cap, extent: { kind: "pdf-page", page: 0 }, viewer: V("ann") });
  assert.deepEqual(page0.items.map((i) => [i.record, i.relation]), [[q3, "wider"]]);
  /* The capture's sha in any case and with spaces is the capture. */
  assert.deepEqual(read({ captureSha: ` ${cap.toUpperCase()} `, viewer: V("ann") }).items, all.items);
});

test("R13: a project's cites edge is answered with extent document, and withdrawn after sever; its by and at stay the act that first wrote it", async () => {
  const { w, cap, p, read } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  const e = lastEntry(w, p);
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items, [item(p, "cites", DOC, e)]);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut", author: "member:ivy" }).ok, true);
  assert.notEqual(lastEntry(w, p).author, e.author, "the sever is another entry (a control)");
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items, [item(p, "cites", DOC, e, { withdrawn: true })]);
  assert.equal(w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "back" }).ok, true);
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items, [item(p, "cites", DOC, e)]);
});

test("R13: `by` is whoever first wrote the leg into the citing object, by cite or by another act on its bytes; a later act on the same object changes no earlier leg's by", async () => {
  const { w, cap, cap2, q, read } = setup();
  const h = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
  assert.equal(w.cit.cite({ project: q, handle: h, ...VERA, role: "supports" }).ok, true);
  const first = lastEntry(w, q);
  assert.equal(first.author, "member:vera");
  w.cit.cite({ project: q, handle: await w.select(["INFO-2026-0002"]), ...ANN, role: "supports" });
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items, [item(q, "leg", DOC, first)]);
  assert.deepEqual(read({ captureSha: cap2, viewer: V("ann") }).items, [item(q, "leg", DOC, lastEntry(w, q))]);
  /* A leg written by hand (fixture's revise, author member:ann) counts its writer. */
  const q5 = w.inquiry("INQ-2026-0005");
  w.revise(q5, w.md(q5).replace("references: []", `references:\n  - rel: cites\n    target: INFO-2026-0001\n    status: confirmed\n    note: ""\nbasis:\n  - target: INFO-2026-0001\n    role: supports\n    extent_capture: "${cap}"`));
  const hand = lastEntry(w, q5);
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items.find((i) => i.record === q5), item(q5, "leg", DOC, hand));
});

test("R13: a leg no longer in a basis is not an item", async () => {
  const { w, cap, q, read } = setup();
  w.cit.cite({ project: q, handle: await w.select(["INFO-2026-0001"]), ...ANN, role: "supports" });
  assert.equal(read({ captureSha: cap, viewer: V("ann") }).items.length, 1);
  w.revise(q, w.md(q).replace(/\nbasis:\n(?:  .*\n)+/, "\nbasis: []\n"));
  assert.deepEqual(w.fm(q).basis, []);
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items, []);
});

test("R13: the pin — an earlier capture's leg is absent from a later capture's read; an extent_capture names its capture; a content_id leg is its row's capture; an unpinned edge is the document's first-held capture", async () => {
  const { w, cap, q, p, read } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" });
  const newer = { path: "snapshots/b.txt", text: "newer bytes of INFO-2026-0001", sha: sha("newer bytes of INFO-2026-0001") };
  w.put("INFO-2026-0001", w.md("INFO-2026-0001"), { captures: [{ path: "snapshots/a.txt", text: "the bytes of INFO-2026-0001", sha: cap }, newer] });
  /* The leg was pinned at the act (extent_capture), so a second capture of its document changes nothing. */
  const firstHeld = w.content.captureFor("INFO-2026-0001");
  assert.equal(read({ captureSha: cap, viewer: V("ann") }).items.length, 1);
  assert.deepEqual(read({ captureSha: newer.sha, viewer: V("ann") }).items, []);
  /* A leg pinned by hand to the newer capture is that capture's, not the first one's. */
  const q2 = w.inquiry("INQ-2026-0006");
  w.revise(q2, w.md(q2).replace("references: []", `references:\n  - rel: cites\n    target: INFO-2026-0001\n    status: confirmed\n    note: ""\nbasis:\n  - target: INFO-2026-0001\n    role: supports\n    extent_capture: "${newer.sha}"`));
  assert.deepEqual(read({ captureSha: newer.sha, viewer: V("ann") }).items.map((i) => i.record), [q2]);
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items.map((i) => i.record), [q]);
  /* A legacy case edge written with no extent_capture: the capture its document's citation addresses. */
  w.revise(p, w.md(p).replace("references: []", "references:\n  - rel: cites\n    target: INFO-2026-0001\n    status: confirmed\n    note: \"\""));
  const other = firstHeld === cap ? newer.sha : cap;
  assert.equal(read({ captureSha: firstHeld, viewer: V("ann") }).items.some((i) => i.record === p && i.kind === "cites"), true);
  assert.equal(read({ captureSha: other, viewer: V("ann") }).items.some((i) => i.record === p), false);
  /* A content_id leg: the capture and the part are its content row's (`content.contentRow`). The row is the test's
     (minting one needs a reading this world does not hold); every other content service is the real one. */
  const cid = "c".repeat(64);
  const q3 = w.inquiry("INQ-2026-0007");
  const r = w.cit.cite({ project: q3, handle: h, ...ANN, role: "supports", extent: { content_id: cid } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const content = new Proxy(w.content, { get(t, k) {
    if (k === "contentRow") return (id) => (id === cid ? { content_id: cid, capture_sha: newer.sha, extent_kind: "pdf-page", extent: { page: 2 } } : null);
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  const withRow = new Citation({ record: w.record, membership: w.membership, promotion: w.promotion, content,
                                 retrieval: w.retrieval, provenance: w.prov });
  const got = withRow.recordedBy({ captureSha: newer.sha, viewer: V("ann") }).items.find((i) => i.record === q3);
  assert.deepEqual([got.kind, got.extent], ["leg", C({ kind: "pdf-page", page: 2 })]);
  assert.equal(withRow.recordedBy({ captureSha: cap, viewer: V("ann") }).items.some((i) => i.record === q3), false);
  /* Without the row, the leg is the document's unpinned citation: its first-held capture. */
  assert.equal(read({ captureSha: firstHeld, viewer: V("ann") }).items.some((i) => i.record === q3), true);
});

test("R13: sight is the citing object's — a citation inside a project the viewer may not see is neither answered nor counted, its truncated unchanged; a capture not held or not visible answers items: []", async () => {
  const { w, cap, p, q, read } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: p, handle: h, ...ANN });               // ann's project, hidden from vera
  w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" });
  assert.deepEqual(read({ captureSha: cap, viewer: V("ann") }).items.map((i) => i.record).sort(), [p, q].sort());
  const ann1 = read({ captureSha: cap, viewer: V("ann"), limit: 1 });
  assert.equal(ann1.truncated, true, "a control: ann sees two");
  const vera = read({ captureSha: cap, viewer: V("vera"), limit: 1 });
  assert.deepEqual([vera.items.map((i) => i.record), vera.truncated], [[q], false]);
  /* A capture held nowhere, one in a document vera may not see, and a non-hex sha: no items, as an absent one. */
  const hidden = { path: "snapshots/h.txt", text: "hidden bytes", sha: sha("hidden bytes") };
  w.put(null, projMd("Hidden case"), { author: V("ann"), owner: "ann", captures: [hidden] });
  for (const s of ["f".repeat(64), hidden.sha, "not-a-sha"])
    assert.deepEqual(read({ captureSha: s, viewer: V("vera") }), { ok: true, module: "citation", capture_sha: s.toLowerCase(), items: [], truncated: false });
  /* A refused viewer sees nothing and answers items: [] (K2114). */
  assert.deepEqual(read({ captureSha: cap, viewer: "nobody-at-all" }).items, []);
});

test("R13: refusals in events R49's form, writing nothing and adding no catalogue row — VIEWER_MISSING (absent or empty only), NO_SHA, EXTENT_MALFORMED", async () => {
  const { w, cap, q, read } = setup();
  w.cit.cite({ project: q, handle: await w.select(["INFO-2026-0001"]), ...ANN, role: "supports" });
  const snap = w.snapshot();
  for (const viewer of [undefined, null, "", "  "])
    assert.deepEqual(read({ captureSha: cap, viewer }), { ok: false, refused: "VIEWER_MISSING", code: "VIEWER_MISSING", reason: "VIEWER_MISSING",
      why: "a read names the member reading; with none, nothing is answered" });
  for (const captureSha of [undefined, null, "", "  ", 7]) {
    const r = read({ captureSha, viewer: V("ann") });
    assert.deepEqual([r.ok, r.refused, r.code, r.reason], [false, "NO_SHA", "NO_SHA", "NO_SHA"]);
  }
  for (const extent of [{ kind: "nope" }, { page: 1 }, "document", [], 7]) {
    const r = read({ captureSha: cap, extent, viewer: V("ann") });
    assert.deepEqual([r.ok, r.refused, r.code, r.reason], [false, "EXTENT_MALFORMED", "EXTENT_MALFORMED", "EXTENT_MALFORMED"]);
    assert.equal("check" in r || "translation" in r, false);
  }
  /* No row of this module's holds a shape refusal's code (K2116, K231). */
  for (const code of ["VIEWER_MISSING", "NO_SHA", "EXTENT_MALFORMED"])
    assert.equal(code in CITE_CHECKS || code in CITE_EXTENT_CHECKS, false, code);
  /* Controls: a viewer and no extent answer. */
  assert.equal(read({ captureSha: cap, viewer: V("ann"), extent: null }).items.length, 1);
  assert.deepEqual(w.snapshot(), snap, "nothing written");
});

test("R13: limit is clamped to 1–500 (100 by default), truncated by reading one past; the read writes nothing", async () => {
  const { w, cap, read } = setup();
  const h = await w.select(["INFO-2026-0001"]);
  const qs = [];
  for (let i = 10; i < 13; i++) { const q = w.inquiry(`INQ-2026-00${i}`); qs.push(q); w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" }); }
  assert.deepEqual([RECORDED_LIMIT_DEFAULT, RECORDED_LIMIT_MAX], [100, 500]);
  const snap = w.snapshot();
  for (const [limit, n, t] of [[1, 1, true], [2, 2, true], [3, 3, false], [0, 1, true], [-4, 1, true], [null, 3, false], ["x", 3, false], [10_000, 3, false]]) {
    const r = read({ captureSha: cap, viewer: V("ann"), limit });
    assert.deepEqual([r.items.map((i) => i.record), r.truncated], [qs.slice(0, n), t], String(limit));
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
});

test("R13: registered once at start, through retrieval R76 — a second registration is refused LISTENER_DECLARED; a Citation made directly registers nothing; never throws", () => {
  const { w, cap } = setup();
  const again = w.retrieval.registerRecordedBy("citation", () => ({ ok: true }));
  assert.equal(again.ok, false);
  assert.equal(again.reason ?? again.code, "LISTENER_DECLARED");
  const bare = new Citation({ record: w.record, membership: w.membership, promotion: w.promotion, content: w.content,
                              retrieval: w.retrieval, provenance: w.prov });
  assert.deepEqual(w.retrieval.recordedReads().filter((x) => x.registered).map((x) => x.module), ["citation"]);
  assert.equal(bare.recordedBy({ captureSha: cap, viewer: V("ann") }).ok, true);
  /* A broken store: a refusal naming the failure, never a throw. */
  const broken = world();
  const c = broken.info("INFO-2026-0001");
  broken.st.db.exec("DROP TABLE bundles");
  let r;
  assert.doesNotThrow(() => { r = broken.cit.recordedBy({ captureSha: c, viewer: V("ann") }); });
  assert.equal(r.ok === false || (r.ok === true && r.items.length === 0), true);
  assert.doesNotThrow(() => broken.cit.recordedBy(null));
});
