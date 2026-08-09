/* NEGATIVE CONTROL: `node bio-plane/test/nc-pl18.mjs` — TEN ROWS (a baseline plus nine arms), each armed ALONE, each declared before arming, each refusing to arm on an anchor that does not occur exactly once, every restore verified by sha256 AND `cmp` against a per-arm pristine copy with a byte floor. RUN 2026-08-09 by PL-18 (worktree agent-a4e2eff5ca09197e2). (0) BASELINE, nothing edited -> exit 0, 47 pass, 0 fail — the row that distinguishes nine-arms-broken from nine-arms-working. (a) THE ARM THIS SUITE EXISTS FOR — collapse the two refusals by giving the participation refusal the CAPABILITY refusal's words -> 45 pass, 2 fail, B4 and C3, **with B1 and B2 STAYING GREEN**: a refusal still occurs and still carries C-22.8, so only the arms asserting the SENTENCE can see the collapse. That asymmetry is the whole evidence that this suite is not buying an outcome that costs nothing to produce. (b) collapse the CANNED TRANSLATION in the catalogue -> 45 pass, 2 fail, B3 and C3 — **DECLARED B2 AND B2 STAYED GREEN, and that is a finding about the ARM, recorded at B2's site: both sides of B2 read the same catalogue and move together, so B2 can see a mis-keyed translation and never a wrong one.** (c) remove the gate from `aiRunOpen` alone -> 35 pass, 12 fail, every open refusal, with C1/C2 (the capability floor) and H1/H2 (the tick and close) GREEN — the three verbs are gated independently. (d) remove it from the tick alone -> 44/3, H1 H3 **H4** (H4 was not declared: it pins an absolute tick count, and an ungated tick moved it — the load-bearing-count class REC-75 recorded). (e) DEC-17's case armed the wrong way, a projectless inquiry silently DENIED -> 41/6, D1 D2 D3 **and P1, P2, P2b**, none of the three declared and all three the arm working: the P arms assert the closed permitting vocabulary is wholly REACHED and that only the refusing outcome carries a code, and PROJECTLESS became unreachable. (f) over-strictness, require participation in EVERY project holding the question -> 44/3, G1 G2 **L2** (undeclared, same cause), with A1/B/C/D green. (g) over-strictness the other way, admit `invited` and `leaving` as participating -> 45/2, F1 L1, exactly as declared. (h) neuter the CAPABILITY FLOOR in index.mjs -> 44/3, C1 C2 D4, **with ARM B GREEN** — the pair proving the two fences are independent rather than one measured twice. (i) drop the server-side `actor` stamp -> 26/21, far wider than the declared S1/A2/D2/H4 and in the declared direction: with no stamp every session reads as no member and the gate collapses wholesale. NOT AN ARM, and stated rather than discovered: `inner.searchParams.delete("actor")` is behaviourally INVISIBLE today, because the `set` below it is unconditional for all three verbs — kept as a structural guard, on REC-75's idempotent-write precedent. */
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
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
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
const projectMd = (id) => ["---", `id: ${id}`, "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");

let seq = 0;
const bundle = (id, type) => {
  const md = type === "project" ? projectMd(id) : inquiryMd(id);
  return {
    bundleId: id, base: null, snapKey: `20260809T1200${String(++seq).padStart(2, "0")}Z_aaaa1111`,
    meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
            current_state: type === "project" ? "forming" : "open",
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
  };
};
const promote = async (tok, id, type) => rP(await POST(`op=promote&${tok}`, bundle(id, type)));

const P1 = "PROJ-2026-8001-sewer";
const P2 = "PROJ-2026-8002-water";
const INQ_IN   = "INQ-2026-8010-transfers";   // cited by P1
const INQ_BOTH = "INQ-2026-8011-shared";      // cited by P1 AND P2
const INQ_LOOSE = "INQ-2026-8012-loose";      // cited by nobody — DEC-17's case

console.log("\n--- FIXTURE: two projects, three inquiries, and NOT ONE HAND-AUTHORED EDGE ---");
{
  const mk = [];
  mk.push(await promote(RUTH, P1, "project"));
  mk.push(await promote(GUS,  P2, "project"));
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
    (back?.backlinks ?? []).map((x) => x.from).sort(), [P1, P2]);
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
  t("ARM A2: and the answer STATES the ground it was permitted on, rather than merely not refusing",
    [r?.projectGate?.applied, r?.projectGate?.ground, r?.projectGate?.projects],
    [true, "PARTICIPANT", 1]);
}

console.log("\n--- ARM B · THE PARTICIPATION HALF: a contribute-holder OUTSIDE the project ---");
{
  const r = await open(PIA, INQ_IN);
  t("ARM B1: pia holds contribute and is in no project — the run does NOT start",
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
  t("ARM B5: the refusal does NOT leak which projects hold the question — 7.12's skeleton rule "
    + "means a non-participant may not be entitled to learn a project exists",
    [str(r?.detail).includes(P1), str(r?.translation).includes(P1)], [false, false]);
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
  const bd = str((await open(PIA, INQ_IN))?.detail) + " " + str(T_PARTICIPATION);
  const cd = str(r?.detail);
  t("ARM C3 (THE ITEM'S HEADLINE): the two refusals are DIFFERENT SENTENCES, and neither carries "
    + "the other's subject — the participation refusal never says the account lacks a capability, "
    + "and the capability refusal never says the account is outside a project",
    [bd !== cd,
     /capabilit/i.test(bd) && !/lacks? the .* capabilit|does not hold the .* capabilit/i.test(bd),
     /project/i.test(cd)],
    [true, true, false]);
  t("ARM C4: and they carry different MACHINE keys too, so a surface keys on the code and never on "
    + "the prose — the capability refusal has no C-number at all and the gate's has C-22.8",
    [r?.code ?? null, (await open(PIA, INQ_IN))?.reason ?? null],
    [null, undefined]);
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
  t("ARM D2: AND THE PERMISSION IS STATED RATHER THAN SILENT — the answer says the gate did not "
    + "apply and why, so a projectless run is distinguishable from an ungated one",
    [r?.projectGate?.applied, r?.projectGate?.ground, r?.projectGate?.projects],
    [false, "PROJECTLESS", 0]);
  t("ARM D3: the stated ground is the vocabulary's own sentence, read from the one place it lives",
    r?.projectGate?.why, PROJECT_GATE_GROUNDS.PROJECTLESS);
  t("ARM D4: and a member WITHOUT contribute is still refused over a projectless question — DEC-17 "
    + "removes the project bar and does NOT remove the floor beneath it",
    [(await open(VERA, INQ_LOOSE))?.reason], ["NOT_CAPABLE"]);
}

console.log("\n--- ARM E · A PROJECT AS THE CONTEXT, not an inquiry ---");
{
  t("ARM E1: sam runs over the project he participates in",
    [(await open(SAM, P1, "project"))?.started], [true]);
  const r = await open(PIA, P1, "project");
  t("ARM E2: pia does not, and gets the participation refusal by code",
    [r?.started, r?.code, r?.check], [false, "AI_RUN_NOT_PROJECT_MEMBER", "C-22.8"]);
}

console.log("\n--- ARM F · WHICH STATES COUNT AS PARTICIPATING ---");
{
  const r = await open(INES, INQ_IN);
  t("ARM F1: ines is INVITED to the project and has not joined — refused. An invited member sees "
    + "the project's SKELETON only, so there is nothing there for them to investigate (7.12's "
    + "reasoning, one door over from forkProject's own NOT_JOINED)",
    [r?.started, r?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  const d = await open(GUS, INQ_IN);
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
  t("ARM G1: otto joined P2 and declined P1; the question is drawn on by BOTH — the run STARTS. "
    + "Requiring participation in every project touching a question would be a fence tighter "
    + "than the rule it enforces",
    [r?.started, r?.projectGate?.ground, r?.projectGate?.projects],
    [true, "PARTICIPANT", 2]);
  t("ARM G2 (the same arm from the other side): sam joined P1 and not P2, and reaches the same "
    + "shared question — so ARM G1 is about the RULE and not about otto",
    [(await open(SAM, INQ_BOTH))?.started], [true]);
  t("ARM G3: and a member in NEITHER is still refused, so G1 is not simply an open door",
    [(await open(PIA, INQ_BOTH))?.code], ["AI_RUN_NOT_PROJECT_MEMBER"]);
}

console.log("\n--- ARM H · THE TICK AND THE CLOSE CARRY THE SAME GATE ---");
{
  /* IS-6's own argument: gating the open and leaving the tick free would mean
     an account that may not START a run may still SPEND its budget and drive
     it, which is the fence in the wrong place. */
  const started = await open(SAM, INQ_IN);
  const RUN = lastRun();
  t("ARM H0 (REACH): the run sam opened is really running — the two arms below would pass "
    + "vacuously over a run that never started",
    [started?.started, started?.status], [true, "running"]);

  const tick = rP(await POST(`op=airuntick&${PIA}`, { run: RUN, consume: { fetches: 3 },
    log: [{ level: "document", subject: "doc:x", state: "NEVER_LOOKED" }] }));
  t("ARM H1: pia cannot TICK a run over a question she is outside — refused by code, and the "
    + "answer says plainly that nothing was appended and no budget was spent",
    [tick?.ticked, tick?.code, /no budget was spent/i.test(str(tick?.note))],
    [false, "AI_RUN_NOT_PROJECT_MEMBER", true]);

  const close = rP(await POST(`op=airunclose&${PIA}`, { run: RUN, bound: "completed" }));
  t("ARM H2: nor CLOSE it — and the answer says the run is untouched rather than reporting a "
    + "close that did not happen. The refusal wears `#aiRunTerminate`'s OWN shape "
    + "(`found`/`terminated`) rather than a second vocabulary for one op's failures",
    [close?.terminated, close?.found, close?.code, /still running/i.test(str(close?.note))],
    [false, true, "AI_RUN_NOT_PROJECT_MEMBER", true]);

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
  const borrowed = rP(await POST(`op=airunopen&${PIA}&actor=sam`, {
    run: "RUN-2026-0809-borrow", contextType: "inquiry", contextId: INQ_IN,
    principalClaude: "project", skillVersion: "investigative-session@1", leaseMs: 600000 }));
  t("ARM S1: pia naming `actor=sam` in her own query does NOT borrow sam's participation — the "
    + "caller-supplied value is overwritten, not honoured",
    [borrowed?.started, borrowed?.code], [false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  const disclaimed = rP(await POST(`op=airunopen&${PIA}&actor=`, {
    run: "RUN-2026-0809-disclaim", contextType: "inquiry", contextId: INQ_IN,
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
  const g = (a) => projectGate(a).ground;
  const reached = [
    g({ actor: "", projects: ["P"], projectsJoined: [] }),
    g({ actor: "m", projects: [], projectsJoined: [] }),
    g({ actor: "m", projects: ["P"], projectsJoined: ["P"] }),
  ];
  t("ARM P1: EVERY ground in the closed permitting vocabulary is REACHED — corpus "
    + `${Object.keys(PROJECT_GATE_GROUNDS).length} grounds, ${reached.length} driven, `
    + "plus the ONE refusing outcome, which is named by its code and not by a second ground",
    [reached.sort(), projectGate({ actor: "m", projects: ["P"], projectsJoined: [] }).code],
    [Object.keys(PROJECT_GATE_GROUNDS).sort(), "AI_RUN_NOT_PROJECT_MEMBER"]);
  /* `permitted` IS THE VERDICT AND IT IS ASSERTED IN BOTH DIRECTIONS. Three
     grounds permit and one refuses — asserted as the whole partition rather
     than as one example, so a fourth ground added later that quietly permits
     cannot hide behind the one that refuses. */
  t("ARM P2: exactly one ground refuses and the other three permit — the vocabulary is not three "
    + "synonyms for yes, and `permitted` says which is which rather than leaving it to be inferred",
    [projectGate({ actor: "",  projects: ["P"], projectsJoined: [] }).permitted,
     projectGate({ actor: "m", projects: [],    projectsJoined: [] }).permitted,
     projectGate({ actor: "m", projects: ["P"], projectsJoined: ["P"] }).permitted,
     projectGate({ actor: "m", projects: ["P"], projectsJoined: [] }).permitted ?? false,
     projectGate({ actor: "m", projects: ["P"], projectsJoined: [] }).code],
    [true, true, true, false, "AI_RUN_NOT_PROJECT_MEMBER"]);
  t("ARM P2b: and ONLY the refusing ground carries a code — a permitting answer that carried one "
    + "would be a refusal wearing a permission's name",
    [projectGate({ actor: "",  projects: ["P"], projectsJoined: [] }).code ?? null,
     projectGate({ actor: "m", projects: [],    projectsJoined: [] }).code ?? null,
     projectGate({ actor: "m", projects: ["P"], projectsJoined: ["P"] }).code ?? null],
    [null, null, null]);
  t("ARM P3: whitespace is not a member. A caller stamped with blanks is treated as no member "
    + "rather than as a member named ' ' who participates in nothing — a value that survives a "
    + "falsiness guard while naming nobody reads as present and travels (PL-4's measurement)",
    g({ actor: "   ", projects: ["P"], projectsJoined: [] }), "NO_MEMBER_BEHIND_CALLER");
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
  const r = await open(SAM, INQ_IN);
  t("ARM L1: and the same member who opened runs freely three arms ago is now refused, by the "
    + "GATE and not by the floor — he still holds contribute",
    [r?.started, r?.code, r?.check], [false, "AI_RUN_NOT_PROJECT_MEMBER", "C-22.8"]);
  t("ARM L2: while the OTHER project's participant is untouched by it — one member's withdrawal "
    + "is not a fact about anybody else's standing",
    [(await open(OTTO, INQ_BOTH))?.started], [true]);
}

console.log(`\nairun-projectgate: ${pass} pass, ${fail} fail`);
await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
process.exit(fail ? 1 : 0);
