/* NEGATIVE CONTROL: RUN 2026-09-25 by the D-681 worker with `node test/leadlist.control.mjs` from `bio-plane/`, the FIRST
 * run and unamended, against src/store.mjs b1c71234c174… (3,475,993 B), every restore EQUAL by sha256 AND byte compare,
 * driver exit 0, 5/5 AS DECLARED over a BASELINE of 23 pass, 0 fail. RE-RUN the same day after `leadList` returned its
 * no-reach answer early (so `derivation-bounds` could grade its `#rows(` source), against store.mjs e2b15ce33f44…
 * (3,476,264 B): 5/5 AS DECLARED again, every figure below identical, every restore EQUAL by sha256 AND byte compare:
 *   (1) `bysubject`, THE ROW'S OWN, the list grouped by subject again -> 15 pass, 8 fail, failing "SAME WORDS, TWO
 *       LEADS" by name and sparing the never-followed, no-leak and ceiling assertions;
 *   (2) `wide`, the fence dropped -> 20 pass, 3 fail, "NO EXISTENCE LEAK" and vera's;
 *   (3) `noshare`, the share arm of the fence dropped -> 22 pass, 1 fail, "AFTER the share, sam (joined)";
 *   (4) `uncapped`, the page cut removed -> 22 pass, 1 fail, "a page of 1 over three";
 *   (5) `respelled`, OVER-STRICTNESS, the latest state through MAX(seq) -> 23 pass, 0 fail, GREEN as declared.
 *
 * D-681 — op=leadlist: THE LEADS A MEMBER MAY READ, EACH ONCE, WITH ITS OWN LATEST STATE
 * (`MEMBER-KNOWLEDGE-DESIGN.md` §5, the lead's surface).
 *
 * THE DEFECT. D-194's surface listed a member's leads from `op=frontier&level=internet`, whose `looked` keeps
 * the latest look per SUBJECT — the lead's words — so a lead whose words equal another readable lead looked
 * at later appeared in neither `looked` nor `never_looked`: it vanished from the member's list. Reproduced
 * through the op before the build (two leads, one sentence, looked at in turn: the first was in neither list).
 *
 * WHAT THIS SUITE DRIVES, THROUGH THE OPS against the real plane in miniflare, under SIGNED-IN members:
 *   1. THE ROW'S ACCEPTS-WHEN: two readable leads with the same words, looked at in turn, are BOTH listed,
 *      each with its OWN latest state — and the state is `op=leadread`'s for the same lead;
 *   2. a lead nobody followed is listed NEVER_LOOKED;
 *   3. VISIBILITY is `#leadReach`'s: a member with no lead of their own and no share reads an EMPTY list, the
 *      same bytes before and after another member's leads exist; every machine credential nobody minted a
 *      scope for reads the same; a member-scoped ai key reads its member's; a share to a project admits its
 *      JOINED participant to THAT lead only, and an invited one to none;
 *   4. THE BOUND: a page of 1 over three with `truncated` TRUE, FALSE at the default, and an over-ask answered
 *      at the ceiling.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d681", MEMBER_TOKEN: "mem-d681", PROBE_TOKEN: "prb-d681",
              AI_TOKEN: "ai-d681", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks the answer's shape NAMES the assertions it broke. */
const listed = (r) => (r && Array.isArray(r.leads)) ? r.leads : [];
const stateOf = (r, id) => { const x = listed(r).find((l) => l.lead_id === id); return x ? x.state : null; };
const ids = (r) => listed(r).map((l) => l.lead_id).sort();

const NOW = "2026-09-25T00:00:00Z";
const LATER = "2026-09-25T01:00:00Z";

try {

const enrol = async (memberId, role = "admin") => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, "adm-d681");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");
const SAM = await enrol("sam");
/* `member`, not `admin`: a THIRD administrator needs the consensus of the existing ones. */
const VERA = await enrol("vera", "member");

/* SAM's answer BEFORE any lead exists — the bytes every viewer outside a lead's reach must go on reading. */
const samEmpty = await get("leadlist", "", SAM);
t("FIXTURE: before any lead exists, sam's list is an ANSWER, empty, with its bound and its cause",
  [samEmpty && samEmpty.ok, listed(samEmpty).length, samEmpty && samEmpty.limit,
   samEmpty && samEmpty.empty && samEmpty.empty.cause], [true, 0, 200, "no_leads_visible"]);

/* ===================== 1. THE ROW'S ACCEPTS-WHEN ========================== */
console.log("\n--- 1. two leads with the same words, looked at in turn ---");
const WORDS = "I was told the contract was amended; look at the Clerk's March agenda";
const wA = await post("lead", { words: WORDS }, RUTH);
const wB = await post("lead", { words: WORDS }, RUTH);
const A = wA && wA.lead_id, B = wB && wB.lead_id;
t("FIXTURE: two leads, one sentence, two ids", [!!A, !!B, A !== B], [true, true, true]);
const lA = await post("leadlook", { lead: A, state: "LOOKED_ABSENT" }, RUTH);
const lB = await post("leadlook", { lead: B, state: "LOOKED_INDETERMINATE" }, RUTH);
t("FIXTURE: the first is looked at (LOOKED_ABSENT), THEN the second (LOOKED_INDETERMINATE)",
  [lA && lA.ok, lB && lB.ok], [true, true]);
/* The defect, restated where it lives, so a reader sees why this suite exists: the frontier keeps the latest
   look per SUBJECT, and that is its contract — this is not asserted as a fault of the frontier. */
const fr = await get("frontier", "level=internet", RUTH);
console.log(`  (the frontier's internet level, per SUBJECT by contract: looked=${JSON.stringify(
  (fr && fr.looked || []).map((r) => r.lead))} never_looked=${(fr && fr.never_looked || []).length})`);
const r1 = await get("leadlist", "", RUTH);
t("SAME WORDS, TWO LEADS: both are listed, each with its OWN latest state",
  [stateOf(r1, A), stateOf(r1, B)], ["LOOKED_ABSENT", "LOOKED_INDETERMINATE"]);
t("each lead is listed ONCE", [listed(r1).filter((l) => l.lead_id === A).length,
  listed(r1).filter((l) => l.lead_id === B).length], [1, 1]);
const rdA = await get("leadread", `id=${A}`, RUTH), rdB = await get("leadread", `id=${B}`, RUTH);
t("the list and op=leadread cannot disagree: each listed state IS the read's `state` for that lead",
  [stateOf(r1, A) === (rdA && rdA.state), stateOf(r1, B) === (rdB && rdB.state)], [true, true]);
const rowA = listed(r1).find((l) => l.lead_id === A) || {};
t("a listed lead carries its words, its author, its look count and when it was last looked at, and is never evidence",
  [rowA.words, rowA.author, rowA.looks, typeof rowA.looked_at, rowA.evidence], [WORDS, "ruth", 1, "string", false]);

/* ===================== 2. A LEAD NOBODY FOLLOWED ========================== */
console.log("\n--- 2. a lead nobody followed ---");
const wC = await post("lead", { words: "the vendor was paid twice", locator: "the Q2 check register" }, RUTH);
const C = wC && wC.lead_id;
const r2 = await get("leadlist", "", RUTH);
const rowC = listed(r2).find((l) => l.lead_id === C) || {};
t("a lead nobody followed is listed NEVER_LOOKED, with no look and no look date, its locator as written",
  [rowC.state, rowC.looks, rowC.looked_at, rowC.locator], ["NEVER_LOOKED", 0, null, "the Q2 check register"]);
t("all three of ruth's leads, and no fourth", ids(r2), [A, B, C].sort());
t("a list that holds leads carries no empty cause", r2 && r2.empty, null);

/* ===================== 3. WHO READS WHAT ================================== */
console.log("\n--- 3. the list is the lead's own visibility rule ---");
const norm = (r) => JSON.stringify(r);
t("NO EXISTENCE LEAK: sam's list after ruth wrote three leads is BYTE-IDENTICAL to sam's list before any existed",
  norm(await get("leadlist", "", SAM)) === norm(samEmpty), true);
const mintAi = async (tokenId, principalKind, principalMember, by) => {
  const r = await post("aicredentialmint", { tokenId, principalKind, principalMember, taskScope: "investigative",
    writes: [], note: "D-681: a read-only key, to measure what a minted scope reaches" }, by);
  if (!r || !r.token) throw new Error(`mint ${tokenId}: ${JSON.stringify(r).slice(0, 400)}`);
  return r.token;
};
const AI_RUTH = await mintAi("d681-ruth", "member", "ruth", RUTH);
const AI_ORG = await mintAi("d681-org", "organisation", null, RUTH);
t("OVER-STRICTNESS: ruth's member-scoped ai key lists ruth's leads — the minted scope reaches them",
  ids(await get("leadlist", "", AI_RUTH)), [A, B, C].sort());
for (const [who, tok] of Object.entries({ "the member TOKEN (unfiltered, nobody minted it)": "mem-d681",
                                           "the admin TOKEN": "adm-d681",
                                           "an ORGANISATION-scoped ai key": AI_ORG })) {
  const r = await get("leadlist", "", tok);
  t(`${who} lists NO lead, and its answer is the empty answer`,
    [listed(r).length, r && r.empty && r.empty.cause], [0, "no_leads_visible"]);
}
/* THE SHARE: one lead, to one project sam has joined and vera was only invited to. */
let snapSeq = 0;
const projMd = () => ["---", "object_type: project", "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
const mkProject = async (label, tok) => {
  const md = projMd();
  const r = await post("promote", { base: null,
    snapKey: `20260925T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(label).slice(0, 8)}`,
    meta: { object_type: "project", group: "believe-in-oakland", title: `title for ${label}`,
            current_state: "forming", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }, tok);
  if (!r || r.ok === false || !r.bundleId) throw new Error(`project ${label}: ${JSON.stringify(r).slice(0, 400)}`);
  return r.bundleId;
};
const P1 = await mkProject("d681-contract", RUTH);
const i1 = await get("projectinvite", `projectId=${P1}&handle=sam`, RUTH);
const j1 = await get("projectjoin", `projectId=${P1}`, SAM);
const i2 = await get("projectinvite", `projectId=${P1}&handle=vera`, RUTH);
t("FIXTURE: sam invited and JOINED to P1, vera invited only — through the acts",
  [i1 && i1.ok, j1 && j1.state, i2 && i2.ok], [true, "joined", true]);
const sh = await post("leadshare", { lead: A, project: P1 }, RUTH);
t("FIXTURE: ruth shares lead A (only) to P1", sh && sh.ok, true);
const samAfter = await get("leadlist", "", SAM);
t("AFTER the share, sam (joined) lists lead A with its state — and not B or C, which were never shared",
  [ids(samAfter), stateOf(samAfter, A)], [[A], "LOOKED_ABSENT"]);
t("vera (invited, never joined) still lists nothing", listed(await get("leadlist", "", VERA)).length, 0);

/* ===================== 4. THE BOUND ======================================= */
console.log("\n--- 4. op=leadlist is capped, and says so ---");
const b1 = await get("leadlist", "limit=1", RUTH);
t("a page of 1 over three: one lead, `limit` 1, `truncated` TRUE",
  [listed(b1).length, b1 && b1.limit, b1 && b1.truncated], [1, 1, true]);
t("the page is the NEWEST lead", listed(b1)[0] && listed(b1)[0].lead_id, C);
t("at the default bound: all three, `truncated` FALSE, `limit` 200",
  [listed(r2).length, r2 && r2.truncated, r2 && r2.limit], [3, false, 200]);
const bOver = await get("leadlist", "limit=999999", RUTH);
t("an over-ask is answered at the ceiling (2000), never beyond it", bOver && bOver.limit, 2000);

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nleadlist: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
