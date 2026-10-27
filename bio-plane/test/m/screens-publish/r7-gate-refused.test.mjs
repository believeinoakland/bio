/* screens-publish, fix round 7, G60 (K4736): the ceremony's signing-time refusal GATE_REFUSED carries the gate's findings and the
 * screen draws them. The refusal is sent as the op sends it (`ratification/ops.mjs`: 409, `findings`), each finding in the shape the
 * case gate answers (`gate.mjs` `runCaseGate`: `{check, detail, repairs?}`, the catalogue's `message` as `detail`). Importing the gate
 * is not an edge of this module's `uses`: the same refusal made by the real gate over a held finding, through the real door, is the
 * control-plane seam file's. A sentence is asserted by its key (R24). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, press, word, tick, keptKey, answerSign, ok, refused, PREFLIGHT, P, DR } from "./fixtures.mjs";

const PATH = `/app/ceremony/${P}/${DR}`;
const R = "because";
/** The gate's own answer over a held finding: `C-12.2`, a snapshot the manifest records but the store does not hold. */
const REPAIR = "resnapshot-fixture"; // the gate's own repair text is data the plane sends
const HELD = { check: "C-12.2", severity: "error", message: "snapshot 'upload-x' is missing from the manifest", repairs: REPAIR };
/** The gate's answer over held findings, as `runCaseGate` maps them (`gate.mjs`:1324) */
const gateOf = (...held) => ({ ok: held.length === 0, gateVersion: "plane-gate/1.0", findings: held.map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) })) });
const prepared = async (o = {}) => {
  const p = await open(PATH, o);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  return p;
};
const sign = async (p, op) => { const { slot } = await press(p, op, { reason: R }); await answerSign(p, true, op); await p.settle(); return slot(); };
const refusal = (g) => refused("GATE_REFUSED", null, 409, { gateVersion: g.gateVersion, findings: g.findings });

test("R13 G60 a signing refused by the case gate (caseratify) draws the refusal and each finding the gate found: its text, its check and its repair", async () => {
  const g = gateOf(HELD);
  assert.equal(g.ok, false, "the gate refuses the held finding");
  const p = await prepared({ boot: { idb: await keptKey() }, plane: { caseratify: refusal(g) } });
  const slot = await sign(p, "caseratify");
  assert.ok(slot.textContent.includes(word("refusal.GATE_REFUSED")), "the refusal's own sentence");
  const items = slot.querySelectorAll("[data-gate-finding]");
  assert.equal(items.length, 1, "one line for the one finding");
  assert.equal(items[0].getAttribute("data-gate-finding"), "C-12.2");
  assert.ok(items[0].textContent.includes(HELD.message), "the finding's text is drawn");
  assert.ok(items[0].textContent.includes(REPAIR), "what repairs it is drawn");
  assert.ok(slot.textContent.includes(word("ceremony.gate.heading")), "under the heading the ceremony lists its stops by");
  assert.equal(main(p).querySelector("[data-signed]"), null, "nothing is drawn signed on a refusal");
});

test("R13 G60 publish at a set time (publishat) is refused by the same gate and draws its findings alike", async () => {
  const g = gateOf(HELD, { ...HELD, check: "C-12.3", message: "a second finding", repairs: null });
  const p = await prepared({ boot: { idb: await keptKey() }, plane: { publishat: refusal(g) } });
  const when = p.doc.getElementById("ce-when");
  when.value = "at";
  p.fire(when, "change");
  await p.settle();
  const { slot } = await press(p, "publishat", { values: { "ce-date": "2099-11-19", "ce-time": "06:00" }, reason: R });
  await answerSign(p, true, "publishat");
  await p.settle();
  const items = slot().querySelectorAll("[data-gate-finding]");
  assert.deepEqual(items.map((i) => i.getAttribute("data-gate-finding")), ["C-12.2", "C-12.3"]);
  assert.ok(items[1].textContent.includes("a second finding") && !items[1].querySelector("[data-repair]"), "a finding with no repair draws none");
});

test("R13 G60 the pre-flight's own GATE_REFUSED blocker lists its findings too, and a refusal that carries none draws only its sentence (controls)", async () => {
  const g = gateOf(HELD);
  const block = { ok: false, code: "GATE_REFUSED", reason: "GATE_REFUSED", gateVersion: g.gateVersion, findings: g.findings };
  const p = await open(PATH, { plane: { publishpreflight: ok(PREFLIGHT({ first: block, blockers: [] })) } });
  const li = main(p).querySelector("[data-blockers]").querySelectorAll("[data-gate-finding]");
  assert.equal(li.length, 1);
  assert.ok(li[0].textContent.includes(HELD.message));
  const q = await prepared({ boot: { idb: await keptKey() }, plane: { caseratify: refused("GATE_REFUSED", null, 409, { findings: [] }) } });
  const slot = await sign(q, "caseratify");
  assert.ok(slot.textContent.includes(word("refusal.GATE_REFUSED")));
  assert.equal(slot.querySelectorAll("[data-gate-finding]").length, 0, "no finding, none drawn");
});

test("R13 G60 a finding's text is data: markup in it is drawn as text, and a finding with neither text nor check is not drawn (controls)", async () => {
  const g = gateOf({ ...HELD, message: "<b>bold</b> & more" }, { check: "", message: "" });
  const p = await prepared({ boot: { idb: await keptKey() }, plane: { caseratify: refusal(g) } });
  const slot = await sign(p, "caseratify");
  const items = slot.querySelectorAll("[data-gate-finding]");
  assert.equal(items.length, 1);
  assert.ok(items[0].textContent.includes("<b>bold</b> & more"));
  assert.equal(items[0].querySelector("b"), null);
});
