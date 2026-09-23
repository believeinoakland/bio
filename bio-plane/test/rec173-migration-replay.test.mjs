/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec173-migration-replay.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec173-migration-replay.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-173 worker (CONDUCT #15's, cloud) on b41d1edb + this item (real src/index.mjs 721,147 B sha256 ad0a07edbfbd…, src/store.mjs 2,845,117 B 4b9549039830…, src/schema.mjs 222,289 B 49bc8c76824d…, checks/bio-checks.mjs 827,501 B 5b70a1c0a110…, untouched: YES), ALL ELEVEN ARMS AS DECLARED AT THE FIRST RUN, and again, same figures, after the exemption moved to its own line so REC-171's stamp stands byte-for-byte (the hashes are the second run's): baseline -> 19/0 · **no-sha — THE ROW'S CONTROL, the SHA-256 comparison dropped from the record match -> 16/3: ARM N3 (ALTERED BYTES) BY NAME, with N0 (the altered replay wrote a replay row) and N7 (a failed replay inside a run landed as a replay instead); N3b stays green, the computed-sha guard is a second fence** · no-bundle -> 17/2: ARM N2 (ANOTHER BUNDLE's CAPTURE) and N0 · **any-class — THE MEMBER-TOKEN LIAR, the admin condition dropped -> 16/3: ARM N4 (MEMBER) and N4b (PROBE) by name, and N0** · **no-register — THE CALLER-MADE CAPTURE, the registration check dropped -> 16/3: ARM N5b and N5c by name, and N0** (N5a — never held — stays refused: nothing to read) · **trust-caller-sha — THE STALE SHA, the caller's `sha256` field taken for the text's -> 17/2: ARM N3b by name, and N0** · restamp-replay (D-78 applied to a verified replay) -> 18/1: ARM R1b · gate-replay (rule 2 still stamped on a replay) -> 14/5: every R arm · trust-caller-stamp (`migrationReplay` not deleted first) -> 18/1: ARM N6 (a member session's forged stamp read as migrated) · first-record-only (a fence TIGHTER than the rule) -> 18/1: ARM R2 · reversed-search (over-strictness, the same rule spelled last-first) -> 19/0. BEFORE THIS ITEM (b41d1edb's src/): 12 pass, 7 fail — every R arm (the admin's replay refused SURFACE_NO_RUN) and the counters that did not exist.
 * =========================================================================
 * REC-173 — A MIGRATION IS A REPLAY, NOT A SURFACING.
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, "A MIGRATION IS A REPLAY, NOT A SURFACING" (BOB #30, 2026-09-23, on
 * REC-171's finding). Since REC-171, every creation of a question that did not arrive through a member's session names
 * a running run the caller holds, or is refused SURFACE_NO_RUN — and `migrate.mjs`, which replays the Drive era's
 * questions under a deploy token, could migrate none. A run would invent a lens nobody held; a member attestation would
 * invent an author. So a replay is a THIRD case, admitted by what the SERVER can check: (1) the creation arrives under
 * the ADMIN class, and (2) it names a REGISTERED drive-provenance capture whose preserved promotion records name THIS
 * bundle id and list THIS revision's `bundle.md` SHA-256. A replay (a) is exempt from rule 2, (b) keeps the
 * `surfaced_by` its Drive-era bytes carry — D-78 does not restamp it — and (c) reads `surfaced_in: not recorded
 * (migrated from the Drive era)`. Anything failing (1) or (2) is an ORDINARY creation: rule 2 and D-78 apply unchanged.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`b41d1edb`): `migrate.test.mjs` with a Drive-era question in its
 * fixture dies at `PROMOTE_FAILED ... rev 0: SURFACE_NO_RUN` — the admin token's replay of the question is refused.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks, and the arm that shows each one fails:
 *   (1) A CALLER-MADE CAPTURE — hand the plane provenance it does not HOLD, or hold bytes that were never registered as
 *       the Drive era's provenance: ARM N5a (named and registered in the request, never uploaded), N5b (held, but
 *       registered at another path), N5c (held and named, registered nowhere). The provenance is read back from R2 by
 *       its sha and hashed, never taken from the request.
 *   (2) A STALE OR BORROWED SHA — replay ALTERED bytes under a capture that lists the original (ARM N3, the SHA check,
 *       THE ROW'S NEGATIVE CONTROL); keep the listed figure in the file's `sha256` while the text is altered (ARM N3b —
 *       the store keeps the caller's figure as the head, so the plane computes it and demands equality); or borrow
 *       another bundle's capture that lists these very bytes (ARM N2, the bundle check).
 *   (3) THE WRONG CREDENTIAL — replay a perfectly valid package under the MEMBER or PROBE deploy token (ARM N4, N4b):
 *       the root of trust is the admin class, and nothing else is admitted. And forge the SERVER's stamp — send
 *       `migrationReplay` from a member's SESSION, whose creation rule 2 leaves alone (ARM N6): the stamp is deleted
 *       at the trust boundary and its question reads `not recorded`, never migrated.
 *   (4) USE THE DOOR TO SKIP A RUN — a failed replay that names the admin's own running run is an ORDINARY creation
 *       (ARM N7): it lands inside the run with its surfacing row, and D-78 restamps it `agent`.
 * And the over-strictness direction: ARM R2 replays a question whose matching Drive record is NOT the first, whose
 * history was truncated (its first surviving base is not the empty hash), and which lists `bundle.md` among several
 * files — it must be admitted.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) the ROOT OF TRUST's own honesty — an admin who uploads and registers a fabricated
 * provenance capture listing its own bytes is admitted, and nothing the record holds can tell; that is Membership
 * §DEC-2's deferral, out of this item's scope and stated as such; (ii) one isolate, one store per namespace; (iii) no
 * surface — it asserts what the plane SENDS; (iv) the `ai` class and the daemon — `ai` is not admin and falls to D-85's
 * gate unchanged (`d85-surface-run.test.mjs`), and the daemon holds no `promote`; (v) the migration tool end to end —
 * `migrate.test.mjs` owns that, and it now migrates a Drive-era question clean under the admin token.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC173_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { SURFACE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec173", MEM = "mem-rec173", PRB = "prb-rec173";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const EMPTY_SHA = sha("");
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

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");

/* A DRIVE-ERA QUESTION, surfaced there by a member: its bytes say `surfaced_by: human`. */
const questionMd = (id, { surfacedBy = "human", ask = `Did ${id} happen?` } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  'created: "2026-07-07T00:00:00Z"', 'last_updated: "2026-07-07T01:00:00Z"',
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `surfaced_by: ${surfacedBy}`, 'disposition_reason: ""',
  "---", "", "## Question", "", ask, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
/* THE PROVENANCE CAPTURE in the shape `migrate.mjs` writes: the Drive era's promotion records, verbatim. */
const provenanceOf = (bundleId, records) => Buffer.from(JSON.stringify({
  bundleId, migrated: "2026-09-23T00:00:00Z", source: "google-drive/CivicOS", indexEntry: null, manifest: null,
  promotions: records.map((record, i) => ({ key: `2026070${i + 7}T010000Z_rec173${String(i).padStart(2, "0")}`, record })),
  refusals: [], notes: [] }, null, 1), "utf8");
const record = (target, base, files) => ({ target, base, files, created: "2026-07-07T01:00:00Z", author: "ruth",
                                             skill_version: "0.12.10" });
const put = async (who, store, bytes) => {
  const r = parse(await RAW(`op=capture&${who}&store=${store}&sha256=${sha(bytes)}`, bytes, "PUT"));
  return r?.ok === true;
};
let seq = 0;
const PROV = "migration/drive-provenance.json";
/* ONE REPLAY PACKAGE, in `migrate.mjs`'s shape: the creation, `replay: true`, the provenance registered by it and
   named by it. Every field can be overridden by an arm. */
const replayPkg = (id, md, capSha, capBytes, over = {}) => ({
  bundleId: id, base: null,
  snapKey: `20260707T0100${String(++seq).padStart(2, "0")}Z_rec173aa`,
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Question ${id}`, current_state: "open",
          prior_state: null, created: "2026-07-07T00:00:00Z", last_updated: "2026-07-07T01:00:00Z" },
  files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
  replay: true,
  register: capSha ? [{ path: PROV, sha256: capSha, bytes: capBytes ? capBytes.length : 1, encoding: "utf8" }] : [],
  ...(capSha ? { provenanceCapture: capSha } : {}),
  ...over,
});
/* A Drive question and its matching capture, uploaded under the admin token into `store`. */
const driveQuestion = async (id, store = "bio", who = `token=${ADM}`) => {
  const md = questionMd(id);
  const cap = provenanceOf(id, [record(id, EMPTY_SHA, [{ name: "bundle.md", sha256: sha(md) }])]);
  return { id, md, cap, capSha: sha(cap), held: await put(who, store, cap) };
};
const projection = (id, store = "bio") => GET(`op=projection&${RUTH}&store=${store}&id=${E(id)}`);
const exists = async (id, store = "bio") => !!(await projection(id, store))?.bundle_id;
const bytesOf = async (id, store = "bio") => {
  const md = parse(await RAW(`op=file&${RUTH}&store=${store}&id=${E(id)}&path=bundle.md`));
  return typeof md === "string" ? md : (md?.text ?? md?.content ?? "");
};
const stats = (store = "bio") => GET(`op=stats&token=${ADM}&store=${store}`);
const S = SURFACE_CHECKS.SURFACE_NO_RUN;
const refused = (x) => [x?.ok, x?.code, x?.check, x?.translation];
const NO_RUN = [false, "SURFACE_NO_RUN", S?.check, S?.translation];
const promote = (who, pkg) => POST(`op=promote&${who}`, pkg);
const ADMIN = `token=${ADM}&store=bio`;

console.log("\n--- FIXTURE ---");
const c0 = await stats();
t("FIXTURE: the store counts migration replays and starts at zero — a count that is absent would make every "
  + "`nothing landed` arm below vacuous", [typeof c0?.inquiryMigrationReplays, c0?.inquiryMigrationReplays], ["number", 0]);

console.log("\n--- ARM R · THE REPLAY IS ADMITTED ---");
{
  const q = await driveQuestion("PROB-2026-9173-drive-question");
  const before = await stats();
  const x = await promote(ADMIN, replayPkg(q.id, q.md, q.capSha, q.cap));
  t("ARM R1 (THE REPLAY): the admin token's creation naming its registered, held drive-provenance capture lands, "
    + "names the capture and the Drive promotion, and carries no run", [q.held, x?.ok, x?.migration_replay?.capture,
      typeof x?.migration_replay?.promotion, "surfaced_in" in (x ?? {})], [true, true, q.capSha, "string", false]);
  const md = await bytesOf(q.id);
  t("ARM R1b (DRIVE-ERA BYTES KEPT): the landed question still says `surfaced_by: human` — D-78 did NOT restamp it — "
    + "and its head IS the SHA-256 the Drive record listed", [/\nsurfaced_by: human\n/.test(md), x?.bundleSha, sha(md)],
    [true, sha(q.md), sha(q.md)]);
  const p = await projection(q.id);
  t("ARM R1c (THE READ): `surfaced_in` states `not recorded (migrated from the Drive era)`, names no run and no lens, "
    + "and names the provenance capture", [p?.surfaced_in?.recorded, p?.surfaced_in?.stated, p?.surfaced_in?.run,
      p?.surfaced_in?.lens, p?.surfaced_in?.migrated?.capture],
    [false, "not recorded (migrated from the Drive era)", null, null, q.capSha]);
  const after = await stats();
  t("ARM R1d (THE ROW): one migration-replay row, NO surfacing row",
    [after?.inquiryMigrationReplays - before?.inquiryMigrationReplays, after?.inquiryRunSurfacings - before?.inquiryRunSurfacings],
    [1, 0]);

  /* OVER-STRICTNESS: a truncated history (the first surviving record's base is not the empty hash), the matching record
     SECOND of two, and `bundle.md` listed among several files. */
  const id2 = "PROB-2026-9173-truncated-history";
  const md2 = questionMd(id2, { ask: "Was the contract renewed?" });
  const cap2 = provenanceOf(id2, [
    record(id2, "9".repeat(64), [{ name: "bundle.md", sha256: "8".repeat(64) }]),
    record(id2, "8".repeat(64), [{ name: "data/gathering.json", sha256: "7".repeat(64) },
                                 { name: "bundle.md", sha256: sha(md2) },
                                 { name: "snapshots/doc.pdf", sha256: "6".repeat(64), encoding: "base64" }]),
  ]);
  const held2 = await put(`token=${ADM}`, "bio", cap2);
  const x2 = await promote(ADMIN, replayPkg(id2, md2, sha(cap2), cap2));
  t("ARM R2 (OVER-STRICTNESS): a replay whose matching Drive record is the SECOND, of a TRUNCATED history, listing "
    + "bundle.md among several files, is admitted", [held2, x2?.ok, x2?.migration_replay?.capture, x2?.code ?? null],
    [true, true, sha(cap2), null]);
}

console.log("\n--- ARM N · EVERYTHING ELSE IS AN ORDINARY CREATION, REFUSED OUTSIDE A RUN ---");
{
  const before = await stats();

  const q1 = await driveQuestion("PROB-2026-9173-names-no-capture");
  const x1 = await promote(ADMIN, replayPkg(q1.id, q1.md, q1.capSha, q1.cap, { provenanceCapture: undefined }));
  t("ARM N1 (NAMES NO CAPTURE): the admin's creation that registers the capture but names none is refused "
    + "SURFACE_NO_RUN, and nothing landed", [...refused(x1), await exists(q1.id)], [...NO_RUN, false]);

  const q2 = await driveQuestion("PROB-2026-9173-borrowed-capture");
  const other = "PROB-2026-9173-some-other-question";
  const cap2 = provenanceOf(other, [record(other, EMPTY_SHA, [{ name: "bundle.md", sha256: sha(q2.md) }])]);
  await put(`token=${ADM}`, "bio", cap2);
  const x2 = await promote(ADMIN, replayPkg(q2.id, q2.md, sha(cap2), cap2));
  t("ARM N2 (ANOTHER BUNDLE'S CAPTURE): a capture whose records list THESE very bytes but name ANOTHER bundle is "
    + "refused SURFACE_NO_RUN — the bundle check, alone — and nothing landed", [...refused(x2), await exists(q2.id)],
    [...NO_RUN, false]);

  const q3 = await driveQuestion("PROB-2026-9173-altered-bytes");
  const altered = questionMd(q3.id, { ask: "Did the council vote to approve it unanimously?" });
  const x3 = await promote(ADMIN, replayPkg(q3.id, altered, q3.capSha, q3.cap));
  t("ARM N3 (ALTERED BYTES — THE SHA CHECK): the right capture for the right bundle, replaying bytes whose SHA-256 its "
    + "records do not list, is refused SURFACE_NO_RUN, and nothing landed", [...refused(x3), await exists(q3.id)],
    [...NO_RUN, false]);

  const q3b = await driveQuestion("PROB-2026-9173-stale-sha");
  const alt3b = questionMd(q3b.id, { surfacedBy: "human", ask: "Who ordered the audit?" });
  const pkg3b = replayPkg(q3b.id, alt3b, q3b.capSha, q3b.cap);
  pkg3b.files[0].sha256 = sha(q3b.md);          // THE LIAR keeps the listed figure over altered text
  const x3b = await promote(ADMIN, pkg3b);
  t("ARM N3b (A STALE SHA): altered text carrying the LISTED SHA-256 in its `sha256` field is refused SURFACE_NO_RUN — "
    + "the plane computes the figure, it never takes it — and nothing landed", [...refused(x3b), await exists(q3b.id)],
    [...NO_RUN, false]);

  const q4 = await driveQuestion("PROB-2026-9173-member-token");
  const x4 = await promote(`token=${MEM}&store=bio`, replayPkg(q4.id, q4.md, q4.capSha, q4.cap));
  t("ARM N4 (MEMBER TOKEN): a perfectly valid replay package under the MEMBER deploy token is refused SURFACE_NO_RUN, "
    + "and nothing landed", [...refused(x4), await exists(q4.id)], [...NO_RUN, false]);
  const q4b = await driveQuestion("PROB-2026-9173-probe-token", "scratch", `token=${PRB}`);
  const x4b = await promote(`token=${PRB}&store=scratch`, replayPkg(q4b.id, q4b.md, q4b.capSha, q4b.cap));
  t("ARM N4b (PROBE TOKEN): the same under the PROBE token, in scratch, is refused SURFACE_NO_RUN, and nothing landed",
    [q4b.held, ...refused(x4b), await exists(q4b.id, "scratch")], [true, ...NO_RUN, false]);

  const idA = "PROB-2026-9173-never-held";
  const mdA = questionMd(idA);
  const capA = provenanceOf(idA, [record(idA, EMPTY_SHA, [{ name: "bundle.md", sha256: sha(mdA) }])]);
  const x5a = await promote(ADMIN, replayPkg(idA, mdA, sha(capA), capA));   // never PUT
  t("ARM N5a (CALLER-MADE: NOT HELD): a capture named and registered in the request but never uploaded is refused "
    + "SURFACE_NO_RUN, and nothing landed", [...refused(x5a), await exists(idA)], [...NO_RUN, false]);
  const q5b = await driveQuestion("PROB-2026-9173-wrong-path");
  const pkg5b = replayPkg(q5b.id, q5b.md, q5b.capSha, q5b.cap);
  pkg5b.register = [{ path: "data/provenance.json", sha256: q5b.capSha, bytes: q5b.cap.length, encoding: "utf8" }];
  const x5b = await promote(ADMIN, pkg5b);
  t("ARM N5b (CALLER-MADE: NOT THE DRIVE PROVENANCE): a held capture registered at another path is refused "
    + "SURFACE_NO_RUN, and nothing landed", [...refused(x5b), await exists(q5b.id)], [...NO_RUN, false]);
  const q5c = await driveQuestion("PROB-2026-9173-unregistered");
  const x5c = await promote(ADMIN, replayPkg(q5c.id, q5c.md, q5c.capSha, q5c.cap, { register: [] }));
  t("ARM N5c (CALLER-MADE: REGISTERED NOWHERE): a held capture the creation names but does not register is refused "
    + "SURFACE_NO_RUN, and nothing landed", [...refused(x5c), await exists(q5c.id)], [...NO_RUN, false]);

  const after = await stats();
  t("ARM N0: none of the refused creations wrote a migration-replay row or a surfacing row",
    [after?.inquiryMigrationReplays - before?.inquiryMigrationReplays, after?.inquiryRunSurfacings - before?.inquiryRunSurfacings],
    [0, 0]);
}

console.log("\n--- ARM N6 · THE STAMP IS THE SERVER's ---");
{
  const id = "PROB-2026-9173-forged-stamp";
  const md = questionMd(id, { ask: "Was the stamp forged?" });
  const x = await promote(`${RUTH}&store=bio`, { ...replayPkg(id, md, null, null),
    migrationReplay: { capture: "a".repeat(64), promotion: "forged" } });
  const p = await projection(id);
  t("ARM N6 (A FORGED STAMP): a member's SESSION sending `migrationReplay` lands as her own question — never a replay "
    + "— and its read says `not recorded`, not migrated", [x?.ok, "migration_replay" in (x ?? {}), p?.surfaced_in?.stated,
      "migrated" in (p?.surfaced_in ?? {})], [true, false, "not recorded", false]);
}

console.log("\n--- ARM N7 · A FAILED REPLAY IS AN ORDINARY CREATION: rule 2 and D-78 unchanged ---");
{
  const Q = "INQ-2026-9173-context";
  const qc = await promote(`${RUTH}&store=bio`, { ...replayPkg(Q, questionMd(Q), null, null), replay: undefined });
  const run = "RUN-2026-0923-rec173-admin";
  const op = await POST(`op=airunopen&${ADMIN}`, {
    run, contextType: "inquiry", contextId: Q, label: "REC-173 run", mode: "check",
    principalClaude: "instance", principalClaudeRef: "believe-in-oakland/claude", skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }, { bound: "surfaces", allowed: 3, unit: "questions" }],
    leaseMs: 600000 });
  t("REACH: the context question exists and the admin token holds a running run over it", [qc?.ok, op?.started], [true, true]);
  const q = await driveQuestion("PROB-2026-9173-inside-a-run");
  const altered = questionMd(q.id, { ask: "Did the vote happen twice?" });
  const x = await promote(ADMIN, replayPkg(q.id, altered, q.capSha, q.cap, { run }));
  const md = await bytesOf(q.id);
  const p = await projection(q.id);
  t("ARM N7 (THE DOOR DOES NOT SKIP A RUN): a replay that fails the SHA check but names the admin's own running run "
    + "lands INSIDE the run, as an ordinary creation — surfacing row, no replay — and D-78 restamps it `agent`",
    [x?.ok, x?.surfaced_in?.run, "migration_replay" in (x ?? {}), /\nsurfaced_by: agent\n/.test(md),
     p?.surfaced_in?.recorded, p?.surfaced_in?.run], [true, run, false, true, true, run]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nrec173-migration-replay: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
