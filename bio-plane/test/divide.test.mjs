/* NEGATIVE CONTROL: (REC-16's two, each broken ALONE and restored) (a) THE SIBLING SET IS NOT CHECKED — in src/store.mjs promote(), guard the resolved arm with `if (false)` (the block computing `missing`/`invented` against the parent's division.into) AND in checks/bio-checks.mjs make divisionDisclosureFindings return immediately (`export function divisionDisclosureFindings(fm, findings) { return;`) -> the child that omits a sibling LANDS, is CONCLUDED and PUBLISHES, and the assertions "a child that omits a sibling is REFUSED", "a child that names a question this division did not produce is refused", "a child carrying division_parent with no supersedes edge is refused" and the published-bytes disclosure all fail. Both halves must go together: breaking one alone leaves the other refusing (REC-13's finding, repeated). (b) THE SUPERSEDES REQUIREMENT IS REMOVED — in checks/bio-checks.mjs make supersedesEdgeFindings return immediately AND in src/store.mjs promote() guard the resolve loop (`for (const r of ... rel === "supersedes")`) with `if (false)` -> an inquiry supersedes with NO REASON and an UNRESOLVABLE TARGET and both land, and the two assertions naming SUPERSESSION_REFUSED fail. Restore after each. Both RUN 2026-08-04 — the measured results are in the header below. */
/* REC-16: `divided` and op=inquirydivide — supersession gets its first producer.
 *
 * WHY THIS ACT EXISTS, because it reads like housekeeping and is not. Weakest-link
 * composition means an inquiry mixing one well-supported claim with one thin one
 * is worth exactly the thin one. Without division a member's only options are to
 * OVERCLAIM or to STAY SILENT. Division is the honest third move.
 *
 * AND THE ABUSE IS THE SAME MECHANISM (R4), which is why this suite spends more
 * of itself on the DISCLOSURE than on the act. Dividing would otherwise be a
 * cheaper way to shed a finding that CUTS AGAINST you than severing it: move the
 * inconvenient leg onto a child nobody publishes, and the published half looks
 * stronger with nothing on the record saying what happened. So:
 *
 *   1. THE ACT AND WHAT IT REFUSES. A named member divides; the reason, the
 *      children's questions and the apportionment are all AUTHORED and nothing
 *      is derived, defaulted or proposed. Every refusal fires BEFORE anything
 *      moves, and the parent is still exactly concluded after each.
 *   2. NO LEG MAY BE DROPPED. Every leg of the parent's basis lands on at least
 *      one child, INCLUDING the leg that cuts against the case, and the refusal
 *      names the orphans and counts the cutting ones. A leg may land on one
 *      child or on BOTH; what it may not do is land nowhere.
 *   3. THE PARENT IS TERMINAL and RECORDS WHERE EVERY LEG WENT — in the
 *      frontmatter the gates read and in the body a person reads.
 *   4. EACH CHILD NAMES ITS PARENT AND EVERY SIBLING, and carries a supersedes
 *      edge back with a REASON. Before this item `supersedes` had ZERO
 *      occurrences in store.mjs and no producer: membership of REL_VOCAB meant
 *      only that C-6.1 would not refuse the string. It arrives here WITH its
 *      requirements, the way every state in the inquiry machine has arrived with
 *      its entry requirements.
 *   5. THE DISCLOSURE IS ENFORCED IN BOTH DIRECTIONS AND AT BOTH LAYERS. A child
 *      that omits a sibling is refused AT THE WRITE against the parent's own
 *      division.into (only the store can see that), and a document that is
 *      incoherent on its face is refused by the CATALOG (only that can be
 *      checked without a store). Neither layer alone is enough and the negative
 *      controls above break each.
 *   6. PUBLISHED_CANNOT_DIVIDE. DEC-12 changed publishing; it did not change
 *      this. An EDITION says the case continues; a DIVISION says the parent was
 *      malformed, and a hash somebody relied on cannot be retroactively declared
 *      malformed.
 *   7. DEC-29(b) AS AN ACCEPTANCE CLAUSE. The divide prompt's wording must STATE
 *      the disclosure the division will make, and it is asserted here as a
 *      string, clause by clause, because a prompt that omitted it would be
 *      offering an act whose visible effect is a higher publishable strength
 *      while saying nothing about what stays on the record.
 *   8. DEC-30 AND DEC-28. Author-scoped (any contribute holder, act attributed),
 *      and `divided` is a STATE — `disposition_reason` is untouched and the
 *      reason belongs to the act.
 *
 * NEGATIVE CONTROLS RUN 2026-08-04 (rec16-agent), each alone and restored; the
 * header line above is the re-run recipe. What each one MEASURED is recorded on
 * the line itself after the run.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, STATES, parseFrontmatter } from "../checks/bio-checks.mjs";
import { DIVIDE_PROMPT, ACTS } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec16", MEMBER_TOKEN: "mem-rec16", PROBE_TOKEN: "prb-rec16", VERSION: "test" },
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

/* THE op under test, driven through the CONTROL PLANE — a real caller's only
   route, and the literal `op=inquirydivide` uninterpolated so coverage credits
   it there (D-43: op=invitelook shipped with a ReferenceError while 1276
   store-level assertions passed). */
const divide = async (tok, { target, ...body }) =>
  rP(await POST(`op=inquirydivide&token=${tok}&target=${encodeURIComponent(target ?? "")}`, body));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`, body));
const affordances = async (target, tok = "mem-rec16") =>
  rP(await GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`));
const actIds = (r) => (r?.acts ?? []).map((a) => a.id).sort();
const imageOf = async (id) => (await GET(`op=image&token=mem-rec16&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];
const listRow = async (id) => ((await GET("op=list&token=mem-rec16")).result || []).find((b) => b.bundle_id === id);
const stateOf = async (id) => (await listRow(id))?.current_state;
const shaOf = async (id) => (await listRow(id))?.bundle_sha;
const fmOf = async (id) => parseFrontmatter(await imageOf(id)).data || {};
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};

/* ---- roster. DEC-30's author-scoping is exercised by DIVIDING AS A MEMBER WHO
   HOLDS ONLY `contribute` — not as an owner and not as a publisher — because
   the whole ruling is that de-escalation must not need permission from someone
   whose incentive may run the other way. ---- */
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec16", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const PILAR = await enrol("pilar", "pilar-passphrase-1", "admin", ["contribute", "publish"]);
await enrol("omar", "omar-passphrase-1", "admin", ["contribute", "publish"]);
const ROSA = await enrol("rosa", "rosa-passphrase-1", "member", ["contribute"]);

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (refs) => refs.length
  ? ["references:", ...refs.flatMap((r) => typeof r === "string"
      ? [`  - target: ${r}`, "    rel: cites", "    status: confirmed"]
      : [`  - target: ${r.target}`, `    rel: ${r.rel}`, "    status: confirmed",
         ...(r.reason !== undefined ? [`    reason: "${r.reason}"`] : [])])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], extra = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...extra,
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, md, type, state, tok = PILAR, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  }));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};
/* Re-promote a bundle from its CURRENT bytes with one edit applied — how a
   hand-edited document reaches the write path, which is the only route a
   disclosure defect has once the act itself is correct. */
const repromote = async (id, edit, tok = PILAR) => {
  const md = edit(await imageOf(id));
  return await promote(id, md, "inquiry", parseFrontmatter(md).data.current_state, tok, await shaOf(id));
};

const AUTH = "INFO-2026-1600-authority-memo";
const SIGNED = "INFO-2026-1600-signature-page";
const AGAINST = "INFO-2026-1600-controller-letter";
const PARENT = "INQ-2026-1600-mixed";
const KID_A = "INQ-2026-1600-authority";
const KID_B = "INQ-2026-1600-signature";

await mustPromote(AUTH, infoMd(AUTH), "information", "collected");
await mustPromote(SIGNED, infoMd(SIGNED), "information", "collected");
await mustPromote(AGAINST, infoMd(AGAINST), "information", "collected");

/* THE PARENT is the mixed question the whole construct is about: one leg that
   supports it well, one that supports it thinly, and one that CUTS AGAINST it.
   The third is not decoration — it is the leg R4's abuse would quietly re-home
   onto a child nobody publishes, so every assertion about the apportionment
   below is really an assertion about that leg. */
const PARENT_LEGS = [{ target: AUTH, role: "supports" },
                     { target: SIGNED, role: "supports" },
                     { target: AGAINST, role: "cuts_against" }];
await mustPromote(PARENT, inquiryMd(PARENT, {
  question: "Was the sewer transfer authorised, and did anyone with authority sign it?",
  refs: [AUTH, SIGNED, AGAINST], legs: PARENT_LEGS }), "inquiry", "open");

const WHY = "This was two questions: whether the transfer was authorised at all, and who signed it. "
          + "The answer to the first does not settle the second, and mixing them held both down.";
const Q_A = "Was the FY2024 sewer fund transfer authorised?";
const Q_B = "Did anyone with delegated authority sign the transfer memo?";
/* The cutting leg (ord 2) goes to BOTH children, which R4 permits and which is
   the honest apportionment here: the controller's letter bears on authority and
   on signature alike. */
const SPLIT = [{ id: KID_A, question: Q_A, legs: [0, 2] },
               { id: KID_B, question: Q_B, legs: [1, 2] }];

await conclude(PILAR, { target: PARENT,
  conclusion: "The transfer rests on a memo nobody adopted, and the signature question is unresolved.",
  falsifier: "An adopted resolution naming the transfer, or a signature page with a delegation on it." });

/* ================================================== 1. the act and its refusals */
console.log("\n--- 1. op=inquirydivide: a named member divides, and every refusal fires BEFORE anything moves ---");
{
  const base = { target: PARENT, reason: WHY, children: SPLIT };
  t("a machine credential cannot divide: deciding the group's own question was malformed is a member's judgement",
    (await divide("mem-rec16", base)).reason, "MACHINE_CANNOT_DIVIDE");
  t("no reason is refused BY NAME — one authored reason covers the whole division (DEC-29) and none covers nothing",
    (await divide(ROSA, { ...base, reason: "" })).reason, "NO_REASON");
  t("ONE child is refused: a division produces at least two questions, because one is a rename",
    (await divide(ROSA, { ...base, children: [SPLIT[0]] })).reason, "TOO_FEW_CHILDREN");
  t("a child with no question of its own is refused: the claim a division makes is that these are two DIFFERENT questions",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], question: "" }, SPLIT[1]] })).reason,
    "NO_CHILD_QUESTION");
  t("a child id that is not canonical is refused",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], id: "kid-a" }, SPLIT[1]] })).reason, "BAD_CHILD_ID");
  t("a child id that is an INFORMATION id is refused: a division produces QUESTIONS",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], id: AUTH }, SPLIT[1]] })).reason, "BAD_CHILD_ID");
  t("re-using an id that already names a bundle is refused: a division CREATES its children",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], id: PARENT }, SPLIT[1]] })).reason, "BAD_CHILD_ID");
  t("a child apportioned NO leg is refused: a child that inherits nothing is a new question, not a half of this one",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], legs: [0, 1, 2] }, { ...SPLIT[1], legs: [] }] })).reason,
    "NO_APPORTIONMENT");
  t("an ordinal that names no leg is refused: legs are apportioned by ORDINAL, because one document legitimately carries two legs (D4)",
    (await divide(ROSA, { ...base, children: [{ ...SPLIT[0], legs: [0] }, { ...SPLIT[1], legs: [9] }] })).reason,
    "BAD_APPORTIONMENT");

  /* THE HEADLINE REFUSAL. Leave the leg that CUTS AGAINST the case with no home
     and the act refuses, names the orphan, and counts the cutting ones — which
     is the whole of what stops division doing severance's work at a discount. */
  const shed = await divide(ROSA, { ...base,
    children: [{ ...SPLIT[0], legs: [0] }, { ...SPLIT[1], legs: [1] }] });
  t("DROPPING THE LEG THAT CUTS AGAINST THE CASE is refused NO_APPORTIONMENT, naming it and counting it",
    [shed.ok, shed.reason, shed.orphans, shed.cuts_against_orphans],
    [false, "NO_APPORTIONMENT", [{ ord: 2, target: AGAINST, role: "cuts_against" }], 1]);
  t("and the refusal SAYS what the honest alternative is: severance is the act that removes material",
    shed.detail.includes("sever them with a reason"), true);
  t("after every refusal the parent is still exactly concluded, and no child exists",
    [await stateOf(PARENT), await stateOf(KID_A), await stateOf(KID_B)],
    ["concluded", undefined, undefined]);
}

/* ======================================================== 2. the division itself */
console.log("\n--- 2. the division: a CONTRIBUTE-only member divides (DEC-30), and the parent goes terminal ---");
const done = await divide(ROSA, { target: PARENT, reason: WHY, children: SPLIT });
{
  t("a member holding ONLY `contribute` divides — author-scoped, settled (DEC-30): de-escalation needs no owner's leave",
    [done.ok, done.to, done.terminal, done.apportioned_by], [true, "divided", true, "rosa"]);
  t("the parent's projected state moved to divided", await stateOf(PARENT), "divided");
  t("both children exist and are OPEN, carrying their own authored questions",
    [await stateOf(KID_A), await stateOf(KID_B),
     (await fmOf(KID_A)).title, (await fmOf(KID_B)).title],
    ["open", "open", Q_A, Q_B]);
  t("the act reports where EVERY leg went, including the one that cuts against the case",
    done.apportionment,
    [{ ord: 0, target: AUTH, role: "supports", to: [KID_A] },
     { ord: 1, target: SIGNED, role: "supports", to: [KID_B] },
     { ord: 2, target: AGAINST, role: "cuts_against", to: [KID_A, KID_B] }]);
  t("a leg landing on BOTH children is recorded on both — R4 permits it, and it is not a way to lose one",
    done.cuts_against, 1);
}

console.log("\n--- 3. the PARENT records where every leg went, in the frontmatter AND in the body ---");
{
  const fm = await fmOf(PARENT);
  const md = await imageOf(PARENT);
  t("the division block is in the bytes with the reason, the server-stamped apportioner, the time and the children",
    [fm.division.reason, fm.division.apportioned_by, /^\d{4}-\d{2}-\d{2}T/.test(fm.division.at), fm.division.into],
    [WHY, "rosa", true, [KID_A, KID_B]]);
  t("the apportionment names every leg by ORDINAL with its role and its home — three legs, four placements",
    fm.division_apportionment.map((r) => [r.ord, r.target, r.role, r.to]),
    [[0, AUTH, "supports", KID_A], [1, SIGNED, "supports", KID_B],
     [2, AGAINST, "cuts_against", KID_A], [2, AGAINST, "cuts_against", KID_B]]);
  t("DEC-28: the reason belongs to the ACT and `disposition_reason` is UNTOUCHED — one field, one grammar",
    [fm.disposition_reason, fm.state_history[fm.state_history.length - 1].to_state,
     fm.state_history[fm.state_history.length - 1].blurb,
     fm.state_history[fm.state_history.length - 1].author],
    ["", "divided", WHY, "rosa"]);
  t("the account is in the BODY for a person to read, naming the cutting leg AS cutting",
    [md.includes("Where every leg went:"), md.includes(`${AGAINST} (cuts against) -> ${KID_A}, ${KID_B}`)],
    [true, true]);
  t("the parent's own conclusion is NOT unsaid: a division says the question was two questions, not that the answer was wrong",
    md.includes("The transfer rests on a memo nobody adopted"), true);
  t("the act is ATTRIBUTED in the Session Log as well as the history (DEC-30)",
    md.includes(`### Session ${done.at} | Divided | rosa`), true);
  t("the divided parent AUDITS CLEAN against the catalog", await errorsOf(PARENT, md), []);
}

console.log("\n--- 4. TERMINAL: the catalog's edge table says so, and every act agrees ---");
{
  t("`divided` is legal and its edge list is EMPTY — terminal in the ONE exported table, nothing here keeps a copy",
    [STATES.inquiry.legal.includes("divided"), STATES.inquiry.edges.divided,
     STATES.inquiry.edges.concluded.includes("divided"), STATES.inquiry.edges.open.includes("divided"),
     STATES.inquiry.edges.published.includes("divided")],
    [true, [], true, true, false]);
  t("dividing a divided parent again is refused ILLEGAL_TRANSITION",
    (await divide(ROSA, { target: PARENT, reason: WHY,
      children: [{ id: "INQ-2026-1600-third", question: "A third?", legs: [0] },
                 { id: "INQ-2026-1600-fourth", question: "A fourth?", legs: [1, 2] }] })).reason,
    "ILLEGAL_TRANSITION");
  t("concluding it again is refused too — its legs are owned by its children now",
    (await conclude(PILAR, { target: PARENT, conclusion: "x", falsifier: "y" })).reason, "ILLEGAL_TRANSITION");
  t("op=affordances publishes NO acts for it, and the empty list is honest because the store refuses each by name",
    actIds(await affordances(PARENT)), []);
}

/* =============================================== 5. the CHILDREN and the disclosure */
console.log("\n--- 5. each child names its PARENT and EVERY SIBLING, and supersedes with a reason ---");
{
  for (const [id, sib, q, legs] of [[KID_A, KID_B, Q_A, [AUTH, AGAINST]], [KID_B, KID_A, Q_B, [SIGNED, AGAINST]]]) {
    const fm = await fmOf(id);
    const md = await imageOf(id);
    t(`${id} names its parent and every sibling in the keys REC-14 reserved`,
      [fm.division_parent, fm.division_siblings], [PARENT, [sib]]);
    const sup = (fm.references || []).find((r) => r.rel === "supersedes");
    t(`${id} carries a supersedes edge back to the parent WITH ITS REASON`,
      [sup.target, sup.status, sup.reason], [PARENT, "confirmed", WHY]);
    t(`${id} carries exactly its apportioned legs, and every leg target is in references[]`,
      [fm.basis.map((l) => l.target),
       fm.basis.every((l) => (fm.references || []).some((r) => r.target === l.target))],
      [legs, true]);
    t(`${id} inherits NOTHING it did not earn: no conclusion, no falsifier, an empty history`,
      [fm.conclusion, fm.falsifier, fm.state_history, fm.current_state, fm.prior_state],
      ["", "", [], "open", null]);
    t(`${id} states the disclosure in the BODY too, where a person reads it`,
      [md.includes(`Divided out of ${PARENT}`), md.includes(`stays on the record: ${sib}`)], [true, true]);
    t(`${id} AUDITS CLEAN against the catalog`, await errorsOf(id, md), []);
  }
  /* The supersedes edge reaches `refs` through the projection that ALREADY
     exists — decision D5's whole point: no division table, and REC-17's
     re-evaluation obligation is one lookup on an edge nobody had to invent a
     home for. */
  const back = rP(await GET(`op=backlinks&token=mem-rec16&target=${PARENT}`));
  t("the supersedes edges are PROJECTED into refs by the existing path — no new table (D5), and REC-17's lookup exists",
    (back.backlinks || []).filter((r) => r.rel === "supersedes").map((r) => r.from).sort(),
    [KID_A, KID_B]);
}

console.log("\n--- 6. NO_SIBLING_DISCLOSURE: the sibling set is checked against the PARENT's own division.into ---");
{
  /* Only the store can answer this: the child alone cannot know how many
     siblings its division produced. This is the half the first negative control
     removes. */
  const omitted = await repromote(KID_A, (md) => md.replace(/^division_siblings: .*$/m, "division_siblings: []"));
  t("a child that omits a sibling is REFUSED at the write, naming the sibling it left out",
    [omitted.ok, omitted.reason, omitted.findings ? "shape" : omitted.missing],
    [false, "NO_SIBLING_DISCLOSURE", "shape"]);
  t("and the refusal SAYS why: a reader who can see one half must be able to see that the other half exists",
    JSON.stringify(omitted).includes("the other half EXISTS")
      || omitted.findings.some((f) => f.detail.includes("at least one sibling to name")), true);
  const invented = await repromote(KID_A,
    (md) => md.replace(/^division_siblings: .*$/m, `division_siblings: [${KID_B}, INQ-2026-1600-ghost]`));
  t("a child naming a question this division did NOT produce is refused too — the disclosure is exact, not decorative",
    [invented.ok, invented.reason, invented.not_siblings], [false, "NO_SIBLING_DISCLOSURE", ["INQ-2026-1600-ghost"]]);
  const noEdge = await repromote(KID_A, (md) => md.replace("    rel: supersedes", "    rel: relates_to"));
  t("a child carrying division_parent with NO supersedes edge is refused: the disclosure and the edge cannot disagree",
    [noEdge.ok, noEdge.reason], [false, "NO_SIBLING_DISCLOSURE"]);
  t("after all three refusals the child is untouched and still names its sibling",
    (await fmOf(KID_A)).division_siblings, [KID_B]);

  /* THE CATALOG's half, which needs no store: a document incoherent on its face. */
  const md = await imageOf(KID_A);
  t("the CATALOG names C-6.1 on a child that declares a parent and no siblings — the layer that works without a store",
    (await errorsOf(KID_A, md.replace(/^division_siblings: .*$/m, "division_siblings: []")))
      .filter((e) => e.startsWith("C-6.1")).length, 1);
  t("and on a child that carries a supersedes edge while declaring no division at all",
    (await errorsOf(KID_A, md.replace(/^division_parent: .*$/m, "division_parent: null")))
      .filter((e) => e.startsWith("C-6.1")).length >= 1, true);
}

console.log("\n--- 7. the supersedes edge's OWN requirements: a reason, and a target that resolves ---");
{
  /* Before this item `supersedes` had ZERO occurrences in store.mjs and no
     producer: membership of REL_VOCAB meant only that C-6.1 would not refuse the
     string. This block is what the second negative control removes. */
  const NOREASON = "INQ-2026-1600-reasonless";
  const reasonless = await promote(NOREASON, inquiryMd(NOREASON, {
    question: "Does the pattern hold?", refs: [{ target: PARENT, rel: "supersedes" }] }), "inquiry", "open");
  t("an inquiry superseding another with NO REASON is refused at the write, under C-6.1",
    [reasonless.ok, reasonless.reason, (reasonless.findings || []).map((f) => f.check)],
    [false, "SUPERSESSION_REFUSED", ["C-6.1"]]);
  const GHOST = "INQ-2026-1600-ghosted";
  const ghost = await promote(GHOST, inquiryMd(GHOST, {
    question: "Does the pattern hold?",
    refs: [{ target: "INQ-2026-1600-never-existed", rel: "supersedes", reason: "it was two questions" }] }),
    "inquiry", "open");
  t("a supersedes edge whose target does NOT RESOLVE is refused: an edge asserting a lineage must name a question that exists",
    [ghost.ok, ghost.reason], [false, "SUPERSESSION_REFUSED"]);
  t("neither document landed", [await stateOf(NOREASON), await stateOf(GHOST)], [undefined, undefined]);
  t("the CATALOG names C-6.1 on the reasonless edge too, so it cannot audit clean either",
    (await errorsOf(NOREASON, inquiryMd(NOREASON, {
      question: "Does the pattern hold?", refs: [{ target: PARENT, rel: "supersedes" }] })))
      .filter((e) => e.startsWith("C-6.1") && e.includes("no reason")).length, 1);
}

console.log("\n--- 8. the catalog's `divided` ENTRY REQUIREMENTS: the account is a GATE, not an op behaviour ---");
{
  /* A hand-written document is the route left once the act itself is correct,
     and it is the route the abuse would take: wear `divided`, and quietly lose
     the leg that cuts against you. */
  const md = await imageOf(PARENT);
  const dropped = md.replace(new RegExp(`  - ord: 2\\n    target: ${AGAINST}\\n    role: cuts_against\\n    to: ${KID_A}\\n`), "")
                    .replace(new RegExp(`  - ord: 2\\n    target: ${AGAINST}\\n    role: cuts_against\\n    to: ${KID_B}\\n`), "");
  const errs = await errorsOf(PARENT, dropped);
  t("a divided parent whose apportionment DROPS the cuts_against leg is refused by the catalog, naming it as cutting",
    [errs.filter((e) => e.startsWith("C-2.8")).length,
     errs.some((e) => e.includes("cut") && e.includes("AGAINST"))], [1, true]);
  t("a divided parent with NO division block at all is refused",
    (await errorsOf(PARENT, md.replace(/^division:\n(?: {2}.*\n)+/m, "")))
      .filter((e) => e.startsWith("C-2.8") && e.includes("requires a division block")).length, 1);
  t("a division into ONE child is refused by the catalog as well as by the act",
    (await errorsOf(PARENT, md.replace(/^ {2}into: \[.*\]$/m, `  into: [${KID_A}]`)))
      .filter((e) => e.startsWith("C-2.8")).length >= 1, true);
  t("an apportionment sending a leg to a child the division did not name is refused",
    (await errorsOf(PARENT, md.replace(`    to: ${KID_B}`, "    to: INQ-2026-1600-elsewhere")))
      .filter((e) => e.startsWith("C-2.8")).length >= 1, true);
}

/* ============================================= 9. PUBLISHED_CANNOT_DIVIDE */
console.log("\n--- 9. a PUBLISHED case refuses PUBLISHED_CANNOT_DIVIDE — an edition is not a malformation ---");
{
  const PUB = "INQ-2026-1600-published";
  await mustPromote(PUB, inquiryMd(PUB, { question: "Was the FY2023 transfer authorised?",
    refs: [AUTH, AGAINST], legs: [{ target: AUTH }, { target: AGAINST, role: "cuts_against" }] }),
    "inquiry", "open");
  await conclude(PILAR, { target: PUB, conclusion: "The FY2023 transfer rests on the same unadopted memo.",
    falsifier: "An adopted FY2023 resolution would overturn this." });
  const p = await publish(PILAR, { target: PUB,
    statement: "This case covers the FY2023 transfer only, on the documents in hand.",
    excluded: [], subjectPosition: "not_sought",
    subjectJustification: "Notice here would let the record be revised before it is captured; we say so." });
  t("the case publishes at edition 1", [p.ok, p.edition], [true, 1]);
  const refused = await divide(ROSA, { target: PUB, reason: WHY,
    children: [{ id: "INQ-2026-1600-pub-a", question: "Was it authorised?", legs: [0] },
               { id: "INQ-2026-1600-pub-b", question: "Who signed it?", legs: [1] }] });
  t("dividing it is refused BY NAME, not as a generic illegal move",
    [refused.ok, refused.reason, refused.from], [false, "PUBLISHED_CANNOT_DIVIDE", "published"]);
  t("and the refusal states the distinction: an EDITION says the case continues, a DIVISION says the parent was malformed",
    [refused.detail.includes("An EDITION says the case continues"),
     refused.detail.includes("Reopen it")], [true, true]);
  t("op=affordances does not publish the act there either — publication and refusal agree (DEC-8)",
    actIds(await affordances(PUB)).includes("inquirydivide"), false);
  t("the published case is untouched by the refusal", await stateOf(PUB), "published");
}

console.log("\n--- 10. a CHILD publishes, and its published bytes carry the disclosure (REC-14's reserved keys, populated) ---");
{
  await conclude(PILAR, { target: KID_A,
    conclusion: "The transfer was not authorised by any adopted instrument.",
    falsifier: "An adopted resolution naming the transfer would overturn this." });
  const p = await publish(PILAR, { target: KID_A,
    statement: "This case covers the authorisation question only; the signature question is its sibling.",
    excluded: [{ target: SIGNED, description: "the signature page",
                 reason: "it belongs to the sibling question and is not weighed here" }],
    subjectPosition: "sought_no_answer",
    subjectJustification: "We put the authorisation claim to the City Administrator on 2026-07-10 and had no reply." });
  const md = await imageOf(KID_A);
  t("the published child names its PARENT and every SIBLING in the bytes that get signed",
    [p.ok, new RegExp(`^division_parent: ${PARENT}$`, "m").test(md),
     new RegExp(`^division_siblings: \\[${KID_B}\\]$`, "m").test(md)], [true, true, true]);
  t("and it still carries the supersedes edge with its reason after publication",
    ((await fmOf(KID_A)).references || []).filter((r) => r.rel === "supersedes")
      .map((r) => [r.target, r.reason]), [[PARENT, WHY]]);
  t("the published child AUDITS CLEAN", (await errorsOf(KID_A, md)).filter((e) => !e.startsWith("C-21.2")), []);
}

/* =============================================== 11. DEC-29(b): the prompt */
console.log("\n--- 11. DEC-29(b): the divide surface's wording STATES the disclosure the division will make ---");
{
  const cat = (await GET("op=affordances&token=mem-rec16")).result.catalog;
  const act = cat.find((a) => a.id === "inquirydivide");
  t("the act is published with its capability, its mode and its weight — composed, not hand-asserted",
    [act.needs, act.mode, act.weight, act.rung], ["contribute", "session", "single", null]);
  t("the plane PUBLISHES the prompt, so a surface renders what it received and composes none of its own (DEC-8)",
    act.prompt, DIVIDE_PROMPT);
  /* THE ACCEPTANCE CLAUSE, clause by clause and as strings. Each of these is
     the sentence Bob's ruling requires be present: what is offered has to be
     visibly honesty rather than concealment, because division's visible effect
     is a HIGHER publishable strength. */
  t("it says nothing is removed",
    DIVIDE_PROMPT.includes("Dividing does not remove anything"), true);
  t("it says every leg gets a home, INCLUDING one that cuts against you",
    [DIVIDE_PROMPT.includes("gets a home"), DIVIDE_PROMPT.includes("cuts against you")], [true, true]);
  t("it says the other question STAYS ON THE RECORD",
    DIVIDE_PROMPT.includes("stays on the record"), true);
  t("it says each child names this parent and EVERY SIBLING, and that a published child names them to its readers",
    [DIVIDE_PROMPT.includes("names this parent and every sibling"),
     DIVIDE_PROMPT.includes("it names them to its readers")], [true, true]);
  t("and it names the honest alternative when the intent really is to drop material",
    DIVIDE_PROMPT.includes("sever it with a reason instead"), true);
  t("no other act invents a prompt: exactly one is published, and it is this one",
    ACTS.filter((a) => a.prompt).map((a) => a.id), ["inquirydivide"]);
}

console.log("\n--- 12. publication and refusal agree, in both directions (DEC-8) ---");
{
  const OPEN0 = "INQ-2026-1600-standing";
  await mustPromote(OPEN0, inquiryMd(OPEN0, { question: "Does any of this recur?" }), "inquiry", "open");
  t("an inquiry resting on NOTHING does not publish the act: there is nothing to apportion",
    actIds(await affordances(OPEN0)).includes("inquirydivide"), false);
  t("and the store agrees by name — the unpublished act is the refused act",
    (await divide(ROSA, { target: OPEN0, reason: WHY,
      children: [{ id: "INQ-2026-1600-s-a", question: "A?", legs: [0] },
                 { id: "INQ-2026-1600-s-b", question: "B?", legs: [0] }] })).reason,
    "NO_APPORTIONMENT");
  const ONELEG = "INQ-2026-1600-oneleg";
  await mustPromote(ONELEG, inquiryMd(ONELEG, { question: "Two questions about one memo?",
    refs: [AUTH], legs: [{ target: AUTH }] }), "inquiry", "open");
  t("an inquiry resting on ONE leg DOES publish it: two questions may rest on one document, and a leg may go to both",
    actIds(await affordances(ONELEG)).includes("inquirydivide"), true);
  const both = await divide(ROSA, { target: ONELEG, reason: WHY,
    children: [{ id: "INQ-2026-1600-one-a", question: "What did the memo authorise?", legs: [0] },
               { id: "INQ-2026-1600-one-b", question: "Who wrote the memo?", legs: [0] }] });
  t("and it succeeds, with the one leg homed on BOTH children",
    [both.ok, both.apportionment[0].to], [true, ["INQ-2026-1600-one-a", "INQ-2026-1600-one-b"]]);
  t("an information bundle never publishes the act", actIds(await affordances(AUTH)).includes("inquirydivide"), false);
  const notInq = await divide(ROSA, { target: AUTH, reason: WHY, children: SPLIT });
  t("and dividing one is refused NOT_AN_INQUIRY", notInq.reason, "NOT_AN_INQUIRY");
  t("an unknown target is NO_SUCH_BUNDLE, identical to one the viewer may not see (REC-25)",
    (await divide(ROSA, { target: "INQ-2026-9999-ghost", reason: WHY, children: SPLIT })).reason,
    "NO_SUCH_BUNDLE");
}

await mf.dispose();
console.log(`\ndivide: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
