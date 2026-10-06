/* corpus-export — the renderings in open standards (requirements: `build/requirements/corpus-export.md` R10; scope §1
 * EVENTS, PEOPLE, MONEY; B §(d)).
 *
 * WHAT IS RENDERED. Only rows R7 would carry to the viewer: a table whose owner declared it `export: "yes"` (never one
 * declared `never` or `admin-only`, J1 (4)), and of its rows only those the viewer may see. Sight is each owner's: an
 * event, a line and a money fact are read through their owners' viewer reads (`events.readEvent`, `lines.readLine`,
 * `money.readFact`), so a row the owner withholds from the viewer is never rendered; the registry of entities is
 * group-wide (entities R49) and reaches any viewer `membership`'s rule admits; a person fact is seen when its citing
 * capture's bundle is (`membership.viewerPredicate` over provenance's `register`). An absent or unknown viewer sees
 * nothing (fail closed). Withdrawn rows are not rendered.
 *
 * WHAT IS NEVER RENDERED. A field the record does not hold (it is omitted, never filled or defaulted); a home address,
 * a phone number or any contact (K1485: person facts of kinds `address`, `contact` and `locality` are never read); a
 * `never` table; a row the viewer may not see. A rendering adds no fact: every item carries the record id it renders
 * (`record_id`) and its citation (`citation`).
 *
 * THE STANDARDS, pinned (J1 (5)):
 *   ftm-event, ftm-people, ftm   FollowTheMoney schema 3.x entity JSON, `{id, schema, properties}` (values as lists)
 *   ocel2                        OCEL 2.0 JSON (`objectTypes`, `eventTypes`, `objects`, `events`)
 *   popolo                       Popolo JSON (persons, organizations, posts, memberships)
 *   ocds                         OCDS 1.1 release package
 *   fdp                          Frictionless Fiscal Data Package v1 (`datapackage.json`, the rows inline) */
import { viewerPredicate } from "../membership/index.mjs";

export const FORMATS = Object.freeze(["ftm-event", "ocel2", "popolo", "ftm-people", "ftm", "ocds", "fdp"]);
export const STANDARDS = Object.freeze({
  "ftm-event": "FollowTheMoney 3.x (Event)", ocel2: "OCEL 2.0 JSON", popolo: "Popolo JSON",
  "ftm-people": "FollowTheMoney 3.x (Person and its relations)", ftm: "FollowTheMoney 3.x (Payment)",
  ocds: "OCDS 1.1 release package", fdp: "Fiscal Data Package v1",
});
/** The most records of one source one rendering reads; past it the rendering says `truncated`. */
export const RENDER_MAX = 5000;

const ORG_KINDS = new Set(["institution", "body", "movement"]);
/* The person-fact kinds a rendering may read; address, contact and locality are never read (K1485). */
const PERSON_FACT_KINDS = new Set(["name", "birth", "death"]);
const parse = (s) => { try { return typeof s === "string" ? JSON.parse(s) : s ?? null; } catch { return null; } };
const day = (iso) => (typeof iso === "string" && iso.length >= 10 ? iso.slice(0, 10) : null);
/* A properties object with only the values held: every list empty or of nulls is left out. */
function props(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    const list = (Array.isArray(v) ? v : [v]).filter((x) => x !== null && x !== undefined && x !== "");
    if (list.length) out[k] = list.map(String);
  }
  return out;
}
/* An object with only the fields held. */
function held(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)) out[k] = v;
  return out;
}

/** The rows a rendering may read, for one viewer. `deps`: `sql`, `record`, and the owners' services (each an instance
 *  or a function answering it): `entities`, `events`, `lines`, `money`. */
export class RenderSource {
  constructor({ sql, record, entities, events, lines, money }, viewer) {
    this.sql = sql;
    this.viewer = viewer;
    this.gate = viewerPredicate(viewer);
    this.sees = this.gate.scope !== "DENY";
    const declared = record && typeof record.declaredTables === "function" ? record.declaredTables() : [];
    this.yes = new Set(declared.filter((d) => d.export === "yes").map((d) => d.name));
    this.dep = { entities, events, lines, money };
    this.truncated = false;
    this.memo = new Map();
  }

  #svc(name) {
    const d = this.dep[name];
    return typeof d === "function" ? (this.dep[name] = d()) : d;
  }
  #rows(q, ...a) { try { return [...this.sql.exec(q, ...a)]; } catch { return []; } }
  /* The ids of a contract table, in id order, bounded (R10 reads at most RENDER_MAX per source). */
  #ids(table, column, where = "") {
    if (!this.sees || !this.yes.has(table)) return [];
    const got = this.#rows(`SELECT ${column} AS id FROM ${table} ${where} ORDER BY ${column} LIMIT ?`, RENDER_MAX + 1);
    if (got.length > RENDER_MAX) { this.truncated = true; got.length = RENDER_MAX; }
    return got.map((r) => r.id);
  }

  /** Whether the viewer may see the bundle a capture is registered in (any of them). */
  seesCapture(sha) {
    if (!this.sees || typeof sha !== "string") return false;
    const k = `c:${sha}`;
    if (!this.memo.has(k))
      this.memo.set(k, this.#rows(`SELECT 1 AS ok FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
                                   WHERE r.capture_sha = ? AND (${this.gate.sql}) LIMIT 1`, sha, ...this.gate.args).length > 0);
    return this.memo.get(k);
  }

  /** An entity of the registry (group-wide), or null. */
  entity(id) {
    if (!this.sees || !this.yes.has("entities") || typeof id !== "string") return null;
    const k = `e:${id}`;
    if (!this.memo.has(k)) {
      const svc = this.#svc("entities");
      const r = svc && typeof svc.readEntity === "function" ? svc.readEntity({ entityId: id }) : null;
      this.memo.set(k, r && r.ok && r.found ? r.entity : null);
    }
    return this.memo.get(k);
  }
  entities(kinds = null) {
    const ids = this.#ids("entities", "entity_id");
    return ids.map((id) => this.entity(id)).filter((e) => e && (!kinds || kinds.has(e.kind)));
  }

  events() {
    const svc = this.#svc("events");
    if (!svc) return [];
    const seen = new Set(), out = [];
    for (const id of this.#ids("events", "event_id")) {
      const r = svc.readEvent({ eventId: id, viewer: this.viewer });
      const e = r && r.ok && r.found ? r.event : null;
      if (e && !seen.has(e.event_id)) { seen.add(e.event_id); out.push(e); }
    }
    return out;
  }
  lines(kinds = null) {
    const svc = this.#svc("lines");
    if (!svc) return [];
    return this.#ids("lines", "line_id").map((id) => svc.readLine({ lineId: id, viewer: this.viewer }))
      .map((r) => (r && r.ok && r.found ? r.line : null))
      .filter((l) => l && !l.withdrawn && (!kinds || kinds.has(l.kind)));
  }
  facts() {
    const svc = this.#svc("money");
    if (!svc) return [];
    return this.#ids("money_facts", "fact_id").map((id) => svc.readFact({ factId: id, viewer: this.viewer }))
      .map((r) => (r && r.ok && r.found ? r.fact : null)).filter((f) => f && !f.withdrawn);
  }
  /** Person facts of kinds name, birth and death, not withdrawn, whose citing capture the viewer may see. */
  personFacts() {
    if (!this.sees || !this.yes.has("person_facts")) return [];
    const got = this.#rows(`SELECT fact_id, person, kind, value, capture_sha, extent_json FROM person_facts
                            WHERE withdrawn_at IS NULL AND kind IN ('name', 'birth', 'death') ORDER BY fact_id LIMIT ?`, RENDER_MAX + 1);
    if (got.length > RENDER_MAX) { this.truncated = true; got.length = RENDER_MAX; }
    return got.filter((f) => PERSON_FACT_KINDS.has(f.kind) && this.seesCapture(f.capture_sha))
      .map((f) => ({ ...f, extent: parse(f.extent_json) }));
  }
}

/* ---- citations ---- */

const entityCitation = (e) => ({ registry: "entities", declared_at: e.at });
function eventCitation(e) {
  return (e.attestations || []).map((a) => (a.capture_sha ? held({ capture_sha: a.capture_sha, extent: parse(a.extent) ?? a.extent ?? null })
                                                         : { testimony: "a member's testimony" }));
}
const lineCitation = (l) => held({ citation: l.citation, capture_sha: l.basis && (l.basis.captureSha || l.basis.capture_sha),
                                   extent: l.basis && l.basis.extent });
const factCitation = (f) => held({ citation: f.citation, capture_sha: f.source && f.source.capture_sha, extent: f.source && f.source.extent,
                                   source_fact: f.source && f.source.fact });
const personFactCitation = (pf) => held({ capture_sha: pf.capture_sha, extent: pf.extent });

/* ---- FollowTheMoney ---- */

function ftmSchemaOf(e) {
  if (e.kind === "person") return "Person";
  if (ORG_KINDS.has(e.kind)) return e.sector === "government" ? "PublicBody" : e.sector === "company" ? "Company" : "Organization";
  if (e.kind === "office") return "Position";
  return "LegalEntity";
}
function ftmEntity(e, extra = {}) {
  const names = (e.aliases || []).filter((a) => !a.withdrawn).map((a) => a.alias);
  return { id: e.entity_id, schema: ftmSchemaOf(e), record_id: e.entity_id, citation: entityCitation(e),
           properties: props({ name: e.label, alias: names.filter((n) => n !== e.label), ...extra }) };
}
/* The registry entities a set of items names, each rendered once, in id order. */
function referenced(src, ids, extra = () => ({})) {
  return [...new Set(ids.filter(Boolean))].sort().map((id) => src.entity(id)).filter(Boolean).map((e) => ftmEntity(e, extra(e)));
}

function ftmEvent(src) {
  const items = [], ids = [];
  for (const e of src.events()) {
    const parts = (e.participants || []).filter((p) => !p.superseded);
    const role = (r) => parts.filter((p) => p.role === r).map((p) => p.entity_id);
    const when = e.when && typeof e.when === "object" ? e.when : null;
    const one = when && when.precision === "day" && when.value ? when.value : null;
    ids.push(...parts.map((p) => p.entity_id), ...(e.concerns || []).map((c) => c.id || c.end_id || c));
    items.push({ id: e.event_id, schema: "Event", record_id: e.event_id, citation: eventCitation(e),
      properties: props({ summary: `${e.kind} (${e.status})`, date: one, startDate: one ? null : when && when.start,
        endDate: one ? null : when && when.end, location: e.where, organizer: role("organizer"),
        involved: parts.filter((p) => p.role !== "organizer").map((p) => p.entity_id) }) });
  }
  return { entities: [...items, ...referenced(src, ids)] };
}

const FTM_LINE = {
  holds: { schema: "Occupancy", from: "holder", to: "post" },
  belongs_to: { schema: "Membership", from: "member", to: "organization" },
  related_to: { schema: "Family", from: "person", to: "relative" },
  associate_of: { schema: "Associate", from: "person", to: "associate" },
  owns_interest_in: { schema: "Ownership", from: "owner", to: "asset" },
};
function ftmPeople(src) {
  const persons = src.entities(new Set(["person"]));
  const facts = src.personFacts();
  const byPerson = new Map();
  for (const f of facts) { if (!byPerson.has(f.person)) byPerson.set(f.person, []); byPerson.get(f.person).push(f); }
  const items = persons.map((e) => {
    const fs = byPerson.get(e.entity_id) || [];
    const of = (k) => fs.filter((f) => f.kind === k).map((f) => f.value);
    return { ...ftmEntity(e, { birthDate: of("birth"), deathDate: of("death"), alias: of("name") }),
             citation: [entityCitation(e), ...fs.map(personFactCitation)], person_facts: fs.map((f) => f.fact_id) };
  });
  const ids = [];
  for (const l of src.lines(new Set(Object.keys(FTM_LINE)))) {
    const m = FTM_LINE[l.kind];
    ids.push(l.from, l.to);
    const v = l.valid || {};
    items.push({ id: l.line_id, schema: m.schema, record_id: l.line_id, citation: lineCitation(l),
      properties: props({ [m.from]: l.from, [m.to]: l.to, startDate: v.from, endDate: v.to,
                          role: l.capacity || l.role }) });
  }
  const have = new Set(persons.map((e) => e.entity_id));
  return { entities: [...items, ...referenced(src, ids.filter((id) => !have.has(id)))] };
}

const signed = (f) => (f.sign === "-" && f.amount ? `-${f.amount}` : f.amount);
function ftmMoney(src) {
  const items = [], ids = [];
  for (const f of src.facts()) {
    const p = f.period || {};
    ids.push(f.from && f.from.entity, f.to && f.to.entity);
    items.push({ id: f.fact_id, schema: "Payment", record_id: f.fact_id, citation: factCitation(f),
      properties: props({ amount: signed(f), currency: f.currency, payer: f.from && f.from.entity, beneficiary: f.to && f.to.entity,
                          startDate: p.from, endDate: p.to, summary: [f.kind, f.phase, f.stage].filter(Boolean).join(" "),
                          programme: (f.codes || []).map((c) => `${c.scheme}:${c.code}`) }) });
  }
  return { entities: [...items, ...referenced(src, ids)] };
}

/* ---- OCEL 2.0 ---- */

function ocel2(src) {
  const events = [], objectIds = new Set(), types = new Map();
  for (const e of src.events()) {
    const when = e.when && typeof e.when === "object" ? e.when : null;
    const rel = [...(e.participants || []).filter((p) => !p.superseded).map((p) => ({ objectId: p.entity_id, qualifier: p.role })),
                 ...(e.concerns || []).map((c) => ({ objectId: c.id || c.end_id || c, qualifier: "concerns" }))]
      .filter((r) => typeof r.objectId === "string");
    rel.forEach((r) => objectIds.add(r.objectId));
    types.set(e.kind, true);
    events.push({ id: e.event_id, type: e.kind, ...(when && when.start ? { time: when.start } : {}),
      attributes: [{ name: "status", value: e.status }, ...(when ? [{ name: "precision", value: when.precision }] : [])],
      relationships: rel, record_id: e.event_id, citation: eventCitation(e) });
  }
  const objects = [...objectIds].sort().map((id) => src.entity(id)).filter(Boolean)
    .map((o) => ({ id: o.entity_id, type: o.kind, attributes: [{ name: "label", time: o.at, value: o.label }], relationships: [],
                   record_id: o.entity_id, citation: entityCitation(o) }));
  /* An event related to an object the viewer may not see keeps no relationship to it. */
  const kept = new Set(objects.map((o) => o.id));
  for (const e of events) e.relationships = e.relationships.filter((r) => kept.has(r.objectId));
  return {
    objectTypes: [...new Set(objects.map((o) => o.type))].sort().map((name) => ({ name, attributes: [{ name: "label", type: "string" }] })),
    eventTypes: [...types.keys()].sort().map((name) => ({ name, attributes: [{ name: "status", type: "string" }, { name: "precision", type: "string" }] })),
    objects, events,
  };
}

/* ---- Popolo ---- */

function popolo(src) {
  const persons = src.entities(new Set(["person"]));
  const facts = src.personFacts();
  const people = persons.map((e) => {
    const fs = facts.filter((f) => f.person === e.entity_id);
    const one = (k) => fs.filter((f) => f.kind === k).map((f) => f.value)[0] ?? null;
    return held({ id: e.entity_id, name: e.label,
      other_names: [...(e.aliases || []).filter((a) => !a.withdrawn && a.alias !== e.label).map((a) => ({ name: a.alias })),
                    ...fs.filter((f) => f.kind === "name").map((f) => ({ name: f.value }))],
      birth_date: one("birth"), death_date: one("death"),
      identifiers: (e.identifiers || []).filter((i) => !i.withdrawn).map((i) => ({ scheme: i.scheme, identifier: i.id })),
      record_id: e.entity_id, citation: [entityCitation(e), ...fs.map(personFactCitation)] });
  });
  const lines = src.lines(new Set(["holds", "belongs_to", "post_in", "part_of"]));
  const postOrg = new Map(lines.filter((l) => l.kind === "post_in").map((l) => [l.from, l.to]));
  const organizations = src.entities(ORG_KINDS).map((e) => held({ id: e.entity_id, name: e.label,
    classification: e.sector && e.sector !== "undetermined" ? e.sector : null,
    parent_id: (lines.find((l) => l.kind === "part_of" && l.from === e.entity_id) || {}).to ?? null,
    identifiers: (e.identifiers || []).filter((i) => !i.withdrawn).map((i) => ({ scheme: i.scheme, identifier: i.id })),
    record_id: e.entity_id, citation: entityCitation(e) }));
  const posts = src.entities(new Set(["office"])).map((e) => held({ id: e.entity_id, label: e.label,
    organization_id: postOrg.get(e.entity_id) ?? null, record_id: e.entity_id, citation: entityCitation(e) }));
  const personIds = new Set(persons.map((p) => p.entity_id)), orgIds = new Set(organizations.map((o) => o.id)),
        postIds = new Set(posts.map((p) => p.id));
  const memberships = lines.filter((l) => (l.kind === "holds" || l.kind === "belongs_to") && personIds.has(l.from)).map((l) => {
    const v = l.valid || {};
    const post = l.kind === "holds" && postIds.has(l.to) ? l.to : null;
    const org = l.kind === "belongs_to" || orgIds.has(l.to) ? (orgIds.has(l.to) ? l.to : null) : post ? postOrg.get(post) ?? null : null;
    return held({ id: l.line_id, person_id: l.from, post_id: post, organization_id: org, role: l.capacity,
                  start_date: v.from, end_date: v.to, record_id: l.line_id, citation: lineCitation(l) });
  });
  return { persons: people, organizations, posts, memberships };
}

/* ---- OCDS 1.1 ---- */

function ocds(src, at) {
  const party = (p, role) => {
    const e = p && p.entity ? src.entity(p.entity) : null;
    return e ? { id: e.entity_id, name: e.label, roles: [role] } : null;
  };
  const releases = src.facts().map((f) => {
    const contract = (f.concerns || []).map((c) => (typeof c === "string" ? c : c.id || c.concerns)).map((id) => src.entity(id))
      .find((e) => e && e.kind === "contract");
    const payer = party(f.from, "payer"), payee = party(f.to, "payee");
    const value = { amount: Number(signed(f)), currency: f.currency };
    const actual = f.phase === "actual";
    return held({ ocid: `bio-${contract ? contract.entity_id : f.fact_id}`, id: f.fact_id, date: f.at,
      tag: [actual ? "implementation" : "planning"],
      parties: [payer, payee].filter(Boolean),
      planning: actual ? null : { budget: held({ amount: value, description: [f.kind, f.phase].join(" "),
                                                period: held({ startDate: f.period && f.period.from, endDate: f.period && f.period.to }) }) },
      contracts: actual ? [held({ id: contract ? contract.entity_id : f.fact_id, title: contract ? contract.label : null,
        implementation: { transactions: [held({ id: f.fact_id, value, payer: payer && { id: payer.id, name: payer.name },
                                                payee: payee && { id: payee.id, name: payee.name } })] } })] : null,
      record_id: f.fact_id, citation: factCitation(f) });
  });
  return { version: "1.1", publishedDate: at, releases };
}

/* ---- Fiscal Data Package v1 ---- */

function fdp(src) {
  const rows = src.facts().map((f) => held({ fact_id: f.fact_id, amount: signed(f), currency: f.currency, kind: f.kind,
    phase: f.phase, stage: f.stage, basis: f.basis, period_from: f.period && f.period.from, period_to: f.period && f.period.to,
    payer: f.from && f.from.entity, payee: f.to && f.to.entity, codes: (f.codes || []).map((c) => `${c.scheme}:${c.code}`).join(" ") || null,
    record_id: f.fact_id, citation: JSON.stringify(factCitation(f)) }));
  const field = (name, type = "string") => ({ name, type });
  return { profile: "fiscal-data-package", name: "money-facts",
    resources: [{ name: "money-facts", profile: "tabular-data-resource", data: rows,
      schema: { fields: [field("fact_id"), field("amount", "number"), field("currency"), field("kind"), field("phase"), field("stage"),
                         field("basis"), field("period_from", "date"), field("period_to", "date"), field("payer"), field("payee"),
                         field("codes"), field("record_id"), field("citation")], primaryKey: ["fact_id"] } }],
    model: { measures: { amount: { source: "amount", currency: "USD" } },
             dimensions: { kind: { attributes: { kind: { source: "kind" } }, primaryKey: "kind" },
                           phase: { attributes: { phase: { source: "phase" } }, primaryKey: "phase" },
                           period: { attributes: { from: { source: "period_from" }, to: { source: "period_to" } }, primaryKey: "from",
                                     dimensionType: "datetime" } } } };
}

/** R10: one rendering, for one viewer, from the rows R7 would carry to that viewer and no others. */
export function render(format, deps, viewer, at) {
  const src = new RenderSource(deps, viewer);
  const body = format === "ftm-event" ? ftmEvent(src) : format === "ocel2" ? ocel2(src) : format === "popolo" ? popolo(src)
    : format === "ftm-people" ? ftmPeople(src) : format === "ftm" ? ftmMoney(src) : format === "ocds" ? ocds(src, at) : fdp(src);
  if (format === "fdp") {
    /* The measure's currency is the facts' own when they share one; several currencies name none. */
    const cs = [...new Set(body.resources[0].data.map((r) => r.currency))];
    if (cs.length === 1) body.model.measures.amount.currency = cs[0]; else delete body.model.measures.amount.currency;
  }
  return { body, truncated: src.truncated };
}

/** How many items a rendering holds (for its log row). */
export function itemsOf(format, body) {
  if (format === "ocel2") return body.events.length + body.objects.length;
  if (format === "popolo") return body.persons.length + body.organizations.length + body.posts.length + body.memberships.length;
  if (format === "ocds") return body.releases.length;
  if (format === "fdp") return body.resources[0].data.length;
  return body.entities.length;
}
