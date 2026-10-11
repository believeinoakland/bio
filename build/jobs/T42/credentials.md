# credentials (T42)

**Status** · session_01SmVin6JuSDfPb4PyoweFzP · depth 2 · WORKING · handled B1

## Completion (CREDENTIALS #12)

**Reading set** (mechanics §17, K2304): measured over 300 KB (requirements 62 KB, own code 240 KB, own tests 399 KB). Read whole myself: `build/requirements/credentials.md`; layer 2's row of `build/layers.md`; the plan's entry T42-4 and its rules at the opening (rule 4 as at my START); K2442, K2480, K2608; `draft-T42-reqs.md` § N831; the code my entry changes (`index.mjs` R55's `accountUsesSet`/`#usesOwner`, R60/R61 and their helpers `#ownerBar`, `#limitsFor`, `#memberOf`, `#usesOf`, `#groupKeyFacts`, `#projectAccountRow`, `#reference`, the ops map's head comment) and t41's R60 test and `fixture.mjs`'s `world()`. My Uses: R62 calls no service of membership, record-core or record-grammar beyond `isMachineIdentity` (record-grammar). Two workers read the rest whole: one all of `index.mjs`, `schema.mjs`, `checks.mjs` (about 4 KB summary, citing file:line: every path answering uses and that none can carry `sealed`, `iv` or a key; the ops map and its unrouted-reads comments; the header's `R1–R61`); one every test file (about 4 KB summary, citing file:line: fixture API, every test enumerating routes (rows-ops:88-95 exact; none matching `usesof`), sentinel and broken-store conventions, no source-text test). Acted on: the header updated; `member:member:x` refused as malformed.

**Entry applied (T42-4; N831, K2480).** R62 `accountUsesOf({owner})`: an in-plane method, not in the ops map (listed in its unrouted-reads comment). R60's answer body moved into `#usesAnswer(owner)`, shared by `accountUses` (behind its owner bar, plus `keptAway`) and `accountUsesOf` (no viewer, no `keptAway`), so the two cannot drift. Owner spelling (`#usesOwnerSpelled`): `group`; `project:<non-empty>`; `member:<id>`, id non-empty, not itself `member:…`, not a machine identity; anything else `{ok: true, owner, held: false, uses: null}` (`owner` echoed when a string, else null). A thrown read answers `{ok: true, owner, held: null, uses: null, unreadable: true}`. R60's answers unchanged (t41 passes untouched).

**Tests.** New `t42.test.mjs` (6 tests, all R62, each with a negative control, K874): equality with R60 for group, three projects (key, sign-in, none), three members (reference, sign-in, none), after a change and for a fresh group key; no viewer, incl. hidden P the founder is refused by R60, and a passed viewer ignored; 17 malformed owners; four broken tables each giving `unreadable` with no default; sentinels (key, SHA-256 hex, sealed/iv values) absent and nothing written; no `accountusesof` route while `accountuses` is routed.

**Ran.**
- `node --test test/m/credentials/` (bio-plane): tests 174, pass 174, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 147 modules, 146 requirements files; 0 failures. `architecture … credentials`: 24 product files, 64 relative imports; 0 failures. `coverage … credentials`: 61 of 61 live requirement ids named by a test; 0 failures (R62 marked, accepted red rule 4 (1) until merge; t42 names it). `ownership … credentials tranche/T42`: 0 failures.

**Deferred.** None.

**Found (for BOB).** (1) A revoked member's `account_references` row survives revocation (R16 clears sessions, keys, codes and the sign-in, not the reference: `index.mjs` R16 listener), so `accountUsesOf({owner: "member:<revoked>"})` answers `held: true` with their uses, where R60 refuses every viewer. R62 as worded allows it; whether R16 should also remove the reference (or R62 answer a revoked member `held: false`) is a requirement question for BOB. (2) For `group`, `held: false` still carries `uses` (the defaults or the stored row), as R60 states; `held: true` does not mean the account is on or serving. `ai-use`'s T42-17 must read `held` (and R3's fail-closed wording) accordingly. Generated artifact staled: the plane bundle, regenerated at layer close.

Size (session_01SmVin6JuSDfPb4PyoweFzP): test runs 4, module lines 3857

## J1 · COMPLETE

T42-4 done: R62 accountUsesOf built (shares R60's answer body; unrouted), new t42.test.mjs (6 tests, R62 with negative controls). credentials 174/174; format, architecture, coverage, ownership 0 failures. Two findings for you in the record: a revoked member's reference survives R16, so accountUsesOf answers it held: true (a requirement question); group's held:false carries uses (as R60), for ai-use T42-17 to read held. Plane bundle staled.

## Change B2 (K2620)

**Applied.** Merged `tranche/T42` (R62 clarified @ fac7e2b65f). `accountUsesOf` answers a revoked member's `member:<id>` `{ok: true, owner, held: false, uses: null, accounts: {reference: {held: false, uses: null}, signin: {held: false, uses: null}}}` (the `accounts` shape kept, holding nothing). It asks `membership.memberFacts` (R68, already in my Uses) directly rather than through the never-throwing `#memberFacts`, so a roster that cannot be read answers `unreadable: true` (fail closed) rather than reading as "not revoked". R16's reach unchanged; R60 unchanged.

**Tests.** `t42.test.mjs` gains one test (R62, K2620): fay held before revocation (negative control) and equal to R60's answer; after `memberSet` revoked, her reference row is kept, R60 refuses her, R62 answers `held: false, uses: null` with no key, writing nothing; live ann still held with her uses (negative control); a throwing roster gives `unreadable` for a member while `group` still reads.

**Ran.** `node --test test/m/credentials/`: tests 175, pass 175, fail 0. `architecture`: 0 failures. `coverage`: 61 of 61; 0 failures. `ownership … tranche/T42`: 0 failures. `format`: 1 failure, not mine: `build/modules.json: promotion: tests entry bio-plane/test/fixtures/row-census-1.69.0.jsonl names no file` (K2620's fixture swap, arriving with promotion's merge); the same failure with my changes stashed.

Size (session_01SmVin6JuSDfPb4PyoweFzP): test runs 5, module lines 3863
