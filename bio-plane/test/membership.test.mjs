/* NEGATIVE CONTROL: (run 2026-07-31) drop the +1 from the removal majority in Store.adminMath (`Math.floor(n/2)` instead of `Math.floor(n/2)+1`) so a plurality ejects -> 15 assertions fail (one vote now ejects; the have/need tally; "no removal carried by one vote") then the suite throws; restored, 97 pass. */
/* The membership model's member half: handles, capabilities, and the
 * administrator arithmetic of Section 4.
 *
 * `architecture/BIO_Membership_Architecture_v1.md` is the design and nothing in
 * it is undecided. This suite asserts the parts that are cheap to get wrong and
 * expensive to retrofit, which is most of Section 4.
 *
 * Negative-control detail: drop the +1 from the removal majority in Store.adminMath (`Math.floor(n/2)` instead of `Math.floor(n/2)+1`) so a plurality ejects -> 15 assertions fail (one vote now ejects; the have/need tally; "no removal carried by one vote") then the suite throws; restored, 97 pass.
 *
 * THE ARITHMETIC IS THE POINT. Removal takes a majority of ALL administrators,
 * counting the target in the denominator but not letting them vote, and ties do
 * not eject. That single rule is what makes removal impossible at two without a
 * special case, demands unanimity while the group is small, and loosens as it
 * grows. Addition above the second requires the CONSENSUS of every existing
 * administrator, and that is the load-bearing half: without it a captured
 * administrator recruits confederates and manufactures the majority that ejects
 * the honest ones. The table from Section 4.7 is asserted directly below.
 *
 * COVER AND HANDLE ARE DIFFERENT THINGS ASSIGNED BY DIFFERENT PARTIES. A cover
 * is what an administrator calls someone in the roster; a handle is what the
 * member chooses and what the RECORD shows. Only administrators see them
 * together. A handle is unique across the instance, because a roster where two
 * people can answer to one name defeats the purpose of having one.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC, "utf8"),
  modulesRoot: "/", scriptPath: SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

const add = (b) => call("/memberadd", b);
const enroll = (b) => call("/enroll", b);
const list = async () => (await call("/memberlist")).members;
const of = async (id) => (await list()).find((m) => m.member_id === id) || null;

/* Bring a member all the way to active, which is the state every governance
   rule below is expressed over. */
const join = async (id, cover, role, handle, caps) => {
  const a = await add({ memberId: id, cover, role, capabilities: caps });
  if (!a.ok) return a;
  return enroll({ invite: a.invite, handle, password: `${id}-passphrase-x` });
};

/* ------------------------------------------------------------------ suite */

console.log("\n--- a group of one: the apparatus stays out of the way (4.1) ---");
{
  /* The FOUNDING administrator has no members row and never gets one: they
     claimed the instance by spending ADMIN_TOKEN. That is exactly 4.1, the solo
     participant IS the administrator, and it is also 4.6, they are the root of
     trust and the membership model runs beneath them. */
  await call("/setpassword", { role: "admin", password: "founder-passphrase-1" });
  t("a claimed instance already has one administrator",
    (await call("/adminarith")).live.administrators, 1);
  t("and no roster to speak of yet", (await list()).length, 0);
}

console.log("\n--- the second member must be an administrator (4.2, 4.3) ---");
{
  const r = await add({ memberId: "early", cover: "too early", role: "member" });
  t("an ordinary member is refused while one administrator exists", r.reason, "ADMINS_FIRST");
  t("with the rule stated", /administrator/i.test(r.detail || ""), true);
  const s = await join("second", "the second", "admin", "second", ["contribute"]);
  t("a second administrator is added unilaterally by the founder (4.7)", s.ok, true);
  t("the census now counts two", (await call("/adminarith")).live.administrators, 2);
  const now = await add({ memberId: "ordinary", cover: "an ordinary member", role: "member" });
  t("and ordinary members are possible once two exist", now.ok, true);
}

console.log("\n--- cover and handle are different things (3) ---");
{
  const m = await of("second");
  t("the roster carries the administrator's cover", m.cover, "the second");
  t("and the member's own handle", m.handle, "second");
  const a = await add({ memberId: "dup", cover: "wants a taken handle", role: "member" });
  const e = await enroll({ invite: a.invite, handle: "second", password: "dup-passphrase-x" });
  t("a handle already in use is refused", e.reason, "HANDLE_TAKEN");
  t("a handle is required at enrolment", (await enroll({
    invite: a.invite, password: "dup-passphrase-x" })).reason, "NO_HANDLE");
  const ok = await enroll({ invite: a.invite, handle: "dup-handle", password: "dup-passphrase-x" });
  t("a free handle is accepted", ok.ok, true);
  t("the invite is spent by the successful enrolment", (await enroll({
    invite: a.invite, handle: "another", password: "dup-passphrase-x" })).reason, "NO_SUCH_INVITATION");
}

console.log("\n--- capabilities are granted, and absent means absent (5) ---");
{
  const m = await of("ordinary");
  t("an invited member carries the capabilities the administrator set", Array.isArray(m.capabilities), true);
  const r = await call("/membercaps", { memberId: "ordinary", capabilities: ["contribute", "publish"] });
  t("an administrator edits them afterwards", r.ok, true);
  t("and they are what was set", (await of("ordinary")).capabilities, ["contribute", "publish"]);
  t("an unknown capability is refused",
    (await call("/membercaps", { memberId: "ordinary", capabilities: ["contribute", "fly"] })).reason, "BAD_CAPABILITY");
  t("administer cannot be granted this way, only by the Section 4 process",
    (await call("/membercaps", { memberId: "ordinary", capabilities: ["administer"] })).reason, "NOT_A_CAPABILITY_GRANT");
}

console.log("\n--- administrator status cannot be stripped (4.4) ---");
{
  t("no administrator may demote another",
    (await call("/membercaps", { memberId: "second", capabilities: ["contribute"] })).reason, "NOT_A_CAPABILITY_GRANT");
  t("nor revoke them directly",
    (await call("/memberset", { memberId: "second", status: "revoked" })).reason, "ADMIN_REQUIRES_VOTE");
  t("an ordinary member can still be revoked directly",
    (await call("/memberset", { memberId: "dup", status: "revoked" })).ok, true);
  await call("/memberset", { memberId: "dup", status: "active" });
}

console.log("\n--- adding an administrator past the second needs consensus (4.7) ---");
{
  const r = await add({ memberId: "third", cover: "the third", role: "admin", by: "admin" });
  t("the invitation is not issued outright", r.ok, false);
  t("it opens a proposal instead", r.reason, "CONSENSUS_REQUIRED");
  t("naming who has yet to endorse", r.awaiting, ["second"]);
  t("and no invite was handed out", r.invite, undefined);

  t("an endorsement from a non-administrator is refused",
    (await call("/adminendorse", { memberId: "third", by: "ordinary" })).reason, "NOT_AN_ADMIN");
  const e = await call("/adminendorse", { memberId: "third", by: "second" });
  t("the last endorsement issues the invitation", e.ok, true);
  t("and hands over the invite exactly once", typeof e.invite, "string");
  t("the proposal is now a normal pending invitation", (await of("third")).status, "invited");

  const done = await enroll({ invite: e.invite, handle: "third", password: "third-passphrase-x" });
  t("the third administrator enrols", done.ok, true);
  t("and is an administrator", (await of("third")).role, "admin");
}

console.log("\n--- removal: the Section 4.7 table, asserted directly ---");
{
  /* | admins | votes needed | eligible voters | effect                  |
     |      2 |            2 |               1 | impossible, correctly   |
     |      3 |            2 |               2 | unanimity of the others |
     |      4 |            3 |               3 | unanimity of the others |
     |      5 |            3 |               4 | three of four           |
     |      7 |            4 |               6 | four of six             |          */
  const arith = await call("/adminarith");
  for (const [n, need, eligible] of [[2, 2, 1], [3, 2, 2], [4, 3, 3], [5, 3, 4], [7, 4, 6]]) {
    const row = arith.table.find((x) => x.administrators === n);
    t(`${n} administrators need ${need} votes`, row.votesNeeded, need);
    t(`  with ${eligible} eligible to cast them`, row.eligibleVoters, eligible);
    t(`  so removal is ${need > eligible ? "impossible" : "possible"}`, row.possible, need <= eligible);
  }
}

console.log("\n--- removal at three administrators takes both of the others ---");
{
  const one = await call("/adminremove", { memberId: "third", by: "admin", reason: "unreachable for months" });
  t("one vote does not eject", one.ok, false);
  t("it reports the tally", { have: one.have, need: one.need }, { have: 1, need: 2 });
  t("the target is still an administrator", (await of("third")).status, "active");

  t("the target may not vote on their own removal",
    (await call("/adminremove", { memberId: "third", by: "third", reason: "no" })).reason, "TARGET_CANNOT_VOTE");
  t("nor may a non-administrator",
    (await call("/adminremove", { memberId: "third", by: "ordinary", reason: "no" })).reason, "NOT_AN_ADMIN");
  t("and one administrator cannot vote twice",
    (await call("/adminremove", { memberId: "third", by: "admin", reason: "again" })).reason, "ALREADY_VOTED");

  const two = await call("/adminremove", { memberId: "third", by: "second", reason: "unreachable for months" });
  t("the second vote ejects", two.ok, true);
  t("the target is revoked", (await of("third")).status, "revoked");
  t("the deciding administrators are recorded", two.deciders.sort(), ["admin", "second"]);
  t("and so is a reason", two.reasons.length > 0, true);
}

console.log("\n--- removal is impossible at two, which is the point (4.7) ---");
{
  /* The founder plus `second`. The census counts the founding administrator,
     who has no roster row, so it is read from the arithmetic rather than by
     counting members. */
  t("two administrators remain", (await call("/adminarith")).live.administrators, 2);
  const r = await call("/adminremove", { memberId: "second", by: "admin", reason: "dispute" });
  t("the only other administrator cannot eject them", r.ok, false);
  t("and the refusal explains the arithmetic rather than just failing", r.reason, "IMPOSSIBLE_AT_TWO");
  t("the target is untouched", (await of("second")).status, "active");
}

console.log("\n--- a lone captured administrator can never eject anyone ---");
{
  /* The property the whole design exists for, stated as a test: at every group
     size, one administrator acting alone is never enough. */
  const arith = await call("/adminarith");
  /* The property is that no removal can be CARRIED by a single vote, which is
     not the same as "no size needs only one vote": at one administrator the
     threshold is one but nobody is eligible, so it is already impossible. The
     first version of this assertion conflated the two and failed on a row where
     the rule was working. */
  const lone = arith.table.filter((x) => x.possible && x.votesNeeded <= 1);
  t("no removal can ever be carried by one vote", lone, []);
  t("and at one administrator removal is impossible for want of a voter",
    arith.table.find((x) => x.administrators === 1).possible, false);
}

console.log("\n--- burner-URL invitations: the URL IS the credential (6) ---");
{
  const a = await add({ memberId: "burner-one", cover: "the burner test", role: "member",
                        capabilities: ["contribute"] });
  t("an invitation issues a token", typeof a.invite, "string");
  /* The whole point. A leaked or archived link must reveal neither the group nor
     the invitee, and the previous scheme put `<memberId>:<code>` in the URL, so
     anyone who saw the link learned who had been invited. */
  t("the token does not contain the member id", a.invite.includes("burner-one"), false);
  t("nor anything else recognisable", /[:@]/.test(a.invite), false);

  const look = await call("/invitelook", { invite: a.invite });
  t("a live token resolves", look.ok, true);
  t("to the cover the administrator set", look.cover, "the burner test");
  t("and the capabilities already attached", look.capabilities, ["contribute"]);
  t("but NOT to the member id, which is the group's business", look.memberId, undefined);

  const e = await enroll({ invite: a.invite, handle: "burner-handle", password: "burner-passphrase-x" });
  t("enrolment takes the token, a handle and a password, and no member id", e.ok, true);
  t("the handle is the member's own", e.handle, "burner-handle");
  t("and the roster now shows it", (await of("burner-one")).handle, "burner-handle");
}

console.log("\n--- and afterwards the link is inert and says nothing (6) ---");
{
  const a = await add({ memberId: "burner-two", cover: "spent test", role: "member" });
  await enroll({ invite: a.invite, handle: "spent-handle", password: "spent-passphrase-x" });

  const spent = await call("/invitelook", { invite: a.invite });
  const never = await call("/invitelook", { invite: "0".repeat(32) });
  t("a spent token resolves to nothing", spent.ok, false);
  t("a token that never existed resolves to nothing", never.ok, false);
  /* INDISTINGUISHABLE, and that is the security property rather than tidiness:
     a response that said "this invitation was used" would confirm to whoever
     found the archived link that it had once addressed somebody real. */
  t("and the two answers are byte-identical", JSON.stringify(spent), JSON.stringify(never));
  t("neither names a member", JSON.stringify(spent).includes("burner-two"), false);
  t("nor a cover", JSON.stringify(spent).includes("spent test"), false);

  t("a spent token cannot enrol again",
    (await enroll({ invite: a.invite, handle: "again", password: "again-passphrase-x" })).reason,
    "NO_SUCH_INVITATION");
  t("and a made-up token is refused the same way",
    (await enroll({ invite: "f".repeat(32), handle: "nope", password: "nope-passphrase-x" })).reason,
    "NO_SUCH_INVITATION");
}

console.log("\n--- the invitee cannot set what the administrator set (6) ---");
{
  const a = await add({ memberId: "burner-three", cover: "admin chose this", role: "member",
                        capabilities: ["contribute"] });
  const e = await enroll({ invite: a.invite, handle: "three-handle", password: "three-passphrase-x",
                           cover: "I choose my own", capabilities: ["publish"], role: "admin" });
  t("enrolment succeeds", e.ok, true);
  const m = await of("burner-three");
  t("the cover is still the administrator's", m.cover, "admin chose this");
  t("the capabilities are still the administrator's", m.capabilities, ["contribute"]);
  t("and the invitee did not make themselves an administrator", m.role, "member");
}

console.log("\n--- negative controls ---");
{
  t("the arithmetic helper can say impossible", (await call("/adminarith")).table.some((x) => !x.possible), true);
  t("and can say possible", (await call("/adminarith")).table.some((x) => x.possible), true);
  t("an unknown member is still refused", (await call("/adminremove", { memberId: "ghost", by: "admin", reason: "x" })).reason, "NO_SUCH_MEMBER");
  t("and the founding administrator cannot be removed from inside the app (4.6)",
    (await call("/adminremove", { memberId: "admin", by: "second", reason: "x" })).reason, "ROOT_OF_TRUST");
}

console.log("\n--- 4.9: reactivation must not restore administrator status ---");
/* A 4.7 removal sets status='revoked' and leaves role='admin' on the row, so
   before this rule any administrator could call memberset(active) and put an
   ejected administrator straight back, role intact. That undoes a group vote
   with one call, which is exactly what 4.7's consensus-on-addition exists to
   prevent. v2 4.9: reactivating someone as an ordinary MEMBER is a single
   administrator's call; restoring their administrator status is not. */
{
  /* Discover the administrator set rather than guessing it. An earlier version
     hardcoded the endorsers and silently built no administrator at all, so the
     assertions ran against a member who did not exist. The rule was working; the
     fixture was not, which is a note this suite already carries once. */
  const admins = async () => ["admin", ...(await call("/memberlist")).members
    .filter((m) => m.role === "admin" && m.status === "active").map((m) => m.member_id)];
  for (const id of ["ax", "bx", "cx"]) {
    const a = await call("/memberadd", { memberId: id, cover: `cover ${id}`, role: "admin" });
    let invite = a.invite;
    if (!invite) for (const v of await admins()) {
      const e = await call("/adminendorse", { memberId: id, by: v });
      if (e.invite) invite = e.invite;
    }
    t(`${id} received an invitation`, typeof invite, "string");
    await call("/enroll", { invite, handle: id, password: `${id}-passphrase-1` });
  }
  const before = (await call("/memberlist")).members.find((m) => m.member_id === "cx");
  t("cx is an active administrator", [before.role, before.status], ["admin", "active"]);
  for (const v of (await admins()).filter((a) => a !== "cx"))
    await call("/adminremove", { memberId: "cx", by: v, reason: "test" });
  const gone = (await call("/memberlist")).members.find((m) => m.member_id === "cx");
  t("the vote revokes them", gone.status, "revoked");
  t("and the row still SAYS admin, which is the trap", gone.role, "admin");

  const back = await call("/memberset", { memberId: "cx", status: "active" });
  t("reactivation succeeds, because a person is not erased by a vote", back.ok, true);
  const now = (await call("/memberlist")).members.find((m) => m.member_id === "cx");
  t("they are active again", now.status, "active");
  t("but as an ORDINARY MEMBER, not an administrator", now.role, "member");
  t("and the response says so rather than leaving it to be discovered", back.demoted, true);
}

await mf.dispose();
console.log(`\nmembership: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
