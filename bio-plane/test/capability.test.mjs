/* NEGATIVE CONTROL: (run 2026-07-31) disable the session capability gate in index.mjs (guard the `needs && ... !sessCaps.has(needs)` branch with `false`, so a member missing a capability is not refused NOT_CAPABLE) -> 8 assertions fail (the contribute/publish/create_projects refusals); restored, 63 pass. */
/* Capability enforcement at the op layer. Membership Architecture v2 section 5.
 *
 * Runs the full Worker under miniflare, because the control plane is the only
 * route a real caller has and an op tested only at the Durable Object is
 * untested (standing lesson 5).
 *
 * What this suite is for: capabilities are RECORDED today and nothing consults
 * them. A member with no `publish` reaches op=ratify and is stopped only by the
 * absence of a signing key, which is the key doing the capability's job.
 *
 * Negative-control detail: disable the session capability gate in index.mjs (guard the `needs && ... !sessCaps.has(needs)` branch with `false`, so a member missing a capability is not refused NOT_CAPABLE) -> 8 assertions fail (the contribute/publish/create_projects refusals); restored, 63 pass.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
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

const sha = (x) => createHash("sha256").update(x).digest("hex");
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* A member and a session for them, at exactly the capabilities named. */
const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-1",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.result.token;
};

/* The second member of a group must be an administrator, and there are no
   ordinary members until TWO exist (4.2, 4.3). The founding administrator holds
   ADMIN_TOKEN and has no roster row, so the roster needs two of its own before
   sam, vera and pia can be added at all. */
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
const GUS  = await member("gus",  ["contribute"], "admin");   // second admin, deliberately thin caps

/* The FOUNDER's own session. They hold ADMIN_TOKEN and are the root of trust
   (4.6), which makes them the sharpest test of 8.1: even their signed-in browser
   is a password-derived credential and not the token itself. */
/* op=claim is how a founder gets a password: setpassword is Durable-Object-only
   and is not a control-plane op, so an earlier version of this line built the
   string "token=undefined" and the founder assertion below tested an invalid
   credential rather than the founder. */
const claimed = await POST("op=claim", { bootstrapToken: "t-admin-1", password: "founder-passphrase-1" });
if (!claimed.result?.ok) throw new Error("claim: " + JSON.stringify(claimed));
const flog = await POST("op=login", { role: "admin", password: "founder-passphrase-1" });
if (!flog.result?.token) throw new Error("founder login: " + JSON.stringify(flog));
const FOUNDER = "token=" + flog.result.token;

const SAM   = await member("sam",   ["contribute"]);                    // no publish, no projects
const VERA  = await member("vera",  []);                                // view only
const PIA   = await member("pia",   ["contribute", "create_projects"]); // may create projects

let seq = 0;
const bundle = (id, type = "information") => {
  const md = `# ${id}\n`;
  return {
    bundleId: id, base: null, snapKey: `20260726T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
            current_state: type === "project" ? "forming" : "collected",
            created: "2026-07-26T00:00:00Z", last_updated: "2026-07-26T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
  };
};

console.log("\n--- contribute gates the working corpus ---");
t("a member WITH contribute may promote",
  (await POST(`op=promote&${SAM}`, bundle("INFO-2026-9001-sam"))).result?.ok, true);
t("a member WITHOUT contribute is refused, and told which capability",
  (await POST(`op=promote&${VERA}`, bundle("INFO-2026-9002-vera"))).reason, "NOT_CAPABLE");
t("and the refusal names the capability rather than the op",
  (await POST(`op=promote&${VERA}`, bundle("INFO-2026-9003-vera"))).needs, "contribute");
/* NEGATIVE CONTROL, and it was vacuous when first written: it asked op=get,
   which does not exist, so it passed for every input including a bundle that
   HAD been created. op=image is the real read. Standing lesson 6. */
t("the refusal does not create the bundle",
  (await GET(`op=image&id=INFO-2026-9002-vera&token=t-admin-1`)).result?.["bundle.md"], undefined);
t("and the control is not vacuous: a bundle that WAS created reads back",
  typeof (await GET(`op=image&id=INFO-2026-9001-sam&token=t-admin-1`)).result?.["bundle.md"], "string");

console.log("\n--- publish gates ratify, and the signing key is no longer doing its job ---");
const rat = await POST(`op=ratify&${SAM}`, { bundleId: "INFO-2026-9001-sam" });
t("a member WITHOUT publish is refused for the capability", rat.reason, "NOT_CAPABLE");
t("and not for the absence of a key", rat.needs, "publish");

console.log("\n--- create_projects gates the SHAPE, not an op of its own ---");
t("a member with contribute but not create_projects cannot create a project",
  (await POST(`op=promote&${SAM}`, bundle("PROJ-2026-9001-sam", "project"))).needs, "create_projects");
t("the same member may still promote ordinary material",
  (await POST(`op=promote&${SAM}`, bundle("INFO-2026-9004-sam"))).result?.ok, true);
const proj = await POST(`op=promote&${PIA}`, bundle("PROJ-2026-9002-pia", "project"));
t("a member WITH create_projects creates one", proj.result?.ok, true);

console.log("\n--- 7.1: the creator becomes the owner, in the same write ---");
const parts = await GET(`op=projectparticipants&projectId=PROJ-2026-9002-pia&${PIA}`);
t("the project has exactly one participant", parts.result?.participants?.length, 1);
t("who is the creator", parts.result?.participants?.[0]?.handle, "pia");
t("and is its owner", parts.result?.participants?.[0]?.owner, 1);

console.log("\n--- 7.12: fork requires create_projects, at the control plane ---");
/* The escalation route this closes: without it, any joined participant creates
   projects they were not trusted to create, simply by forking one they are on.
   Asserted HERE and not only in projects.test.mjs, because the capability lives
   on the session and the Durable Object never sees one. */
t("a joined participant WITHOUT create_projects cannot fork",
  (await POST(`op=projectfork&projectId=PROJ-2026-9002-pia&newId=PROJ-2026-9099-x&title=Anything&${SAM}`)).needs,
  "create_projects");
t("and is refused for the capability, not for anything about the project",
  (await POST(`op=projectfork&projectId=PROJ-2026-9002-pia&newId=PROJ-2026-9099-x&title=Anything&${SAM}`)).reason,
  "NOT_CAPABLE");
/* NEGATIVE CONTROL: holding the capability is not on its own enough, and a gate
   that refused everyone would pass the assertion above while saying nothing. pia
   holds create_projects and owns the project, so she clears the capability gate
   and is then judged on section 7 and on the document.

   She is refused, and the refusal is the POINT: this fixture writes bundle.md
   with no frontmatter at all, so there is no references block to extend and the
   clone would have no recorded origin. A fork with no provenance is not written.
   What matters here is that her refusal is not NOT_CAPABLE. */
{
  const r = await POST(`op=projectfork&projectId=PROJ-2026-9002-pia&newId=PROJ-2026-9098-y&title=Pia+fork&${PIA}`);
  t("a member WITH create_projects is past the capability gate", r.reason === "NOT_CAPABLE", false);
  t("and is judged on the record instead", r.result?.reason, "UNSPLICEABLE_REFERENCES");
}

console.log("\n--- capabilities gate a SESSION, never a machine credential ---");
/* NEGATIVE CONTROL. A verifier that says no to everything says nothing: the
   machine credential must still get through, because a token class has no
   member behind it and therefore no capabilities to hold. */
t("MEMBER_TOKEN promotes, uncapability-gated",
  (await POST("op=promote&token=t-member-1", bundle("INFO-2026-9005-machine"))).result?.ok, true);
t("and cannot forge a project owner",
  (await POST("op=promote&token=t-member-1",
     { ...bundle("PROJ-2026-9003-machine", "project"), ownerMemberId: "pia" })).result?.ok, true);
/* Asked as an admin SESSION, not with ADMIN_TOKEN: `by` is stamped `class:admin`
   for a machine credential, which is not a member id and matches no
   administrator, so the store answers NO_SUCH_PROJECT. That is the fail-closed
   behaviour the stamp exists for, and it is asserted just below. */
const forged = await GET(`op=projectparticipants&projectId=PROJ-2026-9003-machine&${RUTH}`);
t("the machine-created project has no owner at all", forged.result?.participants?.length, 0);
t("and a machine credential cannot read a participant list, having no member behind it",
  (await GET(`op=projectparticipants&projectId=PROJ-2026-9002-pia&token=t-admin-1`)).result?.reason,
  "NO_SUCH_PROJECT");

console.log("\n--- an administrator holds every working capability (v2 section 5) ---");
/* Asserts the CAPABILITY gate specifically. The ratify path then refuses this
   payload as MALFORMED for want of a signature, which is the key doing the
   key's job and is what ratify.test.mjs covers. */
t("an administrator is not stopped by the capability gate at ratify",
  (await POST(`op=ratify&${RUTH}`, { bundleId: "INFO-2026-9001-sam" })).reason === "NOT_CAPABLE", false);
t("and a member without publish IS, at the same payload",
  (await POST(`op=ratify&${SAM}`, { bundleId: "INFO-2026-9001-sam" })).reason === "NOT_CAPABLE", true);
t("and creates projects",
  (await POST(`op=promote&${RUTH}`, bundle("PROJ-2026-9004-ruth", "project"))).result?.ok, true);
/* Gus was invited with contribute alone, and memberCaps refuses to edit an
   administrator's row, so if the row were consulted his powers would be frozen
   at whatever the invitation happened to set and could never be widened. v2
   section 5 says the row is not consulted for an administrator. */
t("an administrator whose ROW says contribute only still creates projects",
  (await POST(`op=promote&${GUS}`, bundle("PROJ-2026-9005-gus", "project"))).result?.ok, true);
t("and whoami reports the full set rather than the row",
  (await GET(`op=whoami&${GUS}`)).result?.capabilities, ["contribute", "create_projects", "publish"]);

console.log("\n--- op=whoami, so an interface can hide what it must hide ---");
const who = await GET(`op=whoami&${SAM}`);
t("a session reports its capabilities", who.result?.capabilities, ["contribute"]);
t("and who it is", who.result?.member, "sam");
const whoMachine = await GET("op=whoami&token=t-member-1");
t("a machine credential holds NO capabilities, reported as null rather than empty",
  whoMachine.result?.capabilities, null);
t("and is not a session", whoMachine.result?.session, false);

console.log("\n--- 1.3: declared by the member, confirmed by an administrator, gating nothing ---");
{
  /* The member's own statement. Addressed to themselves and to nobody else,
     because the control plane stamps memberId from the session. */
  t("a member declares what they hold",
    (await POST(`op=expertisedeclare&${SAM}`, { label: "CPA" })).result?.state, "declared");
  t("and it starts unconfirmed",
    (await GET(`op=expertiselist&memberId=sam&${SAM}`)).result?.expertise?.[0]?.confirmed, false);
  t("a caller cannot declare on someone ELSE's behalf: the stamp overwrites it",
    (await POST(`op=expertisedeclare&${SAM}`, { memberId: "vera", label: "Lawyer" })).result?.memberId, "sam");
  t("so vera has none", (await GET(`op=expertiselist&memberId=vera&${SAM}`)).result?.expertise?.length, 0);

  t("an ordinary member cannot confirm, not even their own",
    (await POST(`op=expertiseconfirm&${SAM}`, { memberId: "sam", label: "CPA" })).result?.reason, "ADMIN_ONLY");
  /* An administrator cannot INTRODUCE a label. Confirming something never
     declared would make this an assignment rather than a confirmation, which is
     the whole distinction 1.3 rests on. */
  t("an administrator cannot confirm what was never declared",
    (await POST(`op=expertiseconfirm&${RUTH}`, { memberId: "sam", label: "Neurosurgeon" })).result?.reason,
    "NOT_DECLARED");
  t("but can confirm what was", (await POST(`op=expertiseconfirm&${RUTH}`, { memberId: "sam", label: "CPA" })).result?.confirmed, true);
  t("recorded against the administrator who vouched",
    (await GET(`op=expertiselist&memberId=sam&${SAM}`)).result?.expertise?.[0]?.by, "ruth");

  /* 4.9: an administrator may confirm for another administrator. Vouching for
     someone is the same act whoever they are. */
  await POST(`op=expertisedeclare&${GUS}`, { label: "Barber" });
  t("an administrator confirms for another administrator",
    (await POST(`op=expertiseconfirm&${RUTH}`, { memberId: "gus", label: "Barber" })).result?.confirmed, true);

  /* Withdrawal SUPERSEDES rather than overwrites. */
  t("withdrawal is recorded",
    (await POST(`op=expertiseconfirm&${RUTH}`, { memberId: "sam", label: "CPA", withdraw: true })).result?.state,
    "withdrawn");
  const hist = (await GET(`op=expertiselist&memberId=sam&${SAM}`)).result?.expertise?.[0];
  t("the current state is withdrawn", hist?.confirmed, false);
  t("and the earlier confirmation is STILL READABLE, not overwritten",
    hist?.history?.map((h) => h.event), ["declared", "confirmed", "withdrawn"]);

  /* D-51. v1.4 let an administrator ASSIGN expertise when creating the
     invitation, which v2 1.3 forbids: an administrator who can introduce the
     label is assigning rather than confirming. Refused, not ignored, because
     silently dropping a caller's argument is how two copies of the same fact
     drift apart. */
  t("expertise cannot be assigned at invitation time any more",
    (await POST("op=memberadd&token=t-admin-1",
      { memberId: "zed", cover: "cover zed", expertise: ["CPA"] })).result?.reason,
    "EXPERTISE_IS_NOT_ASSIGNED");
  /* And the roster serves the live table rather than the dead column. */
  t("the roster reports expertise from the table that is actually maintained",
    (await GET("op=memberlist&token=t-admin-1")).result?.members
      ?.find((m) => m.member_id === "gus")?.expertise?.[0]?.label, "Barber");

  /* THE LOAD-BEARING NEGATIVE. An unconfirmed or withdrawn entry must cost its
     holder nothing at all: 1.3 says it informs humans and gates nothing. */
  t("sam's capabilities are untouched by any of that",
    (await GET(`op=whoami&${SAM}`)).result?.capabilities, ["contribute"]);
  t("and he can still promote exactly as before",
    (await POST(`op=promote&${SAM}`, bundle("INFO-2026-9010-sam"))).result?.ok, true);
}

console.log("\n--- 8.1: full export needs the ROOT OF TRUST, not in-app administrator status ---");
/* The whole difficulty section 8 names: a full working-corpus export is the
   group's entire unpublished position, so if any administrator can take it, one
   captured administrator exfiltrates everything and the export feature becomes
   the most efficient attack in the system.
   THE SHARP READING: "the ADMIN_TOKEN-class credential" is not satisfied by a
   SESSION belonging to an administrator. A session is a password-derived
   credential; the root of trust is the token set in the hosting dashboard. So a
   stolen password must not reach this, and neither must the founder's own
   signed-in browser. */
t("an ordinary member session cannot export",
  (await GET(`op=export&${SAM}`)).error !== undefined || (await GET(`op=export&${SAM}`)).reason !== undefined, true);
t("an in-app ADMINISTRATOR session cannot export either",
  (await GET(`op=export&${RUTH}`)).reason, "ROOT_OF_TRUST_REQUIRED");
t("nor can the FOUNDER's session, which is above the membership model everywhere else",
  (await GET(`op=export&${FOUNDER}`)).reason, "ROOT_OF_TRUST_REQUIRED");
t("nor a member-class machine credential",
  (await GET("op=export&token=t-member-1")).error, "forbidden for token class");
const ex = await GET("op=export&token=t-admin-1");
t("ADMIN_TOKEN itself can", ex.result?.ok, true);
t("and the export carries a manifest of every bundle", Array.isArray(ex.result?.bundles), true);
t("with a hash for every file", ex.result?.bundles?.every((b) => b.files.every((f) => typeof f.sha256 === "string")), true);

console.log("\n--- 8.1: an export can never happen silently ---");
{
  const log = await GET("op=exportlog&token=t-admin-1");
  t("the export is recorded", log.result?.exports?.length >= 1, true);
  t("with what it covered", typeof log.result?.exports?.[0]?.bundles, "number");
  /* Visible to in-app administrators, who cannot RUN it but must be able to SEE
     that it happened. An export a captured root of trust could take unnoticed
     would defeat the recording. */
  t("and an in-app administrator can read the log even though they cannot export",
    (await GET(`op=exportlog&${RUTH}`)).result?.exports?.length >= 1, true);
}

console.log("\n--- 8.2: published-record reconstruction requires nothing at all ---");
{
  const pub = await GET("op=publishedmanifest");
  t("no credential is needed", pub.result?.ok, true);
  t("it answers with content-addressed hashes", Array.isArray(pub.result?.published), true);
  /* NOTHING UNPUBLISHED MAY APPEAR HERE. The whole safety of an open endpoint is
     that it reads the published projection and never the working corpus. */
  t("and nothing from the working corpus leaks into it",
    pub.result?.published?.some((r) => String(r.bundle_id || "").includes("9001")), false);
}

console.log("\n--- structural: no mutating session op may go unmentioned ---");
/* Standing lesson 2. A later addition must not pass by not being named, so the
   table is read out of the source and every mutating op a session can reach
   must have an entry, including the ones that need nothing, which are written
   as an explicit null with their reason. */
const src = readFileSync(SRC, "utf8");
const blockOf = (name) => {
  const i = src.indexOf(`const ${name} = {`);
  return i < 0 ? null : src.slice(i, src.indexOf("\n};", i));
};
const opsBlock = blockOf("OPS"), needsBlock = blockOf("NEEDS"), sessBlock = blockOf("SESSION_OPS");
t("the capability table exists", typeof needsBlock, "string");
/* The denominator is what a SESSION can reach, not every mutating op. Ops like
   `purge`, `reproject` and `enroll` are mutating and are governed by the class
   ACL or by being unauthenticated; capabilities never apply to them because
   there is no member behind the caller. */
const mutating = new Set([...(opsBlock ?? "").matchAll(/^\s{2}([a-z]+):\s*\{[^}]*mutating:\s*true/gm)].map(m => m[1]));
/* SESSION_OPS builds its sets with spreads (...EDGE_ACTIONS, ...PROJECT_ACTIONS,
   ...RETRIEVAL_READS), so reading quoted literals out of that block alone counts
   LESS than the table actually contains and the check would silently pass for
   ops it never looked at. Standing lesson 6. Resolve each spread against the
   const it names. */
const listOf = (name) => {
  const m = src.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/"([a-z]+)"/g)].map(x => x[1]) : [];
};
const sessNames = new Set([...(sessBlock ?? "").matchAll(/"([a-z]+)"/g)].map(m => m[1]));
for (const sp of [...(sessBlock ?? "").matchAll(/\.\.\.([A-Z_]+)/g)].map(m => m[1]))
  for (const o of listOf(sp)) sessNames.add(o);
/* Corrected 2026-08-03 (REC-20): `reachable` was sessNames ∩ mutating, which
   was an accurate proxy for "a session can reach this op" only while every
   capability-table entry was mutating. SESSION_OPS gates MUTATING ops alone
   (index.mjs: `if (spec.mutating && !SESSION_OPS[kind].has(op))`), so a
   NON-mutating op is reachable by every session of a permitted class and
   appears in SESSION_OPS nowhere. op=queue is the first read to declare its
   capability in the table — `null`, stated rather than omitted, so REC-19's
   totality guard can see the op is a named NON_ACT — and the old computation
   would have reported it as a table entry no session can reach, which is the
   opposite of true. The RULE is unchanged: the capability table may name
   nothing unreachable. Only the measurement of "reachable" is repaired, and it
   is repaired for the SECOND assertion only: the first still requires every
   session-reachable MUTATING op to be named, which is the obligation — a read
   may be named or omitted, a mutating act may not be omitted. */
const reachable = [...sessNames].filter(o => mutating.has(o));
/* Reads a session can reach: non-mutating and permitted to a member or admin
   class. SESSION_OPS never mentions them because it gates nothing they do. */
const readable = new Set([...(opsBlock ?? "").matchAll(/^\s{2}([a-z]+):\s*\{([^}]*)\}/gm)]
  .filter(m => !/mutating:\s*true/.test(m[2]) && /"(admin|member)"/.test(m[2]))
  .map(m => m[1]));
const anyReachable = new Set([...reachable, ...readable]);
const named = new Set([...(needsBlock ?? "").matchAll(/^\s{2}([a-z]+):/gm)].map(m => m[1]));
t("there are session-reachable mutating ops to check", reachable.length > 8, true);
t("every one of them is named in the capability table", reachable.filter(o => !named.has(o)), []);
t("and the table names nothing a session cannot reach", [...named].filter(o => !anyReachable.has(o)), []);

await mf.dispose();
console.log(`\ncapability: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
