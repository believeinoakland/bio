/* The claim section (R14–R18), at the page's interface: the bytes `pageOf` answers, and its script run in the fixture's
   sandbox over a fake plane answering the ops' documented shapes (membership R11, R107; credentials R33, R34;
   instance-setup R53). End-to-end arms over the real ops may follow in instance-setup's job (K1851). */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML, HOSTING_SLOT } from "../../../src/setup-page/index.mjs";
import { pageOver } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const claimSection = (html) => (html.match(/<section id="s-claim">[^]*?<\/section>/) || [""])[0];
const noComments = (html) => html.replace(/<!--[^]*?-->/g, "");

/* A fake plane holding the settings the claim section drives, answering as their modules document: hostingAccessSet
   (`NO_HOLDERS` for empty holders), courtNoticeSet (`COURT_NOTICE_UNKNOWN_CHOICE`), assistantSet, groupKeySet
   (`NO_SECRET`), groupKeySwitch, and their reads. `refuse[op]` makes one op refuse in the plane's words. */
function plane({ administer = true, refuse = {} } = {}) {
  const st = { hosting: null, court: null, assistant: { ok: true, on: false, set_by: null, set_at: null },
               key: { held: false, on: false, set_at: null, by: null } };
  const sent = [];
  const answer = (op, body) => {
    if (refuse[op]) return { result: { ok: false, ...refuse[op] } };
    switch (op) {
      case "bootstrap": return { claimed: false, bootstrapConfigured: true };
      case "claim": return { result: { ok: true, consumedAt: "2026-10-06T10:00:00Z" } };
      case "login": return { result: { ok: true, token: "sess-founder", expires: 0 } };
      case "whoami": return { result: { capabilities: ["contribute"], administer } };
      case "hostingaccessset":
        if (!String(body.holders ?? "").trim()) return { result: { ok: false, reason: "NO_HOLDERS", translation: "Name who holds hosting access: an empty answer records nobody. Nothing was written." } };
        st.hosting = { holders: String(body.holders).trim(), note: body.note ?? null, recorded_by: "admin", at: "2026-10-06T10:01:00Z" };
        return { result: { ok: true, ...st.hosting } };
      case "hostingaccess": return { result: { ok: true, recorded: !!st.hosting, current: st.hosting, history: st.hosting ? [st.hosting] : [], limit: 200, truncated: false } };
      case "courtnoticeset":
        if (body.choice !== "tell" && body.choice !== "dont") return { result: { ok: false, reason: "COURT_NOTICE_UNKNOWN_CHOICE" } };
        st.court = body.choice; return { result: { ok: true, choice: body.choice, by: "admin", at: "2026-10-06T10:02:00Z" } };
      case "courtnotice": return { result: { choice: st.court, history: [] } };
      case "assistantset": st.assistant = { ok: true, on: body.on, set_by: "admin", set_at: "2026-10-06T10:03:00Z" }; return { result: { ...st.assistant } };
      case "assistantstate": return { result: st.assistant };
      case "groupkeyset":
        if (!String(body.key ?? "").trim()) return { result: { ok: false, reason: "NO_SECRET" } };
        st.key = { held: true, on: false, set_at: "2026-10-06T10:04:00Z", by: "admin" }; return { result: { ok: true, set_at: st.key.set_at } };
      case "groupkeyswitch": st.key = { ...st.key, on: body.on }; return { result: { ok: true, on: body.on } };
      case "groupkeystate": return { result: administer ? st.key : { on: st.key.on } };
      case "profiles": return { result: { ok: true, profiles: [], conflicts: [], choices: [] } };
      default: return { result: { ok: true } };
    }
  };
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    sent.push({ op, body, token: u.searchParams.get("token"), method: (init && init.method) || "GET" });
    const out = answer(op, body);
    return { ok: true, status: 200, json: async () => out };
  };
  return { st, sent, fetch };
}
/* The founder claims on the page; answers the page, its plane and the ops sent after the claim. */
async function claimed(opts = {}) {
  const pl = plane(opts);
  const p = pageOver({ html: pageOf({ answered: true, result: { ok: true, group: "river-town" } }), hash: "#boot=one-time", fetch: pl.fetch });
  await settle();
  p.el("#claim-after").hidden = true;   // as the markup carries it
  p.el("#pw1").value = "the-founders-password"; p.el("#pw2").value = "the-founders-password";
  await p.el("#do-claim").fire(); await settle();
  const after = () => pl.sent.slice(pl.sent.findIndex((c) => c.op === "login") + 1);
  return { ...p, ...pl, after };
}
const ops = (sent, names) => sent.filter((c) => names.includes(c.op)).map((c) => [c.op, c.body]);

test("R14 the claim section carries exactly one slot, HOSTING_SLOT, before the password fields and in place of the reassurance-only card; nothing here asks for or records an acknowledgement", async () => {
  assert.equal(HOSTING_SLOT, "<!--hosting-control-->");
  assert.equal(PAGE_HTML.split(HOSTING_SLOT).length - 1, 1, "one slot in the page");
  const claim = claimSection(PAGE_HTML);
  assert.equal(claim.split(HOSTING_SLOT).length - 1, 1, "the slot is in the claim section");
  assert.ok(claim.indexOf(HOSTING_SLOT) < claim.indexOf('id="boot"') && claim.indexOf(HOSTING_SLOT) < claim.indexOf('id="pw1"'), "before the password fields");
  assert.doesNotMatch(PAGE_HTML, /If you ever lose the\s+password you choose here/, "no reassurance-only card");
  assert.doesNotMatch(noComments(claim), /acknowledg/i);
  /* placed by instance-setup's composition, the slot carries whatever block it is handed, there and only there */
  const block = '<div class="notice" id="hosting-control"><p>Whoever can sign in to the hosting account controls it.</p></div>';
  const composed = pageOf({ answered: true, result: { ok: true, group: "river-town" } }).replace(HOSTING_SLOT, () => block);
  const c = claimSection(composed);
  assert.ok(c.includes(block) && c.indexOf(block) < c.indexOf('id="pw1"'));
  assert.equal(composed.includes(HOSTING_SLOT), false);
  /* driven: the claim sends the token and the password and nothing else, and nothing is asked for the slot */
  const p = await claimed();
  assert.deepEqual(p.sent.find((c) => c.op === "claim").body, { bootstrapToken: "one-time", password: "the-founders-password" });
  assert.deepEqual(p.sent.filter((c) => /ack/i.test(c.op)), []);
});

test("R15 once the claim succeeds the section asks who holds the hosting account (holders and an optional note) and records it through op=hostingaccessset, stating NO_HOLDERS in the plane's words; it may be left unanswered", async () => {
  const p = await claimed();
  assert.deepEqual([p.el("#claim-form").hidden, p.el("#claim-after").hidden], [true, false]);
  assert.equal(p.el("#s-claim").sel, "#s-claim");
  assert.match(claimSection(PAGE_HTML), /id="claim-after" hidden[^]*id="cl-ha-holders"[^]*id="cl-ha-note"/);
  /* left unanswered: nothing of it is sent, and going on reaches the panel */
  assert.deepEqual(ops(p.after(), ["hostingaccessset"]), []);
  p.el("#cl-ha-holders").value = "  "; await p.el("#cl-ha-set").fire(); await settle();
  assert.equal(p.el("#cl-ha-err").textContent, "Name who holds hosting access: an empty answer records nobody. Nothing was written.");
  p.el("#cl-ha-holders").value = "Ada and the treasurer"; p.el("#cl-ha-note").value = "a shared group login";
  await p.el("#cl-ha-set").fire(); await settle();
  assert.deepEqual(ops(p.after(), ["hostingaccessset"]).at(-1), ["hostingaccessset", { holders: "Ada and the treasurer", note: "a shared group login" }]);
  assert.equal(p.el("#cl-ha-err").textContent, "");
  assert.match(p.el("#cl-ha-now").textContent, /^Recorded: Ada and the treasurer \(a shared group login\), by admin/);
  p.el("#cl-ha-holders").value = "Ada"; p.el("#cl-ha-note").value = "";
  await p.el("#cl-ha-set").fire(); await settle();
  assert.deepEqual(ops(p.after(), ["hostingaccessset"]).at(-1)[1], { holders: "Ada", note: null });
  for (const c of p.after()) assert.equal(c.token, "sess-founder", c.op);
});

test("R15 R17 R18 members and keys shows the current records (hosting access or that none is recorded, the court-notice choice, the assistant and the group key's state) and offers an administrator the same acts at any time", async () => {
  const pl = plane();
  const p = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  assert.equal(p.el("#mk-ha-now").textContent, "No one is recorded as holding the hosting account yet.");
  assert.equal(p.el("#mk-cn-now").textContent, "Nobody has chosen yet, which reads as not telling.");
  assert.equal(p.el("#mk-ai-now").textContent, "The assistant is off for your group's Civicsmith. No group API key is held.");
  p.el("#mk-ha-holders").value = "The treasurer"; await p.el("#mk-ha-set").fire(); await settle();
  assert.match(p.el("#mk-ha-now").textContent, /^Recorded: The treasurer, by admin/);
  p.el("#mk-cn-dont").checked = true; await p.el("#mk-cn-set").fire(); await settle();
  assert.equal(p.el("#mk-cn-now").textContent, "Your members are not told what a court can reach.");
  p.el("#mk-ai-both").checked = true; p.el("#mk-ai-key").value = "sk-ant-group-secret";
  await p.el("#mk-ai-set").fire(); await settle();
  assert.equal(p.el("#mk-ai-now").textContent, "The assistant is on for your group's Civicsmith. The group's API key is held, and on.");
  assert.deepEqual(ops(pl.sent, ["hostingaccessset", "courtnoticeset", "assistantset", "groupkeyset", "groupkeyswitch"]), [
    ["hostingaccessset", { holders: "The treasurer", note: null }], ["courtnoticeset", { choice: "dont" }],
    ["assistantset", { on: true }], ["groupkeyset", { key: "sk-ant-group-secret" }], ["groupkeyswitch", { on: true }]]);
  /* a member who does not administer is offered none of it: the section itself is not offered */
  const m = pageOver({ html: pageOf(undefined), session: { t: "sess-2", e: 0, w: "ruth" }, fetch: plane({ administer: false }).fetch });
  await settle();
  assert.equal(m.el("#go-members").hidden, true);
});

const SECOND = [/We recommend adding a second administrator\./, /never stuck when\s+one person is away/, /no one person holds everything/,
  /While your group has one administrator, it depends on that person, and on whoever holds the\s+hosting account\./];

test("R16 once the claim succeeds, and only there, the page recommends a second administrator, saying why, and states that one administrator means depending on that person and the hosting account; nothing is asked, recorded or gated", async () => {
  const claim = claimSection(PAGE_HTML);
  const after = (claim.match(/<div id="claim-after" hidden>[^]*$/) || [""])[0];
  for (const re of SECOND) {
    assert.match(after, re);
    assert.equal(noComments(PAGE_HTML).split(re).length - 1, 1, `said once in the page: ${re}`);
  }
  const rec = (after.match(/<div class="notice" id="cl-second">[^]*?<\/div>/) || [""])[0];
  assert.ok(rec);
  assert.doesNotMatch(rec, /<(?:input|button|select|textarea)\b/);
  const p = await claimed();
  assert.equal(p.el("#claim-after").hidden, false);
  /* nothing is gated: going on reaches the panel with nothing recorded */
  await p.el("#claim-on").fire(); await settle();
  assert.deepEqual([p.el("#claim-after").hidden, p.el("#claim-form").hidden], [true, false]);
  assert.deepEqual(ops(p.after(), ["hostingaccessset", "courtnoticeset", "assistantset", "groupkeyset", "groupkeyswitch", "memberadd"]), []);
  assert.ok(p.after().some((c) => c.op === "whoami"), "the panel opened");
  /* before a claim succeeds the part is hidden: a refused claim leaves it so */
  const r = plane({ refuse: { claim: { reason: "ALREADY_CLAIMED" } } });
  const q = pageOver({ html: PAGE_HTML, hash: "#boot=t", fetch: r.fetch });
  await settle();
  q.el("#claim-after").hidden = true;   // as the markup carries it
  q.el("#pw1").value = "the-founders-password"; q.el("#pw2").value = "the-founders-password";
  await q.el("#do-claim").fire(); await settle();
  assert.equal(q.el("#claim-after").hidden, true);
  assert.match(q.el("#claim-err").textContent, /already claimed/);
});

test("R17 once the claim succeeds the section offers whether members are told what a court can reach: the short explanation, then tell or don't, nothing preselected, sent as op=courtnoticeset; unchosen records nothing", async () => {
  const claim = claimSection(PAGE_HTML);
  for (const re of [/Some work is unlikely ever to\s+draw a court order\./, /Journalists, lawyers and auditors may have protections others lack, such as shield laws or\s+privilege\./,
                    /A group doing work that could draw one should make sure its members understand the risk\./, />Tell our members</, />Don't</])
    assert.match(claim, re);
  assert.doesNotMatch(claim, /\bchecked\b/);
  const p = await claimed();
  await p.el("#cl-cn-set").fire(); await settle();
  assert.deepEqual(ops(p.after(), ["courtnoticeset"]), [], "unchosen sends nothing");
  assert.match(p.el("#cl-cn-err").textContent, /nothing is recorded until you do/);
  p.el("#cl-cn-tell").checked = true;
  await p.el("#cl-cn-set").fire(); await settle();
  assert.deepEqual(ops(p.after(), ["courtnoticeset"]), [["courtnoticeset", { choice: "tell" }]]);
  assert.equal(p.el("#cl-cn-now").textContent, "Your members are told what a court can reach.");
  /* a refusal is stated in the plane's words */
  const q = await claimed({ refuse: { courtnoticeset: { reason: "NOT_AN_ADMIN", translation: "Only an administrator can do this." } } });
  q.el("#cl-cn-dont").checked = true; await q.el("#cl-cn-set").fire(); await settle();
  assert.equal(q.el("#cl-cn-err").textContent, "Only an administrator can do this.");
});

test("R18 once the claim succeeds the section offers how members reach the assistant: the group's API key, members' own accounts, both, or no AI, nothing preselected; each sets the switch as it says, and the key goes once, in the body, and is never shown again", async () => {
  const claim = claimSection(PAGE_HTML);
  for (const v of ["group", "own", "both", "none"]) assert.match(claim, new RegExp(`id="cl-ai-${v}" value="${v}"`));
  for (const re of [/The group's API key\.<\/b> One Anthropic API key, held by the group, serves every member who has no account of their own\./,
                    /Members' own accounts\.<\/b> Each member who wants the assistant connects their own Claude subscription or API key\./,
                    /<b>Both\.<\/b>/, /<b>No AI\.<\/b> Your group's Civicsmith without the assistant\./]) assert.match(claim, re);
  assert.doesNotMatch(claim, /\bchecked\b/);
  const SECRET = "sk-ant-api03-the-groups-own-key";
  const cases = {
    group: [["assistantset", { on: true }], ["groupkeyset", { key: SECRET }], ["groupkeyswitch", { on: true }]],
    both: [["assistantset", { on: true }], ["groupkeyset", { key: SECRET }], ["groupkeyswitch", { on: true }]],
    own: [["assistantset", { on: true }]],
    none: [["assistantset", { on: false }]],
  };
  for (const [choice, want] of Object.entries(cases)) {
    const p = await claimed();
    await p.el("#cl-ai-set").fire(); await settle();
    assert.deepEqual(ops(p.after(), ["assistantset", "groupkeyset", "groupkeyswitch"]), [], "unchosen sends nothing");
    p.el(`#cl-ai-${choice}`).checked = true; await p.el(`#cl-ai-${choice}`).fire("change");
    assert.equal(p.el("#cl-ai-keybox").hidden, !(choice === "group" || choice === "both"), choice);
    p.el("#cl-ai-key").value = SECRET;
    await p.el("#cl-ai-set").fire(); await settle();
    const sent = p.after().filter((c) => ["assistantset", "groupkeyset", "groupkeyswitch"].includes(c.op));
    assert.deepEqual(sent.map((c) => [c.op, c.body]), want, choice);
    for (const c of sent) { assert.equal(c.method, "POST"); assert.equal(c.token, "sess-founder"); }
    /* the key is never shown again: the field is emptied, and no drawn text holds it */
    assert.equal(p.el("#cl-ai-key").value, "", choice);
    for (const s of ["#cl-ai-now", "#cl-ai-err", "#as-state", "#mk-ai-now"])
      assert.equal(`${p.el(s).textContent}${p.el(s).innerHTML}`.includes(SECRET), false, `${choice} ${s}`);
    assert.equal(p.el("#cl-ai-err").textContent, "", choice);
  }
  /* the group key's refusal is stated in credentials' words */
  const r = await claimed({ refuse: { groupkeyset: { reason: "NOT_AN_ADMIN", translation: "Only an active administrator holds the group's key." } } });
  r.el("#cl-ai-group").checked = true; r.el("#cl-ai-key").value = SECRET;
  await r.el("#cl-ai-set").fire(); await settle();
  assert.equal(r.el("#cl-ai-err").textContent, "Only an active administrator holds the group's key.");
  assert.deepEqual(ops(r.after(), ["groupkeyswitch"]), [], "not switched on when the key was refused");
  /* the group's key chosen with no key pasted: nothing is sent */
  const k = await claimed();
  k.el("#cl-ai-both").checked = true; k.el("#cl-ai-key").value = "  ";
  await k.el("#cl-ai-set").fire(); await settle();
  assert.deepEqual(ops(k.after(), ["assistantset", "groupkeyset", "groupkeyswitch"]), []);
  assert.match(k.el("#cl-ai-err").textContent, /Paste the group's Anthropic API key/);
});
