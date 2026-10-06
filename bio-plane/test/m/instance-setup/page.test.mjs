/* The page at the root (R20–R25, R32, and R15's page half), at its interface: the bytes `setupPage` serves, and its
   script run in a sandbox with a small document stand-in, driven by the ops it calls. */
import test from "node:test";
import assert from "node:assert/strict";
import { setupPage, groupLine, SETUP_HTML } from "../../../src/setup.mjs";
import { STATES, HEADINGS, deriveInquiryTitle } from "../../../src/record-grammar/index.mjs";
import { RISK_TIERS, riskTierState } from "../../../src/action-grammar/index.mjs";
import { COUNTERPARTY_LEVELS } from "../../../../jurisdictions/index.mjs";
import { HOSTING_CONTROL, hostingControlBlock } from "../../../src/setup-fleet.mjs";
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

test("R24 the intake form offers record-grammar's own first states and headings, and writes a named counterparty as an office {state: named, role, body, level?} or 'not determined yet' with a basis, and an untouched tier as undetermined", async () => {
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
  assert.doesNotMatch(SETUP_HTML, /Every revision this (?:record|bundle) has ever had, oldest first/);
});

/* The served bytes with what no member reads taken out: HTML comments, the script's comments, and the identifiers K899
   (1) keeps (`bundle_id`, `bundleId`, `bundle.md` and its history paths, the section id and the script's names). */
const memberText = (html) => html.replace(/<!--[^]*?-->/g, "")
  .replace(/<script>([^]*?)<\/script>/g, (_, s) => s.replace(/\/\*[^]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/[^\n]*/g, "$1"))
  .replace(/\b(?:bundle_id|bundleId|bundle\.md|_history\/bundle_|s-bundle|openBundle|renderBundle|bundleSha|checkBundle)\b/g, "");

test("K899 (1) the page says record where it said bundle: no text a member reads holds the word, the identifiers stay; the crumb, labels, browse summary and header, the not-found line and the publish refusals say record", async () => {
  assert.doesNotMatch(memberText(SETUP_HTML), /bundle/i);
  /* not vacuous: the identifiers the page sends and reads are still there */
  for (const id of ['id="s-bundle"', '"bundle.md"', "bundleId", "bundle_id"]) assert.ok(SETUP_HTML.includes(id), id);
  assert.match(memberText('<p>Files in this bundle</p><script>/* a bundle */ x("bundle.md")</script>'), /bundle/);
  for (const words of ["<h2>Files in this record</h2>", "Every revision this record has ever had.", "This adds a record to the working record.",
                       '<a id="e-back">Record</a>', '<span class="k">Record</span>'])
    assert.ok(SETUP_HTML.includes(words), words);
  const v = signedIn({ capabilities: ["read"], administer: false }, {
    list: () => ({ result: [{ bundle_id: "INFO-2026-0001-a", object_type: "information", current_state: "collected" },
                            { bundle_id: "INFO-2026-0002-b", object_type: "information", current_state: "collected" }] }),
    image: () => ({ result: null }) });
  await settle();
  await v.ui.openBrowse(); await settle();
  assert.match(v.el("#browse-summary").textContent, /^2 records\. /);
  assert.match(v.el("#browse-body").innerHTML, /<th>Record<\/th><th>State<\/th>/);
  await v.ui.openBundle("INFO-2026-0003-c"); await settle();
  assert.equal(v.el("#b-md").innerHTML, "<p>This record was not found.</p>");
  assert.match(v.ui.ratifyWhy({ reason: "RATIFY_STALE" }), /Reload this record and sign the new hash\./);
  assert.match(v.ui.ratifyWhy({ reason: "SIG_BAD_SIGNATURE" }), /does not match this record and hash\./);
  assert.match(v.ui.ratifyWhy({ reason: "GATE_REFUSED", findings: [{ check: "C-2.7" }] }), /^The checks refused this record: C-2\.7\./);
});

test("R32 the tiers the form offers and writes are action-grammar's RISK_TIERS and riskTierState, never a copy; the page states action_kind: other and offers no other kind", async () => {
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

/* R47's conditions over one page's bytes, as a list of what fails (empty when it holds), so the negative controls below
   run the same reading over a page that breaks it. The words are pinned here, in this test, not read from the block. */
const OLD_CARD = /If you ever lose the\s+password you choose here/;
const DEC_109 = [
  /Before you choose a password: who controls your group's Civicsmith/,
  /Whoever can sign in to the hosting account your group's Civicsmith runs in \(its Cloudflare account\) controls it\./,
  /can replace the one-time password, claim it again, read everything in it and lock everyone else out,\s+and no vote of the group's administrators can stop them\./,
  /Use a group account for it, not anyone's personal login\./,
  /Add at least one other trusted person to that account\./,
  /Where possible, let someone other than the group's administrators hold it\./,
  /The same account is the way back in if the password you choose is lost[^<]*your group's Civicsmith can be claimed again\./,
];
function r47Fails(html) {
  const fails = [];
  const claim = (html.match(/<section id="s-claim">[^]*?<\/section>/) || [""])[0];
  const block = (claim.match(/<div class="notice" id="hosting-control">[^]*?<\/div>/) || [""])[0];
  if (!block) fails.push("no block in the claim section");
  for (const re of DEC_109) if (!re.test(block)) fails.push(`the block lacks ${re}`);
  if (block && !(claim.indexOf(block) < claim.indexOf('id="pw1"'))) fails.push("the block is not before the password field");
  if (OLD_CARD.test(html)) fails.push("the reassurance-only card is still there");
  if (/<(?:input|button|select|textarea)\b/.test(block)) fails.push("the block carries a control");
  if (/acknowledg/i.test(claim.replace(/<!--[^]*?-->/g, ""))) fails.push("the claim section asks for an acknowledgement");
  return fails;
}

test("R47 R63 the claim section shows DEC-109's block before the password is chosen, in place of the reassurance-only card, in DEC-149's words (your group's Civicsmith, never this copy), and asks and records no acknowledgement", async () => {
  assert.deepEqual(r47Fails(SETUP_HTML), []);
  assert.deepEqual(r47Fails(setupPage({ answered: true, result: { ok: true, group: "river-town" } })), []);
  /* the words are held once, in the leaf the installer imports, and the page carries them as that leaf renders them */
  assert.ok(SETUP_HTML.includes(hostingControlBlock("notice")));
  for (const sentence of HOSTING_CONTROL.sentences) assert.equal(SETUP_HTML.split(sentence).length - 1, 1, sentence);
  /* R63 (DEC-149): the block names the group's Civicsmith, never "copy"; "installation" only for the hosting */
  for (const words of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences]) assert.doesNotMatch(words, /\bcopy\b|\binstance\b|\bplane\b|\bserver\b/i, words);
  assert.match(hostingControlBlock('x"<'), /^<div class="x&quot;&lt;" id="hosting-control">/);
  /* negative controls: the old card restored, and the block placed after pw1, each fail the reading */
  const card = '<div class="card"><p class="small" style="margin:0"><b>If you ever lose the\n  password you choose here,</b> you are not locked out.</p></div>';
  const withCard = SETUP_HTML.replace(hostingControlBlock("notice"), card);
  assert.ok(r47Fails(withCard).includes("no block in the claim section"));
  assert.ok(r47Fails(withCard).includes("the reassurance-only card is still there"));
  const after = SETUP_HTML.replace(hostingControlBlock("notice"), "")
    .replace('<label for="pw2">', hostingControlBlock("notice") + '<label for="pw2">');
  assert.deepEqual(r47Fails(after), ["the block is not before the password field"]);
  const acked = SETUP_HTML.replace('id="hosting-control"><p>', 'id="hosting-control"><p><input type="checkbox" id="ack">');
  assert.ok(r47Fails(acked).includes("the block carries a control"));
  /* driven: the claim sends the token and the password and nothing else, and no other op is called for the block */
  const p = load({ answer: (op) => (op === "bootstrap" ? { claimed: false, bootstrapConfigured: true } : op === "claim" ? { result: { ok: true } } : { result: { ok: true } }) });
  await settle();
  p.el("#boot").value = "token"; p.el("#pw1").value = "twelve-chars-a"; p.el("#pw2").value = "twelve-chars-a";
  await p.el("#do-claim").fire(); await settle();
  assert.deepEqual(p.calls.find((c) => c.op === "claim").body, { bootstrapToken: "token", password: "twelve-chars-a" });
  assert.deepEqual([...new Set(p.calls.map((c) => c.op))].filter((op) => !["bootstrap", "claim", "login", "whoami", "profiles", "assistantstate"].includes(op)), []);
});

test("R48 the inbox's resolve asks the member's reason and sends it with the knock and the status; a blank reason posts nothing; a refusal is shown in the plane's words and the knock is left as it was", async () => {
  const KNOCKS = [{ knock_id: "KNOCK-2026-10-02-0a1b2c3d", status: "new", received: "2026-10-02T04:00:00Z", sha256: "ab", bytes: 3 }];
  const sent = [];
  let refuse = null;
  const p = signedIn({ capabilities: ["contribute"], administer: false }, {
    inbox: () => ({ result: { inbox: KNOCKS } }),
    inboxresolve: (b) => { sent.push(b); return refuse || { result: { ok: true, knockId: b.knockId, status: b.status } }; } });
  await settle();
  await p.ui.openInbox(); await settle();
  assert.match(p.el("#inbox-body").innerHTML, /<label for="ir-0">Your reason[^<]*<\/label><input id="ir-0" class="ireason">/);
  for (const to of ["pulled", "discarded"]) {
    const btn = () => p.ibtns().find((b) => b.dataset.to === to);
    assert.equal(btn().dataset.id, KNOCKS[0].knock_id);
    /* blank: nothing is posted, and the page says why */
    for (const blank of ["", "   \n"]) {
      p.el("#ir-0").value = blank;
      await btn().fire(); await settle();
      assert.equal(sent.length, 0, `${to} ${JSON.stringify(blank)}`);
      assert.match(p.el("#ierr-0").textContent, /Write your reason first/);
    }
    /* a refusal (the store's, inside the envelope, and the door's own) is shown in its own words; the inbox is not redrawn */
    for (const r of [{ ok: true, result: { ok: false, reason: "RESOLVE_NO_REASON", translation: "A member resolving a knock says why." } },
                     { ok: false, reason: "RESOLVE_NO_REASON", translation: "A member resolving a knock says why." }]) {
      refuse = r;
      p.el("#ir-0").value = "Spam, plainly.";
      const draws = p.calls.filter((c) => c.op === "inbox").length;
      await btn().fire(); await settle();
      assert.deepEqual(sent.pop(), { knockId: KNOCKS[0].knock_id, status: to, reason: "Spam, plainly." });
      assert.equal(p.el("#ierr-0").textContent, "A member resolving a knock says why.");
      assert.equal(p.calls.filter((c) => c.op === "inbox").length, draws, "the knock is left as it was");
    }
    refuse = { ok: true, result: { ok: false, reason: "NO_SUCH_KNOCK", detail: "no knock answers to that id." } };
    await btn().fire(); await settle(); sent.pop();
    assert.equal(p.el("#ierr-0").textContent, "no knock answers to that id.");
    /* admitted: posted with its reason, and the inbox read again */
    refuse = null;
    p.el("#ir-0").value = "Brought into the record.";
    const draws = p.calls.filter((c) => c.op === "inbox").length;
    await btn().fire(); await settle();
    assert.deepEqual(sent.pop(), { knockId: KNOCKS[0].knock_id, status: to, reason: "Brought into the record." });
    assert.equal(p.el("#ierr-0").textContent, "");
    assert.equal(p.calls.filter((c) => c.op === "inbox").length, draws + 1);
  }
  for (const c of p.calls.filter((x) => x.op === "inboxresolve")) assert.equal(c.method, "POST");
  /* a member who may not contribute is offered neither the field nor the buttons */
  const viewer = signedIn({ capabilities: ["read"], administer: false }, { inbox: () => ({ result: { inbox: KNOCKS } }) });
  await settle();
  await viewer.ui.openInbox(); await settle();
  assert.doesNotMatch(viewer.el("#inbox-body").innerHTML, /ireason|ibtn/);
});
