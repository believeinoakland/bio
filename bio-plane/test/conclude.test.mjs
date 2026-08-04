/* NEGATIVE CONTROL: (REC-13's own — remove the FALSIFIER requirement and an inquiry concludes with nothing that would falsify it) break BOTH gates together, since either alone is still refused by the other: in checks/bio-checks.mjs checkInquiryExtension delete the `concluded state requires a non-empty falsifier` arm, AND in src/store.mjs conclude() change `if (!fals)` to `if (false)` -> 42 pass, 7 FAIL. The headline is "a conclusion with no falsifier is refused before anything moves", which reports got [true,"concluded"]: op=conclude ACCEPTED falsifier="" and the inquiry is now concluded with nothing that would falsify it. "the catalog names a missing falsifier under C-2.8" reports false — the catalog finds nothing wrong with that document either, so nothing downstream would ever notice. The other five are the cascade (NO_FALSIFIER unnamed; the wrongly-concluded inquiry no longer publishes conclude and can no longer be concluded by pilar). Restore BOTH lines -> 49 pass, 0 fail. */
/* REC-13: the `concluded` state, its ENTRY REQUIREMENTS, and op=conclude.
 * BUILD-ORDER.md §2 (REC-13) is the scope; DEC-22 and DEC-30 are the folded
 * rulings; the MAP RULE (REC-10 x REC-19's seam) is binding on every state
 * consultation here.
 *
 * What this suite holds the item to, each in the direction that fails:
 *
 *   1. DEC-22, FIRST, because it BOUNDS everything after it. An `open` inquiry
 *      may hold a claim with ZERO legs — a STANDING OBJECTIVE the group means
 *      to pursue. It is legal to the catalog, readable through the ops, and
 *      never auto-anything. What it may NOT do is conclude.
 *   2. THE ACT. A named member concludes an inquiry through op=conclude — the
 *      control plane, a real caller's only route — and the document that lands
 *      carries the conclusion, the falsifier, the C-4.2 transition and the
 *      C-13.2 Session Log entry, and AUDITS CLEAN against the catalog. Nothing
 *      concluded here mints a bundle the catalog immediately rejects (release's
 *      fourth property, carried over).
 *   3. THE FOUR REFUSALS, BY NAME: NO_CONCLUSION, NO_FALSIFIER, NO_BASIS and
 *      MACHINE_CANNOT_CONCLUDE. Each is checked BEFORE anything moves, and the
 *      inquiry is still open afterwards — a refusal that half-ran would be
 *      worse than the refusal.
 *   4. ONE MACHINE, THE CATALOG'S. `surfaced` (open's legal alias) concludes;
 *      `deferred` does not (it is reopened first); `concluded` does not
 *      conclude again; and a LEGACY focus document is refused, because its own
 *      vocabulary has no `concluded` in it and no `## Conclusion` to hold one.
 *      That last one is the MAP RULE with teeth: the answer comes from
 *      vocabFor over the DECLARED spelling, not from STATES.inquiry by a raw
 *      key.
 *   5. PUBLICATION AND REFUSAL AGREE (DEC-8). op=affordances publishes
 *      `conclude` on an open inquiry and NOT on a concluded one, through the
 *      ONE exported edge table — and every unpublished case here is then
 *      ATTEMPTED and refused by the store, in the same run, on the same
 *      objects.
 *   6. DEC-30: no owner gate and no ballot. A contribute holder who did not
 *      author the inquiry concludes it, and the act is ATTRIBUTED to them in
 *      the state_history and the Session Log.
 *
 * NEGATIVE CONTROL RUN 2026-08-03 (rec13-agent): removed the falsifier
 * requirement from BOTH gates as the header line describes -> 42 pass, 7 FAIL.
 * op=conclude returned ok:true for falsifier="" (got [true,"concluded"] where
 * [false,"open"] was wanted) and the catalog then found NOTHING wrong with the
 * resulting document — an inquiry concluded with nothing that would falsify
 * it, and no gate anywhere in the plane looking. Restored -> 49 pass, 0 fail.
 *
 * Both halves had to go together, which is itself the finding worth keeping:
 * breaking the store alone leaves the catalog refusing the bundle op=conclude
 * just wrote, and breaking the catalog alone leaves op=conclude refusing the
 * call. The requirement is enforced twice on purpose (the checkGatheringGrammar
 * precedent), so a one-sided break is caught by the other side rather than by
 * the suite — and a control that only broke one side would have "passed" while
 * proving nothing.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, STATES } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec13", MEMBER_TOKEN: "mem-rec13", PROBE_TOKEN: "prb-rec13", VERSION: "test" },
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
   route, and the literal `op=conclude` uninterpolated so coverage credits it
   there (D-43: op=invitelook shipped with a ReferenceError while 1276
   store-level assertions passed). */
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}`
    + (target !== undefined ? `&target=${encodeURIComponent(target)}` : "")
    + (conclusion !== undefined ? `&conclusion=${encodeURIComponent(conclusion)}` : "")
    + (falsifier !== undefined ? `&falsifier=${encodeURIComponent(falsifier)}` : "")));
const affordances = async (target, tok = "mem-rec13") =>
  await GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`);
const actIds = (r) => (r.result?.acts ?? []).map((a) => a.id).sort();
const imageOf = async (id, tok = "mem-rec13") =>
  (await GET(`op=image&token=${tok}&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];
const stateOf = async (id, tok = "mem-rec13") =>
  ((await GET(`op=list&token=${tok}`)).result || []).find((b) => b.bundle_id === id)?.current_state;
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};

/* ------------------------------------------------------------- documents */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`])]
  : [];

/* The canonical inquiry (REC-10's vocabulary, REC-11's basis). `state` is a
   parameter because `surfaced` is a LEGAL ALIAS of `open` and this suite
   concludes one of each. */
const inquiryMd = (id, { question = "Where does the sewer fund transfer basis come from?",
                         state = "open", refs = [], legs = [] } = {}) => ["---",
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
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* A LEGACY focus document, whole and valid under the contract it was authored
   under — its own heading set, its own state machine. It carries a basis and a
   reference, so the ONLY thing that can refuse conclude on it is its declared
   vocabulary. */
const focusMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: focus", "schema: focus@1",
  `title: "Legacy focus ${id}"`, "current_state: surfaced", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "", "## Statement", "", "The transfer basis is unexplained.", "",
  "## Why It Matters", "", "## Open Questions", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

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

const promote = async (id, md, type, state, tok = "mem-rec13") => {
  const r = rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

/* NAMED members. Concluding is a named member's assertion, and DEC-30 says any
   contribute holder may make it — so the suite needs a SECOND one who did not
   author the inquiry, holds no position over it and stood for no ballot.
   Membership Architecture 4.2/4.3 sets the shape of the roster: the first two
   invitations a group issues create administrators (an ordinary member added
   first is a group with a single point of failure), so nadia and omar are
   admins and pilar is the ORDINARY member — the strongest witness for DEC-30,
   carrying nothing but `contribute`. */
const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-rec13",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");         // the 4.2 two-administrator floor
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");

const DOC = "INFO-2026-1300-transfer-memo";
const INQ_MAIN = "INQ-2026-1300-main";
const INQ_STANDING = "INQ-2026-1300-standing";
const INQ_ALIAS = "INQ-2026-1300-alias";
const INQ_DEFERRED = "INQ-2026-1300-deferred";
const INQ_SECOND = "INQ-2026-1300-second";
const FOCUS_LEGACY = "FOCUS-2026-1300-legacy";

const withBasis = { refs: [DOC], legs: [{ target: DOC, role: "supports" }] };

await promote(DOC, infoMd(DOC), "information", "collected");
await promote(INQ_MAIN, inquiryMd(INQ_MAIN, withBasis), "inquiry", "open");
await promote(INQ_STANDING, inquiryMd(INQ_STANDING,
  { question: "Who authorised the transfer, if anyone?" }), "inquiry", "open");
await promote(INQ_ALIAS, inquiryMd(INQ_ALIAS,
  { question: "Does the transfer recur next cycle?", state: "surfaced", ...withBasis }), "inquiry", "surfaced");
await promote(INQ_SECOND, inquiryMd(INQ_SECOND,
  { question: "What did the memo actually authorize?", ...withBasis }), "inquiry", "open");
await promote(FOCUS_LEGACY, focusMd(FOCUS_LEGACY, withBasis), "focus", "surfaced");

/* ------------------------------------------------- 1. DEC-22, the bound */
console.log("\n--- 1. DEC-22: an OPEN inquiry may rest on nothing — legal, readable, never auto-anything ---");
{
  const md = await imageOf(INQ_STANDING);
  t("a claim with ZERO legs draws no catalog error while open: it is a STANDING OBJECTIVE, not a defect",
    await errorsOf(INQ_STANDING, md), []);
  t("and it is READABLE through the ops, not quarantined", await stateOf(INQ_STANDING), "open");
  t("the document itself carries no basis at all — absent, not an empty gesture",
    /^basis:/m.test(md), false);
  /* CORRECTED 2026-08-04 (REC-37), never exempted: `cite` joins every
     inquiry's published act list. It was absent because `op=cite` could not
     reach a question in either direction — the measured gap UI-20 found, and
     the reason the one act by which a record becomes a case did not exist.
     REC-37 widens the op so a question may cite, and the guard on that arm is
     TYPE-only, so the act is published at every inquiry state exactly as it has
     always been published on a RETIRED information bundle. Nothing about the
     state-machine acts this block is really about has changed. */
  t("op=affordances still publishes its acts: an unsupported question is worked on, not frozen",
    actIds(await affordances(INQ_STANDING)), ["cite", "conclude", "dispose"]);
}

/* ------------------------------------------------------- 2. the act */
console.log("\n--- 2. op=conclude: a named member concludes, and what lands AUDITS CLEAN ---");
const CONCL = "The transfer rests on a 1998 council resolution never rescinded";
const FALS = "A rescinding resolution, or a finance memo naming a different authority";
{
  const before = await stateOf(INQ_MAIN);
  const r = await conclude(NADIA, { target: INQ_MAIN, conclusion: CONCL, falsifier: FALS });
  t("the inquiry was open before the act", before, "open");
  t("op=conclude succeeds for the named member, reporting the move it made",
    [r.ok, r.from, r.to, r.basis_legs], [true, "open", "concluded", 1]);
  t("the ACTOR is server-stamped from the session, never taken from the caller", r.author, "nadia");
  t("weight is `single`: one conclusion answers one question, so no set is applied",
    r.weight, "single");
  t("the projected state moved", await stateOf(INQ_MAIN), "concluded");

  const md = await imageOf(INQ_MAIN);
  t("the conclusion is IN THE DOCUMENT, caller-supplied and never prefilled",
    new RegExp(`^conclusion: "${CONCL}"$`, "m").test(md), true);
  t("so is the falsifier — what would overturn this is part of the record, not a habit",
    new RegExp(`^falsifier: "${FALS}"$`, "m").test(md), true);
  t("C-4.2: the transition is RECORDED, with prior_state pointing at a history the document carries",
    [/^prior_state: open$/m.test(md), /to_state: concluded/.test(md), /author: nadia/.test(md)],
    [true, true, true]);
  t("C-13.2: last_updated moved and a Session Log entry accounts for it, naming who and why",
    [/### Session .* \| Concluded \| nadia/.test(md), md.includes(`Conclusion: ${CONCL}`),
     md.includes(`Falsifier: ${FALS}`)], [true, true, true]);
  /* Release's fourth property, carried over: nothing concluded here audits
     dirty. This is the assertion the whole entry-requirement design exists to
     make true, and the one the negative control turns over. */
  t("the concluded document the op wrote audits CLEAN against the catalog",
    await errorsOf(INQ_MAIN, md), []);
}

/* --------------------------------------------------- 3. the four refusals */
console.log("\n--- 3. the four refusals, BY NAME, each checked before anything moves ---");
{
  const noConcl = await conclude(NADIA, { target: INQ_SECOND, conclusion: "", falsifier: FALS });
  t("refused BY NAME: NO_CONCLUSION", noConcl.reason, "NO_CONCLUSION");
  t("a conclusion with nothing in it is refused before anything moves",
    [noConcl.ok, await stateOf(INQ_SECOND)], [false, "open"]);

  const noFals = await conclude(NADIA, { target: INQ_SECOND, conclusion: CONCL, falsifier: "" });
  t("refused BY NAME: NO_FALSIFIER", noFals.reason, "NO_FALSIFIER");
  t("a conclusion with no falsifier is refused before anything moves — this is the negative control's subject",
    [noFals.ok, await stateOf(INQ_SECOND)], [false, "open"]);

  const noBasis = await conclude(NADIA, { target: INQ_STANDING, conclusion: CONCL, falsifier: FALS });
  t("refused BY NAME: NO_BASIS — DEC-22's standing objective is exactly what may not be concluded",
    noBasis.reason, "NO_BASIS");
  t("and the standing objective is untouched: still open, still legal",
    [noBasis.ok, await stateOf(INQ_STANDING)], [false, "open"]);

  /* A MACHINE credential reaches the op — fail closed, like release — and the
     store refuses it on the author stamp's SHAPE (`token:<class>`). */
  const machine = await conclude("mem-rec13", { target: INQ_SECOND, conclusion: CONCL, falsifier: FALS });
  t("refused BY NAME: MACHINE_CANNOT_CONCLUDE — a machine may SURFACE a question and never author the answer",
    machine.reason, "MACHINE_CANNOT_CONCLUDE");
  t("the machine class REACHES the op and is refused by the store, not hidden from it",
    [machine.ok, await stateOf(INQ_SECOND)], [false, "open"]);
  const admMachine = await conclude("adm-rec13", { target: INQ_SECOND, conclusion: CONCL, falsifier: FALS });
  t("an ADMIN machine credential is refused identically: it is not a person either",
    admMachine.reason, "MACHINE_CANNOT_CONCLUDE");
}

/* ----------------------------------------------- 4. one machine, the catalog's */
console.log("\n--- 4. the machine is the CATALOG's, consulted through the map (the MAP RULE) ---");
{
  /* CORRECTED 2026-08-04 (REC-14), never exempted: `published` joins the edges
   OUT of concluded, so the sorted edge set moves. The rule this asserts is
   unchanged — the edges come from the ONE exported table and nothing here keeps
   a copy — and the new member is the point of REC-14 rather than drift. */
t("the ONE edge table carries the new state and its edges — nothing here keeps a copy",
    [STATES.inquiry.legal.includes("concluded"),
     STATES.inquiry.edges.open.includes("concluded"),
     STATES.inquiry.edges.surfaced.includes("concluded"),
     STATES.inquiry.edges.concluded.slice().sort()],
    [true, true, true, ["deferred", "dismissed", "divided", "open", "published", "surfaced"]]);

  const alias = await conclude(PILAR, { target: INQ_ALIAS, conclusion: CONCL, falsifier: FALS });
  t("`surfaced`, open's legal alias, concludes — refusing it would be the trap the alias exists to avoid",
    [alias.ok, alias.from, alias.to], [true, "surfaced", "concluded"]);

  const again = await conclude(NADIA, { target: INQ_MAIN, conclusion: CONCL, falsifier: FALS });
  t("an already-concluded inquiry is refused ILLEGAL_TRANSITION, not treated as a no-op",
    [again.ok, again.reason, again.from], [false, "ILLEGAL_TRANSITION", "concluded"]);

  /* deferred -> concluded is deliberately NOT an edge: something the group set
     down is picked back up first. */
  await promote(INQ_DEFERRED, inquiryMd(INQ_DEFERRED,
    { question: "Was the fund balance restated?", ...withBasis }), "inquiry", "open");
  const h = rP(await POST(`op=select&token=${NADIA}&kind=enumerated`, { ids: [INQ_DEFERRED] }));
  const disp = rP(await GET(`op=dispose&token=${NADIA}&handle=${h.handle}&to=deferred`
    + `&reason=${encodeURIComponent("waiting on the audit")}`));
  t("(fixture) the inquiry is deferred through op=dispose", [disp.ok, await stateOf(INQ_DEFERRED)],
    [true, "deferred"]);
  const defer = await conclude(NADIA, { target: INQ_DEFERRED, conclusion: CONCL, falsifier: FALS });
  t("a DEFERRED inquiry cannot be concluded: it is reopened first, and the table says so",
    [defer.ok, defer.reason], [false, "ILLEGAL_TRANSITION"]);

  /* THE MAP RULE with teeth. A legacy focus document normalizes to `inquiry`
     for MEMBERSHIP questions — so the bundles row says inquiry — while its own
     VOCABULARY has no `concluded` and no `## Conclusion` to hold one. The
     answer must come from vocabFor over the DECLARED spelling; reaching into
     STATES.inquiry by a raw key would conclude it and mint a bundle the
     catalog rejects on the next read. */
  const legacy = await conclude(NADIA, { target: FOCUS_LEGACY, conclusion: CONCL, falsifier: FALS });
  t("a LEGACY focus document is refused: its own machine has no concluded state, whatever the row says",
    [legacy.ok, legacy.reason, legacy.object_type], [false, "ILLEGAL_TRANSITION", "focus"]);
  t("and it is untouched — the legacy contract is not rewritten to make an act fit",
    await stateOf(FOCUS_LEGACY), "surfaced");

  const ghost = await conclude(NADIA, { target: "INQ-2026-9999-ghost", conclusion: CONCL, falsifier: FALS });
  t("an unknown target is NO_SUCH_BUNDLE", ghost.reason, "NO_SUCH_BUNDLE");
  const notInq = await conclude(NADIA, { target: DOC, conclusion: CONCL, falsifier: FALS });
  t("an information bundle is NOT_AN_INQUIRY: concluding answers a question, and only an inquiry carries one",
    notInq.reason, "NOT_AN_INQUIRY");
}

/* ------------------------------- 5. publication and refusal agree (DEC-8) */
console.log("\n--- 5. op=affordances publishes conclude from the ONE edge table, and the store agrees ---");
{
  const cat = await GET("op=affordances&token=mem-rec13");
  const pub = cat.result.catalog.find((a) => a.id === "conclude");
  t("the catalogue publishes conclude with its capability, its mode and its weight — composed, not hand-asserted",
    [pub.needs, pub.mode, pub.weight], ["contribute", "session", "single"]);
  t("its rung is NULL: no document assigns conclude one, and RUNGS invents nothing (FW-14's job)",
    pub.rung, null);

  const openAff = await affordances(INQ_SECOND);
  /* CORRECTED 2026-08-04 (REC-16), never exempted: an open inquiry that RESTS
     ON SOMETHING now publishes `inquirydivide` too. INQ_STANDING above, which
     rests on nothing, still publishes exactly {conclude, dispose} — and that
     pair of assertions is now doing more work than either did alone, because it
     is what shows the divide act's basis-count condition is real rather than
     incidental. */
  /* CORRECTED 2026-08-04 (REC-37), never exempted: `cite` joins every
     inquiry's published act list. It was absent because `op=cite` could not
     reach a question in either direction — the measured gap UI-20 found, and
     the reason the one act by which a record becomes a case did not exist.
     REC-37 widens the op so a question may cite, and the guard on that arm is
     TYPE-only, so the act is published at every inquiry state exactly as it has
     always been published on a RETIRED information bundle. Nothing about the
     state-machine acts this block is really about has changed. */
  /* CORRECTED 2026-08-04 (REC-45), never exempted, and one note covers the
     three assertions below: `inquiryground` joins the published list of every
     inquiry that RESTS ON SOMETHING and is neither published nor divided.
     Grouping moves NO state — it authors what a question rests on, not where it
     stands — so nothing about the state-machine acts this block is really about
     has changed. It appears on the LEGACY focus for the same reason `cite`
     does: the guard is type-and-basis, never the declared state vocabulary, and
     a legacy focus with legs has a basis a member can group. INQ_STANDING,
     which rests on nothing, still publishes exactly {conclude, dispose} — which
     is what shows this act's basis-count condition is real rather than
     incidental, exactly as it does for the divide act above. */
  t("an OPEN inquiry publishes conclude beside dispose", actIds(openAff),
    ["cite", "conclude", "dispose", "inquirydivide", "inquiryground"]);
  const concludedAff = await affordances(INQ_MAIN);
  /* CORRECTED 2026-08-04 (REC-14), never exempted: a concluded inquiry now
   publishes `publish` as well, which is the state this whole ladder exists to
   reach. `dispose` stays beside it — a conclusion nobody publishes STILL AGES
   (D-79), and that was and is the reason this assertion exists.
   CORRECTED AGAIN 2026-08-04 (REC-16): `inquirydivide` joins them. A concluded
   inquiry is exactly where dividing is most likely to be right — the answer is
   in and the weakest leg is now visible in the frozen pair — and DEC-28 makes
   `concluded -> divided` a legal edge. */
t("a CONCLUDED inquiry publishes exactly the legal acts: dispose, divide and publish — and a conclusion nobody publishes still ages (D-79)",
    actIds(concludedAff),
    ["cite", "dispose", "inquirydivide", "inquiryground", "publish"]);   // REC-37/REC-45, 2026-08-04 (see the notes above)
  t("conclude is UNPUBLISHED there, and the store agrees by name — publication and refusal cannot disagree",
    (await conclude(NADIA, { target: INQ_MAIN, conclusion: CONCL, falsifier: FALS })).reason,
    "ILLEGAL_TRANSITION");
  const legacyAff = await affordances(FOCUS_LEGACY);
  t("the legacy focus does NOT publish conclude either: the derivation asks the DECLARED vocabulary too",
    actIds(legacyAff), ["cite", "dispose", "inquiryground"]);   // REC-37/REC-45, 2026-08-04 (see the notes above)
  t("an information bundle never publishes conclude", actIds(await affordances(DOC)).includes("conclude"), false);
}

/* ------------------------------------------------- 6. the catalog's own gate */
console.log("\n--- 6. the ENTRY REQUIREMENTS at the catalog, modelled on C-2.7's verified arm ---");
{
  const concludedMd = (extra) => inquiryMd("INQ-2026-1301-gate",
    { state: "concluded", ...withBasis }).replace("---\n\n## Question",
      `${extra}\n---\n\n## Question`);
  const full = concludedMd(`conclusion: "${CONCL}"\nfalsifier: "${FALS}"`);
  t("a fully-formed concluded inquiry draws zero errors", await errorsOf("INQ-2026-1301-gate", full), []);
  t("the catalog names a missing conclusion under C-2.8",
    (await errorsOf("INQ-2026-1301-gate", concludedMd(`falsifier: "${FALS}"`)))
      .filter((e) => e.includes("conclusion")), ["C-2.8: concluded state requires a non-empty conclusion"]);
  t("the catalog names a missing falsifier under C-2.8 — the negative control's subject at this gate",
    (await errorsOf("INQ-2026-1301-gate", concludedMd(`conclusion: "${CONCL}"`)))
      .some((e) => e.startsWith("C-2.8:") && e.includes("falsifier")), true);
  t("an EMPTY conclusion is refused exactly as an absent one: silence is what is refused, not uncertainty",
    (await errorsOf("INQ-2026-1301-gate", concludedMd(`conclusion: ""\nfalsifier: "${FALS}"`)))
      .some((e) => e.includes("non-empty conclusion")), true);
  const legless = inquiryMd("INQ-2026-1302-legless", { state: "concluded" })
    .replace("---\n\n## Question", `conclusion: "${CONCL}"\nfalsifier: "${FALS}"\n---\n\n## Question`);
  t("a concluded inquiry resting on NOTHING is refused: DEC-22 permits that while open and only while open",
    (await errorsOf("INQ-2026-1302-legless", legless))
      .some((e) => e.startsWith("C-2.8:") && e.includes("at least one basis leg")), true);
  /* And the same document is legal the moment it is open again — the
     requirement belongs to the STATE, not to the type. */
  t("the same legless document is legal while OPEN: the requirement belongs to the state, not the type",
    await errorsOf("INQ-2026-1302-legless", legless.replace("current_state: concluded", "current_state: open")),
    []);
}

/* --------------------------------------------------------- 7. DEC-30 */
console.log("\n--- 7. DEC-30: no owner gate, no ballot — any contribute holder, act ATTRIBUTED ---");
{
  /* pilar is an ORDINARY member. She did not author INQ_SECOND (it was seeded),
     holds no position over it, and no vote was taken. She concludes it, and the
     record says it was her. */
  const r = await conclude(PILAR, { target: INQ_SECOND, conclusion: CONCL, falsifier: FALS });
  t("an ordinary contribute holder concludes an inquiry she did not author — no owner gate, no ballot",
    [r.ok, r.author], [true, "pilar"]);
  const md = await imageOf(INQ_SECOND);
  t("the act is ATTRIBUTED in both places the record keeps authorship",
    [/author: pilar/.test(md), /### Session .* \| Concluded \| pilar/.test(md)], [true, true]);
  t("and what she wrote audits clean too", await errorsOf(INQ_SECOND, md), []);
  t("the alias inquiry she concluded earlier reads back concluded",
    await stateOf(INQ_ALIAS), "concluded");
}

await mf.dispose();
console.log(`\nconclude: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
