// @ts-check
/* record-grammar: the id grammar (R1, R2). Moved from the check catalogue (`checks/bio-checks.mjs`) at T18 with its
   comments (K585 (4), K589); the catalogue and its re-exports were deleted at T19's close (K855). */

/* PL-12 / D-84 adds BIAS to both alternations. A bias SET is a bundle
   (`BIO_Declared_Bias_v0_1.md`, "Bias bundles and adoption") precisely so it
   inherits append-only history, member-authored transitions, convergent
   promotion, conformance checks and the store — "nothing new is invented for
   governance". A bundle is addressed by an id, so the id pattern is the first
   thing that has to know the type exists; before this, a BIAS- id read as
   malformed and C-2.5 refused the document before any bias rule could run,
   which is the literal sense of D-84's "a bias bundle cannot be written at
   all". Both regexes move together: an annotation on a bias bundle is an
   annotation like any other. */
/* K171 (1) (T8, N129) adds the Action layer's four record types the same way and for the same reason: STD- (a
   standard), CONF- (a conformance determination), CONS- (a consequence part) and ESC- (an escalation) are each
   a record object promoted through `promotion`, and an id the pattern does not know is refused before any rule
   of the type can run. K198 (2) (T8, N159) adds intent's ASP- (an aspiration) and GOAL- (a goal), which intent's
   own step governs from T7 and which `intent`, later in the order, cannot register here itself. */
/* N-A1 (T18, K608) adds PLN-, the Action fold's action plan (`action-plans`' record), on the same terms. The prefix
   set is written once, below, and both patterns and `OBJECT_TYPES`' bundle keys (types.mjs) are held to it, so the three
   cannot carry different sets. */

/* T33-1 (B0.1, S0-1, C:A-6; K1467, K1470; ladders §10 "One id grammar"): ONE ID TABLE, read by every validator of every
   module. Before it, each module that validated an id carried its own `\d{4}-\d{4}` copy, so the counter's fourth digit
   was a ceiling written ten times (`ENT-2026-9999` was the last entity of a year) and a new prefix was a new copy. Now a
   prefix is one row, `{prefix, owner, form}`: `owner` the module whose object the id names and that asks for it to be
   minted (record-core mints both forms from this table, its R1 and R76), `form` `sequential` or `opaque`.
   - SEQUENTIAL: `<PREFIX>-<4-digit year>-<counter>`, the counter four or more digits, no ceiling, so every id valid
     before T33 stays valid and the 10,000th of a year is `…-10000`. The prefixes record-core draws at random (its R6:
     four random digits, then the caller's tail) have this shape too, and are sequential in form.
   - OPAQUE: `<PREFIX>-<4-digit year>-<tail>`, the tail exactly 16 characters of `[a-z0-9]`: under 1e-9 collision over
     a 10-year store at 10^7 ids a year (`measures-T33/assistant-substrate.md` §5). A counted suffix tells its reader
     how many were minted before; a tail tells nothing.
   The census of what was minted or validated at T33's opening is in this module's T33 job record. `MTI CHK MSR HYP DUT
   CALC STQ` are reserved now (P8), so no later tranche needs a record-grammar job to admit them. */
const row = (prefix, owner, form = 'sequential') => Object.freeze({ prefix, owner, form });
export const ID_TABLE = Object.freeze([
  /* R1's bundle prefixes, each with the module whose record it names. */
  row('INFO', 'capture'), row('PROB', 'inquiry'), row('FOCUS', 'inquiry'), row('INQ', 'inquiry'), row('PROJ', 'promotion'),
  row('ACTN', 'actions'), row('BIAS', 'bias'), row('STD', 'standards'), row('CONF', 'conformance'),
  row('CONS', 'consequences'), row('ESC', 'escalation'), row('ASP', 'intent'), row('GOAL', 'intent'),
  row('PLN', 'action-plans'),
  /* Every other prefix a module minted or validated at T33's opening, sequential in form. `ENT` was validated as four
     digits by inquiry-grammar, bias and action-grammar; it is widened here, and they read this table (S0-4 to S0-13). */
  row('ENT', 'entities'), row('REL', 'entities'), row('STDP', 'standards'), row('ACT', 'conformance'),
  row('CMP', 'conformance'), row('FIL', 'filings'), row('CPK', 'filings'), row('THY', 'filings'),
  row('GATH', 'monitoring'), row('THEME', 'connections'), row('LEAD', 'observation-log'), row('TASK', 'tasks'),
  /* Drawn at random by record-core's opaque minter (its R6), four random digits and the caller's tail. */
  row('CASE', 'case-authoring'), row('WCD', 'case-authoring'), row('DRAFT', 'review'), row('RVG', 'review'),
  row('SRC', 'sources'), row('NOTE', 'network-notices'), row('DKT', 'docket'), row('TPL', 'filing-templates'),
  row('TPP', 'filing-templates'), row('TRG', 'filing-templates'), row('WIZ', 'wizard-scripts'),
  row('WZP', 'wizard-scripts'), row('WEG', 'wizard-scripts'),
  /* T33's new objects, rows of their owners' tables (R3): opaque. */
  row('EVT', 'events', 'opaque'), row('LIN', 'lines', 'opaque'), row('MNY', 'money', 'opaque'),
  row('PFA', 'people', 'opaque'), row('IDC', 'people', 'opaque'),
  /* Reserved now (P8), sequential. */
  row('MTI', 'people'), row('CHK', 'people'), row('MSR', 'money'), row('HYP', 'hypotheses'), row('DUT', 'duties'),
  row('CALC', 'calculations'), row('STQ', 'answers'),
]);

const YEAR = '\\d{4}';
const CORE = { sequential: '\\d{4,}', opaque: '[a-z0-9]{16}' };
const FORM = new Map(ID_TABLE.map((e) => [e.prefix, e.form]));
const coreOf = (prefix) => `${prefix}-${YEAR}-${CORE[FORM.get(prefix)]}`;

/** R47: the anchored pattern of an id core of `prefix` in its `ID_TABLE` form, a new `RegExp` on every call (so no
 *  caller's `lastIndex` reaches another's), or `null` for a prefix the table does not hold. Its source is `^<core>$`, so
 *  a validator whose ids carry a slug composes it after the core (`source.slice(1, -1)`), keeping its own slug rule. */
export function idPattern(prefix) {
  return typeof prefix === 'string' && FORM.has(prefix) ? new RegExp(`^${coreOf(prefix)}$`) : null;
}

const HYP_RE = idPattern('HYP');
/** R48: is `v` a hypothesis id? The one test every store-side refusal of a hypothesis reads (K1467, K1487). */
export const isHypothesisId = (v) => typeof v === 'string' && HYP_RE.test(v);

/** Every bundle id prefix, in the order the patterns spell them (R1): the sequential prefixes `ID_TABLE` gives the
 *  bundle records. */
export const ID_PREFIXES = Object.freeze(['INFO', 'PROB', 'FOCUS', 'INQ', 'PROJ', 'ACTN', 'BIAS', 'STD', 'CONF', 'CONS',
  'ESC', 'ASP', 'GOAL', 'PLN']);

/* R1: each prefix's core from `idPattern`, then the bundle's slug. */
const SLUG = '[a-z0-9]+(-[a-z0-9]+)*';
const BUNDLE = `(${ID_PREFIXES.map((p) => idPattern(p).source.slice(1, -1)).join('|')})-${SLUG}`;

export const BUNDLE_ID_RE = new RegExp(`^${BUNDLE}$`);
export const ANN_ID_RE = new RegExp(`^${BUNDLE}\\.ann-\\d{8}T\\d{6}Z-${SLUG}$`);
export const FILENAME_RE = /^[A-Za-z0-9._-]+$/;
export const ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
