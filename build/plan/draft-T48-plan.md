# Plan T48

**Status** · DRAFT · a read-only worker's draft for BOB #168 (`session_01VTXBipr6EdECyKwXqrQgLV`), 2026-10-13, written while T47 runs L10 (K3133) with L11's STARTs prepared (K3134). Not reviewed. It opens (§5.2) the moment T47 closes (§5.7), after BOB reviews it whole and re-tests it against T47's Outcome.

**Sources** · `next.md` N751…N1025 (each re-tested); `current.md` (T47: Entries, "Left out of T47", rule 5's reds, "BOB's acts", "Measure first"); `rulings-active.md`; rulings K3092, K3099–K3134 (by id); `modules.json` (order, layers, `legacy`); `handoff.md` item 5; `extraction/credentials-split.md` (adopted, K3101: seam A, `ai-accounts`); `extraction/publication-split-4.md`; PROCESS-DESIGN P10, P18, P19; MECHANICS §5.2, §12. **To re-test at the opening:** every T47 L10 and L11 entry against T47's Outcome (the "Carried" table below); `credentials-split.md` §2 and §5 line numbers on `tranche/T47`'s close (K3101); BOB's legacy-ui census (K3100 gap) at T47's close.

## Legacy census (§5.2 (2))

| legacy module | in T48 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **retires** | T48-41 deletes its code and tests (K3052: no user meets an old interface; K3070: dropped from `modules.json` in T48). Its reds N794 and N865 go with it. Before that delete, BOB's census at T47's close lists what legacy-ui serves that `/app` does not. Each gap found becomes an L11 entry in the owning screen module, merged before T48-41. Taking the `civicos` Worker off `biosmoke7` is a deploy act that Bob approves in session (K1716). **Only hard reason that keeps it:** a gap the design stream has not drawn. legacy-ui then stays, with that gap named. |

It is the only module marked `legacy` in `modules.json`. `setup-page` is not marked legacy. It is retired in T47 (T47-74), and its row is dropped at T48's opening (rule 3).

## Rules at the opening

1. **Merge order** within a layer follows `modules.json` order unless the layer says otherwise: a provider before its users, a new module first in its layer (K624), and promotion's stamp last in L2. In L11, plane merges after control-plane, and legacy-ui's delete comes last. Each layer's text is folded before its START (BOB's wording, P5). Every new or amended line ends *(not yet met: T48)*.
2. **Every job reads its own code and tests whole** (P20). **A job's Size line counts only its module's own code** (K2513, K3101). Each START says so.
3. **The opening's act (K657, K1043, K624):**
   - `modules.json` and `layers.md` gain `ai-accounts` (L2, after `project-roster`, before `credentials`; uses record-grammar, record-core, membership; empty `paths` and `tests`).
   - `setup-page`'s row is dropped (its code was deleted by T47-74; a path naming nothing fails the format check, K1975). If T47-74 did not merge, this waits.
   - `requirements/ai-accounts.md` is written (split map §4, BOB's text). `requirements/credentials.md` retires its 23 moved ids and gains R72 and R73.
   - Split map §2 and §5 line numbers are re-taken (K3101).
   - membership's `MODULE_ORDER` entry is T48-5.
4. **Splits by copy, then delete (K624):** `ai-accounts` merges first in L2. credentials' job deletes the copies after it. R72's delegates keep every user green (K3101). Each user re-points in its own T48 job (T48-11…T48-40).
5. **Accepted reds at the opening** (re-checked against T47's Outcome):
   1. coverage: every id marked *(not yet met: T48)* until its module's merge;
   2. row census:
      - rows that T47's L3+ jobs added or changed, until T48-8: C-140.2, .3, .13, .38, .43 (K3066); C-29.42–.47 and C-96.53 (K3084); C-107.4 (K3099); C-115.57, .58 (K3122); C-125.4's one site (K3124); the moved `where`s of case-inputs and action-records; T47's L10–L11 rows as its Outcome names them;
      - rows that T48's L3+ jobs add or change (N1023, N1024 among them), until T49's stamp;
   3. membership `MODULE_ORDER`: R83's and R140's list tests (N1014: `signin-door`, `journey-check`; K3100) until T48-5. After that, `legacy-ui` is listed in `modules.json` but absent from `MODULE_ORDER` until T48-41 (doubt 2);
   4. legacy-ui `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865), until T48-41 deletes them;
   5. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   6. **the credentials split windows** (split map §7):
      - from T48-3's merge to T48-7's: the moved C-29.13…45 codes are held by two `checks.mjs` files (row census, closed in L2 by T48-8);
      - from T48-7's merge until T48-35: answer-envelope `families.test.mjs` R2 (the moved codes are not decorated by `dec49Row`; members see the same words);
   7. whatever T47's close leaves red, by name, from its Outcome (K2704).
   Any other red a merge opens is named at that merge (K2704).

## Entries

### L1
- **T48-1 · record-grammar** · (N1017, K3112) R46's `ID_TABLE` gains `OUTC` (carried outcomes), and its `WCD` row names `case-inputs` as owner; (N994, K3034) the stale comments in `ids.mjs` and `document.mjs` corrected · text BOB's.
- **T48-2 · file-scanner** · (N1010, K3066) its Purpose's "safe-copy makers" re-worded to DEC-200 (5)'s "safe view", along with any member-facing text it serves · text BOB's.

**L1 merge order:** record-grammar, file-scanner.

### L2
- **T48-3 · ai-accounts** (new) · (N996; K3101) built by copy (split map §2, §6), R1–R33 · `credentials-split.md` · first to merge in L2.
- **T48-4 · record-core** · (N1018, K3112) R62's `mintExhausted` gains a fixed sentence for `WCD` and `OUTC` · text BOB's.
- **T48-5 · membership** · R83 `MODULE_ORDER`:
  - gains `ai-accounts` before `credentials` (K657);
  - gains `signin-door` after `store-door` and `journey-check` last (N1014, K3100);
  - drops `setup-page` (rule 3) and `legacy-ui` (doubt 2);
  - `module-order.test.mjs` and R140's list test re-pinned.
  Also (N1019, K3112) R44's sight levels spelled as `sight` answers them · text BOB's.
- **T48-6 · project-roster** · (N1025; DEC-214 (3), K3127) R27: `projectlist` answers each project's members, its acts per week over the last eight weeks and its last change, counting only what the viewer may see, tested · text BOB's.
- **T48-7 · credentials** · (N996; K3101; split map §3, §8 step 3):
  - deletes the copies;
  - creates `ai-accounts` in its factory and runs its `migrate` first;
  - re-points §3's sites;
  - adds R72 (thin delegates, byte-identical, through T48) and R73 (`onAccountCleared`: run credential revoked, standing grant ended);
  - retires the 23 ids as "moved to `ai-accounts` R<n>";
  - stops declaring the eleven tables in the same commit;
  - `uses` gains `ai-accounts`.
  After T48-3 · text BOB's.
- **T48-8 · promotion** · **the stamp**:
  - T47's L3+ rows (rule 5 (2));
  - `gate.mjs`' aggregate gains `case-inputs`' `CARRIED_OUTCOME_CHECKS` (T47 "Left out", the order);
  - T48's L1–L2 rows: N1018's sentence, and ai-accounts' moved and new rows with their `where`s.
  Text BOB's · last in L2.

**L2 merge order:** ai-accounts first (K624), then record-core, membership, project-roster, credentials (after ai-accounts), promotion last.

### L3
- **T48-9 · provenance** · (N1009, K3065) R1 updates `register.registered` on a re-registration under the same bundle. R48 states which instant `registered` holds (the first registration, with the last held separately), so capture R77's "first registered" reads true; tested · text BOB's.
- **T48-10 · acquisition** · (N998, K3044) R2/R27's comparison of two captures made independent of timing (its cause found, never skipped) · test robustness.

**L3 merge order:** provenance, acquisition.

### L4
- **T48-11 · reading-pipeline** · (N996 §5) `accountFor` read from `ai-accounts` (its dep `accounts`); `uses` drops `credentials` and gains `ai-accounts`; `transcribe` test follows.
- **T48-12 · extraction** · (N996 §5) its tests' `credentials: {accountFor}` stub follows reading-pipeline's dep name; the comment at :1593 cites `ai-accounts` R7 · test only.

**L4 merge order:** reading-pipeline, extraction.

### L6
- **T48-13 · inquiry** · (N1012, K3092, K3102) a write refuses any revision of a terminal (`divided`) question's document, through R11's checks, as `ground` does with `DIVIDED_CANNOT_RESTRUCTURE`. Whether this is the same code or a distinct one is BOB's at the fold (K231). Tested with a sever through citation · text BOB's.
- **T48-14 · basis-versions** · (N1013, K3099) R28's documented `appendVersion` call names `version.author`, which R49's accept arm keys on; with its test (P7) · text BOB's.
- **T48-15 · ai-use** · (N996 §5) `accountUses`, `accountUsesOf`, `aiKeptAway`, `projectsKeptAway` and `USE_KINDS` read from `ai-accounts`; `uses` drops `credentials`; its tests follow (`explore`, `fixture`, `limits`, `reads`, `t42`, `t43`, `t44`).
- **T48-16 · ai-runs** · (N996 §5) `groupKeySwitches`, `accountUses`, `accountReferenceState`, `groupKeyState`, `accountFor` read from `ai-accounts`. It keeps `credentials` for `aiRunCredentialMint`, `aiRunCredentialsEnd` and `aiCredentialLook`. Its tests follow (`reexam`, `scheduler`, `t46`, `usage`, `world.mjs`).
- **T48-17 · run-productions** · (N996 §5) `aiKeepAwayState`, `projectsKeptAway` from `ai-accounts`; `uses` drops `credentials`; `reading` test follows.
- **T48-18 · skills** · (N996 §5) `skilldoctrine.mjs`:1640's citation of `credentials.accountFor` (R35) re-pointed to `ai-accounts` R7 · wording.
- **T48-19 · question-explorer** · (N996 §5) `accountUses`, `aiKeptAway` from `ai-accounts`; `uses` drops `credentials`; `choosing`, `fixture`, `runs` follow.
- **T48-20 · answers** · (N996 §5) `ACCOUNT_CHECKS.NOT_YOUR_ACCOUNT`, `projectsKeptAway`, `accountFor`, `aiKeptAway` from `ai-accounts`. It keeps `credentials` for `AI_GRANT_TTL_SECONDS` and `aiGrantMintStanding`. `accounts`, `standing`, `words` follow.
- **T48-21 · agent-worker** · (N1015, K3103) `/ask`, `/run`, `/draft`, `/transcribe` take the `trace` and member-ref headers when sent and use agent-model's `converse({trace, memberRef})`; tested with and without them · text BOB's; the door's half is T48-39 and T48-40.

**L6 merge order:** inquiry, basis-versions, ai-use, ai-runs, run-productions, skills, question-explorer, answers, agent-worker.

### L8
- **T48-22 · case-grammar** · (N1016, K3111) R14 reads R31's stored `kind` first and the copy's bytes only when no `kind` is stored (doubt 7); its T39 test re-stated. (N1019) its public part names `SECTIONS` and `OUTCOME_KINDS` · text BOB's.
- **T48-23 · publication** · (N1019, K3112) R40's `case_documents` readers and R23's doors name `case-inputs` and `statedEdition` · text BOB's (no capability; publication's own code is 3,635 lines, doubt 1).
- **T48-24 · public-read** · (N1021, K3114) R3's photo rule reads "by `case-grammar` R12's `marked`" (the stated mark wins, else the label), with the stale "(proposed, case-carriage R15)" removed. R35 says a row whose `kind` was written null reads as one stating none. Each is confirmed by its test · text BOB's.
- **T48-25 · case-import** · (N1020, K3113) R16's null answer for a viewer who is not an active member is stated of the reads that take a viewer (not `withdrawals`, `moves`) · text BOB's.

**L8 merge order:** case-grammar, publication, public-read, case-import.

### L9
- **T48-26 · conformance** · (N1023, K3123) C-113.6 `NO_FINDINGS`'s translation re-worded so that accepted findings from another group's case count (R32). It is read by key if the design stream gives one (BOB's channel act). Stamped at T49 (doubt 4) · text BOB's.
- **T48-27 · action-grammar** · (N1024, K3125) R28 lists C-32.4 and C-33.6–.9; their `where`s name T48-28's one site (K231); census fixtures follow · after T48-28.
- **T48-28 · action-records** · (N1024) provides the one site minting C-32.4 and C-33.6–.9 (the machine fence and the correspond-entry checks that `actionReceipt` applies), for actions to call · text BOB's · first in L9 (doubt 5).
- **T48-29 · actions** · (N1024) `actionCorrespond` calls T48-28's site and keeps no region of its own for those codes; (K3128) its `t45` row-census test stops reading source text and reads the census through its interface · after T48-28.

**L9 merge order:** action-records, conformance, action-grammar, actions.

### L10
No entries of its own (see "Carried": T47-45, T47-46 if left open).

### L11
- **T48-30 · wizard-scripts** · (N996 §5) `aiKeptAway` (`index.mjs`:389, `writing-help.mjs`) from `ai-accounts`; `uses` drops `credentials`; `writing-help` test follows.
- **T48-31 · affordances** · (N996 §5) `t36-backing`, `t41-backing` follow the moved services · test only.
- **T48-32 · notice-producers** · (N996 §5) `projectAccountsSuspended` from `ai-accounts`. It keeps `credentials` for `securityMap` and `securityLevel`. `accounts` follows.
- **T48-33 · instance-setup** · (N996 §5) `aiKeepAwayState`, `aiKeptAway` and T47-75's disclosure read registration (`registerDisclosureRead`, now ai-accounts R23) go through `ai-accounts`. It keeps `credentials` for `recoveryCodesState`. `assistant`, `t41`, `translations`, `recovery`, `fixture` follow.
- **T48-34 · op-declarations** · (N996; split map doubt 4, K3101) the moved ops form an `ai-accounts` family; specs and names unchanged; tested.
- **T48-35 · answer-envelope** · (N996) `CHECK_FAMILY_FILES` adds `src/ai-accounts/checks.mjs` directly before credentials'; the order test pins it; clears rule 5 (6)'s `families.test.mjs` R2.
- **T48-36 · store-door** · (N996 §5) `dispatch.mjs`'s `aiKeptAway`, `accountFor`, `subscriptionConnected` from `ai-accounts`. It keeps `credentials` for `aiGrantAdmit`, `signerRegisterOwn` and `signerRevokeOwn`. `dispatch`, `routes` follow.
- **T48-37 · signin-door** · (N996) its citations of `credentials.aiKeptAway` (R35), `subscriptionConnected` (R43) and the held token (R70) re-pointed to `ai-accounts` R7, R18, R19 · wording; if T47-91 merged (else in control-plane's T48-39).
- **T48-38 · screens-daily** · (N1025, K3127) R10's project rows draw members, eight-week activity and last change from T48-6 · text BOB's.
- **T48-39 · control-plane** · (N996 §5) T47-65's `DISCLOSURE_DUE` relay re-pointed to `ai-accounts` R23; `t34-routes`, `r53-routes` follow. (N1015) the request's `trace` and member ref (R85's form) passed to the plane's ask, run, draft and transcribe calls · text BOB's.
- **T48-40 · plane** · (N996 §5) spreads `aiAccountsOps` directly before `credentialsOps`; `ask.mjs`, `transcribe.mjs` and `store.mjs` read the moved services from `ai-accounts`. (N1015) `ask.mjs`, `transcribe.mjs` and the run and draft dispatches forward the door's `trace` and member ref to agent-worker. Its tests follow (`ask`, `t33`, `t41`–`t46`, `maps.mjs`) · text BOB's · after T48-39.
- **T48-41 · legacy-ui** · (K3052, K3070; N1002's rest; N794, N865) retired:
  - `civicos-ui/`, `bio-plane/test/budget.mjs` and `caseceremony.mjs` deleted (a test there that covers a non-legacy module moves to that module's tests first, named in its record);
  - its `modules.json` and `layers.md` rows dropped at the merge.
  It merges after every gap entry from BOB's census. The Worker deploy act is Bob's · last in L11 but for journey-check.

**L11 merge order:** wizard-scripts, affordances, notice-producers, instance-setup, op-declarations, answer-envelope, store-door, signin-door, screens-daily, control-plane, plane, legacy-ui. journey-check is run after them (T47-88's check, no T48 entry).

**Counts:** L1 2 · L2 6 · L3 2 · L4 2 · L6 9 · L8 4 · L9 4 · L10 0 · L11 12 = **41**, plus the carried rows below that T47 leaves open.

## Carried: if T47's L10/L11 leaves it open

Each row joins T48 in the same module and layer, under its T47 text, **only if T47's L10/L11 leaves it open** (re-tested at the opening against T47's Outcome):

| T47 entry | N / source | module (T48 layer) |
|---|---|---|
| T47-45 | N969 (`monitoring.enabled` act) | monitoring (L10) |
| T47-46 | N967 (`dutyWatchEndAt`) | following (L10) |
| T47-47 | N992, N984; K3062 R35, R36 | wizard-scripts (L11) |
| T47-48 | N987; T47's new ops graded; `peopledirectory` | op-grades (L11) |
| T47-49 | N992, N908 §5, N961 §5; R56; K3102; K3104 | affordances (L11) |
| T47-89 | DEC-207 (8) R19 | tasks (L11) |
| T47-50 | N968; DEC-212 R25; K3122 | action-producers (L11) |
| T47-51 | N889, N967; K3084 | notice-producers (L11) |
| T47-73 | N983 (`queue`) | queue (L11) |
| T47-74 | N1002 (setup-page's delete) | setup-page (L11; rule 3 waits on it) |
| T47-52 | N992; K3062 R7 | setup-words (L11) |
| T47-75 | N989, N982, N981; N1002 R83; DEC-205 | instance-setup (L11) |
| T47-77 | K3043, K3084 R23–R25 | admission (L11) |
| T47-53 | K3041, N992, N980, K3084, R57–R61 | op-declarations (L11) |
| T47-54 | N992, N908 §5; N1002, N1001 R16 | answer-envelope (L11) |
| T47-55 | N970 | store-door (L11) |
| T47-91 | N1001 (signin-door by copy) | signin-door (L11) |
| T47-56 | N985–N987, N897 (1), N999, DEC-200–DEC-214 R32–R44 | interface-shell (L11) |
| T47-86 | N999, N1002, N1005 | screens-entry (L11) |
| T47-57 | N897 (1), N821, N551, N572 | screens-wizards (L11) |
| T47-58 | N984, N985, N989, N897 (1), R17–R24 | screens-settings (L11) |
| T47-59 | N987, N979, N980, N969, N688; R16; K3114 | screens-intake (L11) |
| T47-60 | N972; R10–R13 | screens-daily (L11) |
| T47-61 | N986, N974–N977, N955, N721; R15, R16 | screens-inquiry (L11) |
| T47-62 | N897 (1), N997, N1008 (D8); R11–R14 | screens-investigate (L11) |
| T47-63 | N897 (1), N788, N757, N683; K3041, K3079, K3080, K3114 | screens-publish (L11) |
| T47-64 | N897 (1); DEC-209, DEC-212 | screens-action (L11) |
| T47-65 | N981, N955, N908 §5, K3084, R82–R88, K3104 (with control-plane's copy delete after T47-91) | control-plane (L11) |
| T47-87 | N1003 | installer (L11) |
| T47-66 | N993, N981, N955; K3084, K3089; R47, R48 | plane (L11) |
| T47-88 | N999, N1004 | journey-check (L11) |

N1006 (Q1–Q4) and N1008 are settled by K3052, K3060, K3061 and folded in T47's L11 (`draft-T47-L11-fold.md` table). They move to `archive/next-applied.md` with their last T47 merge, or join here with the row that carries them.

## New modules: places (K617, K657, K1043, K624)

| new module | layer, place | built by | uses (all earlier) |
|---|---|---|---|
| `ai-accounts` | L2, after `project-roster`, before `credentials` | copy from credentials (split map §1, §2) | record-grammar, record-core, membership; tests `node:sqlite` (or test-support) |

**Edges:**
- Added: credentials → ai-accounts; and ai-accounts from reading-pipeline, ai-runs, answers, instance-setup, notice-producers, store-door, plane, wizard-scripts, ai-use, run-productions and question-explorer (each per split map §5's "uses after"; signin-door if it imports it).
- Dropped: `credentials` from reading-pipeline, ai-use, run-productions, question-explorer and wizard-scripts.
- No edge points later.

**Modules dropped:** `setup-page` (at the opening, rule 3) and `legacy-ui` (at T48-41's merge).

## BOB's acts (no job)

- **The opening act** (rule 3), and **requirements before each START** (P18): `ai-accounts` R1–R33 (split map §4); credentials R72, R73; each "text BOB's" entry.
- **The legacy-ui census** at T47's close (K3100 gap; K3052): each gap becomes a T48 L11 entry before T48-41. **Bob's deploy act** takes the `civicos` Worker off `biosmoke7` (K1716): walk him through it in session.
- **N1022 closed** with a K (doubt 1).
- **Channel:** ask UX-DESIGN for a key for C-113.6's sentence (N1023). UX-DESIGN's NOTICEs that arrive after T47's L11 START (the assistant's usage and cost panels; a connection graph on Explore connections, person and money; Bob's direction of 13 October) are folded into T48's L11 as entries when posted.
- **N898:** `mail done --as bob` refuses a `--through` past the job's last entry. This is in the process repository, between tranches, certified on a dry run (P3).
- **N780 / K3060 D15:** at T47's release cut, the workflow publishes agent-runner's and file-scanner's images to the public GitHub registry. `biosmoke7` copies them into its account's registry (K2816 (4), T47-67).
- **N945:** BOB's study of `bootstrap`'s `rearmed: true` on `biosmoke7`. A credentials entry joins T48's L2 only if a requirement changes and it lands before L2's START.
- **Release at T48's close** only if it lets held work in (N647, N708 measurements; K1501).

## Left out of T48 (one hard reason each)

| entry | hard reason |
|---|---|
| credentials R72's retirement (its delegates removed) | the order: its users re-point in L4–L11 after credentials' L2 job; T49's credentials job |
| row census for T48's L3+ rows (N1023, N1024 among them) | the order: promotion (L2) runs before they change; T49's stamp |
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N829 | a measurement: the 2–3 cases (K3060 D12) come from the samples run in the test group plus Bob's own; their answers are written by people |
| N842 | a dependency not yet built: no `enquire` conversation, door or op, no account draft task; and N829 |
| N847 | a dependency not yet built: the pointer's content is the design stream's (N821); no provider named |
| N853c | a measurement: OCR's accuracy on members' photos |
| N858 (placing the two `@records-request` templates into a profile) | Bob's: the reviewer under R15 (K3081, K3120); a jurisdictions entry joins the moment he names one |
| N880's minutes comparison (U4) | a dependency not yet built: no module holds a meeting's minutes beside a comment |
| N882's "proceeding followed with its own dates" | a dependency not yet built: COURTS L2 is not a requirement; no module assigned |
| N923 and stewards R7 | Bob's: the stewards' contact address (K2799); joins L11 the moment he names it |
| N933 | a dependency not yet built: the actions lane's answer on a per-matter stake |
| N945 | a measurement: BOB's study of the live store first |
| N1011 (civicsmith.org) | Bob's: his DNS and the site's host (K3060 D14, K3079); its module is placed when named |
| N670 | a dependency not yet built: no act or owner for "read in my language" |
| N708 | a measurement: M-Q2 at Bob's first sign-in on 0.83.0; joins L2 (now ai-accounts R1) if done by its START |
| N647 (`investigate`, `extract` on the test instance) | a deployment and measurement: `op=airunverify` on the live instance first; joins L6 if verified by its START |
| `legal_facts` triggers detected at their moment | a dependency not yet built: no registry screen for attending or recording |
| the v0.2 constructs' screens not yet drawn; the dashboards (S20, DEC-214 (4)) | the design stream's (not drawn); S20 is Bob's after the test instance |
| the installer's deploy | a deployment: Bob's dashboard act on the OAuth client (`connectivity-directory.bind`, K2164) |
| N757 (later) | Bob's: "N757: A" (K2425) |
| N563, N579, N632, N641, N643, N645, N652, N698 (part) | a measurement (as T37's table names each) |
| N703 (part: Cloudflare's blocked-request counts) | a deployment or measurement: a zone and read token per group |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666 | Bob's (DEC-151): after the first public release |
| N1022 (publication's split) | none owed: the premise counted public-read's `worker.mjs` (doubt 1) |

## Measure first

- **M-T48-1** (K617, at each START, own code only, K2513): credentials after T48-7 (map: ~2,600) and ai-accounts (~2,085); plane, control-plane after T47-91, interface-shell and the screens modules with T47's additions; ai-runs (3,660), op-declarations (3,641) and instance-setup (3,592) before their re-points; promotion (3,889) before its stamp.
- **M-T48-2:** at L8's START, publication's own code (3,635 today: `index.mjs` 2,746, `schema.mjs` 614, `checks.mjs` 111, `door.mjs` 109, `deliverer.mjs` 55).

## Doubts

1. **N1022's premise is the old miscount.** Its 4,468 lines include `src/publication/worker.mjs` (833), which `modules.json` gives to `public-read` by the more specific path. That is the same error K2424 and K2982 corrected. Publication's own code is 3,635. *Recommend:* close N1022 with one K (no split owed; `publication-split-4.md` stays as headroom), and let T48-23 run.
2. **legacy-ui in `MODULE_ORDER`.** T48-5 runs in L2, and legacy-ui's files go only at T48-41 (L11). *Recommend:* T48-5 drops it now and the list test stays red by name until T48-41 (a window inside T48). *Alternative:* keep it, and re-pin in T49's membership job (a T49 entry for order only).
3. **Users re-point in T48, not "in their next jobs".** This is 15 L4–L11 jobs (T48-11…T48-40), each small. P19 rules out deferring for size, and the provider merges in L2, so all are safely doable now. *Recommend:* keep them in T48. Only R72's retirement waits for T49 (the order).
4. **N1023's stamp.** next.md says "stamped by T48's promotion", but conformance (L9) changes the row after promotion's L2 stamp. *Recommend:* stamp in T49, accepted red by name in the meantime, and ask UX-DESIGN for a key now so the job reads it.
5. **N1024's one site.** Both actions (`actionCorrespond`'s regions) and action-records (`actionReceipt`) mint C-32.4 and C-33.6–.9. *Recommend:* action-records holds the site (it is earlier than actions; K231's "provider holds it"), actions calls it, action-grammar's `where`s name it; merge order action-records, then action-grammar, then actions.
6. **N1015's trace source.** *Recommend:* control-plane mints the trace (R85's form) and plane forwards it (T48-39, T48-40), with agent-worker accepting the headers when sent (T48-21). This is technical, BOB's.
7. **N1016's robustness choice.** *Recommend:* R14 reads the stored `kind` first, else the bytes. This is consistent with public-read R3's "stated mark wins" (N1021) and N953's marker.
8. **legacy-ui's retirement depends on BOB's census at T47's close.** *Recommend:* run it before T47's release (handoff item 4), and plan each gap as an L11 entry here at the opening. If a gap has no design, legacy-ui stays, named in the census.
