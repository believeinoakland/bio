/* D-641 — THE REFUSAL CODES D-542's BY-OP WALK BROUGHT INTO REACH ARRIVE WITH A CANNED TRANSLATION.
 *
 * THE DEFECT. D-542 taught the DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) to count a code as in reach
 * when the surface CALLS an op that mints it (R5) or a stranger can (R6). 107 codes entered reach that way with no
 * row in any `*_CHECKS` family, so each could reach a member as bare machine vocabulary — the state DEC-49 (Bob,
 * 2026-08-06; `BIO_Assistant_and_AI_Roles_v0_1.md` rule 10) exists to make impossible. D-641 gives 103 of them a row
 * in REACH_BY_OP_CHECKS (C-100), splits one code that covered two conditions (acquire's no-body answer is now
 * FETCH_NO_BODY, the 104th row), and shows at the code that the other four never leave on the wire at the op that
 * put them in reach (the guard's NOT_ON_THE_WIRE).
 *
 * WHY THE GUARD ALONE IS NOT ENOUGH, which is what this suite is for. `dec49Decorate` (index.mjs) attaches a row's
 * sentence to ANY `ok:false` answer whose reason matches, so a wire assertion passes over the ROWS ALONE, with the
 * plane still minting the old bare literal at five sites for three conditions (D-448 and D-484 measured exactly
 * that). So this suite does three things:
 *   1. THE ROWS: every code holds its pinned C-number, a `where` naming a REGION, and a sentence that is prose.
 *   2. THE ROUTING, pinned in the source: every code is minted EXACTLY ONCE across store.mjs and index.mjs
 *      (comment-stripped), and that one mint is INSIDE the region its row names. A code consolidated behind a
 *      `refuse*` helper ("H") is minted in the helper and nowhere else; a one-site code ("S") in its own region.
 *   3. THE WIRE: a sample driven through the CONTROL PLANE, a real caller's only route, each asserted ADDITIVE —
 *      the old `reason` and `detail` unchanged, with `code`, `check` and `translation` joining them.
 *
 * WHAT IT CANNOT SEE: the wire arm drives a SAMPLE (every op family D-641 touched that a harness can reach without
 * an outbound fetch), not all 104 — the acquire, archive and published-store codes need a source or a published
 * store the harness does not stand up, and are pinned by the routing arm only. It says nothing about a LIVE plane.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by the D-641 worker, `node test/d641-reach-by-op-translation.control.mjs` from
 * bio-plane/ (pen in the session scratchpad), driver exit 0, every arm AS DECLARED on its first run, every restore
 * sha256 MATCH, content IDENTICAL, cmp SAME. Declared before the run, each armed alone:
 *   (0) baseline, nothing armed -> this suite 699/0, the guard exit 0.
 *   (a) THE ROW'S OWN CONTROL — C-100.2 NO_ENDS's sentence emptied -> 697/2, the prose arm and the wire arm for
 *       NO_ENDS; the guard exit 1 naming "REACH_BY_OP_CHECKS.NO_ENDS has NO CANNED TRANSLATION".
 *   (b) one of NO_KEY's former sites restored to its bare literal -> 698/1, "NO_KEY is minted on exactly ONE line";
 *       the guard exit 1, arm G naming NO_KEY at two sites. The wire arm for that very site STAYED GREEN, as
 *       declared: `dec49Decorate` puts the sentence on any matching `ok:false`, so the wire is no evidence of routing.
 *   (c) NO_CONTENT's NOT_ON_THE_WIRE declaration withdrawn -> 699/0; the guard exit 1, reachGap 40 over its ceiling
 *       of 39 naming NO_CONTENT.
 *   (d) over-strictness, `is-relation-ends`'s markers re-spelled -> 699/0, the guard exit 0.
 *   (e) reach-by-op.mjs's BARE_CALL back to a consumed character -> 699/0; the guard exit 1, R6 PUBLIC OP 32 against
 *       its floor of 36 AND R5 BY OP 325 against 332 — the widening is load-bearing for both rules.
 *   (f) a stale NOT_ON_THE_WIRE declaration added -> 699/0; the guard exit 1 naming it as stale.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { REACH_BY_OP_CHECKS } from "../checks/bio-checks.mjs";
import { stripComments } from "../scripts/walkfloor.mjs";

const SRC = (f) => readFileSync(fileURLToPath(new URL(`../src/${f}`, import.meta.url)), "utf8");
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

console.log("\n--- d641: the codes the by-op walk brought into reach, translated ---");

/* ========================================================================= 1
 * THE ROWS. Each C-number is a LITERAL here because scripts/coverage.mjs demands that an assertion NAME every
 * catalogue id (D-448 found a regex satisfied nothing). "H" = consolidated behind one `refuse*` mint in store.mjs;
 * "S" = one site, its own region.
 * ======================================================================== */
const NUMBERED = {
  UNKNOWN_RELATION: ["C-100.1", "S"],
  NO_ENDS: ["C-100.2", "S"],
  SELF_RELATION: ["C-100.3", "S"],
  NO_JUSTIFICATION: ["C-100.4", "S"],
  ALREADY_ALIASED: ["C-100.5", "S"],
  NO_KIND: ["C-100.6", "S"],
  UNKNOWN_KIND: ["C-100.7", "H"],
  NO_MEMBER: ["C-100.8", "H"],
  NO_CASE: ["C-100.9", "S"],
  NO_SUCH_CASE: ["C-100.10", "H"],
  NOT_A_CASE: ["C-100.11", "S"],
  NO_KINDS: ["C-100.12", "S"],
  NO_KEY: ["C-100.13", "H"],
  NO_STAGES: ["C-100.14", "S"],
  NO_STAGE_KEY: ["C-100.15", "S"],
  DUPLICATE_STAGE: ["C-100.16", "S"],
  NO_CARDINALITY: ["C-100.17", "S"],
  BAD_REQUIRED: ["C-100.18", "S"],
  NO_PLACEMENTS: ["C-100.19", "S"],
  NO_STAGE: ["C-100.20", "H"],
  NO_CAPTURE: ["C-100.21", "H"],
  DUPLICATE_PLACEMENT: ["C-100.22", "S"],
  NO_SUCH_PROGRESSION: ["C-100.23", "H"],
  NO_DECIDER: ["C-100.24", "S"],
  NO_FINDING: ["C-100.25", "S"],
  NO_PROJECT_SCOPE: ["C-100.26", "H"],
  NO_ACTOR: ["C-100.27", "H"],
  ALREADY_RESOLVED: ["C-100.28", "S"],
  ALREADY_THEIRS: ["C-100.29", "S"],
  NO_SUCH_MEMBER: ["C-100.30", "H"],
  UNGRAMMATICAL: ["C-100.31", "S"],
  NO_SUCH_HANDLE: ["C-100.32", "H"],
  ALREADY_VOTED: ["C-100.33", "H"],
  NO_HANDLE: ["C-100.34", "S"],
  BAD_HANDLE: ["C-100.35", "S"],
  HANDLE_TAKEN: ["C-100.36", "S"],
  PASSWORD_TOO_SHORT: ["C-100.37", "H"],
  ALREADY_CLAIMED: ["C-100.38", "S"],
  ANONYMOUS_LEASE: ["C-100.39", "S"],
  NO_OWNER: ["C-100.40", "H"],
  NO_ID: ["C-100.41", "H"],
  NO_REF: ["C-100.42", "H"],
  NO_SUCH_REFERENCE: ["C-100.43", "H"],
  NO_LEG: ["C-100.44", "S"],
  CONNECTION_PAIR_NO_PAIR: ["C-100.45", "H"],
  NEED_CAPTURE_OR_ADDRESS: ["C-100.46", "S"],
  NO_DOCUMENT: ["C-100.47", "H"],
  UNSPLICEABLE_STATE_HISTORY: ["C-100.48", "H"],
  UNSPLICEABLE_BASIS: ["C-100.49", "H"],
  UNSPLICEABLE_CORRESPONDENCE: ["C-100.50", "S"],
  UNSPLICEABLE_GOVERNING_LAWS: ["C-100.51", "S"],
  LEASE_HELD: ["C-100.52", "S"],
  NO_RESPONSE_HAS_NO_BYTES: ["C-100.53", "S"],
  CRUCIAL_IN_BATCH: ["C-100.54", "S"],
  PUBLISHED_CANNOT_BE_SET_DOWN: ["C-100.55", "S"],
  NO_PARTITION: ["C-100.56", "S"],
  BAD_PARTITION: ["C-100.57", "H"],
  BAD_STATEMENT: ["C-100.58", "S"],
  PARTITION_UNCHANGED: ["C-100.59", "S"],
  PUBLISHED_CANNOT_RESTRUCTURE: ["C-100.60", "S"],
  DIVIDED_CANNOT_RESTRUCTURE: ["C-100.61", "S"],
  BASIS_REFUSED: ["C-100.62", "H"],
  NO_BUNDLE_MD: ["C-100.63", "H"],
  UNPARSEABLE_FRONTMATTER: ["C-100.64", "H"],
  NO_BODY: ["C-100.65", "S"],
  UNDECLARED_OPERATION: ["C-100.66", "S"],
  REFS_IN_PAYLOAD: ["C-100.67", "S"],
  BASIS_IN_PAYLOAD: ["C-100.68", "S"],
  MALFORMED: ["C-100.69", "H"],
  EXISTS: ["C-100.70", "H"],
  ABSENT: ["C-100.71", "H"],
  MINT_EXHAUSTED: ["C-100.72", "H"],
  NAME_TAKEN: ["C-100.73", "H"],
  OVERSIZE_INLINE: ["C-100.74", "S"],
  GATHERING_REFUSED: ["C-100.75", "S"],
  SUBJECT_REFUSED: ["C-100.76", "S"],
  ACTION_BASIS_REFUSED: ["C-100.77", "H"],
  CORRESPONDENCE_REFUSED: ["C-100.78", "H"],
  RESPONDS_TO_REFUSED: ["C-100.79", "H"],
  SUPERSESSION_REFUSED: ["C-100.80", "H"],
  NO_SIBLING_DISCLOSURE: ["C-100.81", "H"],
  BASIS_VERSION_REFUSED: ["C-100.82", "H"],
  FETCH_NO_BODY: ["C-100.83", "S"],
  HASH_DISAGREEMENT: ["C-100.84", "S"],
  HOST_COOLING_OFF: ["C-100.85", "H"],
  BAD_ADDRESS: ["C-100.86", "H"],
  NOT_PERMITTED: ["C-100.87", "H"],
  NOT_ELIGIBLE: ["C-100.88", "S"],
  ARCHIVE_UNREACHABLE: ["C-100.89", "S"],
  ARCHIVE_REFUSED: ["C-100.90", "S"],
  CDX_UNPARSEABLE: ["C-100.91", "S"],
  CDX_NOT_AN_ARRAY: ["C-100.92", "S"],
  CDX_NO_HEADER: ["C-100.93", "S"],
  NO_USABLE_CAPTURE: ["C-100.94", "S"],
  TOO_LARGE_TO_PARSE: ["C-100.95", "H"],
  NOT_HTML: ["C-100.96", "H"],
  PRIMARY_UNREADABLE: ["C-100.97", "H"],
  NO_SUCH_SESSION: ["C-100.98", "H"],
  SESSION_UNREADABLE: ["C-100.99", "H"],
  NOT_A_CONTAINER: ["C-100.100", "S"],
  MANIFEST_UNREADABLE: ["C-100.101", "S"],
  DUPLICATE_PATH: ["C-100.102", "S"],
  PART_MISSING: ["C-100.103", "S"],
  OBJECT_MISSING: ["C-100.104", "H"],
};
const CODES = Object.keys(REACH_BY_OP_CHECKS);
console.log(`  corpus: ${CODES.length} rows in REACH_BY_OP_CHECKS`);
t("the family is the 104 rows D-641 wrote, and no fewer", CODES.length, 104);
t("the pinned numbering covers every row, and no more",
  Object.keys(NUMBERED).sort().join(","), CODES.slice().sort().join(","));
for (const [code, row] of Object.entries(REACH_BY_OP_CHECKS)) {
  t(`${code} holds its own catalogue row, ${NUMBERED[code]?.[0]}`, row.check, NUMBERED[code]?.[0]);
  t(`${code}'s \`where\` names a REGION in a plane file`,
    /^src\/(store|index|cdx|container)\.mjs \S+ > is-[a-z0-9-]+$/.test(row.where || ""), true);
  const words = String(row.translation || "").trim();
  t(`${code} carries a canned sentence that is prose, not the code re-spelled`,
    words.length > 60 && !words.includes(code) && !/^[A-Z_ ]+$/.test(words), true);
}
t("no two rows share a translation",
  new Set(Object.values(REACH_BY_OP_CHECKS).map(r => r.translation)).size, CODES.length);

/* ========================================================================= 2
 * THE ROUTING. One mint per code across the two files arm G reads, inside the region the row names. The markers
 * are matched the way the guard matches them (D-448's over-strictness arm), and the span begins where the opening
 * marker's comment closes.
 * ======================================================================== */
console.log("\n--- 2. every code is minted once, inside the region its row names ---");
const RAW = { "src/store.mjs": SRC("store.mjs"), "src/index.mjs": SRC("index.mjs"),
              "src/cdx.mjs": SRC("cdx.mjs"), "src/container.mjs": SRC("container.mjs") };
const STRIPPED = Object.fromEntries(Object.entries(RAW).map(([f, s]) => [f, stripComments(s)]));
const regionText = (file, name) => {
  const s = RAW[file];
  const o = new RegExp(`/\\*[\\s*]*DEC-49 REGION\\s+(${name})\\b`).exec(s);
  const c = new RegExp(`/\\*[\\s*]*END DEC-49 REGION\\s+(${name})\\b`).exec(s);
  if (!o || !c || c.index <= o.index) return null;
  const afterOpen = s.indexOf("*" + "/", o.index);
  return s.slice(afterOpen < 0 || afterOpen > c.index ? o.index : afterOpen + 2, c.index);
};
/* A mint: the code as a quoted `reason`/`code` value. */
const MINT = (code) => new RegExp(`\\b(?:reason|code)\\s*:\\s*"${code}"`, "g");
for (const [code, row] of Object.entries(REACH_BY_OP_CHECKS)) {
  const [file, rest] = row.where.split(" ");
  const region = row.where.split(" > ")[1];
  const span = regionText(file, region);
  t(`${code}'s region \`${region}\` exists in ${file}, opened and closed`, span !== null, true);
  if (span === null) continue;
  /* Lines carrying a mint, across the plane files: a `reason` and a `code` on ONE line are one mint. */
  const mintLines = Object.values(STRIPPED).flatMap(s => s.split("\n").filter(l => MINT(code).test(l)));
  t(`${code} is minted on exactly ONE line across store, index, cdx and container`, mintLines.length, 1);
  t(`${code}'s one mint is INSIDE its region \`${region}\``, MINT(code).test(stripComments(span)), true);
  if (NUMBERED[code]?.[1] === "H")
    t(`${code}'s region is the body of its one mint, ${rest}`,
      new RegExp(`export function ${rest}\\(fields = \\{\\}\\) \\{\\s*/\\*[\\s*]*DEC-49 REGION ${region}\\b`).test(RAW[file]), true);
}
/* The split, pinned: promote's NO_BODY is a request that sent nothing; acquire's is a source that answered with
   nothing, and it is its own code now. */
t("acquire's no-body answer is FETCH_NO_BODY, and index.mjs mints no NO_BODY",
  [/reason: "FETCH_NO_BODY", locator \}, 502\)/.test(RAW["src/index.mjs"]), MINT("NO_BODY").test(STRIPPED["src/index.mjs"])],
  [true, false]);
/* The four NOT_ON_THE_WIRE declarations rest on two facts at the code; pinned here so the reason cannot rot. */
t("attest writes the timestamp parser's reason into an attempt NOTE, never the answer's code",
  /if \(!parsed\.ok\) \{\s*attempts\.push\(\{ service: endpoint, attempted, ok: false, note: parsed\.reason \}\);/.test(RAW["src/index.mjs"]), true);
t("op=connections reaches connectionGradeForContent only with a non-empty trimmed id",
  /if \(typeof contentId === "string" && contentId\.trim\(\)\)\s*return this\.connectionGradeForContent\(/.test(RAW["src/store.mjs"]), true);

/* ========================================================================= 3
 * THE WIRE. A sample driven through the control plane. Each arm reads the refusal off the answer a caller gets.
 * ======================================================================== */
console.log("\n--- 3. a sample, driven through the op ---");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d641", MEMBER_TOKEN: "mem-d641", PROBE_TOKEN: "prb-d641", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d641") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? `&token=${tok}` : ""}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-d641") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? `&token=${tok}` : ""}${qs ? `&${qs}` : ""}`)).json());
/* ADDITIVE: the site's own reason (and detail, when it had one) stays; code, check and translation join it. */
const wire = (label, r, code, detailRe) => {
  const row = REACH_BY_OP_CHECKS[code];
  t(`${label} -> ${code} with ${row.check}'s canned sentence`,
    [r?.ok, r?.reason, r?.code, r?.check, r?.translation === row.translation, detailRe ? detailRe.test(r?.detail || "") : true],
    [false, code, code, row.check, true, true]);
};
try {
  const ent = await post("entitycreate", { kind: "office", label: "Office of the City Clerk", aliases: ["Clerk"] });
  const ent2 = await post("entitycreate", { kind: "office", label: "Office of the City Auditor" });
  t("(fixture) two registry entries exist", [ent.ok, ent2.ok], [true, true]);
  wire("entitycreate with no kind", await post("entitycreate", { label: "x" }), "NO_KIND", /an entity needs a kind/);
  wire("entitycreate with a kind outside the vocabulary", await post("entitycreate", { kind: "banana", label: "x" }),
    "UNKNOWN_KIND", /closed kind vocabulary/);
  wire("entityalias naming a name the entry already answers to",
    await post("entityalias", { entityId: ent.entity_id, alias: "clerk" }), "ALREADY_ALIASED");
  const rel = (o) => post("relationdeclare", { fromEntity: ent.entity_id, toEntity: ent2.entity_id, relation: "overlaps",
    justification: "they share a budget line", citation: "adopted budget p.4", ...o });
  wire("relationdeclare with a relation outside the set", await rel({ relation: "likes" }), "UNKNOWN_RELATION");
  wire("relationdeclare with one end missing", await rel({ toEntity: "" }), "NO_ENDS", /names two entities/);
  wire("relationdeclare between an entry and itself", await rel({ toEntity: ent.entity_id }), "SELF_RELATION");
  wire("relationdeclare with no justification", await rel({ justification: "" }), "NO_JUSTIFICATION");

  const def = (o) => post("progressiondefine", { progressionKey: "meeting", label: "Meeting",
    stages: [{ key: "agenda", cardinality: "1", required: "always" }], ...o });
  wire("progressiondefine with no key", await def({ progressionKey: "" }), "NO_KEY", /named by a key/);
  wire("progressiondefine with no stages", await def({ stages: [] }), "NO_STAGES");
  wire("progressiondefine with a keyless stage", await def({ stages: [{ cardinality: "1", required: "always" }] }), "NO_STAGE_KEY");
  wire("progressiondefine with a repeated stage key",
    await def({ stages: [{ key: "a", cardinality: "1", required: "always" }, { key: "a", cardinality: "1", required: "always" }] }),
    "DUPLICATE_STAGE");
  wire("progressiondefine with a stage of no cardinality", await def({ stages: [{ key: "a", required: "always" }] }), "NO_CARDINALITY");
  wire("progressiondefine with a requiredness outside the words",
    await def({ stages: [{ key: "a", cardinality: "1", required: "mostly" }] }), "BAD_REQUIRED", /required must be one of/);
  wire("progression read with no key (a SECOND former site of NO_KEY, same mint)", await get("progression"), "NO_KEY",
    /read a progression definition by its key/);
  wire("thread with no placements", await post("thread", { progressionKey: "meeting", entityId: ent.entity_id, placements: [] }),
    "NO_PLACEMENTS");
  wire("thread through a progression nobody defined",
    await post("thread", { progressionKey: "nothing-here", entityId: ent.entity_id,
      placements: [{ stage: "agenda", captureSha: "a".repeat(64) }] }), "NO_SUCH_PROGRESSION", /define the progression first/);

  wire("queuemute under a credential with no member behind it",
    await post("queuemute", { case: "INQ-2026-0001", kinds: ["x"] }), "NO_MEMBER", /a mute is PERSONAL/);
  wire("inquirystrength with no id", await get("inquirystrength"), "NO_ID", /derived pair is asked of one inquiry/);

  const inv = await post("memberadd", { memberId: "tove", cover: "cover for tove", role: "admin",
    capabilities: ["contribute"] }, "adm-d641");
  t("(fixture) an invitation was issued", typeof inv.invite, "string");
  const enroll = (o) => post("enroll", { invite: inv.invite, handle: "tove", password: "a-long-passphrase", ...o }, null);
  wire("enroll with no handle", await enroll({ handle: "" }), "NO_HANDLE", /choose a handle/);
  wire("enroll with a handle outside the form", await enroll({ handle: "-Tove" }), "BAD_HANDLE");
  wire("enroll with a short password", await enroll({ password: "short" }), "PASSWORD_TOO_SHORT");

  wire("links naming neither a capture nor an address", await get("links"), "NEED_CAPTURE_OR_ADDRESS");
} finally {
  await mf.dispose();
}

console.log(`\nd641-reach-by-op-translation: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
