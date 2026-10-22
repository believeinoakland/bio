/* screens-action, fix round 4 (R-SEAM; K4429): the walker's federal records request, from "Name the office yourself" to "Recorded as sent",
   by the member's own presses over the REAL merged providers (`entities`, `actions`, `filings` with `filing-templates`, over the first
   profile `jurisdictions` holds), never a scripted double of one. */
import test from "node:test";
import assert from "node:assert/strict";
import { main, text, ops, press, last, ok, W, D, button } from "./page.mjs";
import { realWorld, realPlane, realProfiles, profilesOf, open, V } from "./real.mjs";

const OGIS = "Office of Government Information Services";
const FED = "5 U.S.C. § 552";
const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);

const lawsPick = (q) => q.doc.getElementById("req-law").querySelectorAll("option").map((o) => o.textContent.trim());
/* The walker's path, by the member's own presses. `profiles` is the op that answers the place's facts: the real `instance-setup` or, while
   its `profiles()` omits the laws (instance-setup R12, INSTANCE-SETUP #27), `jurisdictions.combine`'s view in its place. */
async function walk(profiles) {
  const x = realWorld();
  const plane = realPlane(x, V("olive"), { peopledirectory: ok({ rows: [], truncated: false }), profiles,
    list: ok({ bundles: [{ bundle_id: x.proj, object_type: "project", title: "Parks" }], limit: 500, cursor: null, total: 1 }) });
  const p = await open(`/app/request/${x.proj}`, plane);
  said(p, "screen.request.nooffice");
  // she names the office herself: the agency alone, where requests go, the federal law (a name with no comma, drawn once)
  const lawsIn = (q) => q.doc.getElementById("req-noff-law").querySelectorAll("option").map((o) => o.textContent.trim());
  const at = lawsIn(p).findIndex((t) => t.includes(FED));
  assert.ok(at >= 0, "the federal law is among the profile's records laws");
  await press(p, "entitycreate", { values: { "req-noff-name": OGIS, "req-noff-where": "https://www.archives.gov/ogis", "req-noff-law": String(at),
    "req-noff-note": "It answers federal records requests for the archives." } });
  assert.equal(last(p, "entitycreate").body.label, OGIS);
  assert.equal(last(p, "entitycreate").body.law, FED);
  assert.deepEqual(p.doc.getElementById("req-office").querySelectorAll("option").map((o) => o.textContent.trim()), [OGIS], "chosen at once and drawn once");
  assert.ok(main(p).querySelector('[data-named="1"]'), "marked as named by a member");
  // naming the same office again returns the first entry (the real `entities` answers `existed`), not another
  const again = await open(`/app/request/${x.proj}`, plane);
  await press(again, "entitycreate", { values: { "req-noff-name": ` ${OGIS.toLowerCase()} `, "req-noff-note": "x again" } });
  assert.equal(x.rows("SELECT COUNT(*) AS n FROM entities WHERE label = ?", OGIS)[0].n, 1, "one entry for the office");
  await press(p, "actioncreate", { values: { "req-what": "Records of how the Archives handled federal records requests in 2024", "req-office": "0" }, reason: "start" });
  const ACTN = p.location.pathname.split("/").pop();
  assert.match(ACTN, /^ACTN-/);
  // the law: the profile's records laws, the Freedom of Information Act with its own level
  const lawAt = lawsPick(p).findIndex((t) => t.includes(FED));
  await press(p, "actionlaws", { values: { "req-law": String(lawAt) }, reason: "federal" });
  assert.deepEqual(last(p, "actionlaws").body, { target: ACTN, laws: [{ level: "federal", citation: FED }] });
  assert.deepEqual(x.actions.actionRead({ id: ACTN, viewer: V("olive") }).governing_laws.laws, [{ level: "federal", citation: FED }], "stored");
  // the text: a plain request prepares although the period, form and cost boxes are filled (the text names no blank for them)
  const boxes = { "req-from": "2024-01-01", "req-to": "2024-12-31", "req-form": "pdf", "req-cost": "$25" };
  await press(p, "communicationprepare", { values: { ...boxes, "send-text-0": "Please send me the records of how the Archives handled federal records requests in 2024." }, reason: "ready" });
  assert.ok(!("fills" in last(p, "communicationprepare").body), "no fills for blanks the text does not have");
  assert.equal(x.rows("SELECT COUNT(*) AS n FROM communication_drafts WHERE action_id = ?", ACTN)[0].n, 1, "prepared and stored by the real filings");
  assert.ok(text(p).includes(W("screen.start-send.text.help")) && !text(p).includes(W("screen.request.text.help")), "no template is claimed");
  await press(p, "filingapprove", { reason: "ready", confirm: true });
  // the send step: nothing of "the city" for a federal request
  assert.ok(button(p, "filingrecordsent"), "approved: the sending is recorded here");
  assert.ok(!text(p).includes(W("screen.request.howsend.3")), "not 'the city can't send you updates'");
  await press(p, "filingrecordsent", { values: { "send-at": "2026-09-27", "send-account": "through the Archives' online form", "send-reference": "NARA-2026-0042" }, reason: "sent" });
  said(p, "screen.start-send.sent", { date: D("2026-09-27") });
  // the help for this request: the law's own first-request window, no state or city text
  const help = await open(`/app/help-records/${ACTN}`, plane);
  assert.ok(text(help).includes("5 U.S.C. § 552(a)(6)(A)(i)"), "the first-request clause");
  assert.ok(text(help).includes(W("screen.request.window.business", { n: "20" })), "20 business days");
  assert.ok(!/Gov\. Code|Mun\. Code|\bcity\b/i.test(text(help).replace(W("screen.help-records.purpose"), "")), "no California or city text");
  // the answer came: the action offers the way to keep the filing as the team's template (C65), and the real filings keeps it
  const act = await open(`/app/action/${ACTN}`, plane);
  const door = main(act).querySelector(`a[href="/app/start-send/${ACTN}"]`);
  assert.ok(door && door.textContent.includes(W("screen.start-send.template.heading")), "C65: the reference");
  const send = await open(`/app/start-send/${ACTN}`, plane);
  await press(send, "templatesave", { values: { "template-name": "A federal records request", "template-use": "file" }, reason: "keep" });
  const saved = last(send, "templatesave").body;
  assert.deepEqual({ ...saved, reason: undefined }, { filing: saved.filing, name: "A federal records request", use: "file", project: x.proj, reason: undefined });
  const kept = x.rows("SELECT kind, use, name, project FROM tpl_templates");
  assert.deepEqual(kept, [{ kind: "records_request", use: "file", name: "A federal records request", project: x.proj }], "the real filings keeps the template");
}

test("R20, R4, R9, R3, R8, R43, R48 (C64, C65): the walker's federal request, from naming the office to keeping the filing as a template, over the real providers (the profile's facts from jurisdictions.combine)", async () => {
  await walk(profilesOf("oakland-alameda"));
});

test("R20, R4, R9 (C64; instance-setup R12, INSTANCE-SETUP #27): the same request with the REAL instance-setup profiles(): its view carries the records laws the screens list (red by name until instance-setup carries them)", async () => {
  const profiles = await realProfiles("oakland-alameda");
  const view = profiles().json.result.view;
  assert.ok(Array.isArray(view.records_laws) && view.records_laws.some((l) => l.citation === FED && l.response === "foia_response"), "profiles().view.records_laws holds the federal law with its window");
  assert.ok(view.records_help === undefined || typeof view.records_help === "object");
  await walk(profiles);
});
