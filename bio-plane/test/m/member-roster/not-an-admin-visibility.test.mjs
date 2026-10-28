/* T13 (N324, N332): R28 `notAnAdmin`, the one site of NOT_AN_ADMIN, and every act of this module that refuses that
   condition answering through it. At the interface only. (R85 `visibilityOf` is `membership`'s.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { notAnAdmin } from "../../../src/member-roster/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const FIELDS = ["by", "check", "code", "detail", "ok", "reason", "translation"];
const ROW = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;
/* The fixed sentence around an act's phrase, read from the helper itself (a marker phrase splits it). */
const MARK = "\u0001act\u0001";
const [HEAD, TAIL] = notAnAdmin(null, MARK).detail.split(MARK);

/* A refusal answered through R84: its exact fields, its row, and the helper's own sentence around the act's phrase. */
function throughNotAnAdmin(r, by, label) {
  assert.deepEqual(Object.keys(r).sort(), FIELDS, `${label}: exactly R28's fields`);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
    [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", ROW.check, ROW.translation, by ?? null], label);
  assert.equal(HEAD, "", "the act's phrase opens the sentence");
  assert.ok(r.detail.endsWith(TAIL) && r.detail.length > TAIL.length, `${label}: the fixed sentence, naming its act`);
  const act = r.detail.slice(0, r.detail.length - TAIL.length);
  assert.deepEqual(r, notAnAdmin(by, act), `${label}: byte for byte notAnAdmin(by, act)`);
  return act;
}

/* Every table an administrator's act could write, read whole. */
const TABLES = ["members", "admin_votes", "hosting_access"];
const snapshot = (w) => Object.fromEntries(TABLES.map((t) => [t, w.rows(`SELECT * FROM ${t}`)]));

test("R28 notAnAdmin: {ok, reason, code, check, translation, by, detail}, the row C-96.1, by as stamped (null when none), one fixed sentence naming the act", () => {
  const act = word("member-roster.index.setting_a_members_status");
  const r = notAnAdmin("ann", act);
  assert.deepEqual(r, { ok: false, reason: "NOT_AN_ADMIN", code: "NOT_AN_ADMIN", check: "C-96.1",
                        translation: ROW.translation, by: "ann", detail: r.detail });
  assert.ok(r.detail.startsWith(`${act} `), "names the act");
  assert.equal(r.detail, word("membership.index.what_is_an_administrators_act", { what: act }), "the word table's sentence for the act");
  for (const by of [null, undefined]) assert.equal(notAnAdmin(by, "x").by, null, "null when none stamped");
  assert.equal(notAnAdmin(`${MACHINE_CLASS_PREFIX}member`, "x").by, `${MACHINE_CLASS_PREFIX}member`, "as stamped");
  /* One sentence for every caller: it varies with the act's phrase only. */
  assert.equal(notAnAdmin("ann", "x").detail, notAnAdmin("bob", "x").detail);
  assert.equal(notAnAdmin(null, "x").detail, notAnAdmin("admin", "x").detail);
  assert.deepEqual(notAnAdmin("ann", "x"), notAnAdmin("ann", "x"));
});

test("R28 notAnAdmin: extra adds a caller's own fields and never replaces R28's; it writes nothing and never throws", async () => {
  const r = notAnAdmin("ann", "pausing the daemon", { finding: "F-1", by: "bob", detail: "mine", check: "C-0",
                                                        ok: true, code: "X", reason: "Y", translation: "Z" });
  assert.deepEqual(r, { ...notAnAdmin("ann", "pausing the daemon"), finding: "F-1" });
  const hostile = {};
  Object.defineProperty(hostile, "boom", { enumerable: true, get() { throw new Error("no"); } });
  const plain = notAnAdmin("ann", "x");
  for (const extra of [null, undefined, [], ["a"], "text", 7, hostile])
    assert.deepEqual(notAnAdmin("ann", "x", extra), plain, `extra ${String(extra)} adds nothing`);
  for (const act of [null, undefined, "", "   ", 42, {}, ["a"]]) {
    const d = notAnAdmin("ann", act);
    assert.equal(d.reason, "NOT_AN_ADMIN");
    assert.ok(d.detail.endsWith(TAIL) && d.detail.length > TAIL.length, `an act given as ${String(act)} still reads`);
  }
  for (const by of [42, {}, [], true]) assert.doesNotThrow(() => notAnAdmin(by, "x"));
  const w = await world().group("ann");
  const before = snapshot(w);
  notAnAdmin("ann", "x", { a: 1 });
  assert.deepEqual(snapshot(w), before, "writes nothing");
});

test("R28 its one row is this module's C-96.1, its where naming notAnAdmin", () => {
  assert.deepEqual(Object.keys(ROW).sort(), ["check", "translation", "where"]);
  assert.equal(ROW.check, "C-96.1");
  assert.match(ROW.where, /^src\/member-roster\/index\.mjs notAnAdmin > /);
  assert.ok(Object.isFrozen(ROW));
});

test("R28 R3 R4 R6 R7 R8 R9 R16: each act's refusal of a caller who is not an administrator is notAnAdmin's, byte for byte, and writes nothing", async () => {
  const w = await world().group("ann");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "second" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  await w.m.memberAdd({ memberId: "gone", cover: "cg", by: "admin" });
  assert.equal(w.m.memberSet({ memberId: "gone", status: "revoked", by: "admin" }).ok, true);
  /* Who is not an administrator: an ordinary member, a revoked one, an id nobody holds; and, where the act admits
     neither, a missing stamp and a machine credential. */
  const members = ["ann", "gone", "ghost"];
  const acts = {
    R3: { by: [...members, null], run: (by) => w.m.adminEndorse({ memberId: "third", by }) },
    R4: { by: members, run: (by) => w.m.adminRemove({ memberId: "second", by, reason: "a reason" }) },
    R6: { by: [...members, null, `${MACHINE_CLASS_PREFIX}admin`],
          run: (by) => w.m.memberCaps({ memberId: "ann", capabilities: ["contribute"], by }) },
    R7: { by: [...members, null], run: (by) => w.m.adminResign({ by }) },
    R8: { by: [...members, null], run: (by) => w.m.hostingAccessSet({ holders: "someone", by }) },
    R9: { by: members, run: (by) => w.m.memberAdd({ memberId: "newbie", cover: "cn", by }) },
    R16: { by: members, run: (by) => w.m.memberSet({ memberId: "ann", status: "revoked", by }) },
  };
  const phrases = new Set();
  for (const [id, { by, run }] of Object.entries(acts)) {
    const seen = new Set();
    for (const b of by) {
      const before = snapshot(w);
      const r = await run(b);
      seen.add(throughNotAnAdmin(r, b, `${id} by ${b}`));
      assert.deepEqual(snapshot(w), before, `${id} by ${b}: nothing written`);
    }
    assert.equal(seen.size, 1, `${id}: one fixed phrase for its act, whoever asks`);
    phrases.add([...seen][0]);
  }
  assert.equal(phrases.size, Object.keys(acts).length, "each act names itself");
});

test("R28: who is admitted stays each act's own rule: the founder's resignation is ROOT_OF_TRUST first, a machine credential adds a member, an administrator passes", async () => {
  const w = await world().group("ann");
  assert.equal(w.m.adminResign({ by: "admin" }).reason, "ROOT_OF_TRUST");
  assert.equal((await w.m.memberAdd({ memberId: "carl", cover: "cc", by: `${MACHINE_CLASS_PREFIX}admin` })).ok, true);
  assert.equal(w.m.memberCaps({ memberId: "ann", capabilities: ["publish"], by: "second" }).ok, true);
  assert.equal(w.m.hostingAccessSet({ holders: "the two of us", by: "admin" }).ok, true);
  /* K5562 (R84): at two, where a vote could not, the founder's own act removes alone */
  assert.equal(w.m.adminRemove({ memberId: "second", by: "admin", reason: "r" }).alone, true);
});
