/* The decisions the record routes to a member (R75; C62, DEC-378, K4169) on Home and the queue, on the real served page. The owners'
   declared ops are registered first (`taskdecide` is `tasks`' alone), so the authority form is drawn; every request is checked by the
   harness against the owners' declarations. Every sentence is asserted as `word(key, vars)` (R34), so no test holds a sentence's English.
   The registration is asynchronous, so the page and the harness are imported after it (a static import would load the screens first). */
import "./register-tasks.mjs";
import test from "node:test";
import assert from "node:assert/strict";
const { open, ok, text, ops, button, press, beside, last, main, word, hasWord, withScreens, dmy } = await import("./page.mjs");
const { ADMIN } = await import("../interface-shell/harness.mjs");

const NONE = { ungrouped: true, ancestors: [] };
const AUTH = { id: "TSK-7", class: "OBLIGATION", kind: "authority-undetermined", case: NONE, assignee: "mai", summary: "Say who issued the document",
  subject: { kind: "bundle", id: "INF-7", title: "Permit application" }, options: [], door: ["taskdecide", "taskforward", "taskresolve"], disposition: { available: false, instead: "taskdecide" } };
const ENDORSE = { id: "OBLIGATION::endorsement-owed::admin::M-9::mai", class: "OBLIGATION", kind: "endorsement-owed", case: NONE, assignee: "mai",
  subject: { kind: "member", id: "M-9" }, fills: { who: "ana" }, basis: { have: ["bo"], awaiting: ["cy", "di"] }, summary: "Endorse ana as an administrator", options: [{ id: "adminendorse" }], door: "adminendorse", disposition: { available: false, instead: "adminendorse" } };
const OWNER = (change = "add") => ({ id: `OBLIGATION::endorsement-owed::owner::PROJ-1::${change}:ben::mai`, class: "OBLIGATION", kind: "endorsement-owed", case: NONE, assignee: "mai",
  subject: { kind: "project", id: "PROJ-1", name: "Pothole repairs", change, target: "ben" }, fills: { who: "ben" }, basis: { agreed: ["mai"], awaiting: [] }, summary: "Agree on an owner change", options: [{ id: change === "add" ? "projectowneradd" : "projectownerremove" }],
  door: change === "add" ? "projectowneradd" : "projectownerremove", disposition: { available: false, instead: change === "add" ? "projectowneradd" : "projectownerremove" } });
const EXPERT = { id: "OBLIGATION::expertise-confirmation-owed::M-9::tenant law", class: "OBLIGATION", kind: "expertise-confirmation-owed", case: NONE, assignee: "mai",
  subject: { kind: "member", id: "M-9", label: "tenant law" }, fills: { who: "ana" }, summary: "Confirm ana's expertise", options: [{ id: "expertiseconfirm" }], door: "expertiseconfirm", disposition: { available: false, instead: "expertiseconfirm" } };
const ADMINS = { whoami: ok({ ...ADMIN, capabilities: ["contribute"] }) };
const SEEN = { lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Pothole repairs", stage: "forming" }] }) };
const SCR = { screens: withScreens("document", "project") };
const screens = ["queue", "home"];
const at = { queue: "/app/queue", home: "/app" };
const ROSTER = ok({ members: ["mai", "ana", "ben", "bo", "cy", "di"].map((h) => ({ member_id: "id-" + h, handle: h, status: "active" })) });
const planeOf = (items, extra = {}) => ({ memberlist: ROSTER, ...ADMINS, ...SEEN, queue: ok({ items, item_count: items.length }), ...extra });

test("R75 (words): the words the authority form and the routed items read are held by the word list", () => {
  for (const k of ["screen.queue.routed.auth.item", "screen.queue.routed.auth.open", "screen.queue.routed.auth.question", "screen.queue.routed.auth.know",
    "screen.queue.routed.auth.cannot", "screen.queue.routed.auth.issuer.label", "screen.queue.routed.auth.tried.label", "screen.queue.routed.auth.tried.help1",
    "screen.queue.routed.auth.record", "screen.queue.routed.auth.how.label", "screen.queue.routed.auth.fine1", "queue.owed.nobody",
    "queue.endorsement-owed.summary", "queue.endorsement-owed.detail", "queue.endorsement-owed.owner.summary.add", "queue.endorsement-owed.owner.summary.remove",
    "queue.endorsement-owed.owner.detail", "queue.expertise-confirmation-owed.summary", "queue.expertise-confirmation-owed.detail", "act.projectownerremove.label.queue"]) assert.ok(hasWord(k), k);
});

for (const where of screens) {
  test(`R75 (${where}): an authority task opens a small form, neither answer preselected; "I know who issued it" sends the issuer and how she knows`, async () => {
    const p = await open(at[where], planeOf([AUTH], { taskdecide: ok({ ok: true, id: "TSK-7", status: "resolved", outcome: "determined" }) }), SCR);
    assert.ok(text(p).includes(word("screen.queue.routed.auth.item")));
    assert.ok(main(p).querySelector('a.cs-ref[href="/app/document/INF-7"]'), "it names the document by its title");
    const b = button(p, "taskdecide");
    assert.ok(b, "the form's act is drawn");
    const f = b.dataset.f;
    const radios = main(p).querySelectorAll(`#${f}-who input[type="radio"]`);
    assert.deepEqual(radios.map((r) => r.getAttribute("value")), ["known", "unknown"]);
    assert.ok(radios.every((r) => !r.checked), "neither is preselected");
    assert.ok(text(p, main(p).querySelector(`#${f}-who legend`)).includes(word("screen.queue.routed.auth.question")));
    const form = text(p, b.closest("details"));
    for (const k of ["screen.queue.routed.auth.cannot", "screen.queue.routed.auth.issuer.label", "screen.queue.routed.auth.tried.label", "screen.queue.routed.auth.tried.help1"]) assert.ok(form.includes(word(k)), k);
    assert.ok(b.textContent.startsWith(word("screen.queue.routed.auth.record")), "the answer is recorded by its own button");
    // control: nothing chosen sends nothing
    await press(p, "taskdecide");
    assert.equal(p.byOp("taskdecide").length, 0);
    // known without the issuing party, then without how she knows: nothing is sent, each refused beside the act
    await press(p, "taskdecide", { values: { [`${f}-who-0`]: true } });
    assert.equal(p.byOp("taskdecide").length, 0);
    const missingParty = await press(p, "taskdecide", { values: { [`${f}-how`]: "Its letterhead" } });
    assert.equal(beside(p, missingParty), word("screen.queue.routed.auth.refused.issuer2"));
    const missingHow = await press(p, "taskdecide", { values: { [`${f}-issuer`]: "Public Works", [`${f}-how`]: "" } });
    assert.equal(beside(p, missingHow), word("screen.queue.routed.auth.refused.basis"));
    assert.equal(p.byOp("taskdecide").length, 0);
    await press(p, "taskdecide", { values: { [`${f}-how`]: " Its letterhead " } });
    assert.deepEqual(last(p, "taskdecide").body, { id: "TSK-7", outcome: "determined", authority: "Public Works", basis: "Its letterhead" });
  });

  test(`R75 (${where}): "I could not tell" requires what she tried and sends no issuer; a resolved item is gone on the next read`, async () => {
    let gone = false;
    const p = await open(at[where], planeOf([AUTH], { queue: () => ok({ items: gone ? [] : [AUTH], item_count: gone ? 0 : 1 }), taskdecide: () => { gone = true; return ok({ ok: true, id: "TSK-7", status: "resolved" }); } }), SCR);
    const f = button(p, "taskdecide").dataset.f;
    const noTried = await press(p, "taskdecide", { values: { [`${f}-who-1`]: true, [`${f}-issuer`]: "Ignored" } });
    assert.equal(p.byOp("taskdecide").length, 0, "I could not tell without what she tried sends nothing");
    assert.equal(beside(p, noTried), word("screen.queue.routed.auth.refused.basis"));
    await press(p, "taskdecide", { values: { [`${f}-tried`]: "The clerk's office" } });
    assert.deepEqual(last(p, "taskdecide").body, { id: "TSK-7", outcome: "undetermined_after_review", basis: "The clerk's office" });
    assert.equal(button(p, "taskdecide"), null, "the item leaves with the next read");
    assert.doesNotMatch(text(p), /overdue/i);
  });

  test(`R75 (${where}): an authority task is passed on with taskforward, and its refusals are drawn in their own words`, async () => {
    const p = await open(at[where], planeOf([AUTH], { taskforward: ok({ ok: true }), taskdecide: { status: 403, json: { ok: false, reason: "TASK_NOT_YOURS", code: "TASK_NOT_YOURS" } } }), SCR);
    const fwd = await press(p, "taskforward");
    assert.equal(p.byOp("taskforward").length, 0, "control: no member, nothing sent");
    assert.equal(beside(p, fwd), word(where === "home" ? "screen.home.fieldfirst" : "screen.queue.fieldfirst"));
    await press(p, "taskforward", { values: { [button(p, "taskforward").dataset.f + "-to"]: "@ana" } });
    assert.deepEqual(last(p, "taskforward").body, { id: "TSK-7", to: "ana" });
    const f = button(p, "taskdecide").dataset.f;
    const b = await press(p, "taskdecide", { values: { [`${f}-who-1`]: true, [`${f}-tried`]: "The clerk" } });
    assert.equal(beside(p, b), `${word("screen.queue.routed.auth.refused.yours1")} ${word("screen.queue.routed.auth.refused.yours2")}`);
  });

  test(`R75 (${where}): an endorsement owed names the person with who has agreed and who is awaited and sends adminendorse for her; an expertise item names the member and the label and sends expertiseconfirm`, async () => {
    const p = await open(at[where], planeOf([ENDORSE, EXPERT], { adminendorse: ok({ ok: true }), expertiseconfirm: ok({ ok: true }) }), SCR);
    assert.ok(text(p).includes(word("queue.endorsement-owed.summary", { who: "ana", have: "bo", awaiting: "cy, di" })));
    assert.ok(text(p).includes(word("queue.endorsement-owed.detail")));
    assert.ok(text(p).includes(word("queue.expertise-confirmation-owed.summary", { who: "ana", label: "tenant law" })));
    assert.ok(text(p).includes(word("queue.expertise-confirmation-owed.detail")));
    assert.ok(button(p, "adminendorse").textContent.startsWith(word(`act.adminendorse.label.${where}`)));
    await press(p, "adminendorse", { reason: "I know her work" });
    assert.deepEqual(Object.keys(last(p, "adminendorse").body).sort(), ["memberId", "reason"]);
    assert.equal(last(p, "adminendorse").body.memberId, "M-9");
    await press(p, "expertiseconfirm", { reason: "I have read her cases" });
    assert.equal(last(p, "expertiseconfirm").body.memberId, "M-9");
    assert.equal(last(p, "expertiseconfirm").body.label, "tenant law");
  });

  test(`R75 (${where}), C75: passing a task on to oneself is refused in words, nothing sent`, async () => {
    const p = await open(at[where], planeOf([AUTH], { taskforward: ok({ ok: true }) }), SCR);
    const self = await press(p, "taskforward", { values: { [button(p, "taskforward").dataset.f + "-to"]: "@rosa" } });
    assert.equal(p.byOp("taskforward").length, 0);
    assert.equal(beside(p, self), word("refusal.ALREADY_THEIRS"));
  });

  test(`R82 (${where}): endorsing the last administrator keeps the invitation the answer carries and shows it once, with the sentence that no email is sent`, async () => {
    const answer = { ok: true, memberId: "M-9", invite: "TOK/en+1", expires: "2026-11-01T00:00:00Z" };
    let reply = answer;
    const p = await open(at[where], planeOf([ENDORSE], { adminendorse: () => ok(reply) }), SCR);
    assert.ok(!text(p).includes("#invite="), "control: nothing is drawn before the act");
    await press(p, "adminendorse", { reason: "I know her work" });
    const link = "/#invite=" + encodeURIComponent(answer.invite);
    assert.equal(main(p).querySelectorAll("code").filter((c) => c.textContent.endsWith(link)).length, 1, "the link is drawn once");
    assert.ok(text(p).includes(word("screen.members.invite.noemail")), "with the sentence that the group's Civicsmith sends no email");
    assert.ok(text(p).includes(word("screen.members.invite.shown", { handle: "M-9", expires: dmy("2026-11-01") })), "and who it is for and when it expires");
    // the next endorsement answers with no invitation: the link is not drawn any more
    reply = { ok: true };
    await press(p, "adminendorse", { reason: "I know her work" });
    assert.equal(main(p).querySelectorAll("code").filter((c) => c.textContent.includes("#invite=")).length, 0, "control: an answer with no invite draws none, and the earlier one is gone");
    assert.ok(!text(p).includes(word("screen.members.invite.noemail")));
  });

  test(`R75 (${where}): nobody agreed or awaited is "no one yet"; with no handle in fills the member's id is drawn`, async () => {
    const none = { ...ENDORSE, fills: {}, basis: { have: [], awaiting: [] } };
    const p = await open(at[where], planeOf([none], { adminendorse: ok({ ok: true }) }), SCR);
    const nobody = word("queue.owed.nobody");
    assert.ok(text(p).includes(word("queue.endorsement-owed.summary", { who: "M-9", have: nobody, awaiting: nobody })));
  });

  test(`R75 (${where}): an owner vote names the person, the project and who has agreed and sends projectowneradd; a vote to remove an owner is the project's own, so it is worded and opened, not drawn as an act`, async () => {
    const p = await open(at[where], planeOf([OWNER("add"), OWNER("remove")], { projectowneradd: ok({ ok: true }) }), SCR);
    assert.ok(text(p).includes(word("queue.endorsement-owed.owner.summary.add", { who: "ben", project: "Pothole repairs", agreed: "mai", awaiting: word("queue.owed.nobody") })));
    assert.ok(text(p).includes(word("queue.endorsement-owed.owner.summary.remove", { who: "ben", project: "Pothole repairs", agreed: "mai", awaiting: word("queue.owed.nobody") })));
    assert.ok(text(p).includes(word("queue.endorsement-owed.owner.detail")));
    assert.ok(main(p).querySelector('a.cs-ref[href="/app/project/PROJ-1"]'), "the project is a reference");
    assert.deepEqual(ops(p).filter((o) => o.startsWith("projectowner")), ["projectowneradd"], "the removal is no act of this screen");
    await press(p, "projectowneradd", { reason: "She has done the work" });
    assert.deepEqual({ ...last(p, "projectowneradd").query, ...last(p, "projectowneradd").body, reason: undefined }, { op: "projectowneradd", projectId: "PROJ-1", handle: "ben", reason: undefined });
    assert.ok(main(p).querySelectorAll('a[data-nav][href="/app/project/PROJ-1"]').some((a) => a.textContent === word(where === "home" ? "screen.home.open" : "screen.queue.open")), "the removal opens the project");
  });
}

test("R75: control: an item of another kind is drawn as before: no form, no routed sentence, its own words and its act", async () => {
  const other = { id: "TSK-2", class: "OBLIGATION", kind: "check-requested", case: NONE, assignee: "rosa", summary: "Ana asked you to check a calculation", options: [], disposition: { instead: "taskresolve" } };
  for (const where of screens) {
    const p = await open(at[where], planeOf([other]), SCR);
    assert.ok(text(p).includes("Ana asked you to check a calculation"));
    assert.deepEqual(ops(p).filter((o) => ["taskdecide", "adminendorse", "projectowneradd", "expertiseconfirm"].includes(o)), []);
    assert.equal(main(p).querySelectorAll('fieldset[id$="-who"]').length, 0);
    assert.ok(!text(p).includes(word("screen.queue.routed.auth.item")));
  }
});
