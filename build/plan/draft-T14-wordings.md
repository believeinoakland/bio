# T14 wordings: N128 (with N202), N325, N326, N327, N329, N330, N331, N335, N339, N340 (a worker for BOB #65, 2026-09-29; P18)

Read on `tranche/T13` @ ff11386715 (T13 open, no job merged). Not folded. Each id below is the next free one in its file, counted after T13's folded wordings (membership R85 is N332's). None of these files marks a retired id at or above those numbers. Publication's R48–R61 appear only in its pre-approval "Old ids" map (README 6), so they are not retired ids.

| file | next free id | used by |
|---|---|---|
| membership | R86 | N329 R86; N335 R87 |
| promotion | R51 | N340 R51 |
| bias | R44 | N326 R44 |
| monitoring | R47 | N330 R47, R48; N339 R49 |
| queue | R41 | N325 R41 |
| progressions | R36 | not needed |
| filings | R22 | not needed |
| ratification | R17 | N339 R17 |
| publication | R48 | N339 R48 |
| capture | R64 | N339 R64 |
| instance-setup | R43 | N339 R43 |
| control-plane | R35 | not needed (R23 amended) |

Codes, helpers, bounds, row numbering and the order of a read are wording under meaning Bob already holds (K238, K275, K338, K391). Places where meaning might move are marked **MEANING?**. Each one says whether it goes to Bob or stays with BOB.

**Folding.** These fold only after the T13 job that reads the same file has merged, or at T14's opening (P10). T13 jobs are reading membership.md, promotion.md, monitoring.md, queue.md, intent.md, ratification.md, instance-setup.md and control-plane.md now.

---

## 1. N128 (with N202): the two listener rows

**Finding.** The convergence N202 asked for is already done. `membership.listenerRefusal` (R81) is the only site in the tree that mints `LISTENER_MALFORMED` and `LISTENER_DECLARED` (`src/membership/index.mjs`:107–147). Every other mention is a comment or a call to it: promotion R49, extraction, content, retrieval, inquiry, capture, entities, calibration, ai-runs, provenance and reevaluation.

N128's other three rows already exist: C-102.6 `FACT_MALFORMED`, C-102.7 `STEP_MODULE_UNNAMED` and C-102.8 `STEP_DECLARED` (K229). `STEP_DECLARED` has one site, promotion's `stepDeclared` (`promotion/index.mjs`:134). **So only the two listener rows are owed.**

**Whose table (K275).** The two rows go in membership's own `MEMBERSHIP_CHECKS`, the table of the module that provides the helper. They do not go in the catalogue's `REGISTRATION_CHECKS`. They take the next free numbers of the registration family C-102, whose last row is C-102.10:

- **C-102.11** `LISTENER_MALFORMED`
- **C-102.12** `LISTENER_DECLARED`

This follows C-96.13, a membership row in a catalogue family (K343). The retired C-100.23 is not reused. **No legacy-checks job is needed.**

**membership.md, R81.** Replace "and its row's `check` and `translation` once `legacy-checks` holds the two rows (N202, N206)" with:

> and its row's `check` and `translation`: C-102.11 `LISTENER_MALFORMED` and C-102.12 `LISTENER_DECLARED`, this module's rows (K275), each `where` naming this function. *(not yet met: N128)*

**membership.md, Uses, `legacy-checks` line.** Append "; C-102.11, C-102.12 held here since N128".

**Rows for promotion to stamp:** new C-102.11 and C-102.12, both in membership's table. The d470 census is unmoved (these rows are not in the catalogue file). `ROW_CENSUS` (R50) moves.

**Translations (drafted in C-102.1/.2's words):**
- C-102.11: "A part of this instance tried to register a listener without naming itself or without a function to call, so nothing was registered. This is a fault in how the instance was built, not in the record, and nothing in the record changed."
- C-102.12: "A part of this instance tried to register a listener it had already registered, or one that another part already holds, so the second registration was refused and the first still stands. This is a fault in how the instance was built, not in the record, and nothing in the record changed."

**`where`.** Both rows are `src/membership/index.mjs listenerRefusal > is-listener-registration`. That region already exists, and the T12 guard reported it as unclaimed (legacy-tests' J1). This is the pattern where C-102.1 and C-102.2 share `registerAuditCheck`. If the DEC-49 guard needs one region per row, the job splits it into `is-listener-malformed` and `is-listener-declared`. That is BOB's call.

**Interface tests:**
- Each of the four refusal branches carries its row's `check` and `translation`: a malformed call, a thrown read, a list slot that already holds the module, and a single slot that is already held.
- `extra` cannot overwrite `check`.

**Jobs.** membership (layer 2), then promotion's stamp in the same layer (K425). Legacy-checks has an optional share: the header comment at `bio-checks.mjs`:11318–11324.

**MEANING?** None. The rows add `check` and `translation` to refusals whose code and condition are unchanged.

**T13.** T13's membership job (N324, N332) edits `index.mjs` and `checks.mjs`. T14 builds on its merge. There is no conflict inside T13.

Evidence: `src/membership/index.mjs`:100–147 (reads `REGISTRATION_CHECKS` at :112); `src/membership/checks.mjs`:19–30; `checks/bio-checks.mjs`:11318–11390; `src/progressions/checks.mjs`:15 (C-100.23 retired); `build/jobs/T12/legacy-tests.md`:15.

---

## 2. N327: four admin-only codes converge on membership R84

**Correction to the entry.** Only intent and bias mint two of these codes. `ADMIN_ONLY` (×2) and `AI_CREDENTIAL_ORG_NOT_ADMIN` are membership's own: `rescueRefusal` at :1796, `expertiseConfirm` at :1998 and `aiCredentialMint` at :2916. ai-runs and legacy-store mint none of the four.

| code | module and requirement | row |
|---|---|---|
| `ADMIN_ONLY` | membership R22, R41 through R75 | none |
| `AI_CREDENTIAL_ORG_NOT_ADMIN` | membership R62 | catalogue C-29.12 |
| `GROUP_ASPIRATION_NOT_ADMIN` | intent R9 | C-111.16 |
| `BIAS_ADOPTION_NOT_AN_ADMINISTRATOR` | bias R11 | C-26.20 |

Each tests `isAdministrator` (R64) of the stamped caller for an act that belongs to an administrator. That is R84's condition. So under K275 each answers through `notAnAdmin` and its code becomes `NOT_AN_ADMIN`.

**How "keeping its translation where it says more" fits R84.** R84's `extra` never replaces `check` or `translation`. So the translation becomes C-96.1's. What the old row said beyond that (the remedy) travels as a fixed `remedy` field in `extra`, which R84 already allows. R84 is not amended except for its list of callers.

**membership.md:**
- **R84**, its list of callers becomes: "R6, R7, R9, R10, R11, R12, R20, R22, R25, R26, R41 (and R75), R62 here, `monitoring` R30, `intent` R9 and `bias` R11. A caller whose former row said more passes it as `extra.remedy`, one fixed sentence."
- **R22** "`ADMIN_ONLY`" becomes "`NOT_AN_ADMIN` (R84)".
- **R41** and **R75**: "`ADMIN_ONLY`" becomes "`NOT_AN_ADMIN` (R84)". R75 stays byte for byte with R41.
- **R62** "refused `AI_CREDENTIAL_ORG_NOT_ADMIN`" becomes "refused `NOT_AN_ADMIN` (R84), its `remedy` naming the member-scoped credential open to every member".
- Append *(not yet met: N327)* to each.

**intent.md, R9.** "anyone else is refused `GROUP_ASPIRATION_NOT_ADMIN` (K102, as membership R62)" becomes "anyone else is refused `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84; K102, N327)". C-111.16 retires and its number is not reused. The Uses `membership` line gains `notAnAdmin` (its R84).

**bias.md, R11.** "for an instance scope, administrator authority (K102)" becomes "for an instance scope, administrator authority (K102), refused `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84; N327), its `remedy` naming a project's owners' lens". C-26.20 retires and its number is not reused.

**Rows:**
- Retired: C-111.16 (intent), C-26.20 (bias), C-29.12.
- C-29.12 is in the catalogue's `AI_CREDENTIAL_CHECKS`. Its removal is legacy-checks' share one tranche after membership stops reading it (K408 (4)'s pattern), because legacy-checks runs at layer 1, before membership.
- Until then the catalogue holds a row that nothing mints. BOB checks that `check-refusal-codes` and the census accept that by name.
- The d470 census moves when C-29.12 leaves.

**Interface tests:**
- Per site: a non-administrator gets `code: NOT_AN_ADMIN`, `check: C-96.1`, the act's fixed `detail`, and `remedy` where passed.
- R75 still equals R41 byte for byte.
- The refusal order is unchanged: R22 first; R41 after sight.

**Jobs:**
- membership (layer 2)
- bias (5)
- intent (7)
- legacy-checks (layer 1) in the following tranche: the C-29.12 row
- promotion stamps
- legacy-tests re-anchors `test/capability.test.mjs`:221, `machine-attest.test.mjs`:468 and `aicredential.test.mjs`:350

**MEANING?** (to Bob, UX): the words a member reads change.
- Four specific sentences become C-96.1's general one.
- The remedy moves to a separate field, which today's surfaces do not show.
- If Bob wants the specific sentence to stay the one shown, the alternative is to keep each code and row. That is K275's exception for conditions that differ, and it holds only if Bob rules they are different conditions.

**T13.** This depends on N324 (T13's membership job) having merged `notAnAdmin`. T13's intent job (N323) edits intent R12–R14 and R27, not R9. No conflict.

Evidence: `src/membership/index.mjs`:1794–1798, 1996–2000, 2912–2918; `src/intent/index.mjs`:266–270, `src/intent/checks.mjs`:90–94; `src/bias/index.mjs`:283–288, `src/bias/checks.mjs`:531–538; `checks/bio-checks.mjs`:6990–6998 (C-29.12), 10082–10088 (C-96.1).

---

## 3. N325: C-19.1 moves to queue as registered checks

**Decision.** Follow monitoring's C-18.5 move (R27, R42; N240) exactly:
1. queue holds `checkInboxGrammar` in `src/queue/checks.mjs`.
2. queue registers a promotion check (promotion R39) and an audit check (record-core R59).
3. The catalogue's `checkBundle` stops calling it (`bio-checks.mjs`:4770).

**Sequencing.** legacy-checks (layer 1) removes the call and keeps the export for one tranche. queue (layer 11) copies the function, registers both checks and stops importing it. The export is removed in legacy-checks' next job. Between layer 1 and layer 11, C-19.1 runs at neither the audit nor the ratify gate. That is on the tranche branch only.

**queue.md, new after R35:**

> **The task grammar** (a check registered with `promotion`, its R39, and with `record-core`, its R59)
> - **R41** A non-replay promotion carrying `data/inbox.json` whose C-19.1 grammar finds an error is refused `INBOX_REFUSED` with `findings: [{check, detail}]`; a replay is exempt; a bundle without the file is not asked. The audit (record-core R59) runs the same grammar over each bundle's `data/inbox.json` and reports each error as C-19.1, as `checkBundle` did. R23's drain runs the same function over each candidate task. It is one function at all three, never a copy (promotion R38). *(not yet met: N325)*

**queue.md, R35.** Unchanged (C-19.1 is already listed). Uses, `legacy-checks` line: "C-19.1, " goes.

**`INBOX_REFUSED` row.** Queue's table gets **C-19.2** `INBOX_REFUSED`, so the code has its translation (DEC-49). `GATHERING_REFUSED`, its precedent, has no row. That is noted for monitoring, not changed here.

**Rows for promotion to stamp:**
- New C-19.2 (queue).
- C-19.1's emission sites leave the catalogue when the export goes, which moves the d470 census.
- `checkBundle`'s composition changes in T14, so `CATALOG_VERSION` moves at T15's layer-2 stamp (N318's pattern).

**Interface tests:**
- A malformed `data/inbox.json` is refused at promote with C-19.1 findings.
- A replay is admitted.
- `auditPass` reports C-19.1 once per error, with no double count while the catalogue's call is gone.
- The drain's `refused` is unchanged (`test/m/queue/inbox.test.mjs`:52–55).
- The R35 test at :135 no longer names C-19.1 as the catalogue's.

**Jobs:**
- legacy-checks (layer 1: drop the call; next tranche: drop the export)
- queue (11)
- promotion (stamp)
- legacy-tests: `test/inbox.test.mjs`:27 imports it from the catalogue; `ratify-envelope.test.mjs`:15
- agent-worker's bundle is staled by the catalogue edit, and is regenerated at the close

**MEANING?** (BOB's, on N240's precedent):
- The ratify gate (`runGate`, called by `ratification/ops.mjs`:459) stops reporting C-19.1. ratification (layer 8) cannot call queue (layer 11).
- A malformed inbox can no longer land, because it is refused at promote, and the audit still reports it.
- A bundle already held with a malformed inbox would now pass ratification. Today it fails. C-18.5 took the same path in T9 without going to Bob.
- If BOB judges ratification must keep judging it, the gate needs a registration slot of its own. That would be a new promotion service, and it is Bob's only if it changes what a ratification means.

**T13.** T13's queue job edits R23 and the task mint (N322). The T14 fold builds on it. No overlap with R35 or R41.

Evidence: `checks/bio-checks.mjs`:4440–4545 (the function; its header says "the gate runs it at ratification"), 4770 (the call); `src/queue/index.mjs`:30, 3712–3721; `src/queue/checks.mjs`:10–11; `src/monitoring/index.mjs`:1753–1774, 2086–2087; `src/gate.mjs`:246–251 (C-18.5's departure); `build/jobs/T12/queue.md`:9.

---

## 4. N326: bias `settled`; queue R39's bias half

**bias.md, new after R43 (the heading gains `settled`):**

> - **R44** `settled({gate, since, limit})` answers the debts settled (R34–R38) at or after `since` (an instant) whose context `gate` admits (as R43), newest settled first, ties broken by run, at most `limit` (1–1,000, default 200), with `truncated` measured by reading one more. Each carries its `run`, `context_type`, `context_id`, `settled_kind` (`lens_returned`, `rerun`, `resolved`, or null for a debt settled before the kind was kept), `settled_at`, and the settling settlement's `actor` (null when no member settled it: the lens moved back or a re-run discharged it) and `reason` (a `resolved` settlement's, else null). A `since` that is not an instant answers none, and says so. It writes nothing and never throws (a read that fails answers none, `undetermined: true`, as R43). *(not yet met: N326)*

**queue.md, R39.** The text is unchanged. The mark becomes *(not yet met: N326)*. The Uses line for `bias` gains `settled` (its R44).

Queue's share:
- `#resolvedLately` reads `bias.settled({gate: viewerPredicate(viewer), since, limit: 64})`, in the window and bound it already uses.
- The `bias_debts: {read: false}` placeholder is replaced by the list, its `truncated` and `resolved_by`.
- The `test.todo` at `test/m/queue/feed.test.mjs`:293 becomes a test.

**Interface tests (bias):**
- `since` excludes an earlier settlement.
- The gate hides a debt on an unseen context.
- 201 settlements give `truncated: true`.
- A `lens_returned` settlement has `actor: null`.

**Interface test (queue):** a debt resolved by X appears as "resolved by X".

**Jobs:** bias (5), then queue (11). No rows.

**MEANING?** One point, BOB's under DEC-16's wording in R39: a debt settled by the lens moving back has no person to name. It shows `resolved_by: null` with its `settled_kind`. It never shows "nobody".

**T13.** No bias job in T13.

Evidence: `src/bias/schema.mjs`:93–105, 132–143; `src/bias/index.mjs`:922–947 (`uncleared`, the pattern); `src/queue/index.mjs`:3083–3108, 3596.

---

## 5. N329: `activeAdmins()` in a stated order

**Decision.** `activeAdmins` answers in a stated order: `created`, then member id. `memberFacts` is not widened. T12's queue record says the legacy read was `ORDER BY created, member_id` and the extraction dropped it (`build/jobs/T12/queue.md`:27). So this restores what R23 was written against.

**membership.md, new after R85:**

> - **R86** (N329) `activeAdmins()` answers the administrators (R64): the founder (`admin`) first once the instance is claimed, then every `active` member with role `admin` in the order their member rows were created, ties broken by member id. It writes nothing and never throws. (`queue` R23's "earliest active administrator" is the first member after the founder in this order.) *(not yet met: N329)*

**queue.md, R23.** "else to the earliest active administrator (`group-admin`)" becomes "else to the earliest active administrator (the first member of `membership`'s `activeAdmins` after the founder, its R86; `group-admin`)". The Uses line for `membership`: "the active administrators" becomes "`activeAdmins` (R86)".

**Interface tests:**
- Two administrators whose rows were created in the reverse of member-id order answer in created order.
- A tie is broken by id.
- The founder is first once claimed.

**Jobs:** membership (2); queue (11) for its mark and wording only (its code already takes the first non-founder). No rows.

**MEANING?** (BOB's): "earliest" means the member row's `created` (enrolment), not the date the member became an administrator. The schema keeps no promotion date. The `awaiting` and `deciders` lists (R6, R7) also become ordered, which adds determinism and changes no outcome.

**T13.** Both T13's membership job and T13's queue job (R23, N322) edit these texts. The fold waits for both to merge.

Evidence: `src/membership/index.mjs`:2194–2199 (no `ORDER BY`), 244–247; `src/membership/schema.mjs`:56 (`created`); `src/queue/index.mjs`:3684–3687.

---

## 6. N330: monitoring's two reads for queue

**monitoring.md, new after R46 (under "What reaches members"):**

> **archiveEligible(now), flagged({viewer, limit})** (N330, K406; for `queue`)
> - **R47** `archiveEligible(now)` answers what the next unranked archive tick (R20) would find eligible, asking the same questions and writing nothing: of at most 50 addresses at the floor of consecutive failures, oldest failing run first, those `capture.sourceReachability` answers `fallback_eligible`, each `{address, first_failure_since, reachability}`, with `limit` (50), `truncated` (more addresses at the floor) and `paused` (R30), stated beside them and never emptying them. It never throws. *(not yet met: N330)*
> - **R48** `flagged({viewer, limit})` answers the monitored documents (R32's addresses' documents) the viewer may see whose last tick flagged them (R8: `reeval_pending.flag` true, `source: source_status`), each `{bundleId, source_status, since}`, reading at most the first `limit` (1–200, default 200) such documents the viewer may see, in id order; a document the viewer may not see is skipped and never counted (K391); `truncated` when more follow. It writes nothing and never throws. *(not yet met: N330)*

**queue.md, R10.** "archive-fallback-eligible per address the latest archive tick answered `eligible` (monitoring R20's `archiveTick`, R31)" becomes "archive-fallback-eligible per address `monitoring.archiveEligible` answers (its R47, what the next tick would find: K406 Q2)".

**queue.md, R9.** "(monitoring R8, R31; `reeval_pending.source` and the tick's status say which)" becomes "(read through `monitoring.flagged`, its R48; its `source_status` says which)".

**Uses.** queue's `monitoring` line replaces "R8's `reeval_pending`, `archiveTick`'s `eligible` (R20)" with "`archiveEligible` (R47), `flagged` (R48)". queue stops reading `source_reachability` and front matter.

**Interface tests:**
- A 51st address at the floor gives `truncated`.
- A paused daemon still lists its eligible addresses, with `paused` set.
- A hidden flagged document is neither listed nor counted.
- A `restyled` tick is not flagged.

**Jobs:** monitoring (10), then queue (11). No rows.

**MEANING?** (BOB's):
- (a) While paused, the condition still shows. It is capture's fact about our attempts, and the pause is stated beside it.
- (b) K391's cut replaces queue's current "200 ids, then filter". That is a bound, which is wording (K338).

**T13.** T13's monitoring job edits R30 (N324) in the same file and `index.mjs`, in another region. Fold after it merges.

Evidence: `src/monitoring/index.mjs`:1461–1469 (`floor`), 1503–1540 (`archiveTick`), 1149 (`subjects`); `src/queue/index.mjs`:1951–2050, 2101–2102.

---

## 7. N331: filings reads `producingGroup` itself

**Decision.** Follow strength's factory pattern (`strength/index.mjs`:982–985): `filingsOf` defaults `producingGroup` to `promotionOf(host).fact("producingGroup")`. legacy-store's line at `store.mjs`:588 drops the argument (K409). `build/modules.json`: filings' `uses` gains `promotion`, an earlier module.

**filings.md, R3.** "the producing group;" becomes:

> the producing group (`promotion`'s fact `producingGroup`, promotion R40; while no provider answers, `FACT_UNAVAILABLE` or `FACT_FAILED`, the blank is left unfilled as undetermined, never as unrecorded);

Append *(not yet met: N331)*. Uses gains "`promotion`: `fact("producingGroup")` (R3; N331)".

**Interface tests:**
- With the fact registered, `group` is filled from it.
- With no provider, `unfilled` names `group` as undetermined.

**Jobs:** filings (9); legacy-store (10) removes the line. No rows.

**MEANING?** None. Today's code says "no producing group is recorded" when the fact is unavailable (`filings/index.mjs`:352–353). R3 already separates "no value" from "undetermined", and this puts the code in line with R3.

**T13.** T13's legacy-store job (N328) edits `store.mjs` elsewhere. No filings job in T13.

---

## 8. N335: rows for `NOT_A_PARTICIPANT` and `NOT_PROPOSED`

**What the code shows.** Four sites mint `NOT_A_PARTICIPANT` for three conditions:
- (i) the **caller** holds no participation: membership R35 `projectLeave` (:1676) and promotion R43 `forkProject` (`promotion/index.mjs`:854);
- (ii) the **named target** holds none: R36 `projectRemove` (:1722);
- (iii) the **named target has not joined** (invited or leaving too): R39 `projectOwnerAdd` (:1758).

Under K275 a code names one condition. `TARGET_NOT_AN_ADMIN` is the caller/target precedent.

- `NOT_A_PARTICIPANT` keeps condition (i), with one helper in membership, the earliest module.
- (ii) is renamed `TARGET_NOT_A_PARTICIPANT` (one site).
- (iii) is renamed `TARGET_NOT_JOINED` (one site).
- `NOT_PROPOSED` (R6, :2294) has one site and one condition, so it keeps its code.

**membership.md, new after R86:**

> **notAParticipant(projectId, by, extra?) → refusal** (N335, K275; a module-level function)
> - **R87** The one answer to one condition: the caller `by` holds no participation in the project (Membership v2 §7.12). It answers `{ok: false, reason: "NOT_A_PARTICIPANT", code, check, translation, project, detail}`, `detail` one fixed sentence; `extra` adds a caller's own fields and never replaces these. R35 here and `promotion` R43 answer through it. Its row is this module's C-56.3. It writes nothing and never throws. *(not yet met: N335)*

**Other membership texts:**
- **R35** "`NOT_A_PARTICIPANT`" becomes "`NOT_A_PARTICIPANT` (R87)".
- **R36** "`NOT_A_PARTICIPANT`" becomes "`TARGET_NOT_A_PARTICIPANT` (C-56.4)".
- **R39** "`NOT_A_PARTICIPANT` unless the target has joined" becomes "`TARGET_NOT_JOINED` (C-56.5) unless the target has joined".
- **R6** "`NOT_PROPOSED`" becomes "`NOT_PROPOSED` (C-96.14)".
- Mark each *(not yet met: N335)*.

**promotion.md, R43.** "`NOT_A_PARTICIPANT` for a `by` with no participation" becomes "`NOT_A_PARTICIPANT` through `membership.notAParticipant` (its R87) for a `by` with no participation". Uses, `membership` line, gains `notAParticipant` (R87).

**Rows (all new, in `MEMBERSHIP_CHECKS`; promotion stamps them):**
- C-56.3 `NOT_A_PARTICIPANT`
- C-56.4 `TARGET_NOT_A_PARTICIPANT`
- C-56.5 `TARGET_NOT_JOINED`
- C-96.14 `NOT_PROPOSED`

C-56 is the family for a person's position in a project, whose rows C-56.1 and C-56.2 are the catalogue's (the K343 pattern). None is retired. The rows they borrowed belonged to other modules and keep their own codes (K380).

**Interface tests:** each code with its row, at each site. Promotion's fork uses membership's row.

**Jobs:** membership, then promotion (both layer 2, K425). affordances' comment at `affordances.mjs`:1826 names the codes and is updated by its next job. legacy-tests re-anchors.

**MEANING?** (BOB's; codes are interface detail, K238): (ii) and (iii) change the code a client sees. If BOB judges (i) and (ii) one condition ("the member named holds no participation"), C-56.4 folds into R87. The draft follows the `TARGET_NOT_AN_ADMIN` precedent.

**T13.** The membership and promotion jobs are open. Fold after both merge.

---

## 9. N339: every relay answers a store refusal with its status

**Sites that answer `!answered` as `storeSilent` today, and so turn a refusal below 500 into 502:**

| module | relays | where |
|---|---|---|
| instance-setup | 8 | `setup.mjs`:2475, 2479, 2487, 2496, 2569, 2580, 2588, 2610 |
| ratification | 7 | `ratification/ops.mjs`:92, 176, 207, 348, 427, 451, 700 |
| publication | 4 | `publication/worker.mjs`:392, 405, 522, 633 (a thrown `StoreSilent`) |
| capture | 4 | `capture/ops.mjs`:27, 106, 135; `doorbell.mjs`:96 |
| monitoring | 1 | `monitoring/index.mjs`:2137 |
| legacy-index | 10 | `index.mjs`:238, 259, 341, 375, 448, 506, 566, 571, 586, 690 |

`selftest` (`setup.mjs`:2536) and the post-commit sub-reports (`publication/worker.mjs`:336–344) are reports, not relays. They stay.

**control-plane.md, R23.** Append:

> Every handler that relays a store answer, whichever module holds it, answers so: the plane hands it `storeRefusal` with `doAnswer` and `storeSilent`, and a `refused` answer is relayed through it, never as `STORE_DID_NOT_ANSWER` (N339).

**One line in each relaying module:**
- ratification **R17**
- publication **R48**
- capture **R64**
- instance-setup **R43**
- monitoring **R49**

The text of each:

> - **Rn** (N339, K421) A store answer this module's Worker handlers relay that is the store's own refusal (`control-plane` R23: `ok: false` below 500) is answered with the store's status, code and sentence through `storeRefusal`; only a reply that is no answer is `STORE_DID_NOT_ANSWER`. *(not yet met: N339)*

legacy-index has no file. Its share is code only.

**Interface tests (each module):** a stub store answering `{ok: false, reason: "BAD_JSON"}` at 400 through each relay gets 400 and `BAD_JSON`. A 500 `{ok: false, error}` still gets 502 with no stack (R30).

**Jobs:** capture (3), ratification and publication (8), monitoring (10), instance-setup, legacy-index (11). No rows.

**MEANING?** None (K421 fixed the meaning). One point is BOB's: for a sub-read inside a longer act (ratify's `gatefacts`, `image`, `list`; `runtime`'s three reads), relaying the store's refusal makes the act answer the sub-read's status and code. The alternative is to keep the act's own 502 for sub-reads and relay only the final write's refusal.

**T13.** N333 (T13 control-plane) moves the store's door to `dispatch.mjs`. K422 holds the 500-and-above case until N333. Word T14's R23 on N333's merged text. T13's ratification job (N251) edits a test only.

---

## 10. N340: one list of dispositions

**Decision.** promotion (layer 2) cannot read progressions (layer 5; P4). promotion R24 already defines "reopenable" as "a disposition (`deferred`, `dismissed`: `REOPENABLE_FROM`)", so these are one fact, not two sets. Under K275 the earliest module holds the one list:
- promotion provides `DISPOSITIONS`, frozen, and `REOPENABLE_FROM` is the same array.
- progressions R35 re-exports promotion's list instead of holding its own.
- inquiry, affordances and basis-versions keep re-exporting through progressions and inquiry, unchanged.
- `build/modules.json`: progressions' `uses` gains `promotion`.

**promotion.md, new after R50:**

> **`DISPOSITIONS`, `REOPENABLE_FROM`** (N340, K275; constants)
> - **R51** `DISPOSITIONS` is the frozen list `["deferred", "dismissed"]`, the decisions a member may record about a question (D-79), and the one list of them: `progressions` R35 re-exports it. `REOPENABLE_FROM` (R24) is the same frozen array. *(not yet met: N340)*

**promotion.md, R24.** "`REOPENABLE_FROM`" becomes "`REOPENABLE_FROM`, R51".

**progressions.md, R35.** "(`DISPOSITIONS`, exported as the one list)" becomes "(`DISPOSITIONS`, `promotion`'s one list, its R51, re-exported here)". The "Vocabulary" Suggestion is updated to match. Uses gains `promotion`: `DISPOSITIONS` (its R51).

**Interface tests:**
- `REOPENABLE_FROM === DISPOSITIONS`, and it is frozen. It is mutable today (`promotion/index.mjs`:41).
- progressions' export is promotion's by identity.

**Jobs:** promotion (2), progressions (5). No rows.

**MEANING?** None today, because the two lists are the same words. If Bob ever adds a disposition that should not be reopenable, R24 will need its own set again.

**T13.** T13's promotion job edits `gate.mjs` and `index.mjs` (N318, N319, N322). Fold after it merges.

---

## Jobs T14 needs for these entries

| layer | module | entries |
|---|---|---|
| 1 | legacy-checks | N325's call; C-29.12 and N325's export in the tranche after |
| 2 | membership | N128, N327, N329, N335 |
| 2 | promotion | N335, N340, the stamp |
| 3 | capture | N339 |
| 5 | bias | N326, N327 |
| 5 | progressions | N340 |
| 7 | intent | N327 |
| 8 | ratification | N339 |
| 8 | publication | N339 |
| 9 | filings | N331 |
| 10 | monitoring | N330, N339 |
| 10 | legacy-store | N331 |
| 11 | queue | N325, N326, N329, N330 |
| 11 | instance-setup | N339 |
| 11 | legacy-index | N339 |
| last | legacy-tests | the re-anchors named above |

## Questions for Bob

The only item that goes to Bob is N327's change to the words members see. Every other **MEANING?** point above is BOB's.
