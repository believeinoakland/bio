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
   set is written once, below, and both patterns and `OBJECT_TYPES` (types.mjs) are held to it, so the three cannot
   carry different sets. */

/** Every bundle id prefix, in the order the patterns spell them (R1). */
export const ID_PREFIXES = Object.freeze(['INFO', 'PROB', 'FOCUS', 'INQ', 'PROJ', 'ACTN', 'BIAS', 'STD', 'CONF', 'CONS',
  'ESC', 'ASP', 'GOAL', 'PLN']);

const PREFIX = `(${ID_PREFIXES.join('|')})`;
const SLUG = '[a-z0-9]+(-[a-z0-9]+)*';
const BUNDLE = `${PREFIX}-\\d{4}-\\d{4}-${SLUG}`;

export const BUNDLE_ID_RE = new RegExp(`^${BUNDLE}$`);
export const ANN_ID_RE = new RegExp(`^${BUNDLE}\\.ann-\\d{8}T\\d{6}Z-${SLUG}$`);
export const FILENAME_RE = /^[A-Za-z0-9._-]+$/;
export const ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
