/* screens-entry R6: `setup`, the founder's claim and the group's first settings, walked over a fake plane from the claim
   to "Finished", at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, date, all, actOps, links, SCREEN_WORDS } from "./kit.mjs";

const OTP = "otp-sentinel-5d1e";
const PW = "founder long password";
const CODES = ["AAAA-1111", "BBBB-2222", "CCCC-3333", "DDDD-4444", "EEEE-5555", "FFFF-6666", "GGGG-7777", "HHHH-8888", "IIII-9999", "JJJJ-0000"];
const CATALOGUE = { offered: [{ provider_id: "scan-co", name: "Scan Co", config: [{ name: "region", label: "Region", required: true }, { name: "note", label: "Note", required: false }], credentials: ["api_key"], handling_digest: "d1" }] };
const plane = (over = {}) => ({
  bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: true } },
  claim: { ok: true, result: { ok: true, consumedAt: "2026-10-14T00:00:00Z" } },
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
  await o.press("claim", { values: { "su-pw": PW, "su-pw2": PW } });
  return o;
}

test("R6 the claim: the one-time password filled from #boot=, the founder's password twice; only the claim is offered before a session", async () => {
  const o = await open("setup", { fragment: { boot: OTP }, table: plane() });
  assert.deepEqual(o.requests.map((r) => r.op), ["bootstrap"]);
  assert.equal(all(o.tree, (e) => e.attrs.id === "su-otp")[0].attrs.value, OTP);
  assert.deepEqual(actOps(o.tree), ["claim"]);
  has(o, "screen.setup.claim"); has(o, "screen.hosting.heading"); has(o, "screen.hosting.s1");
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 2);
});

test("R6 claim, then login as admin on an own device, the session handed over, then recoverycodesissue: the ten codes shown once", async () => {
  const o = await claimed();
  assert.deepEqual(o.requests.slice(1, 4).map((r) => [r.op, r.body]), [
    ["claim", { bootstrapToken: OTP, password: PW }],
    ["login", { handle: "admin", password: PW, device: "own" }],
    ["recoverycodesissue", {}],
  ]);
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [["tok-founder", { device: "own", handle: "admin", stay: true }]]);
  assert.equal(o.requests[3].header, true, "the codes asked under the new session");
  has(o, "screen.setup.claimed"); has(o, "screen.entry.codes.heading"); has(o, "screen.entry.codes.what");
  const pre = all(o.tree, (e) => e.tag === "pre")[0];
  assert.deepEqual(pre.children.map((c) => c.text).join("").split("\n"), CODES);
  // saved as a file made in the page, or copied (interface-shell R47), the codes and nothing else
  assert.ok(all(o.tree, (e) => e.attrs["data-shell"] === "save").length === 1 && all(o.tree, (e) => e.attrs["data-shell"] === "copy").length === 1);
  assert.equal(o.saves.at(-1).name, "recovery-codes.txt");
  assert.deepEqual(o.saves.at(-1).text.trim().split("\n"), CODES);
  assert.deepEqual(o.copies.at(-1).split("\n"), CODES);
  assert.ok(!("pending" in o.view.ui), "the password left the page's memory");
});

test("R6 control: two passwords that differ, a short one, or no one-time password send nothing", async () => {
  const o = await open("setup", { fragment: {}, table: plane() });
  for (const [values, key] of [[{ "su-otp": OTP, "su-pw": PW, "su-pw2": PW + "x" }, "screen.entry.differ"], [{ "su-otp": OTP, "su-pw": "short", "su-pw2": "short" }, "screen.entry.short"], [{ "su-otp": "", "su-pw": PW, "su-pw2": PW }, "screen.setup.nootp"]]) {
    assert.deepEqual((await o.press("claim", { values })).sent, []);
    assert.equal(o.refused.key, key);
  }
});

test("R6 already claimed, not armed, and a claim refused ALREADY_CLAIMED each say so; a claim whose sign-in fails says sign in", async () => {
  has(await open("setup", { table: plane({ bootstrap: { ok: true, result: { ok: true, claimed: true } } }) }), "screen.setup.taken");
  has(await open("setup", { table: plane({ bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: false } } }) }), "screen.setup.unarmed");
  const r = await open("setup", { fragment: { boot: OTP }, table: plane({ claim: { ok: false, code: "ALREADY_CLAIMED" } }) });
  await r.press("claim", { values: { "su-pw": PW, "su-pw2": PW } });
  assert.equal(r.refused.text, said("screen.setup.taken"));
  assert.equal(r.requests.filter((x) => x.op === "login").length, 0, "a refused claim sends nothing more");
  const n = await claimed({ login: { ok: false, code: "SIGN_IN_REFUSED" } });
  has(n, "screen.setup.claimed.nosignin");
  assert.ok(links(n.tree).includes("/app/front"));
});

test("R6 after the claim every part is the registry's act for it, each drawn", async () => {
  const o = await claimed();
  assert.deepEqual(actOps(o.tree), ["aikeepaway", "ailimitset", "courtnoticeset", "entitycreate", "groupdomainset", "groupkeyset", "groupnameset",
    "hostingaccessset", "memberadd", "officesseed", "placewanted", "profilesset", "securitytooladd"].sort());
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

test("R6 the words: no sentence says administrators see spending by member (DEC-188 (5)); 'file scanner' and 'safe view' only (DEC-200 (5))", () => {
  for (const [k, en] of SCREEN_WORDS) {
    assert.doesNotMatch(en, /(see|sees|seeing)[^.]*(spend|spending|use)[^.]*by member|each member's (spending|use)[^.]* (seen|visible)/i, k);
    assert.doesNotMatch(en, /virus scanner|antivirus|sandbox|safe-view maker|\bsafe copy maker\b/i, k);
  }
  // control: the pattern finds one
  assert.match("administrators see spending by member", /(see|sees|seeing)[^.]*(spend|spending|use)[^.]*by member/i);
  assert.ok(SCREEN_WORDS.some(([, en]) => /file scanner/.test(en)) && SCREEN_WORDS.some(([, en]) => /safe view/.test(en)));
});
