/* D-552 — a finding a member DISMISSED or DEFERRED carries that decision on op=instance and
 * op=captureprogressions, and is never hidden by it (framework §8.2; §12 "age rather than vanish", D-79).
 *
 * The defect: `proposalsFeed` was the only reader of `proposal_dispositions`, so op=instance (the
 * progression page's read) and op=captureprogressions (the document page's) listed a dismissed
 * finding as a bare open question — the record holding a decision and the read saying nothing about it.
 *
 * What this proves, every arm THROUGH the control plane:
 *   - before any decision, each finding carries `disposition: null` and is counted open;
 *   - after a member dismisses procurement::solicitation, the finding is STILL LISTED on both ops
 *     (`finding_count` unchanged) and carries the decision — state, reason, the server-stamped
 *     decider, instant, the version it judged, `applies: true` — and `open_finding_count` drops;
 *   - the decision published is the SAME fact op=proposals publishes (state, reason, decider, instant);
 *   - it is keyed per PROGRESSION: `grant` also has a `solicitation` stage and its finding stays undecided;
 *   - the op=thread echo carries it (REC-30: a write's receipt is the read's projection);
 *   - after a revision of the definition the finding is OPEN again at version 2 and still carries the
 *     decision with `applies: false`, `decided_against_earlier_version` — the same object op=proposals
 *     publishes as `prior_disposition` (D-527's shape on op=queue), key for key;
 *   - the admin credential reads the same decider: the disposition has no viewer branch.
 */
/* NEGATIVE CONTROL: RUN 2026-09-24 (WORKER D-552) by a driver held OUTSIDE the worktree, each arm ALONE by one
   exact-match patch of store.mjs (anchor matched once; the file checked CHANGED before the run), restored from a
   pristine copy verified by sha256 (9b1d2c71…) AND `cmp` (3,324,899 B, floored) after every arm. BASELINE 19/0.
   ALL FIVE AS DECLARED, every run reaching this suite's foot.
   (A) UNWIRE op=instance — `#withDispositions` returns the assembled instance untouched (yesterday's plane) -> 8/11:
       every op=instance disposition arm, the thread echo, the revision arms and the SEAM fail by name; the two
       captureprogressions arms that compare against op=instance's object fail WITH them (they assert the two
       reads agree). MUST NOT FAIL and did not: the fixtures, and captureprogressions' own `before` arm.
   (B) UNWIRE op=captureprogressions — its per-instance map always empty -> 17/2: exactly the two arms reading a
       decision there. op=instance untouched.
   (C) THE VANISH — the decided findings FILTERED out of op=instance instead of carrying the decision (the shape
       D-79 forbids) -> 15/4: "STILL LISTS the finding" fails by name. The revision arms stay GREEN, correctly:
       after the revision the decision no longer applies, so the filter drops nothing.
   (D) UN-KEY BY PROGRESSION — the decision read for every progression, not the instance's own -> 17/2: exactly
       the two OVER-REACH arms (grant's own `solicitation` finding would carry procurement's decision).
   (E) OVER-STRICTNESS — the published object built key by key in REVERSE order, correct in a spelling this item
       does not use -> 19/0. (The comparator canonicalises key order for this reason; the first draft compared
       JSON.stringify and would have failed this arm.)
   INSTRUMENT FINDING, RECORDED: the suite's first draft read `f1.disposition` unguarded, so arms (A) and (C)
   ended the module on a TypeError with NO FOOT printed — failing, but for the wrong reason. Corrected to optional
   reads and all five arms re-run; the figures above are the re-run's. */
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
  bindings: { ADMIN_TOKEN: "adm-d552", MEMBER_TOKEN: "mem-d552", PROBE_TOKEN: "prb-d552", VERSION: "test" },
});

let pass = 0, fail = 0;
/* KEY ORDER IS NOT THE CONTRACT: a published object compared by JSON.stringify fails correct code that
   spells the same keys in another order, so both sides are canonicalised (sorted keys) first. */
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x))
  ? Object.fromEntries(Object.keys(x).sort().map((q) => [q, x[q]])) : x);
const t = (label, got, want) => {
  const ok = canon(got) === canon(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d552") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
/* The literals `op=instance`, `op=captureprogressions`, `op=proposals` and `op=proposedispose` are
   written out (not interpolated) so scripts/coverage.mjs credits the control-plane surface. */
const getInstance = async (key, id, tok = "mem-d552") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=instance&key=${encodeURIComponent(key)}&id=${encodeURIComponent(id)}&token=${tok}`)).json());
const getCaptureProgressions = async (s, tok = "mem-d552") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=captureprogressions&sha256=${s}&token=${tok}`)).json());
const getProposals = async (tok = "mem-d552") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=proposals&token=${tok}`)).json());
const proposeDispose = async (body, tok = "mem-d552") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=proposedispose&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());

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
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-d552`;
  const md = bundleMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "d552",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Doc ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
  return r.ok !== false;
};

console.log("\n--- seed: two progressions that BOTH have a `solicitation` stage, each with one gap ---");
const PROC_STAGES = [
  { key: "need", label: "staff report", cardinality: "0..n", required: "sometimes" },
  { key: "solicitation", label: "RFP / RFQ / IFB", after: "need", cardinality: "0..1", required: "usually" },
  { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
  { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
];
const proc = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: PROC_STAGES });
const grant = await post("progressiondefine", { progressionKey: "grant", label: "Grant", stages: [
  { key: "solicitation", label: "call for applications", cardinality: "1", required: "usually" },
  { key: "award", label: "award", after: "solicitation", cardinality: "1", required: "always" }] });
t("fixture: both progressions are defined", [proc.ok, grant.ok], [true, true]);

const eA = await post("entitycreate", { kind: "contract", label: "Contract A", aliases: ["contract:C-A"] });
const aid = eA.entity_id;
const aAward = sha("d552-A-award"), aContract = sha("d552-A-contract");
for (const s of [aAward, aContract])
  await promoteReading(s, [{ ref: "contract:C-A", kind: "contract", key: "C-A", label: "Contract A" }]);
for (const s of [aAward, aContract]) await post("resolve", { captureSha: s });
const thA = await post("thread", { progressionKey: "procurement", entityId: aid,
  placements: [{ stage: "award", captureSha: aAward }, { stage: "contract", captureSha: aContract }] });
const eG = await post("entitycreate", { kind: "fund", label: "Grant G", aliases: ["fund:G"] });
const gid = eG.entity_id;
const gAward = sha("d552-G-award");
await promoteReading(gAward, [{ ref: "fund:G", kind: "fund", key: "G", label: "Grant G" }]);
await post("resolve", { captureSha: gAward });
const thG = await post("thread", { progressionKey: "grant", entityId: gid, placements: [{ stage: "award", captureSha: gAward }] });
t("fixture: both instances are threaded", [thA.ok, thA.threaded, thG.ok, thG.threaded], [true, 2, true, 1]);

const stageF = (inst, sk) => (Array.isArray(inst && inst.findings) ? inst.findings : []).find((f) => f.stage_key === sk);
const cpF = (cp, key, sk) => {
  const i = (Array.isArray(cp && cp.instances) ? cp.instances : []).find((x) => x.progression_key === key);
  return i ? (i.findings || []).filter((f) => f.stage_key === sk) : [];
};

console.log("\n--- BEFORE any decision: every finding says `disposition: null` and is open ---");
const i0 = await getInstance("procurement", aid);
const f0 = stageF(i0, "solicitation");
t("before: op=instance lists the solicitation finding, `disposition` PRESENT and null (nobody decided — "
+ "a stated null, not an absent key), and counts it open",
  [i0.ok, i0.finding_count, !!f0, f0 && "disposition" in f0, f0 && f0.disposition, i0.open_finding_count],
  [true, 1, true, true, null, 1]);
const cp0 = await getCaptureProgressions(aAward);
const cf0 = cpF(cp0, "procurement", "solicitation");
t("before: op=captureprogressions lists the same finding with `disposition: null`",
  [cp0.ok, cf0.length, cf0.map((f) => f.disposition)], [true, 1, [null]]);

console.log("\n--- a member DISMISSES procurement::solicitation ---");
const REASON = "below the solicitation threshold, so no RFP was required";
const dz = await proposeDispose({ key: "procurement::solicitation", to: "dismissed", reason: REASON, definitionVersion: 1 });
t("fixture: the dismissal is recorded against version 1, decider stamped server-side",
  [dz.ok, dz.definition_version, dz.decided_by], [true, 1, "class:member"]);

const i1 = await getInstance("procurement", aid);
const f1 = stageF(i1, "solicitation");
t("THE ROW: after the dismissal op=instance STILL LISTS the finding — it ages, it does not vanish (D-79)",
  [i1.finding_count, !!f1, f1 && f1.kind], [1, true, "missing_predecessor"]);
t("THE ROW: and the finding CARRIES the decision — state, reason, decider, instant, the version it judged, "
+ "and that it governs the definition in force",
  f1 && f1?.disposition,
  { state: "dismissed", reason: REASON, decided_by: "class:member", at: dz.at,
    definition_version: 1, definition_version_state: "recorded",
    applies: true, applies_because: "decided_against_current_version" });
t("THE ROW: the instance says how many findings no decision governs — 0 open of 1 listed",
  [i1.finding_count, i1.open_finding_count], [1, 0]);

const pf1 = await getProposals();
const pd1 = (pf1.dispositions || []).find((d) => d.key === "procurement::solicitation");
t("the decision on op=instance is the SAME fact op=proposals holds (state, reason, decider, instant, applies)",
  [pd1 && pd1.state, pd1 && pd1.reason, pd1 && pd1.decided_by, pd1 && pd1.at, pd1 && pd1.applies],
  [f1?.disposition?.state, f1?.disposition?.reason, f1?.disposition?.decided_by, f1?.disposition?.at, f1?.disposition?.applies]);

const cp1 = await getCaptureProgressions(aAward);
const cf1 = cpF(cp1, "procurement", "solicitation");
t("op=captureprogressions: the finding is STILL LISTED and carries the SAME decision op=instance does",
  [cf1.length, cf1[0] && cf1[0].disposition], [1, f1?.disposition]);

const gi1 = await getInstance("grant", gid);
const gf1 = stageF(gi1, "solicitation");
t("OVER-REACH: `grant` also has a `solicitation` stage and nobody decided it — its finding stays "
+ "`disposition: null` and open (the decision is keyed per progression, exactly as the act writes it)",
  [gi1.finding_count, gf1 && gf1.disposition, gi1.open_finding_count], [1, null, 1]);
const gcp1 = await getCaptureProgressions(gAward);
t("OVER-REACH: and op=captureprogressions agrees for grant's document",
  cpF(gcp1, "grant", "solicitation").map((f) => f.disposition), [null]);

const thA2 = await post("thread", { progressionKey: "procurement", entityId: aid,
  placements: [{ stage: "award", captureSha: aAward }, { stage: "contract", captureSha: aContract }] });
t("the op=thread ECHO carries the decision too (REC-30: a write's receipt is the read's projection)",
  [thA2.ok, stageF(thA2, "solicitation") && stageF(thA2, "solicitation").disposition, thA2.open_finding_count],
  [true, f1?.disposition, 0]);

/* A PROBE credential cannot be the second viewer here: PROBE is confined to the scratch namespace
   (D-325), so it reads a DIFFERENT store and would answer "no such progression" — not a viewer fact. */
const ia = await getInstance("procurement", aid, "adm-d552");
t("VIEWER: the admin credential reads the same decider and decision the member credential does — the "
+ "disposition has no viewer branch; #redactInstance withholds bundle ids only (REC-30)",
  stageF(ia, "solicitation") && stageF(ia, "solicitation").disposition, f1?.disposition);

console.log("\n--- the definition is REVISED: the finding is open again and keeps the decision as history ---");
await new Promise((r) => setTimeout(r, 5));   /* the revision's instant is strictly after the decision's */
const rev = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement",
  stages: PROC_STAGES.map((s) => s.key === "solicitation" ? { ...s, label: "solicitation of any kind" } : s),
  basis: "The purchasing ordinance now requires a solicitation at every threshold.",
  citation: "Purchasing ordinance §2-104 (2026 amendment)" });
t("fixture: the revision writes version 2", [rev.ok, rev.version], [true, 2]);
const i2 = await getInstance("procurement", aid);
const f2 = stageF(i2, "solicitation");
t("after the revision the finding is read against version 2 and is OPEN again (1 open of 1 listed)",
  [f2 && f2.definition_version, i2.finding_count, i2.open_finding_count], [2, 1, 1]);
t("and it still CARRIES the decision, now as history: judged version 1, does not govern version 2",
  f2 && f2?.disposition,
  { state: "dismissed", reason: REASON, decided_by: "class:member", at: dz.at,
    definition_version: 1, definition_version_state: "recorded",
    applies: false, applies_because: "decided_against_earlier_version" });
const pf2 = await getProposals();
const pp2 = (pf2.proposals || []).find((p) => p.key === "procurement::solicitation");
t("SEAM: the object is op=proposals' `prior_disposition` (the shape D-527 publishes on op=queue), "
+ "key for key and value for value — one fact, two names",
  pp2 && pp2.prior_disposition, f2 && f2?.disposition);
const cf2 = cpF(await getCaptureProgressions(aContract), "procurement", "solicitation");
t("op=captureprogressions reads the same aged decision from the other threaded document",
  cf2.map((f) => f.disposition), [f2?.disposition]);

await mf.dispose();
console.log(`\nd552-instance-disposition: ${pass} pass, ${fail} fail`);
if (pass === 0) { console.log("  FAIL  the suite reached its foot with ZERO passes"); process.exit(1); }
process.exit(fail ? 1 : 0);
