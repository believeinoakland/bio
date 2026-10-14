/* screens-investigate R2: exploring connections, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, WALK, ENT, ORG, SHA } from "./fixtures.mjs";

const at = "/app/explore/" + ENT;
const walked = async (o = {}) => {
  const p = await open(at, o);
  fill(p, { "explore-at": "2025-06-30" });
  await press(p, "explore");
  return p;
};

test("R24 explore's Follow offers the design's five groups, the first three ticked; ticking Money sends exactly the money kinds; control: no checkbox per kind", async () => {
  const p = await open(at);
  const box = p.doc.getElementById("explore-groups");
  const boxes = box.querySelectorAll("input");
  assert.deepEqual(boxes.map((b) => b.parentElement.textContent.trim()), ["Position or membership", "Money", "Took part", "Mentioned together", "Same person?"]);
  assert.deepEqual(boxes.map((b) => b.checked), [true, true, true, false, false]);
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
  assert.deepEqual(q.byOp("explore")[0].body.kinds, ["mentioned_together", "proxy_for"], "each group sends its kinds by the vocabulary's group");
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
  assert.match(main(p).textContent, /Give the day to explore as of/);
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
  assert.match(hops[0].textContent, /held the post \(employee\)/);
  assert.ok(hops[0].querySelector(`[data-tip*="page 2"]`), "the hop's cited passage");
  assert.match(b.textContent, /a lead, not a finding/);
  assert.match(b.querySelector("[data-hop]").textContent, /declared, not evidenced/);
  assert.match(main(p).textContent, /never scored or ranked/);
  assert.doesNotMatch(main(p).textContent, /most connected|score:/i);
});

test("R2 a walk stopped at a bound says so, undetermined (control: a complete walk says nothing of it)", async () => {
  const p = await walked({ plane: { explore: ok(WALK({ truncated: true, undetermined: true, why: "the walk reached its limit of 5000 nodes", complete: false })) } });
  assert.match(main(p).textContent, /the walk reached its limit of 5000 nodes/);
  const q = await walked();
  assert.doesNotMatch(main(q).textContent, /reached its limit|the walk went \d+ steps/);
});

test("R2 explore's own refusal ({refused, why}) is drawn, never as no chains (control)", async () => {
  const p = await walked({ plane: { explore: ok({ refused: "UNKNOWN_KIND", why: "no such kind of connection" }) } });
  assert.match(main(p).textContent, /no such kind of connection/);
  assert.doesNotMatch(main(p).textContent, /No chain was found/);
});

test("R2 explorepreset by its name; promote opens a question naming the chain", async () => {
  const p = await walked({ plane: { allocid: ok({ ok: true, id: "INQ-2026-0042" }), promote: ok({ ok: true }) } });
  fill(p, { "explore-preset": "flowsFrom" });
  await press(p, "explorepreset");
  assert.equal(p.byOp("explorepreset").at(-1).body.preset, "flowsFrom");
  assert.equal(p.byOp("explorepreset").at(-1).body.from, ENT);
  const [a] = main(p).querySelectorAll("div.mk-msg[data-chain]");
  assert.deepEqual(actsIn(a).sort(), ["exploreverify", "promote"]);
  await press(p, "promote", { within: a });
  const pr = p.byOp("promote")[0].body;
  assert.equal(pr.bundleId, "INQ-2026-0042-chain");
  assert.match(pr.files[0].text, /What does this chain of connections show/);
  assert.match(pr.files[0].text, new RegExp(`${ENT} → line:holds:employee → ${ORG}`));
  assert.equal(p.location.pathname, "/app/question/INQ-2026-0042-chain");
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
  assert.match(main(p).querySelector('[data-verified="0"]').textContent, /This chain holds as the record has it now.*A step the record cites, not recomputed.*This step holds/s);
  const t = await walked({ plane: { exploreverify: ok({ ok: true, matches: false, lead: false, hops: [{ id: "co:5", matches: false }] }) } });
  await press(t, "exploreverify", { within: main(t).querySelectorAll("div.mk-msg[data-chain]")[0] });
  assert.match(main(t).querySelector('[data-verified="0"]').textContent, /does not match what the record holds now/);
  assert.match(main(t).querySelector('[data-verified="0"]').textContent, /does not match what the record has now/);
  const l = await walked({ plane: { exploreverify: ok({ ok: true, matches: false, lead: true, hops: [] }) } });
  await press(l, "exploreverify", { within: main(l).querySelectorAll("div.mk-msg[data-chain]")[1] });
  assert.match(main(l).querySelector('[data-verified="1"]').textContent, /It is a lead/);
  assert.ok(b);
});

const walkWith = (declared, sourced) => {
  const w = WALK();
  w.paths[1].hops[0] = sourced
    ? { id: "STEPSOURCE-1", from: ENT, to: "ENT-2026-0300", kind: "step_source", owner: "connections", valid: {}, evidence: [{ source: "BND-1", capture_sha: SHA, extent: { kind: "pdf-page", page: 3 }, basis: "The minutes name him as the company's agent.", relation: "REL-2026-0002" }],
      grade: { assertion: "B", ends: ["D", "D"] }, derived: null, backs: "REL-2026-0002", attached_by: "member:mai", at: "2026-10-12T09:00:00Z" }
    : w.paths[1].hops[0];
  if (sourced) { w.paths[1].label = "evidenced"; w.paths[1].grade = { assertion: "B", end: "B" }; w.paths[1].marks = []; }
  return w;
};

test("R17 Attach a source to a declared step sends stepsource with the hop's relation, the chosen passage and the member's words; the walk is read again and the hop is drawn evidenced; control: the withdrawal draws it a lead again", async () => {
  let attached = false;
  const p = await walked({ plane: { explore: () => ok(walkWith(true, attached)),
    stepsource: () => { attached = true; return ok({ ok: true, id: "STEPSOURCE-1", wrote: true }); },
    stepsourcewithdraw: () => { attached = false; return ok({ ok: true, id: "STEPSOURCE-1" }); } } });
  const lead = () => main(p).querySelectorAll("div.mk-msg[data-chain]")[1];
  assert.match(lead().textContent, /a lead, not a finding/);
  assert.equal(button(p, "connectionassert"), null, "connectionassert is not drawn for this act");
  fill(p, { "explore-assert-sha": SHA, "explore-assert-page": "4", "explore-assert-basis": "The minutes name him as the company's agent." });
  await press(p, "stepsource", { within: lead() });
  assert.deepEqual(p.byOp("stepsource")[0].body, { relation: "REL-2026-0002", captureSha: SHA, extent: { kind: "pdf-page", page: 3 }, basis: "The minutes name him as the company's agent." });
  const done = lead();
  assert.match(done.textContent, /each step cited/, "evidenced, no longer a lead");
  assert.doesNotMatch(done.textContent, /declared, not evidenced/);
  assert.equal(done.querySelector(".cs-grade").textContent, "ConnectionB", "at the capture's grade");
  assert.match(done.querySelector("[data-attached]").textContent, /stated in a source, attached by mai, 12 October 2026/);
  await press(p, "stepsourcewithdraw", { within: done, reason: "wrong page" });
  assert.deepEqual(p.byOp("stepsourcewithdraw")[0].body, { id: "STEPSOURCE-1", reason: "wrong page" });
  assert.match(lead().textContent, /a lead, not a finding/, "after the withdrawal it is drawn a lead");
});

test("R17 an attachment without its passage or without the member's words sends nothing (control); a refusal is drawn by its words", async () => {
  const p = await walked({ plane: { stepsource: refusedIn("EXTENT_MALFORMED", "That passage cannot be read.") } });
  const lead = () => main(p).querySelectorAll("div.mk-msg[data-chain]")[1];
  await press(p, "stepsource", { within: lead() });
  assert.equal(p.byOp("stepsource").length, 0);
  fill(p, { "explore-assert-sha": SHA, "explore-assert-basis": "The minutes name him." });
  await press(p, "stepsource", { within: lead() });
  assert.match(main(p).textContent, /That passage cannot be read\./);
});
