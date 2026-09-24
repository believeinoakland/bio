/* NEGATIVE CONTROL: SIX ARMS, declared before arming and run 2026-09-24 by the D-530 worker (driver `nc-d530.py` in the session scratchpad), each ALONE against the REAL src/index.mjs or src/store.mjs, each anchor asserted to match EXACTLY ONCE, every restore by cp from a uniquely-named per-arm pristine copy verified by sha256 AND cmp with the byte count printed and floored (index.mjs 837,752 B sha256 6c64bbc1269b..., store.mjs 3,322,158 B sha256 da072b786e1c..., identical after EVERY arm). (a) BASELINE -> 28/0. (b) THE ROW'S OWN, the accepts-when arm: attest's whole-key head RESTORED, a miss answering NO_SUCH_CAPTURE as before -> 19 pass, 9 FAIL AS DECLARED, led by "the whole hash of a capture the plane took in parts is ATTESTED, never NO_SUCH_CAPTURE" (got "NO_SUCH_CAPTURE") and "attest refuses it CAPTURE_HELD_IN_PARTS, never NO_SUCH_CAPTURE" (got "NO_SUCH_CAPTURE"), with the gate arms GREEN as declared. (c) THE GATE: hasCapture's receipt question disarmed -> 26/2 AS DECLARED, "and the gate says it is HELD IN PARTS, never that the bytes are absent" (got PLANE_MISSING_BYTES) and "and the plane's receipt it rests on". (d) OVER-CORRECTION: attest trusts the register ALONE -> 25/3 AS DECLARED, "attest refuses it CAPTURE_HELD_IN_PARTS...", "carrying its catalogue row...", "no timestamp was requested for it": a timestamp rested on a row a caller wrote. (e) THE STORE: `registerHolds`' receipt read hard-coded false -> 21/7 AS DECLARED, the five setup-flow attest pins and the two gate pins, while the register-only refusal stays green. (f) OVER-STRICTNESS: the receipt read respelled as an EXISTS subquery with an alias -> 28/0 AS DECLARED. THE INSTRUMENT FAILED ONCE, AND THE SUBJECT DID NOT: the first pass stopped after (a) on "RESTORE FAILED" because the driver floored the restored file at 1,000,000 B and index.mjs is 837,752 B. `cmp` against the pristine copy read identical. The floor was lowered to 500,000 B and all six arms were re-run from (a). The figures above are the second pass, on the files as they stand on disk. Only this paragraph was written after the runs.
 * =========================================================================
 * d530-parted-attest.test.mjs — D-530. A CAPTURE HELD IN PARTS, ASKED ABOUT BY ITS WHOLE HASH.
 *
 * THE DEFECT. `op=acquire` stores a document over 8 MB as PARTS, each under its own hash, and never
 * stores the whole under the whole's hash (D-469, D-476). Two readers asked only for that whole-hash
 * object and treated a miss as absence:
 *
 *   - `op=attest`'s pre-flight answered NO_SUCH_CAPTURE, "nothing in this store has that hash; capture
 *     the document before attesting it". That is FALSE for bytes the record holds, and it tells a member
 *     to capture again a document the record already has. The setup surface's own flow is acquire, then
 *     attest at once, so every document over 8 MB was refused this way.
 *   - the ratify gate's `hasCapture(sha)` (index.mjs, handed to `runGate`), for a register row naming
 *     the WHOLE hash of a parted capture (the shape D-476's suite registers), answered
 *     `{present:false}`, and the gate refused PLANE_MISSING_BYTES, "registered capture is absent from
 *     the working bucket". Just as false.
 *
 * WHAT IS TRUE INSTEAD (Intake Doctrine §8, D-476's paragraph):
 *   - THE PLANE'S OWN RECEIPT. `captured_locators` is written only by `op=acquire`, from the hash it
 *     computed as the bytes arrived, and nothing deletes a store's captures. A receipt for the whole hash
 *     with no object under it means the plane captured the document and keeps it in parts. A caller
 *     cannot write that row, so attest ATTESTS on it and says the capture is held in parts.
 *   - THE REGISTER ALONE IS NOT ENOUGH TO ATTEST. `op=promote` writes a register row from what its caller
 *     names and does not read R2 (D-45). A registered whole hash with no object and no receipt is
 *     therefore a claim a caller can make, so attest REFUSES it, CAPTURE_HELD_IN_PARTS, and says why.
 *     It never answers NO_SUCH_CAPTURE for a hash the register holds.
 *   - THE GATE MUST STILL REFUSE A WHOLE-HASH ROW HELD IN PARTS, because the publish step after it copies
 *     a capture by its whole hash (`INCOMPLETE: capture vanished between gate and copy`). What changes is
 *     the finding: PLANE_HELD_IN_PARTS, which is true, in place of PLANE_MISSING_BYTES, which was not.
 *     The setup surface's own shape registers each PART (`setup.mjs` docFiles), and the gate passes it:
 *     every part is an object under its own hash.
 *
 * EVERYTHING IS DRIVEN THROUGH THE OPS: acquire makes the parts and the receipt, promote writes the
 * register, ratify runs the gate, attest runs the pre-flight. No row is seeded at the store.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { restOnARatifiedCase } from "./ratified-evidence.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import { TSA_ENDPOINTS } from "../src/tsa.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* 17 MB: three parts at the plane's 8 MB part size, so the whole is never stored under its own hash. */
const PARTED = new Uint8Array(17 * 1024 * 1024);
for (let i = 0; i < PARTED.length; i++) PARTED[i] = (i * 37 + 11) % 256;
const PARTED_SHA = sha(PARTED);
const LOCATOR = "https://www.oaklandca.gov/parted.bin";

/* A scripted timestamp authority that grants over WHATEVER digest it is asked for: it reads the
   32-byte hashedMessage (OCTET STRING, 0x04 0x20) out of the request, so no arm depends on knowing
   in advance which hash is attested. */
const derWrap = (tag, body) => {
  const len = body.length < 0x80 ? [body.length] : [0x81, body.length];
  return Uint8Array.from([tag, ...len, ...body]);
};
const tsaCalls = [];
const grantFor = (reqBytes) => {
  let at = -1;
  for (let i = 0; i + 34 <= reqBytes.length; i++) if (reqBytes[i] === 0x04 && reqBytes[i + 1] === 0x20) { at = i + 2; break; }
  const digest = at < 0 ? [] : [...reqBytes.subarray(at, at + 32)];
  return derWrap(0x30, [...derWrap(0x30, derWrap(0x02, [0])), ...derWrap(0x30, [...digest, 0x99])]);
};

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-530", MEMBER_TOKEN: "mem-530", PROBE_TOKEN: "prb-530", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  async outboundService(request) {
    const u = new URL(request.url);
    if (TSA_ENDPOINTS.some((e) => new URL(e).host === u.host)) {
      tsaCalls.push(u.host);
      return new Response(grantFor(new Uint8Array(await request.arrayBuffer())),
        { headers: { "content-type": "application/timestamp-reply" } });
    }
    if (u.pathname === "/parted.bin")
      return new Response(PARTED, { headers: { "content-type": "application/octet-stream" } });
    return new Response("not here", { status: 404 });
  },
}));
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })).json();
const attest = (s) => POST("op=attest&token=mem-530", { sha256: s });

console.log("\n--- the capture: acquired in parts, the whole never stored under its own hash ---");
const acq = await POST("op=acquire&token=mem-530", { locator: LOCATOR, authority: "City Auditor" });
t("the acquire succeeds", acq.ok, true);
t("in more than one part", Array.isArray(acq.document?.parts) && acq.document.parts.length, 3);
t("and the whole hashes to the document", acq.document?.capture?.sha256, PARTED_SHA);
const PARTS = acq.document.parts;
t("there is no object under the whole hash — the premise every arm below rests on",
  (await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-530&sha256=${PARTED_SHA}`)).status, 404);
t("and every part is an object under its own hash",
  (await Promise.all(PARTS.map(async (p) =>
    (await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-530&sha256=${p.sha256}`)).status))), [200, 200, 200]);

console.log("\n--- attest: the setup surface's own flow, acquire then attest at once ---");
{
  const before = tsaCalls.length;
  const r = await attest(PARTED_SHA);
  t("the whole hash of a capture the plane took in parts is ATTESTED, never NO_SUCH_CAPTURE", r.reason, undefined);
  t("the timestamp is obtained", r.ok, true);
  t("over the whole hash", r.attestation?.over, PARTED_SHA);
  t("an authority was asked", tsaCalls.length > before, true);
  t("and the answer says the capture is held in parts, on the plane's own receipt",
    [r.held?.form, r.held?.on], ["parts", "acquisition_receipt"]);
}

console.log("\n--- the ratify gate's hasCapture, driven on a parted capture (the row's FIRST question) ---");
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  the gate arms — ssh-keygen is not on PATH, and ratify needs a real signature");
} else {
  const dir = mkdtempSync(join(tmpdir(), "d530-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "sparky", "-f", join(dir, "sparky"), "-q"]);
  const keyB64 = readFileSync(join(dir, "sparky.pub"), "utf8").trim().split(/\s+/)[1];
  const signText = (text) => {
    const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, text);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "sparky"), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(f + ".sig", "utf8");
  };
  const add = await POST("op=memberadd&token=adm-530", { memberId: "sparky", cover: "Bob", role: "admin" });
  await POST("op=enroll", { invite: add.result.invite, handle: "sparky", password: "sparky-passphrase-530" });
  t("the signer registers", (await POST("op=signeradd&token=adm-530", { keyB64, memberId: "sparky" })).result?.ok, true);
  const SESS = (await POST("op=login", { role: "member:sparky", password: "sparky-passphrase-530" })).result.token;

  const NOW = "2026-09-24T00:00:00Z";
  const mkMd = (id) => [
    "---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Parted ${id}"`, "current_state: collected", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:",
    `  locator: ${LOCATOR}`, "  authority: City Auditor", `  retrieved: ${NOW}`,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", "A document captured in parts.", "", "## Provenance Notes", "",
    "## Session Log", "", "## Review Notes", "",
  ].join("\n");
  const promote = (id, files, register, snap) => {
    const md = mkMd(id);
    return POST("op=promote&token=mem-530", {
      bundleId: id, base: null, snapKey: snap, author: "claude",
      meta: { object_type: "information", group: "believe-in-oakland", title: `Parted ${id}`,
              current_state: "collected", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...files], register });
  };
  /* WHOLE: the shape D-476's suite registers — one row naming the WHOLE hash. */
  const WHOLE = "INFO-2026-5301-parted-whole";
  const pw = await promote(WHOLE,
    [{ path: "snapshots/parted.bin", blobSha: PARTED_SHA, sha256: PARTED_SHA, bytes: PARTED.length }],
    [{ sha256: PARTED_SHA, path: "snapshots/parted.bin", encoding: "binary", bytes: PARTED.length }],
    "20260924T100000Z_d530aaaa");
  t("the whole-hash bundle promotes (promote does not read R2, D-45)", pw.result?.ok, true);
  /* PARTS: the setup surface's own shape (setup.mjs docFiles) — one row per PART. */
  const BYPART = "INFO-2026-5302-parted-byparts";
  const pp = await promote(BYPART,
    PARTS.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes })),
    PARTS.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })),
    "20260924T100001Z_d530bbbb");
  t("the by-part bundle promotes", pp.result?.ok, true);

  const storeDO = async (path, body) => {
    const ns = await mf.getDurableObjectNamespace("STORE");
    return (await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, { method: "POST", body: JSON.stringify(body) })).json());
  };
  await restOnARatifiedCase({ post: POST, get: GET, doPost: storeDO, sha, promoteToken: "mem-530",
    owner: "sparky", ownerToken: SESS, signText, targets: [WHOLE, BYPART], n: "5303", at: NOW });

  const ratify = (id, live) => POST(`op=ratify&token=${SESS}`,
    { bundleId: id, expectedSha: live, sig: signText(`bio-ratify ${id} ${live}\n`) });
  const planeFindings = (r) => (r.findings || []).filter((f) => /^PLANE_/.test(f.check));

  const rw = await ratify(WHOLE, pw.result.bundleSha);
  const fw = planeFindings(rw);
  console.log(`  READING  whole-hash row: ok=${rw.ok} reason=${rw.reason} plane findings=${JSON.stringify(fw.map((f) => f.check))}`);
  t("a whole-hash row held in parts is still refused — publication copies by the whole hash",
    [rw.ok, rw.reason], [false, "GATE_REFUSED"]);
  t("and the gate says it is HELD IN PARTS, never that the bytes are absent",
    fw.map((f) => f.check), ["PLANE_HELD_IN_PARTS"]);
  t("naming the row it is about", fw[0]?.where?.sha256, PARTED_SHA);
  t("and the plane's receipt it rests on",
    /receipt/.test(fw[0]?.detail || "") && /parts/.test(fw[0]?.detail || ""), true);

  const rp = await ratify(BYPART, pp.result.bundleSha);
  console.log(`  READING  by-part rows: ok=${rp.ok} reason=${rp.reason} plane findings=${JSON.stringify(planeFindings(rp).map((f) => f.check))}`);
  t("the setup surface's by-part rows read PRESENT at the gate: no plane finding at all",
    planeFindings(rp), []);
  t("and that bundle ratifies", rp.ok, true);
}

console.log("\n--- attest: a registered whole hash the plane never received ---");
{
  /* A document a CALLER put in parts itself (op=capture, part by part), registered by the whole hash.
     The register holds it; the plane holds no receipt; there is no whole object. Attest may not rest a
     timestamp on a row a caller wrote, and it may not say the bytes are absent either. */
  const OWN = new Uint8Array(3000).map((_, i) => (i * 5 + 3) % 256);
  const halves = [OWN.subarray(0, 1500), OWN.subarray(1500)];
  for (const h of halves)
    await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-530&sha256=${sha(h)}`, { method: "PUT", body: h });
  const OWN_SHA = sha(OWN);
  const ID = "INFO-2026-5304-caller-parted";
  const md = ["---", `id: ${ID}`, "object_type: information", "schema: information@1", `title: "x"`,
    "current_state: collected", "prior_state: null", `created: "2026-09-24T00:00:00Z"`,
    `last_updated: "2026-09-24T00:00:00Z"`, "produced_by:", "  mode: agent", "  capability_tier: high",
    "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
    "## Summary", "", "x", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const pr = await POST("op=promote&token=adm-530", {
    bundleId: ID, base: null, snapKey: "20260924T100002Z_d530cccc",
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
    register: [{ path: "snapshots/own.bin", sha256: OWN_SHA, encoding: "binary", bytes: OWN.length }],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${ID}`,
            current_state: "collected", created: "2026-09-24T00:00:00Z", last_updated: "2026-09-24T00:00:00Z" } });
  t("the whole hash is registered", pr.result?.ok ?? pr.ok, true);
  const r = await attest(OWN_SHA);
  t("attest refuses it CAPTURE_HELD_IN_PARTS, never NO_SUCH_CAPTURE", r.reason, "CAPTURE_HELD_IN_PARTS");
  t("carrying its catalogue row, C-89.1, and a member translation",
    [r.code, r.check, typeof r.translation], ["CAPTURE_HELD_IN_PARTS", "C-89.1", "string"]);
  t("and it does not tell the member to capture the document again",
    /capture the document before/i.test(`${r.detail} ${r.translation}`), false);
  t("no timestamp was requested for it", r.attempts, undefined);
}

console.log("\n--- attest: what it still refuses, and what it still attests ---");
{
  const r = await attest("b".repeat(64));
  t("a hash nothing holds, nothing registered and the plane never received is NO_SUCH_CAPTURE", r.reason, "NO_SUCH_CAPTURE");
  t("and the refusal says what was asked, not that nothing anywhere has it",
    /register/.test(r.detail || "") && /receipt|acquired/.test(r.detail || ""), true);
  /* OVER-STRICTNESS: a single-part capture is attested exactly as before, with no `held` claim. */
  const small = new Uint8Array(4096).map((_, i) => (i * 3) % 256);
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-530&sha256=${sha(small)}`, { method: "PUT", body: small });
  const s = await attest(sha(small));
  t("a whole-hash object is attested as it always was", s.ok, true);
  t("and makes no claim about parts", s.held, undefined);
}

await mf.dispose();
console.log(`\nd530-parted-attest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
