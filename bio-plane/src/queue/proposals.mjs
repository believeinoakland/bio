/* queue — the FINDING producer over `progressions.proposalsFeed` (R9, R12, R16; N107).
 *
 * proposalsFeed is the ONE derivation (REC-6/7/8) and is read whole rather than re-implemented, so the queue and
 * op=proposals cannot disagree about what is open. It has ALREADY aged out every disposed finding, and its
 * disposition key is (progression_key, stage_key), the proposal's own identity, the EVENT, never (member, case). So
 * the FINDING half inherits DEC-16's shape from the producer: one op=proposedispose clears the item under every case.
 *
 * N107 (K147): progressions R31's `cardinality_exceeded` finding is published in `instances[]` and NOT aggregated
 * into `proposals[]`, because a proposal is worded "the stage is required and absent", which this finding is not. It
 * is aggregated HERE, in its own words, one item per (progression, stage) like every proposal item, and keyed the
 * same: one decision (`proposal_dispositions` is keyed by the pair) governs one item (R32). When the stage also has a
 * missing-stage proposal, the finding joins that item, whose kind leads and whose basis names both.
 *
 * PURE: no storage, no clock, no viewer. What needs them is the caller's, passed in: the subject bundles an instance
 * reaches through the viewer's gate, the homes of a set of subjects (R7) and the options on them (R12). */
import { weakerGrade } from "../connections/index.mjs";

export const CARDINALITY_EXCEEDED = "cardinality_exceeded";

const plural = (n, one, many) => (n === 1 ? one : many);
/* A stage is named by its label, or by its key when it was declared without one: never the word "null". */
const stageName = (x) => (typeof x.stage_label === "string" && x.stage_label.trim() ? x.stage_label : x.stage_key);
const cmpKey = (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

/** The proposal's own `prior_disposition` shape, from `dispositions[]`, for a group that has no proposal to carry
 *  one. A finding still in `instances[]` is one no applying decision governs, so what is found is an earlier one. */
function priorOf(dispositions, key) {
  const d = (dispositions || []).find((x) => x && x.key === key);
  return d ? { state: d.state, reason: d.reason, decided_by: d.decided_by, at: d.at,
               definition_version: d.definition_version, definition_version_state: d.definition_version_state,
               applies: false, applies_because: d.applies_because } : null;
}

/** The open `cardinality_exceeded` findings of `feed.instances`, one group per (progression, stage), each carrying
 *  its instances, the weakest grade across them (null, undetermined, when any is), ordered as proposals are: most
 *  instances first, then key. */
export function cardinalityGroups(feed) {
  const groups = new Map();
  for (const inst of (feed && Array.isArray(feed.instances) ? feed.instances : [])) {
    for (const f of (Array.isArray(inst.findings) ? inst.findings : [])) {
      if (!f || f.kind !== CARDINALITY_EXCEEDED) continue;
      const key = `${inst.progression_key}::${f.stage_key}`;
      let g = groups.get(key);
      if (!g) {
        g = { key, progression_key: inst.progression_key, progression_label: inst.progression_label,
              stage_key: f.stage_key, stage_label: f.stage_label, cardinality: f.cardinality,
              definition_version: inst.definition_version, instances: [] };
        groups.set(key, g);
      }
      g.instances.push({ entity_id: inst.entity_id, entity_label: inst.entity_label ?? null,
                         progression_key: inst.progression_key, definition_version: inst.definition_version,
                         document_count: f.document_count,
                         grade: f.grade_determined === true ? f.grade : null, grade_determined: f.grade_determined === true });
    }
  }
  const out = [];
  for (const g of groups.values()) {
    g.n = g.instances.length;
    g.document_count = g.instances.reduce((s, i) => s + (Number(i.document_count) || 0), 0);
    const undetermined = g.instances.some((i) => !i.grade_determined || !i.grade);
    g.grade_determined = !undetermined;
    g.grade = undetermined ? null : g.instances.map((i) => i.grade).reduce((a, b) => weakerGrade(a, b));
    out.push(g);
  }
  return out.sort((a, b) => b.n - a.n || cmpKey(a, b));
}

/** The cardinality sentence, in this module's words: never "required and absent". */
export function cardinalityDetail(g) {
  const held = g.cardinality === "1" ? "exactly one" : "at most one";
  return `${g.n} ${plural(g.n, "instance", "instances")} of this progression thread more than one document at `
       + `'${stageName(g)}' (${g.document_count} in all), which is declared to hold ${held}: a finding, which decides `
       + `nothing about which of them belongs (framework 8.2)`;
}

/** R9, R12, R16: the FINDING items of `proposalsFeed`'s answer.
 *  - subjectsOf(progressionKey, entityId) → the bundle ids the viewer may see behind that instance (R33);
 *  - homesOf(subjects) → the home set (R7); optionsOf(subjects) → the item's options (R12);
 *  - subjectsMax: how many subject bundles the item names (R9: 8). */
export function proposalFindingItems(feed, { subjectsOf, homesOf, optionsOf, subjectsMax = 8 } = {}) {
  const subjectsFor = (instances, into = []) => {
    for (const inst of instances)
      for (const b of subjectsOf(inst.progression_key, inst.entity_id) || [])
        if (!into.includes(b)) into.push(b);
    return into;
  };
  const exceeded = new Map(cardinalityGroups(feed).map((g) => [g.key, g]));
  const items = [];
  const item = ({ key, kind, p, subjects, prior, summary, detail, basis }) => ({
    id: `FINDING::${key}`,
    class: "FINDING",
    kind,
    case: homesOf(subjects),
    subject: { kind: "progression_stage", id: null, progression_key: p.progression_key, stage_key: p.stage_key,
               definition_version: p.definition_version, bundles: subjects.slice(0, subjectsMax) },
    /* D-527: the earlier decision travels with the reopened question, the producer's object unchanged. */
    prior_disposition: prior,
    summary,
    detail,
    basis: { source: "proposalsFeed", progression_key: p.progression_key, stage_key: p.stage_key, ...basis,
             detail: "a finding is DERIVED (D-79): the record's own question, aggregated one per "
                   + "(progression, stage), graded the weakest instance and never averaged." },
    /* A derived finding is recomputed on every read and has no creation instant to age from (U). */
    age: { state: "undetermined", reason: "derived_on_read",
           detail: "a derived finding is recomputed at read time and has no creation instant; "
                 + "the temporal signal it does carry is overdue_count on the basis" },
    assignee: null,
    assignee_role: null,
    options: optionsOf(subjects),
  });
  for (const p of (feed && Array.isArray(feed.proposals) ? feed.proposals : [])) {
    const g = exceeded.get(p.key) || null;
    exceeded.delete(p.key);
    const subjects = subjectsFor(p.instances || []);
    if (g) subjectsFor(g.instances, subjects);
    items.push(item({
      key: p.key, p, subjects, prior: p.prior_disposition,
      /* The ESCALATED kind leads when the stage has also crossed a deadline: one kind, the full set on the basis. */
      kind: p.overdue ? "overdue_successor" : "missing_predecessor",
      summary: `${p.progression_label}: the '${stageName(p)}' stage is ${p.required} required and absent`,
      detail: `${p.n} ${plural(p.n, "instance", "instances")} of this progression reach${plural(p.n, "es", "")} `
            + `'${stageName(p)}' without it` + (p.overdue ? `, ${p.overdue_count} past a declared deadline` : "")
            + (g ? `; and ${cardinalityDetail(g)}` : ""),
      basis: { kinds: g ? [...p.kinds, CARDINALITY_EXCEEDED] : p.kinds, n: p.n, grade: p.grade,
               grade_determined: p.grade_determined, overdue_count: p.overdue_count, surfaced_by: p.surfaced_by,
               ...(g ? { cardinality_exceeded: { n: g.n, cardinality: g.cardinality, document_count: g.document_count,
                                                 grade: g.grade, grade_determined: g.grade_determined } } : {}) },
    }));
  }
  for (const g of exceeded.values()) {
    items.push(item({
      key: g.key, p: g, subjects: subjectsFor(g.instances), prior: priorOf(feed.dispositions, g.key),
      kind: CARDINALITY_EXCEEDED,
      summary: `${g.progression_label}: the '${stageName(g)}' stage holds more documents than it is declared to hold`,
      detail: cardinalityDetail(g),
      basis: { kinds: [CARDINALITY_EXCEEDED], n: g.n, grade: g.grade, grade_determined: g.grade_determined,
               overdue_count: 0, surfaced_by: "machine", cardinality: g.cardinality, document_count: g.document_count },
    }));
  }
  return items;
}
