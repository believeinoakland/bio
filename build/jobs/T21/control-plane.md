# control-plane (T21)

**Status** · session_01Gmuq4U2PQihnDRrGeAzmtS · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

Q1 (R44, R17/R29 for K921's ops). My door stamps from op-declarations' act lists, and OPDECL's job has not pushed its R8 yet, so I need to know which lists the new ops join. My best reading, which I am building on now:
(a) the eight gated acts (`templatedraft`, `templaterevise`, `templatesubmit`, `templatereviewgrant`, `templategrantrevoke`, `templateapprove`, `templateretire`) and `templatepropose` join `QUERY_AUTHOR_ACTIONS` (so `ACTION_LAYER_ACTIONS`: `viewer` and query `author` stamped by the layer's expression, positional identity / `class:<cls>` / `class:ai/<tokenId>`), which is what filing-templates' ops map reads (`author`, also as `by` and `proposer`); `templates`, `factstatus`, `factsdue` join `ACTION_LAYER_READS` (viewer).
(b) `factconfirm`: local-facts' ops map reads `by` from the BODY (`{...b, viewer}`), so a caller's own `by` would reach it. My door stamps the body `by` itself (`inboxresolve`'s precedent), by the positional expression (`member:<id>`, the form local-facts' tests use), and needs only `viewer` from op-declarations (ACTION_LAYER_ACTIONS or any viewer list). If you would rather local-facts read `by` from the query, that is local-facts' change; I report it either way.
(c) `templatereviewgrant`: the door mints the secret with admission's `reviewGrantSecret` and stamps `secretSha`, as `reviewgrant`, by op name in my door.
(d) the four grant doors (`classes: null`): handled wholly in my door (secret → `bySecret`, `secretSha`; else `admit` held to a session; else NO_TEMPLATE_GRANT at 404), stamping `author` (identity) and `viewer` for the session path.
If OPDECL names different lists (or exports its own list for the template acts), tell me and I re-point. Until OPDECL's merge my R44 tests are red by name (UNKNOWN_OP), as the START says.

## Progress (CONTROL-PLANE #12)

Built on B2's adopted readings and B3's list names (OP-DECLARATIONS #3's, not yet merged). This branch imports `TEMPLATE_PROPOSAL_ACTIONS`, `LOCAL_FACTS_ACTIONS`, `TEMPLATE_DOOR_ACTIONS` and `TEMPLATE_DOOR_READS` from `op-declarations`, so until its merge reaches `tranche/T21` and I merge it, the module does not load on this branch; tested meanwhile against a local, uncommitted simulation of op-declarations R8 with B3's names (101/101). Next: on B's CHANGE at op-declarations' merge, merge `tranche/T21`, re-run steps 5–7, post COMPLETE.

## J2 · REPORT

R1. Work so far is pushed (961898a965), built to B3's names; it waits on OP-DECLARATIONS #3's merge (the module imports B3's lists, so it does not load on my branch until I merge `tranche/T21`). Under a local, uncommitted simulation of op-declarations R8 with B3's names: test/m/control-plane 101/101; format 0, architecture 0, coverage 28/28, ownership 0.
(1) Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, `bundler`'s `npm run build` in `bio-plane/`): my change touches `bio-plane/src/control-plane/`. Regenerated nothing.
(2) R43's snapshot (`rows-before-r43.json`) needed more than K952's C-53.13 re-pin: K921/K992 re-worded filings' C-115.12, .33, .34, .39, .40, re-keyed C-115.31 (`MACHINE_CANNOT_SAVE_TEMPLATE` → `MACHINE_CANNOT_DRAFT_TEMPLATE`) and C-115.36 (`TEMPLATE_KIND_TIER3` → `TEMPLATE_TIER3_FILE`), and retired `KIND_NO_TEMPLATE` (C-115.6) and `NOT_TIER3` (C-115.17). I re-pinned each to its owner's row and the test now names the change set (`changed`: retired codes have no row and their numbers are reused by none; re-keyed codes keep their numbers under the successor; the published fence list follows the re-key). My decision (technical, P17): a snapshot of rows tracks Bob-approved row changes by name rather than holding the old words.
(3) For filing-templates (no action needed from me): its ops map reads `templatepropose`'s proposer from the query's `author`, while op-declarations names the stamp `proposer` (B3). My door sets both keys to the proposal label (`actionlawspropose`'s expression), so it works either way; if filing-templates ever reads `proposer`, `author` can go.
(4) K982: my R20 states the review copy's in-band `date` only, not its hash. I added a test anyway (`converts.test.mjs`, "R20 (K982; public-read R7)"): the served `inband` equals `inbandQuartet` over the answer without `inband`; BOB words R20 if wanted.
(5) `stamps-action.test.mjs` no longer asserts `FILINGS_READS.includes("templates")` (it moves to `FILING_TEMPLATES_READS`, B3).
