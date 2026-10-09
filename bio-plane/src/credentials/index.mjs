/* credentials — the credentials a member or the instance acts by: the founder's password and claim, members' passwords
 * and sessions, the signer keys whose signatures the record accepts, the credentials AI work runs under, each
 * member's own Claude account reference, the group's own Anthropic API key (T34, K1755), the short-lived grant an ask
 * or a standing question reads under, the group's own keys for keyed outside services (T33-20); and, from T35 (the
 * security package N680, N703, K1888; K1881, K1934), the sign-in window, sign-out, sessions held as digests, agent
 * credential expiry, a connected subscription as a fact, the count-only security tally with its map and level, and
 * administrators' recovery codes; and, from T36 (T36-7; DEC-172, K1946, K2038), each outside security tool's
 * credentials under R29, the tally's totals for a period, its store-internal route, and the group's setting that keeps
 * its material away from every assistant; and, from T37 (T37-6; DEC-182 (4), K231, N761), a member's own password
 * change, the one keep-away read every gate asks, and a mint that carries no digest refused; and, from T38 (T38-5;
 * N785, N708's remainder, K2200), a member connected through their subscription served by their own sign-in, and the
 * stored subscription token retired; and, from T40 (T40-3; N812, D34, D38, K2352, K2353, K2404), a project's own AI
 * account (an API key, or its only member's sign-in), every account's switch for each kind of use, the cascade that
 * chooses the one account used (the project's, the member's own, the group's), material limits by use for the group
 * and each project, a project key's notice, and the suspended sign-in accounts owners are told of.
 *
 * Requirements: build/requirements/credentials.md (R1–R59; R26 retired). Split from `membership` (K617, K636 BOB-1, K637; T19 layer
 * 2, CREDENTIALS #1): the code is copied from `membership/index.mjs` and `schema.mjs`, without change of meaning, and
 * reads `members` only through membership's services (`memberFacts`, `sessionRights`, `isAdministrator`,
 * `activeAdmins`, `notAnAdmin`), never by SQL. Who the members are, and what each may do, is membership's; this module
 * never decides it. Membership reaches this module's sessions and keys only through its `onRevoked` notice (R16), and
 * reads the founder's claim through the one fact this module registers (R17).
 *
 * SHAPE (K61). `credentialsOf(ctx)` answers the one instance for a Durable Object's storage, over `ctx.storage.sql`,
 * reaching record-core by `recordOf(ctx)` and membership by `membershipOf(ctx)` on the same `ctx`; a test may pass its
 * own as `credentialsOf(ctx, { record, membership })`, and the composition root passes the Worker's seal secret
 * (`sealSecret`, R23, R29) on the first call. Its first construction is this module's start: it registers
 * the revocation listener (R16) and the claim fact (R17) with membership. Every refusal names its reason; no service
 * throws.
 */
import { MACHINE_CLASS_PREFIX, isMachineIdentity, sha256HexSync } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { Membership, membershipOf, notAnAdmin, noSuchMember, noSuchProject, notTheOwner } from "../membership/index.mjs";
import { CREDENTIALS_SCHEMA, CREDENTIALS_ADDITIVE_COLUMNS, CREDENTIALS_TABLES, CREDENTIALS_PROJECT_TABLES } from "./schema.mjs";
export { CREDENTIALS_EXEMPT_TABLES, CREDENTIALS_TABLES, CREDENTIALS_PROJECT_TABLES } from "./schema.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, ACCOUNT_CHECKS,
         KEYED_SERVICE_CHECKS, SIGN_IN_CHECKS } from "./checks.mjs";
export { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS, ACCOUNT_CHECKS,
         KEYED_SERVICE_CHECKS, SIGN_IN_CHECKS } from "./checks.mjs";

/* R22 (K1502, K1547): the kind of a member's own Claude account reference: `apikey` (the member's own API key), held,
   sealed and used for that member alone. (T38; N708's remainder, K2200) `subscription`, a stored `claude setup-token`
   token, is retired: a member's subscription is reached through the hosted Claude Code's own sign-in (R43, R35), never
   a stored token, and a reference of that kind stored before T38 is removed at `migrate`. The group's own key is an API
   key only (R33). */
export const ACCOUNT_KINDS = Object.freeze(["apikey"]);
/* R25, R37 (K1479, K1500): the two switches, a member's reference's and the group key's alike. (T40) Two of R55's. */
export const ACCOUNT_SWITCHES = Object.freeze(["suggestions", "standing"]);
/* R55 (T40; N812, D34, B2): the kinds of use. Every account holds a switch for each, `explore` holding one of
   `EXPLORE_VALUES` (B6, K2350), plus `suggestions` (K1479); `USE_SWITCHES` names them all. An act served by an account
   is of any kind but `explore` (R24, R56). Defaults: ask, draft and run on; standing and suggestions off; explore no. */
export const USE_KINDS = Object.freeze(["ask", "draft", "run", "standing", "explore"]);
export const EXPLORE_VALUES = Object.freeze(["no", "ask", "yes"]);
export const USE_SWITCHES = Object.freeze([...USE_KINDS, "suggestions"]);
const USE_DEFAULTS = Object.freeze({ ask: true, draft: true, run: true, standing: false, explore: "no", suggestions: false });
const ACT_KINDS = Object.freeze(USE_KINDS.filter((k) => k !== "explore"));
/* R27: an ask grant's life, in seconds (it also ends with the member's session). */
export const AI_GRANT_TTL_SECONDS = 900;
/* R28 (K1505 (14); N580, K1603, K1609): the ask's op allow-list, held by the grant's class, each entry the op's name as
   the plane routes it. `answers`' `ASK_SCOPE` (its R1) is held equal to it, both ways, by answers' copy test. Every op
   here is a read; a grant admits no write. `rule` is answers' door to every rule service (its R7). */
export const AI_GRANT_OPS = Object.freeze([
  "calculation", "career", "committedagainstpaid", "dutiesof", "dutyoccurrences", "entity", "entitybyalias",
  "eventsfor", "explore", "frontier", "holderat", "linesof", "meaningrows", "money", "moneyof", "profiles", "relation",
  "resolutions", "rule", "search", "searchfields", "standard", "standardinforce", "standards", "strengthbarof",
  "structureat", "timeline",
]);
/* R29 (K1449): the keyed outside services the group may hold a key for, by name: CourtListener's lookup. (T36; K1946
   T1) Beside them, each outside security tool `file-safety` adds holds its credentials under its own service,
   `security:<tool_id>` (the tool id 1 to 120 letters, digits, `.`, `_` or `-`). */
export const KEYED_SERVICES = Object.freeze(["courtlistener"]);
export const SECURITY_SERVICE_PREFIX = "security:";
const SECURITY_SERVICE_RE = /^security:[A-Za-z0-9._-]{1,120}$/;
/* R51 (DEC-172): the keep-away reason's bounds, in characters. */
export const KEEP_AWAY_REASON = Object.freeze({ min: 1, max: 2000 });

/* R38 (F3; K1881, K1934 (2)): the sign-in window's bounds, BOB's under K1881. Refused attempts are estimated per source
   and per role over any 10 minutes by a two-bucket sliding window (capture R31's form); at `perSource` for the source,
   or `perRole` for the role, the next attempt is paused. `SIGN_IN_STATED` is the bound as the pause states it, composed
   from the same constants. */
export const SIGN_IN_WINDOW = Object.freeze({ perSource: 10, perRole: 10, windowMs: 10 * 60 * 1000 });
export const SIGN_IN_STATED = `at most ${SIGN_IN_WINDOW.perSource} refused attempts from one place, and `
  + `${SIGN_IN_WINDOW.perRole} for one account, in any ${SIGN_IN_WINDOW.windowMs / 60000} minutes`;
/* R42 (F15; K1934 (2)): an agent credential's life in whole days, and its default. */
export const AI_CREDENTIAL_EXPIRY_DAYS = Object.freeze({ min: 1, max: 365, default: 90 });
/* R44 (N703; DEC-165, DEC-166; K1934 (2)): the tally's kinds, and how long its counts are kept. */
export const SECURITY_KINDS = Object.freeze(["signin", "credential", "rate", "handover", "through"]);
export const SECURITY_DAYS = 90;
/* R45 (DEC-166 (1)): the map's note, exactly. */
export const SECURITY_NOTE = "A country is not proof of who is behind an attempt.";
/* R45 (K1881, K1934 (2), (3)): an hour is unusual at `atLeast` or more and more than `times` its usual (more than
   `times` itself when its usual is 0); the usual is the median of the same hour of the day over `usualDays` days. */
export const SECURITY_THRESHOLD = Object.freeze({ atLeast: 10, times: 5, usualDays: 28 });
/* R46 (K1888): how many recovery codes an issue gives. */
export const RECOVERY_CODE_COUNT = 10;

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;

/* A whole-second instant, the record's `…:00Z` spelling. */
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");

/* The founder's role and member id (membership's `ROOT_ADMIN`): the credentials role the founder holds. */
const ROOT = Membership.ROOT_ADMIN;

export class Credentials {
  constructor({ sql, core = null, membership = null, sealSecret = null } = {}) {
    this.sql = sql;
    this.core = core;
    this.membership = membership;
    this.#sealSecret = typeof sealSecret === "string" && sealSecret !== "" ? sealSecret : null;
  }
  #sealSecret;

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ===== START: the seam with membership (K637) =====
   *
   * R16: one listener on membership's revocation notice (its R79). Each time a member becomes `revoked` (a carried
   * removal, membership R8; a revocation, its R20), every session of theirs ends and every signer key registered to
   * them is revoked, named for the act's actor, inside the revoking act (the notice is called after the act's writes,
   * in the caller's transaction). Membership ignores a listener's answer and survives its throw; a session left open
   * by a failure here holds no capability (membership R92 resolves a revoked member to none at every read) and a key
   * left `active` does not attest (R8 asks the member's status), so a failure is never a credential kept.
   * R17: the one fact `claimed()`, read by membership's R64 and R86 through its R94. Registered once; each answer is
   * membership's R81 (a second registration is refused, so `start` is idempotent through `credentialsOf`).
   * R20 (K774): `setPassword` registered as the setter membership's `enroll` calls inside its own act (its R95), so a
   * member's password is set in the one act that enrols them, as before the split, and membership stores none. The
   * setter is asked `{role, password}` and answers R3's `{ok, role}` (a promise: the derivation is asynchronous). Until
   * membership offers R95 (its later work in this layer, K774) there is nothing to register with, and `password` reads
   * null. */
  start() {
    const revoked = this.membership.onRevoked("credentials", (notice) => this.#memberRevoked(notice));
    const claimed = this.membership.registerClaimed("credentials", () => this.claimed());
    const password = typeof this.membership.registerPasswordSetter === "function"
      ? this.membership.registerPasswordSetter(({ role, password } = {}) => this.setPassword({ role, password }))
      : null;
    return { revoked, claimed, password };
  }

  #memberRevoked({ memberId, by = null, at = null } = {}) {
    if (typeof memberId !== "string" || memberId === "") return;
    this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
    this.sql.exec(`DELETE FROM ai_grants WHERE member_id=?`, memberId);   /* R27: their grants end with their sessions */
    /* R16 (T35): their unspent recovery codes are spent (R46) and their connected subscription cleared (R43), in the
       same act. */
    this.sql.exec(`UPDATE recovery_codes SET spent_at=? WHERE role=? AND spent_at IS NULL`, Credentials.#instant(at),
      `member:${memberId}`);
    this.sql.exec(`DELETE FROM subscription_connections WHERE member_id=?`, memberId);
    /* R54 (T40): a project's sign-in account is cleared with its member's sign-in */
    this.sql.exec(`DELETE FROM project_accounts WHERE kind='signin' AND member_id=?`, memberId);
    /* REC-159: the cascade is the revoking act's, so the keys it revokes name its actor. R21: a key it revokes takes
       the act's own time (the notice's `at`) as `status_at`; a key already revoked keeps its own. */
    this.sql.exec(
      `UPDATE signers SET status='revoked', status_by=?,
         status_at=CASE WHEN status<>'revoked' THEN ? ELSE status_at END WHERE member_id=?`,
      by ?? null, Credentials.#instant(at), memberId);
  }

  /* R17: true exactly when the founder's credential is held, which R1's claim writes and a re-armed claim replaces.
     Writes nothing and never throws: a store that cannot be read answers not claimed. */
  claimed() {
    try { return !!this.#one(`SELECT role FROM credentials WHERE role=?`, ROOT); }
    catch { return false; }
  }

  /* This module's tables, at every boot, idempotent: the additive columns an older store lacks, then every table and
     index created if absent, then R18's purge exemption declared. Run by the host inside its boot. */
  migrate() {
    const cols = (t) => [...this.sql.exec(`PRAGMA table_info(${t})`)].map((r) => r.name);
    this.#tx(() => this.#sessionsAsDigests(cols));
    for (const [table, column, decl] of CREDENTIALS_ADDITIVE_COLUMNS) {
      const have = cols(table);
      if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    const bare = CREDENTIALS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    /* R42 (K1934 (5)): a credential minted before expiry was recorded is given 90 days from this migration. Only such a
       row has no `expires_at`, since every mint records one, so a later boot finds none to give. */
    this.sql.exec(`UPDATE ai_credentials SET expires_at=? WHERE expires_at IS NULL`,
      stampSecond(Date.now() + AI_CREDENTIAL_EXPIRY_DAYS.default * DAY_MS));
    this.#tx(() => this.#retiredReferences());
    this.declareTables();
  }

  /* R22, R35 (T38; N708's remainder, K2200): a reference of a kind no longer held (`subscription`, a stored token) is
     never answered, and is removed here as the member's own removal removes one (R22): the row goes, and with it every
     standing question's grant minted for that member (R32). The member's `accountReferenceState` then shows none (R23).
     A later boot finds none to remove. */
  #retiredReferences() {
    const kinds = ACCOUNT_KINDS.map(() => "?").join(",");
    this.sql.exec(`DELETE FROM ai_grants WHERE kind='standing' AND member_id IN
                   (SELECT member_id FROM account_references WHERE kind NOT IN (${kinds}))`, ...ACCOUNT_KINDS);
    this.sql.exec(`DELETE FROM account_references WHERE kind NOT IN (${kinds})`, ...ACCOUNT_KINDS);
  }

  /* R40 (F13): a store whose sessions are held as tokens (the `token` column) is carried over, once, to their SHA-256
     digests: each live row is copied under its token's digest into the new table and the old table is dropped, and
     every ask grant's session (R27) is re-pointed to the same digest, so every session and grant stays live and no
     token stays stored. A store already carried over, or a new one, has nothing to carry. */
  #sessionsAsDigests(cols) {
    const have = cols("sessions");
    if (!have.includes("token") || have.includes("token_sha")) return;
    const held = this.#rows(`SELECT token, role, expires, created FROM sessions`);
    this.sql.exec(`ALTER TABLE sessions RENAME TO sessions_held_as_tokens`);
    this.sql.exec(`CREATE TABLE sessions (token_sha TEXT PRIMARY KEY, role TEXT NOT NULL, expires INTEGER NOT NULL,
                   created TEXT NOT NULL)`);
    for (const r of held)
      this.sql.exec(`INSERT OR IGNORE INTO sessions (token_sha, role, expires, created) VALUES (?,?,?,?)`,
        Credentials.#tokenSha(r.token), r.role, r.expires, r.created);
    this.sql.exec(`DROP TABLE sessions_held_as_tokens`);
    if (cols("ai_grants").includes("session"))
      for (const g of this.#rows(`SELECT grant_sha, session FROM ai_grants WHERE session <> ''`))
        this.sql.exec(`UPDATE ai_grants SET session=? WHERE grant_sha=?`, Credentials.#tokenSha(g.session), g.grant_sha);
  }

  /* One act as one transaction, through record-core's `transact` (its R32) when the store offers it. */
  #tx(fn) { return typeof this.core?.transact === "function" ? this.core.transact(fn) : fn(); }

  /* R18, R30, through record-core's `declareTable` (its R21): every table declared explicitly with its classes, each
     purge-exempt. A refusal is thrown: a purge that silently cleared a credential would revoke authority as a side
     effect of resetting the corpus, and an export that carried a secret would publish it. */
  declareTables() {
    if (this.#declared) return false;
    const answer = this.core.declareTable("credentials",
      [...CREDENTIALS_TABLES, ...CREDENTIALS_PROJECT_TABLES].map((t) => ({ ...t, ...(t.keys ? { keys: [...t.keys] } : {}) })));
    if (answer && answer.ok === false)
      throw new Error(`credentials: record-core refused its table declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }
  #declared = false;

  /* ===== SIGN-IN AND SESSIONS (R1–R5) =====
   *
   * A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap credential rather than the credential. It is
   * spent once, exchanging itself for an operator-chosen password whose hash lives here. Recovery is to overwrite
   * ADMIN_TOKEN in the dashboard, which re-arms the claim. That makes the group's hosting login the root of trust,
   * which is the only thing they reliably still have when a password is lost. */

  static #enc = new TextEncoder();

  static async #derive(password, salt, iterations) {
    const key = await crypto.subtle.importKey(
      "raw", Credentials.#enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: Credentials.#enc.encode(salt), iterations }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /* R40: a session token's digest, the only form a session is held or found by. */
  static #tokenSha(token) { return sha256HexSync(String(token)); }

  /* R41 (F12): two values derived from secrets agree, judged in constant time: both sides as SHA-256 digests (64 hex
     characters each, whatever was given), every character compared, the differences gathered, never a comparison that
     stops at the first difference. `digests: true` when both sides are already SHA-256 digests (R47's code). */
  static #same(a, b, { digests = false } = {}) {
    const x = digests ? String(a ?? "") : sha256HexSync(String(a ?? ""));
    const y = digests ? String(b ?? "") : sha256HexSync(String(b ?? ""));
    let diff = x.length ^ y.length;
    for (let i = 0; i < 64; i++) diff |= (x.charCodeAt(i) | 0) ^ (y.charCodeAt(i) | 0);
    return diff === 0;
  }

  /* REC-41: A FIXED, PUBLISHED, DELIBERATELY WORTHLESS SALT, and the one place a refusal pays what an acceptance pays.
     Collapsing the sign-in refusals into one code and one sentence (R4) is defeated by a stopwatch if the arms do not
     COST the same: an arm that refuses without a password check would answer in microseconds while the wrong-password
     arm runs PBKDF2 at 100,000 iterations, so "is this an active member" would be answerable with a timer. Every such
     arm awaits this first. It equalises the DOMINANT cost and is not a proof of constant time (the lookup and the
     compare still differ by microseconds); it removes the measurement an ordinary caller can make over the internet.
     The salt guards nothing and is never stored; a real credential's salt is minted per password by `setPassword`. */
  static #TIMING_SALT = "bio-login-timing-equaliser";

  static async #payLoginCost(password) {
    await Credentials.#derive(String(password ?? ""), Credentials.#TIMING_SALT, 100000);
  }

  /* R2 (REC-41, closing D-188). `op=bootstrap` is reached by any stranger, and it answers ONE question, the one the
     setup page asks before it can show anything: has this instance been claimed, and is there a live bootstrap
     credential to claim it with. It no longer answers `roles` (every role holding a credential and when its password
     was set: a roster handed to anyone in one unauthenticated request), and nothing consumed it; the credentials table
     is not read here at all, so there is no roster in this answer for a later refactor to leak. `consumedAt` stays: it
     is the instant the INSTANCE was claimed, a fact about this copy of the software that names nobody. */
  bootstrapState(tokenFp = null) {
    const b = this.#one(`SELECT consumed_at, token_fp FROM bootstrap WHERE id=1`);
    const spent = !!(b && b.consumed_at);
    /* A different bootstrap secret than the one that was spent means the operator has rotated it in the dashboard,
       which is the recovery gesture: re-arm rather than lock them out. */
    const rearmed = spent && tokenFp !== null && b.token_fp !== tokenFp;
    return {
      claimed: spent && !rearmed,
      rearmed,
      consumedAt: rearmed ? null : (b?.consumed_at || null),
    };
  }

  /* R1: spending the bootstrap credential. Refused once spent, so a leaked ADMIN_TOKEN cannot silently re-claim a
     running instance; a replaced one (a different fingerprint) re-arms it. R38's window is asked first, under the role
     `admin`; each refused claim counts toward it and toward R44's tally. */
  async claim({ role = ROOT, password, tokenFp = null, source = null, country = null } = {}) {
    const gate = await this.#gate({ role: ROOT, source, country, password });
    if (gate.paused) return gate.paused;
    if (typeof password !== "string" || password.length < 12) {
      this.#refusedAttempt(gate, country);
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    }
    const st = this.bootstrapState(tokenFp);
    if (st.claimed) {
      this.#refusedAttempt(gate, country);
      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };
    }
    await this.setPassword({ role, password });
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,
                     token_fp=excluded.token_fp`, now, tokenFp);
    return { ok: true, role, consumedAt: now };
  }

  /* R3: a salted, derived hash for `role`, replacing any earlier one; never the password. An in-plane call reached
     by no route: `enroll`'s setter (R20) and `recover` (R47). A member's own change is `passwordChange`, below. */
  async setPassword({ role, password, iterations = 100000 } = {}) {
    this.#storePassword(role, await Credentials.#hashFor(password, iterations));
    return { ok: true, role };
  }

  /* R3 (T37; N776, DEC-182 (4)) `op=setpassword`: a signed-in member's or administrator's change of their own
     password. The role is the role of the live session `session` names, `by` and `session` the control plane's
     stamps; a `role` in the body is never read, so no op sets another's password. Refusals in order, each writing
     nothing but its count: a machine credential, the operator's token or no stamp (MACHINE_CANNOT_SET_PASSWORD); no
     live session (NOT_SIGNED_IN, R39's row); R38's window, under the session's role; a new password under 12
     characters; a current password that does not derive the stored hash (CURRENT_PASSWORD_WRONG, R41's comparison),
     the only arm that judges a secret and so the only one counted toward R38's window and R44's tally (`signin`). On
     success, in one act, the password is set as `setPassword` sets it and every OTHER session of the role ends with
     the ask grants minted under it (R39); the presenting session stays. Neither password is logged, stored or
     answered. */
  async passwordChange({ current = null, password = null, by = null, session = null, source = null, country = null } = {}) {
    /* DEC-49 REGION is-password-change-own */
    if (by === null || by === undefined || by === "" || isMachineIdentity(by)) {
      const row = SIGN_IN_CHECKS.MACHINE_CANNOT_SET_PASSWORD;
      return { ok: false, reason: "MACHINE_CANNOT_SET_PASSWORD", code: "MACHINE_CANNOT_SET_PASSWORD", check: row.check,
               translation: row.translation, by: by || null,
               detail: "a member changes their own password from their own signed-in session. A machine credential, "
                     + "the operator's bearer and an unstamped call have no member behind them. Nothing was changed." };
    }
    /* END DEC-49 REGION is-password-change-own */
    const s = this.#liveSession(session);
    if (!s) return Credentials.#notSignedIn();
    const role = s.role;
    const gate = await this.#gate({ role, source, country, password: current });
    if (gate.paused) return gate.paused;
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    const got = c ? await Credentials.#derive(String(current ?? ""), c.salt, c.iterations) : null;
    if (!c) await Credentials.#payLoginCost(current);
    /* DEC-49 REGION is-current-password */
    if (!c || !Credentials.#same(got, c.hash)) {
      this.#refusedAttempt(gate, country);
      const row = SIGN_IN_CHECKS.CURRENT_PASSWORD_WRONG;
      return { ok: false, reason: "CURRENT_PASSWORD_WRONG", code: "CURRENT_PASSWORD_WRONG", check: row.check,
               translation: row.translation,
               detail: "the current password given does not derive the hash stored for this account, so the password "
                     + "was not changed. Nothing was changed." };
    }
    /* END DEC-49 REGION is-current-password */
    const hashed = await Credentials.#hashFor(password);
    /* asked again in the one act that writes, so a session ended meanwhile changes nothing */
    const done = this.#tx(() => {
      const live = this.#liveSession(session);
      if (!live || live.role !== role) return null;
      this.#storePassword(role, hashed);
      const now = Date.now();
      const others = this.#rows(`SELECT token_sha, expires FROM sessions WHERE role=? AND token_sha<>?`, role,
        live.token_sha);
      this.#endSessions(others.map((r) => r.token_sha));
      return { ok: true, role, ended: others.filter((r) => r.expires >= now).length };
    });
    return done ?? Credentials.#notSignedIn();
  }

  /* R3's two halves: the derivation (asynchronous), and the write (synchronous, so R47 can make it inside one act with
     the code it spends). */
  static async #hashFor(password, iterations = 100000) {
    const salt = Credentials.#rand(16);
    return { salt, iterations, hash: await Credentials.#derive(password, salt, iterations) };
  }

  #storePassword(role, { salt, hash, iterations }) {
    this.sql.exec(
      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)
       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,
         iterations=excluded.iterations, updated=excluded.updated`,
      role, salt, hash, iterations, new Date().toISOString());
  }

  /* R4 (REC-39, REC-41): THE WORDS A REFUSED SIGN-IN IS GIVEN, in one place, because one refusal answers every arm: no
     credential under the role, a member who is not active, and a stored credential the password does not derive. Two
     sentences would tell the arms apart at a glance, and telling them apart is what the collapse prevents: with
     `op=bootstrap`'s roster closed, a distinguishable refusal is an unmetered anonymous oracle over who holds a
     credential. D-57's rule shapes the sentence: a refusal states what THE MECHANISM FOUND and never makes a claim about
     who is asking. It says "active" rather than "no such role" because the obvious wording is false for the revoked
     member, whose credential row is still there; and it says that it does not separate the arms, rather than leaving a
     reader to assume it does. Reversing it costs two lines (the arms are still separate below); the honest way back is
     a rate limit plus an authenticated diagnostic, not a louder anonymous refusal. */
  static LOGIN_REFUSAL_DETAIL = {
    SIGN_IN_REFUSED:
      "no session was issued and nothing was written. Either no active credential is held "
      + "under that role — a role that was never registered and one whose membership is no longer active "
      + "are the same answer here — or a credential is stored and the password supplied does not derive "
      + "its stored hash. The password itself is never kept, only a salted derivation of it, so that is "
      + "the only comparison there is to make. Which of those happened, the record does not say: it is one "
      + "answer deliberately, so that a refusal cannot be used to find out which roles hold a credential.",
  };

  static #refused() {
    return { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED };
  }

  /* R4: exchanges a password for a bearer token, so the password does not travel on every later request. A member's
     sign-in is refused unless the member is active (membership R68's standing), so revocation closes the front door as
     well as the sessions; that arm never touches a password, so it pays the same cost first and answers the same
     words, byte for byte. R38's window is asked first; each refusal counts toward it and toward R44's tally. R40: the
     session is stored as its token's digest and the token answered once. R41: the derived hash is compared in
     constant time. */
  async login({ role = ROOT, password, ttlSeconds = 43200, source = null, country = null } = {}) {
    const gate = await this.#gate({ role, source, country, password });
    if (gate.paused) return gate.paused;
    const refuse = () => { this.#refusedAttempt(gate, country); return Credentials.#refused(); };
    if (typeof role === "string" && role.startsWith("member:")) {
      const m = this.#memberFacts(role.slice(7));
      if (!m || m.status !== "active") {
        await Credentials.#payLoginCost(password);
        return refuse();
      }
    }
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    if (!c) {
      await Credentials.#payLoginCost(password);
      return refuse();
    }
    const got = await Credentials.#derive(String(password ?? ""), c.salt, c.iterations);
    if (!Credentials.#same(got, c.hash)) return refuse();
    const token = Credentials.#rand(32);
    const expires = Date.now() + ttlSeconds * 1000;
    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());
    this.sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?,?,?,?)`,
      Credentials.#tokenSha(token), role, expires, new Date().toISOString());
    this.#succeeded(gate);
    return { ok: true, role, token, expires };
  }

  /* R5: what a session is, and what it may do (Membership Architecture v2 §5), resolved HERE at every read through
     membership's `sessionRights` (its R92) rather than cached on the session row: a capability change or a revocation
     takes effect on the next request, not on the next login. R40: found by the digest of the token presented. */
  session(token) {
    if (typeof token !== "string" || token === "") return null;
    this.#settleSoon();
    const sha = Credentials.#tokenSha(token);
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token_sha=?`, sha);
    if (!s) return null;
    if (s.expires < Date.now()) { this.sql.exec(`DELETE FROM sessions WHERE token_sha=?`, sha); return null; }
    const r = this.membership.sessionRights(s.role) || {};
    return { role: s.role, expires: s.expires, capabilities: r.capabilities ?? [], administer: r.administer === true,
             member: r.member ?? null, handle: r.handle ?? null, rootOfTrust: r.rootOfTrust === true };
  }

  /* R39 (F14): the session a token names, while it is live, as its stored row; null for an unknown, expired or ended
     one. */
  #liveSession(token) {
    if (typeof token !== "string" || token === "") return null;
    const s = this.#one(`SELECT token_sha, role, expires FROM sessions WHERE token_sha=?`, Credentials.#tokenSha(token));
    return s && s.expires >= Date.now() ? s : null;
  }

  static #notSignedIn() {
    /* DEC-49 REGION is-session-live */
    const row = SIGN_IN_CHECKS.NOT_SIGNED_IN;
    return { ok: false, reason: "NOT_SIGNED_IN", code: "NOT_SIGNED_IN", check: row.check, translation: row.translation,
             detail: "no live session answers to this token: it ended, it expired, or it never existed. Nothing was "
                   + "ended." };
    /* END DEC-49 REGION is-session-live */
  }

  /* R39: the sessions named end, with every ask grant minted under them (R27); a standing question's grant has no
     session and is not touched (R32). Inside one act. */
  #endSessions(shas) {
    for (const sha of shas) {
      this.sql.exec(`DELETE FROM ai_grants WHERE session=? AND (kind IS NULL OR kind='ask')`, sha);
      this.sql.exec(`DELETE FROM sessions WHERE token_sha=?`, sha);
    }
  }

  /* R39: ends the session `token` names. */
  signOut({ token = null } = {}) {
    const s = this.#liveSession(token);
    if (!s) return Credentials.#notSignedIn();
    this.#tx(() => this.#endSessions([s.token_sha]));
    return { ok: true, ended: 1 };
  }

  /* R39: ends every session held under the role of the session `token` names, that one included; `ended` counts the
     live ones. Another role's sessions are not touched. */
  signOutEverywhere({ token = null } = {}) {
    const s = this.#liveSession(token);
    if (!s) return Credentials.#notSignedIn();
    const now = Date.now();
    const all = this.#rows(`SELECT token_sha, expires FROM sessions WHERE role=?`, s.role);
    this.#tx(() => this.#endSessions(all.map((r) => r.token_sha)));
    return { ok: true, ended: all.filter((r) => r.expires >= now).length };
  }

  /* ===== THE SIGN-IN WINDOW (R38; F3, K1881) =====
   *
   * `claim`, `login`, `recover` and `passwordChange` (R3) share one window, counted per source and per role. A refused attempt is counted in
   * both; at `perSource` estimated for the source, or `perRole` for the role, in any 10 minutes, the next attempt is
   * paused before any password, code or claim is judged. The pause is ONE answer for every arm (whichever bucket is
   * full, a role held or not, a member active or not), at the cost of one password derivation, so neither its words
   * nor its time tell them apart. A pause counts toward neither window (it is R44's `rate`), and a success counts
   * toward neither and empties neither. The window keys a source and a role by a keyed digest (R44's key), so no row
   * of it names an address or a role; a call with no source counts under one shared source of its own. */

  /* R38, R44: this module's key, 256 random bits made once and kept in `security_key`, answered by no op. */
  #securityKeyHex() {
    let r = this.#one(`SELECT key_hex FROM security_key WHERE id=1`);
    if (!r) {
      this.sql.exec(`INSERT OR IGNORE INTO security_key (id, key_hex, created) VALUES (1, ?, ?)`, Credentials.#rand(32),
        stampSecond());
      r = this.#one(`SELECT key_hex FROM security_key WHERE id=1`);
    }
    return r.key_hex;
  }

  /* HMAC-SHA-256 under that key, as hex. */
  async #keyed(text) {
    const hex = this.#securityKeyHex();
    if (this.#hmac?.hex !== hex) {
      const raw = Uint8Array.from(hex.match(/../g), (h) => parseInt(h, 16));
      this.#hmac = { hex, key: await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]) };
    }
    const mac = await crypto.subtle.sign("HMAC", this.#hmac.key, Credentials.#enc.encode(text));
    return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  #hmac = null;

  /* R38's estimate for one bucket at `now`: `prev × (1 − elapsed/W) + cur`. */
  #estimate(kind, key, now) {
    const W = SIGN_IN_WINDOW.windowMs;
    const win = Math.floor(now / W);
    const at = (w) => Number(this.#one(`SELECT count FROM signin_window WHERE kind=? AND key=? AND win=?`, kind, key, w)
      ?.count ?? 0);
    return at(win - 1) * (1 - (now - win * W) / W) + at(win);
  }

  static #paused() {
    /* DEC-49 REGION is-sign-in-window */
    const row = SIGN_IN_CHECKS.SIGN_IN_PAUSED;
    return { ok: false, reason: "SIGN_IN_PAUSED", code: "SIGN_IN_PAUSED", check: row.check, translation: row.translation,
             detail: "too many attempts were refused recently, so this one was not judged: no password, code or claim "
                   + "was checked and nothing changed. Try again later.",
             stated: SIGN_IN_STATED };
    /* END DEC-49 REGION is-sign-in-window */
  }

  /* R38: asked first by `claim` (role `admin`), `login` and `recover`, and by `passwordChange` after its session. Answers `{paused}`, the pause after its cost and
     its count (R44's `rate`), or the gate's keys for the attempt's counts. */
  async #gate({ role, source, country, password }) {
    const roleKey = await this.#keyed(`role\u0000${String(role ?? "")}`);
    const sourceKey = typeof source === "string" && source !== "" ? await this.#keyed(`source\u0000${source}`) : "none";
    const now = Date.now();
    if (this.#estimate("source", sourceKey, now) >= SIGN_IN_WINDOW.perSource
        || this.#estimate("role", roleKey, now) >= SIGN_IN_WINDOW.perRole) {
      await Credentials.#payLoginCost(password);
      this.#tallyOwn("rate", country, roleKey);
      return { paused: Credentials.#paused() };
    }
    return { roleKey, sourceKey };
  }

  /* R38, R44: a refused attempt counts toward both windows and is R44's `signin`, in one act; a count that cannot be
     written is dropped and never changes the answer. */
  #refusedAttempt({ roleKey, sourceKey }, country) {
    try {
      this.#tx(() => {
        const W = SIGN_IN_WINDOW.windowMs;
        const win = Math.floor(Date.now() / W);
        for (const [kind, key] of [["source", sourceKey], ["role", roleKey]])
          this.sql.exec(`INSERT INTO signin_window (kind, key, win, count) VALUES (?,?,?,1)
                         ON CONFLICT(kind, key, win) DO UPDATE SET count=count+1`, kind, key, win);
        /* the previous window is read by the estimate, so only older ones go */
        this.sql.exec(`DELETE FROM signin_window WHERE win < ?`, win - 1);
      });
    } catch { /* dropped */ }
    this.#tallyOwn("signin", country, roleKey);
  }

  /* R44: a sign-in or recovery that succeeded: a `through` when its role was paused in the hour before it; and the
     role's waiting places are dropped, so the counts they held are never placed (DEC-166). */
  #succeeded({ roleKey }) {
    try {
      this.#tx(() => {
        const now = Date.now();
        this.#settle(now);
        if (this.#one(`SELECT seq FROM security_pending WHERE role=? AND kind='rate' AND at > ? LIMIT 1`, roleKey,
                      now - HOUR_MS))
          this.#bump("through", Math.floor(now / HOUR_MS), "");
        this.sql.exec(`DELETE FROM security_pending WHERE role=?`, roleKey);
      });
    } catch { /* dropped */ }
  }

  /* membership R68: a member's standing, or null. Never throws here: an unreadable answer is no member. */
  #memberFacts(memberId) {
    if (typeof memberId !== "string" || memberId === "") return null;
    try { return this.membership.memberFacts(memberId) || null; } catch { return null; }
  }

  /* ===== SIGNING KEYS (R6–R11, R19) ===== */

  /* REC-159 — §4.9's custodial acts are refused before anything is looked up, so a caller with no standing learns
   * nothing about the member or key it named. `by` is the control plane's STAMP. Three shapes, three answers:
   *   - a member's id (a signed-in session): admitted only as one of membership's administrators (its R86), else
   *     NOT_AN_ADMIN through membership's `notAnAdmin` (its R84), exactly as membership R12 admits;
   *   - `class:<cls>`, the operator's bearer (BOB #22's ruling): the plane decides which classes reach here, and the
   *     record names the credential;
   *   - absent, a route with no plane in front of it: nothing is attributed, and the row records `not recorded`.
   * Answers null when the act may proceed. */
  #custodialBar(by, act) {
    if (by === null || by === undefined || by === "") return null;
    if (String(by).startsWith(MACHINE_CLASS_PREFIX)) return null;
    if (this.membership.activeAdmins().includes(by)) return null;
    return notAnAdmin(by, act);
  }

  /* REC-159: the stored actor, or the stated absence of one. */
  static #statusBy(v) { return typeof v === "string" && v !== "" ? v : "not recorded"; }

  /* R21: the instant an act changes a key's status, in `added`'s spelling (ISO 8601 with milliseconds): the act's own
     time when its caller states one (membership's revocation notice, R16), else now. */
  static #instant(at = null) { return typeof at === "string" && at !== "" ? at : new Date().toISOString(); }

  /* R8, R11, R19 (D-158) — ONE PREDICATE, AND IT IS WHAT KEEPS THE ROSTER AND THE GATE FROM DISAGREEING. A key attests
   * exactly when the key is `active` and its member is `active`; `origin` is never read (R19). `signerList` projects it
   * as `attests` and `attestingKeys` filters by it, so the roster can never report a key `op=ratify` would refuse:
   * two copies of the rule and a third reader that never asked it is what once let `op=signerlist` report `active` for
   * a key the gate answered `SIG_UNKNOWN_KEY`. The member's status is membership's fact (its R68), never a join on
   * its table. */
  static #attests(keyStatus, memberStatus) { return keyStatus === "active" && memberStatus === "active"; }

  /* D-158 — THE WRITE HALF: a key is registered only to a member who can attest, so the roster tells the truth and the
   * gate is not relaxed (relaxing it would widen an authority: a signature attesting in the name of a roster slot no
   * person has taken up). TWO CODES, because there are two facts: a member with no handle has never enrolled; one with
   * a handle whose status is not `active` is not standing. The answer carries the stored status and the enrolment fact
   * beside the code. Answers null when the member may attest. */
  #signerMemberBar(memberId) {
    const m = this.#memberFacts(memberId);
    if (!m) return noSuchMember(memberId);   /* membership R121 (N793; K231): the one site that mints NO_SUCH_MEMBER */
    if (m.status === "active") return null;
    const enrolled = typeof m.handle === "string" && m.handle !== "";
    const refusal = (code, detail) => {
      const row = SIGNER_ENROLMENT_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
               memberId, member_status: m.status, enrolled };
    };
    /* DEC-49 REGION is-signer-member-attesting */
    if (!enrolled)
      return refusal("SIGNER_MEMBER_NOT_ENROLLED",
        `${memberId} has not enrolled: status '${m.status}', no handle chosen. op=ratify weighs a `
      + `signature against the member's own standing, so a key registered now would sit on the roster as `
      + `one your group's Civicsmith would refuse. Nothing was written.`);
    return refusal("SIGNER_MEMBER_NOT_ACTIVE",
      `${memberId} is on the roster with status '${m.status}' rather than 'active'. op=ratify weighs a `
    + `signature against the member's own standing and would refuse this one. Nothing was written.`);
    /* END DEC-49 REGION is-signer-member-attesting */
  }

  /* The shape R6 and R9 both take: the base64 field of an ssh-ed25519 public key (the OpenSSH wire bytes, which an
     Ed25519 WebCrypto key exports to as well; `sshsig.mjs` verifies either). One predicate, so the two doors cannot
     disagree about what a key is. */
  static #keyShaped(keyB64) { return typeof keyB64 === "string" && /^AAAA[A-Za-z0-9+/=]+$/.test(keyB64); }

  /* R6: an administrator registers a key for a member. Registering a known key rebinds it and makes it `active`, never
     a second row; `origin` 'admin' and `registered_by` the stamped actor (NULL reads `not recorded`). R21: a new key's
     `status_at` is its registration's instant; a known key's changes only when it was revoked and is re-activated. */
  signerAdd({ keyB64, memberId, comment, by = null } = {}) {
    const barCust = this.#custodialBar(by, "registering a signing key");
    if (barCust) return barCust;
    const row = CREDENTIALS_CHECKS.BAD_KEY;
    /* DEC-49 REGION is-signer-key-shape */
    if (!Credentials.#keyShaped(keyB64))
      return { ok: false, reason: "BAD_KEY", code: "BAD_KEY", check: row.check, translation: row.translation,
               detail: "expected the base64 field of an ssh-ed25519 public key" };
    /* END DEC-49 REGION is-signer-key-shape */
    const barAdd = this.#signerMemberBar(memberId);
    if (barAdd) return barAdd;
    const now = Credentials.#instant();
    this.sql.exec(
      `INSERT INTO signers (key_b64,member_id,comment,status,added,status_by,origin,registered_by,status_at)
       VALUES (?,?,?,'active',?,?,'admin',?,?)
       ON CONFLICT(key_b64) DO UPDATE SET member_id=excluded.member_id,
         comment=excluded.comment, status='active', status_by=excluded.status_by,
         origin='admin', registered_by=excluded.registered_by,
         status_at=CASE WHEN signers.status<>'active' THEN excluded.status_at ELSE signers.status_at END`,
      keyB64, memberId, comment ?? null, now, by || null, by || null, now);
    return { ok: true, keyB64, memberId, by: Credentials.#statusBy(by) };
  }

  /* ===== R9, R10, R19 (N364; DEC-80 item 4, Bob's ruling K509 (2)) — A MEMBER REGISTERS THEIR OWN KEY =====
   *
   * The key is made in the member's own browser, never by another, and each use is confirmed on the device (the
   * interface's to keep; the plane cannot test it). From a signed-in session the member registers its public half
   * here, and it attests exactly as an administrator-registered key does (R19). What keeps it accountable is that every
   * administrator is told (`notified`, membership R86's list at this instant, and the key's row, which the feed's
   * notice reads: N375, K535) and any of them can revoke the key (R7).
   *
   * THE ORDER, each step the requirement's: who is asking (a machine credential, the operator's bearer or no stamp
   * has no member to register for: C-96.17); the key's shape (R6's answer, relayed from R6's own region so C-96.8
   * keeps its one site); the member's standing (R6's bar); and whether ANOTHER member holds the key. A held key is
   * never rebound, and the refusal names no one. A key `by` already holds and that is active answers `existed: true`,
   * unchanged; one `by` holds that was revoked is refused and stays revoked (K535): only an administrator re-activates
   * a key (R7). */
  signerRegisterOwn({ keyB64, comment = null, by = null } = {}) {
    /* DEC-49 REGION is-machine-register-key */
    if (by === null || by === undefined || by === "" || isMachineIdentity(by)) {
      const row = CREDENTIALS_CHECKS.MACHINE_CANNOT_REGISTER_KEY;
      return { ok: false, reason: "MACHINE_CANNOT_REGISTER_KEY", code: "MACHINE_CANNOT_REGISTER_KEY", check: row.check,
               translation: row.translation, by: by || null,
               detail: "a member registers their own signing key from their own signed-in session. A machine "
                     + "credential, the operator's bearer and an unstamped call have no member behind them to hold "
                     + "one; an administrator registers a key for a member with op=signeradd. Nothing was written." };
    }
    /* END DEC-49 REGION is-machine-register-key */
    if (!Credentials.#keyShaped(keyB64)) return this.signerAdd({ keyB64 });   /* R6's BAD_KEY, from its one site */
    const bar = this.#signerMemberBar(by);
    if (bar) return bar;
    const held = this.#one(`SELECT member_id, status, origin, registered_by FROM signers WHERE key_b64=?`, keyB64);
    /* DEC-49 REGION is-signer-key-held */
    if (held && held.member_id !== by) {
      const row = CREDENTIALS_CHECKS.SIGNER_KEY_HELD_BY_ANOTHER;
      return { ok: false, reason: "SIGNER_KEY_HELD_BY_ANOTHER", code: "SIGNER_KEY_HELD_BY_ANOTHER", check: row.check,
               translation: row.translation,
               detail: "this key is registered to another member of this group, and a registered key is never "
                     + "rebound by its own member's act. Nothing was written." };
    }
    /* END DEC-49 REGION is-signer-key-held */
    /* DEC-49 REGION is-signer-key-revoked */
    if (held && held.status !== "active") {
      const row = CREDENTIALS_CHECKS.SIGNER_KEY_REVOKED;
      return { ok: false, reason: "SIGNER_KEY_REVOKED", code: "SIGNER_KEY_REVOKED", check: row.check,
               translation: row.translation,
               detail: "this key of yours was revoked, and a revoked key is re-activated only by an administrator "
                     + "(op=signerset), so that a revocation stands. Nothing was written." };
    }
    /* END DEC-49 REGION is-signer-key-revoked */
    if (!held) {
      const now = Credentials.#instant();   /* R21: a new key's status_at is its registration's instant */
      this.sql.exec(
        `INSERT INTO signers (key_b64,member_id,comment,status,added,status_by,origin,registered_by,status_at)
         VALUES (?,?,?,'active',?,?,'self',?,?)`, keyB64, by, comment ?? null, now, by, by, now);
    }
    return { ok: true, keyB64, memberId: by, status: "active",
             origin: held ? (held.origin === "self" ? "self" : "admin") : "self",
             registered_by: held ? Credentials.#statusBy(held.registered_by) : by, existed: !!held,
             notified: this.membership.activeAdmins(),
             detail: held ? "this key is already registered to you and active; nothing was written. Every administrator "
                          + "is told of the registration, and any of them can revoke the key."
                          : "registered to you, and it attests as any registered key does. Every administrator is told "
                          + "of the registration, and any of them can revoke the key." };
  }

  /* R10: a member revokes their own key, never refused for a key they hold, whatever its state or theirs (revoking
     narrows a claim, D-158). A key they do not hold answers NO_SUCH_KEY exactly as `signerSet` answers a key no one
     holds, so the answer never says whether a key is registered to somebody else. */
  signerRevokeOwn({ keyB64, by = null } = {}) {
    const row = typeof keyB64 === "string" && typeof by === "string" && by !== ""
      ? this.#one(`SELECT status FROM signers WHERE key_b64=? AND member_id=?`, keyB64, by) : null;
    if (!row) return { ok: false, reason: "NO_SUCH_KEY" };
    const already = row.status === "revoked";
    if (!already)   /* R21: a real change, so status_at moves; revoking twice leaves it */
      this.sql.exec(`UPDATE signers SET status='revoked', status_by=?, status_at=? WHERE key_b64=?`,
        by, Credentials.#instant(), keyB64);
    return { ok: true, keyB64, status: "revoked", by, already };
  }

  /* R8 (D-158) — THE ROSTER SAYS WHICH STATE EACH KEY IS ACTUALLY IN. `status` is the administrator's own switch on
   * the key; `member_status` is the stored fact underneath (membership's, R68), and `attests` is whether `op=ratify`
   * would accept a signature from this key now, from the one predicate. A key whose member is gone is REPORTED, not
   * dropped, and `attests_why` names a stored fact in every branch; its last branch, `undetermined`, is unreachable
   * while the predicate is what it is, and kept so a derived reason never quietly guesses. */
  signerList() {
    const facts = new Map();
    const statusOf = (id) => {
      if (!facts.has(id)) facts.set(id, this.#memberFacts(id)?.status ?? null);
      return facts.get(id);
    };
    return { signers: this.#rows(
      `SELECT key_b64, member_id, comment, status, added, status_by, origin, registered_by, status_at
         FROM signers ORDER BY added, key_b64`).map((r) => {
        const memberStatus = statusOf(r.member_id);
        const attests = Credentials.#attests(r.status, memberStatus);
        return {
          key_b64: r.key_b64, member_id: r.member_id, comment: r.comment, status: r.status, added: r.added,
          status_by: Credentials.#statusBy(r.status_by),   /* REC-159 */
          /* R21: when the status last changed; null for a key registered before the column (not recorded). */
          status_at: typeof r.status_at === "string" && r.status_at !== "" ? r.status_at : null,
          /* R6 was the only door before R9, so a row with no recorded origin is an administrator's. */
          origin: r.origin === "self" ? "self" : "admin",
          registered_by: Credentials.#statusBy(r.registered_by),
          member_status: memberStatus,
          attests,
          attests_why: attests ? null
            : r.status !== "active" ? "key_revoked"
            : memberStatus === null ? "member_absent"
            : memberStatus !== "active" ? `member_${memberStatus}`
            : "undetermined",
        };
      }) };
  }

  /* R7: an administrator sets a key's status. Only ACTIVATION is barred as R6 bars the owning member, because
     membership's revocation revokes the member's keys (R16) and this would otherwise undo it one call later; revoking
     narrows a claim and is never refused. R21: `status_at` moves only when the status set differs from the key's. */
  signerSet({ keyB64, status, by = null } = {}) {
    const barCust = this.#custodialBar(by, "setting a signing key's status");
    if (barCust) return barCust;
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const row = this.#one(`SELECT key_b64, member_id FROM signers WHERE key_b64=?`, keyB64);
    if (!row) return { ok: false, reason: "NO_SUCH_KEY" };
    if (status === "active") {
      const barSet = this.#signerMemberBar(row.member_id);
      if (barSet) return barSet;
    }
    this.sql.exec(
      `UPDATE signers SET status=?, status_by=?, status_at=CASE WHEN status<>? THEN ? ELSE status_at END
       WHERE key_b64=?`, status, by || null, status, Credentials.#instant(), keyB64);
    return { ok: true, keyB64, status, by: Credentials.#statusBy(by) };
  }

  /* R11: the signer keys that attest, by R8's one predicate: the set the ratification gate accepts, for every reader
     that splices it (`signerList`, the gate's facts, a case's document facts). */
  attestingKeys() {
    const facts = new Map();
    const statusOf = (id) => {
      if (!facts.has(id)) facts.set(id, this.#memberFacts(id)?.status ?? null);
      return facts.get(id);
    };
    return this.#rows(`SELECT key_b64, member_id, status FROM signers ORDER BY added, key_b64`)
      .filter((r) => Credentials.#attests(r.status, statusOf(r.member_id)))
      .map((r) => ({ key_b64: r.key_b64, member_id: r.member_id }));
  }

  /* ===== AI CREDENTIALS (R12–R15) =====
   *
   * PL-11 / IS-5 / D-199 — THE `ai` CREDENTIAL, AND WHY ITS SCOPE IS A ROW. What an AI credential may reach must be
   * amendable only as an authored, dated, on-the-record act (D-199 (2), DEC-17's reasoning), so this class is not a
   * binding: a presented credential resolves against a row naming the member who minted it and when, and widening it
   * is another row with another name against it. THE VALUE NEVER ARRIVES HERE: the control plane generates the secret,
   * hashes it, hands this module the HASH, and returns the value to the minting member once. */

  /* R12–R14: a MEMBER act (D-199 (3)), and the record says who, when, for whom and what for (D-199 (4)). `writes` and
     `confinedTo` arrive already judged at the mint edge (the control plane's ops table and namespaces are the only
     things that know); what this method judges is what the RECORD must say. */
  aiCredentialMint({ who = null, tokenId = null, secretSha = null, principalKind = null,
                     principalMember = null, taskScope = null, writes = [], note = null,
                     confinedTo = null, at = null, expiresInDays = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = AI_CREDENTIAL_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check,
               translation: row.translation, detail, ...(extra || {}) };
    };
    const now = at || stampSecond();
    const id = String(tokenId ?? "").trim();
    const kind = String(principalKind ?? "").trim().toLowerCase();

    /* DEC-49 REGION is-ai-credential-mint
     *
     * D-199 (3) FIRST, before any shape question: a caller who may not mint at all is told that, rather than being
     * walked through the shape of a credential they were never going to get. Every code is a string literal at its
     * site. */
    if (!who || isMachineIdentity(who))
      return refusal("AI_CREDENTIAL_MINT_NOT_A_MEMBER",
        who ? `'${String(who).slice(0, 60)}' is a machine identity, and minting an AI credential is a `
              + `MEMBER act, never an AI act (D-199 (3)): if an agent can request a broader token, the `
              + `scoping is theatre. This is REC-46's ONE predicate, so it catches token:ai without `
              + `knowing that class exists.`
            : "no member is named on this act. An authority granted by nobody is an authority nobody "
              + "can be asked about afterwards.",
        { who: who || null });

    /* R14 (C-29.11): a member-scoped credential acts for the member who minted it, and for nobody else. */
    const minter = String(who).trim();
    if (kind === "member" && principalMember !== null && principalMember !== undefined
        && String(principalMember).trim() !== "" && String(principalMember).trim() !== minter)
      return refusal("AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER",
        `a member-scoped credential acts for the member who mints it, and '${String(principalMember).slice(0, 60)}' `
        + `is not '${minter.slice(0, 60)}'. A member cannot authorise an agent in another member's name. Nothing `
        + `was written.`, { principalMember: String(principalMember).slice(0, 60) });
    /* R13 (Bob, 2026-09-26): an ORGANISATION-scoped credential acts for the whole group, so only an active
       administrator (the founder included; membership R64) mints one; anyone else is answered through membership's
       R84, its remedy the member-scoped credential open to every member (DEC-83). */
    if (kind === "organisation" && !this.membership.isAdministrator(minter))
      return notAnAdmin(minter, "minting an organisation-wide AI credential",
        { remedy: "A member-scoped AI credential, which acts for you alone, is open to every member." });
    const principal = kind === "organisation" ? `${MACHINE_CLASS_PREFIX}ai`
                    : kind === "member" ? `member:${minter}`
                    : null;
    if (!principal || principal === "member:")
      return refusal("AI_CREDENTIAL_PRINCIPAL_UNSTATED",
        `principalKind was '${kind.slice(0, 40) || "(none)"}'. It is 'organisation' (the key acts for `
        + `the group, nobody individual behind it) or 'member' (attributable to that member). They `
        + `carry different accountability and the record states which, never the token's value.`,
        { principalKind: kind || null });

    if (!id || this.#one(`SELECT token_id FROM ai_credentials WHERE token_id=?`, id))
      return refusal("AI_CREDENTIAL_IDENTITY_TAKEN",
        id ? `'${id.slice(0, 60)}' already names a credential in your group's Civicsmith. Acts cite the `
             + `IDENTITY, so rebinding it would re-attribute work already done.`
           : "pass an identity for this credential: it is the name acts will cite, and a credential "
             + "nothing can name is one nothing can revoke either.",
        { tokenId: id || null });
    /* END DEC-49 REGION is-ai-credential-mint */

    /* R42 (F15; K1881): a whole number of days from 1 to 365, 90 when not given; anything else refused, writing
       nothing. The credential expires that many whole days after it was minted. */
    const days = expiresInDays === null || expiresInDays === undefined ? AI_CREDENTIAL_EXPIRY_DAYS.default : expiresInDays;
    /* DEC-49 REGION is-ai-credential-expiry */
    if (!Number.isInteger(days) || days < AI_CREDENTIAL_EXPIRY_DAYS.min || days > AI_CREDENTIAL_EXPIRY_DAYS.max)
      return refusal("AI_CREDENTIAL_BAD_EXPIRY",
        `expiresInDays is a whole number of days from ${AI_CREDENTIAL_EXPIRY_DAYS.min} to ${AI_CREDENTIAL_EXPIRY_DAYS.max}, `
        + `${AI_CREDENTIAL_EXPIRY_DAYS.default} when it is left out, and this was not one. Nothing was written.`,
        { expiresInDays: typeof expiresInDays === "number" ? expiresInDays : null });
    /* END DEC-49 REGION is-ai-credential-expiry */
    /* R53 (N761; K2129): the digest the control plane hands in the body, 64 lowercase hexadecimal characters, or no
       credential: one recorded without it could never be found by a lookup (R15), so it is refused, writing nothing. */
    /* DEC-49 REGION is-ai-credential-digest */
    if (typeof secretSha !== "string" || !/^[0-9a-f]{64}$/.test(secretSha))
      return refusal("AI_CREDENTIAL_NO_SECRET",
        "no digest of the credential's secret was handed in (64 lowercase hexadecimal characters, made from the value "
        + "generated when the credential was asked for), so there is nothing a lookup could ever find this credential "
        + "by. Nothing was written.");
    /* END DEC-49 REGION is-ai-credential-digest */
    const base = Date.parse(now);
    const expiresAt = stampSecond((Number.isFinite(base) ? base : Date.now()) + days * DAY_MS);

    const declared = (Array.isArray(writes) ? writes : []).map((w) => String(w)).sort();
    /* D-463: it stores 'scratch' or it stores NULL, and nothing between. */
    const confinement = confinedTo === null || confinedTo === undefined ? null : String(confinedTo);
    this.sql.exec(
      `INSERT INTO ai_credentials (token_id, secret_sha, principal_kind, principal, task_scope,
         scope_writes, scope_note, minted_by, minted_at, confined_to, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, secretSha, kind, principal, String(taskScope ?? "investigative"),
      JSON.stringify(declared), String(note ?? ""), String(who), now, confinement, expiresAt);
    return { ok: true, minted: true, credential: this.#aiCredentialPublic(
      this.#one(`SELECT * FROM ai_credentials WHERE token_id=?`, id)) };
  }

  /* R15: also a member act, and the reason is `revoked_by` rather than the risk (C-29.4). Revoking twice answers
     `already: true`, and the row is kept with its `revokedAt`. */
  aiCredentialRevoke({ who = null, tokenId = null, at = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = AI_CREDENTIAL_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check,
               translation: row.translation, detail, ...(extra || {}) };
    };
    const now = at || stampSecond();
    const id = String(tokenId ?? "").trim();

    /* DEC-49 REGION is-ai-credential-revoke */
    if (!who || isMachineIdentity(who))
      return refusal("AI_CREDENTIAL_REVOKE_NOT_A_MEMBER",
        who ? `'${String(who).slice(0, 60)}' is a machine identity. The row carries revoked_by, and a `
              + `machine name there would record the group withdrawing an authority nobody in the `
              + `group decided to withdraw.`
            : "no member is named on this act, and a withdrawal nobody authored is not one.",
        { who: who || null });

    const row = id ? this.#one(`SELECT * FROM ai_credentials WHERE token_id=?`, id) : null;
    if (!row)
      return refusal("AI_CREDENTIAL_UNKNOWN",
        `no credential in your group's Civicsmith is called '${id.slice(0, 60) || "(none)"}'. Nothing was `
        + `withdrawn, and being told so is the point: believing an authority is gone when it is not `
        + `is the worse of the two outcomes.`,
        { tokenId: id || null });
    /* END DEC-49 REGION is-ai-credential-revoke */

    if (row.revoked_at)
      return { ok: true, revoked: true, already: true,
               credential: this.#aiCredentialPublic(row) };
    this.sql.exec(`UPDATE ai_credentials SET revoked_at=?, revoked_by=? WHERE token_id=?`,
                  now, String(who), id);
    return { ok: true, revoked: true, already: false,
             credential: this.#aiCredentialPublic(
               this.#one(`SELECT * FROM ai_credentials WHERE token_id=?`, id)) };
  }

  /* R15: resolve a PRESENTED credential to its record row, by the SHA of the value and never the value. A REVOKED ROW
     IS RETURNED rather than hidden, the fail-closed direction here: the gate must tell a withdrawn credential from an
     unknown string. R42: so is an EXPIRED one, `expired: true`, for the gate to refuse as it refuses a revoked one. */
  aiCredentialLook({ secretSha = null } = {}) {
    const sha = String(secretSha ?? "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(sha)) return { found: false, credential: null };
    const row = this.#one(`SELECT * FROM ai_credentials WHERE secret_sha=?`, sha);
    if (!row) return { found: false, credential: null };
    return { found: true, credential: {
      ...this.#aiCredentialPublic(row),
      /* The gate needs these two as values: the viewer it stamps, and the ops the record declared. */
      principal: row.principal, writes: this.#aiCredentialWrites(row) } };
  }

  /* R15: what the group can see about its own agents, never a value and never a hash (the hash is a verifier, and
     publishing it would make every read of this list an offline guessing target). BOUNDED, AND IT SAYS SO
     (REC-57 / D-225): `limit` is the cap applied (default 200, at most 500), and `truncated` is measured by reading
     one row past it. */
  aiCredentials({ limit = null } = {}) {
    const asked = Number(limit);
    const cap = Number.isFinite(asked) && asked > 0 ? Math.min(500, Math.floor(asked)) : 200;
    const found = this.#rows(
      `SELECT * FROM ai_credentials ORDER BY minted_at, token_id LIMIT ?`, cap + 1);
    const rows = found.slice(0, cap);
    return { count: rows.length, limit: cap, truncated: found.length > cap,
             credentials: rows.map((r) => this.#aiCredentialPublic(r)) };
  }

  #aiCredentialWrites(row) {
    try { const w = JSON.parse(row.scope_writes || "[]"); return Array.isArray(w) ? w.map(String) : []; }
    catch { return []; }
  }

  /* ONE projection, used by the mint, the revoke, the list and the gate's lookup, so no surface is shown a shape the
     others do not agree with, and ONE place decides `secret_sha` is not in it. `confinedTo` is stated as a value, null
     for "not confined", rather than left off: it is the one property a member must read back to know whether an agent
     can touch the record at all (D-463). */
  #aiCredentialPublic(row) {
    if (!row) return null;
    return { tokenId: row.token_id, principalKind: row.principal_kind, principal: row.principal,
             taskScope: row.task_scope, writes: this.#aiCredentialWrites(row),
             note: row.scope_note || null, mintedBy: row.minted_by, mintedAt: row.minted_at,
             revokedAt: row.revoked_at || null, revokedBy: row.revoked_by || null,
             revoked: !!row.revoked_at,
             confinedTo: row.confined_to || null,
             /* R42: when it expires, and whether it has, from `expiresAt` on; never renewed. */
             expiresAt: row.expires_at || null,
             expired: typeof row.expires_at === "string" && row.expires_at !== "" && Date.now() >= Date.parse(row.expires_at) };
  }

  /* ===== EACH MEMBER'S OWN CLAUDE ACCOUNT (R22–R25; T33-20, K1502, K1503) =====
   *
   * A member who wants the assistant may bring their own account: an API key, held only by the member's own act, SEALED at rest under that member (R23), and never shown, listed, logged or exported: no answer
   * below carries the secret or a digest of it, except R24's and R35's, which unseal it for the one call they serve.
   * The group's own API key, set by an administrator, serves members who hold none while it is on (R33–R37; K1755). */

  /* The member an actor or viewer names: `member:<id>` or a bare member id; null for anything else. */
  static #memberOf(x) {
    if (typeof x !== "string") return null;
    const id = x.startsWith("member:") ? x.slice(7) : x;
    return id !== "" ? id : null;
  }

  static #row(table, code, detail, extra) {
    const r = table[code];
    return { ok: false, reason: code, code, check: r.check, translation: r.translation, detail, ...(extra || {}) };
  }

  /* R22: who may act on `member`'s reference, asked first by every act on it, by the grant's mint (R27) and by the
     notice's acknowledgement (R36). Answers null when `by` is that member's own act and the member is active. A
     `member` naming no member of the roster ('organisation', a project, a machine class) is refused as any principal
     but the acting member is: NOT_YOUR_ACCOUNT, or ACCOUNT_MEMBER_NOT_ACTIVE when it names the actor themself (K1756). */
  #accountBar(member, by) {
    const refuse = (code, detail) => Credentials.#row(ACCOUNT_CHECKS, code, detail);
    /* DEC-49 REGION is-account-own-act */
    if (by === null || by === undefined || by === "" || isMachineIdentity(by))
      return refuse("MACHINE_CANNOT_HOLD_ACCOUNT", "a member's Claude account is held only by that member's own act, "
        + "from their own signed-in session; this caller has no member behind it. Nothing was written.");
    const id = Credentials.#memberOf(member);
    if (id === null || Credentials.#memberOf(by) !== id)
      return Credentials.#notYours("a member's Claude account is acted on only by that member; another member, an "
        + "administrator or the founder cannot. Nothing was written.");
    if (this.#memberFacts(id)?.status !== "active")
      return refuse("ACCOUNT_MEMBER_NOT_ACTIVE", "only an active member holds a Claude account reference. Nothing was "
        + "written.");
    /* END DEC-49 REGION is-account-own-act */
    return null;
  }

  /* R22–R24, R27, R35: NOT_YOUR_ACCOUNT, minted here alone; `detail` is the asking act's fixed sentence. */
  static #notYours(detail) {
    /* DEC-49 REGION is-account-theirs */
    return Credentials.#row(ACCOUNT_CHECKS, "NOT_YOUR_ACCOUNT", detail);
    /* END DEC-49 REGION is-account-theirs */
  }

  /* R24, R25, R27, R32, R35: no account serves this member (R35's last branch), or, for R24 and R25 (`own`), the
     member holds no reference of their own; (T40; R55) for `accountUsesSet`, the owner named holds no account
     (`member`: neither a reference nor a sign-in; `project`: the project holds none). */
  #noAccount(member, scope = "served") {
    /* DEC-49 REGION is-account-held */
    return Credentials.#row(ACCOUNT_CHECKS, "NO_ACCOUNT", scope === true || scope === "own"
      ? "this member holds no Claude account reference of their own. Nothing was used or written."
      : scope === "member" ? "this member holds no Claude account of their own: no key and no connected sign-in. Nothing "
        + "was written."
      : scope === "project" ? "this project holds no Claude account. Nothing was written."
      : "no Claude account serves this member: they hold no reference of their own, they are not connected through "
        + "their subscription, and the group's key is not held or not on, so there is no assistant for them. Nothing was "
        + "used.", { member });
    /* END DEC-49 REGION is-account-held */
  }

  /* R22, R33: an empty key or token, refused before anything is sealed. */
  static #noSecret(secret) {
    /* DEC-49 REGION is-secret-given */
    if (typeof secret !== "string" || secret.trim() === "")
      return Credentials.#row(ACCOUNT_CHECKS, "NO_SECRET", "no key or token was given. Nothing was written.");
    return null;
    /* END DEC-49 REGION is-secret-given */
  }

  /* R25, R37: the two switches' names, one list for a member's reference and the group key; (T40) R55's `names`, every
     switch an account holds, for `accountUsesSet`. */
  static #switchName(name, names = ACCOUNT_SWITCHES) {
    /* DEC-49 REGION is-account-switch */
    if (typeof name !== "string" || !names.includes(name))
      return Credentials.#row(ACCOUNT_CHECKS, "UNKNOWN_SWITCH", `the switches are ${names.join(", ")}. `
        + "Nothing was written.", { switch: typeof name === "string" ? name.slice(0, 40) : null });
    return null;
    /* END DEC-49 REGION is-account-switch */
  }

  /* ===== EVERY ACCOUNT'S SWITCHES (R55; T40, N812, D34, B2, B6, K2350) =====
   *
   * Each account (a member's reference, a member's sign-in, a project's account and the group key) holds a switch for
   * each kind of use but `explore`, which holds `no`, `ask` or `yes`, and `suggestions`. R25's and R37's two switches
   * are two of them, stored where they were. A value outside what a switch takes is refused SWITCH_VALUE_INVALID,
   * naming the values; only R33's and R54's on/off of the key itself keep "only `true` is on". */
  static #USE_COLUMN = Object.freeze({ ask: "use_ask", draft: "use_draft", run: "use_run", standing: "standing",
                                       explore: "explore", suggestions: "suggestions" });
  static #USES_COLUMNS = "use_ask, use_draft, use_run, standing, explore, suggestions";

  /* An account's switches from its row, as R55 names them. */
  static #usesOf(r) {
    return { ask: !!r?.use_ask, draft: !!r?.use_draft, run: !!r?.use_run, standing: !!r?.standing,
             explore: EXPLORE_VALUES.includes(r?.explore) ? r.explore : "no", suggestions: !!r?.suggestions };
  }

  /* R55, R57: SWITCH_VALUE_INVALID, minted here alone: `what` and the values it takes. */
  static #valueInvalid(what, values, extra) {
    /* DEC-49 REGION is-switch-value */
    return Credentials.#row(ACCOUNT_CHECKS, "SWITCH_VALUE_INVALID", `${what} takes ${values.map(String).join(", ")}. `
      + "Nothing was changed.", { values: [...values], ...(extra || {}) });
    /* END DEC-49 REGION is-switch-value */
  }

  /* R55: `explore` one of EXPLORE_VALUES; any other switch a boolean. */
  static #switchValueFault(name, on) {
    if (name === "explore") return EXPLORE_VALUES.includes(on) ? null
      : Credentials.#valueInvalid("the explore switch", EXPLORE_VALUES, { switch: name });
    return typeof on === "boolean" ? null : Credentials.#valueInvalid(`the ${name} switch`, [true, false], { switch: name });
  }

  static #stored(name, on) { return name === "explore" ? on : on ? 1 : 0; }

  /* R56: AI_USE_SWITCHED_OFF, minted here alone: the account the cascade chose holds the act's kind off, and the act
     never moves to the next account (Bob, K2352). `whose` is `project`, `own` or `group`. */
  static #switchedOff(whose, use, project = null) {
    /* DEC-49 REGION is-use-switched-on */
    const name = whose === "project" ? "this project's" : whose === "group" ? "your group's" : "your own";
    return Credentials.#row(ACCOUNT_CHECKS, "AI_USE_SWITCHED_OFF", `the account used for this act is ${name} Claude `
      + `account, and its switch for ${use} is off; the act does not move to another account. Nothing was used.`,
      { whose, use, ...(project !== null ? { project } : {}) });
    /* END DEC-49 REGION is-use-switched-on */
  }

  /* R55 `accountUsesSet`: one switch of one account, by its owner, `owner` spelled as ai-use R1's (`group`,
     `project:<id>`, `member:<id>`). The group key's by an active administrator (R33's refusals; it may be set before a key
     is held, as R37's); a project's by one of its owners (R54's refusals), while it holds an account; a member's own by
     that member (R22's refusals), on the account of theirs that would serve them: their reference when held, else their
     sign-in. Refusals in order: the owner's, UNKNOWN_SWITCH, SWITCH_VALUE_INVALID, NO_ACCOUNT, each writing nothing. */
  accountUsesSet({ owner = null, switch: name = null, on, by = null } = {}) {
    const t = this.#usesOwner(owner, by);
    if (t.refusal) return t.refusal;
    const unknown = Credentials.#switchName(name, USE_SWITCHES);
    if (unknown) return unknown;
    const bad = Credentials.#switchValueFault(name, on);
    if (bad) return bad;
    if (t.none) return t.none;
    this.#tx(() => {
      if (t.ensure) t.ensure();
      this.sql.exec(`UPDATE ${t.table} SET ${Credentials.#USE_COLUMN[name]}=? WHERE ${t.where}`, Credentials.#stored(name, on),
        ...t.args);
      if (t.act) t.act(name, on);
    });
    return { ok: true, owner, switch: name, on };
  }

  /* The account `owner` names, as `{table, where, args, ensure?, act?}`, `{refusal}` or `{none}`. */
  #usesOwner(owner, by) {
    const said = (v) => (typeof v === "boolean" ? (v ? "on" : "off") : String(v));
    if (owner === "group") {
      const bar = this.#adminBar(by, "switching the group key's assistant settings");
      return bar ? { refusal: bar } : { table: "group_key", where: "id=1", args: [],
        ensure: () => this.sql.exec(`INSERT INTO group_key (id) VALUES (1) ON CONFLICT(id) DO NOTHING`),
        act: (n, v) => this.#groupKeyAct(`switch:${n}`, said(v), by) };
    }
    if (typeof owner === "string" && owner.startsWith("project:")) {
      const project = owner.slice(8);
      const bar = this.#projectOwnerBar(project, by, "setting a project's assistant settings");
      if (bar) return { refusal: bar };
      if (!this.#projectAccountRow(project)) return { none: this.#noAccount(null, "project") };
      return { table: "project_accounts", where: "project_id=?", args: [project],
        act: (n, v) => this.#projectAct(project, `uses:${n}`, said(v), by) };
    }
    if (typeof owner === "string" && owner.startsWith("member:")) {
      const bar = this.#accountBar(owner, by);
      if (bar) return { refusal: bar };
      const id = Credentials.#memberOf(owner);
      if (this.#reference(id, "member_id")) return { table: "account_references", where: "member_id=?", args: [id] };
      if (this.#connected(id)) return { table: "subscription_connections", where: "member_id=?", args: [id] };
      return { none: this.#noAccount(id, "member") };
    }
    /* no owner this module knows: refused as R22 refuses any principal but the actor */
    return { refusal: this.#accountBar(null, by) };
  }

  /* R23, R29, R34: THE SEAL. AES-256-GCM under a key derived (HKDF-SHA-256) from the Worker's seal secret, the owner as
     salt (`member:<id>`, `group:<service>` or `group-key:anthropic`), so the key is never stored beside the row and no
     other owner's key opens it. The AAD binds the ciphertext to its owner and kind, so a row moved to another owner
     does not open. Answers `{sealed, iv}` (base64), or the refusal when no secret is bound. */
  static #b64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); }
  static #unb64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }

  async #sealKey(owner) {
    const base = await crypto.subtle.importKey("raw", Credentials.#enc.encode(this.#sealSecret), "HKDF", false,
      ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt: Credentials.#enc.encode(owner),
        info: Credentials.#enc.encode("bio-credentials-seal/1") },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  static #sealRefusal(detail) {
    /* DEC-49 REGION is-seal-bound */
    return Credentials.#row(ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE", detail);
    /* END DEC-49 REGION is-seal-bound */
  }

  #seal() {
    return this.#sealSecret === null ? Credentials.#sealRefusal("your group's Civicsmith has no seal secret set, so a "
      + "key cannot be kept sealed or read. Nothing was stored or read.") : null;
  }

  async #encrypt(owner, kind, secret) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: Credentials.#enc.encode(`${owner}|${kind}`) },
      await this.#sealKey(owner), Credentials.#enc.encode(secret));
    return { sealed: Credentials.#b64(new Uint8Array(ct)), iv: Credentials.#b64(iv) };
  }

  /* Null when the row does not open (the seal secret changed): the caller answers ACCOUNT_SEAL_UNAVAILABLE. */
  async #decrypt(owner, kind, sealed, iv) {
    try {
      const pt = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: Credentials.#unb64(iv), additionalData: Credentials.#enc.encode(`${owner}|${kind}`) },
        await this.#sealKey(owner), Credentials.#unb64(sealed));
      return new TextDecoder().decode(pt);
    } catch { return null; }
  }

  /* R22: one reference for `member`, of the one kind (`apikey`; `subscription` refused since T38), replacing any earlier
     one, by that member's own act.
     Answers `{ok, kind, set_at}` and never the secret. A replacement keeps the member's switches (R25); only removal turns them off. */
  async accountReferenceSet({ member = null, kind = null, secret = null, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    /* DEC-49 REGION is-account-kind */
    if (!ACCOUNT_KINDS.includes(kind))
      return Credentials.#row(ACCOUNT_CHECKS, "UNKNOWN_ACCOUNT_KIND", `the kind your group's Civicsmith holds is `
        + `${ACCOUNT_KINDS.join(" and ")}; a Claude subscription is connected through Claude Code's own sign-in, never `
        + `held as a token. Nothing was written.`);
    /* END DEC-49 REGION is-account-kind */
    const empty = Credentials.#noSecret(secret);
    if (empty) return empty;
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const id = Credentials.#memberOf(member);
    const { sealed, iv } = await this.#encrypt(`member:${id}`, kind, secret);
    const setAt = stampSecond();
    this.sql.exec(
      `INSERT INTO account_references (member_id, kind, sealed, iv, set_at) VALUES (?,?,?,?,?)
       ON CONFLICT(member_id) DO UPDATE SET kind=excluded.kind, sealed=excluded.sealed, iv=excluded.iv,
         set_at=excluded.set_at`, id, kind, sealed, iv, setAt);
    return { ok: true, kind, set_at: setAt };
  }

  /* R22, R25, R32: the member removes their reference, which turns both switches off and ends at once every standing
     question's grant minted for them (R32); with none, `removed: false`. */
  accountReferenceRemove({ member = null, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const id = Credentials.#memberOf(member);
    const held = !!this.#one(`SELECT member_id FROM account_references WHERE member_id=?`, id);
    if (held) this.sql.exec(`DELETE FROM account_references WHERE member_id=?`, id);
    this.sql.exec(`DELETE FROM ai_grants WHERE member_id=? AND kind='standing'`, id);
    return { ok: true, removed: held };
  }

  /* R23: what the member may read back of their own reference, to them alone; never the secret. */
  accountReferenceState({ member = null, viewer = null } = {}) {
    const id = Credentials.#memberOf(member);
    if (id === null || typeof member !== "string" || Credentials.#memberOf(viewer) !== id || isMachineIdentity(viewer))
      return Credentials.#notYours("a member's Claude account is seen only by that "
        + "member. Nothing was read.");
    const r = this.#reference(id, `kind, set_at, ${Credentials.#USES_COLUMNS}`);
    const sub = this.#one(`SELECT since, ${Credentials.#USES_COLUMNS} FROM subscription_connections WHERE member_id=?`, id);
    return { ok: true, held: !!r, kind: r ? r.kind : null, set_at: r ? r.set_at : null,
             suggestions: !!(r && r.suggestions), standing: !!(r && r.standing),
             /* R55 (T40): every switch of the reference, null when none is held */
             uses: r ? Credentials.#usesOf(r) : null,
             /* R43: whether the member is connected through their own subscription, and since when; never a login;
                (T40, R55) the sign-in's own switches, null when not connected */
             subscription: { connected: !!sub, since: sub ? sub.since : null, uses: sub ? Credentials.#usesOf(sub) : null } };
  }

  /* ===== A CONNECTED SUBSCRIPTION (R43; N678's share, DEC-156; K1819, K1922) =====
   *
   * A member's Claude subscription is connected through the hosted, unmodified Claude Code's own sign-in, and that
   * sign-in lives where the Claude Code binary wrote it, in the member's own agent-runner container. THIS MODULE HOLDS
   * THE FACT ONLY: that the member is connected, and since when. It never takes the login, the code from Anthropic's
   * page, a token, or a digest of any of them; a call carrying anything but the member is refused, recording nothing.
   * Since T38 (N785, K2200) `accountFor` (R35) reads it: a member with no reference of their own who is connected is
   * served by their own sign-in, `{kind: "signin", level: "member", member}`, which carries no secret. */

  /* R43: an in-plane call, reached by no route and answered to no viewer. */
  subscriptionConnected(args = {}) {
    const carried = args && typeof args === "object" ? Object.keys(args).filter((k) => k !== "member" && args[k] !== undefined) : [];
    /* DEC-49 REGION is-subscription-fact */
    if (carried.length)
      return Credentials.#row(ACCOUNT_CHECKS, "SUBSCRIPTION_LOGIN_REFUSED", "only that the member is connected is "
        + "recorded here; this call carried more than the member, and none of it is kept. Nothing was recorded.");
    /* END DEC-49 REGION is-subscription-fact */
    const member = args?.member ?? null;
    const id = Credentials.#memberOf(member);
    if (id === null || isMachineIdentity(member) || this.#memberFacts(id)?.status !== "active")
      return Credentials.#row(ACCOUNT_CHECKS, "ACCOUNT_MEMBER_NOT_ACTIVE", "only an active member is connected through "
        + "their subscription. Nothing was recorded.");
    this.sql.exec(`INSERT OR IGNORE INTO subscription_connections (member_id, since) VALUES (?,?)`, id, stampSecond());
    return { ok: true, member: id, since: this.#one(`SELECT since FROM subscription_connections WHERE member_id=?`, id).since };
  }

  /* R43, R35: whether the member is connected through their subscription (the fact R35 reads). */
  #connected(id) { return !!this.#one(`SELECT member_id FROM subscription_connections WHERE member_id=?`, id); }

  /* R43: the member's own act (R22's refusals) clears it; so does their revocation (R16). */
  subscriptionDisconnect({ member = null, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const id = Credentials.#memberOf(member);
    const held = !!this.#one(`SELECT member_id FROM subscription_connections WHERE member_id=?`, id);
    this.#tx(() => {
      if (held) this.sql.exec(`DELETE FROM subscription_connections WHERE member_id=?`, id);
      /* R54 (T40): a project's sign-in account is cleared with its member's sign-in */
      this.sql.exec(`DELETE FROM project_accounts WHERE kind='signin' AND member_id=?`, id);
    });
    return { ok: true, disconnected: held };
  }

  /* R24, R35: the act a member's account may serve: their own ask, run or standing question; (T40; R56) any kind of use
     but `explore`, so a `draft` too. Answers the member's id, or null. */
  static #ownAct(member, act) {
    const id = Credentials.#memberOf(member);
    const actKind = act && typeof act === "object" ? act.kind : null;
    if (id === null || !ACT_KINDS.includes(actKind) || Credentials.#memberOf(act.member) !== id
        || isMachineIdentity(act.member)) return null;
    return id;
  }

  /* R22–R25, R35: the member's reference row (the columns asked), only of a kind held (ACCOUNT_KINDS): a retired kind
     stored before its retirement is never answered (T38), whatever a store holds before `migrate` has run. */
  #reference(id, columns) {
    const kinds = ACCOUNT_KINDS.map(() => "?").join(",");
    return this.#one(`SELECT ${columns} FROM account_references WHERE member_id=? AND kind IN (${kinds})`, id, ...ACCOUNT_KINDS);
  }

  /* R24, R35: a member's own reference, unsealed, or a refusal (ACCOUNT_SEAL_UNAVAILABLE); null when none is held. */
  async #ownReference(id) {
    const r = this.#reference(id, "kind, sealed, iv");
    if (!r) return null;
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const secret = await this.#decrypt(`member:${id}`, r.kind, r.sealed, r.iv);
    if (secret === null)
      return Credentials.#sealRefusal("the reference does not open under the seal secret of your group's Civicsmith, "
        + "which has changed; the member connects their account again. Nothing was used.");
    return { ok: true, kind: r.kind, secret };
  }

  /* R24: unseals the member's reference only for that member's own ask, run or standing question, for the one call it
     serves; the caller keeps nothing (agent-model R8). Kept for its callers until they move to `accountFor` (R35). */
  async accountReferenceFor({ member = null, act = null } = {}) {
    /* R35 (DEC-172): no assistant while the group keeps its material away; (T40; R57) for the act's use */
    const away = this.aiKeptAway({ use: act && typeof act === "object" ? act.kind : null });
    if (away) return away;
    const id = Credentials.#ownAct(member, act);
    if (id === null)
      return Credentials.#notYours("a member's Claude account serves only that member's "
        + "own asks, runs and standing questions. Nothing was used.");
    return (await this.#ownReference(id)) ?? this.#noAccount(id, true);
  }

  /* R25: the member's own switches, each off by default; they belong to the reference, so a member with none is
     answered NO_ACCOUNT. They govern only acts their own reference serves; the group key has its own (R37). (T40;
     R55) Two of R55's, set as `accountUsesSet` sets them: a value that is not a boolean is SWITCH_VALUE_INVALID. */
  accountSwitchSet({ member = null, switch: name = null, on, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const unknown = Credentials.#switchName(name);
    if (unknown) return unknown;
    const bad = Credentials.#switchValueFault(name, on);
    if (bad) return bad;
    const id = Credentials.#memberOf(member);
    if (!this.#reference(id, "member_id")) return this.#noAccount(id, true);
    this.sql.exec(`UPDATE account_references SET ${Credentials.#USE_COLUMN[name]}=? WHERE member_id=?`, on ? 1 : 0, id);
    return { ok: true, switch: name, on };
  }

  /* ===== THE GROUP'S API KEY (R33–R37; K1755; DEC-172, K1957) =====
   *
   * DEC-172's two separate choices: whether the group pays (its API key, here), and whether it keeps its material
   * away from every assistant (R51, below); a member may always connect their own account (R22–R25), and K1757's "the
   * group's key only" no longer exists. An active administrator sets, switches and removes the group's one Anthropic
   * API key; it is sealed under the copy (R34), off when first set and off by default, and serves only acts of active
   * members who hold no reference of their own, once each has read its notice (R35, R36). It carries its own two
   * switches, set by an administrator (R37). Every act is recorded with its administrator and instant, never the key
   * (R33). */
  static #GROUP_KEY_OWNER = "group-key:anthropic";

  #groupKeyRow() {
    return this.#one(`SELECT sealed, iv, is_on, set_by, set_at, ${Credentials.#USES_COLUMNS} FROM group_key WHERE id=1`);
  }

  /* Held, and on only while held and switched on. */
  #groupKeyFacts() {
    const r = this.#groupKeyRow();
    const held = !!(r && r.sealed);
    return { held, on: held && !!r.is_on, set_at: held ? r.set_at : null, by: held ? r.set_by : null,
             suggestions: !!(r && r.suggestions), standing: !!(r && r.standing),
             /* R55 (T40): every switch of the group key; before any act on it, the defaults it starts with */
             uses: r ? Credentials.#usesOf(r) : { ...USE_DEFAULTS } };
  }

  #groupKeyAct(act, detail, by) {
    this.sql.exec(`INSERT INTO group_key_acts (act, detail, actor, at) VALUES (?,?,?,?)`, act, detail ?? null,
      Credentials.#memberOf(by), stampSecond());
  }

  /* R33: one key for the group's copy, replacing any earlier one; off when first set (a replacement keeps the switch
     as it was). Answers `{ok, set_at}`, never the key. */
  async groupKeySet({ key = null, by = null } = {}) {
    const bar = this.#adminBar(by, "setting the group's Anthropic API key");
    if (bar) return bar;
    const empty = Credentials.#noSecret(key);
    if (empty) return empty;
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const { sealed, iv } = await this.#encrypt(Credentials.#GROUP_KEY_OWNER, "apikey", key);
    const setAt = stampSecond();
    const first = !this.#groupKeyFacts().held;
    this.sql.exec(
      `INSERT INTO group_key (id, sealed, iv, is_on, set_by, set_at) VALUES (1,?,?,0,?,?)
       ON CONFLICT(id) DO UPDATE SET sealed=excluded.sealed, iv=excluded.iv, set_by=excluded.set_by,
         set_at=excluded.set_at, is_on=CASE WHEN ? THEN 0 ELSE group_key.is_on END`,
      sealed, iv, Credentials.#memberOf(by), setAt, first ? 1 : 0);
    this.#groupKeyAct("set", null, by);
    return { ok: true, set_at: setAt };
  }

  /* R33, R37: removes the key, which switches it off and turns both its switches off; (T40; R37) every R55 switch of
     it; with none, `removed: false`. */
  groupKeyRemove({ by = null } = {}) {
    const bar = this.#adminBar(by, "removing the group's Anthropic API key");
    if (bar) return bar;
    const held = this.#groupKeyFacts().held;
    this.sql.exec(`UPDATE group_key SET sealed=NULL, iv=NULL, is_on=0, set_by=NULL, set_at=NULL, suggestions=0,
                   standing=0, use_ask=0, use_draft=0, use_run=0, explore='no' WHERE id=1`);
    this.#groupKeyAct("remove", null, by);
    return { ok: true, removed: held };
  }

  /* R33: switches the key on or off; only `true` is on, and it is on only while a key is held. */
  groupKeySwitch({ on = false, by = null } = {}) {
    const bar = this.#adminBar(by, "switching the group's Anthropic API key");
    if (bar) return bar;
    const v = on === true ? 1 : 0;
    this.sql.exec(`INSERT INTO group_key (id, is_on) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET is_on=excluded.is_on`, v);
    this.#groupKeyAct("switch", v ? "on" : "off", by);
    return { ok: true, on: this.#groupKeyFacts().on };
  }

  /* R37: the group key's own `suggestions` and `standing`, off by default, set by an active administrator. (T40; R55)
     Two of R55's, set as `accountUsesSet` sets them: a value that is not a boolean is SWITCH_VALUE_INVALID. */
  groupSwitchSet({ switch: name = null, on, by = null } = {}) {
    const bar = this.#adminBar(by, "switching the group key's assistant settings");
    if (bar) return bar;
    const unknown = Credentials.#switchName(name);
    if (unknown) return unknown;
    const bad = Credentials.#switchValueFault(name, on);
    if (bad) return bad;
    const v = on ? 1 : 0;
    this.sql.exec(`INSERT INTO group_key (id, ${name}) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET ${name}=excluded.${name}`, v);
    this.#groupKeyAct(`switch:${name}`, v ? "on" : "off", by);
    return { ok: true, switch: name, on: v === 1 };
  }

  /* R34, R37: an active administrator reads `{held, on, set_at, by, suggestions, standing}` (T40: and `uses`, every R55
     switch); any other active member
     `{on}`; anyone else is refused as a non-administrator. Never the key; writes nothing. */
  groupKeyState({ viewer = null } = {}) {
    const id = Credentials.#memberOf(viewer);
    const f = this.#groupKeyFacts();
    if (id !== null && !isMachineIdentity(viewer) && this.membership.isAdministrator(id)) return { ok: true, ...f };
    if (id !== null && !isMachineIdentity(viewer) && this.#memberFacts(id)?.status === "active")
      return { ok: true, on: f.on };
    return notAnAdmin(viewer ?? null, "reading the group's Anthropic API key");
  }

  /* R37 (N674; K1798): the group key's switches, for `ai-runs`' dispatch of a `level: "group"` account; an in-plane
     read reached by no route and answered to no viewer. Never the key; writes nothing; never throws. */
  groupKeySwitches() {
    try {
      const f = this.#groupKeyFacts();
      return { on: f.on, suggestions: f.suggestions, standing: f.standing };
    } catch { return { on: false, suggestions: false, standing: false }; }
  }

  /* R36: the notice, its words fixed here (D311's disclosure, K1478 (i), K1755). */
  static GROUP_KEY_NOTICE_TEXT = "This group has its own Claude account, an Anthropic API key an administrator set. When "
    + "you ask the assistant and you have not connected an account of your own, your questions, and the material read "
    + "to answer them, go to Anthropic under the group's API account.";

  /* R36: `{due, text}` for a member until their own act records that they have read it; writes nothing. */
  groupKeyNotice({ member = null } = {}) {
    const id = Credentials.#memberOf(member);
    const seen = id !== null && !!this.#one(`SELECT member_id FROM group_key_notices WHERE member_id=?`, id);
    return { ok: true, due: !seen, text: Credentials.GROUP_KEY_NOTICE_TEXT };
  }

  /* R36: the member's own act (R22's refusals), recorded once with its instant; again answers `already: true`. */
  groupKeyNoticeSeen({ member = null, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const id = Credentials.#memberOf(member);
    const already = !!this.#one(`SELECT member_id FROM group_key_notices WHERE member_id=?`, id);
    if (!already) this.sql.exec(`INSERT INTO group_key_notices (member_id, seen_at) VALUES (?,?)`, id, stampSecond());
    return { ok: true, seen: true, already };
  }

  /* R36: GROUP_KEY_NOTICE_DUE, minted here alone. */
  #noticeDue(id) {
    /* DEC-49 REGION is-group-key-notice-seen */
    if (this.#one(`SELECT member_id FROM group_key_notices WHERE member_id=?`, id)) return null;
    return Credentials.#row(ACCOUNT_CHECKS, "GROUP_KEY_NOTICE_DUE", "this member has not yet read the notice that their "
      + "questions go to Anthropic under the group's API account. Nothing was sent.", { member: id });
    /* END DEC-49 REGION is-group-key-notice-seen */
  }

  /* R35's choice without unsealing: which account serves an active member's act now, 'member', 'group' or null, and
     the switches that govern it (R25, R37). (T38; K2275) A member's own sign-in (R43) serves at level 'member' with no
     switch of its own: R25's belong to a reference and R37's to the group key, so both read off for it. */
  #servingAccount(id) {
    const own = this.#reference(id, "suggestions, standing");
    if (own) return { level: "member", suggestions: !!own.suggestions, standing: !!own.standing };
    if (this.#connected(id)) return { level: "member", signin: true, suggestions: false, standing: false };
    const g = this.#groupKeyFacts();
    return g.on ? { level: "group", suggestions: g.suggestions, standing: g.standing } : null;
  }

  /* R35: the account that serves a member's act: their own reference when held, `{kind, level: "member", key}`,
     whatever the group key's state (DEC-172 (1), (5)); else (T38; N785, K2200), when they are connected through their
     subscription (R43), their own sign-in, `{kind: "signin", level: "member", member}`, carrying no secret (agent-runner
     R2 opens that member's sign-in); else the group key when held and on, `{kind: "apikey", level: "group", key}`, for
     an active member who has read its notice (R36); else NO_ACCOUNT. While the group keeps its
     material away (R51), every account is refused AI_KEPT_AWAY first, before any is read. `act` as R24's. Writes
     nothing; called only by the modules that run the assistant. (T40; R56) `act` takes `project`, and the cascade
     begins with that project's account, `{kind: "apikey", level: "project", project, key}` or `{kind: "signin", level:
     "project", project, member}`; the account the cascade chooses is the one used (#resolve). */
  async accountFor({ member = null, act = null } = {}) {
    const away = this.aiKeptAway({ use: act && typeof act === "object" ? act.kind : null });
    if (away) return away;
    const id = Credentials.#ownAct(member, act);
    if (id === null)
      return Credentials.#notYours("a Claude account serves only a member's own asks, runs and standing questions. "
        + "Nothing was used.");
    const r = this.#resolve(id, act.kind, Credentials.#projectOf(act));
    if (r.refusal) return r.refusal;
    if (r.kind === "signin")
      return r.level === "project" ? { ok: true, kind: "signin", level: "project", project: r.project, member: r.member }
                                   : { ok: true, kind: "signin", level: "member", member: id };
    if (r.level === "member") {
      const own = await this.#ownReference(id);
      if (!own) return this.#noAccount(id);
      return own.ok ? { ok: true, kind: own.kind, level: "member", key: own.secret } : own;
    }
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    if (r.level === "project") {
      const key = await this.#decrypt(`project:${r.project}`, "apikey", r.row.sealed, r.row.iv);
      if (key === null)
        return Credentials.#sealRefusal("the project's key does not open under the seal secret of your group's "
          + "Civicsmith, which has changed; one of the project's owners sets it again. Nothing was used.");
      return { ok: true, kind: "apikey", level: "project", project: r.project, key };
    }
    const key = await this.#decrypt(Credentials.#GROUP_KEY_OWNER, "apikey", r.row.sealed, r.row.iv);
    if (key === null)
      return Credentials.#sealRefusal("the group's key does not open under the seal secret of your group's Civicsmith, "
        + "which has changed; an administrator sets it again. Nothing was used.");
    return { ok: true, kind: "apikey", level: "group", key };
  }

  /* R56: the project an act names, or null when it names none. */
  static #projectOf(act) {
    const p = act && typeof act === "object" ? act.project : undefined;
    return p === undefined || p === null ? null : p;
  }

  /* R56 (T40; N812, D38; A3, A4 of K2352, K2353), without unsealing: the account that serves member `id`'s act of kind
     `use`, the first that is held and on of (1) `project`'s account (a sign-in only while it serves, R54), when the act
     names a project the member has joined; (2) the member's own, their reference, else their sign-in; (3) the group
     key. The account chosen is the one used: its switch for `use` off is AI_USE_SWITCHED_OFF, naming whose, and the act
     never moves to the next account. A project the member cannot see is answered as absent, one they see and have not
     joined PROJECT_ACT_NOT_A_PARTICIPANT; the project's material limit (R57) is asked before its account. A key that
     pays for others' acts serves only an active member who has read its notice (R36, R58), asked when `notice`.
     Answers `{refusal}`, or `{level, kind, project?, member?, row?}`. Writes nothing. */
  #resolve(id, use, project, { notice = true } = {}) {
    if (project !== null) {
      const bar = this.#participantBar(project, id, "asking the assistant in a project");
      if (bar) return { refusal: bar };
      const away = this.aiKeptAway({ project, use });
      if (away) return { refusal: away };
      const p = this.#projectAccountRow(project);
      if (p && p.is_on && this.#serves(p)) {
        if (!Credentials.#usesOf(p)[use]) return { refusal: Credentials.#switchedOff("project", use, project) };
        if (p.kind === "signin") return { level: "project", kind: "signin", project, member: p.member_id };
        if (this.#memberFacts(id)?.status !== "active")
          return { refusal: Credentials.#row(ACCOUNT_CHECKS, "ACCOUNT_MEMBER_NOT_ACTIVE", "a project's key serves only "
            + "acts of active members. Nothing was used.") };
        const due = notice ? this.#projectNoticeDue(id, project) : null;
        if (due) return { refusal: due };
        return { level: "project", kind: "apikey", project, row: p };
      }
    }
    const own = this.#reference(id, `kind, ${Credentials.#USES_COLUMNS}`);
    if (own) return Credentials.#usesOf(own)[use] ? { level: "member", kind: own.kind }
                                                    : { refusal: Credentials.#switchedOff("own", use) };
    const sub = this.#one(`SELECT ${Credentials.#USES_COLUMNS} FROM subscription_connections WHERE member_id=?`, id);
    if (sub) return Credentials.#usesOf(sub)[use] ? { level: "member", kind: "signin", member: id }
                                                    : { refusal: Credentials.#switchedOff("own", use) };
    const g = this.#groupKeyRow();
    if (!(g && g.sealed && g.is_on)) return { refusal: this.#noAccount(id) };
    if (!Credentials.#usesOf(g)[use]) return { refusal: Credentials.#switchedOff("group", use) };
    if (this.#memberFacts(id)?.status !== "active")
      return { refusal: Credentials.#row(ACCOUNT_CHECKS, "ACCOUNT_MEMBER_NOT_ACTIVE", "the group's key serves only acts "
        + "of active members. Nothing was used.") };
    const due = notice ? this.#noticeDue(id) : null;
    if (due) return { refusal: due };
    return { level: "group", kind: "apikey", row: g };
  }

  /* ===== KEEPING THE GROUP'S MATERIAL AWAY FROM AI (R51, R52; DEC-172, K1957) =====
   *
   * DEC-172's second choice, separate from whether the group pays: an active administrator may keep the group's
   * material away from every assistant, the group's key and members' own accounts alike, and turns it on only with a
   * reason every member reads, in the administrator's own words. Off by default. Each set is appended with who and
   * when, never replacing an earlier one; the latest is the setting. While it is on, `accountFor` (R35) refuses every
   * account before any is read, so no ask, run or standing question reaches a model, and the grants that serve them
   * (R27, R32) are not minted. */

  /* R52: the latest set, or off before any. Never throws: a setting that cannot be read is answered `on: null`, not
     known, which R35 reads as kept away (a failure never sends material out). */
  aiKeepAwayState() {
    try {
      const r = this.#one(`SELECT is_on, reason, set_by, set_at, uses FROM ai_keep_away ORDER BY seq DESC LIMIT 1`);
      return r ? { on: !!r.is_on, reason: r.reason ?? null, set_by: r.set_by, set_at: r.set_at, uses: Credentials.#usesList(r.uses) }
               : { on: false, reason: null, set_by: null, set_at: null, uses: [...USE_KINDS] };
    } catch { return { on: null, reason: null, set_by: null, set_at: null, uses: null }; }
  }

  /* R57 (T40): the uses a material limit covers, from its stored JSON: every kind when none was named (a limit set
     before T40 covers every use), and, for a value that does not read, every kind (fail closed). */
  static #usesList(json) {
    if (json === null || json === undefined) return [...USE_KINDS];
    try {
      const a = JSON.parse(json);
      return Array.isArray(a) && a.length ? USE_KINDS.filter((k) => a.includes(k)) : [...USE_KINDS];
    } catch { return [...USE_KINDS]; }
  }

  /* R57: a limit covers `use` when it is on and names it; with no `use` asked, whenever it is on ("as now", K2404 (4)). */
  static #covers(limit, use) {
    return limit.on === true && (use === null || use === undefined || (Array.isArray(limit.uses) && limit.uses.includes(use)));
  }

  /* R57: `uses` as set: absent (every use) or a non-empty list of USE_KINDS entries, each once; answers `{json}` to
     store, or `{fault}`, SWITCH_VALUE_INVALID naming the values (K2404 (4)). */
  static #usesToStore(uses) {
    if (uses === null || uses === undefined) return { json: null };
    if (Array.isArray(uses) && uses.length && uses.every((u) => USE_KINDS.includes(u)) && new Set(uses).size === uses.length)
      return { json: JSON.stringify(USE_KINDS.filter((k) => uses.includes(k))) };
    return { fault: Credentials.#valueInvalid("a material limit's uses, a list of the kinds of use it covers,", USE_KINDS) };
  }

  /* R51 (DEC-172), R57: the reason rule a material limit is set under, the group's or a project's: `on: true` needs a
     reason of 1 to 2,000 characters, not blank; a reason given with `on: false` is held to the same bounds.
     AI_KEEP_AWAY_NO_REASON, minted here alone. */
  static #keepAwayReason(turnOn, reason) {
    const given = typeof reason === "string" && reason.trim() !== "";
    const length = typeof reason === "string" ? [...reason].length : 0;
    /* DEC-49 REGION is-keep-away-reason */
    if ((turnOn && !given) || (given && length > KEEP_AWAY_REASON.max) || (reason !== null && reason !== undefined
        && typeof reason !== "string"))
      return Credentials.#row(ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON", `keeping material away from the assistant is `
        + `turned on only with a reason of ${KEEP_AWAY_REASON.min} to ${KEEP_AWAY_REASON.max} characters, which every `
        + `member reads${given ? `; this one has ${length}` : ""}. Nothing was changed.`);
    /* END DEC-49 REGION is-keep-away-reason */
    return null;
  }

  /* R51 (`op=aikeepaway`): an active administrator's act. `on: true` needs a reason of 1 to 2,000 characters, not
     blank; a reason given with `on: false` is kept under the same bounds. Each refusal writes nothing. (T40; R57) It
     takes `uses`, the kinds of use the limit covers (all when absent). */
  aiKeepAwaySet({ on = false, uses = null, reason = null, by = null } = {}) {
    const bar = this.#adminBar(by, "keeping the group's material away from every assistant");
    if (bar) return bar;
    const turnOn = on === true;
    const noReason = Credentials.#keepAwayReason(turnOn, reason);
    if (noReason) return noReason;
    const u = Credentials.#usesToStore(uses);
    if (u.fault) return u.fault;
    const given = typeof reason === "string" && reason.trim() !== "";
    this.sql.exec(`INSERT INTO ai_keep_away (is_on, reason, set_by, set_at, uses) VALUES (?,?,?,?,?)`, turnOn ? 1 : 0,
      given ? reason : null, Credentials.#memberOf(by), stampSecond(), u.json);
    return { ok: true, ...this.aiKeepAwayState() };
  }

  /* R35 (T37; N765, K231): AI_KEPT_AWAY, minted here alone, carrying R52's reason, who and when as `keep_away` (the
     answer's own `reason` is its code); null while the setting is off. An in-plane read reached by no route and
     answered to no viewer: R35, R27 and R32 refuse through it, and every module that gates an assistant on keep-away
     (instance-setup R55, answers, wizard-scripts, store-door) reads it, never a copy of the condition. A setting that
     cannot be read is that refusal, saying so, with the three null (fail closed, K2093). Writes nothing; never
     throws. */
  aiKeptAway({ project = null, use = null } = {}) {
    let st;
    try { st = this.aiKeepAwayState(); } catch { st = { on: null, reason: null, set_by: null, set_at: null }; }
    /* (T40; R57) the group's limit refuses when it covers `use`; then `project`'s, PROJECT_AI_KEPT_AWAY */
    if (st.on === false || (st.on === true && !Credentials.#covers(st, use))) return this.#projectKeptAway(project, use);
    /* DEC-49 REGION is-kept-away */
    return Credentials.#row(ACCOUNT_CHECKS, "AI_KEPT_AWAY", st.on === true
      ? "the group keeps its material away from every assistant, so no account was read or used. Nothing was sent."
      : "whether the group keeps its material away from every assistant could not be read, so no account was read or "
        + "used. Nothing was sent.", { keep_away: { reason: st.reason, set_by: st.set_by, set_at: st.set_at } });
    /* END DEC-49 REGION is-kept-away */
  }

  /* R57: a project's material limit, the latest set, or off before any. Throws when it cannot be read: its caller
     fails closed. */
  #projectLimit(project) {
    const r = this.#one(`SELECT is_on, uses, reason, set_by, set_at FROM project_keep_away WHERE project_id=?
                         ORDER BY seq DESC LIMIT 1`, project);
    return r ? { on: !!r.is_on, uses: Credentials.#usesList(r.uses), reason: r.reason ?? null, set_by: r.set_by, set_at: r.set_at }
             : { on: false, uses: [...USE_KINDS], reason: null, set_by: null, set_at: null };
  }

  /* R57: PROJECT_AI_KEPT_AWAY, minted here alone, with the limit's reason, who and when; null when `project` names
     none or its limit does not cover `use`. A limit that cannot be read is that refusal, saying so (fail closed,
     K2093). */
  #projectKeptAway(project, use) {
    if (project === null || project === undefined) return null;
    let lim;
    try { lim = this.#projectLimit(String(project)); } catch { lim = { on: null, reason: null, set_by: null, set_at: null }; }
    if (lim.on === false || (lim.on === true && !Credentials.#covers(lim, use))) return null;
    /* DEC-49 REGION is-project-kept-away */
    return Credentials.#row(ACCOUNT_CHECKS, "PROJECT_AI_KEPT_AWAY", lim.on === true
      ? "this project keeps its material away from the assistant for this use, so no account was read or used. Nothing "
        + "was sent."
      : "whether this project keeps its material away from the assistant could not be read, so no account was read or "
        + "used. Nothing was sent.",
      { project: String(project), use: use ?? null, keep_away: { reason: lim.reason, set_by: lim.set_by, set_at: lim.set_at } });
    /* END DEC-49 REGION is-project-kept-away */
  }

  /* ===== A PROJECT'S AI ACCOUNT (R54, R58, R59; T40, N812, D34, D37, K2352, K2353, K2404) =====
   *
   * A project holds at most one account, set, switched and removed by any one of its owners (K2352 (2)): an Anthropic
   * API key, sealed as the group key is under `project:<id>`, or the acting owner's own sign-in (R43), which holds no
   * secret and serves only while that member is the project's only participant (K2353: a subscription is that one
   * member's own use, AT-3). When a second member joins, the join is not refused: the sign-in stops serving at once
   * (R56 goes on to each member's own account, then the group's) and the owners are told once (R59, read by
   * notice-producers R16); it serves again when the project returns to that one member. Who participates, and since
   * when, is membership's `joinedParticipants` (its R127); without it a sign-in serves nothing (fail closed). Sight
   * before position (Membership v2 §7): a project the caller cannot see is answered as absent, one seen at existence by
   * C-70.1, and only then is ownership asked; PROJECT_ACT_NOT_THE_OWNER is membership's own answer (its R122). Each
   * act is recorded with its owner and instant, never the key. */

  static PROJECT_KEY_NOTICE_TEXT = "This project has its own Claude account, an Anthropic API key one of its owners set. "
    + "When you ask the assistant in this project, your questions, and the material read to answer them, go to "
    + "Anthropic under the project's API account.";

  /* membership R122: PROJECT_ACT_NOT_THE_OWNER, minted there alone. */
  #notTheOwner(by, project) { return notTheOwner(by ?? null, project); }

  /* membership R44: the caller's sight of `project`, NONE for anything that names no project; never throws. */
  #sightOf(project, viewer) {
    if (typeof project !== "string" || project === "") return Membership.SIGHT_NONE;
    try { return this.membership.sight(project, viewer); } catch { return Membership.SIGHT_NONE; }
  }

  /* Sight first (R44, R77): NONE answers as absent, EXISTENCE C-70.1; null when the caller sees the project. */
  #unseen(project, viewer) {
    const s = this.#sightOf(project, viewer);
    if (s === Membership.SIGHT_FULL) return null;
    const absent = noSuchProject(typeof project === "string" ? project : null);
    return s === Membership.SIGHT_EXISTENCE ? (this.membership.existenceAct(project, viewer) ?? absent) : absent;
  }

  /* R54: an act on a project's AI settings is an owner's (membership R54, R122); a machine credential, the operator's
     token or an unstamped call is refused the same way. */
  #projectOwnerBar(project, by, act) {
    const id = Credentials.#memberOf(by);
    if (by === null || by === undefined || by === "" || isMachineIdentity(by) || id === null)
      return this.#notTheOwner(by, project);
    const unseen = this.#unseen(project, `member:${id}`);
    if (unseen) return unseen;
    return this.#isOwner(project, id) ? null : this.#notTheOwner(by, project);
  }

  /* R56, R58: a project a member acts in is one they have joined (membership R54's set; R55's
     PROJECT_ACT_NOT_A_PARTICIPANT for one they see and have not joined). */
  #participantBar(project, id, act) {
    const viewer = `member:${id}`;
    const unseen = this.#unseen(project, viewer);
    if (unseen) return unseen;
    return this.membership.projectAuthority(project, viewer, "joined", act);
  }

  #isOwner(project, id) { try { return this.membership.isProjectOwner(project, id) === true; } catch { return false; } }
  #isJoined(project, id) { try { return this.membership.isJoinedParticipant(project, id) === true; } catch { return false; } }

  /* membership R127: the project's participants joined or leaving, `[{member, owner, since}]`, or null when it cannot
     be read. */
  #participants(project) {
    try {
      if (typeof this.membership.joinedParticipants !== "function") return null;
      const a = this.membership.joinedParticipants(project);
      return Array.isArray(a) ? a : null;
    } catch { return null; }
  }

  #projectAccountRow(project) {
    if (typeof project !== "string" || project === "") return null;
    return this.#one(`SELECT * FROM project_accounts WHERE project_id=?`, project);
  }

  /* R54: a key serves while held; a sign-in only while its member is the project's only participant. */
  #serves(p) {
    if (p.kind !== "signin") return true;
    const parts = this.#participants(p.project_id);
    return !!parts && parts.some((x) => x.member === p.member_id) && parts.every((x) => x.member === p.member_id);
  }

  #projectAct(project, act, detail, by) {
    this.sql.exec(`INSERT INTO project_account_acts (project_id, act, detail, actor, at) VALUES (?,?,?,?,?)`, project, act,
      detail ?? null, Credentials.#memberOf(by), stampSecond());
  }

  /* R54 `projectKeySet`: an owner holds an Anthropic API key for the project, replacing any earlier account; off when
     first set (a key replacing a key keeps its switches; replacing a sign-in, it is a new account). Answers
     `{ok, project, kind, set_at}`, never the key. */
  async projectKeySet({ project = null, key = null, by = null } = {}) {
    const bar = this.#projectOwnerBar(project, by, "setting a project's Anthropic API key");
    if (bar) return bar;
    const empty = Credentials.#noSecret(key);
    if (empty) return empty;
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const { sealed, iv } = await this.#encrypt(`project:${project}`, "apikey", key);
    const setAt = stampSecond();
    const actor = Credentials.#memberOf(by);
    this.#tx(() => {
      const held = this.#projectAccountRow(project);
      if (held && held.kind === "apikey")
        this.sql.exec(`UPDATE project_accounts SET sealed=?, iv=?, set_by=?, set_at=? WHERE project_id=?`, sealed, iv, actor,
          setAt, project);
      else {
        this.sql.exec(`DELETE FROM project_accounts WHERE project_id=?`, project);
        this.sql.exec(`INSERT INTO project_accounts (project_id, kind, sealed, iv, set_by, set_at) VALUES (?,'apikey',?,?,?,?)`,
          project, sealed, iv, actor, setAt);
      }
      this.#projectAct(project, "setkey", null, by);
    });
    return { ok: true, project, kind: "apikey", set_at: setAt };
  }

  /* R54 `projectSigninSet`: the acting owner's own sign-in becomes the project's account, replacing any earlier one;
     refused PROJECT_NOT_SOLE_MEMBER while the project has any other participant (owners included; and when who
     participates cannot be read), and SIGNIN_NOT_CONNECTED when the owner is not connected through their subscription. */
  projectSigninSet({ project = null, by = null } = {}) {
    const bar = this.#projectOwnerBar(project, by, "making your sign-in a project's Claude account");
    if (bar) return bar;
    const id = Credentials.#memberOf(by);
    const parts = this.#participants(project);
    /* DEC-49 REGION is-project-sole-member */
    if (!parts || parts.some((x) => x.member !== id))
      return Credentials.#row(ACCOUNT_CHECKS, "PROJECT_NOT_SOLE_MEMBER", "a member's own sign-in serves a project only "
        + "while that member is its only participant, and this project has others (owners included); it can hold an "
        + "Anthropic API key instead. Nothing was written.", { project });
    /* END DEC-49 REGION is-project-sole-member */
    /* DEC-49 REGION is-signin-connected */
    if (!this.#connected(id))
      return Credentials.#row(ACCOUNT_CHECKS, "SIGNIN_NOT_CONNECTED", "you are not connected through your Claude "
        + "subscription, so there is no sign-in of yours to serve the project. Nothing was written.", { project });
    /* END DEC-49 REGION is-signin-connected */
    const setAt = stampSecond();
    this.#tx(() => {
      const held = this.#projectAccountRow(project);
      if (held && held.kind === "signin" && held.member_id === id)
        this.sql.exec(`UPDATE project_accounts SET set_by=?, set_at=? WHERE project_id=?`, id, setAt, project);
      else {
        this.sql.exec(`DELETE FROM project_accounts WHERE project_id=?`, project);
        this.sql.exec(`INSERT INTO project_accounts (project_id, kind, member_id, set_by, set_at) VALUES (?,'signin',?,?,?)`,
          project, id, id, setAt);
      }
      this.#projectAct(project, "setsignin", null, by);
    });
    return { ok: true, project, kind: "signin", set_at: setAt };
  }

  /* R54 `projectAccountRemove`: removes whichever account is held; with none, `removed: false`. */
  projectAccountRemove({ project = null, by = null } = {}) {
    const bar = this.#projectOwnerBar(project, by, "removing a project's Claude account");
    if (bar) return bar;
    const held = !!this.#projectAccountRow(project);
    this.#tx(() => {
      this.sql.exec(`DELETE FROM project_accounts WHERE project_id=?`, project);
      this.#projectAct(project, "remove", null, by);
    });
    return { ok: true, removed: held };
  }

  /* R54 `projectAccountSwitch`: switches whichever account is held on or off; only `true` is on, and it is on only
     while an account is held. */
  projectAccountSwitch({ project = null, on = false, by = null } = {}) {
    const bar = this.#projectOwnerBar(project, by, "switching a project's Claude account");
    if (bar) return bar;
    const v = on === true ? 1 : 0;
    this.#tx(() => {
      this.sql.exec(`UPDATE project_accounts SET is_on=? WHERE project_id=?`, v, project);
      this.#projectAct(project, "switch", v ? "on" : "off", by);
    });
    return { ok: true, on: !!this.#projectAccountRow(project)?.is_on };
  }

  /* R54 `projectAccountState`: its owners `{held, kind, on, set_at, by, uses, serving}`, its joined participants
     `{on, serving}`, anyone else as absent (after sight: C-70.1 at existence). Never the key; writes nothing. */
  projectAccountState({ project = null, viewer = null } = {}) {
    const id = Credentials.#memberOf(viewer);
    const absent = noSuchProject(typeof project === "string" ? project : null);
    if (id === null || isMachineIdentity(viewer)) return absent;
    const unseen = this.#unseen(project, `member:${id}`);
    if (unseen) return unseen;
    const p = this.#projectAccountRow(project);
    const on = !!p?.is_on;
    const serving = !!p && this.#serves(p);
    if (this.#isOwner(project, id))
      return { ok: true, held: !!p, kind: p ? p.kind : null, on, set_at: p ? p.set_at : null, by: p ? p.set_by : null,
               uses: p ? Credentials.#usesOf(p) : null, serving };
    if (this.#isJoined(project, id)) return { ok: true, on, serving };
    return absent;
  }

  /* R58 `projectKeyNotice`: `{due, text}` for a member and a project until their own act records that they have read
     it; writes nothing. */
  projectKeyNotice({ member = null, project = null } = {}) {
    const id = Credentials.#memberOf(member);
    const seen = id !== null && typeof project === "string"
      && !!this.#one(`SELECT member_id FROM project_key_notices WHERE member_id=? AND project_id=?`, id, project);
    return { ok: true, due: !seen, text: Credentials.PROJECT_KEY_NOTICE_TEXT };
  }

  /* R58 `projectKeyNoticeSeen`: the member's own act (R22's refusals), for a project they have joined, recorded once
     with its instant; again answers `already: true`. */
  projectKeyNoticeSeen({ member = null, project = null, by = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const id = Credentials.#memberOf(member);
    const out = this.#participantBar(project, id, "reading a project key's notice");
    if (out) return out;
    const already = !!this.#one(`SELECT member_id FROM project_key_notices WHERE member_id=? AND project_id=?`, id, project);
    if (!already) this.sql.exec(`INSERT INTO project_key_notices (member_id, project_id, seen_at) VALUES (?,?,?)`, id, project,
      stampSecond());
    return { ok: true, seen: true, already };
  }

  /* R58: PROJECT_KEY_NOTICE_DUE, minted here alone. */
  #projectNoticeDue(id, project) {
    /* DEC-49 REGION is-project-key-notice-seen */
    if (this.#one(`SELECT member_id FROM project_key_notices WHERE member_id=? AND project_id=?`, id, project)) return null;
    return Credentials.#row(ACCOUNT_CHECKS, "PROJECT_KEY_NOTICE_DUE", "this member has not yet read the notice that their "
      + "questions go to Anthropic under this project's API account. Nothing was sent.", { member: id, project });
    /* END DEC-49 REGION is-project-key-notice-seen */
  }

  /* R59 `projectAccountsSuspended`: for each project `viewer` owns whose sign-in account stopped serving because
     another member joined, `{project, member, since, key}`: `since` the earliest join among the participants other
     than the account's member (membership R127), the account's set instant when none is recorded (K2404 (1)); `key`
     stable per project and suspension. `at` is the caller's instant; the answer is the suspensions in force at the
     call. In-plane, for notice-producers R16; writes nothing and never throws (a read that fails answers none). */
  projectAccountsSuspended({ viewer = null, at = null } = {}) {
    try {
      const id = Credentials.#memberOf(viewer);
      if (id === null || isMachineIdentity(viewer)) return [];
      const out = [];
      for (const p of this.#rows(`SELECT project_id, member_id, set_at FROM project_accounts WHERE kind='signin'
                                  ORDER BY project_id`)) {
        if (!this.#isOwner(p.project_id, id)) continue;
        const parts = this.#participants(p.project_id);
        const others = parts ? parts.filter((x) => x.member !== p.member_id) : [];
        if (!others.length) continue;
        const sinces = others.map((x) => x.since).filter((x) => typeof x === "string" && x !== "").sort();
        const since = sinces.length ? sinces[0] : p.set_at;
        out.push({ project: p.project_id, member: p.member_id, since, key: `${p.project_id}|${p.member_id}|${since}` });
      }
      return out;
    } catch { return []; }
  }

  /* ===== A PROJECT'S MATERIAL LIMITS (R57; D38 C, B3) =====
   *
   * A project may keep its material away from the assistant, for every kind of use or the ones it names, set by any
   * one of its owners under R51's reason rule and appended as R51's are. A material limit binds every account,
   * whoever pays; `aiKeptAway` (R35) is the one site for both refusals. */

  /* R57 `projectAiKeepAwaySet`: an owner's act (R54's refusals), R51's reason rule, `uses` as R51's; answers the state. */
  projectAiKeepAwaySet({ project = null, on = false, uses = null, reason = null, by = null } = {}) {
    const bar = this.#projectOwnerBar(project, by, "keeping a project's material away from the assistant");
    if (bar) return bar;
    const turnOn = on === true;
    const noReason = Credentials.#keepAwayReason(turnOn, reason);
    if (noReason) return noReason;
    const u = Credentials.#usesToStore(uses);
    if (u.fault) return u.fault;
    const given = typeof reason === "string" && reason.trim() !== "";
    this.sql.exec(`INSERT INTO project_keep_away (project_id, is_on, uses, reason, set_by, set_at) VALUES (?,?,?,?,?,?)`,
      project, turnOn ? 1 : 0, u.json, given ? reason : null, Credentials.#memberOf(by), stampSecond());
    return { ok: true, project, ...this.#projectLimit(project) };
  }

  /* R57 `projectAiKeepAwayState`: the project's limit, to its participants (joined or leaving); anyone else as absent.
     Writes nothing. */
  projectAiKeepAwayState({ project = null, viewer = null } = {}) {
    const id = Credentials.#memberOf(viewer);
    const absent = noSuchProject(typeof project === "string" ? project : null);
    if (id === null || isMachineIdentity(viewer)) return absent;
    const unseen = this.#unseen(project, `member:${id}`);
    if (unseen) return unseen;
    if (!this.#isJoined(project, id)) return absent;
    try { return { ok: true, project, ...this.#projectLimit(project) }; }
    catch { return { ok: true, project, on: null, uses: null, reason: null, set_by: null, set_at: null }; }
  }

  /* R57 `projectsKeptAway`: the ids of the projects whose limit covers `use`, for reads under a grant (answers R30)
     and exploring's scope (ai-use R9). In-plane; writes nothing; null when the limits cannot be read, which its caller
     reads as unknown. */
  projectsKeptAway({ use = null } = {}) {
    try {
      return this.#rows(`SELECT k.project_id, k.is_on, k.uses FROM project_keep_away k
                         WHERE k.seq = (SELECT MAX(seq) FROM project_keep_away q WHERE q.project_id = k.project_id)
                         ORDER BY k.project_id`)
        .filter((r) => Credentials.#covers({ on: !!r.is_on, uses: Credentials.#usesList(r.uses) }, use))
        .map((r) => r.project_id);
    } catch { return null; }
  }

  /* ===== THE ASK GRANT (R27, R28, R31, R32; Q1-3, K1450, K1505 (14), K1609, K1685) =====
   *
   * A short-lived, read-only `ai` grant whose viewer is the member, minted at their own act under their own live
   * session (R27), or for a standing question's AI half by `answers` alone (R32). Only its token's SHA-256 is kept; it
   * writes no run row and no observation row and keeps no read log (K1450). An ask's grant ends at
   * `AI_GRANT_TTL_SECONDS`, or with the session it was minted under, whichever is first; a standing question's at its
   * time; each at once when its member is revoked (R16), and a standing one when they remove their reference (R22). */
  static async #sha256(text) {
    const d = await crypto.subtle.digest("SHA-256", Credentials.#enc.encode(text));
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async #mintGrant(id, session, expires, kind) {
    const token = Credentials.#rand(32);
    this.sql.exec(`DELETE FROM ai_grants WHERE expires < ?`, Date.now());
    this.sql.exec(`INSERT INTO ai_grants (grant_sha, member_id, session, expires, kind) VALUES (?,?,?,?,?)`,
      await Credentials.#sha256(token), id, session, expires, kind);
    return { ok: true, token, expires };
  }

  /* R27: at the member's own act under their own live session; refused NO_ACCOUNT when no account serves them (R35:
     no reference of their own, not connected through their subscription, and the group key not held or off; T38,
     K2275), and GROUP_KEY_NOTICE_DUE when the group key would serve them and they have not read its notice (R36). A
     member served by their own sign-in is granted, no notice asked. (T40; R56) It takes `project?`, a project the
     member has joined, and asks R56's cascade for `{kind: "ask", member, project}`: its refusals are this mint's
     (PROJECT_KEY_NOTICE_DUE for a project's key whose notice is due, AI_USE_SWITCHED_OFF, ...). */
  async aiGrantMint({ member = null, by = null, session = null, project = null } = {}) {
    const bar = this.#accountBar(member, by);
    if (bar) return bar;
    const away = this.aiKeptAway({ use: "ask" });   /* R27 mints only for a member R35 serves: none while kept away (DEC-172) */
    if (away) return away;
    const id = Credentials.#memberOf(member);
    const sessionSha = typeof session === "string" && session !== "" ? Credentials.#tokenSha(session) : null;
    const s = sessionSha ? this.#one(`SELECT role, expires FROM sessions WHERE token_sha=?`, sessionSha) : null;
    if (!s || s.role !== `member:${id}` || s.expires < Date.now())
      return Credentials.#notYours("an ask's grant is minted only under the member's own "
        + "live session. Nothing was minted.");
    const served = this.#resolve(id, "ask", project === undefined ? null : project);
    if (served.refusal) return served.refusal;
    return this.#mintGrant(id, sessionSha, Math.min(Date.now() + AI_GRANT_TTL_SECONDS * 1000, s.expires), "ask");
  }

  /* R32: a standing question's grant, for `answers` R19 only (not routed): shaped as R27's, minted with no session. A
     member served by their own sign-in is refused STANDING_SWITCH_OFF: no switch governs it (T38; K2275, N796). */
  async aiGrantMintStanding({ member = null, question = null } = {}) {
    const id = Credentials.#memberOf(member);
    const refuse = (code, detail) => Credentials.#row(ACCOUNT_CHECKS, code, detail, { member: id });
    if (id === null || isMachineIdentity(member) || this.#memberFacts(id)?.status !== "active")
      return refuse("ACCOUNT_MEMBER_NOT_ACTIVE", "a standing question runs only for an active member. Nothing was "
        + "minted.");
    const away = this.aiKeptAway({ use: "standing" });   /* R32 mints only for a member R35 serves: none while kept away (DEC-172) */
    if (away) return away;
    const serving = this.#servingAccount(id);
    if (!serving) return this.#noAccount(id);
    /* DEC-49 REGION is-standing-grant */
    if (!serving.standing)
      return refuse("STANDING_SWITCH_OFF", `standing questions are off for the ${serving.level === "group"
        ? "group's key" : serving.signin ? "member's own sign-in, which has no standing switch" : "member's own account"}, `
        + "which would serve this one. Nothing was minted.");
    if (typeof question !== "string" || question.trim() === "")
      return refuse("NO_QUESTION", "no standing question was named. Nothing was minted.");
    /* END DEC-49 REGION is-standing-grant */
    return this.#mintGrant(id, "", Date.now() + AI_GRANT_TTL_SECONDS * 1000, "standing");
  }

  /* R28, R31: the live grant a token names, or null: unexpired and, for an ask's, its session live and the member's;
     a standing question's needs no session (R32). Writes nothing. */
  async #liveGrant(token) {
    const g = typeof token === "string" && token !== ""
      ? this.#one(`SELECT member_id, session, expires, kind FROM ai_grants WHERE grant_sha=?`, await Credentials.#sha256(token))
      : null;
    const now = Date.now();
    if (!g || g.expires < now) return null;
    if (g.kind === "standing") return g;
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token_sha=?`, g.session);   /* R40: the digest */
    return s && s.expires >= now && s.role === `member:${g.member_id}` ? g : null;
  }

  static #grantNotHeld() {
    /* DEC-49 REGION is-grant-held */
    return Credentials.#row(ACCOUNT_CHECKS, "GRANT_NOT_HELD", "no live grant answers to this token: it expired, its "
      + "session ended, or it never existed. Nothing was read.");
    /* END DEC-49 REGION is-grant-held */
  }

  static #held(g) { return { ok: true, member: g.member_id, viewer: `member:${g.member_id}`, expires: g.expires }; }

  /* R28: a request under a grant is admitted only for an op on `AI_GRANT_OPS`, only as a read, while the grant lives.
     Answers `{ok, member, viewer, expires}`; writes nothing. */
  async aiGrantAdmit({ token = null, op = null, write = false } = {}) {
    const g = await this.#liveGrant(token);
    if (!g) return Credentials.#grantNotHeld();
    /* DEC-49 REGION is-grant-op */
    if (write !== false || typeof op !== "string" || !AI_GRANT_OPS.includes(op))
      return Credentials.#row(ACCOUNT_CHECKS, "GRANT_OP_REFUSED", `an ask's grant admits only the reads on its list, `
        + `and '${String(op ?? "").slice(0, 40)}'${write !== false ? " as a write" : ""} is not one. Nothing was read.`,
        { op: typeof op === "string" ? op.slice(0, 40) : null });
    /* END DEC-49 REGION is-grant-op */
    return Credentials.#held(g);
  }

  /* R31 (N616, K1685): whether `token` is a live grant, asking about no op: exactly when R28 would admit a listed read
     under it. Writes nothing, keeps no read log and never throws. */
  async aiGrantHeld({ token = null } = {}) {
    try {
      const g = await this.#liveGrant(token);
      return g ? Credentials.#held(g) : Credentials.#grantNotHeld();
    } catch { return Credentials.#grantNotHeld(); }
  }

  /* ===== THE SECURITY TALLY (R44; F9, N703; DEC-165, DEC-166; K1874, K1875, K1882) =====
   *
   * COUNTS ONLY: a kind, an hour and a country, and how many. No address reaches this module, and it keeps and derives
   * none; no fingerprint, handle, role, op, path, time within the hour or content is held with a count. `country` is
   * Cloudflare's two-letter label as the caller read it, or null. Counts older than 90 days are dropped. A count that
   * cannot be written is dropped and never changes the answer of the act that refused.
   *
   * DEC-166's PLACE RULE, for the counts this module writes for a sign-in, claim or recovery (`signin`, and R38's
   * `rate`): the count is held at once WITHOUT a place, and its country waits in `security_pending`, beside a keyed
   * digest of the role and nothing else that names it, until an hour has passed with no successful sign-in or recovery
   * under that role; then it is placed and the waiting row dropped. A success within the hour drops the role's waiting
   * rows, so those counts are never placed, and a member's own refused attempt before their own sign-in is never
   * given a country. `through` is never placed. A successful sign-in is never counted. */

  /* Cloudflare's label: two letters or digits, upper-cased; anything else is no country. */
  static #country(c) {
    return typeof c === "string" && /^[A-Za-z0-9]{2}$/.test(c.trim()) ? c.trim().toUpperCase() : null;
  }

  #bump(kind, hour, country) {
    this.sql.exec(`INSERT INTO security_counts (kind, hour, country, count) VALUES (?,?,?,1)
                   ON CONFLICT(kind, hour, country) DO UPDATE SET count=count+1`, kind, hour, country ?? "");
  }

  /* The waiting places an hour old are placed and dropped, and counts older than the days kept are dropped. */
  #settle(now = Date.now()) {
    for (const p of this.#rows(`SELECT seq, kind, hour, country FROM security_pending WHERE at <= ?`, now - HOUR_MS)) {
      if (p.country && this.#one(`SELECT count FROM security_counts WHERE kind=? AND hour=? AND country='' AND count > 0`,
                                  p.kind, p.hour)) {
        this.sql.exec(`UPDATE security_counts SET count=count-1 WHERE kind=? AND hour=? AND country=''`, p.kind, p.hour);
        this.#bump(p.kind, p.hour, p.country);
      }
      this.sql.exec(`DELETE FROM security_pending WHERE seq=?`, p.seq);
    }
    this.sql.exec(`DELETE FROM security_counts WHERE count <= 0 OR hour < ?`,
      Math.floor(now / HOUR_MS) - SECURITY_DAYS * 24);
  }

  /* `session` (R5) is asked at every request, so a waiting place an hour old is dropped promptly; it writes only when
     one is due. */
  #settleSoon() {
    try {
      const now = Date.now();
      if (this.#one(`SELECT seq FROM security_pending WHERE at <= ? LIMIT 1`, now - HOUR_MS)) this.#tx(() => this.#settle(now));
    } catch { /* dropped */ }
  }

  /* R44: a count this module writes for a sign-in, claim or recovery, under DEC-166's place rule. */
  #tallyOwn(kind, country, roleKey) {
    try {
      this.#tx(() => {
        const now = Date.now();
        this.#settle(now);
        const hour = Math.floor(now / HOUR_MS);
        this.#bump(kind, hour, "");
        this.sql.exec(`INSERT INTO security_pending (kind, hour, country, role, at) VALUES (?,?,?,?,?)`, kind, hour,
          Credentials.#country(country), roleKey, now);
      });
    } catch { /* dropped */ }
  }

  /* R44: an in-plane write reached by no route, for `admission` and `capture` (and this module's own kinds): one count
     of `kind` for the current UTC hour and `country`, placed at once. */
  securityCount({ kind = null, country = null } = {}) {
    /* DEC-49 REGION is-security-kind */
    if (!SECURITY_KINDS.includes(kind)) {
      const row = SIGN_IN_CHECKS.SECURITY_KIND_UNKNOWN;
      return { ok: false, reason: "SECURITY_KIND_UNKNOWN", code: "SECURITY_KIND_UNKNOWN", check: row.check,
               translation: row.translation, kind: typeof kind === "string" ? kind.slice(0, 40) : null,
               detail: `the kinds counted are ${SECURITY_KINDS.join(", ")}. Nothing was counted.` };
    }
    /* END DEC-49 REGION is-security-kind */
    try {
      this.#tx(() => {
        const now = Date.now();
        this.#settle(now);
        this.#bump(kind, Math.floor(now / HOUR_MS), Credentials.#country(country));
      });
      return { ok: true, kind, counted: true };
    } catch { return { ok: true, kind, counted: false }; }
  }

  /* ===== THE SECURITY MAP AND THE LEVEL (R45; DEC-165, DEC-166; K1881, K1934 (2), (3)) ===== */

  static #iso(ms) { return stampSecond(ms); }

  static #instantOf(v) {
    if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
    if (typeof v === "string" && v.trim() !== "") return /^\d+$/.test(v.trim()) ? Number(v.trim()) : Date.parse(v);
    return NaN;
  }

  /* R45: the period asked, or what is wrong with it. */
  static #periodFault(fromMs, toMs, now) {
    if (!Number.isFinite(fromMs)) return "from is not an instant";
    if (!Number.isFinite(toMs)) return "to is not an instant";
    if (fromMs >= toMs) return "from is not before to";
    if (toMs - fromMs > SECURITY_DAYS * DAY_MS) return `the period is longer than ${SECURITY_DAYS} days`;
    if (Math.floor(fromMs / HOUR_MS) < Math.floor(now / HOUR_MS) - SECURITY_DAYS * 24)
      return `from is before the counts kept, which go back ${SECURITY_DAYS} days`;
    if (toMs > (Math.floor(now / HOUR_MS) + 1) * HOUR_MS) return "to is after the present hour";
    return null;
  }

  /* R45, R49: SECURITY_PERIOD_INVALID, minted here alone, naming what is wrong (`what`) and the rule (`rule`). */
  static #periodRefusal(what, rule) {
    /* DEC-49 REGION is-security-period */
    const row = SIGN_IN_CHECKS.SECURITY_PERIOD_INVALID;
    return { ok: false, reason: "SECURITY_PERIOD_INVALID", code: "SECURITY_PERIOD_INVALID", check: row.check,
             translation: row.translation, what, detail: `${what}. ${rule} Nothing was read.` };
    /* END DEC-49 REGION is-security-period */
  }

  static #median(values) {
    const v = [...values].sort((a, b) => a - b);
    const m = v.length >> 1;
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }

  /* R45: the figures over hours [fromH, toH), with the usual of each hour, the countries and the level. Writes
     nothing: a waiting place an hour old is read as placed, as the next write will place it. */
  #figures(fromMs, toMs, now) {
    const fromH = Math.floor(fromMs / HOUR_MS), toH = Math.ceil(toMs / HOUR_MS);
    const keys = [...SECURITY_KINDS, "total"];
    const zero = () => Object.fromEntries(keys.map((k) => [k, 0]));
    const byHour = new Map();
    const usualDays = SECURITY_THRESHOLD.usualDays;
    for (const r of this.#rows(`SELECT kind, hour, SUM(count) AS n FROM security_counts WHERE hour >= ? AND hour < ?
                                GROUP BY kind, hour`, fromH - usualDays * 24, toH)) {
      if (!SECURITY_KINDS.includes(r.kind)) continue;
      const h = Number(r.hour);
      if (!byHour.has(h)) byHour.set(h, zero());
      const c = byHour.get(h);
      c[r.kind] += Number(r.n);
      c.total += Number(r.n);
    }
    const at = (h) => byHour.get(h) ?? zero();
    const usualOf = (h) => Object.fromEntries(keys.map((k) =>
      [k, Credentials.#median(Array.from({ length: usualDays }, (_, i) => at(h - (i + 1) * 24)[k]))]));
    const hours = [];
    for (let h = fromH; h < toH; h++) hours.push({ h, counts: at(h), usual: usualOf(h) });
    const unusual = ({ counts, usual }) => counts.total >= SECURITY_THRESHOLD.atLeast
      && counts.total > (usual.total === 0 ? SECURITY_THRESHOLD.times : SECURITY_THRESHOLD.times * usual.total);
    const firstUnusual = hours.find(unusual)?.h ?? null;
    const firstThrough = hours.find((x) => x.counts.through > 0)?.h ?? null;
    const lastWhole = Math.floor(toMs / HOUR_MS) - 1;
    const going = lastWhole >= fromH && unusual(hours[lastWhole - fromH] ?? { counts: zero(), usual: zero() })
      && toMs >= now - HOUR_MS;
    const level = firstThrough !== null || going ? "High" : firstUnusual !== null ? "Raised" : "Ordinary";
    const firsts = [firstUnusual, firstThrough].filter((x) => x !== null);
    return { fromH, toH, keys, zero, hours, level, levelAt: firsts.length ? Credentials.#iso(Math.min(...firsts) * HOUR_MS) : null };
  }

  /* R45 (`op=securitymap`): administrators only. */
  securityMap({ from = null, to = null, by = null } = {}) {
    const bar = this.#adminBar(by, "reading the security map");
    if (bar) return bar;
    const now = Date.now();
    const fromMs = Credentials.#instantOf(from), toMs = Credentials.#instantOf(to);
    const fault = Credentials.#periodFault(fromMs, toMs, now);
    if (fault) return Credentials.#periodRefusal(fault, `The period is from an earlier instant to a later one, at most `
      + `${SECURITY_DAYS} days long and inside the last ${SECURITY_DAYS} days.`);
    const f = this.#figures(fromMs, toMs, now);
    const span = toMs - fromMs;
    const [step, stepH] = span <= 48 * HOUR_MS ? ["hour", 1] : span <= 14 * DAY_MS ? ["six-hours", 6] : ["day", 24];
    const buckets = [];
    for (let start = Math.floor(f.fromH / stepH) * stepH; start < f.toH; start += stepH) {
      const counts = f.zero(), usual = f.zero();
      for (const x of f.hours.slice(Math.max(start, f.fromH) - f.fromH, Math.min(start + stepH, f.toH) - f.fromH))
        for (const k of f.keys) { counts[k] += x.counts[k]; usual[k] += x.usual[k]; }
      buckets.push({ start: Credentials.#iso(start * HOUR_MS), counts, usual });
    }
    const count = f.zero(), usual = f.zero();
    for (const b of buckets) for (const k of f.keys) { count[k] += b.counts[k]; usual[k] += b.usual[k]; }
    let busiest = buckets[0];
    for (const b of buckets) if (b.counts.total > busiest.counts.total) busiest = b;
    /* countries: the period's placed counts, and the waiting places an hour old read as placed */
    const placed = new Map();
    let unplaced = 0;
    for (const r of this.#rows(`SELECT country, SUM(count) AS n FROM security_counts WHERE hour >= ? AND hour < ?
                                GROUP BY country`, f.fromH, f.toH)) {
      if (r.country === "") unplaced += Number(r.n);
      else placed.set(r.country, (placed.get(r.country) ?? 0) + Number(r.n));
    }
    for (const p of this.#rows(`SELECT country, COUNT(*) AS n FROM security_pending WHERE at <= ? AND hour >= ?
                                AND hour < ? AND country IS NOT NULL GROUP BY country`, now - HOUR_MS, f.fromH, f.toH)) {
      const n = Math.min(Number(p.n), unplaced);
      unplaced -= n;
      placed.set(p.country, (placed.get(p.country) ?? 0) + n);
    }
    const countries = [...placed].filter(([, n]) => n > 0).map(([country, n]) => ({ country, count: n }))
      .sort((a, b) => b.count - a.count || (a.country < b.country ? -1 : 1));
    return { ok: true, from: Credentials.#iso(fromMs), to: Credentials.#iso(toMs), step, buckets,
             totals: { count, usual, busiest: busiest ? busiest.start : null }, countries, unplaced,
             note: SECURITY_NOTE, level: f.level, levelAt: f.levelAt };
  }

  /* R45: the level over the 24 hours ending now, for `notice-producers`' one "Noticed" when it becomes High; an
     in-plane read reached by no route and answered to no viewer. Writes nothing; never throws. (N743; K2038) When the
     counts cannot be read the failure is answered as one, `{level: null, levelAt: null}`, never `Ordinary`. */
  securityLevel() {
    try {
      const now = Date.now();
      const { level, levelAt } = this.#figures(now - DAY_MS, now, now);
      return { level, levelAt };
    } catch { return { level: null, levelAt: null }; }
  }

  /* R49 (K1946 T3): R44's counts for a period, for `file-safety`'s log forwarding (its R35): each kind's sum over every
     country and over counts not placed, for the hours that start at or after `from` and before `to`. An in-plane read
     reached by no route and answered to no viewer; it names no country, writes nothing and never throws. Counts that
     cannot be read are a refusal naming the failure, never zeros, so the forwarding sends them as absent. */
  securityTotals({ from = null, to = null } = {}) {
    const fromMs = Credentials.#instantOf(from), toMs = Credentials.#instantOf(to);
    const fault = !Number.isFinite(fromMs) ? "from is not an instant" : !Number.isFinite(toMs) ? "to is not an instant"
      : fromMs >= toMs ? "from is not before to" : null;
    if (fault) return Credentials.#periodRefusal(fault, "The period is from an earlier instant to a later one.");
    try {
      const counts = Object.fromEntries(SECURITY_KINDS.map((k) => [k, 0]));
      /* the hours h with h·H in [from, to) */
      for (const r of this.#rows(`SELECT kind, SUM(count) AS n FROM security_counts WHERE hour >= ? AND hour < ?
                                  GROUP BY kind`, Math.ceil(fromMs / HOUR_MS), Math.ceil(toMs / HOUR_MS)))
        if (SECURITY_KINDS.includes(r.kind)) counts[r.kind] = Number(r.n);
      return { ok: true, from: Credentials.#iso(fromMs), to: Credentials.#iso(toMs), counts };
    } catch (e) {
      /* DEC-49 REGION is-security-counts-read */
      const row = SIGN_IN_CHECKS.SECURITY_COUNTS_UNREADABLE;
      return { ok: false, reason: "SECURITY_COUNTS_UNREADABLE", code: "SECURITY_COUNTS_UNREADABLE", check: row.check,
               translation: row.translation, failure: String(e?.message ?? e).slice(0, 200),
               detail: "the security counts could not be read, so no figure is given: they are absent, never zero. "
                     + "Nothing was read." };
      /* END DEC-49 REGION is-security-counts-read */
    }
  }

  /* ===== RECOVERY CODES (R46, R47; K1888) =====
   *
   * An active administrator holds ten one-time codes for their own role, each drawn from a CSPRNG (100 bits: twenty
   * characters of a 32-letter alphabet), answered once and kept only as its SHA-256. A code recovers its role only
   * while that role is an active administrator; it sets a new password, ends every session of the role, and is never
   * accepted again. `recover` is reached without a credential, so it is under R38's window, and every refusal past the
   * window and the password's length is ONE answer at one cost, so it never tells which roles hold codes. */

  static #CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  static #newCode() {
    const b = crypto.getRandomValues(new Uint8Array(20));
    const chars = [...b].map((x) => Credentials.#CODE_ALPHABET[x & 31]).join("");
    return chars.match(/.{5}/g).join("-");
  }

  /* A code as typed: case, spaces and dashes do not matter. */
  static #codeSha(code) { return sha256HexSync(String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")); }

  /* The founder's role is `admin`; a member's `member:<id>`. */
  static #roleFor(id) { return id === ROOT ? ROOT : `member:${id}`; }

  /* R47: whether `role` is an active administrator now (membership R64). */
  #roleIsAdmin(role) {
    try {
      if (role === ROOT) return this.membership.isAdministrator(ROOT) === true;
      return typeof role === "string" && role.startsWith("member:") && role.length > 7
        && this.membership.isAdministrator(role.slice(7)) === true;
    } catch { return false; }
  }

  /* R46: ten codes for `by`'s own role; issuing again spends every earlier unspent code of that role. */
  recoveryCodesIssue({ by = null } = {}) {
    const bar = this.#adminBar(by, "issuing recovery codes");
    if (bar) return bar;
    const role = Credentials.#roleFor(Credentials.#memberOf(by));
    const issuedAt = stampSecond();
    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => Credentials.#newCode());
    this.#tx(() => {
      this.sql.exec(`UPDATE recovery_codes SET spent_at=? WHERE role=? AND spent_at IS NULL`, issuedAt, role);
      for (const c of codes)
        this.sql.exec(`INSERT INTO recovery_codes (code_sha, role, issued_at) VALUES (?,?,?)`, Credentials.#codeSha(c), role,
          issuedAt);
    });
    return { ok: true, codes, issuedAt };
  }

  /* R46: `by`'s own codes, counted; never a code or a digest. */
  recoveryCodesState({ by = null } = {}) {
    const id = Credentials.#memberOf(by);
    if (id === null || isMachineIdentity(by)) return { ok: true, held: false, remaining: 0, issuedAt: null };
    const r = this.#one(`SELECT COUNT(*) AS n, MAX(issued_at) AS at FROM recovery_codes WHERE role=? AND spent_at IS NULL`,
      Credentials.#roleFor(id));
    const remaining = Number(r?.n ?? 0);
    return { ok: true, held: remaining > 0, remaining, issuedAt: remaining > 0 ? r.at : null };
  }

  static #recoveryRefused() {
    /* DEC-49 REGION is-recovery-code */
    const row = SIGN_IN_CHECKS.RECOVERY_REFUSED;
    return { ok: false, reason: "RECOVERY_REFUSED", code: "RECOVERY_REFUSED", check: row.check, translation: row.translation,
             detail: "no password was set and nothing was written. Either that role holds no recovery code, or the code "
                   + "given is not one of its unspent codes, or the role is not an active administrator now. Which of "
                   + "those happened is not said: it is one answer deliberately, so that a refusal cannot be used to "
                   + "find out which roles hold codes." };
    /* END DEC-49 REGION is-recovery-code */
  }

  /* R47: reached without a credential. */
  async recover({ role = null, code = null, password = null, source = null, country = null } = {}) {
    const asked = typeof role === "string" ? role : "";
    const gate = await this.#gate({ role: asked, source, country, password });
    if (gate.paused) return gate.paused;
    if (typeof password !== "string" || password.length < 12) {
      this.#refusedAttempt(gate, country);
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    }
    const presented = Credentials.#codeSha(code);
    /* R41: every unspent code of the role compared, in constant time, none skipped */
    const unspent = (r) => this.#rows(`SELECT code_sha FROM recovery_codes WHERE role=? AND spent_at IS NULL`, r);
    const matches = () => {
      let hit = null;
      for (const r of unspent(asked)) if (Credentials.#same(presented, r.code_sha, { digests: true })) hit = r.code_sha;
      return hit;
    };
    const admin = this.#roleIsAdmin(asked);
    const given = typeof code === "string" && code.trim() !== "";
    const refuse = () => { this.#refusedAttempt(gate, country); return Credentials.#recoveryRefused(); };
    if (!(matches() !== null && admin && given)) {
      await Credentials.#payLoginCost(password);
      return refuse();
    }
    const hashed = await Credentials.#hashFor(password);
    /* asked again in the one act that spends it, so a code is spent once whatever runs beside it */
    const done = this.#tx(() => {
      const hit = matches();
      if (hit === null || !this.#roleIsAdmin(asked)) return null;
      const at = stampSecond();
      this.#storePassword(asked, hashed);
      this.sql.exec(`UPDATE recovery_codes SET spent_at=? WHERE code_sha=?`, at, hit);
      this.#endSessions(this.#rows(`SELECT token_sha FROM sessions WHERE role=?`, asked).map((r) => r.token_sha));
      this.sql.exec(`INSERT INTO recoveries (role, at) VALUES (?,?)`, asked, at);
      return { ok: true, role: asked, remaining: unspent(asked).length };
    });
    if (!done) return refuse();
    this.#succeeded(gate);
    return done;
  }

  /* ===== THE GROUP'S KEYED SERVICES (R29; K1449; K1946 T1) =====
   *
   * The group's own key for a keyed outside service, set by an administrator, sealed as a member's reference is, off
   * by default and off while it holds no key. No key is ever required for the copy to work (D201): an in-plane caller
   * that is refused answers without the service. A paid account is not a keyed service (K1449; `sources`). (T36)
   * Each outside security tool's credentials are held here too, under `security:<tool_id>`, set when an administrator
   * adds the tool and read for each call to it (`file-safety` R28, R29); such a key may be a set of named fields held
   * as one value, and a set with no key removes the service's key, which turns it off (`file-safety` R30). */
  #keyedService(service) {
    /* DEC-49 REGION is-keyed-service */
    if (!KEYED_SERVICES.includes(service) && !(typeof service === "string" && SECURITY_SERVICE_RE.test(service)))
      return Credentials.#row(KEYED_SERVICE_CHECKS, "UNKNOWN_KEYED_SERVICE", `the keyed services are `
        + `${KEYED_SERVICES.join(", ")}, and ${SECURITY_SERVICE_PREFIX}<tool id> for each security tool. Nothing was `
        + `changed.`, { service: typeof service === "string" ? service.slice(0, 40) : null });
    return null;
    /* END DEC-49 REGION is-keyed-service */
  }

  #adminBar(by, act) {
    const who = Credentials.#memberOf(by);
    return who !== null && !isMachineIdentity(by) && this.membership.isAdministrator(who) ? null : notAnAdmin(by ?? null, act);
  }

  /* R29: one key, a string; or a set of named fields (`{name: value}`, at least one, each name 1 to 64 letters, digits,
     `.`, `_` or `-` and each value a non-blank string), held and answered as one value. No key at all (null or left
     out) removes the service's key. Answers the form to seal, or the refusal. */
  static #keyForm(key) {
    if (typeof key === "string") return key.trim() === "" ? { empty: "no key was given" } : { form: "key", text: key };
    if (key && typeof key === "object" && !Array.isArray(key) && Object.getPrototypeOf(key) === Object.prototype) {
      const names = Object.keys(key);
      if (!names.length) return { empty: "the set of fields was empty" };
      for (const n of names) {
        if (!/^[A-Za-z0-9._-]{1,64}$/.test(n)) return { empty: `a field's name, '${n.slice(0, 64)}', is not one a set holds` };
        if (typeof key[n] !== "string" || key[n].trim() === "") return { empty: `the field '${n}' holds no value` };
      }
      return { form: "fields", text: JSON.stringify(Object.fromEntries(names.sort().map((n) => [n, key[n]]))) };
    }
    return { empty: "no key was given" };
  }

  async keyedServiceSet({ service = null, key = null, by = null } = {}) {
    const bar = this.#adminBar(by, "setting the group's key for an outside service");
    if (bar) return bar;
    const unknown = this.#keyedService(service);
    if (unknown) return unknown;
    if (key === null || key === undefined) {   /* a set with no key removes it, and the service is off */
      const held = this.#keyedState(service).held;
      this.sql.exec(`DELETE FROM keyed_services WHERE service=?`, service);
      return { ok: true, service, held: false, removed: held };
    }
    const k = Credentials.#keyForm(key);
    /* DEC-49 REGION is-keyed-service-key */
    if (k.empty)
      return Credentials.#row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_NO_KEY", `${k.empty}. Nothing was changed.`);
    /* END DEC-49 REGION is-keyed-service-key */
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const { sealed, iv } = await this.#encrypt(`group:${service}`, k.form, k.text);
    const setAt = stampSecond();
    this.sql.exec(
      `INSERT INTO keyed_services (service, sealed, iv, is_on, set_by, set_at, form) VALUES (?,?,?,0,?,?,?)
       ON CONFLICT(service) DO UPDATE SET sealed=excluded.sealed, iv=excluded.iv, set_by=excluded.set_by,
         set_at=excluded.set_at, form=excluded.form`, service, sealed, iv, Credentials.#memberOf(by), setAt, k.form);
    return { ok: true, service, held: true, set_at: setAt };
  }

  keyedServiceSwitch({ service = null, on = false, by = null } = {}) {
    const bar = this.#adminBar(by, "switching the group's key for an outside service");
    if (bar) return bar;
    const unknown = this.#keyedService(service);
    if (unknown) return unknown;
    this.sql.exec(`INSERT INTO keyed_services (service, is_on) VALUES (?,?)
                   ON CONFLICT(service) DO UPDATE SET is_on=excluded.is_on`, service, on === true ? 1 : 0);
    return { ok: true, ...this.#keyedState(service) };
  }

  /* A service is on only while it is switched on AND holds a key. */
  #keyedState(service) {
    const r = this.#one(`SELECT sealed, is_on, set_by, set_at FROM keyed_services WHERE service=?`, service);
    const held = !!(r && r.sealed);
    return { service, held, on: held && !!r.is_on, set_by: r?.set_by ?? null, set_at: r?.set_at ?? null };
  }

  /* Every named service, then each security tool's that holds a row, in order; never a key. */
  keyedServices() {
    const tools = this.#rows(`SELECT service FROM keyed_services WHERE service LIKE 'security:%' ORDER BY service`)
      .map((r) => r.service).filter((x) => SECURITY_SERVICE_RE.test(x));
    return { services: [...KEYED_SERVICES, ...tools].map((s) => this.#keyedState(s)) };
  }

  /* The key, to its in-plane caller only while the service is on; never routed. A set of fields is answered as the
     object it was set as. */
  async keyedServiceFor({ service = null } = {}) {
    const unknown = this.#keyedService(service);
    if (unknown) return unknown;
    const off = () => Credentials.#row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_OFF", "the group's key for this service is "
      + "off or not held; the caller goes on without it.", { service });
    /* DEC-49 REGION is-keyed-service-on */
    if (!this.#keyedState(service).on) return off();
    /* END DEC-49 REGION is-keyed-service-on */
    const unsealable = this.#seal();
    if (unsealable) return unsealable;
    const r = this.#one(`SELECT sealed, iv, form FROM keyed_services WHERE service=?`, service);
    const form = r.form === "fields" ? "fields" : "key";
    const text = await this.#decrypt(`group:${service}`, form, r.sealed, r.iv);
    let key = text;
    if (text !== null && form === "fields") { try { key = JSON.parse(text); } catch { key = null; } }
    if (key === null)
      return Credentials.#sealRefusal("the key does not open under the seal secret of your group's Civicsmith, which "
        + "has changed; an administrator sets it again. Nothing was used.");
    return { ok: true, service, key };
  }
}

/* K61: the one Credentials of a Durable Object's storage, made on first use over its `sql`, reaching record-core and
   membership by their factories on the same `ctx`; its first construction registers the seam (R16, R17). `record` and
   `membership` (a test's own) are read on the first call only. */
const OF = new WeakMap();
export function credentialsOf(ctx, { record = null, membership = null, sealSecret = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = OF.get(storage);
  if (!c) {
    c = new Credentials({ sql: storage.sql, core: record ?? recordOf(ctx),
                          membership: membership ?? membershipOf(ctx, { record }), sealSecret });
    OF.set(storage, c);
    c.start();
  }
  return c;
}

/* The ops this module answers, as entries of the plane's one route map (plane R5: `routes` spreads them in, after
   membership's, and control-plane's `dispatch` answers every store request over it). `url` carries the control
   plane's stamps (`by`, `who`) in its query, read AFTER the body is spread, so a caller's own copy never wins (D-136);
   `body` is the parsed body; `env` the store's environment. */
export function credentialsOps(c, url, body, env) {
  const doorStamps = (u) => ({ source: u.searchParams.get("source"), country: u.searchParams.get("country") });
  const bodyField = (k) => (body && typeof body === "object" && !Array.isArray(body) && typeof body[k] === "string" ? body[k] : null);
  const by = () => url.searchParams.get("by");
  return {
    /* D-199: `who` is the SERVER'S stamp, and `secretSha` never comes from a caller: the control plane generates the
       value, hashes it, and this module never sees the value. R53 (N761; K2129): the digest is read from the body
       only, where the control plane sets it after removing any a caller sent; a `secretSha` in the query is never
       read, so no digest travels in an internal address. */
    aicredentialmint: () => {
      const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
      return c.aiCredentialMint({ ...b, who: url.searchParams.get("who"), secretSha: b.secretSha ?? null });
    },
    aicredentialrevoke: () => c.aiCredentialRevoke({
      tokenId: url.searchParams.get("tokenId"),
      who: url.searchParams.get("who") }),
    aicredentials: () => c.aiCredentials({ limit: url.searchParams.get("limit") }),
    /* INTERNAL ONLY, the gate's own lookup; it takes the HASH because the value never crosses this boundary. */
    aicredentiallook: () => c.aiCredentialLook({ secretSha: url.searchParams.get("sha") }),
    /* D-116: the DO's own build under `storeVersion`, never `version` (the routing isolate's, spread before this).
       null, never a default: a DO with no VERSION bound cannot say which build it is. */
    bootstrap: () => ({ ...c.bootstrapState(url.searchParams.get("fp")),
                        storeVersion: typeof env?.VERSION === "string" && env.VERSION ? env.VERSION : null }),
    /* R38, R44 (T35): `source` (the caller's keyed fingerprint of the connecting address, never the address) and
       `country` (Cloudflare's label) are the control plane's stamps, read from the query after the body, so a caller
       cannot choose the window it is counted in (admission's, T35-71). */
    claim: () => c.claim({ ...(body || {}), tokenFp: url.searchParams.get("fp"), ...doorStamps(url) }),
    login: () => c.login({ ...(body || {}), ...doorStamps(url) }),
    /* R3 (T37; DEC-182 (4)): a member's own change, `{current, password}` from the body; the role from the session the
       control plane authenticated (`session`), `by` its stamp, `source` and `country` the door's; a `role` in the
       body is never read. */
    setpassword: () => {
      const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
      return c.passwordChange({ current: b.current ?? null, password: b.password ?? null, by: url.searchParams.get("by"),
                                session: url.searchParams.get("session"), ...doorStamps(url) });
    },
    session: () => ({ session: c.session(url.searchParams.get("t")) }),
    /* R39 (F14): the session the control plane authenticated (`session`, its stamp). */
    signout: () => c.signOut({ token: url.searchParams.get("session") }),
    signouteverywhere: () => c.signOutEverywhere({ token: url.searchParams.get("session") }),
    /* R45: an administrator's read; the period from the query or the body, `by` the stamp. */
    securitymap: () => c.securityMap({ from: url.searchParams.get("from"), to: url.searchParams.get("to"), ...(body || {}),
                                       by: url.searchParams.get("by") }),
    /* R46, R47 (K1888): an administrator's own codes; `recover` reached with no credential, under R38's window. */
    recoverycodesissue: () => c.recoveryCodesIssue({ by: url.searchParams.get("by") }),
    recoverycodesstate: () => c.recoveryCodesState({ by: url.searchParams.get("by") }),
    recover: () => c.recover({ ...(body || {}), ...doorStamps(url) }),
    /* R43: the member's own act; `subscriptionConnected` is in-plane and not routed. */
    subscriptiondisconnect: () => c.subscriptionDisconnect({ member: url.searchParams.get("by"), by: url.searchParams.get("by") }),
    /* REC-159: spread the body, THEN the stamp. */
    signeradd: () => c.signerAdd({ ...(body || {}), by: url.searchParams.get("by") }),
    signerlist: () => c.signerList(),
    signerset: () => c.signerSet({ ...(body || {}), by: url.searchParams.get("by") }),
    /* T33-20 (R22–R29), T34 (R31–R37): the member's own account, the group's key and the ask grant, `by` and `viewer`
       the control plane's stamps and the session the one it authenticated (`session`, its stamp); a secret only ever
       in the body, never the query. The in-plane reads (`accountReferenceFor`, `accountFor`, `aiGrantAdmit`,
       `aiGrantHeld`, `aiGrantMintStanding`, `keyedServiceFor`; T35's `groupKeySwitches`, `subscriptionConnected`,
       `securityLevel`; T36's `securityTotals`) are not routed; `securityCount` only as the store-internal
       `securitycount` (R50). Which credential reaches each op is
       op-declarations' and control-plane's (Q0-10; control-plane R53, R56). */
    accountreferenceset: () => c.accountReferenceSet({ ...(body || {}), by: url.searchParams.get("by") }),
    accountreferenceremove: () => c.accountReferenceRemove({ ...(body || {}), by: url.searchParams.get("by") }),
    accountreference: () => c.accountReferenceState({ member: url.searchParams.get("member"),
                                                      viewer: url.searchParams.get("viewer") }),
    accountswitchset: () => c.accountSwitchSet({ ...(body || {}), by: url.searchParams.get("by") }),
    /* (T40; R27) the project an ask is made in, the body's or the query's; never a stamp */
    aigrantmint: () => c.aiGrantMint({ member: url.searchParams.get("member"), by: url.searchParams.get("by"),
                                       session: url.searchParams.get("session"),
                                       project: bodyField("project") ?? (url.searchParams.get("project") || null) }),
    groupkeyset: () => c.groupKeySet({ ...(body || {}), by: url.searchParams.get("by") }),
    groupkeyremove: () => c.groupKeyRemove({ by: url.searchParams.get("by") }),
    groupkeyswitch: () => c.groupKeySwitch({ ...(body || {}), by: url.searchParams.get("by") }),
    groupswitchset: () => c.groupSwitchSet({ ...(body || {}), by: url.searchParams.get("by") }),
    groupkeystate: () => c.groupKeyState({ viewer: url.searchParams.get("viewer") }),
    groupkeynotice: () => c.groupKeyNotice({ member: url.searchParams.get("viewer") }),
    groupkeynoticeseen: () => c.groupKeyNoticeSeen({ member: url.searchParams.get("by"), by: url.searchParams.get("by") }),
    keyedserviceset: () => c.keyedServiceSet({ ...(body || {}), by: url.searchParams.get("by") }),
    keyedserviceswitch: () => c.keyedServiceSwitch({ ...(body || {}), by: url.searchParams.get("by") }),
    keyedservices: () => c.keyedServices(),
    /* R51, R52 (DEC-172): the keep-away act, `by` the stamp after the body; its state, which reaches every active
       member through the op's spec (op-declarations, control-plane). */
    aikeepaway: () => c.aiKeepAwaySet({ ...(body || {}), by: url.searchParams.get("by") }),
    aikeepawaystate: () => c.aiKeepAwayState(),
    /* R50 (N744; K2038): STORE-INTERNAL, no spec (op-declarations R6): R44's write for admission R22, reached from the
       Worker through the store as `doorbellrefused` is. It takes `{kind, country}` from the body and nothing else. */
    /* T40 (R54–R58): every account's switches, a project's account, its key's notice and its material limits; `by`
       and `viewer` the stamps after the body. The in-plane reads (`projectAccountsSuspended`, `projectsKeptAway`,
       `aiKeptAway`) are not routed. */
    accountusesset: () => c.accountUsesSet({ ...(body || {}), by: by() }),
    projectkeyset: () => c.projectKeySet({ ...(body || {}), by: by() }),
    projectsigninset: () => c.projectSigninSet({ ...(body || {}), by: by() }),
    projectaccountremove: () => c.projectAccountRemove({ ...(body || {}), by: by() }),
    projectaccountswitch: () => c.projectAccountSwitch({ ...(body || {}), by: by() }),
    projectaccountstate: () => c.projectAccountState({ project: url.searchParams.get("project"),
                                                       viewer: url.searchParams.get("viewer") }),
    projectkeynotice: () => c.projectKeyNotice({ member: url.searchParams.get("viewer"), project: url.searchParams.get("project") }),
    projectkeynoticeseen: () => c.projectKeyNoticeSeen({ project: bodyField("project") ?? url.searchParams.get("project"),
                                                         member: by(), by: by() }),
    projectaikeepaway: () => c.projectAiKeepAwaySet({ ...(body || {}), by: by() }),
    projectaikeepawaystate: () => c.projectAiKeepAwayState({ project: url.searchParams.get("project"),
                                                             viewer: url.searchParams.get("viewer") }),
    securitycount: () => {
      const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
      return c.securityCount({ kind: b.kind ?? null, country: b.country ?? null });
    },
  };
}
