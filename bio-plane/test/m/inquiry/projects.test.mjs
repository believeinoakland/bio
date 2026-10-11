/* R60 (H38; K2436, K2480): every read that answers a question to a member answers `projects`, leg-earning R14's answer
   for that viewer: the question's document (this module's decoration of retrieval's single-bundle answer, its R56),
   and this module's own reads of a question with a viewer (`stateHistory`, `documentWaits`, `questionWaits`). A hidden
   project is never answered; a read of R14 that fails answers `projects: null` with why, never an empty list. Driven
   through the real retrieval, membership and leg-earning. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const Q = "INQ-2026-6001-q", R = "INQ-2026-6002-r";

function setup() {
  const w = world({ realRetrieval: true, capture: true });
  w.member("alice"); w.member("bob"); w.member("carol");
  w.inquiry(Q); w.inquiry(R);
  const open = w.project("Open books", "alice", [Q]);
  const hidden = w.project("Quiet audit", "bob", [Q, R]);
  const r = w.membership.projectVisibilitySet({ projectId: open, setting: "discoverable", reason: "open", by: "alice",
                                                viewer: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { w, open, hidden };
}
const reads = async (w, id, viewer) => ({
  document: (await w.retrieval.projection({ bundleId: id, viewer }))?.projects,
  stateHistory: w.k.stateHistory(id, viewer).projects,
  documentWaits: w.k.documentWaits({ questions: [id], viewer }).questions[0]?.projects,
  questionWaits: w.k.questionWaits({ question: id, viewer }).projects,
});

test("R60 each read answering a question to a member answers the projects R14 shows her, never a hidden one", async () => {
  const { w, open, hidden } = setup();
  for (const viewer of [V("alice"), V("bob"), V("carol"), "admin"]) {
    const a = await reads(w, Q, viewer);
    for (const [read, projects] of Object.entries(a))
      assert.deepEqual(projects, [{ id: open, name: "Open books" }], `${viewer} ${read}`);
    assert.doesNotMatch(JSON.stringify(a), new RegExp(hidden), "the hidden project is never answered, even to bob, its owner");
    /* R is drawn on only by the hidden project: answered exactly as a question no project draws on */
    for (const [read, projects] of Object.entries(await reads(w, R, viewer)))
      assert.deepEqual(projects, [], `${viewer} ${read}`);
  }
});

test("R60 negative controls: a read that answers no question to a member carries no projects; a read of R14 that fails answers null with why, never an empty list", async () => {
  const { w } = setup();
  const D = "INFO-2026-6001-d";
  w.doc(D);
  assert.equal(Object.hasOwn(await w.retrieval.projection({ bundleId: D, viewer: V("alice") }), "projects"), false,
    "a document that is no question");
  assert.equal(Object.hasOwn(w.k.stateHistory(Q), "projects"), false, "the in-process read with no viewer names none");
  assert.equal(await w.retrieval.projection({ bundleId: Q, viewer: null }), null, "the gated answer stays gated");
  w.k.legEarning.projectsShownOn = () => { throw new Error("boom"); };
  for (const [read, projects] of Object.entries(await reads(w, Q, V("alice")))) assert.equal(projects, null, read);
  assert.match(w.k.stateHistory(Q, V("alice")).projects_undetermined, /could not be read/);
  assert.deepEqual(w.k.projectsOf(Q, V("alice")), { projects: null, projects_undetermined: "which projects draw on this question could not be read" });
});

/* R60 (T42; N830; retrieval R78): the question's row in a `search` page, through the decoration this module registers
   with retrieval at start. */
const searchRow = (w, id, viewer, extra = {}) =>
  w.retrieval.search({ q: "", viewer, sort: "title", limit: 200, ...extra }).hits?.find((h) => h.bundle_id === id);

test("R60 a question's row in a search page carries projects for the viewer, never a hidden one; a row that is no question carries none", () => {
  const { w, open, hidden } = setup();
  const D = "INFO-2026-6011-d";
  w.doc(D);
  for (const viewer of [V("alice"), V("bob"), V("carol")]) {
    assert.deepEqual(searchRow(w, Q, viewer).projects, [{ id: open, name: "Open books" }], viewer);
    assert.deepEqual(searchRow(w, R, viewer).projects, [], `${viewer}: drawn on only by a hidden project`);
    const named = JSON.stringify(w.retrieval.search({ q: "", viewer, limit: 200 }).hits.map((h) => h.projects ?? null));
    assert.doesNotMatch(named, new RegExp(hidden), "the hidden project is never named in a row's projects");
    /* negative control: a document that is no question gains no key */
    const d = searchRow(w, D, viewer);
    assert.ok(d, "the document is on the page");
    assert.equal(Object.hasOwn(d, "projects"), false);
    assert.equal(Object.hasOwn(d, "projects_undetermined"), false);
  }
  /* the decoration touches the page only: ids and count answer as before */
  const ids = w.retrieval.search({ q: "", viewer: V("alice"), mode: "ids" });
  assert.equal(Object.hasOwn(ids, "hits"), false);
  assert.ok(ids.ids.includes(Q));
  /* registered once, at start: a second registration under this module's name is refused */
  assert.equal(w.retrieval.registerSearchDecoration("inquiry", () => []).reason, "DECORATION_DECLARED");
});

test("R60 negative control: a read of R14 that fails gives the search row projects null with why, never an empty list", () => {
  const { w } = setup();
  w.k.legEarning.projectsShownOn = () => { throw new Error("boom"); };
  const row = searchRow(w, Q, V("alice"));
  assert.equal(row.projects, null);
  assert.match(row.projects_undetermined, /could not be read/);
});
