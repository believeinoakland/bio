/* retrieval: selections (R18–R22, R51, R52, R31's C-33.20 and C-33.32, R32), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, infoMd } from "./fixture.mjs";
import { SELECTION_CHECKS, SELECTION_TTL_MS, SELECTION_MAX_ITEMS, SELECTION_MAX_PER_OWNER, SELECTION_ID_CHUNK }
  from "../../../src/retrieval/index.mjs";

function many(n, w = world()) {
  for (let i = 1; i <= n; i++) w.doc(`INFO-${String(i).padStart(3, "0")}`, { source_status: i % 2 ? "live" : "gone" });
  return w;
}
const revise = (w, id, extra = {}, writer = null) => {
  const head = w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id).bundle_sha;
  const r = w.promotion.promote({ bundleId: id, base: head, snapKey: `r${Math.random()}`, author: V("ann"),
    ...(writer ? { writer: "mechanical", operation: writer } : {}),
    files: [{ path: "bundle.md", text: infoMd(id, extra) }], meta: { object_type: "information" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
};

test("R18: refusals NO_OWNER, BAD_KIND, EMPTY, TOO_LARGE (with limit and got, never turned into a query); members resolved under the viewer so a hidden id never enters; a query selection stores its criterion and digest and no items, an enumeration each item with its sha", async () => {
  const w = many(3);
  const proj = w.project("Hidden", "ann");
  assert.equal((await w.retrieval.selectionCreate({ viewer: V("vera") })).reason, "NO_OWNER");
  assert.equal((await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), kind: "list" })).reason, "BAD_KIND");
  assert.equal((await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), kind: "enumerated", ids: [] })).reason, "EMPTY");
  const big = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"),
    ids: Array.from({ length: SELECTION_MAX_ITEMS + 1 }, (_, i) => `X-${i}`) });
  assert.deepEqual([big.ok, big.reason, big.limit, big.got], [false, "TOO_LARGE", SELECTION_MAX_ITEMS, SELECTION_MAX_ITEMS + 1]);
  assert.equal(w.count("selections"), 0, "refused, never downgraded to a query selection");
  const en = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-001", proj, "INFO-003", "INFO-001"] });
  assert.deepEqual([en.ok, en.kind, en.n, en.ttlSeconds], [true, "enumerated", 2, SELECTION_TTL_MS / 1000]);
  assert.match(en.handle, /^sel-[0-9a-f]{24}$/);
  assert.equal(en.gate.applied, 1);
  assert.deepEqual(w.rows(`SELECT ord, bundle_id, bundle_sha FROM selection_items WHERE handle=? ORDER BY ord`, en.handle)
    .map((r) => [r.bundle_id, r.bundle_sha]),
    ["INFO-001", "INFO-003"].map((id) => [id, w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id).bundle_sha]));
  const q = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "status:live" });
  assert.deepEqual([q.kind, q.n, q.q], ["query", 2, "status:live"]);
  assert.equal(w.row(`SELECT COUNT(*) n FROM selection_items WHERE handle=?`, q.handle).n, 0);
  const row = w.row(`SELECT q, digest, n, expires, created FROM selections WHERE handle=?`, q.handle);
  assert.deepEqual([row.q, row.n, /^[0-9a-f]{16}$/.test(row.digest)], ["status:live", 2, true]);
  assert.equal(Date.parse(row.expires) - Date.parse(row.created), SELECTION_TTL_MS);
  assert.equal(q.expires, row.expires);
});

test("R18: an enumeration over the 64-id chunk boundary resolves every visible id; at 10,000 it is accepted", async () => {
  const w = many(SELECTION_ID_CHUNK + 6);
  const ids = w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`).map((r) => r.bundle_id);
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids });
  assert.deepEqual([s.n, s.gate.applied], [ids.length, 2]);
  const r = w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera") });
  assert.deepEqual([r.n, r.moved, r.gate.applied], [ids.length, false, 2]);
  const huge = await w.retrieval.selectionCreate({ owner: "p", viewer: V("vera"),
    ids: [...ids, ...Array.from({ length: SELECTION_MAX_ITEMS - ids.length }, (_, i) => `NONE-${i}`)] });
  assert.deepEqual([huge.ok, huge.n], [true, ids.length], "10,000 ids accepted; the ids naming nothing never enter");
});

test("R18: an owner holds at most 32 selections: the oldest is collected and the new one never refused", async () => {
  const w = many(2);
  const handles = [];
  for (let i = 0; i < SELECTION_MAX_PER_OWNER + 2; i++) {
    w.clock.sel += 1000;
    handles.push((await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" })).handle);
  }
  const held = w.rows(`SELECT handle FROM selections WHERE owner='o'`).map((r) => r.handle);
  assert.equal(held.length, SELECTION_MAX_PER_OWNER);
  assert.deepEqual(held.sort(), handles.slice(2).sort(), "the two oldest were collected");
});

test("R19, R31: an unknown, released or expired handle is NO_SUCH_SELECTION (C-33.20), one answer; another owner's NOT_YOURS; use extends the life", async () => {
  const w = many(2);
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  const unknown = w.retrieval.selectionResolve({ handle: "sel-nope", owner: "o", viewer: V("vera") });
  assert.deepEqual(unknown, { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" });
  assert.equal(SELECTION_CHECKS.NO_SUCH_SELECTION.check, "C-33.20");
  assert.match(SELECTION_CHECKS.NO_SUCH_SELECTION.where, /is-selection-known/);
  assert.equal(w.retrieval.selectionResolve({ handle: s.handle, owner: "x", viewer: V("vera") }).reason, "NOT_YOURS");
  assert.equal(w.retrieval.selectionResolve({ handle: s.handle, owner: null, viewer: V("vera") }).reason, "NOT_YOURS");
  /* Use extends the life: resolved at +200 s, alive at +400 s. */
  w.clock.sel += 200000;
  const used = w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera") });
  assert.equal(Date.parse(used.expires), w.clock.sel + SELECTION_TTL_MS);
  w.clock.sel += 200000;
  assert.equal(w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera") }).ok, true);
  /* Expired: past its life with no use. */
  w.clock.sel += SELECTION_TTL_MS + 1;
  assert.deepEqual(w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera") }), unknown);
  /* Released. */
  const t = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  w.retrieval.selectionRelease({ handle: t.handle, owner: "o" });
  assert.deepEqual(w.retrieval.selectionResolve({ handle: t.handle, owner: "o", viewer: V("vera") }), unknown);
});

test("R19: an enumeration is re-resolved under the current viewer — hidden and purged items leave it (drift.hidden, drift.purged), a revision is reported with its class, nothing is added; a query selection is re-run and its digest compared", async () => {
  const w = many(4);
  const proj = w.project("Hidden", "ann");
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-001", "INFO-002", "INFO-003", proj] });
  assert.equal(s.n, 4);
  revise(w, "INFO-001", { title: "authored revision" });
  revise(w, "INFO-002", {}, "monitor-tick");
  w.record.purge({ bundleId: "INFO-003" });
  const r = w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera") });
  assert.deepEqual(r.drift.hidden, [proj]);
  assert.deepEqual(r.drift.purged, ["INFO-003"]);
  assert.deepEqual(r.drift.revised.map((d) => [d.bundleId, d.class, d.operation ?? null]),
    [["INFO-001", "authored", null], ["INFO-002", "mechanical", "monitor-tick"]]);
  assert.deepEqual([r.drift.added, r.drift.removed, r.moved, r.members], [0, 2, true, ["INFO-001", "INFO-002"]]);
  w.doc("INFO-099");
  assert.equal(w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("ann") }).members.includes("INFO-099"), false, "never added");
  /* A query selection: a swap at a constant count moves the digest (a fresh corpus: 001 and 003 live). */
  const w2 = many(4);
  const q = await w2.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "status:live" });
  assert.equal(q.n, 2);
  const still = w2.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera") });
  assert.deepEqual([still.moved, still.drift.digestChanged], [false, undefined]);
  revise(w2, "INFO-001", { source_status: "gone" });
  revise(w2, "INFO-002", { source_status: "live" });
  const swapped = w2.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera") });
  assert.deepEqual([swapped.n, swapped.snapshotN, swapped.moved, swapped.drift.added, swapped.drift.removed, swapped.drift.digestChanged],
    [2, 2, false, 0, 0, true]);
  assert.match(swapped.drift.detail, /which rows moved is not recoverable/);
});

test("R20, R31: with weight refuse an answer that changed is SET_MOVED (C-33.32) with no members — a moved row, or a query whose digest changed at a constant count; with report the members are given with the drift", async () => {
  const w = many(4);
  const q = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "status:live" });
  const calm = w.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  assert.equal(calm.ok, true);
  revise(w, "INFO-001", { source_status: "gone" });
  revise(w, "INFO-002", { source_status: "live" });
  const refused = w.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  assert.deepEqual([refused.ok, refused.reason, refused.code, refused.check, refused.translation, refused.members, refused.moved],
    [false, "SET_MOVED", "SET_MOVED", "C-33.32", SELECTION_CHECKS.SET_MOVED.translation, [], false]);
  const reported = w.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera"), weight: "report" });
  assert.deepEqual([reported.ok, reported.members.length, reported.drift.digestChanged], [true, 2, true]);
  const e = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-003"] });
  revise(w, "INFO-003", { title: "changed" });
  const moved = w.retrieval.selectionResolve({ handle: e.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  assert.deepEqual([moved.ok, moved.reason, moved.moved], [false, "SET_MOVED", true]);
  assert.match(SELECTION_CHECKS.SET_MOVED.where, /is-selection-moved/);
});

test("R21: selectionList answers NO_OWNER, else the owner's selections newest first, the caps and the instance's selection bytes without rows naming a bundle the viewer cannot see; selectionRelease answers NO_OWNER, NOT_YOURS, and releases one or all", async () => {
  const w = many(2);
  const proj = w.project("Hidden", "ann");
  assert.deepEqual(w.retrieval.selectionList({ viewer: V("vera") }), { ok: false, reason: "NO_OWNER" });
  const a = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-001"] });
  w.clock.sel += 1000;
  const b = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  const hidden = await w.retrieval.selectionCreate({ owner: "ann", viewer: V("ann"), ids: [proj] });
  const l = w.retrieval.selectionList({ owner: "o", viewer: V("vera") });
  assert.deepEqual(l.selections.map((s) => s.handle), [b.handle, a.handle]);
  assert.deepEqual(l.caps, { maxItems: SELECTION_MAX_ITEMS, maxPerOwner: SELECTION_MAX_PER_OWNER });
  const bytesOf = (id) => { const r = w.row(`SELECT length(bundle_id)+length(bundle_sha)+8 AS n FROM selection_items WHERE bundle_id=?`, id); return r.n; };
  assert.equal(l.bytes, bytesOf("INFO-001"), "vera's figure leaves out the item naming the project she cannot see");
  assert.equal(w.retrieval.selectionList({ owner: "o", viewer: V("ann") }).bytes, bytesOf("INFO-001") + bytesOf(proj));
  assert.equal(w.retrieval.selectionList({ owner: "o" }).bytes, bytesOf("INFO-001") + bytesOf(proj), "an internal call is whole");
  assert.deepEqual(w.retrieval.selectionRelease({ handle: a.handle }), { ok: false, reason: "NO_OWNER" });
  assert.deepEqual(w.retrieval.selectionRelease({ handle: hidden.handle, owner: "o" }), { ok: false, reason: "NOT_YOURS" });
  assert.deepEqual(w.retrieval.selectionRelease({ handle: "sel-none", owner: "o" }), { ok: false, reason: "NOT_YOURS" });
  assert.deepEqual(w.retrieval.selectionRelease({ handle: a.handle, owner: "o" }), { ok: true, released: 1 });
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "x" });
  assert.deepEqual(w.retrieval.selectionRelease({ owner: "o" }), { ok: true, released: 2 });
  assert.equal(w.row(`SELECT COUNT(*) n FROM selection_items WHERE handle=?`, a.handle).n, 0);
});

test("R22: sweepSelections removes every expired selection and answers how many; it runs before every selection act", async () => {
  const w = many(2);
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-001"] });
  await w.retrieval.selectionCreate({ owner: "p", viewer: V("vera"), q: "" });
  assert.equal(w.retrieval.sweepSelections(), 0);
  w.clock.sel += SELECTION_TTL_MS + 1;
  assert.equal(w.retrieval.sweepSelections(), 2);
  assert.deepEqual([w.count("selections"), w.count("selection_items")], [0, 0]);
  /* Before every act: list, resolve and create each sweep first. */
  for (const act of [(h) => w.retrieval.selectionList({ owner: "zz" }),
                     (h) => w.retrieval.selectionResolve({ handle: h, owner: "zz", viewer: V("vera") }),
                     (h) => w.retrieval.selectionCreate({ owner: "zz", viewer: V("vera"), q: "" })]) {
    const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
    w.clock.sel += SELECTION_TTL_MS + 1;
    await act(s.handle);
    assert.equal(w.row(`SELECT COUNT(*) n FROM selections WHERE handle=?`, s.handle).n, 0);
  }
});

test("R51: sweepWake is null with no selection held, else now + the lifetime + 30 s; it writes nothing and never throws", async () => {
  const w = many(1);
  assert.equal(w.retrieval.sweepWake(1000), null);
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  const before = w.count("selections");
  assert.equal(w.retrieval.sweepWake(1000), 1000 + SELECTION_TTL_MS + 30000);
  assert.equal(w.count("selections"), before);
  w.st.db.exec(`ALTER TABLE selections RENAME TO selections_gone`);
  assert.equal(w.retrieval.sweepWake(1000), null, "never throws");
});

test("R52: onSelectionCreated — one registration per module (LISTENER_DECLARED), each listener called once after every successful create with {handle, expires}, and one that throws or rejects changes nothing", async () => {
  const w = many(1);
  const heard = [];
  assert.equal(w.retrieval.onSelectionCreated("scheduler", (e) => { heard.push(["scheduler", e]); }).ok, true);
  assert.equal(w.retrieval.onSelectionCreated("scheduler", () => {}).reason, "LISTENER_DECLARED");
  w.retrieval.onSelectionCreated("thrower", () => { throw new Error("x"); });
  w.retrieval.onSelectionCreated("rejecter", async () => { heard.push(["rejecter"]); throw new Error("y"); });
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  assert.equal(s.ok, true);
  assert.deepEqual(heard, [["scheduler", { handle: s.handle, expires: s.expires }], ["rejecter"]]);
  assert.equal(w.row(`SELECT COUNT(*) n FROM selections WHERE handle=?`, s.handle).n, 1);
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera") , kind: "bad" });
  assert.equal(heard.length, 2, "a refused create calls nobody");
});

test("R32: a selection act writes only the selections", async () => {
  const w = many(2);
  const others = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('selections','selection_items') ORDER BY name`)
    .filter((t) => !/_fts_/.test(t.name)).map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));
  const before = others();
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-001"] });
  w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  w.retrieval.selectionList({ owner: "o", viewer: V("vera") });
  w.retrieval.selectionRelease({ owner: "o" });
  assert.equal(others(), before);
});
