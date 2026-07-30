/* Member credentials and the session write powers.
 *
 * Runs the full Worker (index.mjs) under miniflare with the DO bound, so
 * every assertion crosses the real surface: op registry, classification,
 * session rules, author stamping. No R2 here; intake without evidence
 * storage must work, per the installer doctrine that R2 is optional.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});

const sha = (s) => createHash("sha256").update(s).digest("hex");
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body) })).json();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

console.log("\n--- roster administration is admin-only ---");
/* Ruth is the SECOND member of this group, so she must be an administrator:
   the first invitation a group issues creates a second administrator, and there
   are no ordinary members until two exist (Membership Architecture 4.2, 4.3).
   This suite predates that rule and used to invite her as an ordinary member. */
const add = await POST("op=memberadd&token=t-admin-1", { memberId: "ruth", cover: "the CPA from Tuesday", role: "admin" });
t("admin creates a member", add.result.ok, true);
t("the invite appears exactly once", typeof add.result.invite, "string");
t("duplicate member refused", (await POST("op=memberadd&token=t-admin-1", { memberId: "ruth", cover: "the CPA from Tuesday", role: "admin" })).result.reason, "EXISTS");
t("bad id refused", (await POST("op=memberadd&token=t-admin-1", { memberId: "Not A Slug", cover: "x" })).result.reason, "BAD_MEMBER_ID");
t("member token cannot create members", (await POST("op=memberadd&token=t-member-1", { memberId: "x", name: "x" })).error, "forbidden for token class");
t("public path cannot create members", (await POST("op=memberadd", { memberId: "x", name: "x" })).error, "unauthenticated");

console.log("\n--- enrollment spends the invite ---");
/* An invitation is now identified by its TOKEN alone, and a wrong, spent or
   never-existent one all answer identically: a response that told them apart
   would confirm to whoever found an archived link that it once addressed
   somebody real (Membership Architecture 6). */
t("wrong invite refused", (await POST("op=enroll", { invite: "nope", handle: "ruth", password: "long-enough-password" })).result.reason, "NO_SUCH_INVITATION");
t("short password refused", (await POST("op=enroll", { invite: add.result.invite, handle: "ruth", password: "short" })).result.reason, "PASSWORD_TOO_SHORT");
const en = await POST("op=enroll", { invite: add.result.invite, handle: "ruth", password: "ruth-passphrase-1" });
t("enrollment succeeds", en.result.ok, true);
t("the invite is spent, and says nothing about what it addressed", (await POST("op=enroll", { invite: add.result.invite, handle: "ruth2", password: "another-passphrase" })).result.reason, "NO_SUCH_INVITATION");

console.log("\n--- member sign-in and the intake powers ---");
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
t("member logs in", lg.result.ok, true);
const S = "token=" + lg.result.token;
t("wrong password refused", (await POST("op=login", { role: "member:ruth", password: "wrong-passphrase-x" })).result.reason, "BAD_PASSWORD");
t("unknown member refused", (await POST("op=login", { role: "member:nobody", password: "whatever-whatever" })).result.reason, "NO_SUCH_ROLE");

const aid = await GET(`op=allocid&prefix=INFO&year=2026&${S}`);
t("session allocates an id", typeof aid.result.id, "string");
const id = aid.result.id;
const md = `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nintake by ruth\n`;
const pr = await POST(`op=promote&${S}`, {
  bundleId: id, base: null, snapKey: "20260724T120000Z_aaaa1111", author: "IMPOSTOR",
  meta: { object_type: "information", group: "believe-in-oakland", title: "intake", current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T00:00:00Z" },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
t("session promotes a creation", pr.result.ok, true);
const lease = await GET(`op=lease&id=${id}&actor=IMPOSTOR&${S}`);
t("session lease is stamped with the member, not the claimed actor", lease.result.actor, "ruth");

console.log("\n--- the impostor check: authorship comes from the session ---");
const img = await GET(`op=image&id=${id}&token=t-admin-1`);
const man = JSON.parse(img.result["_history/manifest.json"] ?? '{"entries":[]}');
// creation writes no manifest entry; author lives on the next promotion
const md2 = md + "\nrevised\n";
const pr2 = await POST(`op=promote&${S}`, {
  bundleId: id, base: pr.result.bundleSha, snapKey: "20260724T130000Z_bbbb2222", author: "IMPOSTOR",
  meta: { object_type: "information", group: "believe-in-oakland", title: "intake", current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
  files: [{ path: "bundle.md", text: md2, bytes: md2.length, sha256: sha(md2) }], register: [] });
t("session promotes an update", pr2.result.ok, true);
const img2 = await GET(`op=image&id=${id}&token=t-admin-1`);
const man2 = JSON.parse(img2.result["_history/manifest.json"]);
t("history records the session identity as author", man2.entries[0].author, "ruth");

console.log("\n--- a session can work the retrieval surface it is given ---");
/* These reads were missing from SESSION_OPS until 2026-07-25: a signed-in
   member could CREATE a selection and then neither search to build one nor
   resolve the one they had made, so the browser half of S-10 was unreachable
   from a session. Found when `cite` needed them. */
{
  const sr = await GET(`op=search&q=intake&${S}`);
  t("session can search", sr.ok, true);
  t("and gets the record it just wrote", sr.result.hits.map((h) => h.bundle_id), [id]);
  /* The gate compiled for the SESSION's identity, not for a class. */
  /* `participant` since D-15 landed: an identified session now compiles to a
     real predicate over project participation rather than the flat `member`
     scope search shipped at. A machine credential still compiles to `member`,
     because it has no participation to check. */
  t("compiled against the participation scope", sr.result.gate.scope, "participant");
  t("session can read the query vocabulary",
    typeof (await GET(`op=searchfields&${S}`)).result.fields.title, "object");
}
{
  const sel = await POST(`op=select&${S}`, { ids: [id] });
  t("session creates a selection", sel.result.ok, true);
  const h = sel.result.handle;
  t("and can resolve the selection it just made",
    (await GET(`op=selection&handle=${h}&${S}`)).result.ok, true);
  t("and can list its own selections", (await GET(`op=selectionlist&${S}`)).result.ok, true);
  /* Ownership is the server's stamp, so one member cannot resolve another's
     handle even knowing it. The admin session is a different owner. */
  /* cross-owner refusal is asserted in cite.test.mjs, where both owners exist */
}

console.log("\n--- a session cites, and the record says who did it ---");
{
  const pid = "PROJ-2026-0001-session";
  const pmd = `---\nid: ${pid}\nobject_type: project\ncurrent_state: forming\ncreated: "2026-07-24T00:00:00Z"\nlast_updated: "2026-07-24T00:00:00Z"\n---\n\n## Session Log\n\n### Session 2026-07-24T00:00:00Z | Formation | interactive_agentic\nTrigger: elevation\nChanges: created.\n`;
  const cr = await POST(`op=promote&${S}`, {
    bundleId: pid, base: null, snapKey: "20260724T130000Z_bbbb2222", author: "ruth",
    meta: { object_type: "project", group: "believe-in-oakland", title: "session project",
            current_state: "forming", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T00:00:00Z" },
    files: [{ path: "bundle.md", text: pmd, bytes: pmd.length, sha256: sha(pmd) }], register: [] });
  t("the project exists", cr.result.ok, true);

  const sel = await POST(`op=select&${S}`, { ids: [id] });
  /* author is supplied and must be IGNORED, the same impostor rule promote and
     lease already follow. */
  const c = await POST(`op=cite&project=${pid}&handle=${sel.result.handle}&author=IMPOSTOR&${S}`, {});
  t("session cites", c.result.ok, true);
  t("into a bundle that had no references key at all", c.result.cited, [id]);

  const doc = (await GET(`op=file&id=${pid}&path=bundle.md&token=t-admin-1`)).result.text;
  t("the edge is in the document", /rel: cites/.test(doc), true);
  t("the Session Log names the session's member", /\| ruth$/m.test(doc.split("\n").find((l) => l.startsWith("### Session ") && l.includes("Cited")) ?? ""), true);
  t("and not the claimed author", doc.includes("IMPOSTOR"), false);
}

console.log("\n--- what a session may never do ---");
t("session cannot purge", (await GET(`op=purge&confirm=bio&${S}`)).error, "this operation requires a machine credential, not a signed-in session");
t("session cannot livefire", (await GET(`op=livefire&${S}`)).error, "this operation requires a machine credential, not a signed-in session");
t("member session cannot manage the roster", (await POST(`op=memberadd&${S}`, { memberId: "x", name: "x" })).error, "this operation requires a machine credential, not a signed-in session");
t("member session cannot register keys", (await POST(`op=signeradd&${S}`, { keyB64: "AAAAtest", memberId: "ruth" })).error, "this operation requires a machine credential, not a signed-in session");

console.log("\n--- admin session manages the roster ---");
await POST("op=claim", { bootstrapToken: "t-admin-1", password: "steward-passphrase-1" });
const alg = await POST("op=login", { role: "admin", password: "steward-passphrase-1" });
t("admin logs in", alg.result.ok, true);
const A = "token=" + alg.result.token;
const add2 = await POST(`op=memberadd&${A}`, { memberId: "meilan", cover: "Meilan" });
t("admin session invites a member", add2.result.ok, true);
t("admin session still cannot purge", (await GET(`op=purge&confirm=bio&${A}`)).error, "this operation requires a machine credential, not a signed-in session");

console.log("\n--- revocation closes every door ---");
/* Revocation is demonstrated on an ORDINARY member. Ruth is an administrator
   here (4.2: the second member of a group must be one), and an administrator
   cannot be revoked by another administrator at all: that takes the section 4.7
   vote, and at two administrators it is impossible by design. This suite used
   to revoke Ruth directly, which the rule now correctly refuses. */
t("an administrator cannot be revoked directly (4.4)",
  (await POST(`op=memberset&${A}`, { memberId: "ruth", status: "revoked" })).result.reason, "ADMIN_REQUIRES_VOTE");
const men = await POST("op=enroll", { invite: add2.result.invite,
  handle: "meilan", password: "meilan-passphrase-1" });
t("the ordinary member enrols", men.result.ok, true);
const mlg = await POST("op=login", { role: "member:meilan", password: "meilan-passphrase-1" });
const M = "token=" + mlg.result.token;
t("and holds a live session", (await GET(`op=list&${M}`)).result.length >= 0, true);
t("revoke", (await POST(`op=memberset&${A}`, { memberId: "meilan", status: "revoked" })).result.ok, true);
t("revoked member's session is dead", (await GET(`op=list&${M}`)).error, "unauthenticated");
t("revoked member cannot log in", (await POST("op=login", { role: "member:meilan", password: "meilan-passphrase-1" })).result.reason, "NO_SUCH_ROLE");
t("reinstate", (await POST(`op=memberset&${A}`, { memberId: "meilan", status: "active" })).result.ok, true);
t("reinstated member logs in again", (await POST("op=login", { role: "member:meilan", password: "meilan-passphrase-1" })).result.ok, true);

console.log("\n--- the roster is visible, invites are not ---");
const ml = await GET(`op=memberlist&token=t-member-1`);
t("machine member token reads the roster", ml.result.members.length, 2);
t("no invite material in the roster", JSON.stringify(ml.result).includes(add2.result.invite), false);

/* Miniflare holds a live workerd child process. Without dispose the suite
   prints its result and then hangs forever, which costs minutes per run and
   teaches nothing. Dispose, then exit on the result. */

console.log("\n--- the roster records a cover, not a name ---");
{
  /* The word is the mitigation. A field called "name" invites an administrator
     to type a legal name, and the cover-and-handle split exists precisely so a
     roster seized or subpoenaed does not deanonymise the group. */
  const rs = (await GET("op=memberlist&token=t-admin-1")).result.members;
  const ruth = rs.find((m) => m.member_id === "ruth");
  t("the roster field is called cover", "cover" in ruth, true);
  t("and there is no name field to mistake for one", "name" in ruth, false);
  t("it holds whatever the administrator chose", ruth.cover, "the CPA from Tuesday");
  t("a member with no cover is refused",
    (await POST("op=memberadd&token=t-admin-1", { memberId: "nobody" })).result.reason, "NO_COVER");
  t("and the refusal says it need not be a real name",
    /does not have to be|need not be|not be a legal name/.test(
      (await POST("op=memberadd&token=t-admin-1", { memberId: "nobody" })).result.detail || ""), true);
}

await mf.dispose();
console.log(`\nmembers: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
