/* NEGATIVE CONTROL: DECLARED AND RUN BY `test/d526-refusal-order.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs. Re-run from `bio-plane/`: `node test/d526-refusal-order.control.mjs [arm]`. One arm PER FENCE moves that fence alone back to the ENVELOPE's type (the row's control: read the envelope in one fence again and that arm's refusal differs, failing by name); each anchor asserted to occur EXACTLY ONCE; the real sources hashed before and after. RESULTS, RUN 2026-09-24 by D-526's worker on origin/main 8bdf20e6 + D-526 (real `src/store.mjs` 3,330,896 B sha256 aa19ecde..., `src/index.mjs` 839,694 B sha256 26c32ce1..., `checks/bio-checks.mjs` 957,718 B sha256 d30baa7c..., UNCHANGED before and after): 10/10 AS DECLARED, exit 0. (a) baseline 31/0 · (b) laws-envelope — THE ROW'S OWN ARM, D-149's carry-forward -> 28/3, failing BY NAME at section 1's MISLABELLED and UNLABELLED refusals and the UNLABELLED "nothing landed" · (c) surface-envelope (D-85) -> 28/3 at section 2's same three · (d) name-envelope (7.1) -> 29/2 at section 4's MISLABELLED and UNLABELLED · (e) capable-envelope (control plane, `create_projects`) -> 28/3 at section 3's two refusals and the unlabelled project's OWNER · (f) owner-envelope (the owner row) -> 30/1 at the owner · (g) restamp-envelope (control plane, D-78) -> 30/1 at section 5's UNLABELLED · (h) bias-envelope (C-26) -> 29/2 at section 6's UNLABELLED pair · (i) spelling — OVER-STRICTNESS, the derivation written another way -> 31/0 · (j) refuse-unlabelled — OVER-STRICTNESS, D-510's refusal treating a type-less envelope as a disagreement -> 26/5, the arms that must LAND unlabelled. RECORDED, NOT SMOOTHED: arm (e) first came back NOT AS DECLARED at 28/3 — its declaration named section 3's "no project of that id exists", which stayed GREEN because the STORE, still reading the document, refuses the supplied id PROJECT_ID_SUPPLIED (REC-141): an absence another fence produces. The DECLARATION was corrected, with the reason at the arm, and section 3 says so at the assertion. BASELINE ON THE UNFIXED SOURCES (origin/main 8bdf20e6, a detached worktree): 15 pass / 16 fail — every MISLABELLED arm met another name (ENVELOPE_TYPE_DISAGREES or MALFORMED) and five UNLABELLED promotions LANDED. */
/* D-526 — WHICH REFUSAL A CALLER MEETS ON `op=promote` NO LONGER DEPENDS ON THE ENVELOPE.
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` IS the impact substrate), with C-2.5 (a document's type
 * is the catalogue's `normalizeType` of what it says) and D-510's derivation (the record goes by the DOCUMENT's own
 * `object_type`; an envelope that contradicts it is refused ENVELOPE_TYPE_DISAGREES, C-86.1).
 *
 * THE DEFECT, measured at the code on origin/main 8bdf20e6 before this item: D-510 parsed `bundle.md` BELOW the
 * fences, so every fence above it — and three on the control plane — still asked the CALLER'S envelope what the
 * promotion was. Two consequences, and the row named only the first:
 *   (a) WHICH REFUSAL. An action mislabelled `information` met ENVELOPE_TYPE_DISAGREES where the same action
 *       correctly labelled met GOVERNING_LAWS_REWRITTEN (and so for NAME_TAKEN, NOT_CAPABLE, SURFACE_NO_RUN).
 *   (b) NO REFUSAL AT ALL. D-510's refusal needs BOTH sides to state a type; an envelope stating NONE is legal and
 *       takes the document's type (d510-promoted-type §4). So with no envelope type every envelope-keyed fence was
 *       SKIPPED and the promotion LANDED, typed by the document: an action creation filling in its own governing
 *       laws (D-149's "liar's pass"), a machine credential opening a question outside any run (D-85), a project
 *       created by a member without `create_projects` and owned by nobody (section 5 / 7.1), a question whose
 *       `surfaced_by` the caller wrote (D-78), and a malformed bias set (C-26). This suite drives each.
 *
 * THE FIX: the promoted type is derived ONCE, at the top of `promote` (store) and of the promote block (control
 * plane), from the bytes the caller sent — the document's type through `normalizeType`, the envelope only where the
 * document states none — and every fence reads that one value. `#projectRow`'s action columns ask
 * `normalizeType(fm.object_type) === "action"` rather than the raw key (behaviourally identical today: no legacy
 * alias names `action`; stated, not driven).
 *
 * THE SHAPE OF EVERY ARM: one document, three envelopes — the type it names (LABELLED), `information`
 * (MISLABELLED) and no type at all (UNLABELLED) — and the refusal each meets must be THE SAME.
 *
 * WHAT THIS SUITE CANNOT SEE: REC-181's `CITED` retirement arm reads `promotedType` only for a CREATION (a revision
 * asks the held row's type), and a creation cannot be cited before it exists, so that arm is not reachable by a
 * caller and is not driven here. The migration-replay admission (REC-173) is keyed on the derived type too; it
 * needs a verified drive-provenance capture to reach, and is not driven here.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.D526_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NL = "\n", NOW = "2026-07-24T00:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d526", MEMBER_TOKEN: "mem-d526", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const get = async (qs, token = "adm-d526") =>
  rP(await (await mf.dispatchFetch(`http://x/api/?token=${token}&${qs}`)).json());
const post = async (op, body, token) =>
  rP(await (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json());

const HEAD = (id, type, schema, title, state) => [
  "---", ...(id ? [`id: ${id}`] : []), `object_type: ${type}`, `schema: ${schema}`,
  `title: "${title}"`, `current_state: ${state}`, "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []"];

/* An action with NO basis or correspondence (nothing for another fence to refuse), and optionally a governing-laws
   list the caller filled in itself — which only `op=actionlaws` may set (D-149, C-73.1). */
const actionMd = (id, { laws = false } = {}) => [
  ...HEAD(id, "action", "action@1", "Records request", "planned"),
  "action_kind: cpra_request", "risk_tier: undetermined",
  ...(laws ? ["governing_laws:", '  - citation: "Cal. Gov. Code 7920.000"', "    level: state"] : []),
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", ""].join(NL);

const inquiryMd = (id, { surfacedBy = null } = {}) => [
  ...HEAD(id, "inquiry", "inquiry@1", "Where did it go", "open"),
  ...(surfacedBy ? [`surfaced_by: ${surfacedBy}`] : []),
  "---", "", "## Question", "", "Where did the sewer transfer go?", "", "## Session Log", ""].join(NL);

/* A project with NO id line: the plane mints it (REC-141). */
const projectMd = (title) => ["---", "object_type: project", `title: "${title}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${NOW}"`, "references: []", "---", "",
  "## Thesis Summary", "", "A project.", "", "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join(NL);

/* A bias set whose one statement issues a VERDICT (C-26.5, bias.test.mjs ARM M's own sentence). */
const badBiasMd = (id) => [
  ...HEAD(id, "bias", "bias@1", "House lens", "draft"),
  "statements:", "  - id: b1", "    kind: scrutiny", '    subject: "ENT-2026-0007"',
  '    text: "The council president is a liar and nothing from that office is true."',
  '    justification: "Because we say so."', "    citations: []", "    locked: false",
  "---", "", "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at a members' meeting.", "",
  "## What This Does Not Enforce", "", "Nothing here is enforced by the machine.", "",
  "## Session Log", "", "## Review Notes", ""].join(NL);

let seq = 0;
/* `metaType` undefined sends an envelope stating NO type. */
const promote = async ({ id, text, metaType, title = "Records request", state = "planned", token }) => {
  const meta = { group: "believe-in-oakland", title, current_state: state, created: NOW, last_updated: NOW };
  if (metaType !== undefined) meta.object_type = metaType;
  return post("promote", {
    ...(id ? { bundleId: id } : {}), base: null,
    snapKey: `20260724T0400${String(++seq).padStart(2, "0")}Z_d526`, author: "x", meta,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] }, token);
};
const landed = async (id) => (await get(`op=projection&id=${encodeURIComponent(id)}`))?.bundle_id ?? null;
const ENVELOPES = [["LABELLED", null], ["MISLABELLED", "information"], ["UNLABELLED", undefined]];
const reasonOf = (r) => r?.ok === true ? "LANDED" : (r?.reason ?? JSON.stringify(r).slice(0, 120));

try {

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-d526");
  const en = await post("enroll", { invite: add && add.invite, handle: id, password: `${id}-passphrase-526` });
  if (!en || en.ok !== true) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-526` });
  if (!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Two administrators first (ADMINS_FIRST), then the two members the arms need. */
const RUTH = await member("ruth", ["contribute", "create_projects"], "admin");
await member("sam", ["contribute"], "admin");
const OTTO = await member("otto", ["contribute"]);   /* holds NO create_projects */

/* ============================================= 1. D-149's carry-forward (GOVERNING_LAWS_REWRITTEN) */
console.log("\n--- 1. an action creation that fills in its own governing laws meets GOVERNING_LAWS_REWRITTEN, however labelled ---");
for (const [label, env] of ENVELOPES) {
  const id = `ACTN-2026-0526-laws-${label.toLowerCase()}`;
  const r = await promote({ id, text: actionMd(id, { laws: true }), metaType: env === null ? "action" : env, token: RUTH });
  t(`${label}: refused GOVERNING_LAWS_REWRITTEN`, reasonOf(r), "GOVERNING_LAWS_REWRITTEN");
  t(`${label}: …and nothing landed`, await landed(id), null);
}
{
  /* OVER-STRICTNESS: the same action stating no laws LANDS under every envelope that is not a contradiction. */
  for (const [label, env] of [["LABELLED", "action"], ["UNLABELLED", undefined]]) {
    const id = `ACTN-2026-0526-nolaws-${label.toLowerCase()}`;
    const r = await promote({ id, text: actionMd(id), metaType: env, token: RUTH });
    t(`OVER-STRICTNESS ${label}: an action stating no laws LANDS, typed action`,
      [reasonOf(r), (await get(`op=projection&id=${id}`))?.object_type], ["LANDED", "action"]);
  }
}

/* ============================================= 2. D-85's surfacing gate (SURFACE_NO_RUN) */
console.log("\n--- 2. a machine credential opening a question outside any run meets SURFACE_NO_RUN, however labelled ---");
for (const [label, env] of ENVELOPES) {
  const id = `INQ-2026-0526-surface-${label.toLowerCase()}`;
  const r = await promote({ id, text: inquiryMd(id), metaType: env === null ? "inquiry" : env, state: "open",
                            title: "Where did it go", token: "mem-d526" });
  t(`${label}: refused SURFACE_NO_RUN`, reasonOf(r), "SURFACE_NO_RUN");
  t(`${label}: …and nothing landed`, await landed(id), null);
}

/* ============================================= 3. section 5's create_projects (NOT_CAPABLE) */
console.log("\n--- 3. a member without create_projects meets NOT_CAPABLE creating a project, however labelled ---");
for (const [label, env] of ENVELOPES) {
  /* UNLABELLED names a NON-project id: with no envelope type and no PROJ- prefix, nothing on either plane asked
     whether this was a project creation at all. */
  const r = await promote({ id: label === "UNLABELLED" ? "INFO-2026-0526-not-a-project" : undefined,
                            text: projectMd(`Otto's project ${label}`), metaType: env === null ? "project" : env,
                            title: `Otto's project ${label}`, state: "forming", token: OTTO });
  t(`${label}: refused NOT_CAPABLE`, reasonOf(r), "NOT_CAPABLE");
}
/* An absence that TWO fences produce since D-526 (NOT_CAPABLE on the control plane, and REC-141's
   PROJECT_ID_SUPPLIED in the store, which now also sees a project): it is the headline outcome — before D-526 this
   project LANDED — and not evidence about either fence alone (the control's `capable-envelope` arm measured that). */
t("UNLABELLED: …and no project of that id exists", await landed("INFO-2026-0526-not-a-project"), null);

/* ============================================= 4. 7.1's name scan (NAME_TAKEN) */
console.log("\n--- 4. a second project by a taken name meets NAME_TAKEN, however labelled ---");
{
  const first = await promote({ text: projectMd("Sewer Fund"), metaType: "project", title: "Sewer Fund",
                                state: "forming", token: RUTH });
  if (first?.ok !== true) throw new Error(`fixture project: ${JSON.stringify(first).slice(0, 300)}`);
  for (const [label, env] of ENVELOPES) {
    const r = await promote({ text: projectMd("sewer  FUND"), metaType: env === null ? "project" : env,
                              title: "sewer  FUND", state: "forming", token: RUTH });
    t(`${label}: refused NAME_TAKEN`, reasonOf(r), "NAME_TAKEN");
  }
  /* OVER-STRICTNESS: a FREE name lands, unlabelled — minted, owned by its creator, typed project. */
  const free = await promote({ text: projectMd("Storm Drains"), title: "Storm Drains", state: "forming", token: RUTH });
  const fp = free?.bundleId ? await get(`op=projection&id=${encodeURIComponent(free.bundleId)}`) : null;
  t("OVER-STRICTNESS UNLABELLED: a project by a free name LANDS, its id minted by the plane, typed project",
    [reasonOf(free), /^PROJ-/.test(free?.bundleId ?? ""), fp?.object_type], ["LANDED", true, "project"]);
  /* ...and OWNED by the member who created it (7.1): the owner row was written only for an envelope saying
     `project`, so an unlabelled creation that landed was a project nobody owns. */
  const parts = free?.bundleId ? await get(`op=projectparticipants&projectId=${encodeURIComponent(free.bundleId)}`, RUTH) : null;
  t("UNLABELLED: …and its creator is its one participant and its OWNER",
    (parts?.participants ?? []).map((q) => [q.handle ?? q.member_id, q.owner]), [["ruth", 1]]);
}

/* ============================================= 5. D-78's restamp (surfaced_by is the server's word) */
console.log("\n--- 5. a member's question records surfaced_by: human, whatever its bytes claimed, however labelled ---");
for (const [label, env] of [["LABELLED", "inquiry"], ["UNLABELLED", undefined]]) {
  const id = `INQ-2026-0526-stamp-${label.toLowerCase()}`;
  const r = await promote({ id, text: inquiryMd(id, { surfacedBy: "agent" }), metaType: env, state: "open",
                            title: "Where did it go", token: RUTH });
  const p = await get(`op=projection&id=${encodeURIComponent(id)}`);
  t(`${label}: LANDS with surfaced_by restamped to the actor class, not the caller's "agent"`,
    [reasonOf(r), p?.fm_json ? JSON.parse(p.fm_json).surfaced_by : null], ["LANDED", "human"]);
}

/* ============================================= 6. C-26's bias gate (BIAS_REFUSED) */
console.log("\n--- 6. a malformed bias set meets BIAS_REFUSED, however labelled ---");
for (const [label, env] of ENVELOPES) {
  const id = `BIAS-2026-0526-${label.toLowerCase()}`;
  const r = await promote({ id, text: badBiasMd(id), metaType: env === null ? "bias" : env, state: "draft",
                            title: "House lens", token: RUTH });
  /* MISLABELLED meets D-510's refusal, which runs ahead of the bias gate: the bias gate is BELOW the parse and
     always was, so its order was never the envelope's — what the envelope decided was whether it RAN at all. */
  t(`${label}: refused ${label === "MISLABELLED" ? "ENVELOPE_TYPE_DISAGREES" : "BIAS_REFUSED"}`,
    reasonOf(r), label === "MISLABELLED" ? "ENVELOPE_TYPE_DISAGREES" : "BIAS_REFUSED");
  t(`${label}: …and nothing landed`, await landed(id), null);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nd526-refusal-order: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
