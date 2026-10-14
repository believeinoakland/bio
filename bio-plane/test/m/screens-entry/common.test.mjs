/* screens-entry R8–R11 and the screen contract (interface-shell R5, R21, R22), over every screen in its states. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, all, texts, WORDS, SCREENS, SCREEN_WORDS, JOINED, FOUNDER } from "./kit.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";

const REGISTRY = JSON.parse(fs.readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const REG = (REGISTRY.screens || REGISTRY);

// one fake plane answering every read and act of the six screens
const SECRET = { pw: "sentinel-pw-0a1b2c3d", otp: "sentinel-otp-4e5f", code: "SENT-CODE-9X9X", reset: "sentinel-reset-77", invite: "sentinel-invite-66", join: "sentinel-join-55", key: "sentinel-key-44" };
const PLANE = {
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town" } },
  groupdescription: { ok: true, result: { description: { focus: "Leases", purpose: "Checking terms." } } },
  publishedlist: { ok: true, result: { bundles: [{ bundle_id: "F-1", title: "A finding", attestor_member: "dev" }], cases: [{ case_id: "C-1", edition: 1, findings: ["F-1"], signed_at: "2026-10-01" }] } },
  login: { ok: true, result: { ok: true, token: "tok-1" } },
  recover: { ok: true, result: { ok: true, remaining: 9 } },
  passwordresetlook: { ok: true, result: { ok: true, handle: "mai", until: "2026-10-21" } },
  passwordreset: { ok: true, result: { ok: true } },
  bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true, part_scanner: true } },
  claim: { ok: true, result: { ok: true } },
  recoverycodesissue: { ok: true, result: { ok: true, codes: ["C1", "C2"] } },
  profiles: { ok: true, result: { ok: true, profiles: [], choices: [{ id: "p", name: "A profile" }] } },
  securitytoolcatalogue: { ok: true, result: { offered: [] } },
  invitelook: { ok: true, result: { ok: true, cover: "Mai" } },
  grouplanguages: { ok: true, result: { languages: ["en"] } },
  joinlinkinvite: { ok: true, result: { ok: true, invite: SECRET.invite } },
  enroll: { ok: true, result: { ok: true, memberId: "mai" } },
};
// every screen drawn in its states, each with what it is shown as record data
const STATES = [
  ["front", {}], ["front", { session: { state: "signedout", handle: "mai" } }], ["front", { session: { state: "ended", handle: "mai" } }], ["front", { session: { state: "locked", handle: "mai" } }],
  ...[1, 2, 3, 4, 5, 6].map((n) => ["tour", { subject: String(n) }]),
  ["forgot", {}], ["reset", { fragment: { reset: SECRET.reset } }], ["reset", {}],
  ["setup", { fragment: { boot: SECRET.otp } }], ["setup", { fragment: { boot: SECRET.otp }, me: FOUNDER }],
  ["join", { fragment: { invite: SECRET.invite } }], ["join", { fragment: { join: SECRET.join } }], ["join", {}],
];
const DATA = ["River Town", "Leases", "Checking terms.", "A finding", "mai", "Mai", "A profile", "en", "C1", "C2"];

/* interface-shell R5: a drawn text node is a word's text, filled, or the record's own data */
const PATTERNS = [...WORDS.values()].filter((en) => en.replace(/\{\w+\}/g, "").replace(/[\s\p{P}]/gu, "").length >= 3).map((en) => new RegExp("^" + en.replace(/\s+/g, " ").trim().split(/\{\w+\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s\\S]*") + "$"));
const isWord = (t) => PATTERNS.some((p) => p.test(t));
const parts = (t) => t.split(/\s*[·›]\s*/).filter(Boolean);

test("R9 every text a screen draws is a word by key, filled, or the record's own data (interface-shell R5)", async () => {
  for (const [id, o] of STATES) {
    const s = await open(id, { table: PLANE, ...o });
    for (const t of texts(s.tree)) assert.ok(isWord(t) || DATA.includes(t) || parts(t).every((p) => isWord(p) || DATA.includes(p)) || /^[A-Z0-9\n-]+$/.test(t), `${id}: "${t}" is no word`);
  }
  // control: a sentence no list holds is found
  assert.ok(!isWord("Welcome to our lovely page, friend."));
});

test("R9 every field has a label and every control a name (interface-shell R22); headings and acts are the shell's (R8–R13)", async () => {
  for (const [id, o] of STATES) {
    const s = await open(id, { table: PLANE, ...o });
    const labels = new Set(all(s.tree, (e) => e.tag === "label").map((e) => e.attrs.for).filter(Boolean));
    for (const f of all(s.tree, (e) => ["input", "select", "textarea"].includes(e.tag))) {
      const wrapped = (() => { for (let p = f.parent; p; p = p.parent) if (p.tag === "label") return true; return false; })();
      assert.ok(labels.has(f.attrs.id) || wrapped, `${id}: field ${f.attrs.id} has no label`);
    }
    for (const c of all(s.tree, (e) => e.tag === "button" || (e.tag === "a" && e.attrs.href))) assert.ok(texts(c).join("").trim() || c.attrs["aria-label"], `${id}: a control with no name`);
    assert.equal(all(s.tree, (e) => e.tag === "h1").length, 1, `${id}: one heading`);
    // the public and setup frames' screens draw no rail, tabs or dock of their own
    assert.equal(all(s.tree, (e) => /cs-(rail|tabs|dock)\b/.test(e.attrs.class || "")).length, 0, id);
  }
});

test("R8 sentinels across every flow: no password, one-time password, code, reset or invitation link in an address, a query, a link drawn or a later request", async () => {
  const flows = [
    ["front", {}, "login", { "fs-handle": "mai", "fs-pw": SECRET.pw }],
    ["forgot", {}, "recover", { "fg-handle": "mai", "fg-code": SECRET.code, "fg-pw": SECRET.pw, "fg-pw2": SECRET.pw }],
    ["reset", { fragment: { reset: SECRET.reset } }, "passwordreset", { "rs-pw": SECRET.pw, "rs-pw2": SECRET.pw }],
    ["setup", { fragment: { boot: SECRET.otp } }, "claim", { "su-pw": SECRET.pw, "su-pw2": SECRET.pw }],
    ["join", { fragment: { invite: SECRET.invite } }, "enroll", { "jn-handle": "mai", "jn-pw": SECRET.pw, "jn-pw2": SECRET.pw }],
  ];
  // the one request (with the sign-in that follows a claim or an enrolment) whose body may carry each secret
  const OWN = { [SECRET.pw]: ["login", "recover", "passwordreset", "claim", "enroll"], [SECRET.otp]: ["claim"], [SECRET.code]: ["recover"], [SECRET.reset]: ["passwordresetlook", "passwordreset"], [SECRET.invite]: ["invitelook", "enroll", "handlecheck"] };
  for (const [id, o, op, values] of flows) {
    const s = await open(id, { table: PLANE, signinAs: id === "join" ? JOINED : FOUNDER, ...o });
    if (id === "join") { await s.press("handlecheck", { values: { "jn-handle": "mai" } }); }
    await s.press(op, { values });
    for (const r of s.requests) {
      const q = JSON.stringify(r.query || {});
      for (const [secret, ops] of Object.entries(OWN)) {
        assert.ok(!q.includes(secret), `${id}: ${r.op}'s address carries a secret`);
        if (JSON.stringify(r.body || {}).includes(secret)) assert.ok(ops.includes(r.op), `${id}: ${r.op}'s body carries ${secret}`);
      }
    }
    const drawn = s.drawn();
    for (const secret of [SECRET.pw, SECRET.code, SECRET.reset, SECRET.invite]) assert.ok(!drawn.includes(secret), `${id}: ${secret} drawn`);
    for (const href of all(s.tree, (e) => e.tag === "a").map((e) => e.attrs.href)) for (const secret of Object.values(SECRET)) assert.ok(!String(href).includes(secret), `${id}: a link carries a secret`);
    assert.ok(!("pending" in s.view.ui), `${id}: a password left in the page's memory`);
  }
});

test("R10 no place is named in this module's words or in anything its screens draw", async () => {
  const PLACES = /Oakland|California|Alameda|Coliseum|Lakeshore|Fresno|Seminary|San Francisco|Berkeley|United States|\bCity of\b|\bthe city\b|\bcouncil\b/i;
  for (const [k, en] of SCREEN_WORDS) assert.doesNotMatch(en, PLACES, k);
  for (const [id, o] of STATES) assert.doesNotMatch((await open(id, { table: PLANE, ...o })).drawn(), PLACES, id);
  assert.match("the Coliseum lease", PLACES, "control");
});

test("R11 each screen is drawn at its address with or without a session record; setup and join never forward a signed-in visitor away", async () => {
  for (const id of ["front", "tour", "forgot", "reset", "setup", "join"]) {
    for (const session of [{ state: "none" }, { state: "live", handle: "mai" }]) {
      const s = await open(id, { table: PLANE, session, me: session.state === "live" ? JOINED : null, fragment: { boot: SECRET.otp, invite: SECRET.invite, reset: SECRET.reset } });
      assert.ok(all(s.tree, (e) => e.tag === "h1").length === 1, `${id} drawn`);
      assert.deepEqual(s.gone, [], `${id} forwards nowhere`);
      assert.deepEqual(s.signins, [], `${id} hands nothing over by itself`);
    }
  }
});

test("R9 the contract: six screens, each a registry screen in its frame; every act names an op OPS holds and the registry lists for it", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["front", "tour", "forgot", "reset", "setup", "join"]);
  const FRAME = { front: "public", tour: "public", forgot: "public", reset: "public", setup: "setup", join: "setup" };
  for (const s of SCREENS) {
    const reg = REG.find((r) => r.id === s.id);
    assert.ok(reg, s.id);
    assert.equal(reg.frame, FRAME[s.id], s.id);
    assert.ok(Object.isFrozen(s) && Object.isFrozen(s.acts) && Object.isFrozen(s.words));
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${s.id}: ${a.op} not in OPS`);
      assert.ok(reg.acts.some((x) => x.op === a.op), `${s.id}: ${a.op} is not the registry's`);
    }
    // every registry act of the screen is drawn by it (R1–R7), but join's memberlanguageset, sent once the member's
    // session exists (R7), since no act but a public one is drawn before it
    for (const x of reg.acts) assert.ok(s.acts.some((a) => a.op === x.op) || (s.id === "join" && x.op === "memberlanguageset"), `${s.id}: the registry's ${x.op} is not drawn`);
  }
});

test("R9 the words: SCREEN_WORDS frozen [key, en, protected] rows, keys distinct; each screen's words hold every key it draws", async () => {
  assert.ok(Object.isFrozen(SCREEN_WORDS));
  const keys = new Set();
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[1] === "string" && typeof r[2] === "boolean");
    assert.match(r[0], /^(screen\.(entry|front|tour|forgot|reset|setup|join|hosting)\.[a-z0-9.-]+|handle\.fixed)$/, r[0]);
    assert.ok(!keys.has(r[0]), r[0]); keys.add(r[0]);
  }
  const rows = new Set(WORD_ROWS.map((r) => r[0]));
  for (const s of SCREENS) {
    const listed = new Set(s.words.map((x) => (Array.isArray(x) ? x[0] : x)));
    for (const k of listed) if (!Array.isArray(s.words.find((x) => (Array.isArray(x) ? x[0] : x) === k))) assert.ok(rows.has(k) || WORDS.has(k), `${s.id}: ${k} held by no list`);
  }
});
