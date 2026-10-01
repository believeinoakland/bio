/* actions' T19 entries at its interface: N427 (R45's `contactNotAMember` and `contactId`, exported as R43's
   `noSuchAction` is) and R51 (the audit's action arm registered with record-core). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";

const A = "ACTN-2026-0001-a";
const M = V("alice");
const md = (id, lines) => actionMd(id, ["action_kind: other", ...CP, ...lines]);

test("R45 contactNotAMember is the one answer to a contact naming no member: fixed fields, its row C-117.11, one sentence; extra adds and never replaces; never throws", () => {
  const r = actions.contactNotAMember();
  const row = actions.ACTION_CATALOGUE_CHECKS.CONTACT_NOT_A_MEMBER;
  assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "CONTACT_NOT_A_MEMBER", "CONTACT_NOT_A_MEMBER",
    "C-117.11", row.translation]);
  assert.equal(row.where, "src/actions/index.mjs contactNotAMember > is-contact-member", "its row names the one site");
  assert.equal(typeof r.detail, "string"); assert.ok(r.detail.length > 20);
  const x = actions.contactNotAMember({ plan: "PLN-2026-0001", option: "o", reason: "OTHER", code: "X", check: "C-0",
                                        translation: "t", detail: "mine", ok: true });
  assert.deepEqual([x.plan, x.option, x.ok, x.reason, x.code, x.check, x.translation, x.detail],
    ["PLN-2026-0001", "o", false, "CONTACT_NOT_A_MEMBER", "CONTACT_NOT_A_MEMBER", "C-117.11", row.translation, r.detail]);
  assert.deepEqual(actions.contactNotAMember(["x"]), r, "an extra that is not an object adds nothing");
  assert.deepEqual(actions.contactNotAMember(null), r);
  const hostile = new Proxy({}, { ownKeys() { throw new Error("no"); } });
  assert.doesNotThrow(() => actions.contactNotAMember(hostile));
  assert.deepEqual(actions.contactNotAMember(hostile), r);
});

test("R45 the write answers CONTACT_NOT_A_MEMBER through contactNotAMember, asking contactId as a later module would", async () => {
  const w = world();
  assert.equal((await w.membership.memberAdd({ memberId: "carol", cover: "carol", role: "admin", by: MACHINE })).ok, true);
  const refused = w.promote(A, md(A, ["contact: member:nobody-here"]));
  const { ok, reason, code, check, translation, detail } = refused;
  assert.deepEqual({ ok, reason, code, check, translation, detail }, actions.contactNotAMember());
  assert.equal(w.record.head(A), null, "nothing was written");
  /* contactId: the stamp form and the bare id name one member; anything else is no id. */
  assert.deepEqual(["member:carol", " carol ", "", "   ", null, undefined, 7, {}].map(actions.contactId),
    ["carol", "carol", null, null, null, null, null, null]);
  for (const c of ["member:carol", "carol"]) {
    assert.ok(w.membership.memberFacts(actions.contactId(c)), c);
    assert.equal(w.promote(`ACTN-2026-000${c.length}-c`, md(`ACTN-2026-000${c.length}-c`, [`contact: ${c}`])).ok, true, c);
  }
  assert.equal(actions.contactId("member:nobody-here"), "nobody-here");
  assert.ok(!w.membership.memberFacts(actions.contactId("member:nobody-here")));
});

test("R51 the audit's action arm is registered with record-core's audit, with the instance's kinds", () => {
  const regs = [];
  const spy = (record) => new Proxy(record, { get(t, k) {
    if (k === "registerAuditCheck") return (name, fn) => { regs.push({ name, fn }); return t.registerAuditCheck(name, fn); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  const w = world({ recordAs: spy });
  const mine = regs.filter((r) => r.name === "actions");
  assert.equal(mine.length, 1, "registered once, under this module's name");
  const image = (text) => ({ files: new Map([["bundle.md", text]]) });
  /* the instance's kinds: the test profile's kind is no finding; a kind neither offered nor written before (R10) is. */
  assert.deepEqual(mine[0].fn(image(md(A, []).replace("action_kind: other", "action_kind: bylaw_complaint"))), []);
  assert.ok(mine[0].fn(image(md(A, []).replace("action_kind: other", "action_kind: harbour_petition")))
    .some((f) => f.check === "C-2.10" && /harbour_petition/.test(f.message)));
  /* every C-2.10 and C-11.1 finding over an action's document, through the registered arm */
  const f = mine[0].fn(image(actionMd(A, ["action_kind: other", "risk_tier: 9", "clock:", '  - text: "t"', '    description: "d"',
    "    date: 2020-01-01", "    basis: s", "    status: pending"])));
  for (const re of [/counterparty block is missing/, /risk_tier/]) assert.ok(f.some((x) => x.check === "C-2.10" && re.test(x.message)), String(re));
  assert.ok(f.some((x) => x.check === "C-11.1" && /past-due/.test(x.message)));
  assert.deepEqual(mine[0].fn(image(["---", "id: INFO-2026-0001-d", "object_type: information", "title: d", "---", ""].join("\n"))), [],
    "another document: nothing");
});
