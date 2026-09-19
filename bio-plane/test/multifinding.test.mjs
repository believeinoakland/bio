/* NEGATIVE CONTROL: (TEN ARMS. REC-44's four (a)-(d), REC-49's five (i-a), (i-b), (ii-a), (ii-b), (ii-b'), and REC-47's one (g). **The suite is 70 assertions whole** (58 -> 70; the +12 is REC-47's — the case-altitude arms, the two-rules-side-by-side pair, the container's own copy, and the ISOLATED divergence adversary described at (g)). REC-44's and REC-49's nine were NOT re-run 2026-08-05 by rec47-agent and their counts below are AT THE SIZE THEY WERE MEASURED AT (58); they are re-runnable in one step. REC-47's (g) was RUN 2026-08-05 against THIS file, and it CHANGED THE SUITE rather than merely confirming it — see the arm.  ==== REC-47's ONE, RUN 2026-08-05 ====  (g) THE DIVERGENCE CHECK DOES NOT READ THE ACKNOWLEDGEMENT — in src/store.mjs publish() drop the `|| (cRow.bias_acknowledgement ?? null) !== cBias` clause from the CASE_ASSERTION_DIVERGED condition, leaving the scope and completeness clauses standing -> **66 pass, 4 FAIL**. THE ARM IS RECORDED IN TWO STAGES BECAUSE THE FIRST STAGE FOUND AN INSTRUMENT DEFECT, which is the whole reason it is worth reading. FIRST RUN, against block 2b's adversary 3 alone (FIND_C forcing its way into the case): 65 pass, 2 FAIL — the clause was proved LOAD-BEARING, but the refusal reported CASE_MEMBERSHIP_DIVERGED, i.e. the arm FAILED NAMING THE WRONG RULE. That adversary structurally CANNOT isolate the acknowledgement: FIND_C is not in the declared roster, so its bytes must name a roster containing itself, and the membership rule fires whether or not anything reads the bias. This is REC-16's recorded instrument defect arriving again, and it was corrected the same way — by building the adversary that isolates the boundary. SECOND STAGE, the adversary added to block 3: FIND_B is a LEGITIMATE member of the declared roster, edition 2's case row already exists (FIND_A ratified first), and its bytes are tampered in the acknowledgement AND NOWHERE ELSE — asserted at the site by comparing the two images with that one line removed from both. With the clause gone, that ratification reports `reason: null`: IT SUCCEEDS. Nothing else in the plane catches it, so whichever member ratified first would silently decide what the public record says the case's lens was. That is the arm the item needed and the first version did not have. NOTE the REC-44 control (c) lesson underneath it: every member of a case published through op=publish carries the same assertions BY CONSTRUCTION, so a divergence refusal can be deleted outright with the whole suite green unless an adversary drives op=promote's hand-written door. Restore after. Every file restored BYTE-IDENTICALLY, sha256 compared before and after and equal to: src/store.mjs 95332d64f73e115445eb77f73eae887ab1c24eddad7dbbf5b40019ecc4b32dab, src/index.mjs 5202ffcb3ea9f2034cc210495190e37533fdf97a10e3b1f89454a069924a86bd, checks/bio-checks.mjs a2be732cb76b5234e1b7d35beff46bacd4528cf3b6a94389e286afebeb082214.  ==== REC-44's FOUR AND REC-49's FIVE (2026-08-05 numbers at suite size 58) ====  The suite is 58 assertions whole. REC-44's four were ALL RE-RUN 2026-08-05 by rec49-agent against THIS file, so every count below agrees with the file it names rather than with the file it was written against; each one's FAIL count reproduced exactly except (c), which gained one and the gain is recorded on its own line. Each arm is broken ALONE and every file is restored BYTE-IDENTICALLY, sha256 compared before and after each arm and equal to: src/store.mjs 346985395796036fcdbd51004766e935221d6919bf26a0221583df23666ed12f, src/index.mjs 765333552f24a56a12529445affe113ca739236eb275cffb0d35a58ecaf2fffc, checks/bio-checks.mjs d8da7b9d51dd5634aabe9fa5a0861d07bf48c5b8b2998d80f28796851a9a659f (the (ii-b') arm also edits THIS file; no sha is quoted for it because a file cannot state its own, and it is restored byte-identically to whatever it was before that arm ran). The arms are scripted and re-runnable in one step; each is a single unique string replacement at the site quoted with it.) (a) THE SINGLE CASE-LEVEL STRENGTH -- THIS IS BOB'S OWN CONTROL, carried verbatim off DEC-44 onto REC-44: in src/store.mjs publishedCase() add `strength: state.findings[0].strength,` to the returned object -> 57 pass, 1 FAIL (RE-RUN 2026-08-05: 46 -> 57 pass with the FAIL count unchanged), in block 5, and the sweep NAMES all four surfaces it appeared on: publishedcase(by case id).strength, publishedcase(by finding id).strength, publishedcase(by edition).strength, publishedcase(by hash).strength. The composed letter it advertises is FIND_A's (capture B / connection C) while FIND_B froze (capture UNRATED / connection D) -- so the case would be presenting one of two different answers as though it were the case's, which is R2's forbidden composition arriving at case altitude. NOTE WHAT THIS MEASURED THAT REVIEW WOULD NOT: blocks 1-4 stay ENTIRELY GREEN under it, because a spurious case-level key breaks no per-finding assertion anywhere -- the surface goes on answering correctly and ADDITIONALLY answers wrongly. That is why the control is a STRUCTURAL SWEEP over whole responses rather than a value comparison, and why a value comparison would have passed. (b) THE SAME BUG IN THE EXPORT -- in src/index.mjs's case manifest add `strength: cs.findings[0].strength,` after `ratified_at:` -> 56 pass, 2 FAIL (RE-RUN 2026-08-05: 45 -> 56 pass, FAIL count unchanged): the sweep names manifest.strength and the four publishedcase(...).manifest.strength echoes, AND the separate container assertion fires, because the ZIP a stranger downloads then carries the composed claim inside the signed-hash artifact itself -- the worst place for it, since that copy travels without this instance. Two arms rather than one, deliberately: the read path and the exported container are two places a reader meets the claim and either can be broken alone. (c) THE MEMBERSHIP IS NOT CHECKED -- in src/store.mjs publish() guard the CASE_MEMBERSHIP_DIVERGED refusal with `if (false) &&` -> 55 pass, 3 FAIL in block 2b (RE-RUN 2026-08-05: 45 -> 55 pass and 2 -> 3 FAIL, and the THIRD is REC-49's and is worth keeping — block 6's fixture assertion counts the case editions, the rostered members and the ratified rows, so a member ratified into a case that never declared it now moves numbers a roster-shaped assertion cannot miss; the arm reaches one more instrument than it did): the member whose signed bytes name a roster of ONE is ratified into a case whose other members signed a roster of two, and the second adversary then reports EDITION_EXISTS -- a raw collision where a named refusal belongs. THIS ARM IS THE REASON BLOCK 2b EXISTS. The first version of this suite had no adversary at all and arm (c) measured 47 pass, 0 fail: every member of a case published by op=publish carries the same roster BY CONSTRUCTION, so both divergence refusals could have been deleted outright with the whole suite green. That is the inbox-grammar failure mode exactly (CLAUDE.md), found by running the control rather than by review. (d) C-21.1 AT THE WRONG ALTITUDE -- in checks/bio-checks.mjs checkCompletenessFreshness read `ctx.publishedRegistry` and `reg[ctx.fm.id]` again instead of the CASE registry, AND in src/store.mjs publishCase() guard the COMPLETENESS_CARRIED_FORWARD refusal with `if (false) &&` -> 54 pass, 4 FAIL in block 3 (RE-RUN 2026-08-05: 43 -> 54 pass, FAIL count unchanged): edition 2 of the case republishes edition 1's completeness statement BYTE FOR BYTE, both members move to published on it, and the case then answers edition 2 with edition 1's limits. Both halves must go together, as REC-13 found and REC-14 recorded: breaking one alone leaves the other refusing. Restore after each. ---- REC-49's five, RUN 2026-08-05 by rec49-agent. The item is the INDEX (op=publishedmanifest), and the two directions it can lie in need two instruments, exactly as REC-44's (a) and UI-29's (m)/(m2) needed two.  (i-a) THE INDEX UNDERSTATES A CASE THAT HAS A PAIR -- in src/store.mjs publishedManifest(), drop `, p.strength, p.required` from the published[] SELECT (leave the line `                p.gate_version`). RUN: 53 pass, 5 FAIL, and the sweep NAMES the understatement in both windows rather than reporting a shape mismatch: "publishedmanifest(awaiting) CASE-2026-0001@1 INQ-2026-4400-authorisation: RATIFIED member has NO frozen pair on the index -- the index UNDERSTATES a case that HAS one", and the same for both members of both complete editions. THIS IS THE ARM THE ITEM EXISTS FOR: a green battery did not catch REC-44's move because NO suite anywhere asserted that this op still answers a pair for a case that has one. Block 5 sweeps for a pair that must NOT be there and passes perfectly on an answer carrying no pairs at all -- the empty-body-digest shape. Block 5 and block 6 are complements and are useless apart.  (i-b) THE CONTAINER MANIFEST DROPPED OFF THE INDEX AGAIN -- in the same function, drop `, manifest` from the cases[] SELECT. RUN: 57 pass, 1 FAIL, naming the case editions whose container manifest went missing. It is a SEPARATE arm from (i-a) because after REC-49 the index has two independent pair-bearing surfaces -- the member's own ratified row and the case's container copy -- and either can be removed alone. Before REC-49 there was only the second, which is why the awaiting window showed nothing.  (ii-a) A CASE-LEVEL PAIR ON AN INDEX ROW -- DEC-44's own control, at the index. In the same function, map the cases[] rows to carry the FIRST member's `strength` as the case's. RUN: 57 pass, 1 FAIL in BLOCK 5, naming ["publishedmanifest.cases[0].strength","publishedmanifest.cases[1].strength"] -- while every block 6 assertion stays GREEN, because the index goes on answering every finding's pair correctly and ADDITIONALLY answers a composed one. REC-44's (a) and UI-29's (m) measured the same thing at their own altitudes.  (ii-b) THE SAME PAIR PLANTED INSIDE THE MANIFEST THE INDEX EMBEDS -- map the cases[] rows to re-stringify the manifest with `strength: <first member's>` added at its top level. RUN: 57 pass, 1 FAIL, naming ["publishedmanifest.cases[0].manifest.strength","publishedmanifest.cases[1].manifest.strength"].  (ii-b') THE SAME DEFECT WITH THE INSTRUMENT AS IT WAS BEFORE REC-49 -- (ii-b) again, plus `const expandIndex = (idx) => idx;` in this file. RUN: 57 pass, 1 FAIL -- AND BLOCK 5 IS SILENT. The one failure is block 6's manifest-PRESENCE assertion, which fires only because an unparsed manifest is a string. THAT IS THE FINDING: op=publishedmanifest hands its container manifest over as a JSON STRING, and a structural sweep that walks a response object stops dead at a string -- so the copy of the manifest a reader of the PUBLIC INDEX meets first was the one surface DEC-44's own control could not see inside. Measured, not supposed. The correction is `expandIndex`, and this arm is what earns it. */
/* NEGATIVE CONTROL (REC-58's four arms, added 2026-08-05 by rec58-agent; the suite is 74 assertions whole, 70 -> 74). These four assert that `case.opened` reaches NO caller on ANY op, driven through the wire because index.mjs answers the public read with a SPREAD. (1a) in src/store.mjs publishedCase()'s success return add `opened: state.opened,` before `completeness: state.completeness, ratified_at: state.ratified_at,` -> **73 pass, 1 FAIL**, naming the public read (alongside publishedcase.test.mjs at 77/1 and case-opened.test.mjs at 26/28, so THREE suites catch it independently). CORRECTED BEFORE LANDING: this line first claimed the suite stayed UNMOVED at 74, written from the two suites that had been run rather than from this one. Running it said otherwise — the fourth arm reads op=publishedcase's own answer, which is exactly what that arm restores. A count nobody re-ran is a claim, and this is the third time this item met that. (1b) in src/index.mjs add `opened: pub.case?.opened ?? null,` after `case: { edition: pub.case?.edition ?? null,` -> **73 pass, 1 FAIL**, naming the op=ratify case block on both the incomplete and the complete edition. THIS IS THE ARM THAT MATTERS: op=ratify is the surface REC-58's item believed was publishing the field. (1c) in src/index.mjs insert `...cs,` before the container manifest's `ratified_at: cs.ratified_at,` -> **73 pass, 1 FAIL**, naming the public read and the container together — and NOTE that case-opened.test.mjs's source-level manifest KEY arm stays GREEN under this arm, because a spread declares no key. The through-the-op drive here is the only instrument that sees a field arriving by spread, which is why these four live in this suite and not only in that one. Every file restored byte-identically, sha256 compared: src/store.mjs 55fff2cbce9df862606ba4feab0681b272d9bbb57a3edb2864213a26bf436d9d, src/index.mjs 5dd90f2c93f4b10d57aa73b00ac77c7f78d999850d26866c293355fc519c8988. */
/* REC-44 / DEC-44 / D-187: A PUBLISHED CASE HOLDS MULTIPLE FINDINGS.
 *
 * This suite exists because the shipped model was never chosen. Measured against
 * source on 2026-08-04, `store.mjs` refused with "publishing publishes ONE case",
 * `published` was a state of an INQUIRY, `published_bundles` was keyed
 * (bundle_id, edition), and the container was built as `case: body.bundleId`.
 * Bob's definition is the opposite and was RULED (DEC-44): a case is one or MORE
 * findings, scoped to the project that gathered them. Nobody argued the singular
 * shape; every item in the chain assumed it (D-187).
 *
 * THE TWO ALTITUDES ARE THE SUBJECT, and every block is organised around keeping
 * them apart, because collapsing them IS the defect:
 *
 *   THE FINDING IS THE UNIT OF TRUTH. One proposition, one falsifier (DEC-32).
 *   Its own basis, its own frozen PAIR, its own signature over its own bytes.
 *   C-21.2's per-axis inheritance lives here and DEC-44 leaves it exactly where
 *   REC-14 put it — block 4.
 *
 *   THE CASE IS THE UNIT OF PUBLICATION. Its own identity, its own EDITIONS, its
 *   own authored scope statement and completeness assertion. C-21.1's byte-check
 *   lives here — block 3.
 *
 * AND THE ONE THING A CASE MAY NEVER HAVE IS A STRENGTH. Two findings whose
 * strengths differ have two answers; one letter over the case is R2's forbidden
 * composition arriving at a new altitude, and it is the "one letter" this project
 * has refused four times. Block 5 is the sweep that enforces it and it is Bob's
 * own negative control, carried verbatim from DEC-44 onto the item.
 *
 * THE FIXTURE MAKES THE TWO STRENGTHS DIFFER ON PURPOSE, and on BOTH axes:
 *   FIND_A  capture GRADED B (an earned capture leg) / connection GRADED C
 *   FIND_B  capture UNRATED  (no capture leg at all) / connection GRADED D
 * A surface that composed them would have to pick, drop or average something,
 * and every one of those is visible against a fixture where nothing matches.
 * `unrated` beside a graded axis is deliberate too: it is not a low score, it is
 * nothing established, and a composition that treated it as one would be caught.
 *
 * Every assertion that ratifies signs a real `bio-ratify` statement with stock
 * ssh-keygen, so this suite SKIPS LOUDLY WITH A NAMED REASON when ssh-keygen is
 * not on PATH rather than dying mid-run (ratify.test.mjs's precedent, D-93).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readContainer, readPart } from "../src/ooxml.mjs";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { ratifyCase } from "./caseceremony.mjs"; /* CASE-5b: the case-level signing ceremony */

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- multifinding ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("multifinding: SKIPPED — ssh-keygen not on PATH; a case edition is only complete when every "
    + "member finding carries a real bio-ratify signature");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec44", MEMBER_TOKEN: "mem-rec44", PROBE_TOKEN: "prb-rec44", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const anonRaw = async (q) => await mf.dispatchFetch(`http://x/api/?${q}`);
const anonJson = async (q) => (await anonRaw(q)).json();
const anonCase = async (args) => rP(await anonJson(`op=publishedcase&${args}`));
const anonBytes = async (args) => await anonRaw(`op=publishedbytes&${args}`);

/* The ops are written out literally so coverage.mjs credits them at the CONTROL
   PLANE, which is a real caller's only route (D-43). */
/* CORRECTED 2026-08-10, CASE-2 / DEC-72: a case is a PRODUCTION OF A PROJECT, so
   the act takes a publishing project and an AUTHORED designation for every
   member. Both are DEFAULTED here, and every existing refusal arm below goes on
   driving its own subject — several of them (an EMPTY targets list, a duplicate
   member) deliberately pass a member set the default partition then covers
   exactly, which is why `allLoadBearing` derives from the body rather than
   naming ids. This suite's subject is the SET and the container; the new rules
   are asserted by name in `caseproduction.test.mjs`. */
/* CASE-5b: THE CASE CEREMONY RIDES THIS HELPER. `op=publish` now AUTHORS a case
   document and commits nothing case-side; the case's own assertions are committed
   when a member SIGNS it (op=caseratify). Every assertion below is about the
   state after the ceremony, so the ceremony runs here where a reader can see it.
   Deliberately NOT run when publish REFUSED — the refusal arms below would
   otherwise become fixture crashes. `casesign.test.mjs` owns the ceremony itself
   and shares no code path with this helper. */
const publish = async (tok, body, { sign = true } = {}) => {
  const r = rP(await POST(`op=publish&token=${tok}`,
    { project: PUBLISHING_PROJECT, roles: allLoadBearing(body), ...body }));
  if (sign && r && r.ok !== false && r.caseDocument)
    await ratifyCase(async (q, b) => rP(await POST(q, b)), r, { dir, key: "wren", token: WREN });
  return r;
};
/* `sign: false` LEAVES THE CEREMONY UNPERFORMED, which is a real and reachable
   state of the record — a case authored and not yet signed — and block 2b drives
   the index's posture toward it rather than asserting the absence of an id
   nothing ever created. An absence that costs nothing to produce is not
   evidence. */
const caseSign = async (pub) =>
  ratifyCase(async (q, b) => rP(await POST(q, b)), pub, { dir, key: "wren", token: WREN });
/* CASE-5b: the CASE DOCUMENT, read back through the ANONYMOUS surface — no
   token, because a stranger is exactly who a SIGNED case document exists for.
   REC-130, 2026-09-18: that holds only for a RATIFIED document, and every read
   here is of one (`caseSign` runs first); an unsigned one now answers only to
   standing in its owning project, and a stranger gets NO_CASE_DOCUMENT. */
const caseDocOf = async (caseId, edition) =>
  rP(await GET(`op=casedocument&case=${encodeURIComponent(caseId)}&edition=${edition}`));
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM with nothing written. This
   helper concluded with no reading because the act took none; the three
   findings it concludes (FIND_A, FIND_B, FIND_C) now carry one
   (`withAdoptableReading`, ungraded legs, so no frozen pair moves) and the
   call names it. */
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`
    + adoptedVersionParam()));
const reopen = async (tok, target, reason) =>
  rP(await GET(`op=reopen&token=${tok}&target=${encodeURIComponent(target)}&reason=${encodeURIComponent(reason)}`));
const listRow = async (id) => ((await GET("op=list&token=mem-rec44")).result || [])
  .find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha;
const stateOf = async (id) => (await listRow(id))?.current_state;
const imageOf = async (id) => (await GET(`op=image&token=mem-rec44&id=${id}`)).result?.["bundle.md"]
  ?? (await GET(`op=image&token=mem-rec44&id=${id}`))["bundle.md"];

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "multifinding-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "wren", "-f", join(dir, "wren"), "-q"]);
const keyB64 = readFileSync(join(dir, "wren.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "wren"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec44", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-44", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-44", "admin", ["contribute", "publish"]);
const WREN = await enrol("wren", "wren-passphrase-44", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-rec44", { keyB64, memberId: "wren", comment: "wren laptop" }));

const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  return rP(await POST(`op=ratify&token=${WREN}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
};

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
/* CASE-2 / DEC-72's publishing project, owned by WREN, who publishes throughout.
   NO BAR is declared, so nothing this suite publishes is newly gated. */
const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-rec44", owner: "wren",
  /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7);
     the fixture takes a `name` and returns the minted id. */
  name: "PROJ-2026-4400-multifinding", created: NOW, updated: LATER });
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, md, type, state, base = null, extra = {}) => rP(await POST(`op=promote&token=${WREN}`, {
  bundleId: id, base, snapKey: `20260804T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...(extra.files || [])],
  register: extra.register || [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};

const INFO_CAP = "INFO-2026-4400-capture-b";
const INFO_CONN = "INFO-2026-4400-connection-c";
const INFO_TEST = "INFO-2026-4400-testimony-d";
const FIND_A = "INQ-2026-4400-authorisation";
const FIND_B = "INQ-2026-4400-signature";
const FIND_C = "INQ-2026-4400-notice";
const DOWNSTREAM = "INQ-2026-4400-downstream";

/* A captured part on FIND_A, so the container carries a blob and not only text
   — and so the two findings differ in what they contribute to it as well as in
   what they are worth. */
const CAPTURE = new Uint8Array(384).map((_, i) => (i * 11) % 253);
const CAP_SHA = sha(CAPTURE);
await mf.dispatchFetch(`http://x/api/capture?token=mem-rec44&sha256=${CAP_SHA}`,
  { method: "PUT", body: CAPTURE });
const DOC_CAP_SHA = sha("multifinding-INFO_CAP-bytes");

await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected", null,
  { register: [{ path: "snapshots/source.bin", sha256: DOC_CAP_SHA, bytes: 512, encoding: "binary" }] });
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
await mustPromote(INFO_TEST, infoMd(INFO_TEST), "information", "collected");

/* FIND_A: capture GRADED B (earned from the capture record) and connection
   GRADED C (a hunch, announced with its author and date — DEC-15). */
await mustPromote(FIND_A, withAdoptableReading(inquiryMd(FIND_A, { question: "Was the FY2024 sewer transfer authorised?",
  refs: [INFO_CAP, INFO_CONN],
  legs: [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
         { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch",
           author: "wren", date: "2026-08-04" }] })), "inquiry", "open", null, {
  files: [{ path: "snapshots/memo.bin", blobSha: CAP_SHA, bytes: CAPTURE.length, sha256: CAP_SHA }],
  register: [{ path: "snapshots/memo.bin", sha256: CAP_SHA, bytes: CAPTURE.length, encoding: "binary" }],
});
/* FIND_B: NO capture leg at all, so its capture axis is UNRATED — which is not
   a low score, it is nothing established on that axis — and one connection leg
   at D, the honest grade for testimony. Its pair matches FIND_A's on neither
   axis, on neither STATE and on neither GRADE, which is the whole point of the
   fixture. */
await mustPromote(FIND_B, withAdoptableReading(inquiryMd(FIND_B, { question: "Did anyone with delegated authority sign it?",
  refs: [INFO_TEST],
  legs: [{ target: INFO_TEST, grade: "D", axis: "connection", source: "testimony",
           author: "wren", date: "2026-08-04" }] })), "inquiry", "open");

for (const [id, conclusion, falsifier] of [
  [FIND_A, "The transfer rests on a memo nobody adopted.",
   "An adopted resolution naming the transfer would overturn this."],
  [FIND_B, "No delegation covering the signatory has been produced.",
   "A delegation instrument naming the signatory would overturn this."]]) {
  const c = await conclude(WREN, { target: id, conclusion, falsifier });
  if (!c.ok) throw new Error(`conclude ${id}: ${JSON.stringify(c)}`);
}

const SCOPE1 = "Whether the FY2024 sewer fund transfer was properly authorised and properly signed — the two "
             + "questions the transfer file raises together.";
const STMT1 = "This case covers the FY2024 transfer only, on the documents in hand at edition 1.";
const JUST1 = "We put both claims to the City Administrator on 2026-06-20 and printed what came back.";
/* ADDED 2026-08-05, REC-47 / DEC-46 (a): the AUTHORED bias acknowledgement,
   which op=publish now requires. It is a CASE-altitude claim like the scope and
   the completeness assertion beside it — one acknowledgement carried by every
   member finding — and this suite is where that altitude is asserted, since it
   is the only one that publishes a case of more than one finding. */
const BACK1 = "This group holds a declared position that transfers between municipal funds should be adopted "
            + "in public session, and edition 1 reads both findings through it.";
/* Edition 2's, and the WORDING is the assertion. The lens has NOT changed and
   the sentence says so — which is what makes block 3's pair honest: the gate is
   not extracting an invented difference, it is asking what the unchanged lens
   means for material that did change. */
const BACK2 = "The same declared position on public adoption is in force and is unchanged; edition 2 applies "
            + "it to the delegation file released on 2026-07-10.";

/* ============================================================ 1. THE ACT TAKES A SET */
console.log("\n--- 1. op=publish takes a SET: two findings, one case, one edition ---");
{
  t("the one-case refusal is GONE and its replacement says a case is one or MORE findings",
    (await publish(WREN, { targets: [], scope: SCOPE1, statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1,
                           biasAcknowledgement: BACK1 })).detail
      .includes("CONTAINER over ONE OR MORE FINDINGS"), true);
  t("a case with no authored SCOPE is refused by name: scope says what the case is ABOUT",
    (await publish(WREN, { targets: [FIND_A, FIND_B], scope: "", statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1,
                           biasAcknowledgement: BACK1 })).reason,
    "NO_SCOPE");
  t("a finding listed twice is refused: the ordinal would mean nothing and the container would hold two copies",
    (await publish(WREN, { targets: [FIND_A, FIND_A], scope: SCOPE1, statement: STMT1, excluded: [],
                           subjectPosition: "sought_and_answered", subjectJustification: JUST1,
                           biasAcknowledgement: BACK1 })).reason,
    "DUPLICATE_MEMBER");
  /* EVERY MEMBER IS JUDGED BEFORE ANY MEMBER MOVES. A case that published two
     of three findings and then refused the third would leave the record
     asserting a case that does not exist. */
  await mustPromote(FIND_C, withAdoptableReading(inquiryMd(FIND_C, { question: "Was notice given?", refs: [INFO_TEST],
    legs: [{ target: INFO_TEST, grade: "D", axis: "connection", source: "testimony",
             author: "wren", date: "2026-08-04" }] })), "inquiry", "open");
  const partial = await publish(WREN, { targets: [FIND_A, FIND_C], scope: SCOPE1, statement: STMT1,
    excluded: [], subjectPosition: "sought_and_answered", subjectJustification: JUST1,
    biasAcknowledgement: BACK1 });
  /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted, and ONLY THE
     REFUSAL NAME MOVED. The property this arm exists for — one unpublishable
     member refuses the WHOLE act, names the member, and moves nothing — is
     untouched and is the whole of what it asserts. The precondition that refuses
     an unconcluded member used to be derived from the edge table
     (ILLEGAL_TRANSITION, because `concluded -> published` was the only edge in);
     DEC-72 deletes that edge, so the rule "only a CONCLUDED finding may be a
     case member" is now `publishCase()`'s own NOT_CONCLUDED refusal. Same rule,
     said rather than implied. */
  t("one unpublishable member refuses the WHOLE act, naming the member — and nothing moved",
    [partial.reason, partial.target, await stateOf(FIND_A)], ["NOT_CONCLUDED", FIND_C, "concluded"]);

  const e1 = await publish(WREN, { targets: [FIND_A, FIND_B], scope: SCOPE1, statement: STMT1,
    excluded: [{ target: INFO_TEST, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered", subjectJustification: JUST1,
    biasAcknowledgement: BACK1 });
  if (!e1.ok) throw new Error(`publish edition 1: ${JSON.stringify(e1)}`);
  globalThis.__E1 = e1;
  t("TWO findings publish as ONE edition of ONE case",
    [e1.ok, e1.edition, e1.findings.map((f) => f.target)], [true, 1, [FIND_A, FIND_B]]);
  t("the case identity is MINTED and is distinct from every member's bundle id",
    [/^CASE-\d{4}-\d{4}$/.test(e1.caseId), e1.minted,
     e1.caseId !== FIND_A, e1.caseId !== FIND_B], [true, true, true, true]);
  t("a multi-finding case answers NO single bundle sha: reading one member's sha as the case's is the confusion",
    ["bundleSha" in e1, "target" in e1], [false, false]);
  /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted, and the old line was
     right when written. Under DEC-72 publication MOVES NO STATE: a finding's
     lifecycle ends at `concluded` and membership of a case is the relation, so
     "both members moved to published" is no longer a thing that happens to
     either of them. What this arm is really about — that ONE act placed BOTH
     findings in the case together — is asserted where it can now be seen: the
     state is unchanged for both, and both are members of the one case edition,
     read back through the anonymous public read. */
  t("the one act left BOTH members' lifecycles exactly where conclude left them (DEC-72)",
    [await stateOf(FIND_A), await stateOf(FIND_B)], ["concluded", "concluded"]);

  const [mdA, mdB] = [await imageOf(FIND_A), await imageOf(FIND_B)];
  const doc1 = await caseDocOf(e1.caseId, 1);
  /* ==== CORRECTED 2026-09-10 BY CASE-5b UNDER DEC-72, NEVER EXEMPTED, AND THE
     OLD ASSERTION WAS RIGHT FOR THE FORMAT IT WAS WRITTEN AGAINST. ============

     IT READ: every MEMBER carries `case_id`, `case_scope` and the whole
     `case_findings` roster in the bytes it will sign — *"a stranger holding ONE
     finding must be able to read which case it was published in, what that case
     was about and what else it rests on, without contacting this instance"*
     (DEC-44 determination 3). That property is real and it is why REC-44 wrote
     the case into every member: a finding's signature was the ONLY signature in
     the system, so N copies inside N signatures was the only way to get a case
     fact inside one at all.

     WHY IT IS WRONG NOW: CASE-5b mints the signature those facts were always
     about. The case's identity, scope and roster are signed ONCE, in the CASE
     DOCUMENT a member reviews and ratifies, and they are no longer in a member's
     frontmatter. Leaving this arm as it was would have it demanding a format the
     ruling deleted.

     THE PROPERTY IS NOT LOOSENED AND THAT IS WHAT THIS ARM NOW MEASURES. The
     stranger is asked to do exactly what they were asked before — read the case
     without contacting this instance — and the same three facts are demanded, in
     the same spellings, off bytes a member SIGNED. What is asserted beside them
     is the half that is genuinely new: the member's own bytes carry NONE of it
     any more, so there is one authority and not N. */
  t("the CASE DOCUMENT carries the case id, the scope and the WHOLE roster in the bytes a member signs",
    [new RegExp(`^case_id: ${e1.caseId}$`, "m").test(doc1.text),
     doc1.text.includes(`case_scope: "${SCOPE1}"`),
     new RegExp(`^case_findings: \\[${FIND_A}, ${FIND_B}\\]$`, "m").test(doc1.text),
     doc1.ratified],
    [true, true, true, true]);
  t("and NO member's bytes name the case any more — one authority for the case's facts, not N copies held together by divergence refusals",
    [mdA, mdB].map((md) => ["case_id:", "case_scope:", "case_findings:", "case_roles:",
                            "case_project:", "case_edition:", "bias_acknowledgement:",
                            "required_strength:"].filter((k) => md.includes(k))),
    [[], []]);
  t("what a member's bytes still carry is its OWN edition on its own chain",
    [/^edition: 1$/m.test(mdA), /^edition: 1$/m.test(mdB)], [true, true]);
  t("and the completeness assertion is the CASE's — one claim, in the case document and in both members' own frozen copies",
    [doc1.text.includes(`statement: "${STMT1}"`),
     mdA.includes(`statement: "${STMT1}"`), mdB.includes(`statement: "${STMT1}"`)], [true, true, true]);
  /* REC-47 / DEC-46 (a): THE ALTITUDE, and this suite is the only place it can
     be asserted, because it is the only one with a case of more than one
     finding. The bias acknowledgement is a CASE claim: ONE acknowledgement,
     carried IDENTICALLY by every member, exactly like case_scope and unlike the
     frozen strength pair — which differs per finding two assertions below and
     must go on differing. A per-finding acknowledgement would be a different
     construct making a different claim (each finding produced under its own
     lens), and DEC-46's import ruling is what says it is not that: a case's
     findings are scoped to ONE project, and one project is one effective bias.
     A case whose findings came from DIFFERENT source biases is DEC-46 (3)'s
     case, and it lands as SEPARATE projects rather than as one case with N
     lenses. */
  /* CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED. The ALTITUDE argument above
     is untouched and is in fact what this item enacted: the acknowledgement is a
     CASE claim, not a per-finding one. The old arm proved that by demanding the
     sentence be BYTE-IDENTICAL in both members — which was the strongest
     available evidence while the only place to put it was inside each member.
     Now there is one copy, so "byte-identical in both" is not a property the
     record can even fail to have: it is asserted where the claim now lives, and
     the complement — that no member carries one — is asserted above. A test for
     an equality that is true by construction is exactly the equality that costs
     nothing to produce. */
  t("THE ALTITUDE: the bias acknowledgement is the CASE's — ONE claim, in the case document a member signed",
    [doc1.text.includes(`bias_acknowledgement: "${BACK1}"`),
     mdA.includes("bias_acknowledgement:"), mdB.includes("bias_acknowledgement:")],
    [true, false, false]);
  t("and the ACT answers ONE acknowledgement for the case, not one per finding",
    [e1.bias_acknowledgement, e1.findings.some((f) => "bias_acknowledgement" in f)], [BACK1, false]);

  /* THE FIXTURE'S WHOLE POINT, asserted rather than assumed: the two findings
     are worth different things, on both axes, in both STATE and GRADE. */
  t("the two findings' frozen pairs DIFFER on both axes — which is what makes block 5 mean anything",
    e1.findings.map((f) => f.strength.map((a) => [a.axis, a.state, a.grade])),
    [[["capture", "graded", "B"], ["connection", "graded", "C"]],
     [["capture", "unrated", null], ["connection", "graded", "D"]]]);
  /* ==== CORRECTED 2026-08-10 BY CASE-2 UNDER DEC-72, NEVER EXEMPTED, AND THE
     TWO HALVES OF THIS ASSERTION HAVE COME APART — WHICH IS THE RULING ITSELF.
     It read `["strength" in e1, "required" in e1], [false, false]`: neither a
     case-level strength NOR a case-level bar. Both were right when written,
     because under DEC-17 the bar was read PER FINDING (from the projects citing
     it), so a single case-level `required` would have been a composition over
     findings — R2's forbidden composition wearing the bar's name, the exact
     defect the `strength` half guards against.

     DEC-72 SEPARATES THEM. Bob: *"The bar — that is, the standard of evidence —
     is a property of a project, not an inquiry or claim."* The bar is now read
     ONCE, from the publishing project, and is the CASE's own property; the
     strength stays PER FINDING and composing it is still forbidden. So:

       `strength` MUST STILL BE ABSENT — a case of two findings worth different
       things has TWO answers, and one letter over the case is the composition
       DEC-44 and R2 both refuse. This fixture is the only one in the estate that
       can see it, because its two members differ on both axes.
       `required` MUST NOW BE PRESENT — and its presence is not a relaxation: it
       is the assertion that the two members CANNOT have been held to different
       standards, which under the old model they could. `findings[].required`
       still answers per member and is asserted below to be IDENTICAL across
       them, which is the same claim from the other side. */
  t("and the ACT reports NO case-level STRENGTH — a case of two findings worth different things has "
  + "TWO answers, and one letter over the case is R2's forbidden composition at case altitude",
    "strength" in e1, false);
  t("BUT IT DOES REPORT A CASE-LEVEL BAR, and that asymmetry IS DEC-72: the standard of evidence is "
  + "a property of the PUBLISHING PROJECT, read once at act time, so it is the case's own — while "
  + "the strength remains each finding's and composing it stays forbidden",
    ["required" in e1, e1.required.project, e1.project], [true, PUBLISHING_PROJECT, PUBLISHING_PROJECT]);
  t("and the per-member bar AGREES with it in every member — the same claim from the other side, and "
  + "a state the old model could not guarantee because each finding read its own citers",
    e1.findings.map((f) => f.required.project), [PUBLISHING_PROJECT, PUBLISHING_PROJECT]);
}
const E1 = globalThis.__E1;
const CASE_ID = E1.caseId;
/* CORRECTED 2026-09-19 (REC-151, IC-164): block 6 named FIND_C's own case as the literal "CASE-2026-0002" — the
   second number off `allocId`'s CASE counter. A new case's id is now OPAQUE (Membership v2 §7, *"A MINTED ID
   CARRIES NO COUNT"*), so block 2b records the id the plane minted and block 6 reads it from here. */
let FIND_C_CASE = null;

/* ================================================ 2. MEMBERSHIP, AND THE CONTAINER */
console.log("\n--- 2. a case edition is COMPLETE when its last member ratifies, and the container carries them all ---");
{
  const shaA = await shaOf(FIND_A);
  const r1 = await ratify(FIND_A);
  t("the first member ratifies on its OWN bytes — the finding is the unit of truth",
    [r1.ok, r1.caseId, r1.edition], [true, CASE_ID, 1]);
  t("and the case edition states itself INCOMPLETE, naming what it is waiting for, rather than pretending",
    [r1.case.complete, r1.case.awaiting, r1.container], [false, [FIND_B], null]);
  const mid = await anonCase(`id=${CASE_ID}`);
  t("the public surface says so too: one finding answers, the container does not yet exist",
    [mid.complete, mid.awaiting, mid.manifest_sha, mid.findings.map((f) => f.bundle_id)],
    [false, [FIND_B], null, [FIND_A]]);

  /* REC-49: THE ONE INSTANT THE AWAITING WINDOW EXISTS in this fixture, kept for
     block 6's index sweep. On a real instance this state lasts as long as it
     takes the remaining members to ratify — hours or days — and it is precisely
     the state in which the case has NO container manifest for the public index
     to read a pair out of. Captured rather than reconstructed, so block 6 sweeps
     the answer the plane actually gave at that moment. */
  globalThis.__IDX_AWAITING = rP(await anonJson("op=publishedmanifest"));
  {
    const idx = globalThis.__IDX_AWAITING;
    const rowOf = (id) => (idx.published || []).find((p) => p.bundle_id === id && p.edition === 1);
    const csRow = (idx.cases || []).find((c) => c.case_id === CASE_ID && c.edition === 1);
    /* Written to REPORT rather than to throw: the negative control for this item
       removes the pair-bearing columns, and a TypeError names nothing while a
       failed assertion names the finding whose pair went missing. */
    t("REC-49: the INDEX already carries the ratified member's OWN frozen pair, with no container to read one from",
      [(rowOf(FIND_A).strength || []).map((a) => [a.axis, a.state, a.grade]),
       (rowOf(FIND_A).required || {}).declared ?? "NO BAR STATED", csRow.manifest, csRow.manifest_sha],
      [[["capture", "graded", "B"], ["connection", "graded", "C"]], false, null, null]);
    t("and NOTHING in the index states a pair for the member that has not ratified: nothing was signed for it",
      [!!rowOf(FIND_B), (idx.caseMembers || []).filter((m) => m.case_id === CASE_ID && m.edition === 1)
        .map((m) => m.bundle_id)],
      [false, [FIND_A, FIND_B]]);
  }

  const shaB = await shaOf(FIND_B);
  const r2 = await ratify(FIND_B);
  t("the LAST member completes the edition and the container is assembled then and not before",
    [r2.ok, r2.case.complete, r2.case.awaiting, r2.container.findings, r2.container.parts],
    [true, true, [], 2, 3]);

  const c = await anonCase(`id=${CASE_ID}`);
  t("an anonymous caller gets the CASE, with BOTH findings and both frozen pairs",
    [c.ok, c.complete, c.findings.map((f) => [f.bundle_id, f.strength.map((a) => a.grade)])],
    [true, true, [[FIND_A, ["B", "C"]], [FIND_B, [null, "D"]]]]);
  t("each finding's body is rendered from ITS OWN signed bytes (D-1), never from another member's",
    c.findings.map((f) => [f.body.state, f.body.from_sha]),
    [["published", shaA], ["published", shaB]]);
  t("each finding carries its OWN signature and its own attestation",
    [c.findings[0].sig_armored !== c.findings[1].sig_armored,
     c.findings.every((f) => f.sig_armored.startsWith("-----BEGIN SSH SIGNATURE-----"))], [true, true]);
  t("a MEMBER's bundle id resolves to the case it was published in, and says which one was asked for",
    [(await anonCase(`id=${FIND_B}`)).caseId, (await anonCase(`id=${FIND_B}`)).asked], [CASE_ID, FIND_B]);

  /* THE CONTAINER. DEC-44 determination 3: naming the other findings is not
     enough — a stranger holding the zip must be able to CHECK every finding the
     case rests on without contacting this instance. */
  const m = await anonBytes(`sha256=${c.manifest_sha}`);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(await m.arrayBuffer())));
  /* CORRECTED 2026-08-05, REC-47: `bio-case-container/2` -> `/3`. The container
     gained `bias_acknowledgement`, and the version had to move with it: a /2
     container carrying no acknowledgement and a /2 container that predates the
     field would otherwise be indistinguishable to a stranger holding the zip,
     so "the record is silent" would read as "the group declared nothing". The
     pin is not loosened — the exact version is still demanded — and the field
     it was bumped FOR is now demanded beside it. */
  /* CORRECTED AGAIN 2026-09-10, CASE-5 (DEC-72's artifact flip): `/3` -> `/4`,
     AND THE OLD ASSERTION WAS RIGHT WHEN IT WAS WRITTEN — `/3` is exactly what
     this plane produced until the flip. `/4` carries what the CASE artifact now
     freezes case-side: each member's PIN (`version_sha`), its AUTHORED ROLE, its
     OWN edition, and the case's producing project and bar. The version moves for
     the same reason REC-47 moved it one field over, and the pin here is not
     loosened: an exact version is still demanded, because a range match would
     pass silently over the NEXT change to this artifact. */
  t("the manifest describes the CASE and carries every member finding with its own signature and pair",
    [manifest.format, manifest.case, manifest.edition,
     manifest.findings.map((f) => f.bundle_id),
     manifest.findings.every((f) => f.signature.armored.startsWith("-----BEGIN SSH SIGNATURE-----"))],
    /* CORRECTED 2026-09-18, REC-128: `/5` -> `/6`, AND THE OLD ASSERTION WAS RIGHT WHEN IT WAS WRITTEN. `/6` carries `delivered_by` beside every `attestor` (who DELIVERED the signature, from the session: a member or the founder), and the version moves for the reason every bump here moved it — a `/5` container that never recorded a deliverer and a `/6` one whose deliverer was not recorded must not read alike. The pin still demands an EXACT version. */
    ["bio-case-container/6", CASE_ID, 1, [FIND_A, FIND_B], true]);
  /* CASE-5, ADDED RATHER THAN CORRECTED: this suite's two members publish at the
     SAME case edition, so their own editions and their case's agree — which is
     the SLAVED shape, still perfectly legal and now one case among two. Pinned
     here so the flip cannot be read as having made every member diverge: what it
     removed is the guarantee that they agree, not the agreement. The DIVERGED
     shape is `caseflip.test.mjs`'s fixture. */
  t("both members here sit at their OWN edition 1 inside case edition 1 — the numbers still agree when the "
    + "history agrees, which is what the flip stopped GUARANTEEING rather than stopped allowing",
    [manifest.findings.map((f) => f.edition), manifest.edition], [[1, 1], 1]);
  /* REC-47 / DEC-46 (a): IN THE CONTAINER, which is the copy that travels.
     DEC-20 makes the bias part of the evidentiary record that accompanies every
     published case; the container is the artifact that accompanies it once this
     instance is out of reach, so an acknowledgement served only from a live op
     would be a disclosure that stops existing when the instance does. */
  t("and the container carries the CASE's bias acknowledgement, so the lens travels with the zip",
    manifest.bias_acknowledgement, BACK1);
  t("every part is namespaced by the finding it belongs to — two members both carry a bundle.md",
    manifest.parts.map((p) => [p.finding, p.path]).sort(),
    [[FIND_A, `${FIND_A}/bundle.md`], [FIND_A, `${FIND_A}/snapshots/memo.bin`],
     [FIND_B, `${FIND_B}/bundle.md`]].sort());

  const z = await anonBytes(`sha256=${c.manifest_sha}&format=zip`);
  const zipBytes = new Uint8Array(await z.arrayBuffer());
  const zc = readContainer(zipBytes);
  t("the container serialises and the plane's own reader walks it",
    [z.status, zc.ok, zc.count], [200, true, 4]);
  let missing = [];
  for (const p of manifest.parts) {
    const got = await readPart(zipBytes, zc, `${CASE_ID}/${p.path}`);
    if (!got.ok || sha(got.bytes) !== p.sha256) missing.push(p.path);
  }
  t("EVERY part of EVERY finding hashes to what the manifest says, CRC-checked on the way out",
    missing, []);
  const inZip = await readPart(zipBytes, zc, `${CASE_ID}/${FIND_B}/bundle.md`);
  t("the SECOND finding's whole document is inside the container a stranger downloads (DEC-44 det. 3)",
    [inZip.ok, new TextDecoder().decode(inZip.bytes).includes("No delegation covering the signatory")],
    [true, true]);

  t("a bundle whose signed bytes name no case publishes no case row, and answers as what it is",
    (await anonCase(`id=${INFO_CAP}`)).reason, "NOT_PUBLISHED");

  /* ---- REC-58: `case.opened` REACHES NO CALLER ON ANY OP, DRIVEN THROUGH THE
     OPS RATHER THAN READ OFF THE SOURCE.
     ------------------------------------------------------------------------
     REC-58 was raised to remove `case.opened` from the publish-case act —
     `op=publish`, routed through the DO path `publishcase` (M0-12: the path
     name is not itself an op). That op
     does not publish it and never did — the item was right about the FIELD and
     wrong about the OP, which is REC-41's lesson for the third time. The RULING
     IS KEEP, because there is no publication to retire: `#caseEditionState`
     computes `opened` from a real recorded fact, `Store.publish()` hands the
     state whole to the control plane on an INTERNAL hop, and the control plane
     names the fields it forwards. `bio-plane/test/case-opened.test.mjs` carries
     the measurement and the reasoning.

     THESE FOUR ARMS ARE HERE AND NOT THERE FOR ONE REASON: this is the only
     fixture in the battery with a COMPLETE multi-finding case edition, so it is
     the only place the question can be asked of the WIRE. IC-22's own assertion
     is driven through the op for exactly this reason — index.mjs answers
     `{ok:true, ...c, ...}` on the public read, so a field can reach a caller
     without the control plane ever naming it and a source-level grep proves
     nothing about what a caller receives.

     ASSERTED AS KEY-ABSENCE (`"opened" in x`) AND NEVER AS A VALUE COMPARISON,
     on IC-22's precedent: `x.opened === undefined` is true both of an answer
     that never carried the key and of one carrying it set to undefined, so a
     value test cannot tell REMOVED from BLANKED — which is the entire
     distinction the ruling rests on. */
  t("REC-58: the publish-case act's own answer (`op=publish`) carries NO `opened` — the field the item was raised to remove "
  + "is absent from the act's return, which is the item's premise contradicted at the wire",
    ["opened" in E1, "opened" in (E1.completeness || {})], [false, false]);
  t("REC-58: `op=ratify`'s answer carries a `case` block and it carries NO `opened` — on the INCOMPLETE "
  + "edition and on the COMPLETE one alike, so neither branch of the state leaks it",
    [!!r1.case, "opened" in r1.case, !!r2.case, "opened" in r2.case],
    [true, false, true, false]);
  t("REC-58: and the SAME answers do carry `complete` and `awaiting` — so the absence above is a "
  + "measurement of one field and not of an empty case block",
    [r1.case.complete, r2.case.complete, "awaiting" in r2.case], [false, true, true]);
  t("REC-58: neither the PUBLIC READ nor the CONTAINER a stranger downloads carries `opened`, while both "
  + "carry `ratified_at` — the instant the record can actually stand behind travels; the instant somebody "
  + "started work does not",
    ["opened" in c, "ratified_at" in c, "opened" in manifest, "ratified_at" in manifest],
    [false, true, false, true]);
}

/* ============================== 2b. THE ROSTER AND THE ASSERTION ARE WHAT SOMEBODY SIGNED */
console.log("\n--- 2b. a member cannot assert the case, and the one divergence that is still real is REFUSED ---");
{
  /* ===== CORRECTED 2026-09-10 BY CASE-5b UNDER DEC-72, NEVER EXEMPTED, AND THE
     BLOCK IT REPLACES WAS RIGHT ABOUT EVERYTHING EXCEPT WHAT THE FORMAT WOULD
     BECOME. =================================================================

     WHAT IT USED TO DO, AND WHY IT EXISTED AT ALL — the note is kept verbatim
     because it is the best sentence in this suite: *"every member of a case
     published by op=publish carries the same roster and the same assertion BY
     CONSTRUCTION, so the divergence refusals could be deleted outright with all
     of blocks 1-5 still green. That is the inbox-grammar failure mode exactly —
     a suite testing something else because every input it generates is
     well-formed. So the disagreement is MANUFACTURED, through op=promote's
     hand-written door, which is the one route a document can reach `published`
     without this act having written it."* Three adversaries followed: one lying
     about the ROSTER (CASE_MEMBERSHIP_DIVERGED), one about the SCOPE, one about
     the BIAS ACKNOWLEDGEMENT (both CASE_ASSERTION_DIVERGED).

     WHY THAT IS NOW THE WRONG TEST, and it is not that a fence was lowered. All
     three refusals existed to notice that **N COPIES OF ONE FACT had stopped
     agreeing** — which was a reachable defect precisely because the case's
     identity, roster, scope, partition, project and bias acknowledgement lived
     inside N members' frontmatter. CASE-5b signs them ONCE, in the case
     document, and REFUSES them in a member's bytes outright. There is one copy
     and it cannot disagree with itself: the adversaries are not refused, they
     are UNREPRESENTABLE, which is the outcome this record reaches for
     everywhere else and is strictly stronger than a refusal.

     SO THE SUBJECT OF THIS BLOCK MOVED WITH THE DEFECT, and the block is kept
     rather than deleted because the question it asks is still live: can a
     hand-written document force its way into somebody else's case through
     op=promote's door? It is now asked of the door that exists.

       (a) THE LIE IS REFUSED AT THE GATE, BY NAME, PER KEY. The same
           hand-written bytes the old adversary 1 used — a member's frontmatter
           naming another case's id, scope, roster and acknowledgement — are
           refused by C-2.8, and the refusal names EVERY key it found rather
           than the first. That is the format closing the route, measured rather
           than argued.
       (b) AND THE CASE IS UNMOVED. Whatever a member writes in its own bytes,
           the case edition still holds exactly the two findings whose versions
           the case document PINNED.
       (c) THE ONE DIVERGENCE THAT IS STILL REAL IS STILL REFUSED BY NAME.
           `CASE_ASSERTION_DIVERGED` survives, re-aimed: it compares what the
           CASE's signer asserted about the case's limits against what THIS
           member's own signed bytes froze as theirs. Those are two different
           members' signatures over two different documents, so they genuinely
           can differ — which is exactly the property that made the old arms
           worth having, arriving at the one place it is still true. */
  const publishedMd = await imageOf(FIND_A);
  /* A frontmatter block runs from its own key to the next key at column 0. */
  const blockOf = (md, key) => {
    const m = new RegExp(`^${key}:.*(?:\\n[ -].*)*`, "m").exec(md);
    return m ? m[0] : null;
  };
  const swap = (md, key, replacement) => {
    const was = blockOf(md, key);
    return was ? md.replace(was, replacement) : md;
  };
  const addAfterFm = (md, lines) => md.replace(/^(---\n)/, `$1${lines.join("\n")}\n`);

  const cc = await conclude(WREN, { target: FIND_C,
    conclusion: "No notice of the transfer was published before it was executed.",
    falsifier: "A published agenda item naming the transfer before its date." });
  if (!cc.ok) throw new Error(`conclude FIND_C: ${JSON.stringify(cc)}`);
  const own = await publish(WREN, { targets: [FIND_C], scope: "Whether notice was given at all.",
    statement: "This case covers the notice question only.", excluded: [],
    subjectPosition: "not_sought",
    subjectJustification: "Notice would let the record be revised before it is captured; we say so.",
    biasAcknowledgement: "The group's declared position on public adoption applies to the notice question too, "
                       + "and this case is read through it." }, { sign: false });
  if (!own.ok) throw new Error(`publish FIND_C: ${JSON.stringify(own)}`);
  FIND_C_CASE = own.caseId;
  t("(fixture) FIND_C publishes into a case of its OWN, which is minted separately",
    [own.ok, own.minted, own.caseId !== CASE_ID], [true, true, true]);
  /* ===== THE UNSIGNED WINDOW, DRIVEN — CASE-5b's own before/after, taken here
     because this is the one place a case exists with its document unsigned.
     `op=publish` AUTHORED the document and committed NOTHING: no `cases` row, no
     `published_cases` row, no roster. That is the fence the whole item rests on,
     and it is measured rather than argued. */
  const beforeSign = rP(await anonJson("op=publishedmanifest"));
  t("(fixture) BEFORE the ceremony: op=publish authored the case document and committed NOTHING — the case is on the public index nowhere, and no roster names its member",
    [(beforeSign.cases || []).some((c) => c.case_id === own.caseId),
     (beforeSign.caseMembers || []).some((m) => m.case_id === own.caseId),
     /^[0-9a-f]{64}$/.test(own.caseDocument.doc_sha), own.caseDocument.case_id],
    [false, false, true, own.caseId]);
  await caseSign(own);
  const afterSign = rP(await anonJson("op=publishedmanifest"));
  t("(fixture) AFTER a member SIGNS that document: the case, its roster and its pin are all on the index — committed from bytes somebody reviewed, with every member still AWAITING",
    [(afterSign.cases || []).some((c) => c.case_id === own.caseId),
     (afterSign.caseMembers || []).filter((m) => m.case_id === own.caseId).map((m) => m.bundle_id),
     (afterSign.caseMembers || []).filter((m) => m.case_id === own.caseId)
       .every((m) => /^[0-9a-f]{64}$/.test(m.version_sha))],
    [true, [FIND_C], true]);
  const cMd = await imageOf(FIND_C);
  /* (fixture) THE ARM IS ARMED — these bytes really do carry none of the keys
     the lie is about to add, so what (a) refuses is the LIE and not the
     document's ordinary shape. An adversary indistinguishable from the baseline
     proves nothing. */
  t("(fixture) FIND_C's own published bytes name NO case — so the lie below is the only thing under test",
    ["case_id:", "case_findings:", "case_scope:", "bias_acknowledgement:"].filter((k) => cMd.includes(k)), []);

  /* ADVERSARY — the old block's roster lie, unchanged in what it WRITES: another
     case's identity, its scope, its roster and its acknowledgement, hand-written
     into a member's own frontmatter through the one door that skips op=publish. */
  const lie = addAfterFm(swap(cMd, "edition", "edition: 1"), [
    `case_id: ${CASE_ID}`,
    "case_edition: 1",
    `case_scope: "${SCOPE1}"`,
    `bias_acknowledgement: "${BACK1}"`,
    `case_findings: [${FIND_A}, ${FIND_B}, ${FIND_C}]`,
  ]);
  await mustPromote(FIND_C, lie, "inquiry", "published", (await listRow(FIND_C)).bundle_sha);
  const rl = await ratify(FIND_C);
  t("(a) a member that writes a case into its OWN bytes is refused BY THE GATE, and the refusal names EVERY key it found rather than the first",
    [rl.reason,
     (rl.findings || []).filter((x) => x.check === "C-2.8" && /a finding's bytes name a case/.test(x.detail))
       .map((x) => /name a case \((\w+)\)/.exec(x.detail)?.[1]).sort()],
    ["GATE_REFUSED", ["bias_acknowledgement", "case_edition", "case_findings", "case_id", "case_scope"]]);
  t("(a2) and the refusal SAYS where those facts live now, so a member is told the shape rather than only refused it",
    /CASE DOCUMENT a member reviews and ratifies/.test(
      (rl.findings || []).find((x) => /a finding's bytes name a case/.test(x.detail))?.detail ?? ""), true);

  t("(b) no adversary reached the case: its edition still holds exactly the two findings the case document PINNED",
    (await anonCase(`id=${CASE_ID}`)).findings.map((f) => f.bundle_id), [FIND_A, FIND_B]);

  /* ===== (c) WAS WRITTEN TO DRIVE THE SURVIVING DIVERGENCE AND MEASURED
     SOMETHING BETTER. RECORDED AS MEASURED RATHER THAN SMOOTHED. =============

     The arm was: give FIND_C a DIFFERENT completeness block from the one its own
     case document asserts, and expect `CASE_ASSERTION_DIVERGED` — the one case
     fact that still lives in two signatures and could therefore still disagree.
     It came back GREEN-ratified with NO refusal at all, and the reason is a fact
     about the plane rather than about the arm.

     **THE PIN IS THE HASH OF THE MEMBER'S OWN BYTES.** Editing those bytes to
     change the completeness block changes the sha, so the document no longer
     matches the `version_sha` the case document froze — and the member is
     therefore not in that case edition at all. It ratifies as an ordinary
     finding. There is no reachable route to bytes that BOTH match the pin and
     carry a different completeness claim, because matching the pin IS carrying
     those bytes.

     SO `CASE_ASSERTION_DIVERGED` IS A SECOND FENCE IN FRONT OF A DOOR THE PIN
     ALREADY HOLDS SHUT, and this suite says so out loud rather than leaving a
     reader to believe an unexercised refusal is load-bearing. That is CASE-3's
     own posture on its write-once pin predicate, arriving one item later on the
     refusal that predicate makes redundant: it is kept because two authorities
     for one fact must be incapable of disagreeing, not because a reachable
     caller is known to attack it.

     WHAT THE ARM ASSERTS NOW IS THE PROPERTY THAT IS ACTUALLY THERE, and it is
     the stronger one: a member that edits its bytes LEAVES the case rather than
     corrupting it, and the case goes on naming the version it froze. */
  const clean = swap(cMd, "completeness", blockOf(publishedMd, "completeness"))
    .replace(/^completeness_excluded:.*(?:\n[ -].*)*/m, blockOf(publishedMd, "completeness_excluded"));
  await mustPromote(FIND_C, clean, "inquiry", "published", (await listRow(FIND_C)).bundle_sha);
  const edited = await anonCase(`id=${own.caseId}`);
  t("(c) a member that edits its own bytes LEAVES its case rather than corrupting it — the case goes on naming the version it FROZE, and the member reads as AWAITING",
    [edited.findings.map((f) => f.bundle_id), edited.awaiting, edited.complete], [[], [FIND_C], false]);
  t("(c2) STATED RATHER THAN LEFT TO BE BELIEVED: CASE_ASSERTION_DIVERGED was NOT exercised by this arm and is not reachable by any caller route this suite can build, because matching the pin IS carrying the bytes the pin hashes",
    edited.findings.length, 0);
  /* Put the honest bytes back, so the sweeps below read a whole record rather
     than the wreckage of an attack — the same restore the REC-47 adversary block
     performs, and for the same reason. Restoring the CONTENT restores the SHA,
     which is what re-matches the pin, and that equality is worth its own
     assertion: it is the property that makes the pin a statement about BYTES
     rather than about an act. */
  await mustPromote(FIND_C, cMd, "inquiry", "published", (await listRow(FIND_C)).bundle_sha);
  /* MEASURED AGAINST THE WORKING SHA AND THE ROSTER'S PIN DIRECTLY, rather than
     against what the case SERVES — because FIND_C has never been ratified in
     this suite, so it has no published row to serve either way, and an arm that
     read `findings` would report the same empty list before and after the
     restore. An outcome that costs nothing to produce is not evidence. */
  const pinOnIndex = ((rP(await anonJson("op=publishedmanifest")).caseMembers) || [])
    .find((m) => m.case_id === own.caseId && m.bundle_id === FIND_C);
  t("(c3) restoring the CONTENT restores the SHA, and the case's pin names it again — the pin is a statement about BYTES, not about an act",
    [pinOnIndex.version_sha === (await listRow(FIND_C)).bundle_sha,
     /^[0-9a-f]{64}$/.test(pinOnIndex.version_sha)], [true, true]);
}


/* ================================== 3. C-21.1 IS PER CASE PER EDITION */
console.log("\n--- 3. C-21.1: the completeness assertion is authored PER CASE PER EDITION ---");
{
  for (const id of [FIND_A, FIND_B]) {
    const r = await reopen(WREN, id, "New material arrived: the delegation file was released on 2026-07-10.");
    if (!r.ok) throw new Error(`reopen ${id}: ${JSON.stringify(r)}`);
  }
  await conclude(WREN, { target: FIND_A,
    conclusion: "The transfer rests on a memo nobody adopted, and the delegation file confirms it.",
    falsifier: "An adopted resolution naming the transfer would overturn this." });
  await conclude(WREN, { target: FIND_B,
    conclusion: "The delegation file names no authority covering the signatory.",
    falsifier: "A delegation instrument naming the signatory would overturn this." });

  const carried = await publish(WREN, { targets: [FIND_A, FIND_B], caseId: CASE_ID, scope: SCOPE1,
    statement: STMT1, excluded: [{ description: "any 2019 minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-12.",
    biasAcknowledgement: BACK2 });
  t("edition 2 reprinting edition 1's STATEMENT byte-for-byte is REFUSED, and the refusal names the CASE",
    [carried.reason, carried.field, carried.caseId, carried.prior],
    ["COMPLETENESS_CARRIED_FORWARD", "statement", CASE_ID, 1]);
  t("and nothing moved: a refusal at the case level leaves every member concluded",
    [await stateOf(FIND_A), await stateOf(FIND_B)], ["concluded", "concluded"]);

  /* =================================================================
     REC-47: THE TWO RULES, SIDE BY SIDE, IN ONE REPUBLICATION.
     =================================================================
     This is the assertion the item exists to make legible, and it is here
     rather than in publish.test.mjs because this is where REC-44's scope
     judgement was pinned — the two must be readable together or the next
     reader will find one rule and assume it is the rule.

       SCOPE unchanged        -> LEGAL. A case's question does not move when a
                                 finding is revised, and holding it to a
                                 difference manufactures one.
       BIAS ACK unchanged     -> REFUSED. Not because the LENS must move — it
                                 need not, and usually should not — but because
                                 the acknowledgement is the publisher's account
                                 of what that lens did to THIS edition's
                                 material, and this edition's material changed.

     The discriminator is recorded at checkCompletenessFreshness. What is
     asserted here is that the plane actually behaves as the two rules say, in
     the ONE act where a member would meet both at once. */
  const STMT2 = "Edition 2 covers the FY2024 transfer and the delegation file released on 2026-07-10.";
  const carriedBias = await publish(WREN, { targets: [FIND_A, FIND_B], caseId: CASE_ID, scope: SCOPE1,
    statement: STMT2, excluded: [{ description: "any 2019 minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-12.",
    biasAcknowledgement: BACK1 });
  t("THE ITEM: the SAME republication reprinting edition 1's BIAS ACKNOWLEDGEMENT is REFUSED, under its own name",
    [carriedBias.reason, carriedBias.field, carriedBias.check, carriedBias.caseId, carriedBias.prior],
    ["BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD", "bias_acknowledgement", "C-21.1", CASE_ID, 1]);
  t("and nothing moved on it either",
    [await stateOf(FIND_A), await stateOf(FIND_B)], ["concluded", "concluded"]);

  const e2 = await publish(WREN, { targets: [FIND_A, FIND_B], caseId: CASE_ID, scope: SCOPE1,
    statement: STMT2, excluded: [{ description: "any 2019 minutes", reason: "outside the period at issue" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the revised claims to the City Administrator on 2026-07-12.",
    biasAcknowledgement: BACK2 });
  t("a FRESH statement publishes edition 2 of the SAME case, with the scope UNCHANGED and legal",
    [e2.ok, e2.edition, e2.caseId, e2.minted, e2.scope === SCOPE1], [true, 2, CASE_ID, false, true]);
  /* THE PAIR, ASSERTED AS A PAIR. One publication, one field held to a
     difference and one field not — which is the only way to show these are two
     rules rather than one rule applied inconsistently. */
  t("REC-47 vs REC-44, IN ONE ACT: the scope repeats and is LEGAL while the acknowledgement must be fresh",
    [e2.scope === SCOPE1, e2.bias_acknowledgement === BACK1, e2.bias_acknowledgement === BACK2],
    [true, false, true]);
  /* AND THE ACKNOWLEDGEMENT SAYS THE LENS DID NOT MOVE, which is the point:
     the gate never asks anyone to invent a change in their bias (DEC-20 — a
     declared standing position is disclosed, not disqualifying), only to say
     what it means for the material in front of them now. */
  t("the fresh acknowledgement STATES the lens is unchanged — no invented difference anywhere",
    /unchanged/.test(BACK2), true);

  await ratify(FIND_A);

  /* ================================================================
     REC-47 ADVERSARY: THE SECOND MEMBER SIGNED A DIFFERENT LENS.
     ================================================================
     THIS IS THE ONE THAT ISOLATES THE RULE, and it is here rather than in block
     2b because block 2b structurally cannot isolate it. There the adversary is
     FIND_C, which is not in the case's declared roster — so its bytes must
     carry a roster naming itself, and CASE_MEMBERSHIP_DIVERGED fires on that
     whether or not anything reads the acknowledgement. MEASURED, not assumed:
     with the bias clause removed, block 2b's adversary 3 reports
     CASE_MEMBERSHIP_DIVERGED and still fails — proving the clause is
     load-bearing but naming the WRONG RULE, which is exactly the instrument
     defect REC-16 recorded and corrected.

     Here FIND_B is a LEGITIMATE member of the declared roster and the edition
     is already open (FIND_A ratified a moment ago, writing the case row). So
     the roster matches, the scope matches, the completeness matches, and the
     ONLY divergence is the acknowledgement. Nothing else can fire.

     It is also the REAL threat rather than a contrived one: the working record
     moves under a published edition every time somebody promotes, and a second
     member signing a different account of the bias the case was made under
     would otherwise be reconciled silently — leaving whichever member ratified
     FIRST to decide what the public record says the case's lens was. */
  /* ===== CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED. THE ADVERSARY ABOVE
     IS NOW UNBUILDABLE, AND THE ARGUMENT FOR IT IS WHAT MADE IT UNNECESSARY. ==

     THE OLD ARM: FIND_B, a legitimate member of the declared roster, re-promoted
     with a DIFFERENT `bias_acknowledgement` in its own frontmatter, expecting
     `CASE_ASSERTION_DIVERGED`. Every word of the reasoning above is correct, and
     the closing sentence is the one this item acted on: *"a second member signing
     a different account of the bias the case was made under would otherwise be
     reconciled silently — leaving whichever member ratified FIRST to decide what
     the public record says the case's lens was."*

     THAT IS THE DEFECT CASE-5b REMOVES RATHER THAN GUARDS. The acknowledgement is
     signed ONCE, in the case document, so there is no first member to decide it
     and no second member to contradict it. A member's bytes carry no
     acknowledgement at all — the gate refuses the key BY NAME — so the lie cannot
     be written, let alone ratified. The three arms below are the same question
     asked of the mechanism that answers it now: can a member state the case's
     lens? No, and here is the refusal that says so. */
  {
    const goodB = await imageOf(FIND_B);
    const OTHER = "A different account of the lens, signed by the second member only.";
    /* The key is ADDED rather than replaced, because it is no longer there to
       replace — which is itself the first thing worth asserting. */
    t("(fixture) a member's published bytes carry NO bias acknowledgement to diverge from — the adversary's raw material is gone",
      /^bias_acknowledgement: /m.test(goodB), false);
    const lie = goodB.replace(/^(---\n)/, `$1bias_acknowledgement: "${OTHER}"\n`);
    t("(fixture) and the lie really differs ONLY in the acknowledgement",
      [lie !== goodB, lie.replace(/^bias_acknowledgement: .*\n/m, "") === goodB], [true, true]);
    await mustPromote(FIND_B, lie, "inquiry", "published", (await listRow(FIND_B)).bundle_sha);
    const bad = await ratify(FIND_B);
    t("REC-47, ISOLATED: a rostered member that states the CASE's lens in its OWN bytes is refused BY THE GATE, naming the key",
      [bad.reason,
       (bad.findings || []).some((x) => x.check === "C-2.8"
         && /a finding's bytes name a case \(bias_acknowledgement\)/.test(x.detail))],
      ["GATE_REFUSED", true]);
    t("and the refusal SAYS the acknowledgement is signed once, in the case's own document, rather than N times in N members",
      /signed ONCE, in the CASE DOCUMENT/.test(
        (bad.findings || []).find((x) => /bias_acknowledgement/.test(x.detail))?.detail ?? ""), true);
    /* Put the honest bytes back and let the edition complete, so everything
       below reads a real, whole case rather than the wreckage of an attack. */
    await mustPromote(FIND_B, goodB, "inquiry", "published", (await listRow(FIND_B)).bundle_sha);
  }

  await ratify(FIND_B);
  const c1 = await anonCase(`id=${CASE_ID}&edition=1`);
  const c2 = await anonCase(`id=${CASE_ID}`);
  t("BOTH editions of the case answer, each with its own completeness claim (DEC-12)",
    [c2.edition, c2.editions, c1.completeness.statement, c2.completeness.statement],
    [2, [1, 2], STMT1, STMT2]);
  t("each edition has its OWN container, and edition 1's still assembles after edition 2 lands",
    [c1.manifest_sha !== c2.manifest_sha,
     (await anonBytes(`sha256=${c1.manifest_sha}&format=zip`)).status], [true, 200]);
}

/* ================================ 4. C-21.2 STAYS PER FINDING */
console.log("\n--- 4. C-21.2: the inheritance rule is checked PER FINDING, at the other altitude ---");
{
  /* THE TWO ALTITUDES, IN ONE BLOCK. A basis leg rests on a FINDING — one
     proposition with one falsifier (DEC-32) — so what it inherits is that
     finding's frozen pair on that axis at that edition. It does NOT rest on the
     case, and there is nothing at case level for it to inherit: that is why
     C-21.1 moved up and C-21.2 did not. */
  let probeN = 0;
  const tryLeg = async (leg) => {
    const id = `${DOWNSTREAM}-${++probeN}`;
    return await promote(id, inquiryMd(id, { question: "Does the pattern hold city-wide?",
      refs: [leg.target], legs: [leg] }), "inquiry", "open");
  };
  const checksOf = (r) => (r.findings || []).map((f) => f.check).sort();

  const capA = await tryLeg({ target: FIND_A, grade: "A", axis: "capture", source: "inherited", edition: 1 });
  t("inheriting CAPTURE A from a FINDING whose frozen capture is B is REFUSED",
    [capA.ok, capA.reason, checksOf(capA)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const capB = await tryLeg({ target: FIND_A, grade: "B", axis: "capture", source: "inherited", edition: 1 });
  t("inheriting CAPTURE B, that finding's frozen capture grade, is ACCEPTED", capB.ok, true);
  const connC = await tryLeg({ target: FIND_A, grade: "C", axis: "connection", source: "inherited", edition: 1 });
  t("inheriting CONNECTION C from the SAME finding is accepted independently, per axis",
    connC.ok, true);
  /* THE SECOND FINDING IS A DIFFERENT ANSWER AND THE RULE MEETS IT SEPARATELY.
     A case-level comparison would have to pick one of the two pairs, and either
     choice is wrong for the other member — which is what "the two altitudes must
     not be collapsed" means when it costs something. */
  const connD = await tryLeg({ target: FIND_B, grade: "D", axis: "connection", source: "inherited", edition: 1 });
  t("inheriting CONNECTION D from the OTHER finding is accepted at ITS OWN frozen grade", connD.ok, true);
  const connCfromB = await tryLeg({ target: FIND_B, grade: "C", axis: "connection", source: "inherited", edition: 1 });
  t("but inheriting CONNECTION C from that same finding is REFUSED — C is legal beneath A and not beneath B",
    [connCfromB.ok, connCfromB.reason, checksOf(connCfromB)], [false, "BASIS_REFUSED", ["C-21.2"]]);
  const capFromB = await tryLeg({ target: FIND_B, grade: "D", axis: "capture", source: "inherited", edition: 1 });
  t("and inheriting ANY capture grade from a finding whose capture axis is UNRATED is REFUSED: nothing was established there",
    [capFromB.ok, checksOf(capFromB)], [false, ["C-21.2"]]);
  const noCase = await tryLeg({ target: CASE_ID, grade: "B", axis: "capture", source: "inherited", edition: 1 });
  t("a leg naming the CASE rather than a finding resolves to nothing: legs rest on findings, never on cases",
    noCase.ok, false);
}

/* REC-49: op=publishedmanifest EMBEDS each complete case edition's container
   manifest as a JSON **STRING** on its `cases[]` row, and a structural sweep
   that walks a response object stops dead at a string. So the copy of the
   manifest a reader of the PUBLIC INDEX meets first was the one surface DEC-44's
   sweep could not see inside — measured, not supposed: negative control (ii-b)
   below plants a case-level pair there and the uncorrected sweep reports
   nothing. Expanded here so the index is swept like every other surface.
   CORRECTED 2026-08-05 (REC-49) and never exempted: block 5 passed
   `publishedmanifest` in raw, which was not wrong about anything it could see
   and was blind to a whole surface. */
const expandIndex = (idx) => ({ ...idx,
  cases: (idx.cases || []).map((cs) => ({ ...cs,
    manifest: typeof cs.manifest === "string"
      ? (() => { try { return JSON.parse(cs.manifest); } catch (_) { return { UNPARSEABLE: cs.manifest }; } })()
      : cs.manifest })) });

/* ======================= 5. BOB'S NEGATIVE CONTROL: no single case-level strength */
console.log("\n--- 5. DEC-44's own control: NO surface, rendering or export states a case-level strength ---");
{
  /* THE SWEEP, and it is a SWEEP rather than a value comparison on purpose. A
     spurious case-level strength breaks nothing else: every per-finding
     assertion in blocks 1-4 goes on passing while the surface additionally
     answers a composed letter, which is precisely why review would not catch it
     and why the negative controls in this file's header measured 4 and 5
     failures HERE and none anywhere else.

     What it looks for: any key named `strength`, `published_strength`,
     `required` or `required_strength` that is NOT attached to a finding. An
     object is finding-scoped when it names a `bundle_id` of its own or sits
     under a `findings` array — which is what a finding is and what a CASE, by
     construction, is not: a case names a `case_id` and has no bundle id to
     give. That is deliberately the rule rather than "the path contains
     findings[]", so that op=publishededitions — which is addressed to ONE
     finding and answers with that finding's own editions — is swept honestly
     instead of being excused from the sweep. An excused surface is exactly
     where the next case-level strength would appear. */
  const CASE_LEVEL = new Set(["strength", "published_strength", "required", "required_strength"]);
  const caseLevelStrengths = (root, label) => {
    const hits = [];
    const walk = (node, path, underFinding) => {
      if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, `${path}[${i}]`, underFinding));
        return;
      }
      if (!node || typeof node !== "object") return;
      const isFinding = underFinding || Object.prototype.hasOwnProperty.call(node, "bundle_id");
      for (const [k, v] of Object.entries(node)) {
        const p = path ? `${path}.${k}` : k;
        if (CASE_LEVEL.has(k) && v !== null && !isFinding) hits.push(p);
        walk(v, p, isFinding || k === "findings");
      }
    };
    walk(root, label, false);
    return hits;
  };

  /* EVERY SURFACE A READER CAN REACH, and the export and the rendering with
     them — DEC-44 names all three. */
  const byCase = await anonCase(`id=${CASE_ID}`);
  const byFinding = await anonCase(`id=${FIND_A}`);
  const byEdition = await anonCase(`id=${CASE_ID}&edition=1`);
  const byHash = await anonCase(`sha256=${await shaOf(FIND_B)}`);
  const list = rP(await GET("op=publishedlist&token=mem-rec44"));
  const editions = rP(await GET(`op=publishededitions&token=mem-rec44&id=${FIND_A}`));
  /* EXPANDED (REC-49) — see the note above `expandIndex`. Unexpanded, the index
     was swept only down to the JSON string its `cases[]` rows carry, so the
     container manifest the public index hands out was excused from DEC-44's own
     control. An excused surface is exactly where the next case-level strength
     appears, which is this suite's own stated rule. */
  const pubManifest = expandIndex(rP(await anonJson("op=publishedmanifest")));
  const mBytes = new Uint8Array(await (await anonBytes(`sha256=${byCase.manifest_sha}`)).arrayBuffer());
  const manifest = JSON.parse(new TextDecoder().decode(mBytes));

  const surfaces = [
    ["publishedcase(by case id)", byCase], ["publishedcase(by finding id)", byFinding],
    ["publishedcase(by edition)", byEdition], ["publishedcase(by hash)", byHash],
    ["publishedlist", list], ["publishededitions", editions],
    ["publishedmanifest", pubManifest], ["manifest", manifest],
  ];
  t("the fixture still holds: the two findings are worth DIFFERENT things, so a composition has to show",
    byCase.findings.map((f) => f.strength.map((a) => [a.state, a.grade])),
    [[["graded", "B"], ["graded", "C"]], [["unrated", null], ["graded", "D"]]]);
  t("NO surface, rendering or export states a strength above the finding — the sweep names any that does",
    surfaces.flatMap(([label, root]) => caseLevelStrengths(root, label)), []);
  t("and each finding's own pair IS there, so the sweep is not passing on an empty answer",
    [byCase.findings.length, byCase.findings.every((f) => Array.isArray(f.strength) && f.strength.length === 2),
     manifest.findings.every((f) => Array.isArray(f.strength) && f.strength.length === 2)],
    [2, true, true]);
  /* The zip is the copy that travels WITHOUT this instance, so the manifest
     inside it is checked as its own artifact rather than trusted to match. */
  const z = await anonBytes(`sha256=${byCase.manifest_sha}&format=zip`);
  const zipBytes = new Uint8Array(await z.arrayBuffer());
  const zc = readContainer(zipBytes);
  const inner = JSON.parse(new TextDecoder().decode((await readPart(zipBytes, zc, "MANIFEST.json")).bytes));
  t("and the CONTAINER a stranger downloads carries no case-level strength either",
    caseLevelStrengths(inner, "container/MANIFEST.json"), []);
  t("the manifest says in words what it is refusing to do, so the next reader does not add one back",
    inner.verify.includes("there is no case-level strength"), true);
}

/* ============ 6. REC-49: THE PUBLIC INDEX TELLS THE TRUTH ABOUT A CASE'S STRENGTHS */
console.log("\n--- 6. REC-49: the INDEX carries every RATIFIED member's own frozen pair, awaiting window or not ---");
{
  /* WHY THIS BLOCK EXISTS, and the reason is a measurement rather than a design
     preference. REC-44 moved `completeness`/`manifest`/`manifest_sha` off
     `published_bundles` onto `published_cases`; the battery stayed green; and
     NOTHING ANYWHERE ASSERTED THAT op=publishedmanifest STILL ANSWERS A PAIR FOR
     A CASE THAT HAS ONE. Block 5 sweeps for a pair that must NOT be there, and
     block 5 passes perfectly on an answer carrying no pairs at all — the
     empty-body-digest shape CLAUDE.md names: an outcome that costs nothing to
     produce is not evidence. This block is its complement and the two are
     useless apart. A surface can fail in two directions and one instrument sees
     one of them.

     AND IT SWEEPS BOTH WINDOWS, because they are two different answers. A case
     edition is ratified one member at a time and the container is assembled only
     when the last member lands, so there is a real window — potentially days on
     a live instance — in which `cases[].manifest` is null. CONDUCT'S
     DETERMINATION (REC-49), implemented here: the index carries the per-finding
     pair for every RATIFIED member THROUGH that window. It composes nothing —
     `published_bundles.strength` is the member's own signed, ratified pair, and
     REC-44 already ruled that the findings which ratified are published and
     answerable now. What the index must never carry is a pair for the CASE, and
     that is block 5's job, not this one's.

     STRUCTURAL, OVER WHOLE RESPONSES, AND NEVER A VALUE COMPARISON. REC-44's
     control (a) and UI-29's control (m) both measured the same thing one
     altitude apart: a value comparison goes on passing while the surface answers
     correctly AND additionally answers wrongly. The mirror holds here — an
     assertion that FIND_A's index row says B/C would go on passing while the
     index quietly stopped answering for every other case on the instance. So the
     sweep asks a question about the WHOLE response: for every member of every
     case edition the index holds, is that member's pair stated, and whose is
     it? */
  const PAIR_KEYS = new Set(["strength", "required", "required_strength", "published_strength"]);
  const pairSites = (root, label) => {
    const sites = [];
    const walk = (node, path, owner) => {
      if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, owner)); return; }
      if (!node || typeof node !== "object") return;
      /* Whose pair it is, by the same rule block 5 uses to decide what a finding
         is: an object naming a `bundle_id` of its own is a finding, and anything
         beneath it belongs to that finding. */
      const own = Object.prototype.hasOwnProperty.call(node, "bundle_id") ? node.bundle_id : owner;
      for (const [k, v] of Object.entries(node)) {
        const p = `${path}.${k}`;
        if (PAIR_KEYS.has(k) && v !== null) sites.push({ path: p, owner: own ?? null });
        walk(v, p, own);
      }
    };
    walk(root, label, null);
    return sites;
  };
  const understated = (idx, label) => {
    const out = [];
    const sites = pairSites(idx, label);
    for (const cs of idx.cases || []) {
      const roster = (idx.caseMembers || [])
        .filter((m) => m.case_id === cs.case_id && Number(m.edition) === Number(cs.edition));
      for (const m of roster) {
        /* CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED — AND IT IS IC-66's
           OWN DEFECT, FOUND HERE RATHER THAN IN THE UI. This read
           `p.bundle_id === m.bundle_id && p.edition === cs.edition`: the
           MEMBER's published row joined on the CASE's edition number. That was
           right while the two numbers were slaved, which is exactly what CASE-5
           unslaved — and IC-66 measured the identical join in
           `civicos-ui/app.html` (enqueued as UI-56). Left as it was, a member
           whose own edition differs from its case's MISSES the join and reads as
           awaiting ratification forever; and a member whose bytes moved AFTER
           the case pinned them would be matched to a version the case never
           froze, which is worse — the sweep would then grade the wrong document.
           The join is the PIN, which is the only column that can answer it. */
        const row = (idx.published || [])
          .find((p) => p.bundle_id === m.bundle_id && p.bundle_sha === m.version_sha);
        const where = `${label} ${cs.case_id}@${cs.edition} ${m.bundle_id}`;
        if (!row) {
          /* DECLARED AND NOT YET RATIFIED. Nothing has been signed for it, so
             nothing may state a pair for it — an invented pair here is the same
             defect pointing the other way, and the worse of the two. */
          if (sites.some((s) => s.owner === m.bundle_id))
            out.push(`${where}: AWAITED member carries a pair nobody signed for it`);
          continue;
        }
        if (!Array.isArray(row.strength) || row.strength.length !== 2
            || !row.strength.every((a) => a && a.axis && a.state))
          out.push(`${where}: RATIFIED member has NO frozen pair on the index — the index UNDERSTATES a case that HAS one`);
        if (!row.required || typeof row.required.declared !== "boolean")
          out.push(`${where}: RATIFIED member states no declared-bar fact on the index`);
      }
    }
    return out;
  };

  const nowIdx = expandIndex(rP(await anonJson("op=publishedmanifest")));
  const midIdx = expandIndex(globalThis.__IDX_AWAITING);

  t("THE AWAITING WINDOW: every ratified member's pair is stated and no awaited member's is",
    understated(midIdx, "publishedmanifest(awaiting)"), []);
  t("THE COMPLETE EDITIONS: the same sweep over the same answer once every container exists",
    understated(nowIdx, "publishedmanifest"), []);

  /* AND THE SWEEP IS NOT PASSING ON AN EMPTY ANSWER — the fixture is asserted
     rather than assumed, because a sweep over zero cases returns [] and would
     look identical. */
  /* CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND THE NEW THIRD ROW IS
     THE ITEM ITSELF RATHER THAN NOISE. Under the old shape a case reached the
     public index only when its FIRST MEMBER ratified, because that is when the
     `published_cases` row was written. Since CASE-5b the case row is written when
     the CASE DOCUMENT is signed — so block 2b's FIND_C case, published and
     deliberately never ratified by any member, is now a real case edition on the
     index with its whole roster AWAITING. That is the honest state and the
     better one: a reader can see what a case claims and which versions it froze
     before the last member lands, and the window is STATED rather than the case
     being invisible until somebody signs a finding. Its five rostered members
     against four RATIFIED rows is exactly that difference, which CASE-1's schema
     comment names as the only thing that can say an edition is incomplete. */
  t("the fixture the sweep ran over: three case editions (one of them awaiting), five rostered members, four ratified findings",
    [(nowIdx.cases || []).map((c) => `${c.case_id}@${c.edition}`).sort(),   /* sorted both sides: the ids are opaque (REC-151), so their order is not the minting order */
     (nowIdx.caseMembers || []).length, (nowIdx.published || []).length],
    [[`${CASE_ID}@1`, `${CASE_ID}@2`, `${FIND_C_CASE}@1`].sort(), 5, 4]);

  const pairOf = (idx, id, ed) => ((idx.published || [])
    .find((p) => p.bundle_id === id && Number(p.edition) === ed) || {}).strength;
  const grades = (s) => (s || []).map((a) => [a.axis, a.state, a.grade]);
  /* THE TWO MEMBERS DIFFER ON BOTH AXES AND THE INDEX KEEPS THEM APART. This is
     not a check that a value round-tripped — it is the check that the index did
     not hand one member's pair to the other, which is the cheapest way for a
     surface to look right while composing. The fixture makes any mix-up visible
     because nothing about the two pairs matches. */
  t("each member's index pair is ITS OWN, and the two do not resemble each other",
    [grades(pairOf(nowIdx, FIND_A, 1)), grades(pairOf(nowIdx, FIND_B, 1))],
    [[["capture", "graded", "B"], ["connection", "graded", "C"]],
     [["capture", "unrated", null], ["connection", "graded", "D"]]]);
  /* THE INDEX AND THE CASE PAGE ARE THE SAME PAIR. Cheap agreement on its own
     (both read one column), so it is asserted for what it can actually catch: a
     reader who quotes the index and a reader who quotes the case page must not
     be able to come away with different letters for one finding. */
  t("and it is the same pair op=publishedcase publishes for that finding, so the two surfaces cannot diverge",
    (await anonCase(`id=${CASE_ID}&edition=1`)).findings.map((f) => JSON.stringify(f.strength)),
    [FIND_A, FIND_B].map((id) => JSON.stringify(pairOf(nowIdx, id, 1))));
  /* THE CONTAINER MANIFEST IS STILL ON THE INDEX and still names every member.
     A reconstruction needs it — it is the case's own record of what it carried —
     and this is the assertion that fails if the column is dropped again. */
  t("the complete editions still carry their CONTAINER MANIFEST on the index, naming every member with its pair",
    (nowIdx.cases || []).filter((c) => c.manifest_sha)
      .map((c) => [c.manifest && c.manifest.format,
                   (c.manifest && c.manifest.findings || []).map((f) => f.bundle_id),
                   (c.manifest && c.manifest.findings || []).every((f) => Array.isArray(f.strength))]),
    /* CORRECTED 2026-08-05, REC-47: /2 -> /3, for the reason recorded at the
       container assertion in block 2. CORRECTED AGAIN 2026-09-10, CASE-5: /3 ->
       /4, for the reason recorded at the same assertion. */
    /* CORRECTED 2026-09-18, REC-128: /5 -> /6, for the reason recorded at the container assertion in block 2. */
    [["bio-case-container/6", [FIND_A, FIND_B], true], ["bio-case-container/6", [FIND_A, FIND_B], true]]);
  /* ===== THE THIRD STATE, CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND
     THE OLD ARM'S PRINCIPLE IS THE ONE THIS ITEM ENACTED. =====================

     IT SAID: FIND_C was PUBLISHED into a case of its own and never ratified, so
     that case appears on the index NOWHERE — *"`published_cases` is written at
     the first RATIFICATION out of that member's signed bytes … a surface drawing
     one would be drawing a case that nothing signed."* The PRINCIPLE is exactly
     right and is untouched: nothing reaches the public index that nobody signed.

     WHAT MOVED IS WHICH SIGNATURE. The case's own assertions are now signed in
     the case document, so a case edition reaches the index when THAT document is
     ratified, with every member still AWAITING. Nothing about it is unsigned:
     the scope, the roster, the pins, the partition, the bar and the
     acknowledgement on that row all came out of bytes a member reviewed. What a
     reader gains is that they can see what a case claims and which versions it
     froze BEFORE the last member lands, with the window stated rather than the
     case being invisible until somebody signs a finding.

     SO THE ARM IS INVERTED AND KEPT, AND THE UNSIGNED CASE IS STILL DRIVEN: a
     case edition whose DOCUMENT was never signed is still on the index NOWHERE,
     which is the same rule asked of the act that now carries it. */
  t("a case whose DOCUMENT a member signed IS on the public index, with its whole roster AWAITING — the window is stated, not hidden",
    (nowIdx.cases || []).filter((c) => c.case_id !== CASE_ID)
      .map((c) => [c.case_id, (nowIdx.caseMembers || [])
        .filter((m) => m.case_id === c.case_id).map((m) => m.bundle_id), !!c.manifest_sha]),
    [[FIND_C_CASE, [FIND_C], false]]);
  /* AND THE UNSIGNED HALF OF THE RULE IS DRIVEN IN BLOCK 2b, at the one moment
     it is observable — see the BEFORE/AFTER pair there. It is not re-asserted
     here against an id nothing created, because an absence that costs nothing to
     produce is not evidence. */
  t("and every case edition the index DOES hold has a roster, so it can never present a case of nought findings",
    (nowIdx.cases || []).filter((c) => !(nowIdx.caseMembers || [])
      .some((m) => m.case_id === c.case_id && Number(m.edition) === Number(c.edition)))
      .map((c) => `${c.case_id}@${c.edition}`), []);
  /* THE PLANE SAYS AT WHICH ALTITUDE A PAIR LIVES, in the answer itself, so a
     surface built against this op does not have to infer it from the shape. */
  t("and the answer states the rule it is keeping, where a consumer will read it",
    [/frozen strength pair belongs to a FINDING/.test(nowIdx.altitudes || ""),
     /DECLARED AND NOT YET RATIFIED/.test(nowIdx.altitudes || "")], [true, true]);
}

await mf.dispose();
console.log(`\nmultifinding: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
