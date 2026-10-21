# The way there: what of today's assistant is kept, adapted or retired (Q6)

**Status.** 2026-10-21, AI-DESIGN #2. Material for N1220 (`build/plan/next.md`), the tranche that builds multi-AI support. It classifies every requirement of the six modules named in the hand-over (`agent-model`, `agent-runner`, `agent-worker`, `ai-accounts`, `ai-use`, `credentials`) against `BOUNDARY-REQUIREMENTS.md` (BR-n) and `AI-PROVIDER-REQUIREMENTS.md`. Each module's requirements were read whole by sonnet/medium workers (sources in §8). Nothing here is code or a ruling: what goes into a tranche, in what order, and how modules are packaged are BOB's (P17); rulings to reconcile are listed for BOB to record; the two questions that are Bob's are in §7.

## 1. In plain words
Most of the assistant stays as it is. The loop that runs the work, the fences, the plane's checks, the run record, the run credentials, the account cascade, the switches, the keep-away limits and the usage counting are already provider-neutral. What changes is one thin layer and the account shape:
- **The model call** (`agent-model`) becomes the one neutral interface. Today's Anthropic API-key path becomes the first adapter behind it; it is not rewritten.
- **The account** (`ai-accounts`) stops being "an Anthropic API key or a Claude sign-in" and becomes "provider, plan, how the credential is held, which models are allowed, limits", with room for an ordered list.
- **Usage** (`ai-use`) records a neutral usage shape, and "no money" follows what the plan reports, not the kind of account.
- **The Claude Code container** (`agent-runner`) is not part of the new path. Its locked-container pattern is reused for the test container; its sign-in machinery stays parked, as K3718 left it.
- **Words** that name Anthropic or Claude in what members read become words taken from the catalogue.

## 2. The verdicts
**KEEP** unchanged · **ADAPT** same idea, provider-neutral content · **ADAPTER** survives as the Anthropic adapter or plan profile (BR10) · **TEST** pattern reused by the locked test container (`SUITE-REQUIREMENTS.md` §10) · **RETIRE** no place in the design · **PARKED** unbuilt or conditional; left as K3718/K3610 left it, no new effort.

### `agent-model` (R1–R24): becomes the provider interface and its adapters
| Verdict | R ids | What changes |
|---|---|---|
| KEEP | R8, R9, R17, R18, R20, R22–R24 | R8/R9 are already BR15/BR16 (secret for one call; no ambient credential; sentinel tests extend to every adapter). R17, R20, R22–R24 are tool schemas (candidates to move to `agent-harness`). R18 `checkFinal` hand-back once. |
| ADAPT | R1, R19 | The role table chooses a **catalogue entry id**, never a raw model string; prices and model ids leave requirement text for the catalogue; effort comes from the entry's own set and an entry without a dial refuses the control by name (BR1, BR3, BR31). |
| ADAPT | R3 | Never throws; malformed is `silent` (detail ≤200); refusal returned as the model's, never reworded: kept. 429 "never retried" becomes BR26's bounded retry honouring retry-after; a spend-limit 429 becomes "limit reached", not an error (BR23). |
| ADAPT | R5, R6, R13 | Usage becomes the neutral record (BR22). Kept rules: null never zero; a sum is null if any turn's figure is null; `calls` counts only requests sent; an unknown figure is priced at the highest rate, never zero; no money means tokens and calls only, shown "not measurable in money". `converse` stays, built only on BR1/BR2 (BR4). |
| ADAPT | R10, R11, R12, R14, R21 | One endpoint becomes the host profile's hosts, with host pin and served-identity check (BR9, BR12). Level rule becomes "the plan states which credential means it allows" (BR13). Record text only in tool results stays for every adapter (BR7). Image input becomes a capability; unsupported is refused as "unsupported control" (BR3, BR26). Model and effort in the answer become served identity (BR2, BR29). |
| ADAPTER | R2 (API-key path), R4, R16 (held-token flow) | The Messages-API call, `cache_control` marking and the held-token flow become the Anthropic adapter. The neutral side of R4 is the append-only prefix and cache hints in the request (BR1, BR25). |
| PARKED / RETIRE | R2 (sign-in path), R7 (relay mechanism), R15 | The relay to a member's Claude Code container is Anthropic-subscription only and disabled by `agent-runner` R35. The idea of R7 (the harness's table decides every tool call; the AI is a callee) is kept as a principle. |

### `agent-runner` (R1–R40): not on the new path; pattern reused for the test container
| Verdict | R ids | What changes |
|---|---|---|
| TEST | R5, R6, R7–R10, R12–R16, R26, R29, R30, R33, R34 | Digest-pinned image and base (R7, R13, R14); thin host Worker adding nothing (R12, R15); closed surface and version endpoint (R5, R6); exact egress allow-list with refused egress logged (R10, R30, R34); nothing persisted, writable paths checked (R9); key in memory only, scrubbed logs with a closed field list (R8, R29); supply-chain rule (R16); failed start answered as JSON (R26); sized instance declared and tested (R33). |
| What the test container still needs | — | Bundle building and sealing with an in-container key; the challenge fetch from Civicsmith's issuer (a second allowed host); a per-run provider host in the allow-list; raw-exchange capture (which R29/R30 forbid for production: two logging modes); host pin and served-identity checks; a spend and time ceiling per run; no Claude Code and no shell in the image; attestation of the running image (OPEN). |
| ADAPTER / PARKED | R1, R3, R4, R24, R27, R28, R31, R32 | The Claude Code query, its relay, image relay and held-token conversation are an optional Anthropic runtime route; R4's null-where-unstated and R32's effort validation become neutral rules (BR22, BR3). R31's plain refusal words carry over ("team", K3472). |
| RETIRE | R2, R17–R23, R25 | The Anthropic subscription sign-in state machine (superseded within the module by R27/R28) and the terms field for Claude Code (AT-14), whose pattern becomes Gate 0 evidence in the catalogue (BR31). Lesson kept: the environment is replaced whole (BR16). |
| PARKED | R35, R36–R40 | R35 (local runner disabled) stays. The remote route stays unbuilt (K3718(2), K3610, K3615); if a remote route is ever wanted it is a runtime-constraint profile on a plan (BR14), not a module. |
| KEEP | R11 | No place named in outward text. |

### `agent-worker` (R1–R118): the loop stays; account shape and dispatch change
| Verdict | R ids | What changes |
|---|---|---|
| KEEP | R1–R5, R7–R12, R17–R19, R21–R25, R27, R31, R34, R36–R39, R42–R49, R51–R53, R55, R58, R60–R63, R65, R68–R70, R76–R79, R86, R89–R94, R96, R97, R99–R105, R107, R108, R113–R118 | The loop, fences, plane-side checks, allow-lists (`PLANE_OPS`, `ASK_OPS`), record text only in tool results, refusals never reworded, dedup, bounds, progress events (K3602). R36's examples reworded to credential means. |
| ADAPT | R6, R28, R29, R32, R33, R56, R71 | The account on the wire carries provider, plan, credential means and catalogue entry id, not `kind: apikey/signin` and a secret; `claude_account` becomes a neutral `ai_account`; "revoked by publication" becomes a per-means resolver result (auth revoked or removed); "group" becomes "team" in words people read (BR13, BR15–BR17, K3472). |
| ADAPT | R26, R87, R95, R98, R112 | Usage entries carry the neutral record and served identity, not a model string (BR22, BR2, BR29); the `subsession` role asks for a capability and cost need, not a fixed cheaper model (BR3, BR6); R98's hard-coded `claude-sonnet-5-5` leaves requirement and test text. |
| ADAPT | R54, R59, R72–R75 | `/ask` and drafts unchanged except account shape; streaming falls back to turn-level progress where an adapter cannot stream [Bob] (BR5); drafts carry the producing AI's label (BR29). `/transcribe` asks for image capability first and refuses by name; R72's "5 MB" becomes a catalogue field. |
| ADAPT | R10, R57 | After a failover hop the payer check compares the **member**, not the account, and the hop is recorded per segment (BR18, BR19). |
| ADAPT | R30, R35, R64 | `runner` flag becomes a neutral "AI path ready" from `health(account, entry)` (BR6, BR28); bindings rule kept as "no plane credential reaches whatever runs the model"; R35 and R109 disagree today (RUNNER vs REMOTE) and are reconciled by this. |
| ADAPTER | R66, R67, R81–R85, R109, R110 | The Claude sign-in relay and the remote dispatch and readiness gate belong behind the provider interface as the Anthropic adapter and its credential resolver, and leave `agent-worker` with the split; their "never logged, delivered once" rules become neutral credential-resolver rules (BR13, BR15). |
| PARKED | R80, R111 | Kept red (K3718). R111's echo-and-done round trip is a good generic probe: promote it to every adapter's connect test (T0 in `SUITE-REQUIREMENTS.md`), not Anthropic-only. |
| RETIRE | R88, R106 (and R13–R16, R20, R40, R41, R50 already moved) | R88 (K3347's API-key bar) is overtaken by credential means as data (K3718(5)); R106's concurrency question becomes a plan's allowance window (BR23). |

**Size.** `agent-worker` is 4,077 source lines against the 4,000 limit, and T50 adds more; its split is T51's first entry (N1205). Adapters, credential resolvers and sign-in flows must not go into it; the sign-in block and the remote-dispatch block are the natural first things to move out.

### `ai-accounts` (R1–R34): gains provider, plan, means, order and consent
| Verdict | R ids | What changes |
|---|---|---|
| KEEP | R4, R9, R14, R16, R17, R20–R24, R30–R34 | Per-use switches (nine `USE_KINDS`), keep-away limits (bind every account, judged first, BR21), disclosure-first order, the AES-GCM seal (becomes the sealed means), history (gains order changes, opt-ins, means changes and free-tier acceptances, AIR31). |
| ADAPT | R1–R3, R5–R8, R10–R13, R15, R25–R29 | `kind` becomes (provider, plan, credential means, entry allow-list); sealing becomes one of three means and references store only the pointer (BR13); "one key per owner" and "at most one project account" become an ordered list (BR18); the project sole-member rule follows plan scope as data (AIR3); notices name the chosen provider and host from the catalogue, not Anthropic; tables gain columns, so "table names and columns unchanged" cannot hold. |
| ADAPTER | R18, R19 | The Claude subscription connection and held token become the Anthropic plan profile's provider-issued route; token length and "Anthropic refuses it" are profile data; the neutral part is "a provider-issued token, sealed or referred to, dropped on disconnect, revocation or provider refusal". |
| NEW | — | Ordered list, hop events, cross-owner standing opt-in (off by default) [Bob], plan scope enforcement, free-tier warning acceptance [Bob], new refusal codes (plan scope, means not allowed, runtime constraint unmet, list exhausted, opt-in missing). |

### `ai-use` (R1–R15): neutral usage and provider-side limits
| Verdict | R ids | What changes |
|---|---|---|
| KEEP | R4, R6–R9, R11–R13 | Reads, explore gate, tables, codes; refusal sentences are already read by key from `words.json` (R13; new keys needed for provider-side limit, list exhausted, hop notice). |
| ADAPT | R1, R14, R15 | Neutral usage record with reported and estimated cost kept apart (BR22); dollars become cost with unit or "not measurable in money"; model becomes entry id plus served identity; tests stop hard-coding Claude ids. |
| ADAPT | R2, R10 | `LIMIT_UNIT_UNAVAILABLE` and "tokens and calls on a subscription" follow whether the **plan reports money**, not whether the account is a sign-in; estimates add the catalogue-priced range and the cold-cache cost of a switch (BR6, BR24). |
| ADAPT | R3, R5 | Civicsmith-side limits judged before the call as today, plus provider-side limits recognised after it with the provider's reset time (BR23); "refuses at limit" gains the ordered-list exception (§3). |

### `credentials` (R1–R79): almost all kept
| Verdict | R ids | What changes |
|---|---|---|
| KEEP | R12–R15, R28, R29, R31, R42, R53, R79, and every requirement not touching AI accounts | The plane's own run credentials and grant machinery are unchanged (BR §1). R29's keyed services may later share the credential-means resolver; not required. |
| ADAPT | R27, R32, R63, R66, R73 | Wording only for R27/R32/R66 ("connecting Claude" becomes "connecting an AI account"); R63/R73 revoke run credentials on any provider-issued credential cleared or refused, and on a reference that resolves to nothing (BR15, BR26). |
| RETIRE | R72 | Already scheduled by its own text. |

## 3. Rulings and requirement text that conflict (for BOB to reconcile or record; the lane decides none)
1. **K2352 / K1755 / K2353, "the account answered is the one used … never moves to the next account"** (`ai-accounts` R7, R11; `ai-use` R3; canon §6) against Bob's ordered failover (BR18). Bob has allowed failover; BOB records the exception. One point is not covered by his answer and is put to him in §7: whether a use **switched off** by its owner also moves on (BR18 lists only limit, unavailable, lapsed or cannot serve).
2. **K2353's sole-member rule** for a project sign-in (`ai-accounts` R10, R13) against plan scope as data (AIR3): one rule keyed by plan scope, with "one person" as the case R10 covers. Technical; BOB's.
3. **Sealed-only storage** (`ai-accounts` R2, R6, R10, R19, R28; the secret carried on the wire in `agent-worker` R6) against credential references [Bob] (BR13, BR15): references store only the pointer and resolve at call time.
4. **One account per owner** (`ai-accounts` R1, R5, R10) against the ordered list (BR18).
5. **D38, "never another account's money limits"** (`ai-use` R3) against the cross-owner hop with standing opt-in [Bob]: each account keeps its own limits; the opt-in record needs a home, and who may declare an order at each scope is still Bob's (`AI-PROVIDER-REQUIREMENTS.md` §10(f)).
6. **Run credential per segment** (`credentials` R63) and a mid-run hop: the hop should fall on a segment boundary so no new run credential is minted mid-segment. Technical; BOB's.
7. **Disclosure "once, before the first paid act"** (`ai-accounts` R8, R12, R23) is tied to an account; after a hop the material goes to a new recipient. Whether disclosure is per provider and host or per account is Bob's (§7).
8. **K3717** (Anthropic excluded) superseded for the design; **K3347** (no API-key work) read as about the Anthropic assistant (K3718(5)); **K3061/K3060** (held token allowed) stay Anthropic-specific and attach to the Anthropic plan profile.
9. **N1220's own text** says "none of them Anthropic's" and cites only AIR1–AIR10 as the bar; Bob has since included Anthropic and the bar has grown to AIR1–AIR40 (`AI-PROVIDER-REQUIREMENTS.md`). BOB to refresh N1220.

## 4. Stale text to fix in requirements when N1220 opens (bookkeeping, BOB's)
`agent-worker` R98 and `ai-use` R15 hard-code Claude model ids (and their tests); `agent-model` R1, R13, R19 carry Anthropic prices and ids in requirement text; `agent-worker` R35 vs R109/R110 (RUNNER vs REMOTE); `agent-worker` R72's 5 MB image limit as a constant; "group" in words people read (K3472) across the six modules.

## 5. Words people read that name Anthropic or Claude (to become catalogue-driven)
`ai-accounts` R8, R12 (notices "go to Anthropic under … API account"), R5/R10/R18/R19 vocabulary and the refusal sentences behind `ai.refused.notsole`, `ai.refused.signinnotconnected`; `ai-use` R10 ("on a subscription"), R13's `ai.refused.unitunavailable`, R15's model ids shown to owners; `credentials` R66 ("connecting Claude"), R73 ("Anthropic's refusal"); `agent-worker` R64 and R82; `agent-runner` R31's refusal words. `words.json` itself was not read by this lane (it is the UX stream's); the strings must be checked there.

## 6. A possible order of work for N1220 (the lane's suggestion; order and tranche contents are BOB's)
0. **Split `agent-worker`** (N1205) first, moving the sign-in and remote-dispatch blocks out, so nothing new lands in an over-limit module.
1. **Neutral interface in `agent-model`** with today's Anthropic API-key path as the first adapter behind it, behaviour unchanged, proven by the existing tests plus the adapter test kit and a fake provider (BR11). This is the lowest layer, proven first (K3558).
2. **Minimal catalogue** (`ai-catalogue` under Option 1): entry ids replace `MODEL_FOR_MODE`; prices and capabilities as signed data; the channel modelled on the release-notice check (instance-setup R88–R90, signatures R45–R48), which is the one signed, release-independent pull that exists today.
3. **Account and usage shape** (`ai-accounts`, `ai-use`): provider, plan, credential means; neutral usage; provider-side limits.
4. **Generic OpenAI-compatible adapter with the OpenRouter profile**, its sign-in flow (provider-issued keys) and host pinning [Bob: OpenRouter first]; then the two open OpenRouter tests through the product's own path (A9).
5. **Reference credential means** (after the Q-secrets research) and the free-tier acceptance step.
6. **The test container and suite** (`ai-gate`): T0 and T1 first, then T2 and characterization (`SUITE-REQUIREMENTS.md`).
7. **Ordered list and failover**, with hop records, labels and the opt-in.
8. **Words** made catalogue-driven, and the UX stream's screens.
Bob's sequencing puts OpenRouter first; steps 1–3 are the minimum it needs to sit on. If BOB prefers, step 4 can carry steps 2–3 in the smallest form that serves one adapter.

## 7. Questions for Bob (policy), with recommendation
**Answered 2026-10-21 [Bob]: both as recommended** (`REQUIREMENTS.md` §12): a switched-off use refuses and never moves on; disclosure is per provider and host, and a hop to an undisclosed recipient waits for the notice.
1. **Does a use its owner switched off move on to the next account in the list?** Today a switched-off use refuses. Options: (a) no, a switch-off is the owner's decision and always refuses, as today; (b) yes, it moves on like a limit. **Recommended: (a).** A switch is a choice about what the AI may do, not a limit to work around; moving on would undo the owner's choice.
2. **When work moves to an account at a different provider or host, is the member told again before material goes there?** Options: (a) disclosure is per provider and host: the first time any of a member's or team's material would go to a recipient not yet disclosed, the notice is shown and the step waits; (b) disclosure once per account, as today, so a hop to an account already disclosed needs nothing new; (c) a hop is shown (as BR19 already requires) but no new disclosure. **Recommended: (a).** It keeps the rule's purpose (people know who receives their material) when failover can change the recipient; for a non-interactive run the hop to an undisclosed recipient waits rather than proceeding.

## 8. Sources
Read whole by sonnet/medium workers, 2026-10-21: `build/requirements/agent-model.md`, `agent-runner.md`, `agent-worker.md`, `ai-accounts.md`, `ai-use.md`, `credentials.md`; `build/requirements/filing-templates.md` and, in part, `instance-setup.md` R88–R90 and `signatures.md` R45–R48 (for the catalogue channel). Lane documents: `BOUNDARY-REQUIREMENTS.md`, `AI-PROVIDER-REQUIREMENTS.md`, `NOTES.md` §Q1, `PROCESS.md` §8. `build/plan/next.md` N1220 (read by the lane).
