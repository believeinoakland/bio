/* The claim section (R14–R18, R29), at the page's interface: the bytes `pageOf` answers, and its script run in the
   fixture's sandbox over a fake plane answering the ops' documented shapes (membership R11, R107; credentials R33, R34,
   R46, R51, R52; instance-setup R66). End-to-end arms over the real ops may follow in instance-setup's job (K1851). The
   security tools step (R30) is in security.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML, HOSTING_SLOT } from "../../../src/setup-page/index.mjs";
import { pageOver, bearerOf } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const claimSection = (html) => (html.match(/<section id="s-claim">[^]*?<\/section>/) || [""])[0];
const noComments = (html) => html.replace(/<!--[^]*?-->/g, "");

/* A fake plane holding the settings the claim section drives, answering as their modules document: hostingAccessSet
   (`NO_HOLDERS` for empty holders), courtNoticeSet (`COURT_NOTICE_UNKNOWN_CHOICE`), groupKeySet (`NO_SECRET`),
   groupKeySwitch, aiKeepAwaySet (`AI_KEEP_AWAY_NO_REASON` unless 1 to 2,000 characters), and their reads. `refuse[op]` makes one op
   refuse in the plane's words. */
function plane({ administer = true, refuse = {}, admins = 1, step = "answers" } = {}) {
  const st = { hosting: null, court: null, ka: { on: false, reason: null, set_by: null, set_at: null },
               key: { held: false, on: false, set_at: null, by: null }, codes: null, issued: 0, admins, invited: [] };
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
      /* credentials R51, R52 */
      case "aikeepaway":
        if (body.on === true && !(typeof body.reason === "string" && body.reason.length >= 1 && body.reason.length <= 2000))
          return { result: { ok: false, reason: "AI_KEEP_AWAY_NO_REASON", translation: "Keeping the group's material away from AI needs a reason. Nothing was written." } };
        st.ka = { on: body.on === true, reason: body.on === true ? body.reason : null, set_by: "admin", set_at: "2026-10-06T10:03:00Z" };
        return { result: { ok: true, ...st.ka } };
      case "aikeepawaystate": return { result: st.ka };
      case "groupkeyset":
        if (!String(body.key ?? "").trim()) return { result: { ok: false, reason: "NO_SECRET" } };
        st.key = { held: true, on: false, set_at: "2026-10-06T10:04:00Z", by: "admin" }; return { result: { ok: true, set_at: st.key.set_at } };
      case "groupkeyswitch": st.key = { ...st.key, on: body.on }; return { result: { ok: true, on: body.on } };
      case "groupkeystate": return { result: administer ? st.key : { on: st.key.on } };
      case "profiles": return { result: { ok: true, profiles: [], conflicts: [], choices: [] } };
      case "list": return { result: [] };
      /* credentials R46: ten codes answered once, each issue spending the last; the state never a code */
      case "recoverycodesissue":
        st.issued += 1; st.codes = Array.from({ length: 10 }, (_, i) => `rc${st.issued}-${String(i).padStart(2, "0")}-q7wk-3fz9-h2mx`);
        return { result: { ok: true, codes: st.codes.slice(), issuedAt: "2026-10-06T10:00:30Z" } };
      case "recoverycodesstate": return { result: { ok: true, held: !!st.codes, remaining: st.codes ? 10 : 0, issuedAt: st.codes ? "2026-10-06T10:00:30Z" : null } };
      /* instance-setup R66 */
      case "adminrecoverystep":
        if (step === "silent") return { error: "the store did not answer" };
        return { result: { ok: true, administrators: st.admins, codes_held: !!st.codes, remaining: st.codes ? 10 : 0, met: st.admins >= 2 && !!st.codes } };
      /* membership R12, R13: an administrator invited directly while fewer than two exist */
      case "memberadd":
        if (!String(body.cover ?? "").trim()) return { result: { ok: false, reason: "NO_COVER", translation: "A member is added with a cover to tell them apart by. Nothing was written." } };
        st.invited.push(body); return { result: { ok: true, memberId: body.memberId, role: body.role, invite: `inv-${body.memberId}-once`, expires: "2026-10-13T10:00:00Z" } };
      default: return { result: { ok: true } };
    }
  };
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    sent.push({ op, body, token: bearerOf(init), query: u.searchParams.get("token"), method: (init && init.method) || "GET" });
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
  for (const c of p.after()) assert.deepEqual([c.token, c.query], ["sess-founder", null], c.op);
});

test("R15 R17 R18 members and keys shows the current records (hosting access or that none is recorded, the court-notice choice, the group key's state and keep-away's) and offers an administrator the same acts at any time", async () => {
  const pl = plane();
  const p = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  assert.equal(p.el("#mk-ha-now").textContent, "No one is recorded as holding the hosting account yet.");
  assert.equal(p.el("#mk-cn-now").textContent, "Nobody has chosen yet, which reads as not telling.");
  assert.equal(p.el("#mk-gk-now").textContent, "Your group holds no API key: members bring their own.");
  assert.equal(p.el("#mk-ka-now").textContent, "Off: your group does not keep its material away from AI.");
  p.el("#mk-ha-holders").value = "The treasurer"; await p.el("#mk-ha-set").fire(); await settle();
  assert.match(p.el("#mk-ha-now").textContent, /^Recorded: The treasurer, by admin/);
  p.el("#mk-cn-dont").checked = true; await p.el("#mk-cn-set").fire(); await settle();
  assert.equal(p.el("#mk-cn-now").textContent, "Your members are not told what a court can reach.");
  p.el("#mk-gk-key").value = "sk-ant-group-secret";
  await p.el("#mk-gk-set").fire(); await settle();
  assert.equal(p.el("#mk-gk-now").textContent, "Your group holds an API key, and it is on.");
  assert.equal(p.el("#mk-ka-act").hidden, false);
  p.el("#mk-ka-reason").value = "We hold sources' medical records."; await p.el("#mk-ka-set").fire(); await settle();
  assert.match(p.el("#mk-ka-now").textContent, /^On: your group keeps its material away from AI/);
  assert.deepEqual(ops(pl.sent, ["hostingaccessset", "courtnoticeset", "groupkeyset", "groupkeyswitch", "aikeepaway"]), [
    ["hostingaccessset", { holders: "The treasurer", note: null }], ["courtnoticeset", { choice: "dont" }],
    ["groupkeyset", { key: "sk-ant-group-secret" }], ["groupkeyswitch", { on: true }],
    ["aikeepaway", { on: true, reason: "We hold sources' medical records." }]]);
  for (const r of ["groupkeystate", "aikeepawaystate"]) assert.ok(pl.sent.some((c) => c.op === r && c.method === "GET" && c.token === "sess-1"), r);
  /* a member who does not administer is offered none of it: the section itself is not offered */
  const m = pageOver({ html: pageOf(undefined), session: { t: "sess-2", e: 0, w: "ruth" }, fetch: plane({ administer: false }).fetch });
  await settle();
  assert.equal(m.el("#go-members").hidden, true);
});

const SECOND = [/<b>Add a second administrator\.<\/b>/, /never stuck when one person is\s+away/, /no one person holds everything/,
  /each administrator holds\s+recovery codes of their own/,
  /While your group has one administrator, it depends on that person, and on whoever holds\s+the hosting account\./];
const CODES1 = Array.from({ length: 10 }, (_, i) => `rc1-${String(i).padStart(2, "0")}-q7wk-3fz9-h2mx`);

test("R29 once the claim succeeds and the founder is signed in, before R15–R18, the page issues the founder's recovery codes (op=recoverycodesissue) and shows the ten once, saying what they are for, that they are never shown again, and to keep them apart from the password and the hosting account's sign-in", async () => {
  const claim = claimSection(PAGE_HTML);
  const after = (claim.match(/<div id="claim-after" hidden>[^]*$/) || [""])[0];
  for (const re of [/each one sets a new\s+password once: it works once and is then spent/, /They are shown now and will never be shown again\./,
                    /Keep them apart from your password and from the hosting account's sign-in/])
    assert.match(after, re);
  assert.ok(after.indexOf('id="cl-rc"') < after.indexOf('id="cl-sa"') && after.indexOf('id="cl-sa"') < after.indexOf('id="cl-ha"'),
    "the codes, then the second administrator, then R15–R18");
  const p = await claimed();
  const issued = p.after().filter((c) => c.op === "recoverycodesissue");
  assert.deepEqual(issued.map((c) => [c.method, c.body, c.token, c.query]), [["POST", {}, "sess-founder", null]]);
  assert.equal(p.after()[0].op, "recoverycodesissue", "issued first, before the choices are read");
  assert.equal(p.el("#cl-rc-shown").hidden, false);
  assert.equal(p.el("#cl-rc-codes").textContent, CODES1.join("\n"));
  assert.equal(p.el("#cl-rc-err").textContent, "");
});

test("R29 the codes are held only in the page's memory while shown: never in the browser's storage, an address, a log or a later request; copied as text or saved as a file made in the browser, its name carrying none; gone when the founder leaves the section", async () => {
  const logged = [];
  const quiet = { log: (...a) => logged.push(a), warn: (...a) => logged.push(a), error: (...a) => logged.push(a), info: (...a) => logged.push(a) };
  const pl = plane();
  const copied = [];
  const p = pageOver({ html: pageOf({ answered: true, result: { ok: true, group: "river-town" } }), hash: "#boot=one-time", fetch: pl.fetch,
    globals: { console: quiet, navigator: { clipboard: { writeText: async (t) => { copied.push(t); } } } } });
  await settle();
  p.el("#pw1").value = "the-founders-password"; p.el("#pw2").value = "the-founders-password";
  await p.el("#do-claim").fire(); await settle();
  assert.equal(p.el("#cl-rc-codes").textContent, CODES1.join("\n"));
  await p.el("#cl-rc-copy").fire(); await settle();
  assert.deepEqual(copied, [CODES1.join("\n")]);
  await p.el("#cl-rc-save").fire(); await settle();
  assert.equal(p.files.length, 1);
  assert.equal(p.files[0].name, "recovery-codes.txt");
  assert.equal(await p.files[0].blob.text(), CODES1.join("\n") + "\n");
  assert.ok(CODES1.every((c) => !p.files[0].name.includes(c) && !p.files[0].url.includes(c)));
  assert.deepEqual(p.objectUrls.map((u) => u.released), [true], "the file's object address is released");
  /* the founder goes on through the claim's choices and into the page */
  p.el("#cl-ha-holders").value = "Ada"; await p.el("#cl-ha-set").fire(); await settle();
  p.el("#cl-cn-tell").checked = true; await p.el("#cl-cn-set").fire(); await settle();
  await p.el("#claim-on").fire(); await settle();
  await p.el("#go-members").fire(); await settle();
  const later = pl.sent.slice(pl.sent.findIndex((c) => c.op === "recoverycodesissue") + 1);
  assert.ok(later.length > 5, "not vacuous: requests followed");
  const anyCode = (t) => CODES1.some((c) => String(t).includes(c));
  for (const c of pl.sent) assert.equal(anyCode(JSON.stringify(c.body ?? null)) && c.op !== "recoverycodesissue", false, c.op);
  for (const c of later) assert.equal(anyCode(JSON.stringify(c)), false, c.op);
  for (const k of ["bio-session"]) assert.equal(anyCode(p.sandbox.sessionStorage.getItem(k)), false);
  assert.equal(anyCode(JSON.stringify(logged)), false, "nothing logged holds a code");
  /* left the section: the codes are gone from it */
  assert.deepEqual([p.el("#cl-rc-codes").textContent, p.el("#cl-rc-shown").hidden], ["", true]);
  assert.match(p.el("#mk-rc-now").textContent, /^You hold recovery codes: 10 left/);
  assert.equal(anyCode(p.el("#mk-rc-now").textContent), false);
});

test("R29 a refusal is stated in credentials' words and the claim's section goes on", async () => {
  const p = await claimed({ refuse: { recoverycodesissue: { reason: "NOT_AN_ADMIN", translation: "Only an administrator holds recovery codes." } } });
  assert.equal(p.el("#cl-rc-err").textContent, "Only an administrator holds recovery codes.");
  assert.deepEqual([p.el("#claim-after").hidden, p.el("#cl-rc-shown").hidden], [false, true]);
  p.el("#cl-ha-holders").value = "Ada"; await p.el("#cl-ha-set").fire(); await settle();
  assert.deepEqual(ops(p.after(), ["hostingaccessset"]), [["hostingaccessset", { holders: "Ada", note: null }]]);
});

test("R29 members and keys offers every administrator op=recoverycodesissue for their own role at any time, saying issuing again spends the earlier codes, and shows op=recoverycodesstate's held, remaining and issuedAt, never a code", async () => {
  assert.match(PAGE_HTML, /<button id="mk-rc-issue">Issue new recovery codes<\/button><\/div>\s*<p class="hint">Issuing new codes spends every code you hold now\.<\/p>/);
  const pl = plane();
  const p = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  assert.equal(p.el("#mk-rc-now").textContent, "You hold no recovery codes yet.");
  await p.el("#mk-rc-issue").fire(); await settle();
  assert.deepEqual(ops(pl.sent, ["recoverycodesissue"]), [["recoverycodesissue", {}]]);
  assert.equal(p.el("#mk-rc-codes").textContent, CODES1.join("\n"));
  await p.el("#mk-rc-issue").fire(); await settle();
  assert.equal(p.el("#mk-rc-codes").textContent, CODES1.map((c) => c.replace("rc1-", "rc2-")).join("\n"), "issued again: the new codes");
  /* leaving the section forgets them; coming back shows the state, never a code */
  await p.el("#go-browse").fire(); await settle();
  assert.deepEqual([p.el("#mk-rc-codes").textContent, p.el("#mk-rc-shown").hidden], ["", true]);
  await p.el("#go-members").fire(); await settle();
  assert.match(p.el("#mk-rc-now").textContent, /^You hold recovery codes: 10 left, issued /);
  assert.equal(p.el("#mk-rc-codes").textContent, "");
});

test("R16 once the claim succeeds and the codes are shown, the page asks the founder to add a second administrator, saying why, and states that one administrator means depending on that person and the hosting account", async () => {
  const claim = claimSection(PAGE_HTML);
  const after = (claim.match(/<div id="claim-after" hidden>[^]*$/) || [""])[0];
  for (const re of SECOND) {
    assert.match(after, re);
    assert.equal(noComments(PAGE_HTML).split(re).length - 1, 1, `said once in the page: ${re}`);
  }
  assert.doesNotMatch(noComments(PAGE_HTML), /We recommend adding a second administrator/, "asked for, not only recommended");
  /* before a claim succeeds the part is hidden: a refused claim leaves it so */
  const r = plane({ refuse: { claim: { reason: "ALREADY_CLAIMED" } } });
  const q = pageOver({ html: PAGE_HTML, hash: "#boot=t", fetch: r.fetch });
  await settle();
  q.el("#claim-after").hidden = true;   // as the markup carries it
  q.el("#pw1").value = "the-founders-password"; q.el("#pw2").value = "the-founders-password";
  await q.el("#do-claim").fire(); await settle();
  assert.equal(q.el("#claim-after").hidden, true);
  assert.match(q.el("#claim-err").textContent, /already claimed/);
  assert.deepEqual(r.sent.filter((c) => ["recoverycodesissue", "memberadd"].includes(c.op)), []);
});

test("R16 the act is offered there: a name and an id sent as op=memberadd with role admin, the one-time invitation answered shown once to pass on, membership's refusal stated; the founder may leave it for later, and nothing is gated", async () => {
  const p = await claimed();
  p.el("#cl-sa-name").value = "  "; p.el("#cl-sa-id").value = "bea";
  await p.el("#cl-sa-add").fire(); await settle();
  assert.equal(p.el("#cl-sa-err").textContent, "A member is added with a cover to tell them apart by. Nothing was written.");
  p.el("#cl-sa-name").value = "Bea from the clinic"; p.el("#cl-sa-id").value = " Bea Two ";
  await p.el("#cl-sa-add").fire(); await settle();
  const adds = p.after().filter((c) => c.op === "memberadd");
  assert.deepEqual(adds.map((c) => [c.method, c.body, c.token, c.query]).at(-1),
    ["POST", { memberId: "bea-two", cover: "Bea from the clinic", role: "admin" }, "sess-founder", null]);
  assert.match(p.el("#cl-sa-invite").innerHTML, /Send bea-two this link to join as an administrator\. It works once, it is not shown again/);
  assert.match(p.el("#cl-sa-invite").innerHTML, /https:\/\/copy\.example\/#invite=inv-bea-two-once/);
  assert.deepEqual([p.el("#cl-sa-err").textContent, p.el("#cl-sa-id").value, p.el("#cl-sa-name").value], ["", "", ""]);
  /* left for later: going on reaches the panel with nothing asked of it */
  const q = await claimed();
  await q.el("#claim-on").fire(); await settle();
  assert.deepEqual([q.el("#claim-after").hidden, q.el("#claim-form").hidden], [true, false]);
  assert.deepEqual(ops(q.after(), ["hostingaccessset", "courtnoticeset", "groupkeyset", "groupkeyswitch", "aikeepaway", "securitytooladd", "memberadd"]), []);
  assert.ok(q.after().some((c) => c.op === "whoami"), "the panel opened");
});

test("R16 members and keys shows every administrator instance-setup's step while it is not met: how many administrators, whether they hold codes, and the acts that meet it (adding an administrator, issuing their codes); nothing of it once met; an unanswered step is said, never read as unmet", async () => {
  const at = async (opts) => {
    const pl = plane(opts);
    const p = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
    p.el("#rs").hidden = true;   // as the markup carries it
    await settle();
    await p.el("#go-members").fire(); await settle();
    return { ...p, pl };
  };
  assert.match(PAGE_HTML, /<div class="notice" id="rs" hidden>/);
  const one = await at({ admins: 1 });
  assert.deepEqual(one.pl.sent.filter((c) => c.op === "adminrecoverystep").map((c) => [c.method, c.token, c.query]), [["GET", "sess-1", null]]);
  assert.equal(one.el("#rs").hidden, false);
  assert.equal(one.el("#rs-now").textContent, "Your group has 1 administrator. You hold no recovery codes yet.");
  assert.deepEqual([one.el("#rs-add").hidden, one.el("#rs-codes").hidden], [false, false]);
  /* its acts: issuing this administrator's codes, then adding the second; the step re-read after each */
  await one.el("#rs-issue").fire(); await settle();
  assert.equal(one.el("#mk-rc-codes").textContent, CODES1.join("\n"));
  assert.equal(one.el("#rs-now").textContent, "Your group has 1 administrator. You hold recovery codes (10 left).");
  assert.deepEqual([one.el("#rs-add").hidden, one.el("#rs-codes").hidden], [false, true]);
  one.el("#mk-sa-name").value = "Bea"; one.el("#mk-sa-id").value = "bea";
  await one.el("#mk-sa-add").fire(); await settle();
  assert.deepEqual(ops(one.pl.sent, ["memberadd"]), [["memberadd", { memberId: "bea", cover: "Bea", role: "admin" }]]);
  assert.match(one.el("#mk-sa-invite").innerHTML, /#invite=inv-bea-once/);
  /* two administrators, codes not held: only the codes' act */
  const two = await at({ admins: 2 });
  assert.equal(two.el("#rs-now").textContent, "Your group has 2 administrators. You hold no recovery codes yet.");
  assert.deepEqual([two.el("#rs-add").hidden, two.el("#rs-codes").hidden], [true, false]);
  /* met: nothing of it */
  await two.el("#rs-issue").fire(); await settle();
  assert.equal(two.el("#rs").hidden, true);
  /* unanswered: said, and no act offered as though it were unmet */
  const silent = await at({ step: "silent" });
  assert.equal(silent.el("#rs-now").textContent, "Whether your group has two administrators holding recovery codes could not be read just now.");
  assert.deepEqual([silent.el("#rs-add").hidden, silent.el("#rs-codes").hidden], [true, true]);
  /* nothing gated: with the step open, every act of the section is still sent */
  one.el("#mk-ha-holders").value = "Ada"; await one.el("#mk-ha-set").fire(); await settle();
  assert.deepEqual(ops(one.pl.sent, ["hostingaccessset"]), [["hostingaccessset", { holders: "Ada", note: null }]]);
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

const OWN = /A member may always connect their own Claude subscription or API key, which serves only them, unless\s+your group keeps its material away from AI\./;
const LEAVE = /<b>Your group's Anthropic API key \(optional\)\.<\/b> Leave it empty and members bring their\s+own\./;

test("R18 (T37) once the claim succeeds the section offers 'Keep our material away from AI' first, then the group's API key as an optional field ('leave it empty and members bring their own'), and states that a member may always connect their own account unless the group keeps its material away from AI; the 'whether the group pays' choice, the four-way choice and op=assistantset are gone, and no sentence says the group pays", async () => {
  const claim = claimSection(PAGE_HTML);
  const after = (claim.match(/<div id="claim-after" hidden>[^]*$/) || [""])[0];
  for (const re of [OWN, LEAVE, /<b>Keep our material away from AI\.<\/b> Off unless an administrator turns it on/]) assert.match(after, re);
  /* keep-away first, then the key, each after R15 and R17 and before R30's step; the same order in members and keys */
  const at = (id) => after.indexOf(`id="${id}"`);
  assert.ok(at("cl-ha") < at("cl-cn") && at("cl-cn") < at("cl-ka") && at("cl-ka") < at("cl-gk") && at("cl-gk") < at("cl-st"), "R15, R17, keep-away, the key, then R30");
  assert.ok(PAGE_HTML.indexOf('id="mk-ka"') < PAGE_HTML.indexOf('id="mk-gk"'), "keep-away before the key in members and keys");
  assert.doesNotMatch(after, /\bchecked\b/, "nothing preselected");
  /* the pay choice is gone: no radio, no option, no sentence in the page's member text or in anything its script writes */
  for (const gone of [/\b(?:cl|mk)-gk-(?:pays|not|keybox)\b/, /name="(?:cl|mk)-gk"/, /<b>The group (?:does not )?pays?\.<\/b>/, /Does your group pay/])
    assert.equal(gone.test(PAGE_HTML), false, `the pay choice is gone: ${gone}`);
  assert.doesNotMatch(noComments(PAGE_HTML).replace(/\/\*[^]*?\*\//g, ""), /\b(?:pays|does not pay|do(?:es)?n't pay)\b/i, "no sentence says the group pays or does not pay");
  for (const gone of [/"assistant(?:set|state)"/, /\b(?:cl|mk)-ai-/, /\bas-(?:state|choose|toggle)\b/, /<b>Both\.<\/b>/, /<b>No AI\.<\/b>/])
    assert.equal(gone.test(PAGE_HTML), false, `the four-way choice and the switch are gone: ${gone}`);
  /* the page never sends op=assistantset, whatever is pressed, and nothing drawn says the group pays */
  const p = await claimed();
  p.el("#cl-gk-key").value = "sk-ant-x"; await p.el("#cl-gk-set").fire(); await settle();
  p.el("#cl-ka-reason").value = "r"; await p.el("#cl-ka-set").fire(); await settle();
  await p.el("#cl-ka-set").fire(); await settle();
  await p.el("#claim-on").fire(); await settle();
  await p.el("#pn-ka-set").fire(); await settle();
  await p.el("#go-members").fire(); await settle();
  assert.ok(p.sent.length > 20, "not vacuous");
  assert.deepEqual(p.sent.filter((c) => /^assistant/.test(c.op)), []);
  for (const s of ["#cl-gk-now", "#cl-gk-said", "#cl-ka-now", "#cl-ka-what", "#mk-gk-now", "#mk-ka-what", "#pn-ka-now", "#pn-ka-what"])
    assert.doesNotMatch(p.el(s).textContent, /\b(?:pays|pay)\b/i, s);
});

test("R18 (T37) the group's API key: a key typed is sent once, in the body, through op=groupkeyset then op=groupkeyswitch on, never shown again; a field left empty sends nothing and records nothing; credentials' refusal is stated; members and keys shows whether a key is held and on, never the key, and offers the same field", async () => {
  const SECRET = "sk-ant-api03-the-groups-own-key";
  const p = await claimed();
  assert.equal(p.el("#cl-gk-now").textContent, "Your group holds no API key: members bring their own.");
  /* left empty, or only spaces: nothing sent, nothing recorded, and said so */
  for (const v of ["", "   "]) {
    p.el("#cl-gk-key").value = v; await p.el("#cl-gk-set").fire(); await settle();
    assert.deepEqual(ops(p.after(), ["groupkeyset", "groupkeyswitch", "groupkeyremove"]), [], "an empty field sends nothing");
    assert.equal(p.el("#cl-gk-said").textContent, "Nothing was recorded: the field is empty, so members bring their own.");
    assert.equal(p.el("#cl-gk-err").textContent, "");
  }
  assert.deepEqual(p.st.key, { held: false, on: false, set_at: null, by: null }, "nothing recorded");
  p.el("#cl-gk-key").value = ` ${SECRET} `; await p.el("#cl-gk-set").fire(); await settle();
  const sent = p.after().filter((c) => ["groupkeyset", "groupkeyswitch"].includes(c.op));
  assert.deepEqual(sent.map((c) => [c.op, c.body]), [["groupkeyset", { key: SECRET }], ["groupkeyswitch", { on: true }]]);
  for (const c of sent) { assert.equal(c.method, "POST"); assert.deepEqual([c.token, c.query], ["sess-founder", null]); }
  assert.equal(p.el("#cl-gk-now").textContent, "Your group holds an API key, and it is on.");
  assert.equal(p.el("#cl-gk-said").textContent, "");
  /* never shown again: the field is emptied, no drawn text and no later request holds it */
  assert.equal(p.el("#cl-gk-key").value, "");
  for (const s of ["#cl-gk-now", "#cl-gk-err", "#cl-gk-said", "#pn-ka-now", "#mk-gk-now"]) assert.equal(`${p.el(s).textContent}${p.el(s).innerHTML}`.includes(SECRET), false, s);
  await p.el("#claim-on").fire(); await settle();
  await p.el("#go-members").fire(); await settle();
  assert.equal(p.el("#mk-gk-now").textContent, "Your group holds an API key, and it is on.");
  assert.equal(p.el("#mk-gk-now").textContent.includes(SECRET), false);
  const later = p.sent.slice(p.sent.findIndex((c) => c.op === "groupkeyset") + 1);
  assert.ok(later.some((c) => c.op === "groupkeystate"), "not vacuous: the state was read again");
  assert.equal(later.some((c) => JSON.stringify(c).includes(SECRET)), false);
  /* credentials' refusal, in its words, and not switched on when the key was refused */
  const r = await claimed({ refuse: { groupkeyset: { reason: "NOT_AN_ADMIN", translation: "Only an active administrator holds the group's key." } } });
  r.el("#cl-gk-key").value = SECRET;
  await r.el("#cl-gk-set").fire(); await settle();
  assert.equal(r.el("#cl-gk-err").textContent, "Only an active administrator holds the group's key.");
  assert.deepEqual(ops(r.after(), ["groupkeyswitch"]), []);
  assert.equal(r.el("#cl-gk-key").value, "");
  const w = await claimed({ refuse: { groupkeyswitch: { reason: "NO_SECRET", translation: "No key is held to switch on." } } });
  w.el("#cl-gk-key").value = SECRET; await w.el("#cl-gk-set").fire(); await settle();
  assert.equal(w.el("#cl-gk-err").textContent, "No key is held to switch on.");
  /* a state not read is said, never as "no key" */
  const u = await claimed({ refuse: { groupkeystate: { reason: "STORE_DID_NOT_ANSWER" } } });
  assert.equal(u.el("#cl-gk-now").textContent, "Whether your group holds an API key could not be read just now.");
});

test("R18 'Keep our material away from AI' is off and shown off; turning it on asks the reason and says what it does before it is sent, then sends op=aikeepaway with on true and the reason; credentials' refusal (AI_KEEP_AWAY_NO_REASON among them) is stated; leaving it off sends nothing", async () => {
  const p = await claimed();
  assert.equal(p.el("#cl-ka-now").textContent, "Off: your group does not keep its material away from AI.");
  assert.deepEqual([p.el("#cl-ka-act").hidden, p.el("#cl-ka-why").hidden], [false, false]);
  assert.equal(p.el("#cl-ka-set").textContent, "Keep our material away from AI");
  /* what it does, said before it is pressed (DEC-172 (3), (6)) */
  assert.equal(p.el("#cl-ka-what").textContent, "Turning it on means no assistant may be used in your group while it is on: not the group's API key, and not a member's own account. Everything else works without the assistant. Every member is shown your reason.");
  assert.deepEqual(ops(p.after(), ["aikeepaway"]), [], "left off, nothing is sent");
  /* no reason, or one past 2,000 characters: nothing sent */
  p.el("#cl-ka-reason").value = "   "; await p.el("#cl-ka-set").fire(); await settle();
  assert.match(p.el("#cl-ka-err").textContent, /Write your reason first/);
  p.el("#cl-ka-reason").value = "x".repeat(2001); await p.el("#cl-ka-set").fire(); await settle();
  assert.match(p.el("#cl-ka-err").textContent, /longer than 2,000 characters/);
  assert.deepEqual(ops(p.after(), ["aikeepaway"]), []);
  /* exactly 2,000 is sent, as typed but trimmed, by the founder's session in the body */
  const R = "y".repeat(2000);
  p.el("#cl-ka-reason").value = `  ${R} `; await p.el("#cl-ka-set").fire(); await settle();
  const sent = p.after().filter((c) => c.op === "aikeepaway");
  assert.deepEqual(sent.map((c) => [c.method, c.body, c.token, c.query]), [["POST", { on: true, reason: R }, "sess-founder", null]]);
  assert.match(p.el("#cl-ka-now").textContent, /^On: your group keeps its material away from AI, so no assistant may be used in it\. Turned on by admin on /);
  assert.equal(p.el("#cl-ka-reason").value, "");
  /* credentials' refusal, in its words */
  const q = await claimed({ refuse: { aikeepaway: { reason: "AI_KEEP_AWAY_NO_REASON", translation: "Keeping the group's material away from AI needs a reason. Nothing was written." } } });
  q.el("#cl-ka-reason").value = "a reason"; await q.el("#cl-ka-set").fire(); await settle();
  assert.equal(q.el("#cl-ka-err").textContent, "Keeping the group's material away from AI needs a reason. Nothing was written.");
  assert.equal(q.el("#cl-ka-now").textContent, "Off: your group does not keep its material away from AI.");
  /* the members and keys section offers the same act to an administrator, and the state of both */
  const m = await claimed();
  await m.el("#claim-on").fire(); await settle();
  await m.el("#go-members").fire(); await settle();
  assert.deepEqual([m.el("#mk-ka-act").hidden, m.el("#mk-ka-set").textContent], [false, "Keep our material away from AI"]);
  /* turning it off says what follows without saying the group "pays" (T37) */
  m.el("#mk-ka-reason").value = "a reason"; await m.el("#mk-ka-set").fire(); await settle();
  assert.equal(m.el("#mk-ka-what").textContent, "Turning it off lets the assistant be used again in your group: through the group's API key if one is held and on, and through members' own accounts. Nothing already recorded changes.");
  assert.equal(m.el("#mk-gk-now").textContent, "Your group holds no API key: members bring their own.");
});
