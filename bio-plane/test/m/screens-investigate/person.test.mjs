/* screens-investigate R1: a person the record follows, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ok, refusedIn, ADMIN, MEMBER } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, ENT, ORG, SHA } from "./fixtures.mjs";

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
  const pos = secs.find((s) => /Positions/.test(s.querySelector("h2").textContent));
  assert.match(pos.textContent, /Director of Public Works · employee · since 1 March 2022/);
  assert.equal(pos.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]).join(), "connection,B");
  assert.ok(pos.querySelector(`[data-tip*="page 1"]`), "the position cites its passage");
  const facts = secs.find((s) => /Career/.test(s.querySelector("h2").textContent));
  assert.match(facts.textContent, /Where they live or work · Oakview district/);
  assert.equal(facts.querySelector(".cs-grade").textContent.slice(-1), "B");
  assert.ok(facts.querySelector('[data-tip*="page 3"]'));
});

test("R1 same person? the cluster's other records linked as claimed (never merged) and the candidates, which are not claims", async () => {
  const p = await open(at);
  const s = main(p).querySelectorAll("section").find((x) => /Same person/.test(x.querySelector("h2").textContent));
  assert.match(s.textContent, /ENT-2026-0019.*claimed the same person; the records stay linked, never merged/s);
  assert.match(s.textContent, /These are not claims: a member decides/);
  assert.match(s.textContent, /names: agree · identifiers: not recorded · posts: differ/);
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
  assert.match(main(p).textContent, /claimed the same person, grade D/);
  const mine = main(p).querySelectorAll('button[data-act="withdrawidentityclaim"]').find((b) => b.getAttribute("data-claim") === "IDC-2026-0003");
  await press(p, "withdrawidentityclaim", { el: mine, reason: "different middle initial" });
  assert.deepEqual(p.byOp("withdrawidentityclaim")[0].body, { claimId: "IDC-2026-0003", reason: "different middle initial" });
  const q = await open(at, { plane: { identityclaim: refusedIn("IDENTITY_GRADE_UNEARNED", "That basis does not earn this grade.") } });
  fill(q, { "person-claim-other": "ENT-2026-0019", "person-claim-basis": "name", "person-claim-sha-a": SHA, "person-claim-sha-b": SHA, "person-claim-note": "same name" });
  await press(q, "identityclaim");
  assert.equal(q.byOp("identityclaim")[0].body.evidence.a.captureSha, SHA);
  assert.match(main(q).textContent, /That basis does not earn this grade\./);
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
  assert.match(d.textContent, /This removes the value for good.*It cannot be undone, by you or by anyone\..*by rosa/s);
  assert.match(d.textContent, /Removed where the law requires, \d+ \w+ \d{4}, by rosa/);
  const statement = JSON.parse(JSON.stringify((await import("../../../src/op-grades/index.mjs")).CONSEQUENCE_STATEMENTS.personexpunge.statement));
  assert.equal(d.querySelector(".ends").textContent.replace(/\d+ \w+ \d{4}/, "<date>").replace("by rosa", "by <member>"), statement, "the statement as op-grades words it");
  const b = button(p, "personexpunge");
  assert.match(b.textContent, /Irreversible/);
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
