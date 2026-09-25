/* NEGATIVE CONTROL: RUN 2026-09-24 (D-533) with `node test/d533partsaudit.control.mjs [arm]` from `bio-plane/`, every arm ALONE against a patched COPY of src/ (each anchor asserted to occur exactly once), the real sources hashed before and after (index.mjs 837,981 B sha256 4e0151549949…, store.mjs 3,323,848 B sha256 a143e8817229…; untouched: YES). Declared before arming, and the result: (a) baseline — MUST be green: 43/0. (b) wholeonly — THE ROW'S CONTROL, head the whole key only (`if (true) { unbacked.push(`): 25/18, first by name "THE ROW: a parted capture whose every named part is present and verified is HELD IN PARTS" — the measured defect back, `unbacked` for held bytes and `sound: false`. (c) nodigest — a part's digest not compared (`else if (false) disagree.push(`): 37/6, first "the row is MISMATCHED": presence and size alone pass §4's corrupted part. (d) nopresence — an absent part skipped rather than named: 39/4, first "the row is UNBACKED (the only one…": a missing part reads held. (e) insidesound — undetermined counted INSIDE sound, what the ruling forbids: 41/2, only "counted OUTSIDE sound" and "and sound still speaks only for the determined rows". (f) strictspelling — OVER-STRICTNESS, the named digest read only in acquire's own spelling (no `sha256:` prefix, lower case): 39/4, first "naming the one part it could not verify". RECORDED, NOT SMOOTHED: on the first run (f) came back NOT AS DECLARED — one undeclared failure, "and the fully held rows are still held in parts" (§3's row stays undetermined to the end, so §5 counts 1 held, not 2): the arm was right and the declaration incomplete; corrected, and EVERY ARM AS DECLARED on the second run. */
/* D-533 — `op=registeraudit` AND A CAPTURE HELD IN PARTS (BOB #33, 2026-09-24 21:17Z; `BIO_Intake_Doctrine_v1_1.md` §8).
 *
 * `op=acquire` stores a multi-part document ONLY as its parts, each under its own content address, and never the
 * whole under the whole's (D-476 says why). The register row a promote writes for it is keyed by the WHOLE
 * `capture_sha`, and the audit's R2 probe headed `captures/<whole sha>` alone — so a correctly filed parted capture,
 * every byte of it held, audited `unbacked: 1, sound: false` (measured by this row's worker at origin/main 9f8b69e6
 * before any change). An audit that calls held bytes missing is the record claiming more than it can support.
 *
 * THE RULING: `sound` reads true for a row held IN PARTS when every part the record names is present and each part's
 * digest is verified — a fourth state, "held in parts, all present" (`held_in_parts`); a missing part is NAMED; a row
 * resolving neither way is UNDETERMINED and counted OUTSIDE `sound`, never inside it.
 *
 * DRIVEN THROUGH THE OPS: op=acquire makes the parts, op=promote files them exactly as C-18.1 describes (the part
 * files as blobs, `data/provenance.json` carrying acquire's own document with its `parts`, the register row for the
 * whole), op=registeraudit answers. R2 is reached directly only to REMOVE a part or to plant an object with no
 * stored checksum — states no op here can make and a store can nonetheless be in.
 *
 *   §1 a fully held parted capture: `held_in_parts` 1, `sound` true, nothing sampled
 *   §2 an unresolvable row (its register document does not parse): `undetermined` 1, and `sound` STAYS true
 *   §3 a part with no stored checksum is read and hashed; one too large to read is UNVERIFIED -> undetermined
 *   §4 a part whose bytes do not hash to the digest the record names: mismatched, the part named, `sound` false
 *   §5 one part removed: unbacked, THAT part named and no other, `sound` false
 *   §6 the whole-key rows the audit always classified are classified exactly as before
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";

/* The control driver (`d533partsaudit.control.mjs`) points this at an armed COPY of the sources. */
const SRC = process.env.D533_SRC ? join(process.env.D533_SRC, "index.mjs") : fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d533", MEM = "mem-d533";
const MiB = 1024 * 1024;
/* Deterministic bodies: three parts each (8 + 8 + 5 MiB), distinct per locator so no part is shared. */
const body = (seed) => { const b = new Uint8Array(21 * MiB); for (let i = 0; i < b.length; i++) b[i] = (i * 31 + seed) % 256; return b; };
const BODIES = { "/held": body(7), "/unreadable": body(11), "/missing": body(13), "/corrupt": body(17) };
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d533", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const b = BODIES[new URL(request.url).pathname];
    return b ? new Response(b) : new Response("unscripted", { status: 500 });
  },
});
const bucket = await mf.getR2Bucket("CAPTURES");
const STORE = "bio";                  /* the admin token's default namespace; the audit reads `<store>/captures/<sha>` */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const POST = async (q, b) => (await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(b ?? {}) })).json());
const audit = async () => (await (await mf.dispatchFetch(`http://x/api/?op=registeraudit&token=${ADM}`)).json()).result;

const NOW = "2026-09-24T00:00:00Z";
const mdFor = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Info ${id}"`,
  "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${NOW}"`, "produced_by:",
  "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
  "## Summary", "", "A parted capture.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inline = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
/* File an acquired document the way C-18.1 describes: the parts as blob files, the register document naming them,
   and ONE register row for the whole. `provenance` overrides the register document's text (§2's arm). */
const file = async (id, doc, { provenance } = {}) => POST(`op=promote&token=${ADM}`, {
  bundleId: id, base: null, snapKey: `20260924T000001Z_${id.slice(-8)}`,
  files: [inline("bundle.md", mdFor(id)),
          inline("data/provenance.json", provenance ?? JSON.stringify({ documents: [doc] })),
          ...doc.parts.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
  register: [{ path: doc.file, sha256: doc.capture.sha256, encoding: "binary", bytes: doc.capture.bytes }],
  meta: { object_type: "information", group: "believe-in-oakland", title: id, current_state: "collected",
          created: NOW, last_updated: NOW } });
const acquire = async (path) => POST(`op=acquire&token=${MEM}`, { locator: `https://www.oaklandca.gov${path}`, authority: "City Auditor" });

t("the instance claims, so bundles can register captures",
  (await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-533" })).ok, true);

console.log("\n--- §1 a fully held parted capture audits HELD IN PARTS, and the record reads sound ---");
const held = await acquire("/held");
t("the document is acquired in more than one part", held.parts, 3);
t("and the store holds NO object under the whole's hash (the precondition this row exists for)",
  await bucket.head(`${STORE}/captures/${held.document.capture.sha256}`), null);
t("R2 kept the SHA-256 it checked at the put, which is what verifies a part without reading it",
  typeof (await bucket.head(`${STORE}/captures/${held.document.parts[0].sha256}`))?.checksums?.sha256, "object");
t("it is filed as C-18.1 describes", (await file("INFO-2026-0533-held", held.document)).ok, true);
const a1 = await audit();
t("THE ROW: a parted capture whose every named part is present and verified is HELD IN PARTS", a1.held_in_parts, 1);
t("and is NOT called unbacked", a1.unbacked, 0);
t("and the record reads SOUND", a1.sound, true);
t("with nothing sampled", a1.sample, []);
t("and nothing left undetermined", a1.undetermined, 0);

console.log("\n--- §2 a row that resolves neither way is UNDETERMINED, counted outside sound ---");
const unread = await acquire("/unreadable");
t("a second parted document is acquired", unread.parts, 3);
t("and filed with a register document that does not parse",
  (await file("INFO-2026-0534-unread", unread.document, { provenance: "{ not json" })).ok, true);
const a2 = await audit();
t("the row is UNDETERMINED", a2.undetermined, 1);
t("counted OUTSIDE sound: the record still reads sound", a2.sound, true);
t("and never as unbacked", a2.unbacked, 0);
const u2 = a2.sample.find((s) => s.bundle_id === "INFO-2026-0534-unread");
t("it is sampled, with why it could not be resolved", /does not parse/.test(u2?.why || ""), true);
t("and the held row beside it is still held in parts", a2.held_in_parts, 1);

console.log("\n--- §3 a part with no stored checksum is read and hashed; one too large to read stays unverified ---");
{
  /* Planted directly: no op writes a part without its checksum, and a store can hold one written another way. */
  const small = new Uint8Array(3 * MiB).map((_, i) => (i * 5 + 1) % 256);
  const large = new Uint8Array(9 * MiB).map((_, i) => (i * 3 + 2) % 256);
  const sSha = sha(small), lSha = sha(large);
  await bucket.put(`${STORE}/captures/${sSha}`, small);
  t("the planted part carries no stored checksum", (await bucket.head(`${STORE}/captures/${sSha}`)).checksums?.sha256, undefined);
  const whole = new Uint8Array(small.length + large.length); whole.set(small, 0); whole.set(large, small.length);
  const doc = { file: "snapshots/planted", locator: "https://www.oaklandca.gov/planted", retrieved: NOW,
    authority_state: "undetermined", authority_basis: "suite",
    capture: { sha256: sha(whole), bytes: whole.length, encoding: "binary" },
    /* The small part's digest is spelled as a caller may spell one (`sha256:` prefix, upper case): the same
       digest, and the over-strictness arm of the control reads it as exactly that. */
    parts: [{ file: "snapshots/planted.part000", sha256: `sha256:${sSha.toUpperCase()}`, bytes: small.length },
            { file: "snapshots/planted.part001", sha256: lSha, bytes: large.length }] };
  /* The large part is planted checksum-free too, and it is over the bound a part is read and hashed within. */
  await bucket.put(`${STORE}/captures/${lSha}`, large);
  t("filed", (await file("INFO-2026-0535-planted", doc)).ok, true);
  const a3 = await audit();
  const u3 = a3.sample.find((s) => s.bundle_id === "INFO-2026-0535-planted");
  t("a part over the read bound with no checksum leaves the row UNDETERMINED, never passed", a3.undetermined, 2);
  t("naming the one part it could not verify, and not the one it read and hashed",
    (u3?.unverified_parts || []).map((p) => p.sha256), [lSha]);
  t("and sound still speaks only for the determined rows", a3.sound, true);
  /* Re-put the large part WITH its checksum: now both verify, one by reading, one by R2's word. */
  await bucket.put(`${STORE}/captures/${lSha}`, large, { sha256: createHash("sha256").update(large).digest() });
  const a3b = await audit();
  t("with the checksum present both parts verify, and the row is HELD IN PARTS", a3b.held_in_parts, 2);
  t("and only §2's row is undetermined", a3b.undetermined, 1);
}

console.log("\n--- §4 a part whose bytes are not the digest the record names is MISMATCHED, by name ---");
const corrupt = await acquire("/corrupt");
t("a fourth parted document is acquired", corrupt.parts, 3);
{
  const p = corrupt.document.parts[2];
  const wrong = new Uint8Array(p.bytes).fill(0x42);
  await bucket.put(`${STORE}/captures/${p.sha256}`, wrong);            /* same key and size, different bytes, no checksum */
  t("filed", (await file("INFO-2026-0536-corrupt", corrupt.document)).ok, true);
  const a4 = await audit();
  const m4 = a4.sample.find((s) => s.bundle_id === "INFO-2026-0536-corrupt");
  t("the row is MISMATCHED", a4.mismatched, 1);
  t("naming the part whose bytes disagree, and only it", (m4?.disagreeing_parts || []).map((x) => x.file), [p.file]);
  t("with the digest the bytes actually have", m4?.disagreeing_parts?.[0]?.stored_sha256, sha(wrong));
  t("and the record no longer reads sound", a4.sound, false);
}

console.log("\n--- §5 one missing part is NAMED, and makes the record unsound ---");
const missing = await acquire("/missing");
t("a fifth parted document is acquired", missing.parts, 3);
const gone = missing.document.parts[1];
await bucket.delete(`${STORE}/captures/${gone.sha256}`);
t("filed", (await file("INFO-2026-0537-missing", missing.document)).ok, true);
const a5 = await audit();
const m5 = a5.sample.find((s) => s.bundle_id === "INFO-2026-0537-missing");
t("the row is UNBACKED (the only one: §4's row stays mismatched)", [a5.unbacked, a5.mismatched, !!m5], [1, 1, true]);
t("naming the missing part, and no other", (m5?.missing_parts || []).map((x) => [x.file, x.sha256]), [[gone.file, gone.sha256]]);
t("and saying how many of how many", /1 of the 3 parts/.test(m5?.why || ""), true);
t("the record does NOT read sound", a5.sound, false);
t("and the fully held rows are still held in parts", a5.held_in_parts, 2);

console.log("\n--- §6 the rows the audit always classified by the whole key are classified as before ---");
{
  const CAP = "whole bytes held under their own key";
  await mf.dispatchFetch(`http://x/api/?op=capture&token=${MEM}&sha256=${sha(CAP)}`, { method: "PUT", body: CAP });
  const md = mdFor("INFO-2026-0538-whole");
  t("a whole-key capture is filed", (await POST(`op=promote&token=${ADM}`, { bundleId: "INFO-2026-0538-whole", base: null,
    snapKey: "20260924T000002Z_whole", files: [inline("bundle.md", md)],
    register: [{ path: "migration/drive-provenance.json", sha256: sha(CAP), encoding: "utf8", bytes: CAP.length }],
    meta: { object_type: "information", group: "believe-in-oakland", title: "w", current_state: "collected",
            created: NOW, last_updated: NOW } })).ok, true);
  const md2 = mdFor("INFO-2026-0539-ghost");
  t("and a register row with no bytes anywhere and no parts named", (await POST(`op=promote&token=${ADM}`, {
    bundleId: "INFO-2026-0539-ghost", base: null, snapKey: "20260924T000003Z_ghost", files: [inline("bundle.md", md2)],
    register: [{ path: "captures/ghost.bin", sha256: sha("nowhere"), encoding: "binary", bytes: 7 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: "g", current_state: "collected",
            created: NOW, last_updated: NOW } })).ok, true);
  const a6 = await audit();
  t("the whole-key capture is CAPTURED, as before", a6.captured, 1);
  const g6 = a6.sample.find((s) => s.bundle_id === "INFO-2026-0539-ghost");
  t("the ghost is UNBACKED with the reason it always had", g6?.why, "no bytes in the working bucket");
  t("and names no parts, because the record names none", "missing_parts" in (g6 || {}), false);
  t("the store's parts lookup does not leak into the answer", a6.sample.some((s) => "named_parts" in s), false);
}

await mf.dispose();
console.log(`\nd533partsaudit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
