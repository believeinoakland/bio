/* ai-accounts' base: what every other part of the module stands on. The instance's clock and database reads (R39), the
 * refusals and the one site of each (DEC-49 regions: `where` in `checks.mjs` names them), who may act on an owner's
 * accounts (R1, R5, R10), the seal (R2, R24), the catalogue's reads as this module needs them (R40, R55), the disclosure-
 * first order (R23), and the history of changes (R16).
 *
 * The module is one class built in layers, each file one `extends` of the one before (base, limits, accounts, offering,
 * serving, lifecycle, then `index.mjs`), so that no file grows past what one reader holds; what the layers share is named
 * with a leading underscore and is the module's, never a caller's. Every refusal names its reason; no service throws. */
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { Membership, notAnAdmin, noSuchProject, notTheOwner, listenerRefusal } from "../membership/index.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { AI_ACCOUNT_CHECKS, AI_WORDS, fillSentence } from "./checks.mjs";
import { USE_KINDS, EXPLORE_VALUES, USE_SWITCHES, USE_DEFAULTS, stampSecond, ownerSpelled } from "./constants.mjs";

/* The founder's role and member id (membership's `ROOT_ADMIN`). */
export const ROOT = Membership.ROOT_ADMIN;

const deepFreeze = (o) => { for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v); return Object.freeze(o); };
export { deepFreeze };

export class AiAccountsBase {
  /* R39 (fix round 10, STORE-REQUEST #5; K5192): `now` is the instance clock handed in (a function of milliseconds), read
     before the store's environment; `env` is set by `aiAccountsOps` from the store's environment (`BIO_NOW_MS`).
     `catalogue` is `ai-catalogue`'s service (R40: its `plansOf`, `entryOf`, `entriesFor`, `whyNotOffered`). */
  constructor({ sql, core = null, membership = null, sealSecret = null, now = null, catalogue = null } = {}) {
    this.sql = sql;
    this.core = core;
    this.membership = membership;
    this.catalogue = catalogue;
    this._sealSecret = typeof sealSecret === "string" && sealSecret !== "" ? sealSecret : null;
    this.now = typeof now === "function" ? now : null;
    this.env = null;
  }

  static _enc = new TextEncoder();

  _rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  _one(q, ...a) { const r = this._rows(q, ...a); return r.length ? r[0] : null; }

  /* R39 (fix round 10, K5132's rule, as `credentials`' `#nowMs`): the instance clock. A handed `now` answers first, else
     the store's `env.BIO_NOW_MS`, else the wall clock. Every instant this module records, and every judgement of one,
     reads it. */
  _nowMs() {
    if (this.now) {
      const handed = Number(this.now());
      if (Number.isFinite(handed) && handed >= 0) return handed;
    }
    const raw = this.env ? this.env.BIO_NOW_MS : undefined;
    if (raw !== undefined && raw !== null && raw !== "") {
      const v = Number(raw);
      if (Number.isFinite(v) && v >= 0) return v;
    }
    return Date.now();
  }

  /* The instance clock's instant, as a whole second. */
  _at() { return stampSecond(this._nowMs()); }

  /* One act as one transaction, through record-core's `transact` (its R32) when the store offers it. */
  _tx(fn) { return typeof this.core?.transact === "function" ? this.core.transact(fn) : fn(); }

  /* The member an actor or viewer names: `member:<id>` or a bare member id; null for anything else. */
  static _memberOf(x) {
    if (typeof x !== "string") return null;
    const id = x.startsWith("member:") ? x.slice(7) : x;
    return id !== "" ? id : null;
  }

  /* ===== the refusals ===== */

  /* A refusal of the old rows, whose `detail` the site writes (R33: numbers, codes and words kept). */
  static _row(table, code, detail, extra) {
    const r = table[code];
    return { ok: false, reason: code, code, check: r.check, translation: r.translation, detail, ...(extra || {}) };
  }

  /* R58: a refusal of a T53 row: its code, its row and its translation, the `detail` the translation filled with the
     answer's values. The one site of them all (K231). */
  _refuse(code, vars = {}, extra = {}) {
    /* DEC-49 REGION is-ai-refusal */
    const r = AI_ACCOUNT_CHECKS[code];
    return { ok: false, reason: code, code, check: r.check, translation: r.translation,
             detail: fillSentence(r.translation, vars), ...extra };
    /* END DEC-49 REGION is-ai-refusal */
  }

  /* R1–R3, `credentials` R27, R7: NOT_YOUR_ACCOUNT, minted here alone; `detail` is the asking act's fixed sentence. */
  static _notYours(detail) {
    /* DEC-49 REGION is-account-theirs */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "NOT_YOUR_ACCOUNT", detail);
    /* END DEC-49 REGION is-account-theirs */
  }

  /* R7, R25: no account serves this act, or the owner named holds none (`scope`: `served`, `account`, `owner`). */
  _noAccount(member, scope = "served") {
    /* DEC-49 REGION is-account-held */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "NO_ACCOUNT", scope === "account"
      ? localize("ai-accounts.index.that_account_is_not_held", "no such account is held, or it is not the one asked for. Nothing was changed.")
      : scope === "owner" ? localize("ai-accounts.index.this_owner_holds_no_ai", "this owner holds no AI account. Nothing was written.")
      : localize("ai-accounts.index.no_ai_account_serves_this", "no AI account serves this act: its member, its project and the team hold none that is on and held. Nothing was used."), { member });
    /* END DEC-49 REGION is-account-held */
  }

  /* R1, R5: an empty key or token, refused before anything is sealed. */
  static _noSecret(secret) {
    /* DEC-49 REGION is-secret-given */
    if (typeof secret !== "string" || secret.trim() === "")
      return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "NO_SECRET", localize("ai-accounts.index.no_key_or_token_was", "no key or token was given. Nothing was written."));
    return null;
    /* END DEC-49 REGION is-secret-given */
  }

  /* R14: every switch an account holds. */
  static _switchName(name, names = USE_SWITCHES) {
    /* DEC-49 REGION is-account-switch */
    if (name === null || name === undefined)
      return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "UNKNOWN_SWITCH", localize("ai-accounts.index.the_request_names_no_switch", "the request names no switch; the switches are {names}. Nothing was written.", { names: String(names.join(", ")) }), { switch: null });
    if (typeof name !== "string" || !names.includes(name))
      return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "UNKNOWN_SWITCH", localize("ai-accounts.index.the_switches_are_names_nothing", "the switches are {names}. Nothing was written.", { names: String(names.join(", ")) }), { switch: typeof name === "string" ? name.slice(0, 40) : null });
    return null;
    /* END DEC-49 REGION is-account-switch */
  }

  /* R14, R22: SWITCH_VALUE_INVALID, minted here alone: `what` and the values it takes. */
  static _valueInvalid(what, values, extra) {
    /* DEC-49 REGION is-switch-value */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "SWITCH_VALUE_INVALID", localize("ai-accounts.index.what_takes_map_nothing_was", "{what} takes {map}. Nothing was changed.", { what: String(what), map: String(values.map(String).join(", ")) }), { values: [...values], ...(extra || {}) });
    /* END DEC-49 REGION is-switch-value */
  }

  /* R14: `explore` one of EXPLORE_VALUES; any other switch a boolean. */
  static _switchValueFault(name, on) {
    if (on === undefined) {
      const values = name === "explore" ? EXPLORE_VALUES : [true, false];
      return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "SWITCH_VALUE_INVALID", localize("ai-accounts.index.the_request_gives_no_on", "the request gives no on to set; {what} takes {map}. Nothing was changed.", { what: name === "explore" ? "the explore switch" : `the ${name} switch`, map: String(values.map(String).join(", ")) }), { values: [...values], switch: name });
    }
    if (name === "explore") return EXPLORE_VALUES.includes(on) ? null
      : AiAccountsBase._valueInvalid("the explore switch", EXPLORE_VALUES, { switch: name });
    return typeof on === "boolean" ? null : AiAccountsBase._valueInvalid(`the ${name} switch`, [true, false], { switch: name });
  }

  static _stored(name, on) { return name === "explore" ? on : on ? 1 : 0; }

  static _USE_COLUMN = Object.freeze({ ask: "use_ask", draft: "use_draft", run: "use_run", standing: "standing",
    explore: "explore", enquire: "use_enquire", read: "use_read", transcribe: "use_transcribe", account: "use_account",
    suggestions: "suggestions" });
  static _USES_COLUMNS = USE_SWITCHES.map((k) => AiAccountsBase._USE_COLUMN[k]).join(", ");

  /* An account's switches from its row, as R14 names them, in USE_SWITCHES' order. */
  static _usesOf(r) {
    return Object.fromEntries(USE_SWITCHES.map((k) => [k, k === "explore"
      ? (EXPLORE_VALUES.includes(r?.explore) ? r.explore : "no") : !!r?.[AiAccountsBase._USE_COLUMN[k]]]));
  }

  /* R11: AI_USE_SWITCHED_OFF, minted here alone: the account the walk chose holds the act's kind off, and the act never
     moves to the next account (Bob, K2352). `whose` is `project`, `own` or `group`. */
  static _switchedOff(whose, use, project = null) {
    /* DEC-49 REGION is-use-switched-on */
    const name = whose === "project" ? "this project's" : whose === "group" ? "your team's" : "your own";
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "AI_USE_SWITCHED_OFF", localize("ai-accounts.index.the_account_used_for_this", "the account used for this act is {name} AI account, and its switch for {use} is off; the act does not move to another account. Nothing was used.", { name: String(name), use: String(use) }),
      { whose, use, ...(project !== null ? { project } : {}) });
    /* END DEC-49 REGION is-use-switched-on */
  }

  /* ===== who may act ===== */

  /* membership R68: a member's standing, or null. Never throws here: an unreadable answer is no member. */
  _memberFacts(memberId) {
    if (typeof memberId !== "string" || memberId === "") return null;
    try { return this.membership.memberFacts(memberId) || null; } catch { return null; }
  }

  /* R1, R19, R31 (T47; K3069, C5): whether `id` holds as an active member: an active member of the roster, or the founder
     (`admin`) once the instance is claimed, who holds no member row. */
  _holderActive(id) {
    if (id === ROOT) { try { return this.membership.isAdministrator(ROOT) === true; } catch { return false; } }
    return this._memberFacts(id)?.status === "active";
  }

  _adminBar(by, act) {
    const who = AiAccountsBase._memberOf(by);
    return who !== null && !isMachineIdentity(by) && this.membership.isAdministrator(who) ? null : notAnAdmin(by ?? null, act);
  }

  /* R1: who may act on `member`'s accounts. Null when `by` is that member's own act and the member is active. A `member`
     naming no member of the roster is refused as any principal but the acting member is: NOT_YOUR_ACCOUNT, or
     ACCOUNT_MEMBER_NOT_ACTIVE when it names the actor themself (K1756). */
  _accountBar(member, by) {
    const refuse = (code, detail) => AiAccountsBase._row(AI_ACCOUNT_CHECKS, code, detail);
    /* DEC-49 REGION is-account-own-act */
    if (by === null || by === undefined || by === "" || isMachineIdentity(by))
      return refuse("MACHINE_CANNOT_HOLD_ACCOUNT", localize("ai-accounts.index.a_members_ai_account_is", "a member's AI account is held only by that member's own act, from their own signed-in session; this caller has no member behind it. Nothing was written."));
    const id = AiAccountsBase._memberOf(member);
    if (id === null || AiAccountsBase._memberOf(by) !== id)
      return AiAccountsBase._notYours(localize("ai-accounts.index.a_members_account_is_acted", "a member's AI account is acted on only by that member; another member, an administrator or the founder cannot. Nothing was written."));
    if (!this._holderActive(id))
      return refuse("ACCOUNT_MEMBER_NOT_ACTIVE", localize("ai-accounts.index.only_an_active_member_holds", "only an active member holds an AI account. Nothing was written."));
    /* END DEC-49 REGION is-account-own-act */
    return null;
  }

  _isMachine(by) { return by === null || by === undefined || by === "" || isMachineIdentity(by); }

  /* membership R122: PROJECT_ACT_NOT_THE_OWNER, minted there alone. */
  _notTheOwner(by, project) { return notTheOwner(by ?? null, project); }

  /* membership R44: the caller's sight of `project`, NONE for anything that names no project; never throws. */
  _sightOf(project, viewer) {
    if (typeof project !== "string" || project === "") return Membership.SIGHT_NONE;
    try { return this.membership.sight(project, viewer); } catch { return Membership.SIGHT_NONE; }
  }

  /* Sight first (`credentials` R44, R77): NONE answers as absent, EXISTENCE C-70.1; null when the caller sees the project. */
  _unseen(project, viewer) {
    const s = this._sightOf(project, viewer);
    if (s === Membership.SIGHT_FULL) return null;
    const absent = noSuchProject(typeof project === "string" ? project : null);
    return s === Membership.SIGHT_EXISTENCE ? (this.membership.existenceAct(project, viewer) ?? absent) : absent;
  }

  _isOwner(project, id) { try { return this.membership.isProjectOwner(project, id) === true; } catch { return false; } }
  _isJoined(project, id) { try { return this.membership.isJoinedParticipant(project, id) === true; } catch { return false; } }

  /* R10: an act on a project's AI settings is an owner's (membership R54); a machine credential, the operator's token or
     an unstamped call is refused the same way. */
  _projectOwnerBar(project, by, act) {
    const id = AiAccountsBase._memberOf(by);
    if (this._isMachine(by) || id === null) return this._notTheOwner(by, project);
    const unseen = this._unseen(project, `member:${id}`);
    if (unseen) return unseen;
    return this._isOwner(project, id) ? null : this._notTheOwner(by, project);
  }

  /* R11: a project a member acts in is one they have joined (membership R54's set; PROJECT_ACT_NOT_A_PARTICIPANT for
     one they see and have not joined). */
  _participantBar(project, id, act) {
    const viewer = `member:${id}`;
    const unseen = this._unseen(project, viewer);
    if (unseen) return unseen;
    return this.membership.projectAuthority(project, viewer, "joined", act);
  }

  /* R1, R5, R10, R14: who may act on the accounts of `owner`, spelled as R14's (`group`, `project:<id>`, `member:<id>`).
     The team's by an active administrator (`NOT_AN_ADMIN`), a project's by one of its owners (`PROJECT_ACT_NOT_THE_OWNER`,
     after sight), a member's own by that member alone (R1's refusals). `machineFirst` is for the acts whose requirement
     refuses every machine credential as `MACHINE_CANNOT_HOLD_ACCOUNT` whatever the owner (R41, R68, R69, R70). An owner
     spelled otherwise is refused as R1 refuses any principal but the actor, `NOT_YOUR_ACCOUNT` naming it when none is
     given (T51; K4206). Null when the act is allowed. */
  _ownerAuthority(owner, by, act, { machineFirst = false } = {}) {
    if (machineFirst && this._isMachine(by)) return this._accountBar(null, by);
    if (!ownerSpelled(owner)) {
      const bar = this._accountBar(null, by);
      if (owner === null || owner === undefined) {
        return bar.code === "NOT_YOUR_ACCOUNT"
          ? AiAccountsBase._notYours(localize("ai-accounts.index.the_request_names_no_owner", "the request names no owner: the account is group, project:<id> or member:<id>. Nothing was written.")) : bar;
      }
      return bar;
    }
    if (owner === "group") return this._adminBar(by, act);
    if (owner.startsWith("project:")) return this._projectOwnerBar(owner.slice(8), by, act);
    return this._accountBar(owner, by);
  }

  /* R15, R16: the owners of an account are those who may act on it; null when `viewer` is one of them. */
  _ownerBar(owner, viewer) { return this._ownerAuthority(owner, viewer, "reading an account's settings"); }

  /* ===== R16: the history ===== */

  static _ownerOfProject(project) { return `project:${project}`; }

  /* One change, in the caller's act. `origin` names the earlier record written beside it, or null. */
  _change(owner, change, detail, by, origin = null, at = this._at()) {
    const project = owner.startsWith("project:") ? owner.slice(8) : null;
    this.sql.exec(`INSERT OR IGNORE INTO account_changes (owner, project_id, at, by, change, detail, origin)
                   VALUES (?,?,?,?,?,?,?)`, owner, project, at, AiAccountsBase._memberOf(by), change,
      detail ? JSON.stringify(detail) : null, origin);
  }

  _lastSeq() { return Number(this._one(`SELECT last_insert_rowid() AS id`)?.id ?? 0); }

  /* ===== R2, R24: THE SEAL ===== */

  /* AES-256-GCM under a key derived (HKDF-SHA-256) from the Worker's seal secret, the owner as salt (`member:<id>`,
     `project:<id>` or `group`), so the key is never stored beside the row and no other owner's key opens it. The AAD binds
     the ciphertext to its owner and kind, so a row moved to another owner does not open. Byte-identical to the seal
     `credentials` held before T48 (HKDF info `bio-credentials-seal/1`), so every row sealed before opens. */
  static _b64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); }
  static _unb64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }

  async _sealKey(owner) {
    const base = await crypto.subtle.importKey("raw", AiAccountsBase._enc.encode(this._sealSecret), "HKDF", false,
      ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt: AiAccountsBase._enc.encode(owner),
        info: AiAccountsBase._enc.encode("bio-credentials-seal/1") },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }

  static _sealRefusal(detail) {
    /* DEC-49 REGION is-seal-bound */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE", detail);
    /* END DEC-49 REGION is-seal-bound */
  }

  _seal() {
    return this._sealSecret === null ? AiAccountsBase._sealRefusal(localize("ai-accounts.index.your_teams_civicsmith_has_no", "your team's Civicsmith has no seal secret set, so a key cannot be kept sealed or read. Nothing was stored or read.")) : null;
  }

  async _encrypt(owner, kind, secret) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: AiAccountsBase._enc.encode(`${owner}|${kind}`) },
      await this._sealKey(owner), AiAccountsBase._enc.encode(secret));
    return { sealed: AiAccountsBase._b64(new Uint8Array(ct)), iv: AiAccountsBase._b64(iv) };
  }

  /* Null when the row does not open (the seal secret changed): the caller answers ACCOUNT_SEAL_UNAVAILABLE. */
  async _decrypt(owner, kind, sealed, iv) {
    try {
      const pt = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: AiAccountsBase._unb64(iv), additionalData: AiAccountsBase._enc.encode(`${owner}|${kind}`) },
        await this._sealKey(owner), AiAccountsBase._unb64(sealed));
      return new TextDecoder().decode(pt);
    } catch { return null; }
  }

  /* R24 `sealText`: `text` sealed under `owner` and `kind`, `{ok, sealed, iv}`, or ACCOUNT_SEAL_UNAVAILABLE when no seal
     secret is bound. In-plane only, for `credentials` R29. Never throws. */
  async sealText({ owner = null, kind = null, text = null } = {}) {
    const unsealable = this._seal();
    if (unsealable) return unsealable;
    try {
      const { sealed, iv } = await this._encrypt(String(owner), String(kind), String(text));
      return { ok: true, sealed, iv };
    } catch {
      return AiAccountsBase._sealRefusal(localize("ai-accounts.index.the_key_could_not_be", "the key could not be sealed by your team's Civicsmith. Nothing was stored or read."));
    }
  }

  /* R24 `unsealText`: the text sealed under `owner` and `kind`, `{ok, text}`; ACCOUNT_SEAL_UNAVAILABLE when no seal secret
     is bound or the row does not open (the seal secret changed, or another owner's or kind's row). Never throws. */
  async unsealText({ owner = null, kind = null, sealed = null, iv = null } = {}) {
    const unsealable = this._seal();
    if (unsealable) return unsealable;
    const text = typeof sealed === "string" && typeof iv === "string"
      ? await this._decrypt(String(owner), String(kind), sealed, iv) : null;
    if (text === null)
      return AiAccountsBase._sealRefusal(localize("ai-accounts.index.the_key_does_not_open", "the key does not open under the seal secret of your team's Civicsmith, which has changed; its owner sets it again. Nothing was used."));
    return { ok: true, text };
  }

  /* ===== the catalogue, as this module reads it (R40, R55, R63) ===== */

  /* A list the catalogue answered, as an array: an array itself, or the one a `{plans}`, `{entries}` or `{rows}` answer
     holds; null when it answered neither (unreadable: fail closed, K2093). */
  static _listOf(x, key) {
    if (Array.isArray(x)) return x;
    if (x && typeof x === "object" && x.ok !== false) {
      if (Array.isArray(x[key])) return x[key];
      if (Array.isArray(x.rows)) return x.rows;
    }
    return null;
  }

  /* CATALOGUE_UNAVAILABLE is `ai-catalogue`'s own row (its R49), used as it mints it; a catalogue that cannot be asked at
     all is that refusal, with the row when the catalogue gives it. */
  _catalogueUnavailable() {
    try {
      const r = this.catalogue?.unavailable?.();
      if (r && r.code === "CATALOGUE_UNAVAILABLE") return r;
    } catch { /* the refusal below */ }
    return { ok: false, reason: "CATALOGUE_UNAVAILABLE", code: "CATALOGUE_UNAVAILABLE", check: null, translation: null,
             detail: localize("ai-accounts.index.the_list_of_ais_could", "the list of AIs could not be read, so nothing was offered. Nothing was written or used.") };
  }

  /* R40: the plan `planId` under `provider`, `{plan}`, or `{refusal}`: UNKNOWN_PLAN when the catalogue has no such plan,
     CATALOGUE_UNAVAILABLE when it cannot be read. */
  _plan(provider, planId) {
    const cat = this.catalogue;
    if (!cat || typeof cat.plansOf !== "function") return { refusal: this._catalogueUnavailable() };
    let list;
    try { list = AiAccountsBase._listOf(cat.plansOf({ provider, plan_id: planId }), "plans"); } catch { list = null; }
    if (list === null) return { refusal: this._catalogueUnavailable() };
    const plan = list.find((p) => p && (p.plan_id ?? p.id) === planId && (p.provider === undefined || p.provider === provider));
    if (!plan) return { refusal: this._refuse("UNKNOWN_PLAN", { provider: String(provider), plan: String(planId) }, { provider: provider ?? null, plan: planId ?? null }) };
    return { plan };
  }

  /* An account's plan, by its row. */
  _planOfRow(row) { return this._plan(row.provider, row.plan); }

  /* R55: the entry `entryId`, `{entry}` (null when the catalogue has no such id), or `{unreadable: true}`. */
  _entry(entryId) {
    const cat = this.catalogue;
    if (!cat || typeof cat.entryOf !== "function") return { unreadable: true };
    try {
      const e = cat.entryOf(entryId);
      if (e && typeof e === "object" && e.ok === false) return { unreadable: true };
      return { entry: e ?? null };
    } catch { return { unreadable: true }; }
  }

  /* R51: the recipient `{provider, host}` of an entry. */
  static _recipientOf(entry) {
    const r = entry?.recipient;
    return { provider: String(r?.provider ?? entry?.provider ?? ""), host: String(r?.host ?? entry?.host ?? "") };
  }

  /* R40: the entry ids the catalogue lists for `planId`, in catalogue order: those of `entriesFor` for each part that name
     the plan among their plans. Null when it cannot be read. */
  _planEntries(planId) {
    const cat = this.catalogue;
    if (!cat || typeof cat.entriesFor !== "function") return null;
    const seen = [];
    try {
      for (const part of ["ask", "draft", "read", "transcribe", "run", "account"]) {
        const list = AiAccountsBase._listOf(cat.entriesFor({ part, checksInForce: [] }), "entries");
        if (list === null) return null;
        for (const e of list) {
          const plans = Array.isArray(e?.plans) ? e.plans : [];
          if (plans.includes(planId) && typeof e.entry_id === "string" && !seen.includes(e.entry_id)) seen.push(e.entry_id);
        }
      }
    } catch { return null; }
    return seen;
  }

  /* ===== R23: THE DISCLOSURE-FIRST ORDER (T47, N981; K231, K3027, K3030) =====
   *
   * Before a member's own account is connected she is shown what connecting means, and `instance-setup` (its R54) records
   * that it was shown. That record is a later module's, so this module cannot read it: one later module (instance-setup,
   * or the composition root on its behalf) registers, once at start, its `disclosureOf`, and `disclosureDue` asks it. This
   * is the one site that mints DISCLOSURE_DUE (K231): R1 refuses through it, and `signin-door` R1's refusal of a sign-in's
   * `start` answers through it. Fail closed: anything but `shown: true`, a throw, or an answer that is not one (a promise
   * among them) is the refusal. With none registered nothing is asked and nothing is held. */
  _disclosureSource = null;   // {module, fn}

  /* R23: one registration, whoever makes it; its refusals are membership's R81, naming the holder. */
  registerDisclosureRead(module, fn) {
    const refused = listenerRefusal(this._disclosureSource, module, fn);
    if (refused) return refused;
    this._disclosureSource = { module, fn };
    return { ok: true, module };
  }

  /* R23: an in-plane read, reached by no route and answered to no viewer: null when the registered read answers
     `shown: true` for `member` (or none is registered), else the one DISCLOSURE_DUE refusal. Writes nothing; never
     throws. */
  disclosureDue({ member = null } = {}) {
    const source = this._disclosureSource;
    if (source === null) return null;
    let shown = false;
    try {
      const a = source.fn({ member });
      shown = !!a && typeof a === "object" && typeof a.then !== "function" && a.shown === true;
    } catch { shown = false; }
    if (shown) return null;
    /* DEC-49 REGION is-disclosure-shown */
    return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "DISCLOSURE_DUE", localize("ai-accounts.index.you_have_not_yet_been", "you have not yet been shown what connecting your own AI account means, so nothing was connected or sent. Read it, then try again."),
      { member: typeof member === "string" ? member : null });
    /* END DEC-49 REGION is-disclosure-shown */
  }

  /* ===== R25: the one-site helpers of C-29.14, C-29.20 and C-29.15 (K231), for credentials' grants ===== */
  notYourAccount(detail) { return AiAccountsBase._notYours(detail); }
  noAccount(member, scope = "served") { return this._noAccount(member, scope); }
  accountMemberNotActive(detail, extra) { return AiAccountsBase._row(AI_ACCOUNT_CHECKS, "ACCOUNT_MEMBER_NOT_ACTIVE", detail, extra); }
}

export { AI_ACCOUNT_CHECKS, AI_WORDS, USE_DEFAULTS, USE_KINDS, word };
