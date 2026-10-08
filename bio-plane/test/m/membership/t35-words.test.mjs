/* T35 (T35-14; DEC-149, Bob's "S4: B"; K1779, K1785, K1934): the words members read (R112) and R108's statement as
   DEC-149 amended it. Each of the sweep's 11 rows (`build/plan/draft-T35-dec149-l1-l7.md`) is named by its string and
   reached at the interface; then every row this module holds, and every refusal a battery of its acts answers, is held
   to the rule: "your group's Civicsmith", or no name at all, and never "copy", "instance", "plane" or "server". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, listenerRefusal, notAnAdmin, noSuchProject, notAParticipant, MEMBERSHIP_CHECKS, MEMBER_ID_CHECKS,
         CUSTODIAL_CHECKS, PROJECT_AUTHORITY_CHECKS, PROJECT_VISIBILITY_CHECKS,
         CASE_AUTHORITY_CHECKS } from "../../../src/membership/index.mjs";

const CIVICSMITH = "your group's Civicsmith";
const FORBIDDEN = /\b(cop(y|ies)|instances?|planes?|servers?)\b/i;
const TABLES = { MEMBERSHIP_CHECKS, MEMBER_ID_CHECKS, CUSTODIAL_CHECKS, PROJECT_AUTHORITY_CHECKS,
                 PROJECT_VISIBILITY_CHECKS, CASE_AUTHORITY_CHECKS };

/* The member-facing strings of one answer (R112's list): its row's translation, its detail, message and remedy, and
   R108's statement. Codes, field names and ids are not member-facing. */
const facing = (r) => ["translation", "detail", "message", "remedy", "courtStatement", "alsoDo", "warning"]
  .filter((k) => r && typeof r[k] === "string").map((k) => [k, r[k]]);
const clean = (r, label) => {
  for (const [k, s] of facing(r)) assert.doesNotMatch(s, FORBIDDEN, `${label}: ${k} names the group's Civicsmith otherwise`);
};

test("R112 the sweep's rows C-102.11 (checks.mjs:72, :73) and C-102.12 (checks.mjs:78, :80): a part of your group's Civicsmith, a fault in how your group's Civicsmith was built", () => {
  const malformed = listenerRefusal([], "", null);
  assert.equal(malformed.check, "C-102.11");
  assert.equal(malformed.translation, "A part of your group's Civicsmith tried to register a listener without naming "
    + "itself or without a function to call, so nothing was registered. This is a fault in how your group's Civicsmith "
    + "was built, not in the record, and nothing in the record changed.");
  const declared = listenerRefusal([{ module: "credentials" }], "credentials", () => {});
  assert.equal(declared.check, "C-102.12");
  assert.equal(declared.translation, "A part of your group's Civicsmith tried to register a listener it had already "
    + "registered, or one that another part already holds, so the second registration was refused and the first still "
    + "stands. This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record "
    + "changed.");
  /* the same rows answer this module's own registrations (R79, R94, R95) */
  const w = world();
  assert.equal(w.m.registerClaimed("other", () => true).translation, declared.translation);
  assert.equal(w.m.onRevoked("x", null).translation, malformed.translation);
});

test("R112 the sweep's rows C-55.1 (checks.mjs:236) and index.mjs:2323: `admin` is the name your group's Civicsmith gives its founding administrator", async () => {
  const w = await world().group();
  const r = await w.m.memberAdd({ memberId: "admin", cover: "c", by: "admin" });
  assert.deepEqual([r.reason, r.check], ["MEMBER_ID_RESERVED", "C-55.1"]);
  assert.equal(r.translation, "That member id is reserved. `admin` is the name your group's Civicsmith gives its "
    + "founding administrator, and anything that checks whether someone is an administrator by name would read a member "
    + "enrolled as `admin` as the founder. Nothing was written. Choose a different id for this person.");
  assert.equal(r.detail, "'admin' names the founding administrator of your group's Civicsmith; no member may be "
    + "enrolled under it");
});

test("R112 the sweep's row C-96.11 (checks.mjs:318): the hosting account your group's Civicsmith runs in", async () => {
  const w = await world().group();
  const r = w.m.hostingAccessSet({ holders: "  ", by: "admin" });
  assert.deepEqual([r.reason, r.check], ["NO_HOLDERS", "C-96.11"]);
  assert.equal(r.translation, "This records who holds access to the hosting account your group's Civicsmith runs in, "
    + "and it named nobody. Write the people who hold that access. Nothing was written.");
});

test("R112 the sweep's row index.mjs:139: your group's Civicsmith takes who is asking from the signed-in session, at every act that refuses NOT_AN_ADMIN", async () => {
  const sentence = (act) => `${act} is an administrator's act (Membership Architecture v2 §4.9), and your group's `
    + "Civicsmith takes who is asking from the signed-in session rather than from the caller. This caller is not one of "
    + "the active administrators. Nothing was changed.";
  assert.equal(notAnAdmin("ann", "doing the thing").detail, sentence("doing the thing"));
  const w = await world().group("ann");
  assert.equal(w.m.hostingAccessSet({ holders: "x", by: "ann" }).detail,
    sentence("recording who holds hosting access (4.8)"));
  const caps = w.m.memberCaps({ memberId: "ann", capabilities: [], by: "ann" });
  assert.equal(caps.detail, sentence("setting a member's capabilities"));
});

test("R112 the sweep's row index.mjs:801: being a registered signer in your group's Civicsmith is not authority over a project", async () => {
  const w = await world().group("iris", "kit");
  w.project("PROJ-1");
  w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "iris" });
  const r = w.m.caseAuthority({ project: "PROJ-1", deliveredBy: "founder", signer: "kit", act: "publish",
                                subject: "CASE-1" });
  assert.equal(r.check, "C-57.1");
  assert.equal(r.detail, "CASE-1 is PROJ-1's production, and publishing is an act of an OWNER of the publishing project "
    + "(DEC-72 clause 5). The signature is kit's, who is not an owner of it. Being a registered signer in your group's "
    + "Civicsmith is not authority over a project. Nothing was committed.");
});

test("R112 the sweep's row index.mjs:2246: the founder is not removed, because your group's Civicsmith runs in somebody's hosting account", async () => {
  const w = await world().group();
  const r = w.m.adminRemove({ memberId: "admin", by: "second", reason: "r" });
  assert.equal(r.reason, "ROOT_OF_TRUST");
  assert.equal(r.detail, "the founding administrator holds ADMIN_TOKEN and cannot be removed from inside the "
    + "application. Whoever can set ADMIN_TOKEN can take the group over, and there is no arrangement in which nobody "
    + "holds that power, because your group's Civicsmith runs in somebody's hosting account. The remedy is at the "
    + "hosting account, not here (section 4.6).");
});

test("R112 R108 the sweep's row index.mjs:2963: the court statement says \"Your group's Civicsmith\", exactly as DEC-149 amended DEC-136", async () => {
  const COURT = "Your group's Civicsmith keeps this from the public and the people the group looks into. A court order "
    + "your group can't defeat could still require it to be shown. Write accordingly.";
  assert.equal(Membership.COURT_STATEMENT, COURT);
  const w = await world().group();
  w.m.courtNoticeSet({ choice: "tell", by: "admin" });
  const a = await w.m.memberAdd({ memberId: "ann", cover: "c", by: "admin" });
  const e = await w.m.enroll({ invite: a.invite, handle: "ann", password: "ann-passphrase-x" });
  assert.equal(e.courtStatement, COURT);
  assert.doesNotMatch(e.courtStatement, /\bcopy\b/i);
});

test("R112 every row this module holds translates without calling the group's Civicsmith a copy, an instance, a plane or a server", () => {
  let n = 0;
  for (const [table, rows] of Object.entries(TABLES))
    for (const [code, row] of Object.entries(rows)) {
      n++;
      assert.equal(typeof row.translation, "string", `${table}.${code}`);
      assert.doesNotMatch(row.translation, FORBIDDEN, `${table}.${code} (${row.check})`);
    }
  /* T38 (N783): 43 rows since C-56.5, C-33.28, C-70.4 and the nine C-95 rows went to project-roster (whose own words
     test holds them) and C-96.47 came. */
  assert.ok(n >= 43, `every row read (${n})`);
  /* the rows the sweep moved now name it */
  for (const row of [MEMBERSHIP_CHECKS.LISTENER_MALFORMED, MEMBERSHIP_CHECKS.LISTENER_DECLARED,
                     MEMBER_ID_CHECKS.MEMBER_ID_RESERVED, CUSTODIAL_CHECKS.NO_HOLDERS])
    assert.ok(row.translation.includes(CIVICSMITH), row.check);
});

test("R112 every refusal and answer a battery of this module's acts gives (detail, message, remedy, translation, the statement) is held to the rule", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-1"); w.project("PROJ-D"); w.bundle("INFO-1");
  w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "ann" });
  w.m.projectClaimOwner({ projectId: "PROJ-D", memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  w.m.projectInvite({ projectId: "PROJ-1", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.courtNoticeSet({ choice: "tell", by: "admin" });
  const answers = [
    ["listenerRefusal malformed", listenerRefusal(null, "", 1)],
    ["listenerRefusal declared", listenerRefusal({ module: "a" }, "b", () => {})],
    ["listenerRefusal unreadable", listenerRefusal(new Proxy([], { get() { throw new Error("unreadable"); } }), "m",
                                                   () => {})],
    ["notAnAdmin remedy", notAnAdmin("ann", "x", { remedy: "Ask an administrator." })],
    ["noSuchProject", noSuchProject("P")],
    ["notAParticipant", notAParticipant("P", "ann")],
    ["adminResign founder", w.m.adminResign({ by: "admin" })],
    ["adminResign member", w.m.adminResign({ by: "ann" })],
    ["adminRemove founder", w.m.adminRemove({ memberId: "admin", by: "second", reason: "r" })],
    ["adminRemove target", w.m.adminRemove({ memberId: "ann", by: "second", reason: "r" })],
    ["adminRemove self", w.m.adminRemove({ memberId: "second", by: "second", reason: "r" })],
    ["adminRemove at two", w.m.adminRemove({ memberId: "second", by: "admin", reason: "r" })],
    ["adminRemove no reason", w.m.adminRemove({ memberId: "second", by: "admin", reason: "" })],
    ["memberAdd bad id", await w.m.memberAdd({ memberId: "A", cover: "c", by: "admin" })],
    ["memberAdd reserved", await w.m.memberAdd({ memberId: "admin", cover: "c", by: "admin" })],
    ["memberAdd no cover", await w.m.memberAdd({ memberId: "zed", by: "admin" })],
    ["memberAdd exists", await w.m.memberAdd({ memberId: "ann", cover: "c", by: "admin" })],
    ["memberAdd expertise", await w.m.memberAdd({ memberId: "zed", cover: "c", expertise: ["CPA"], by: "admin" })],
    ["memberAdd expiry", await w.m.memberAdd({ memberId: "zed", cover: "c", expiresInDays: 99, by: "admin" })],
    ["memberAdd not admin", await w.m.memberAdd({ memberId: "zed", cover: "c", by: "ann" })],
    ["memberAdd consensus", await w.m.memberAdd({ memberId: "adm3", cover: "c", role: "admin", by: "admin" })],
    ["memberSet vote", w.m.memberSet({ memberId: "second", status: "revoked", by: "admin" })],
    ["memberCaps grant", w.m.memberCaps({ memberId: "second", capabilities: ["publish"], by: "admin" })],
    ["adminEndorse not proposed", await w.m.adminEndorse({ memberId: "ann", by: "admin" })],
    ["hostingAccessSet empty", w.m.hostingAccessSet({ holders: "", by: "admin" })],
    ["memberPairingSet", w.m.memberPairingSet({ memberId: "ann", published: true, by: "bob" })],
    ["enroll miss", await w.m.enroll({ invite: "0".repeat(32), handle: "h", password: "p".repeat(12) })],
    ["inviteLook miss", await w.m.inviteLook({ invite: "nope" })],
    ["expertiseDeclare no label", w.m.expertiseDeclare({ memberId: "ann", label: " " })],
    ["expertiseConfirm not declared", w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" })],
    ["expertiseConfirm not admin", w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "bob" })],
    ["checkAddressees no label", w.m.checkAddressees({ target: "INFO-1", label: "" })],
    ["projectAuthority owner", w.m.projectAuthority("PROJ-1", V("bob"), "owner", "revising")],
    ["projectAuthority joined", w.m.projectAuthority("PROJ-1", V("bob"), "joined", "revising")],
    ["caseAuthority", w.m.caseAuthority({ project: "PROJ-1", deliveredBy: "founder", signer: "bob", act: "publish",
                                          subject: "CASE-1" })],
    ["existence", w.m.projectJoin({ projectId: "PROJ-D", by: "cal", viewer: V("cal") })],
    ["visibility not owner", w.m.projectVisibilitySet({ projectId: "PROJ-1", setting: "hidden", by: "bob",
                                                        viewer: V("bob") })],
    ["visibility setting", w.m.projectVisibilitySet({ projectId: "PROJ-1", setting: "open", by: "ann", viewer: V("ann") })],
    ["join not invited", w.m.projectJoin({ projectId: "PROJ-1", by: "cal" })],
    ["leave last owner", w.m.projectLeave({ projectId: "PROJ-1", by: "ann" })],
    ["leave not a participant", w.m.projectLeave({ projectId: "PROJ-1", by: "cal" })],
    ["invite not owner", w.m.projectInvite({ projectId: "PROJ-1", handle: "cal", by: "bob" })],
    ["remove not owner", w.m.projectRemove({ projectId: "PROJ-1", handle: "cal", by: "bob" })],
    ["remove target", w.m.projectRemove({ projectId: "PROJ-1", handle: "cal", by: "ann" })],
    ["remove owner", w.m.projectRemove({ projectId: "PROJ-1", handle: "ann", by: "ann" })],
    ["inviteWithdraw unused", w.m.inviteWithdraw({ memberId: "ann", by: "admin" })],
    ["websiteKeyCreate cap", w.m.websiteKeyCreate({ by: "admin" })],
    ["websiteKeySet none", w.m.websiteKeySet({ dailyCap: 3, by: "admin" })],
    ["websiteKeyCreate ok", w.m.websiteKeyCreate({ dailyCap: 1, by: "admin" })],
    ["websiteKeyCreate exists", w.m.websiteKeyCreate({ dailyCap: 1, by: "admin" })],
    ["websiteInvite unknown", await w.m.websiteInvite({ key: "k", cover: "c" })],
    ["joinLinkSet off", w.m.joinLinkSet({ dailyCap: 1, by: "admin" })],
    ["joinLinkEnable bad caps", w.m.joinLinkEnable({ capabilities: ["administer"], dailyCap: 1, by: "admin" })],
    ["joinLinkInvite unknown", await w.m.joinLinkInvite({ link: "l", cover: "c" })],
    ["courtNoticeSet unknown", w.m.courtNoticeSet({ choice: "maybe", by: "admin" })],
    ["groupDescriptionSet kind", w.m.groupDescriptionSet({ kinds: ["club"], by: "admin" })],
    ["groupDescriptionSet other", w.m.groupDescriptionSet({ kinds: ["other"], by: "admin" })],
    ["groupDescriptionSet long", w.m.groupDescriptionSet({ kinds: [], focus: "x".repeat(1001), by: "admin" })],
    ["groupDescriptionSet visibility", w.m.groupDescriptionSet({ kinds: [], visibility: "all", by: "admin" })],
  ];
  /* the doors' daily caps, and a website key's warning */
  const key = w.m.websiteKeyCreate({ dailyCap: 1, by: "admin" });
  answers.push(["websiteKeyCreate again", key]);
  const link = w.m.joinLinkEnable({ dailyCap: 1, by: "admin" });
  answers.push(["joinLinkEnable", link], ["joinLinkEnable on", w.m.joinLinkEnable({ dailyCap: 1, by: "admin" })]);
  answers.push(["joinLinkInvite", await w.m.joinLinkInvite({ link: link.link, cover: "c" })],
               ["joinLinkInvite cap", await w.m.joinLinkInvite({ link: link.link, cover: "c" })]);
  const invited = await w.m.memberAdd({ memberId: "dee", cover: "c", by: "admin" });
  answers.push(["enroll told", await w.m.enroll({ invite: invited.invite, handle: "dee", password: "dee-passphrase-x" })]);
  /* the enrolment whose password is not recorded (C-96.18) */
  const bare = world({ omit: ["setter"] });
  await bare.claim();
  const lone = await bare.m.memberAdd({ memberId: "eve", cover: "c", by: "admin" });
  answers.push(["enroll not recorded", await bare.m.enroll({ invite: lone.invite, handle: "eve",
                                                             password: "eve-passphrase-x" })]);
  let refusals = 0, texts = 0;
  for (const [label, r] of answers) {
    assert.ok(r && typeof r === "object", label);
    if (r.ok === false) refusals++;
    texts += facing(r).length;
    clean(r, label);
  }
  /* T38 (N783): the moved acts' refusals are project-roster's battery now. */
  assert.ok(refusals >= 62 && texts >= 114, `the battery reached ${refusals} refusals and ${texts} texts`);
});
