# The declaration pass of the T51 fix round (K4168; mechanics §5.10, P7)

**Status** · Planned 2026-10-20 for BOB #229; replaces the planning draft's 32 declaration-only jobs (BOB's review). Companion of `build/plan/fix-round-T51.md`. Run once, by one worker, after wave 1 has merged and before wave 2 starts.

## 1. What it does

Wave 1 defines the shape in which an owning module declares an op beside its ops map: `DECLARED_OPS`, per op `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}` (`op-declarations` and `op-grades` requirement lines of wave 1 fix the spelling), with `test-support`'s `declaredOpHolds` and `declaredOpsOf`, and `interface-shell`'s guard that compares every screen act's request with the owner's declared fields and counts the undeclared. The pass declares, in every other owner, the ops this round's screens call, so that wave 2's screen jobs are checked against real declarations from their first test. It exists because writing a declaration is the same act in every module and was planned as 32 jobs, which is the fan-out K3268 and K3269 forbid.

## 2. Preconditions (mechanics §5.10 (1) and (2))

- Wave 1 (`test-support`, `bundler`, `op-grades`, `op-declarations`, `interface-shell`) is merged on `tranche/T51`; the guard's census runs and prints the ops screens send that no owner declares (`declared N of M ops`, with the sending screen and op for each undeclared one).
- No job is running: no module job, no restart pending. The worker runs in BOB's session on the tranche branch; it spawns no other worker beyond what it needs for reading and names model and effort (sonnet, medium; K3518).

## 3. The rule, applied the same way in every module

For each op `X` in the guard's undeclared list:

1. **Owner.** `X`'s owner is the module whose ops map (or whose arm in `control-plane/owner-ops.mjs`, noted) serves it. **Skip** `X` if its owner has a wave-2 job (section 5 of the plan lists them: they declare their own ops in their entries). Skip ops no screen of this round sends.
2. **Class, mutating, weight, description.** Copy them from the op's existing rows: `op-declarations` (its spec, class lists, stamps), `op-grades` (rung, `RUNG_ABSENT` or `NON_ACTS` reason) and the description key the op already carries (registry label key or act help). Copy, never choose. If two rows disagree, or an op has no row, **judgment** (step 5).
3. **Fields.** Read the owner's arm for `X` whole. `accepts` is every field name the arm reads from `url` and `body`, except the stamps `viewer`, `author`, `by`, `identity`, `proposer` and the shell's `reason` field (kept only where the arm reads a `reason` of its own). `requires` is each field the arm refuses without, as the refusal names it; a refusal satisfied by any of several fields is a list of alternatives. If the arm passes a whole body on, builds field names at run time, or refuses for a reason the declaration cannot state, **judgment**.
4. **Declare and prove.** Add `X` to the owner's `DECLARED_OPS` (create it beside the ops map if the module has none), one new test file `declared-ops.test.mjs` in the owner's tests that calls `declaredOpHolds` for each op the pass declared (only its `requires`; without each; with a field outside `accepts`), and the requirement line the wave-1 text gives (next free id, marked not yet met: T51, named in the test). Touch nothing else in the module.
5. **Judgment.** The worker declares nothing for that op, writes it in the pass record (module, op, the sentence that stopped it), and BOB gives the module its own wave-2 job (haiku; sonnet if it blocks) whose entry is that op, ahead of the screen that sends it in the merge order. Cases the plan already expects: an arm that disagrees with its requirement (the checks in section 6), and `wizard-scripts`' `writinghelp`, which the door routes itself.
6. **Never** change an arm's behaviour, weaken a declaration to make a screen pass, edit another module's hand rows, or drop a module to make a run green.

## 4. How the module list is drawn

From the guard's census after wave 1 (`declared.test.mjs`): its undeclared ops, each with the sending screen, grouped by owner; minus the owners that have a wave-2 job. The worker reads the output; no list is kept by hand. For BOB's cross-check only (the census is the input), the planning read of the registry expects these owners and ops:

| module | ops | sent by | also check in the same read (a mismatch is a judgment) |
|---|---|---|---|
| `promotion` | `reopen`, `promote` | `screens-inquiry` (question: reopen a concluded finding with a reason, C9) and `screens-settings` (bias: `promote`, as the drawing uses it, C47) |  |
| `provenance-routes` | `provenanceroute` | `screens-inquiry` (document: whether the route to the group can be shown, C24) |  |
| `capture` | `acquire`, `reattest`, `captureaccount` | `screens-intake` (capture: keep the page as the site sent it or as a visitor saw it, C19) and `screens-publish` (the ceremony: ask for the second confirmation again, or give the capturing member's signed account, C6) | `acquire` renders only on `render: true` (acquisition/index.mjs:720-724), and the web-archive arm is refused to members (:612-615): declare `render` and confirm the refusal for the archive arm names itself (the screen says so in words, it cannot do it). |
| `doorbell` | `knock`, `knocksof` | `screens-publish` (doorbell: the receipt and the made secret, C16) and `screens-intake` (inbox: the knocker's other material, C17) | `knock`'s answer carries `knockId`, `sha256`, `bytes`, `pseudonym` and `secret` (doorbell/door.mjs:127, 142-146) and the page must send `generateSecret: true` to have one made: declare `generateSecret` and `knockerSecret` as alternatives for the secret. |
| `sources` | `sourcedisclose`, `sourceconsent`, `sourceconsentwithdraw`, `knockerconsent` | `screens-intake` (the new `about-knocker` screen, C17) and `screens-publish` (the doorbell's consent form, C17) |  |
| `extraction` | `pdfstructure` | `screens-inquiry` (document: how complete its text is; read it again with OCR, C21) | `pdfstructure` with `ocr=1` is called by no screen today; confirm it answers whether a document's text is full, partial, none or unread (the four states the screen names, DEC-375) and fix here if it answers less. |
| `content` | `transcriptionattest` | `screens-inquiry` (document: a second member confirms a typed page, C22) |  |
| `entities` | `resolutiondefect` | `screens-inquiry` (document: report a subject match as wrong, C31) |  |
| `lines` | `recordline` | `screens-investigate` (person: 'Records its offices keep', `custodian_of` or `responsible_for`, C68) | Nothing lets a team say 'this office keeps these records', the only line the office suggestion (`actions` `addresseeSuggest`) reads; proceeding.mjs:167-171 records `party_to` only and setup.mjs:1662-1740 seeds `post_in` and `part_of`. Confirm `recordline` accepts the kinds `custodian_of` and `responsible_for` with a subject, source and dates; fix here if not. |
| `observation-log` | `lead`, `leadread`, `leadlook`, `leadshare` | `screens-intake` (the new `leads` screen, C18) |  |
| `standards` | `standardinforce` | `screens-investigate` (standard: was it in force on a date, C40) |  |
| `progressions` | `thread`, `progressiondefine`, `progression`, `captureprogressions` | `screens-inquiry` (document: Thread, C25) and `screens-investigate` (timeline: define a flow, C26) | `thread` needs `progressionKey`, `entityId` and `placements: [{stage, captureSha}]` (progressions/index.mjs:833-846, `NO_KEY`, `NO_ENTITY`, `NO_PLACEMENTS`); the declaration is what the screen is held to. Nothing else changes in this module unless the declaration test finds the arm and R6 disagree (then fix it here). |
| `people` | `sourcepersonlink` | `screens-intake` (about-knocker: say who the source is, C17) |  |
| `bias` | `biasmanifest`, `biasadopt`, `biasinhale`, `biasdebt`, `biasdebtresolve` | `screens-settings` (the new `bias` screen, C47), `screens-daily` (queue rows), `screens-publish` (the ceremony's Bias step) |  |
| `inquiry` | `inquirydivide` | `screens-inquiry` (question: divide a question, C39; each new question numbered for the member) |  |
| `hypotheses` | `hypothesishold`, `hypothesisrevise`, `hypothesiswithdraw` | `screens-inquiry` (question: Keep a hunch, C35; change or take back a hunch, C36) | `hypothesishold` refuses every hunch without `about` (`BAD_ABOUT`): `about` is required, a list holding the question's id for the 'other' kind and `{from, to}` for the 'flow' kind; the declaration is what the screen is held to. |
| `citation` | `sever`, `reinstate` | `screens-publish` (case-editor: sever and reinstate the case's own citations, C53) | The case arm of `sever` / `reinstate` (citation/index.mjs:209-262; case arm :237): the question's arm is met and used; confirm the case arm works with `{project, handle}` and a reason from the shell; fix here if not. |
| `basis-versions` | `narrow`, `narrowcandidates` | `screens-inquiry` (question: Narrow, C34) | `narrow` needs `target`, `version`, `ord`, `name`, `description` and `extent` (basis-versions/index.mjs:1245-1290 `NARROW_NO_SUCH_LEG`, :1383-1443 `NARROW_NO_EXTENT`); `narrowcandidates {target, version, ord}` proposes the parts (machine work). The declaration is what the screen is held to. |
| `contradiction` | `contradictionclarify`, `contradictiontakeup`, `contradictiondismiss`, `contradictionresolve`, `contradictionoptin`, `contradictionrespond` | `screens-inquiry` (the new `contradiction` screen, C48) |  |
| `intent` | `objectivecondition`, `triage`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend`, `aspirationretire`, `goaldeclare`, `goallink`, `goalclose` | `screens-inquiry` (the new `objective` screen, C46) |  |
| `reevaluation` | `reevaluations`, `reevaluationrecord` | `screens-inquiry` (question: the reminders to look again, C57) |  |
| `corpus-export` | `export`, `exportlog` | `screens-settings` (group: a founder takes a copy of the team's record; the list of copies every administrator reads, C30) |  |
| `conformance` | `determine` | `screens-action` (matter: record and revise a determination, C41) |  |
| `consequences` | `consequencerecord`, `consequencerevise`, `addressedrecord`, `successrecord` | `screens-action` (matter, C42) | `escalationend` refuses `CONSEQUENCES_UNDETERMINED` / `COMPLIANCE_NOT_RESTORED` (escalation R14): the matter screen draws those refusals by their words; confirm the refusals carry what the screen needs (a code and a `translation`) and fix here if not. |
| `actions` | `actioncorrespond`, `addresseesuggest` | `screens-action` (action: the full reply form, C66; request: offices by a record or name, C67) | `actioncorrespond` takes `no_response`, `quote_*`, `stage`, `outcome`, `exemptions` (actions/index.mjs:3305-3315) and the day and account; `addresseeSuggest` takes an entity or a record (:2963-3025, R62). The declaration is what `screens-action` reads at its START. |
| `escalation` | `escalationattach`, `escalationdecline`, `escalationsuspend`, `escalationresume`, `escalationevaluate` | `screens-action` (matter, C43; 'Hold at this stage' is `escalationdecline`, distinct from 'Decline to escalate') |  |
| `action-plans` | `optionadd`, `optiondispose`, `scenarioset`, `optionstart`, `checkpointrecord` | `screens-action` (plan: the full option and scenario forms, C73; start-send: the team's contact, C74) | `#optionFields` takes the addressee, dates with their basis, the tier, `lobbying`, `enforces` (action-plans/index.mjs:413-482), reminders (:1083-1130), phases with branches and order (:1222-1248); `optionStart` takes `contact` (:1411-1430, `CONTACT_NOT_A_MEMBER`). The declaration is what the plan screen is held to. |
| `monitoring` | `monitorset`, `monitor`, `monitorpause`, `monitorslate` | `screens-inquiry` (document: Watch for changes with a frequency, C54; Check now, C55), `screens-intake` (capture: C55; the watching screen, C56) | `monitorset {bundleId, enabled, frequency}`: the declaration names `frequency`, which the document page does not send today (monitoring/index.mjs:1683-1692: `none` is unscheduled). Check `monitor` answers `status`, `note`, `assessment` (R10) for the four outcomes the screens draw (modified, removed, unchanged, could not be told). |
| `link-sweep` | `sweeps` | `screens-intake` (the watching screen: the sweeps, C56) |  |
| `wizard-scripts` | `writinghelp` | `screens-settings` (bias, group), `screens-inquiry` (project, contradiction, objective), `screens-intake` (about-knocker, leads), `screens-action` (plan, start-send, matter): the registry now lists it on each (a labelled draft in one own-words field) |  |
| `instance-setup` | `selftest`, `runtime`, `bootstrap` | `screens-settings` (updates: how the team's copy is doing, what each part runs and what running it costs, C82) |  |

## 5. Owners that keep a wave-2 job and declare their own ops there

`member-roster`, `credentials`, `provenance`, `capture-sources`, `connections`, `investigation`, `case-import`, `case-inputs`, `case-authoring`, `review`, `filings`, `tasks`, `queue`. Every other owner is the pass's.

## 6. The proof (mechanics §5.10 (4))

Once, after the last declaration: the whole module suite (`node .github/scripts/module-tests.mjs`, every module's tests, with every `node_modules` present first, K4113), `node checks/run.mjs /home/user/bio` from the process repository (format, architecture, channels, words, coverage; architecture and words show 0 findings for every file the pass touched), and the generated artifacts check, then the guard's census again (`declared N of M ops` rises by the number of ops declared; none is lost). Every red is fixed in the pass before it is committed: a red in a screen test caused by a declaration the guard now enforces is a true finding of that screen, recorded for its wave-2 job and not fixed here; any other red is the pass's to fix; no red is accepted and no module is dropped to make the run green.

## 7. After it (mechanics §5.10 (5) and (6))

BOB reads the diff's summary and every line the worker marked uncertain, then commits. A ruling names the rule, every module touched, every module handed to its own job (each an entry in the running plan, done in this tranche) and the test result. Wave 2 then starts; each wave-2 START already says the other owners' ops are declared.

