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
