/* instance-setup: what a group's Civicsmith is and whose it is (R1–R19, R26–R31, R33–R43, R47, R50–R55, R60, R62–R66).
 *
 * THE PAGE AT THE ROOT is `setup-page`'s (K1851): the template, its group line and its script. This module composes it,
 * placing R47's block on who controls the group's Civicsmith in the template's one slot (setup-page R14), and re-exports
 * it as `setupPage`, `groupLine` and `SETUP_HTML`, so control-plane's `/` route and every other importer read it here as
 * before (K624 (1)). REC-163: the page is not served byte-for-byte as built: its one line saying whose record this is
 * carries the record's own producing group, read when the page is served (`setupPage` below).
 */

/* R47 (F10; K2038): the block's guide name links to setup-page's guide to replacing the one-time password (its R14,
   R27), at the address setup-page exports as `ROTATION_GUIDE_HREF`. */
import { PAGE_HTML, HOSTING_SLOT, GROUP_LINE_UNREAD, groupLine, ROTATION_GUIDE_HREF } from "./setup-page/index.mjs";
/* The Civicsmith agent's one composer is acquisition's (its R24), read there and never copied. */
import { civicsmithUserAgent } from "./acquisition/index.mjs";
/* R64 (N700): a language tag is read by jurisdictions' `isLocale` (its R37), never by a reading of this module's own. */
import { list as heldProfiles, get as heldProfile, combine as combineProfiles, isLocale } from "../../jurisdictions/index.mjs";
import { recordOf, stampInstant } from "./record-core/index.mjs";
import { membershipOf, notAnAdmin } from "./membership/index.mjs";
import { credentialsOf } from "./credentials/index.mjs";
import { promotionOf } from "./promotion/index.mjs";
import { governorOf } from "./host-governor/index.mjs";
import { schedulerOf } from "./scheduler/index.mjs";
import { captureOf } from "./capture/index.mjs";
import { entitiesOf } from "./entities/index.mjs";
import { linesOf, CAPACITIES as LINE_CAPACITIES } from "./lines/index.mjs";
import { provenanceOf } from "./provenance/index.mjs";
import { normAlias as termFold } from "./extraction/index.mjs";
import { parse as legistarParse, readPages as legistarPages, readBodyName as legistarBodyName, KEY as LEGISTAR_KEY,
         BASIS as LEGISTAR_BASIS } from "../../legistar-reader/index.mjs";
/* R65 (K1837): the no-added-fact check and the one row both assistant drafts answer until the model turn lands are
   wizard-scripts' (its R25, its rows), read there and never copied. */
import { checkDraft, WIZARD_SCRIPTS_CHECKS } from "./wizard-scripts/index.mjs";
import { cpuProbe } from "./cpu.mjs";
import { liveToken } from "./tokens.mjs";
import { livefire } from "./livefire.mjs";
import { GROUP_SLUG_RE, FLEET_BINDINGS, hostingControlBlock } from "./setup-fleet.mjs";

/* R47 (DEC-109; K1038; K1851): the page as composed, setup-page's template with the hosting block in its one slot. */
export const SETUP_HTML = PAGE_HTML.replace(HOSTING_SLOT, () => hostingControlBlock("notice", { guideHref: ROTATION_GUIDE_HREF }));
/** The page as served: the composed page, its unread group line replaced by what one read of the record said
 *  (setup-page R1's `groupLine`, re-exported). */
export function setupPage(read) {
  return SETUP_HTML.replace(GROUP_LINE_UNREAD, () => groupLine(read));
}
export { groupLine };

/* ============================================================================================================
 * THE INSTANCE: WHAT A GROUP'S CIVICSMITH IS AND WHOSE IT IS (instance-setup R1–R42). The module's own store-side and
 * Worker-side code, moved in from `legacy-store` and `legacy-index` at its extraction (K69, N38).
 * ============================================================================================================ */

/* The slug grammar and the fleet's binding names live in the import-free leaf the installer imports (N234, K405). */
export { GROUP_SLUG_RE, FLEET_BINDINGS };

/* D-116 — EACH FLEET MEMBER'S BUILD, READ BACK THROUGH THE BINDING THIS PLANE ACTUALLY HOLDS.
 *
 * A member versions and rolls out on its own (`BIO_Distribution_v0_1.md` §4 rule 1), and an installer that uploaded
 * one has only Cloudflare's word that it landed — never the member's, and never the PLANE's view of it, which is the
 * one that decides whether a group's PDFs, OCR and assistant do what every description of them says (D-115). So the
 * question is asked where it matters: over `env.<BINDING>`, `GET /version`, the route every member has served since
 * CPDF-9 / FL-2 / CPDF-10. Each answer is the MEMBER'S OWN reply — its `name` and `version` fields, copied — and never
 * this isolate's env.VERSION: a plane that filled these in from its own env would make every member agree for free.
 *
 * States, per member, each a first-class statement rather than a missing key:
 *   SERVING   the member answered through the binding, under its own name, with `version`.
 *   UNBOUND   this plane holds no binding by that name — the member is unreachable FROM HERE whatever the account holds.
 *   SILENT    bound, and it did not answer a readable version within the bound (`why` says what happened).
 *   MISNAMED  something answered through the binding, but under another name — the binding points at the wrong worker.
 * Read only on `op=bootstrap&members=1`, so the anonymous answer a browser polls does not fan out to three workers. */
const MEMBER_VERSION_WAIT_MS = 4000;
export async function memberVersions(env) {
  const out = {};
  await Promise.all(FLEET_BINDINGS.map(async ([member, binding]) => {
    const b = env[binding];
    if (!b || typeof b.fetch !== "function") { out[member] = { binding, state: "UNBOUND" }; return; }
    let timer;
    try {
      const r = await Promise.race([
        b.fetch(`https://${member}/version`, { method: "GET" }),
        new Promise((_, no) => { timer = setTimeout(() => no(new Error(`no answer within ${MEMBER_VERSION_WAIT_MS} ms`)),
                                                    MEMBER_VERSION_WAIT_MS); }),
      ]);
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || typeof j.version !== "string" || !j.version) {
        out[member] = { binding, state: "SILENT", why: `answered HTTP ${r.status} without a version` };
      } else if (j.name !== member) {
        out[member] = { binding, state: "MISNAMED", name: typeof j.name === "string" ? j.name : null, version: j.version };
      } else {
        out[member] = { binding, state: "SERVING", version: j.version };
      }
    } catch (e) {
      out[member] = { binding, state: "SILENT", why: String(e && e.message || e).slice(0, 200) };
    } finally { clearTimeout(timer); }
  }));
  return out;
}

/* ============================================================================================================
 * THE CHECKS THIS MODULE HOLDS (R30, K6). C-64.2, C-64.3 and C-64.5–C-64.7 moved here from the catalogue's
 * `INSTANCE_GROUP_CHECKS`, code, condition and translation unmoved, their `where`s now this file's. C-64.1
 * (GROUP_UNDETERMINED, raised at the write) stays with the catalogue's family for `promotion`; C-64.4 (a bearer on
 * the two sets) is `control-plane`'s. C-119 is the jurisdiction profiles' (R14), a family of its own.
 * ============================================================================================================ */
export const INSTANCE_SETUP_CHECKS = Object.freeze({
  GROUP_SLUG_MALFORMED: {
    check: 'C-64.2',
    where: 'src/setup.mjs instanceGroupSeed > is-instance-group-seed',
    translation: 'A group is recorded by its short name, the same one the installer accepts: 3 to 40 lowercase '
      + 'letters, digits and hyphens, beginning and ending with a letter or a digit. Nothing was recorded.',
  },
  GROUP_ALREADY_RECORDED: {
    check: 'C-64.3',
    where: 'src/setup.mjs instanceGroupSeed > is-instance-group-seed',
    translation: 'Your group\'s Civicsmith has its group recorded already, and it is recorded once: the name travels inside every '
      + 'document the record has signed, so a second name would make those documents name a producer they were '
      + 'not written under. Nothing was changed.',
  },
  GROUP_IDENTITY_NOT_ADMIN: {
    check: 'C-64.5',
    where: 'src/setup.mjs #groupIdentityGate > is-group-identity-admin',
    translation: 'Only one of the group\'s administrators can set the name it shows the public or the web '
      + 'address it claims. The person signed in here is not one of its active administrators. Nothing was '
      + 'changed.',
  },
  GROUP_DISPLAY_NAME_MALFORMED: {
    check: 'C-64.6',
    where: 'src/setup.mjs groupNameSet > is-group-display-name',
    translation: 'A display name is the group\'s own words for itself: some text, at most 120 characters, on '
      + 'one line. It is always shown beside the group\'s short name and never instead of it. Nothing was '
      + 'changed.',
  },
  GROUP_DOMAIN_MALFORMED: {
    check: 'C-64.7',
    where: 'src/setup.mjs groupDomainSet > is-group-domain',
    translation: 'A web address is claimed by its bare domain name, like example.org: no https://, no path and '
      + 'no port. The claim is then checked by reading a file the domain itself serves, and the public sees '
      + 'the domain only while that check passes. Nothing was changed.',
  },
  /* R14 (N10, K102): the list of jurisdiction profiles this copy reads its local facts from. */
  PROFILES_NOT_ADMIN: {
    check: 'C-119.1',
    where: 'src/setup.mjs profilesSet > is-profiles-admin',
    translation: 'Only one of the group\'s administrators, signed in as themselves, can choose which jurisdiction '
      + 'profiles your group\'s Civicsmith reads its local facts from. Nothing was changed.',
  },
  NOT_A_LIST: {
    check: 'C-119.2',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'The profiles are chosen as a list, in the order they are to be read, and an empty list means '
      + 'none. What was sent is not a list. Nothing was changed.',
  },
  UNKNOWN_PROFILE: {
    check: 'C-119.3',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'Your group\'s Civicsmith holds no jurisdiction profile by that name, so it cannot read local facts from it. '
      + 'Choose among the profiles it offers. Nothing was changed.',
  },
  PROFILE_IS_TEST: {
    check: 'C-119.4',
    where: 'src/setup.mjs profilesSet > is-profiles-list',
    translation: 'That profile is made up for testing: its facts describe no real place, so no group\'s Civicsmith '
      + 'reads local facts from it. Nothing was changed.',
  },
  /* R53–R55 (K1502, K1478 (i), D311): the assistant, optional for the copy, and each member's disclosure. */
  ASSISTANT_OFF: {
    check: 'C-119.5',
    where: 'src/setup.mjs assistantGate > is-assistant-on',
    translation: 'The assistant is switched off for your group\'s Civicsmith, so no question is put to it and nothing runs. One of '
      + 'the group\'s administrators can switch it on. Nothing was asked.',
  },
  ASSISTANT_SWITCH_MALFORMED: {
    check: 'C-119.6',
    where: 'src/setup.mjs assistantSet > is-assistant-switch',
    translation: 'The assistant is switched on or off, and the request said neither. Nothing was changed.',
  },
  DISCLOSURE_NOT_THE_MEMBERS: {
    check: 'C-119.7',
    where: 'src/setup.mjs disclosureShown > is-disclosure-shown',
    translation: 'The assistant\'s disclosure is recorded as shown only to the member it was shown to, by their own '
      + 'act, never by another member or a machine on their behalf. Nothing was recorded.',
  },
  /* R51, R52: the captures a seeding reads. */
  SEED_CAPTURE_UNREADABLE: {
    check: 'C-119.9',
    where: 'src/setup.mjs seatsSeed > is-seed-capture',
    translation: 'Seats are seeded from captures the record holds of Legistar\'s bodies, persons and office records, '
      + 'and one of them is not named or cannot be read. Nothing was seeded.',
  },
  SEED_CAPTURE_NOT_LEGISTAR: {
    check: 'C-119.10',
    where: 'src/setup.mjs seatsSeed > is-seed-capture',
    translation: 'Seats are seeded only from Legistar\'s own lists of bodies, persons and office records, each named '
      + 'where it belongs, and this capture is not the list named. Nothing was seeded.',
  },
  DISCLOSURE_MALFORMED: {
    check: 'C-119.8',
    where: 'src/setup.mjs disclosureShown > is-disclosure-shown',
    translation: 'A shown disclosure is recorded with the member it was shown to and the version of its words. One '
      + 'of them is missing. Nothing was recorded.',
  },
  /* R60 (DEC-150 (1)): the name of a place the group works in that no held profile covers. */
  PLACE_NAME_MALFORMED: {
    check: 'C-64.8',
    where: 'src/setup.mjs placeWantedSet > is-place-name',
    translation: 'A place your group works in is named in plain words: some text, at most 200 characters, on one '
      + 'line. It is kept only in your group\'s Civicsmith and sent nowhere. Nothing was changed.',
  },
  /* R65 (DEC-152): the assistant's draft of the group's focus and purpose, from the administrator's answers. */
  GROUP_DRAFT_NO_ANSWERS: {
    check: 'C-64.9',
    where: 'src/setup.mjs groupDescriptionDraft > is-group-draft-answers',
    translation: 'Tell the assistant a little about your group first: it drafts only from what you tell it and what '
      + 'your group already holds. Nothing was saved.',
  },
  GROUP_DRAFT_ANSWERS_MALFORMED: {
    check: 'C-64.10',
    where: 'src/setup.mjs groupDescriptionDraft > is-group-draft-answers',
    translation: 'The assistant drafts from your answers to its questions: a short list of answers, each at most '
      + '1,000 characters. Nothing was saved.',
  },
  /* R64 (DEC-127 (1)): the language a member chooses for the screens, the member's own act. */
  MACHINE_CANNOT_SET_LANGUAGE: {
    check: 'C-119.11',
    where: 'src/setup.mjs memberLanguageSet > is-member-language',
    translation: 'The language your screens are shown in is your own choice, made from your own signed-in session, '
      + 'never by another member or a machine. Nothing was changed.',
  },
  LANGUAGE_MALFORMED: {
    check: 'C-119.12',
    where: 'src/setup.mjs memberLanguageSet > is-member-language',
    translation: 'A language is chosen by its standard tag, like en, es or zh-Hant, and what was sent is not one. '
      + 'Nothing was changed.',
  },
});

const refusal = (code, detail, extra) => {
  const row = INSTANCE_SETUP_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
};
/* R65: a refusal in one of wizard-scripts' rows (its R25's codes, and `ASSISTANT_DRAFT_UNAVAILABLE`), with its check and
   translation as that module holds them. */
const scriptRefusal = (code, detail) => {
  const row = WIZARD_SCRIPTS_CHECKS[code] || {};
  return { ok: false, reason: code, code, check: row.check ?? null, translation: row.translation ?? null, detail };
};
const draftUnavailable = (detail) => scriptRefusal("ASSISTANT_DRAFT_UNAVAILABLE", detail);
const draftRefused = (checked) => (checked && typeof checked.code === "string"
  ? scriptRefusal(checked.code, "the draft did not pass the check that it adds no fact, so nothing is offered.")
  : draftUnavailable("the draft could not be checked, so nothing is offered."));

/* R60: the longest name a place is given, in characters. R65: the answers' bounds, and membership R109's limits on
   the focus and the purpose a draft must fit. */
export const PLACE_NAME_MAX = 200;
export const GROUP_DRAFT_ANSWERS_MAX = 20;
export const GROUP_DRAFT_ANSWER_MAX = 1000;
export const GROUP_FOCUS_MAX = 1000;
export const GROUP_PURPOSE_MAX = 4000;

/* ============================================================================================================
 * THE TABLES (K4, `build/layers.md` ruling 3: each module owns its tables), created by `migrate` at start. Every one
 * is declared to record-core exempt from purge, in both forms (R28, R41): the instance's identity and its
 * measurements of the runtime are not derived from the corpus, in the family of `seq` and the settings.
 * ============================================================================================================ */
export const INSTANCE_SETUP_TABLES = Object.freeze(["instance_group", "group_identity_history", "group_domain_checks",
  "runtime_observations", "cpu_probe_runs", "cpu_probe_steps", "assistant_switch", "assistant_disclosures",
  "place_wanted", "place_seen", "place_arrivals", "member_languages"]);
/* Each table's classes, declared explicitly through record-core's `declareTable` (its R21; plan T33, Rules (6)). Every
   one is exempt from purge (R28, R41); none is a cache of anything; the append-only ones keep every version (R26, R53,
   R54). A member's disclosure record is theirs and the group's, never exported (it names who connected an account). */
const TABLE_CLASSES = Object.freeze({
  instance_group: { export: "admin-only", version_chain: false },
  group_identity_history: { export: "admin-only", version_chain: true },
  group_domain_checks: { export: "admin-only", version_chain: true },
  runtime_observations: { export: "admin-only", version_chain: false },
  cpu_probe_runs: { export: "admin-only", version_chain: false },
  cpu_probe_steps: { export: "admin-only", version_chain: false },
  assistant_switch: { export: "admin-only", version_chain: true },
  assistant_disclosures: { export: "never", version_chain: true },
  /* R60, R62 (DEC-150): the place the group named, held only in its own Civicsmith, never exported (R60). */
  place_wanted: { export: "never", version_chain: true },
  place_seen: { export: "never", version_chain: false },
  place_arrivals: { export: "never", version_chain: true },
  /* R64 (DEC-127 (1)): each member's own choice of language, appended. */
  member_languages: { export: "admin-only", version_chain: true },
});
/* R50–R52: the seeding ledgers name entities and lines of the registry (`entities`, `lines`), which a whole-store purge
   clears, so a whole-store purge clears them with it and a later seeding starts afresh; a bundle's purge touches none. */
export const INSTANCE_SETUP_SEED_TABLES = Object.freeze(["seed_entities", "seed_lines", "seed_offices", "seed_bodies"]);
export const INSTANCE_SETUP_TABLE_DECLARATIONS = Object.freeze([
  ...INSTANCE_SETUP_TABLES.map((name) => Object.freeze({
    name, purge: "exempt", expunge: "none", sight: "group", derive: "stored", ...TABLE_CLASSES[name] })),
  ...INSTANCE_SETUP_SEED_TABLES.map((name) => Object.freeze({
    name, purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored",
    version_chain: false })),
]);
export const INSTANCE_SETUP_SCHEMA = `
-- D-436 (State Rules v1.5 section 3.1, the core field group): THE PRODUCING GROUP'S SLUG, ONE VALUE FOR THE WHOLE
-- INSTANCE. Every bundle this instance writes names it as its group, in the bytes that get signed, and nothing else may
-- supply that name: not a literal in the code, and not a deploy-time variable, which a redeploy could move silently.
-- One row, id=1, WRITTEN ONCE: every writer is an INSERT that does nothing on conflict, and no statement anywhere
-- updates or deletes it (R26).
--   source  'bootstrap'  recorded at the store's FIRST BOOT (record-core's isFirstBoot, its R54), from the slug the
--                        installer bound as INSTANCE_NAME, read at that moment only (R2)
--           'seed'       recorded once by op=instancegroupseed, the root of trust's act, on a store that already held
--                        the schema when this table arrived (R4)
--   recorded_by  NULL for bootstrap, the server-stamped credential for a seed
CREATE TABLE IF NOT EXISTS instance_group (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  slug         TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL,
  recorded_by  TEXT
);
-- REC-164: THE PUBLISHING GROUP'S DISPLAY NAME AND ITS DOMAIN (BIO_Publication_v0_1.md section 7 points 2 and 3). Two
-- durable values, each with a dated history: a value is the LATEST row for its field, and no statement updates or
-- deletes a row (R26), so every revision stays readable with its date and the administrator who made it.
--   field             'display_name' or 'domain'
--   set_by            the member the control plane stamped from the signed-in session, never a caller's statement
--   instance_address  a domain row only: the origin the administrator's session reached, stamped by the control
--                     plane, which the well-known file must name
CREATE TABLE IF NOT EXISTS group_identity_history (
  seq               INTEGER PRIMARY KEY AUTOINCREMENT,
  field             TEXT NOT NULL CHECK (field IN ('display_name','domain')),
  value             TEXT NOT NULL,
  set_at            TEXT NOT NULL,
  set_by            TEXT NOT NULL,
  instance_address  TEXT
);
-- Every verdict on a claimed domain, dated (R8). 'undetermined' is recorded as what it is and never as 'absent'.
--   trigger  'set' (the administrator's act) or 'alarm' (the reconciling re-check, R9)
CREATE TABLE IF NOT EXISTS group_domain_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain      TEXT NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ('verified','absent','mismatched','undetermined')),
  checked_at  TEXT NOT NULL,
  trigger     TEXT NOT NULL,
  status      INTEGER,
  detail      TEXT
);
-- What the runtime was observed to COST (R33, R34), measured rather than assumed. capture_limits (capture's) holds
-- ceilings found by being refused; this holds consumption found by measuring. The columns are named *_ms for the
-- metric that first wrote them; each metric carries its own UNIT, and a count of work is never read as a time.
CREATE TABLE IF NOT EXISTS runtime_observations (
  metric     TEXT PRIMARY KEY,
  peak_ms    REAL NOT NULL,
  peak_at    TEXT NOT NULL,
  peak_detail TEXT,
  last_ms    REAL NOT NULL,
  last_at    TEXT NOT NULL,
  samples    INTEGER NOT NULL DEFAULT 1,
  total_ms   REAL NOT NULL DEFAULT 0,
  unit       TEXT
);
-- The stepped CPU probe's durable trail (R35–R40), ONE RUN APART FROM ANOTHER. Exceeding the CPU limit TERMINATES the
-- isolate, so no run can record its own death: a run is started, each step it completes is written before the next
-- begins, and its end is written when it returns. A run with no end is one the isolate did not survive, and the
-- ceiling lies between its last completed step and the next, each timed from that run's own start.
CREATE TABLE IF NOT EXISTS cpu_probe_runs (
  run         TEXT PRIMARY KEY,
  started_at  TEXT NOT NULL,
  iterations  INTEGER,
  budget_ms   REAL,
  ended_at    TEXT,
  reason      TEXT,
  completed   INTEGER,
  elapsed_ms  REAL
);
CREATE TABLE IF NOT EXISTS cpu_probe_steps (
  run         TEXT NOT NULL,
  step        INTEGER NOT NULL,
  elapsed_ms  REAL NOT NULL,
  iterations  INTEGER NOT NULL,
  at          TEXT NOT NULL,
  PRIMARY KEY (run, step)
);
-- R53 (K1502): whether the assistant is enabled for this copy, each set appended with who and when; the switch is the
-- latest row, and with no row it is off. No row updates or deletes another.
CREATE TABLE IF NOT EXISTS assistant_switch (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  on_     INTEGER NOT NULL CHECK (on_ IN (0, 1)),
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);
-- R50–R52: what this module seeded, so a repeat is answered already and the offices it seeded can be named (K1683).
-- seed_entities: one row per scheme identifier this module seeded an entity under (or found one holding).
CREATE TABLE IF NOT EXISTS seed_entities (
  scheme     TEXT NOT NULL,
  id         TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  kind       TEXT NOT NULL,
  label      TEXT NOT NULL,
  source     TEXT NOT NULL,
  seeded_at  TEXT NOT NULL,
  PRIMARY KEY (scheme, id)
);
-- seed_lines: one row per line this module recorded, keyed by its kind, its ends and the source row it rests on.
CREATE TABLE IF NOT EXISTS seed_lines (
  key          TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  from_entity  TEXT NOT NULL,
  to_entity    TEXT NOT NULL,
  line_id      TEXT NOT NULL,
  seeded_at    TEXT NOT NULL
);
-- seed_offices: each profile office (jurisdictions R24's counterparty) seeded, by its profile, role and body.
CREATE TABLE IF NOT EXISTS seed_offices (
  profile        TEXT NOT NULL,
  role           TEXT NOT NULL,
  body           TEXT NOT NULL,
  entry          TEXT NOT NULL,
  office_entity  TEXT NOT NULL,
  body_entity    TEXT NOT NULL,
  seeded_at      TEXT NOT NULL,
  PRIMARY KEY (profile, role, body)
);
-- R50, R51: each profile body seeded under the profile's own identifier for it (ids.body), with or without its office,
-- so R51 finds the body a Legistar body is matched to even where the profile gives its office no identifier.
CREATE TABLE IF NOT EXISTS seed_bodies (
  profile      TEXT NOT NULL,
  role         TEXT NOT NULL,
  body         TEXT NOT NULL,
  entry        TEXT NOT NULL,
  body_entity  TEXT NOT NULL,
  seeded_at    TEXT NOT NULL,
  PRIMARY KEY (profile, role, body)
);
-- R60 (DEC-150 (1)): the place the group works in that no held profile covers, named by an administrator; the latest row
-- is the name, and a row with name NULL clears it. Held only here: nothing reads it outward. Append-only.
CREATE TABLE IF NOT EXISTS place_wanted (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT,
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);
-- R62 (DEC-150 (3)): the held profiles as last compared (at the set of a name, then at each start), one row.
CREATE TABLE IF NOT EXISTS place_seen (
  id        INTEGER PRIMARY KEY CHECK (id = 1),
  profiles  TEXT NOT NULL,
  seen_at   TEXT NOT NULL
);
-- R62: each held profile found matching the named place that was not held before, recorded once per name (place_seq,
-- the place_wanted row it matched); it leaves when the profile is made active or the name is cleared or changed.
CREATE TABLE IF NOT EXISTS place_arrivals (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  place_seq  INTEGER NOT NULL,
  name       TEXT NOT NULL,
  profile    TEXT NOT NULL,
  found_at   TEXT NOT NULL,
  left_at    TEXT,
  left_why   TEXT,
  UNIQUE (place_seq, profile)
);
-- R64 (DEC-127 (1)): the language each member chose for the screens, by their own act; the latest row per member is the
-- choice, and a row with language NULL clears it. Append-only.
CREATE TABLE IF NOT EXISTS member_languages (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  member    TEXT NOT NULL,
  language  TEXT,
  set_at    TEXT NOT NULL
);
-- R54 (D311): each time the assistant's disclosure was shown to a member before they connected their own account: who,
-- the disclosure's version, who recorded it and when. Append-only.
CREATE TABLE IF NOT EXISTS assistant_disclosures (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  member    TEXT NOT NULL,
  version   TEXT NOT NULL,
  shown_by  TEXT NOT NULL,
  shown_at  TEXT NOT NULL
);
`;

/* R54 (D311): the assistant's disclosure. Its words are the design stream's (NOTICE to UX-DESIGN) and are shown by the
   surface; this module holds the version a shown disclosure is recorded against, and the meaning the words carry. A new
   version of the words is a new `version`, and a member shown only an earlier one reads `shown: false` until shown again. */
export const ASSISTANT_DISCLOSURE = Object.freeze({
  version: "D311-1",
  meaning: "your questions and the material read to answer them, people's facts included, go to Anthropic under your "
    + "own account",
});

/* R50–R52: the machine's stamp on what it seeds (DEC-52), and the Legistar schemes the profiles declare for a body's
   `BodyId`, a person's `PersonId` and a seat's `OfficeRecordId` (jurisdictions R52; K1682's reading 2). */
export const SEED_MACHINE = "class:admin";
/* A profile's zone (jurisdictions R41: `time_zone`, its `value` an IANA name), or null when it states none. */
const zoneOf = (p) => {
  const z = p && p.time_zone;
  const v = z && typeof z === "object" ? z.value : z;
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
/* R53 (K1678): who set the switch when the installer's binding is recorded at the first boot. */
export const ASSISTANT_INSTALLER = "installer";
export const LEGISTAR_SCHEMES = Object.freeze({ body: "legistar_body_id", person: "legistar_person_id", seat: "legistar_office_record_id" });

/* The probe run the trail held before runs were kept apart (R40): its rows, keyed on the step alone, become one run. */
export const LEGACY_PROBE_RUN = "legacy";

/* A metric's unit, for the metrics that predate the unit column (R34): a `_bytes` metric counts bytes. */
const unitOfMetric = (metric) => (/_bytes$/.test(String(metric)) ? "bytes" : "ms");

/* =====================================================================
 * D-436 / IC-172 — THE PRODUCING GROUP, ONE RECORDED VALUE FOR THE WHOLE INSTANCE (R1–R4).
 *
 * State Rules v1.5 §3.1: every bundle.md carries `group`, the producing group's slug, and it travels with every
 * distributed copy — so it is in the SIGNED bytes. There is ONE value, the `instance_group` row, and every default and
 * every stamp reads it through `producingGroup()`, which this module registers with promotion as the fact
 * `producingGroup` (promotion R40, R1 here). Nothing in the plane names a group of its own.
 *
 * DECISION (a), WHERE IT COMES FROM (K102). It is written ONCE, at the store's FIRST BOOT (record-core's `isFirstBoot`,
 * its R54): on that boot and on no other, the slug the installer bound as INSTANCE_NAME is recorded, the worker name
 * the group chose (D-102), which `newgroup` binds in the SAME upload that creates the worker. It is checked against the
 * installer's own slug grammar first, and a missing or malformed name records NOTHING — the store then says so.
 *   NEVER A DEPLOY-TIME VARIABLE AS ITS SOURCE. INSTANCE_NAME is the channel the slug ARRIVES by, read at one moment;
 *   every later boot ignores it. So a redeploy that moves the binding moves nothing already recorded.
 *   WHY THE FIRST BOOT AND NOT op=claim. The scratch namespace is a Durable Object of its own that no claim ever
 *   reaches; the root of trust can write before anyone claims; and a claim is RE-ARMED by rotating ADMIN_TOKEN, so
 *   "the first claim" would need a witness of its own. The store's birth is witnessed by the schema itself.
 *
 * DECISION (b), A STORE THAT PREDATES THE VALUE. A store that already held the schema when this table arrived records
 * NOTHING at boot, even with INSTANCE_NAME bound: the binding and the record can disagree, and choosing between them is
 * a person's act, not a boot's. It is recorded ONCE by the root of trust (`instanceGroupSeed`), and refused a second
 * time. The documents already written are not rewritten: their bytes are signed.
 *
 * DECISION (c), NOTHING RECORDED. A write that must name the producing group is never given a default (C-64.1,
 * promotion's): the fact answers null, and the writer refuses by name.
 * ===================================================================== */

/* What a store recording no group SAYS, in ONE copy: the credentialed read and the public reads both answer with it. */
export const NO_GROUP_RECORDED = "no producing group is recorded for this store. A store records it once: at its first "
  + "boot, from the slug its installer bound, or — on a store that already held documents when the value "
  + "arrived — by one act of the root of trust (op=instancegroupseed). Until then a write that must "
  + "name its producing group is given no default: a caller's own statement of its group is kept "
  + "as the caller's, and a write stating none is refused.";

/* REC-164 — THE DISPLAY NAME AND THE DOMAIN (R5–R11): the bounds and the file. */
export const GROUP_DISPLAY_NAME_MAX = 120;
/* A bare lowercase host name with at least one dot, labels of 1-63 letters, digits and hyphens: no scheme, path, port
   or IP literal. The last label must begin with a letter, which is what excludes a dotted-quad. */
export const GROUP_DOMAIN_RE = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
/* R8 (DEC-124; K1365 (5)): the file a group publishes, and the one it published before T31, read only when the first is
   `absent` so a group that already published it stays verified. The second answer decides. */
export const GROUP_WELL_KNOWN_PATH = "/.well-known/civicsmith-group.json";
export const GROUP_WELL_KNOWN_PATH_BEFORE_T31 = "/.well-known/civicos-group.json";
export const GROUP_WELL_KNOWN_MAX_BYTES = 16384;
export const GROUP_DOMAIN_RECHECK_MS = 86_400_000;   // chosen, not measured: once a day
/* IC-246: the check log answered newest first, cut at a NAMED bound and the cut PUBLISHED (R11). */
export const GROUP_DOMAIN_CHECKS_MAX = 20;

/* The instance's own address as the control plane stamped it: an origin, lowercased, no trailing slash. */
function instanceAddress(origin) {
  try {
    const u = new URL(String(origin ?? ""));
    return (u.protocol === "https:" || u.protocol === "http:") ? `${u.protocol}//${u.host}`.toLowerCase() : null;
  } catch { return null; }
}

/* At most `max` bytes of a response body, decoded as UTF-8; the rest is never read (R8: at most 16 KiB). */
async function boundedText(res, max) {
  const body = res && res.body;
  if (!body || typeof body.getReader !== "function")
    return String(await res.text().catch(() => "")).slice(0, max);
  const reader = body.getReader();
  const parts = [];
  let held = 0;
  try {
    while (held < max) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      parts.push(chunk.subarray(0, Math.min(chunk.length, max - held)));
      held += Math.min(chunk.length, max - held);
    }
  } catch { /* what was read stands */ }
  try { await reader.cancel(); } catch { /* already closed */ }
  const all = new Uint8Array(held);
  let at = 0;
  for (const p of parts) { all.set(p, at); at += p.length; }
  return new TextDecoder().decode(all);
}

/* =====================================================================
 * THE MODULE ON ONE DURABLE OBJECT'S STORAGE (K61): `instanceSetupOf(ctx, env, deps)`.
 * `deps` lets a test hand its own record-core, membership, promotion, governor, scheduler, capture, `fetch` and
 * `sleep`; each defaults to the module's own factory on the same `ctx`.
 * ===================================================================== */
export class InstanceSetup {
  #ctx; #env; #deps; #sql; #started = false;

  constructor(ctx, env = {}, deps = {}) {
    this.#ctx = ctx;
    this.#env = env || {};
    this.#deps = deps || {};
    this.#sql = (ctx && ctx.storage ? ctx.storage : ctx).sql;
  }

  #record() { return this.#deps.record ?? recordOf(this.#ctx); }
  #membership() { return this.#deps.membership ?? membershipOf(this.#ctx); }
  #credentials() { return this.#deps.credentials ?? credentialsOf(this.#ctx, { record: this.#record(), membership: this.#membership() }); }
  #promotion() { return this.#deps.promotion ?? promotionOf(this.#ctx); }
  #governor() { return this.#deps.governor ?? governorOf(this.#ctx); }
  #scheduler() { return this.#deps.scheduler ?? schedulerOf(this.#ctx, this.#env); }
  #capture() { return this.#deps.capture ?? captureOf(this.#ctx, { env: this.#env }); }
  #queueProducers() { return this.#deps.queueProducers ?? null; }
  #fetch(...a) { return (this.#deps.fetch ?? globalThis.fetch)(...a); }
  #sleep(ms) { return this.#deps.sleep ? this.#deps.sleep(ms) : new Promise((s) => setTimeout(s, ms)); }
  #now() { return this.#deps.now ? this.#deps.now() : Date.now(); }
  #iso() { return new Date(this.#now()).toISOString(); }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- start (the Suggestions' "Factory and start") ---- */

  /** This module's tables, and the migrations of the two that predate a column (R34) or a key (R40). Idempotent. */
  migrate() {
    const bare = INSTANCE_SETUP_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const stmt of bare.split(";").map((x) => x.trim()).filter(Boolean)) this.#sql.exec(stmt);
    /* R34: a store written before the unit column holds its rows unit-less; each takes its metric's unit. */
    const cols = this.#rows(`PRAGMA table_info(runtime_observations)`).map((r) => r.name);
    if (!cols.includes("unit")) this.#sql.exec(`ALTER TABLE runtime_observations ADD COLUMN unit TEXT`);
    for (const r of this.#rows(`SELECT metric FROM runtime_observations WHERE unit IS NULL`))
      this.#sql.exec(`UPDATE runtime_observations SET unit = ? WHERE metric = ?`, unitOfMetric(r.metric), r.metric);
    /* R50: a body seeded with its office before the body ledger existed is held there too, so R51 finds it. */
    this.#sql.exec(`INSERT OR IGNORE INTO seed_bodies (profile, role, body, entry, body_entity, seeded_at)
                    SELECT profile, role, body, entry, body_entity, seeded_at FROM seed_offices`);
    /* R40: the trail that predates runs, keyed on the step alone, becomes one run of its own, and its table goes. */
    if (this.#rows(`PRAGMA table_info(cpu_probe)`).length) {
      const old = this.#rows(`SELECT step, elapsed_ms, iterations, at FROM cpu_probe ORDER BY step`);
      if (old.length && !this.#one(`SELECT run FROM cpu_probe_runs WHERE run = ?`, LEGACY_PROBE_RUN)) {
        this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, reason) VALUES (?, ?, ?, 'unrecorded')`,
                       LEGACY_PROBE_RUN, old[0].at, old[0].iterations);
        for (const r of old)
          this.#sql.exec(`INSERT OR IGNORE INTO cpu_probe_steps (run, step, elapsed_ms, iterations, at) VALUES (?, ?, ?, ?, ?)`,
                         LEGACY_PROBE_RUN, r.step, r.elapsed_ms, r.iterations, r.at);
      }
      this.#sql.exec(`DROP TABLE cpu_probe`);
    }
  }

  /** At start, once: the tables; the purge exemptions (R28, R41); the fact `producingGroup` (R1); the scheduler
   *  consumer `group-domain-recheck` (R9, scheduler R8); capture's compute listener (R42); at the first boot, R2 and R13;
   *  and last the scheduler's own `start` (its R11), so the reconcile sees this consumer and starts no probe. */
  async start({ firstBoot } = {}) {
    if (this.#started) return { ok: true, started: false, detail: "this module had already started on this storage" };
    this.#started = true;
    this.migrate();
    const out = { ok: true, started: true };
    out.purge = this.#record().declareTable("instance-setup", INSTANCE_SETUP_TABLE_DECLARATIONS.map((t) => ({ ...t })));
    out.fact = this.#promotion().registerFact("producingGroup", "instance-setup", () => this.producingGroup());
    out.consumer = this.#scheduler().register("instance-setup", { name: "group-domain-recheck", key: "groupdomain",
      due: () => this.groupDomainWake(), wake: () => this.groupDomainWake(), tick: () => this.groupDomainTick() });
    out.compute = this.#capture().on("compute", "instance-setup",
      (m) => this.recordRuntimeObservation({ metric: m && m.metric, ms: m && m.value, detail: m && m.detail,
                                            unit: unitOfMetric(m && m.metric) }));
    const first = firstBoot === undefined ? this.#record().isFirstBoot() : firstBoot === true;
    if (first) {
      out.group = this.#recordGroupAtFirstBoot();
      out.profiles = this.#recordProfilesAtFirstBoot();
      out.assistant = this.#recordAssistantAtFirstBoot();
      /* R50: at setup, the offices the profiles just recorded name are seeded (the machine's act, DEC-52). */
      if (out.profiles && out.profiles.recorded === true) {
        try { out.offices = this.officesSeed({ boot: true }); }
        catch (e) { out.offices = { ok: false, detail: `the offices could not be seeded at setup: ${String(e && e.message || e).slice(0, 200)}` }; }
      }
    }
    /* R62: at each start, with a place named, the profiles that arrived for it; and once, the read `queue-producers`
       raises the administrators' one Status item from (its R38), read as the plane. */
    try { out.places = this.#comparePlaces(); }
    catch (e) { out.places = { compared: false, detail: `the place could not be compared: ${String(e && e.message || e).slice(0, 200)}` }; }
    out.arrivals = this.#registerArrivals();
    /* The instance's start reconciles (scheduler R11), now that this consumer is registered: never `arm`, the producers'
       door, which would start the test seam's probe at every boot (K419). */
    try { out.armed = await this.#scheduler().start(); } catch { out.armed = null; /* the next arm reconciles */ }
    return out;
  }

  /* ---- R1–R4: the producing group ---- */

  /* R62: `placeArrivals` registered once with `queue-producers` (its R38; K31's pattern), read as the plane. */
  #registerArrivals() {
    const qp = this.#queueProducers();
    if (!qp || typeof qp.registerPlaceArrivals !== "function") return { ok: false, detail: "no producers to register with" };
    try { return qp.registerPlaceArrivals(({ viewer = null } = {}) => this.placeArrivals({ viewer })); }
    catch (e) { return { ok: false, detail: String(e && e.message || e).slice(0, 200) }; }
  }

  /** R1: THE ONE READER — the recorded slug, or null. It reads the store and nothing else, never `env`. */
  producingGroup() {
    const r = this.#one(`SELECT slug FROM instance_group WHERE id=1`);
    return r && typeof r.slug === "string" && r.slug ? r.slug : null;
  }

  /* R2: DECISION (a)'s write, at the first boot only. */
  #recordGroupAtFirstBoot() {
    const slug = String(this.#env.INSTANCE_NAME ?? "").trim();
    if (!GROUP_SLUG_RE.test(slug)) return { recorded: false };
    this.#sql.exec(`INSERT INTO instance_group (id, slug, recorded_at, source, recorded_by)
                    VALUES (1, ?, ?, 'bootstrap', NULL) ON CONFLICT(id) DO NOTHING`, slug, this.#iso());
    return { recorded: true, group: slug };
  }

  /* R53 (K1678): at the first boot, the installer's choice bound as ASSISTANT_ENABLED (`on` or `off`, installer R37),
     recorded with `by` the installer; no binding, or any other value, records nothing and the assistant stays off. */
  #recordAssistantAtFirstBoot() {
    const raw = this.#env.ASSISTANT_ENABLED;
    const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (v !== "on" && v !== "off")
      return { recorded: false, bound: raw !== undefined && raw !== null && raw !== "",
               ...(raw !== undefined && raw !== null && raw !== "" ? { why: "the installer bound neither on nor off, so the assistant stays off" } : {}) };
    this.#sql.exec(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (?, ?, ?)`, v === "on" ? 1 : 0, ASSISTANT_INSTALLER, this.#iso());
    return { recorded: true, on: v === "on" };
  }

  /** R3, op=instancegroup: what this store records — and when it records nothing, that it records nothing. */
  instanceGroup() {
    const r = this.#one(`SELECT slug, recorded_at, source, recorded_by FROM instance_group WHERE id=1`);
    if (r) return { ok: true, group: r.slug, recorded_at: r.recorded_at, source: r.source, recorded_by: r.recorded_by ?? null };
    return { ok: true, group: null, recorded_at: null, source: null, recorded_by: null, detail: NO_GROUP_RECORDED };
  }

  /** R3, REC-163 / IC-174: the PUBLIC projection (Publication §7 point 1: the slug is public, and nothing else in the
   *  row is). It reads through the one reader and selects nothing else. */
  instanceGroupPublic() {
    const slug = this.producingGroup();
    return slug ? { ok: true, group: slug } : { ok: true, group: null, detail: NO_GROUP_RECORDED };
  }

  /** R4, op=instancegroupseed: DECISION (b), the root of trust's one act. The control plane stamps `author`. */
  instanceGroupSeed({ slug = null, author = null } = {}) {
    const s = typeof slug === "string" ? slug.trim() : "";
    /* DEC-49 REGION is-instance-group-seed */
    if (!GROUP_SLUG_RE.test(s))
      return refusal("GROUP_SLUG_MALFORMED",
        `${s ? `'${s.slice(0, 60)}' is not` : "the request names no slug, and a group is recorded as"} a slug in the `
        + `installer's grammar (3 to 40 of a-z, 0-9 and '-', beginning and ending with a letter or digit). `
        + `Nothing was recorded.`);
    const held = this.#one(`SELECT slug, recorded_at, source FROM instance_group WHERE id=1`);
    if (held)
      return refusal("GROUP_ALREADY_RECORDED",
        `this store has recorded its producing group since ${held.recorded_at} (${held.source}), and it is `
        + `recorded once. Nothing was changed.`, { group: held.slug, recorded_at: held.recorded_at, source: held.source });
    /* END DEC-49 REGION is-instance-group-seed */
    const at = this.#iso();
    const who = typeof author === "string" && author.trim() ? author.trim() : null;
    this.#sql.exec(`INSERT INTO instance_group (id, slug, recorded_at, source, recorded_by)
                    VALUES (1, ?, ?, 'seed', ?) ON CONFLICT(id) DO NOTHING`, s, at, who);
    return { ok: true, group: s, recorded_at: at, source: "seed", recorded_by: who,
             note: "every document this store writes from now on names this group. Documents already written are "
                 + "NOT rewritten: whatever group their bytes name is what they were signed under." };
  }

  /* =====================================================================
   * REC-164 — THE PUBLISHING GROUP'S DISPLAY NAME AND ITS VERIFIED DOMAIN (R5–R11). `BIO_Publication_v0_1.md` §7
   * points 2 and 3, resting on point 1's public slug.
   *
   * TWO DURABLE VALUES, EACH WITH A DATED HISTORY: the value is the latest row for its field, and nothing updates or
   * deletes a row. Each is set by an ADMINISTRATOR'S SESSION ACT, and `by` is the control plane's stamp (R29), asked of
   * membership's `isAdministrator` (its R64) — a bearer is refused before this (C-64.4, control-plane's).
   *
   * THE DISPLAY NAME is presentation only (R27): it is written into no signed bytes, and the public read shows it WITH
   * the slug and never without one. THE DOMAIN is a CLAIM, shown publicly only while the latest verdict on the current
   * claim is `verified`. The verifier fetches the well-known file through the per-host governor at the set act and on
   * the reconciling alarm, because a check made once certifies a file the domain can change the next minute. Its
   * verdicts: `verified`, `absent`, `mismatched` and a FOURTH, `undetermined`, which says nothing about the domain and
   * is never recorded as `absent`.
   * ===================================================================== */

  #groupDomainRecheckMs() {
    const v = Number(this.#env.GROUP_DOMAIN_RECHECK_MS);
    return Number.isFinite(v) && v > 0 ? v : GROUP_DOMAIN_RECHECK_MS;
  }

  /* R5: WHO MAY SET EITHER VALUE — an administrator, named by the control plane's stamp, asked before anything is
     read or validated, so a caller with no standing learns nothing about what is recorded. */
  #groupIdentityGate(by) {
    /* DEC-49 REGION is-group-identity-admin */
    if (!by || !this.#membership().isAdministrator(by))
      return refusal("GROUP_IDENTITY_NOT_ADMIN",
        "setting the group's display name or claiming its domain is an administrator's act (Publication §7), and "
        + "your group's Civicsmith stamps who is asking from the signed-in session rather than taking it from the caller. This "
        + "caller is not one of the active administrators.", { by: by ?? null });
    /* END DEC-49 REGION is-group-identity-admin */
    return null;
  }

  #identityCurrent(field) {
    return this.#one(`SELECT value, set_at, set_by, instance_address FROM group_identity_history
                      WHERE field=? ORDER BY seq DESC LIMIT 1`, field) || null;
  }
  #identityHistory(field) {
    return this.#rows(`SELECT value, set_at, set_by FROM group_identity_history WHERE field=? ORDER BY seq`, field)
      .map((r) => ({ value: r.value, set_at: r.set_at, set_by: r.set_by }));
  }
  #domainLatestCheck(domain) {
    const r = this.#one(`SELECT domain, verdict, checked_at, trigger, status, detail FROM group_domain_checks
                         WHERE domain=? ORDER BY seq DESC LIMIT 1`, domain);
    return r ? { ...r } : null;
  }

  /** R6, op=groupnameset — §7 point 2. `by` is the control plane's stamp. */
  groupNameSet({ name = null, by = null } = {}) {
    const gate = this.#groupIdentityGate(by);
    if (gate) return gate;
    const s = typeof name === "string" ? name.trim() : "";
    const chars = [...s].length;
    /* DEC-49 REGION is-group-display-name */
    if (!s || chars > GROUP_DISPLAY_NAME_MAX || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(s))
      return refusal("GROUP_DISPLAY_NAME_MALFORMED",
        `${s ? `a name of ${chars} characters` : "the request names no display name, and it is set as"} `
        + `one line of 1 to ${GROUP_DISPLAY_NAME_MAX} characters with no control characters. Nothing was set.`);
    /* END DEC-49 REGION is-group-display-name */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_identity_history (field, value, set_at, set_by) VALUES ('display_name', ?, ?, ?)`,
                   s, at, by);
    return { ok: true, display_name: s, set_at: at, set_by: by, history: this.#identityHistory("display_name"),
             note: "presentation only: no signed bytes carry it, and every public surface shows it beside the slug." };
  }

  /** R7, op=groupdomainset — §7 point 3. `by` and `origin` are the control plane's stamps: `origin` is the address the
   *  administrator's session reached, which the domain's well-known file must name. Recorded, checked at once (R8),
   *  and the scheduler armed for the re-check (R9; scheduler R9: a later producer arms itself). */
  async groupDomainSet({ domain = null, by = null, origin = null } = {}) {
    const gate = this.#groupIdentityGate(by);
    if (gate) return gate;
    const d = typeof domain === "string" ? domain.trim().toLowerCase().replace(/\.$/, "") : "";
    /* DEC-49 REGION is-group-domain */
    if (!GROUP_DOMAIN_RE.test(d))
      return refusal("GROUP_DOMAIN_MALFORMED",
        `${d ? `'${d.slice(0, 80)}' is not` : "the request names no domain, and one is claimed as"} a bare host `
        + `name (letters, digits, hyphens and dots, with no scheme, path, port or IP address). Nothing was recorded.`);
    /* END DEC-49 REGION is-group-domain */
    const address = instanceAddress(origin);
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_identity_history (field, value, set_at, set_by, instance_address)
                    VALUES ('domain', ?, ?, ?, ?)`, d, at, by, address);
    const check = await this.#checkGroupDomain("set");
    try { await this.#scheduler().arm(); } catch { /* the check above stands; the next arm reconciles */ }
    return { ok: true, domain: d, set_at: at, set_by: by, instance_address: address, check,
             shown_publicly: !!check && check.verdict === "verified", history: this.#identityHistory("domain") };
  }

  /** R8, THE VERIFIER: a governed fetch of the current claim's well-known file, the file from before T31 fetched the
   *  same way only when the first answer is `absent` (the second answer then decides), and one dated verdict. */
  async #checkGroupDomain(trigger) {
    const cur = this.#identityCurrent("domain");
    if (!cur) return null;
    const domain = cur.value;
    const slug = this.producingGroup();
    const address = cur.instance_address || null;
    let verdict = "undetermined", status = null, detail;
    if (!slug || !address) {
      detail = !slug ? "this store records no producing group, so there is no slug for the file to name"
                     : "the claim carries no instance address for the file to name";
    } else {
      const first = await this.#readWellKnown(domain, GROUP_WELL_KNOWN_PATH, address, slug);
      let answer = first;
      if (first.verdict === "absent") {
        const before = await this.#readWellKnown(domain, GROUP_WELL_KNOWN_PATH_BEFORE_T31, address, slug);
        answer = { ...before, detail: `${first.detail}; read instead: ${before.detail}` };
      }
      ({ verdict, status, detail } = answer);
    }
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO group_domain_checks (domain, verdict, checked_at, trigger, status, detail)
                    VALUES (?, ?, ?, ?, ?, ?)`, domain, verdict, at, trigger, status, detail);
    return { domain, verdict, checked_at: at, trigger, status, detail };
  }

  /* R8: ONE governed read of one well-known file on the claimed domain (admit, then report the status), following no
     redirect and reading at most 16 KiB, answered as `{verdict, status, detail}`. */
  async #readWellKnown(domain, path, address, slug) {
    let g;
    try { g = this.#governor().governorAdmit({ host: domain }); }
    catch (e) { g = { admitted: false, reason: `the governor did not answer (${String(e && e.message || e).slice(0, 120)})` }; }
    if (!g || !g.admitted)
      return { verdict: "undetermined", status: null,
               detail: `the per-host governor held ${domain} (${g && g.reason}); this says nothing about the domain` };
    if (g.wait_ms) await this.#sleep(g.wait_ms);
    let res = null;
    try {
      res = await this.#fetch(`https://${domain}${path}`, { redirect: "manual",
        headers: { "user-agent": civicsmithUserAgent(this.#env.VERSION, this.#env.INSTANCE_NAME, "group-domain") } });
    } catch { res = null; }
    if (!res)
      return { verdict: "undetermined", status: null,
               detail: `the fetch of ${path} did not complete, and why was not recorded` };
    const status = res.status;
    try { this.#governor().governorReport({ host: domain, status }); } catch { /* an unrecorded outcome is not a verdict */ }
    if (status === 404 || status === 410 || (status >= 300 && status < 400))
      return { verdict: "absent", status,
               detail: status < 400 ? `the domain redirected ${path} (HTTP ${status}); the file is read on the claimed domain itself`
                                    : `the domain serves no ${path} (HTTP ${status})` };
    if (!(status >= 200 && status < 300))
      return { verdict: "undetermined", status,
               detail: `the domain answered ${path} with HTTP ${status}, which is neither the file nor its absence` };
    const text = await boundedText(res, GROUP_WELL_KNOWN_MAX_BYTES);
    let f = null;
    try { f = JSON.parse(text); } catch { f = null; }
    const isObject = !!f && typeof f === "object" && !Array.isArray(f);
    const inst = isObject && typeof f.instance === "string" ? instanceAddress(f.instance) : null;
    const grp = isObject && typeof f.group === "string" ? f.group.trim() : null;
    if (inst === address && grp === slug)
      return { verdict: "verified", status, detail: `${path} names your group's Civicsmith (${address}) and its slug (${slug})` };
    return { verdict: "mismatched", status,
             detail: !isObject
               ? `${path} is not the JSON object your group's Civicsmith reads ({ instance, group })`
               : `${path} gives the address ${JSON.stringify(inst ?? f.instance ?? null).slice(0, 120)} and the group `
                 + `${JSON.stringify(grp).slice(0, 60)}; your group's Civicsmith is ${address} and its slug is ${slug}` };
  }

  /** R9, the alarm consumer's two halves: the next re-check is due one interval after the current claim's latest
   *  verdict, and an instance claiming no domain holds no wake. */
  groupDomainWake() {
    const cur = this.#identityCurrent("domain");
    if (!cur) return null;
    const last = this.#domainLatestCheck(cur.value);
    const from = Date.parse((last && last.checked_at) || cur.set_at);
    return (Number.isFinite(from) ? from : 0) + this.#groupDomainRecheckMs();
  }
  async groupDomainTick() {
    return { groupdomain: await this.#checkGroupDomain("alarm") };
  }

  /** R10, op=groupidentity's PUBLIC projection: the slug, the display name only beside a slug, and the domain only
   *  while the latest verdict on the current claim is `verified`. */
  groupIdentityPublic() {
    const slug = this.producingGroup();
    const name = this.#identityCurrent("display_name");
    const dom = this.#identityCurrent("domain");
    const last = dom ? this.#domainLatestCheck(dom.value) : null;
    /* THE VERDICT GATE: the one line that decides whether a claimed domain reaches a stranger. */
    const verified = !!(slug && dom && last && last.verdict === "verified");
    return { ok: true, group: slug,
             display_name: slug && name ? name.value : null,
             domain: verified ? dom.value : null,
             domain_verified_at: verified ? last.checked_at : null,
             ...(slug ? {} : { detail: NO_GROUP_RECORDED }) };
  }

  /** R11, op=groupidentity for a credentialed reader: R10, and the claim, its state and both histories. */
  groupIdentity() {
    const pub = this.groupIdentityPublic();
    /* Read at `max + 1` so `truncated` is measured, never inferred from the count equalling the bound. */
    const max = GROUP_DOMAIN_CHECKS_MAX;
    const checks = this.#rows(`SELECT domain, verdict, checked_at, trigger, status, detail
                                 FROM group_domain_checks ORDER BY seq DESC LIMIT ?`, max + 1);
    const dom = this.#identityCurrent("domain");
    return { ...pub,
             display_name_recorded: this.#identityCurrent("display_name")?.value ?? null,
             display_name_history: this.#identityHistory("display_name"),
             domain_claim: dom ? { domain: dom.value, set_at: dom.set_at, set_by: dom.set_by,
                                   instance_address: dom.instance_address ?? null,
                                   latest: this.#domainLatestCheck(dom.value) } : null,
             domain_history: this.#identityHistory("domain"),
             domain_checks: checks.slice(0, max).map((r) => ({ ...r })),
             domain_checks_limit: max, domain_checks_truncated: checks.length > max };
  }

  /* =====================================================================
   * N10 — THE JURISDICTION PROFILES THIS COPY READS ITS LOCAL FACTS FROM (R12–R16). `build/layers.md`, "No
   * jurisdiction in the product", rule 2: an instance setting chosen at install. The list is record-core's setting
   * `jurisdiction_profiles` (its R26), which `extraction`, `monitoring`, `actions` and `standards` read; this module is
   * its one writer: at the first boot from the installer's binding (R13), and by an administrator's act (R14).
   * No profile is ever chosen for a group: an empty list is valid, and every consumer then answers undetermined.
   * ===================================================================== */

  /* The note R13 leaves when the installer's binding could not be recorded, so R12 can say why. */
  static PROFILES_BOOT_NOTE = "jurisdiction_profiles_boot";

  #checkProfileList(list) {
    const ids = list.map((v) => (typeof v === "string" ? v.trim() : v));
    const J = this.#juris();
    const unknown = ids.filter((id) => typeof id !== "string" || !id || !J.get(id));
    const tests = ids.filter((id) => typeof id === "string" && J.get(id) && J.get(id).test === true);
    return { ids, unknown, tests };
  }

  /* R13: at the first boot, the installer's comma-separated binding, recorded when every id is held and none is a
     test profile; otherwise nothing is recorded, and the note says why. */
  #recordProfilesAtFirstBoot() {
    const raw = this.#env.JURISDICTION_PROFILES;
    if (typeof raw !== "string" || !raw.trim()) return { recorded: false, bound: false };
    const { ids, unknown, tests } = this.#checkProfileList(raw.split(",").map((s) => s.trim()).filter(Boolean));
    const unique = [...new Set(ids)];
    let why = null;
    if (unknown.length) why = `the installer bound ${unknown.map((x) => JSON.stringify(x)).join(", ")}, which your group's Civicsmith does not hold`;
    else if (tests.length) why = `the installer bound ${tests.join(", ")}, a profile made up for testing`;
    const core = this.#record();
    if (why) {
      core.setSetting(InstanceSetup.PROFILES_BOOT_NOTE, { bound: raw, recorded: false, why, at: this.#iso() }, "bootstrap");
      return { recorded: false, bound: true, why };
    }
    const set = core.setSetting("jurisdiction_profiles", unique, "bootstrap");
    return set && set.ok ? { recorded: true, profiles: unique } : { recorded: false, bound: true, why: set && set.reason };
  }

  /** R12, R16: the active profiles, each with its name and what it covers, the conflicts `jurisdictions.combine`
   *  reports over them, the facts of their combined view `agent-worker` reads (`view`, N420), and the held profiles an
   *  administrator may choose among (R15), from the namespace addressed. */
  profiles() {
    const core = this.#record();
    const set = core.getSetting("jurisdiction_profiles");
    const ids = Array.isArray(set) ? set.filter((x) => typeof x === "string") : [];
    const J = this.#juris();
    const choices = J.list().filter((p) => p.test !== true).map((p) => ({ id: p.id, name: p.name, covers: p.covers }));
    const active = ids.map((id) => {
      const p = J.get(id);
      return p ? { id, name: p.name, covers: p.covers } : { id, name: null, covers: null, held: false };
    });
    const combined = ids.length ? J.combine(ids) : { ok: true, conflicts: [] };
    const out = { ok: true, profiles: active, conflicts: combined.ok ? combined.conflicts : [],
                  ...(combined.ok ? {} : { errors: combined.errors }), view: profileView(combined), choices };
    if (!ids.length) {
      out.detail = "no active profile: your group's Civicsmith reads no local facts, which is valid, and every fact that needs one "
        + "is answered as undetermined until an administrator chooses";
      const note = core.getSetting(InstanceSetup.PROFILES_BOOT_NOTE);
      if (note && note.recorded === false && typeof note.why === "string")
        out.boot = { recorded: false, why: note.why, bound: note.bound ?? null };
    }
    return out;
  }

  /** R14, op=profilesset: replaces the list. `by` is the control plane's stamp of an administrator's own session. */
  profilesSet({ profiles = undefined, by = null } = {}) {
    /* DEC-49 REGION is-profiles-admin */
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return refusal("PROFILES_NOT_ADMIN",
        "choosing the jurisdiction profiles is an administrator's act, and your group's Civicsmith stamps who is asking from the "
        + "signed-in session. This caller is not one of the active administrators.", { by: by ?? null });
    /* END DEC-49 REGION is-profiles-admin */
    /* DEC-49 REGION is-profiles-list */
    if (!Array.isArray(profiles))
      return refusal("NOT_A_LIST", "the profiles are sent as a list of profile ids, in the order they are read; an "
        + "empty list chooses none. Nothing was changed.");
    const { ids, unknown, tests } = this.#checkProfileList(profiles);
    if (unknown.length)
      return refusal("UNKNOWN_PROFILE", `your group's Civicsmith holds no profile ${unknown.map((x) => JSON.stringify(x)).join(", ")}. `
        + "Nothing was changed.", { profiles: unknown });
    if (tests.length)
      return refusal("PROFILE_IS_TEST", `${tests.join(", ")} ${tests.length > 1 ? "are profiles" : "is a profile"} made up `
        + "for testing. Nothing was changed.", { profiles: tests });
    /* END DEC-49 REGION is-profiles-list */
    const unique = [...new Set(ids)];
    const set = this.#record().setSetting("jurisdiction_profiles", unique, by);
    if (!set || set.ok !== true) return set;
    /* R62: an arrival leaves when an administrator makes that profile active. */
    this.#leaveArrivals("the profile was made active", this.#iso(), unique);
    return { ...this.profiles(), set_by: by, ...(unique.length < ids.length ? { collapsed: true } : {}),
             note: unique.length
               ? "local facts are read from these profiles, in this order, from now on; what was recorded before is unchanged"
               : "no profile is active from now on: every local fact is answered as undetermined" };
  }

  /* =====================================================================
   * THE BRIDGE AND THE SEATS (R50–R52; A ORG 1a and 1b; K1443, K1468, K1485; K1682's readings 1–4).
   *
   * What the active profiles name is seeded into the registry as identified entities and dated lines, by the machine
   * (DEC-52: `class:admin`) from a system rule, never from a name match (lines R4): the profile's offices and bodies
   * (R50), the Legistar bodies matched to them after normalisation (R51), and the Council's and committees' seats and
   * holders from Legistar's own records (R52). Every entity is found or seeded under a scheme identifier the profile
   * declares (`identifier_schemes`), so a repeat is answered `already` and nothing is seeded twice; nothing is deleted,
   * and an office a profile stops naming keeps its lines as they stand. What cannot be seeded is said, with why: an
   * entry with no identifier seeds nothing, and a `MemberType` the profile does not map records no holder.
   * ===================================================================== */

  #juris() { return this.#deps.jurisdictions ?? { list: heldProfiles, get: heldProfile, combine: combineProfiles }; }
  #entities() { return this.#deps.entities ?? entitiesOf(this.#ctx); }
  #lines() { return this.#deps.lines ?? linesOf(this.#ctx); }

  /* The active profiles, in order, each with its held definition (none for an id no longer held). */
  #activeProfiles() {
    const set = this.#record().getSetting("jurisdiction_profiles");
    const ids = Array.isArray(set) ? set.filter((x) => typeof x === "string" && x) : [];
    return ids.map((id) => ({ id, p: this.#juris().get(id) || null })).filter((x) => x.p);
  }

  /* A profile's scheme by name (jurisdictions R52), or null. */
  static #scheme(p, name) {
    return (Array.isArray(p.identifier_schemes) ? p.identifier_schemes : [])
      .find((x) => x && typeof x === "object" && x.scheme === name) || null;
  }
  /* `{scheme, id}` as a profile states it, or null when it is not one. */
  static #ident(x) {
    return x && typeof x === "object" && typeof x.scheme === "string" && x.scheme.trim()
      && (typeof x.id === "string" ? x.id.trim() : Number.isFinite(x.id))
      ? { scheme: x.scheme.trim(), id: String(x.id).trim() } : null;
  }

  /* Why an identifier cannot hold an entity of `kind` under profile `p`, or null when it can (checked before anything is
     created, so a refusal leaves no entity behind it): the scheme is declared, it identifies that kind, and it names the
     system a machine's identifier rests on (entities R43, K1443). */
  static #identWhy(p, ident, kind) {
    const sch = InstanceSetup.#scheme(p, ident.scheme);
    if (!sch) return `the profile declares no identifier scheme ${ident.scheme}`;
    if (!(Array.isArray(sch.entity_kinds) && sch.entity_kinds.includes(kind)))
      return `the scheme ${ident.scheme} identifies ${(sch.entity_kinds || []).join(", ") || "no kind"}, not a ${kind}`;
    if (!(Array.isArray(sch.systems) && sch.systems.length))
      return `the scheme ${ident.scheme} names no system that issues it, which a machine's identifier rests on`;
    return null;
  }

  /* One entity found or seeded under one identifier: the entity already holding it (a member's, or this module's from
     an earlier run) is `already`; else it is created, machine-declared, and the identifier held on it with the
     system's row as its basis. Answers `{state: seeded | already | unseeded, entity_id?, why?}`. */
  #seedEntity({ p, ident, kind, label, note, row, source, sector }) {
    const why = InstanceSetup.#identWhy(p, ident, kind);
    if (why) return { state: "unseeded", why };
    const E = this.#entities();
    const mine = this.#one(`SELECT entity_id FROM seed_entities WHERE scheme = ? AND id = ?`, ident.scheme, ident.id);
    let held = null;
    try { held = E.entityByIdentifier({ scheme: ident.scheme, id: ident.id }); } catch { held = null; }
    if (held && held.undetermined)
      return { state: "unseeded", why: `more than one entity holds ${ident.scheme} ${ident.id}; which one is meant is a member's to settle`,
               candidates: held.candidates ?? [] };
    if (held && typeof held.entity_id === "string") {
      if (!mine) this.#ledgerEntity(ident, held.entity_id, kind, label, source);
      return { state: "already", entity_id: held.entity_id };
    }
    let entityId = mine ? mine.entity_id : null;
    if (!entityId) {
      const made = E.createEntity({ kind, label, note, declaredBy: SEED_MACHINE, ...(sector ? { sector } : {}) });
      if (!made || made.ok !== true) return { state: "unseeded", why: `the registry refused the entity: ${made && (made.reason || made.detail)}` };
      entityId = made.entity_id;
      this.#ledgerEntity(ident, entityId, kind, label, source);
    }
    const sch = InstanceSetup.#scheme(p, ident.scheme);
    const id = E.addIdentifier({ entityId, scheme: ident.scheme, id: ident.id, by: SEED_MACHINE,
                                 basis: { system: sch.systems[0], row } });
    if (!id || id.ok !== true)
      return { state: "unseeded", entity_id: entityId,
               why: `the registry refused the identifier ${ident.scheme} ${ident.id}: ${id && (id.reason || id.detail)}; the entity is kept and a later seeding holds it again` };
    return { state: id.already ? "already" : "seeded", entity_id: entityId };
  }
  #ledgerEntity(ident, entityId, kind, label, source) {
    this.#sql.exec(`INSERT INTO seed_entities (scheme, id, entity_id, kind, label, source, seeded_at) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(scheme, id) DO NOTHING`, ident.scheme, ident.id, entityId, kind, label, JSON.stringify(source), this.#iso());
  }

  /* One line recorded once, keyed by its kind, its ends and the source row it rests on (`lines.recordLine`, machine
     from a system rule whose two ends the identifiers name, lines R4). Answers like `#seedEntity`. */
  #seedLine({ key, kind, from, to, capacity, valid, basis }) {
    const held = this.#one(`SELECT line_id FROM seed_lines WHERE key = ?`, key);
    if (held) return { state: "already", line_id: held.line_id };
    const r = this.#lines().recordLine({ kind, from, to, ...(capacity ? { capacity } : {}), ...(valid ? { valid } : {}),
                                         basis, by: SEED_MACHINE });
    if (!r || r.ok !== true) return { state: "unseeded", why: `the lines refused it: ${r && (r.reason || r.detail)}` };
    this.#sql.exec(`INSERT INTO seed_lines (key, kind, from_entity, to_entity, line_id, seeded_at) VALUES (?, ?, ?, ?, ?, ?)`,
                   key, kind, from, to, r.line_id, this.#iso());
    return { state: "seeded", line_id: r.line_id };
  }

  /** R50, op=officesseed: each office the active profiles name (jurisdictions R24) seeded as an `office`, its body as a
   *  `body`, each under the profile's identifier for it, with `post_in` from the office to its body and `part_of` from
   *  the body to the organisation the profile names it within. An administrator's act (`by`, the control plane's stamp);
   *  at setup the boot runs it once after R13 (`boot: true`). Answers what was seeded, already held, and could not be. */
  officesSeed({ by = null, boot = false } = {}) {
    if (!boot && (typeof by !== "string" || !by || !this.#membership().isAdministrator(by)))
      return notAnAdmin(by ?? null, "seeding the offices the jurisdiction profiles name");
    const out = { ok: true, seeded: [], already: [], unseeded: [], by: boot ? SEED_MACHINE : by };
    const put = (r, item) => { out[r.state === "seeded" ? "seeded" : r.state === "already" ? "already" : "unseeded"].push(
      { ...item, ...(r.entity_id ? { entity_id: r.entity_id } : {}), ...(r.line_id ? { line_id: r.line_id } : {}),
        ...(r.why ? { why: r.why } : {}), ...(r.candidates ? { candidates: r.candidates } : {}) }); };
    const active = this.#activeProfiles();
    if (!active.length) out.detail = "no profile is active, so no office is named and nothing is seeded";
    for (const { id: profile, p } of active) {
      const cps = Array.isArray(p.counterparties) ? p.counterparties : [];
      cps.forEach((cp, i) => {
        const entry = `counterparties[${i}]`;
        const role = cp && typeof cp.role === "string" ? cp.role.trim() : "";
        const body = cp && typeof cp.body === "string" ? cp.body.trim() : "";
        const where = { profile, entry, role, body };
        const ids = cp && cp.ids && typeof cp.ids === "object" ? cp.ids : {};
        const officeId = InstanceSetup.#ident(ids.office), bodyId = InstanceSetup.#ident(ids.body);
        const source = { profile, entry };
        const cite = `jurisdiction profile ${profile}, ${entry}${cp.basis ? ` (basis: ${cp.basis})` : ""}`;
        /* Each entity is seeded when, and only when, the profile gives its own identifier for it: the body under
           `ids.body` whether or not the office has one, the office under `ids.office` (K1682's reading 1; N613). */
        const noIdent = (what, field) => ({ state: "unseeded", why: `the profile names no identifier for this ${what} `
          + `(${field}), so it is not seeded: an entity is seeded only under the profile's own identifier, never by its name` });
        const b = bodyId ? this.#seedEntity({ p, ident: bodyId, kind: "body", label: body, sector: "government", source,
          row: `${profile}/${entry}/body`, note: `The body the office "${role}" belongs to, as the active ${cite} names it; seeded at setup.` })
          : noIdent("body", "ids.body");
        put(b, { what: "body", ...where, ...(bodyId ? { ident: bodyId } : {}) });
        const bodyHeld = !!b.entity_id && b.state !== "unseeded";
        if (bodyHeld)
          this.#sql.exec(`INSERT INTO seed_bodies (profile, role, body, entry, body_entity, seeded_at)
                          VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(profile, role, body) DO NOTHING`,
                         profile, role, body, entry, b.entity_id, this.#iso());
        const o = officeId ? this.#seedEntity({ p, ident: officeId, kind: "office", label: `${role}, ${body}`, source,
          row: `${profile}/${entry}/office`, note: `An office an action may be addressed to, as the active ${cite} names it; seeded at setup.` })
          : noIdent("office", "ids.office");
        put(o, { what: "office", ...where, ...(officeId ? { ident: officeId } : {}) });
        const officeHeld = !!o.entity_id && o.state !== "unseeded";
        /* K1683: the office's row names its body's entity, or '' when the body is not held under an identifier. */
        if (officeHeld)
          this.#sql.exec(`INSERT INTO seed_offices (profile, role, body, entry, office_entity, body_entity, seeded_at)
                          VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(profile, role, body) DO NOTHING`,
                         profile, role, body, entry, o.entity_id, bodyHeld ? b.entity_id : "", this.#iso());
        const zone = zoneOf(p) ? { zone: zoneOf(p) } : null;
        const rule = (ids2) => ({ rule: "a jurisdiction profile's office entry, seeded at setup", source, ids: ids2 });
        /* A line needs both its ends held under identifiers. Neither held: the two entities' answers say why, and no
           line is named; one held: the line is answered could-not-be-seeded, naming the end that is missing. */
        if (officeHeld && bodyHeld)
          put(this.#seedLine({ key: `post_in|${o.entity_id}|${b.entity_id}|${profile}`, kind: "post_in",
                               from: o.entity_id, to: b.entity_id, valid: zone, basis: rule({ from: officeId, to: bodyId }) }),
              { what: "post_in", ...where });
        else if (officeHeld || bodyHeld)
          put({ state: "unseeded", why: `its ${officeHeld ? "body" : "office"} is not held under an identifier, so the line has `
            + "only one identified end" }, { what: "post_in", ...where });
        if (!bodyHeld) return;
        const within = cp.within && typeof cp.within === "object" ? cp.within : null;
        const withinId = within ? InstanceSetup.#ident(within.ids) : null;
        if (!within) {
          put({ state: "unseeded", why: "the profile names no organisation this body is within, so no part_of line is seeded" },
              { what: "part_of", ...where });
          return;
        }
        const wLabel = typeof within.label === "string" && within.label.trim() ? within.label.trim() : null;
        const wKind = ["institution", "body", "movement"].includes(within.kind) ? within.kind : "institution";
        if (!withinId || !wLabel) {
          put({ state: "unseeded", why: `the profile names the organisation this body is within with no ${!wLabel ? "label" : "identifier (within.ids)"}, `
            + "so it is not seeded and no part_of line is" }, { what: "part_of", ...where });
          return;
        }
        const w = this.#seedEntity({ p, ident: withinId, kind: wKind, label: wLabel, sector: "government", source,
          row: `${profile}/${entry}/within`, note: `The organisation the body "${body}" is part of, as the active ${cite} names it; seeded at setup.` });
        put(w, { what: "organisation", ...where, label: wLabel, ident: withinId });
        if (!w.entity_id || w.state === "unseeded") {
          put({ state: "unseeded", why: "the organisation is not held under its identifier, so the line has no identified ends" },
              { what: "part_of", ...where });
          return;
        }
        put(this.#seedLine({ key: `part_of|${b.entity_id}|${w.entity_id}|${profile}`, kind: "part_of",
                             from: b.entity_id, to: w.entity_id, valid: zone, basis: rule({ from: bodyId, to: withinId }) }),
            { what: "part_of", ...where });
      });
    }
    out.counts = { seeded: out.seeded.length, already: out.already.length, unseeded: out.unseeded.length };
    return out;
  }

  /** K1683: the office a seeded office entity is, as `{role, body}` (with its profile), or null for an entity this
   *  module did not seed from a profile office (`profile` given: from that profile only). Writes nothing; never throws. */
  officeOf(entityId, profile = null) {
    try {
      if (typeof entityId !== "string" || !entityId) return null;
      const rows = this.#rows(`SELECT profile, role, body FROM seed_offices WHERE office_entity = ? ORDER BY profile, role, body`, entityId)
        .filter((r) => profile == null || r.profile === profile);
      return rows.length ? { role: rows[0].role, body: rows[0].body, profile: rows[0].profile } : null;
    } catch { return null; }
  }

  /** K1683: the office entity seeded for a profile office `{role, body}`, or null: none seeded, or more than one
   *  entity seeded under that role and body (two profiles naming it with different identifiers), which is not
   *  settled here. Writes nothing; never throws. */
  officeEntityOf({ role = null, body = null } = {}) {
    try {
      const r = typeof role === "string" ? role.trim() : "", b = typeof body === "string" ? body.trim() : "";
      if (!r || !b) return null;
      const ids = [...new Set(this.#rows(`SELECT office_entity FROM seed_offices WHERE role = ? AND body = ?`, r, b).map((x) => x.office_entity))];
      return ids.length === 1 ? ids[0] : null;
    } catch { return null; }
  }

  /* A held capture's text, locator and instant (`deps.readCapture`, else the record's evidence store and the receipt
     provenance holds for it), or null. */
  async #readCapture(sha) {
    if (typeof this.#deps.readCapture === "function") return this.#deps.readCapture(sha);
    const store = this.#record().evidenceStore ? this.#record().evidenceStore() : null;
    const obj = store ? await store.get(sha) : null;
    if (!obj) return null;
    const text = new TextDecoder().decode(new Uint8Array(await obj.arrayBuffer()));
    const got = provenanceOf(this.#ctx).receipts();
    const first = (got && Array.isArray(got.rows) ? got.rows : []).filter((r) => r && r.capture_sha === sha)
      .sort((a, b) => Date.parse(a.first_retrieved) - Date.parse(b.first_retrieved))[0];
    return first ? { text, locator: first.address, at: first.first_retrieved } : null;
  }

  /* R51: the profile bodies (the active profiles' counterparty bodies) matched to the Legistar bodies of one parsed
     `bodies` capture, by exact equality of normalised forms: a Legistar body's form is the organisation the
     body-variant map names for it, else its marker-stripped base name folded; a profile body's forms are its own name
     folded and, where its entry names one, its `organisation` key. One form's several `BodyId`s are one match. */
  #matchBodies(parsed, active) {
    const groups = new Map();
    for (const r of parsed.rows) {
      const f = r.facts || {};
      const form = typeof f.organisation === "string" && f.organisation ? `organisation:${f.organisation}`
        : `name:${termFold(f.base ?? f.name ?? "")}`;
      if (form === "name:") continue;
      if (!groups.has(form)) groups.set(form, []);
      groups.get(form).push({ BodyId: f.BodyId, name: f.name, source: r.source });
    }
    const out = [];
    for (const { id: profile, p } of active) {
      const view = { vocabulary: p.vocabulary || {} };
      (Array.isArray(p.counterparties) ? p.counterparties : []).forEach((cp, i) => {
        const body = cp && typeof cp.body === "string" ? cp.body.trim() : "";
        if (!body) return;
        const read = legistarBodyName(body, { view });
        const forms = new Set([`name:${termFold(read.base)}`, `name:${termFold(body)}`]);
        for (const o of [cp.organisation, read.organisation]) if (typeof o === "string" && o) forms.add(`organisation:${o}`);
        const hits = [...forms].filter((f) => groups.has(f));
        const entry = `counterparties[${i}]`;
        const role = typeof cp.role === "string" ? cp.role.trim() : "";
        /* R52: the body's organisation, for the MemberType map: the counterparty's own key, else the one its name reads as. */
        const organisation = [cp.organisation, read.organisation, hits.length === 1 && hits[0].startsWith("organisation:")
          ? hits[0].slice("organisation:".length) : null].find((o) => typeof o === "string" && o) ?? null;
        if (hits.length === 1) { out.push({ profile, entry, role, body, matched: true, form: hits[0], organisation, bodies: groups.get(hits[0]) }); return; }
        const terms = termFold(body).split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2);
        const near = hits.length > 1 ? hits.flatMap((h) => groups.get(h))
          : [...groups.values()].flat().filter((g) => terms.length && terms.every((t) => termFold(g.name).includes(t)));
        out.push({ profile, entry, role, body, matched: false, candidates: near.slice(0, 20).map((g) => ({ BodyId: g.BodyId, name: g.name })),
          why: hits.length > 1 ? "its normalised forms equal more than one Legistar body's; it is never resolved by choosing one, and a member may match it by their own act"
                               : "no Legistar body's normalised form equals it; it is never matched by a near name, and a member may match it by their own act" });
      });
    }
    return out;
  }

  /** R51, R52, op=seatsseed: from held captures of the client's `bodies`, `persons` and `officerecords` (each a sha, the
   *  office records one or more pages), the profile bodies matched to Legistar bodies (R51), each match's `BodyId`s held
   *  on the body entity, and each seat on a matched body seeded with its holder (R52). An administrator's act. */
  async seatsSeed({ bodies = null, persons = null, officerecords = null, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "seeding the seats Legistar records");
    const active = this.#activeProfiles();
    const want = { bodies: [bodies], persons: [persons], officerecords: Array.isArray(officerecords) ? officerecords : [officerecords] };
    const parsed = {};
    for (const [endpoint, shas] of Object.entries(want)) {
      const list = shas.filter((x) => x !== null && x !== undefined);
      if (!list.length || list.some((x) => typeof x !== "string" || !x.trim()))
        return refusal("SEED_CAPTURE_UNREADABLE", `the request names no capture of Legistar's ${endpoint}. Nothing was seeded.`, { endpoint });
      const pages = [];
      for (const sha of list) {
        let cap = null;
        try { cap = await this.#readCapture(sha.trim().toLowerCase()); } catch { cap = null; }
        if (!cap || typeof cap.text !== "string")
          return refusal("SEED_CAPTURE_UNREADABLE", `the record holds no readable capture ${sha.slice(0, 64)}. Nothing was seeded.`,
                         { endpoint, capture: sha });
        let one = null;
        try {
          one = legistarParse({ locator: cap.locator, text: cap.text, at: cap.at ?? null,
                                view: { vocabulary: Object.assign({}, ...active.map(({ p }) => p.vocabulary || {})) } });
        } catch (e) { one = { why: String(e && e.message || e) }; }
        if (!one || one.why || one.endpoint !== endpoint)
          return refusal("SEED_CAPTURE_NOT_LEGISTAR", `capture ${sha.slice(0, 64)} is not a Legistar ${endpoint} list`
            + `${one && one.why ? ` (${one.why.slice(0, 200)})` : one && one.endpoint ? ` (it is ${one.endpoint})` : ""}. Nothing was seeded.`,
            { endpoint, capture: sha });
        pages.push({ ...one, sha: sha.trim().toLowerCase(), at: cap.at ?? null });
      }
      parsed[endpoint] = pages;
    }
    const out = { ok: true, matches: [], unmatched: [], seeded: [], already: [], unseeded: [], holders_undetermined: [],
                  bodies_without_records: [], same_names: [], by };
    const put = (r, item) => { out[r.state === "seeded" ? "seeded" : r.state === "already" ? "already" : "unseeded"].push(
      { ...item, ...(r.entity_id ? { entity_id: r.entity_id } : {}), ...(r.line_id ? { line_id: r.line_id } : {}),
        ...(r.why ? { why: r.why } : {}) }); };
    if (!active.length) { out.detail = "no profile is active, so no body is named and nothing is seeded"; return out; }
    const bodiesCap = parsed.bodies[0];
    const instant = (at) => (typeof at === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(at) ? `${at.slice(0, 19)}Z` : null);
    /* R51: the matches, each BodyId held on the profile's seeded body entity. */
    const seatBodies = new Map();   // BodyId → {entity, p, profile, label, ident}
    for (const m of this.#matchBodies(bodiesCap, active)) {
      if (!m.matched) { out.unmatched.push(m); continue; }
      const { p } = active.find((a) => a.id === m.profile);
      const sch = InstanceSetup.#scheme(p, LEGISTAR_SCHEMES.body);
      const office = this.#one(`SELECT body_entity FROM seed_bodies WHERE profile = ? AND role = ? AND body = ?`, m.profile, m.role, m.body);
      const match = { profile: m.profile, entry: m.entry, role: m.role, body: m.body, form: m.form,
                      bodies: m.bodies.map((b) => ({ BodyId: b.BodyId, name: b.name })) };
      out.matches.push(match);
      if (!office) { match.why = "the profile's body is not seeded (R50: the profile names no identifier for it, ids.body), so its BodyIds are held on no entity"; continue; }
      if (!sch) { match.why = `the profile declares no identifier scheme ${LEGISTAR_SCHEMES.body}, so its BodyIds are held on no entity`; continue; }
      for (const b of m.bodies) {
        const ident = { scheme: LEGISTAR_SCHEMES.body, id: String(b.BodyId) };
        const why = InstanceSetup.#identWhy(p, ident, "body");
        let r;
        if (why) r = { state: "unseeded", why };
        else {
          const got = this.#entities().addIdentifier({ entityId: office.body_entity, scheme: ident.scheme, id: ident.id, by: SEED_MACHINE,
                                                       basis: { system: sch.systems[0], row: `legistar:body:${b.BodyId}` } });
          r = got && got.ok === true ? { state: got.already ? "already" : "seeded", entity_id: office.body_entity }
            : { state: "unseeded", why: `the registry refused the identifier: ${got && (got.reason || got.detail)}` };
          if (r.state !== "unseeded") {
            this.#ledgerEntity(ident, office.body_entity, "body", m.body, { capture: bodiesCap.sha, row: b.source });
            seatBodies.set(b.BodyId, { entity: office.body_entity, p, profile: m.profile, label: m.body, ident,
                                       organisation: m.organisation });
          }
        }
        put(r, { what: "body_identifier", profile: m.profile, body: m.body, ident });
      }
    }
    /* R52: the seats of the matched bodies, and their holders. */
    const people = new Map();
    for (const r of parsed.persons[0].rows) people.set(r.facts.PersonId, r);
    const records = legistarPages(parsed.officerecords);
    const recRows = Array.isArray(records.rows) ? records.rows : [];
    out.records = { pages: records.pages, complete: records.complete, conflicts: records.conflicts, refused: records.refused,
                    ...(records.why ? { why: records.why } : {}) };
    const pageOf = (row) => parsed.officerecords.find((pg) => pg.rows.includes(row)) || parsed.officerecords[0];
    const seen = new Set();
    for (const row of recRows) {
      const f = row.facts || {};
      const sb = seatBodies.get(f.BodyId);
      if (!sb) continue;
      seen.add(f.BodyId);
      const page = pageOf(row) || parsed.officerecords[0];
      const recordedAt = instant(page.at);
      const seatIdent = { scheme: LEGISTAR_SCHEMES.seat, id: String(f.OfficeRecordId) };
      const memberType = typeof f.role === "string" ? f.role.trim() : "";
      const seat = this.#seedEntity({ p: sb.p, ident: seatIdent, kind: "office", label: `${memberType || "Seat"}, ${sb.label}`,
        source: { capture: page.sha, row: row.source }, row: row.key,
        note: `A seat on ${sb.label}, Legistar office record ${f.OfficeRecordId}, ${LEGISTAR_BASIS} (its MemberType: ${memberType || "not given"}).` });
      const where = { OfficeRecordId: f.OfficeRecordId, BodyId: f.BodyId, PersonId: f.PersonId ?? null };
      put(seat, { what: "seat", ...where });
      if (!seat.entity_id || seat.state === "unseeded") continue;
      const basis = (ids) => ({ rule: "a Legistar office record", source: page.sha, system: LEGISTAR_KEY, recorded_at: recordedAt,
                                row: row.source, ids });
      put(this.#seedLine({ key: `seat_on|${seat.entity_id}|${sb.entity}|${row.key}`, kind: "seat_on", from: seat.entity_id,
                           to: sb.entity, basis: basis({ from: seatIdent, to: sb.ident }) }), { what: "seat_on", ...where });
      const pr = people.get(f.PersonId);
      if (!Number.isInteger(f.PersonId) || !pr) {
        out.holders_undetermined.push({ ...where, why: Number.isInteger(f.PersonId)
          ? `the persons capture holds no PersonId ${f.PersonId}, so the holder is not seeded` : "the office record names no PersonId" });
        continue;
      }
      const name = pr.facts.name_normal || pr.facts.name || `Legistar person ${f.PersonId}`;
      const others = Array.isArray(pr.same_name_as) ? pr.same_name_as : [];
      const personIdent = { scheme: LEGISTAR_SCHEMES.person, id: String(f.PersonId) };
      const person = this.#seedEntity({ p: sb.p, ident: personIdent, kind: "person", label: name,
        source: { capture: parsed.persons[0].sha, row: pr.source }, row: pr.key,
        note: `Legistar person ${f.PersonId}, ${LEGISTAR_BASIS}.` + (others.length
          ? ` Legistar also lists ${others.map((x) => `PersonId ${x}`).join(", ")} under the same name; they are held as `
            + "separate persons and never merged here: whether they are one person is a member's claim." : "") });
      if (others.length && !out.same_names.some((s2) => s2.PersonId === f.PersonId))
        out.same_names.push({ PersonId: f.PersonId, name, same_name_as: others });
      put(person, { what: "person", ...where });
      if (!person.entity_id || person.state === "unseeded") continue;
      /* jurisdictions R60 (K1729): an entry for the seat's body's organisation is read before one for all bodies. */
      const types = (sb.p.vocabulary && Array.isArray(sb.p.vocabulary.member_types) ? sb.p.vocabulary.member_types : [])
        .filter((x) => x && x.member_type === memberType);
      const map = (sb.organisation ? types.find((x) => x.organisation === sb.organisation) : null)
        ?? types.find((x) => x.organisation === undefined || x.organisation === null);
      const capacity = map && LINE_CAPACITIES.includes(map.capacity) ? map.capacity : null;
      if (!capacity) {
        out.holders_undetermined.push({ ...where, person: person.entity_id, seat: seat.entity_id,
          why: `the profile maps no capacity for the MemberType ${JSON.stringify(memberType)}${sb.organisation ? ` on ${sb.organisation}` : " on this body"} `
            + "or on all bodies, so the holder's capacity is undetermined and no holds line is recorded" });
        continue;
      }
      const zone = zoneOf(sb.p) ?? undefined;
      put(this.#seedLine({ key: `holds|${person.entity_id}|${seat.entity_id}|${row.key}`, kind: "holds", from: person.entity_id,
                           to: seat.entity_id, capacity,
                           valid: { from: f.start ?? null, to: f.end ?? null, precision: "day", ...(zone ? { zone } : {}) },
                           basis: basis({ from: personIdent, to: seatIdent }) }),
          { what: "holds", ...where, capacity, start: f.start ?? null, end: f.end ?? null, dated: `${LEGISTAR_BASIS} on ${recordedAt}` });
    }
    for (const [bodyId, sb] of seatBodies)
      if (!seen.has(bodyId)) out.bodies_without_records.push({ BodyId: bodyId, body: sb.label,
        why: "Legistar holds no office record for this body (as for the boards and commissions), so no seat is seeded" });
    out.counts = { matched: out.matches.length, unmatched: out.unmatched.length, seeded: out.seeded.length,
                   already: out.already.length, unseeded: out.unseeded.length, holders_undetermined: out.holders_undetermined.length };
    return out;
  }

  /* =====================================================================
   * THE ASSISTANT, OPTIONAL FOR THE COPY, AND EACH MEMBER'S DISCLOSURE (R53–R55; K1502, K1478 (i), D311).
   *
   * The copy holds no Claude credential: enabling the assistant binds none, and each member who wants it connects their
   * own account (credentials R22). The switch is the administrator's (K1522), off unless chosen, and every set is
   * appended with who and when. While it is off, every ask and every run is refused by name (`ASSISTANT_OFF`) through
   * `assistantGate`, which the plane and `answers` read before any model turn; turning it off ends nothing recorded.
   * ===================================================================== */

  /** R53: the switch as recorded, off when nothing is. Writes nothing and never throws. */
  assistantState() {
    let r = null;
    try { r = this.#one(`SELECT on_, set_by, set_at FROM assistant_switch ORDER BY seq DESC LIMIT 1`); } catch { r = null; }
    return r ? { ok: true, on: r.on_ === 1, set_by: r.set_by, set_at: r.set_at }
             : { ok: true, on: false, set_by: null, set_at: null,
                 detail: "the assistant has never been switched on for your group's Civicsmith, so it is off" };
  }

  /** R53, op=assistantset: an administrator switches the assistant on or off for this copy. `by` is the control
   *  plane's stamp (R29). Each set is appended, a repeat of the current value included, so the history says who
   *  chose what and when. */
  assistantSet({ on = undefined, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "switching the assistant on or off for your group's Civicsmith");
    /* DEC-49 REGION is-assistant-switch */
    if (typeof on !== "boolean")
      return refusal("ASSISTANT_SWITCH_MALFORMED", "`on` is true (switch the assistant on) or false (switch it off). "
        + "Nothing was changed.");
    /* END DEC-49 REGION is-assistant-switch */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (?, ?, ?)`, on ? 1 : 0, by, at);
    return { ok: true, on, set_by: by, set_at: at,
             history: this.#rows(`SELECT on_, set_by, set_at FROM assistant_switch ORDER BY seq`)
               .map((r) => ({ on: r.on_ === 1, set_by: r.set_by, set_at: r.set_at })),
             note: on
               ? "the assistant is on for your group's Civicsmith. Switching it on binds no account: each member who "
                 + "wants it is served by their own Claude account or API key, connected by their own act, or by the "
                 + "group's Anthropic API key, which an administrator sets, switches and removes; each is told first "
                 + "where their questions go."
               : "the assistant is off for your group's Civicsmith: no ask is put to it and no run starts. Nothing already recorded "
                 + "is changed or ended." };
  }

  /** R55: null while the assistant is on; otherwise the refusal every ask and every run answers, whoever asks and
   *  whatever account they hold. A standing question is not run while it is off. Writes nothing. */
  assistantGate() {
    const st = this.assistantState();
    if (st.on === true) return null;
    /* DEC-49 REGION is-assistant-on */
    return refusal("ASSISTANT_OFF", st.set_at
      ? `an administrator switched the assistant off for your group's Civicsmith on ${st.set_at}; no ask is put to it and no run starts.`
      : "the assistant has never been switched on for your group's Civicsmith; no ask is put to it and no run starts.",
      { set_by: st.set_by, set_at: st.set_at });
    /* END DEC-49 REGION is-assistant-on */
  }

  /** R54, op=disclosureshown: the disclosure was shown to `member` before they connected their own account. `by` is
   *  the control plane's stamp and must be that member's own session: no one records it on another's behalf. */
  disclosureShown({ member = null, version = null, by = null } = {}) {
    const m = typeof member === "string" ? member.trim() : "";
    const v = typeof version === "string" ? version.trim() : "";
    /* DEC-49 REGION is-disclosure-shown */
    if (!m || !v)
      return refusal("DISCLOSURE_MALFORMED", `${!m ? "the request names no member" : "the request names no version of "
        + "the disclosure's words"}. Nothing was recorded.`);
    if (typeof by !== "string" || by !== m || /^class:/.test(by))
      return refusal("DISCLOSURE_NOT_THE_MEMBERS", "the disclosure is recorded by the member it was shown to, from "
        + "their own signed-in session. Nothing was recorded.", { member: m, by: by ?? null });
    /* END DEC-49 REGION is-disclosure-shown */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO assistant_disclosures (member, version, shown_by, shown_at) VALUES (?, ?, ?, ?)`,
                   m, v.slice(0, 80), by, at);
    return { ok: true, member: m, version: v.slice(0, 80), shown_at: at, shown: v.slice(0, 80) === ASSISTANT_DISCLOSURE.version };
  }

  /** R54: whether the disclosure at the current version (or `version`) was recorded as shown to `member`. A member with
   *  none recorded is `shown: false`, never assumed. Writes nothing and never throws. */
  disclosureOf({ member = null, version = ASSISTANT_DISCLOSURE.version } = {}) {
    const m = typeof member === "string" ? member.trim() : "";
    const v = typeof version === "string" && version.trim() ? version.trim() : ASSISTANT_DISCLOSURE.version;
    let r = null;
    try {
      r = m ? this.#one(`SELECT version, shown_at FROM assistant_disclosures WHERE member = ? AND version = ?
                         ORDER BY seq DESC LIMIT 1`, m, v) : null;
    } catch { r = null; }
    return r ? { ok: true, member: m, version: v, shown: true, shown_at: r.shown_at }
             : { ok: true, member: m || null, version: v, shown: false, shown_at: null,
                 detail: m ? "no disclosure at this version is recorded as shown to this member"
                           : "the request names no member, so no disclosure is recorded as shown" };
  }

  /* =====================================================================
   * A PLACE NOT YET HELD (R60, R62; DEC-150). An administrator may name the place the group works in when no held
   * profile covers it. The name is held only here: no public read, notice, submission, edition, export or request to
   * another host carries it, and it is never a profile, a jurisdiction or a local fact. At each start, a held profile
   * that matches it and was not held before is recorded once as an arrival, which `queue-producers` (its R38) raises to
   * the administrators as one Status item through the read this module registers; it leaves when that profile is made
   * active (R14) or the name is cleared or changed.
   * ===================================================================== */

  #placeCurrent() {
    return this.#one(`SELECT seq, name, set_by, set_at FROM place_wanted ORDER BY seq DESC LIMIT 1`) || null;
  }
  /* The held profiles a place can arrive as: every held profile that is not a test profile, by id. */
  #heldPlaceIds() {
    return this.#juris().list().filter((p) => p && p.test !== true && typeof p.id === "string").map((p) => p.id);
  }
  #seePlaces(at) {
    this.#sql.exec(`INSERT INTO place_seen (id, profiles, seen_at) VALUES (1, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET profiles = excluded.profiles, seen_at = excluded.seen_at`,
                   JSON.stringify(this.#heldPlaceIds()), at);
  }
  #leaveArrivals(why, at, profiles = null) {
    for (const r of this.#rows(`SELECT seq, profile FROM place_arrivals WHERE left_at IS NULL`))
      if (!profiles || profiles.includes(r.profile))
        this.#sql.exec(`UPDATE place_arrivals SET left_at = ?, left_why = ? WHERE seq = ?`, at, why, r.seq);
  }
  /* R62: a profile matches the named place when its name or one of its covers, folded as extraction's term fold, is
     exactly the name folded the same way. */
  static #placeMatches(p, name) {
    const want = termFold(name);
    return !!want && [p && p.name, ...(p && Array.isArray(p.covers) ? p.covers : [])]
      .some((x) => typeof x === "string" && termFold(x) === want);
  }

  /** R60, op=placewanted: an administrator names the place the group works in that no held profile covers, or clears
   *  it with `name: null`. `by` is the control plane's stamp (R29). Each set or clear is appended with who and when. */
  placeWantedSet({ name = undefined, by = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "naming the place your group works in");
    let value = null;
    if (name !== null) {
      const s = typeof name === "string" ? name.trim() : "";
      const chars = [...s].length;
      /* DEC-49 REGION is-place-name */
      if (!s || chars > PLACE_NAME_MAX || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(s))
        return refusal("PLACE_NAME_MALFORMED", `${s ? `a name of ${chars} characters` : "the request names no place, and "
          + "one is named as"} one line of 1 to ${PLACE_NAME_MAX} characters with no control characters; null clears it. `
          + "Nothing was changed.");
      /* END DEC-49 REGION is-place-name */
      value = s;
    }
    const at = this.#iso();
    const before = this.#placeCurrent();
    this.#sql.exec(`INSERT INTO place_wanted (name, set_by, set_at) VALUES (?, ?, ?)`, value, by, at);
    /* R62: the open arrivals leave when the name is cleared or changed; the profiles held now are what a later start
       compares against, so a profile already held when the name is set is not an arrival. */
    if (before && before.name !== null && before.name !== value)
      this.#leaveArrivals(value === null ? "the name was cleared" : "the name was changed", at);
    this.#seePlaces(at);
    return { ok: true, name: value, set_by: by, set_at: at,
             history: this.#rows(`SELECT name, set_by, set_at FROM place_wanted ORDER BY seq`).map((r) => ({ ...r })),
             note: value === null
               ? "no place is named. Nothing about it was ever sent anywhere."
               : "the name is kept only in your group's Civicsmith and sent nowhere. When an installed update brings a "
                 + "profile for it, the administrators are told once and may choose it under Places." };
  }

  /** R60, op=placewantedstate: the named place, to an administrator only, with R62's open arrivals as `matches`. */
  placeWanted({ viewer = null } = {}) {
    if (typeof viewer !== "string" || !viewer || !this.#membership().isAdministrator(viewer))
      return notAnAdmin(viewer ?? null, "reading the place your group named");
    const cur = this.#placeCurrent();
    return { ok: true, name: cur ? cur.name : null, set_by: cur ? cur.set_by : null, set_at: cur ? cur.set_at : null,
             matches: this.placeArrivals({ viewer }).arrivals };
  }

  /** R62: `{ok, arrivals}`, the open arrivals (those that have not left), each with the profile's name and covers: to
   *  an administrator, and to the plane's own in-process read (`viewer: null`, as `queue-producers` R38 reads it, which
   *  addresses its item to the administrators); `arrivals: []` to anyone else. Writes nothing; never throws. */
  placeArrivals({ viewer = null } = {}) {
    try {
      if (viewer !== null && viewer !== undefined
          && (typeof viewer !== "string" || !viewer || !this.#membership().isAdministrator(viewer))) return { ok: true, arrivals: [] };
      return { ok: true, arrivals: this.#rows(`SELECT name, profile, found_at FROM place_arrivals WHERE left_at IS NULL ORDER BY seq`).map((r) => {
        const p = this.#juris().get(r.profile);
        return { name: r.name, profile: r.profile, profile_name: p ? p.name ?? null : null,
                 covers: p && Array.isArray(p.covers) ? [...p.covers] : [], found_at: r.found_at };
      }) };
    } catch { return { ok: true, arrivals: [] }; }
  }

  /* R62, at each start with a place named: every held non-test profile matching the name, not held at the last compare
     (or at the set), and not active, is recorded once as an arrival; then the profiles held now are what the next start
     compares against. */
  #comparePlaces() {
    const cur = this.#placeCurrent();
    if (!cur || cur.name === null) return { compared: false };
    const at = this.#iso();
    const seenRow = this.#one(`SELECT profiles FROM place_seen WHERE id = 1`);
    let seen = null;
    try { seen = seenRow ? JSON.parse(seenRow.profiles) : null; } catch { seen = null; }
    const active = new Set(this.#activeIds());
    let found = 0;
    if (Array.isArray(seen))
      for (const id of this.#heldPlaceIds()) {
        if (seen.includes(id) || active.has(id) || !InstanceSetup.#placeMatches(this.#juris().get(id), cur.name)) continue;
        const r = this.#rows(`INSERT INTO place_arrivals (place_seq, name, profile, found_at) VALUES (?, ?, ?, ?)
                              ON CONFLICT(place_seq, profile) DO NOTHING RETURNING seq`, cur.seq, cur.name, id, at);
        found += r.length;
      }
    this.#seePlaces(at);
    return { compared: true, arrived: found };
  }
  #activeIds() {
    const set = this.#record().getSetting("jurisdiction_profiles");
    return Array.isArray(set) ? set.filter((x) => typeof x === "string") : [];
  }

  /* =====================================================================
   * A MEMBER'S LANGUAGE (R64; DEC-127 (1)). The language a member chooses for the screens, by their own act; the screens
   * show each word in it where a translation is held and in English where none is. `null` clears the choice.
   * ===================================================================== */

  /** R64, op=memberlanguageset: `by` (the control plane's stamp) is the member, and nobody sets it for another. */
  memberLanguageSet({ language = undefined, by = null } = {}) {
    const who = typeof by === "string" ? by.trim() : "";
    /* DEC-49 REGION is-member-language */
    if (!who || /^class:/.test(who))
      return refusal("MACHINE_CANNOT_SET_LANGUAGE", "the language of the screens is set by the member, from their own "
        + "signed-in session. Nothing was changed.", { by: by ?? null });
    let tag = null;
    if (language !== null) {
      tag = typeof language === "string" ? language.trim() : "";
      if (!isLocale(tag))
        return refusal("LANGUAGE_MALFORMED", `${tag ? `'${tag.slice(0, 40)}' is not` : "the request names no language, and "
          + "one is chosen as"} one well-formed BCP 47 language tag (en, es, zh-Hant); null clears the choice. Nothing was changed.`);
    }
    /* END DEC-49 REGION is-member-language */
    const at = this.#iso();
    this.#sql.exec(`INSERT INTO member_languages (member, language, set_at) VALUES (?, ?, ?)`, who, tag, at);
    return { ok: true, member: who, language: tag, set_at: at,
             note: tag === null
               ? "no language is chosen: the screens follow your device's setting again."
               : "the screens show each word in this language where a translation is held, and in English where none is." };
  }

  /** R64, op=memberlanguage: the viewer's own choice, `{language, set_at}`, and nobody else's. Writes nothing. */
  memberLanguage({ viewer = null } = {}) {
    const who = typeof viewer === "string" ? viewer.trim() : "";
    let r = null;
    try {
      r = who && !/^class:/.test(who)
        ? this.#one(`SELECT language, set_at FROM member_languages WHERE member = ? ORDER BY seq DESC LIMIT 1`, who) : null;
    } catch { r = null; }
    return { ok: true, language: r ? r.language ?? null : null, set_at: r ? r.set_at : null };
  }

  /* =====================================================================
   * TWO ADMINISTRATORS, EACH HOLDING RECOVERY CODES (R66; K1888, DEC-134 (2), (6)). The one-time recommendation of a
   * second administrator is a step of setting up the group, answered to each administrator: how many administrators the
   * group has (`membership.activeAdmins`, its R86) and whether the viewer's own role holds unspent recovery codes
   * (`credentials.recoveryCodesState`, its R46). It gates nothing: a group may run with one administrator.
   * ===================================================================== */

  /** R66, op=adminrecoverystep: `{ok: true, administrators, codes_held, remaining, met}` to an administrator (`viewer`,
   *  the control plane's stamp, R29), `NOT_AN_ADMIN` to anyone else, a machine credential included. A provider that does
   *  not answer is the store's silence (R43), never `met: false`. Writes nothing and never throws. */
  adminRecoveryStep({ viewer = null } = {}) {
    const silent = (what, e) => ({ ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER",
      detail: `${what} did not answer (${String(e && e.message || e).slice(0, 160)}), so whether the step is met is not known` });
    const who = typeof viewer === "string" ? viewer.trim() : "";
    let admin;
    try { admin = !!who && !/^class:/.test(who) && this.#membership().isAdministrator(who) === true; }
    catch (e) { return silent("the membership read of who is an administrator", e); }
    if (!admin) return notAnAdmin(viewer ?? null, "reading the step of two administrators holding recovery codes");
    let admins, codes;
    try { admins = this.#membership().activeAdmins(); }
    catch (e) { return silent("the membership read of the administrators", e); }
    try { codes = this.#credentials().recoveryCodesState({ by: who }); }
    catch (e) { return silent("the read of your recovery codes", e); }
    if (!Array.isArray(admins)) return silent("the membership read of the administrators", "no list");
    if (!codes || codes.ok !== true || typeof codes.held !== "boolean") return silent("the read of your recovery codes", "no answer");
    const administrators = admins.length;
    const remaining = Number.isInteger(codes.remaining) && codes.remaining > 0 ? codes.remaining : 0;
    const codes_held = codes.held === true && remaining > 0;
    return { ok: true, administrators, codes_held, remaining, met: administrators >= 2 && codes_held };
  }

  /* =====================================================================
   * THE ASSISTANT DRAFTS THE GROUP'S DESCRIPTION (R65; DEC-152, K1818, K1837, K1841 (2)). On "Who your group is", an
   * administrator answers a few questions and asks for a labelled draft of the group's focus and purpose
   * (`membership` R109). It writes nothing: the words become the group's only when the administrator keeps them through
   * `op=groupdescriptionset`. The draft is built from the answers and, while the suggestions switch of the account that
   * serves the administrator is on, what the group holds, and it passes `wizard-scripts`' no-added-fact check. In T35
   * (N686, K1974) the door routes the draft past every refusal to `agent-worker`'s `POST /draft` (its R59; `control-plane`
   * R57): it may hand that call in as `turn`, and a draft it cannot serve (no turn, no answer, or one over the limits)
   * answers `ASSISTANT_DRAFT_UNAVAILABLE`, so the page's fields are unchanged.
   * ===================================================================== */

  /** R65, op=groupdescriptiondraft, which the door routes itself and calls here in-process (control-plane R57): `by` and
   *  `viewer` are its stamps (R29) and `assistant` is `{on, account}` as it resolved them (never the key); `answers` is
   *  the request's. The refusals, in order: NOT_AN_ADMIN, ASSISTANT_OFF, the door's account and
   *  ceiling codes (answered there), GROUP_DRAFT_ANSWERS_MALFORMED or GROUP_DRAFT_NO_ANSWERS; then the draft, or, when
   *  the draft cannot be served, ASSISTANT_DRAFT_UNAVAILABLE. `turn` is the door's call to agent-worker's `/draft`
   *  (`{answers, account, holdings}` → `{focus, purpose, readLog}`), else the one this module was built with. */
  async groupDescriptionDraft({ answers = undefined, assistant = null, viewer = null, by = null, turn = null } = {}) {
    if (typeof by !== "string" || !by || !this.#membership().isAdministrator(by))
      return notAnAdmin(by ?? null, "asking the assistant to draft your group's description");
    const off = this.assistantGate();
    if (off) return off;
    if (assistant && typeof assistant === "object" && assistant.on === false)
      return refusal("ASSISTANT_OFF", "the assistant is not on for this request, so no question is put to it.");
    /* DEC-49 REGION is-group-draft-answers */
    const given = Array.isArray(answers) && answers.length <= GROUP_DRAFT_ANSWERS_MAX ? answers : null;
    if (!given || given.some((a) => !a || typeof a !== "object" || typeof a.question !== "string"
                                    || typeof a.text !== "string" || [...a.text].length > GROUP_DRAFT_ANSWER_MAX))
      return refusal("GROUP_DRAFT_ANSWERS_MALFORMED", `the answers are a list of at most ${GROUP_DRAFT_ANSWERS_MAX} `
        + `{question, text}, each text at most ${GROUP_DRAFT_ANSWER_MAX} characters. Nothing was saved.`);
    if (given.every((a) => !a.text.trim()))
      return refusal("GROUP_DRAFT_NO_ANSWERS", "every answer is empty, so there is nothing to draft from. Nothing was saved.");
    /* END DEC-49 REGION is-group-draft-answers */
    const unavailable = () => draftUnavailable("the assistant could not serve a draft of the group's description, so "
      + "nothing was drafted and the fields are as they were.");
    const draftTurn = typeof turn === "function" ? turn : this.#deps.groupDraftTurn;
    if (typeof draftTurn !== "function") return unavailable();
    const account = assistant && typeof assistant === "object" ? assistant.account ?? null : null;
    const suggestions = !!(account && account.suggestions === true);
    let got = null;
    try { got = await draftTurn({ answers: given.map((a) => ({ question: a.question, text: a.text })), account, holdings: suggestions }); }
    catch { got = null; }
    if (!got || typeof got !== "object") return unavailable();
    const told = given.map((a) => a.text);
    const readLog = Array.isArray(got.readLog) ? got.readLog : [];
    const out = { ok: true, withheld: [] };
    for (const [field, max] of [["focus", GROUP_FOCUS_MAX], ["purpose", GROUP_PURPOSE_MAX]]) {
      const text = typeof got[field] === "string" ? got[field] : "";
      const checked = checkDraft(text, { told, readLog, firsthand: false, suggestions, askedBy: by });
      if (!checked || checked.ok !== true) return draftRefused(checked);
      if ([...checked.text].length > max) return unavailable();
      out[field] = { text: checked.text, label: { kind: "machine", asked_by: by } };
      out.withheld.push(...(checked.withheld || []).map((w) => ({ field, ...w })));
    }
    out.note = "a draft: nothing is saved until you edit it and keep it, and then the words are your group's.";
    return out;
  }

  /* =====================================================================
   * THE INSTANCE'S OWN LIMITS (K98; R33–R40). What runs here COST, measured, and where the CPU ceiling lies, found
   * by walking into it. They are measurements of the runtime, not of the corpus (R41).
   * ===================================================================== */

  /** R33: record what a run cost. The peak is kept beside the last because the peak is the run that will die first
   *  and a mean would hide it. `unit` is the metric's (R34), fixed by its first observation. Never throws. */
  recordRuntimeObservation({ metric, ms, detail = null, at = null, unit = null } = {}) {
    try {
      if (typeof metric !== "string" || !metric || typeof ms !== "number" || !Number.isFinite(ms)) return { recorded: false };
      const now = at || stampInstant("second", this.#now());
      const cur = this.#one(`SELECT * FROM runtime_observations WHERE metric = ?`, metric);
      if (!cur) {
        this.#sql.exec(
          `INSERT INTO runtime_observations (metric, peak_ms, peak_at, peak_detail, last_ms, last_at, samples, total_ms, unit)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`, metric, ms, now, detail, ms, now, ms,
          typeof unit === "string" && unit ? unit : unitOfMetric(metric));
        return { metric, peak_ms: ms, last_ms: ms, samples: 1, new_peak: true };
      }
      const isPeak = ms > cur.peak_ms;
      this.#sql.exec(
        `UPDATE runtime_observations SET last_ms = ?, last_at = ?, samples = samples + 1, total_ms = total_ms + ?
         ${isPeak ? ", peak_ms = ?, peak_at = ?, peak_detail = ?" : ""} WHERE metric = ?`,
        ...(isPeak ? [ms, now, ms, ms, now, detail, metric] : [ms, now, ms, metric]));
      return { metric, peak_ms: isPeak ? ms : cur.peak_ms, last_ms: ms, samples: cur.samples + 1, new_peak: isPeak };
    } catch { return { recorded: false }; }
  }

  /** R34: every metric in name order, each with the unit it was recorded in. A time is also given under its `_ms`
   *  names; a count of work never is, so a count is never described as a time. */
  runtimeObservations() {
    const metrics = this.#rows(`SELECT * FROM runtime_observations ORDER BY metric`).map((r) => {
      const unit = r.unit || unitOfMetric(r.metric);
      const mean = r.samples ? r.total_ms / r.samples : null;
      return { metric: r.metric, unit, peak: r.peak_ms, peak_at: r.peak_at, peak_detail: r.peak_detail ?? null,
               last: r.last_ms, last_at: r.last_at, samples: r.samples, total: r.total_ms, mean,
               ...(unit === "ms" ? { peak_ms: r.peak_ms, last_ms: r.last_ms, total_ms: r.total_ms, mean_ms: mean } : {}) };
    });
    return { metrics,
      note: "each metric is stated in its own unit. A metric in ms is measured wall time across synchronous compute "
          + "segments, not billed CPU time; a metric in bytes is a count of the work a run handled, not a time. peak "
          + "is the run that would die first if a ceiling were near; a mean would hide it." };
  }

  /** R40: a probe run begins. Its steps are numbered and timed from this run's own start. */
  recordCpuProbeStart({ run, iterations = null, budgetMs = null, at = null } = {}) {
    if (typeof run !== "string" || !run) return { recorded: false };
    this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, budget_ms) VALUES (?, ?, ?, ?)
                    ON CONFLICT(run) DO NOTHING`, run, at || stampInstant("second", this.#now()), iterations, budgetMs);
    return { run, recorded: true };
  }

  /** R35: one completed step of one run (`run`, R40): its number, its elapsed time from its run's start, its
   *  iterations and the instant. Never throws for a well-formed call. */
  recordCpuProbeStep({ run = LEGACY_PROBE_RUN, step, elapsedMs, iterations, at = null } = {}) {
    const now = at || stampInstant("second", this.#now());
    /* A step with no recorded start (a caller that names no run) belongs to a run whose end is not known either. */
    if (!this.#one(`SELECT run FROM cpu_probe_runs WHERE run = ?`, run))
      this.#sql.exec(`INSERT INTO cpu_probe_runs (run, started_at, iterations, reason) VALUES (?, ?, ?, 'unrecorded')`,
                     run, now, iterations);
    this.#sql.exec(
      `INSERT INTO cpu_probe_steps (run, step, elapsed_ms, iterations, at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(run, step) DO UPDATE SET elapsed_ms = excluded.elapsed_ms, at = excluded.at`,
      run, step, elapsedMs, iterations, now);
    return { run, step, elapsed_ms: elapsedMs };
  }

  /** R40: a probe run returned, with what it completed and why it stopped. A run with no end is one cut off. */
  recordCpuProbeEnd({ run, completed = null, elapsedMs = null, reason = null, at = null } = {}) {
    if (typeof run !== "string" || !run) return { recorded: false };
    this.#sql.exec(`UPDATE cpu_probe_runs SET ended_at = ?, completed = ?, elapsed_ms = ?, reason = ? WHERE run = ?`,
                   at || stampInstant("second", this.#now()), completed, elapsedMs, reason, run);
    return { run, recorded: true };
  }

  /** R36, R40: where the probe got to, and so what is known about the ceiling. Writes nothing. */
  cpuProbeState() {
    const runs = this.#rows(`SELECT * FROM cpu_probe_runs ORDER BY started_at, run`);
    const steps = this.#rows(`SELECT run, step, elapsed_ms, iterations, at FROM cpu_probe_steps ORDER BY run, step`);
    const byRun = new Map(runs.map((r) => [r.run, []]));
    for (const s of steps) (byRun.get(s.run) || byRun.set(s.run, []).get(s.run)).push(s);
    const rows = [];
    let top = null;
    const runOut = runs.map((r) => {
      const own = (byRun.get(r.run) || []).map((s) => ({ step: s.step, elapsed_ms: s.elapsed_ms, iterations: s.iterations, at: s.at }));
      for (const s of own) {
        rows.push({ run: r.run, ...s });
        if (!top || s.elapsed_ms > top.elapsed_ms) top = s;
      }
      const last = own[own.length - 1] || null;
      const returned = r.ended_at ? true : r.reason === "unrecorded" ? null : false;
      return { run: r.run, started_at: r.started_at, iterations: r.iterations, budget_ms: r.budget_ms ?? null,
               steps: own, returned,
               ...(r.ended_at ? { ended: { at: r.ended_at, completed: r.completed, elapsed_ms: r.elapsed_ms, reason: r.reason } } : {}),
               ...(returned === false ? { bracket: { last_completed_step: last ? last.step : 0,
                                                     above_ms: last ? last.elapsed_ms : 0,
                                                     next_step: (last ? last.step : 0) + 1 } } : {}) };
    });
    const cut = runOut.filter((r) => r.returned === false && r.steps.length);
    return { steps: rows.length, highest_completed: top ? top.step : 0, elapsed_at_highest_ms: top ? top.elapsed_ms : 0,
      rows, runs: runOut,
      note: !rows.length
        ? "the probe has never run, so nothing is known about the ceiling by measurement"
        : `a run completed a step ${top.elapsed_ms} ms into its own isolate, so the ceiling lies above `
          + `elapsed_at_highest_ms. `
          + (cut.length ? "A run with no recorded end was cut off: the ceiling lies within its bracket, above its last "
                        + "completed step's elapsed time and below what its next step would have cost."
                        : "No run has been cut off yet, so the ceiling is above everything tried.") };
  }
}

/* R12 (N420): the three facts of the active profiles' combined view that `agent-worker` R51 reads: `deadlines` and
   `legal_organisations` as `jurisdictions.combine` gives them (its R29, R34), and `venues`, each `{kind, venue}` of a
   combined `action_kinds` entry that gives one (its R25, R29). A fact no active profile states, or that `combine`
   withholds (a conflict) or cannot give (its errors), is ABSENT, never an empty list: the reader then reads it
   undetermined, which is what it is. Nothing here chooses between profiles or supplies a default. */
function profileView(combined) {
  const view = {};
  const v = combined && combined.ok === true && combined.view && typeof combined.view === "object" ? combined.view : null;
  if (!v) return view;
  for (const fact of ["deadlines", "legal_organisations"])
    if (Array.isArray(v[fact]) && v[fact].length) view[fact] = v[fact];
  const venues = (Array.isArray(v.action_kinds) ? v.action_kinds : [])
    .filter((k) => k && typeof k.kind === "string" && k.venue && typeof k.venue === "object")
    .map((k) => ({ kind: k.kind, venue: k.venue }));
  if (venues.length) view.venues = venues;
  return view;
}

const INSTANCES = new WeakMap();

/** The one instance of this module for a Durable Object's storage (K61). `deps` is read on the first call only. */
export function instanceSetupOf(ctx, env = null, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let m = INSTANCES.get(storage);
  if (!m) { m = new InstanceSetup(ctx, env || {}, deps); INSTANCES.set(storage, m); }
  return m;
}

/** This module's Durable Object routes (the `membershipOps` pattern). The stamps (`author`, `by`, `origin`) are the
 *  control plane's, read from the query AFTER the body is spread, so a body naming its own is overwritten (R29).
 *  The map joins `control-plane`'s one route map (its R35; N348), so every route passes its frame: R26's body read,
 *  R27's existence read, the envelope and R25's catch. This module keeps no door or Durable Object class of its own. */
export function instanceSetupOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    instancegroup: () => m.instanceGroup(),
    instancegrouppublic: () => m.instanceGroupPublic(),
    instancegroupseed: () => m.instanceGroupSeed({ ...(body || {}), author: q("author") }),
    groupnameset: () => m.groupNameSet({ ...(body || {}), by: q("by") }),
    groupdomainset: () => m.groupDomainSet({ ...(body || {}), by: q("by"), origin: q("origin") }),
    groupidentity: () => m.groupIdentity(),
    groupidentitypublic: () => m.groupIdentityPublic(),
    profiles: () => m.profiles(),
    profilesset: () => m.profilesSet({ ...(body || {}), by: q("by") }),
    runtimeobservations: () => m.runtimeObservations(),
    cpuprobestate: () => m.cpuProbeState(),
    cpuprobestart: () => m.recordCpuProbeStart(body || {}),
    recordcpuprobestep: () => m.recordCpuProbeStep(body || {}),
    cpuprobeend: () => m.recordCpuProbeEnd(body || {}),
    assistantstate: () => m.assistantState(),
    assistantset: () => m.assistantSet({ ...(body || {}), by: q("by") }),
    disclosureshown: () => m.disclosureShown({ ...(body || {}), by: q("by") }),
    disclosureof: () => m.disclosureOf({ member: q("member") ?? (body || {}).member, version: q("version") ?? (body || {}).version }),
    officesseed: () => m.officesSeed({ ...(body || {}), boot: false, by: q("by") }),
    seatsseed: () => m.seatsSeed({ ...(body || {}), by: q("by") }),
    placewanted: () => m.placeWantedSet({ ...(body || {}), by: q("by") }),
    placewantedstate: () => m.placeWanted({ viewer: q("viewer") }),
    memberlanguageset: () => m.memberLanguageSet({ ...(body || {}), by: q("by") }),
    memberlanguage: () => m.memberLanguage({ viewer: q("viewer") }),
    adminrecoverystep: () => m.adminRecoveryStep({ viewer: q("viewer") }),
  };
}

/* ============================================================================================================
 * THE INSTANCE'S REPORTS, WORKER SIDE (R17–R19, R37, R38). The credential, the namespace and the envelope are the
 * control plane's: each function takes the `{json, storeSilent, doAnswer, storeRefusal}` it hands them (capture's
 * `knockOp` pattern) and the store it resolved, and answers a Response.
 * ============================================================================================================ */

/* R43 (N339, N349; control-plane R23, R25): what a relay answers for a store reply `doAnswer` did not read as an
   answer. The store's own refusal (`ok: false` below 500) is relayed with its status, code and sentence, through the
   plane's `storeRefusal` when it is handed one, else as that function answers it (`json(body, status)`); anything
   else is a silence, carrying the correlation id `doAnswer` read from the store's internal error, when it gave one.
   One rule for every relay, a sub-read inside a longer act included (K444). */
function notAnswered(out, op, { json, storeSilent, storeRefusal }) {
  if (out && out.refused === true && out.reply)
    return typeof storeRefusal === "function" ? storeRefusal(out) : json(out.reply.body, out.reply.status);
  return storeSilent(op, out ? out.correlation : undefined);
}

/* REC-163 / IC-174 / D-596 — THE PUBLIC READ OF THE PRODUCING GROUP, ONE READER FOR THE SURFACES THAT SHOW IT TO A
   STRANGER: op=instancegroup's and op=groupidentity's public arms and the setup page served at `/` (R3, R10, R20).
   Exactly two projections may be named; any other value is answered as a silence rather than forwarded, so a typo
   cannot reach a Durable Object path. An instance with no store binding cannot be asked, and that is a silence too. */
export const PUBLIC_GROUP_PROJECTIONS = Object.freeze(["instancegrouppublic", "groupidentitypublic"]);
export async function publicInstanceGroup(env, storeName, projection = "instancegrouppublic", doAnswer) {
  if (!PUBLIC_GROUP_PROJECTIONS.includes(projection)) return { answered: false, result: undefined };
  let stub = null;
  try { stub = env.STORE.get(env.STORE.idFromName(storeName)); } catch { stub = null; }
  if (!stub) return { answered: false, result: undefined };
  return doAnswer(stub.fetch(`http://do/${projection}`));
}

/** R3 over the wire: a credentialed reader (`viewer` set by the control plane) is answered the whole row; anybody
 *  else the public projection. A silence is a silence (REC-52), never "no group is recorded". */
export async function instanceGroupOp(env, storeName, { viewer = null, cls = null } = {}, io) {
  const { json, doAnswer } = io;
  if (viewer) {
    const out = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://do/instancegroup"));
    if (!out.answered) return notAnswered(out, "instancegroup", io);
    return json({ ok: true, result: out.result, store: storeName, tokenClass: cls }, 200);
  }
  const pub = await publicInstanceGroup(env, storeName, "instancegrouppublic", doAnswer);
  if (!pub.answered) return notAnswered(pub, "instancegroup", io);
  return json({ ok: true, result: pub.result, store: storeName }, 200);
}

/** R10, R11 over the wire: the credentialed read (R11) or the public projection (R10). */
export async function groupIdentityOp(env, storeName, { viewer = null, cls = null } = {}, io) {
  const { json, doAnswer } = io;
  const out = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
    .fetch(viewer ? "http://do/groupidentity" : "http://do/groupidentitypublic"));
  if (!out.answered) return notAnswered(out, "groupidentity", io);
  return json({ ok: true, result: out.result, store: storeName, ...(viewer ? { tokenClass: cls } : {}) }, 200);
}

/** R17, op=bootstrap: this isolate's `version`, `bootstrapConfigured` (a live ADMIN_TOKEN), membership's
 *  `bootstrapState` and the store's own `storeVersion` from the Durable Object's route, and with `members` each
 *  member's own build (D-116: THREE BUILDS, EACH READ FROM WHERE IT RUNS — `storeVersion` is never written here). */
export async function bootstrapReport(env, fp, { members = false, stub, json, storeSilent, doAnswer, storeRefusal }) {
  const out = await doAnswer(stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`)));
  if (!out.answered) return notAnswered(out, "bootstrap", { json, storeSilent, storeRefusal });
  return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result,
                ...(members ? { memberVersions: await memberVersions(env) } : {}) }, 200);
}

/** R18, op=selftest: deployment health as JSON, so "did the deploy work" is a link rather than a command. It
 *  reports every binding, relays the store's stats (under op=stats' stamps: `capacity` for the admin class and the
 *  caller's `viewer`), and round-trips R2 under the scratch prefix; it never returns a secret. `ok` is false when
 *  exactly one bucket is bound, when the store does not answer, when the round trip fails, or when a required token
 *  binding is not live. */
export async function selftest(env, storeName, { cls = null, viewer = "", scratch = "scratch" } = {}, { json, doAnswer }) {
  /* R2 is optional by design: "not configured" is a first-class healthy state, distinct from "configured and
     broken", and the buckets are only ever added as a pair. */
  const r2Configured = typeof env.CAPTURES?.get === "function" && typeof env.PUBLISHED?.get === "function";
  const out = {
    ok: true, service: "bio-plane", version: env.VERSION || "0.0.0", time: new Date().toISOString(), tokenClass: cls,
    bindings: {
      STORE: typeof env.STORE?.idFromName === "function",
      CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
      PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
      ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
      MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
      PROBE_TOKEN: await liveToken(env.PROBE_TOKEN),
      /* REC-33: REPORTED, and deliberately NOT required: an instance that predates this class runs monitoring on the
         ADMIN_TOKEN fallback and is healthy. */
      DAEMON_TOKEN: (typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN.length > 0)
        ? await liveToken(env.DAEMON_TOKEN) : "not configured",
    },
    r2Configured,
  };
  /* Half a fence is a defect, not an option. */
  if ((typeof env.CAPTURES?.get === "function") !== (typeof env.PUBLISHED?.get === "function")) {
    out.ok = false;
    out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
  }
  try {
    /* REC-52: a store that answered `ok:false`, or did not answer, is a failure of the health check, never healthy. */
    const sOut = await doAnswer(env.STORE.get(env.STORE.idFromName(storeName))
      .fetch(`http://x/stats?capacity=${cls === "admin" ? "1" : "0"}&viewer=${encodeURIComponent(viewer ?? "")}`));
    if (!sOut.answered) { out.ok = false; out.store = "ERR the store did not answer /stats"; }
    else out.store = sOut.result;
  } catch (e) { out.ok = false; out.store = "ERR " + String(e && e.message || e); }
  if (r2Configured) {
    try {
      const key = `${scratch}/selftest-${Date.now()}`;
      await env.CAPTURES.put(key, "ok");
      const back = await env.CAPTURES.get(key);
      out.captures = (await back.text()) === "ok" ? "read-write ok" : "MISMATCH";
      if (out.captures !== "read-write ok") out.ok = false;
      await env.CAPTURES.delete(key);
    } catch (e) { out.ok = false; out.captures = "ERR " + String(e && e.message || e); }
  } else {
    out.captures = "not configured";
  }
  /* Required for health: the store and three live token bindings. R2 is reported but not required. */
  out.bindingsAllPresent = out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true
    && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
  if (!out.bindingsAllPresent) out.ok = false;
  return json(out, out.ok ? 200 : 500);
}

/* The sentence R37 states: the subrequest ceiling is known by being refused, the CPU ceiling by op=cpuprobe. */
export const RUNTIME_ASYMMETRY = "a refused subrequest throws and is caught, so the subrequest ceiling is known by "
  + "having hit it. Exceeding the CPU limit TERMINATES the isolate, so no run can report its own death: consumption "
  + "is measured on every run and the ceiling is found by op=cpuprobe, whose checkpoints survive the kill.";

/** R37, op=runtime: R34's measurements, R36's probe state and capture's subrequest ceiling (capture R23), through one
 *  surface. When any of the three reads does not answer, the op answers the store-silence refusal (REC-52); the first
 *  of them, in read order, that is the store's own refusal or a silence is relayed as R43 says (K444). */
export async function runtimeOp(stub, io) {
  const { json, doAnswer } = io;
  const obsOut = await doAnswer(stub.fetch("http://x/runtimeobservations"));
  const probeOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  const limOut = await doAnswer(stub.fetch("http://x/capturelimit?runtime=subrequests"));
  const miss = [obsOut, probeOut, limOut].find((o) => !o.answered);
  if (miss) return notAnswered(miss, "runtime", io);
  return json({ ok: true, measured: obsOut.result, cpu_probe: probeOut.result, subrequests: limOut.result,
                asymmetry: RUNTIME_ASYMMETRY });
}

/** R38–R40, op=cpuprobe: find the CPU ceiling by walking into it. R36 is read first (a store that does not answer
 *  burns nothing); a new run is started under its own id, each completed step is written, and CONFIRMED, before the
 *  next begins (R39: an unconfirmed checkpoint ends the probe); its end is written when it returns. */
export async function cpuProbeOp(stub, { iterations = null, budget_ms = null, run = null, probe = cpuProbe } = {},
                                 io) {
  const { json, storeSilent, doAnswer } = io;
  const beforeOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  if (!beforeOut.answered) return notAnswered(beforeOut, "cpuprobe", io);
  if (!beforeOut.result) return storeSilent("cpuprobe");
  const iters = Math.max(100000, Number(iterations) || 2000000);
  const budget = Math.max(50, Number(budget_ms) || 20000);
  const id = typeof run === "string" && run ? run
    : `${new Date().toISOString().slice(0, 19)}Z~${crypto.randomUUID().slice(0, 8)}`;
  const post = (path, body) => doAnswer(stub.fetch(`http://x/${path}`, { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  const started = await post("cpuprobestart", { run: id, iterations: iters, budgetMs: budget });
  if (!started.answered) return notAnswered(started, "cpuprobe", io);
  if (!started.result || started.result.recorded !== true) return storeSilent("cpuprobe");
  let confirmed = 0;
  const UNCONFIRMED = Symbol("unconfirmed");
  let r;
  try {
    r = await probe({
      startStep: 0, iterationsPerStep: iters, budgetMs: budget,
      checkpoint: async (step, elapsed) => {
        const w = await post("recordcpuprobestep", { run: id, step, elapsedMs: elapsed, iterations: iters });
        if (!w.answered || !w.result || w.result.step !== step) throw UNCONFIRMED;
        confirmed = step;
      },
    });
  } catch (e) {
    if (e !== UNCONFIRMED) throw e;
    r = null;
  }
  /* R39: a probe the store stopped confirming returned no result of its own; the trail says how far it got. */
  const complete = r !== null;
  if (!complete) r = { completed: confirmed, elapsed_ms: null, reason: null };
  if (complete) await post("cpuprobeend", { run: id, completed: r.completed, elapsedMs: r.elapsed_ms, reason: r.reason });
  const afterOut = await doAnswer(stub.fetch("http://x/cpuprobestate"));
  if (!afterOut.answered) return notAnswered(afterOut, "cpuprobe", io);
  return json({ ok: true, run: { ...r, id }, state: afterOut.result, trail_complete: complete,
    ...(complete ? {} : { last_confirmed_step: confirmed }),
    note: complete
      ? "this run RETURNED, so the ceiling is above its elapsed time. If a later run does not return, its last "
        + "recorded step is the last one that fit and the ceiling lies just above that step's elapsed_ms."
      : `the store did not confirm step ${confirmed + 1}, so the probe stopped there and burned nothing more: the `
        + `trail is incomplete, and the last step the store confirmed is ${confirmed}.` });
}

/* ============================================================================================================
 * THE REPORT OPS' DISPATCH (the legacy-index map's §4.4 plain move, K649 (7)): which of this module's Worker functions
 * answers each report op, moved out of `src/index.mjs`. The door resolves the store, the class and the viewer stamp
 * (`control-plane`'s) and hands them in; who may call each op is `op-declarations`' and `admission`'s.
 * ============================================================================================================ */

/* The admitted ops this module answers at the Worker. `bootstrap` is the public door's default answer (below). */
export const INSTANCE_SETUP_OPS = Object.freeze(["selftest", "livefire", "runtime", "cpuprobe"]);

/** One of INSTANCE_SETUP_OPS, answered. `storeName` is the namespace the door resolved, `cls` the caller's class,
 *  `viewer` the door's viewer stamp for that caller, `scratch` the rehearsal namespace's name. */
export async function instanceSetupOp(op, url, env, storeName, { cls = null, viewer = "", scratch = "scratch", json,
                                                                  doAnswer, storeSilent, storeRefusal } = {}) {
  const io = { json, doAnswer, storeSilent, storeRefusal };
  const store = () => env.STORE.get(env.STORE.idFromName(storeName));
  /* selftest reports deployment health as JSON, so "did the deploy work" is a
     link rather than a command. It asserts every binding is present and that
     the store answers, and it never returns a secret. */
  if (op === "selftest") return selftest(env, storeName, { cls, scratch, viewer }, { json, doAnswer });

  if (op === "livefire") {
    const out = await livefire(env, storeName, { capacity: cls === "admin", viewer });
    /* D-506 / IC-265, on BOB #32's ruling of 2026-09-24 06:07Z. This read `out.ok ? 200 : 500`, and
       `out.ok` WAS the canary's verdict — which is why a failing canary answered `ok:false` with no
       code of any kind to every consumer that reads `ok:false` as a refusal. `out.ok` is now
       `true` whenever the op answered, and the verdict lives in `out.verdict` / `out.failing`.
       THE STATUS IS KEYED TO THE VERDICT, so it is byte-for-byte what it was for every outcome: a
       DIST gate or a curl that reads the status alone loses nothing to this change, which is the
       whole point of moving the verdict to keys of its own rather than deleting it from the wire. */
    return json(out, out.verdict === "pass" ? 200 : 500);
  }

  /* What runs here have COST, measured. A read, and the honest counterpart to
     the store's `capturelimit` read — a DO PATH and not an op, M0-12; nothing
     on the control plane reaches it — : that one reports a ceiling found by
     being refused, this one reports consumption found by measuring, because
     CPU has no catchable refusal to find a ceiling with. */
  if (op === "runtime") return runtimeOp(store(), io);

  /* Find the CPU ceiling by walking into it. Each completed step is
     checkpointed durably BEFORE the next begins, so when the isolate is killed
     the trail shows the last step that finished and the ceiling is bracketed.
     Probe class only: it burns compute on purpose and belongs nowhere near a
     member's session. */
  if (op === "cpuprobe") return cpuProbeOp(store(),
    { iterations: url.searchParams.get("iterations"), budget_ms: url.searchParams.get("budget_ms") }, io);

  return null;
}

/** R17 at the public door: op=bootstrap, the default answer of an unauthenticated call. REC-52: the same spread as
 *  the store reads'. A store silence used to leave a `{ok:true}` carrying the service name, the version and the
 *  bootstrap flag and NOTHING the store knows — an instance answering "here is what I am" while unable to say
 *  anything about itself. The installer and `newgroup` both read this op, so the false success reached a caller
 *  deciding whether an instance was ready. `members=1` adds each member's own build. */
export function bootstrapOp(url, env, fp, { stub, json, storeSilent, storeRefusal, doAnswer }) {
  return bootstrapReport(env, fp, { members: url.searchParams.get("members") === "1", stub, json, storeSilent,
                                    storeRefusal, doAnswer });
}
