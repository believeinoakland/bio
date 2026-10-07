/* affordances — R39 (B1a.15; K1486): THE CLOSED VOCABULARIES T33'S NEW MODULES REFUSE AGAINST, WITH THE WORDS MEMBERS SEE.
 *
 * Each is published as `{values, words}`: `values` the very object its owner answers (the same reference, never a copy,
 * R4's terms), and `words` mapping each value to `{word}`, or `{word, provisional: true}`. The word is, in R39's order:
 *   1. the owner's word registered with `connection-grammar` (`kindOf`), where the owner registers the value as a kind
 *      (events' roles and relation kinds, lines' kinds, people's claim kinds, every connection kind);
 *   2. else Bob's word for it (K1486: money words by context — proposed, adopted, amended; committed, spent, paid;
 *      billed, collected), which is the design stream's to render (NOTICE B32);
 *   3. else one plain word made from the value itself (underscores and joined words spaced, `Event` dropped from a
 *      status), marked `provisional: true` until that stream gives one.
 * No word says "knows", "network", "conflict", "suspicious" or "most connected", or "ledger", "diverted" or "misused".
 *
 * A vocabulary whose owner is not composed answers ABSENT, never empty: an owner is composed once it has registered with
 * `connection-grammar`'s default registry (events at its `start`, the plane's composition; lines, money and people at
 * load), so the answer is read at the moment of the call, as `action_kind` is (R26). Nothing here writes (R22). */

import { owners, kindOf } from "../connection-grammar/index.mjs";
import { DATED_KINDS, EVENT_KINDS, STATUSES, ROLES as EVENT_ROLES, RELATION_KINDS as EVENT_RELATION_KINDS }
  from "../events/index.mjs";
import { kinds as lineKinds, capacities as lineCapacities, roles as lineRoles, CONNECTION_KINDS as LINE_CONNECTION_KINDS }
  from "../lines/index.mjs";
import { kinds as moneyKinds, phases as moneyPhases, stages as moneyStages, bases as moneyBases,
         precisions as moneyPrecisions } from "../money/index.mjs";
import { CLAIM_KINDS } from "../people/index.mjs";

/* K1486's money words, by the value each names (phases, then stages). */
const MONEY_WORDS = Object.freeze({ proposed: "proposed", adopted: "adopted", adjusted: "amended",
  encumbered: "committed", incurred: "spent", paid: "paid", assessed: "billed", collected: "collected" });

/** A plain word made from a value: `stated_cause` → "stated cause", `procuringEntity` → "procuring entity",
 *  `EventMovedOnline` → "moved online". */
export const plainWord = (v) => String(v).replace(/^Event(?=[A-Z])/, "").replace(/_/g, " ")
  .replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

const registered = (kind) => { const k = kindOf(kind); return k && typeof k.word === "string" && k.word ? k.word : null; };
const word = (w) => (w ? { word: w } : null);
const provisional = (v) => ({ word: plainWord(v), provisional: true });

/** `{values, words}` over a list of string values, each word from `wordOf(v)` or provisional. */
function vocabulary(values, wordOf = () => null) {
  const words = {};
  for (const v of values) words[v] = word(wordOf(v)) ?? provisional(v);
  return { values, words };
}

/* `holds` is registered per capacity (`line:holds:<capacity>`), so the kind alone has no registered word. */
const lineKindWord = (k) => {
  const entry = LINE_CONNECTION_KINDS.find((c) => c.kind === `line:${k}`);
  return entry ? registered(entry.kind) : null;
};

/** R39: the vocabularies of the composed owners, at the moment of the call; an uncomposed owner's are left out. */
export function composedVocabularies() {
  const reg = owners();
  const composed = new Set(reg.map((o) => o.owner));
  const out = {};
  if (composed.has("events")) {
    out.event_kinds = vocabulary(EVENT_KINDS);
    out.dated_fact_kinds = vocabulary(DATED_KINDS);
    out.event_statuses = vocabulary(STATUSES);
    out.participant_roles = vocabulary(EVENT_ROLES, (r) => registered(`event_${r}`));
    out.event_relation_kinds = vocabulary(EVENT_RELATION_KINDS, (k) => registered(`event_${k}`));
  }
  if (composed.has("lines")) {
    const kinds = lineKinds();
    out.line_kinds = vocabulary(kinds, lineKindWord);
    out.line_capacities = vocabulary(lineCapacities());
    /* each kind's own role list, the very array `roles(kind)` answers; a kind that takes none is not listed */
    const values = {}, words = {};
    for (const k of kinds) {
      const rs = lineRoles(k);
      if (!rs || !rs.length) continue;
      values[k] = rs;
      words[k] = vocabulary(rs).words;
    }
    out.line_roles = { values, words };
  }
  if (composed.has("money")) {
    const money = (v) => MONEY_WORDS[v] ?? null;
    out.money_kinds = vocabulary(moneyKinds());
    out.money_phases = vocabulary(moneyPhases(), money);
    out.money_stages = vocabulary(moneyStages(), money);
    out.money_bases = vocabulary(moneyBases());
    out.money_precisions = vocabulary(moneyPrecisions());
  }
  if (composed.has("people")) out.identity_claim_kinds = vocabulary(CLAIM_KINDS, registered);
  /* N695 (K1864): each kind carried once, in the others' shape: `values` the kind names in `owners()`'s order, `words`
     each kind's word, class and owner; the registry entries themselves are not carried beside them. */
  if (reg.length) {
    const values = [], words = {};
    for (const o of reg) for (const k of o.kinds) {
      values.push(k.kind);
      words[k.kind] = { word: k.word, class: k.class, owner: o.owner };
    }
    out.connection_kinds = { values, words };
  }
  return out;
}
