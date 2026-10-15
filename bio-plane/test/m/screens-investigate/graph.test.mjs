/* screens-investigate R18: the connection graph on explore, on person ("Connections") and on the money trail, from
 * exploregraph (explore R21), on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, silent, pending } from "../interface-shell/harness.mjs";
import { open, main, button, GRAPH, GRAPH_PERSON, ENT, ORG, MSR, SHA, word, drew, notDrew } from "./fixtures.mjs";

const graphOf = (p) => main(p).querySelector(".mk-graph");

test("R18 explore draws the graph from exploregraph with the screen's subject as centre, the member's day and rings 2: each node a reference with its kind's word, each step a line in its class's mark with its word, grade letter and citation; the stop drawn at its node", async () => {
  const p = await open("/app/explore/" + ENT);
  const r = p.byOp("exploregraph")[0].body;
  assert.deepEqual([r.centre, r.rings, r.at.precision], [ENT, 2, "day"]);
  assert.match(r.at.value, /^\d{4}-\d{2}-\d{2}$/, "a day, never now");
  const g = graphOf(p);
  assert.ok(g.querySelector(`a.cs-ref[href="/app/person/${GRAPH_PERSON}"]`), "the person one ring out is drawn");
  assert.ok(g.querySelector(`a.cs-ref[href="/app/person/${ORG}"]`), "the organization two rings out is drawn");
  assert.equal(g.querySelectorAll("svg g.node").length, 3);
  assert.ok(g.querySelector(".gwrap .e-ment"), "a mentioned-together line in its class");
  assert.ok(g.querySelector(".gwrap .e-pos"), "a position line in its class");
  assert.equal(g.querySelector(".gwrap .e-money"), null, "no line of a class the walk did not meet");
  drew(g, "connection.thing.org", undefined, "the far end of a position is an organization, by its kind's word");
  drew(g, "connection.thing.person", undefined, "the near end of a position is a person");
  assert.deepEqual(g.querySelectorAll("svg .gchip text").map((t) => t.textContent).sort(), ["B", "C"], "each line carries its grade's letter");
  assert.ok(g.textContent.includes("mentioned together") && g.textContent.includes("held the post (employee)"), "each step's word, as the plane gives it");
  drew(g.querySelector("[data-limit]"), "connection.graph.limit", undefined, "the stop is drawn at its node");
  drew(g.querySelector(`[data-limit="${ORG}"]`), "connection.graph.limit.means");
  assert.ok(g.querySelector(".cs-ref[data-tip], .cs-card[data-tip]"), "the citation");
  assert.doesNotMatch(main(p).textContent, /most connected|score|rank(ed)?:/i, "no score, rank or most connected (K1486)");
});

test("R18 pressing a node makes it the centre; the centres are kept as the trail, in page memory only; a failed read is drawn state.failed, never an empty graph", async () => {
  const p = await open("/app/explore/" + ENT);
  const node = graphOf(p).querySelectorAll('button[data-act="explore"]').find((b) => b.getAttribute("data-node") === GRAPH_PERSON);
  await p.click(node);
  await p.settle();
  assert.equal(p.byOp("exploregraph").at(-1).body.centre, GRAPH_PERSON, "the read again from the pressed node");
  assert.equal(p.byOp("explore").length, 0, "no walk is sent by it");
  const trail = graphOf(p).querySelector(".mk-trail");
  drew(trail, "connection.graph.trail.label");
  assert.equal(trail.querySelectorAll('button[data-act="explore"]').length, 1, "the first centre is a control back");
  assert.equal(p.location.pathname, "/app/explore/" + ENT, "the address is unchanged: page memory only");
  for (const variant of [refusedIn("NO_NODE", "No such record."), silent]) {
    const q = await open("/app/explore/" + ENT, { plane: { exploregraph: variant } });
    assert.ok(main(q).querySelector('[data-state="failed"]'), "failed");
    assert.equal(graphOf(q), null, "never an empty graph");
  }
  const w = await open("/app/explore/" + ENT, { plane: { exploregraph: pending } });
  assert.ok(main(w).querySelector('[data-state="loading"]'));
});

test("R18 control: a step the read does not answer (a hidden hop) is not drawn or counted", async () => {
  const g = GRAPH();
  g.nodes = g.nodes.slice(0, 2);
  g.steps = g.steps.slice(0, 1);
  g.stopped = [];
  const p = await open("/app/explore/" + ENT, { plane: { exploregraph: ok(g) } });
  const m = graphOf(p);
  assert.equal(m.querySelectorAll("svg g.node").length, 2);
  assert.equal(m.querySelector(`a.cs-ref[href="/app/person/${ORG}"]`), null);
  assert.equal(m.querySelector("[data-limit]"), null, "no stop said when none was met");
});

test("R18 a declared step is drawn \"declared, not evidenced\" as a lead and a hunch as a hunch, never as evidence", async () => {
  const g = GRAPH();
  g.steps[0] = { ...g.steps[0], kind: "proxy_for", word: "proxy for", class: "declared", label: "declared, not evidenced", grade: { assertion: "D", ends: ["D", "D"] }, evidence: [] };
  g.steps[1] = { ...g.steps[1], kind: "hunch_of", word: "suspected", class: "hunch", label: "hunch", grade: null, evidence: [] };
  const p = await open("/app/explore/" + ENT, { plane: { exploregraph: ok(g) } });
  const m = graphOf(p);
  assert.equal(m.querySelectorAll(".gwrap .e-lead").length, 2, "both are drawn as leads");
  drew(m, "screen.explore.g.declared");
  drew(m, "screen.explore.g.hunch");
});

test("R18 person draws \"Connections\" from exploregraph with this person as the centre; control: a failed read is state.failed", async () => {
  const p = await open("/app/person/" + ENT);
  assert.equal(p.byOp("exploregraph")[0].body.centre, ENT);
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.person.connections"));
  assert.ok(sec.querySelector(".mk-graph svg g.node.center"), "the centre is drawn");
  assert.ok(sec.querySelector(`a.cs-ref[href="/app/person/${ORG}"]`));
  const node = sec.querySelectorAll('button[data-act="explore"]').find((b) => b.getAttribute("data-node") === GRAPH_PERSON);
  await p.click(node);
  await p.settle();
  assert.equal(p.byOp("exploregraph").at(-1).body.centre, GRAPH_PERSON);
  assert.equal(p.location.pathname, "/app/person/" + ENT, "pressing a node on person recentres, it does not leave");
  const q = await open("/app/person/" + ENT, { plane: { exploregraph: refusedIn("NO_NODE", "No such record.") } });
  assert.ok(main(q).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.person.connections")).querySelector('[data-state="failed"]'));
});

test("R18 the money trail draws the graph with the trail's set as the centre; a node opens Explore connections at it", async () => {
  const p = await open("/app/money/" + MSR);
  assert.equal(p.byOp("exploregraph")[0].body.centre, MSR);
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.money.graph"));
  assert.ok(sec.querySelector(".mk-graph svg"));
  const link = sec.querySelectorAll("a.cs-btn").find((a) => a.getAttribute("href") === "/app/explore/" + GRAPH_PERSON);
  assert.ok(link, "a node on the money trail opens Explore connections at it (the registry lists no explore act on money)");
  const q = await open("/app/money/" + MSR, { plane: { exploregraph: silent } });
  assert.ok(main(q).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.money.graph")).querySelector('[data-state="failed"]'));
});
