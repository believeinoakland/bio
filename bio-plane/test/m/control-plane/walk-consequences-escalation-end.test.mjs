/* control-plane R17, R29 (fix round 10, final pass; K5138; item 78 (6); WALK-FINAL-11 L109, L181, diag2-11.md section 3; consequences R5, R9, R27, escalation R14): the walker's case through the real door.
   A member whose case edition is published (her question concluded IN HER PROJECT, which leaves the question's own state `open`: basis-versions R18) records a rule she holds the government to
   (`standarddeclare`), the act (`eventcreate`), a noncompliant determination of it (`determine`), opens an escalation (`escalationopen`), records what the breach did with her concluded question as
   its causation (`consequencerecord`) and that the part was addressed with evidence (`addressedrecord`), and a later compliant determination of the same act supersedes the first. Then `escalationend`
   ENDS the escalation: before consequences R27, a project-concluded question read `unproven` and the end was refused CONSEQUENCES_UNDETERMINED. Control: the same end before the part is addressed is
   refused (CONSEQUENCES_UNDETERMINED or CONSEQUENCES_NOT_ADDRESSED), and writes nothing. Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wescend" });
after(() => kit.mf.dispose());
const R = kit.R;

/* a text uploaded and filed in the project, one sentence of it found as "Find in this document" finds it */
async function documentFound(e, tag, sentence, term) {
  const bytes = kit.te(`${sentence}\n\nThe clerk filed the register ${tag} on Tuesday, and it was signed by the chair.`);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag + "-doc")}&type=text%2Fplain`, { method: "POST", headers: e.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(e.cs, { doc: up.document, title: `${tag}-doc`, locator: up.document.locator, project: e.project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const capture = kit.sha(bytes);
  const found = R(await e.cs.call("findin", { body: { scope: { capture }, kinds: ["term"], term } }));
  const item = found.kinds[0].items[0];
  assert.equal(item.words, sentence, JSON.stringify(item).slice(0, 300));
  const minted = R(await e.cs.call("contentmint", { body: { bundleId: filed.bundleId, extent: { kind: "document" } } }));
  assert.ok(minted.content_id || minted.id, "the document is citable: " + JSON.stringify(minted).slice(0, 300));
  return { capture, item, content: String(minted.content_id || minted.id) };
}
const okOf = (what, res) => { assert.equal(R(res.body).ok, true, `${what}: ${kit.gateLine(res)}`); return R(res.body); };

test("R17, R29 (consequences R27, escalation R14): an escalation whose consequences are addressed, the causation a question concluded in the project, and whose act a later determination finds compliant, ENDS through the door; control: before the part is addressed it cannot end", { timeout: 900000 }, async () => {
  const e = await kit.preparedEdition("wescend-owner", "wescend", { vouch: true });
  const signed = await kit.sitAndSign(e);
  assert.equal(signed.res.body.ok, true, kit.gateLine(signed.res));
  const rule = await documentFound(e, "wescendrule", "Thirty days of public notice are required before any closure of a park.", "public notice");
  const act = await documentFound(e, "wescendact", "The playground was closed on Monday with no notice at all.", "closed on Monday");
  /* the rule she holds the government to */
  const std = okOf("the rule is declared", await kit.post(e.auth, "standarddeclare", { cite: "Oakland Municipal Code 12.34.056", kind: "ordinance", issuer: "City of Oakland",
    reason: "The group holds the city to its own notice rule.", text: [{ capture_sha: rule.capture, extent: rule.item.extent }], period: { from: "2020-01-01", to: "2030-12-31" } }));
  const standard = std.id || std.standard || (std.standard_id);
  assert.ok(standard, "a standard id: " + JSON.stringify(std).slice(0, 300));
  /* the act: the day the passage dates (a dated fact the member records), and the event it attests */
  const day = okOf("the date is recorded", await kit.post(e.auth, "datedfact", { captureSha: act.capture, extent: act.item.extent, kind: "issued", value: "2026-03-02", method: "a member's reading of the document" }));
  const dated = (day.dated_fact && day.dated_fact.dated_fact_id) || day.dated_fact_id;
  assert.ok(dated, "a dated fact: " + JSON.stringify(day).slice(0, 300));
  const ev = okOf("the event is held", await kit.post(e.auth, "eventcreate", { kind: "order", attestations: [{ datedFactId: dated }] }));
  const event = ev.event_id || ev.id;
  assert.ok(event, "an event id: " + JSON.stringify(ev).slice(0, 300));
  const determination = (outcome, reading, extra = {}) => ({ project: e.project, act: { event, actor: { role: "Director of Parks", body: "City of Oakland" }, evidence: [act.content] },
    findings: [{ finding: e.question }], standards: [{ standard, outcome }],
    rows: [{ standard, requires: "thirty days of public notice", did: "closed with no notice", reading }], ...extra });
  const det = okOf("the noncompliant determination", await kit.post(e.auth, "determine", determination("noncompliant", "diverges")));
  const esc = okOf("the escalation is opened", await kit.post(e.auth, "escalationopen", { determination: det.id, reason: "The closure broke a rule the group holds the city to." }));
  /* what the breach did, its causation the question concluded in her project */
  const part = okOf("the part is recorded", await kit.post(e.auth, "consequencerecord", { determination: det.id, standard,
    affected: { kind: "class", description: "Families who use the playground" }, period: { from: "2026-03-02", to: "2026-04-02" },
    measure: { unit: "count", value: "120" }, basis: { rationale: "the sign-in sheets of the playground", rests_on: [] }, causation: e.question }));
  const partId = part.id || (part.part && part.part.id);
  assert.ok(partId, "a part id: " + JSON.stringify(part).slice(0, 300));
  assert.equal(R(await kit.get(e.auth, { op: "consequencesof", determination: det.id })).unproven.length, 0, "a question concluded in her project is not unproven (consequences R27)");
  /* a later determination of the same act finds it compliant, superseding the first */
  /* escalation R14 asks for a compliant determination recorded after the escalation: the store stamps whole seconds, so the later one is made in a later second */
  await new Promise((r) => setTimeout(r, 1100));
  okOf("the later compliant determination", await kit.post(e.auth, "determine", determination("compliant", "aligns", { supersedes: det.id, reason: "The playground was reopened after notice was posted." })));
  /* control: not yet addressed, the escalation does not end, and nothing is written */
  const early = await kit.post(e.auth, "escalationend", { id: esc.id });
  assert.equal(R(early.body).ok, false, "not ended before the part is addressed: " + kit.gateLine(early));
  assert.match(String(R(early.body).reason), /^CONSEQUENCES_(UNDETERMINED|NOT_ADDRESSED)$/, kit.gateLine(early));
  assert.equal(R(await kit.get(e.auth, { op: "escalation", id: esc.id })).state, "open", "still open");
  /* the part is addressed, with the document that shows it */
  okOf("the part is addressed", await kit.post(e.auth, "addressedrecord", { id: partId, state: "addressed", evidence: [act.content], reason: "The city reopened the playground and apologised to the families." }));
  const ended = await kit.post(e.auth, "escalationend", { id: esc.id });
  assert.equal(R(ended.body).ok, true, "the escalation ends: " + kit.gateLine(ended));
  assert.equal(R(ended.body).state, "ended", kit.gateLine(ended));
  const read = R(await kit.get(e.auth, { op: "escalation", id: esc.id }));
  assert.equal(read.state, "ended", "the end state is read back: " + JSON.stringify(read).slice(0, 400));
});
