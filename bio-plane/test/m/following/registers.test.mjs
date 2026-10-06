/* following R7–R9, R15: following a register, one behind an account or a fee, and a register query for a person. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, BOB, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";

const REG = "https://registry.ellery.example/permits";
const LIC = "https://licences.ellery.example/search?licence=L-00042";

test("R7 followRegister records a member switching a watch on; refusals as R1's and NO_LOCATOR; the tick re-reads a static register, re-renders through capture's render path when render is set, and otherwise says only its static form is followed", async () => {
  const w = world();
  assert.equal(w.f.followRegister({ address: REG, author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  for (const a of ["http://registry.ellery.example/p", "https://localhost/p", "https://10.0.0.1/p", "", null])
    assert.equal(w.f.followRegister({ address: a, author: MEMBER, viewer: MEMBER }).reason, "NO_LOCATOR", String(a));
  assert.equal(w.f.followRegister({ address: REG, author: MEMBER, viewer: MEMBER, cadence: "hourly" }).reason, "BAD_CADENCE");
  assert.equal(w.rows(`SELECT * FROM follows`).length, 0);
  const s = w.f.followRegister({ address: REG, author: MEMBER, viewer: MEMBER });
  assert.equal(s.ok, true);
  assert.equal(s.form, "static");
  const r = w.f.followRegister({ address: `${REG}/rendered`, render: true, author: MEMBER, viewer: MEMBER });
  assert.equal(r.form, undefined);
  w.serve(REG, "<table><tr><td>P-1</td></tr></table>");
  w.serve(`${REG}/rendered`, "<table><tr><td>P-9</td></tr></table>");
  const t = await w.f.followTick(T0);
  assert.equal(t.captured.length, 2);
  const opts = (a) => w.fetches.find((o) => o.captureRequest.locator === a).captureRequest;
  assert.equal(opts(REG).render, false);
  assert.equal(opts(`${REG}/rendered`).render, true);
  const stat = t.read.find((x) => x.follow === s.follow);
  assert.equal(stat.form, "static");
  assert.match(stat.note, /only its static form is followed/);
  const listed = w.f.follows({ viewer: MEMBER }).items.find((i) => i.follow === s.follow);
  assert.match(listed.note, /only its static form is followed/);
  /* the next day it is re-read; the same bytes land nothing new, changed ones are captured */
  w.serve(REG, "<table><tr><td>P-1</td></tr><tr><td>P-2</td></tr></table>");
  const t2 = await w.f.followTick(T0 + DAY);
  assert.deepEqual(t2.captured.map((c) => c.address), [REG]);
  assert.equal(t2.read.find((x) => x.follow === r.follow).outcome, "unchanged");
});

test("R8 a register behind an account, or fee-bearing, is never read on the tick (member_act_required, nothing fetched); refreshRegister is its member's own act, price shown first, what it brings marked not reproducible by the public", async () => {
  const w = world();
  assert.equal(w.f.followRegister({ address: REG, gated: { kind: "fee" }, author: MEMBER, viewer: MEMBER }).reason, "BAD_GATE");
  const acc = w.f.followRegister({ address: REG, gated: { kind: "account" }, author: MEMBER, viewer: MEMBER }).follow;
  const fee = w.f.followRegister({ address: `${REG}/paid`, gated: { kind: "fee", price: "$4.00 per search" }, author: MEMBER, viewer: MEMBER }).follow;
  const pub = w.f.followRegister({ address: `${REG}/open`, author: MEMBER, viewer: MEMBER }).follow;
  w.serve(REG, "account page");
  w.serve(`${REG}/paid`, "paid page");
  w.serve(`${REG}/open`, "open page");
  const t = await w.f.followTick(T0);
  assert.deepEqual(t.member_act_required.map((m) => [m.follow, m.gate]).sort(), [[acc, "account"], [fee, "fee"]]);
  assert.equal(t.member_act_required.find((m) => m.follow === fee).price, "$4.00 per search");
  assert.deepEqual(w.fetches.map((o) => o.captureRequest.locator), [`${REG}/open`], "nothing gated is fetched");
  assert.match(w.f.follows({ viewer: MEMBER }).items.find((i) => i.follow === acc).unscheduled, /member's own act/);
  /* the refresh: only the following member, with their own credential; a fee only once its price is accepted */
  const cred = { kind: "login", credential: "CRD-1", supplied_by: MEMBER };
  assert.equal((await w.f.refreshRegister({ follow: pub, author: MEMBER })).reason, "NOT_GATED");
  assert.equal((await w.f.refreshRegister({ follow: acc, author: BOB, credential: cred })).reason, "MEMBER_ACT_ONLY");
  assert.equal((await w.f.refreshRegister({ follow: acc, author: MACHINE, credential: cred })).reason, "MEMBER_ACT_ONLY");
  assert.equal((await w.f.refreshRegister({ follow: acc, author: MEMBER })).reason, "NO_CREDENTIAL");
  const shown = await w.f.refreshRegister({ follow: fee, author: MEMBER });
  assert.equal(shown.reason, "PRICE_FIRST");
  assert.equal(shown.price, "$4.00 per search");
  assert.equal(w.fetches.length, 1, "nothing fetched before the act is whole");
  const a = await w.f.refreshRegister({ follow: acc, author: MEMBER, credential: cred });
  assert.equal(a.ok, true);
  assert.equal(a.reproducible_by_public, false);
  const o = w.fetches.at(-1);
  assert.equal(o.cls, "member");
  assert.equal(o.sessMember, MEMBER);
  assert.deepEqual(o.captureRequest.credential, cred);
  assert.equal(w.landed.at(-1).filed.doc.capture.reproducible_by_public, false);
  assert.match(w.landed.at(-1).say.notes, /not reproducible by the public/);
  const f = await w.f.refreshRegister({ follow: fee, author: MEMBER, price: "$4.00 per search" });
  assert.equal(f.ok, true);
  assert.equal(w.landed.at(-1).filed.doc.capture.reproducible_by_public, false);
});

test("R9 followPersonQuery follows one register's own query for one identifier in a scheme the profile lists for that register; by name alone, across registers or in an unlisted scheme it is refused PERSON_QUERY_NOT_NAMED; a tick reads only that answer", async () => {
  const w = world();
  w.project("PRJ-2026-0001-a");
  w.bundle("INFO-2026-0002-a", { project: "PRJ-2026-0001-a" });
  const person = w.entity("A. Licensee", "person");
  const q = (x) => w.f.followPersonQuery({ register: "ellery.licences", scheme: "ellery_licence", value: "L-00042", address: LIC, person,
                                           home: "INFO-2026-0002-a", author: MEMBER, viewer: MEMBER, ...x });
  const no = [
    { value: "Alex Licensee" },                                   /* a name is not an identifier of the scheme */
    { value: "Alex Licensee", address: "https://licences.ellery.example/search?name=Alex%20Licensee" },
    { register: "ellery.legistar" },                              /* a register the scheme is not listed for */
    { register: null },                                           /* across registers */
    { scheme: "marlow_bar" },                                     /* a scheme the profile lists for no register */
    { scheme: "no_such_scheme" },
    { address: "https://elsewhere.example/search?licence=L-00042" },  /* not the register's own address */
    { address: "https://licences.ellery.example/search?licence=L-00043" },
    { home: null },
    { person: "ENT-2026-0999" },
  ];
  for (const x of no) assert.equal(q(x).reason, "PERSON_QUERY_NOT_NAMED", JSON.stringify(x));
  assert.equal(q({ author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  assert.equal(w.rows(`SELECT * FROM follows`).length, 0);
  const r = q({});
  assert.equal(r.ok, true);
  w.serve(LIC, '<p>L-00042 active; see <a href="https://licences.ellery.example/person/7">all records</a></p>');
  const t = await w.f.followTick(T0);
  assert.equal(t.captured.length, 1);
  assert.deepEqual(w.fetches.map((o) => o.captureRequest.locator), [LIC], "only the query's answer: no link out of it, no search elsewhere");
  /* fee-bearing or account-gated, it falls under R8 */
  const g = q({ value: "L-00077", address: "https://licences.ellery.example/search?licence=L-00077", gated: { kind: "account" } });
  const t2 = await w.f.followTick(T0 + 2 * DAY);
  assert.ok(t2.member_act_required.some((m) => m.follow === g.follow && m.kind === "person-query"));
  assert.ok(!w.fetches.some((o) => /L-00077/.test(o.captureRequest.locator)));
});

test("R15 nothing a member's credential or a fee would pay for is fetched unattended: no tick passes a credential or reads a gated subject", async () => {
  const w = world();
  w.f.followRegister({ address: REG, gated: { kind: "account" }, author: MEMBER, viewer: MEMBER });
  w.f.followRegister({ address: `${REG}/paid`, gated: { kind: "fee", price: "$1" }, author: MEMBER, viewer: MEMBER });
  w.f.followRegister({ address: `${REG}/open`, author: MEMBER, viewer: MEMBER });
  w.serve(REG, "a"); w.serve(`${REG}/paid`, "b"); w.serve(`${REG}/open`, "c");
  for (let d = 0; d < 4; d++) await w.f.followTick(T0 + d * DAY);
  assert.ok(w.fetches.length >= 1);
  for (const o of w.fetches) {
    assert.equal(o.cls, "daemon");
    assert.equal(o.captureRequest.credential, undefined);
    assert.equal(o.captureRequest.locator, `${REG}/open`);
  }
  /* only the member's own act carries a credential, and only from that member */
  assert.equal((await w.f.refreshRegister({ follow: 1, author: OUTSIDER, credential: { kind: "login" } })).reason, "MEMBER_ACT_ONLY");
});
