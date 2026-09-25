/* NEGATIVE CONTROL: RUN 2026-09-23 (REC-176), nine arms and a baseline in src/store.mjs, each ALONE, each restored from a
   uniquely-named pristine copy verified by sha256 631d4f37… AND cmp (2867953 bytes). Baseline: 47/0.
   (1) original — THE ORIGINAL DEFECT: `INSERT OR REPLACE` restored at all three statements AND the
       `is-promote-snapkey` refusal disarmed (`if (false)`) -> 23 pass, 24 FAIL, first by name "a revision with a
       correct base, reusing K1, is refused" (the collision LANDED, ok: true) and "and the WHOLE image is
       byte-identical after"; DECLARED MUST FAIL: every refusal and image-identity arm. The idempotent and census arms
       fell too, because the landed collision moved the head — and the clean census read `undetermined: 1` over the
       suite's own overwritten creation row: the census sees a REAL overwrite, not only a planted one.
   (2) replaceonly — `INSERT OR REPLACE` restored, refusal KEPT -> 47/0 GREEN, AS DECLARED: the refusal is the fence;
       the plain INSERT is the second line.
   (3) norefusal — refusal disarmed, plain INSERT kept -> 41 pass, 6 FAIL, exactly the six by-name arms; every
       image-identity arm HELD, because the INSERT's constraint failure rolls the promotion back. As declared.
   (4) mdonly — THE LIAR, `#samePromotion` compares bundle.md alone -> 44 pass, 3 FAIL, first "K3 re-sent with
       bundle.md identical and data/notes.md DIFFERENT is NOT answered as a no-op"; "a file DROPPED" also fell, NOT
       DECLARED — the arm is right and the declaration was short.
   (5) refuseall — THE OTHER LIAR, every re-send refused -> 42 pass, 5 FAIL, first "the revision re-sent byte for byte
       answers ok, idempotent, wrote nothing", and both OVER-STRICTNESS arms (reordered files, upper-case digests).
   (6) census0 — the census lists nothing -> 42 pass, 5 FAIL, first "the census counts A's lost revision row as
       overwritten"; the clean-census arms HELD, which is why the planted fixture exists.
   (7) latefiles — FILES_DROPPED returned at its OLD site, after the manifest/history writes -> 43 pass, 4 FAIL, first
       "and the image — the manifest included — is byte-identical after (no phantom row under KC2)", then "the retry
       naming the drop, under the SAME key, LANDS": the phantom row made the honest retry a false no-op.
   (8) latenomd — NO_BUNDLE_MD at its OLD site, after the live files were replaced -> 45 pass, 2 FAIL, first "and the
       image is byte-identical after — no live file replaced, no manifest row".
   (9) latebias — the bias-set refusal at its OLD site, after every write -> 45 pass, 2 FAIL, first "and NOTHING of it
       landed — no image, no bundle, no manifest row": at the old site a REFUSED bias set LANDED.
   Restored after every arm: suite 47/47 green. */
/* REC-176 — A PROMOTION NEVER REWRITES A HISTORY ENTRY (BIO_State_Rules_Consistency_v1_5.md §2.4, the history law:
 * "History is append-only; nothing in _history/ is ever modified or deleted").
 *
 * `op=promote` wrote its manifest row (and its history snapshot) with INSERT OR REPLACE keyed (bundle_id, snap_key),
 * so a second promotion naming a key the bundle already held silently REPLACED the first promotion's row and answered
 * ok. This suite drives, THROUGH THE OP (miniflare, the control plane in front of the Durable Object):
 *   1. a revision reusing the CREATION's key, with a correct base, is REFUSED BY NAME (SNAP_KEY_TAKEN, C-67.1, with
 *      its canned translation) and the WHOLE image — the creation's manifest entry and promotion record included — is
 *      byte-identical after; the head did not move (a CAS revision against the old head then lands);
 *   2. the same against a REVISION's key, whose row also owns a history snapshot;
 *   3. an IDENTICAL re-send — of a revision (which would otherwise meet CAS_STALE) and of a creation (which would
 *      otherwise meet EXISTS) — answers ok, idempotent, writes nothing, and names the sha that promotion produced;
 *   4. THE LIAR SHAPES: a re-send identical in bundle.md but differing in ANOTHER file is not answered as a no-op;
 *      nor is one from a different author (another credential class);
 *   5. OVER-STRICTNESS: the identical re-send with its files listed in another order, or its digests in upper case,
 *      is still the same promotion and is answered idempotently;
 *   6. THE CENSUS (`op=snapkeycensus`): clean on the store this suite wrote through the fenced door; on a fixture whose
 *      SQLite is planted while the instance is DOWN with the net effect of an overwrite (a manifest row gone), it
 *      counts it, separates the undetermined case (a lost CREATION row, which a store predating the creation row also
 *      shows), lists the unanchored row the chain now carries, and rewrites nothing.
 *
 * WHAT THIS CANNOT SEE: a deployed instance's own census figure (the op is the method; running it there is DIST's);
 * WHICH key collided in a past overwrite (not recorded anywhere, so not asserted); a digest the caller lies about
 * before REC-175's digest check lands (the re-send compares the digests `files` carries at that line, which REC-175
 * computes from the bytes).
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { ACT_SHAPE_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "rec176-persist-"));
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-176", MEMBER_TOKEN: "mem-176", PROBE_TOKEN: "prb-176", VERSION: "test" },
  defaultPersistRoot: PERSIST,
});
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const post = async (op, body, tok = "mem-176") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&store=scratch&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs, tok = "mem-176") => (await mf.dispatchFetch(`http://x/api/?store=scratch&token=${tok}&${qs}`)).json();
const census = async () => (await get("op=snapkeycensus", "adm-176")).result;
const imageOf = async (id) => (await get(`op=image&id=${id}`)).result ?? null;
const image = async (id) => JSON.stringify(await imageOf(id));

const NOW = "2026-09-23T00:00:00Z";
const md = (id, rev) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Snapkey ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: 2026-09-23T0${rev}:00:00Z`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `Revision ${rev}.`, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const inline = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const pkg = (id, rev, files, base, snapKey) => ({
  bundleId: id, base, snapKey,
  meta: { object_type: "information", group: "believe-in-oakland", title: `Snapkey ${id}`,
          current_state: "collected", created: NOW, last_updated: `2026-09-23T0${rev}:00:00Z` },
  files, register: [],
});
const ROW = ACT_SHAPE_CHECKS.SNAP_KEY_TAKEN;
const refusedByName = (label, r, key) => {
  t(label, r.result?.reason ?? r.reason ?? null, "SNAP_KEY_TAKEN");
  t(`  ${label} — carries C-67.1 and its canned translation`,
    [r.result?.code, r.result?.check, r.result?.translation], ["SNAP_KEY_TAKEN", ROW.check, ROW.translation]);
  t(`  ${label} — names the key`, r.result?.snapKey ?? null, key);
};
const entryOf = (img, key) => JSON.parse(img["_history/manifest.json"]).entries.find((e) => e.key === key) ?? null;

t("the catalogue row is C-67.1 in ACT_SHAPE_CHECKS, with a translation", [ROW?.check, typeof ROW?.translation], ["C-67.1", "string"]);

console.log("\n--- 1. a revision reusing the CREATION's key is refused by name, and nothing moves ---");
const A = "INFO-2026-0176-snapkey-a";
const K1 = "20260923T010000Z_r176a001", K2 = "20260923T020000Z_r176a002", K3 = "20260923T030000Z_r176a003";
const aMd1 = md(A, 1), aMd2 = md(A, 2), aMd3 = md(A, 3);
const c1 = await post("promote", pkg(A, 1, [inline("bundle.md", aMd1)], null, K1));
t("the creation lands under K1", [c1.result?.ok, c1.result?.bundleSha], [true, sha(aMd1)]);
const img1 = await image(A);
const e1 = entryOf(await imageOf(A), K1);
t("  its manifest entry is the creation (the empty-string base)", e1?.base, sha(""));
const col1 = await post("promote", pkg(A, 2, [inline("bundle.md", aMd2)], sha(aMd1), K1));
refusedByName("a revision with a correct base, reusing K1, is refused", col1, K1);
t("  and the WHOLE image is byte-identical after — the creation's entry and promotion record included",
  await image(A), img1);
t("  and the creation's manifest entry is unchanged field by field", entryOf(await imageOf(A), K1), e1);

console.log("\n--- 2. the same against a REVISION's key, whose row owns a history snapshot ---");
const r2 = await post("promote", pkg(A, 2, [inline("bundle.md", aMd2)], sha(aMd1), K2));
t("the head did not move: a revision against the creation's sha, under a fresh key, lands", [r2.result?.ok, r2.result?.rowVersion], [true, 2]);
const img2 = await image(A);
const e2 = entryOf(await imageOf(A), K2);
t("  its entry snapshotted the creation", [e2?.base, e2?.snapshotted], [sha(aMd1), ["bundle.md"]]);
const col2 = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3)], sha(aMd2), K2));
refusedByName("a revision with a correct base, reusing K2, is refused", col2, K2);
t("  and the image — K2's snapshot and promotion record included — is byte-identical after", await image(A), img2);

console.log("\n--- 3. an IDENTICAL re-send is a no-op that answers ok ---");
const resend2 = await post("promote", pkg(A, 2, [inline("bundle.md", aMd2)], sha(aMd1), K2));
t("the revision re-sent byte for byte answers ok, idempotent, wrote nothing",
  [resend2.result?.ok, resend2.result?.idempotent, resend2.result?.wrote], [true, true, false]);
t("  and names the sha that promotion produced, and the head it found", [resend2.result?.bundleSha, resend2.result?.current],
  [sha(aMd2), { bundleSha: sha(aMd2), rowVersion: 2 }]);
t("  and the image is byte-identical after", await image(A), img2);
const resend1 = await post("promote", pkg(A, 1, [inline("bundle.md", aMd1)], null, K1));
t("the CREATION re-sent byte for byte answers ok and idempotent (not EXISTS)",
  [resend1.result?.ok, resend1.result?.idempotent, resend1.result?.wrote, resend1.result?.bundleSha], [true, true, false, sha(aMd1)]);
t("  and the image is byte-identical after", await image(A), img2);

console.log("\n--- 4. the liar shapes: identical in bundle.md is not identical ---");
const notes1 = "Notes one.\n", notes2 = "Notes two.\n";
const r3 = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3), inline("data/notes.md", notes1)], sha(aMd2), K3));
t("a two-file revision lands under K3", [r3.result?.ok, r3.result?.rowVersion], [true, 3]);
const img3 = await image(A);
const liar = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3), inline("data/notes.md", notes2)], sha(aMd2), K3));
t("K3 re-sent with bundle.md identical and data/notes.md DIFFERENT is NOT answered as a no-op",
  [liar.result?.ok ?? false, liar.result?.idempotent ?? null], [false, null]);
t("  it falls through to the refusal its stale base earns (CAS_STALE)", liar.result?.reason, "CAS_STALE");
t("  and the image is byte-identical after", await image(A), img3);
const other = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3), inline("data/notes.md", notes1)], sha(aMd2), K3), "adm-176");
t("K3 re-sent byte for byte by ANOTHER author (the admin class) is NOT answered as that author's no-op",
  [other.result?.ok ?? false, other.result?.idempotent ?? null, other.result?.reason], [false, null, "CAS_STALE"]);
const missingFile = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3)], sha(aMd2), K3));
t("K3 re-sent with a file DROPPED is NOT answered as a no-op", [missingFile.result?.ok ?? false, missingFile.result?.idempotent ?? null], [false, null]);
t("  and the image is byte-identical after all three", await image(A), img3);

console.log("\n--- 5. over-strictness: the same promotion in another spelling is still the same promotion ---");
const reordered = await post("promote", pkg(A, 3, [inline("data/notes.md", notes1), inline("bundle.md", aMd3)], sha(aMd2), K3));
t("K3 re-sent with its files listed in the other order is idempotent", [reordered.result?.ok, reordered.result?.idempotent], [true, true]);
const upper = await post("promote", pkg(A, 3, [inline("bundle.md", aMd3), inline("data/notes.md", notes1)]
  .map((f) => ({ ...f, sha256: f.sha256.toUpperCase() })), sha(aMd2), K3));
t("K3 re-sent with its digests spelled upper-case is idempotent", [upper.result?.ok, upper.result?.idempotent], [true, true]);
t("  and the image is byte-identical after both", await image(A), img3);

console.log("\n--- 5b. a REFUSED promotion writes no history, so its retry under the same key is not a phantom no-op ---");
/* FOUND BY THIS ITEM: FILES_DROPPED, NO_BUNDLE_MD and the bias-set refusal were returned AFTER the manifest and history
   writes (NO_BUNDLE_MD after the live files were replaced; the bias refusal after everything), and a refusal returned
   inside `transactionSync` rolls nothing back — so a refused promotion LEFT ITS ROW in the history, and a retry under the
   same key would have met that phantom row as "already held". All three now run before the first write. */
const C = "INFO-2026-0176-snapkey-c";
const cMd1 = md(C, 1), cMd2 = md(C, 2), extra = "Extra.\n";
const KC2 = "20260923T020000Z_r176c002";
await post("promote", pkg(C, 1, [inline("bundle.md", cMd1), inline("data/extra.md", extra)], null, "20260923T010000Z_r176c001"));
const imgC = await image(C);
const dropped = await post("promote", pkg(C, 2, [inline("bundle.md", cMd2)], sha(cMd1), KC2));
t("a revision that drops a file unnamed is refused FILES_DROPPED", dropped.result?.reason, "FILES_DROPPED");
t("  and the image — the manifest included — is byte-identical after (no phantom row under KC2)", await image(C), imgC);
const declaredDrop = await post("promote", { ...pkg(C, 2, [inline("bundle.md", cMd2)], sha(cMd1), KC2), drop: ["data/extra.md"] });
t("  the retry naming the drop, under the SAME key, LANDS — it is not answered as a no-op",
  [declaredDrop.result?.ok, declaredDrop.result?.idempotent ?? null, declaredDrop.result?.rowVersion], [true, null, 2]);
t("  and the file really is gone", Object.keys(await imageOf(C)).includes("data/extra.md"), false);
const imgC2 = await image(C);
const noMd = await post("promote", { ...pkg(C, 3, [inline("data/other.md", extra)], sha(cMd2), "20260923T030000Z_r176c003"),
  drop: ["bundle.md"] });
t("a promotion with no bundle.md is refused NO_BUNDLE_MD", noMd.result?.reason ?? null, "NO_BUNDLE_MD");
t("  and the image is byte-identical after — no live file replaced, no manifest row", await image(C), imgC2);
const BIAS = "BIAS-2026-0176-bad";
const biasText = ["---", `id: ${BIAS}`, "object_type: bias", "schema: bias@1", 'title: "Bad lens"',
  "current_state: draft", "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: believe-in-oakland",
  "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "statements:", '  - id: "b1"', '    kind: "scrutiny"', '    subject: "ENT-2026-0007"',
  '    text: "The council president is a liar and nothing from that office is true."',
  '    justification: "Because we say so."', "    citations: []", "    locked: false", "---", "",
  "## Statements", "", "A lens.", "", "## Adoption", "", "Not adopted.", "",
  "## What This Does Not Enforce", "", "Nothing is checked beyond the anatomy.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const badBias = await post("promote", { bundleId: BIAS, base: null, snapKey: "20260923T010000Z_r176bias",
  meta: { object_type: "bias", group: "believe-in-oakland", title: "Bad lens", current_state: "draft",
          created: NOW, last_updated: NOW },
  files: [inline("bundle.md", biasText)], register: [] });
t("a malformed bias set is refused BIAS_REFUSED", badBias.result?.reason, "BIAS_REFUSED");
t("  and NOTHING of it landed — no image, no bundle, no manifest row", await imageOf(BIAS), null);

console.log("\n--- 6. the census: clean through the fenced door, and honest about a planted loss ---");
const clean = await census();
t("the census answers through the op, admin-only reach", [clean?.ok, clean?.overwritten, clean?.undetermined, clean?.rewritten], [true, 0, 0, 0]);
t("  and counts what it walked (bundles A and C, five promotions, five rows — the refusals wrote none)",
  [clean?.bundles, clean?.promotions, clean?.manifest_rows], [2, 5, 5]);
const memberCensus = await get("op=snapkeycensus", "mem-176");
t("  and a member credential is refused it (class-fenced)", memberCensus.ok, false);
/* A second bundle whose CREATION row will be planted away: one promotion, then one more under a fresh key. */
const B = "INFO-2026-0176-snapkey-b";
const bMd1 = md(B, 1), bMd2 = md(B, 2);
await post("promote", pkg(B, 1, [inline("bundle.md", bMd1)], null, "20260923T010000Z_r176b001"));
await post("promote", pkg(B, 2, [inline("bundle.md", bMd2)], sha(bMd1), "20260923T020000Z_r176b002"));

/* PLANT, WITH THE INSTANCE DOWN, the net effect the old INSERT OR REPLACE left: a promotion whose row is gone. */
await mf.dispose();
const dbs = [];
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
walk(PERSIST);
let planted = 0;
for (const p of dbs) {
  const db = new DatabaseSync(p);
  const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='manifest'").get();
  if (has) {
    planted += Number(db.prepare("DELETE FROM manifest WHERE bundle_id=? AND snap_key=?").run(A, K2).changes);
    planted += Number(db.prepare("DELETE FROM manifest WHERE bundle_id=? AND snap_key=?").run(B, "20260923T010000Z_r176b001").changes);
  }
  db.close();
}
t("the fixture planted two lost rows (found the store's SQLite)", planted, 2);
mf = mk();
const dirty = await census();
t("the census counts A's lost revision row as overwritten", dirty?.overwritten, 1);
t("  and B's lost CREATION row as undetermined, never as overwritten", dirty?.undetermined, 1);
const byId = Object.fromEntries((dirty?.listed ?? []).map((r) => [r.bundle_id, r]));
t("  and lists A: 3 promotions, 2 rows, K3 unanchored (its base is the lost row's output)",
  [byId[A]?.promotions, byId[A]?.manifest_rows, byId[A]?.overwritten, byId[A]?.creation_row, byId[A]?.unanchored],
  [3, 2, 1, true, [K3]]);
t("  and lists B: no creation row, the one promotion undetermined",
  [byId[B]?.promotions, byId[B]?.manifest_rows, byId[B]?.overwritten, byId[B]?.undetermined, byId[B]?.creation_row],
  [2, 1, 0, 1, false]);
t("  and says it rewrote nothing", dirty?.rewritten, 0);
const again = await census();
t("  and a second read finds the same: NEVER silently repaired", [again?.overwritten, again?.undetermined], [1, 1]);
console.log(`  census (clean): ${JSON.stringify({ ...clean, listed: clean?.listed?.length, note: undefined })}`);
console.log(`  census (planted): overwritten=${dirty?.overwritten} undetermined=${dirty?.undetermined} listed=${dirty?.listed?.length}`);

await mf.dispose();
console.log(`\nrec176-snapkey: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
