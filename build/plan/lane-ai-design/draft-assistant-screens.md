# The assistant on every screen and journey, for the beta (draft)

**Status** · DRAFT, AI-DESIGN #3, 2026-10-27. READY once Bob answers §6's two questions (through BOB, K5426). Source of the facts: `INVENTORY.md` (worker report, cited ids there); DEC-420 (U456, `bf152ef3f3`); `DESIGN-BRIEF.md`. Owner modules use the brief's packaging (BOB's to confirm). No design here: what a screen needs goes to UX-DESIGN through BOB.

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

- **G-remote** (`agent-worker` R110, `ASSISTANT_REMOTE_NOT_READY`) is **retired**: the beta's path never needs a remote Claude Code session (`draft-agent-runner.md`). In its place, "AI path ready" for an act is: an account chosen by the cascade and order, its entry listed and offered under the checks in force, and the entry passed for the part, with `health` not `down`. Each failure is the matching `aimoments` moment.
- **G-bar** (`run-rules` R19, R29: an AI part reaches members only after Civicsmith's frozen set of real matters; N829: the set has no matters) would keep every part off members' copies in the beta. This is Bob's (§6 Q1).

## 4. DEC-420's 41 ops: owner, rung, budget class [rec, BOB's]

Rungs from `op-grades` R1 (`reversible`, `reasoned`, `terminal`, `attested`, `irreversible`) or an absence ground (R2). Every op below is **refused to a machine** (a run never changes which AI serves it, its checks or limits). Budget classes are PLATFORM's (`time-budgets-draft.md` §2), with one new class asked for (§5 P1). Reads are what the op or screen reads, for PLATFORM's combined read (PL4).

| op | owner | rung or ground | class | reads |
|---|---|---|---|---|
| `aiplanconnect`, `aitestopen`, `airesultsopen` | screens-settings (moves only) | none (no write) | in-app move | — |
| `aiorderset`, `aiaccountswitch`, `aimemberallow`, `aiprojectuse`, `aiprojectorder`, `aimineuse` | ai-accounts | reversible | shell act | accounts, order |
| `aiaccountremove` | ai-accounts | terminal (a removed gateway key must be entered again) | write act | accounts |
| `aicheckset`, `aiprojectcheckset`, `aimycheckset` | ai-accounts | reasoned (a check unticked loosens privacy: reason recorded) [rec] | shell act | checks, entries' answers |
| `aibudgetset`, `aiprojectbudget` | ai-use | reversible | shell act | limits, use |
| `aikeyenter` | ai-accounts (to the team's Cloudflare store) | ground `credential` | write act | — |
| `aikeycloudflare`, `aikeyreference`, `aisignin` | ai-accounts | ground `credential` | write act | — |
| `aitermsaccept`, `aipersonalchoose` | ai-accounts | reasoned (acceptance recorded with name, date, terms version) | shell act | plan terms |
| `aiconnecttest` | agent-model (T0 connect probe, no team material) | ground `observational` | **AI act** (§5 P1) | entry |
| `aiaccountadd`, `aiownadd` | ai-accounts | reversible | write act | catalogue, accounts |
| `aicontinue`, `aistop`, `aisend`, `aisendrefuse`, `aiwait`, `aiwithout`, `aiswitchaccount`, `aimodelchoose`, `aichooseother`, `aiaccountpick` | ai-runs (the run's or ask's own record) | reversible | shell act | the run, accounts |
| `aiaskadmin` | notice-producers | reversible | shell act | — |
| `airunstart` | ai-runs | as `airunopen` today | AI act | estimate |
| `aitestsetup` | ai-gate | ground `credential` | write act | — |
| `aitestrun` | ai-gate (in the team's test container) | ground `observational` | AI act, long (progress per part) | suite |
| `airesultsend` | ai-gate (to the issuer) | **irreversible** (a sent bundle cannot be recalled) | write act | bundle manifest |
| `airesultsdecline` | ai-gate | reversible | shell act | — |
| `airesultsread` | ai-catalogue (library rows) | none (read) | read act | library |

Words: op names keep DEC-420's spellings; "limit", never "budget", in words people read (DEC-421).

## 5. Needs from other lanes (to BOB for `MAP.md`)

- **P1 · PLATFORM:** a budget class for an **AI act** (an ask, a draft, a run start, a connect test). Proposed: first progress event within 2 s; a checked answer within the entry's characterized turn latency times the part's turn budget, shown as a stated wait. Today's classes have none.
- **P2 · PLATFORM:** the assistant's declared reads (its "need" in their HANDOFF): the §4 reads column, plus per act `accountFor` + `checksInForce` + `entryOf` (one combined read, cached per session); the catalogue's size per copy (about 100 entries × 2 KB = 0.2 MB, an estimate to measure) and the gateway's log (held in the team's Cloudflare account, not the record).
- **U1 · UX-DESIGN:** the AI's name in every existing machine label ("Draft · the assistant's ({ai}), asked by {handle}"), on rows 1–17.
- **U2 · UX-DESIGN:** a hop and the AI that served each segment, in the run log (row 3–4; N1219).
- **U3 · UX-DESIGN:** "AI path ready" states in place of the alpha's last-check steps (setup, Settings), and the reachable rule (`interface-shell` R20) for a project-only account.
- **U4 · UX-DESIGN:** the charge-or-rule answer (N1258) when its tranche opens.
- **U5 · UX-DESIGN:** the installer's ask for a Cloudflare credential able to create a gateway and store keys (AIR45), with why, in plain words.
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
