/* local-facts: the team layer, and a team's reports on a layer it does not own (requirements: `build/requirements/local-facts.md`,
 * R23, R26, R30; T53, N1257, DEC-404). `jurisdictions` holds Civicsmith's shipped layers and is pure (its R17), so what a team
 * writes about its own counties and cities lives here, in `team_layers`: THE one team layer (`jurisdictions` R115), placeless,
 * its entries each about one government.
 *
 * A member drafts an entry of one of the team layer's sections from a held capture extent (R23), a second member confirms it
 * (a professional's statement when its tier is 2, 3 or undetermined), any member withdraws it with a reason; a drafted entry is
 * listed and never applied, a confirmed one joins the layer `profile()` hands the host for `combine` (R30). A stated fiscal
 * year (R31) is an entry at once: `LocalFacts.factConfirm` writes its 'state' row here beside the fact's act. A report (R26) is
 * a member's note that a rule of a Civicsmith layer is wrong; the instance transmits nothing: `layerReportCarry` answers the
 * canonical bytes with their digest for a member to carry.
 *
 * Every act is a row, appended and never rewritten (R5, R30): an entry's state is read from its rows in order. A machine
 * never drafts, confirms, withdraws, reports or carries. `TeamLayer` is reached through `LocalFacts`, which passes the host's
 * readers: `layers` (`writable`, `shipped`, `chain`, `isTest`), `combined`, `validate`, `sourceRefusal`, `instant`, `dayOf`. */

import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { refusal } from "./checks.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { TEAM_LAYER } from "./paths.mjs";
import {
  str, isObj, clone, safeJson, who, namesMember, governmentErrors, sameGovernment, machineRuleRefusal, reasonRefusal,
  sectionRefusal, entryInvalidRefusal, noSourceRefusal, selfConfirmRefusal, notDraftedRefusal, needsQualificationRefusal,
  RULE_STATEMENT_MAX,
} from "./rules.mjs";

/** R23: the sections a member drafts an entry of (`jurisdictions` R116 less the placeless `time_zone` and `weekend`, which R21
 *  states, and `fiscal_year`, which R31 states by `factConfirm`). */
export const LAYER_ENTRY_SECTIONS = Object.freeze(["records_laws", "deadlines", "holidays", "counterparties", "action_kinds", "systems"]);
/** R23: an entry's states, read from its acts. */
export const LAYER_ENTRY_STATES = Object.freeze(["drafted", "confirmed", "withdrawn"]);
/** R26: a report's states: `open`, `carried` (a member marked it carried) or `answered`. Nothing in this module answers one yet. */
export const LAYER_REPORT_STATES = Object.freeze(["open", "carried", "answered"]);
/** R26: `believes` in characters, and the other fields' bounds. */
export const BELIEVES_MAX = 1000, KEY_MAX = 500, PASSAGE_MAX = 1000, ADDRESS_MAX = 500;
const ENTRY_ID_RE = /^LE-([1-9][0-9]{0,15})$/;
const REPORT_ID_RE = /^LR-([1-9][0-9]{0,15})$/;
const entryId = (seq) => `LE-${seq}`;
const reportId = (seq) => `LR-${seq}`;
/* R23: the fields `combine` adds or a member must not supply (the basis and status are this module's, from the source). */
const NOT_THE_MEMBERS = ["basis", "status", "government", "profile", "bases", "layer", "origin"];

/* A section's entry key, as `jurisdictions` keys it (R15), or null: what a shipped layer's entry must equal to be the same one. */
const KEYS = {
  records_laws: (e) => (typeof e.name === "string" ? e.name : null),
  deadlines: (e) => (typeof e.rule === "string" && typeof e.applies_to === "string" ? `${e.rule}\u0000${e.applies_to}` : null),
  holidays: (e) => (Number.isInteger(e.year) ? `${e.year}\u0000${e.list ?? ""}\u0000${canonicalJson(e.offices ?? null)}` : null),
  counterparties: (e) => (typeof e.role === "string" ? `${e.role}\u0000${e.body ?? ""}` : null),
  action_kinds: (e) => (typeof e.kind === "string" ? e.kind : null),
  systems: (e) => (typeof e.origin === "string" ? e.origin : null),
};
const keyOf = (section, e) => (isObj(e) && KEYS[section] ? KEYS[section](e) : null);
/** R23, R30: the key of an entry of a team-layer section (a stated fiscal year's is its body), or null. */
export const entryKey = (section, e) => (section === "fiscal_year" ? (isObj(e) && typeof e.body === "string" ? e.body : null) : keyOf(section, e));
/* An entry without what differs by layer and by merge (basis, status, the profile tags, a deadline's computed `days`). */
const same = (e) => { const o = clone(e); for (const k of [...NOT_THE_MEMBERS, "days"]) delete o[k]; return canonicalJson(o); };

/* DEC-49: a code several acts answer is minted at one site, its own function here. */

/** R23, R28: a layer a member names to write into that is a Civicsmith layer (a held profile that is not the team's). */
export function readOnlyRefusal(layer) {
  /* DEC-49 REGION is-layer-writable */
  return refusal("LAYER_READ_ONLY", localize("local-facts.layer.that_layer_is_civicsmiths_own", "that layer is Civicsmith's own and is not edited here: add the entry to your team's layer, or report the rule you believe is wrong."),
                 { layer: typeof layer === "string" ? layer.slice(0, 100) : null });
  /* END DEC-49 REGION is-layer-writable */
}

/** R23, R26: a layer no held profile has. */
export function unknownLayerRefusal(layer) {
  /* DEC-49 REGION is-layer-known */
  return refusal("LAYER_UNKNOWN", localize("local-facts.layer.no_layer_by_that_id", "no layer by that id is held."),
                 { layer: typeof layer === "string" ? layer.slice(0, 100) : null });
  /* END DEC-49 REGION is-layer-known */
}

/** R26: the team's own layer, which is edited and never reported on. */
export function notShippedRefusal(layer) {
  /* DEC-49 REGION is-layer-shipped */
  return refusal("LAYER_NOT_SHIPPED", localize("local-facts.layer.the_team_layer_is_edited", "the team's layer is edited, not reported on."), { layer });
  /* END DEC-49 REGION is-layer-shipped */
}

/** R23, R31: a key a shipped active layer already gives with a different value. */
export function inShippedRefusal(layer, section, key, extra) {
  /* DEC-49 REGION is-entry-not-shipped */
  return refusal("LAYER_ENTRY_IN_SHIPPED", localize("local-facts.layer.layer_already_gives_this_with", "the layer {layer} already gives this with a different value; report the rule instead.", { layer: String(layer) }),
                 { layer, section, key, ...(extra || {}) });
  /* END DEC-49 REGION is-entry-not-shipped */
}

/** R23: no entry of the team layer by that id, or none the viewer may see. */
function noSuchEntry(id) {
  /* DEC-49 REGION is-entry-named */
  return refusal("NO_SUCH_LAYER_ENTRY", localize("local-facts.layer.the_team_layer_holds_no", "the team layer holds no entry by that id."),
                 { entry: typeof id === "string" ? id.slice(0, 40) : null });
  /* END DEC-49 REGION is-entry-named */
}

/** R26: no report of the team's by that id, or none the viewer may see. */
function noSuchReport(id) {
  /* DEC-49 REGION is-report-named */
  return refusal("NO_SUCH_LAYER_REPORT", localize("local-facts.layer.the_team_holds_no_report", "the team holds no report by that id."),
                 { report: typeof id === "string" ? id.slice(0, 40) : null });
  /* END DEC-49 REGION is-report-named */
}

export class TeamLayer {
  constructor({ sql, record, validate, layers, tierOf, sourceRefusal, instant, now }) {
    this.sql = sql;
    this.record = record;
    this.validate = validate;
    this.layers = layers;
    this.tierOf = tierOf;
    this.sourceRefusal = sourceRefusal;
    this.instant = instant;
    this.now = now;
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }

  /* Every entry of the layer from its rows in order: `{entry, seq, kind, section, government, value, source, reason,
     drafter, drafted_at, state, confirmation, withdrawal}`; a 'state' row is a stated fiscal year (R31): it is an entry at once,
     its `how` in `reason`, and a later one for the same government replaces it as the governing entry (R5: both stay). */
  entries() {
    const byDraft = new Map();
    for (const r of this.#rows(`SELECT * FROM team_layers ORDER BY seq`)) {
      if (r.act === "draft" || r.act === "state") {
        byDraft.set(r.seq, { entry: entryId(r.seq), seq: r.seq, kind: r.act, section: r.section, government: safeJson(r.government_json),
                             value: safeJson(r.entry_json), source: safeJson(r.source_json), reason: r.reason, drafter: r.by_member,
                             drafted_at: r.at, state: r.act === "state" ? "stated" : "drafted", confirmation: null, withdrawal: null });
        continue;
      }
      const e = byDraft.get(r.draft_seq);
      if (!e || e.kind !== "draft") continue;
      if (r.act === "confirm" && e.state === "drafted") e.confirmation = { by: r.by_member, at: r.at, statement: r.statement ?? null }, e.state = "confirmed";
      else if (r.act === "withdraw" && !e.withdrawal) e.withdrawal = { by: r.by_member, at: r.at, reason: r.reason }, e.state = "withdrawn";
    }
    return [...byDraft.values()];
  }
  #entry(id) {
    const m = typeof id === "string" ? ENTRY_ID_RE.exec(id.trim()) : null;
    return m ? this.entries().find((e) => e.seq === Number(m[1])) || null : null;
  }

  /* The entry as the layer holds it: the member's entry with its government, `status: researched` and its basis `team:<capture
     sha>` (`jurisdictions` R115); a stated year with neither (R134). */
  static #asHeld(e) {
    if (e.kind === "state") return { ...clone(e.value), government: clone(e.government) };
    return { ...clone(e.value), government: clone(e.government), status: "researched", basis: `team:${e.source.captureSha}` };
  }

  /** R30: the team layer as a profile `combine` takes (`jurisdictions` R115, R116), its confirmed entries by section and each
   *  government's latest stated fiscal year; null when it holds none. Writes nothing. */
  profile() {
    const out = this.#empty();
    const stated = new Map();
    let any = false;
    for (const e of this.entries()) {
      if (e.kind === "state") { stated.set(JSON.stringify(e.government), e); continue; }
      if (e.state !== "confirmed") continue;
      (out[e.section] ||= []).push(TeamLayer.#asHeld(e));
      any = true;
    }
    if (stated.size) { out.fiscal_year = [...stated.values()].map((e) => TeamLayer.#asHeld(e)); any = true; }
    return any ? out : null;
  }

  /** R30: the confirmed team layer as one profile object, id `team`, in the shape `combine` takes (a caller appends it after the
   *  recorded profile ids), to a viewer naming a member (or a direct internal call, no viewer sent); null for any other viewer. A
   *  team that holds nothing yet answers the layer with no section. No other op returns it. Writes nothing; never throws. */
  teamLayer(a = {}) {
    try {
      const b = isObj(a) ? a : {};
      if (b.viewer !== undefined && b.viewer !== null && !namesMember(b.viewer)) return null;
      return this.profile() || this.#empty();
    } catch { return null; }
  }

  /* The layer as it is while the team has written nothing: valid, with no section. */
  #empty() {
    return { id: TEAM_LAYER, name: localize("local-facts.layer.team_name", "The team's layer"), covers: [localize("local-facts.layer.team_covers", "the team")],
             test: this.layers.isTest(), layer: { origin: "team" } };
  }

  /* The profile the layer would be with `held` as one more entry of `section`: what R23's validity is judged on. */
  #candidate(section, held) {
    const p = this.profile() || this.#empty();
    return { ...p, [section]: [...(p[section] || []), held] };
  }
  #errors(section, held) {
    const p = this.#candidate(section, held);
    const mine = `${section}[${p[section].length - 1}]`;
    let v;
    try { v = this.validate(p); } catch (e) { return [{ path: mine, code: "VALUE_INVALID", detail: String(e && e.message || e).slice(0, 200) }]; }
    if (!v || v.ok) return [];
    return (v.errors || []).filter((e) => typeof e.path === "string" && (e.path === mine || e.path.startsWith(`${mine}.`) || e.path.startsWith(`${mine}[`)
      || e.path === section));
  }

  /* ===================================================================== *
   * R23: layerEntryDraft, layerEntryConfirm, layerEntryWithdraw, layerEntries
   * ===================================================================== */

  /** R23: a member drafts an entry of the team layer, about one government, from its primary source. Refusals in order, each
   *  writing nothing: MACHINE_CANNOT_DRAFT_RULE, LAYER_READ_ONLY / LAYER_UNKNOWN (a `layer` named, not the team's),
   *  RULE_SECTION_UNKNOWN, RULE_ENTRY_INVALID (the government and the entry), RULE_NO_SOURCE, LAYER_ENTRY_IN_SHIPPED,
   *  RULE_NO_REASON. Answers `{ok, entry, state: "drafted"}`. */
  layerEntryDraft(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const layer = b.layer === undefined || b.layer === null ? TEAM_LAYER : b.layer;
    const notWritable = this.layers.writable(layer);
    if (notWritable) return notWritable;
    const section = b.section;
    if (!LAYER_ENTRY_SECTIONS.includes(section)) return sectionRefusal(section, LAYER_ENTRY_SECTIONS);
    const errors = isObj(b.entry) ? governmentErrors(b.government) : [{ path: `${section}[0]`, code: "VALUE_INVALID", detail: "the entry is an object" }];
    const bad = this.sourceRefusal(b.source, b.viewer);
    let held = null, value = null, source = null;
    if (!errors.length) {
      value = clone(b.entry);
      for (const k of NOT_THE_MEMBERS) delete value[k];
      source = bad ? { captureSha: "0".repeat(64) } : { captureSha: b.source.captureSha.trim().toLowerCase(), extent: clone(b.source.extent) };
      held = { ...clone(value), government: clone(b.government), status: "researched", basis: `team:${source.captureSha}` };
      errors.push(...this.#errors(section, held));
    }
    if (errors.length) return entryInvalidRefusal(`the entry is not valid as a ${section} entry of the team layer.`, errors);
    if (bad) return noSourceRefusal("an entry", bad);
    const key = keyOf(section, value);
    for (const p of this.layers.chain(b.government)) {
      const given = (Array.isArray(p[section]) ? p[section] : []).find((e) => keyOf(section, e) === key);
      if (given && same(given) !== same(value)) return inShippedRefusal(p.id, section, key === null ? null : key.replace(/\u0000/g, " "));
    }
    const reason = str(b.reason);
    const noReason = reasonRefusal(reason);
    if (noReason) return noReason;
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO team_layers (draft_seq, act, section, government_json, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (NULL, 'draft', ?, ?, ?, ?, ?, NULL, ?, ?)`,
                    section, canonicalJson(b.government), canonicalJson(value), canonicalJson(source), reason, by, at);
      const seq = this.#rows(`SELECT MAX(seq) AS s FROM team_layers`)[0].s;
      return { ok: true, entry: entryId(seq), state: "drafted", layer: TEAM_LAYER, government: clone(b.government), at };
    });
  }

  /** R23 (R11): a member other than the drafter confirms a drafted entry; a professional's statement for Tier 2, 3 or
   *  undetermined. Refusals in order: MACHINE_CANNOT_CONFIRM (the caller's), NO_SUCH_LAYER_ENTRY, RULE_SELF_CONFIRM,
   *  RULE_NOT_DRAFTED, RULE_NEEDS_QUALIFICATION, RULE_ENTRY_INVALID (the layer with it no longer valid). */
  layerEntryConfirm(b, machineRefusal) {
    const machine = machineRefusal(b.by);
    if (machine) return machine;
    const e = namesMember(b.viewer) || b.viewer === undefined || b.viewer === null ? this.#entry(b.entry) : null;
    if (!e || e.kind !== "draft") return noSuchEntry(b.entry);
    if (who(e.drafter) === who(b.by)) return selfConfirmRefusal("entry", e.entry);
    if (e.state !== "drafted") return notDraftedRefusal("entry", e.entry, e.state);
    const tier = this.tierOf(e.section, e.value);
    const statement = str(b.statement);
    const needs = tier !== 1;
    if (needs && (!statement || statement.length > RULE_STATEMENT_MAX)) return needsQualificationRefusal("entry", e.entry, tier);
    const errors = this.#errors(e.section, TeamLayer.#asHeld(e));
    if (errors.length) return entryInvalidRefusal(`the entry is not valid as a ${e.section} entry of the team layer.`, errors);
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO team_layers (draft_seq, act, section, government_json, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (?, 'confirm', NULL, NULL, NULL, NULL, NULL, ?, ?, ?)`, e.seq, needs ? statement : null, by, at);
      return { ok: true, entry: e.entry, state: "confirmed", at, tier, with_statement: needs };
    });
  }

  /** R23 (R13): any member withdraws an entry with a reason; kept, never deleted; it leaves the layer from then on. A repeat
   *  answers `already: true`. */
  layerEntryWithdraw(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const e = namesMember(b.viewer) || b.viewer === undefined || b.viewer === null ? this.#entry(b.entry) : null;
    if (!e || e.kind !== "draft") return noSuchEntry(b.entry);
    const reason = str(b.reason);
    const noReason = reasonRefusal(reason);
    if (noReason) return noReason;
    if (e.withdrawal) return { ok: true, entry: e.entry, state: "withdrawn", already: true, at: e.withdrawal.at };
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO team_layers (draft_seq, act, section, government_json, entry_json, source_json, reason, statement, by_member, at)
                     VALUES (?, 'withdraw', NULL, NULL, NULL, NULL, ?, NULL, ?, ?)`, e.seq, reason, by, at);
      return { ok: true, entry: e.entry, state: "withdrawn", already: false, at };
    });
  }

  /** R23: the team layer's entries with their state, source, drafter, confirmer and dates, to a viewer naming a member; any
   *  other viewer is answered none. A stated fiscal year (R31) is listed as `state: "stated"` with who stated it and its `how`.
   *  A confirmation's statement is answered with its entry and only to a member. Writes nothing. */
  layerEntries(a = {}) {
    try {
      const b = isObj(a) ? a : {};
      if (b.section !== undefined && b.section !== null && ![...LAYER_ENTRY_SECTIONS, "fiscal_year"].includes(b.section))
        return sectionRefusal(b.section, [...LAYER_ENTRY_SECTIONS, "fiscal_year"]);
      if (!namesMember(b.viewer)) return { ok: true, entries: [], count: 0 };
      const memo = {};
      const entries = this.entries().filter((e) => !b.section || (e.kind === "state" ? "fiscal_year" : e.section) === b.section).map((e) => (e.kind === "state"
        ? { entry: e.entry, section: "fiscal_year", government: e.government, value: e.value, state: "stated", how: e.reason, stated_by: e.drafter, stated_at: e.drafted_at }
        : { entry: e.entry, section: e.section, government: e.government, value: e.value, source: e.source, reason: e.reason,
            tier: this.tierOf(e.section, e.value, memo), state: e.state, drafter: e.drafter, drafted_at: e.drafted_at,
            confirmer: e.confirmation ? e.confirmation.by : null, confirmed_at: e.confirmation ? e.confirmation.at : null,
            ...(e.confirmation && e.confirmation.statement ? { statement: e.confirmation.statement } : {}),
            ...(e.withdrawal ? { withdrawn: { ...e.withdrawal } } : {}) }));
      return { ok: true, entries, count: entries.length };
    } catch (e) {
      return { ok: true, entries: [], count: 0, why: word("local-facts.why.undetermined_rules_read", { entry: String(String(e && e.message || e).slice(0, 200)) }) };
    }
  }

  /** R31: the government's latest stated fiscal year as the layer holds it (`{government, body, start, named_by, label}`), with
   *  who stated it, how and when; null when none. */
  statedYear(government) {
    const hits = this.entries().filter((e) => e.kind === "state" && sameGovernment(e.government, government));
    const e = hits[hits.length - 1];
    return e ? { year: { ...clone(e.value), government: clone(e.government) }, by: e.drafter, at: e.drafted_at, how: e.reason } : null;
  }

  /** R31: the layer with `year` as one more stated fiscal year, validated by `jurisdictions` (R134): the errors under the entry. */
  yearErrors(year) {
    const p = this.profile() || this.#empty();
    const others = (p.fiscal_year || []).filter((x) => !sameGovernment(x.government, year.government));
    const q = { ...p, fiscal_year: [...others, year] };
    const mine = `fiscal_year[${q.fiscal_year.length - 1}]`;
    let v;
    try { v = this.validate(q); } catch (e) { return [{ path: mine, code: "VALUE_INVALID", detail: String(e && e.message || e).slice(0, 200) }]; }
    if (!v || v.ok) return [];
    return (v.errors || []).filter((e) => typeof e.path === "string" && (e.path === mine || e.path.startsWith(`${mine}.`) || e.path.startsWith("fiscal_year")));
  }

  /* ===================================================================== *
   * R26: layerReport, layerReports, layerReportCarry
   * ===================================================================== */

  /* Every report from its rows in order: `{report, seq, layer, layer_as_of, layer_version, key, said, believes, source, reporter,
     reported_at, state, carried}`. */
  #reports() {
    const byReport = new Map();
    for (const r of this.#rows(`SELECT * FROM layer_reports ORDER BY seq`)) {
      if (r.act === "report") {
        byReport.set(r.seq, { report: reportId(r.seq), seq: r.seq, layer: r.layer, layer_as_of: r.layer_as_of, layer_version: r.layer_version,
                              key: r.key_text, said: safeJson(r.said_json), believes: r.believes, source: safeJson(r.source_json),
                              reporter: r.by_member, reported_at: r.at, state: "open", carried: null });
        continue;
      }
      const e = byReport.get(r.draft_seq);
      if (e && r.act === "carry" && !e.carried) e.carried = { by: r.by_member, at: r.at }, e.state = "carried";
    }
    return [...byReport.values()];
  }
  #report(id) {
    const m = typeof id === "string" ? REPORT_ID_RE.exec(id.trim()) : null;
    return m ? this.#reports().find((r) => r.seq === Number(m[1])) || null : null;
  }

  /* R26: the offer a report carries: the layer, key, what it said, what the team believes and the source, with the layer's
     version and date; no member, no handle (the digest covers exactly these bytes). */
  static #offer(r) {
    return { layer: r.layer, key: r.key, said: r.said, believes: r.believes, source: r.source,
             layer_as_of: r.layer_as_of, layer_version: r.layer_version };
  }

  /** R26: a member reports a rule of a Civicsmith layer they believe wrong. Refusals in order, each writing nothing:
   *  MACHINE_CANNOT_DRAFT_RULE, LAYER_UNKNOWN, LAYER_NOT_SHIPPED (the team's layer), REPORT_NO_SOURCE, REPORT_NO_BELIEF.
   *  Holds no record content beyond its source and no handle in what is carried. Answers `{ok, report, state: "open"}`. */
  layerReport(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const profile = typeof b.layer === "string" ? this.layers.shipped(b.layer) : undefined;
    if (profile === undefined || profile === null) return unknownLayerRefusal(b.layer);
    if (profile === false) return notShippedRefusal(b.layer);
    /* a source is a held capture extent, or an address with the passage read there (at least one) */
    const s = isObj(b.source) ? b.source : {};
    const held = s.captureSha !== undefined || s.extent !== undefined;
    const addressed = typeof s.address === "string" && s.address.trim() !== "" && s.address.length <= ADDRESS_MAX
      && typeof s.passage === "string" && s.passage.trim() !== "" && s.passage.length <= PASSAGE_MAX;
    const bad = held ? this.sourceRefusal({ captureSha: s.captureSha, extent: s.extent }, b.viewer) : null;
    /* DEC-49 REGION is-report-source */
    if (held ? bad : !addressed)
      return refusal("REPORT_NO_SOURCE", "a report names a held capture extent ({captureSha, extent}) or an address with the passage "
                     + `({address, passage}, at most ${ADDRESS_MAX} and ${PASSAGE_MAX} characters)${bad ? `: ${bad.why}` : ""}.`);
    /* END DEC-49 REGION is-report-source */
    const believes = str(b.believes);
    /* DEC-49 REGION is-report-belief */
    if (!believes || believes.length > BELIEVES_MAX)
      return refusal("REPORT_NO_BELIEF", `say what the entry should say, in 1 to ${BELIEVES_MAX} characters.`, { max: BELIEVES_MAX });
    /* END DEC-49 REGION is-report-belief */
    const key = typeof b.key === "string" ? b.key.trim() : "";
    if (!key || key.length > KEY_MAX || b.said === undefined)
      return entryInvalidRefusal("a report names the entry's path (`key`) and says what the layer gives (`said`).", [{ path: key ? "said" : "key", code: "VALUE_INVALID", detail: "required" }]);
    const source = held ? { captureSha: s.captureSha.trim().toLowerCase(), extent: clone(s.extent) } : { address: s.address.trim(), passage: s.passage.trim() };
    const at = this.instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO layer_reports (draft_seq, act, layer, layer_as_of, layer_version, key_text, said_json, believes, source_json, by_member, at)
                     VALUES (NULL, 'report', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    b.layer, profile.coverage && typeof profile.coverage.as_of === "string" ? profile.coverage.as_of : null,
                    typeof profile.version === "string" ? profile.version : null, key, canonicalJson(b.said), believes, canonicalJson(source), by, at);
      const seq = this.#rows(`SELECT MAX(seq) AS s FROM layer_reports`)[0].s;
      return { ok: true, report: reportId(seq), state: "open", at };
    });
  }

  /** R26: the team's reports with their state (`open`, `carried`), to a viewer naming a member; any other viewer is answered
   *  none. Writes nothing. */
  layerReports(a = {}) {
    const b = isObj(a) ? a : {};
    if (!namesMember(b.viewer)) return { ok: true, reports: [], count: 0 };
    const reports = this.#reports().map((r) => ({ report: r.report, layer: r.layer, key: r.key, said: r.said, believes: r.believes, source: r.source,
      layer_as_of: r.layer_as_of, layer_version: r.layer_version, state: r.state, reporter: r.reporter, reported_at: r.reported_at,
      ...(r.carried ? { carried: { ...r.carried } } : {}) }));
    return { ok: true, reports, count: reports.length };
  }

  /** R26 (R13's `ruleOffer`): a report as canonical bytes with their digest, for a member to carry to Civicsmith; marks it
   *  carried. Refusals: MACHINE_CANNOT_DRAFT_RULE, NO_SUCH_LAYER_REPORT (also to a viewer naming no member). The instance
   *  transmits nothing. */
  layerReportCarry(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRuleRefusal(b.by);
    if (machine) return machine;
    const r = namesMember(b.viewer) || b.viewer === undefined || b.viewer === null ? this.#report(b.report) : null;
    if (!r) return noSuchReport(b.report);
    const offer = TeamLayer.#offer(r);
    const bytes = canonicalJson(offer);
    let already = !!r.carried;
    if (!already) {
      const at = this.instant();
      const by = str(b.by);
      this.record.transact(() => {
        this.sql.exec(`INSERT INTO layer_reports (draft_seq, act, by_member, at) VALUES (?, 'carry', ?, ?)`, r.seq, by, at);
        return { ok: true };
      });
    }
    return { ok: true, report: r.report, state: "carried", already, offer, bytes, digest: sha256HexSync(bytes),
             note: word("local-facts.note.carry_bytes_shared") };
  }
}
