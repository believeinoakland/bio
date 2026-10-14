# ai-accounts (T48)

**Status** · session_01D9QzqMiaJcmqiwJMHhqkZd · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on; nothing waits on the answer.

1. **R34 and a project's limit.** R34 says "whatever part of a material limit cannot be read … it answers the one refusal R7 states" (AI_KEPT_AWAY). My reading: that governs the group's limit and any error inside the read (a throw anywhere in `aiKeptAway` answers `KEPT_AWAY_UNREADABLE`); a *project's* limit that cannot be read keeps R22's own fail-closed answer, PROJECT_AI_KEPT_AWAY with its row ("could not be read"), as credentials answers it today, not AI_KEPT_AWAY. To make `KEPT_AWAY_UNREADABLE` the one site's own answer (not a copy), the `is-kept-away` region moves from `aiKeptAway` into a static `#keptAway` that `aiKeptAway` calls, so C-29.31's `where` reads `src/ai-accounts/index.mjs #keptAway > is-kept-away` (a `where` change, for T48-12's stamp with the other moved rows).
2. **R26 on a reference's removal.** credentials' `accountReferenceRemove` deletes the member's standing grants whether or not a reference was held. To keep credentials R73 byte-identical, R26's listeners are told on every accepted `accountReferenceRemove` (`account: "reference"`, `reference_held: false`), held or not; a sign-in is told only when one was held and cleared (as credentials' `#signinCleared` revoked only then). `subscriptionTokenRefused` tells no one (credentials revoked nothing there).
