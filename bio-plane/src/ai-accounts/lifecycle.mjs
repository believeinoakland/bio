/* ai-accounts' life with its neighbours (R27, R28, R59, R72, R77): the listeners on membership's two notices (a member
 * revoked, a member removed from a project), the notices this module offers and `notice-producers` raises (an account that
 * left a list, a project's sign-in account that ended), and `migrate`, which creates the tables, carries the history, and
 * converts today's rows (a member's key, a connected subscription, the team's key, a project's key) into accounts of the
 * T53 model in one transaction, idempotently. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { AiAccountsServing } from "./serving.mjs";
import { AiAccountsBase } from "./base.mjs";
import { AiAccountsAccounts } from "./accounts.mjs";
import { AiAccountsLimits } from "./limits.mjs";
import { AI_ACCOUNTS_SCHEMA, AI_ACCOUNTS_LEGACY_TABLES, AI_ACCOUNTS_ADDITIVE_COLUMNS, AI_ACCOUNTS_TABLES, AI_ACCOUNTS_MIXED_TABLES,
  AI_ACCOUNTS_PROJECT_TABLES, AI_ACCOUNTS_HISTORY_TABLE } from "./schema.mjs";
import { USE_SWITCHES } from "./constants.mjs";

const M = AiAccountsBase;
const A = AiAccountsAccounts;

/* R59: the provider every pre-T53 account is of; Claude was the only one. */
const MIGRATED_PROVIDER = "anthropic";

export class AiAccountsLifecycle extends AiAccountsServing {
  /* ===== the seam with membership ===== */

  /* R27, R77: one listener on membership's revocation notice (its R79) and one on its project-left notice (its R158, T53).
     Membership ignores a listener's answer and survives its throw; each is registered once (a second registration is
     refused through membership's R81, so `start` is idempotent through `aiAccountsOf`). */
  start() {
    const revoked = this.membership.onRevoked("ai-accounts", (notice) => this._memberRevoked(notice));
    const left = typeof this.membership.onProjectLeft === "function"
      ? this.membership.onProjectLeft("ai-accounts", (notice) => this._projectLeft(notice)) : null;
    return { revoked, left };
  }

  /* R27: a revoked member's accounts, tokens, opt-ins and places in other owners' lists are cleared in the revoking act, each a
     change (R16) told through R26 with `why: "revoked"`; choice records (R47) stay as history. In the same act, by this one
     listener function, her placements are removed from every project's list exactly as R77 (2) removes them (the entries she
     placed that are not the project's own, and her own member account whoever placed it); the owners of each project, other
     than her, owed one notice (`accountNoticesFor`). */
  _memberRevoked({ memberId, by = null } = {}) {
    if (typeof memberId !== "string" || memberId === "") return;
    const at = this._at();
    this._removePlacements(memberId, null, by, at);
    for (const row of this._accountsOwnedBy(`member:${memberId}`)) this._dropAccount(row, by, "revoked", at);
  }

  /* R77 (2): a member who stops being a participant of a project (`why: "removed"`) loses her placements on that project's
     list in the same act; one who leaves, or whom an owner removes as an owner, calls this not at all (membership's R158). */
  _projectLeft({ memberId, projectId, by = null, why = null, at = null } = {}) {
    if (why !== "removed" || typeof memberId !== "string" || memberId === "" || typeof projectId !== "string" || projectId === "") return;
    this._removePlacements(memberId, [projectId], by, typeof at === "string" && at !== "" ? at : this._at());
  }

  /* ===== R72, R77, R59: the notices ===== */

  /* R72 `accountNoticesFor`: in-plane, for `notice-producers`: for each removal row (R16) of a list the viewer owns, `{kind:
     'left-list', key, account_id, provider, plan, list_owner, at}` (R72); for each placement removed from a project's list she
     owns, other than the member removed, `{kind: 'left-project-list', key, account_id, provider, plan, project, at}` (R77); and
     for each project sign-in account that ended, `{kind: 'signin-ended', key, project, at}` (R59), each with a stable key per
     row, never a secret, digest or key. `after` an instant: only rows after it. Writes nothing; never throws. */
  accountNoticesFor({ viewer = null, after = null, limit = null } = {}) {
    try {
      const id = M._memberOf(viewer);
      if (id === null || isMachineIdentity(viewer)) return [];
      const asked = Number(limit);
      const cap = Number.isFinite(asked) && asked > 0 ? Math.floor(asked) : 200;
      const out = [];
      const rows = this._rows(`SELECT seq, owner, at, change, detail FROM account_changes
                               WHERE change IN ('list_left','list_left_project','signin_ended') ORDER BY seq`);
      for (const r of rows) {
        if (typeof after === "string" && after !== "" && !(r.at > after)) continue;
        let d = {};
        try { d = r.detail ? JSON.parse(r.detail) : {}; } catch { d = {}; }
        const ownsProject = (p) => !this._unseen(p, `member:${id}`) && this._isOwner(p, id);
        if (r.change === "list_left") {
          const owns = r.owner.startsWith("project:") ? ownsProject(r.owner.slice(8)) : r.owner === `member:${id}`;
          if (owns) out.push({ kind: "left-list", key: `left-list|${r.seq}`, account_id: d.account_id, provider: d.provider, plan: d.plan, list_owner: r.owner, at: r.at });
        } else if (r.change === "list_left_project") {
          if (r.owner.startsWith("project:") && d.removed_member !== id && ownsProject(r.owner.slice(8)))
            out.push({ kind: "left-project-list", key: `left-project-list|${r.seq}`, account_id: d.account_id, provider: d.provider, plan: d.plan, project: r.owner.slice(8), at: r.at });
        } else if (r.owner.startsWith("project:") && ownsProject(r.owner.slice(8))) {
          out.push({ kind: "signin-ended", key: `signin-ended|${r.seq}`, project: r.owner.slice(8), member: d.member ?? null, at: r.at });
        }
        if (out.length >= cap) break;
      }
      return out;
    } catch { return []; }
  }

  /* ===== R28, R59: the tables and the conversion ===== */

  /* This module's tables, at every boot, idempotent: the additive columns an older store lacks, then every table and index
     created if absent, then the history carried from the tables that kept it, then today's rows converted into accounts (R59),
     then R28's declarations. Run by the host inside its boot, before credentials' own. Answers `{ok, converted, left}`: the
     number converted per kind and the rows of a kind it does not know, left in place and counted. */
  migrate() {
    const has = (t) => this._rows(`PRAGMA table_info(${t})`).length > 0;
    for (const [table, column, decl] of AI_ACCOUNTS_ADDITIVE_COLUMNS) {
      const have = this._rows(`PRAGMA table_info(${table})`).map((r) => r.name);
      if (have.length && !have.includes(column)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    const bare = AI_ACCOUNTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.sql.exec(t); }
    const legacy = AI_ACCOUNTS_LEGACY_TABLES.some(has);
    const result = legacy ? this._tx(() => { this._carryHistory(); return this._convert(has); })
      : { ok: true, converted: AiAccountsLifecycle._noCounts(), left: 0, deferred: 0 };
    this.declareTables();
    return result;
  }

  static _noCounts() {
    return { member_key: 0, member_signin: 0, team_key: 0, project_key: 0, project_signin_ended: 0, notices_seen: 0 };
  }

  /* R28, R29, through record-core's `declareTable` (its R21): every table declared explicitly with its classes. A refusal is
     thrown: a purge that silently cleared an account would end a member's assistant as a side effect of resetting the
     corpus, and an export that carried a key would publish it. */
  declareTables() {
    if (this._declared) return false;
    const answer = this.core.declareTable("ai-accounts",
      [...AI_ACCOUNTS_TABLES, ...AI_ACCOUNTS_MIXED_TABLES, ...AI_ACCOUNTS_PROJECT_TABLES, AI_ACCOUNTS_HISTORY_TABLE]
        .map((t) => ({ ...t, ...(t.keys ? { keys: [...t.keys] } : {}) })));
    if (answer && answer.ok === false)
      throw new Error(`ai-accounts: record-core refused its table declaration: ${answer.reason} (${answer.table})`);
    this._declared = true;
    return true;
  }
  _declared = false;

  /* R5's acts on the group key and R10's on a project's account, as R16 names them. */
  static _legacyChange(act, detail) {
    if (act === "set") return ["key_set", { kind: "apikey" }];
    if (act === "setkey") return ["key_set", { kind: "apikey" }];
    if (act === "setsignin") return ["signin_set", {}];
    if (act === "remove") return ["removed", {}];
    if (act === "switch") return ["switched", { on: detail === "on" }];
    const m = /^(?:switch|uses):(.+)$/.exec(act);
    if (m) return ["use_set", { switch: m[1], value: detail === "on" ? true : detail === "off" ? false : detail }];
    return [act, detail === null || detail === undefined ? {} : { detail }];
  }

  /* R16: the records kept before T41 not yet carried into `account_changes`, in the order made (instant, then the order each
     table kept them). A later boot finds none. */
  _carryHistory() {
    const have = (t) => this._rows(`PRAGMA table_info(${t})`).length > 0;
    const out = [];
    if (have("group_key_acts"))
      for (const r of this._rows(`SELECT seq, act, detail, actor, at FROM group_key_acts ORDER BY seq`))
        out.push({ owner: "group", at: r.at, by: r.actor, rank: 0, seq: r.seq, origin: `group_key_acts:${r.seq}`,
                   cd: AiAccountsLifecycle._legacyChange(r.act, r.detail) });
    if (have("project_account_acts"))
      for (const r of this._rows(`SELECT seq, project_id, act, detail, actor, at FROM project_account_acts ORDER BY seq`))
        out.push({ owner: M._ownerOfProject(r.project_id), at: r.at, by: r.actor, rank: 2, seq: r.seq,
                   origin: `project_account_acts:${r.seq}`, cd: AiAccountsLifecycle._legacyChange(r.act, r.detail) });
    const carried = new Set(this._rows(`SELECT origin FROM account_changes WHERE origin IS NOT NULL`).map((r) => r.origin));
    out.filter((x) => !carried.has(x.origin))
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.rank - b.rank || a.seq - b.seq))
      .forEach((x) => this._change(x.owner, x.cd[0], x.cd[1], x.by, x.origin, x.at));
  }

  /* R59 `migrate`'s conversion: in one transaction, idempotently, today's rows become accounts. A member's `apikey` reference
     becomes an account of provider anthropic, the catalogue's Anthropic API plan, means `sealed` (the same sealed bytes), on,
     alone in the member's list, entries the plan's catalogue entries in catalogue order. A `signin` account (a connected
     subscription with a held token) becomes plan `subscription`, means `issued`, member scope (token carried sealed); one with
     a connected fact and no held token becomes `held: false` and serves nothing. The team's key and each project's key become
     team and project accounts of that API plan, means `sealed`, with their switches and `on` kept. Project sign-in accounts are
     removed, each owner owed one notice (`accountNoticesFor`, `signin-ended`). Seen key notices become seen recipient notices
     for Anthropic's host. Switches, keep-away and history are kept. A row of a kind it does not know is left and counted, and
     so is a row whose plan or entries the catalogue cannot give yet (`deferred`), converted by a later boot. */
  _convert(has) {
    const counts = AiAccountsLifecycle._noCounts();
    let left = 0, deferred = 0;
    const api = this._migrationPlan("api");
    const sub = this._migrationPlan("subscription");
    const at = this._at();
    const uses = (r) => Object.fromEntries(USE_SWITCHES.map((k) => [k, r[M._USE_COLUMN[k]]]));
    const insert = (o) => {
      const id = this._nextAccountId();
      const cols = ["account_id", "owner", "project_id", "provider", "plan", "means", "entries", "is_on", "held", "sealed", "iv", "seal_owner",
        "held_since", "valid_until", "refused_at", "personal", "set_by", "set_at", ...USE_SWITCHES.map((k) => M._USE_COLUMN[k])];
      const vals = [id, o.owner, o.owner.startsWith("project:") ? o.owner.slice(8) : null, MIGRATED_PROVIDER, o.plan.plan_id ?? o.plan.id, o.means,
        JSON.stringify(o.entries), o.on ? 1 : 0, o.held ? 1 : 0, o.sealed ?? null, o.iv ?? null, o.seal_owner ?? null, o.held ? (o.since ?? at) : null,
        o.valid_until ?? null, o.refused_at ?? null, o.personal ? 1 : 0, o.set_by ?? null, o.set_at ?? at, ...USE_SWITCHES.map((k) => o.uses[k])];
      this.sql.exec(`INSERT INTO ai_accounts (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(",")})`, ...vals);
      this._listAppend(o.owner, id, null, at);
      this._change(o.owner, "account_set", { account_id: id, provider: MIGRATED_PROVIDER, plan: o.plan.plan_id ?? o.plan.id, means: o.means,
        entries: o.entries, migrated: true }, null, null, o.set_at ?? at);
      return id;
    };
    const readyApi = api && api.entries.length > 0;
    const readySub = sub && sub.entries.length > 0;

    if (has("account_references")) {
      for (const r of this._rows(`SELECT * FROM account_references ORDER BY member_id`)) {
        if (r.kind !== "apikey") { left++; continue; }
        if (!readyApi) { deferred++; continue; }
        insert({ owner: `member:${r.member_id}`, plan: api.plan, means: "sealed", entries: api.entries, on: true, held: true, sealed: r.sealed,
          iv: r.iv, set_by: r.member_id, set_at: r.set_at, since: r.set_at, uses: uses(r) });
        this.sql.exec(`DELETE FROM account_references WHERE member_id=?`, r.member_id);
        counts.member_key++;
      }
    }
    if (has("subscription_connections")) {
      for (const r of this._rows(`SELECT * FROM subscription_connections ORDER BY member_id`)) {
        if (!readySub) { deferred++; continue; }
        const held = !!r.sealed;
        const id = insert({ owner: `member:${r.member_id}`, plan: sub.plan, means: "issued", entries: sub.entries, on: true, held,
          sealed: r.sealed ?? null, iv: r.iv ?? null, valid_until: r.valid_until, refused_at: r.refused_at, personal: AiAccountsAccounts._isPersonalPlan(sub.plan),
          set_by: r.member_id, set_at: r.since, since: r.since, uses: uses(r) });
        if (AiAccountsAccounts._isPersonalPlan(sub.plan))
          this.sql.exec(`INSERT OR IGNORE INTO ai_personal_choices (account_id, member_id, plan, terms_version, chosen_at) VALUES (?,?,?,?,?)`,
            id, r.member_id, sub.plan.plan_id ?? sub.plan.id, sub.plan.terms_version ?? null, r.since);
        this.sql.exec(`DELETE FROM subscription_connections WHERE member_id=?`, r.member_id);
        counts.member_signin++;
      }
    }
    if (has("group_key")) {
      const g = this._one(`SELECT * FROM group_key WHERE id=1`);
      if (g && g.sealed) {
        if (!readyApi) deferred++;
        else {
          insert({ owner: "group", plan: api.plan, means: "sealed", entries: api.entries, on: !!g.is_on, held: true, sealed: g.sealed, iv: g.iv,
            seal_owner: "group-key:anthropic", set_by: g.set_by, set_at: g.set_at ?? at, since: g.set_at, uses: uses(g) });
          this.sql.exec(`DELETE FROM group_key WHERE id=1`);
          counts.team_key++;
        }
      } else if (g) this.sql.exec(`DELETE FROM group_key WHERE id=1`);
    }
    if (has("project_accounts")) {
      for (const r of this._rows(`SELECT * FROM project_accounts ORDER BY project_id`)) {
        if (r.kind === "signin") {
          this._change(M._ownerOfProject(r.project_id), "signin_ended", { member: r.member_id ?? null, project: r.project_id }, null, null, at);
          this.sql.exec(`DELETE FROM project_accounts WHERE project_id=?`, r.project_id);
          counts.project_signin_ended++;
        } else if (r.kind === "apikey") {
          if (!readyApi) { deferred++; continue; }
          insert({ owner: `project:${r.project_id}`, plan: api.plan, means: "sealed", entries: api.entries, on: !!r.is_on, held: true, sealed: r.sealed,
            iv: r.iv, set_by: r.set_by, set_at: r.set_at, since: r.set_at, uses: uses(r) });
          this.sql.exec(`DELETE FROM project_accounts WHERE project_id=?`, r.project_id);
          counts.project_key++;
        } else left++;
      }
    }
    /* seen key notices become seen recipient notices for Anthropic's host (R51) */
    if (api) {
      const seen = [];
      if (has("group_key_notices")) seen.push(...this._rows(`SELECT member_id, seen_at FROM group_key_notices`));
      if (has("project_key_notices")) seen.push(...this._rows(`SELECT member_id, seen_at FROM project_key_notices`));
      if (seen.length && readyApi) {
        for (const s of seen) { this._recipientsSeen(s.member_id, api.entries, s.seen_at); counts.notices_seen++; }
        if (has("group_key_notices")) this.sql.exec(`DELETE FROM group_key_notices`);
        if (has("project_key_notices")) this.sql.exec(`DELETE FROM project_key_notices`);
      } else if (seen.length) deferred++;
    }
    /* a legacy table with nothing left in it goes (R28); one that still holds a row of a kind not known is left, counted. The
       two tables of acts, whose records are carried into the history, go once no other legacy table holds a row to convert. */
    const rowsIn = (t) => (has(t) ? Number(this._one(`SELECT COUNT(*) AS n FROM ${t}`).n) : 0);
    const stillConverting = ["account_references", "subscription_connections", "group_key", "project_accounts", "group_key_notices",
      "project_key_notices"].some((t) => rowsIn(t) > 0);
    for (const t of AI_ACCOUNTS_LEGACY_TABLES) {
      if (!has(t)) continue;
      const acts = t === "group_key_acts" || t === "project_account_acts";
      if (rowsIn(t) === 0 || (acts && !stillConverting)) this.sql.exec(`DROP TABLE ${t}`);
    }
    return { ok: true, converted: counts, left, deferred };
  }

  /* R59: the catalogue's Anthropic plan of `kind` and its entries in catalogue order, or null when the catalogue cannot give
     them yet. */
  _migrationPlan(kind) {
    const cat = this.catalogue;
    if (!cat || typeof cat.plansOf !== "function") return null;
    try {
      const list = M._listOf(cat.plansOf({ provider: MIGRATED_PROVIDER }), "plans");
      if (!list) return null;
      const plans = list.flatMap((g) => (Array.isArray(g?.plans) ? g.plans : [g]));
      const fits = plans.filter((p) => p && p.kind === kind && (p.provider === undefined || p.provider === MIGRATED_PROVIDER)
        && (kind !== "api" || !Array.isArray(p.means_allowed) || p.means_allowed.includes("sealed")));
      const plan = fits.find((p) => p.scope === (kind === "api" ? "team" : "member")) ?? fits[0];
      if (!plan) return null;
      const entries = this._planEntries(plan.plan_id ?? plan.id);
      return entries ? { plan, entries } : null;
    } catch { return null; }
  }
}

export { A, AiAccountsLimits, localize };
