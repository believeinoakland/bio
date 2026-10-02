/* network-notices — "working on" notices (requirements: `build/requirements/network-notices.md`; DEC-111, K1019, K1031,
 * K1100; BOB's rulings on the draft, K1114 (c), K1115, K1119).
 *
 * A project's owner tells the network that the group is working on something. The notice is prepared from a real
 * project and signed in the browser by the owner (`NS_NOTICE`), as a case is: prepare, sign, post (R1–R6). The copy
 * then states, signed with its own instance key (provenance R56), what the owner cannot honestly assert alone: the
 * activity level, re-signed monthly, the cases the project has published, the seals opened, and the closing or lapse
 * (R7–R13). Every week it seals each project's member acts under one independent timestamp (R14–R16) and opens the
 * seals touching a case when the case is published (R17, R18). It serves the group's public signing keys, without
 * names (R21). It sends nothing anywhere but the timestamp requests (R30), and no answer names a member (R25).
 *
 * A NEW MODULE (T23, layer 8). REACHED as `networkNoticesOf(host, deps)` (K61): one instance per host. At creation it
 * creates its tables, declares them to record-core's purge (whole store only, R26) and registers its ids' mint seed.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record        `transact`, `mintOpaqueId`, `manifestEntry`, `declarePurge`, `registerMintSeed`; the `bundles` and
 *                 `manifest` read contract (its R37) for the member acts (R8) and a project's creation.
 *   membership    `sight` (R44), `isProjectOwner` (R54), `ownsAnyProject` (R67), `positionalMember` (R76).
 *   credentials   `attestingKeys` (R11), `signerList` (R8).
 *   promotion     the fact `producingGroup` (its R40).
 *   provenance    `instanceSign`, `instanceKeys` (R56).
 *   projectStage  `projectStage` (its R1, R2), for `closed`.
 *   publication   `caseCitedParts` (R41); its tables `cases`, `published_cases`, `published_case_members`,
 *                 `published_bundles`, `case_documents` under its R40.
 *   governor      `{admit, report}` for `governedFetch` (host-governor R15), the timestamp authorities' pacing.
 *   fetch         the outbound fetch, used for the timestamp authorities alone (R30).
 *   now           the clock, milliseconds (default `env.BIO_NOW_MS`, else the wall clock).
 *
 * The words of the ceremony (the warning, the caution, "others welcome", the levels' presentation) are the UX design
 * stream's (K1031 (5)); this module carries a code and a plain statement of meaning, never their final words.
 * No place is named here (R29). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, noSuchProject } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf, instanceStatement } from "../provenance/index.mjs";
import { projectStageOf } from "../project-stage/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { governorOf, governedFetch } from "../host-governor/index.mjs";
import { verifySshsig, NS_NOTICE, noticeStatement } from "../sshsig.mjs";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS, TSA_CONTENT_TYPE, TSA_ACCEPT } from "../tsa.mjs";
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync, createSha256 } from "../record-grammar/sha256.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { NETWORK_NOTICE_CHECKS, rowOf } from "./checks.mjs";
import { NETWORK_NOTICES_TABLES, NETWORK_NOTICES_MINT_SEED, migrateNetworkNotices } from "./schema.mjs";
import {
  DAY_MS, WEEK_MS, weekStartOf, weekLabel, weekStartFromLabel, dateOf, parseDate, ACTIVITY_WINDOW, ACTIVITY_METHOD,
  ACTIVITY_METHOD_VERSION, levelOf, SEAL_SLOTS, WEEK_SLOTS, SEAL_METHOD, leafHash, weekLeafHash, slotsFor, randomHex,
  randomPositions, treeOf, rootOf, pathOf, verifyOpening,
} from "./seals.mjs";

export { NETWORK_NOTICE_CHECKS } from "./checks.mjs";
export { NETWORK_NOTICES_SCHEMA, NETWORK_NOTICES_TABLES } from "./schema.mjs";
export {
  weekStartOf, weekLabel, ACTIVITY_WINDOW, ACTIVITY_LEVELS, ACTIVITY_METHOD, ACTIVITY_METHOD_VERSION, levelOf,
  SEAL_SLOTS, WEEK_SLOTS, SEAL_METHOD, leafHash, nodeHash, weekLeafHash, climb, verifyOpening,
} from "./seals.mjs";

/* ---------------------------------------------------------------- the formats and bounds (R2, R3, R12) */

export const NOTICE_FORMAT = "civicos-working-on/1";
export const ATTESTATION_FORMAT = "civicos-working-on-attestation/1";
export const OPENING_FORMAT = "civicos-working-on-opening/1";
/** K1115: the prefix notice ids are minted under (`mintOpaqueId`); never a project's id. */
export const NOTICE_ID_PREFIX = "NOTE";
export const WORDING_MAX = 280;            // R1
export const SUBJECT_MAX = 120;            // R1: `body` and `matter`
export const HANDOFF_MAX = 280;            // R1, R11
export const PREPARED_TTL_MS = 60 * 60 * 1000;   // R2: `expires`
export const PUBLIC_LIMIT = 200;           // R20
export const PUBLIC_LIMIT_MAX = 1000;      // R20
export const ATTESTATION_KINDS = Object.freeze(["posted", "monthly", "published", "closed", "lapsed"]);
export const NOTICE_STATUSES = Object.freeze(["open", "stopped", "closed", "lapsed"]);
/** R3: the doorbell's path relative to the group's public address (`capture`'s knock, its R32: `op=knock`). */
export const DOORBELL_PATH = "?op=knock";
/** R3: the fixed sentence every revision carries. Its final words are the UX design stream's (K1031). */
export const OTHERS_WELCOME = "Others working on this are welcome to make contact.";
/** R2: the outward-act warning, as a code and its meaning; its words are the UX design stream's (K1031 (5)). */
export const OUTWARD_ACT_WARNING = Object.freeze({
  code: "outward_act",
  meaning: "The public, including anyone being examined, will see this notice, and stopping it later will not unsay it.",
});
/** R2 (K1031 (4)): the caution's code; it never refuses, and its words are the UX design stream's. */
export const CAUTION_TWO_OPEN = "two_open_without_published_work";
/** R21: how the copy's own keys are labelled. */
export const COPY_KEY_LABEL = "this copy's key";
/** The statement kind a key probe signs (R1's instance-key refusal; provenance offers no other way to ask). */
const PROBE_KIND = "civicos-working-on-probe/1";

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const WELL_FORMED = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const oneLine = (v, max) => typeof v === "string" && !!v.trim() && v.length <= max && !/[\n\r]/.test(v) && !WELL_FORMED.test(v);
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const clamp = (v, dflt, max) => { const n = Math.floor(Number(v)); return v != null && v !== "" && Number.isFinite(n) ? Math.min(Math.max(n, 1), max) : dflt; };
const yes = (v) => v === true || v === "true" || v === "1" || v === 1;
const te = new TextEncoder(), td = new TextDecoder();
const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const keyB64Of = (k) => { const s = str(k); if (!s) return null; const p = s.split(/\s+/); return p.length > 1 && /^ssh-/.test(p[0]) ? p[1] : p[0]; };
const monthOf = (ms) => dateOf(ms).slice(0, 7);
const monthStartOf = (ms) => { const d = new Date(Number(ms)); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };
const nextMonthStart = (ms) => { const d = new Date(Number(ms)); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1); };

/* DEC-49: a refusal of this module's own carries its code, its row and the member's translation; one another module
   answered (membership's `noSuchProject`) passes through as it came. */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string" || r.check) return r;
  const row = rowOf(r.reason);
  return row ? { ...r, code: r.code ?? r.reason, check: row.check, translation: row.translation } : r;
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });
const required = (op, argument, shape) => ({
  ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, status: 400,
  detail: `op=${op} needs '${argument}' in the shape ${shape}, and this request carried none the operation could use. `
    + "Nothing was published." });

export class NetworkNotices {
  #held = new Map();       /* R2, R4: prepared answers, by member and digest, kept in memory: prepare writes nothing */
  #reserved = new Map();   /* R2: the notice id a first revision of a project would take, per UTC day */
  #closedCheckDay = null;  /* the day the attestation tick last looked for closed projects */
  #deps;

  constructor({ storage, record, membership, host = null, env = null, now = null, ...deps } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
    this.#deps = { host, ...deps };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get credentials() { return this.#deps.credentials ||= credentialsOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get stage() { return this.#deps.projectStage ||= projectStageOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get governor() {
    if (this.#deps.governor === undefined) {
      const g = governorOf(this.#deps.host, { env: this.env });
      this.#deps.governor = { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) };
    }
    return this.#deps.governor;
  }
  get fetch() { return this.#deps.fetch || ((u, i) => globalThis.fetch(u, i)); }

  migrate() { migrateNetworkNotices(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #call(fn, dflt = null) { try { return fn(); } catch { return dflt; } }
  #nowMs() {
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env.BIO_NOW_MS);
    return Number.isFinite(v) && v >= 0 ? v : Date.now();
  }
  #stamp(ms = this.#nowMs()) { return stampInstant("second", ms); }

  /* ================================================================ facts read from neighbours */

  #member(identity) {
    if (!str(identity) || isMachineIdentity(identity)) return null;
    return this.#call(() => this.membership.positionalMember(null, String(identity).trim()));
  }
  #slug() {
    const f = this.#call(() => this.promotion.fact("producingGroup"));
    return f && f.ok && str(f.value) ? str(f.value) : null;
  }
  #isProject(pid) { return this.#call(() => this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, pid))?.object_type === "project"; }
  /* project-stage R2's `closed`, read as the internal caller (the founder's viewer sees every project). */
  #closed(pid) { return this.#call(() => this.stage.projectStage({ project: pid, viewer: "admin" }))?.stage === "closed"; }
  /* The UTC date of the first entry in the project's history (R1, R27). */
  #createdDate(pid) {
    const r = this.#one(`SELECT MIN(created) AS c FROM manifest WHERE bundle_id=?`, pid);
    const ms = r && r.c ? Date.parse(r.c) : NaN;
    return Number.isFinite(ms) ? dateOf(ms) : null;
  }
  /* R1: whether the instance key is bound: provenance R56 answers it only by signing, so a probe statement is signed
     and discarded (it never reaches this module's tables). */
  async #keyBound() {
    try {
      const r = await this.provenance.instanceSign(instanceStatement(PROBE_KIND, sha256HexSync("")));
      return !!(r && r.ok);
    } catch { return false; }
  }
  #anyPublishedEdition() {
    return !!this.#call(() => this.#one(`SELECT 1 AS x FROM published_cases WHERE ratified_at IS NOT NULL LIMIT 1`));
  }

  /* ================================================================ notices and their state */

  #notice(nid) { return typeof nid === "string" ? this.#one(`SELECT * FROM nn_notices WHERE notice_id=?`, nid) : null; }
  #noticesOfProject(pid) { return this.#rows(`SELECT * FROM nn_notices WHERE project=? ORDER BY opened_at, rowid`, pid); }
  #latestRevision(nid) { return this.#one(`SELECT * FROM nn_revisions WHERE notice_id=? ORDER BY revision DESC LIMIT 1`, nid); }
  #revisions(nid) { return this.#rows(`SELECT * FROM nn_revisions WHERE notice_id=? ORDER BY revision`, nid); }
  /* R11, R12: a stopped revision makes the notice stopped; else a closed or lapsed attestation; else open. */
  #status(nid) {
    const rev = this.#latestRevision(nid);
    if (rev && rev.status === "stopped") return "stopped";
    const end = this.#one(`SELECT kind FROM nn_attestations WHERE notice_id=? AND kind IN ('closed','lapsed') ORDER BY seq LIMIT 1`, nid);
    return end ? end.kind : "open";
  }
  #openNotice(pid) { return this.#noticesOfProject(pid).reverse().find((n) => this.#status(n.notice_id) === "open") || null; }
  #openCount(except = null) {
    return this.#rows(`SELECT notice_id FROM nn_notices`).filter((n) => n.notice_id !== except && this.#status(n.notice_id) === "open").length;
  }

  /* ================================================================ R1: the refusals, in order */

  /* R1's caller refusals (the project, the caller, the owner, closed, the slug, the key), in R1's order. `ctx` answers
     the project, the member and the slug. */
  async #callerRefusal({ project, by, viewer, final, notice }, op) {
    const pid = str(project);
    if (!pid) return { refusal: required(op, "project", "a project id") };
    const sees = this.#isProject(pid) && this.#call(() => this.membership.sight(pid, str(viewer) || str(by))) === "full";
    if (!sees) return { refusal: noSuchProject(pid) };
    /* DEC-49 REGION is-notice-caller */
    const member = this.#member(by);
    if (!str(by) || isMachineIdentity(by) || !member)
      return { refusal: refuse("MACHINE_CANNOT_POST_NOTICE", str(by)
        ? "a notice is prepared and posted by a member signed in as themselves, and this caller is not one"
        : "no member is named as the one acting: this call carries nobody") };
    if (!this.#call(() => this.membership.isProjectOwner(pid, member), false))
      return { refusal: refuse("NOTICE_NOT_THE_OWNER", "only an owner of the project posts its notice", { project: pid }) };
    if (this.#closed(pid)) {
      const nid = str(notice);
      const stopping = final === "stopped" && nid && this.#notice(nid)?.project === pid
        && this.#latestRevision(nid)?.status !== "stopped" && ["open", "closed"].includes(this.#status(nid));
      if (!stopping) return { refusal: refuse("NOTICE_PROJECT_CLOSED", "the project is closed; only a stop of its open notice is taken", { project: pid }) };
    }
    const slug = this.#slug();
    if (!slug) return { refusal: refuse("NOTICE_NO_GROUP_SLUG", "no group slug is recorded, and there are no anonymous notices") };
    if (!(await this.#keyBound()))
      return { refusal: refuse("NOTICE_NO_INSTANCE_KEY", "no instance key is bound, and a notice is never published without its signed level") };
    /* END DEC-49 REGION is-notice-caller */
    return { pid, member, slug };
  }

  /* R1's field refusals: wording, body, matter, handoff; `since` and its bounds (R27). */
  #fieldRefusal({ wording, body, matter, handoff, final, since }, pid, todayMs) {
    /* DEC-49 REGION is-notice-fields */
    const opt = (v, max) => v === undefined || v === null || v === "" || oneLine(v, max);
    if (!oneLine(wording, WORDING_MAX) || !opt(body, SUBJECT_MAX) || !opt(matter, SUBJECT_MAX) || !opt(handoff, HANDOFF_MAX)
        || (str(handoff) && final !== "stopped"))
      return refuse("NOTICE_WORDING_MALFORMED", `the wording is one line of 1 to ${WORDING_MAX} characters; a body or matter `
        + `one line of at most ${SUBJECT_MAX}; a handoff one line of at most ${HANDOFF_MAX}, with a stop only`);
    const s = parseDate(since);
    if (s === null) return refuse("NOTICE_SINCE_MALFORMED", "since is a date, YYYY-MM-DD");
    const created = this.#createdDate(pid);
    if (created && since < created)
      return refuse("NOTICE_SINCE_BEFORE_PROJECT", `the project was created on ${created}`, { project_created: created });
    if (s > todayMs) return refuse("NOTICE_SINCE_IN_FUTURE", `since is later than today (${dateOf(todayMs)})`);
    /* END DEC-49 REGION is-notice-fields */
    return null;
  }

  /* R1's last refusal and R6, R11: a first revision while a notice is open; a change to a notice that is not the
     project's open one; an earlier `since`; a change that changes nothing. Answers the notice's next revision. */
  #noticeRefusal({ notice, final, fields }, pid) {
    /* DEC-49 REGION is-notice-state */
    const nid = str(notice);
    if (!nid) {
      if (final === "stopped") return { refusal: refuse("NOTICE_NOT_OPEN", "a stop names the notice it stops", { notice: null }) };
      const open = this.#openNotice(pid);
      if (open) return { refusal: refuse("NOTICE_ALREADY_OPEN", "the project already has an open notice; a change is a new revision of it",
                                         { notice: open.notice_id }) };
      return { n: 1, previous: null, prior: null, nid: null };
    }
    const n = this.#notice(nid);
    const latest = this.#noticesOfProject(pid).at(-1);
    const rev = n ? this.#latestRevision(nid) : null;
    const status = n ? this.#status(nid) : null;
    if (!n || n.project !== pid || !latest || latest.notice_id !== nid || !rev || rev.status === "stopped"
        || !(status === "open" || (status === "closed" && final === "stopped")))
      return { refusal: refuse("NOTICE_NOT_OPEN", "that notice is not this project's open notice", { notice: nid }) };
    const prior = parse(rev.json) || {};
    if (fields.since < prior.since)
      return { refusal: refuse("NOTICE_SINCE_EARLIER", `the notice already says the work began on ${prior.since}`, { notice: nid }) };
    if (final !== "stopped" && ["wording", "body", "matter", "since", "collaborate"].every((k) => (prior[k] ?? null) === (fields[k] ?? null)))
      return { refusal: refuse("NOTICE_UNCHANGED", "the revision changes nothing the notice says", { notice: nid }) };
    /* END DEC-49 REGION is-notice-state */
    return { n: rev.revision + 1, previous: rev.digest, prior, nid };
  }

  /* R2: the notice id a first revision takes, reserved per project per UTC day so two identical prepares agree. */
  #reserve(pid, todayMs) {
    const day = dateOf(todayMs);
    const r = this.#reserved.get(pid);
    if (r && r.day === day && !this.#notice(r.id)) return r.id;
    /* K1145: drawn in record-core R6's shape and NOT recorded: the draw runs in a transaction rolled back at once,
       which takes the id back out of record-core's ledger (its R7), so prepare writes nothing durable. The post
       records the notice in its own transaction; an id taken meanwhile answers NOTICE_STALE. Record-core offers no
       service to record a chosen id, so the ledger learns it from this module's mint seed at the next boot (R40, R70). */
    let id = null;
    this.record.transact(() => {
      id = this.record.mintOpaqueId(NOTICE_ID_PREFIX, day.slice(0, 4), "", (x) => !!this.#notice(x));
      return { ok: false, reason: "DRAW_ONLY" };
    });
    if (id) this.#reserved.set(pid, { day, id });
    return id;
  }

  /** R1, R2, R3, R6, R11: the revision that would be published, and nothing changed. */
  async prepareNotice({ project = null, notice = null, wording = null, body = null, matter = null, since = null,
                        collaborate = false, handoff = null, final = null, viewer = null, by = null } = {}) {
    const nowMs = this.#nowMs(), todayMs = Math.floor(nowMs / DAY_MS) * DAY_MS;
    const c = await this.#callerRefusal({ project, by, viewer, final, notice }, "noticeprepare");
    if (c.refusal) return c.refusal;
    const fieldsBad = this.#fieldRefusal({ wording, body, matter, handoff, final, since }, c.pid, todayMs);
    if (fieldsBad) return fieldsBad;
    const fields = { wording, body: str(body) ? body : null, matter: str(matter) ? matter : null, since, collaborate: yes(collaborate) };
    const s = this.#noticeRefusal({ notice, final, fields }, c.pid);
    if (s.refusal) return s.refusal;
    const nid = s.nid || this.#reserve(c.pid, todayMs);
    if (!nid) return { ok: false, reason: "MINT_EXHAUSTED", detail: "no free notice id could be drawn; nothing was published" };
    /* R3: exactly these fields; absent ones omitted; never a member's name, handle or id. */
    const revision = {
      format: NOTICE_FORMAT, group: c.slug, notice: nid, revision: s.n, previous: s.previous,
      wording, ...(fields.body ? { body: fields.body } : {}), ...(fields.matter ? { matter: fields.matter } : {}),
      since, posted: dateOf(todayMs), collaborate: fields.collaborate,
      ...(fields.collaborate ? { doorbell: DOORBELL_PATH } : {}),
      status: final === "stopped" ? "stopped" : "open",
      ...(final === "stopped" && str(handoff) ? { handoff } : {}),
      others_welcome: OTHERS_WELCOME,
    };
    const text = canonicalJson(revision);
    const digest = sha256HexSync(text);
    const key = `${c.member}\u0000${digest}`;
    const held = this.#held.get(key);
    if (held && held.expiresMs > nowMs) return held.answer;   /* R2: the same inputs answer byte for byte */
    const expiresMs = nowMs + PREPARED_TTL_MS;
    const caution = !this.#anyPublishedEdition() && this.#openCount(s.nid) >= 2 ? CAUTION_TWO_OPEN : null;
    const answer = { ok: true, revision: text, digest, statement: td.decode(noticeStatement(nid, s.n, digest)),
                     warning: OUTWARD_ACT_WARNING, caution, expires: this.#stamp(expiresMs) };
    this.#held.set(key, { answer, expiresMs, pid: c.pid, nid, n: s.n, revision, text, digest, final, firstRevision: !s.nid });
    return answer;
  }

  /** R4, R5, R6, R11: publishes the revision `by` prepared, with its signature, and the `posted` attestation over it,
   *  in one transaction. */
  async postNotice({ digest = null, signature = null, acknowledged = null, by = null, viewer = null } = {}) {
    const nowMs = this.#nowMs();
    const member = this.#member(by);
    const held = member ? this.#held.get(`${member}\u0000${str(digest)}`) : null;
    /* R4: R1's caller refusals again, at this instant; with nothing prepared, the caller's own. */
    if (!str(by) || isMachineIdentity(by) || !member) {
      /* DEC-49 REGION is-notice-caller */
      return refuse("MACHINE_CANNOT_POST_NOTICE", "a notice is posted by a member signed in as themselves");
      /* END DEC-49 REGION is-notice-caller */
    }
    if (held) {
      const c = await this.#callerRefusal({ project: held.pid, by, viewer, final: held.final, notice: held.firstRevision ? null : held.nid }, "noticepost");
      if (c.refusal) return c.refusal;
      const st = this.#noticeRefusal({ notice: held.firstRevision ? null : held.nid, final: held.final,
                                       fields: held.revision }, held.pid);
      if (st.refusal && st.refusal.reason !== "NOTICE_UNCHANGED") return st.refusal;
    }
    /* DEC-49 REGION is-notice-post */
    if (acknowledged !== true)
      return refuse("NOTICE_WARNING_NOT_ACKNOWLEDGED", "acknowledged must be exactly true: the warning was read");
    if (!held || held.expiresMs <= nowMs)
      return refuse("NOTICE_STALE", "no prepared notice from you with this digest is held, or it has expired: prepare again");
    const keys = (this.#call(() => this.credentials.attestingKeys(), []) || []).filter((k) => k.member_id === member).map((k) => k.key_b64);
    const v = await verifySshsig(String(signature ?? ""), noticeStatement(held.nid, held.n, held.digest), NS_NOTICE, keys);
    if (!v.ok) return refuse("NOTICE_SIGNATURE_REFUSED", `the signature was refused: ${v.reason}`, { verifier: v.reason });
    /* END DEC-49 REGION is-notice-post */
    const at = this.#stamp(nowMs);
    const att = this.#attestation({ nid: held.nid, pid: held.pid, kind: "posted", asOfMs: nowMs,
                                    revisionDigest: held.digest, revisionStatus: held.revision.status });
    const signed = await this.#sign(att.digest);
    if (!signed) return refuse("NOTICE_NO_INSTANCE_KEY", "no instance key is bound, and a notice is never published without its signed level");
    const out = this.record.transact(() => {
      const latest = this.#latestRevision(held.nid);
      if ((latest ? latest.revision : 0) !== held.n - 1 || (held.firstRevision && this.#notice(held.nid)))
        return refuse("NOTICE_STALE", "the notice moved since this was prepared: prepare again");
      if (held.firstRevision) this.sql.exec(`INSERT INTO nn_notices (notice_id, project, opened_at) VALUES (?,?,?)`, held.nid, held.pid, at);
      this.sql.exec(`INSERT INTO nn_revisions (notice_id, revision, digest, json, status, signature, signer_key, published_at)
                     VALUES (?,?,?,?,?,?,?,?)`, held.nid, held.n, held.digest, held.text, held.revision.status,
                    String(signature), v.keyB64, at);
      this.#insertAttestation(held.nid, "posted", held.digest, att, signed, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    this.#held.delete(`${member}\u0000${held.digest}`);
    return { ok: true, notice: held.nid, revision: held.n, published_at: at,
             attestation: { kind: "posted", as_of: att.json.as_of, digest: att.digest, json: att.json } };
  }

  /* ================================================================ the activity level (R7–R10, R28) */

  /* R8: the member acts on the project's records (the project's own bundle and every bundle naming it) between two
     instants: a history entry with a member author (not a machine, actor class, non-member author or AI run) and a
     writer that is not mechanical. */
  #memberActs(pid, fromMs, toMs) {
    const lo = this.#stamp(Math.max(0, fromMs - 1000)), hi = this.#stamp(toMs + 1000);
    return this.#rows(`SELECT m.bundle_id, m.snap_key, m.kind, m.base, m.author, m.created, m.writer, m.operation
                         FROM manifest m JOIN bundles b ON b.bundle_id = m.bundle_id
                        WHERE (b.project = ? OR b.bundle_id = ?) AND m.created >= ? AND m.created <= ?
                        ORDER BY m.created, m.rowid`, pid, pid, lo, hi)
      .filter((r) => { const t = Date.parse(r.created); return Number.isFinite(t) && t >= fromMs && t < toMs; })
      .filter((r) => str(r.author) && !isMachineIdentity(r.author) && r.writer !== "mechanical");
  }

  /* R9: `{level, weeks_counted, window, as_of, method}` over the 13 complete weeks before `as_of`; with the counted
     weeks' labels for the seals (R12). */
  #activity(pid, asOfMs) {
    const end = weekStartOf(asOfMs), start = end - ACTIVITY_WINDOW * WEEK_MS;
    const weeks = new Set(this.#memberActs(pid, start, end).map((r) => weekLabel(weekStartOf(Date.parse(r.created)))));
    return { activity: { level: levelOf(weeks.size), weeks_counted: weeks.size, window: ACTIVITY_WINDOW,
                         as_of: dateOf(asOfMs), method: ACTIVITY_METHOD_VERSION },
             weeks: [...weeks].sort() };
  }

  /** R10: the method, with no credential. */
  activityMethod() { return { ok: true, method: ACTIVITY_METHOD, version: ACTIVITY_METHOD_VERSION }; }

  /* ================================================================ attestations (R12, R13) */

  /* R12: exactly these fields, every one a fact the copy computes. */
  #attestation({ nid, pid, kind, asOfMs, revisionDigest = null, revisionStatus = null, status = null }) {
    const { activity, weeks } = this.#activity(pid, asOfMs);
    const rev = revisionDigest ?? this.#latestRevision(nid)?.digest ?? null;
    const st = status ?? (revisionStatus === "stopped" ? "stopped" : this.#status(nid));
    const cases = this.#call(() => this.#rows(`SELECT c.case_id, p.edition FROM cases c JOIN published_cases p ON p.case_id = c.case_id
                                                 WHERE c.project_id = ? AND p.ratified_at IS NOT NULL ORDER BY c.case_id, p.edition`, pid), [])
      .map((r) => ({ case: r.case_id, edition: Number(r.edition) }));
    const seals = weeks.length ? this.#rows(`SELECT s.week, s.seal, r.token_sha, r.untimestamped FROM nn_week_seals s
                                              LEFT JOIN nn_week_roots r ON r.week = s.week
                                             WHERE s.project = ? AND s.week IN (${weeks.map(() => "?").join(",")}) ORDER BY s.week`, pid, ...weeks)
      .map((r) => ({ week: r.week, seal: r.seal, timestamp_sha: r.token_sha ?? null, untimestamped: !!r.untimestamped })) : [];
    const openings = this.#rows(`SELECT case_id, edition, week FROM nn_openings WHERE project=? ORDER BY case_id, edition, week`, pid)
      .map((r) => ({ case: r.case_id, edition: Number(r.edition), week: r.week }));
    const json = { format: ATTESTATION_FORMAT, group: this.#slug(), notice: nid, as_of: dateOf(asOfMs), kind,
                   revision: rev, status: st, activity, cases, seals, openings };
    return { json, digest: sha256HexSync(canonicalJson(json)) };
  }

  /* R13: signed with the instance key over provenance's statement; null when no key is bound. */
  async #sign(digest) {
    try {
      const r = await this.provenance.instanceSign(instanceStatement(ATTESTATION_FORMAT, digest));
      return r && r.ok ? { signature: r.signature, key_id: r.key_id } : null;
    } catch { return null; }
  }
  #insertAttestation(nid, kind, ref, att, signed, at) {
    this.sql.exec(`INSERT INTO nn_attestations (notice_id, kind, ref, as_of, level, status, json, digest, signature, key_id, published_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)`, nid, kind, ref, att.json.as_of, att.json.activity.level, att.json.status,
                  canonicalJson(att.json), att.digest, signed.signature, signed.key_id, at);
  }
  /* Issues one attestation of `kind` (each once, by `ref`), signed; null when one is held already or no key is bound. */
  async #issue(nid, kind, ref, nowMs, status = null) {
    if (this.#one(`SELECT 1 AS x FROM nn_attestations WHERE notice_id=? AND kind=? AND ref=?`, nid, kind, ref)) return null;
    const n = this.#notice(nid);
    const att = this.#attestation({ nid, pid: n.project, kind, asOfMs: nowMs, status });
    const signed = await this.#sign(att.digest);
    if (!signed) return { missed: true };
    const at = this.#stamp(nowMs);
    const r = this.record.transact(() => {
      if (this.#one(`SELECT 1 AS x FROM nn_attestations WHERE notice_id=? AND kind=? AND ref=?`, nid, kind, ref)) return { ok: true, existed: true };
      this.#insertAttestation(nid, kind, ref, att, signed, at);
      return { ok: true };
    });
    return r && r.existed ? null : { kind, notice: nid, as_of: att.json.as_of, level: att.json.activity.level };
  }

  /* R12, R13: the monthly attestations (each month's first day UTC, while open), the closings and the lapses. */
  async attestTick(now = this.#nowMs()) {
    const nowMs = Number(now);
    this.#observeKeys(nowMs);
    const out = { monthly: [], missed: [], closed: [], lapsed: [], openings: [] };
    const month = monthOf(nowMs), monthStart = monthStartOf(nowMs);
    const checkClosed = this.#closedCheckDay !== dateOf(nowMs);
    for (const n of this.#rows(`SELECT * FROM nn_notices ORDER BY notice_id`)) {
      if (this.#status(n.notice_id) !== "open") continue;
      if (checkClosed && this.#closed(n.project)) {
        const r = await this.#issue(n.notice_id, "closed", "", nowMs, "closed");
        if (r && !r.missed) { out.closed.push(n.notice_id); continue; }
      }
      if (Date.parse(n.opened_at) >= monthStart) continue;
      if (this.#one(`SELECT 1 AS x FROM nn_attestations WHERE notice_id=? AND kind='monthly' AND ref=?`, n.notice_id, month)
          || this.#one(`SELECT 1 AS x FROM nn_misses WHERE notice_id=? AND month=?`, n.notice_id, month)) continue;
      const r = await this.#issue(n.notice_id, "monthly", month, nowMs);
      if (r && r.missed) {
        this.sql.exec(`INSERT OR IGNORE INTO nn_misses (notice_id, month, at) VALUES (?,?,?)`, n.notice_id, month, this.#stamp(nowMs));
        out.missed.push({ notice: n.notice_id, month });
        continue;
      }
      if (!r) continue;
      out.monthly.push(r);
      if (this.#lapses(n.notice_id, month)) {
        const l = await this.#issue(n.notice_id, "lapsed", "", nowMs, "lapsed");
        if (l && !l.missed) out.lapsed.push(n.notice_id);
      }
    }
    if (checkClosed) this.#closedCheckDay = dateOf(nowMs);
    for (const q of this.#rows(`SELECT case_id, edition FROM nn_open_requests WHERE settled_at IS NULL ORDER BY case_id, edition`)) {
      const r = await this.openSeals({ case: q.case_id, edition: q.edition, now: nowMs });
      if (r && r.ok && r.opened.length) out.openings.push({ case: q.case_id, edition: Number(q.edition), weeks: r.opened });
    }
    return { ok: true, ...out };
  }
  /* R12: `Dormant` at this month's monthly and the previous month's, with no revision published between them. */
  #lapses(nid, month) {
    const cur = this.#one(`SELECT * FROM nn_attestations WHERE notice_id=? AND kind='monthly' AND ref=?`, nid, month);
    const d = new Date(`${month}-01T00:00:00Z`);
    const prevMonth = monthOf(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
    const prev = this.#one(`SELECT * FROM nn_attestations WHERE notice_id=? AND kind='monthly' AND ref=?`, nid, prevMonth);
    if (!cur || !prev || cur.level !== "Dormant" || prev.level !== "Dormant") return false;
    return !this.#one(`SELECT 1 AS x FROM nn_revisions WHERE notice_id=? AND published_at > ? AND published_at <= ?`,
                      nid, prev.published_at, cur.published_at);
  }
  /** The monthly and closing tick's due: now when an open notice lacks this month's monthly, or the day's closing
   *  check has not run, or an opening waits to be retried; else null. */
  attestDue(now = this.#nowMs()) {
    try {
      const nowMs = Number(now), month = monthOf(nowMs), monthStart = monthStartOf(nowMs);
      const open = this.#rows(`SELECT * FROM nn_notices`).filter((n) => this.#status(n.notice_id) === "open");
      if (open.length && this.#closedCheckDay !== dateOf(nowMs)) return nowMs;
      if (open.some((n) => Date.parse(n.opened_at) < monthStart
          && !this.#one(`SELECT 1 AS x FROM nn_attestations WHERE notice_id=? AND kind='monthly' AND ref=?`, n.notice_id, month)
          && !this.#one(`SELECT 1 AS x FROM nn_misses WHERE notice_id=? AND month=?`, n.notice_id, month))) return nowMs;
      if (this.#one(`SELECT 1 AS x FROM nn_open_requests WHERE settled_at IS NULL`)) return nowMs;
      return null;
    } catch { return null; }
  }
  /** Its next wake: the next UTC day while a notice is open or an opening waits, else the next month's first day. */
  attestWake(now = this.#nowMs()) {
    try {
      const nowMs = Number(now);
      const busy = this.#rows(`SELECT notice_id FROM nn_notices`).some((n) => this.#status(n.notice_id) === "open")
        || !!this.#one(`SELECT 1 AS x FROM nn_open_requests WHERE settled_at IS NULL`);
      return busy ? Math.floor(nowMs / DAY_MS) * DAY_MS + DAY_MS : nextMonthStart(nowMs);
    } catch { return null; }
  }

  /* ================================================================ the seals (R14–R16) */

  /* The weeks still to seal at `nowMs`: from the week after the last sealed one to the last complete week; on the first
     run, the last complete week alone (weeks before this module shipped cannot be proven). At most eight per tick. */
  #weeksToSeal(nowMs) {
    const lastComplete = weekStartOf(nowMs) - WEEK_MS;
    const done = this.#rows(`SELECT week FROM nn_week_roots`).map((r) => weekStartFromLabel(r.week)).filter((x) => x !== null);
    const from = done.length ? Math.max(...done) + WEEK_MS : lastComplete;
    const out = [];
    for (let s = from; s <= lastComplete && out.length < 8; s += WEEK_MS) out.push(s);
    return out;
  }
  /** R14: due now when a complete week is unsealed; else null. */
  sealDue(now = this.#nowMs()) { try { return this.#weeksToSeal(Number(now)).length ? Number(now) : null; } catch { return null; } }
  /** R14: the next wake, the start of the next week. */
  sealWake(now = this.#nowMs()) { return weekStartOf(Number(now)) + WEEK_MS; }

  /** R14, R15: seals each complete week's member acts for every project not closed, and timestamps the week's root
   *  once. Answers `{ok, sealed: [{week, projects, timestamped}]}`. */
  async sealTick(now = this.#nowMs()) {
    const nowMs = Number(now);
    this.#observeKeys(nowMs);
    const sealed = [];
    for (const start of this.#weeksToSeal(nowMs)) {
      const week = weekLabel(start);
      if (this.#one(`SELECT 1 AS x FROM nn_week_roots WHERE week=?`, week)) continue;
      const projects = [];
      for (const { bundle_id: pid } of this.#rows(`SELECT bundle_id FROM bundles WHERE object_type='project' ORDER BY bundle_id`)) {
        const acts = this.#memberActs(pid, start, start + WEEK_MS);
        if (!acts.length || this.#closed(pid)) continue;
        const leaves = acts.map((m) => ({ bundle: m.bundle_id, digest: this.#digestAfter(m), operation: m.operation || m.kind || "promotion",
                                          at: m.created, salt: randomHex() }));
        const size = slotsFor(leaves.length, SEAL_SLOTS), secret = randomHex();
        const pos = randomPositions(leaves.length, size);
        const levels = treeOf(new Map(leaves.map((l, i) => [pos[i], leafHash(l)])), size, secret);
        projects.push({ pid, leaves, pos, size, secret, seal: rootOf(levels) });
      }
      let root = null, size = null, secret = null, ts = null;
      if (projects.length) {
        size = slotsFor(projects.length, WEEK_SLOTS); secret = randomHex();
        const pos = randomPositions(projects.length, size);
        projects.forEach((p, i) => { p.position = pos[i]; });
        root = rootOf(treeOf(new Map(projects.map((p) => [p.position, weekLeafHash(p.seal)])), size, secret));
        ts = await this.#timestamp(root);
      }
      const at = this.#stamp(nowMs);
      this.record.transact(() => {
        if (this.#one(`SELECT 1 AS x FROM nn_week_roots WHERE week=?`, week)) return { ok: true };
        for (const p of projects) {
          this.sql.exec(`INSERT INTO nn_week_seals (project, week, seal, size, secret, position) VALUES (?,?,?,?,?,?)`,
                        p.pid, week, p.seal, p.size, p.secret, p.position);
          p.leaves.forEach((l, i) => this.sql.exec(`INSERT INTO nn_week_leaves (project, week, position, bundle_id, digest, operation, at, salt)
                                                    VALUES (?,?,?,?,?,?,?,?)`, p.pid, week, p.pos[i], l.bundle, l.digest, l.operation, l.at, l.salt));
        }
        this.sql.exec(`INSERT INTO nn_week_roots (week, root, size, secret, response, token_sha, untimestamped, attempts, sealed_at)
                       VALUES (?,?,?,?,?,?,?,?,?)`, week, root, size, secret, ts && ts.response ? ts.response : null,
                      ts && ts.tokenSha ? ts.tokenSha : null, root && !(ts && ts.response) ? 1 : 0,
                      ts ? JSON.stringify(ts.attempts) : null, at);
        return { ok: true };
      });
      sealed.push({ week, projects: projects.length, timestamped: !!(ts && ts.response) });
    }
    return { ok: true, sealed };
  }
  /* The bundle's digest after the act: the `bundle.md` digest its history entry records (record-core R42), as the
     bundle's own digest is taken (record-core R41), else the first file's, else the entry's base. */
  #digestAfter(m) {
    const e = this.#call(() => this.record.manifestEntry(m.bundle_id, m.snap_key));
    const files = e && Array.isArray(e.files) ? e.files.map((f) => (typeof f === "string" ? { name: f, sha256: null } : f)) : [];
    const f = files.find((x) => x && x.name === "bundle.md" && x.sha256) || files.find((x) => x && x.sha256);
    return (f && f.sha256) || m.base || "";
  }
  /* R15: one RFC 3161 request over the week's root, through the host governor, trying `TSA_ENDPOINTS` in order. Answers
     `{response, tokenSha, attempts}`; `response` null when every authority failed (the week stays counted). */
  async #timestamp(root) {
    const attempts = [];
    for (const endpoint of TSA_ENDPOINTS) {
      const attempted = this.#stamp();
      try {
        const { der } = timestampRequest(root);
        const g = await governedFetch(endpoint, {
          userAgent: `CivicOS/${str(this.env.VERSION) || "0"} (working-on seal)`, governor: this.governor,
          fetch: (u, init) => this.fetch(u, { ...init, method: "POST", body: der,
            headers: { ...(init && init.headers), "content-type": TSA_CONTENT_TYPE, accept: TSA_ACCEPT } }) });
        if (g.refusedByGovernor) { attempts.push({ service: endpoint, attempted, ok: false, note: `governed: ${g.reason}` }); continue; }
        if (!g.res.ok) { attempts.push({ service: endpoint, attempted, ok: false, note: `http ${g.res.status}` }); continue; }
        const bytes = new Uint8Array(await g.res.arrayBuffer());
        const parsed = parseTimestampResponse(bytes, root);
        if (!parsed.ok) { attempts.push({ service: endpoint, attempted, ok: false, note: parsed.reason }); continue; }
        attempts.push({ service: endpoint, attempted, ok: true });
        return { response: b64(bytes), tokenSha: sha256Bytes(parsed.token), attempts };
      } catch (e) {
        attempts.push({ service: endpoint, attempted, ok: false, note: String((e && e.message) || e).slice(0, 120) });
      }
    }
    return { response: null, tokenSha: null, attempts };
  }

  /* ================================================================ openings (R17, R18) */

  /** R17: called by ratification once an edition is committed. Publishes, for each sealed week of the case's project,
   *  the leaves of acts on the bundles the edition publishes (its members and its cited parts), with their salts, paths
   *  and the week's timestamp; once per (case, edition, week). A `published` attestation follows. A week still being
   *  worked is opened once sealed: the request is kept and retried by the attestation tick. */
  async openSeals({ case: caseArg = null, caseId = null, edition = null, now = null } = {}) {
    const id = str(caseArg ?? caseId), ed = Number(edition);
    const nowMs = now != null && Number.isFinite(Number(now)) ? Number(now) : this.#nowMs();
    const owner = id && Number.isInteger(ed) ? this.#call(() => this.#one(
      `SELECT c.project_id FROM cases c JOIN published_cases p ON p.case_id = c.case_id
        WHERE c.case_id=? AND p.edition=? AND p.ratified_at IS NOT NULL`, id, ed)) : null;
    if (!owner) return { ok: false, reason: "NO_PUBLISHED_EDITION", case: id, edition: Number.isInteger(ed) ? ed : null,
                         detail: "no ratified edition of that case is held, so there is nothing to open" };
    const pid = owner.project_id;
    this.sql.exec(`INSERT OR IGNORE INTO nn_open_requests (case_id, edition, project, requested_at) VALUES (?,?,?,?)`,
                  id, ed, pid, this.#stamp(nowMs));
    const bundles = new Set(this.#rows(`SELECT bundle_id FROM published_case_members WHERE case_id=? AND edition=?`, id, ed).map((r) => r.bundle_id));
    const cited = this.#call(() => this.publication.caseCitedParts({ case: id, edition: ed }));
    for (const p of cited && Array.isArray(cited.parts) ? cited.parts : []) bundles.add(p.bundle_id);
    const slug = this.#slug();
    const opened = [];
    for (const s of this.#rows(`SELECT * FROM nn_week_seals WHERE project=? ORDER BY week`, pid)) {
      if (this.#one(`SELECT 1 AS x FROM nn_openings WHERE case_id=? AND edition=? AND week=?`, id, ed, s.week)) continue;
      const all = this.#rows(`SELECT * FROM nn_week_leaves WHERE project=? AND week=? ORDER BY position`, pid, s.week);
      const chosen = all.filter((l) => bundles.has(l.bundle_id));
      if (!chosen.length) continue;
      const leafOf = (l) => ({ bundle: l.bundle_id, digest: l.digest, operation: l.operation, at: l.at, salt: l.salt });
      const levels = treeOf(new Map(all.map((l) => [l.position, leafHash(leafOf(l))])), s.size, s.secret);
      const root = this.#one(`SELECT * FROM nn_week_roots WHERE week=?`, s.week);
      const peers = this.#rows(`SELECT seal, position FROM nn_week_seals WHERE week=?`, s.week);
      const wl = treeOf(new Map(peers.map((p) => [p.position, weekLeafHash(p.seal)])), root.size, root.secret);
      const opening = {
        format: OPENING_FORMAT, method: SEAL_METHOD.version, group: slug, case: id, edition: ed, week: s.week,
        seal: s.seal, size: s.size,
        leaves: chosen.map((l) => ({ leaf: leafOf(l), position: l.position, path: pathOf(levels, l.position) })),
        seal_position: s.position, seal_path: pathOf(wl, s.position), week_root: root.root, week_size: root.size,
        timestamp: root.response ?? null, untimestamped: !!root.untimestamped,
      };
      this.sql.exec(`INSERT OR IGNORE INTO nn_openings (case_id, edition, week, project, json, published_at) VALUES (?,?,?,?,?,?)`,
                    id, ed, s.week, pid, canonicalJson(opening), this.#stamp(nowMs));
      opened.push(s.week);
    }
    /* A `published` attestation follows, on the notice the case carries (R19). */
    const nid = this.noticeReferenceOf(pid);
    let attestation = null, keyMissing = false;
    if (nid) {
      const r = await this.#issue(nid, "published", `${id}#${ed}`, nowMs);
      if (r && r.missed) keyMissing = true; else attestation = r;
    }
    /* Settled once the week holding the request is sealed and the attestation is issued. */
    const req = this.#one(`SELECT requested_at FROM nn_open_requests WHERE case_id=? AND edition=?`, id, ed);
    const reqWeek = weekLabel(weekStartOf(Date.parse(req.requested_at)));
    if (!keyMissing && this.#one(`SELECT 1 AS x FROM nn_week_roots WHERE week=?`, reqWeek))
      this.sql.exec(`UPDATE nn_open_requests SET settled_at=? WHERE case_id=? AND edition=? AND settled_at IS NULL`,
                    this.#stamp(nowMs), id, ed);
    return { ok: true, case: id, edition: ed, project: pid, opened, attestation };
  }

  /** R18: pure; see `seals.mjs`. */
  verifyOpening(opening) { return verifyOpening(opening); }

  /* ================================================================ R19 */

  /** R19: the notice id of the project's open notice, else its most recent, else null. */
  noticeReferenceOf(project) {
    const pid = str(project);
    if (!pid) return null;
    const open = this.#openNotice(pid);
    if (open) return open.notice_id;
    const last = this.#noticesOfProject(pid).at(-1);
    return last ? last.notice_id : null;
  }

  /* ================================================================ public reads (R20, R21) */

  #openingsFor(att) {
    const refs = Array.isArray(att.openings) ? att.openings : [];
    return refs.map((o) => parse(this.#one(`SELECT json FROM nn_openings WHERE case_id=? AND edition=? AND week=?`, o.case, o.edition, o.week)?.json))
      .filter(Boolean);
  }

  /** R20: every revision and attestation ever published, ordered by notice, then first-published instant. */
  noticesPublic({ after = null, limit = null } = {}) {
    const cap = clamp(limit, PUBLIC_LIMIT, PUBLIC_LIMIT_MAX);
    const cur = parse(typeof after === "string" && after ? safeAtob(after) : "null");
    const pos = Array.isArray(cur) && cur.length === 4 ? cur : ["", "", -1, -1];
    const rows = this.#rows(
      `SELECT * FROM (
         SELECT notice_id, published_at, 0 AS tie, revision AS n FROM nn_revisions
         UNION ALL SELECT notice_id, published_at, 1 AS tie, seq AS n FROM nn_attestations)
        WHERE (notice_id, published_at, tie, n) > (?, ?, ?, ?)
        ORDER BY notice_id, published_at, tie, n LIMIT ?`, String(pos[0]), String(pos[1]), Number(pos[2]), Number(pos[3]), cap + 1);
    const truncated = rows.length > cap;
    if (truncated) rows.length = cap;
    const items = rows.map((r) => {
      if (r.tie === 0) {
        const v = this.#one(`SELECT * FROM nn_revisions WHERE notice_id=? AND revision=?`, r.notice_id, r.n);
        return { type: "revision", notice: v.notice_id, revision: v.revision, digest: v.digest, json: parse(v.json),
                 signature: v.signature, published_at: v.published_at };
      }
      const a = this.#one(`SELECT * FROM nn_attestations WHERE seq=?`, r.n);
      const json = parse(a.json);
      return { type: "attestation", notice: a.notice_id, kind: a.kind, digest: a.digest, json,
               signature: { instance_signature: a.signature, key_id: a.key_id }, published_at: a.published_at,
               openings: this.#openingsFor(json) };
    });
    const last = rows.at(-1);
    return { ok: true, items, limit: cap, truncated,
             next: truncated ? btoa(JSON.stringify([last.notice_id, last.published_at, last.tie, last.n])) : null };
  }

  /* R21: a signer key this copy first saw revoked, with the date it saw it (credentials keeps none). */
  #observeKeys(nowMs) {
    try {
      for (const s of this.credentials.signerList().signers || [])
        if (s.status === "revoked")
          this.sql.exec(`INSERT OR IGNORE INTO nn_key_revocations (key_b64, seen_on) VALUES (?,?)`, s.key_b64, dateOf(nowMs));
    } catch { /* a read that fails leaves the dates as they were */ }
  }

  /** R21: the group slug, its owners' keys and the copy's keys, never a name, handle or member id. */
  groupKeysPublic() {
    const signed = new Set([
      ...this.#rows(`SELECT DISTINCT signer_key AS k FROM nn_revisions`).map((r) => r.k),
      ...this.#call(() => this.#rows(`SELECT DISTINCT attestor_key AS k FROM published_bundles`).map((r) => keyB64Of(r.k)), []),
    ]);
    const owners = [];
    for (const s of this.#call(() => this.credentials.signerList().signers, []) || []) {
      const owns = this.#call(() => this.membership.ownsAnyProject(s.member_id), false);
      if (!owns && !signed.has(s.key_b64)) continue;
      const seen = this.#one(`SELECT seen_on FROM nn_key_revocations WHERE key_b64=?`, s.key_b64);
      owners.push({ key: `ssh-ed25519 ${s.key_b64}`, status: s.attests ? "attests" : "revoked",
                    ...(s.attests ? {} : { revoked_on: seen ? seen.seen_on : null }),
                    first_listed: str(s.added) ? String(s.added).slice(0, 10) : null });
    }
    const used = new Set(this.#rows(`SELECT DISTINCT key_id FROM nn_attestations`).map((r) => r.key_id));
    const copy = (this.#call(() => this.provenance.instanceKeys(), []) || []).filter((k) => used.has(k.key_id))
      .map((k) => ({ key_id: k.key_id, public_key: k.public_key, first_used: k.first_used, label: COPY_KEY_LABEL }));
    return { ok: true, group: this.#slug(), owners, copy };
  }

  /* ================================================================ member reads (R22, R23) */

  /** R22: a viewer who can see the project reads its notices, the next monthly and any lapse date, the monthlies missed
   *  for want of a key, and its sealed weeks (never the salts). */
  noticesOf({ project = null, viewer = null } = {}) {
    const pid = str(project);
    if (!pid) return required("notices", "project", "a project id");
    if (!this.#isProject(pid) || this.#call(() => this.membership.sight(pid, viewer)) !== "full") return noSuchProject(pid);
    const nowMs = this.#nowMs();
    const notices = this.#noticesOfProject(pid).map((n) => {
      const status = this.#status(n.notice_id);
      const attestations = this.#rows(`SELECT * FROM nn_attestations WHERE notice_id=? ORDER BY seq`, n.notice_id)
        .map((a) => ({ kind: a.kind, as_of: a.as_of, digest: a.digest, json: parse(a.json), published_at: a.published_at }));
      const monthlies = attestations.filter((a) => a.kind === "monthly");
      const lastLevel = attestations.at(-1);
      const lastMonthly = monthlies.at(-1);
      const revisedSince = lastMonthly && this.#one(`SELECT 1 AS x FROM nn_revisions WHERE notice_id=? AND published_at > ?`,
                                                    n.notice_id, lastMonthly.published_at);
      return {
        notice: n.notice_id, status, opened_at: n.opened_at,
        revisions: this.#revisions(n.notice_id).map((v) => ({ revision: v.revision, digest: v.digest, json: parse(v.json),
                                                              published_at: v.published_at })),
        attestations,
        level: lastLevel ? { level: lastLevel.json.activity.level, as_of: lastLevel.as_of } : null,
        next_monthly: status === "open" ? dateOf(nextMonthStart(nowMs)) : null,
        lapse_date: status === "open" && lastMonthly && lastMonthly.json.activity.level === "Dormant" && !revisedSince
          ? dateOf(nextMonthStart(Date.parse(`${lastMonthly.as_of}T00:00:00Z`))) : null,
        missed_monthlies: this.#rows(`SELECT month, at FROM nn_misses WHERE notice_id=? ORDER BY month`, n.notice_id),
      };
    });
    const sealed_weeks = this.#rows(`SELECT s.week, s.seal, r.untimestamped FROM nn_week_seals s
                                       LEFT JOIN nn_week_roots r ON r.week = s.week WHERE s.project=? ORDER BY s.week`, pid)
      .map((r) => ({ week: r.week, seal: r.seal, timestamped: !r.untimestamped }));
    return { ok: true, project: pid, notices, sealed_weeks, methodVersion: ACTIVITY_METHOD_VERSION };
  }

  /** R23: a directory submission's fields, prefilled, for a published case edition the viewer can see. Sends nothing. */
  directorySubmission({ case: caseArg = null, caseId = null, edition = null, viewer = null } = {}) {
    const id = str(caseArg ?? caseId);
    if (!id) return required("directorysubmission", "case", "a case id");
    const want = edition == null || edition === "" ? null : Number(edition);
    const row = this.#call(() => this.#one(
      `SELECT c.project_id, p.edition, p.scope FROM cases c JOIN published_cases p ON p.case_id = c.case_id
        WHERE c.case_id=? AND p.ratified_at IS NOT NULL ${want === null ? "" : "AND p.edition=?"}
        ORDER BY p.edition DESC LIMIT 1`, id, ...(want === null ? [] : [want])));
    if (!row || this.#call(() => this.membership.sight(row.project_id, viewer)) !== "full")
      return { ok: false, reason: "NO_PUBLISHED_EDITION", case: id, edition: want,
               detail: "no published edition of that case answers here for you; one you cannot see answers the same" };
    const ed = Number(row.edition);
    const doc = this.#call(() => this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NOT NULL`, id, ed));
    const p = doc ? parseFrontmatter(doc.text) : null;
    const heading = p && typeof p.body === "string" ? (/^#\s+(.+)$/m.exec(p.body) || [])[1] : null;
    const title = (p && p.data && str(p.data.title)) || str(heading) || null;
    return { ok: true, group: this.#slug(), case: id, edition: ed,
             link: `?op=publishedcase&caseId=${encodeURIComponent(id)}&edition=${ed}`, title, summary: str(row.scope) || null,
             sends: "nothing: copy these fields, or open them" };
  }
}

const safeAtob = (s) => { try { return atob(s); } catch { return "null"; } };
const sha256Bytes = (bytes) => createSha256().update(bytes).hex();

/* The member acts and reads answer their own refusals with code, check and translation (DEC-49). */
for (const m of ["prepareNotice", "postNotice"]) {
  const fn = NetworkNotices.prototype[m];
  NetworkNotices.prototype[m] = async function (...a) { return withRow(await fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it creates and declares its tables (whole store only, R26) and
 *  registers its notice ids' mint seed (record-core R70). */
export function networkNoticesOf(host, deps) {
  let n = instances.get(host);
  if (!n) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    n = new NetworkNotices({ ...d, host, storage, record, membership, env: d.env ?? host.env ?? null });
    instances.set(host, n);
    n.migrate();
    record.declarePurge("network-notices", NETWORK_NOTICES_TABLES.map((name) => ({ name, keys: [] })));
    record.registerMintSeed("network-notices", NETWORK_NOTICES_MINT_SEED.map((x) => [...x]));
  }
  return n;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function networkNoticesOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return NETWORK_NOTICES_TABLES.includes(name);
}

/** The module's member ops (K3): `by` and `viewer` are the control plane's stamps, read from the query, never the
 *  body. `op-declarations` declares them, `control-plane` routes them and `plane` composes them (L11). */
export function networkNoticesOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const pick = (k) => (b[k] !== undefined && b[k] !== null ? b[k] : url.searchParams.has(k) ? q(k) : null);
  const stamps = { by: q("by") ?? q("author"), viewer: q("viewer") };
  return {
    noticeprepare: () => m.prepareNotice({ project: pick("project"), notice: pick("notice"), wording: pick("wording"),
      body: pick("body"), matter: pick("matter"), since: pick("since"), collaborate: pick("collaborate"),
      handoff: pick("handoff"), final: pick("final"), ...stamps }),
    noticepost: () => m.postNotice({ digest: pick("digest"), signature: pick("signature"),
      acknowledged: b.acknowledged === true || q("acknowledged") === "true" ? true : b.acknowledged ?? q("acknowledged"), ...stamps }),
    notices: () => m.noticesOf({ project: q("project"), viewer: stamps.viewer }),
    directorysubmission: () => m.directorySubmission({ case: q("case"), edition: q("edition"), viewer: stamps.viewer }),
  };
}

/** The credential-free reads served at the group's public address (`public-read` R18): name → `(url) => answer`. */
export function networkNoticesPublicReads(m) {
  return {
    noticespublic: (url) => m.noticesPublic({ after: url.searchParams.get("after"), limit: url.searchParams.get("limit") }),
    groupkeys: () => m.groupKeysPublic(),
    noticemethod: () => m.activityMethod(),
  };
}

/** The scheduler's two consumers (scheduler R5's `working-on-seal` and `working-on-attest`), each `{due, wake, tick}`. */
export function networkNoticesConsumers(m) {
  return {
    "working-on-seal": { due: (now) => m.sealDue(now), wake: (now) => m.sealWake(now), tick: async (now) => ({ workingonseal: await m.sealTick(now) }) },
    "working-on-attest": { due: (now) => m.attestDue(now), wake: (now) => m.attestWake(now), tick: async (now) => ({ workingonattest: await m.attestTick(now) }) },
  };
}
