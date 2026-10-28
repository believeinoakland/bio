/* mail-door R1 and R12's settings: a member's private address, off by default. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, addressFor, plain, DOMAIN } from "./fixture.mjs";
import { LOCAL_PART } from "../../../src/mail-door/index.mjs";
import { MAIL_CHECKS } from "../../../src/mail-door/checks.mjs";

const dump = (rows) => JSON.stringify(rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => [r.name, rows(`SELECT * FROM ${r.name}`)]));

test("R1 two members get two addresses, each `m-` and 12 characters under the team's mail domain, and each reads only her own", async () => {
  const { d } = fresh();
  const a = await addressFor(d, "ann"), b = await addressFor(d, "bo");
  const shape = new RegExp(`^${LOCAL_PART.prefix}[0-9a-hjkmnp-tv-z]{${LOCAL_PART.chars}}@${DOMAIN.replace(/\./g, "\\.")}$`);
  assert.match(a, shape); assert.match(b, shape);
  assert.notEqual(a, b);
  assert.equal((await d.mailAddressOf({ viewer: "member:ann" })).address, a);
  assert.equal((await d.mailAddressOf({ viewer: "member:bo" })).address, b);
  /* a second member's read of the first's address answers nothing */
  assert.deepEqual(await d.mailAddressOf({ member: "ann", viewer: "member:bo" }), { ok: true, address: null });
});

test("R1 a new address turns the old one off in the same act; mail to the old one is refused as to an unknown one", async () => {
  const { d } = fresh();
  const old = await addressFor(d, "ann");
  const now = await addressFor(d, "ann");
  assert.notEqual(old, now);
  assert.equal((await d.mailAddressOf({ viewer: "member:ann" })).address, now);
  assert.equal((await d.receiveMail({ raw: plain(), envelope_to: old })).reason, "MAIL_NO_SUCH_ADDRESS");
  assert.equal((await d.receiveMail({ raw: plain(), envelope_to: now })).ok, true);
  assert.deepEqual(d.mailAddressOff({ by: "member:ann" }), { ok: true, off: true });
  assert.deepEqual(await d.mailAddressOf({ viewer: "member:ann" }), { ok: true, address: null });
  assert.deepEqual(d.mailAddressOff({ by: "member:ann" }), { ok: true, off: false });
});

test("R1 a machine identity, an absent stamp and `member:` alone are refused MEMBER_SESSION_REQUIRED, nothing written", async () => {
  const { d, rows } = fresh();
  const before = dump(rows);
  for (const by of ["token:member", "class:admin", "daemon", null, "", "member:", "   "]) {
    assert.equal((await d.mailAddressMake({ by })).reason, "MEMBER_SESSION_REQUIRED", String(by));
    assert.equal(d.mailAddressOff({ by }).reason, "MEMBER_SESSION_REQUIRED", String(by));
    assert.equal((await d.mailAddressOf({ viewer: by })).reason, "MEMBER_SESSION_REQUIRED", String(by));
  }
  assert.equal(dump(rows), before);
});

test("R1 no table row, answer of the door or log line holds the clear address, and none holds a member's own email address", async () => {
  const { d, rows, cap } = fresh();
  const logs = [];
  const keep = [console.log, console.info, console.warn, console.error];
  console.log = console.info = console.warn = console.error = (...a) => logs.push(a.map(String).join(" "));
  try {
    const addr = await addressFor(d, "ann");
    const own = "ann.personal@example.net";
    const r = await d.receiveMail({ raw: plain("tip"), envelope_to: addr, envelope_from: own });
    assert.equal(r.ok, true);
    const w = d.mailWaiting({ viewer: "member:ann" });
    const all = dump(rows) + JSON.stringify(r) + JSON.stringify(w) + logs.join("\n");
    assert.equal(all.includes(addr), false, "the clear address is held nowhere");
    assert.equal(all.toLowerCase().includes(addr.split("@")[0]), false, "nor its local part");
    assert.equal(all.includes(own), false, "nor the member's own address");
    assert.equal(rows(`SELECT * FROM mail_address`).length, 1);
    assert.equal(cap.env.CAPTURES.held.size, 1);
  } finally { [console.log, console.info, console.warn, console.error] = keep; }
});

test("R1 R12 control: with no mail domain set, or the door switched off, making an address is refused MAIL_NOT_SET_UP with its row", async () => {
  for (const s of [{ domain: null }, { domain: "" }, { on: false }]) {
    const { d, rows } = fresh(s);
    const before = dump(rows);
    const r = await d.mailAddressMake({ by: "member:ann" });
    assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, "MAIL_NOT_SET_UP", MAIL_CHECKS.MAIL_NOT_SET_UP.check, MAIL_CHECKS.MAIL_NOT_SET_UP.translation]);
    assert.equal(dump(rows), before);
  }
});

test("R1 `within` runs inside the act: its refusal rolls the new address back and the old one stays live; a throw is MAIL_WITHIN_FAILED", async () => {
  const { d } = fresh();
  const old = await addressFor(d, "ann");
  // fixtures-own: input the caller's own act refusing inside the address act, no module's answer
  const no = await d.mailAddressMake({ by: "member:ann", within: () => ({ ok: false, reason: "NO" }) });
  assert.deepEqual([no.ok, no.reason], [false, "NO"]);
  assert.equal((await d.mailAddressOf({ viewer: "member:ann" })).address, old);
  const boom = await d.mailAddressMake({ by: "member:ann", within: () => { throw new Error("x"); } });
  assert.equal(boom.reason, "MAIL_WITHIN_FAILED");
  assert.equal((await d.mailAddressOf({ viewer: "member:ann" })).address, old);
  const yes = await d.mailAddressMake({ by: "member:ann", within: (a) => ({ seen: a.member }) });
  assert.deepEqual(yes.within, { seen: "ann" });
});
