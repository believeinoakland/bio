/* NEGATIVE CONTROL: RUN 2026-09-25 (D-556) with `node test/d556partedpublish.control.mjs [arm]` from `bio-plane/`, every arm ALONE against a patched COPY of src/ (each anchor asserted to occur exactly once), the real sources hashed before and after (index.mjs 891,999 B sha256 2ad84d3fbf86…, store.mjs 3,472,543 B sha256 30db873be8b3…, gate.mjs 27,432 B sha256 37e4ce219a65…; untouched: YES). Declared before arming, and the result: (a) baseline — MUST be green: 28/0. (b) nopartcopy — THE ROW'S CONTROL, the part-copy dropped from publication (`else continue;`): 20/8 AS DECLARED, first by name "and publication reports its copy whole", got "INCOMPLETE: 3 of 3 parts did not verify in the published bucket: snapshots/filed.bin.part000, …part001, …part002" — the publish arm fails naming every part, never an ok copy. (c) wholegate — the gate as D-530 left it, the named parts never asked (`if (false) {`): 9/19 AS DECLARED, first "the gate raises no plane finding on a row whose every named part is present and verified". (d) nodestverify — no re-verification at the destination: 26/2 AS DECLARED, only "every part re-verified at the destination" (both sections): the bytes are there, so only the verified count can tell a re-read copy from an unread one. (e) nomissingname — the gate's missing-part branch disarmed in gate.mjs: 24/4 AS DECLARED, first "the row is refused, on the plane finding ALONE": §3 is ADMITTED over a part the record does not hold. (f) strictspelling — OVER-STRICTNESS, the named digest read only in acquire's own spelling: 22/6 AS DECLARED, only §2 (whose digests are spelled `sha256:`/upper case), first "no plane finding, the digests' spelling notwithstanding". RECORDED, NOT SMOOTHED: on the first run (e) came back NOT AS DECLARED — "the row is refused" stayed green because §3's and §4's hand-built register document drew a C-18.1 finding (`origin.kind`), so the rows were refused whatever the plane finding said. The ARM was right and the FIXTURE was blind: the documents are now acquire's own shape, the refusal assertions pin the plane finding as the ONLY finding, and every arm was re-run from (a). */
/* D-556 — A WHOLE-HASH REGISTER ROW HELD IN PARTS RATIFIES AND PUBLISHES (BOB #34, 2026-09-25 00:00Z;
 * `BIO_Intake_Doctrine_v1_1.md` §8).
 *
 * THE DEFECT. `op=acquire` stores a document over one part ONLY as its parts, each under its own hash (D-469,
 * D-476). The audit calls such a capture SOUND when every part the record names is present and verifies (D-533),
 * but the ratify gate refused the same bytes PLANE_HELD_IN_PARTS (D-530), because publication copied a capture by
 * the whole hash its register row names and there is no object under it. The record contradicted itself.
 *
 * THE RULING, BOTH HALVES IN ONE LANDING: (1) publication copies a parted capture part by part and re-verifies
 * each digest at the destination; (2) the gate admits the row when every part is present and verifies, and refuses
 * BY NAME otherwise — the missing part, or the digest that failed.
 *
 * DRIVEN THROUGH THE OPS: acquire makes the parts, promote files them as C-18.1 describes (`data/provenance.json`
 * naming the parts, one register row for the WHOLE), ratify runs the gate and the publication, publishedbytes
 * serves what was published. R2 is reached directly only to plant a corrupted part, a state no op makes.
 *
 *   §1 C-18.1's filing (the parts as blob files): ratifies, every part published and verified at the destination
 *   §2 the whole as ONE blob entry (D-476's shape), the parts named only in the register document: ratifies, and
 *      publication carries the parts the image never listed; the digests spelled `sha256:`/upper case (over-strictness)
 *   §3 a part missing: refused PLANE_PART_MISSING, naming that part and no other
 *   §4 a part whose bytes are not its digest: refused PLANE_PART_UNVERIFIED, naming it
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { restOnARatifiedCase } from "./ratified-evidence.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */

/* The control driver (`d556partedpublish.control.mjs`) points this at an armed COPY of the sources. */
const SRC = process.env.D556_SRC ? join(process.env.D556_SRC, "index.mjs") : fileURLToPath(new URL("../src/index.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
const MiB = 1024 * 1024;
const body = (n, seed) => { const b = new Uint8Array(n); for (let i = 0; i < b.length; i++) b[i] = (i * 37 + seed) % 256; return b; };
const BODIES = { "/filed.bin": body(17 * MiB, 11), "/whole.bin": body(17 * MiB + 5, 29) };

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  every arm — ssh-keygen is not on PATH, and ratify needs a real signature");
  console.log(`\nd556partedpublish: ${pass} pass, ${fail} fail`);
  process.exit(0);
}

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-556", MEMBER_TOKEN: "mem-556", PROBE_TOKEN: "prb-556", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const b = BODIES[new URL(request.url).pathname];
    return b ? new Response(b, { headers: { "content-type": "application/octet-stream" } })
             : new Response("not here", { status: 404 });
  },
}));
const captures = await mf.getR2Bucket("CAPTURES");
const STORE = "bio";
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, b) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: typeof b === "string" ? b : JSON.stringify(b) })).json();
const published = async (s) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=publishedbytes&sha256=${s}`);
  return r.status === 200 ? new Uint8Array(await r.arrayBuffer()) : null;
};

const dir = mkdtempSync(join(tmpdir(), "d556-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "sparky", "-f", join(dir, "sparky"), "-q"]);
const keyB64 = readFileSync(join(dir, "sparky.pub"), "utf8").trim().split(/\s+/)[1];
const signText = (text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "sparky"), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await POST("op=memberadd&token=adm-556", { memberId: "sparky", cover: "Bob", role: "admin" });
await POST("op=enroll", { invite: add.result.invite, handle: "sparky", password: "sparky-passphrase-556" });
t("the signer registers", (await POST("op=signeradd&token=adm-556", { keyB64, memberId: "sparky" })).result?.ok, true);
const SESS = (await POST("op=login", { role: "member:sparky", password: "sparky-passphrase-556" })).result.token;

const NOW = "2026-09-25T00:00:00Z";
const mkMd = (id, locator) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Parted ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  `  locator: ${locator}`, "  authority: City Auditor", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A document captured in parts.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const inline = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
/* `blobs` are the image's capture files; `doc` the register document; ONE register row for the WHOLE. */
const LIVE = new Map();   /* each bundle's live sha, as its promote answered it */
const promote = async (id, doc, blobs, snap) => { const r = await POST("op=promote&token=mem-556", {
  bundleId: id, base: null, snapKey: snap, author: "claude",
  meta: { object_type: "information", group: "believe-in-oakland", title: `Parted ${id}`,
          current_state: "collected", created: NOW, last_updated: NOW },
  files: [inline("bundle.md", mkMd(id, doc.locator)), inline("data/provenance.json", JSON.stringify({ documents: [doc] })),
          ...blobs.map((b) => ({ path: b.path, blobSha: b.sha256, sha256: b.sha256, bytes: b.bytes }))],
  register: [{ sha256: doc.capture.sha256, path: doc.file, encoding: "binary", bytes: doc.capture.bytes }] });
  if (r.result?.bundleSha) LIVE.set(id, r.result.bundleSha);
  return r; };
const acquire = (path) => POST("op=acquire&token=mem-556",
  { locator: `https://www.oaklandca.gov${path}`, authority: "City Auditor" });
const bare = (s) => String(s).replace(/^sha256:/i, "").toLowerCase();

/* §1 C-18.1's filing: the parts as blob files. */
const filed = await acquire("/filed.bin");
t("§1's document is acquired in three parts", filed.document?.parts?.length, 3);
t("and no object is stored under the whole's hash (the premise)",
  await captures.head(`${STORE}/captures/${filed.document.capture.sha256}`), null);
const FILED = "INFO-2026-5561-parted-filed";
t("§1 is filed as C-18.1 describes", (await promote(FILED, filed.document,
  filed.document.parts.map((p) => ({ path: p.file, sha256: p.sha256, bytes: p.bytes })), "20260925T000001Z_d556aaaa")).result?.ok, true);

/* §2 the whole as ONE blob entry, the parts named only in the register document, their digests spelled as a
   caller may spell them. */
const whole = await acquire("/whole.bin");
t("§2's document is acquired in three parts", whole.document?.parts?.length, 3);
const wholeDoc = { ...whole.document,
  parts: whole.document.parts.map((p) => ({ ...p, sha256: `sha256:${p.sha256.toUpperCase()}` })) };
const WHOLE = "INFO-2026-5562-parted-whole";
t("§2 is filed with the whole as one blob entry", (await promote(WHOLE, wholeDoc,
  [{ path: whole.document.file, sha256: whole.document.capture.sha256, bytes: whole.document.capture.bytes }],
  "20260925T000002Z_d556bbbb")).result?.ok, true);

/* §3 and §4: documents a caller put in parts itself, one part missing / one part corrupt. */
const callerParted = async (id, seed, snap, mutate) => {
  const all = body(3000, seed), halves = [all.subarray(0, 1500), all.subarray(1500)];
  const parts = halves.map((h, i) => ({ file: `snapshots/${id}.part00${i}`, sha256: sha(h), bytes: h.length }));
  for (const h of halves)
    await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-556&sha256=${sha(h)}`, { method: "PUT", body: h });
  await mutate(parts);
  /* acquire's own document shape (§1's), re-pointed at these bytes, so C-18.1 has nothing to say about it and the
     plane finding is the refusal's ONLY ground. */
  const doc = { ...filed.document, file: `snapshots/${id}.bin`, locator: `https://www.oaklandca.gov/${id}.bin`,
    capture: { ...filed.document.capture, sha256: sha(all), bytes: all.length }, parts };
  t(`${id} is filed`, (await promote(id, doc, parts.map((p) => ({ path: p.file, sha256: p.sha256, bytes: p.bytes })), snap)).result?.ok, true);
  return parts;
};
const MISSING = "INFO-2026-5563-part-missing", CORRUPT = "INFO-2026-5564-part-corrupt";
let gone = null, bad = null;
await callerParted(MISSING, 41, "20260925T000003Z_d556cccc", async (parts) => {
  gone = parts[1]; await captures.delete(`${STORE}/captures/${gone.sha256}`); });
await callerParted(CORRUPT, 53, "20260925T000004Z_d556dddd", async (parts) => {
  bad = parts[0]; await captures.put(`${STORE}/captures/${bad.sha256}`, new Uint8Array(bad.bytes).fill(0x42)); });

const storeDO = async (path, b) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return (await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, { method: "POST", body: JSON.stringify(b) })).json());
};
await restOnARatifiedCase({ post: POST, get: GET, doPost: storeDO, sha, promoteToken: "mem-556",
  owner: "sparky", ownerToken: SESS, signText, targets: [FILED, WHOLE, MISSING, CORRUPT], n: "5565", at: NOW });

const ratify = async (id) => { const s = LIVE.get(id);
  return POST(`op=ratify&token=${SESS}`, { bundleId: id, expectedSha: s, sig: signText(`bio-ratify ${id} ${s}\n`) }); };
const planeFindings = (r) => (r.findings || []).filter((f) => /^PLANE_/.test(f.check));

console.log("\n--- §1 C-18.1's filing: a whole-hash row held in parts RATIFIES and PUBLISHES, byte-verified ---");
{
  const r = await ratify(FILED);
  console.log(`  READING  ok=${r.ok} reason=${r.reason} findings=${JSON.stringify((r.findings || []).map((f) => f.check))} published=${JSON.stringify(r.published)}`);
  t("the gate raises no plane finding on a row whose every named part is present and verified", planeFindings(r), []);
  t("THE ROW: the parted capture RATIFIES", r.ok, true);
  t("and publication reports its copy whole", r.published?.r2, "ok");
  t("every part re-verified at the destination", [r.published?.parts?.parts, r.published?.parts?.verified], [3, 3]);
  const got = await Promise.all(filed.document.parts.map((p) => published(p.sha256)));
  t("each part is served from the published store, hashing to its own digest",
    got.map((b, i) => b && sha(b) === filed.document.parts[i].sha256), [true, true, true]);
  const joined = Buffer.concat(got.map((b) => Buffer.from(b || [])));
  t("and the published parts reassemble to the WHOLE the register names", sha(joined), filed.document.capture.sha256);
}

console.log("\n--- §2 the whole as one blob entry: publication carries the parts the image never listed ---");
{
  const r = await ratify(WHOLE);
  console.log(`  READING  ok=${r.ok} reason=${r.reason} findings=${JSON.stringify((r.findings || []).map((f) => f.check))} published=${JSON.stringify(r.published)}`);
  t("no plane finding, the digests' spelling notwithstanding", planeFindings(r), []);
  t("the parted capture RATIFIES", r.ok, true);
  t("and publishes whole", r.published?.r2, "ok");
  t("every part re-verified at the destination", [r.published?.parts?.parts, r.published?.parts?.verified], [3, 3]);
  const got = await Promise.all(whole.document.parts.map((p) => published(p.sha256)));
  t("each part is served from the published store, hashing to its own digest",
    got.map((b, i) => b && sha(b) === whole.document.parts[i].sha256), [true, true, true]);
  t("and they reassemble to the whole", sha(Buffer.concat(got.map((b) => Buffer.from(b || [])))), whole.document.capture.sha256);
  t("the whole hash itself is not served as an object (none exists), and is not claimed to be",
    await published(whole.document.capture.sha256), null);
}

console.log("\n--- §3 a part MISSING: refused by name, that part and no other ---");
{
  const r = await ratify(MISSING);
  const pf = planeFindings(r);
  console.log(`  READING  ok=${r.ok} reason=${r.reason} findings=${JSON.stringify((r.findings || []).map((f) => f.check))} plane=${JSON.stringify(pf)}`);
  t("the row is refused, on the plane finding ALONE", [r.ok, r.reason, (r.findings || []).map((f) => f.check)],
    [false, "GATE_REFUSED", ["PLANE_PART_MISSING"]]);
  t("PLANE_PART_MISSING, and never PLANE_HELD_IN_PARTS on bytes the record names", pf.map((f) => f.check), ["PLANE_PART_MISSING"]);
  t("naming the missing part, and no other", (pf[0]?.where?.missing_parts || []).map((p) => [p.file, p.sha256]), [[gone.file, gone.sha256]]);
  t("and the sentence names it too", (pf[0]?.detail || "").includes(gone.file), true);
}

console.log("\n--- §4 a part whose bytes are not its digest: refused by name ---");
{
  const r = await ratify(CORRUPT);
  const pf = planeFindings(r);
  console.log(`  READING  ok=${r.ok} reason=${r.reason} findings=${JSON.stringify((r.findings || []).map((f) => f.check))} plane=${JSON.stringify(pf)}`);
  t("the corrupt row is refused, on the plane finding ALONE", [r.ok, r.reason, (r.findings || []).map((f) => f.check)],
    [false, "GATE_REFUSED", ["PLANE_PART_UNVERIFIED"]]);
  t("PLANE_PART_UNVERIFIED", pf.map((f) => f.check), ["PLANE_PART_UNVERIFIED"]);
  t("naming the part whose digest failed, with the digest its bytes have",
    (pf[0]?.where?.disagreeing_parts || []).map((p) => [p.file, bare(p.stored_sha256)]),
    [[bad.file, sha(new Uint8Array(bad.bytes).fill(0x42))]]);
}

await mf.dispose();
console.log(`\nd556partedpublish: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
