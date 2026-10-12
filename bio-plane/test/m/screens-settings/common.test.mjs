/* What holds across the four screens: R8 (after an act answers, the screen reads again what it changes and draws it;
   nothing is drawn as done before the answer) and R10 (no key, code or password typed on these screens is written to
   the browser's storage, an address or a later request), driven over every act of every screen. */
import test from "node:test";
import assert from "node:assert/strict";
import { all, day, has, lacks, open, panelOf, rowOf } from "./kit.mjs";
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
  ["members", "groupkeyset", { values: { "mk-key0": SECRET } }],
  ["members", "groupkeyswitch", { data: { on: "off" } }],
  ["members", "groupkeyremove", {}],
  ["members", "accountusesset", { data: { sw: "ask", to: "off" } }],
  ["members", "ailimitset", { data: { remove: "" }, values: { "aig-scope": "overall", "aig-amount": "9", "aig-unit": "calls", "aig-period": "day" } }],
  ["members", "aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "why" } }],
  ["account", "memberlanguageset", { values: { "ma-lang": "es" } }],
  ["account", "infolevelset", { values: { "ma-level": "pause" } }],
  ["account", "expertisedeclare", { values: { "ma-exp": "Law" } }],
  ["account", "setpassword", { values: { "ma-cur0": SECRET + "-old", "ma-new0": SECRET, "ma-again0": SECRET } }],
  ["account", "signerregisterown", { values: { "ma-pub": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK x" } }],
  ["account", "signerrevokeown", { data: { key: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001" } }],
  ["connect", "groupkeynoticeseen", {}, "group"],
  ["connect", "disclosureshown", { data: { version: "D311-1" } }, "none", { disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: false, shown_at: null }) }],
  ["connect", "subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": SECRET } }, "none"],
  ["connect", "accountreferenceset", { values: { "mc-key0": SECRET } }, "none"],
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
const tableOf = (screen, situation, over, extra = {}) => ({ members: () => membersTable({ ...extra, ...over }), account: () => accountTable(ADMIN, { ...extra, ...over }), connect: () => connectTable(MEMBER, situation || "group", { ...extra, ...over }), notes: () => notesTable(ADMIN, { ...extra, ...over }) })[screen]();
const meOf = (screen) => (screen === "connect" ? MEMBER : ADMIN);

/* The reads an act changes (R8), named by what each owner's act writes. */
const CHANGES = {
  memberadd: ["roster"], membercaps: ["roster"], memberset: ["roster"], adminendorse: ["roster"], adminremove: ["roster"], expertiseconfirm: ["roster", "expertise"],
  invitewithdraw: ["roster"], websitekeycreate: [], joinlinkenable: [], groupkeyset: ["groupkey"], groupkeyswitch: ["groupkey"], groupkeyremove: ["groupkey", "uses"],
  accountusesset: ["uses", "history"], ailimitset: ["limits"], aikeepaway: ["keepaway"], memberlanguageset: ["language"], infolevelset: [], expertisedeclare: ["expertise"],
  setpassword: [], signerregisterown: ["signers"], signerrevokeown: ["signers"], groupkeynoticeseen: ["notice"], disclosureshown: ["disclosure"],
  subscriptionsignin: ["signin", "reference"], accountreferenceset: ["reference", "uses"], accountreferenceremove: ["reference", "uses"], subscriptiondisconnect: ["signin", "reference"],
  notewrite: ["notes"], noterevise: ["notes"], notedelete: ["notes"], noteturn: ["notes"], writinghelp: [],
};

test("R8 every act of every screen, once answered, reads again what it changes and draws it", async () => {
  for (const [screen, op, press, situation, extra] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, {}, extra), subject: screen === "members" ? "ana" : null, reachable: true });
    const spec = o.s.acts.find((a) => a.op === op);
    for (const r of CHANGES[op]) assert.ok((spec.rereads || Object.keys(o.s.reads({ me: meOf(screen), subject: screen === "members" ? "ana" : null, ui: {} }))).includes(r), `${screen} ${op} re-reads ${r}`);
    const r = await o.press(op, press);
    assert.ok(r.sent.length >= 1 && !r.refused, `${screen} ${op} sent`);
    const reread = r.sent.slice(1).map((x) => x.op);
    const reads = o.s.reads({ me: meOf(screen), subject: screen === "members" ? "ana" : null, ui: {} });
    for (const name of CHANGES[op]) if (reads[name]) assert.ok(reread.includes(reads[name].op), `${screen} ${op}: ${name} (${reads[name].op}) read again`);
  }
});

test("R8 nothing is drawn as done before the answer: while an act has not answered, the screen is unchanged", async () => {
  for (const [screen, op, press, situation, extra] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, { [op]: "pending" }, extra), subject: screen === "members" ? "ana" : null, reachable: true });
    const before = o.text;
    o.press(op, press);
    await new Promise((res) => setTimeout(res, 2));
    o.redraw();
    assert.equal(o.text, before, `${screen} ${op}`);
  }
});

test("R10 no key, code or password typed is kept in the browser's storage, put in an address, sent in a later request, or drawn again", async () => {
  for (const [screen, op, press, situation] of PRESSES.filter((p) => JSON.stringify(p[2]).includes(SECRET))) {
    const extra = {};
    for (const answer of ["ok", "refused"]) {
      const over = answer === "refused" ? { [op]: env({ ok: false, reason: "REFUSED", code: "REFUSED" }) } : {};
      const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, over), reachable: true });
      const r = await o.press(op, press);
      const what = `${screen} ${op} (${answer})`;
      assert.ok(JSON.stringify(r.sent[0].body).includes(SECRET), `${what}: in the body`);
      assert.equal(o.b.requests.filter((x) => JSON.stringify([x.url, x.query, x.body, x.headers]).includes(SECRET)).length, 1, `${what}: in that one request only`);
      assert.ok(!o.b.requests.some((x) => x.url.includes(SECRET)), `${what}: never in an address`);
      assert.ok(!o.b.location.pathname.includes(SECRET) && !o.b.location.hash.includes(SECRET), `${what}: not in the page's address`);
      assert.ok(![...o.b.store.values(), ...o.b.local.values()].some((v) => String(v).includes(SECRET)), `${what}: not in the browser's storage`);
      assert.ok(!o.b.doc.getElementById("cs-root").innerHTML.includes(SECRET), `${what}: never drawn`);
      // once the act succeeds, its field is drawn anew, empty
      if (answer === "ok") for (const el of o.b.doc.querySelectorAll("input, textarea")) assert.ok(!String(el.value).includes(SECRET), `${what}: no field still holds it (${el.id})`);
    }
  }
});
