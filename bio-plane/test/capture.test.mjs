/* NEGATIVE CONTROL: (run 2026-07-31) disable the server-side integrity check in the capture handler (guard `digest !== sha` with `false`, accepting a body whose bytes do not match the sha256 parameter) -> 2 assertions fail (the INTEGRITY refusal on a mismatched body); restored, 19 pass. */
/* The capture op: the one op that moves bytes. Content-addressed, verified
   server-side, immutable once landed, confined by store prefix.
   Negative-control detail: disable the server-side integrity check in the capture handler (guard `digest !== sha` with `false`, accepting a body whose bytes do not match the sha256 parameter) -> 2 assertions fail (the INTEGRITY refusal on a mismatched body); restored, 19 pass. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-capture-test", MEMBER_TOKEN: "mem-capture-test", PROBE_TOKEN: "prb-capture-test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const hex = (b) => createHash("sha256").update(b).digest("hex");
const fetchRaw = (p, init) => mf.dispatchFetch("http://x" + p, init);
const j = async (p, init) => (await fetchRaw(p, init)).json();

/* Binary payload covering every byte value, so text-path corruption cannot hide. */
const bytes = new Uint8Array(4096).map((_, i) => i % 256);
const sha = hex(bytes);

console.log("\n--- gates ---");
t("unauthenticated refused", (await j(`/api/capture?sha256=${sha}`)).error, "unauthenticated");
t("missing sha refused", (await j(`/api/capture?token=mem-capture-test`)).error, "capture requires sha256=<64 lowercase hex>");
t("malformed sha refused", (await j(`/api/capture?token=mem-capture-test&sha256=zz`)).error, "capture requires sha256=<64 lowercase hex>");

console.log("\n--- integrity is server-verified ---");
const wrong = "0".repeat(64);
t("body hash mismatch refused", (await j(`/api/capture?token=mem-capture-test&sha256=${wrong}`, { method: "PUT", body: bytes })).reason, "INTEGRITY");
t("nothing landed under the wrong name", (await fetchRaw(`/api/capture?token=mem-capture-test&sha256=${wrong}`)).status, 404);

console.log("\n--- roundtrip, byte-exact ---");
const p1 = await j(`/api/capture?token=mem-capture-test&sha256=${sha}`, { method: "PUT", body: bytes });
t("put succeeds", p1.ok, true);
t("first put is new", p1.existed, false);
t("byte count reported", p1.bytes, bytes.length);
const back = new Uint8Array(await (await fetchRaw(`/api/capture?token=mem-capture-test&sha256=${sha}`)).arrayBuffer());
t("all 4096 bytes identical", hex(back), sha);

console.log("\n--- immutability: re-put writes nothing and still answers ok ---");
const p2 = await j(`/api/capture?token=mem-capture-test&sha256=${sha}`, { method: "PUT", body: bytes });
t("re-put ok", p2.ok, true);
t("re-put reports existed", p2.existed, true);

console.log("\n--- range reads answer partially ---");
const r = await fetchRaw(`/api/capture?token=mem-capture-test&sha256=${sha}`, { headers: { range: "bytes=0-6" } });
t("206 on range", r.status, 206);
t("exactly 7 bytes", new Uint8Array(await r.arrayBuffer()).length, 7);

console.log("\n--- the store prefix is the fence ---");
const pb = new TextEncoder().encode("probe capture");
const pbSha = hex(pb);
const pp = await j(`/api/capture?token=prb-capture-test&sha256=${pbSha}`, { method: "PUT", body: pb });
t("probe put lands (in scratch)", pp.ok, true);
t("probe scope is scratch", pp.store, "scratch");
t("probe's capture invisible from the bio store", (await fetchRaw(`/api/capture?token=mem-capture-test&sha256=${pbSha}`)).status, 404);
t("probe reads its own back", (await fetchRaw(`/api/capture?token=prb-capture-test&sha256=${pbSha}`)).status, 200);
t("probe asking for bio is refused", (await j(`/api/capture?token=prb-capture-test&sha256=${pbSha}&store=bio`)).tokenClass, "probe");

console.log("\n--- absence is declared ---");
t("unknown sha is NOT_FOUND", (await j(`/api/capture?token=mem-capture-test&sha256=${"f".repeat(64)}`)).reason, "NOT_FOUND");

await mf.dispose();
console.log(`\ncapture: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
