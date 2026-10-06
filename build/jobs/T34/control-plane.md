# control-plane (T34)

**Status** · session_018eayTV8uSbTs4embGXypYg · depth 2 · COMPLETE · handled B12

## J1 · QUESTION

My best readings, on which I carry on now. Correct any.

1. **R57's order and place.** The door resolves `assistant` in the record store's door, not the Worker: `controlPlaneRoutes` (spread last in plane's map, so it wins) routes `groupdescriptiondraft` and `writinghelp` itself and calls `instanceSetupOf(ctx).groupDescriptionDraft({answers, assistant, viewer, by})` and `wizardScriptsOf(ctx).writingHelp({op, field, told, draftHeld, assistant, by, viewer})` directly, so the unsealed key never leaves the store process. Refusals, before the handler: `NOT_AN_ADMIN` (gdd only; membership's `notAnAdmin` over `isAdministrator(by)`), `ASSISTANT_OFF` (instance-setup's `assistantGate`), then ai-runs' `aiUseCheck({member})` (`AI_NO_ACCOUNT`, `AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`), then `credentials.accountFor({member, act})`'s other refusals relayed as given (`GROUP_KEY_NOTICE_DUE`, `ACCOUNT_MEMBER_NOT_ACTIVE`, the seal's). `assistant` passed is `{on: true, account: {kind, level}}`: never the key. Consequence: for `writinghelp` the ceiling codes come before wizard-scripts R24's items 2–4 and `WRITING_HELP_NOTHING_TOLD`, where wizard-scripts R27 lists them after; I take R57's order (door first) as binding.
2. **Arguments.** `writinghelp`'s `op` (the field's act), `field`, `told`, `draftHeld`, and `groupdescriptiondraft`'s `answers`, are read from the POST body (the query's `op` is the door's own). WIZARD-SCRIPTS and INSTANCE-SETUP should know.
3. **Stamps of T34's ops.** Where op-declarations declares a T34 op in `OP_STAMPS` (its families), the door stamps it from there, as T33's. One exception: membership's ten administrator acts (`invitewithdraw` … `groupdescriptionset`) read `by` as a bare member id (`isAdministrator(by)`), while `OP_STAMPS`' `by` is the viewer form (`member:<id>`), which membership would always refuse `NOT_AN_ADMIN`; so the door stamps their `by` with the session's member by the custodial acts' expression (a machine `class:<cls>`), after `OP_STAMPS`. Credentials' and tasks' ops take `OP_STAMPS` as declared (credentials normalises either form). If op-declarations does not put a T34 op in `OP_STAMPS`, tell me and I stamp it here by its spec.
4. **Aliases (R55).** I import op-declarations' R21 table as `OP_ALIASES`, `{alias: op}`, frozen, and the Worker re-routes an alias to its op before every gate (its spec equals the op's), so the two answer alike. Please confirm the export's name with OP-DECLARATIONS #11; I will not import it until it is on the tranche or its branch.
5. **The doors (R54).** `websiteinvite` and `joinlinkinvite` are answered in the public branch as `invitelook`/`enroll` are: the body's `key` (or `link`), `cover` and (website) `approvedBy` only, to the store the caller names (`invStub`: `store=scratch` reads scratch, else `bio`), relayed through `relayAnswer` once. `groupdescription` likewise, with `viewer` from admission's `readerOf` over that store (`""` for no one). `courtnotice` goes by the generic forward, stamped nothing.

## J2 · REPORT

Progress on `job/T34/control-plane` (pushed, `t34-routes.test.mjs` new). Size now 3,893 lines (+69); with the aliases about 3,900, under 4,000.

1. **`uses` for my COMPLETE (architecture check, 2 failures today):** control-plane's `uses` in `build/modules.json` gains `following` (its `checks.mjs`, C-137, now in `CHECK_FAMILY_FILES` after monitoring, K1836) and `agent-harness` (N586: `members-pin.test.mjs` reads `SUBSESSION_OPS` from `agent-harness/src/subsession.mjs`). Yours to write.
2. **Built and green here:** `askusage` passes `calls` (K1798); following's family (accepted red 9's first half cleared: `families.test.mjs` green); `catalogue-end.test.mjs` re-pinned (37 rows: every L8–L10 DEC-149 re-wording, each checked against its owner's T34 record, C-124.32 per K1750, and this module's own; C-96.5, C-96.10 retired) and green; N586; DEC-149's rows of this module (C-69.1–.5, C-68.2–.4, C-66.6, the silence's detail, the three one-time answers) re-worded as your START placed them, `awaiting stamp`; R57's resolution in the store's door, with its order, tested over a record (the handlers stubbed so the door is seen whatever their owners answer); R54's doors and `groupdescription`, membership's `by`, R56's query key.
3. **Red here until others land (each coded against your answer B3):** the Worker-side tests of R54–R57 need op-declarations' specs and `OP_STAMPS` for the T34 ops (R22–R24, R29, R15's `baseupdates`), and tasks' five ops in `tasksOps`; R53's `r53-routes.test.mjs`:58 needs T34-58's note-op specs; the aliases wait on `OP_ALIASES`; B2's `queryGate` on admission's merge.
4. **One reading recorded (P17, detail):** `accountFor`'s `act` for a draft is `{kind: "ask", member}` (credentials R24 admits `ask`, `run`, `standing`; a draft is no run and no standing question).

## J3 · REPORT

B9 carried: `tranche/T34` merged; `OP_ALIASES` imported and every alias re-routed to its op before every gate (a test compares each alias with its op for the same caller: same route, same stamps, same answer). Suite 179 pass, 2 fail; checks format, architecture, coverage (41/41), ownership 0 failures; 3,901 lines.

Brought green, my side: `r53-routes.test.mjs`:75 (membership's administrator acts expect `by` as a member id, K1863 (7)'s reading 3; a public op's probe `store=scratch` is admission's pin), `totality.test.mjs`'s alias reading (an alias is its op), `declarations.test.mjs` (an alias is reached at its op's route); the doors now answer from `bio` (op-declarations pins the three public ops); `catalogue-end` re-pinned for queue's C-33.44 (DEC-131, K1536) and instance-setup's C-64.3, C-119.1, C-119.3, C-119.4 (DEC-149, each named in its owner's record).

Two reds remain, neither mine to clear:
1. **`totality.test.mjs`:13 is affordances' (T34-75, not merged):** `unaccounted` over the door's table names 37 T34 ops unpublished and 27 unranked (the note ops, the check requests, membership's, the group key's, the drafts, `startfrom`, `baseupdates`, `publishat*`, `placewanted*`, `memberlanguage*`), aliases excluded. It goes green when affordances publishes and ranks them; nothing in this door changes it.
2. **A difference between my R55 and op-declarations R23 as built:** R55 says each of tasks' five ops is "refused to any caller not arriving by a member's session (`machineClasses: []`)"; op-declarations declared `checkrequests` and `checksof` as `{classes: ["admin","member","probe"], mutating: false}` with no `machineClasses`, so a binding class reaches the two reads (R23's own words give the reads no `machineClasses`). My R55 test holds the requirement and is red on it. Yours: a CHANGE to op-declarations (`machineClasses: []` on both reads), or R55 re-worded to the three acts only.

## J4 · COMPLETE

T34-60 (with T34-90/T34-91's layer-11 share and accepted red 9) complete on `job/T34/control-plane` @ 48cb51b51b, merged with `tranche/T34` after op-declarations' re-merge (K1877).

**Entries applied.**
- K1807 / R53: the note ops' specs and stamps are op-declarations' (T34-58); `r53-routes.test.mjs`:58 green with them, and `:75` green (membership's administrator acts' `by` a member id, K1863 (7)).
- K1798 / R53: `askusage` passes `calls` (ai-runs R48): an ask of N calls counts N, none stated counts one.
- N552 / R54, R30: `websiteinvite`, `joinlinkinvite` answered in the public branch from the store the caller names (admission R3 lists them among the scratch-addressing public ops), only the body's key/link, cover and approver crossing, relayed once; `groupdescription` with `readerOf`'s viewer over that store; membership's ten administrator acts stamped `by` as a member id (custodial expression); `checkaddressees` unknown to every caller.
- R55: tasks' five ops through `tasksOps` (session only, stamps from `OP_STAMPS`); every `OP_ALIASES` alias re-routed to its op before every gate (a test compares each alias with its op).
- R56: the group key's seven ops through credentials' map; the key from the body only (admission's `queryGate`), in no answer.
- R57: `groupdescriptiondraft` and `writinghelp` routed in the store's door over their owners' entries: NOT_AN_ADMIN (gdd), ASSISTANT_OFF, AI_NO_ACCOUNT, the two ceilings, then credentials' own refusal, before the handler; `assistant` handed as `{on, account: {kind, level}}`, never the key; `accountFor`'s act `{kind: "ask"}` (B5 (4)). `baseupdates` and `startfrom` stamped `viewer`.
- R28 (B2, K1861 (6)): admission's `queryGate` after R1, before anything reads the URL.
- N586: `members-pin.test.mjs` reads agent-worker's `ops.mjs` and agent-harness' `subsession.mjs`.
- B4 (N630, K1864 (1)): `json()` answers compact JSON.
- Accepted red 9 cleared: following's C-137 in `CHECK_FAMILY_FILES` (after monitoring); `catalogue-end.test.mjs` re-pinned for every L8–L11 re-worded row each owner's T34 record names (DEC-149: C-101.1, C-33.29, C-109.1, C-28.1/.4/.6/.8/.16/.17, C-68.5, C-98.1/.2/.4–.6/.8/.9, C-48.8/.9, C-91.1/.2, C-115.13, C-32.14/.15, C-124.57, C-116.44, C-87.7, C-113.28, C-64.3, C-119.1/.3/.4, admission's C-29.8, C-32.17, C-38.1, C-38.3, C-38.8, C-64.4, C-78.1; DEC-131: C-33.44; K1750: C-124.32), C-96.5 and C-96.10 retired. Tasks' C-138 and wizard-scripts' new rows read from their existing files (no new file).
- T34-87 (DEC-149, K1821): this module's member-facing text re-worded — "this group's Civicsmith" in C-69.1–C-69.4 and the silence's detail; "your group's Civicsmith" in C-69.5, C-68.2–C-68.4, C-66.6 and the three one-time answers (`aicredentialmint`, `reviewgrant`, `templatereviewgrant`); each named by a test.

**Rows `awaiting stamp`** (T35's promotion stamp moves the catalogue version, plan Rules (5) 4): C-69.1 UNKNOWN_OP, C-69.2 STORE_DID_NOT_ANSWER, C-69.3 PLANE_INTERNAL_ERROR, C-69.4 STORE_INTERNAL_ERROR, C-69.5 PURGE_HOLD_IN_PLACE, C-68.2 BOOTSTRAP_CREDENTIAL_UNSET, C-68.3 BOOTSTRAP_CREDENTIAL_PUBLISHED, C-68.4 BOOTSTRAP_CREDENTIAL_MISMATCH, C-66.6 REPLAY_UNVERIFIED (translations changed).

**Deferred:** none.

**Found in other modules:** (1) affordances (T34-75): `unaccounted` over the door's table names the T34 ops unpublished/unranked — `totality.test.mjs`:13, accepted red 12 until its merge. (2) plane: its suite has 4 reds on `tranche/T34` itself, unchanged by my branch (instance-setup's route count 24 vs 20, the Civicsmith library's required scripts WIZARD_SCREEN_UNKNOWN ×2, case-catalogue missing from the step order — accepted red 8), plane's T34-76.

**Tests and checks.** control-plane: 182 tests, 181 pass, 1 fail (`totality.test.mjs`:13, accepted red 12). plane (user of this module; compact JSON and the doors): 111 tests, 107 pass, 4 fail, the same four that fail on `tranche/T34` without my branch. No layer tests (manifest). format 0 failures; architecture 0 failures; coverage 41/41, 0 failures; ownership 15 files, 0 failures.

Size (session_018eayTV8uSbTs4embGXypYg): test runs 14, module lines 3903

## J5 · REPORT

B12: `courtnotice`'s stale is not this module's. op-declarations declares it in its `plainread` kind (`index.mjs`:119, R22: "nothing stamped"), which has **no `NEEDS` row by design** (`needs: undefined`), so the door's table carries it as not gated (`gated: hasOwn(NEEDS, op)`, the reading affordances R12's `unaccounted` asks for), while affordances lists it in `NON_ACTS` (`affordances.mjs`:2202), which `unaccounted` holds to gated ops only. It is the one `NON_ACTS` entry of 528 with no `NEEDS` row. Either affordances drops `courtnotice` from `NON_ACTS` (an ungated read needs no act) or op-declarations gives it a `NEEDS` row of `null` as every other session read has (R22 names none for it). Yours to route.

## J6 · COMPLETE

Re-opened by B12 (K1879); complete again on `job/T34/control-plane` @ fec7e569b2, merged with `tranche/T34` (every L11 job merged).

**Applied.** `totality.test.mjs` reads the door's whole op table again, aliases included: an alias is an op of the table, routed to its op's handler (R55), and affordances now grades it as its op (its R45), so the 29 aliases are no longer stale. The filter I added at J3 (aliases left out) is removed.

**Left red, not this module's (J5):** `courtnotice` stale in the same test — op-declarations' `plainread` kind gives it no `NEEDS` row, and affordances lists it in `NON_ACTS`, which `unaccounted` holds to gated ops.

**Tests and checks.** control-plane: 182 tests, 181 pass, 1 fail (`totality.test.mjs`:13, `stale: ["courtnotice"]` only). format 0, architecture 0, coverage 41/41 0, ownership 0 failures. Everything else as J4.

Size (session_018eayTV8uSbTs4embGXypYg): test runs 17, module lines 3903
