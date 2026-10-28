/* ai-accounts' material limits (R20–R22, R34, R57): keeping the team's, or a project's, material away from AI. DEC-172's
 * separate choice from whether the team pays: an active administrator may keep the team's material away from every
 * assistant, every account a member's own included, and turns it on only with a reason every member reads, in the
 * administrator's own words. Off by default. Each set is appended with who and when, never replacing an earlier one; the
 * latest is the setting. A limit binds every account, a personal subscription among them, and is judged before the
 * account, the checks or the list (R57): `accountFor` (R7) asks `aiKeptAway` first, so no ask, run or standing question
 * reaches a model while one covers its use. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { noSuchProject } from "../membership/index.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { AiAccountsBase } from "./base.mjs";
import { AI_ACCOUNT_CHECKS } from "./checks.mjs";
import { USE_KINDS, KEEP_AWAY_REASON } from "./constants.mjs";

export class AiAccountsLimits extends AiAccountsBase {
  /* R21: the latest set, or off before any. Never throws: a setting that cannot be read is answered `on: null`, not
     known, which R7 reads as kept away (a failure never sends material out). */
  aiKeepAwayState() {
    try {
      const r = this._one(`SELECT is_on, reason, set_by, set_at, uses FROM ai_keep_away ORDER BY seq DESC LIMIT 1`);
      return r ? { on: !!r.is_on, reason: r.reason ?? null, set_by: r.set_by, set_at: r.set_at, uses: AiAccountsLimits._usesList(r.uses) }
               : { on: false, reason: null, set_by: null, set_at: null, uses: [...USE_KINDS] };
    } catch { return { on: null, reason: null, set_by: null, set_at: null, uses: null }; }
  }

  /* R22 (T40): the uses a material limit covers, from its stored JSON: every kind when none was named (a limit set before
     T40 covers every use), and, for a value that does not read, every kind (fail closed). */
  static _usesList(json) {
    if (json === null || json === undefined) return [...USE_KINDS];
    try {
      const a = JSON.parse(json);
      return Array.isArray(a) && a.length ? USE_KINDS.filter((k) => a.includes(k)) : [...USE_KINDS];
    } catch { return [...USE_KINDS]; }
  }

  /* R22: a limit covers `use` when it is on and names it; with no `use` asked, whenever it is on ("as now", K2404 (4)). */
  static _covers(limit, use) {
    return limit.on === true && (use === null || use === undefined || (Array.isArray(limit.uses) && limit.uses.includes(use)));
  }

  /* R22: `uses` as set: absent (every use) or a non-empty list of USE_KINDS entries, each once; answers `{json}` to
     store, or `{fault}`, SWITCH_VALUE_INVALID naming the values (K2404 (4)). */
  static _usesToStore(uses) {
    if (uses === null || uses === undefined) return { json: null };
    if (Array.isArray(uses) && uses.length && uses.every((u) => USE_KINDS.includes(u)) && new Set(uses).size === uses.length)
      return { json: JSON.stringify(USE_KINDS.filter((k) => uses.includes(k))) };
    return { fault: AiAccountsBase._valueInvalid(word("ai-accounts.fault"), USE_KINDS) };
  }

  static _limitDetail(r) { return { on: !!r.is_on, uses: AiAccountsLimits._usesList(r.uses), reason: r.reason ?? null }; }

  /* R20 (DEC-172), R22: the reason rule a material limit is set under, the team's or a project's: `on: true` needs a
     reason of 1 to 2,000 characters, not blank; a reason given with `on: false` is held to the same bounds.
     AI_KEEP_AWAY_NO_REASON, minted here alone. */
  static _keepAwayReason(turnOn, reason) {
    const given = typeof reason === "string" && reason.trim() !== "";
    const length = typeof reason === "string" ? [...reason].length : 0;
    /* DEC-49 REGION is-keep-away-reason */
    if ((turnOn && !given) || (given && length > KEEP_AWAY_REASON.max) || (reason !== null && reason !== undefined
        && typeof reason !== "string"))
      return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON", localize("ai-accounts.index.keeping_material_away_from_the", "keeping material away from the assistant is turned on only with a reason of {min} to {max} characters, which every member reads{v1}. Nothing was changed.", { min: String(KEEP_AWAY_REASON.min), max: String(KEEP_AWAY_REASON.max), v1: String(given ? localize("ai-accounts.index.this_one_has", "; this one has {length}", { length: String(length) }) : "") }));
    /* END DEC-49 REGION is-keep-away-reason */
    return null;
  }

  /* R20 (`op=aikeepaway`): an active administrator's act. `on: true` needs a reason of 1 to 2,000 characters, not blank;
     a reason given with `on: false` is kept under the same bounds. Each refusal writes nothing. (T40; R22) It takes
     `uses`, the kinds of use the limit covers (all when absent). */
  aiKeepAwaySet({ on = false, uses = null, reason = null, by = null } = {}) {
    const bar = this._adminBar(by, localize("ai-accounts.index.keeping_the_teams_material_away", "keeping the team's material away from every assistant"));
    if (bar) return bar;
    const turnOn = on === true;
    const noReason = AiAccountsLimits._keepAwayReason(turnOn, reason);
    if (noReason) return noReason;
    const u = AiAccountsLimits._usesToStore(uses);
    if (u.fault) return u.fault;
    const given = typeof reason === "string" && reason.trim() !== "";
    this._tx(() => {
      const at = this._at();
      this.sql.exec(`INSERT INTO ai_keep_away (is_on, reason, set_by, set_at, uses) VALUES (?,?,?,?,?)`, turnOn ? 1 : 0,
        given ? reason : null, AiAccountsBase._memberOf(by), at, u.json);
      this._change("group", "limit_set", AiAccountsLimits._limitDetail({ is_on: turnOn, uses: u.json, reason: given ? reason : null }),
        by, `ai_keep_away:${this._lastSeq()}`, at);   /* R16 */
    });
    return { ok: true, ...this.aiKeepAwayState() };
  }

  /* R7 (T37; N765, K231): AI_KEPT_AWAY, minted here alone, carrying R21's reason, who and when as `keep_away` (the
     answer's own `reason` is its code); null while the setting is off. An in-plane read reached by no route and answered
     to no viewer: R7 and `credentials` refuse through it, and every module that gates an assistant on keep-away reads it,
     never a copy of the condition. A setting that cannot be read is that refusal, saying so, with the three null (fail
     closed, K2093). Writes nothing; never throws. (T48; R34, N1041) Whatever part of a limit cannot be read, or an error
     inside the read, it answers a refusal with its row, never a throw: an error the reads below do not catch answers
     `KEPT_AWAY_UNREADABLE`, the unreadable form of this one site's own answer. */
  aiKeptAway({ project = null, use = null } = {}) {
    try {
      let st;
      try { st = this.aiKeepAwayState(); } catch { st = { on: null, reason: null, set_by: null, set_at: null }; }
      if (st.on === false || (st.on === true && !AiAccountsLimits._covers(st, use))) return this._projectKeptAway(project, use);
      return AiAccountsLimits._keptAway(st);
    } catch {
      const u = this.constructor.KEPT_AWAY_UNREADABLE;
      return u ? { ...u, keep_away: { ...u.keep_away } } : { ok: false, reason: "AI_KEPT_AWAY", code: "AI_KEPT_AWAY", keep_away: { reason: null, set_by: null, set_at: null } };
    }
  }

  /* R7: the refusal `aiKeptAway` answers while the team's limit covers the use, or cannot be read (`st.on` not `true`). */
  static _keptAway(st) {
    /* DEC-49 REGION is-kept-away */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "AI_KEPT_AWAY", st.on === true
      ? localize("ai-accounts.index.the_team_keeps_its_material", "the team keeps its material away from every assistant, so no account was read or used. Nothing was sent.")
      : localize("ai-accounts.index.whether_the_team_keeps_its", "whether the team keeps its material away from every assistant could not be read, so no account was read or used. Nothing was sent."), { keep_away: { reason: st.reason, set_by: st.set_by, set_at: st.set_at } });
    /* END DEC-49 REGION is-kept-away */
  }

  /* R22: a project's material limit, the latest set, or off before any. Throws when it cannot be read: its caller fails
     closed. */
  _projectLimit(project) {
    const r = this._one(`SELECT is_on, uses, reason, set_by, set_at FROM project_keep_away WHERE project_id=?
                         ORDER BY seq DESC LIMIT 1`, project);
    return r ? { on: !!r.is_on, uses: AiAccountsLimits._usesList(r.uses), reason: r.reason ?? null, set_by: r.set_by, set_at: r.set_at }
             : { on: false, uses: [...USE_KINDS], reason: null, set_by: null, set_at: null };
  }

  /* R22: PROJECT_AI_KEPT_AWAY, minted here alone, with the limit's reason, who and when; null when `project` names none or
     its limit does not cover `use`. A limit that cannot be read is that refusal, saying so (fail closed, K2093). */
  _projectKeptAway(project, use) {
    if (project === null || project === undefined) return null;
    let lim;
    try { lim = this._projectLimit(String(project)); } catch { lim = { on: null, reason: null, set_by: null, set_at: null }; }
    if (lim.on === false || (lim.on === true && !AiAccountsLimits._covers(lim, use))) return null;
    /* DEC-49 REGION is-project-kept-away */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "PROJECT_AI_KEPT_AWAY", lim.on === true
      ? localize("ai-accounts.index.this_project_keeps_its_material", "this project keeps its material away from the assistant for this use, so no account was read or used. Nothing was sent.")
      : localize("ai-accounts.index.whether_this_project_keeps_its", "whether this project keeps its material away from the assistant could not be read, so no account was read or used. Nothing was sent."),
      { project: String(project), use: use ?? null, keep_away: { reason: lim.reason, set_by: lim.set_by, set_at: lim.set_at } });
    /* END DEC-49 REGION is-project-kept-away */
  }

  /* R22 `projectAiKeepAwaySet`: an owner's act (R10's refusals), R20's reason rule, `uses` as R20's; answers the state. */
  projectAiKeepAwaySet({ project = null, on = false, uses = null, reason = null, by = null } = {}) {
    const bar = this._projectOwnerBar(project, by, "keeping a project's material away from the assistant");
    if (bar) return bar;
    const turnOn = on === true;
    const noReason = AiAccountsLimits._keepAwayReason(turnOn, reason);
    if (noReason) return noReason;
    const u = AiAccountsLimits._usesToStore(uses);
    if (u.fault) return u.fault;
    const given = typeof reason === "string" && reason.trim() !== "";
    this._tx(() => {
      const at = this._at();
      this.sql.exec(`INSERT INTO project_keep_away (project_id, is_on, uses, reason, set_by, set_at) VALUES (?,?,?,?,?,?)`,
        project, turnOn ? 1 : 0, u.json, given ? reason : null, AiAccountsBase._memberOf(by), at);
      this._change(AiAccountsBase._ownerOfProject(project), "limit_set",
        AiAccountsLimits._limitDetail({ is_on: turnOn, uses: u.json, reason: given ? reason : null }), by,
        `project_keep_away:${this._lastSeq()}`, at);   /* R16 */
    });
    return { ok: true, project, ...this._projectLimit(project) };
  }

  /* R22 `projectAiKeepAwayState`: the project's limit, to its participants (joined or leaving); anyone else as absent.
     Writes nothing. */
  projectAiKeepAwayState({ project = null, viewer = null } = {}) {
    const id = AiAccountsBase._memberOf(viewer);
    const absent = noSuchProject(typeof project === "string" ? project : null);
    if (id === null || isMachineIdentity(viewer)) return absent;
    const unseen = this._unseen(project, `member:${id}`);
    if (unseen) return unseen;
    if (!this._isJoined(project, id)) return absent;
    try { return { ok: true, project, ...this._projectLimit(project) }; }
    catch { return { ok: true, project, on: null, uses: null, reason: null, set_by: null, set_at: null }; }
  }

  /* R22 `projectsKeptAway`: the ids of the projects whose limit covers `use`, for reads under a grant (`answers` R30) and
     exploring's scope (`ai-use` R9). In-plane; writes nothing; null when the limits cannot be read, which its caller reads
     as unknown. */
  projectsKeptAway({ use = null } = {}) {
    try {
      return this._rows(`SELECT k.project_id, k.is_on, k.uses FROM project_keep_away k
                         WHERE k.seq = (SELECT MAX(seq) FROM project_keep_away q WHERE q.project_id = k.project_id)
                         ORDER BY k.project_id`)
        .filter((r) => AiAccountsLimits._covers({ on: !!r.is_on, uses: AiAccountsLimits._usesList(r.uses) }, use))
        .map((r) => r.project_id);
    } catch { return null; }
  }
}
