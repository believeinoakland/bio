/* ai-accounts' lists (R41, R46, R49, R70, R72, R77): each owner has one ordered list of accounts, which defines the
 * sequence an act walks (R11) and a hop walks (R50): each account in order, its entries in their order. An account of
 * another owner is on a list only by a placement, and only while the one share flag its owner level carries is on
 * (DEC-465: the team's `share_with_lists`, a member's own `share_with_projects`); who placed it is recorded (R77), so a
 * member who can no longer place a shared account loses her placements. The ceilings of entries above the accounts (R46)
 * are here too: each level may only narrow the one above it. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { localize } from "../setup-words/index.mjs";
import { AiAccountsAccounts } from "./accounts.mjs";
import { AiAccountsBase } from "./base.mjs";
import { AI_ACCOUNT_CHECKS } from "./checks.mjs";
import { ownerSpelled, levelOf } from "./constants.mjs";

const M = AiAccountsBase;
const A = AiAccountsAccounts;

export class AiAccountsLists extends AiAccountsAccounts {
  /* ===== R41: a list's authority ===== */

  /* Who may set `owner`'s list: `{mode: "full"}` or, for a member who has only joined a project (R49; K5486), `{mode:
     "participant"}`, who may add the accounts R49 lets her place and take back her own placements, and nothing else; or
     `{refusal}`. A machine credential is `MACHINE_CANNOT_HOLD_ACCOUNT` whatever the owner. */
  _listAuthority(owner, by) {
    if (this._isMachine(by)) return { refusal: this._accountBar(null, by) };
    const bar = this._ownerAuthority(owner, by, localize("ai-accounts.index.changing_an_owners_list", "changing the order of an owner's AI accounts"));
    if (bar === null) return { mode: "full" };
    if (owner !== null && typeof owner === "string" && owner.startsWith("project:")) {
      const id = M._memberOf(by);
      const project = owner.slice(8);
      if (id !== null && !this._unseen(project, `member:${id}`) && this._isJoined(project, id)) return { mode: "participant" };
    }
    return { refusal: bar };
  }

  /* A list as ids in order, with each entry's placement. */
  _listRows(owner) {
    return this._rows(`SELECT l.account_id, l.position, l.placed_by, l.placed_at, a.owner AS account_owner, a.personal, a.share_flag,
                              a.provider, a.plan FROM ai_account_lists l JOIN ai_accounts a ON a.account_id=l.account_id
                       WHERE l.owner=? ORDER BY l.position`, owner);
  }

  /* R49: whether the account of another owner may stand on `listOwner`'s list, placed by member `by`: a refusal or null.
     The team's account (its `share_with_lists` on) on a member's own list, placed by her, and on a project's list she has
     joined; a member's own account (its `share_with_projects` on) on a project's list she has joined, never on the team's
     or another member's; a personal subscription never (R48); a project's account never. */
  _shareRefusal(listOwner, row, byMember) {
    if (row.personal) return this._refuse("PERSONAL_SUBSCRIPTION_NOT_SHARED", {}, { account_id: row.account_id });
    const missing = () => this._refuse("OPT_IN_MISSING", { account: row.account_id }, { account_id: row.account_id });
    const flag = A._flagOf(row);
    if (!flag || !row.share_flag) return missing();
    const joined = (project, who) => who !== null && this._isJoined(project, who);
    if (row.owner === "group") {
      if (listOwner.startsWith("member:")) return listOwner === `member:${byMember}` ? null : missing();
      if (listOwner.startsWith("project:")) return joined(listOwner.slice(8), byMember) ? null : missing();
      return missing();
    }
    if (row.owner.startsWith("member:") && listOwner.startsWith("project:")) {
      const project = listOwner.slice(8);
      return joined(project, row.owner.slice(7)) && joined(project, byMember) ? null : missing();
    }
    return missing();
  }

  /* R41 `accountOrderSet` (`op=aiorderset`, `aiprojectorder`): replaces an owner's list with `accounts`, the ids in their new
     order, and is recorded (R16). Who: administrators for `group`, a project's owner for `project:<id>` (a member who has only
     joined it may add what R49 lets her place and take back her own), each member for `member:<id>`; a machine credential
     `MACHINE_CANNOT_HOLD_ACCOUNT`. An account of another owner is accepted only with its share flag (R49), else
     `OPT_IN_MISSING` naming it; a personal subscription only in its owner's own list, else
     `PERSONAL_SUBSCRIPTION_NOT_SHARED`; an unknown or repeated account `ACCOUNT_NOT_LISTED`. An account not on its owner's
     list serves no one. Each refusal leaves the old list standing. */
  accountOrderSet({ owner = null, accounts = null, by = null } = {}) {
    const auth = this._listAuthority(owner, by);
    if (auth.refusal) return auth.refusal;
    const byMember = M._memberOf(by);
    const wanted = Array.isArray(accounts) ? accounts : null;
    const bad = (id) => this._refuse("ACCOUNT_NOT_LISTED", { account: String(id) }, { account_id: typeof id === "string" ? id : null });
    if (wanted === null) return bad(null);
    const old = this._listRows(owner);
    const oldIds = old.map((r) => r.account_id);
    const seen = new Set();
    const rows = [];
    for (const id of wanted) {
      const row = typeof id === "string" ? this._account(id) : null;
      if (!row || seen.has(id)) return bad(id);
      seen.add(id);
      rows.push(row);
    }
    const added = rows.filter((r) => !oldIds.includes(r.account_id));
    for (const r of added) {
      if (r.owner === owner) continue;
      const refused = this._shareRefusal(owner, r, byMember);
      if (refused) return refused;
    }
    if (auth.mode === "participant") {
      /* a member who has only joined the project may add what R49 lets her place, at the foot of the list, and take back what she
         placed; what is not hers keeps its place and its order */
      const keepers = old.filter((r) => r.placed_by !== byMember || r.account_owner === owner).map((r) => r.account_id);
      const head = wanted.slice(0, keepers.length);
      if (head.length !== keepers.length || head.some((id, i) => id !== keepers[i])) return this._notTheOwner(by, owner.slice(8));
      if (added.some((r) => r.owner === owner)) return this._notTheOwner(by, owner.slice(8));
    }
    const at = this._at();
    this._tx(() => {
      const placement = new Map(old.map((r) => [r.account_id, r]));
      this.sql.exec(`DELETE FROM ai_account_lists WHERE owner=?`, owner);
      wanted.forEach((id, i) => {
        const prior = placement.get(id);
        const row = rows[i];
        const placedBy = prior ? prior.placed_by : (row.owner === owner ? null : byMember);
        const placedAt = prior ? prior.placed_at : (row.owner === owner ? null : at);
        this.sql.exec(`INSERT INTO ai_account_lists (owner, project_id, account_id, position, placed_by, placed_at) VALUES (?,?,?,?,?,?)`,
          owner, owner.startsWith("project:") ? owner.slice(8) : null, id, i + 1, placedBy, placedAt);
      });
      this._change(owner, "order_set", { accounts: wanted, added: added.map((r) => r.account_id),
        removed: oldIds.filter((id) => !seen.has(id)) }, by, null, at);   /* R16: the new order */
    });
    return { ok: true, owner, accounts: wanted };
  }

  /* R70 `accountMove` (`op=aiorderset`): the screens' "Move up" and "Move down" as an explicit position change, never a
     toggle: the account is taken out of the list as read at that instant and put at `position` (1-based), every other
     account keeping its relative order; a `position` outside 1 to the list's length is `ORDER_POSITION_INVALID`, an account
     not on the list `ACCOUNT_NOT_LISTED`. Authority and the rest are `accountOrderSet`'s. */
  accountMove({ owner = null, account_id = null, position = null, by = null } = {}) {
    const auth = this._listAuthority(owner, by);
    if (auth.refusal) return auth.refusal;
    const ids = this._listRows(owner).map((r) => r.account_id);
    if (!ids.includes(account_id)) return this._refuse("ACCOUNT_NOT_LISTED", { account: String(account_id) }, { account_id: typeof account_id === "string" ? account_id : null });
    if (!Number.isInteger(position) || position < 1 || position > ids.length)
      return this._refuse("ORDER_POSITION_INVALID", { position: String(position), count: ids.length }, { position: position ?? null, count: ids.length });
    const rest = ids.filter((id) => id !== account_id);
    rest.splice(position - 1, 0, account_id);
    return this.accountOrderSet({ owner, accounts: rest, by });
  }

  /* ===== R49: the share flag ===== */

  /* R49 `crossOwnerOptInSet` (`op=aioptinset`): sets the one share flag the account's owner level carries, and nothing else:
     a team account's `share_with_lists`, by an active administrator only; a member's own API account's `share_with_projects`,
     by that member alone (any other caller, an administrator included, is `NOT_YOUR_ACCOUNT`, a machine credential
     `MACHINE_CANNOT_HOLD_ACCOUNT`); a project's account carries neither (`OPT_IN_NOT_OFFERED`), and a personal subscription
     can carry neither (`PERSONAL_SUBSCRIPTION_NOT_SHARED`, asked first of the two). Both are off when the account is set.
     Turning one off takes the account off every list that is not its owner's own, in the same act (R72). */
  crossOwnerOptInSet({ account_id = null, on = undefined, by = null } = {}) {
    const t = this._accountAct(account_id, by, localize("ai-accounts.index.sharing_an_ai_account", "sharing an AI account"));
    if (t.refusal) return t.refusal;
    const row = t.row;
    if (row.personal) return this._refuse("PERSONAL_SUBSCRIPTION_NOT_SHARED", {}, { account_id: row.account_id });
    const flag = A._flagOf(row);
    if (!flag) return this._refuse("OPT_IN_NOT_OFFERED", { account: row.account_id }, { account_id: row.account_id });
    if (typeof on !== "boolean") return M._valueInvalid(`the ${flag} flag`, [true, false], { switch: flag });
    if (on === !!row.share_flag) return { ok: true, account_id: row.account_id, flag, on, changed: false };
    const at = this._at();
    this._tx(() => {
      this.sql.exec(`UPDATE ai_accounts SET share_flag=? WHERE account_id=?`, on ? 1 : 0, row.account_id);
      this._change(row.owner, "opt_in", { account_id: row.account_id, flag, on }, by, null, at);   /* R16 */
      if (!on) this._leaveLists(row, by, at);
    });
    return { ok: true, account_id: row.account_id, flag, on, changed: true };
  }

  /* R72: the account off every list that is not its owner's own, each removal a change (R16) recorded with the list's owner
     and the instant, which `accountNoticesFor` answers to the owners of those lists. The caller's transaction. */
  _leaveLists(row, by, at) {
    const lists = this._rows(`SELECT owner FROM ai_account_lists WHERE account_id=? AND owner<>? ORDER BY owner`, row.account_id, row.owner);
    for (const l of lists) {
      this.sql.exec(`DELETE FROM ai_account_lists WHERE owner=? AND account_id=?`, l.owner, row.account_id);
      this._renumber(l.owner);
      this._change(l.owner, "list_left", { account_id: row.account_id, provider: row.provider, plan: row.plan, list_owner: l.owner }, by, null, at);
    }
  }

  /* R77 (2), R27: the placements a member can no longer make, taken off the lists of `projects` (every project's, for a
     revocation): each entry whose `placed_by` is her and whose account is not the project's own, and her own member account
     whoever placed it; each a change (R16) recorded with the project, the account, who had placed it, the act's `by` and the
     instant. Answers the number removed. The caller's transaction. */
  _removePlacements(memberId, projects, by, at) {
    let n = 0;
    const lists = projects === null ? this._rows(`SELECT DISTINCT owner FROM ai_account_lists WHERE owner LIKE 'project:%'`).map((r) => r.owner)
      : projects.map((p) => `project:${p}`);
    for (const owner of lists) {
      const rows = this._rows(`SELECT l.account_id, l.placed_by, a.owner AS account_owner, a.provider, a.plan FROM ai_account_lists l
                               JOIN ai_accounts a ON a.account_id=l.account_id WHERE l.owner=? ORDER BY l.position`, owner);
      for (const r of rows) {
        const hers = r.account_owner === `member:${memberId}`;
        if (!hers && !(r.placed_by === memberId && r.account_owner !== owner)) continue;
        this.sql.exec(`DELETE FROM ai_account_lists WHERE owner=? AND account_id=?`, owner, r.account_id);
        this._change(owner, "list_left_project", { account_id: r.account_id, provider: r.provider, plan: r.plan, project: owner.slice(8),
          placed_by: r.placed_by ?? null, removed_member: memberId }, by, null, at);
        n++;
      }
      this._renumber(owner);
    }
    return n;
  }

  /* ===== R46: the ceilings of entries above the accounts ===== */

  /* R46 `offeredSet` (`op=aimemberallow`, `aiprojectuse`, `aimineuse`): an owner's ceiling of entries for work at that level
     (null: none): the team's by administrators, a project's by its owners, a member's own by that member. A lower level's
     set must lie inside the team's, else `NARROWING_ONLY` naming the entry. */
  offeredSet({ owner = null, entries = null, by = null } = {}) {
    const bar = this._ownerAuthority(owner, by, localize("ai-accounts.index.setting_which_ais_may_be_offered", "setting which AIs may be offered"));
    if (bar) return bar;
    let list = null;
    if (entries !== null && entries !== undefined) {
      if (!Array.isArray(entries) || entries.length === 0) return this._refuse("ENTRIES_EMPTY");
      list = [];
      for (const e of entries) {
        const f = typeof e === "string" ? this._entry(e) : { entry: null };
        if (f.unreadable) return this._catalogueUnavailable();
        if (!f.entry) return this._refuse("ENTRY_NOT_ALLOWED", { entry: String(e) }, { entry: typeof e === "string" ? e : null });
        if (!list.includes(e)) list.push(e);
      }
      if (owner !== "group") {
        const top = this._ceiling("group");
        if (top.unreadable) return this._refuse("NO_ENTRY_OFFERED", { why: "the team's limits could not be read" }, { unreadable: true });
        const outside = top.entries ? list.find((e) => !top.entries.includes(e)) : undefined;
        if (outside !== undefined) return this._refuse("NARROWING_ONLY", { entry: outside }, { entry: outside });
      }
    }
    const at = this._at();
    this._tx(() => {
      if (list === null) this.sql.exec(`DELETE FROM ai_offered WHERE owner=?`, owner);
      else this.sql.exec(`INSERT INTO ai_offered (owner, project_id, entries, set_by, set_at) VALUES (?,?,?,?,?)
                          ON CONFLICT(owner) DO UPDATE SET entries=excluded.entries, set_by=excluded.set_by, set_at=excluded.set_at`,
        owner, owner.startsWith("project:") ? owner.slice(8) : null, JSON.stringify(list), M._memberOf(by), at);
      this._change(owner, "offered_set", { entries: list }, by, null, at);   /* R16 */
    });
    return { ok: true, owner, entries: list };
  }

  /* R46 `offeredOf`: an owner's ceiling, to that owner's authority; `entries` null when there is none. */
  offeredOf({ owner = null, viewer = null } = {}) {
    const bar = this._ownerBar(owner, viewer);
    if (bar) return bar;
    const c = this._ceiling(owner);
    return c.unreadable ? { ok: true, owner, entries: null, unreadable: true } : { ok: true, owner, entries: c.entries };
  }

  /* An owner's ceiling: `{entries}` (an array, or null for none) or `{unreadable: true}` (fail closed, R63). */
  _ceiling(owner) {
    try {
      const r = this._one(`SELECT entries FROM ai_offered WHERE owner=?`, owner);
      if (!r || r.entries === null) return { entries: null };
      const a = JSON.parse(r.entries);
      return Array.isArray(a) ? { entries: a } : { unreadable: true };
    } catch { return { unreadable: true }; }
  }

  /* R46: the entries allowed for an act, the account's allow-list (when given) in its order, cut by the team's ceiling, the
     project's when the act is directly in the project, and the acting member's own; so a later shrink above drops out below
     with no rewrite. `{entries}` or `{unreadable: true}`. */
  _allowedEntries(row, act) {
    const cuts = [this._ceiling("group")];
    if (act && act.project !== undefined && act.project !== null) cuts.push(this._ceiling(`project:${act.project}`));
    const who = act ? M._memberOf(act.member) : null;
    if (who !== null) cuts.push(this._ceiling(`member:${who}`));
    if (cuts.some((c) => c.unreadable)) return { unreadable: true };
    let ents = row ? A._entriesOf(row) : null;
    for (const c of cuts) if (c.entries) ents = ents === null ? [...c.entries] : ents.filter((e) => c.entries.includes(e));
    return { entries: ents };
  }
}

export { isMachineIdentity, ownerSpelled, levelOf };
