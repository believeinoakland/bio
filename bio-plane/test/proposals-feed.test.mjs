/* op=proposals — the DISCOVERY feed for DERIVED findings (REC-6; UI-5's delegation). Builds on
 * FW-9 (progression instances + the missing-predecessor finding), FW-10 (exception documents that
 * discharge a lawful skip), FW-7 (resolutions / op=resolve / op=resolvetestify) and FW-6 (the
 * subject registry). It is the READ side of the walking-task FW-9/FW-10 deferred: a read-time walk
 * of every progression INSTANCE for its missing-predecessor findings, D-79-aggregated. It REPORTS
 * and never mutates — derived things inform.
 *
 * What this proves (the accepts-when):
 *   - a GAP-carrying store returns the missing-predecessor findings AGGREGATED per D-79 (N
 *     instances of one (progression_key, stage_key) check -> ONE proposal, never N), each proposal
 *     carrying the WEAKEST §8.1 grade across its instances and surfaced_by: machine;
 *   - a store with NO gaps returns an EMPTY feed — proven on a POPULATED store whose one instance
 *     is COMPLETE (every required stage filled), so "empty" is a real exclusion, not an empty store;
 *   - a DISCHARGED gap (FW-10) does NOT appear — a lawful recorded skip is not a proposal;
 *   - undetermined stays undetermined — an instance with fewer than two placed stages grades its
 *     finding "undetermined", and ANY undetermined instance makes the aggregate undetermined, never
 *     averaged into a determined grade;
 *   - the RAW per-instance `instances` shape UI-5's loadProposals already consumes is present, so
 *     the existing surface populates with NO UI change (its proposalsFrom groups these).
 *
 * Everything is driven THROUGH the control plane (a real caller's only route), so coverage credits
 * op=proposals on the control-plane surface, not only the store (D-43).
 */
/* NEGATIVE CONTROL: in store.mjs proposalsFeed drop the instance-walk (replace the `for (const p of pairs)` body with a no-op so `instances`/`proposals` stay empty) -> the feed returns NOTHING for a store known to carry a solicitation gap. RUN 2026-07-31 record-agent-6: with the walk dropped the "gap-carrying store surfaces one aggregated proposal", "N instances -> one entry", "weakest grade" and discharged/undetermined assertions FAIL (proposal_count 0 where >0 is required); restored -> full suite green. */
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
  bindings: { ADMIN_TOKEN: "adm-rec6", MEMBER_TOKEN: "mem-rec6", PROBE_TOKEN: "prb-rec6", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-rec6") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
/* THE op under test, reached by a member session THROUGH the control plane. The literal
   `op=proposals` string is here (not interpolated) so scripts/coverage.mjs credits it. */
const getProposals = async (tok = "mem-rec6") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=proposals&token=${tok}`)).json());

/* seed captured documents through the real FW-5 -> FW-6 -> FW-7 chain, exactly as the FW-9/FW-10
   suites do: promote a bundle whose data/provenance.json carries a crafted reading. */
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
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-rec6`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "rec6",
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

console.log("\n--- the ONE progression: need(sometimes) -> solicitation(usually) -> award(always) -> contract(always) ---");
const proc = await post("progressiondefine", {
  progressionKey: "procurement", label: "Procurement",
  stages: [
    { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
    { key: "solicitation", label: "RFP / RFQ / IFB", after: "need", cardinality: "0..1", required: "usually" },
    { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
    { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
  ],
});
t("the procurement progression is defined with four stages", [proc.ok, proc.stage_count], [true, 4]);

/* ---- phase 1: a POPULATED store whose only instance is COMPLETE -> the feed is EMPTY.
   entity K, aliased by its identifier so its documents resolve at grade A; every required stage
   filled (solicitation, award, contract), need (sometimes) legitimately absent -> no finding. ---- */
console.log("\n--- a COMPLETE instance (no gap) is NOT surfaced: no-gaps -> empty feed on a populated store ---");
const eK = await post("entitycreate", { kind: "contract", label: "Complete Contract K", aliases: ["contract:C-K"] });
const kid = eK.entity_id;
const kSolic = sha("rec6-K-solicitation"), kAward = sha("rec6-K-award"), kContract = sha("rec6-K-contract");
for (const s of [kSolic, kAward, kContract])
  await promoteReading(s, [{ ref: "contract:C-K", kind: "contract", key: "C-K", label: "Complete Contract K" }]);
for (const s of [kSolic, kAward, kContract]) await post("resolve", { captureSha: s });
await post("thread", { progressionKey: "procurement", entityId: kid,
  placements: [{ stage: "solicitation", captureSha: kSolic }, { stage: "award", captureSha: kAward }, { stage: "contract", captureSha: kContract }] });
const feed0 = await getProposals();
t("op=proposals answers ok even with no gaps", feed0.ok, true);
t("a populated store whose only instance is COMPLETE returns an EMPTY feed (no gaps -> nothing surfaced)",
  [feed0.proposal_count, feed0.instance_count, feed0.proposals.length, feed0.instances.length], [0, 0, 0, 0]);

/* ---- phase 2: entity A, a gap on solicitation. A resolves at grade A (its identifier matched),
   so its instance grade is A. ONE aggregated proposal, N=1. ---- */
console.log("\n--- entity A: a gap on solicitation (grade A) -> one aggregated proposal ---");
const eA = await post("entitycreate", { kind: "contract", label: "Gap Contract A", aliases: ["contract:C-A"] });
const aid = eA.entity_id;
const aAward = sha("rec6-A-award"), aContract = sha("rec6-A-contract"), aMemo = sha("rec6-A-memo");
for (const s of [aAward, aContract, aMemo])
  await promoteReading(s, [{ ref: "contract:C-A", kind: "contract", key: "C-A", label: "Gap Contract A" }]);
for (const s of [aAward, aContract, aMemo]) await post("resolve", { captureSha: s });
const thrA = await post("thread", { progressionKey: "procurement", entityId: aid,
  placements: [{ stage: "award", captureSha: aAward }, { stage: "contract", captureSha: aContract }] });
t("entity A's instance fires ONE missing_predecessor finding on solicitation, at a determined grade A",
  [thrA.findings.length, thrA.findings[0].stage_key, thrA.findings[0].grade, thrA.findings[0].grade_determined],
  [1, "solicitation", "A", true]);

const feed1 = await getProposals();
t("the gap-carrying store surfaces exactly ONE aggregated proposal (K's complete instance still excluded)",
  feed1.proposal_count, 1);
const p1 = feed1.proposals[0];
t("the proposal is keyed by (progression_key, stage_key) and names the stage",
  [p1.key, p1.progression_key, p1.stage_key, p1.stage_label, p1.required],
  ["procurement::solicitation", "procurement", "solicitation", "RFP / RFQ / IFB", "usually"]);
t("the proposal is SURFACED BY the machine (D-82 provenance) and carries the instance's grade A",
  [p1.surfaced_by, p1.n, p1.grade, p1.grade_determined], ["machine", 1, "A", true]);
t("the RAW per-instance shape UI-5 consumes is present: {progression_key, progression_label, entity_id, entity_label, findings}",
  [feed1.instances.length, feed1.instances[0].progression_key, feed1.instances[0].progression_label,
   feed1.instances[0].entity_id, feed1.instances[0].entity_label, feed1.instances[0].findings[0].kind],
  [1, "procurement", "Procurement", aid, "Gap Contract A", "missing_predecessor"]);

/* ---- phase 3: entity B, the SAME gap, but resolved only by grade-D TESTIMONY -> weakest wins.
   B's documents carry a raw ref that matches NO alias, so op=resolve finds nothing; a member
   TESTIFIES each to B (grade D). The aggregate of A(grade A) + B(grade D) grades to the WEAKEST, D. ---- */
console.log("\n--- entity B: the same solicitation gap at grade D -> N=2, aggregate grade is the WEAKEST (D) ---");
const eB = await post("entitycreate", { kind: "contract", label: "Gap Contract B", aliases: ["Gap Contract B only"] });
const bid = eB.entity_id;
const bAward = sha("rec6-B-award"), bContract = sha("rec6-B-contract");
for (const s of [bAward, bContract])
  await promoteReading(s, [{ ref: "contract:C-B-raw", kind: "contract", key: "C-B-raw", label: "unmatched B label" }]);
/* NO op=resolve for B (its ref matches no alias); ONLY grade-D testimony, so B's grade is D. */
for (const s of [bAward, bContract])
  await post("resolvetestify", { captureSha: s, ref: "contract:C-B-raw", entityId: bid, basis: "a member vouches this concerns contract B" });
const thrB = await post("thread", { progressionKey: "procurement", entityId: bid,
  placements: [{ stage: "award", captureSha: bAward }, { stage: "contract", captureSha: bContract }] });
t("entity B's instance fires the solicitation finding at grade D (testimony)",
  [thrB.findings[0].stage_key, thrB.findings[0].grade], ["solicitation", "D"]);

const feed2 = await getProposals();
t("D-79 AGGREGATION: two instances of the one solicitation check -> ONE proposal carrying N=2, never two items",
  [feed2.proposal_count, feed2.proposals[0].key, feed2.proposals[0].n], [1, "procurement::solicitation", 2]);
t("the aggregate grade is the WEAKEST across its instances (A and D -> D), never the strongest",
  [feed2.proposals[0].grade, feed2.proposals[0].grade_determined], ["D", true]);
t("both entities are carried under the one proposal, each with its own grade",
  feed2.proposals[0].instances.map((i) => [i.entity_id, i.grade]).sort(),
  [[aid, "A"], [bid, "D"]].sort());

/* ---- phase 4: an UNDETERMINED instance keeps the aggregate undetermined.
   a second progression 'grant': application(usually) -> award(always). entities G and H each place
   ONLY award (one placed stage) -> the instance grade is UNDETERMINED (fewer than two placed), and
   application is a missing required finding at grade "undetermined". Two such -> aggregate undetermined. ---- */
console.log("\n--- undetermined stays undetermined: a one-placed-stage instance, aggregated ---");
await post("progressiondefine", { progressionKey: "grant", label: "Grant",
  stages: [{ key: "application", label: "application", cardinality: "1", required: "usually" },
           { key: "award", label: "award", after: "application", cardinality: "1", required: "always" }] });
for (const [lbl, alias, tag] of [["Grant G", "fund:G", "G"], ["Grant H", "fund:H", "H"]]) {
  const e = await post("entitycreate", { kind: "fund", label: lbl, aliases: [alias] });
  const s = sha(`rec6-${tag}-award`);
  await promoteReading(s, [{ ref: alias, kind: "fund", key: tag, label: lbl }]);
  await post("resolve", { captureSha: s });
  await post("thread", { progressionKey: "grant", entityId: e.entity_id, placements: [{ stage: "award", captureSha: s }] });
}
const feed3 = await getProposals();
const gGrant = feed3.proposals.find((p) => p.key === "grant::application");
t("the grant::application proposal aggregates its two one-placed-stage instances (N=2)", gGrant ? gGrant.n : null, 2);
t("ANY undetermined instance makes the AGGREGATE undetermined — never averaged into a determined grade",
  [gGrant.grade, gGrant.grade_determined], [null, false]);
t("biggest pattern first: grant::application and procurement::solicitation both have N=2, so the stable key tiebreak orders grant first",
  feed3.proposals.map((p) => p.key), ["grant::application", "procurement::solicitation"]);

/* ---- phase 5: a DISCHARGED gap does NOT appear (FW-10). discharge A's solicitation with an
   exception document (the memo, which resolves to A), carrying a reason + citation. A's solicitation
   gap becomes a lawful recorded "discharged" state — not a finding — so it drops out of the feed. ---- */
console.log("\n--- a DISCHARGED gap does NOT surface as a proposal (FW-10: a lawful recorded skip is not a finding) ---");
const disc = await post("discharge", { progressionKey: "procurement", entityId: aid, stage: "solicitation", captureSha: aMemo,
  reason: "sole-source emergency procurement — no solicitation was issued", citation: "City Administrator finding, 2024-03-02" });
t("op=discharge records the exception against A's solicitation stage", [disc.ok, disc.discharged_stage], [true, "solicitation"]);
const feed4 = await getProposals();
const solic4 = feed4.proposals.find((p) => p.key === "procurement::solicitation");
t("after the discharge the solicitation proposal drops A and carries only B (N=2 -> N=1)", solic4 ? solic4.n : null, 1);
t("the surviving instance is B (A's gap is discharged), and the grade is now B's D alone",
  [solic4.instances[0].entity_id, solic4.grade], [bid, "D"]);
t("the DISCHARGED gap is gone, not merely regraded: A's entity no longer appears under the solicitation proposal",
  solic4.instances.some((i) => i.entity_id === aid), false);

console.log("\n--- op=proposals REPORTS, it does not mutate: reading it twice changes nothing ---");
const feedAgainA = await getProposals();
const feedAgainB = await getProposals();
t("two successive reads of op=proposals are identical (a read-time walk, no side effect)",
  JSON.stringify(feedAgainA.proposals), JSON.stringify(feedAgainB.proposals));

await mf.dispose();
console.log(`\nproposals-feed: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
