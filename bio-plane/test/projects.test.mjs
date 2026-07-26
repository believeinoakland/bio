/* Project participation and the three visibility positions.
 * Membership Architecture section 7, and D-15.
 *
 * THE LEAK THIS CLOSES. `cites` lives on the citing object (State Rules 5.2),
 * so a Project's interest in a piece of Information is a property of the
 * Project and the Information carries no record of who cites it. The one place
 * the interest graph could escape is the derived index, and 7.9 is explicit
 * that filtering it is an implementation obligation rather than a tradeoff: an
 * unfiltered index leaks to every member which projects are interested in which
 * evidence, which for a group under pressure is the tactical picture.
 *
 * THE EVIDENCE CORPUS STAYS SHARED, and that is not an oversight. Information
 * and Problems remain visible to the group generally, because compartmenting
 * evidence would fracture the record and stop a member on one project seeing
 * what another has already gathered. Only the group's THINKING is scoped.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
let pass = 0, fail = 0;
const t = (l, g, w) => {
  const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `\n         want ${JSON.stringify(w)}\n         got  ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++;
};
const mf = new Miniflare({
  modules: true, script: readFileSync(SRC, "utf8"), modulesRoot: "/", scriptPath: SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, b) => (await (await mf.dispatchFetch("http://x" + p,
  b ? { method: "POST", body: JSON.stringify(b) } : {})).json()).result;

const md = (id, type) => `---\nid: ${id}\nobject_type: ${type}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nSecret plan.\n`;
const mk = (id, type) => call("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text: md(id, type), bytes: md(id, type).length, sha256: sha(md(id, type)) }],
  meta: { object_type: type, group: "believe-in-oakland", title: id,
          current_state: type === "project" ? "forming" : "collected",
          created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });

/* Two members, one project, one shared piece of evidence. */
await call("/setpassword", { role: "admin", password: "founder-passphrase-1" });
/* 4.2 and 4.3 force the first two members of a group to be administrators, so
   the OWNER in this fixture must be an ordinary member added after them. The
   first version made alice both owner and administrator, which quietly defeated
   the 7.7 assertion: ADMIN_ONLY cannot fire against someone who is an admin. */
/* alice is the second member and must therefore be an administrator (4.2).
   A THIRD administrator would need the consensus of both existing ones (4.7),
   so the administrator acting in the 7.7 assertions below is the FOUNDER, who
   holds ADMIN_TOKEN, has no roster row, and is named `admin`. The first version
   of this fixture tried to add `bob` as a third administrator, got
   CONSENSUS_REQUIRED and no invite, and then asserted against a member who did
   not exist. The rule was working; the fixture was not. */
for (const [id, role] of [["alice", "admin"], ["carol", "member"], ["dave", "member"]]) {
  const a = await call("/memberadd", { memberId: id, cover: `cover ${id}`, role });
  await call("/enroll", { invite: a.invite, handle: id, password: `${id}-passphrase-x` });
}
await mk("INFO-2026-0001-shared", "information");
await mk("PROB-2026-0001-shared", "problem");
await mk("PROJ-2026-0001-secret", "project");
await call("/projectclaimowner", { projectId: "PROJ-2026-0001-secret", memberId: "carol" });

const visible = async (who) =>
  (await call(`/search?q=&viewer=${encodeURIComponent(who)}&owner=${encodeURIComponent(who)}&facets=none&limit=50`))
    .hits.map((h) => h.bundle_id).sort();

console.log("\n--- an uninvited member does not see the project at all (7.9) ---");
{
  const seen = await visible("member:dave");
  t("dave sees the shared evidence", seen.includes("INFO-2026-0001-shared"), true);
  t("and the shared problem", seen.includes("PROB-2026-0001-shared"), true);
  t("but not the project he was never invited to", seen.includes("PROJ-2026-0001-secret"), false);
  t("not its existence in any form", seen, ["INFO-2026-0001-shared", "PROB-2026-0001-shared"]);
}

console.log("\n--- the owner sees it, and an administrator sees everything ---");
{
  t("carol, the owner, sees her project", (await visible("member:carol")).includes("PROJ-2026-0001-secret"), true);
  /* bob is an administrator and was never invited: 7.3 says administrators see
     all projects. */
  t("alice, an administrator, sees it uninvited", (await visible("member:alice")).includes("PROJ-2026-0001-secret"), true);
  t("a machine credential is not filtered", (await visible("class:member")).includes("PROJ-2026-0001-secret"), true);
}

console.log("\n--- invitation makes it visible, and 7.4 joining needs no ceremony ---");
{
  const bad = await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=dave&by=dave`);
  t("a non-owner cannot invite", bad.reason, "NOT_THE_OWNER");
  const inv = await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`);
  t("the owner invites by handle", inv.state, "invited");
  t("and now dave can see the project exists", (await visible("member:dave")).includes("PROJ-2026-0001-secret"), true);
  t("an unknown handle is refused", (await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=ghost&by=carol`)).reason, "NO_SUCH_HANDLE");
  t("joining is just joining", (await call(`/projectjoin?projectId=PROJ-2026-0001-secret&by=dave`)).state, "joined");
}

console.log("\n--- 7.6: unchecking the box is a REQUEST, and removes nobody ---");
{
  const lv = await call(`/projectleave?projectId=PROJ-2026-0001-secret&by=dave&comment=${encodeURIComponent("too busy")}`);
  t("leaving is recorded as a request", lv.state, "leaving");
  t("with the member's comment", lv.comment, "too busy");
  t("and they are still a participant", (await visible("member:dave")).includes("PROJ-2026-0001-secret"), true);
}

console.log("\n--- 7.7 REVERSED in v2: only an OWNER removes, and administrators never do ---");
/* These four assertions said the OPPOSITE until 2026-07-26, and said it
   deliberately: v1.4 section 7.7 gave removal to administrators and denied it to
   owners, reasoning that authority over people belongs to the custodial role.
   Membership Architecture v2 reverses it. Corrected rather than exempted, per
   standing lesson 3: a rule that breaks old tests is doing its job. */
{
  t("an administrator cannot remove a participant",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=alice`)).reason, "NOT_THE_OWNER");
  t("nor can the founder, who holds ADMIN_TOKEN and is above the membership model everywhere else",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=admin`)).reason, "NOT_THE_OWNER");
  const r = await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`);
  t("the owner can", r.removed, true);
  t("and the project vanishes for him again", (await visible("member:dave")).includes("PROJ-2026-0001-secret"), false);
  t("an owner is not removed by this action; ownership moves by 7.10",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=carol&by=carol`)).reason, "OWNER");
}

console.log("\n--- 7.2 in v2: only owners invite, administrators do not ---");
/* The other half of the same reversal, and it had no assertion at all before:
   projectInvite carried `|| this.#isAdminMember(by)` and nothing exercised it,
   so the bypass could have been removed or kept without any test noticing. */
{
  t("an administrator cannot invite to a project",
    (await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=dave&by=alice`)).reason, "NOT_THE_OWNER");
  t("the owner still can",
    (await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).state, "invited");
  /* Put the fixture back. The 7.8 assertions below need dave OUT of this
     project, and the first version of this block left him in, which failed four
     assertions two sections later rather than here. A suite that shares one
     fixture across sections owes the next section the state it was handed. */
  t("and the fixture is restored for what follows",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).removed, true);
}

console.log("\n--- 7.10: ownership is a SET, and its arithmetic diverges from 4.7 at two ---");
{
  /* The table is computed, not transcribed, so the code and the document cannot
     drift. Asserted row by row against Membership Architecture v2 section 7.10. */
  const a = await call(`/projectownerarith`);
  const row = (n) => a.table.find((r) => r.owners === n);
  t("one owner: not removable, because one is the floor", [row(1).votesNeeded, row(1).possible], [0, false]);
  t("TWO owners: both agree, and the target IS one of them",
    [row(2).votesNeeded, row(2).eligibleVoters, row(2).targetMayVote], [2, 2, true]);
  t("three: unanimity of the others, target does not vote",
    [row(3).votesNeeded, row(3).eligibleVoters, row(3).targetMayVote], [2, 2, false]);
  t("four: unanimity of the others", [row(4).votesNeeded, row(4).eligibleVoters], [3, 3]);
  t("five: three of four", [row(5).votesNeeded, row(5).eligibleVoters], [3, 4]);
  t("seven: four of six", [row(7).votesNeeded, row(7).eligibleVoters], [4, 6]);
  /* NEGATIVE CONTROL on the divergence itself. If ownerMath were adminMath
     reused, n=2 would report impossible and the target would not vote. That is
     the single row a shared implementation gets wrong, so it is asserted
     against the OTHER table directly rather than only in isolation. */
  const adm = await call(`/adminarith`);
  const admRow = adm.table.find((r) => r.administrators === 2);
  t("and section 4.7 still says two administrators cannot remove one another", admRow.possible, false);
  t("so the two tables genuinely differ at two, which is the point", row(2).possible !== admRow.possible, true);
}

console.log("\n--- 7.10: addition, and consensus past the second ---");
{
  t("a non-owner cannot propose an owner",
    (await call(`/projectowneradd?projectId=PROJ-2026-0001-secret&handle=dave&by=dave`)).reason, "NOT_THE_OWNER");
  t("nor can an administrator, who holds no authority over projects",
    (await call(`/projectowneradd?projectId=PROJ-2026-0001-secret&handle=dave&by=alice`)).reason, "NOT_THE_OWNER");
  t("someone who is not on the project cannot be made its owner",
    (await call(`/projectowneradd?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).reason, "NOT_A_PARTICIPANT");
  await call(`/projectinvite?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`);
  await call(`/projectjoin?projectId=PROJ-2026-0001-secret&by=dave`);
  const add = await call(`/projectowneradd?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`);
  t("the SOLE owner adds a second unilaterally", add.owner, true);
  t("and there are now two", add.owners, ["carol", "dave"]);
  t("adding someone already an owner is refused",
    (await call(`/projectowneradd?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).reason, "ALREADY_AN_OWNER");
}

console.log("\n--- 7.10: removal at TWO takes both, the departing owner included ---");
{
  t("removals carry a reason",
    (await call(`/projectownerremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).reason, "NO_REASON");
  const one = await call(`/projectownerremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol&reason=${encodeURIComponent("moving on")}`);
  t("one owner's vote is not enough", one.reason, "VOTES_SHORT");
  t("and it says how far short", [one.have, one.need], [1, 2]);
  /* The divergence, exercised rather than described: at three owners this call
     would be TARGET_CANNOT_VOTE. At two it is exactly how the rule is carried,
     because at two the act is a resignation with the other owner's assent. */
  const two = await call(`/projectownerremove?projectId=PROJ-2026-0001-secret&handle=dave&by=dave&reason=${encodeURIComponent("agreed")}`);
  t("the TARGET's own vote carries it at two", two.ok, true);
  t("one owner remains", two.owners, ["carol"]);
  t("and the former owner is STILL a participant, per 7.10", two.stillAParticipant, true);
  t("confirmed on the participant list", (await call(`/projectparticipants?projectId=PROJ-2026-0001-secret&by=carol`))
    .participants.filter((x) => x.handle === "dave").map((x) => x.owner), [0]);
  t("the last owner is not removable, because one is the floor",
    (await call(`/projectownerremove?projectId=PROJ-2026-0001-secret&handle=carol&by=carol&reason=${encodeURIComponent("x")}`)).reason,
    "LAST_OWNER");
  /* Put the fixture back for 7.8 below, which needs dave off the project. */
  t("fixture restored",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).removed, true);
}

console.log("\n--- 7.11: only an OWNER deactivates or reactivates, and the rule is NARROW ---");
{
  /* Deactivation is the lifecycle the project object already has, not a second
     switch beside it: `closed` with a closed_reason of `abandoned`, which the
     check catalog already permits, and `closed` back to `investigating`, which
     is the one reverse transition it allows. Nothing is added to the state
     vocabulary. */
  const state = async (id) => (await call(`/projection`)).find((r) => r.bundle_id === id).current_state;
  const cur = async (id) => (await call(`/projection`)).find((r) => r.bundle_id === id).bundle_sha;
  const move = (id, to, reason, actor) => {
    const body = `---\nid: ${id}\nobject_type: project\ncurrent_state: ${to}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-02T00:00:00Z"\n---\n\n## Summary\n\nSecret plan.\n`;
    return { text: body, to, reason, actor };
  };
  const promoteState = async (id, to, closedReason, actor) => {
    const m = move(id, to, closedReason, actor);
    return call("/promote", {
      bundleId: id, base: await cur(id), snapKey: `${id}-${to}-${closedReason ?? "x"}-${actor ?? "none"}`,
      author: actor ?? "suite", actorMemberId: actor ?? undefined,
      files: [{ path: "bundle.md", text: m.text, bytes: m.text.length, sha256: sha(m.text) }],
      meta: { object_type: "project", group: "believe-in-oakland", title: id, current_state: to,
              ...(closedReason ? { closed_reason: closedReason } : {}),
              created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" } });
  };
  const P = "PROJ-2026-0001-secret";

  t("a non-owner participant cannot deactivate",
    (await promoteState(P, "closed", "abandoned", "dave")).reason, "NOT_THE_OWNER");
  t("an administrator cannot either, holding no authority over projects",
    (await promoteState(P, "closed", "abandoned", "alice")).reason, "NOT_THE_OWNER");
  t("nor can a machine credential, which has no member behind it",
    (await promoteState(P, "closed", "abandoned", null)).reason, "NOT_THE_OWNER");
  t("and none of that moved the project", await state(P), "forming");

  const off = await promoteState(P, "closed", "abandoned", "carol");
  t("the OWNER deactivates it", off.ok, true);
  t("and it is closed", await state(P), "closed");

  t("a non-owner cannot reactivate",
    (await promoteState(P, "investigating", null, "dave")).reason, "NOT_THE_OWNER");
  const on = await promoteState(P, "investigating", null, "carol");
  t("the owner reactivates it, by the one reverse transition the catalog allows", on.ok, true);
  t("and it is investigating again", await state(P), "investigating");

  /* THE CONTROL THAT MAKES THE RULE NARROW RATHER THAN SWEEPING. If 7.11 were
     read as "only owners move a project's lifecycle", this would be refused and
     the accelerator could never advance a project at all. Closing as RESOLVED is
     finishing the work, not deactivating it, and is ordinary record work gated
     by `contribute` like every other write. */
  t("closing as RESOLVED is not owner-gated: it is finishing, not abandoning",
    (await promoteState(P, "closed", "resolved", "dave")).ok, true);
  await promoteState(P, "investigating", null, "carol");   // owner puts it back
  t("and a MACHINE CREDENTIAL may close it as resolved too, carrying no member at all",
    (await promoteState(P, "closed", "resolved", null)).ok, true);
  /* The same caller, the same target state, refused one line later purely
     because the reason is `abandoned`. That is the whole of 7.11's scope, shown
     rather than asserted about. */
  await promoteState(P, "investigating", null, "carol");
  t("but the SAME caller closing it as ABANDONED is refused",
    (await promoteState(P, "closed", "abandoned", null)).reason, "NOT_THE_OWNER");
}

console.log("\n--- 7.12: fork, and the three things that keep it from being an escalation route ---");
{
  const P = "PROJ-2026-0001-secret";
  t("an uninvited member cannot fork what they cannot see",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0002-fork&title=Fork+one&by=dave`)).reason,
    "NOT_A_PARTICIPANT");
  await call(`/projectinvite?projectId=${P}&handle=dave&by=carol`);
  /* INVITED IS NOT ENOUGH. An invited member sees the skeleton only, so a fork
     by them would copy material they cannot read. This is the assertion that
     makes fork mean one thing. */
  t("an INVITED member who has not joined cannot fork either",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0002-fork&title=Fork+one&by=dave`)).reason,
    "NOT_JOINED");
  await call(`/projectjoin?projectId=${P}&by=dave`);

  const f = await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0002-fork&title=Fork+one&by=dave`);
  t("a JOINED participant forks it", f.ok, true);
  /* THE RECORD, not the return value. The first version asserted `f.rel`, which
     is a literal this method returns, and the method did not in fact write the
     edge: a fork with no provenance passed the assertion. Read the document and
     the projected refs instead. */
  {
    const doc = (await call(`/image?id=PROJ-2026-0002-fork`))["bundle.md"] || "";
    t("the clone's frontmatter carries a references block", /references:/.test(doc), true);
    t("with a derived_from edge, already in the closed vocabulary", /rel: derived_from/.test(doc), true);
    t("pointing at the origin", new RegExp(`target: ${P}`).test(doc), true);
    /* refs is a PROJECTION of the document, rewritten on every promotion (D-21),
       so the edge sitting in frontmatter is not enough: it has to have landed in
       the table the derived reverse view reads. No route exposes that table, so
       measure the count it feeds, across a fork, which is the same evidence. */
    const refsBefore = (await call(`/stats`)).refs;
    const f2 = await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0004-fork&title=Fork+three&by=dave`);
    t("a second fork lands", f2.ok, true);
    t("and the refs PROJECTION grew by exactly one, so the edge is really there",
      (await call(`/stats`)).refs - refsBefore, 1);
  }
  t("the forker is the clone's sole owner, whoever owned the origin", f.owner, "dave");
  t("and NO participants were copied", f.participantsCopied, 0);
  const parts = await call(`/projectparticipants?projectId=PROJ-2026-0002-fork&by=dave`);
  t("confirmed on the clone's participant list: one person", parts.participants.length, 1);
  t("who is the forker, as its owner", [parts.participants[0].handle, parts.participants[0].owner], ["dave", 1]);
  t("carol, who owns the ORIGIN, is not on the clone",
    parts.participants.some((x) => x.handle === "carol"), false);

  /* 7.1 name uniqueness, case-insensitive and whitespace-collapsed. A plain
     unique index over the trimmed string is how handles work and would let these
     two coexist, which is the collision the rule exists to stop. */
  t("a second fork cannot take the same name",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0003-fork&title=Fork+one&by=dave`)).reason,
    "NAME_TAKEN");
  t("nor a differently-cased one",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0003-fork&title=FORK+ONE&by=dave`)).reason,
    "NAME_TAKEN");
  t("nor one differing only in whitespace",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0003-fork&title=Fork++one&by=dave`)).reason,
    "NAME_TAKEN");
  t("a genuinely different name is fine",
    (await call(`/projectfork?projectId=${P}&newId=PROJ-2026-0003-fork&title=Fork+two&by=dave`)).ok, true);

  /* A fork starts at the beginning of the lifecycle. Inheriting `matured` would
     claim a readiness the clone has not earned. */
  const st = (await call(`/projection`)).find((r) => r.bundle_id === "PROJ-2026-0002-fork");
  t("the clone starts at the beginning of the lifecycle", st.current_state, "forming");
  t("and carries its own name", st.title, "Fork one");

  /* Put the fixture back for 7.8 below. */
  await call(`/projectremove?projectId=${P}&handle=dave&by=carol`);
}

console.log("\n--- 7.1: project names are unique across the instance, at the WRITE path ---");
{
  /* Enforced at fork since 0.26.0, and nowhere else, so two projects created by
     the ORDINARY path could still collide. That was D-48. The write path is
     where it has to live, because fork is one of several ways a project is
     born. */
  const mkNamed = (id, title) => {
    const doc = `---\nid: ${id}\nobject_type: project\ncurrent_state: forming\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nX.\n`;
    return call("/promote", { bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
      files: [{ path: "bundle.md", text: doc, bytes: doc.length, sha256: sha(doc) }],
      meta: { object_type: "project", group: "believe-in-oakland", title,
              current_state: "forming", created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  };
  t("a project with a fresh name is created", (await mkNamed("PROJ-2026-0100-a", "Sewer Fund Transfers")).ok, true);
  t("an identical name is refused on the ORDINARY promote path",
    (await mkNamed("PROJ-2026-0101-b", "Sewer Fund Transfers")).reason, "NAME_TAKEN");
  t("case does not rescue it", (await mkNamed("PROJ-2026-0102-c", "SEWER FUND TRANSFERS")).reason, "NAME_TAKEN");
  t("nor does whitespace", (await mkNamed("PROJ-2026-0103-d", "Sewer  Fund   Transfers ")).reason, "NAME_TAKEN");
  t("and the refusal names the project already holding it",
    (await mkNamed("PROJ-2026-0104-e", "sewer fund transfers")).bundleId, "PROJ-2026-0100-a");
  t("a different name is fine", (await mkNamed("PROJ-2026-0105-f", "Franchise Fee Diversion")).ok, true);

  /* Held across every lifecycle state. A deactivated project has not gone
     anywhere: it is still cited, and its name must still resolve to what was
     cited, or a later project silently inherits an earlier one's references. */
  const cur = async (id) => (await call(`/projection`)).find((r) => r.bundle_id === id).bundle_sha;
  const doc2 = `---\nid: PROJ-2026-0105-f\nobject_type: project\ncurrent_state: closed\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-03T00:00:00Z"\n---\n\n## Summary\n\nX.\n`;
  await call("/promote", { bundleId: "PROJ-2026-0105-f", base: await cur("PROJ-2026-0105-f"),
    snapKey: "f-closed", author: "suite",
    files: [{ path: "bundle.md", text: doc2, bytes: doc2.length, sha256: sha(doc2) }],
    meta: { object_type: "project", group: "believe-in-oakland", title: "Franchise Fee Diversion",
            current_state: "closed", closed_reason: "abandoned",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-03T00:00:00Z" } });
  t("a DEACTIVATED project still holds its name",
    (await mkNamed("PROJ-2026-0106-g", "Franchise Fee Diversion")).reason, "NAME_TAKEN");

  /* A project may still be revised without tripping over ITSELF, which is the
     obvious way to get this wrong. */
  const doc3 = `---\nid: PROJ-2026-0100-a\nobject_type: project\ncurrent_state: investigating\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-04T00:00:00Z"\n---\n\n## Summary\n\nY.\n`;
  t("and a project keeps its own name across a revision",
    (await call("/promote", { bundleId: "PROJ-2026-0100-a", base: await cur("PROJ-2026-0100-a"),
      snapKey: "a-rev", author: "suite",
      files: [{ path: "bundle.md", text: doc3, bytes: doc3.length, sha256: sha(doc3) }],
      meta: { object_type: "project", group: "believe-in-oakland", title: "Sewer Fund Transfers",
              current_state: "investigating", created: "2026-07-01T00:00:00Z",
              last_updated: "2026-07-04T00:00:00Z" } })).ok, true);
  /* NEGATIVE CONTROL: the rule is about PROJECTS. Two pieces of Information may
     share a title, and always could. */
  const info = (id) => {
    const doc = `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nZ.\n`;
    return call("/promote", { bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
      files: [{ path: "bundle.md", text: doc, bytes: doc.length, sha256: sha(doc) }],
      meta: { object_type: "information", group: "believe-in-oakland", title: "Same Title",
              current_state: "collected", created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  };
  await info("INFO-2026-0100-a");
  t("two pieces of Information may share a title, as they always could",
    (await info("INFO-2026-0101-b")).ok, true);

  /* A title is never LOST by a revision. Found by the uniqueness check refusing
     a cite in members.test.mjs: cite, sever and reinstate rebuild meta from the
     document's frontmatter, so a bundle whose frontmatter carries no `title` was
     being re-promoted with title undefined and silently blanked in the
     projection. An update that does not mention the title is not a request to
     remove it. */
  const untitled = `---\nid: PROJ-2026-0107-h\nobject_type: project\ncurrent_state: forming\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nX.\n`;
  await call("/promote", { bundleId: "PROJ-2026-0107-h", base: null, snapKey: "h-new", author: "suite",
    files: [{ path: "bundle.md", text: untitled, bytes: untitled.length, sha256: sha(untitled) }],
    meta: { object_type: "project", group: "believe-in-oakland", title: "Kept Name",
            current_state: "forming", created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  await call("/promote", { bundleId: "PROJ-2026-0107-h", base: await cur("PROJ-2026-0107-h"),
    snapKey: "h-rev", author: "suite",
    files: [{ path: "bundle.md", text: untitled, bytes: untitled.length, sha256: sha(untitled) }],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "forming", created: "2026-07-01T00:00:00Z", last_updated: "2026-07-05T00:00:00Z" } });
  t("a revision that omits the title carries the old one forward",
    (await call(`/projection`)).find((r) => r.bundle_id === "PROJ-2026-0107-h").title, "Kept Name");
  t("and the name is still held against a later collision",
    (await mkNamed("PROJ-2026-0108-i", "kept name")).reason, "NAME_TAKEN");
}

console.log("\n--- 7.8: participants see each other, non-participants see nothing ---");
{
  const p = await call(`/projectparticipants?projectId=PROJ-2026-0001-secret&by=carol`);
  t("a participant sees the list", p.participants.map((x) => x.handle), ["carol"]);
  const out = await call(`/projectparticipants?projectId=PROJ-2026-0001-secret&by=dave`);
  t("a non-participant is refused", out.reason, "NO_SUCH_PROJECT");
  /* And refused in the SAME WORDS as for a project that does not exist, because
     7.9 says an uninvited member cannot see that a project exists. */
  const absent = await call(`/projectparticipants?projectId=PROJ-2026-9999-nope&by=dave`);
  t("in the same words as one that does not exist", out.reason, absent.reason);
  t("byte-identical, so the answer distinguishes nothing", JSON.stringify(out), JSON.stringify(absent));
}

console.log("\n--- negative controls ---");
{
  t("the filter can still say yes", (await visible("member:carol")).length > 0, true);
  t("and an unrecognised viewer sees nothing at all", (await visible("nonsense")).length, 0);
}

await mf.dispose();
console.log(`\nprojects: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
