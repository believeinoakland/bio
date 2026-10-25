# store-request (T51)

**Status** · session_01KkxdPkQTFsfr63anJhveG7 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Five readings; I am building on each now and stop for none of them.

1. R22 (control-plane holds none of the rules and calls innerRequest) can only be met by control-plane's Wave B job (K624; my START: control-plane keeps its code). Reading: R22 is named in a `test.todo` here, as store-assembly R98 was (K5125 (3)), and stays not yet met.
2. R23, the grant issuers (`reviewgrant`, `templatereviewgrant`): control-plane's `withDigest` turns a JSON body that is not an object (an array, `null`) into `{secretSha}`; R23 says such a body passes unchanged so no grant is made. Reading: the requirement wins (a non-object JSON body or non-JSON text passes unchanged, no digest anywhere); an absent body becomes `{secretSha}` as today (R23 is silent on absent).
3. R23's secret ops (`reviewcopy`, `reviewcomment`, `statementack`, the four template doors) are public ops whose address control-plane builds afresh (only `draft`, `limit`, `drafts`, `case`/`edition`, `reason`). Reading: innerRequest applies R2-R5, R9 and R23 to them exactly as written (the address keeps the page's other parameters, less R3's); the narrower address those arms build stays the arm's, for control-plane's Wave B job to reconcile under R137.
4. `modules.json` has empty `paths`/`tests` for store-request (K1043, K5125 (1): filled by BOB at the merge). Reading: I commit no `modules.json` change; I run architecture/coverage/ownership with the row filled in my working tree only, and my COMPLETE names the two paths.
5. R17's arms need control-plane's `sha256Hex`, `captureKey`, `storageAbsent`, `caseReader` (later module). Reading: the world (test support) re-makes each from an earlier module (record-grammar `createSha256`; store-assembly R2's `<namespace>/captures/<sha>`; acquisition `evidenceStorageAbsent` with answer-envelope `json`; admission `readerOf` with `doAnswer`), and R15's parity test covers the requests those arms make only where they go through innerRequest.

## J2 · QUESTION

R4 ends: "The caller's own value of any of them is gone before this rule runs (R3), so a stamp the op does not declare is never present." R3's list (`QUERY_STAMPS` and the others) does not hold `proposer`, `principal`, `owner` or `member`, and control-plane's door deletes those four from the address only for an op that declares them (`index.mjs:1426-1430`). So today a page's `proposer=x`, `principal=x`, `owner=x` or `member=x` reaches the store for an op that declares none of them and that no R7 row sets.

Reading (built and tested now): R4's last sentence covers R3's keys, as the door does today; the four pass as page parameters for an op that neither declares them nor is named in an R7 row (for `member`, some owners may read an address `member` as the account named). If you rule instead that all four always leave the address, it is a one-line change here (R3's deletion list) plus its test, and I would make it in this job.

## J3 · REPORT

Four findings in other modules, none fixed here (I write only my own paths).

1. **Dead declarations: `capturerequestplatformmark`, `capturerequestplatformunmark`, `capturerequestplatformhosts`** (op-declarations `index.mjs:427`, `:2666`, `:2707`). No module answers them: no key of the assembled route map, no arm in `plane/door.mjs`, no handler anywhere in `src/` (grep finds only the declaration, op-grades and op-capabilities rows). The real door would take its generic forward to a store route that does not exist. One cause per op (K4426): the module that owns them (capture-requests, by name) or op-declarations, if they should not be declared. The world names all three in its closed `WORLD_UNREACHED` list with this cause, so R20 stays closed until they are answered or removed.

2. **store-assembly's world records no producing team.** Its base is built with no `INSTANCE_NAME`, and instance-setup records the team only at the first boot (its R2), so in a bare `store-assembly` world every `promote` that must name the team is refused `GROUP_UNDETERMINED` (C-64.1). My `storeWorld()` records it by the root of trust's real act (`instancegroupseed` with the world's `ADMIN_TOKEN`), about 20 ms a world. Improvement for store-assembly: hand `INSTANCE_NAME` when it builds the base (a real first boot), so its own world can promote too.

3. **R-CLOCK in a pinned world: two writes keep the wall clock.** Seen with `BIO_NOW_MS` pinned at 2026-10-01: the claim's `consumedAt` (credentials, `bootstrap` reports it) and `instancegroupseed`'s `recorded_at` (instance-setup `instanceGroupSeed`, `this.#iso()`) both read the wall clock (2026-10-25). Same family as STORE-ASSEMBLY #1 J2 (the ledger's wall clock). A screens test that compares those instants with the world's clock will see the mismatch.

4. **For control-plane's Wave B job (R136, R137): what the world's door does not re-make**, so a parity test should leave these out or expect them: no namespace, address or window gate; no ask grant (`grantAdmit`); after the forward, no reading followed for a promotion's documents or an upload (`followEntries`, `readUploaded`), no archive members promoted after `unpack`, no draft asked after a draft-due act; `reviewAnswer`'s 404 for an absent review copy (the world relays the store's 200 with `NO_REVIEW_COPY`); `agentpack`, `airundispatch`, `textcheck`, `readtranslate` refused `WORLD_NO_DOOR_ARM` (their shaping is control-plane's `packOf` and `draft.mjs`). The requests themselves are innerRequest's on both sides.
