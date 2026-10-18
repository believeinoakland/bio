/* retrieval, T51: a query crossing routes refused (R88) and the projects the viewer knows only exist (R89), at the module's
   interface. R87 and R90 are in the tests that follow the split. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";

/* One document holding the words in its own title and, in a captured passage, the phrase. */
function corpus() {
  const w = world({ members: ["ann", "vera"], admins: ["adele"] });
  const c = w.cap("a", "bytes");
  w.doc("INFO-1", { title: "Sewer fund audit" }, { captures: [c] });
  w.unit(c.sha, "INFO-1", 0, "the sewer fund was approved");
  w.doc("INFO-2", { title: "Parks budget" });
  return w;
}

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .filter((t) => !/^bundles_fts_|^capture_text_fts_/.test(t.name))
  .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));

test("R88: search and meaningRows refuse ROUTES_CROSSED a q whose OR joins a passage: term to a term of another route, at any depth, naming the two routes and running no row", () => {
  const w = corpus();
  const viewer = V("vera");
  const runs = [];
  const run = w.retrieval.runQuery.bind(w.retrieval);
  w.retrieval.runQuery = (...a) => { runs.push(a[0]); return run(...a); };
  const crossing = ['sewer OR passage:"sewer fund"', 'passage:"sewer fund" OR sewer', 'state:collected OR passage:sewer',
    'parks AND (state:collected OR passage:"sewer fund")', '(passage:sewer AND parks) OR passage:fund',
    'NOT passage:sewer OR parks', 'passage:sewer OR has:state'];
  for (const q of crossing) {
    for (const mode of ["page", "ids", "count"]) {
      const a = w.retrieval.search({ q, viewer, mode });
      assert.deepEqual([a.ok, a.reason, a.code], [false, "ROUTES_CROSSED", "ROUTES_CROSSED"], `${q} (${mode})`);
      assert.deepEqual(a.routes, ["fields", "passages"]);
      assert.ok(a.detail.includes("passages") && a.detail.includes("fields"), "the detail names the two routes");
      assert.equal(a.hits, undefined);
      assert.equal(a.total, undefined);
    }
    /* Under rows=leg the compiler ignores bare words (query-language R32), so only a query with a field term crosses there. */
    for (const rows of ["passage", "leg", "resolves"]) {
      if (rows !== "passage" && !/state:|has:/.test(q)) continue;
      const a = w.retrieval.meaningRows({ q, rows, viewer });
      assert.deepEqual([a.ok, a.reason, a.routes], [false, "ROUTES_CROSSED", ["fields", "passages"]], `${q} (${rows})`);
      assert.equal(a.rows, undefined);
    }
  }
  assert.deepEqual(runs, [], "a refusal runs no statement");
  /* The refusal is the same for every viewer, a machine credential included, and reads nothing of the record. */
  assert.equal(w.retrieval.search({ q: crossing[0], viewer: MACHINE }).reason, "ROUTES_CROSSED");
  assert.equal(w.retrieval.search({ q: crossing[0], viewer: null }).reason, "ROUTES_CROSSED");
  /* Control: a refusal writes nothing. */
  const before = snapshot(w);
  w.retrieval.search({ q: crossing[0], viewer });
  w.retrieval.meaningRows({ q: crossing[0], rows: "passage", viewer });
  assert.equal(snapshot(w), before);
});

test("R88: a conjunction of the routes, and an OR within one route, is not refused; each route is counted by its own read", () => {
  const w = corpus();
  const viewer = V("vera");
  for (const q of ['sewer passage:"sewer fund"', 'sewer AND passage:"sewer fund"', 'passage:sewer OR passage:parks',
                   'sewer OR parks', 'state:collected OR title:parks', '(sewer OR parks) passage:fund', 'sewer -passage:zzqx']) {
    const a = w.retrieval.search({ q, viewer });
    assert.equal(a.ok, undefined, q);
    assert.equal(typeof a.total, "number", q);
  }
  /* The routes are counted apart: the fields route finds the document by its title, the passage route by its unit. */
  assert.equal(w.retrieval.search({ q: "sewer", viewer }).total, 1);
  assert.equal(w.retrieval.search({ q: 'sewer passage:"sewer fund"', viewer }).total, 1);
  assert.equal(w.retrieval.meaningRows({ q: 'passage:"sewer fund"', rows: "passage", viewer }).total, 1);
  /* Under rows=passage, bare words are read as passage words (query-language R31), so an OR of them is one route. */
  const bare = w.retrieval.meaningRows({ q: "sewer OR parks", rows: "passage", viewer });
  assert.equal(bare.ok, true);
  assert.equal(bare.total, 1);
  /* The widened reading is never offered across routes: it would count what the query was refused for. */
  const miss = w.retrieval.search({ q: 'parks passage:"sewer fund"', viewer });
  assert.equal(miss.total, 0);
  assert.equal(miss.widen, null);
  assert.equal(w.retrieval.search({ q: "zzqx yyqx", viewer }).widen, null, "no OR reading finds anything here");
});

test("R89: R13's scope also carries existence_only_projects, the projects the viewer's sight of is existence only, each {project, name}, and their count; never a document count, never a project the viewer has no sight of at all", () => {
  const w = corpus();
  const c = w.cap("p", "project bytes");
  const full = w.project("Vera's own project", "vera");
  const known = w.project("Discoverable project", "ann", { captures: [c] });
  const hidden = w.project("Hidden project", "ann");
  assert.equal(w.membership.projectVisibilitySet({ projectId: known, setting: "discoverable", by: "ann", viewer: V("ann") }).ok, true);
  const sight = (id, v) => w.membership.sight(id, v);
  assert.deepEqual([sight(full, V("vera")), sight(known, V("vera")), sight(hidden, V("vera"))], ["full", "existence", "none"]);
  const seen = (v, rows = "passage", q = "passage:sewer") => w.retrieval.meaningRows({ q, rows, viewer: v }).scope;
  const vera = seen(V("vera"));
  assert.deepEqual(vera.existence_only_projects, [{ project: known, name: "Discoverable project" }]);
  assert.equal(vera.existence_only_count, 1);
  /* The hidden project is named nowhere in the answer. */
  const text = JSON.stringify(w.retrieval.meaningRows({ q: "passage:sewer", rows: "passage", viewer: V("vera") }));
  assert.equal(text.includes(hidden) || text.includes("Hidden project"), false);
  /* No count of the documents in it: the project's captured document moves no figure the viewer reads (R29). */
  assert.equal(vera.documents, seen(V("vera"), "passage", "passage:sewer").documents);
  assert.equal(Object.keys(vera.existence_only_projects[0]).sort().join(), "name,project");
  /* An administrator neither invited nor joined is at existence of each hidden project (D54): told its id and name,
     and still not its owners. */
  const adele = seen(V("adele"));
  assert.deepEqual(adele.existence_only_projects, [{ project: hidden, name: "Hidden project" }, { project: full, name: "Vera's own project" }]
    .sort((a, b) => (a.project < b.project ? -1 : 1)));
  assert.equal(adele.existence_only_count, 2);
  assert.equal(seen(V("adele"), "leg", "").existence_only_count, 2, "every arm carries it");
  /* A viewer with no stamp is shown none. */
  assert.deepEqual([seen(null).existence_only_projects, seen(null).existence_only_count], [[], 0]);
});

test("R89: a viewer with every project in full sight, and a machine credential, answer an empty list and a zero count", () => {
  const w = corpus();
  w.project("One", "ann");
  w.project("Two", "ann");
  for (const v of [V("ann"), MACHINE]) {
    const s = w.retrieval.meaningRows({ q: "passage:sewer", rows: "passage", viewer: v }).scope;
    assert.deepEqual([s.existence_only_projects, s.existence_only_count], [[], 0], String(v));
  }
  /* The other figures of the scope are as they were: R13's three counts still lead it. */
  const s = w.retrieval.meaningRows({ q: "passage:sewer", rows: "passage", viewer: V("ann") }).scope;
  assert.deepEqual(Object.keys(s).slice(0, 3), ["documents", "documents_with_rows", "documents_without_rows"]);
});

/* ---- R87: the scopes ---- */
import { BROWSE_SCOPES } from "../../../src/retrieval/index.mjs";
import { T0 } from "./fixture.mjs";

/* Two documents, two questions (one holding legs), an action only ann sees (a hidden project's) and no plan. */
function scoped() {
  const w = world({ members: ["ann", "vera"] });
  w.doc("INFO-1", { title: "Water rates", current_state: "collected" }, { files: [{ path: "n.md", text: "water rates rose" }] });
  w.doc("INFO-2", { title: "Water bonds", current_state: "verified" }, { files: [{ path: "n.md", text: "water bonds" }] });
  w.doc("INQ-1", { object_type: "inquiry", title: "Water question" });
  w.doc("INQ-2", { object_type: "inquiry", title: "Parks question" });
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, at)
                 VALUES ('INQ-1', 0, 'INFO-1', 'information', 'supports', 'A', 'capture', 'capture', ?)`, T0);
  return w;
}
const idsOf = (a) => a.hits.map((h) => h.bundle_id).sort();

test("R87: searchFields().scopes is retrieval-browse's BROWSE_SCOPES as it gives them, each {key, kinds, only}, no name in English", () => {
  const w = scoped();
  const f = w.retrieval.searchFields();
  assert.deepEqual(f.scopes, BROWSE_SCOPES.map((s) => ({ key: s.key, kinds: [...s.kinds], only: s.only })));
  assert.deepEqual(f.scopes.map((s) => s.key), ["everything", "question", "document", "action", "awaiting_review", "watched", "flagged"]);
  for (const s of f.scopes) assert.deepEqual(Object.keys(s), ["key", "kinds", "only"]);
});

test("R87: search takes a scope, narrowing the bundles read to those the scope names for the viewer; the answer states it, and the total equals a type search of the same words", () => {
  const w = scoped();
  const viewer = V("vera");
  const q = "water";
  const question = w.retrieval.search({ q, viewer, scope: "question" });
  assert.equal(question.query.scope, "question");
  assert.deepEqual(idsOf(question), ["INQ-1"]);
  assert.equal(question.total, w.retrieval.search({ q: "water type:inquiry", viewer }).total);
  /* A question and a document scope partition the bundles; facets and the page read only the scope. */
  const doc = w.retrieval.search({ q: "", viewer, scope: "document" });
  assert.deepEqual([doc.total, idsOf(doc)], [2, ["INFO-1", "INFO-2"]]);
  assert.equal(doc.facets.state.reduce((n, f) => n + f.n, 0), 2);
  assert.deepEqual(w.retrieval.search({ q: "", viewer, scope: "awaiting_review" }).hits.map((h) => h.bundle_id), ["INFO-1"]);
  assert.equal(w.retrieval.search({ q: "", viewer, scope: "everything", mode: "count" }).total, 4);
  /* A scope with nothing in it reads nothing, never everything. */
  assert.deepEqual([w.retrieval.search({ q: "", viewer, scope: "action" }).total, w.retrieval.search({ q: "", viewer, scope: "action", mode: "ids" }).ids],
    [0, []]);
  /* The scope meets the caller's ids. */
  assert.deepEqual(idsOf(w.retrieval.search({ q: "", viewer, scope: "document", ids: ["INFO-2", "INQ-1"] })), ["INFO-2"]);
  /* A scope over a hidden bundle lists no such id: the hidden project's own bundle is in nobody's scope but its owner's. */
  w.doc("ACT-H", { object_type: "action", title: "Hidden action" });
  assert.equal(w.retrieval.search({ q: "", viewer, scope: "action" }).total, 1);
  w.project("Secret", "ann");
  assert.equal(w.retrieval.search({ q: "", viewer, scope: "everything", mode: "count" }).total, 5, "projects are not a browse kind");
  assert.equal(w.retrieval.search({ q: "", viewer: null, scope: "question" }).total, 0, "an absent viewer sees nothing in any scope");
});

test("R87: watched reads the viewer's own marks through retrieval-browse's registered read, never another member's; truncation and unreadable marks are stated", () => {
  const w = scoped();
  const watches = { [V("vera")]: ["INFO-1"], [V("ann")]: ["INQ-2", "INFO-2"] };
  let truncated = false;
  assert.equal(w.retrieval.registerBrowseMarks("following", (a) => (a.ids ? { watched: a.ids.filter((i) => (watches[a.viewer] || []).includes(i)), flagged: [] }
    : { items: [...(watches[a.viewer] || [])], truncated })).ok, true);
  const mine = (v) => idsOf(w.retrieval.search({ q: "", viewer: v, scope: "watched" }));
  assert.deepEqual(mine(V("vera")), ["INFO-1"]);
  assert.deepEqual(mine(V("ann")), ["INFO-2", "INQ-2"]);
  assert.equal(w.retrieval.search({ q: "", viewer: V("vera"), scope: "watched" }).query.scope_truncated, undefined);
  truncated = true;
  assert.equal(w.retrieval.search({ q: "", viewer: V("vera"), scope: "watched" }).query.scope_truncated, true);
  assert.equal(w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera"), scope: "watched" }).query.scope_truncated, true);
  /* No registered read: the scope is empty and says why, rather than reading as a fact about the record. */
  const bare = scoped();
  const none = bare.retrieval.search({ q: "", viewer: V("vera"), scope: "flagged" });
  assert.equal(none.total, 0);
  assert.equal(typeof none.query.scope_undetermined, "string");
});

test("R87: meaningRows takes a scope too: its rows, total and the four-level statement's scope.documents are those of the same query over only the scope's bundles, and an absence is measured against it", () => {
  const w = scoped();
  const viewer = V("vera");
  const whole = w.retrieval.meaningRows({ q: "", rows: "leg", viewer });
  const q = w.retrieval.meaningRows({ q: "", rows: "leg", viewer, scope: "question" });
  const d = w.retrieval.meaningRows({ q: "", rows: "leg", viewer, scope: "document" });
  assert.deepEqual([whole.scope.documents, q.scope.documents, d.scope.documents], [4, 2, 2]);
  assert.deepEqual([q.total, q.scope.documents_with_rows, q.scope.documents_without_rows], [whole.total, 1, 1]);
  assert.deepEqual([d.total, d.scope.documents_with_rows], [0, 0], "no leg is held in the documents: said of that scope only");
  assert.equal(q.query.scope, "question");
  assert.equal(d.rows.length, 0);
});

test("R87: an unknown scope is refused SCOPE_UNKNOWN naming scopes, in search and meaningRows, running nothing and writing nothing; with no scope the answer is as before, scope null", () => {
  const w = scoped();
  const viewer = V("vera");
  const before = snapshot(w);
  const runs = [];
  const run = w.retrieval.runQuery.bind(w.retrieval);
  w.retrieval.runQuery = (...a) => { runs.push(a[0]); return run(...a); };
  for (const a of [w.retrieval.search({ q: "water", viewer, scope: "nope" }), w.retrieval.meaningRows({ q: "", rows: "leg", viewer, scope: "nope" })]) {
    assert.deepEqual([a.ok, a.reason, a.code, a.scopes], [false, "SCOPE_UNKNOWN", "SCOPE_UNKNOWN", BROWSE_SCOPES.map((s) => s.key)]);
    assert.ok(BROWSE_SCOPES.every((s) => a.detail.includes(s.key)));
  }
  assert.deepEqual(runs, []);
  assert.equal(snapshot(w), before);
  delete w.retrieval.runQuery;
  /* Control: no scope, null, or the empty string answer alike, with scope null. */
  const plain = w.retrieval.search({ q: "water", viewer });
  assert.equal(plain.query.scope, null);
  assert.deepEqual(w.retrieval.search({ q: "water", viewer, scope: null }), plain);
  assert.deepEqual(w.retrieval.search({ q: "water", viewer, scope: "" }), plain);
  const { scope: _s, ...rest } = plain.query;
  assert.deepEqual(Object.keys(rest), ["q", "terms", "match", "sort", "warnings", "mode"]);
  assert.deepEqual(w.retrieval.meaningRows({ q: "", rows: "leg", viewer, scope: null }), w.retrieval.meaningRows({ q: "", rows: "leg", viewer }));
});
