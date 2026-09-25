/* NEGATIVE CONTROL: `node bio-plane/test/nc-pl18.mjs` — RE-RUN 2026-09-19 by REC-152 (worktree agent-a8cfbd5a2893e6b93, base 0cb784ab + this item: tick and close are the run's PRINCIPAL's; H1/H2/H6 CORRECTED, L4/L5 added), ELEVEN ROWS, ten restores verified by sha256 AND `cmp` (real sources hashed after: identical to before). (0) BASELINE 54/0. (a) 52/2 B4 C3. (b) 52/2 B3 C3. (c) no gate on the open 42/12, as REC-145's. **(d) no gate on the tick -> 53/1, L4 ALONE — NOT REC-145's H1 H3: pia is now answered as absent before any gate, and a non-principal is refused C-22.12 before it, so the tick's project gate is reachable only by the run's own principal once he is no longer joined (L4); L5 (the close) stays green, the two still two fences.** (e) inquiry-consults-projects 42/12 — H6 LEAVES the set (refused C-22.12 first). (e2) gate-dropped-everywhere 37/17 — H1 H2 H3 leave, L4 L5 join, H4 P1 P2 as REC-145 measured. (f) 54/0. (g) admit invited/leaving 50/4, F1 L1 **and L4 L5**. (h) 50/4 C1 C2 C4 D4. (i) drop the actor stamp 34/20 — H6 leaves (the principal refusal reads the `principal` stamp, not `actor`), L4 L5 join. Declarations in the driver moved to match, each with its dated reason. The ROW'S OWN control is `test/airun-principal.control.mjs` (sent-field: the forged-actor arms fail by name). — PREVIOUSLY RE-RUN 2026-09-19 by REC-145 (worktree agent-a3372f65d0555dbd9, base 1d439e31 + this item; DEC-63 as amended — a run over a question consults no project), ELEVEN ROWS, every restore verified by sha256 and `cmp` (the four sources hashed before and after the harness: OK). (0) BASELINE 52/0. (a) collapse the detail -> 50/2, B4 C3, as declared, B1/B2 green. (b) collapse the translation -> 50/2, B3 C3. (c) no gate on the open -> 40/12, B1 B2 B4 B6 C3 E2 F1 F2 G4 S1 S2 L1 — **B3 and B5 stay green and that is the arms, not the gate: B3 reads the catalogue and B5 asserts an absence, which an open door also satisfies**; this arm's and (d)'s anchors had NOT OCCURRED since REC-139 added `viewer` (corrected here). (d) no gate on the tick -> 49/3, H1 H3 and H4 (PL-18's recorded load-bearing tick count). (e) **REC-145's CONTROL — restore the project consult for an inquiry context -> 39/13, A2 B0 D1 D2 D3 G1 G3 H6 L3 P1 P2 P2b P4, exactly as declared: the PERMITTED arms fail by name**; A1/G2 (joined members) and every project-context arm green. (e2) THE ROW'S LIAR, the gate dropped for every context -> 33/19: every project-context refusal (B1 B2 B4 B6 C3 E2 F1 F2 G4 H1 H2 H3 S1 S2 L1) — NOT AS DECLARED in the catching direction: **H4, H5, P1 and P2 also went red, which the declaration said would not** (the P arms name the project kind and share the predicate; H4 pins sam's PARTICIPANT ground and H5 follows H2's close). (f) over-strictness, every project -> 52/0, declared ALL GREEN: moot after the amendment (a project context names one project). (g) admit invited/leaving -> 50/2, F1 L1. (h) neuter the capability floor -> 48/4, C1 C2 D4 and C4 (undeclared: C4 reads the floor's own code, which a neutered floor never sends). (i) drop the actor stamp -> 29/23, wide and in the declared direction. PL-18's ORIGINAL RUN, KEPT AS THE RECORD: TEN ROWS (a baseline plus nine arms), each armed ALONE, each declared before arming, each refusing to arm on an anchor that does not occur exactly once, every restore verified by sha256 AND `cmp` against a per-arm pristine copy with a byte floor. RUN 2026-08-09 by PL-18 (worktree agent-a4e2eff5ca09197e2). (0) BASELINE, nothing edited -> exit 0, 47 pass, 0 fail — the row that distinguishes nine-arms-broken from nine-arms-working. (a) THE ARM THIS SUITE EXISTS FOR — collapse the two refusals by giving the participation refusal the CAPABILITY refusal's words -> 45 pass, 2 fail, B4 and C3, **with B1 and B2 STAYING GREEN**: a refusal still occurs and still carries C-22.8, so only the arms asserting the SENTENCE can see the collapse. That asymmetry is the whole evidence that this suite is not buying an outcome that costs nothing to produce. (b) collapse the CANNED TRANSLATION in the catalogue -> 45 pass, 2 fail, B3 and C3 — **DECLARED B2 AND B2 STAYED GREEN, and that is a finding about the ARM, recorded at B2's site: both sides of B2 read the same catalogue and move together, so B2 can see a mis-keyed translation and never a wrong one.** (c) remove the gate from `aiRunOpen` alone -> 35 pass, 12 fail, every open refusal, with C1/C2 (the capability floor) and H1/H2 (the tick and close) GREEN — the three verbs are gated independently. (d) remove it from the tick alone -> 44/3, H1 H3 **H4** (H4 was not declared: it pins an absolute tick count, and an ungated tick moved it — the load-bearing-count class REC-75 recorded). (e) DEC-17's case armed the wrong way, a projectless inquiry silently DENIED -> 41/6, D1 D2 D3 **and P1, P2, P2b**, none of the three declared and all three the arm working: the P arms assert the closed permitting vocabulary is wholly REACHED and that only the refusing outcome carries a code, and PROJECTLESS became unreachable. (f) over-strictness, require participation in EVERY project holding the question -> 44/3, G1 G2 **L2** (undeclared, same cause), with A1/B/C/D green. (g) over-strictness the other way, admit `invited` and `leaving` as participating -> 45/2, F1 L1, exactly as declared. (h) neuter the CAPABILITY FLOOR in index.mjs -> 44/3, C1 C2 D4, **with ARM B GREEN** — the pair proving the two fences are independent rather than one measured twice. (i) drop the server-side `actor` stamp -> 26/21, far wider than the declared S1/A2/D2/H4 and in the declared direction: with no stamp every session reads as no member and the gate collapses wholesale. NOT AN ARM, and stated rather than discovered: `inner.searchParams.delete("actor")` is behaviourally INVISIBLE today, because the `set` below it is unconditional for all three verbs — kept as a structural guard, on REC-75's idempotent-write precedent. */
/* PL-18 — DEC-63'S GATE: AN INVESTIGATION IS STARTED BY ANY MEMBER OF THE PROJECT.
 *
 * Bob, 2026-08-09: *"AN INVESTIGATION CAN BE STARTED BY ANY MEMBER OF A
 * PROJECT… the gate is PROJECT MEMBERSHIP, not a capability tier."* IS-6 had
 * shipped `contribute` on all three run verbs as a PROVISIONAL and asked. The
 * capability stays as the FLOOR beneath the gate; participation in the project
 * the inquiry belongs to is the gate.
 *
 * ======================= WHAT THIS SUITE IS ACTUALLY FOR ===================
 * ONE SENTENCE: **the refusal must NAME WHICH OF THE TWO FAILED.** *You are not
 * a member of this project* and *you lack contribute* are different facts about
 * an account, with different remedies — an owner of that project invites you,
 * or an administrator grants a capability — and one refusal covering both tells
 * a member nothing they can act on. So the arms here do not assert that a
 * refusal happened. **They assert the refusal's own SENTENCE**, and one arm
 * asserts that the two sentences do not contain each other's subject, which is
 * the assertion a collapsed refusal cannot pass.
 *
 * DRIVEN THROUGH THE OP, THROUGH A REAL SESSION. Three reasons, and the third
 * is the one that earned the suite:
 *   - D-43 is the standing receipt: `op=invitelook` shipped with a
 *     ReferenceError while 1,276 store-level assertions passed.
 *   - The capability floor is enforced in `index.mjs` and the participation
 *     gate in `store.mjs`. **NO STORE-LEVEL TEST CAN SEE BOTH**, and this
 *     item's whole content is that they answer differently.
 *   - **`airun.test.mjs` DRIVES WITH `MEMBER_TOKEN`, A MACHINE CREDENTIAL.**
 *     That is not a criticism of it — the run object is its subject — but it
 *     means no existing suite exercised the member path at all, and a member is
 *     the only thing this gate can act on. Every caller below is a session.
 *
 * WHAT THIS SUITE CANNOT SEE, stated rather than discovered later:
 *   (i)   ONE ISOLATE, ONE STORE. Every project, inquiry and member here lives
 *         in one Durable Object. It says nothing about two instances.
 *   (ii)  IT DOES NOT MEASURE A SURFACE. It asserts what the PLANE sends —
 *         code, check, canned translation, detail. Whether `civicos-ui` renders
 *         a sentence keyed on `AI_RUN_NOT_PROJECT_MEMBER` is UI's ground and is
 *         delegated, not tested here.
 *   (iii) THE MACHINE HALF IS ASSERTED PERMITTED, NOT ASSERTED SAFE. Arm M
 *         proves the gate does not apply to a token class, which is deliberate
 *         (the capability floor does not either). What BOUNDS a machine caller
 *         is IS-5's `ai` credential scope, and that is a different suite.
 *   (iv)  IT ASSERTS THREE PARTICIPATION STATES AND THERE ARE THREE. `joined`,
 *         `invited` and `leaving` are the whole vocabulary of
 *         `project_participants.state`, and each is driven (ARMS A, F1, L). No
 *         fourth state exists to be missed today; one added later would be
 *         admitted by this gate silently, and that is stated rather than
 *         guarded, because a list of spellings goes stale the moment a fourth
 *         is written.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { PROJECT_GATE_GROUNDS, projectGate } from "../src/airun.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-pl18", MEMBER_TOKEN: "t-member-pl18",
              PROBE_TOKEN: "t-probe-pl18", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* NULL-TOLERANT READS. Three of `airun.test.mjs`'s own controls THREW on
   `.detail` of undefined and took every arm behind them with them; a control
   that dies early reports one defect as none. */
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const str = (v) => (typeof v === "string" ? v : "");

const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-pl18",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.result.token;
};

/* 4.2/4.3: there are no ordinary members until two administrators exist. */
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
const GUS  = await member("gus",  ["contribute", "create_projects"], "admin");
/* SAM — contribute, and JOINED to P1. The member the ruling is about. */
const SAM  = await member("sam",  ["contribute"]);
/* VERA — JOINED to P1 and holds NO contribute. The capability half. */
const VERA = await member("vera", []);
/* PIA — contribute, and in NO project. The participation half. */
const PIA  = await member("pia",  ["contribute"]);
/* INES — contribute, INVITED to P1 and has not joined. Skeleton visibility. */
const INES = await member("ines", ["contribute"]);
/* OTTO — contribute, joined to P2 ONLY. The over-strictness arm. */
const OTTO = await member("otto", ["contribute"]);
/* THE ADMINISTRATOR ARM USES `GUS`, and the reason is a measurement rather
   than a preference: a THIRD administrator cannot be added at all without the
   consensus of every existing one (4.7), so minting a fresh admin for this arm
   is not a thing a fixture can do. GUS is an administrator holding contribute
   who owns P2 and is NOT a participant of P1 — and `INQ_IN` is drawn on by P1
   alone, so his P2 standing is irrelevant to it, which is exactly the fact
   ARM F2 is about. */

const NOW = "2026-08-09T00:00:00Z", LATER = "2026-08-09T01:00:00Z";
/* **NOT ONE `references` ENTRY IN EITHER TEMPLATE, EVER.** Both start `[]` and
   every edge below is written by `op=cite`. That is `citeproject-inquiry`'s
   discipline and the reason is its finding: PL-2's fixture hand-authored the
   edge and so drove this gate without discovering that the gate had no door. */
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7): a
   creation names no bundleId (PROJECT_ID_SUPPLIED) and its bytes carry no id line (PROJECT_ID_IN_BYTES);
   the id is read from the answer. For a project, `id` below is only the title's label. */
const projectMd = (id) => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");

let seq = 0;
const bundle = (id, type) => {
  const md = type === "project" ? projectMd(id) : inquiryMd(id);
  return {
    ...(type === "project" ? {} : { bundleId: id }), base: null, snapKey: `20260809T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: the label `title for ${id}` contradicted the question's
       own `title:` and is now refused; the project's document states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open",
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
  };
};
const promote = async (tok, id, type) => rP(await POST(`op=promote&${tok}`, bundle(id, type)));

/* CORRECTED 2026-09-18 (REC-141, IC-158): P1/P2 are the MINTED ids, read from the creation answers below. */
let P1 = "sewer";
let P2 = "water";
const INQ_IN   = "INQ-2026-8010-transfers";   // cited by P1
const INQ_BOTH = "INQ-2026-8011-shared";      // cited by P1 AND P2
const INQ_LOOSE = "INQ-2026-8012-loose";      // cited by nobody — DEC-17's case

console.log("\n--- FIXTURE: two projects, three inquiries, and NOT ONE HAND-AUTHORED EDGE ---");
{
  const mk = [];
  mk.push(await promote(RUTH, P1, "project"));
  P1 = mk[0]?.bundleId;
  mk.push(await promote(GUS,  P2, "project"));
  P2 = mk[1]?.bundleId;
  mk.push(await promote(RUTH, INQ_IN, "inquiry"));
  mk.push(await promote(RUTH, INQ_BOTH, "inquiry"));
  mk.push(await promote(RUTH, INQ_LOOSE, "inquiry"));
  t("FIXTURE: every bundle promoted", mk.map((r) => r?.ok === true), [true, true, true, true, true]);
}

/* EVERY `cites` EDGE BELOW IS WRITTEN BY `op=cite`, never hand-authored into
   frontmatter. `citeproject-inquiry.test.mjs`'s header states why in full: a
   test that builds the edge by hand proves nothing about whether the act can
   build one, and PL-2's suite missed D-216 exactly that way. This gate reads
   the citation graph, so an edge nobody could actually make would make every
   arm here a measurement of a fixture. */
const cite = async (tok, project, ids) => {
  const sel = await POST(`op=select&${tok}`, { ids });
  const handle = sel.handle ?? sel.result?.handle;
  if (!handle) throw new Error(`select: ${JSON.stringify(sel)}`);
  return rP(await GET(`op=cite&${tok}&project=${encodeURIComponent(project)}&handle=${handle}`));
};
{
  const a = await cite(RUTH, P1, [INQ_IN]);
  const b = await cite(RUTH, P1, [INQ_IN, INQ_BOTH]);
  const c = await cite(GUS,  P2, [INQ_BOTH]);
  t("FIXTURE: the three citations are written BY THE ACT op=cite, not by hand",
    [a?.ok === true, b?.ok === true, c?.ok === true], [true, true, true]);
  /* READ BACK THROUGH A DIFFERENT OP. An edge asserted only through the op that
     wrote it is an equality that costs nothing to produce. */
  const back = rP(await GET(`op=backlinks&${RUTH}&target=${encodeURIComponent(INQ_BOTH)}`));
  t("FIXTURE READ-BACK through op=backlinks: BOTH projects draw on the shared question",
    /* CORRECTED 2026-09-19 (REC-141, BOB #16): minted ids are opaque, so the expected pair is sorted too. */
    (back?.backlinks ?? []).map((x) => x.from).sort(), [P1, P2].sort());
  const none = rP(await GET(`op=backlinks&${RUTH}&target=${encodeURIComponent(INQ_LOOSE)}`));
  t("FIXTURE READ-BACK: the loose question is cited by NOBODY — DEC-17's case is real here, "
    + "and this arm is what stops the projectless assertions passing over a mis-built fixture",
    (none?.backlinks ?? []).length, 0);
}

const invite = async (ownerTok, project, handle) =>
  rP(await GET(`op=projectinvite&${ownerTok}&projectId=${encodeURIComponent(project)}&handle=${handle}`));
const join = async (tok, project) =>
  rP(await GET(`op=projectjoin&${tok}&projectId=${encodeURIComponent(project)}`));
{
  const steps = [];
  steps.push((await invite(RUTH, P1, "sam"))?.ok === true);
  steps.push((await invite(RUTH, P1, "vera"))?.ok === true);
  steps.push((await invite(RUTH, P1, "ines"))?.ok === true);   // invited, never joins
  /* OTTO IS NEVER INVITED TO P1 AT ALL — he belongs to P2 only, which is what
     makes ARM G a measurement of "joined to ONE of the projects that hold the
     question" rather than of "joined to the first one we looked at". */
  steps.push((await invite(GUS,  P2, "otto"))?.ok === true);
  t("FIXTURE: three invitations to P1 and one to P2", steps, [true, true, true, true]);
  const joined = [];
  joined.push((await join(SAM,  P1))?.state);
  joined.push((await join(VERA, P1))?.state);
  joined.push((await join(OTTO, P2))?.state);
  t("FIXTURE: sam and vera JOIN P1; otto JOINS P2 and is not in P1 at all",
    joined, ["joined", "joined", "joined"]);
  const parts = rP(await GET(`op=projectparticipants&${RUTH}&projectId=${encodeURIComponent(P1)}`));
  t("FIXTURE: P1's roster is ruth (owner), sam, vera JOINED and ines INVITED — the fixture is "
    + "NON-EMPTY and carries both states the gate distinguishes",
    (parts?.participants ?? []).map((p) => [p.handle ?? p.member_id, p.state]).sort(),
    [["ines", "invited"], ["ruth", "joined"], ["sam", "joined"], ["vera", "joined"]]);
}

/* ---------------------------------------------------------------- the run */
let runSeq = 0;
const open = async (tok, contextId, contextType = "inquiry") => rP(await POST(`op=airunopen&${tok}`, {
  run: `RUN-2026-0809-${++runSeq}`, contextType, contextId,
  label: "evidence sweep", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1",
  bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000,
}));
const lastRun = () => `RUN-2026-0809-${runSeq}`;

/* THE TWO SENTENCES, READ LIVE OUT OF THE ONE PLACE THEY LIVE. Typed copies
   agree at zero cost — this repository has measured that five times — so the
   participation translation comes from the catalogue and the capability
   sentence is READ OFF a real refusal rather than transcribed. */
const T_PARTICIPATION = AI_RUN_CHECKS.AI_RUN_NOT_PROJECT_MEMBER.translation;

console.log("\n--- ARM A · THE RULING: a member of the project may start a run ---");
{
  const r = await open(SAM, INQ_IN);
  t("ARM A1: sam holds contribute AND participates in the project that draws on the question — the "
    + "run STARTS",
    [r?.started, r?.status], [true, "running"]);
  /* CORRECTED 2026-09-19 by REC-145 (DEC-63 as amended by Bob, 2026-09-18; Membership v2 §7), never
     exempted: this pinned `[true, "PARTICIPANT", 1]` — sam permitted BECAUSE he joined the project that
     cites the question. Bob reversed that reading (*"a project doesn't own an area of enquiry"*): over a
     question the verdict consults no project, so the ground is INQUIRY and the gate did not apply. The
     stated count is unchanged (REC-139: the citing projects sam can see, P1). */
  t("ARM A2: and the answer STATES the ground it was permitted on, rather than merely not refusing — "
    + "over a question that ground is INQUIRY, whoever cites it (REC-145)",
    [r?.projectGate?.applied, r?.projectGate?.ground, r?.projectGate?.projects],
    [false, "INQUIRY", 1]);
}

console.log("\n--- ARM B0 · REC-145: a contribute-holder in NO project runs over a question a project cites ---");
{
  const r = await open(PIA, INQ_IN);
  t("ARM B0: pia holds contribute and is in no project, and P1 (which she cannot see) cites the question — "
    + "the run STARTS, and the count names no project she cannot see",
    [r?.started, r?.code ?? null, r?.projectGate?.ground, r?.projectGate?.projects], [true, null, "INQUIRY", 0]);
}

/* CORRECTED 2026-09-19 by REC-145, never exempted: ARMS B, C3/C4, F, S and L1 drove the participation
   refusal over a QUESTION (INQ_IN / INQ_BOTH). DEC-63 as amended says nothing refuses there any more, so
   each is RE-AIMED at a run whose context is the PROJECT ITSELF — the one context the refusal is still
   said over — and asserts exactly what it asserted before about that refusal's words and its fence. */
console.log("\n--- ARM B · THE PARTICIPATION HALF: a contribute-holder OUTSIDE the project, over the project ---");
{
  /* CORRECTED 2026-09-19 by REC-153 (BOB #16, `7d03e852`), never exempted: ARMS B, C, E2 and S drove PIA over P1.
     P1 is HIDDEN from pia (she was never invited), and the open now asks SIGHT BEFORE POSITION: a project the
     caller cannot see answers as one that does not exist (`AI_RUN_NO_SUCH_CONTEXT`, C-22.11), so C-22.8 is said
     only to a caller who can SEE the project. These arms are about C-22.8's words, so their subject is now INES
     — invited to P1 and never joined, the non-participant who sees it. pia's own answer is pinned in G4. */
  const r = await open(INES, P1, "project");
  t("ARM B1: pia holds contribute and has joined no project — a run over P1 does NOT start",
    r?.started, false);
  /* WHAT THIS ARM CAN AND CANNOT SEE, and it is a FINDING FROM ITS OWN CONTROL
     rather than a caveat written in advance. Arm (b) of `nc-pl18.mjs` replaces
     C-22.8's canned translation with the CAPABILITY sentence — a real collapse,
     the one a surface would actually render — and **THIS ARM STAYED GREEN**,
     because both sides of the comparison read the same catalogue and moved
     together. That is the correct discipline (a typed copy agrees at zero cost)
     and it means this arm proves the plane SENT THE CATALOGUE'S sentence for
     the right key, and NOTHING about what that sentence says. **ARM B3 is what
     holds the content**, and the pair is why B3 exists as its own arm rather
     than as a clause of this one. Recorded here rather than smoothed. */
  t("ARM B2: THE CODE, THE C-NUMBER AND THE CANNED TRANSLATION are what the plane SENT — a surface "
    + "renders a sentence it RECEIVED (DEC-8 as amended by DEC-49), and the translation is compared "
    + "against the catalogue rather than typed here",
    [r?.code, r?.check, r?.translation],
    ["AI_RUN_NOT_PROJECT_MEMBER", "C-22.8", T_PARTICIPATION]);
  /* THE SENTENCE ITSELF. This is the arm the item exists for: not "a refusal
     occurred" — which a collapsed refusal produces just as cheaply — but that
     the words a member reads are about PARTICIPATION and name the remedy. */
  t("ARM B3 (THE SENTENCE): the canned translation tells the member this is about which piece of "
    + "WORK they are part of, not about what they are allowed to do, and it names who can fix it",
    [/not one of that project's participants/i.test(T_PARTICIPATION),
     /not about\s+what the account is allowed to do in general/i.test(T_PARTICIPATION),
     /can invite you/i.test(T_PARTICIPATION)],
    [true, true, true]);
  t("ARM B4 (THE SENTENCE): and the plane's own detail says plainly that the capability would NOT "
    + "have helped — the one sentence that makes the two refusals distinguishable to a member who "
    + "holds contribute and cannot see why they were stopped",
    [/holding\s+contribute would not change it/i.test(str(r?.detail)),
     str(r?.detail).includes("DEC-63")],
    [true, true]);
  /* CORRECTED 2026-09-19 by REC-145: the detail names what the CALLER sent (its own header's rule), and
     over a project context that is the project's id — so `detail.includes(P1)` is now the caller's own
     word echoed, not a leak. The property held is the one the arm was for: nothing names a project the
     caller did NOT name, and the canned sentence names none. */
  t("ARM B5: the refusal names no project the caller did not name — 7.12's skeleton rule means a "
    + "non-participant may not be entitled to learn a project exists",
    [str(r?.detail).includes(P2), str(r?.translation).includes(P1)], [false, false]);
  t("ARM B6: and nothing was written — the refused run does not exist",
    rP(await GET(`op=airun&${RUTH}&run=${lastRun()}`))?.found ?? null, false);
}

console.log("\n--- ARM C · THE CAPABILITY HALF: a project member WITHOUT contribute ---");
{
  const r = await open(VERA, INQ_IN);
  t("ARM C1: vera is a JOINED participant of the project and holds no contribute — refused, and "
    + "refused by the FLOOR rather than by the gate",
    [r?.ok, r?.reason, r?.needs], [false, "NOT_CAPABLE", "contribute"]);
  t("ARM C2 (THE SENTENCE): the capability refusal names the CAPABILITY and the remedy is an "
    + "ADMINISTRATOR — a different fact with a different fix from ARM B's",
    [/does not hold the contribute capability/i.test(str(r?.detail)),
     /ask (an|one)/i.test(str(r?.detail)) || /administrator/i.test(str(r?.detail))],
    [true, true]);
  /* ===================== THE ANTI-COLLAPSE ARM =========================
     The one assertion a single refusal covering both cases cannot pass. It is
     stated in BOTH directions on purpose: it is not enough that the sentences
     differ — each must be silent about the OTHER's subject, or a member reading
     one still cannot tell which fact is true of them. */
  const bd = str((await open(INES, P1, "project"))?.detail) + " " + str(T_PARTICIPATION);
  const cd = str(r?.detail);
  t("ARM C3 (THE ITEM'S HEADLINE): the two refusals are DIFFERENT SENTENCES, and neither carries "
    + "the other's subject — the participation refusal never says the account lacks a capability, "
    + "and the capability refusal never says the account is outside a project",
    [bd !== cd,
     /capabilit/i.test(bd) && !/lacks? the .* capabilit|does not hold the .* capabilit/i.test(bd),
     /project/i.test(cd)],
    [true, true, false]);
  /* CORRECTED AT INTEGRATION 2026-08-09 by CONDUCT. PL-18 pinned the capability
     refusal as carrying NO C-number, which was true when it measured: NOT_CAPABLE
     was one of the untranslated codes REC-64's remaining sweep later partitioned,
     and its admission-gate family (C-38) gave it one. So the old expectation was a
     PIN ON THE GAP, not a rule — and the turn that closed the gap must correct it.
     The assertion is rewritten to the property PL-18 was actually after and which
     is STRONGER than the figure it pinned: both refusals carry a machine key, and
     the two keys DIFFER, so a surface can key on the code and never on the prose. */
  const capCode = r?.code ?? null;
  const gateAns = await open(INES, P1, "project");
  t("ARM C4 (CORRECTED, was a pin on NOT_CAPABLE having no C-number): both refusals carry a MACHINE "
    + "key and the two keys DIFFER, so a surface keys on the code and never on the prose",
    [typeof capCode === "string" && capCode.length > 0, capCode !== "C-22.8", gateAns?.reason ?? undefined],
    [true, true, undefined]);
}

console.log("\n--- ARM D · DEC-17: AN INQUIRY OUTSIDE ANY PROJECT ---");
{
  /* *"An inquiry outside any project has no bar and inherits none."* Decided as
     PERMITTED and STATED. A silent allow and a silent deny would both be the
     overclaim class: nobody reading the answer could tell a projectless
     inquiry from a gate that never ran. */
  const r = await open(PIA, INQ_LOOSE);
  t("ARM D1: pia is in no project and the question is in no project — the run STARTS, because "
    + "DEC-17 puts no bar on an inquiry outside any project",
    [r?.started, r?.status], [true, "running"]);
  /* CORRECTED 2026-09-19 by REC-145, never exempted: D2/D3 pinned the ground PROJECTLESS. That ground
     was said ONLY when no project cited the question, so a member who got any other answer learned that
     some project — possibly one hidden from them — did (§7.9's one bit). Every question now answers on
     ONE ground, INQUIRY, and B0 (cited by a project pia cannot see) must read exactly as this one does. */
  t("ARM D2: AND THE PERMISSION IS STATED RATHER THAN SILENT — the answer says the gate did not "
    + "apply and why, on the SAME ground as a question a project cites (REC-145)",
    [r?.projectGate?.applied, r?.projectGate?.ground, r?.projectGate?.projects],
    [false, "INQUIRY", 0]);
  t("ARM D3: the stated ground is the vocabulary's own sentence, read from the one place it lives",
    r?.projectGate?.why, PROJECT_GATE_GROUNDS.INQUIRY);
  t("ARM D4: and a member WITHOUT contribute is still refused over a projectless question — DEC-17 "
    + "removes the project bar and does NOT remove the floor beneath it",
    [(await open(VERA, INQ_LOOSE))?.reason], ["NOT_CAPABLE"]);
}

console.log("\n--- ARM E · A PROJECT AS THE CONTEXT, not an inquiry ---");
{
  t("ARM E1: sam runs over the project he participates in",
    [(await open(SAM, P1, "project"))?.started], [true]);
  const r = await open(INES, P1, "project");
  t("ARM E2: ines (invited, not joined — she SEES P1) does not, and gets the participation refusal by code",
    [r?.started, r?.code, r?.check], [false, "AI_RUN_NOT_PROJECT_MEMBER", "C-22.8"]);
}

console.log("\n--- ARM F · WHICH STATES COUNT AS PARTICIPATING ---");
{
  const r = await open(INES, P1, "project");
  t("ARM F1: ines is INVITED to the project and has not joined — a run over it is refused. An invited member sees "
    + "the project's SKELETON only, so there is nothing there for them to investigate (7.12's "
    + "reasoning, one door over from forkProject's own NOT_JOINED)",
    [r?.started, r?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  const d = await open(GUS, P1, "project");
  t("ARM F2: gus is an ADMINISTRATOR holding contribute who is not in THIS project — refused, and the "
    + "absence of an admin bypass is DELIBERATE: v2 4.9 is that an administrator SEES every "
    + "project and DIRECTS none of them, and DEC-63's words are *any member of a project*",
    [d?.started, d?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
}

console.log("\n--- ARM G · OVER-STRICTNESS: joined to ONE of the projects that hold the question ---");
{
  /* A fence tighter than its rule is not a safer fence. DEC-63 says *a member of
     the project*, not *of every project*, and `#moveVersionState` already
     states that an inquiry can sit beneath several projects. */
  const r = await open(OTTO, INQ_BOTH);
  /* CORRECTED 2026-09-18 by REC-139 (D-428, Membership v2 §7, BOB #15), never exempted: this pinned
     `projects: 2`, and otto was never invited to P1 — so the answer was COUNTING A PROJECT HE CANNOT
     SEE, which §7.9 forbids (*"not its existence"*) and BOB #15 ruled out for a run's report by name.
     The VERDICT is unchanged (DEC-63 still reads both projects: he starts because he joined P2); the
     stated count is the projects in his sight, which is P2 alone. */
  /* CORRECTED AGAIN 2026-09-19 by REC-145: the ground is INQUIRY, not PARTICIPANT — over a question
     the verdict consults no project (DEC-63 as amended), so otto's P2 standing is not what admits him.
     The count stays REC-139's: the one citing project otto can see. */
  t("ARM G1: otto joined P2 and was never invited to P1; the question is drawn on by BOTH — the run "
    + "STARTS. Requiring participation in every project touching a question would be a fence tighter "
    + "than the rule it enforces. The stated count is the ONE project otto can see (REC-139)",
    [r?.started, r?.projectGate?.ground, r?.projectGate?.projects],
    [true, "INQUIRY", 1]);
  t("ARM G2 (the same arm from the other side): sam joined P1 and not P2, and reaches the same "
    + "shared question — so ARM G1 is about the RULE and not about otto",
    [(await open(SAM, INQ_BOTH))?.started], [true]);
  /* CORRECTED 2026-09-19 by REC-145, never exempted: this pinned pia REFUSED over INQ_BOTH — *"a member
     in NEITHER is still refused, so G1 is not simply an open door"*. Bob's amendment makes it an open
     door ON PURPOSE for a question (*"anybody can ask a question related to anything"*), so the arm now
     asserts the permission and its count, and the door that must stay shut is the PROJECT: G4. */
  const g3 = await open(PIA, INQ_BOTH);
  t("ARM G3 (REC-145): a member in NEITHER project runs over the question both cite — PERMITTED, and "
    + "the count names neither (pia can see neither project)",
    [g3?.started, g3?.code ?? null, g3?.projectGate?.projects], [true, null, 0]);
  /* CORRECTED 2026-09-19 by REC-153 (BOB #16, `7d03e852`): pia cannot SEE either project, so the open answers
     her as for a project that does not exist (C-22.11, sight before position) — still refused, never started.
     The GATE's refusal is kept in this arm by ines, who sees P1 and has not joined it: dropping the gate for
     every context passes G3 and pia's half, and fails ines's. */
  t("ARM G4 (THE LIAR'S ARM, REC-145): and the same member is still REFUSED a run whose context is "
    + "either PROJECT (answered as absent: she sees neither), while ines, who SEES P1, meets the joined gate — "
    + "dropping the gate for every context would pass G3 and fail this",
    [(await open(PIA, P1, "project"))?.code, (await open(PIA, P2, "project"))?.code, (await open(INES, P1, "project"))?.code],
    ["AI_RUN_NO_SUCH_CONTEXT", "AI_RUN_NO_SUCH_CONTEXT", "AI_RUN_NOT_PROJECT_MEMBER"]);
}

console.log("\n--- ARM H · THE TICK AND THE CLOSE CARRY THE SAME GATE ---");
let LRUN = null;   /* REC-152: sam's run over P1 that ARM L drives after he asks to leave */
{
  /* IS-6's own argument: gating the open and leaving the tick free would mean
     an account that may not START a run may still SPEND its budget and drive
     it, which is the fence in the wrong place. */
  /* CORRECTED 2026-09-19 by REC-145, never exempted: this run was over INQ_IN, and after DEC-63's
     amendment a run over a question is gated for nobody — so pia's tick and close below would have been
     PERMITTED and H1-H3 would have measured the amendment, not the three verbs' shared gate. The run is
     RE-AIMED at the project P1, where the gate still stands; H6 states what the amendment does to a run
     over a question. */
  const started = await open(SAM, P1, "project");
  const RUN = lastRun();
  t("ARM H0 (REACH): the run sam opened over P1 is really running — the two arms below would pass "
    + "vacuously over a run that never started",
    [started?.started, started?.status], [true, "running"]);

  /* CORRECTED 2026-09-19 by REC-152, never exempted (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN",
     BOB #16): H1 and H2 asserted pia was REFUSED C-22.8 — `found: true`, the run's status, a code. That
     answer TOLD her the run exists over a project she cannot see (P1 is hidden from the uninvited, §7.9),
     so the old assertion pinned a disclosure. The ruling: *a caller who cannot see the run's context is
     answered as for a run that does not exist.* The project gate on the tick and the close is still
     measured, where a caller can reach it — by the run's own PRINCIPAL once he is no longer joined (ARM L4,
     L5); a caller who is not the principal is refused C-22.12 first (H6, and `airun-principal.test.mjs`). */
  const tick = rP(await POST(`op=airuntick&${PIA}`, { run: RUN, consume: { fetches: 3 },
    log: [{ level: "document", subject: "doc:x", state: "NEVER_LOOKED" }] }));
  t("ARM H1 (CORRECTED, REC-152): pia cannot see P1, so her TICK of a run over it is answered as for a run "
    + "that does not exist — no code, no status, `found: false`",
    [tick?.ticked ?? null, tick?.found, tick?.code ?? null, tick?.status ?? null, str(tick?.note)],
    [null, false, null, null, "no such run: it either never existed or was purged"]);

  const close = rP(await POST(`op=airunclose&${PIA}`, { run: RUN, bound: "completed" }));
  t("ARM H2 (CORRECTED, REC-152): nor is her CLOSE told the run exists — `#aiRunTerminate`'s own "
    + "not-found answer",
    [close?.terminated ?? null, close?.found, close?.code ?? null, str(close?.note)],
    [null, false, null, "no such run: it either never existed or was purged"]);

  /* READ BACK THROUGH A DIFFERENT OP: the refusals are asserted to have CHANGED
     NOTHING, not merely to have answered. A gate that refuses and writes anyway
     is the worst member of this class. */
  const seen = rP(await GET(`op=airun&${RUTH}&run=${RUN}`));
  t("ARM H3 (READ BACK): after both refusals the run is still running on its first tick with "
    + "nothing consumed — the refusals wrote NOTHING",
    [seen?.session?.status ?? seen?.run?.status ?? null, seen?.session?.ticks ?? seen?.run?.ticks ?? null],
    ["running", 1]);

  const ok = rP(await POST(`op=airuntick&${SAM}`, { run: RUN, consume: { fetches: 3 } }));
  t("ARM H4: and sam, who participates, ticks it — so H1 measures the GATE and not a broken tick",
    [ok?.ticked, ok?.ticks, ok?.projectGate?.ground], [true, 2, "PARTICIPANT"]);
  const okc = rP(await POST(`op=airunclose&${SAM}`, { run: RUN, bound: "completed" }));
  t("ARM H5: and closes it, for the same reason — so H2 measures the GATE and not a broken close",
    [okc?.terminated, okc?.found], [true, true]);

  /* REC-145 — WHAT THE AMENDMENT DOES TO A RUN OVER A QUESTION, stated rather than left to be found.
     The three verbs share ONE gate (IS-6's argument, above), and over a question that gate consults no
     project — so a member holding contribute may tick and close ANOTHER member's run over a question.
     That is the ruling applied as written (BOB #16: *"a run whose context is an INQUIRY consults no
     project for its verdict"*); whether a run is its opener's to drive is a question the design does
     not answer, and it is reported as a DESIGN GAP rather than decided here. Pinned so a change to it
     is noticed. */
  /* CORRECTED 2026-09-19 by REC-152, never exempted. The pin above was noticed, and the gap it recorded
     was DECIDED by BOB #16 the same day (Membership v2 §7, "WHO MAY TICK AND CLOSE A RUN"): tick and close
     are the run's PRINCIPAL's acts. The old assertion — pia ticks sam's run, `ticked: true`, ground INQUIRY —
     pinned the as-built behaviour the ruling reverses: a tick by anyone but the principal writes acts under
     a name that did not take them. pia CAN see the question, so she is refused POSITIONALLY (C-22.12),
     not answered as absent — and the run is untouched. */
  await open(SAM, INQ_IN);
  const QRUN = lastRun();
  const qtick = rP(await POST(`op=airuntick&${PIA}`, { run: QRUN, consume: { fetches: 1 } }));
  const qclose = rP(await POST(`op=airunclose&${PIA}`, { run: QRUN, bound: "completed" }));
  const qseen = rP(await GET(`op=airun&${RUTH}&run=${QRUN}`));
  t("ARM H6 (CORRECTED, REC-152 — was a DESIGN GAP pinned as built): pia cannot tick or close sam's run over "
    + "a QUESTION she can see — refused positionally, C-22.12, and the run is untouched",
    [qtick?.ticked, qtick?.code, qtick?.check, qclose?.terminated, qclose?.code,
     qseen?.session?.status, qseen?.session?.ticks],
    [false, "AI_RUN_NOT_PRINCIPAL", "C-22.12", false, "AI_RUN_NOT_PRINCIPAL", "running", 1]);
  /* REC-152: a second run of sam's over P1, left RUNNING for ARM L — once he is `leaving` P1 his OWN tick
     and close must still meet the project gate, which is where that gate on these two verbs is observable
     now that nobody else reaches it. */
  await open(SAM, P1, "project");
  LRUN = lastRun();
}

console.log("\n--- ARM M · A MACHINE CREDENTIAL: the gate does not apply, and says so ---");
{
  /* The gate's population is IDENTICAL to the capability floor's: `NEEDS` is
     enforced only `if (viaSession)`, because there is no member behind a token
     class and participation is a relationship between a PERSON and a project.
     A fence wider than the floor beneath it would refuse the daemon outright.
     DEC-63 names the lever for the machine half and it is a different one —
     *"any narrowing happens at the credential layer"*. */
  const r = rP(await POST("op=airunopen&token=t-member-pl18", {
    run: "RUN-2026-0809-machine", contextType: "inquiry", contextId: INQ_IN,
    principalClaude: "instance", skillVersion: "investigative-session@1", leaseMs: 600000 }));
  t("ARM M1: a machine credential opens a run over a question inside a project it could never "
    + "be a participant of — and the answer STATES that the gate was not applied and why",
    [r?.started, r?.projectGate?.applied, r?.projectGate?.ground],
    [true, false, "NO_MEMBER_BEHIND_CALLER"]);
  t("ARM M2: the stated ground is the vocabulary's own sentence",
    r?.projectGate?.why, PROJECT_GATE_GROUNDS.NO_MEMBER_BEHIND_CALLER);
}

console.log("\n--- ARM S · THE STAMP: `actor` is the SERVER'S, never the caller's ---");
{
  /* A gate that trusts the caller's word about who they are is not a gate.
     `index.mjs` deletes `actor` before it sets it, the `ownerMemberId`
     discipline. Both halves are driven: a caller cannot BORROW a member's
     participation, and a caller cannot DISCLAIM their own. */
  /* CORRECTED 2026-09-19 by REC-145: both arms ran over INQ_IN, where nothing refuses any more, so a
     borrowed or disclaimed `actor` could no longer be SEEN there. Re-aimed at the project P1. */
  /* CORRECTED 2026-09-19 by REC-153: the subject is INES (sees P1, not joined) — see ARM B's note. */
  const borrowed = rP(await POST(`op=airunopen&${INES}&actor=sam`, {
    run: "RUN-2026-0809-borrow", contextType: "project", contextId: P1,
    principalClaude: "project", skillVersion: "investigative-session@1", leaseMs: 600000 }));
  t("ARM S1: ines naming `actor=sam` in her own query does NOT borrow sam's participation — the "
    + "caller-supplied value is overwritten, not honoured",
    [borrowed?.started, borrowed?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  const disclaimed = rP(await POST(`op=airunopen&${INES}&actor=`, {
    run: "RUN-2026-0809-disclaim", contextType: "project", contextId: P1,
    principalClaude: "project", skillVersion: "investigative-session@1", leaseMs: 600000 }));
  t("ARM S2: nor can she blank it to buy the machine credential's exemption — an empty `actor` "
    + "from a SESSION is still the session's member",
    [disclaimed?.started, disclaimed?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
}

console.log("\n--- ARM P · THE PURE DECISION, driven directly over its own corpus ---");
{
  /* The four grounds are a CLOSED vocabulary and every one of them is reached.
     Driven at `projectGate` rather than through the plane because the plane
     cannot manufacture a caller with no member AND a project in one call — and
     a ground nobody reaches is a branch believed on the strength of its
     existence, which is the defect this project meets most. */
  /* A PERMISSION IS NAMED BY ITS GROUND AND A REFUSAL BY ITS CODE — two
     vocabularies for two different things, neither restating the other. So the
     partition this asserts is `PROJECT_GATE_GROUNDS` plus exactly one code. */
  /* CORRECTED 2026-09-19 by REC-145, never exempted: every call below named NO context kind, which was
     harmless while the gate read only the project lists. The verdict now turns on the KIND (a question
     consults no project), so each call says which kind it means: `Q` a question, `PJ` a project. The
     vocabulary is still three grounds and one refusing code — PROJECTLESS is gone, INQUIRY replaces it. */
  const Q = { contextType: "inquiry" }, PJ = { contextType: "project" };
  const g = (a) => projectGate(a).ground;
  const reached = [
    g({ ...PJ, actor: "", projects: ["P"], projectsJoined: [] }),
    g({ ...Q,  actor: "m", projects: [], projectsJoined: [] }),
    g({ ...PJ, actor: "m", projects: ["P"], projectsJoined: ["P"] }),
  ];
  t("ARM P1: EVERY ground in the closed permitting vocabulary is REACHED — corpus "
    + `${Object.keys(PROJECT_GATE_GROUNDS).length} grounds, ${reached.length} driven, `
    + "plus the ONE refusing outcome, which is named by its code and not by a second ground",
    [reached.sort(), projectGate({ ...PJ, actor: "m", projects: ["P"], projectsJoined: [] }).code],
    [Object.keys(PROJECT_GATE_GROUNDS).sort(), "AI_RUN_NOT_PROJECT_MEMBER"]);
  /* `permitted` IS THE VERDICT AND IT IS ASSERTED IN BOTH DIRECTIONS. Three
     grounds permit and one refuses — asserted as the whole partition rather
     than as one example, so a fourth ground added later that quietly permits
     cannot hide behind the one that refuses. */
  t("ARM P2: exactly one ground refuses and the other three permit — the vocabulary is not three "
    + "synonyms for yes, and `permitted` says which is which rather than leaving it to be inferred",
    [projectGate({ ...PJ, actor: "",  projects: ["P"], projectsJoined: [] }).permitted,
     projectGate({ ...Q,  actor: "m", projects: [],    projectsJoined: [] }).permitted,
     projectGate({ ...PJ, actor: "m", projects: ["P"], projectsJoined: ["P"] }).permitted,
     projectGate({ ...PJ, actor: "m", projects: ["P"], projectsJoined: [] }).permitted ?? false,
     projectGate({ ...PJ, actor: "m", projects: ["P"], projectsJoined: [] }).code],
    [true, true, true, false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  t("ARM P2b: and ONLY the refusing ground carries a code — a permitting answer that carried one "
    + "would be a refusal wearing a permission's name",
    [projectGate({ ...PJ, actor: "",  projects: ["P"], projectsJoined: [] }).code ?? null,
     projectGate({ ...Q,  actor: "m", projects: [],    projectsJoined: [] }).code ?? null,
     projectGate({ ...PJ, actor: "m", projects: ["P"], projectsJoined: ["P"] }).code ?? null],
    [null, null, null]);
  t("ARM P3: whitespace is not a member. A caller stamped with blanks is treated as no member "
    + "rather than as a member named ' ' who participates in nothing — a value that survives a "
    + "falsiness guard while naming nobody reads as present and travels (PL-4's measurement)",
    g({ ...PJ, actor: "   ", projects: ["P"], projectsJoined: [] }), "NO_MEMBER_BEHIND_CALLER");
  /* REC-145 — THE PURE HALF OF "CONSULTS NO PROJECT". Over a question the verdict must not MOVE with
     the project lists at all: none, one the member joined, two the member joined neither of. Any
     difference between these three answers (other than the stated count the store replaces) is a
     project consulted. */
  const strip = (v) => ({ permitted: v.permitted, applied: v.applied, ground: v.ground, code: v.code ?? null });
  t("ARM P4 (REC-145): over a QUESTION the verdict is IDENTICAL whatever projects cite it and whichever "
    + "the member joined — no project is consulted",
    [strip(projectGate({ ...Q, actor: "m", projects: [], projectsJoined: [] })),
     strip(projectGate({ ...Q, actor: "m", projects: ["P"], projectsJoined: ["P"] })),
     strip(projectGate({ ...Q, actor: "m", projects: ["P", "R"], projectsJoined: [] }))],
    Array(3).fill({ permitted: true, applied: false, ground: "INQUIRY", code: null }));
}

console.log("\n--- ARM L · `leaving` IS THE THIRD STATE, AND IT DOES NOT PARTICIPATE ---");
{
  /* LAST ON PURPOSE: it changes sam's standing, and every arm above depends on
     him having it. 7.6 makes `leaving` a REQUEST rather than a removal — the
     member keeps their row until an administrator acts — so this is a judgement
     and not a mechanical consequence, and it is DECIDED here: a member who has
     said they are done with this work does not start new work on the strength
     of a row nobody has cleared yet. It is the same direction as `invited`:
     neither is the settled state the gate is about. */
  const left = rP(await GET(`op=projectleave&${SAM}&projectId=${encodeURIComponent(P1)}`));
  t("ARM L0 (REACH): sam's request to leave P1 is RECORDED as `leaving`, not as a removal — the "
    + "arm below would pass vacuously if the op had simply failed",
    [left?.ok, left?.state], [true, "leaving"]);
  /* CORRECTED 2026-09-19 by REC-145: re-aimed from INQ_IN to the project P1 — over a question sam's
     standing is no longer consulted at all (L3 below), so `leaving` is observable only over the project. */
  const r = await open(SAM, P1, "project");
  t("ARM L1: and the same member who opened runs over P1 freely is now refused, by the "
    + "GATE and not by the floor — he still holds contribute",
    [r?.started, r?.code, r?.check], [false, "AI_RUN_NOT_PROJECT_MEMBER", "C-22.8"]);
  t("ARM L2: while the OTHER project's participant is untouched by it — one member's withdrawal "
    + "is not a fact about anybody else's standing",
    [(await open(OTTO, INQ_BOTH))?.started], [true]);
  t("ARM L3 (REC-145): and sam, leaving P1, still runs over the QUESTION P1 cites — his standing in a "
    + "project is not consulted over a question",
    [(await open(SAM, INQ_IN))?.started], [true]);
  /* REC-152 — THE PROJECT GATE ON THE TICK AND THE CLOSE, where it is still reachable. Only a run's own
     principal gets past C-22.12, so the gate stands between the principal and his OWN run once he is no
     longer a joined participant. `leaving` still sees P1 (7.6: the row stays until an administrator
     acts), so this is the gate speaking and not sight. */
  const lt = rP(await POST(`op=airuntick&${SAM}`, { run: LRUN, consume: { fetches: 1 } }));
  t("ARM L4 (REC-152): sam, LEAVING P1, cannot tick even his OWN run over it — the project gate on the tick",
    [lt?.ticked, lt?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  const lc = rP(await POST(`op=airunclose&${SAM}`, { run: LRUN, bound: "completed" }));
  t("ARM L5 (REC-152): nor close it — the project gate on the close; the run is left to its own lease",
    [lc?.terminated, lc?.code, /still running/i.test(str(lc?.note))], [false, "AI_RUN_NOT_PROJECT_MEMBER", true]);
}

console.log(`\nairun-projectgate: ${pass} pass, ${fail} fail`);
await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
process.exit(fail ? 1 : 0);
