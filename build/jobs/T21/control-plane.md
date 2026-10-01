# control-plane (T21)

**Status** · session_01Gmuq4U2PQihnDRrGeAzmtS · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 (R44, R17/R29 for K921's ops). My door stamps from op-declarations' act lists, and OPDECL's job has not pushed its R8 yet, so I need to know which lists the new ops join. My best reading, which I am building on now:
(a) the eight gated acts (`templatedraft`, `templaterevise`, `templatesubmit`, `templatereviewgrant`, `templategrantrevoke`, `templateapprove`, `templateretire`) and `templatepropose` join `QUERY_AUTHOR_ACTIONS` (so `ACTION_LAYER_ACTIONS`: `viewer` and query `author` stamped by the layer's expression, positional identity / `class:<cls>` / `class:ai/<tokenId>`), which is what filing-templates' ops map reads (`author`, also as `by` and `proposer`); `templates`, `factstatus`, `factsdue` join `ACTION_LAYER_READS` (viewer).
(b) `factconfirm`: local-facts' ops map reads `by` from the BODY (`{...b, viewer}`), so a caller's own `by` would reach it. My door stamps the body `by` itself (`inboxresolve`'s precedent), by the positional expression (`member:<id>`, the form local-facts' tests use), and needs only `viewer` from op-declarations (ACTION_LAYER_ACTIONS or any viewer list). If you would rather local-facts read `by` from the query, that is local-facts' change; I report it either way.
(c) `templatereviewgrant`: the door mints the secret with admission's `reviewGrantSecret` and stamps `secretSha`, as `reviewgrant`, by op name in my door.
(d) the four grant doors (`classes: null`): handled wholly in my door (secret → `bySecret`, `secretSha`; else `admit` held to a session; else NO_TEMPLATE_GRANT at 404), stamping `author` (identity) and `viewer` for the session path.
If OPDECL names different lists (or exports its own list for the template acts), tell me and I re-point. Until OPDECL's merge my R44 tests are red by name (UNKNOWN_OP), as the START says.

## Progress (CONTROL-PLANE #12)

Built on B2's adopted readings and B3's list names (OP-DECLARATIONS #3's, not yet merged). This branch imports `TEMPLATE_PROPOSAL_ACTIONS`, `LOCAL_FACTS_ACTIONS`, `TEMPLATE_DOOR_ACTIONS` and `TEMPLATE_DOOR_READS` from `op-declarations`, so until its merge reaches `tranche/T21` and I merge it, the module does not load on this branch; tested meanwhile against a local, uncommitted simulation of op-declarations R8 with B3's names (101/101). Next: on B's CHANGE at op-declarations' merge, merge `tranche/T21`, re-run steps 5–7, post COMPLETE.
