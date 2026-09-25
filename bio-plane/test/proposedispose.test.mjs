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
   (6) OVER-STRICTNESS — `#findingsStanceDiverged` re-wired through a LOCAL instead of spread directly into `items`, correct code in a form the producer does not use -> **BOTH SUITES GREEN**, which is the receipt that the producer-wiring pin corrected by this item asks its property rather than trading one spelling for two.
   REC-184's THREE ARMS, RUN 2026-09-24 (WORKER REC-184), each armed ALONE by one exact-match patch of store.mjs (the anchor matched once), restored by cp from a pristine copy and verified by sha256 (fc9e2159…) AND cmp after every arm. BASELINE 44/0. ALL THREE AS DECLARED.
   (A) STOP WRITING THE VERSION — op=proposedispose binds NULL where it bound `definitionVersion` in the INSERT (the act's RETURN still names the version, so only the ROW moves) -> **38/6**: "under version 1 the decision GOVERNS … READS BACK", "THE ARM: A DISPOSITION UNDER VERSION 1 DOES NOT APPLY UNDER VERSION 2", "it is STATED", "the member's own feed agrees", the procurement/grant OVER-STRICTNESS arm and "RE-TRIAGE … re-stamps the version" fail by name; "THE COLUMN IS WRITTEN" stays GREEN because it reads the act's return, which the arm did not touch — the read-back arm is the one that sees the row. Worth recording: under this arm the permit proposal DOES reopen (the not-recorded ORDER rule catches it), and THE ARM fails on `applies_because` naming the wrong cause, which is why the arm asserts the cause and not only the reopening.
   (B) THE READ IGNORES THE VERSION — proposalsFeed ages on every recorded disposition (`disposed` unfiltered) -> **41/3**: THE ARM, the member's own feed and L4 fail; the read-back and "it is STATED" stay green, because the version VIEW is still computed and published — the arm breaks what the view governs, not the view.
   (C) OVER-STRICTNESS — the version written by a SEPARATE `UPDATE` after an INSERT that binds NULL, correct in a spelling the act does not use -> **44/0**.
   REC-211's THREE ARMS, RUN 2026-09-24 (WORKER REC-211) by a driver held OUTSIDE the worktree (BOB #32, 2026-09-24), each armed ALONE by one exact-match patch of store.mjs (the anchor matched once and the arm was checked to have CHANGED THE FILE before the run), restored from a pristine copy verified by sha256 (fcc8c88c…) AND by `cmp` AND by byte count (3,230,189 B, floored) after every arm. BASELINE 55/0. ALL THREE AS DECLARED, and arm (B) came back with a finding rather than a flat confirmation.
   (A) THE ROW'S OWN CONTROL — DROP THE VERSION CHECK: `if (seenVersion !== currentVersion)` made unreachable, so a STALE version is ADMITTED -> **52/3**: "THE ARM: the decision naming the version the member READ is REFUSED DEFINITION_MOVED", "a version that NEVER STOOD is refused the same way" and "THE FOUR REFUSALS WROTE NOTHING" all fail BY NAME. MUST NOT FAIL and did not: both NO_DEFINITION_VERSION arms, every admitted arm, and REC-184's whole block — the stamp is unchanged by this arm and only the gate in front of it moves.
   (B) DROP THE NAMED CHECK: `if (!Number.isInteger(seenVersion) || seenVersion < 1)` made unreachable -> **53/2**, and THE TWO THAT FAILED ARE THE TWO THAT NAME THE CODE, not the one that says nothing was written. **A SURPRISING GREEN, RECORDED RATHER THAN SMOOTHED, AND IT IS A REAL PROPERTY OF THE ORDER THESE TWO CHECKS SIT IN:** with the named check gone, an act carrying no version reaches the comparison with `seenVersion` = NaN, and `NaN !== 4` is TRUE — so it is still REFUSED, by DEFINITION_MOVED, and still writes nothing. **The comparison alone carries the SAFETY; the named check carries the HONESTY** — without it a member who named no version is told the flow was revised, which the plane does not know and which is the invented-reason defect this item exists to close, one refusal over. That is why the arms assert the CODE and not merely the refusal.
   (C) OVER-STRICTNESS — the same comparison in a spelling this item does not use, `String(seenVersion) !== String(currentVersion)`: correct work -> **55/0**, nothing fails.
   D-527's TWO ARMS, RUN 2026-09-24 (WORKER D-527) from a pristine copy of `store.mjs` held in the session scratchpad OUTSIDE the worktree (BOB #32, 2026-09-24), each armed ALONE by one exact-match patch whose anchor matched ONCE and which was checked to have CHANGED THE FILE before the run, restored by `cp` and verified by sha256 (9cc0d92f...) AND by `cmp` AND by byte count (3,287,470 B) after every arm. BASELINE 55/0 — MEASURED HERE rather than taken from REC-211's line above, and it agreed with it. BOTH AS DECLARED.
   (A) THE ROW'S OWN CONTROL — DROP THE FIELD FROM THE QUEUE ITEM: `prior_disposition: p.prior_disposition` removed from the FINDING item `op=queue` mints, so the object `proposalsFeed` builds rides only on `op=proposals` again -> **55/3**, and the three that fail are the three D-527 arms BY NAME: the reopened item's own arm, the totality arm against `op=proposals`, and the `present and null` arm. MUST NOT FAIL and did not: every REC-184, REC-211 and D-266 arm, including "the member's own feed agrees", which reads the `disposed` BLOCK and passes with the item carrying nothing — that green is the measurement that the block beside the item is not the item, and the reason the new arms name `items[]`.
   (B) OVER-STRICTNESS — the same object published in a spelling this item does not use (spread through a conditional, `...(p.prior_disposition === undefined ? {} : { prior_disposition: p.prior_disposition })`), correct work -> **58/0**, nothing fails: the arms ask for the FACT on the item, not for this item's line.
   NOT ARMED, BECAUSE IT IS ALREADY ASSERTED GREEN: the ORDER of these two checks against the identity checks above them. `badKey` ("procurement::nosuchstage", naming NO version) is refused BAD_STAGE rather than NO_DEFINITION_VERSION, which is D-128's rule one op over — a bad stage is still heard first — measured by an arm that was here before this item and passes unchanged. */
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
/* D-527's BEFORE HALF, taken here for the same reason the block above is: the arm further down is a
   DELTA. It asks the present-vs-absent question one field over — on an item nobody has decided the
   queue publishes `prior_disposition` PRESENT AND NULL, never absent, so a surface reading the item
   can tell *nobody has answered this* from *this op does not say*. The corpus is printed and floored
   because a claim about every item is free over none. */
const q0f = (q0.items || []).filter(
  (i) => i.class === "FINDING" && i.subject && i.subject.kind === "progression_stage");
console.log(`  corpus (before any decision): ${q0f.length} proposal-derived FINDING items`);
t("D-527 — before any decision, every proposal-derived FINDING item carries `prior_disposition` "
+ "PRESENT AND NULL — the field is published rather than omitted, so an item nobody has decided is "
+ "distinguishable from an op that does not say",
  [q0f.length, q0f.map((i) => [i.id, "prior_disposition" in i, i.prior_disposition]).sort()],
  [2, [["FINDING::grant::application", true, null],
       ["FINDING::procurement::solicitation", true, null]]]);

/* ---- the ACT: a member DISMISSES procurement::solicitation with a reason, through the control plane.
   No bundle is minted; the disposition is the whole of the act (D-79 — declining is not authoring). ---- */
console.log("\n--- a member DISMISSES a proposal with a reason -> recorded, NO bundle minted ---");
const bundlesBefore = (await listBundles()).length;
const focusesBefore = (await listBundles()).filter((b) => ["focus", "problem"].includes(b.object_type)).length;
/* CORRECTED 2026-09-24 (REC-211): every ADMITTED disposition below now names the version of the
   declared flow it judged. The old calls named none and were admitted, which is exactly the contract
   BOB #32 ruled wrong — the act was binding whatever version was current at the write rather than the
   one the member read — so these are corrected rather than exempted. `procurement` and `grant` stand
   at version 1 throughout; `permit` is revised mid-suite and its two calls name 1 then 2. */
const dz = await proposeDispose({ key: "procurement::solicitation", to: "dismissed",
  reason: "these awards are below the solicitation threshold, so no RFP was required",
  definitionVersion: 1 });
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
  reason: "park until the next budget cycle", decidedBy: "not-me-the-founder", definitionVersion: 1 });
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
  reason: "on reflection this grant needs no separate application", definitionVersion: 1 });
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

/* ================================================================= REC-184
   A DECISION IS A JUDGMENT OF THE DEFINITION IT WAS TAKEN AGAINST (framework §8.2, "The declared
   flow, and its revisions"; D-128's follow-on). D-128 made a progression definition append-only and
   named the version on every finding; the disposition still carried no version, so a member's
   dismissal under version 1 went on ageing the proposal version 2 produces — the record applying a
   decision to a definition nobody judged. The arm: dismiss under version 1, revise to version 2,
   and the proposal is OPEN again with the earlier decision beside it; the column reads back.
   Through the op, as every other arm here. ================================================== */
console.log("\n--- REC-184: a disposition under version 1 does not apply under version 2 ---");
const PERMIT_V1 = [{ key: "application", label: "permit application", cardinality: "1", required: "usually" },
                   { key: "issuance", label: "permit issued", after: "application", cardinality: "1", required: "always" }];
const PERMIT_V2 = [{ key: "application", label: "permit application (filed with the planning desk)", cardinality: "1", required: "usually" },
                   { key: "issuance", label: "permit issued", after: "application", cardinality: "1", required: "always" }];
const pv1 = await post("progressiondefine", { progressionKey: "permit", label: "Permit", stages: PERMIT_V1 });
/* a permit is threaded by its PARCEL (ENTITY_KINDS has no `permit`); the fixture is asserted to have
   been built, so an arm below cannot pass or fail over an entity that never existed. */
const eP = await post("entitycreate", { kind: "parcel", label: "Parcel P", aliases: ["parcel:P-1"] });
t("REC-184 — fixture: the threading parcel exists", [eP.ok !== false, typeof eP.entity_id], [true, "string"]);
const pIss = sha("rec184-P-issuance");
await promoteReading(pIss, [{ ref: "parcel:P-1", kind: "parcel", key: "P-1", label: "Parcel P" }]);
await post("resolve", { captureSha: pIss });
await post("thread", { progressionKey: "permit", entityId: eP.entity_id, placements: [{ stage: "issuance", captureSha: pIss }] });
const fp0 = await getProposals();
const pOpen0 = fp0.proposals.find((p) => p.key === "permit::application");
t("REC-184 — the permit definition is version 1 and its gap is an OPEN proposal read against version 1",
  [pv1.ok, pv1.version, !!pOpen0, pOpen0 && pOpen0.definition_version, pOpen0 && pOpen0.prior_disposition],
  [true, 1, true, 1, null]);
const pd1 = await proposeDispose({ key: "permit::application", to: "dismissed", definitionVersion: 1,
  reason: "this permit class is issued over the counter with no written application" });
t("REC-184 — THE COLUMN IS WRITTEN: the act answers the version it was decided against, stamped by the store",
  [pd1.ok, pd1.definition_version], [true, 1]);
const fp1 = await getProposals();
const dp1 = fp1.dispositions.find((d) => d.key === "permit::application");
t("REC-184 — under version 1 the decision GOVERNS: the proposal is aged out of open, and the column "
+ "READS BACK as version 1, recorded, applying to the version in force",
  [fp1.proposals.some((p) => p.key === "permit::application"),
   dp1 && [dp1.definition_version, dp1.definition_version_state, dp1.current_definition_version, dp1.applies, dp1.applies_because]],
  [false, [1, "recorded", 1, true, "decided_against_current_version"]]);
await new Promise((r) => setTimeout(r, 5));   /* the revision's instant is strictly after the decision's */
const pv2 = await post("progressiondefine", { progressionKey: "permit", label: "Permit", stages: PERMIT_V2,
  basis: "The planning desk now requires a written application for every permit of this class.",
  citation: "Planning Department bulletin 2026-14" });
t("REC-184 — the definition is REVISED to version 2, version 1 standing as its prior",
  [pv2.ok, pv2.version, pv2.prior_version], [true, 2, 1]);
const fp2 = await getProposals();
const pOpen2 = fp2.proposals.find((p) => p.key === "permit::application");
const dp2 = fp2.dispositions.find((d) => d.key === "permit::application");
t("REC-184 — THE ARM: A DISPOSITION UNDER VERSION 1 DOES NOT APPLY UNDER VERSION 2. The proposal is "
+ "OPEN again, read against version 2, and carries the version-1 decision beside it as its prior",
  [!!pOpen2, pOpen2 && pOpen2.definition_version,
   pOpen2 && pOpen2.prior_disposition && [pOpen2.prior_disposition.state, pOpen2.prior_disposition.definition_version,
                                           pOpen2.prior_disposition.applies, pOpen2.prior_disposition.applies_because]],
  [true, 2, ["dismissed", 1, false, "decided_against_earlier_version"]]);
t("REC-184 — and it is STATED, not vanished (D-79): the decision stays in dispositions[] with its "
+ "reason, naming version 1 against a current version 2, applies:false",
  dp2 && [dp2.state, dp2.reason, dp2.definition_version, dp2.definition_version_state,
          dp2.current_definition_version, dp2.applies, dp2.applies_because],
  ["dismissed", "this permit class is issued over the counter with no written application",
   1, "recorded", 2, false, "decided_against_earlier_version"]);
const qp2 = await getQueue();
const qdp2 = (qp2.disposed?.findings || []).find((d) => d.key === "permit::application");
t("REC-184 — the member's own feed agrees: FINDING::permit::application is an OPEN item again, and the "
+ "published decision says it judged version 1 and no longer applies",
  [queueIds(qp2).includes("FINDING::permit::application"),
   qdp2 && [qdp2.definition_version, qdp2.definition_version_state, qdp2.applies]],
  [true, [1, "recorded", false]]);
t("REC-184 — OVER-STRICTNESS: the revision of `permit` reopened NOTHING ELSE — procurement's and "
+ "grant's decisions, taken against their own unrevised version 1, still govern",
  fp2.dispositions.filter((d) => d.key !== "permit::application").map((d) => [d.key, d.definition_version, d.applies]).sort(),
  [["grant::application", 1, true], ["procurement::solicitation", 1, true]]);
/* ------------------------------------------------------------------ D-527 · AND IT REACHES THE
   ITEM, NOT ONLY THE BLOCK BESIDE IT. REC-184 published `prior_disposition` on `op=proposals`,
   which no surface reads (UI-14 retired it for `op=queue`), so the member meeting the reopened
   question on the one op they open was shown a question nobody has answered while the record held
   a decision. The arm reads the ITEM, not `disposed`: the block above is a JOIN bounded by
   QUEUE_DISPOSED_MAX, and the assertion directly over it (`qdp2`, four lines up) is the reason
   this one has to name the item — a suite that asserts the block would pass over an item that
   carries nothing. The UI render is a later row and nothing here asserts one. */
const q527 = (qp2.items || []).find((i) => i.id === "FINDING::permit::application");
t("D-527 — THE ARM: the REOPENED FINDING ITEM ITSELF carries the earlier decision — state, reason, "
+ "author, instant and the definition version it judged — with applies:false and its cause",
  q527 && q527.prior_disposition
    && [q527.prior_disposition.state, q527.prior_disposition.reason,
        q527.prior_disposition.decided_by, q527.prior_disposition.at === dp2.at,
        q527.prior_disposition.definition_version, q527.prior_disposition.definition_version_state,
        q527.prior_disposition.applies, q527.prior_disposition.applies_because],
  ["dismissed", "this permit class is issued over the counter with no written application",
   "class:member", true, 1, "recorded", false, "decided_against_earlier_version"]);
/* TOTALITY, and it is the shape that makes the over-strictness arm real: EVERY proposal-derived
   FINDING item in this one read agrees with `op=proposals` about the prior decision — the reopened
   one carries it, the ones nobody ever decided carry `null` rather than an invented object, and no
   fourth spelling is admitted. The corpus is PRINTED and floored non-empty, and `truncated` is
   asserted false, because a capped or empty read would satisfy a per-item claim for free. */
const q527items = (qp2.items || []).filter(
  (i) => i.class === "FINDING" && i.subject && i.subject.kind === "progression_stage");
const q527got = q527items
  .map((i) => [i.id, i.prior_disposition ? [i.prior_disposition.state, i.prior_disposition.definition_version] : null])
  .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
const q527want = fp2.proposals
  .map((p) => [`FINDING::${p.key}`,
               p.prior_disposition ? [p.prior_disposition.state, p.prior_disposition.definition_version] : null])
  .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
console.log(`  corpus: ${q527items.length} proposal-derived FINDING items in this read, `
          + `${q527got.filter((r) => r[1]).length} carrying a prior decision — ${JSON.stringify(q527got)}`);
t("D-527 — TOTALITY: the queue's proposal-derived FINDING items agree with op=proposals ITEM FOR "
+ "ITEM about the prior decision; the read is not truncated and the corpus is not empty. The "
+ "UNDECIDED side of this claim is the `present and null` arm above, because at this point in the "
+ "fixture every other proposal is aged out by a decision that still governs",
  [q527items.length >= 1, qp2.truncated === true, q527got],
  [true, false, q527want]);
const pd3 = await proposeDispose({ key: "permit::application", to: "deferred", definitionVersion: 2,
  reason: "wait for the planning desk to publish the application form" });
const fp3 = await getProposals();
const dp3 = fp3.dispositions.find((d) => d.key === "permit::application");
t("REC-184 — RE-TRIAGE under version 2 re-stamps the version: one row, version 2, governing again",
  [pd3.definition_version, fp3.proposals.some((p) => p.key === "permit::application"),
   fp3.disposition_count, dp3 && [dp3.state, dp3.definition_version, dp3.applies]],
  [2, false, 3, ["deferred", 2, true]]);
const stP = rP(await (await mf.dispatchFetch(`http://x/api/?op=stats&token=adm-rec7`)).json());
t("REC-184 — THE STATS COUNTERS COUNT THE VERSION TABLES: four definition versions (procurement 1, "
+ "grant 1, permit 1 and 2) over three current definitions, and 4 + 2 + 2 + 2 stage versions",
  [stP.progressionDefs, stP.progressionDefVersions, stP.progressionStages, stP.progressionStageVersions],
  [3, 4, 8, 10]);

/* ===================================================== REC-211 / IC-273 · THE ACT BINDS WHAT THE
   MEMBER SAW, AND THIS IS THE WINDOW REC-184 COULD NOT SEE.
   BOB #32, 2026-09-24 (framework 8.2): *"a disposition binds the definition version the member SAW:
   the act carries definitionVersion; if the definition has moved since, it is refused
   DEFINITION_MOVED by name, and the member re-reads and acts again."*
   REC-184's stamp is taken from the store AT THE WRITE, so a revision landing between the read and
   the decision is stamped onto a judgment nobody made of it -- and the read half cannot see it,
   because the stamp then EQUALS the current version and publishes `applies: true`. The arms below
   drive that window end to end through the op: the member reads at version 3, a revision lands, the
   decision naming 3 is REFUSED, nothing is written, the member re-reads and acts again at 4.
   THE JUDGMENT-LAYER ARM ({project, finding}) IS DELIBERATELY NOT ARMED HERE: no declared flow
   governs it, it asks for no version, and `d266scope.test.mjs` staying green over calls that name
   none is the measurement that this item did not widen the fence to it. ======================== */
console.log("\n--- REC-211: a disposition names the version it judged; one naming another is REFUSED ---");
const PERMIT_V3 = [{ key: "application", label: "permit application (over the counter)", cardinality: "1", required: "usually" },
                   { key: "issuance", label: "permit issued", after: "application", cardinality: "1", required: "always" }];
const PERMIT_V4 = [{ key: "application", label: "permit application (filed online)", cardinality: "1", required: "usually" },
                   { key: "issuance", label: "permit issued", after: "application", cardinality: "1", required: "always" }];
await new Promise((r) => setTimeout(r, 5));
const pv3 = await post("progressiondefine", { progressionKey: "permit", label: "Permit", stages: PERMIT_V3,
  basis: "The planning desk has gone back to issuing this permit class over the counter.",
  citation: "Planning Department bulletin 2026-19" });
const q3 = await getQueue();
const q3item = (q3.items || []).find((i) => i.id === "FINDING::permit::application");
t("REC-211 — fixture: the revision to version 3 reopens permit::application, and the member READS it there",
  [pv3.ok, pv3.version, pv3.prior_version, !!q3item], [true, 3, 2, true]);
t("REC-211 — THE SURFACE IS TOLD WHAT THE ACT NEEDS: op=queue publishes, beside the key it is "
+ "advertising, the version this finding was derived against and names `definitionVersion` as "
+ "required. A surface may RENDER a refusal and may never compute one (DEC-8), so an act it is told "
+ "a member `can actually complete` is one it holds every argument for",
  q3item && q3item.disposition && [q3item.disposition.op, q3item.disposition.key,
                                   q3item.disposition.definition_version, q3item.disposition.requires],
  ["proposedispose", "permit::application", 3, ["definitionVersion"]]);
await new Promise((r) => setTimeout(r, 5));   /* the revision's instant is strictly after the read */
const pv4 = await post("progressiondefine", { progressionKey: "permit", label: "Permit", stages: PERMIT_V4,
  basis: "Applications move online and the counter closes.",
  citation: "Planning Department bulletin 2026-23" });
t("REC-211 — fixture: THE WINDOW. A revision lands to version 4 between the member's read and their decision",
  [pv4.ok, pv4.version, pv4.prior_version], [true, 4, 3]);
const rMoved = await proposeDispose({ key: "permit::application", to: "dismissed", definitionVersion: 3,
  reason: "over the counter means there is no written application to wait for" });
t("REC-211 — THE ARM: the decision naming the version the member READ is REFUSED DEFINITION_MOVED by "
+ "name, carrying BOTH numbers and its DEC-49 code, check and canned translation",
  [rMoved.ok, rMoved.reason, rMoved.code, rMoved.check, rMoved.definition_version,
   rMoved.current_definition_version, typeof rMoved.translation === "string" && rMoved.translation.length > 80],
  [false, "DEFINITION_MOVED", "DEFINITION_MOVED", "C-33.43", 3, 4, true]);
const rUnnamed = await proposeDispose({ key: "permit::application", to: "dismissed",
  reason: "over the counter means there is no written application to wait for" });
t("REC-211 — an act that names NO version is refused NO_DEFINITION_VERSION: the record will not "
+ "record a judgment without knowing what was judged. This is the arm that makes `the act carries "
+ "definitionVersion` enforceable rather than advisory",
  [rUnnamed.ok, rUnnamed.reason, rUnnamed.code, rUnnamed.check, rUnnamed.definition_version,
   rUnnamed.current_definition_version, typeof rUnnamed.translation === "string" && rUnnamed.translation.length > 80],
  [false, "NO_DEFINITION_VERSION", "NO_DEFINITION_VERSION", "C-33.42", null, 4, true]);
const rAhead = await proposeDispose({ key: "permit::application", to: "dismissed", definitionVersion: 99,
  reason: "over the counter means there is no written application to wait for" });
t("REC-211 — a version that NEVER STOOD is refused the same way and for the same reason: the plane "
+ "cannot tell an invented number from a stale one, and each is a decision about something other "
+ "than the question standing now",
  [rAhead.ok, rAhead.reason, rAhead.definition_version, rAhead.current_definition_version],
  [false, "DEFINITION_MOVED", 99, 4]);
const rBool = await proposeDispose({ key: "permit::application", to: "dismissed", definitionVersion: true,
  reason: "over the counter means there is no written application to wait for" });
t("REC-211 — `true` is NOT a version. `Number(true)` is 1, so a coercing read would have called this "
+ "a stale version 1; a caller that sent it said nothing at all about what it read, and it is "
+ "NO_DEFINITION_VERSION rather than a silent number",
  [rBool.ok, rBool.reason], [false, "NO_DEFINITION_VERSION"]);
const fpR = await getProposals();
const dpR = fpR.dispositions.find((d) => d.key === "permit::application");
t("REC-211 — THE FOUR REFUSALS WROTE NOTHING: permit::application is still OPEN at version 4, still "
+ "three dispositions, and the one on record is still the VERSION 2 deferral — no state, no reason "
+ "and no version moved",
  [fpR.proposals.some((p) => p.key === "permit::application"), fpR.disposition_count,
   dpR && [dpR.state, dpR.reason, dpR.definition_version, dpR.applies]],
  [true, 3, ["deferred", "wait for the planning desk to publish the application form", 2, false]]);
const rOk = await proposeDispose({ key: "permit::application", to: "dismissed", definitionVersion: 4,
  reason: "an online application is filed by the applicant, so this gap is not ours to carry" });
const fpOk = await getProposals();
const dpOk = fpOk.dispositions.find((d) => d.key === "permit::application");
t("REC-211 — AND THE MEMBER RE-READS AND ACTS AGAIN: the decision naming version 4 is ADMITTED, "
+ "stamped 4, one row still, and it GOVERNS the version it actually judged",
  [rOk.ok, rOk.definition_version, fpOk.proposals.some((p) => p.key === "permit::application"),
   fpOk.disposition_count, dpOk && [dpOk.state, dpOk.definition_version, dpOk.applies, dpOk.applies_because]],
  [true, 4, false, 3, ["dismissed", 4, true, "decided_against_current_version"]]);
const rStr = await proposeDispose({ key: "permit::application", to: "deferred", definitionVersion: "4",
  reason: "park it until the online form is actually live" });
t("REC-211 — OVER-STRICTNESS: the correct version in a spelling this item did not anticipate — the "
+ "number as a STRING, which is what a form field sends — is ADMITTED and stamped as the number",
  [rStr.ok, rStr.definition_version], [true, 4]);
t("REC-211 — OVER-STRICTNESS: nothing here reached the other progressions. Procurement's and grant's "
+ "version-1 decisions still govern, on acts that named version 1 and were admitted",
  fpOk.dispositions.filter((d) => d.key !== "permit::application")
      .map((d) => [d.key, d.definition_version, d.applies]).sort(),
  [["grant::application", 1, true], ["procurement::solicitation", 1, true]]);

/* ---- op=purge clears the disposition store (D-113): a whole-store purge that reported ALL while
   leaving dispositions is the silent-leftover D-113 exists to prevent. ---- */
console.log("\n--- op=purge takes the disposition store (D-113) ---");
const purged = rP(await (await mf.dispatchFetch(
  `http://x/api/?op=purge&token=adm-rec7&confirm=bio`, { method: "POST", body: "{}" })).json());
/* CORRECTED 2026-09-24 (REC-184): 2 -> 3. The REC-184 arm above records a third disposition
   (permit::application) before the purge; the assertion's subject — the purge takes EVERY
   disposition and says how many — is unchanged. */
t("a whole-store purge REPORTS how many dispositions it cleared, and takes them",
  [purged.ok, purged.scope, purged.removed.proposalDispositions], [true, "ALL", 3]);
/* CORRECTED 2026-09-24 (REC-211): 4 -> 6 definition versions and 10 -> 14 stage versions. The arms
   above declare `permit` versions 3 and 4 to drive the read-then-revise window, and each carries its
   two stages. The assertion's subject — the purge takes EVERY version row and says how many — is
   unchanged, and the figures are read off this suite's own run rather than adjusted by hand. */
t("REC-184 — and it PROVES it took D-128's version history (D-113), both tables to zero",
  [purged.removed.progressionDefVersions, purged.removed.progressionStageVersions,
   purged.after.progressionDefVersions, purged.after.progressionStageVersions], [6, 14, 0, 0]);
const feed4 = await getProposals();
t("after the purge the feed carries no dispositions (and no proposals — the corpus is gone)",
  [feed4.disposition_count, feed4.proposal_count], [0, 0]);

await mf.dispose();

/* ================================================================= REC-184 · THE ROWS WRITTEN BEFORE
   A store whose `proposal_dispositions` predates the column is made by DROPPING it from a live store
   (the row keeps everything else, exactly as an old row did) and re-booting on the same storage, the
   cap14-reused-from.test.mjs precedent: #migrate's additive pass must put the column back NULL, never
   back-filled, and the row must read `not recorded`. Such a row cannot say which version it judged;
   what the record DOES hold is the ORDER — the definition's own declaration instant against the
   decision's — so it governs while nothing has been declared since, and stops the moment something is.
   The probe subclass adds one raw-SQL route; every act and read goes through the control plane. */
console.log("\n--- REC-184: a disposition written before the column reads NOT RECORDED, never back-filled ---");
{
  const PROBE = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawsql") {
      const { sql, args = [] } = await req.json();
      try { return Response.json({ ok: true, rows: [...this.sql.exec(sql, ...args)] }); }
      catch (e) { return Response.json({ ok: false, error: String(e && e.message || e) }); }
    }
    return super.fetch(req);
  }
}
export default worker;
`;
  const opts = (version) => ({
    modules: true, script: PROBE, modulesRoot: "/",
    scriptPath: fileURLToPath(new URL("../src/rec184-migrate-probe.mjs", import.meta.url)),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-rec7", MEMBER_TOKEN: "mem-rec7", PROBE_TOKEN: "prb-rec7", VERSION: version },
  });
  const mf2 = new Miniflare(opts("test"));
  const call = async (op, body) => rP(await (await mf2.dispatchFetch(`http://x/api/?op=${op}&token=mem-rec7`,
    body ? { method: "POST", body: JSON.stringify(body) } : {})).json());
  const raw = async (sql) => {
    const ns2 = await mf2.getDurableObjectNamespace("STORE");
    return (await ns2.get(ns2.idFromName("bio")).fetch("http://x/rawsql",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql }) })).json();
  };
  const cols = async () => ((await raw("PRAGMA table_info(proposal_dispositions)")).rows || []).map((r) => r.name);
  await call("progressiondefine", { progressionKey: "grant", label: "Grant",
    stages: [{ key: "application", label: "application", cardinality: "1", required: "usually" },
             { key: "award", label: "award", after: "application", cardinality: "1", required: "always" }] });
  const e = await call("entitycreate", { kind: "fund", label: "Grant L", aliases: ["fund:L"] });
  const lAward = sha("rec184-L-award");
  const lDoc = { capture: { sha256: lAward, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "fund:L", kind: "fund", key: "L", label: "Grant L" }] } };
  const lMd = bundleMd("INFO-2026-0901-rec184"), lProv = JSON.stringify({ documents: [lDoc] });
  await call("promote", { bundleId: "INFO-2026-0901-rec184", base: null, snapKey: "20260924T010000Z_bbbb2222", author: "rec184",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Doc L", current_state: "collected",
            created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: lMd, bytes: lMd.length, sha256: sha(lMd) },
            { path: "data/provenance.json", text: lProv, bytes: lProv.length, sha256: sha(lProv) }], register: [] });
  await call("resolve", { captureSha: lAward });
  await call("thread", { progressionKey: "grant", entityId: e.entity_id, placements: [{ stage: "award", captureSha: lAward }] });
  await new Promise((r) => setTimeout(r, 5));   /* the decision's instant is strictly after the declaration's */
  const ld = await call("proposedispose", { key: "grant::application", to: "dismissed",
    reason: "a legacy decision", definitionVersion: 1 });   /* REC-211: the legacy fixture names the version it read */
  t("REC-184 L0 — fixture: the legacy store's gap is dismissed on the current shape, stamped version 1",
    [ld.ok, ld.definition_version], [true, 1]);
  const drop = await raw("ALTER TABLE proposal_dispositions DROP COLUMN definition_version");
  t("REC-184 L1 ARMED — the pre-build shape is made: the column is dropped, the row kept",
    [drop.ok, (await cols()).includes("definition_version"),
     ((await raw("SELECT count(*) AS c FROM proposal_dispositions")).rows || [])[0]?.c], [true, false, 1]);
  await mf2.setOptions(opts("test-reboot"));   /* same storage, a fresh boot through #migrate */
  t("REC-184 L2 — after the boot the column exists again and the old row holds NULL: never back-filled",
    [(await cols()).includes("definition_version"),
     ((await raw("SELECT definition_version AS v FROM proposal_dispositions")).rows || [])[0]?.v], [true, null]);
  const lf1 = await call("proposals");
  const l1 = (lf1.dispositions || []).find((d) => d.key === "grant::application");
  t("REC-184 L3 — the pre-build decision reads `not recorded`, its version null, and still GOVERNS because "
  + "the definition has not been declared since it was taken: the proposal stays aged",
    [l1 && [l1.definition_version, l1.definition_version_state, l1.current_definition_version, l1.applies, l1.applies_because],
     (lf1.proposals || []).some((p) => p.key === "grant::application")],
    [[null, "not recorded", 1, true, "version_not_recorded_definition_not_declared_since"], false]);
  await new Promise((r) => setTimeout(r, 5));
  const lv2 = await call("progressiondefine", { progressionKey: "grant", label: "Grant",
    stages: [{ key: "application", label: "written application", cardinality: "1", required: "usually" },
             { key: "award", label: "award", after: "application", cardinality: "1", required: "always" }],
    basis: "The fund now takes written applications only.", citation: "Fund guidelines 2026" });
  const lf2 = await call("proposals");
  const l2 = (lf2.dispositions || []).find((d) => d.key === "grant::application");
  const lp2 = (lf2.proposals || []).find((p) => p.key === "grant::application");
  t("REC-184 L4 — once the definition is declared AFTER the unrecorded decision, the decision stops "
  + "governing: the proposal is OPEN at version 2 with the decision beside it, and the version stays "
  + "`not recorded` rather than being guessed as 1",
    [lv2.version, l2 && [l2.definition_version, l2.definition_version_state, l2.applies, l2.applies_because],
     lp2 && lp2.definition_version, lp2 && lp2.prior_disposition && lp2.prior_disposition.definition_version_state],
    [2, [null, "not recorded", false, "version_not_recorded_definition_declared_since"], 2, "not recorded"]);
  await mf2.dispose();
}
console.log(`\nproposedispose: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
