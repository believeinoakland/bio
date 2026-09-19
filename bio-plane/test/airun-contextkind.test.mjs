/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/airun-contextkind.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/airun-contextkind.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-19 by REC-153 in worktree agent-a7fe9ecc71d7b4add on base 52218bdd + this item (real src/index.mjs 663,811 B sha256 3f4f83fdb5d6…, src/store.mjs 2,645,672 B sha256 ee65df850c27…, src/airun.mjs 134,216 B sha256 cfa62b05b017…, untouched: YES): baseline 35/0 · **kind-check-dropped — THE ROW'S CONTROL, the call in `aiRunOpen` answering "no refusal" -> 23/12: every MISLABELLED arm, both UNSEEN-REFUSED arms, the C-number arm, the writes-nothing arm and the ORDER arm fail by name; the byte-identity arms stay GREEN as declared (both opens then permitted alike — a byte arm proves no bit, not the refusal)** · refuse-every-inquiry (the row's liar) 26/9 · unseen-permitted 32/3 (NOT AS DECLARED on its first run: olga's ONE ANSWER arm caught it too — declaration widened, see the driver) · sight-not-asked 33/2 (only the AGENT SIGHT arms) · mismatch-names-kind 34/1 · sight-via-roster-form (over-strictness) 35/0. BEFORE, the unedited tree ran this suite 23/12: olga (not joined) opened a run over sam's PROJECT labelled `inquiry` — `[true, null, "INQUIRY"]`.
 * =========================================================================
 * REC-153 — `aiRunOpen` REFUSES A `contextType` THAT DOES NOT MATCH THE NAMED BUNDLE'S TYPE, AND AN ID
 * THE CALLER CANNOT SEE ANSWERS AS ABSENT. Membership Architecture v2 §7, the DEC-63 ruling bullet,
 * *"AND THE CONTEXT KIND IS CHECKED"* (BOB #16, 2026-09-19, `ed249814`).
 *
 * THE DEFECT, measured on the unedited tree (`52218bdd` + the claim) by this suite's own first run:
 * `aiRunOpen` never compared `contextType` with the named bundle's type, and REC-145 made the verdict
 * turn on the KIND (`runConsultsProjects`): over a question no project is consulted. So a member who has
 * NOT joined a project opened a run over THAT PROJECT'S ID by calling it an `inquiry` — `started: true`,
 * ground `INQUIRY` — walking around the joined gate the same open labelled `project` meets.
 *
 * WHAT IS BUILT (the rule, and the one refusal that carries it — `AI_RUN_NO_SUCH_CONTEXT`, C-22.11):
 *   - The named bundle is looked up IN THE CALLER'S SIGHT (`Store#inSight`, the one sight predicate). A
 *     bundle the caller sees whose type is not the kind they said is REFUSED — whoever the caller is,
 *     participant or not, member or machine.
 *   - An id the caller cannot see answers EXACTLY as a never-minted one (§7.9; `#noSuchProject`'s
 *     discipline): the refusal is built ONLY from what the caller sent, so absent, hidden and mislabelled
 *     are one object by construction.
 *   - What an unseen id answers is REC-138's posture, unchanged in shape: a MEMBER is refused under any
 *     kind that consults no project (under `project` the joined gate already refuses absent and hidden
 *     alike, and still does); a MACHINE credential, which has no participation to check, is not refused
 *     for an id this store does not hold — a run's context need not be a bundle this store holds.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) refuse every `inquiry`-context open. §4 requires a correctly labelled run over a real question to
 *       OPEN, for a participant, a non-participant and a machine.
 *   (b) refuse only the SEEN mismatch, and let an unseen id through. §3 requires vera's inquiry-labelled
 *       open over the project hidden from her to be REFUSED, and byte-identical to a never-minted id.
 *   (c) keep the byte-identity by PERMITTING both. §3's REFUSED arm is separate from its byte arm for
 *       exactly this: a byte arm proves no bit, not the refusal.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.AIRUN_CONTEXTKIND_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const SHOW = process.env.AIRUN_CONTEXTKIND_SHOW === "1";   /* print the raw answers (the before-table) */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec153", MEM = "mem-rec153";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const show = (label, r) => { if (SHOW) console.log(`  RAW ${label}: ${r.status} ${r.type} ${r.body}`); };
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-153" }));
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-153` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-153` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");    /* an administrator: sees every project (§7.3), joins none here */
const SAM  = await enrol("sam", "member");    /* owns (so has JOINED) the visible project */
const OLGA = await enrol("olga", "member");   /* INVITED to sam's project, never joins: sees it, not a participant */
const IRIS = await enrol("iris", "member");   /* owns the HIDDEN project */
const VERA = await enrol("vera", "member");   /* never invited to either: sam's and iris's are both unseen by her */

const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", "Did it?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
const projectMd = (id, title) => ["---", `id: ${id}`, "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
let seq = 0;
const create = (tok, id, type, title) => {
  const md = type === "project" ? projectMd(id, title) : inquiryMd(id);
  return RAW(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `20260701T0000${String(++seq).padStart(2, "0")}Z_rec153`,
    meta: { object_type: type, group: "believe-in-oakland", title,
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
};

const VISIBLE = "PROJ-2026-9153-visible", V_TITLE = "Parking Citation Revenue";
const HIDDEN = "PROJ-2026-9153-hidden", H_TITLE = "Stormwater Bond Draws";
const Q = "INQ-2026-9153-question";
/* Two ids nothing ever mints, one per prefix, so an id's SHAPE cannot be what the answer turns on. */
const NEVER_P = "PROJ-2026-9153-nevermint", NEVER_Q = "INQ-2026-9153-nevermint";
must("sam creates the visible project", parse(await create(SAM, VISIBLE, "project", V_TITLE)));
must("iris creates the hidden project", parse(await create(IRIS, HIDDEN, "project", H_TITLE)));
must("the question", parse(await create(ADM, Q, "inquiry", "Did the fund follow its adopted purpose?")));
must("sam invites olga (she never joins)", await POST(`op=projectinvite&token=${SAM}&projectId=${VISIBLE}&handle=olga`));

const listed = async (tok) => ((await POST(`op=list&token=${tok}&limit=1000`))?.bundles ?? []).map((b) => b.bundle_id);
t("FIXTURE: sam, olga (invited) and ruth (administrator) SEE the visible project; vera does NOT",
  [(await listed(SAM)).includes(VISIBLE), (await listed(OLGA)).includes(VISIBLE),
   (await listed(RUTH)).includes(VISIBLE), (await listed(VERA)).includes(VISIBLE)], [true, true, true, false]);
t("FIXTURE: vera does NOT see the hidden project; ruth does",
  [(await listed(VERA)).includes(HIDDEN), (await listed(RUTH)).includes(HIDDEN)], [false, true]);
t("FIXTURE: the two never-minted ids are absent to the administrator token",
  [(await listed(ADM)).includes(NEVER_P), (await listed(ADM)).includes(NEVER_Q)], [false, false]);

/* A FIXED clock one day ahead of the wall clock, so no run lapses to the reaper between reads
   (project-disclosure.test.mjs's measured reason). */
const RUN_AT = new Date(Math.floor(Date.now() / 3600000) * 3600000 + 86400000).toISOString().replace(/\.\d{3}Z$/, "Z");
let runSeq = 0;
const nextRun = () => `RUN-rec153-${++runSeq}`;
const openRaw = (tok, run, contextType, contextId, over = {}) => RAW(`op=airunopen&token=${tok}`, {
  run, contextType, contextId, label: "evidence sweep", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000, at: RUN_AT, ...over });
const open = async (tok, contextType, contextId, over) => parse(await openRaw(tok, nextRun(), contextType, contextId, over));
/* The run id and the context id are the only things two opens differ in by construction. */
const norm = (r, run, ctx) => ({ status: r.status, type: r.type,
  sha: sha(r.body.split(run).join("RUN").split(ctx).join("CTX")) });
const verdict = (r) => [r?.started ?? null, codeOf(r), r?.projectGate?.ground ?? null];
const REFUSED = (code) => [false, code, null];

/* ======================================================== 1. THE DEFECT */
console.log("\n--- 1. a PROJECT's id labelled `inquiry` is refused — the walk around the joined gate is closed ---");
{
  const byOlga = await open(OLGA, "inquiry", VISIBLE);
  const byRuth = await open(RUTH, "inquiry", VISIBLE);
  const bySam = await open(SAM, "inquiry", VISIBLE);
  const byMachine = await open(MEM, "inquiry", VISIBLE);
  t("REC-153 MISLABELLED: olga (SEES the project, has NOT joined) opening it as an `inquiry` is REFUSED",
    verdict(byOlga), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  t("REC-153 MISLABELLED: ruth (an administrator, sees it, not joined) is refused the same way",
    verdict(byRuth), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  /* A MISMATCH IS REFUSED, not a non-participant's mismatch: the ruling is about the record's claim of
     WHAT the run is over, and sam's run labelled a question would be a run over his project that the
     record says is over a question. */
  t("REC-153 MISLABELLED: sam (JOINED — the gate would admit him as `project`) is refused too: a mismatch is refused",
    verdict(bySam), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  t("REC-153 MISLABELLED: a machine credential (no participation to ask, sees every project) is refused too",
    verdict(byMachine), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  /* A spelling the vocabulary does not hold is not a door either: `Project` is not `project`, so as built
     before this item it consulted no project too. */
  t("REC-153 MISLABELLED: olga opening it as `Project` (a spelling, not the kind) is refused",
    verdict(await open(OLGA, "Project", VISIBLE)), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  t("REC-153 MISLABELLED: and as a kind the vocabulary does not hold at all (`information`)",
    verdict(await open(OLGA, "information", VISIBLE)), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  /* The other direction: a QUESTION labelled `project`. */
  t("REC-153 MISLABELLED: sam opening the QUESTION as a `project` is refused",
    verdict(await open(SAM, "project", Q)), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));

  /* THE REFUSAL IS DEC-49's: a C-number and a canned translation read from the catalogue, and a detail
     naming only what the caller sent. */
  const row = AI_RUN_CHECKS.AI_RUN_NO_SUCH_CONTEXT || {};
  t("the refusal carries its C-number and the catalogue's own translation",
    [byOlga?.check, byOlga?.translation, typeof row.translation === "string" && row.translation.length > 40],
    [row.check ?? "(no catalogue row)", row.translation ?? "(no catalogue row)", true]);
  t("the refusal names no title and says nothing of the project's participants",
    [JSON.stringify(byOlga).includes(V_TITLE), /sam|owner/i.test(String(byOlga?.detail))], [false, false]);

  /* ONE ANSWER: the refusal is built only from what the caller sent, so a mismatch over a bundle the
     caller SEES says no more than an id nobody minted — the refusal describes nothing she did not name. */
  const oS = nextRun(), oN = nextRun();
  const olgaSeen = await openRaw(OLGA, oS, "inquiry", VISIBLE);
  const olgaNever = await openRaw(OLGA, oN, "inquiry", NEVER_P);
  t("ONE ANSWER: olga's refusal over the project she SEES is byte-identical to her refusal over a never-minted id",
    norm(olgaSeen, oS, VISIBLE), norm(olgaNever, oN, NEVER_P));

  /* NOTHING WAS WRITTEN: the refused run id is free, so the same id correctly labelled meets the gate
     (and would read AI_RUN_ALREADY_OPEN had the refused open inserted a row). */
  const RID = nextRun();
  const first = parse(await openRaw(SAM, RID, "inquiry", VISIBLE));
  const again = parse(await openRaw(SAM, RID, "project", VISIBLE));
  t("a refused open WRITES NOTHING: the same run id then opens correctly labelled",
    [verdict(first), verdict(again)], [REFUSED("AI_RUN_NO_SUCH_CONTEXT"), [true, null, "PARTICIPANT"]]);
}

/* ======================================================== 2. THE JOINED GATE, UNCHANGED */
console.log("\n--- 2. the same open labelled `project` still meets the joined gate ---");
{
  t("REC-153 LABELLED `project`: olga (invited, not joined) is refused by the JOINED GATE, not by the kind check",
    verdict(await open(OLGA, "project", VISIBLE)), REFUSED("AI_RUN_NOT_PROJECT_MEMBER"));
  t("REC-153 LABELLED `project`: ruth (administrator, not joined) likewise — no administrator bypass",
    verdict(await open(RUTH, "project", VISIBLE)), REFUSED("AI_RUN_NOT_PROJECT_MEMBER"));
  t("REC-153 LABELLED `project`: sam (joined) OPENS, on the PARTICIPANT ground",
    verdict(await open(SAM, "project", VISIBLE)), [true, null, "PARTICIPANT"]);
  t("REC-153 LABELLED `project`: a machine credential OPENS, not asked (NO_MEMBER_BEHIND_CALLER)",
    verdict(await open(MEM, "project", VISIBLE)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

/* ======================================================== 3. UNSEEN IS ABSENT */
console.log("\n--- 3. an id the caller cannot see answers exactly as a never-minted one ---");
{
  const rH = nextRun(), rN = nextRun(), rNQ = nextRun();
  const hidden = await openRaw(VERA, rH, "inquiry", HIDDEN);
  const never = await openRaw(VERA, rN, "inquiry", NEVER_P);
  const neverQ = await openRaw(VERA, rNQ, "inquiry", NEVER_Q);
  show("vera: inquiry over the hidden project", hidden);
  show("vera: inquiry over a never-minted id", never);
  t("REC-153 UNSEEN REFUSED: vera opening the project HIDDEN from her as an `inquiry` is REFUSED",
    verdict(parse(hidden)), REFUSED("AI_RUN_NO_SUCH_CONTEXT"));
  t("REC-153 UNSEEN REFUSED: and a never-minted id is refused by the same code",
    [verdict(parse(never)), verdict(parse(neverQ))], [REFUSED("AI_RUN_NO_SUCH_CONTEXT"), REFUSED("AI_RUN_NO_SUCH_CONTEXT")]);
  t("REC-153 BYTE-IDENTICAL: vera's raw answer over the hidden project equals her answer over a never-minted id",
    norm(hidden, rH, HIDDEN), norm(never, rN, NEVER_P));
  t("REC-153 BYTE-IDENTICAL: and over a never-minted id of the other prefix (the id's shape is not read)",
    norm(hidden, rH, HIDDEN), norm(neverQ, rNQ, NEVER_Q));
  /* A project vera cannot see answers as absent — and so does one she cannot see that is VISIBLE to
     others (sam's: she was never invited), which is §7.9's uninvited row, not a special case. */
  const rV = nextRun();
  const unseenVisible = await openRaw(VERA, rV, "inquiry", VISIBLE);
  t("REC-153 BYTE-IDENTICAL: sam's project (never shown to vera) answers her exactly as the never-minted id",
    norm(unseenVisible, rV, VISIBLE), norm(never, rN, NEVER_P));
  t("the hidden project's title appears nowhere in vera's raw answer", hidden.body.includes(H_TITLE), false);

  /* UNDER `project`, REC-138's byte-identity stands and this item leaves it where it was: the joined gate
     answers absent and hidden alike. Re-asserted here because the kind check now runs BEFORE that gate. */
  const pH = nextRun(), pN = nextRun();
  const hiddenP = await openRaw(VERA, pH, "project", HIDDEN);
  const neverP = await openRaw(VERA, pN, "project", NEVER_P);
  t("REC-138 KEPT: under `project`, the hidden project and a never-minted id are one refusal, byte for byte",
    [verdict(parse(hiddenP)), norm(hiddenP, pH, HIDDEN)], [REFUSED("AI_RUN_NOT_PROJECT_MEMBER"), norm(neverP, pN, NEVER_P)]);

  /* A MACHINE CREDENTIAL is not refused for an id this store does not hold: a run's context need not be
     a bundle held here (PL-18), and a machine has no participation to walk around — it is not gated
     under `project` either. It SEES every project, so it has no hidden id to be told about. */
  t("MACHINE: an `inquiry` run over a never-minted id OPENS, unchanged (no member behind the caller)",
    verdict(await open(MEM, "inquiry", NEVER_Q)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

/* ======================================================== 4. THE LIAR'S ARM */
console.log("\n--- 4. a correctly labelled inquiry run still opens ---");
{
  t("REC-153 LIAR'S ARM: sam (a participant elsewhere) opens a run over the QUESTION labelled `inquiry`",
    verdict(await open(SAM, "inquiry", Q)), [true, null, "INQUIRY"]);
  t("REC-153 LIAR'S ARM: vera (in NO project) opens it too — a question consults no project",
    verdict(await open(VERA, "inquiry", Q)), [true, null, "INQUIRY"]);
  t("REC-153 LIAR'S ARM: olga and ruth open it too",
    [verdict(await open(OLGA, "inquiry", Q)), verdict(await open(RUTH, "inquiry", Q))],
    [[true, null, "INQUIRY"], [true, null, "INQUIRY"]]);
  t("REC-153 LIAR'S ARM: a machine credential opens it",
    verdict(await open(MEM, "inquiry", Q)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

/* ======================================================== 5. THE ORDER */
console.log("\n--- 5. the kind check runs at the open, before the gate and before the run's own shape ---");
{
  /* Authority before shape (PL-18's order): a mislabelled open with no skill version is told about its
     context, not about its skill version — the kind is a question about the context, asked first. */
  t("ORDER: a mislabelled open that also omits the skill version is refused on its CONTEXT, not its shape",
    codeOf(await open(OLGA, "inquiry", VISIBLE, { skillVersion: null })), "AI_RUN_NO_SUCH_CONTEXT");
  t("ORDER: a correctly labelled open without a skill version still meets C-22.7 (the check added nothing there)",
    codeOf(await open(SAM, "inquiry", Q, { skillVersion: null })), "AI_RUN_SKILL_VERSION_UNNAMED");
}

/* ======================================================== 6. AN AI CREDENTIAL'S SIGHT */
console.log("\n--- 6. an `ai` credential sees as its principal: a project hidden from that member is absent to it ---");
{
  /* The one caller for whom SIGHT changes the answer: an `ai` credential carries its principal member's
     viewer but stamps NO actor (it is not a person, so it is never asked for participation). Asked in
     its sight, the project hidden from vera is ABSENT to vera's agent, and it answers exactly as a
     never-minted id does for a machine — opened, not refused. Asked with no sight at all, the same open
     would be REFUSED as a mismatch while the never-minted id opens: the refusal WOULD be the bit. */
  const cred = await POST(`op=aicredentialmint&token=${RUTH}`, {
    tokenId: "vera-agent-153", principalKind: "member", principalMember: "vera",
    taskScope: "runs", writes: ["airunopen"], note: "vera's agent, allowed to open its own runs" });
  const AK = cred?.token;
  t("FIXTURE: an `ai` credential for vera is minted, and it opens a run over the question",
    [typeof AK === "string", verdict(AK ? await open(AK, "inquiry", Q) : null)],
    [true, [true, null, "NO_MEMBER_BEHIND_CALLER"]]);
  const aH = nextRun(), aN = nextRun();
  const agentHidden = await openRaw(AK, aH, "inquiry", HIDDEN);
  const agentNever = await openRaw(AK, aN, "inquiry", NEVER_P);
  t("REC-153 AGENT SIGHT: vera's agent over the project hidden from vera answers EXACTLY as over a never-minted id",
    [verdict(parse(agentHidden)), norm(agentHidden, aH, HIDDEN)],
    [[true, null, "NO_MEMBER_BEHIND_CALLER"], norm(agentNever, aN, NEVER_P)]);
  t("REC-153 AGENT SIGHT: and over sam's project, which vera's agent CANNOT see either, the same",
    verdict(await open(AK, "inquiry", VISIBLE)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nairun-contextkind: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
