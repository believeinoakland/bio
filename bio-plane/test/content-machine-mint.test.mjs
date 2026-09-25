/* NEGATIVE CONTROL: the SIX arms live in `test/nc-sk7.mjs` and are re-run in one step with `node test/nc-sk7.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes all-arms-broken from all-arms-working. (b) `attest` — in src/store.mjs, restore the PRE-ITEM CODE at op=attesttext's DO route (the attestor read from the request BODY instead of from the control plane's stamp), which puts the pre-SK-7 world back exactly; section 4's machine-credential arms MUST FAIL (the attestations LAND), and the impostor arm MUST FAIL too — both, because the hole this item closed had two mouths and an arm that catches only one would have passed before the fix. FIRST CUT WRONG AND RECORDED AT ITS SITE: it neutered the STAMP in src/index.mjs instead, which leaves the attestor ABSENT rather than caller-supplied, so checkAttestation refused EVERYTHING including the member's own act and four of five declared failures did not occur — a gate that refuses everything reading as a fence holding, which is the very shape the item found in the product. (c) `label` — in src/store.mjs `#contentStanding`, delete the `mint:` line, which drops the label from `op=content` AND from `earned.content` while leaving `op=contentmint` and `op=promote` labelled; section 3's TOTALITY arm MUST FAIL **NAMING THE SURFACE** (the op whose answer carried an unlabelled row) rather than merely reporting a count, and section 5's finding-side label arm MUST FAIL. DECLARATION CORRECTED AFTER THE FIRST RUN AND RECORDED: the field-set pin in section 6 was declared as a must-fail and stayed GREEN, correctly — it destructures the label block out before comparing, so it asks whether REC-83's own sixteen fields MOVED, which this arm does not do; it is now declared in the arm's held-open half, where it catches a label that REWRITES a field rather than adding one. The correction went to the declaration, never to the assertion. (d) `finding` — in src/store.mjs `earnedBasisRegistry`, make the content block answer over EVERY content row in the store rather than over the ids the caller named (`contentIds` replaced by a scan); section 4's "absent until a member cites it" arm MUST FAIL, and it is the arm that proves 5.7's third clause is structural rather than incidental — a machine-minted row nobody cited would then be in a finding. (e) `overstrict` — THE OVER-STRICTNESS DIRECTION, and its held-open half is the whole point: a MEMBER-MINTED row (`minted_by = plane`, the only kind that existed before this item) must answer EXACTLY as it did on the pristine pre-item tree, field for field and by sha256 digest, ONCE the `mint` block this item adds is removed from the comparison. The arm makes `contentMintState` answer `machine` for the plane's own value — the ordinary way a new classifier silently relabels an old row — and section 5's pin MUST FAIL while every machine-side assertion STAYS GREEN. The digest is printed by this suite's own section 6 on a green run and is re-read there after any merge; a hand copy agrees for free, so the literal in this file is a printout. **CORRECTED BY THE RESPAWN: the first worker's declaration named `test/sk7-baseline-probe.mjs` as the printer and NO SUCH FILE IS IN THE TREE** — a throwaway it ran and did not commit, which is a declaration pointing at an instrument the next reader cannot run, and is exactly the class of claim D-238 exists to refuse. (f) `uilabel` — THE RESPAWN'S OWN ARM, and the only one whose subject is not this suite: in `civicos-ui/app.html`, remove the mint label's CALL SITE from `legReferentHtml` (leaving `legMintLabelHtml` intact, which is the realistic failure — a renderer that stops asking, not a helper that vanishes) and judge it by `node civicos-ui/test/content-extent.test.mjs`, whose section 8 MUST FAIL on the two positive label assertions. It exists because the other five were declared on a tree where `op=content` had NO consumer anywhere — measured, and true then — and UI-61 landed one while this item's first worker was dead, so *labelled everywhere it is shown* acquired a screen that arm (c) cannot see, arm (c) being judged by a plane suite that never opens the page. ITS HELD-OPEN HALF IS THE POINT: UI-61's own `ref`, jump and stale-pane assertions and the section-7 OVER-STRICTNESS DIGEST must all stay green, because an arm that broke the renderer would fail the label assertions for a reason that has nothing to do with the label. */
/* RESULTS. **RE-RUN IN FULL ON THE MERGED TREE 2026-09-14 by the SK-7 worker (RESPAWN)** — the first worker's run is kept below it, because its tree and this one are not the same tree and a control's result is a fact about the tree it ran on. Each arm ALONE with the others held open, every restore verified byte-identically by sha256 AND by content with a byte count printed (src/store.mjs 2,009,912 B sha256 2b88cedc9293…, checks/bio-checks.mjs 668,310 B sha256 4bf470383cb8…, civicos-ui/app.html 1,228,519 B sha256 ad139a10adb2…; src/index.mjs is no longer armed by any arm — `attest` was re-cut onto the DO route in store.mjs before the first worker died). **RESPAWN: baseline 45/0 green · attest 39/6 (5/5 declared) · label 41/4 (4/4) · finding 44/1 (1/1) · overstrict 43/2 (2/2) · uilabel 56/2 on the SURFACE suite (2/2, and the section-7 over-strictness digest among the 56 that stayed green) — ALL SIX AS DECLARED, none re-cut, none re-declared.** FIRST WORKER'S RUN, on `3f92e5c` + `c2760e0`, kept as the record of two arms that came back wrong before they came back right: baseline 45/0 · attest 39/6 · label 41/4 · finding 44/1 · overstrict 43/2, all five as declared on that tree. (1) `attest`'s first cut neutered the STAMP in src/index.mjs, which leaves the attestor ABSENT rather than caller-supplied — so `checkAttestation` refused EVERY attestation including the member's own, and four of five declared failures did not occur BECAUSE THE ARM HAD BROKEN THE ACT OUTRIGHT. A gate that refuses everything reads as a fence holding, which is the identical shape this item found in the product, arriving in the control that was measuring it. Re-cut at the DO route to restore the pre-item body read; 5/5. (2) `label`'s declaration listed the section-6 field-set pin as a must-fail and it stayed GREEN, correctly: the pin destructures the label block out before comparing, so it asks whether REC-83's own sixteen fields MOVED, and dropping a label moves none. The DECLARATION was corrected, never the assertion. A THIRD THING, the third occurrence of one shape in three consecutive items: the `label` arm's first run ended in a TypeError reading `.mint.state` off a row the arm had stripped — no assertion ran, the module ended at 16 pass and the control reported the wrong thing. Every `mint` read in this suite is optional-chained and fails BY NAME; REC-82's `overstrict` and REC-83's `unwired` met the identical shape. */

/* SK-7 / framework Part II §14.4 (Bob's ruling of 2026-09-14, folded there as
 * 5.7) — THE MACHINE-MINTED CONTENT ROW.
 *
 * THE RULING, in its own words, and it has three clauses that are three
 * different mechanisms rather than one sentiment:
 *
 *   *"The assistant may mark passages as citable on its own, every such row
 *    labelled as machine work, never attested by it, and part of a finding only
 *    when a member cites it."*
 *
 *   1. MAY MARK — a machine credential can MINT. Before this item the only way
 *      a content row came into being was `op=promote`'s projection, so a
 *      passage became addressable only at the instant a member had ALREADY
 *      cited it and `minted_by` could hold nothing but `plane`. §2 drives the
 *      new door through the `ai` class, under FL-6's cascade, with the scope
 *      the minting member declared.
 *   2. LABELLED EVERYWHERE — §3 is a TOTALITY over surfaces rather than a list
 *      of four checks. Every op that can emit a content row is driven, EVERY
 *      object carrying a `content_id` anywhere in its answer is harvested
 *      recursively, and each one must carry the plane's own label with the
 *      PUBLISHED sentence. A list of four spellings goes stale the moment a
 *      fifth surface is written; the walk does not.
 *   3. NEVER ATTESTED BY IT — §4, and this is the clause that was NOT HOLDING.
 *      See the block at §4 for the measurement.
 *   4. IN A FINDING ONLY WHEN A MEMBER CITES IT — §5, driven in both
 *      directions: absent from `op=earnedbasis` while nothing cites it, present
 *      the moment a member's own basis leg names the same passage — AND STILL
 *      LABELLED, because the id is `hash(capture, extent, chain)` so the
 *      member's citation FINDS the machine's row rather than minting a second.
 *
 * WHAT IS DELIBERATELY NOT HERE, and each is somebody else's:
 *   - the WRITER and the extent grammar are REC-82's (`content-extent`); the
 *     refusals C-45.1..C-45.4 are asserted here only as the ones this door
 *     returns VERBATIM, never as a second copy of their rules.
 *   - the READS at content grain are REC-83's (`content-reads`).
 *   - the frontmatter and version-leg grammar are REC-84's.
 *   - the other three extent arms' `covers` are REC-85's.
 *   - THE ASSISTANT SIDE IS NOT BUILT AND IS NOT FAKED. `ASSISTANT-PILOT.md`
 *     §5 exclusion 1 excludes EXTRACT from the pilot BY NAME, and its §2/§3 are
 *     [DESIGNED-not-built] in full. Nothing in `agent-worker/` runs an EXTRACT
 *     pass. So this suite drives the PLANE half through a real minted `ai`
 *     credential — which is what an assistant would hold — and asserts nothing
 *     whatever about a pilot calling it, because no such caller exists. The gap
 *     is reported as a DESIGN GAP rather than papered over with a fixture.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTENT_MINT_STATES, CONTENT_MINTED_BY_PLANE, contentMintState,
         isMachineMinted, isMachineIdentity, contentIdFor } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk7", MEMBER_TOKEN: "mem-sk7", PROBE_TOKEN: "prb-sk7", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-sk7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-sk7") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const raw = async (op, qs = "", tok = "mem-sk7") => await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json();

try {

const NOW = "2026-09-14T00:00:00Z", LATER = "2026-09-14T01:00:00Z";

/* ---------------------------------------------------------------- members */
const session = async (memberId, role, caps = ["contribute", "create_projects"]) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: caps }, "adm-sk7");
  const en = await post("enroll", { invite: add.invite, handle: memberId,
                                    password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until two exist. `IRA` is that second admin; `NELL` is an
   ordinary member and exists for one assertion — the D-15 arm in §6, where a
   member who was never invited to a project must not be able to learn that a
   document in it exists by trying to mark a page of it. */
const RUTH = await session("ruth", "admin", ["contribute", "publish", "create_projects"]);
const IRA = await session("ira", "admin");
const NELL = await session("nell", "member", ["contribute"]);

/* -------------------------------------------------------------- documents */
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  /* CORRECTED 2026-09-23 by REC-179 (C-66.5): this template said `surfaced_by: agent`, but its questions are created by a member SESSION, which D-78 restamps `human` — so every later revision re-sending the template RELABELLED the question `agent`, the defect REC-179 closes (a revision now carries the value forward or is refused SURFACED_BY_REWRITTEN). The template now says what the record holds. */
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null, tok = RUTH } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260914T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register }, tok);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A D-252 SCOPED chain — the only shape that gives this capture a PAGE SET the
   record can see (D-345: nothing persists a PDF page count). */
const CHAIN = [
  { step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
    confidence: { basis: "none" }, extent: { kind: "pages", pages: [0, 1, 2] } },
];
const SHA_DOC = sha("sk7-the-document-the-assistant-read");
const DOC = "INFO-2026-8700-marked";

console.log("\n--- 0. the ground: a captured, read document and a registered subject ---");

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] }, RUTH);
t("a subject entity is registered", /^ENT-/.test(eOrd.entity_id || ""), true);
const ORD = eOrd.entity_id;

await promote(DOC, infoMd(DOC), "information", {
  reading: { capture: { sha256: SHA_DOC, encoding: "binary", bytes: 10 },
             reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
                        entities: [{ ref: "ordinance:24680", kind: "ordinance", key: "24680",
                                     label: "Ordinance No. 24680" }],
                        facts: {}, text_source: CHAIN } },
  register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });
const rr = await post("resolve", { captureSha: SHA_DOC }, RUTH);
t("the recogniser matches the document to the subject at A",
  [rr.resolved_count, rr.resolved[0].grade], [1, "A"]);

/* THE CREDENTIAL AN ASSISTANT WOULD HOLD — FL-6's `ai` class, minted by a
   member, scoped by that member's own declaration. Nothing here pretends a
   pilot exists; this is the credential the pilot would authenticate with. */
const mintCred = async (writes, tokenId) => post("aicredentialmint",
  { tokenId, principalKind: "member", principalMember: "ruth", taskScope: "extract",
    writes, note: `the extraction agent: marks passages citable, ${writes.join(" + ")}` }, RUTH);

const EXTRACTOR = await mintCred(["contentmint"], "extractor");
t("a member mints an `ai` credential whose declared scope is the mint and nothing else",
  [EXTRACTOR.ok, EXTRACTOR.credential.writes, EXTRACTOR.credential.principal],
  [true, ["contentmint"], "member:ruth"]);
const AK = EXTRACTOR.token;

/* ================= 1. MAY MARK — THE DOOR, THROUGH THE OP ============== */

console.log("\n--- 1. clause 1: a machine credential MARKS A PASSAGE CITABLE, and the scope is the member's declaration ---");

const PAGE_EXTENT = { kind: "pdf-page", page: 1, rect: [72, 600, 540, 720],
                      ref: "page 2, the transfer table" };
const marked = await post("contentmint", { bundleId: DOC, extent: PAGE_EXTENT }, AK);
t("THE ASSISTANT'S CREDENTIAL MINTS A CONTENT ROW — the act §14.4 gives the machine, "
+ "which before this item had no door at all",
  [marked.ok, marked.minted, marked.extent_kind], [true, true, "pdf-page"]);
t("at exactly the address the content-addressing function answers for it — no allocator, "
+ "so a member citing the same passage later finds THIS row",
  marked.content_id, contentIdFor(SHA_DOC, PAGE_EXTENT, CHAIN));
t("and `minted_by` names the CREDENTIAL, not the member who authorised it — `member:ruth` is "
+ "not a machine identity and stamping the principal would label the assistant's row as a member's",
  [marked.minted_by, isMachineIdentity(marked.minted_by)], ["class:ai/extractor", true]);
const MACHINE_ROW = marked.content_id;

/* THE SCOPE IS THE FENCE AND IT IS DRIVEN, not assumed from the class: an `ai`
   credential reaches a MUTATING op only if the member who minted it named that
   op in `writes`. This is FL-6's cascade doing its job at a new verb, and it
   costs one more credential to prove rather than to believe. */
const READER = await mintCred([], "reader-only");
const refusedScope = await post("contentmint", { bundleId: DOC, extent: { kind: "document" } },
                                READER.token);
t("an `ai` credential whose member declared NO writes is refused BY NAME at this op",
  refusedScope.reason, "AI_BEYOND_TASK_SCOPE");
t("with its C-number and a canned translation, not a bare code (DEC-49)",
  [typeof refusedScope.check === "string" && /^C-/.test(refusedScope.check),
   typeof refusedScope.translation === "string" && refusedScope.translation.length > 40],
  [true, true]);

/* THE SAME ACT BY A MEMBER, because §14.4's own sentence is *"the assistant, a
   member, or another means tries to find the specific passages"* — one act, two
   actors, told apart by who is stamped rather than by who is permitted. */
const byMember = await post("contentmint", { bundleId: DOC, extent: { kind: "document" } }, RUTH);
t("A MEMBER performs the same act through a session, and the record carries THEIR name",
  [byMember.ok, byMember.minted_by, byMember.extent_kind], [true, "ruth", "document"]);
const MEMBER_ROW = byMember.content_id;

/* ================= 2. THE REFUSALS AT THIS DOOR ======================== */

console.log("\n--- 2. the door's own three refusals, and the extent grammar returned VERBATIM ---");

const atInquiry = await post("contentmint", { bundleId: "INQ-2026-8700-nothing", extent: { kind: "document" } }, AK);
t("a bundle this record does not hold is refused by name", atInquiry.reason, "NO_SUCH_BUNDLE");
const INQ_EMPTY = "INQ-2026-8701-empty";
await promote(INQ_EMPTY, inquiryMd(INQ_EMPTY, { subject: ORD }), "inquiry");
const atRealInquiry = await post("contentmint", { bundleId: INQ_EMPTY, extent: { kind: "document" } }, AK);
t("AN INQUIRY IS REFUSED AS NOT A DOCUMENT — an inquiry rests on things, it is not a thing with "
+ "pages (DEC-21, IC-83 AMENDMENT 2), and the refusal says which rather than shrugging",
  [atRealInquiry.reason, atRealInquiry.target_type], ["NOT_A_DOCUMENT", "inquiry"]);
const DRY = "INFO-2026-8702-nobytes";
await promote(DRY, infoMd(DRY), "information");
const noBytes = await post("contentmint", { bundleId: DRY, extent: { kind: "document" } }, AK);
t("a document this record holds no capture of is refused — there are no bytes for an address to "
+ "address, and absence is a fact about capture and never about what the document says",
  noBytes.reason, "NO_BYTES_HELD");
const offEnd = await post("contentmint", { bundleId: DOC, extent: { kind: "pdf-page", page: 9, ref: "page 10" } }, AK);
t("AN EXTENT OUTSIDE THE PAGE SET IS REFUSED BY THE WRITER'S OWN CHECK, returned verbatim — "
+ "this door restates no extent rule and holds no second copy of one",
  [offEnd.ok, offEnd.check], [false, "C-45.1"]);
const unknownKind = await post("contentmint", { bundleId: DOC, extent: { kind: "sheet-cell", ref: "B4" } }, AK);
t("and so is an extent kind this plane cannot yet evaluate (REC-85's arms), by its own code",
  unknownKind.check, "C-45.3");

/* ================= 3. LABELLED ON EVERY SURFACE ======================== */

console.log("\n--- 3. clause 2: EVERY surface that shows a content row labels it — a TOTALITY, not four checks ---");

/* AN INQUIRY THAT CITES BOTH ROWS, so `op=promote` and `op=earnedbasis` each
   have a content row to show and the walk below has a real corpus. */
const INQ = "INQ-2026-8700-cites-the-marked-passage";
const rInq = await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, rect: [72, 600, 540, 720],
           eref: "page 2, the transfer table" }] }), "inquiry");

/* THE WALK. Every op that CAN emit a content row is driven, and every object
   anywhere in the answer that HANDS THE CALLER `minted_by` is harvested
   RECURSIVELY. The question asked is not "do these four keys carry a label" —
   that is a list of spellings, and a list goes stale the moment a fifth surface
   is written. It is *did the stored identity reach a caller without the words
   that say what it means*, which is a property the walk can answer about a
   surface nobody has written yet.
   *
   * WHY `minted_by` AND NOT `content_id`, stated because the first draft of
   * this walk used `content_id` and was WRONG IN THE DIRECTION THAT INFLATES —
   * it harvested `op=earnedbasis`' basis LEGS, which carry a content id as a
   * POINTER and nothing else. A pointer is not a surface showing a row: there
   * is no machine word on it for a member to read, and demanding a label there
   * would be a fence tighter than its rule. `minted_by` IS the machine word
   * (`class:ai/<tokenId>`), so a caller handed it is exactly a caller who needs
   * the sentence — which is the ruling's own subject rather than a convenient
   * narrowing. The pointer case is asserted BELOW rather than dropped, so the
   * narrowing is measured and not merely declared.
   *
   * WHAT THIS WALK CANNOT SEE, said plainly: a surface that renders a content
   * row under DIFFERENT KEY NAMES of its own invention, and any surface outside
   * these four ops — including `civicos-ui/`, which renders no content row at
   * all today (measured: `op=content` landed with REC-83 and has no consumer in
   * `app.html`). It sees the plane's answers, which is where DEC-49 puts the
   * label. */
const rowsIn = (v, out = []) => {
  if (Array.isArray(v)) { for (const x of v) rowsIn(x, out); return out; }
  if (v && typeof v === "object") {
    if (typeof v.minted_by === "string") out.push(v);
    for (const k of Object.keys(v)) rowsIn(v[k], out);
    return out;
  }
  return out;
};
const pointersIn = (v, out = []) => {
  if (Array.isArray(v)) { for (const x of v) pointersIn(x, out); return out; }
  if (v && typeof v === "object") {
    if (typeof v.content_id === "string" && typeof v.minted_by !== "string") out.push(v);
    for (const k of Object.keys(v)) pointersIn(v[k], out);
    return out;
  }
  return out;
};
const SURFACES = {
  "op=contentmint": marked,
  "op=content": await get("content", `id=${MACHINE_ROW}`, RUTH),
  "op=earnedbasis": await get("earnedbasis", `id=${INQ}`, RUTH),
  "op=promote": rInq,
};
const PUBLISHED = new Set(Object.values(CONTENT_MINT_STATES));
const unlabelled = [], corpus = {};
for (const [name, answer] of Object.entries(SURFACES)) {
  const rows = rowsIn(answer);
  corpus[name] = rows.length;
  for (const r of rows)
    if (!r.mint || typeof r.mint.state !== "string" || !PUBLISHED.has(r.mint.says)
        || r.mint.by !== r.minted_by)
      unlabelled.push(`${name}:${r.content_id.slice(0, 8)}`);
}
console.log(`         corpus walked: ${JSON.stringify(corpus)} — ${Object.values(corpus).reduce((a, b) => a + b, 0)} content-row object(s) across ${Object.keys(SURFACES).length} surface(s)`);
t("THE CORPUS IS NON-EMPTY AND EVERY SURFACE CONTRIBUTED — a totality over nothing reports clean, "
+ "and three headline assertions in this repository have passed over an empty one",
  [Object.values(corpus).every((n) => n > 0), Object.values(corpus).reduce((a, b) => a + b, 0) >= 6],
  [true, true]);
t("AND NOT ONE CONTENT ROW REACHED A CALLER UNLABELLED — the surface is NAMED if it did, so a "
+ "label dropped from one of them says WHICH rather than moving a count",
  unlabelled, []);
t("the sentence each surface carries is the PUBLISHED one, never composed at the site — "
+ "op=affordances hands a surface the same four strings",
  (await get("affordances", "", RUTH)).vocabularies?.content_mint_states, CONTENT_MINT_STATES);
/* EVERY `mint` READ IN THIS SUITE IS OPTIONAL-CHAINED, and that is not style.
   REC-82's `overstrict` arm and REC-83's `unwired` arm both reported `-1 pass /
   -1 fail` because a suite indexed a field an arm had removed and THREW — no
   assertion ran, the module ended, and the control reported the wrong thing
   about the wrong arm. This suite's `label` arm removes exactly such a field,
   so every read of it must FAIL BY NAME instead of ending the run. Third
   occurrence of one shape in three items; paid once more here rather than
   rediscovered. */
t("and the machine-minted row says out loud what it is, on the read a member reaches it by",
  [SURFACES["op=content"]?.mint?.state ?? null, SURFACES["op=content"]?.mint?.machine_work ?? null,
   /machine work/.test(SURFACES["op=content"]?.mint?.says ?? ""),
   /until a member cites it/.test(SURFACES["op=content"]?.mint?.says ?? "")],
  ["machine_marked", true, true, true]);
/* THE NARROWING, MEASURED. `op=earnedbasis`' basis legs carry a content id and
   no `minted_by`, which is what makes them pointers rather than rows — and the
   walk above skips exactly those. Asserted here so the predicate's boundary is
   a fact this suite establishes rather than a claim its comment makes: if a leg
   ever starts carrying the stored identity, it joins the totality automatically
   and this assertion is what says it changed. */
const pointers = Object.entries(SURFACES).flatMap(([n, a]) => pointersIn(a).map(() => n));
console.log(`         pointers (a content id and no stored identity): ${pointers.length} — ${JSON.stringify([...new Set(pointers)])}`);
t("the objects the walk SKIPS are pointers and only pointers — a content id with no `minted_by` "
+ "on it, which is a reference to a row rather than a rendering of one",
  [pointers.length > 0, [...new Set(pointers)]], [true, ["op=earnedbasis"]]);

/* ================= 4. NEVER ATTESTED BY IT ============================= */

console.log("\n--- 4. clause 3: the minter can NEVER attest — C-35.10, and the fence it took a measurement to make real ---");

/* THE MEASUREMENT THAT EARNED THIS SECTION, recorded because the fence LOOKED
 * present and was not. `op=attesttext` read its attestor from the request BODY.
 * C-35.10 refuses a MACHINE IDENTITY, so it fired only when a caller
 * volunteered one — and a caller that wants to attest never does. Driven
 * through a REAL minted `ai` credential on the pre-SK-7 tree:
 *     member: "class:ai"     -> refused        (the one spelling every suite drove)
 *     member: "ruth"         -> ATTESTATION LANDED, attributed to ruth
 *     member: "member:ruth"  -> LANDED, at an attestor string no member has
 * and the MEMBER_TOKEN machine credential did the same. `content-extent.test.mjs`
 * carried the belief that an op-level arm was impossible here — *"driving it
 * through op=attesttext with a machine token answers NOT_AUTHENTICATED before
 * checkAttestation is ever reached"* — which was measured with a token that was
 * not a credential at all. SK-7 stamps the attestor server-side, so the store is
 * handed the CLASS and C-35.10 refuses by name whatever the body says. */
const ATTESTER = await mintCred(["contentmint", "attesttext"], "would-be-attester");
const attestAs = (who, tok) => post("attesttext",
  { captureSha: SHA_DOC, member: who, at: NOW, extent: { kind: "document" } }, tok);
for (const [who, why] of [["ruth", "naming a real member"],
                          ["member:ruth", "naming a principal string"],
                          ["class:ai", "naming itself"],
                          ["", "naming nobody"]]) {
  const r = await attestAs(who, ATTESTER.token);
  t(`the assistant's own credential cannot attest, ${why} — refused BY NAME`,
    [r.ok, r.code, r.check], [false, "TEXT_ATTEST_MACHINE", "C-35.10"]);
}
t("and the refusal names the CLASS it was stamped as, never the name it asked to borrow",
  /class:ai/.test((await attestAs("ruth", ATTESTER.token)).detail || ""), true);
for (const [tok, label] of [["mem-sk7", "the MEMBER_TOKEN credential"],
                            ["adm-sk7", "the ADMIN_TOKEN root of trust"]]) {
  const r = await attestAs("ruth", tok);
  t(`${label} is refused the same way — being a machine is the fact, not which machine`,
    [r.ok, r.code], [false, "TEXT_ATTEST_MACHINE"]);
}
/* THE OTHER DIRECTION, held open so the fence is not simply "nothing works":
   a signed-in member attests, and is attributed to HERSELF however the body is
   filled in. Without this half an arm that broke attestation entirely would
   read as a pass. */
const memberAttest = await attestAs("somebody-else", RUTH);
t("A MEMBER ATTESTS AND THE ACT LANDS, attributed to the signed-in member and never to the "
+ "name in the body — the impostor rule at the field where it matters most",
  [memberAttest.ok, memberAttest.attestor], [true, "ruth"]);
t("and the machine-minted row is now COVERED by a member's attestation, which raises what a leg "
+ "citing it may claim — the machine laid the passage out, the member checked it",
  (await get("content", `id=${MACHINE_ROW}`, RUTH)).transcription?.determinant, "attestation");
t("while the row still says a machine marked it — attesting does not relabel who marked it citable",
  (await get("content", `id=${MACHINE_ROW}`, RUTH))?.mint?.state ?? null, "machine_marked");

/* ================= 5. IN A FINDING ONLY WHEN A MEMBER CITES IT ========= */

console.log("\n--- 5. clause 4: absent from findings until a member cites it — driven in BOTH directions ---");

/* A ROW NOBODY CITED. The assistant marks a SECOND passage and no basis names
   it; `op=earnedbasis` for the inquiry must not know it exists. */
const LONE_EXTENT = { kind: "pdf-page", page: 2, rect: [72, 100, 540, 200], ref: "page 3, the footnote" };
const lone = await post("contentmint", { bundleId: DOC, extent: LONE_EXTENT }, AK);
t("the assistant marks a second passage citable, on its own initiative", lone.ok, true);
const ebNow = await get("earnedbasis", `id=${INQ}`, RUTH);
const inFinding = Object.keys(ebNow.earned?.content || {});
t("AND IT IS ABSENT FROM THE FINDING — the registry answers only over the rows the inquiry's own "
+ "legs name, so a passage nobody cited earns nothing and appears nowhere",
  [inFinding.includes(lone.content_id), inFinding.length > 0], [false, true]);
t("the row itself is perfectly readable by its id, which is the point: it EXISTS and is offered, "
+ "it is simply not part of anybody's case",
  (await get("content", `id=${lone.content_id}`, RUTH)).ok, true);

/* NOW A MEMBER CITES IT — and the id being a hash is what makes the machine's
   row the one the citation lands on, keeping `minted_by` and `at` (REC-82's
   INSERT OR IGNORE, and this is the behaviour that makes 5.7 coherent: the
   label travels INTO the finding rather than being lost at the door). */
const rCite = await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, rect: [72, 600, 540, 720],
           eref: "page 2, the transfer table" },
         { target: DOC, kind: "pdf-page", page: 2, rect: [72, 100, 540, 200],
           eref: "page 3, the footnote" }] }), "inquiry");
const cited = (rCite.content || []).find((c) => c.content_id === lone.content_id);
t("A MEMBER'S OWN LEG NAMES THE SAME PASSAGE AND FINDS THE ASSISTANT'S ROW — one row, not two, "
+ "because the address is hash(capture, extent, chain) and there is no allocator",
  [!!cited, cited?.minted, cited?.carried], [true, false, false]);
t("AND THE FINDING CARRIES THE MACHINE LABEL WITH IT — the member cited it, the assistant marked "
+ "it, and the record says both",
  [cited?.minted_by, cited?.mint?.state ?? null], ["class:ai/extractor", "machine_marked"]);
const ebAfter = await get("earnedbasis", `id=${INQ}`, RUTH);
t("it is now IN the finding, and labelled there too",
  [Object.keys(ebAfter.earned.content).includes(lone.content_id),
   ebAfter.earned.content[lone.content_id]?.mint?.state ?? null], [true, "machine_marked"]);

/* ================= 6. THE READING IS TOTAL ============================= */

console.log("\n--- 6. four states, and the reading of `minted_by` is total rather than a machine/not-machine flag ---");

t("the PLANE's own mint is NOT machine work, and that distinction is the load-bearing one — a row "
+ "minted at promote is the referent of a citation A MEMBER AUTHORED",
  [contentMintState(CONTENT_MINTED_BY_PLANE), isMachineMinted(CONTENT_MINTED_BY_PLANE)],
  ["plane_minted", false]);
t("and the plane's own value is not a machine identity by the record's own predicate, so the "
+ "ordering in the classifier is belt and braces rather than the only thing holding it apart",
  isMachineIdentity(CONTENT_MINTED_BY_PLANE), false);
t("every spelling the control plane mints for a machine reads `machine`",
  ["class:ai/extractor", "class:ai", "class:member", "class:admin", "token:member", "agent"]
    .map(contentMintState),
  ["machine_marked", "machine_marked", "machine_marked", "machine_marked", "machine_marked",
   "machine_marked"]);
t("a member's handle reads `member`, and a blank reads `unstated` — *nobody said* and *a machine "
+ "said* are different findings and neither is a gap",
  [contentMintState("ruth"), contentMintState(""), contentMintState(null),
   contentMintState(undefined)],
  ["member_marked", "unstated", "unstated", "unstated"]);
t("the four states are exactly the four the plane publishes — a fifth state with no sentence "
+ "would reach a surface as `undefined`",
  Object.keys(CONTENT_MINT_STATES).sort(),
  ["machine_marked", "member_marked", "plane_minted", "unstated"]);

/* THE OVER-STRICTNESS PIN. A row minted the way EVERY row was minted before this
   item — at promotion, by the plane, as the referent of a member's own citation
   — must answer exactly as it did, and the arm `overstrict` in `nc-sk7.mjs`
   breaks precisely that. The `mint` block is the ONE field this item adds, and
   it is compared separately so the pin is about what did NOT move. */
/* A DOCUMENT NOBODY MARKED, CITED WHOLE — the ONLY shape that existed before
   this item, and therefore the only honest subject for the over-strictness pin.
   `DOC`'s own `document` row will not do: section 1 had a MEMBER mint it by
   hand, which is a thing this item made possible. The suite's first draft used
   it and the pin caught the mistake — recorded rather than smoothed, because it
   is the same class as the arm itself (a row relabelled by a new writer). */
const PLAIN = "INFO-2026-8704-plainly-cited";
const SHA_PLAIN = sha("sk7-a-document-only-a-member-ever-cited");
await promote(PLAIN, infoMd(PLAIN), "information", {
  reading: { capture: { sha256: SHA_PLAIN, encoding: "binary", bytes: 10 },
             reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
                        entities: [], facts: {}, text_source: CHAIN } },
  register: [{ path: "snapshots/p.bin", sha256: SHA_PLAIN, encoding: "binary", bytes: 10 }] });
const INQ_PLAIN = "INQ-2026-8704-plain";
const rPlain = await promote(INQ_PLAIN, inquiryMd(INQ_PLAIN, { subject: ORD, refs: [PLAIN],
  legs: [{ target: PLAIN }] }), "inquiry");
const docLeg = (rPlain.content || []).find((c) => c.extent_kind === "document");
t("A PLANE-MINTED ROW IS UNMOVED: it still carries the plane's own minter and reads as the member's "
+ "own citation, not as machine work",
  [docLeg.minted_by, docLeg?.mint?.state ?? null, docLeg?.mint?.machine_work ?? null],
  [CONTENT_MINTED_BY_PLANE, "plane_minted", false]);
const ebPlain = await get("earnedbasis", `id=${INQ_PLAIN}`, RUTH);
const ebDoc = ebPlain.earned.content[docLeg.content_id];
const { mint: _mintBlock, ...ebDocWithoutLabel } = ebDoc;
t("and its earned-basis answer, with this item's one new field removed, carries every field "
+ "REC-83 landed and nothing else — the label ADDS, it does not rewrite",
  Object.keys(ebDocWithoutLabel).sort(),
  /* CORRECTED BY FW-19 (IC-125), NOT EXEMPTED: `cited_as` joins the roster —
     text | bytes, the column that says what a NULL chain and cap on a row MEAN.
     The point this asserts survives exactly: the mint label ADDS and rewrites
     nothing, and every field REC-83 landed is still here, unrenamed. */
  ["at", "bundle_id", "capture", "capture_sha", "chain", "cited_as", "connection", "content_id",
   "derivation_cap", "extent", "extent_kind", "minted_by", "page_count", "ref", "says",
   "stale", "transcription"]);

/* ================= 7. D-15 AT THE DOOR ================================ */

console.log("\n--- 7. D-15 at a WRITE: the stamp is not decorative, and what it actually fences ---");

/* CORRECTED AFTER THE FIRST DRAFT, AND THE CORRECTION IS THE FINDING.
 *
 * This section first tried to prove the sharper thing: an ordinary member who
 * was never invited to a project must not be able to learn that a document in
 * it exists by trying to mark a page of it. THE ARM DID NOT ARM. `linkproject`
 * answered `NEED_CAPTURE` and the fixture's document was never inside the
 * project at all, so the member's mint SUCCEEDED and the assertion read as a
 * gate failure. Chasing it produced the real answer, which is a fact about the
 * model rather than about this door: **a DOCUMENT is shared evidence.**
 * Membership Architecture 7.9, in `aicredential.test.mjs`' own words — *what
 * participation scopes is the group's THINKING, not its evidence* — so every
 * member of the group sees every information bundle, and there is no such thing
 * as a document one member can mark and another cannot see. An arm asserting
 * otherwise would have been asserting a fence tighter than its rule.
 *
 * WHAT THE STAMP THEREFORE FENCES, and it is driven rather than dropped: the
 * FAIL-CLOSED direction. `viewerPredicate`'s deny arm makes an absent or
 * unrecognised viewer see NOTHING, so a route that skipped the control plane's
 * stamp is an OUTAGE and never a leak — which is the property that will still
 * be load-bearing when stage C's content-grain query arrives, and the property
 * REC-83 drove one read over. Same shape, same namespace trick: the probe class
 * reaches its own scratch Durable Object, which holds neither bundle, so both
 * answers must be indistinguishable. */
const probeHere = await post("contentmint", { bundleId: DOC, extent: { kind: "document" } }, "prb-sk7");
const probeNowhere = await post("contentmint", { bundleId: "INFO-2026-9999-never-existed",
                                                 extent: { kind: "document" } }, "prb-sk7");
t("FROM A NAMESPACE HOLDING NEITHER, a document that exists elsewhere and one that exists nowhere "
+ "answer identically — no field distinguishes them, so the door is not an oracle",
  [probeHere.reason, probeNowhere.reason,
   JSON.stringify({ ...probeHere, target: null, detail: null }),
   Object.keys(probeHere).sort().join()],
  ["NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE",
   JSON.stringify({ ...probeNowhere, target: null, detail: null }),
   Object.keys(probeNowhere).sort().join()]);
t("and NOTHING WAS WRITTEN for either — a refused mint mints no row",
  (await get("content", `id=${contentIdFor(SHA_DOC, { kind: "document" }, CHAIN)}`, "prb-sk7")).reason,
  "NO_SUCH_CONTENT");
/* AND THE OTHER DIRECTION, so the arm above is not simply "the probe can do
   nothing": the same credential mints perfectly well against a document its own
   namespace holds. Without this half, a gate that refused everything would read
   as a pass. */
t("while an ORDINARY MEMBER marks a passage of the shared evidence corpus without obstruction — "
+ "7.9 scopes the group's thinking, never its documents",
  (await post("contentmint", { bundleId: DOC, extent: { kind: "pdf-page", page: 0, ref: "page 1" } },
              NELL)).ok, true);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail++;
} finally {
  await mf.dispose();
}

/* THE FOOT. A TypeError inside an assertion goes through no assertion at all and
   ends the module while the tally reads clean, so this line existing at all is
   part of what the count means (WORKER.md's receipt; REC-82's `overstrict` arm
   and REC-83's `unwired` arm both met it). */
console.log(`\n  ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
