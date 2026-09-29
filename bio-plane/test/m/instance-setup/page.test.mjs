/* The page at the root (R20–R25, R32, and R15's page half), at its interface: the bytes `setupPage` serves, and its
   script run in a sandbox with a small document stand-in, driven by the ops it calls. */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage, groupLine, SETUP_HTML } from "../../../src/setup.mjs";
import { STATES, HEADINGS, deriveInquiryTitle } from "../../../checks/bio-checks.mjs";
import { RISK_TIERS, riskTierState } from "../../../src/actions/checks.mjs";
import { COUNTERPARTY_LEVELS } from "../../../../jurisdictions/index.mjs";
import { pageOver } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 20; i++) await tick(); };

/* The page's script over the fixture's document stand-in, driven by the ops it calls: `answer(op, body)` scripts what
   each op returns; `calls` records every op the page sent, with its method and body. */
function load({ hash = "", answer = () => ({ ok: true }), session = null } = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op") || u.pathname.slice(1);
    const body = init && init.body ? JSON.parse(init.body) : null;
    calls.push({ op, method: (init && init.method) || "GET", body, token: u.searchParams.get("token") });
    const out = await answer(op, body, u);
    return { ok: true, status: 200, json: async () => out };
  };
  return { ...pageOver({ html: SETUP_HTML, hash, session, fetch }), calls };
}

test("R20 setupPage returns the page with one group line from one read: recorded (name · slug · group instance, domain with its date only when dated), none, unread; every value escaped", () => {
  const rec = (result) => groupLine({ answered: true, result: { ok: true, ...result } });
  assert.match(rec({ group: "river-town" }), /data-group="recorded"[^]*<span class="slug">river-town<\/span> &middot; group instance<\/p>$/);
  const full = rec({ group: "river-town", display_name: "River <Town>", domain: "river.example", domain_verified_at: "2026-09-29T10:00:00Z" });
  assert.match(full, /<span class="name">River &lt;Town&gt;<\/span> &middot; <span class="slug">river-town<\/span>/);
  assert.match(full, /<span class="domain">river.example<\/span> verified <time datetime="2026-09-29">2026-09-29<\/time>/);
  assert.doesNotMatch(rec({ group: "river-town", domain: "river.example", domain_verified_at: null }), /river.example/);
  assert.doesNotMatch(rec({ group: "river-town", domain: "river.example", domain_verified_at: 12345 }), /river.example/);
  assert.match(rec({ group: "a\"b&c" }), /a&quot;b&amp;c/);
  assert.match(rec({ group: null, detail: "x" }), /data-group="none">No group is recorded for this copy yet/);
  for (const read of [null, {}, { answered: false }, { answered: true, result: { ok: false } }, { answered: true, result: { ok: true } },
                      { answered: true, result: { ok: true, group: "" } }])
    assert.match(groupLine(read), /data-group="unread">This copy could not read its group just now/, JSON.stringify(read));
  const page = setupPage({ answered: true, result: { ok: true, group: "river-town" } });
  assert.equal((page.match(/id="instance-group"/g) || []).length, 1);
  assert.match(page, /data-group="recorded"/);
  assert.equal(page.replace(/<p class="eyebrow" id="instance-group"[^]*?<\/p>/, ""), SETUP_HTML.replace(/<p class="eyebrow" id="instance-group"[^]*?<\/p>/, ""));
  assert.match(setupPage(undefined), /data-group="unread"/);
});

test("R21 the page removes the fragment on load: #boot= pre-fills the one-time password; #invite= asks invitelook and shows enrolment, or says the link is not live and hides the form", async () => {
  const boot = load({ hash: "#boot=one%20time", answer: (op) => (op === "bootstrap" ? { claimed: false, bootstrapConfigured: true } : {}) });
  await settle();
  assert.equal(boot.replaced(), 1);
  assert.equal(boot.el("#boot").value, "one time");
  const live = load({ hash: "#invite=tok-1", answer: (op) => (op === "invitelook" ? { result: { ok: true, cover: "volunteer-7", role: "member", capabilities: ["read"] } } : {}) });
  await settle();
  assert.equal(live.replaced(), 1);
  assert.deepEqual(live.calls.map((c) => [c.op, c.body]), [["invitelook", { invite: "tok-1" }]]);
  assert.match(live.el("#en-who").innerHTML, /volunteer-7/);
  assert.equal(live.el("#en-go").hidden, false);
  const dead = load({ hash: "#invite=tok-2", answer: () => ({ result: { ok: false } }) });
  await settle();
  assert.match(dead.el("#en-lede").textContent, /not live/);
  assert.equal(dead.el("#en-go").hidden, true);
});

test("R22 before sign-in the page drives only bootstrap, claim, login, invitelook and enroll; a claim needs a password of at least 12 characters typed twice alike", async () => {
  const PUBLIC = new Set(["bootstrap", "claim", "login", "invitelook", "enroll"]);
  const p = load({ answer: (op) => (op === "bootstrap" ? { claimed: false, bootstrapConfigured: true } : { result: { ok: false, reason: "X" } }) });
  await settle();
  p.el("#boot").value = "token";
  for (const [a, b] of [["short", "short"], ["twelve-chars-a", "twelve-chars-b"]]) {
    p.el("#pw1").value = a; p.el("#pw2").value = b;
    await p.el("#do-claim").fire(); await settle();
  }
  assert.equal(p.calls.filter((c) => c.op === "claim").length, 0);
  assert.match(p.el("#claim-err").textContent, /do not match/);
  p.el("#pw1").value = "twelve-chars-a"; p.el("#pw2").value = "twelve-chars-a";
  await p.el("#do-claim").fire(); await settle();
  assert.deepEqual(p.calls.find((c) => c.op === "claim").body, { bootstrapToken: "token", password: "twelve-chars-a" });
  await p.el("#do-login").fire(); await settle();
  await p.el("#en-go").fire(); await settle();
  for (const c of p.calls) assert.ok(PUBLIC.has(c.op), c.op);
});

const signedIn = (whoami, extra = {}) => load({
  session: { t: "sess-1", e: 0, w: "ada" },
  answer: (op, body) => {
    if (op === "stats") return { ok: true };
    if (op === "bootstrap") return { claimed: true, version: "v1" };
    if (op === "whoami") return { result: whoami };
    if (extra[op]) return extra[op](body);
    return { result: { ok: true } };
  },
});

test("R23 after sign-in the page offers only the acts op=whoami reports the session holds, and members and keys only to a session that administers", async () => {
  const member = signedIn({ capabilities: ["read"], administer: false });
  await settle();
  assert.equal(member.el("#go-new").hidden, true);
  assert.equal(member.el("#go-members").hidden, true);
  assert.equal(member.el("#n-type").options.find((o) => o.value === "project").hidden, true);
  const writer = signedIn({ capabilities: ["contribute", "create_projects"], administer: false });
  await settle();
  assert.deepEqual([writer.el("#go-new").hidden, writer.el("#go-members").hidden], [false, true]);
  assert.equal(writer.el("#n-type").options.find((o) => o.value === "project").hidden, false);
  /* an enrolled administrator, not only the founder, administers; the name signed in with decides nothing */
  const admin = signedIn({ capabilities: ["contribute"], administer: true });
  await settle();
  assert.equal(admin.el("#go-members").hidden, false);
  const failed = load({ session: { t: "s", e: 0, w: "admin" }, answer: (op) => (op === "whoami" ? { result: null } : op === "bootstrap" ? { claimed: true } : { ok: true }) });
  await settle();
  assert.deepEqual([failed.el("#go-new").hidden, failed.el("#go-members").hidden], [true, true]);   // fail closed
});

test("R24 the intake form offers the catalogue's own first states and headings, and writes a named counterparty as an office {state: named, role, body, level?} or 'not determined yet' with a basis, and an untouched tier as undetermined", async () => {
  const p = load();
  await settle();
  assert.deepEqual(p.ui.FIRST_STATE, Object.fromEntries(Object.entries(STATES).map(([t, s]) => [t, s.legal[0]])));
  assert.deepEqual(p.ui.HEADINGS, HEADINGS);
  assert.equal(p.ui.deriveInquiryTitle("What is due by Friday? And why."), deriveInquiryTitle("What is due by Friday? And why."));
  const md = (act) => p.ui.mdFor("ACTN-2026-0001-x", "action", p.ui.FIRST_STATE.action, "X", "Body.", "2026-09-29T10:00:00Z", false, null, act);
  const office = md({ counterparty: { state: "named", role: "Clerk", body: "the council", level: "city" }, risk_tier: null });
  assert.match(office, /\ncounterparty:\n  state: named\n  role: "Clerk"\n  body: "the council"\n  level: city\n/);
  assert.doesNotMatch(office, /\n  name:/);
  assert.match(office, /\nrisk_tier: undetermined\n/);
  assert.doesNotMatch(md({ counterparty: { state: "named", role: "Clerk", body: "the council" } }), /level:/);
  assert.match(md({ counterparty: { state: "undetermined", basis: "Two offices could answer." } }),
               /\ncounterparty:\n  state: undetermined\n  basis: "Two offices could answer."\n/);
  assert.doesNotMatch(md(null), /counterparty:/);
  assert.match(md({ counterparty: { state: "named", role: "Clerk", body: "the council" }, risk_tier: 2 }), /\nrisk_tier: 2\n/);
  /* the form: the level's words are the product's vocabulary, nothing preselected */
  for (const l of COUNTERPARTY_LEVELS) assert.match(SETUP_HTML, new RegExp(`<option value="${l}">${l}</option>`));
  assert.match(SETUP_HTML, /<select id="n-cp-level"><option value="">Not stated<\/option>/);
  assert.doesNotMatch(SETUP_HTML, /<option[^>]*selected/);
  assert.doesNotMatch(SETUP_HTML, /id="n-cp-name"/);
  /* driven through the form: a named counterparty needs its role and its body */
  const sent = [];
  const f = signedIn({ capabilities: ["contribute"], administer: false },
    { allocid: () => ({ result: { id: "ACTN-2026-0001" } }), promote: (b) => { sent.push(b); return { result: { ok: true } }; }, image: () => ({ result: {} }) });
  await settle();
  f.el("#n-type").value = "action"; f.el("#n-title").value = "Ask"; f.el("#n-body").value = "Body.";
  f.el("#n-cp-named").checked = true; f.el("#n-cp-role").value = "Clerk"; f.el("#n-cp-body").value = "";
  await f.el("#n-save").fire(); await settle();
  assert.match(f.el("#n-err").textContent, /official role and the body/);
  assert.equal(sent.length, 0);
  f.el("#n-cp-body").value = "the council"; f.el("#n-cp-level").value = "county";
  await f.el("#n-save").fire(); await settle();
  assert.equal(sent.length, 1);
  assert.match(sent[0].files[0].text, /\n  role: "Clerk"\n  body: "the council"\n  level: county\n/);
  assert.match(sent[0].files[0].text, /\nrisk_tier: undetermined\n/);
});

test("R25 a bundle's history is listed in write order when every entry carries a distinct integer seq, else by snap key, and the page says which", async () => {
  const p = load();
  await settle();
  const e = (key, seq) => ({ key, ...(seq === undefined ? {} : { seq }) });
  assert.deepEqual(p.ui.historyOrder([e("b", 2), e("c", 1), e("a", 3)]), { order: "write", entries: [e("c", 1), e("b", 2), e("a", 3)] });
  for (const raw of [[e("b", 2), e("a")], [e("b", 1), e("a", 1)], [e("b", 1.5), e("a", 2)], [e("b", "1"), e("a", 2)]])
    assert.deepEqual(p.ui.historyOrder(raw), { order: "key", entries: raw.slice().sort((x, y) => x.key.localeCompare(y.key)) });
  assert.deepEqual(p.ui.historyOrder([]), { order: "key", entries: [] });
  assert.deepEqual(p.ui.historyOrder(null), { order: "key", entries: [] });
  const shown = async (entries) => {
    const v = signedIn({ capabilities: [], administer: false }, { image: () => ({ result: {
      "bundle.md": "---\nid: X\n---\n", "_history/manifest.json": JSON.stringify({ entries }) } }) });
    await settle();
    await v.ui.openBundle("X"); await settle();
    return v.el("#b-history").innerHTML;
  };
  const written = await shown([e("z", 1), e("a", 2)]);
  assert.match(written, /^<p class="small"[^>]*>Listed in the order they were written, oldest first\.<\/p>/);
  assert.ok(written.indexOf(">z<") < written.indexOf(">a<"));
  const keyed = await shown([e("z"), e("a")]);
  assert.match(keyed, /Listed by snapshot key[^]*not necessarily the order they were written/);
  assert.ok(keyed.indexOf(">a<") < keyed.indexOf(">z<"));
  assert.doesNotMatch(SETUP_HTML, /Every revision this bundle has ever had, oldest first/);
});

test("R32 the tiers the form offers and writes are actions' RISK_TIERS and riskTierState, never a copy; the page states action_kind: other and offers no other kind", async () => {
  const p = load();
  await settle();
  assert.deepEqual(p.ui.RISK_TIERS, RISK_TIERS);
  for (const v of [1, 2, 3, 0, 4, "2", null, undefined, "undetermined"]) assert.deepEqual(p.ui.riskTierState(v), riskTierState(v), String(v));
  assert.deepEqual(p.ui.SETTABLE_TIERS, Object.keys(RISK_TIERS).filter((k) => riskTierState(Number(k)) === Number(k)));
  assert.match(p.el("#n-risk-choices").innerHTML, new RegExp(p.ui.SETTABLE_TIERS.map((k) => `value="${k}"`).join("[^]*")));
  assert.doesNotMatch(p.el("#n-risk-choices").innerHTML, /checked/);
  const text = p.ui.mdFor("A", "action", "draft", "t", "b", "2026-09-29T10:00:00Z", false, null, { counterparty: { state: "undetermined", basis: "b" } });
  assert.equal((text.match(/^action_kind: /gm) || []).length, 1);
  assert.match(text, /^action_kind: other$/m);
  assert.doesNotMatch(SETUP_HTML, /id="n-kind"|action_kind"/);
});

test("R15 the page half: the active profiles by name to a member; to an administrator the held non-test profiles, none preselected, in the order ticked, warned before sending, and none allowed and said", async () => {
  const PROFILES = { ok: true, profiles: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }], conflicts: [],
                     choices: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }, { id: "p-two", name: "Profile Two", covers: ["Elsewhere"] }] };
  const sent = [];
  const member = signedIn({ capabilities: [], administer: false }, { profiles: () => ({ result: PROFILES }) });
  await settle();
  assert.match(member.el("#pf-active").innerHTML, /Profile One/);
  assert.equal(member.el("#pf-choose").hidden, true);
  const admin = signedIn({ capabilities: [], administer: true }, { profiles: () => ({ result: PROFILES }),
    profilesset: (b) => { sent.push(b); return { result: { ok: true } }; } });
  await settle();
  assert.equal(admin.el("#pf-choose").hidden, false);
  assert.match(admin.el("#pf-choices").innerHTML, /Profile One[^]*Profile Two/);
  assert.doesNotMatch(admin.el("#pf-choices").innerHTML, /checked/);
  const picks = admin.sandbox.document.querySelectorAll("#pf-choices .pf-pick");
  const two = picks.find((x) => x.value === "p-two"), one = picks.find((x) => x.value === "p-one");
  two.checked = true; await two.fire("change");
  one.checked = true; await one.fire("change");
  await admin.el("#pf-review").fire(); await settle();
  assert.equal(admin.el("#pf-warn").hidden, false);
  assert.match(admin.el("#pf-warn-text").textContent, /Profile Two, then Profile One[^]*read differently from then on/);
  assert.equal(sent.length, 0, "nothing is sent before the warning is confirmed");
  await admin.el("#pf-confirm").fire(); await settle();
  assert.deepEqual(sent, [{ profiles: ["p-two", "p-one"] }]);
  assert.match(admin.ui.profilesWarning([], PROFILES.choices), /no profile[^]*answered as undetermined[^]*read differently/);
  const empty = signedIn({ capabilities: [], administer: false }, { profiles: () => ({ result: { ok: true, profiles: [], conflicts: [], choices: [],
    boot: { why: "the installer bound nowhere-profile, which this copy does not hold" } } }) });
  await settle();
  assert.match(empty.el("#pf-active").innerHTML, /No profile is active[^]*nowhere-profile/);
  const unread = signedIn({ capabilities: [], administer: true }, { profiles: () => ({ result: null }) });
  await settle();
  assert.match(unread.el("#pf-active").innerHTML, /could not read/);
  assert.equal(unread.el("#pf-choose").hidden, true);
});
