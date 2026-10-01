/* connections' shares of two legacy suites (T18's converts; the old suites were deleted in T20 by LEGACY-TESTS #18),
   proved at the module's interface: `reading-position` (FW-17: the connection carries its determining pair, a portion
   answers from where that pair was read; Terms, R1, R4, R7, R8, R10, R35) and `reading-position-occurrences` (D-454:
   one reference read at several places is several mentions, each choosable; R6, R8, R9, R14–R16). What those suites
   drove through the reader and the projection (`flattenText`, the agenda reader, `reading_refs`' rows and M-155's
   migration) is docprofile's, text-chain's and extraction's share; here extraction's rows are written as its reader
   writes them (`w.read`). A fresh world per test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CONNECTION_PAIR_CHECKS, CONNECTION_CHOICE_CHECKS, checkConnectionPairCovers }
  from "../../../src/connections/index.mjs";
import { readingOccurrenceKey, readingPositionInExtent } from "../../../src/textchain.mjs";

const E = "ENT-2026-0001";
const R = "ordinance:13579";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c", D = "INFO-2026-0004-d";

/* Terms: the connection's fourteen keys and the determining pair's seven. */
const CONNECTION_KEYS = ["a_bundle_id", "a_capture_sha", "a_grade", "asserted_by", "at", "b_bundle_id", "b_capture_sha",
  "b_grade", "basis", "determining_pair", "entity_id", "established", "grade", "needs_confirmation"];
const PAIR_KEYS = ["a_position", "a_ref", "b_position", "b_ref", "positioned", "selection", "why"];

/* The place the fixture's reader records for a 0-based page index: its human form is `page <n+1>`. */
const place = (i) => ({ kind: "pdf-page", ref: `page ${i + 1}`, page: i, rect: null });
const occ = (i) => readingOccurrenceKey(place(i));

/* One content row per (bundle, extent), minted once. */
function minter(w) {
  const memo = new Map();
  return (bundle, cap, extent) => {
    const k = `${bundle}|${JSON.stringify(extent)}`;
    if (!memo.has(k)) memo.set(k, w.mint(bundle, cap, extent));
    return memo.get(k);
  };
}
const page = (i) => ({ kind: "pdf-page", page: i });
const DOCUMENT = { kind: "document" };
const all = (g) => [...g.reaching, ...g.undetermined, ...g.outside];
const kindOf = (g, e) => ["reaching", "undetermined", "outside"].find((k) => g[k].includes(e));

/* reading-position's ground: three documents concerning one ordinance, all grade A. A read it on page 2 (index 1),
   B on page 8 (index 7), C by a reader that cannot say where. */
function threeDocs(w) {
  w.entity(E, "Rent Adjustment Ordinance");
  const [a] = w.doc(A, ["doc A"]), [b] = w.doc(B, ["doc B"]), [c] = w.doc(C, ["doc C"]);
  w.resolve(a, A, R, E, "A"); w.read(a, A, R, [1]);
  w.resolve(b, B, R, E, "A"); w.read(b, B, R, [7]);
  w.resolve(c, C, R, E, "A"); w.read(c, C, R, [null]);
  const d = w.k.derive({ entityId: E });
  assert.equal(d.ok, true); assert.equal(d.count, 3, "three documents concern the ordinance, so three pairs");
  return { a, b, c, d };
}
const between = (conns, x, y) => conns.find((k) => [k.a_capture_sha, k.b_capture_sha].sort().join() === [x, y].sort().join());
const sideOf = (k, cap) => (k.a_capture_sha === cap ? "a" : "b");

test("Terms, R1, R4 (converts reading-position): a connection is exactly its 14 keys and its determining pair exactly its 7; positioned only when both ends are placed; the basis names the pair; a row from before pairs were kept reads null", () => {
  const w = world();
  const { a, b, c, d } = threeDocs(w);
  const byE = w.k.read({ entityId: E, viewer: V("x") });
  assert.equal(byE.ok, true); assert.equal(byE.count, 3);
  for (const k of [...byE.connections, ...d.connections]) {
    assert.deepEqual(Object.keys(k).sort(), CONNECTION_KEYS, "the connection's keys, exactly (no choice stands, so no on_point)");
    assert.deepEqual(Object.keys(k.determining_pair).sort(), PAIR_KEYS, "the determining pair's keys, exactly");
    assert.equal(k.determining_pair.a_ref, R); assert.equal(k.determining_pair.b_ref, R);
    assert.ok(k.a_capture_sha < k.b_capture_sha, "ends in canonical order");
    assert.match(k.basis, new RegExp(`the connection is through the reference ${R} in A and ${R} in B`), "the basis names the pair");
  }
  const sortKey = (k) => `${k.a_capture_sha}|${k.b_capture_sha}`;
  assert.deepEqual([...d.connections].sort((x, y) => sortKey(x).localeCompare(sortKey(y))),
                   [...byE.connections].sort((x, y) => sortKey(x).localeCompare(sortKey(y))),
                   "the derivation answers the same view the read does");

  /* A-B: both ends placed, both positions carried. */
  const AB = between(byE.connections, a, b);
  const ab = AB.determining_pair;
  assert.equal(ab.positioned, true);
  assert.deepEqual(ab[`${sideOf(AB, a)}_position`], place(1));
  assert.deepEqual(ab[`${sideOf(AB, b)}_position`], place(7));
  assert.match(ab.why, /both ends record where/);
  assert.ok(AB.basis.includes(`(read at ${ab.a_position.ref} and ${ab.b_position.ref})`), "the basis names both places, A then B");
  assert.deepEqual([AB.grade, AB.a_grade, AB.b_grade, AB.established], ["A", "A", "A", true], "the pair did not disturb the grade");

  /* A-C: one end placed; the other stated null, never invented. */
  const AC = between(byE.connections, a, c);
  const ac = AC.determining_pair;
  assert.equal(ac.positioned, false);
  assert.deepEqual(ac[`${sideOf(AC, a)}_position`], place(1));
  assert.equal(ac[`${sideOf(AC, c)}_position`], null);
  assert.match(ac.why, /where it was read is not/);
  assert.ok(AC.basis.includes(`(read at page 2 on one end only; the other reading does not say where)`));

  /* R4 by capture: A's two connections, and only those. */
  const byC = w.k.read({ captureSha: a, viewer: V("x") });
  assert.equal(byC.ok, true); assert.equal(byC.count, 2); assert.equal(byC.capture_sha, a);
  for (const k of byC.connections) {
    assert.ok([k.a_capture_sha, k.b_capture_sha].includes(a));
    assert.deepEqual(Object.keys(k).sort(), CONNECTION_KEYS);
  }

  /* Neither end placed: the third form of the basis, positioned false, both positions null. */
  const [x] = w.doc(D, ["doc D"]);
  const E2 = "ENT-2026-0002";
  w.entity(E2);
  w.resolve(c, C, "Ord. 2", E2, "B"); w.read(c, C, "Ord. 2", [null]);
  w.resolve(x, D, "Ord. 2", E2, "B");
  const [CD] = w.k.derive({ entityId: E2 }).connections;
  assert.deepEqual([CD.determining_pair.positioned, CD.determining_pair.a_position, CD.determining_pair.b_position], [false, null, null]);
  assert.match(CD.basis, /neither reading says where in its document the reference was read/);

  /* A row derived before pairs were kept: determining_pair is null (a third state), the key still present. */
  w.st.sql.exec(`UPDATE connections SET a_ref=NULL, b_ref=NULL WHERE entity_id=?`, E);
  for (const k of w.k.read({ entityId: E, viewer: V("x") }).connections) {
    assert.deepEqual(Object.keys(k).sort(), CONNECTION_KEYS);
    assert.equal(k.determining_pair, null);
  }
});

test("R7, R8, R10 (converts reading-position): per connection, the pair's own page reaches from every connection and says where; another page is C-49.1 outside for every one; a part of the unplaced document is C-49.2 per pair; a whole-document citation reaches from all, placed or not", () => {
  const w = world();
  const { a, c } = threeDocs(w);
  const mint = minter(w);

  const p2 = w.k.portionGrade({ contentId: mint(A, a, page(1)), viewer: V("x") });
  assert.equal(p2.ok, true);
  assert.deepEqual([p2.connection_grade, p2.established, p2.needs_confirmation], ["A", true, false]);
  assert.deepEqual(p2.counts, { connections: 2, reaching: 2, undetermined: 0, outside: 0 });
  for (const e of p2.reaching) {
    assert.match(e.why, /^the determining reference was read at page 2, inside /, "it says which reference reached, and where");
    assert.equal(e.grade, "A"); assert.equal(e.code, undefined);
  }

  const p9 = w.k.portionGrade({ contentId: mint(A, a, page(8)), viewer: V("x") });
  assert.deepEqual([p9.connection_grade, p9.established], [null, false]);
  assert.deepEqual(p9.counts, { connections: 2, reaching: 0, undetermined: 0, outside: 2 });
  for (const e of p9.outside) {
    assert.equal(e.code, "CONNECTION_PAIR_OUTSIDE_EXTENT"); assert.equal(e.check, "C-49.1");
    assert.equal(e.translation, CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_OUTSIDE_EXTENT.translation);
    assert.match(e.why, /was read at page 2, which is outside/);
  }

  const pc = w.k.portionGrade({ contentId: mint(C, c, page(0)), viewer: V("x") });
  assert.equal(pc.connection_grade, null);
  assert.deepEqual(pc.counts, { connections: 2, reaching: 0, undetermined: 2, outside: 0 }, "undetermined per pair, never none");
  for (const e of pc.undetermined) {
    assert.equal(e.code, "CONNECTION_PAIR_UNPLACED"); assert.equal(e.check, "C-49.2");
    assert.equal(e.translation, CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_UNPLACED.translation);
  }

  /* Over-strictness: a document citation earns from every connection its document has, placed or not. */
  for (const [bundle, cap] of [[A, a], [C, c]]) {
    const g = w.k.portionGrade({ contentId: mint(bundle, cap, DOCUMENT), viewer: V("x") });
    assert.equal(g.connection_grade, "A");
    assert.deepEqual(g.counts, { connections: 2, reaching: 2, undetermined: 0, outside: 0 }, bundle);
    for (const e of g.reaching) assert.match(e.why, /whole document/);
  }
  /* …and still with no pair recorded on any row. */
  w.st.sql.exec(`UPDATE connections SET a_ref=NULL, b_ref=NULL`);
  const nd = w.k.portionGrade({ contentId: mint(C, c, DOCUMENT), viewer: V("x") });
  assert.deepEqual(nd.counts, { connections: 2, reaching: 2, undetermined: 0, outside: 0 });
});

test("R35, R8 (converts reading-position): the C-49 family is exactly four rows, C-49.1–C-49.4, each with a translation a member can read; the pair predicate permits only a placed pair its extent covers", () => {
  assert.deepEqual(Object.entries(CONNECTION_PAIR_CHECKS).map(([k, v]) => [k, v.check, v.translation.length > 80]),
    [["CONNECTION_PAIR_OUTSIDE_EXTENT", "C-49.1", true], ["CONNECTION_PAIR_UNPLACED", "C-49.2", true],
     ["CONNECTION_PAIR_NO_CONTENT", "C-49.3", true], ["CONNECTION_PAIR_MENTION_UNCHOSEN", "C-49.4", true]]);
  const P = place(1);
  for (const side of ["a", "b"]) {
    const pair = { [`${side}_ref`]: R, [`${side}_position`]: P };
    assert.equal(checkConnectionPairCovers(pair, side, "pdf-page", { page: 1 }, readingPositionInExtent), null, "placed and covered");
    assert.equal(checkConnectionPairCovers(pair, side, "document", {}, readingPositionInExtent), null, "a document covers every place");
    const out = checkConnectionPairCovers(pair, side, "pdf-page", { page: 7 }, readingPositionInExtent);
    assert.deepEqual([out.ok, out.code, out.check, out.translation],
                     [false, "CONNECTION_PAIR_OUTSIDE_EXTENT", "C-49.1", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_OUTSIDE_EXTENT.translation]);
    const un = checkConnectionPairCovers({ [`${side}_ref`]: R, [`${side}_position`]: null }, side, "pdf-page", { page: 1 },
                                         readingPositionInExtent);
    assert.deepEqual([un.ok, un.code, un.check, un.translation],
                     [false, "CONNECTION_PAIR_UNPLACED", "C-49.2", CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_UNPLACED.translation]);
  }
  assert.equal(checkConnectionPairCovers({ a_ref: R, a_position: P }, "b", "pdf-page", { page: 1 }, readingPositionInExtent).code,
               "CONNECTION_PAIR_UNPLACED", "the cited end's own position decides, never the other end's");
});

/* reading-position-occurrences' ground: A reads the ordinance at pages 3, 9 and 14 (indices 2, 8, 13), B once at
   page 5; both grade A. The machine's pair on A is the first read, page 3. */
function occurrences(w) {
  w.entity(E, "Rent Adjustment Ordinance");
  const [a] = w.doc(A, ["doc A"]), [b] = w.doc(B, ["doc B"]);
  w.resolve(a, A, R, E, "A"); w.read(a, A, R, [2, 8, 13]);
  w.resolve(b, B, R, E, "A"); w.read(b, B, R, [4]);
  assert.equal(w.k.derive({ entityId: E }).count, 1);
  return { a, b };
}
const only = (g) => { const es = all(g); assert.equal(es.length, 1); return [kindOf(g, es[0]), es[0]]; };

test("R8 (converts reading-position-occurrences): the pair is one occurrence — its own reference read again elsewhere is another mention: page 9 is C-49.4 naming that read, the pair's page 3 is C-49.4 by a tie, a page with no read is a definite C-49.1", () => {
  const w = world();
  const { a } = occurrences(w);
  const mint = minter(w);
  const [conn] = w.k.read({ entityId: E, viewer: V("x") }).connections;
  assert.deepEqual(conn.determining_pair[`${sideOf(conn, a)}_position`], place(2), "the pair is the first read");

  const [k9, e9] = only(w.k.portionGrade({ contentId: mint(A, a, page(8)), viewer: V("x") }));
  assert.equal(k9, "undetermined", "never a definite outside while the subject is read on the page");
  assert.deepEqual([e9.code, e9.check, e9.translation], ["CONNECTION_PAIR_MENTION_UNCHOSEN", "C-49.4",
    CONNECTION_PAIR_CHECKS.CONNECTION_PAIR_MENTION_UNCHOSEN.translation]);
  assert.deepEqual(e9.mentions, [{ ref: R, occurrence: occ(8), grade: "A", position: place(8), inside: true }],
    "it names the page-9 read, with the occurrence a member would choose, and only it");

  const [k3, e3] = only(w.k.portionGrade({ contentId: mint(A, a, page(2)), viewer: V("x") }));
  assert.equal(k3, "undetermined", "the pair reached, but only by a tie against equal-grade reads elsewhere");
  assert.equal(e3.code, "CONNECTION_PAIR_MENTION_UNCHOSEN");
  assert.deepEqual(e3.mentions.map((m) => [m.ref, m.occurrence, m.position.ref, m.inside]),
    [[R, occ(8), "page 9", false], [R, occ(13), "page 14", false]]);

  const [k7, e7] = only(w.k.portionGrade({ contentId: mint(A, a, page(6)), viewer: V("x") }));
  assert.equal(k7, "outside", "every occurrence is placed elsewhere");
  assert.equal(e7.code, "CONNECTION_PAIR_OUTSIDE_EXTENT");
});

test("R14, R15, R16, R9 (converts reading-position-occurrences): three reads are three mentions — the string alone is C-74.4 listing them in reading order; each, chosen by its key, makes its page reach and the other two outside; its place names it too and supersedes; a place not read is C-74.3 listing the places; a reference read once records with none named", () => {
  const w = world();
  const { a, b } = occurrences(w);
  const mint = minter(w);
  const choose = (body, capture = a, other = b) =>
    w.k.choose({ capture, other, entity: E, ref: R, author: "alice", viewer: V("alice"), ...body });

  const unnamed = choose({});
  assert.deepEqual([unnamed.ok, unnamed.code, unnamed.check, unnamed.translation],
    [false, "CONNECTION_CHOICE_OCCURRENCE_UNNAMED", "C-74.4", CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_OCCURRENCE_UNNAMED.translation]);
  assert.deepEqual(unnamed.occurrences, [2, 8, 13].map((i) => ({ occurrence: occ(i), position: place(i) })),
    "every occurrence, in reading order, with its key and place");
  assert.equal(unnamed.truncated, false);
  assert.match(unnamed.detail, /at 3 places \(page 3, page 9, page 14\)/);
  assert.equal(w.count("connection_pair_choices"), 0, "refused, never defaulted");

  const pages = [2, 8, 13];
  let prior = null;
  for (const p of pages) {
    const r = choose({ occurrence: occ(p) });
    assert.deepEqual([r.ok, r.wrote, r.chosen.ref, r.chosen.occurrence, r.chosen.position], [true, true, R, occ(p), place(p)]);
    assert.deepEqual(r.superseded && r.superseded.occurrence, prior, "the superseded choice is named by its occurrence");
    prior = occ(p);
    for (const q of pages) {
      const [k, e] = only(w.k.portionGrade({ contentId: mint(A, a, page(q)), viewer: V("x") }));
      assert.equal(e.on_point.occurrence, occ(p)); assert.equal(e.on_point.chosen_by, "alice");
      if (q === p) {
        assert.equal(k, "reaching", `the chosen page ${p + 1} reaches`);
        assert.deepEqual(e.on_point.position, place(p)); assert.equal(e.grade, "A");
        assert.match(e.why, /a member \(alice\) chose/);
      } else {
        assert.equal(k, "outside", `page ${q + 1} is outside once page ${p + 1} is chosen`);
        assert.equal(e.code, "CONNECTION_PAIR_OUTSIDE_EXTENT");
      }
    }
  }
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connection_pair_choices WHERE superseded_at IS NULL`).n, 1);

  const byForm = choose({ occurrence: "page 9" });
  assert.deepEqual([byForm.ok, byForm.wrote, byForm.chosen.occurrence, byForm.chosen.position.ref, byForm.superseded.occurrence],
    [true, true, occ(8), "page 9", occ(13)], "the place's human form names the occurrence, and supersedes the page-14 choice");
  const again = choose({ occurrence: occ(8) });
  assert.deepEqual([again.ok, again.wrote], [true, false], "the same occurrence by its other spelling writes nothing");

  const n = w.count("connection_pair_choices");
  const bogus = choose({ occurrence: "page 10" });
  assert.deepEqual([bogus.ok, bogus.code, bogus.check], [false, "CONNECTION_CHOICE_NOT_A_MENTION", "C-74.3"]);
  assert.deepEqual(bogus.occurrences.map((o) => o.position.ref), ["page 3", "page 9", "page 14"], "listing where it is read");
  assert.match(bogus.detail, /It reads it at: page 3, page 9, page 14\./);
  assert.equal(w.count("connection_pair_choices"), n);

  const once = choose({}, b, a);
  assert.deepEqual([once.ok, once.wrote, once.chosen.occurrence, once.chosen.position], [true, true, occ(4), place(4)],
    "read once: naming only the string records, at its one place");
});

test("R6, R9 (converts reading-position-occurrences): a re-read that drops the chosen place lapses the choice, the lapse naming the occurrence it chose on every arm, and the choice never slides to another occurrence", () => {
  const w = world();
  const { a, b } = occurrences(w);
  const mint = minter(w);
  assert.equal(w.k.choose({ capture: a, other: b, entity: E, ref: R, occurrence: occ(8), author: "alice", viewer: V("alice") }).wrote, true);
  /* The re-read: A now reads the ordinance at pages 3 and 14 only. */
  w.st.sql.exec(`DELETE FROM reading_refs WHERE capture_sha=?`, a);
  w.read(a, A, R, [2, 13]);

  for (const p of [2, 8, 13]) {
    const [k, e] = only(w.k.portionGrade({ contentId: mint(A, a, page(p)), viewer: V("x") }));
    assert.notEqual(k, "reaching", `page ${p + 1} is not reached through the lapsed choice`);
    assert.deepEqual([e.on_point.lapsed, e.on_point.ref, e.on_point.occurrence, e.on_point.chosen_by], [true, R, occ(8), "alice"]);
    assert.match(e.on_point.why, /no longer carries it at that place/);
  }
  const [k9] = only(w.k.portionGrade({ contentId: mint(A, a, page(8)), viewer: V("x") }));
  assert.equal(k9, "outside", "page 9 is no longer read: the machine's pair (page 3) answers, outside it");

  for (const arm of [{ entityId: E }, { captureSha: a }]) {
    const [k] = w.k.read({ ...arm, viewer: V("x") }).connections;
    const op = k.on_point[sideOf(k, a)];
    assert.deepEqual([op.lapsed, op.occurrence], [true, occ(8)], JSON.stringify(Object.keys(arm)));
    assert.match(k.determining_pair.selection.says, /LAPSED/);
  }
});

test("R9 (converts reading-position-occurrences): a choice made before occurrences were recorded still answers while its reference is read at one place, and is AMBIGUOUS, with the places, once it is read at several", () => {
  const w = world();
  w.entity(E);
  const [a] = w.doc(A, ["doc A"]), [b] = w.doc(B, ["doc B"]);
  w.resolve(a, A, R, E, "A"); w.read(a, A, R, [2]);
  w.resolve(a, A, "Ord. 13579", E, "C"); w.read(a, A, "Ord. 13579", [6]);
  w.resolve(b, B, R, E, "A"); w.read(b, B, R, [4]);
  w.k.derive({ entityId: E });
  const mint = minter(w);
  const p7 = mint(A, a, page(6));
  assert.equal(only(w.k.portionGrade({ contentId: p7, viewer: V("x") }))[0], "undetermined", "unchosen: page 7 holds another mention");
  w.k.choose({ capture: a, other: b, entity: E, ref: "Ord. 13579", author: "alice", viewer: V("alice") });
  /* The choice as a store written before D-454 holds it: no occurrence. */
  w.st.sql.exec(`UPDATE connection_pair_choices SET occurrence = NULL`);

  const [k, e] = only(w.k.portionGrade({ contentId: p7, viewer: V("x") }));
  assert.equal(k, "reaching", "one place: the pre-occurrence choice answers");
  assert.deepEqual([e.on_point.ref, e.on_point.position, "occurrence" in e.on_point, e.on_point.chosen_by],
                   ["Ord. 13579", place(6), false, "alice"]);
  assert.equal(e.grade, "C", "the chosen mention's C, weaker than the other end's A");

  w.read(a, A, "Ord. 13579", [6, 11]);
  const [k2, e2] = only(w.k.portionGrade({ contentId: p7, viewer: V("x") }));
  assert.notEqual(k2, "reaching");
  assert.deepEqual([e2.on_point.lapsed, e2.on_point.ambiguous], [true, true]);
  assert.deepEqual(e2.on_point.occurrences, [6, 11].map((i) => ({ occurrence: occ(i), position: place(i) })));
  const [row] = w.k.read({ entityId: E, viewer: V("x") }).connections;
  assert.equal(row.on_point[sideOf(row, a)].ambiguous, true, "stated on the read arm too");
});
