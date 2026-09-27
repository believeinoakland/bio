/* connections — THEMES (requirements R39–R48; Framework §8.4, D-162, K77): a connection through an IDEA, fenced four
 * ways. A member declares a theme with its TEST (the sentence a document or a passage passes or fails); a member
 * places a document or a passage in it, or confirms a hunch standing there (membership, grade D); anyone, a machine
 * included, proposes a placement (a hunch, grade C, never membership); and a theme is NEVER the basis of a claim
 * (C-81.1, `themeLegFindings`, at every leg grammar). Moved from `store.mjs` (D-162's region) at this module's
 * extraction; R43's withdrawal and rejection are this job's (K102).
 *
 * A THEME IS NEVER EVIDENCE (R47): its id (`THEME-…`) is no bundle id, content id or entity id, and no theme act
 * writes a bundle, a content row, an entity, an edge or a connection. VISIBILITY: a theme is not existence-private
 * (any recognised viewer reads it); what it CONTAINS is gated per placement by its document, omitted without a count.
 * WHO IS SHOWN (R45, Membership v2 §3): handles for everyone; the member id and the cover only with the control
 * plane's affirmative administer stamp; a machine stamp shown as itself. */

import { isMachineIdentity, BUNDLE_ID_RE, THEME_CHECKS } from "../../checks/bio-checks.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { stampInstant } from "../record-core/index.mjs";
import { CAPTURE_TEXT_UNIT_CAP } from "../extraction/index.mjs";

/** R42, R44: the read's bound (`op=leadread`'s pair). */
export const THEME_READ_LIMIT_DEFAULT = 200;
export const THEME_READ_LIMIT_MAX = 2000;

/** R43 (K102): the refusals of taking a placement back, in the catalogue's shape, minted by this job from C-81.11
 *  (map §5.8). Held here until the catalogue, which may only lose rows while it is a legacy module, carries them. */
export const THEME_WITHDRAW_CHECKS = Object.freeze({
  THEME_WITHDRAW_NOT_A_MEMBER: {
    check: "C-81.11",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw",
    translation: "Taking a document or a passage out of a theme, or turning down a proposal, is a member's own "
      + "judgement, done in their name. A machine may propose a placement; it cannot take one back.",
  },
  THEME_WITHDRAW_NO_REASON: {
    check: "C-81.12",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "Say why. A placement taken back or a proposal turned down keeps its reason beside it, so the next "
      + "reader of the theme can see what was judged and on what ground.",
  },
  THEME_WITHDRAW_NOTHING_STANDING: {
    check: "C-81.13",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "Nothing stands in this theme at that document or passage: it was never placed or proposed there, "
      + "or it has already been taken back. There is nothing to withdraw.",
  },
  THEME_WITHDRAW_NOT_THE_PLACER: {
    check: "C-81.14",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "A membership is taken back by the member who placed it, or by an administrator. Any member may turn "
      + "down a proposal, but another member's placement stands on their judgement until they withdraw it.",
  },
});

const bytes = (s) => new TextEncoder().encode(s).length;
const randHex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");

export class Themes {
  constructor(k) { this.k = k; this.sql = k.sql; }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  static #refusal(code, detail, extra) {
    const row = THEME_CHECKS[code] || THEME_WITHDRAW_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
  }

  /** R45: a person on a theme reading, projected for THIS reader: `<prefix>_handle` for everyone; `<prefix>` (the
   *  member id) and `<prefix>_cover` only with the affirmative administer stamp; a machine stamp is itself. */
  person(prefix, stamp, administer) {
    const pairs = administer === true || administer === "1";
    if (stamp && isMachineIdentity(stamp))
      return { [prefix]: stamp, [`${prefix}_handle`]: null, ...(pairs ? { [`${prefix}_cover`]: null } : {}) };
    const m = stamp ? this.k.membership.memberFacts(stamp) : null;
    const handle = m && m.handle ? m.handle : null;
    if (!pairs) return { [`${prefix}_handle`]: handle };
    return { [prefix]: stamp || null, [`${prefix}_handle`]: handle, [`${prefix}_cover`]: m && m.cover ? m.cover : null };
  }

  /** The same person in a sentence, under the same projection: never the member id for a reader who does not
   *  administer. */
  #name(stamp, administer) {
    const p = this.person("by", stamp, administer);
    return p.by_handle || p.by || "a member whose handle is not recorded";
  }

  /* WHICH THEME: one answer for a theme that does not exist and for a viewer the gate does not recognise. */
  #themeFor(id, viewer) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const tid = typeof id === "string" ? id.trim() : "";
    const g = viewerPredicate(viewer);
    const row = tid && g.scope !== "DENY"
      ? this.#one(`SELECT theme_id, declared_by, name, test, at FROM themes WHERE theme_id = ?`, tid) : null;
    /* DEC-49 REGION is-theme-source */
    if (!row)
      return refusal("THEME_NOT_FOUND",
        tid ? `no theme is recorded under ${tid.slice(0, 60)}`
            : `pass theme=<THEME-…>: the id op=themedeclare returned`, { theme: tid || null });
    /* END DEC-49 REGION is-theme-source */
    return { ok: true, row };
  }

  /* WHAT IS BEING PLACED: a bundle id is a DOCUMENT, a content id a PASSAGE of one; the gate is asked of the document,
     and a target the viewer cannot see answers as one that does not exist. */
  #targetFor(target, note, viewer) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const t = typeof target === "string" ? target.trim() : "";
    const words = typeof note === "string" && note.trim() ? note : null;
    let kind = null, bundleId = null;
    if (BUNDLE_ID_RE.test(t)) {
      const b = this.k.record.bundleInfo(t);
      if (b) { kind = "document"; bundleId = b.id; }
    } else if (/^[0-9a-f]{64}$/.test(t)) {
      const c = this.#one(`SELECT bundle_id FROM content WHERE content_id = ?`, t);
      if (c) { kind = "content"; bundleId = c.bundle_id; }
    }
    const sees = !!bundleId && this.k.sees(bundleId, viewer);
    /* DEC-49 REGION is-theme-target */
    if (!sees)
      return refusal("THEME_TARGET_NOT_FOUND",
        t ? `nothing you can see answers to ${t.slice(0, 80)}: name a document by its bundle id or a passage by `
            + `its content id`
          : `pass target=<a document's bundle id, or a passage's content id>`, { target: t || null });
    if (words && bytes(words) > CAPTURE_TEXT_UNIT_CAP)
      return refusal("THEME_REASON_TOO_LONG",
        `${bytes(words)} B of note, over the ${CAPTURE_TEXT_UNIT_CAP} B one passage is stored to. Refused `
        + `rather than cut`, { limit: CAPTURE_TEXT_UNIT_CAP });
    /* END DEC-49 REGION is-theme-target */
    return { ok: true, target: t, kind, bundleId, note: words };
  }

  /** R39 (`op=themedeclare`): `declarer` is the control plane's stamp. */
  declare({ name = null, test = null, declarer = null, administer = null } = {}) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const who = typeof declarer === "string" ? declarer.trim() : "";
    const idea = typeof name === "string" ? name : "";
    const criterion = typeof test === "string" ? test : "";
    /* DEC-49 REGION is-theme-declare */
    if (!who || isMachineIdentity(who))
      return refusal("THEME_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. A theme is a PERSON's declared lens, in their `
              + `own name (§8.4 fence 1); a machine may propose a placement, never declare a theme`
            : `this call carries nobody. The plane stamps the declarer from the credential that asked`);
    if (!criterion.trim())
      return refusal("THEME_NO_TEST",
        `a theme carries its TEST — the sentence a document or a passage passes or fails, so any member `
        + `can check a placement against it (§8.4 fence 2). None was given, so nothing was declared`);
    if (!idea.trim())
      return refusal("THEME_NO_NAME",
        `a theme names its idea in a few words beside its test. None was given, so nothing was declared`);
    if (bytes(idea) > CAPTURE_TEXT_UNIT_CAP || bytes(criterion) > CAPTURE_TEXT_UNIT_CAP)
      return refusal("THEME_TOO_LONG",
        `${bytes(idea)} B of name and ${bytes(criterion)} B of test, over the ${CAPTURE_TEXT_UNIT_CAP} B `
        + `one passage is stored to (CAPTURE_TEXT_UNIT_CAP). Refused rather than cut`,
        { limit: CAPTURE_TEXT_UNIT_CAP });
    /* END DEC-49 REGION is-theme-declare */
    const at = stampInstant("second");
    /* `THEME-YYYY-MMDD-hex`: no bundle id, content id or entity id (R47). */
    const themeId = `THEME-${at.slice(0, 4)}-${at.slice(5, 7)}${at.slice(8, 10)}-${randHex(6)}`;
    this.sql.exec(`INSERT INTO themes (theme_id, declared_by, name, test, at) VALUES (?, ?, ?, ?, ?)`,
                  themeId, who, idea, criterion, at);
    return { ok: true, theme_id: themeId, name: idea, test: criterion, at,
             ...this.person("declared_by", who, administer), evidence: false,
             says: `${this.#name(who, administer)}'s theme is declared, with its test. It is a lens for finding and `
                 + `gathering material, visibly theirs, and never the basis of a claim: no leg can rest on it `
                 + `or on membership in it` };
  }

  /** R40 (`op=themeplace`): a member places a document or a passage, or confirms a hunch standing there. */
  place({ theme = null, target = null, note = null, placer = null, viewer = null, administer = null } = {}) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const who = typeof placer === "string" ? placer.trim() : "";
    /* DEC-49 REGION is-theme-place */
    if (!who || isMachineIdentity(who))
      return refusal("THEME_PLACEMENT_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. Placing is a member's judgement that the `
              + `document passes the theme's test (§8.4 fence 3); a machine may only propose it, with `
              + `op=themepropose, and the proposal stays a hunch until a member confirms it`
            : `this call carries nobody. The plane stamps the placer from the credential that asked`);
    /* END DEC-49 REGION is-theme-place */
    const src = this.#themeFor(theme, viewer);
    if (!src.ok) return src;
    const T = src.row;
    const tgt = this.#targetFor(target, note, viewer);
    if (!tgt.ok) return tgt;
    const at = stampInstant("second");
    const before = this.#one(`SELECT state FROM theme_placements WHERE theme_id = ? AND target = ?`, T.theme_id, tgt.target);
    if (!before)
      this.sql.exec(
        `INSERT INTO theme_placements (theme_id, target, target_kind, bundle_id, state, grade, placed_by, placed_at, placement_note)
         VALUES (?, ?, ?, ?, 'member', 'D', ?, ?, ?)`, T.theme_id, tgt.target, tgt.kind, tgt.bundleId, who, at, tgt.note);
    else if (before.state === "hunch")
      /* THE CONFIRMATION: the proposer and the proposal's note are KEPT. */
      this.sql.exec(
        `UPDATE theme_placements SET state = 'member', grade = 'D', placed_by = ?, placed_at = ?, placement_note = ?
          WHERE theme_id = ? AND target = ? AND state = 'hunch'`, who, at, tgt.note, T.theme_id, tgt.target);
    const row = this.#one(`SELECT * FROM theme_placements WHERE theme_id = ? AND target = ?`, T.theme_id, tgt.target);
    return { ok: true, theme_id: T.theme_id, ...this.view(row, administer),
             confirmed_hunch: !!before && before.state === "hunch",
             already: !!before && before.state === "member", evidence: false,
             says: before && before.state === "member"
               ? `${tgt.target} was already a member of this theme; nothing changed`
               : `${tgt.target} is a member of the theme "${T.name.slice(0, 80)}" on ${this.#name(who, administer)}'s judgement that it `
                 + `passes the test${before ? ", confirming a proposal" : ""}. Membership connects it to the `
                 + `theme's other members through this lens only, and is never a basis leg` };
  }

  /** R41 (`op=themepropose`): any credential proposes a placement, stored as a HUNCH; never demotes a member. */
  propose({ theme = null, target = null, note = null, proposer = null, viewer = null, administer = null } = {}) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const who = typeof proposer === "string" ? proposer.trim() : "";
    /* DEC-49 REGION is-theme-propose */
    if (!who)
      return refusal("THEME_NO_PROPOSER",
        `this call carries nobody. The plane stamps the proposer from the credential that asked, and a `
        + `hunch nobody can be named for is one the record could say nothing about`);
    /* END DEC-49 REGION is-theme-propose */
    const src = this.#themeFor(theme, viewer);
    if (!src.ok) return src;
    const T = src.row;
    const tgt = this.#targetFor(target, note, viewer);
    if (!tgt.ok) return tgt;
    const at = stampInstant("second");
    const before = this.#one(`SELECT state FROM theme_placements WHERE theme_id = ? AND target = ?`, T.theme_id, tgt.target);
    if (!before)
      this.sql.exec(
        `INSERT INTO theme_placements (theme_id, target, target_kind, bundle_id, state, grade, proposed_by, proposed_at, proposal_note)
         VALUES (?, ?, ?, ?, 'hunch', 'C', ?, ?, ?)`, T.theme_id, tgt.target, tgt.kind, tgt.bundleId, who, at, tgt.note);
    const row = this.#one(`SELECT * FROM theme_placements WHERE theme_id = ? AND target = ?`, T.theme_id, tgt.target);
    return { ok: true, theme_id: T.theme_id, ...this.view(row, administer), already: !!before, evidence: false,
             says: row.state === "member"
               ? `${tgt.target} is already a member of this theme, placed by ${this.#name(row.placed_by, administer)}; the proposal `
                 + `changed nothing`
               : `${tgt.target} is PROPOSED for the theme "${T.name.slice(0, 80)}". It is a hunch — not `
                 + `membership — until a member checks it against the test and places it` };
  }

  /** R43 (`op=themewithdraw`, K102): the placer (or an administrator) withdraws a membership; any member rejects a
   *  hunch; with a reason under the cap. The placement leaves the standing set and is kept whole with every act before
   *  it and the act that ended it; a later placement at the same target is recorded afresh beside it. */
  withdraw({ theme = null, target = null, reason = null, actor = null, viewer = null, administer = null } = {}) {
    const refusal = (code, detail, extra) => Themes.#refusal(code, detail, extra);
    const who = typeof actor === "string" ? actor.trim() : "";
    /* DEC-49 REGION is-theme-withdraw */
    if (!who || isMachineIdentity(who))
      return refusal("THEME_WITHDRAW_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential; taking a placement back is a member's judgement`
            : `this call carries nobody. The plane stamps the member from the credential that asked`);
    /* END DEC-49 REGION is-theme-withdraw */
    const src = this.#themeFor(theme, viewer);
    if (!src.ok) return src;
    const T = src.row;
    const why = typeof reason === "string" ? reason.trim() : "";
    const tgt = this.#targetFor(target, why || null, viewer);
    if (!tgt.ok) return tgt;
    const row = this.#one(`SELECT * FROM theme_placements WHERE theme_id = ? AND target = ?`, T.theme_id, tgt.target);
    const admin = administer === true || administer === "1";
    /* DEC-49 REGION is-theme-withdraw-standing */
    if (!why)
      return refusal("THEME_WITHDRAW_NO_REASON",
        `a placement taken back, or a proposal turned down, keeps its reason; none was given, so nothing changed`);
    if (!row)
      return refusal("THEME_WITHDRAW_NOTHING_STANDING",
        `nothing stands in this theme at ${tgt.target.slice(0, 80)}, so there is nothing to withdraw`, { target: tgt.target });
    if (row.state === "member" && row.placed_by !== who && !admin)
      return refusal("THEME_WITHDRAW_NOT_THE_PLACER",
        `${tgt.target.slice(0, 80)} was placed in this theme by ${this.#name(row.placed_by, administer)}; a membership is `
        + `withdrawn by its placer or by an administrator`, { target: tgt.target });
    /* END DEC-49 REGION is-theme-withdraw-standing */
    const state = row.state === "member" ? "withdrawn" : "rejected";
    const at = stampInstant("second");
    this.k.record.transact(() => {
      this.sql.exec(
        `INSERT INTO theme_placement_acts (theme_id, target, target_kind, bundle_id, state, grade, proposed_by, proposed_at,
                                           proposal_note, placed_by, placed_at, placement_note, ended_by, ended_at, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        row.theme_id, row.target, row.target_kind, row.bundle_id, state, row.grade, row.proposed_by, row.proposed_at,
        row.proposal_note, row.placed_by, row.placed_at, row.placement_note, who, at, why);
      this.sql.exec(`DELETE FROM theme_placements WHERE theme_id = ? AND target = ?`, row.theme_id, row.target);
      return { ok: true };
    });
    const ended = this.#one(`SELECT * FROM theme_placement_acts WHERE theme_id = ? AND target = ? ORDER BY act_id DESC LIMIT 1`,
                            row.theme_id, row.target);
    return { ok: true, theme_id: T.theme_id, ...this.endedView(ended, administer), evidence: false,
             says: `${tgt.target} is ${state === "withdrawn" ? "no longer a member of" : "no longer proposed for"} the theme `
                 + `"${T.name.slice(0, 80)}": ${this.#name(who, administer)} ${state} it, saying why. What was judged `
                 + `before is kept beside it` };
  }

  /** R44: one standing placement as this reader is shown it. `membership` is true for `member` alone. */
  view(r, administer) {
    return { target: r.target, target_kind: r.target_kind, document: r.bundle_id,
             state: r.state, membership: r.state === "member", hunch: r.state === "hunch", grade: r.grade,
             ...this.person("placed_by", r.placed_by, administer), placed_at: r.placed_at, note: r.placement_note,
             ...this.person("proposed_by", r.proposed_by, administer), proposed_at: r.proposed_at,
             proposal_note: r.proposal_note };
  }

  /** R43: a placement taken back: neither membership nor a hunch, with who, when and why, and the acts before it. */
  endedView(r, administer) {
    return { target: r.target, target_kind: r.target_kind, document: r.bundle_id, state: r.state,
             membership: false, hunch: false, grade: r.grade,
             ...this.person("placed_by", r.placed_by, administer), placed_at: r.placed_at, note: r.placement_note,
             ...this.person("proposed_by", r.proposed_by, administer), proposed_at: r.proposed_at,
             proposal_note: r.proposal_note,
             ...this.person("ended_by", r.ended_by, administer), ended_at: r.ended_at, reason: r.reason };
  }

  /** R42, R44 (`op=themeread`): the themes (narrowed by `q`), or ONE theme with its members and its hunches apart and
   *  its placements taken back apart again, each gated per placement by its document, bounded on its own. */
  read({ id = null, q = null, limit = null, viewer = null, administer = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || THEME_READ_LIMIT_DEFAULT), THEME_READ_LIMIT_MAX));
    const who = (m) => this.person("declared_by", m, administer);
    if (id == null || String(id).trim() === "") {
      const g = viewerPredicate(viewer);
      const phrase = typeof q === "string" ? q.trim() : "";
      const rows = this.#rows(
        `SELECT theme_id, declared_by, name, test, at FROM themes
          WHERE ? = 1 AND (? = '' OR instr(lower(name), lower(?)) > 0 OR instr(lower(test), lower(?)) > 0)
          ORDER BY at DESC, theme_id LIMIT ?`, g.scope === "DENY" ? 0 : 1, phrase, phrase, phrase, cap + 1);
      return { ok: true, q: phrase || null, limit: cap, truncated: rows.length > cap, evidence: false,
               themes: rows.slice(0, cap).map((r) => ({ theme_id: r.theme_id, name: r.name, test: r.test, at: r.at,
                                                         ...who(r.declared_by) })) };
    }
    const src = this.#themeFor(id, viewer);
    if (!src.ok) return src;
    const T = src.row;
    const g = viewerPredicate(viewer);
    const page = (state) => this.#rows(
      `SELECT p.* FROM theme_placements p JOIN bundles b ON b.bundle_id = p.bundle_id
        WHERE p.theme_id = ? AND p.state = ? AND (${g.sql}) ORDER BY p.target LIMIT ?`,
      T.theme_id, state, ...g.args, cap + 1);
    const members = page("member");
    const hunches = page("hunch");
    const ended = this.#rows(
      `SELECT p.* FROM theme_placement_acts p JOIN bundles b ON b.bundle_id = p.bundle_id
        WHERE p.theme_id = ? AND (${g.sql}) ORDER BY p.target, p.act_id LIMIT ?`, T.theme_id, ...g.args, cap + 1);
    const n = (rows) => `${Math.min(rows.length, cap)}${rows.length > cap ? "+" : ""}`;
    return {
      ok: true, theme_id: T.theme_id, name: T.name, test: T.test, at: T.at, ...who(T.declared_by),
      evidence: false, limit: cap,
      members: members.slice(0, cap).map((r) => this.view(r, administer)),
      members_truncated: members.length > cap,
      hunches: hunches.slice(0, cap).map((r) => this.view(r, administer)),
      hunches_truncated: hunches.length > cap,
      withdrawn: ended.slice(0, cap).map((r) => this.endedView(r, administer)),
      withdrawn_truncated: ended.length > cap,
      says: `a member's declared lens, and never the basis of a claim. `
          + `${n(members)} member(s) you can see, placed by a member against the test; `
          + `${n(hunches)} hunch(es) PROPOSED and not yet confirmed, which are not membership`,
    };
  }
}
