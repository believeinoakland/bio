/* people's same-person candidates at its interface: R7, and R8 (M-P6, the false-merge gate set before measuring, K1504). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, OUT } from "./fixture.mjs";
import { People, CANDIDATES_MAX } from "../../../src/people/index.mjs";

const day = (from, to) => ({ from, to, precision: "day", zone: "UTC" });

test("R7 candidates share a name's fold or a scheme identifier, are explained field by field (names, identifiers, posts, life facts: agrees, differs or absent with the rows compared), carry no score or rank, are ordered by entity id, bounded 1–200 (default 50) with truncated, write nothing and say they are not claims", () => {
  const w = world();
  /* entities R43: three persons hold one identifier, each over its own years; entities R44 answers all three as
     candidates of an undetermined holder, and each is a candidate here. */
  const idOnly = w.person("M. H. Houston");          /* shares only the identifier */
  const p = w.person("Michael Houston");
  const twin = w.person("Michael Houston");          /* same name, same identifier, same post, same birth */
  const other = w.person("Michael Houston");         /* same name, different identifier and birth */
  w.person("Jane Roe");
  w.identify(idOnly, "ellery_person", "P007", day("2000-01-01", "2004-12-31")); w.identify(p, "ellery_person", "P007", day("2005-01-01", "2009-12-31"));
  w.identify(twin, "ellery_person", "P007", day("2010-01-01", "2014-12-31")); w.identify(other, "ellery_person", "P008");
  const post = w.entity("office", "Harbour Master");
  w.line("holds", p, post, { from: "2019-01-01" }); w.line("holds", twin, post, { from: "2019-01-01" });
  const c = w.capture("births");
  for (const [who, day] of [[p, "1960-02-02"], [twin, "1960-02-02"], [other, "1971-05-05"]])
    w.p.recordPersonFact({ person: who, kind: "birth", value: day, valid: { from: day, to: null }, citation: doc(c), by: ANN });
  const before = w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => t.name)
    .map((t) => [t, w.one(`SELECT COUNT(*) AS n FROM ${t}`).n]);
  const r = w.p.samePersonCandidates({ entityId: p, viewer: ANN });
  assert.equal(r.ok, true);
  assert.deepEqual(r.candidates.map((x) => x.entity_id), [twin, other, idOnly].sort(), "ordered by entity id, never by any score");
  const by = Object.fromEntries(r.candidates.map((x) => [x.entity_id, x.fields]));
  assert.deepEqual(Object.keys(by[twin]).sort(), ["identifiers", "life", "names", "posts"]);
  assert.deepEqual(Object.values(by[twin]).map((f) => f.state), ["agrees", "agrees", "agrees", "agrees"]);
  assert.equal(by[other].identifiers.state, "differs");
  assert.equal(by[other].life.state, "differs");
  assert.equal(by[other].posts.state, "absent");
  assert.equal(by[idOnly].names.state, "differs");
  assert.equal(by[idOnly].identifiers.state, "agrees");
  for (const f of Object.values(by[twin])) assert.ok("this" in f.rows && "candidate" in f.rows, "the rows compared");
  const text = JSON.stringify(r);
  for (const word of ["score", "probability", "rank", "likelihood", "confidence"]) assert.ok(!text.toLowerCase().includes(`"${word}`), word);
  assert.match(r.detail, /candidates are not claims/);
  assert.equal(r.limit, 50);
  assert.equal(w.p.samePersonCandidates({ entityId: p, limit: 1, viewer: ANN }).truncated, true);
  assert.equal(w.p.samePersonCandidates({ entityId: p, limit: 5000, viewer: ANN }).limit, CANDIDATES_MAX);
  assert.equal(w.p.samePersonCandidates({ entityId: p, limit: 0, viewer: ANN }).limit, 50);
  const after = before.map(([t]) => [t, w.one(`SELECT COUNT(*) AS n FROM ${t}`).n]);
  assert.deepEqual(after, before, "it writes nothing");
  /* a fact the viewer may not see is not compared (R31) */
  const hidden = world();
  const h1 = hidden.person("Kim Park"), h2 = hidden.person("Kim Park");
  const fc = hidden.capture("fenced births", { fenced: true });
  for (const who of [h1, h2]) hidden.p.recordPersonFact({ person: who, kind: "birth", value: "1980-01-01", valid: { from: "1980-01-01", to: null }, citation: doc(fc), by: ANN });
  assert.equal(hidden.p.samePersonCandidates({ entityId: h1, viewer: ANN }).candidates[0].fields.life.state, "agrees");
  assert.equal(hidden.p.samePersonCandidates({ entityId: h1, viewer: OUT }).candidates[0].fields.life.state, "absent");
  assert.equal(w.p.samePersonCandidates({ entityId: post, viewer: ANN }).reason, "NOT_A_PERSON");
  assert.equal(w.p.samePersonCandidates({ entityId: "", viewer: ANN }).reason, "NO_ENTITY");
});

test("R8 M-P6 on the synthetic same-name fixture (two Michael Houstons and a thousand others): among offered candidates agreeing on every compared field, the share that are different people is at most 0.5%", () => {
  const w = world();
  const truth = new Map();                         /* entity id → the person it really is */
  const c = w.capture("registers");
  const office = (i) => w.entity("office", `Seat ${i}`);
  const add = (name, who, { ident = null, birth = null, post = null } = {}) => {
    const e = w.person(name);
    truth.set(e, who);
    if (ident) w.identify(e, ...ident);
    if (birth) w.p.recordPersonFact({ person: e, kind: "birth", value: birth, valid: { from: birth, to: null }, citation: doc(c), by: ANN });
    if (post) w.line("holds", e, post, { from: "2018-01-01" });
    return e;
  };
  /* The two Michael Houstons: different people, one name, different identifiers and births, the same seat at different times. */
  const seat = office("council-3");
  add("Michael Houston", "mh-1", { ident: ["ellery_person", "P100"], birth: "1950-01-01", post: seat });
  add("Michael Houston", "mh-2", { ident: ["ellery_person", "P200"], birth: "1979-09-09", post: seat });
  /* A thousand others: 300 people each held twice (the same person in two registers: same bar number, over two spans
     that do not overlap as entities R43 requires, same birth and post),
     200 names shared by two different people (no identifier held, births differ), and 200 singletons. */
  for (let i = 0; i < 300; i++) {
    const post = office(`s-${i}`), birth = `19${String(40 + (i % 50)).padStart(2, "0")}-0${1 + (i % 9)}-1${i % 9}`;
    const bar = `BAR${String(i).padStart(5, "0")}`;
    add(`Same Person ${i}`, `sp-${i}`, { ident: ["marlow_bar", bar, day("2000-01-01", "2009-12-31")], birth, post });
    add(`Same Person ${i}`, `sp-${i}`, { ident: ["marlow_bar", bar, day("2010-01-01", "2019-12-31")], birth, post });
  }
  for (let i = 0; i < 100; i++) {
    add(`Shared Name ${i}`, `sn-${i}-a`, { birth: "1960-01-01" });
    add(`Shared Name ${i}`, `sn-${i}-b`, { birth: "1961-01-01" });
  }
  for (let i = 0; i < 200; i++) add(`Alone ${i}`, `al-${i}`);
  assert.equal(truth.size, 1002);
  let agreeing = 0, falseMerges = 0;
  for (const e of truth.keys()) {
    const r = w.p.samePersonCandidates({ entityId: e, limit: 200, viewer: ANN });
    assert.equal(r.ok, true);
    for (const cand of r.candidates) {
      if (!People.agreesEverywhere(cand)) continue;
      agreeing++;
      if (truth.get(cand.entity_id) !== truth.get(e)) falseMerges++;
    }
  }
  assert.ok(agreeing >= 600, `the measure has a denominator (${agreeing})`);
  const share = falseMerges / agreeing;
  assert.ok(share <= 0.005, `M-P6: ${falseMerges} of ${agreeing} agreeing candidates are different people (${(share * 100).toFixed(2)}%)`);
});
