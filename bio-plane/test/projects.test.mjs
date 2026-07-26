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

console.log("\n--- 7.7: only an administrator removes, and owners never do ---");
{
  t("the owner cannot remove a participant",
    (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=carol`)).reason, "ADMIN_ONLY");
  const r = await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=dave&by=alice`);
  t("an administrator can", r.removed, true);
  t("and the project vanishes for him again", (await visible("member:dave")).includes("PROJ-2026-0001-secret"), false);
  t("the owner cannot be removed", (await call(`/projectremove?projectId=PROJ-2026-0001-secret&handle=carol&by=alice`)).reason, "OWNER");
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
