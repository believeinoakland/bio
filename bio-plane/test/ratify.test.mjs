/* NEGATIVE CONTROL: (run 2026-07-31) disable the SSHSIG allowed-key check in verifySshsig (guard `!allowed.includes(p.pubB64)` with `false`, so any self-consistent signature is accepted regardless of signer) -> 3 assertions fail (the unknown-key and revoked-signer refusals); restored, 35 pass. */
/* Ratification through the gate, the published fence, and doorbell 7a.
 *
 * Negative-control detail: disable the SSHSIG allowed-key check in verifySshsig (guard `!allowed.includes(p.pubB64)` with `false`, so any self-consistent signature is accepted regardless of signer) -> 3 assertions fail (the unknown-key and revoked-signer refusals); restored, 35 pass.
 *
 * The attestation signatures in this suite are produced by stock
 * ssh-keygen, not by BIO code, so the suite proves the plane accepts
 * exactly what a member's own machine produces. Negative controls are
 * load-bearing: the unknown key, the stale sha, the tampered statement,
 * the revoked signer, and the gate refusals each demand a specific
 * refusal, not an absence of success.
 *
 * Every assertion here signs a real `bio-ratify` statement with stock
 * ssh-keygen; there is no honest way to run a subset without it. So when
 * ssh-keygen is not on PATH the suite SKIPS LOUDLY WITH A NAMED REASON and
 * exits 0, rather than dying with an unhandled spawn error (D-93: that death,
 * under the old `&&` chain, hid every suite behind it). It never quietly does
 * less: it either runs in full or names exactly why it did not.
 *
 * NEGATIVE CONTROL: remove the ssh-keygen guard below and hide ssh-keygen from
 * PATH -> the suite dies mid-run on the first execFileSync and the battery
 * reports `FAIL ratify.test.mjs ... assertions unknown` — a bare failure with
 * no named reason, instead of the loud named skip. (Run 2026-07-31, M0-4:
 * without the guard, `PATH=/nonexistent node scripts/battery.mjs ratify` gave
 * `FAIL ... assertions unknown`; with it, `skip ... SKIPPED — ssh-keygen not on
 * PATH`.)
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
/* D-431: the bundle this suite ratifies is made EVIDENCE OF A RATIFIED CASE (Publication rule 2). */
import { restOnARatifiedCase } from "./ratified-evidence.mjs";

/* Detect stock ssh-keygen before Miniflare spins up or any key is generated.
   spawnSync sets `.error` (ENOENT) only when the binary cannot be spawned at
   all, which is exactly "not on PATH"; a non-zero exit for the bare `-Q` usage
   does not. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- ratify ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("ratify: SKIPPED — ssh-keygen not on PATH; every assertion signs a real "
    + "bio-ratify statement with stock ssh-keygen and cannot run without it");
  process.exit(0);
}

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ratify", MEMBER_TOKEN: "mem-ratify", PROBE_TOKEN: "prb-ratify", VERSION: "test" },
}));

const sha = (b) => createHash("sha256").update(b).digest("hex");
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })).json();
const PUT = async (q, bytes) => (await mf.dispatchFetch("http://x/api/?" + q, { method: "PUT", body: bytes })).json();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Two real keys: sparky (registered) and stranger (never registered). */
const dir = mkdtempSync(join(tmpdir(), "ratify-"));
for (const k of ["sparky", "stranger"])
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", k, "-f", join(dir, k), "-q"]);
const keyB64 = (k) => readFileSync(join(dir, k + ".pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (k, bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, k), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

/* ---- roster: a member with a registered key ---- */
/* Sparky is the SECOND member of this group, so 4.2 requires an administrator:
   the first invitation a group issues creates a second administrator, and there
   are no ordinary members until two exist. Enrolment now also takes a HANDLE,
   which is the name the record shows (Membership Architecture 3). */
const add = await POST("op=memberadd&token=adm-ratify", { memberId: "sparky", cover: "Bob", role: "admin" });
await POST("op=enroll", { invite: add.result.invite, handle: "sparky", password: "sparky-passphrase" });
const reg = await POST("op=signeradd&token=adm-ratify", { keyB64: keyB64("sparky"), memberId: "sparky", comment: "sparky laptop" });
/* REC-125 / D-421 (IC-137): RE-POINTED, NEVER EXEMPTED. Every ratification in
   this suite used to be delivered by the ADMIN_TOKEN bearer ("adm-ratify")
   carrying sparky's signature, which was the operator's publication path as
   built. BOB #14 ruled that an ATTESTED act is delivered ONLY by the signing
   member's OWN AUTHENTICATED SESSION (Assistant & AI Roles §3 rule 4), so the
   bearer token is now refused by name (C-32.14) and this suite's subject — the
   signature, the gate, the published fence, doorbell 7a — is driven through
   sparky's own signed-in session instead. Nothing it asserts about any of that
   changed; the token only ever REACHED the surface, and the session is the
   credential that may reach it now. `operator-attest.test.mjs` owns the fence. */
const SESS = (await POST("op=login", { role: "member:sparky", password: "sparky-passphrase" })).result.token;
const RAT = `op=ratify&token=${SESS}`;

console.log("\n--- signer registration ---");
t("key registers", reg.result.ok, true);
t("garbage key refused", (await POST("op=signeradd&token=adm-ratify", { keyB64: "not-a-key", memberId: "sparky" })).result.reason, "BAD_KEY");
t("key for unknown member refused", (await POST("op=signeradd&token=adm-ratify", { keyB64: keyB64("stranger"), memberId: "ghost" })).result.reason, "NO_SUCH_MEMBER");

/* ---- a bundle with an inline data file and a registered capture ---- */
const capBytes = new Uint8Array(2048).map((_, i) => (i * 7) % 256);
const capSha = sha(capBytes);
t("capture bytes land", (await PUT(`op=capture&token=mem-ratify&sha256=${capSha}`, capBytes)).ok, true);

const ID = "INFO-2026-7001-ratify-target";
/* Conformant to the catalog, because plane-gate/1.0 runs the catalog. A minimal
   four-field frontmatter was fine against the four hand-written checks of 0.1
   and is refused by the real thing, which is the point of the upgrade. */
const NOW = "2026-07-24T00:00:00Z";
const mkMd = (n, id = ID, state = "collected") => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Ratify target"`, `current_state: ${state}`, "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `revision ${n}`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const dataJson = JSON.stringify({ probe: true }, null, 1);
const pkg = (n, base, snap) => {
  const md = mkMd(n);
  return {
    bundleId: ID, base, snapKey: snap, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Ratify target",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/probe.json", text: dataJson, bytes: dataJson.length, sha256: sha(dataJson) },
      { path: "snapshots/evidence.bin", blobSha: capSha, bytes: capBytes.length, sha256: capSha },
    ],
    register: [{ sha256: capSha, path: "snapshots/evidence.bin", encoding: "binary", bytes: capBytes.length }],
  };
};
const c1 = await POST("op=promote&token=mem-ratify", pkg(1, null, "20260724T100000Z_aaaa1111"));
t("target bundle created", c1.result.ok, true);
const c2 = await POST("op=promote&token=mem-ratify", { ...pkg(2, c1.result.bundleSha, "20260724T110000Z_bbbb2222") });
t("target bundle revised", c2.result.ok, true);
const LIVE = c2.result.bundleSha;
/* CORRECTED 2026-09-19 by the D-431 worker (BIO_Publication_v0_1.md §3 rule 2, the second note, BOB #16),
   at its site and not exempted. This suite ratified a LOOSE information bundle — one in no case — because
   that was how a signature, the gate, the published fence and doorbell 7a could be driven at all. That was
   publication OUTSIDE a case, which the ruling closes: anything that is not a finding crosses only as the
   EVIDENCE a ratified case's finding rests on, signed by an owner of that case's project (C-58.3 refuses
   the rest). So the bundle is made what the rule requires — a ratified case's finding, in a project sparky
   owns, rests on it — and NOTHING this suite asserts about its own subject moves: it is still an
   information bundle, in no case itself, publishing exactly its own parts and no container. */
const signAs = (k) => (text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, k), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const storeDO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return (await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, { method: "POST", body: JSON.stringify(body) })).json());
};
await restOnARatifiedCase({ post: POST, get: GET, doPost: storeDO, sha, promoteToken: "mem-ratify",
  owner: "sparky", ownerToken: SESS, signText: signAs("sparky"), targets: [ID], n: "7003", at: NOW });

console.log("\n--- refusals before anything publishes ---");
t("no signature refused", (await POST(RAT, { bundleId: ID, expectedSha: LIVE })).reason, "MALFORMED");
t("absent bundle refused", (await POST(RAT,
  { bundleId: "INFO-2026-9999-none", expectedSha: LIVE, sig: signRatify("sparky", "INFO-2026-9999-none", LIVE) })).reason, "ABSENT");
t("stale sha refused: you ratify what you read", (await POST(RAT,
  { bundleId: ID, expectedSha: c1.result.bundleSha, sig: signRatify("sparky", ID, c1.result.bundleSha) })).reason, "RATIFY_STALE");
t("unregistered key refused", (await POST(RAT,
  { bundleId: ID, expectedSha: LIVE, sig: signRatify("stranger", ID, LIVE) })).reason, "SIG_UNKNOWN_KEY");
t("signature over the wrong statement refused", (await POST(RAT,
  { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, c1.result.bundleSha) })).reason, "SIG_BAD_SIGNATURE");
t("nothing has been published by any of that", (await GET(`op=verify&sha256=${LIVE}`)).published, false);

console.log("\n--- ratification ---");
const rat = await POST(RAT, { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, LIVE) });
t("ratification succeeds", rat.ok, true);
t("attested by the key's member", rat.attestor, "sparky");
/* 1.17.0: C-19.1, the task inbox grammar (D-98). CORRECTED rather than
   loosened to a pattern match: the point of this assertion is that a
   ratification records WHICH catalog judged it, so a test that stopped
   pinning the exact version would stop testing the thing it exists for.
   1.20.0: C-2.10's three-valued counterparty (REC-23/D-130) — same correction,
   same reason.
   1.21.0 (D-470, 2026-09-24): CORRECTED, and the OLD ASSERTION WAS WRONG rather
   than merely stale — 1.20.0 went on stamping ratifications while the catalog
   took new checks, so this line was pinning a number that had stopped naming one
   catalog. The bump is MINOR and no check moves with it; what moves is that the
   number is now HELD to the catalog by `test/d470-catalog-census.test.mjs`, so
   the next check that lands turns that suite red until this string and that one
   move together. Still the exact version and still not a pattern, for the reason
   above.
   1.22.0 (CONDUCT #20, c20-batch13, 2026-09-24): CORRECTED AGAIN, and this time
   the correction was FORCED rather than noticed — which is the mechanism the
   note above promised. Five checks arrived from the other side of this
   integration (C-32.19, C-41.13, C-71.8, C-71.9, C-78.2),
   `test/d470-catalog-census.test.mjs` went red at its census pin, and this
   string and that one moved together exactly as that note says they must. The
   old assertion was WRONG, not stale: at the union it named a catalogue that no
   longer existed. */
/* 1.22.0 (CONDUCT #20, c20-batch18): CORRECTED, not exempted — the catalogue gained D-484's two rows, so the
   stamp moved; the old pin named a catalogue that no longer exists. */
/* CORRECTED 2026-09-24 (c20-batch14): 1.22.0 -> 1.23.0. D-64's C-83 family arrived from the other side of this
   integration, the catalogue census moved 438 -> 445, and `CATALOG_VERSION` took the MINOR bump the census arm
   forces. The old literal was right for the tree it was written on. */
t("the catalog's version is recorded, not the gate's own", rat.gateVersion, "plane-gate/1.0 (bio-checks 1.23.0)");
/* CORRECTED 2026-08-04 (REC-44 / DEC-44), never exempted, and it moves BACK to
   3 -- which is worth stating plainly because the count went 3 -> 4 under REC-14
   and now returns. REC-14's reasoning was right about the container and wrong
   about whose it is: DEC-34's container is the PUBLISHED CASE's, and a case is a
   container over one or more FINDINGS (DEC-44). THIS bundle is an INFORMATION
   bundle. It is not a finding, it is in no case, and manufacturing a
   "case container" for it was the same conflation D-187 records one level down
   -- the record calling something a case because the tables could not tell the
   difference. So a non-case ratification publishes exactly its own parts, its
   bytes stay individually answerable by hash through op=publishedbytes and
   op=verify (asserted immediately below, unchanged), and NO container is
   claimed for material that is not a case. The container assertions live in
   publishedcase.test.mjs, where there is a case to have one. */
t("bundle, file and capture published -- and NO container, because an information bundle is not a case",
  rat.published.shas, 3);
t("all bytes copied to the published bucket", rat.published.copied, 3);
t("no container is manufactured for material that is not a published case (DEC-44)",
  [rat.container, "caseId" in rat], [null, false]);
t("an information bundle ratifies at edition 1 and names no case edition", rat.edition, 1);

console.log("\n--- doorbell 7a: anyone can verify, and only ratified answers yes ---");
const v = await GET(`op=verify&sha256=${LIVE}`);
t("the ratified bundle.md verifies", v.published, true);
t("verification names the bundle", v.matches[0].bundle_id, ID);
t("the capture verifies", (await GET(`op=verify&sha256=${capSha}`)).published, true);
t("the data file verifies", (await GET(`op=verify&sha256=${sha(dataJson)}`)).published, true);
t("an unratified working revision does not", (await GET(`op=verify&sha256=${c1.result.bundleSha}`)).published, false);
t("garbage sha politely refused", (await GET("op=verify&sha256=zz")).ok, false);

console.log("\n--- convergence and the append-only promise ---");
const again = await POST(RAT, { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, LIVE) });
t("re-ratifying the same sha converges", again.existed, true);
t("nothing re-copied", again.published.copied, 0);
const md3 = mkMd(3);
const c3 = await POST("op=promote&token=mem-ratify", { ...pkg(3, LIVE, "20260724T120000Z_cccc3333") });
const rat3 = await POST(RAT, { bundleId: ID, expectedSha: c3.result.bundleSha, sig: signRatify("sparky", ID, c3.result.bundleSha) });
t("a newer revision ratifies", rat3.ok, true);
t("the OLD published sha still verifies forever", (await GET(`op=verify&sha256=${LIVE}`)).published, true);
t("the new sha verifies too", (await GET(`op=verify&sha256=${c3.result.bundleSha}`)).published, true);

console.log("\n--- the gate refuses a broken image ---");
const BAD = "INFO-2026-7002-bad-frontmatter";
/* Two deliberate breakages, each a different check family: the frontmatter id
   disagrees with the folder (C-1.1), and a reference points nowhere (C-6.2). */
const badMd = mkMd(1, "INFO-2026-0000-wrong-id").replace("references: []",
  ["references:", "  - rel: cites", "    target: INFO-2026-0000-does-not-exist",
   "    status: confirmed", '    note: ""'].join("\n"));
const badPkg = {
  bundleId: BAD, base: null, snapKey: "20260724T130000Z_dddd4444", author: "claude",
  meta: { object_type: "information", group: "believe-in-oakland", title: "Ratify target",
          current_state: "collected", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: badMd, bytes: badMd.length, sha256: sha(badMd) }],
  /* The dangling edge lives in the frontmatter above, which is now its only
     home; sending it in the payload would be refused as REFS_IN_PAYLOAD. */
  register: [],
};
const bc = await POST("op=promote&token=mem-ratify", badPkg);
const bad = await POST(RAT, { bundleId: BAD, expectedSha: bc.result.bundleSha, sig: signRatify("sparky", BAD, bc.result.bundleSha) });
t("gate refuses", bad.reason, "GATE_REFUSED");
const checks = bad.findings.map((f) => f.check).sort();
t("and says exactly why, in the catalog's own vocabulary", checks, ["C-1.1", "C-6.2"]);
t("the refused bundle published nothing", (await GET(`op=verify&sha256=${bc.result.bundleSha}`)).published, false);

console.log("\n--- revocation stops attestation ---");
await POST("op=signerset&token=adm-ratify", { keyB64: keyB64("sparky"), status: "revoked" });
const c4 = await POST("op=promote&token=mem-ratify", { ...pkg(4, c3.result.bundleSha, "20260724T140000Z_eeee5555") });
const revoked = await POST(RAT,
  { bundleId: ID, expectedSha: c4.result.bundleSha, sig: signRatify("sparky", ID, c4.result.bundleSha) });
t("revoked key cannot ratify", ["SIG_UNKNOWN_KEY", "NO_SIGNERS"].includes(revoked.reason), true);
await POST("op=signerset&token=adm-ratify", { keyB64: keyB64("sparky"), status: "active" });
t("reactivated key ratifies again", (await POST(RAT,
  { bundleId: ID, expectedSha: c4.result.bundleSha, sig: signRatify("sparky", ID, c4.result.bundleSha) })).ok, true);

console.log("\n--- the session is the ONLY delivery: the operator's bearer token is refused (REC-125) ---");
const c5 = await POST("op=promote&token=mem-ratify", { ...pkg(5, c4.result.bundleSha, "20260724T150000Z_ffff6666") });
const viaToken = await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: c5.result.bundleSha, sig: signRatify("sparky", ID, c5.result.bundleSha) });
t("the ADMIN_TOKEN bearer carrying sparky's VALID signature is refused by name, naming its class",
  [viaToken.reason, viaToken.check, viaToken.tokenClass], ["OPERATOR_TOKEN_CANNOT_RATIFY", "C-32.14", "admin"]);
t("and that revision is not published by it", (await GET(`op=verify&sha256=${c5.result.bundleSha}`)).published, false);

console.log("\n--- a member session can ratify with a valid signature ---");
const lg = await POST("op=login", { role: "member:sparky", password: "sparky-passphrase" });
const sessRat = await POST("op=ratify&token=" + lg.result.token,
  { bundleId: ID, expectedSha: c5.result.bundleSha, sig: signRatify("sparky", ID, c5.result.bundleSha) });
t("session ratification succeeds", sessRat.ok, true);
t("published list carries the attestor", (await GET("op=publishedlist&token=mem-ratify")).result.bundles
  .find((b) => b.bundle_id === ID).attestor_member, "sparky");

await mf.dispose();
console.log(`\nratify: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
