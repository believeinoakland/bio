/* K103, K109 (3), K157–K159 — THE CREDENTIALS MEMBERS SUPPLY FOR A REFUSED CAPTURE (capture-sources R55–R63).
 *
 * A source refuses a capture (capture-requests R40: a login, a paywall, the agent sent, another authorisation);
 * a member may supply what a retry needs and declare whose it is: their own (`member`), one project's
 * (`project`) or the group's (`group`). This file holds them, and it is the one store capture-sources has (R47).
 *
 * THE SECRET IS NEVER HELD IN THE CLEAR (R59). It is encrypted with AES-256-GCM under a key derived by
 * HKDF-SHA-256 from the instance's secret (`CAPTURE_CREDENTIALS_KEY`, a Worker secret the caller passes as
 * `key`, kept outside the store), with a fresh 12-byte IV per row and the row's id, scope and project as
 * associated data, so a ciphertext copied into another row or scope does not decrypt. With no key bound
 * nothing is stored (R55) and nothing is answered for a fetch (R56).
 *
 * NEVER SHOWN BACK, NEVER EXPORTED (R60, R61). Only `credentialsForFetch` answers a secret, in process; it is
 * not an op. The listing carries no part of it, its length or a digest; no refusal repeats a caller's value, so
 * a secret put in the wrong field is not echoed either. The table is this module's own and never a bundle's
 * file, so `readImage`, a manifest and a snapshot never carry it.
 *
 * FIXED AT SUPPLY (R62). Host, scope and project are never updated: a change is a withdrawal and a new supply.
 * The one UPDATE this file makes is the withdrawal, which destroys the ciphertext (R57, R63).
 *
 * A MEMBER'S REVOCATION (R63, K159, N123). The store registers with membership's revocation notice (its R79) when
 * it is created, at the plane's start: inside the revoking act the member's `member` credentials are withdrawn and
 * their ciphertext destroyed. A supplier revoked before that registration existed is still met by every read here
 * (`#sweep`, `#withdrawRevoked`), which withdraws such a credential then and never answers it. `project` and
 * `group` credentials stay, having been given to the project or the group.
 *
 * THE GROUP'S OWN HOSTS (F16, R55, R56, R65). A credential is never for the host the group's Civicsmith is reached at
 * or a fleet member's (`ownHosts`, the composition root's to hand in, read by `own-hosts.mjs`): supplying one is
 * refused `CAPTURE_CREDENTIAL_OWN_HOST`, and one supplied before that refusal existed is never answered for a fetch.
 *
 * BOUNDED READS (N189). `credentialsForFetch` reads the one admitted row, its scope rule and order in the SQL
 * (`LIMIT 1`); `credentialList` reads at most `limit` + 1 of the rows the viewer may see, its visibility in the SQL
 * (membership's `viewerPredicate`, R43, for a project's), and publishes the cut. */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { isOwnHost } from "./own-hosts.mjs";
import { word, localize } from "../setup-words/index.mjs";

export const CREDENTIAL_KINDS = Object.freeze(["login", "user-agent", "other"]);
/* Narrowest first: the order R56 chooses in. */
export const CREDENTIAL_SCOPES = Object.freeze(["member", "project", "group"]);
/* Who withdrew a credential a revocation ended: a string no member id can be (membership R12's pattern). */
export const REVOCATION = "(revocation)";
export const CREDENTIALS_TABLE = "capture_credentials";

/* C-105: the credentials' refusals, allocated with this job (K109 (3)'s form for C-28). Each code names one
   condition, minted at one site (K231, K275: N189 split `NO_KEY` and `NO_SUCH` from the failures they also
   covered), and its `where` names that site's function and DEC-49 region. */
const at = (fn, region) => `src/capture-sources/credentials.mjs ${fn} > ${region}`;
export const CAPTURE_CREDENTIAL_CHECKS = Object.freeze({
  CAPTURE_CREDENTIAL_NOT_A_MEMBER: { check: "C-105.1", where: at("credentialSupply", "is-credential-supplier-member"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NOT_A_MEMBER") },
  CAPTURE_CREDENTIAL_BAD_KIND: { check: "C-105.2", where: at("credentialSupply", "is-credential-kind"),
    translation: word("refusal.CAPTURE_CREDENTIAL_BAD_KIND") },
  CAPTURE_CREDENTIAL_BAD_HOST: { check: "C-105.3", where: at("credentialSupply", "is-credential-host"),
    translation: word("refusal.CAPTURE_CREDENTIAL_BAD_HOST") },
  CAPTURE_CREDENTIAL_BAD_SCOPE: { check: "C-105.4", where: at("credentialSupply", "is-credential-scope"),
    translation: word("refusal.CAPTURE_CREDENTIAL_BAD_SCOPE") },
  CAPTURE_CREDENTIAL_NO_PROJECT: { check: "C-105.5", where: at("credentialSupply", "is-credential-project"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NO_PROJECT") },
  CAPTURE_CREDENTIAL_NO_SECRET: { check: "C-105.6", where: at("credentialSupply", "is-credential-secret"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NO_SECRET") },
  CAPTURE_CREDENTIAL_NOT_PERMITTED: { check: "C-105.7", where: at("#r63Refusal", "is-credential-permitted"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NOT_PERMITTED") },
  CAPTURE_CREDENTIAL_NO_KEY: { check: "C-105.8", where: at("credentialSupply", "is-credential-key-bound"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NO_KEY") },
  CAPTURE_CREDENTIAL_NO_SUCH: { check: "C-105.9", where: at("credentialWithdraw", "is-credential-seen"),
    translation: word("refusal.CAPTURE_CREDENTIAL_NO_SUCH") },
  CAPTURE_CREDENTIAL_SUPPLY_FAILED: { check: "C-105.10", where: at("credentialSupply", "is-credential-stored"),
    translation: word("refusal.CAPTURE_CREDENTIAL_SUPPLY_FAILED") },
  CAPTURE_CREDENTIAL_WITHDRAW_FAILED: { check: "C-105.11", where: at("credentialWithdraw", "is-credential-withdrawn"),
    translation: word("refusal.CAPTURE_CREDENTIAL_WITHDRAW_FAILED") },
  CAPTURE_CREDENTIAL_OWN_HOST: { check: "C-105.12", where: at("credentialSupply", "is-credential-host-foreign"),
    translation: word("refusal.CAPTURE_CREDENTIAL_OWN_HOST") },
});

/* R58 (N189): the listing's page, a chosen ceiling as membership's (its R48, R82): the caller's to lower, never raise. */
export const CREDENTIAL_LIST_LIMIT = 200;

export const CAPTURE_CREDENTIALS_SCHEMA = `CREATE TABLE IF NOT EXISTS ${CREDENTIALS_TABLE} (
  credential_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  host TEXT NOT NULL,
  scope TEXT NOT NULL,
  project TEXT,
  supplied_by TEXT NOT NULL,
  supplied_at TEXT NOT NULL,
  iv TEXT,
  ciphertext TEXT,
  withdrawn_at TEXT,
  withdrawn_by TEXT
)`;

function refusal(code, detail) {
  const row = CAPTURE_CREDENTIAL_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
}

/* A bare host name: dot-separated labels of letters, digits and inner hyphens, 253 characters at most. */
const HOST_NAME = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
export function hostNameOf(host) {
  if (typeof host !== "string") return null;
  const h = host.toLowerCase();
  return HOST_NAME.test(h) ? h : null;
}

/* The member a plane principal names (R56): `<id>`, `member:<id>`, or a member's own AI credential,
   `member:<id>/<token>`. A machine class or an organisation's credential names no member. */
export function principalMember(principal) {
  if (typeof principal !== "string" || principal === "") return null;
  const m = /^(?:member:)?([a-z0-9][a-z0-9-]{1,40})(?:\/.+)?$/.exec(principal);
  if (!m || (!principal.startsWith("member:") && principal.includes("/"))) return null;
  return m[1];
}

/* R72: the member id a stamp names. The door stamps `by` and `viewer` as the session's viewer form (`member:<id>`, with a
   carried project when the viewer has one; the founder's own `admin`), read through membership's one spelling
   (`positionalMember`, `member-roster` R73's). A bare member id, as a direct call gives, names that member; a machine
   credential (`class:<cls>`, with or without a token) and anything else names none, which `#active` then refuses. The
   listing's `viewer` is a viewer spelling only, so a bare id there names none (R58). */
const MACHINE_STAMP = /^class:/;
function memberOfStamp(members, stamp, { bare = true } = {}) {
  if (typeof stamp !== "string" || stamp === "") return null;
  if (stamp === "admin") return "admin";
  const named = members.positionalMember(stamp);
  if (named) return named;
  return !bare || MACHINE_STAMP.test(stamp) || stamp.startsWith("member:") || stamp.includes("@") ? null : stamp;
}
const viewerOf = (memberId) => (memberId === "admin" ? "admin" : `member:${memberId}`);

const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const utf8 = (s) => new TextEncoder().encode(s);
const stamp = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

const OF = new WeakMap();

/** The one credentials store of a Durable Object's storage (the K61 pattern). `key` is the instance's
 *  secret (`env.CAPTURE_CREDENTIALS_KEY`); `record`, `membership` and `now` let a test pass its own. Read on
 *  the first call only. `ownHosts` (R65: the group's own hosts, the composition root's to build) is taken on any
 *  call that passes a list, so a caller reaching the store before the composition root does cannot leave it without
 *  the list; with none ever passed, R55's and R56's own-host arm refuses nothing (fail-open, F16 low). */
export function credentialsOf(ctx, { key = null, record = null, membership = null, now = null, ownHosts = undefined } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = OF.get(storage);
  if (!c) {
    c = new CaptureCredentials({ sql: storage.sql, core: record ?? recordOf(ctx), members: membership ?? membershipOf(ctx),
                                 key, now });
    OF.set(storage, c);
  }
  if (Array.isArray(ownHosts)) c.setOwnHosts(ownHosts);
  return c;
}

export class CaptureCredentials {
  #sql; #core; #members; #secret; #key = null; #now; #ownHosts = [];

  constructor({ sql, core, members, key = null, now = null, ownHosts = [] }) {
    this.setOwnHosts(ownHosts);
    this.#sql = sql;
    this.#core = core;
    this.#members = members;
    this.#secret = typeof key === "string" && key !== "" ? key : null;
    this.#now = typeof now === "function" ? now : () => Date.now();
    this.migrate();
    /* R63: `member` and `group` credentials are exempt from purge; `project` ones are keyed to their project
       and cleared with its purge, and by the whole-store form only where the scope is `project`. R61 (N577): the
       table is declared with its classes (record-core R21), `export: "never"`, so corpus-export names it and carries
       no row, the ciphertext included; `sight` stays `bundle`, as the keyed default answered. A second store over the
       same storage is refused `TABLE_DECLARED` and changes nothing, the table being this module's already. */
    this.#core.declareTable("capture-sources", [{ name: CREDENTIALS_TABLE, keys: ["project"], whole: "scope='project'",
      purge: "clear", expunge: "none", export: "never", sight: "bundle", derive: "stored", version_chain: false }]);
    /* R63, N123: registered at start with membership's revocation notice (its R79). The listener runs inside the
       revoking act, in its transaction; a refused registration (this storage's store already holds it) changes
       nothing, since the one registered writes the same table. */
    if (typeof this.#members.onRevoked === "function")
      this.#members.onRevoked("capture-sources", ({ memberId } = {}) => this.#withdrawRevoked(memberId));
  }

  /** R65: the group's own hosts this store refuses (R55) and never answers for (R56). A copy of the list's strings;
   *  anything else leaves the list empty. */
  setOwnHosts(ownHosts) {
    this.#ownHosts = Array.isArray(ownHosts) ? Object.freeze(ownHosts.filter((h) => typeof h === "string")) : [];
  }

  /** The table, created when absent; idempotent. */
  migrate() {
    this.#sql.exec(CAPTURE_CREDENTIALS_SCHEMA);
    this.#sql.exec(`CREATE INDEX IF NOT EXISTS ${CREDENTIALS_TABLE}_host ON ${CREDENTIALS_TABLE}(host, withdrawn_at)`);
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- the key ---- */

  async #aesKey() {
    if (!this.#secret) return null;
    if (!this.#key) {
      const base = await crypto.subtle.importKey("raw", utf8(this.#secret), "HKDF", false, ["deriveKey"]);
      this.#key = await crypto.subtle.deriveKey(
        { name: "HKDF", hash: "SHA-256", salt: utf8("civicos capture-sources"), info: utf8("capture credentials v1") },
        base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    }
    return this.#key;
  }

  static #aad(id, scope, project) { return utf8(JSON.stringify([id, scope, project ?? null])); }

  /* ---- who is who (membership) ---- */

  #active(memberId) {
    const f = typeof memberId === "string" && memberId !== "" ? this.#members.memberFacts(memberId) : null;
    return !!f && f.status === "active";
  }

  /* R58: may this member (by id) see this row? The listing asks the same rule in its SQL (`#visibleClause`). An
     administrator (the founder included) sees every `member` and `group` row, and a `project` row, as anyone does, only
     at FULL sight of its project: a hidden project's credentials and their suppliers are its contents (D54, K2408). */
  #sees(memberId, row) {
    if (typeof memberId !== "string" || memberId === "") return false;
    const admin = this.#members.isAdministrator(memberId);
    if (!admin && !this.#active(memberId)) return false;
    if (row.scope === "member") return admin || row.supplied_by === memberId;
    if (row.scope === "project") return this.#members.sight(row.project, viewerOf(memberId)) === "full";
    return row.scope === "group";
  }

  /* R63: who may supply at a scope (`row` null) or withdraw a row, decided here alone, so that
     `CAPTURE_CREDENTIAL_NOT_PERMITTED` is minted at one site (K231). Answers the refusal, or null. */
  #r63Refusal(by, { scope, project, row = null }) {
    /* DEC-49 REGION is-credential-permitted */
    if (row === null) {
      /* `member`: the supplier's own; `group`: any active member (R55 asked it first); `project`: its editors. */
      if (scope === "project" && !this.#members.isProjectEditor(project, by))
        return refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", localize("capture-sources.credentials.only_an_editor_of_the_project", "only an editor of the project may supply a credential for it"));
      return null;
    }
    if (row.supplied_by === by) return null;
    if (row.scope === "project")
      return this.#members.isProjectOwner(row.project, by) ? null
        : refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", localize("capture-sources.credentials.only_its_supplier_or_an_owner", "only its supplier or an owner of its project may withdraw a project credential"));
    return this.#members.isAdministrator(by) ? null
      : refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", localize("capture-sources.credentials.only_its_supplier_or_an", "only its supplier or an administrator may withdraw a {scope} credential", { scope: String(row.scope) }));
    /* END DEC-49 REGION is-credential-permitted */
  }

  /* ---- the listing entry (R58): never the secret, any part of it, its length or a digest ---- */

  static #entry(r) {
    return { credential: r.credential_id, kind: r.kind, host: r.host, scope: r.scope, project: r.project ?? null,
             supplied_by: r.supplied_by, supplied_at: r.supplied_at,
             withdrawn_at: r.withdrawn_at ?? null, withdrawn_by: r.withdrawn_by ?? null };
  }

  /* R57's destruction: the ciphertext and its IV go; the secretless entry stays. */
  #destroy(id, by) {
    const at = stamp(this.#now());
    this.#sql.exec(`UPDATE ${CREDENTIALS_TABLE} SET ciphertext=NULL, iv=NULL, withdrawn_at=?, withdrawn_by=?
                    WHERE credential_id=? AND withdrawn_at IS NULL`, at, by, id);
    return at;
  }

  /* R63, N123: a revoked member's own credentials, withdrawn by the revocation, their ciphertext destroyed: the notice's
     listener (inside the revoking act), and a read meeting a supplier revoked before the registration. One UPDATE
     over one supplier's rows; `project` and `group` credentials stay. */
  #withdrawRevoked(memberId) {
    if (typeof memberId !== "string" || memberId === "") return;
    this.#sql.exec(`UPDATE ${CREDENTIALS_TABLE} SET ciphertext=NULL, iv=NULL, withdrawn_at=?, withdrawn_by=?
                    WHERE scope='member' AND supplied_by=? AND withdrawn_at IS NULL`, stamp(this.#now()), REVOCATION, memberId);
  }

  /* R63, K159: every read meets the rows it reads here first. A `member` credential whose supplier is no longer
     an active member is withdrawn by the revocation now, its ciphertext destroyed. Answers the rows as they now
     stand. */
  #sweep(rows) {
    const out = [];
    for (const r of rows) {
      if (r.scope === "member" && r.withdrawn_at == null && !this.#active(r.supplied_by)) {
        const at = this.#destroy(r.credential_id, REVOCATION);
        out.push({ ...r, ciphertext: null, iv: null, withdrawn_at: at, withdrawn_by: REVOCATION });
      } else out.push(r);
    }
    return out;
  }

  /* ================= R55: supply ================= */

  /** Stores a credential under its declared scope and answers its listing entry, never the secret. */
  async credentialSupply(args) {
    const { kind, host, secret, scope, project, by: stamped } = args && typeof args === "object" ? args : {};
    try {
      const by = memberOfStamp(this.#members, stamped);
      /* DEC-49 REGION is-credential-supplier-member */
      if (!this.#active(by))
        return refusal("CAPTURE_CREDENTIAL_NOT_A_MEMBER", localize("capture-sources.credentials.the_supplier_named_is_not", "the supplier named is not an active member of your team"));
      /* END DEC-49 REGION is-credential-supplier-member */
      /* DEC-49 REGION is-credential-kind */
      if (!CREDENTIAL_KINDS.includes(kind))
        return refusal("CAPTURE_CREDENTIAL_BAD_KIND", localize("capture-sources.credentials.the_kind_given_is_not", "the kind given is not one of {CREDENTIAL_KINDS}", { CREDENTIAL_KINDS: String(CREDENTIAL_KINDS.join(", ")) }));
      /* END DEC-49 REGION is-credential-kind */
      const h = hostNameOf(host);
      /* DEC-49 REGION is-credential-host */
      if (!h)
        return refusal("CAPTURE_CREDENTIAL_BAD_HOST",
          localize("capture-sources.credentials.the_host_given_is_not_a", "the host given is not a bare host name (a credential is for the one host the source that refused is served from)"));
      /* END DEC-49 REGION is-credential-host */
      /* DEC-49 REGION is-credential-host-foreign */
      /* F16 (R55, R65): a credential for one of the group's own hosts would be handed to the group's own Civicsmith
         or a fleet member by a capture; refused, nothing written. */
      if (isOwnHost(h, this.#ownHosts))
        return refusal("CAPTURE_CREDENTIAL_OWN_HOST",
          localize("capture-sources.credentials.the_host_given_is_one", "the host given is one of your team's own (where your team's Civicsmith or its fleet is reached), and a credential is never for one of them"));
      /* END DEC-49 REGION is-credential-host-foreign */
      const given = project !== undefined && project !== null;
      /* DEC-49 REGION is-credential-scope */
      if (!CREDENTIAL_SCOPES.includes(scope) || (given && scope !== "project"))
        return refusal("CAPTURE_CREDENTIAL_BAD_SCOPE", given && CREDENTIAL_SCOPES.includes(scope)
          ? localize("capture-sources.credentials.a_scope_credential_names_no", "a {scope} credential names no project", { scope: String(scope) }) : localize("capture-sources.credentials.the_scope_given_is_not", "the scope given is not one of {CREDENTIAL_SCOPES}", { CREDENTIAL_SCOPES: String(CREDENTIAL_SCOPES.join(", ")) }));
      /* END DEC-49 REGION is-credential-scope */
      if (scope === "project") {
        const b = typeof project === "string" && project !== "" ? this.#core.bundleInfo(project) : null;
        /* DEC-49 REGION is-credential-project */
        if (!b || b.type !== "project")
          return refusal("CAPTURE_CREDENTIAL_NO_PROJECT", localize("capture-sources.credentials.the_project_named_is_not", "the project named is not a project this record holds"));
        /* END DEC-49 REGION is-credential-project */
      }
      /* DEC-49 REGION is-credential-secret */
      if (typeof secret !== "string" || secret === "")
        return refusal("CAPTURE_CREDENTIAL_NO_SECRET", localize("capture-sources.credentials.no_secret_was_given", "no secret was given"));
      /* END DEC-49 REGION is-credential-secret */
      const denied = this.#r63Refusal(by, { scope, project });
      if (denied) return denied;
      const key = await this.#aesKey();
      /* DEC-49 REGION is-credential-key-bound */
      if (!key)
        return refusal("CAPTURE_CREDENTIAL_NO_KEY", localize("capture-sources.credentials.no_encryption_key_is_set", "no encryption key is set for your team's Civicsmith, so nothing is stored in the clear"));
      /* END DEC-49 REGION is-credential-key-bound */
      return await this.#store({ kind, h, secret, scope, project, by, key });
    } catch {
      /* DEC-49 REGION is-credential-stored */
      /* Every check passed and the encryption or the write failed (`#store`): the transaction left nothing written.
         Never the error's own words, which could carry what was passed. */
      return refusal("CAPTURE_CREDENTIAL_SUPPLY_FAILED",
        localize("capture-sources.credentials.the_credential_could_not_be", "the credential could not be encrypted and stored, so nothing was written"));
      /* END DEC-49 REGION is-credential-stored */
    }
  }

  /* R55: the encryption and the write, once every check has passed. Any failure here is `SUPPLY_FAILED`'s one
     condition, minted in `credentialSupply`'s catch, and the transaction leaves nothing written. */
  async #store({ kind, h, secret, scope, project, by, key }) {
    const id = `CRED-${b64(crypto.getRandomValues(new Uint8Array(12))).replace(/[+/=]/g, "").slice(0, 16)}`;
    const proj = scope === "project" ? project : null;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: CaptureCredentials.#aad(id, scope, proj) }, key, utf8(secret)));
    const at = stamp(this.#now());
    this.#core.transact(() => {
      this.#sql.exec(`INSERT INTO ${CREDENTIALS_TABLE} (credential_id, kind, host, scope, project, supplied_by, supplied_at, iv, ciphertext)
                      VALUES (?,?,?,?,?,?,?,?,?)`, id, kind, h, scope, proj, by, at, b64(iv), b64(ct));
    });
    return { ok: true, credential: CaptureCredentials.#entry({ credential_id: id, kind, host: h, scope, project: proj,
                                                                supplied_by: by, supplied_at: at }) };
  }

  /* ================= R56: the one read for a fetch ================= */

  /** At most one unwithdrawn credential for a fetch to `host`, for a request with plane principal
   *  `principalPlane` and target inquiry `target`: the narrowest admitted scope, then the newest. In process
   *  only; never an op. */
  async credentialsForFetch(args) {
    const { host, principalPlane, target } = args && typeof args === "object" ? args : {};
    const none = (reason) => ({ credentials: [], reason });
    try {
      const h = hostNameOf(host);
      if (!h) return none(localize("capture-sources.credentials.the_fetch_names_no_host", "the fetch names no host a credential can be for, so it goes without credentials"));
      /* F16 (R56, R65): never answered for one of the group's own hosts, one supplied before R55 refused them included. */
      if (isOwnHost(h, this.#ownHosts))
        return none(localize("capture-sources.credentials.capture_credential_own_host_h", "CAPTURE_CREDENTIAL_OWN_HOST: {h} is one of your team's own hosts, so no credential is used for it and the fetch goes without credentials", { h: String(h) }));
      /* A `member` credential is admitted only for its own supplier's request, so the one supplier whose revocation
         could leave such a row unwithdrawn is the requester: met here (R63), then never answered. */
      let who = principalMember(principalPlane);
      if (who !== null && !this.#active(who)) { this.#withdrawRevoked(who); who = null; }
      const info = typeof target === "string" && target !== "" ? this.#core.bundleInfo(target) : null;
      const targetProject = info && typeof info.project === "string" && info.project !== "" ? info.project : null;
      /* The admitted scopes, narrowest first, then the newest supplied: the one row answered (N189: bounded). */
      const r = this.#one(`SELECT * FROM ${CREDENTIALS_TABLE}
                            WHERE host=? AND withdrawn_at IS NULL
                              AND ((scope='member' AND supplied_by=?) OR (scope='project' AND project=?) OR scope='group')
                            ORDER BY CASE scope WHEN 'member' THEN 0 WHEN 'project' THEN 1 ELSE 2 END,
                                     supplied_at DESC, rowid DESC
                            LIMIT 1`, h, who, targetProject);
      if (!r)
        return none(word("capture-sources.none.credential_supplied_admitted", { h: String(h) }));
      const key = await this.#aesKey();
      if (!key)
        return none(localize("capture-sources.credentials.capture_credential_no_key_no", "CAPTURE_CREDENTIAL_NO_KEY: no encryption key is set for your team's Civicsmith, so no credential is used and the source's refusal stands"));
      let secret;
      try {
        const pt = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: unb64(r.iv), additionalData: CaptureCredentials.#aad(r.credential_id, r.scope, r.project) },
          key, unb64(r.ciphertext));
        secret = new TextDecoder("utf-8", { fatal: true }).decode(pt);
      } catch {
        return none(word("capture-sources.none.credential_will_decrypt", { credential_id: String(r.credential_id) }));
      }
      return { credentials: [{ credential: r.credential_id, kind: r.kind, secret, supplied_by: r.supplied_by,
                               scope: r.scope, project: r.project ?? null }], reason: null };
    } catch {
      return none(word("capture-sources.none.credentials_read_fetch"));
    }
  }

  /* ================= R57: withdrawal ================= */

  /** Withdraws a credential: R56 never answers it again, its ciphertext is destroyed now, and its secretless
   *  entry stays with `withdrawn_at` and `withdrawn_by`. */
  async credentialWithdraw(args) {
    const { credential, by: stamped } = args && typeof args === "object" ? args : {};
    try {
      const by = memberOfStamp(this.#members, stamped);
      const found = typeof credential === "string" && credential !== ""
        ? this.#one(`SELECT * FROM ${CREDENTIALS_TABLE} WHERE credential_id=?`, credential) : null;
      /* An unknown id and one `by` may not see are one condition, answered alike (R57, R58). */
      /* DEC-49 REGION is-credential-seen */
      if (!found || !this.#sees(by, found))
        return refusal("CAPTURE_CREDENTIAL_NO_SUCH", localize("capture-sources.credentials.no_credential_by_that_id", "no credential by that id is visible to this member"));
      /* END DEC-49 REGION is-credential-seen */
      const [row] = this.#sweep([found]);
      const denied = this.#r63Refusal(by, { row });
      if (denied) return denied;
      if (row.withdrawn_at != null) return { ok: true, already: true, withdrawn: CaptureCredentials.#entry(row) };
      const at = this.#core.transact(() => this.#destroy(row.credential_id, by));
      return { ok: true, already: false, withdrawn: CaptureCredentials.#entry({ ...row, withdrawn_at: at, withdrawn_by: by }) };
    } catch {
      /* DEC-49 REGION is-credential-withdrawn */
      /* The read or the withdrawal's write failed: the transaction changed nothing. Never the error's own words. */
      return refusal("CAPTURE_CREDENTIAL_WITHDRAW_FAILED",
        localize("capture-sources.credentials.the_credential_could_not_be_read", "the credential could not be read or withdrawn, so nothing was changed"));
      /* END DEC-49 REGION is-credential-withdrawn */
    }
  }

  /* ================= R58: the listing ================= */

  /* R58's visibility as SQL over the alias `c`, so the listing's cut falls on what the viewer sees: an administrator
     (the founder included) every `member` row, an active member their own; every such viewer the `group` rows; and a
     `project` row whose project membership's one rule of sight (its R43, `viewerPredicate`, R44's FULL for a project)
     admits them to, joined on record-core's `bundles` by its read contract (R37: `bundle_id`, `object_type`). That rule
     admits an administrator to a hidden project only as a participant (D54, K2408), so the same arm serves both. Null:
     the viewer sees nothing. */
  #visibleClause(who) {
    const admin = this.#members.isAdministrator(who);
    if (!admin && (who === "admin" || !this.#active(who))) return null;
    const g = viewerPredicate(viewerOf(who));
    if (g.scope === "DENY") return null;
    const own = admin ? { sql: "c.scope='member'", args: [] } : { sql: "(c.scope='member' AND c.supplied_by=?)", args: [who] };
    return { sql: `(${own.sql} OR c.scope='group'
                    OR (c.scope='project' AND EXISTS (SELECT 1 FROM bundles b
                         WHERE b.bundle_id = c.project AND b.object_type = 'project' AND ${g.sql})))`,
             args: [...own.args, ...g.args] };
  }

  /** The credentials `viewer` may see, filtered by `scope` and `project` when given: the first `limit` in the order
   *  supplied (`CREDENTIAL_LIST_LIMIT`, the caller's to lower, never raise), `truncated` measured by reading one row
   *  past it. Never the secret. */
  credentialList(args) {
    const { viewer, scope, project, limit } = args && typeof args === "object" ? args : {};
    const cap = Math.max(1, Math.min(Math.floor(Number(limit)) || CREDENTIAL_LIST_LIMIT, CREDENTIAL_LIST_LIMIT));
    const empty = { entries: [], limit: cap, truncated: false };
    try {
      const who = memberOfStamp(this.#members, viewer, { bare: false });
      if (!who) return empty;
      const vis = this.#visibleClause(who);
      if (!vis) return empty;
      const where = [vis.sql];
      const params = [...vis.args];
      if (scope !== undefined && scope !== null) { where.push("c.scope=?"); params.push(scope); }
      if (project !== undefined && project !== null) { where.push("c.project=?"); params.push(project); }
      const found = this.#sweep(this.#rows(`SELECT c.* FROM ${CREDENTIALS_TABLE} c WHERE ${where.join(" AND ")}
                                            ORDER BY c.supplied_at, c.rowid LIMIT ?`, ...params, cap + 1));
      const truncated = found.length > cap;
      return { entries: (truncated ? found.slice(0, cap) : found).map((r) => CaptureCredentials.#entry(r)), limit: cap, truncated };
    } catch {
      return empty;
    }
  }
}
