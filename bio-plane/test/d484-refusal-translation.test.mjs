/* D-484 — THE TWO MULTI-SITE ACT-SHAPE CODES CARRY THEIR CANNED TRANSLATION ON THE WIRE.
 *
 * DEC-49 (Bob, 2026-08-06), as `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it: every
 * condition a member can meet has a named code and a CANNED TRANSLATION, and an untranslated code
 * fails the harness rather than reaching a person. `NO_BASIS` and `NO_CITATION` had neither — not
 * because nobody wrote the sentence, but because ACT_SHAPE_CHECKS's own header could not hold the
 * row: a row holds ONE `where`, a `where` names THE SMALLEST SPAN IN WHICH THE REFUSAL IS ENFORCED,
 * and `NO_BASIS` was minted at FOUR sites in `store.mjs` and `NO_CITATION` at THREE. That header
 * named the honest fix — the refusals consolidated behind one helper so there IS one site — and
 * routed it. D-484 is that fix, and this suite is what makes it a fact rather than a claim.
 *
 * HOW A LIAR PASSES, and it is the failure this suite is shaped around: add two rows to the
 * catalogue that no site ever mints. Arm A of the DEC-49 guard is satisfied by the rows ALONE, arm C
 * reads the helper and is satisfied by the helper ALONE, and a member refused at any of the seven
 * former sites still meets a bare machine word. So this suite does two things neither the catalogue
 * nor the guard does:
 *
 *   1. IT DRIVES THE OP. Every assertion below reads a refusal off the CONTROL PLANE's answer —
 *      a real caller's only route — and asserts `translation` is the catalogue's sentence, arriving
 *      at the member. A store-level test is not evidence a caller can reach the feature.
 *   2. IT PINS THE ROUTING STRUCTURALLY. Driving one site of each code proves that site; it says
 *      nothing about the other five. So the suite reads `src/store.mjs` and asserts the code literal
 *      appears EXACTLY ONCE, inside its DEC-49 region — which is the `where`'s own claim — and that
 *      every former site now calls the helper. A seventh site added later re-breaks the `where` and
 *      fails here by name, which is the thing a wire assertion at one site cannot see.
 *
 * ADDITIVE ON THE WIRE (I3). The old answer must still be there: `reason`, the site's own `detail`,
 * and the per-site keys (`target`, `progression_key`, `version`) are asserted UNCHANGED beside the
 * three new ones. A translation that replaced a key rather than joining it would break callers.
 *
 * NEGATIVE CONTROL: recorded on the `NEGATIVE CONTROL:` line below.
 *
 * NEGATIVE CONTROL: (run 2026-09-24, D-484, worktree /home/user/bio on branch land/worker/D-484)
 * each arm ALONE, others held open, restored from a UNIQUELY-NAMED per-arm pristine copy verified by
 * sha256 AND `cmp` AND a byte count (src/store.mjs 3,164,102 bytes 514f8110838242ef…; checks/bio-checks.mjs
 * 911,880 bytes 31a117a81b479323…, both identical before and after every arm).
 *   (0) BASELINE -> 28 pass 0 fail, exit 0; `check-refusal-codes.mjs --strict` exit 0.
 *   (1) THE ROW'S OWN — the `op=progressiondefine` NO_BASIS site restored BARE (the pre-D-484 object
 *       literal, bypassing `actNoBasis`). DECLARED must fail: the EXACTLY-ONE structural pin and the
 *       call-site count. DECLARED must not fail: every NO_CITATION arm, the catalogue arms, the
 *       over-strictness arm. ACTUAL 26/2, failing at exactly those two BY NAME. **AND ONE SURPRISING
 *       GREEN, RECORDED RATHER THAN SMOOTHED, because it is a fact about the MECHANISM: the wire arm
 *       "AND THE TRANSLATION ARRIVED" still PASSED.** `index.mjs`'s `dec49Decorate` fills `code`,
 *       `check` and `translation` onto ANY `ok:false` answer whose `reason` matches a `*_CHECKS` row,
 *       downstream of the store — so a CATALOGUE ROW ALONE puts the sentence on the wire and the
 *       consolidation is invisible there. WHAT THIS SUITE CAN AND CANNOT SEE, therefore, stated
 *       plainly: the wire arms prove a member MEETS the sentence; they are NOT evidence about the
 *       routing, and the structural pin is the only discriminator this suite has for that. What the
 *       consolidation buys is the ROW — a row holds one `where`, so without one site there is no
 *       honest row, and without a row `dec49Decorate` has nothing to fill.
 *       **AND A SECOND FINDING FROM THE SAME ARM: the DEC-49 guard did NOT fail under it** (only its
 *       un-moved floors did). `check-refusal-codes.mjs` arm C reads only the spans a `where` names, so
 *       a code re-minted OUTSIDE every governed region is invisible to it — for all 168 governed sites,
 *       not just these two. Routed as a defect with its fix in D-484's report.
 *   (2) THE LIAR — NO_BASIS's `translation` blanked to `''` in the catalogue (the row present, the
 *       sentence absent: rows no site can honour is this item's own liar shape). DECLARED must fail:
 *       the prose arm and the wire arm; the guard by name. ACTUAL 24/4 — the prose arm, and all three
 *       `op=progressiondefine` NO_BASIS arms, because `actNoBasis` THREW as designed and the answer
 *       never formed (a 500 is loud; a missing sentence is silent and reaches a person). The guard
 *       failed BY NAME: "ACT_SHAPE_CHECKS.NO_BASIS has NO CANNED TRANSLATION". Every NO_CITATION arm
 *       stayed green, which is the each-arm-alone requirement holding.
 *       ARM 2's FIRST DRAFT DID NOT ARM and is recorded because an arm that did not arm is a finding:
 *       it blanked the string by editing its continuation lines and left `translation: '' + '` —
 *       INVALID JS, so the module failed to parse and every arm "failed" for the wrong reason. A
 *       crash refutes nothing; it was restored, re-armed on the whole value, and re-run.
 *   (3) OVER-STRICTNESS, an assertion green at baseline rather than a separate arm: a revision that
 *       states BOTH its basis and its citation is ACCEPTED, becomes version 2, and carries none of the
 *       three refusal keys — so a decorator that stamped every answer would fail here by name.
 * WHAT IT CANNOT SEE: five of the seven routed sites (op=conclude, the grouping partition, op=testify,
 * op=discharge) are pinned STRUCTURALLY and are not driven through their ops here — each needs a
 * captured-document chain this suite does not build. The pin sees a site that stops calling the
 * helper; it does not see one whose `detail` was changed.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ACT_SHAPE_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d484", MEMBER_TOKEN: "mem-d484", PROBE_TOKEN: "prb-d484", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d484") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());

/* THE CORPUS IS PRINTED AND FLOORED. A suite that asserts over an empty subject passes for free,
   and this project has measured a headline totality assertion doing exactly that three times. */
const store = readFileSync(SRC, "utf8");
console.log(`\nCORPUS: src/store.mjs ${store.length} bytes, ${store.split("\n").length} lines`);
t("the corpus is non-empty and is the plane's store (floored, so an unreadable file cannot pass)",
  store.length > 1_000_000 && /class Store\b/.test(store), true);

const ROW_BASIS = ACT_SHAPE_CHECKS.NO_BASIS;
const ROW_CITE = ACT_SHAPE_CHECKS.NO_CITATION;

console.log("\n--- the catalogue holds a row for each, with a real sentence ---");
for (const [code, row, check] of [["NO_BASIS", ROW_BASIS, "C-33.40"], ["NO_CITATION", ROW_CITE, "C-33.41"]]) {
  t(`${code} has an ACT_SHAPE_CHECKS row at ${check}`, row && row.check, check);
  t(`${code}'s translation is prose a member reads, not a restatement of the machine word`,
    !!row && typeof row.translation === "string" && row.translation.length > 120
      && !row.translation.includes(code), true);
  t(`${code}'s \`where\` names the ONE governed region, not a whole function`,
    !!row && /^src\/store\.mjs act[A-Za-z]+ > is-act-[\w-]+$/.test(row.where), true);
}
t("the two translations are not each other (one sentence serving two codes is DEC-49's drift)",
  ROW_BASIS.translation === ROW_CITE.translation, false);

/* ---------------------------------------------------------------------------
   THE STRUCTURAL PIN. The `where` says there is ONE site. This is what makes
   that a measured fact rather than a sentence in a catalogue.
   --------------------------------------------------------------------------- */
console.log("\n--- ONE site per code, and it is inside the region the `where` names ---");
const regionOf = (name) => {
  const a = store.indexOf(`DEC-49 REGION ${name}`);
  const b = store.indexOf(`END DEC-49 REGION ${name}`);
  return (a < 0 || b < 0 || b < a) ? null : store.slice(a, b);
};
for (const [code, region] of [["NO_BASIS", "is-act-no-basis"], ["NO_CITATION", "is-act-no-citation"]]) {
  const lit = new RegExp(`reason: "${code}"`, "g");
  const hits = [...store.matchAll(lit)];
  t(`\`reason: "${code}"\` is minted at EXACTLY ONE site in src/store.mjs (was 4 and 3)`, hits.length, 1);
  const span = regionOf(region);
  t(`the DEC-49 region ${region} exists and is a marker PAIR`, !!span, true);
  t(`that one site is INSIDE ${region} — the span the row's \`where\` claims`,
    !!span && span.includes(`reason: "${code}"`) && span.includes(`code: "${code}"`), true);
}
t("every former site now returns through a helper: 4 actNoBasis + 3 actNoCitation call sites",
  [(store.match(/return actNoBasis\(/g) || []).length, (store.match(/return actNoCitation\(/g) || []).length],
  [4, 3]);

/* ---------------------------------------------------------------------------
   ON THE WIRE, THROUGH THE OP.
   --------------------------------------------------------------------------- */
const STAGES_V1 = [
  { key: "solicitation", label: "RFP", cardinality: "0..1", required: "usually" },
  { key: "award", label: "council resolution", after: "solicitation", cardinality: "1", required: "always" },
  { key: "contract", label: "signed agreement", after: "award", cardinality: "1", required: "always" },
];
const STAGES_V2 = [
  { key: "solicitation", label: "RFP", cardinality: "0..1", required: "sometimes" },
  STAGES_V1[1], STAGES_V1[2],
];

console.log("\n--- NO_BASIS arrives translated, through op=progressiondefine ---");
const v1 = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: STAGES_V1 });
t("a declared flow stands at version 1 (the subject the revision is refused against)", [v1.ok, v1.version], [true, 1]);
const nb = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: STAGES_V2 });
t("THE OLD ANSWER IS STILL THERE: ok, reason and the per-site keys are unchanged",
  [nb.ok, nb.reason, nb.progression_key, nb.version], [false, "NO_BASIS", "procurement", 1]);
t("the site's own `detail` is unchanged — the operator's sentence, not the member's",
  typeof nb.detail === "string" && nb.detail.includes("a revision states its basis"), true);
t("AND THE TRANSLATION ARRIVED: code, check and the catalogue's sentence, on the wire",
  [nb.code, nb.check, nb.translation], ["NO_BASIS", "C-33.40", ROW_BASIS.translation]);

console.log("\n--- NO_CITATION arrives translated, through op=progressiondefine ---");
const nc = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: STAGES_V2,
  basis: "Contracts under $50,000 may be awarded without a formal solicitation." });
t("THE OLD ANSWER IS STILL THERE: ok, reason and the per-site keys are unchanged",
  [nc.ok, nc.reason, nc.progression_key, nc.version], [false, "NO_CITATION", "procurement", 1]);
t("the site's own `detail` is unchanged",
  typeof nc.detail === "string" && nc.detail.includes("a revision of a declared flow carries a citation"), true);
t("AND THE TRANSLATION ARRIVED: code, check and the catalogue's sentence, on the wire",
  [nc.code, nc.check, nc.translation], ["NO_CITATION", "C-33.41", ROW_CITE.translation]);

console.log("\n--- a SECOND site of NO_CITATION, a different op, the SAME sentence ---");
const from = await post("entitycreate", { kind: "office", label: "Office of the City Auditor" });
const to = await post("entitycreate", { kind: "office", label: "Office of the City Administrator" });
t("two entities exist to relate", [from.ok, to.ok], [true, true]);
const rel = await post("relationdeclare", { fromEntity: from.entity_id, toEntity: to.entity_id,
  relation: "overlaps", justification: "they share a procurement function" });
t("THE OLD ANSWER IS STILL THERE at the second site", [rel.ok, rel.reason], [false, "NO_CITATION"]);
t("the second site keeps ITS OWN detail — the helper carries the code, never the particular",
  typeof rel.detail === "string" && rel.detail.includes("a declared relation carries a citation"), true);
t("and it carries the SAME canned translation as the first site (that is the consolidation)",
  [rel.code, rel.check, rel.translation === ROW_CITE.translation], ["NO_CITATION", "C-33.41", true]);

console.log("\n--- OVER-STRICTNESS: correct work still passes, and nothing was written ---");
const good = await post("progressiondefine", { progressionKey: "procurement", label: "Procurement", stages: STAGES_V2,
  basis: "Contracts under $50,000 may be awarded without a formal solicitation.",
  citation: "Oakland Municipal Code 2.04.051" });
t("a revision that states BOTH is accepted and becomes version 2, carrying no refusal keys",
  [good.ok, good.version, good.code, good.translation], [true, 2, undefined, undefined]);
t("the three refusals above wrote nothing: version 2 is the FIRST version past 1",
  good.prior_version, 1);

await mf.dispose();
/* THE TAIL LINE IS THE BATTERY'S CONTRACT (D-93, D-413): `scripts/battery.mjs` reads `N pass, M fail`
   off it, and the COMMA is load-bearing. Written without it on this suite's first run, the battery counted the
   suite green and EXCLUDED all 28 of its assertions from the 19,510 total, naming it — caught from that line. */
console.log(`\nd484-refusal-translation: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
