# store-door (T37)

**Status** · session_01JNPSatGHX7N9NegWMbM7tR · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R10's third draft: how the door gets `translationdraft`'s own first refusal before its own (AI_KEPT_AWAY, the ceilings, the account), with each code minted at one site (K231). instance-setup (T37-30) is building the handler now, so the interface between us is undecided.

My best reading, which I am building on: instance-setup exports an in-process check `translationDraftRefusal({language, direction, keys, key, by})` answering `null` or R67's first refusal (direction, tag, machine, `TRANSLATION_NOT_GRANTED` / `NOT_AN_ADMIN`, `NO_SUCH_WORD`, not-missing / not-awaiting), writing nothing. The door's `translationdraft` route calls it first; then R10's gate (`credentials.aiKeptAway()`, then `ai-runs.aiUseCheck`, then `credentials.accountFor`); then `instanceSetupOf(ctx).translationDraft({language, direction, keys, key, assistant, by})` with `assistant = {on, account: {kind, level}}`, which answers the `words` (R67's second share). `groupdescriptiondraft` keeps its door-side `NOT_AN_ADMIN` (membership's `notAnAdmin`, already one site).

Alternative: the door hands the handler a resolver (`assistant: async () => ...`) that the handler calls after its own refusals. I recommend the exported check: the handler keeps R10's `{on, account}` shape. Please confirm one of the two, and tell INSTANCE-SETUP #16 the name.

Until it lands I test the route with a stub instance-setup, so nothing waits on it except the end-to-end run after T37-30's merge.

## Completion (T37-32)

**Entries applied.**
- **R9 (N761, its share; K2129, K2175):** `dispatch` removes `secretSha` (`SECRET_SHA_PARAM`) from the in-process URL before the read's arguments are taken, the headers are handed on, or any map receives the URL. The body is handed on as it arrived. No header becomes a `secretSha`.
- **R10 (N765, N669, K2200, K2201, K2238):**
  - `assistantFor` reads `credentials.aiKeptAway()` itself, as given, in place of `instance-setup.assistantGate()`'s `ASSISTANT_OFF`. Under keep-away no account is read and no use is checked.
  - After keep-away: `ai-runs.aiUseCheck`, then `credentials.accountFor`. `assistant.on` comes from `instance-setup.assistantState()`.
  - `groupdescriptiondraft` keeps its door-side `NOT_AN_ADMIN` (membership R84's `notAnAdmin`) first.
  - The new `translationdraft` route:
    1. asks `instance-setup.translationDraftRefusal({language, direction, keys, key, by})` and relays its refusal as given;
    2. then R10's gate;
    3. then `translationDraft({…, assistant})`.
  - B2: store-internal `aikeptaway` (`aiKeptAway() ?? {ok: true}`) and `subscriptionconnected` (`subscriptionConnected({member: q("by")})`) join `controlPlaneRoutes`.

**Deferred.** None. One run is pending: the real `translationDraftRefusal` and `translationDraft` are instance-setup's (T37-30, not yet on `tranche/T37` at this record). R10's `translationdraft` test drives the door with a recording stand-in for them, as the other drafts' tests do. After T37-30 merges, a run of `test/m/store-door` exercises the route against the real handler.

**Found elsewhere (for BOB).**
- `build/modules.json` names `bio-plane/src/setup-words.mjs` (instance-setup, K2238 (2)) before the file exists on the tranche. `checks/format.mjs` fails on it until T37-30 merges.
- control-plane `t34-routes.test.mjs`:211 (R57, :222–223 pinning `ASSISTANT_OFF`) is red on this branch. This is rule 4's interim red, named at T37-30's START, until T37-33.
- Nothing else of another module's changed state. No generated artifact made stale: store-door's code is bundled by plane at L11's close.

**Reading (mechanics §17).** The START measured 928 KB, which is over 300 KB, so I followed option (3).
- **Read whole myself:**
  - my requirements;
  - layer 11's row of `build/layers.md`;
  - my code: `dispatch.mjs`, `pull.mjs`, `step.mjs`;
  - `routes.test.mjs` and `dispatch.test.mjs`;
  - the plan's T37-32 entry and rules 4 and 6;
  - K231, K2129, K2130, K2175, K2200, K2201, K2216, K2238;
  - `credentials` R35, R53, and `aiKeptAway`, `accountFor`, `subscriptionConnected`;
  - `instance-setup` R55 and R67 with its shares;
  - `membership` R84.
- **Read by a worker:** the rest of my tests, in full (`promotion-step.test.mjs`, `pull.test.mjs`, `purge-hold.test.mjs`, `record.mjs`, `harness.mjs`; 53 KB). Its summary is about 1,300 words, each statement citing file:line.
  - Findings: none of the five relies on a query `secretSha`, `ASSISTANT_OFF`, `assistantGate`, a draft route, or the exact URL parameters a map receives. They rely only on `by`, `identity`, `viewer`, `resolve`, `author`, `source`, `confirm` and `bundleId` reaching the maps, which R9 leaves alone.
  - Nothing it left out mattered.

**Tests and checks.**
- `node --test test/m/store-door/*.test.mjs`: pass 41, fail 0. The new R9 test fails against the pre-change `dispatch.mjs` (checked).
- Users of my routes, `control-plane` and `plane` (`test/m/control-plane`, `test/m/plane`): 7 failing, against 6 on `tranche/T37`. The one added is `t34-routes.test.mjs`:211, rule 4's named red above.
  - The other 6 are failing on the tranche alike: plane R15/R2/R23, R18/R5, R19 ×2, R26, R6.
- `checks/format.mjs`: 1 failure, `setup-words.mjs`, not mine (above).
- `checks/architecture.mjs`: 0 failures.
- `checks/coverage.mjs`: 13 of 13, 0 failures.
- `checks/ownership.mjs`: 4 files, 0 failures.

Size (session_01JNPSatGHX7N9NegWMbM7tR): test runs 12, module lines 577

## J2 · COMPLETE

T37-32 complete on job/T37/store-door: R9 (secretSha removed from the in-process URL; body as it arrived) and R10 (AI_KEPT_AWAY from credentials.aiKeptAway(), then aiUseCheck, then accountFor; {on} from assistantState; translationdraft via translationDraftRefusal per K2238; B2's aikeptaway and subscriptionconnected). store-door 41/0; coverage 13/13; architecture, ownership 0. Notes: translationdraft is tested against a stand-in until T37-30 merges (re-run then); format fails only on modules.json's not-yet-present setup-words.mjs (instance-setup's); control-plane t34-routes.test.mjs:211 is rule 4's named red until T37-33. Details in my record.
