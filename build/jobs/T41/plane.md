# plane (T41)

**Status** · session_011Rh5mYtXnbRop7kcnGcwb1 · depth 2 · WORKING · handled B5

## J1 · QUESTION

R33 / store-door R11: who decides that a read under a draft's grant is logged with `use: "draft"`?

The draft's grant is minted by `credentials.aiGrantMint`, which records it as kind `ask` (it takes no `use`); answers fixes a read log's `use` from the first `logRead` entry that opens it; store-door's `underGrant` (`dispatch.mjs`:257–261) calls `store.logRead({grant, op, args, answer, viewer})` with no `use`. Nothing in git records that a grant was minted for a draft, so store-door alone cannot know.

My best reading (I am building it now): the plane owns it, since it mints the draft's grant and hands store-door its `logRead`. `draftOnObject` notes each grant it mints (in memory on the `bio` object, dropped when the grant's TTL passes; no table), and the `logRead` the plane hands to `dispatch` records with `use: "draft"` for a grant so noted, else the entry's own `use` (or `ask`). store-door need pass nothing new; if its job adds a `use` to the entry, a noted draft grant still reads as `draft`. Tested at the interface: a draft's reads leave out a project kept away from drafts (`credentials.projectsKeptAway({use: "draft"})`) and an ask's reads do not.

Replace only if you rule otherwise (e.g. credentials minting a `draft`-kind grant, which is not my module).

## J2 · QUESTION

Two points from B4/B5, everything else in them applied (B3 investigation to queue; B5 the plane's instances to notice-producers; R33 as K2574 wrote it; R35's `aiUseOps`, `readingGuidesOps` with `groupSlug`; R30 investigation at boot):

1. (B5, wizard-scripts R23) The front door's `findExisting` is wired (steps' `stepsLike`, then `retrieval.search`'s questions and projects, each under the viewer's gate; `wiring.mjs` `frontDoorFinder`; tested). Its `pointer(viewer)` is "profile data, never named in code", and I find no such data in the code: no jurisdiction profile, instance-setup read or setting carries a "not Civicsmith's" pointer. My reading: register no pointer (wizard-scripts answers null) until a module provides that data; nothing to build in the plane now. Tell me if a provider exists that I missed.

2. (B4, R35) `controlPlaneOwnerOps` is in `src/control-plane/owner-ops.mjs`, not yet on `tranche/T41`. I cannot import it before it merges. My reading: I spread it (with `of` the getters `{aiUse, aiRuns, caseAuthoring, review, legEarning, capture, steps, investigation, questionExplorer}` over the plane's instances) and test it when control-plane's merge reaches me by CHANGE; until then the rest of the job is done and green (plane 165/165, checks 0 but architecture's four `uses` edges, which you apply at merge).
