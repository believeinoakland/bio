/* NEGATIVE CONTROL: the seven arms live in `test/nc-rec97.mjs` and are re-run in one step with `node test/nc-rec97.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, EVERY ONE RUN, and ALL SEVEN CAME BACK AS DECLARED on 2026-09-14 after two of them corrected this suite rather than the subject (both recorded at their sites). (a) `baseline` - nothing armed; 46 pass, 0 fail. It is the row that distinguishes seven-arms-working from seven-arms-broken. (b) `splice` - THE ITEM'S OWN CONTROL, the silent drop reproduced: `Store.#legExtentLines` returns [] always, so the act accepts the extent, refuses nothing and writes NOTHING into the bytes -> 36 pass, 10 fail, 6/6 declared, led by "the leg is in the document's own bytes and carries the extent"; every refusal arm stayed green (they fire before the splice) and so did the byte-identity pin. (c) `bag` - the `cite:` dispatch passes `{}`, which IS the pre-item plane -> 19 pass, 27 fail, 4/4 declared, INCLUDING the UNKNOWN_EXTENT_FIELD arm: a field that never arrives cannot be refused by name, which is the mechanism this item closes rather than the spelling. (d) `unknown` - the UNKNOWN_EXTENT_FIELD refusal neutered -> 40 pass, 6 fail, 2/2 declared. THIS ARM CORRECTED THE SUITE: its first fixture misspelled the REQUIRED field, so the grammar caught the now-missing page and the drop was invisible; the fixture is now a COMPLETE legal extent plus one unknown field, which is the only shape in which a silent drop can be seen. (e) `many` - the EXTENT_ON_MANY refusal neutered -> 42 pass, 4 fail, 2/2 declared; one member's one page lands on two legs. (f) `grammar` - `checkLegExtentGrammar` returns immediately at BOTH gates -> 43 pass, 3 fail, 2/2 declared. THIS ARM ALSO CORRECTED THE SUITE, and its finding is the more useful half: `dom`, an unknown kind and an unparseable page are STILL refused with the SAME code, because the STORE calls the same checker itself - two gates, one function. What does not survive is what only the catalogue knows about a DOCUMENT (an id that is not shaped like one, a leg stating its referent twice), so those two assertions now pin the catalogue's own sentence instead of the bare verdict. (g) `overstrict` - THE OVER-STRICTNESS DIRECTION: the act refuses a cite naming NO part at all -> 37 pass, 9 fail, 4/4 declared, and REC-37's own `citeinquiry.test.mjs` goes red with it. `cite.test.mjs` is run beside it as a MUST-PASS control and stayed green at 73/0 - not a weak arm but a precise one: that suite drives the CASE arm, where this condition cannot fire. An absent extent IS the whole document (Bob's 5.3, no `unstated`), and a fence tighter than its rule is not a safer fence. */
/* REC-97 / IC-90 — `op=cite` CARRIES THE EXTENT, END TO END.
 *
 * WHAT WAS WRONG, MEASURED BY UI-61 AND NOT INFERRED. `op=cite` is the ONE act
 * that writes a basis leg. It destructured seven named parameters — project,
 * handle, viewer, owner, note, author, role — and an `extent_kind` sent beside
 * them was DROPPED IN SILENCE. A member who chose a page got a leg resting on
 * the WHOLE DOCUMENT with nothing on the leg, in the receipt or in the record
 * saying the choice went nowhere. That is the worst class of defect this project
 * names: the record holding something other than what a member did. It is also
 * why UI-61 could not build the composer's picker, and why IC-84 could not
 * SETTLE — its RESOLUTION records UI as answering "the composer emits `extent`
 * per leg", and the composer could not.
 *
 * WHAT THIS SUITE HOLDS THE IMPLEMENTATION TO:
 *
 *   1. END TO END, THROUGH THE OP. A member cites a page of a PDF through
 *      `op=cite` and the leg lands IN THE DOCUMENT'S OWN BYTES carrying the
 *      extent, mints a content row, and reads back through `op=earnedbasis`
 *      WITH ITS `ref`. Asserted from the bytes (the authority) and from the
 *      read (what a surface can actually reach) — never from the act's echo of
 *      its own parameters, which costs nothing to produce.
 *   2. ALL FOUR PORTION ARMS, NOT ONLY `pdf-page`. REC-85 landed `sheet-cell`,
 *      `doc-para` and `slide-shape` in the grammar the day before this item, so
 *      an act that carried one arm would be a fence tighter than its rule.
 *   3. TYPES SURVIVE THE ROUND TRIP. A wire scalar is a STRING and the grammar
 *      requires an INTEGER page, a four-number rect and a string sheet. What the
 *      catalogue reads back out of the bytes this act wrote is asserted to be
 *      the typed value, because a page that comes back as `"1"` is refused and a
 *      sheet named `12` that comes back as `12` is silently no sheet at all.
 *   4. EVERY REFUSAL BY NAME, AND THE TWO GATES KEPT APART. The ACT refuses what
 *      only it can know (a field it does not carry, an extent on a case, one
 *      extent across several legs, a value the frontmatter grammar cannot hold);
 *      the CATALOGUE refuses the grammar (an unlanded kind, `dom`, an
 *      unparseable page, a leg naming both an id and an extent) under promote's
 *      own name `BASIS_REFUSED`; and the STORE refuses what only the record
 *      holds (a part of an INQUIRY, a content id naming no row). A suite that
 *      asserted only "refused" could not tell which gate fired, and the split is
 *      the thing most likely to collapse in a later edit.
 *   5. NOTHING IS DROPPED, EVER — including where nothing is written. A cite
 *      whose targets were all already cited SAYS that the part it named went
 *      nowhere, rather than returning a bare success.
 *   6. OVER-STRICTNESS: A CITE WITH NO EXTENT IS UNCHANGED. Pinned by DIGEST
 *      against a figure measured on a PRISTINE worktree by
 *      `test/rec97-noextent-digest.mjs`, which is a NON-suite instrument for
 *      exactly that reason — it has to be runnable against a tree that does not
 *      contain this item.
 *
 * Everything is driven THROUGH the control plane (`op=…`, a real caller's only
 * route): a store-level test and a passing battery are not evidence that a
 * caller can reach a feature — `op=invitelook` shipped with a ReferenceError
 * beside 1,276 green assertions.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter, legExtent, legHasAuthoredExtent, legContentId,
         CONTENT_EXTENT_KINDS, CONTENT_EXTENT_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r97", MEMBER_TOKEN: "mem-r97", PROBE_TOKEN: "prb-r97", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const ok_ = (label, cond, note = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}${cond ? "" : `\n         ${note}`}`);
  cond ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r97") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r97") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

const inquiryMd = (id, { question = `What does ${id} rest on?` } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
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
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7);
   creation bytes carry no `id:` line (PROJECT_ID_IN_BYTES) and the creation names no bundleId
   (PROJECT_ID_SUPPLIED). `name` keeps the title the chosen id used to give it. */
const projectMd = (id, name = id) => ["---",
  ...(id ? [`id: ${id}`] : []), "object_type: project", "schema: project@1",
  `title: "Case ${name}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A case.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, { reading = null, register = [], name = id } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    ...(id != null ? { bundleId: id } : {}), base: null,
    snapKey: `20260914T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, ...a) => {
  const r = await promote(id, ...a);
  if (r.ok === false || (id == null && !r.bundleId)) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const selectIds = async (ids) => {
  const r = await post("select", { ids }, "mem-r97");
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};
/* THE ACT, through the control plane and nothing else. `extra` is raw query
   string so a caller can send a field the act does not carry — which is half of
   what this suite is about and is unreachable through a typed helper. */
const cite = async (project, ids, extra = "") =>
  get("cite", `project=${project}&handle=${await selectIds(ids)}${extra}`);

const imageOf = async (id) => (await get("image", `id=${id}`))["bundle.md"];
const docLegs = async (id) => parseFrontmatter(await imageOf(id)).data.basis ?? [];

const scopedChain = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
const readingOf = (captureSha, chain) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {}, text_source: chain } });

/* ===================== 0. THE GROUND ==================================== */
console.log("--- 0. the ground: captured documents with chains, four questions and a case ---");

const DOCS = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta"]
  .map((n) => `INFO-2026-9700-${n}`);
for (const d of DOCS)
  await mustPromote(d, infoMd(d), "information",
    { reading: readingOf(sha(`rec97-${d}`), scopedChain([0, 1, 2])) });

const Q = (n) => `INQ-2026-9700-${n}`;
for (const n of ["page", "arms", "refuse", "named", "again", "plain", "already"])
  await mustPromote(Q(n), inquiryMd(Q(n)), "inquiry");
const INQ_TARGET = "INQ-2026-9700-target";
await mustPromote(INQ_TARGET, inquiryMd(INQ_TARGET), "inquiry");
/* CORRECTED 2026-09-18 (REC-141): the case's id is minted and read from the answer. */
const CASE = (await mustPromote(null, projectMd(null, "PROJ-2026-9700-case"), "project",
  { name: "PROJ-2026-9700-case" })).bundleId;

/* THE CORPUS, PRINTED AND FLOORED. A headline assertion over an empty fixture
   has passed three times in this repository. */
console.log(`  corpus: ${DOCS.length} captured documents (3-page sets, chain cap C) + 8 questions `
          + `+ 1 case; extent kinds in the grammar: ${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`);
/* CORRECTED BY FW-19 (IC-125), NOT EXEMPTED: the floor read `=== 5`, exact
   until `sheet-range`, `doc-table` and `image` landed. Section 2 below still
   drives the FIVE kinds REC-97 was written for; FW-19's three go through this
   same act in `fw19-extent-arms.test.mjs`, which is where the act's widened
   `EXTENT_PARAMS` is asserted — so between the two suites the act reaches every
   landed kind, and this floor says how many there are. */
/* CORRECTED BY REC-204, NOT EXEMPTED: `=== 8` was exact until the NINTH kind,
   `envelope`, landed (OFFICE-FORMATS.md "THE ENVELOPE AS CONTENT"). It is not
   an arm of this act — a leg carries no envelope fields yet — and is driven
   through `op=contentmint` and the passage arm in `search.test.mjs` Phase 4;
   the floor still says how many kinds the grammar lands. */
ok_("the fixture is non-empty and reaches every landed extent kind",
  DOCS.length >= 7 && Object.values(CONTENT_EXTENT_KINDS).filter((v) => v.landed).length === 9,
  `docs=${DOCS.length} landed kinds=${Object.values(CONTENT_EXTENT_KINDS).filter((v) => v.landed).length}`);
t("the ground holds no content rows yet — nothing has cited anything", (await get("stats")).content, 0);

/* ===================== 1. END TO END, THROUGH THE OP ==================== */
console.log("\n--- 1. a member cites A PAGE through op=cite, and the record holds the page ---");

const REF = "page 2, the transfer table";
const r1 = await cite(Q("page"), [DOCS[0]],
  `&role=supports&extent_kind=pdf-page&extent_page=1&extent_rect=10,20,100,200`
  + `&extent_ref=${encodeURIComponent(REF)}`);
t("the act is ACCEPTED and cites the document", [r1.ok, r1.cited], [true, [DOCS[0]]]);

/* THE BYTES ARE THE AUTHORITY. `inquiry_basis` is a projection of `basis[]`
   (D-21), so what the act WROTE is what the document says — not what the act
   said it wrote. */
const legs1 = await docLegs(Q("page"));
t("the leg is in the document's own bytes and carries the extent",
  legs1.map((l) => [l.target, l.extent_kind, l.extent_page, l.extent_rect, l.extent_ref]),
  [[DOCS[0], "pdf-page", 1, [10, 20, 100, 200], REF]]);
/* TYPES SURVIVE THE ROUND TRIP, and this is the assertion a wire-scalar act can
   most easily fail: the page arrived as the STRING "1" and the grammar requires
   an integer. What `legExtent` reads back out of the bytes is what the checker
   will judge, so it is read with the checker's own function. */
const e1 = legExtent(legs1[0]);
t("the catalogue reads the leg back as a TYPED extent — the page an integer, the rect four numbers",
  [e1.kind, e1.page, e1.rect, e1.ref, typeof e1.page, Array.isArray(e1.rect)],
  ["pdf-page", 1, [10, 20, 100, 200], REF, "number", true]);
ok_("and the document says a member AUTHORED an extent, which is a different fact from meaning one",
  legHasAuthoredExtent(legs1[0]) === true);

t("the act minted exactly one content row for it", (await get("stats")).content, 1);

/* THE READ A SURFACE ACTUALLY REACHES — the item's own accepts-when. */
const EB1 = await get("earnedbasis", `id=${Q("page")}`);
const row1 = (EB1.earned && EB1.earned.content || {})[(EB1.legs || [])[0]?.content_id];
t("op=earnedbasis reads the leg back at content grain, with the member's own `ref`",
  [EB1.ok, (EB1.legs || []).length, row1 && row1.extent_kind, row1 && row1.ref],
  [true, 1, "pdf-page", REF]);
ok_("the receipt states what the RECORD wrote, per leg, rather than echoing the request",
  r1.legs && r1.legs.length === 1 && r1.legs[0].extent
  && r1.legs[0].extent.kind === "pdf-page" && r1.legs[0].extent.page === 1,
  JSON.stringify(r1.legs));

/* ===================== 2. ALL FOUR PORTION ARMS ========================= */
console.log("\n--- 2. every PORTION arm the grammar landed, not only pdf-page ---");

const ARMS = [
  ["sheet-cell", `&extent_kind=sheet-cell&extent_sheet=${encodeURIComponent("Fund Transfers")}&extent_cell=B14`,
   { kind: "sheet-cell", sheet: "Fund Transfers", cell: "B14" }],
  ["doc-para", `&extent_kind=doc-para&extent_para=4&extent_run=1`,
   { kind: "doc-para", para: 4, run: 1 }],
  ["slide-shape", `&extent_kind=slide-shape&extent_slide=7&extent_shape=2`,
   { kind: "slide-shape", slide: 7, shape: 2 }],
  ["document", `&extent_kind=document`, { kind: "document" }],
];
for (let i = 0; i < ARMS.length; i++) {
  const [kind, qs, want] = ARMS[i];
  const r = await cite(Q("arms"), [DOCS[i + 1]], `&role=supports${qs}`);
  ok_(`a ${kind} citation is ACCEPTED through the act`, r.ok === true, JSON.stringify(r).slice(0, 300));
}
const legsArms = await docLegs(Q("arms"));
t("each arm landed in the bytes as the grammar's own typed extent",
  legsArms.map((l) => legExtent(l)),
  ARMS.map(([, , want]) => want));
t("four legs, four content rows — one address, one row (the pdf-page row above makes five)",
  (await get("stats")).content, 5);

/* ===================== 3. THE ACT'S OWN REFUSALS ======================== */
console.log("\n--- 3. what only the ACT can know, refused BY NAME and never dropped ---");

/* THE FIXTURE IS A COMPLETE, LEGAL EXTENT PLUS ONE UNKNOWN FIELD, and that is a
   correction the negative control forced rather than a first draft. The first
   version misspelled the REQUIRED field (`extent_pge` with no `extent_page`),
   so with the UNKNOWN_EXTENT_FIELD refusal neutered the act still refused —
   the grammar caught the now-missing page — and the control's second declared
   failure did not fire. That measured the wrong thing: the defect this arm is
   about is a field SILENTLY DROPPED, and a drop is only visible when everything
   else about the citation is valid. With a legal `pdf-page` beside it, the
   neutered act writes a leg that looks exactly like the one the member asked
   for and is missing what they said — which is the whole item in one line. */
const rUnknown = await cite(Q("refuse"), [DOCS[5]],
  `&role=supports&extent_kind=pdf-page&extent_page=1&extent_reff=${encodeURIComponent("see page 2")}`);
t("a field the act does not carry is refused BY NAME, naming the field and the ones it takes",
  [rUnknown.ok, rUnknown.reason, rUnknown.got,
   Array.isArray(rUnknown.fields) && rUnknown.fields.includes("extent_page")],
  [false, "UNKNOWN_EXTENT_FIELD", ["extent_reff"], true]);
t("and it wrote nothing — a refused act leaves the question exactly as it was",
  (await docLegs(Q("refuse"))).length, 0);

const rCase = await cite(CASE, [DOCS[5]], `&extent_kind=pdf-page&extent_page=1`);
t("an extent on a CASE's citation edge is refused BY NAME, exactly as a role is",
  [rCase.ok, rCase.reason], [false, "EXTENT_NOT_APPLICABLE"]);
t("and the case's own references are untouched",
  parseFrontmatter(await imageOf(CASE)).data.references, []);

const rMany = await cite(Q("refuse"), [DOCS[5], DOCS[6]], `&role=supports&extent_kind=pdf-page&extent_page=1`);
t("ONE extent across a selection that would write SEVERAL legs is refused, naming them",
  [rMany.ok, rMany.reason, rMany.offenders], [false, "EXTENT_ON_MANY", [DOCS[5], DOCS[6]].sort()]);

const rQuote = await cite(Q("refuse"), [DOCS[5]],
  `&role=supports&extent_kind=pdf-page&extent_page=1&extent_ref=${encodeURIComponent('he said "page 2"')}`);
t("a value the restricted frontmatter grammar cannot carry is DECLINED, not mangled",
  [rQuote.ok, rQuote.reason, rQuote.field], [false, "BAD_EXTENT_VALUE", "extent_ref"]);
const rLong = await cite(Q("refuse"), [DOCS[5]],
  `&role=supports&extent_kind=pdf-page&extent_page=1&extent_ref=${"x".repeat(201)}`);
t("and so is one over the length bound", [rLong.ok, rLong.reason], [false, "BAD_EXTENT_VALUE"]);

/* OVER-STRICTNESS INSIDE THE ACT'S OWN ARMS: an EMPTY field is not an authored
   one, exactly as the document reads it. A surface that always sends the keys
   must not be refused for sending them blank. */
const rEmpty = await cite(Q("plain"), [DOCS[5]],
  `&role=supports&extent_kind=&extent_page=&extent_ref=`);
t("OVER-STRICTNESS: empty extent fields are NOT an authored extent and are not refused",
  [rEmpty.ok, rEmpty.cited], [true, [DOCS[5]]]);
t("and the leg they wrote carries no extent at all — absent IS the whole document (Bob's 5.3)",
  (await docLegs(Q("plain"))).map((l) => [legHasAuthoredExtent(l), legExtent(l).kind]),
  [[false, "document"]]);   /* null-tolerant by construction: an empty list maps to [] and REPORTS */
const rEmptyCase = await cite(CASE, [DOCS[6]], `&extent_kind=`);
t("OVER-STRICTNESS: an empty extent field on the CASE arm is not refused either",
  [rEmptyCase.ok, rEmptyCase.cited], [true, [DOCS[6]]]);

/* THE FOUR NEW RULES, NAMED BY THEIR C-NUMBER AND NOT ONLY BY THEIR CODE.
   `coverage.mjs` grades a check as NAMED only where an assertion names the
   C-number, and a check nobody names is exercised only in the direction that
   passes — the C-20.1 defect class, "the audit was clean because it was not
   looking". So the pairing every DEC-49 row owes is asserted here: the rule, the
   governed SITE the guard goes and reads, and a translation that exists. The
   CODE is what a member's surface keys on and is asserted at each refusal above;
   the C-NUMBER is the rule, and this is where it is pinned. */
t("C-45.7 / C-45.8 / C-45.9 / C-45.10 are rows of the content-extent family, each naming the act's own governed region",
  ["UNKNOWN_EXTENT_FIELD", "EXTENT_NOT_APPLICABLE", "EXTENT_ON_MANY", "BAD_EXTENT_VALUE"]
    .map((k) => { const r = CONTENT_EXTENT_CHECKS[k] || {};
                  return [k, r.check, r.where, typeof r.translation === "string" && r.translation.length > 120]; }),
  [["UNKNOWN_EXTENT_FIELD", "C-45.7", "src/store.mjs cite > is-cite-extent", true],
   ["EXTENT_NOT_APPLICABLE", "C-45.8", "src/store.mjs cite > is-cite-extent", true],
   ["EXTENT_ON_MANY", "C-45.9", "src/store.mjs cite > is-cite-extent", true],
   ["BAD_EXTENT_VALUE", "C-45.10", "src/store.mjs cite > is-cite-extent", true]]);

/* ===================== 4. THE CATALOGUE'S GATE ========================== */
console.log("\n--- 4. the GRAMMAR's verdict, under promote's own name and with its own codes ---");

const codesOf = (r) => (r.findings || []).map((f) => f.code).sort();
const rDom = await cite(Q("refuse"), [DOCS[5]], `&role=supports&extent_kind=dom`);
t("`dom` is refused BY NAME as having no producer — not as an unknown kind",
  [rDom.ok, rDom.reason, codesOf(rDom)], [false, "BASIS_REFUSED", ["CONTENT_EXTENT_NO_PRODUCER"]]);
const rBadKind = await cite(Q("refuse"), [DOCS[5]], `&role=supports&extent_kind=banana`);
t("a kind the grammar does not name is refused as unreadable",
  [rBadKind.ok, rBadKind.reason, codesOf(rBadKind)],
  [false, "BASIS_REFUSED", ["CONTENT_EXTENT_UNREADABLE"]]);
const rBadPage = await cite(Q("refuse"), [DOCS[5]], `&role=supports&extent_kind=pdf-page&extent_page=abc`);
t("a page that is not an integer is refused, in the catalogue's own sentence",
  [rBadPage.ok, rBadPage.reason, codesOf(rBadPage)],
  [false, "BASIS_REFUSED", ["CONTENT_EXTENT_UNREADABLE"]]);
ok_("and the refusal carries the catalogue's own REPAIRS, so a member is told what right is",
  ((rBadPage.findings || [])[0]?.repairs || []).length > 0,
  JSON.stringify((rBadPage.findings || [])[0]));
/* THE TWO ASSERTIONS BELOW PIN THE CATALOGUE'S OWN SENTENCE AND NOT MERELY
   "refused", and that is a correction this suite paid for rather than a style.
   The negative control's `grammar` arm came back GREEN on its first run: with
   `checkLegExtentGrammar` neutered, BOTH of these are still refused — by the
   STORE's own arm, which resolves a named row and finds none. The refusal was
   right and the assertion was blind, so it could not tell which gate answered,
   which is the one thing this section exists to say. A malformed id and a leg
   stating its referent twice are facts about the DOCUMENT that only the
   catalogue knows; "this record holds no such row" is a fact about the RECORD.
   Pinning the sentence is what makes the arm bite. */
const rBadId = await cite(Q("refuse"), [DOCS[5]], `&role=supports&content_id=not-a-content-id`);
t("a content id that is not one is refused BY THE CATALOGUE, before anything goes looking for it",
  [rBadId.ok, rBadId.reason, /is not a content id/.test(JSON.stringify(rBadId)),
   codesOf(rBadId)],
  [false, "BASIS_REFUSED", true, [null]]);
const rBoth = await cite(Q("refuse"), [DOCS[5]],
  `&role=supports&extent_kind=pdf-page&extent_page=1&content_id=${"a".repeat(64)}`);
t("a leg naming BOTH an id and an extent is one fact written twice, and the CATALOGUE says so",
  [rBoth.ok, rBoth.reason, /names BOTH a content_id and an extent/.test(JSON.stringify(rBoth))],
  [false, "BASIS_REFUSED", true]);
t("every one of those refusals wrote NOTHING", (await docLegs(Q("refuse"))).length, 0);

/* ===================== 5. THE STORE'S GATE ============================== */
console.log("\n--- 5. what only the RECORD holds — REC-84's rules hold THROUGH the act ---");

const rPartOfInq = await cite(Q("refuse"), [INQ_TARGET], `&role=supports&extent_kind=pdf-page&extent_page=1`);
t("an extent naming a PART of an INQUIRY is refused — an inquiry has no bytes and no pages",
  [rPartOfInq.ok, rPartOfInq.reason], [false, "BASIS_REFUSED"]);
ok_("and it is the STORE's arm that says so, not the act's — the two gates stay apart",
  /inquiry rather than a document/.test(JSON.stringify(rPartOfInq)),
  JSON.stringify(rPartOfInq).slice(0, 400));
const rNoRow = await cite(Q("refuse"), [DOCS[5]], `&role=supports&content_id=${"b".repeat(64)}`);
t("a well-formed content id naming no row is refused as C-45.5, from the store",
  [rNoRow.ok, rNoRow.reason, codesOf(rNoRow)], [false, "BASIS_REFUSED", ["CONTENT_ROW_UNKNOWN"]]);

/* ===================== 6. NAMING THE PART OUTRIGHT ====================== */
console.log("\n--- 6. a member names an already-minted part by its content_id (IC-84's amendment) ---");

const NAMED = (EB1.legs || [])[0]?.content_id;
ok_("the page cited in section 1 has a content id a member can name", !!NAMED && NAMED.length === 64);
/* THE COUNT IS READ IMMEDIATELY BEFORE THE ACT rather than predicted from the
   sections above. CORRECTED while writing this suite and kept as the reason: the
   first draft predicted 5 and the store held 6, because the OVER-STRICTNESS arm
   in section 3 is a cite that SUCCEEDS and therefore mints a `document` row.
   Arithmetic over a growing fixture is a hand-kept parallel list, which is the
   D-113 class; a before/after delta is a measurement. */
const rowsBefore = (await get("stats")).content;
const rNamed = await cite(Q("named"), [DOCS[0]], `&role=supports&content_id=${NAMED}`);
t("citing it by id is ACCEPTED", [rNamed.ok, rNamed.cited], [true, [DOCS[0]]]);
const legsNamed = await docLegs(Q("named"));
t("the id is in the bytes as a QUOTED string, so it can never parse back as a number",
  [legContentId(legsNamed[0]), legHasAuthoredExtent(legsNamed[0])], [NAMED, false]);
ok_("the bytes quote it, measured on the bytes rather than on the parse",
  (await imageOf(Q("named"))).includes(`content_id: "${NAMED}"`));
t("and NO second row was minted — one address, one row across two questions",
  [(await get("stats")).content, rowsBefore], [rowsBefore, 6]);

/* ===================== 7. NOTHING WRITTEN IS STILL SAID ================= */
console.log("\n--- 7. where nothing is written, the act SAYS the part went nowhere ---");

await cite(Q("already"), [DOCS[0]], `&role=supports`);
const rAgain = await cite(Q("already"), [DOCS[0]], `&role=supports&extent_kind=pdf-page&extent_page=2`);
t("a target already carrying a leg is a SUCCESS that writes nothing, as it always was",
  [rAgain.ok, rAgain.cited, rAgain.alreadyCited], [true, [], [DOCS[0]]]);
ok_("and the answer SAYS the part named was written nowhere — a silent drop wearing a success costume is still one",
  /written NOWHERE/.test(String(rAgain.detail)), String(rAgain.detail));
const rAgainPlain = await cite(Q("already"), [DOCS[0]], `&role=supports`);
t("with no extent named, that sentence is ABSENT — the old answer is unchanged",
  String(rAgainPlain.detail), "every member of the selection was already cited; nothing was written");

/* ===================== 8. OVER-STRICTNESS: THE DIGEST PIN =============== */
console.log("\n--- 8. a cite with NO extent is byte-identical to the answer before this item ---");

/* THE FIGURE BELOW WAS MEASURED ON A PRISTINE WORKTREE at 173bc66 by
   `node test/rec97-noextent-digest.mjs`, which is a NON-suite instrument for
   exactly that reason: it has to run against a tree that does not contain this
   item. The digest is taken over the bundle.md the act WROTE with its two
   authored timestamps normalised — they are the only bytes that legitimately
   differ between two runs — so it is a pin on the act's output and not on a
   clock. If this fails, `op=cite` has changed what it writes for a caller that
   named no part, which is the one thing this item promised not to do. */
const PRISTINE_NOEXTENT_SHA = "0e034ff91db0f9d103896eada9ad82d928058d90090964df0c3ec2f74b8b8d6e";
const PRISTINE_NOEXTENT_BYTES = 1290;
const rPlain = await cite(Q("again"), [DOCS[0]], `&role=supports&note=a plain cite`);
/* THREE VALUES ARE NORMALISED AND NOTHING ELSE IS. The two timestamps are
   authored by `new Date()` inside the act; the SELECTION HANDLE is minted at
   random per run and named in the Session Log entry. The third was found BY THE
   INSTRUMENT and not predicted — the first cross-tree measurement differed at
   exactly that line with the byte counts EQUAL, which is what said the
   difference could not be this item's. Normalising a value neither tree controls
   is the difference between a pin on the act and a pin on a random number;
   normalising anything more would be a digest that agrees for free. */
/* CORRECTED 2026-09-25 BY REC-220, NOT EXEMPTED. The act now writes ONE more line on a no-extent
   leg — `extent_capture`, the capture the leg was made against (Bob's 00:40Z version doctrine,
   rule 1) — so the pristine digest would fail for the right reason. That line is not a PART of the
   document (legHasAuthoredExtent ignores it; it names WHICH BYTES, not which portion), so it is
   asserted on its own below and removed here, and EVERY OTHER BYTE is still held to the pre-REC-97
   figure: the pin keeps its meaning instead of being re-measured into agreeing with itself. */
const PIN_LINE = `    extent_capture: "${sha(`rec97-${DOCS[0]}`)}"`;
const rawAgain = await imageOf(Q("again"));
t("REC-220: the no-extent leg carries exactly ONE pin line, naming the document's capture",
  rawAgain.split("\n").filter((l) => /^\s+extent_capture:/.test(l)), [PIN_LINE]);
const normalised = rawAgain.split("\n").filter((l) => l !== PIN_LINE).join("\n")
  .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, "<WHEN>")
  .replace(/sel-[0-9a-f]+/g, "<SEL>");
const got = sha(normalised);
console.log(`  no-extent bundle.md digest (timestamps normalised): ${got}`);
ok_("the document a no-extent cite writes is byte-identical to the pre-item measurement",
  got === PRISTINE_NOEXTENT_SHA && normalised.length === PRISTINE_NOEXTENT_BYTES,
  `pristine ${PRISTINE_NOEXTENT_SHA} (${PRISTINE_NOEXTENT_BYTES} bytes)\n         this tree ${got} (${normalised.length} bytes)`);
/* NULL-TOLERANT DELIBERATELY, and it is an INSTRUMENT correction rather than a
   convenience — the lesson `citeinquiry.test.mjs` already paid for. The
   over-strictness control arm refuses every cite that names no part, so this
   question ends up with NO legs; the first version of this line dereferenced
   `[0]` and THREW, which killed the run and reported `-1` instead of naming the
   four assertions the arm was supposed to break. A control that crashes the
   suite tells you nothing about which rule it broke. */
/* CORRECTED 2026-09-25 BY REC-220, NOT EXEMPTED: `extent_capture` is now written on every leg onto
   a captured document (the version pin). It names WHICH BYTES and no PART of them, so the claim this
   assertion guards — no part was invented for a cite that named none — is still asserted, by the
   catalogue's own `legHasAuthoredExtent` beside the key list. */
t("and the leg it wrote carries no extent key of any kind — only the version pin",
  Object.keys((await docLegs(Q("again")))[0] ?? {}).sort(),
  ["extent_capture", "note", "role", "target"]);
ok_("and the catalogue reads it as naming NO part of the document",
  legHasAuthoredExtent((await docLegs(Q("again")))[0] ?? {}) === false);
ok_("its receipt carries no `extent` either — absent, not null and not \"document\"",
  rPlain.legs && rPlain.legs.length === 1 && !("extent" in rPlain.legs[0]),
  JSON.stringify(rPlain.legs));

/* ===================== 9. WHAT THIS SUITE CANNOT SEE ==================== */
console.log("\n--- 9. stated, not implied ---");
console.log("  This suite drives the ACT. It does not drive the composer: no UI surface sends an");
console.log("  extent today, because UI-61 built no picker and this item did not build one either");
console.log("  (a page set and a page canvas, delegated back to UI). So `the composer emits extent");
console.log("  end to end` is FALSE as of this landing — the ACT carries it end to end and the");
console.log("  surface does not yet send it. It also cannot see a `dom` extent in production (no");
console.log("  producer), and the three office arms' out-of-range refusal stays UNFED (D-354).");

const FLOOR = 40;
if (pass + fail < FLOOR) { console.log(`\n  FAIL  the suite reached only ${pass + fail} assertions, floor ${FLOOR}`); fail++; }
console.log(`\ncite-extent: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
