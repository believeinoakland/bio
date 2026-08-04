/* REC-9 / CONSTRUCTS Step 8 (PRESENTATION, document-page half): op=captureprogressions —
 * map a CAPTURE back to the progression INSTANCES it sits in.
 *
 * UI-9's document page shows, for one captured document, its place in the accountability web. Items
 * (1) resolved subjects and (2) connections read existing per-capture ops; items (3) which
 * progressions this document is in and at which stage and (4) whether a required successor is OVERDUE
 * had NO op — op=instance needs BOTH (progression_key, entity_id), and op=proposals walks every
 * instance but carries no capture_sha to tie a finding to THIS document. REC-9 adds that op.
 *
 * It is READ-ONLY and DERIVE-ON-READ (no table — an instance's findings go stale if stored, FW-9's own
 * reasoning): the instances are found by JOINING progression_instances on capture_sha, and each
 * instance's findings are recomputed at the ONE derivation point — #assembleInstance for the
 * missing_predecessor findings (FW-10 discharge doctrine enforced there) and REC-8's #overdueFindings
 * for the overdue_successor findings, against the SAME injectable clock op=proposals opened (a `now`
 * as-of param / BIO_NOW_MS), never re-implemented here.
 *
 * It drives everything THROUGH the control plane (op=captureprogressions, a real caller's route — the
 * D-43 class). It proves ACCEPTS-WHEN: a capture threaded into a progression returns that instance, the
 * CAPTURE's OWN stage in it, and its findings — INCLUDING an overdue_successor when the successor is
 * overdue by the injected clock, and NONE when not; a capture in NO progression returns an empty list.
 * All fixture dates are in the real FUTURE (2026-12 / 2027) so an armed alarm never fires in the test.
 *
 * NEGATIVE CONTROL: in src/store.mjs captureProgressions, drop the capture-join by forcing it to find no placements (`const rows = [];` in place of the SELECT ... WHERE capture_sha=?) -> the op returns an EMPTY instances[] for a capture KNOWN to be threaded, so its stage and findings vanish. RUN 2026-08-01 record-agent-9: with the join dropped 6 assertions FAIL (the award capture's count/instance, its stage + progression + subject, its missing-predecessor finding + established projection, its AFTER-deadline both-kinds + the overdue finding's grade/deadline/overdue_by_ms, and the need capture's own stage) while the other 7 still PASS (the two setup asserts, the BEFORE/reset absence-of-overdue asserts, the two "capture in NO progression -> empty" asserts, and the NO_SHA refusal — all expect an empty/refused answer, which the neutered join produces for everything); restored -> 13/13 green. Confirms the membership, stage, and findings all came from the capture-join and nothing else.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const script = readFileSync(IDX, "utf8");
const makeMf = (extra = {}) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r9", MEMBER_TOKEN: "mem-r9", PROBE_TOKEN: "prb-r9", VERSION: "test", ...extra },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const mkApi = (mf) => ({
  post: async (op, body, tok = "mem-r9") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json()),
  get: async (op, qs, tok = "mem-r9") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json()),
});

/* All fixture dates are in the real FUTURE so an armed alarm never fires inside the test. */
const NEED_AT     = "2026-12-01T00:00:00Z";
const AWARD_AT    = "2027-01-01T00:00:00Z";
const AWARD_MS    = Date.parse(AWARD_AT);
const DEADLINE_MS = AWARD_MS + 90 * 86400000;                 // "90 days" fixed span -> 2027-04-01
const BEFORE_MS   = Date.parse("2027-03-01T00:00:00Z");        // before the deadline
const AFTER_MS    = Date.parse("2027-05-01T00:00:00Z");        // past the deadline

const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${AWARD_AT}`, `last_updated: ${AWARD_AT}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${AWARD_AT}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A bundle.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
const promoteReading = async (post, captureSha, entities, at) => {
  const id = `INFO-2027-${String(++bseq).padStart(4, "0")}-r9`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "procurement", reader_version: 1, found: entities.length > 0, at, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20270101T010000Z_aaaa1111", author: "r9",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`,
            current_state: "collected", created: AWARD_AT, last_updated: AWARD_AT },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};
const refFor = (alias) => [{ ref: alias, kind: "contract", key: alias.split(":")[1], label: alias }];

/* ===================================================================== *
 * The accepts-when, on ONE store. BIO_NOW_MS is the ambient clock       *
 * (BEFORE the deadline); op=captureprogressions&now moves it.           *
 * ===================================================================== */
{
  const mf = makeMf({ BIO_NOW_MS: String(BEFORE_MS), CONNECTION_DERIVE_DELAY_MS: "600000" });
  try {
    const { post, get } = mkApi(mf);

    /* procurement: need -> award -> contract. contract has a PARSEABLE 90-day interval after award. */
    const proc = await post("progressiondefine", { progressionKey: "procure", label: "Procurement",
      stages: [
        { key: "need",     label: "staff report",    cardinality: "1", required: "always" },
        { key: "award",    label: "council award",   after: "need",  cardinality: "1", required: "always" },
        { key: "contract", label: "signed contract", after: "award", cardinality: "1", within: "90 days", required: "always" },
      ] });
    t("the procurement progression is defined (3 stages, contract within 90 days of award)",
      [proc.ok, proc.stage_count], [true, 3]);

    /* Entity M: need + award PLACED and DATED (award at AWARD_AT). contract absent. */
    const eM = await post("entitycreate", { kind: "contract", label: "Procurement M", aliases: ["contract:PM"] });
    const mid = eM.entity_id;
    const mNeed = sha("r9-M-need"), mAward = sha("r9-M-award");
    await promoteReading(post, mNeed, refFor("contract:PM"), NEED_AT);
    await promoteReading(post, mAward, refFor("contract:PM"), AWARD_AT);
    await post("resolve", { captureSha: mNeed });
    await post("resolve", { captureSha: mAward });
    const thrM = await post("thread", { progressionKey: "procure", entityId: mid,
      placements: [{ stage: "need", captureSha: mNeed }, { stage: "award", captureSha: mAward }] });
    t("two stages placed -> instance grade DETERMINED at A (both resolved by identifier)",
      [thrM.grade, thrM.grade_determined], ["A", true]);

    /* ---- the AWARD capture, BEFORE the deadline: found, at its stage, missing-but-not-overdue ---- */
    console.log("\n--- op=captureprogressions for the AWARD capture, BEFORE the deadline ---");
    const awBefore = await get("captureprogressions", "sha256=" + mAward);
    t("ACCEPTS-WHEN: the op answers ok and returns EXACTLY ONE instance for a threaded capture",
      [awBefore.ok, awBefore.capture_sha, awBefore.count], [true, mAward, 1]);
    /* `|| {}` / `|| []` so the NEGATIVE CONTROL (dropped join -> empty instances) FAILS these
       assertions cleanly on a value mismatch rather than crashing, giving an exact fail count. */
    const iAwB = awBefore.instances[0] || {};
    t("the instance names its progression + subject, and the CAPTURE's OWN stage in it (award / council award)",
      [iAwB.progression_key, iAwB.progression_label, iAwB.entity_id, iAwB.entity_label, iAwB.stage_key, iAwB.stage_label],
      ["procure", "Procurement", mid, "Procurement M", "award", "council award"]);
    const mpB = (iAwB.findings || []).find((f) => f.kind === "missing_predecessor" && f.stage_key === "contract") || {};
    t("its findings carry the instance's missing_predecessor (contract), graded A, projected established",
      [!!mpB.kind, mpB.grade, mpB.grade_determined, mpB.established, mpB.needs_confirmation],
      [true, "A", true, true, false]);
    t("BEFORE the deadline NO overdue_successor finding is present (missing, but not yet overdue)",
      (iAwB.findings || []).some((f) => f.kind === "overdue_successor"), false);

    /* ---- the AWARD capture, AFTER the deadline (as-of now): the contract successor is OVERDUE ---- */
    console.log("\n--- op=captureprogressions&now for the AWARD capture, AFTER the deadline ---");
    const awAfter = await get("captureprogressions", "sha256=" + mAward + "&now=" + AFTER_MS);
    const iAwA = awAfter.instances[0] || {};
    t("the capture's stage is unchanged AFTER the deadline (award), and BOTH finding kinds are present",
      [iAwA.stage_key, (iAwA.findings || []).some((f) => f.kind === "missing_predecessor" && f.stage_key === "contract"),
       (iAwA.findings || []).some((f) => f.kind === "overdue_successor" && f.stage_key === "contract")],
      ["award", true, true]);
    const odA = (iAwA.findings || []).find((f) => f.kind === "overdue_successor") || {};
    t("ACCEPTS-WHEN: the overdue_successor names the contract, carries grade A (established), the deadline, and how late it is",
      [odA.stage_key, odA.grade, odA.established, odA.deadline, odA.overdue_by_ms === AFTER_MS - DEADLINE_MS,
       odA.predecessor_stage],
      ["contract", "A", true, new Date(DEADLINE_MS).toISOString(), true, "award"]);

    /* ---- the NEED capture: SAME instance, but its OWN stage is need (the CAPTURE's stage, not the instance's) ---- */
    console.log("\n--- op=captureprogressions for the NEED capture: same instance, its own stage ---");
    const ndAfter = await get("captureprogressions", "sha256=" + mNeed + "&now=" + AFTER_MS);
    const iNd = ndAfter.instances[0] || {};
    t("the NEED capture reports ITS OWN stage (need / staff report) while the findings are the instance's (contract overdue)",
      [ndAfter.count, iNd.stage_key, iNd.stage_label,
       (iNd.findings || []).some((f) => f.kind === "overdue_successor" && f.stage_key === "contract")],
      [1, "need", "staff report", true]);

    /* ---- in-suite clock control: reset now to before the deadline -> overdue disappears ---- */
    console.log("\n--- reset the injected clock to before the deadline -> the overdue finding disappears ---");
    const awReset = await get("captureprogressions", "sha256=" + mAward + "&now=" + BEFORE_MS);
    t("the finding is clock-driven, not stored: BEFORE the deadline no overdue_successor is derived",
      ((awReset.instances[0] || {}).findings || []).some((f) => f.kind === "overdue_successor"), false);

    /* ---- a capture in NO progression returns an EMPTY list, honestly ---- */
    console.log("\n--- a capture threaded into NO progression returns an empty list ---");
    const lone = sha("r9-lone-capture");
    await promoteReading(post, lone, refFor("contract:PM"), AWARD_AT);   // a real, promoted document, never threaded
    const loneR = await get("captureprogressions", "sha256=" + lone);
    t("a promoted-but-unthreaded capture returns ok with an empty instances list -- never a fabricated membership",
      [loneR.ok, loneR.count, loneR.instances], [true, 0, []]);
    const unknownR = await get("captureprogressions", "sha256=" + sha("r9-never-seen"));
    t("an entirely unknown sha likewise returns an honest empty list (no membership invented)",
      [unknownR.ok, unknownR.count], [true, 0]);

    /* ---- a missing sha is a NAMED refusal, not a platform error (I3: a refusal is a structured answer) ---- */
    const noSha = await get("captureprogressions", "");
    t("no sha256 -> a NAMED refusal (NO_SHA), not an exception (I3, D-39)",
      [noSha.ok, noSha.reason], [false, "NO_SHA"]);
  } finally {
    await mf.dispose();
  }
}

console.log(`\ncapture-progressions: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
