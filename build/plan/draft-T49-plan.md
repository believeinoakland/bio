# Plan T49

**Status** · DRAFT for T49, by BOB #174's worker (2026-10-14, P18). Not adopted. It opens the moment T48 closes (P19), from `main` after T48's close PR and the design stream's PR #36 (DEC-229, DEC-230; U220).

**Sources** · `next.md` (N751…N1077, every entry re-tested); `current.md` (T48's census, rules, "Left out of T48", "Measure first"); `draft-T49-N1072-founder-handle.md` (reviewed, K3277); `draft-N933-stake-per-matter.md` (reviewed, K3231); `draft-T49-N1073-hand-lists.md` (K3277); `rulings-active.md`; K3230–K3289; `modules.json` (order, layers, `legacy`); PROCESS-DESIGN P8, P10, P18, P19; MECHANICS §3, §5.2. Next free ids taken from `build/requirements/*.md` on `tranche/T48` at this draft (re-checked at the fold).

**The re-test (P19).** "One job per module" was the hard reason for N1046, N1049, N1060–N1062, N1064–N1068, N1070–N1073. It does not hold in T49: every T48 job is done. Each of those entries is either placed below, or left out for another named reason. Most of them are test hygiene or wording, so they wait under P19's rule, with the wait named. Effort (K3269): no job is opened for a no-behaviour entry alone. Wording-only requirement fixes are BOB's edits at the fold (K3259).

## Legacy census (§5.2 (2))

| legacy module | in T49 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **stays** | Bob's (UX, P17), through the design stream: of DEC-228's 21 gaps "to draw", DEC-229 drew D1, D2, D4 and D5 (they join T49-19, N1077). 17 remain undrawn: D3, S2–S4, V1–V5, R1, R2, F1, A1–A3, Q2, C2, and also P1's "Verify any hash" panel. Its reds N794, N865 and N1057 stay accepted by name (rule 5 (4)). Its retiring job, when it comes, also removes plane R24's copied screen list and `regression.yml`'s `civicos-ui` glob (K3190), and reads `app.html` whole (P20). |

legacy-ui is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order.** Within a layer, merges follow `modules.json` order unless the layer says otherwise. A provider merges before its users. promotion's stamp merges last in L2. In L11, control-plane merges after op-declarations, plane after control-plane, and journey-check last (K3100). Each layer's text is folded before its START (BOB's, P5). Every new or amended line ends *(not yet met: T49)*. The ids below are re-checked against each file's next free id at the fold.
2. **Reading (K3271, P20).** A job reads the following whole: its requirements, its entries, its layer's contract, its own code, the used services its entries touch, and the tests that name a requirement its entries change. It runs its other tests without reading them. A job's Size line counts only its module's own code (K2513).
3. **Models (K3275).** Every job runs on `claude-sonnet-5-5`. No T49 entry builds a new module or a new provided service of more than three ids, so none earns the default model. A restart after a Sonnet job blocks on tests runs on the default model. See doubt 4 for K3286's L11 refinement.
4. **The opening act** (K657, K1043). `modules.json` gains one edge, `public-read → project-roster` (N933, public-read R36; 105 → 35, earlier). No module is added, dropped or moved, so there is no `MODULE_ORDER` entry.
5. **Accepted reds at the opening.** These are re-checked against T48's Outcome at its close.
   1. coverage: every id marked *(not yet met: T49)*, until its module's merge;
   2. row census: the rows that T49's L3+ jobs add or change, until T50's stamp: the T49-12 rows, and those of T49-10 if it keeps rows of its own (doubt 3). Also every T48 row that T48's close leaves for T49's stamp and that T49-5 does not clear;
   3. the op registries' censuses: these are red from each new op's provider merge until their L11 merge, as in K3280. The new ops are `founderhandleset` (T49-1), `projectstakeset` and `projectstake` (T49-2), `actionstake` (T49-10) and `stakeatpreparation` (T49-12). The tests are op-grades', op-declarations' (R19's census), affordances' (R1/R12), plane's `split.test.mjs` and `t41.test.mjs`, and control-plane's route censuses. They clear at T49-13, -14, -16, -20 and -21;
   4. **legacy-ui:** `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865), and its 8 tests that fail at the `{role}` sign-in (N1057), through T49;
   5. the plane bundle and `program.mjs`, staled by any merge, until they are regenerated at each layer's close (K1540);
   6. test-support R2 run as root under a 0700 directory: not owed, environment only (K3192 E).

   Any other red a merge opens is named at that merge (K2704).
6. **Every T49 job also does the following**, each in its own module only and in its START:
   - (N1075, K3269) it reads by key every member-facing sentence it carries that `words.json` already keys, and drops its inline copy. A sentence with no key yet stays inline until UX-DESIGN gives one.
   - (N1073, K3268) where `draft-T49-N1073-hand-lists.md` lists its tests, it replaces each hand-list of another module's ops, rows or words with a read of that module's own declaration. The four registries (op-grades, affordances, op-declarations, control-plane) are the exception: theirs wait on N1074 (Left out).
   - (N1068, DEC-221) it re-spells "labelled" as "labeled" in its own member-facing words.
   - (N1072 doubt 7, K3277) it greps its own module for the founder's id `admin` reaching a reader. A finding joins its text at START as a line like project-roster R31.
   - (N1036, K3189) any Home provider line that T48's L11 found missing joins its provider's entry at the fold. None was recorded at this draft.
7. **Wording only (K3259).** These are BOB's edits at the fold, with no job: file-scanner's **Uses** line (N1061: drop `runtime-limits` `makeMeter`); and any requirement re-wording below marked "BOB's edit".

## Entries

### L1

No job. Every L1 entry is a no-behaviour wait or a BOB's edit (Left out: N1061, N1068 record-grammar).

### L2
- **T49-1 · membership** · (N1072, K3265; DEC-230) R144: the founder's own handle, `founderHandleSet` (in-plane at the claim, and `op=founderhandleset`), `founderHandle()`, the handle taken for R16 and R123, and `sessionRights("admin").handle`. R141 is re-worded: `admin` is an id only, still refused as taken. The new C-96 row `FOUNDER_HANDLE_NOT_FOUNDER` is numbered at START (C-96.54 or later). (N1067, K3245) `ROOT_ADMIN`, read by calculations, is stated in **Provides** (BOB's edit at the fold; the job names it in a test). (N1073) `module-order.test.mjs`:27–100 reads the module ids from `modules.json`, not a hand-list · req: R144, R141 · text BOB's, drafted (N1072 draft, membership) · claude-sonnet-5-5 · first in L2.
- **T49-2 · project-roster** · (N933, K3230, K3231) R29 `projectStakeSet` (`op=projectstakeset`): the project's stake, append-only, dated and attributed. R30 `projectStake` and `projectStakeHistory` (`op=projectstake`). R18 amended (cleared with the project). (N1072) R31 (drafted as "R29"): the founder is named by `membership.founderHandle()`, never `admin`, with `founder: true` and `handle: null` while she holds none, in R1, R2, R6, R21, R24, R27 and R28 · req: R29, R30, R18, R31 · text BOB's, drafted (N933 draft §1; N1072 draft, project-roster, renumbered; doubt 2) · claude-sonnet-5-5 · after T49-1.
- **T49-3 · ai-accounts** · (N1060, K3218, K3224) R26 also tells its listeners when `subscriptionTokenRefused` drops a held token (`account: "signin"`, `why: "refused"`, inside that act). Tested · req: R26 amended · text to write · claude-sonnet-5-5 · provider for T49-4.
- **T49-4 · credentials** · (N1072, K3265) R74: `claim` takes the founder's handle and records it through membership R144. R75: `login` and `recover` resolve her handle. `admin` resolves only until a pre-T49 founder chooses. `role` is no longer read. Unknown handles are refused at one cost, and R38's window is keyed `handle:<as typed>`. (N1060) a test: a refused sign-in revokes a live run credential (R73), with its control. (T48 "Left out", K3101) R72's delegates are removed and R72 retired, once START's grep finds no caller left. Any delegate still called stays, named in the record. (N1073) `grant:77` and `rows-ops:90` read the owners' declarations. (N945) joins only if BOB's study (BOB's acts) changes a requirement before L2's START · req: R74, R75, R72 retired · text BOB's, drafted (N1072 draft, credentials); R72's retirement is text to write · claude-sonnet-5-5 · after T49-1, T49-3.
- **T49-5 · promotion** · **the stamp.** It stamps the rows T48's L3+ jobs added, moved or changed, accepted until T49's stamp: C-113.6 (N1023), C-91.9 (K3247), C-115.47 moved to filing-templates (K3283), C-32.4 and C-33.5–.9's `where`s, action-replies' three C-150 rows, instance-setup's `LANGUAGE_NOT_SET` and N1047's rows, duties' reason codes (N1044), C-87.17 `REVIEW_BAD_UNTIL`, and every row T48's L9–L11 merges name. It also stamps T49's L1–L2 rows: membership's C-96 row and project-roster's two rows (doubt 3). (N1073) `write-path.test.mjs`:171 reads basis-versions' rows from basis-versions · req: none (the stamp) · claude-sonnet-5-5 · last in L2.

**L2 merge order:** membership, project-roster, ai-accounts, credentials, promotion last (`modules.json` order; membership provides to project-roster and credentials, ai-accounts to credentials).

### L3, L4, L5, L6

No job. Their entries are no-behaviour waits (N1062, N1064, N1065, N1066, N1068, N1070's two parts, N1071, N1073's rows), or are left out for a named reason (N824, N829, N842, N858). See "Left out".

### L7
- **T49-6 · reevaluation** · (N1069, K3261) `adoptVersion` records `version.author`, the adopting member, so an adopted version names who adopted it. Tested, with a control that a machine adoption names no member. (N1070, K3264) its requirements name inquiry R64's relayed `DIVIDED_CANNOT_RESTRUCTURE`, and a test writes one · req: R37 (N1069), R38 (N1070), ids at the fold · text to write · claude-sonnet-5-5.

### L8
- **T49-7 · public-read** · (N933) R36: `groupFields({project?})` answers `matter_stake` beside the group's `stake`, never in its place. `inbandQuartet`'s `group` is answered as given, outside `hash`. `publishedCase` is read with the case's project. R10's exception adds `projectStake`. Uses `project-roster.projectStake` (rule 4) · req: R36 · text BOB's, drafted (N933 draft §4) · claude-sonnet-5-5 · provider for T49-12 and T49-20.
- **T49-8 · case-import** · (N933) R25: `groupFields` at import may carry `matter_stake`. A missing one reads `null`. A malformed one is recorded as `null` with a sentence, and never refuses the import · req: R25 · text BOB's, drafted (N933 draft §6) · claude-sonnet-5-5.

**L8 merge order:** public-read, case-import.

### L9
- **T49-9 · conformance** · (N933) R41: an accepted finding's `basis` answers the source's `matter_stake`, as case-import records it. (N1023) C-113.6 `NO_FINDINGS` is read by its key, if UX-DESIGN gives `refusal.NO_FINDINGS` by L9's START. Until then, BOB's sentence stands (K3278) · req: R41 · text BOB's, drafted (N933 draft §6) · claude-sonnet-5-5 · provider for T49-11.
- **T49-10 · action-records** · (N933) R17 `actionStake` (`op=actionstake`): an action's own stake, append-only, and `stakeOf(id)`. Clearing it falls back to the project's stake. Its two refusals reuse project-roster's codes (doubt 3). (N1073) `records:138` reads action-grammar's rows · req: R17 · text BOB's, drafted (N933 draft §2) · claude-sonnet-5-5 · provider for T49-11.
- **T49-11 · actions** · (N933) R105: `actionRead` answers `own_stake`. Every R75 `accepted` item carries `matter_stake` · req: R105 · text BOB's, drafted (N933 draft §3) · claude-sonnet-5-5 · after T49-9, T49-10.
- **T49-12 · filings** · (N933) R60: the matter's stake (the action's own, else the project's, else none; an unreadable source answers `"undetermined"`), this module the only site of that rule. R61: the stamp's `group` carries `matter_stake` beside the group's stake. R62: `stakeAtPreparation` (`op=stakeatpreparation`), a prompt's data, never a gate. R63: accepted-findings lines print the source's matter stake · req: R60–R63 · text BOB's, drafted (N933 draft §5) · claude-sonnet-5-5 · after T49-11.

**L9 merge order:** conformance, action-records, actions, filings (`modules.json` order).

### L10

No job.

### L11
- **T49-13 · op-grades** · (N933, N1072) grades for `founderhandleset`, `projectstakeset`, `projectstake`, `actionstake` and `stakeatpreparation`. Each set is `reversible`, as `declaredstakeset` is · req: ids at the fold · text to write · claude-sonnet-5-5.
- **T49-14 · affordances** · (N933, N1072) act help and op-map entries for the five new ops (rule 5 (3)) · text to write · claude-sonnet-5-5.
- **T49-15 · setup-words** · (DEC-229, DEC-230) it re-takes `words.json` from `main`: the claim field's keys, `signin.handle.help`, `forgot.handle.help`, `founder.handle.*`, `member.founder.unnamed`, the re-worded `refusal.HANDLE_FIXED`, DEC-229's document-page words, and the help for the new acts. `signin.founderhint` is dropped once the stream has removed it. (N1073) `word-list:130` reads membership's words from membership · req: none new, or text to write if a row's rule changes · claude-sonnet-5-5 · before any screen reads the new keys.
- **T49-16 · op-declarations** · (N1072) R71: the `founderhandleset` spec (membership's family, `SESSION_OPS.admin` only), and `claim`'s body field `handle`. It clears the registry's `owed:founderhandleset` (K3265). (N933) R72: specs for `projectstakeset`, `projectstake`, `actionstake` and `stakeatpreparation` · req: R71, R72 · R71 text BOB's, drafted (N1072 draft, op-declarations); R72 text to write · claude-sonnet-5-5.
- **T49-17 · screens-entry** · (N1072, K3265; DEC-201; DEC-230) R17 (drafted as "R12"): no founder hint on `front` or `forgot`. R18 (drafted as "R13"): setup's claim asks the founder's handle, sends it with `claim`, and signs in by it, never by `admin`. R19 (drafted as "R14"): a pre-T49 founder chooses her handle once, with "Later" allowed. Words come by key from DEC-230 (N1075) · req: R17–R19 · text BOB's, drafted (N1072 draft, screens-entry, renumbered; R19's provisional mark settled at the fold against DEC-230, doubt 5) · claude-sonnet-5-5 (doubt 4).
- **T49-18 · screens-daily** · (N1072, DEC-230) `project-rows.mjs` draws an owner or member whose answer is `founder: true, handle: null` by `member.founder.unnamed`, never by its member id. Today it falls back to `member` and so would draw `admin` · req: one line, id at the fold · text to write · claude-sonnet-5-5 (doubt 4).
- **T49-19 · screens-inquiry** · (N1077, DEC-229, U219, K3284) the document page. R3's act list for `document` gains `adoptversion`, `keepversion`, `connectionchoose` and `explore`. Its reads take capture R57's `links`, connections R24's `links_to` edges and connections R4's `on_point` per named entity. Words come by key (N1075). Census gaps D1, D2, D4 and D5 are closed. (N1072) `project.mjs`' participants draw the unnamed founder by `member.founder.unnamed` · req: R23 onward, ids at the fold · text to write · claude-sonnet-5-5.
- **T49-20 · control-plane** · (N933) R96 (drafted as "R95"): the review copy's `group` is `groupFields({project})`, with `hash` unchanged. (N1072) R97 (drafted as "R95"): `claim` passes `handle`, and `founderhandleset` is routed to the founder's own session only · req: R96, R97 · text BOB's, drafted (N933 draft §7; N1072 draft, control-plane; renumbered, doubt 2) · claude-sonnet-5-5 · after T49-16.
- **T49-21 · plane** · (N933, N1072) declares and wires the five new ops, as it did `pressurefor` and `filingread` (K3280). (N1073) `t41.test.mjs`:124 and its other hand-lists read each owner's declaration. This clears rule 5 (3)'s re-reds at their root · req: text to write if a line is needed (the fold confirms) · claude-sonnet-5-5 · after T49-20.
- **T49-22 · journey-check** · (N1072, K3265 "never shown") R7 (drafted as "R5"): signed in as the founder, both with a handle held and with none, no screen draws `admin` as a person's name or handle · req: R7 · text BOB's, drafted (N1072 draft, journey-check, renumbered) · claude-sonnet-5-5 (doubt 4) · last.

**L11 merge order:** op-grades, affordances, setup-words, op-declarations, screens-entry, screens-daily, screens-inquiry, control-plane, plane, journey-check last. setup-words merges before any screen that reads DEC-229's or DEC-230's keys. Until T49-21 merges, the screens test against a fake plane (K31's pattern).

**Count:** 23 jobs: L2 5, L7 1, L8 2, L9 4, L11 11 (with T49-23, K3296). L1, L3–L6 and L10 have none.

## BOB's acts (no job)

- **Before T49 opens (between tranches, P3):**
  - N1074: the generated service index (`build/services.md`), and the format check's warning on a citation by R id alone, certified on a dry run;
  - N898: `mail done --as bob` refuses a `--through` past the job's last entry;
  - N1047's workflow step (signing and publishing the release notice, `.github/`, not_product).
- **The fold before each START (P5, P18):** see "To fold before START".
  - The N1072 and N933 drafts are placed with their renumbering (doubt 2).
  - DEC-230 is read against N1072's doubts 9 and 11 (doubt 5).
  - N1061's Uses line and N1067's Provides line are BOB's edits.
- **N945 (before L2's START):** BOB's study of `bootstrap`'s `rearmed: true`. biosmoke7 is discarded (K3260), so the study works from credentials R2 and its store's code, or from biosmoke8 once it is installed. It asks whether a stored null `token_fp` should read as claimed. If a requirement changes, it joins T49-4. If not, N945 closes with a K.
- **N780:** at the next release cut, agent-runner's and file-scanner's images go where Containers pull (K3060 D15). This is a deployment, BOB's at the cut, and not a job.
- **One channel act to UX-DESIGN at the opening.** It asks for:
  - `refusal.NO_FINDINGS` (T49-9);
  - `signing.openrequest.noquote` (N1076, still owed);
  - B191's preparation-screen question for N933;
  - keys for notice-producers' dated sentences (N889);
  - N847's hours, languages and Places' zero sentence;
  - the next per-module words HANDOFF for N1075.
- **Bob:** told in one line that T49 has opened and what it covers, and asked for his weekly meter reading (§5.2 (3)). Reminded of the questions open with him: the stewards' address (N923), civicsmith.org's DNS (N1011), the records-request reviewer (N858's templates), R88's channel and terms (N670), and S20 (N1028).

## To fold before START

Entries whose requirement text is not yet written (BOB's, P5), with the file each changes:

| entry | requirements file | what to write |
|---|---|---|
| T49-3 (N1060) | `requirements/ai-accounts.md` | R26's clause: tell listeners on a refused, dropped sign-in |
| T49-4 (R72's retirement) | `requirements/credentials.md` | R72 retired ("delegates removed, T49"); any delegate kept is named |
| T49-4 (N945, only if BOB's study changes one) | `requirements/credentials.md` | R2's reading of a null `token_fp` |
| T49-1 (N1067) | `requirements/membership.md` | `ROOT_ADMIN` in Provides (BOB's edit) |
| T49-6 (N1069, N1070) | `requirements/reevaluation.md` | R37 (an adopted version's author), R38 (the relayed refusal) |
| T49-9 (N1023, if keyed) | `requirements/conformance.md` | C-113.6 read by key (amends R40) |
| T49-13 | `requirements/op-grades.md` | grades for the five new ops |
| T49-14 | `requirements/affordances.md` | act help and op-map lines for the five ops |
| T49-15 | `requirements/setup-words.md` | only if a carried row's rule changes |
| T49-16 (N933) | `requirements/op-declarations.md` | R72: the four N933 specs |
| T49-18 | `requirements/screens-daily.md` | the unnamed founder drawn by `member.founder.unnamed` |
| T49-19 (N1077, N1072) | `requirements/screens-inquiry.md` | the document page (DEC-229); the unnamed founder |
| T49-21 | `requirements/plane.md` | the five ops' wiring, if a line is needed |
| N1061 (no job) | `requirements/file-scanner.md` | Uses: drop `runtime-limits` `makeMeter` (BOB's edit) |

These drafts are written and need only placing and renumbering: N1072 (membership, credentials, project-roster → R31, op-declarations, screens-entry → R17–R19, control-plane → R97, journey-check → R7) and N933 (project-roster R29–R30, public-read R36, case-import R25, conformance R41, action-records R17, actions R105, filings R60–R63, control-plane → R96).

## Left out of T49 (one hard reason each)

| entry | hard reason |
|---|---|
| legacy-ui's retirement (N1002's rest) | Bob's (UX, P17): 17 census gaps not yet drawn by the design stream (census above) |
| N794, N865, N1057 (legacy-ui's reds) | the order: they are touched only by legacy-ui's retiring job (K3052), which waits on the row above |
| the 17 undrawn census gaps (D3, S2–S4, V1–V5, R1, R2, F1, A1–A3, Q2, C2) and P1's "Verify any hash" panel | Bob's (UX): to draw (DEC-228, DEC-229 onward); each joins its screen module's next job once its DEC lands |
| plane R24's copied screen list; `regression.yml`'s `civicos-ui` glob | the order: they go with legacy-ui's delete (K3190) |
| N670's R88 (offering a group's translation to Civicsmith) | Bob's: DEC-127 (6)'s channel and the terms (K3190) |
| the "read in my language" control on the screens | Bob's (UX): not drawn (DEC-228 (7)) |
| N933's question on the preparation screen (screens-action) | Bob's (UX): B191 not answered; joins L11 if drawn by its START |
| N847's undrawn parts (a pointer's hours and languages; Places' zero sentence and help) | a dependency not yet built: the keys (asked at T48's opening); join L11 if keyed by its START |
| N1049 (the band's look) | Bob's (UX): to draw (DEC-228 (7)) |
| N1028 (per-area dashboards beyond Home) | Bob's: S20 (K3138). The kind tokens, if T48-68 did not apply them, are re-tested at the fold |
| N889 (notice-producers' `{date}`) | a dependency not yet built: the design stream's keys for those sentences |
| N1075 (words by key) for modules with no T49 job, or with no key yet | a dependency not yet built: UX-DESIGN's per-module keys (K3269); swept in T49–T50 as each module is touched |
| N1076 (case-inputs R18 by key) | a dependency not yet built: `signing.openrequest.noquote` (asked K3195). Once keyed it is a no-behaviour entry, and waits for case-inputs' next substantive one (≤3 tranches) |
| N858 (Actions D8–D10: filing-templates, wizard-scripts, reading-guides, jurisdictions, local-facts, filings, actions, docket) | a dependency not yet built: the ACTIONS-DESIGN lane's step-5 hand-off and canon draft (lane at H31, unchanged, K3288) |
| N858's two `@records-request` templates into a profile | Bob's: the reviewer under R15 (K3081, K3120) |
| N880 (Actions D13, and the minutes comparison, U4) | a dependency not yet built: the lane's hand-off (as N858), and no module holds minutes beside a comment |
| N1046 (a template's text by handle) | a dependency not yet built: no offered script carries a `{template}` draft (wizard-scripts R22). "One job per module" no longer holds |
| N923 and stewards R7 | Bob's: the stewards' contact address (K2799) |
| N824 (email capture) | Bob's: "D42 - email: A", after upload is in use (K2425) |
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N829 | a measurement: the test set's matters and answers are written by people (K3060 D12) |
| N842 | a dependency not yet built: no `enquire` conversation or account draft task, and N829 |
| N853c | a measurement: OCR's accuracy on members' photos |
| N945 (unless BOB's study changes a requirement by L2's START) | a measurement: BOB's study first (BOB's acts) |
| N708 | a measurement: M-Q2 at Bob's first sign-in on biosmoke8; joins T49-3 if measured by L2's START |
| N647 (`investigate`, `extract` on the trial instance) | a deployment or measurement: `op=airunverify` on biosmoke8 first; joins L6 if verified by its START |
| N563, N579, N632, N641, N643, N645, N652, N698 (part) | a measurement (as T37's table names each) |
| N703 (part: Cloudflare's blocked-request counts) | a deployment: a zone and read token per group |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666 | Bob's (DEC-151): after the first public release |
| N757 (later) | Bob's: "N757: A" (K2425) |
| `legal_facts` triggers detected at their moment | a dependency not yet built: no registry screen for attending or recording |
| the v0.2 constructs' screens not yet drawn | Bob's (UX): not drawn |
| the installer's deploy | a deployment: Bob's approval in session (K1715) |
| N1073 for the four registries (op-grades, affordances, op-declarations, control-plane) | a dependency not yet built: N1074's index. If N1074 is certified before L11's START, each fix joins that module's T49 entry, measured first (M-T49-1) |
| N1061 (file-scanner: dead `targetBytes` and `captureKey`, stale comment) | no behaviour: waits for file-scanner's next substantive entry, wait 1 of 3 (by T51). Its Uses line is BOB's edit now |
| N1062 (capture: the `NOT_FOUND` source scan) | no behaviour (test hygiene): wait 1 of 3 (by T51) |
| N1064 (acquisition: sampled tests) | no behaviour (test hygiene): wait 1 of 3 (by T51) (doubt 6) |
| N1065 (reading-pipeline: R22 sampled) | no behaviour (test hygiene): wait 1 of 3 (by T51) |
| N1066 (extraction: ranged statuses, key-leak paths, the `deployable` stub) | no behaviour (test hygiene): wait 1 of 3 (by T51) |
| N1068 ("labeled") for record-grammar, acquisition, reading-pipeline, extraction, duties, lines, inquiry-grammar, skills, answers and action-plans | no behaviour (wording, DEC-221; identifiers unchanged): wait 1 of 3 (by T51), or sooner with that module's N1075 move (doubt 1). T49's jobs re-spell their own (rule 6) |
| N1070 for basis-versions and run-productions (the relayed refusal named, a test) | no behaviour (the relay already holds; a citation and a test): wait 1 of 3 (by T51). reevaluation's part is T49-6 |
| N1071 (citation: the sever relay against the real answer) | no behaviour (test hygiene): wait 1 of 3 (by T51) |
| N1073 for the other modules in its census with no T49 job (capture, inquiry, run-rules, ai-runs, skills, answers, agent-harness, agent-worker, case-authoring, wizard-scripts, action-producers, queue-producers, queue, admission, answer-envelope, store-door, interface-shell, screens-wizards, screens-settings, screens-intake, screens-investigate, screens-publish, screens-action) | no behaviour (test hygiene): wait 1 of 3 (by T51), each with its module's next entry (K3268). legacy-ui's two go with its retirement |

**No entry owed:**
- instance-setup, installer, setup-words' own text, signin-door and admission for N1072 (the draft's "No line needed", confirmed at the fold);
- test-support R2 as root (environment);
- N1074, N898 and N1047's step (BOB's acts);
- N780 (BOB's at the cut).

## Measure first

- **M-T49-1** (K617, at each START, own code only, K2513), measured on `tranche/T48` at this draft:
  - promotion 3,936 (the stamp's rows);
  - membership 3,826 (with R144);
  - op-declarations 3,771 (with five specs);
  - control-plane 3,712;
  - public-read 3,674;
  - filings 3,594 (with R60–R63);
  - reevaluation 3,443;
  - actions 3,433.

  A module found past ~4,000 is split by BOB (P6) before its job. Its entry then names that as its hard reason. The N1074-gated registry fixes are measured before they join.
- **M-T49-2** (K3269, P14): tokens per job and per layer beside the work done. This is the second Sonnet tranche, compared with T48's L8–L11 rows (K3275, K3286).

## Doubts for BOB (all BOB's, P17; none is Bob's)

1. **N1068 is wording, not behaviour.** It changes a spelling members read; DEC-221 is a spelling convention, and no meaning changes. *Recommended:* treat it as P19's "wording", so modules with no other entry wait (≤3 tranches). The alternative is 10 one-word jobs, against K3269.
2. **Id collisions.**
   - project-roster R29 is claimed by both N933 and N1072. *Recommended:* N933 keeps R29–R30 (reviewed first, K3231), and N1072 takes R31.
   - control-plane R95 was taken by T48's L11 fold (K3279). *Recommended:* N933 takes R96, and N1072 takes R97.
   - screens-entry R12–R15 are T48's, and R16 was struck (K3279). *Recommended:* N1072 takes R17–R19.
   - journey-check R5 and R6 are T48's. *Recommended:* N1072 takes R7.
3. **One site (K231).** `MACHINE_CANNOT_SET_STAKE` and `STAKE_MALFORMED` are drafted in both project-roster R29 and action-records R17. *Recommended:* project-roster holds both rows and the helper. action-records (later in the order) calls them. T49-5 then stamps the two rows in L2.
4. **K3286's L11 refinement.** In T48 it put screens-entry, screens-daily, interface-* and journey-check on the default model, because "what a user first sees" must be exactly right. rulings-active records only K3275. *Recommended:* keep Sonnet for T49-18 and T49-22 (one line each). Run T49-17 on the default model, because it draws the claim and the first sign-in. Either way, record it in rulings-active.
5. **N1072's provisional R19 (draft R14).** DEC-230 (U222) gives `founder.handle.*` and `member.founder.unnamed`, which appear to answer the draft's UX doubts 9 and 11. *Recommended:* confirm against DEC-230 at the fold and strike "provisional".
6. **P7 against P19 for sampled tests (N1064, N1065, N1066).** P7 forbids a test that merely samples. P19 lets test hygiene wait. *Recommended:* wait (they prove the behaviour on samples, and no behaviour is wrong). The alternative is three Sonnet jobs (~5M tokens each, K3275).
7. **credentials R72.** If START finds a delegate still called (question-explorer's test fixture imports credentials, K3267), that delegate stays and is named. Recommended over adding a re-point to a module with no T49 job (K3268).

## Settled by BOB #174 (K3292; BOB's, P17)

1. Doubt 1 as recommended: N1068 is wording; modules with no other T49 entry wait (≤3 tranches, by T51).
2. Doubt 2 as recommended: N933 project-roster R29–R30, N1072 R31; control-plane R96 (N933), R97 (N1072); screens-entry R17–R19; journey-check R7. Re-checked against next free ids at the fold.
3. Doubt 3 as recommended: project-roster holds `MACHINE_CANNOT_SET_STAKE` and `STAKE_MALFORMED` and their helper; action-records calls them (K231); T49-5 stamps both in L2.
4. Doubt 4 as recommended: T49-17 (screens-entry) runs on the default model (it draws the claim and the first sign-in, K3052); every other T49 job on claude-sonnet-5-5.
5. Doubt 5: confirmed at the fold against DEC-230 once PR #36 is on `main`.
6. Doubt 6 as recommended: N1064–N1066 wait (test hygiene, P19), each named, by T51.
7. Doubt 7 as recommended.

## Added by BOB #174 after Bob's direction (K3296)

- **T49-23 · site** (new module; N1011; DEC-206; Bob K3060 D6, K3296) · civicsmith.org as the design stream draws it (`SCR.site`, its states, its words by key): what a group gets, a published case, "Already a member?", "Start your group" opening the installer, "Groups at work" from the network directory (DEC-132), the stewards' address (D14). A static Worker on Believe in Oakland's Cloudflare account (BOB's placement), served on its `workers.dev` address until Bob's domain is set up. Tests: every state drawn against the mock pair by pair (journey-check's R6 method), every link and the installer hand-off followed, the directory read live and its empty and failed states. Requirements text to write at the opening (`requirements/site.md`, new; `modules.json` places it in L11 after `installer`, with its `MODULE_ORDER` entry). Default model (a new module, K3294). The stewards' address waits on Bob (N923): the page is built and tested with it held as one marked value, and does not go public without it (K2782, K2799).
- **BOB's acts after T49-23 merges:** deploy the site's Worker (Bob's approval in session, K1715), walk it live, then walk Bob through his domain's DNS in plain steps and confirm it answers on civicsmith.org (K3296).
- **The release at T48's close (biosmoke8, K3260) and its walk as administrator and member (K3052) are the measure of T48:** Bob is told it is ready only after that walk passes on every screen (K3296).
