/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d512-replay-verified.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/d512-replay-verified.control.mjs [arm]`. RESULTS, RUN 2026-09-24 by the D-512 worker (SCHEDULER #20's, cloud) on origin/main 9f8b69e6 + this item (real src/index.mjs 837,801 B sha256 cbd39b7220af…, src/store.mjs 3,321,231 B b1398c2d4762…, checks/bio-checks.mjs 959,549 B 1b1847df33d3…, hashed before and after, untouched: YES), ALL EIGHT ARMS AS DECLARED AT THE FIRST RUN, exit 0: (baseline) nothing armed -> 13/0 · **(skip-verification) — THE ROW'S CONTROL, in its own words, `replay` honoured on the caller's word (the refusal made `if (false)` and the honouring `if (proven || replayAsserted)`) -> 6/7: EVERY unverified arm ADMITTED and failing BY NAME, U1, U2, U3, U4, U5, U6, and the witness U0; C1, V1 and V2 green** · (no-sha) the SHA-256 comparison dropped from the record match -> 11/2: U4 by name and U0 · (no-bundle) the bundle check dropped -> 11/2: U3 and U0 · (no-register) the registration check dropped -> 11/2: U6 and U0 · **(no-class) the SECOND CONDITION dropped at both its sites (D-511's delete and the class asked before the verification) -> 12/1: C1 by name, the member token's proven replay admitted** · (creation-only) OVER-STRICTNESS, the verification asked of an inquiry's CREATION alone, REC-173's old scope -> 11/2: V1 and V2 by name, every U arm green for free, the direction that hides it · (respelled) OVER-STRICTNESS, the refusal's guard respelled `!proven && replayAsserted === true` -> 13/0. NOT ARMED, stated: a "not held" arm — U5's liar is refused because there are no bytes to read, and no patch of one statement makes absent bytes verify.
 * =========================================================================
 * D-512 — `replay` IS HONOURED ONLY WHERE THE SERVER VERIFIES IT, FOR EVERY PROMOTION.
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S" (BOB #33, 2026-09-24),
 * STEP (2), the end state: a replayed promotion of ANY type and ANY revision names its drive-provenance capture, and
 * the plane checks that the held bytes' preserved promotion record lists this bundle and this revision's `bundle.md`
 * SHA-256. Step (1) (D-511) kept the admin class's flag as the admin's own word; this closes that residue, and keeps
 * step (1)'s class test as the second condition.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`9f8b69e6`): `risk-tier.test.mjs` §8 arm (δ) pinned it — the admin
 * deploy token sending `replay: true` with no provenance landed `risk_tier: 1` and the record published it; and a
 * revision's `replay` was never verified at all (`store.mjs`'s REC-179 comment: "index.mjs verifies only a CREATION").
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks, and the arm that shows each one fails:
 *   (1) SAY SO — a bare `replay: true` with no capture (ARM U1, a creation; U2, a revision).
 *   (2) SHOW THE WRONG PAST — a held capture whose records name ANOTHER bundle (U3), or this bundle at bytes other
 *       than these (U4, the SHA check), or a capture never uploaded (U5), or one held but not registered by this
 *       promotion as the Drive provenance (U6).
 *   (3) BORROW THE CLASS'S EXEMPTION WITH PROOF — a MEMBER deploy token carrying a perfectly valid capture (C1): the
 *       class test is the SECOND condition, so its flag is still removed and the fence it tried to skip refuses it.
 * And the over-strictness direction: a VERIFIED replay of a non-inquiry CREATION (V1) and of a REVISION whose
 * matching Drive record is the SECOND of several (V2) must LAND, as `promotion-replay`, carrying their legacy shape.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) the ROOT OF TRUST's own honesty — an admin who uploads a fabricated provenance
 * capture listing its own bytes is admitted; Membership §DEC-2's deferral, stated in BOB #33's ruling; (ii) one
 * isolate, one store; (iii) the migration tool end to end — `migrate.test.mjs` owns that, and it now names the
 * provenance on every revision; (iv) a caller outside this repository.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
/* CORRECTED 2026-09-25 (D-615, C-86.7), never exempted: this suite's promote labels named dates the documents they carried
   do not state (a fixed NOW/LATER over bytes the plane had re-stamped, or bytes written with other dates), and a label
   contradicting the document's `created`/`last_updated` is now refused by name. `datesOf` makes each label name the
   document's own dates, and the old value only where the bytes state none — what the label always meant to say. */
const datesOf = (md, created, lastUpdated) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(String(md ?? "")), get = (k) => fm && (new RegExp(`^${k}:[ \t]*"?([^"\n]*?)"?[ \t]*$`, "m").exec(fm[1]) || [])[1];
  return { created: get("created") || created, last_updated: get("last_updated") || lastUpdated };
};

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.D512_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { SURFACE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d512", MEM = "mem-d512", PRB = "prb-d512";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body, method) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: method || "POST", body: typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const GET = async (q) => parse(await RAW(q));
const E = encodeURIComponent;

/* Every call NAMES its store (CLAUDE.md §5). This isolate's `bio` is a throwaway store. */
const S = "store=bio";
const ADMIN = `token=${ADM}&${S}`, MEMBER = `token=${MEM}&${S}`;
const NOW = "2026-07-24T00:00:00Z";
const PROV = "migration/drive-provenance.json";

/* A Drive-era information bundle carrying a LEGACY gathering queue — the pre-grammar shape a replay exists to carry,
   and which an ordinary promotion is refused (GATHERING_REFUSED). So an arm that is NOT a verified replay is refused
   by a fence even where the replay check is disarmed, and "nothing landed" is read with that in mind. */
const infoMd = (id, n) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Fixture ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`,
  `last_updated: "2026-07-2${n}T01:00:00Z"`, "group: believe-in-oakland", "references: []", "criticality: crucial",
  "---", "", "## Summary", "", `rev ${n}`, ""].join("\n");
const LEGACY = JSON.stringify({ requests: ["a bare string, the pre-grammar shape"] }, null, 1);
const file = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
let seq = 0;
const pkgOf = (id, base, md, { legacy = true, ...over } = {}) => ({
  bundleId: id, base, snapKey: `20260724T01${String(++seq).padStart(4, "0")}Z_d512aaaa`,
  author: "drive-migration",
  meta: { object_type: "information", group: "believe-in-oakland", title: `Fixture ${id}`,
          current_state: "collected", ...datesOf(md, NOW, NOW) },
  files: [file("bundle.md", md), ...(legacy ? [file("data/gathering.json", LEGACY)] : [])],
  register: [], ...over,
});
/* THE PROVENANCE CAPTURE in `migrate.mjs`'s shape; each record `{ target, files: [{ name, sha256 }] }`. */
const provenanceOf = (bundleId, records) => Buffer.from(JSON.stringify({
  bundleId, migrated: NOW, source: "google-drive/CivicOS", indexEntry: null, manifest: null,
  promotions: records.map((record, i) => ({ key: `2026070${i + 1}T010000Z_d512${String(i).padStart(4, "0")}`, record })),
  refusals: [], notes: [] }, null, 1), "utf8");
const rec = (target, mdText) => ({ target, base: null, files: [{ name: "bundle.md", sha256: sha(mdText) }], author: "ruth" });
const put = async (who, bytes) => parse(await RAW(`op=capture&${who}&sha256=${sha(bytes)}`, bytes, "PUT"))?.ok === true;
/* Name and register a capture on a package — the proof, in the shape `migrate.mjs` sends it. */
const naming = (pkg, cap) => ({ ...pkg, provenanceCapture: sha(cap),
  register: [...pkg.register, { path: PROV, sha256: sha(cap), bytes: cap.length, encoding: "utf8" }] });

const promote = (who, pkg) => POST(`op=promote&${who}`, pkg);
const image = (id) => GET(`op=image&${ADMIN}&id=${E(id)}`);
const kinds = async (id) => {
  const raw = (await image(id))?.["_history/manifest.json"];
  try { return (JSON.parse(raw).entries ?? []).map((e) => e.kind); } catch { return null; }
};
const head = async (id) => (await image(id))?.["bundle.md"] ?? null;
const U = SURFACE_CHECKS.REPLAY_UNVERIFIED;
const refused = (x) => [x?.ok, x?.reason, x?.code, x?.check, x?.translation === U?.translation && typeof U?.translation === "string"];
const UNVERIFIED = [false, "REPLAY_UNVERIFIED", "REPLAY_UNVERIFIED", "C-66.6", true];
/* THE WITNESS: the store's own counters, read before and after an arm that must write nothing. */
const counters = async () => { const s = await GET(`op=stats&${ADMIN}`); return [s?.bundles, s?.files]; };

console.log("\n--- FIXTURE ---");
t("FIXTURE: the catalogue carries C-66.6 with a canned translation — a refusal with no sentence behind it must not "
  + "reach a member (DEC-49)", [U?.check, typeof U?.translation, (U?.translation ?? "").length > 40], ["C-66.6", "string", true]);
const c0 = await counters();
t("FIXTURE: the witness reads numbers — a counter that is absent would make every `nothing written` arm vacuous",
  [typeof c0[0], typeof c0[1]], ["number", "number"]);
/* EACH REVISION ARM REVISES ITS OWN BUNDLE: an ordinary creation, carrying no legacy queue, so it lands as authored.
   One bundle per arm, so a control that lets one arm land cannot move another arm's base and fail it CAS_STALE — a
   second cause the control would then be measuring. */
const seeded = async (id) => {
  const r = await promote(ADMIN, pkgOf(id, null, infoMd(id, 0), { legacy: false }));
  if (r?.ok !== true || !r.bundleSha) throw new Error(`seed ${id}: ${JSON.stringify(r).slice(0, 300)}`);
  return r.bundleSha;
};
const R2 = "INFO-2026-9512-revised-u2", R4 = "INFO-2026-9512-revised-u4", RV = "INFO-2026-9512-revised-v2";
const base2 = await seeded(R2), base4 = await seeded(R4), baseV = await seeded(RV);
t("FIXTURE: the three revised bundles exist, each created as an ordinary `promotion`",
  [await kinds(R2), await kinds(R4), await kinds(RV)], [["promotion"], ["promotion"], ["promotion"]]);

console.log("\n--- ARM U · A REPLAY THE PLANE CANNOT VERIFY IS REFUSED BY NAME, AND NOTHING IS WRITTEN ---");
{
  const before = await counters();
  const idU1 = "INFO-2026-9512-bare-creation";
  const u1 = await promote(ADMIN, pkgOf(idU1, null, infoMd(idU1, 1), { replay: true }));
  t("ARM U1 (SAY SO, A CREATION): the admin's `replay: true` with no provenance is refused REPLAY_UNVERIFIED (C-66.6) "
    + "with its translation, and nothing landed", [...refused(u1), await head(idU1)], [...UNVERIFIED, null]);

  const u2 = await promote(ADMIN, pkgOf(R2, base2, infoMd(R2, 2), { replay: true }));
  t("ARM U2 (SAY SO, A REVISION): the admin's bare `replay: true` on a REVISION is refused by name — step (2) reaches "
    + "every revision, not an inquiry's creation alone — and the bundle is unmoved",
    [...refused(u2), await kinds(R2)], [...UNVERIFIED, ["promotion"]]);

  const idU3 = "INFO-2026-9512-borrowed", mdU3 = infoMd(idU3, 3);
  const capU3 = provenanceOf("INFO-2026-9512-some-other", [rec("INFO-2026-9512-some-other", mdU3)]);
  const heldU3 = await put(ADMIN, capU3);
  const u3 = await promote(ADMIN, naming(pkgOf(idU3, null, mdU3, { replay: true }), capU3));
  t("ARM U3 (ANOTHER BUNDLE'S PAST): a held capture listing THESE bytes but naming ANOTHER bundle is refused by name, "
    + "and nothing landed", [heldU3, ...refused(u3), await head(idU3)], [true, ...UNVERIFIED, null]);

  const mdU4 = infoMd(R4, 4), capU4 = provenanceOf(R4, [rec(R4, infoMd(R4, 0))]);
  const heldU4 = await put(ADMIN, capU4);
  const u4 = await promote(ADMIN, naming(pkgOf(R4, base4, mdU4, { replay: true }), capU4));
  t("ARM U4 (THE SHA CHECK — THE ROW'S CONTROL): the right capture for the right bundle, whose records do NOT list this "
    + "revision's bundle.md SHA-256, is refused by name, and the bundle is unmoved",
    [heldU4, ...refused(u4), await kinds(R4)], [true, ...UNVERIFIED, ["promotion"]]);

  const idU5 = "INFO-2026-9512-never-held", mdU5 = infoMd(idU5, 5);
  const capU5 = provenanceOf(idU5, [rec(idU5, mdU5)]);
  const u5 = await promote(ADMIN, naming(pkgOf(idU5, null, mdU5, { replay: true }), capU5));   // never PUT
  t("ARM U5 (NOT HELD): a capture named and registered in the request but never uploaded is refused by name — the "
    + "plane reads the HELD bytes, never the request's claim — and nothing landed", [...refused(u5), await head(idU5)],
    [...UNVERIFIED, null]);

  const idU6 = "INFO-2026-9512-unregistered", mdU6 = infoMd(idU6, 6);
  const capU6 = provenanceOf(idU6, [rec(idU6, mdU6)]);
  const heldU6 = await put(ADMIN, capU6);
  const u6 = await promote(ADMIN, { ...pkgOf(idU6, null, mdU6, { replay: true }), provenanceCapture: sha(capU6) });
  t("ARM U6 (NOT REGISTERED): a held capture the promotion names but does not register as the Drive provenance is "
    + "refused by name, and nothing landed", [heldU6, ...refused(u6), await head(idU6)], [true, ...UNVERIFIED, null]);

  t("ARM U0 (THE WITNESS): the refused arms wrote no bundle and no file — the store's counters are unmoved",
    await counters(), before);
}

console.log("\n--- ARM C · THE CLASS TEST IS THE SECOND CONDITION ---");
{
  const idC1 = "INFO-2026-9512-member-proven", mdC1 = infoMd(idC1, 7);
  const capC1 = provenanceOf(idC1, [rec(idC1, mdC1)]);
  const heldC1 = await put(MEMBER, capC1);
  const c1 = await promote(MEMBER, naming(pkgOf(idC1, null, mdC1, { replay: true }), capC1));
  t("ARM C1 (PROOF DOES NOT HAND A CLASS THE EXEMPTION): the MEMBER deploy token carrying a VALID capture has its "
    + "flag removed (D-511, kept) and is judged by the fence it tried to skip — GATHERING_REFUSED, not a replay — and "
    + "nothing landed", [heldC1, c1?.ok, c1?.reason, await head(idC1)], [true, false, "GATHERING_REFUSED", null]);
}

console.log("\n--- ARM V · A REPLAY THE PLANE VERIFIES IS ADMITTED, OF ANY TYPE AND ANY REVISION ---");
{
  const idV1 = "INFO-2026-9512-replayed-creation", mdV1 = infoMd(idV1, 8);
  const capV1 = provenanceOf(idV1, [rec(idV1, mdV1)]);
  const heldV1 = await put(ADMIN, capV1);
  const v1 = await promote(ADMIN, naming(pkgOf(idV1, null, mdV1, { replay: true }), capV1));
  t("ARM V1 (A NON-INQUIRY CREATION): the admin's replay of an information bundle over a held capture listing it lands, "
    + "carrying its legacy queue, BYTE-IDENTICAL (no creation-time stamp rewrote it), recorded `promotion-replay`",
    [heldV1, v1?.ok, v1?.bundleSha, await kinds(idV1), (await image(idV1))?.["data/gathering.json"] === LEGACY],
    [true, true, sha(mdV1), ["promotion-replay"], true]);

  /* OVER-STRICTNESS: the matching Drive record is the SECOND of three, and it lists bundle.md among several files. */
  const mdV2 = infoMd(RV, 9);
  const capV2 = provenanceOf(RV, [rec(RV, infoMd(RV, 0)),
    { target: RV, base: baseV, author: "ruth", files: [{ name: "data/gathering.json", sha256: sha(LEGACY) },
                                                       { name: "bundle.md", sha256: sha(mdV2) }] },
    rec(RV, "a later revision this replay does not reach")]);
  const heldV2 = await put(ADMIN, capV2);
  const v2 = await promote(ADMIN, naming(pkgOf(RV, baseV, mdV2, { replay: true }), capV2));
  t("ARM V2 (A REVISION, OVER-STRICTNESS): the admin's replay of a REVISION whose matching Drive record is the second "
    + "of three, listing bundle.md among several files, lands and is recorded `promotion-replay`",
    [heldV2, v2?.ok, v2?.bundleSha, ((await kinds(RV)) ?? []).slice().sort()],   /* as a set: the manifest's order is its keys' */
    [true, true, sha(mdV2), ["promotion", "promotion-replay"]]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nd512-replay-verified: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
