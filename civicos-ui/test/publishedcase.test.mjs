/* NEGATIVE CONTROL: (UI-18's EIGHT arms. Each was broken ALONE, RUN 2026-08-05 by ui18-agent, and restored byte-identical — `civicos-ui/app.html`'s sha256 compared before and after every arm and equal to 79a4a7c26339db40ccc5eff80c99abf370c2597025d1707bbc11386ce6e0306f each time. The suite is 114 assertions whole; the counts below are what each arm MEASURED.)
 *   (a) A DETERMINING LEG DROPPED AT A THRESHOLD — in `pubQualifiers`, change the graded arm's guard to `if(false && a.state === "graded" && a.weakest != null){`. RUN: 5 of 114 fail — the connection-determining leg dropped at "Checking this against records you already hold", the capture-determining leg dropped at "Quoting this in something you publish" AND at "Citing this in a filing", and the artifact's own sentence about qualifiers gone with them. The reader is shown a frozen strength and no leg that could have produced it (D-8/C-15).
 *       AND THIS ARM CORRECTED THE SUITE, which is the most useful thing it did. On its FIRST run it fired only 3, because three assertions read `t.includes(<leg id>)` over the stripped page — and A DROPPED LEG IS STILL NAMED, in the dropped list two inches lower, which is the whole rule. So "the qualifier survived" was true whether it survived or not: an outcome that costs nothing to produce, in the exact shape CLAUDE.md names. `pubLegHtml` now marks the kept set `data-kept` and the dropped list `data-dropped`, the assertions read the two sets apart, and the arm was re-run against the corrected instrument: 3 failures became 5.
 *   (b) A PUBLISHED CHILD WITH NO PARENT NAMED — in `pubDivisionHtml`, disable the parent line (`${false ? …}`). RUN: 1 of 114 fails, naming the parent disclosure. ONE, and the count is the point: the siblings, the never-served sentence and the whole rest of the child's page still read perfectly, so nothing about the page LOOKS wrong — R4's disclosure is exactly the kind of absence a reader cannot notice, which is why it has an assertion of its own rather than being folded into a division-block check.
 *   (c) THE TWO STRENGTHS COMPOSED INTO ONE LETTER, INCLUDING IN PRINT — in `pubPairBadges`, return one mark: `const g=[pair.capture.grade,pair.connection.grade].filter(Boolean).sort().pop(); return `<span class="pub-axisrow"><span class="pub-grade" data-axis="capture">Overall ${g}</span></span>`;`. RUN: 7 of 114 fail — the index rows, the strength section, the frozen letters and the child's UNRATED axis all lose the connection half.
 *       THE FINDING, and it is UI-21's lesson at a new altitude: "mark count and axis count agree" STAYED GREEN. The composed mark still carries a `data-axis`, so the count sweep — the obvious instrument — called a single composed letter correct. Only the PAIRED assertions (both axes present in every context that shows a strength at all) fired. Do not weaken those into a count.
 *   (d) ONE FLOOR APPLIED TO BOTH AXES — RE-POINTED 2026-08-04 (UI-27, DEC-40) because its old subject no longer exists: it edited `stanceFloors`, and there is no stance. THE RULE IS UNCHANGED and so is the direction of the break — in `readerFloors`, read every axis off the same value (`const v = f.capture;`). RUN 2026-08-04, app.html restored byte-identical (sha256 214610070f1fc24f… before and after): 5 of 131 fail — a reader's pair no longer needs both axes, a half pair draws a case instead of refusing, the `none`/real split stops naming `none` where the reader said `none`, and DEC-40's filter line names one floor twice. R2's forbidden composition performed by arithmetic.
 *   (e) ONE AXIS LEFT UNCONSTRAINED — RE-POINTED 2026-08-04 (UI-27) for the same reason: it deleted an axis from a named stance's `floors`. Now, in `readerFloors`, default a missing or unknown value instead of refusing (`if(!FLOOR_VALUES.includes(v)){ out[ax] = "none"; continue; }`). RUN 2026-08-04, restored byte-identical (same sha256): 2 of 131 fail — the resolver accepts half a pair, and the half-pair rendering that must not be drawn is drawn. The surface refusing to draw is the shipped answer; the harness failing is the statement that such a rendering may not be shipped, because an unstated floor reads as a satisfied one.
 *   (f) A `none` FLOOR OMITTED FROM THE RENDERING — in `pubInbandHtml`, wrap the capture floor line as `${floors && floors.capture === "none" ? "" : `<div>…</div>`}`. RUN: 2 of 114 fail — the "whole case" and "own records" renderings stop naming the floor they applied to the documents axis. TWO, and every other assertion including the DEC-34 header's floor line stays green, because the header names the floors from a different function: an omission in ONE of the two places both floors are printed is invisible to any check that reads only the other.
 *   (g) A PAGE-SHAPED ARTIFACT WITHOUT THE DEC-34 HEADER — in `pubPage`, return `<section class="pub-page">${inner}</section>`. RUN: 7 of 114 fail: page count and header count disagree by five, the per-page facts sweep finds none of the seven facts on any page, and the edition/authors/declared-bias assertions that read the header go with it. This is DEC-34's negative control seam, which `bio-plane/test/publishedcase.test.mjs` block 4 deliberately left unplaced because the plane produces no pages to put a header on. It is placed here.
 *   (h) THE IN-BAND BLOCK HIDDEN IN PRINT — add `.pub-inband{display:none}` inside app.html's `@media print{…}` block. RUN: 1 of 114 fails, naming the hiding rule. The print arm refuses ANY hiding rule rather than protecting a list of selectors, because the moment a stylesheet is allowed to hide one thing the argument for hiding the next is already written — and a qualifier that survives on screen and vanishes on paper is the forbidden compression performed by CSS.
 * Restore after each.
 *
 * UI-27's TWO NEW ARMS (DEC-40 (d)), RUN 2026-08-04 by ui27-agent against the 131-assertion suite, `civicos-ui/app.html` restored BYTE-IDENTICALLY after each (sha256 214610070f1fc24fb6572605d6336e37196bb76487eea618ba2eaeb73c74b81c compared before and after both, and all four arms below re-run against that file so the counts and the hash agree):
 *   (i) STRIP THE FILTER LINE FROM A FILTERED RENDERING — in `dec34Header`, delete the whole `<span class="f"><b>What this is</b> ${pubFilterHtml(floors, "filterline")}</span>` line. RUN: 4 of 131 fail — the per-page count of filter lines falls short in BOTH directions (the unfiltered rendering and the filtered one), and neither rendering's DEC-34 header carries the line any more. THIS IS THE ARM THE RULING EXISTS FOR: a filtered page indistinguishable from the case is the misrepresentation vector, and it is the one defect that leaves the page looking perfect — every leg it kept is real, every strength on it is the plane's own, and the only thing wrong with it is what it does not say.
 *   (j) PRESENT A FILTERED RENDERING AS THE CASE — in `pubRenderingName`, return `"THE WHOLE CASE, UNFILTERED"` unconditionally. RUN: 3 of 131 fail — the filtered rendering is no longer named as a view the reader constructed, the footer's rendering hash is described as the case, and the stripped-text sweep loses the statement.
 *       AND THE ARM MEASURED SOMETHING WORTH KEEPING, in UI-18 arm (c)'s exact shape one altitude up: the `data-filter="reader"` MARKS STAYED CORRECT on every page, because they are computed from `pubFiltered` and not from the sentence. So the count sweep — the obvious instrument — called a lying page correctly filtered, and only the assertions that read the WORDS fired. Do not weaken the word assertions into the mark count.
/* UI-18 · O2 THE PUBLISHED CASE — the surface UI-PLAN calls "the reason the
 * rest exists", driven here against the public read path REC-22 landed.
 *
 * THE ORGANISING QUESTION, and it is not "does the markup contain the words".
 * This is the only surface a STRANGER meets and the only one that reads with no
 * credential, so the suite is built around the three ways it could betray that:
 *
 *   1. IT COULD ASK FOR SOMETHING IT SHOULD NOT NEED. Every assertion below is
 *      made by a caller holding NOTHING — `PLANE.token` is null for the whole
 *      run — and the wire is swept at the end: not one request this surface
 *      made may carry a `token` parameter, and the four ops it reached must be
 *      exactly the four the plane declares `classes: null`.
 *
 *   2. IT COULD CLAIM MORE THAN THE RECORD SUPPORTS. Both frozen strengths
 *      everywhere including the index row and never one composed letter; the
 *      declared bar beside the strength reached with an ABSENT bar rendered as
 *      absent rather than as zero; a leg the surface can only NAME saying so
 *      and offering no address; a division's parent and siblings named and
 *      served neither; the supersession banner saying WHICH number it shows.
 *
 *   3. IT COULD FILTER SOMETHING AWAY WITHOUT SAYING SO. CORRECTED 2026-08-04
 *      (UI-27) — this clause described Q6's NAMED STANCE, which DEC-40 removed:
 *      a stance claims to enumerate purposes we cannot know, and the case
 *      speaks for itself. THE READER supplies a pair of independent floors,
 *      defaulting to none/none — the whole case — and every rendering drawn
 *      under a reader's floors carries the FILTER in DEC-34's per-page header,
 *      in-band, and beside the rendering hash in the footer, and is never
 *      presented, printed or hash-described as "the case". An UNFILTERED
 *      rendering says that it is unfiltered, or absence of the line becomes the
 *      ambiguity. Everything Q6's FORM required is unchanged and still asserted:
 *      both floors stated in-band, a floor of `none` rendered explicitly, an
 *      axis that is not graded satisfying only `none`, a qualifier never
 *      dropped, a `cuts_against` leg dropped by a floor called out BY NAME, and
 *      a print stylesheet that may only ADD — because a qualifier that survives
 *      on screen and vanishes on paper is the same filter performed by CSS.
 *
 * WHAT THIS SUITE MEASURED THAT IS WORTH THE NEXT SESSION'S TIME:
 *
 *   - THE COUNT SWEEP IS NOT ENOUGH FOR THE COMPOSED LETTER. Arm (c) composes
 *     the two strengths into one mark that still carries a `data-axis`, so
 *     "every strength mark names its axis" stays green while the page shows a
 *     single letter. Only the PAIRED assertion — both axes present in every
 *     context that shows a strength at all — fires. Two instruments, and the
 *     weaker one alone would have called the composition correct.
 *   - D-160 REACHES THIS ITEM'S OWN VOCABULARY. QUEUE.md and RECONCILED both
 *     describe the boundary-case leg with a word `check-semantics.mjs` retires
 *     from `app.html` entirely, because it means the OPPOSITE in SB-OUTPUT
 *     §5.1. The rule did not move; the word did. UNRATED is the word, and the
 *     leg is one that LEFT AN AXIS UNRATED.
 *   - THE FROZEN PAIR CARRIES NO `not_load_bearing`. The frontmatter block
 *     `op=publish` writes has axis, state, grade, weakest, load_bearing,
 *     population and detail — so the set of legs that left an axis UNRATED
 *     cannot be read off the pair on this surface and is taken from the basis
 *     instead. That is the conservative direction and is asserted as such: one
 *     qualifier too many, never one too few.
 *
 * THE FOUR FORBIDDEN AFFORDANCES (H7 reply box, H2 notify-me, H3 verified-
 * author badge, H1 redact/take-down) are asserted ABSENT structurally, and the
 * reasoning for each is at the head of app.html's `__PUBLISHED_CASE__` region
 * rather than here, because the file that would grow one is the file that has
 * to carry the argument against it.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================================================
   THE FIXTURE — shaped exactly as `op=publishedcase` answers, taken from
   bio-plane/src/index.mjs's handler and bio-plane/src/store.mjs's
   `publishedCase()`. `strength` is the FROZEN frontmatter block (weakest is a
   target id STRING, and there is no `not_load_bearing` key); `required` is the
   frozen `required_strength`; `basis[]` carries the plane's own `served` flag
   and the cited edition's own frozen pair.
   ============================================================ */
const CASE = "INQ-2026-4101";
const PARENT = "INQ-2026-4000";
const SIBLING = "INQ-2026-4102";
const OTHER = "INQ-2026-4200";
const SHA1 = "a".repeat(64), SHA2 = "b".repeat(64), MAN1 = "c".repeat(64), MAN2 = "d".repeat(64);
const CAP_SHA = "e".repeat(64), DOC_SHA = "f".repeat(64);
const OTHER_SHA = "1".repeat(64), OTHER_MAN = "2".repeat(64);
const INFO_SHA = "3".repeat(64);

const L_CAP_B = "INFO-2026-8001";   // capture B, supports, SERVED
const L_CAP_D = "INFO-2026-8002";   // capture D, supports, NAMED — the capture DETERMINING leg
const L_CAP_C = "INFO-2026-8003";   // capture C, CUTS AGAINST, NAMED — dropped at a capture floor of B
const L_CON_C = "INFO-2026-8004";   // connection C, supports, NAMED — the connection DETERMINING leg
const L_CON_A = "INFO-2026-8005";   // connection A, supports, SERVED

const PAIR_1 = [
  { axis:"capture", state:"graded", grade:"D", weakest:L_CAP_D, load_bearing:3, population:3,
    detail:"capture D — no stronger than the weakest capture it rests on, which is " + L_CAP_D + "." },
  { axis:"connection", state:"graded", grade:"C", weakest:L_CON_C, load_bearing:2, population:2,
    detail:"connection C — no stronger than the weakest connection it rests on, which is " + L_CON_C + "." },
];
/* DEC-17: this case declares NO bar, so the absent branch is the one under
   test. The sentence is the plane's own, verbatim, because "an absent bar is
   not a bar of zero" is exactly the clause a renderer shortens into a dash. */
const BAR_ABSENT = { declared:false, source:"none", capture:null, connection:null,
  detail:"no required evidentiary strength was declared for this case, by the group or by any project citing it, so nothing here was measured against one. An absent bar is not a bar of zero, and this case makes no claim to have cleared any standard." };

const BASIS_1 = [
  { target:L_CAP_B, role:"supports", grade:"B", grade_axis:"capture", grade_source:"capture",
    target_edition:1, served:true,
    cited_edition:{ edition:1, title:"The transfer memo", bundle_sha:DOC_SHA, ratified_at:"2026-06-01T00:00:00Z",
      capture:{ axis:"capture", state:"graded", grade:"B" }, connection:{ axis:"connection", state:"unrated", grade:null } },
    detail:"this leg rests on a published edition, so it can be served from this surface." },
  { target:L_CAP_D, role:"supports", grade:"D", grade_axis:"capture", grade_source:"testimony",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the case cites it and can hand over nothing of it." },
  { target:L_CAP_C, role:"cuts_against", grade:"C", grade_axis:"capture", grade_source:"testimony",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the case cites it and can hand over nothing of it." },
  { target:L_CON_C, role:"supports", grade:"C", grade_axis:"connection", grade_source:"hunch",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the case cites it and can hand over nothing of it." },
  { target:L_CON_A, role:"supports", grade:"A", grade_axis:"connection", grade_source:"resolution",
    target_edition:2, served:true,
    cited_edition:{ edition:2, title:"The council resolution", bundle_sha:CAP_SHA, ratified_at:"2026-06-11T00:00:00Z",
      capture:{ axis:"capture", state:"graded", grade:"A" }, connection:{ axis:"connection", state:"graded", grade:"A" } },
    detail:"this leg rests on a published edition, so it can be served from this surface." },
];

const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
const EXCLUDED_1 = JSON.stringify([[ "INFO-2026-8099", "the FY2023 comparison memo",
  "a records request for it is still outstanding with the City Clerk" ]]);

const VERIFY = { bytes:"op=publishedbytes&sha256=" + SHA1,
  container:"op=publishedbytes&sha256=" + MAN1 + "&format=zip",
  manifest:"op=publishedbytes&sha256=" + MAN1,
  detail:"tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the manifest answers by its own sha256, and the signature covers the bundle sha. Nothing here prevents a modified copy; everything here makes one detectable by anyone holding it, without this instance's cooperation." };

function caseEdition(ed){
  const isTop = ed === 2;
  return {
    ok:true, bundleId:CASE, edition:ed, title:"Was the sewer transfer authorised?",
    bundle_sha: ed === 1 ? SHA1 : SHA2, ratified_at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z",
    attestor:{ member:"vera", key_b64:"AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyBytesHere0000000000000" },
    gate_version:"1.20.0", sig_armored:"-----BEGIN SSH SIGNATURE-----\nU1NIU0lH\n-----END SSH SIGNATURE-----",
    completeness:{ statement: ed === 1 ? STMT1 : STMT2,
      subject_justification:"We put the four claims to the City Administrator on 2026-06-20 and printed what came back.",
      excluded: ed === 1 ? EXCLUDED_1 : "[]", subject_position:"sought_and_answered",
      author:"vera", at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z" },
    strength:PAIR_1, required:BAR_ABSENT,
    manifest_sha: ed === 1 ? MAN1 : MAN2, manifest:null,
    files:[ { path:"bundle.md", sha256: ed === 1 ? SHA1 : SHA2, kind:"bundle", bytes:4211 },
            { path:"snapshots/memo.bin", sha256:CAP_SHA, kind:"capture", bytes:8192 },
            { path:"MANIFEST.json", sha256: ed === 1 ? MAN1 : MAN2, kind:"manifest", bytes:1904 } ],
    editions:[1,2],
    edition_index:[ { edition:1, bundle_sha:SHA1, ratified_at:"2026-07-01T09:00:00Z", manifest_sha:MAN1 },
                    { edition:2, bundle_sha:SHA2, ratified_at:"2026-07-20T09:00:00Z", manifest_sha:MAN2 } ],
    latest_edition:2,
    serves:[ { to:L_CAP_B, kind:"reference", edition:1, title:"The transfer memo", bundle_sha:DOC_SHA,
               manifest_sha:MAN1, ratified_at:"2026-06-01T00:00:00Z" } ],
    names:[], unresolved:[],
    division:{ parent:null, siblings:[], detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"inquiry",
    body:{ state:"published", from_sha: ed === 1 ? SHA1 : SHA2,
      question:"Did money from the sewer enterprise fund pay for marina construction between 2022 and 2024?",
      conclusion:"The transfer rests on a memo nobody adopted, and the ledger shows it moved anyway.",
      falsifies:"An adopted resolution naming the transfer would overturn this.",
      excludes: (ed === 1 ? STMT1 : STMT2) + "\n\n- INFO-2026-8099 — the FY2023 comparison memo: a records request for it is still outstanding with the City Clerk\n\nPosition on putting this case to its subject: sought_and_answered.",
      authored:{ conclusion:"The transfer rests on a memo nobody adopted.",
                 falsifier:"An adopted resolution naming the transfer would overturn this." },
      detail:"`authored` is what op=conclude wrote into the frontmatter." },
    verification:VERIFY,
    _isTop: isTop,
  };
}

/* THE DIVIDED CHILD, and the second half of the fixture's job: a case with one
   axis UNRATED (DEC-18's boundary case, D-160's word), a DECLARED bar, and R4's
   parent/sibling disclosure. */
const PAIR_2 = [
  { axis:"capture", state:"graded", grade:"B", weakest:"INFO-2026-8201", load_bearing:1, population:2,
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-8201." },
  { axis:"connection", state:"unrated", grade:null, weakest:null, load_bearing:0, population:1,
    detail:"UNRATED on connection: no leg on this axis carries an established grade, so this conclusion rests on nothing established here. Not load-bearing: INFO-2026-8202." },
];
const BAR_DECLARED = { declared:true, source:"group", capture:"B", connection:"C",
  declared_by:"vera", declared_at:"2026-05-02",
  detail:"the group's default required strength: capture B, connection C, declared by vera on 2026-05-02." };
const CHILD = {
  ok:true, bundleId:OTHER, edition:1, title:"Who approved the transfer?",
  bundle_sha:OTHER_SHA, ratified_at:"2026-07-05T09:00:00Z",
  attestor:{ member:"dan", key_b64:"AAAAC3NzaC1lZDI1NTE5AAAAIAnotherExampleKeyBytes000000000" },
  gate_version:"1.20.0", sig_armored:"-----BEGIN SSH SIGNATURE-----\nU1NIU0lH\n-----END SSH SIGNATURE-----",
  completeness:{ statement:"This half of the divided question covers approval only.",
    subject_justification:"The officer named declined to answer in writing.",
    excluded:"[]", subject_position:"sought_and_refused", author:"dan", at:"2026-07-05T09:00:00Z" },
  strength:PAIR_2, required:BAR_DECLARED, manifest_sha:OTHER_MAN, manifest:null,
  files:[ { path:"bundle.md", sha256:OTHER_SHA, kind:"bundle", bytes:2210 } ],
  editions:[1], edition_index:[ { edition:1, bundle_sha:OTHER_SHA, ratified_at:"2026-07-05T09:00:00Z", manifest_sha:OTHER_MAN } ],
  latest_edition:1, serves:[],
  names:[ { to:PARENT, kind:"division_parent" }, { to:SIBLING, kind:"division_sibling" } ],
  unresolved:[],
  division:{ parent:PARENT, siblings:[SIBLING],
    detail:"a division's parent and siblings are NAMED and never served: the parent is terminal and can never be published, a sibling may not be, and a reader who can see one half of a divided question is entitled to know the other half exists (R4)." },
  object_type:"inquiry",
  basis:[
    { target:"INFO-2026-8201", role:"supports", grade:"B", grade_axis:"capture", grade_source:"capture",
      target_edition:null, served:false, cited_edition:null,
      detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the case cites it and can hand over nothing of it." },
    { target:"INFO-2026-8202", role:"supports", grade:null, grade_axis:null, grade_source:null,
      target_edition:null, served:false, cited_edition:null,
      detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the case cites it and can hand over nothing of it." },
  ],
  body:{ state:"published", from_sha:OTHER_SHA, question:"Which officer approved the transfer?",
    conclusion:"No officer of record approved it.", falsifies:"A signed approval naming an officer.",
    excludes:"This half of the divided question covers approval only.\n\nNothing material was excluded from this case.",
    authored:{ conclusion:"No officer of record approved it.", falsifier:"A signed approval naming an officer." },
    detail:"" },
  verification:{ bytes:"op=publishedbytes&sha256=" + OTHER_SHA,
    container:"op=publishedbytes&sha256=" + OTHER_MAN + "&format=zip",
    manifest:"op=publishedbytes&sha256=" + OTHER_MAN,
    detail:"tamper-EVIDENT, not tamper-proof: nothing here prevents a modified copy, and everything here makes one detectable." },
};

/* THE INDEX, over EDITIONS (DEC-12), with the container manifest carried as the
   JSON STRING the column actually holds — `publishedManifest()` returns the row
   unparsed, and a surface that assumed an object would render a blank pair on
   every real instance. The last row is a published INFORMATION bundle, which is
   not a case and carries no frozen pair at all: it is in the fixture so the
   index has to SAY that rather than invent one. */
const MANIFEST_ROWS = [
  { bundle_id:CASE, edition:1, title:"Was the sewer transfer authorised?", bundle_sha:SHA1,
    ratified_at:"2026-07-01T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0", manifest_sha:MAN1,
    manifest: JSON.stringify({ format:"bio-case-container/1", case:CASE, edition:1,
      strength:PAIR_1, required_strength:BAR_ABSENT }) },
  { bundle_id:CASE, edition:2, title:"Was the sewer transfer authorised?", bundle_sha:SHA2,
    ratified_at:"2026-07-20T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0", manifest_sha:MAN2,
    manifest: JSON.stringify({ format:"bio-case-container/1", case:CASE, edition:2,
      strength:PAIR_1, required_strength:BAR_ABSENT }) },
  { bundle_id:OTHER, edition:1, title:"Who approved the transfer?", bundle_sha:OTHER_SHA,
    ratified_at:"2026-07-05T09:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0", manifest_sha:OTHER_MAN,
    manifest: JSON.stringify({ format:"bio-case-container/1", case:OTHER, edition:1,
      strength:PAIR_2, required_strength:BAR_DECLARED }) },
  { bundle_id:"INFO-2026-8001", edition:1, title:"The transfer memo", bundle_sha:INFO_SHA,
    ratified_at:"2026-06-01T00:00:00Z", attestor_key:"CCCC", gate_version:"1.20.0", manifest_sha:null,
    manifest: JSON.stringify({ format:"bio-case-container/1", case:"INFO-2026-8001", edition:1,
      strength:null, required_strength:null }) },
];

const PUBLISHED_SHAS = new Map([
  [SHA1, { bundle_id:CASE, path:"bundle.md", kind:"bundle", published:"2026-07-01T09:00:00Z" }],
  [SHA2, { bundle_id:CASE, path:"bundle.md", kind:"bundle", published:"2026-07-20T09:00:00Z" }],
  [CAP_SHA, { bundle_id:CASE, path:"snapshots/memo.bin", kind:"capture", published:"2026-07-01T09:00:00Z" }],
  [MAN1, { bundle_id:CASE, path:"MANIFEST.json", kind:"manifest", published:"2026-07-01T09:00:00Z" }],
  [MAN2, { bundle_id:CASE, path:"MANIFEST.json", kind:"manifest", published:"2026-07-20T09:00:00Z" }],
  [DOC_SHA, { bundle_id:L_CAP_B, path:"bundle.md", kind:"bundle", published:"2026-06-01T00:00:00Z" }],
  [OTHER_SHA, { bundle_id:OTHER, path:"bundle.md", kind:"bundle", published:"2026-07-05T09:00:00Z" }],
]);

/* ---------------- the mock plane ---------------- */
const WIRE = [];
const BYTES = new TextEncoder().encode("the ratified bytes of edition 1");

function mockFetch(u, opts){
  const url = new URL(String(u), "https://plane.test");
  const op = url.searchParams.get("op");
  WIRE.push({ op, url: url.pathname + url.search, method:(opts && opts.method) || "GET",
              token: url.searchParams.get("token") });
  const R = o => ({ ok:true, json:async()=>o });
  /* WRAPPED: index.mjs re-wraps this one explicitly, `json({ok:true, result})`. */
  if(op === "publishedmanifest")
    return R({ ok:true, result:{ ok:true, scope:"published", published:MANIFEST_ROWS, shas:[],
      detail:"every hash here is verifiable by anyone with ssh-keygen and the doorbell." } });
  /* FLAT: its own handler, `json({ok:true, ...c, object_type, body, basis, verification})`. */
  if(op === "publishedcase"){
    const id = url.searchParams.get("id");
    const ed = url.searchParams.get("edition");
    const sha = url.searchParams.get("sha256");
    if(id === CASE || sha === SHA1 || sha === SHA2){
      const which = sha === SHA1 ? 1 : sha === SHA2 ? 2 : (ed ? Number(ed) : 2);
      if(which !== 1 && which !== 2)
        return R({ ok:false, reason:"NOT_PUBLISHED", detail:"no published edition answers to that." });
      const c = caseEdition(which);
      return R({ ok:true, ...c, basis:BASIS_1 });
    }
    if(id === OTHER) return R({ ok:true, ...CHILD });
    return R({ ok:false, reason:"NOT_PUBLISHED",
      detail:"no published edition answers to that. A case that was never published, an edition that does not exist and an id that never existed are one answer here." });
  }
  /* FLAT: `json({ok:true, ...out.result})`. */
  if(op === "verify"){
    const sha = (url.searchParams.get("sha256") || "").toLowerCase();
    const m = PUBLISHED_SHAS.get(sha);
    return R({ ok:true, published: !!m, sha256:sha, matches: m ? [{ ...m }] : [] });
  }
  /* BYTES, by hash and only by hash — never JSON on success, which is why it is
     deliberately NOT in check-mock-envelope's FLAT list. */
  if(op === "publishedbytes"){
    const sha = (url.searchParams.get("sha256") || "").toLowerCase();
    if(url.searchParams.get("path")) return R({ ok:false, error:"publishedbytes requires sha256=<64 lowercase hex>. This surface answers BY HASH and never by path, so there is nothing to walk." });
    if(!PUBLISHED_SHAS.has(sha))
      return R({ ok:false, reason:"NOT_FOUND", sha256:sha,
        detail:"no published part answers to that hash. A hash that was never ratified and a hash that never existed are the same answer here, deliberately." });
    return { ok:true, status:200, headers:{ get:k => k === "x-published-kind" ? PUBLISHED_SHAS.get(sha).kind : null },
             arrayBuffer:async()=>BYTES.buffer, json:async()=>({ ok:false, error:"these are bytes" }) };
  }
  if(op === "whoami") return R({ ok:true, result:{ tokenClass:null, session:false, capabilities:[] } });
  return R({ ok:false, error:"unexpected op " + op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, open:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const OPENED = [];
const LISTENERS = {};
let HASH = "";
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", get hash(){ return HASH; }, set hash(v){ HASH = v; } },
  history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} },
  window:{ addEventListener(k, fn){ (LISTENERS[k] = LISTENERS[k] || []).push(fn); },
           open:(u)=>{ OPENED.push(String(u)); return null; } },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__PUB=PUB;" +
  "globalThis.__pubList=pubList;globalThis.__pubOpen=pubOpen;globalThis.__pubVerify=pubVerify;" +
  "globalThis.__pubBytes=pubBytes;globalThis.__pubVerifyPanel=pubVerifyPanel;" +
  "globalThis.__enterPublished=enterPublished;globalThis.__pubLeave=pubLeave;" +
  "globalThis.__publishedRouteFromHash=publishedRouteFromHash;globalThis.__pubPaintBack=pubPaintBack;" +
  /* CORRECTED 2026-08-04 (UI-27, DEC-40), never exempted. This line used to
     export `THRESHOLDS` and `stanceFloors` and to set `PUB.stance`. There is no
     stance any more: the reader supplies the pair of floors and the surface
     offers no named set to resolve. `__setFloors` writes the two values the
     reader would have set through the two controls — one per axis, never one
     value written to both — and repaints. */
  "globalThis.__readerFloors=readerFloors;globalThis.__FLOOR_VALUES=FLOOR_VALUES;" +
  "globalThis.__pubFiltered=pubFiltered;globalThis.__pubSetFloor=pubSetFloor;" +
  "globalThis.__setFloors=async (cap,con)=>{ PUB.floors={capture:cap,connection:con}; await pubPaint(); };", ctx);

/* THE WHOLE RUN IS MADE BY A CALLER HOLDING NOTHING. There is no line below that
   sets a token, which is the point: the wire sweep at the end is evidence and
   not a promise. */
ctx.__PLANE.base = "";
ctx.__PLANE.token = null;
ctx.__PLANE.session = false;

const pubBody = () => els.get("#pub-body")._html;
const list = () => els.get("#pl")._html;

/* ---- helpers over the rendered artifact ---- */
const strip = h => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&amp;/g, "&")
  .replace(/&hellip;/g, "…").replace(/&larr;/g, "<-").replace(/&mdash;/g, "—")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
function pages(html){
  const out = [];
  const re = /<section class="pub-page">/g;
  let m;
  while((m = re.exec(html))){
    const start = m.index;
    re.lastIndex = start + 1;
    const next = html.indexOf('<section class="pub-page">', start + 1);
    out.push(html.slice(start, next < 0 ? html.length : next));
  }
  return out;
}
function block(html, cls){
  const at = html.indexOf(`class="${cls}"`);
  if(at < 0) return "";
  const open = html.lastIndexOf("<", at);
  /* good enough for a flat block: to the next sibling of the same class or to
     the end of the enclosing section */
  const rest = html.slice(open + 1);
  const end = rest.indexOf(`class="${cls}"`);
  return end < 0 ? rest : rest.slice(0, end);
}
/* THE KEPT SET AND THE DROPPED SET, READ APART. A dropped leg is NAMED — that
   is the rule — so "the id appears on the page" is true either way and measures
   nothing. Negative control (a) found exactly that on this suite's first
   version: three assertions about qualifiers surviving stayed GREEN while the
   determining leg was being filtered out, because it was still printed in the
   dropped list two inches lower. */
const keptIds = html => [...String(html).matchAll(/data-kept="1" data-leg="([^"]+)"/g)].map(m => m[1]);
const droppedIds = html => [...String(html).matchAll(/data-dropped="1" data-leg="([^"]+)"/g)].map(m => m[1]);
function gradeMarks(html){
  return [...String(html).matchAll(/<span class="pub-grade"([^>]*)>([\s\S]*?)<\/span>/g)]
    .map(m => ({ attrs:m[1], text:strip(m[2]) }));
}

console.log("\n--- publishedcase (UI-18) ---");

/* ============ 1. THE INDEX, over editions, with BOTH strengths ============ */
await ctx.__pubList();
const idx = list();
ok("the index answers a caller holding NO credential of any kind", idx.length > 0 && !/Loading/.test(idx));
ok("it enumerates EDITIONS and not cases — edition 1 and edition 2 are two rows",
   (idx.match(/edition 1/g) || []).length >= 1 && /edition 2/.test(idx));
ok("every case row carries BOTH strengths, never one",
   /data-axis="capture"/.test(idx) && /data-axis="connection"/.test(idx));
{
  const rows = idx.split('<div class="pf"').slice(1);
  ok("the index has one row per published edition, the non-case bundle included", rows.length === 4);
  const caseRows = rows.filter(r => /data-axis=/.test(r));
  ok("every row that shows a strength at all shows BOTH axes — never one letter in the place a reader quotes",
     caseRows.length === 3 && caseRows.every(r => /data-axis="capture"/.test(r) && /data-axis="connection"/.test(r)));
  ok("a published bundle that is NOT a case says it carries no frozen pair rather than showing a blank one",
     /carries no frozen strength pair/.test(rows[3]) && !/data-axis=/.test(rows[3]));
  ok("the superseded edition SAYS it is superseded, and says the pair on that row is its own",
     /superseded by edition 2/.test(rows[0]) && /this row's pair is edition 1's own/.test(rows[0]));
  ok("the newest edition says so", /newest edition/.test(rows[1]));
  ok("the declared bar rides the index row too, and an absent one says none was declared",
     /bar: none declared/.test(rows[0]) && /bar: Documents B/.test(rows[2]));
  ok("titles and dates are on the row", /Was the sewer transfer authorised\?/.test(rows[0]) && /2026-07-01/.test(rows[0]));
}
ok("the index went to op=publishedmanifest and to nothing else",
   WIRE.length === 1 && WIRE[0].op === "publishedmanifest");
/* THE INDEX ROW'S PAIR CAME OUT OF THE MANIFEST COLUMN, WHICH IS A JSON STRING.
   `publishedManifest()` returns the row unparsed; a surface that assumed an
   object would render "no frozen strength pair" for every real case while every
   mock that handed it an object stayed green. */
ok("the pair is parsed out of the manifest COLUMN, which the plane hands over as a string",
   typeof MANIFEST_ROWS[0].manifest === "string" && /Documents D/.test(idx) && /Links C/.test(idx));

/* ============ 2. THE CASE, at the default pair of floors — none/none ============ */
await ctx.__pubOpen(CASE);
let page = pubBody();
ok("a bundle id alone answers with the LATEST edition (DEC-12)", /edition 2 of 2/i.test(strip(page)));
ok("the case renders its title and its conclusion of record",
   /Was the sewer transfer authorised\?/.test(page) && /The transfer rests on a memo nobody adopted\./.test(page));
ok("the falsifier is on the page", /What would overturn this/.test(page) && /An adopted resolution naming the transfer/.test(page));
ok("no request this surface made carried a credential", WIRE.every(w => !w.token));

/* ---- DEC-34: the per-page header on EVERY page-shaped artifact ---- */
{
  const ps = pages(page);
  ok("the case is assembled out of page-shaped artifacts", ps.length === 5);
  const stamps = (page.match(/data-dec34="1"/g) || []).length;
  ok("every page carries a DEC-34 header, and no page carries two", stamps === ps.length);
  const missing = [];
  for(const p of ps){
    const h = strip(p.slice(0, p.indexOf("</div>") + 6));
    const facts = [CASE, "Edition 2", "vera", "Declared bias", "Floors", "sha256:" + SHA2, "op=verify"];
    /* the verification pointer is `op=publishedbytes&sha256=…`; the word the
       header prints beside it is the honest claim, checked separately */
    const need = [CASE, "Edition 2", "vera", "Declared bias", "Floors", SHA2, "publishedbytes"];
    if(!need.every(f => h.includes(f))) missing.push(h.slice(0, 120));
    void facts;
  }
  ok("and every one of those headers carries case id, edition, authors, declared bias, both floors, hash and a verification pointer",
     missing.length === 0);
  ok("the header states the protection honestly: tamper-EVIDENT, never tamper-proof",
     /tamper-EVIDENT, never tamper-proof/.test(page));
  ok("declared bias is a real answer either way — this case declares one hunch and says so",
     /1 declared hunch/.test(page) && /INFO-2026-8004/.test(page));
}

/* ---- the in-band block: DEC-31's bound rule, and it is TEXT ---- */
{
  const at = page.indexOf('class="pub-inband"');
  ok("the in-band block exists", at > 0);
  const inband = page.slice(at, page.indexOf("</div>", page.indexOf('class="bound"')));
  const t = strip(inband);
  /* CORRECTED 2026-08-04 (UI-27, DEC-40), never exempted. This assertion read
     `/Rendered for: Reading the whole case/` — the label of one of the four
     named stances. DEC-40 removed the set: the default rendering is not a
     stance called "whole", it is the ABSENCE of a filter, and what the block
     must name is which of the two this rendering IS. */
  ok("it says WHAT THIS RENDERING IS — the whole case, unfiltered — rather than naming a stance",
     /THE WHOLE CASE, UNFILTERED/.test(t) && /No floors were applied/.test(t));
  ok("it names BOTH floors, and the `none` floor renders EXPLICITLY rather than being left unsaid",
     /Floor applied to Documents[^:]*: none/.test(t) && /Floor applied to Links[^:]*: none/.test(t));
  ok("it says the two floors are independent and neither is a default for the other",
     /Neither is a default for the other/.test(t));
  ok("DEC-31's bound rule is in-band: hash, date, author and both floors",
     t.includes(SHA2) && t.includes("2026-07-20") && t.includes("vera")
     && /Floors: Documents none, Links none/.test(t));
  ok("the exclusions travel in-band too, because files get forwarded",
     t.includes(STMT2) || t.includes("does not cover"));
  /* SURVIVES THE COPIED SELECTION. Every fact above was read out of the block
     with the tags STRIPPED — none of it is a tooltip, an attribute or generated
     content, so a reader who selects this page and pastes it elsewhere takes
     the threshold and the bound facts with them. */
  ok("and every one of those facts survives the tags being stripped — this block is TEXT, not CSS",
     t.includes(CASE) && t.includes(SHA2) && t.includes("none"));
  ok("the in-band block prints FIRST: nothing of the case body precedes it",
     at < page.indexOf("<h1>") && at < page.indexOf("The conclusion"));
}

/* ---- the supersession banner, and WHICH number it shows (REC-17) ---- */
{
  ok("on the newest edition the banner says so and names the pair as this edition's own",
     /data-super="latest"/.test(page) && /edition 2's own frozen pair/.test(strip(page)));
  ok("the banner came from published_bundles and the frozen bytes — op=reevaluations is member-class and is never asked",
     WIRE.every(w => w.op !== "reevaluations"));
}

/* ---- both strengths, the declared bar, and no composed letter ---- */
{
  const marks = gradeMarks(page);
  ok("every strength mark on the page names the axis it belongs to",
     marks.length > 0 && marks.every(m => /data-axis="(capture|connection)"/.test(m.attrs)));
  ok("and names it in its own TEXT as well as in an attribute nobody can read",
     marks.every(m => /^(Documents|Links)\b/.test(m.text)));
  ok("mark count and axis count agree — no mark is drawn without an axis",
     marks.length === (page.match(/data-axis="/g) || []).length);
  const strengthSec = page.slice(page.indexOf("How strong this is"), page.indexOf("What it rests on"));
  ok("the strength section shows BOTH axes and never a single composed value",
     /data-axis="capture"/.test(strengthSec) && /data-axis="connection"/.test(strengthSec));
  ok("the two frozen letters are the plane's own, unmodified",
     /Documents D/.test(strengthSec) && /Links C/.test(strengthSec));
  ok("no composition word appears anywhere on the page",
     !/overall strength|combined strength|average grade|composite|case grade|grade of the case/i.test(strip(page)));
  /* DEC-17 as amended, the ABSENT branch. */
  /* BESIDE, and it is a position and not a wish: the bar sits AFTER the pair of
     frozen marks and BEFORE the per-axis panels, so a reader meets the standard
     the case was held to in the same glance as the strength it reached. */
  ok("the declared bar renders BESIDE the strength reached, prominently",
     strengthSec.indexOf('data-axis="connection"') < strengthSec.indexOf('class="pub-bar"')
     && strengthSec.indexOf('class="pub-bar"') > 0
     && strengthSec.indexOf('class="pub-bar"') < strengthSec.indexOf("<h3"));
  ok("an ABSENT bar renders as ABSENT — never as zero, and never as a dash",
     /data-bar="absent"/.test(strengthSec) && /NONE WAS DECLARED/.test(strip(strengthSec))
     && /An absent bar is not a bar of zero/.test(strip(strengthSec)));
}

/* ---- the SERVE / NAME split, drawn as two different things ---- */
{
  const rests = page.slice(page.indexOf("What it rests on"), page.indexOf("What would overturn this"));
  ok("a leg the surface can SERVE carries an address and a hash",
     /can SERVE it/.test(strip(rests)) && rests.includes(DOC_SHA));
  ok("a leg it can only NAME says so, and offers no address and no hash for it",
     /can only NAME it/.test(strip(rests)) && /There is no address and no hash to offer for it here/.test(strip(rests)));
  ok("the served leg carries the pair frozen into the EDITION IT NAMES, not the newest one",
     /the pair above is the pair frozen into the EDITION THIS LEG NAMES/i.test(strip(rests)));
  const named = rests.slice(rests.indexOf(L_CAP_D));
  ok("a NAMED leg's id is not a link into anything", !new RegExp(`onclick[^>]*${L_CAP_D}`).test(rests));
}

/* ============ 3. DEC-40: THE READER SUPPLIES THE FLOORS ============
   CORRECTED WHOLESALE 2026-08-04 (UI-27), never exempted. This block asserted
   Q6's NAMED STANCE SET — that every stance resolved to a complete pair, that
   one carried a different floor on each axis, and that no label named WHO the
   reader is. Bob refused the question that produced the set (DEC-40): *"What's
   a stance? A published case is in the wild for anybody to use for whatever
   purpose they wish."* A named set claims to enumerate purposes we cannot know,
   so the assertions that policed the LABELS are replaced by assertions that the
   set is GONE and that the pair is the reader's own. Q6's FORM is unaffected
   and is still asserted below: a complete pair or no rendering at all. */
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  ok("the named stance set and its resolver are GONE from the surface — not disabled, not unused, gone",
     !/\bTHRESHOLDS\b/.test(src) && !/\bstanceFloors\b/.test(src) && !/function stanceOf\b/.test(src)
     && !/function pubStance\b/.test(src));
  ok("and not one of the four published stance labels survives anywhere in the file",
     !/Reading the whole case/.test(src) && !/Citing this in a filing/.test(src)
     && !/Checking this against records you already hold/.test(src)
     && !/Quoting this in something you publish/.test(src));
  /* THE DEFAULT IS THE WHOLE CASE, and it is none/none rather than a preset
     named "whole" — determination 1: the case renders whole, always. */
  ok("the surface's default pair of floors is none/none, which is the case itself",
     ctx.__PUB.floors.capture === "none" && ctx.__PUB.floors.connection === "none"
     && ctx.__pubFiltered(ctx.__readerFloors(ctx.__PUB.floors)) === false);
  ok("the reader is offered the grade vocabulary and `none`, and no combination of them is preset",
     JSON.stringify(ctx.__FLOOR_VALUES) === JSON.stringify(["A","B","C","D","none"]));
  /* Q6's SURVIVING FORM. A pair is two independently supplied values; half a
     pair resolves to NOTHING rather than to a default, because an axis left
     unconstrained admits arbitrary weakness without saying so. */
  ok("a reader's pair resolves only when BOTH axes carry a value the surface knows",
     JSON.stringify(ctx.__readerFloors({ capture:"B", connection:"none" })) === JSON.stringify({ capture:"B", connection:"none" })
     && ctx.__readerFloors({ capture:"B" }) === null
     && ctx.__readerFloors({ capture:"B", connection:"Z" }) === null
     && ctx.__readerFloors(null) === null);
  /* AND IT IS DRIVEN, not merely resolved: a half pair draws NO case, which is
     the behaviour the old suite reached by deleting an axis from a stance's
     `floors` (its arm (e)). The seam moved; the refusal did not. */
  await ctx.__setFloors("B", undefined);
  {
    const half = strip(pubBody());
    ok("a half pair draws NO case at all — the legs, the strengths and the basis are all absent",
       /This rendering was not drawn/.test(half) && !/How strong this is/.test(half)
       && !/What it rests on/.test(half));
  }
  await ctx.__setFloors("none", "none");
  /* ONE VALUE ON BOTH AXES IS R2's FORBIDDEN COMPOSITION PERFORMED BY
     ARITHMETIC, so there is no control that writes both. Each setter names its
     axis and touches only it. */
  const before = { ...ctx.__PUB.floors };
  ctx.__pubSetFloor("capture", "B");
  ok("setting one axis's floor leaves the other exactly where the reader left it",
     ctx.__PUB.floors.capture === "B" && ctx.__PUB.floors.connection === before.connection);
  ctx.__pubSetFloor("capture", "Z"); ctx.__pubSetFloor("nonsense", "A");
  ok("a value or an axis the surface does not know is not written at all",
     ctx.__PUB.floors.capture === "B" && ctx.__PUB.floors.nonsense === undefined);
  await ctx.__setFloors("none", "none");
}

/* ---- the qualifier rule: a determining leg is never dropped ----
   UNCHANGED BY DEC-40 (c) and asserted at reader-supplied floors instead of at
   a stance's. The floor pairs below are the ones the four stances used to
   resolve to, so the protection is measured over exactly the same arithmetic. */
await ctx.__setFloors("none", "B");             // capture none, connection B
page = pubBody();
{
  const t = strip(page);
  ok("a pair with a `none` floor on one axis and a real floor on the other renders BOTH, explicitly",
     /Floor applied to Documents[^:]*: none/.test(t) && /Floor applied to Links[^:]*: grade B or stronger/.test(t));
  ok("the leg that DETERMINED the connection strength survives a floor it does not meet",
     keptIds(page).includes(L_CON_C) && !droppedIds(page).includes(L_CON_C)
     && /Always present at every threshold/.test(t));
  ok("and the page says WHY it survives, in the record's own terms",
     /it determined this case's links strength/.test(t));
  ok("a rendering may drop a claim and may never drop a qualifier — stated on the artifact",
     /A rendering may drop a claim; it may never drop a qualifier/.test(t));
}

await ctx.__setFloors("B", "none");             // capture B, connection none
page = pubBody();
{
  const t = strip(page);
  ok("the floors the reader set are B on one axis and none on the other, both named",
     /Floor applied to Documents[^:]*: grade B or stronger/.test(t) && /Floor applied to Links[^:]*: none/.test(t));
  ok("the leg that DETERMINED the capture strength survives although it is graded D",
     keptIds(page).includes(L_CAP_D) && !droppedIds(page).includes(L_CAP_D));
  ok("and the leg that determined nothing and does not meet the floor IS dropped — the threshold does something",
     droppedIds(page).includes(L_CAP_C) && !keptIds(page).includes(L_CAP_C));
  ok("a cuts_against leg dropped by this threshold is CALLED OUT BY NAME",
     /data-cutsdropped="1"/.test(page) && new RegExp(L_CAP_C).test(page.slice(page.indexOf('data-cutsdropped'))));
  ok("and the page says why naming it matters rather than merely listing it",
     /reading a case with the evidence against it filtered out and no notice of it/i.test(t));
  ok("every dropped leg is named with its reason, never silently removed",
     /dropped by this threshold — named, with the reason/.test(t));
}

await ctx.__setFloors("A", "A");                // A / A
page = pubBody();
{
  const t = strip(page);
  ok("the strictest pair a reader can set names grade A on BOTH axes", (t.match(/grade A or stronger/g) || []).length >= 2);
  ok("both determining legs still stand at the strictest pair — in the KEPT set, not merely named in the dropped one",
     keptIds(page).includes(L_CAP_D) && keptIds(page).includes(L_CON_C)
     && !droppedIds(page).includes(L_CAP_D) && !droppedIds(page).includes(L_CON_C));
  ok("and the strictest pair did drop what it should: the B-graded capture leg and the C-graded cuts_against one",
     droppedIds(page).includes(L_CAP_B) && droppedIds(page).includes(L_CAP_C));
  ok("the frozen pair is unchanged by the threshold — a rendering filters legs and never re-grades a case",
     /Documents D/.test(t) && /Links C/.test(t));
}
await ctx.__setFloors("none", "none");

/* ============ 3b. DEC-40 (b): THE FILTER, IN THE HEADER AND IN PRINT ============
   NEW 2026-08-04 (UI-27) and it is the half of the ruling the old suite could
   not have: *"a filtered rendering that looks like the case IS that claim,
   manufactured by us and handed over pre-made."* So the filter is asserted in
   EVERY place a page can be taken away from this screen — the per-page header,
   the in-band block, the footer that prints beside the rendering hash — and in
   BOTH directions, because an unfiltered rendering that said nothing would make
   absence of the line the ambiguity. */
const filterMarks = html => [...String(html).matchAll(/data-filter="([a-z]+)"/g)].map(m => m[1]);
{
  /* --- the UNFILTERED rendering SAYS it is unfiltered --- */
  await ctx.__pubOpen(CASE);
  await ctx.__setFloors("none", "none");
  page = pubBody();
  const ps = pages(page);
  const marks = filterMarks(page);
  ok("an unfiltered rendering carries the line on every page, in the in-band block and in the footer",
     marks.length === ps.length + 2 && marks.every(m => m === "none"));
  ok("and it SAYS it is unfiltered, in words a reader keeps when they paste the page",
     /THE WHOLE CASE, UNFILTERED/.test(strip(page)) && /No floors were applied/.test(strip(page)));
  ok("an unfiltered rendering does not warn about a filter it did not perform",
     !/data-notthecase="1"/.test(page) && !/FILTERED VIEW/.test(strip(page)));
  /* EVERY PAGE, not merely the first: a forwarded PDF is a stack of pages and a
     reader may only ever hold one of them. */
  ok("every page of it carries the line inside its own DEC-34 header",
     ps.every(p => /data-dec34="1"[\s\S]*data-filter="none"/.test(p)));

  /* --- the FILTERED rendering carries the filter, everywhere --- */
  await ctx.__setFloors("B", "none");
  page = pubBody();
  const fps = pages(page);
  const fmarks = filterMarks(page);
  const ft = strip(page);
  ok("a filtered rendering carries the filter line on every page, in-band and in the footer",
     fmarks.length === fps.length + 2 && fmarks.every(m => m === "reader"));
  ok("every page of it carries the filter inside its own DEC-34 header, beside the id and the hash",
     fps.every(p => /data-dec34="1"[\s\S]*data-filter="reader"/.test(p))
     && fps.every(p => strip(p).includes(CASE) && strip(p).includes(SHA2)));
  ok("the line names BOTH floors the reader applied, so the filter travels with the page",
     /Documents: grade B or stronger/.test(ft) && /Links: none/.test(ft));
  /* DETERMINATION 2, and it is the one a build session would miss: what comes
     back is A VIEW THAT READER CONSTRUCTED, labelled as such, and never "the
     case at threshold X". */
  ok("it is named as a view the READER constructed and explicitly NOT the case",
     /A FILTERED VIEW YOU CONSTRUCTED — not the case/.test(ft)
     && /data-notthecase="1"/.test(page)
     && /Do not quote it as the case, print it as the case, or describe it by its hash as the case/.test(ft));
  ok("and the whole case is named as still being at the same address",
     /the case is at this same address with no floors applied/.test(ft));
  /* HASH-DESCRIBED. The footer prints a rendering sha256 a reader will quote;
     the sentence that describes it must not describe it as the case. */
  const footer = page.slice(page.indexOf('data-footer="1"'));
  ok("the footer's rendering hash is described as a filtered view and never as the case",
     /rendering sha256:[0-9a-f]{64}/.test(strip(footer))
     && /data-filter="reader"/.test(footer)
     && /A FILTERED VIEW YOU CONSTRUCTED/.test(strip(footer)));
  /* THE LINE IS TEXT. Every assertion above was made over STRIPPED markup, so
     none of it is an attribute, a tooltip or generated content — a reader who
     selects and pastes takes the filter with them. */
  ok("every word of the filter statement survives the tags being stripped — it is TEXT, not CSS",
     ft.includes("A FILTERED VIEW YOU CONSTRUCTED") && ft.includes("grade B or stronger"));
  await ctx.__setFloors("none", "none");
}

/* ============ 4. THE DIVIDED CHILD, AND THE UNRATED AXIS ============ */
await ctx.__pubOpen(OTHER);
page = pubBody();
{
  const t = strip(page);
  ok("a published child NAMES its parent", /data-division="named"/.test(page) && t.includes(PARENT));
  ok("and NAMES its siblings", t.includes(SIBLING));
  ok("and serves NEITHER — no title, no state, no hash, no address",
     /can hand over nothing of them: no title, no state, no hash, no address/.test(t)
     && !new RegExp(`onclick[^>]*${PARENT}`).test(page));
  ok("the reason is the record's own: knowing the other half exists is the disclosure",
     /a reader who can see one half of a divided question is entitled to know the other half exists/.test(t));
  /* DEC-18 / D-160: the boundary case, and the WORD. */
  ok("an axis with nothing established reads UNRATED, its own frozen fact",
     /data-axis="connection">Links UNRATED/.test(page));
  ok("UNRATED is stated as neither a low score nor a failure",
     /UNRATED is not a low score and not a failure/.test(t));
  ok("the retired word for the boundary case appears nowhere on the rendered page",
     !/susp/i.test(t));
  /* DEC-17, the DECLARED branch. */
  ok("a DECLARED bar renders beside the strength reached, with both axes named",
     /data-bar="declared"/.test(page) && /Documents B/.test(t) && /Links C/.test(t));
  ok("the declared bar states it was set in advance and not by who is reading",
     /set in advance/.test(t));
  ok("this case has one edition only and the banner says it is the newest",
     /data-super="latest"/.test(page));
}
/* an axis that is not graded satisfies only `none` */
await ctx.__setFloors("A", "A");                // A / A — the UNRATED axis cannot meet A
page = pubBody();
{
  const t = strip(page);
  ok("an axis that is not graded satisfies a floor of none and no other, and the page SAYS it does not meet the floor",
     /data-axisfail="connection"/.test(page)
     && /An axis that is not graded satisfies a floor of none and no other floor/.test(t));
  ok("nothing is hidden because of it — the legs that left the axis UNRATED are qualifiers and are KEPT",
     keptIds(page).includes("INFO-2026-8202") && !droppedIds(page).includes("INFO-2026-8202")
     && /Always present at every threshold/.test(t));
}
await ctx.__setFloors("none", "none");

/* ============ 5. EDITIONS: the prior one is still readable ============ */
await ctx.__pubOpen(CASE, 1);
page = pubBody();
{
  const t = strip(page);
  ok("a prior edition is readable by number", /edition 1 of 2/i.test(t));
  ok("and it says what IT said, not what the current document says", t.includes(STMT1));
  ok("the supersession banner fires, and it says which number the page shows",
     /data-super="superseded"/.test(page)
     && /The two strengths on this page are edition 1's OWN FROZEN PAIR/.test(t)
     && /They are not edition 2's, and nothing here has been recomputed on your behalf/.test(t));
  ok("it says the older edition has not been withdrawn and still answers",
     /has not been withdrawn and still answers/.test(t));
  ok("every edition is reachable from the page, each with its own sha", t.includes(SHA1) && t.includes(SHA2));
  ok("the DEC-34 header on this edition's pages names EDITION 1, not the latest",
     pages(page).every(p => strip(p).includes("Edition 1 of 2")));
}

/* ============ 6. THE VERIFY BUTTON, ON op=verify ============ */
{
  const before = WIRE.length;
  const v = await ctx.__pubVerify(SHA1, "#v-case");
  const asked = WIRE.slice(before);
  ok("the Verify control reaches op=verify and nothing else",
     asked.length === 1 && asked[0].op === "verify" && asked[0].url.includes(SHA1));
  ok("it asked with NO credential", !asked[0].token);
  ok("it answered from the record and the answer is the record's", v && v.published === true);
  const out = strip(els.get("#v-case")._html);
  ok("and the surface renders the record's answer, naming the part and the bundle",
     /PUBLISHED\./.test(out) && /bundle\.md/.test(out) && out.includes(CASE));
  const never = "9".repeat(64);
  await ctx.__pubVerify(never, "#v-case");
  const out2 = strip(els.get("#v-case")._html);
  ok("a hash the record does not answer for is reported as NOT PUBLISHED, in the plane's own terms",
     /NOT PUBLISHED\./.test(out2) && /never ratified and a hash that never existed are the same answer/.test(out2));
}

/* ============ 7. THE BYTES, by hash and only by hash, with no credential ============ */
{
  await ctx.__pubOpen(CASE);
  page = pubBody();
  const addr = /data-addr="([^"]+)"/.exec(page);
  ok("the page publishes the byte ADDRESS of what it can serve", !!addr && /op=publishedbytes/.test(addr[1]));
  const url = "/api/?" + addr[1].replace(/&amp;/g, "&");
  const before = WIRE.length;
  const r = await ctx.fetch(url);
  const got = new Uint8Array(await r.arrayBuffer());
  ok("and those bytes answer a caller holding NOTHING",
     r.status === 200 && got.length === BYTES.length && !WIRE[before].token);
  ok("the address carries a sha256 and no path — there is nothing to walk",
     /sha256=[0-9a-f]{64}/.test(addr[1]) && !/path=/.test(addr[1]));
  ctx.__pubBytes(SHA1);
  ok("opening a part goes to op=publishedbytes by hash, untokened",
     OPENED.length === 1 && OPENED[0].includes("op=publishedbytes") && OPENED[0].includes(SHA1)
     && !/token=/.test(OPENED[0]));
  const bad = await ctx.fetch("/api/?op=publishedbytes&path=bundle.md&id=" + CASE);
  const badj = await bad.json();
  ok("asking by path is refused by the plane, and this surface never offers one",
     /never by path/.test(badj.error || "") && !/op=publishedbytes[^"]*path=/.test(page));
}

/* ============ 8. THE ADDRESS IS REAL ============ */
{
  HASH = "#case/" + CASE + "/e1";
  const routed = ctx.__publishedRouteFromHash();
  await new Promise(r => setTimeout(r, 0));
  ok("`#case/<id>/e<N>` is an address the router resolves", routed === true);
  HASH = "#published";
  ok("`#published` is an address too", ctx.__publishedRouteFromHash() === true);
  HASH = "#inquiry/INQ-2026-9999";
  ok("and a working-record address is NOT claimed by this router", ctx.__publishedRouteFromHash() === false);
  HASH = "";
  await ctx.__pubOpen(CASE);
  ok("opening a case WRITES its address, so a reader can hand the page to somebody holding nothing",
     HASH === "#case/" + CASE);
  /* THE DEAD END BUILD-ORDER NAMED. The way back exists only when a credential
     is actually held, and it does not reload — the session lives in memory and
     a reload is what used to cost it. */
  ctx.__pubPaintBack();
  ok("a caller holding nothing is offered no way back into a working record they cannot reach",
     els.get("#p-back")._html === "");
  ctx.__PLANE.token = "t";
  ctx.__pubPaintBack();
  ok("a member holding a credential IS offered the way back, and it is not a reload",
     /pubLeave\(\)/.test(els.get("#p-back")._html));
  ctx.__PLANE.token = null;
}

/* ============ 9. NOT PUBLISHED, and the four forbidden affordances ============ */
{
  await ctx.__pubOpen("INQ-2026-0000-nothing");
  const t = strip(pubBody());
  ok("a case that was never published answers in the plane's own words, and invents nothing",
     /Not published/.test(t) && /never published/.test(t));
}
await ctx.__pubOpen(CASE);
const surface = pubBody() + list() + (() => { ctx.__pubVerifyPanel(); return pubBody(); })();
{
  ok("H7 — there is no reply box for a subject anywhere on the published surface",
     !/<textarea/i.test(surface) && !/\breply\b/i.test(strip(surface)));
  ok("H2 — there is no notify-me, no subscribe, no follow",
     !/notify|subscribe|follow this|email me|alert me/i.test(strip(surface)));
  ok("H3 — there is no verified-author badge; the key and the signature are printed instead",
     !/verified author|verified by|trusted author|\bbadge\b/i.test(strip(surface))
     && /Signing key/.test(pubBody().length ? surface : surface));
  ok("H1 — there is no redact and no take-down control",
     !/redact|take ?down|remove this|unpublish|delete this/i.test(strip(surface)));
  /* CORRECTED 2026-08-04 (UI-27, DEC-40), never exempted and never loosened.
     The clause was "the surface takes no input of any kind — it is a read",
     which was true when the only control was a four-button stance strip. DEC-40
     gives the READER the floors, so there are now two controls that take a
     value from them. What must still hold is the thing the clause was
     protecting: nothing the reader types or picks is sent anywhere, and no
     text field exists for them to write INTO the record. Both halves are
     asserted, and the wire sweep in block 11 is the evidence for the first. */
  ok("there is no text field and nothing to write into the record — the two floor controls are the only ones",
     !/<input/i.test(surface) && !/<textarea/i.test(surface)
     && (surface.match(/<select/g) || []).length === 2
     && /data-floor="capture"/.test(surface) && /data-floor="connection"/.test(surface));
  {
    const before = WIRE.length;
    ctx.__pubSetFloor("capture", "B");
    ctx.__pubSetFloor("capture", "none");
    ok("and setting a floor sends NOTHING: the reader's bar is applied here and is never a request",
       WIRE.length === before);
  }
}

/* ============ 10. THE PRINT STYLESHEET: it may only ADD ============ */
{
  const html = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const at = html.indexOf("@media print{");
  ok("app.html carries a print stylesheet at all", at > 0);
  let depth = 0, end = at;
  for(let i = html.indexOf("{", at); i < html.length; i++){
    if(html[i] === "{") depth++;
    else if(html[i] === "}"){ depth--; if(depth === 0){ end = i + 1; break; } }
  }
  const print = html.slice(at, end);
  /* THE NEGATIVE CONTROL'S SUBJECT. No list of protected selectors: NOTHING may
     be hidden in print, because the moment a stylesheet is allowed to hide one
     thing the argument for hiding the next one is already written. */
  ok("the print stylesheet hides NOTHING — no display:none, no visibility:hidden, no zero-height trick",
     !/display\s*:\s*none/i.test(print) && !/visibility\s*:\s*hidden/i.test(print)
     && !/font-size\s*:\s*0/i.test(print));
  ok("the in-band block prints at FULL body size and is not shrunk by the stylesheet",
     /\.pub-inband\{[^}]*font-size:var\(--t-pub-body\)/.test(print));
  ok("every collapsed leg is expanded for print, and the expansion only ever OPENS",
     /pubExpandForPrint/.test(html) && /d\.open = true/.test(html) && !/d\.open = false/.test(html));
  ok("a beforeprint handler is actually registered, in the loop the browser runs",
     Array.isArray(LISTENERS.beforeprint) && LISTENERS.beforeprint.length === 1);
  ok("links become their full address and their sha in mono, ADDED rather than substituted",
     /a\[data-addr\]\[data-sha\]::after/.test(print) && /font-family:var\(--font-fact\)/.test(print));
  ok("pages break on the page-shaped artifacts, so a printed page is a page",
     /\.pub-page\{[^}]*break-before:page/.test(print));
  ok("the per-page footer is fixed, which is what makes it per-PAGE", /\.print-footer\{[^}]*position:fixed/.test(print));
}
/* the footer's four facts, on the artifact and not only in the stylesheet */
{
  await ctx.__pubOpen(CASE, 1);
  const t = strip(pubBody());
  ok("the footer carries case id, case sha, rendering sha and the date",
     /data-footer="1"/.test(pubBody()) && t.includes(CASE) && t.includes(SHA1)
     && /rendering sha256:[0-9a-f]{64}/.test(t) && t.includes("2026-07-01"));
  ok("the rendering sha is a real digest over the rendering's own decision, not a placeholder",
     /rendering sha256:[0-9a-f]{64}/.test(t) && !/rendering sha256:not computed/.test(t));
  const s1 = /rendering sha256:([0-9a-f]{64})/.exec(t)[1];
  await ctx.__setFloors("A", "A");
  const s2 = /rendering sha256:([0-9a-f]{64})/.exec(strip(pubBody()))[1];
  ok("and it MOVES when the floors move — two renderings of one edition are two renderings", s1 !== s2);
  await ctx.__setFloors("none", "none");
}

/* ============ 11. THE WIRE ============ */
{
  const ops = [...new Set(WIRE.map(w => w.op))].sort();
  ok("the whole surface reached exactly the four credential-free ops and no other",
     JSON.stringify(ops) === JSON.stringify(["publishedbytes", "publishedcase", "publishedmanifest", "verify"]));
  ok("NOT ONE request carried a token — the evidence, not the promise",
     WIRE.length > 10 && WIRE.every(w => !w.token));
  ok("and none of them reached a working-record op",
     WIRE.every(w => !["list","search","projection","image","whoami","affordances","reevaluations"].includes(w.op)));
}

console.log(`publishedcase: ${n - fails.length}/${n} assertions`);
if(fails.length){ console.error(`publishedcase: ${fails.length} FAILED`); process.exit(1); }
