// @ts-check
/* connection-grammar: the battery each owner runs in its own job, over its own fixture (R9; B §(b) option (ii)). It
   reads the owner's `neighbours` directly, as `explore` would through the registry, and reports every failure it
   finds, each `{check, why}`. The fixture is metadata over the owner's own data:
     {node, at, kinds?, in, out, undetermined, viewers: {sees, blind}, fenced, expected, scope?, hunch?, hub?: {node, at}}
   each id one of the owner's connections at `node`; `expected` the complete set of ids `sees` gets at `node`/`at`
   within `scope`. An owner may declare what its kinds cannot show (N560): `undated`, they state no `valid`, so the
   fixture names no `in`, `out` or `undetermined`; `group_wide`, it holds no fenced item, so the fixture names no
   `fenced`. A declared check is answered in `inapplicable`, never in `failures`, and the declaration is itself
   checked over the owner's answers, so it cannot hide a dated or a fenced item. */
import { canonicalJson } from '../record-grammar/index.mjs';
import { createRegistry } from './registry.mjs';
import { answerFailures, isRefusal } from './reads.mjs';

/** The most pages the battery follows before it calls the paging unbounded. */
const PAGE_LIMIT = 10000;
const OTHER_SCOPE = 'not-the-fixture-inquiry';
/** What an owner may declare its kinds cannot show (R9, N560). */
const DECLARATIONS = Object.freeze(['undated', 'group_wide']);

const filled = (v) => typeof v === 'string' && v.trim() !== '';
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const sorted = (a) => [...a].sort();
const sameSet = (a, b) => canonicalJson(sorted(a)) === canonicalJson(sorted(b));
const statesDates = (v) => isObj(v) && ((v.from !== null && v.from !== undefined) || (v.to !== null && v.to !== undefined));

/**
 * @param {{owner: string, neighbours: Function, kinds: {kind: string, word: string, class: string}[], fixture: any,
 *   declares?: {undated?: boolean, group_wide?: boolean}}} arg
 * @returns {{ok: boolean, failures: {check: string, why: string}[], inapplicable?: {check: string, why: string}[]}}
 */
export function ownerConformance(arg) {
  const failures = [];
  const inapplicable = [];
  const fail = (check, why) => failures.push({ check, why });
  // The inapplicable checks are stated only when a declaration made one so; else the answer is {ok, failures} (K1733).
  const done = () => ({ ok: failures.length === 0, failures, ...(inapplicable.length ? { inapplicable } : {}) });
  const { owner, neighbours, kinds, fixture: fx, declares } = isObj(arg) ? arg : /** @type {any} */ ({});

  if (declares !== undefined) {
    const stray = isObj(declares) ? Object.keys(declares).find((k) => !DECLARATIONS.includes(k)) : undefined;
    const bad = !isObj(declares) ? 'is not an object'
      : stray !== undefined ? `names ${stray.slice(0, 40)}, which is not one of ${DECLARATIONS.join(', ')}`
      : Object.values(declares).some((v) => v !== undefined && typeof v !== 'boolean') ? 'gives a value that is neither true nor false'
      : null;
    if (bad) { fail('declares', `the declaration {undated?, group_wide?} ${bad}`); return done(); }
  }
  const undated = declares?.undated === true;
  const groupWide = declares?.group_wide === true;
  if (undated) inapplicable.push({ check: 'at', why: `${owner} declares its kinds undated: they state no valid, so no connection is in or out at a date` });
  if (groupWide) inapplicable.push({ check: 'sight', why: `${owner} declares it holds no fenced item, so no item can be shown fenced from one viewer; the missing viewer is still checked` });

  const reg = createRegistry();
  const r = reg.registerOwner({ owner, kinds, neighbours });
  if (!r.ok) { fail('registration', `${r.refused}: ${r.why}`); return done(); }
  if (!isObj(fx) || !filled(fx.node) || fx.at === undefined || !isObj(fx.viewers) || !Array.isArray(fx.expected)) {
    fail('fixture', 'the fixture names {node, at, viewers: {sees, blind}, expected, in, out, undetermined, fenced}');
    return done();
  }
  const ownKinds = kinds.map((k) => k.kind);
  const asked = Array.isArray(fx.kinds) ? fx.kinds : ownKinds;
  const scope = fx.scope ?? null;
  const ctx = (node, sc) => ({ owner, ownKinds, kinds: asked, node, at: fx.at, scope: sc, kindOf: reg.kindOf });

  /** One raw call; a throw is a failure, never the battery's crash. */
  const call = (args) => {
    try { return neighbours(args); } catch (e) { fail('answer', `neighbours threw: ${String(/** @type {any} */ (e)?.message ?? e).slice(0, 200)}`); return null; }
  };

  /** Every page for one viewer and scope, joined; null when a page fails. */
  const collect = (viewer, sc, node = fx.node, at = fx.at, ks = asked) => {
    const items = [];
    let page;
    const pages = new Set();
    for (let i = 0; i < PAGE_LIMIT; i++) {
      const a = call({ node, kinds: ks, at, page, viewer, scope: sc });
      if (a === null) return null;
      if (isRefusal(a)) { fail('answer', `refused ${a.refused} for viewer ${String(viewer)}: ${a.why}`); return null; }
      const f = answerFailures(a, { ...ctx(node, sc), at, kinds: ks });
      if (f.length) { failures.push(...f); return null; }
      items.push(...a.items);
      if (a.next === undefined || a.next === null) return { items, last: a };
      const key = canonicalJson(a.next);
      if (pages.has(key)) { fail('paging', 'next repeats a page already read'); return null; }
      pages.add(key);
      page = a.next;
    }
    fail('paging', `paging did not end within ${PAGE_LIMIT} pages`);
    return null;
  };

  // R7: a missing viewer is refused, never read as an administrator or the public.
  const nobody = call({ node: fx.node, kinds: asked, at: fx.at, viewer: undefined, scope });
  if (!isRefusal(nobody) || nobody.refused !== 'VIEWER_MISSING') fail('sight', 'a read with no viewer is not refused VIEWER_MISSING');

  // Determinism: two identical calls give identical answers.
  const once = () => call({ node: fx.node, kinds: asked, at: fx.at, viewer: fx.viewers.sees, scope });
  const a1 = once(), a2 = once();
  let same = false;
  try { same = canonicalJson(a1) === canonicalJson(a2); } catch { same = false; }
  if (!same) fail('determinism', 'two identical calls gave different answers');

  const sees = collect(fx.viewers.sees, scope);
  if (sees) {
    const ids = sees.items.map((i) => i.id);
    if (new Set(ids).size !== ids.length) fail('paging', 'an item is answered on two pages');
    if (!sameSet(ids, fx.expected)) fail('paging', `the pages joined (${ids.length} items) are not the complete set the fixture expects (${fx.expected.length})`);
    const byId = new Map(sees.items.map((i) => [i.id, i]));
    // R6: the date rule, one connection in, one out, one undetermined; unless the owner declares its kinds undated.
    if (undated) {
      const dated = sees.items.find((i) => statesDates(i.valid));
      if (dated) fail('declares', `${owner} declares its kinds undated, yet ${dated.id} states a valid bound`);
    } else {
      if (!byId.has(fx.in) || byId.get(fx.in).undetermined !== undefined) fail('at', `${fx.in} (in at the date) is not returned unmarked`);
      if (byId.has(fx.out) || !filled(fx.out)) fail('at', `${fx.out} (out at the date) is returned, or the fixture names none`);
      if (!byId.has(fx.undetermined) || !isObj(byId.get(fx.undetermined).undetermined)) fail('at', `${fx.undetermined} (undetermined at the date) is not returned marked undetermined`);
    }
    // R7: the fenced item reaches the viewer who may see it, and nothing of it reaches the one who may not; unless the
    // owner declares it holds no fenced item, when the other viewer gets the complete set. The missing viewer is
    // checked above either way.
    if (groupWide) {
      if (fx.viewers.blind !== undefined) {
        const other = collect(fx.viewers.blind, scope);
        if (other && !sameSet(other.items.map((i) => i.id), fx.expected)) fail('declares', `${owner} declares it holds no fenced item, yet the other viewer's pages are not the complete set`);
      }
    } else {
      if (!byId.has(fx.fenced)) fail('sight', `${fx.fenced} (fenced) is not returned to the viewer who may see it`);
      const blind = collect(fx.viewers.blind, scope);
      if (blind) {
        const bids = blind.items.map((i) => i.id);
        if (bids.includes(fx.fenced)) fail('sight', `${fx.fenced} (fenced) is returned to the viewer who may not see it`);
        if (!sameSet(bids, fx.expected.filter((x) => x !== fx.fenced))) fail('sight', 'the other viewer\'s pages are not the complete set less the fenced item');
      }
    }
  }

  // R6: kinds limited to those asked, each read asking one kind alone.
  for (const k of asked) {
    const got = collect(fx.viewers.sees, scope, fx.node, fx.at, [k]);
    if (got && sees && !sameSet(got.items.map((i) => i.id), sees.items.filter((i) => i.kind === k).map((i) => i.id))) {
      fail('kinds', `asking ${k} alone does not give exactly the ${k} items of the whole set`);
    }
  }

  // R8: a hunch only within the working inquiry that holds it.
  if (kinds.some((k) => k.class === 'hunch')) {
    if (!filled(fx.hunch) || !filled(fx.scope)) fail('scope', 'an owner of hunch kinds names a hunch and its working inquiry in its fixture');
    else {
      if (sees && !sees.items.some((i) => i.id === fx.hunch)) fail('scope', `${fx.hunch} (hunch) is not returned within its inquiry`);
      for (const sc of [null, OTHER_SCOPE]) {
        const got = collect(fx.viewers.sees, sc);
        if (got && got.items.some((i) => reg.kindOf(i.kind)?.class === 'hunch')) fail('scope', `a hunch is returned with scope ${sc}`);
      }
    }
  }

  // R6: a hub is named by its set size, with no items.
  if (fx.hub !== undefined) {
    const h = isObj(fx.hub) ? call({ node: fx.hub.node, kinds: asked, at: fx.hub.at ?? fx.at, viewer: fx.viewers.sees, scope }) : null;
    if (!isObj(h) || isRefusal(h) || !isObj(h.hub)) fail('hub', 'the fixture\'s hub node is not answered as a hub');
    if (isObj(h) && !isRefusal(h)) failures.push(...answerFailures(h, { ...ctx(fx.hub.node, scope), at: fx.hub.at ?? fx.at }));
  }
  return done();
}
