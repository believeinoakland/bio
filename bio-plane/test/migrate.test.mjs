/* NEGATIVE CONTROL: (run 2026-07-31) disable the capture-vs-register hash check in migrate.mjs checkProvenance (guard `got !== want` with `false`, so a tampered capture is not detected) -> 1 assertion fails ("a capture that fails its register aborts" no longer sees PROVENANCE_MISMATCH); restored, 40 pass. */
/* The migration replayer against a real plane instance on a live port.
 * The fixture is modeled byte-for-byte on the observed Drive store: promotion
 * records in the daemon's shape (base chain from the empty hash, per-file
 * SHA-256s, encoding base64 entries hashing the transport text), _history
 * snapshot naming, .b64 twins with an RFC 3161 token over the twin.
 * Negative-control detail: disable the capture-vs-register hash check in migrate.mjs checkProvenance (guard `got !== want` with `false`, so a tampered capture is not detected) -> 1 assertion fails ("a capture that fails its register aborts" no longer sees PROVENANCE_MISMATCH); restored, 40 pass. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { discoverBundles, loadBundle, reconstruct, frontmatter, checkProvenance, planeClient, migrateBundle, verifyBundle, buildPackages } from "../migrate/migrate.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ROOT = "/tmp/civicos-fixture";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const put = (rel, content) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};
const md = (id, state, updated, n) =>
  `---\nid: ${id}\nobject_type: information\nschema: information@1\ntitle: "Fixture ${id}"\ncurrent_state: ${state}\nprior_state: null\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "${updated}"\ngroup: believe-in-oakland\nreferences: []\ncriticality: crucial\n---\n\n## Summary\n\nrev ${n}\n`;
const promo = (rel, target, base, files, created, author = "bob") =>
  put(rel, JSON.stringify({ target, base, files, created, author, skill_version: "0.12.10" }));

rmSync(ROOT, { recursive: true, force: true });

/* ---- bundle A: three promotions, a file changed mid-history, a file created late ---- */
const A = "INFO-2026-9001-fixture";
const a0 = md(A, "collected", "2026-07-01T01:00:00Z", 0), g0 = `{"requests":["GATH-0001"]}\n`;
const a1 = md(A, "collected", "2026-07-02T01:00:00Z", 1), late = `{"planted":"late"}\n`;
const a2 = md(A, "verified", "2026-07-03T01:00:00Z", 2), g1 = `{"requests":["GATH-0001","GATH-0002"]}\n`;
const K1 = "20260702T010000Z_bbbb1111", K2 = "20260703T010000Z_cccc2222";
put(`information/${A}/bundle.md`, a2);
put(`information/${A}/data/gathering.json`, g1);
put(`information/${A}/data/late.json`, late);
put(`information/${A}/_history/bundle_${K1}.md`, a0); // bundle_<K1>.md holds the state K1 replaced
put(`information/${A}/_history/bundle_${K2}.md`, a1);
put(`information/${A}/_history/data/gathering_${K2}.json`, g0);
promo(`information/${A}/_history/promotion_20260701T010000Z_aaaa0000.json`, A, EMPTY_SHA,
  [{ name: "bundle.md", sha256: sha(a0) }, { name: "data/gathering.json", sha256: sha(g0) }], "2026-07-01T01:00:00Z", "claude");
promo(`information/${A}/_history/promotion_${K1}.json`, A, sha(a0),
  [{ name: "bundle.md", sha256: sha(a1) }, { name: "data/late.json", sha256: sha(late) }], "2026-07-02T01:00:00Z");
promo(`information/${A}/_history/promotion_${K2}.json`, A, sha(a1),
  [{ name: "bundle.md", sha256: sha(a2) }, { name: "data/gathering.json", sha256: sha(g1) }], "2026-07-03T01:00:00Z");
put(`information/${A}/_history/manifest.json`, JSON.stringify({ entries: [K1, K2] }));
put(`information/${A}/_history/refused_20260702T120000Z_${"d4".repeat(32)}.json`,
  JSON.stringify({ target: A, reason: "C-17.2 divergence", base: "stale" }));
put(`information/${A}/_history/refused_20260702T120000Z_${"d4".repeat(32)}/data/gathering.json`, '{"refused":"package"}');

/* ---- bundle B: captures with a verified twin, a token over the twin, and a b64-only recovery ---- */
const B = "INFO-2026-9002-captures";
const b0 = md(B, "collected", "2026-07-04T01:00:00Z", 0);
const b1 = md(B, "verified", "2026-07-05T01:00:00Z", 1);
const KB = "20260705T010000Z_dddd3333";
const bin = Buffer.from(new Uint8Array(2048).map((_, i) => (i * 7) % 256));
const binB64 = bin.toString("base64");
const tsr = Buffer.from(new Uint8Array(300).map((_, i) => (i * 13) % 256));
const onlyB64src = Buffer.from("recovered evidence bytes");
const wrapped = Buffer.from(new Uint8Array(120).map((_, i) => (i * 31) % 256));
const wrappedB64 = wrapped.toString("base64").replace(/(.{64})/g, "$1\n"); // wrapped: NOT byte-reproducible
put(`information/${B}/bundle.md`, b1);
put(`information/${B}/snapshots/capture-2026-07-05-doc.pdf`, bin);
put(`information/${B}/snapshots/capture-2026-07-05-doc.pdf.b64`, binB64);
put(`information/${B}/snapshots/capture-2026-07-05-doc.pdf.b64.tsr`, tsr);
put(`information/${B}/snapshots/only-transport.dat.b64`, onlyB64src.toString("base64"));
put(`information/${B}/snapshots/wrapped.bin`, wrapped);
put(`information/${B}/snapshots/wrapped.bin.b64`, wrappedB64);
put(`information/${B}/_history/bundle_${KB}.md`, b0);
const partA = Buffer.from(new Uint8Array(500).map((_, i) => (i * 3) % 256));
const partB = Buffer.from(new Uint8Array(300).map((_, i) => (i * 5) % 256));
put(`information/${B}/snapshots/big-document.pdf.p000`, partA);
put(`information/${B}/snapshots/big-document.pdf.p001`, partB);
put(`information/${B}/data/provenance.json`, JSON.stringify({ documents: [
  { file: "snapshots/capture-2026-07-05-doc.pdf", capture: { sha256: sha(bin), encoding: "binary" } },
  { file: "snapshots/big-document.pdf", capture: { sha256: sha(Buffer.concat([partA, partB])), encoding: "binary" } },
  { file: "snapshots/not-yet-captured.pdf", capture: { sha256: "0".repeat(64), encoding: "binary" } },
] }));
promo(`information/${B}/_history/promotion_20260704T010000Z_eeee4444.json`, B, EMPTY_SHA,
  [{ name: "bundle.md", sha256: sha(b0) }], "2026-07-04T01:00:00Z", "claude");
promo(`information/${B}/_history/promotion_${KB}.json`, B, sha(b0),
  [{ name: "bundle.md", sha256: sha(b1) },
   { name: "snapshots/capture-2026-07-05-doc.pdf", sha256: sha(Buffer.from(binB64, "utf8")), encoding: "base64" },
   { name: "snapshots/capture-2026-07-05-doc.pdf.b64.tsr", sha256: sha(Buffer.from(tsr.toString("base64"), "utf8")), encoding: "base64" },
   { name: "snapshots/only-transport.dat", sha256: sha(Buffer.from(onlyB64src.toString("base64"), "utf8")), encoding: "base64" },
   { name: "snapshots/wrapped.bin", sha256: sha(Buffer.from(wrappedB64, "utf8")), encoding: "base64" },
   { name: "snapshots/big-document.pdf.p000", sha256: sha(Buffer.from(partA.toString("base64"), "utf8")), encoding: "base64" },
   { name: "snapshots/big-document.pdf.p001", sha256: sha(Buffer.from(partB.toString("base64"), "utf8")), encoding: "base64" },
   { name: "data/provenance.json", sha256: sha(readFileSync(join(ROOT, `information/${B}/data/provenance.json`))) }],
  "2026-07-05T01:00:00Z", "daemon");

/* ---- bundle C: a twin that lies ---- */
const C = "PROB-2026-9003-corrupt-twin";
const c0 = md(C, "collected", "2026-07-06T01:00:00Z", 0);
put(`problems/${C}/bundle.md`, c0);
put(`problems/${C}/snapshots/doc.bin`, Buffer.from("real bytes"));
put(`problems/${C}/snapshots/doc.bin.b64`, Buffer.from("tampered").toString("base64"));
promo(`problems/${C}/_history/promotion_20260706T010000Z_ffff5555.json`, C, EMPTY_SHA,
  [{ name: "bundle.md", sha256: sha(c0) }], "2026-07-06T01:00:00Z");

/* ---- a store index in the observed shape ---- */
put(`index/index.json`, JSON.stringify({ generated: "2026-07-24T00:00:00Z", version: "0.12.10", bundles: {
  [A]: { root: "information", object_type: "information", current_state: "verified", sha256: sha(a2) },
  [B]: { root: "information", object_type: "information", current_state: "verified", sha256: sha(b1) },
} }));

/* ---- boot the plane on a live port ---- */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "migrate-test", ADMIN_TOKEN: "adm-migrate-test", MEMBER_TOKEN: "mem-migrate-test", PROBE_TOKEN: "prb-migrate-test" },
  port: 0,
});
const base = (await mf.ready).toString().replace(/\/$/, "");
const client = planeClient({ url: base, token: "mem-migrate-test" });
const index = JSON.parse(readFileSync(join(ROOT, "index/index.json"), "utf8"));

console.log("\n--- discovery and loading ---");
const bundles = discoverBundles(ROOT);
t("three bundles discovered", bundles.map((b) => b.bundleId), [A, B, C]);
const loadedB = loadBundle(bundles.find((b) => b.bundleId === B).dir);
t("twins stay through loading for reconstruction", loadedB.live.has("snapshots/capture-2026-07-05-doc.pdf.b64"), true);
t("binary recovered from lone b64", loadedB.live.has("snapshots/only-transport.dat"), true);
t("unreproducible twin present at load", loadedB.live.has("snapshots/wrapped.bin.b64"), true);
const loadedA0 = loadBundle(bundles.find((b) => b.bundleId === A).dir);
t("refused write captured with its package", loadedA0.refusals.size, 1);
t("refusal carries record and files", (() => { const r = [...loadedA0.refusals.values()][0]; return !!r.record && !!r.files["data/gathering.json"]; })(), true);
t("refusals produce no warnings", loadedA0.log.some((l) => l.what === "UNRECOGNIZED_HISTORY_FILE"), false);

console.log("\n--- reconstruction is record-exact ---");
const loadedA = loadBundle(bundles.find((b) => b.bundleId === A).dir);
const statesA = reconstruct(loadedA);
t("three revision states", statesA.length, 3);
t("rev0 bundle.md is the earliest content", sha(statesA[0].get("bundle.md")), sha(a0));
t("late-created file absent from rev0", statesA[0].has("data/late.json"), false);
t("late-created file present from rev1", statesA[1].has("data/late.json"), true);
t("changed data file at its old content in rev1", statesA[1].get("data/gathering.json").toString(), g0);
const statesB = reconstruct(loadedB);
t("capture bundle reconstructs against base64-encoded record hashes", statesB.length, 2);
t("captures absent before their promotion", [...statesB[0].keys()].some((p) => p.startsWith("snapshots/")), false);
t("frontmatter meta parses", frontmatter(statesA[2].get("bundle.md")).current_state, "verified");

console.log("\n--- the store's own provenance register verifies ---");
import("../migrate/migrate.mjs").catch(() => {});
const { finalizeLive } = await import("../migrate/migrate.mjs");
const finLog = [];
const finB = finalizeLive(statesB[1], finLog);
t("finalize drops reproducible twins with proof",
  !finB.has("snapshots/capture-2026-07-05-doc.pdf.b64") && finLog.some((l) => l.what === "TWIN_REPRODUCIBLE_DROPPED" && /^[0-9a-f]{64}$/.test(l.sha256)), true);
t("finalize keeps the unreproducible twin, flagged",
  finB.has("snapshots/wrapped.bin.b64") && finLog.some((l) => l.what === "TWIN_KEPT_UNREPRODUCIBLE"), true);
const plog = checkProvenance(finB);
t("attested captures verified against the register", plog.filter((l) => l.what === "PROVENANCE_VERIFIED").map((l) => l.path),
  ["snapshots/capture-2026-07-05-doc.pdf", "snapshots/big-document.pdf"]);
t("pending intake noted, not fatal", plog.some((l) => l.what === "PROVENANCE_TARGET_ABSENT"), true);
let pvAbort = null;
const tampered = new Map(finB); tampered.set("snapshots/capture-2026-07-05-doc.pdf", Buffer.from("swapped"));
try { checkProvenance(tampered); } catch (e) { pvAbort = e.finding; }
t("a capture that fails its register aborts", pvAbort, "PROVENANCE_MISMATCH");

console.log("\n--- replay through the front door ---");
const rA = await migrateBundle(client, bundles[0], { indexEntry: index.bundles[A] });
t("A migrated", rA.ok, true);
t("A ran three promotions", rA.promotions, 3);
const rB = await migrateBundle(client, bundles[1], { indexEntry: index.bundles[B] });
t("B migrated", rB.ok, true);
t("B moved captures plus provenance", rB.captures, 8); // bin, tsr, recovered dat, wrapped pair, split parts, provenance

console.log("\n--- the plane agrees with the mirror ---");
const vA = await verifyBundle(client, bundles[0], { indexEntry: index.bundles[A] });
t("A verifies clean", { ok: vA.ok, findings: vA.findings }, { ok: true, findings: [] });
const vB = await verifyBundle(client, bundles[1], { indexEntry: index.bundles[B] });
t("B verifies clean", { ok: vB.ok, findings: vB.findings }, { ok: true, findings: [] });
const imgA = (await client.image(A)).result;
t("history preserves the Drive snapshot keys", imgA[`_history/data/gathering_${K2}.json`] !== undefined, true);
t("live gathering is the final content", imgA["data/gathering.json"], g1);
const provRow = (await client.image(B)).result;
t("capture rows are blob references", typeof provRow["snapshots/capture-2026-07-05-doc.pdf"], "object");
const capBack = await client.captureGet(sha(bin));
t("capture bytes answer from R2", capBack.status, 200);
t("capture bytes are byte-identical", sha(Buffer.from(await capBack.arrayBuffer())), sha(bin));
t("stats counts both bundles and register rows", (await client.selftest()).store.bundles >= 2, true);

console.log("\n--- corruption aborts, cleanly and loudly ---");
let aborted = null;
try { await migrateBundle(client, bundles[2], {}); } catch (e) { aborted = e.finding; }
t("tampered twin aborts the bundle", aborted, "TWIN_MISMATCH");
t("nothing landed for the aborted bundle", (await client.image(C)).result, null);

console.log("\n--- re-running converges instead of colliding ---");
const again = await migrateBundle(client, bundles[0], { indexEntry: index.bundles[A] });
t("a completed bundle reports already migrated", again.alreadyMigrated, true);
t("and stays verified", (await verifyBundle(client, bundles[0], { indexEntry: index.bundles[A] })).ok, true);

console.log("\n--- an interrupted migration resumes from where it stopped ---");
{
  /* Simulate an interruption: replay only bundle A's first revision into a
     fresh bundle id, then hand the tool the same mirror under that id. */
  const dirA = bundles.find((b) => b.bundleId === A).dir;
  const loadedP = loadBundle(dirA);
  const statesP = reconstruct(loadedP);
  const filesOf = (st) => [...st.entries()].sort((x, y) => x[0].localeCompare(y[0]))
    .map(([path, buf]) => ({ path, text: buf.toString("utf8"), bytes: buf.length, sha256: sha(buf) }));
  const P = "INFO-2026-9009-partial";
  const pkgs = buildPackages(P, loadedP, statesP, statesP.map(filesOf), []);
  const first = await client.promote({ ...pkgs[0], base: null });
  t("partial setup landed one revision", first.result.ok, true);
  const partialBundle = { bundleId: P, typeRoot: "information", dir: dirA };
  const resumed = await migrateBundle(client, partialBundle, {});
  t("the tool resumed rather than restarted", resumed.resumedFrom, 1);
  t("and completed the chain", resumed.ok, true);
  const img = (await client.image(P)).result;
  t("resumed history is complete", img[`_history/data/gathering_${K2}.json`] !== undefined, true);
}

await mf.dispose();
rmSync(ROOT, { recursive: true, force: true });
console.log(`\nmigrate: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
