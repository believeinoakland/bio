/* NEGATIVE CONTROL: (run 2026-09-18) `node test/nc-rec129.mjs` from `bio-plane/`: (a) `baseline` 33/0 green.
 * (b) `nofence` — THE ROW'S CONTROL, the visibility filter removed from the internet arm: 25/8, incl. C1
 * sam/vera/otto and C3. (c) `grouplate` — fence applied after the latest-per-subject grouping: 32/1, C3.
 * (d) `tallywide` — whole-level tally: 27/6, incl. C1, C3, C4. (e) `neverwide` — never-followed list unfenced:
 * 27/6, incl. C1 sam/vera. (f) `nocause` — THE LIAR, an empty answer with no cause: 28/5, incl. A1, A3, B1.
 * (g) `refleak` — referent always published: 32/1, E1. (h) `overstrict` — the share arm dropped from
 * #leadReach: 31/2, incl. D1. Every arm ARMED on exactly one match, every arm AS DECLARED, every restore sha256+cmp YES.
 *
 * FIRST RUN OF THIS DRAFT (2026-09-18, the resuming worker), recorded rather than smoothed: 30/3. B1 and D1
 * compared an ORDER the code never promised (a same-`at` tie, a GROUP BY's key order) and now compare sets;
 * E1 was a FIXTURE defect — sam was enrolled as an ADMINISTRATOR, so `#viewerSees` took viewerPredicate's
 * admin disjunct and E1 measured the role rather than the share. Sam is now a plain member.
 */
/* *
 * REC-129 / IC-143 — THE FRONTIER'S INTERNET-LEVEL READ (`OBSERVATION-LOG-DESIGN.md`
 * §6's frontier row at the internet level, over §4.5's member half: the LEAD's
 * looks, which MK-4 writes through `op=leadlook`).
 *
 * WHAT THIS SUITE IS FOR, every half THROUGH THE OPS against the real plane in
 * miniflare, under SIGNED-IN members (a lead is only ever a member's):
 *
 *   A. an empty answer ALWAYS carries a cause naming the level — `no_member` for
 *      a credential that carries no member, `no_leads_visible`, `never_followed`
 *      — and says what this level does NOT read (`not_read`). THE LIAR is an
 *      empty answer with no cause: it reads exactly like a frontier that looked
 *      and found nothing;
 *   B. the level answers from MK-4's looks: the latest look per subject, a lead
 *      nobody has followed in `never_looked` with §5.1's cause (3) established;
 *   C. LEAD VISIBILITY (BOB #14's ruling) holds at the frontier, and is asserted
 *      BY DIGEST, not by field: a viewer's WHOLE answer is byte-identical before
 *      and after every act on a lead outside their reach — so a hidden lead can
 *      move no list, no date, no count, no `truncated` and no cause. That
 *      includes the case peculiar to this level: two leads with IDENTICAL words
 *      are one frontier subject, and a later look under the hidden one must not
 *      displace or re-date the row the viewer sees;
 *   D. OVER-STRICTNESS: once the author SHARES a lead, a JOINED participant finds
 *      it in the frontier — and an invited-only member still does not;
 *   E. a look's referent the viewer cannot read is not published (leadRead's rule);
 *   F. the bound is published, and `truncated` describes only rows you may read.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";

const SRC_DIR = process.env.REC129_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r129", MEMBER_TOKEN: "mem-r129", PROBE_TOKEN: "prb-r129",
              AI_TOKEN: "ai-r129", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const F = async (tok, qs = "") => get("frontier", `level=internet${qs}`, tok);
const digest = (r) => sha(JSON.stringify(r));
const causeOf = (r) => (r && r.empty) ? r.empty.cause : null;
/* A tally is a MAP; its key order is the GROUP BY's and not a claim, so it is compared sorted. */
const tallyOf = (r) => Object.fromEntries(Object.entries((r && r.tally) || {}).sort());

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role = "admin") => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, "adm-r129");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");
/* SAM IS A PLAIN MEMBER, NOT AN ADMINISTRATOR — corrected 2026-09-18 on the draft's first run: enrolled
   as `admin` (this fixture's default), sam's `#viewerSees` took `viewerPredicate`'s admin disjunct and read
   P3's capture, so E1 measured the ROLE rather than the share. The lead rule itself names no admin arm.
   A group's second member must be an administrator (ADMINS_FIRST), so ada is enrolled to make that so. */
await enrol("ada");
const SAM = await enrol("sam", "member");
const VERA = await enrol("vera", "member");
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
const projMd = (id) => ["---", `id: ${id}`, "object_type: project", "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
const readingOf = (captureSha) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW, entities: [] } });

let snapSeq = 0;
const promote = async (id, text, type, tok, { readings = [], state = "collected" } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260918T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    register: readings.map((d) => ({ sha256: d.capture.sha256, path: "captures/doc.pdf",
                                     encoding: "binary", bytes: 10 })),
    files }, tok);
  if (!r || r.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};
const SHA_OPEN = sha("rec129-the-clerks-march-agenda");
const SHA_SECRET = sha("rec129-a-document-filed-in-ruths-own-project");
await promote("INFO-2026-0918-agenda129", infoMd("INFO-2026-0918-agenda129"), "information", RUTH,
              { readings: [readingOf(SHA_OPEN)] });
const P1 = "PROJ-2026-0918-shared129", P3 = "PROJ-2026-0918-ruthonly129";
await promote(P1, projMd(P1), "project", RUTH, { state: "forming" });
await promote(P3, projMd(P3), "project", RUTH, { state: "forming", readings: [readingOf(SHA_SECRET)] });
const inv = async (owner, p, handle) => get("projectinvite", `projectId=${p}&handle=${handle}`, owner);
const joinP = async (tok, p) => get("projectjoin", `projectId=${p}`, tok);
const i1 = await inv(RUTH, P1, "sam"), j1 = await joinP(SAM, P1), i2 = await inv(RUTH, P1, "vera");
t("FIXTURE: sam invited and JOINED to P1, vera invited only; P3 is ruth's alone and holds a capture",
  [i1 && i1.ok, j1 && j1.state, i2 && i2.ok], [true, "joined", true]);
const mintAi = async (tokenId, principalKind, principalMember, by) => {
  const r = await post("aicredentialmint", { tokenId, principalKind, principalMember, taskScope: "investigative",
    writes: [], note: "REC-129: a read-only key, to measure what a minted scope reaches at the frontier" }, by);
  if (!r || !r.token) throw new Error(`mint ${tokenId}: ${JSON.stringify(r).slice(0, 400)}`);
  return r.token;
};
const AI_SAM = await mintAi("r129-sam", "member", "sam", SAM);
const AI_ORG = await mintAi("r129-org", "organisation", null, RUTH);

const W = "I was told the contract was amended; look at the Clerk's March agenda.";
const W2 = "The vendor's second bid was filed after the deadline.";

/* ============ A. THE EMPTY ANSWER CARRIES ITS CAUSE ======================== */
console.log("\n--- A. an empty internet frontier says which level, and why ---");
const r0 = await F(RUTH);
t("A1: the internet level is BUILT and, with no lead anywhere, answers EMPTY WITH A CAUSE naming the level",
  [r0 && r0.built, r0 && r0.found, r0 && r0.level, r0 && r0.looked && r0.looked.length,
   r0 && r0.empty && r0.empty.level, causeOf(r0), typeof (r0 && r0.empty && r0.empty.says)],
  [true, true, "internet", 0, "internet", "no_leads_visible", "string"]);
t("A2: the bound is published on the empty answer, and so is what this level does NOT read",
  [r0 && r0.limit, r0 && r0.truncated, r0 && r0.not_read && r0.not_read.map((x) => x.subject_kind),
   r0 && r0.reads && r0.reads.authority_kind, r0 && r0.tally_scope],
  [200, false, ["unstated", "address"], "lead", "visible_to_viewer"]);
for (const [who, tok] of Object.entries({ "the member TOKEN": "mem-r129", "the admin TOKEN": "adm-r129",
                                          "an ORGANISATION-scoped ai key": AI_ORG })) {
  const r = await F(tok);
  t(`A3: ${who} carries no member, reaches no lead, and SAYS so (no_member) rather than answering bare`,
    [r && r.built, r && r.looked && r.looked.length, causeOf(r)], [true, 0, "no_member"]);
}

/* Every OTHER viewer's whole answer, before anything of ruth's exists. */
const VIEWERS = { sam: SAM, vera: VERA, otto: OTTO, "sam's ai key": AI_SAM, "the member TOKEN": "mem-r129",
                  "the admin TOKEN": "adm-r129", "the org ai key": AI_ORG };
const snap = async () => { const o = {}; for (const [k, v] of Object.entries(VIEWERS)) o[k] = digest(await F(v)); return o; };
const before = await snap();

/* ============ B. THE LEVEL ANSWERS FROM MK-4's LOOKS ======================== */
console.log("\n--- B. ruth writes two leads and follows one ---");
const L1 = (await post("lead", { words: W }, RUTH)).lead_id;
const L2 = (await post("lead", { words: W2 }, RUTH)).lead_id;
const rB0 = await F(RUTH);
t("B1: two leads, neither followed: `looked` empty, both in `never_looked`, cause never_followed",
  [rB0.looked.length, rB0.never_looked.map((x) => x.lead).sort(), rB0.never_looked_count, causeOf(rB0)],
  [0, [L1, L2].sort(), 2, "never_followed"]);
t("B2: §5.1 cause (3) is ESTABLISHED for a lead nobody followed — not_ruled_out is the one cause, "
  + "because a lead and its looks are born after the log and purged with it",
  rB0.never_looked.map((x) => [x.missing_cause, x.not_ruled_out, x.evidence_one_sided, x.subject_kind]),
  [["never_looked", ["never_looked"], false, "description"], ["never_looked", ["never_looked"], false, "description"]]);
const lk1 = await post("leadlook", { lead: L1, state: "LOOKED_ABSENT", detail: "no amendment item" }, RUTH);
const rB1 = await F(RUTH);
const row1 = rB1.looked[0];
t("B3: after ruth follows L1 and finds nothing, the frontier carries its look: subject = her words, the "
  + "lead as the authority, LOOKED_ABSENT, found_nothing",
  [lk1.ok, rB1.looked.length, row1 && [row1.subject, row1.subject_kind, row1.authority_kind, row1.lead,
   row1.state, row1.found_nothing, row1.coverage]],
  [true, 1, [W, "description", "lead", L1, "LOOKED_ABSENT", true, "none_owed"]]);
t("B4: L2 alone is still never followed, the answer is not empty, and the tally counts her one look",
  [rB1.never_looked.map((x) => x.lead), rB1.empty, rB1.tally], [[L2], null, { LOOKED_ABSENT: 1 }]);
const lk2 = await post("leadlook", { lead: L1, state: "PRESENT", resultKind: "capture", resultRef: SHA_OPEN }, RUTH);
const rB2 = await F(RUTH);
const row2 = rB2.looked.find((x) => x.lead === L1);
t("B5: a later PRESENT look becomes the subject's latest row, backed, and last_verified is its date",
  [lk2.ok, row2 && [row2.state, row2.result_kind, row2.result_ref, row2.coverage, row2.last_verified === lk2.at]],
  [true, ["PRESENT", "capture", SHA_OPEN, "backed", true]]);

/* ============ C. VISIBILITY, BY DIGEST ===================================== */
console.log("\n--- C. a lead outside a viewer's reach moves NOTHING in their answer ---");
const after = await snap();
for (const k of Object.keys(VIEWERS))
  t(`C1: ${k}'s WHOLE internet frontier is byte-identical before and after ruth's two leads and two looks`,
    after[k], before[k]);
/* THE IDENTICAL-WORDS CASE: sam writes a lead with ruth's exact words and follows it. */
const ruthBefore = digest(await F(RUTH));
const LS = (await post("lead", { words: W }, SAM)).lead_id;
const lks = await post("leadlook", { lead: LS, state: "LOOKED_INDETERMINATE", detail: "portal down" }, SAM);
t("C2: sam's lead carries ruth's exact words and his look lands AFTER hers (a later seq)",
  [lks.ok, lks.seq > lk2.seq], [true, true]);
t("C3: ruth's WHOLE frontier is byte-identical after sam's hidden lead and his later look at the SAME "
  + "subject — it does not become her latest row, re-date it, or move her tally",
  digest(await F(RUTH)), ruthBefore);
const rS = await F(SAM);
t("C4: sam sees ONLY his own look at that subject: his state, his lead, no PRESENT and no last_verified "
  + "borrowed from ruth's hidden one, and his tally counts his one look",
  [rS.looked.length, rS.looked[0] && [rS.looked[0].lead, rS.looked[0].state, rS.looked[0].last_verified],
   rS.tally, rS.never_looked.length],
  [1, [LS, "LOOKED_INDETERMINATE", null], { LOOKED_INDETERMINATE: 1 }, 0]);

/* ============ D. THE SHARE, AND OVER-STRICTNESS ============================= */
console.log("\n--- D. ruth shares L1 to P1 ---");
const veraBefore = digest(await F(VERA)), ottoBefore = digest(await F(OTTO));
const sh = await post("leadshare", { lead: L1, project: P1 }, RUTH);
t("D0: the share lands", sh && sh.ok, true);
const rD = await F(SAM);
const dRow = rD.looked.find((x) => x.subject === W);
t("D1: OVER-STRICTNESS — sam, JOINED to P1, now reads the shared lead's looks: his own later look is still "
  + "the subject's latest, but ruth's PRESENT now DATES it (last_verified) and his indeterminate after it is "
  + "`unreachable_since`; his tally counts the three looks he may now read",
  [rD.looked.length, dRow && [dRow.lead, dRow.state, dRow.last_verified === lk2.at,
                              dRow.unreachable_since === lks.at], tallyOf(rD)],
  [1, [LS, "LOOKED_INDETERMINATE", true, true], { LOOKED_ABSENT: 1, LOOKED_INDETERMINATE: 1, PRESENT: 1 }]);
t("D2: L2, never shared, stays out of sam's reach — not in `never_looked`, not anywhere",
  JSON.stringify(rD).includes(L2), false);
const rDai = await F(AI_SAM);
t("D3: sam's member-scoped ai key reaches exactly what sam reaches — its whole answer IS sam's",
  [rDai && rDai.built, digest(rDai) === digest(rD)], [true, true]);
t("D4: vera (invited to P1, never joined) and otto (no position) are byte-identical to before the share",
  [digest(await F(VERA)) === veraBefore, digest(await F(OTTO)) === ottoBefore], [true, true]);
for (const [who, tok] of Object.entries({ "the member TOKEN": "mem-r129", "the org ai key": AI_ORG }))
  t(`D5: ${who} still reaches no lead after the share (no_member), byte-identical to before`,
    digest(await F(tok)), before[who]);

/* ============ E. A REFERENT THE VIEWER CANNOT READ ========================== */
console.log("\n--- E. a look's referent the reader cannot read is not published ---");
const lk3 = await post("leadlook", { lead: L1, state: "PRESENT", resultKind: "capture", resultRef: SHA_SECRET }, RUTH);
t("E0: ruth's look at L1 finds a capture filed in P3, a project only she is in", lk3 && lk3.ok, true);
const eR = (await F(RUTH)).looked.find((x) => x.lead === L1);
const eS = (await F(SAM)).looked.find((x) => x.lead === L1);
t("E1: ruth sees the referent; sam — who reads the lead through the share — sees the look but NOT the "
  + "capture sha of a document in a project he has not joined (leadRead's rule, same helper)",
  [eR && eR.result_ref, eS && eS.state, eS && eS.result_ref, eS && eS.result_kind,
   JSON.stringify(await F(SAM)).includes(SHA_SECRET)],
  [SHA_SECRET, "PRESENT", null, null, false]);

/* ============ F. THE BOUND ================================================= */
console.log("\n--- F. the bound, and a truncated that describes only what you may read ---");
await post("leadlook", { lead: L2, state: "LOOKED_ABSENT" }, RUTH);
const f1 = await F(RUTH, "&limit=1");
t("F1: ruth, two subjects, limit 1: one row, limit 1, truncated TRUE",
  [f1.looked.length, f1.limit, f1.truncated], [1, 1, true]);
const f2 = await F(SAM, "&limit=1");
t("F2: sam, one visible subject, limit 1: truncated FALSE — ruth's second subject is not his to count",
  [f2.looked.length, f2.truncated], [1, false]);
t("F3: an over-ask is answered at the ceiling (2000)", (await F(RUTH, "&limit=999999")).limit, 2000);

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nfrontier-internet: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
