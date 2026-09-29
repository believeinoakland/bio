/* actions' T12 entries at its interface: R31's entry cursor (N311, K380) and R8's `DETERMINATION_SUPERSEDED` through
   conformance R20 (N312, K275). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as conformance from "../../../src/conformance/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const CLK = (d, st = "pending") => ['  - text: "t"', '    description: "d"', `    date: ${d}`, "    basis: Act s.2", `    status: ${st}`];
const key = (x) => `${x.action}:${x.ord}`;
/* Every entry, by paging from the start through each `cursor` to null. */
function pages(w, opts) {
  const out = [], seen = [];
  let after = opts.after ?? null;
  for (let n = 0; n < 5000; n++) {
    const p = w.a.pendingClocks({ before: "2026-10-01", viewer: M, ...opts, after });
    assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
    assert.ok(!("cut_inside" in p), "cut_inside retires (K380)");
    assert.ok(p.items.length <= p.limit);
    out.push(...p.items); seen.push(p);
    assert.equal(p.cursor === null, !p.truncated, "a cursor exactly when truncated");
    if (!p.truncated) return { items: out, pages: seen };
    assert.equal(p.cursor, `${p.items[p.items.length - 1].action}#${p.items[p.items.length - 1].ord}`, "the last entry answered");
    after = p.cursor;
  }
  throw new Error("paging did not reach a null cursor");
}

test("R31 (N311) a page runs in (action, position) order and may end inside an action: its cursor `<action>#<position>` resumes after that entry, at the page bound and across it", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01")]);
  w.action(B, ["clock:", ...CLK("2026-01-01"), ...CLK("2026-01-05", "met"), ...CLK("2026-01-02"), ...CLK("2026-12-01"), ...CLK("2026-01-03")]);
  w.action(C, ["clock:", ...CLK("2026-02-01")]);
  const all = [`${A}:0`, `${B}:0`, `${B}:2`, `${B}:4`, `${C}:0`];
  /* across: a page that ends inside B, resumed after its last answered entry. */
  const p1 = w.a.pendingClocks({ before: "2026-10-01", limit: 2, viewer: M });
  assert.deepEqual([p1.items.map(key), p1.truncated, p1.cursor], [[`${A}:0`, `${B}:0`], true, `${B}#0`]);
  const p2 = w.a.pendingClocks({ before: "2026-10-01", limit: 2, after: p1.cursor, viewer: M });
  assert.deepEqual([p2.items.map(key), p2.truncated, p2.cursor], [[`${B}:2`, `${B}:4`], true, `${B}#4`]);
  const p3 = w.a.pendingClocks({ before: "2026-10-01", limit: 2, after: p2.cursor, viewer: M });
  assert.deepEqual([p3.items.map(key), p3.truncated, p3.cursor], [[`${C}:0`], false, null]);
  /* at the bound: a page exactly as long as what remains is not truncated and names no cursor. */
  const exact = w.a.pendingClocks({ before: "2026-10-01", limit: 5, viewer: M });
  assert.deepEqual([exact.items.map(key), exact.truncated, exact.cursor], [all, false, null]);
  const one = w.a.pendingClocks({ before: "2026-10-01", limit: 4, viewer: M });
  assert.deepEqual([one.items.length, one.truncated, one.cursor], [4, true, `${B}#4`]);
  /* every page size reaches every entry once, in order. */
  for (let k = 1; k <= 6; k++) assert.deepEqual(pages(w, { limit: k }).items.map(key), all, `limit ${k}`);
  /* an action id as `after` is read as after all that action's entries. */
  assert.deepEqual(pages(w, { limit: 2, after: A }).items.map(key), all.slice(1));
  assert.deepEqual(pages(w, { limit: 2, after: B }).items.map(key), [`${C}:0`]);
  /* each item as before: the action, its position, date, basis, text, and whether it is past at `before`. */
  assert.deepEqual(p2.items[0], { action: B, ord: 2, date: "2026-01-02", basis: "Act s.2", text: "t", past: true });
});

test("R31 (N311) an action with more pending clock entries than a page (500) is read whole across pages", () => {
  const w = world();
  const many = (n) => ["clock:", ...Array.from({ length: n }, (_, i) => CLK(`2026-0${1 + (i % 9)}-0${1 + (i % 9)}`)).flat()];
  w.action(A, many(501));
  w.action(B, ["clock:", ...CLK("2026-03-03")]);
  const p1 = w.a.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual([p1.items.length, new Set(p1.items.map((x) => x.action)).size, p1.truncated, p1.cursor, p1.limit],
    [500, 1, true, `${A}#499`, 500]);
  const p2 = w.a.pendingClocks({ before: "2026-10-01", after: p1.cursor, viewer: M });
  assert.deepEqual([p2.items.map(key), p2.truncated, p2.cursor], [[`${A}:500`, `${B}:0`], false, null]);
  const whole = pages(w, {}).items;
  assert.equal(whole.length, 502);
  assert.deepEqual(whole.map(key), [...Array.from({ length: 501 }, (_, i) => `${A}:${i}`), `${B}:0`], "every entry, once, in order");
  /* exactly a page: one page, nothing follows. */
  const x = world();
  x.action(A, many(500));
  const q = x.a.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual([q.items.length, q.truncated, q.cursor], [500, false, null]);
  /* only visible actions, only pending entries dated before `before`. */
  assert.equal(w.a.pendingClocks({ before: "2026-10-01", viewer: "nobody" }).items.length, 0);
  assert.deepEqual(pages(w, { before: "2026-01-02" }).items.map(key), [`${A}:0`, `${A}:9`, `${A}:18`].concat(
    Array.from({ length: 501 }, (_, i) => i).filter((i) => i % 9 === 0 && i > 18).map((i) => `${A}:${i}`)));
});

test("R8 (N312) a breach action resting only on a superseded determination is refused DETERMINATION_SUPERSEDED, answered through conformance R20", () => {
  const D1 = "CONF-2026-0001-determination", D2 = "CONF-2026-0002-determination", D3 = "CONF-2026-0003-determination";
  const dets = { [D1]: { ok: true, id: D1, live: true, superseded_by: null },
                 [D2]: { ok: true, id: D2, live: false, superseded_by: D1 },
                 [D3]: { ok: true, id: D3, live: false, superseded_by: null } };
  const w = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } } });
  for (const id of [D1, D2, D3])
    assert.equal(w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  const md = (...ids) => actionMd(A, [...CP, "action_kind: other", "breach: true", "action_basis:",
    ...ids.flatMap((d) => [`  - target: ${d}`, "    kind: rests_on"])]);
  const r = w.promote(A, md(D2));
  assert.deepEqual([r.ok, r.reason, r.code, r.determination, r.superseded_by], [false, "DETERMINATION_SUPERSEDED", "DETERMINATION_SUPERSEDED", D2, D1]);
  assert.equal(typeof r.detail, "string");
  assert.equal(w.promote(A, md(D3)).superseded_by, null, "a successor the reader does not name answers null");
  assert.equal(w.promote(A, md(D2, D3)).determination, D2, "the first superseded leg is named");
  assert.equal(w.record.head(A), null, "nothing was written");
  /* the same detail for every superseded determination: one fixed sentence (conformance R20). */
  assert.equal(w.promote(A, md(D3)).detail, r.detail);
  /* negative control: a live leg beside a superseded one rests the action. */
  assert.equal(w.promote(A, md(D2, D1)).ok, true);
});

if (typeof conformance.determinationSuperseded === "function") {
  test("R8 (N312) the answer is conformance's own, check and translation its catalogue row's", () => {
    const D1 = "CONF-2026-0001-determination", D2 = "CONF-2026-0002-determination";
    const dets = { [D1]: { ok: true, id: D1, live: true, superseded_by: null }, [D2]: { ok: true, id: D2, live: false, superseded_by: D1 } };
    const w = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false } } });
    for (const id of [D1, D2])
      w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
        'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } });
    const r = w.promote(A, actionMd(A, [...CP, "action_kind: other", "breach: true", "action_basis:", `  - target: ${D2}`, "    kind: rests_on"]));
    assert.deepEqual(r, conformance.determinationSuperseded(D2, D1));
    assert.ok(r.check && r.translation, "its row's");
  });
} else {
  test.todo("R8 (N312) the answer is conformance's own, check and translation its catalogue row's: awaits conformance R20's `determinationSuperseded` (N312), built beside this job");
}
