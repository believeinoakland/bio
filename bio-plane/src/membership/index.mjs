/* membership — who the members are and what each may do; projects as working groups, sight, and the fence.
 *
 * Requirements: build/requirements/membership.md (R4–R127; T42's R83 order (`doorbell`, `case-account`; T42-3, K2607, K2608)
 * and R60's hold acts at a hidden project's EXISTENCE, met through R44 and R85 (N833, K2484; `actions` asks them); T40's R127 `joinedParticipants` (K2404), R122 `notTheOwner`, R123–R125 the handle check, the
 * handle change and its guard, R126's rows, R16, R17, R55 and R57 as amended, and R83's order with `ai-use` (T40-M; N797,
 * N799, N812; DEC-184, DEC-186; K2373, K2376, K2394); T38's R116–R121, project-roster's seams and N793's
 * `noSuchMember` (T38-4; N783, N793, K2270, K2271, K2275), and R83's order with `project-roster`; T39's R83 order
 * (`doc-clean`, `setup-words`; T39-M, K2343); T34's R10–R13, R84 and R97–R111 (T34-10; DEC-132 to
 * DEC-136, K1745); T33's R83 order (T33-19a: plan T33's Rules (2), K1438, K1504);
 * T32's R83 order (wizard-scripts, N544, K1396); T28's R83
 * order (accepted-work, case-checker, case-import; K1292, K1299); T27's R83 order (docket, N520, K1256); T25's R83 order (attestation, provenance-routes,
 * reading-pipeline; N512, N513, K1219); T24's R83 order (link-sweep, K1185); T23's R83 order (corpus-export,
 * network-notices); T21's N453 deletions (the signer-key copies, K910); T20's N445 deletions and R96's figure source,
 * K861; T19's split, K637: sessions and passwords, signer keys and AI credentials are `credentials`', reached only
 * through R79's `onRevoked`, R94's `registerClaimed` and R95's `registerPasswordSetter`; N426's project fence (R43);
 * T17's N387; T16's N357 and N364; T15's N352 (R88); T14's N128 (R81), N327 (R84), N329 (R86) and N335 (R87);
 * T13's N324 (R84) and N332 (R85); T9's N123 (R79), N142 (R80) and N70's bounds). Extracted from the legacy store
 * (T3-2), which is gone since T19's close: the composition root (`plane`) builds this module and spreads its ops map.
 * Design: docs/architecture/BIO_Membership_Architecture_v2.md.
 *
 * SHAPE (K61). `membershipOf(ctx)` answers the one instance for a Durable Object's storage, over `ctx.storage.sql`,
 * and reaches record-core by `recordOf(ctx)` on the same `ctx` (`bundleInfo`, `declarePurge`, …); a test may
 * pass its own record-core as `membershipOf(ctx, { record })`. This module's
 * SQL joins record-core's `bundles` only on the stated read contract, `bundle_id` and `object_type`
 * (record-core R37); every other bundle fact (a project's title) is asked of `core.bundleInfo` (R34).
 */
import { MACHINE_CLASS_PREFIX, sha256HexSync } from "../record-grammar/index.mjs";
import { MEMBERSHIP_SCHEMA, MEMBERSHIP_ADDITIVE_COLUMNS, MEMBERSHIP_EXEMPT_TABLES,
         MEMBERSHIP_PROJECT_TABLES } from "./schema.mjs";
export { MEMBERSHIP_PROJECT_TABLES, MEMBERSHIP_EXEMPT_TABLES } from "./schema.mjs";
import { MEMBERSHIP_CHECKS, MEMBER_ID_CHECKS, CUSTODIAL_CHECKS, PROJECT_AUTHORITY_CHECKS, PROJECT_VISIBILITY_CHECKS,
         CASE_AUTHORITY_CHECKS, HANDLE_WORDS } from "./checks.mjs";
export { MEMBERSHIP_CHECKS, MEMBER_ID_CHECKS, CUSTODIAL_CHECKS, PROJECT_AUTHORITY_CHECKS, PROJECT_VISIBILITY_CHECKS,
         CASE_AUTHORITY_CHECKS, HANDLE_WORDS } from "./checks.mjs";
import { recordOf } from "../record-core/index.mjs";

/* The marker every generated statement carries (moved from query.mjs with `viewerPredicate`, K57). It is a SQL
   comment, so it changes nothing about what runs; the runtime test asserts each gated statement contains it. */
export const GATE_MARK = "/*viewer-gate*/";

/* R43. THE ONE RULE OF WHAT A VIEWER MAY SEE (Membership Architecture v2 §7.9), moved here from query.mjs (K57).
   A machine credential (the four token classes and an organisation-scoped `ai` credential) sees every bundle; a
   `member:<id>` viewer sees every bundle that is not a project, and a project only as a participant (any state) or as
   an active administrator; any other viewer sees nothing (fail closed).
   The predicate is written over the alias `b`, bound to record-core's `bundles` (its R37 read contract). `member`
   is the viewer's member id, null for every arm that is not an identified session (D-310).
   N357 (K494, W1): the founder's viewer is spelled bare `admin` or `member:admin` (the founder's positional
   spelling, `resolveSession`'s identity); both see what the founder's arm admits, and only the second names a member,
   `admin`. The founder has no roster row; its participation rows, when it owns or joined a project, are `admin`'s.
   N426 (K704, K710): THE PROJECT FENCE. A bundle that belongs to a project (record-core R34's `project`, which promotion
   writes from the document) is seen exactly when its project is: so an escalation's, a plan's or any project record's
   bundle read record-wide is fenced by the same arms that fence the project itself. The project a row is judged
   by is its own id for a project, and its `project` column for anything else (an empty one names none).
   D54 (Bob's "D54: B", K2408; hidden projects only, K2409; T41-3): an administrator, the founder included, sees a HIDDEN
   project, and every bundle belonging to it, only as a participant (invited or joined); a DISCOVERABLE project stays
   seen whole by administrators. The setting is read from `project_sight` (R85's index, the owners' latest act), so a
   project the index does not hold, and a bundle naming a project that is not one, reads hidden: seen by its
   participants and machine credentials alone (fail closed). At a hidden project's EXISTENCE an administrator learns
   its id, name and owners and nothing else (R44, R77). */
const OWN_PROJECT = `(CASE WHEN b.object_type = 'project' THEN b.bundle_id ELSE b.project END)`;
export function viewerPredicate(viewer) {
  const v = typeof viewer === "string" ? viewer : "";
  const CLS = MACHINE_CLASS_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`^(${CLS}(admin|member|probe|daemon|ai)|member:([A-Za-z0-9._:-]{1,128})|admin)$`).exec(v);
  if (!m) return { sql: `${GATE_MARK} 0=1`, args: [], viewer: null, scope: "DENY", member: null };
  const memberId = m[3] || null;
  const founder = v === Membership.ROOT_ADMIN || memberId === Membership.ROOT_ADMIN;
  if (!memberId && !founder)
    return { sql: `${GATE_MARK} 1=1`, args: [], viewer: v, scope: "member", member: null };
  /* The two arms every session shares: a bundle outside every project, and a project the viewer participates in. */
  const outside = `(b.object_type <> 'project' AND COALESCE(b.project, '') = '')`;
  const participant = `EXISTS (SELECT 1 FROM project_participants pp WHERE pp.project_id = ${OWN_PROJECT} AND pp.member_id = ?)`;
  const discoverable = `EXISTS (SELECT 1 FROM project_sight ps WHERE ps.project_id = ${OWN_PROJECT}
                                  AND ps.setting = 'discoverable')`;
  /* The administrator's arm (D54): a discoverable project only; the founder's viewer holds it always, an enrolled
     member while they are an active administrator. */
  const administers = founder ? discoverable
    : `(EXISTS (SELECT 1 FROM members am WHERE am.member_id = ? AND am.role = 'admin' AND am.status = 'active')
            AND ${discoverable})`;
  const who = founder ? Membership.ROOT_ADMIN : memberId;
  return {
    member: memberId,
    sql: `${GATE_MARK} (${outside} OR ${participant} OR ${administers})`,
    args: founder ? [who] : [who, who],
    viewer: v, scope: "participant",
  };
}

/* R88 (N352, K477). THE COMPLEMENT OF R43's RULE, spelled once: the bundles a viewer may NOT see, as a set to subtract
   (D-464, D-486). `null` when R43 lets the viewer see every bundle (its machine arm, scope `member`; since D54 no longer
   the founder's viewer, which is withheld the hidden projects it is not in), so there is nothing to subtract;
   otherwise `{sql, args}`, a parenthesised subquery over record-core's `bundles` (its R37 read contract) naming every
   bundle R43's compiled gate does not pass: every bundle, for a viewer R43 refuses; for the founder's viewer and an
   active administrator's, the hidden projects R43 withholds from them and the bundles belonging to them. It is
   the gate negated as a set, never a second rule, so a count taken through it and a read taken through
   `viewerPredicate` cannot disagree about who is hidden. A caller subtracts with `<key> NOT IN ${sql}` and binds `args`.
   What an absent viewer means stays the caller's: asked, it is R43's refusal and hides everything; an internal
   caller reads whole by not asking. Writes nothing and never throws. */
export function hiddenBundles(viewer) {
  const gate = viewerPredicate(viewer);
  if (gate.scope === "member") return null;
  return { sql: `(SELECT bundle_id FROM bundles EXCEPT SELECT b.bundle_id FROM bundles b WHERE (${gate.sql}))`,
           args: [...gate.args] };
}

/* R78 (N208, N146, K238, K275). THE ONE ANSWER TO ONE CONDITION: no project answers to `projectId`, or the caller's
   sight of it is not FULL (after R77's existence answer), answered as absent (R61, Membership Architecture v2 §7.9).
   Every act of any module answering that condition answers through here, so `NO_SUCH_PROJECT` is minted at one site
   and its one row is this module's (C-70.5). The detail is one fixed sentence, the same for every caller, so an absent
   id and a hidden one can never be told apart by it. `extra` adds a caller's own fields (such as `finding`) beside
   these and never replaces one of them. Writes nothing and never throws. */
const NO_SUCH_PROJECT_DETAIL = "no project answers to that id here. A project you cannot see is answered exactly as one "
  + "that does not exist (Membership Architecture v2 §7.9), so this is not a hint either way.";
const NO_SUCH_PROJECT_FIXED = new Set(["ok", "reason", "code", "check", "translation", "project", "detail"]);
export function noSuchProject(projectId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_PROJECT_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-project-seen */
  const row = MEMBERSHIP_CHECKS.NO_SUCH_PROJECT;
  return { ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check: row.check,
           translation: row.translation, project: projectId ?? null, ...Object.fromEntries(own),
           detail: NO_SUCH_PROJECT_DETAIL };
  /* END DEC-49 REGION is-project-seen */
}

/* R84 (N324, K275, K403; N327, DEC-83). THE ONE ANSWER TO ONE CONDITION: the stamped caller `by` is not an administrator
   (R64) where the act is an administrator's. Every act refusing that condition answers through here (R6, R7, R9, R10,
   R11, R12, R20, R22, R41 and R75; T34's R98–R100, R102, R103, R107 and R109; credentials' R6, R7 and R13; monitoring's R30, intent's R9, bias's R11), so
   `NOT_AN_ADMIN` is minted at one site and its one row is this module's (C-96.1). Who is admitted stays each act's own
   rule; this only answers the refusal. `act` is the caller's fixed phrase for its act, never a request's words; the
   detail is one fixed sentence around it. `extra` adds a caller's own fields beside these and never replaces one of them. An act with a
   next step or an alternative passes it as `extra.remedy`, one fixed sentence: the answer keeps it as `remedy`, and its
   member-facing `message` is the row's translation, a space, then the remedy (DEC-83: the standard sentence first, then
   what to do next or instead). `message` is this function's own, never a caller's; with no remedy there is none.
   Writes nothing and never throws. */
const NOT_AN_ADMIN_FIXED = new Set(["ok", "reason", "code", "check", "translation", "by", "detail", "message"]);
export function notAnAdmin(by, act, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NOT_AN_ADMIN_FIXED.has(k));
  } catch { own = []; }
  /* A remedy is a sentence: anything else a caller passes under the name adds nothing. */
  const given = own.find(([k]) => k === "remedy");
  const remedy = given && typeof given[1] === "string" && given[1].trim() ? given[1].trim().slice(0, 400) : null;
  own = own.filter(([k]) => k !== "remedy");
  const what = typeof act === "string" && act.trim() ? act.trim().slice(0, 120) : "this act";
  /* DEC-49 REGION is-custodial-admin */
  const row = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;
  return { ok: false, reason: "NOT_AN_ADMIN", code: "NOT_AN_ADMIN", check: row.check, translation: row.translation,
           by: by ?? null, ...Object.fromEntries(own),
           ...(remedy ? { remedy, message: `${row.translation} ${remedy}` } : {}),
           detail: `${what} is an administrator's act (Membership Architecture v2 §4.9), and your group's Civicsmith `
                 + "takes who is asking from the signed-in session rather than from the caller. This caller is not "
                 + "one of the active administrators. Nothing was changed." };
  /* END DEC-49 REGION is-custodial-admin */
}

/* R87 (N335, K275). THE ONE ANSWER TO ONE CONDITION: the caller `by` holds no participation in the project (Membership
   Architecture v2 §7.12). `projectLeave` (R35) here and promotion's fork (its R43) answer through it, so
   `NOT_A_PARTICIPANT` is minted at one site and its one row is this module's (C-56.3). A named TARGET holding none, or
   one not joined, is a different condition with its own code (R36, R39). `project` is the id as asked (null when none);
   the detail is one fixed sentence, the same for every caller. `extra` adds a caller's own fields beside these and never
   replaces one of them. Writes nothing and never throws. */
const NOT_A_PARTICIPANT_DETAIL = "the caller holds no participation in this project, and this act is taken by one of its "
  + "participants (Membership Architecture v2 §7). Nothing was changed.";
const NOT_A_PARTICIPANT_FIXED = new Set(["ok", "reason", "code", "check", "translation", "project", "detail"]);
export function notAParticipant(projectId, by, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NOT_A_PARTICIPANT_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-not-a-participant */
  const row = MEMBERSHIP_CHECKS.NOT_A_PARTICIPANT;
  return { ok: false, reason: "NOT_A_PARTICIPANT", code: "NOT_A_PARTICIPANT", check: row.check,
           translation: row.translation, project: projectId ?? null, ...Object.fromEntries(own),
           detail: NOT_A_PARTICIPANT_DETAIL };
  /* END DEC-49 REGION is-not-a-participant */
}

/* N793 (K231; T38-4). THE ONE ANSWER TO ONE CONDITION: no member answers to the id (or name) a caller was given. This
   module owns `members`, so `NO_SUCH_MEMBER` is minted here alone and its one row is this module's (C-96.47; K2279); every act
   of any module refusing that condition answers through here (this module's eight; credentials, tasks, setup-page,
   instance-setup and control-plane in their own jobs). `member` is the id as asked (null when none); the detail is one
   fixed sentence, the same for every caller. `extra` adds a caller's own fields beside these and never replaces one of
   them. Writes nothing and never throws. */
const NO_SUCH_MEMBER_DETAIL = "no member of your group answers to that id here. Nothing was changed.";
const NO_SUCH_MEMBER_FIXED = new Set(["ok", "reason", "code", "check", "translation", "member", "detail"]);
export function noSuchMember(memberId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_MEMBER_FIXED.has(k));
  } catch { own = []; }
  let member = null;
  try { member = memberId === null || memberId === undefined ? null : String(memberId).slice(0, 200); } catch { member = null; }
  /* DEC-49 REGION is-no-such-member */
  const row = MEMBERSHIP_CHECKS.NO_SUCH_MEMBER;
  return { ok: false, reason: "NO_SUCH_MEMBER", code: "NO_SUCH_MEMBER", check: row.check,
           translation: row.translation, member, ...Object.fromEntries(own), detail: NO_SUCH_MEMBER_DETAIL };
  /* END DEC-49 REGION is-no-such-member */
}

/* R122 (N812; K231). THE ONE ANSWER TO ONE CONDITION: the caller `by` is not an owner of the project where the act is
   an owner's. `projectAuthority` (R55) here and `credentials` (its R54–R57) answer through it, so
   `PROJECT_ACT_NOT_THE_OWNER` is minted at one site and its one row is this module's (C-56.2). Shaped as R84's
   `notAnAdmin`: `by` as given (null when none), `project` the id as asked (null when none), `detail` one fixed sentence,
   the same for every caller; `extra` adds a caller's own fields (such as `act` and `needs`) and never replaces these, and
   a caller with a next step passes `remedy`, one sentence, kept as `remedy` with `message` the row's translation, a
   space, then the remedy (DEC-83). Who is an owner stays each act's own rule (R54); this only answers the refusal.
   Writes nothing and never throws. */
const NOT_THE_OWNER_DETAIL = "this is an act an owner of the project performs, and the caller is not one of its owners. "
  + "Seeing a project is not directing it: an administrator directs no project, whatever it sees (Membership "
  + "Architecture v2 §4.9, §7). Nothing was changed.";
const NOT_THE_OWNER_FIXED = new Set(["ok", "reason", "code", "check", "translation", "by", "project", "detail", "message"]);
export function notTheOwner(by, projectId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NOT_THE_OWNER_FIXED.has(k));
  } catch { own = []; }
  const given = own.find(([k]) => k === "remedy");
  const remedy = given && typeof given[1] === "string" && given[1].trim() ? given[1].trim().slice(0, 400) : null;
  own = own.filter(([k]) => k !== "remedy");
  const echo = (v) => { try { return v === null || v === undefined ? null : String(v).slice(0, 200); } catch { return null; } };
  /* DEC-49 REGION is-not-the-owner */
  const row = PROJECT_AUTHORITY_CHECKS.PROJECT_ACT_NOT_THE_OWNER;
  return { ok: false, reason: "PROJECT_ACT_NOT_THE_OWNER", code: "PROJECT_ACT_NOT_THE_OWNER", check: row.check,
           translation: row.translation, by: echo(by), project: echo(projectId), ...Object.fromEntries(own),
           ...(remedy ? { remedy, message: `${row.translation} ${remedy}` } : {}),
           detail: NOT_THE_OWNER_DETAIL };
  /* END DEC-49 REGION is-not-the-owner */
}

/* R83 (K289): the modules' total order, `build/modules.json`'s ids in the file's order (which is its layer order, K270).
   Product code cannot read `build/` at run time, so it is held here, the one list every module orders its listeners by
   (this module's R79; promotion, provenance and the later modules import it); this module's R83 test holds it equal to
   the file, so a change there fails the suite until the list follows. T33-19a (K1438, K1504): re-pinned to plan T33's
   Rules (2), its new modules in their places, `local-facts` and `standards` in layer 5 and `observation-log` after
   `connections`. A module the file lists before its job has built it is held here in its place all the same, so its
   listeners order correctly from the day it registers; R83's test names it as not yet built until its merge. T35-14,
   T36-6 (N697, N723; K1864, K1961, K2008): every module the file names is held, whether or not it registers one.
   T37-44 (K1185, K2171): `image-cover` after `pdf-pixels` in layer 1, as T37's opening placed it. T38-4 (N783; K657,
   K1185, K2270): `project-roster` in layer 2, directly after `membership` and before `credentials`. T39-M (N806, N807;
   K657, K2333, K2343): `doc-clean` after `image-cover` in layer 1, `setup-words` before `instance-setup` in layer 11.
   T40-M (N812 B10; K657, K2373, K2389): `ai-use` after `run-rules` in layer 6, before `ai-runs`. T41-3 (N820, N823;
   K657, K2431): `steps` after `hypotheses`, `reading-guides` after `capture-requests` and `question-explorer` after
   `skills` in layer 6, `investigation` after `intent` in layer 7, `publish-schedule` after `publication` in layer 8.
   T42-3 (N826, N839; K657, K2607, K2608): `doorbell` after `capture` in layer 3, `case-account` after
   `case-disclosures` and before `case-authoring` in layer 8. */
export const MODULE_ORDER = Object.freeze([
  /* 1 */ "record-grammar", "jurisdictions", "civil-time", "calc-grammar", "connection-grammar", "test-support",
          "runtime-limits", "signatures", "bundler", "court-citations", "id-spaces", "subresources", "ooxml",
          "office-readers", "odf-reader", "pdf-reader", "format-registry", "text-chain", "site-profiles", "docprofile",
          "doctypes", "legistar-reader", "roster-reader", "court-doctypes", "budget-doctypes", "image-codecs",
          "pdf-pixels", "image-cover", "doc-clean", "pdf-worker", "ocr-worker", "sheet-worker", "file-scanner",
  /* 2 */ "record-core", "membership", "project-roster", "credentials", "promotion",
  /* 3 */ "host-governor", "provenance", "attestation", "provenance-routes", "capture-sources", "acquisition",
          "capture", "doorbell", "file-safety", "sources",
  /* 4 */ "calibration", "reading-pipeline", "extraction", "content",
  /* 5 */ "entities", "events", "lines", "local-facts", "connections", "observation-log", "law-relations", "standards",
          "progressions", "money", "money-checks", "duties", "people", "explore", "bias", "query-language", "retrieval",
          "calculations", "workbooks",
  /* 6 */ "inquiry-grammar", "accepted-work", "leg-earning", "inquiry", "hypotheses", "steps", "citation",
          "basis-versions", "strength", "contradiction", "run-rules", "ai-use", "ai-runs", "run-productions",
          "capture-requests", "reading-guides", "skills", "question-explorer", "answers", "agent-harness", "agent-model",
          "agent-runner", "agent-worker",
  /* 7 */ "intent", "investigation", "reevaluation",
  /* 8 */ "case-grammar", "corpus-export", "case-carriage", "case-tensions", "publication", "publish-schedule",
          "docket", "public-read", "project-stage", "network-notices", "case-catalogue", "ratification", "case-checker", "case-import",
          "case-disclosures", "case-account", "case-authoring", "review",
  /* 9 */ "conformance", "consequences", "action-grammar", "actions", "action-clocks", "filing-templates", "filings",
          "escalation", "action-plans",
  /* 10 */ "monitoring", "following", "link-sweep", "scheduler",
  /* 11 */ "wizard-scripts", "op-grades", "affordances", "tasks", "machinery-producers", "queue-producers",
           "notice-producers", "queue", "setup-page", "setup-words", "instance-setup", "op-declarations", "admission",
           "answer-envelope", "store-door", "control-plane", "plane", "legacy-ui", "installer",
]);

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const LISTENER_REFUSAL_FIELDS = new Set(["ok", "reason", "code", "detail", "module", "check", "translation"]);

/** R81 (N202, K231, K285; moved from promotion's R49, membership being the earliest module that registers listeners,
 *  K275): the one site that mints LISTENER_MALFORMED and LISTENER_DECLARED. Every registration of a listener asks it
 *  before recording the registration: this module's (R79), promotion's (through its R49) and every later module's.
 *  `held` is what the caller already holds for the slot: a list of `{module}`, or, for a slot that takes one
 *  registration whoever makes it, that one registration or null. Answers the refusal, with `extra` (the caller's own
 *  fields) beside its own and never replacing them, and its row's `check` and `translation` (this module's C-102.11
 *  and C-102.12, N128); else null. Writes nothing and never throws. (Promotion's built text, moved as it was, K285.) */
export function listenerRefusal(held, module, fn, extra) {
  const refuse = (code, detail, fields) => {
    const row = MEMBERSHIP_CHECKS[code];
    /* The refusal's own fields, its row's `check` and `translation` among them, are never the caller's. */
    let own = {};
    try {
      if (isObj(extra)) own = Object.fromEntries(Object.entries(extra).filter(([k]) => !LISTENER_REFUSAL_FIELDS.has(k)));
    } catch { own = {}; }
    return { ...own, ok: false, reason: code, code, detail, ...fields, check: row.check, translation: row.translation };
  };
  /* DEC-49 REGION is-listener-registration */
  /* Each code is written once (one site per code, K275), and every branch below answers through these two. */
  const malformed = (detail) => refuse("LISTENER_MALFORMED", detail, {});
  const declared = (detail, holder) => refuse("LISTENER_DECLARED", detail, { module: holder });
  try {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return malformed("a listener names the module that registers it and its function");
    if (Array.isArray(held)) {
      if (held.some((h) => isObj(h) && h.module === module))
        return declared(`${module} has already registered its listener`, module);
      return null;
    }
    if (isObj(held)) {
      const holder = typeof held.module === "string" ? held.module : null;
      return declared(`this listener is already registered${holder ? ` by ${holder}` : ""}, and it takes one `
                      + `registration`, holder);
    }
    return null;
  } catch (e) {
    return malformed(`the registration could not be read: ${String(e && e.message ? e.message : e).slice(0, 200)}`);
  }
  /* END DEC-49 REGION is-listener-registration */
}

export class Membership {
  constructor({ sql, core = null } = {}) {
    this.sql = sql;
    this.core = core;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* A project's title, asked of record-core (R34): membership's SQL reads no bundle column but the R37 contract. */
  #titleOf(bundleId) {
    const info = this.core && typeof this.core.bundleInfo === "function" ? this.core.bundleInfo(bundleId) : null;
    return info && typeof info.title === "string" ? info.title : null;
  }

  /* This module's tables, at every boot (R57, R58, R115), idempotent: `members.name` renamed to `cover` (2026-07-24);
     every table and index created if absent; the additive columns an older store lacks added; the vestigial
     `members.expertise` column dropped (K57: `member_expertise` is the record, R21–R24); the tables declared to
     record-core's purge (R115) when its `declarePurge` is present; and the sight index recomputed whole from the owners'
     acts (D-497: a derivation, so an index that disagreed with `project_visibility` cannot survive a restart; moved
     here from the legacy store's boot, T19). Run by the host inside its boot, after record-core's schema. */
  migrate() {
    const cols = (t) => [...this.sql.exec(`PRAGMA table_info(${t})`)].map((r) => r.name);
    const memberCols = cols("members");
    if (memberCols.includes("name") && !memberCols.includes("cover"))
      this.sql.exec(`ALTER TABLE members RENAME COLUMN name TO cover`);
    const addColumns = () => {
      for (const [table, column, decl] of MEMBERSHIP_ADDITIVE_COLUMNS) {
        const have = cols(table);
        if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();   // before the CREATE INDEX statements, which name added columns (REC-143's lesson)
    const bare = MEMBERSHIP_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    if (cols("members").includes("expertise")) this.sql.exec(`ALTER TABLE members DROP COLUMN expertise`);
    this.declareTables();
    this.#registerReservedIdFinding();
    /* No `bundles` table yet means no project to index (a host whose record-core has not made its schema). */
    if (cols("bundles").length) this.reindexProjectSight();
  }

  /* R115 (was R59), through record-core's `declarePurge` (its R21) once record-core provides it. */
  declareTables() {
    if (this.#declared) return false;
    /* record-core R21/R46: the project-keyed tables, keyed to a bundle (the project) by `project_id`, and the
       exempt ones named once, as exempt. Its answer is read: a refusal (a table another module declared) is
       thrown, because a purge that silently skipped these tables would leave the participation graph behind. */
    const answer = this.core.declarePurge("membership",
      MEMBERSHIP_PROJECT_TABLES.map((name) => ({ name, keys: ["project_id"] })),
      { exempt: [...MEMBERSHIP_EXEMPT_TABLES] });
    if (answer && answer.ok === false)
      throw new Error(`membership: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }
  #declared = false;

  /* ===== R96 (K861; plane R10) — THIS MODULE'S SHARE OF THE INSTANCE'S FIGURES =====
   *
   * The figures `op=stats` and purge's proof report of this module's project-keyed tables (REC-27, D-137: the
   * participation graph and the pending owner votes, so a purge can PROVE it took them), shaped as record-core R63's
   * `counts(hid)` with its key list, which `plane` registers under this module's name (`registerCounts("membership",
   * [...Membership.COUNT_KEYS], (hid) => m.counts(hid))`, plane R10), so this module registers nothing itself and no
   * figure is registered twice. `hid` is R63's: R88's `hiddenBundles(viewer)`, the bundles the caller may not see, or
   * null for a caller that sees every bundle and for the direct internal call (purge's proof among them), which count
   * whole. Each table drops the rows whose `project_id` is in `hid` (D-464: a count over
   * rows the caller could not all read is a disclosure of existence). `COALESCE(project_id, '')`: a NULL key names no
   * bundle, and `NULL NOT IN (…)` is NULL, so without it the row would be dropped. Synchronous; writes nothing. */
  static COUNT_KEYS = Object.freeze(["projectParticipants"]);

  counts(hid = null) {
    const n = (table) => (hid
      ? this.#one(`SELECT count(*) c FROM ${table} WHERE COALESCE(project_id, '') NOT IN ${hid.sql}`, ...hid.args)
      : this.#one(`SELECT count(*) c FROM ${table}`)).c;
    return { projectParticipants: n("project_participants") };
  }

  /* REC-132 / D-422 / C-55: A MEMBER HOLDING THE RESERVED ID IS REPORTED BY THE AUDIT, NEVER RENAMED (moved from the
     legacy store's `auditPass`, T19, through record-core's R68 seam). `memberAdd` refuses the id `admin` (R12), but an
     instance that enrolled one before the reservation still holds it, and every name-keyed check reads it as the
     founder. Renaming it would rewrite who the record says acted, so the audit SAYS it and an administrator decides.
     Always answered under the key `membership`, so "none held" and "this build does not look" never read alike; a
     stated finding, never a conformance error. It names only the reserved id, which is public, and that row's role
     and status. Registered once; a host whose record-core does not offer the seam registers nothing. */
  #registerReservedIdFinding() {
    if (this.#findingRegistered || !this.core || typeof this.core.registerAuditFinding !== "function") return;
    this.core.registerAuditFinding("membership", "membership", () => this.#reservedIdFinding());
    this.#findingRegistered = true;
  }
  #findingRegistered = false;

  #reservedIdFinding() {
    const id = Membership.ROOT_ADMIN;
    const m = this.#one(`SELECT role, status FROM members WHERE member_id = ?`, id);
    return {
      reservedId: id, held: !!m, role: m ? m.role : null, status: m ? m.status : null,
      check: MEMBER_ID_CHECKS.MEMBER_ID_RESERVED.check,
      says: m
        ? `a member is enrolled under the reserved id '${id}' (role ${m.role}, status ${m.status}). `
          + `Every check that asks whether someone administers by name reads it as the founding `
          + `administrator. It was enrolled before the id was reserved and has NOT been renamed: an `
          + `administrator should decide what it is and re-enrol the person under another id`
        : `no member holds the reserved id '${id}'`,
    };
  }

  /* ===== R79 (N123, K159, K285) — THE REVOCATION NOTICE (K31's pattern) =====
   *
   * A later module that holds something a member's standing grants (capture-sources' `member` credentials, its R63)
   * registers once at start, and is told the moment a member is revoked, inside the revoking act: R8's carried
   * removal and R20's revocation. The notice is `{memberId, by, at}`, the act's own actor and time. It is called after
   * the act's writes, in the caller's transaction, once per listener in the modules' total order (`MODULE_ORDER`; an
   * unknown module last, in the order it registered). A listener's answer is not read, and one that throws changes
   * neither the revocation, its answer, nor another listener's notice: the listener's module still meets the revoked
   * status at its own next read (capture-sources R63), so a failure here is never a credential kept. A write that
   * leaves a revoked member revoked notifies nobody. Registration's refusals are R81's. */
  #revokedListeners = [];   // {module, fn, seq}

  onRevoked(module, fn) {
    const refused = listenerRefusal(this.#revokedListeners, module, fn);
    if (refused) return refused;
    this.#revokedListeners.push({ module, fn, seq: this.#revokedListeners.length });
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    this.#revokedListeners.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  #announceRevoked(memberId, by, at) {
    for (const l of this.#revokedListeners) {
      try {
        const r = l.fn({ memberId, by: by ?? null, at });
        if (r && typeof r.then === "function") r.then(null, () => {});
      } catch { /* a listener's failure never changes the revocation or another listener's notice */ }
    }
  }

  /* ===== Services later modules read (K57, R64–R73), and the canon rules N18 built (R10, R11, R18, R19) ===== */

  /* R64: the founder (`admin`, once the instance is claimed) and every active member with role `admin`. */
  isAdministrator(memberId) {
    if (memberId === Membership.ROOT_ADMIN) return this.#claimed();
    if (typeof memberId !== "string" || memberId === "") return false;
    const m = this.#one(`SELECT role, status FROM members WHERE member_id=?`, memberId);
    return !!m && m.role === "admin" && m.status === "active";
  }

  /* ===== R94 (K637) — WHETHER THE INSTANCE IS CLAIMED, A FACT `credentials` STATES (its R17) =====
   *
   * The founder is an administrator, and first in R86's list, exactly when the instance is claimed: the founder's
   * credential is held. That credential is `credentials`', so membership never reads it; one later module registers,
   * once at start, the function that answers it, and R64 and R86 ask that function. Anything but `true`, a throw, or
   * no registration at all reads as not claimed (fail closed: the founder is then no administrator here). The slot
   * takes one registration whoever makes it, so its refusals are R81's, naming the holder. */
  #claimedSource = null;   // {module, fn}

  registerClaimed(module, fn) {
    const refused = listenerRefusal(this.#claimedSource, module, fn);
    if (refused) return refused;
    this.#claimedSource = { module, fn };
    return { ok: true, module };
  }

  /* ===== R95 (K774) — THE PASSWORD AN ENROLMENT SETS, A WRITE `credentials` MAKES (its R20) =====
   *
   * Enrolment (R16) is one act: the member chooses a handle and a password, becomes active and spends the invitation.
   * The password is `credentials`', so membership never stores one; one module registers, once, the setter `enroll`
   * calls inside its act, `fn({role, password})`. Its refusals are R81's: a setter that is not a function is
   * LISTENER_MALFORMED, a second registration LISTENER_DECLARED naming the holder (`module`, when the registrant names
   * itself). */
  #passwordSetter = null;   // {module, fn}

  registerPasswordSetter(fn, module = "credentials") {
    const refused = listenerRefusal(this.#passwordSetter, typeof module === "string" && module ? module : "credentials", fn);
    if (refused) return refused;
    this.#passwordSetter = { module, fn };
    return { ok: true, module };
  }

  /* The enrolment's password write: the registered setter, answering true when it wrote; with none registered,
     nothing can be written, and the enrolment is refused before membership writes anything. */
  async #setEnrolmentPassword(role, password) {
    const setter = this.#passwordSetter;
    if (!setter) return false;
    try {
      const r = await setter.fn({ role, password });
      return !(r && typeof r === "object" && r.ok === false);
    } catch { return false; }
  }

  #claimed() {
    const source = this.#claimedSource;
    if (!source) return false;
    try { return source.fn() === true; } catch { return false; }
  }

  /* R68: a member's cover, handle, role and status, or null; never a credential, key or expertise. */
  memberFacts(memberId) {
    const m = this.#one(`SELECT cover, handle, role, status FROM members WHERE member_id=?`, memberId);
    return m ? { cover: m.cover, handle: m.handle ?? null, role: m.role, status: m.status } : null;
  }

  /* R69: the member ids of the project's participants who have joined (not leaving, not invited) and are active. */
  activeParticipants(projectId) {
    return this.#rows(`SELECT p.member_id FROM project_participants p JOIN members m ON m.member_id = p.member_id
                        WHERE p.project_id=? AND p.state='joined' AND m.status='active' ORDER BY p.member_id`,
      projectId).map((r) => r.member_id);
  }

  /* R71: what `promotion` calls when a promotion creates a project, inside the caller's transaction: `ownerId`
     (a member; a machine-created project has no owner, §7.1) becomes the sole initial owner as R31 makes one,
     the creation visibility is recorded as the first R45 record, and the project's sight is reindexed. */
  projectCreated({ projectId, ownerId = null, visibility = null, by = null } = {}) {
    if (visibility !== null && visibility !== undefined) {
      const bad = this.visibilitySettingRefusal(visibility, projectId);
      if (bad) return bad;
    }
    const at = new Date().toISOString();
    let owner = null;
    if (ownerId) {
      const claimed = this.projectClaimOwner({ projectId, memberId: ownerId });
      if (!claimed.ok) return claimed;
      owner = ownerId;
    }
    if (visibility !== null && visibility !== undefined)
      this.sql.exec(`INSERT INTO project_visibility (project_id, setting, set_by, reason, at) VALUES (?,?,?,?,?)`,
        projectId, String(visibility), by ?? ownerId ?? "not recorded", "chosen at creation", at);
    this.reindexProjectSight(projectId);
    return { ok: true, projectId, owner, setting: this.visibilityOf(projectId) };
  }

  /* R10 (section 4.5; DEC-134 (4)): an administrator — never the founder, whose standing is the hosting account's
     (4.6) — resigns, becoming an ordinary member, unless they are the last administrator R86 lists (the founder counted
     once the instance is claimed). The refusal at two (`RESIGN_AT_TWO`, C-96.10) is retired: one administrator is
     enough (DEC-134 (1)), and only the group left with none is refused (`LAST_ADMIN`, C-96.22). */
  adminResign({ by = null } = {}) {
    if (by === Membership.ROOT_ADMIN)
      return { ok: false, reason: "ROOT_OF_TRUST",
               detail: "the founding administrator holds ADMIN_TOKEN and does not resign inside the application; the "
                     + "remedy is at the hosting account (section 4.6). Nothing was written." };
    const m = typeof by === "string" && by ? this.#one(`SELECT role, status FROM members WHERE member_id=?`, by) : null;
    if (!m || m.role !== "admin" || m.status !== "active") return notAnAdmin(by, "resigning administrator status");   /* R84 */
    const admins = this.activeAdmins();
    /* DEC-49 REGION is-admin-resign-last */
    if (admins.length <= 1)
      return Membership.#rowRefusal("LAST_ADMIN",
        "the group would be left with no administrator, so its last one does not step down (DEC-134 (4)). Add "
      + "another administrator first. Nothing was written.", { administrators: admins.length });
    /* END DEC-49 REGION is-admin-resign-last */
    const now = new Date().toISOString();
    this.sql.exec(`UPDATE members SET role='member', status_by=?, updated=? WHERE member_id=?`, by, now, by);
    return { ok: true, memberId: by, role: "member", administrators: admins.length - 1,
             detail: "resigned: an ordinary member now, holding the capabilities an administrator last set for them." };
  }

  /* R11 (section 4.8; DEC-134 (3)): the group's answer to who holds hosting access. It is asked at setup
     (`instance-setup`'s act), never on adding an administrator, so `memberAdd` asks nothing about it. The group's answer, recorded by an administrator; append-only, the latest record is the answer. */
  hostingAccessSet({ holders = null, note = null, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "recording who holds hosting access (4.8)");   /* R84 */
    const refusal = (code, detail, extra) => Membership.#custodialRefusal(code, detail, extra);   /* C-96.11 */
    /* DEC-49 REGION is-hosting-access-holders — N195: the whole refusal, the holders' reading with it. */
    const h = String(holders ?? "").trim().slice(0, 500);
    if (!h)
      return refusal("NO_HOLDERS",
        "name who holds hosting access: the record keeps the group's answer as it was given, and an empty "
      + "answer records nobody. Nothing was written.");
    /* END DEC-49 REGION is-hosting-access-holders */
    const at = new Date().toISOString();
    const n = note === null || note === undefined || String(note).trim() === "" ? null : String(note).slice(0, 280);
    this.sql.exec(`INSERT INTO hosting_access (holders, note, recorded_by, at) VALUES (?,?,?,?)`, h, n, by, at);
    return { ok: true, holders: h, note: n, recorded_by: by, at };
  }

  /* N70: BOUNDED, AND THE BOUND IS PUBLISHED (R48's shape): the history grows with every answer the group records, so
     `limit` is the cap applied (the caller may lower it, never raise it), `truncated` is measured by reading one row
     past it, and the page is the first `limit` records in the order they were recorded. `current`, the latest
     record, is read on its own, so a cut history never changes what the answer is. */
  hostingAccess({ limit = null } = {}) {
    const cap = Math.max(1, Math.min(Number(limit) || Membership.HOSTING_ACCESS_LIMIT, Membership.HOSTING_ACCESS_LIMIT));
    const found = this.#rows(`SELECT holders, note, recorded_by, at FROM hosting_access ORDER BY seq LIMIT ?`, cap + 1);
    const truncated = found.length > cap;
    const current = this.#one(`SELECT holders, note, recorded_by, at FROM hosting_access ORDER BY seq DESC LIMIT 1`);
    return { ok: true, recorded: current !== null, current, history: truncated ? found.slice(0, cap) : found,
             limit: cap, truncated };
  }

  /* N70: the history's page size, a chosen ceiling (the directory's reasoning, now `project-roster`'s): generous enough that a
     group reading who holds its hosting access rarely meets it, published whenever it cuts. */
  static HOSTING_ACCESS_LIMIT = 200;

  /* R19 (section 3, "Pairing"): whether a member's cover-and-handle pairing is published is a per-member decision
     the member or an administrator may make. The roster's cover stays an administrator's view (R17); the published
     pairings are read with `memberPairings`. */
  memberPairingSet({ memberId, published, by = null } = {}) {
    const m = this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    const refusal = (code, detail, extra) => Membership.#custodialRefusal(code, detail, extra);   /* C-96.12 */
    /* DEC-49 REGION is-pairing-yours */
    if (by !== memberId && !this.isAdministrator(by))
      return refusal("PAIRING_NOT_YOURS",
        "whether a pairing is published is the member's own decision or an administrator's (section 3). "
      + "Nothing was written.", { by });
    /* END DEC-49 REGION is-pairing-yours */
    const want = published === true || published === 1 || published === "1" || published === "true";
    this.sql.exec(`UPDATE members SET pairing_published=?, updated=? WHERE member_id=?`,
      want ? 1 : 0, new Date().toISOString(), memberId);
    return { ok: true, memberId, published: want, by };
  }

  /* R19 (N85, K124): what each viewer may see of the pairings. A published pairing reaches every caller; one its
     member has not published reaches only that member and the administrators. `viewer` is the control plane's viewer
     stamp and `administer` its administer stamp (memberList's, D-157): an administrator is one the stamp says
     administers, the founder's viewer once the instance is claimed, or a viewer naming an active administrator.
     Fails closed: with neither stamp a caller is shown the published pairings alone. */
  /* N70: bounded as `hostingAccess` is: the first `limit` pairings by handle (200 at most, the caller's to lower),
     `truncated` measured by reading one row past the cap. */
  memberPairings({ viewer = null, administer = null, limit = null } = {}) {
    const self = this.positionalMember(viewer);
    const admin = administer === true || administer === "1"
      || (viewer === Membership.ROOT_ADMIN && this.isAdministrator(Membership.ROOT_ADMIN))
      || (self !== null && this.isAdministrator(self));
    const cap = Math.max(1, Math.min(Number(limit) || Membership.MEMBER_PAIRINGS_LIMIT, Membership.MEMBER_PAIRINGS_LIMIT));
    const found = this.#rows(
      `SELECT handle, cover, pairing_published FROM members
        WHERE handle IS NOT NULL AND (pairing_published=1 OR ? OR member_id=?) ORDER BY handle LIMIT ?`,
      admin ? 1 : 0, self, cap + 1).map((r) => ({ handle: r.handle, cover: r.cover, published: r.pairing_published === 1 }));
    const truncated = found.length > cap;
    return { ok: true, pairings: truncated ? found.slice(0, cap) : found, limit: cap, truncated };
  }

  static MEMBER_PAIRINGS_LIMIT = 200;

  /* R18 (section 7.8; D54, T41-3): the projects a member participates in, for an administrator's roster, as the
     administrator reading it (`viewer`) sees them: each project that administrator sees at FULL (R44), and, of a
     hidden project it does not, only the member's ownership, which that administrator's EXISTENCE already shows
     (`{project, state: null, owner: true, existence: true}`); a hidden project's other participants are never listed
     to an administrator neither invited nor joined to it. With no viewer stamped, the roster is read as an
     administrator in no project would read it (fail closed): discoverable projects whole, hidden ones by owner only. */
  #projectsOf(memberId, viewer) {
    const full = (p) => (viewer === null || viewer === undefined
      ? this.visibilityOf(p) === "discoverable" : this.inSight(p, viewer));
    const out = [];
    for (const p of this.#rows(`SELECT project_id, state, owner FROM project_participants WHERE member_id=?
                                 ORDER BY project_id`, memberId)) {
      if (full(p.project_id)) out.push({ project: p.project_id, state: p.state, owner: !!p.owner });
      else if (p.owner && this.visibilityOf(p.project_id) === "hidden")
        out.push({ project: p.project_id, state: null, owner: true, existence: true });
    }
    return out;
  }

  static async #sha256(v) {
    const b = await crypto.subtle.digest("SHA-256", Membership.#enc.encode(v));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  /** REC-132 / D-422 — WHO IS ASKING, as distinct from WHAT THEY MAY SEE.
   *  `identity` is the POSITIONAL half of the control plane's one session resolver
   *  (admission's `resolveSession`, `src/admission/index.mjs`): `member:<id>` for a signed-in session,
   *  the founder's included (`member:admin`), and the same string as the viewer for
   *  every credential that is not a session. When it is absent — a caller that never
   *  stamps it, the store's own internal reads — the viewer is asked, which is exactly
   *  what every site here asked before, so such a caller is byte-unchanged. A
   *  `class:*` or unrecognised identity answers null: no roster position, no author.
   *  EVERY positional question a viewer-carrying read asks in this file goes through
   *  here, and a visibility question never does. */
  positionalMember(viewer, identity = null) {
    const asked = typeof identity === "string" && identity !== "" ? identity : viewer;
    const g = viewerPredicate(asked);
    return g.scope === "DENY" ? null : g.member;
  }

  static #enc = new TextEncoder();

  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /* What a session may DO. Membership Architecture v2 section 5.
   *
   * Resolved HERE, at the point the session is read, rather than cached on the
   * session row: a capability change has to take effect on the next request and
   * not on the next login, or an administrator revoking `publish` from someone
   * mid-incident would be revoking it in eight hours' time.
   *
   * THE FOUNDER HOLDS EVERYTHING, and that is 4.6 rather than convenience. The
   * holders of ADMIN_TOKEN are the root of trust and every rule in the
   * membership model sits beneath them. 4.6 also forbids any interface implying
   * otherwise, so reporting them as capability-bounded would be a lie in the
   * one place it matters.
   *
   * AN IN-APP ADMINISTRATOR HOLDS EVERY WORKING CAPABILITY. v2 section 5,
   * confirmed 2026-07-26. Not read from their row, and deliberately: `memberCaps`
   * refuses to touch an administrator's row at all, to protect 4.4, so if the row
   * were consulted an administrator's powers would be frozen forever at whatever
   * their invitation happened to set, and an administrator invited with the
   * default `["contribute"]` could never publish and could never be granted
   * permission to. A field nobody can edit is not a variable. Reading it as not
   * consulted is the only reading with no trap in it.
   *
   * FAIL CLOSED everywhere else. An unrecognised role, a member row that is
   * gone, or a member whose status is not active resolves to NO capabilities
   * rather than to the member default. Revocation already deletes sessions; this
   * is what covers the race between the delete and an in-flight request.
   *
   * R92 (K637): a named service, `credentials`' `session` reads it for every session (its R5). It writes nothing and
   * never throws: a read it cannot make holds no rights.
   */
  sessionRights(role) {
    const none = { capabilities: [], administer: false, member: null, handle: null, rootOfTrust: false };
    try { return this.#rightsOf(role, none); } catch { return none; }
  }

  #rightsOf(role, none) {
    if (role === Membership.ROOT_ADMIN)
      return { capabilities: [...Membership.CAPABILITIES], administer: true,
               member: Membership.ROOT_ADMIN, handle: null, rootOfTrust: true };
    if (typeof role !== "string" || !role.startsWith("member:")) return none;
    const id = role.slice(7);
    const m = this.#one(
      `SELECT member_id, handle, role, status, capabilities FROM members WHERE member_id=?`, id);
    if (!m || m.status !== "active") return { ...none, member: id };
    const admin = m.role === "admin";
    return {
      capabilities: admin ? [...Membership.CAPABILITIES] : this.#capsOf(m),
      administer: admin, member: id, handle: m.handle ?? null, rootOfTrust: false,
    };
  }

  /* ---- project participation, Architecture section 7 ----
   *
   * The evidence corpus stays shared: Information and Problems remain visible to
   * the group generally, because compartmenting evidence would fracture the
   * thing the record exists to be. What participation scopes is the group's
   * THINKING, which is the material with strategic value before publication.
   */
  /* R119 (N783): the member whose handle is exactly `handle`, `{member_id, handle, status}`, or null. R32, R36 and
     `project-roster` R3–R5 and R12 resolve a handle through it. Writes nothing and never throws. */
  memberByHandle(handle) {
    if (typeof handle !== "string" || handle === "") return null;
    try {
      const r = this.#one(`SELECT member_id, handle, status FROM members WHERE handle=?`, handle);
      return r ? { member_id: r.member_id, handle: r.handle, status: r.status } : null;
    } catch { return null; }
  }

  /* ===== R118 (N783) — THE ONE WRITE OF A PARTICIPATION ROW A LATER MODULE MAKES =====
   *
   * `project-roster`'s acts (its R3–R5, R12) have made every check of their own; this writes their row in the caller's
   * transaction and asks nothing (R120: no later module writes `project_participants` but through here). `invite` adds
   * the member `invited`, not an owner; `ownerOn` sets an existing participant's owner flag, next in R65's order;
   * `ownerOff` clears it, the member staying a participant; `rescue` makes the member a `joined` owner, next in R65's
   * order, adding the row when they hold none and changing no other row. True when it wrote; false, writing nothing, for
   * an unknown kind, an `invite` whose row exists, and an `ownerOn`/`ownerOff` whose row does not. Never throws. */
  participationWrite(kind, args = {}) {
    try {
      const { projectId, memberId, by = null, comment = null, at = null } = args && typeof args === "object" ? args : {};
      if (typeof projectId !== "string" || !projectId || typeof memberId !== "string" || !memberId) return false;
      const when = typeof at === "string" && at ? at : new Date().toISOString();
      const held = !!this.#one(`SELECT 1 AS x FROM project_participants WHERE project_id=? AND member_id=?`,
        projectId, memberId);
      const nextOrder = `(SELECT COALESCE(MAX(owner_order), 0) + 1 FROM project_participants WHERE project_id=?)`;
      if (kind === "invite") {
        if (held) return false;
        this.sql.exec(`INSERT INTO project_participants (project_id,member_id,state,owner,invited_by,created,updated)
                       VALUES (?,?,'invited',0,?,?,?)`, projectId, memberId, by, when, when);
        return true;
      }
      if (kind === "ownerOn") {
        if (!held) return false;
        this.sql.exec(`UPDATE project_participants SET owner=1, owner_order=${nextOrder}, updated=?
                        WHERE project_id=? AND member_id=?`, projectId, when, projectId, memberId);
        return true;
      }
      if (kind === "ownerOff") {
        if (!held) return false;
        this.sql.exec(`UPDATE project_participants SET owner=0, owner_order=NULL, updated=?
                        WHERE project_id=? AND member_id=?`, when, projectId, memberId);
        return true;
      }
      if (kind === "rescue") {
        const c = comment === null || comment === undefined ? null : String(comment);
        this.sql.exec(
          `INSERT INTO project_participants (project_id,member_id,state,owner,owner_order,invited_by,comment,created,updated,
                                            joined_at)
           VALUES (?,?,'joined',1,${nextOrder},?,?,?,?,?)
           ON CONFLICT(project_id,member_id) DO UPDATE SET owner=1, owner_order=excluded.owner_order,
             joined_at=CASE WHEN project_participants.state='joined' THEN project_participants.joined_at
                            ELSE excluded.joined_at END,
             state='joined', updated=excluded.updated`,
          projectId, memberId, projectId, by, c, when, when, when);   /* R127: a rescue joins */
        return true;
      }
      return false;
    } catch { return false; }
  }

  /* ===== R116, R117 (N783, K624; R79's form) — THE TWO NOTICES `project-roster` HEARS =====
   *
   * Requests to join are `project-roster`'s (its R10–R14), but two setup acts that stay here change them: an invitation
   * (R32) closes the invitee's open request `granted` (R33), and setting a project hidden (R45) lapses its open requests.
   * Each slot takes one registration, whoever makes it (R81's refusals, naming the holder); it is called once, inside the
   * act and after its writes, in the caller's transaction. A whole number of at least 1 is the count the listener
   * closed; anything else, a throw, or no listener reads as none, and the act and its answer stand either way. */
  #invitedListener = null;   // {module, fn}
  #hiddenListener = null;    // {module, fn}

  onProjectInvited(module, fn) {
    const refused = listenerRefusal(this.#invitedListener, module, fn);
    if (refused) return refused;
    this.#invitedListener = { module, fn };
    return { ok: true, module };
  }

  onProjectHidden(module, fn) {
    const refused = listenerRefusal(this.#hiddenListener, module, fn);
    if (refused) return refused;
    this.#hiddenListener = { module, fn };
    return { ok: true, module };
  }

  static #tell(listener, notice) {
    if (!listener) return 0;
    try {
      const r = listener.fn(notice);
      return Number.isInteger(r) && r >= 1 ? r : 0;
    } catch { return 0; }
  }
/* Membership Architecture v2 section 7: authority over a project belongs to its
   OWNERS, and to nobody else. An administrator sees every discoverable project, and
   a hidden one only as a participant (7.3, 7.8, 7.9 as D54 amended them), and
   directs none of them (v2 4.9), the single exception being 7.13, the rescue of a
   project whose owners are all inactive (`project-roster`'s `projectOwnerRescue`, its R5).

   This REVERSES v1.4 7.7, which gave removal to administrators and denied it to
   owners, in those words, reasoning from Design Requirement 1 that authority
   over people belongs to the custodial role. v2 reasons instead that
   participation in a project is a working relationship rather than a membership
   one, and the people who can judge it are the people doing the work. Authority
   over MEMBERSHIP itself is untouched and stays custodial.

   In one helper so the two call sites cannot drift apart, which is how the
   admin bypass came to sit on invite and remove with different shapes. */

  isProjectOwner(projectId, memberId) {
    const p = this.participation(projectId, memberId);
    return !!(p && p.owner);
  }

  /** REC-134: does this member hold the WORKING position in this project — a JOINED
   *  participant (§7.5: *"An invited member who has not joined has view rights only. A
   *  joined member has the working rights their capabilities allow"*). `leaving` counts:
   *  §7.6 says a request to leave *"does not remove them"*, and BOB #14's lead ruling
   *  already reads joined-or-leaving as the two states of full participation
   *  (`#leadReach`). An owner is a joined participant with the owner flag (§7.10), so
   *  every owner passes. `invited` does not. */
  isJoinedParticipant(projectId, memberId) {
    const p = this.participation(projectId, memberId);
    return !!(p && (p.state === "joined" || p.state === "leaving"));
  }

  /* ===== REC-134 / C-56 — SIGHT IS NOT AUTHORITY, AT EVERY ACT ON A PROJECT ================
   *
   * Membership Architecture v2 §7, *"SIGHT IS NOT AUTHORITY — and this is Bob's doctrine,
   * not a new ruling"* (BOB #15, 2026-09-18), quoting §4.9: *"the custodial role can audit
   * everything and direct nothing"*. The defect it closes, found by REC-132 and measured by
   * REC-134 through the ops: several acts that change a project took the VISIBILITY gate as
   * their only barrier (or had none at all), and every administrator — enrolled, and since
   * IC-149 the founder — passes that gate for every project. So an administrator who was
   * never invited could revise a project's document, move its citation edges, move what it
   * stands on, record a judgement in its feed, and adopt a bias set into its scope.
   *
   * THE QUESTION IS ASKED OF WHO THE ACTOR IS, NEVER OF WHAT IT MAY SEE. `identity` is the
   * POSITIONAL half of the control plane's one session resolver (`resolveSession`, IC-149):
   * `member:<id>` for a signed-in session (the founder's is `member:admin`), a member-scoped
   * `ai` credential's principal, and `class:<cls>` for every instance credential. It is read
   * through `positionalMember`, the one place a viewer-shaped string becomes a member, so a
   * `class:*` credential answers null and is NOT ASKED — machine credentials hold no roster
   * position, and their fences are their own and unchanged (DEC-63's reasoning at the run
   * verbs, and the brief's). An ABSENT identity is also not asked: that is every internal
   * caller (`cite` promoting its own edit, `forkProject`, the version pointer's own write),
   * and the control plane stamps it on every enumerated act, deleted first so a caller can
   * never name one.
   *
   * WHAT IT DOES NOT TOUCH, and each is deliberate: §7.13's add-an-owner (`project-roster`'s `projectOwnerRescue`)
   * is the ONE administrator path and keeps its condition, its vote and its record — it never
   * calls this. The roster acts, publication, the review copy, the run verbs and the lead share
   * already asked a position and still ask their own. Sight is unchanged: nothing here is a
   * visibility predicate and no read calls it.
   *
   * Returns null to proceed, or the refusal. C-56.1's CODE is written HERE and only here, as a
   * literal inside the region DEC-49's guard reads; C-56.2's is `notTheOwner`'s (R122, T40), answered
   * through it with this act's `act` and `needs`; the call sites RELAY both (`projectGate`'s
   * precedent at the run verbs). */
  projectAuthority(projectId, identity, need, act) {
    const who = this.positionalMember(null, identity);
    if (who === null) return null;
    const refusal = (code, detail) => {
      const row = PROJECT_AUTHORITY_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId, act, needs: need };
    };
    /* R55, R122 (T40; K2394 Z8): the owner refusal is `notTheOwner`'s, its code minted there alone. */
    if (need === "owner" && !this.isProjectOwner(projectId, who))
      return notTheOwner(who, projectId, { act, needs: need });
    /* DEC-49 REGION is-project-authority */
    if (need === "joined" && !this.isJoinedParticipant(projectId, who))
      return refusal("PROJECT_ACT_NOT_A_PARTICIPANT",
        `${act} on ${String(projectId).slice(0, 80)} is work inside that project, and ${who} has not joined it `
        + `(§7.5: an invited member has view rights only; an uninvited one, none). Seeing a project is not `
        + `directing it: an administrator directs no project, whatever it sees (§4.9, §7). Nothing was written.`);
    /* END DEC-49 REGION is-project-authority */
    return null;
  }

  /* ===== REC-137 / REC-140 — WHO AUTHORISES A PUBLICATION IN A PROJECT'S NAME, AND WHO MAY CARRY IT IN ==
   *
   * Membership Architecture v2 §7, *"A CASE RATIFICATION: who AUTHORISES it and who may DELIVER it"*
   * (BOB #15). REC-137 built the two questions inside `ratifyCaseDocument`; REC-140 (D-429, Publication
   * rule 2 as BOB #15 applied it) MOVED them here because `op=ratify` asks them too, of a finding a
   * ratified case pins — one rule with two doors, never a second copy of it. Asked in this order:
   *
   * (1) DELIVERY IS CARRIAGE, NOT DIRECTION (AI Roles §3 rule 4: the record states signer and
   *     deliverer apart). A member with a role in the project may deliver, and so may the FOUNDER, as
   *     DEC-33's interim publishing route; an enrolled administrator with no role in the project may
   *     NOT — administrators direct nothing (§4.9). The member half is REC-134's ONE positional check,
   *     consumed and never restated: `deliveredBy` is the control plane's reading of the SESSION ROW
   *     (`deliveringPrincipal`, REC-128), `member:<id>` for a member's session and `founder` for the
   *     founder's. The founder is told apart HERE by that principal and never by the folded name: a
   *     member ENROLLED as `admin` delivers as `member:admin`, is asked, and is not the founder. An
   *     ABSENT deliverer is every internal caller (a store-level committer, the legacy arms), not
   *     asked, as at every REC-134 act. A project-less subject is (2)'s to refuse, by name.
   * (2) THE AUTHORITY IS THE SIGNATURE, AND IT MUST BE AN OWNER'S (DEC-72 clause 5: publishing is the
   *     project owner's act). Asked through `isProjectOwner`, §7's one owner predicate. A subject
   *     naming no project has no owner to sign it and is refused by the same rule — DEC-72 removed the
   *     project-less case, so it is a legacy document, and an absent publisher is not a publisher of
   *     none.
   *
   * Returns null to proceed, or the refusal. `extra` carries the caller's own identifying fields,
   * placed where `ratifyCaseDocument`'s refusal always carried them, so its answer is unchanged. */
  caseAuthority({ project, deliveredBy = null, signer = null, act, subject, extra = {} }) {
    if (project && deliveredBy !== "founder") {
      const denied = this.projectAuthority(project, deliveredBy, "joined", act);
      if (denied) return denied;
    }
    const refusal = (code, detail) => {
      const row = CASE_AUTHORITY_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               ...extra, project, signer: signer ?? null };
    };
    /* DEC-49 REGION is-case-signer-owner */
    if (!project || !this.isProjectOwner(project, signer))
      return refusal("CASE_SIGNER_NOT_AN_OWNER",
        `${subject} is ${project ? `${String(project).slice(0, 80)}'s` : "a project-less"} `
        + `production, and publishing is an act of an OWNER of the publishing project (DEC-72 clause 5). `
        + `The signature is ${signer ?? "an unnamed signer"}'s, who is not an owner of it. Being a `
        + `registered signer in your group's Civicsmith is not authority over a project. Nothing was committed.`);
    /* END DEC-49 REGION is-case-signer-owner */
    return null;
  }

  /* ===== REC-138 / D-426 — A PROJECT YOU CANNOT SEE IS A PROJECT THAT DOES NOT EXIST, AT EVERY ACT ==
   *
   * Membership Architecture v2 §7.9: an UNINVITED member sees nothing of a project — *"Not its
   * existence, not its name, not its references, not its participants."* The reads have honoured
   * that since REC-25 (`viewerPredicate`, D-15's one compilation point). The ACTS did not: `cite`,
   * `sever`, `reinstate`, `promote`'s revision arm, four roster acts, `forkProject` and the run
   * gate's project arm resolved their project with a bare lookup, so they answered a nonexistent id
   * one way and an existing one another — an existence oracle for project ids. REC-134 closed the
   * EDIT (C-56) and its own refusal became the signal; before it, the edit itself was.
   *
   * TWO PIECES, AND EACH IS THE ONLY ONE OF ITS KIND.
   *   `inSight(id, viewer)` asks `viewerPredicate` — never a second rule — whether this viewer may
   *   see this bundle. Only PROJECT rows are ever filtered, so for anything else it answers true to
   *   every recognised viewer; an absent or unrecognised viewer sees NOTHING (fail closed, the gate's
   *   own posture), which is why every act that calls it has its viewer stamped by the control plane.
   *   `noSuchProject(project)` (R78, a module-level function, every module's) is THE answer a project-targeted
   *   act gives when there is no project it may name — returned by the absent branch and the hidden branch alike, and in every
   *   caller by ONE condition (`!p || !this.inSight(...)`), so the two cannot drift: there is no
   *   second string to keep in step. IC-141's `#noCaseDocument` is the precedent, one object over.
   *
   * THE ORDER IS THE RULE: SIGHT BEFORE POSITION. Every caller asks `inSight` BEFORE
   * `projectAuthority` or its own owner test, so C-56 and NOT_THE_OWNER are only ever said to a
   * caller who can already see the project (an invited member, or an administrator, §7.3) — and
   * say nothing a caller did not already know. Asked the other way round, the positional refusal is
   * the oracle (R61; `test/m/membership/sight.test.mjs`'s R61 test holds that an outsider never learns ownership). */
  /* N142: a named service (the layer-6 modules gate with it and `viewerPredicate`), so it is total: an id that is not
     a non-empty string names no bundle, and nothing it is handed makes it throw. */
  inSight(bundleId, viewer) {
    if (typeof bundleId !== "string" || !bundleId) return false;
    const g = viewerPredicate(viewer);
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, bundleId, ...g.args);
  }

  /* ===== REC-149 — SIGHT HAS THREE LEVELS, AND IT IS STILL ONE PREDICATE (Membership v2 §7, item 7.14) =====
   *
   * Bob, 2026-09-18: *"The project's contents might be private, though the existence of the project may not
   * be"*, and *"each project chooses"*. So a project is DISCOVERABLE or HIDDEN, and `sight` answers:
   *   SIGHT_NONE      — nothing: an absent id, or a project the caller cannot see at all. §7.9 exactly.
   *   SIGHT_EXISTENCE — the project's id and name and the request to join, and nothing else: a DISCOVERABLE
   *                     project, asked by a member SESSION (a viewer naming a member) outside its participants.
   *   SIGHT_FULL      — what `viewerPredicate` admits (invited, joined, an administrator or the founder at a
   *                     discoverable project, every machine credential): its SQL is asked first and alone decides FULL.
   * EXISTENCE is asked only where FULL was refused, only of a PROJECT, and only of a viewer the gate reads as
   * a member — so a machine credential (already FULL) is unchanged, an absent or unrecognised viewer stays NONE
   * (fail closed), and a HIDDEN project stays NONE for everybody who could not already see it but an administrator
   * (D54, T41-3: its second form, below). `viewerPredicate` IS NOT CHANGED: every record read, search, citation list,
   * reverse edge and run report still compiles only FULL sight, because those reads return CONTENTS.
   * `inSight` IS the FULL level, asked first and unchanged, so every existing caller keeps its meaning; the
   * acts ask `existenceAct` just BEFORE their REC-138 line, so NONE still reaches that line and its answer. */
  static SIGHT_NONE = "none";

  static SIGHT_EXISTENCE = "existence";

  static SIGHT_FULL = "full";

  /* D54 (K2408, K2409; T41-3): EXISTENCE has a second form. An administrator (the founder's viewer, either spelling, or
     an active administrator's) whom R43 does not admit to a HIDDEN project, being neither invited nor joined, sees that
     it exists: its id, its name and its owners' handles (R77), so a legal hold or a complaint can name it; never its
     contents. A discoverable project's EXISTENCE is unchanged, and administrators are FULL there already. */
  sight(bundleId, viewer) {
    if (this.inSight(bundleId, viewer)) return Membership.SIGHT_FULL;
    if (typeof bundleId !== "string" || (!this.#administratorView(viewer) && !viewerPredicate(viewer).member))
      return Membership.SIGHT_NONE;
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, bundleId);
    if (!b || b.object_type !== "project") return Membership.SIGHT_NONE;
    if (this.visibilityOf(bundleId) === "discoverable") return Membership.SIGHT_EXISTENCE;
    return this.#administratorView(viewer) ? Membership.SIGHT_EXISTENCE : Membership.SIGHT_NONE;
  }

  /* R43's administrator arms, as a viewer names them: the founder's viewer (bare `admin` or `member:admin`), or a
     `member:<id>` viewer naming an active administrator. A machine credential is neither: it sees every bundle. */
  #administratorView(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "DENY" || g.scope === "member") return false;
    if (viewer === Membership.ROOT_ADMIN || g.member === Membership.ROOT_ADMIN) return true;
    const m = this.#one(`SELECT role, status FROM members WHERE member_id=?`, g.member);
    return !!m && m.role === "admin" && m.status === "active";
  }

  /* R85 (N332, K412): a named service (control-plane R27's existence read calls it), asking no viewer: it states only
     the setting, and its callers gate what they show by R44. Total: an id the index does not hold, or one that is not
     a string, reads `hidden`, and nothing it is handed makes it throw.
     The CURRENT setting, READ FROM THE SIGHT INDEX (D-497) rather than recomputed from the act log here.
     `project_sight` holds one row per project carrying exactly what `reindexProjectSight` derived, so this
     predicate and the directory's SQL read THE SAME ROWS instead of two copies of one rule — which is the
     whole of D-497 and the reason the directory can bound its candidates in SQL at all.
     THE `hidden` BELOW IS NOT THE DEFAULT FOR AN OWNER WHO HAS NOT ACTED. That default is in the derivation's
     own CASE, one method down, and every project carries a row for it: the index is recomputed at every boot,
     at every promotion, and at every owner's act. This branch is reached only by an id the index does not hold
     — a bundle that is not a project, or one purged between the two reads — and it fails closed. */
  visibilityOf(projectId) {
    const r = this.#one(`SELECT setting FROM project_sight WHERE project_id=?`,
      typeof projectId === "string" ? projectId : null);   /* R85: an id that is not a string names no row */
    return r && r.setting === "discoverable" ? "discoverable" : "hidden";
  }

  /* ===== D-497 — THE DERIVATION, AND IT IS THE ONLY PLACE THE RULE IS STATED (Membership v2 §7, item 7.14).
   *
   * WHAT THIS EXISTS FOR. `sight` was a JS predicate with no row source, so `projectDirectory` established
   * "this caller sees none of them" by asking it about every project in the group one at a time: each statement
   * bounded, the NUMBER of statements growing with the record. D-479 bounded what the directory PUBLISHES and
   * reported this half as a row of its own, in these words — *"bounding that needs a row source the sight
   * predicate itself READS, not a second copy of its rule"*. This is that row source.
   *
   * THE RULE, STATED ONCE: a project's setting is its OWNERS' LATEST ACT, and HIDDEN where they have never
   * acted — every project that existed before REC-149 (each created under §7.9's promise that the uninvited see
   * not its existence), every creation that carried no setting, and everything a machine created. It is the
   * CASE below and nowhere else. `visibilityOf` reads the answer; the directory joins the same table; nobody
   * restates the default. REC-149's first build DID restate it — its directory took candidates from the
   * visibility table — and its own `default-discoverable` control arm caught that by flipping the default and
   * watching the directory not move.
   *
   * DERIVED, NEVER AUTHORED. `project_visibility` stays the record: append-only, one row per owner's act. This
   * table is a projection of it that a statement can join, recomputed WHOLE at every boot (the `#seedMintLedger`
   * precedent) and per project wherever a project or an act changes — so a row that disagreed with the log,
   * for any reason including a landing that moved the rule, does not survive a restart.
   *
   * THE ROW IS project_id AND setting AND NOTHING ELSE, AND THAT IS THE FIX TO A DEFECT THIS LANDING'S OWN
   * FIRST DRAFT HAD. It carried a third column, `at`, a fresh timestamp written on every recompute — so an
   * UNCHANGED boot rewrote every row with different bytes, and A RESTART PLUS A PURE READ THEN MOVED A TABLE.
   * `versionnotice.test.mjs`'s no-write WITNESS caught it by name on the first full battery (`WITNESS QUIET`
   * and `NOTHING WRITTEN (the whole store)`, both naming `project_sight`): a live verification's no-write guarantee
   * rests on the record's tables reading the same before and after, so a derivation that writes on every boot
   * costs that guarantee.
   * Two narrower fixes were tried at the STATEMENT and BOTH ARE REFUSED BY WORKERD with
   * `Error: incomplete input: SQLITE_ERROR` — a `WHERE` on the conflict action, and the same guard moved into
   * a LEFT JOIN against the index — while `node:sqlite` prepares each of them without complaint, which is the
   * receipt for driving the plane's own engine rather than a local one. So the column went instead: a
   * projection needs no date of its own, the act log carries every date there is, and an unchanged recompute
   * now writes rows BYTE-IDENTICAL to the ones it found, and it costs nothing (`test/m/membership/t19-enrol-boot.test.mjs`
   * holds a second boot's index idempotent at the byte, R45 and R85).
   *
   * COST, STATED. Two statements. Given a projectId both address ONE row through a primary key and an indexed
   * lookup; given none, both run once over the projects in `bundles` — inside SQLite, nothing per row in JS,
   * at boot only, reached by no op. The work is inside SQL, so it is stated here rather than left for a reader of
   * this file's JS loops to miss. */
  reindexProjectSight(projectId = null) {
    /* A bundle that is no longer a project (or never was) holds no sight row. Written as a correlated NOT
       EXISTS rather than `NOT IN (SELECT …)` so the per-project form stays one indexed lookup. */
    this.sql.exec(
      `DELETE FROM project_sight
        WHERE (? IS NULL OR project_id = ?)
          AND NOT EXISTS (SELECT 1 FROM bundles b
                           WHERE b.bundle_id = project_sight.project_id AND b.object_type = 'project')`,
      projectId, projectId);
    this.sql.exec(
      `INSERT INTO project_sight (project_id, setting)
       SELECT b.bundle_id,
              CASE WHEN (SELECT pv.setting FROM project_visibility pv
                          WHERE pv.project_id = b.bundle_id
                          ORDER BY pv.seq DESC LIMIT 1) = 'discoverable'
                   THEN 'discoverable' ELSE 'hidden' END
         FROM bundles b
        WHERE b.object_type = 'project' AND (? IS NULL OR b.bundle_id = ?)
       ON CONFLICT(project_id) DO UPDATE SET setting = excluded.setting`,
      projectId, projectId);
  }

  /* THE ANSWER AN ACT GIVES AT EXISTENCE, asked in ONE place so no act can say a second thing: C-70.1 when the
     caller's sight of this id is EXISTENCE, else null — and then the act's own REC-138 line runs unchanged, so
     NONE is still answered exactly as an id naming nothing (byte for byte) and FULL proceeds. Every act that
     names a project asks this immediately before its sight line. A viewer never SENT is not asked
     (`rosterInSight`'s precedent): it is an internal caller, and NONE's line decides for it as before. */
  existenceAct(projectId, viewer) {
    if (viewer === null || viewer === undefined) return null;
    try {
      return this.sight(projectId, viewer) === Membership.SIGHT_EXISTENCE ? this.#existenceOnly(projectId) : null;
    } catch { return null; }
  }

  /* C-70.1, minted here and only here; every act RELAYS it through `existenceAct`. Its two forms (R77, D54): at a
     discoverable project's EXISTENCE, the id and the name, which the directory already showed this caller, and nothing
     else; at a hidden project's, which only an administrator neither invited nor joined reaches (R44), the id, the name
     and `owners`, the owners' current handles in R65's order (null for an owner with none, the founder), so a hold or a
     complaint can name who to ask. No act, no state, no other participant, ever. */
  #existenceOnly(projectId) {
    const title = this.#titleOf(projectId);
    const hidden = this.visibilityOf(projectId) === "hidden";
    const refusal = (code, detail) => {
      const row = PROJECT_VISIBILITY_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId, name: title,
               ...(hidden ? { owners: this.projectOwners(projectId).map((o) => this.memberFacts(o)?.handle ?? null) } : {}) };
    };
    /* DEC-49 REGION is-project-existence-only */
    return refusal("PROJECT_SEEN_NOT_A_PARTICIPANT", hidden
      ? "this project is hidden and you are neither invited to it nor joined to it. As an administrator you see its "
        + "id, its name and its owners, and nothing inside it; its owners can add you (Membership Architecture v2 §7.9)."
      : "this project is discoverable and you are not one of its participants. Its existence and name are all "
        + "it shows you; asking to join is the one act open to you (Membership Architecture v2 §7.14).");
    /* END DEC-49 REGION is-project-existence-only */
  }

  /** REC-149 — THE SETTING, an OWNER'S recorded act (§7.14 "The setting"). Append-only: every act is a row with
   *  the owner, the date and an optional reason, and the current setting is the latest. Sight before position:
   *  a caller who cannot see the project is answered as for one that does not exist, a caller at EXISTENCE gets
   *  C-70.1, and only then is ownership asked — through `isProjectOwner`, §7's one owner predicate, so an
   *  administrator, the founder and every machine credential are refused (administrators direct nothing, §4.9,
   *  and §7.13's rescue does not set it). A viewer never SENT is not asked, `rosterInSight`'s precedent. */
  projectVisibilitySet({ projectId, setting, reason = null, by, viewer = null } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    const existence = b ? this.existenceAct(projectId, viewer) : null;
    if (existence) return existence;
    if (!b || !this.rosterInSight(projectId, viewer)) return noSuchProject(projectId);
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT", project: projectId };
    const want = String(setting ?? "");
    const refusal = (code, detail) => {
      const row = PROJECT_VISIBILITY_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               project: projectId };
    };
    /* DEC-49 REGION is-project-visibility-owner */
    if (!this.isProjectOwner(projectId, by))
      return refusal("PROJECT_VISIBILITY_NOT_THE_OWNER",
        `whether ${String(projectId).slice(0, 80)} can be found is its OWNERS' choice (Membership Architecture `
        + `v2 §7.14), and ${String(by ?? "an unnamed caller").slice(0, 80)} is not one of them. Seeing a project `
        + `is not directing it. Nothing was written.`);
    /* END DEC-49 REGION is-project-visibility-owner */
    /* REC-197: the value check moved into ONE helper, which a creation's `visibility` asks too, so the two
       doors cannot disagree about what a setting is. Still asked AFTER the owner check here, as before. */
    { const unknown = this.visibilitySettingRefusal(want, projectId); if (unknown) return unknown; }
    const why = reason === null || reason === undefined || String(reason).trim() === ""
      ? null : String(reason).slice(0, 280);
    const at = new Date().toISOString();
    this.sql.exec(`INSERT INTO project_visibility (project_id, setting, set_by, reason, at) VALUES (?,?,?,?,?)`,
      projectId, want, by, why, at);
    /* D-497: the act is the record; the sight index is its derivation, re-derived for THIS project from the
       log that just gained a row. Never written from `want` directly — that would be the second copy of
       "the latest act wins", and it is the copy that would agree for free until the day the rule moved. */
    this.reindexProjectSight(projectId);
    /* REC-150, R45, R117 (§7.14, "The request to join"; N783): SETTING A PROJECT HIDDEN LAPSES EVERY OPEN REQUEST TO
       IT, recorded as lapsed with the owner who hid it and the same date, by R117's listener (`project-roster`, its
       R16), told after the record and the reindex. Setting it discoverable notifies nobody and reopens nothing. */
    const lapsed = want === "hidden"
      ? Membership.#tell(this.#hiddenListener, { projectId, by: by ?? null, at }) : 0;
    return { ok: true, projectId, setting: want, set_by: by, reason: why, at,
             ...(want === "hidden" ? { requests_lapsed: lapsed } : {}) };
  }

  /* REC-197 — WHAT A SETTING IS, asked in ONE place by both doors that take one: the owner's act above and a
     creation's `visibility` (`promote`, which a fork reaches through). "discoverable" or "hidden" and nothing
     else, compared exactly — a spelling the vocabulary does not write is not quietly read as either. Null when
     the value is a setting. `projectId` is echoed when the door has one (the owner's act); a creation has none. */
  visibilitySettingRefusal(value, projectId) {
    const want = String(value ?? "");
    const refusal = (code, detail) => {
      const row = PROJECT_VISIBILITY_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               ...(projectId !== null ? { project: projectId } : {}) };
    };
    /* DEC-49 REGION is-project-visibility-setting */
    if (want !== "discoverable" && want !== "hidden")
      return refusal("PROJECT_VISIBILITY_UNKNOWN_SETTING",
        `${JSON.stringify(want.slice(0, 40))} is not a setting: a project is "discoverable" or "hidden", and `
        + `nothing else. Nothing was written.`);
    /* END DEC-49 REGION is-project-visibility-setting */
    return null;
  }

  /* THE ROSTER ACTS' form of the same question, and the one difference is stated rather than hidden.
     Their positional half is `by`, and they have always been driven straight at the store by callers
     that are not requests (setup, fixtures, the store's own suites) — the same population
     `projectAuthority` answers "not asked" for an ABSENT identity. So an ABSENT viewer (the
     parameter not sent at all: null) is NOT ASKED here, on that precedent; ANY viewer that was sent,
     including an empty one, is asked through `inSight` and fails closed. The control plane stamps
     every roster act (`PROJECT_ACTIONS`): without the stamp these acts would fall back to disclosing. */
  rosterInSight(projectId, viewer) {
    return viewer === null || viewer === undefined || this.inSight(projectId, viewer);
  }

  /** D-310: DOES THIS MEMBER HOLD THE OWNER POSITION ANYWHERE — the question
   *  `op=affordances` has to answer before it offers `publish`, because the
   *  project is a PARAMETER of that act and the pre-flight cannot know which one
   *  a caller will name. `publishCase()` refuses the per-PAIR question
   *  (`NOT_THE_PROJECT_OWNER`, DEC-72 clause 5); this is the weakest fact that
   *  makes the two unable to disagree, and nothing weaker would close it.
   *
   *  THE RULE IS `isProjectOwner`'s AND IS NOT RESTATED. This selects the
   *  member's own participations off the `pp_member` index and asks THAT
   *  predicate about each — the same one publishCase()'s fence runs — so a
   *  change to what "owner" means is made once. Writing `AND owner=1` here
   *  would be a second implementation of the owner rule, which is this
   *  repository's most-repeated defect class and is named as such at the fence
   *  itself.
   *
   *  AND IT IS A PREDICATE RATHER THAN A SCAN INSIDE `affordanceFacts`, for the
   *  reason `#citesInto` and `#restsOnLive` are: that method STATES FACTS and
   *  assembles no SQL of its own, and every row question it asks goes through a
   *  predicate a refusal also runs. A LIMIT is deliberately NOT taken — a bound
   *  that stopped before an owner row would withhold the act from a genuine
   *  owner, the over-strictness failure, and what bounds this set is roster ACTS
   *  (an invite, a join) and never a corpus. */
  ownsAnyProject(memberId) {
    return this.#rows(`SELECT project_id FROM project_participants WHERE member_id=?`, memberId)
               .some((p) => this.isProjectOwner(p.project_id, memberId));
  }

  /* REC-133 / BIO_Publication §6A.2: THE PROJECT'S EDIT PERMISSION, positional half.
     Membership v2 §7.5: *"A joined member has the working rights their capabilities
     allow"*, and an invited member who has not joined has VIEW rights only; a member
     who has asked to leave (7.6) has asked to stop working. So: an OWNER (the rule
     `isProjectOwner` states, consumed rather than restated) or a participant whose
     state is `joined`, read through `participation`, the record's one membership
     predicate. The CAPABILITY half, `contribute` (*"create and revise bundles in the
     working corpus"*, §5), is a SESSION's and is enforced at the control plane's
     NEEDS table, where every other corpus write is gated. An administrator gains
     nothing here: sight of every project is not a position in any of them (§7.3).
     No new right is minted; this is §7.5 said once. */
  isProjectEditor(projectId, memberId) {
    if (this.isProjectOwner(projectId, memberId)) return true;
    const p = this.participation(projectId, memberId);
    return !!(p && p.state === "joined");
  }

  /* R127 (K2404; for `credentials` R54, R59): every participant `joined` or `leaving` (R54's set), whatever the member's
     status, in member-id order: `{member, owner, since}`, `since` the instant the row last became `joined` (null for a row
     joined before T40 recorded it). An unknown project answers []. Writes nothing and never throws. */
  joinedParticipants(projectId) {
    try {
      if (typeof projectId !== "string" || !projectId) return [];
      return this.#rows(`SELECT member_id, owner, joined_at FROM project_participants
                          WHERE project_id=? AND state IN ('joined','leaving') ORDER BY member_id`, projectId)
        .map((r) => ({ member: r.member_id, owner: r.owner === 1, since: r.joined_at ?? null }));
    } catch { return []; }
  }

  /* R74: one member's participation in one project, `{state, owner}`, or null (promotion's forkProject reads it). */
  participation(projectId, memberId) {
    const p = this.#one(`SELECT state, owner FROM project_participants WHERE project_id=? AND member_id=?`,
      projectId, memberId);
    return p ? { state: p.state, owner: p.owner === 1 } : null;
  }

  /** 7.1: the creator is the owner. Called when a project bundle is promoted by
   *  an identified member; a project created by a machine credential has no
   *  owner row, which is honest rather than inventing one. */
  projectClaimOwner({ projectId, memberId } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return noSuchProject(projectId);   /* R78 */
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (this.#one(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1`, projectId))
      return { ok: false, reason: "OWNED" };
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO project_participants (project_id,member_id,state,owner,owner_order,invited_by,created,updated,
                                                    joined_at)
       VALUES (?,?,'joined',1,1,NULL,?,?,?)`, projectId, memberId, now, now, now);   /* R127: joined at creation */
    return { ok: true, projectId, owner: memberId };
  }

  /** 7.2: the owner invites by handle, and only an owner (the code below). CORRECTED 2026-09-23
   *  (D-311): this read "Administrators may also invite, because 7.7 already gives them authority
   *  over participation" — v1.4's 7.7, which Membership Architecture v2 REVERSED; its §11 item 5
   *  requires such a comment corrected rather than left to disagree in silence. */
  projectInvite({ projectId, handle, by, viewer = null } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    /* REC-138 / D-426: sight BEFORE position (see `inSight`). */
    { const existence = b ? this.existenceAct(projectId, viewer) : null; if (existence) return existence; }   /* REC-149 */
    if (!b || !this.rosterInSight(projectId, viewer)) return noSuchProject(projectId);
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (!this.isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project invites participants to it. An administrator directs "
                     + "no project, whatever it sees." };
    const target = this.memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };
    if (this.participation(projectId, target.member_id))
      return { ok: false, reason: "ALREADY_A_PARTICIPANT", handle };
    const now = new Date().toISOString();
    this.participationWrite("invite", { projectId, memberId: target.member_id, by, at: now });
    /* R33, R116 (REC-226; N783): the same act answers the invitee's open request to join, if they have one: R116's
       listener (`project-roster`, its R15) closes it `granted`, by the owner who invited, so a request never stays open
       beside the invitation that met it. */
    const granted = Membership.#tell(this.#invitedListener,
      { projectId, memberId: target.member_id, by: by ?? null, at: now });
    return { ok: true, projectId, handle, state: "invited", ...(granted ? { request: "granted" } : {}) };
  }

  /** 7.4: joining is selecting the checkbox. There is no acceptance ceremony. */
  projectJoin({ projectId, by, viewer = null } = {}) {
    /* REC-149: at EXISTENCE (a discoverable project, a member outside it) the positional C-70.1; otherwise the
       answer below is unchanged, and it already says the same thing for an absent id and a hidden one. */
    { const existence = this.existenceAct(projectId, viewer); if (existence) return existence; }
    const p = this.participation(projectId, by);
    if (!p) return { ok: false, reason: "NOT_INVITED",
      detail: "a member joins a project they were invited to. Being uninvited is not a refusal you can see." };
    /* R127 (K2404): the instant the row becomes `joined`; a row already joined keeps the instant it joined. */
    const now = new Date().toISOString();
    this.sql.exec(`UPDATE project_participants SET joined_at=CASE WHEN state='joined' THEN joined_at ELSE ? END,
                     state='joined', comment=NULL, updated=? WHERE project_id=? AND member_id=?`, now, now, projectId, by);
    return { ok: true, projectId, state: "joined" };
  }

  /** 7.6: unchecking the box is a REQUEST to leave. It greys the checkmark and
   *  removes nobody; removal is 7.7's, which v2 gives to an OWNER of the project
   *  (CORRECTED 2026-09-23 by D-311 — this read "to administrators alone", v1.4's rule). */
  projectLeave({ projectId, by, comment = null, viewer = null } = {}) {
    /* REC-149: at EXISTENCE (a discoverable project, a member outside it) the positional C-70.1; otherwise the
       answer below is unchanged, and it already says the same thing for an absent id and a hidden one. */
    { const existence = this.existenceAct(projectId, viewer); if (existence) return existence; }
    const p = this.participation(projectId, by);
    if (!p) return notAParticipant(projectId, by);   /* R87 (N335): C-56.3 minted at its one site */
    if (p.state !== "joined") return { ok: false, reason: "NOT_JOINED", state: p.state };
    /* REC-186 (BOB #31's ruling of 2026-09-23 21:37Z on Membership v2 §7.6 and §7.10): THE PROJECT'S ONLY
       OWNER DOES NOT ASK TO LEAVE. An owner's request can be honoured only by the 7.10 removal (7.7 refuses
       an owner, `OWNER`), and 7.10's floor refuses that removal at one owner, so a request from the last owner
       would record a departure the record can never carry out — an overclaim. The floor is asked through the
       SAME arithmetic `project-roster`'s `projectOwnerRemove`'s LAST_OWNER ran; R35 (below) has since replaced that count with the
       committed owners, which that act's LAST_COMMITTED_OWNER also reads. Nothing is written. */
    /* DEC-49 REGION is-leave-owner-floor — REC-186/C-33.48. */
    /* R35 (REC-224): an owner may ask to leave only while ANOTHER owner stays committed — an owner who has not
       asked to leave. Counting every owner (the old LAST_OWNER_CANNOT_LEAVE) let two owners both ask to leave and
       strand the project with nobody committed to it. */
    if (p.owner) {
      const committed = this.#committedOwners(projectId).filter((o) => o !== by);
      if (!committed.length)
        return { ok: false, reason: "LAST_COMMITTED_OWNER", owners: this.projectOwners(projectId).sort(),
                 detail: "no other owner of this project is committed to it (every other owner has asked to leave, "
                       + "or there is none), and one committed owner is the floor, so a request to leave could never "
                       + "be carried out. Transfer ownership first: add another owner (7.10), then ask to leave; or "
                       + "deactivate the project (7.11). Nothing was written." };
    }
    /* END DEC-49 REGION is-leave-owner-floor */
    const c = comment === null ? null : String(comment).slice(0, 280);
    this.sql.exec(`UPDATE project_participants SET state='leaving', comment=?, updated=? WHERE project_id=? AND member_id=?`,
      c, new Date().toISOString(), projectId, by);
    return { ok: true, projectId, state: "leaving", comment: c,
             detail: "recorded as a request to leave. An owner of this project removes participants; this does not." };
  }

  /** 7.7, REVERSED in Membership Architecture v2: only an OWNER of the project
   *  removes a participant, request outstanding or not, and an administrator does
   *  not. CORRECTED 2026-09-23 by D-311 — this comment still stated v1.4's rule
   *  ("only an administrator removes … Project owners invite; they do not remove")
   *  over code that has enforced v2's since the reversal; §11 item 5 requires it
   *  corrected rather than left to disagree in silence. */
  projectRemove({ projectId, handle, by, comment = null, viewer = null } = {}) {
    /* REC-149: at EXISTENCE (a discoverable project, a member outside it) the positional C-70.1; otherwise the
       answer below is unchanged, and it already says the same thing for an absent id and a hidden one. */
    { const existence = this.existenceAct(projectId, viewer); if (existence) return existence; }
    if (!this.isProjectOwner(projectId, by))
      return { ok: false, reason: "NOT_THE_OWNER",
               detail: "only an owner of this project removes a participant from it. This REVERSES the "
                     + "earlier rule, under which an administrator removed and an owner could not." };
    const target = this.memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    const p = this.participation(projectId, target.member_id);
    /* N335: the NAMED member holds no participation, a different condition from the caller holding none (R87), so it
       has its own code and row, C-56.4 (`TARGET_NOT_AN_ADMIN`'s precedent). */
    /* DEC-49 REGION is-remove-target-participant */
    if (!p) {
      const row = MEMBERSHIP_CHECKS.TARGET_NOT_A_PARTICIPANT;
      return { ok: false, reason: "TARGET_NOT_A_PARTICIPANT", code: "TARGET_NOT_A_PARTICIPANT", check: row.check,
               translation: row.translation, handle,
               detail: "the member named holds no participation in this project, so there is nobody to remove "
                     + "(7.7). Nothing was written." };
    }
    /* END DEC-49 REGION is-remove-target-participant */
    if (p.owner) return { ok: false, reason: "OWNER",
      detail: "an owner is not removed from a project by this action. Ownership changes by the section "
            + "7.10 process, and removal from the project follows once they are no longer an owner." };
    const why = comment === null || comment === undefined ? null : String(comment).slice(0, 280);
    const at = new Date().toISOString();
    this.sql.exec(`DELETE FROM project_participants WHERE project_id=? AND member_id=?`, projectId, target.member_id);
    /* R63 (Bob, 2026-09-26): the removal stays in the record — who removed whom, when, and the owner's reason —
       and every participant reads it (`project-roster`'s roster read, its `removals`). */
    this.sql.exec(`INSERT INTO project_removals (project_id, member_id, removed_by, comment, at) VALUES (?,?,?,?,?)`,
      projectId, target.member_id, by, why, at);
    return { ok: true, projectId, handle, removed: true, comment: why, by, at };
  }

  /** D-311: THE RESCUE'S CALLER-AND-PROJECT CONDITIONS, extracted from `projectOwnerRescue` (now `project-roster`'s, its R5) so
   *  `op=affordances` asks the SAME predicate the act refuses on (the `#citesInto` discipline):
   *  the caller is an administrator, the project has owner rows, and EVERY owner is inactive.
   *  Returns the refusal the act answers, byte for byte as it answered before the extraction, or
   *  null. What it leaves to the act is what turns on a PARAMETER (the reason, the handle). */
  rescueRefusal(projectId, by) {
    /* R84 (N327, DEC-83): the rescue is the single exception to administrators holding no authority over projects,
       and an administrator's to use; the remedy names who acts instead. */
    if (!this.isAdministrator(by))
      return notAnAdmin(by, "adding an owner to a project whose owners are all inactive (7.13)",
        { remedy: "An active administrator of this group can add the owner; while any owner of the project is active, "
                + "its owners add one instead." });
    const owners = this.projectOwners(projectId);
    if (!owners.length)
      return { ok: false, reason: "NO_OWNERS",
               detail: "this project has no owner rows at all, which is a project created by a machine "
                     + "credential rather than a stranded one" };
    /* EVERY owner, not any. */
    const active = owners.filter((o) => {
      const m = this.#one(`SELECT status FROM members WHERE member_id=?`, o);
      return m && m.status === "active";
    });
    if (active.length)
      return { ok: false, reason: "OWNERS_ARE_ACTIVE", active: active.sort(),
               detail: "an administrator may add an owner only when EVERY owner of the project is inactive. "
                     + "While one is active the project is theirs to run, and 7.10 is the route." };
    return null;
  }

  /* ---- section 1.3: declared expertise, confirmed licenses ----
   *
   * TWO CLAIMS BY TWO PEOPLE, kept apart for the same reason the intake doctrine
   * keeps who ISSUED a document separate from how faithfully it was CAPTURED.
   * The member says what they hold. An administrator says whether the group has
   * satisfied itself that they hold it. Neither stands in for the other.
   *
   * WRITE AUTHORITY IS SPLIT BY COLUMN. A member writes `label` and never the
   * confirmation events; an administrator writes the confirmation events and can
   * never introduce a label the member did not declare. That is what keeps
   * confirmation a confirmation rather than an assignment.
   *
   * AND IT GATES NOTHING. An unconfirmed entry costs its holder no capability,
   * no visibility and no access. It appears in no session, is consulted by no
   * op, and must never enter the enforcement path. Section 5 in v2: it informs
   * humans; it gates nothing, confirmed or not. */
  static #normLabel(label) {
    return String(label ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  }

  #expertiseState(memberId, label) {
    const r = this.#one(
      `SELECT event, actor, created FROM member_expertise WHERE member_id=? AND label=?
       ORDER BY seq DESC LIMIT 1`, memberId, label);
    return r ? r.event : null;
  }

  /** The member's own statement about themselves. */
  expertiseDeclare({ memberId, label } = {}) {
    const m = this.#one(`SELECT member_id, status FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    if (m.status !== "active") return { ok: false, reason: "NOT_ACTIVE" };
    const lab = Membership.#normLabel(label);
    /* N285 (K275, K343): R21's refusal is its own condition, an expertise declared without a readable name, so it has
       its own code and its own row (C-96.13), no longer the `NO_LABEL` progressions and entities mint for theirs. */
    /* DEC-49 REGION is-expertise-labelled */
    if (!lab) {
      const row = MEMBERSHIP_CHECKS.EXPERTISE_NO_LABEL;
      return { ok: false, reason: "EXPERTISE_NO_LABEL", code: "EXPERTISE_NO_LABEL", check: row.check,
               translation: row.translation, detail: "a declaration needs a label, such as 'CPA'" };
    }
    /* END DEC-49 REGION is-expertise-labelled */
    const cur = this.#expertiseState(memberId, lab);
    if (cur === "declared" || cur === "confirmed")
      return { ok: false, reason: "ALREADY_DECLARED", label: lab, state: cur };
    this.sql.exec(
      `INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES (?,?,'declared',?,?)`,
      memberId, lab, memberId, new Date().toISOString());
    return { ok: true, memberId, label: lab, state: "declared", confirmed: false,
             detail: "declared and unconfirmed, which costs nothing: an unconfirmed entry carries the same "
                   + "capabilities, visibility and access as a confirmed one" };
  }

  /** An administrator vouching, INCLUDING for another administrator (4.9). */
  expertiseConfirm({ memberId, label, by, withdraw = false } = {}) {
    /* R84 (N327, DEC-83). */
    if (!this.isAdministrator(by))
      return notAnAdmin(by, "confirming or withdrawing a member's declared expertise",
        { remedy: "An active administrator of this group can confirm it, for any member, another administrator "
                + "included." });
    const m = this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    const lab = Membership.#normLabel(label);
    const cur = this.#expertiseState(memberId, lab);
    /* An administrator cannot introduce a label. Confirming something never
       declared would make this an assignment rather than a confirmation, and the
       whole point of 1.3 is that the two statements have two different authors. */
    if (cur === null)
      return { ok: false, reason: "NOT_DECLARED", label: lab,
               detail: "this member has not declared that. An administrator confirms what a member claims "
                     + "and never introduces the claim, or it would be an assignment rather than a "
                     + "confirmation." };
    if (!withdraw && cur === "confirmed") return { ok: false, reason: "ALREADY_CONFIRMED", label: lab };
    if (withdraw && cur !== "confirmed") return { ok: false, reason: "NOT_CONFIRMED", label: lab, state: cur };
    /* Supersede, never overwrite: the earlier confirmation stays readable. */
    this.sql.exec(
      `INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES (?,?,?,?,?)`,
      memberId, lab, withdraw ? "withdrawn" : "confirmed", by, new Date().toISOString());
    return { ok: true, memberId, label: lab, state: withdraw ? "withdrawn" : "confirmed",
             confirmed: !withdraw, by };
  }

  /** The roster view: current state per label, with the history behind it. */
  expertiseList({ memberId } = {}) {
    const rows = this.#rows(
      `SELECT seq, label, event, actor, created FROM member_expertise WHERE member_id=? ORDER BY seq`,
      memberId);
    const cur = new Map();
    for (const r of rows) cur.set(r.label, r);
    return { ok: true, memberId,
      expertise: [...cur.values()].map((r) => ({
        label: r.label, state: r.event, confirmed: r.event === "confirmed",
        by: r.actor, at: r.created,
        /* Both are surfaced so an interface can show WHICH of the two claims it
           is looking at, which is the entire function of the distinction. */
        history: rows.filter((h) => h.label === r.label)
          .map((h) => ({ event: h.event, actor: h.actor, at: h.created })),
      })).sort((a, b) => a.label.localeCompare(b.label)),
      gates: "nothing" };
  }

  /* ---- the membership model's member half, Architecture sections 3 to 6 ----
   *
   * The arithmetic of section 4.7 lives in ONE place, `adminArithmetic`, and
   * every rule below reads it rather than restating it. The table in the
   * architecture document is the specification and R5's test (`test/m/membership/`)
   * asserts it row by row, because this is the part of the design that is cheap
   * to get subtly wrong and expensive to discover wrong.
   */
  static CAPABILITIES = ["contribute", "publish", "create_projects"];

  /** Removal takes a MAJORITY OF ALL ADMINISTRATORS, counting the target in the
   *  denominator but not letting them vote, and ties do not eject.
   *
   *  That one sentence is what makes removal impossible at two without needing a
   *  special case, demands unanimity while the group is small enough for
   *  unanimity to be reasonable, and loosens as the group grows. A lone captured
   *  administrator can never eject anyone at any size. It fails only to a
   *  colluding majority, and nothing survives a colluding majority. */
  static adminMath(n) {
    const votesNeeded = Math.floor(n / 2) + 1;
    const eligibleVoters = Math.max(0, n - 1);
    return { administrators: n, votesNeeded, eligibleVoters, possible: votesNeeded <= eligibleVoters };
  }

  /* Section 7.10. Ownership of a project is a SET, and it follows 4.7 with one
     deliberate divergence and one relaxed floor.
   *
   * DO NOT REUSE adminMath HERE. It diverges at exactly one row, n=2, and that
   * row is the one a shared implementation gets wrong by reuse.
   *
   * For administrators, removal at two is IMPOSSIBLE and the impossibility is
   * the point: it stops a capture at the smallest size, and 4.2's floor of two
   * means a group never has to go below it. Projects have a floor of ONE, so if
   * removal at two were impossible the floor would be reachable only by never
   * adding a second owner, and a second owner would be permanent.
   *
   * At two, the target MAY vote, so removal is unanimity including them. That
   * describes what the act actually is at that size: one owner resigning with
   * the other's assent. It opens nothing, because the only removal it permits is
   * one the target has agreed to, and a hostile removal at two stays impossible
   * exactly as in 4.7. */
  static ownerMath(n) {
    if (n <= 1)
      return { owners: n, votesNeeded: 0, eligibleVoters: 0, targetMayVote: false, possible: false,
               why: "one owner is the floor, so the last owner is not removable" };
    if (n === 2)
      return { owners: 2, votesNeeded: 2, eligibleVoters: 2, targetMayVote: true, possible: true,
               why: "both owners must agree, the departing one included: resignation with the other's assent" };
    const votesNeeded = Math.floor(n / 2) + 1;
    const eligibleVoters = n - 1;
    return { owners: n, votesNeeded, eligibleVoters, targetMayVote: false,
             possible: votesNeeded <= eligibleVoters,
             why: "a majority of all owners, the target counted in the denominator and not voting" };
  }

  /** REC-30: the TABLE is arithmetic and belongs to everyone. The LIVE arm reads
   *  a named project's owner count, and an owner count is existence: asking for
   *  a project nobody invited you to would have answered `owners: 3` where an
   *  invented id answers `owners: 0`, which is precisely the "not even that it
   *  exists" 7.9 forbids. Gated through the ONE compilation point (`inSight`,
   *  which is false for an absent bundle AND for an invisible one), so an
   *  invisible project now answers exactly what a nonexistent one answers —
   *  ownerMath(0) — rather than a refusal that would itself be a signal. */
  projectOwnerArithmetic({ projectId, viewer = null } = {}) {
    const table = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) table.push(Membership.ownerMath(n));
    const live = projectId
      ? Membership.ownerMath(this.inSight(projectId, viewer) ? this.projectOwners(projectId).length : 0)
      : null;
    return { ok: true, table, live, projectId: projectId ?? null };
  }

  /* R65: the owners' member ids in the order they became owners (`owner_order`, the project's owner counter; a row
     written before that column existed orders first, by its creation, then id); [] for no owner or no such project. */
  projectOwners(projectId) {
    return this.#rows(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1
                        ORDER BY COALESCE(owner_order, 0), created, member_id`, projectId)
      .map((r) => r.member_id);
  }

  /* The owners committed to the project: every owner who has not asked to leave (R35, R40). */
  #committedOwners(projectId) {
    return this.#rows(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1 AND state<>'leaving'`,
      projectId).map((r) => r.member_id);
  }

  /** The table, computed rather than transcribed, so the code and the document
   *  cannot drift. Exposed as an op because a UI must be able to tell a group
   *  what it would take BEFORE they start a removal. */
  adminArithmetic() {
    const table = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) table.push(Membership.adminMath(n));
    return { ok: true, table, live: Membership.adminMath(this.activeAdmins().length) };
  }

  /* Who counts as an administrator.
   *
   * The FOUNDING administrator has no members row. They claimed the instance by
   * spending ADMIN_TOKEN, which is what 4.1 describes: the solo participant is
   * the administrator, and the whole membership apparatus stays invisible until
   * a second person exists. Counting only member rows made a claimed instance
   * with one invited administrator look like a group of one, so the second
   * invitation was issued unilaterally when it should have needed consensus.
   * Found by the existing members suite failing, not by the new one.
   *
   * The founder is named `admin`, the credentials role they hold, and they
   * cannot be removed by vote: per 4.6 the holders of ADMIN_TOKEN are the root
   * of trust and every rule in the membership model sits beneath them.
   * Membership does not and cannot constrain them, and an interface that
   * implied otherwise would be lying. */
  static ROOT_ADMIN = "admin";

  /* R86 (N329): the administrators in a stated order: the founder first once the instance is claimed, then every active
     member with role `admin` in the order their member rows were created, ties broken by member id (`tasks` R1's
     "earliest active administrator" is the first after the founder). Writes nothing and never throws. */
  activeAdmins() {
    const rows = this.#rows(`SELECT member_id FROM members WHERE role='admin' AND status='active'
                              ORDER BY created, member_id`)
      .map((r) => r.member_id);
    return this.#claimed() ? [Membership.ROOT_ADMIN, ...rows] : rows;   /* R94 */
  }

  /* REC-159 — THE ROSTER ANSWERS §4.9's CUSTODIAL ACTS, and it is asked BEFORE anything is looked up,
   * so a caller with no standing learns nothing about the member or key it named. `by` is the control
   * plane's STAMP (op-declarations' `CUSTODIAL_ACTIONS`, applied by control-plane), relayed from the query and
   * never from a body.
   * THREE SHAPES AND THREE ANSWERS, each true of the caller:
   *   - a member's id — a signed-in session: admitted only if they are an ACTIVE administrator, else
   *     NOT_AN_ADMIN, by name, answered through `notAnAdmin` (R84), as at `memberCaps`;
   *   - `class:<cls>` — the operator's bearer, which BOB #22 RULED keeps these acts; the plane's
   *     `machineClasses` decides which classes reach here, and the record names the credential;
   *   - absent — a route with no plane in front of it. Nothing is attributed, and the row records
   *     `not recorded`, which is what it is.
   * ANSWERS NULL when the act may proceed. */
  #custodialBar(by, act) {
    if (by === null || by === undefined || by === "") return null;
    if (String(by).startsWith(MACHINE_CLASS_PREFIX)) return null;
    if (this.activeAdmins().includes(by)) return null;
    return notAnAdmin(by, act);   /* R84 (N324): C-96.1 minted at its one site */
  }

  /* D-134 / DEC-49 — THE CUSTODIAL ACTS' REFUSALS, BUILT FROM C-96's ROWS. `reason` AND `code` carry the
   * same literal, `#leadRefusal`'s precedent: every existing caller reads `reason`, the guard and the
   * surfaces read `code`. The code is a STRING LITERAL at each call site, never a variable. */
  static #custodialRefusal(code, detail, extra) {
    const row = CUSTODIAL_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation,
             ...(extra || {}), detail };
  }

  /* REC-159: the stored actor, or the stated absence of one. */
  static #statusBy(v) { return typeof v === "string" && v !== "" ? v : "not recorded"; }

  #capsOf(row) {
    try { const v = JSON.parse(row.capabilities || "[]"); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }

  /** Set a member's capabilities. NOT a route to administrator status: that is
   *  granted and removed only by the section 4 process, and 4.4 says no
   *  administrator may strip another, so this refuses to touch either side of
   *  that line. */
  /*  D-136 ADDS `by`, AND IT IS READ RATHER THAN RECORDED. Section 4.9 makes
   *  setting capabilities a custodial act of an ADMINISTRATOR, and the control
   *  plane now stamps `by` from the session (op-declarations' `GOVERNANCE_ACTIONS`, applied by control-plane).
   *  A stamp nothing consults is a mechanism believed on the strength of its
   *  EXISTENCE rather than its behaviour, so the check sits here beside
   *  `adminEndorse`'s and `adminRemove`'s, which asked the same question of the
   *  same roster before this item and were whole except for who supplied the
   *  answer. A bearer credential stamps `class:<cls>`, which is in no roster,
   *  so it is refused here even if the control plane's fence in front of it were
   *  removed (R9's test in `test/m/membership/not-an-admin-visibility.test.mjs`
   *  asks it with a bearer's stamp and no fence in front).
   *
   *  IT IS ASKED BEFORE `NO_SUCH_MEMBER`, deliberately: who may ask is settled
   *  before the record answers whether a member exists, so a caller with no
   *  standing cannot use this op to enumerate the roster. */
  memberCaps({ memberId, capabilities, by } = {}) {
    const admins = this.activeAdmins();
    if (!by || !admins.includes(by)) return notAnAdmin(by, "setting a member's capabilities");   /* R84 */
    const m = this.#one(`SELECT member_id, role FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    const want = Array.isArray(capabilities) ? capabilities : null;
    if (!want) return { ok: false, reason: "BAD_CAPABILITY", detail: "capabilities is an array" };
    if (want.includes("administer") || m.role === "admin")
      return { ok: false, reason: "NOT_A_CAPABILITY_GRANT",
               detail: "administrator status is granted and removed only by the section 4 process, never by "
                     + "editing a field. 4.4: no administrator may strip another." };
    const bad = want.filter((c) => !Membership.CAPABILITIES.includes(c));
    if (bad.length) return { ok: false, reason: "BAD_CAPABILITY", got: bad, known: Membership.CAPABILITIES };
    this.sql.exec(`UPDATE members SET capabilities=?, updated=? WHERE member_id=?`,
      JSON.stringify(want), new Date().toISOString(), memberId);
    /* `by` travels back in the answer for `adminRemove`'s reason — an act the
       record attributes to a person should say whom it attributed it to, at the
       moment it is performed, so a caller can see the server's answer rather
       than its own. */
    return { ok: true, memberId, capabilities: want, by };
  }

  /** Endorse a proposed administrator. Addition above the second requires the
   *  CONSENSUS of every existing administrator, and that is the load-bearing
   *  half of 4.7: without it a captured administrator recruits confederates and
   *  manufactures the majority that ejects the honest ones. */
  async adminEndorse({ memberId, by } = {}) {
    /* R6 (T38, K2276): the caller's standing first, so no one who may not act learns whether a member exists. */
    const admins = this.activeAdmins();
    if (!by || !admins.includes(by)) return notAnAdmin(by, "endorsing a proposed administrator");   /* R84 */
    const m = this.#one(`SELECT member_id, status, role, invite_days FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    /* N335: C-96.14, this module's row (K275). */
    /* DEC-49 REGION is-endorse-proposed */
    if (m.status !== "proposed") {
      const row = MEMBERSHIP_CHECKS.NOT_PROPOSED;
      return { ok: false, reason: "NOT_PROPOSED", code: "NOT_PROPOSED", check: row.check, translation: row.translation,
               status: m.status,
               detail: "only a member whose status is 'proposed' is endorsed as an administrator (4.7), and this "
                     + "member's is not. Nothing was written." };
    }
    /* END DEC-49 REGION is-endorse-proposed */
    const now = new Date().toISOString();
    this.sql.exec(`INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,?,?)`,
      memberId, by, null, now);
    const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId)
      .map((r) => r.voter).filter((v) => admins.includes(v));
    const awaiting = admins.filter((a) => !have.includes(a));
    if (awaiting.length)
      return { ok: false, reason: "CONSENSUS_REQUIRED", memberId, have: have.sort(), awaiting: awaiting.sort(),
               detail: "every existing administrator must endorse an addition beyond the second" };
    /* Consensus reached: the invitation is issued now, and the plaintext code
       appears exactly once, here, as it does for any other invitation. */
    const invite = Membership.#rand(16);
    const hash = await Membership.#sha256(invite);
    /* R97: the invitation expires as R13's does, after the days chosen at `memberAdd` (kept on the proposal), or 7. */
    const days = Number.isInteger(m.invite_days) ? m.invite_days : Membership.INVITE_DAYS_DEFAULT;
    const expires = Membership.#expiresAt(now, days);
    /* D-610 (BOB #35, 2026-09-25): the transition is the act of the administrator whose vote COMPLETED
       the consensus, so `status_by` names `by` — not the proposer the row carried from `memberAdd`. */
    this.sql.exec(`UPDATE members SET status='invited', invite_hash=?, invite_expires=?, status_by=?, updated=? WHERE member_id=?`,
      hash, expires, by, now, memberId);
    return { ok: true, memberId, invite, expires, endorsedBy: have.sort() };
  }

  /** Vote to remove an administrator. Section 4.7. */
  adminRemove({ memberId, by, reason } = {}) {
    /* R7 (T38, K2276): the caller's standing first, before any fact about the target, so no one who may not act
       learns whether a member exists, is an administrator, or is the founder. */
    const admins = this.activeAdmins();
    if (!by || !admins.includes(by)) return notAnAdmin(by, "voting to remove an administrator");   /* R84 */
    /* The founding administrator is the root of trust (4.6) and is not
       removable by the membership model, because the membership model runs on
       an instance they control. Saying so plainly is an obligation of 4.6: no
       interface may describe the administrator model as though it bounds this
       power, because it does not. The escape hatch in the other direction is
       replacing ADMIN_TOKEN in the hosting dashboard, which returns the
       instance to unclaimed. */
    if (memberId === Membership.ROOT_ADMIN)
      return { ok: false, reason: "ROOT_OF_TRUST",
               detail: "the founding administrator holds ADMIN_TOKEN and cannot be removed from inside the "
                     + "application. Whoever can set ADMIN_TOKEN can take the group over, and there is no "
                     + "arrangement in which nobody holds that power, because your group's Civicsmith runs in "
                     + "somebody's hosting account. The remedy is at the hosting account, not here (section 4.6)." };
    const m = this.#one(`SELECT member_id, role, status FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    /* D-134: the TARGET is not an administrator — a different fact from the CALLER not being one, which is
       what NOT_AN_ADMIN says at every other site, so it carries its own code and its own canned sentence. */
    const refusal = (code, detail, extra) => Membership.#custodialRefusal(code, detail, extra);
    /* DEC-49 REGION is-remove-target-admin */
    if (m.role !== "admin")
      return refusal("TARGET_NOT_AN_ADMIN",
        "this member is not an administrator, so there is no administrator to remove; an ordinary member "
      + "is deactivated with op=memberset", { memberId });
    /* END DEC-49 REGION is-remove-target-admin */
    if (memberId === by) return { ok: false, reason: "TARGET_CANNOT_VOTE",
      detail: "the target is counted in the denominator but does not vote" };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "removals are recorded with a reason" };

    const math = Membership.adminMath(admins.length);
    if (!math.possible)
      return { ok: false, reason: "IMPOSSIBLE_AT_TWO", ...math,
               detail: `removal takes ${math.votesNeeded} of ${math.administrators} administrators and only `
                     + `${math.eligibleVoters} may vote, so it cannot be carried. That is the rule working, not `
                     + `a defect: a lone administrator must never be able to eject the other.` };

    if (this.#one(`SELECT voter FROM admin_votes WHERE kind='remove' AND target=? AND voter=?`, memberId, by))
      return { ok: false, reason: "ALREADY_VOTED", by };
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO admin_votes (kind,target,voter,reason,created) VALUES ('remove',?,?,?,?)`,
      memberId, by, why, now);

    const votes = this.#rows(`SELECT voter, reason FROM admin_votes WHERE kind='remove' AND target=?`, memberId)
      .filter((v) => admins.includes(v.voter) && v.voter !== memberId);
    if (votes.length < math.votesNeeded)
      return { ok: false, reason: "VOTES_SHORT", memberId, have: votes.length, need: math.votesNeeded,
               ...math, deciders: votes.map((v) => v.voter).sort() };

    /* Carried. Revocation is immediate and takes sessions and signing keys with it, exactly as an ordinary
       revocation does: R79's listeners are told in this act, and `credentials`' (its R16) ends the sessions and
       revokes the keys, naming the same actor. */
    /* D-610 (BOB #35, 2026-09-25): the removal is recorded under the administrator whose vote CARRIED it. */
    this.sql.exec(`UPDATE members SET status='revoked', status_by=?, updated=? WHERE member_id=?`, by, now, memberId);
    if (m.status !== "revoked") this.#announceRevoked(memberId, by, now);   /* N123, R8 */
    return { ok: true, memberId, removed: true, ...math,
             deciders: votes.map((v) => v.voter).sort(), reasons: votes.map((v) => v.reason).filter(Boolean),
             alsoDo: "removing an administrator in the application is half of an ejection. The other half is "
                   + "rotating ADMIN_TOKEN and reviewing hosting-account membership (4.8)." };
  }

  async memberAdd({ memberId, cover, role = "member", capabilities = null,
                    expertise = null, expiresInDays = undefined, by = null } = {}) {
    /* REC-159: the roster first — before the id is judged or looked up. */
    const barAdd = this.#custodialBar(by, "adding a member");
    if (barAdd) return barAdd;
    /* K57: the field is a cover, and `name` is no longer read as an alias of it (two words for one thing is how
       drift starts; a legal name is the exposure the cover exists to prevent). */
    const label = typeof cover === "string" && cover.trim() ? cover : null;
    /* D-134: C-55's row answers as it always did; every other refusal here is C-96's (DEC-49). */
    const refusal = (code, detail, extra) => {
      if (!(code in MEMBER_ID_CHECKS)) return Membership.#custodialRefusal(code, detail, extra);
      const row = MEMBER_ID_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, memberId };
    };
    /* DEC-49 REGION is-member-add-id */
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(memberId || ""))
      return refusal("BAD_MEMBER_ID", "lowercase letters, digits and dashes, 2 to 41 characters");
    /* END DEC-49 REGION is-member-add-id */
    /* REC-132 / D-422 / C-55.1: the founder's name is not an id anybody else may hold.
       The pattern above admits it and nothing else reserved it, so a member enrolled as
       `admin` would have been read as the founder by every name-keyed check
       (`isAdministrator`, `activeAdmins`). Refused BEFORE the EXISTS test and before
       anything is written, whoever asks and whatever role is asked for. */
    /* DEC-49 REGION is-member-id-reserved */
    if (memberId === Membership.ROOT_ADMIN)
      return refusal("MEMBER_ID_RESERVED",
        `'${Membership.ROOT_ADMIN}' names the founding administrator of your group's Civicsmith; no member may be `
        + `enrolled under it`);
    /* END DEC-49 REGION is-member-id-reserved */
    /* DEC-49 REGION is-member-add-shape */
    if (!label || typeof label !== "string")
      return refusal("NO_COVER",
        "a cover is the label you use to tell participants apart; it need not be, and often should not be, a legal name");
    if (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return refusal("EXISTS", `a member row already holds the id '${memberId}'; nothing was written`, { memberId });
    /* END DEC-49 REGION is-member-add-shape */

    /* D-51. v1.4 let an administrator ASSIGN expertise when creating the
       invitation, and v2 1.3 forbids exactly that: a member declares what they
       hold and an administrator confirms it, and an administrator who could
       introduce the label would be making an assignment wearing a
       confirmation's name. Refused rather than ignored, because silently
       dropping a caller's argument is how the two copies drifted apart in the
       first place. */
    if (expertise !== null && expertise !== undefined)
      return { ok: false, reason: "EXPERTISE_IS_NOT_ASSIGNED",
               detail: "expertise is declared by the member and then confirmed by an administrator "
                     + "(section 1.3). It is not set when the invitation is created, because an "
                     + "administrator who could introduce the label would be assigning it rather than "
                     + "confirming it. Use op=expertisedeclare and op=expertiseconfirm." };
    /* R97 (DEC-133 (2)): how long the invitation lasts, judged last (R12's order). */
    const days = Membership.#expiryRefusal(expiresInDays);
    if (typeof days !== "number") return days;

    const wantAdmin = role === "admin";
    const admins = this.activeAdmins();
    /* DEC-134 (1), (7): one administrator is enough, and an ordinary member may be invited from the start. The old
       floor (`ADMINS_FIRST`, C-96.5: no ordinary member until two administrators exist) is retired; a second
       administrator is a recommendation setup makes once (`instance-setup`), never a gate here. */

    const caps = Array.isArray(capabilities) ? capabilities.filter((c) => Membership.CAPABILITIES.includes(c))
                                             : ["contribute"];
    const now = new Date().toISOString();

    /* 4.7 addition. The first administrator may add a second unilaterally,
       because a group of one has nobody to consult. Every subsequent addition
       needs the consensus of all existing administrators: without that, a
       captured administrator recruits confederates and manufactures the majority
       that ejects the honest ones. */
    /* D-134 (BOB #35): the stamped actor is the INVITER, on every path. */
    const inviter = by || null;
    if (wantAdmin && admins.length >= 2) {
      this.sql.exec(
        `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,created,updated,status_by,invited_by,
                              invite_days,door)
         VALUES (?,?,NULL,'admin','proposed',NULL,?,?,?,?,?,?,'administrator')`,
        memberId, label, JSON.stringify(caps), now, now, by || null, inviter, days);
      /* REC-156: `by` is the control plane's STAMP, relayed from the query by the
         dispatch and never taken from the caller's body — so this row is the
         PROPOSER'S own endorsement. The founder's session is stamped `admin`; a
         bearer is stamped `class:<cls>`, which no roster holds, so it records none. */
      if (by && admins.includes(by))
        this.sql.exec(`INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,NULL,?)`,
          memberId, by, now);
      const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId)
        .map((r) => r.voter).filter((v) => admins.includes(v));
      /* DEC-49 REGION is-admin-consensus */
      return refusal("CONSENSUS_REQUIRED",
        "adding an administrator beyond the second requires the consensus of every existing "
      + "administrator. No invitation is issued until they have all endorsed it.",
        { memberId, proposed: true, have: have.sort(), awaiting: admins.filter((a) => !have.includes(a)).sort() });
      /* END DEC-49 REGION is-admin-consensus */
    }

    const invite = Membership.#rand(16);
    const hash = await Membership.#sha256(invite);
    const expires = Membership.#expiresAt(now, days);
    this.sql.exec(
      `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,created,updated,status_by,invited_by,
                            invite_expires,door)
       VALUES (?,?,NULL,?,?,?,?,?,?,?,?,?,'administrator')`,
      memberId, label, wantAdmin ? "admin" : "member", "invited", hash,
      JSON.stringify(caps), now, now, by || null, inviter, expires);
    /* The plaintext invite appears exactly once, here, for handing to the
       person. It is never readable again. R11 (DEC-134 (3)): no hosting-access question rides on it. */
    return { ok: true, memberId, invite, expires, role: wantAdmin ? "admin" : "member", capabilities: caps,
             invited_by: Membership.#statusBy(inviter) };
  }

  /* An invitation is a BURNER: the token in the URL is the whole credential, and
   * after use the URL resolves to nothing and carries no record of what it
   * formerly addressed (Membership Architecture section 6).
   *
   * The previous scheme put `<memberId>:<code>` in the link, so anyone who saw a
   * leaked or archived one learned who had been invited. The token is now opaque
   * and the member id is never in it, never returned by this lookup, and never
   * needed to enrol.
   *
   * A SPENT token and a token that never existed return byte-identical answers.
   * That is the security property and not tidiness: a response distinguishing
   * them would confirm to whoever found the archived link that it had once
   * addressed somebody real, which is exactly what the burner is for. */
  static #INVITE_MISS = { ok: false, reason: "NO_SUCH_INVITATION",
    detail: "this invitation is not live. An invitation is spent the moment it is used, and a spent one "
          + "cannot be told apart from one that never existed, nor from one that expired or was withdrawn." };

  async #invited(invite) {
    if (typeof invite !== "string" || !/^[0-9a-f]{16,64}$/.test(invite)) return null;
    const hash = await Membership.#sha256(invite);
    /* Looked up BY HASH, so the store never holds a usable invitation and a
       leaked database is not a set of live credentials. */
    const m = this.#one(
      `SELECT member_id, cover, role, status, capabilities, invite_expires
       FROM members WHERE invite_hash=? AND status='invited'`, hash);
    /* R97: an expired invitation answers as a spent one, byte for byte, and nothing revives it (no act moves an
       expiry). One made before invitations expired (NULL) stays as it was made. */
    return m && !Membership.#expired(m.invite_expires) ? m : null;
  }

  /** What a burner URL resolves to. Unauthenticated by necessity: the invitee
   *  holds no credential yet, which is what the invitation is for. */
  async inviteLook({ invite } = {}) {
    const m = await this.#invited(invite);
    if (!m) return { ...Membership.#INVITE_MISS };
    /* The cover and capabilities are shown because the invitee is entitled to
       see what they are being asked to join as. The member id is NOT: it is the
       administrator's handle on them inside the roster, and the record will show
       the handle they are about to choose instead. */
    /* K57 (R15): `expertise` is the member's own record as R24 answers it (`member_expertise`), which for an
       invitee is empty: expertise is declared by an active member and never assigned by an invitation. */
    return { ok: true, cover: m.cover, role: m.role, capabilities: this.#capsOf(m),
             expertise: this.expertiseList({ memberId: m.member_id }).expertise };
  }

  async enroll({ invite, handle, password } = {}) {
    /* No member id. The token identifies the invitation, and requiring the id as
       well meant the link had to carry it, which is what leaked the invitee. */
    const m = await this.#invited(invite);
    if (!m) return { ...Membership.#INVITE_MISS };
    /* The handle is the member's OWN name and the one the record shows, so it is
       chosen here and not by the administrator who issued the invitation. Unique
       across the instance, because a roster in which two people can answer to one
       name defeats the purpose of having one. */
    const h = String(handle ?? "").trim();
    if (!h) return { ok: false, reason: "NO_HANDLE",
      detail: "choose a handle. It is what the record shows: the author of a promotion, the attestor of a "
            + "ratification, the participant list of a project. It is yours, not the label the administrator "
            + "used to invite you." };
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(h))
      return { ok: false, reason: "BAD_HANDLE", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    /* R16, R124 (T40; DEC-184 (1), DEC-186 (2)): taken when another member holds it now or held it before. */
    if (this.#heldByAnother(h, m.member_id)) return { ok: false, reason: "HANDLE_TAKEN", handle: h };
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    /* R95 (K774): the password is set by the registered setter, inside this act and before anything here is
       written, so a setter that did not write leaves the invitation live and the member as they were. */
    if (!(await this.#setEnrolmentPassword(`member:${m.member_id}`, password))) return Membership.#enrolNotRecorded();
    /* Cover, capabilities and role are the administrator's and are NOT read from
       this call. An invitee who posts their own is ignored rather than refused,
       because the fields are not theirs to send and naming them in an error
       would teach a caller to try. Section 6: already attached, not editable.
       The invite hash is cleared, so the burner URL resolves to nothing
       afterwards and a leaked or archived link is inert. */
    /* D-610 (BOB #35, 2026-09-25): enrolment is the MEMBER'S own act, so `status_by` names them and no
       longer carries the inviter's stamp onto a status the inviter did not set. */
    this.sql.exec(`UPDATE members SET status='active', handle=?, invite_hash=NULL, status_by=?, updated=? WHERE member_id=?`,
      h, m.member_id, new Date().toISOString(), m.member_id);
    /* R108 (DEC-136 (1)): while the group chose to tell its members, the joining statement, given here once (an
       enrolment succeeds once per member); otherwise the key is absent. */
    return { ok: true, memberId: m.member_id, handle: h,
             ...(this.courtNotice().choice === "tell" ? { courtStatement: Membership.COURT_STATEMENT } : {}) };
  }

  /* R95: the enrolment whose password could not be set. Nothing was written, the invitation is still live, and the
     answer says so; its row is this module's C-96.18. */
  static #enrolNotRecorded() {
    /* DEC-49 REGION is-enrol-password-set */
    const row = MEMBERSHIP_CHECKS.ENROL_NOT_RECORDED;
    return { ok: false, reason: "ENROL_NOT_RECORDED", code: "ENROL_NOT_RECORDED", check: row.check,
             translation: row.translation,
             detail: "the password could not be recorded, so the enrolment did not happen: the member is not active "
                   + "and the invitation is still live. Nothing was written." };
    /* END DEC-49 REGION is-enrol-password-set */
  }

  memberList({ administer, viewer = null } = {}) {
    /* THE COVER↔HANDLE PROJECTION (Membership Architecture v1 §3 and v2 §3,
       identical and unambiguous: "Pairing. Only administrators see cover and
       handle together"), and it is a PROJECTION rather than a refusal, because
       the same section says "Members and the public see handles". A member
       legitimately needs this roster — the participant list of a project, the
       author of a promotion, the attestor of a ratification — so the answer is
       the handle roster with the pairing withheld, never a closed door.
       D-157, MEASURED 2026-08-02: before this, an ordinary member's session and
       the shared MEMBER_TOKEN each received `handle` AND `cover` for every
       member, byte-identical to the administrator's view, while three comments
       in this source said the op was admin-only.

       THE STAKE, said here because this is the line that keeps it. schema.mjs
       on `members.cover`: the cover-and-handle split exists precisely so that a
       roster seized or subpoenaed does not deanonymise the group. A handle is
       already public — the record shows it. A cover is the administrator's
       private label for a person. Either one alone is inert; TOGETHER they are
       the map from the public record back to the people in it, and withholding
       that map from everyone who is not an administrator is the whole mechanism.
       This is the rare defect whose blast radius is OUTSIDE the project: the
       people in the roster are the ones it costs.

       `cover` is therefore NOT SELECTED for a caller who does not administer.
       The key is ABSENT from the row, not null and not blank — a key that is
       present and empty still confirms to whoever is asking that a pairing
       exists to be compelled.

       FAIL CLOSED. `administer` is stamped by the CONTROL PLANE from the
       credential that authenticated (control-plane, beside the D-15 viewer stamp)
       and is never taken from the request, the same impostor rule `viewer`,
       `author`, `by` and `owner` follow. Anything that is not the affirmative
       stamp — absent, blank, a caller's invention, a direct-DO route that
       forgot it — yields the handle roster, so a bypass of the stamp loses the
       pairing rather than leaking it. */
    const pairs = administer === true || administer === "1";
    return { members: this.#rows(
      `SELECT member_id, ${pairs ? "cover, " : ""}handle, role, status, status_by, invited_by, capabilities, pairing_published, created, updated,
              CASE WHEN invite_hash IS NULL THEN 0 ELSE 1 END AS invite_pending,
              door, approved_by, invite_expires, invite_withdrawn
       FROM members ORDER BY member_id`).map(({ door, approved_by, invite_expires, invite_withdrawn, ...r }) => ({
         ...r, capabilities: this.#capsOf(r),
         status_by: Membership.#statusBy(r.status_by),   /* REC-159: who set the status, or `not recorded` */
         invited_by: Membership.#statusBy(r.invited_by), /* D-134 (BOB #35): who invited them, or `not recorded` */
         /* D-51: served from `member_expertise`, not from the dead column on
            this row. Two places answering the same question, one of them never
            updated, is the shape that produces a roster nobody can trust. */
         expertise: this.expertiseList({ memberId: r.member_id }).expertise,
         /* R17, R124 (T40; DEC-186 (2)): the member's earlier handles, latest first, to every caller R17 answers. */
         formerly: this.#formerly(r.member_id, r.handle),
         pairing_published: r.pairing_published === 1,              /* R19 */
         ...(pairs ? { projects: this.#projectsOf(r.member_id, viewer),        /* R18: an administrator's roster */
                       /* R105: how each came in and their invitation, for an administrator's roster only. */
                       door: door ?? "administrator", approvedBy: approved_by ?? null,
                       expires: r.status === "proposed" ? null : invite_expires ?? null,
                       invitation: Membership.#invitationState(r, invite_expires, invite_withdrawn) } : {}) })) };
  }

  /* ===== T40 (T40-M; N797, N799; DEC-184, DEC-186, Bob's "S18: B"; K1881, K2394) — A MEMBER'S HANDLE, CHECKED AS IT
   * IS TYPED AND CHANGED BY ITS MEMBER =====
   *
   * A handle is unique in the group (R16), and a handle a member held before stays theirs: it is taken for every other
   * member (at enrolment and at a change), so "formerly mai-k" never names someone else, and its member may take it
   * back (R124). Earlier handles live in `handle_history`, append-only and never deleted (R57). The check (R123) says
   * only free, taken or not allowed, never who holds a handle or that it was someone's earlier one, and counts every
   * call against a window per invitation or member (K1881's protective limit). A change is refused once the member's
   * work is in a published case, a fact a later module (`publication`, its R76) answers through the one guard it
   * registers (R125); with no guard, or one that cannot answer, the change fails closed. A published case keeps the
   * handle it was signed with: nothing here rewrites a signed document or another module's row. */

  static HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{1,40}$/;

  /* R123 (K1881): 60 checks in any 10 minutes, per invitation or per member, by a two-bucket sliding window
     (`credentials` R38's form; `capture` R31's). */
  static HANDLE_CHECK_WINDOW = Object.freeze({ perKey: 60, windowMs: 10 * 60_000 });

  static HANDLE_CHECK_STATED = `at most ${Membership.HANDLE_CHECK_WINDOW.perKey} handle checks in any `
    + `${Membership.HANDLE_CHECK_WINDOW.windowMs / 60_000} minutes for one invitation or one member`;

  /* Whether another member than `self` holds `handle` now or held it before (R16, R124). */
  #heldByAnother(handle, self) {
    return !!this.#one(`SELECT 1 AS x FROM members WHERE handle=? AND member_id<>?
                        UNION ALL SELECT 1 AS x FROM handle_history WHERE from_handle=? AND member_id<>? LIMIT 1`,
      handle, self ?? "", handle, self ?? "");
  }

  /* R17, R124: a member's earlier handles, latest first, each once, the current one left out. */
  #formerly(memberId, current) {
    const out = [];
    for (const r of this.#rows(`SELECT from_handle FROM handle_history WHERE member_id=? ORDER BY seq DESC`, memberId))
      if (r.from_handle !== current && !out.includes(r.from_handle)) out.push(r.from_handle);
    return out;
  }

  /* R123: what in a typed handle does not fit R12's pattern: `length` (2 to 41), `start` (a letter or digit) and
     `characters`, naming each character outside lower-case letters, digits and hyphens, once, in the order typed. */
  static #handleProblems(h) {
    const problems = [];
    if (h.length < 2 || h.length > 41) problems.push({ problem: "length", min: 2, max: 41 });
    if (h.length && !/^[a-z0-9]/.test(h)) problems.push({ problem: "start" });
    const odd = [...new Set([...h].filter((c) => !/[a-z0-9-]/.test(c)))].slice(0, 20);
    if (odd.length) problems.push({ problem: "characters", characters: odd });
    return problems;
  }

  /* R123: the smallest `<handle>-2`, `-3`, … that R12's pattern admits and no member but `self` holds or held; null when
     none fits 41 characters. The handles so far taken under that stem are read once. */
  #suggestion(h, self) {
    const stem = `${h}-`;
    const taken = new Set(this.#rows(
      `SELECT handle AS h FROM members WHERE substr(handle, 1, ?) = ? AND member_id<>?
       UNION SELECT from_handle AS h FROM handle_history WHERE substr(from_handle, 1, ?) = ? AND member_id<>?`,
      stem.length, stem, self ?? "", stem.length, stem, self ?? "").map((r) => r.h));
    for (let n = 2; ; n++) {
      const cand = `${stem}${n}`;
      if (cand.length > 41) return null;
      if (!taken.has(cand)) return cand;
    }
  }

  /* R123's window for one key at `now`: `prev × (1 − elapsed/W) + cur`. */
  #handleCheckEstimate(key, now) {
    const W = Membership.HANDLE_CHECK_WINDOW.windowMs;
    const win = Math.floor(now / W);
    const at = (w) => Number(this.#one(`SELECT count FROM handle_check_window WHERE key=? AND win=?`, key, w)?.count ?? 0);
    return { prev: at(win - 1), cur: at(win), win, f: (now - win * W) / W };
  }

  /* Whole seconds until the estimate falls below the bound, no further check counted. */
  static #handleCheckRetry({ prev, cur, f }) {
    const W = Membership.HANDLE_CHECK_WINDOW.windowMs, N = Membership.HANDLE_CHECK_WINDOW.perKey;
    let ms;
    if (cur < N && prev > 0 && 1 - (N - cur) / prev < 1) ms = Math.max(0, (1 - (N - cur) / prev - f) * W);
    else ms = (1 - f) * W + Math.max(0, 1 - N / Math.max(cur, 1)) * W;
    return Math.max(1, Math.ceil(ms / 1000) + 1);
  }

  /* R123 (DEC-188 (7)): the paused answer's fields: `stated`, `retryAfter` in whole seconds, and `minutes`, the whole
     minutes until then, rounded up, which the translation's `{minutes}` names. */
  static #pausedFor(retryAfter) {
    return { stated: Membership.HANDLE_CHECK_STATED, retryAfter, minutes: Math.ceil(retryAfter / 60) };
  }

  /** R123 (DEC-184 (2), (3), DEC-186 (3); K1881; `op=handlecheck`): whether `handle` could be taken in this group now,
   *  as a person types it, asked with a live invitation or by an active member (`viewer`). Free, taken (with a
   *  suggestion) or not allowed (naming what does not fit), never who holds it. Writes only its count; never throws. */
  async handleCheck({ invite = null, handle = null, viewer = null } = {}) {
    try {
      /* Who asks: a live invitation (R15's reading), else an active member's own viewer; else R15's answer. */
      let key = null, self = null;
      const m = invite !== null && invite !== undefined ? await this.#invited(invite) : null;
      if (m) { key = `invite:${await Membership.#sha256(invite)}`; self = m.member_id; }
      else {
        const who = viewerPredicate(viewer).member;
        const row = who && who !== Membership.ROOT_ADMIN
          ? this.#one(`SELECT member_id, status FROM members WHERE member_id=?`, who) : null;
        if (row && row.status === "active") { key = `member:${row.member_id}`; self = row.member_id; }
      }
      if (!key) return { ...Membership.#INVITE_MISS };
      const now = Date.now();
      const est = this.#handleCheckEstimate(key, now);
      /* DEC-49 REGION is-handle-check-window */
      if (est.prev * (1 - est.f) + est.cur >= Membership.HANDLE_CHECK_WINDOW.perKey)
        return Membership.#rowRefusal("HANDLE_CHECK_PAUSED",
          "too many handles were checked for this invitation or member in the last few minutes, so this one was not "
          + "read. Nothing was changed.",
          Membership.#pausedFor(Membership.#handleCheckRetry(est)));
      /* END DEC-49 REGION is-handle-check-window */
      this.sql.exec(`INSERT INTO handle_check_window (key, win, count) VALUES (?,?,1)
                     ON CONFLICT(key, win) DO UPDATE SET count=count+1`, key, est.win);
      this.sql.exec(`DELETE FROM handle_check_window WHERE win < ?`, est.win - 1);
      const h = String(handle ?? "").trim();
      const shown = h.slice(0, 80);
      const words = (k) => ({ key: k, en: HANDLE_WORDS[k] });
      if (!Membership.HANDLE_PATTERN.test(h))
        return { ok: true, handle: shown, state: "not_allowed", problems: Membership.#handleProblems(h), suggestion: null,
                 words: words("handle.characters") };
      if (this.#heldByAnother(h, self))
        return { ok: true, handle: shown, state: "taken", problems: [], suggestion: this.#suggestion(h, self),
                 words: words("handle.taken") };
      return { ok: true, handle: shown, state: "free", problems: [], suggestion: null, words: words("handle.free") };
    } catch { return { ...Membership.#INVITE_MISS }; }
  }

  /* R125 (DEC-186 (1); K2376 (4); R116's form): the one guard R124 asks whether a member's work is in a published case.
     One later module (`publication`, its R76) registers once at start; the slot takes one registration whoever makes
     it, so its refusals are R81's, naming the holder. */
  #handleGuard = null;   // {module, fn}

  registerHandleGuard(module, fn) {
    const refused = listenerRefusal(this.#handleGuard, module, fn);
    if (refused) return refused;
    this.#handleGuard = { module, fn };
    return { ok: true, module };
  }

  /* R124, R125: the guard's answer for a member: `{fixed: {case, edition}}`, `{clear: true}`, or `{unchecked: true}` when
     no guard is registered, it throws, or it answers anything but null or a case (fail closed). Called synchronously,
     before any write; a promise is not an answer. */
  #publishedWork(memberId) {
    const guard = this.#handleGuard;
    if (!guard) return { unchecked: true };
    let r;
    try { r = guard.fn({ memberId }); } catch { return { unchecked: true }; }
    if (r === null) return { clear: true };
    if (r && typeof r.then === "function") { r.then(null, () => {}); return { unchecked: true }; }
    if (isObj(r) && typeof r.case === "string" && r.case && r.unreadable !== true)
      return { fixed: { case: r.case.slice(0, 200),
                        edition: typeof r.edition === "string" || Number.isInteger(r.edition) ? r.edition : null } };
    return { unchecked: true };
  }

  /** R124 (DEC-186 (1)–(3); `op=handlechange`): a member changes their own handle, until their work first appears in a
   *  published case. Refusals in order, each writing nothing; a handle equal to the current one changes nothing;
   *  otherwise, in one act, the handle becomes `handle` and `{member, from, to, at}` is appended to the history. */
  handleChange({ handle = null, by = null } = {}) {
    const self = typeof by === "string" && by && by !== Membership.ROOT_ADMIN && !by.startsWith(MACHINE_CLASS_PREFIX)
      ? this.#one(`SELECT member_id, handle, status FROM members WHERE member_id=?`, by) : null;
    /* DEC-49 REGION is-handle-change-member */
    if (!self || self.status !== "active")
      return Membership.#rowRefusal("HANDLE_CHANGE_NOT_A_MEMBER",
        "a handle is changed by its own member, signed in, and the caller is not an active member of this group (a "
        + "machine credential, an operator token and the founding administrator hold no handle). Nothing was written.",
        { by: Membership.#echo(by ?? null) });
    /* END DEC-49 REGION is-handle-change-member */
    const h = String(handle ?? "").trim();
    if (!h) return { ok: false, reason: "NO_HANDLE",
      detail: "choose a handle. It is what the record shows of you inside the group. Nothing was written." };
    if (!Membership.HANDLE_PATTERN.test(h))
      return { ok: false, reason: "BAD_HANDLE", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    const work = this.#publishedWork(self.member_id);
    /* DEC-49 REGION is-handle-fixed */
    if (work.fixed)
      return Membership.#rowRefusal("HANDLE_FIXED",
        `your work appears in a published case (${work.fixed.case}), which is signed and permanent, so your handle is `
        + "fixed from then on (DEC-186 (1)). Nothing was written.",
        { case: work.fixed.case, edition: work.fixed.edition });
    if (work.unchecked)
      return Membership.#rowRefusal("HANDLE_CHANGE_UNCHECKED",
        "whether your work appears in a published case could not be read, so the change was not made: a handle is not "
        + "changed on a guess. Nothing was written.");
    /* END DEC-49 REGION is-handle-fixed */
    if (this.#heldByAnother(h, self.member_id)) return { ok: false, reason: "HANDLE_TAKEN", handle: h };
    if (h === self.handle) return { ok: true, unchanged: true };
    const at = new Date().toISOString();
    this.sql.exec(`UPDATE members SET handle=?, updated=? WHERE member_id=?`, h, at, self.member_id);
    if (self.handle)
      this.sql.exec(`INSERT INTO handle_history (member_id, from_handle, to_handle, at) VALUES (?,?,?,?)`,
        self.member_id, self.handle, h, at);
    return { ok: true, handle: h, formerly: this.#formerly(self.member_id, h) };
  }

  memberSet({ memberId, status, by = null } = {}) {
    /* REC-159: the roster first, before any lookup; `by` is the plane's stamp. */
    const barSet = this.#custodialBar(by, "setting a member's status");
    if (barSet) return barSet;
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const m = this.#one(`SELECT status, role FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    /* 4.4: administrator status cannot be taken away by another administrator.
       Revoking an administrator IS taking it away, so it goes through the
       section 4.7 vote or it does not happen. This is what stops an instance
       being captured by whoever acts first in a dispute. */
    const refusal = (code, detail, extra) => Membership.#custodialRefusal(code, detail, extra);   /* D-134 / C-96 */
    /* DEC-49 REGION is-admin-requires-vote */
    if (m.role === "admin" && status === "revoked")
      return refusal("ADMIN_REQUIRES_VOTE",
        "an administrator is removed by a majority of all administrators, counting the target "
      + "in the denominator but not letting them vote (section 4.7). No administrator may strip "
      + "another unilaterally.");
    /* END DEC-49 REGION is-admin-requires-vote */
    /* 4.9: reactivating a former administrator must NOT restore their
       administrator status.
     *
     * A 4.7 removal sets status='revoked' and leaves role='admin' on the row,
     * because the vote ejects them from the office and does not erase the
     * person. Before this rule, any administrator could call memberset(active)
     * and put an ejected administrator straight back with the office intact,
     * undoing a group decision with one call. That defeats 4.7's
     * consensus-on-addition, which exists precisely so administrators cannot be
     * manufactured unilaterally.
     *
     * So they come back as an ordinary MEMBER. Reactivating the person is a
     * single administrator's call; restoring the office goes through the 4.7
     * addition process like any other appointment. */
    const demoted = status === "active" && m.role === "admin" && m.status !== "active";
    const now = new Date().toISOString();
    const actor = by || null;   /* REC-159: `status_by`, NULL (read `not recorded`) when nothing was stamped */
    if (demoted)
      this.sql.exec(`UPDATE members SET status=?, role='member', status_by=?, updated=? WHERE member_id=?`,
        status, actor, now, memberId);
    else
      this.sql.exec(`UPDATE members SET status=?, status_by=?, updated=? WHERE member_id=?`, status, actor, now, memberId);
    /* Revocation is immediate: R79's listeners are told in this act, and `credentials`' (its R16) ends the
       member's live sessions and revokes their keys, naming this act's actor (REC-159). */
    if (status === "revoked" && m.status !== "revoked") this.#announceRevoked(memberId, actor, now);   /* N123, R20 */
    return { ok: true, memberId, status, by: Membership.#statusBy(actor), ...(demoted ? { demoted: true,
      detail: "reactivated as an ordinary member. Administrator status is not restored by reactivation: "
            + "the group voted them out under 4.7, and putting them back is an appointment, which needs "
            + "the consensus of all existing administrators like any other." } : {}) };
  }

  /* ===== T34 (T34-10; DEC-132 to DEC-136, Bob's; K1745) — INVITATIONS THAT EXPIRE, THE GROUP'S TWO DOORS, ADDRESSING
   * A CHECK, AND THE GROUP'S OWN SETTINGS =====
   *
   * Every new refusal is a row of this module's (C-96.22–.38) answered through `#rowRefusal`, its code a literal at
   * the one region its row's `where` names; the administrator's refusal is R84's. A secret this module hands out (an
   * invitation, a website key, a join link) is returned once and held only as its hash (R111). No service here sends a
   * message (R105): an invitation reaches its person only through the answer to its caller. */

  static INVITE_DAYS_DEFAULT = 7;

  static INVITE_DAYS_MAX = 30;

  /* A refusal carrying its row from MEMBERSHIP_CHECKS: `reason` and `code` the same literal, `#custodialRefusal`'s
     shape. The caller's fields sit beside the row's and never replace them. */
  static #rowRefusal(code, detail, extra) {
    const row = MEMBERSHIP_CHECKS[code];
    return { ...(extra || {}), ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
  }

  /* R97: the days an invitation lasts: 7 when not given, else a whole number from 1 to 30; anything else BAD_EXPIRY.
     Answers the number, or the refusal. One judgment for R12, R99, R100, R102 and R103. */
  static #expiryRefusal(v) {
    if (v === undefined || v === null) return Membership.INVITE_DAYS_DEFAULT;
    if (Number.isInteger(v) && v >= 1 && v <= Membership.INVITE_DAYS_MAX) return v;
    /* DEC-49 REGION is-invitation-expiry */
    return Membership.#rowRefusal("BAD_EXPIRY",
      `an invitation lasts a whole number of days from 1 to ${Membership.INVITE_DAYS_MAX} (seven when none is chosen), `
      + "and the number given is not one. Nothing was written.", { expiresInDays: Membership.#echo(v) });
    /* END DEC-49 REGION is-invitation-expiry */
  }

  /* R99: the daily number of invitations a door may make, a whole number of at least 1, which the administrator sets;
     `required` when nothing stands for it yet (a creation or an enabling). Answers the number, or the refusal. */
  static #dailyCapRefusal(v, required) {
    if (!required && (v === undefined || v === null)) return null;
    if (Number.isInteger(v) && v >= 1) return v;
    /* DEC-49 REGION is-door-daily-cap */
    return Membership.#rowRefusal("BAD_DAILY_CAP",
      "a door makes at most a daily number of invitations the administrator sets: a whole number, at least 1, with "
      + "no default. Nothing was written.", { dailyCap: Membership.#echo(v) });
    /* END DEC-49 REGION is-door-daily-cap */
  }

  /* R99 "BAD_CAPABILITY as R9": the door's capabilities, `["contribute"]` when not given; a non-array or a word outside
     the vocabulary (`administer` among them) is R9's refusal, naming the words and the vocabulary. Answers the list
     (each word once, in the order given), or the refusal. */
  static #doorCapabilities(v, required) {
    if (v === undefined || v === null) return required ? ["contribute"] : null;
    if (!Array.isArray(v)) return { ok: false, reason: "BAD_CAPABILITY", detail: "capabilities is an array" };
    const bad = v.filter((c) => !Membership.CAPABILITIES.includes(c));
    if (bad.length) return { ok: false, reason: "BAD_CAPABILITY", got: bad.map(Membership.#echo), known: Membership.CAPABILITIES };
    return [...new Set(v)];
  }

  /* A caller's value echoed back in a refusal: never more than it can carry safely. */
  static #echo(v) {
    try { return typeof v === "string" ? v.slice(0, 40) : typeof v === "number" || typeof v === "boolean" || v === null ? v : String(v).slice(0, 40); }
    catch { return null; }
  }

  static #expiresAt(nowIso, days) { return new Date(Date.parse(nowIso) + days * 86_400_000).toISOString(); }

  static #expired(expires) { return typeof expires === "string" && Date.parse(expires) <= Date.now(); }

  /* R105: an invitation's state on an administrator's roster. A proposed administrator has none yet. */
  static #invitationState(r, expires, withdrawn) {
    if (r.status === "proposed") return null;
    if (withdrawn) return "withdrawn";
    if (r.status === "invited") return r.invite_pending ? (Membership.#expired(expires) ? "expired" : "live") : "expired";
    if (r.status === "revoked" && !r.handle) return "withdrawn";   /* revoked (R20) before it was used */
    return "spent";
  }

  /* ---- R98 (DEC-133 (3)): withdrawing an unused invitation ---- */

  inviteWithdraw({ memberId, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "withdrawing an invitation");   /* R84 */
    const m = this.#one(`SELECT status, invite_hash FROM members WHERE member_id=?`, memberId);
    if (!m) return noSuchMember(memberId);   /* R121 (N793): C-96.47 minted at its one site */
    /* DEC-49 REGION is-invitation-unused */
    if (m.status !== "invited" || !m.invite_hash)
      return Membership.#rowRefusal("NO_UNUSED_INVITATION",
        "only an invitation that has not been used, live or expired, is withdrawn, and this member holds none: they "
        + "have joined, theirs was withdrawn, or none was made yet. Nothing was written.", { memberId, status: m.status });
    /* END DEC-49 REGION is-invitation-unused */
    const now = new Date().toISOString();
    /* Dead at once (the hash goes, so R15 answers NO_SUCH_INVITATION), and the member is revoked, told as R20 tells. */
    this.sql.exec(`UPDATE members SET status='revoked', invite_hash=NULL, invite_withdrawn=?, status_by=?, updated=?
                    WHERE member_id=?`, now, by, now, memberId);
    this.#announceRevoked(memberId, by, now);
    return { ok: true, memberId, status: "revoked", invitation: "withdrawn", by, at: now };
  }

  /* ---- R99-R105 (DEC-133): the group's two doors ---- */

  static DOOR_WARNING = "Anyone your website lets through can join and see your group's shared work, including people you "
    + "are looking into. Keep sensitive work in hidden projects.";

  static #DOOR = {
    website: { door: "website", start: "create", stop: "revoke", actor: "website" },
    link: { door: "join link", start: "enable", stop: "off", actor: "join-link" },
  };

  /* A door's latest row, and whether it is live (its latest row neither a revocation nor a switching off). */
  #doorNow(kind) {
    const d = Membership.#DOOR[kind];
    const r = this.#one(`SELECT door_id, event, secret_hash, capabilities, daily_cap, expires_days FROM join_doors
                          WHERE door=? ORDER BY seq DESC LIMIT 1`, d.door);
    if (!r || r.event === d.stop) return null;
    return { id: r.door_id, hash: r.secret_hash, capabilities: this.#capsOf(r), dailyCap: r.daily_cap,
             expiresInDays: r.expires_days };
  }

  #doorAppend(kind, id, event, hash, s, by, at) {
    this.sql.exec(`INSERT INTO join_doors (door, door_id, event, secret_hash, capabilities, daily_cap, expires_days, set_by, at)
                   VALUES (?,?,?,?,?,?,?,?,?)`, Membership.#DOOR[kind].door, id, event, hash,
      JSON.stringify(s.capabilities), s.dailyCap, s.expiresInDays, by, at);
  }

  /* A door's settings, each judged as R99 judges it: `required` at a creation or an enabling (capabilities default,
     the cap required, the days default), else each left as `held` has it when not given. Answers the settings, or the
     first refusal in R99's order. */
  static #doorSettings({ capabilities, dailyCap, expiresInDays }, held) {
    const required = !held;
    const caps = Membership.#doorCapabilities(capabilities, required);
    if (caps && !Array.isArray(caps)) return caps;
    const cap = Membership.#dailyCapRefusal(dailyCap, required);
    if (cap && typeof cap !== "number") return cap;
    let days = held ? held.expiresInDays : Membership.INVITE_DAYS_DEFAULT;
    if (expiresInDays !== undefined && expiresInDays !== null || required) {
      days = Membership.#expiryRefusal(expiresInDays);
      if (typeof days !== "number") return days;
    }
    return { ok: true, capabilities: caps ?? held.capabilities, dailyCap: cap ?? held.dailyCap, expiresInDays: days };
  }

  static #secret() { return Membership.#rand(32); }

  static #doorIdOf() { return Membership.#rand(8); }

  /* R100's refusal when no key is live, and R103's when no link is: each minted in its one region. */
  #liveWebsiteKey(act) {
    const now = this.#doorNow("website");
    if (now) return now;
    /* DEC-49 REGION is-website-key-live */
    return Membership.#rowRefusal("NO_WEBSITE_KEY",
      `${act} acts on the group's live website key, and there is none. Nothing was written.`);
    /* END DEC-49 REGION is-website-key-live */
  }

  #liveJoinLink(act) {
    const now = this.#doorNow("link");
    if (now) return now;
    /* DEC-49 REGION is-join-link-live */
    return Membership.#rowRefusal("JOIN_LINK_OFF",
      `${act} acts on the group's join link, and it is off. Nothing was written.`);
    /* END DEC-49 REGION is-join-link-live */
  }

  /** R99: an administrator creates the website key, at most one live. The key is answered once and never again. */
  websiteKeyCreate({ capabilities, dailyCap, expiresInDays, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "creating the group's website key");   /* R84 */
    /* DEC-49 REGION is-website-key-one */
    if (this.#doorNow("website"))
      return Membership.#rowRefusal("WEBSITE_KEY_EXISTS",
        "the group holds one live website key at a time (DEC-133). Nothing was created.");
    /* END DEC-49 REGION is-website-key-one */
    const s = Membership.#doorSettings({ capabilities, dailyCap, expiresInDays }, null);
    if (!s.ok) return s;
    const key = Membership.#secret(), keyId = Membership.#doorIdOf(), at = new Date().toISOString();
    this.#doorAppend("website", keyId, "create", sha256HexSync(key), s, by, at);
    return { ok: true, keyId, key, capabilities: s.capabilities, dailyCap: s.dailyCap, expiresInDays: s.expiresInDays,
             warning: Membership.DOOR_WARNING };
  }

  /** R100: the live key's scope, cap or invitation days changed, each as R99 judges it, each kept when not given. */
  websiteKeySet({ capabilities, dailyCap, expiresInDays, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "changing the group's website key");   /* R84 */
    const live = this.#liveWebsiteKey("changing the website key");
    if (live.ok === false) return live;
    const s = Membership.#doorSettings({ capabilities, dailyCap, expiresInDays }, live);
    if (!s.ok) return s;
    const at = new Date().toISOString();
    this.#doorAppend("website", live.id, "set", live.hash, s, by, at);
    return { ok: true, keyId: live.id, capabilities: s.capabilities, dailyCap: s.dailyCap, expiresInDays: s.expiresInDays,
             by, at };
  }

  /** R100: the live key is dead at once; the invitations it made stay as they are (R98 withdraws them). */
  websiteKeyRevoke({ by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "switching off the group's website key");   /* R84 */
    const live = this.#liveWebsiteKey("switching off the website key");
    if (live.ok === false) return live;
    const at = new Date().toISOString();
    this.#doorAppend("website", live.id, "revoke", null, live, by, at);
    return { ok: true, keyId: live.id, revoked: true, by, at };
  }

  /* The live door whose secret this is, or null: a secret that is not 64 lowercase hex characters names none, and is
     never hashed against the log. */
  #doorFor(kind, secret) {
    if (typeof secret !== "string" || !/^[0-9a-f]{64}$/.test(secret)) return null;
    const live = this.#doorNow(kind);
    return live && live.hash === sha256HexSync(secret) ? live : null;
  }

  /* The cover a door's caller gives: a non-empty string, or null. */
  static #doorCover(cover) { return typeof cover === "string" && cover.trim() ? cover : null; }

  /* How many invitations this door's actor made in the 24 hours before now. */
  #doorToday(actor) {
    const since = new Date(Date.now() - 86_400_000).toISOString();
    return this.#one(`SELECT COUNT(*) AS n FROM members WHERE invited_by=? AND created>?`, actor, since).n;
  }

  /* R101, R104, R105: an ordinary member made through a door: role `member`, `invited` (never proposed), under a fresh
     member id R12's pattern admits and nothing in the request derives, `invited_by` and `status_by` the door's actor,
     the door's capabilities, an invitation that expires after the door's days. Answers `{invite, expires}` once. */
  async #doorMember(kind, live, cover, approvedBy) {
    const d = Membership.#DOOR[kind];
    const actor = `${d.actor}:${live.id}`;
    let memberId;
    do memberId = `m-${Membership.#rand(10)}`;
    while (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId));
    const invite = Membership.#rand(16);
    const now = new Date().toISOString();
    const expires = Membership.#expiresAt(now, live.expiresInDays);
    this.sql.exec(
      `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,created,updated,status_by,invited_by,
                            invite_expires,door,approved_by)
       VALUES (?,?,NULL,'member','invited',?,?,?,?,?,?,?,?,?)`,
      memberId, cover, await Membership.#sha256(invite), JSON.stringify(live.capabilities), now, now, actor, actor,
      expires, d.door, approvedBy);
    return { ok: true, invite, expires };
  }

  /** R101: the website's call: one invitation for one cover name, with the approver's name as the website reports it. */
  async websiteInvite({ key, cover, approvedBy = null } = {}) {
    const live = this.#doorFor("website", key);
    /* DEC-49 REGION is-website-key-known */
    if (!live)
      return Membership.#rowRefusal("WEBSITE_KEY_UNKNOWN",
        "this key opens no door of this group: it was never made, was switched off, or is not a key, and the answer "
        + "is the same for each. Nothing was written.");
    /* END DEC-49 REGION is-website-key-known */
    const label = Membership.#doorCover(cover);
    if (!label) return Membership.#custodialRefusal("NO_COVER",
      "the website names the person by the cover the group will know them by. Nothing was written.");
    /* DEC-49 REGION is-website-daily-cap */
    if (this.#doorToday(`website:${live.id}`) >= live.dailyCap)
      return Membership.#rowRefusal("WEBSITE_DAILY_CAP",
        "the website key has made its daily number of invitations in the last 24 hours. Nothing was written.",
        { dailyCap: live.dailyCap });
    /* END DEC-49 REGION is-website-daily-cap */
    const a = approvedBy === null || approvedBy === undefined ? "" : String(approvedBy).trim().slice(0, 120);
    return this.#doorMember("website", live, label, a || null);
  }

  /** R102: an administrator switches the join link on, at most one live. The link is answered once and never again. */
  joinLinkEnable({ capabilities, dailyCap, expiresInDays, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "switching on the group's join link");   /* R84 */
    /* DEC-49 REGION is-join-link-one */
    if (this.#doorNow("link"))
      return Membership.#rowRefusal("JOIN_LINK_ON",
        "the group holds one live join link at a time (DEC-133 (6)). Nothing was changed.");
    /* END DEC-49 REGION is-join-link-one */
    const s = Membership.#doorSettings({ capabilities, dailyCap, expiresInDays }, null);
    if (!s.ok) return s;
    const link = Membership.#secret(), linkId = Membership.#doorIdOf(), at = new Date().toISOString();
    this.#doorAppend("link", linkId, "enable", sha256HexSync(link), s, by, at);
    return { ok: true, linkId, link, capabilities: s.capabilities, dailyCap: s.dailyCap, expiresInDays: s.expiresInDays,
             warning: Membership.DOOR_WARNING };
  }

  /** R103: the live link's settings changed, as R100 changes the key's. */
  joinLinkSet({ capabilities, dailyCap, expiresInDays, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "changing the group's join link");   /* R84 */
    const live = this.#liveJoinLink("changing the join link");
    if (live.ok === false) return live;
    const s = Membership.#doorSettings({ capabilities, dailyCap, expiresInDays }, live);
    if (!s.ok) return s;
    const at = new Date().toISOString();
    this.#doorAppend("link", live.id, "set", live.hash, s, by, at);
    return { ok: true, linkId: live.id, capabilities: s.capabilities, dailyCap: s.dailyCap, expiresInDays: s.expiresInDays,
             by, at };
  }

  /** R103: a new link, answered once, its settings kept; the old one is dead at once. */
  joinLinkReplace({ by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "replacing the group's join link");   /* R84 */
    const live = this.#liveJoinLink("replacing the join link");
    if (live.ok === false) return live;
    const link = Membership.#secret(), linkId = Membership.#doorIdOf(), at = new Date().toISOString();
    this.#doorAppend("link", linkId, "replace", sha256HexSync(link), live, by, at);
    return { ok: true, linkId, link, replaced: live.id, capabilities: live.capabilities, dailyCap: live.dailyCap,
             expiresInDays: live.expiresInDays, by, at };
  }

  /** R103: the live link is dead at once. */
  joinLinkOff({ by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "switching off the group's join link");   /* R84 */
    const live = this.#liveJoinLink("switching off the join link");
    if (live.ok === false) return live;
    const at = new Date().toISOString();
    this.#doorAppend("link", live.id, "off", null, live, by, at);
    return { ok: true, linkId: live.id, off: true, by, at };
  }

  /** R104: the join page's call: one invitation for the cover the person chose; enrolment is R16's. */
  async joinLinkInvite({ link, cover } = {}) {
    const live = this.#doorFor("link", link);
    /* DEC-49 REGION is-join-link-known */
    if (!live)
      return Membership.#rowRefusal("NO_SUCH_JOIN_LINK",
        "this link opens no door of this group: it was never made, was replaced or switched off, or is not a link, "
        + "and the answer is the same for each. Nothing was written.");
    /* END DEC-49 REGION is-join-link-known */
    const label = Membership.#doorCover(cover);
    if (!label) return Membership.#custodialRefusal("NO_COVER",
      "choose the name the group will know you by: it need not be, and often should not be, a legal name. Nothing "
      + "was written.");
    /* DEC-49 REGION is-join-link-daily-cap */
    if (this.#doorToday(`join-link:${live.id}`) >= live.dailyCap)
      return Membership.#rowRefusal("JOIN_LINK_DAILY_CAP",
        "the join link has let in its daily number of people in the last 24 hours. Nothing was written.",
        { dailyCap: live.dailyCap });
    /* END DEC-49 REGION is-join-link-daily-cap */
    return this.#doorMember("link", live, label, null);
  }

  /* ---- R106 (DEC-135 (2), (5)): who a check request reaches ---- */

  /** Every active member whose current state for `label` is declared or confirmed and whom R80 admits to `target`, in
   *  member-id order. It addresses only: writes nothing, grants nothing, and never throws. */
  checkAddressees({ target, label } = {}) {
    try {
      const lab = Membership.#normLabel(label);
      if (!lab) {
        const row = MEMBERSHIP_CHECKS.EXPERTISE_NO_LABEL;
        return { ok: false, reason: "EXPERTISE_NO_LABEL", code: "EXPERTISE_NO_LABEL", check: row.check,
                 translation: row.translation, detail: "a check request is addressed by a label, such as 'CPA'" };
      }
      if (typeof target !== "string" || !target) return [];
      /* each member's latest entry for the label (R23's log), the member active */
      const rows = this.#rows(
        `SELECT x.member_id, m.handle, x.event FROM member_expertise x JOIN members m ON m.member_id = x.member_id
          WHERE x.label=? AND m.status='active'
            AND x.seq = (SELECT MAX(y.seq) FROM member_expertise y WHERE y.member_id = x.member_id AND y.label = x.label)
          ORDER BY x.member_id`, lab);
      return rows.filter((r) => (r.event === "declared" || r.event === "confirmed") && this.inSight(target, `member:${r.member_id}`))
        .map((r) => ({ memberId: r.member_id, handle: r.handle ?? null, state: r.event }));
    } catch { return []; }
  }

  /* ---- R107, R108 (DEC-136 (1)): whether members are told what a court can reach ---- */

  static COURT_STATEMENT = "Your group's Civicsmith keeps this from the public and the people the group looks into. A "
    + "court order your group can't defeat could still require it to be shown. Write accordingly.";

  /** R107: an administrator's choice, `tell` or `dont`, the same act at setup and in the settings; appended. */
  courtNoticeSet({ choice, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "choosing whether members are told what a court can reach");   /* R84 */
    /* DEC-49 REGION is-court-notice-choice */
    if (choice !== "tell" && choice !== "dont")
      return Membership.#rowRefusal("COURT_NOTICE_UNKNOWN_CHOICE",
        "the choice is `tell` or `dont`, and nothing else. Nothing was written.", { choice: Membership.#echo(choice ?? null) });
    /* END DEC-49 REGION is-court-notice-choice */
    const at = new Date().toISOString();
    this.sql.exec(`INSERT INTO court_notice (choice, set_by, at) VALUES (?,?,?)`, choice, by, at);
    return { ok: true, choice, by, at };
  }

  /** R107: the setting and its history; `choice` null until an administrator has chosen, and null reads as not telling. */
  courtNotice() {
    try {
      const history = this.#rows(`SELECT choice, set_by AS by, at FROM court_notice ORDER BY seq`);
      return { choice: history.length ? history[history.length - 1].choice : null, history };
    } catch { return { choice: null, history: [] }; }
  }

  /* ---- R109, R110 (DEC-132): the group's optional self-description ---- */

  static GROUP_KINDS = Object.freeze(["professional", "issue", "community", "catch-all", "other"]);

  /* A text field: trimmed, empty reads as null. */
  static #text(v) {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t ? t : null;
  }

  /** R109: an administrator records the description; each call appends a whole record and overwrites none. */
  groupDescriptionSet({ kinds, otherKind = null, focus = null, purpose = null, visibility = null, by = null } = {}) {
    if (!this.isAdministrator(by)) return notAnAdmin(by, "describing the group");   /* R84 */
    const refuse = (code, detail, extra) => Membership.#rowRefusal(code, `${detail} Nothing was written.`, extra);
    /* DEC-49 REGION is-group-description */
    if (!Array.isArray(kinds) || kinds.some((k) => !Membership.GROUP_KINDS.includes(k)))
      return refuse("GROUP_KIND_UNKNOWN", `the kinds are a list drawn from ${Membership.GROUP_KINDS.join(", ")}, `
        + "and may be empty.");
    const ks = [...new Set(kinds)];
    const other = ks.includes("other") ? Membership.#text(otherKind) : null;
    if (ks.includes("other") && !other)
      return refuse("GROUP_KIND_OTHER_EMPTY", "`other` was chosen, and the kind it describes was left empty.");
    const f = Membership.#text(focus), p = Membership.#text(purpose);
    for (const [name, v, max] of [["otherKind", other, 120], ["focus", f, 1000], ["purpose", p, 4000]])
      if (v !== null && v.length > max)
        return refuse("GROUP_DESCRIPTION_TOO_LONG", `${name} is at most ${max} characters.`, { field: name, max });
    const vis = visibility === undefined || visibility === null ? "members" : visibility;
    if (vis !== "members" && vis !== "public")
      return refuse("GROUP_VISIBILITY_UNKNOWN", "the description is seen by `members` or by the `public` too.");
    /* END DEC-49 REGION is-group-description */
    const at = new Date().toISOString();
    this.sql.exec(`INSERT INTO group_description (kinds, other_kind, focus, purpose, visibility, set_by, at)
                   VALUES (?,?,?,?,?,?,?)`, JSON.stringify(ks), other, f, p, vis, by, at);
    return { ok: true, kinds: ks, otherKind: other, focus: f, purpose: p, visibility: vis, by, at };
  }

  /* Who reads the description and its history: an active member, the founder once claimed, a machine credential. */
  #insider(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "DENY") return false;
    if (g.member === null) return viewer !== Membership.ROOT_ADMIN || this.isAdministrator(Membership.ROOT_ADMIN);
    if (g.member === Membership.ROOT_ADMIN) return this.isAdministrator(Membership.ROOT_ADMIN);
    const m = this.#one(`SELECT status FROM members WHERE member_id=?`, g.member);
    return !!m && m.status === "active";
  }

  /** R110: the description and its history to an insider; to anyone else, the public, only the four texts, and only
   *  while the latest visibility is `public`. Writes nothing, never throws. */
  groupDescription({ viewer = null } = {}) {
    try {
      const history = this.#rows(`SELECT kinds, other_kind, focus, purpose, visibility, set_by, at
                                    FROM group_description ORDER BY seq`).map((r) => ({
        kinds: JSON.parse(r.kinds), otherKind: r.other_kind, focus: r.focus, purpose: r.purpose,
        visibility: r.visibility, by: r.set_by, at: r.at }));
      const last = history.length ? history[history.length - 1] : null;
      /* one with no kind, focus or purpose reads as none */
      const description = last && (last.kinds.length || last.focus || last.purpose) ? last : null;
      if (this.#insider(viewer)) return { description, history };
      if (!description || description.visibility !== "public") return { description: null };
      const { kinds, otherKind, focus, purpose } = description;
      return { description: { kinds, otherKind, focus, purpose } };
    } catch { return { description: null }; }
  }
}

/* K61: the one Membership of a Durable Object's storage, made on first use over its `sql`, reaching record-core by
   `recordOf(ctx)` on the same `ctx`. `record` (a test's own record-core) is read on the first call only. */
const OF = new WeakMap();
export function membershipOf(ctx, { record = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let m = OF.get(storage);
  if (!m) { m = new Membership({ sql: storage.sql, core: record ?? recordOf(ctx) }); OF.set(storage, m); }
  return m;
}


/* The ops this module answers, as entries of the plane's op map (the composition root, `plane`, spreads them in).
   `url` is the request URL, whose query carries the control plane's stamps (`by`, `viewer`, `who`, `administer`);
   `body` the parsed body; `env` the host's environment. Each stamp is read from the query AFTER the body is spread, so
   a caller's own copy never wins (D-136). */
export function membershipOps(m, url, body, env) {
  return {
        /* T19 (K637): `aicredentialmint`, `aicredentialrevoke`, `aicredentials`, `aicredentiallook`, `bootstrap`,
           `claim`, `login`, `signeradd`, `signerlist`, `signerset`, `setpassword` and `session` are `credentials`'
           ops (its own map). */
        /* REC-156 — `memberadd`'s `by` COMES FROM THE QUERY TOO: spread the body,
           THEN set `by`, exactly as D-136's three below and for their reason.
           `memberAdd` writes the proposer's `admin_votes` ('add') row from it, and a
           voter a caller can name is not a voter. The control plane stamps it (the
           `by` stamp's custodial disjunct in control-plane); a call with no stamp gets
           `null`, which `memberAdd` reads as NO endorsement — never the body's. */
        memberadd: () => m.memberAdd({ ...(body || {}), by: url.searchParams.get("by") }),
        enroll: () => m.enroll(body || {}),
        /* T40 (R123, R124): the invitation and the handle from the body, never the address; `viewer` and `by` the
           control plane's stamps from the query, read after the body so a body's copy never wins. */
        handlecheck: () => m.handleCheck({ invite: body?.invite ?? null, handle: body?.handle ?? null,
                                           viewer: url.searchParams.get("viewer") }),
        handlechange: () => m.handleChange({ handle: body?.handle ?? null, by: url.searchParams.get("by") }),
        invitelook: () => m.inviteLook(body || {}),
        /* R18 (D54, T41-3): `viewer`, the control plane's stamp, says which administrator reads the roster's projects. */
        memberlist: () => m.memberList({ administer: url.searchParams.get("administer"),
                                         viewer: url.searchParams.get("viewer") }),
        /* REC-159: `memberadd`'s relay shape, for its reason — spread the body, THEN the stamp. */
        memberset: () => m.memberSet({ ...(body || {}), by: url.searchParams.get("by") }),
        /* The membership model's member half. `memberadd`, `memberset`,
           `membercaps`, `adminendorse` and `adminremove` are admin-only at the
           control plane — section 4 governance. `memberlist` is NOT, and the
           comment that used to say so here was one of the three self-
           contradicting sites D-157 names: it is admin/member/probe, because
           §3 gives members and the public the HANDLE roster. What is
           administrator-only is the cover↔handle PAIRING, and that is enforced
           by the projection in memberList() above, off the `administer` stamp
           this line passes through — a class ACL cannot express it, because the
           op is legitimately reachable by callers who must not see the pairing. */
        /* D-136 — `by` COMES FROM THE QUERY, AND THE OVERRIDE IS LAST SO A BODY
           CANNOT WIN. This is the half that turns the control plane's stamp from
           a record into a fence, and before this item it was the whole defect:
           `adminEndorse` and `adminRemove` already checked `by` against the live
           administrator roster, and the check was sound — but the VALUE it
           checked arrived in the caller's own body, so "every existing
           administrator must endorse" was satisfied by a caller willing to type
           somebody else's id. The projects family stamps and reads `by` exactly
           this way (`projectinvite` below), for the sentence its own comment
           gives: only an owner may remove is worth nothing if the caller names
           who they are.
           SPREAD-THEN-OVERRIDE rather than a hand-listed shape, and the order is
           the safety property: a `by` in the body is overwritten by the query on
           every one of the three, so no future field added to any of these
           payloads can reintroduce the caller's answer by being copied in after
           it. A direct call with no stamp gets `null` and is refused by name,
           which is the fail-closed direction — the store never guesses a voter.  */
        membercaps: () => m.memberCaps({ ...(body || {}), by: url.searchParams.get("by") }),
        adminendorse: () => m.adminEndorse({ ...(body || {}), by: url.searchParams.get("by") }),
        adminremove: () => m.adminRemove({ ...(body || {}), by: url.searchParams.get("by") }),
        adminarith: () => m.adminArithmetic(),
        projectclaimowner: () => m.projectClaimOwner(body || {}),
        /* REC-138: `viewer` is the control plane's stamp (sight before position, `inSight`). */
        projectownerarith: () => m.projectOwnerArithmetic({ projectId: url.searchParams.get("projectId"),
                                                               viewer: url.searchParams.get("viewer") }),
        expertisedeclare: () => m.expertiseDeclare(body || {}),
        expertiseconfirm: () => m.expertiseConfirm(body || {}),
        expertiselist: () => m.expertiseList({ memberId: url.searchParams.get("memberId") }),
        projectinvite: () => m.projectInvite({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by"),
          viewer: url.searchParams.get("viewer") }),   /* REC-138 */
        /* REC-149: the three take the stamped viewer too, and ask it ONLY for EXISTENCE (C-70.1). */
        projectjoin: () => m.projectJoin({ projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by"), viewer: url.searchParams.get("viewer") }),
        projectleave: () => m.projectLeave({ projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by"), comment: url.searchParams.get("comment"),
          viewer: url.searchParams.get("viewer") }),
        projectremove: () => m.projectRemove({ projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"), by: url.searchParams.get("by"),
          comment: url.searchParams.get("comment"), viewer: url.searchParams.get("viewer") }),
        /* REC-149 (Membership v2 §7.14): the owner's setting. `by` and `viewer` are the control plane's stamps
           (PROJECT_ACTIONS). T38 (N783, K2270): the setting's read, the directory, the requests to join, the owner
           votes and the roster read are `project-roster`'s ops (its own map). */
        projectvisibilityset: () => m.projectVisibilitySet({ projectId: url.searchParams.get("projectId"),
          setting: url.searchParams.get("setting"), reason: url.searchParams.get("reason"),
          by: url.searchParams.get("by"), viewer: url.searchParams.get("viewer") }),
        /* N18: the canon rules built in T3 (R10, R11, R19). `by` is the control plane's stamp, read after the body. */
        adminresign: () => m.adminResign({ by: url.searchParams.get("by") }),
        hostingaccessset: () => m.hostingAccessSet({ ...(body || {}), by: url.searchParams.get("by") }),
        hostingaccess: () => m.hostingAccess({ limit: url.searchParams.get("limit") }),   /* N70 */
        memberpairingset: () => m.memberPairingSet({ ...(body || {}), by: url.searchParams.get("by") }),
        /* N85 (K124): the viewer and administer stamps decide what each caller sees; absent, the published alone. */
        memberpairings: () => m.memberPairings({ viewer: url.searchParams.get("viewer"),
          administer: url.searchParams.get("administer"), limit: url.searchParams.get("limit") }),   /* N70 */
        /* T34 (T34-10; DEC-132 to DEC-136): the stamps (`by`, `viewer`) from the query, read after the body so a body's
           copy never wins; the secrets (a key, a link) and the texts from the body, never the URL. Which credential
           reaches each, and the doors' routing (R101, R104), are op-declarations', admission's and control-plane's. */
        invitewithdraw: () => m.inviteWithdraw({ ...(body || {}), by: url.searchParams.get("by") }),
        websitekeycreate: () => m.websiteKeyCreate({ ...(body || {}), by: url.searchParams.get("by") }),
        websitekeyset: () => m.websiteKeySet({ ...(body || {}), by: url.searchParams.get("by") }),
        websitekeyrevoke: () => m.websiteKeyRevoke({ by: url.searchParams.get("by") }),
        websiteinvite: () => m.websiteInvite({ key: body?.key, cover: body?.cover, approvedBy: body?.approvedBy }),
        joinlinkenable: () => m.joinLinkEnable({ ...(body || {}), by: url.searchParams.get("by") }),
        joinlinkset: () => m.joinLinkSet({ ...(body || {}), by: url.searchParams.get("by") }),
        joinlinkreplace: () => m.joinLinkReplace({ by: url.searchParams.get("by") }),
        joinlinkoff: () => m.joinLinkOff({ by: url.searchParams.get("by") }),
        joinlinkinvite: () => m.joinLinkInvite({ link: body?.link, cover: body?.cover }),
        checkaddressees: () => m.checkAddressees({ target: url.searchParams.get("target"),
          label: url.searchParams.get("label") }),
        courtnoticeset: () => m.courtNoticeSet({ ...(body || {}), by: url.searchParams.get("by") }),
        courtnotice: () => m.courtNotice(),
        groupdescriptionset: () => m.groupDescriptionSet({ ...(body || {}), by: url.searchParams.get("by") }),
        groupdescription: () => m.groupDescription({ viewer: url.searchParams.get("viewer") }),
  };
}
