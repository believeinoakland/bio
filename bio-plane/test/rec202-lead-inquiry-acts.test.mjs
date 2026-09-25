/* NEGATIVE CONTROL: withhold the inquiry-grain option, in src/store.mjs #leadInquiryActs (the doors'
   composer, called per lead by #findingsOutOfInquiryLead), each arm ALONE, restored by sha256 AND cmp against a per-arm
   pristine copy. ARMED 2026-09-25 by REC-202's worker on the inline form (3,476,109 bytes) and RE-ARMED on the helper
   form (3,476,646 bytes) after the move: the same assertions failed in both.
   (1) W1 — delete the `set_aside` entry from `item.inquiry_acts` -> DECLARED MUST FAIL: "§2 SET ASIDE IS PUBLISHED", "§4 THE
        PUBLISHED SET-ASIDE DOOR COMPLETES". MUST NOT: §1, §2 TAKE UP, §3. ACTUAL: 6 failed, the two declared plus their
        consequences (§2 agrees-with-disposition, §2 NO DECLARED GAP — `options_grain.inquiry` is derived from the doors —
        §4 left-the-list, §5 set-aside-closed); §1, §2 TAKE UP and §3 stayed green. RESTORED identical.
   (2) W2 — make the take-up's condition `false ? … : …` (withheld behind its closed branch) -> DECLARED MUST FAIL: "§2 TAKE UP
        IS PUBLISHED", "§3 THE PUBLISHED TAKE-UP DOOR COMPLETES". MUST NOT: §4. ACTUAL: 4 failed, the two declared plus §3's
        basis-entry measurement and §5's take-up door; §4 stayed green. RESTORED identical.
   OVER-STRICTNESS: §5 — a member of NO project gets the take-up door (the act, not the feed, judges his position) and
   a set-aside door published CLOSED with its reason (no_project_scope), rather than no door at all.
 * =========================================================================
 * REC-202 — A MEMBER TAKES UP AND SETS ASIDE AN OUT-OF-INQUIRY LEAD AT THE INQUIRY'S GRAIN.
 *
 * PL-15 declared on the lead `options_grain: { offered: "document", missing: "inquiry" }` — take this up
 * under that question, or set it aside, "do not exist yet" (D-222). BOB #32, 2026-09-23 23:08Z: *row it — a
 * missing member door.* Read at the code on 5e8a65a8: BOTH ops existed — `op=cite`'s inquiry arm (REC-37)
 * makes a document a leg of a question's basis, and `op=proposedispose`'s project-scoped arm (D-266, IC-60)
 * sets a judgment-layer finding aside for one team — and the item went on saying they did not. This suite
 * drives the lead's own published doors THROUGH THE OPS, with the arguments the item publishes and nothing
 * the suite composes, and asserts no declared gap remains on the lead.
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DISPOSITIONS } from "../src/affordances.mjs";

/* D-620 (stated-null sweep, corrected at the c23-batch30 union): a stated null is told from a dropped key. */
import { statedJSON } from "./stated.mjs";
const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, carried by PL-4): an arm that throws on
   `.code` of undefined takes every arm behind it with it and reports one defect
   as none. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;

const HOST = "records.alamedacountyca.gov";
const VENDOR = `https://${HOST}/contracts/2026-0042-northbay-engineering.pdf`;
const SECOND = `https://${HOST}/contracts/2026-0043-northbay-engineering.pdf`;
const PLAIN = `https://${HOST}/contracts/2026-0044-unrelated.pdf`;
const LEGACY = `https://${HOST}/contracts/2026-0045-legacy-typed.pdf`;
/* PER-ADDRESS BYTES, and the first draft of this suite got it wrong in a way
   worth recording: one shared body made every capture CONTENT-ADDRESS TO THE
   SAME DIGEST, so a register row written for one document answered for all of
   them and block 5's three-state discrimination silently collapsed into two.
   The store was right and the fixture was lying to it. */
const bodyFor = (url) => {
  const seed = [...url].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 65536, 7);
  return new Uint8Array(4096).map((_, i) => (i * 17 + seed) % 256);
};

const SEEN = [];
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec202", MEMBER_TOKEN: "mem-rec202", PROBE_TOKEN: "prb-rec202",
              DAEMON_TOKEN: "dmn-rec202", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-rec202",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* Pinned far out of the window so only the hand-driven drain runs
                 and every assertion is deterministic (PL-4's trick). */
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService(request) {
    SEEN.push({ url: request.url });
    return new Response(bodyFor(request.url), { headers: { "content-type": "application/pdf" } });
  },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));

/* ---------------------------------------------------------------- fixture */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-rec202`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
/* A SECOND ADMINISTRATOR before any ordinary member: administrative access is
   shared so losing one person does not lose the group, and the roster refuses
   the second member otherwise. */
await member("gus", ["contribute"], "admin");
const CAROL = await member("carol", ["contribute", "create_projects"]);
const DAVE = await member("dave", ["contribute"]);

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

const inquiryMd = (id, question, type = "inquiry", schema = "inquiry@1") => ["---",
  `id: ${id}`, `object_type: ${type}`, `schema: ${schema}`,
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next contract cycle",
  "    description: The next award may restate the basis.",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); a
   creation's bytes carrying an `id:` line are refused PROJECT_ID_IN_BYTES, so the creation document has none. */
const projectMd = (title, cites) => ["---",
  "object_type: project", "schema: project@1",
  `title: "${title}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(cites), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", title, "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Prior contract file ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A document already in the store.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-25 at the c22-batch30 union (CONDUCT #22), never exempted: this item was cut before D-563, whose
   C-86.3 refuses an envelope title the held document contradicts (`Bundle <id>` / `Bundle <label>` against the
   document's own `title:`). The envelope now carries the document's OWN title, read from its front matter; its dates
   were already the document's own (NOW / LATER). */
const ownTitle = (text) => (/^title: "(.*)"$/m.exec(text) || [])[1];
const promote = async (id, text, type, state, tok = RUTH, register = []) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-${sha(text).slice(0, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: ownTitle(text) ?? `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: LATER } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

/* INQUIRY A — the question the run is working. INQUIRY B — the question the
   evidence turns out to bear on. Bob's own case: a run investigating whether
   ONE contract was competitively bid meets the same vendor holding others. */
const INQ_A = "INQ-2026-4100-was-0042-competitively-bid";
const INQ_B = "INQ-2026-4200-northbay-holds-how-many";
const INQ_C = "INQ-2026-4300-legacy-typed-question";
const INFO_OLD = "INFO-2026-4900-prior-contract-file";
const CAP_OLD = sha("rec202-prior-contract-capture");

await promote(INQ_A, inquiryMd(INQ_A, "Was the 0042 award competitively bid?"), "inquiry", "open");
await promote(INQ_B, inquiryMd(INQ_B, "How many contracts does Northbay hold?"), "inquiry", "open");
/* A LEGACY-TYPED question, for the over-strictness arm: `focus` is the retired
   spelling REC-10 normalises, and a lead naming one must be as legal as a
   canonical `inquiry`. A fence that refuses correct work in a spelling nobody
   anticipated is a defect in the fence. */
await promote(INQ_C, inquiryMd(INQ_C, "The legacy-typed question", "focus", "focus@1"), "focus", "open");
/* A document already in the store that a reading DOES carry — so block 5 can
   drive the `present` direction and prove the absence instrument has teeth. */
await promote(INFO_OLD, infoMd(INFO_OLD), "information", "collected", RUTH,
  [{ sha256: CAP_OLD, path: "snapshots/prior.pdf", encoding: "binary", bytes: 10 }]);

/* TWO PROJECTS, both real, both visible to carol and ruth. This is what makes
   block 4's assertion mean something: if there were only one project, filing
   under A's ancestors and filing under B's would produce the same answer and
   the spine arm would pass over a defect. */
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7) and a
   creation naming one is refused PROJECT_ID_SUPPLIED (C-59.1). The creation names no bundleId and the id
   is read from the answer; `label` keeps the title (and so the minted slug) distinct, as the chosen id did. */
const promoteProject = async (label, text) => {
  const r = await POST(`op=promote&token=${CAROL}`, {
    base: null, snapKey: `${label}-${sha(text).slice(0, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: ownTitle(text) ?? `Bundle ${label}`,
            current_state: "forming", created: NOW, last_updated: LATER } });
  if (!r || r.ok === false || !r.bundleId) throw new Error(`promote ${label}: ${JSON.stringify(r).slice(0, 600)}`);
  return r.bundleId;
};
const PROJ_A = await promoteProject("PROJ-2026-4100-contract-0042", projectMd("The 0042 award", [INQ_A]));
const PROJ_B = await promoteProject("PROJ-2026-4200-vendor-concentration",
  projectMd("Vendor concentration", [INQ_B, INFO_OLD]));

const RUN = "RUN-2026-0808-rec202";
/* CORRECTED 2026-08-09 BY PL-18, AND THE OLD FIXTURE IS SAID TO BE WRONG RATHER
   THAN EXEMPTED. Bob ruled (DEC-63) that starting an investigation is licensed
   by PARTICIPATION IN THE PROJECT the question belongs to, with `contribute`
   only the floor beneath it. This fixture had CAROL create both projects (so
   she is their owner and their only participant) and RUTH open the run over
   `INQ_A`, which `PROJ_A` draws on — and RUTH is in no project at all. Under
   the ruling that is now refused with C-22.8, and **the refusal is correct**:
   the suite was driving a member who, from today, may not start that run.

   The fix is to make the fixture LEGAL rather than to move the assertion, and
   it is done THROUGH THE ACTS — carol invites, ruth joins — because a
   participation row written by hand would prove nothing about whether a member
   can actually get one. Nothing about what this suite MEASURES changes: it is
   about out-of-inquiry leads, and ruth still drives every arm below. */
{
  const inv = await GET(`op=projectinvite&token=${CAROL}&projectId=${encodeURIComponent(PROJ_A)}&handle=ruth`);
  if (inv?.ok !== true) throw new Error(`projectinvite ruth -> PROJ_A: ${JSON.stringify(inv)}`);
  const joined = await GET(`op=projectjoin&token=${RUTH}&projectId=${encodeURIComponent(PROJ_A)}`);
  if (joined?.state !== "joined") throw new Error(`projectjoin ruth -> PROJ_A: ${JSON.stringify(joined)}`);
}
{
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ_A,
    label: "PL-15 fixture — the run that meets evidence for another question", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  if (r?.started !== true) throw new Error(`airunopen: ${JSON.stringify(r)}`);
}

const request = async (body, tok = RUTH) => POST(`op=capturerequest&token=${tok}`,
  { target: INQ_A, run: RUN, purpose: "investigate", ...body });
const drain = async () => await doStub.captureRequestDrain({ actor: "suite" });
const queueOf = async (tok) => GET(`op=queue&token=${tok}`);
const leadsIn = (q) => ((q && q.items) || []).filter((i) => i.kind === "out-of-inquiry-lead");
/* NULL-TOLERANT DEEP READ (PL-1's discipline, and this suite paid for it). When
   the mint REFUSES — which is exactly what the control harness arms — op=queue
   answers with no `items` at all, so every `leads[0].basis…` below throws a
   TypeError, the suite dies at block 3, and every arm behind it reports NOTHING.
   An arm whose "must not fail" clauses were never evaluated is an arm that
   proved less than it claimed. Measured on this harness's first full run: four
   arms were unjudgeable for this reason. */
const g = (o, path) => path.split(".").reduce((a, k) => (a === null || a === undefined ? null : a[k]), o);

const actOf = (lead, id) => ((lead && lead.inquiry_acts) || []).find((a) => a && a.id === id) || null;
const leadAt = async (tok, addr) => leadsIn(await queueOf(tok)).find((i) => g(i, "basis.address") === addr) || null;

/* ====================================================================== 1
 * AN UNREGISTERED CAPTURE: THE TAKE-UP DOOR IS CLOSED AND SAYS WHY.
 * ====================================================================== */
console.log("\n--- 1. before a document holds the bytes, there is nothing to take up, and the door says so ---");
let REQ = null;
{
  const r = await request({ address: VENDOR, lead_inquiry: INQ_B });
  t("fixture: the lead is requested", r.ok, true);
  REQ = r.request;
  const d = await drain();
  t("fixture: the drain captured it", d.captured.length, 1);
  const lead = await leadAt(CAROL, VENDOR);
  t("the lead surfaces", !!lead, true);
  const take = actOf(lead, "take_up");
  t("§1 TAKE UP IS PUBLISHED CLOSED over an unregistered capture, naming the basis entry's own reason — "
  + "an act the plane would refuse is not offered",
    [g(take, "available"), g(take, "op"), g(take, "reason"), g(take, "basis_entry_reason"), g(take, "document")],
    [false, "cite", "no_document_to_cite", "unregistered_capture", null]);
}

/* ====================================================================== 2
 * REGISTERED: BOTH DOORS OPEN, EACH WITH THE ARGUMENTS IT TAKES; NO GAP DECLARED.
 * ====================================================================== */
console.log("\n--- 2. once a document holds the bytes, both inquiry-grain doors are published ---");
const DOC_V = "INFO-2026-4901-northbay-0042-contract";
let LEAD = null;
{
  const rows = await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`);
  const row = rows.requests.find((x) => x.request === REQ);
  await promote(DOC_V, infoMd(DOC_V), "information", "collected", RUTH,
    [{ sha256: row.capture_sha, path: "snapshots/northbay-0042.pdf", encoding: "binary", bytes: 4096 }]);
  LEAD = await leadAt(CAROL, VENDOR);
  const take = actOf(LEAD, "take_up"), aside = actOf(LEAD, "set_aside");
  t("§2 TAKE UP IS PUBLISHED: op=cite into inquiry B over a selection of the registered document",
    [g(take, "available"), g(take, "op"), g(take, "project"), g(take, "inquiry"), g(take, "document"),
     g(take, "select.op"), g(take, "select.ids"), g(take, "requires")],
    [true, "cite", INQ_B, INQ_B, DOC_V, "select", [DOC_V], ["handle", "role"]]);
  t("§2 SET ASIDE IS PUBLISHED: op=proposedispose, scoped to the project, naming this finding and the "
  + "projects the member may act for, with the published disposition vocabulary",
    [g(aside, "available"), g(aside, "op"), g(aside, "scope"), g(aside, "finding"), g(aside, "projects"),
     g(aside, "dispositions")],
    [true, "proposedispose", "project", LEAD && LEAD.id, [PROJ_B], DISPOSITIONS]);
  t("§2 the set-aside door agrees with the item's own `disposition` block — one implementation, called, "
  + "never re-derived",
    [g(aside, "finding"), g(aside, "projects"), g(aside, "available")],
    [g(LEAD, "disposition.finding"), g(LEAD, "disposition.projects"), g(LEAD, "disposition.available")]);
  t("§2 NO DECLARED GAP REMAINS on the lead: options_grain names no missing grain and points at the two doors",
    [g(LEAD, "options_grain.offered"), g(LEAD, "options_grain.missing"), g(LEAD, "options_grain.inquiry")],
    ["document", null, ["take_up", "set_aside"]]);
  t("§2 and its sentence no longer says the acts do not exist",
    /do not exist/i.test(String(g(LEAD, "options_grain.detail") || "")), false);
}

/* ====================================================================== 3
 * TAKE UP, DRIVEN: THE DOCUMENT BECOMES A LEG OF INQUIRY B'S BASIS.
 * ====================================================================== */
console.log("\n--- 3. a member takes the lead up under inquiry B through the published door ---");
{
  const take = actOf(LEAD, "take_up");
  const sel = take && take.select
    ? await POST(`op=${take.select.op}&token=${CAROL}&kind=enumerated`, { ids: take.select.ids }) : null;
  const handle = sel && sel.handle;
  const cited = take && handle
    ? await GET(`op=${take.op}&token=${CAROL}&project=${encodeURIComponent(take.project)}`
              + `&handle=${encodeURIComponent(handle)}&role=supports&note=${encodeURIComponent("taken up from the lead")}`)
    : null;
  t("§3 THE PUBLISHED TAKE-UP DOOR COMPLETES: the cite into inquiry B is accepted",
    [!!handle, g(cited, "ok")], [true, true]);
  const after = await leadAt(CAROL, VENDOR);
  t("§3 and the lead's own basis entry now MEASURES the take-up: the document is carried by a reading",
    [g(after, "basis.basis_entry.state"), (g(after, "basis.basis_entry.basis_legs") || 0) > 0],
    ["present", true]);
}

/* ====================================================================== 4
 * SET ASIDE, DRIVEN: THE LEAD AGES OUT OF THAT TEAM'S OPEN LIST.
 * ====================================================================== */
console.log("\n--- 4. a member sets the lead aside for their team through the published door ---");
{
  const lead = await leadAt(CAROL, VENDOR);
  const aside = actOf(lead, "set_aside");
  const r = aside && aside.available
    ? await POST(`op=${aside.op}&token=${CAROL}`, { project: aside.projects[0], finding: aside.finding,
        to: "dismissed", reason: "taken up under the vendor question already" })
    : null;
  t("§4 THE PUBLISHED SET-ASIDE DOOR COMPLETES: recorded for that project and no other",
    [g(r, "ok"), g(r, "scope"), g(r, "project"), g(r, "finding")],
    [true, "project", PROJ_B, lead && lead.id]);
  const gone = await leadAt(CAROL, VENDOR);
  t("§4 and the lead has left the member's open list — aged, not deleted (D-79)", gone, null);
}

/* ====================================================================== 5
 * OVER-STRICTNESS: A MEMBER OF NO PROJECT.
 * ====================================================================== */
console.log("\n--- 5. a member of no project: take-up still offered, set-aside closed WITH its reason ---");
{
  const lead = await leadAt(DAVE, VENDOR);
  t("dave still receives the lead (a FINDING stands for every member)", !!lead, true);
  t("§5 his take-up door is open — the act, not the feed, judges his position",
    g(actOf(lead, "take_up"), "available"), true);
  t("§5 his set-aside door is published CLOSED with the reason the disposition block gives, never absent",
    [g(actOf(lead, "set_aside"), "available"), g(actOf(lead, "set_aside"), "reason"),
     g(lead, "disposition.reason")],
    [false, "no_project_scope", "no_project_scope"]);
}

console.log(`\n${fail === 0 ? "PASS" : "FAIL"}  rec202-lead-inquiry-acts: ${pass} passed, ${fail} failed`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
