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
/* NEGATIVE CONTROL: (a) IN-SUITE — op=proposedispose with an empty reason is refused NO_REASON, and a bad `to` is refused NOT_A_DISPOSITION (the reason is required and never prefilled). (b) STORE-LEVEL, RUN 2026-07-31 record-agent-7: in store.mjs proposalsFeed, neuter the disposition read (make `disposed` an always-empty Map by skipping the SELECT) -> the DISMISSED procurement::solicitation proposal REAPPEARS as OPEN (proposal_count back to 2, dispositions[] empty) and the "no longer surfaces as open" + "aged into dispositions[]" assertions FAIL; restored -> full suite green.
   D-266's SIX ARMS, RUN 2026-08-09 (d266-disposition), driven by `test/d266.control.mjs` — `cd bio-plane && node test/d266.control.mjs`. Every arm armed ALONE with every other defence held OPEN, every arm running BOTH this suite and `current.test.mjs` so an arm that broke something else would say so, every restore verified by sha256, by content and by `cmp` against a per-arm pristine copy AND a pristine of record, pen inside the worktree. BASELINE this suite 27/0, current.test.mjs 62/0. ALL SIX AS DECLARED.
   (1) BUILD `disposedOut` OVER AN EMPTY ARRAY — the block is published, present and empty, for a member who HAS dismissed a finding -> **24/3** here, current 62/0: the published-decision, published-identity and re-decided arms fail. **The BEFORE arm stays GREEN and that is on the record as the arm's own limit** — an assertion that a block is empty cannot see a block that is wrongly empty, which is why arm (3) exists beside this one.
   (2) KEY THE PUBLISHED DECISION ON DECIDER-AND-INSTANT instead of the finding's identity -> **26/1**, current 62/0, and ONLY the published-identity arm falls. The state, the reason, the decider and the time are all still published, so this is the arm that distinguishes *publishes something* from *publishes the identity the act is keyed on* — the one the ruling turns on.
   (3) THE REVERT — the envelope publishes the block under a name nothing reads, so `q.disposed` is `undefined`, which is exactly this op's shape yesterday -> **21/6**, current 62/0, and THE BEFORE ARM FALLS TOO. Arm (1) and arm (3) together are the measurement that an ABSENT block and an EMPTY one are different facts to this suite, which is the sparse obligation this item is an instance of.
   (4) THROW AWAY THE UNATTRIBUTABLE COUNT at the producer's return -> this suite **27/0** (untouched), current **61/1**. The two halves of D-266 are independent and the arm proves it.
   (5) COUNT ONE BRANCH OF THE SILENCE AND NOT THE OTHER — the `!from` increment removed, so the answer is 1 where the truth is 2 -> this suite 27/0, current **61/1**. This is what makes the EXACT figure in that suite worth writing: 'at least one' would have passed.
   (6) OVER-STRICTNESS — `#findingsStanceDiverged` re-wired through a LOCAL instead of spread directly into `items`, correct code in a form the producer does not use -> **BOTH SUITES GREEN**, which is the receipt that the producer-wiring pin corrected by this item asks its property rather than trading one spelling for two. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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
/* D-266. THE MEMBER'S OWN FEED, read beside op=proposals rather than instead of it — the whole of
   this item's defect was that these two ops disagreed about whether a dismissal had happened, and a
   suite that only ever read the one that got it right could not have seen that. The literal
   `op=queue` is here (not interpolated) so scripts/coverage.mjs credits the control-plane surface. */
const getQueue = async (tok = "mem-rec7") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=queue&token=${tok}`)).json());
const queueIds = (q) => (Array.isArray(q && q.items) ? q.items : []).map((i) => i.id);
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

/* ---- D-266 · THE BEFORE PICTURE ON THE MEMBER'S OWN FEED. Taken here, before any act, because the
   arms further down are DELTAS and a delta with no before is an assertion about nothing. ---- */
const q0 = await getQueue();
t("D-266 — before any disposition, op=queue carries BOTH findings as open items, keyed on the same "
+ "identity op=proposedispose is: the item id is the act's key with the class in front of it, "
+ "written by a producer that never consults the disposition table",
  [q0.ok, queueIds(q0).filter((i) => i.startsWith("FINDING::")).sort()],
  [true, ["FINDING::grant::application", "FINDING::procurement::solicitation"]]);
t("D-266 — and the `disposed` block is PRESENT AND EMPTY rather than absent. THE RECORD LOOKED AND "
+ "HOLDS NONE is a different fact from THIS PLANE CANNOT SAY, and a member who has dismissed "
+ "nothing must be able to tell which they are looking at (CLAUDE.md: sparse is normal at every "
+ "level and which level was empty is the answer, not a footnote)",
  [typeof q0.disposed, q0.disposed?.count, q0.disposed?.findings, q0.disposed?.personal,
   q0.disposed?.truncated, q0.disposed?.bound],
  ["object", 0, [], false, false, 64]);

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

/* ================================================================== D-266
   THE SAME FACT ON THE FEED A MEMBER ACTUALLY OPENS, and until this item the
   op that got it right and the op that did not were the same store.

   `proposalsFeed` has always kept both halves of D-79 — the disposed proposal
   leaves `proposals[]` and is RETURNED in `dispositions[]`, because *a finding
   that disappears is indistinguishable from one that was never made*. `op=queue`
   read that feed, inherited the AGEING, and published NONE of the ageing: the
   item simply stopped being in the answer. `civicos-ui/app.html` had noticed and
   was keeping a page-local Map of the dispositions IT had performed, which is a
   second place a fact is stated (D-21/DEC-8) and survives neither a reload nor a
   second member.

   THE ASSERTIONS BELOW ARE THE RULING, NOT A FEATURE. What declining means for a
   finding recomputed on every read was already answered by this record: the
   decision is keyed on the finding's STABLE IDENTITY, it stands until it is
   re-triaged whether or not the underlying gap still fires, and it AGES the
   finding rather than deleting it. Note what that makes these two kinds — they
   are DERIVED ON EVERY READ (proposalsFeed rebuilds them from
   progression_instances each time, and the queue stamps them
   `age.reason = "derived_on_read"` with its own hand), so this suite is already
   the proof that a derived finding is dispositionable. Being derived was never
   what withheld the act. ================================================== */
console.log("\n--- D-266: op=queue publishes the aged decision, so a dismissed finding does not read like an absent one ---");
const qd = await getQueue();
t("D-266 — the dismissed finding is GONE FROM THE OPEN ITEMS, exactly as before this item: the "
+ "ageing is inherited from proposalsFeed and nothing about it changed",
  queueIds(qd).filter((i) => i.startsWith("FINDING::")), ["FINDING::grant::application"]);
t("D-266 — AND IT IS NOW SAID. The decision is published with its state, the member's own reason, "
+ "who decided and when, so the shorter feed is attributable instead of merely shorter. This is "
+ "the assertion that was impossible to make yesterday and it is the whole item",
  (() => { const d = (qd.disposed?.findings || []).find((x) => x.key === "procurement::solicitation");
    return [qd.disposed?.count, d && d.state, d && d.reason, d && d.decided_by, typeof (d && d.at)]; })(),
  [1, "dismissed", "these awards are below the solicitation threshold, so no RFP was required",
   "class:member", "string"]);
t("D-266 — THE PUBLISHED IDENTITY IS THE ITEM'S OWN, and this is the measurement the ruling rests "
+ "on rather than a restatement of it: the id on the aged decision is the id the OPEN feed mints "
+ "for a finding of that identity, and the two are produced by code that never consults each other "
+ "— one from `proposal_dispositions`' primary key, the other from proposalsFeed's aggregation key. "
+ "A surface ties the decision to the thing it removed without rebuilding the key from two columns",
  (() => { const d = (qd.disposed?.findings || []).find((x) => x.key === "procurement::solicitation");
    const openId = queueIds(qd).find((i) => i === "FINDING::grant::application");
    return [d && d.id, d && [d.progression_key, d.stage_key],
            openId === "FINDING::" + "grant::application"]; })(),
  ["FINDING::procurement::solicitation", ["procurement", "solicitation"], true]);
t("D-266 — the two ways this feed gets shorter SAY WHOSE ACT SHORTENED IT, and they say opposite "
+ "things: a disposition is `personal: false` (a record act, clearing the finding under every case "
+ "it appears in, for everybody) and a mute is `personal: true` (one member's preference, changing "
+ "nobody else's feed). D-125/DEC-16's boundary, visible in the answer rather than only in doctrine",
  [qd.disposed?.personal, qd.mute?.personal], [false, true]);
t("D-266 — the answer does NOT claim the underlying gap is closed, and refusing to claim it is the "
+ "point: the decision stands until it is re-triaged whether the gap still fires or not (D-79), so "
+ "the block publishes the DECISION and names op=proposals as the op that answers the other question",
  [/RE-TRIAGED/.test(String(qd.disposed?.detail || "")),
   /op=proposals/.test(String(qd.disposed?.detail || "")),
   /NOT asserted here/.test(String(qd.disposed?.detail || ""))], [true, true, true]);
t("D-266 — OVER-STRICTNESS: the UNdismissed finding is untouched in every respect — still an open "
+ "item, still advertising the act with the key op=proposedispose accepts. A block that aged the "
+ "wrong thing, or withdrew an act it should not have, fails here rather than passing quietly",
  (() => { const open = (qd.items || []).find((i) => i.id === "FINDING::grant::application");
    return [!!open, open?.disposition?.available, open?.disposition?.key,
            open?.age?.state, open?.age?.reason]; })(),
  [true, true, "grant::application", "undetermined", "derived_on_read"]);

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
/* D-266: and the member's own feed says the same thing about the SAME identity. RE-TRIAGEABLE is
   the half of the ruling a single dismissal cannot demonstrate — a decision that stands until it is
   re-triaged is only distinguishable from a decision that is final if re-triaging it is shown to
   move it, and to move it IN PLACE rather than to append a second standing decision. */
const qd2 = await getQueue();
t("D-266 — a RE-DECIDED finding keeps ONE published decision, moved, never a second beside it: the "
+ "identity is what the decision hangs on, so re-triage rewrites it and the feed cannot end up "
+ "showing a member two different answers about one question. And no open item came back",
  [qd2.disposed?.count,
   (qd2.disposed?.findings || []).map((d) => [d.key, d.state]).sort(),
   queueIds(qd2).filter((i) => i.startsWith("FINDING::"))],
  [2, [["grant::application", "dismissed"], ["procurement::solicitation", "dismissed"]].sort(), []]);

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
