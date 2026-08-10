/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/shadowed-refusals.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (REC-73's, PL-11's, PL-4's and PL-3's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY-NAMED per-arm pristine copy, with the byte count printed (store.mjs 1,482,117 · this suite 42,819) and a minimum guarded.
   ALL ELEVEN ARMS RUN 2026-08-08 IN WORKTREE agent-ae602f80abcaf9e01, baseline 44/0 before each, every one behaving as declared on the run recorded here. Figures below are MEASURED.
   **AND THE HEADLINE IS WHAT THE ARMS ANSWERED INSTEAD, WHICH IS REC-73'S FINDING ONE LAYER OUT: WITH ITS OWN GUARD REMOVED AND THE PAYLOAD COMPLETE, FIVE OF THE EIGHT ACTS WENT ALL THE WAY THROUGH.** A member ENROLLED under the handle `Hilda Krause`; a second member WROTE INTO the correspondence ledger another member was holding (ruth's entry landed at `ord` 1, so gus's had taken 0 — two accounts of one exchange interleaved, the precise harm LEASE_HELD's detail names); a REVOKED member BECAME A PROJECT OWNER; an administrator's 7.13 rescue CARRIED on a project that never had an owner; and a case RE-RATIFIED at edition 2 while edition 3 was already published. The other three fell to the complaint sitting directly BEHIND the fence — NO_CASE→`NO_SUCH_CASE`, NOT_AN_OWNER→`LAST_OWNER`, NO_AUTHOR→`NO_REGISTER` — which is the shadow D-230 named, demonstrated rather than argued: an instrument driving those three with an incomplete payload would have read the refusal behind them and reported the fence proved.
   (1) BAD_HANDLE — widen the handle grammar -> 40 pass, 4 FAIL. (2) LEASE_HELD — neuter the lock's conflict test -> 40 pass, 4 FAIL. (3) NO_CASE — let an unnamed case through -> 41 pass, 3 FAIL. (4) NOT_ACTIVE — let a revoked member be made owner (anchored on TWO lines: the literal occurs four times in `store.mjs`) -> 40 pass, 4 FAIL. (5) NOT_AN_OWNER -> 42 pass, 2 FAIL. (6) NO_OWNERS -> 42 pass, 2 FAIL. (7) NO_AUTHOR — and the two OP-LEVEL arms beside it stayed GREEN as declared, because they assert a fact about the control plane rather than about the store's guard -> 42 pass, 2 FAIL. (8) EDITION_NOT_INCREMENTED -> 41 pass, 3 FAIL.
   (9) A NINTH CANNOT ARRIVE UNMEASURED — drop `NO_OWNERS` out of the driven register -> 42 pass, 2 FAIL, naming the code and the count. (10) THE WALK MUST BE ABLE TO GO BLIND AND SAY SO — make the refusal-site matcher match nothing -> 41 pass, 3 FAIL, caught by the corpus FLOOR, and all eight pins stay GREEN because they are driven through the ops and do not depend on the walk. (11) OVER-STRICTNESS is not a separate edit because it is BUILT INTO EVERY PIN: each refusal is followed by the same act driven to SUCCESS with only the guarded condition flipped -> 44/0, all eight success arms green.
   **AND THE INSTRUMENT FAILED FIRST, INSIDE ITS OWN CONTROL — RECORDED RATHER THAN SMOOTHED.** Arm (10) did NOT come back as three clean failures on its first run: it came back `THE SUITE NEVER REACHED ITS FOOT`. With the walk blinded, the shadow table's print loop dereferenced a null and a `TypeError` ended the MODULE THROUGH NO ASSERTION AT ALL, taking all eight pins with it. Caught only because this harness READS THE FOOT LINE instead of trusting the tally, and reports a missing one as `-1` rather than `0`. Corrected at the site with the receipt in the comment; the arm then behaved exactly as declared.
   POLARITY: every pin asserts a specific code and its success twin asserts `ok:true`, so an arm cannot pass by asserting nothing; the eight are confirmed against `store.mjs` before any claim is made about them; and the walk's corpus is floored on size before any membership claim is made over it.
 * =========================================================================
 * REC-78 / D-230 — THE EIGHT IDENTITY REFUSALS THAT SHADOW A PAYLOAD
 * COMPLAINT AND THAT NO SUITE PINNED AT ALL.
 *
 * WHY THIS SUITE EXISTS. REC-73 proved the twelve `MACHINE_CANNOT_*` fences by
 * driving each one under a payload that would OTHERWISE SUCCEED, and then
 * driving the same payload to success by a caller who may perform it. Its block
 * 4 then swept `store.mjs` for the same defect elsewhere: for every refusal, how
 * many distinct refusals sit BEHIND it in the same method. A refusal in front of
 * others SHADOWS them — while it fires, nothing behind it can — so a control
 * that drives it with a payload the plane would have refused anyway has shown
 * that the refusal FIRES and has NOT shown that the refusal is WHAT FIRES.
 *
 * That sweep found EIGHT identity-flavoured refusals which shadow something and
 * which NO suite pinned at all: `BAD_HANDLE`, `EDITION_NOT_INCREMENTED`,
 * `LEASE_HELD`, `NOT_ACTIVE`, `NOT_AN_OWNER`, `NO_AUTHOR`, `NO_CASE`,
 * `NO_OWNERS`. That is WORSE than D-229's class rather than a tail of it: the
 * twelve were believed on half their evidence, and these were not measured at
 * all. Two of them guard OWNERSHIP of a project and one guards a PUBLICATION
 * invariant.
 *
 * WHAT THIS SUITE DOES ABOUT IT, IN ONE SENTENCE: each of the eight is driven
 * under a payload that is complete in every respect EXCEPT the one condition
 * that refusal guards, and is asserted to answer BY NAME; then the SAME payload
 * is driven with ONLY that condition satisfied and asserted to SUCCEED.
 *
 * THE SECOND ARM IS THE GENERALISATION OF REC-73'S, AND SAYING SO PRECISELY
 * MATTERS. REC-73 varied the CALLER (a machine, then a member) because the
 * twelve fences guard WHO is acting. Only some of these eight do. So the rule
 * one layer out is: flip ONLY the condition the refusal itself names, and show
 * the act complete. Where the condition IS the caller (`LEASE_HELD`,
 * `NOT_AN_OWNER`, `NO_AUTHOR`) that is literally REC-73's arm; where it is a
 * property of the target or of the bytes (`NOT_ACTIVE`, `NO_OWNERS`,
 * `EDITION_NOT_INCREMENTED`, `BAD_HANDLE`, `NO_CASE`) the caller is held fixed
 * and the named condition is the only thing that moves. Either way the success
 * is what makes the payload PROVABLY complete — measured rather than asserted.
 *
 * THREE THINGS THIS ITEM MEASURED THAT ITS OWN DEBT ROW DID NOT PREDICT, and
 * they are findings about the SWEEP rather than about the plane:
 *
 *   (a) `NO_AUTHOR` IS UNREACHABLE THROUGH ITS OP, and this suite pins the
 *       unreachability rather than pretending to a pin. `op=provenancechain` is
 *       NOT in SESSION_OPS, so a signed-in member is refused it outright
 *       ("requires a machine credential"); every machine class that CAN reach it
 *       arrives stamped `token:<class>` by the control plane, which is never
 *       blank. So no caller of the op can make the store's `!who` true. It is
 *       driven here at the Durable Object route where it IS reachable, and the
 *       op-level fact — that the guard cannot fire for any caller — is asserted
 *       beside it, because a refusal nobody can reach is a different fact from a
 *       refusal that works.
 *
 *   (b) THE SWEEP'S IDENTITY CLASSIFIER IS GENEROUS BY DESIGN AND FOUR OF THE
 *       EIGHT ARE NOT IDENTITY GUARDS AT ALL. It reads the 300 characters in
 *       front of a refusal for words like `author`, `owner`, `viewer`, `who`.
 *       In `enroll` the word `author` occurs inside the DETAIL STRING of the
 *       refusal in front of `BAD_HANDLE`; in `#queueCaseFor` the word `viewer`
 *       is the method's own PARAMETER. Both are payload checks wearing identity
 *       vocabulary. That is the direction REC-73 said it errs in, measured and
 *       named here rather than left as a caveat — and it is exactly what D-230
 *       predicted would turn up ("fenced by something other than the refusal you
 *       are pinning").
 *
 *   (c) `EDITION_NOT_INCREMENTED` CANNOT BE REACHED THROUGH THE PUBLICATION
 *       CEREMONY AT ALL. `publishCase` mints edition MAX(published_cases)+1 and
 *       a non-case ratification auto-increments, so the number never regresses
 *       and never leaves a hole below itself; the only way to reach the refusal
 *       is an edition AUTHORED INTO THE RATIFIED BYTES that is lower than the
 *       highest already published. That is precisely what the refusal guards —
 *       the edition comes from the bytes the signature covers, so it can be
 *       wrong — and the arm below therefore rewrites the edition scalar in a
 *       real, gate-passing revision rather than pretending the ceremony can do
 *       it.
 *
 * WHAT IS DELIBERATELY NOT DONE. NOTHING IN `bio-plane/src/**` IS CHANGED. No
 * refusal is added, moved, widened or renamed, and no DEC-49 region is touched.
 * The defect D-230 names is in the CONTROLS, and it is the controls that move —
 * REC-73's own posture, one layer out.
 *
 * AND WHAT IS DELIBERATELY LEFT ALONE, because widening is the mistake REC-71
 * exists to correct: the two DEEPEST shadows outside the twelve —
 * `NOT_THE_OWNER` in `promote` (18) and `CAS_STALE` (17). Both are pinned by
 * suites that they FIRE and neither is shown to be WHAT fires. They are a
 * separate item and are named in the report rather than absorbed here.
 *
 * THE BLOCKS:
 *   1. THE HARVEST AND THE SHADOW. The eight are confirmed AGAINST `store.mjs`
 *      rather than trusted, each is measured still to shadow at least one
 *      refusal behind it, and the walk's corpus is floored before any claim is
 *      made over it.
 *   2. THE EIGHT, each with the payload it was driven under and the success that
 *      proves the payload complete.
 *   3. THE COMPLETENESS ARM. The driven set IS the declared set IS the set
 *      REC-73's sweep named, so a ninth cannot arrive unmeasured and none of
 *      these eight can quietly stop being driven.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT, for REC-73's measured reason: an arm that throws on `.reason`
   of undefined takes every arm behind it with it and reports one defect as
   none. */
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason
                    : (r && typeof r.code === "string") ? r.code : null;

/* Comments BLANKED length-preservingly before any source walk, REC-73's
   discipline for REC-73's reason: this file's subject is named in dozens of
   comments inside the spans it walks, and a walk over raw source would read a
   refusal's own explanation as a refusal site. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const STORE_BARE = decomment(STORE_SRC);
const INDEX_BARE = decomment(INDEX_SRC);

/* THE SET, AS A SET. Typed here ONCE and then CONFIRMED against `store.mjs`
   below — the equality that follows a guard, never the equality on its own. It
   is the set REC-73's block 4 printed on 2026-08-08, and
   `machine-fences.test.mjs` now asserts that set is EMPTY because this file
   pins every member of it. Moving either one without the other fails the other,
   which is the property D-230 asked for. */
const EIGHT = ["BAD_HANDLE", "EDITION_NOT_INCREMENTED", "LEASE_HELD", "NOT_ACTIVE",
               "NOT_AN_OWNER", "NO_AUTHOR", "NO_CASE", "NO_OWNERS"];

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec78", MEMBER_TOKEN: "mem-rec78", PROBE_TOKEN: "prb-rec78",
              DAEMON_TOKEN: "dmn-rec78", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-rec78",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

/* Each act registers what it was driven under and what it answered, so the
   suite's own output is the record D-230 asked for rather than a tally. */
const DRIVEN = [];
const pin = (code, payload, answer) => {
  DRIVEN.push({ code, payload, answer });
  t(`${code} — refused BY NAME under a payload complete but for the one condition it guards: ${payload}`,
    answer, code);
};

try {

/* ---------------------------------------------------------------- fixture */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const GROUP = "believe-in-oakland";

const invite = async (memberId, role, capabilities) =>
  (await POST("op=memberadd&token=adm-rec78",
    { memberId, cover: `cover for ${memberId}`, role, capabilities })).invite;
const login = async (memberId) =>
  (await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` })).token;
const enrol = async (memberId, role, capabilities) => {
  const inv = await invite(memberId, role, capabilities);
  const en = await POST("op=enroll", { invite: inv, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const tok = await login(memberId);
  if (!tok) throw new Error(`login ${memberId}`);
  return tok;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", "admin", ["contribute", "publish"]);
let ANNA = await enrol("anna", "member", ["contribute"]);
const PETE = await enrol("pete", "member", ["contribute", "create_projects"]);

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const actionMd = (id) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "action_kind: cpra_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, ...refLines(refs), "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const projectMd = (id) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: active", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "---", "", "## Charter", "", "Work out where the money went.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, tok = RUTH, meta = {}, extraFiles = [], register = []) =>
  POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null,
    snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
    register,
    meta: { object_type: type, group: GROUP, title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "active" : "collected",
            created: NOW, last_updated: LATER, ...meta } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

console.log("\n=== REC-78 / D-230 · the eight shadowed refusals no suite pinned ===");

/* ====================================================================== 1
 * THE HARVEST AND THE SHADOW.
 *
 * WHAT THIS WALK CAN AND CANNOT SEE, stated rather than discovered (REC-73's
 * sentence, and it is load-bearing): it cannot tell a complete payload from an
 * incomplete one — that is the judgement this item made BY HAND, eight times,
 * and no walk over source can make it. It reads a method as the span between two
 * headers at class indent, so a refusal inside a nested helper is attributed to
 * the enclosing method. And it decides "is a refusal site" by three literal
 * spellings (`reason: "CODE"`, `refusal("CODE"`, `refuse("CODE"`), so a code
 * minted through a variable is invisible to it — which is the DEC-49 rule's own
 * requirement read from the other side.
 * ==================================================================== */
console.log("\n--- 1. the eight are confirmed against the plane, and each still shadows something ---");
{
  const heads = [...STORE_BARE.matchAll(/^ {2}(?:static\s+)?(?:async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/gm)]
    .filter((m) => !/^(if|for|while|switch|catch|return|constructor)$/.test(m[1]));
  const methods = heads.map((h, i) => ({
    name: h[1], body: STORE_BARE.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : STORE_BARE.length) }));
  const CODE = /(?:reason:\s*"([A-Z][A-Z0-9_]{2,})"|\brefusals?\s*\(\s*"([A-Z][A-Z0-9_]{2,})"|\brefuse\s*\(\s*"([A-Z][A-Z0-9_]{2,})")/g;

  /* Every refusal site in the file, with what sits BEHIND it in its own method. */
  const sites = [];
  for (const m of methods) {
    const seq = [];
    for (const h of m.body.matchAll(CODE)) {
      const c = h[1] || h[2] || h[3];
      if (!seq.some((s) => s.code === c)) seq.push({ code: c, at: h.index });
    }
    seq.forEach((s, i) => sites.push({ method: m.name, code: s.code, shadows: seq.length - 1 - i,
                                       behind: seq.slice(i + 1).map((x) => x.code) }));
  }
  /* THE CORPUS IS FLOORED BEFORE ANY CLAIM IS MADE OVER IT. A walk that stopped
     yielding would otherwise report "every one of the eight is fine" and read as
     good news — REC-70's blind ratchet, and REC-73's arm (3) is the same guard
     one file over.
     THESE ARE BLINDNESS FLOORS AND NOT RATCHETS, and the difference is stated
     because it decides what the number should be. A ratchet over the plane's
     refusal count would fail this suite every time unrelated work retires a
     refusal, which is not this item's subject; what these must catch is a walk
     that WENT BLIND, and a blind walk does not drop by ten, it drops to nearly
     nothing. PRINTED 2026-08-08 by this suite: 394 methods, 497 refusal sites.
     The margin is deliberate, declared, and is the only place in this file that
     has one. */
  t("(the walk reached a real corpus before anything is claimed over it: methods, and refusal sites "
  + "inside them — printed 394/497 on 2026-08-08)",
    [methods.length >= 350, sites.length >= 450], [true, true]);

  const deepest = (code) => sites.filter((s) => s.code === code).sort((a, b) => b.shadows - a.shadows)[0] ?? null;
  t("every one of the eight is a refusal THIS PLANE STILL MINTS — read out of `store.mjs`, never "
  + "trusted from the debt row", EIGHT.filter((c) => !deepest(c)), []);
  t("and every one of them still SHADOWS at least one refusal behind it in its own method, which is "
  + "the whole reason a complete payload was needed to pin any of them",
    EIGHT.filter((c) => (deepest(c)?.shadows ?? 0) < 1), []);
  console.log(`  ${sites.length} refusal sites across ${methods.length} methods. the eight, with what each hides:`);
  /* NULL-GUARDED, AND THE GUARD WAS EARNED RATHER THAN ANTICIPATED. This loop
     read `d.method` unguarded on its first version, and the control's arm (10)
     — the one that makes the walk go BLIND — came back not as two clean
     failures but as `THE SUITE NEVER REACHED ITS FOOT`: with no refusal sites
     found, `deepest()` answered null and a TypeError ended the MODULE through no
     assertion at all, taking all eight pins with it. That is the failure this
     project has now recorded four times, and it was caught here only because the
     harness READS THE FOOT LINE instead of trusting the tally. A blind walk must
     leave a suite that still SAYS SO. */
  for (const c of EIGHT) {
    const d = deepest(c);
    console.log(`    ${c.padEnd(24)} ${(d?.method ?? "** NOT FOUND IN THE PLANE **").padEnd(24)} `
      + `shadows ${String(d?.shadows ?? "?").padEnd(2)} → ${(d?.behind ?? []).join(", ")}`);
  }
}

/* ====================================================================== 2
 * THE EIGHT.
 * ==================================================================== */
console.log("\n--- 2. each refusal: driven by name, then the same act driven to success ---");

/* ------------------------------------------------------- (i) BAD_HANDLE */
{
  /* THE PAYLOAD IS COMPLETE IN EVERY OTHER RESPECT, and each of those respects
     is a refusal that sits BEHIND this one: the invitation is LIVE (so
     INVITE_MISS cannot fire), the handle is non-empty (NO_HANDLE), it is taken
     by nobody (HANDLE_TAKEN), and the password is over the twelve-character
     floor (PASSWORD_TOO_SHORT). The ONLY thing wrong is the handle's grammar. */
  const inv = await invite("hilda", "member", ["contribute"]);
  const PW = "hilda-passphrase-1";
  const m = await POST("op=enroll", { invite: inv, handle: "Hilda Krause", password: PW });
  pin("BAD_HANDLE",
    "a LIVE invitation, a handle nobody holds, and a password over the floor — only the handle's "
    + "grammar is wrong (a capital and a space)",
    codeOf(m));
  t("  and nothing was enrolled by the refused call: the invitation is still live and still resolves",
    (await POST("op=invitelook", { invite: inv }))?.ok, true);

  /* THE OVER-STRICTNESS ARM, and it is deliberately a spelling nobody would
     think to write: digits and a dash and the two-character floor exactly. A
     fence tighter than its rule is not a safer fence. */
  const r = await POST("op=enroll", { invite: inv, handle: "h9-k", password: PW });
  t("  and the SAME invitation and password enrol a handle whose only difference is that it obeys the "
  + "grammar — including a spelling the fence was not written with in mind (digits and a dash)",
    [r.ok, r.memberId, r.handle], [true, "hilda", "h9-k"]);
}

/* ------------------------------------------------------- (ii) LEASE_HELD */
{
  /* The lease is the ONLY thing wrong: every payload check in `actionCorrespond`
     sits IN FRONT of it (direction, date, the capture-or-testimony choice, the
     grammar bounds) and passes, and the two refusals BEHIND it — NO_DOCUMENT and
     UNSPLICEABLE_CORRESPONDENCE — are proved absent by the success arm. */
  const ACT = "ACTN-2026-7800-lease";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const q = `&target=${ACT}&direction=sent&at=2026-08-11&medium=email&party=${encodeURIComponent("City Clerk")}`
    + `&account=${encodeURIComponent("We sent the request by email and kept the send receipt.")}`;
  const held = await GET(`op=lease&token=${RUTH}&id=${ACT}`);
  t("  ruth holds the courtesy lock on the action, which is the condition this refusal is about",
    [held.ok, held.actor], [true, "ruth"]);

  const m = await GET(`op=actioncorrespond&token=${GUS}${q}`);
  pin("LEASE_HELD",
    "a real action, a legal direction, a well-formed date and a NAMED ACCOUNT — the testimony arm, "
    + "complete — written by a second member while the first holds the lock",
    codeOf(m));
  t("  and the refusal NAMES WHO HOLDS IT, which is what makes it an identity refusal rather than a "
  + "generic conflict", m.heldBy, "ruth");

  const r = await GET(`op=actioncorrespond&token=${RUTH}${q}`);
  t("  and the SAME payload records the entry for the member who DOES hold the lock — `ord` 0 is the "
  + "proof the refused call appended nothing, measured rather than assumed",
    [r.ok, r.ord, r.held_as, r.author], [true, 0, "testimony", "ruth"]);
}

/* ------------------------------------------------------- (iii) NO_CASE */
{
  /* Complete: a SIGNED-IN member (so NO_MEMBER, which sits in front, cannot
     fire) and a legal CONDITION kind (so NO_KINDS / UNKNOWN_KIND /
     KIND_NOT_PERSONAL, which sit behind, cannot be what answered). The only
     thing missing is the case the preference is about. */
  const INQ = "INQ-2026-7800-mute";
  await mustPromote(INQ, inquiryMd(INQ), "inquiry");
  const KINDS = ["text-undetermined"];

  const m = await POST(`op=queuemute&token=${RUTH}`, { kinds: KINDS });
  pin("NO_CASE",
    "a signed-in member and a legal CONDITION kind, with no case named — every refusal in front of "
    + "and behind this one satisfied",
    codeOf(m));
  t("  and a BLANK case answers identically, so the refusal is about the absence rather than the key",
    codeOf(await POST(`op=queuemute&token=${RUTH}`, { case: "   ", kinds: KINDS })), "NO_CASE");

  const r = await POST(`op=queuemute&token=${RUTH}`, { case: INQ, kinds: KINDS });
  t("  and the SAME kinds mute for the SAME member once the case is named",
    [r.ok, r.member, r.case, r.muted_kinds], [true, "ruth", INQ, KINDS]);
}

/* ------------------------------------------------------- (iv) NOT_ACTIVE */
{
  /* Complete: a real project, the caller IS its owner (NOT_THE_OWNER, in front,
     cannot fire), the handle names a real member (NO_SUCH_HANDLE) who is a
     JOINED PARTICIPANT (NOT_A_PARTICIPANT, behind) and is not already an owner
     (ALREADY_AN_OWNER, behind). The only thing wrong is that she is revoked. */
  const P = "PROJ-2026-7800-add";
  await mustPromote(P, projectMd(P), "project");
  t("  anna is a joined participant of the project, so the only thing left to be wrong about her is "
  + "her status", [(await GET(`op=projectinvite&token=${RUTH}&projectId=${P}&handle=anna`)).ok,
                   (await GET(`op=projectjoin&token=${ANNA}&projectId=${P}`)).ok], [true, true]);
  const set = async (status) => POST("op=memberset&token=adm-rec78", { memberId: "anna", status });
  t("  and she is revoked at the roster, which is the condition this refusal names",
    (await set("revoked")).status, "revoked");

  const m = await GET(`op=projectowneradd&token=${RUTH}&projectId=${P}&handle=anna`);
  pin("NOT_ACTIVE",
    "a project the caller OWNS, naming a joined participant who is not already an owner — complete "
    + "but for the member being revoked at the roster",
    codeOf(m));
  t("  and no ownership moved under the refused call",
    (await GET(`op=projectownerarith&token=${RUTH}&projectId=${P}`))?.live?.owners, 1);

  t("  she is reactivated, and NOTHING else about the call changes", (await set("active")).status, "active");
  /* Her session died with the revocation, which is the roster doing its job;
     re-issued here so the arms that need her own voice below have one. */
  ANNA = await login("anna");
  const r = await GET(`op=projectowneradd&token=${RUTH}&projectId=${P}&handle=anna`);
  t("  and the SAME call makes her an owner — the sole owner adds a second unilaterally (7.10)",
    [r.ok, r.owner, r.owners], [true, true, ["anna", "ruth"]]);
}

/* ------------------------------------------------------ (v) NOT_AN_OWNER */
{
  /* Complete: a real project, the caller IS an owner, the handle names a real
     member, and the reason is authored — so NO_REASON, which sits directly
     behind this refusal, cannot be what answered. */
  const P = "PROJ-2026-7800-remove";
  const WHY = encodeURIComponent("the project has moved to the records team and she is no longer running it");
  await mustPromote(P, projectMd(P), "project");
  t("  anna is a joined participant, so the ONLY thing she is not is an owner",
    [(await GET(`op=projectinvite&token=${RUTH}&projectId=${P}&handle=anna`)).ok,
     (await GET(`op=projectjoin&token=${ANNA}&projectId=${P}`)).ok], [true, true]);

  const m = await GET(`op=projectownerremove&token=${RUTH}&projectId=${P}&handle=anna&reason=${WHY}`);
  pin("NOT_AN_OWNER",
    "a project the caller owns, a real joined participant, and an authored reason — complete but for "
    + "the target not being an owner of it",
    codeOf(m));

  t("  she is made an owner, and NOTHING else about the call changes",
    (await GET(`op=projectowneradd&token=${RUTH}&projectId=${P}&handle=anna`)).owners, ["anna", "ruth"]);
  /* THE SAME PAYLOAD NOW GETS PAST THE FENCE AND MEETS THE VOTE, which is the
     rule rather than a gap in the payload: at exactly two owners 7.10 is
     unanimity INCLUDING the departing one. Both halves are asserted, because
     "it reached VOTES_SHORT" is what proves the fence was what refused before,
     and "it then carried" is what proves the payload was complete. */
  const short = await GET(`op=projectownerremove&token=${RUTH}&projectId=${P}&handle=anna&reason=${WHY}`);
  t("  the SAME payload now passes the fence and meets the VOTE — which is 7.10's rule, not a gap in "
  + "the payload: at two owners removal is unanimity including the departing one",
    [codeOf(short), short.have, short.need, short.deciders], ["VOTES_SHORT", 1, 2, ["ruth"]]);
  const r = await GET(`op=projectownerremove&token=${ANNA}&projectId=${P}&handle=anna&reason=${WHY}`);
  t("  and with her own assent the SAME payload carries and she stops being an owner",
    [r.ok, r.owner, r.stillAParticipant, r.owners], [true, false, true, ["ruth"]]);
}

/* -------------------------------------------------------- (vi) NO_OWNERS */
{
  /* The condition this refusal names is a property OF THE PROJECT — it has no
     owner rows at all — so the second arm names a project that HAS them and is
     otherwise identical: same administrator, same handle, same authored reason.
     The refusal's own detail says what the difference is, and the two arms are
     that sentence driven from both sides. */
  const WHY = encodeURIComponent("every owner of this project has left the group and the work is stranded");
  const MACHINE_MADE = "PROJ-2026-7800-machine";
  const MEMBER_MADE = "PROJ-2026-7800-stranded";
  /* A machine credential's promote sets no `ownerMemberId`, so the project is
     created with NO owner row — which is exactly the case the refusal describes
     and is why the fixture uses one rather than deleting a row by hand. */
  await mustPromote(MACHINE_MADE, projectMd(MACHINE_MADE), "project", "mem-rec78");
  await mustPromote(MEMBER_MADE, projectMd(MEMBER_MADE), "project", PETE);
  t("  the two projects differ in exactly one thing, and it is the thing the refusal is about",
    [(await GET(`op=projectownerarith&token=${RUTH}&projectId=${MACHINE_MADE}`))?.live?.owners,
     (await GET(`op=projectownerarith&token=${RUTH}&projectId=${MEMBER_MADE}`))?.live?.owners], [0, 1]);
  t("  and the member-made project's sole owner is revoked, so 7.13's OTHER condition — every owner "
  + "inactive — is satisfied for both",
    (await POST("op=memberset&token=adm-rec78", { memberId: "pete", status: "revoked" })).status, "revoked");

  const m = await GET(`op=projectownerrescue&token=${RUTH}&projectId=${MACHINE_MADE}&handle=anna&reason=${WHY}`);
  pin("NO_OWNERS",
    "an ADMINISTRATOR's 7.13 rescue with an authored reason naming an active member — complete but "
    + "for the project having no owner rows at all, which is a machine-created project rather than a "
    + "stranded one",
    codeOf(m));

  const r = await GET(`op=projectownerrescue&token=${RUTH}&projectId=${MEMBER_MADE}&handle=anna&reason=${WHY}`);
  t("  and the SAME administrator, handle and reason rescue the project that HAS owner rows — and it "
  + "ADDS rather than replaces, so the inactive owner keeps his",
    [r.ok, r.owner, r.addedNotReplaced, r.owners], [true, true, true, ["anna", "pete"]]);
}

/* -------------------------------------------------------- (vii) NO_AUTHOR */
{
  /* THE ONE THAT NO CALLER CAN REACH, and the arm is built to say so rather than
     to look like a pin. Two facts are asserted:
       (a) at the DURABLE OBJECT route, where the author is a query parameter,
           the refusal fires under a payload that is otherwise complete — and the
           same call WITH an author gets past it into the ordinary report;
       (b) at the OP, no caller class can make it fire, because a session is
           refused the op outright and every machine class is stamped
           `token:<class>` by the control plane before the store ever sees it. */
  const DOC = "INFO-2026-7800-provenance";
  await mustPromote(DOC, infoMd(DOC), "information");
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const doGet = async (qs) => rP(await (await obj.fetch(`http://x/provenancechain?${qs}`)).json());
  const VIEW = encodeURIComponent("member:ruth");

  const m = await doGet(`bundleId=${DOC}&viewer=${VIEW}`);
  pin("NO_AUTHOR",
    "a real bundle the viewer can see, driven at the Durable Object route where the author IS a "
    + "parameter — complete but for the name against the act",
    codeOf(m));

  const r = await doGet(`bundleId=${DOC}&viewer=${VIEW}&author=ruth`);
  t("  and the SAME call WITH a name gets past this refusal into the ordinary report — NO_REGISTER, "
  + "which is the next thing wrong with the document and is what proves the fence was what refused",
    codeOf(r), "NO_REGISTER");

  /* (b) THE OP-LEVEL FACT, and it is the finding rather than the decoration.
     Asserted structurally AND behaviourally, because either alone is the defect
     this project meets most: a mechanism believed on its existence. */
  t("  STRUCTURALLY: `provenancechain` is stamped with a server-decided author on every route into "
  + "it, and appears in NO session op set — so the store's `!who` cannot be made true by any caller",
    [/op === "provenancechain"/.test(INDEX_BARE),
     /inner\.searchParams\.set\("author",\s*viaSession \? sessMember/.test(INDEX_BARE)], [true, true]);
  const answers = {};
  for (const [name, tok] of [["a signed-in member", RUTH], ["the admin class", "adm-rec78"],
                             ["the member class", "mem-rec78"], ["the probe class", "prb-rec78"]])
    answers[name] = codeOf(await GET(`op=provenancechain&token=${tok}&bundleId=${DOC}`))
                 ?? (await GET(`op=provenancechain&token=${tok}&bundleId=${DOC}`))?.error ?? null;
  t("  BEHAVIOURALLY: NOT ONE caller class reaches NO_AUTHOR through the op — the session is refused "
  + "the op outright and every machine class arrives already named",
    Object.entries(answers).filter(([, v]) => v === "NO_AUTHOR"), []);
  console.log(`  what each caller class actually answers at op=provenancechain: ${JSON.stringify(answers)}`);
}

/* ---------------------------------------- (viii) EDITION_NOT_INCREMENTED */
{
  /* THE PUBLICATION INVARIANT, and the one the ceremony cannot reach. The
     fixture publishes a real case through op=publish, ratifies it, and then
     REVISES it twice with real signatures. What differs between the refused arm
     and the accepted one is the EDITION SCALAR IN THE SIGNED BYTES and nothing
     else: same document, same member, same key, same gate. */
  const dir = mkdtempSync(join(tmpdir(), "rec78-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "ruth", "-f", join(dir, "ruth"), "-q"]);
  const keyB64 = readFileSync(join(dir, "ruth.pub"), "utf8").trim().split(/\s+/)[1];
  const signRatify = (bundleId, bundleSha) => {
    const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "ruth"), "-n", "bio-ratify", f],
      { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(`${f}.sig`, "utf8");
  };
  t("  ruth's signing key is registered, so a real signature is what ratifies below",
    (await POST("op=signeradd&token=adm-rec78", { keyB64, memberId: "ruth", comment: "ruth laptop" })).ok, true);

  const CAP = "INFO-2026-7800-cap", CONN = "INFO-2026-7800-conn", LEFT = "INFO-2026-7800-left";
  const INQ = "INQ-2026-7800-edition";
  for (const d of [CAP, CONN, LEFT])
    await mustPromote(d, infoMd(d), "information", RUTH, {}, [],
      [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);
  const legs = ["basis:",
    `  - target: ${CAP}`, "    role: supports", "    grade: B", "    grade_axis: capture", "    grade_source: capture",
    `  - target: ${CONN}`, "    role: supports", "    grade: C", "    grade_axis: connection",
    "    grade_source: hunch", "    author: ruth", "    date: 2026-08-04"].join("\n");
  const md = inquiryMd(INQ, { question: "Was the sewer transfer authorised?", refs: [CAP, CONN] })
    .replace("---\n\n## Question", `${legs}\n---\n\n## Question`);
  await mustPromote(INQ, md, "inquiry");
  const cn = await GET(`op=conclude&token=${RUTH}&target=${INQ}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`);
  if (!cn.ok) throw new Error(`conclude: ${JSON.stringify(cn).slice(0, 400)}`);
  const pub = await POST(`op=publish&token=${RUTH}`, { target: INQ,
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
    excluded: [{ target: LEFT, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                       + "public session, and edition 1 reads the FY2024 record through it." });
  t("  a real case is published at edition 1 through the ceremony", [pub.ok, pub.edition], [true, 1]);

  const liveSha = async () =>
    ((await GET(`op=list&token=${RUTH}`)) || []).find((b) => b.bundle_id === INQ)?.bundle_sha ?? null;
  const ratify = async () => {
    const s = await liveSha();
    return POST(`op=ratify&token=${RUTH}`, { bundleId: INQ, expectedSha: s, sig: signRatify(INQ, s) });
  };
  /* A REVISION THAT DIFFERS ONLY IN ITS EDITION, and in the four sentences
     C-21.1 requires to be FRESH for a new edition — a completeness claim carried
     forward is a checkbox, and the gate refuses one. Making them fresh is part
     of making the payload COMPLETE: without it the gate is what answers and the
     edition refusal is never reached, which is this item's whole subject
     arriving inside its own fixture. */
  let seq = 0;
  const revise = async (n) => {
    seq++;
    const img = await GET(`op=image&token=${RUTH}&id=${INQ}`);
    const files = img.image || img;
    const cur = files["bundle.md"];
    const next = cur
      .replace(/^edition: \d+$/m, `edition: ${n}`)
      .replace(/^  statement: ".*"$/m, `  statement: "As of edition ${n} this case still covers the `
        + `FY2024 sewer fund transfer alone, and the FY2023 comparison memo is still outstanding."`)
      .replace(/^  subject_justification: ".*"$/m, `  subject_justification: "Edition ${n}: we put the `
        + `claims to the City Administrator on 2026-06-20 and printed the reply verbatim."`)
      .replace(/^    reason: ".*"$/m, `    reason: "as of edition ${n} the records request for it is `
        + `still outstanding with the City Clerk"`)
      .replace(/^bias_acknowledgement: ".*"$/m, `bias_acknowledgement: "Edition ${n} is read through this `
        + `group's declared position that fund transfers should be adopted in public session."`);
    if (next === cur) throw new Error("the revision changed nothing — the edition rewrite matched nothing");
    const carried = Object.entries(files)
      .filter(([p]) => p !== "bundle.md" && !p.startsWith("_history/"))
      .map(([p, v]) => typeof v === "string"
        ? { path: p, text: v, bytes: v.length, sha256: sha(v) }
        : { path: p, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
    /* C-12.2 reads the snapshot key out of the history FILENAME and demands the
       `<YYYYMMDD>T<HHMMSS>Z_<8 hex>` shape; a free-form key promotes fine and
       then fails the ratification gate, which cost this item a measurement. */
    const r = await POST(`op=promote&token=${RUTH}`, { bundleId: INQ, base: await liveSha(),
      snapKey: `2026080${seq}T12000${seq}Z_${String(seq).repeat(8)}`,
      files: [{ path: "bundle.md", text: next, bytes: next.length, sha256: sha(next) }, ...carried],
      meta: { object_type: "inquiry", group: GROUP, title: `Bundle ${INQ}`, current_state: "published",
              created: NOW, last_updated: LATER } });
    if (!r.ok) throw new Error(`revise to edition ${n}: ${JSON.stringify(r).slice(0, 400)}`);
    return r;
  };

  t("  edition 1 ratifies, so the case is genuinely published through 1",
    [(await ratify()).ok, true], [true, true]);
  await revise(3);
  const at3 = await ratify();
  t("  a revision authoring edition 3 ratifies, which is what leaves a HOLE at edition 2 — the only "
  + "state from which this refusal is reachable at all",
    [at3.ok, at3.edition], [true, 3]);

  await revise(2);
  const m = await ratify();
  pin("EDITION_NOT_INCREMENTED",
    "a real revision of a published case, gate-passing, signed by a registered key over its own live "
    + "sha — complete but for the edition its own bytes claim being lower than the highest published",
    codeOf(m));
  t("  and the refusal states both numbers, which is what makes it checkable rather than a no",
    [m.edition, m.highest], [2, 3]);
  t("  and NOTHING was published under the refused ratification: edition 2 does not answer",
    (await GET(`op=publishedcase&token=${RUTH}&bundleId=${INQ}&edition=2`))?.ok ?? false, false);

  await revise(4);
  const r = await ratify();
  t("  and the SAME revision, same member, same key and same gate, ratifies once its bytes claim an "
  + "edition that moves the number", [r.ok, r.edition], [true, 4]);
}

/* ====================================================================== 3
 * THE COMPLETENESS ARM.
 * ==================================================================== */
console.log("\n--- 3. the driven set IS the declared set: none of the eight can quietly stop being driven ---");
{
  const drivenCodes = DRIVEN.map((d) => d.code).sort();
  t("(eight refusals were actually driven — the guard before the equality, because two empty sets are "
  + "equal and prove nothing)", drivenCodes.length, 8);
  t("EVERY code D-230 named was driven under a payload complete but for the condition it guards",
    EIGHT.filter((c) => !drivenCodes.includes(c)), []);
  t("and nothing was driven that D-230 did not name", drivenCodes.filter((c) => !EIGHT.includes(c)), []);
  t("every one of them answered with its OWN name — this is the whole item, stated once as a set",
    DRIVEN.filter((d) => d.answer !== d.code).map((d) => [d.code, d.answer]), []);
}

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
