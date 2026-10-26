/* screens-action R6 (and R7 on `matter`): one government act's determination, consequences and escalation. Every sentence is
   asserted by its key through `setup-words` (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { open, main, text, ops, press, last, ok, button, W, D, DATA_PLANE, DET, ESC, ESCALATION, STATUS_NONE, CONSEQUENCES, COMPLIANCE_SAYS } from "./page.mjs";

/* N1073 (K3268): the acts the screen draws are read against the declarations that own them, never a list of them written here:
   the design's registry for this screen and `op-declarations`' `OPS`; a state's acts are then checked one by one. (Reading
   `escalation`'s own ops map takes a `uses` edge to it, which `build/modules.json` does not hold: reported to BOB.) */
const REG = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/development/ux-substrate/screens/registry.json"), "utf8"))
  .screens.find((s) => s.id === "matter").acts.map((a) => a.op);
const drawn = (p) => ops(p);
const draws = (p, op) => { assert.ok(REG.includes(op) && OPS[op], `${op} is an act the registry declares for this screen and OPS holds`); return drawn(p).includes(op); };
const AT = `/app/matter/${DET}~${ESC}`;
const BARE = `/app/matter/${DET}`;

test("R6: the determination: each standard, what it requires and what the act did, its outcome, compliant recorded with the same care as noncompliant", async () => {
  const p = await open(AT, DATA_PLANE);
  assert.equal(p.byOp("determination")[0].query.id, DET);
  const t = text(p);
  for (const s of [`vote · ${D("2024-03-01")}`, W("screen.matter.by", { actor: "City Administrator, City" }), W("screen.matter.outcome.noncompliant"), W("screen.matter.outcome.compliant"),
    `${W("screen.matter.requires", { requires: "a council vote" })} · ${W("screen.matter.did", { did: "adjusted without a vote" })}`,
    `${W("screen.matter.requires", { requires: "notice within 30 days" })} · ${W("screen.matter.did", { did: "noticed on day 21" })}`, W("screen.matter.samecare")]) assert.ok(t.includes(s), s);
});

test("R6: the consequences: who or what, the measure and how it is known; an undetermined measure never read as zero, people counted as a class", async () => {
  const p = await open(AT, DATA_PLANE);
  assert.equal(p.byOp("consequencesof")[0].query.determination, DET);
  const t = text(p);
  assert.match(t, /Tenants of the district · class/);
  assert.match(t, /38000 USD/);
  assert.ok(t.includes(`The repair program · program${W("screen.matter.undetermined")}`) || t.includes(`The repair program · program${W("screen.matter.known.undetermined")}`));
  assert.doesNotMatch(t, /The repair program[^U]*\b0\b/);
  assert.ok(t.includes(W("screen.matter.neverzero")));
  const q = await open(AT, { ...DATA_PLANE, consequencesof: ok({ ...CONSEQUENCES, parts: [] }) });
  // R14: no consequence at all: the section is not drawn, nor its note about zero
  assert.ok(!text(q).includes(W("screen.matter.consequences")) && !text(q).includes(W("screen.matter.neverzero")));
});

test("R6: the escalation: the seven stages, the proposed next stage and its trigger, what ends it, the actions attached; its acts by its state", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationadvance: ok({}), escalationstoppursuing: ok({}) });
  assert.equal(p.byOp("escalation")[0].query.id, ESC);
  const t = text(p);
  for (const s of [1, 2, 3, 4, 5, 6, 7].map((n) => W(`screen.matter.stage.${n}`)).concat([
    `${W("screen.matter.proposed", { stage: W("screen.matter.stage.3") })} · its trigger was met 5 days ago`, W("screen.matter.endswhen"),
    `${W("screen.matter.exit.compliance")} · ${COMPLIANCE_SAYS}`, `${W("screen.matter.exit.consequences")} · not every part addressed`,
    W("screen.matter.atstage", { stage: W("screen.matter.stage.2") })])) assert.ok(t.includes(s), s);
  assert.equal(main(p).querySelector('[aria-current="step"]').textContent, W("screen.matter.stage.2"));
  assert.ok(main(p).querySelector('a[href^="/app/action/ACTN-"]'));
  assert.ok(draws(p, "escalationadvance"));
  assert.ok(draws(p, "escalationend"));
  assert.ok(draws(p, "escalationstoppursuing"));
  assert.equal(drawn(p).length, 3, "an open escalation: these acts and no other");
  assert.ok(!draws(p, "escalationreopen") && !draws(p, "escalationopen"), "control: no reopening, no second opening");
  assert.ok(button(p, "escalationadvance").textContent.includes(W("screen.matter.advance", { stage: W("screen.matter.stage.3") })));
  await press(p, "escalationadvance", { reason: "no reply" });
  assert.deepEqual(last(p, "escalationadvance").body, { id: ESC, to: 3, reason: "no reply" });
  await press(p, "escalationstoppursuing", { reason: "the group moved on" });
  assert.deepEqual(last(p, "escalationstoppursuing").body, { id: ESC, reason: "the group moved on" });
});

test("R6: 'End' is terminal: its dialog states what ending does, and nothing is sent before the confirm", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationend: ok({}) });
  const b = button(p, "escalationend");
  await p.click(b);
  assert.equal(p.byOp("escalationend").length, 0);
  assert.ok(text(p, p.root().querySelector('[role="dialog"]')).includes(W("act.escalationend.does")), "the dialog states what ending does");
  await press(p, b, { confirm: true });
  assert.deepEqual(last(p, "escalationend").body, { id: ESC });
});

test("R6: a stopped escalation offers 'Reopen where it stopped' with a reason, and nothing else", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, state: "stopped_pursuing" }), escalationreopen: ok({}) });
  assert.ok(draws(p, "escalationreopen"));
  assert.equal(drawn(p).length, 1, "a stopped escalation: reopening and nothing else");
  await press(p, "escalationreopen", { reason: "a new reply" });
  assert.deepEqual(last(p, "escalationreopen").body, { id: ESC, reason: "a new reply" });
});

test("R6: with no escalation, 'Open an escalation' and 'Decline to escalate, with a reason'; opening one opens the matter at it", async () => {
  const p = await open(BARE, { ...DATA_PLANE, escalationstatus: ok(STATUS_NONE), escalationopen: ok({ id: ESC, stage: 1 }), declinetoescalate: ok({}) });
  assert.equal(p.byOp("escalation").length, 0);
  assert.ok(draws(p, "escalationopen"));
  assert.ok(draws(p, "declinetoescalate"));
  assert.equal(drawn(p).length, 2, "no escalation: opening or declining, and nothing else");
  await press(p, "declinetoescalate", { reason: "not worth it yet" });
  assert.deepEqual(last(p, "declinetoescalate").body, { determination: DET, reason: "not worth it yet" });
  await press(p, "escalationopen", { reason: "they ignored the notice" });
  assert.deepEqual(last(p, "escalationopen").body, { determination: DET, reason: "they ignored the notice" });
  assert.equal(p.location.pathname, `/app/matter/${encodeURIComponent(DET + "~" + ESC)}`);
});

test("R6: an escalation already open is linked from the bare matter, which offers no second opening", async () => {
  const p = await open(BARE, DATA_PLANE);
  assert.deepEqual(ops(p), []);
  assert.ok(main(p).querySelector(`a[href="/app/matter/${encodeURIComponent(DET + "~" + ESC)}"]`));
});

test("R6: the legal tools a stage makes available are listed as facts from the profile, never as advice", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, stage: 5, available: [{ label: "Complaint to the civil grand jury" }] }) });
  assert.ok(text(p).includes(W("screen.matter.available")));
  assert.ok(text(p).includes("Complaint to the civil grand jury"));
});
