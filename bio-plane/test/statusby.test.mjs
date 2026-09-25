/* NEGATIVE CONTROL: (run 2026-09-25, WORKER D-610, branch land/worker/D-610, base 5e8a65a83) each arm armed ALONE on src/store.mjs by an exact-anchor edit that must match once (every arm matched 1), and restored by cp from a uniquely-named per-arm pristine copy, verified by sha256 (b4e41ac6e516… every arm) AND cmp (identical, 3,472,503 B, floor 1,000,000). DECLARED BEFORE ARMING, and every arm came back AS DECLARED: (a) `baseline` — 17/0. (b) `enroll-unstamped`, THE ROW'S OWN CONTROL: `status_by` dropped from `enroll`'s UPDATE alone -> 12/5, failing BY NAME the census's "EVERY writer of members.status also writes status_by", §2's fixture (ruth and gus read `class:admin`, the bearer that invited them), "3c ENROLMENT names the enrolling member" (bea reads ruth), "4c dan's enrolment names dan" (reads gus) and "5b ruth's vote does not carry" (dan reads gus) — the live false attribution D-610 names, every other arm green. (c) `endorse-unstamped` -> 15/2: the census and 4b (dan reads ruth, the proposer). (d) `remove-unstamped` (the member row only) -> 15/2: the census and 5c (dan reads dan). (e) `cascade-unstamped` (the signer cascade only) -> 16/1: 5d (the key reads ruth) — the census does not see `signers`, and says so by construction. (f) `add-unstamped` (the ordinary invitation INSERT) -> 14/3: the census, 3a and 3b. (g) `overstrict` (required): `enroll`'s statement respelled `status_by = ?,status='active', …` with its arguments reordered — correct work the census did not anticipate -> 17/0, GREEN. PRE-ITEM TRACE: this suite over origin/main's store.mjs (5e8a65a83) -> 6/11, every transition arm failing by name (3a..5d, the fixture, the census), restored byte-identical.
 * =========================================================================
 * D-610 — EVERY WRITER OF `members.status` NAMES THE ACTOR WHOSE ACT CAUSED THAT TRANSITION.
 *
 * THE RULING is BOB #35's, 2026-09-25 04:00Z, on D-134's question, folded into
 * `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9's REC-159 paragraph (land/bob/batch-0925c):
 * *"EVERY writer of `members.status` writes `status_by`, naming the actor whose act caused THAT
 * transition — enrolment the enrolling member; an invitation the inviter (`memberadd`, the ordinary path
 * and the second administrator's alike); a §4.7 endorsement or removal the administrator whose vote
 * COMPLETED it; a re-invitation or revocation its stamped actor."*
 *
 * THE DEFECT, measured by BOB #35 at 964da679: REC-159 stamped `status_by` at `memberset` alone, and three
 * other writers — `adminEndorse`'s re-invitation, `adminRemove`'s revocation, `enroll`'s activation — left
 * the column as they found it; `memberAdd`'s two INSERTs wrote none. So a row whose status one actor set
 * read a LATER status under that actor's name: the record claiming an attribution it does not hold.
 *
 * HOW A LIAR PASSES THE ACCEPTS-WHEN, stated before what is checked: by asserting only that `status_by`
 * is NON-EMPTY, or equal to a value it already held. Every transition below is therefore driven so that
 * the actor who caused it DIFFERS from the one the row carried before it — enrolment follows ruth's
 * invitation, gus's endorsement follows ruth's proposal, gus's carrying vote follows dan's enrolment — so
 * an unstamped writer reads back the PREVIOUS actor and fails by name, never a coincidence.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE:
 *   - IT CAN SEE every transition through the REAL control plane, read back from `op=memberlist` and
 *     `op=signerlist`, in `scratch` (named on every call, D-325).
 *   - IT CAN SEE a NEW writer of `members.status` appear in `store.mjs` without `status_by` (§1's census).
 *     IT CANNOT SEE a writer that builds its SQL other than as one template literal naming `members`, and
 *     the census prints what it found so a reader can check the count.
 *   - IT CANNOT SEE a row written before D-610, and must not: such rows read as they are (never
 *     back-filled). The stated absence is driven where it honestly arises — a store-direct write with no
 *     stamp — and reads `not recorded`.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const IDX_SRC = readFileSync(IDX, "utf8");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "latin1");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ============================================ 1. THE CENSUS: every writer, by the column
 * Every template literal in store.mjs that INSERTs into or UPDATEs `members` and names the `status`
 * column. Each must also name `status_by`. Printed, and floored: a census over nothing passes. */
console.log("\n--- 1. census: every statement in store.mjs that writes members.status ---");
const stmts = [...STORE_SRC.matchAll(/`((?:INSERT(?: OR [A-Z]+)? INTO|UPDATE) members\b[^`]*)`/g)].map((m) => m[1]);
const writers = stmts.filter((q) => q.startsWith("UPDATE")
  ? /\bSET\b[\s\S]*\bstatus\s*=/.test(q)
  : /\(\s*[^)]*\bstatus\b[^)]*\)/.test(q));
for (const q of writers) console.log(`  ${/\bstatus_by\b/.test(q) ? "stamps " : "BARE   "} ${q.replace(/\s+/g, " ").slice(0, 110)}`);
console.log(`  ${stmts.length} statements write members; ${writers.length} of them write status`);
t("the census found the seven writers of members.status D-610 measured (memberAdd ×2, adminEndorse, "
+ "adminRemove, enroll, memberSet ×2) — a floor, so an empty parse is not a clean one",
  writers.length >= 7, true);
t("EVERY writer of members.status also writes status_by (the unstamped writers are listed)",
  writers.filter((q) => !/\bstatus_by\b/.test(q)).map((q) => q.replace(/\s+/g, " ").slice(0, 80)), []);

/* ============================================================== 2. FIXTURE */
const clsStart = IDX_SRC.indexOf("async function classify(token, env) {");
const clsBody = clsStart < 0 ? "" : IDX_SRC.slice(clsStart, IDX_SRC.indexOf("\n}", clsStart));
const BINDINGS = [...clsBody.matchAll(
  /token === env\.([A-Z_]+) && \(await liveToken\(env\.\1\)\)\) return "([a-z]+)"/g)].map((m) => ({ binding: m[1], cls: m[2] }));
const TOKEN_OF = Object.fromEntries(BINDINGS.map((b) => [b.cls, `${b.cls}-d610-${b.binding.toLowerCase()}`]));
t("classify() parsed to its env bindings and the operator's `admin` is among them", !!TOKEN_OF.admin, true);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ...Object.fromEntries(BINDINGS.map((b) => [b.binding, TOKEN_OF[b.cls]])), VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (store, path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName(store)).fetch(`http://do/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
const ADM = TOKEN_OF.admin;
/* D-325: `store=scratch` NAMED ON EVERY CALL. Sessions resolve against `bio`, so the two administrators
   are enrolled in BOTH stores (adminvote.test.mjs's fixture) and every act addresses `scratch`. */
const S = "&store=scratch";
const PW = (id) => `${id}-passphrase-d610`;

const enrolBoth = async (memberId) => {
  for (const st of ["", S]) {
    const add = await POST(`op=memberadd&token=${ADM}${st}`, { memberId, cover: `cover for ${memberId}`, role: "admin" });
    if (!add?.invite) throw new Error(`memberadd ${memberId}${st}: ${JSON.stringify(add)}`);
    const en = await POST(`op=enroll${st}`, { invite: add.invite, handle: memberId, password: PW(memberId) });
    if (!en?.ok) throw new Error(`enroll ${memberId}${st}: ${JSON.stringify(en)}`);
  }
  const lg = await POST("op=login", { role: `member:${memberId}`, password: PW(memberId) });
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return `token=${lg.token}`;
};
const RUTH = await enrolBoth("ruth");
const GUS = await enrolBoth("gus");

const rowOf = async (id) => ((await POST(`op=memberlist&token=${ADM}${S}`))?.members || [])
  .find((m) => m.member_id === id) || null;
const keyRow = async (k) => ((await POST(`op=signerlist&token=${ADM}${S}`))?.signers || [])
  .find((r) => r.key_b64 === k) || null;
const sb = async (id) => { const r = await rowOf(id); return [r?.status, r?.status_by]; };

console.log("\n--- 2. the fixture ---");
t("ruth and gus are the two active administrators in scratch, and each one's `active` is her or his OWN "
+ "enrolment — not the `class:admin` bearer that invited them",
  [await sb("ruth"), await sb("gus")], [["active", "ruth"], ["active", "gus"]]);

/* ========================================= 3. INVITATION, then ENROLMENT (the row's own arm) */
console.log("\n--- 3. an invitation names the inviter; enrolment names the member ---");
const bear = await POST(`op=memberadd&token=${ADM}${S}`, { memberId: "ana", cover: "the bearer's invitee", role: "member" });
t("3a memberadd by the operator's `admin` bearer: `ana` is invited, and the row names the CREDENTIAL, "
+ "`class:admin`, never a person",
  [bear?.ok, ...(await sb("ana"))], [true, "invited", "class:admin"]);
const bea = await POST(`op=memberadd&${RUTH}${S}&by=gus`, { memberId: "bea", cover: "ruth's invitee", role: "member", by: "gus" });
t("3b memberadd by ruth's session: `bea` is invited under ruth, not the gus she sent",
  [bea?.ok, ...(await sb("bea"))], [true, "invited", "ruth"]);
const beaIn = await POST(`op=enroll${S}`, { invite: bea?.invite, handle: "bea", password: PW("bea") });
t("3c ENROLMENT names the enrolling member: bea is active and `status_by` is bea — ruth did not set this status",
  [beaIn?.ok, ...(await sb("bea"))], [true, "active", "bea"]);

/* ============================== 4. A §4.7 ADDITION: proposal, the completing endorsement, enrolment */
console.log("\n--- 4. a §4.7 addition: the proposer, then the administrator whose vote completed it ---");
const prop = await POST(`op=memberadd&${RUTH}${S}`, { memberId: "dan", cover: "the third", role: "admin" });
t("4a ruth proposes dan as an administrator: `proposed`, under ruth, gus awaited",
  [prop?.reason, prop?.awaiting, ...(await sb("dan"))], ["CONSENSUS_REQUIRED", ["gus"], "proposed", "ruth"]);
const endorse = await POST(`op=adminendorse&${GUS}${S}`, { memberId: "dan" });
t("4b gus's endorsement COMPLETES the consensus: dan is invited and `status_by` is gus, not ruth the proposer",
  [endorse?.ok, ...(await sb("dan"))], [true, "invited", "gus"]);
const danIn = await POST(`op=enroll${S}`, { invite: endorse?.invite, handle: "dan", password: PW("dan") });
t("4c dan's enrolment names dan", [danIn?.ok, ...(await sb("dan"))], [true, "active", "dan"]);

/* ======================================== 5. A §4.7 REMOVAL and its cascade onto the member's key */
console.log("\n--- 5. a §4.7 removal: the administrator whose vote CARRIED it, on the row and on the key ---");
const KEY_DAN = "AAAAC3NzaC1lZDI1NTE5AAAAId610ruthregistersdan";
const kAdd = await POST(`op=signeradd&${RUTH}${S}`, { keyB64: KEY_DAN, memberId: "dan", comment: "d-610" });
t("5a ruth registers a key for dan, under ruth",
  [kAdd?.ok, (await keyRow(KEY_DAN))?.status, (await keyRow(KEY_DAN))?.status_by], [true, "active", "ruth"]);
const v1 = await POST(`op=adminremove&${RUTH}${S}`, { memberId: "dan", reason: "d-610 fixture" });
t("5b ruth's vote does not carry (2 of 3 needed): dan stays active under his own enrolment",
  [v1?.reason, ...(await sb("dan"))], ["VOTES_SHORT", "active", "dan"]);
const v2 = await POST(`op=adminremove&${GUS}${S}`, { memberId: "dan", reason: "d-610 fixture" });
t("5c gus's vote CARRIES the removal: dan is revoked and `status_by` is gus",
  [v2?.ok, v2?.removed, ...(await sb("dan"))], [true, true, "revoked", "gus"]);
t("5d the cascade onto dan's key names the same actor: revoked, `status_by` gus — not ruth who registered it",
  [(await keyRow(KEY_DAN))?.status, (await keyRow(KEY_DAN))?.status_by], ["revoked", "gus"]);

/* ======================================================== 6. memberset, unchanged (REC-159) */
console.log("\n--- 6. memberset (REC-159's, unchanged): each set names its own setter ---");
await POST(`op=memberset&${RUTH}${S}`, { memberId: "bea", status: "revoked" });
t("6a ruth revokes bea: `status_by` ruth, replacing bea's own", await sb("bea"), ["revoked", "ruth"]);
await POST(`op=memberset&${GUS}${S}`, { memberId: "bea", status: "active" });
t("6b gus reactivates bea: `status_by` gus", await sb("bea"), ["active", "gus"]);

/* ================================================ 7. the stated absence, never back-filled */
console.log("\n--- 7. no stamp, no attribution: `not recorded` ---");
await DO("scratch", "memberadd", { memberId: "nos", cover: "no plane in front", role: "member", by: "ruth" });
t("7 a store-direct invitation with NO stamp reads `not recorded` — the body's `by` is never taken",
  await sb("nos"), ["invited", "not recorded"]);

await mf.dispose();
console.log(`\nstatusby: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
