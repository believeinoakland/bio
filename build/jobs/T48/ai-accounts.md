# ai-accounts (T48)

**Status** · session_01D9QzqMiaJcmqiwJMHhqkZd · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings I am building on; nothing waits on the answer.

1. **R34 and a project's limit.** R34 says "whatever part of a material limit cannot be read … it answers the one refusal R7 states" (AI_KEPT_AWAY). My reading: that governs the group's limit and any error inside the read (a throw anywhere in `aiKeptAway` answers `KEPT_AWAY_UNREADABLE`); a *project's* limit that cannot be read keeps R22's own fail-closed answer, PROJECT_AI_KEPT_AWAY with its row ("could not be read"), as credentials answers it today, not AI_KEPT_AWAY. To make `KEPT_AWAY_UNREADABLE` the one site's own answer (not a copy), the `is-kept-away` region moves from `aiKeptAway` into a static `#keptAway` that `aiKeptAway` calls, so C-29.31's `where` reads `src/ai-accounts/index.mjs #keptAway > is-kept-away` (a `where` change, for T48-12's stamp with the other moved rows).
2. **R26 on a reference's removal.** credentials' `accountReferenceRemove` deletes the member's standing grants whether or not a reference was held. To keep credentials R73 byte-identical, R26's listeners are told on every accepted `accountReferenceRemove` (`account: "reference"`, `reference_held: false`), held or not; a sign-in is told only when one was held and cleared (as credentials' `#signinCleared` revoked only then). `subscriptionTokenRefused` tells no one (credentials revoked nothing there).

## Completion

**Paths and tests for `modules.json` (K1043):** `paths` `["bio-plane/src/ai-accounts/"]`, `tests` `["bio-plane/test/m/ai-accounts/"]`.

**Entry applied: T48-10 · ai-accounts (new).**
- Built by copy from credentials per the split map §2: `src/ai-accounts/index.mjs` (the moved services, the seal byte-identical, HKDF salt/info `bio-credentials-seal/1`, AAD `owner|kind`), `schema.mjs` (the eleven tables' DDL and additive columns, unchanged; `AI_ACCOUNTS_TABLES`, `_PROJECT_TABLES`, `_HISTORY_TABLE` declared under `ai-accounts`), `checks.mjs` (`AI_WORDS`; `AI_ACCOUNT_CHECKS`, the 21 moved C-29 rows, numbers, codes and translations unchanged, `where`s naming this module). The 24 routes in `aiAccountsOps`; `accountswitchset`/`groupswitchset` not in it.
- Seams (R24–R27): `sealText`/`unsealText`, `accountActBar`, `accountServing`, `servingAccountOf`, `notYourAccount`, `noAccount`, `accountMemberNotActive`, `onAccountCleared`, its own `onRevoked` listener. Where credentials wrote its own tables (standing grants on a reference's removal or a sign-in's clearing; run credentials on a sign-in's clearing), this module tells R26's listeners instead (K3213). `#retiredReferences` keeps its reference half and drops the grant `DELETE` (doubt 5).
- R34 (N1041, K3148): `aiKeptAway` never throws and never answers AI_KEPT_AWAY without its row; `KEPT_AWAY_UNREADABLE` exported frozen, asked of the one site over no store. C-29.31's `where` is now `#keptAway > is-kept-away` (K3213; for T48-12's stamp).
- (N1036, K3189) Home's line (the group key's use against its limit), re-tested at START: not this module's; the counts and limits are `ai-use`'s (K3198, T48-29). Nothing applied here.
- I read my own code and tests whole (P20) and found no flaw beyond R34's (applied).

**Deferred:** none.

**For other modules (REPORT-worthy, all already in the plan):**
- credentials (T48-11): delete the copies; create `ai-accounts` in `credentialsOf` with the seal secret and run its `migrate` first; register `onAccountCleared` (R73: on `signin` revoke run credentials; on `reference`, or `signin` with `reference_held: false`, end standing grants); `keyedServiceFor`'s "fields that do not parse" case needs a seal refusal: `unsealText` answers only when the row does not open (a sealed JSON that opens always parses, since it was sealed from `JSON.stringify` under AES-GCM).
- Until T48-11 merges, both modules declare the eleven tables; nothing composes both (split map §7 risk 1). Row census: C-29.13…45 held by two `checks.mjs` files until T48-11/T48-12 (rule 5 (6)).
- Generated artifact: the plane bundle is not staled by this merge (no plane file imports `src/ai-accounts/` yet); it will be at T48-11.

**Tests** (`node --test bio-plane/test/m/ai-accounts/`): `tests 109, pass 109, fail 0`. Ported from credentials (account, group-key, t35-misc, t36, t37, t38, t40, t41, t42, t47, t47-signin, seam), each arm titled with its new id and its old one; only credentials' grant/session arms and assertions stayed in credentials. New: `seams.test.mjs` (R24–R28, R30, R32–R34; 26 tests). No layer tests named in the manifest.

**Checks** (with `modules.json`'s ai-accounts row given the paths above, as at COMPLETE; file restored, not committed):
- `format.mjs`: 168 modules, 167 requirements files; 0 failures
- `architecture.mjs ai-accounts`: 17 product files, 43 relative imports; 0 failures
- `coverage.mjs ai-accounts`: 34 of 34 live requirement ids named by a test; 0 failures
- `ownership.mjs ai-accounts tranche/T48`: 0 failures
- `run.mjs`: format 0, architecture 0 (3276 product files), channels 0; coverage 27 failures, none ai-accounts' (other modules' T48 ids, rule 5 (1)).
Without the paths, coverage and ownership fail only because the row is empty until COMPLETE (K1043).

Size (session_01D9QzqMiaJcmqiwJMHhqkZd): test runs 12, module lines 2191
