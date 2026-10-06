/* Fixture owners of connections, written the way each owner's job writes its `neighbours` (connection-grammar R6–R8):
   in-memory rows indexed at both ends, sight by `seen_by`, hunches only within their inquiry, validity through
   civil-time, pages of 100, a hub named above 1,000. Their rows sit in one store so a test can count every table's
   rows before and after an exploration (explore R9). The kinds stand in for the owners not yet built (lines, events,
   money, duties, people, hypotheses); each owner's own job registers its real ones. */
import { validAt } from "../../../../src/civil-time/index.mjs";
import { BOUNDS, createRegistry, derivedId, DECLARED_LABEL, HUNCH_LABEL } from "../../../../src/connection-grammar/index.mjs";

export const ZONE = "America/Los_Angeles";
export const AT = { value: "2026-03-01", precision: "day", zone: ZONE };
export const INQUIRY = "INQ-2026-0001-a-question";
export const valid = (from, to) => ({ from, to, precision: "day", zone: ZONE });
export const ALWAYS = valid("2000-01-01", "2099-12-31");

const tail = (n) => n.toString(36).padStart(16, "0");
export const ent = (n) => `ENT-2026-${String(n).padStart(4, "0")}`;
export const evt = (n) => `EVT-2026-${tail(n)}`;
export const dut = (n) => `DUT-2026-${String(n).padStart(4, "0")}`;

/** The fixture owners' kinds, with the members' words and classes (connection-grammar R2). */
export const OWNER_KINDS = {
  lines: [
    ["part_of", "part of"], ["reports_to", "reports to"], ["oversees", "oversees"], ["appoints", "appoints"], ["funds", "funds"],
    ["holds_elected", "holds, elected"], ["holds_employee", "holds, employee"], ["seat_on", "seat on"], ["belongs_to", "belongs to"],
    ["educated_at", "educated at"], ["contracts_with", "contracts with"],
  ].map(([kind, word]) => ({ kind, word, class: "evidentiary" })),
  events: [
    ["took_part_voted", "took part, voted"], ["took_part_decider", "took part, decided"], ["concerns", "concerns"],
    ["authorises", "authorises"], ["answers", "answers"], ["amends", "amends"], ["reverses", "reverses"], ["stated_cause", "stated cause"], ["within", "within"],
  ].map(([kind, word]) => ({ kind, word, class: "evidentiary" })),
  money: [["contribution", "gave money to"], ["payment", "paid"]].map(([kind, word]) => ({ kind, word, class: "evidentiary" })),
  duties: [
    { kind: "owes", word: "owes", class: "evidentiary" },
    { kind: "holds_power", word: "holds the power", class: "evidentiary" },
    { kind: "met_by", word: "met by", class: "derived" },
  ],
  entities: [["proxy_for", "stands for"], ["member_of", "grouped under"], ["overlaps", "overlaps with"]].map(([kind, word]) => ({ kind, word, class: "declared" })),
  hypotheses: [{ kind: "hunch_tie", word: "a hunch about", class: "hunch" }],
  connections: [{ kind: "mentioned_together", word: "mentioned together", class: "derived" }],
};

const OWNER_OF = Object.fromEntries(Object.entries(OWNER_KINDS).flatMap(([o, ks]) => ks.map((k) => [k.kind, o])));
const CLASS_OF = Object.fromEntries(Object.values(OWNER_KINDS).flat().map((k) => [k.kind, k.class]));
let seq = 0;

/**
 * One connection in the shape, for its kind's owner and class.
 * @param {string} kind @param {string} from @param {string} to
 * @param {{id?: string, valid?: any, grade?: any, seen_by?: string[], scope?: string, quantities?: any, as_of?: string, method?: string, inputs?: any[]}} [o]
 */
export function conn(kind, from, to, o = {}) {
  const owner = OWNER_OF[kind], cls = CLASS_OF[kind];
  const v = o.valid ?? ALWAYS;
  const base = { from, to, kind, owner, valid: v, evidence: [{ source: "INFO-2026-0001-a-source" }],
    grade: o.grade ?? { assertion: "B", ends: ["A", "B"] }, derived: null };
  let c;
  if (cls === "declared") c = { ...base, id: o.id ?? `c-${++seq}`, evidence: [], grade: { assertion: "D", ends: ["B", "B"] }, label: DECLARED_LABEL };
  else if (cls === "hunch") c = { ...base, id: o.id ?? `c-${++seq}`, evidence: [], grade: null, label: HUNCH_LABEL, scope: o.scope ?? INQUIRY };
  else if (cls === "derived") {
    const d = { method: o.method ?? "co-mention", inputs: o.inputs ?? ["INFO-2026-0001-a-source"], as_of: o.as_of ?? "2026-02-01" };
    c = { ...base, id: derivedId({ kind, from, to, as_of: d.as_of, method: d.method }), grade: o.grade ?? { assertion: "C", ends: ["B", "C"] }, derived: d };
  } else c = { ...base, id: o.id ?? `c-${++seq}` };
  if (o.quantities) c.quantities = o.quantities;
  if (o.seen_by) c.seen_by = o.seen_by;
  return c;
}

/** The store every fixture owner keeps its rows in: one table per owner. */
export function makeStore() {
  return { tables: new Map(), counts() { return Object.fromEntries([...this.tables].map(([t, rows]) => [t, rows.length])); },
    snapshot() { return JSON.stringify([...this.tables]); } };
}

/**
 * A conforming owner's `neighbours` over its rows.
 * @param {any} store @param {string} owner @param {any[]} rows
 * @param {{unread?: Record<string, {what: string, why: string}[]>, pageSize?: number, log?: any[], truncatedAt?: string[], noHub?: boolean}} [opt]
 */
export function makeOwner(store, owner, rows, opt = {}) {
  store.tables.set(owner, rows);
  const index = new Map();
  for (const c of rows) for (const end of new Set([c.from, c.to])) {
    if (!index.has(end)) index.set(end, []);
    index.get(end).push(c);
  }
  const size = opt.pageSize ?? 100;
  // A real owner reads validity from its bound cache; the fixture keeps each answer of civil-time's validAt.
  const memo = new Map();
  const validity = (c, at) => {
    const key = `${c.id}\u0000${JSON.stringify(at)}`;
    if (!memo.has(key)) memo.set(key, validAt({ valid: c.valid }, at));
    return memo.get(key);
  };
  return function neighbours(args) {
    opt.log?.push(args);
    const { node, kinds, at, page, viewer, scope } = args;
    if (viewer === undefined || viewer === null || viewer === "") return { refused: "VIEWER_MISSING", why: "no viewer" };
    const set = [];
    for (const c of index.get(node) ?? []) {
      if (Array.isArray(kinds) && !kinds.includes(c.kind)) continue;
      if (c.seen_by && !c.seen_by.includes(viewer)) continue;
      if (CLASS_OF[c.kind] === "hunch" && c.scope !== scope) continue;
      const v = validity(c, at);
      if (v === "out") continue;
      const { seen_by, ...item } = c;
      set.push(v === "in" ? item : { ...item, undetermined: { why: v.why ?? "undetermined" } });
    }
    if (set.length > BOUNDS.hub && !opt.noHub) return { items: [], hub: { set_size: set.length, why: `more than ${BOUNDS.hub} connections` } };
    const start = typeof page === "number" ? page : 0;
    const items = set.slice(start, start + size);
    const out = start + size < set.length ? { items, next: start + size } : { items };
    if (opt.unread?.[node]) out.unread = opt.unread[node];
    if (opt.truncatedAt?.includes(node)) out.truncated = true;
    return out;
  };
}

/**
 * A registry with each owner registered over the rows given for it.
 * @param {Record<string, any[]>} rowsByOwner @param {{store?: any, opts?: Record<string, any>}} [o]
 */
export function world(rowsByOwner, o = {}) {
  const store = o.store ?? makeStore();
  const registry = createRegistry();
  for (const [owner, kinds] of Object.entries(OWNER_KINDS)) {
    const r = registry.registerOwner({ owner, kinds, neighbours: makeOwner(store, owner, rowsByOwner[owner] ?? [], o.opts?.[owner]) });
    if (!r.ok) throw new Error(`${owner}: ${r.why}`);
  }
  return { registry, store };
}

/** Rows by owner, from a flat list of connections. @param {any[]} conns */
export function byOwner(conns) {
  const out = {};
  for (const c of conns) (out[c.owner] ??= []).push(c);
  return out;
}
