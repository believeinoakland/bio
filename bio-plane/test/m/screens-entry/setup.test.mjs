/* screens-entry R6, R17–R20, R22, R23: `setup`, the founder's claim with the handle she chooses, the team's first
   settings drawn as the design draws them (numbered parts that open and close, choices that open only what they need,
   "Skip for now", the second administrator), the handle chosen later by a founder from before T49, the state of anyone
   else, and DEC-246's two states, walked over a fake plane from the claim to "Finished", at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, has, lacks, said, date, all, texts, textOf, actOps, links, word, sentence, unescape, squash, SCREENS, FOUNDER, OLD_FOUNDER, JOINED, AN_ADMIN } from "./kit.mjs";

const OTP = "otp-sentinel-5d1e";
const PW = "founder long password";
const HANDLE = "rivera";
const CODES = ["AAAA-1111", "BBBB-2222", "CCCC-3333", "DDDD-4444", "EEEE-5555", "FFFF-6666", "GGGG-7777", "HHHH-8888", "IIII-9999", "JJJJ-0000"];
const CATALOGUE = { offered: [{ provider_id: "scan-co", vendor: "Scan", product: "Co", config: [{ name: "region", label: "Region", required: true }, { name: "note", label: "Note", required: false }], credentials: ["api_key"], handling_digest: "d1" }] };
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
  memberlist: { ok: true, result: { members: [{ member_id: "admin", handle: HANDLE, founder: true, role: "admin", status: "active" }] } },
  entitieskind: { ok: true, result: { ok: true, kind: "office", entities: [], count: 0 } },
  securitytooladd: { ok: true, result: { ok: true, tool_id: "T-1" } },
  securitytooltest: { ok: true, result: { ok: true, passed: true } },
  ...over,
});

// a part as drawn (R22): its element, its state, whether it is open
const partOf = (o, key) => all(o.tree, (e) => e.attrs["data-part"] === key)[0];
const stateOf = (o, key) => partOf(o, key).attrs["data-state"];
const isOpen = (o, key) => "open" in partOf(o, key).attrs;
const PARTS = ["claim", "group", "places", "offices", "assistant", "court", "security", "admins"];

async function claimed(over) {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane(over) });
  await o.press("claim", { values: { "su-handle": HANDLE, "su-pw": PW, "su-pw2": PW } });
  return o;
}

test("R6 R17 the claim: the one-time password filled from #boot=, then 'Choose your handle', then the founder's password twice; only the claim is offered before a session", async () => {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane() });
  assert.deepEqual(o.requests.map((r) => r.op), ["bootstrap", "groupidentity"]);
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
  assert.deepEqual(o.requests.slice(2, 5).map((r) => [r.op, r.body]), [
    ["claim", { bootstrapToken: OTP, password: PW, handle: HANDLE }],
    ["login", { handle: HANDLE, password: PW, device: "own" }],
    ["recoverycodesissue", {}],
  ]);
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [["tok-founder", { device: "own", handle: HANDLE, stay: true }]]);
  assert.equal(o.requests[4].header, true, "the codes asked under the new session");
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
    assert.deepEqual(o.requests.map((x) => x.op), ["bootstrap", "groupidentity", "claim"], code + ": nothing more is sent");
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
  has(o, "screen.setup.codes.intro"); has(o, "setup.codes.once");
  assert.ok(isOpen(o, "claim"), "part 1 open while the codes are shown");
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

// a choice made on the page (R22): the radio checked, its others not, and the page's clock moved past the watch
async function choose(o, name, i, n = 2) {
  for (let k = 0; k < n; k++) o.fields[`${name}-${k}`] = k === i;
  await o.tick(300);
}
// every choice that opens an act made: a website, a place not yet known, the team paying for the assistant
async function opened(over) {
  const o = await claimed({ recoverycodesstate: { ok: true, result: { ok: true, held: true, remaining: 10 } }, groupkeystate: { ok: true, result: { on: false, held: true } }, ...over });
  await choose(o, "su-site", 1);
  await choose(o, "su-pay", 1);
  return o;
}

test("R6 after the claim every part is the registry's act for it, each drawn once its choice opens it", async () => {
  const o = await opened();
  // the parts are the registry's acts for setup (its own declaration, N1073), but the claim (before a session), the
  // codes (shown once, R20), the founder's handle (R18), and the acts a choice opens instead of another
  const REG = JSON.parse(fs.readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
  const parts = (REG.screens || REG).find((r) => r.id === "setup").acts.map((x) => String(x.op).replace(/^owed:/, "").split(/\s/)[0])
    .filter((op) => !["claim", "recoverycodesissue", "founderhandleset"].includes(op));
  assert.ok(parts.length >= 10);
  // with the place known and the assistant paid for by the team: all but `placewanted` (a place not known) and
  // `aikeepaway` (keeping AI out), each drawn when chosen
  const drawn = actOps(o.tree);
  assert.deepEqual(drawn, [...new Set(parts)].filter((op) => !["placewanted", "aikeepaway"].includes(op)).sort());
  o.fields["su-pick"] = "other"; await o.tick(300);
  assert.ok(actOps(o.tree).includes("placewanted") && !actOps(o.tree).includes("officesseed"));
  await choose(o, "su-ai", 1);
  assert.ok(actOps(o.tree).includes("aikeepaway"));
  for (const k of ["places", "offices", "assistant", "court", "security", "admins", "finished"]) has(o, "screen.setup." + k);
  has(o, "screen.setup.part.group");
  assert.ok(links(o.tree).includes("/app"), "Finished links /app");
});

test("R6 a fake plane walked from the claim to Finished: each part sends its act's body", async () => {
  const o = await opened();
  const sent = async (op, values, data) => (await o.press(op, { values, data })).sent.filter((x) => x.op === op).map((x) => x.body);
  assert.deepEqual(await sent("groupnameset", { "su-name": " River Town Tenants " }), [{ name: "River Town Tenants" }]);
  assert.deepEqual(await sent("groupdomainset", { "su-domain": "rivertown.example" }), [{ domain: "rivertown.example" }]);
  assert.deepEqual(await sent("profilesset", { "su-pick": "p-b" }), [{ profiles: ["p-b"] }]);
  assert.deepEqual(await sent("officesseed", {}), [{}]);
  assert.deepEqual(await sent("entitycreate", { "su-office": "The records office", "su-office-note": "" }), [{ kind: "office", label: "The records office", note: null }]);
  has(o, "screen.setup.office.added", { label: "The records office" });
  assert.deepEqual(await sent("groupkeyset", { "su-key0": "sk-sentinel-key" }), [{ key: "sk-sentinel-key" }]);
  assert.ok(!o.drawn().includes("sk-sentinel-key"), "the key never drawn");
  assert.deepEqual(await sent("groupkeyswitch", {}, { on: "on" }), [{ on: true }]);
  assert.deepEqual(await sent("ailimitset", { "su-limit": "$5.00" }), [{ owner: "group", scope: "per_member", unit: "usd", period: "day", amount: 5 }]);
  assert.deepEqual(await sent("courtnoticeset", { "su-court-0": false, "su-court-1": true }), [{ choice: "dont" }]);
  assert.deepEqual(await sent("hostingaccessset", { "su-holders": "Two members, on the team's account", "su-hnote": "" }), [{ holders: "Two members, on the team's account", note: null }]);
  assert.deepEqual(await sent("memberadd", { "su-adm-id": "dev", "su-adm-cover": "Dev, from the block" }), [{ memberId: "dev", cover: "Dev, from the block", role: "admin" }]);
  has(o, "screen.setup.admins.shown", { date: { html: date("2026-10-21") } });
  assert.ok(o.text.includes("https://group.example/#invite=inv-xyz"), "the invitation shown once");
  const t = await o.press("securitytooladd", { values: { "su-st-0-cfg-0": "eu", "su-st-0-cred-0": "tool-secret", "su-st-0-keep": true }, data: { tool: "0" } });
  assert.deepEqual(t.sent.map((x) => [x.op, x.body]), [
    ["securitytooladd", { providerId: "scan-co", config: { region: "eu" }, credentials: { api_key: "tool-secret" }, handlingDigest: "d1", confirmRetention: true, use: "on_request" }],
    ["securitytooltest", { toolId: "T-1" }],
    ["securitytools", undefined],
  ]);
  has(o, "screen.setup.security.passed", { tool: "Scan · Co" });
  // a place not yet known: "Somewhere else" names it, and chooses no profile
  o.fields["su-pick"] = "other"; await o.tick(300);
  assert.deepEqual(await sent("placewanted", { "su-place": "A place not held" }), [{ name: "A place not held" }]);
  assert.deepEqual(await sent("profilesset", { "su-pick": "other" }), [{ profiles: [] }], "choosing none is allowed");
  // keeping AI out, with the founder's reason
  await choose(o, "su-ai", 1);
  assert.deepEqual(await sent("aikeepaway", { "su-why": "We hold tips from employees." }, { on: "on" }), [{ on: true, reason: "We hold tips from employees." }]);
});

test("R6 control: a refused part keeps the step and sends nothing more; a part with its field empty sends nothing", async () => {
  const o = await opened({ groupnameset: { ok: false, code: "NOT_AN_ADMIN" }, securitytooladd: { ok: false, code: "PROVIDER_REFUSED" } });
  const before = o.requests.length;
  const r = await o.press("groupnameset", { values: { "su-name": "River Town" } });
  assert.equal(r.refused, true);
  assert.deepEqual(o.requests.slice(before).map((x) => x.op), ["groupnameset"], "nothing more is sent");
  assert.ok(isOpen(o, "group"), "the refused part stays open");
  assert.equal(stateOf(o, "group"), "optional");
  const s = await o.press("securitytooladd", { values: { "su-st-0-cfg-0": "eu", "su-st-0-cred-0": "k" }, data: { tool: "0" } });
  assert.deepEqual(s.sent.map((x) => x.op), ["securitytooladd"], "no test after a refused add");
  o.fields["su-pick"] = "other"; await o.tick(300);
  for (const [op, values, key, data] of [["groupnameset", { "su-name": "" }, "screen.setup.name.empty"], ["placewanted", { "su-place": "" }, "screen.setup.place.empty"],
    ["entitycreate", { "su-office": "" }, "screen.setup.office.empty"], ["ailimitset", { "su-limit": "lots" }, "screen.setup.limit.bad"], ["courtnoticeset", {}, "screen.setup.court.pick"],
    ["hostingaccessset", { "su-holders": "" }, "screen.setup.hosting.empty"], ["memberadd", { "su-adm-id": "dev", "su-adm-cover": "" }, "screen.setup.admins.incomplete"],
    ["securitytooladd", { "su-st-0-cfg-0": "", "su-st-0-cred-0": "k" }, "screen.setup.security.missing", { tool: "0" }]]) {
    assert.deepEqual((await o.press(op, { values, data })).sent, [], op);
    assert.equal(o.refused.key, key, op);
  }
  await choose(o, "su-ai", 1);
  assert.deepEqual((await o.press("aikeepaway", { values: { "su-why": "" }, data: { on: "on" } })).sent, []);
  assert.equal(o.refused.key, "screen.setup.keepaway.noreason");
});

test("R6 every part is resumable: what the reads answer is drawn as done, and the scanner's sentence only while part_scanner is true", async () => {
  const o = await claimed({
    groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", domain: "rivertown.example", domain_verified_at: "2026-10-01" } },
    courtnotice: { ok: true, result: { choice: "tell" } }, hostingaccess: { ok: true, result: { current: { holders: "The treasurer" } } },
    aikeepawaystate: { ok: true, result: { on: true, reason: "Tips." } }, securitytools: { ok: true, result: { tools: [{ tool_id: "T-1", provider_id: "scan-co", state: "on" }] } },
    entitieskind: { ok: true, result: { ok: true, kind: "office", entities: [{ id: "E-1", label: "City Clerk" }], count: 1 } },
    memberlist: { ok: true, result: { members: [{ member_id: "admin", founder: true, role: "admin", status: "active" }, { member_id: "dev", role: "admin", status: "active" }] } },
  });
  has(o, "screen.setup.name.now", { name: "River Town" }); has(o, "screen.setup.domain.verified", { domain: "rivertown.example" });
  has(o, "screen.setup.court.now.tell"); has(o, "screen.setup.hosting.now", { holders: "The treasurer" }); has(o, "screen.setup.keepaway.on");
  has(o, "screen.setup.security.held", { tool: "Scan · Co" });
  assert.ok(o.text.includes("City Clerk"), "the team's offices listed");
  assert.deepEqual(PARTS.map((k) => stateOf(o, k)), ["done", "done", "done", "done", "off", "done", "done", "done"]);
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

// ---- R22: setup drawn as the design draws it (DEC-279) ----
const tipOf = (e) => squash(unescape(e.attrs["data-tip"] || ""));
const summaryOf = (o, key) => all(partOf(o, key), (e) => e.tag === "summary")[0];

test("R22 before the claim only part 1, 'Make it yours', is open; the seven parts that follow are shown closed beneath it under screen.setup.coming", async () => {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane() });
  assert.deepEqual(all(o.tree, (e) => e.attrs["data-part"]).map((e) => e.attrs["data-part"]), PARTS);
  assert.equal(partOf(o, "claim").tag, "details");
  assert.ok(isOpen(o, "claim")); assert.equal(stateOf(o, "claim"), "needed");
  has(o, "screen.setup.part.claim.why"); has(o, "screen.setup.state.needed"); has(o, "screen.setup.claim.intro"); has(o, "screen.setup.coming");
  for (const k of PARTS.slice(1)) {
    assert.equal(partOf(o, k).tag, "div", k + ": shown, not opened");
    assert.equal(stateOf(o, k), "later");
    assert.equal(all(partOf(o, k), (e) => ["input", "button", "select"].includes(e.tag)).length, 0, k);
    has(o, "screen.setup.part." + k + ".why");
  }
  // the numbers in order, every field and act inside part 1
  assert.deepEqual(all(o.tree, (e) => e.attrs.class === "n").map((e) => e.children.map((c) => c.text).join("")), ["1", "2", "3", "4", "5", "6", "7", "8"]);
  for (const f of all(o.tree, (e) => e.tag === "input" || e.attrs["data-act"])) assert.ok(all(partOf(o, "claim"), (e) => e === f).length === 1, "outside part 1");
  // the long explanations behind explained terms: the one-time password's and the handle's
  const tips = all(o.tree, (e) => /\bcs-card\b/.test(e.attrs.class || "")).map(tipOf);
  for (const k of ["screen.setup.otp.tip", "screen.setup.handle.tip"]) assert.ok(tips.includes(said(k)), k);
  lacks(o, "screen.setup.otp.tip"); lacks(o, "screen.setup.handle.tip");
  // the act as the design names it
  assert.equal(all(o.tree, (e) => e.attrs["data-act"] === "claim")[0].children.map((c) => c.text).join(""), word("screen.setup.claim.button"));
  // the head names the short name until the team is named
  assert.deepEqual(all(o.tree, (e) => e.attrs.class === "muted").map((e) => e.children.map((c) => c.text).join("")), ["river-town"]);
});

test("R22 just claimed: screen.setup.after heads the parts, each with its number, its name, what it is for and its state; part 1 done", async () => {
  const o = await claimed();
  has(o, "screen.setup.after"); lacks(o, "screen.setup.coming"); lacks(o, "screen.setup.lede");
  for (const k of PARTS) {
    assert.equal(partOf(o, k).tag, "details", k);
    const sum = summaryOf(o, k);
    for (const c of ["n", "t", "why", "cs-due"]) assert.equal(all(sum, (e) => e.attrs.class === c).length, 1, `${k}: ${c}`);
  }
  assert.equal(stateOf(o, "claim"), "done");
  assert.deepEqual(PARTS.slice(1).map((k) => stateOf(o, k)), ["optional", "done", "optional", "optional", "optional", "optional", "optional"]);
  for (const st of ["done", "optional"]) has(o, "screen.setup.state." + st);
  // the parts in the design's order, under their names
  for (const [k, t] of [["group", "part.group"], ["places", "places"], ["offices", "offices"], ["assistant", "assistant"], ["court", "court"], ["security", "security"], ["admins", "admins"]]) {
    assert.equal(all(summaryOf(o, k), (e) => e.attrs.class === "t")[0].children.map((c) => c.text).join(""), word("screen.setup." + t), k);
  }
  // part 2 open on the team's name (R14), the rest closed but the codes'
  assert.ok(isOpen(o, "claim") && isOpen(o, "group"));
  for (const k of PARTS.slice(2)) assert.ok(!isOpen(o, k), k);
});

test("R22 a saved name draws screen.setup.name.now with the accepted mark beside the field, and the team's name replaces the short name in the head; its help explains what changes", async () => {
  let name = null;
  const o = await claimed({ groupnameset: (b) => { name = b.name; return { ok: true, result: { ok: true } }; }, groupidentity: () => ({ ok: true, result: { ok: true, group: "river-town", display_name: name } }) });
  assert.ok(o.text.includes("river-town"), "the short name until named");
  await o.press("groupnameset", { values: { "su-name": "River Town" } });
  const mark = all(o.tree, (e) => e.attrs["data-state"] === "named")[0];
  assert.equal(mark.attrs["data-due"], "met");
  has(o, "screen.setup.name.now", { name: "River Town" });
  assert.ok(all(partOf(o, "group"), (e) => e === mark).length === 1, "beside the field, in part 2");
  assert.equal(stateOf(o, "group"), "done");
  assert.deepEqual(all(o.tree, (e) => e.attrs.class === "grp").map((e) => e.children.map((c) => c.text).join("")), ["River Town"]);
  assert.ok(!o.drawn().split("\n").at(-1).includes("river-town"), "the short name gone from the head");
  assert.ok(all(o.tree, (e) => /\bcs-card\b/.test(e.attrs.class || "")).map(tipOf).includes(said("screen.setup.name.tip")));
  // control: a name not yet saved draws no "now"
  lacks(await claimed(), "screen.setup.name.now", { name: "River Town" });
});

test("R22 the website: 'No' draws nothing more; 'Yes', explained by screen.setup.site.tip, opens the address and groupdomainset", async () => {
  const o = await claimed();
  const choice = all(o.tree, (e) => e.tag === "fieldset" && e.attrs.id === "su-site")[0];
  assert.equal(choice.attrs.class, "cs-choice");
  assert.ok(all(choice, (e) => /\bcs-card\b/.test(e.attrs.class || "")).map(tipOf).includes(said("screen.setup.site.tip")));
  assert.ok(!actOps(o.tree).includes("groupdomainset") && all(o.tree, (e) => e.attrs.id === "su-domain").length === 0, "no: nothing more");
  await choose(o, "su-site", 1);
  assert.ok(actOps(o.tree).includes("groupdomainset") && all(o.tree, (e) => e.attrs.id === "su-domain").length === 1);
  assert.ok(isOpen(o, "group"), "the part that holds the choice stays open");
  await choose(o, "su-site", 0);
  assert.ok(!actOps(o.tree).includes("groupdomainset"));
  // a team that holds a website opens on "Yes"
  const held = await claimed({ groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", domain: "rivertown.example" } } });
  assert.ok(actOps(held.tree).includes("groupdomainset"));
});

test("R22 the assistant: 'no' sends aikeepaway on with the reason and then hides every other element about AI in setup (screen.setup.ai.off); the part is off", async () => {
  let on = false;
  const o = await claimed({ aikeepaway: (b) => { on = b.on; return { ok: true, result: { ok: true } }; }, aikeepawaystate: () => ({ ok: true, result: { on, reason: on ? "We hold tips." : null } }) });
  assert.equal(stateOf(o, "assistant"), "optional");
  assert.equal(all(o.tree, (e) => e.tag === "fieldset" && e.attrs.id === "su-ai")[0].attrs.class, "cs-choice");
  has(o, "screen.setup.ai.yes.help");
  assert.ok(all(partOf(o, "assistant"), (e) => /\bcs-card\b/.test(e.attrs.class || "")).map(tipOf).includes(said("screen.setup.leaves.what")));
  await choose(o, "su-ai", 1);
  assert.ok(actOps(o.tree).includes("aikeepaway"));
  assert.equal(all(o.tree, (e) => e.attrs.id === "su-pay").length, 0, "no pay choice under 'no'");
  const r = await o.press("aikeepaway", { values: { "su-why": "We hold tips." }, data: { on: "on" } });
  assert.deepEqual(r.sent.filter((x) => x.op === "aikeepaway").map((x) => x.body), [{ on: true, reason: "We hold tips." }]);
  has(o, "screen.setup.ai.off"); has(o, "screen.setup.keepaway.on");
  assert.equal(stateOf(o, "assistant"), "off"); has(o, "screen.setup.state.off");
  // no AI field, key or pay choice is drawn after, whatever the page's radios say
  const ai = partOf(o, "assistant");
  assert.equal(all(ai, (e) => ["input", "select", "textarea"].includes(e.tag) && !/^su-skip-/.test(e.attrs.id || "")).length, 0);
  assert.deepEqual(actOps(ai), []);
  for (const k of ["screen.setup.pay.q", "screen.setup.key", "screen.setup.limit", "screen.setup.ai.q"]) lacks(o, k);
});

test("R22 control: choosing 'yes' draws no key field until 'your team pays' is chosen; the team's key, its switch and the limit only then", async () => {
  const o = await claimed();
  const keyed = () => all(o.tree, (e) => /^su-key/.test(e.attrs.id || "")).length;
  assert.equal(keyed(), 0); assert.ok(!actOps(o.tree).includes("groupkeyset"));
  has(o, "screen.setup.pay.q");
  await choose(o, "su-pay", 1);
  assert.equal(keyed(), 1);
  for (const op of ["groupkeyset", "ailimitset"]) assert.ok(actOps(o.tree).includes(op), op);
  has(o, "screen.setup.key.told");
  assert.ok(all(o.tree, (e) => /\bcs-card\b/.test(e.attrs.class || "")).map(tipOf).includes(said("screen.setup.key.tip")));
  await choose(o, "su-pay", 0);
  assert.equal(keyed(), 0);
});

test("R22 the place: screen.setup.place.other opens placewanted, and the offices part then says offices are added by hand", async () => {
  const o = await claimed({ placewantedstate: { ok: true, result: { name: "Fresno" } } });
  has(o, "screen.setup.offices.what", { place: "Profile A" });
  assert.ok(actOps(o.tree).includes("officesseed") && !actOps(o.tree).includes("placewanted"));
  o.fields["su-pick"] = "other"; await o.tick(300);
  assert.ok(actOps(o.tree).includes("placewanted") && !actOps(o.tree).includes("officesseed"));
  has(o, "screen.setup.offices.none", { place: "Fresno" }); lacks(o, "screen.setup.offices.what", { place: "Profile A" });
  assert.ok(actOps(o.tree).includes("entitycreate"), "an office added by hand");
  assert.ok(isOpen(o, "places"));
});

test("R22 each part's state is the one its read gives; control: a read that fails or does not answer leaves its part optional, never done", async () => {
  const doneAll = {
    groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town" } },
    entitieskind: { ok: true, result: { ok: true, kind: "office", entities: [{ id: "E-1", label: "City Clerk" }] } },
    courtnotice: { ok: true, result: { choice: "dont" } }, securitytools: { ok: true, result: { tools: [{ tool_id: "T-1" }] } },
    memberlist: { ok: true, result: { members: [{ member_id: "admin", founder: true, role: "admin", status: "active" }, { member_id: "dev", role: "admin", status: "active" }] } },
  };
  const o = await claimed(doneAll);
  assert.deepEqual(PARTS.map((k) => stateOf(o, k)), ["done", "done", "done", "done", "optional", "done", "done", "done"]);
  // the founder alone, or a second person who is not an administrator, is no second administrator
  const one = await claimed({ ...doneAll, memberlist: { ok: true, result: { members: [{ member_id: "admin", founder: true, role: "admin" }, { member_id: "mai", role: "member" }] } } });
  assert.equal(stateOf(one, "admins"), "optional");
  for (const fail of [{ ok: false, code: "DOOR_RATE_LIMITED" }, "none"]) {
    const f = await claimed({ ...doneAll, groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town" } },
      profiles: fail, entitieskind: fail, courtnotice: fail, securitytools: fail, memberlist: fail, aikeepawaystate: fail });
    assert.deepEqual(PARTS.slice(2).map((k) => stateOf(f, k)), ["optional", "optional", "optional", "optional", "optional", "optional"], JSON.stringify(fail));
  }
});

test("R22 the drawing's five states over a fake plane: unclaimed, just claimed, a founder with no handle, already claimed, a member opening setup", async () => {
  const e = await open("setup", { fragment: { boot: OTP }, table: plane() });
  has(e, "screen.setup.lede"); assert.equal(all(e.tree, (x) => x.tag === "details" && "open" in x.attrs).length, 1);
  const a = await claimed();
  has(a, "screen.setup.after"); has(a, "screen.setup.claimed", { group: said("screen.entry.group"), handle: HANDLE });
  // the claimed state marked as the release walk finds it (journey-check)
  assert.equal(all(summaryOf(a, "claim"), (x) => x.attrs["data-state"] === "claimed").length, 1);
  const b = await open("setup", { me: OLD_FOUNDER, table: plane() });
  assert.deepEqual(all(b.tree, (x) => x.tag === "h1").map((x) => x.children.map((c) => c.text).join("")), [word("founder.handle.title")]);
  assert.equal(all(b.tree, (x) => x.attrs["data-part"]).length, 0);
  const c = await open("setup", { fragment: { boot: OTP }, table: plane({ bootstrap: { ok: true, result: { ok: true, claimed: true } } }) });
  assert.deepEqual(all(c.tree, (x) => x.tag === "h1").map((x) => x.children.map((t) => t.text).join("")), [word("setup.claimed.heading")]);
  assert.equal(all(c.tree, (x) => /\bcs-gap\b/.test(x.attrs.class || "")).length, 1);
  const d = await open("setup", { me: JOINED, table: plane() });
  assert.deepEqual(all(d.tree, (x) => x.tag === "h1").map((x) => x.children.map((t) => t.text).join("")), [word("setup.member.heading")]);
  for (const s of [b, c, d]) assert.equal(all(s.tree, (x) => x.attrs["data-part"]).length, 0, "no parts");
});

// ---- R23: Skip for now, and the second administrator ----
test("R23 every part after part 1 carries 'Skip for now', explained by setup.skip_does; skipping each sends no request and marks it skipped, closed", async () => {
  const o = await claimed();
  assert.equal(all(partOf(o, "claim"), (e) => e.attrs["data-skip"]).length, 0, "part 1 has none");
  for (const k of PARTS.slice(1)) {
    const skip = all(partOf(o, k), (e) => e.attrs["data-skip"] === k);
    assert.equal(skip.length, 1, k);
    assert.equal(skip[0].children.filter((c) => c.text).map((c) => c.text).join("").trim(), word("setup.skip"));
    assert.equal(tipOf(skip[0]), said("setup.skip_does"));
  }
  for (const k of PARTS.slice(1)) {
    const before = o.requests.length;
    const was = stateOf(o, k);
    o.fields["su-skip-" + k] = true;
    await o.tick(300);
    assert.deepEqual(o.requests.slice(before), [], k + ": nothing sent");
    assert.equal(partOf(o, k).attrs["data-skipped"], "true", k);
    assert.ok(!isOpen(o, k), k + ": closed");
    assert.equal(stateOf(o, k), was, k + ": left as it is");
  }
  // un-skipped, it is as it was
  o.fields["su-skip-group"] = false; await o.tick(300);
  assert.equal(partOf(o, "group").attrs["data-skipped"], undefined);
  // control: nothing is kept but the page: setup opened again shows no part skipped
  const again = await open("setup", { me: FOUNDER, table: plane() });
  assert.equal(all(again.tree, (e) => e.attrs["data-skipped"]).length, 0);
});

test("R23 part 8's act is setup.admin.invite, explained by setup.admin.invite_does, sending memberadd with role admin; no plain invitation to a member is offered", async () => {
  const o = await claimed();
  const btn = all(partOf(o, "admins"), (e) => e.attrs["data-act"] === "memberadd");
  assert.equal(btn.length, 1);
  assert.equal(btn[0].children.map((c) => c.text).join(""), word("setup.admin.invite"));
  assert.equal(tipOf(btn[0].parent), said("setup.admin.invite_does"));
  assert.equal(all(o.tree, (e) => e.attrs["data-act"] === "memberadd").length, 1, "one invitation, the administrator's");
  const r = await o.press("memberadd", { values: { "su-adm-id": "dev", "su-adm-cover": "Dev" } });
  assert.deepEqual(r.sent.filter((x) => x.op === "memberadd").map((x) => x.body), [{ memberId: "dev", cover: "Dev", role: "admin" }]);
  // control: refused, the step is kept and nothing more is sent
  const n = await claimed({ memberadd: { ok: false, code: "EXISTS" } });
  const before = n.requests.length;
  await n.press("memberadd", { values: { "su-adm-id": "dev", "su-adm-cover": "Dev" } });
  assert.deepEqual(n.requests.slice(before).map((x) => x.op), ["memberadd"]);
  assert.ok(isOpen(n, "admins") && actOps(partOf(n, "admins")).includes("memberadd"));
  lacks(n, "screen.setup.admins.shown", { date: { html: date("2026-10-21") } });
});

// ---- R25: a skipped part reads "Skipped" ----
test("R25 a skipped part shows screen.setup.state.skipped with its help in the place of its state mark, sends nothing, and un-skipping restores the state its read gives; control: part 1 has no skip, a part never skipped draws its read's state, a refused part keeps its step", async () => {
  const o = await claimed();
  const mark = (k) => all(summaryOf(o, k), (e) => (e.attrs.class || "").includes("cs-due"))[0];
  const markText = (k) => squash(unescape(mark(k).children.filter((c) => c.text).map((c) => c.text).join("")));
  const was = stateOf(o, "places");
  assert.equal(markText("places"), squash(word("screen.setup.state." + was)));
  const before = o.requests.length;
  o.fields["su-skip-places"] = true; await o.tick(300);
  assert.deepEqual(o.requests.slice(before), [], "nothing sent");
  assert.equal(markText("places"), squash(word("screen.setup.state.skipped")));
  assert.equal(tipOf(mark("places")), said("screen.setup.state.skipped.help"));
  assert.ok(!isOpen(o, "places"));
  // the other parts keep what their reads give
  assert.equal(markText("court"), squash(word("screen.setup.state." + stateOf(o, "court"))));
  // un-skipping restores the state its read gives
  o.fields["su-skip-places"] = false; await o.tick(300);
  assert.equal(markText("places"), squash(word("screen.setup.state." + was)));
  assert.equal(tipOf(mark("places")), "");
  // control: part 1 has no skip and is never skipped
  assert.equal(all(partOf(o, "claim"), (e) => e.attrs["data-skip"]).length, 0);
  assert.equal(partOf(o, "claim").attrs["data-skipped"], undefined);
  // control: a refused part keeps its step
  const n = await claimed({ courtnoticeset: { ok: false, code: "NOT_AN_ADMIN" } });
  const b = n.requests.length;
  await n.press("courtnoticeset", { values: { "su-court-0": true } });
  assert.deepEqual(n.requests.slice(b).map((x) => x.op), ["courtnoticeset"]);
  assert.ok(isOpen(n, "court"));
});

// ---- the security tools are named by the catalogue's display name, never by an id (journey-check R27; K4097) ----
test("R6 a security tool is drawn by its vendor and product from the catalogue read, never by its provider id; control: a tool the catalogue does not name draws no id", async () => {
  const o = await claimed({ securitytools: { ok: true, result: { tools: [{ tool_id: "T-1", provider_id: "scan-co", state: "on" }, { tool_id: "T-2", provider_id: "other-co-id", state: "on" }] } } });
  const legends = all(partOf(o, "security"), (e) => e.tag === "legend").map((e) => squash(e.children.map((c) => c.text || "").join("")));
  assert.deepEqual(legends, ["Scan · Co"]);
  has(o, "screen.setup.security.held", { tool: "Scan · Co" });
  for (const id of ["scan-co", "other-co-id"]) assert.ok(!o.drawn().includes(id), id + " drawn");
  const r = await o.press("securitytooladd", { values: { "su-st-0-cfg-0": "eu", "su-st-0-cred-0": "tool-secret", "su-st-0-keep": true }, data: { tool: "0" } });
  has(o, "screen.setup.security.passed", { tool: "Scan · Co" });
  assert.ok(!o.drawn().includes("scan-co"));
});

// ---- R26: the team's website file, drawn from the answer ----
// The file is whatever the fake plane answers as `well_known`; the tests read it back from the answer and never build one.
const WK = { path: "/.well-known/civicsmith-group.json", body: { instance: "https://wk-sentinel-one.example", group: "wk-sentinel-slug" } };
const WK2 = { path: "/.well-known/other-name.json", body: { instance: "https://wk-sentinel-two.example", group: "wk-other-slug" } };
const claimOf = (over = {}) => ({ domain: "rivertown.example", set_at: "2026-10-01T00:00:00Z", latest: { verdict: "verified" }, well_known: WK, ...over });
const withClaim = (over = {}) => ({ groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", domain: "rivertown.example", domain_claim: claimOf(over) } } });
const folds = (o) => all(o.tree, (e) => e.tag === "details" && "data-domainfile" in e.attrs);
const gapsOf = (n) => all(n, (e) => /\bcs-gap\b/.test(e.attrs.class || "")).map((e) => squash(textOf(e)));
const verifierWords = ["malformed", "absent", "mismatched", "undetermined", "notadmin"].map((k) => "screen.domainfile.refused." + k);

test("R26 setup with a website entered draws the file from the answer's well_known, a save and a copy of it, and the steps to place it; control: the file follows the answer", async () => {
  for (const wk of [WK, WK2]) {
    const o = await claimed(withClaim({ well_known: wk }));
    const [fold] = folds(o);
    assert.equal(folds(o).length, 1);
    assert.equal(all(fold, (e) => e.tag === "summary")[0].children.map((c) => c.text).join(""), said("screen.domainfile.summary"));
    has(o, "screen.domainfile.what"); has(o, "screen.domainfile.steps"); has(o, "screen.domainfile.daily");
    const file = wk.path.split("/").filter(Boolean).at(-1), folder = wk.path.split("/").filter(Boolean)[0];
    const pre = all(fold, (e) => e.tag === "pre")[0];
    assert.deepEqual(JSON.parse(textOf(pre)), wk.body, "the file's text is the answer's body");
    assert.ok(texts(fold).includes(file), "the file is named by the last segment of the answer's path");
    assert.equal(o.saves.at(-1).name, file);
    assert.deepEqual(JSON.parse(o.saves.at(-1).text), wk.body);
    assert.deepEqual(JSON.parse(o.copies.at(-1)), wk.body);
    const shellActs = all(fold, (e) => e.tag === "button" && e.attrs["data-shell"]).map((e) => e.attrs["data-shell"]).sort();
    assert.deepEqual(shellActs, ["copy", "save"]);
    assert.ok(texts(fold).some((t) => t.includes(said("screen.domainfile.download"))));
    const steps = all(fold, (e) => e.tag === "li").map((e) => squash(textOf(e)));
    assert.deepEqual(steps, [
      said("screen.domainfile.step1"), said("screen.domainfile.step2", { folder }), said("screen.domainfile.step3"),
      said("screen.domainfile.step4", { address: "https://rivertown.example" + wk.path }), said("screen.domainfile.step5"),
    ]);
    for (const k of verifierWords) assert.ok(o.text.split(said(k)).length - 1 === 1, `${k} is drawn once, in the fold, for a verified claim`);
  }
  // the page sends nothing to draw it
  const o = await claimed(withClaim());
  assert.ok(!o.requests.some((r) => r.op === "groupdomainset"), "drawing the file asks nothing of the team");
});

test("R26 control: an answer with no file draws the steps without one; no claim draws no fold", async () => {
  const o = await claimed(withClaim({ well_known: null }));
  const [fold] = folds(o);
  assert.equal(all(fold, (e) => e.tag === "pre").length, 0);
  assert.equal(all(fold, (e) => e.tag === "button").length, 0, "no save, no copy");
  assert.ok(o.saves.every((x) => x.name === "recovery-codes.txt") && o.copies.every((x) => x.startsWith(CODES[0])), "only the recovery codes are offered to save or copy");
  assert.deepEqual(all(fold, (e) => e.tag === "li").map((e) => squash(textOf(e))), [said("screen.domainfile.step1"), said("screen.domainfile.step3"), said("screen.domainfile.step5")]);
  has(o, "screen.domainfile.what"); has(o, "screen.domainfile.refused.summary");
  const none = await claimed({ groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town", domain: null, domain_claim: null } } });
  await choose(none, "su-site", 1);
  assert.equal(folds(none).length, 0);
  lacks(none, "screen.domainfile.summary");
  const no = await claimed(withClaim());
  await choose(no, "su-site", 0);
  assert.equal(folds(no).length, 0, "the choice 'No' draws nothing more");
});

test("R26 the verifier's refusals are drawn by their words: the claim's latest check beside the act, and each refusal in its fold", async () => {
  for (const verdict of ["absent", "mismatched", "undetermined"]) {
    const o = await claimed(withClaim({ latest: { verdict } }));
    const key = "screen.domainfile.refused." + verdict;
    assert.equal(o.text.split(said(key)).length - 1, 2, `${verdict}: beside the act and in the fold`);
    assert.ok(gapsOf(o.tree).includes(said(key)));
    const fold = folds(o)[0];
    const inner = all(fold, (e) => e.tag === "details" && e !== fold)[0];
    assert.deepEqual(gapsOf(inner), verifierWords.map((k) => said(k)));
  }
  const ok = await claimed(withClaim());
  assert.equal(gapsOf(folds(ok)[0]).length, 5);
  assert.equal(ok.text.split(said("screen.domainfile.refused.absent")).length - 1, 1);
});

test("R26 groupdomainset refused GROUP_DOMAIN_MALFORMED or NOT_AN_ADMIN draws its words in the design's, and sends nothing more", async () => {
  for (const [code, key] of [["GROUP_DOMAIN_MALFORMED", "screen.domainfile.refused.malformed"], ["NOT_AN_ADMIN", "screen.domainfile.refused.notadmin"]]) {
    const o = await claimed({ ...withClaim(), groupdomainset: { ok: false, code } });
    const r = await o.press("groupdomainset", { values: { "su-domain": "https://rivertown.example/page" } });
    assert.deepEqual(r.sent.map((x) => x.op), ["groupdomainset"]);
    assert.equal(o.refused.text, said(key));
  }
});

// ---- R30: who recorded the hosting account ----
test("R30 where setup shows who recorded hosting access, the setup and the system have their words; control: a member's is as before", async () => {
  const at = "2026-10-01T00:00:00Z";
  const holders = "The treasurer";
  for (const [by, key] of [["setup", "screen.group.hosting.now.setup"], ["bootstrap", "screen.group.hosting.now.setup"], ["system:seed", "screen.group.hosting.now.system"], ["token:ops", "screen.group.hosting.now.system"]]) {
    const o = await claimed({ hostingaccess: { ok: true, result: { current: { holders, recorded_by: by, at } } } });
    has(o, key, { date: { html: date(at) } });
    assert.ok(o.text.includes(holders));
    lacks(o, "screen.setup.hosting.now", { holders });
    for (const other of ["screen.group.hosting.now.setup", "screen.group.hosting.now.system"].filter((k) => k !== key)) lacks(o, other, { date: { html: date(at) } });
  }
  const member = await claimed({ hostingaccess: { ok: true, result: { current: { holders, recorded_by: "member:mai", at } } } });
  has(member, "screen.setup.hosting.now", { holders });
  lacks(member, "screen.group.hosting.now.setup", { date: { html: date(at) } }); lacks(member, "screen.group.hosting.now.system", { date: { html: date(at) } });
});

// ---- R33: step 7 draws the scanner's true state (C83) ----
// `scanstatus` as file-safety R46 answers a scanner that holds no signatures; the words are the answer's keys, read as it carries them.
const NOSIG = (over = {}) => ({
  since: "2026-10-15T03:00:00Z", reason: "REFUSED:main.cvd:403",
  key: "file-safety.index.no_signatures_since", words: "own words: since",
  reason_key: "file-safety.index.signatures_refused", reason_words: "own words: refused", ...over,
});
const SCAN = (over = {}) => ({ scanstatus: { ok: true, result: { ok: true, scanner: { bound: true, version: "1.0" }, queued: 48, held: 0, ...over } } });
const NOSIG_WORDS = ["file-safety.index.no_signatures_since", "file-safety.index.no_signatures", "file-safety.index.signatures_refused", "file-safety.index.signatures_failed", "file-safety.index.signatures_not_fetched"];
const securityText = (o) => squash(textOf(partOf(o, "security")));

test("R33 a scanner holding no signatures draws since when and why, from the answer, and not the checked sentence; control: signatures held draw the checked sentence and none of those words", async () => {
  const o = await claimed(SCAN({ no_signatures: NOSIG() }));
  assert.ok(o.requests.some((r) => r.op === "scanstatus" && r.header), "the administrator's own read, under her session");
  const text = securityText(o);
  assert.ok(text.includes(said("file-safety.index.no_signatures_since", { date: date("2026-10-15") })), "since when");
  assert.ok(text.includes(said("file-safety.index.signatures_refused", { status: "403" })), "why, in words");
  assert.ok(!text.includes(said("screen.setup.security.scanner")), "not 'checked'");
  assert.ok(!o.drawn().includes("REFUSED:main.cvd"), "never the scanner's own code");
  // the date and the reason follow the answer
  const other = await claimed(SCAN({ no_signatures: NOSIG({ since: "2026-09-02T00:00:00Z", reason: "ENOTFOUND", key: "file-safety.index.no_signatures_since", reason_key: "file-safety.index.signatures_failed" }) }));
  const t2 = securityText(other);
  assert.ok(t2.includes(said("file-safety.index.no_signatures_since", { date: date("2026-09-02") })));
  assert.ok(t2.includes(said("file-safety.index.signatures_failed")));
  assert.ok(!t2.includes(said("file-safety.index.signatures_refused", { status: "403" })));
  // no date known, no download yet: the answer's other keys
  const none = await claimed(SCAN({ no_signatures: NOSIG({ since: null, reason: "SIGNATURES_ABSENT", key: "file-safety.index.no_signatures", reason_key: "file-safety.index.signatures_not_fetched" }) }));
  const t3 = securityText(none);
  assert.ok(t3.includes(said("file-safety.index.no_signatures")) && t3.includes(said("file-safety.index.signatures_not_fetched")));
  assert.ok(!t3.includes(said("screen.setup.security.scanner")));
  // a key the list lacks is drawn as the answer's own words, never as the key
  const own = await claimed(SCAN({ no_signatures: NOSIG({ key: "file-safety.index.nonesuch", reason_key: "file-safety.index.nonesuch2" }) }));
  const t4 = securityText(own);
  assert.ok(t4.includes("own words: since") && t4.includes("own words: refused") && !t4.includes("nonesuch"));
  // control: signatures held (the answer carries no `no_signatures`)
  const held = await claimed(SCAN());
  const th = securityText(held);
  assert.ok(th.includes(said("screen.setup.security.scanner")), "checked");
  for (const k of NOSIG_WORDS) assert.ok(!held.drawn().includes(said(k, { date: "", status: "" }).slice(0, 20)), k);
  assert.ok(!/no signatures/i.test(th));
});

test("R33 control: no scanner part draws neither the checked sentence nor a no-signature state; a read that does not answer, or a scanner that cannot be reached, draws no 'checked'", async () => {
  const off = { bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: false } } };
  for (const over of [off, { ...off, ...SCAN({ no_signatures: NOSIG() }) }]) {
    const o = await claimed(over);
    const text = securityText(o);
    assert.ok(!text.includes(said("screen.setup.security.scanner")));
    assert.ok(!text.includes(said("file-safety.index.no_signatures_since", { date: date("2026-10-15") })));
  }
  for (const fail of [{ ok: false, code: "NOT_AN_ADMIN" }, "none"]) {
    const o = await claimed({ scanstatus: fail });
    const text = securityText(o);
    assert.ok(!text.includes(said("screen.setup.security.scanner")), JSON.stringify(fail));
    assert.deepEqual(PARTS.map((k) => stateOf(o, k)).slice(1, 2), ["optional"], "the rest of the page is as before");
  }
  const lost = await claimed(SCAN({ scanner: { bound: true, version: null, unreachable: true } }));
  assert.ok(!securityText(lost).includes(said("screen.setup.security.scanner")), "unreachable");
});
