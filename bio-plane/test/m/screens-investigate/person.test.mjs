/* screens-investigate R1: a person the record follows, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, ADMIN } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, PERSON, ENT, ORG, SHA, SHA2, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/person/" + ENT;
const admin = { boot: { plane: { ...plane(), whoami: ok(ADMIN) } } };

test("R1 reads person (as of the page's day, never \"now\") and samepersoncandidates; positions and facts each a reference to its source passage, with its grade", async () => {
  const p = await open(at);
  const q = p.byOp("person")[0].query;
  assert.equal(q.id, ENT);
  assert.match(q.at, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(p.byOp("samepersoncandidates")[0].query.id, ENT);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "L. Chen");
  const secs = m.querySelectorAll("section");
  const pos = secs.find((s) => s.querySelector("h2").textContent === word("screen.person.positions"));
  assert.ok(pos.textContent.includes("Director of Public Works · employee · " + word("screen.person.since", { from: dayOf("2022-03-01") })));
  assert.equal(pos.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]).join(), "connection,B");
  assert.ok(pos.querySelector(`[data-tip*="page 1"]`), "the position cites its passage");
  const facts = secs.find((s) => s.querySelector("h2").textContent === word("screen.person.facts"));
  assert.ok(facts.textContent.includes(word("screen.person.kind.locality") + " · Oakview district"));
  assert.equal(facts.querySelector(".cs-grade").textContent.slice(-1), "B");
  assert.ok(facts.querySelector('[data-tip*="page 3"]'));
});

test("R1 same person? the cluster's other records linked as claimed (never merged) and the candidates, which are not claims", async () => {
  const p = await open(at);
  const s = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.person.same"));
  drew(s, "screen.person.same.claimed");
  drew(s, "screen.person.candidates");
});

test("R1 the acts as drawn for a member: explore, recordpersonfact, identityclaim, withdrawidentityclaim, followregister, and the entities acts (R32); no Open the person; personexpunge only for an administrator (interface-shell R47)", async () => {
  const p = await open(at);
  const acts = actsIn(main(p));
  assert.ok(!acts.includes("person"), "R32 (3): the person's own page has no Open the person");
  for (const op of ["explore", "followregister", "identityclaim", "recordpersonfact", "withdrawidentityclaim", "entityalias", "aliaswithdraw", "relationdeclare", "resolve", "resolvetestify", "connect"]) assert.ok(acts.includes(op), op);
  const q = await open(at, admin);
  assert.ok(actsIn(main(q)).includes("personexpunge"));
});

test("R1 Explore connections opens explore from this person", async () => {
  const p = await open(at);
  await press(p, "explore");
  assert.equal(p.location.pathname, "/app/explore/" + ENT);
});

test("R1 recordpersonfact: a fact read from the passage the member names, citing it (control: no passage sends nothing)", async () => {
  const p = await open(at, { plane: { recordpersonfact: ok({ ok: true, fact_id: "PFA-2026-0010" }) } });
  fill(p, { "person-fact-kind": "locality", "person-fact-value": "Lakeshore", "person-fact-from": "2024-01-01", "person-fact-doc": SHA });
  await press(p, "recordpersonfact");
  assert.deepEqual(p.byOp("recordpersonfact")[0].body, { person: ENT, kind: "locality", value: "Lakeshore", valid: { from: "2024-01-01", to: null },
    citation: { captureSha: SHA, extent: { kind: "document" } } });
  /* control: with no document held there is no passage to cite (the first document held is the one drawn and chosen, C59) */
  const q = await open(at, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  fill(q, { "person-fact-value": "Lakeshore" });
  await press(q, "recordpersonfact");
  assert.equal(q.byOp("recordpersonfact").length, 0);
});

test("R1 identityclaim \"Say another record is this person\" with its basis and the member's words; withdrawidentityclaim with a reason (controls: a refusal drawn beside the act)", async () => {
  const p = await open(at, { plane: { identityclaim: ok({ ok: true, claim_id: "IDC-2026-0003", kind: "same_as", grade: "D", why: "claimed the same person, grade D, because a member says so" }),
    withdrawidentityclaim: ok({ ok: true, claim_id: "IDC-2026-0003" }) } });
  fill(p, { "person-claim-other": "ENT-2026-0019", "person-claim-kind": "same_as", "person-claim-basis": "testimony", "person-claim-note": "I met both at the same meeting" });
  await press(p, "identityclaim");
  assert.deepEqual(p.byOp("identityclaim")[0].body, { a: ENT, b: "ENT-2026-0019", kind: "same_as", basis: "testimony", note: "I met both at the same meeting" });
  assert.equal(p.byOp("person").length, 2, "after the claim the screen reads the person again");
  const q = await open(at, { plane: { identityclaim: refusedIn("IDENTITY_GRADE_UNEARNED", "That basis does not earn this grade.") } });
  fill(q, { "person-claim-other": "ENT-2026-0019", "person-claim-basis": "name" });
  q.fire(q.doc.getElementById("person-claim-basis"), "change");
  fill(q, { "person-claim-doc-a": SHA, "person-claim-doc-b": SHA, "person-claim-note": "same name" });
  await press(q, "identityclaim");
  assert.equal(q.byOp("identityclaim")[0].body.evidence.a.captureSha, SHA);
  assert.ok(main(q).textContent.includes(word("refusal.IDENTITY_GRADE_UNEARNED")), "the refusal by its words");
  assert.equal(q.doc.getElementById("person-claim-note").value, "same name");
});

test("R1 followregister: a register the person appears in (control: an address that is not https sends nothing)", async () => {
  const p = await open(at, { plane: { followregister: ok({ ok: true, follow: 3, kind: "register" }) } });
  fill(p, { "person-follow": "https://licences.example/engineers" });
  await press(p, "followregister");
  assert.deepEqual(p.byOp("followregister")[0].body, { address: "https://licences.example/engineers" });
  const q = await open(at);
  fill(q, { "person-follow": "licences.example" });
  await press(q, "followregister");
  assert.equal(q.byOp("followregister").length, 0);
});

test("R1 personexpunge: the consequence statement (op-grades R21) filled with the day and the member, the reason naming the law or order, the Irreversible weight, a dialog before anything is sent", async () => {
  const p = await open(at, { ...admin, plane: { personexpunge: ok({ ok: true, removed: 1 }) } });
  const d = main(p).querySelector('[data-consequence="personexpunge"]');
  const day = dayOf(new Date().toISOString().slice(0, 10));
  assert.equal(d.querySelector(".ends").textContent, word("screen.person.expunge.statement", { date: day, member: "rosa" }), "the statement, filled with the day and the member");
  const b = button(p, "personexpunge");
  assert.ok(b.textContent.includes(word("weight.irreversible.name")));
  fill(p, { "person-x-fact": "PFA-2026-0007", "person-x-ground": "court_order", "person-x-order": "Superior Court order of 2 October 2026, ¶3" });
  await p.click(b);
  assert.equal(p.byOp("personexpunge").length, 0, "nothing is sent before the dialog's confirm");
  await press(p, "personexpunge", { fields: ["Superior Court order of 2 October 2026, paragraph 3"] });
  assert.deepEqual(p.byOp("personexpunge")[0].body, { id: "PFA-2026-0007", ground: "court_order", reason: "Superior Court order of 2 October 2026, paragraph 3", order: "Superior Court order of 2 October 2026, ¶3" });
});

test("R1 personexpunge at the phone width is read and not done (interface-shell R11, DEC-181)", async () => {
  const p = await open(at, { boot: { plane: { ...plane(), whoami: ok(ADMIN) }, phone: true } });
  assert.equal(button(p, "personexpunge"), null);
  assert.ok(main(p).querySelector('[data-phone-act="personexpunge"]'));
});

test("R21 person draws each identity claim as person answers it (kind, grade, why, who and when); \"Withdraw this claim\" names that claim by its claim_id, with a reason; withdrawing one of two leaves the other drawn; control: a claim of a hidden project is not drawn", async () => {
  const both = PERSON();
  const rest = { ...both, claims: [both.claims[1]] };
  let gone = false;
  const p = await open(at, { plane: { person: () => ok(gone ? rest : both), withdrawidentityclaim: () => { gone = true; return ok({ ok: true, claim_id: "IDC-2026-0001" }); } } });
  const m = main(p);
  const buttons = m.querySelectorAll('button[data-act="withdrawidentityclaim"]');
  assert.deepEqual(buttons.map((b) => b.getAttribute("data-claim")), ["IDC-2026-0001", "IDC-2026-0002"]);
  for (const [kind, by, day] of [["same_as", "dev", "2026-10-03"], ["unsure", "mai", "2026-10-04"]]) {
    drew(m, "label.identityclaimkinds." + kind);
    drew(m, "screen.person.claim.by", { by, date: dayOf(day) });
  }
  assert.equal(m.querySelectorAll("*").filter((e) => e.getAttribute("id") === "person-claim-id").length, 0, "no field asks for a claim id");
  fill(p, { "person-wd-reason-0": "different middle initial" });
  await press(p, "withdrawidentityclaim", { el: buttons[0] });
  assert.deepEqual(p.byOp("withdrawidentityclaim")[0].body, { claimId: "IDC-2026-0001", reason: "different middle initial" });
  const after = main(p).querySelectorAll('button[data-act="withdrawidentityclaim"]');
  assert.deepEqual(after.map((b) => b.getAttribute("data-claim")), ["IDC-2026-0002"], "the other claim is still drawn");
  const hidden = await open(at, { plane: { person: ok(PERSON({ claims: [] })) } });
  assert.equal(main(hidden).querySelectorAll('button[data-act="withdrawidentityclaim"]').length, 0, "a claim person does not answer is not drawn");
});

const opts = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.textContent]);
const secOf = (p, key) => main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word(key));
const HIDDEN = (o) => ({ boot: { plane: { ...plane(), ...o } } });

test("R32 (1) what the team says about them: other names (a roster name as data, an added name withdrawn with a reason), ties a member declared, documents that may name them; each act sends the owner's arguments", async () => {
  const p = await open(at, { plane: { entityalias: ok({ ok: true }), aliaswithdraw: ok({ ok: true }), relationdeclare: ok({ ok: true }), resolve: ok({ ok: true }), resolvetestify: ok({ ok: true }), connect: ok({ ok: true }) } });
  const s = secOf(p, "entity.says.title");
  assert.ok(s, "the section is headed entity.says.title");
  drew(s, "entity.alias.roster");
  drew(s, "entity.alias.by", { who: "mai", date: dayOf("2026-10-01") });
  drew(s, "entity.relation.declared", { who: "dev", date: dayOf("2026-10-02"), where: "minutes, page 2" });
  fill(p, { "person-alias": "Lin C." });
  await press(p, "entityalias");
  assert.deepEqual(p.byOp("entityalias")[0].body, { entityId: ENT, alias: "Lin C." });
  await press(p, "aliaswithdraw", { reason: "a typo" });
  assert.deepEqual(p.byOp("aliaswithdraw")[0].body, { entityId: ENT, alias: "Lin Chen", reason: "a typo" });
  fill(p, { "person-rel-kind": "proxy_for", "person-rel-with": ORG, "person-rel-why": "acts in their name", "person-rel-cite": "letter, page 1" });
  await press(p, "relationdeclare");
  assert.deepEqual(p.byOp("relationdeclare")[0].body, { fromEntity: ENT, toEntity: ORG, relation: "proxy_for", justification: "acts in their name", citation: "letter, page 1" });
  drew(s, "entity.naming.row", { page: "2", alias: "L. Chen" });
  await press(p, "resolve", { reason: "the name matches" });
  assert.deepEqual(p.byOp("resolve")[0].body, { captureSha: SHA, ref: "L. Chen", reason: "the name matches" });
  fill(p, { "person-naming-basis": "I was at the meeting" });
  await press(p, "resolvetestify");
  assert.deepEqual(p.byOp("resolvetestify")[0].body, { captureSha: SHA, ref: "L. Chen", entityId: ENT, basis: "I was at the meeting" });
  await press(p, "connect");
  assert.deepEqual(p.byOp("connect")[0].body, { entityId: ENT });
});

test("R32 (1) control: an organization's page words it for an organization; writinghelp is offered only while the assistant is reachable", async () => {
  const org = await open(at, { plane: { entity: ok({ ok: true, found: true, entity: { entity_id: ENT, kind: "body", label: "Works", aliases: [], relations: [] } }) } });
  assert.ok(secOf(org, "entity.says.title.org"));
  assert.equal(secOf(org, "entity.says.title"), undefined);
  assert.equal(button(org, "writinghelp"), null, "no assistant, no help");
});

test("R32 (2) every fact recorded is listed: valid today, then those whose validity is not stated or settled (marked undetermined with the reason and the source), the withdrawn in a fold with who, when and why", async () => {
  const base = PERSON();
  const nostate = { fact_id: "PFA-2026-0008", member: ENT, kind: "birth", value: "1971", valid: null, citation: { captureSha: SHA, extent: { kind: "document" } }, grade: "C", withdrawn: null, undetermined: { why: { key: "people.why.validity_stated", vars: {} } } };
  const unsettled = { fact_id: "PFA-2026-0009", member: ENT, kind: "address", value: "9 Elm St", valid: { from: "2020-01-01", to: "2021-01-01" }, citation: { captureSha: SHA2, extent: { kind: "document" } }, grade: "C", withdrawn: null, undetermined: { why: { key: "people.why.record_settle_order", vars: {} } } };
  const gone = { fact_id: "PFA-2026-0003", member: ENT, kind: "contact", value: "old@example.org", valid: null, citation: null, grade: "D", withdrawn: { by: "member:mai", at: "2026-10-05T09:00:00Z", reason: "a typo" } };
  const p = await open(at, { plane: { person: ok({ ...base, undetermined: [nostate, unsettled], facts: [...base.facts, gone] }) } });
  const f = secOf(p, "screen.person.facts");
  drew(f, "screen.person.facts.undetermined", { reason: word("people.why.validity_stated"), document: "Lease amendment 1" });
  drew(f, "screen.person.facts.undetermined", { reason: word("people.why.record_settle_order"), document: "Rent schedule" });
  assert.ok(f.textContent.includes("1971") && f.textContent.includes("9 Elm St"), "none dropped");
  assert.ok(f.querySelectorAll(".cs-gap").length >= 2, "each marked undetermined");
  drew(f, "screen.person.facts.withdrawn", { n: "1" });
  drew(f, "screen.person.facts.withdrawn.by", { name: "mai", date: dayOf("2026-10-05"), reason: "a typo" });
  assert.ok(!f.textContent.includes(word("screen.person.facts.withdrawn.by", { name: "admin", date: dayOf("2026-10-05"), reason: "a typo" })), "never admin");
});

test("R32 (3) a person with no connection draws person.graph.none in place of an empty graph; the other sections stand", async () => {
  const p = await open(at, { plane: { exploregraph: ok({ ok: true, centre: ENT, nodes: [{ id: ENT, ring: 0, label: "L. Chen", entity_kind: "person" }], steps: [], stopped: [] }) } });
  const c = secOf(p, "screen.person.connections");
  drew(c, "person.graph.none");
  assert.equal(c.querySelectorAll("svg").length, 0);
  assert.ok(secOf(p, "screen.person.facts"));
});

test("R34 the fact form chooses a document by title and sends its digest; with no document the choice's empty state is drawn and nothing is sent", async () => {
  const p = await open(at);
  assert.deepEqual(opts(p, "person-fact-doc"), [[SHA, "Lease amendment 1"], [SHA2.toString(), "Rent schedule"]]);
  const none = await open(at, { plane: { heldcaptures: ok({ ok: true, held: [] }) } });
  assert.equal(none.doc.getElementById("person-fact-doc"), null);
  drew(secOf(none, "screen.person.facts"), "state.empty");
  fill(none, { "person-fact-value": "x" });
  await press(none, "recordpersonfact");
  assert.equal(none.byOp("recordpersonfact").length, 0);
  assert.equal(main(p).querySelectorAll("*").filter((e) => /sha|fingerprint|content id/i.test(e.getAttribute("id") || "")).length, 0, "no field asks for a fingerprint");
});

test("R38 Same person?: a standing claim row (grade, the basis in the row's words, who and when), both acts explained, the form's menu listing the candidates and its basis choice worded by label.claimbases.<id>", async () => {
  const p = await open(at, { plane: { identityclaim: ok({ ok: true, claim_id: "IDC-2026-0003" }) } });
  const s = secOf(p, "screen.person.same");
  drew(s, "screen.person.same.because", { grade: "B", basis: word("screen.person.basis.row.name") });
  drew(s, "screen.person.same.because", { grade: "C", basis: word("screen.person.basis.row.testimony") });
  for (const k of ["act.identityclaim.does", "act.withdrawidentityclaim.does"]) drew(s, k);
  const agree = word("screen.person.field.names"), differ = word("screen.person.field.posts");
  assert.deepEqual(opts(p, "person-claim-other"), [["ENT-2026-0019", word("screen.person.claim.candidate", { record: word("connection.node.unnamed"), agrees: agree, differs: differ })]]);
  assert.deepEqual(opts(p, "person-claim-basis").map((o) => o[1]), ["identifier", "corroborated_name", "name", "testimony"].map((b) => word("label.claimbases." + b)));
  assert.deepEqual(opts(p, "person-claim-kind").map((o) => o[1]), ["same_as", "not_same_as", "unsure"].map((k) => word("screen.person.claim.kind." + k)));
  fill(p, { "person-claim-other": "ENT-2026-0019", "person-claim-note": "" });
  await press(p, "identityclaim");
  assert.equal(p.byOp("identityclaim").length, 0, "with the note missing nothing is sent");
  const fold = secOf(p, "screen.person.same");
  drew(fold, "screen.person.claim.empty.summary");
  drew(fold, "screen.person.claim.empty");
});

test("R38 with no candidate the menu lists the people the record follows, never an empty menu; a failed candidates read is drawn failed and the menu is not drawn empty; a withdrawn claim is not drawn", async () => {
  const none = await open(at, { plane: { samepersoncandidates: ok({ ok: true, entity_id: ENT, count: 0, candidates: [], truncated: false }) } });
  assert.deepEqual(opts(none, "person-claim-other").map((o) => o[0]), [ORG]);
  const bad = await open(at, { plane: { samepersoncandidates: ok({ ok: false, code: "UNREADABLE" }) } });
  assert.equal(bad.doc.getElementById("person-claim-other"), null);
  assert.ok(secOf(bad, "screen.person.same").querySelector('[data-state="failed"], .cs-gap'), "drawn failed");
  const wd = await open(at, { plane: { person: ok(PERSON({ claims: [{ ...PERSON().claims[0], withdrawn: { by: "member:mai" } }] })) } });
  assert.equal(main(wd).querySelectorAll('button[data-act="withdrawidentityclaim"]').length, 0);
});

test("R38 the withdraw fold asks its reason before it sends; a basis other than testimony chooses a document for each record", async () => {
  const p = await open(at, { plane: { withdrawidentityclaim: ok({ ok: true }) } });
  await press(p, "withdrawidentityclaim", { el: button(p, "withdrawidentityclaim") });
  assert.equal(p.byOp("withdrawidentityclaim").length, 0, "no reason, nothing sent");
  assert.equal(p.doc.getElementById("person-claim-doc-a"), null, "control: testimony, the default, names no document");
  fill(p, { "person-claim-basis": "identifier" });
  p.fire(p.doc.getElementById("person-claim-basis"), "change");
  assert.equal(p.doc.getElementById("person-claim-doc-a") === null, false, "a basis other than testimony chooses a document for each record");
});

test("R39 a claim of each basis draws screen.person.basis.row.<basis>; the form's basis words are label.claimbases.<id>, and screen.person.basis.<id> is not drawn", async () => {
  const bases = ["identifier", "corroborated_name", "name", "testimony"];
  const claims = bases.map((b, i) => ({ claim_id: "IDC-2026-01" + i, a: ENT, b: "ENT-2026-02" + i, kind: "same_as", basis: b, grade: "A", why: "w", by: "member:mai", at: "2026-10-03T09:00:00Z" }));
  const p = await open(at, { plane: { person: ok(PERSON({ claims })) } });
  const s = secOf(p, "screen.person.same");
  for (const b of bases) { drew(s, "screen.person.same.because", { grade: "A", basis: word("screen.person.basis.row." + b) }); assert.ok(!s.textContent.includes(word("screen.person.basis." + b))); }
});

/* R41, R44, R46, R48 (T51-120) */
const ORDINANCE = "ENT-2026-0400", OFFICE = "ENT-2026-0401";
const kindEntity = (id, kind, label, extra = {}) => ok({ ok: true, found: true, entity: { entity_id: id, kind, label, note: "The city's rule on tenant notices", aliases: [
  { alias: label, canonical: true, declared_by: "machine:roster", at: "2026-09-01T09:00:00Z", withdrawn: null },
  { alias: "Chapter 8.22", canonical: false, declared_by: "member:mai", at: "2026-10-01T09:00:00Z", withdrawn: null }], relations: [], ...extra } });
const CONCERNS = (docs) => ok({ ok: true, entity_id: ORDINANCE, found: true, count: docs.length, documents: docs, limit: 200, truncated: false });

test("R41 an ordinance opens its own page: its note, kind and documents, \"Where the record cites it\" with each document's grade, its alias and a document that may name it; no person read, no facts, no career (control: a person's page is unchanged)", async () => {
  const docs = [{ capture_sha: SHA, bundle_id: null, ref: "r1", grade: "B", established: true, extent: { kind: "pdf-page", page: 0 } }, { capture_sha: SHA2, bundle_id: null, ref: "r2", grade: "C" }];
  const p = await open("/app/person/" + ORDINANCE, { plane: { entity: kindEntity(ORDINANCE, "ordinance", "Tenant Notice Ordinance"), concerns: CONCERNS(docs),
    readingname: ok({ ok: true, documents: [{ capture_sha: SHA2, ref: "r9", label: "Council packet", matched_alias: "Chapter 8.22", page: 4 }] }) } });
  assert.equal(p.byOp("person").length, 0, "no person read is made for it");
  assert.equal(p.byOp("samepersoncandidates").length, 0);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Tenant Notice Ordinance");
  drew(m, "find.row.kind.ordinance");
  drew(m, "screen.people.counts", { list: word("screen.people.count.documents", { n: "2" }) });
  const cited = secOf(p, "screen.person.cited");
  assert.equal(cited.querySelectorAll(".cs-grade").length, 2, "each document's grade as one mark");
  assert.ok(cited.textContent.includes(word("screen.person.page", { page: "1" })), "the place, one-based (R46)");
  assert.ok(secOf(p, "entity.alias.title").textContent.includes("Chapter 8.22"));
  assert.ok(secOf(p, "entity.naming.title"), "a document that may name it");
  assert.ok(button(p, "explore"), "explore where a document names it");
  for (const k of ["screen.person.positions", "screen.person.facts", "screen.person.same"]) assert.equal(secOf(p, k), undefined, k);
  assert.equal(button(p, "recordpersonfact"), null);
  assert.ok(button(p, "relationdeclare"), "the ties part, DEC-338");
  drew(secOf(p, "entity.relation.title"), "screen.person.ties.none.ordinance");
  const q = await open(at);
  assert.ok(q.byOp("person").length >= 1 && secOf(q, "screen.person.positions") && secOf(q, "screen.person.facts"), "a person's page is unchanged");
});

test("R41 an office draws who has held it (the holders, their dates, source and grade) and not 'Where the record cites it'; a subject no document names draws the empty sentence and no explore", async () => {
  const line = (from, valid) => ({ line_id: "LIN-" + from, kind: "holds", from, to: OFFICE, valid, assertion: "B", basis: { form: "passage", captureSha: SHA, extent: { kind: "pdf-page", page: 2 } }, withdrawn: null });
  const p = await open("/app/person/" + OFFICE, { plane: { entity: kindEntity(OFFICE, "office", "City Clerk"), concerns: CONCERNS([]),
    linesof: ok({ ok: true, entity: OFFICE, direction: "to", count: 2, limit: 200, truncated: false, lines: [line(ENT, { from: "2022-03-01", to: null }), line(ORG, { from: "2015-01-01", to: "2021-12-31" })] }) } });
  assert.equal(p.byOp("linesof")[0].query.direction, "to");
  const h = secOf(p, "screen.person.holders");
  assert.equal(h.querySelectorAll(".cs-row").length, 2);
  assert.ok(h.textContent.includes(word("screen.person.since", { from: dayOf("2022-03-01") })));
  assert.equal(secOf(p, "screen.person.cited"), undefined);
  assert.equal(secOf(p, "entity.naming.title"), undefined, "an office draws other names alone of the document part");
  drew(main(p), "screen.people.counts.none");
  assert.equal(button(p, "explore"), null, "no document names it: no explore");
});

test("R44 an undetermined fact's reason is drawn by its word with the owner's fills; a bare string draws no English of this module; R46 a page 0 is drawn as page 1", async () => {
  const f = (id, why) => ({ fact_id: id, member: ENT, kind: "birth", value: "v" + id, valid: null, citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 0 } }, grade: "C", withdrawn: null, undetermined: { why } });
  const p = await open(at, { plane: { person: ok(PERSON({ undetermined: [f("PFA-1", { key: "people.why.precision", vars: { precision: "week" } }), f("PFA-2", "an old sentence")] })) } });
  const facts = secOf(p, "screen.person.facts");
  drew(facts, "screen.person.facts.undetermined", { reason: word("people.why.precision", { precision: "week" }), document: "Lease amendment 1" });
  assert.ok(!facts.textContent.includes("an old sentence"), "a bare string is no English of ours");
  drew(facts, "state.undetermined", { reason: word("people.why.owner_settle_validity") });
  assert.ok(facts.querySelector('[data-tip*="' + word("screen.person.page", { page: "1" }) + '"]'), "page 0 is drawn as page 1, not hidden");
});

test("R48 a person with no connections draws person.graph.none and no Explore connections; one connection draws the graph and the act", async () => {
  const one = await open(at);
  assert.ok(button(one, "explore"), "control: one connection draws the act");
  assert.ok(secOf(one, "screen.person.connections").querySelectorAll("svg").length > 0);
  const none = await open(at, { plane: { exploregraph: ok({ ok: true, centre: ENT, nodes: [{ id: ENT, ring: 0, label: "L. Chen", entity_kind: "person" }], steps: [], stopped: [] }) } });
  drew(secOf(none, "screen.person.connections"), "person.graph.none");
  assert.equal(button(none, "explore"), null);
});
