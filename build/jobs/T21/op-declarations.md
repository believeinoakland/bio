# op-declarations (T21)

**Status** · session_01Fq5Tmj68jFDjRPXcC2D1iX · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of R8 I am building on; correct me if either is wrong (neither stops the work).

(1) "each in `SESSION_OPS.member` and `SESSION_OPS.admin`" I read literally: all seventeen ops (the eleven acts, the four grant-door ops and the three reads `templates`, `factstatus`, `factsdue`, less nothing) go in both sets. For the doors (`classes: null`) this is harmless at the gate (admission passes public ops before the session gate, and a read before it too), and it records that a member's session reaches them. My R3 test's rule "a session set's op admits that session kind" therefore reads "admits it, or is public (`classes: null`)".

(2) `NEEDS`: `contribute` for the nine mutating member acts and `templatepropose` (R8's rule, as `optionpropose`); a null row for the two mutating doors (`templatereview`, `templatecomment`: reached by a secret, so no capability), and a null row for the five reads (`templates`, `templateread`, `templatecomments`, `factstatus`, `factsdue`), because affordances R30 names all seven in `NON_ACTS` and its R12 reads a `NON_ACTS` key that `NEEDS` does not carry as stale (K516's precedent for the contradiction reads).

The lists (R4), so control-plane can stamp from them: `FILING_TEMPLATES_ACTIONS` (the seven member acts) joins `QUERY_AUTHOR_ACTIONS` (filing-templates reads `author` from the query for all seven, mapping it to `by` where its R says `by`); `TEMPLATE_PROPOSAL_ACTIONS` (`templatepropose`, `proposer`); `LOCAL_FACTS_ACTIONS` (`factconfirm`, `by`); all three in `ACTION_LAYER_ACTIONS` (viewer). `FILING_TEMPLATES_READS` (`templates`, moved out of `FILINGS_READS`) and `LOCAL_FACTS_READS` in `ACTION_LAYER_READS`. `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` (author by session, or `secretSha`; viewer); `GRANT_SECRET_ACTIONS` = `reviewgrant`, `templatereviewgrant` (the door mints the secret and stamps its `secretSha`).

## J2 · REPORT

For other modules (nothing here is mine to change):

1. **control-plane, a test made red by the move you ordered.** `bio-plane/test/m/control-plane/stamps-action.test.mjs`:34 asserts `FILINGS_READS.includes("templates")`; `templates` is now in `FILING_TEMPLATES_READS` (filing-templates R14, my START). Red from my merge until control-plane re-points it. (Its two other reds, CHECK_FAMILIES R22 and R43, were red before my change.)
2. **filing-templates vs its R6 and my R8: the proposer's stamp.** `filingTemplatesOps` (`bio-plane/src/filing-templates/index.mjs`:1271) reads `templatepropose`'s proposer from the query's `author`, but R6 and my R8 name a `proposer` stamp, which control-plane sets for the proposal lists (`PLAN_PROPOSAL_ACTIONS`' expression). As built, a door that stamps `proposer` leaves the module with none (`TEMPLATE_NO_PROPOSER`), and a caller's own `author` would be read unless the door overwrites it. One of the two must give: filing-templates reads `proposer`, or control-plane stamps `author` for `TEMPLATE_PROPOSAL_ACTIONS`. I declared it `proposer`, as R8 says.
3. **control-plane, wiring (for its job).** New lists, each exported: `FILING_TEMPLATES_ACTIONS` (in `QUERY_AUTHOR_ACTIONS`, so the author stamp reaches all seven with no new code; filing-templates maps it to `by`), `FILING_TEMPLATES_READS`, `TEMPLATE_PROPOSAL_ACTIONS`, `LOCAL_FACTS_ACTIONS`, `LOCAL_FACTS_READS` (all in `ACTION_LAYER_ACTIONS`/`_READS`, so viewer-stamped already), `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` (author by session, else `secretSha` from `secret`, as `reviewcopy`/`reviewcomment`) and `GRANT_SECRET_ACTIONS` (`reviewgrant`, `templatereviewgrant`: mint the secret, stamp `secretSha`). local-facts reads `factconfirm`'s `by` from the BODY (`localFactsOps`, :389), so the door must stamp and overwrite it there, as it does `resolutiondefect`'s (control-plane R17).
4. **Generated artifact stale:** my change to `bio-plane/src/op-declarations/index.mjs` stales the plane's bundle `bio-plane/dist/` (`build/manifest.md`, "Generated artifacts"). I regenerated nothing.
