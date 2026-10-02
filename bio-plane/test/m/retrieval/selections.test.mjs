/* retrieval: selections (R18–R22, R51, R52, R59, R31's C-33.20 and C-33.32, R32) and the queue's counts (R60), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, infoMd } from "./fixture.mjs";
import { SELECTION_CHECKS, SELECTION_TTL_MS, SELECTION_MAX_ITEMS, SELECTION_MAX_PER_OWNER, SELECTION_ID_CHUNK, answerChanged }
  from "../../../src/retrieval/index.mjs";
import { listenerRefusal, MODULE_ORDER, hiddenBundles } from "../../../src/membership/index.mjs";

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

test("R52: onSelectionCreated — a malformed registration and a second by one module are refused through membership's listenerRefusal (LISTENER_MALFORMED, LISTENER_DECLARED); each listener is called once after every successful create with {handle, expires}, in the modules' total order; one that throws or rejects changes nothing", async () => {
  const w = many(1);
  const heard = [];
  assert.equal(w.retrieval.onSelectionCreated("scheduler", (e) => { heard.push(["scheduler", e]); }).ok, true);
  const again = () => {};
  assert.deepEqual(w.retrieval.onSelectionCreated("scheduler", again), listenerRefusal([{ module: "scheduler" }], "scheduler", again));
  assert.equal(w.retrieval.onSelectionCreated("scheduler", again).reason, "LISTENER_DECLARED");
  for (const [m, f] of [["", () => {}], [null, () => {}], ["x", null], ["x", "fn"]])
    assert.deepEqual(w.retrieval.onSelectionCreated(m, f), listenerRefusal([], m, f), `${m} ${typeof f}`);
  assert.equal(w.retrieval.onSelectionCreated("x", 5).reason, "LISTENER_MALFORMED");
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

test("R52: the listeners run in membership's MODULE_ORDER whatever order they registered in", async () => {
  const w = many(1);
  const heard = [];
  /* Registered latest-module first: queue (layer 11), scheduler (layer 10), citation (layer 6). */
  for (const m of ["queue", "scheduler", "citation"]) w.retrieval.onSelectionCreated(m, () => { heard.push(m); });
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  assert.ok(MODULE_ORDER.indexOf("citation") < MODULE_ORDER.indexOf("scheduler")
    && MODULE_ORDER.indexOf("scheduler") < MODULE_ORDER.indexOf("queue"));
  assert.deepEqual(heard, ["citation", "scheduler", "queue"]);
});

test("R59: answerChanged(drift, moved) is true exactly when moved is true or drift.digestChanged is true; a boolean, pure, never throws; it is the rule R20's SET_MOVED reads", async () => {
  const cases = [
    [[{}, false], false], [[{}, true], true], [[{ digestChanged: true }, false], true], [[{ digestChanged: false }, false], false],
    [[{ digestChanged: "yes" }, false], false], [[{ digestChanged: 1 }, false], false], [[null, false], false],
    [[undefined, undefined], false], [[{}, 1], false], [[{}, "true"], false], [[{ digestChanged: true }, true], true],
    [["drift", false], false], [[42, true], true],
  ];
  for (const [[d, m], want] of cases) {
    assert.equal(answerChanged(d, m), want, JSON.stringify([d, m]));
    assert.equal(answerChanged(d, m), want, "pure: the same inputs, the same answer");
  }
  const hostile = { get digestChanged() { throw new Error("no"); } };
  assert.equal(answerChanged(hostile, false), false, "never throws");
  assert.equal(answerChanged(hostile, true), true);
  /* The rule SET_MOVED reads: a query selection swapped at a constant count (moved false, digest changed) refuses. */
  const w = many(4);
  const q = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "status:live" });
  revise(w, "INFO-001", { source_status: "gone" });
  revise(w, "INFO-002", { source_status: "live" });
  const r = w.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  assert.deepEqual([r.moved, r.drift.digestChanged, answerChanged(r.drift, r.moved), r.reason], [false, true, true, "SET_MOVED"]);
  const calm = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "status:live" });
  const c = w.retrieval.selectionResolve({ handle: calm.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  assert.deepEqual([answerChanged(c.drift, c.moved), c.ok], [false, true]);
});

/* The hidden set as every caller (record-core's `counts`, R67, read by `op=stats`; queue) takes it: membership's
   `hiddenBundles` (its R88). */
const hidFor = (viewer) => hiddenBundles(viewer);

test("R60: counts(hid) answers {indexed, selections, selectionItems}; hid leaves out the index rows a hidden bundle claims (an orphan stays), the items naming a hidden bundle and a selection holding one; synchronous, writes nothing, never throws", async () => {
  const w = many(3);
  const proj = w.project("Hidden", "ann");
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-001", "INFO-002"] });
  await w.retrieval.selectionCreate({ owner: "ann", viewer: V("ann"), ids: ["INFO-003", proj] });
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), q: "" });
  w.st.sql.exec(`INSERT INTO bundles_fts (rowid, title, body, meta, locator, authority) VALUES (999, 't', 'b', 'm', 'l', 'a')`);
  const whole = w.retrieval.counts();
  assert.equal(typeof whole.then, "undefined", "synchronous");
  assert.deepEqual(whole, { indexed: 5, selections: 3, selectionItems: 4 }, "4 bundles indexed plus the orphan");
  assert.deepEqual(w.retrieval.counts(null), whole);
  /* vera may not see the project: its index row, its item, and the selection holding it leave; the orphan stays. */
  assert.deepEqual(w.retrieval.counts(hidFor(V("vera"))), { indexed: 4, selections: 2, selectionItems: 3 });
  /* A hid naming nothing hidden changes nothing (ann sees the project). */
  assert.deepEqual(w.retrieval.counts(hidFor(V("ann"))), whole);
  /* It agrees with R17's indexed figure for the same viewer. */
  assert.equal(w.retrieval.counts(hidFor(V("vera"))).indexed, w.retrieval.searchIndexCheck({ viewer: V("vera") }).counts.indexed);
  /* Writes nothing. */
  const snap = () => JSON.stringify(["bundles_fts", "selections", "selection_items"].map((t) => w.rows(`SELECT * FROM ${t}`)));
  const before = snap();
  w.retrieval.counts(hidFor(V("vera")));
  assert.equal(snap(), before);
  /* Never throws: a malformed hid reads as none; a figure that cannot be read is null, never a zero. */
  assert.deepEqual(w.retrieval.counts({ args: [] }), whole);
  assert.deepEqual(w.retrieval.counts("hid"), whole);
  const broken = w.retrieval.counts({ sql: "(SELECT nope FROM nowhere)", args: [] });
  assert.deepEqual(broken, { indexed: null, selections: null, selectionItems: null });
  w.st.db.exec(`ALTER TABLE selections RENAME TO selections_gone`);
  assert.deepEqual(w.retrieval.counts(), { indexed: 5, selections: null, selectionItems: 4 });
});

test("R17, R21, R29, R60 (N352): each subtraction of what a viewer may not see is membership's hiddenBundles set — the index check's indexed figure and the selection bytes equal the figures taken through it, for every kind of viewer", async () => {
  const w = many(3, world({ members: ["ann", "vera"], admins: ["adele"] }));
  const proj = w.project("Hidden", "ann");
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-001", proj] });
  await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-002", "INFO-003"] });
  w.st.sql.exec(`INSERT INTO bundles_fts (rowid, title, body, meta, locator, authority) VALUES (999, 't', 'b', 'm', 'l', 'a')`);
  const bytesThrough = (hid) => w.row(`SELECT COALESCE(SUM(length(bundle_id)+length(bundle_sha)+8), 0) b FROM selection_items`
    + (hid ? ` WHERE bundle_id NOT IN ${hid.sql}` : ""), ...(hid ? hid.args : [])).b;
  const whole = w.retrieval.counts();
  const seen = {};
  /* A participant, a member outside the project, an administrator, the founder, a machine credential, and the
     viewers the gate refuses (absent, empty, unrecognised). */
  for (const viewer of [V("ann"), V("vera"), V("adele"), "admin", "class:member", null, "", "somebody"]) {
    const hid = hiddenBundles(viewer);
    const check = w.retrieval.searchIndexCheck({ viewer });
    assert.equal(check.counts.indexed, w.retrieval.counts(hid).indexed, `indexed ${viewer}`);
    const list = w.retrieval.selectionList({ owner: "o", viewer });
    assert.equal(list.bytes, bytesThrough(hid), `bytes ${viewer}`);
    seen[String(viewer)] = [check.counts.indexed, list.bytes];
  }
  /* The set moves the figures as R43 says: the project's rows leave only for vera; a refused viewer loses every
     claimed row and keeps the orphan; the see-all viewers read whole. */
  const all = bytesThrough(null);
  assert.deepEqual(seen[V("ann")], [whole.indexed, all]);
  assert.deepEqual(seen[V("adele")], [whole.indexed, all]);
  assert.deepEqual(seen.admin, [whole.indexed, all]);
  assert.deepEqual(seen["class:member"], [whole.indexed, all]);
  assert.deepEqual(seen[V("vera")], [whole.indexed - 1, bytesThrough(hiddenBundles(V("vera")))]);
  assert.ok(seen[V("vera")][1] < all);
  for (const v of ["null", "", "somebody"]) assert.deepEqual(seen[v], [1, 0], `refused viewer ${v}: only the orphan`);
  /* An internal call (no viewer passed) stays whole. */
  assert.equal(w.retrieval.selectionList({ owner: "o" }).bytes, all);
});
