/* screens-investigate R18: the connection graph on explore, on person ("Connections") and on the money trail, from
 * exploregraph (explore R21), on interface-shell's served page over `store-request`'s world (K5148, K5054): the real store behind the page's door and a real
 * sign-in. The people, the lines between them and the sources are made by the members' own acts; the values a test asserts are read back from the world's own
 * answers. Scripted: a fault a read is made to answer, a record the live copy holds that this build does not make (`changing`), and the money trail's graph (below). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { refusedIn, silent, pending } from "../interface-shell/harness.mjs";
import { inWorld, openAs, settled, rewrite, readHeld } from "./world.mjs";
import { main, word, drew, dayOf } from "./fixtures.mjs";

const graphOf = (p) => main(p).querySelector(".mk-graph");
const GOOD = { valid: { from: "2020-01-01", to: "2030-01-01" } };

/** The world's own answer to `op` with its result changed by `fn(result)`: a node the registry gives no name, a step of a kind no act makes (K5044 (1)). */
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op)
  ? { ...a, json: { ...a.json, result: fn(a.json.result) } } : a));
const noLabel = (id) => (r) => ({ ...r, nodes: (r.nodes || []).map((n) => (n.id === id ? { ...n, label: null } : n)) });
/** The graph the record gives for the read the page last made. */
const worldGraph = (me, p) => me.act("exploregraph", { body: p.byOp("exploregraph").at(-1).body });

/** Two people the record follows, a person's employment (a passage of a held roster) and the department's place in the city, a tie between two records of the
 *  same name: the graph of L. Chen is her associate R. Alvarez (a line a rule grades C), the department Alvarez works in two rings out (where the walk
 *  stops), and the other L. Chen (a claim of the same person). */
async function scene(world, me) {
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const entity = async (kind, label) => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes." } })).entity_id;
  const chen = await entity("person", "L. Chen");
  const alvarez = await entity("person", "R. Alvarez");
  const twin = await entity("person", "Lin Chen");
  const org = await entity("body", "Public Works Department");
  const city = await entity("body", "City of Oakland");
  const roster = await world.recipes.hold(me, "Roster.txt", "L. Chen and R. Alvarez work for the Public Works Department of the City of Oakland.");
  const passage = { captureSha: roster.sha, extent: { kind: "document" } };
  await me.act("recordline", { body: { kind: "associate_of", from: chen, to: alvarez, ...GOOD, basis: { rule: "roster", source: { profile: "oakland-alameda", entry: "public-works" } }, reason: "The roster says so." } });
  await me.act("recordline", { body: { kind: "holds", from: alvarez, to: org, capacity: "employee", ...GOOD, basis: passage, reason: "The roster says so." } });
  await me.act("recordline", { body: { kind: "part_of", from: org, to: city, valid: { from: "2000-01-01", to: "2030-01-01" }, basis: passage, reason: "The roster says so." } });
  await me.act("identityclaim", { body: { a: chen, b: twin, kind: "same_as", basis: "testimony", note: "I met both at the same meeting" } });
  return { chen, alvarez, twin, org, city, roster };
}

test("R18 explore draws the graph from exploregraph with the screen's subject as centre, the member's day and rings 2: each node a reference with its kind's word, each step a line in its class's mark with its word, grade letter and citation; the stop drawn at its node", async () => {
  const { world, me } = await inWorld();
  const S = await scene(world, me);
  /* the department has a name in the record; one the registry gave none is a record the live copy holds that this build does not make */
  const p = await openAs(world, me, "/app/explore/" + S.chen, { plane: { exploregraph: changing(world, me, "exploregraph", noLabel(S.org)) } });
  const r = p.byOp("exploregraph")[0].body;
  assert.deepEqual([r.centre, r.rings, r.at.precision], [S.chen, 2, "day"]);
  assert.match(r.at.value, /^\d{4}-\d{2}-\d{2}$/, "a day, never now");
  const walk = await worldGraph(me, p);
  const g = graphOf(p);
  assert.ok(g.querySelector(`a.cs-ref[href="/app/person/${S.alvarez}"]`), "the person one ring out is drawn");
  assert.ok(g.querySelector(`a.cs-ref[href="/app/person/${S.org}"]`), "the organization two rings out is drawn");
  assert.deepEqual(walk.nodes.map((n) => n.ring).sort(), [0, 1, 1, 2], "the world: a centre, two records one ring out, one two rings out");
  assert.equal(g.querySelectorAll("svg g.node").length, walk.nodes.length);
  assert.ok(g.querySelector(".gwrap .e-pos"), "a position line in its class");
  assert.ok(g.querySelector(".gwrap .e-same"), "a same-person claim in its class");
  assert.equal(g.querySelector(".gwrap .e-money"), null, "no line of a class the walk did not meet");
  drew(g, "connection.thing.org", undefined, "the far end of a position is an organization, by its kind's word");
  /* R35: nodes are named; an unnamed one says so, and no node is drawn by its id */
  assert.ok(g.textContent.includes(walk.nodes.find((n) => n.id === S.alvarez).label), "the person one ring out is drawn by name");
  drew(g, "connection.node.unnamed", undefined, "an unnamed organization two rings out");
  assert.ok(g.querySelector(`[data-node="${S.org}"][data-tip]`), "the unnamed node explains itself");
  assert.doesNotMatch(g.textContent, /ENT-2026-\d+/, "no node is drawn by its id");
  drew(g, "connection.thing.person", undefined, "the near end of a position is a person");
  assert.deepEqual(g.querySelectorAll("svg .gchip text").map((t) => t.textContent).sort(), walk.steps.map((s) => s.grade.assertion).sort(), "each line carries its grade's letter");
  assert.ok(new Set(walk.steps.map((s) => s.grade.assertion)).size > 1, "the world: the lines are graded apart");
  for (const s of walk.steps) assert.ok(g.textContent.includes(s.word), "each step's word, as the plane gives it: " + s.word);
  drew(g.querySelector("[data-limit]"), "connection.graph.limit", undefined, "the stop is drawn at its node");
  drew(g.querySelector(`[data-limit="${S.org}"]`), "connection.graph.limit.means");
  assert.deepEqual(walk.stopped.map((s) => s.node), [S.org], "the world: the walk stopped at the department");
  assert.ok(g.querySelector(".cs-ref[data-tip], .cs-card[data-tip]"), "the citation");
  assert.doesNotMatch(main(p).textContent, /most connected|score|rank(ed)?:/i, "no score, rank or most connected (K1486)");
});

test("R18 pressing a node makes it the centre; the centres are kept as the trail, in page memory only; a failed read is drawn state.failed, never an empty graph", async () => {
  const { world, me } = await inWorld();
  const S = await scene(world, me);
  const at = "/app/explore/" + S.chen;
  const p = await openAs(world, me, at);
  const node = graphOf(p).querySelectorAll('button[data-act="explore"]').find((b) => b.getAttribute("data-node") === S.alvarez);
  await p.click(node);
  await settled(p);
  assert.equal(p.byOp("exploregraph").at(-1).body.centre, S.alvarez, "the read again from the pressed node");
  assert.equal(p.byOp("explore").length, 0, "no walk is sent by it");
  const trail = graphOf(p).querySelector(".mk-trail");
  drew(trail, "connection.graph.trail.label");
  assert.equal(trail.querySelectorAll('button[data-act="explore"]').length, 1, "the first centre is a control back");
  assert.equal(p.location.pathname, at, "the address is unchanged: page memory only");
  /* a read that fails: a fault the real code is not made to cause */
  for (const variant of [refusedIn("NO_NODE", "No such record."), silent]) {
    const q = await openAs(world, me, at, { plane: { exploregraph: variant } });
    assert.ok(main(q).querySelector('[data-state="failed"]'), "failed");
    assert.equal(graphOf(q), null, "never an empty graph");
  }
  const w = await openAs(world, me, at, { plane: { exploregraph: pending } });
  assert.ok(main(w).querySelector('[data-state="loading"]'));
});

test("R18 control: a step the read does not answer (a hidden hop) is not drawn or counted", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const ent = async (label, kind = "person") => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes." } })).entity_id;
  const chen = await ent("L. Chen"), alvarez = await ent("R. Alvarez"), org = await ent("Public Works Department", "body");
  const roster = await world.recipes.hold(me, "Roster.txt", "L. Chen and R. Alvarez work for the Public Works Department.");
  const passage = { captureSha: roster.sha, extent: { kind: "document" } };
  /* the walk ends one ring out: the department is held, but no line reaches it */
  await me.act("recordline", { body: { kind: "associate_of", from: chen, to: alvarez, ...GOOD, basis: passage, reason: "The roster says so." } });
  const p = await openAs(world, me, "/app/explore/" + chen);
  const walk = await worldGraph(me, p);
  const m = graphOf(p);
  assert.equal(walk.nodes.length, 2);
  assert.equal(walk.steps.length, 1);
  assert.equal(m.querySelectorAll("svg g.node").length, 2);
  assert.equal(m.querySelectorAll(".gwrap .e-pos").length, 1, "the one step the read answers");
  assert.equal(m.querySelector(`a.cs-ref[href="/app/person/${org}"]`), null);
  assert.equal(m.querySelector("[data-limit]"), null, "no stop said when none was met");
  /* the contrast the control rests on: with the department's line, its node is drawn and the stop said */
  await me.act("recordline", { body: { kind: "holds", from: alvarez, to: org, capacity: "employee", ...GOOD, basis: passage, reason: "The roster says so." } });
  const q = await openAs(world, me, "/app/explore/" + chen);
  assert.equal(graphOf(q).querySelectorAll("svg g.node").length, 3);
  assert.ok(graphOf(q).querySelector(`a.cs-ref[href="/app/person/${org}"]`));
  assert.ok(graphOf(q).querySelector(`[data-limit="${org}"]`));
});

test("R18 a declared step is drawn \"declared, not evidenced\" as a lead and a hunch as a hunch, never as evidence", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const ent = async (label, kind = "person") => (await me.act("entitycreate", { body: { kind, label, note: "Named in the minutes." } })).entity_id;
  const chen = await ent("L. Chen"), alvarez = await ent("R. Alvarez"), org = await ent("Public Works Department", "body");
  const roster = await world.recipes.hold(me, "Roster.txt", "R. Alvarez works for the Public Works Department.");
  await me.act("relationdeclare", { body: { fromEntity: chen, toEntity: alvarez, relation: "proxy_for", justification: "She signs for him on the minutes.", citation: "minutes, page 2" } });
  await me.act("recordline", { body: { kind: "holds", from: alvarez, to: org, capacity: "employee", ...GOOD, basis: { captureSha: roster.sha, extent: { kind: "document" } }, reason: "The roster says so." } });
  const words = (await me.read("affordances", {})).vocabularies.connection_kinds.words;
  /* a declared step is the member's own act; a hunch is held only inside the inquiry that holds it, which the page's read never names (it sends no scope),
     so the second step is changed to the hunch the world would answer inside one */
  const hunch = (r) => ({ ...r, steps: r.steps.map((s) => (s.kind === "line:holds:employee" ? { ...s, kind: "hunch", word: words.hunch.word, class: "hunch", label: "hunch", grade: null, evidence: [] } : s)) });
  const p = await openAs(world, me, "/app/explore/" + chen, { plane: { exploregraph: changing(world, me, "exploregraph", hunch) } });
  const walk = await worldGraph(me, p);
  assert.equal(walk.steps.find((s) => s.kind === "proxy_for").class, "declared", "the world: the declared step is a declared one");
  const m = graphOf(p);
  assert.equal(m.querySelectorAll(".gwrap .e-lead").length, 2, "both are drawn as leads");
  drew(m, "screen.explore.g.declared");
  drew(m, "screen.explore.g.hunch");
  /* control: the same step, not changed, is evidence */
  const q = await openAs(world, me, "/app/explore/" + chen);
  assert.equal(graphOf(q).querySelectorAll(".gwrap .e-lead").length, 1);
  assert.ok(graphOf(q).querySelector(".gwrap .e-pos"));
});

test("R18 person draws \"Connections\" from exploregraph with this person as the centre; control: a failed read is state.failed", async () => {
  const { world, me } = await inWorld();
  const S = await scene(world, me);
  const p = await openAs(world, me, "/app/person/" + S.chen);
  assert.equal(p.byOp("exploregraph")[0].body.centre, S.chen);
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.person.connections"));
  assert.ok(sec.querySelector(".mk-graph svg g.node.center"), "the centre is drawn");
  assert.ok(sec.querySelector(`a.cs-ref[href="/app/person/${S.org}"]`));
  const node = sec.querySelectorAll('button[data-act="explore"]').find((b) => b.getAttribute("data-node") === S.alvarez);
  await p.click(node);
  await settled(p);
  assert.equal(p.byOp("exploregraph").at(-1).body.centre, S.alvarez);
  assert.equal(p.location.pathname, "/app/person/" + S.chen, "pressing a node on person recentres, it does not leave");
  const q = await openAs(world, me, "/app/person/" + S.chen, { plane: { exploregraph: refusedIn("NO_NODE", "No such record.") } });
  assert.ok(main(q).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.person.connections")).querySelector('[data-state="failed"]'));
});

test("R18 the money trail draws the graph with the trail's set as the centre; a node opens Explore connections at it", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const trail = await world.recipes.trail(me, project, "Stormwater fund transfers, FY2023");
  const chen = (await me.act("entitycreate", { body: { kind: "person", label: "L. Chen", note: "Director of the department." } })).entity_id;
  const section = (p) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.money.graph"));
  /* no walk joins a money trail's set to a person (money's connections run between the parties of a figure, never to the set that gathers figures), so the
     world's graph of the set is its centre alone; a node one ring out is the externally driven part of the answer */
  const joined = changing(world, me, "exploregraph", (r) => ({ ...r, nodes: r.nodes.concat([{ id: chen, ring: 1, id_kind: "ENT", label: "L. Chen", entity_kind: "person" }]),
    steps: [{ id: "co:1", from: trail, to: chen, kind: "mentioned_together", word: "mentioned together", class: "derived", grade: { assertion: "C", ends: ["C", "C"] }, evidence: [], valid: {} }] }));
  const p = await openAs(world, me, "/app/money/" + trail, { plane: { exploregraph: joined } });
  assert.equal(p.byOp("exploregraph")[0].body.centre, trail);
  const sec = section(p);
  assert.ok(sec.querySelector(".mk-graph svg"));
  assert.ok(sec.querySelector(".mk-graph svg g.node.center"), "the trail's set is the centre");
  const link = sec.querySelectorAll("a.cs-btn").find((a) => a.getAttribute("href") === "/app/explore/" + chen);
  assert.ok(link, "a node on the money trail opens Explore connections at it (the registry lists no explore act on money)");
  const q = await openAs(world, me, "/app/money/" + trail, { plane: { exploregraph: silent } });
  assert.ok(section(q).querySelector('[data-state="failed"]'));
  /* the world's own graph of the set: drawn, with the centre alone */
  const w = await openAs(world, me, "/app/money/" + trail);
  assert.ok(section(w).querySelector(".mk-graph svg g.node.center"));
});

test("R35 a step_source step shows who attached the source and when beside its citation; B14: it offers no withdrawal (the design draws none on explore); control: a step of another kind shows neither", async () => {
  const { world, me } = await inWorld();
  const a = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "Deputy clerk, named in the minutes." } })).entity_id;
  const b = (await me.act("entitycreate", { body: { kind: "person", label: "Ben Okafor", note: "Contractor, named in the minutes." } })).entity_id;
  const relation = (await me.act("relationdeclare", { body: { fromEntity: a, toEntity: b, relation: "proxy_for", justification: "He signs for her on the minutes.", citation: "minutes, page 2" } })).relation_id;
  const memo = await world.recipes.hold(me, "Memo.txt", "Ben Okafor signs for Ana Rivera when she is away.\n\nThe clerk confirms it.");
  const units = await readHeld(world, me, memo.sha);
  /* control: the declared step, before a source is attached to it, shows neither */
  const q = await openAs(world, me, "/app/explore/" + a);
  assert.equal(graphOf(q).querySelectorAll('[data-attached]').length, 0);
  await me.act("stepsource", { body: { relation, captureSha: memo.sha, extent: units[0].extent, basis: "The memo says he signs for her." } });
  const p = await openAs(world, me, "/app/explore/" + a);
  const step = (await worldGraph(me, p)).steps.find((s) => s.kind === "step_source");
  assert.ok(step && step.attached_by && step.at, "the world: the step records who attached the source and when");
  const g = graphOf(p);
  drew(g, "screen.explore.attached", { by: me.handle, date: dayOf(step.at.slice(0, 10)) });
  assert.equal(g.querySelectorAll('button[data-act="stepsourcewithdraw"]').length, 0, "no withdrawal control: the design draws none");
  assert.equal(g.querySelectorAll('[data-attached]').length, 1);
});
