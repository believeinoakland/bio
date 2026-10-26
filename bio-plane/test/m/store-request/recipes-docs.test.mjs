/* store-request R19 (STORE-REQUEST #7, B18 START): the document-state recipes `holdAt`, `newerCapture`, `connection`, `partialPdf`, `unmatchedPerson`, `attested`, `paperFile` and `unretirable`,
   each over the real store and the owners' own code: the state is what they answer, each with a control. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects"] };
const html = (t) => `<html><head><title>Minutes</title></head><body><p>${t}</p></body></html>`;

test("R19 recipes.holdAt: a page captured at its address is filed at collected and `heldat` finds it by the address; control: another address is not held", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "At");
  const held = await w.recipes.holdAt(ann, "At address", "https://records.example.org/a.html", html("One."), P);
  const at = await ann.read("heldat", { query: { address: held.address } });
  assert.equal(at.held, true);
  assert.equal(at.copy.document, held.bundle);
  assert.equal((await ann.read("heldat", { query: { address: "https://records.example.org/other.html" } })).held, false);
});

test("R19 recipes.newerCapture: a changed source monitored raises an open notice for the question citing it and the queue's finding; keep and adopt answer it; control: a question citing an unchanged page raises none", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const made = await w.recipes.newerCapture(ann);
  assert.equal(made.notice.state, "open");
  assert.ok(made.finding && made.finding.subject.id === made.notice.notice, "the queue holds the finding");
  const kept = await w.recipes.newerCapture(await w.signIn("bo", caps), { address: "https://records.example.org/kept.html", decide: "keep" });
  assert.equal(kept.done.act, "kept");
  const adopted = await w.recipes.newerCapture(await w.signIn("cy", caps), { address: "https://records.example.org/adopted.html", decide: "adopt" });
  assert.ok(adopted.done, "adopting answered");
  const still = await w.recipes.holdAt(ann, "Unchanged", "https://records.example.org/still.html", html("Same."), await w.recipes.project(ann, "Still"));
  const none = (await (await w.signIn("ann")).read("reevaluationnotices", { query: { holder: still.bundle } })).notices;
  assert.deepEqual(none, []);
});

test("R19 recipes.connection: two captures naming one ordinance form a connection with a mention; the member chooses it and a progression threads both; control: the entity of one capture alone has none", async () => {
  const w = await storeWorld();
  const adm = await w.signIn("admin"), ann = await w.signIn("ann", caps);
  const made = await w.recipes.connection(adm, ann);
  assert.equal(made.connection.entity_id, made.entity);
  assert.equal(made.connection.mentions.length, 1);
  assert.equal(made.chose.wrote, true);
  assert.ok(made.instances >= 1);
  const alone = await w.recipes.hold(made.as, "Alone", html("Nothing named."), "", { type: "text/html", read: true });
  assert.deepEqual((await made.as.read("connections", { query: { sha256: alone.sha } })).connections, []);
});

test("R19 recipes.partialPdf: the reading holds pages 0 and 2 and names page 1 unread; the member's transcription mints it; control: the default PDF reads no page", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const made = await w.recipes.partialPdf(ann, "Partial");
  assert.deepEqual(made.unread, [1]);
  assert.equal(made.transcribed, true);
  const plain = await w.recipes.pdf(ann, "Plain");
  assert.equal((await ann.read("reading", { query: { sha256: plain.sha } })).text_units.length, 0);
});

test("R19 recipes.unmatchedPerson: one row of the directory matches an entity and five names stay unresolved; her testimony resolves one and the identity claim is made; control: without testimony no claim", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const made = await w.recipes.unmatchedPerson(ann);
  assert.equal(made.unresolved, 5);
  assert.ok(made.claim);
  const names = (await ann.read("resolutions", { query: { sha256: made.sha } })).names;
  assert.ok(names.some((n) => n.kind === "person"));
  const w2 = await storeWorld();
  const bo = await w2.signIn("bo", caps);
  assert.equal((await w2.recipes.unmatchedPerson(bo, { testify: false })).claim, null);
});

test("R19 recipes.attested: with the authority and the archive up the attestation carries both; asked again with the network changed it answers each case; control: neither is NO_ATTESTATION", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const made = await w.recipes.attested(ann);
  assert.equal(made.answer.ok, true);
  assert.ok(made.answer.attestation && made.answer.archive);
  const tsaOnly = await made.ask(true, false);
  assert.equal(tsaOnly.ok, true);
  assert.ok(tsaOnly.attestation);
  assert.ok(!tsaOnly.archive, "the archive was down");
  const archiveOnly = await made.ask(false, true);
  assert.deepEqual([archiveOnly.ok, archiveOnly.reason, !!archiveOnly.archive], [false, "NO_ATTESTATION", true]);
  const neither = await made.ask(false, false);
  assert.deepEqual([neither.ok, neither.reason], [false, "NO_ATTESTATION"]);
});

test("R19 recipes.paperFile: a route that cannot be shown is looked at and found indeterminate, marked; control: a held page's route is present", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Paper");
  const made = await w.recipes.paperFile(ann, P);
  assert.equal(made.route.finding, "LOOKED_INDETERMINATE");
  assert.equal(made.route.marked, true);
  assert.equal(made.route.register, "absent");
  const held = await w.recipes.page(ann, "Held", { project: P });
  assert.notEqual((await ann.act("provenanceroute", { query: { bundleId: held.bundle } })).route.finding, "LOOKED_INDETERMINATE");
});

test("R19 recipes.unretirable: retiring a copy never vouched for is refused ILLEGAL_TRANSITION naming it; control: the refusal is the owner's, not the door's", async () => {
  const w = await storeWorld();
  const ann = await w.signIn("ann", caps);
  const P = await w.recipes.project(ann, "Retire");
  const made = await w.recipes.unretirable(ann, P);
  assert.equal(made.refused.reason, "ILLEGAL_TRANSITION");
  assert.deepEqual(made.refused.offenders.map((o) => [o.id, o.from]), [[made.bundle, "collected"]]);
});
