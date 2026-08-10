/* CAP-4 / CAPTURE-SCALING item 6: reuse verification, post-hoc and at ratification.
 *
 * A working capture may REUSE a subresource from the record rather than
 * re-fetching it, which spends none of the scarce subrequest budget. That is a
 * provenance statement: the bytes were NOT verified against the source during
 * that capture. This suite proves the two places that statement is honoured.
 *
 * The load-bearing claim is item 6b: at ratification every reused part is
 * re-fetched, and its OUTCOME recorded, MANDATORY as an attempt and a record and
 * never as agreement. confirmed / changed / unavailable / not_attempted are all
 * valid ratifications saying different things; ratifying with a reused part and
 * saying NOTHING is the one forbidden thing, so "every reused part carries an
 * outcome" is the assertion the whole item exists for. The re-fetch is a PLAIN
 * GET (item 6c): our own SHA-256 over what we received is the evidence, where a
 * 304 would be only the origin's assertion. not_attempted (item 6d) is recorded
 * WITH its reason for parts the calibrated capture_limits ceiling cannot reach.
 * Item 6a, post-hoc detection, is free and unconditional and is asserted too.
 *
 * NEGATIVE CONTROL: in src/index.mjs op=ratify, drop the `verdicts.push` in the
 * `unavailable` (dark-source) branch (`if (!r || !r.ok) { continue; }`) so a
 * re-fetched-but-dark part records no outcome -> both the response set and the
 * persisted set assertions FAIL naming the unrecorded part. RUN 2026-07-31
 * capture-agent-5: dropped the push -> "the response records an outcome for every
 * reused part, by name" and "the set of parts with a recorded outcome equals the
 * set of reused parts" both failed, got omitting
 * https://assets.oaklandca.gov/gone.css (and the tally 1/1/1 -> 1/1/0, persisted
 * 3 -> 2); restored -> 36 pass, 0 fail.
 */
/* NEGATIVE CONTROL: drop the verdicts.push in src/index.mjs op=ratify's `unavailable` (dark-source) branch so a re-fetched-but-dark reused part records no outcome -> "the response records an outcome for every reused part, by name" and "the set of parts with a recorded outcome equals the set of reused parts" both FAIL, got omitting https://assets.oaklandca.gov/gone.css (tally 1/1/1 -> 1/1/0, persisted 3 -> 2). RUN 2026-07-31 capture-agent-5; restored -> 36 pass, 0 fail. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeAddress } from "../src/subresources.mjs";

/* Every ratification here is signed with stock ssh-keygen, so without it there
   is nothing to sign and no subset to run: SKIP LOUDLY WITH A NAMED REASON and
   exit 0 rather than dying with an unhandled spawn error (D-93). Same guard, and
   same reason, as ratify.test.mjs. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- reuse-ratify ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("reuse-ratify: SKIPPED — ssh-keygen not on PATH; every ratification here "
    + "signs a real bio-ratify statement with stock ssh-keygen and cannot run without it");
  process.exit(0);
}

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(Buffer.from(b)).digest("hex");

/* The scripted source. Keyed by pathname so each reused part gets a decided
   fate: byte-identical (confirmed), different bytes (changed), or gone
   (unavailable). */
const HOST = "assets.oaklandca.gov";
const CSS = (s) => new TextEncoder().encode(s);
const BODIES = new Map([
  ["/confirmed.css", CSS("body{color:#111}")],          // returned identically -> confirmed
  ["/confirmed-2.css", CSS(".a{margin:0}")],
  ["/confirmed-3.css", CSS(".b{padding:0}")],
  ["/changed.css", CSS("body{color:#999} /* edited since */")], // different from what was reused
]);
const NEW_CHANGED_SHA = sha(BODIES.get("/changed.css"));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rr", MEMBER_TOKEN: "mem-rr", PROBE_TOKEN: "prb-rr", VERSION: "test",
              /* Zero the plane's reserved margin so the calibrated ceiling maps
                 exactly onto the number of parts attempted, making the
                 not_attempted residue deterministic to assert. */
              RATIFY_REFETCH_MARGIN: "0",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST) return new Response("off-limits", { status: 500 });
    const b = BODIES.get(u.pathname);
    if (!b) return new Response("gone", { status: 404 });         // -> unavailable
    return new Response(b, { headers: { "content-type": "text/css" } });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })).json();
const PUT = async (q, bytes) => (await mf.dispatchFetch("http://x/api/?" + q, { method: "PUT", body: bytes })).json();

const ns = await mf.getDurableObjectNamespace("STORE");
const stub = ns.get(ns.idFromName("bio"));
const call = async (path, body) => (await stub.fetch("http://x" + path, body
  ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

/* ---- roster: one member with a registered signing key (stock ssh-keygen) ---- */
const dir = mkdtempSync(join(tmpdir(), "reuse-ratify-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "sparky", "-f", join(dir, "sparky"), "-q"]);
const keyB64 = readFileSync(join(dir, "sparky.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "sparky"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await POST("op=memberadd&token=adm-rr", { memberId: "sparky", cover: "Bob", role: "admin" });
await POST("op=enroll", { invite: add.result.invite, handle: "sparky", password: "sparky-passphrase" });
await POST("op=signeradd&token=adm-rr", { keyB64, memberId: "sparky", comment: "sparky laptop" });

/* ---- a conformant bundle carrying a registered primary capture ---- */
const NOW = "2026-07-24T00:00:00Z";
const mkMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Reuse target"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `${id}`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

/* Build a bundle whose primary capture reuses a set of parts from the record.
   Each part is seeded twice: first as a plain FETCH under an unrelated document
   (so site_assets holds the address and the bytes that will be reused), then as
   a REUSE under this bundle's primary sha (so site_asset_refs carries reused=1
   keyed on the primary the register will name). */
let seedDoc = 0;
const buildBundle = async (id, seed, parts) => {
  const capBytes = new Uint8Array(2048).map((_, i) => (i * seed) % 256);
  const capSha = sha(capBytes);
  t(`[${id}] capture bytes land`, (await PUT(`op=capture&token=mem-rr&sha256=${capSha}`, capBytes)).ok, true);
  const earlierDoc = String(++seedDoc).padEnd(64, "e");
  const fetched = parts.map((p) => ({ address: p.address, address_norm: normalizeAddress(p.address),
    sha256: p.reusedSha, content_type: "text/css", bytes: 16, kind: "stylesheet" }));
  await call("/recordsiteassets", { host: HOST, primarySha: earlierDoc, at: "2026-01-01T00:00:00Z",
    observations: fetched });
  await call("/recordsiteassets", { host: HOST, primarySha: capSha, at: "2026-01-02T00:00:00Z",
    observations: parts.map((p) => ({ address: p.address, address_norm: normalizeAddress(p.address),
      sha256: p.reusedSha, reused: true })) });
  const md = mkMd(id);
  const pkg = {
    bundleId: id, base: null, snapKey: `2026072${seed}T100000Z_${id.slice(-8)}`, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Reuse target",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "snapshots/evidence.bin", blobSha: capSha, bytes: capBytes.length, sha256: capSha },
    ],
    register: [{ sha256: capSha, path: "snapshots/evidence.bin", encoding: "binary", bytes: capBytes.length }],
  };
  const c = await POST("op=promote&token=mem-rr", pkg);
  t(`[${id}] bundle promoted`, c.result.ok, true);
  return { id, capSha, live: c.result.bundleSha };
};
const norms = (parts) => parts.map((p) => normalizeAddress(p.address)).sort();

console.log("\n=== Bundle 1: an outcome for EVERY reused part; a dark source still ratifies ===");
{
  const parts = [
    { address: `https://${HOST}/confirmed.css`, reusedSha: sha(BODIES.get("/confirmed.css")) },
    { address: `https://${HOST}/changed.css`,   reusedSha: sha(CSS("body{color:#999} /* ORIGINAL */")) },
    { address: `https://${HOST}/gone.css`,      reusedSha: sha(CSS("body{color:#000} /* was here */")) },
  ];
  const B = await buildBundle("INFO-2026-7101-reuse-mixed", 7, parts);
  const rp = (await call(`/reusedparts?id=${B.id}`)).result;
  t("the store enumerates the bundle's reused parts", rp.count, 3);

  const rat = await POST("op=ratify&token=adm-rr", { bundleId: B.id, expectedSha: B.live, sig: signRatify(B.id, B.live) });
  t("ratification succeeds even though a reused source has gone dark", rat.ok, true);
  t("the response carries a reuse report", !!rat.reuse, true);
  t("every reused part is accounted for on the response", rat.reuse.reused_parts, 3);
  t("one confirmed, one changed, one unavailable", [rat.reuse.confirmed, rat.reuse.changed, rat.reuse.unavailable, rat.reuse.not_attempted], [1, 1, 1, 0]);
  const byNorm = Object.fromEntries(rat.reuse.outcomes.map((o) => [o.address_norm, o]));
  const outcomeAt = (path) => (byNorm[normalizeAddress(`https://${HOST}${path}`)] || {});
  /* Every reused part must carry an outcome on the response. Compared as SETS so
     a dropped outcome (the negative control) fails HERE naming the missing part,
     rather than throwing on a missing key. */
  t("the response records an outcome for every reused part, by name",
    rat.reuse.outcomes.map((o) => o.address_norm).sort(), norms(parts));
  t("the byte-identical part is confirmed by OUR hash, not the origin's word",
    outcomeAt("/confirmed.css").verdict, "confirmed");
  t("the edited part is changed, and the new bytes are named",
    [outcomeAt("/changed.css").verdict, outcomeAt("/changed.css").observed_sha],
    ["changed", NEW_CHANGED_SHA]);
  t("the vanished part is unavailable, not a silent pass",
    outcomeAt("/gone.css").verdict, "unavailable");

  /* The DURABLE record, which is the point of the item: read back what was
     persisted and prove an outcome exists for every reused part. */
  const persisted = (await call(`/reuseverdicts?bundle=${B.id}`)).result.verdicts.filter((v) => v.phase === "ratify");
  t("a ratify verdict is persisted for every reused part", persisted.length, 3);
  t("and the set of parts with a recorded outcome equals the set of reused parts",
    [...new Set(persisted.map((v) => v.address_norm))].sort(), norms(parts));
  t("each persisted verdict is dated", persisted.every((v) => /^\d{4}-\d{2}-\d{2}T/.test(v.at)), true);
}

console.log("\n=== Bundle 2: a bundle whose ONLY reused part is dark still ratifies, as unavailable ===");
{
  const parts = [{ address: `https://${HOST}/vanished.css`, reusedSha: sha(CSS("nav{}")) }];
  const B = await buildBundle("INFO-2026-7102-all-dark", 5, parts);
  const rat = await POST("op=ratify&token=adm-rr", { bundleId: B.id, expectedSha: B.live, sig: signRatify(B.id, B.live) });
  t("it ratifies", rat.ok, true);
  t("the sole reused part is unavailable", [rat.reuse.reused_parts, rat.reuse.unavailable], [1, 1]);
  t("the record holds something nobody can re-fetch, and says so",
    /no longer answers/.test(rat.reuse.outcomes[0].basis), true);
  const persisted = (await call(`/reuseverdicts?bundle=${B.id}`)).result.verdicts.filter((v) => v.phase === "ratify");
  t("the outcome is on the durable record too", [persisted.length, persisted[0].verdict], [1, "unavailable"]);
}

console.log("\n=== Bundle 3: reuse count exceeds the calibrated ceiling -> residue not_attempted ===");
{
  /* Calibrate a low ceiling by being 'refused' at 2. With the reserved margin
     zeroed, the ratification re-fetch budget is exactly 2, so of three reused
     parts two are attempted and the third is recorded not_attempted WITH its
     reason -- never silently omitted. */
  const rc = (await call("/recordcapturelimit", { runtime: "subrequests", observed: 2 })).result;
  t("the runtime ceiling is calibrated to 2", rc.observed, 2);
  const parts = [
    { address: `https://${HOST}/confirmed.css`,   reusedSha: sha(BODIES.get("/confirmed.css")) },
    { address: `https://${HOST}/confirmed-2.css`, reusedSha: sha(BODIES.get("/confirmed-2.css")) },
    { address: `https://${HOST}/confirmed-3.css`, reusedSha: sha(BODIES.get("/confirmed-3.css")) },
  ];
  const B = await buildBundle("INFO-2026-7103-over-ceiling", 3, parts);
  const rat = await POST("op=ratify&token=adm-rr", { bundleId: B.id, expectedSha: B.live, sig: signRatify(B.id, B.live) });
  t("it ratifies", rat.ok, true);
  t("the budget was bounded by the calibrated ceiling", [rat.reuse.ceiling, rat.reuse.budget], [2, 2]);
  t("two parts attempted (confirmed), one residue not_attempted", [rat.reuse.confirmed, rat.reuse.not_attempted], [2, 1]);
  const na = rat.reuse.outcomes.find((o) => o.verdict === "not_attempted");
  t("the not_attempted part names the ceiling as its reason", /calibrated subrequest ceiling 2/.test(na.basis), true);
  const persisted = (await call(`/reuseverdicts?bundle=${B.id}`)).result.verdicts.filter((v) => v.phase === "ratify");
  t("STILL an outcome for every reused part, residue included", persisted.length, 3);
  t("and the recorded set equals the reused set, nothing omitted",
    [...new Set(persisted.map((v) => v.address_norm))].sort(), norms(parts));
}

console.log("\n=== item 6a: POST-HOC detection is free, appended, and dated ===");
{
  /* Seed a capture that reused an asset, then let a LATER direct capture of the
     host fetch different bytes for that address. No re-fetch is made by this
     path; the earlier reuse is flagged from site_assets alone. */
  const A = `https://${HOST}/posthoc.css`;
  const N = normalizeAddress(A);
  const OLD = sha(CSS("old furniture")), NEW = sha(CSS("new furniture, department gone"));
  const reuser = "cafe".padEnd(64, "0");
  await call("/recordsiteassets", { host: HOST, primarySha: "beef".padEnd(64, "0"), at: "2026-02-01T00:00:00Z",
    observations: [{ address: A, address_norm: N, sha256: OLD, content_type: "text/css", bytes: 12, kind: "stylesheet" }] });
  await call("/recordsiteassets", { host: HOST, primarySha: reuser, at: "2026-02-02T00:00:00Z",
    observations: [{ address: A, address_norm: N, sha256: OLD, reused: true }] });
  t("nothing is flagged yet", (await call(`/reuseverdicts?capture=${reuser}`)).result.verdicts.length, 0);

  const chg = (await call("/recordsiteassets", { host: HOST, primarySha: "d00d".padEnd(64, "0"), at: "2026-03-01T00:00:00Z",
    observations: [{ address: A, address_norm: N, sha256: NEW, content_type: "text/css", bytes: 12, kind: "stylesheet" }] })).result;
  t("the later fetch is recorded as a change on the host", chg.changed, 1);
  const ph = (await call(`/reuseverdicts?capture=${reuser}`)).result.verdicts;
  t("the earlier REUSER is now flagged, at zero request cost", [ph.length, ph[0].phase, ph[0].verdict], [1, "posthoc", "changed"]);
  t("the verdict names the old bytes it reused and the new bytes seen",
    [ph[0].reused_sha, ph[0].observed_sha], [OLD, NEW]);
  t("and it is dated", /^\d{4}-\d{2}-\d{2}T/.test(ph[0].at), true);
}

console.log("\n=== a bundle that reused nothing ratifies exactly as before (no reuse key) ===");
{
  const capBytes = new Uint8Array(1024).map((_, i) => (i * 13) % 256);
  const capSha = sha(capBytes);
  await PUT(`op=capture&token=mem-rr&sha256=${capSha}`, capBytes);
  const id = "INFO-2026-7104-no-reuse";
  const md = mkMd(id);
  const c = await POST("op=promote&token=mem-rr", {
    bundleId: id, base: null, snapKey: "20260724T160000Z_norereuse", author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Reuse target",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "snapshots/evidence.bin", blobSha: capSha, bytes: capBytes.length, sha256: capSha }],
    register: [{ sha256: capSha, path: "snapshots/evidence.bin", encoding: "binary", bytes: capBytes.length }],
  });
  const rat = await POST("op=ratify&token=adm-rr", { bundleId: id, expectedSha: c.result.bundleSha, sig: signRatify(id, c.result.bundleSha) });
  t("it ratifies", rat.ok, true);
  t("and carries no reuse report, so nothing overclaims a verification that did not happen", "reuse" in rat, false);
}

await mf.dispose();
console.log(`\nreuse-ratify: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
