/* credentials — the credentials a member or the instance acts by: the founder's password and claim, members' passwords
 * and sessions, the signer keys whose signatures the record accepts, and the credentials AI work runs under.
 *
 * Requirements: build/requirements/credentials.md (R1–R21). Split from `membership` (K617, K636 BOB-1, K637; T19 layer
 * 2, CREDENTIALS #1): the code is copied from `membership/index.mjs` and `schema.mjs`, without change of meaning, and
 * reads `members` only through membership's services (`memberFacts`, `sessionRights`, `isAdministrator`,
 * `activeAdmins`, `notAnAdmin`), never by SQL. Who the members are, and what each may do, is membership's; this module
 * never decides it. Membership reaches this module's sessions and keys only through its `onRevoked` notice (R16), and
 * reads the founder's claim through the one fact this module registers (R17).
 *
 * SHAPE (K61). `credentialsOf(ctx)` answers the one instance for a Durable Object's storage, over `ctx.storage.sql`,
 * reaching record-core by `recordOf(ctx)` and membership by `membershipOf(ctx)` on the same `ctx`; a test may pass its
 * own as `credentialsOf(ctx, { record, membership })`. Its first construction is this module's start: it registers
 * the revocation listener (R16) and the claim fact (R17) with membership. Every refusal names its reason; no service
 * throws.
 */
import { MACHINE_CLASS_PREFIX, isMachineIdentity } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { Membership, membershipOf, notAnAdmin } from "../membership/index.mjs";
import { CREDENTIALS_SCHEMA, CREDENTIALS_ADDITIVE_COLUMNS, CREDENTIALS_EXEMPT_TABLES } from "./schema.mjs";
export { CREDENTIALS_EXEMPT_TABLES } from "./schema.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS } from "./checks.mjs";
export { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS, AI_CREDENTIAL_CHECKS } from "./checks.mjs";

/* A whole-second instant, the record's `…:00Z` spelling. */
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");

/* The founder's role and member id (membership's `ROOT_ADMIN`): the credentials role the founder holds. */
const ROOT = Membership.ROOT_ADMIN;

export class Credentials {
  constructor({ sql, core = null, membership = null } = {}) {
    this.sql = sql;
    this.core = core;
    this.membership = membership;
  }

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
    for (const [table, column, decl] of CREDENTIALS_ADDITIVE_COLUMNS) {
      const have = cols(table);
      if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    const bare = CREDENTIALS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    this.declareTables();
  }

  /* R18, through record-core's `declarePurge` (its R21): every table here is exempt. Each is declared on its own so
     that, while membership still declares a table this module took from it (until membership's deletion drops it from
     `MEMBERSHIP_EXEMPT_TABLES`, K637), that table stays exempt under membership's declaration and the rest are this
     module's. Any other refusal is thrown: a purge that silently cleared a credential would revoke authority as a side
     effect of resetting the corpus. */
  declareTables() {
    if (this.#declared) return false;
    for (const name of CREDENTIALS_EXEMPT_TABLES) {
      const answer = this.core.declarePurge("credentials", [], { exempt: [name] });
      if (answer && answer.ok === false
          && !(answer.reason === "TABLE_DECLARED" && answer.declaredBy === "membership"))
        throw new Error(`credentials: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    }
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
     running instance; a replaced one (a different fingerprint) re-arms it. */
  async claim({ role = ROOT, password, tokenFp = null } = {}) {
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    const st = this.bootstrapState(tokenFp);
    if (st.claimed)
      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };
    await this.setPassword({ role, password });
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,
                     token_fp=excluded.token_fp`, now, tokenFp);
    return { ok: true, role, consumedAt: now };
  }

  /* R3: a salted, derived hash for `role`, replacing any earlier one; never the password. Who may call it is the
     control plane's rule (`op=setpassword`). */
  async setPassword({ role, password, iterations = 100000 } = {}) {
    const salt = Credentials.#rand(16);
    const hash = await Credentials.#derive(password, salt, iterations);
    this.sql.exec(
      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)
       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,
         iterations=excluded.iterations, updated=excluded.updated`,
      role, salt, hash, iterations, new Date().toISOString());
    return { ok: true, role };
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
      "no session was issued and nothing was written. Either this instance holds no active credential "
      + "under that role — a role that was never registered and one whose membership is no longer active "
      + "are the same answer here — or a credential is stored and the password supplied does not derive "
      + "its stored hash. The password itself is never kept, only a salted derivation of it, so that is "
      + "the only comparison there is to make. Which of those happened, the record does not say: it is one "
      + "answer deliberately, so that a refusal cannot be used to find out which roles hold a credential "
      + "on this instance.",
  };

  static #refused() {
    return { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED };
  }

  /* R4: exchanges a password for a bearer token, so the password does not travel on every later request. A member's
     sign-in is refused unless the member is active (membership R68's standing), so revocation closes the front door as
     well as the sessions; that arm never touches a password, so it pays the same cost first and answers the same
     words, byte for byte. */
  async login({ role = ROOT, password, ttlSeconds = 43200 } = {}) {
    if (typeof role === "string" && role.startsWith("member:")) {
      const m = this.#memberFacts(role.slice(7));
      if (!m || m.status !== "active") {
        await Credentials.#payLoginCost(password);
        return Credentials.#refused();
      }
    }
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    if (!c) {
      await Credentials.#payLoginCost(password);
      return Credentials.#refused();
    }
    const got = await Credentials.#derive(String(password ?? ""), c.salt, c.iterations);
    if (got !== c.hash) return Credentials.#refused();
    const token = Credentials.#rand(32);
    const expires = Date.now() + ttlSeconds * 1000;
    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());
    this.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES (?,?,?,?)`,
      token, role, expires, new Date().toISOString());
    return { ok: true, role, token, expires };
  }

  /* R5: what a session is, and what it may do (Membership Architecture v2 §5), resolved HERE at every read through
     membership's `sessionRights` (its R92) rather than cached on the session row: a capability change or a revocation
     takes effect on the next request, not on the next login. */
  session(token) {
    if (!token) return null;
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token=?`, token);
    if (!s) return null;
    if (s.expires < Date.now()) { this.sql.exec(`DELETE FROM sessions WHERE token=?`, token); return null; }
    const r = this.membership.sessionRights(s.role) || {};
    return { role: s.role, expires: s.expires, capabilities: r.capabilities ?? [], administer: r.administer === true,
             member: r.member ?? null, handle: r.handle ?? null, rootOfTrust: r.rootOfTrust === true };
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
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
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
      + `one this instance would refuse. Nothing was written.`);
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
                     confinedTo = null, at = null } = {}) {
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
        id ? `'${id.slice(0, 60)}' already names a credential on this instance. Acts cite the `
             + `IDENTITY, so rebinding it would re-attribute work already done.`
           : "pass an identity for this credential: it is the name acts will cite, and a credential "
             + "nothing can name is one nothing can revoke either.",
        { tokenId: id || null });
    /* END DEC-49 REGION is-ai-credential-mint */

    const declared = (Array.isArray(writes) ? writes : []).map((w) => String(w)).sort();
    /* D-463: it stores 'scratch' or it stores NULL, and nothing between. */
    const confinement = confinedTo === null || confinedTo === undefined ? null : String(confinedTo);
    this.sql.exec(
      `INSERT INTO ai_credentials (token_id, secret_sha, principal_kind, principal, task_scope,
         scope_writes, scope_note, minted_by, minted_at, confined_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, String(secretSha ?? ""), kind, principal, String(taskScope ?? "investigative"),
      JSON.stringify(declared), String(note ?? ""), String(who), now, confinement);
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
        `no credential on this instance is called '${id.slice(0, 60) || "(none)"}'. Nothing was `
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
     unknown string. */
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
             confinedTo: row.confined_to || null };
  }
}

/* K61: the one Credentials of a Durable Object's storage, made on first use over its `sql`, reaching record-core and
   membership by their factories on the same `ctx`; its first construction registers the seam (R16, R17). `record` and
   `membership` (a test's own) are read on the first call only. */
const OF = new WeakMap();
export function credentialsOf(ctx, { record = null, membership = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = OF.get(storage);
  if (!c) {
    c = new Credentials({ sql: storage.sql, core: record ?? recordOf(ctx),
                          membership: membership ?? membershipOf(ctx, { record }) });
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
  return {
    /* D-199: `who` is the SERVER'S stamp, and `secretSha` never comes from a caller: the control plane generates the
       value, hashes it, and this module never sees the value. */
    aicredentialmint: () => c.aiCredentialMint({
      ...(body || {}),
      who: url.searchParams.get("who"),
      secretSha: url.searchParams.get("secretSha") }),
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
    claim: () => c.claim({ ...(body || {}), tokenFp: url.searchParams.get("fp") }),
    login: () => c.login(body || {}),
    setpassword: () => c.setPassword(body || {}),
    session: () => ({ session: c.session(url.searchParams.get("t")) }),
    /* REC-159: spread the body, THEN the stamp. */
    signeradd: () => c.signerAdd({ ...(body || {}), by: url.searchParams.get("by") }),
    signerlist: () => c.signerList(),
    signerset: () => c.signerSet({ ...(body || {}), by: url.searchParams.get("by") }),
  };
}
