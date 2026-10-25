/* screens-investigate, T51 fix round 2 (wave 1): the causes C6 to C62 of the build walk that sit in this module (CAUSES.md), each proved at the
 * module's interface over `store-request`'s world (K5148, K5054): the real store behind the page's door, a real sign-in. A state a test needs is made
 * by the member's own acts; the values it asserts are read back from the world's answers; the control shows the fix is the cause. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { refusedIn } from "../interface-shell/harness.mjs";
import { inWorld, openAs, settled, readHeld, declareStandard, rewrite } from "./world.mjs";
import { main, fill, press, word, drew, notDrew } from "./fixtures.mjs";

const optsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
const rowOf = (p, key) => main(p).querySelectorAll("tr.cs-r").find((r) => r.querySelector(`[data-id="${key}"]`));
const MINUTES = "The council met on March 3, 2026 and adopted the budget.";
const REASON = "The minutes say so.";
/** The page chooses a document; its passages are read when the choice changes. */
const choose = async (p, id, sha) => {
  fill(p, { [id]: sha }); p.fire(p.doc.getElementById(id), "change");
  for (let i = 0; i < 3; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 30)); } /* a first read of a document answers before `settled` looks (it stalls otherwise) */
  await settled(p);
};
/** An answer of the world's with its result changed by `fn(result)`: a part of the world's own answer this build does not make (K5044 (1)). */
const changing = (world, me, op, fn) => rewrite(world, me, (req, a) => (a && a.json && a.json.result && req.url.includes("op=" + op)
  ? { ...a, json: { ...a.json, result: fn(a.json.result) } } : a));

/* ---------------------------------------------------------------- C56 */

test("R34 C56 every kind the event form offers is a kind the plane lists (affordances' event_kinds), none copied by hand; control: a kind it does not list is not offered", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const held = await world.recipes.hold(me, "Minutes.txt", MINUTES, project);
  const timeline = "/app/timeline/" + project;
  const listed = (await me.read("affordances")).vocabularies.event_kinds;
  const p = await openAs(world, me, timeline);
  const offered = optsOf(p, "tl-kind").map(([v]) => v).filter(Boolean);
  assert.deepEqual(offered, listed.values.filter((k) => !["discretion", "waiver", "assessment"].includes(k)), "what the plane lists, in its order, less the kinds it takes only with their own act (USE_NEEDS_ITS_ACT)");
  assert.ok(p.byOp("affordances").length >= 1, "read from the vocabulary door");
  assert.ok(!offered.includes("decision"), "the old hand-copied kind the plane refused (UNKNOWN_EVENT_KIND) is not offered");
  const two = listed.values.slice(0, 2);
  const narrow = await openAs(world, me, timeline, { plane: { affordances: changing(world, me, "affordances", (r) => ({ ...r, vocabularies: { ...r.vocabularies,
    event_kinds: { ...listed, values: two, words: Object.fromEntries(two.map((k) => [k, listed.words[k]])) } } })) } });
  assert.deepEqual(optsOf(narrow, "tl-kind").map(([v]) => v).filter(Boolean), two, "only what the plane lists");
  const sent = await openAs(world, me, timeline);
  await choose(sent, "tl-doc", held.sha);
  const kind = "order";
  assert.ok(listed.values.includes(kind), "a kind the plane lists and createevent holds");
  fill(sent, { "tl-kind": kind });
  await press(sent, "createevent", { reason: REASON });
  await settled(sent);
  assert.equal(sent.byOp("createevent")[0].body.kind, kind, "the chosen kind is sent as listed");
  const read = await me.read("timeline", { query: { captures: held.sha } });
  const events = [...read.world.items, ...read.world.placed_nowhere];
  assert.equal(events.length, 1, "and the store holds the event");
  assert.equal(events[0].kind, kind, "of the kind chosen");
});

test("R34 C56 an unreadable vocabulary draws the kind choice failed, never a hand list", async () => {
  const { world, me } = await inWorld();
  const project = await world.recipes.project(me, "Pothole repairs");
  const p = await openAs(world, me, "/app/timeline/" + project, { plane: { affordances: refusedIn("UNAVAILABLE", "x") } });
  assert.equal(p.doc.getElementById("tl-kind"), null, "no kinds are guessed");
});

/* ---------------------------------------------------------------- C57 */

test("R4 R23 C57 committed against paid chooses the contract from the contracts the record follows and sends the chosen record; no typed name; control: with no contract held the choice's empty state is drawn and nothing is sent", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Sewer lining");
  const held = await world.recipes.hold(me, "Contract.txt", "The sewer lining contract is awarded for 1,300,000.00 dollars, of which 1,250,000.00 is paid.", project);
  const trail = await world.recipes.trail(me, project, "Sewer lining, FY2026");
  const contract = (await me.act("entitycreate", { body: { kind: "contract", label: "Sewer lining contract", note: "Named in the minutes." } })).entity_id;
  const award = (await me.act("createevent", { body: { kind: "award", concerns: [contract], attestations: [{ captureSha: held.sha, extent: { kind: "document" } }], reason: REASON } })).event_id;
  const figure = (stage, amount, concerns) => ({ amount, as_read: "$" + amount, currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "actual", stage, basis: "budgetary",
    period: { from: "2025-07-01", to: "2026-06-30" }, concerns, source: { capture_sha: held.sha, extent: { kind: "document" } } });
  await me.act("recordfact", { body: figure("encumbered", "1300000.00", [award]) });
  await me.act("recordfact", { body: figure("paid", "1250000.00", [contract]) });
  const p = await openAs(world, me, "/app/money/" + trail);
  assert.ok(p.byOp("peopledirectory").some((r) => r.query.show === "contracts"), "the contracts are read");
  const followed = (await me.read("peopledirectory", { query: { show: "contracts", limit: "200" } })).rows;
  assert.equal(followed.length, 1, "the record follows the one contract");
  assert.deepEqual(optsOf(p, "mf-contract").filter(([v]) => v), followed.map((r) => [r.entity, r.name]));
  assert.equal(followed[0].entity, contract);
  assert.equal(p.doc.getElementById("mf-contract").tagName.toLowerCase(), "select", "a choice, not a box");
  await press(p, "committedagainstpaid");
  await settled(p);
  assert.equal(p.byOp("committedagainstpaid")[0].query.contract, contract);
  const read = await me.read("committedagainstpaid", { query: { contract } });
  drew(main(p), "screen.money.cap.diff", { committed: read.committed.sum.value, paid: read.paid.sum.value, difference: read.difference.figure.value });
  const other = await inWorld();
  const project2 = await other.world.recipes.project(other.me, "Sewer lining");
  const trail2 = await other.world.recipes.trail(other.me, project2, "Sewer lining, FY2026");
  const none = await openAs(other.world, other.me, "/app/money/" + trail2);
  assert.equal(none.doc.getElementById("mf-contract"), null, "no contract held: no choice");
  await press(none, "committedagainstpaid");
  assert.equal(none.byOp("committedagainstpaid").length, 0);
  drew(main(none), "screen.money.f.nocontract", undefined, "and the refusal is said in words");
});

/* ---------------------------------------------------------------- C8 */

test("R4 C8 a figure read in for a trail is proposed to that trail (the money propose act) and drawn from the trail's record: after a reload it is a row that can be included", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The overhead allocation from the Sewer Fund to the General Fund was 310,000 dollars.", project);
  const trail = await world.recipes.trail(me, project, "Overhead allocation trail, FY2022");
  const money = "/app/money/" + trail;
  const p = await openAs(world, me, money);
  await choose(p, "mf-doc", held.sha);
  fill(p, { "mf-amount": "310,000", "mf-asread": "Overhead allocation … 310,000", "mf-kind": "allocation", "mf-phase": "actual", "mf-stage": "paid", "mf-from-date": "2021-07-01", "mf-to-date": "2022-06-30" });
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0], reason: REASON });
  await settled(p);
  const prop = p.byOp("moneysetpropose");
  assert.equal(prop.length, 1, "one proposal");
  const proposed = (await me.read("moneyset", { query: { id: trail } })).proposals;
  assert.equal(proposed.length, 1, "the trail holds it");
  const fact = proposed[0].fact_id;
  assert.equal(prop[0].body.setId, trail);
  assert.equal(prop[0].body.factId, fact);
  assert.ok(typeof prop[0].body.method === "string" && prop[0].body.method.length > 0, "it names its method (money R13)");
  assert.deepEqual(Object.keys(prop[0].body).sort(), ["factId", "method", "setId"], "only what the owner declares");
  assert.ok(rowOf(p, fact), "the figure is a row of the trail");
  /* a reload: nothing in page memory */
  const again = await openAs(world, me, money);
  const row = rowOf(again, fact);
  assert.ok(row, "after a reload the figure is drawn from the trail's proposals");
  drew(row, "screen.money.proposed.member");
  await again.click(row.querySelector('[data-shell="row"]'));
  await press(again, "include", { within: rowOf(again, fact).nextElementSibling, reason: "the transfer we ask about" });
  await settled(again);
  assert.deepEqual(again.byOp("include")[0].body, { setId: trail, factId: fact, reason: "the transfer we ask about" });
  assert.equal((await me.read("moneyset", { query: { id: trail } })).inclusions.length, 1, "and the trail holds it as included");
});

test("R4 C8 control: a figure read where no trail is open sends no propose; a refused proposal is drawn in words and the figure is not drawn as held", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Records office budget");
  const held = await world.recipes.hold(me, "Adopted budget.txt", "The overhead allocation from the Sewer Fund to the General Fund was 310,000 dollars.", project);
  const none = await openAs(world, me, "/app/money/" + project);
  assert.equal(none.doc.getElementById("mf-amount"), null, "a project with no trail offers no figure form");
  assert.equal(none.byOp("moneysetpropose").length, 0);
  const trail = await world.recipes.trail(me, project, "Overhead allocation trail, FY2022");
  /* the owner refuses the proposal (a fault the page cannot cause: the trail it names is the one open) */
  const refused = await openAs(world, me, "/app/money/" + trail, { plane: { moneysetpropose: refusedIn("NO_SUCH_SET", "There is no such trail.") } });
  await choose(refused, "mf-doc", held.sha);
  fill(refused, { "mf-amount": "310,000", "mf-asread": "Overhead allocation … 310,000", "mf-kind": "allocation", "mf-phase": "actual", "mf-stage": "paid", "mf-from-date": "2021-07-01", "mf-to-date": "2022-06-30" });
  await press(refused, "recordfact", { el: main(refused).querySelectorAll('button[data-act="recordfact"]')[0], reason: REASON });
  await settled(refused);
  assert.ok(main(refused).textContent.includes("There is no such trail."), "the refusal in words");
  assert.equal((await me.read("moneyset", { query: { id: trail } })).proposals.length, 0, "no trail holds the figure");
  assert.equal(main(refused).querySelectorAll("tr.cs-r").length, 0, "a figure no trail holds is not drawn as a row");
});

/* C54 (events found by the captures they cite) is proved in fix2w2.test.mjs, the wave 2 route of events R53. */

/* ---------------------------------------------------------------- C7 */

test("R53 C7 an institution's Address fact from a document is recorded (the fact act, the three kinds only) and drawn; control: no Born, Died or Locality is offered on an organisation", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const org = (await me.act("entitycreate", { body: { kind: "institution", label: "Public Works Department", note: "A city department" } })).entity_id;
  const held = await world.recipes.hold(me, "Notice.txt", "The Public Works Department is at 1 Frank Ogawa Plaza, Oakland.");
  const p = await openAs(world, me, "/app/person/" + org);
  const kinds = optsOf(p, "person-fact-kind");
  assert.deepEqual(kinds.map(([v]) => v), ["name", "address", "contact"], "exactly the three kinds");
  fill(p, { "person-fact-kind": "address", "person-fact-value": "1 Frank Ogawa Plaza, Oakland", "person-fact-doc": held.sha });
  await press(p, "recordpersonfact");
  await settled(p);
  const sent = p.byOp("recordpersonfact")[0].body;
  assert.equal(sent.person, org);
  assert.equal(sent.kind, "address");
  assert.equal(sent.value, "1 Frank Ogawa Plaza, Oakland");
  assert.equal(sent.citation.captureSha, held.sha);
  const facts = factsOf(await me.read("person", { query: { id: org, at: "2026-10-01" } }));
  assert.equal(facts.length, 1, "the record holds the fact");
  assert.equal(facts[0].value, "1 Frank Ogawa Plaza, Oakland");
  assert.ok(main(p).textContent.includes(facts[0].value), "the recorded fact is drawn from the record");
  assert.ok(main(p).textContent.includes(word("screen.person.kind.address")));
  for (const k of ["birth", "death", "locality"]) assert.ok(!kinds.some(([v]) => v === k), k + " is not offered");
  assert.equal(main(p).querySelector('[data-state="failed"]'), null, "never a failed read");
});

/* ---------------------------------------------------------------- C59 */

/* each document's words are their own selection: the id is the picker's plus the first 12 of the digest (C59) */
const wordsOf = (p, id) => p.doc.querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const pickWord = async (p, id, i) => { const w = wordsOf(p, id).querySelectorAll('[data-shell="word"]')[i]; await p.click(w); await p.settle(); };
/** The facts a person's reading holds, those with a start stated and those with none (listed apart as undetermined). */
const factsOf = (r) => [...r.facts, ...r.undetermined.filter((x) => x.fact_id)];
const LEASE = "Lin Chen, Director of Public Works\n\nAppointed in March 2022";
const RENT = "Monthly rent is due on the first.";

test("R34 C59 choosing a document draws the passage picker from that document's reading; the act sends the chosen extent; the fact row names its document; control: nothing selected is the whole document", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const lease = await world.recipes.hold(me, "Lease amendment 1.txt", LEASE);
  const rent = await world.recipes.hold(me, "Rent schedule.txt", RENT);
  const lu = await readHeld(world, me, lease.sha), ru = await readHeld(world, me, rent.sha);
  const p = await openAs(world, me, "/app/person/" + person);
  await choose(p, "person-fact-doc", lease.sha);
  const pick = wordsOf(p, "person-fact-passage");
  assert.ok(pick, "the passage picker is drawn once a document is chosen");
  assert.deepEqual(pick.querySelectorAll('[data-shell="word"]').map((e) => e.textContent), lu.map((u) => u.text), "the document's words");
  assert.equal(p.byOp("reading").at(-1).query.sha256, lease.sha, "its reading was read");
  /* choosing the other document redraws the picker from that document's reading */
  await choose(p, "person-fact-doc", rent.sha);
  assert.deepEqual(wordsOf(p, "person-fact-passage").querySelectorAll('[data-shell="word"]').map((e) => e.textContent), ru.map((u) => u.text));
  assert.equal(p.byOp("reading").at(-1).query.sha256, rent.sha);
  /* the passage chosen on screen is the extent sent */
  fill(p, { "person-fact-value": "Director of Public Works" });
  await choose(p, "person-fact-doc", lease.sha);
  await pickWord(p, "person-fact-passage", 1);
  await press(p, "recordpersonfact");
  await settled(p);
  assert.deepEqual(p.byOp("recordpersonfact")[0].body.citation, { captureSha: lease.sha, extent: lu[1].extent });
  /* control: nothing selected cites the whole document */
  await pickWord(p, "person-fact-passage", 1);
  fill(p, { "person-fact-value": "Director of Public Works" });
  await press(p, "recordpersonfact");
  await settled(p);
  assert.deepEqual(p.byOp("recordpersonfact")[1].body.citation, { captureSha: lease.sha, extent: { kind: "document" } });
  const facts = factsOf(await me.read("person", { query: { id: person, at: "2026-10-01" } }));
  assert.deepEqual(facts.map((f) => f.citation.extent).sort((a, b) => a.kind.localeCompare(b.kind)), [lu[1].extent, { kind: "document" }].sort((a, b) => a.kind.localeCompare(b.kind)), "the record holds both facts, each on the passage it cites");
});

test("R34 C59 a fact row names the document it cites (its title), not the placeholder phrase; control: a document the group no longer holds falls back to the source word", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const lease = await world.recipes.hold(me, "Lease amendment 1.txt", LEASE);
  await me.act("recordpersonfact", { body: { person, kind: "contact", value: "lin@example.org", valid: { from: "2022-03-01", to: null }, citation: { captureSha: lease.sha, extent: { kind: "document" } } } });
  const p = await openAs(world, me, "/app/person/" + person);
  const facts = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.person.facts"));
  const refs = facts.querySelectorAll(".cs-ref, .cs-card").map((e) => e.textContent);
  assert.ok(refs.includes("Lease amendment 1.txt"), "the cited document by title, as the link's own words: " + JSON.stringify(refs));
  /* the world's own list of the group's documents with the cited one no longer in it: no act of a member takes a document out of the group's hold */
  const gone = await openAs(world, me, "/app/person/" + person, { plane: { heldcaptures: changing(world, me, "heldcaptures", (r) => ({ ...r, held: [] })) } });
  const factsGone = main(gone).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.person.facts"));
  drew(factsGone, "screen.person.source");
});

/* ---------------------------------------------------------------- C60 */

/** A document held with the reading that names one person (`promote` of an information bundle whose provenance carries the reading, as the reading step files it). */
async function holdNaming(world, me, name, text, label) {
  const hex = (s) => createHash("sha256").update(s).digest("hex");
  const len = (s) => new TextEncoder().encode(s).length;
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`, init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(text) } }, me);
  const doc = up.json.result.document;
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const minted = await me.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const reading = { content_type: "generic", reader_version: 1, found: true, entities: [{ kind: "person", key: label, ref: "person:" + label, label }], facts: {}, at: now };
  const prov = JSON.stringify({ documents: [{ ...doc, reading }] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id, ref: "person:" + label };
}

test("R32 C60 \"Connect the documents that name them\": an empty answer says no document names them yet and why; control: a non-empty answer lists its documents", async () => {
  const { world, me } = await inWorld();
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const empty = await openAs(world, me, "/app/person/" + person);
  await press(empty, "connect");
  await settled(empty);
  assert.equal(empty.byOp("connect")[0].body.entityId, person);
  const none = main(empty).querySelector("[data-connected]");
  assert.ok(none, "the answer is said");
  assert.equal(none.getAttribute("data-connected"), "0");
  drew(none, "screen.people.counts.none");
  drew(none, "entity.naming.says", undefined, "and why: it is named only once it is matched");
  const a = await holdNaming(world, me, "Minutes of March.txt", "Lin Chen, Director of Public Works, spoke.", "Lin Chen");
  const b = await holdNaming(world, me, "Lease amendment.txt", "Lin Chen signed the lease amendment.", "Lin Chen");
  for (const h of [a, b]) await me.act("resolvetestify", { body: { captureSha: h.sha, ref: h.ref, entityId: person, basis: "The page names Lin Chen." } });
  const some = await openAs(world, me, "/app/person/" + person);
  await press(some, "connect");
  await settled(some);
  const read = await me.read("connections", { query: { id: person } }).catch(() => null);
  void read;
  const line = main(some).querySelector("[data-connected]");
  assert.equal(line.getAttribute("data-connected"), "2");
  drew(line, "screen.people.count.documents", { n: "2" });
  notDrew(line, "screen.people.counts.none");
  const refs = main(some).querySelectorAll("[data-connected-doc]").map((e) => e.getAttribute("data-connected-doc"));
  assert.deepEqual([...refs].sort(), [a.bundle, b.bundle].sort(), "each document it connects is listed");
});

/* ---------------------------------------------------------------- C61, C62 */

const POLICY = "The Director shall repair each reported pothole within seven calendar days of the report.";
const OTHER = "Crews log each pothole they fill.";
const ORDINANCE = "Section 8.22.050 No landlord shall increase the rent above the limit the board sets.";

/** A project holding a policy (declared a standard over its second passage) and an ordinance (over its only passage). */
async function held(world, me) {
  const project = await world.recipes.project(me, "Pothole repairs");
  const memo = await world.recipes.hold(me, "Administrative Instruction 9.1.txt", OTHER + "\n\n" + POLICY, project);
  const law = await world.recipes.hold(me, "Municipal Code 12.04.txt", ORDINANCE, project);
  const mu = await readHeld(world, me, memo.sha), lu = await readHeld(world, me, law.sha);
  const pol = await declareStandard(me, { cite: "Administrative Instruction 9.1, §2", kind: "policy", issuer: "Public Works", sha: memo.sha, extent: mu[1].extent, period: { from: "2023-01-01", to: null } });
  const ord = await declareStandard(me, { cite: "Municipal Code §12.04", kind: "ordinance", issuer: "City Council", sha: law.sha, extent: lu[0].extent });
  return { project, memo, law, mu, lu, pol, ord };
}

test("R8 C61 the page of one standard reads its passage's words (the content's capture and extent against the capture's reading) and links the document it is written in, never the content id; control: a passage whose words cannot be read names the document only", async () => {
  const { world, me } = await inWorld();
  const L = await held(world, me);
  const read = await me.read("standard", { query: { id: L.pol } });
  const content = read.texts[0].content_id;
  const p = await openAs(world, me, "/app/standard/" + L.pol);
  assert.equal(p.byOp("content")[0].query.id, content);
  assert.equal(p.byOp("reading")[0].query.sha256, L.memo.sha);
  const m = main(p);
  const quotes = m.querySelectorAll("blockquote.mk-passage").map((q) => q.textContent);
  assert.ok(quotes.includes(L.mu[1].text), "its words as written, from the passage");
  assert.ok(!m.textContent.includes(content), "the content id is not drawn");
  assert.ok(m.querySelectorAll(".cs-ref, .cs-card").some((e) => e.textContent === "Administrative Instruction 9.1.txt"), "the document it is written in, by title");
  /* the reading answers no words (a reading the store has not made) */
  const unread = await openAs(world, me, "/app/standard/" + L.pol, { plane: { reading: changing(world, me, "reading", (r) => ({ ...r, text_units: [], unread_pages: [] })) } });
  assert.ok(!main(unread).textContent.includes(content));
  assert.ok(main(unread).querySelectorAll("blockquote.mk-passage").every((q) => q.textContent !== L.mu[1].text), "no words invented");
  assert.ok(main(unread).querySelectorAll(".cs-ref, .cs-card").some((e) => e.textContent === "Administrative Instruction 9.1.txt"), "the document is still named");
});

test("R8 C61 the project's Standard screen lists the standards the record holds (op=standards), each a door to its page that keeps the project; control: none held says so", async () => {
  const { world, me } = await inWorld();
  const L = await held(world, me);
  const items = (await me.read("standards", { query: { limit: "200" } })).items;
  assert.equal(items.length, 2, "the record holds both");
  const p = await openAs(world, me, "/app/standard/" + L.project);
  assert.equal(p.byOp("standards")[0].query.limit, "200");
  const doors = main(p).querySelectorAll("a[data-standard-door]");
  assert.deepEqual(doors.map((a) => a.getAttribute("href")).sort(), items.map((x) => "/app/standard/" + x.id + "/" + L.project).sort());
  const first = items.find((x) => "/app/standard/" + x.id + "/" + L.project === doors[0].getAttribute("href"));
  assert.equal(doors[0].textContent, first.cite);
  const other = await inWorld();
  const empty = await other.world.recipes.project(other.me, "Pothole repairs");
  const none = await openAs(other.world, other.me, "/app/standard/" + empty);
  assert.equal(main(none).querySelectorAll("a[data-standard-door]").length, 0);
  assert.ok(main(none).querySelector("[data-held-standards] .cs-state[data-state='empty']"), "nothing held is said");
});

test("R56 C62 the page of one standard, opened from its project, names the project in its path; control: opened on its own it names none and never an id", async () => {
  const { world, me } = await inWorld();
  const L = await held(world, me);
  const from = await openAs(world, me, "/app/standard/" + L.pol + "/" + L.project);
  const nav = main(from).querySelector("nav.cs-crumbs");
  assert.ok(nav.textContent.includes("Pothole repairs"), "the project's title");
  assert.ok(!nav.textContent.includes("PROJ-"), "never the id");
  assert.equal(from.byOp("standard")[0].query.id, L.pol, "the project step does not change which standard is read");
  const alone = await openAs(world, me, "/app/standard/" + L.pol);
  const n2 = main(alone).querySelector("nav.cs-crumbs");
  assert.ok(!n2.textContent.includes("Pothole repairs") && !n2.textContent.includes("PROJ-"));
});
