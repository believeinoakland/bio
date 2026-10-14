# Plan T49

**Status** · OPEN · BOB #180 · session_013HsjLAT8oD9YQsRaLxRHNQ · depth 1

**Jobs** · membership: MEMBERSHIP #39 session_01195GX87EMHUXKVysBHVQkZ; project-roster: PROJECT-ROSTER #8 session_018CGBk9NjLEcazf7iqf4TiN; credentials: CREDENTIALS #16 session_01C6HsrkoFjNZGt4BJNLj9Gm; promotion: PROMOTION #47 session_01HL5YBcopVZSndbgMuYa2TJ; capture: CAPTURE #32 session_015BNtGS8DbCgXWr3necPhxA; reading-pipeline: READING-PIPELINE #13 session_01GqCLDeeJthzed1vQ19Mi4Q; duties: DUTIES #7 session_019tEq7UTq8AyLVmuzhLiapk; ai-runs: AI-RUNS #22 session_01BWtpcB4nYGzr7xN3cV6hsz; agent-worker: AGENT-WORKER #23 session_01G85qgibprP8ncwoNcKSciB; case-inputs: CASE-INPUTS #3 session_015ACfzc2kakEh8pKoGWg4BC; filing-templates: FILING-TEMPLATES #12 session_01DLu9hNhnNY3UX3zTHQrEQY; scheduler: SCHEDULER #36 session_01QZbGvrbfgrrJ5Li8Y5hW5Y; setup-words: SETUP-WORDS #6 session_01Jgzr6YuhktL8nhsH7iR1fe; op-capabilities: OP-CAPABILITIES #1 session_01PAsfLsftny7fjfWK1VEbrx; op-grades: OP-GRADES #11 session_01GyPizYCx5oYUAC7EgbB2ao; affordances: AFFORDANCES #34 session_01Sg9Baej6PovaKSxFXZivNf; op-declarations: OP-DECLARATIONS #24 session_011hPuqD9y49HjQBBqnz9ub8; admission: ADMISSION #12 session_01UMUMxYiouq4PiTjhcRQTAV; interface-assets: INTERFACE-ASSETS #3 session_01Ves3w5WxdoMvxyx1BbZ6fQ; interface-shell: INTERFACE-SHELL #5 session_01W8zKiP2U6MWJEErzftUsXV; screens-entry: SCREENS-ENTRY #3 session_01H73fxUtMGo1PPXKWMHzAzS; screens-settings: SCREENS-SETTINGS #4 session_01VgMT6xBjEGeP2RQvFHHZjs; screens-intake: SCREENS-INTAKE #4 session_01DfJcVnWmWXDs839tKJcnve; screens-daily: SCREENS-DAILY #4 session_01K3B1SwGYL8nCwqykgeAT82; screens-inquiry: SCREENS-INQUIRY #4 session_015AVppQzR1P2zG8LjVeLCKr; screens-investigate: SCREENS-INVESTIGATE #3 session_016pXDF9DWaZT1NX5gzoCeit; screens-publish: SCREENS-PUBLISH #3 session_016LMFaLD8DrK4YxdZxPyQuM; screens-action: SCREENS-ACTION #3 session_011r3wR82Gk35AwAm4k2a92a; control-plane: CONTROL-PLANE #34 session_01QMJqW2szJbMpxeJUYG9Lo1

**Adopted** · from `draft-T49-final.md` (a worker's consolidation for BOB #176), reviewed whole by BOB #177 and settled in K3327 (§ "Settled by BOB #177" at the foot, which governs where it differs). Branch `tranche/T49` from `main` @ f498560a37 (T48's close and PR #37, DEC-241–DEC-246). Ids are re-checked against each file's next free id at the fold (rule 1).

**Meter** · 71% (Bob, 2026-10-14, during L4; K3347).

**Aim (Bob, K3320; scope K3324).** A release Bob can install, sign in to, whose screens are usable, in which he creates a project, connects an assistant and works a real investigation, as administrator and as member. It is proven by journey-check's extended walk (T49-32, the tranche's acceptance test) and then by BOB's live walk of biosmoke8 (K3296, K3052). Work off that journey joins only a module that already has a journey job (K3324 (5)). An entry that would need a job of its own waits for T50. Its hard reason is "Bob's priority (K3320) under the meter (K3323, K2341)", because the meter read 68% at T48's close and the 80% pause would stop the release.

**Sources** · `rulings.md` K3320, K3321, K3324 (read whole); `rulings-active.md` whole; `draft-T49-walk.md` (D1–D32); `draft-T49-plan.md` (its "Settled by BOB #174" and "Added by BOB #174" stand except where K3324 overrides them: N933 and T49-6 reevaluation leave); `draft-T49-fold-dec235-240.md` with its "Settled by BOB #176"; `draft-T49-additions.md`; `draft-T49-N1073-hand-lists.md`; `next.md` (N751…N1098); `archive/T48.md` (Legacy census, Rules, Outcome); PROCESS-DESIGN P4, P6, P8, P10, P19; MECHANICS §3, §5.2, §12.2; `modules.json` (order, layers, uses, paths). Each defect's owner was checked against `modules.json` paths and the cited file:line on `tranche/T48`. Sizes count own code in `paths`, without tests, `dist` or generated files (K617, K2513).

**API keys withdrawn (Bob, K3347, 2026-10-14):** "Do NOT add API support unless and until we get subscription support fully running and debugged. And make a note NOT TO ASK AGAIN. PERIOD!" So: T49-8's R80, T49-9's R88 and T49-22's R36 are withdrawn (retired ids); journey-check R9 step 4, R10, R11 and R12 connect by the member's own Claude subscription; the release's live walk proves the subscription sign-in end to end (doubt 14 is no longer optional: N780's images must be pullable before "ready"). Wherever an entry below says "API key" for the journey, read "subscription". The withdrawn work is N1105 (`next.md`).

## Legacy census (§5.2 (2))

| legacy module | in T49 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **stays** | Bob's (UX, P17), through the design stream. Of DEC-228's 21 gaps "to draw", DEC-229 to DEC-240 drew all but **S2, S3 and S4** (DEC-240: S3 and S4 go to the stream's next session; S2 is drawn by none). Its reds N794, N865 and N1057 stay accepted by name (rule 5 (4)); they are K3321's class (E). Its retiring job removes plane R24's copied screen list and `regression.yml`'s `civicos-ui` glob (K3190), and reads `app.html` whole (P20). |

legacy-ui is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order.** Within a layer, merges follow `modules.json` order unless the layer says otherwise. A provider merges before its users, and a new module merges first in its layer (K624). promotion's stamp merges last in L2. In L11, op-declarations merges after op-capabilities, control-plane after op-declarations, plane after control-plane, and journey-check last (K3100). Each layer's text is folded before its START (P5). Ids are re-checked against each file's next free id at the fold.
2. **Reading (K3271, P20).** A job reads these whole: its requirements, its entries, its layer's contract, its own code, the used services its entries touch, and the tests that name a requirement its entries change. It runs its other tests without reading them. A job's Size line counts its own code only (K2513).
3. **Models (rulings-active §5; K3275, K3286, K3292, K3294).** claude-sonnet-5-5 by default. claude-haiku-5-5 for test-only, wording-only and mechanical jobs: T49-7, T49-10, T49-11, T49-19, T49-30 (T49-15 setup-words runs on claude-sonnet-5-5 since K3368: it gains `word` and `hasWord`). The default model for T49-21 screens-entry (the claim and the first sign-in), T49-25 screens-inquiry (K3321's settlement), T49-31 site (a new module) and T49-32 journey-check (a new provided walk of more than three ids; doubt 4). T49-16 op-capabilities is a new module built by copy, so it runs on Sonnet (K3321 settled 5). A job that blocks on tests restarts one model up.
4. **The opening act** (K657, K1043, K624; BOB's, P17).
   - `modules.json` gains two modules, each with empty `paths` and `tests`:
     - `op-capabilities`: L11, directly before `op-declarations`. It uses nothing.
     - `site`: L11, after `installer`. It uses nothing (a static Worker).
   - New edge: `op-declarations` → `op-capabilities`.
   - `layers.md`'s L11 list gains both.
   - membership's `MODULE_ORDER` entry is T49-1 (R145).
   - `requirements/op-capabilities.md` and `requirements/site.md` are written (To fold).
   - The extraction map `build/extraction/op-declarations-split.md` is written by a worker before L11's START and reviewed (P18).
   - No `translations` module is added: instance-setup's split is left out (N1084, K3324 (5)). No `public-read → project-roster` edge is added: N933 is left out.
5. **Accepted reds at the opening.** Re-checked against T48's Outcome and K3321.
   1. Coverage: every id marked *(not yet met: T49)*, until its module's merge.
   2. Row census: rows that T49's L3+ jobs add or change, until T50's stamp. T48's L3+ rows and T49's L2 rows are stamped by T49-4 (K3321 (D)).
   3. The op registries' censuses for the two new ops, `founderhandleset` (T49-1) and `projectownervotes` (T49-2), from their provider's merge until L11: op-grades', op-declarations' (R19's census), affordances' (R1/R12), plane's `split.test.mjs` and `t41.test.mjs`, and control-plane's route censuses. They clear at T49-13, -14, -17, -29 and -30.
   4. **legacy-ui:** `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865), and its 8 tests failing at the `{role}` sign-in (N1057), through T49 (K3321 (E)).
   5. The plane bundle and `program.mjs`, staled by any merge, until they are regenerated at each layer's close (K1540).
   6. test-support R2 run as root under a 0700 directory: not owed, environment only (K3192 E).
   7. **K3321's reds, each until the entry named:**
      - (A) the account defect N1095: capture-requests `plane.test.mjs` (6) and agent-worker `harness.test.mjs` REC100-0/1b/2/2b/2c (K3351), until T49-29 (control-plane, L11). They stay red through L6's agent-worker job, which does not touch them. scheduler `plane` R12 is red until T49-12 (its own part, N1096) and T49-29 (the refusal);
      - (B) the design files moved by PR #36:
        - op-declarations (10), until T49-17;
        - op-grades R42 (2), until T49-13;
        - affordances R48 (1), until T49-14;
        - screens-entry R9, until T49-21;
        - screens-settings, until T49-22;
        - screens-inquiry R5, until T49-25;
        - screens-investigate R10, until T49-26;
        - screens-publish R10, until T49-27;
        - screens-action R1–R6, until T49-28;
        - case-inputs R18 (N1076), until T49-10;
        - duties R33, until T49-7;
        - filing-templates R29 and R33 (N1097), until T49-11;
      - (C) project-roster R18's hand-list (N1098), until T49-2;
      - (D) promotion `row-census.test.mjs`, until T49-4.
   8. **Found at the L11 (b) fold (K3334):** op-declarations' `ACT_HELP_ABSENT` partition (R34 'never both') from affordances' merge (T49-14) until T49-17; screens-entry's `signin.founderhint` reads (`front.mjs`:78, `index.mjs`:31) from setup-words' merge (T49-15) until T49-21.

   9. **Found at L6's close (K3353):** bundler's `fleetbundles.test.mjs` pin of agent-worker's 28 inputs, until N1107 (T50).

   10. **Found at the words fold (K3368):** membership R83's `MODULE_ORDER` test, from setup-words' move to first in L11 until N1115 (T50) moves it to L1 with membership's entry; coverage on each L11 module's new words id, until its merge.

   Any other red a merge opens is named at that merge (K2704).
6. **Every T49 job also does the following**, each in its own module only and in its START. The Haiku test-only jobs (T49-7, T49-11) do only the second and third items.
   - (K3366, K3368; DEC-257, DEC-258; replaces N1075's item) It holds no member-facing English: every sentence it draws or answers is read through setup-words' `word(key, vars)`, its keys the `reads` list for it in `docs/development/ux-substrate/screens/words-reads.json` (merged at `fa3c8b7e8e`), met by its new words id (op-grades R44, affordances R62, admission R28, interface-shell R70, screens-entry R21, screens-settings R39, screens-intake R26, screens-daily R34, screens-inquiry R44, screens-investigate R30, screens-publish R24, screens-action R19, control-plane R99, plane R56, site R12, journey-check R14). Its verbatim copies (`words.mjs` rows, `PLAN_WORDS`-style lists) and the tests comparing English go. K3362's inline-English instruction is withdrawn (K3365). A sentence it needs that no key holds is a `REPORT` to BOB (the design lane adds the key), never inline English.
   - (N1068, DEC-221) It re-spells "labelled" as "labeled" in its own member-facing words.
   - (N1072 doubt 7, K3277) It greps its own module for the founder's id `admin` reaching a reader. A finding joins its text at START.
   - (N1073, K3268) Where `draft-T49-N1073-hand-lists.md` lists its tests, it replaces each hand-list with a read of the owner's declaration. The four registries (op-grades, affordances, op-declarations, control-plane) are the exception, because they wait on N1074 (Left out).
   - (K3324 (2), D29) No screen it draws treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success.
7. **Wording only (K3259): BOB's edits at the fold, with no job.**
   - basis-versions' heading of R12–R15 spells each `op=` (`versionreject`, `versionconsider`, `versionrevert`, `versioncurrent`) (fold §1; DEC-235).
   - promotion's heading of R41–R44 spells `op=projectfork` (fold §3; DEC-237).
   - plane R50 spells `op=readtranslate` (fold §6; DEC-240).
   - membership's Provides states `ROOT_ADMIN` (N1067).
   - answers' Provides states `ANSWER_FIELDS` (`answers/check.mjs`:21), which T49-9 reads (D17; K3268).
   - file-scanner's Uses drops `runtime-limits` `makeMeter` (N1061).
   - Each is told to the modules that use the service (P5).

## Entries

Severity is the walk's: **B** BLOCKER, **M** MAJOR, **m** MINOR.

### L1

No job. Every L1 entry is left out or is a BOB's edit.

### L2
- **T49-1 · membership** · (N1072, K3265; DEC-230; D26 **M**) R144: the founder's own handle: `founderHandleSet` (in-plane at the claim, and `op=founderhandleset`); `founderHandle()`; the handle taken for R16 and R123; and `sessionRights("admin").handle`. R141 is re-worded: `admin` is an id only, and is still refused as taken. The new C-96 row `FOUNDER_HANDLE_NOT_FOUNDER` is numbered at START. (K657; T49-16, T49-31) R145: `MODULE_ORDER` gains `op-capabilities` (L11, before `op-declarations`) and `site` (L11, after `installer`). Each is tolerated as not yet built until its job merges with its `paths` (R140's form). (N1073) `module-order.test.mjs`:27–100 reads `modules.json`. (N1067) `ROOT_ADMIN` is named in a test (its Provides line is BOB's edit) · req: R144, R141 amended, R145 · R144 and R141 text BOB's, drafted (`draft-T49-N1072-founder-handle.md`, membership); R145 text to write · claude-sonnet-5-5 · first in L2; provider for T49-2 and T49-3.
- **T49-2 · project-roster** · (N1072) R29 (drafted as "R31", renumbered because N933 is left out): the founder is named by `membership.founderHandle()`, never `admin`, with `founder: true` and `handle: null` while she holds none, in R1, R2, R6, R21, R24, R27 and R28. (N1091, DEC-237 (3)) R30 (fold's "R32"): `projectOwnerVotes({projectId, viewer})` (`op=projectownervotes`, a read), as the fold drafts it, with members named by handle (the founder by R29). (N1098, K3321 (C)) `figures-purge.test.mjs` R18 reads membership's `MEMBERSHIP_DECLARED_TABLES` · req: R29, R30 · text BOB's, drafted (N1072 draft, project-roster; fold §3) · claude-sonnet-5-5 · after T49-1; provider for T49-25.
- **T49-3 · credentials** · (D2 **B**) R76, amending R27: the founder's own Ask is granted. `aiGrantMint` admits the founder's live session (role `admin`, member `admin`, as `membership.sessionRights` answers it, R144) as her own, for her own grant only. Every other NOT_YOUR_ACCOUNT stands. Test: the founder asks under her own session and is granted. Control: a member's grant minted under the founder's session is refused (`credentials/index.mjs`:1316). (N1072, K3265) R74: `claim` takes the founder's handle and records it through membership R144. R75: `login` and `recover` resolve her handle. `admin` resolves only until a pre-T49 founder chooses one. `role` is no longer read. Unknown handles are refused at one cost, and R38's window is keyed `handle:<as typed>`. (T48 "Left out", K3101, K3297) R72's delegates are removed and R72 is retired, together with its spread of `aiAccountsOps` in the route map, once START's grep finds no caller. Any delegate still called stays, named in the record. (N1073) `grant:77` and `rows-ops:90` read the owners' declarations. (N945, K3329) R77: a spent bootstrap credential with no recorded fingerprint reads claimed, never re-armed, and a claim with no `tokenFp` is refused (START greps every `claim` caller for one passing none) · req: R74, R75, R76, R77, R72 retired · R74 and R75 text BOB's, drafted; R76 and R72's retirement text to write · claude-sonnet-5-5 · after T49-1.
- **T49-4 · promotion** · **The stamp** (K3321 (D)). It stamps the rows T48's L3+ jobs added, moved or changed, which were accepted until T49's stamp: C-113.6 (N1023); C-91.9 (K3247); C-115.47 moved to filing-templates (K3283); C-32.4 and C-33.5–.9's `where`s; action-replies' three C-150 rows; instance-setup's `LANGUAGE_NOT_SET` and N1047's rows; duties' reason codes (N1044); C-87.17 `REVIEW_BAD_UNTIL`; and every row T48's L9–L11 merges name. It also stamps T49's L2 rows: membership's C-96 row and any row T49-3 adds. (N1073) `write-path.test.mjs`:171 reads basis-versions' rows from basis-versions · req: none (the stamp) · claude-sonnet-5-5 · last in L2.

**L2 merge order:** membership, project-roster, credentials, promotion last.

### L3
- **T49-5 · capture** · (N1080, K3295; K3324 (1), on the journey's path) R91: `heldCaptures` bounds its work per page. R78's examination (`#eligibility`) and the archive grouping (`#archiveRow`) are asked once per page for that page's documents, not once per row with no bound. An answer not given in time reads undetermined (R78's `eligible: null` with its basis; an archive row read as a file row). The walk's unfiltered `heldcaptures` then answers. It is measured first at the plane's shape (M-T49-3), with the time per row stated in the test. (N1062, K3227; the wait ends) `evidence-absent.test.mjs`:77's source scan becomes an interface test of R63's one refusal on every path, and the scan is deleted. (N1073) `knocker:240` reads doorbell's rows · req: R91 · text to write · claude-sonnet-5-5 · alone in L3.

### L4
- **T49-6 · reading-pipeline** · (D6 **B**) R32, amending R1 and R2: a capture read as text through no wireable format entry (an HTML page, plain text) forms its text units from the decoded text as R2's wire path does. So `capture_text` holds its words, the document's words and passages are drawn, Find-in finds them, and Find's search reaches them (`reading-pipeline/index.mjs`:1175–1215; `extraction/index.mjs`:727 then indexes them unchanged). No format-registry entry is added: this module is the one site. Test: an HTML and a text capture each index their units. Control: a capture with no text read indexes none. PDFs are checked live (M-T49-6). (N1065; the wait ends) R22's "no place named" is proven over the module's whole outward text against `jurisdictions`' full place list · req: R32 · text to write · claude-sonnet-5-5.

### L5
- **T49-7 · duties** · (N1097, K3321 (B)) `t48-reasons.test.mjs` R33 reads `duty.reason.trigger_undated` by key from the file it names, never a literal. Test only · req: none · claude-haiku-5-5.

### L6
- **T49-8 · ai-runs** · (D4 **B**; K3324 (3), BOB's reading of K2892: a member's own account covers her own API key, K1755) R80, amending R18: `dispatchMemberRun` dispatches a member's run on her own API key (`accountFor` answering `kind: "apikey"`, `level: "member"`, owner `member:<her id>`) for a run she opened herself, as it does her own sign-in. Every other account (the group key, a project's account, another member's) is still withheld `MEMBER_PRINCIPAL_RUN`, and every other R18 refusal stands (`ai-runs/index.mjs`:2222–2225). Test: a member's own API-key run dispatches to the stub agent-worker with her key. Controls: a run on the group key is withheld; another member's run is `AI_RUN_NOT_PRINCIPAL`. (D5 **B**) R81, amending R9, R11 and R13's relay of run-rules R6 (the DEC-63 project gate; R47's own check already passes, K3331): the project gate asks `membership.participation` with the actor's member id as participation is keyed, whether the caller passes `member:<id>` or `<id>` (`#aiRunProjectGate`, `ai-runs/index.mjs`:806–820). A joined participant's `planask` opens its run. START confirms the cause first (M-T49-8). Test: a project's owner and a joined member each open a planning run. Control: a non-participant is refused `AI_RUN_NOT_PROJECT_MEMBER`. (N1073) `rows:12` reads run-rules' rows · req: R80, R81 · text to write · claude-sonnet-5-5 · provider for T49-9.
- **T49-9 · agent-worker** · (D4 **B**, its half) R88, amending R5 and R10: `POST /run` takes a run a member opened and `ai-runs` R80 dispatches on her own API key. The arrived account is her own `apikey` at level `member` (R6), and the recorded payer is that member. Every other refusal of R1–R11 stands. This holds only if START finds `/run` refuses it today (M-T49-7, as M-T46-4 was); otherwise the tests show it met. (D17 **M**) R89, amending R54 (K3331): the `answer` tool's `input_schema` requires every field of `answers`' contract, read from `answers.ANSWER_FIELDS` and never hand-listed (K3268), so a real model's answer is not refused `ANSWER_MALFORMED` for a field it was never told to send (`agent-worker/src/ask.mjs`:86; `answers/check.mjs`:42–47). Test: the schema's `required` equals `ANSWER_FIELDS`. Control: a model answer missing one field is refused by the plane's check. (N1073) its four hand-lists read the owners' declarations. Its REC100 reds stay accepted until T49-29 (rule 5 (7) (A)) · req: R88, R89 · text to write · claude-sonnet-5-5 · after T49-8.

**L6 merge order:** ai-runs, agent-worker.

### L7

No job. N1069 and N1070 (reevaluation) are left out.

### L8
- **T49-10 · case-inputs** · (N1076, K3321 (B)) `signing.openrequest.noquote` is now keyed. It joins `CASE_INPUTS_WORDS`, R18's no-quotation line reads it by key, and the plain constant goes · req: R18 amended (BOB's edit at the fold: "by key") · claude-haiku-5-5 (mechanical).

### L9
- **T49-11 · filing-templates** · (N1097, K3321 (B)) the tests of R29 and R33 read each word by key from `words.json`, never a literal. Test only · req: none · claude-haiku-5-5.

### L10
- **T49-12 · scheduler** · (N1096, K3321 (A)) `plane` R12 ("a run waiting on a request that reaches expired is woken … exactly once") still fails at `pr.ok` after ~108 s past N1095's refusal. The job diagnoses it with N1095's one-line fix applied in a scratch copy only (it does not touch control-plane), then fixes its own part, or re-scopes R12 through BOB (P9). The test stays red until T49-29 merges (rule 5 (7) (A)) · req: none, or R12 re-scoped (text BOB's at CHANGE) · claude-sonnet-5-5.

### L11
- **T49-13 · op-grades** · (K3321 (B)) R42's two reds are cleared against the moved design files. (N1072, N1091) R43 gives grades: `founderhandleset` is `RUNG_ABSENT`, ground `caller-owned`, as `handlechange` (no act changes a held handle, `HANDLE_FIXED`; K3333), and `projectownervotes` is a read (`NON_ACTS` "read: …") · req: R43 · text to write · claude-sonnet-5-5.
- **T49-14 · affordances** · (K3321 (B)) R48's red cleared. (DEC-235 to DEC-240, fold §7) R61: `ACT_HELP` is regenerated from `mock-acts.js` at the `main` commit named at START (`f498560a37` or later: PR #37's merge), by R48's reading. `owed_<op>` texts are held under their ops once spelled or declared, and `founderhandleset`'s help is held. (N1090, DEC-236 B204 (3)) R60: `connection_kinds` answers `step_source` in its own group, never `ment` (fold §2) · req: R60, R61 · text BOB's, drafted (fold §2, §7) · claude-sonnet-5-5 · provider for T49-26.
- **T49-15 · setup-words** · (K3366, K3368; DEC-257) R10: `WORD_ROWS` generated from `words.json` in the tree by the module's own generator (`--check` for staleness), `WORDS_COMMIT` the file's SHA-256 prefix; R11 `word(key, vars)`; R12 `hasWord(key)`; R13 the keys-only rule. R9 retired before its job ran. (N1073) `word-list.test.mjs`:130 reads membership's words from membership · req: R10–R13 · text BOB's, written (K3366 fold) · claude-sonnet-5-5 · **first in L11**, before every module that reads words (all of L11's but op-capabilities, op-declarations and interface-assets).
- **T49-16 · op-capabilities** (new module; M-T49-1, K3298, P6; additions' "op-declarations' split") · It is built by copy from op-declarations (map `build/extraction/op-declarations-split.md`): `needsRows()`, every hand-written `NEEDS` row with its comment (`index.mjs` 2,413–3,331), built on first read, importing nothing · req: R1–R3 · text to write (additions §op-declarations' split) · claude-sonnet-5-5 (K3321 settled 5) · first in L11.
- **T49-17 · op-declarations** · (M-T49-1) It deletes its copy of the `NEEDS` rows, imports `op-capabilities.needsRows()` and composes `NEEDS`. R3 is re-worded, with its meaning unchanged, and no caller re-points. (K3321 (B)) its 10 reds cleared against the moved registry. (N1072) R71: the `founderhandleset` spec (membership's family, `SESSION_OPS.admin` only; `claim`'s body field `handle` is control-plane R97's, K3333); it clears the registry's `owed:founderhandleset`. (N1091) R72 (fold's "R73", reduced to the ops T49 places): `projectownervotes` is a read for a member's session (`classes` `admin`, `member`; `machineClasses: []`; not mutating; `NEEDS` `null`). It is named in `ACT_HELP_ABSENT` until affordances holds its text · req: R3 re-worded, R71, R72 · R71 text BOB's, drafted (N1072 draft); R3 and R72 text to write · claude-sonnet-5-5 · after T49-16.
- **T49-18 · admission** · (D24 **M**; K1881, a protective limit, BOB's) R27, amending R21: a request that presents a live member session is counted in that session's own window, not in its source's public-ops window (`DOOR_WINDOW`, 300 per 10 min, `admission/index.mjs`:866). So a signed-in member's ordinary page loads (`bootstrap`, `groupidentity` on each screen) never meet the public door's bound, while an anonymous source still does. The session window's bound is stated with its sentence composed from the same constants. It is measured first (M-T49-4). Test: 400 signed-in page loads in 10 minutes are admitted. Control: 301 anonymous requests from one source are refused at the 301st. (N1073) its hand-lists · req: R27 · text to write · claude-sonnet-5-5.
- **T49-19 · interface-assets** · (N1090, N1094; DEC-236 B204 (1), DEC-240 N1049) R8: `ASSETS_COMMIT` is the `main` commit named at START (`f498560a37` or later; it then also carries DEC-241's `.mk-morerows`/`.mk-morerow`). `shell.css` then carries DEC-236's classes and `.e-step_source`, and `civicsmith.css` carries `.cs-band[data-band="test"]` (fold §2) · req: R8 · text BOB's, drafted (fold §2) · claude-haiku-5-5 (a mechanical re-take) · provider for T49-20 (doubt 2).
- **T49-20 · interface-shell** · (N1090, DEC-236 B204 (1)) R65: the shell draws its own elements with the design's classes and drops its own rules from `STYLE` (fold §2's R65). (N1078, N1091; K3324 (1)) R66: `REF_SCREENS` gains `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony` and `docket`, each card by key (fold §3's R66; additions' R65; written once). (N1094, N1049; DEC-240) R67: the test-instance band is the design's `.cs-band[data-band="test"]` (fold §6's R67); biosmoke8 draws it on every screen. (D31 **m**, D28 **m**, D30 **m**) R68:
  - a card or tooltip closes when its control is pressed or focus leaves it, never left open over the next field;
  - at 390 px no chip, label or digest is clipped, so long text wraps or is cut with its full text in its card;
  - the header draws no explanation-level name (`level.prompt.name`; R60);
  - an expected refusal the shell handles (`REAUTH_DUE`, R34) writes nothing to the console. If START finds the line is the browser's own network log of the 403, this clause is dropped and journey-check's console check admits it (doubt 10).

  (N1099, DEC-241) R69: the phone's More page (R63) draws `rail.<k>.line` beneath each place's name and `screen.more.sub`, in the design's classes; (N1100, DEC-246) a refusal's reference is drawn by `refusal.reference` ("Reference: {ref}", R39).

  Test for R68: each clause over a fixture; R69 over `/app/more`. (N1073) `kit:398`, `session:210` and `frame:51` read the owners' declarations · req: R65–R69 · R65–R67 text BOB's, drafted (fold §2, §3, §6); R68, R69 text to write · claude-sonnet-5-5 · after T49-15 and T49-19; before every screen job.
- **T49-21 · screens-entry** · (N1072, K3265; DEC-201, DEC-230) R17: no founder hint on `front` or `forgot`. R18: setup's claim asks the founder's handle, sends it with `claim`, and signs in by it, never by `admin`. R19: a pre-T49 founder chooses her handle once, with "Later" allowed (settled against DEC-230 at the fold, #174 doubt 5). (D23 **M**) R20, amending R12: `/app/setup` reached by a member, or by an administrator who is not the founder, draws that reader's own state. It never says "you are your group's first administrator, signed in as …", and never offers "Show my recovery codes" to anyone but the founder before she has seen them. Test: a member opening setup sees her own state with no founder words. Control: the founder at her first sign-in sees the claim's next step (`screens-entry/setup.mjs`). (N1100, DEC-246) R21: the ten recovery codes shown once with "Copy them" and "Save them as a file" (R6), and setup's state c "Already claimed" with `refusal.ALREADY_CLAIMED` and "Sign in" (R15); R6's founder signs in by her chosen handle (K3265, DEC-230; R18). (K3321 (B)) R9's red cleared against the moved registry. (N1073) `common:80` and `setup:88` · req: R17–R21 · R17–R19 text BOB's, drafted (N1072 draft, screens-entry, renumbered); R20, R21 text to write · **default model** (the claim and the first sign-in, K3286, K3292) · after T49-20.
- **T49-22 · screens-settings** · (K3321 (B)) its red cleared. (N1090, DEC-236 B203) R34: `refusal.UPDATE_SKIP_NO_REASON` and DEC-236's keys (fold §2). (D26 **M**) R35, amending R29: Members counts the founder among active members and draws her row, named by her handle or `member.founder.unnamed` (membership R144). "Active members" is never short of the administrators it counts. (D27 **M**) R36, amending R27: `connect` points an administrator to the group key on Members (the link and its card, by key). "My Claude subscription" is offered only while the sign-in is installed (`subscriptionsignin`'s state), and otherwise is not drawn. (D30 **m**) R37:
  - Updates and Connect draw their sentences by key with every fill filled (no "allowed by set at setup", no "you held the key");
  - `translations` with nothing to show draws its empty state by key, never a bare screen.

  (N1100, DEC-246) R38: `connect` draws R30's words ("How do you want to connect the assistant?", "My Claude subscription (Pro or Max)", "My own Claude API key", "Not now") and, beside the code, `NO_SIGNIN_WAITING`, `SIGNIN_REFUSED`, `SIGNIN_UNAVAILABLE`, `SIGNIN_ADDRESS_UNEXPECTED`, `AGENT_WORKER_UNBOUND` and `instance.part.signin.absent` by their keys, each with its reference (R5, R13, R24).

  A wording that is the design's own goes to the channel act. Test: each over a fixture. (N1073) its five test files · req: R34–R38 · R34 text BOB's, drafted (fold §2); R35–R38 text to write · claude-sonnet-5-5 · after T49-20.
- **T49-23 · screens-intake** · (D9 **B**) R21, amending R2: an upload's answer (a provenance document, `capture` R86) is promoted as an information bundle at `collected`, exactly as the address path promotes `acquire`'s document (`doneAcquire`), with its refusals drawn on the tab. "It waits in Held captures" is said only once that promotion succeeds (`screens-intake/capture.mjs`:199–215; control-plane R72 passes no `within`, by design). (D12 **M**) R22, amending R1 and R2: `capture` opened with a question or a project as its subject (from T49-25's "Add a document") files what it captures there. The promoted bundle names that project in the form the project's reads count (M-T49-5), and the result offers "Cite a passage" opening `find-in` with the question chosen. Test: a capture from a question is held under the question's project, and its Find counts it. Control: a capture with no subject is filed nowhere. (D13 **M**) R23, amending R1, R2 and R4:
  - the composed bundle carries every file that `verified`'s entry requirements name (`data/dataset.json`, a file in `snapshots/`, a well-formed `content_hash`; `ratification/release.mjs`:192–197), so vouching (`release`) is not refused ENTRY_REQUIREMENTS for a well-formed capture;
  - a held row's refusal is drawn by its words, never as raw catalogue text (`held.mjs`:21).

  (D22 **M**, its first half) R24: the capture's result links the document it made (`document` at the bundle). (N1100, DEC-245, DEC-246) R25: capture opened from a question draws "For which question", carried as `capturerequest`'s `lead_inquiry` (BOB's choice, K3327) and filed as R22 files it; `BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE` are drawn by key beside the address, and an empty field by `capture.fieldneeded` (R1, R2). (N1073) `common:121` · req: R21–R25 · text to write · claude-sonnet-5-5 · after T49-20 (doubt 8).
- **T49-24 · screens-daily** · (D7 **B**) R24, amending find-in's cite: "Cite in the question" draws the supports or against choice (`role`, none preselected) and sends it, and it is refused in place until one is chosen (`screens-daily/find-in.mjs`:223–231). (D11 **M**, D30 **m**, D31 **m**) R25, amending R1 and R10:
  - Home's start and "Start a project" write the project's `title` (`home.mjs`:318);
  - the door cards separate their title from their description;
  - counts pick their singular and plural keys;
  - each closed door's button carries accessible text.

  (D16 **M**) R26: Find-in names its scope by the document's title and each result by its document's title and place, never a digest or a 12-hex label. A testimony's page reaches Find-in by a link, not by typing its address. (D17 **M**) R27, amending R5: Ask draws a refusal by its words (never "This could not be read"), and draws an answer's `not_established` as the design does. (D21 **M**) R28, amending R2 and R17: each queue and Home to-do item names its subject by title and its act by the act's label, never a bare address with "Act on an item". (D25 **M**) R29, amending R10: a project the member is invited to is drawn on Projects and in Home's to-do with "Join" (`projectjoin`), from `projectlist`'s participation state, which START confirms. The queue item waits on a queue kind from the design stream (channel act). (N1091, DEC-237) R30 (fold's "R25"): "Start a project" asks the title and who can find it. (N1093, DEC-239; joins, the module having a job) R31 (fold's "R28"): "no reply recorded", never "overdue". (N1100, DEC-245) R33: Projects with none draws "No projects yet…" with "Start a project", and a new project asks "Your first question" before "Open a question" (`promote` then `drawquestion`; screens-inquiry R11). (N1072, DEC-230) R32: `project-rows.mjs` draws `founder: true, handle: null` by `member.founder.unnamed`. (N1073) `contract:123` · req: R24–R33 · R30 and R31 text BOB's, drafted (fold §3, §5); R24–R29, R32 and R33 text to write · claude-sonnet-5-5 (doubt 3) · after T49-20.
- **T49-25 · screens-inquiry** · (K3321 (B)) R5's red cleared.
  - **The question page** (N1089, DEC-235; D8 **B**, D14 **M**): R23–R26 as the fold drafts them. These are what each passage carries, the read-back, the readings with Accept, Weigh, Reject, Undo, Stand on and Hide, and what relies on it.
  - (D14) R34, amending R2: Supports lists every passage the question cites, from the inquiry's own cited legs, whether or not any reading exists (today it reads `basisversions` alone and lists none, `question.mjs`:160–196). The strength sentence is drawn by its words, never as raw grade text.
  - (D8) R35, amending R2: Concluding offers `conclude` once the question's project stands on an accepted reading, carrying that reading. Until then it says by key what is owed (accept a reading, then stand on it), so NO_CLAIM is never the first a member learns of it.
  - **The project page** (N1091, DEC-237; N1078; D19 **M**): R27–R30 as the fold drafts them. These are the project's work links (its plans among them), who can find it, members and owners (R29 reading project-roster R30), and the rescue.
  - (D19) R36: after `planopen`, the question links its plan by name, never "Its screen comes later".
  - **Read in my language** (N1094, DEC-240; joins): R31 as the fold drafts it.
  - **The document page** (N1077, DEC-229; D15 **M**): R32, amending R3. Its acts gain `adoptversion`, `keepversion`, `connectionchoose` and `explore`. Its reads take capture R57's `links`, connections R24's `links_to` and connections R4's `on_point`. And:
    - the grade is the capture's own grade object, never "Unrated" beside a B note;
    - "Its versions" draws its refusal by words;
    - the address is drawn as a link, unquoted;
    - the title is the document's title, never the URL slug;
    - a testimony offers Find-in and its words, and not Watch or Check-version;
    - times are drawn by `cs.date`.
  - **The dock** (D3 **B**, D18 **M**): R33, amending R13.
    - `airunopen` is sent with bounds the run can run under (no zero `fetches` or `subsessions` allowance where the mode needs one; `assistant.mjs`:228).
    - An answer of `started: false` is a refusal, drawn by its words, and `airundispatch` is not called after it.
    - A withheld dispatch (`AGENT_WORKER_UNBOUND`, `MEMBER_PRINCIPAL_RUN` and the rest) is drawn with its reason by key, never blank.
    - "A run of yours is working on this" is drawn only while a dispatched run is running.
  - (D32 **m**) R37: `projectai` opened by a member not joined to the project draws the not-joined state by key, never "What pays" failed with "No project answers to that id".
  - (D12 **M**, its half) R38: the question and the project offer "Add a document", opening `capture` with that subject (T49-23 R22).
  - (D11, its half) R39: no screen of this module draws a record id as a title (project, question, `projectai`, `find-in`'s project). The title is read from the record.
  - (N1100, DEC-245) R41: the question's states as the design draws them: c new and empty ("Nothing cited yet": "Capture a document for it", "Find another source", "Ask the assistant"), d the assistant at work with "Stop the run" (`airunclose`), e its proposal ("Accept this reading" `versionaccept`, or "Decline…"), f its limit (`ai.refused.limit`, no cost named), g concluded (who, when, "What would change it", strength, "Withdraw the conclusion…"); state a's "Conclude" is a form: the reading, "What would change it" (required, or "Nothing could change it", R16), commentary (not evidence).
  - (N1100, DEC-246) R42: under "Other reasons the assistant can't work here", switched off, kept away, no account, not installed and whose account serves (R4), each by key; `ai.label.untested` named on a test instance (R7); the dock says which account serves the member.
  - (N1072) R40: `project.mjs`' participants draw the unnamed founder by `member.founder.unnamed`.
  - (N1073) `common:23`, `projectai:39`, `question:65`.

  req: R23–R42 · R23–R31 text BOB's, drafted (fold §1, §3, §6); R32–R42 text to write · **default model** (K3321 settled 4) · after T49-2 (by layer), T49-20 and T49-22 (it uses screens-settings).
- **T49-26 · screens-investigate** · (K3321 (B)) R10's red cleared. (N1090, DEC-236; joins) R27 (fold's "R28"): a `step_source` step is drawn in its own class, and "Follow" offers six groups (affordances R60). (N1094, DEC-240; joins) R28 (fold's "R29"): the proceeding's two lanes of dates. (D30 **m**) R29: `explore` with no centre draws its sentence by key, never "no centre is named…". (N1073) `common:23` · req: R27–R29 · R27, R28 text BOB's, drafted (fold §2, §6); R29 text to write · claude-sonnet-5-5 · after T49-14 and T49-20.
- **T49-27 · screens-publish** · (K3321 (B)) R10's red cleared. (N1094, DEC-240; joins) R22 (fold's "R23"): "Check a file you hold". R23 (fold's "R24"): the reader's acknowledgement on `review-outside`. (N1073) `common:17` · req: R22, R23 · text BOB's, drafted (fold §6) · claude-sonnet-5-5 · after T49-20.
- **T49-28 · screens-action** · (K3321 (B)) R1–R6's reds cleared. (N1090, DEC-236 B203) R15: `act.planask.does`. (N1093, DEC-239; joins) R16 and R17: the law it goes under and its risk (fold §5). (D5 **B**, its half; D20 **M**) R18, amending R13:
  - `planask`'s refusal is drawn by its words, and "The assistant is looking for options" is drawn only while its run is running;
  - the plan names its project and question by title, never `INQ-…` or `inquiry:INQ-…`;
  - a reference is picked from a list the record answers, never typed;
  - categories are drawn by their words, never as lowercase codes.

  (N1073) `matter:39` · req: R15–R18 · R15–R17 text BOB's, drafted (fold §2, §5); R18 text to write · claude-sonnet-5-5 · after T49-20.
- **T49-29 · control-plane** · (D1 **B**, N1095, K3320, K3321 (A)) R96: the door strips a body `member` only for `stepsource` and `stepsourcewithdraw` (R92), never for every op declaring it (`control-plane/index.mjs`:2477). So `accountreferenceset` and `accountreferenceremove` reach ai-accounts with the member's own `member`. Test: a member connects and removes her own key through the real door. Control: a forged `member` naming another member is refused NOT_YOUR_ACCOUNT. This clears capture-requests (6), agent-worker REC100-1b/2/2b, and scheduler R12's first failure. (N1072) R97 (drafted as "R95"): `claim` passes `handle`, and `founderhandleset` is routed to the founder's own session only. (N1091) R98 (fold's, reduced): `projectownervotes` is routed through project-roster's map, `viewer` stamped from the session · req: R96–R98 · R97 text BOB's, drafted (N1072 draft, renumbered); R96 and R98 text to write · claude-sonnet-5-5 · after T49-17.
- **T49-30 · plane** · (N1072, N1091) it wires `founderhandleset` and `projectownervotes` as it did `pressurefor` and `filingread` (K3280). (N1073) `t41.test.mjs`:124 and its other hand-lists read each owner's declaration. This clears rule 5 (3)'s re-reds at their root · req: a line only if the fold finds one needed · claude-haiku-5-5 (a mechanical re-point; doubt 12) · after T49-29.
- **T49-31 · site** (new module; was T49-23; N1011; DEC-206; K3060 D6, K3296) · civicsmith.org as the design draws it (`SCR.site`), as BOB #174 added it: its states, words by key, the installer hand-off, "Groups at work" from the network directory, and the stewards' address held as one marked value (N923). Tested against the mock pair by pair · req: R1 onward · text to write (`requirements/site.md`, new) · **default model** (a new module, K3294) · merges when complete, before T49-32.
- **T49-32 · journey-check** · **the tranche's acceptance test** (K3320, K3324 (2)). New requirements:
  - (N1072, K3265) R7 (drafted as "R5"): signed in as the founder, both with a handle held and with none, no screen draws `admin` as a person's name or handle.
  - (D29 **M**) R8, amending R2: a step fails on a refusal carried inside an HTTP 200, anywhere in its answer: `ok: false` at any depth, `started: false`, `dispatched: false`, `found: false` or `withheld` where the step expects success (`walker.mjs`:73). Test: fixtures of D1's, D3's and D5's answers each fail the step. Control: the expected refusal of a step that tests a refusal passes.
  - R9, amending R1 (a): **the journey as administrator**, each step through the screens' own controls only, with ops called only to observe:
    1. claim with her own handle, and sign in by it;
    2. start a project with a title, and open it;
    3. open a question in it;
    4. connect an assistant by API key on `connect`;
    5. capture by address into the question (from its "Add a document"), and capture by upload into the question;
    6. see both held, and vouch for one;
    7. open the document, see its words, and Find-in a passage;
    8. cite it with a role (supports);
    9. run the assistant on the question from the dock;
    10. read its run's answer and its suggested reading;
    11. Ask, and read the answer;
    12. accept a reading, stand on it for the project, and conclude.

    Each step asserts what the design says the screen then shows, and the walk fails on any refused or missing step.
  - R10: **the same journey as a member** invited to the group and joined to the project, on her own API key, with her own run dispatched on that key (ai-runs R80), and with `projectai`, plan help (`planask`) and Ask walked as hers.
  - R11, amending R1 (a): the local arm binds the plane's `AGENT_WORKER` to agent-worker running under Miniflare with a fake model answering the answers contract and the run modes' tools. It binds a stub city site for captures by address, and sets the test-instance mark as its deployer (as `local.mjs`:42 does). This replaces the walk worker's scratch harness. Its seam for the fake model is confirmed at START (doubt 11).
  - R12, amending R1 (b) and R5: the live arm walks R9 and R10 on a named test instance, with an API key read from the environment and never printed. It passes before BOB's own live walk (K3296).

  - (N1099, N1100) R13: R6's comparison covers design journey 29 ("From installing to a first conclusion", DEC-245) step by step, and `/app/more` at 390 px against `more` (DEC-241).

  Every step is screenshotted (R2), and R6's design pairs are taken for each screen of the journey · req: R7–R13 · R7 text BOB's, drafted (N1072 draft, renumbered); R8–R13 text to write · **default model** (doubt 4) · last in L11.

**L11 merge order:** setup-words (first, K3368), op-capabilities (new), op-grades, affordances, op-declarations, admission, interface-assets, interface-shell, screens-entry, screens-settings, screens-intake, screens-daily, screens-inquiry (after screens-settings), screens-investigate, screens-publish, screens-action, control-plane, plane, site, journey-check last. setup-words and interface-assets merge before any screen that reads their keys or classes, and interface-shell merges before every screen job. Until plane merges, the screens test against a fake plane (K31's pattern).

### Every walk defect, placed

| D | sev. | entry · id | owner checked at |
|---|---|---|---|
| D1 | B | T49-29 control-plane R96 | `control-plane/index.mjs`:2477 |
| D2 | B | T49-3 credentials R76 (reads membership R144) | `credentials/index.mjs`:1316 |
| D3 | B | T49-25 screens-inquiry R33 | `screens-inquiry/assistant.mjs`:228 |
| D4 | B | T49-8 ai-runs R80; T49-9 agent-worker R88 | `ai-runs/index.mjs`:2222 |
| D5 | B | T49-8 ai-runs R81; T49-28 screens-action R18 | `ai-runs/index.mjs`:806–820; `action-plans` passes the stamped author unchanged |
| D6 | B | T49-6 reading-pipeline R32 | `reading-pipeline/index.mjs`:1175 |
| D7 | B | T49-24 screens-daily R24 | `screens-daily/find-in.mjs`:223 |
| D8 | B | T49-25 screens-inquiry R25, R35; BOB's edit of basis-versions' heading | `basis-versions/index.mjs`:1930, :1205–1242 |
| D9 | B | T49-23 screens-intake R21 | `screens-intake/capture.mjs`:199; control-plane R72 |
| D10 | B | no entry: BOB's act at biosmoke8's deploy (K3324 (4)), the mark set as a secret (M-T46-3); installer R49 already forbids the installer to carry it, so no code change | `ai-runs/index.mjs`:331 |
| D11 | M | T49-24 R25; T49-25 R39 | `screens-daily/home.mjs`:318 |
| D12 | M | T49-23 R22; T49-25 R38 | screens-intake (no subject), M-T49-5 |
| D13 | M | T49-23 R23 | `ratification/release.mjs`:192–197; `screens-intake/held.mjs`:21 |
| D14 | M | T49-25 R34 (with R23–R24) | `screens-inquiry/question.mjs`:160–196 |
| D15 | M | T49-25 R32 | `screens-inquiry/document.mjs` |
| D16 | M | T49-24 R26 | `screens-daily/find-in.mjs` |
| D17 | M | T49-9 agent-worker R89; T49-24 R27 | `agent-worker/src/ask.mjs`:86 |
| D18 | M | T49-25 R33 | `screens-inquiry/assistant.mjs` |
| D19 | M | T49-25 R27, R36 | `screens-inquiry` |
| D20 | M | T49-28 R18 | `screens-action/plan.mjs` |
| D21 | M | T49-24 R28 | `screens-daily` |
| D22 | M | T49-23 R24 (the link); the Wayback save: no entry, canon requires it (K3327) | `tsa.mjs`:206 (signatures R22) |
| D23 | M | T49-21 R20 | `screens-entry/setup.mjs` |
| D24 | M | T49-18 admission R27 | `admission/index.mjs`:866 |
| D25 | M | T49-24 R29; the queue kind through the channel act | no requirement raises an item today |
| D26 | M | T49-1 R144, T49-21 R17–R19 (the handle); T49-22 R35 (the count) | `screens-settings/members.mjs`:68 |
| D27 | M | T49-22 R36 | `screens-settings/connect.mjs` |
| D28 | M | T49-20 R68 (conditional, doubt 10) | `interface-shell/browser.mjs`:1534 |
| D29 | M | T49-32 R8 | `journey-check/walker.mjs`:73 |
| D30 | m | T49-24 R25; T49-22 R37; T49-26 R29; T49-20 R68; words to the channel act | words in `words.json` and screens |
| D31 | m | T49-20 R68; T49-24 R25 | interface-shell, screens-daily |
| D32 | m | T49-25 R37 | `screens-inquiry/projectai.mjs` |

## Count

**32 jobs:** L2 4, L3 1, L4 1, L5 1, L6 2, L8 1, L9 1, L10 1, L11 20. L1 and L7 have none. Of these, 6 run on Haiku (T49-7, -10, -11, -15, -19, -30), 4 on the default model (T49-21, -25, -31, -32), and 22 on Sonnet. 16 of the 32 jobs carry at least one walk defect (T49-1, -3, -6, -8, -9, -18, -20 to -26, -28, -29, -32). The other 16 carry the journey's named entries (T49-2 N1072, N1091; T49-5 N1080), K3321's reds (T49-7, -10, -11, -12, -13, -27), the stamp (T49-4), the split (T49-16, -17), a provider of a journey screen (T49-14, -15, -19), the wiring (T49-30), or K3296's site (T49-31).

## BOB's acts (no job)

- **Before T49 opens:**
  - the opening act (rule 4);
  - the extraction map for op-declarations' split (a worker, reviewed);
  - rule 7's wording edits.
- **The fold before each START (P5):**
  - every "text to write" below;
  - the drafts placed and renumbered (N1072: project-roster R29, control-plane R97, journey-check R7; the fold's ids as listed);
  - DEC-230 read against N1072's provisional R19 (BOB #174 doubt 5).
- **N945:** studied (K3329): joins T49-3 as credentials R77.
- **One channel act to UX-DESIGN at the opening.** It asks for:
  - keys for the dock's withheld reasons (D18);
  - D30's design words (the door cards' join, Updates' sentence, Explore's no-centre sentence, Connect's "held the key", the explanation-level name in the header, and the empty Translations state);
  - a queue kind for a project invitation (D25);
  - whether a member may write a reading herself (D8, doubt 5);
  - the affirmation at Accept (fold open point 5);
  - the word for a group's own passed date (fold open point 4);
  - clearing the six `owed:` tags once rule 7's edits land;
  - plus the draft plan's carried asks: `refusal.NO_FINDINGS`, N889's keys, N847's hours, languages and Places' zero sentence, and the next per-module words HANDOFF (N1075).
- **Bob, at the opening:** told in one line that T49 has opened and what it covers, and asked for his weekly meter reading (§5.2 (3)). Reminded of the questions open with him: the stewards' address (N923), civicsmith.org's DNS (N1011), the records-request reviewer (N858), R88's channel and terms (N670), S20 (N1028), and whether runs on a member's own API key are fine (K3324 (3), told).
- **At T49's close (K3324 (6), K3260, K3262):**
  1. the release is cut from `tranche/T49` after L11, signed and merged into the tranche at once (K2273, K3217);
  2. N780: agent-runner's and file-scanner's images are published where Containers pull (BOB's at the cut);
  3. biosmoke8 is installed (Bob's approval in session, K1715), and **D10**: BOB sets `CIVICSMITH_TEST_INSTANCE` to its `INSTANCE_NAME` as a secret (M-T46-3) at the deploy;
  4. `agent-worker` and `civicos` are re-pointed, and biosmoke7's worker is removed;
  5. journey-check R12 is run live;
  6. BOB walks the whole journey live as administrator and as member, including connecting by subscription (doubt 14) and the walk's "not walkable locally" list: the fleet step, PDFs through pdf-worker, the sign-in through agent-runner, a real model's answer, Wayback and timestamping, and live rate limits;
  7. only then is Bob told the release is ready;
  8. the site's Worker is deployed to `workers.dev` (Bob's approval), walked, and Bob is walked through his domain's DNS (K3296).

## To fold before START

| entry | requirements file | what to write |
|---|---|---|
| T49-1 | `membership.md` | folded (K3329): R144, R145, R141 re-worded |
| T49-2 | `project-roster.md` | folded (K3329): R29, R30, R27 re-pointed |
| T49-3 | `credentials.md` | folded (K3329): R74–R77; R72 retired by the job |
| T49-5 | `capture.md` | folded (K3331): R91, R78 re-worded |
| T49-6 | `reading-pipeline.md` | folded (K3331): R32 |
| T49-8 | `ai-runs.md` | folded (K3331): R80, R81, R18's T46 clause |
| T49-9 | `agent-worker.md` | folded (K3331): R88 (conditional), R89 |
| T49-10 | `case-inputs.md` | folded (K3331): R18 by key |
| T49-12 | `scheduler.md` | only if R12 is re-scoped |
| T49-13 | `op-grades.md` | R43 |
| T49-14 | `affordances.md` | folded (K3339): R60, R61 |
| T49-15 | `setup-words.md` | folded (K3339): R9 |
| T49-16 | `op-capabilities.md` (new) | Purpose, Provides R1–R3, Uses none |
| T49-17 | `op-declarations.md` | R3 re-worded; R71 as drafted; R72 (`projectownervotes`) |
| T49-18 | `admission.md` | R27 (the session's own window) |
| T49-19 | `interface-assets.md` | folded (K3339): R8 |
| T49-20 | `interface-shell.md` | folded (K3339): R65–R69 |
| T49-21 | `screens-entry.md` | folded (K3339): R16–R20; R2, R4, R6 re-worded |
| T49-22 | `screens-settings.md` | folded (K3339): R34–R38; R30 re-worded |
| T49-23 | `screens-intake.md` | folded (K3339): R21–R25 |
| T49-24 | `screens-daily.md` | folded (K3339): R24–R33 |
| T49-25 | `screens-inquiry.md` | folded (K3339): R23–R43; R6's K3003 clause re-worded |
| T49-26 | `screens-investigate.md` | folded (K3339): R27–R29 |
| T49-27 | `screens-publish.md` | folded (K3339): R22, R23 |
| T49-28 | `screens-action.md` | folded (K3339): R15–R18 |
| T49-29 | `control-plane.md` | R96 (N1095), R98; R97 as drafted |
| T49-30 | `plane.md` | a wiring line only if needed |
| T49-31 | `site.md` (new) | folded (K3339): R1–R11, the file written whole |
| T49-32 | `journey-check.md` | folded (K3339): R7–R13 |
| rule 7 | basis-versions, promotion, plane, membership, answers, file-scanner | the wording edits |

Every cross-reference in the fold's drafted text is renumbered with it. screens-inquiry R29 reads project-roster R30, not R32. project-roster R30 names the founder by R29, not R31. op-declarations R72 replaces the fold's R73.

## Left out of T49 (one hard reason each)

"Bob's priority under the meter" stands for: Bob's priority (K3320) under the meter (K3323, K2341). It means the entry needs a job of its own, or a module with no journey job (K3324 (5)).

| entry | hard reason |
|---|---|
| legacy-ui's retirement (N1002's rest); N794, N865, N1057 | Bob's (UX): S2–S4 not drawn; the reds are touched only by its retiring job (K3052) |
| N933 whole (project-roster R29–R30's stake, public-read R36, case-import R25, conformance R41, action-records R17, actions R105, filings R60–R63, control-plane's review copy, and their specs, grades and wiring) | Bob's priority under the meter (K3324 (5)); it lands together (K3231), and most of its modules have no journey job |
| DEC-238 whole (retrieval R79 browse, membership's `lookedsincemark`, `watches`, queue-producers R41, screens-daily's browse and result kinds, their specs and grades) | Bob's priority under the meter (K3324 (5)) (S23 answered by Bob, "A", DEC-238; N1092 amended) |
| DEC-239's `actioninquiry` (action-records R18) and screens-action's no-reply question (fold's R18) | Bob's priority under the meter: action-records has no journey job |
| DEC-240's open captures (capture R91 as the fold drafts it, acquisition R46, screens-intake's "Unfinished") | Bob's priority under the meter: acquisition has no journey job, and capture's part is useless without it |
| DEC-240's Muted list (queue R55, screens-daily's Muted section) | Bob's priority under the meter: queue has no journey job |
| DEC-236's imported list (N1087: case-import R26, screens-publish's list, screens-daily's link) | Bob's priority under the meter (K3324 (5), N1081–N1088) |
| DEC-236's unnamed node (N1086: explore R25, screens-investigate's `connection.node.unnamed`) | Bob's priority under the meter: explore has no journey job |
| N1079, N1081, N1082, N1083, N1085, N1088 | Bob's priority under the meter (K3324 (5)) |
| N1084 (instance-setup's split) with `translations` and store-door's re-point | Bob's priority under the meter: instance-setup has no journey entry (K3324 (5)); it stays at 4,320 lines, past ~4,000, and is split before its next job (P6) |
| N1060 (ai-accounts R26 and credentials' test) | Bob's priority under the meter: ai-accounts has no journey job, and credentials' half tests ai-accounts' clause |
| N1069, N1070 (reevaluation, basis-versions, run-productions) | Bob's priority under the meter: no journey job in those modules (N1070 is a wait under P19, 2 of 3, by T51) |
| N1023 (conformance's C-113.6 by key) | Bob's priority under the meter: conformance has no journey job |
| N1074 (the services index), N898 (`mail done --through`) | Bob's priority under the meter: BOB's own between-tranche work that the release does not need |
| N1047's workflow step (the release notice) | Bob's priority under the meter, unless the cut needs it (then BOB's at the cut) |
| N1073 for the four registries | a dependency not yet built: N1074 |
| N1073, N1075 and N1068 for modules with no T49 job | no behaviour (P19): each waits for its module's next entry (by T51) |
| N1061, N1064, N1066, N1071 | no behaviour (test hygiene, P19): wait 2 of 3, by T51 |
| N1046 | a dependency not yet built: no offered script carries a `{template}` draft |
| N1028 | Bob's: S20 |
| N670's R88 | Bob's: DEC-127 (6)'s channel and the terms (K3190) |
| N889; N847's undrawn parts | a dependency not yet built: the design stream's keys |
| N858, N880 | a dependency not yet built: the ACTIONS-DESIGN lane's hand-off; N858's templates are also Bob's (the reviewer) |
| N923, stewards R7 | Bob's: the stewards' address (K2799) |
| N824 | Bob's: "D42 - email: A", after upload is in use |
| N751, N829, N853c, N708, N647, N563, N579, N632, N641, N643, N645, N652, N698 (part) | a measurement (as named in the draft plan); N829 also holds a public release (K3324 (4)) |
| N842 | a dependency not yet built (the interactive AI paths) and N829 |
| N703 (part), the installer's deploy | a deployment |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666, N757 | Bob's (DEC-151; "N757: A") |
| `legal_facts` triggers; the v0.2 constructs' undrawn screens | a dependency not yet built, or Bob's (UX): not drawn |
| a member's own reading, which lets a group with no assistant conclude (D8's rest) | Bob's (UX): not drawn; asked in the channel act (doubt 5) |
| DEC-242 themes (N1101), DEC-243 progressions (N1102) | Bob's priority under the meter: off the journey, new screens needing their own job (K3324 (2)) |

**No entry owed:** D10 (BOB's act); instance-setup, installer, signin-door and admission for N1072 ("No line needed", re-confirmed at the fold); capture-requests for K3321 (A) (it clears at T49-29); answers for D17 (rule 7's Provides line); test-support R2 as root.

## Measure first

- **M-T49-1** (K617, K2513; own code in `paths` on `tranche/T48` @ b54c8aa1e2, measured at this draft):

  | module | lines | note |
  |---|---|---|
  | instance-setup | 4,320 | no T49 job; split before its next job |
  | **op-declarations** | **4,026** | split by T49-16 and T49-17: about 3,110 after, about 3,150 with R71 and R72 |
  | promotion | 3,927 | the stamp adds no code |
  | membership | 3,823 | +R144 and R145: re-measured at START; if past ~4,000 before its work, BOB splits it first (P6, doubt 15) |
  | control-plane | 3,755 | |
  | agent-worker | 3,678 | |
  | ai-runs | 3,672 | |
  | op-grades | 3,289 | |
  | capture | 3,253 | |
  | queue-producers | 2,906 | no job |
  | affordances | 2,784 | |
  | credentials | 2,601 | |
  | screens-investigate | 2,559 | |
  | interface-shell | 2,414 | |
  | screens-settings | 2,305 | |
  | plane | 2,282 | |
  | screens-inquiry | 1,723 | grows most: about 3,000 estimated with R23–R40; re-measured at START |

  Every other placed module is under 2,000.
- **M-T49-2** (K3269, P14): tokens per job and per layer, beside the work done.
- **M-T49-3** (N1080, P6): `heldcaptures`' time per row at the plane's shape, before and after T49-5.
- **M-T49-4** (D24): page loads per signed-in visit, against the door's window, on the local arm before T49-18's START, and live on biosmoke8.
- **M-T49-5** (D12): which record field places a document in a project (the project's Find's `captures` count, `heldcaptures`' `project` through `provenance.homeOf`), read at T49-23's START. If no provider answers a project for a promoted information bundle from what the screen can write, the provider's line is owed through BOB (P9) before L11's START.
- **M-T49-6** (D6): PDF text through pdf-worker, live at biosmoke8.
- **M-T49-7** (D4): whether agent-worker's `/run` admits a member's own API-key run today (as M-T46-4), at T49-9's START.
- **M-T49-8** (D5): `planask`'s actor shape as `#aiRunProjectGate` receives it, at T49-8's START.

## Doubts for BOB (BOB's, P17, unless marked)

1. **Ids freed by N933's exclusion.** project-roster's N1072 line takes R29 (next free), not R31, and control-plane's N1095 line takes R96, N1072's R97. N933's draft renumbers when it opens (T50). *Recommended:* as here; the alternative of reserving ids is not the process (ids are next free at the fold).
2. **DEC-236's shell classes and DEC-240's test band (T49-19, T49-20 R65, R67) count as on the journey.** Every screen of the journey draws the shell's menu, act slots and band, and K3296 asks that the release "render properly". interface-assets otherwise has no journey job. *Recommended:* place them (one Haiku job). The alternative is to leave both out under the meter.
3. **screens-daily's model.** Home is the first screen after sign-in, but the rule names the claim and the first sign-in only (K3292). *Recommended:* Sonnet, with one model up on a test block.
4. **journey-check on the default model.** It gains six ids, its walk is the tranche's acceptance test, and its harness (R11) is new. *Recommended:* default, as "a new provided service of more than three ids". The alternative is Sonnet.
5. **D8's rest: no member can write a reading (Bob's, UX).** basis-versions has only machine-authored readings (R28, R30) and `narrow`. So a group that has no assistant, or chooses not to use one, can never conclude a question. The journey concludes through the assistant's suggested reading, as K3324 (2) says. Whether a member may write a reading herself is a question of what a member may do, so it is Bob's (P17). *Recommended:* ask the design stream in the channel act (it draws it, Bob answers), and leave it out of T49.
6. **D22's Wayback save without asking (possibly Bob's: values, legal exposure).** Every capture by address calls `web.archive.org/save` (signatures R22, through attestation). That tells a public third party what address the group is looking at. *Recommended:* BOB first reads canon (Intake Doctrine, attestation's Satisfies). If canon rules the save, it stands and no entry is owed. If canon is silent on asking, the question goes to Bob with options: (a) always, as now; (b) asked per capture; (c) a group setting.
7. **K3321 (A)'s reds through L6–L10.** agent-worker's REC100 tests and scheduler's R12 stay red until control-plane merges in L11 (P10's order). *Recommended:* accepted by name, as rule 5 (7).
8. **D13's one site.** The screen composes the information bundle for both the address path and the upload path. *Recommended:* screens-intake composes it once, for both paths. The alternative is a provider helper (capture or promotion) composing information bundles, which is cleaner (K231) but adds a job in L2 or L3.
9. **D24's limit (K1881, BOB's, reported).** A signed-in session gets its own window, and the public door's window is unchanged. *Recommended:* as T49-18. This changes no member's rights.
10. **D28.** If the console line is Chromium's own network log of the expected 403, no code can remove it. *Recommended:* T49-20's clause is conditional, and journey-check admits a network-log line for a status its step expects.
11. **journey-check's fake model (R11).** The walk worker used `agent-worker/test/inprocess.mjs`, a test file of another module. *Recommended:* journey-check serves its own fake model over HTTP at agent-worker's model address, keeping `uses` empty. If agent-worker has no configurable model address, a one-line agent-worker requirement joins T49-9 at its START.
12. **plane on Haiku (T49-30).** Its only work is wiring two ops and re-pointing hand-lists. *Recommended:* Haiku. The alternative is no plane job if the fold finds the ops wired by their owners' maps and the censuses read declarations.
13. **Haiku test-only jobs and rule 6.** *Recommended:* T49-7 and T49-11 do only N1068 and the `admin` grep, not N1075's or N1073's moves.
14. **Connecting by subscription (K3320 names it).** It needs agent-runner, a Container (N780), so it is not walkable locally and journey-check covers only the API key (K3324 (2)). *Recommended:* BOB's live walk at biosmoke8 covers it once N780's images are pullable. If they are not, Bob is told that before "ready".
15. **membership's size.** 3,823 lines plus R144 and R145 could pass ~4,000. *Recommended:* re-measure at the fold. If the work would take it past the mark, it still runs (P6 governs a module's size before its job), and its split is T50's first entry.
16. **Untested on the walk.** A real check or plan run's results, its suggested reading and its acceptance were not walkable locally, so T49-32 is the first test of them. *Recommended:* a defect T49-32's START or run finds in a lower module goes through BOB as a CHANGE to that module's job if it is still open, else to T50 (P10). The release waits on it only if it breaks the journey (K3320).

## Settled by BOB #177 (K3327; BOB's, P17)

- Doubts 1–4 and 7–16: as recommended.
- Doubt 5 (D8's rest, a member writing a reading herself): UX, asked of the design stream in the opening's channel act; left out of T49. DEC-245 draws the journey's conclusion through the assistant's proposal, which T49 builds.
- Doubt 6 (the Wayback save): **not Bob's, no entry.** Canon rules it: Intake Doctrine v1.1, "Raising a grade mechanically", makes the co-archive request at capture time REQUIRED of the fetch layer "wherever the source permits"; co-archives are third-party public archives anyone can visit.
- PR #37 merged at the boundary (K3326): DEC-241 (N1099) and DEC-245/DEC-246 (N1100), all on K3320's path, join the jobs that draw them: interface-shell R69, screens-entry R21, screens-settings R38, screens-intake R25, screens-daily R33, screens-inquiry R41–R42, journey-check R13. No new job. DEC-242 and DEC-243 are left out (N1101, N1102).
- The design's commit for setup-words, interface-assets and affordances is `f498560a37` (or later at START).
- Capture's "For which question" is carried as `capturerequest`'s `lead_inquiry` (U242's question; BOB's).
- Models stand as rule 3; screens-inquiry stays on the default model with R41–R42 added (re-measured at START; split first only if past ~4,000 before its work, P6).

- L3–L10 fold (K3331): `draft-T49-fold-L3-L10.md` (a worker's, reviewed whole) folded as written; each job's START carries that draft's "START must say" lines.
- L11 (a) fold (K3333): `draft-T49-fold-L11-a.md` (a worker's, reviewed whole) folded: op-capabilities.md written, op-declarations R3/R71/R72, op-grades R43, admission R27, control-plane R96–R98, rule 7's edits; its doubts 1–5 as recommended; each job's START carries its "START must say" lines. plane needs no line (T49-30 re-pins tests only).
