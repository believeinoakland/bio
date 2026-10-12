/* What holds across the four screens: R8 (after an act answers, the screen reads again what it changes and draws it;
   nothing is drawn as done before the answer) and R10 (no key, code or password typed on these screens is written to
   the browser's storage, an address or a later request), driven over every act of every screen. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, all } from "./kit.mjs";
import { ADMIN, MEMBER, membersTable, accountTable, connectTable, notesTable, env } from "./fixtures.mjs";

const SECRET = "SENTINEL-SECRET-0123456789";

/* Every act of every screen, pressed so that it is sent: [screen, op, {data, values, reason}, table, me, reachable]. */
const PRESSES = [
  ["members", "memberadd", { values: { "mi-id": "x1", "mi-cover": "X", "mi-cap-contribute": true } }],
  ["members", "membercaps", { data: { member: "dev" }, values: { "mc-dev-contribute": true } }],
  ["members", "memberset", { data: { member: "dev", status: "revoked" } }],
  ["members", "adminendorse", { data: { member: "kim" } }],
  ["members", "adminremove", { data: { member: "lu" }, values: { "mr-lu": "away" } }],
  ["members", "expertiseconfirm", { data: { member: "ana", label: "CPA" } }],
  ["members", "invitewithdraw", { data: { member: "mai-k" } }],
  ["members", "websitekeycreate", { values: { "mw-cap": "4" } }],
  ["members", "joinlinkenable", { values: { "mw-cap": "4" } }],
  ["members", "groupkeyset", { values: { "mk-key": SECRET } }],
  ["members", "groupkeyswitch", { data: { on: "off" } }],
  ["members", "groupkeyremove", {}],
  ["members", "accountusesset", { data: { sw: "ask", to: "off" } }],
  ["members", "ailimitset", { data: { remove: "" }, values: { "aig-scope": "overall", "aig-amount": "9", "aig-unit": "calls", "aig-period": "day" } }],
  ["members", "aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "why" } }],
  ["account", "memberlanguageset", { values: { "ma-lang": "es" } }],
  ["account", "infolevelset", { values: { "ma-level": "pause" } }],
  ["account", "expertisedeclare", { values: { "ma-exp": "Law" } }],
  ["account", "setpassword", { values: { "ma-cur": SECRET + "-old", "ma-new": SECRET, "ma-again": SECRET } }],
  ["account", "signerregisterown", { values: { "ma-pub": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK x" } }],
  ["account", "signerrevokeown", { data: { key: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001" } }],
  ["connect", "groupkeynoticeseen", {}, "group"],
  ["connect", "disclosureshown", { data: { version: "D311-1" } }, "none"],
  ["connect", "subscriptionsignin", { data: { step: "code" }, values: { "mc-code": SECRET } }, "none"],
  ["connect", "accountreferenceset", { values: { "mc-key": SECRET } }, "none"],
  ["connect", "accountusesset", { data: { sw: "ask", to: "off" } }, "own"],
  ["connect", "ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "9", "aio-unit": "calls", "aio-period": "day" } }, "own"],
  ["connect", "accountreferenceremove", {}, "own"],
  ["connect", "subscriptiondisconnect", {}, "subscription"],
  ["notes", "notewrite", { values: { "mn-new": "n" } }],
  ["notes", "noterevise", { data: { note: "2" }, values: { "mn-r2": "n" } }],
  ["notes", "notedelete", { data: { note: "2" } }],
  ["notes", "noteturn", { data: { note: "2" }, values: { "mn-observation2": true, "mn-made2": "OBS-1" } }],
  ["notes", "writinghelp", { data: { field: "new", id: "mn-new" }, values: { "mn-new": "n" } }],
];
const tableOf = (screen, situation, over) => ({ members: () => membersTable(over), account: () => accountTable(ADMIN, over), connect: () => connectTable(MEMBER, situation || "group", over), notes: () => notesTable(ADMIN, over) })[screen]();
const meOf = (screen) => (screen === "connect" ? MEMBER : ADMIN);

/* The reads an act changes (R8), named by what each owner's act writes. */
const CHANGES = {
  memberadd: ["roster"], membercaps: ["roster"], memberset: ["roster"], adminendorse: ["roster"], adminremove: ["roster"], expertiseconfirm: ["roster", "expertise"],
  invitewithdraw: ["roster"], websitekeycreate: [], joinlinkenable: [], groupkeyset: ["groupkey"], groupkeyswitch: ["groupkey"], groupkeyremove: ["groupkey", "uses"],
  accountusesset: ["uses", "history"], ailimitset: ["limits"], aikeepaway: ["keepaway"], memberlanguageset: ["language"], infolevelset: ["level"], expertisedeclare: ["expertise"],
  setpassword: [], signerregisterown: ["signers"], signerrevokeown: ["signers"], groupkeynoticeseen: ["notice"], disclosureshown: ["disclosure"],
  subscriptionsignin: ["signin", "reference"], accountreferenceset: ["reference", "uses"], accountreferenceremove: ["reference", "uses"], subscriptiondisconnect: ["signin", "reference"],
  notewrite: ["notes"], noterevise: ["notes"], notedelete: ["notes"], noteturn: ["notes"], writinghelp: [],
};

test("R8 every act of every screen, once answered, reads again what it changes and draws it", async () => {
  for (const [screen, op, press, situation] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation), subject: screen === "members" ? "ana" : null, reachable: true });
    const spec = o.s.acts.find((a) => a.op === op);
    for (const r of CHANGES[op]) assert.ok((spec.rereads || Object.keys(o.s.reads(o.view))).includes(r), `${screen} ${op} re-reads ${r}`);
    const r = await o.press(op, press);
    assert.ok(r.sent.length >= 1 && !r.refused, `${screen} ${op} sent`);
    const reread = r.sent.slice(1).map((x) => x.op);
    const reads = o.s.reads(o.view);
    for (const name of CHANGES[op]) if (reads[name]) assert.ok(reread.includes(reads[name].op), `${screen} ${op}: ${name} (${reads[name].op}) read again`);
  }
});

test("R8 nothing is drawn as done before the answer: while an act has not answered, the screen is unchanged", async () => {
  for (const [screen, op, press, situation] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, { [op]: "pending" }), subject: screen === "members" ? "ana" : null, reachable: true });
    const before = o.html;
    o.press(op, press);
    await new Promise((res) => setTimeout(res, 2));
    assert.equal(o.html, before, `${screen} ${op}`);
  }
});

test("R10 no key, code or password typed is drawn again, put in an address, or sent in a later request; nothing is written to the browser's storage", async () => {
  const touched = [];
  const trap = (name) => Object.defineProperty(globalThis, name, { configurable: true, get() { touched.push(name); return { setItem() { touched.push(name + ".setItem"); }, getItem() { return null; } }; } });
  for (const n of ["localStorage", "sessionStorage", "indexedDB", "document", "location", "history"]) trap(n);
  try {
    for (const [screen, op, press, situation] of PRESSES.filter((p) => JSON.stringify(p[2]).includes(SECRET))) {
      for (const answer of ["ok", "refused"]) {
        const over = answer === "refused" ? { [op]: env({ ok: false, reason: "REFUSED", code: "REFUSED" }) } : {};
        const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, over), reachable: true });
        const r = await o.press(op, press);
        const at = o.p.requests.indexOf(r.sent[0]);
        assert.ok(JSON.stringify(r.sent[0].body).includes(SECRET), `${screen} ${op}: in the body`);
        assert.ok(!JSON.stringify(r.sent[0].query).includes(SECRET), `${screen} ${op}: never in the address`);
        assert.ok(!o.p.requests.slice(at + 1).some((x) => JSON.stringify(x).includes(SECRET)), `${screen} ${op} (${answer}): never in a later request`);
        assert.ok(!o.html.includes(SECRET), `${screen} ${op} (${answer}): never drawn`);
        assert.ok(!all(o.tree, (e) => e.tag === "a" && String(e.attrs.href).includes(SECRET)).length);
        assert.ok(!JSON.stringify(o.view.ui).includes(SECRET), `${screen} ${op}: not kept`);
      }
    }
  } finally {
    for (const n of ["localStorage", "sessionStorage", "indexedDB", "document", "location", "history"]) delete globalThis[n];
  }
  assert.deepEqual(touched, [], "no screen function reaches the browser's storage, document, address or history");
});
