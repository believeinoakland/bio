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
 * `dayOf` (the local day of an instant in the view's zone).
 *
 * (T53, R24, R28) These rules are entries of THE one team layer (`layer.mjs`; `jurisdictions` R115): a rule is stored with
 * its `layer` (`team`) and, when it is about one government, that `government`, and the view tags each applied rule
 * `origin: "team"` with its `layer` and `government`. A rule's key is judged within its layer and government first, then
 * across the active layers (R28). `combined` is the view the host builds over the active layers and the team layer's own
 * confirmed entries; `layers` is the host's reading of which layers a rule may name (`writable`, `closure`). */

import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { refusal } from "./checks.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { COUNTS, DIRECTIONS, LEGAL_FACT_TRIGGERS, OWED_BY, STARTS, UNITS } from "../../../jurisdictions/index.mjs";
import { TEAM_LAYER } from "./paths.mjs";

/** R10: the sections a group's rule may be drafted in (`jurisdictions` R26, R79). */
export const RULE_SECTIONS = Object.freeze(["deadlines", "legal_facts"]);
/** R10–R13: a rule's states, read from its acts. */
export const RULE_STATES = Object.freeze(["drafted", "confirmed", "withdrawn"]);
/** R10, R13: a reason, and R11: a professional's statement, in characters. */
export const RULE_REASON_MAX = 500, RULE_STATEMENT_MAX = 500;
/** R18: the day a member-drafted rule takes effect; a rule of a profile carries none. */
export const EFFECTIVE_FROM = "effective_from";
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const isDay = (v) => {
  const m = typeof v === "string" ? DATE_RE.exec(v) : null;
  return !!m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toISOString().slice(0, 10) === v;
};
/** R18: what an entry of each section is made of, in `jurisdictions`' field order, then the day it takes effect. The
 *  frozen data of this module (`jurisdictions` stays pure): `kind` is `text`, `number`, `date` or `choice`; a `choices`
 *  of `null` is filled from the active view's kinds (`applies_to`) when asked. A field of `jurisdictions` that no
 *  `kind` here can draw (a deadline's `starter`, `extension`, `tolling`, a legal fact's `threshold`) is left out. */
/* K3997: a member's draft offers the seven starts the design draws; `third_party` needs a `starter` no field draws. */
const DRAFT_STARTS = Object.freeze(STARTS.filter((x) => x !== "third_party"));
export const RULE_FIELDS = Object.freeze({
  deadlines: Object.freeze([
    Object.freeze({ field: "rule", required: true, kind: "text" }),
    Object.freeze({ field: "applies_to", required: true, kind: "choice", choices: null }),
    Object.freeze({ field: "units", required: true, kind: "choice", choices: UNITS }),
    Object.freeze({ field: "amount", required: true, kind: "number" }),
    Object.freeze({ field: "count", required: false, kind: "choice", choices: COUNTS }),
    Object.freeze({ field: "direction", required: false, kind: "choice", choices: DIRECTIONS }),
    Object.freeze({ field: "starts", required: true, kind: "choice", choices: DRAFT_STARTS }),
    Object.freeze({ field: "owed_by", required: false, kind: "choice", choices: OWED_BY }),
    Object.freeze({ field: "due_at", required: false, kind: "text" }),
    Object.freeze({ field: "citation", required: true, kind: "text" }),
    Object.freeze({ field: EFFECTIVE_FROM, required: true, kind: "date" }),
  ]),
  legal_facts: Object.freeze([
    Object.freeze({ field: "key", required: true, kind: "text" }),
    Object.freeze({ field: "trigger", required: true, kind: "choice", choices: LEGAL_FACT_TRIGGERS }),
    Object.freeze({ field: "statement", required: true, kind: "text" }),
    Object.freeze({ field: "citation", required: true, kind: "text" }),
    Object.freeze({ field: "applies_to", required: false, kind: "choice", many: true, choices: null }),
    Object.freeze({ field: EFFECTIVE_FROM, required: true, kind: "date" }),
  ]),
});
/** R12: the `profile` a group rule is tagged with in `governingView`. */
export const GROUP_PROFILE = "group";

export const str = (v) => (typeof v === "string" ? v.trim() : "");
export const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
export const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
export const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/** R23, R28: the government an entry or rule is about: `{level, place}` of a county or a city (`jurisdictions` R115); the
 *  errors of a malformed one, in `jurisdictions`' shape. */
export const governmentErrors = (g, at = "government", levels = ["county", "city"]) => {
  if (!isObj(g) || Object.keys(g).sort().join() !== "level,place" || !levels.includes(g.level)
      || typeof g.place !== "string" || !g.place.trim() || g.place.length > 200 || /[\r\n]/.test(g.place))
    return [{ path: at, code: "LAYER_INVALID", detail: `government is {level, place}: level ${levels.join(" or ")}, place a name of 1 to 200 characters on one line` }];
  return [];
};
export const sameGovernment = (a, b) => (!isObj(a) && !isObj(b)) || (isObj(a) && isObj(b) && a.level === b.level && (a.place ?? null) === (b.place ?? null));
const RULE_ID_RE = /^GR-([1-9][0-9]{0,15})$/;
const ruleId = (seq) => `GR-${seq}`;

/* The key of a section's entry (R10): a deadline's `rule` and `applies_to`, a legal fact's `key`. */
const keyOf = (section, e) => (!isObj(e) ? null : section === "deadlines"
  ? (typeof e.rule === "string" && typeof e.applies_to === "string" ? `${e.rule}\u0000${e.applies_to}` : null)
  : (typeof e.key === "string" ? e.key : null));
const keyWords = (section, e) => (section === "deadlines" ? { rule: e.rule, applies_to: e.applies_to } : { key: e.key });

/* A member's identity, folded so the founder's two spellings (`admin`, `member:admin`) are one (membership R43). */
export function who(by) {
  const s = str(by);
  const g = viewerPredicate(s);
  return g.member ?? s;
}
/* A viewer naming a member (R12): a `member:<id>` viewer or the founder's. */
export const namesMember = (viewer) => { const g = viewerPredicate(viewer); return g.scope === "participant"; };

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
  constructor({ sql, record, combined, validate, layers, sourceRefusal, instant, dayOf }) {
    this.sql = sql;
    this.record = record;
    this.combined = combined;
    this.validate = validate;
    this.layers = layers;
    this.sourceRefusal = sourceRefusal;
    this.instant = instant;
    this.dayOf = dayOf;
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }

  /* `jurisdictions.combine` over the active layers, as record-core's setting names them (its R26), with the team layer's
     own confirmed entries (R23) beside them. */
  #combined() {
    try { return this.combined(); }
    catch (e) { return { ok: false, errors: [{ code: "COMBINE_FAILED", detail: String(e && e.message || e).slice(0, 200) }] }; }
  }

  /* Every rule, from its rows in order: `{rule, seq, section, entry, source, reason, drafter, drafted_at, state,
     confirmation?, withdrawal?}`. The confirmation carries its statement; only `groupRules` answers it. */
  #rules() {
    const byDraft = new Map();
    for (const r of this.#rows(`SELECT * FROM local_rule_acts ORDER BY seq`)) {
      if (r.act === "draft") {
        byDraft.set(r.seq, { rule: ruleId(r.seq), seq: r.seq, section: r.section, layer: r.layer ?? TEAM_LAYER,
                             government: safeJson(r.government_json), entry: safeJson(r.entry_json),
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
   * R12, R18: governingView
   * ===================================================================== */

  /** R12: `combine`'s answer for the active profiles, each confirmed, unwithdrawn group rule added to its section,
   *  tagged `profile: "group"` with a `basis` naming its confirmation's day and its id (no statement, no handle). A rule
   *  whose key the view already holds, from a profile or an earlier group rule, is not added: one value per key
   *  (jurisdictions R15), reported in `conflicts`. With no group rule the answer equals `combine`'s. Writes nothing;
   *  never throws. A confirmed rule whose `effective_from` (R18) is after today (the local day in the view's zone) is not
   *  yet applied; the field is not carried into the view, where a profile's entry has none. */
  governingView() {
    try {
      const c = this.#combined();
      if (!c || !c.ok) return c;
      const today = this.#day(c.view, this.instant());
      const rules = this.#rules().filter((r) => r.state === "confirmed" && !(isObj(r.entry) && r.entry[EFFECTIVE_FROM] > today));
      if (!rules.length) return c;
      const view = clone(c.view);
      const conflicts = [...(Array.isArray(c.conflicts) ? c.conflicts : [])];
      for (const r of rules) {
        const list = Array.isArray(view[r.section]) ? view[r.section] : (view[r.section] = []);
        const k = keyOf(r.section, r.entry);
        const held = list.find((e) => keyOf(r.section, e) === k && (e.profile !== GROUP_PROFILE || sameGovernment(e.government, r.government)));
        if (k === null || held) {
          conflicts.push({ at: `${r.section}[${JSON.stringify(keyWords(r.section, r.entry || {}))}]`,
                           values: [{ profile: held ? held.profile : null, rule: r.rule }],
                           says: word("local-facts.says.group_rule_holds", { rule: String(r.rule) }) });
          continue;
        }
        const basis = `${this.#day(c.view, r.confirmation.at)} ${r.rule}`;
        const applied = clone(r.entry);
        delete applied[EFFECTIVE_FROM];
        list.push({ ...applied, status: "researched", basis, profile: GROUP_PROFILE, layer: r.layer, origin: "team",
                    ...(r.government ? { government: clone(r.government) } : {}),
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
    /* R28: the layer a rule belongs to is the team's one layer (absent reads as it); a Civicsmith layer is read-only (R23) */
    const layer = b.layer === undefined || b.layer === null ? TEAM_LAYER : b.layer;
    const notWritable = this.layers.writable(layer);
    if (notWritable) return notWritable;
    const section = b.section;
    if (!RULE_SECTIONS.includes(section)) return sectionRefusal(section);
    const at = this.instant();
    const c = this.#combined();
    const government = b.government === undefined || b.government === null ? null : b.government;
    const errors = [...(government === null ? [] : governmentErrors(government)),
                    ...this.#entryErrors(section, b.entry, c && c.ok ? c.view : null, at)];
    if (errors.length) return entryInvalidRefusal(`the entry is not valid as a ${section} entry of a jurisdiction profile.`, errors);
    const bad = this.sourceRefusal(b.source, b.viewer);
    if (bad) return noSourceRefusal("a rule", bad);
    const entry = { ...clone(b.entry) };
    delete entry.basis; delete entry.status;
    const k = keyOf(section, entry);
    const gv = this.governingView();
    /* R28: the key is judged within the team's layer and the rule's government first, then across the active layers */
    const inView = gv && gv.ok && Array.isArray(gv.view[section]) ? gv.view[section].filter((e) => keyOf(section, e) === k) : [];
    const held = inView.find((e) => e.profile === GROUP_PROFILE && sameGovernment(e.government, government))
      ?? inView.find((e) => e.profile !== GROUP_PROFILE) ?? null;
    /* DEC-49 REGION is-rule-new */
    if (held)
      return refusal("RULE_IN_PROFILE", `the governing view already holds ${section} ${JSON.stringify(keyWords(section, entry))}`
                     + ` (from ${held.profile === GROUP_PROFILE ? `the team's rule, ${held.basis}` : `the profile ${held.profile}`}); `
                     + "dispute it or offer a correction instead.",
                     { held: { section, ...keyWords(section, entry), profile: held.profile ?? null,
                               layer: held.profile === GROUP_PROFILE ? TEAM_LAYER : held.layer ?? held.profile ?? null } });
    /* END DEC-49 REGION is-rule-new */
    const reason = str(b.reason);
    const noReason = reasonRefusal(reason);
    if (noReason) return noReason;
    /* R28: a closure list a rule names is stored as `<layer id>:<name>` when it resolves to a list of some layer, so a name
       another layer later gives cannot take its place; two layers giving a bare name is NAME_AMBIGUOUS */
    for (const holder of [entry, entry.observed]) {
      if (!isObj(holder) || typeof holder.closures !== "string") continue;
      const named = this.layers.closure(holder.closures);
      if (named.refusal) return named.refusal;
      if (named.name) holder.closures = named.name;
    }
    const source = { captureSha: b.source.captureSha.trim().toLowerCase(), extent: clone(b.source.extent) };
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, layer, government_json, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (NULL, 'draft', ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
                    section, layer, government === null ? null : canonicalJson(government), canonicalJson(entry), canonicalJson(source), reason, by, at);
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
    const own = { ...entry };
    const when = own[EFFECTIVE_FROM];
    delete own[EFFECTIVE_FROM];
    const dated = isDay(when) ? [] : [{ path: `${section}[0].${EFFECTIVE_FROM}`, code: "VALUE_INVALID",
      detail: localize("local-facts.rules.effective_from_is_a_day", "effective_from is the day the rule takes effect, as YYYY-MM-DD") }];
    const p = { id: "group-rule", name: word("local-facts.group_rule"), covers: ["the team"], test: !!(isObj(view) && view.test) };
    if (isObj(view)) for (const s of CONTEXT_SECTIONS) if (view[s] !== undefined && s !== section) p[s] = untagged(view[s]);
    p[section] = [{ ...clone(own), status: "researched", basis: this.#day(view, at) }];
    let v;
    try { v = this.validate(p); } catch (e) { return [...dated, { path: `${section}[0]`, code: "VALUE_INVALID", detail: String(e && e.message || e).slice(0, 200) }]; }
    if (!v || v.ok) return dated;
    const mine = `${section}[0]`;
    return dated.concat((v.errors || []).filter((e) => typeof e.path === "string" && (e.path === mine || e.path.startsWith(`${mine}.`) || e.path.startsWith(`${mine}[`))));
  }

  /* ===================================================================== *
   * R11: ruleConfirm
   * ===================================================================== */

  /* R11: the tier of the `action_kinds` kind a rule's `applies_to` names in the active view: 1, 2, 3, or null when
     undetermined (a `claim` rule, a kind the view lacks or gives no tier; a legal fact naming no kind). A legal fact
     naming several kinds reads Tier 1 only when every one is Tier 1. */
  #tier(r, view = undefined) {
    const c = view === undefined ? this.#combined() : view;
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
    if (who(r.drafter) === who(b.by)) return selfConfirmRefusal("rule", r.rule);
    if (r.state !== "drafted") return notDraftedRefusal("rule", r.rule, r.state);
    const tier = this.#tier(r);
    const statement = str(b.statement);
    const needs = tier !== 1;
    if (needs && (!statement || statement.length > RULE_STATEMENT_MAX)) return needsQualificationRefusal("rule", r.rule, tier);
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
   *  statement, to a viewer naming a member; any other viewer is answered none. R19: each row also says what it is for:
   *  `applies_to` (the kind id, or a legal fact's list, the entry names; null when it names none), `tier` (R11's read of
   *  it in the active view: 1, 2, 3 or null) and `source` as `{captureSha, extent}`. Writes nothing; never throws. */
  groupRules(a = {}) {
    try {
      const b = isObj(a) ? a : {};
      if (b.section !== undefined && b.section !== null && !RULE_SECTIONS.includes(b.section)) return sectionRefusal(b.section);
      if (!namesMember(b.viewer)) return { ok: true, rules: [], count: 0 };
      const view = this.#combined();
      const rules = this.#rules().filter((r) => !b.section || r.section === b.section).map((r) => ({
        rule: r.rule, section: r.section, layer: r.layer, ...(r.government ? { government: clone(r.government) } : {}),
        state: r.state, entry: r.entry, source: r.source, reason: r.reason,
        applies_to: isObj(r.entry) && r.entry.applies_to !== undefined ? clone(r.entry.applies_to) : null,
        tier: isObj(r.entry) ? this.#tier(r, view) : null,
        drafter: r.drafter, drafted_at: r.drafted_at,
        confirmer: r.confirmation ? r.confirmation.by : null, confirmed_at: r.confirmation ? r.confirmation.at : null,
        ...(r.confirmation && r.confirmation.statement ? { statement: r.confirmation.statement } : {}),
        ...(r.withdrawal ? { withdrawn: { ...r.withdrawal } } : {}),
      }));
      return { ok: true, rules, count: rules.length };
    } catch (e) {
      return { ok: true, rules: [], count: 0, why: word("local-facts.why.undetermined_rules_read", { entry: String(String(e && e.message || e).slice(0, 200)) }) };
    }
  }

  /** R28: the team's confirmed rule a bare name stands for: `section` `deadlines` (the `rule` name, with `applies_to`) or
   *  `legal_facts` (the `key`), over the rules it applies now; with `government` that government's, else the one the name is
   *  given for, or NAME_AMBIGUOUS naming each government when two governments each give it (never a guess). Answers
   *  `{ok, rule, layer, government, entry}`, or `{ok: false, reason: "NAME_UNKNOWN"}`; to a viewer naming a member alone. */
  ruleResolve(a = {}) {
    const unknown = { ok: false, reason: "NAME_UNKNOWN" };
    try {
      const b = isObj(a) ? a : {};
      if (!RULE_SECTIONS.includes(b.section)) return sectionRefusal(b.section);
      if (!namesMember(b.viewer) || typeof b.name !== "string") return unknown;
      const c = this.#combined();
      const today = this.#day(c && c.ok ? c.view : null, this.instant());
      const hits = this.#rules().filter((r) => r.state === "confirmed" && r.section === b.section && isObj(r.entry)
        && !(r.entry[EFFECTIVE_FROM] > today) && (b.section === "deadlines" ? r.entry.rule === b.name
          && (b.applies_to === undefined || r.entry.applies_to === b.applies_to) : r.entry.key === b.name)
        && (b.government === undefined || sameGovernment(r.government, b.government)));
      if (!hits.length) return unknown;
      const govs = [...new Map(hits.map((r) => [JSON.stringify(r.government ?? null), r.government])).values()];
      if (govs.length > 1)
        return ambiguousRefusal(b.name, govs.map((g) => ({ layer: TEAM_LAYER, ...(g ? { government: clone(g) } : {}) })));
      const r = hits[hits.length - 1];
      return { ok: true, rule: r.rule, layer: r.layer, ...(r.government ? { government: clone(r.government) } : {}), entry: clone(r.entry) };
    } catch { return unknown; }
  }

  /* ===================================================================== *
   * R18: ruleFields
   * ===================================================================== */

  /** R18: the fields an entry of `section` carries, each `{field, required, kind, choices?}` in `jurisdictions`' order
   *  (`effective_from` last), to a viewer naming a member; any other viewer is answered none. `applies_to`'s choices are
   *  the active view's `action_kinds` ids (a deadline's also `claim`, which `jurisdictions` accepts); the rest are the
   *  vocabularies `jurisdictions` freezes. An unknown `section` is R17's refusal. Writes nothing; never throws. */
  ruleFields(a = {}) {
    try {
      const b = isObj(a) ? a : {};
      if (!RULE_SECTIONS.includes(b.section)) return sectionRefusal(b.section);
      if (!namesMember(b.viewer)) return { ok: true, section: b.section, fields: [], count: 0 };
      const c = this.#combined();
      const ids = c && c.ok && Array.isArray(c.view.action_kinds)
        ? c.view.action_kinds.filter((k) => isObj(k) && typeof k.kind === "string").map((k) => k.kind) : [];
      const kinds = b.section === "deadlines" ? ["claim", ...ids.filter((k) => k !== "claim")] : ids;
      const fields = RULE_FIELDS[b.section].map((f) => ({ field: f.field, required: f.required, kind: f.kind,
        ...(f.many ? { many: true } : {}), ...(f.choices === undefined ? {} : { choices: [...(f.choices === null ? kinds : f.choices)] }) }));
      return { ok: true, section: b.section, fields, count: fields.length };
    } catch (e) {
      return { ok: true, section: typeof (a || {}).section === "string" ? a.section : null, fields: [], count: 0,
               why: word("local-facts.why.undetermined_rules_read", { entry: String(String(e && e.message || e).slice(0, 200)) }) };
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
      return refusal("RULE_NOT_CONFIRMED", localize("local-facts.rules.the_rule_is_state_only", "the rule is {state}; only a confirmed rule the team still applies is offered.", { state: String(r.state) }),
                     { rule: r.rule, state: r.state });
    /* END DEC-49 REGION is-rule-confirmed */
    const offer = { section: r.section, entry: r.entry, source: r.source,
                    confirmed: { at: r.confirmation.at, with_statement: !!r.confirmation.statement } };
    const bytes = canonicalJson(offer);
    return { ok: true, rule: r.rule, offer, bytes, digest: sha256HexSync(bytes),
             note: word("local-facts.note.carry_bytes_shared") };
  }
}

/* DEC-49: a code several acts answer is minted at one site, its own function here. */

/* R10, R13, R14: drafting and withdrawing a rule are a named member's acts. */
export function machineRuleRefusal(by) {
  /* DEC-49 REGION is-rule-member */
  if (str(by) && !isMachineIdentity(str(by))) return null;
  return refusal("MACHINE_CANNOT_DRAFT_RULE", word("refusal.MACHINE_CANNOT_DRAFT_RULE"));
  /* END DEC-49 REGION is-rule-member */
}

/* R10, R12, R17: a section that is neither `deadlines` nor `legal_facts`, given to a draft or to the read of the group's
   rules; the one builder of RULE_SECTION_UNKNOWN, so both answer the same refusal. `sections` is the module's own two
   unless a caller names the sections of the team layer it drafts in (R23: `layerEntryDraft`). */
export function sectionRefusal(section, sections = RULE_SECTIONS) {
  /* DEC-49 REGION is-rule-section */
  return refusal("RULE_SECTION_UNKNOWN", localize("local-facts.rules.a_teams_rule_is_drafted", "a team's rule is drafted in {RULE_SECTIONS}.", { RULE_SECTIONS: String(sections.join(" or ")) }),
                 { section: typeof section === "string" ? section.slice(0, 40) : null, sections: [...sections] });
  /* END DEC-49 REGION is-rule-section */
}

/* R28, R29: a bare name that two layers, or two governments of the team layer, give; `layers` names each `{layer, level?,
   place?}`; the one builder of NAME_AMBIGUOUS. */
export function ambiguousRefusal(name, layers) {
  /* DEC-49 REGION is-name-unambiguous */
  return refusal("NAME_AMBIGUOUS", localize("local-facts.rules.the_name_is_given_by", "the name is given by more than one place; say which."),
                 { name: typeof name === "string" ? name.slice(0, 200) : null, layers });
  /* END DEC-49 REGION is-name-unambiguous */
}

/* R10, R23: an entry `jurisdictions.validate` refuses, as a rule or as an entry of the team layer; the one builder of
   RULE_ENTRY_INVALID. */
export function entryInvalidRefusal(detail, errors) {
  /* DEC-49 REGION is-rule-entry */
  return refusal("RULE_ENTRY_INVALID", detail, { errors: errors.slice(0, 20) });
  /* END DEC-49 REGION is-rule-entry */
}

/* R10, R23: a primary source that is not a held capture extent the viewer may see; the one builder of RULE_NO_SOURCE. `what`
   is "a rule" or "an entry"; `bad` is `sourceRefusal`'s answer. */
export function noSourceRefusal(what, bad) {
  /* DEC-49 REGION is-rule-source */
  return refusal("RULE_NO_SOURCE", `${what} is drafted from a held capture extent of its primary source `
                 + `({captureSha, extent}): ${bad.why}`, bad.code ? { source_code: bad.code } : undefined);
  /* END DEC-49 REGION is-rule-source */
}

/* R11, R23: the drafter confirming their own rule or entry; `noun` is "rule" or "entry", the answer's field. */
export function selfConfirmRefusal(noun, id) {
  /* DEC-49 REGION is-rule-other */
  return refusal("RULE_SELF_CONFIRM", `a ${noun} is confirmed by a member other than its drafter.`, { [noun]: id });
  /* END DEC-49 REGION is-rule-other */
}

/* R11, R23: a rule or entry no longer in the drafted state. */
export function notDraftedRefusal(noun, id, state) {
  /* DEC-49 REGION is-rule-drafted */
  return refusal("RULE_NOT_DRAFTED", `the ${noun} is ${state}; only a drafted ${noun} is confirmed.`, { [noun]: id, state });
  /* END DEC-49 REGION is-rule-drafted */
}

/* R11, R23: a rule or entry of tier 2, 3 or undetermined confirmed with no professional's statement. */
export function needsQualificationRefusal(noun, id, tier) {
  /* DEC-49 REGION is-rule-qualified */
  return refusal("RULE_NEEDS_QUALIFICATION", `a ${noun} of tier ${tier ?? "undetermined"} is confirmed by a professional, `
                 + `who states her qualification in 1 to ${RULE_STATEMENT_MAX} characters.`,
                 { [noun]: id, tier, max: RULE_STATEMENT_MAX });
  /* END DEC-49 REGION is-rule-qualified */
}

/* R10, R13: a reason of 1 to 500 characters. */
export function reasonRefusal(reason) {
  /* DEC-49 REGION is-rule-reason */
  if (reason && reason.length <= RULE_REASON_MAX) return null;
  return refusal("RULE_NO_REASON", `say why, in 1 to ${RULE_REASON_MAX} characters.`, { max: RULE_REASON_MAX });
  /* END DEC-49 REGION is-rule-reason */
}

/* R11, R13: no rule of the group's by that id, or none the viewer may see (R11's NO_SUCH_RULE, owner-prefixed as K231:
   `action-clocks` answers a bare NO_SUCH_RULE for a profile's deadline). */
function noSuchRule(id) {
  /* DEC-49 REGION is-rule-named */
  return refusal("NO_SUCH_GROUP_RULE", localize("local-facts.rules.the_team_holds_no_rule", "the team holds no rule of its own by that id."),
                 { rule: typeof id === "string" ? id.slice(0, 40) : null });
  /* END DEC-49 REGION is-rule-named */
}
