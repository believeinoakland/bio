/* ai-accounts' serving (R7, R11, R25, R45, R48, R50, R65–R68, R74–R76): which account serves an act, and what it hands the
 * one call. The order is fixed: keep-away first, before any account is read (R57); then the level (the project's when the
 * act names one and its list holds an account that is on, else the member's own, else the team's); then, in that level's
 * sequence, each account in list order and each one's entries in order, the head is the first usable pair; the head is
 * refused, never skipped, for its switch, its free tier, its recipient's notice or its payer flag, so no refusal moves an act
 * to another payer (K2352). Only R50's hop moves work along the list, and only between steps of a run. The agent Worker
 * reaches the credential, the gateway's record and a failure only through R65–R67's ops. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { Membership } from "../membership/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { AiAccountsOffering } from "./offering.mjs";
import { AiAccountsBase } from "./base.mjs";
import { AiAccountsAccounts } from "./accounts.mjs";
import { AI_ACCOUNT_CHECKS } from "./checks.mjs";
import { ACT_KINDS, HOP_REASONS, PAYER_CAUSES, TERMS_NOTICE_DAYS, DAY_MS, WORKER_CLASS } from "./constants.mjs";

const M = AiAccountsBase;
const A = AiAccountsAccounts;

export class AiAccountsServing extends AiAccountsOffering {
  /* R7, R11: the rows of an owner's list, each account in list order. */
  _seqRows(owner) {
    return this._rows(`SELECT a.* FROM ai_account_lists l JOIN ai_accounts a ON a.account_id=l.account_id WHERE l.owner=? ORDER BY l.position`, owner);
  }

  /* R11: the act, as `{id, kind, project}`, or the refusal: a member's own act of a kind that is not `explore`, by an active
     member (the founder once claimed counts). */
  _actOf(member, act) {
    const id = M._memberOf(member);
    const kind = act && typeof act === "object" ? act.kind : null;
    if (id === null || !ACT_KINDS.includes(kind) || M._memberOf(act.member) !== id || isMachineIdentity(act.member) || isMachineIdentity(member))
      return { refusal: M._notYours(localize("ai-accounts.index.an_ai_account_serves_only", "an AI account serves only a member's own asks, runs and standing questions. Nothing was used.")) };
    if (!this._holderActive(id))
      return { refusal: this.accountMemberNotActive(localize("ai-accounts.index.an_ai_account_serves_only_active", "an AI account serves only acts of active members. Nothing was used.")) };
    const project = act.project === undefined || act.project === null ? null : act.project;
    return { id, kind, project, interactive: act.interactive !== false };
  }

  /* R7, R57: keep-away is asked first, before the act is read or any account: the refusal, or null. */
  _awayFor(act) {
    const a = act && typeof act === "object" ? act : {};
    return this.aiKeptAway({ project: a.project ?? null, use: a.kind ?? null });
  }

  /* R11 (2): the level: `{owner, rows, level, project?}` or `{refusal}`. A project the member cannot see is absent, one seen
     and not joined is PROJECT_ACT_NOT_A_PARTICIPANT. */
  _levelFor(id, kind, project) {
    if (project !== null) {
      const bar = this._participantBar(project, id, "asking the assistant in a project");
      if (bar) return { refusal: bar };
    }
    const owners = [...(project !== null ? [[`project:${project}`, "project"]] : []), [`member:${id}`, "member"], ["group", "group"]];
    for (const [owner, level] of owners) {
      const rows = this._seqRows(owner);
      if (rows.some((r) => r.is_on)) return { owner, level, rows, ...(level === "project" ? { project } : {}) };
    }
    return { refusal: this._noAccount(id) };
  }

  /* R11 (3), R48, R55: whether a pair is usable for the act: its account on and held, a personal subscription only for its
     owner's act, and the entry offered (R55); `{ok}` or `{why}` naming what excluded it. */
  _usablePair(row, entryId, id, actFull) {
    if (!row.is_on || !row.held) return { why: "not on or not held" };
    if (row.personal && row.owner !== `member:${id}`) return { why: "a personal subscription serves only its own member" };
    const o = this.entryOffered({ entry_id: entryId, member: id, act: actFull, account_id: row.account_id });
    return o.ok ? { ok: true } : { why: o.code, refusal: o };
  }

  /* R11 (3)–(5): the head of the level's sequence and its refusals. `{row, entry_id}` or `{refusal}`. */
  _head(lv, id, actFull) {
    const reasons = [];
    let unreadable = false;
    let catalogue = null;
    for (const row of lv.rows) {
      for (const entryId of A._entriesOf(row)) {
        const u = this._usablePair(row, entryId, id, actFull);
        if (u.ok) return this._headRefusal(row, entryId, id, actFull.kind, lv);
        if (u.refusal?.unreadable) unreadable = true;
        if (u.refusal?.code === "CATALOGUE_UNAVAILABLE") catalogue = u.refusal;
        if (u.why && !reasons.includes(u.why)) reasons.push(u.why);
      }
    }
    if (catalogue) return { refusal: catalogue };
    if (!lv.rows.some((r) => r.is_on && r.held)) return { refusal: this._noAccount(id) };
    return { refusal: this._refuse("NO_ENTRY_OFFERED", { why: reasons.join(", ") || "none" }, { reasons, ...(unreadable ? { unreadable: true } : {}) }) };
  }

  /* R11 (4): the head is refused, never skipped, when its account's switch for the kind is off (AI_USE_SWITCHED_OFF), its
     plan is a free tier not accepted (R56), its recipient's notice is due (R51) or its account is flagged for a gateway payer
     difference (R45). `{row, entry_id}` when none holds. */
  _headRefusal(row, entryId, id, kind, lv) {
    if (!M._usesOf(row)[kind])
      return { refusal: M._switchedOff(lv.level === "project" ? "project" : lv.level === "group" ? "group" : "own", kind, lv.level === "project" ? lv.project : null) };
    const p = this._planOfRow(row);
    if (p.refusal) return { refusal: p.refusal };
    const free = this._freeTierRefusal(row, p.plan);
    if (free) return { refusal: free };
    const f = this._entry(entryId);
    if (f.unreadable) return { refusal: this._catalogueUnavailable() };
    const notice = this._noticeDueFor(id, M._recipientOf(f.entry));
    if (notice) return { refusal: notice };
    if (row.flagged) return { refusal: this._refuse("PAYER_NOT_VERIFIED", { cause: String(row.flag_cause ?? "payer") }, { account_id: row.account_id, cause: row.flag_cause ?? null }) };
    return { row, entry_id: entryId };
  }

  /* R7, R11: the account that serves an act, without unsealing: `{refusal}` or `{row, entry_id, level, project?, id, kind}`. */
  _resolve(member, act) {
    try { return this._resolveRead(member, act); }
    catch { return { refusal: this._unreadable() }; }
  }

  /* R63: fail closed (K2093): what could not be read offers nothing, and says so; never a throw. */
  _unreadable() {
    return this._refuse("NO_ENTRY_OFFERED", { why: "the accounts could not be read" }, { reasons: [], unreadable: true });
  }

  _resolveRead(member, act) {
    const away = this._awayFor(act);
    if (away) return { refusal: away };
    const a = this._actOf(member, act);
    if (a.refusal) return a;
    const lv = this._levelFor(a.id, a.kind, a.project);
    if (lv.refusal) return lv;
    const h = this._head(lv, a.id, { ...act, member: a.id });
    if (h.refusal) return h;
    return { ...h, level: lv.level, ...(lv.project !== undefined ? { project: lv.project } : {}), id: a.id, kind: a.kind };
  }

  /* R7 `accountFor`: the account that serves an act. In-plane it answers `{ok, account_id, level, owner, provider, plan,
     means, entry_id, entries, member, project?, suggestions, personal, disclosed}` plus, for the one call, `secret` (sealed,
     issued), `reference` (the pointer) or `gateway_id`; `none` adds nothing; no module that runs the assistant keeps it. The
     Worker is handed none of these (R65). Keep-away (R57) is asked first; refusals as R11 states them. */
  async accountFor({ member = null, act = null } = {}) {
    const r = this._resolve(member, act);
    if (r.refusal) return r.refusal;
    let cred;
    try { cred = await this._credentialOf(r.row); } catch { return this._unreadable(); }
    if (!cred.ok) return cred;
    const { account_id, ok, means, ...secretPart } = cred;
    void account_id; void ok; void means;
    return { ok: true, account_id: r.row.account_id, level: r.level, owner: r.row.owner, provider: r.row.provider, plan: r.row.plan,
             means: r.row.means, entry_id: r.entry_id, entries: A._entriesOf(r.row), member: r.id,
             ...(r.project !== undefined ? { project: r.project } : {}), suggestions: !!r.row.suggestions,
             personal: !!r.row.personal, disclosed: this._disclosedOf(r.id), ...secretPart };
  }

  /* R25 `accountServing`: R11's choice for `member`'s act of kind `use` in `project`, without unsealing: `{refusal}` or
     `{account_id, level, provider, plan, means, entry_id, project?, member?}`, never a secret. In-plane, reached by no route. */
  accountServing({ member = null, use = null, project = null, interactive = true } = {}) {
    const r = this._resolve(member, { kind: use, member, project: project === undefined ? null : project, interactive });
    if (r.refusal) return { refusal: r.refusal };
    return { account_id: r.row.account_id, level: r.level, provider: r.row.provider, plan: r.row.plan, means: r.row.means, entry_id: r.entry_id,
             ...(r.project !== undefined ? { project: r.project } : {}), ...(r.row.owner.startsWith("member:") ? { member: r.id } : {}) };
  }

  /* R25 `servingAccountOf`: which account serves an active member's act of kind `use` (default `ask`) in `project` now,
     `{account_id, level, means, suggestions, standing}` of the head, or null. */
  servingAccountOf({ member = null, use = "ask", project = null } = {}) {
    const r = this._resolve(member, { kind: use ?? "ask", member, project: project ?? null });
    return r.refusal ? null : { account_id: r.row.account_id, level: r.level, means: r.row.means, suggestions: !!r.row.suggestions, standing: !!r.row.standing };
  }

  /* R25 `accountActBar`: R1's, R5's or R10's refusals for an act on `owner`'s accounts by `by`, or null (credentials R27's
     first step). `member` is accepted for an owner spelled as a bare member id. */
  accountActBar({ owner = null, member = null, by = null } = {}) {
    const o = owner ?? (member === null ? null : (String(member).startsWith("member:") ? member : `member:${member}`));
    return this._ownerAuthority(o, by, "acting on an account");
  }

  /* ===== R50: the hop ===== */

  /* R50 `hopFor`: in-plane, writes nothing, answers the next pair or a refusal. `reason` one of `limit`, `unavailable`,
     `lapsed`, `capability`, `auth`, `member_switch`; any other is HOP_REASON_REFUSED; a use its owner switched off is never a
     reason (AI_USE_SWITCHED_OFF, K2352). `at_step_boundary` false is HOP_NOT_AT_STEP_BOUNDARY. The walk starts after `from` in
     the sequence R11 chose and returns the first pair that is usable, offered, meeting every check in force and passing
     Gate 1 for the part (R55), the same owner's or an opted-in account's (R49), and has its free tier accepted (R56). A target
     whose recipient is not disclosed to the member waits (R51). Nothing found is LIST_EXHAUSTED. */
  hopFor(args = {}) {
    try { return this._hopFor(args ?? {}); } catch { return this._unreadable(); }
  }

  _hopFor({ member = null, act = null, from = null, reason = null, at_step_boundary = false } = {}) {
    if (!HOP_REASONS.includes(reason)) return this._refuse("HOP_REASON_REFUSED", { reason: String(reason) }, { hop_reason: typeof reason === "string" ? reason.slice(0, 40) : null });
    if (at_step_boundary !== true) return this._refuse("HOP_NOT_AT_STEP_BOUNDARY");
    const away = this._awayFor(act);
    if (away) return away;
    const a = this._actOf(member, act);
    if (a.refusal) return a.refusal;
    const lv = this._levelFor(a.id, a.kind, a.project);
    if (lv.refusal) return lv.refusal;
    const pairs = lv.rows.flatMap((row) => A._entriesOf(row).map((e) => ({ row, entry_id: e })));
    const fromRow = from && typeof from === "object" ? this._account(from.account_id) : null;
    if (fromRow && !M._usesOf(fromRow)[a.kind])
      return M._switchedOff(lv.level === "project" ? "project" : lv.level === "group" ? "group" : "own", a.kind, lv.level === "project" ? lv.project : null);
    const at = pairs.findIndex((p) => p.row.account_id === from?.account_id && p.entry_id === from?.entry_id);
    const actFull = { ...act, member: a.id };
    for (const p of pairs.slice(at + 1)) {
      const row = p.row;
      if (row.owner !== lv.owner && !row.share_flag) continue;   /* R49: tested at each hop */
      if (row.flagged || !M._usesOf(row)[a.kind]) continue;
      const u = this._usablePair(row, p.entry_id, a.id, actFull);
      if (!u.ok) continue;
      const plan = this._planOfRow(row);
      if (plan.refusal || this._freeTierRefusal(row, plan.plan)) continue;
      const f = this._entry(p.entry_id);
      if (f.unreadable || !f.entry) continue;
      const notice = this._noticeDueFor(a.id, M._recipientOf(f.entry));
      if (notice) return { ok: false, wait: true, code: "RECIPIENT_NOTICE_DUE", reason: "RECIPIENT_NOTICE_DUE", interactive: a.interactive,
                           recipient: notice.recipient, account_id: row.account_id, entry_id: p.entry_id };
      const fromOwner = fromRow ? fromRow.owner : null;
      return { ok: true, account_id: row.account_id, entry_id: p.entry_id, level: lv.level, owner: row.owner, means: row.means,
               payer_change: fromOwner !== null && fromOwner !== row.owner ? { from_owner: fromOwner, to_owner: row.owner } : null };
    }
    return this._refuse("LIST_EXHAUSTED", {}, { who: lv.owner === "group" ? "administrators" : lv.owner.startsWith("project:") ? "owners" : "member" });
  }

  /* ===== R65–R67: the Worker's ops ===== */

  /* R65: the one principal served an account's credential: the control plane's stamp for the agent Worker's own credential. */
  static _isWorker(by) {
    const s = typeof by === "string" ? by.trim().toLowerCase() : "";
    return s === `token:${WORKER_CLASS}` || s === `class:${WORKER_CLASS}`;
  }

  _notServed() { return this._refuse("AI_CREDENTIAL_NOT_SERVED"); }

  /* R65–R67: the account must be the one `accountFor` answered for the act; `{row}` or `{refusal}`. Without an `act` only the
     account is asked for (R66, R67 carry none). */
  _workerAccount(accountId, act) {
    const row = this._account(accountId);
    if (!row) return { refusal: A._notYours(localize("ai-accounts.index.that_is_not_the_acts_account", "that is not the account that serves this act. Nothing was served.")) };
    if (act !== null && act !== undefined) {
      const r = this._resolve(act.member, act);
      if (r.refusal) return { refusal: r.refusal };
      if (r.row.account_id !== row.account_id)
        return { refusal: A._notYours(localize("ai-accounts.index.that_is_not_the_acts_account", "that is not the account that serves this act. Nothing was served.")) };
    }
    return { row };
  }

  /* R65 `aiCredential` (`op=aicredential`): the sealed or resolved credential for one call: the secret (sealed, issued), the
     pointer (reference), the gateway id (gateway), nothing (none). Served ONLY to the agent Worker's principal, and only for
     the act's own account: `account_id` must be the account `accountFor` answered for that act, else NOT_YOUR_ACCOUNT; any
     other principal is AI_CREDENTIAL_NOT_SERVED, writing nothing. Never logged. */
  async aiCredential({ account_id = null, act = null, by = null } = {}) {
    if (!AiAccountsServing._isWorker(by)) return this._notServed();
    const t = this._workerAccount(account_id, act ?? {});
    if (t.refusal) return t.refusal;
    return this._credentialOf(t.row);
  }

  /* R66 `aiGatewayServed` (`op=aigatewayserved`): the Worker hands `gatewayServedCheck` a call's gateway log record and
     receives `{ok}` or `{flagged}`, never a secret; the Worker's principal only. */
  aiGatewayServed({ account_id = null, record = null, act = null, by = null } = {}) {
    if (!AiAccountsServing._isWorker(by)) return this._notServed();
    const t = this._workerAccount(account_id, act);
    if (t.refusal) return t.refusal;
    return this.gatewayServedCheck({ account_id, record });
  }

  /* R67 `aiCredentialFailed` (`op=aicredentialfailed`): the Worker reports `accountCredentialFailed` (R60); the Worker's
     principal only, the same refusals as R66. */
  aiCredentialFailed({ account_id = null, why = null, act = null, by = null } = {}) {
    if (!AiAccountsServing._isWorker(by)) return this._notServed();
    const t = this._workerAccount(account_id, act);
    if (t.refusal) return t.refusal;
    return this.accountCredentialFailed({ account_id, why });
  }

  /* ===== R45: who paid ===== */

  /* R45 `gatewayServedCheck`: in-plane, for each call's gateway log record `{gateway_id, own_key_served,
     platform_credits_used}` (each true, false or null): `{ok: true}` only when the id is the account's, `own_key_served` is
     true and `platform_credits_used` is false. Otherwise (Cloudflare credits paid, another gateway's record, or a record still
     null, missing or unreadable after the bounded re-reads) the call's answer is kept, the account is FLAGGED with its cause
     (`credits`, `other_gateway`, `log_unreadable`), `creditsStopsOpen` (R75) offers it to the people who can clear it, and
     every later call on the account is refused PAYER_NOT_VERIFIED until `aiCreditsClear` (R68); the flag is a change (R16).
     Answers `{flagged: true, cause}`; one flag per account: a later flagged call adds none. */
  gatewayServedCheck({ account_id = null, record = null } = {}) {
    const row = this._account(account_id);
    if (!row || row.means !== "gateway") return A._notYours(localize("ai-accounts.index.that_is_not_a_gateway_account", "that is not an account reached through a gateway. Nothing was checked."));
    const bool = (v) => v === true || v === false;
    const r = record && typeof record === "object" ? record : {};
    let cause = null;
    if (r.gateway_id !== undefined && r.gateway_id !== null && r.gateway_id !== row.gateway_id) cause = "other_gateway";
    else if (r.platform_credits_used === true) cause = "credits";
    else if (!bool(r.own_key_served) || !bool(r.platform_credits_used) || r.gateway_id !== row.gateway_id) cause = "log_unreadable";
    else if (r.own_key_served !== true) cause = "credits";
    if (cause === null) return { ok: true };
    if (!row.flagged) {
      const at = this._at();
      this._tx(() => {
        this.sql.exec(`UPDATE ai_accounts SET flagged=1, flag_cause=?, flagged_at=? WHERE account_id=?`, cause, at, row.account_id);
        this._change(row.owner, "payer_flag", { account_id: row.account_id, cause }, null, null, at);   /* R16 */
      });
    }
    return { flagged: true, cause: row.flagged ? row.flag_cause : cause };
  }

  /* R68 `aiCreditsClear` (`op=aicreditsclear`, "Clear it and turn the account back on"): clears the payer flag R45 sets, whatever
     its cause. By an active administrator for a team account (NOT_AN_ADMIN), a project owner for a project's
     (PROJECT_ACT_NOT_THE_OWNER), the member for their own (NOT_YOUR_ACCOUNT otherwise); a machine credential
     MACHINE_CANNOT_HOLD_ACCOUNT. Reversible: recorded with name and time (R16); the next call that fails R45 flags again; no
     reason is asked. `creditsStopsOpen` stops answering the account in the same act. An unflagged account answers `{ok,
     was_flagged: false}` and records nothing. */
  aiCreditsClear({ account_id = null, by = null } = {}) {
    const t = this._accountAct(account_id, by, localize("ai-accounts.index.clearing_a_payer_stop", "clearing an AI account's payer stop"), { machineFirst: true });
    if (t.refusal) return t.refusal;
    if (!t.row.flagged) return { ok: true, account_id: t.row.account_id, was_flagged: false };
    const at = this._at();
    this._tx(() => {
      this.sql.exec(`UPDATE ai_accounts SET flagged=0, flag_cause=NULL, flagged_at=NULL WHERE account_id=?`, t.row.account_id);
      this._change(t.row.owner, "payer_cleared", { account_id: t.row.account_id, cause: t.row.flag_cause }, by, null, at);   /* R16 */
    });
    return { ok: true, account_id: t.row.account_id, was_flagged: true };
  }

  /* Whether `viewer` may clear or manage `row`: the team's administrators, a project's owners, the member for their own. */
  _manages(row, viewer) {
    if (this._isMachine(viewer)) return false;
    const id = M._memberOf(viewer);
    if (row.owner === "group") { try { return this.membership.isAdministrator(id) === true; } catch { return false; } }
    if (row.owner.startsWith("project:")) return !this._unseen(row.owner.slice(8), `member:${id}`) && this._isOwner(row.owner.slice(8), id);
    return row.owner === `member:${id}` && this._holderActive(id);
  }

  /* R75 `creditsStopsOpen`: in-plane; for each flagged account that `viewer` may clear (R68's who) `{key, account_id,
     flagged_at, cause}`, a stable key per account and flag, so `queue-producers` raises one item of the kind `ai-credits-stop`
     from it and this module calls no queue. The read answers the account until the flag is cleared or the account removed. It
     replaces R45's one notice. Writes nothing; never throws. */
  creditsStopsOpen({ viewer = null, at = null } = {}) {
    void at;
    try {
      return this._rows(`SELECT account_id, owner, flagged_at, flag_cause FROM ai_accounts WHERE flagged=1 ORDER BY flagged_at, account_id`)
        .filter((r) => this._manages(r, viewer))
        .map((r) => ({ key: `ai-credits-stop|${r.account_id}|${r.flagged_at}`, account_id: r.account_id, flagged_at: r.flagged_at, cause: r.flag_cause }));
    } catch { return []; }
  }

  /* R74 `accountsOnSummary`: in-plane, answered to `instance-setup` alone: `{team_on, projects_on}`: `team_on` the number of
     the team's accounts that are on and held; `projects_on` the ids of the projects that hold at least one account that is on
     and held and that `viewer` may see (an invisible project is absent, not named). A member's own accounts and personal
     subscriptions are never counted and never named. Unreadable answers `{unreadable: true}`. */
  accountsOnSummary({ viewer = null } = {}) {
    try {
      const team = Number(this._one(`SELECT COUNT(*) AS n FROM ai_accounts WHERE owner='group' AND is_on=1 AND held=1`).n);
      const id = M._memberOf(viewer);
      const projects = this._rows(`SELECT DISTINCT project_id FROM ai_accounts WHERE owner LIKE 'project:%' AND is_on=1 AND held=1 ORDER BY project_id`)
        .map((r) => r.project_id).filter((p) => id !== null && !this._isMachine(viewer) && this._sightOf(p, `member:${id}`) !== Membership.SIGHT_NONE);
      return { team_on: team, projects_on: projects };
    } catch { return { unreadable: true }; }
  }

  /* R76 `termsNoticesDue`: in-plane, for `notice-producers`: for each account `viewer` may manage (R68's who), each binding
     term of its plan (`ai-catalogue` R22, R23 `terms_pending`) whose `effective_from` is within `TERMS_NOTICE_DAYS` after `at`:
     `{account_id, plan_id, doc, version, effective_from, key}`, a stable key per (account, doc, version), so one notice is
     raised (`ai.notice.termschange`) and no more. Nothing waits on it: no account is turned off, no act is refused, no
     acceptance is asked. Writes nothing; never throws. */
  termsNoticesDue({ viewer = null, at = null } = {}) {
    try {
      const now = at ? Date.parse(at) : this._nowMs();
      const out = [];
      for (const row of this._rows(`SELECT * FROM ai_accounts ORDER BY seq`)) {
        if (!this._manages(row, viewer)) continue;
        const p = this._planOfRow(row);
        if (p.refusal) continue;
        for (const t of Array.isArray(p.plan.terms_pending) ? p.plan.terms_pending : []) {
          const from = Date.parse(t.effective_from);
          if (!Number.isFinite(from) || from <= now || from - now > TERMS_NOTICE_DAYS * DAY_MS) continue;
          out.push({ account_id: row.account_id, plan_id: row.plan, doc: t.doc, version: t.version, effective_from: t.effective_from,
                     key: `terms|${row.account_id}|${t.doc}|${t.version}` });
        }
      }
      return out;
    } catch { return []; }
  }
}

export { AI_ACCOUNT_CHECKS, PAYER_CAUSES };
