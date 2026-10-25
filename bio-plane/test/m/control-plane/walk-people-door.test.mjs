/* control-plane R17, R29 (fix round 10, B11; K5138; WALK-FINAL-05 R149, WALK-FINAL-04B R40; diag2-020305.md §6 and diag2-04.md §2): the walker's cases through the real door. Module cause: people
   (build/jobs/T51/people.md, PEOPLE #15 and J15 COMPLETE, people R12 and R21).
   (a) An administrator `personexpunge`s a person fact on the ground `court_order` naming the order; then `person` as two different members (Ana, Ben) answers `removed: [{ground, at, by}]`, with no
       value and no order text. Control: a call with no session (nobody who may read) is answered no `removed`, and a person the record does not hold has none.
   (b) `GET op=sourcepersonlinks&source_id=<id>` answers the link to a member the link lists and none to one it does not list (the read takes `source_id`; `source` is a stamp the door deletes).
   Run against the Miniflare plane (the seam kit); the person, the fact and the source are made by the members' own acts. */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r12people" });
after(() => kit.mf.dispose());
const R = kit.R;

const STATEMENT = "The deputy clerk, Maren Kowalczyk-Bell, signed the register on Tuesday.";
const ORDER = "Order 2026-77 of the county court";

/* a document uploaded by a member, one sentence of it found, as the Document screen's "Find in this document" gives the extent a fact cites */
async function foundSentence(auth, tag, text, term) {
  const bytes = kit.te(text);
  const up = (await (await kit.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag + "-minutes")}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const cs = kit.screenCall(auth);
  const project = await kit.projectOf(auth, `People walk ${tag} project`);
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: `${tag}-minutes`, locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const found = R(await cs.call("findin", { body: { scope: { capture: kit.sha(bytes) }, kinds: ["term"], term } }));
  const item = found.kinds[0].items[0];
  assert.ok(item && item.extent, "the sentence is found: " + JSON.stringify(found).slice(0, 300));
  return item;
}

test("R17, R29 (people R12): after an administrator's `personexpunge` of a person fact (court_order naming the order), `person` as Ana and as Ben each answers removed [{ground, at, by}]: the marker, never the value or the order (control: no session is answered no removed)", { timeout: 600000 }, async () => {
  const ana = await kit.ownerOf("r12people-ana");
  const ben = await kit.person("r12people-ben");
  const adm = await kit.founder();
  const made = R((await kit.post(ana.auth, "entitycreate", { kind: "person", label: "Maren Kowalczyk-Bell", note: "The deputy clerk named in the minutes." })).body);
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  const person = made.entity_id ?? made.id ?? made.entity?.entity_id;
  assert.ok(person, "a person: " + JSON.stringify(made).slice(0, 300));
  const item = await foundSentence(ana.auth, "r12people", `${STATEMENT}\n\nThe chair adjourned the meeting at nine.`, "signed the register");
  const fact = R((await kit.post(ana.auth, "recordpersonfact", { person, kind: "name", value: "Maren Kowalczyk-Bell", valid: { from: null, to: null, precision: "day" },
    citation: { capture_sha: item.capture_sha, extent: item.extent } })).body);
  assert.equal(fact.ok, true, "the fact is recorded: " + JSON.stringify(fact).slice(0, 400));
  const read = async (auth) => R(await kit.get(auth, { op: "person", id: person, at: "2026-10-20" }));
  assert.deepEqual((await read(ana.auth)).removed, [], "nothing is removed yet");
  const gone = R((await kit.post(adm, "personexpunge", { id: fact.fact_id, ground: "court_order", order: ORDER, reason: "The court ordered the name removed." })).body);
  assert.equal(gone.ok, true, "the administrator removes it: " + JSON.stringify(gone).slice(0, 400));
  for (const [who, auth] of [["Ana", ana.auth], ["Ben", ben]]) {
    const page = await read(auth);
    assert.equal(page.ok, true, who + ": " + JSON.stringify(page).slice(0, 300));
    assert.equal(page.removed.length, 1, who + " is shown the marker: " + JSON.stringify(page.removed));
    assert.equal(page.removed[0].ground, "court_order", who);
    assert.ok(page.removed[0].at && page.removed[0].by, who + ": the instant and the administrator: " + JSON.stringify(page.removed[0]));
    assert.deepEqual(Object.keys(page.removed[0]).sort(), ["at", "by", "ground"], who);
    assert.ok(!JSON.stringify(page).includes("Kowalczyk-Bell,") && !JSON.stringify(page.facts).includes("Maren Kowalczyk-Bell"), who + ": the value is gone");
    assert.ok(!JSON.stringify(page.removed).includes(ORDER), who + ": nor the order");
  }
  /* controls: a call with no session reads nothing, and a person the record does not hold has no marker */
  const anon = await (await kit.plane(`/api/?${new URLSearchParams({ op: "person", id: person, at: "2026-10-20" })}`)).json();
  assert.equal(R(anon).removed, undefined, "no session, no marker: " + JSON.stringify(anon).slice(0, 300));
  const none = R(await kit.get(ana.auth, { op: "person", id: "ENT-2026-9999", at: "2026-10-20" }));
  assert.equal(none.removed, undefined, "an unheld person has none: " + JSON.stringify(none).slice(0, 300));
});

test("R17, R29 (people R21): `GET op=sourcepersonlinks&source_id=<id>` answers the link to the member it lists and none to a member it does not list (the read takes `source_id`, not `source`, a stamp the door deletes)", { timeout: 600000 }, async () => {
  const ana = await kit.ownerOf("r21people-ana");
  const ben = await kit.person("r21people-ben");
  const adm = await kit.founder();
  /* a source: a knock pulled into the record, whose source `sourceof` mints from the capture */
  const bytes = kit.te("A tip left at the door about the register, r21people.");
  const k = await (await kit.plane("/api/?op=knock", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" },
    body: JSON.stringify({ contentB64: Buffer.from(bytes).toString("base64"), note: "see this", contact: "k@example.org", fileName: "tip.txt", mediaType: "text/plain" }) })).json();
  const knockId = (k.result ?? k).knockId;
  assert.ok(knockId, "a knock: " + JSON.stringify(k).slice(0, 300));
  const pulled = await kit.post(adm, "inboxpull", { knockId });
  assert.equal(pulled.body.ok, true, kit.gateLine(pulled));
  const src = R(await kit.get(ana.auth, { op: "sourceof", capture: kit.sha(bytes) }));
  const source = src.sourceId;
  assert.ok(source, "a source: " + JSON.stringify(src).slice(0, 300));
  const made = R((await kit.post(ana.auth, "entitycreate", { kind: "person", label: "Tess Orrin", note: "Named in the tip." })).body);
  const person = made.entity_id ?? made.id ?? made.entity?.entity_id;
  assert.ok(person, "a person: " + JSON.stringify(made).slice(0, 300));
  const linked = await kit.post(ana.auth, "sourcepersonlink", { source, person, evidence: "The tip names her.", sight: ["r21people-ana"] });
  assert.equal(R(linked.body).ok, true, kit.gateLine(linked));
  const mine = R(await kit.get(ana.auth, { op: "sourcepersonlinks", source_id: source }));
  assert.equal(mine.ok, true, JSON.stringify(mine).slice(0, 300));
  assert.equal(mine.count, 1, "the listed member reads the link: " + JSON.stringify(mine).slice(0, 300));
  assert.equal(mine.links[0].person, person);
  const his = R(await kit.get(ben, { op: "sourcepersonlinks", source_id: source }));
  assert.equal(his.count, 0, "a member the link does not list reads none: " + JSON.stringify(his).slice(0, 300));
});
