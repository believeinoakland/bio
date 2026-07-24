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
const add = await POST("op=memberadd&token=t-admin-1", { memberId: "ruth", name: "Ruth" });
t("admin creates a member", add.result.ok, true);
t("the invite appears exactly once", typeof add.result.invite, "string");
t("duplicate member refused", (await POST("op=memberadd&token=t-admin-1", { memberId: "ruth", name: "Ruth" })).result.reason, "EXISTS");
t("bad id refused", (await POST("op=memberadd&token=t-admin-1", { memberId: "Not A Slug", name: "x" })).result.reason, "BAD_MEMBER_ID");
t("member token cannot create members", (await POST("op=memberadd&token=t-member-1", { memberId: "x", name: "x" })).error, "forbidden for token class");
t("public path cannot create members", (await POST("op=memberadd", { memberId: "x", name: "x" })).error, "unauthenticated");

console.log("\n--- enrollment spends the invite ---");
t("wrong invite refused", (await POST("op=enroll", { memberId: "ruth", invite: "nope", password: "long-enough-password" })).result.reason, "BAD_INVITE");
t("short password refused", (await POST("op=enroll", { memberId: "ruth", invite: add.result.invite, password: "short" })).result.reason, "PASSWORD_TOO_SHORT");
const en = await POST("op=enroll", { memberId: "ruth", invite: add.result.invite, password: "ruth-passphrase-1" });
t("enrollment succeeds", en.result.ok, true);
t("the invite is spent", (await POST("op=enroll", { memberId: "ruth", invite: add.result.invite, password: "another-passphrase" })).result.reason, "ALREADY_ENROLLED");

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
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], refs: [], register: [] });
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
  files: [{ path: "bundle.md", text: md2, bytes: md2.length, sha256: sha(md2) }], refs: [], register: [] });
t("session promotes an update", pr2.result.ok, true);
const img2 = await GET(`op=image&id=${id}&token=t-admin-1`);
const man2 = JSON.parse(img2.result["_history/manifest.json"]);
t("history records the session identity as author", man2.entries[0].author, "ruth");

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
const add2 = await POST(`op=memberadd&${A}`, { memberId: "meilan", name: "Meilan" });
t("admin session invites a member", add2.result.ok, true);
t("admin session still cannot purge", (await GET(`op=purge&confirm=bio&${A}`)).error, "this operation requires a machine credential, not a signed-in session");

console.log("\n--- revocation closes every door ---");
t("revoke", (await POST(`op=memberset&${A}`, { memberId: "ruth", status: "revoked" })).result.ok, true);
t("revoked member's session is dead", (await GET(`op=list&${S}`)).error, "unauthenticated");
t("revoked member cannot log in", (await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" })).result.reason, "NO_SUCH_ROLE");
t("reinstate", (await POST(`op=memberset&${A}`, { memberId: "ruth", status: "active" })).result.ok, true);
t("reinstated member logs in again", (await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" })).result.ok, true);

console.log("\n--- the roster is visible, invites are not ---");
const ml = await GET(`op=memberlist&token=t-member-1`);
t("machine member token reads the roster", ml.result.members.length, 2);
t("no invite material in the roster", JSON.stringify(ml.result).includes(add2.result.invite), false);

/* Miniflare holds a live workerd child process. Without dispose the suite
   prints its result and then hangs forever, which costs minutes per run and
   teaches nothing. Dispose, then exit on the result. */
await mf.dispose();
console.log(`\nmembers: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
