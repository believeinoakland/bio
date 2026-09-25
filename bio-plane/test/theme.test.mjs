/* NEGATIVE CONTROL: RUN 2026-09-23 with `node test/nc-d162.mjs [arm]` from `bio-plane/`, ELEVEN arms, every one ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND cmp (bio-checks.mjs 854,596 B, store.mjs 2,923,946 B, index.mjs 735,468 B, affordances.mjs 151,127 B; all eleven restores byte-identical; never `git checkout --`). Every arm AS DECLARED: (a) `baseline` 63/0. (b) `legonly` — THE ROW'S CONTROL, C-81.1 dropped at both branches: 55/8, every BY-NAME leg arm fails (basis target, content_id, `theme:`, membership address, version leg, action basis), a bare theme still refused under the WRONG name and the `theme:` leg LANDING. Its first run ended the module at section 4c (the over-strictness promote reused the inquiry the liar had just landed, 35/9 with a throw) — the INSTRUMENT was corrected to its own id, never the arm. (c) `liar` — `theme` as an ELEVENTH ENTITY KIND: 60/3, the ENTITY_KINDS arm and the registry arm fail by name. (d) `notest` 58/5. (e) `machinedeclare` 57/6. (f) `stamp` — the declarer unstamped: 51/12. (g) `machineplace` 58/5. (h) `hunchcounts` — a proposal written as membership: 59/4. (i) `ungated` — placements read without the viewer gate: 61/2. (j) `overstrict` — C-81.1 claims anything containing "theme": 61/2. (k) `overstrictkey` — a leg refused for merely carrying a null `theme` key: 62/1. RE-RUN 2026-09-24 by c19-unionfix after BOB #32's disclosure correction (handles to members; member id and cover to administrators), all THIRTEEN arms AS DECLARED, every restore byte-identical (store.mjs 3,156,871 B, index.mjs 778,962 B): baseline 68/0; the eleven above still fail by name (legonly 60/8, liar 65/3, notest 63/5, machinedeclare 61/7, stamp 53/15, machineplace 61/7, hunchcounts 62/6, ungated 66/2, overstrict 66/2, overstrictkey 67/1). (l) `handleid` — the member id restored to a reader who does not administer: 65/3, "A MEMBER'S READ CARRIES NO MEMBER ID AND NO COVER" and otto's reading arm fail by name. (m) `adminunstamped` — the control plane's theme `administer` stamp removed: 59/9, the administrator arms fail (FAIL CLOSED: the pairing is lost, not leaked) and the IMPOSTOR arm fails too, because with the plane's `set` gone a member's own `administer=1` survives the parameter copy — the stamp is what overwrites it, as D-157 measured for op=memberlist.
 *
 * D-162 / IC-241 — THE THEME (`BIO_Content_Framework_v0_10.md` §8.4, Bob's ruling of
 * 2026-09-21): a connection through an IDEA, fenced four ways — declared by a MEMBER and
 * attributed on every reading; carrying its TEST; membership a member's act and a machine's
 * proposal a HUNCH until confirmed; and NEVER the basis of a claim, refused BY NAME as a lead
 * is (C-54.1's pattern, `MEMBER-KNOWLEDGE-DESIGN.md` §5).
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when, every half THROUGH THE OPS against the real
 * plane in miniflare — under SIGNED-IN members, and under the MEMBER TOKEN, which is a machine
 * credential (`class:member`):
 *
 *   1. a member DECLARES a theme with a test; the declarer is SERVER-STAMPED and shown on the
 *      reading; a declaration WITHOUT A TEST is refused (C-81.3), and so is a machine's (C-81.2);
 *   2. members PLACE TWO DOCUMENTS THAT SHARE NO ENTITY in it — each resolved to a DIFFERENT
 *      entity, so the entity axis provably does not connect them and the theme does;
 *   3. a machine's PROPOSAL READS AS A HUNCH (grade C, `membership: false`, listed apart from
 *      the members), a machine cannot PLACE (C-81.7), and a member's confirmation turns the hunch
 *      into membership while keeping who proposed it;
 *   4. A LEG CITING THE THEME IS REFUSED BY NAME (C-81.1, THEME_NOT_EVIDENCE) — through op=promote
 *      at basis[].target, basis[].content_id and a leg claiming membership (`theme:`), and at the
 *      version-leg and action-basis grammars;
 *   4b. THE LIAR: a theme is NOT an eleventh entity kind — `theme` is not in ENTITY_KINDS, the
 *      registry refuses to create one, and no bundle, content row or entity answers for its id;
 *   4c. OVER-STRICTNESS: a leg citing a DOCUMENT that is a member of the theme still lands (what a
 *      finding rests on stays content), and a value merely CONTAINING "theme" is not claimed;
 *   5. VISIBILITY: a placed document the reader cannot see is omitted from the reading, and a
 *      placement naming one answers exactly as a target that does not exist;
 *   6. search, the bound, and the whole-store purge.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { THEME_CHECKS, THEME_ID_RE, BUNDLE_ID_RE, themeLegFindings, basisVersionFindings,
         actionBasisFindings } from "../checks/bio-checks.mjs";
import { ENTITY_KINDS } from "../src/affordances.mjs";

const SRC_DIR = process.env.D162_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d162", MEMBER_TOKEN: "mem-d162", PROBE_TOKEN: "prb-d162",
              AI_TOKEN: "ai-d162", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks an answer's shape NAMES the assertions it broke instead
   of ending the module on a TypeError. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const findingsOf = (r) => {
  const out = [];
  const walk = (x) => {
    if (Array.isArray(x)) { x.forEach(walk); return; }
    if (x && typeof x === "object") {
      if (typeof x.check === "string" && (typeof x.message === "string" || typeof x.detail === "string"))
        out.push({ ...x, message: x.message ?? x.detail });
      Object.values(x).forEach(walk);
    }
  };
  walk(r);
  return out;
};
const targetsOf = (rows) => (Array.isArray(rows) ? rows : []).map((x) => x && x.target);

const NOW = "2026-09-23T00:00:00Z";
const LATER = "2026-09-23T01:00:00Z";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role = "admin") => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, "adm-d162");
  const en = await post("enroll", { invite: add.invite, handle: `${memberId}-h`, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");
const SAM = await enrol("sam");
/* `member`, not `admin`: a THIRD administrator needs the consensus of the existing ones (4.7). */
const OTTO = await enrol("otto", "member");

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
/* `legs` are { target, cid?, theme? }; references[] carries every target, so the ONLY thing
   that can refuse a theme leg is the theme rule rather than C-6.3. */
const inquiryMd = (id, legs = []) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
                     "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                     ...(l.cid ? [`    content_id: "${l.cid}"`] : []),
                     ...(l.theme ? [`    theme: ${l.theme}`] : [])])] : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260923T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    register: readings.map((d) => ({ sha256: d.capture.sha256, path: "captures/doc.pdf",
                                     encoding: "binary", bytes: 10 })),
    files }, RUTH);
  if (r && r.ok !== false && r.bundleSha) HEAD.set(id, r.bundleSha);
  return r;
};
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r || r.ok === false) throw new Error(`promote ${a[0]} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};
/* Each document's reading carries ONE entity reference, and the two references are DIFFERENT
   kinds of named thing, so the entity axis has something to say about each and nothing to say
   about the pair. The OCR chain gives the second document pages a passage can be minted over. */
const ocrChain = [
  { step: "pixels", extent: { kind: "pages", pages: [0, 1] } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages: [0, 1] } }];
const readingOf = (captureSha, entity) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: [entity], text_source: ocrChain } });

const SHA_A = sha("d162-parks-audit"), SHA_B = sha("d162-sewer-memo");
const DOC_A = "INFO-2026-0923-parksaudit", DOC_B = "INFO-2026-0923-sewermemo";
const DOC_C = "INFO-2026-0923-roofreport";
await mustPromote(DOC_A, infoMd(DOC_A), "information",
  { readings: [readingOf(SHA_A, { kind: "fund", key: "2310", label: "Parks Fund 2310" })] });
await mustPromote(DOC_B, infoMd(DOC_B), "information",
  { readings: [readingOf(SHA_B, { kind: "body", key: "pwc", label: "Public Works Committee" })] });
await mustPromote(DOC_C, infoMd(DOC_C), "information");
const EA = await post("entitycreate", { kind: "fund", label: "Parks Fund 2310" }, RUTH);
const EB = await post("entitycreate", { kind: "body", label: "Public Works Committee" }, RUTH);
const ra = await post("resolvetestify", { captureSha: SHA_A, ref: "fund:2310", entityId: EA && EA.entity_id,
                                          basis: "the audit names the fund on its cover" }, RUTH);
const rb = await post("resolvetestify", { captureSha: SHA_B, ref: "body:pwc", entityId: EB && EB.entity_id,
                                          basis: "the memo is addressed to the committee" }, RUTH);
const entsOf = async (s) => new Set(((await get("resolutions", `sha256=${s}`, RUTH)) || {}).resolutions?.map((x) => x.entity_id) || []);
const entA = await entsOf(SHA_A), entB = await entsOf(SHA_B);
t("FIXTURE: two documents, each resolved to ONE entity (a fund; a committee), and they SHARE NONE — so the "
  + "entity axis cannot connect them",
  [ra && ra.ok, rb && rb.ok, entA.size, entB.size, [...entA].some((e) => entB.has(e))], [true, true, 1, 1, false]);
const mint = await post("contentmint", { bundleId: DOC_B, extent: { kind: "pdf-page", page: 1 }, at: NOW }, RUTH);
const PASSAGE = mint && mint.content_id;
t("FIXTURE: a PASSAGE of the second document is minted as a content row (page 1)",
  [mint && mint.ok, /^[0-9a-f]{64}$/.test(PASSAGE || "")], [true, true]);
console.log(`  corpus: 3 documents (2 read, each naming a different entity), 1 passage; members ruth, sam, otto; `
  + "the member and admin tokens as machine credentials");

const listThemes = async (tok = RUTH, qs = "") => (await get("themeread", qs, tok)) || {};

/* ===================== 1. THE DECLARATION: op=themedeclare ===================== */
console.log("\n--- 1. ruth declares a theme, with its test ---");
const NAME = "deferred maintenance";
const TEST = "The document describes upkeep of a public asset being postponed, skipped or unfunded.";
const D1 = await post("themedeclare", { name: NAME, test: TEST, declarer: "sam" }, RUTH, "&declarer=sam");
const TID = D1 && D1.theme_id;
t("op=themedeclare lands: a THEME- id, the idea and the TEST as written, evidence false",
  [D1 && D1.ok, typeof TID === "string" && THEME_ID_RE.test(TID), D1 && D1.name, D1 && D1.test, D1 && D1.evidence],
  [true, true, NAME, TEST, false]);
t("fence 1: the declarer is SERVER-STAMPED — neither a body nor a query-string `declarer: sam` is honoured — "
  + "and the answer names ruth and her handle",
  [D1 && D1.declared_by, D1 && D1.declared_by_handle], ["ruth", "ruth-h"]);
/* CORRECTED 2026-09-24 by c19-unionfix (BOB #32: Membership v2 §3 governs). This read was taken AS SAM, an
   ADMINISTRATOR, and asserted the member id and no cover — the first cut's provisional reading, which showed
   EVERY reader the member id. The ruling: a reader who does not administer sees the HANDLE alone; the member id
   and the cover go to administrators only. So the member half is read as otto (a member), the administrator
   half as sam, and section 1c pins both across every reading. */
const R0 = await get("themeread", `id=${TID}`, OTTO);
t("op=themeread (as otto, a member) shows WHOSE lens it is on the reading: ruth's HANDLE — no member id, no cover",
  [R0 && R0.ok, R0 && "declared_by" in R0, R0 && R0.declared_by_handle, R0 && R0.test, JSON.stringify(R0).includes("cover for")],
  [true, false, "ruth-h", TEST, false]);
const R0a = await get("themeread", `id=${TID}`, SAM);
t("op=themeread (as sam, an administrator) shows ruth by member id, handle AND cover — the pairing §3 gives "
  + "administrators", [R0a && R0a.declared_by, R0a && R0a.declared_by_handle, R0a && R0a.declared_by_cover],
  ["ruth", "ruth-h", "cover for ruth"]);

console.log("\n--- 1b. the declaration's refusals ---");
const nT = await post("themedeclare", { name: "a theme with no test" }, RUTH);
t("A DECLARATION WITHOUT A TEST IS REFUSED — by name (C-81.3, THEME_NO_TEST), carrying its canned translation",
  [codeOf(nT), nT && nT.check, nT && nT.translation === THEME_CHECKS.THEME_NO_TEST.translation],
  ["THEME_NO_TEST", "C-81.3", true]);
t("a test of whitespace is no test (C-81.3)",
  codeOf(await post("themedeclare", { name: "blank", test: "   \n " }, RUTH)), "THEME_NO_TEST");
t("a theme with a test but no idea named is refused (C-81.4)",
  codeOf(await post("themedeclare", { name: " ", test: TEST }, RUTH)), "THEME_NO_NAME");
t("a test over one passage is refused rather than cut (C-81.5)",
  codeOf(await post("themedeclare", { name: "long", test: "x".repeat(128 * 1024 + 1) }, RUTH)), "THEME_TOO_LONG");
const mTok = await post("themedeclare", { name: NAME, test: TEST }, "mem-d162");
t("fence 1: the MEMBER token is a machine credential — refused BY NAME (C-81.2); no machine declares a theme",
  [codeOf(mTok), mTok && mTok.check], ["THEME_NOT_A_MEMBER", "C-81.2"]);
t("and the ADMIN token is a machine credential too (C-81.2)",
  codeOf(await post("themedeclare", { name: NAME, test: TEST }, "adm-d162")), "THEME_NOT_A_MEMBER");
const L0 = await listThemes();
t("none of the refused declarations wrote a theme: the list holds ruth's one",
  [L0.ok, (L0.themes || []).map((x) => x.theme_id)], [true, [TID]]);

/* ===================== 2. MEMBERSHIP: op=themeplace ===================== */
console.log("\n--- 2. two documents that share no entity are placed in it ---");
const pA = await post("themeplace", { theme: TID, target: DOC_A, note: "the audit defers playground repairs",
                                      placer: "sam" }, RUTH);
const pB = await post("themeplace", { theme: TID, target: DOC_B, note: "the memo postpones sewer relining" }, SAM);
t("ruth places the parks audit: MEMBERSHIP, grade D, placed_by ruth (a body `placer` is not honoured)",
  [pA && pA.ok, pA && pA.membership, pA && pA.hunch, pA && pA.grade, pA && pA.placed_by, pA && pA.target_kind],
  [true, true, false, "D", "ruth", "document"]);
t("sam places the sewer memo: membership, grade D, placed_by sam", [pB && pB.ok, pB && pB.membership,
  pB && pB.grade, pB && pB.placed_by], [true, true, "D", "sam"]);
const R1 = await get("themeread", `id=${TID}`, OTTO);
t("ACCEPTS-WHEN: the theme now holds BOTH documents as members — two documents that share no entity, "
  + "connected through ruth's declared lens",
  [R1 && R1.ok, targetsOf(R1 && R1.members).sort(), targetsOf(R1 && R1.hunches)], [true, [DOC_A, DOC_B].sort(), []]);
const again = await post("themeplace", { theme: TID, target: DOC_A }, SAM);
t("placing a member again changes nothing — the first placer and date stand",
  [again && again.ok, again && again.already, again && again.placed_by, again && again.placed_at],
  [true, true, "ruth", pA && pA.placed_at]);
const pP = await post("themeplace", { theme: TID, target: PASSAGE }, RUTH);
t("a PASSAGE (a content row) is placed as itself — target_kind content, its document named beside it",
  [pP && pP.ok, pP && pP.target_kind, pP && pP.document, pP && pP.membership], [true, "content", DOC_B, true]);

console.log("\n--- 2b. the placement's refusals ---");
const mPlace = await post("themeplace", { theme: TID, target: DOC_C }, "mem-d162");
t("fence 3: a MACHINE credential cannot PLACE — refused BY NAME (C-81.7), pointing it at a proposal",
  [codeOf(mPlace), mPlace && mPlace.check], ["THEME_PLACEMENT_NOT_A_MEMBER", "C-81.7"]);
const ghostT = await post("themeplace", { theme: "THEME-2026-0923-nosuch", target: DOC_C }, RUTH);
t("a theme that does not exist is refused (C-81.6)", [codeOf(ghostT), ghostT && ghostT.check],
  ["THEME_NOT_FOUND", "C-81.6"]);
const ghostD = await post("themeplace", { theme: TID, target: "INFO-2026-0923-nosuchdoc" }, RUTH);
t("a document that does not exist is refused (C-81.8)", [codeOf(ghostD), ghostD && ghostD.check],
  ["THEME_TARGET_NOT_FOUND", "C-81.8"]);
const longNote = await post("themeplace", { theme: TID, target: DOC_C, note: "x".repeat(128 * 1024 + 1) }, RUTH);
t("a placement note over one passage is refused rather than cut (C-81.9), and nothing is placed",
  [codeOf(longNote), longNote && longNote.check], ["THEME_REASON_TOO_LONG", "C-81.9"]);
/* C-81.10 IS NOT REACHABLE THROUGH THE OPS, AND THAT IS STATED RATHER THAN DRIVEN: every route to
   op=themepropose has its proposer stamped by the control plane (a session's member, `class:<cls>`, or
   `class:ai/<tokenId>`), so an empty proposer can only arrive at the store by a caller that bypasses the
   stamp. The refusal is defence in depth; what is pinned here is its row, not its reach. */
t("C-81.10 (THEME_NO_PROPOSER) is catalogued with its translation — defence in depth, NOT reachable through "
  + "the ops, since every route stamps a proposer",
  [THEME_CHECKS.THEME_NO_PROPOSER.check, typeof THEME_CHECKS.THEME_NO_PROPOSER.translation], ["C-81.10", "string"]);
t("a THEME cannot be placed in a theme — its id is not a document or a passage (C-81.8)",
  codeOf(await post("themeplace", { theme: TID, target: TID }, RUTH)), "THEME_TARGET_NOT_FOUND");

/* ===================== 3. THE HUNCH: op=themepropose ===================== */
console.log("\n--- 3. a machine proposes; the proposal is a hunch ---");
const h1 = await post("themepropose", { theme: TID, target: DOC_C, note: "mentions a roof", proposer: "ruth" },
                      "mem-d162");
t("ACCEPTS-WHEN: the member token's proposal READS AS A HUNCH — grade C, membership false, proposed_by the "
  + "machine's stamp (a body `proposer` is not honoured), nobody placed it",
  /* CORRECTED 2026-09-25 BY D-620, never exempted: this arm read `h1.placed_by` and wanted `null` — "nobody placed
     it". A reader who does not administer is NEVER shown `placed_by` (`#themePerson`, IC-241: the member id is paired
     for an administrator alone), so the key was ABSENT, and `JSON.stringify` wrote the absent array element as `null`:
     the arm passed on a field the answer withheld, and would have passed had a member placed it. What this reader IS
     told about the placer is `placed_by_handle`, and that it is not told the id is asserted as such. */
  [h1 && h1.ok, h1 && h1.hunch, h1 && h1.membership, h1 && h1.grade, h1 && h1.proposed_by, h1 && h1.placed_by_handle,
   !!h1 && "placed_by" in h1],
  [true, true, false, "C", "class:member", null, false]);
const R2 = await get("themeread", `id=${TID}`, OTTO);
t("on the reading the hunch is listed APART, and is NOT among the members",
  [targetsOf(R2 && R2.hunches), targetsOf(R2 && R2.members).includes(DOC_C),
   (R2 && R2.hunches || []).map((x) => [x.membership, x.grade])], [[DOC_C], false, [[false, "C"]]]);
const h2 = await post("themepropose", { theme: TID, target: DOC_A }, "mem-d162");
t("a proposal at a document already a MEMBER changes nothing — it is never demoted to a hunch",
  /* CORRECTED 2026-09-25 BY D-620, never exempted: `h2.proposed_by` is withheld from this non-administering reader
     exactly as `placed_by` is above, so the old `null` was the absent key read as one. Nobody proposed DOC_A (a member
     placed it): `proposed_by_handle` states that, and the id is ABSENT. */
  [h2 && h2.ok, h2 && h2.already, h2 && h2.membership, h2 && h2.grade, h2 && h2.proposed_by_handle,
   !!h2 && "proposed_by" in h2], [true, true, true, "D", null, false]);
const h3 = await post("themepropose", { theme: TID, target: DOC_C }, SAM);
t("a MEMBER proposing is a hunch too, and a second proposal does not overwrite the first proposer",
  [h3 && h3.hunch, h3 && h3.already, h3 && h3.proposed_by], [true, true, "class:member"]);
const conf = await post("themeplace", { theme: TID, target: DOC_C, note: "checked: the roof repair is deferred" }, SAM);
t("sam CONFIRMS it: membership, grade D, placed_by sam — and the record KEEPS that the machine proposed it",
  [conf && conf.ok, conf && conf.confirmed_hunch, conf && conf.membership, conf && conf.grade, conf && conf.placed_by,
   conf && conf.proposed_by], [true, true, true, "D", "sam", "class:member"]);
const R3 = await get("themeread", `id=${TID}`, OTTO);
t("after the confirmation it is a member and no longer a hunch",
  [targetsOf(R3 && R3.members).includes(DOC_C), targetsOf(R3 && R3.hunches)], [true, []]);

/* ===================== 1c. WHO A READER IS SHOWN (BOB #32, 2026-09-24) ===================== */
console.log("\n--- 1c. a member is shown HANDLES; an administrator, the member id and cover too ---");
/* Membership v2 §3 governs, following MK-6's precedent that the member id is not published in member-facing
   reads. Every string on a member's reading is walked: no member id (ruth, sam, otto — a handle `ruth-h` is
   not one) and no cover, in a field or in a sentence. A machine stamp (`class:member`) is no person and is
   shown to every reader. */
const IDS = /\b(ruth|sam|otto)\b(?!-h)/;
const leaks = (r) => {
  const out = [];
  const walk = (x, k) => {
    if (Array.isArray(x)) { x.forEach((v) => walk(v, k)); return; }
    if (x && typeof x === "object") { for (const [kk, v] of Object.entries(x)) walk(v, kk); return; }
    if (typeof x === "string" && (IDS.test(x) || x.includes("cover for"))) out.push(`${k}=${x.slice(0, 80)}`);
    if (/_cover$/.test(k || "")) out.push(`${k} present`);
  };
  walk(r, null);
  return out;
};
const oRead = await get("themeread", `id=${TID}`, OTTO);
const oList = await listThemes(OTTO);
const oAct = await post("themepropose", { theme: TID, target: DOC_C }, OTTO);
const mRead = await get("themeread", `id=${TID}`, "mem-d162");
t("A MEMBER'S READ CARRIES NO MEMBER ID AND NO COVER — the theme, its list, a placement act's answer and the "
  + "member token's read name the declarer, placers and proposer by HANDLE alone",
  [oRead && oRead.ok, oList.ok, oAct && oAct.ok, mRead && mRead.ok,
   leaks(oRead), leaks(oList), leaks(oAct), leaks(mRead)], [true, true, true, true, [], [], [], []]);
t("and the handles ARE there: declarer ruth-h; placers ruth-h (the audit, the passage) and sam-h (the memo, the roof report); the machine's proposal still attributed "
  + "to its stamp; otto's answer says who placed it by handle",
  [oRead && oRead.declared_by_handle, (oRead && oRead.members || []).map((x) => x.placed_by_handle).sort(),
   (oRead && oRead.members || []).find((x) => x.target === DOC_C)?.proposed_by, (oList.themes || [])[0]?.declared_by_handle,
   /placed by sam-h/.test(oAct && oAct.says || "")],
  ["ruth-h", ["ruth-h", "ruth-h", "sam-h", "sam-h"], "class:member", "ruth-h", true]);
const aRead = await get("themeread", `id=${TID}`, SAM);
const tRead = await get("themeread", `id=${TID}`, "adm-d162");
const docC = (r) => (r && r.members || []).find((x) => x.target === DOC_C) || {};
t("AN ADMINISTRATOR'S READ CARRIES THE MEMBER ID AND THE COVER beside the handle — an admin-role session and "
  + "the admin token alike",
  [aRead && aRead.declared_by, aRead && aRead.declared_by_cover, docC(aRead).placed_by, docC(aRead).placed_by_cover,
   tRead && tRead.declared_by, tRead && tRead.declared_by_cover],
  ["ruth", "cover for ruth", "sam", "cover for sam", "ruth", "cover for ruth"]);
const imp = await get("themeread", `id=${TID}&administer=1`, OTTO);
t("THE IMPOSTOR RULE: a member's own `administer=1` is overwritten by the plane's stamp — still handles alone",
  leaks(imp), []);

/* ===================== 4. FENCE 4: NEVER A BASIS ===================== */
console.log("\n--- 4. a leg citing the theme ---");
const Q1 = "INQ-2026-0923-themeleg";
const p1 = await promote(Q1, inquiryMd(Q1, [{ target: TID }]), "inquiry");
const f1 = findingsOf(p1).filter((x) => x.check === "C-81.1");
t("ACCEPTS-WHEN: op=promote REFUSES an inquiry whose basis[].target is a THEME — BY NAME (C-81.1, THEME_NOT_EVIDENCE)",
  [p1 && p1.ok === false, f1.length >= 1, f1[0] && f1[0].code], [true, true, "THEME_NOT_EVIDENCE"]);
t("and the theme leg is answered ONCE, by its name — not also as 'not a canonical bundle id'",
  findingsOf(p1).filter((x) => /basis\[0\]\.target/.test(x.message) && x.check !== "C-81.1").length, 0);
const listed = async () => JSON.stringify(await get("list", "", "mem-d162"));
t("the refused inquiry was not written — op=list names the document and NOT the inquiry",
  [(await listed()).includes(DOC_A), (await listed()).includes(Q1)], [true, false]);
const p2 = await promote(Q1, inquiryMd(Q1, [{ target: DOC_A, cid: TID }]), "inquiry");
t("citing the theme through basis[].content_id is refused BY NAME too (C-81.1)",
  [p2 && p2.ok === false, findingsOf(p2).some((x) => x.check === "C-81.1" && x.code === "THEME_NOT_EVIDENCE")],
  [true, true]);
const p3 = await promote(Q1, inquiryMd(Q1, [{ target: DOC_A, theme: TID }]), "inquiry");
t("a leg on a real document that claims it THROUGH the theme (`theme:`) rests on membership — refused BY NAME (C-81.1)",
  [p3 && p3.ok === false, findingsOf(p3).some((x) => x.check === "C-81.1" && x.code === "THEME_NOT_EVIDENCE")],
  [true, true]);
const p4 = await promote(Q1, inquiryMd(Q1, [{ target: `${TID}#${DOC_A}` }]), "inquiry");
t("a leg naming a MEMBERSHIP by address (`THEME-…#INFO-…`) is refused BY NAME (C-81.1)",
  [p4 && p4.ok === false, findingsOf(p4).some((x) => x.check === "C-81.1" && x.code === "THEME_NOT_EVIDENCE")],
  [true, true]);
const vf = []; basisVersionFindings({ id: Q1, basis_versions: [{ name: "v1", description: "a reading",
  relationship: "and", state: "suggested" }], basis_version_legs: [{ version: "v1", target: TID, role: "supports" }] }, vf);
t("the VERSION-LEG grammar refuses a theme BY NAME (C-81.1)",
  vf.some((x) => x.check === "C-81.1" && x.code === "THEME_NOT_EVIDENCE"), true);
const af = []; actionBasisFindings({ action_basis: [{ target: TID, kind: "rests_on" }] }, af);
t("the ACTION-BASIS grammar refuses a theme BY NAME (C-81.1)",
  [af.length, af[0] && af[0].check, af[0] && af[0].code], [1, "C-81.1", "THEME_NOT_EVIDENCE"]);
const af2 = []; actionBasisFindings({ action_basis: [{ target: DOC_A, kind: "rests_on", themes: [TID] }] }, af2);
t("and an action leg claiming its target through `themes:` is refused BY NAME (C-81.1)",
  af2.some((x) => x.check === "C-81.1"), true);

console.log("\n--- 4b. THE LIAR: a theme is not an eleventh entity kind ---");
t("`theme` is NOT in ENTITY_KINDS, which still holds its ten named-entity kinds",
  [ENTITY_KINDS.includes("theme"), ENTITY_KINDS.length], [false, 10]);
const asEnt = await post("entitycreate", { kind: "theme", label: NAME }, RUTH);
t("the subject registry REFUSES a theme as an entity kind", [asEnt && asEnt.ok, codeOf(asEnt)], [false, "UNKNOWN_KIND"]);
t("a theme id is NOT a bundle id and NOT a content id, by shape",
  [BUNDLE_ID_RE.test(TID), /^[0-9a-f]{64}$/.test(TID)], [false, false]);
t("no bundle answers for the theme id — op=list names the documents and NOT the theme",
  [(await listed()).includes(DOC_B), (await listed()).includes(TID)], [true, false]);
t("no content row answers for the theme id", !!((await get("content", `id=${TID}`, RUTH)) || {}).ok, false);
/* CORRECTED on this suite's first run: it asked `ok`, and op=entity answers `ok: true, found: false` for an
   id nothing holds — the instrument was wrong, not the plane. It asks `found`, and asks it of a real entity too. */
const eTheme = (await get("entity", `id=${TID}`, RUTH)) || {};
const eReal = (await get("entity", `id=${EA && EA.entity_id}`, RUTH)) || {};
t("no entity answers for the theme id (found false), while a real entity's id is found",
  [eTheme.ok, eTheme.found, eReal.found], [true, false, true]);
const byName = (await get("entitybyalias", `alias=${encodeURIComponent(NAME)}`, RUTH)) || {};
const byReal = (await get("entitybyalias", `alias=${encodeURIComponent("Parks Fund 2310")}`, RUTH)) || {};
t("and no entity carries the theme's name, while the same read finds a real entity by ITS name (positive control)",
  [byName.ok !== false, JSON.stringify(byName).includes("ENT-"), JSON.stringify(byReal).includes(EA && EA.entity_id)],
  [true, false, true]);

console.log("\n--- 4c. OVER-STRICTNESS ---");
/* ITS OWN ID, CORRECTED on the control's first run: this promoted Q1 again, and under the `legonly` arm Q1 had
   already LANDED (the membership-claiming leg is accepted once C-81.1 is gone), so this revision was refused
   for an unrelated reason and the module ended here, leaving sections 4c to 7 unmeasured in that arm. */
const Q2 = "INQ-2026-0923-themeok";
const ok2 = await promote(Q2, inquiryMd(Q2, [{ target: DOC_A }]), "inquiry");
t("a leg citing a DOCUMENT that is a MEMBER of the theme still lands — what a finding rests on stays content",
  [ok2 && ok2.ok !== false, HEAD.has(Q2)], [true, true]);
const near = []; themeLegFindings("basis[0]", { target: "INFO-2026-0923-theme-notes" }, near);
t("a document whose id merely contains 'theme' is NOT refused as a theme", near.length, 0);
const near2 = []; themeLegFindings("basis[0]", { target: "THEME-notes" }, near2);
t("a malformed THEME- string is left to the target grammar, not claimed by this rule", near2.length, 0);
const near3 = []; themeLegFindings("basis[0]", { target: DOC_A, theme: null, note: `found through ${TID}` }, near3);
t("a leg whose `theme` is null, or whose NOTE mentions a theme, is not claimed", near3.length, 0);

/* ===================== 5. VISIBILITY ===================== */
console.log("\n--- 5. a document the reader cannot see ---");
const projMd = () => ["---", "object_type: project", "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
const pr = await post("promote", { base: null,
  snapKey: `20260923T${String(700000 + (++snapSeq)).slice(-6)}Z_${sha("d162proj").slice(0, 8)}`,
  meta: { object_type: "project", group: "believe-in-oakland", title: "title for the maintenance project",
          current_state: "forming", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: projMd(), bytes: projMd().length, sha256: sha(projMd()) }], register: [] }, RUTH);
const PROJ = pr && pr.bundleId;
const pj = await post("themeplace", { theme: TID, target: PROJ }, RUTH);
t("FIXTURE: ruth (its owner) places her own project in the theme", [!!PROJ, pj && pj.ok], [true, true]);
const Ro = await get("themeread", `id=${TID}`, OTTO);
const Rr = await get("themeread", `id=${TID}`, RUTH);
t("otto — no position in that project — reads the theme WITHOUT it, while ruth sees it",
  [targetsOf(Ro && Ro.members).includes(PROJ), targetsOf(Rr && Rr.members).includes(PROJ)], [false, true]);
t("and nothing on otto's reading mentions it — no count, no label", JSON.stringify(Ro).includes(PROJ), false);
const oPlace = await post("themeplace", { theme: TID, target: PROJ }, OTTO);
const oGhost = await post("themeplace", { theme: TID, target: "PROJ-2026-0923-nosuch" }, OTTO);
t("otto placing it answers EXACTLY as a project that does not exist (C-81.8) — the act is no oracle",
  [codeOf(oPlace), codeOf(oGhost), oPlace && oPlace.translation === (oGhost && oGhost.translation)],
  ["THEME_TARGET_NOT_FOUND", "THEME_TARGET_NOT_FOUND", true]);

/* ===================== 6. SEARCH, BOUND, PURGE ===================== */
console.log("\n--- 6. search and the bound ---");
const D2 = await post("themedeclare", { name: "procurement shortcuts",
  test: "The document shows a purchase made without the competitive step the rules require." }, SAM);
t("a second theme, sam's", [D2 && D2.ok, D2 && D2.declared_by], [true, "sam"]);
const sq = await listThemes(OTTO, "q=MAINTENANCE");
/* CORRECTED 2026-09-24 by c19-unionfix: this asked otto's (a member's) list for `declared_by`, the member id,
   which BOB #32 withholds from a member; the list names the declarer by handle. */
t("the themes are SEARCHABLE: q matches the idea, case-insensitively, and finds ruth's alone",
  (sq.themes || []).map((x) => [x.theme_id, x.declared_by_handle]), [[TID, "ruth-h"]]);
t("q also searches the TEST", ((await listThemes(OTTO, "q=competitive")).themes || []).map((x) => x.theme_id),
  [D2 && D2.theme_id]);
t("a phrase no theme carries finds none", ((await listThemes(OTTO, "q=zzzz")).themes || []).length, 0);
const b1 = await listThemes(OTTO, "limit=1");
t("the list is bounded and says so: limit 1 over two themes, truncated TRUE",
  [(b1.themes || []).length, b1.limit, b1.truncated], [1, 1, true]);
const bD = await listThemes(OTTO);
t("at the default bound: both themes, truncated FALSE, limit 200", [(bD.themes || []).length, bD.truncated, bD.limit],
  [2, false, 200]);
t("an over-ask is answered at the ceiling (2000), never beyond it", (await listThemes(OTTO, "limit=999999")).limit, 2000);
const b2 = await get("themeread", `id=${TID}&limit=1`, RUTH);
t("a theme's members are bounded and say so", [(b2 && b2.members || []).length, b2 && b2.members_truncated], [1, true]);

console.log("\n--- 7. the whole-store purge takes themes and their placements together ---");
const pg = await post("purge", {}, "adm-d162", "&confirm=bio");
t("op=purge ALL reports the themes and the placements it took",
  [pg && pg.ok, pg && pg.removed && pg.removed.themes, pg && pg.removed && pg.removed.themePlacements], [true, 2, 5]);
t("and the theme no longer reads", codeOf(await get("themeread", `id=${TID}`, RUTH)), "THEME_NOT_FOUND");

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\ntheme: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
