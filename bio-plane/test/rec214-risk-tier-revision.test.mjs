/* NEGATIVE CONTROL: RUN 2026-09-24 by the REC-214 worker (branch land/worker/REC-214 over origin/main 9f8b69e6), each arm ALONE in src/store.mjs, the anchor asserted to occur exactly once, restored by cp from a uniquely-named per-arm pristine copy in the session scratchpad (never the worktree) and verified by sha256 4aff8ac574e6... AND cmp at 3,335,632 B after every arm; baseline 49 pass / 0 fail before and after; RE-RUN IN FULL after §5's literal C-numbers and §6b's bound arm were added, baseline 52 / 0 before and after, every figure below from that re-run.
   (A) THE ROW'S MACHINE FENCE AT THE ACT removed (`const machine = null;` in actionRiskTier). DECLARED: §4's empty-payload arm fails (the machine then hears BAD_RISK_TIER). FIRST RUN 47/1 — only that arm — A SURPRISING GREEN on the complete-payload pin, and a finding about the ARM: `promote`'s own C-32.19 fence refuses the same machine one layer down (its tier changes), so the code alone could not say the ACT refused. An arm reading WHICH fence fired (the act's own detail) was added; RE-RUN 50/2, both §4 arms BY NAME. Recorded as the second measurement, not the first.
   (B) THE APPEND-ONLY LIAR, the one the ruling names: #appendRiskTierHistory REPLACES the block with the new row instead of appending (`...lines.slice(hi + 1, last + 1)` dropped). DECLARED: §3's two-entries and first-entry-untouched arms fail. RESULT 39/13, AS DECLARED BY NAME ("the history now holds TWO entries", "THE FIRST ENTRY IS UNTOUCHED", the chain), plus §4-§7 arms counting two entries downstream of the history having been overwritten, and both §6b bound arms (an overwritten history never grows, so the bound is never reached).
   (C) THE PROMOTE FENCE DISARMED (`if (false && (tierMoved || histMoved))`, is-promote-risk-tier). DECLARED: §6's four RISK_TIER_REWRITTEN arms fail; §1-§5 hold. RESULT 43/9: the four BY NAME, then five downstream of the first silent overwrite having LANDED (tier 1 with no history entry: the later bases are stale and §7's bytes no longer close — the overwrite the ruling closes, measured). §1-§5 held.
   (D) OVER-STRICTNESS, the fence applied to the act itself (`if (!pkg[RISK_TIER_ACT])` -> `if (true)`). DECLARED: §2's member act fails and everything resting on it follows; §1 and §4's machine arms hold. RESULT 22/30, AS DECLARED (§6b's 200 revisions among them). Its FIRST run ended at a TypeError with no tally (-1) — a read of `risk_tier_history[0]` over bytes the refused act never wrote; the reads were made total and the arm re-run to its foot.
   (E) THE REASON MADE OPTIONAL (`!why ||` dropped). DECLARED: §5's no-reason and blank-reason arms fail. RESULT 47/5: both BY NAME, then three downstream of a reasonless revision having landed (the tier moved to 3, so "already held", "nothing moved" and §7's bytes follow).
   (F) OVER-STRICTNESS, a spelling not anticipated: the promote fence's condition as `[tierMoved, histMoved].some(Boolean)`. DECLARED all green. RESULT 52/0, AS DECLARED: the suite is coupled to behaviour, not to an expression. */
/* REC-214: A MEMBER REVISES AN ACTION'S RISK TIER — AN AUTHORED, APPEND-ONLY ACT (BOB #33, 2026-09-24, "Risk-tier
 * revision"; `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier`).
 *
 * The ruling: `actionrisktier` is a member-class op writing through the one front-matter path every reader derives
 * the tier from. A machine credential is refused MACHINE_CANNOT_SET_RISK_TIER. A member may revise any tier, up or
 * down, as an AUTHORED act recording who, when and a REQUIRED reason. APPEND-ONLY: the prior tier, its author and
 * its reason stay readable in the action's tier history; nothing is ever silently overwritten. The field carries
 * legal exposure — the record must show that a "do not file without counsel" tier was changed, and by whom.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, each in the direction that fails:
 *   1. INTAKE: a member creates an action at tier 3; it reads 3, NEVER REVISED, and the intake tier's author is
 *      stated UNDETERMINED in words (an intake writes no author for its tier).
 *   2. THE ACT: a member revises 3 -> 1 with a reason. Every reader agrees on 1 — the read, the stored column, the
 *      bytes and `op=search q=risk:` — because the act writes the ONE path. The history holds the revision
 *      (tier, prior, by, at, reason), the intake 3 stays readable, and the Session Log records it.
 *   3. APPEND-ONLY: a second member revises 1 -> 2. The first entry — its author and its reason — is still there,
 *      byte for byte, and the second's prior is the first's tier.
 *   4. THE MACHINE is refused BY NAME at the act (C-32.19, code, C-number and translation on the wire), before any
 *      payload complaint, and nothing moves.
 *   5. THE SHAPE: no reason, a reason the grammar cannot hold, `undetermined`, a tier outside 1..3, and the tier
 *      already held — each refused by its own C-90 code, nothing moves.
 *   6. NO OTHER WRITER: a member's plain promote that changes the tier, drops a history entry, edits a reason, or a
 *      creation that states a history — each refused RISK_TIER_REWRITTEN (C-90.1). OVER-STRICTNESS beside it: a
 *      plain revision carrying tier and history forward unchanged lands, and so does `op=actionmove`.
 *   7. THE CATALOGUE judges the same chain on bytes (C-2.10): the act's own bytes pass; a history that does not
 *      close, or ends on a tier the document does not state, is an error by name.
 *
 * WHAT IT CANNOT SEE: whether a reason is a good one — nobody but a member can judge that, and the plane does not
 * try. A `replay` promote is exempt from the fence with the rest of the action block (D-511's residue); REC-215's
 * machine PROPOSAL is not built and is not driven here.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, MACHINE_FENCE_CHECKS, RISK_TIER_REVISION_CHECKS, RISK_TIERS,
         riskTierHistoryOf } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");
const PINNED = "2026-08-20T00:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec214", MEMBER_TOKEN: "mem-rec214", PROBE_TOKEN: "prb-rec214",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
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

/* THE OP UNDER TEST, through the CONTROL PLANE, its name UNINTERPOLATED so coverage credits it. */
const actionrisktier = async (tok, target, body) =>
  rP(await POST(`op=actionrisktier&token=${tok}&target=${encodeURIComponent(target)}`, body));
const proj = async (tok, id) => rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`));
const textOf = async (tok, id) => { const f = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`)); return typeof f?.text === "string" ? f.text : ""; };
const fmOf = (text) => parseFrontmatter(text).data || {};
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64), nowMs: PINNED_MS,
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const tierErrors = (errs) => errs.filter((e) => /risk_tier/.test(e));
const wire = (r) => [r?.code ?? r?.reason ?? null, r?.check ?? null, r?.translation ?? null];

const actionMd = (id, { tier = "3", history = null, plan = "Ask for the transfer ledger." } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "action_kind: other", `risk_tier: ${tier}`,
  "counterparty:", "  state: named", "  name: City Clerk",
  ...(history === null ? [] : ["risk_tier_history:", ...history.flatMap((e) => [
    `  - tier: ${e.tier}`, `    prior: ${e.prior}`, `    by: "${e.by}"`, `    at: "${e.at}"`, `    reason: "${e.reason}"`])]),
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-rec214",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");
const MACHINE = "mem-rec214";   /* MEMBER_TOKEN: a machine credential by REC-46's predicate (`token:member`) */

let snapKeySeq = 0;
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: "action", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "planned", created: NOW, last_updated: LATER },
  }));
const headOf = async (id) => (await proj(NADIA, id))?.bundle_sha;
const searchIds = async (q) => (rP(await GET(`op=search&token=${NADIA}&q=${encodeURIComponent(q)}`))?.hits ?? [])
  .map((h) => h.bundle_id);

const ACT = "ACTN-2026-2140-counsel-first";
const R1 = "the city attorney confirmed the request carries no litigation exposure";
const R2 = "a named official is now involved; file with caution";

/* ===================================================================== */
console.log("\n--- 1. intake: a member creates the action at tier 3 ---");
{
  const c = await promote(NADIA, ACT, actionMd(ACT, { tier: "3" }));
  t("a member's creation stating tier 3 lands (intake is not a revision)", c?.ok, true);
  const p = await proj(NADIA, ACT);
  t("it reads 3, in the plane's words", [p?.action?.risk_tier, p?.action?.risk_tier_words],
    [3, "do not file without counsel"]);
  const h = p?.action?.risk_tier_history;
  t("its history reads NEVER REVISED, with the intake tier 3 and no revision",
    [h?.revisions?.length, h?.intake?.tier, h?.current], [0, 3, 3]);
  t("the intake tier's author is UNDETERMINED and SAID so in words — the record holds none, and naming the "
  + "creator would be an inference it cannot support", [h?.intake?.by, /UNDETERMINED who stated it/.test(h?.intake?.stated ?? "")],
    [null, true]);
}

/* ===================================================================== */
console.log("\n--- 2. the act: a member revises 3 -> 1, with a reason ---");
let firstEntryBytes = null;
{
  const before = await headOf(ACT);
  const r = await actionrisktier(NADIA, ACT, { tier: 1, reason: R1 });
  t("op=actionrisktier by a member lands, stamped with the SESSION's member and the pinned instant",
    [r?.ok, r?.risk_tier, r?.prior, r?.by, r?.at, r?.reason], [true, 1, 3, "nadia", PINNED, R1]);
  const p = await proj(NADIA, ACT);
  t("the version moved — the act wrote, it did not only answer", !!before && p?.bundle_sha !== before, true);
  t("EVERY READER AGREES ON 1 — the read and its words, and the stored column (the ONE front-matter path)",
    [p?.action?.risk_tier, p?.action?.risk_tier_words, p?.action_risk_tier], [1, "file freely", 1]);
  t("…and op=search q=risk:1 finds it while q=risk:3 no longer does",
    [(await searchIds("risk:1")).includes(ACT), (await searchIds("risk:3")).includes(ACT)], [true, false]);
  const text = await textOf(NADIA, ACT);
  const fm = fmOf(text);
  t("the bytes state risk_tier 1 and carry ONE history entry", [fm.risk_tier, fm.risk_tier_history?.length], [1, 1]);
  const h = p?.action?.risk_tier_history;
  const e = h?.revisions?.[0] ?? {};
  t("the history's entry: tier 1, replacing 3, by nadia, at the instant, with the member's reason verbatim",
    [e.tier, e.prior, e.by, e.at, e.reason, e.readable], [1, 3, "nadia", PINNED, R1, true]);
  t("THE PRIOR TIER STAYS READABLE: the intake 3 — 'do not file without counsel' — is still in the history",
    [h?.intake?.tier, h?.intake?.tier_words, e.prior_words], [3, "do not file without counsel", "do not file without counsel"]);
  t("the Session Log records the revision and its reason too",
    [/\| Risk tier revised \| nadia/.test(text), text.includes(`Reason: ${R1}`),
     text.includes("risk_tier 3 (do not file without counsel) -> 1 (file freely)")], [true, true, true]);
  t("the act's answer carries the same history the read does (one reader)",
    JSON.stringify(r?.risk_tier_history?.revisions), JSON.stringify(h?.revisions));
  firstEntryBytes = JSON.stringify(fm.risk_tier_history?.[0] ?? null);
}

/* ===================================================================== */
console.log("\n--- 3. append-only: a second member revises 1 -> 2 ---");
{
  const r = await actionrisktier(PILAR, ACT, { tier: "2", reason: R2 });
  t("a second member's revision lands (the query-string spelling \"2\" is the tier 2)", [r?.ok, r?.risk_tier, r?.prior],
    [true, 2, 1]);
  const fm = fmOf(await textOf(NADIA, ACT));
  t("the history now holds TWO entries, oldest first", fm.risk_tier_history?.length, 2);
  t("THE FIRST ENTRY IS UNTOUCHED — its author and its reason, byte for byte", JSON.stringify(fm.risk_tier_history?.[0] ?? null),
    firstEntryBytes);
  const h = (await proj(NADIA, ACT))?.action?.risk_tier_history;
  t("the second's prior is the first's tier, and the chain reads 3 -> 1 -> 2",
    [h?.intake?.tier, ...(h?.revisions ?? []).map((x) => [x.prior, x.tier, x.by])],
    [3, [3, 1, "nadia"], [1, 2, "pilar"]]);
  t("…and the tier now reads 2", (await proj(NADIA, ACT))?.action?.risk_tier, 2);
}

/* ===================================================================== */
console.log("\n--- 4. the machine is refused by name, first ---");
{
  const before = await headOf(ACT);
  const row = MACHINE_FENCE_CHECKS.MACHINE_CANNOT_SET_RISK_TIER;
  const m = await actionrisktier(MACHINE, ACT, { tier: 3, reason: "a machine thinks it is risky" });
  t("a machine credential's complete, well-formed revision is refused MACHINE_CANNOT_SET_RISK_TIER — code, "
  + "C-number and canned translation on the wire", wire(m), ["MACHINE_CANNOT_SET_RISK_TIER", row.check, row.translation]);
  /* WHICH FENCE FIRED. `promote`'s machine fence would also catch this payload one layer down (the tier changes),
     so the code alone cannot say the ACT refused first — found by this suite's own control arm (A), which removed
     the act's fence and saw the pin above stay green. The detail is the act's own sentence. */
  t("…and it is the ACT's fence that refused, before any write was attempted (its detail names the act)",
    /op=actionrisktier is a member's authored revision/.test(m?.detail ?? ""), true);
  const empty = await actionrisktier(MACHINE, ACT, {});
  t("…and an EMPTY one hears the same name, not a payload complaint: the fence stands first",
    empty?.code ?? empty?.reason, "MACHINE_CANNOT_SET_RISK_TIER");
  t("nothing moved: same version, still tier 2, still two entries",
    [await headOf(ACT) === before, (await proj(NADIA, ACT))?.action?.risk_tier,
     fmOf(await textOf(NADIA, ACT)).risk_tier_history?.length], [true, 2, 2]);
}

/* ===================================================================== */
console.log("\n--- 5. the shape, each refused by its own code ---");
{
  const before = await headOf(ACT);
  const R = RISK_TIER_REVISION_CHECKS;
  /* The C-numbers are LITERALS, so a renumbered row fails here by name rather than agreeing with itself. */
  const cases = [
    ["no reason", { tier: 3 }, "RISK_TIER_REASON_REFUSED", "C-90.3"],
    ["a blank reason", { tier: 3, reason: "   " }, "RISK_TIER_REASON_REFUSED", "C-90.3"],
    ["a reason with a quotation mark the grammar cannot hold", { tier: 3, reason: 'counsel said "no"' }, "RISK_TIER_REASON_REFUSED", "C-90.3"],
    ["a reason over 500 characters", { tier: 3, reason: "x".repeat(501) }, "RISK_TIER_REASON_REFUSED", "C-90.3"],
    ["`undetermined` — what nobody-assessed reads, not a tier to set", { tier: "undetermined", reason: "withdraw" }, "BAD_RISK_TIER", "C-90.2"],
    ["a tier outside 1..3", { tier: 4, reason: "very risky" }, "BAD_RISK_TIER", "C-90.2"],
    ["no tier at all", { reason: "no tier" }, "BAD_RISK_TIER", "C-90.2"],
    ["the tier already held — a revision that changes nothing", { tier: 2, reason: "re-affirmed" }, "RISK_TIER_UNCHANGED", "C-90.4"],
  ];
  for (const [label, body, code, check] of cases) {
    const r = await actionrisktier(NADIA, ACT, body);
    t(`${label} is refused ${code}, with its C-90 row (${check})`, wire(r), [code, check, R[code].translation]);
  }
  t("and nothing moved under any of them", [await headOf(ACT) === before,
    fmOf(await textOf(NADIA, ACT)).risk_tier_history?.length], [true, 2]);
  const na = await actionrisktier(NADIA, "ACTN-2026-2149-nobody", { tier: 1, reason: "r" });
  t("an action that does not exist is refused NO_SUCH_BUNDLE", na?.code ?? na?.reason, "NO_SUCH_BUNDLE");
}

/* ===================================================================== */
console.log("\n--- 6. no other writer moves the tier or the history ---");
{
  const R = RISK_TIER_REVISION_CHECKS.RISK_TIER_REWRITTEN;
  const held = await textOf(NADIA, ACT);
  const base = await headOf(ACT);
  const tierMoved = held.replace(/^risk_tier: 2$/m, "risk_tier: 1");
  const r1 = await promote(NADIA, ACT, tierMoved, base);
  t("a MEMBER's plain promote from 2 to 1 is refused RISK_TIER_REWRITTEN (code, C-90.1, translation) — the "
  + "silent overwrite the ruling closes", wire(r1), ["RISK_TIER_REWRITTEN", "C-90.1", R.translation]);
  const fm = fmOf(held);
  const dropped = held.replace(/  - tier: 1\n    prior: 3\n    by: "nadia"\n[^\n]*\n[^\n]*\n/, "");
  t("(the dropping arm armed: one entry fewer in its bytes)", fmOf(dropped).risk_tier_history?.length,
    (fm.risk_tier_history?.length ?? 0) - 1);
  const r2 = await promote(NADIA, ACT, dropped, base);
  t("a plain promote DROPPING the first entry (tier unchanged) is refused RISK_TIER_REWRITTEN",
    r2?.code ?? r2?.reason, "RISK_TIER_REWRITTEN");
  const edited = held.replace(R1, "nobody ever said counsel");
  t("(the editing arm armed)", edited !== held, true);
  const r3 = await promote(NADIA, ACT, edited, base);
  t("a plain promote EDITING an earlier reason is refused RISK_TIER_REWRITTEN", r3?.code ?? r3?.reason,
    "RISK_TIER_REWRITTEN");
  const forged = "ACTN-2026-2141-forged-history";
  const r4 = await promote(NADIA, forged, actionMd(forged, { tier: "1",
    history: [{ tier: 1, prior: 3, by: "member:omar", at: PINNED, reason: "invented" }] }));
  t("a CREATION stating a history nobody revised is refused RISK_TIER_REWRITTEN, and nothing landed",
    [r4?.code ?? r4?.reason, (await proj(NADIA, forged))?.bundle_sha ?? null], ["RISK_TIER_REWRITTEN", null]);
  t("the refusals moved nothing: same version, tier 2, two entries",
    [await headOf(ACT) === base, (await proj(NADIA, ACT))?.action?.risk_tier], [true, 2]);

  /* OVER-STRICTNESS: carrying both forward unchanged is not a change. */
  const planOnly = held.replace("Ask for the transfer ledger.", "Ask for the transfer ledger and the FY2023 memo.");
  const r5 = await promote(NADIA, ACT, planOnly, base);
  t("OVER-STRICTNESS: a member's plain revision of the PLAN, carrying tier and history forward, lands", r5?.ok, true);
  const rm = await promote(MACHINE, ACT, planOnly.replace("FY2023 memo.", "FY2023 and FY2024 memos."), await headOf(ACT));
  t("…and so does a MACHINE's (REC-189: carrying a member's tier forward is not writing it)", [rm?.ok, rm?.code ?? rm?.reason ?? null], [true, null]);
  const mv = rP(await GET(`op=actionmove&token=${NADIA}&target=${encodeURIComponent(ACT)}&to=active&reason=${encodeURIComponent("filed")}`));
  const after = fmOf(await textOf(NADIA, ACT));
  t("…and op=actionmove carries both forward: the move lands and the history is the same two entries",
    [mv?.ok, after.risk_tier, JSON.stringify(after.risk_tier_history)], [true, 2, JSON.stringify(fm.risk_tier_history)]);
}

/* ===================================================================== */
console.log("\n--- 6b. the history is bounded, and the bound refuses rather than truncates ---");
{
  /* C-90.5's OTHER condition — a `risk_tier_history` that is not a block the act can append to — is NOT driven,
     and that is a property of the plane rather than a gap here: `promote` refuses every writer but the act that
     would put any other shape there (C-90.1, §6), so only a replayed document could hold one. The BOUND is its
     reachable half: at RISK_TIER_HISTORY_MAX revisions the act refuses, and never drops the oldest to make room. */
  const B = "ACTN-2026-2142-bounded";
  await promote(NADIA, B, actionMd(B, { tier: "1" }));
  let landed = 0;
  for (let i = 0; i < 200; i++) {
    const r = await actionrisktier(NADIA, B, { tier: i % 2 ? 1 : 2, reason: `revision ${i + 1}` });
    if (r?.ok === true) landed++;
  }
  t("two hundred revisions land (the bound is 200)", landed, 200);
  const before = await headOf(B);
  const over = await actionrisktier(NADIA, B, { tier: 3, reason: "the two hundred and first" });
  const R5 = RISK_TIER_REVISION_CHECKS.RISK_TIER_HISTORY_UNSPLICEABLE;
  t("the two hundred and first is refused RISK_TIER_HISTORY_UNSPLICEABLE (C-90.5), with its translation",
    wire(over), ["RISK_TIER_HISTORY_UNSPLICEABLE", "C-90.5", R5.translation]);
  const fm = fmOf(await textOf(NADIA, B));
  t("…and NOTHING was dropped to make room: same version, 200 entries, the first still 'revision 1'",
    [await headOf(B) === before, fm.risk_tier_history?.length, fm.risk_tier_history?.[0]?.reason], [true, 200, "revision 1"]);
}

/* ===================================================================== */
console.log("\n--- 7. the catalogue judges the same chain on bytes (C-2.10) ---");
{
  const text = await textOf(NADIA, ACT);
  t("the act's own bytes carry NO risk_tier error", tierErrors(await errorsOf(ACT, text)), []);
  const broken = text.replace(/    prior: 1\n/, "    prior: 3\n");
  t("(the broken-chain arm armed)", broken !== text, true);
  t("a history whose second prior is not the first's tier is an error BY NAME: it does not close",
    tierErrors(await errorsOf(ACT, broken)).some((e) => /the history does not close/.test(e)), true);
  const offEnd = text.replace(/^risk_tier: 2$/m, "risk_tier: 3");
  t("a document stating a tier the history does not end on is an error BY NAME",
    tierErrors(await errorsOf(ACT, offEnd)).some((e) => /not the tier the history ends on/.test(e)), true);
  const machineBy = text.replace('by: "pilar"', 'by: "token:member"');
  t("an entry authored by a machine identity is an error BY NAME",
    tierErrors(await errorsOf(ACT, machineBy)).some((e) => /is a machine identity/.test(e)), true);
  t("the one reader over a fixture: revisions in order, unreadable entries kept and flagged, never dropped",
    riskTierHistoryOf({ risk_tier: 2, risk_tier_history: [
      { tier: 1, prior: 3, by: "a", at: PINNED, reason: "r" }, "junk", { tier: 2, prior: 1, by: "b", at: PINNED, reason: "s" }] })
      .revisions.map((x) => [x.ord, x.readable, x.tier ?? null]),
    [[0, true, 1], [1, false, null], [2, true, 2]]);
  t("the reader's words are the catalogue's map", riskTierHistoryOf({ risk_tier: 3 }).current_words, RISK_TIERS[3]);
}

console.log(`\nrec214-risk-tier-revision: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
