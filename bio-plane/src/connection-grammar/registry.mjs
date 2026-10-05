// @ts-check
/* connection-grammar: the owner registry (R2–R5, B §(b) option (ii)). Every owner of a kind of relationship, at any
   layer, registers its kinds with the members' words and its `neighbours` read, so `explore` walks one registry. The
   registry is in memory and holds no relationship (R16); its `neighbours` passes one read to one owner and judges the
   answer, and walks nothing. */
import { CLASSES, connectionErrors } from './shape.mjs';
import { answerFailures, isRefusal } from './reads.mjs';

/** Words no kind may carry: none offers a measure of how connected a node is, or suspicion (R3, R17; K1486). */
export const FORBIDDEN_WORDS = Object.freeze(['knows', 'network', 'conflict', 'suspicious', 'most connected', 'centrality', 'score']);

const filled = (v) => typeof v === 'string' && v.trim() !== '';
const refuse = (refused, why) => ({ refused, why });

/** A fresh registry: registering in one never changes another (R5). */
export function createRegistry() {
  /** @type {Map<string, {owner: string, kinds: {kind: string, word: string, class: string}[], neighbours: Function}>} */
  const byOwner = new Map();
  /** @type {Map<string, {owner: string, word: string, class: string}>} */
  const byKind = new Map();

  /** @param {string} kind */
  const kindOf = (kind) => {
    const e = typeof kind === 'string' ? byKind.get(kind) : undefined;
    return e ? { owner: e.owner, word: e.word, class: e.class } : null;
  };

  /**
   * Registers an owner once, or refuses with nothing registered (R2, R3).
   * @param {{owner: string, kinds: {kind: string, word: string, class: string}[], neighbours: Function}} arg
   */
  function registerOwner(arg) {
    const { owner, kinds, neighbours } = arg !== null && typeof arg === 'object' ? arg : /** @type {any} */ ({});
    if (!filled(owner)) return refuse('OWNER_MISSING', 'an owner is named by a non-empty string');
    if (byOwner.has(owner)) return refuse('OWNER_DUPLICATE', `${owner} is already registered`);
    if (typeof neighbours !== 'function') return refuse('NEIGHBOURS_MISSING', `${owner} registers no neighbours read`);
    if (!Array.isArray(kinds) || kinds.length === 0) return refuse('KINDS_MISSING', `${owner} registers no kind`);
    const mine = new Set();
    for (const k of kinds) {
      if (k === null || typeof k !== 'object' || !filled(k.kind)) return refuse('KIND_MISSING', `a kind of ${owner} is not named`);
      const held = byKind.get(k.kind);
      if (held) return refuse('KIND_TAKEN', `kind ${k.kind} is held by ${held.owner}`);
      if (mine.has(k.kind)) return refuse('KIND_TAKEN', `kind ${k.kind} is listed twice by ${owner}`);
      mine.add(k.kind);
      if (!CLASSES.includes(k.class)) return refuse('CLASS_UNKNOWN', `kind ${k.kind}'s class ${String(k.class).slice(0, 40)} is not one of ${CLASSES.join(', ')}`);
      if (!filled(k.word)) return refuse('WORD_MISSING', `kind ${k.kind} has no members' word`);
      const lower = k.word.toLowerCase();
      const bad = FORBIDDEN_WORDS.find((w) => lower.includes(w));
      if (bad) return refuse('WORD_FORBIDDEN', `kind ${k.kind}'s word "${k.word}" says "${bad}", which no kind's word may say`);
    }
    const entry = { owner, kinds: kinds.map((k) => Object.freeze({ kind: k.kind, word: k.word, class: k.class })), neighbours };
    byOwner.set(owner, entry);
    for (const k of entry.kinds) byKind.set(k.kind, { owner, word: k.word, class: k.class });
    return { ok: true, owner };
  }

  /** Every registered owner and its kinds, in registration order (R4). */
  const owners = () => [...byOwner.values()].map((e) => ({ owner: e.owner, kinds: e.kinds.map((k) => ({ ...k })) }));

  /**
   * Checks one connection against the shape and this registry (R1). Never throws.
   * @param {unknown} c
   */
  function checkConnection(c) {
    let errors;
    try { errors = connectionErrors(c, kindOf); } catch (e) { errors = [{ field: 'connection', why: `unreadable: ${String(/** @type {any} */ (e)?.message ?? e)}` }]; }
    return errors.length ? { ok: false, errors } : { ok: true };
  }

  /**
   * One owner's read, its arguments passed unchanged, its answer judged at the interface (R6–R8). A missing viewer
   * is refused before any owner is called; an answer that breaks the contract is refused whole, never trimmed.
   * @param {{owner: string, node: string, kinds?: string[], at: unknown, page?: unknown, viewer: unknown, scope: unknown}} arg
   */
  function neighbours(arg) {
    const a = arg !== null && typeof arg === 'object' ? arg : /** @type {any} */ ({});
    if (a.viewer === undefined || a.viewer === null || a.viewer === '') {
      return refuse('VIEWER_MISSING', 'a read names the member reading; an absent viewer is neither an administrator nor the public');
    }
    const e = byOwner.get(a.owner);
    if (!e) return refuse('OWNER_UNKNOWN', `${String(a.owner).slice(0, 60)} is not a registered owner`);
    const { owner: _o, ...args } = a;
    let answer;
    try { answer = e.neighbours(args); } catch (err) {
      return refuse('OWNER_FAILED', `${e.owner}'s read threw: ${String(/** @type {any} */ (err)?.message ?? err).slice(0, 200)}`);
    }
    if (isRefusal(answer)) return answer;
    const failures = answerFailures(answer, { owner: e.owner, ownKinds: e.kinds.map((k) => k.kind), kinds: a.kinds,
      node: a.node, at: a.at, scope: a.scope, kindOf });
    if (failures.length) {
      return { refused: 'OWNER_NONCONFORMING', why: `${e.owner}'s answer breaks the neighbours contract: ${failures[0].check}: ${failures[0].why}`, failures };
    }
    return answer;
  }

  return Object.freeze({ registerOwner, owners, kindOf, checkConnection, neighbours });
}
