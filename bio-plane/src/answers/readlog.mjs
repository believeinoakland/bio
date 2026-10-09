/* The read log (Suggestions 3; K1450, K1505 (14); J1 (4)): the reads the plane served under one grant, each with its op,
 * its arguments and what it answered (after R2's scrub), and the rule services' answers given under it (R7), each with
 * the `rule_id` a rule item cites. It is held in memory for the grant's life and never written to a table (R14). R4's
 * checks read it: which addresses it answered, the object each address was answered in, and its rule answers. */

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const SEP = "\u0000";

/** Every string leaf of a value, in order. */
function stringsOf(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) stringsOf(x, out);
  else if (plain(v)) for (const x of Object.values(v)) stringsOf(x, out);
  return out;
}

/** The text an object was answered with: its string leaves joined by a separator no quote holds, so a quote is a
 *  byte-exact substring of one field, never a seam between two. */
export const textOf = (v) => stringsOf(v).join(SEP);

export class ReadLog {
  constructor({ grant = null, viewer = null, at = null, use = "ask" } = {}) {
    this.grant = grant;
    this.use = use;   /* R30: the grant's use (`ask`, `draft`, `standing`), whose kept-away projects its reads drop */
    this.viewer = viewer;
    this.opened = at;
    this.entries = [];
    this.rules = new Map();
    this.index = new Map();
  }

  get empty() { return this.entries.length === 0 && this.rules.size === 0; }

  #indexObject(node) {
    if (Array.isArray(node)) { for (const x of node) this.#indexObject(x); return; }
    if (!plain(node)) return;
    for (const v of Object.values(node)) {
      const vals = typeof v === "string" ? [v] : Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
      for (const s of vals) {
        if (!s.trim()) continue;
        if (!this.index.has(s)) this.index.set(s, []);
        const list = this.index.get(s);
        if (!list.includes(node)) list.push(node);
      }
      if (plain(v) || Array.isArray(v)) this.#indexObject(v);
    }
  }

  /** A read served under the grant, recorded as answered. */
  add(op, args, answer, at = null) {
    const entry = { seq: this.entries.length + 1, op, args: args ?? null, answer, at };
    this.entries.push(entry);
    this.#indexObject(answer);
    return entry;
  }

  /** R7: a rule service's answer, recorded under the next `rule_id`. */
  addRule(answer, at = null) {
    const rule_id = `rule:${this.rules.size + 1}`;
    const held = { ...answer, rule_id };
    this.rules.set(rule_id, held);
    this.add("rule", { service: answer.service ?? null }, held, at);
    return held;
  }

  rule(id) { return this.rules.get(id) || null; }

  /** The objects the log answered `address` in (every object holding it as one of its own values). */
  objectsAt(address) { return typeof address === "string" ? this.index.get(address) || [] : []; }

  answered(address) { return this.objectsAt(address).length > 0; }
}
