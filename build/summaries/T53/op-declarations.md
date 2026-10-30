# Task summary · T53 · op-declarations

Stands for: `build/plan/current.md` lines 428-442 (the module's plan block), `build/plan/T53-R1/op-declarations.md` (rows file), `build/requirements/op-declarations.md` (R1-R93, read whole), `build/layers.md` (head; layer 11 "Interface and distribution": modules use earlier modules only, P4), and the Public Purpose plus the services named here of the used modules. Sources stay binding; read any cited R whole when the work touches it ("read R<n> whole" marks a compressed R). Not in my set, left to the job: the code under `bio-plane/src/op-declarations/` and `bio-plane/test/m/op-declarations/`, the `registers` op list (its R38), FOLD-AI §2.8's text. R84-R93 are all "not yet met: T53". The module declares and judges no caller and routes nothing; no I/O, store, network or clock; no place named (R7).

## Entries

Lines are current.md; "R1 rows" is the rows file.

- current.md:429 T53-558 (K5693, doorbell R31): declare `inboxview`, a read, member session only (`machineClasses: []`), owner `doorbell` (R31 whole: safe view only, nothing filed, Reversible, no reason). Spec by R49/R77 rules: not mutating, `viewer` stamped, `NEEDS` `null`, both session sets, not on `AI_GRANT_OPS`; prefer the owner's `DECLARED_OPS` row (R80, R81); R34: `ACT_HELP` text or `ACT_HELP_ABSENT` as a read a screen draws from.
- current.md:430 T53-556 (K5678; ai-accounts R35 and the ops K5457 retired): the retired ops leave every table, no alias; the tests of retired ops (R19, R20, R24, R30, R34, R41, R47, R68) are re-pointed to the nineteen new ops, red on the tranche until then (FOLD-AI §2.8: same round as callers). Lists in R90 (read whole). R19, R20, R24, R30, R34, R41, R47, R68, R90.
- current.md:431 T53-355 (K4599) `screenread`, budget class per op: R86 (the op), R87 (a class on every op and screen), R85 (reads by wave). R85-R87.
- current.md:432 T53-356 (N1220) AI ops with grade and class `[owed: "AI act" class, P1]`: R90 (ops, grades) and R93 (keys `ai_act`, `gate_run`; `runtime-limits` R41). R90, R93.
- current.md:433 T53-357 (N1220) every machine result labelled with its AI: screens' work (screens-intake, -daily, -investigate, -publish, -action, -wizards, -document); this module has no R of its own for it beyond R2 (no spec names `ai`) and R90.
- current.md:434 T53-358 (BOB) R90 AI op grades confirmed `[written: K5748: op-declarations R90 checked against draft §4]`: R90 stands as written (confirmed by BOB, K5750). R90.
- current.md:435 C T52-42 (K4599 (a), N1264): the combined read: one op carrying a screen's declared list of reads, first the Project screen, then each screen; BOB's throwaway test figures (his act 3). R85, R86.
- current.md:436 T53-359 (K4168, N824, N858) CAPABILITIES rows, R1 rows: grades from owners' declarations (R80, R81); `rowexpunge` reasoned and irreversible; machine refused on every register write; `needsRows()` unchanged (op-capabilities R1); `registers`' check table in the family list and its twelve ops (read `registers` R38 for the names); `registerdelta`, `registersearch`, `registercompare` take the `explore` class (2.0 s, not Read act; PL2 forbids upward override); mail ops (R92 (1)); N858 all-doors test (R84); N1272 and N1257 ops (R92 (2), (3)). R80, R81, R84, R87, R92.
- current.md:437 T53-360 (K4354, P24) `heldcaptures` out of each screen's first wave: R88 (Home, Queue, Add, Document; returns as a picker read on open; Held keeps it on open). R1 rows bar: P-22 (Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768; `heldcaptures` 241 KB, 0.8-1.7 s). Test: no `heldcaptures` in each first wave; four administrator screens re-timed on Seed A within class at p50. R88.
- current.md:438 T53-361 (K5457) off the retired AI ops (FOLD-AI §2.8): as T53-556, no alias. R90.
- current.md:439 T53-362 (K5565) English in tests, the module's one conversion entry (R1 rows): convert the module's English-in-test sites to the word key and its values, each assertion reading the key the product reads; a B site (text only in the module's source) first gets a key in the module (UX-DESIGN's wording); a C site is test input (kept) or a dead assertion (removed with its reason); every test touched for other entries is converted too; the words check refuses English in a new or changed test. Census here: literal 0 / 0, regex 1 A / 4 B / 2 C sites (5 files). Test: the words check's baseline loses the module's files and the suite is green. Model `sonnet-5-5` where a B site needs a key first. R7.
- current.md:440 T53-567 (mail-door R12): the five member acts `mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete` come from `mail-door`'s `DECLARED_OPS`, member session only; grade and class owed (recommended `mailbringin` as `captureupload`, reads the lightest read class). R92 (1), R80, R81, R87.
- current.md:441 T53-603 (events R61, money R39-R40, calculations R53; K5786): rows for `eventwithdraw`, `moneyby`, `moneyfiscalyears` (family rules of R19: mutating `NEEDS` `contribute`, `by`/`author` and `viewer`; read `viewer`, `NEEDS` `null`); the calculations family's `extra` becomes `{ spotcheckvisit: ["by"], calculationcreate: ["owner"], calculationevaluate: ["owner"] }` (`owner` stamped from the address, never the body). R19, R49.
- current.md:442 rows: R1 rows also list the member-roster rows `adminremovals`, `adminproposalcancel` (R89), the AI ops (the 43 plus `airesultown`, `aihealthshare`, `aihealthpreview`, `aicreditsclear`, `aiwaitswitch`, `airetestset`; R90), and notes R-53 and R-68 name op-declarations with no D1-D3 line. R89, R90.

## op-declarations (own requirements)

### Public

Terms: an op spec is `{classes, machineClasses?, mutating}`; `classes: null` is public; classes `admin`, `member`, `probe`, `daemon`, `ai`, or a session kind; a stamp is a field the control plane sets from the caller. Every op spec is tested by name with a negative control (K874). Read each R whole when touched.

- R1 `ACT_GATE = {needs(id), mode(id)}`: `needs` answers `NEEDS[id]` or `null`; `mode` answers `session` (member set), else `admin-session` (founder's set), else `machine`; `decorateAct(act)` = `affordances.decorate(act, ACT_GATE)`.
- R2 `OPS` maps op to spec; `machineClasses` replaces `classes` for a non-session caller; no spec names `ai`; no `machineClasses` names `member`.
- R3 `SESSION_OPS = {member, admin}`; `NEEDS` composed here, frozen, from three parts sharing no op (`composeNeeds` refuses overlap): `op-capabilities.needsRows()`, family rows by kind (R19), founder-session rows (`export`, R83); aliases (R21) applied over the whole; `UNATTENDED_BY_DECISION` holds no op without a citation.
- R4 The act lists (`EDGE_ACTIONS`, `STATE_ACTIONS`, `ACTION_ACTIONS`, `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS`, `CUSTODIAL_ACTIONS`, reads' lists) name each op's stamps and fences; each listed op has a spec.
- R5, R69 Tables are frozen data, built on first read, not at import; each export answers as before.
- R80 `registerDeclaredOps(rows)` (owners' `DECLARED_OPS`, `{owner: {op: row}}` or `[owner, {op: row}]` pairs); row `{classes, machineClasses?, mutating, weight, description, fields?: {accepts, requires}, stamps?, needs?}`; `stamps` from `OP_STAMPS` (`viewer` when absent, none if public); `needs` required of a mutating op without a hand row; malformed row refused naming the op; first read builds once, merging ops the hand tables lack into `OPS`, `OP_STAMPS`, `NEEDS` and the session sets (not if public); `declaredFields(op)` answers frozen `{accepts, requires}` or `undefined`. Read R80 whole.
- R81 An owner's row and a hand row must agree (`classes`, `machineClasses` with absent differing from `[]`, `mutating`, `stamps` as sets, `needs`) or registration is refused naming op and field; an op in two owner rows refused naming both; a late or second registration throws naming the first op; a refused one leaves the module as it was.
- R82 `standardinforce` is in both session sets (`ACT_GATE.mode` `session`), otherwise unchanged; siblings `standard`, `standards` stay out. R83 `export` (mutating, class `admin`) is in `SESSION_OPS.admin` only, `NEEDS` `null`; `exportpage`, `exportlog` stay out.
- R21 Each registry act marked `function` (`docs/development/ux-substrate/screens/registry.json` at the pinned commit) has a spec under its lowercased name; a function served under another op is a frozen alias (spec, sets, `NEEDS`, act lists equal; 26 aliases); a function with no op gets no spec; an `owed:<op>` whose op is declared is read as served; `strengthbarset` is no alias. R27 the library's owed acts are declared when served. R52, R54, R60, R65 re-pin the registry (PR #28 `3f40899950`, PR #31 `a0fab7abf0`, PR #33, PR #34 `4664e8efd4`); `elsewhere` lists no act. Read R21, R27, R65 whole when re-pinning.
- R34 Every op in `SESSION_OPS.member` has an `ACT_HELP` text (`affordances` R48) or is in the frozen `ACT_HELP_ABSENT` with one sentence-ground (no control offers it; alias; owed act; design not yet explained); never both; none for an op `OPS` lacks; tests read `ACT_HELP` and `T51_DESIGN_OPS`. R75 leaves it: `reauth`, `aliaswithdraw`, `factconfirm`, `projectrequest`, `projectrequestwithdraw`, `projectrequestanswer`.
- R76 `BROWSER_ACTS` (frozen, lazy) `{screen, census, registry}`: `revisioncompare`, `hashcopy`, `linkopen` (`document`), `pubfloorset`, `pubfloorclear`, `pubprint` (`published`), `reviewexport` (`review-copy`); a browser act has no spec, `NEEDS`, session set, `ACT_GATE`, `REAUTH_ACTS` or act list; every `owed` registry act is exactly (a) served by an op, (b) a `BROWSER_ACTS` row, or (c) still owed. Read R76 whole.
- Owners' op specs, one R each (read the R whole for classes, stamps, `NEEDS`): R8 filing-templates, local-facts; R9 T22; R10 T23; R11 `optionstartpreview`; R12 holds; R13 docket; R14 case-import, case-checker; R15 wizard-scripts; R16 `importwatch`; R17 `clockpropose` etc.; R18 ORG/LAW; R19 the family rule (mutating: `NEEDS` `contribute`, `author`/`by` and `viewer`; read: `viewer`, `NEEDS` `null`; proposal: any credential, `proposer`; one append site per family); R20 `ask`, `aiusage`; R22 membership; R23 tasks; R24 group keys (**retired by R90**); R25 publish-schedule; R26 `placewanted`; R28 language; R29 drafts; R30 T35; R31 standards and calculations; R32 file-safety; R33 keep-away; R35-R40 translations, `obscuremark`, `setpassword`; R41 accounts and limits; R42, R53 `handlecheck`, `handlechange` (refuses `HANDLE_FIXED`); R43, R48 steps, investigation, guides, case-account; R45 `captureupload`; R47 `pagetranscribe`; R49, R51 T45/T46 owners; R50 `infolevelset`; R55 `projectlist` etc.; R56, R70 `sourceof`, `sourcerung`; R57-R59, R62, R63 sign-in acts and `REAUTH_ACTS` (maps op to `null` or `{field, values}`); R61 `peopledirectory`; R64 reply, proceeding, `readtranslate`; R66 update ops; R67 `aiuseovertime` etc.; R68 `ai-accounts` family; R71 `founderhandleset`; R72 `projectownervotes`; R73 `T50_SHARES` kinds `own`, `member`, `owners`, `ownread`, `read`; R74 request fields gained (`timeline` `captures` ≤200, `entitycreate` `forum_kind`, `acquire` `for`, `airunopen` `project`) and `inboxpull`, `inboxresolve` stamped `viewer`; R77 plane reads (`heldat` stamped `viewer`+`by`, `check: true` refused `MEMBER_SESSION_REQUIRED`; public `publishedfrozen`); R78 `holdsdue` etc.; R79 `clocksrunning`.
- R84 All-doors test (N858; K5508-K5512): five profile fixtures (four each lacking writer, sources, professional review or second approver; one complete) through `templatesFor`, `templateRead` (`filing-templates` R14), `offeredVersion` (R25, R26), `templateByHandle` (R34), `unofferedFor` (R35), `templatesForAction` (`filings` R41, R65), `procedureGuidesFor` (`reading-guides` R19): the lacking four answer nothing of the text (no bytes, SHA, snippet), name the lack (`TEMPLATE_NOT_REVIEWED` or `not_offered`); the complete one answers everywhere. It enumerates every op declared by `filing-templates`, `reading-guides`, `filings` via `declaredOpsOf` and fails on an unclassified op. Fixture rules (opt-out guide, `reviewed_by`, changed-after-review, source-changed flag, 12-month "last checked", machine writer/reviewer withheld, court-filed kind refused at load R136): read R84 whole.
- R85 A screen declares reads `{name, op, args, wave}`; a later wave may take an earlier wave's answer; unknown op or later-wave answer refused; hops derived = waves + 1, never typed.
- R86 `screenread`: read op, class `read`; input screen name and params; answer `{reads: {name: {ok, status, body | refusal}}, stamps, server_ms}`; a refused read answers `ok: false` and others still answer; never exceeds the sum of reads' declared bounds; a read past its bound is cut, `ok: false, status: "slow"` with the bound, others not held (PL15); a write op in a list is refused at declaration.
- R87 Every op and screen declares `budget_class` from `runtime-limits` R41 (`budgetOf`); none is a totality finding, unknown refused; override downward only; default the class ceiling. Keys: `screen_load` 2,000 ms/3 hops, `screen_move` 2,000/2, `screen_load_phone` 2,000/3, `read_act` 1,000/2, `shell_act` 500/1, `write_act` 2,000/2, `web_capture_plain` 5,000, `web_capture_visitor` 15,000, `file_capture` 2,000, `ai_act` 60,000/2, `gate_run` 1,800,000/2, `follow` 1,000/2, `explore` 2,000/2.
- R88 Home, Queue, Add, Document: no `heldcaptures` in the first wave; Held reads it on open (control); re-timed on the study seed within class at the median.
- R89 `adminproposalcancel` in `GOVERNANCE_ACTIONS` (`by`), both sets, `NEEDS` `null`, ground `credential`, `ACT_HELP` text, not in `REAUTH_ACTS`; `adminremovals` a `sessionread` (member session only, `machineClasses: []`, `by`, `NEEDS` `null`) in the `member-roster` family beside `adminremovalsopen`; `adminremove` stays in `REAUTH_ACTS`, reasoned; control: `adminremovals` refused to a bearer credential.
- R90 Each op in its owner's family, `SESSION_OPS.member` (and `.admin` where an administrator's), `machineClasses: []`. **Reversible, shell act:** `aiorderset` (also own list, with `owner`), `aiaccountswitch`, `aimemberallow`, `aiprojectuse`, `aiprojectorder`, `aimineuse`, `aibudgetset`, `aiprojectbudget`, `aitermsaccept`, `aipersonalchoose`, `aicontinue`, `aistop`, `aisend`, `aisendrefuse`, `aiwait`, `aiwithout`, `aiswitchaccount`, `aimodelchoose`, `aichooseother`, `aiaccountpick`, `aiaskadmin`, `airesultsdecline`, `aiwaitswitch`, `airetestset`, `aihealthset`, `aioptinset`, `aitermswithdraw`, `aicreditsclear`. **Reasoned, shell act:** `aicheckset`, `aiprojectcheckset`, `aimycheckset`. **Terminal, write act:** `aiaccountremove`. **Reversible, write act:** `aiaccountadd`, `aiownadd`. **Ground `credential`, write act:** `aikeyenter`, `aikeyseal`, `aikeycloudflare`, `aikeyreference`, `aisignin`, `aitestsetup`. **Irreversible, write act:** `airesultsend`. **Ground `observational`:** `aiconnecttest` (AI act), `aitestrun` (Gate 1 run). **AI act:** `airunstart` (as `airunopen`). **Read act:** `airesultsread`, `airesultown`, `aihealthpreview`, `aiusebymember`, `airunparts`, `assistantreadiness`, `aipathready`. **Worker-only** (no session set, never a model tool, never logged): `aicredential` (ground `credential`), `aigatewayserved`, `aicredentialfailed` (`observational`). Screen moves `aiplanconnect`, `aitestopen`, `airesultsopen` carry the in-app move class, no op spec. **Removed, no alias:** `groupkeyset`, `groupkeyremove`, `groupkeyswitch`, `groupkeynoticeseen`, `accountreferenceset`, `accountreferenceremove`, `subscriptiondisconnect`, `projectkeyset`, `projectsigninset`, `projectaccountremove`, `projectaccountswitch`, `projectkeynoticeseen`, `subscriptionsignin`, `groupkeystate`, `accountreference`, and the `step: "start"` row of `REAUTH_ACTS` (R58, R63). Note: `ai-accounts` R35 lists only seven of these; R90's fifteen govern. Control: each refused a machine credential; no spec carries class `ai`.
- R91 `followfrom` class `follow`; chain search and explore ops `explore` (2.0 s; `CHAIN_LIMITS` stay counts); `interpretationOf` `read_act`; `partsOf` full-load share (2.0 s); `proposeParts` `explore`, never a first-wave read.
- R92 Owed, drafted for BOB: (1) mail ops (R92 as T53-567); (2) N1272: `interpretationOf`, `interpretedFor`, `proposeParts`, `limitsByKind` read grade, classes of R91 (`interpretedFor`, `limitsByKind` `read_act`); `interpretmark`, `acceptProposals`, `interpretationWithdraw` have NO stated grade (BOB's; propose none); `guideOptOut` ordinary member write; (3) N1257: `layerentrydraft`, `layerentryconfirm`, `layerentrywithdraw` as `ruledraft`, `ruleconfirm`, `rulewithdraw`; `layersset` as `profilesset`; `layerreportcarry` reversible; `layerreport` ordinary member write sending nothing; `layerreports`, `federaloffices` reads. Test: row and hand rows agree (R81).
- R93 `budget_class: "ai_act"` for `ask`, `writinghelp`, `groupdescriptiondraft`, `translationdraft`, `textcheck`, `infractiondraft`, `bearingdraft`, `airunstart`, `aiconnecttest`; `aitestrun` `gate_run`; downward override only; an op added later that waits on the Worker's model arrives with `ai_act`.

### Private

- R6 An op spec for every op any module serves, none without a handler or store route. Store-internal, no spec: `monitorlook`, `doorbellrefused`, `checkaddressees`, `projectclaimowner`, `securitycount`, `doorwindow`, `reauthdue`, signin-door's five routes, `grouplogo`, `translationdraftrecord`, `recordcapturedlocator` (R46); browser acts (R76) have no handler.
- R7 No I/O, store, network, clock; no place named.
- Uses (R80, R84): `test-support` `declaredOpsOf(root)` (its R16, tests only) registers owners in `register-owners.mjs`; `op-capabilities.needsRows()` (R3); T53 owners (`ai-use`, `ai-runs`, `ai-gate`, `ai-catalogue`, `notice-producers`, `member-roster`, `mail-door`, `registers`, `local-facts`, `jurisdictions`, `extraction`, `investigation`, `reading-pipeline`, `explore`, `runtime-limits`) each a new edge only where tests import its ops map (BOB records). Older Uses lines name owners read for R6's totality; keep.
- Suggestions: code `bio-plane/src/op-declarations/index.mjs` exporting every name `ops.mjs` exported (R1-R6); tests `bio-plane/test/m/op-declarations/`; `control-plane/ops.mjs` untouched; T45 specs in a file of the module's own (R49).

## Uses: progressions

- Declared flow of stages, grade derived on read; `instances` read (`set`, `limit`, `after`) declared R73.

## Uses: op-capabilities

- `needsRows()`: 323 hand rows (`contribute` 185, `publish` 7, `create_projects` 1, `null` 130), frozen, lazy, no argument, never throws; composed R3.

## Uses: escalation

- Escalation stages; `declinetoescalate`, `escalationstatus`, `escalationreasondraft`, `escalationstoppursuing`, `escalationreopen` (R9, R10, R51).

## Uses: affordances

- `decorate` (its R11) for R1; owns `ACT_HELP` (R48, R53, R54, R64-R66, R69) and `T51_DESIGN_OPS` (R34); `agentpack` equals its untargeted spec (R30).

## Uses: link-sweep

- Ratified sweeps; `sweeps` read (R10).

## Uses: case-import

- Imports a case file read-only; `caseimport` family (R14), `importwatch`, `importunwatch` (R16).

## Uses: wizard-scripts

- Script library; ops R15; its R13 registers served acts, R22/R38 pin the library (R27, R65).

## Uses: events

- events R61 `withdrawEvent({eventId, reason, by})`: refuses `NO_REASON`, `NO_SUCH_EVENT`; repeat `already: true`; the event stays, answering `withdrawn {by, at, reason}`; declared as `eventwithdraw` (R19, T53-603).

## Uses: lines

- `structureat`, `holderat` (its R10, R11), line acts (R18).

## Uses: money

- Stated amounts; family R19. money R39: period `{fiscal, body}` resolved over the governing view, `MONEY_BAD_PERIOD`; R40: fiscal-year view lists governments whose year is known (`start`, `named_by`, `label`, origin), never `*`; reading writes nothing: `moneyfiscalyears`, `moneyby` (R19).

## Uses: money-checks

- Amount checks and detectors; ops map R11 (R19).

## Uses: duties

- The one obligation object; ops map R19 of duties (R19).

## Uses: people

- Person records; ops map R27, `peopledirectory` (R61).

## Uses: explore

- Bounded as-of read; ops R14, `exploregraph`, `exploreverify` field `chain` (R67); class `explore` (R91).

## Uses: calculations

- calculations R53: `calculationcreate`, `calculationevaluate` read an `owner` stamp from the address, never the body, and ask `retrieval` as that owner; family `extra` carries it (R19, T53-603); `spotcheckvisit`, `spotcheck` (R31).

## Uses: workbooks

- A member's own spreadsheet analysis; Purpose only, no op named (R19 family scope).

## Uses: hypotheses

- Hunches and notes; ops map R7 (R19), `noterevise`, `notedelete` (R30), `hypothesistakeup`, `hypothesissetaside` (R43).

## Uses: answers

- Assistant's plane half; `ask` (R20), `standingendset` (R49).

## Uses: following

- Following bodies and registers; `watchlink`, `watchanswer`, `followend` (R49), `followregister` field `proceeding`, `proceedingdates` (R64), `watchitem`, `secondlook`, `secondlookclear` (R73), `followfrom` (R91).

## Uses: standards

- Standards held as content; `standardinforce`, `standardsfor` (R18, R82), `standardinforcethrough` (R31), `standardproposals` (R67).

## Uses: credentials

- Passwords, sessions, run credentials; `AI_GRANT_OPS` stays its own (R68); `claim`, `login`, `recover`, `signout`, `setpassword`, `unlock`, `reauth` (R30, R39, R57); `securitycount` no spec (R6).

## Uses: sources

- Sources as dated disclosures; `sourceof`, `sourcerung` (its R1, R9; R56, R70).

## Uses: entities

- Entity axis; `entityidentify`, `entitieskind`, `entitycreate` (`forum_kind`), `entityidonly`, `subjectsnamed`, `entitysimilar` (R18, R74, R77).

## Uses: ai-runs

- AI run object; `airunopen` (`project`, R74), `airunstart` (R90), `readpages` (R43), `dispatchMemberRun` for the door's op (R51).

## Uses: inquiry

- Inquiry and legs; `claims`, `quietstate`, `interviewform` (R43), `inquirypartition` (R73).

## Uses: capture-requests

- Request door and drain; `capturerequest` reaches a member's own request (its R56; R55).

## Uses: corpus-export

- Verifiable export; `exportrender` (its R10; R17), `export` (R83).

## Uses: actions

- Action object; `addresseesuggest` (its R62; R17).

## Uses: action-clocks

- Deadlines; `clockpropose`, `clockadopt`, `clocksics` (R17), `clockproposals` (R51), `clocksrunning` (R79).

## Uses: membership

- Members and projects; ops R22, `handlecheck`, `handlechange` (R42, R53), `lookedsince` (R67), `lookedat` (R73), `founderhandleset` (R71), `joindoors` (R51).

## Uses: tasks

- Obligation inbox; ops R23, `signrequest` (R59).

## Uses: publication

- Published record; `publishedlist` public (R63); ops of R25 via ratification.

## Uses: ratification

- Signing ceremonies; `publishat`, `caseratify` (R25), `ratify` (R58).

## Uses: retrieval

- Query over the record; `findin` (its R73; R30), `browse` (its R85; R73), `scope` field on `search`, `searchfields`, `meaningrows` (R77), `selectionResolve` (its R18, R19; calculations R53).

## Uses: acquisition

- Fetch and store; `unpack`, `coarchiveset` (R30), `opencaptures` (its R46; R73), `acquire` field `for` (R74).

## Uses: capture

- Intake with provenance; `captureupload` (its R86; R45), `heldat` (its R96; R77), `capturegrade` (R73), `heldcaptures` field `state` (R55, R88), `heldsetaside`, `heldrestore`, `gradenote` (R9).

## Uses: public-read

- Public reads; `credit` (its R30; R30), `publishedfrozen` (its R38; R77), `activityMethod` etc. (R10, R13, R14).

## Uses: instance-setup

- Instance identity; `officesseed`, `placewanted`, `infolevelset`, `infolevel`, translation ops (its R69-R74), update ops (R66), `memberlanguageset`, `grouplogoset`, `grouplanguagesset` (R59); mail domain (its R114).

## Uses: file-safety

- Safe-to-open files; 23 ops (R32); `inboxview` uses its scan and safe view (its R71, R11; doorbell R31).

## Uses: case-carriage

- Edition carriage; `obscuremark`, `photomarks`, `obscuremarkwithdraw` (its R9, R10, R14; R38, R40).

## Uses: ai-use

- Spend and limits; `ailimitset`, `ailimits`, `aiusage`, `exploreapprove` (R41), `aiuseovertime` (its R14; R67).

## Uses: publish-schedule

- Set-time publishing; `publishatmove`, `publishatcancel`, `publishschedule` (R25).

## Uses: reading-guides

- Guides; `guidedraft`, `guidereview`, `guideoffer`, `guideadopt`, `guideretire`, `guides`, `guidepropose`, `guideproposetocivicsmith`, `guidefor`, `guide`, `guideproposals` (R43), `procedureguides` (its R16). `procedureGuidesFor({kind, viewer})` (its R19) offers a profile guide only with writer, sources, professional review, second approver; else `not_offered: [{kind, lacks}]`, `lacks` in `writer`, `sources`, `professional_review`, `second_approval` (R84).

## Uses: run-productions

- AI run productions; `readpages`, `guidepropose` (its R15, R22-R24; R43).

## Uses: steps

- Steps and following; the `steps` ops (its R5, R9, R10, R12, R15, R16, R24; R43).

## Uses: question-explorer

- System-run exploring; `findmute`, `finddoors` (its R6; R43).

## Uses: investigation

- Milestones, reports, interview; ops R43; `milestonereminder` `at` is a body field, not a stamp.

## Uses: leg-earning

- Earned legs; Purpose only, no op named (R19 scope).

## Uses: case-authoring

- Case preparation, `publish`; `publish`, `publishpreflight` keep specs, `flagsDisclosed` a body field (R14); owns none of R43's (R48).

## Uses: review

- Review copy; `reviewcomments`, `reviewgrant` (field `until`, R67), `reviewcomment`, `reviewcopy` (R8, R43).

## Uses: provenance

- Trust root; `recordcapturedlocator` (its R53) declared so no caller writes an upload receipt (R46).

## Uses: action-plans

- Action plans; `optionstartpreview` (R11), `planproposals` takes no `after` (R46), `planask` (R67), `checkpointsdue` (R77).

## Uses: extraction

- Readings; `pagetranscribe` via `pageTranscribeOp` (its R71; R47).

## Uses: case-account

- Case account; `accountpropose`, `accountdrafts` (its R1, R3; R48).

## Uses: action-holds

- Holds and pressure; `actionholdrelease`, `actionholdpreview`, `projectholds` (R12), `holdsdue` (R78), `pressurefor` (R67).

## Uses: action-replies

- Replies; `actionreplyquoting` (its R10; R64), refused to an `ai` credential.

## Uses: plan-work

- Plan management; `statusreportassist` (its R14; R51).

## Uses: filings

- Filings; `templatesForAction` (its R41, R65), `filingread` (R67), `stakeatpreparation` (R73), `approvedunsent` (R77); assertion resolution declared in its family, never `actions`' (R49); R84 enumerates its ops.

## Uses: conformance

- Determinations; ops declared by R49's rules.

## Uses: consequences

- Consequences of a breach; ops declared by R49's rules.

## Uses: case-check

- Held publication check; ops declared by R49's rules.

## Uses: project-roster

- Roster and requests; `projectlist` (its R26, R36), `projectownervotes` (R72), `projectstakeset`, `projectstake`, `projectownersgone` (R73), `projectinvitations` (R77).

## Uses: local-facts

- Local calendar confirmations; `factconfirm`, `factstatus`, `factsdue` (R8), `rulefields`, `ruledraft`, `ruleconfirm`, `rulewithdraw` (R78).

## Uses: ai-accounts

- R35 is retired (K5457): its seven ops (`subscriptiondisconnect`, `groupkeynoticeseen`, `groupkeyremove`, `groupkeyswitch`, `groupkeyset`, `accountreferenceset`, `accountreferenceremove`) leave the door with no aliases; its R61 declares replacements via `DECLARED_OPS` (R90, T53-556): `aiaccountadd`, `aiownadd`, `aiaccountremove`, `aiaccountswitch`, `aiorderset`, `aiprojectorder`, `aimineuse`, `aimemberallow`, `aiprojectuse`, `aicheckset`, `aiprojectcheckset`, `aimycheckset`, `aikeyenter` (`key` accepted and required, never echoed), `aikeycloudflare`, `aitermsaccept`, `aipersonalchoose`, `aicreditsclear`, `aisend`, `aioptinset`, `aitermswithdraw`; R71 adds `aikeyseal` (`account_id`, `secret`); R36 keeps `projectaikeepaway`, `aikeepaway`; R37 `accountusesset`. R65-R67: `aicredential` (`{account_id, act}`, only the agent Worker's principal, else `AI_CREDENTIAL_NOT_SERVED`, wrong account `NOT_YOUR_ACCOUNT`, on `AI_GRANT_OPS` and `PLANE_OPS`), `aigatewayserved`, `aicredentialfailed`. Grades (R90): `aitermsaccept`, `aipersonalchoose`, `aicreditsclear`, `aioptinset`, `aiorderset` reversible; `aikeyseal` ground `credential`.

## Uses: connections

- `stepsource`, `stepsourcewithdraw` (its R68; R67).

## Uses: action-records

- `actionseekspropose`, `actionstake`, `actioninquiry` (its R3, R17, R19; R43, R73).

## Uses: setup-words

- Frozen interface word list; pure; relevant to the words check of T53-362 (R7), no op.

## Uses: filing-templates

- Template library; `templatesFor`, `templateRead` (R14), `offeredVersion` (R25, R26), `templateByHandle` (R34), `unofferedFor` (R35); court-filed kinds offer none (R28); R84, R78.

## Uses: promotion

- `bundlehistory` (its R58; R77); an edge only if tests import its ops map.

## Uses: basis-versions

- `projectquestions` (its R50; R55), `versioncompare` (its R55; R77).

## Uses: member-roster

- R89 `adminProposalCancel({memberId, by})` (`op=adminproposalcancel`): refusals in order `NOT_AN_ADMIN`, `NO_SUCH_MEMBER`, `NO_WAITING_PROPOSAL`, `NOT_YOUR_PROPOSAL`; answers `{ok: true, memberId, status: "revoked", proposal: "cancelled", by, at, endorsedBy}`. R85 `adminRemovals({by, limit})` (`op=adminremovals`): active member or founder gets `{ok: true, removals, limit, truncated}`, any other caller `removals: []`. R91 declares both: `adminproposalcancel` (classes `admin`, `member`, `probe`; mutating; weight `credential`; stamps `viewer`, `by`; requires `["memberId"]`), `adminremovals` (read; `machineClasses: []`; `by`; accepts `["limit"]`). Our R89.

## Uses: citation

- `drawquestion` (its R14; R55), stamps as `cite`'s.

## Uses: test-support

- R15 `declaredOpHolds` (only `requires`; without each required entry, refused naming it; a field outside `accepts` dropped or refused); R16 `declaredOpsOf(root)` answers `{ops, owners, duplicates}` from `build/modules.json`, tests only; used by R80, R84.

## Uses: ai-gate

- Gate 1 suite; context for `aitestrun` (`gate_run`, R90, R93).

## Uses: ai-catalogue

- Catalogue of AIs; owner edge for the assistant ops (R90).

## Uses: notice-producers

- Feed producers; owner edge for R90; `creditsStopsOpen` Queue item closed by `aicreditsclear` (R90).

## Uses: mail-door

- Member's private mail address; R12: off by default (`MAIL_OFF`, `MAIL_NOT_SET_UP`); `mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete` declared by its exported `DECLARED_OPS` (as doorbell R26) and routed by `control-plane`; the `email()` entry is not an op (R92 (1), R80, R81).

## Uses: registers

- R38 `DECLARED_OPS` declares every op it serves (twelve; `registerfileimport`, `registerpreread`, `registerinterest`, `registerofficers` among them); `rowexpunge` reasoned, irreversible; machine refused on register writes; `registerdelta`, `registersearch`, `registercompare` class `explore` (R87, R91, R92).

## Uses: jurisdictions

- Profiles as data; Purpose only; `attributionLacks` (its R126) drives R84; no place named here (R7).

## Uses: reading-pipeline

- Pure reading producer; Purpose only; owner edge (R92).

## Uses: runtime-limits

- R41 time classes are rows of the bounds table (`{ceiling_ms, p90_factor 1.5, hops}`); `budgetOf(class)` answers the row or throws an `Error` naming the class; R42 override downward only, above refused naming it; used by R87, R93.

## Uses: doorbell

- doorbell R13 `pullKnock` (`op=inboxpull`), stamped `viewer` (R74); R26 `DECLARED_OPS`: `knock`, `knocksof`, `inboxpull`, `inboxresolve`; R31 `inboxView({knockId, viewer})` (`op=inboxview`), a read, member session only: checks the digest, runs `file-safety`'s scan and safe view (R71, R11), answers only the safe view (first 500 pages, stated as a view), files nothing, keeps no record of who looked, Reversible, no reason; refusals `NO_SUCH_KNOCK`, locked file (`file-safety` R54), `NO_SAFE_VIEW`, `KNOCK_BYTES_CHANGED`, `EVIDENCE_NOT_HELD` (R49, R77, T53-558).
