# Plan T49: additions (N1078–N1088, the two splits)

**Status** · A worker's draft for BOB #176 (2026-10-14, P18). Not yet reviewed. It adds to `draft-T49-plan.md` and changes nothing in it that BOB #174 settled ("Settled by BOB #174" and "Added by BOB #174" stand as written). N1089–N1094 (DEC-235–DEC-240) are drafted by another worker; where one of these entries meets one of those, it is said so under "Doubts" and in the entry.

**Sources** · `next.md` N1078–N1088, each read whole; every `next.md` entry from N1058 on checked against the draft; `draft-T49-plan.md` whole; `modules.json` (order, layers, uses); requirements of capture, extraction, ai-runs, standards, explore, review, instance-setup, op-declarations, interface-shell, screens-inquiry, screens-investigate, screens-publish, screens-daily, store-door, membership, publish-schedule, ratification and jurisdictions, in the parts these entries touch; K3293, K3295, K3297, K3298, K3302, K624, K625, K657, K2375, K3283, K3269, K3275, K3294; DECISIONS DEC-218 and DEC-236 (B204); `words.json` on `tranche/T48` (it has `main` with PR #36 merged, `1b8d1c4a40`); PROCESS-DESIGN P8, P10, P19; MECHANICS §3, §5.2, §12.2. Sizes count own code in each module's `paths` on `tranche/T48` @ `1b8d1c4a40`, without tests and generated files (K2513).

**Entries from N1058 on that the draft does not mention.** None besides N1078–N1088. `next.md` holds no N1058, N1059 or N1063. Every one of N1060–N1062 and N1064–N1077 is in the draft, placed or left out.

## Disposition at a glance

| entry | disposition | where |
|---|---|---|
| N1078 | **placed** (the keys exist now: all eight `shell.card.<kind>` are in `words.json`) | T49-33 interface-shell (L11); screens-inquiry's half joins T49-19 |
| N1079 | **placed** (capture's half may already be met: doubt 1) | T49-24 capture (L3); T49-34 screens-investigate (L11) |
| N1080 | **placed** | T49-24 capture (L3) |
| N1081 | **placed** | T49-29 review (L8); T49-35 screens-publish (L11) |
| N1082 | **placed** | T49-25 extraction (L4); T49-28 ai-runs (L6) |
| N1083 | **placed** | T49-33 interface-shell (L11) |
| N1084 | **placed**: the split, by copy | T49-30 translations (new, L11); T49-32 instance-setup (L11); re-points join T49-16, T49-21 and T49-36 store-door |
| N1085 | **placed** | T49-26 standards (L5); a guard in T49-34 |
| N1086 | **placed** | T49-27 explore (L5); T49-34 screens-investigate (L11) |
| N1087 | **placed** (DEC-236 B204 (2) drew the list; `importedcases` is served) | joins T49-18 screens-daily and T49-35 screens-publish; the same work as N1090's DEC-236 lines (doubt 3) |
| N1088 | **placed in part** | the readings a provider serves join T49-18, once BOB names them at the fold (BOB's act, P17); each reading no provider serves is left out by name (a dependency not yet built) |
| op-declarations' split (M-T49-1) | **placed**: the split, by copy | T49-31 op-capabilities (new, L11); T49-16 deletes and composes |

Nothing in N1078–N1088 is left out whole.

## Opening acts these additions add (K657, K1043; BOB's)

The draft's rule 4 ("No module is added … no `MODULE_ORDER` entry") no longer holds. T49-23 (`site`) already added one module. Rule 4 then reads:

1. **`modules.json`** gains three modules, each with empty `paths` and `tests` until its job's merge (K1043):
   - `translations`: layer 11, directly after `instance-setup`. Uses `record-grammar`, `jurisdictions`, `record-core`, `membership`, `setup-words`, `instance-setup` and `test-support`. The extraction map confirms the exact list from the copied code's imports.
   - `op-capabilities`: layer 11, directly after `translations` and directly before `op-declarations`. It uses nothing.
   - `site`: layer 11, after `installer` (already in the draft, T49-23).

   The L11 order around them is then: … `setup-words`, `instance-setup`, `translations`, `op-capabilities`, `op-declarations`, `admission`, ….
2. **New `uses` edges:** `op-declarations` → `op-capabilities` and → `translations`; `plane` → `translations`; `store-door` → `translations`; `review` → `jurisdictions` (N1081: the group's zone through `combine`, as publish-schedule R1 and ratification R44 read it); `public-read` → `project-roster` (already in the draft). At instance-setup's merge, `instance-setup` drops `setup-words` if nothing it keeps still imports it (only R68's `INTERFACE_WORDS` does today).
3. **`MODULE_ORDER`** (membership R83, its code) gains `translations`, `op-capabilities` and `site`. The draft gives T49-23 "its MODULE_ORDER entry" but no job carries it. Membership's only T49 job is T49-1 in L2, so the line joins T49-1 as **membership R145** (R144 is N1072's). Each new id is tolerated as not yet built until its job merges with its `paths` (R140's form). Then `module-order.test.mjs` is green from L2 on.
4. **`layers.md`**: L11's list gains `translations` and `op-capabilities` (BOB's edit).
5. **The extraction maps** (P18, written before L11's START by a worker, reviewed): `build/extraction/instance-setup-split.md` and `build/extraction/op-declarations-split.md`, each naming every moved line range, table, row, route and test, and every caller to re-point.

## N1084 · instance-setup's split (P6, K624)

**Why.** instance-setup has **4,320** lines of its own code (`setup.mjs` 4,000, `livefire.mjs` 249, `setup-fleet.mjs` 71), past ~4,000. T49 has no instance-setup entry of its own (N1072 needs no line there). The split is therefore its one entry.

**The cut.** The translation workspace and the reading language move to a new module, **`translations`** (`bio-plane/src/translations/`, tests `bio-plane/test/m/translations/`). They move as copied code, with no change of meaning:
- `setup.mjs` from about line 2,640 (`#translationActor`) to line 3,216 (`readingLanguage`): the grant, draft, adopt, confirm, revert and mark acts, `translations`, `interfaceWords` and `readingLanguage`, with their private helpers;
- the constants `INTERFACE_WORDS`, `INTERFACE_WORDS_COMMIT`, `TRANSLATION_DRAFT_MAX`, `TRANSLATION_TEXT_MAX`, `TRANSLATION_NOTE_MAX` and `TRANSLATION_DRAFTER`;
- the seven `translation_*` tables (schema about 78 lines, the table list, the purge declarations). Their names and SQL stay unchanged, in the same store object, so a group's kept translations carry over with no migration;
- their ten routes in the ops map, served as `translationsOps` (`translationdraft`, `translationdraftrecord`, `translationgrant`, `translationadopt`, `translationconfirm`, `translationrevert`, `translationmark`, `translations`, `interfacewords`, and any other route the map finds).

About 690 lines move, and about 800 if the rows move too (doubt 2). That leaves instance-setup about 3,500–3,630.

**Requirements (text to write at the fold, BOB's, K624):**
- `requirements/translations.md` (new): R1–R10 are instance-setup R67, R68, R69, R70, R71, R72, R73, R74, R75, R87, in that order, each "was instance-setup R<n>", not yet met (T49).
- In instance-setup, those ten are retired "moved to translations R<n>".
- instance-setup's **Provides** keeps R64 (a member's language), which translations reads (R74's default language, R87's member language).

**Why after instance-setup, not before.** translations reads instance-setup's R64 (`memberLanguage`), so it must come later in the order. The cost of that placement: instance-setup cannot re-export the moved names (it may not import a later module, P4). Every caller therefore re-points before instance-setup deletes its copy.

**The callers to re-point** (from the grep at this draft; the map confirms them):
- `plane`: `store.mjs` spreads `translationsOps` beside `instanceSetupOps`, and `ask.mjs` reads `translationsOf(ctx, env).readingLanguage` (plane R50, R40). This joins T49-21.
- `op-declarations`: the eight translation ops leave the `instance-setup` family for a `translations` family. Their names, specs, classes and stamps are unchanged; only the owner and the cite change. This joins T49-16.
- `store-door`: R10's `translationdraft` route asks `translations.translationDraftRefusal` and `translationDraft`, and `routes.test.mjs`:116–121 wraps them there. This is T49-36.
- `answer-envelope`: only under doubt 2 (a).
- Tests in other modules that import the moved names: `plane/t48.test.mjs` re-points within T49-21, and `run-rules/ask.test.mjs` is named in the map. If run-rules' test imports `readingLanguage`, it reads the plane's answer and is not touched (the map says which).

**Order (K624, K625).** T49-30 builds the copy and merges first in L11's split group. T49-16, T49-21 and T49-36 re-point. T49-32 (instance-setup) deletes its copy and merges **after** them, by BOB's CHANGE. This is the layer's one exception to `modules.json` order (rule 1 "unless the layer says otherwise"). Between T49-30's merge and T49-32's, the code is held twice inside the tranche only, never across tranches (K624 (1)).

## op-declarations' split (M-T49-1, K3298; the draft names it but not how)

**Why.** op-declarations has **4,026** lines (`index.mjs` 3,731, `t45`–`t48.mjs` 295). T49-16 adds about 100 more.

**The cut.** The hand-written rows of the capability table `NEEDS` (`index.mjs` 2,413–3,331, about 919 lines, most of them its standing rationale comments) move to a new module, **`op-capabilities`** (`bio-plane/src/op-capabilities/`), by copy and with no change of meaning:
- It exports `needsRows()`: the frozen map of each op's capability, or the stated `null` with its reason, built on the first call. So R69's rule holds (evaluating the module builds no table). It imports nothing (R5, R7's form).
- `op-declarations` keeps `NEEDS` as it is exported today, composed in `build()` as `aliasRows({...needsRows(), ...FAMILY_NEEDS})`, and keeps `ACT_GATE`.

This is the cleanest cut. The block's only reference to the rest of the file is `...FAMILY_NEEDS`, which stays in op-declarations' composition. `admission`, `control-plane`, `interface-shell` and `plane` keep importing `NEEDS` from op-declarations, so **no caller re-points**. R3's two-way census test (every session-reachable mutating op has a row, and nothing is named that no session reaches) stays op-declarations' own, over the composed table. It leaves op-declarations about 3,110 lines before T49-16 (about 3,210 after it). op-capabilities is about 940.

**Requirements (text to write, BOB's, K2375's form: an id split, none retired whole):**
- `requirements/op-capabilities.md` (new): R1, the rows (op-declarations R3's `NEEDS` half: one capability or a stated null per op; an op with no row needs none); R2, frozen data that imports and reads nothing (R5, R7's form); R3, built on first read (R69's form). Each not yet met (T49).
- op-declarations R3 is re-worded: `NEEDS` is composed from `op-capabilities.needsRows()` and the families' kinds, aliases applied. Its meaning is unchanged.
- The many per-tranche clauses ("with `NEEDS` `contribute`", R8–R18 and on) stay op-declarations', since the composed table answers them.

T49's new ops are all family ops (N1072 `founderhandleset` in membership's family; the N933 ops in their owners' families), so their rows come from `FAMILY_NEEDS` and no new row is owed to op-capabilities. If T49-16's START finds one that is not a family op, its row goes to op-capabilities by CHANGE.

**Order.** T49-31 merges early, ahead of T49-16, which then deletes its copy of the rows and composes.

## Entries

The draft's style. Every new or amended line ends *(not yet met: T49)*. Ids are each file's next free id on `tranche/T48`, re-checked at the fold.

### L2 (joins)
- **T49-1 · membership** gains: (K657; N1084, M-T49-1, T49-23) **R145**: `MODULE_ORDER` gains `translations` and `op-capabilities` (L11, after `instance-setup`, in that order) and `site` (L11, after `installer`), each tolerated as not yet built until its job merges with its `paths` (R140's form). `module-order.test.mjs` reads `modules.json` (N1073, already in T49-1) · req: R145 · text to write · stays claude-sonnet-5-5 · L2 order unchanged.

### L3
- **T49-24 · capture** · (N1080, K3295) R91: `heldCaptures` bounds the work it does per page. R78's examination (`#eligibility`) and the archive grouping (`#archiveRow`) are asked once per page for the page's documents, not once per row with no bound, and an answer not given in time reads undetermined (R78's `eligible: null` with its basis; an archive row as a file row). The walk's unfiltered `heldcaptures` then answers. Measured first at the plane's shape (P6), with the time per row stated in the test. (N1079, K3295) R77's rows already answer `capture: {sha256, grade}` (T47, N979): START confirms this against the composed plane's `heldcaptures`. If it holds, no line is owed here and N1079 is screens-investigate's alone (doubt 1). If not, R77 is met first. (N1062, K3227) `evidence-absent.test.mjs`:77's source scan becomes an interface test of R63's one refusal on every path, then the scan is deleted (the wait ends: capture has a substantive entry). (N1073) its hand-lists (draft-T49-N1073-hand-lists.md) read the owners' declarations · req: R91 (text to write); R77 only if START finds it unmet · claude-sonnet-5-5 · alone in L3.

**L3 merge order:** capture.

### L4
- **T49-25 · extraction** · (N1082, K3297) R76, amending R72: the transcriber's `transcription(...)` takes `trace` and `memberRef` (the strings the door handed, `control-plane` R93) and forwards them to `/transcribe` unchanged, never from its caller's body. Tested at the stub binding, with a control that a call handed none forwards none (`plane` R55's shapes). (N1066, K3241) `t43`:114 and `t44`:152 pin the exact status; the key-leak checks run on every transcriber path; `t43`:20's `deployable` stub gains its false arm (the wait ends). (N1068) "labelled" → "labeled" in its member-facing words (rule 6) · req: R76 · text to write · claude-sonnet-5-5 · no edge to T49-28 (each forwards on its own path).

**L4 merge order:** extraction.

### L5
- **T49-26 · standards** · (N1085, K3302) R58, amending R57: each `standardproposals` item also carries `project`, the project it was proposed for (R56), so a screen can check it · req: R58 · text to write · claude-sonnet-5-5 · provider for T49-34.
- **T49-27 · explore** · (N1086, K3302) R25, amending R21: `exploregraph`'s `steps` keep a `step_source` hop's `attached_by` and `at` (as R2's walk answers them), and each node carries `label`: its name as its owner answers it (the person's or entity's name), `null` when the record holds none. A node is never labeled by its id (DEC-236 B204 (3) draws `null` as "Not yet named") · req: R25 · text to write · claude-sonnet-5-5 · provider for T49-34.

**L5 merge order:** standards, explore (`modules.json` order; no edge between them).

### L6
- **T49-28 · ai-runs** · (N1082, K3297) R80, amending R18's T47 clause: `dispatchMemberRun({run, by, at, trace, memberRef})` takes the two strings and forwards them to agent-worker's `/run` (`plane` R55's headers), never from the request's body. Tested at the stub binding, with a control. (N1073) its hand-lists read the owners' declarations · req: R80 · text to write · claude-sonnet-5-5.

**L6 merge order:** ai-runs.

### L8 (one more)
- **T49-29 · review** · (N1081, K3295) R35, amending R34 and R10: the copy's answer to an outside reader carries `zone` beside `grant.until`, the group's time zone (the active profiles' `time_zone`, `jurisdictions` R41, through `jurisdictions.combine` over record-core's `jurisdiction_profiles`, as publish-schedule R1 reads it), and `zone: null` when none is held. It is never a guess and never UTC by default. Uses `jurisdictions` (opening edge) · req: R35 · text to write · claude-sonnet-5-5 · provider for T49-35.

**L8 merge order:** public-read, case-import, review (`modules.json` order; no edge among them).

### L11

New jobs:
- **T49-30 · translations** (new module; N1084, K3302, P6) · built by copy from instance-setup (map `build/extraction/instance-setup-split.md`): R1–R10 = instance-setup R67–R75, R87, unchanged in meaning; its tables, its routes as `translationsOps`, and the copied tests (`interface-words.test.mjs`, `translations.test.mjs`, and the translation parts of `t41`/`t48.test.mjs`) in its own `tests` · req: R1–R10 · text to write (moved ids, "was") · claude-sonnet-5-5 (doubt 4) · merges first in L11's split group, before T49-16, T49-21, T49-32 and T49-36.
- **T49-31 · op-capabilities** (new module; M-T49-1, K3298, P6) · built by copy from op-declarations (map `build/extraction/op-declarations-split.md`): `needsRows()` with every hand-written `NEEDS` row and its comment, built on first read · req: R1–R3 · text to write · claude-sonnet-5-5 (doubt 4) · merges before T49-16.
- **T49-32 · instance-setup** · (N1084, K624) deletes its copy of the translation workspace once T49-16, T49-21 and T49-36 have merged (BOB's CHANGE); retires R67–R75 and R87 "moved to translations R<n>"; drops `setup-words` from its imports if R68 was the last; keeps R64. The C-64 rows as doubt 2 settles. Its tests drop the moved cases (now translations'). (N1072) no line, as the draft found (re-checked here) · req: the ten retirements (text to write, BOB's) · claude-sonnet-5-5 (doubt 5) · merges after plane (T49-21), before installer, `site` and journey-check.
- **T49-33 · interface-shell** · (N1078, K3293) R65: `REF_SCREENS` gains the kinds `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony` and `docket`, each card's words by key (`shell.card.<kind>`, all eight in `words.json` since PR #36). (N1083, K3297) R66, amending R27: `cs.checks` also takes options as record data (`{value, text}`, `text` drawn HTML-escaped and never read as a key), as `cs.choice` does. (N1073) its hand-lists. One job per module: it merges with N1090's and N1094's interface-shell lines (doubt 3) · req: R65, R66 · text to write · claude-sonnet-5-5 · before every screen job.
- **T49-34 · screens-investigate** · (N1079, K3295) R27, amending R23: the passage, calculation and content-id fields become `cs.choice` over the record data a read answers (`heldcaptures`' `capture.sha256` with each row's title; the passages and content ids the record's reads name), never typed ids. (N1086) R28, amending R18: each node of the connection graph is labeled by explore R25's `label`; a `step_source` hop draws its `attached_by` and `at`. (N1085) R29, amending R19: a project's standard proposals are drawn only where an item's `project` (standards R58) is the address's project, so a read that over-answers is never drawn (doubt 6). (N1073) its hand-lists. One job per module: it merges with N1090's screens-investigate lines (`connection.node.unnamed`, `step_source`'s group; doubt 3) · req: R27–R29 · text to write · claude-sonnet-5-5 · after T49-26, T49-27 (by layer), T49-33.
- **T49-35 · screens-publish** · (N1081) R22, amending R18 and R19: `review-outside` draws the link's end as the member's chosen day in review R35's `zone`. Only with `zone: null` does it draw the date and time with "UTC" named (R19's interim, K3295). (N1087, DEC-236 B204 (2)) `imported` with no subject draws the list of imported cases from `importedcases` (case-import R4) with `screen.imported.list*` and its empty state; the interim rows go. (N1073) its hand-lists. One job per module: it merges with N1090's and N1094's screens-publish lines (doubt 3) · req: R22, and R23 for the list (or N1090's id, one line only) · text to write · claude-sonnet-5-5 · after T49-33.
- **T49-36 · store-door** · (N1084) R10's `translationdraft` route asks `translations.translationDraftRefusal` and `translationDraft` in place of instance-setup's, and `routes.test.mjs`:116–121 wraps them there. Behaviour unchanged. (N1073) its hand-lists (the draft's census names store-door) · req: R10's sub-bullet re-worded (BOB's edit) · **claude-haiku-5-5** (a mechanical re-point, K3294) · after T49-30, before T49-32.

Joins to existing entries:
- **T49-16 · op-declarations** gains: (M-T49-1) it deletes its copy of the `NEEDS` rows, imports `op-capabilities.needsRows()` and composes `NEEDS` (R3 re-worded, text BOB's). (N1084) R73: the eight translation ops form the `translations` family (owner `translations`, cite translations R1–R10); their specs, classes, stamps and session sets are unchanged · req: R3 re-worded, R73 · after T49-30, T49-31.
- **T49-18 · screens-daily** gains: (N1087, DEC-236 B204 (2)) R20's link reads `screen.imported.list` ("Imported cases") and opens the list. (N1088) each Home reading that BOB names at the fold from a merged provider's read, drawn under R17's rules · req: R20 amended, plus one id per named reading at the fold · stays claude-sonnet-5-5.
- **T49-19 · screens-inquiry** gains: (N1078) R18's links are drawn for every kind T49-33 adds. The project's page reads its plans (`plans`), and the question's page reads its case, so each link has its subject, not only where an existing read names it · req: R18 amended, id after T49-19's own · after T49-33. N1091 (DEC-237, the project page) touches the same page (doubt 3).
- **T49-21 · plane** gains: (N1084) `store.mjs` spreads `translationsOps` beside `instanceSetupOps`; `ask.mjs` reads `translationsOf(ctx, env).readingLanguage` (R40, R50's text re-worded, BOB's); `t48.test.mjs`'s translation case re-points · after T49-30.

**L11 merge order (revised):** op-grades, affordances, setup-words, **translations** (T49-30), **op-capabilities** (T49-31), op-declarations (T49-16), **store-door** (T49-36), **interface-shell** (T49-33), screens-entry, screens-daily, screens-inquiry, **screens-investigate** (T49-34), **screens-publish** (T49-35), control-plane, plane, **instance-setup** (T49-32, after its callers re-point: the layer's exception to `modules.json` order, K624, K625), site (T49-23), journey-check last. setup-words still merges before any screen that reads DEC-229's or DEC-230's keys. interface-shell merges before every screen job. Until plane merges, the screens test against a fake plane (K31's pattern).

## Count (revised)

**36 jobs** (the draft's 23, plus 13): L2 5, **L3 1, L4 1, L5 2, L6 1**, L7 1, **L8 3**, L9 4, **L11 18** (op-grades, affordances, setup-words, translations, op-capabilities, op-declarations, store-door, interface-shell, screens-entry, screens-daily, screens-inquiry, screens-investigate, screens-publish, control-plane, plane, instance-setup, site, journey-check). L1 and L10 have none. The count falls if N1089–N1094's draft opens no other job in these modules, or rises by its own new modules. BOB reconciles the two at the fold (doubt 3).

## To fold before START (additions)

| entry | requirements file | what to write |
|---|---|---|
| T49-1 | `membership.md` | R145 `MODULE_ORDER`'s three ids |
| T49-24 | `capture.md` | R91 (the page's work bounded); R77 only if unmet |
| T49-25 | `extraction.md` | R76 (`trace`, `memberRef` forwarded) |
| T49-26 | `standards.md` | R58 (`project` per item) |
| T49-27 | `explore.md` | R25 (step fields kept; node `label`) |
| T49-28 | `ai-runs.md` | R80 (`dispatchMemberRun` forwards them) |
| T49-29 | `review.md` | R35 (`zone`); Uses gains `jurisdictions` |
| T49-30 | `translations.md` (new) | R1–R10, moved; Purpose, Provides, Uses |
| T49-31 | `op-capabilities.md` (new) | R1–R3 |
| T49-32 | `instance-setup.md` | ten retirements, "moved to translations R<n>"; Status |
| T49-16 | `op-declarations.md` | R3 re-worded; R73 the `translations` family |
| T49-33 | `interface-shell.md` | R65, R66 |
| T49-34 | `screens-investigate.md` | R27–R29 |
| T49-35 | `screens-publish.md` | R22 (and the list's line, once with N1090) |
| T49-36 | `store-door.md` | R10's sub-bullet names translations (BOB's edit) |
| T49-18 | `screens-daily.md` | R20 amended; one id per named Home reading |
| T49-19 | `screens-inquiry.md` | R18 amended for N1078 |
| T49-21 | `plane.md` | R40 and R50 name translations (BOB's edit) |

Plus the two extraction maps (opening acts (5)) and `layers.md`.

## Changes to the draft's "Left out"

These rows leave "Left out", because their module now has a substantive T49 entry and their wait ends:
- N1062 (capture), which joins T49-24;
- N1066 (extraction), which joins T49-25;
- N1068 for extraction, which joins T49-25 (rule 6);
- N1073 for capture, ai-runs, store-door, interface-shell, screens-investigate and screens-publish, each of which joins its job.

These rows are **added** to "Left out":

| entry | hard reason |
|---|---|
| N1088's Home readings that no provider serves at the fold (candidates below) | a dependency not yet built: no read serves the reading; each becomes its provider's entry, named by BOB at the fold |
| N1083's use on screens-action (the scenario form's hand-drawn `fieldset.cs-field` moved to `cs.checks`) | none of its own: it joins screens-action's T49 entry if N1093 (DEC-239) opens one; otherwise no behaviour (a re-point onto the shell's control), and it waits for screens-action's next entry, wait 1 of 3 (by T51) |

**N1088 candidates** (for BOB's naming at the fold; read from the requirements, not verified at the plane):

| reading (DEC-218's owed list) | provider read, if one is served |
|---|---|
| documents | capture `heldcaptures` (R77) for held documents. A count of the group's documents: none found |
| people followed | following `follows` |
| clocks running and whose move | none member-facing found (`clockstate` appears only in op-grades); action-clocks to confirm |
| cases, editions, drafts shared, waiting to sign | review `casedrafts` (per project); publication's and public-read's case lists to confirm; "waiting to sign": none found |
| expertise on hand | `expertiselist` (served to screens-settings) |
| security level | none member-facing: `securitycount` is store-internal (op-declarations) |
| edition drafts | `casedrafts`, `whatchangeddrafts` to confirm |

## Measure first (additions)

- **M-T49-1** gains:
  - instance-setup **4,320**: past the mark, so it splits in T49 by T49-30 and T49-32, about 3,500–3,630 after;
  - op-declarations **4,026**: splits by T49-31 and T49-16, about 3,110 after, about 3,210 with T49-16's additions;
  - ai-runs 3,672; standards 3,571; extraction 3,277; capture 3,253; screens-investigate 2,559; interface-shell 2,414 (each well under the mark with its entry).
- **M-T49-3** (N1080, P6): `heldcaptures`' time per row at the plane's shape, before and after T49-24, in T49-24's record.

## Doubts for BOB (each BOB's, P17; none is Bob's)

1. **N1079's capture half may already be met.** capture R77 (T47, N979) already answers each row's `capture: {sha256, grade}`, and `capture/index.mjs` builds it (`#captureOfDocument`). SCREENS-INVESTIGATE #2 may have read a fixture or fake plane without it. *Recommended:* T49-24's START checks the composed `heldcaptures`. If the field holds, N1079 is screens-investigate's alone (reading `capture.sha256`) and capture's job is N1080's. N1080 alone still justifies the job.
2. **The translation rows (C-64) in the split.** (a) The rows move with their code to `translations` (K231's owner, as C-115.47 moved, K3283). answer-envelope's `families.mjs` `FILE_LIST` then needs a `["src/translations/index.mjs", …]` entry, which means a haiku answer-envelope job (+1 job). (b) The rows stay in instance-setup's `INSTANCE_SETUP_CHECKS`, read by translations through an earlier module (as instance-setup answers membership's `NO_SUCH_MEMBER`, R75). Only their `where`s change, and the row census is red until T50's stamp either way (rule 5 (2)). *Recommended:* (b), unless the extraction map finds that a row's `where` must name its family's own file (promotion's `moved.test.mjs`, answer-envelope's families test). In that case, (a).
3. **Overlap with N1089–N1094.** N1087 is DEC-236's B204 (2), and DEC-236's "owed" list (N1090) names the same screens-daily R20 link and screens-publish list. N1086's screen half meets N1090's `connection.node.unnamed` and `step_source` group. N1078's screens-inquiry half meets N1091 (the project page). T49-33, T49-34 and T49-35 meet N1090's and N1094's interface-shell, screens-investigate and screens-publish lines. *Recommended:* one job per module across both drafts. Where the same work is drafted twice, it is written once, citing both entries. Re-count after merging the drafts.
4. **The model for the two copy-built modules.** K3275 keeps the default model for "a new module". T49-30 and T49-31 are new modules built by copy, with no change of meaning (K624). *Recommended:* claude-sonnet-5-5, as the cheapest able (K3294), with one model up on a test block. The alternative is the default model, on the letter of K3275. Either way, record it in rulings-active.
5. **instance-setup's deleting job's model.** K3294 gives haiku for a mechanical re-point, but this job deletes about 700 lines from a 4,000-line file, keeps R64 and its routes working, and waits on three CHANGEs. *Recommended:* claude-sonnet-5-5. store-door's single re-point (T49-36) is haiku.
6. **T49-34's guard (R29) goes slightly past N1085's text.** N1085 says only "so a screen need not trust the read's filtering". *Recommended:* the screen checks `project` in the same job, since it is one line in a job that is open anyway (P8). The alternative is to leave screens-investigate trusting the read, and N1085 gives no member-visible change.
7. **The order exception in L11.** instance-setup merges after plane, out of `modules.json` order, because it cannot re-export a later module's names. The alternative is to place `translations` *before* instance-setup, moving R64 (a member's language) into it as well. Then instance-setup re-exports everything and no caller re-points (T49-36 and the plane and op-declarations re-points disappear), but it is a larger move than N1084 names. *Recommended:* after, as N1084 and K624 describe, with the order exception named.
8. **Outside these entries (noticed, not handled):** DEC-240 (on `main`) drew the test-instance band, which the draft's "Left out" holds as N1049 "Bob's (UX): to draw". The N1094 worker or BOB should re-test N1049's hard reason at the fold.
