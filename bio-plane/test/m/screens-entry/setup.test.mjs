/* screens-entry R6, R17–R20: `setup`, the founder's claim with the handle she chooses, the group's first settings, the
   handle chosen later by a founder from before T49, the state of anyone else, and DEC-246's two states, walked over a
   fake plane from the claim to "Finished", at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, has, lacks, said, date, all, actOps, links, word, sentence, SCREENS, FOUNDER, OLD_FOUNDER, JOINED, AN_ADMIN } from "./kit.mjs";

const OTP = "otp-sentinel-5d1e";
const PW = "founder long password";
const HANDLE = "rivera";
const CODES = ["AAAA-1111", "BBBB-2222", "CCCC-3333", "DDDD-4444", "EEEE-5555", "FFFF-6666", "GGGG-7777", "HHHH-8888", "IIII-9999", "JJJJ-0000"];
const CATALOGUE = { offered: [{ provider_id: "scan-co", name: "Scan Co", config: [{ name: "region", label: "Region", required: true }, { name: "note", label: "Note", required: false }], credentials: ["api_key"], handling_digest: "d1" }] };
const plane = (over = {}) => ({
  bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: true } },
  claim: { ok: true, result: { ok: true, consumedAt: "2026-10-14T00:00:00Z", handle: HANDLE } },
  login: { ok: true, result: { ok: true, token: "tok-founder", expires: 0 } },
  recoverycodesissue: { ok: true, result: { ok: true, codes: CODES } },
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: null } },
  profiles: { ok: true, result: { ok: true, profiles: [{ id: "p-a", name: "Profile A", covers: ["x"] }], choices: [{ id: "p-a", name: "Profile A" }, { id: "p-b", name: "Profile B" }] } },
  placewantedstate: { ok: true, result: { name: null } },
  aikeepawaystate: { ok: true, result: { on: false } },
  groupkeystate: { ok: true, result: { on: false, held: false } },
  courtnotice: { ok: true, result: { choice: null, history: [] } },
  hostingaccess: { ok: true, result: { recorded: false, current: null } },
  securitytoolcatalogue: { ok: true, result: CATALOGUE },
  securitytools: { ok: true, result: { tools: [] } },
  memberadd: { ok: true, result: { ok: true, memberId: "dev", invite: "inv-xyz", expires: "2026-10-21T00:00:00Z" } },
  securitytooladd: { ok: true, result: { ok: true, tool_id: "T-1" } },
  securitytooltest: { ok: true, result: { ok: true, passed: true } },
  ...over,
});

async function claimed(over) {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane(over) });
  await o.press("claim", { values: { "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW } });
  return o;
}

test("R6 R17 the claim: the one-time password filled from #boot=, then 'Choose your handle', then the founder's password twice; only the claim is offered before a session", async () => {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane() });
  assert.deepEqual(o.requests.map((r) => r.op), ["bootstrap"]);
  assert.equal(all(o.tree, (e) => e.attrs.id === "su-otp")[0].attrs.value, OTP);
  assert.deepEqual(actOps(o.tree), ["claim"]);
  has(o, "screen.setup.claim"); has(o, "screen.hosting.heading"); has(o, "screen.hosting.s1");
  has(o, "screen.setup.handle"); has(o, "screen.setup.handle.help"); has(o, "screen.setup.own.help");
  // the handle between the one-time password and the founder's password
  const inputs = all(o.tree, (e) => e.tag === "input").map((e) => e.attrs.id);
  assert.deepEqual(inputs, ["su-otp", "su-handle", "su-pw", "su-pw2"]);
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 2);
});

test("R17 a fake plane walked from the claim with a chosen handle: claim sends it, login signs in by the handle the claim answers on an own device, then recoverycodesissue", async () => {
  const o = await claimed();
  assert.deepEqual(o.requests.slice(1, 4).map((r) => [r.op, r.body]), [
    ["claim", { bootstrapToken: OTP, password: PW, handle: HANDLE }],
    ["login", { handle: HANDLE, password: PW, device: "own" }],
    ["recoverycodesissue", {}],
  ]);
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [["tok-founder", { device: "own", handle: HANDLE, stay: true }]]);
  assert.equal(o.requests[3].header, true, "the codes asked under the new session");
  // the claim's next step names the group ("Your group" while unnamed) and her handle
  has(o, "screen.setup.claimed", { group: said("screen.entry.group"), handle: HANDLE });
  assert.ok(!("pending" in o.view.ui), "the password left the page's memory");
  // the handle the claim answers wins over what was typed
  const t = await open("setup", { fragment: { boot: OTP }, table: plane({ claim: { ok: true, result: { ok: true, handle: "rivera-2" } } }) });
  await t.press("claim", { values: { "su-handle": "Rivera-2 ", "su-pw": PW, "su-pw2": PW } });
  assert.deepEqual(t.requests.find((r) => r.op === "login").body.handle, "rivera-2");
});

test("R17 control: no request or drawn word in the claim's flow holds admin as a handle", async () => {
  const o = await claimed({ groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town" } } });
  for (const r of o.requests) assert.ok(!(r.body && r.body.handle === "admin"), `${r.op} sends admin as a handle`);
  assert.deepEqual(o.signins.map((s) => s.opts.handle), [HANDLE]);
  assert.doesNotMatch(o.drawn(), /\badmin\b/, "a drawn word names admin");
  has(o, "screen.setup.claimed", { group: "River Town", handle: HANDLE });
});

test("R17 refusals: NO_HANDLE, BAD_HANDLE, HANDLE_TAKEN and HANDLE_FIXED drawn by their keys, the handle kept and the passwords cleared; control: no login is sent", async () => {
  for (const code of ["NO_HANDLE", "BAD_HANDLE", "HANDLE_TAKEN", "HANDLE_FIXED"]) {
    const o = await open("setup", { fragment: { boot: OTP }, table: plane({ claim: { ok: false, code } }) });
    const r = await o.press("claim", { values: { "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW } });
    assert.equal(r.refused, true, code);
    assert.equal(o.refused.text, said("refusal." + code), code);
    assert.equal(o.fields["su-handle"], HANDLE, code + ": the handle kept");
    assert.equal(o.fields["su-pw"], "", code); assert.equal(o.fields["su-pw2"], "", code);
    assert.ok(!o.view.ui.pending, code + ": no password left in the page's memory");
    assert.deepEqual(o.requests.map((x) => x.op), ["bootstrap", "claim"], code + ": nothing more is sent");
    assert.deepEqual(actOps(o.tree), ["claim"], code + ": the step is kept");
  }
  // the same refusal answered inside an ok answer is no success (D29)
  const n = await open("setup", { fragment: { boot: OTP }, table: plane({ claim: { ok: true, result: { ok: false, code: "HANDLE_TAKEN" } } }) });
  await n.press("claim", { values: { "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW } });
  assert.equal(n.refused.text, said("refusal.HANDLE_TAKEN"));
  assert.ok(!n.requests.some((x) => x.op === "login"));
});

test("R6 R17 control: two passwords that differ, a short one, no one-time password, or no handle send nothing", async () => {
  const o = await open("setup", { fragment: {}, table: plane() });
  const base = { "su-otp": OTP, "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW };
  for (const [values, key] of [[{ ...base, "su-pw2": PW + "x" }, "screen.entry.differ"], [{ ...base, "su-pw": "short", "su-pw2": "short" }, "screen.entry.short"],
    [{ ...base, "su-otp": "" }, "screen.setup.nootp"], [{ ...base, "su-handle": "  " }, "refusal.NO_HANDLE"]]) {
    assert.deepEqual((await o.press("claim", { values })).sent, []);
    assert.equal(o.refused.key, key);
  }
});

test("R20 the ten codes shown once under setup.codes.once, with 'Copy them' and 'Save them as a file'; control: the codes are in no storage and drawn once", async () => {
  const o = await claimed();
  has(o, "screen.entry.codes.heading"); has(o, "setup.codes.once");
  const pre = all(o.tree, (e) => e.tag === "pre");
  assert.equal(pre.length, 1);
  assert.deepEqual(pre[0].children.map((c) => c.text).join("").split("\n"), CODES);
  // copied, or saved as a file made in the page (interface-shell R47), the codes and nothing else, each by its own key
  const copy = all(o.tree, (e) => e.attrs["data-shell"] === "copy"), save = all(o.tree, (e) => e.attrs["data-shell"] === "save");
  assert.equal(copy.length, 1); assert.equal(save.length, 1);
  assert.equal(copy[0].children.map((c) => c.text).join(""), word("setup.codes.copy"));
  assert.equal(save[0].children.map((c) => c.text).join(""), word("setup.codes.save"));
  assert.equal(o.saves.at(-1).name, "recovery-codes.txt");
  assert.deepEqual(o.saves.at(-1).text.trim().split("\n"), CODES);
  assert.deepEqual(o.copies.at(-1).split("\n"), CODES);
  // shown once: the screen opened again holds them in no state of its own, and the act that issues them is not offered
  // once she holds codes
  const again = await open("setup", { me: FOUNDER, table: plane({ recoverycodesstate: { ok: true, result: { ok: true, held: true, remaining: 10 } } }) });
  assert.ok(!again.drawn().includes(CODES[0]));
  assert.ok(!actOps(again.tree).includes("recoverycodesissue"));
  for (const c of CODES) assert.ok(!JSON.stringify(o.view.data).includes(c), "a code kept in the screen's read state");
});

test("R20 state c, 'Already claimed': drawn for a claim refused ALREADY_CLAIMED and for a visit to a claimed instance, with 'Sign in' opening front; control: an unclaimed instance draws the claim", async () => {
  const visit = await open("setup", { fragment: { boot: OTP }, table: plane({ bootstrap: { ok: true, result: { ok: true, claimed: true } } }) });
  const r = await open("setup", { fragment: { boot: OTP }, table: plane({ claim: { ok: false, code: "ALREADY_CLAIMED" } }) });
  await r.press("claim", { values: { "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW } });
  assert.equal(r.requests.filter((x) => x.op === "login").length, 0, "a refused claim sends nothing more");
  assert.ok(!r.view.ui.pending, "no password left in the page's memory");
  for (const o of [visit, r]) {
    has(o, "setup.claimed.heading"); has(o, "setup.claimed.sub"); has(o, "refusal.ALREADY_CLAIMED"); has(o, "screen.entry.signin");
    assert.ok(links(o.tree).includes("/app/front"));
    assert.deepEqual(actOps(o.tree), []);
    assert.equal(all(o.tree, (e) => e.tag === "input").length, 0);
  }
  const fresh = await open("setup", { fragment: { boot: OTP }, table: plane() });
  lacks(fresh, "setup.claimed.heading"); assert.deepEqual(actOps(fresh.tree), ["claim"]);
});

test("R6 not armed says so; a claim whose sign-in fails says sign in, linking front", async () => {
  has(await open("setup", { table: plane({ bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: false } } }) }), "screen.setup.unarmed");
  const n = await claimed({ login: { ok: false, code: "SIGN_IN_REFUSED" } });
  // the handle she chose, never admin (R17)
  has(n, "screen.setup.claimed.nosignin", { handle: HANDLE });
  assert.doesNotMatch(n.drawn(), /\badmin\b/);
  assert.ok(links(n.tree).includes("/app/front"));
  assert.ok(!n.requests.some((r) => r.op === "recoverycodesissue"));
});

test("R18 a founder of a group claimed before T49 (whoami: rootOfTrust, handle null) is asked her handle once: 'Choose this handle' sends founderhandleset with the handle in the body only, then says so with Home", async () => {
  const o = await open("setup", { me: OLD_FOUNDER, session: { state: "live", handle: "" }, table: plane({ founderhandleset: { ok: true, result: { ok: true, handle: HANDLE } } }) });
  assert.deepEqual(o.requests, [], "nothing is read for the step");
  for (const k of ["founder.handle.title", "founder.handle.says", "screen.setup.handle.help", "founder.handle.choose", "founder.handle.later", "founder.handle.later.help"]) has(o, k);
  assert.deepEqual(actOps(o.tree), ["founderhandleset"], "the step alone, before Home");
  const r = await o.press("founderhandleset", { values: { "su-fh": ` ${HANDLE} ` } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query, x.header]), [["founderhandleset", { handle: HANDLE }, {}, true]]);
  has(o, "founder.handle.done", { handle: HANDLE });
  assert.ok(links(o.tree).includes("/app"), "Home");
  assert.deepEqual(actOps(o.tree), []);
});

test("R18 refusals drawn by their keys, the step kept; 'Later' sends nothing and opens Home; control: a member, and a founder holding a handle, never see the step", async () => {
  for (const code of ["NO_HANDLE", "BAD_HANDLE", "HANDLE_TAKEN", "HANDLE_FIXED"]) {
    const o = await open("setup", { me: OLD_FOUNDER, table: plane({ founderhandleset: { ok: false, code } }) });
    await o.press("founderhandleset", { values: { "su-fh": "Bad Handle" } });
    assert.equal(o.refused.text, said("refusal." + code), code);
    assert.deepEqual(actOps(o.tree), ["founderhandleset"], code);
  }
  const e = await open("setup", { me: OLD_FOUNDER, table: plane() });
  assert.deepEqual((await e.press("founderhandleset", { values: { "su-fh": "" } })).sent, []);
  assert.equal(e.refused.key, "refusal.NO_HANDLE");
  // "Later": a link to Home, no act
  const later = all(e.tree, (x) => x.tag === "a" && x.children.map((c) => c.text).join("") === word("founder.handle.later"));
  assert.deepEqual(later.map((x) => x.attrs.href), ["/app"]);
  assert.deepEqual(e.requests, []);
  for (const me of [FOUNDER, JOINED, AN_ADMIN]) {
    const o = await open("setup", { me, table: plane() });
    lacks(o, "founder.handle.title"); lacks(o, "founder.handle.says");
    assert.ok(!actOps(o.tree).includes("founderhandleset"));
  }
});

test("R19 a member, or an administrator who is not the founder, opening setup sees her own state: set up, with Home; no founder words, no admin name, no codes act and nothing read", async () => {
  for (const me of [JOINED, AN_ADMIN]) {
    const o = await open("setup", { me, table: plane(), session: { state: "live", handle: me.handle } });
    assert.deepEqual(o.requests, [], "nothing is read");
    has(o, "setup.member.heading"); has(o, "setup.member.sub"); has(o, "setup.member.home");
    assert.ok(links(o.tree).includes("/app"));
    assert.deepEqual(actOps(o.tree), [], "no act, 'Show my recovery codes' among them");
    for (const k of ["screen.setup.claimed", "screen.setup.claim", "screen.setup.lede", "screen.entry.codes.heading", "founder.handle.title"]) lacks(o, k, { group: said("screen.entry.group"), handle: me.handle });
    assert.doesNotMatch(o.drawn(), /\badmin\b/);
  }
  // control: the founder at her first sign-in sees the claim's next step, and "Show my recovery codes" before she has
  // seen her codes
  const f = await claimed();
  has(f, "screen.setup.claimed", { group: said("screen.entry.group"), handle: HANDLE });
  const before = await open("setup", { me: FOUNDER, table: plane({ recoverycodesstate: { ok: true, result: { ok: true, held: false, remaining: 0 } } }) });
  assert.ok(actOps(before.tree).includes("recoverycodesissue"));
  lacks(before, "setup.member.heading");
});

test("R6 after the claim every part is the registry's act for it, each drawn", async () => {
  // the group's key held, so its switch is drawn too
  const o = await claimed({ recoverycodesstate: { ok: true, result: { ok: true, held: true, remaining: 10 } }, groupkeystate: { ok: true, result: { on: false, held: true } } });
  // the parts are the registry's acts for setup (its own declaration, N1073), but the claim (before a session), the
  // codes (shown once, R20) and the founder's handle (R18), each drawn in its own state
  const REG = JSON.parse(fs.readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
  const parts = (REG.screens || REG).find((r) => r.id === "setup").acts.map((x) => String(x.op).replace(/^owed:/, "").split(/\s/)[0])
    .filter((op) => !["claim", "recoverycodesissue", "founderhandleset"].includes(op));
  assert.ok(parts.length >= 10);
  assert.deepEqual(actOps(o.tree), [...new Set(parts)].sort());
  for (const k of ["name", "places", "offices", "assistant", "court", "hosting", "admins", "security", "finished"]) has(o, "screen.setup." + k);
  for (const k of ["claim", "name", "places", "offices", "assistant", "court", "hosting", "admins", "security"]) has(o, "screen.setup.step." + k);
  assert.ok(links(o.tree).includes("/app"), "Finished links /app");
});

test("R6 a fake plane walked from the claim to Finished: each part sends its act's body", async () => {
  const o = await claimed({ groupkeystate: { ok: true, result: { on: false, held: true } } });
  const sent = async (op, values, data) => (await o.press(op, { values, data })).sent.filter((x) => x.op === op).map((x) => x.body);
  assert.deepEqual(await sent("groupnameset", { "su-name": " River Town Tenants " }), [{ name: "River Town Tenants" }]);
  assert.deepEqual(await sent("groupdomainset", { "su-domain": "rivertown.example" }), [{ domain: "rivertown.example" }]);
  assert.deepEqual(await sent("profilesset", { "su-pf-0": true, "su-pf-1": true }), [{ profiles: ["p-a", "p-b"] }]);
  assert.deepEqual(await sent("profilesset", { "su-pf-0": false, "su-pf-1": false }), [{ profiles: [] }], "choosing none is allowed");
  assert.deepEqual(await sent("placewanted", { "su-place": "A place not held" }), [{ name: "A place not held" }]);
  assert.deepEqual(await sent("officesseed", {}), [{}]);
  assert.deepEqual(await sent("entitycreate", { "su-office": "The records office", "su-office-note": "" }), [{ kind: "office", label: "The records office", note: null }]);
  has(o, "screen.setup.office.added", { label: "The records office" });
  assert.deepEqual(await sent("aikeepaway", { "su-why": "We hold tips from employees." }, { on: "on" }), [{ on: true, reason: "We hold tips from employees." }]);
  assert.deepEqual(await sent("groupkeyset", { "su-key0": "sk-sentinel-key" }), [{ key: "sk-sentinel-key" }]);
  assert.ok(!o.drawn().includes("sk-sentinel-key"), "the key never drawn");
  assert.deepEqual(await sent("groupkeyswitch", {}, { on: "on" }), [{ on: true }]);
  assert.deepEqual(await sent("ailimitset", { "su-limit": "$5.00" }), [{ owner: "group", scope: "per_member", unit: "usd", period: "day", amount: 5 }]);
  assert.deepEqual(await sent("courtnoticeset", { "su-court-0": false, "su-court-1": true }), [{ choice: "dont" }]);
  assert.deepEqual(await sent("hostingaccessset", { "su-holders": "Two members, on the group's account", "su-hnote": "" }), [{ holders: "Two members, on the group's account", note: null }]);
  assert.deepEqual(await sent("memberadd", { "su-adm-id": "dev", "su-adm-cover": "Dev, from the block" }), [{ memberId: "dev", cover: "Dev, from the block", role: "admin" }]);
  has(o, "screen.setup.admins.shown", { date: { html: date("2026-10-21") } });
  assert.ok(o.text.includes("https://group.example/#invite=inv-xyz"), "the invitation shown once");
  const t = await o.press("securitytooladd", { values: { "su-st-0-cfg-0": "eu", "su-st-0-cred-0": "tool-secret", "su-st-0-keep": true }, data: { tool: "0" } });
  assert.deepEqual(t.sent.map((x) => [x.op, x.body]), [
    ["securitytooladd", { providerId: "scan-co", config: { region: "eu" }, credentials: { api_key: "tool-secret" }, handlingDigest: "d1", confirmRetention: true, use: "on_request" }],
    ["securitytooltest", { toolId: "T-1" }],
    ["securitytools", undefined],
  ]);
  has(o, "screen.setup.security.passed", { tool: "Scan Co" });
});

test("R6 control: a refused part keeps the step and sends nothing more; a part with its field empty sends nothing", async () => {
  const o = await claimed({ groupnameset: { ok: false, code: "NOT_AN_ADMIN" }, securitytooladd: { ok: false, code: "PROVIDER_REFUSED" } });
  const before = o.requests.length;
  const r = await o.press("groupnameset", { values: { "su-name": "River Town" } });
  assert.equal(r.refused, true);
  assert.deepEqual(o.requests.slice(before).map((x) => x.op), ["groupnameset"], "nothing more is sent");
  has(o, "screen.setup.name");
  const s = await o.press("securitytooladd", { values: { "su-st-0-cfg-0": "eu", "su-st-0-cred-0": "k" }, data: { tool: "0" } });
  assert.deepEqual(s.sent.map((x) => x.op), ["securitytooladd"], "no test after a refused add");
  for (const [op, values, key, data] of [["groupnameset", { "su-name": "" }, "screen.setup.name.empty"], ["placewanted", { "su-place": "" }, "screen.setup.place.empty"],
    ["entitycreate", { "su-office": "" }, "screen.setup.office.empty"], ["aikeepaway", { "su-why": "" }, "screen.setup.keepaway.noreason", { on: "on" }],
    ["ailimitset", { "su-limit": "lots" }, "screen.setup.limit.bad"], ["courtnoticeset", {}, "screen.setup.court.pick"],
    ["hostingaccessset", { "su-holders": "" }, "screen.setup.hosting.empty"], ["memberadd", { "su-adm-id": "dev", "su-adm-cover": "" }, "screen.setup.admins.incomplete"],
    ["securitytooladd", { "su-st-0-cfg-0": "", "su-st-0-cred-0": "k" }, "screen.setup.security.missing", { tool: "0" }]]) {
    assert.deepEqual((await o.press(op, { values, data })).sent, [], op);
    assert.equal(o.refused.key, key, op);
  }
});

test("R6 every part is resumable: what the reads answer is drawn as done, and the scanner's sentence only while part_scanner is true", async () => {
  const o = await claimed({
    groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", domain: "rivertown.example", domain_verified_at: "2026-10-01" } },
    courtnotice: { ok: true, result: { choice: "tell" } }, hostingaccess: { ok: true, result: { current: { holders: "The treasurer" } } },
    aikeepawaystate: { ok: true, result: { on: true, reason: "Tips." } }, securitytools: { ok: true, result: { tools: [{ tool_id: "T-1", name: "Scan Co" }] } },
  });
  has(o, "screen.setup.name.now", { name: "River Town" }); has(o, "screen.setup.domain.verified", { domain: "rivertown.example" });
  has(o, "screen.setup.court.now.tell"); has(o, "screen.setup.hosting.now", { holders: "The treasurer" }); has(o, "screen.setup.keepaway.on");
  has(o, "screen.setup.security.held", { tool: "Scan Co" });
  assert.ok(all(o.tree, (e) => e.tag === "li" && /done/.test(e.attrs.class || "")).length >= 6);
  has(o, "screen.setup.security.scanner");
  const off = await claimed({ bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: false } } });
  lacks(off, "screen.setup.security.scanner");
});

test("R6 the words setup reads: no sentence says administrators see spending by member (DEC-188 (5)); 'file scanner' and 'safe view' only (DEC-200 (5))", () => {
  // each sentence read through setup-words' word, its placeholders left as named (R21: no English held here)
  const read = SCREENS.find((s) => s.id === "setup").words.filter((k) => !/^act\./.test(k)).map((k) => [k, sentence(k)]);
  for (const [k, en] of read) {
    assert.doesNotMatch(en, /(see|sees|seeing)[^.]*(spend|spending|use)[^.]*by member|each member's (spending|use)[^.]* (seen|visible)/i, k);
    assert.doesNotMatch(en, /virus scanner|antivirus|sandbox|safe-view maker|\bsafe copy maker\b/i, k);
  }
  // control: the pattern finds one
  assert.match("administrators see spending by member", /(see|sees|seeing)[^.]*(spend|spending|use)[^.]*by member/i);
  assert.ok(read.some(([, en]) => /file scanner/.test(en)) && read.some(([, en]) => /safe view/.test(en)));
});
