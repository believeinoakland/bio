/* calc-grammar's tables, as `evaluate` holds them (requirements: `build/requirements/calc-grammar.md`, R7–R14, R22).
 * A table is bound either as row objects (`{fields, rows: [ {name: cell} ]}`) or streamed (`{fields, rows}`, `rows`
 * a function answering a new iterator over arrays of cells in `fields` order). Every step reads its tables through
 * one interface: `size`, `scan()` (an iterator over the rows), `pick(indices)` (the rows at those indices, in that
 * order) and `reader(name)` (a row's cell of a field). A table derived from row objects is held as row objects, as
 * the caller already holds them. A table derived from a streamed one is a view over its source: the indices it
 * keeps, the order it puts them in, or the pairs it joins, with computed cells computed again on each pass. So a
 * step holds only what it keeps, never the source's cells, and a streamed table is read again, pass by pass. */

/* The rows a stream pass reads ahead when a view asks for rows out of order: a pass reads the source once and keeps
   at most this many of its rows. */
export const PICK_CHUNK = 16384;

/** A step's stop: a refusal by name, caught by `evaluate`. */
export class Refused { constructor(r) { this.r = r; } }
export const stop = (code, why, step) => { throw new Refused({ refused: code, why, step }); };

function readers(fields) {
  const at = new Map(fields.map((f, k) => [f.name, k]));
  return (name) => { const k = at.get(name); return (row) => row[k]; };
}
const keyReader = (name) => (row) => row[name];

/** A table held as row objects: the caller's, or one derived from it. */
export function objectTable(fields, list) {
  return { fields, streamed: false, size: list.length, list, reader: keyReader,
    scan: () => list[Symbol.iterator](), pick: (idx) => idx.map((i) => list[i])[Symbol.iterator](),
    asArray: (row) => fields.map((f) => row[f.name]) };
}

/** A table held as arrays: a group's results over a streamed table. */
export function heldTable(fields, list) {
  return { fields, streamed: true, size: list.length, reader: readers(fields), scan: () => list[Symbol.iterator](),
    pick: (idx) => idx.map((i) => list[i])[Symbol.iterator](), asArray: (row) => row };
}

function iteratorOf(x) {
  if (x !== null && typeof x === "object" && typeof x.next === "function") return x;
  if (x != null && typeof x[Symbol.iterator] === "function") return x[Symbol.iterator]();
  return null;
}

/** Why a streamed table cannot be read, or `{size}`: one pass over it, checking every row's shape. */
export function streamFault(input, name) {
  const it = (() => { try { return iteratorOf(input.rows()); } catch (e) { return e; } })();
  if (it instanceof Error) return { why: `the input "${name}": its rows could not be read: ${it.message}` };
  if (!it) return { why: `the input "${name}": a streamed table's rows answers an iterator` };
  const width = input.fields.length;
  let size = 0;
  try {
    for (let s = it.next(); !s.done; s = it.next()) {
      if (!Array.isArray(s.value) || s.value.length !== width)
        return { why: `the input "${name}": row ${size} is not an array of its ${width} cells in fields order` };
      size += 1;
    }
  } catch (e) { return { why: `the input "${name}": its rows could not be read: ${e.message}` }; }
  return { size };
}

/** A streamed input: read again on each pass; a pass that fails, or reads another table, is refused. */
export function streamTable(fields, input, size, name) {
  const width = fields.length;
  const bad = (why) => stop("INPUT_INVALID", `the input "${name}": ${why}`, null);
  function* scan() {
    let it;
    try { it = iteratorOf(input.rows()); } catch (e) { bad(`its rows could not be read again: ${e.message}`); }
    if (!it) bad("its rows answered no iterator on a later pass");
    let n = 0; let done = false;
    try {
      for (;;) {
        let s;
        try { s = it.next(); } catch (e) { bad(`its rows could not be read again: ${e.message}`); }
        if (s.done) break;
        if (!Array.isArray(s.value) || s.value.length !== width) bad(`row ${n} is not an array of its ${width} cells in fields order`);
        n += 1;
        yield s.value;
      }
      done = true;
    } finally {
      if (!done && typeof it.return === "function") it.return();
    }
    if (n !== size) bad(`it answered ${size} rows on its first pass and ${n} on a later one`);
  }
  return { fields, streamed: true, size, reader: readers(fields), scan, pick: (idx) => pickByPass(scan, idx),
    asArray: (row) => row };
}

/* The rows at `idx` (any order, repeats allowed) from a table read only forward: one pass per chunk of indices. */
function* pickByPass(scan, idx) {
  for (let c = 0; c < idx.length; c += PICK_CHUNK) {
    const part = idx.slice(c, c + PICK_CHUNK);
    const want = new Map();
    let max = -1;
    part.forEach((i, k) => {
      const slots = want.get(i);
      if (slots) slots.push(k); else want.set(i, [k]);
      if (i > max) max = i;
    });
    const buf = new Array(part.length);
    let i = 0;
    for (const row of scan()) {
      const slots = want.get(i);
      if (slots) for (const k of slots) buf[k] = row;
      if (++i > max) break;
    }
    yield* buf;
  }
}

/** The rows of `parent` at the ascending indices `keep` (a select over a streamed table). */
export function filterView(parent, keep) {
  function* scan() {
    if (!keep.length) return;
    let p = 0; let i = 0;
    for (const row of parent.scan()) {
      if (i === keep[p]) { yield row; if (++p === keep.length) return; }
      i += 1;
    }
  }
  return { fields: parent.fields, streamed: true, size: keep.length, reader: parent.reader, scan, asArray: parent.asArray,
    pick: (idx) => parent.pick(idx.map((k) => keep[k])) };
}

/** The rows of `parent` in the order `perm` (a sort over a streamed table). */
export function orderView(parent, perm) {
  return { fields: parent.fields, streamed: true, size: perm.length, reader: parent.reader, asArray: parent.asArray,
    scan: () => parent.pick(perm), pick: (idx) => parent.pick(idx.map((k) => perm[k])) };
}

/** Each row of `parent` with one cell computed from it, again on each pass (a span over a streamed table). */
export function extendView(parent, field, cellOf) {
  const fields = [...parent.fields, field];
  const extend = (row) => [...parent.asArray(row), cellOf(row)];
  function* each(rows) { for (const row of rows) yield extend(row); }
  return { fields, streamed: true, size: parent.size, reader: readers(fields), asArray: (row) => row,
    scan: () => each(parent.scan()), pick: (idx) => each(parent.pick(idx)) };
}

/** The pairs `(li[k], rj[k])` of a join, ascending in `li`, as rows: the left row's cells, then the right's. */
export function joinView(L, R, fields, li, rj) {
  const merge = (l, r) => [...L.asArray(l), ...R.asArray(r)];
  function* scan() {
    if (!li.length) return;
    const right = R.pick(rj);
    let p = 0; let i = 0;
    for (const lrow of L.scan()) {
      while (p < li.length && li[p] === i) { yield merge(lrow, right.next().value); p += 1; }
      if (p === li.length) return;
      i += 1;
    }
  }
  function* pick(idx) {
    const left = L.pick(idx.map((k) => li[k])); const right = R.pick(idx.map((k) => rj[k]));
    for (let k = 0; k < idx.length; k++) yield merge(left.next().value, right.next().value);
  }
  return { fields, streamed: true, size: li.length, reader: readers(fields), scan, pick, asArray: (row) => row };
}

/** A table as `evaluate` answers it: row objects as the caller bound them, or a streamed table it reads again. */
export function answerOf(t) {
  if (!t.streamed) return { fields: t.fields, rows: t.list };
  return { fields: t.fields, rows: function* rows() {
    try { yield* t.scan(); } catch (e) { if (e instanceof Refused) throw new Error(e.r.why); throw e; }
  } };
}
