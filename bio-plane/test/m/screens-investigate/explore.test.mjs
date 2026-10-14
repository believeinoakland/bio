/* screens-investigate R2: exploring connections, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, WALK, ENT, ORG, SHA } from "./fixtures.mjs";

const at = "/app/explore/" + ENT;
const walked = async (o = {}) => {
  const p = await open(at, o);
  fill(p, { "explore-at": "2025-06-30" });
  await press(p, "explore");
  return p;
};

test("R2 the member ticks the kinds to follow (by their words), an end, and the day it is explored as of; explore is sent with them", async () => {
  const p = await open(at);
  const boxes = p.doc.getElementById("explore-kinds").querySelectorAll("input");
  assert.deepEqual(boxes.map((b) => b.parentElement.textContent.trim()), ["held the post (employee)", "money", "mentioned together", "proxy for"]);
  boxes[2].checked = false;
  fill(p, { "explore-to": ORG, "explore-at": "2025-06-30" });
  await press(p, "explore");
  assert.deepEqual(p.byOp("explore")[0].body, { from: ENT, to: ORG, at: { value: "2025-06-30", precision: "day", zone: "UTC" }, kinds: ["line:holds:employee", "money_flow", "proxy_for"] });
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
  const chains = main(p).querySelectorAll("div.cs-chain");
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
  assert.doesNotMatch(main(q).textContent, /Stopped at the limit|reached its limit/);
});

test("R2 explore's own refusal ({refused, why}) is drawn, never as no chains (control)", async () => {
  const p = await walked({ plane: { explore: ok({ refused: "UNKNOWN_KIND", why: "no such kind of connection" }) } });
  assert.match(main(p).textContent, /no such kind of connection/);
  assert.doesNotMatch(main(p).textContent, /No chain was found/);
});

test("R2 explorepreset by its name; exploreverify \"Check this chain\" re-derives each derived step; connectionassert on a declared step; promote opens a question naming the chain", async () => {
  const p = await walked({ plane: { exploreverify: ok({ ok: true, matches: true }), connectionassert: ok({ ok: true, wrote: true }),
    allocid: ok({ ok: true, id: "INQ-2026-0042" }), promote: ok({ ok: true }) } });
  fill(p, { "explore-preset": "flowsFrom" });
  await press(p, "explorepreset");
  assert.equal(p.byOp("explorepreset").at(-1).body.preset, "flowsFrom");
  assert.equal(p.byOp("explorepreset").at(-1).body.from, ENT);
  const [a, b] = main(p).querySelectorAll("div.cs-chain");
  assert.deepEqual(actsIn(a).sort(), ["exploreverify", "promote"]);
  assert.equal(button(p, "exploreverify", b), null, "a chain with no derived step is not checked");
  await press(p, "exploreverify", { within: a });
  assert.deepEqual(p.byOp("exploreverify").map((r) => [r.body.id, r.body.kind, r.body.as_of]), [["co:5", "mentioned_together", "2026-10-14"]]);
  assert.match(main(p).textContent, /This step holds as the record has it now/);
  fill(p, { "explore-assert-a": "INFO-2026-0004", "explore-assert-b": "INFO-2026-0005", "explore-assert-basis": "The minutes name him as the company's agent." });
  await press(p, "connectionassert", { within: main(p).querySelectorAll("div.cs-chain")[1] });
  const ca = p.byOp("connectionassert")[0].body;
  assert.deepEqual([ca.a, ca.b], ["INFO-2026-0004", "INFO-2026-0005"]);
  assert.match(ca.basis, /^The minutes name him as the company's agent\./);
  await press(p, "promote", { within: main(p).querySelectorAll("div.cs-chain")[0] });
  const pr = p.byOp("promote")[0].body;
  assert.equal(pr.bundleId, "INQ-2026-0042-chain");
  assert.match(pr.files[0].text, /What does this chain of connections show/);
  assert.match(pr.files[0].text, new RegExp(`${ENT} → line:holds:employee → ${ORG}`));
  assert.equal(p.location.pathname, "/app/question/INQ-2026-0042-chain");
});

test("R2 connectionassert names both documents and the member's words (control: none sends nothing)", async () => {
  const p = await walked();
  await press(p, "connectionassert", { within: main(p).querySelectorAll("div.cs-chain")[1] });
  assert.equal(p.byOp("connectionassert").length, 0);
});
