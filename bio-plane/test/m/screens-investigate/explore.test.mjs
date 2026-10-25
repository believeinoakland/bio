/* screens-investigate R2: exploring connections, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, WALK, GRAPH, ENT, ORG, SHA, word, hasWord, drew, notDrew, dayOf } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld, rewrite } from "./world.mjs";

/** Two people the record follows and a tie one declared to the other (a `proxy_for`, a declared step with no source), by the members' own acts. */
async function declaredTie(me) {
  const a = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "Deputy clerk, named in the minutes." } })).entity_id;
  const b = (await me.act("entitycreate", { body: { kind: "person", label: "Ben Okafor", note: "Contractor, named in the minutes." } })).entity_id;
  await me.act("relationdeclare", { body: { fromEntity: a, toEntity: b, relation: "proxy_for", justification: "He signs for her on the minutes.", citation: "minutes, page 2" } });
  return { a, b };
}

const at = "/app/explore/" + ENT;
const walked = async (o = {}) => {
  const p = await open(at, o);
  fill(p, { "explore-at": "2025-06-30" });
  await press(p, "explore");
  return p;
};

test("R24 R27 explore's Follow offers the design's six groups, the first three ticked; ticking Money sends exactly the money kinds; ticking Stated in a source sends exactly its kinds; control: Mentioned together sends no step_source kind, no checkbox per kind", async () => {
  const p = await open(at);
  const box = p.doc.getElementById("explore-groups");
  const boxes = box.querySelectorAll("input");
  assert.deepEqual(boxes.map((b) => b.parentElement.textContent.trim()), ["pos", "money", "part", "ment", "same", "step_source"].map((g) => word("connection.kind." + g + ".name")));
  assert.deepEqual(boxes.map((b) => b.checked), [true, true, true, false, false, false]);
  assert.equal(p.doc.getElementById("explore-kinds"), null, "no raw kind checkbox is drawn");
  assert.equal(p.root().querySelectorAll('input[type="checkbox"]').filter((i) => /explore-kinds/.test(i.getAttribute("name") || "")).length, 0);
  boxes[0].checked = false; boxes[2].checked = false;
  fill(p, { "explore-to": ORG, "explore-at": "2025-06-30" });
  await press(p, "explore");
  assert.deepEqual(p.byOp("explore")[0].body, { from: ENT, to: ORG, at: { value: "2025-06-30", precision: "day", zone: "UTC" }, kinds: ["money_flow"] }, "only Money ticked: exactly the money kinds");
  const q = await open(at);
  q.doc.getElementById("explore-groups").querySelectorAll("input").forEach((b, i) => { b.checked = i === 3 || i === 4; });
  fill(q, { "explore-at": "2025-06-30" });
  await press(q, "explore");
  assert.deepEqual(q.byOp("explore")[0].body.kinds, ["mentioned_together", "proxy_for"], "each group sends its kinds by the vocabulary's group; Mentioned together sends no step_source kind");
  const r = await open(at);
  r.doc.getElementById("explore-groups").querySelectorAll("input").forEach((b, i) => { b.checked = i === 5; });
  fill(r, { "explore-at": "2025-06-30" });
  await press(r, "explore");
  assert.deepEqual(r.byOp("explore")[0].body.kinds, ["step_source"], "Stated in a source sends exactly its kinds (affordances R60's group)");
});

test("R27 a step_source step is drawn in its own class (e-step_source), named by connection.kind.step_source.name and explained by its means; control: a mentioned-together step is not", async () => {
  const g = GRAPH();
  g.steps[0] = { ...g.steps[0], kind: "step_source", word: "step sourced", class: "evidentiary", grade: { assertion: "B", ends: ["D", "D"] }, evidence: [{ capture_sha: SHA }] };
  const p = await open(at, { plane: { exploregraph: ok(g) } });
  const gr = main(p).querySelector(".mk-graph");
  assert.equal(gr.querySelectorAll(".gwrap .e-step_source").length, 1, "its own class");
  assert.equal(gr.querySelectorAll(".gwrap .e-ment").length, 0, "not drawn as mentioned together");
  assert.ok(gr.querySelector(".mk-glegend").textContent.includes(word("connection.kind.step_source.name")), "the legend names it");
  assert.ok(gr.querySelector(`.mk-glegend [data-tip="${word("connection.kind.step_source.means")}"]`), "and explains it");
  for (const k of ["connection.kind.step_source.name", "connection.kind.step_source.means"]) assert.ok(hasWord(k), k);
  const q = await open(at);
  assert.equal(main(q).querySelector(".mk-graph").querySelectorAll(".gwrap .e-step_source").length, 0);
});

test("R29 explore opened with no centre draws its sentence by key and asks the plane for no graph, never \"no centre is named\"; control: with a centre, the graph", async () => {
  const p = await open("/app/explore");
  drew(main(p), "screen.explore.nocentre");
  assert.equal(p.byOp("exploregraph").length, 0, "no graph is read");
  assert.equal(main(p).querySelector(".mk-graph"), null);
  assert.ok(hasWord("screen.explore.nocentre"));
  const q = await open(at);
  assert.ok(main(q).querySelector(".mk-graph"));
  notDrew(main(q), "screen.explore.nocentre");
});

test("R24 a walk with no group ticked sends nothing (control)", async () => {
  const p = await open(at);
  p.doc.getElementById("explore-groups").querySelectorAll("input").forEach((b) => { b.checked = false; });
  fill(p, { "explore-at": "2025-06-30" });
  await press(p, "explore");
  assert.equal(p.byOp("explore").length, 0);
});

test("R2 the day is never \"now\": no day sends nothing (control)", async () => {
  const p = await open(at);
  fill(p, { "explore-at": "" });
  await press(p, "explore");
  assert.equal(p.byOp("explore").length, 0);
  drew(main(p), "screen.explore.at.empty");
});

test("R2 each chain drawn hop by hop, each hop a reference and its cited source; the chain's grade its weakest hop's; a declared step a lead, never a finding; no score", async () => {
  const p = await walked();
  const chains = main(p).querySelectorAll("div.mk-msg[data-chain]");
  assert.equal(chains.length, 2);
  const [a, b] = chains;
  assert.equal(a.querySelector(".cs-grade").textContent, "ConnectionC", "the weakest hop's grade");
  const hops = a.querySelectorAll("[data-hop]");
  assert.equal(hops.length, 2);
  assert.ok(hops[0].querySelector(`a.cs-ref[href="/app/person/${ENT}"]`) || hops[0].querySelector(".cs-card"));
  assert.ok(hops[0].textContent.includes("held the post (employee)"), "the hop's kind, as the vocabulary words it");
  assert.ok(hops[0].querySelector(`[data-tip*="page 2"]`), "the hop's cited passage");
  drew(b, "screen.explore.lead");
  drew(b.querySelector("[data-hop]"), "screen.explore.declared");
  drew(main(p), "screen.explore.noscore");
  assert.doesNotMatch(main(p).textContent, /most connected|score:/i);
});

test("R2 a walk stopped at a bound says so, undetermined (control: a complete walk says nothing of it)", async () => {
  const p = await walked({ plane: { explore: ok(WALK({ truncated: true, undetermined: true, why: "the walk reached its limit of 5000 nodes", complete: false })) } });
  assert.ok(main(p).textContent.includes("the walk reached its limit of 5000 nodes"), "the plane's own reason");
  const q = await walked();
  assert.ok(!main(q).textContent.includes("the walk reached its limit of 5000 nodes"));
  assert.ok(!main(q).textContent.includes(word("screen.explore.stopped", { depth: "8" })));
});

test("R2 explore's own refusal ({refused, why}) is drawn, never as no chains (control)", async () => {
  const p = await walked({ plane: { explore: ok({ refused: "UNKNOWN_KIND", why: "no such kind of connection" }) } });
  assert.ok(main(p).textContent.includes("no such kind of connection"), "the plane's own words");
  notDrew(main(p), "screen.explore.nochains");
});

test("R2 explorepreset by its name; promote opens a question naming the chain", async () => {
  const { world, me } = await inWorld();
  const { a, b } = await declaredTie(me);
  const p = await openAs(world, me, "/app/explore/" + a);
  fill(p, { "explore-at": "2026-09-30", "explore-preset": "pathBetween", "explore-to": b });
  await press(p, "explorepreset");
  await settled(p);
  assert.equal(p.byOp("explorepreset").at(-1).body.preset, "pathBetween");
  assert.equal(p.byOp("explorepreset").at(-1).body.from, a);
  const [chain] = main(p).querySelectorAll("div.mk-msg[data-chain]");
  assert.ok(chain, "the real walk draws the chain");
  assert.deepEqual(actsIn(chain).filter((x) => ["exploreverify", "promote"].includes(x)).sort(), ["exploreverify", "promote"]);
  const walk = (await world.door({ url: "/api/?op=explorepreset", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(p.byOp("explorepreset").at(-1).body) } }, me)).json.result;
  const steps = walk.paths[0].hops.map((h) => `${h.from} → ${h.kind} → ${h.to}`).join("; ");
  await press(p, "promote", { within: chain, reason: "The minutes say so." });
  await settled(p);
  const pr = p.byOp("promote")[0].body;
  assert.match(pr.bundleId, /^INQ-\d{4}-\d{4}-chain$/, "the id the record allocated");
  assert.ok(pr.files[0].text.includes(word("file.chain.question", { steps })), "the question, by its key");
  assert.ok(pr.files[0].text.includes(word("file.recheck.chain")) && pr.files[0].text.includes(word("file.recheck.chain.why")), "the recheck trigger, by its keys");
  assert.ok(pr.meta.title.startsWith(word("file.chain.title", { steps }).slice(0, 40)));
  assert.equal(p.location.pathname, "/app/question/" + pr.bundleId);
});

test("R2 exploreverify \"Check this chain\" sends the drawn path as chain (explore R23) and draws matches, lead and each hop's answer; control: a tampered hop is drawn \"does not match\"", async () => {
  const answer = { ok: true, matches: true, lead: false, hops: [{ id: "lines:holds:1", rederived: false, class: "evidentiary" }, { id: "co:5", matches: true }] };
  const p = await walked({ plane: { exploreverify: ok(answer) } });
  const [a, b] = main(p).querySelectorAll("div.mk-msg[data-chain]");
  await press(p, "exploreverify", { within: a });
  const body = p.byOp("exploreverify")[0].body;
  assert.deepEqual(body.chain.map((h) => h.id), ["lines:holds:1", "co:5"]);
  assert.deepEqual(body.chain[1], { kind: "mentioned_together", from: ORG, to: "ENT-2026-0200", as_of: "2026-10-14", method: "co-mention@1", id: "co:5" });
  assert.deepEqual(body.chain[0], { id: "lines:holds:1", kind: "line:holds:employee", owner: "lines" });
  for (const k of ["screen.explore.verify.matches", "screen.explore.verify.cited", "screen.explore.verify.hop.holds"]) drew(main(p).querySelector('[data-verified="0"]'), k, { why: "" });
  const t = await walked({ plane: { exploreverify: ok({ ok: true, matches: false, lead: false, hops: [{ id: "co:5", matches: false }] }) } });
  await press(t, "exploreverify", { within: main(t).querySelectorAll("div.mk-msg[data-chain]")[0] });
  drew(main(t).querySelector('[data-verified="0"]'), "screen.explore.verify.differs", { why: "" });
  drew(main(t).querySelector('[data-verified="0"]'), "screen.explore.verify.hop.differs");
  const l = await walked({ plane: { exploreverify: ok({ ok: true, matches: false, lead: true, hops: [] }) } });
  await press(l, "exploreverify", { within: main(l).querySelectorAll("div.mk-msg[data-chain]")[1] });
  drew(main(l).querySelector('[data-verified="1"]'), "screen.explore.verify.lead");
  assert.ok(b);
});

test("R17 Attach a source to a declared step sends stepsource with the hop's relation, the chosen passage and the member's words; the walk is read again and the hop is drawn evidenced; B14: the design draws no withdrawal of the attached source on explore, so none is drawn", async () => {
  const { world, me } = await inWorld();
  const { a } = await declaredTie(me);
  const memo = await world.recipes.hold(me, "Memo.txt", "Ben Okafor signs for Ana Rivera when she is away.\n\nThe clerk confirms it.");
  const mu = await readHeld(world, me, memo.sha);
  const p = await openAs(world, me, "/app/explore/" + a);
  fill(p, { "explore-groups-4": true, "explore-at": "2026-09-30" });
  await press(p, "explore");
  await settled(p);
  const lead = () => main(p).querySelectorAll("div.mk-msg[data-chain]").find((c) => c.querySelector('button[data-act="stepsource"]') || c.querySelector("[data-attached]"));
  drew(lead(), "screen.explore.lead");
  assert.equal(button(p, "connectionassert"), null, "connectionassert is not drawn for this act");
  const basis = "The memo says he signs for her.";
  /* R34 (K5148): the document is chosen by title and the passage by its words, never typed */
  fill(p, { "explore-assert-doc": memo.sha, "explore-assert-basis": basis });
  p.fire(p.doc.getElementById("explore-assert-doc"), "change");
  await settled(p);
  await p.click(main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith("explore-assert-passage-")).querySelectorAll('[data-shell="word"]')[1]);
  await press(p, "stepsource", { within: lead(), reason: basis });
  await settled(p);
  const sent = p.byOp("stepsource")[0].body;
  assert.deepEqual([sent.captureSha, sent.extent, sent.basis], [memo.sha, mu[1].extent, basis]);
  assert.match(sent.relation, /^REL-/, "the hop's own relation");
  const done = lead();
  drew(done, "screen.explore.evidenced", undefined, "evidenced, no longer a lead");
  notDrew(done, "screen.explore.declared");
  const walked = (await world.door({ url: "/api/?op=explore", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(p.byOp("explore").at(-1).body) } }, me)).json.result;
  const step = walked.paths.flatMap((x) => x.hops).find((h) => h.kind === "step_source");
  assert.ok(step && step.backs === sent.relation, "the world: the walk holds the attached source for that relation");
  assert.equal(done.querySelector(".cs-grade").textContent, word("mark.scale.connection.name") + step.grade.assertion, "at the capture's grade");
  drew(done.querySelector("[data-attached]"), "screen.explore.attached", { by: me.handle, date: dayOf(step.at.slice(0, 10)) });
  assert.ok(button(p, "stepsourcewithdraw") === null, "B14: stepsourcewithdraw is not the registry's act on explore and the design draws no control for it (K3052)");
  assert.equal(main(p).textContent.includes(word("screen.explore.withdraw")), false);
});

test("R17 an attachment without its passage or without the member's words sends nothing (control); a refusal is drawn by its words", async () => {
  const p = await walked({ plane: { stepsource: refusedIn("EXTENT_MALFORMED", "That passage cannot be read.") } });
  const lead = () => main(p).querySelectorAll("div.mk-msg[data-chain]")[1];
  await press(p, "stepsource", { within: lead() });
  assert.equal(p.byOp("stepsource").length, 0);
  fill(p, { "explore-assert-doc": SHA, "explore-assert-basis": "The minutes name him." });
  await press(p, "stepsource", { within: lead() });
  assert.ok(main(p).textContent.includes(word("refusal.EXTENT_MALFORMED")), "the refusal by its words");
});

/* R43, R46 (T51-120) */
test("R43 an unnamed node in the graph says how many documents name it only by an identifier (entityidonly, asked once for the unnamed nodes' ids); a count of 0 or a failed read draws no why line; a named node draws neither", async () => {
  const p = await open(at, { plane: { entityidonly: ok({ ok: true, count: 1, entities: [{ entity_id: ORG, documents: 3 }] }) } });
  const q = p.byOp("entityidonly");
  assert.equal(q.length, 1);
  assert.equal(q[0].query.ids, ORG, "the unnamed node's id alone");
  const why = main(p).querySelector(`[data-why="${ORG}"]`);
  drew(why, "screen.explore.unnamed.why", { n: "3" });
  assert.equal(main(p).querySelectorAll("[data-why]").length, 1, "the named nodes draw none");
  for (const variant of [ok({ ok: true, entities: [{ entity_id: ORG, documents: 0 }] }), refusedIn("TOO_MANY_IDS", "x")]) {
    const z = await open(at, { plane: { entityidonly: variant } });
    assert.equal(main(z).querySelectorAll("[data-why]").length, 0, "no why line, never 0 documents");
    drew(main(z), "connection.node.unnamed", undefined, "the node is still drawn unnamed");
  }
});

test("R43 an explored hop is worded From {from} to {to} with a name of each end, an end with no name an unnamed item, with the vocabulary's kind word; R46 a hop's cited page counts from one, page 0 drawn", async () => {
  const w = WALK();
  w.paths[0].hops[0].from = ENT;
  w.paths[0].hops[0].to = "ENT-2026-0777";
  w.paths[0].hops[0].evidence = [{ capture_sha: SHA, extent: { kind: "pdf-page", page: 0 } }];
  const p = await walked({ plane: { explore: ok(w), entityidonly: ok({ ok: true, entities: [{ entity_id: "ENT-2026-0777", documents: 2 }] }) } });
  const hop = main(p).querySelector('[data-hop="lines:holds:1"]');
  drew(hop, "screen.explore.hop", { from: "L. Chen", to: word("screen.explore.hop.unnamed") });
  assert.ok(hop.textContent.includes("held the post (employee)"), "the vocabulary's kind word");
  drew(hop, "screen.explore.unnamed.why", { n: "2" });
  assert.ok(hop.querySelector(`[data-tip*="${word("screen.explore.page", { page: "1" })}"]`), "page 0 is drawn as page 1");
  const named = main(p).querySelector('[data-hop="co:5"]');
  assert.equal(named.querySelectorAll("[data-unnamed]").length, 0, "control: a hop whose ends are named draws no unnamed line");
  drew(named, "screen.explore.hop", { from: "Public Works Department", to: "R. Alvarez" });
});

test("R46 R34 the assertion form's passage is the words chosen: the extent sent is the record's own, a page counted from 0 (its page 1 drawn as one), and a document read as no page is cited whole", async () => {
  const p = await walked();
  const lead = () => main(p).querySelectorAll("div.mk-msg[data-chain]")[1];
  fill(p, { "explore-assert-doc": SHA, "explore-assert-basis": "The minutes name him." });
  p.fire(p.doc.getElementById("explore-assert-doc"), "change");
  await p.settle();
  await press(p, "stepsource", { within: lead() });
  assert.deepEqual(p.byOp("stepsource")[0].body.extent, { kind: "document" }, "no words chosen: the whole document");
  await p.click(main(p).querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith("explore-assert-passage-")).querySelectorAll('[data-shell="word"]')[0]);
  await press(p, "stepsource", { within: lead() });
  assert.deepEqual(p.byOp("stepsource")[1].body.extent, { kind: "pdf-page", page: 0 }, "the first page, as the record counts it");
});
