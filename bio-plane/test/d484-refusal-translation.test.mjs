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
/* RE-PINNED 2026-09-28 (T8, legacy-tests) from this suite's own CORPUS print: src/store.mjs is 533,793 bytes after the
   T8 extractions (was over 1,000,000 at T7). A blindness floor, not a ratchet: an unreadable or truncated file fails it. */
/* RE-PINNED 2026-09-28 (legacy-tests T10, B1 (8); K341) from this suite's own CORPUS print: src/store.mjs is 484,830
   characters (the print says "bytes"; it is `.length`), under the old 500,000 floor. What left in T10, by name, from
   506,526 at T9's close, measured at each tranche merge: legacy-store's layer-10 job (deb9367cd3, -20,343: N268's dead
   private delegates and `static ownerMath`, N191's `#hiddenSets` run subtraction, the dead helpers), retrieval
   (99d8a98fd5, -786), strength (bf8416f54b, -355) and run-productions (cbd0805c1c, -212). Still a blindness floor at the
   measured figure, never below it. */
/* RE-PINNED 2026-09-29 (LEGACY-TESTS #10, T12; LEGACY-STORE #4, N285, K404) from this suite's own CORPUS print: 484,830
   -> 484,250 characters. T11's legacy-store (fe1111225e, N266/N267/N294) grew it +153 to 484,983; T12's LEGACY-STORE #4
   (9208377da3, -733) took out the scoped proposal dispose's own NOT_A_DISPOSITION literal, its sentence, the
   `DISPOSITIONS` import and their comments, answering through progressions' `notADisposition` (R35, C-100.20). Still a
   blindness floor at the measured figure, never below it. */
/* RE-PINNED 2026-09-29 (LEGACY-TESTS #10, T12 round 2; K409 QUEUE #2, K414 INSTANCE-SETUP #1) from this suite's own
   CORPUS print: 484,250 -> 222,052 characters. Measured at each merge into this branch: queue's extraction (74443d6d9e,
   -232,109: the feed, its producers and mint, the personal half, the dispose dispatch and the obligation inbox, to
   `src/queue/`) and instance-setup's (ce41cfb5d6, -30,089: C-64, the reports and the limits, to `src/setup.mjs`).
   NO_CITATION's `actNoCitation` is still the store's, so this suite's store arms still read a real subject. Still a
   blindness floor at the measured figure, never below it. */
/* RE-PINNED 2026-09-29 (LEGACY-TESTS #11, T13; K437, K442) from this suite's own CORPUS print: 222,052 -> 213,098
   characters. LEGACY-STORE #5 (4376a5405d, -221, N328) to 221,831; CONTROL-PLANE #4 (881c24b76e, 4235c62a3d, -8,733,
   N333: the store's door to `src/control-plane/dispatch.mjs`). `class Store` is still legacy-store's (control-plane's
   Durable Object extends it), so the store arms still read a real subject. Still a blindness floor at the measured
   figure, never below it. */
/* RE-PINNED 2026-09-30 (LEGACY-TESTS #12, T14; LEGACY-STORE #6) from this suite's own CORPUS print: 213,098 ->
   212,573 characters (-525: N331's `filingsOf` line, N342's registered counts, N343's `migrate()` call and the
   `settled_kind` line gone). Still a blindness floor at the measured figure, never below it. */
t("the corpus is non-empty and is the plane's store (floored, so an unreadable file cannot pass)",
  store.length >= 212_573 && /class Store\b/.test(store), true);

const ROW_BASIS = ACT_SHAPE_CHECKS.NO_BASIS;
const ROW_CITE = ACT_SHAPE_CHECKS.NO_CITATION;

console.log("\n--- the catalogue holds a row for each, with a real sentence ---");
/* RE-ANCHORED 2026-09-28 (T8, legacy-tests): the catalogue re-aimed C-33.40's `where` at inquiry's copy of the helper
   (`src/inquiry/index.mjs actNoBasis > is-act-no-basis`) when store.mjs's last NO_BASIS sites left (T7); C-33.41's still
   names the store's `actNoCitation`. Each `where` is pinned to the file that holds its region. */
const WHERE_FILE = { NO_BASIS: "src\\/inquiry\\/index\\.mjs", NO_CITATION: "src\\/store\\.mjs" };
for (const [code, row, check] of [["NO_BASIS", ROW_BASIS, "C-33.40"], ["NO_CITATION", ROW_CITE, "C-33.41"]]) {
  t(`${code} has an ACT_SHAPE_CHECKS row at ${check}`, row && row.check, check);
  t(`${code}'s translation is prose a member reads, not a restatement of the machine word`,
    !!row && typeof row.translation === "string" && row.translation.length > 120
      && !row.translation.includes(code), true);
  t(`${code}'s \`where\` names the ONE governed region, not a whole function`,
    !!row && new RegExp(`^${WHERE_FILE[code]} act[A-Za-z]+ > is-act-[\\w-]+$`).test(row.where), true);
}
t("the two translations are not each other (one sentence serving two codes is DEC-49's drift)",
  ROW_BASIS.translation === ROW_CITE.translation, false);

/* ---------------------------------------------------------------------------
   THE STRUCTURAL PIN. The `where` says there is ONE site. This is what makes
   that a measured fact rather than a sentence in a catalogue.
   --------------------------------------------------------------------------- */
console.log("\n--- ONE site per code, and it is inside the region the `where` names ---");
/* RE-ANCHORED 2026-09-28 (legacy-tests T9): store.mjs's `actNoBasis` left it (N186, LEGACY-STORE T9 item 5), so
   NO_BASIS's three arms read the file C-33.40's `where` names — `src/inquiry/index.mjs actNoBasis > is-act-no-basis` —
   and its one site must also sit inside `function actNoBasis(` there; store.mjs must now mint it nowhere. NO_CITATION's
   three arms read src/store.mjs as before (C-33.41's `where` still names the store's `actNoCitation`). The file each
   `where` names is the one read, so a `where` moved without its code (or the reverse) fails here. */
const INQ_SRC = readFileSync(fileURLToPath(new URL("../src/inquiry/index.mjs", import.meta.url)), "utf8");
const cnt0 = (s, re) => (s.match(re) || []).length;
const regionOf = (src, name) => {
  const a = src.indexOf(`DEC-49 REGION ${name}`);
  const b = src.indexOf(`END DEC-49 REGION ${name}`);
  return (a < 0 || b < 0 || b < a) ? null : src.slice(a, b);
};
for (const [code, region, file, src, fn, row] of [
  ["NO_BASIS", "is-act-no-basis", "src/inquiry/index.mjs", INQ_SRC, "actNoBasis", ROW_BASIS],
  ["NO_CITATION", "is-act-no-citation", "src/store.mjs", store, "actNoCitation", ROW_CITE]]) {
  const lit = new RegExp(`reason: "${code}"`, "g");
  const hits = [...src.matchAll(lit)];
  t(`\`reason: "${code}"\` is minted at EXACTLY ONE site in ${file} (was 4 and 3)`,
    [hits.length, row.where === `${file} ${fn} > ${region}`], [1, true]);
  const span = regionOf(src, region);
  t(`the DEC-49 region ${region} exists and is a marker PAIR`, !!span, true);
  const fnAt = src.search(new RegExp(`\\n(?:export )?function ${fn}\\(`));
  t(`that one site is INSIDE ${region} — the span the row's \`where\` claims`,
    !!span && span.includes(`reason: "${code}"`) && span.includes(`code: "${code}"`)
      && fnAt >= 0 && src.indexOf(`DEC-49 REGION ${region}`) > fnAt
      && src.indexOf(`DEC-49 REGION ${region}`) < src.indexOf("\n}\n", fnAt), true);
}
t("store.mjs mints NO_BASIS nowhere any more: its helper left with N186",
  [cnt0(store, /reason: "NO_BASIS"/g), /\nfunction actNoBasis\(/.test(store)], [0, false]);
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): five of the seven former sites left store.mjs with their ops
   (entities R4/R8's relationdeclare and testify: entities REPORT 2; progressions' progressiondefine revision and
   exception document: progressions REPORT 1). Each module mints them through its OWN helper over the SAME
   catalogue row (`actShape` in src/entities/index.mjs, `refusal` in src/progressions/index.mjs, whose row falls back
   to ACT_SHAPE_CHECKS for exactly these two codes). The count is the same seven, per file, named: store keeps
   op=conclude and the grouping partition (2 NO_BASIS); entities has testify (NO_BASIS) and relationdeclare
   (NO_CITATION); progressions has the revision's NO_BASIS and NO_CITATION and the exception's NO_CITATION. */
const ENT = readFileSync(fileURLToPath(new URL("../src/entities/index.mjs", import.meta.url)), "utf8");
const PRG = readFileSync(fileURLToPath(new URL("../src/progressions/index.mjs", import.meta.url)), "utf8");
const PRGC = readFileSync(fileURLToPath(new URL("../src/progressions/checks.mjs", import.meta.url)), "utf8");
const cnt = (s, re) => (s.match(re) || []).length;
/* RE-PINNED 2026-09-28 (T7 layer 6): store.mjs's last two sites left with their ops — op=conclude to basis-versions
   (`#conclude`, BASIS-VERSIONS #1 J4.1) and the grouping partition to inquiry (`#ground`, INQUIRY #1 J2.2). Each
   module mints NO_BASIS through its own `actNoBasis`, a copy of the store's helper inside its own
   `is-act-no-basis` region reading the same catalogue row. Still the same seven sites, per file; store.mjs now has
   none (its helper stays, uncalled — reported to legacy-store and legacy-checks, whose C-33.40 `where` names it). */
const INQ = readFileSync(fileURLToPath(new URL("../src/inquiry/index.mjs", import.meta.url)), "utf8");
const BV = readFileSync(fileURLToPath(new URL("../src/basis-versions/index.mjs", import.meta.url)), "utf8");
/* RE-ANCHORED 2026-09-28 (legacy-tests T10, B1 (d484)): two helpers changed their spelling in T10 and neither changed
   what it routes. Entities' helper is `actShapeRefusal` (fede1c49c0, entities T10, so the DEC-49 guard can read
   NO_ALIAS's refusal) — the same one function over ACT_SHAPE_CHECKS[code], still called once per code. Progressions'
   exception document (op=discharge, e49c27e26a, progressions T10, N208/N202) now answers its NO_CITATION inside the
   one refusal chain `const refused = ... || (!cite ? refusal("NO_CITATION", ...) : null) || ...; if (refused) return
   refused;` rather than on a `return` line of its own; it is counted in that form, with the chain's return asserted
   beside it, so an exception site that stopped returning the chain still fails here. Still 4 + 3, per file. */
t("every former site now returns through a helper: 4 NO_BASIS + 3 NO_CITATION call sites, per file",
  { store: [cnt(store, /return actNoBasis\(/g), cnt(store, /return actNoCitation\(/g)],
    inquiry: [cnt(INQ, /return actNoBasis\(/g), cnt(INQ, /return actNoCitation\(/g)],
    basis_versions: [cnt(BV, /return actNoBasis\(/g), cnt(BV, /return actNoCitation\(/g)],
    entities: [cnt(ENT, /return actShapeRefusal\("NO_BASIS"/g), cnt(ENT, /return actShapeRefusal\("NO_CITATION"/g)],
    progressions: [cnt(PRG, /return refusal\("NO_BASIS"/g),
                   cnt(PRG, /return refusal\("NO_CITATION"/g) + cnt(PRG, /\|\| \(!cite \? refusal\("NO_CITATION"/g)] },
  { store: [0, 0], inquiry: [1, 0], basis_versions: [1, 0], entities: [1, 1], progressions: [1, 2] });
t("and progressions' chained exception site RETURNS its chain — the helper's answer is what the op answers",
  /\|\| \(!cite \? refusal\("NO_CITATION"[\s\S]{0,1200}?\n\s*if \(refused\) return refused;/.test(PRG), true);
/* RE-ANCHORED 2026-09-28 (legacy-tests T10, B1 (d484)): N186 (basis-versions T10, layer 6) deleted basis-versions'
   copy of `actNoBasis` and its orphan `is-act-no-basis` marker (N204): it IMPORTS inquiry's helper, so the "two moved
   copies" are ONE, and C-33.40's single `where` (inquiry's) is now the whole truth. The arm follows: inquiry mints
   NO_BASIS once, inside its region, from the catalogue row; basis-versions mints it nowhere, holds no region and no
   copy, and its one call site is inquiry's function by import. */
t("and the one remaining copy (inquiry's) mints NO_BASIS once, inside its is-act-no-basis region, from the catalogue "
+ "row; basis-versions holds no copy and no region and calls inquiry's by import (N186)",
  [INQ, BV].map((src) => {
    const a = src.indexOf("DEC-49 REGION is-act-no-basis"), b = src.indexOf("END DEC-49 REGION is-act-no-basis");
    const span = a >= 0 && b > a ? src.slice(a, b) : "";
    return [cnt(src, /reason: "NO_BASIS"/g), span.includes('reason: "NO_BASIS"'),
            span.includes("ACT_SHAPE_CHECKS.NO_BASIS")];
  }).concat([[/\nfunction actNoBasis\(/.test(BV),
              /import \{[^}]*\bactNoBasis\b[^}]*\} from "\.\.\/inquiry\/index\.mjs"/.test(BV)]]),
  [[1, true, true], [0, false, false], [false, true]]);
t("and neither module mints either code as a bare literal outside its helper (the helpers read the catalogue row)",
  [cnt(ENT, /reason: "NO_(BASIS|CITATION)"/g), cnt(PRG, /reason: "NO_(BASIS|CITATION)"/g),
   /ACT_SHAPE_CHECKS\[code\]/.test(ENT), /ACT_SHAPE_CHECKS\[code\]/.test(PRGC)], [0, 0, true, true]);

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
