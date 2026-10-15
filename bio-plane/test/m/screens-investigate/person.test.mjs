/* screens-investigate R1: a person the record follows, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, ADMIN } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, PERSON, ENT, ORG, SHA, word, drew, notDrew, dayOf } from "./fixtures.mjs";

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
  assert.ok(s.textContent.includes("ENT-2026-0019"));
  drew(s, "screen.person.same.claimed");
  drew(s, "screen.person.candidates");
  const fieldState = (f, st) => word("screen.person.field." + f) + ": " + word("screen.person.state." + st);
  assert.ok(s.textContent.includes([fieldState("names", "agrees"), fieldState("identifiers", "absent"), fieldState("posts", "differs")].join(" · ")));
});

test("R1 the acts as drawn for a member: person, explore, recordpersonfact, identityclaim, withdrawidentityclaim, followregister; personexpunge only for an administrator (interface-shell R47)", async () => {
  const p = await open(at);
  assert.deepEqual(actsIn(main(p)).sort(), ["explore", "followregister", "identityclaim", "person", "recordpersonfact", "withdrawidentityclaim"]);
  const q = await open(at, admin);
  assert.ok(actsIn(main(q)).includes("personexpunge"));
});

test("R1 Open the person reads it again; Explore connections opens explore from this person", async () => {
  const p = await open(at);
  await press(p, "person");
  assert.ok(p.byOp("person").length >= 2);
  await press(p, "explore");
  assert.equal(p.location.pathname, "/app/explore/" + ENT);
});

test("R1 recordpersonfact: a fact read from the passage the member names, citing it (control: no passage sends nothing)", async () => {
  const p = await open(at, { plane: { recordpersonfact: ok({ ok: true, fact_id: "PFA-2026-0010" }) } });
  fill(p, { "person-fact-kind": "locality", "person-fact-value": "Lakeshore", "person-fact-from": "2024-01-01", "person-fact-sha": SHA, "person-fact-page": "4" });
  await press(p, "recordpersonfact");
  assert.deepEqual(p.byOp("recordpersonfact")[0].body, { person: ENT, kind: "locality", value: "Lakeshore", valid: { from: "2024-01-01", to: null },
    citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 3 } } });
  const q = await open(at);
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
  fill(q, { "person-claim-other": "ENT-2026-0019", "person-claim-basis": "name", "person-claim-sha-a": SHA, "person-claim-sha-b": SHA, "person-claim-note": "same name" });
  await press(q, "identityclaim");
  assert.equal(q.byOp("identityclaim")[0].body.evidence.a.captureSha, SHA);
  assert.ok(main(q).textContent.includes("That basis does not earn this grade."), "the refusal by its words");
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
  const day = /\d+ \w+ \d{4}/.exec(d.querySelector(".ends").textContent)[0];
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
  for (const [kind, why, by, day] of [["same_as", "both hold the Deputy Director post", "dev", "2026-10-03"], ["unsure", "the same surname", "mai", "2026-10-04"]]) {
    drew(m, "screen.person.claim." + kind);
    assert.ok(m.textContent.includes(why), "its why, as the member wrote it");
    drew(m, "screen.person.claim.by", { by, date: dayOf(day) });
  }
  assert.equal(m.querySelectorAll("*").filter((e) => e.getAttribute("id") === "person-claim-id").length, 0, "no field asks for a claim id");
  await press(p, "withdrawidentityclaim", { el: buttons[0], reason: "different middle initial" });
  assert.deepEqual(p.byOp("withdrawidentityclaim")[0].body, { claimId: "IDC-2026-0001", reason: "different middle initial" });
  const after = main(p).querySelectorAll('button[data-act="withdrawidentityclaim"]');
  assert.deepEqual(after.map((b) => b.getAttribute("data-claim")), ["IDC-2026-0002"], "the other claim is still drawn");
  const hidden = await open(at, { plane: { person: ok(PERSON({ claims: [] })) } });
  assert.equal(main(hidden).querySelectorAll('button[data-act="withdrawidentityclaim"]').length, 0, "a claim person does not answer is not drawn");
});
