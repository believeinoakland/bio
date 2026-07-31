/* Ratification through the gate, the published fence, and doorbell 7a.
 *
 * The attestation signatures in this suite are produced by stock
 * ssh-keygen, not by BIO code, so the suite proves the plane accepts
 * exactly what a member's own machine produces. Negative controls are
 * load-bearing: the unknown key, the stale sha, the tampered statement,
 * the revoked signer, and the gate refusals each demand a specific
 * refusal, not an absence of success.
 */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ratify", MEMBER_TOKEN: "mem-ratify", PROBE_TOKEN: "prb-ratify", VERSION: "test" },
});

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

console.log("\n--- refusals before anything publishes ---");
t("no signature refused", (await POST("op=ratify&token=adm-ratify", { bundleId: ID, expectedSha: LIVE })).reason, "MALFORMED");
t("absent bundle refused", (await POST("op=ratify&token=adm-ratify",
  { bundleId: "INFO-2026-9999-none", expectedSha: LIVE, sig: signRatify("sparky", "INFO-2026-9999-none", LIVE) })).reason, "ABSENT");
t("stale sha refused: you ratify what you read", (await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: c1.result.bundleSha, sig: signRatify("sparky", ID, c1.result.bundleSha) })).reason, "RATIFY_STALE");
t("unregistered key refused", (await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: LIVE, sig: signRatify("stranger", ID, LIVE) })).reason, "SIG_UNKNOWN_KEY");
t("signature over the wrong statement refused", (await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, c1.result.bundleSha) })).reason, "SIG_BAD_SIGNATURE");
t("nothing has been published by any of that", (await GET(`op=verify&sha256=${LIVE}`)).published, false);

console.log("\n--- ratification ---");
const rat = await POST("op=ratify&token=adm-ratify", { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, LIVE) });
t("ratification succeeds", rat.ok, true);
t("attested by the key's member", rat.attestor, "sparky");
/* 1.17.0: C-19.1, the task inbox grammar (D-98). CORRECTED rather than
   loosened to a pattern match: the point of this assertion is that a
   ratification records WHICH catalog judged it, so a test that stopped
   pinning the exact version would stop testing the thing it exists for. */
t("the catalog's version is recorded, not the gate's own", rat.gateVersion, "plane-gate/1.0 (bio-checks 1.17.0)");
t("bundle, file, and capture published", rat.published.shas, 3);
t("all bytes copied to the published bucket", rat.published.copied, 3);

console.log("\n--- doorbell 7a: anyone can verify, and only ratified answers yes ---");
const v = await GET(`op=verify&sha256=${LIVE}`);
t("the ratified bundle.md verifies", v.published, true);
t("verification names the bundle", v.matches[0].bundle_id, ID);
t("the capture verifies", (await GET(`op=verify&sha256=${capSha}`)).published, true);
t("the data file verifies", (await GET(`op=verify&sha256=${sha(dataJson)}`)).published, true);
t("an unratified working revision does not", (await GET(`op=verify&sha256=${c1.result.bundleSha}`)).published, false);
t("garbage sha politely refused", (await GET("op=verify&sha256=zz")).ok, false);

console.log("\n--- convergence and the append-only promise ---");
const again = await POST("op=ratify&token=adm-ratify", { bundleId: ID, expectedSha: LIVE, sig: signRatify("sparky", ID, LIVE) });
t("re-ratifying the same sha converges", again.existed, true);
t("nothing re-copied", again.published.copied, 0);
const md3 = mkMd(3);
const c3 = await POST("op=promote&token=mem-ratify", { ...pkg(3, LIVE, "20260724T120000Z_cccc3333") });
const rat3 = await POST("op=ratify&token=adm-ratify", { bundleId: ID, expectedSha: c3.result.bundleSha, sig: signRatify("sparky", ID, c3.result.bundleSha) });
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
const bad = await POST("op=ratify&token=adm-ratify", { bundleId: BAD, expectedSha: bc.result.bundleSha, sig: signRatify("sparky", BAD, bc.result.bundleSha) });
t("gate refuses", bad.reason, "GATE_REFUSED");
const checks = bad.findings.map((f) => f.check).sort();
t("and says exactly why, in the catalog's own vocabulary", checks, ["C-1.1", "C-6.2"]);
t("the refused bundle published nothing", (await GET(`op=verify&sha256=${bc.result.bundleSha}`)).published, false);

console.log("\n--- revocation stops attestation ---");
await POST("op=signerset&token=adm-ratify", { keyB64: keyB64("sparky"), status: "revoked" });
const c4 = await POST("op=promote&token=mem-ratify", { ...pkg(4, c3.result.bundleSha, "20260724T140000Z_eeee5555") });
const revoked = await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: c4.result.bundleSha, sig: signRatify("sparky", ID, c4.result.bundleSha) });
t("revoked key cannot ratify", ["SIG_UNKNOWN_KEY", "NO_SIGNERS"].includes(revoked.reason), true);
await POST("op=signerset&token=adm-ratify", { keyB64: keyB64("sparky"), status: "active" });
t("reactivated key ratifies again", (await POST("op=ratify&token=adm-ratify",
  { bundleId: ID, expectedSha: c4.result.bundleSha, sig: signRatify("sparky", ID, c4.result.bundleSha) })).ok, true);

console.log("\n--- a member session can ratify with a valid signature ---");
const lg = await POST("op=login", { role: "member:sparky", password: "sparky-passphrase" });
const c5 = await POST("op=promote&token=mem-ratify", { ...pkg(5, c4.result.bundleSha, "20260724T150000Z_ffff6666") });
const sessRat = await POST("op=ratify&token=" + lg.result.token,
  { bundleId: ID, expectedSha: c5.result.bundleSha, sig: signRatify("sparky", ID, c5.result.bundleSha) });
t("session ratification succeeds", sessRat.ok, true);
t("published list carries the attestor", (await GET("op=publishedlist&token=mem-ratify")).result.bundles
  .find((b) => b.bundle_id === ID).attestor_member, "sparky");

await mf.dispose();
console.log(`\nratify: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
