/* standards: reading standards (R5, R7, R8). Reads write nothing. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, UNKNOWN_CITE } from "./fixture.mjs";
import { STANDARDS_CHECKS, PAGE_MAX, IN_FORCE_STATES } from "../../../src/standards/index.mjs";

test("R5 standardRead answers R1's fields, R3's source, the declarer and time, both ends of a supersession, and for each text passage its standing and whether a newer capture of its document holds it, moving nothing; NO_ID; an absent id and any id for a viewer naming no member are NO_SUCH_STANDARD, one answer", () => {
  const w = seeded();
  const a = w.passage("statute", { address: "https://ex.org/code" });
  const b = w.passage("other");
  const r = w.declare({ text: [a.contentId, b.contentId], period: { from: "2021-01-01", to: null } });
  /* a newer capture of the first passage's document, at the same address */
  w.passage("statute-v2", { address: "https://ex.org/code", retrieved: "2026-09-20T00:00:00Z" });
  const before = w.snapshot();
  const read = w.s.standardRead({ id: r.id, viewer: V("carol") });
  assert.deepEqual(w.snapshot(), before, "the read writes nothing");
  assert.equal(read.ok, true);
  assert.deepEqual([read.id, read.cite, read.kind, read.issuer, read.text, read.period],
                   [r.id, r.cite, "ordinance", "Port Ellery Selectboard", [a.contentId, b.contentId], { from: "2021-01-01", to: null }]);
  assert.deepEqual(read.source, r.source);
  assert.deepEqual([read.declared_by, read.declared_at, read.supersedes, read.superseded_by, read.proposal],
                   [V("bob"), r.declared_at, null, null, null]);
  assert.deepEqual(read.texts.map((t) => t.content_id), [a.contentId, b.contentId]);
  const [ta, tb] = read.texts;
  assert.deepEqual(ta.standing, w.content.standings([a.contentId])[a.contentId], "content's standing, as content answers it");
  assert.equal(ta.standing.stale, false);
  assert.equal(ta.newer.ok, true);
  assert.equal(ta.newer.newer, true, "a newer capture of its document is seen");
  assert.deepEqual(ta.newer, w.content.passageNotice({ contentId: a.contentId, viewer: V("carol") }), "content's notice, as content answers it");
  assert.equal(tb.newer.state, "chain_unread", "no recorded address: unread, never read as none");
  assert.deepEqual(read.text, [a.contentId, b.contentId], "nothing was moved");
  assert.match(read.says, /never whether it is a good one/);
  /* NO_ID */
  for (const id of [null, "", "  "]) {
    const n = w.s.standardRead({ id, viewer: V("carol") });
    assert.equal(n.reason, "NO_ID");
    assert.equal(n.check, undefined, "NO_ID is row-less, as every module answers it");
  }
  /* absent, and any id for a viewer the record admits to nothing: one answer */
  const strip = (x) => ({ ...x, id: null });
  const absent = w.s.standardRead({ id: "STD-2026-9999-ordinance", viewer: V("carol") });
  assert.equal(absent.reason, "NO_SUCH_STANDARD");
  assert.equal(absent.check, STANDARDS_CHECKS.NO_SUCH_STANDARD.check);
  for (const viewer of [null, undefined, "", "nobody", "member:"])
    assert.deepEqual(strip(w.s.standardRead({ id: r.id, viewer })), strip(absent), String(viewer));
  /* a member, the founder and a machine credential see a standard */
  for (const viewer of [V("bob"), V("carol"), "admin", MACHINE]) assert.equal(w.s.standardRead({ id: r.id, viewer }).ok, true, viewer);
});

test("R7 inForce answers in_force, not_in_force or undetermined with why: not_in_force only when a stated bound excludes the date, undetermined when a bound needed is null, never a default", () => {
  const w = seeded();
  const both = w.declare({ period: { from: "2020-01-01", to: "2020-12-31" } }).id;
  const fromOnly = w.declare({ period: { from: "2020-01-01", to: null } }).id;
  const toOnly = w.declare({ period: { from: null, to: "2020-12-31" } }).id;
  const none = w.declare({ period: null }).id;
  const cases = [
    [both, "2020-06-01", "in_force"], [both, "2020-01-01", "in_force"], [both, "2020-12-31", "in_force"],
    [both, "2019-12-31", "not_in_force"], [both, "2021-01-01", "not_in_force"],
    [fromOnly, "2019-06-01", "not_in_force"], [fromOnly, "2025-01-01", "undetermined"],
    [toOnly, "2021-06-01", "not_in_force"], [toOnly, "2019-01-01", "undetermined"],
    [none, "2020-06-01", "undetermined"],
  ];
  for (const [id, date, state] of cases) {
    const r = w.s.inForce(id, date);
    assert.equal(r.ok, true);
    assert.equal(r.state, state, `${id} on ${date}`);
    assert.ok(IN_FORCE_STATES.includes(r.state));
    assert.equal(typeof r.why, "string");
    assert.ok(r.why.length > 10);
  }
  assert.match(w.s.inForce(none, "2020-06-01").why, /does not state when it came into force or when it ceased/);
  assert.match(w.s.inForce(fromOnly, "2025-01-01").why, /ceased to be in force/);
  for (const date of ["2020-02-30", "20200101", null, ""])
    assert.equal(w.s.inForce(both, date).reason, "STANDARD_DATE_INVALID", String(date));
  assert.equal(w.s.inForce("STD-2026-9999-x", "2020-01-01").reason, "NO_SUCH_STANDARD");
});

test("R8 standardsIn lists what its filters admit, in id order, at most 200 a page (a lower limit honoured, a higher not), truncated measured one past the page; with at, each carries R7's answer and not_in_force ones are left out", () => {
  const w = seeded();
  const text = w.passage().contentId;
  const ids = [];
  for (let i = 0; i < PAGE_MAX + 3; i++)
    ids.push(w.s.standardDeclare({ cite: `PEBL § ${i}`, kind: i % 2 ? "ordinance" : "statute", issuer: "Selectboard", text,
                                   period: { from: "2020-01-01", to: i % 3 === 0 ? "2020-12-31" : null }, author: V("bob") }).id);
  const before = w.snapshot();
  const all = w.s.standardsIn({ viewer: V("carol") });
  assert.deepEqual(w.snapshot(), before, "the list writes nothing");
  assert.equal(PAGE_MAX, 200);
  assert.deepEqual([all.count, all.limit, all.truncated, all.cursor], [200, 200, true, ids[199]]);
  assert.deepEqual(all.items.map((x) => x.id), [...ids].sort().slice(0, 200), "id order");
  const rest = w.s.standardsIn({ viewer: V("carol"), after: all.cursor });
  assert.deepEqual([rest.count, rest.truncated, rest.cursor], [3, false, null]);
  assert.equal(w.s.standardsIn({ viewer: V("carol"), limit: 500 }).count, 200, "a higher limit is not honoured");
  const five = w.s.standardsIn({ viewer: V("carol"), limit: 5 });
  assert.deepEqual([five.count, five.limit, five.truncated], [5, 5, true], "a lower limit is honoured");
  assert.equal(w.s.standardsIn({ viewer: V("carol"), limit: 203 - 0, after: ids[2] }).count, 200);
  /* filters */
  const ord = w.s.standardsIn({ viewer: V("carol"), kind: "ordinance", limit: 200 });
  assert.ok(ord.items.every((x) => x.kind === "ordinance"));
  assert.equal(ord.count, 101);
  assert.equal(w.s.standardsIn({ viewer: V("carol"), kind: "guideline" }).reason, "STANDARD_KIND_UNKNOWN");
  assert.deepEqual(w.s.standardsIn({ viewer: V("carol"), cite: "pebl § 20" }).items.map((x) => x.cite),
                   ["PEBL § 20", "PEBL § 200", "PEBL § 201", "PEBL § 202"], "cite, case-insensitive, a part of the citation");
  assert.equal(w.s.standardsIn({ viewer: V("carol"), source: "Port Ellery Bylaws" }).count, 200);
  const u = w.s.standardDeclare({ cite: UNKNOWN_CITE, kind: "statute", issuer: "X", text, author: V("bob") });
  assert.deepEqual(w.s.standardsIn({ viewer: V("carol"), source: "undetermined" }).items.map((x) => x.id), [u.id]);
  assert.equal(w.s.standardsIn({ viewer: V("carol"), source: "No Such Source" }).count, 0);
  /* at: R7's answer on each; not_in_force left out, undetermined kept and stated */
  const at = w.s.standardsIn({ viewer: V("carol"), at: "2022-06-01", limit: 200, after: null });
  assert.ok(at.items.every((x) => x.in_force && x.in_force.state !== "not_in_force"));
  assert.ok(!at.items.some((x) => x.period.to === "2020-12-31"), "those ended in 2020 are left out");
  assert.ok(at.items.every((x) => x.in_force.state === "undetermined"), "no end stated: undetermined, stated");
  const in2020 = w.s.standardsIn({ viewer: V("carol"), at: "2020-06-01", kind: "statute", limit: 200 });
  assert.ok(in2020.items.some((x) => x.in_force.state === "in_force"));
  assert.equal(w.s.standardsIn({ viewer: V("carol"), at: "2019-06-01" }).count, 1, "only the one with no period");
  assert.equal(w.s.standardsIn({ viewer: V("carol"), at: "June 2020" }).reason, "STANDARD_DATE_INVALID");
  /* a viewer the record admits to nothing is listed nothing */
  assert.equal(w.s.standardsIn({ viewer: "nobody" }).count, 0);
  assert.equal(w.s.standardsIn({}).count, 0);
  assert.equal(w.s.standardsIn({ viewer: MACHINE, limit: 1 }).count, 1);
});
