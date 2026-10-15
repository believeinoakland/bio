/* screens-entry R8–R11, R21 and the screen contract (interface-shell R5, R21, R22), over every screen in its states. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { open, all, texts, WORDS, SCREENS, SCREEN_WORDS, JOINED, FOUNDER, OLD_FOUNDER, AN_ADMIN, word, hasWord, sentence, unescape, squash } from "./kit.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

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
  claim: { ok: true, result: { ok: true, handle: "rivera" } },
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
  ["setup", { me: OLD_FOUNDER }], ["setup", { me: JOINED }], ["setup", { me: AN_ADMIN }],
  ["setup", { table: { ...PLANE, bootstrap: { ok: true, result: { ok: true, claimed: true } } } }],
  ["join", { fragment: { invite: SECRET.invite } }], ["join", { fragment: { join: SECRET.join } }], ["join", {}],
];
const DATA = ["River Town", "Leases", "Checking terms.", "A finding", "mai", "Mai", "A profile", "English", "C1", "C2", "rivera"];

/* interface-shell R5: a drawn text node is a word's text, filled, or the record's own data */
const PATTERNS = [...WORDS.values()].filter((en) => en.replace(/\{\w+\}/g, "").replace(/[\s\p{P}]/gu, "").length >= 3).map((en) => new RegExp("^" + en.replace(/\s+/g, " ").trim().split(/\{\w+\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s\\S]*") + "$"));
const isWord = (t) => PATTERNS.some((p) => p.test(t));
const parts = (t) => t.split(/\s*[·›]\s*/).filter(Boolean);

test("R9 every text a screen draws is a word by key, filled, or the record's own data (interface-shell R5)", async () => {
  for (const [id, o] of STATES) {
    const s = await open(id, { ...o, table: o.table || PLANE });
    for (const t of texts(s.tree)) assert.ok(isWord(t) || DATA.includes(t) || parts(t).every((p) => isWord(p) || DATA.includes(p)) || /^[A-Z0-9\n-]+$/.test(t), `${id}: "${t}" is no word`);
  }
  // control: a sentence no list holds is found
  assert.ok(!isWord("Welcome to our lovely page, friend."));
});

test("R9 every field has a label and every control a name (interface-shell R22); headings and acts are the shell's (R8–R13)", async () => {
  for (const [id, o] of STATES) {
    const s = await open(id, { ...o, table: o.table || PLANE });
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
    ["setup", { fragment: { boot: SECRET.otp } }, "claim", { "su-handle": "rivera", "su-pw": SECRET.pw, "su-pw2": SECRET.pw }],
    ["join", { fragment: { invite: SECRET.invite } }, "enroll", { "jn-handle": "mai", "jn-pw": SECRET.pw, "jn-pw2": SECRET.pw }],
  ];
  // the requests whose body may carry the flow's secrets, read from the screens' own declarations (N1073): the acts the
  // flow presses, the reads its screen declares with a body, and front's sign-in act, which a claim and an enrolment
  // send next
  const SIGN_IN = SCREENS.find((x) => x.id === "front").acts[0].op;
  for (const [id, o, op, values] of flows) {
    const s = await open(id, { table: PLANE, signinAs: id === "join" ? JOINED : FOUNDER, ...o });
    const pressed = [op];
    if (id === "join") { await s.press("handlecheck", { values: { "jn-handle": "mai" } }); pressed.push("handlecheck"); }
    await s.press(op, { values });
    const spec = SCREENS.find((x) => x.id === id);
    const bodied = Object.values(spec.reads ? spec.reads(s.view) || {} : {}).concat(Object.values(spec.reads ? spec.reads({ ...s.view, ui: {}, me: null }) || {} : {})).filter((r) => r.body).map((r) => r.op);
    const own = new Set([...pressed, ...bodied, ...(["claim", "enroll"].includes(op) ? [SIGN_IN] : [])]);
    for (const r of s.requests) {
      const q = JSON.stringify(r.query || {});
      for (const secret of Object.values(SECRET)) {
        assert.ok(!q.includes(secret), `${id}: ${r.op}'s address carries a secret`);
        if (JSON.stringify(r.body || {}).includes(secret)) assert.ok(own.has(r.op), `${id}: ${r.op}'s body carries ${secret}`);
      }
    }
    // control: what the flow sends after its own act carries none of its secrets but the password to the sign-in
    for (const r of s.requests.filter((x) => !own.has(x.op))) for (const secret of Object.values(SECRET)) assert.ok(!JSON.stringify(r.body || {}).includes(secret), `${id}: ${r.op}`);
    const drawn = s.drawn();
    for (const secret of [SECRET.pw, SECRET.code, SECRET.reset, SECRET.invite]) assert.ok(!drawn.includes(secret), `${id}: ${secret} drawn`);
    for (const href of all(s.tree, (e) => e.tag === "a").map((e) => e.attrs.href)) for (const secret of Object.values(SECRET)) assert.ok(!String(href).includes(secret), `${id}: a link carries a secret`);
    assert.ok(!("pending" in s.view.ui), `${id}: a password left in the page's memory`);
  }
});

test("R10 no place is named in the words this module reads or in anything its screens draw", async () => {
  const PLACES = /Oakland|California|Alameda|Coliseum|Lakeshore|Fresno|Seminary|San Francisco|Berkeley|United States|\bCity of\b|\bthe city\b|\bcouncil\b/i;
  for (const s of SCREENS) for (const k of s.words) if (hasWord(k)) assert.doesNotMatch(sentence(k), PLACES, k);
  for (const [id, o] of STATES) assert.doesNotMatch((await open(id, { ...o, table: o.table || PLANE })).drawn(), PLACES, id);
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

/* a registry act's op: an owed one is spelled `owed:<op> <ruling>` (registry.json, K3265) */
const opOf = (x) => String(x.op).replace(/^owed:/, "").split(/\s/)[0];

test("R9 the contract: six screens, each a registry screen in its frame; every act names an op OPS holds and the registry lists for it (an owed act by its op)", () => {
  assert.deepEqual(SCREENS.map((s) => s.id), ["front", "tour", "forgot", "reset", "setup", "join"]);
  const FRAME = { front: "public", tour: "public", forgot: "public", reset: "public", setup: "setup", join: "setup" };
  for (const s of SCREENS) {
    const reg = REG.find((r) => r.id === s.id);
    assert.ok(reg, s.id);
    assert.equal(reg.frame, FRAME[s.id], s.id);
    assert.ok(Object.isFrozen(s) && Object.isFrozen(s.acts) && Object.isFrozen(s.words));
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${s.id}: ${a.op} not in OPS`);
      assert.ok(reg.acts.some((x) => opOf(x) === a.op), `${s.id}: ${a.op} is not the registry's`);
    }
    // every registry act of the screen is drawn by it (R1–R7), but join's memberlanguageset, sent once the member's
    // session exists (R7), since no act but a public one is drawn before it
    for (const x of reg.acts) assert.ok(s.acts.some((a) => a.op === opOf(x)) || (s.id === "join" && x.op === "memberlanguageset"), `${s.id}: the registry's ${x.op} is not drawn`);
  }
});

/* R21: the keys this module reads are words-reads.json's `reads` for it, with every key a requirement here names */
const READS = JSON.parse(fs.readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8")).modules["screens-entry"];
const NAMED = ["signin.handle.help", "forgot.handle.help", "screen.setup.handle", "screen.setup.handle.help", "refusal.NO_HANDLE", "refusal.BAD_HANDLE",
  "refusal.HANDLE_TAKEN", "refusal.HANDLE_FIXED", "refusal.ALREADY_CLAIMED", "founder.handle.title", "founder.handle.says", "founder.handle.choose",
  "founder.handle.later", "founder.handle.later.help", "founder.handle.done", "setup.member.heading", "setup.member.sub", "setup.member.home",
  "setup.codes.once", "setup.codes.copy", "setup.codes.save", "setup.claimed.heading", "setup.claimed.sub"];
const RETIRED = ["screen.forgot.handle.help", "screen.setup.taken", "signin.founderhint"];

test("R21 words by key: no row of its own (SCREEN_WORDS is empty); every key each screen reads is a key the list holds (setup-words hasWord), and the retired rows are read by none", () => {
  assert.ok(Array.isArray(SCREEN_WORDS) && Object.isFrozen(SCREEN_WORDS));
  assert.equal(SCREEN_WORDS.length, 0, "no member-facing English is held here");
  for (const s of SCREENS) {
    assert.ok(s.words.length > 0, s.id);
    for (const k of s.words) {
      assert.equal(typeof k, "string", `${s.id}: a word given as a row, not a key`);
      // act labels and explanations are read where the list holds them (the shell's act())
      if (/^act\./.test(k)) continue;
      assert.ok(hasWord(k), `${s.id}: ${k} is no key of the list`);
    }
    for (const k of RETIRED) assert.ok(!s.words.includes(k), `${s.id} reads the retired ${k}`);
  }
  // control: an unknown key is found
  assert.equal(hasWord("screen.setup.nonesuch"), false);
});

test("R21 the keys read are words-reads.json's for this module with every key a requirement here names, and no other", () => {
  const read = new Set(SCREENS.flatMap((s) => s.words).filter((k) => !/^act\./.test(k)));
  const want = new Set([...READS.reads, ...NAMED]);
  assert.deepEqual([...read].filter((k) => !want.has(k)).sort(), [], "read beyond the list");
  assert.deepEqual([...want].filter((k) => !read.has(k)).sort(), [], "listed but not read");
  for (const k of READS.retired) assert.ok(!read.has(k), k);
});

test("R21 over fixtures, what the screens draw for a sample of their keys equals setup-words' word(key, vars)", async () => {
  const drawnText = (s) => squash(unescape(s.text));
  const front = await open("front", { table: PLANE });
  for (const k of ["screen.front.members", "screen.front.doorbell", "signin.handle.help", "session.keep"]) assert.ok(drawnText(front).includes(squash(word(k))), k);
  assert.ok(drawnText(front).includes(squash(word("screen.entry.uses", { group: "River Town" }))));
  const forgot = await open("forgot");
  for (const k of ["forgot.handle.help", "screen.forgot.help.s1"]) assert.ok(drawnText(forgot).includes(squash(word(k))), k);
  const setup = await open("setup", { fragment: { boot: SECRET.otp }, table: PLANE });
  await setup.press("claim", { values: { "su-handle": "rivera", "su-pw": SECRET.pw, "su-pw2": SECRET.pw } });
  assert.ok(drawnText(setup).includes(squash(word("screen.setup.claimed", { group: "River Town", handle: "rivera" }))));
  assert.ok(drawnText(setup).includes(squash(word("setup.codes.once"))));
  const member = await open("setup", { me: JOINED });
  assert.ok(drawnText(member).includes(squash(word("setup.member.sub"))));
  // control: word refuses a key the list does not hold, and a placeholder left unfilled
  assert.throws(() => word("screen.setup.nonesuch", {}), /UNKNOWN_WORD/);
  assert.throws(() => word("screen.setup.claimed", { group: "River Town" }), /WORD_VAR_MISSING/);
});
