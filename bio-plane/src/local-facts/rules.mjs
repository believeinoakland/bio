/* local-facts: the group's own jurisdiction rules (requirements: `build/requirements/local-facts.md`, R10–R14; T45, N858;
 * Actions D8; DESIGN §10; `BIO_Action_v0_2.md` rules 10, 11). `jurisdictions` is pure and holds no store (its R17), so a
 * rule a group drafts from its primary source lives here, beside the members' acts on profile facts.
 *
 * A member drafts a `deadlines` or `legal_facts` entry from a held capture extent (R10); a second member confirms it
 * (R11), stating her professional qualification when the rule's tier is 2, 3 or undetermined. The statement is an
 * attestation of that one act: it is kept on the confirmation's row and answered only with the rule by `groupRules`
 * (R12), never by a read keyed by member, never counted, never in `governingView` or an offer (R13), and no other module
 * reads it. A confirmed, unwithdrawn rule joins `governingView` at once (R12); a withdrawal is kept, never deleted, and
 * the rule leaves the view from then on (R13). `ruleOffer` gives a confirmed rule as canonical bytes with their digest
 * for a member to carry to the shared profile's maintainers; the instance transmits nothing.
 *
 * Every act is a row of `local_rule_acts`, appended and never rewritten (R14): a rule's state is read from its rows in
 * order. A machine never drafts, confirms or withdraws; an assistant's draft reaches a member as labelled run output and
 * enters only by her own `ruleDraft`.
 *
 * `GroupRules` is reached through `LocalFacts` (its `ruleDraft`, `ruleConfirm`, `groupRules`, `governingView`,
 * `ruleWithdraw`, `ruleOffer`), which passes the host's readers: `combine` and `validate` (`jurisdictions`), the active
 * profile ids (record-core's setting), `sourceRefusal` (the primary source's check over `content`), `instant` and
 * `dayOf` (the local day of an instant in the view's zone). */

import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { refusal } from "./checks.mjs";

/** R10: the sections a group's rule may be drafted in (`jurisdictions` R26, R79). */
export const RULE_SECTIONS = Object.freeze(["deadlines", "legal_facts"]);
/** R10–R13: a rule's states, read from its acts. */
export const RULE_STATES = Object.freeze(["drafted", "confirmed", "withdrawn"]);
/** R10, R13: a reason, and R11: a professional's statement, in characters. */
export const RULE_REASON_MAX = 500, RULE_STATEMENT_MAX = 500;
/** R12: the `profile` a group rule is tagged with in `governingView`. */
export const GROUP_PROFILE = "group";

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const RULE_ID_RE = /^GR-([1-9][0-9]{0,15})$/;
const ruleId = (seq) => `GR-${seq}`;

/* The key of a section's entry (R10): a deadline's `rule` and `applies_to`, a legal fact's `key`. */
const keyOf = (section, e) => (!isObj(e) ? null : section === "deadlines"
  ? (typeof e.rule === "string" && typeof e.applies_to === "string" ? `${e.rule}\u0000${e.applies_to}` : null)
  : (typeof e.key === "string" ? e.key : null));
const keyWords = (section, e) => (section === "deadlines" ? { rule: e.rule, applies_to: e.applies_to } : { key: e.key });

/* A member's identity, folded so the founder's two spellings (`admin`, `member:admin`) are one (membership R43). */
function who(by) {
  const s = str(by);
  const g = viewerPredicate(s);
  return g.member ?? s;
}
/* A viewer naming a member (R12): a `member:<id>` viewer or the founder's. */
const namesMember = (viewer) => { const g = viewerPredicate(viewer); return g.scope === "participant"; };

/* The view's profile tags (`profile`, `bases`, jurisdictions R13, R14) taken off, so a section copied from it validates
   as a profile's own. */
function untagged(v) {
  if (Array.isArray(v)) return v.map(untagged);
  if (!isObj(v)) return v;
  const out = {};
  for (const [k, x] of Object.entries(v)) {
    if ((k === "profile" && typeof x === "string") || (k === "bases" && Array.isArray(x))) continue;
    out[k] = untagged(x);
  }
  return out;
}
/* The sections a deadline or a legal fact may name, copied from the view so a draft's references resolve (R10). */
const CONTEXT_SECTIONS = ["action_kinds", "counterparties", "records_laws", "standard_sources", "closures", "holidays",
  "computation", "weekend", "time_zone"];

export class GroupRules {
  constructor({ sql, record, combine, validate, profileIds, sourceRefusal, instant, dayOf }) {
    this.sql = sql;
    this.record = record;
    this.combine = combine;
    this.validate = validate;
    this.profileIds = profileIds;
    this.sourceRefusal = sourceRefusal;
    this.instant = instant;
    this.dayOf = dayOf;
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }

  /* `jurisdictions.combine` over the active profiles, as record-core's setting names them (its R26). */
  #combined() {
    const ids = this.profileIds();
    try { return this.combine(Array.isArray(ids) ? ids : []); }
    catch (e) { return { ok: false, errors: [{ code: "COMBINE_FAILED", detail: String(e && e.message || e).slice(0, 200) }] }; }
  }

  /* Every rule, from its rows in order: `{rule, seq, section, entry, source, reason, drafter, drafted_at, state,
     confirmation?, withdrawal?}`. The confirmation carries its statement; only `groupRules` answers it. */
  #rules() {
    const byDraft = new Map();
    for (const r of this.#rows(`SELECT * FROM local_rule_acts ORDER BY seq`)) {
      if (r.act === "draft") {
        byDraft.set(r.seq, { rule: ruleId(r.seq), seq: r.seq, section: r.section, entry: safeJson(r.entry_json),
                             source: safeJson(r.source_json), reason: r.reason, drafter: r.by_member, drafted_at: r.at,
                             state: "drafted", confirmation: null, withdrawal: null });
        continue;
      }
      const rule = byDraft.get(r.draft_seq);
      if (!rule) continue;
      if (r.act === "confirm" && rule.state === "drafted")
        rule.confirmation = { by: r.by_member, at: r.at, statement: r.statement ?? null }, rule.state = "confirmed";
      else if (r.act === "withdraw" && !rule.withdrawal)
        rule.withdrawal = { by: r.by_member, at: r.at, reason: r.reason }, rule.state = "withdrawn";
    }
    return [...byDraft.values()];
  }
  #rule(id) {
    const m = typeof id === "string" ? RULE_ID_RE.exec(id.trim()) : null;
    return m ? this.#rules().find((r) => r.seq === Number(m[1])) || null : null;
  }

  /* The day a rule was confirmed, as `governingView` names it: the local day in the view's zone, else the instant's
     own date (a basis names a day, jurisdictions R2). */
  #day(view, at) { return this.dayOf(at, isObj(view) && isObj(view.time_zone) ? view.time_zone.value : null) ?? String(at).slice(0, 10); }

  /* ===================================================================== *
   * R12: governingView
   * ===================================================================== */

  /** R12: `combine`'s answer for the active profiles, each confirmed, unwithdrawn group rule added to its section,
   *  tagged `profile: "group"` with a `basis` naming its confirmation's day and its id (no statement, no handle). A rule
   *  whose key the view already holds, from a profile or an earlier group rule, is not added: one value per key
   *  (jurisdictions R15), reported in `conflicts`. With no group rule the answer equals `combine`'s. Writes nothing;
   *  never throws. */
  governingView() {
    try {
      const c = this.#combined();
      if (!c || !c.ok) return c;
      const rules = this.#rules().filter((r) => r.state === "confirmed");
      if (!rules.length) return c;
      const view = clone(c.view);
      const conflicts = [...(Array.isArray(c.conflicts) ? c.conflicts : [])];
      for (const r of rules) {
        const list = Array.isArray(view[r.section]) ? view[r.section] : (view[r.section] = []);
        const k = keyOf(r.section, r.entry);
        const held = list.find((e) => keyOf(r.section, e) === k);
        if (k === null || held) {
          conflicts.push({ at: `${r.section}[${JSON.stringify(keyWords(r.section, r.entry || {}))}]`,
                           values: [{ profile: held ? held.profile : null, rule: r.rule }],
                           says: `the group's rule ${r.rule} holds a key the view already holds, so the view's entry stands and the rule is not added` });
          continue;
        }
        const basis = `${this.#day(c.view, r.confirmation.at)} ${r.rule}`;
        list.push({ ...clone(r.entry), status: "researched", basis, profile: GROUP_PROFILE,
                    bases: [{ profile: GROUP_PROFILE, basis }] });
      }
      return { ...c, view, conflicts };
    } catch (e) {
      return { ok: false, errors: [{ code: "VIEW_FAILED", detail: String(e && e.message || e).slice(0, 200) }] };
    }
  }

  /* ===================================================================== *
   * R10: ruleDraft
   * ===================================================================== */

  /** R10: a member drafts a rule from its primary source. Refusals in order, each writing nothing:
   *  MACHINE_CANNOT_DRAFT_RULE, RULE_SECTION_UNKNOWN, RULE_ENTRY_INVALID, RULE_NO_SOURCE, RULE_IN_PROFILE, RULE_NO_REASON (R10's NO_REASON, owner-prefixed as K231).
   *  Answers `{ok, rule, state: "drafted"}`. */
  ruleDraft(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const section = b.section;
    if (!RULE_SECTIONS.includes(section)) return sectionRefusal(section);
    const at = this.instant();
    const c = this.#combined();
    const errors = this.#entryErrors(section, b.entry, c && c.ok ? c.view : null, at);
    /* DEC-49 REGION is-rule-entry */
    if (errors.length)
      return refusal("RULE_ENTRY_INVALID", `the entry is not valid as a ${section} entry of a jurisdiction profile.`,
                     { errors: errors.slice(0, 20) });
    /* END DEC-49 REGION is-rule-entry */
    const bad = this.sourceRefusal(b.source, b.viewer);
    /* DEC-49 REGION is-rule-source */
    if (bad)
      return refusal("RULE_NO_SOURCE", "a rule is drafted from a held capture extent of its primary source "
                     + `({captureSha, extent}): ${bad.why}`, bad.code ? { source_code: bad.code } : undefined);
    /* END DEC-49 REGION is-rule-source */
    const entry = { ...clone(b.entry) };
    delete entry.basis; delete entry.status;
    const k = keyOf(section, entry);
    const gv = this.governingView();
    const held = gv && gv.ok && Array.isArray(gv.view[section]) ? gv.view[section].find((e) => keyOf(section, e) === k) : null;
    /* DEC-49 REGION is-rule-new */
    if (held)
      return refusal("RULE_IN_PROFILE", `the governing view already holds ${section} ${JSON.stringify(keyWords(section, entry))}`
                     + ` (from ${held.profile === GROUP_PROFILE ? `the group's rule, ${held.basis}` : `the profile ${held.profile}`}); `
                     + "dispute it or offer a correction instead.",
                     { held: { section, ...keyWords(section, entry), profile: held.profile ?? null } });
    /* END DEC-49 REGION is-rule-new */
    const reason = str(b.reason);
    const noReason = reasonRefusal(reason);
    if (noReason) return noReason;
    const source = { captureSha: b.source.captureSha.trim().toLowerCase(), extent: clone(b.source.extent) };
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (NULL, 'draft', ?, ?, ?, ?, NULL, ?, ?)`,
                    section, canonicalJson(entry), canonicalJson(source), reason, by, at);
      const seq = this.#rows(`SELECT MAX(seq) AS s FROM local_rule_acts`)[0].s;
      return { ok: true, rule: ruleId(seq), state: "drafted", at };
    });
  }

  /* R10: `jurisdictions.validate`'s errors for the entry, over a profile holding it alone in its section, its `basis`
     (the draft's day) and `status` (`researched`) supplied here; the view's other sections the entry may name (kinds,
     offices, laws, closure lists, computations) are copied in so its references resolve, and only errors under the
     entry's own path are answered. */
  #entryErrors(section, entry, view, at) {
    if (!isObj(entry)) return [{ path: `${section}[0]`, code: "VALUE_INVALID", detail: "the entry is an object" }];
    const p = { id: "group-rule", name: "The group's rule", covers: ["the group"], test: !!(isObj(view) && view.test) };
    if (isObj(view)) for (const s of CONTEXT_SECTIONS) if (view[s] !== undefined && s !== section) p[s] = untagged(view[s]);
    p[section] = [{ ...clone(entry), status: "researched", basis: this.#day(view, at) }];
    let v;
    try { v = this.validate(p); } catch (e) { return [{ path: `${section}[0]`, code: "VALUE_INVALID", detail: String(e && e.message || e).slice(0, 200) }]; }
    if (!v || v.ok) return [];
    const mine = `${section}[0]`;
    return (v.errors || []).filter((e) => typeof e.path === "string" && (e.path === mine || e.path.startsWith(`${mine}.`) || e.path.startsWith(`${mine}[`)));
  }

  /* ===================================================================== *
   * R11: ruleConfirm
   * ===================================================================== */

  /* R11: the tier of the `action_kinds` kind a rule's `applies_to` names in the active view: 1, 2, 3, or null when
     undetermined (a `claim` rule, a kind the view lacks or gives no tier; a legal fact naming no kind). A legal fact
     naming several kinds reads Tier 1 only when every one is Tier 1. */
  #tier(r) {
    const c = this.#combined();
    const kinds = c && c.ok && Array.isArray(c.view.action_kinds) ? c.view.action_kinds : [];
    const tierOf = (k) => { const e = kinds.find((x) => isObj(x) && x.kind === k); return e && [1, 2, 3].includes(e.tier) ? e.tier : null; };
    const named = r.section === "deadlines" ? (r.entry.applies_to === "claim" ? [] : [r.entry.applies_to])
      : (Array.isArray(r.entry.applies_to) ? r.entry.applies_to : []);
    if (!named.length) return null;
    const tiers = named.map(tierOf);
    if (tiers.some((t) => t === null)) return null;
    return Math.max(...tiers);
  }

  /** R11: a member other than the drafter confirms a drafted rule. Refusals in order: MACHINE_CANNOT_CONFIRM (by the
   *  caller, `machineRefusal`), NO_SUCH_GROUP_RULE, RULE_SELF_CONFIRM, RULE_NOT_DRAFTED, RULE_NEEDS_QUALIFICATION. A Tier 1
   *  rule asks no statement and records none given. */
  ruleConfirm(b, machineRefusal) {
    const machine = machineRefusal(b.by);
    if (machine) return machine;
    const r = namesMember(b.viewer) || b.viewer === undefined || b.viewer === null ? this.#rule(b.rule) : null;
    if (!r) return noSuchRule(b.rule);
    /* DEC-49 REGION is-rule-other */
    if (who(r.drafter) === who(b.by))
      return refusal("RULE_SELF_CONFIRM", "a rule is confirmed by a member other than its drafter.", { rule: r.rule });
    /* END DEC-49 REGION is-rule-other */
    /* DEC-49 REGION is-rule-drafted */
    if (r.state !== "drafted")
      return refusal("RULE_NOT_DRAFTED", `the rule is ${r.state}; only a drafted rule is confirmed.`, { rule: r.rule, state: r.state });
    /* END DEC-49 REGION is-rule-drafted */
    const tier = this.#tier(r);
    const statement = str(b.statement);
    const needs = tier !== 1;
    /* DEC-49 REGION is-rule-qualified */
    if (needs && (!statement || statement.length > RULE_STATEMENT_MAX))
      return refusal("RULE_NEEDS_QUALIFICATION", `a rule of tier ${tier ?? "undetermined"} is confirmed by a professional, `
                     + `who states her qualification in 1 to ${RULE_STATEMENT_MAX} characters.`,
                     { rule: r.rule, tier, max: RULE_STATEMENT_MAX });
    /* END DEC-49 REGION is-rule-qualified */
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (?, 'confirm', NULL, NULL, NULL, NULL, ?, ?, ?)`,
                    r.seq, needs ? statement : null, by, at);
      return { ok: true, rule: r.rule, state: "confirmed", at, tier, with_statement: needs };
    });
  }

  /* ===================================================================== *
   * R12: groupRules
   * ===================================================================== */

  /** R12: the group's rules with their state, source, drafter, confirmer, dates and (confirmed with one) the
   *  statement, to a viewer naming a member; any other viewer is answered none. Writes nothing; never throws. */
  groupRules(a = {}) {
    try {
      const b = isObj(a) ? a : {};
      if (b.section !== undefined && b.section !== null && !RULE_SECTIONS.includes(b.section)) return sectionRefusal(b.section);
      if (!namesMember(b.viewer)) return { ok: true, rules: [], count: 0 };
      const rules = this.#rules().filter((r) => !b.section || r.section === b.section).map((r) => ({
        rule: r.rule, section: r.section, state: r.state, entry: r.entry, source: r.source, reason: r.reason,
        drafter: r.drafter, drafted_at: r.drafted_at,
        confirmer: r.confirmation ? r.confirmation.by : null, confirmed_at: r.confirmation ? r.confirmation.at : null,
        ...(r.confirmation && r.confirmation.statement ? { statement: r.confirmation.statement } : {}),
        ...(r.withdrawal ? { withdrawn: { ...r.withdrawal } } : {}),
      }));
      return { ok: true, rules, count: rules.length };
    } catch (e) {
      return { ok: true, rules: [], count: 0, why: `undetermined: the rules could not be read (${String(e && e.message || e).slice(0, 200)})` };
    }
  }

  /* ===================================================================== *
   * R13: ruleWithdraw, ruleOffer
   * ===================================================================== */

  /** R13: any member withdraws a rule with a reason; kept, never deleted; it leaves `governingView` from then on.
   *  Refusals: MACHINE_CANNOT_DRAFT_RULE (R14), NO_SUCH_GROUP_RULE, RULE_NO_REASON; a repeat answers `already: true`. */
  ruleWithdraw(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const r = namesMember(b.viewer) || b.viewer === undefined || b.viewer === null ? this.#rule(b.rule) : null;
    if (!r) return noSuchRule(b.rule);
    const reason = str(b.reason);
    const noReason = reasonRefusal(reason);
    if (noReason) return noReason;
    if (r.withdrawal) return { ok: true, rule: r.rule, state: "withdrawn", already: true, at: r.withdrawal.at };
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (?, 'withdraw', NULL, NULL, NULL, ?, NULL, ?, ?)`, r.seq, reason, by, at);
      return { ok: true, rule: r.rule, state: "withdrawn", already: false, at };
    });
  }

  /** R13: a confirmed, unwithdrawn rule as canonical bytes with their digest, for a member to carry to the shared
   *  profile's maintainers: its section, entry, primary source and `confirmed: {at, with_statement}`. It never carries
   *  the statement's words or a handle; the instance transmits nothing. Refusals: NO_SUCH_GROUP_RULE (also to a viewer not
   *  naming a member), RULE_NOT_CONFIRMED. Writes nothing. */
  ruleOffer(a = {}) {
    const b = isObj(a) ? a : {};
    const r = namesMember(b.viewer) ? this.#rule(b.rule) : null;
    if (!r) return noSuchRule(b.rule);
    /* DEC-49 REGION is-rule-confirmed */
    if (r.state !== "confirmed")
      return refusal("RULE_NOT_CONFIRMED", `the rule is ${r.state}; only a confirmed rule the group still applies is offered.`,
                     { rule: r.rule, state: r.state });
    /* END DEC-49 REGION is-rule-confirmed */
    const offer = { section: r.section, entry: r.entry, source: r.source,
                    confirmed: { at: r.confirmation.at, with_statement: !!r.confirmation.statement } };
    const bytes = canonicalJson(offer);
    return { ok: true, rule: r.rule, offer, bytes, digest: sha256HexSync(bytes),
             note: "carry these bytes to the shared profile's maintainers yourself; your group's Civicsmith transmits nothing" };
  }
}

/* DEC-49: a code several acts answer is minted at one site, its own function here. */

/* R10, R13, R14: drafting and withdrawing a rule are a named member's acts. */
function machineRuleRefusal(by) {
  /* DEC-49 REGION is-rule-member */
  if (str(by) && !isMachineIdentity(str(by))) return null;
  return refusal("MACHINE_CANNOT_DRAFT_RULE", "drafting or withdrawing a group's rule is a named member's act; an "
                 + "assistant's draft reaches a member as its run's output. Nothing was written.");
  /* END DEC-49 REGION is-rule-member */
}

/* R10, R12, R17: a section that is neither `deadlines` nor `legal_facts`, given to a draft or to the read of the group's
   rules; the one builder of RULE_SECTION_UNKNOWN, so both answer the same refusal. */
function sectionRefusal(section) {
  /* DEC-49 REGION is-rule-section */
  return refusal("RULE_SECTION_UNKNOWN", `a group's rule is drafted in ${RULE_SECTIONS.join(" or ")}.`,
                 { section: typeof section === "string" ? section.slice(0, 40) : null, sections: [...RULE_SECTIONS] });
  /* END DEC-49 REGION is-rule-section */
}

/* R10, R13: a reason of 1 to 500 characters. */
function reasonRefusal(reason) {
  /* DEC-49 REGION is-rule-reason */
  if (reason && reason.length <= RULE_REASON_MAX) return null;
  return refusal("RULE_NO_REASON", `say why, in 1 to ${RULE_REASON_MAX} characters.`, { max: RULE_REASON_MAX });
  /* END DEC-49 REGION is-rule-reason */
}

/* R11, R13: no rule of the group's by that id, or none the viewer may see (R11's NO_SUCH_RULE, owner-prefixed as K231:
   `action-clocks` answers a bare NO_SUCH_RULE for a profile's deadline). */
function noSuchRule(id) {
  /* DEC-49 REGION is-rule-named */
  return refusal("NO_SUCH_GROUP_RULE", "the group holds no rule of its own by that id.",
                 { rule: typeof id === "string" ? id.slice(0, 40) : null });
  /* END DEC-49 REGION is-rule-named */
}
