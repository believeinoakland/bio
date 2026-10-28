/* ai-accounts' offering (R47, R51–R57): what may be offered to an act, and what an account's head must have before it
 * serves. The seven checks P1–P7 (the team's, a project's, a member's own; a tick the team holds is locked below), the
 * entry the catalogue offers for the act's part under the checks in force (R55), the free-tier warning's acceptance (R56),
 * the recipient notice per provider and host (R51), and a personal subscription's record of the member's choice (R47).
 * A material limit is judged before any of it (R57) and binds every account; unticking P6 never lifts one. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { AiAccountsLists } from "./lists.mjs";
import { AiAccountsBase } from "./base.mjs";
import { AiAccountsAccounts } from "./accounts.mjs";
import { CHECK_IDS, PART_OF_KIND, ownerSpelled, LEVEL_WORD } from "./constants.mjs";

const M = AiAccountsBase;
const A = AiAccountsAccounts;

export class AiAccountsOffering extends AiAccountsLists {
  /* ===== R52, R53: the checks ===== */

  /* `ai-catalogue`'s own CHECK_UNKNOWN row (its R49), used as it mints it. */
  _checkUnknown(check) {
    try {
      const r = this.catalogue?.checkUnknown?.(check);
      if (r && r.code === "CHECK_UNKNOWN") return r;
    } catch { /* the refusal below */ }
    return { ok: false, reason: "CHECK_UNKNOWN", code: "CHECK_UNKNOWN", check: null, translation: null,
             detail: localize("ai-accounts.index.that_is_not_one_of_the_checks", "that is not one of the checks ({checks}). Nothing was changed.", { checks: CHECK_IDS.join(", ") }), check_id: typeof check === "string" ? check.slice(0, 20) : null };
  }

  /* A level's tick of `check`, `true`, `false` or null when it set none; throws when unreadable. */
  _tick(level, check) {
    const r = this._one(`SELECT ticked FROM ai_check_ticks WHERE level=? AND check_id=?`, level, check);
    return r ? !!r.ticked : null;
  }

  /* R52: the team's tick: ticked until set. */
  _teamTick(check) { const t = this._tick("group", check); return t === null ? true : t; }

  /* R52, R53 `checksSet` (`op=aicheckset`, `aiprojectcheckset`, `aimycheckset`): the team's by administrators only (all
     ticked until set); a project's by its owners for work directly in the project; a member's own by that member. A check
     the team ticks is locked: no project or member can unset it (`CHECK_LOCKED` naming the level that holds it); a member who
     is not an owner cannot unset a project's. Every change is recorded (who, when, which check, level; R16). */
  checksSet({ level = null, check = null, ticked = undefined, by = null } = {}) {
    const bar = this._ownerAuthority(level, by, localize("ai-accounts.index.setting_the_checks", "setting the checks an AI must meet"));
    let participant = false;
    if (bar) {
      /* a joined member who is not an owner can see a project's tick but cannot unset it */
      const id = M._memberOf(by);
      const project = typeof level === "string" && level.startsWith("project:") ? level.slice(8) : null;
      if (project && id !== null && !this._isMachine(by) && !this._unseen(project, `member:${id}`) && this._isJoined(project, id)) participant = true;
      else return bar;
    }
    if (typeof check !== "string" || !CHECK_IDS.includes(check)) return this._checkUnknown(check);
    if (typeof ticked !== "boolean") return M._valueInvalid(`the ${check} check`, [true, false], { switch: check });
    try {
      if (participant) {
        if (ticked === false && this._tick(level, check) === true)
          return this._refuse("CHECK_LOCKED", { check, level: "project" }, { check_id: check, level: "project" });
        return this._notTheOwner(by, level.slice(8));
      }
      if (level !== "group" && ticked === false && this._teamTick(check))
        return this._refuse("CHECK_LOCKED", { check, level: LEVEL_WORD.group }, { check_id: check, level: "group" });
      if (level.startsWith("member:") && ticked === false) {
        /* a member never unsets a tick a project she acts in holds is not asked here: a project's tick binds its work whoever
           ticked on her own account (R53), and `checksInForce` unions the levels */
      }
      const at = this._at();
      this._tx(() => {
        this.sql.exec(`INSERT INTO ai_check_ticks (level, project_id, check_id, ticked, set_by, set_at) VALUES (?,?,?,?,?,?)
                       ON CONFLICT(level, check_id) DO UPDATE SET ticked=excluded.ticked, set_by=excluded.set_by, set_at=excluded.set_at`,
          level, level.startsWith("project:") ? level.slice(8) : null, check, ticked ? 1 : 0, M._memberOf(by), at);
        this._change(level === "group" ? "group" : level, "check_set", { check, ticked }, by, null, at);   /* R16 */
      });
      return { ok: true, level, check, ticked };
    } catch {
      return { ok: false, reason: "UNREADABLE", code: "UNREADABLE", unreadable: true,
               detail: localize("ai-accounts.index.the_checks_could_not_be_read", "the checks could not be read, so nothing was changed.") };
    }
  }

  /* R52 `checksState`: one level's ticks, to that level's authority: `{level, ticks: {P1: true, …}}`, the team's all ticked
     until set, a project's or a member's unticked until set. Never throws (unreadable answers `unreadable: true`). */
  checksState({ level = null, viewer = null } = {}) {
    const bar = this._ownerAuthority(level, viewer, localize("ai-accounts.index.reading_the_checks", "reading the checks an AI must meet"));
    if (bar) return bar;
    try {
      return { ok: true, level, ticks: Object.fromEntries(CHECK_IDS.map((c) => [c, level === "group" ? this._teamTick(c) : this._tick(level, c) === true])) };
    } catch { return { ok: true, level, ticks: null, unreadable: true }; }
  }

  /* R54 `checksInForce`: in-plane, `{checks, sources}`: `checks` the team's ticked checks, plus the project's ticked checks when
     the act is directly in the project (`act.project` present), plus the acting member's own ticked checks; `sources`, for
     each check in `checks`, the levels that tick it, every one of them, in the order `group`, `project`, `member`. It names
     no member but the acting one and no project but the act's, and answers `{unreadable: true}` when it cannot read them (fail
     closed: R55 then offers nothing). */
  checksInForce({ project = null, member = null, act = null } = {}) {
    try {
      const proj = act && typeof act === "object" && act.project !== undefined && act.project !== null ? act.project : null;
      void project;
      const who = M._memberOf(member ?? (act && typeof act === "object" ? act.member : null));
      const sources = {};
      for (const c of CHECK_IDS) {
        const s = [];
        if (this._teamTick(c)) s.push("group");
        if (proj !== null && this._tick(`project:${proj}`, c) === true) s.push("project");
        if (who !== null && this._tick(`member:${who}`, c) === true) s.push("member");
        if (s.length) sources[c] = s;
      }
      return { checks: Object.keys(sources), sources };
    } catch { return { unreadable: true }; }
  }

  /* ===== R55: an entry offered for an act ===== */

  /* A catalogue reason, as this module's refusal for it, by its code unchanged (R55). */
  _reasonRefusal(reason, entryId) {
    const code = reason?.code;
    const entry = { entry: entryId };
    switch (code) {
      case "ENTRY_LAPSED": case "ENTRY_RETIRED": case "NEEDS_NEWER_RELEASE": case "NO_PLAN_OFFERED":
        return this._refuse(code, entry, { entry_id: entryId });
      case "PART_NOT_PASSED": case "PART_NOT_RATED":
        return this._refuse(code, { ...entry, part: String(reason.part ?? "") }, { entry_id: entryId, part: reason.part ?? null, ...(reason.verdict ? { verdict: reason.verdict } : {}) });
      case "CHECK_NOT_MET": case "CHECK_OPEN":
        return this._refuse(code, { ...entry, check: String(reason.check ?? "") }, { entry_id: entryId, check_id: reason.check ?? null });
      case "CATALOGUE_UNAVAILABLE": return this._catalogueUnavailable();
      default: return this._refuse("ENTRY_NOT_ALLOWED", entry, { entry_id: entryId });
    }
  }

  /* R55 `entryOffered`: in-plane, `{ok}` or the first refusal, in order: `ENTRY_NOT_ALLOWED` (R46's intersection: the
     account's allow-list when `account_id` is given, the team's, the project's and the member's ceilings); then the first
     reason of `ai-catalogue.whyNotOffered({entry_id, part: PART_OF_KIND[act.kind], checksInForce})`, by its code unchanged.
     The checks bind every account used for the work, a personal subscription included. An unreadable ceiling, check row or
     catalogue offers nothing (R63). */
  entryOffered({ entry_id = null, member = null, act = null, account_id = null } = {}) {
    const row = account_id === null || account_id === undefined ? null : this._account(account_id);
    if (account_id !== null && account_id !== undefined && !row) return this._refuse("ENTRY_NOT_ALLOWED", { entry: String(entry_id) }, { entry_id });
    const actOf = { ...(act && typeof act === "object" ? act : {}), member: member ?? act?.member };
    const allowed = this._allowedEntries(row, actOf);
    if (allowed.unreadable) return this._refuse("NO_ENTRY_OFFERED", { why: "the limits on which AIs may be offered could not be read" }, { unreadable: true });
    if (allowed.entries !== null && !allowed.entries.includes(entry_id)) return this._refuse("ENTRY_NOT_ALLOWED", { entry: String(entry_id) }, { entry_id });
    const force = this.checksInForce({ member: actOf.member, act: actOf });
    if (force.unreadable) return this._refuse("NO_ENTRY_OFFERED", { why: "the checks could not be read" }, { unreadable: true });
    const cat = this.catalogue;
    if (!cat || typeof cat.whyNotOffered !== "function") return this._catalogueUnavailable();
    let why;
    try { why = cat.whyNotOffered({ entry_id, part: PART_OF_KIND[actOf.kind] ?? null, checksInForce: force.checks }); } catch { why = null; }
    if (!why || typeof why !== "object" || (why.ok === false && why.code)) return this._catalogueUnavailable();
    if (why.offered === true) return { ok: true };
    const first = Array.isArray(why.reasons) && why.reasons.length ? why.reasons[0] : { code: "ENTRY_UNKNOWN" };
    return this._reasonRefusal(first, entry_id);
  }

  /* R55 `entriesOffered`: in-plane, the entries that pass for the act, for the choosing screens: the catalogue's closed list
     for the act's part under the checks in force, cut by the ceilings (R46). `{ok, entries}`; unreadable answers
     `{unreadable: true}` with none. */
  entriesOffered({ member = null, act = null } = {}) {
    const actOf = { ...(act && typeof act === "object" ? act : {}), member: member ?? act?.member };
    const allowed = this._allowedEntries(null, actOf);
    const force = this.checksInForce({ member: actOf.member, act: actOf });
    if (allowed.unreadable || force.unreadable) return { ok: true, entries: [], unreadable: true };
    let list = null;
    try { list = M._listOf(this.catalogue.entriesFor({ part: PART_OF_KIND[actOf.kind] ?? null, checksInForce: force.checks }), "entries"); } catch { list = null; }
    if (list === null) return { ok: true, entries: [], unreadable: true };
    return { ok: true, entries: list.filter((e) => allowed.entries === null || allowed.entries.includes(e.entry_id)) };
  }

  /* ===== R56: the free tier ===== */

  /* R56: the head's free-tier refusal, or null: a plan the catalogue marks `free_tier_trains: true` serves only after the
     owner's acceptance of its current warning version; `false` or open requires nothing (K3540). */
  _freeTierRefusal(row, plan) {
    if (plan?.free_tier_trains !== true) return null;
    const a = this._one(`SELECT warning_version FROM ai_free_tier WHERE account_id=?`, row.account_id);
    return a && a.warning_version === plan.warning_version ? null : this._refuse("FREE_TIER_NOT_ACCEPTED", { plan: String(row.plan) }, { account_id: row.account_id, plan: row.plan });
  }

  /* R56 `freeTierAccept` (`op=aitermsaccept`): the owner's acceptance (an administrator's for a team account, a project
     owner's for a project's, the member's for their own), recording who, when, plan and warning version (R16). An acceptance
     of an older warning version no longer counts, with no act of anyone. A plan that is not marked needs none and records
     none. */
  freeTierAccept({ account_id = null, by = null } = {}) {
    const t = this._accountAct(account_id, by, localize("ai-accounts.index.accepting_a_free_plans_warning", "accepting a free plan's warning"));
    if (t.refusal) return t.refusal;
    const p = this._planOfRow(t.row);
    if (p.refusal) return p.refusal;
    if (p.plan.free_tier_trains !== true) return { ok: true, account_id: t.row.account_id, needed: false };
    const at = this._at();
    this._tx(() => {
      this.sql.exec(`INSERT INTO ai_free_tier (account_id, plan, warning_version, accepted_by, accepted_at) VALUES (?,?,?,?,?)
                     ON CONFLICT(account_id) DO UPDATE SET plan=excluded.plan, warning_version=excluded.warning_version,
                       accepted_by=excluded.accepted_by, accepted_at=excluded.accepted_at`,
        t.row.account_id, t.row.plan, p.plan.warning_version ?? "", M._memberOf(by), at);
      this._change(t.row.owner, "free_tier", { account_id: t.row.account_id, plan: t.row.plan, warning_version: p.plan.warning_version ?? null, accepted: true }, by, null, at);   /* R16 */
    });
    return { ok: true, account_id: t.row.account_id, needed: true, accepted: true, warning_version: p.plan.warning_version ?? null };
  }

  /* R56 `freeTierWithdraw` (`op=aitermswithdraw`): removes the acceptance; recorded (R16). */
  freeTierWithdraw({ account_id = null, by = null } = {}) {
    const t = this._accountAct(account_id, by, localize("ai-accounts.index.withdrawing_a_free_plans_warning", "withdrawing a free plan's acceptance"));
    if (t.refusal) return t.refusal;
    const had = !!this._one(`SELECT account_id FROM ai_free_tier WHERE account_id=?`, t.row.account_id);
    if (had) this._tx(() => {
      this.sql.exec(`DELETE FROM ai_free_tier WHERE account_id=?`, t.row.account_id);
      this._change(t.row.owner, "free_tier", { account_id: t.row.account_id, plan: t.row.plan, accepted: false }, by);   /* R16 */
    });
    return { ok: true, account_id: t.row.account_id, withdrawn: had };
  }

  /* ===== R47: a personal subscription's choice ===== */

  /* R47 `personalChoiceState`: answers the member alone the record `{member, at, plan, terms_version, account_id}` and
     `stale: true` once the catalogue's terms version has changed; a stale record does not stop serving (a dated change is
     R76's notice). `stale: null` when the catalogue cannot be read. */
  personalChoiceState({ account_id = null, viewer = null } = {}) {
    const t = this._accountAct(account_id, viewer, localize("ai-accounts.index.reading_a_personal_choice", "reading a personal subscription's record"));
    if (t.refusal) return t.refusal;
    const rec = this._one(`SELECT account_id, member_id, plan, terms_version, chosen_at FROM ai_personal_choices WHERE account_id=?`, t.row.account_id);
    if (!rec) return A._notYours(localize("ai-accounts.index.that_is_not_a_personal_subscription", "that account is not a personal subscription. Nothing was read."));
    const p = this._planOfRow(t.row);
    return { ok: true, account_id: rec.account_id, record: { member: rec.member_id, at: rec.chosen_at, plan: rec.plan,
      terms_version: rec.terms_version, account_id: rec.account_id },
      stale: p.refusal ? null : (p.plan.terms_version ?? null) !== (rec.terms_version ?? null) };
  }

  /* ===== R51: the recipient's notice ===== */

  /* R51 `recipientNoticeDue`: null when that member has seen the notice of the entry's recipient (provider and host), else
     `RECIPIENT_NOTICE_DUE` with the recipient. Writes nothing; never throws. */
  recipientNoticeDue({ member = null, entry_id = null } = {}) {
    const f = this._entry(entry_id);
    if (f.unreadable) return this._catalogueUnavailable();
    if (!f.entry) return this._refuse("ENTRY_NOT_ALLOWED", { entry: String(entry_id) }, { entry_id });
    const r = M._recipientOf(f.entry);
    return this._noticeDueFor(M._memberOf(member), r);
  }

  _noticeDueFor(id, r) {
    let seen = false;
    try { seen = id !== null && !!this._one(`SELECT member_id FROM ai_recipients_seen WHERE member_id=? AND provider=? AND host=?`, id, r.provider, r.host); }
    catch { seen = false; }
    return seen ? null : this._refuse("RECIPIENT_NOTICE_DUE", { provider: r.provider, host: r.host }, { recipient: { ...r } });
  }

  /* R51 `recipientNoticeSeen` (carried by `op=aisend`): the member's own act, recorded once with its instant. */
  recipientNoticeSeen({ member = null, provider = null, host = null, by = null } = {}) {
    const bar = this._accountBar(member, by);
    if (bar) return bar;
    if (typeof provider !== "string" || provider === "" || typeof host !== "string" || host === "")
      return M._valueInvalid("the recipient", ["a provider and a host"], { switch: "recipient" });
    const id = M._memberOf(member);
    const already = !!this._one(`SELECT member_id FROM ai_recipients_seen WHERE member_id=? AND provider=? AND host=?`, id, provider, host);
    if (!already) this.sql.exec(`INSERT INTO ai_recipients_seen (member_id, provider, host, seen_at) VALUES (?,?,?,?)`, id, provider, host, this._at());
    return { ok: true, seen: true, already };
  }

  /* R7: the recipients a member has seen, `[{provider, host}]`. */
  _disclosedOf(id) {
    try { return this._rows(`SELECT provider, host FROM ai_recipients_seen WHERE member_id=? ORDER BY provider, host`, id).map((r) => ({ ...r })); }
    catch { return []; }
  }
}

export { isMachineIdentity, ownerSpelled };
