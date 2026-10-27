# The assistant on every screen and journey, for the beta (draft)

**Status** · READY for PLANNING, AI-DESIGN #3, 2026-10-27, revised after PLANNING's fold (§4 rows and grades, §8 and §9 new); §6 is AQ1 and AQ2 of `QUESTIONS-FOR-BOB.md`, its rows follow the recommendation until Bob answers. Source of the facts: `INVENTORY.md` (worker report, cited ids there); DEC-420 (U456, `bf152ef3f3`); `DESIGN-BRIEF.md`. Owner modules use the brief's packaging (BOB's to confirm). No design here: what a screen needs goes to UX-DESIGN through BOB. Names reconciled across the lane's drafts, 2026-10-27.

## 1. The parts of the assistant (what Gate 1 judges, what a member sees named)

DEC-420 names six parts to members; each maps to today's use kinds (`ai-accounts` R14) and harness modes (`agent-harness` `MODES`). A part an entry has not passed is refused by name for accounts on that entry (SR10; `aimoments` (f)).

| part (DEC-420 words) | `part` id [rec] | use kinds and modes it covers | needs from a model (BR3) |
|---|---|---|---|
| Asking | `ask` | `ask`, the AI half of `standing`, the charge-or-rule answer (N1258) | tools with a named final tool, schema output (`ANSWER_FIELDS`), streaming or turn-level progress |
| Drafting letters | `draft` | `draft` kinds `own_words`, `translation`, `reading`, `textcheck`, `infractiondraft`, `bearingdraft`, `statusreport`, group description; `enquire` | text with a structured result; a read tool only when a grant arrives |
| Reading inside documents | `read` | `read`, mode `extract` | long context, exact-quote output (checked in code) |
| Reading unclear pages | `transcribe` | `transcribe` | image input in a tool result |
| Working through checks and plans | `run` | `run`: modes `check`, `plan`, `investigate`; `explore` | tools, judgement schemas, sub-sessions at a cheaper entry, many turns |
| Drafting a case's account | `account` | `account`: `case_account`, `account_check` (N842) | text with sentence-indexed structured output |

These six ids are the catalogue's part list (`ai-catalogue` R14); `ai-accounts` `PART_OF_KIND` maps the nine use kinds to them.

## 2. What the assistant does on each screen and journey in the beta

"Today" is `INVENTORY.md` §1 (row numbers). Two things change on **every** row: (i) whatever the account's provider, the call goes through `agent-model`'s interface. The remote Claude Code gate (`agent-worker` R110, G-remote) is replaced by "AI path ready" for the chosen account and entry (`agent-model.health`). (ii) Every machine result carries the label of the AI that produced it (provider, model, account level; BR29), so the existing label "Draft · the assistant's, asked by {handle}" gains the AI's name. Every row also draws `aimoments` when one of its moments occurs.

| # | screen or journey | beta behaviour | part | owner modules | change from today |
|---|---|---|---|---|---|
| 1 | `answers` (Ask), Home find, the dock's ask | as today: closed-book answer, plane-checked sentence by sentence, streamed progress; refusal `ASK_CHECK_FAILED` | ask | agent-worker, answers, agent-model | multi-AI; turn-level progress where the entry cannot stream (AD37); the dock draws `ask` (s-daily R52 corrected) |
| 2 | Standing questions | query re-run without a model; AI half on new finds | ask | answers, ai-runs | provider-neutral; its 150-question bar stands unless Bob says otherwise (§6 Q1) |
| 3–4 | Assistant dock and question page ("Work on this", "Ask the assistant to look") | bounded run, modes `check`, `plan`; proposals as `suggested` versions; member accepts or declines | run | ai-runs, agent-steps, agent-worker | hops recorded per segment and drawn in the run log (with N1219's `read`/`disagree`); sub-sessions ask for a cheaper entry by capability, never a fixed model |
| 5 | Question page "Translate" | `reading` draft | draft | agent-worker, skills | multi-AI only |
| 6 | Document: "AI's reading of picture pages" | transcription, graded undetermined | transcribe | agent-worker, extraction | refused by name when the entry has no image input; the 5 MB page limit is the entry's (catalogue) |
| 7–9, 17 | "Help me write this", Who your team is, Translations, wizard "Draft it" | labelled drafts, kept only by the member's act | draft | agent-worker, wizard-scripts, translations, instance-setup | multi-AI; label names the AI |
| 10–11 | Action plan options; action drafts | `plan` run; draft kinds | run, draft | action-plans, plan-work, agent-worker | multi-AI; `action_drafts` flag as `run-rules` R27 states |
| 12 | Case editor "The account" | `case_account`, `account_check` drafts (N842) | account | agent-worker, case-account | **built in the beta** (N842 carried; the held press released) |
| 13–14 | Standards proposals, contradiction recommend | run-side proposals | run | standards, contradiction | unchanged; live only with a deployed mode that makes them |
| 15 | Exploring | `explore` runs, owner's no/ask/yes | run | question-explorer | gate stays as `question-explorer` R7 states (D11 bar) unless Bob says otherwise (§6 Q2) |
| 16 | Intake interview, "Start from" | `enquire` conversation, six answers as a labelled draft (N842) | draft | agent-worker, investigation | **built in the beta** (`POST /enquire`, `MODEL_FOR_MODE`'s place taken by the role table's capability ask) |
| 18 | Setup's AI part; Settings: `connect`, `teamai`, `projectai` | replaced by `aiproviders`, `aiconnect`, `aimine`, `aiproject` (DEC-420); setup's AI part offers "built in on your Cloudflare" as the default (AD26) | — | ai-accounts, ai-catalogue, screens-settings, instance-setup | the three alpha screens and their ops retired; installer asks for a Cloudflare credential able to create a gateway and store keys (AIR45; §5 need U5) |
| 19 | Queue and notices | machine-labelled items; limit notices | — | queue, notice-producers, ai-use | adds: provider outage, entry watch/lapsed, threshold alerts, future-dated terms (AIR39) |
| 20 | Capture requests from a run | unchanged plane fence | run | capture-requests | none |
| 21 | Journeys | the member journey connects an AI of any listed plan, then asks, drafts and runs | all | journey-check | new arms: built-in Cloudflare (no outside account), gateway-held key, a personal subscription, a hop, a part refused |
| 22 | New in the beta | the charge-or-rule answer (N1258, DEC-405 stages 0, L1, L3, L4) | ask | answers, skills | design draws it when its tranche opens (N1258); judged by Gate 1's `ask` part and by its standing accuracy measure (`draft-ai-gate.md`) |

## 3. The gates, in the beta

- **G-remote** (`agent-worker` R110, `ASSISTANT_REMOTE_NOT_READY`) is **retired**: the beta's path never needs a remote Claude Code session (`draft-agent-runner.md`). In its place, "AI path ready" for an act is: an account chosen by the cascade and order, its entry listed and offered under the checks in force, and the entry passed for the part, with `health` not `open`, `auth_failed`, `payer_unverified` or `retired`. Each failure is the matching `aimoments` moment.
- **G-bar** (`run-rules` R19, R29: an AI part reaches members only after Civicsmith's frozen set of real matters; N829: the set has no matters) would keep every part off members' copies in the beta. This is Bob's (§6 Q1).

## 4. DEC-420's 41 ops and the lane's additions (`aioptinset`, `aitermswithdraw`, `aiusebymember`, `aipayerclear`, `aipathready`, `aikeyseal`, `airunparts`, `assistantreadiness`; three Worker-only ops): owner, rung, budget class [rec, BOB's]

Rungs from `op-grades` R1 (`reversible`, `reasoned`, `terminal`, `attested`, `irreversible`) or an absence ground (R2). Every member op below is **refused to a machine** (a run never changes which AI serves it, its checks or limits); the three Worker-only ops are the exception and are served to the Worker's principal alone. Budget classes are PLATFORM's (`time-budgets-draft.md` §2), with two new classes PLATFORM proposed (P-15, §5 P1): **AI act** (acknowledged within `AI_ACT_ACK`, completes within `AI_ACT_DONE`, longer goes to the background) and **Gate 1 run** (acknowledged within `GATE1_ACK`, at most `GATE1_PER_PART_MAX` per (entry, part), never in the member-facing room's thread). The figures are proposed by PLATFORM; AI-DESIGN to confirm after the first measuring run. The long Gate 1 run needs its own class because PL2 allows overrides only downward, so no override of the AI act class can lengthen it. The ask and the draft (the assistant's `/ask` and `/draft` paths) are class AI act too. Reads are what the op or screen reads, for PLATFORM's combined read (PL4).

| op | owner | rung or ground | class | reads |
|---|---|---|---|---|
| `aiplanconnect`, `aitestopen`, `airesultsopen` | screens-settings (moves only) | none (no write) | in-app move | — |
| `aiorderset` (DEC-465: also a member's own list, Move up and Move down as a position, `draft-ai-accounts-dec465.md` R70), `aiaccountswitch`, `aimemberallow`, `aiprojectuse`, `aiprojectorder`, `aimineuse` | ai-accounts | reversible | shell act | accounts, order |
| `aiaccountremove` | ai-accounts | terminal (a removed gateway key must be entered again) | write act | accounts |
| `aicheckset`, `aiprojectcheckset`, `aimycheckset` | ai-accounts | reasoned (a check unticked loosens privacy: reason recorded) [rec] | shell act | checks, entries' answers |
| `aibudgetset`, `aiprojectbudget` | ai-use (limits and alert thresholds) | reversible | shell act | limits, use |
| `aikeyenter` | ai-accounts (to the team's Cloudflare store) | ground `credential` | write act | — |
| `aikeyseal` (DEC-465: aiconnect step 3's fifth way, "Keep it sealed in your team's Civicsmith"; `draft-ai-accounts-dec465.md` R69) | ai-accounts (seals as the seal of `ai-accounts` R24) | ground `credential` | write act | — |
| `aikeycloudflare`, `aikeyreference`, `aisignin` | ai-accounts | ground `credential` | write act | — |
| `aitermsaccept`, `aipersonalchoose` | ai-accounts | reversible (acceptance recorded with name, date, terms version; no reason is asked) | shell act | plan terms |
| `aiconnecttest` | ai-gate (`connectCheck`, T0 only, through `agent-model`; no team material) | ground `observational` | **AI act** | entry |
| `aiaccountadd`, `aiownadd` | ai-accounts | reversible | write act | catalogue, accounts |
| `aicontinue`, `aistop`, `aisend`, `aisendrefuse`, `aiwait`, `aiwithout`, `aiswitchaccount`, `aimodelchoose`, `aichooseother`, `aiaccountpick` | ai-runs (the run's or ask's own record) | reversible | shell act | the run, accounts |
| `aiaskadmin` | notice-producers | reversible | shell act | — |
| `airunstart` | ai-runs | as `airunopen` today | **AI act** | estimate |
| `aitestsetup` | ai-gate | ground `credential` | write act | — |
| `aitestrun` | ai-gate (in the team's test container) | ground `observational` | **Gate 1 run** (progress per part) | suite |
| `airesultsend` | ai-gate (to the issuer) | **irreversible** (a sent bundle cannot be recalled) | write act | bundle manifest |
| `airesultsdecline` | ai-gate | reversible | shell act | — |
| `airesultsread` | ai-catalogue (library rows) | none (read) | read act | library |
| `aioptinset`, `aitermswithdraw` | ai-accounts (added by this lane, in DEC-420's manner: no listed op covers a cross-owner opt-in or withdrawing a free-tier acceptance; DEC-465 draws `aioptinset` as the team account's `share_with_lists` and a member's `share_with_projects`, `draft-ai-accounts-dec465.md` R49) | reversible | shell act | accounts |
| `aiusebymember` (U7, K5459) | ai-use (`accountUseByMember`) | none (read) | read act | per-member use of a team or project account (to its owners) |
| `aipayerclear` | ai-accounts (an administrator clears a payer-mismatch flag after a gateway call the team's own key did not pay; refusal `PAYER_NOT_VERIFIED`, key `ai.refused.payernotverified`) | reasoned (the administrator's reason recorded) | shell act | accounts, the flag |
| `aicredential`, `aigatewayserved`, `aicredentialfailed` | ai-accounts; **Worker principal only, not a member op**, never a model tool, never logged | ground `credential` for `aicredential`; `observational` for the other two | Worker call | the act's own account |
| `airunparts` (DEC-466 U2: "How this run went"; `draft-run-record.md` R103) | ai-runs (`runParts`) | none (read) | read act | the run's parts, hops and the member's refusal |
| `assistantreadiness` (DEC-466 U3: Setup's ready state; `draft-instance-setup.md` R109, the input of §8) | instance-setup (beside `assistantstate`), reading ai-accounts `accountsOnSummary` | none (read) | read act | whether a team account is on; the projects that hold one |
| `aipathready` | ai-runs, served by agent-worker (the plane asks the Worker for `agent-model` `health(account, entry)` for an act's head account and entry; answers `ready` or the not-ready reason) | none (read) | read act | health of the head account and entry |

Words: op names keep DEC-420's spellings; "limit", never "budget", in words people read (DEC-421).

## 5. Needs from other lanes (to BOB for `MAP.md`)

- **P1 · PLATFORM (met by PLATFORM P-15):** two budget classes, **AI act** (an ask, a draft, a run start, a connect test: `aiconnecttest`, `airunstart`; acknowledged within `AI_ACT_ACK`, completes within `AI_ACT_DONE`, longer goes to the background) and **Gate 1 run** (`aitestrun`: acknowledged within `GATE1_ACK`, at most `GATE1_PER_PART_MAX` per (entry, part), never in the member-facing room's thread). Figures proposed by PLATFORM (`AI_ACT_ACK` 2 s, `AI_ACT_DONE` 60 s, `GATE1_ACK` 2 s, `GATE1_PER_PART_MAX` 30 min); AI-DESIGN to confirm after the first measuring run.
- **P2 · PLATFORM:** the assistant's declared reads (its "need" in their HANDOFF): the §4 reads column, plus per act `accountFor` + `checksInForce` + `entryOf` (one combined read, cached per session); the catalogue's size per copy (about 100 entries × 2 KB = 0.2 MB, an estimate to measure) and the gateway's log (held in the team's Cloudflare account, not the record).
- **Drawn and waiting (DEC-466, 2026-10-27):** U1, U2, U3 and U5 are drawn by DEC-466; the requirement lines it owes are `draft-run-record.md` (U1, U2), `draft-instance-setup.md` (U3, U5) and `draft-ai-accounts-dec465.md` (R73, R74). U4 (the charge-or-rule answer, waits on its tranche and Bob's Q1, Q2) and U6 (the dashboard's labels, waits on a live AI Gateway dashboard, AIR45's live test L1) are not drawn and wait.
- **U1 · UX-DESIGN:** the AI's name in every existing machine label ("Draft · the assistant's ({ai}), asked by {handle}"), on rows 1–17.
- **U2 · UX-DESIGN:** a hop and the AI that served each segment, in the run log (row 3–4; N1219).
- **U3 · UX-DESIGN:** "AI path ready" states in place of the alpha's last-check steps (setup, Settings); the reachable rule for a project-only account is §8.
- **U4 · UX-DESIGN:** the charge-or-rule answer (N1258) when its tranche opens.
- **U5 · UX-DESIGN:** the installer's ask for a Cloudflare credential able to create a gateway and store keys (AIR45), with why, in plain words.
- **U7 · UX-DESIGN (K5459):** `aiproviders`' "Limits and alerts" and `aiproject` show per-member use and cost on accounts the team or project pays for (`op=aiusebymember`, owner `ai-use`, rung none (read), class read act); DEC-420's "names no member" no longer holds there. `aimine` unchanged (a member's own use, private).
- **U6 · UX-DESIGN (owed by DEC-420):** `aiconnect`'s dashboard labels checked against a live dashboard (this lane can do it once a credential with AI Gateway access exists; Bob's act otherwise); a catalogue row for the "through a gateway" type (`draft-ai-catalogue.md`).

## 6. For Bob (through BOB, written for him on `QUESTIONS.html`)

**Q1 · What lets an AI part reach members in the beta.** Today a part reaches members only after it passes Civicsmith's set of real public matters with answers written by people (D14), and that set is empty (N829), so in the beta no member could use the assistant at all.
- A · keep the rule; nothing reaches members until Bob supplies or approves the matters (N1258 says he may) and each part passes them.
- B · *(recommended)* an AI part reaches members once the AI chosen has passed Civicsmith's own capability test for that part (Gate 1, made of invented cases scored by code, AD7, AD13). The real matters, once written, become the standing accuracy measure N1258 asks for, shown to teams, and a part that falls below its bar there is withdrawn.
- C · let members use untested parts with an "untested" label, as test copies do today.
Why B: it gives the beta a working assistant without waiting on a hand-written set, and it still holds every AI to a measured bar. A alone would hold the whole assistant back. C drops the bar.

**Q2 · Which parts the beta offers.** "Full support for the assistant" (K5417). Today only asking, drafting, page reading, checks and plans are built; investigating, extracting and exploring are off behind their own bars (D11: at most 20% false alarms).
- A · *(recommended)* the beta offers every part that is built, plus the intake interview and the case's account (N842) and the charge-or-rule answer (N1258). Investigating, extracting and exploring stay behind their own bars and turn on per AI when an AI passes them.
- B · as A, and the beta also builds and turns on investigating, extracting and exploring now.
Why A: those three have their own accuracy bars Bob set; they open per AI as soon as one passes, with no new decision.

## 7. Names

The canonical set, one owner each; a caller uses the owner's spelling. Brief §2 predates it (its plan `runtime` is `runtimes`, its means list gains `none`).

| name | owner module | meaning |
|---|---|---|
| `entry`, `entry_id` | ai-catalogue | a model at a host; `entry_id` is the only model name above the adapters |
| `entryOf(entry_id)` | ai-catalogue | the entry whole with effective state, recipient and release need; `null` if unknown |
| `plansOf({provider?, entry_id?, plan_id?})` | ai-catalogue | plan rows: levels, constraints, `terms_version`, `warning_version`, `offered` and reasons |
| `entriesFor({part, checksInForce, at?})` | ai-catalogue | the closed list of entries offered for a part |
| `whyNotOffered({entry_id, part, checksInForce})` | ai-catalogue | every reason an entry is not offered, as codes |
| `profileOf(id)`, `registerAdapterTypes` | ai-catalogue | a host profile (with `key_shapes`); the adapter types and versions a copy serves |
| entry fields | ai-catalogue | `served_ids`, `effort_set`, `effort_classes` (`low`, `medium`), `standard_task_costs` (by part), `prices` (with `date`), `zero_retention`, `limits` (`context_stated`, `context_effective`, `max_output`, `image_max_bytes`), `adapter_type`, `profile`, `pin`, `checks` P1..P7, `gate[part]`, `lifecycle` |
| plan fields | ai-catalogue | `plan_id` (an account's `plan`), `kind`, `scope` (`member`, `project`, `team`, `unconfirmed`), `means_allowed`, `runtimes`, `money` (`reported`, `priced`, `none`, OPEN), `token_bounds`, `free_tier_trains`, `terms_version`, `warning_version` |
| part ids | ai-catalogue | `ask`, `draft`, `read`, `transcribe`, `run`, `account` (§1); the nine use kinds map to them by `PART_OF_KIND` (ai-accounts) |
| lifecycle; grades | ai-catalogue | `listed`, `watch`, `lapsed`, `retired`; `REPRODUCED`, `REPORTED`, `STATED` |
| means | ai-catalogue, ai-accounts | `gateway`, `sealed`, `reference`, `issued`, `none` (built-in AI, no credential) |
| level | ai-accounts | `member`, `project`, `group` in code (words say team); plan scope `team` serves level `group` |
| capability names | agent-model | `tools`, `parallel_tools`, `schema_output`, `schema_with_tools`, `image_input`, `streaming` (`none`, `text`, `tool_calls`), `session`, `caching`, `batch` |
| `turn`, `converse`, `capabilities`, `estimate`, `health` | agent-model | one neutral turn; a bounded conversation; what an entry can do; cost range (`measured`, `price_only`, `not_known`); path state |
| `entryFor(account, role, need)`, `serves` | agent-model | the entry chosen from the account's allow-list for a role's `need {capabilities, cost}`; whether an entry meets a need |
| outcomes; `label`; `usage` | agent-model | `result`, `silent`, `refused`, `limit`, `error`; `{provider, host, model_version, effort, account_level, owner}`; the neutral usage record |
| health states | agent-model | `ok`, `degraded`, `open`, `half_open`, `auth_failed`, `payer_unverified`, `retired`, `unknown` |
| error classes | agent-model | `rate_limit`, `provider_limit`, `overload`, `timeout`, `auth`, `model_gone`, `content_refusal`, `malformed`, `pin_violation`, `unsupported_control`, `request_rejected`, `circuit_open` |
| `ROLE_NEEDS`, `partOf`, `disclosureGate` | agent-harness | a role's `need`; role to part id; whether a recipient is disclosed |
| `accountFor({member, act})` | ai-accounts | the account serving an act: `account_id`, `level`, `owner`, `provider`, `plan`, `means`, `entry_id`, `entries`, `personal`, `disclosed` |
| `hopFor({member, act, from, reason, at_step_boundary})` | ai-accounts | the next pair down the owner's list; reasons `limit`, `unavailable`, `lapsed`, `capability`, `auth`, `member_switch`; `payer_change` is `{from_owner, to_owner}` or null |
| `checksInForce({project, member, act})` | ai-accounts | the checks binding a piece of work (team locks, project ticks, member's own) |
| `gatewayServedCheck`; flag | ai-accounts | the payer check per gateway call, reached by the Worker as `op=aigatewayserved`; a mismatch keeps the answer, flags the account, refuses later calls `PAYER_NOT_VERIFIED` until an administrator clears it with `op=aipayerclear` (pending Bob, `QUESTIONS-FOR-BOB.md`); an auth failure is `op=aicredentialfailed`, the credential `op=aicredential` |
| `aipathready` | ai-runs, agent-worker | the plane's read of `agent-model` `health(account, entry)`; `ready` or the not-ready reason |
| `GROUP_NEEDS`, `gateRecord`, `partAdmittedOn` | ai-gate (`partAdmittedOn` run-rules) | groups each part needs; the verdict record (`verdict` `passes`, `passes_with_limits`, `not_suitable`, `not_yet_rated`; `limits` `{kind, value}`; `suiteVersions`); admission of a part for an entry |
| limit kinds | ai-gate | `context_depth`, `no_image_input`, `no_streaming`, `no_parallel_tools`, `output_cap` |
| `connectCheck`, `selectItems`, `scanForSecrets` | ai-gate | T0 connect probe; items from a challenge's `selection_seed`; secret scan with the host profile's `key_shapes` |
| `countUsage`, `useCheck`, `useEstimate`, `AI_LIMIT_REACHED` | ai-use | usage counted by `entry_id` and `label`; the limit judgement (`source` own or provider, `walkable`); cost before; the one limit refusal |
| challenge; `receipt_id` | ai-issuer | `{challenge_id, nonce, bank_version, selection_seed, issued_at, expires_at}`, unsigned; a bundle's receipt |
| refusal codes | the minting module | upper snake; one site each (K231); `IMAGE_DIGEST_MISMATCH` (issuer) is apart from `DIGEST_MISMATCH` (catalogue payload) |
| word keys | the screens | `ai.refused.<code, lower case, no underscores>`; `ai.catalogue.state.<state>`; `ai.choice.*`; `gate.*` (the suite's own); `gate.runner.refused.<CODE>` (the container) |
| ops | draft-assistant-screens §4 | DEC-420's spellings (`aiaccountadd`, `aiownadd`, `aiorderset`, `aicheckset`, `aikeyenter`, `aitermsaccept`, `aisend`, `aicontinue`, `aistop`, ...); `aioptinset`, `aitermswithdraw`, `aiusebymember`, `aipayerclear`, `aipathready` added |

## 8. interface-shell R20 (AMEND)

- **R20** (T53; DEC-420; AIR5; U3; amends R20) The assistant is **reachable** for a member when `op=assistantstate` answers `on: true` and `op=aipathready` answers `ready` for some act of hers on any account the cascade can choose for it: her own, a project's she has joined, or the team's, a project-only account included (the plane resolves each act's head account and entry with `ai-accounts.accountFor` and asks the agent Worker for `agent-model`'s `health(account, entry)`; one combined read, cached per session). While reachable, the masthead's assistant button opens the dock with the panel `screens-inquiry` registers, beside the screen it serves; while not, no assistant control is drawn anywhere (absent, not greyed). Each read that does not answer is taken as not reachable. The alpha's three reads (`op=accountreference`, `op=subscriptionsignin` `{step: "state"}`, `op=groupkeystate`) are no longer asked, and the answer names no other member's account. Test: a member whose only account is a joined project's, with a ready path, is shown the button; a member with the team's account only, likewise; control: the same member when every path answers a not-ready reason (for example `auth_failed`), or when `on` is false, or whose only account is another member's personal subscription, is shown no assistant control anywhere; an unanswered read draws none.

## 9. Retired: the alpha's AI ops and screens

One list. Each is removed with no alias in the round that re-points its callers (`ai-accounts` For BOB 6); `[rec]` mappings are design's to confirm.

| retired | what it was | replacement |
|---|---|---|
| screen `connect` | the member's own connect screen | `aimine`, with `aiconnect` for the connect steps (DEC-420) |
| screen `teamai` | the team's AI key screen | `aiproviders` (DEC-420) |
| screen `projectai` | the project's AI key screen | `aiproject` (DEC-420) |
| `groupkeyset` | `ai-accounts` R35: the team enters its key | `aiaccountadd` (team), `aikeyenter` for a gateway key |
| `groupkeyremove` | `ai-accounts` R35 | `aiaccountremove` |
| `groupkeyswitch` | `ai-accounts` R35 | `aiaccountswitch` |
| `groupkeynoticeseen` | `ai-accounts` R35: the once-only notice of the key going to Anthropic | `aisend` (carries the recipient notice, per provider and host) |
| `accountreferenceset` | `ai-accounts` R35: a member's own account | `aiownadd` |
| `accountreferenceremove` | `ai-accounts` R35 | `aiaccountremove` |
| `subscriptiondisconnect` | `ai-accounts` R35: disconnect a sign-in | `aiaccountremove` (an `issued` account is disconnected by removal) |
| `projectkeyset` | `ai-accounts` R36: a project's key | `aiaccountadd` (project) |
| `projectsigninset` | `ai-accounts` R36: a project sign-in account | none (project sign-in accounts end, AIR41) |
| `projectaccountremove` | `ai-accounts` R36 | `aiaccountremove` |
| `projectaccountswitch` | `ai-accounts` R36 | `aiaccountswitch` |
| `projectkeynoticeseen` | `ai-accounts` R36 | `aisend` |
| `subscriptionsignin` (steps start, code, state, signout) | `signin-door`: the sign-in relay to `agent-worker`'s `POST /signin` | `aisignin` (the adapter's connect flow for an `issued` account) |
| `agent-worker` `POST /signin`, `REMOTE` (R66, R67, R81-R85, R109, R111) | the Claude sign-in relay and remote route | the Anthropic adapter's connect flow and remote adapter behind `agent-model` (`draft-agent-run-path.md`) |
| `agent-runner` `POST /signin`, `/signin/code`, `/signin/state`, `POST /signout`, the conversation connection, the `RemoteSession` stub (R1-R4, R17-R28, R31, R32, R35-R42) | the Claude Code container's routes | `POST /run` and its routes (`draft-agent-runner.md` R43) for the Gate 1 test container; none for a member's sign-in |
| `groupkeystate`, `accountreference` (reads), `subscriptionsignin` `{step: "state"}` | the alpha's reachable rule (`interface-shell` R20) | `aipathready` (§8); `accountState` and `accountsOf` for the settings screens |

