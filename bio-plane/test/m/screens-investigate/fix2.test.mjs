/* screens-investigate, T51 fix round 2 (wave 1): the causes C6 to C62 of the build walk that sit in this module (CAUSES.md), each
 * proved at the module's interface over `store-request`'s world (K5148, K5054): the real store behind the page's door, a real sign-in. A state a test
 * needs is made by the member's own acts; the values it asserts are read back from the world's answers; the control shows the fix is the cause. */
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
const choose = async (p, id, sha) => { fill(p, { [id]: sha }); p.fire(p.doc.getElementById(id), "change"); await settled(p); };

/* ---------------------------------------------------------------- C56 */

test("R34 C56 every kind the event form offers is a kind the plane lists (affordances' event_kinds), none copied by hand; control: a kind it does not list is not offered", async () => {
  const p = await open(timeline);
  const offered = optsOf(p, "tl-kind").map(([v]) => v);
  assert.deepEqual(offered, PLANE_EVENT_KINDS, "exactly what the plane lists, in its order");
  assert.ok(p.byOp("affordances").length >= 1, "read from the vocabulary door");
  assert.ok(!offered.includes("decision"), "the old hand-copied kind the plane refused (UNKNOWN_EVENT_KIND) is not offered");
  const narrow = await open(timeline, { plane: { affordances: ok({ vocabularies: { ...VOCAB.vocabularies, event_kinds: { values: ["meeting", "vote"], words: { meeting: { word: "a meeting" }, vote: { word: "a vote" } } } } }) } });
  assert.deepEqual(optsOf(narrow, "tl-kind").map(([v]) => v), ["meeting", "vote"], "only what the plane lists");
  const sent = await open(timeline, { plane: { createevent: ok({ ok: true, event_id: "EVT-2026-0050" }) } });
  fill(sent, { "tl-doc": SHA, "tl-kind": "order" });
  await press(sent, "createevent", { reason: "the minutes" });
  assert.equal(sent.byOp("createevent")[0].body.kind, "order", "the chosen kind is sent as listed");
});

test("R34 C56 an unreadable vocabulary draws the kind choice failed, never a hand list", async () => {
  const p = await open(timeline, { plane: { affordances: refusedIn("UNAVAILABLE", "x") } });
  assert.equal(p.doc.getElementById("tl-kind"), null, "no kinds are guessed");
});

/* ---------------------------------------------------------------- C57 */

const CONTRACT = "ENT-2026-0810";
const contracts = (r) => ok(r.query.show === "contracts"
  ? { ok: true, following: 1, in_your_projects: 0, limit: 200, truncated: false, cursor: null, rows: [{ entity: CONTRACT, kind: "contract", name: "Sewer lining contract", today: {}, documents: 2, questions: 0, projects: 1, newest_added: "2026-10-02T09:00:00Z", mine: true }] }
  : { ok: true, following: 0, in_your_projects: 0, limit: 200, truncated: false, cursor: null, rows: [] });

test("R4 R23 C57 committed against paid chooses the contract from the contracts the record follows and sends the chosen record; no typed name; control: with no contract held the choice's empty state is drawn and nothing is sent", async () => {
  const p = await open(money, { plane: { peopledirectory: contracts, committedagainstpaid: ok({ ok: true, committed: { sum: { value: "1300000.00" } }, paid: { sum: { value: "1250000.00" } }, difference: { figure: { value: "50000.00" } } }) } });
  assert.ok(p.byOp("peopledirectory").some((r) => r.query.show === "contracts"), "the contracts are read");
  assert.deepEqual(optsOf(p, "mf-contract"), [[CONTRACT, "Sewer lining contract"]]);
  assert.equal(p.doc.getElementById("mf-contract").tagName.toLowerCase(), "select", "a choice, not a box");
  await press(p, "committedagainstpaid");
  assert.equal(p.byOp("committedagainstpaid")[0].query.contract, CONTRACT);
  drew(main(p), "screen.money.cap.diff", { committed: "1300000.00", paid: "1250000.00", difference: "50000.00" });
  const none = await open(money, { plane: { peopledirectory: () => ok({ ok: true, following: 0, in_your_projects: 0, limit: 200, truncated: false, cursor: null, rows: [] }) } });
  assert.equal(none.doc.getElementById("mf-contract"), null, "no contract held: no choice");
  await press(none, "committedagainstpaid");
  assert.equal(none.byOp("committedagainstpaid").length, 0);
  drew(main(none), "screen.money.f.nocontract", undefined, "and the refusal is said in words");
});

/* ---------------------------------------------------------------- C8 */

const NEWFACT = "MNY-2026-new";
const factOf = (id) => ({ fact_id: id, amount: "310000.00", as_read: "310,000", currency: "USD", sign: "+", precision: "exact", kind: "allocation", phase: "actual", stage: "paid", basis: "budgetary",
  period: { from: "2021-07-01", to: "2022-06-30", fiscal: "FY2021-22" }, from: { as_written: "Sewer Fund 3100" }, to: { as_written: "General Fund 1010" }, codes: [], concerns: [], source: { capture_sha: SHA, extent: { kind: "document" } },
  citation: "page 88", method: "typed", grade: { reading: "B" }, by: "member:ana", at: "2026-10-01T09:00:00Z", withdrawn: null, question: null });
const proposedTrail = () => TRAIL({ proposals: [{ proposal_id: 1, fact_id: NEWFACT, method: "member", by: "member:ana", at: "2026-10-21T09:00:00Z", label: "proposed",
  trail: { from: { stated: true }, to: { stated: true }, moved: { state: "undetermined" }, gaps: [] } }] });
const figureForm = { "mf-amount": "310,000", "mf-asread": "Overhead allocation … 310,000", "mf-kind": "allocation", "mf-phase": "actual", "mf-stage": "paid", "mf-doc": SHA };

test("R4 C8 a figure read in for a trail is proposed to that trail (the money propose act) and drawn from the trail's record: after a reload it is a row that can be included", async () => {
  let held = false;
  const plane = { recordfact: ok({ ok: true, fact_id: NEWFACT }), moneysetpropose: (r) => { held = true; return ok({ ok: true, set_id: r.body.setId, fact_id: r.body.factId, proposal_id: 1 }); },
    moneyset: () => ok(held ? proposedTrail() : TRAIL()), money: (r) => ok(moneyAnswer(r.query.id === NEWFACT ? factOf(NEWFACT) : FACTS[r.query.id] || { fact_id: r.query.id })), include: ok({ ok: true }) };
  const p = await open(money, { plane });
  fill(p, figureForm);
  await press(p, "recordfact", { el: main(p).querySelectorAll('button[data-act="recordfact"]')[0] });
  const prop = p.byOp("moneysetpropose");
  assert.equal(prop.length, 1, "one proposal");
  assert.equal(prop[0].body.setId, MSR);
  assert.equal(prop[0].body.factId, NEWFACT);
  assert.ok(typeof prop[0].body.method === "string" && prop[0].body.method.length > 0, "it names its method (money R13)");
  assert.deepEqual(Object.keys(prop[0].body).sort(), ["factId", "method", "setId"], "only what the owner declares");
  assert.ok(rowOf(p, NEWFACT), "the figure is a row of the trail");
  /* a reload: nothing in page memory */
  const again = await open(money, { plane });
  const row = rowOf(again, NEWFACT);
  assert.ok(row, "after a reload the figure is drawn from the trail's proposals");
  drew(row, "screen.money.proposed.member");
  await again.click(row.querySelector('[data-shell="row"]'));
  await press(again, "include", { within: rowOf(again, NEWFACT).nextElementSibling, reason: "the transfer we ask about" });
  assert.deepEqual(again.byOp("include")[0].body, { setId: MSR, factId: NEWFACT, reason: "the transfer we ask about" });
});

test("R4 C8 control: a figure read where no trail is open sends no propose; a refused proposal is drawn in words and the figure is not drawn as held", async () => {
  const none = await open("/app/money/" + P, { plane: { recordfact: ok({ ok: true, fact_id: NEWFACT }), moneysetpropose: ok({ ok: true }) } });
  assert.equal(none.doc.getElementById("mf-amount"), null, "a project with no trail offers no figure form");
  assert.equal(none.byOp("moneysetpropose").length, 0);
  const refused = await open(money, { plane: { recordfact: ok({ ok: true, fact_id: NEWFACT }), moneysetpropose: refusedIn("NO_SUCH_SET", "There is no such trail.") } });
  fill(refused, figureForm);
  await press(refused, "recordfact", { el: main(refused).querySelectorAll('button[data-act="recordfact"]')[0] });
  assert.ok(main(refused).textContent.includes("There is no such trail."), "the refusal in words");
  assert.equal(rowOf(refused, NEWFACT), undefined, "a figure no trail holds is not drawn as a row");
});

/* C54 (events found by the captures they cite) is proved in fix2w2.test.mjs, the wave 2 route of events R53. */

/* ---------------------------------------------------------------- C7 */

const ORG1 = "ENT-2026-0003";
const orgEntity = ok({ ok: true, found: true, entity: { entity_id: ORG1, kind: "institution", label: "Public Works Department", note: "A city department", aliases: [{ alias: "Public Works Department", canonical: true, declared_by: "machine:roster", at: "2026-09-01T09:00:00Z", withdrawn: null }], relations: [] } });
const notAPerson = refusedIn("NOT_A_PERSON", "The record named is not a person.");

test("R53 C7 an institution's Address fact from a document is recorded (the fact act, the three kinds only) and drawn; control: no Born, Died or Locality is offered on an organisation", async () => {
  let recorded = null;
  const plane = { entity: (r) => (r.query.id === ORG1 ? orgEntity : ok({ ok: false, found: false })), samepersoncandidates: notAPerson,
    person: () => (recorded ? ok({ ok: true, found: true, entity_id: ORG1, at: "2026-10-14", cluster: { state: "linked", members: [ORG1], truncated: false }, names: [{ member: ORG1, name: "Public Works Department", from: "registry" }],
      facts: [{ fact_id: "PFA-2026-0090", member: ORG1, kind: recorded.kind, value: recorded.value, valid: { from: null, to: null }, citation: recorded.citation, grade: "B", by: "member:mai", at: "2026-10-21T09:00:00Z", withdrawn: null }], posts: [], duties: [], undetermined: [], claims: [], truncated: {}, limit: 500 }) : notAPerson),
    recordpersonfact: (r) => { recorded = r.body; return ok({ ok: true, fact_id: "PFA-2026-0090" }); } };
  const p = await open("/app/person/" + ORG1, { plane });
  const kinds = optsOf(p, "person-fact-kind");
  assert.deepEqual(kinds.map(([v]) => v), ["name", "address", "contact"], "exactly the three kinds");
  fill(p, { "person-fact-kind": "address", "person-fact-value": "1 Frank Ogawa Plaza, Oakland", "person-fact-doc": SHA });
  await press(p, "recordpersonfact");
  const sent = p.byOp("recordpersonfact")[0].body;
  assert.equal(sent.person, ORG1);
  assert.equal(sent.kind, "address");
  assert.equal(sent.value, "1 Frank Ogawa Plaza, Oakland");
  assert.equal(sent.citation.captureSha, SHA);
  assert.ok(main(p).textContent.includes("1 Frank Ogawa Plaza, Oakland"), "the recorded fact is drawn from the record");
  assert.ok(main(p).textContent.includes(word("screen.person.kind.address")));
  for (const k of ["birth", "death", "locality"]) assert.ok(!kinds.some(([v]) => v === k), k + " is not offered");
  assert.equal(main(p).querySelector('[data-state="failed"]'), null, "never a failed read");
});

/* ---------------------------------------------------------------- C59 */

/* each document's words are their own selection: the id is the picker's plus the first 12 of the digest (C59) */
const wordsOf = (p, id) => p.doc.querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const pickWord = async (p, id, i) => { const w = wordsOf(p, id).querySelectorAll('[data-shell="word"]')[i]; await p.click(w); await p.settle(); };

test("R34 C59 choosing a document draws the passage picker from that document's reading; the act sends the chosen extent; the fact row names its document; control: nothing selected is the whole document", async () => {
  const p = await open("/app/person/" + ENT, { plane: { recordpersonfact: ok({ ok: true, fact_id: "PFA-2026-0099" }) } });
  const pick = wordsOf(p, "person-fact-passage");
  assert.ok(pick, "the passage picker is drawn once a document is chosen");
  assert.deepEqual(pick.querySelectorAll('[data-shell="word"]').map((e) => e.textContent), ["Lin Chen, Director of Public Works", "Appointed in March 2022"], "the document's words");
  assert.equal(p.byOp("reading")[0].query.sha256, SHA, "its reading was read");
  /* choosing the other document redraws the picker from that document's reading */
  fill(p, { "person-fact-doc": SHA2 });
  p.fire(p.doc.getElementById("person-fact-doc"), "change");
  await p.settle();
  assert.deepEqual(wordsOf(p, "person-fact-passage").querySelectorAll('[data-shell="word"]').map((e) => e.textContent), ["Monthly rent is due on the first."]);
  assert.equal(p.byOp("reading").at(-1).query.sha256, SHA2);
  /* the passage chosen on screen is the extent sent */
  fill(p, { "person-fact-doc": SHA, "person-fact-value": "Director of Public Works" });
  p.fire(p.doc.getElementById("person-fact-doc"), "change");
  await p.settle();
  await pickWord(p, "person-fact-passage", 1);
  await press(p, "recordpersonfact");
  assert.deepEqual(p.byOp("recordpersonfact")[0].body.citation, { captureSha: SHA, extent: { kind: "pdf-page", page: 1 } });
  /* control: nothing selected cites the whole document */
  await pickWord(p, "person-fact-passage", 1);
  fill(p, { "person-fact-value": "Director of Public Works" });
  await press(p, "recordpersonfact");
  assert.deepEqual(p.byOp("recordpersonfact")[1].body.citation, { captureSha: SHA, extent: { kind: "document" } });
});

test("R34 C59 a fact row names the document it cites (its title), not the placeholder phrase; control: a document the group no longer holds falls back to the source word", async () => {
  const p = await open("/app/person/" + ENT);
  const facts = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.person.facts"));
  const refs = facts.querySelectorAll(".cs-ref, .cs-card").map((e) => e.textContent);
  assert.ok(refs.includes("Lease amendment 1"), "the cited document by title, as the link's own words: " + JSON.stringify(refs));
  const gone = await open("/app/person/" + ENT, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  const factsGone = main(gone).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.person.facts"));
  drew(factsGone, "screen.person.source");
});

/* ---------------------------------------------------------------- C60 */

test("R32 C60 \"Connect the documents that name them\": an empty answer says no document names them yet and why; control: a non-empty answer lists its documents", async () => {
  const empty = await open("/app/person/" + ENT, { plane: { connect: ok({ ok: true, entity_id: ENT, found: true, documents: 0, document_limit: 100, resolution_rows: 0, count: 0, connections: [], limit: 100, truncated: false }) } });
  await press(empty, "connect");
  assert.equal(empty.byOp("connect")[0].body.entityId, ENT);
  const none = main(empty).querySelector("[data-connected]");
  assert.ok(none, "the answer is said");
  assert.equal(none.getAttribute("data-connected"), "0");
  drew(none, "screen.people.counts.none");
  drew(none, "entity.naming.says", undefined, "and why: it is named only once it is matched");
  const some = await open("/app/person/" + ENT, { plane: { connect: ok({ ok: true, entity_id: ENT, found: true, documents: 2, document_limit: 100, resolution_rows: 2, count: 1,
    connections: [{ a_capture_sha: SHA, b_capture_sha: SHA2, entity_id: ENT, a_bundle_id: "INFO-2026-0001", b_bundle_id: "INFO-2026-0002", grade: "B" }], limit: 100, truncated: false }) } });
  await press(some, "connect");
  const line = main(some).querySelector("[data-connected]");
  assert.equal(line.getAttribute("data-connected"), "2");
  drew(line, "screen.people.count.documents", { n: "2" });
  notDrew(line, "screen.people.counts.none");
  const refs = main(some).querySelectorAll("[data-connected-doc]").map((e) => e.getAttribute("data-connected-doc"));
  assert.deepEqual(refs, ["INFO-2026-0001", "INFO-2026-0002"], "each document it connects is listed");
});

/* ---------------------------------------------------------------- C61, C62 */

const STDX = "STD-2026-0004-policy";
const STANDARD_ROW = { ok: true, id: STDX, cite: "Administrative Instruction 9.1, §2", kind: "policy", issuer: "Public Works", reason: "", text: ["CNT-2026-0001"], texts: [{ content_id: "CNT-2026-0001", standing: "current", newer: null }], period: { from: "2023-01-01", to: null } };
const HELD_STANDARDS = { ok: true, items: [{ id: STDX, cite: "Administrative Instruction 9.1, §2", kind: "policy", issuer: "Public Works" }, { id: "STD-2026-0001-ordinance", cite: "Municipal Code §12.04", kind: "ordinance", issuer: "City Council" }], count: 2, limit: 200, truncated: false, cursor: null };
const WORDS = "The Director shall repair each reported pothole within seven calendar days of the report.";
const standardPlane = (extra = {}) => ({ standard: ok(STANDARD_ROW), standards: ok(HELD_STANDARDS),
  content: ok({ ok: true, content_id: "CNT-2026-0001", capture_sha: SHA, bundle_id: "INFO-2026-0001", extent_kind: "pdf-page", extent: { kind: "pdf-page", page: 3 } }),
  reading: ok({ ok: true, unread_pages: [], text_units: [{ extent: { kind: "pdf-page", page: 2 }, text: "Some other page." }, { extent: { kind: "pdf-page", page: 3 }, text: WORDS }] }), ...extra });

test("R8 C61 the page of one standard reads its passage's words (the content's capture and extent against the capture's reading) and links the document it is written in, never the content id; control: a passage whose words cannot be read names the document only", async () => {
  const p = await open("/app/standard/" + STDX, { plane: standardPlane() });
  assert.equal(p.byOp("content")[0].query.id, "CNT-2026-0001");
  assert.equal(p.byOp("reading")[0].query.sha256, SHA);
  const m = main(p);
  const quotes = m.querySelectorAll("blockquote.mk-passage").map((q) => q.textContent);
  assert.ok(quotes.includes(WORDS), "its words as written, from the passage");
  assert.ok(!m.textContent.includes("CNT-2026-0001"), "the content id is not drawn");
  assert.ok(m.querySelectorAll(".cs-ref, .cs-card").some((e) => e.textContent === "Lease amendment 1"), "the document it is written in, by title");
  const unread = await open("/app/standard/" + STDX, { plane: standardPlane({ reading: ok({ ok: true, unread_pages: [], text_units: [] }) }) });
  assert.ok(!main(unread).textContent.includes("CNT-2026-0001"));
  assert.ok(main(unread).querySelectorAll("blockquote.mk-passage").every((q) => q.textContent !== WORDS), "no words invented");
  assert.ok(main(unread).querySelectorAll(".cs-ref, .cs-card").some((e) => e.textContent === "Lease amendment 1"), "the document is still named");
});

test("R8 C61 the project's Standard screen lists the standards the record holds (op=standards), each a door to its page that keeps the project; control: none held says so", async () => {
  const p = await open("/app/standard/" + P, { plane: standardPlane() });
  assert.equal(p.byOp("standards")[0].query.limit, "200");
  const doors = main(p).querySelectorAll("a[data-standard-door]");
  assert.deepEqual(doors.map((a) => a.getAttribute("href")), ["/app/standard/" + STDX + "/" + P, "/app/standard/STD-2026-0001-ordinance/" + P]);
  assert.equal(doors[0].textContent, "Administrative Instruction 9.1, §2");
  const none = await open("/app/standard/" + P, { plane: standardPlane({ standards: ok({ ok: true, items: [], count: 0, limit: 200, truncated: false, cursor: null }) }) });
  assert.equal(main(none).querySelectorAll("a[data-standard-door]").length, 0);
  assert.ok(main(none).querySelector("[data-held-standards] .cs-state[data-state='empty']"), "nothing held is said");
});

test("R56 C62 the page of one standard, opened from its project, names the project in its path; control: opened on its own it names none and never an id", async () => {
  const from = await open("/app/standard/" + STDX + "/" + P, { plane: standardPlane() });
  const nav = main(from).querySelector("nav.cs-crumbs");
  assert.ok(nav.textContent.includes("Pothole repairs"), "the project's title");
  assert.ok(!nav.textContent.includes("PROJ-"), "never the id");
  assert.equal(from.byOp("standard")[0].query.id, STDX, "the project step does not change which standard is read");
  const alone = await open("/app/standard/" + STDX, { plane: standardPlane() });
  const n2 = main(alone).querySelector("nav.cs-crumbs");
  assert.ok(!n2.textContent.includes("Pothole repairs") && !n2.textContent.includes("PROJ-"));
});
