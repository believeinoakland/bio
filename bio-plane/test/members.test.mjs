/* NEGATIVE CONTROL: (run 2026-07-31) stop stamping a session lease with the signed-in member (index.mjs: set the lease `actor` to `token:${cls}` unconditionally instead of `viaSession ? sessMember : ...`) -> 1 assertion fails ("session lease is stamped with the member, not the claimed actor"); restored, 55 pass. */
/* NEGATIVE CONTROL: (run 2026-08-03, D-157) restore the PRE-FIX projection — store.mjs Store.memberList, replace `const pairs = administer === true || administer === "1"` with `const pairs = true`, so cover is selected for every caller as it was before -> 6 assertions fail, NAMING both non-administrator callers that received the pairing: the ORDINARY MEMBER SESSION ("and receives NO cover field at all", "and the whole answer carries no cover value smuggled elsewhere", "a member cannot stamp itself an administrator") and the shared MEMBER_TOKEN ("the shared MEMBER_TOKEN receives NO cover field either", "no cover value reaches the machine member credential", "nor can the shared machine credential"); restored byte-identical, 71 pass. The probe assertions correctly do NOT fail: probe answers from the empty `scratch` roster, so there is no row to leak — an outcome that costs nothing to produce is not evidence, and it is the scratch confinement rather than this projection that holds there. */
/* NEGATIVE CONTROL, the other direction: (run 2026-08-03, D-157) delete the SERVER STAMP — index.mjs, disable the `if (op === "memberlist") inner.searchParams.set("administer", ...)` block -> 7 assertions fail. Two things are proved at once. FAIL CLOSED: every administrator assertion fails (root token, admin session, in-app administrator's session, and the "roster records a cover" block below), because an unstamped call yields handles and no cover — losing the stamp loses the pairing rather than leaking it. And THE IMPOSTOR RULE: "a member cannot stamp itself an administrator" fails, because with the server's `set` gone the caller's own `administer=1` survives the parameter copy and is honoured. Restored byte-identical, 71 pass. */
/* Member credentials and the session write powers.
 *
 * Runs the full Worker (index.mjs) under miniflare with the DO bound, so
 * every assertion crosses the real surface: op registry, classification,
 * session rules, author stamping. No R2 here; intake without evidence
 * storage must work, per the installer doctrine that R2 is optional.
 *
 * Negative-control detail: stop stamping a session lease with the signed-in member (index.mjs: set the lease `actor` to `token:${cls}` unconditionally instead of `viaSession ? sessMember : ...`) -> 1 assertion fails ("session lease is stamped with the member, not the claimed actor"); restored, 55 pass.
 *
 * D-157 (2026-08-03) added the section-3 block at the end: only administrators
 * see cover and handle TOGETHER. It is asserted HERE and not in
 * membership.test.mjs deliberately — membership.test.mjs drives the Durable
 * Object directly, and the whole rule turns on which credential authenticated,
 * which only the control plane knows. Its two negative controls are recorded
 * above: one restores the pre-fix projection and names the callers that leaked;
 * the other deletes the server stamp and proves the projection fails closed and
 * cannot be talked into opening by a caller who names the stamp himself.
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

/* op=signerlist is the READ over the signer roster and, before this, no suite
   reached it through the control plane — a real caller's only route (D-43). The
   claim is reachability: the op answers with a structured roster rather than a
   crash. The public name differs from the DO's internal path, so this also
   exercises the DO_PATH rename the control plane owns. */
const sl = await GET("op=signerlist&token=t-admin-1");
t("op=signerlist is reached through the control plane", sl.ok, true);
t("and answers with a signer roster rather than an exception", Array.isArray(sl.result.signers), true);

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
const mlg2 = await POST("op=login", { role: "member:meilan", password: "meilan-passphrase-1" });
t("reinstated member logs in again", mlg2.result.ok, true);
/* An ORDINARY member's live session (administer: false), which is one of the two
   callers D-157 measured receiving the pairing. */
const M2 = "token=" + mlg2.result.token;

console.log("\n--- the roster is visible, invites are not ---");
const ml = await GET(`op=memberlist&token=t-member-1`);
t("machine member token reads the roster", ml.result.members.length, 2);
t("no invite material in the roster", JSON.stringify(ml.result).includes(add2.result.invite), false);

console.log("\n--- section 3: only administrators see cover and handle TOGETHER (D-157) ---");
{
  /* WHY THE ASSERTION ABOVE WAS NOT ENOUGH, and why the one that used to stand
     alone here was wrong. "machine member token reads the roster" is still
     TRUE and still belongs: §3 says "Members and the public see handles", so a
     member reading the roster is the design, not the defect. What the old
     assertion did was count the rows and stop — it confirmed the member token
     received an answer and never looked at its SHAPE, so for as long as it
     stood, `handle` and `cover` arrived together for every non-administrator
     and the suite reported green. MEASURED 2026-08-02 on the live store: an
     ordinary member session and the shared MEMBER_TOKEN each received a view
     byte-identical to the administrator's. A test that asserts a caller gets an
     answer, on an op whose whole rule is about what may be IN the answer, is a
     test of the wrong thing; it is corrected here rather than exempted, because
     the row count is worth keeping and it is the omission that was the defect.

     THE STAKE is not tidiness. The cover↔handle split exists precisely so that
     a roster seized or subpoenaed does not deanonymise the group: handles are
     already public, covers are the administrator's private labels, and only the
     PAIR maps the public record back to the people in it. */
  const rowsFor = async (q) => (await GET(`op=memberlist&${q}`)).result.members;
  const hasKey = (rs, k) => rs.every((r) => k in r);
  const anyKey = (rs, k) => rs.some((r) => k in r);

  /* The administrator half: the pairing is SERVED, not merely permitted — the
     fix must not have turned a projection into a refusal. */
  const asRootToken = await rowsFor("token=t-admin-1");
  t("the ADMIN_TOKEN root of trust receives cover and handle together",
    [hasKey(asRootToken, "cover"), hasKey(asRootToken, "handle")], [true, true]);
  t("and the pairing is the real one, not an empty field",
    asRootToken.find((m) => m.member_id === "ruth").cover, "the CPA from Tuesday");
  const asAdminSession = await rowsFor(A);
  t("an administrator's SESSION receives the pairing too",
    [hasKey(asAdminSession, "cover"), asAdminSession.find((m) => m.member_id === "meilan").cover],
    [true, "Meilan"]);
  /* Ruth is an in-app administrator (role admin, not the root token), so her
     session's `administer` right is what carries the pairing — the same field
     op=whoami publishes, never a second rule. */
  t("ruth is an in-app administrator, not the root of trust",
    (await GET(`op=whoami&${S}`)).result.administer, true);
  t("and her session receives the pairing on that right",
    hasKey(await rowsFor(S), "cover"), true);

  /* The non-administrator half. ABSENT, not null and not blank: a key that is
     present and empty still confirms that a pairing exists to be asked for. */
  const asMember = await rowsFor(M2);
  t("an ordinary member's session does not administer",
    (await GET(`op=whoami&${M2}`)).result.administer, false);
  t("and receives NO cover field at all — absent, not null, not empty",
    anyKey(asMember, "cover"), false);
  t("while still receiving the handle roster it is entitled to (§3)",
    [hasKey(asMember, "handle"), asMember.length], [true, 2]);
  t("and the whole answer carries no cover value smuggled elsewhere",
    JSON.stringify(asMember).includes("the CPA from Tuesday"), false);

  const asMemberToken = await rowsFor("token=t-member-1");
  t("the shared MEMBER_TOKEN receives NO cover field either",
    anyKey(asMemberToken, "cover"), false);
  t("and still reads the handle roster",
    [hasKey(asMemberToken, "handle"), asMemberToken.length], [true, 2]);
  t("no cover value reaches the machine member credential",
    JSON.stringify(asMemberToken).includes("Meilan"), false);

  /* PROBE was measured NOT exposed before this change — scopeFor confines it to
     the `scratch` namespace, a different Durable Object with its own member
     table — and re-verified here, because this build changed what a
     non-administrator receives and a reachability claim is worth nothing
     unchecked. It answers from scratch (an empty roster, never the live one)
     and carries no cover even so. */
  const asProbe = await rowsFor("token=t-probe-1");
  t("the probe class answers from scratch, not from the live roster",
    [asProbe.length, JSON.stringify(asProbe).includes("ruth")], [0, false]);
  t("and probe does not administer, so it could not receive a pairing either",
    anyKey(asProbe, "cover"), false);

  /* The impostor rule: the stamp is the SERVER's. A caller who names it is
     overwritten, not honoured — the same discipline viewer/author/by/owner
     follow, and the reason the projection cannot be talked out of. */
  t("a member cannot stamp itself an administrator",
    anyKey(await rowsFor(`${M2}&administer=1`), "cover"), false);
  t("nor can the shared machine credential",
    anyKey(await rowsFor("token=t-member-1&administer=true"), "cover"), false);
}

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
