/* NEGATIVE CONTROL: RUN 2026-09-23 (D-149 worker, branch land/worker/D-149 over origin/main 02603e88), each arm ALONE, the anchor asserted to occur exactly once, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp (checks/bio-checks.mjs 856,351 B sha256 d174ae399920…, src/store.mjs 2,916,097 B sha256 dea0d185da27…); baseline 48 pass / 0 fail, and 48/0 again after the last restore.
   (A) THE ROW'S NAMED CONTROL — default an empty list to a federal citation: in checks/bio-checks.mjs governingLawsOf, return `{ state: 'stated', laws: [{ level: 'federal', citation: '5 U.S.C. 552' }] }` before the undetermined branch. DECLARED: §1's undetermined arms, the cpra_request arms and §7's reader arm fail; §3-§5 hold. RESULT 39/9 — the undetermined arm fails BY NAME first ("the action's read says UNDETERMINED, with an empty list and nobody named"), then its sentence, "no level is asserted", both cpra_request arms, §2's explicit-[] arm and §7's reader. NOT AS DECLARED in two §3 arms ("lands … replaced null" and the Session Log's "replaced an undetermined list"), and the declaration was wrong rather than the arm: the act reads the SAME reader to say what it replaced, so a reader that defaults to federal makes the act report replacing a federal list nobody stated. §3's read-back, §4 and §5 held.
   (B) THE LIAR'S PASS — in src/store.mjs promote, `if (was !== now)` -> `if (false && was !== now)` in is-promote-governing-laws. DECLARED: §2's three creation refusals and §6's two revision refusals fail; §1, §3, §4, §5 hold. RESULT 39/9, AS DECLARED for all five, plus four §6 arms downstream of the edit that then landed (the list really changed, so the carried-forward and restated expectations moved). §1, §3, §4, §5 held.
   (C) THE MACHINE FENCE — in src/store.mjs actionLaws, `if (!who || isMachineIdentity(who))` -> `if (!who)`. DECLARED: §4's three arms fail; §1-§3 hold. RESULT 40/8, AS DECLARED, plus five §6 arms downstream of the machine's list having landed. §1-§3 held.
   (D) OVER-STRICTNESS — the promote fence applied to the act itself: `if (!pkg[LAWS_ACT] && ((cur …` -> `if (((cur …`. DECLARED: §3's member act fails (refused GOVERNING_LAWS_REWRITTEN); §1, §2 and §4's refusal hold. RESULT 35/13, AS DECLARED: "op=actionlaws by a member lands" fails first and every arm resting on a list having been set follows; §1, §2 and §4's machine refusal held.
   (E) THE LITERAL ROW IDS (c18-batch7fix, 2026-09-23, on land/conduct/c18-batch7fix) — in §5's case table, BAD_LAW_LEVEL's literal `"C-73.3"` -> `"C-73.4"`, anchor asserted once, restored by cp and verified by sha256 AND cmp. DECLARED: that one §5 arm fails; every other arm holds. RESULT 47/1, AS DECLARED: "a level outside the three is refused BAD_LAW_LEVEL, with its C-73 row (C-73.4)". */
/* D-149: A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT (Bob, 2026-09-22;
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2).
 *
 * *"ALL records laws apply."* The layers follow the AGENCY ASKED, so an action carries a LIST of the laws that
 * govern its request, each named by CITATION at its level (federal, state, local), set by a member's authored
 * act. An empty list is UNDETERMINED and stated, never a default. The plane encodes no law's rules.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, each in the direction that fails:
 *   1. AN ACTION NOBODY STATED LAWS FOR READS UNDETERMINED — with its sentence, never federal — and the claim is
 *      about the BYTES: the stored document carries no list. `cpra_request` reads unchanged: its kind is its
 *      member's statement that the CPRA governs, the sentence says so, and the LIST stays undetermined.
 *   2. THE LIAR'S PASS IS REFUSED BY NAME: a citation filled in at creation (the row's own words) never lands —
 *      GOVERNING_LAWS_REWRITTEN — and neither does a revision that edits the list around the act.
 *   3. A MEMBER'S LIST LANDS AND READS BACK, attributed and dated from the session, through the control plane.
 *   4. A MACHINE CREDENTIAL'S LIST IS REFUSED BY NAME (MACHINE_CANNOT_SET_LAWS, C-32.18), code, C-number and
 *      canned translation on the wire, and nothing moves.
 *   5. THE SHAPE: no list, a level outside the three, an empty / quoted / repeated citation, too many — each
 *      refused by its own code before anything is written; the catalog (C-2.10) judges the same shape on bytes.
 *   6. OVER-STRICTNESS: a revision that carries the list forward unchanged lands; the act restates the list and
 *      says what it replaced; `op=actionmove` carries the list forward.
 *
 * WHAT IT CANNOT SEE: whether a citation is the RIGHT law for the agency — by design nobody but a member can,
 * and the plane does not try. It drives no machine PROPOSAL of a list, because none is built.
 */
import { docDate } from "./docdates.mjs";   /* promotion R12: the envelope carries the document's own dates */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
/* RE-POINTED 2026-09-28 (T8, legacy-tests; ACTIONS #1 J2 item 4): the governing-laws reader, its rows (C-73) and the
   laws fence (C-32.18, now in `ACTION_FENCE_CHECKS`) moved to `actions` (`src/actions/checks.mjs`), with `LAW_LEVELS`
   re-exported from `jurisdictions` (R31, N61). `checkBundle` no longer runs the action arm; `errorsOf` runs actions'
   audit arm (R37) beside it. */
import { checkBundle, parseFrontmatter } from "../checks/bio-checks.mjs";
import { LAW_LEVELS, ACTION_FENCE_CHECKS, GOVERNING_LAW_CHECKS, governingLawsOf,
         checkActionExtension } from "../src/actions/checks.mjs";
import { VOCABULARIES } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d149", MEMBER_TOKEN: "mem-d149", PROBE_TOKEN: "prb-d149",
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
const actionlaws = async (tok, target, laws) =>
  rP(await POST(`op=actionlaws&token=${tok}&target=${encodeURIComponent(target)}`, { laws }));
const lawsRead = async (tok, id) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`))?.action?.governing_laws ?? null;
const textOf = async (tok, id) => { const f = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`)); return typeof f?.text === "string" ? f.text : ""; };
const fmOf = (text) => parseFrontmatter(text).data || {};
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64), nowMs: PINNED_MS,
    resolveTarget: () => true });
  checkActionExtension({ fm: fmOf(text), nowMs: PINNED_MS }, findings);   /* the audit's action arm (actions R37) */
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const lawErrors = (errs) => errs.filter((e) => /governing_laws/.test(e));

const actionMd = (id, { kind = "other", title = "Records request", laws = null, lawsBy = null,
                        lawsAt = null, plan = "Ask for the transfer ledger." } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "${title}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: 1",
  "counterparty:", "  state: named", "  role: City Clerk", "  body: City of Oakland",   /* R9: an office */
  ...(laws === null ? [] : laws.length
    ? ["governing_laws:", ...laws.flatMap((l) => [`  - level: ${l.level}`, `    citation: "${l.citation}"`])]
    : ["governing_laws: []"]),
  ...(lawsBy ? [`governing_laws_by: "${lawsBy}"`] : []),
  ...(lawsAt ? [`governing_laws_at: "${lawsAt}"`] : []),
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-d149",
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

let snapKeySeq = 0;
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: "action", group: "believe-in-oakland",
            current_state: "planned", created: docDate(text, "created") ?? NOW, last_updated: docDate(text, "last_updated") ?? LATER },
  }));
const headOf = async (id) => rP(await GET(`op=projection&token=${NADIA}&id=${encodeURIComponent(id)}`))?.bundle_sha;

const ACT = "ACTN-2026-1490-oakland-request";
/* RE-GRADED 2026-09-28 (T8): `cpra_request` is refused on a creation (actions R10); the product's records request is
   `records_request`, and an action written before as `cpra_request` reads as written (R4, R41), asked of the reader
   over its bytes in section 1. */
const CPRA = "ACTN-2026-1491-records-request";
const LIAR = "ACTN-2026-1492-filled-at-creation";
/* Oakland's layers, as the design's correction states them: a city agency is governed by the CPRA and the city's
   own sunshine ordinance — NOT by federal FOIA, which governs federal agencies only. */
const OAKLAND = [
  { level: "state", citation: "Cal. Gov. Code § 7920.000 et seq. (California Public Records Act)" },
  /* RE-GRADED 2026-09-28 (T8): the levels are the profile's (`jurisdictions` R31, actions N61: federal, state, county,
     city); D-149's `local` reads as written and is not stated anew. Oakland's ordinance is the city's. */
  { level: "city", citation: "Oakland Municipal Code ch. 2.20 (Sunshine Ordinance)" },
];

/* ===================================================================== */
console.log("--- 1. an action nobody stated laws for reads UNDETERMINED, in its bytes ---");
{
  const made = await promote(NADIA, ACT, actionMd(ACT));
  const madeC = await promote(NADIA, CPRA, actionMd(CPRA, { kind: "records_request" }));
  t("both fixture actions land through op=promote (the corpus is non-empty before anything is asked of it)",
    [made?.ok, madeC?.ok], [true, true]);
  const bytes = await textOf(NADIA, ACT);
  t("the STORED bytes carry no governing_laws, no governing_laws_by, no governing_laws_at — the read below is "
  + "about these bytes, not about a read-side filter",
    /* FLOORED: the byte read must return the document, or "no list in it" passes over an empty read. */
    [bytes.length > 600, fmOf(bytes).id, "governing_laws" in fmOf(bytes), "governing_laws_by" in fmOf(bytes),
     /governing_laws/.test(bytes)],
    [true, ACT, false, false, false]);
  const r = await lawsRead(PILAR, ACT);
  t("the action's read says UNDETERMINED, with an empty list and nobody named",
    [r?.state, r?.laws, r?.by, r?.at], ["undetermined", [], null, null]);
  /* RE-ANCHORED 2026-09-28 (T8; actions R41): no outward text of the module names a law, so the sentence no longer
     names the federal law it does not assume; it says the record assumes NONE, and names no level. */
  t("and it SAYS SO IN WORDS, naming what it does not assume — never federal by default",
    [/^UNDETERMINED: no member has stated which laws govern this action/.test(r?.stated ?? ""),
     /The record assumes none\./.test(r?.stated ?? ""), /federal/i.test(r?.stated ?? "")], [true, true, false]);
  t("no level is asserted anywhere in the undetermined answer",
    JSON.stringify(r).match(/"level"/g), null);
  t("the catalog finds nothing to refuse in an honest undetermined (absent is not a defect)",
    lawErrors(await errorsOf(ACT, bytes)), []);

  const c = await lawsRead(PILAR, CPRA);
  const cBytesBefore = await textOf(NADIA, CPRA);
  t("a records_request READS UNCHANGED: kind still records_request, list still undetermined — nothing is inferred from the kind",
    [rP(await GET(`op=projection&token=${PILAR}&id=${CPRA}`))?.action?.kind, c?.state, c?.laws],
    ["records_request", "undetermined", []]);
  /* RE-ANCHORED 2026-09-28 (T8; actions R4, R41): an action written as `cpra_request` can no longer be created, so it
     is asked of the ONE reader over its bytes (the read's own function): it reads as written, its list undetermined,
     and its sentence says the kind named the records law it was made under and names no law itself. The wire half
     (an old kind reads byte-identically) is `test/m/actions/write.test.mjs`, test "R4 law rides a records_request
     only, a citation; an old kind reads as written; R6 at the write (C-73.6)", and `test/m/actions/read.test.mjs`,
     test "R39 R41 no place is named in outward text; an old records-law kind names no law; tests run on the test
     profile". */
  const old = governingLawsOf(fmOf(actionMd("ACTN-2026-1496-written-before", { kind: "cpra_request" })));
  t("an action written as cpra_request reads undetermined, and its sentence says its kind named the records law "
    + "and names no law itself — only as what its member wrote",
    [old.state, old.laws, /kind, as written, named the records law it was made under; the record names no law from it, and nothing else is inferred from the kind/.test(old.stated),
     /California|Public Records Act|CPRA/.test(old.stated)],
    ["undetermined", [], true, false]);
  t("reading it wrote nothing: the bytes (a real document) are identical after the read",
    [cBytesBefore.length > 600, sha(await textOf(NADIA, CPRA))], [true, sha(cBytesBefore)]);
}

/* ===================================================================== */
console.log("\n--- 2. the liar's pass: a citation filled in at creation, or edited around the act ---");
{
  const liar = await promote(NADIA, LIAR, actionMd(LIAR, { laws: [{ level: "federal", citation: "5 U.S.C. § 552" }],
    lawsBy: "nadia", lawsAt: "2026-08-20T00:00:00Z" }));
  t("a CREATION carrying a list is refused BY NAME, with its catalogue row on the wire",
    [liar?.ok, liar?.reason, liar?.check, liar?.translation],
    [false, "GOVERNING_LAWS_REWRITTEN", "C-73.1", GOVERNING_LAW_CHECKS.GOVERNING_LAWS_REWRITTEN.translation]);
  t("...and nothing landed: the action does not exist",
    rP(await GET(`op=projection&token=${NADIA}&id=${LIAR}`)) ?? null, null);
  const bare = await promote(NADIA, "ACTN-2026-1493-list-no-by",
    actionMd("ACTN-2026-1493-list-no-by", { laws: [{ level: "state", citation: "Cal. Gov. Code § 7920.000" }] }));
  t("the same with no attribution at all is refused the same way — the fence reads the LIST, not the stamp",
    [bare?.ok, bare?.reason], [false, "GOVERNING_LAWS_REWRITTEN"]);
  const empty = await promote(NADIA, "ACTN-2026-1494-explicit-empty",
    actionMd("ACTN-2026-1494-explicit-empty", { laws: [] }));
  t("OVER-STRICTNESS: a creation writing `governing_laws: []` lands — [] and absent are one state, undetermined",
    [empty?.ok, (await lawsRead(NADIA, "ACTN-2026-1494-explicit-empty"))?.state], [true, "undetermined"]);
}

/* ===================================================================== */
console.log("\n--- 3. a member's list lands and reads back ---");
{
  const set = await actionlaws(PILAR, ACT, OAKLAND);
  t("op=actionlaws by a member lands, stamped with the SESSION's member and the pinned instant",
    [set?.ok, set?.by, set?.at, set?.replaced], [true, "pilar", "2026-08-20T00:00:00Z", null]);
  const r = await lawsRead(NADIA, ACT);
  t("it READS BACK exactly as authored, attributed and dated",
    [r?.state, r?.laws, r?.by, r?.at], ["stated", OAKLAND, "pilar", "2026-08-20T00:00:00Z"]);
  const bytes = await textOf(NADIA, ACT);
  t("and it is IN THE BYTES, parsed by the catalog's own parser",
    [fmOf(bytes).governing_laws, fmOf(bytes).governing_laws_by], [OAKLAND, "pilar"]);
  t("the catalog accepts the bytes the act wrote (C-2.10 clean on governing_laws)",
    lawErrors(await errorsOf(ACT, bytes)), []);
  t("the Session Log records the statement and that it replaced an undetermined list",
    [/Governing laws stated \| pilar/.test(bytes), /Replaced: nothing: the list was undetermined/.test(bytes)],
    [true, true]);
}

/* ===================================================================== */
console.log("\n--- 4. a machine credential's list is refused by name ---");
{
  const before = await headOf(ACT);
  const m = await actionlaws("mem-d149", ACT, [{ level: "federal", citation: "5 U.S.C. § 552" }]);
  t("a machine credential REACHES the op and is refused BY NAME, row and translation on the wire",
    [m?.ok, m?.reason, m?.check, m?.translation],
    [false, "MACHINE_CANNOT_SET_LAWS", "C-32.18", ACTION_FENCE_CHECKS.MACHINE_CANNOT_SET_LAWS.translation]);
  t("...and nothing moved: same head, same list", [await headOf(ACT), (await lawsRead(NADIA, ACT))?.laws],
    [before, OAKLAND]);
  const p = await actionlaws("prb-d149", ACT, OAKLAND);
  t("the probe credential is a machine too", [p?.ok, p?.reason], [false, "MACHINE_CANNOT_SET_LAWS"]);
}

/* ===================================================================== */
console.log("\n--- 5. the shape, refused at the act and judged by the catalog ---");
{
  const before = await headOf(ACT);
  const cases = [
    ["no list", undefined, "NO_LAWS", "C-73.2"],
    ["an empty list", [], "NO_LAWS", "C-73.2"],
    /* RE-GRADED 2026-09-28 (T8): `county` is now a level (R31); the level outside the profile's four is `municipal`. */
    ["a level outside the four", [{ level: "municipal", citation: "Alameda County Ordinance" }], "BAD_LAW_LEVEL", "C-73.3"],
    ["an empty citation", [{ level: "state", citation: "  " }], "BAD_CITATION", "C-73.4"],
    ["a citation holding a quotation mark", [{ level: "state", citation: 'the "CPRA"' }], "BAD_CITATION", "C-73.4"],
    ["a repeated entry", [OAKLAND[0], { ...OAKLAND[0], citation: OAKLAND[0].citation.toUpperCase() }], "BAD_CITATION", "C-73.4"],
    ["thirteen entries", Array.from({ length: 13 }, (_, i) => ({ level: "city", citation: `Ord. ${i}` })), "TOO_MANY_LAWS", "C-73.5"],
  ];
  /* Each case names its check id as a LITERAL (c18-batch7fix, 2026-09-23): the row's number was read from the
     catalog at run time, so the assertion held whatever number the catalog said and `coverage.mjs`, which reads
     literal ids, counted C-73.2..5 as never named. The literal is asserted against BOTH the wire and the catalog,
     so a renumbered row now fails here instead of passing silently. */
  for (const [what, laws, code, check] of cases) {
    const r = await actionlaws(NADIA, ACT, laws);
    t(`${what} is refused ${code}, with its C-73 row (${check})`,
      [r?.ok, r?.reason, r?.check, GOVERNING_LAW_CHECKS[code].check], [false, code, check, check]);
  }
  t("...and none of them wrote anything", await headOf(ACT), before);
  const na = await actionlaws(NADIA, "INFO-2026-1495-nope", OAKLAND);
  t("an absent target answers as absent", [na?.ok, na?.reason], [false, "NO_SUCH_BUNDLE"]);

  const at = "2026-08-20T00:00:00Z";
  const one = [{ level: "state", citation: "Cal. Gov. Code § 7920.000" }];
  t("C-2.10: a list with no governing_laws_by is an error",
    lawErrors(await errorsOf(ACT, actionMd(ACT, { laws: one, lawsAt: at }))).length > 0, true);
  t("C-2.10: a list whose governing_laws_by is a machine identity is an error",
    lawErrors(await errorsOf(ACT, actionMd(ACT, { laws: one, lawsBy: "token:member", lawsAt: at })))
      .some((e) => /machine identity/.test(e)), true);
  t("C-2.10: a level outside the four is an error",
    lawErrors(await errorsOf(ACT, actionMd(ACT, { laws: [{ level: "municipal", citation: "x" }], lawsBy: "nadia", lawsAt: at })))
      .some((e) => /level 'municipal'/.test(e)), true);
  t("C-2.10: an attribution with no list asserts an act that set nothing",
    lawErrors(await errorsOf(ACT, actionMd(ACT, { laws: [], lawsBy: "nadia", lawsAt: at }))).length > 0, true);
  t("C-2.10 OVER-STRICTNESS: a complete, member-attributed list is clean",
    lawErrors(await errorsOf(ACT, actionMd(ACT, { laws: OAKLAND, lawsBy: "nadia", lawsAt: at }))), []);
}

/* ===================================================================== */
console.log("\n--- 6. carried forward, restated, and never edited around the act ---");
{
  const held = await textOf(NADIA, ACT);
  const base = await headOf(ACT);
  const edited = held.replace(OAKLAND[1].citation, "Oakland Municipal Code ch. 2.21");
  t("the fixture edit arms (the text changed)", edited !== held, true);
  const rev = await promote(NADIA, ACT, edited, base);
  t("a MEMBER's revision through op=promote that edits the list is refused BY NAME",
    [rev?.ok, rev?.reason], [false, "GOVERNING_LAWS_REWRITTEN"]);
  const byOnly = await promote(NADIA, ACT, held.replace('governing_laws_by: "pilar"', 'governing_laws_by: "nadia"'), base);
  t("...and so is one that re-attributes the list to somebody else",
    [byOnly?.ok, byOnly?.reason], [false, "GOVERNING_LAWS_REWRITTEN"]);
  const plan = held.replace("Ask for the transfer ledger.", "Ask for the transfer ledger and the 2025 journal entries.");
  t("the over-strictness fixture arms (the text changed)", plan !== held, true);
  const keep = await promote(NADIA, ACT, plan, base);
  t("OVER-STRICTNESS: a revision that carries the list forward unchanged LANDS",
    [keep?.ok, (await lawsRead(NADIA, ACT))?.laws], [true, OAKLAND]);

  const moved = rP(await GET(`op=actionmove&token=${NADIA}&target=${ACT}&to=active&reason=${encodeURIComponent("the request goes out today")}`));
  t("op=actionmove carries the list forward: the state moves, the laws and their author do not",
    [moved?.ok, (await lawsRead(NADIA, ACT))?.laws, (await lawsRead(NADIA, ACT))?.by], [true, OAKLAND, "pilar"]);

  const three = [...OAKLAND, { level: "federal", citation: "5 U.S.C. § 552 (as it bears on federal records the City holds)" }];
  const again = await actionlaws(NADIA, ACT, three);
  t("a member RESTATES the list: the whole set, attributed anew, and the answer names what it replaced",
    [again?.ok, again?.by, again?.replaced], [true, "nadia", OAKLAND]);
  const r = await lawsRead(PILAR, ACT);
  t("the read now carries the restated set and its new author", [r?.laws, r?.by], [three, "nadia"]);
  t("the Session Log keeps the replaced list and who had stated it",
    /Replaced: state Cal\. Gov\. Code .*; city Oakland Municipal Code ch\. 2\.20 \(Sunshine Ordinance\) \(stated by pilar\)/
      .test(await textOf(NADIA, ACT)), true);
}

/* ===================================================================== */
console.log("\n--- 7. one vocabulary, one reader ---");
{
  /* RE-ANCHORED 2026-09-28 (T8): the profile's four levels (`jurisdictions` R31, K102, N61), replacing D-149's three. */
  t("the four levels", LAW_LEVELS, ["federal", "state", "county", "city"]);
  t("published by op=affordances' VOCABULARIES as the SAME array, not a copy", VOCABULARIES.law_levels === LAW_LEVELS, true);
  const aff = rP(await GET(`op=affordances&token=${NADIA}&id=${ACT}`));
  const vocab = aff?.vocabularies?.law_levels ?? null;
  t("and it reaches a caller on the wire", vocab, LAW_LEVELS);
  t("the reader is total: a document with no frontmatter reads undetermined, never throws",
    governingLawsOf(null).state, "undetermined");
}

await mf.dispose();
console.log(`\nd149-governing-laws: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
