/* connections: the reads (R4–R6, R12, R33), a portion's grade (R7–R11, R13; C-49) and the member's choice (R14–R16;
   C-74). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { CONNECTION_PAIR_CHECKS, CONNECTION_CHOICE_CHECKS, PORTION_GRADES_MAX } from "../../../src/connections/index.mjs";

const E = "ENT-2026-0001";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

/* Two documents about E: A mentions it at `pagesA` (grade gA), B once, unplaced (grade gB). */
function pair(w, { gA = "A", gB = "A", pagesA = [2], refA = "Ord. 1", extra = [] } = {}) {
  w.entity(E, "The Ordinance");
  const [a] = w.doc(A, ["alpha"]);
  const [b] = w.doc(B, ["beta"]);
  w.resolve(a, A, refA, E, gA);
  w.read(a, A, refA, pagesA);
  for (const x of extra) { w.resolve(a, A, x.ref, E, x.grade); w.read(a, A, x.ref, x.pages); }
  w.resolve(b, B, "Ord. 1", E, gB);
  w.read(b, B, "Ord. 1", [null]);
  w.k.derive({ entityId: E });
  return { a, b };
}

test("R4: by entity or by capture, else NO_KEY; ordered by grade; bounded with truncated measured by reading one more", () => {
  const w = world();
  const { a } = pair(w);
  assert.equal(w.k.read({}).reason, "NO_KEY");
  const byE = w.k.read({ entityId: E, viewer: V("x") });
  const byC = w.k.read({ captureSha: a, viewer: V("x") });
  assert.equal(byE.count, 1); assert.equal(byC.count, 1);
  assert.equal(byE.limit, 500); assert.equal(byE.truncated, false);
  const [c] = w.doc("INFO-2026-0003-c", ["gamma"]);
  w.resolve(c, "INFO-2026-0003-c", "x", E, "C");
  w.k.derive({ entityId: E });
  const all = w.k.read({ entityId: E, viewer: V("x") });
  assert.deepEqual(all.connections.map((r) => r.grade), [...all.connections.map((r) => r.grade)].sort());
  const one = w.k.read({ entityId: E, limit: 1, viewer: V("x") });
  assert.equal(one.count, 1); assert.equal(one.truncated, true);
  assert.equal(w.k.read({ entityId: E, limit: 99999, viewer: V("x") }).limit, 5000);
});

test("R4: on_point names each end's standing member choice, only where one stands", () => {
  const w = world();
  const { a, b } = pair(w);
  assert.equal(w.k.read({ entityId: E, viewer: V("x") }).connections[0].on_point, undefined);
  assert.equal(w.k.choose({ capture: a, other: b, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") }).ok, true);
  const op = w.k.read({ entityId: E, viewer: V("x") }).connections[0].on_point;
  const side = a < b ? "a" : "b";
  assert.equal(op[side].ref, "Ord. 1"); assert.equal(op[side].chosen_by, "alice"); assert.equal(op[side].lapsed, false);
  assert.equal(op[side === "a" ? "b" : "a"], null);
});

test("R5: with an entity the answer carries the registered provider's derivation statement, else the missing cause", () => {
  const w = world();
  pair(w);
  const none = w.k.read({ entityId: E, viewer: V("x") }).derivation;
  assert.equal(none.recorded, false); assert.equal(none.cause, "NO_PROVIDER");
  assert.equal(w.k.read({ captureSha: "0".repeat(64), viewer: V("x") }).derivation, undefined, "the capture arm spans entities");
  assert.equal(w.k.registerDerivationProvider("observation-log", (id) => ({ recorded: true, entity: id, state: "PRESENT" })).ok, true);
  assert.equal(w.k.registerDerivationProvider("other", () => null).reason, "PROVIDER_DECLARED");
  assert.deepEqual(w.k.read({ entityId: E, viewer: V("x") }).derivation, { recorded: true, entity: E, state: "PRESENT" });
});

test("R6: selection states the method and tie-break, or that the row predates the rule; names a standing choice; states a lapse on every arm", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: [2, 5] });
  let sel = w.k.read({ entityId: E, viewer: V("x") }).connections[0].determining_pair.selection;
  assert.equal(sel.method, "strongest-graded"); assert.equal(sel.tie_break, "first-reference-by-sort");
  assert.match(sel.says, /which nobody has chosen$/);
  w.st.sql.exec(`UPDATE connections SET pair_rule = NULL`);
  sel = w.k.read({ entityId: E, viewer: V("x") }).connections[0].determining_pair.selection;
  assert.equal(sel.tie_break, null); assert.match(sel.says, /derived before the tie-break was recorded/);
  w.k.derive({ entityId: E });
  const occ = w.rows(`SELECT occurrence FROM reading_refs WHERE capture_sha=? ORDER BY seq`, a)[1].occurrence;
  w.k.choose({ capture: a, other: b, entity: E, ref: "Ord. 1", occurrence: occ, author: "alice", viewer: V("alice") });
  sel = w.k.read({ entityId: E, viewer: V("x") }).connections[0].determining_pair.selection;
  assert.doesNotMatch(sel.says, /which nobody has chosen/);
  assert.match(sel.says, /a member \(alice\) chose Ord\. 1 \(read at page 6\) as the mention on point/);
  assert.equal(sel.chosen, false, "chosen is about the machine's pair");
  /* The reading drops page 6: the choice lapses, stated on id=, sha256= and content= alike. */
  w.st.sql.exec(`DELETE FROM reading_refs WHERE capture_sha=? AND seq=1`, a);
  const byE = w.k.read({ entityId: E, viewer: V("x") }).connections[0];
  const byC = w.k.read({ captureSha: a, viewer: V("x") }).connections[0];
  const side = a < b ? "a" : "b";
  for (const c of [byE, byC]) {
    assert.equal(c.on_point[side].lapsed, true); assert.match(c.on_point[side].why, /no longer carries it at that place/);
    assert.match(c.determining_pair.selection.says, /LAPSED/);
  }
  const cid = w.mint(A, a, { kind: "pdf-page", page: 2 });
  const pg = w.k.read({ contentId: cid, viewer: V("x") });
  const entry = [...pg.reaching, ...pg.undetermined, ...pg.outside][0];
  assert.equal(entry.on_point.lapsed, true);
});

test("R7: an unknown content row is CONNECTION_PAIR_NO_CONTENT (C-49.3); a document extent is reached by every connection, and says so", () => {
  const w = world();
  const { a } = pair(w);
  const r = w.k.portionGrade({ contentId: "f".repeat(64), viewer: V("x") });
  assert.equal(r.code, "CONNECTION_PAIR_NO_CONTENT"); assert.equal(r.check, "C-49.3");
  assert.equal(r.translation, CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_NO_CONTENT.translation);
  const doc = w.mint(A, a, { kind: "document" });
  const g = w.k.portionGrade({ contentId: doc, viewer: V("x") });
  assert.equal(g.reaching.length, 1); assert.match(g.reaching[0].why, /whole document/);
  assert.equal(g.connection_grade, "A");
});

test("R8, R35: a part — no pair undetermined; unplaced C-49.2; outside C-49.1; inside reaches; another mention inside or unplaced is C-49.4, named", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: [2] });
  const inside = w.mint(A, a, { kind: "pdf-page", page: 2 });
  const out = w.mint(A, a, { kind: "pdf-page", page: 7 });
  assert.equal(w.k.portionGrade({ contentId: inside, viewer: V("x") }).reaching.length, 1);
  const o = w.k.portionGrade({ contentId: out, viewer: V("x") });
  assert.equal(o.outside[0].code, "CONNECTION_PAIR_OUTSIDE_EXTENT"); assert.equal(o.outside[0].check, "C-49.1");
  /* B's end is unplaced: a part of B is C-49.2. */
  const bPart = w.mint(B, b, { kind: "pdf-page", page: 0 });
  const u = w.k.portionGrade({ contentId: bPart, viewer: V("x") });
  assert.equal(u.undetermined[0].code, "CONNECTION_PAIR_UNPLACED"); assert.equal(u.undetermined[0].check, "C-49.2");
  /* A second mention of the subject read on page 7: page 7's outside verdict is C-49.4, naming it. */
  w.resolve(a, A, "Ordinance One", E, "C"); w.read(a, A, "Ordinance One", [7]);
  const m = w.k.portionGrade({ contentId: out, viewer: V("x") }).undetermined[0];
  assert.equal(m.code, "CONNECTION_PAIR_MENTION_UNCHOSEN"); assert.equal(m.check, "C-49.4");
  assert.deepEqual(m.mentions.map((x) => x.ref), ["Ordinance One"]);
  /* A tie: an equal-grade mention elsewhere unsettles the pair's reach (C-49.4). */
  w.resolve(a, A, "Ord. 1a", E, "A"); w.read(a, A, "Ord. 1a", [9]);
  const t = w.k.portionGrade({ contentId: inside, viewer: V("x") }).undetermined.find((x) => x.code === "CONNECTION_PAIR_MENTION_UNCHOSEN");
  assert.ok(t && t.mentions.some((x) => x.ref === "Ord. 1a"));
  /* No pair recorded: undetermined, CONNECTION_PAIR_NO_PAIR. */
  w.st.sql.exec(`UPDATE connections SET a_ref=NULL, b_ref=NULL`);
  assert.equal(w.k.portionGrade({ contentId: inside, viewer: V("x") }).undetermined[0].code, "CONNECTION_PAIR_NO_PAIR");
  for (const code of ["CONNECTION_PAIR_OUTSIDE_EXTENT", "CONNECTION_PAIR_UNPLACED", "CONNECTION_PAIR_MENTION_UNCHOSEN"])
    assert.ok(CONNECTION_PAIR_CHECKS[code].translation);
});

test("R8: more than 5,000 mentions are not all read, and the unread are treated as possibly inside (C-49.4)", () => {
  const w = world();
  const { a } = pair(w, { pagesA: [2] });
  const out = w.mint(A, a, { kind: "pdf-page", page: 7 });
  const ins = w.st.db.prepare(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, at) VALUES (?, ?, ?, ?, 'D', 't', 't')`);
  w.st.db.exec("BEGIN");
  for (let i = 0; i < 5001; i++) ins.run(a, A, `m${String(i).padStart(5, "0")}`, E);
  w.st.db.exec("COMMIT");
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref, pos_kind, pos, pos_ref, occurrence, seq)
                 SELECT capture_sha, bundle_id, ref, 'pdf-page', '{"page":20}', 'page 21', 'pdf-page:{"page":20}', 0
                   FROM resolutions WHERE capture_sha=? AND ref LIKE 'm%'`, a);
  const g = w.k.portionGrade({ contentId: out, viewer: V("x") });
  assert.equal(g.undetermined[0].code, "CONNECTION_PAIR_MENTION_UNCHOSEN");
  assert.match(g.undetermined[0].why, /not every mention of the subject in this document was read/);
});

test("R9: a standing choice on the cited end answers instead; its grade is the weaker of the chosen mention's and the other end's; a lapse is stated with the places", () => {
  const w = world();
  const { a, b } = pair(w, { gA: "A", pagesA: [2], extra: [{ ref: "Ord. One", grade: "C", pages: [7] }] });
  const p7 = w.mint(A, a, { kind: "pdf-page", page: 7 });
  assert.equal(w.k.portionGrade({ contentId: p7, viewer: V("x") }).undetermined[0].code, "CONNECTION_PAIR_MENTION_UNCHOSEN");
  w.k.choose({ capture: a, other: b, entity: E, ref: "Ord. One", author: "alice", viewer: V("alice") });
  const g = w.k.portionGrade({ contentId: p7, viewer: V("x") });
  assert.equal(g.reaching.length, 1);
  assert.equal(g.reaching[0].grade, "C", "the chosen mention's C, weaker than the other end's A");
  assert.equal(g.reaching[0].on_point.ref, "Ord. One");
  const p2 = w.mint(A, a, { kind: "pdf-page", page: 2 });
  assert.equal(w.k.portionGrade({ contentId: p2, viewer: V("x") }).outside.length, 1, "the chosen mention is outside page 3: a definite outside");
  /* A choice made before occurrences were recorded, whose reference is now read at several places, has lapsed. */
  w.st.sql.exec(`UPDATE connection_pair_choices SET occurrence = NULL`);
  w.read(a, A, "Ord. One", [7, 8]);
  const l = w.k.portionGrade({ contentId: p7, viewer: V("x") });
  const e = [...l.reaching, ...l.undetermined, ...l.outside][0];
  assert.equal(e.on_point.lapsed, true); assert.equal(e.on_point.ambiguous, true);
  assert.deepEqual(e.on_point.occurrences.map((x) => x.position.ref), ["page 8", "page 9"]);
});

test("R10, R11: connection_grade is the strongest reaching grade else null; the why tells apart none, unchosen, unplaced and all outside", () => {
  const w = world();
  w.entity(E);
  const [solo] = w.doc("INFO-2026-0009-s", ["solo"]);
  const none = w.k.portionGrade({ contentId: w.mint("INFO-2026-0009-s", solo, { kind: "pdf-page", page: 1 }), viewer: V("x") });
  assert.equal(none.connection_grade, null); assert.equal(none.established, false); assert.equal(none.needs_confirmation, false);
  assert.match(none.why, /end of no connection/);
  const { a, b } = pair(w, { pagesA: [2] });
  const p2 = w.k.portionGrade({ contentId: w.mint(A, a, { kind: "pdf-page", page: 2 }), viewer: V("x") });
  assert.equal(p2.connection_grade, "A"); assert.equal(p2.established, true); assert.equal(p2.needs_confirmation, false);
  assert.deepEqual(Object.keys(p2.counts), ["connections", "reaching", "undetermined", "outside"]);
  for (const k of ["limit", "truncated", "stale"]) assert.ok(k in p2, k);
  const out = w.k.portionGrade({ contentId: w.mint(A, a, { kind: "pdf-page", page: 5 }), viewer: V("x") });
  assert.equal(out.connection_grade, null); assert.match(out.why, /were established by references read outside/);
  const unp = w.k.portionGrade({ contentId: w.mint(B, b, { kind: "pdf-page", page: 0 }), viewer: V("x") });
  assert.match(unp.why, /cannot be placed.*not the same as none/);
  w.resolve(a, A, "Other", E, "C"); w.read(a, A, "Other", [5]);
  const unch = w.k.portionGrade({ contentId: w.mint(A, a, { kind: "pdf-page", page: 5 }), viewer: V("x") });
  assert.match(unch.why, /nobody has chosen which mention is on point/);
  /* R11: the grade is the connection's; no capture or testimony grade is mixed in, and a null is never ranked. */
  assert.ok(["A", "B", "C", "D", null].includes(p2.connection_grade));
  assert.equal("capture_grade" in p2, false);
});

test("R12: every bundle id in a portion's answer is withheld from a viewer who may not see it", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  const p = w.project("Hidden", "alice");
  w.entity(E);
  const [a] = w.doc(A, ["alpha"]);
  const [h] = w.doc("INFO-2026-0050-h", ["hidden"]);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, "INFO-2026-0050-h");
  w.resolve(a, A, "r", E, "A"); w.resolve(h, "INFO-2026-0050-h", "r", E, "A");
  w.k.derive({ entityId: E });
  const cid = w.mint(A, a, { kind: "document" });
  const bob = w.k.portionGrade({ contentId: cid, viewer: V("bob") });
  assert.equal(bob.reaching[0].other_bundle_id, null);
  assert.equal(w.k.portionGrade({ contentId: cid, viewer: MACHINE }).reaching[0].other_bundle_id, "INFO-2026-0050-h");
  const cp = w.mint("INFO-2026-0050-h", h, { kind: "document" });
  assert.equal(w.k.portionGrade({ contentId: cp, viewer: V("bob") }).bundle_id, null);
  assert.ok(p);
});

test("R13: portionGrades answers R10's grade for at most 200 rows in one read, narrowed to one subject when asked", () => {
  const w = world();
  const { a } = pair(w, { pagesA: [2] });
  const ids = [w.mint(A, a, { kind: "pdf-page", page: 2 }), w.mint(A, a, { kind: "pdf-page", page: 5 }),
               w.mint(A, a, { kind: "document" })];
  const g = w.k.portionGrades([...ids, "e".repeat(64)], V("x"));
  assert.deepEqual(Object.keys(g).sort(), [...ids].sort(), "an id this record does not hold is absent");
  for (const id of ids) {
    const one = w.k.portionGrade({ contentId: id, viewer: V("x") });
    assert.equal(g[id].grade, one.connection_grade);
    assert.equal(g[id].why, one.why);
    assert.deepEqual(g[id].counts, one.counts);
  }
  assert.equal(Object.keys(w.k.portionGrades(ids, V("x"), { entityId: "ENT-2026-0404" })).length, 3);
  assert.equal(w.k.portionGrades(ids, V("x"), { entityId: "ENT-2026-0404" })[ids[0]].grade, null);
  assert.equal(PORTION_GRADES_MAX, 200);
  const many = Array.from({ length: 250 }, (_, i) => w.mint(A, a, { kind: "pdf-page", page: 100 + i }));
  assert.equal(Object.keys(w.k.portionGrades(many, V("x"))).length, 200);
});

test("R14, R35: refusals in order — C-74.1 not a member, C-74.2 no connection (or a hidden end), C-74.3 not a mention, C-74.4 occurrence unnamed", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: [2, 5] });
  const base = { capture: a, other: b, entity: E, ref: "Ord. 1", viewer: V("alice") };
  const c1 = w.k.choose({ ...base, author: MACHINE });
  assert.equal(c1.code, "CONNECTION_CHOICE_NOT_A_MEMBER"); assert.equal(c1.check, "C-74.1");
  assert.equal(w.k.choose({ ...base, author: "" }).check, "C-74.1");
  assert.equal(w.k.choose({ ...base, entity: "ENT-2026-0404", author: "alice" }).check, "C-74.2");
  assert.equal(w.k.choose({ ...base, author: "alice", viewer: null }).check, "C-74.2", "a hidden end answers as none");
  assert.equal(w.k.choose({ ...base, ref: "nope", author: "alice" }).check, "C-74.3");
  const un = w.k.choose({ ...base, author: "alice" });
  assert.equal(un.check, "C-74.4"); assert.equal(un.occurrences.length, 2); assert.equal(un.truncated, false);
  assert.equal(w.k.choose({ ...base, occurrence: "pdf-page:{\"page\":40}", author: "alice" }).check, "C-74.3");
  for (const code of Object.keys(CONNECTION_CHOICE_CHECKS)) assert.ok(CONNECTION_CHOICE_CHECKS[code].translation);
  assert.equal(w.count("connection_pair_choices"), 0);
});

test("R14: listed occurrences are at most 256, with truncated", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: Array.from({ length: 300 }, (_, i) => i) });
  const r = w.k.choose({ capture: a, other: b, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") });
  assert.equal(r.check, "C-74.4"); assert.equal(r.occurrences.length, 256); assert.equal(r.truncated, true); assert.equal(r.limit, 256);
});

test("R15: an occurrence is named by its key or by its place when one read is there; an empty occurrence names the unplaced read", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: [2, null, 5] });
  const base = { capture: a, other: b, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") };
  const byPlace = w.k.choose({ ...base, occurrence: "page 3" });
  assert.equal(byPlace.ok, true); assert.equal(byPlace.chosen.position.page, 2);
  const empty = w.k.choose({ ...base, occurrence: "" });
  assert.equal(empty.ok, true, "D-625: '' names the unplaced read"); assert.equal(empty.chosen.occurrence, "");
  assert.equal(empty.chosen.position, null);
  const ws = w.k.choose({ ...base, occurrence: "   " });
  assert.equal(ws.ok, true); assert.equal(ws.wrote, false, "whitespace alone is the same empty key");
  /* Where the document holds no unplaced read, an empty occurrence is C-74.3, never slid to a place. */
  const w2 = world();
  const p2 = pair(w2, { pagesA: [2, 5] });
  const r2 = w2.k.choose({ capture: p2.a, other: p2.b, entity: E, ref: "Ord. 1", occurrence: "", author: "alice", viewer: V("alice") });
  assert.equal(r2.check, "C-74.3");
});

test("R16: append-only — a new choice supersedes the current one in one act, one current per end, the same choice writes nothing; the pair is never rewritten", () => {
  const w = world();
  const { a, b } = pair(w, { pagesA: [2, 5] });
  const [o1, o2] = w.rows(`SELECT occurrence FROM reading_refs WHERE capture_sha=? ORDER BY seq`, a).map((r) => r.occurrence);
  const base = { capture: a, other: b, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") };
  const before = w.row(`SELECT a_ref, a_pos, b_ref, b_pos FROM connections`);
  const first = w.k.choose({ ...base, occurrence: o1 });
  assert.equal(first.wrote, true); assert.equal(first.superseded, null);
  assert.equal(first.machine_pair_ref, "Ord. 1"); assert.match(first.says, /^recorded: /);
  const again = w.k.choose({ ...base, occurrence: o1 });
  assert.equal(again.wrote, false); assert.match(again.says, /nothing was written/);
  const second = w.k.choose({ ...base, occurrence: o2, author: "bob" });
  assert.equal(second.wrote, true); assert.equal(second.superseded.chosen_by, "alice");
  assert.equal(w.count("connection_pair_choices"), 2);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connection_pair_choices WHERE superseded_at IS NULL`).n, 1);
  assert.deepEqual(w.row(`SELECT a_ref, a_pos, b_ref, b_pos FROM connections`), before);
});

test("R33: the connection (the evidence) stays visible; a hidden end's bundle id and any choice written on it are withheld", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  const { a, b } = pair(w);
  w.k.choose({ capture: b, other: a, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") });
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, B);
  const r = w.k.read({ entityId: E, viewer: V("bob") }).connections[0];
  const hid = b < a ? "a" : "b";
  assert.equal(r[`${hid}_bundle_id`], null);
  assert.equal(r.grade, "A", "the connection itself stays visible");
  assert.equal(r.on_point, undefined, "the choice on the hidden end is withheld");
  assert.doesNotMatch(r.determining_pair.selection.says, /alice/);
  const m = w.k.read({ entityId: E, viewer: MACHINE }).connections[0];
  assert.equal(m[`${hid}_bundle_id`], B); assert.equal(m.on_point[hid].chosen_by, "alice");
});
