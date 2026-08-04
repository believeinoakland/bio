/* op=proposedispose — record a PROPOSAL's defer/dismiss WITHOUT minting a bundle (REC-7; UI-5's
 * second delegation). Builds on REC-6 (op=proposals, the derived-findings feed) and the FW-6..FW-10
 * progression machinery it walks. Doctrine is SETTLED (D-79): a declined proposal AGES with a
 * recorded reason rather than vanishing, and declining is NOT authoring — no bundle, no focus, no
 * attribution beyond the disposition record.
 *
 * What this proves (the accepts-when):
 *   - op=proposals surfaces two OPEN proposals (procurement::solicitation, grant::application);
 *   - a member DISMISSES procurement::solicitation with a reason THROUGH the control plane -> the
 *     disposition is RECORDED (state, reason, server-stamped decider, time) and NO bundle is minted
 *     (op=list's bundle inventory is unchanged and carries no focus/problem);
 *   - that proposal NO LONGER surfaces as OPEN (dropped from proposals[] and instances[]) but is
 *     RETURNED alongside in dispositions[] with its reason/who/when — it AGES, it does not vanish;
 *   - the UNdismissed proposal (grant::application) STILL surfaces as open;
 *   - a re-disposition UPSERTS on the (progression_key, stage_key) identity — ONE row, never two;
 *   - the deciding member is STAMPED server-side: a caller-supplied decider is overwritten;
 *   - deferring also ages a proposal out of open (defer and dismiss both age).
 *
 * Everything is driven THROUGH the control plane (a real caller's only route), so coverage credits
 * op=proposedispose on the control-plane surface, not only the store (D-43).
 */
/* NEGATIVE CONTROL: (a) IN-SUITE — op=proposedispose with an empty reason is refused NO_REASON, and a bad `to` is refused NOT_A_DISPOSITION (the reason is required and never prefilled). (b) STORE-LEVEL, RUN 2026-07-31 record-agent-7: in store.mjs proposalsFeed, neuter the disposition read (make `disposed` an always-empty Map by skipping the SELECT) -> the DISMISSED procurement::solicitation proposal REAPPEARS as OPEN (proposal_count back to 2, dispositions[] empty) and the "no longer surfaces as open" + "aged into dispositions[]" assertions FAIL; restored -> full suite green. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec7", MEMBER_TOKEN: "mem-rec7", PROBE_TOKEN: "prb-rec7", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-rec7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const getProposals = async (tok = "mem-rec7") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=proposals&token=${tok}`)).json());
const listBundles = async (tok = "mem-rec7") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=list&token=${tok}`)).json());
/* THE op under test, reached by a member THROUGH the control plane. The literal `op=proposedispose`
   string is here (not interpolated) so scripts/coverage.mjs credits it on the control-plane surface. */
const proposeDispose = async (body, tok = "mem-rec7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=proposedispose&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());

/* seed captured documents through the real FW-5 -> FW-6 -> FW-7 chain, exactly as the REC-6 suite. */
const NOW = "2026-07-24T00:00:00Z";
let bseq = 0;
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Procurement document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-rec7`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "rec7",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return { id, ok: r.ok !== false };
};

console.log("\n--- seed: two progressions, each with one OPEN gap-carrying proposal ---");
const proc = await post("progressiondefine", {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
    { key: "solicitation", label: "RFP / RFQ / IFB", after: "need", cardinality: "0..1", required: "usually" },
    { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
    { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
  ],
});
t("the procurement progression is defined", [proc.ok, proc.stage_count], [true, 4]);

/* entity A: a gap on solicitation, grade A (its identifier matched). */
const eA = await post("entitycreate", { kind: "contract", label: "Gap Contract A", aliases: ["contract:C-A"] });
const aid = eA.entity_id;
const aAward = sha("rec7-A-award"), aContract = sha("rec7-A-contract");
for (const s of [aAward, aContract])
  await promoteReading(s, [{ ref: "contract:C-A", kind: "contract", key: "C-A", label: "Gap Contract A" }]);
for (const s of [aAward, aContract]) await post("resolve", { captureSha: s });
await post("thread", { progressionKey: "procurement", entityId: aid,
  placements: [{ stage: "award", captureSha: aAward }, { stage: "contract", captureSha: aContract }] });

/* a second progression 'grant': application(usually) -> award(always). entity G places only award,
   so grant::application is a missing-required finding (undetermined — one placed stage). */
await post("progressiondefine", { progressionKey: "grant", label: "Grant",
  stages: [{ key: "application", label: "application", cardinality: "1", required: "usually" },
           { key: "award", label: "award", after: "application", cardinality: "1", required: "always" }] });
const eG = await post("entitycreate", { kind: "fund", label: "Grant G", aliases: ["fund:G"] });
const gid = eG.entity_id;
const gAward = sha("rec7-G-award");
await promoteReading(gAward, [{ ref: "fund:G", kind: "fund", key: "G", label: "Grant G" }]);
await post("resolve", { captureSha: gAward });
await post("thread", { progressionKey: "grant", entityId: gid, placements: [{ stage: "award", captureSha: gAward }] });

const feed0 = await getProposals();
t("op=proposals surfaces TWO open proposals before any disposition",
  [feed0.proposal_count, feed0.disposition_count, feed0.proposals.map((p) => p.key).sort()],
  [2, 0, ["grant::application", "procurement::solicitation"]]);

/* ---- the ACT: a member DISMISSES procurement::solicitation with a reason, through the control plane.
   No bundle is minted; the disposition is the whole of the act (D-79 — declining is not authoring). ---- */
console.log("\n--- a member DISMISSES a proposal with a reason -> recorded, NO bundle minted ---");
const bundlesBefore = (await listBundles()).length;
const focusesBefore = (await listBundles()).filter((b) => ["focus", "problem"].includes(b.object_type)).length;
const dz = await proposeDispose({ key: "procurement::solicitation", to: "dismissed",
  reason: "these awards are below the solicitation threshold, so no RFP was required" });
t("op=proposedispose records the dismissal and mints NO bundle (bundle:null)",
  [dz.ok, dz.key, dz.to, dz.reason, dz.bundle],
  [true, "procurement::solicitation", "dismissed",
   "these awards are below the solicitation threshold, so no RFP was required", null]);
t("the deciding member is STAMPED server-side (a machine MEMBER credential records class:member)",
  dz.decided_by, "class:member");
const bundlesAfter = (await listBundles()).length;
const focusesAfter = (await listBundles()).filter((b) => ["focus", "problem"].includes(b.object_type)).length;
t("NO bundle was minted: the bundle inventory is unchanged and carries no focus/problem",
  [bundlesAfter - bundlesBefore, focusesBefore, focusesAfter], [0, 0, 0]);

/* ---- the FEED now ages the dismissed proposal out of OPEN, keeps the undismissed one, and records
   the decision in dispositions[] (it AGES, it does not vanish). ---- */
console.log("\n--- the dismissed proposal AGES out of open; the undismissed one STILL surfaces ---");
const feed1 = await getProposals();
t("the DISMISSED proposal no longer surfaces as OPEN (dropped from proposals[] and instances[])",
  [feed1.proposals.some((p) => p.key === "procurement::solicitation"),
   feed1.instances.some((i) => i.progression_key === "procurement")], [false, false]);
t("the UNdismissed proposal STILL surfaces as open",
  [feed1.proposal_count, feed1.proposals.map((p) => p.key)], [1, ["grant::application"]]);
t("the dismissed proposal is AGED into dispositions[] with its state, reason, decider and time (not vanished)",
  (() => { const d = feed1.dispositions.find((x) => x.key === "procurement::solicitation");
    return [feed1.disposition_count, d && d.state, d && d.reason, d && d.decided_by, typeof (d && d.at)]; })(),
  [1, "dismissed", "these awards are below the solicitation threshold, so no RFP was required", "class:member", "string"]);

/* ---- NEGATIVE CONTROLS through the op: the reason is REQUIRED and never prefilled. ---- */
console.log("\n--- NEGATIVE CONTROLS (through the op): no reason -> NO_REASON; bad target -> NOT_A_DISPOSITION ---");
const noReason = await proposeDispose({ key: "grant::application", to: "dismissed", reason: "   " });
t("dispose without a reason is REFUSED NO_REASON (never prefilled)", [noReason.ok, noReason.reason], [false, "NO_REASON"]);
const badTo = await proposeDispose({ key: "grant::application", to: "elevated", reason: "worth pursuing" });
t("a non-disposition target is REFUSED NOT_A_DISPOSITION (adopting authors a focus, it is not a disposition)",
  [badTo.ok, badTo.reason], [false, "NOT_A_DISPOSITION"]);
const badReason = await proposeDispose({ key: "grant::application", to: "deferred", reason: 'has a "quote"' });
t("a reason outside the frontmatter grammar is REFUSED BAD_REASON", [badReason.ok, badReason.reason], [false, "BAD_REASON"]);
const badKey = await proposeDispose({ key: "procurement::nosuchstage", to: "dismissed", reason: "typo" });
t("a stage that is not the progression's is REFUSED BAD_STAGE (a disposition names a REAL proposal)",
  [badKey.ok, badKey.reason], [false, "BAD_STAGE"]);
const feedNC = await getProposals();
t("the refused dispositions wrote NOTHING: grant::application is still OPEN and no disposition was recorded",
  [feedNC.proposals.map((p) => p.key), feedNC.disposition_count], [["grant::application"], 1]);

/* ---- the deciding member is stamped SERVER-SIDE: a caller-supplied decider is overwritten. ---- */
console.log("\n--- the decider is server-stamped: a forged decidedBy is overwritten ---");
const forged = await proposeDispose({ key: "grant::application", to: "deferred",
  reason: "park until the next budget cycle", decidedBy: "not-me-the-founder" });
t("a caller-supplied decidedBy is IGNORED; the server stamps the credential (class:member)",
  [forged.ok, forged.decided_by], [true, "class:member"]);

/* ---- deferring ALSO ages a proposal out of open; and a re-disposition UPSERTS (one row, never two). ---- */
console.log("\n--- deferring ages out too; a re-disposition UPSERTS on the identity ---");
const feed2 = await getProposals();
t("after deferring grant::application, NO proposal is open and BOTH aged decisions are on the record",
  [feed2.proposal_count, feed2.disposition_count,
   feed2.dispositions.map((d) => [d.key, d.state]).sort()],
  [0, 2, [["grant::application", "deferred"], ["procurement::solicitation", "dismissed"]].sort()]);
/* re-decide the SAME proposal (deferred -> dismissed, corrected reason): ONE row, never a second. */
const redo = await proposeDispose({ key: "grant::application", to: "dismissed",
  reason: "on reflection this grant needs no separate application" });
const feed3 = await getProposals();
const g3 = feed3.dispositions.find((d) => d.key === "grant::application");
t("a re-disposition UPSERTS on (progression_key, stage_key): still TWO dispositions, the one row updated",
  [redo.ok, feed3.disposition_count, g3.state, g3.reason],
  [true, 2, "dismissed", "on reflection this grant needs no separate application"]);

/* ---- op=purge clears the disposition store (D-113): a whole-store purge that reported ALL while
   leaving dispositions is the silent-leftover D-113 exists to prevent. ---- */
console.log("\n--- op=purge takes the disposition store (D-113) ---");
const purged = rP(await (await mf.dispatchFetch(
  `http://x/api/?op=purge&token=adm-rec7&confirm=bio`, { method: "POST", body: "{}" })).json());
t("a whole-store purge REPORTS how many dispositions it cleared, and takes them",
  [purged.ok, purged.scope, purged.removed.proposalDispositions], [true, "ALL", 2]);
const feed4 = await getProposals();
t("after the purge the feed carries no dispositions (and no proposals — the corpus is gone)",
  [feed4.disposition_count, feed4.proposal_count], [0, 0]);

await mf.dispose();
console.log(`\nproposedispose: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
