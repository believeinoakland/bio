/* NEGATIVE CONTROL: (run 2026-07-31) neuter the ANONYMOUS_LEASE guard in acquireLease (guard the null/blank-actor refusal with `false`) so an anonymous write is admitted -> 2 assertions fail (an anonymous lease must be refused by name); restored, 22 pass. */
/* REC-2 / D-61: an unattended (machine) writer can complete a capture a member
 * walked away from, and is NAMED on the record rather than anonymous.
 *
 * Negative-control detail: neuter the ANONYMOUS_LEASE guard in acquireLease (guard the null/blank-actor refusal with `false`) so an anonymous write is admitted -> 2 assertions fail (an anonymous lease must be refused by name); restored, 22 pass.
 *
 * DECISION — option (a), a named machine actor identity on the lease, NOT option
 * (b), dropping the lease from the refill path. The lease is a courtesy lock and
 * promote's CAS on `base` is the real integrity mechanism; both options leave the
 * CAS untouched, but (a) keeps the courtesy lock in the loop for the daemon (a
 * returning member sees the job is being finished; two daemons do not both
 * re-fetch) and names the writer, while (b) discards that coordination signal for
 * no gain. Naming needs no schema change: `leases.actor` is already TEXT NOT NULL
 * and `token:<class>` is a valid actor, so I5 is unchanged.
 *
 * The two enforcement points this suite drives:
 *   1. the control plane (index.mjs) stamps the lease `actor` AND the promote
 *      `author` server-side for a machine credential as `token:<class>` — a NAMED
 *      machine identity, caller value deleted — so a daemon can take the lock and
 *      the manifest names it;
 *   2. the store (store.mjs acquireLease) refuses a null/blank actor BY NAME
 *      (ANONYMOUS_LEASE) instead of tripping SQLITE_CONSTRAINT_NOTNULL, so a
 *      writer that will not name itself fails closed.
 *
 * NEGATIVE CONTROL: neuter the null/blank-actor guard at the top of acquireLease
 * (store.mjs) so a null actor falls through -> the two "refused with a named BIO
 * reason (ANONYMOUS_LEASE)" assertions in Part B fail (reason is undefined: the
 * INSERT trips the NOT NULL constraint and the store answers with no named
 * reason — the D-39 platform-error shape the guard exists to close). RUN
 * 2026-07-31: Part B went 20 pass / 2 fail; guard restored, 22/22 green.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ============================================================================
 * Part A — through the control plane: a session starts a capture, a machine
 * credential (the daemon) finishes it, and the manifest names the machine.
 * ==========================================================================*/
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mfW = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});
const GET = async (q) => (await mfW.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mfW.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body) })).json();
const PUT = async (q, bytes) => (await mfW.dispatchFetch("http://x/api/?" + q,
  { method: "PUT", body: bytes })).json();

console.log("\n--- a member starts an intake under a session ---");
/* Ruth is the second member of the group, so she is an administrator (the first
   invitation creates a second administrator); an admin session still holds a
   contribute capability and is `viaSession`, which is all this needs. */
const add = await POST("op=memberadd&token=t-admin-1", { memberId: "ruth", cover: "the CPA from Tuesday", role: "admin" });
t("admin creates a member", add.result.ok, true);
const en = await POST("op=enroll", { invite: add.result.invite, handle: "ruth", password: "ruth-passphrase-1" });
t("enrollment succeeds", en.result.ok, true);
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
t("member logs in to a session", lg.result.ok, true);
const S = "token=" + lg.result.token;

const id = (await GET(`op=allocid&prefix=INFO&year=2026&${S}`)).result.id;
const md0 = `---\nid: ${id}\nobject_type: information\ntitle: "Walked-away capture"\ncurrent_state: collected\ncreated: "2026-07-31T00:00:00Z"\nlast_updated: "2026-07-31T00:00:00Z"\n---\n\n## Summary\n\nintake begun by ruth, evidence not yet captured\n`;
/* The session STARTS the capture: it creates the bundle. A creation writes no
   manifest author entry (author lands on the next promotion), which is exactly
   the walked-away state — the member began the work and left before the bytes
   were fetched. */
const cre = await POST(`op=promote&${S}`, {
  bundleId: id, base: null, snapKey: "20260731T000000Z_start001",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Walked-away capture", current_state: "collected", created: "2026-07-31T00:00:00Z", last_updated: "2026-07-31T00:00:00Z" },
  files: [{ path: "bundle.md", text: md0, bytes: md0.length, sha256: sha(md0) }], register: [] });
t("the session creates the bundle", cre.result.ok, true);
const startSha = cre.result.bundleSha;

console.log("\n--- the daemon (a machine credential) finishes it, and is NAMED ---");
/* The daemon runs under MEMBER_TOKEN — a machine credential, no member behind it.
   It supplies actor=IMPOSTOR to prove the server overwrites it. */
const dLease = await GET(`op=lease&id=${id}&actor=IMPOSTOR&token=t-member-1`);
t("a machine credential CAN take the lease (D-61: it no longer crashes)", dLease.result.ok, true);
t("and the lease names the machine, not the caller-claimed actor", dLease.result.actor, "token:member");
t("the edit base is the live sha the CAS will check", dLease.result.base, startSha);

/* The daemon captures the bytes and completes: it registers the capture and
   writes the completed manifest, carrying bundle.md forward. */
const cap = new Uint8Array(512).map((_, i) => i & 0xff);
const capSha = sha(Buffer.from(cap));
t("the daemon stores the captured bytes", (await PUT(`op=capture&sha256=${capSha}&token=t-member-1`, cap)).ok, true);
const md1 = md0.replace("evidence not yet captured", "evidence captured and hashed");
const done = await POST(`op=promote&author=IMPOSTOR&token=t-member-1`, {
  bundleId: id, base: startSha, snapKey: "20260731T010000Z_finish01",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Walked-away capture", current_state: "collected", created: "2026-07-31T00:00:00Z", last_updated: "2026-07-31T01:00:00Z" },
  files: [
    { path: "bundle.md", text: md1, bytes: md1.length, sha256: sha(md1) },
    { path: "snapshots/doc.bin", blobSha: capSha, bytes: cap.length, sha256: capSha },
  ],
  register: [{ path: "snapshots/doc.bin", sha256: capSha, bytes: cap.length, encoding: "binary" }] });
t("the machine credential completes the capture the session started", done.result.ok, true);

const img = await GET(`op=image&id=${id}&token=t-admin-1`);
const man = JSON.parse(img.result["_history/manifest.json"]);
const startEntry = man.entries.find((e) => e.key === "20260731T000000Z_start001");
const finishEntry = man.entries.find((e) => e.key === "20260731T010000Z_finish01");
t("the manifest holds both the start and the completion", man.entries.length, 2);
t("the start is attributed to the member's session", startEntry.author, "ruth");
t("and the completion NAMES the machine writer — not the caller-claimed author, not a person, not blank",
  finishEntry.author, "token:member");
t("the completion is a promotion the capture rides on", finishEntry.kind, "promotion");

console.log("\n--- the lease is a courtesy lock; the CAS is what protects integrity ---");
/* The daemon holds the lease as token:member, so a session for a DIFFERENT actor
   is refused — the machine lease is a real, named lock, not a no-op. */
const ruthTry = await GET(`op=lease&id=${id}&${S}`);
t("a session is refused while the machine holds the lease", ruthTry.result.ok, false);
t("and the refusal names the machine as the holder", ruthTry.result.heldBy, "token:member");
/* And the lease does not gate the write: promote refuses a STALE base regardless
   of who holds the lease. startSha is now stale (the daemon advanced it), so a
   second write anchored on it is refused by the CAS, not by the lease. This is
   the integrity mechanism the decision was careful not to weaken. */
const stale = await POST(`op=promote&token=t-member-1`, {
  bundleId: id, base: startSha, snapKey: "20260731T020000Z_stale001",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Walked-away capture", current_state: "collected", created: "2026-07-31T00:00:00Z", last_updated: "2026-07-31T02:00:00Z" },
  files: [{ path: "bundle.md", text: md1, bytes: md1.length, sha256: sha(md1) },
          { path: "snapshots/doc.bin", blobSha: capSha, bytes: cap.length, sha256: capSha }],
  register: [] });
t("a stale-base completion is refused by the CAS, not by the lease", stale.result.reason, "CAS_STALE");

/* ============================================================================
 * Part B — NEGATIVE CONTROL, at the store: an anonymous lease is refused by name.
 * The control plane always stamps an actor, so the only way to reach the store
 * with no actor is to call it directly — which is exactly what a bypass of the
 * stamp would look like. A named actor still works, so the guard is not vacuous.
 * ==========================================================================*/
console.log("\n--- an anonymous write is refused (the negative-control subject) ---");
/* Release the worker's workerd before standing up the store's, so the two do not
   contend — one live Miniflare at a time. */
await mfW.dispose();
const STO = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mfS = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: STO, script: readFileSync(STO, "utf8"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await mfS.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json();

const bid = "INFO-2026-0002-x";
const bmd = `---\nid: ${bid}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nseed\n`;
const seed = await call("/promote", {
  bundleId: bid, base: null, snapKey: "20260731T000000Z_seedseed", author: "seed",
  meta: { object_type: "information", group: "believe-in-oakland", title: "seed", current_state: "collected", created: "2026-07-31T00:00:00Z", last_updated: "2026-07-31T00:00:00Z" },
  files: [{ path: "bundle.md", text: bmd, bytes: bmd.length, sha256: sha(bmd) }], register: [] });
t("store seed created", seed.result.ok, true);

/* The guard is not vacuous: a NAMED actor still takes the lease. */
const named = await call(`/lease?id=${bid}&actor=token:member`);
t("a named machine actor takes the lease at the store", named.result.ok, true);
t("and is recorded under that name", named.result.actor, "token:member");

/* Anonymous — a null actor — is refused BY NAME, not by a SQLite constraint
   crash (the D-39 class the guard closes). */
const anon = await call(`/lease?id=${bid}`);
t("an anonymous lease (no actor) is refused", anon.result.ok, false);
t("and refused with a named BIO reason, not a platform error", anon.result.reason, "ANONYMOUS_LEASE");

/* Blank / whitespace is anonymous too. */
const blank = await call(`/lease?id=${bid}&actor=${encodeURIComponent("   ")}`);
t("a blank actor is anonymous and refused", blank.result.reason, "ANONYMOUS_LEASE");

await mfS.dispose();
console.log(`\nunattended-lease: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
