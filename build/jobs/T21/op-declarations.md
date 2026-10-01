# op-declarations (T21)

**Status** · session_01Fq5Tmj68jFDjRPXcC2D1iX · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of R8 I am building on; correct me if either is wrong (neither stops the work).

(1) "each in `SESSION_OPS.member` and `SESSION_OPS.admin`" I read literally: all seventeen ops (the eleven acts, the four grant-door ops and the three reads `templates`, `factstatus`, `factsdue`, less nothing) go in both sets. For the doors (`classes: null`) this is harmless at the gate (admission passes public ops before the session gate, and a read before it too), and it records that a member's session reaches them. My R3 test's rule "a session set's op admits that session kind" therefore reads "admits it, or is public (`classes: null`)".

(2) `NEEDS`: `contribute` for the nine mutating member acts and `templatepropose` (R8's rule, as `optionpropose`); a null row for the two mutating doors (`templatereview`, `templatecomment`: reached by a secret, so no capability), and a null row for the five reads (`templates`, `templateread`, `templatecomments`, `factstatus`, `factsdue`), because affordances R30 names all seven in `NON_ACTS` and its R12 reads a `NON_ACTS` key that `NEEDS` does not carry as stale (K516's precedent for the contradiction reads).

The lists (R4), so control-plane can stamp from them: `FILING_TEMPLATES_ACTIONS` (the seven member acts) joins `QUERY_AUTHOR_ACTIONS` (filing-templates reads `author` from the query for all seven, mapping it to `by` where its R says `by`); `TEMPLATE_PROPOSAL_ACTIONS` (`templatepropose`, `proposer`); `LOCAL_FACTS_ACTIONS` (`factconfirm`, `by`); all three in `ACTION_LAYER_ACTIONS` (viewer). `FILING_TEMPLATES_READS` (`templates`, moved out of `FILINGS_READS`) and `LOCAL_FACTS_READS` in `ACTION_LAYER_READS`. `TEMPLATE_DOOR_ACTIONS`, `TEMPLATE_DOOR_READS` (author by session, or `secretSha`; viewer); `GRANT_SECRET_ACTIONS` = `reviewgrant`, `templatereviewgrant` (the door mints the secret and stamps its `secretSha`).
