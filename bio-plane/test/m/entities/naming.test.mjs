/* entities' name lookup at its interface: R17–R19, R31. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MACHINE } from "./fixture.mjs";

test("R17 namingDocuments: NO_ENTITY, NO_SUCH_ENTITY; every term of an alias in ref, key or label; one candidate per (capture, reference) at its strongest correspondence; grade_if_resolved is R9's; writes nothing", () => {
  const { e, read, rows } = world();
  assert.equal(e.namingDocuments({}).reason, "NO_ENTITY");
  assert.equal(e.namingDocuments({ entityId: "ENT-2026-0404" }).reason, "NO_SUCH_ENTITY");
  const ent = e.createEntity({ kind: "office", label: "Harbour Master", aliases: ["hm:7", "7", "!!!"] }).entity_id;
  e.createEntity({ kind: "office", label: "Other", aliases: ["x:1"] });
  read("INFO-1", sha("n1"), [
    { ref: "hm:7", kind: "hm", key: "7", label: "Harbour Master" },          /* reference (whole ref) */
    { kind: "k", key: "7", label: "unrelated" },                              /* reference_key */
    { kind: "q", key: "1", label: "harbour master" },                         /* name */
    { kind: "l", key: "2", label: "Report of the Harbour Master, 2026" },    /* name_in_label */
    { ref: "x:1", kind: "x", key: "1", label: "Harbour Master" },            /* name, but an A for another entity */
    { kind: "m", key: "3", label: "Harbour" },                                /* one term only: not every term */
  ]);
  const before = rows(`SELECT COUNT(*) AS n FROM resolutions`)[0].n;
  const r = e.namingDocuments({ entityId: ent, viewer: MACHINE });
  assert.equal(rows(`SELECT COUNT(*) AS n FROM resolutions`)[0].n, before, "writes nothing");
  assert.deepEqual([r.entity_id, r.entity_label, r.entity_kind], [ent, "Harbour Master", "office"]);
  assert.deepEqual(r.names_unusable, ["!!!"], "an alias whose terms are nothing");
  assert.equal(r.names_used, 3);
  const by = Object.fromEntries(r.documents.map((d) => [d.ref, d]));
  assert.deepEqual(Object.keys(by).sort(), ["hm:7", "k:7", "l:2", "q:1", "x:1"].sort());
  assert.deepEqual([by["hm:7"].correspondence, by["hm:7"].grade_if_resolved], ["reference", "A"]);
  assert.deepEqual([by["k:7"].correspondence, by["k:7"].grade_if_resolved], ["reference_key", "B"]);
  assert.deepEqual([by["q:1"].correspondence, by["q:1"].grade_if_resolved], ["name", "C"]);
  assert.deepEqual([by["l:2"].correspondence, by["l:2"].grade_if_resolved], ["name_in_label", null]);
  assert.deepEqual([by["x:1"].correspondence, by["x:1"].grade_if_resolved], ["name", null], "another entity's A resolves first");
  assert.match(by["x:1"].detail, /stronger identifier/);
  assert.equal(by["hm:7"].selectivity, null, "a whole match carries no selectivity");
  assert.deepEqual(r.documents.slice(0, 4).map((d) => d.correspondence), ["reference", "reference_key", "name", "name"]);
  assert.equal(r.documents.at(-1).correspondence, "name_in_label");
  for (const k of ["capture_sha", "bundle_id", "kind", "key", "label", "content_type", "matched_alias", "canonical_name", "matched_on"])
    assert.ok(k in by["q:1"], k);
  assert.match(r.detail, /CANDIDATES, not resolutions/);
});

test("R17 partial candidates are ordered by selectivity over the references the viewer can see; a partial alias reaching every one is not offered and is reported with its arithmetic; limit clamped 1–500 (default 100), truncated", () => {
  const { e, read } = world();
  const ent = e.createEntity({ kind: "office", label: "Board Office", aliases: ["legislation", "notice 99"] }).entity_id;
  read("INFO-1", sha("s1"), [
    { kind: "a", key: "1", label: "legislation one" }, { kind: "b", key: "2", label: "legislation two" },
    { kind: "c", key: "3", label: "legislation notice 99 three" },
  ]);
  const r = e.namingDocuments({ entityId: ent, viewer: MACHINE });
  assert.deepEqual(r.names_uninformative, [{ alias: "legislation", source: "label", reaches: 3, corpus: 3 }]);
  assert.equal(r.count, 1);
  const d = r.documents[0];
  assert.deepEqual([d.ref, d.correspondence, d.selectivity.reaches, d.selectivity.corpus, d.selectivity.value],
                   ["c:3", "name_in_label", 1, 3, 0.6667]);
  assert.match(d.detail, /reaches 1 of the 3/);
  /* a corpus of one: selectivity undefined, and offered */
  const w1 = world();
  const e1 = w1.e.createEntity({ kind: "office", label: "Solo", aliases: ["alpha beta"] }).entity_id;
  w1.read("INFO-1", sha("solo"), [{ kind: "a", key: "1", label: "alpha beta gamma" }]);
  const one = w1.e.namingDocuments({ entityId: e1, viewer: MACHINE });
  assert.deepEqual([one.count, one.documents[0].selectivity.value], [1, null]);
  /* bounds */
  const w2 = world();
  const e2 = w2.e.createEntity({ kind: "office", label: "Gamma" }).entity_id;
  w2.read("INFO-1", sha("many"), Array.from({ length: 5 }, (_, i) => ({ kind: "g", key: String(i), label: "Gamma" })));
  const cut = w2.e.namingDocuments({ entityId: e2, limit: 2, viewer: MACHINE });
  assert.deepEqual([cut.count, cut.limit, cut.truncated], [2, 2, true]);
  assert.match(cut.detail, /FIRST 2/);
  assert.equal(w2.e.namingDocuments({ entityId: e2, viewer: MACHINE }).limit, 100);
  assert.equal(w2.e.namingDocuments({ entityId: e2, limit: 9999, viewer: MACHINE }).limit, 500);
  assert.equal(w2.e.namingDocuments({ entityId: e2, limit: -3, viewer: MACHINE }).limit, 1);
  assert.equal(w2.e.namingDocuments({ entityId: e2, limit: 5, viewer: MACHINE }).truncated, true, "an alias page that filled");
  assert.equal(w2.e.namingDocuments({ entityId: e2, limit: 6, viewer: MACHINE }).truncated, false);
  /* terms: at most 24, split on anything not a letter or digit */
  const w3 = world();
  const long = Array.from({ length: 30 }, (_, i) => `w${i}`).join("-");
  const e3 = w3.e.createEntity({ kind: "office", label: long }).entity_id;
  w3.read("INFO-1", sha("long"), [{ kind: "t", key: "1", label: Array.from({ length: 24 }, (_, i) => `w${i}`).join(" ") }]);
  assert.equal(w3.e.namingDocuments({ entityId: e3, viewer: MACHINE }).count, 1, "the first 24 terms are the alias's terms");
});

test("R18 a candidate in a bundle the viewer may not see is not offered, and nothing counts what was withheld", () => {
  const w = world();
  const ent = w.e.createEntity({ kind: "office", label: "Delta Office", aliases: ["delta"] }).entity_id;
  w.project("PROJ-2026-0002-y", "insider");
  w.read("PROJ-2026-0002-y", sha("hidden"), [{ kind: "d", key: "1", label: "Delta Office" }, { kind: "d", key: "2", label: "delta two" }]);
  w.read("INFO-1", sha("open"), [{ kind: "d", key: "3", label: "Delta Office" }, { kind: "d", key: "4", label: "unrelated" }]);
  const out = w.e.namingDocuments({ entityId: ent, viewer: "member:outsider" });
  const seen = w.e.namingDocuments({ entityId: ent, viewer: "member:insider" });
  assert.deepEqual(out.documents.map((d) => d.capture_sha), [sha("open")]);
  assert.equal(seen.documents.filter((d) => d.capture_sha === sha("hidden")).length, 2);
  assert.ok(!JSON.stringify(out).includes(sha("hidden")));
  assert.ok(!JSON.stringify(out).includes("PROJ-2026-0002-y"));
  /* the partial's corpus is the visible one: `delta` reaches 1 of the 2 visible labels, not 1 of 4 */
  assert.deepEqual(out.names_uninformative, []);
  assert.equal(w.e.namingDocuments({ entityId: ent }).count, 0, "an absent viewer sees nothing");
});

test("R19 namingPlan answers the query plan of R17's lookup through the term index; with no terms the active profiles' search_terms; with none held, undetermined and never a default", () => {
  const w = world();
  const none = w.e.namingPlan();
  assert.deepEqual([none.determined, none.terms, none.sql, none.plan], [false, [], null, null]);
  assert.match(none.why, /no term is assumed/);
  const given = w.e.namingPlan(["alpha", "beta"]);
  assert.deepEqual([given.determined, given.from, given.terms], [true, "caller", ["alpha", "beta"]]);
  assert.match(given.sql, /reading_ref_terms t/);
  assert.ok(given.plan.some((p) => /reading_ref_terms/.test(p) && /INDEX|PRIMARY KEY/i.test(p)), given.plan.join(" | "));
  assert.equal(w.e.namingPlan(Array.from({ length: 30 }, (_, i) => `t${i}`)).terms.length, 24);
  const p = world({ profiles: ["test-port-ellery"] });
  const fromProfile = p.e.namingPlan();
  assert.deepEqual([fromProfile.determined, fromProfile.from, fromProfile.terms], [true, "profiles", ["harbour"]]);
  assert.ok(fromProfile.plan.length > 0);
  const empty = world({ profiles: [] });
  assert.equal(empty.e.namingPlan().determined, false);
});

test("R31 no place is named in the module's behaviour, defaults or outward text: with no profile nothing local is assumed; with a profile that is not the first, its facts are used", () => {
  const w = world();
  const plan = w.e.namingPlan();
  assert.equal(plan.determined, false);
  const q = w.e.idMatch({ space: "enactment", a: "12345" });
  assert.equal(q.reason, "IDSPACE_VALUE_NOT_IN_SPACE", "no built-in form");
  assert.deepEqual(q.forms, []);
  const texts = [JSON.stringify(plan), JSON.stringify(q), JSON.stringify(w.e.idMatch({ space: "nope" }))];
  for (const t of texts) assert.ok(!/oakland|alameda|legistar|\bcms\b|\bapn\b/i.test(t), t);
  const p = world({ profiles: ["test-port-ellery"] });
  const r = p.e.idMatch({ space: "enactment", a: "act 600" });
  assert.deepEqual([r.ok, r.a.kind, r.a.reach.reach], [true, "act", "INSIDE"]);
  assert.ok(!/oakland|alameda|legistar/i.test(JSON.stringify(r)));
});
