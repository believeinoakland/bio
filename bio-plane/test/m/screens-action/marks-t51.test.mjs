/* screens-action, fix round 10 (diagnosis 11 §2a; K5148; R3 with filings R43, R44): "Prepare what is sent" states the language the draft
   is prepared in, and on a public comment the voice (For the team / As myself), as the member takes them, so the assertion gate runs from
   the page. The scripted tests pin the body the page sends; the seam test drives the walker's letter over the REAL filings. */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, open, main, text, press, last, button, ok, W, DATA_PLANE, ACTION_ID, ACTION, FILING, draft, FILINGS, READ, choose } from "./page.mjs";
import { realWorld, realPlane, profilesOf, until, open as openReal, V } from "./real.mjs";

const STEP2 = `/app/start-send/${ACTION_ID}`;
const TEXT = "We ask the Clerk for the logs.";

test("R3 (filings R43): the body of 'Prepare what is sent' carries the language the member states, hers from her account", async () => {
  const p = await open(STEP2, DATA_PLANE);
  assert.ok(p.doc.getElementById("send-lang"), "the language is drawn as a choice");
  assert.equal(p.doc.getElementById("send-lang").value, "en");
  await press(p, "communicationprepare", { values: { "send-text-0": TEXT }, reason: "ready" });
  assert.equal(last(p, "communicationprepare").body.language, "en");
  assert.equal("voice" in last(p, "communicationprepare").body, false, "no voice on a kind that is not a public comment");
});

test("R3 (filings R43): she may change the language for one letter; a language of the team's is the only one offered, hers among them", async () => {
  const p = await open(STEP2, DATA_PLANE);
  const tags = p.doc.getElementById("send-lang").querySelectorAll("option").map((o) => o.value);
  assert.deepEqual(tags, ["en", "es"]);
  await press(p, "communicationprepare", { values: { "send-text-0": TEXT, "send-lang": "es" }, reason: "ready" });
  assert.equal(last(p, "communicationprepare").body.language, "es");
});

test("R3 (filings R43): a member whose account holds no language is given the team's first, never nothing; a team with none sends none", async () => {
  const p = await open(STEP2, { ...DATA_PLANE, memberlanguage: ok({ language: null }) });
  await press(p, "communicationprepare", { values: { "send-text-0": TEXT }, reason: "ready" });
  assert.equal(last(p, "communicationprepare").body.language, "en");
  const q = await open(STEP2, { ...DATA_PLANE, memberlanguage: ok({ language: null }), grouplanguages: ok({ languages: [] }) });
  assert.equal(q.doc.getElementById("send-lang"), null);
  await press(q, "communicationprepare", { values: { "send-text-0": TEXT }, reason: "ready" });
  assert.equal("language" in last(q, "communicationprepare").body, false);
});

test("R3 (filings R44): on a public comment the page draws For the team and As myself, the team's chosen, and sends the voice she chose", async () => {
  const comment = { ...DATA_PLANE, action: ok({ ...ACTION, kind: "public_comment" }) };
  const p = await open(STEP2, comment);
  const t = text(p);
  assert.ok(t.includes(W("voice.group")) && t.includes(W("voice.self")) && t.includes(W("voice.self.means")), "both voices, with what each means");
  await press(p, "communicationprepare", { values: { "send-text-0": TEXT }, reason: "ready" });
  assert.equal(last(p, "communicationprepare").body.voice, "group", "for the team unless she chose otherwise");
  const q = await open(STEP2, comment);
  await press(q, "communicationprepare", { values: { "send-text-0": TEXT, "send-voice-0": false, "send-voice-1": true }, reason: "ready" });
  assert.equal(last(q, "communicationprepare").body.voice, "self");
});

test("R3: a records request states its language too (request), and no voice", async () => {
  const p = await open(`/app/request/${ACTION_ID}`, DATA_PLANE);
  await press(p, "communicationprepare", { values: { "send-text-0": TEXT }, reason: "ready" });
  assert.equal(last(p, "communicationprepare").body.language, "en");
  assert.equal("voice" in last(p, "communicationprepare").body, false);
});

test("R3 (diagnosis 11 §2a, the walker's letter, over the real filings): a team letter saying the Clerk broke a rule is pointed out and its approval refused until the sentence is answered", async () => {
  const x = realWorld();
  const id = x.action({ kind: "records_request", risk_tier: 1, project: x.proj, legs: [], clock: [],
    counterparty: { state: "named", role: "Records Office", body: "Port Ellery", level: "city" }, laws: [{ level: "city", citation: "P.E.B.L. § 4" }] });
  const plane = realPlane(x, V("olive"), { memberlanguage: ok({ language: "en" }), grouplanguages: ok({ languages: ["en"] }), profiles: profilesOf("oakland-alameda"), peopledirectory: ok({ rows: [], truncated: false }),
    list: ok({ bundles: [{ bundle_id: x.proj, object_type: "project", title: "Parks" }], limit: 500, cursor: null, total: 1 }) });
  const p = await openReal(`/app/start-send/${id}`, plane);
  await press(p, "communicationprepare", { values: { "send-text-0": "The Clerk violated Clerk Procedure 4." }, reason: "ready" });
  await until(p, () => button(p, "filingapprove"), "the prepared text to be drawn for approval");
  assert.equal(last(p, "communicationprepare").body.language, "en");
  await press(p, "filingapprove", { reason: "ready", confirm: true });
  await until(p, () => text(p).includes(W("refusal.ASSERTION_UNRESOLVED")), "the approval to be refused for the sentence");
  assert.ok(button(p, "filingapprove"), "still to be approved: nothing was sent on");
  assert.ok(!button(p, "filingrecordsent"));
  assert.ok(main(p).querySelector('[id^="assert-pick-"]'), "the pointed-out sentence is drawn for her to answer");
});
