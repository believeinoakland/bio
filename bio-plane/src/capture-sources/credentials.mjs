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
 * BOUNDED READS (N189). `credentialsForFetch` reads the one admitted row, its scope rule and order in the SQL
 * (`LIMIT 1`); `credentialList` reads at most `limit` + 1 of the rows the viewer may see, its visibility in the SQL
 * (membership's `viewerPredicate`, R43, for a project's), and publishes the cut. */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";

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
    translation: "Only an active member may supply a credential." },
  CAPTURE_CREDENTIAL_BAD_KIND: { check: "C-105.2", where: at("credentialSupply", "is-credential-kind"),
    translation: "A credential's kind is one of login, user-agent or other." },
  CAPTURE_CREDENTIAL_BAD_HOST: { check: "C-105.3", where: at("credentialSupply", "is-credential-host"),
    translation: "A credential is for one host, named as a bare host name: no scheme, path, port or user part." },
  CAPTURE_CREDENTIAL_BAD_SCOPE: { check: "C-105.4", where: at("credentialSupply", "is-credential-scope"),
    translation: "A credential's scope is member, project or group, and only a project-scoped credential names a project." },
  CAPTURE_CREDENTIAL_NO_PROJECT: { check: "C-105.5", where: at("credentialSupply", "is-credential-project"),
    translation: "A project-scoped credential names a project the record holds." },
  CAPTURE_CREDENTIAL_NO_SECRET: { check: "C-105.6", where: at("credentialSupply", "is-credential-secret"),
    translation: "A credential carries a non-empty secret: the login, setting or other value the site asked for." },
  CAPTURE_CREDENTIAL_NOT_PERMITTED: { check: "C-105.7", where: at("#r63Refusal", "is-credential-permitted"),
    translation: "This member may not supply or withdraw a credential at that scope." },
  CAPTURE_CREDENTIAL_NO_KEY: { check: "C-105.8", where: at("credentialSupply", "is-credential-key-bound"),
    translation: "No encryption key is bound to this instance, so no credential is stored or used." },
  CAPTURE_CREDENTIAL_NO_SUCH: { check: "C-105.9", where: at("credentialWithdraw", "is-credential-seen"),
    translation: "No credential by that id is visible to you here. One that does not exist and one you may not see are "
      + "answered alike, so this is not a hint either way." },
  CAPTURE_CREDENTIAL_SUPPLY_FAILED: { check: "C-105.10", where: at("credentialSupply", "is-credential-stored"),
    translation: "The credential could not be encrypted and stored, so nothing was written. Nothing you entered is "
      + "repeated here; try again, and if it keeps failing tell an administrator." },
  CAPTURE_CREDENTIAL_WITHDRAW_FAILED: { check: "C-105.11", where: at("credentialWithdraw", "is-credential-withdrawn"),
    translation: "The credential could not be read or withdrawn just now, so nothing was changed. Try again, and if it "
      + "keeps failing tell an administrator." },
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

/* The member a viewer names (R58): `member:<id>`, or the founder's `admin`. */
const viewerMember = (viewer) => (viewer === "admin" ? "admin"
  : typeof viewer === "string" && /^member:[a-z0-9][a-z0-9-]{1,40}$/.test(viewer) ? viewer.slice(7) : null);
const viewerOf = (memberId) => (memberId === "admin" ? "admin" : `member:${memberId}`);

const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const utf8 = (s) => new TextEncoder().encode(s);
const stamp = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

const OF = new WeakMap();

/** The one credentials store of a Durable Object's storage (the K61 pattern). `key` is the instance's
 *  secret (`env.CAPTURE_CREDENTIALS_KEY`); `record`, `membership` and `now` let a test pass its own. Read on
 *  the first call only. */
export function credentialsOf(ctx, { key = null, record = null, membership = null, now = null } = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = OF.get(storage);
  if (!c) {
    c = new CaptureCredentials({ sql: storage.sql, core: record ?? recordOf(ctx), members: membership ?? membershipOf(ctx),
                                 key, now });
    OF.set(storage, c);
  }
  return c;
}

export class CaptureCredentials {
  #sql; #core; #members; #secret; #key = null; #now;

  constructor({ sql, core, members, key = null, now = null }) {
    this.#sql = sql;
    this.#core = core;
    this.#members = members;
    this.#secret = typeof key === "string" && key !== "" ? key : null;
    this.#now = typeof now === "function" ? now : () => Date.now();
    this.migrate();
    /* R63: `member` and `group` credentials are exempt from purge; `project` ones are keyed to their project
       and cleared with its purge, and by the whole-store form only where the scope is `project`. */
    this.#core.declarePurge("capture-sources", [{ name: CREDENTIALS_TABLE, keys: ["project"], whole: "scope='project'" }]);
    /* R63, N123: registered at start with membership's revocation notice (its R79). The listener runs inside the
       revoking act, in its transaction; a refused registration (this storage's store already holds it) changes
       nothing, since the one registered writes the same table. */
    if (typeof this.#members.onRevoked === "function")
      this.#members.onRevoked("capture-sources", ({ memberId } = {}) => this.#withdrawRevoked(memberId));
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

  /* R58: may this member (by id) see this row? The listing asks the same rule in its SQL (`#visibleClause`). */
  #sees(memberId, row) {
    if (typeof memberId !== "string" || memberId === "") return false;
    if (this.#members.isAdministrator(memberId)) return true;
    if (!this.#active(memberId)) return false;
    if (row.scope === "member") return row.supplied_by === memberId;
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
        return refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", "only an editor of the project may supply a credential for it");
      return null;
    }
    if (row.supplied_by === by) return null;
    if (row.scope === "project")
      return this.#members.isProjectOwner(row.project, by) ? null
        : refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", "only its supplier or an owner of its project may withdraw a project credential");
    return this.#members.isAdministrator(by) ? null
      : refusal("CAPTURE_CREDENTIAL_NOT_PERMITTED", `only its supplier or an administrator may withdraw a ${row.scope} credential`);
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
    const { kind, host, secret, scope, project, by } = args && typeof args === "object" ? args : {};
    try {
      /* DEC-49 REGION is-credential-supplier-member */
      if (!this.#active(by))
        return refusal("CAPTURE_CREDENTIAL_NOT_A_MEMBER", "the supplier named is not an active member of this instance");
      /* END DEC-49 REGION is-credential-supplier-member */
      /* DEC-49 REGION is-credential-kind */
      if (!CREDENTIAL_KINDS.includes(kind))
        return refusal("CAPTURE_CREDENTIAL_BAD_KIND", `the kind given is not one of ${CREDENTIAL_KINDS.join(", ")}`);
      /* END DEC-49 REGION is-credential-kind */
      const h = hostNameOf(host);
      /* DEC-49 REGION is-credential-host */
      if (!h)
        return refusal("CAPTURE_CREDENTIAL_BAD_HOST",
          "the host given is not a bare host name (a credential is for the one host the source that refused is served from)");
      /* END DEC-49 REGION is-credential-host */
      const given = project !== undefined && project !== null;
      /* DEC-49 REGION is-credential-scope */
      if (!CREDENTIAL_SCOPES.includes(scope) || (given && scope !== "project"))
        return refusal("CAPTURE_CREDENTIAL_BAD_SCOPE", given && CREDENTIAL_SCOPES.includes(scope)
          ? `a ${scope} credential names no project` : `the scope given is not one of ${CREDENTIAL_SCOPES.join(", ")}`);
      /* END DEC-49 REGION is-credential-scope */
      if (scope === "project") {
        const b = typeof project === "string" && project !== "" ? this.#core.bundleInfo(project) : null;
        /* DEC-49 REGION is-credential-project */
        if (!b || b.type !== "project")
          return refusal("CAPTURE_CREDENTIAL_NO_PROJECT", "the project named is not a project this record holds");
        /* END DEC-49 REGION is-credential-project */
      }
      /* DEC-49 REGION is-credential-secret */
      if (typeof secret !== "string" || secret === "")
        return refusal("CAPTURE_CREDENTIAL_NO_SECRET", "no secret was given");
      /* END DEC-49 REGION is-credential-secret */
      const denied = this.#r63Refusal(by, { scope, project });
      if (denied) return denied;
      const key = await this.#aesKey();
      /* DEC-49 REGION is-credential-key-bound */
      if (!key)
        return refusal("CAPTURE_CREDENTIAL_NO_KEY", "no encryption key is bound to this instance, so nothing is stored in the clear");
      /* END DEC-49 REGION is-credential-key-bound */
      return await this.#store({ kind, h, secret, scope, project, by, key });
    } catch {
      /* DEC-49 REGION is-credential-stored */
      /* Every check passed and the encryption or the write failed (`#store`): the transaction left nothing written.
         Never the error's own words, which could carry what was passed. */
      return refusal("CAPTURE_CREDENTIAL_SUPPLY_FAILED",
        "the credential could not be encrypted and stored, so nothing was written");
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
      if (!h) return none("the fetch names no host a credential can be for, so it goes without credentials");
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
        return none(`no credential supplied for ${h} is admitted for this request's scope, so the fetch goes without credentials and the source's refusal stands`);
      const key = await this.#aesKey();
      if (!key)
        return none("CAPTURE_CREDENTIAL_NO_KEY: no encryption key is bound to this instance, so no credential is used and the source's refusal stands");
      let secret;
      try {
        const pt = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: unb64(r.iv), additionalData: CaptureCredentials.#aad(r.credential_id, r.scope, r.project) },
          key, unb64(r.ciphertext));
        secret = new TextDecoder("utf-8", { fatal: true }).decode(pt);
      } catch {
        return none(`credential ${r.credential_id} will not decrypt under this instance's key, so the fetch goes without credentials and the source's refusal stands`);
      }
      return { credentials: [{ credential: r.credential_id, kind: r.kind, secret, supplied_by: r.supplied_by,
                               scope: r.scope, project: r.project ?? null }], reason: null };
    } catch {
      return none("the credentials could not be read, so the fetch goes without credentials and the source's refusal stands");
    }
  }

  /* ================= R57: withdrawal ================= */

  /** Withdraws a credential: R56 never answers it again, its ciphertext is destroyed now, and its secretless
   *  entry stays with `withdrawn_at` and `withdrawn_by`. */
  async credentialWithdraw(args) {
    const { credential, by } = args && typeof args === "object" ? args : {};
    try {
      const found = typeof credential === "string" && credential !== ""
        ? this.#one(`SELECT * FROM ${CREDENTIALS_TABLE} WHERE credential_id=?`, credential) : null;
      /* An unknown id and one `by` may not see are one condition, answered alike (R57, R58). */
      /* DEC-49 REGION is-credential-seen */
      if (!found || !this.#sees(by, found))
        return refusal("CAPTURE_CREDENTIAL_NO_SUCH", "no credential by that id is visible to this member");
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
        "the credential could not be read or withdrawn, so nothing was changed");
      /* END DEC-49 REGION is-credential-withdrawn */
    }
  }

  /* ================= R58: the listing ================= */

  /* R58's visibility as SQL over the alias `c`, so the listing's cut falls on what the viewer sees: an administrator
     every row; an active member their own `member` rows, the `group` rows, and a `project` row whose project
     membership's one rule of sight (its R43, `viewerPredicate`, R44's FULL for a project) admits them to, joined on
     record-core's `bundles` by its read contract (R37: `bundle_id`, `object_type`). Null: the viewer sees nothing. */
  #visibleClause(who) {
    if (this.#members.isAdministrator(who)) return { sql: "1=1", args: [] };
    if (who === "admin" || !this.#active(who)) return null;
    const g = viewerPredicate(viewerOf(who));
    if (g.scope === "DENY") return null;
    return { sql: `((c.scope='member' AND c.supplied_by=?) OR c.scope='group'
                    OR (c.scope='project' AND EXISTS (SELECT 1 FROM bundles b
                         WHERE b.bundle_id = c.project AND b.object_type = 'project' AND ${g.sql})))`,
             args: [who, ...g.args] };
  }

  /** The credentials `viewer` may see, filtered by `scope` and `project` when given: the first `limit` in the order
   *  supplied (`CREDENTIAL_LIST_LIMIT`, the caller's to lower, never raise), `truncated` measured by reading one row
   *  past it. Never the secret. */
  credentialList(args) {
    const { viewer, scope, project, limit } = args && typeof args === "object" ? args : {};
    const cap = Math.max(1, Math.min(Math.floor(Number(limit)) || CREDENTIAL_LIST_LIMIT, CREDENTIAL_LIST_LIMIT));
    const empty = { entries: [], limit: cap, truncated: false };
    try {
      const who = viewerMember(viewer);
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
