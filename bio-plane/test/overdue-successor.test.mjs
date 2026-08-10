/* REC-8 / CONSTRUCTS Step 7 (AGEING): the record NOTICES when a required successor is OVERDUE.
 *
 * FW-8 gave every progression stage a `within_interval`; nothing checked it, so a stage could be
 * arbitrarily overdue and the record stayed silent. REC-8 checks it. The overdue-successor finding
 * is DERIVED ON READ (an overdue flag goes stale against the clock, the same argument FW-9 made for
 * the missing-predecessor grade) — there is NO overdue table. It surfaces through op=proposals as a
 * DISTINCT finding kind (`overdue_successor`) ALONGSIDE the missing_predecessor finding, so a
 * consumer tells "never happened" from "not yet, but overdue". A SCHEDULED consumer on REC-1's DO
 * alarm (`overdue-scan`, the second framework consumer) is the PUSH SIGNAL: it wakes at the next
 * deadline and self-terminates, writing nothing.
 *
 * "now" is an INJECTABLE clock so the computation is deterministic in the suite, two seams both
 * exercised here: env BIO_NOW_MS (the ambient clock), and an op=proposals&now=<ms> as-of instant.
 * The alarm path is driven by onAlarm(now) with a pinned virtual clock, exactly as
 * scheduler.test.mjs / connection-derive-sweep.test.mjs drive it. All fixture dates are in the real
 * FUTURE (2026-12 / 2027) so an armed alarm at a real-future deadline never fires inside the test.
 *
 * It drives everything THROUGH the control plane (op=proposals, a real caller's route, the D-43
 * class). It proves ACCEPTS-WHEN: a required successor absent PAST its within_interval surfaces an
 * overdue_successor finding; the SAME instance BEFORE the deadline does NOT; a non-parseable
 * `within_interval` ("before the meeting") is NEVER overdue; a DISCHARGED successor (FW-10) is not
 * overdue; a predecessor with NO determinable date is not overdue (undetermined, never a fabricated
 * deadline). And the injected clock is a real control: resetting it to before the deadline makes the
 * overdue finding disappear.
 *
 * NEGATIVE CONTROL: in src/store.mjs #instanceDeadlines (the ONE derivation both the feed and the alarm read), force it to find nothing (`return out;` immediately after `const out = [];`) -> no overdue is ever derived: op=proposals surfaces NO overdue_successor for a genuinely-overdue contract and the AFTER proposal is not overdue, and the alarm's overduescan.overdue_count stays 0 with no future deadline to wake for. RUN 2026-07-31 record-agent-8: with #instanceDeadlines neutered 7 assertions FAIL (the AFTER "overdue true/both kinds", the distinct overdue_successor finding, its grade/deadline, the BEFORE tick re-arming to the deadline, the named next_deadline, the AFTER tick's overdue_count 1, and PART 2's env-clock overdue) while the missing_predecessor / BEFORE / non-parseable / discharge / no-date / self-terminate assertions still PASS (they do not depend on the overdue layer); restored -> 22/22 green. Confirms the overdue signal came from the deadline derivation and nothing else.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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
  bindings: { ADMIN_TOKEN: "adm-r8", MEMBER_TOKEN: "mem-r8", PROBE_TOKEN: "prb-r8", VERSION: "test", ...extra },
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
  post: async (op, body, tok = "mem-r8") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json()),
  get: async (op, qs, tok = "mem-r8") => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json()),
});
const getObj = async (mf) => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };

/* All fixture dates are in the real FUTURE so an armed alarm never fires inside the test. */
const NEED_AT    = "2026-12-01T00:00:00Z";
const AWARD_AT   = "2027-01-01T00:00:00Z";
const AWARD_MS   = Date.parse(AWARD_AT);
const DEADLINE_MS = AWARD_MS + 90 * 86400000;                 // "90 days" is a fixed-span unit -> 2027-04-01
const BEFORE_MS  = Date.parse("2027-03-01T00:00:00Z");        // before the deadline
const AFTER_MS   = Date.parse("2027-05-01T00:00:00Z");        // past the deadline

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
/* promote a document carrying a crafted reading. `at` is the document's own date (FW-5); pass null
   AND rely on register: [] (no register row) to make the date UNDETERMINABLE. */
const promoteReading = async (post, captureSha, entities, at) => {
  const id = `INFO-2027-${String(++bseq).padStart(4, "0")}-r8`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "procurement", reader_version: 1, found: entities.length > 0, at, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20270101T010000Z_aaaa1111", author: "r8",
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
 * PART 1 — the accepts-when, on ONE store. BIO_NOW_MS is the ambient    *
 * clock (BEFORE the deadline); op=proposals&now moves it deterministically.
 * ===================================================================== */
{
  const mf = makeMf({ BIO_NOW_MS: String(BEFORE_MS), CONNECTION_DERIVE_DELAY_MS: "600000" });
  try {
    const { post, get } = mkApi(mf);
    const obj = await getObj(mf);

    /* procurement: need -> award -> kickoff / contract. contract has a PARSEABLE 90-day interval;
       kickoff has a NON-parseable one ("before the meeting"), so a missing kickoff is never overdue. */
    const proc = await post("progressiondefine", { progressionKey: "procure", label: "Procurement",
      stages: [
        { key: "need",     label: "staff report",     cardinality: "1",   required: "always" },
        { key: "award",    label: "council award",    after: "need",  cardinality: "1",   required: "always" },
        { key: "kickoff",  label: "kickoff meeting",  after: "award", cardinality: "0..1", within: "before the meeting", required: "usually" },
        { key: "contract", label: "signed contract",  after: "award", cardinality: "1",   within: "90 days", required: "always" },
      ] });
    t("the procurement progression is defined (4 stages, contract within 90 days of award)",
      [proc.ok, proc.stage_count], [true, 4]);

    /* Entity M: need + award PLACED and DATED (award at AWARD_AT). contract + kickoff absent. */
    const eM = await post("entitycreate", { kind: "contract", label: "Procurement M", aliases: ["contract:PM"] });
    const mid = eM.entity_id;
    const mNeed = sha("r8-M-need"), mAward = sha("r8-M-award");
    await promoteReading(post, mNeed, refFor("contract:PM"), NEED_AT);
    await promoteReading(post, mAward, refFor("contract:PM"), AWARD_AT);
    await post("resolve", { captureSha: mNeed });
    await post("resolve", { captureSha: mAward });
    const thrM = await post("thread", { progressionKey: "procure", entityId: mid,
      placements: [{ stage: "need", captureSha: mNeed }, { stage: "award", captureSha: mAward }] });
    t("two stages placed -> instance grade DETERMINED at A (both resolved by identifier)",
      [thrM.grade, thrM.grade_determined], ["A", true]);
    t("both missing required successors fire as missing_predecessor (kickoff + contract)",
      thrM.findings.map((f) => f.stage_key).sort(), ["contract", "kickoff"]);

    /* ---- BEFORE the deadline (ambient BIO_NOW_MS): missing, but NOT overdue ---- */
    console.log("\n--- BEFORE the deadline (ambient env clock): the contract is missing but NOT overdue ---");
    const feedBefore = await get("proposals", "");
    const cBefore = feedBefore.proposals.find((p) => p.key === "procure::contract");
    t("op=proposals answers ok, and the contract gap IS surfaced as a proposal",
      [feedBefore.ok, !!cBefore], [true, true]);
    t("BEFORE the deadline the contract proposal is NOT overdue (overdue false, kinds missing-only)",
      [cBefore.overdue, cBefore.overdue_count, cBefore.kinds], [false, 0, ["missing_predecessor"]]);
    const mInstBefore = feedBefore.instances.find((i) => i.entity_id === mid);
    t("and NO overdue_successor finding is present on the instance BEFORE the deadline",
      mInstBefore.findings.some((f) => f.kind === "overdue_successor"), false);

    /* ---- AFTER the deadline (as-of now param): the contract is OVERDUE ---- */
    console.log("\n--- AFTER the deadline (op=proposals&now): the SAME contract is now OVERDUE ---");
    const feedAfter = await get("proposals", "now=" + AFTER_MS);
    const cAfter = feedAfter.proposals.find((p) => p.key === "procure::contract");
    t("ACCEPTS-WHEN: AFTER the deadline the contract proposal is OVERDUE (overdue true, both kinds), grade A intact",
      [cAfter.overdue, cAfter.overdue_count, cAfter.kinds, cAfter.grade, cAfter.grade_determined],
      [true, 1, ["missing_predecessor", "overdue_successor"], "A", true]);
    const mInstAfter = feedAfter.instances.find((i) => i.entity_id === mid);
    const odf = mInstAfter.findings.find((f) => f.kind === "overdue_successor") || {};
    t("the DISTINCT overdue_successor finding is surfaced through op=proposals, alongside missing_predecessor",
      [mInstAfter.findings.some((f) => f.kind === "missing_predecessor"), !!odf.kind, odf.stage_key ?? null],
      [true, true, "contract"]);
    t("the overdue finding carries the instance's grade (A), its deadline (award + 90 days), and how late it is",
      [odf.grade ?? null, odf.grade_determined ?? null, odf.deadline ?? null, odf.predecessor_stage ?? null,
       odf.overdue_by_ms === AFTER_MS - DEADLINE_MS],
      ["A", true, new Date(DEADLINE_MS).toISOString(), "award", true]);

    /* ---- the NON-parseable interval is never overdue ---- */
    console.log("\n--- a non-parseable within_interval ('before the meeting') is NEVER overdue ---");
    const kAfter = feedAfter.proposals.find((p) => p.key === "procure::kickoff");
    t("kickoff (missing, required) is a missing_predecessor but NEVER overdue -- its interval does not parse",
      [!!kAfter, kAfter.overdue, kAfter.kinds], [true, false, ["missing_predecessor"]]);
    t("and no overdue_successor finding names kickoff, even past every plausible date",
      mInstAfter.findings.some((f) => f.kind === "overdue_successor" && f.stage_key === "kickoff"), false);

    /* ---- NEGATIVE CONTROL, in-suite: reset the clock to before the deadline -> overdue disappears ---- */
    console.log("\n--- NEGATIVE CONTROL: reset the injected clock to before the deadline -> the overdue finding disappears ---");
    const feedReset = await get("proposals", "now=" + BEFORE_MS);
    const cReset = feedReset.proposals.find((p) => p.key === "procure::contract");
    t("reset now to BEFORE the deadline and the contract is no longer overdue (the finding is clock-driven, not stored)",
      [cReset.overdue, feedReset.instances.find((i) => i.entity_id === mid).findings.some((f) => f.kind === "overdue_successor")],
      [false, false]);

    /* ---- a DISCHARGED successor (FW-10) is not overdue ---- */
    console.log("\n--- a DISCHARGED successor is not overdue (a lawful recorded skip is not a gap) ---");
    const eD = await post("entitycreate", { kind: "contract", label: "Procurement D", aliases: ["contract:PD"] });
    const did = eD.entity_id;
    const dNeed = sha("r8-D-need"), dAward = sha("r8-D-award"), dMemo = sha("r8-D-memo");
    for (const [s, a] of [[dNeed, NEED_AT], [dAward, AWARD_AT], [dMemo, AWARD_AT]])
      await promoteReading(post, s, refFor("contract:PD"), a);
    for (const s of [dNeed, dAward, dMemo]) await post("resolve", { captureSha: s });
    await post("thread", { progressionKey: "procure", entityId: did,
      placements: [{ stage: "need", captureSha: dNeed }, { stage: "award", captureSha: dAward }] });
    const disc = await post("discharge", { progressionKey: "procure", entityId: did, stage: "contract", captureSha: dMemo,
      reason: "sole-source emergency -- no separate contract instrument was issued", citation: "City Administrator finding" });
    t("op=discharge records the exception against D's contract stage", [disc.ok, disc.discharged_stage], [true, "contract"]);
    const feedDisc = await get("proposals", "now=" + AFTER_MS);
    t("D's contract, discharged, produces NO overdue_successor (nor any open contract finding for D) even past the deadline",
      (feedDisc.instances.find((i) => i.entity_id === did) || { findings: [] }).findings
        .some((f) => f.stage_key === "contract"), false);

    /* ---- a predecessor with NO determinable date is not overdue ---- */
    console.log("\n--- a predecessor with no determinable date is NOT overdue (undetermined, never a fabricated deadline) ---");
    const eN = await post("entitycreate", { kind: "contract", label: "Procurement N", aliases: ["contract:PN"] });
    const nid = eN.entity_id;
    const nNeed = sha("r8-N-need"), nAward = sha("r8-N-award");
    await promoteReading(post, nNeed, refFor("contract:PN"), NEED_AT);
    await promoteReading(post, nAward, refFor("contract:PN"), null);   // award UNDATED (reading.at null, no register row)
    await post("resolve", { captureSha: nNeed });
    await post("resolve", { captureSha: nAward });
    await post("thread", { progressionKey: "procure", entityId: nid,
      placements: [{ stage: "need", captureSha: nNeed }, { stage: "award", captureSha: nAward }] });
    const feedN = await get("proposals", "now=" + AFTER_MS);
    const nInst = feedN.instances.find((i) => i.entity_id === nid);
    t("N's contract is STILL a missing_predecessor (the gap is real) ...",
      nInst.findings.some((f) => f.kind === "missing_predecessor" && f.stage_key === "contract"), true);
    t("... but NOT overdue: award carries no determinable date, so no deadline is computed and none is fabricated",
      nInst.findings.some((f) => f.kind === "overdue_successor" && f.stage_key === "contract"), false);

    /* ===================================================================== *
     * The SCHEDULED consumer: the overdue-scan rides REC-1's DO alarm.       *
     * ===================================================================== */
    console.log("\n--- the SCHEDULED overdue-scan consumer wakes at the next deadline and self-terminates ---");
    /* threading ARMED the alarm; first drain the connection-derive dirt, then the alarm settles to
       the overdue deadline. Driven by hand at a pinned virtual clock, as the scheduler suites do. */
    const tickBefore = await obj.onAlarm(BEFORE_MS);
    t("at a tick BEFORE the deadline, the overdue-scan reports NOTHING overdue yet, and the alarm re-arms to the DEADLINE",
      [tickBefore.overduescan.overdue_count, tickBefore.nextAt, tickBefore.rearmed],
      [0, DEADLINE_MS, true]);
    t("and the earliest future deadline it names is the contract's (award + 90 days)",
      tickBefore.overduescan.next_deadline, DEADLINE_MS);
    const tickAfter = await obj.onAlarm(AFTER_MS);
    t("at a tick AFTER the deadline, the overdue-scan NOTICES exactly one overdue successor (M's contract)",
      tickAfter.overduescan.overdue_count, 1);
    t("with no future deadline left, the consumer SELF-TERMINATES (wake null, not re-armed)",
      [tickAfter.overduescan.next_deadline, tickAfter.rearmed], [null, false]);
    t("the alarm is actually cleared once nothing is left to notice", await obj.schedAlarmAt(), null);
  } finally {
    await mf.dispose();
  }
}

/* ===================================================================== *
 * PART 2 — the ENV seam alone. BIO_NOW_MS pinned PAST the deadline, and  *
 * op=proposals with NO param surfaces the overdue finding -> the ambient *
 * env clock drives it, not only the as-of param.                        *
 * ===================================================================== */
{
  const mf = makeMf({ BIO_NOW_MS: String(AFTER_MS), CONNECTION_DERIVE_DELAY_MS: "600000" });
  try {
    const { post, get } = mkApi(mf);
    await post("progressiondefine", { progressionKey: "procure", label: "Procurement",
      stages: [
        { key: "need",     label: "staff report",    cardinality: "1", required: "always" },
        { key: "award",    label: "council award",   after: "need",  cardinality: "1", required: "always" },
        { key: "contract", label: "signed contract", after: "award", cardinality: "1", within: "90 days", required: "always" },
      ] });
    const e = await post("entitycreate", { kind: "contract", label: "Procurement E", aliases: ["contract:PE"] });
    const need = sha("r8-E-need"), award = sha("r8-E-award");
    await promoteReading(post, need, refFor("contract:PE"), NEED_AT);
    await promoteReading(post, award, refFor("contract:PE"), AWARD_AT);
    await post("resolve", { captureSha: need });
    await post("resolve", { captureSha: award });
    await post("thread", { progressionKey: "procure", entityId: e.entity_id,
      placements: [{ stage: "need", captureSha: need }, { stage: "award", captureSha: award }] });
    const feed = await get("proposals", "");   // NO now param -> uses BIO_NOW_MS (past the deadline)
    const c = feed.proposals.find((p) => p.key === "procure::contract");
    t("the ENV clock BIO_NOW_MS alone drives the overdue computation (no as-of param needed)",
      [c.overdue, c.overdue_count, c.grade], [true, 1, "A"]);
  } finally {
    await mf.dispose();
  }
}

console.log(`\noverdue-successor: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
