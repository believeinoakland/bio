/* The group's settings on the page (R19 Places, R20 offices, R22 a member's language, R23 who your group is, R24 the
   assistant's state and switch), at the page's interface: the bytes `pageOf` answers and its script run in the
   fixture's sandbox over a fake plane answering the ops' documented shapes (instance-setup R53, R60, R64, R65;
   membership R109, R110; entities R1). End-to-end arms over the real ops may follow in instance-setup's job (K1851). */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML } from "../../../src/setup-page/index.mjs";
import { pageOver } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };

/* A fake plane: `profiles` the op's answer, the assistant on or off, the stored place, language and description, each
   op answering its documented shape; `refuse[op]` makes one refuse in the plane's words. */
function plane({ administer = true, profiles = { ok: true, profiles: [], conflicts: [], choices: [] }, on = false, refuse = {}, draft = null } = {}) {
  const st = { place: null, language: null, description: null, entities: [], assistant: { ok: true, on, set_by: on ? "admin" : null, set_at: on ? "2026-10-05T09:00:00Z" : null } };
  const sent = [];
  const answer = (op, body) => {
    if (refuse[op]) return { result: { ok: false, ...refuse[op] } };
    switch (op) {
      case "stats": return { ok: true };
      case "bootstrap": return { claimed: true, version: "v1" };
      case "whoami": return { result: { capabilities: ["contribute"], administer } };
      case "profiles": return { result: profiles };
      case "assistantstate": return { result: st.assistant };
      case "assistantset": st.assistant = { ok: true, on: body.on, set_by: "admin", set_at: "2026-10-06T08:00:00Z" }; return { result: { ...st.assistant } };
      case "placewantedstate":
        return administer ? { result: { name: st.place, set_by: st.place ? "admin" : null, set_at: null, matches: [] } }
                          : { result: { ok: false, reason: "NOT_AN_ADMIN" } };
      case "placewanted":
        if (body.name !== null && (typeof body.name !== "string" || !body.name.trim() || /\n/.test(body.name))) return { result: { ok: false, reason: "PLACE_NAME_MALFORMED", translation: "A place's name is one line of 1 to 200 characters." } };
        st.place = body.name && body.name.trim(); return { result: { ok: true, name: st.place } };
      case "entitycreate": {
        const entity_id = `ENT-2026-${String(st.entities.length + 1).padStart(4, "0")}`;
        st.entities.push({ entity_id, ...body }); return { result: { ok: true, entity_id, kind: body.kind, label: body.label.trim(), alias_count: 1 } };
      }
      case "memberlanguage": return { result: { language: st.language, set_at: st.language ? "2026-10-06T08:00:00Z" : null } };
      case "memberlanguageset":
        if (body.language !== null && !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(body.language)) return { result: { ok: false, reason: "LANGUAGE_MALFORMED", translation: "That is not a language tag." } };
        st.language = body.language; return { result: { ok: true, language: st.language } };
      case "groupdescription": return { result: { description: st.description, history: st.description ? [st.description] : [] } };
      case "groupdescriptionset": st.description = { ...body, by: "admin", at: "2026-10-06T09:00:00Z" }; return { result: { ok: true, ...st.description } };
      case "groupdescriptiondraft": return draft ? { result: draft } : { result: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", translation: "The assistant cannot draft this yet. Nothing was changed." } };
      default: return { result: { ok: true } };
    }
  };
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    sent.push({ op, body, method: (init && init.method) || "GET", token: u.searchParams.get("token") });
    const out = answer(op, body);
    return { ok: true, status: 200, json: async () => out };
  };
  return { st, sent, fetch };
}
const signedIn = async (opts = {}, { w = "admin", navigatorLanguage } = {}) => {
  const pl = plane(opts);
  const p = pageOver({ html: pageOf({ answered: true, result: { ok: true, group: "river-town" } }), session: { t: "sess-1", e: 0, w }, fetch: pl.fetch });
  if (navigatorLanguage) p.sandbox.navigator.language = navigatorLanguage;
  p.el("#of").hidden = true; p.el("#gd-help").hidden = true;   // as the markup carries them
  await settle();
  return { ...p, ...pl };
};
const ops = (sent, names) => sent.filter((c) => names.includes(c.op)).map((c) => [c.op, c.body]);
const HELD = { ok: true, profiles: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }], conflicts: [], choices: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }] };

test("R19 under Places an administrator is offered 'Name a place not yet listed' beside the held profiles, sent as op=placewanted, and the named place is shown with the word that administrators will be told when an update brings it", async () => {
  const p = await signedIn({ profiles: HELD });
  assert.match(PAGE_HTML, /<div id="pf-choose" hidden>[^]*<label for="pw-name" style="margin-top:0">Name a place not yet listed<\/label>/);
  assert.equal(p.el("#pf-choose").hidden, false);
  p.el("#pw-name").value = " "; await p.el("#pw-set").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["placewanted"]), [], "a blank name sends nothing");
  p.el("#pw-name").value = "  Harbor Point  "; await p.el("#pw-set").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["placewanted"]), [["placewanted", { name: "Harbor Point" }]]);
  assert.equal(p.el("#pw-now").textContent, "Named: Harbor Point. Administrators will be told when an update brings it.");
  assert.equal(p.el("#pw-err").textContent, "");
  /* the plane's refusal in its own words */
  const q = await signedIn({ profiles: HELD, refuse: { placewanted: { reason: "PLACE_NAME_MALFORMED", translation: "A place's name is one line of 1 to 200 characters." } } });
  q.el("#pw-name").value = "x"; await q.el("#pw-set").fire(); await settle();
  assert.equal(q.el("#pw-err").textContent, "A place's name is one line of 1 to 200 characters.");
  /* a member who does not administer is not offered it, and the page asks nothing of it */
  const m = await signedIn({ profiles: HELD, administer: false }, { w: "ruth" });
  assert.equal(m.el("#pf-choose").hidden, true);
  assert.deepEqual(ops(m.sent, ["placewanted", "placewantedstate"]), []);
});

test("R20 when no active profile names an office, the offices section says nothing is filled in because Civicsmith does not hold the group's place yet, names the place named, and offers an administrator adding offices through op=entitycreate (kind office), each shown marked as added by the group", async () => {
  const p = await signedIn();
  assert.equal(p.el("#of").hidden, false);
  assert.match(p.el("#of-why").textContent, /^Nothing is filled in here because Civicsmith does not hold your group's place yet\. You can add your group's offices yourself/);
  assert.equal(p.el("#of-add").hidden, false);
  p.el("#pw-name").value = "Harbor Point"; await p.el("#pw-set").fire(); await settle();
  assert.match(p.el("#of-why").textContent, /does not hold your group's place yet \(Harbor Point\)\./);
  /* the label and the administrator's own note are required by the page as by entities R1 */
  p.el("#of-label").value = "City Clerk"; p.el("#of-note").value = "";
  await p.el("#of-set").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["entitycreate"]), []);
  p.el("#of-note").value = "Keeps the council's minutes and answers records requests.";
  await p.el("#of-set").fire(); await settle();
  p.el("#of-label").value = "Harbor Auditor"; p.el("#of-note").value = "Audits the harbor fund.";
  await p.el("#of-set").fire(); await settle();
  /* each the administrator's own act: no declaredBy, no machine, no profile as its basis */
  assert.deepEqual(ops(p.sent, ["entitycreate"]), [
    ["entitycreate", { kind: "office", label: "City Clerk", note: "Keeps the council's minutes and answers records requests." }],
    ["entitycreate", { kind: "office", label: "Harbor Auditor", note: "Audits the harbor fund." }]]);
  for (const c of p.sent.filter((x) => x.op === "entitycreate")) assert.deepEqual([c.method, c.token], ["POST", "sess-1"]);
  const list = p.el("#of-list").innerHTML;
  assert.match(list, /City Clerk<\/span><span class="v"><span class="chip">added by your group<\/span>/);
  assert.match(list, /Harbor Auditor<\/span><span class="v"><span class="chip">added by your group<\/span>/);
  /* a refusal in the plane's words */
  const r = await signedIn({ refuse: { entitycreate: { reason: "ENTITY_NO_NOTE", translation: "A subject is registered with a note in your own words." } } });
  r.el("#of-label").value = "Clerk"; r.el("#of-note").value = "n"; await r.el("#of-set").fire(); await settle();
  assert.equal(r.el("#of-err").textContent, "A subject is registered with a note in your own words.");
  /* a member sees why and is offered no adding; with an active profile the section is not shown */
  const m = await signedIn({ administer: false }, { w: "ruth" });
  assert.deepEqual([m.el("#of").hidden, m.el("#of-add").hidden], [false, true]);
  assert.match(m.el("#of-why").textContent, /An administrator can add your group's offices/);
  const held = await signedIn({ profiles: HELD });
  assert.equal(held.el("#of").hidden, true);
  /* an answer naming the profiles' offices decides by them */
  const named = await signedIn({ profiles: { ...HELD, offices: [{ role: "Clerk", body: "the council" }] } });
  assert.equal(named.el("#of").hidden, true);
  const none = await signedIn({ profiles: { ...HELD, offices: [] } });
  assert.equal(none.el("#of").hidden, false);
});

test("R22 enrolment offers the language for the screens before op=enroll, starting from the device's setting, and sends op=memberlanguageset once enroll has signed the new member in", async () => {
  const sent = [];
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    sent.push({ op, body, token: u.searchParams.get("token") });
    const out = op === "invitelook" ? { result: { ok: true, cover: "c", role: "member" } }
      : op === "enroll" ? { result: { ok: true, memberId: "sam" } }
      : op === "login" ? { result: { ok: true, token: "sess-sam", expires: 0 } }
      : op === "bootstrap" ? { claimed: true } : op === "whoami" ? { result: { capabilities: ["contribute"], administer: false } }
      : op === "memberlanguage" ? { result: { language: "es-MX", set_at: "x" } } : { result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  };
  const p = pageOver({ html: PAGE_HTML, hash: "#invite=tok-1", fetch });
  p.sandbox.navigator.language = "es-MX";
  await settle();
  assert.equal(p.el("#en-lang").value, "es-MX", "starts from the device's setting");
  assert.match(PAGE_HTML, /<label for="en-lang">Language for the screens<\/label>[^]*<button id="en-go">/);
  p.el("#en-handle").value = "sam"; p.el("#en-pw").value = "sams-password-1"; p.el("#en-pw2").value = "sams-password-1";
  p.el("#en-lang").value = "es-MX";
  await p.el("#en-go").fire(); await settle();
  assert.deepEqual(sent.map((c) => c.op).filter((op) => ["enroll", "login", "memberlanguageset"].includes(op)), ["enroll", "login", "memberlanguageset"]);
  assert.deepEqual(sent.find((c) => c.op === "enroll").body.language, undefined, "the language is not enroll's");
  assert.deepEqual(sent.find((c) => c.op === "login").body, { role: "member:sam", password: "sams-password-1" });
  const set = sent.find((c) => c.op === "memberlanguageset");
  assert.deepEqual([set.body, set.token], [{ language: "es-MX" }, "sess-sam"]);
  assert.equal(p.el("#ln-now").textContent, "Your screens use es-MX.");
});

test("R22 the account screen (the panel) and members and keys offer the language at any time: read through op=memberlanguage, sent as the member's own op=memberlanguageset, empty clearing it; a refusal is stated in the plane's words", async () => {
  const p = await signedIn({}, { navigatorLanguage: "fr" });
  assert.equal(p.el("#ln-now").textContent, "Your screens follow your device's setting.");
  assert.equal(p.el("#ln-tag").value, "fr");
  p.el("#ln-tag").value = "pt-BR"; await p.el("#ln-set").fire(); await settle();
  assert.equal(p.el("#ln-now").textContent, "Your screens use pt-BR.");
  p.el("#ln-tag").value = "not a tag"; await p.el("#ln-set").fire(); await settle();
  assert.equal(p.el("#ln-err").textContent, "That is not a language tag.");
  await p.el("#go-members").fire(); await settle();
  assert.equal(p.el("#mln-tag").value, "pt-BR");
  p.el("#mln-tag").value = ""; await p.el("#mln-set").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["memberlanguageset"]), [["memberlanguageset", { language: "pt-BR" }], ["memberlanguageset", { language: "not a tag" }],
    ["memberlanguageset", { language: null }]]);
  assert.equal(p.el("#mln-now").textContent, "Your screens follow your device's setting.");
  /* every signed-in member, not only an administrator */
  const m = await signedIn({ administer: false }, { w: "ruth" });
  assert.equal(m.el("#ln-now").textContent, "Your screens follow your device's setting.");
});

test("R23 on 'Who your group is', while the assistant is on, an administrator may ask it to help write the focus and purpose: the answers go as op=groupdescriptiondraft, a draft fills the fields with its label, and nothing is kept until op=groupdescriptionset", async () => {
  const DRAFT = { focus: { text: "Housing code enforcement on the east side.", label: { kind: "machine", asked_by: "ada" } },
                  purpose: { text: "So tenants can see which complaints were answered.", label: { kind: "machine", asked_by: "ada" } } };
  const p = await signedIn({ on: true, draft: DRAFT });
  assert.equal(p.el("#gd-help").hidden, false);
  await p.el("#go-members").fire(); await settle();
  p.el("#gd-q1").value = "Housing complaints"; p.el("#gd-q2").value = "Tenants"; p.el("#gd-q3").value = "Answers";
  await p.el("#gd-ask").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["groupdescriptiondraft"]), [["groupdescriptiondraft", { answers: [
    { question: "What does your group work on?", text: "Housing complaints" },
    { question: "Who does your group work with, or for?", text: "Tenants" },
    { question: "Why does your group exist: what do you want to change?", text: "Answers" }] }]]);
  assert.deepEqual([p.el("#gd-focus").value, p.el("#gd-purpose").value], [DRAFT.focus.text, DRAFT.purpose.text]);
  assert.deepEqual([p.el("#gd-label").hidden, p.el("#gd-label").textContent], [false, "Draft · the assistant's, asked by ada"]);
  assert.deepEqual(ops(p.sent, ["groupdescriptionset"]), [], "nothing is kept by the draft");
  p.el("#gd-purpose").value = "So tenants can see which complaints the city answered.";
  await p.el("#gd-keep").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["groupdescriptionset"]), [["groupdescriptionset", { kinds: [], otherKind: null, visibility: "members",
    focus: DRAFT.focus.text, purpose: "So tenants can see which complaints the city answered." }]]);
  /* the kinds and visibility already kept travel unchanged with the new words */
  p.st.description = { kinds: ["community"], otherKind: null, focus: "f", purpose: "p", visibility: "public", by: "admin", at: "x" };
  await p.el("#go-members").fire(); await settle();
  p.el("#gd-focus").value = "New focus"; await p.el("#gd-keep").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["groupdescriptionset"]).at(-1)[1], { kinds: ["community"], otherKind: null, visibility: "public", focus: "New focus", purpose: "p" });
});

test("R23 a refusal, ASSISTANT_DRAFT_UNAVAILABLE included, is stated in its own words and leaves the fields as they were; without the assistant the act is not offered", async () => {
  const p = await signedIn({ on: true });
  await p.el("#go-members").fire(); await settle();
  p.el("#gd-focus").value = "What we wrote"; p.el("#gd-purpose").value = "Why we wrote it";
  await p.el("#gd-ask").fire(); await settle();
  assert.equal(p.el("#gd-ask-err").textContent, "The assistant cannot draft this yet. Nothing was changed.");
  assert.deepEqual([p.el("#gd-focus").value, p.el("#gd-purpose").value, p.el("#gd-label").textContent], ["What we wrote", "Why we wrote it", ""]);
  const q = await signedIn({ on: true, refuse: { groupdescriptiondraft: { reason: "GROUP_DRAFT_NO_ANSWERS", detail: "answer at least one question." } } });
  await q.el("#go-members").fire(); await settle();
  q.el("#gd-focus").value = "kept"; await q.el("#gd-ask").fire(); await settle();
  assert.deepEqual([q.el("#gd-ask-err").textContent, q.el("#gd-focus").value], ["answer at least one question.", "kept"]);
  const off = await signedIn({ on: false });
  assert.equal(off.el("#gd-help").hidden, true);
  assert.deepEqual(ops(off.sent, ["groupdescriptiondraft"]), []);
});

test("R24 every signed-in member is shown whether the assistant is on for your group's Civicsmith, and when and by whom it was last set; only an administrator is offered the switch, which says what it will do before it is pressed; an unanswered read offers nothing", async () => {
  const member = await signedIn({ on: true, administer: false }, { w: "ruth" });
  assert.match(member.el("#as-state").innerHTML, /The assistant is on for your group's Civicsmith\. Last set by admin on /);
  assert.equal(member.el("#as-choose").hidden, true);
  const admin = await signedIn({ on: false });
  assert.match(admin.el("#as-state").innerHTML, /^<p class="small" style="margin:0">The assistant is off for your group's Civicsmith\.<\/p>$/);
  assert.equal(admin.el("#as-choose").hidden, false);
  assert.equal(admin.el("#as-toggle").textContent, "Switch the assistant on");
  assert.match(admin.el("#as-what").textContent, /^Switching it on lets every member reached by an account ask the assistant/);
  await admin.el("#as-toggle").fire(); await settle();
  assert.deepEqual(ops(admin.sent, ["assistantset"]), [["assistantset", { on: true }]]);
  assert.match(admin.el("#as-state").innerHTML, /The assistant is on for your group's Civicsmith\. Last set by admin/);
  assert.equal(admin.el("#as-toggle").textContent, "Switch the assistant off");
  assert.match(admin.el("#as-what").textContent, /^Switching it off means no question is put to the assistant and nothing runs/);
  const silent = pageOver({ html: PAGE_HTML, session: { t: "s", e: 0, w: "admin" }, fetch: async (url) => {
    const op = new URL(url, "https://copy.example").searchParams.get("op");
    const out = op === "whoami" ? { result: { capabilities: [], administer: true } } : op === "assistantstate" ? { error: "x" } : { result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  } });
  await settle();
  assert.match(silent.el("#as-state").innerHTML, /^<p class="small" style="margin:0">Your group&#39;s Civicsmith could not read whether the assistant is on just now\.<\/p>$/);
  assert.equal(silent.el("#as-choose").hidden, true);
});
