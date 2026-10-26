/* R80, R81 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. The door puts the stamps in the address and the
   fields in the body; a fresh store is built for each call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS } from "../../../src/member-roster/index.mjs";
import { world, threeAdmins } from "./fixture.mjs";

const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a refusal names a field by the code its owner refuses that field with (strict: no sentence is searched) */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object"
  && (codes[field] || []).some((c) => answer.code === c || answer.reason === c);

/* the call as the door runs it over a fresh store: `scene(w)` makes it, `stamps(w)` the address, `real` turns a sample into
   what the store holds (an invitation, a link), `body` adds what the plane puts in the body for this op */
const mk = (op, { scene = () => world().group("ann"), stamps = {}, real = {}, body = () => ({}) }) => async (given) => {
  const w = await scene();
  const fields = Object.fromEntries(Object.entries(given).map(([k, v]) => [k, k in real ? real[k](w, v) : v]));
  const q = new URLSearchParams(typeof stamps === "function" ? stamps(w) : stamps).toString();
  return await w.ops(q, { ...fields, ...body(w) })[op]();
};
const invited = async () => { const w = await world().group(); const a = await w.m.memberAdd({ memberId: "newbie", cover: "A cover", by: "admin" }); w.invite = a.invite; return w; };
const fourAdmins = async () => {
  const w = await threeAdmins();
  await w.m.memberAdd({ memberId: "fourth", cover: "c", role: "admin", by: "admin" });
  await w.m.adminEndorse({ memberId: "fourth", by: "second" });
  const done = await w.m.adminEndorse({ memberId: "fourth", by: "third" });
  await w.m.enroll({ invite: done.invite, handle: "fourth", password: "fourth-passphrase-x" });
  return w;
};
const holds = (op, call, codes, extra = {}) => declaredOpHolds({ op, declaration: DECLARED_OPS[op], call,
  refusedNaming: named(codes), same: sameCode, ...extra });
const BY_ADMIN = { by: "admin", viewer: "admin" };

const CASES = {
  adminendorse: { id: "R80", call: mk("adminendorse", { scene: async () => { const w = await world().group(); await w.m.memberAdd({ memberId: "third", cover: "c", role: "admin", by: "admin" }); return w; }, stamps: { by: "second" } }),
    codes: { memberId: ["NO_SUCH_MEMBER"] }, values: { memberId: "third" } },
  expertiseconfirm: { id: "R80", call: mk("expertiseconfirm", { scene: async () => { const w = await world().group("ann"); w.m.expertiseDeclare({ memberId: "ann", label: "CPA" }); return w; }, body: () => ({ by: "admin" }) }),
    codes: { memberId: ["NO_SUCH_MEMBER"], label: ["NOT_DECLARED"] }, values: { memberId: "ann", label: "CPA" } },
  expertisedeclare: { id: "R80", call: mk("expertisedeclare", { body: () => ({ memberId: "ann" }) }),
    codes: { label: ["EXPERTISE_NO_LABEL"] }, values: { label: "CPA" } },
  expertisewithdraw: { id: "R80", call: mk("expertisewithdraw", { scene: async () => { const w = await world().group("ann"); w.m.expertiseDeclare({ memberId: "ann", label: "CPA" }); w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" }); return w; }, stamps: { by: "second" } }),
    codes: { memberId: ["NO_SUCH_MEMBER"], label: ["NOT_DECLARED"], reason: ["NO_REASON"] }, values: { memberId: "ann", label: "CPA", reason: "the licence lapsed" } },
  memberpairingset: { id: "R80", call: mk("memberpairingset", { stamps: { by: "ann" } }),
    codes: { memberId: ["NO_SUCH_MEMBER"] }, values: { memberId: "ann", published: true } },
  adminremove: { id: "R81", call: mk("adminremove", { scene: fourAdmins, stamps: { by: "second" } }),
    codes: { memberId: ["NO_SUCH_MEMBER"], reason: ["NO_REASON"] }, values: { memberId: "third", reason: "lost trust" } },
  courtnoticeset: { id: "R81", call: mk("courtnoticeset", { stamps: BY_ADMIN }),
    codes: { choice: ["COURT_NOTICE_UNKNOWN_CHOICE"] }, values: { choice: "tell" } },
  enroll: { id: "R81", call: mk("enroll", { scene: invited, real: { invite: (w) => w.invite } }),
    codes: { invite: ["NO_SUCH_INVITATION"], handle: ["NO_HANDLE"], password: ["PASSWORD_TOO_SHORT"] }, values: { handle: "newbie", password: "a-long-enough-passphrase" } },
  founderhandleset: { id: "R81", call: mk("founderhandleset", { scene: async () => { const w = world(); await w.claim(); return w; }, stamps: BY_ADMIN }),
    codes: { handle: ["NO_HANDLE"] }, values: { handle: "steward" } },
  groupdescriptionset: { id: "R81", call: mk("groupdescriptionset", { stamps: BY_ADMIN }),
    codes: { kinds: ["GROUP_KIND_UNKNOWN"] }, values: { kinds: ["issue"] } },
  handlecheck: { id: "R81", call: mk("handlecheck", { scene: invited, real: { invite: (w) => w.invite } }),
    codes: { invite: ["NO_SUCH_INVITATION"] }, values: { handle: "newbie" } },
  hostingaccessset: { id: "R81", call: mk("hostingaccessset", { stamps: BY_ADMIN }),
    codes: { holders: ["NO_HOLDERS"] }, values: { holders: "the founder" } },
  invitelook: { id: "R81", call: mk("invitelook", { scene: invited, real: { invite: (w) => w.invite } }),
    codes: { invite: ["NO_SUCH_INVITATION"] } },
  invitewithdraw: { id: "R81", call: mk("invitewithdraw", { scene: invited, stamps: BY_ADMIN }),
    codes: { memberId: ["NO_SUCH_MEMBER"] }, values: { memberId: "newbie" } },
  joinlinkenable: { id: "R81", call: mk("joinlinkenable", { stamps: BY_ADMIN }),
    codes: { dailyCap: ["BAD_DAILY_CAP"] }, values: { dailyCap: 5 } },
  joinlinkinvite: { id: "R81", call: mk("joinlinkinvite", { scene: async () => { const w = await world().group(); w.link = w.m.joinLinkEnable({ dailyCap: 5, by: "admin" }).link; return w; }, real: { link: (w) => w.link } }),
    codes: { link: ["NO_SUCH_JOIN_LINK"], cover: ["NO_COVER"] }, values: { cover: "A cover" } },
  memberadd: { id: "R81", call: mk("memberadd", { stamps: BY_ADMIN }),
    codes: { memberId: ["BAD_MEMBER_ID"], cover: ["NO_COVER"], expertise: ["EXPERTISE_IS_NOT_ASSIGNED"] }, values: { memberId: "newcomer", cover: "A cover" },
    outside: ["undeclared_field_memberadd", "expertise"] },
  membercaps: { id: "R81", call: mk("membercaps", { stamps: BY_ADMIN }),
    codes: { memberId: ["NO_SUCH_MEMBER"], capabilities: ["BAD_CAPABILITY"] }, values: { memberId: "ann", capabilities: ["publish"] } },
  memberset: { id: "R81", call: mk("memberset", { stamps: BY_ADMIN }),
    codes: { memberId: ["NO_SUCH_MEMBER"], status: ["BAD_STATUS"] }, values: { memberId: "ann", status: "revoked" } },
  websitekeycreate: { id: "R81", call: mk("websitekeycreate", { stamps: BY_ADMIN }),
    codes: { dailyCap: ["BAD_DAILY_CAP"] }, values: { dailyCap: 5 } },
};

for (const [op, c] of Object.entries(CASES))
  test(`${c.id} member-roster declares ${op}: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused`, async () => {
    await holds(op, c.call, c.codes, { values: c.values ?? {}, ...(c.outside ? { outside: c.outside } : {}) });
  });

test("R80 R81 DECLARED_OPS declares exactly the ops of R80 and R81, each with the whole row, frozen", () => {
  const r80 = ["adminendorse", "expertiseconfirm", "expertisedeclare", "expertisewithdraw", "memberpairingset"];
  assert.deepEqual(Object.keys(CASES).filter((o) => CASES[o].id === "R80").sort(), r80);
  assert.equal(Object.keys(DECLARED_OPS).length, Object.keys(CASES).length, "R81's ops are the rest, and nothing else is declared");
  for (const op of Object.keys(CASES)) assert.ok(DECLARED_OPS[op], op);
  assert.ok(Object.isFrozen(DECLARED_OPS));
  for (const [op, d] of Object.entries(DECLARED_OPS)) {
    assert.deepEqual(Object.keys(d.fields).sort(), ["accepts", "requires"], op);
    assert.equal(typeof d.mutating, "boolean", op);
    assert.ok(typeof d.weight === "string" && d.weight, op);
    assert.ok(typeof d.description === "string" && d.description, op);
    assert.ok(d.classes === null || Array.isArray(d.classes), op);
    for (const r of d.fields.requires) for (const f of [r].flat()) assert.ok(d.fields.accepts.includes(f), `${op}: ${f} is required, so accepted`);
  }
  assert.equal(DECLARED_OPS.expertisewithdraw.refusal, "NO_REASON");
  assert.deepEqual(DECLARED_OPS.expertisewithdraw.stamps, ["viewer", "by"]);
});

test("R80 expertiseconfirm accepts withdraw: with withdraw: true it is accepted by the declaration and withdraws as before", async () => {
  assert.ok(DECLARED_OPS.expertiseconfirm.fields.accepts.includes("withdraw"));
  assert.ok(!DECLARED_OPS.expertiseconfirm.fields.requires.flat().includes("withdraw"));
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  const r = await w.ops("", { memberId: "ann", label: "CPA", by: "second", withdraw: true }).expertiseconfirm();
  assert.deepEqual([r.ok, r.state], [true, "withdrawn"]);
});

/* the ids the descriptions are localized under, each named here (K874); `expertisewithdraw`'s is the design's key */
const DESCRIPTION_IDS = [
  "member-roster.declared.adminendorse",
  "member-roster.declared.adminremove",
  "member-roster.declared.courtnoticeset",
  "member-roster.declared.enroll",
  "member-roster.declared.expertiseconfirm",
  "member-roster.declared.expertisedeclare",
  "member-roster.declared.founderhandleset",
  "member-roster.declared.groupdescriptionset",
  "member-roster.declared.handlecheck",
  "member-roster.declared.hostingaccessset",
  "member-roster.declared.invitelook",
  "member-roster.declared.invitewithdraw",
  "member-roster.declared.joinlinkenable",
  "member-roster.declared.joinlinkinvite",
  "member-roster.declared.memberadd",
  "member-roster.declared.membercaps",
  "member-roster.declared.memberpairingset",
  "member-roster.declared.memberset",
  "member-roster.declared.websitekeycreate",
];

test("R80 R81 the words of the declarations: expertisewithdraw's description is the design's key, the others are English localized once under their own ids", () => {
  assert.equal(DECLARED_OPS.expertisewithdraw.description, "act.owed_expertisewithdraw.does");
  assert.deepEqual(DESCRIPTION_IDS.map((id) => id.slice("member-roster.declared.".length)).sort(),
    Object.keys(DECLARED_OPS).filter((o) => o !== "expertisewithdraw").sort(), "one id for each of the other ops, no more");
  for (const op of Object.keys(DECLARED_OPS).filter((o) => o !== "expertisewithdraw")) {
    const d = DECLARED_OPS[op].description;
    assert.ok(typeof d === "string" && d.length > 10 && d !== `member-roster.declared.${op}`, `${op}: the words, not the id`);
    assert.equal(d.includes("{"), false, `${op}: no placeholder`);
  }
});
