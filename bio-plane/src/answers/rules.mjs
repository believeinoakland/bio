/* The rule services (Q3; R7–R12; ladders §9.4 L3). Every rule an answer states comes from here, answered from the
 * record by its owner and labelled (R6): law (`standard`, `standardinforce`, `profiles`), time (`deadlinecompute`),
 * organisations and people (`entities`, `lines`, `holderAt`, `careerOf`, `duties`, `occurrences`) and figures
 * (`evaluate`). A later module adds its own through `registerRuleService` (R12). Each service reads under the asking
 * member's sight, writes nothing, and answers its value with its basis, grade, status and label, or `not_held` with the
 * level searched, the reason and the act that would find it. A service that throws, or an owner's refusal, answers
 * `not_held` with its reason (R7). */

import { evaluateRule } from "../civil-time/index.mjs";

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";

/** R7: a service's `not_held`. */
export const notHeld = (level, reason, act = null) => ({ not_held: { level, reason, act } });

/** An owner's answer read as a rule service's: a refusal or an absent thing is `not_held`. */
function fromOwner(r, { level, act, label, value = (x) => x, grade, basis, status }) {
  if (!r || typeof r !== "object") return notHeld(level, "the owner gave no answer", act);
  if (r.ok === false) return notHeld(level, `${r.reason || r.code || "refused"}: ${r.detail || "the owner refused the read"}`, act);
  if (r.found === false) return notHeld(level, "not held in the record", act);
  return { value: value(r), basis: basis ? basis(r) : r.basis ?? null, grade: grade ? grade(r) : r.grade ?? r.assertion ?? null,
           status: status ? status(r) : (r.undetermined ? "undetermined" : "held"), label };
}

/* A profile entry's natural key, for `profiles`' lookup. */
const ENTRY_KEYS = ["rule", "kind", "role", "source", "name", "key", "body", "year", "space"];
const sourced = (e) => plain(e) && filled(e.basis) && e.basis !== "UNMEASURED";

/** R8: law. */
function standard(args, ctx) {
  const s = ctx.dep("standards");
  if (!s) return notHeld("document", "the standards are not reachable here", "standardpropose");
  const r = s.standardRead({ id: args.id ?? args.standard ?? null, viewer: ctx.viewer });
  if (!r || r.ok === false || r.found === false)
    return notHeld("document", r && r.reason === "NO_SUCH_STANDARD" ? "no such standard is held" : `${r && r.reason}`, "standardpropose");
  const content = ctx.dep("content");
  const texts = (r.texts || []).map((t) => ({ content_id: t.content_id,
    text: content && typeof content.passageText === "function" ? content.passageText(t.content_id) : null }));
  const portion = r.portion ?? null, version = r.version ?? r.instrument ?? null;
  const value = { id: r.id ?? args.id, cite: r.cite ?? null, kind: r.kind ?? null, issuer: r.issuer ?? null,
                  period: r.period ?? null, instrument: r.instrument ?? null, portion, version, texts };
  return { value, basis: r.source ?? null, grade: null, status: "held", label: "legal_information",
           quote_only: r.kind === "court",
           limits: { reading_of: "held_text", version, portion, as_of: ctx.at } };
}

function standardinforce(args, ctx) {
  const s = ctx.dep("standards");
  if (!s) return notHeld("document", "the standards are not reachable here", "standardpropose");
  const r = s.inForceAt({ key: args.key ?? null, standard: args.standard ?? null, portion: args.portion ?? null,
                          date: args.date ?? ctx.at.slice(0, 10), viewer: ctx.viewer });
  return fromOwner(r, { level: "document", act: "standardpropose", label: "computed_fact",
    value: (x) => ({ state: x.state, why: x.why ?? null, standard: x.standard ?? null, version: x.version ?? null }),
    status: (x) => x.state, basis: (x) => x.why ?? null, grade: () => null });
}

function profiles(args, ctx) {
  const view = ctx.view();
  if (!view) return notHeld("meaning", "no jurisdiction profile is active in this copy", null);
  const section = args.section;
  if (!filled(section) || !(section in view)) return notHeld("meaning", `the active profiles hold no ${section || "section"}`, null);
  const held = view[section];
  let entry = held;
  if (Array.isArray(held)) {
    if (!filled(args.key)) return notHeld("meaning", `a ${section} entry is asked by its key`, null);
    entry = held.find((e) => plain(e) && ENTRY_KEYS.some((k) => e[k] === args.key));
    if (!entry) return notHeld("meaning", `the active profiles hold no ${section} entry ${args.key}`, null);
  }
  if (!plain(entry)) return notHeld("meaning", `the active profiles' ${section} is not an entry`, null);
  /* K1445: a rule ships only with a primary source; an UNMEASURED fact is not a basis */
  if (!sourced(entry) || (section === "deadlines" && !filled(entry.citation)))
    return notHeld("meaning", "the profile holds this rule without a primary source", null);
  const evidence = section === "action_kinds" ? entry.evidence ?? null : undefined;
  return { value: { section, entry, citation: entry.citation ?? null, horizon: entry.horizon ?? null,
                    ...(evidence !== undefined ? { standard_of_proof: evidence } : {}) },
           basis: entry.basis, grade: null, status: entry.status ?? null, label: "procedural_fact" };
}

/** R9: time. */
function deadlinecompute(args, ctx) {
  const view = ctx.view();
  if (!view) return notHeld("meaning", "no jurisdiction profile is active in this copy", null);
  const rule = (view.deadlines || []).find((d) => plain(d) && d.rule === args.rule);
  if (!rule) return notHeld("meaning", `the active profiles hold no deadline rule ${args.rule}`, null);
  if (!sourced(rule) || !filled(rule.citation)) return notHeld("meaning", "the profile holds this rule without a primary source", null);
  let anchor = args.start;
  if (typeof anchor === "string" && /^EVT-/.test(anchor)) {
    const ev = ctx.dep("events");
    const r = ev ? ev.readEvent({ eventId: anchor, viewer: ctx.viewer }) : null;
    if (!r || r.ok === false || !r.found) return notHeld("meaning", `the start event ${anchor} is not held`, "capturerequest");
    const w = r.event && r.event.when;
    if (!w || w === "undetermined" || !w.value) return { value: { undetermined: true, why: `the start event has no date the record can read` },
      basis: rule.citation, grade: null, status: "undetermined", label: "computed_fact" };
    anchor = { value: w.value, precision: w.precision, zone: w.zone };
  }
  if (!anchor) return notHeld("meaning", "a deadline is computed from a start event or date", null);
  const due = evaluateRule({ rule, anchor, view, office: args.office ?? null });
  if (due.refused) return notHeld("meaning", `${due.refused}: ${due.why}`, null);
  if (due.undetermined) return { value: { undetermined: true, why: due.why, trace: due.trace ?? null }, basis: rule.citation,
                                 grade: null, status: "undetermined", label: "computed_fact" };
  const c = due.due && due.due.candidates;
  /* K1444 (i): the group's own deadline is the earliest candidate; a body is overdue only after the latest */
  const value = { due: due.due, trace: due.trace ?? null, rule: rule.rule, citation: rule.citation,
                  ...(c ? { group_deadline: c[0], body_overdue_after: c[c.length - 1] } : {}) };
  return { value, basis: rule.citation, grade: null, status: rule.status ?? "held", label: "computed_fact" };
}

/** R10: organisations and people, as their owners answer them. */
function entities(args, ctx) {
  const e = ctx.dep("entities");
  if (!e) return notHeld("meaning", "the registry is not reachable here", "entitycreate");
  const r = filled(args.alias) ? e.entitiesByAlias({ alias: args.alias, viewer: ctx.viewer })
    : e.readEntity({ entityId: args.id ?? args.entity ?? null, viewer: ctx.viewer });
  if (r && r.ok !== false && filled(args.alias) && !r.count) return notHeld("meaning", "no registered entity holds that name", "entitycreate");
  return fromOwner(r, { level: "meaning", act: "entitycreate", label: "computed_fact" });
}

function lines(args, ctx) {
  const l = ctx.dep("lines");
  if (!l) return notHeld("meaning", "the lines are not reachable here", "linerecord");
  const r = filled(args.at) ? l.structureAt({ entity: args.entity, at: args.at, kinds: args.kinds, viewer: ctx.viewer })
    : l.linesOf({ entity: args.entity, kinds: args.kinds, direction: args.direction, limit: args.limit, viewer: ctx.viewer });
  return fromOwner(r, { level: "meaning", act: "linerecord", label: "computed_fact" });
}

function holderAt(args, ctx) {
  const l = ctx.dep("lines");
  if (!l) return notHeld("meaning", "the lines are not reachable here", "linerecord");
  const r = l.holderAt({ office: args.office, at: args.at ?? ctx.at, viewer: ctx.viewer });
  return fromOwner(r, { level: "meaning", act: "linerecord", label: "computed_fact" });
}

function careerOf(args, ctx) {
  const p = ctx.dep("people");
  if (!p) return notHeld("meaning", "the people are not reachable here", "linerecord");
  const r = p.careerOf({ entityId: args.entity ?? args.entityId, viewer: ctx.viewer });
  return fromOwner(r, { level: "meaning", act: "linerecord", label: "computed_fact" });
}

function duties(args, ctx) {
  const d = ctx.dep("duties");
  if (!d) return notHeld("meaning", "the duties are not reachable here", "dutypropose");
  const r = d.dutiesOf({ entity: args.entity, as: args.as, at: args.at, limit: args.limit, viewer: ctx.viewer });
  return fromOwner(r, { level: "meaning", act: "dutypropose", label: "computed_fact" });
}

function occurrences(args, ctx) {
  const d = ctx.dep("duties");
  if (!d) return notHeld("meaning", "the duties are not reachable here", "dutypropose");
  const r = d.occurrencesOf({ dutyId: args.duty ?? args.dutyId, from: args.from, to: args.to,
                              asOf: args.asOf ?? ctx.at.replace(/\.\d+Z$/, "Z"), viewer: ctx.viewer });
  return fromOwner(r, { level: "meaning", act: "dutypropose", label: "computed_fact" });
}

/** R11: figures, computed and not persisted; a comparison is a computed fact, never a breach (D275). */
async function evaluate(args, ctx) {
  const c = ctx.dep("calculations");
  if (!c) return notHeld("meaning", "the calculations are not reachable here", "calculationcreate");
  const r = await c.evaluate({ recipe: args.recipe, inputs: args.inputs, viewer: ctx.viewer, kind: args.kind ?? null });
  return fromOwner(r, { level: "meaning", act: "calculationcreate", label: "computed_fact", grade: () => null,
    basis: (x) => x.method_version ?? x.method ?? null });
}

/** R8–R11: the built-in services, by name. */
export const BUILT_IN_SERVICES = Object.freeze({ standard, standardinforce, profiles, deadlinecompute, entities, lines,
  holderAt, careerOf, duties, occurrences, evaluate });
export const RULE_SERVICE_NAMES = Object.freeze(Object.keys(BUILT_IN_SERVICES));
