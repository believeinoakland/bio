/* strength's independence (requirements: `build/requirements/strength.md`, R12, R27; D-195, INT C-18, K1470): THE ONE
 * IMPLEMENTATION of whether the parts of a reading share an upstream origin, for the pair over a version, a partition
 * and a candidate alike.
 *
 * Each leg's target gives a set of ORIGIN KEYS: its document, its captures and their captured addresses (`provenance`'s
 * `register` and `captured_locators`, its R48), and since T33 the events its captures attest (`events` R37), the persons
 * taking part in them folded to their identity cluster (`people` R5), the offices or bodies that issued it, the declared
 * tables behind a calculation's inputs and the money facts it reads (`calculations` R9, `money`), and a calculation's,
 * a standard's, a duty's or an occurrence's own id. Two parts sharing a key share that origin. Two parts are tied as well
 * by LINES on the documents' dates (`lines` R10): issuers `part_of` one body, or an `acts_for` line between them; and by an
 * event of one `within` an event of the other (`events`). A tie whose line or event is undetermined on those dates is
 * named `undetermined:…`, never counted as independence.
 *
 * Every read asks one past `ORIGIN_LIMIT`, and reaching it makes the answer incomplete, never clean: a missed origin
 * would be a silent pass on the side that overstates the finding. Nothing here writes. */

import { legKind, parseOccurrenceRef } from "./legs.mjs";

/** R12: the origins read per step of the walk; reaching it makes the answer incomplete, never clean. */
export const ORIGIN_LIMIT = 200;
/** R12: the shared origins named per pair of parts. */
export const SHARED_NAMED_MAX = 5;
/** The stamp the record's own reads go out under: the pair is a record fact, withheld afterwards (R6). */
export const RECORD_READER = "class:daemon";

/* R12 (K1470, J1 (1)): the event kinds whose takers-part issue a document, and the entity kinds that issue. */
const ISSUING_EVENTS = new Set(["issuance", "publication"]);
const ISSUER_KINDS = new Set(["office", "body"]);

const safe = (fn, fallback = null) => { try { const v = fn(); return v === undefined ? fallback : v; } catch { return fallback; } };
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** The reader the walk hands in: `rows(sql, …args)` over the store, and the upstream services, each possibly null:
 *  `events` (`readEvent`), `lines` (`structureAt`, `linesOf`), `people` (`identityOf`), `money` (`readFact`) and
 *  `calcFacts(id)` (`calculations` R9's grade facts, `{found, inputs}`). */
export function originsReader(r) {
  const memo = new Map();
  const once = (key, fn) => { if (!memo.has(key)) memo.set(key, fn()); return memo.get(key); };
  let complete = true;
  const cut = (rows) => { if (rows.length > ORIGIN_LIMIT) complete = false; return rows.slice(0, ORIGIN_LIMIT); };
  const rows = (q, ...a) => safe(() => r.rows(q, ...a), []);

  const event = (id) => once(`event:${id}`, () => {
    const got = r.events ? safe(() => r.events.readEvent({ eventId: id, viewer: RECORD_READER })) : null;
    return got && got.found && got.event ? got.event : null;
  });
  const entityKind = (id) => once(`kind:${id}`, () => {
    const row = rows(`SELECT kind FROM entities WHERE entity_id=?`, id)[0];
    return row ? row.kind : null;
  });
  const clusterKey = (id) => once(`cluster:${id}`, () => {
    const c = r.people ? safe(() => r.people.identityOf({ entityId: id, viewer: RECORD_READER })) : null;
    if (!c || !c.found || c.state !== "linked" || !Array.isArray(c.members) || !c.members.length) return id;
    const ids = c.members.map((m) => (typeof m === "string" ? m : m && m.entity_id)).filter(Boolean).sort();
    return ids[0] ?? id;
  });
  /* The date an event happened, as one value a line is judged at, or null (placed nowhere, or a stale cache). */
  const whenOf = (ev) => {
    const w = ev && ev.when;
    if (!w || w === "undetermined") return null;
    if (typeof w === "string") return w;
    return str(w.start) ?? str(w.value) ?? null;
  };

  /* A bundle's own provenance: the document, its captures, their addresses (the three R30 and R34 read). */
  const provenance = (id, set) => {
    set.add(`bundle:${id}`);
    const caps = cut(rows(`SELECT capture_sha FROM register WHERE bundle_id=? LIMIT ?`, id, ORIGIN_LIMIT + 1));
    for (const c of caps) {
      set.add(`capture:${c.capture_sha}`);
      for (const l of cut(rows(`SELECT DISTINCT address_norm FROM captured_locators WHERE capture_sha=? ORDER BY address_norm LIMIT ?`,
                               c.capture_sha, ORIGIN_LIMIT + 1))) set.add(`address:${l.address_norm}`);
    }
    return caps.map((c) => c.capture_sha);
  };

  /* One event's contribution: its key, the persons taking part, its issuers, its date. */
  const fromEvent = (id, o) => {
    if (o.events.has(id)) return;
    const ev = event(id);
    o.events.set(id, ev);
    o.set.add(`event:${id}`);
    if (!ev) return;
    const at = whenOf(ev);
    if (at) o.dates.add(at);
    for (const p of cut(Array.isArray(ev.participants) ? ev.participants.filter((p) => !p.superseded) : [])) {
      if (!p.entity_id || p.role === "subject") continue;
      const kind = entityKind(p.entity_id);
      if (kind === "person") o.set.add(`person:${clusterKey(p.entity_id)}`);
      if (ISSUING_EVENTS.has(ev.kind) && ISSUER_KINDS.has(kind)) { o.issuers.add(p.entity_id); o.set.add(`issuer:${p.entity_id}`); }
    }
  };

  /* A declared table behind a money fact (`money` R19's source), as an origin. */
  const fromMoney = (factId, o) => {
    const f = r.money ? safe(() => r.money.readFact({ factId, viewer: RECORD_READER })) : null;
    const fact = f && f.found !== false ? (f.fact || f) : null;
    const src = fact && fact.source;
    const table = src && typeof src === "object" ? str(src.table) ?? (src.table && str(src.table.sha)) : null;
    if (table) o.set.add(`table:${table}`);
    else if (fact && str(fact.source_capture_sha)) o.set.add(`capture:${fact.source_capture_sha}`);
  };

  /** The origins of one leg's target: `{set, issuers, events, dates}`. */
  const ofTarget = (id) => once(`target:${id}`, () => {
    const o = { set: new Set(), issuers: new Set(), events: new Map(), dates: new Set() };
    if (!id) return o;
    const kind = legKind({ target_id: id });
    if (kind === "occurrence") {
      const ref = parseOccurrenceRef(id);
      o.set.add(`occurrence:${id}`);
      o.set.add(`duty:${ref.duty}`);
      return o;
    }
    if (kind === "calculation") {
      o.set.add(`calc:${id}`);
      const f = r.calcFacts ? safe(() => r.calcFacts(id)) : null;
      for (const inp of cut(f && Array.isArray(f.inputs) ? f.inputs : [])) {
        if (!inp) continue;
        if (inp.kind === "table" && str(inp.ref)) o.set.add(`table:${inp.ref}`);
        if (inp.kind === "money") for (const m of Array.isArray(inp.ref) ? inp.ref : [inp.ref]) if (str(m)) fromMoney(m, o);
        if (inp.kind === "calculation" && str(inp.ref)) o.set.add(`calc:${inp.ref}`);
      }
      return o;
    }
    if (kind === "standard") { o.set.add(`standard:${id}`); return o; }
    const caps = provenance(id, o.set);
    for (const sha of caps)
      for (const e of cut(rows(`SELECT DISTINCT event_id FROM event_attestations WHERE capture_sha=? ORDER BY event_id LIMIT ?`,
                               sha, ORIGIN_LIMIT + 1))) fromEvent(e.event_id, o);
    return o;
  });

  /* The `part_of` and `acts_for` lines of an entity held at a date, and those undetermined there (`lines` R10). */
  const structure = (entity, at) => once(`structure:${entity}@${at}`, () => {
    const s = r.lines ? safe(() => r.lines.structureAt({ entity, at, kinds: ["part_of", "acts_for"], viewer: RECORD_READER })) : null;
    if (!s || s.ok === false) return { held: [], undetermined: [] };
    if (s.truncated) complete = false;
    const line = (l) => ({ id: l.line_id, kind: l.kind, from: l.from ?? l.from_entity, to: l.to ?? l.to_entity });
    return { held: (s.held || []).map(line), undetermined: (s.undetermined || []).map((u) => line(u.line || u)) };
  });
  /* Whether an entity has any `part_of` or `acts_for` line at all, for a document with no date. */
  const anyStructure = (entity) => once(`any:${entity}`, () => {
    const l = r.lines && typeof r.lines.linesOf === "function"
      ? safe(() => r.lines.linesOf({ entity, kinds: ["part_of", "acts_for"], limit: 1, viewer: RECORD_READER })) : null;
    return !!(l && Array.isArray(l.lines ?? l.items) && (l.lines ?? l.items).length);
  });

  /** The ties two parts' issuers and events make, as named origin strings (J1 (4)). */
  const ties = (A, B) => {
    const out = [];
    const dates = [...new Set([...A.dates, ...B.dates])].sort();
    for (const i of A.issuers) for (const j of B.issuers) {
      if (i === j) continue;
      if (!dates.length) {
        if (anyStructure(i) || anyStructure(j))
          out.push(`undetermined:issuer:${i}|${j} (no date settles the lines between them)`);
        continue;
      }
      for (const at of dates) {
        const si = structure(i, at), sj = structure(j, at);
        const up = (s, e, held) => (held ? s.held : s.undetermined).filter((l) => l.kind === "part_of" && l.from === e);
        /* One body both are part of, or one part of the other. */
        const bodies = (s, e) => new Map([[e, { lines: [], open: false }],
          ...up(s, e, true).map((l) => [l.to, { lines: [l.id], open: false }]),
          ...up(s, e, false).map((l) => [l.to, { lines: [l.id], open: true }])]);
        const bi = bodies(si, i), bj = bodies(sj, j);
        for (const [body, x] of bi) {
          const y = bj.get(body);
          if (!y || (!x.lines.length && !y.lines.length)) continue;
          const via = [...x.lines, ...y.lines].join(", ");
          out.push(`${x.open || y.open ? "undetermined:" : ""}issuer:${body} part_of ${via}`);
        }
        const between = (s, held) => (held ? s.held : s.undetermined)
          .filter((l) => l.kind === "acts_for" && ((l.from === i && l.to === j) || (l.from === j && l.to === i)));
        for (const l of between(si, true)) out.push(`acts_for:${l.id}`);
        for (const l of between(si, false)) out.push(`undetermined:acts_for:${l.id}`);
      }
    }
    for (const [e, ev] of A.events) for (const [f, fv] of B.events) {
      const inside = (x, y, xv) => xv && Array.isArray(xv.within) && xv.within.includes(y);
      const which = inside(e, f, ev) ? e : inside(f, e, fv) ? f : null;
      if (!which) continue;
      out.push(`${whenOf(ev) && whenOf(fv) ? "" : "undetermined:"}within:${which}`);
    }
    return [...new Set(out)];
  };

  /** R12: `{checked, parts, shared, complete, limit}` over legs grouped by their `ground` into `parts` parts. */
  function independenceOf(legs, parts) {
    const checked = parts > 1;
    const shared = [];
    if (checked) {
      const byPart = new Map();
      for (const l of legs) {
        const g = str(l.ground);
        if (!g) continue;
        if (!byPart.has(g)) byPart.set(g, { set: new Set(), issuers: new Set(), events: new Map(), dates: new Set() });
        const p = byPart.get(g), o = ofTarget(l.target_id);
        for (const k of o.set) p.set.add(k);
        for (const k of o.issuers) p.issuers.add(k);
        for (const [k, v] of o.events) p.events.set(k, v);
        for (const k of o.dates) p.dates.add(k);
      }
      const list = [...byPart];
      for (let x = 0; x < list.length; x++)
        for (let y = x + 1; y < list.length; y++) {
          const [a, A] = list[x], [b, B] = list[y];
          const common = [...[...A.set].filter((k) => B.set.has(k)), ...ties(A, B)];
          if (common.length) shared.push({ a, b, through: common.slice(0, SHARED_NAMED_MAX) });
        }
    }
    return { checked, parts, shared, complete: checked ? complete : null, limit: ORIGIN_LIMIT };
  }

  /** R30, R34: a target's own provenance only (the same document, capture or address), `{set, complete}`. */
  function provenanceOf(ids) {
    const before = complete;
    complete = true;
    const set = new Set();
    for (const id of ids) provenance(id, set);
    const out = { set, complete };
    complete = before && complete;
    return out;
  }

  return { independenceOf, provenanceOf };
}
