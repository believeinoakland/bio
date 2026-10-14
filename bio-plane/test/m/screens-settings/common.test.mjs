/* What holds across the screens: R8 (after an act answers, the screen reads again what it changes and draws it;
   nothing is drawn as done before the answer) and R10 (no key, code or password typed on these screens is written to
   the browser's storage, an address or a later request), driven over every act of every screen. */
import test from "node:test";
import assert from "node:assert/strict";
import { all, ancestor, day, has, lacks, open, panelOf, rowOf, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, membersTable, membersTableMember, accountTable, connectTable, notesTable, groupTable, placesTable, recoveryTable, identityTable, securityTable, translationsTable, env } from "./fixtures.mjs";

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
  ["account", "signout", {}],
  ["account", "signouteverywhere", {}],
  ["account", "expertisedeclare", { values: { "ma-exp": "Law" } }],
  ["account", "setpassword", { values: { "ma-cur0": SECRET + "-old", "ma-new0": SECRET, "ma-again0": SECRET } }],
  ["account", "signerregisterown", { values: { "ma-keep": true }, wait: true }],
  ["account", "signerrevokeown", { data: { key: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001" } }],
  ["connect", "groupkeynoticeseen", {}, "group"],
  ["connect", "disclosureshown", { data: { version: "D311-1" } }, "none", { disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: false, shown_at: null }) }],
  ["connect", "subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": SECRET } }, "none"],
  ["connect", "accountreferenceset", { choose: { "mc-way": "apikey" }, values: { "mc-key0": SECRET } }, "none"],
  ["connect", "accountusesset", { data: { sw: "ask", to: "off" } }, "own"],
  ["connect", "ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "9", "aio-unit": "calls", "aio-period": "day" } }, "own"],
  ["connect", "accountreferenceremove", {}, "own"],
  ["connect", "subscriptiondisconnect", {}, "subscription"],
  ["notes", "notewrite", { values: { "mn-new": "n" } }],
  ["notes", "noterevise", { data: { note: "2" }, values: { "mn-r2": "n" } }],
  ["notes", "notedelete", { data: { note: "2" } }],
  ["notes", "noteturn", { data: { note: "2" }, values: { "mn-observation2": true, "mn-made2": "OBS-1" } }],
  ["notes", "writinghelp", { data: { field: "new", id: "mn-new" }, values: { "mn-new": "n" } }],
  // T47
  ["members", "passwordresetlink", { data: { member: "dev" }, reason: "lost it" }],
  ["members", "signerset", { data: { key: "AAAAC3NzaC1lZDI1NTE5AAAAIDev000000000000000000000000000000000000001" }, reason: "stolen" }],
  ["group", "groupnameset", { values: { "gr-name": "G" } }],
  ["group", "groupdomainset", { values: { "gr-domain": "g.example" } }],
  ["group", "grouplanguagesset", { values: { "gr-langs": "en es" }, reason: "r" }],
  ["group", "courtnoticeset", { values: { "gr-court-dont": true } }],
  ["group", "hostingaccessset", { values: { "gr-holders": "Rosa" } }],
  ["group", "strengthbarset", { values: { "gr-cap": "A", "gr-why": "why" } }],
  ["places", "profilesset", { values: { "pl-p-us-ca": true } }],
  ["places", "placewanted", { values: { "pl-want": "Berkeley" } }],
  ["places", "officesseed", {}],
  ["places", "entitycreate", { values: { "pl-label": "L", "pl-note": "N" } }],
  ["recovery", "recoverycodesissue", {}],
  ["group-identity", "groupdescriptionset", { values: { "gi-k-issue": true } }],
  ["group-identity", "groupdescriptiondraft", { values: { "gi-q-what": "w" } }],
  ["security", "securitymap", { values: { "se-from": "2026-10-01", "se-to": "2026-10-02" } }],
  ["security", "securitytooladd", { data: { provider: "acme-scan" }, values: { "sa-acme-scan-c-region": "eu", "sa-acme-scan-k-api_key": SECRET, "sa-acme-scan-keep": true } }],
  ["security", "securitytooltest", { data: { tool: "T1" } }],
  ["security", "securitytoolremove", { data: { tool: "T1" } }],
  ["translations", "translationadopt", { data: { key: "rail.home.name" }, values: { "tr-t-rail_home_name": "Portada" } }],
  ["translations", "translationconfirm", { data: { key: "mark.outward.means" } }],
  ["translations", "translationrevert", { data: { key: "rail.home.name" } }],
  ["translations", "translationgrant", { data: { revoke: "" }, values: { "tr-member": "ana" } }],
  ["translations", "translationdraft", { data: { key: "mark.outward.means", direction: "to_english" }, reason: "r" }],
];
const TABLES = { members: membersTable, account: () => accountTable(ADMIN), notes: () => notesTable(ADMIN), group: groupTable, places: placesTable, recovery: recoveryTable,
  "group-identity": identityTable, security: securityTable, translations: translationsTable };
const tableOf = (screen, situation, over, extra = {}) => (screen === "connect" ? connectTable(MEMBER, situation || "group", { ...extra, ...over }) : { ...TABLES[screen](), ...extra, ...over });
const meOf = (screen) => (screen === "connect" ? MEMBER : ADMIN);
const subjectOf = (screen) => (screen === "members" ? "ana" : screen === "translations" ? "es" : null);

/* The reads an act changes (R8), named by what each owner's act writes. */
const CHANGES = {
  memberadd: ["roster"], membercaps: ["roster"], memberset: ["roster"], adminendorse: ["roster"], adminremove: ["roster"], expertiseconfirm: ["roster", "expertise"],
  invitewithdraw: ["roster"], websitekeycreate: [], joinlinkenable: [], groupkeyset: ["groupkey"], groupkeyswitch: ["groupkey"], groupkeyremove: ["groupkey", "uses"],
  accountusesset: ["uses", "history"], ailimitset: ["limits"], aikeepaway: ["keepaway"], memberlanguageset: ["language"], infolevelset: [], expertisedeclare: ["expertise"],
  setpassword: [], signout: [], signouteverywhere: [], signerregisterown: ["signers"], signerrevokeown: ["signers"], groupkeynoticeseen: ["notice"], disclosureshown: ["disclosure"],
  subscriptionsignin: ["signin", "reference"], accountreferenceset: ["reference", "uses"], accountreferenceremove: ["reference", "uses"], subscriptiondisconnect: ["signin", "reference"],
  notewrite: ["notes"], noterevise: ["notes"], notedelete: ["notes"], noteturn: ["notes"], writinghelp: [],
  passwordresetlink: [], signerset: ["signers"], groupnameset: ["identity"], groupdomainset: ["identity"], grouplanguagesset: ["languages"], courtnoticeset: ["court"],
  hostingaccessset: ["hosting"], strengthbarset: ["bar"], profilesset: ["profiles"], placewanted: ["place"], officesseed: ["offices"], entitycreate: ["offices"],
  recoverycodesissue: ["codes"], groupdescriptionset: ["description"], groupdescriptiondraft: [], securitymap: ["map"], securitytooladd: ["tools"], securitytooltest: ["tools"],
  securitytoolremove: ["tools"], translationadopt: ["words"], translationconfirm: ["words"], translationrevert: ["words"], translationgrant: [], translationdraft: ["words"],
};

test("R8 every act of every screen, once answered, reads again what it changes and draws it", async () => {
  for (const [screen, op, press, situation, extra] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, {}, extra), subject: subjectOf(screen), reachable: true });
    const spec = o.s.acts.find((a) => a.op === op);
    for (const r of CHANGES[op]) assert.ok((spec.rereads || Object.keys(o.s.reads({ me: meOf(screen), subject: subjectOf(screen), ui: {} }))).includes(r), `${screen} ${op} re-reads ${r}`);
    const r = await o.press(op, press);
    assert.ok(r.sent.length >= 1 && !r.refused, `${screen} ${op} sent`);
    const reread = r.sent.slice(1).map((x) => x.op);
    const reads = o.s.reads({ me: meOf(screen), subject: subjectOf(screen), ui: {} });
    for (const name of CHANGES[op]) if (reads[name]) assert.ok(reread.includes(reads[name].op), `${screen} ${op}: ${name} (${reads[name].op}) read again`);
  }
});

test("R8 nothing is drawn as done before the answer: while an act has not answered, the screen is unchanged", async () => {
  for (const [screen, op, press, situation, extra] of PRESSES) {
    const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, { [op]: "pending" }, extra), subject: subjectOf(screen), reachable: true });
    // a path chosen first (a choice redraws the screen; that is not the act's doing)
    for (const [cid, v] of Object.entries(press.choose || {})) await o.choose(cid, v);
    const before = o.text;
    // pressed as a member would, any reason the shell asks answered; the act is sent and never answers
    await o.press(op, { ...press, choose: {} });
    o.redraw();
    assert.ok(o.p.all.some((r) => r.op === op), `${screen} ${op} sent`);
    assert.equal(o.text, before, `${screen} ${op}`);
  }
});

test("R10 no key, code or password typed is kept in the browser's storage, put in an address, sent in a later request, or drawn again", async () => {
  for (const [screen, op, press, situation] of PRESSES.filter((p) => JSON.stringify(p[2]).includes(SECRET))) {
    const extra = {};
    for (const answer of ["ok", "refused"]) {
      const over = answer === "refused" ? { [op]: env({ ok: false, reason: "REFUSED", code: "REFUSED" }) } : {};
      const o = await open(screen, { me: meOf(screen), table: tableOf(screen, situation, over), subject: subjectOf(screen), reachable: true });
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

/* R28: the common line. Every element these screens draw uses a class a served stylesheet defines (interface-shell R56),
   and a section, list or reading that holds nothing is not drawn. */
import { readFileSync } from "node:fs";
import { walk } from "./kit.mjs";

const rootOf = new URL("../../../../", import.meta.url);
const styleOf = (src) => (/<style[^>]*>([\s\S]*?)<\/style>/.exec(src) || [, ""])[1];
// the served stylesheets: `civicsmith.css`, `shell.css` (the design page's product rules, interface-assets R7; the design's own
// source until that file is served) and the shell's own `STYLE`
const served = (() => {
  // the design's two stylesheets as `interface-assets` serves them (R1, R7: byte-identical to these files), and the shell's own `STYLE`
  const read = (p) => readFileSync(new URL(p, rootOf), "utf8");
  const css = read("docs/development/ux-substrate/visual-language/civicsmith.css");
  const shell = styleOf(read("docs/development/ux-substrate/screens/page.src.html"));
  const own = /const STYLE = `([\s\S]*?)`;/.exec(read("bio-plane/src/interface-shell/index.mjs"));
  return new Set([...(css + shell + (own ? own[1] : "")).matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]));
})();

const RUNS = [
  ["settings", { me: ADMIN, table: {} }], ["settings", { me: MEMBER, table: {} }],
  ["members", { me: ADMIN, table: membersTable(), subject: "ana" }], ["members", { me: MEMBER, table: membersTableMember() }],
  ["members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [] }), aikeepawaystate: env({ on: true, reason: "r", set_by: "rosa", set_at: "2026-10-02T00:00:00Z", uses: ["ask"] }), groupkeystate: env({ ok: true, held: false, on: false }) }) }],
  ["account", { me: MEMBER, table: accountTable(MEMBER) }], ["connect", { me: MEMBER, table: connectTable(MEMBER, "none") }], ["connect", { me: MEMBER, table: connectTable(MEMBER, "own") }],
  ["connect", { me: MEMBER, table: connectTable(MEMBER, "group") }], ["connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") }],
  ["notes", { me: MEMBER, table: notesTable(MEMBER), reachable: true }], ["notes", { me: MEMBER, table: notesTable(MEMBER, { notes: env({ ok: true, notes: [] }) }) }],
  ["group", { me: ADMIN, table: groupTable() }], ["group", { me: MEMBER, table: groupTable() }],
  ["places", { me: ADMIN, table: placesTable() }], ["places", { me: MEMBER, table: placesTable() }], ["recovery", { me: ADMIN, table: recoveryTable() }],
  ["group-identity", { me: ADMIN, table: identityTable(), reachable: true }], ["group-identity", { me: MEMBER, table: identityTable() }],
  ["security", { me: ADMIN, table: securityTable() }], ["translations", { me: ADMIN, table: translationsTable(), subject: "es", reachable: true }],
];
// what the kit itself draws (`cs.rows`, the crumbs; interface-shell owns them and its R56 lists them), not a class this module writes
const KIT_DRAWN = new Set(["cs-panel", "cs-r", "cs-rows", "cs-crumbs", "cs-pickc"]);
// a state each read can be in: answering, or not at all (failed)
const FAILING = (table) => Object.fromEntries(Object.keys(table).map((k) => [k, "none"]));

test("R28 every element every screen draws uses a class a served stylesheet defines; a section holds something; control: a read that failed is still drawn failed", async () => {
  assert.ok(served.has("mk-note") && served.has("cs-field") && !served.has("cs-form"), "the served set is the design's");
  for (const [id, opt] of RUNS) for (const what of ["ok", "failed"]) {
    const o = await open(id, { ...opt, table: what === "ok" ? opt.table : { ...opt.table, ...FAILING(opt.table) } });
    const where = `${id} (${what}, ${opt.me.administer ? "administrator" : "member"})`;
    for (const n of walk(o.tree)) {
      for (const c of String((n.attrs && n.attrs.class) || "").split(/\s+/).filter(Boolean)) assert.ok(served.has(c) || KIT_DRAWN.has(c), `${where}: the class ${c} is defined by no served stylesheet`);
      // a section that holds nothing is not drawn
      if (n.tag === "section") assert.ok(n.children.filter((c) => c.tag && c.tag !== "h2").length > 0, `${where}: an empty section ${textOf(n)}`);
      // no bare label with a help beside it (cs.field draws them apart); no cs-form
      assert.ok(!/\bcs-form\b/.test((n.attrs && n.attrs.class) || ""), `${where}: cs-form`);
    }
    if (what === "failed" && id !== "settings" && id !== "recovery") assert.ok(all(o.tree, (e) => e.attrs["data-state"] === "failed").length >= 1 || id === "group-identity" && !opt.me.administer || id === "translations" || id === "security" && !opt.me.administer, `${where}: drawn failed`);
  }
});

test("R28 every labelled field is drawn with cs.field: its label and its help are boxes of their own, tied by aria-describedby; a field has no bare label with a help beside it", async () => {
  for (const [id, opt] of RUNS) {
    const o = await open(id, { ...opt, reachable: true });
    for (const inp of all(o.tree, (e) => ["input", "textarea"].includes(e.tag) && !["checkbox", "radio", "hidden"].includes(e.attrs.type))) {
      const box = ancestor(inp, (e) => /\bcs-field\b/.test(e.attrs.class || ""));
      assert.ok(box, `${id}: ${inp.attrs.id} is not drawn with cs.field`);
      const label = all(box, (e) => e.tag === "label" && e.attrs.for === inp.attrs.id)[0];
      assert.ok(label, `${id}: ${inp.attrs.id} has its label`);
      for (const h of all(box, (e) => /\bhelp\b/.test(e.attrs.class || ""))) { assert.ok(!ancestor(h, (e) => e === label) && inp.attrs["aria-describedby"] === h.attrs.id, `${id}: ${inp.attrs.id}'s help is apart and tied`); }
    }
    for (const sel of all(o.tree, (e) => e.tag === "select")) assert.ok(ancestor(sel, (e) => /\bcs-field\b/.test(e.attrs.class || "")), `${id}: ${sel.attrs.id} is not drawn with cs.choice`);
  }
});
