# Plan T38

**Status** · OPEN · BOB #142 · session_0178ib9gzWRThTx5twPvt6PS · depth 1

**Jobs** · bundler: BUNDLER #12 session_01UyPgDNZCNdqccnSPgPyQtP; image-codecs: IMAGE-CODECS #3 session_014rRSsfp8Sqbc9QHisanAS9; file-scanner: FILE-SCANNER #3 session_01DMNhj25urK6A68HrWJ3mho; project-roster: PROJECT-ROSTER #1 session_01BKBobNgxRx5HUaSctGHTUH; membership: MEMBERSHIP #29 session_01P83PRD8HPZGBJ9ET2KJie5; credentials: CREDENTIALS #9 session_011Sz476u5szTBqKpR6HExC4; promotion: PROMOTION #36 session_013zZkEVT5VnVz668Zz9kZux; host-governor: HOST-GOVERNOR #8 session_0169cu6wYS5iQTcatDMjjXq7; file-safety: FILE-SAFETY #3 session_01Jj7S96F3fqJH68Y3RMjAAY; extraction: EXTRACTION #17 session_01GXLVBfXBcg51dL2ddA46vX; bias: BIAS #12 session_01H5SGMsATdVSiwtbHK79v41; agent-model: AGENT-MODEL #4 session_01Ad5jo3ATsxaCVanqA7zcKg; ai-runs: AI-RUNS #13 session_01A8UNAiBU2W2MMZQtcUvj1x; agent-worker: AGENT-WORKER #14 session_01FkkvLb4mMocNRN7xTn7DXk

**Sources** · `next.md` N748, N751, N779–N788 (every open entry); `current.md` (T37): its "Left out of T37" table, its rules at the opening (rule 6's accepted reds still open: 2, 3, 20, 22; the host-governor nine of red 17), "P6 notes"; `modules.json` (order, layers); `rulings-active.md` (K617, K624, K657, K1821); rulings K2171, K2179, K2186, K2189, K2200, K2203, K2218, K2220, K2226–K2232; PR #15 (UX-DESIGN's MERGE U132: DEC-183, `words.json`'s `photo.*`), on `main` at T37's close. PROCESS-MECHANICS §5.2, §12.2; PROCESS-DESIGN P4, P6, P8, P10, P17, P18, P19.

**At T38's opening (K2262):** every T37 entry is merged and T37 closed (`main` @ `0a2aa79231`, K2261); T38 opens from `tranche/T37`'s tip; PR #15 (DEC-183) is on `main` (K2258), so "a DEC folds only once on `main`" is no hard reason in T38 and N788 enters. T37-16 and T37-17 (N708's sign-in, L6) are built, so N708's remainder (credentials R22's `subscription` retirement) enters with N785. N779 enters (Bob, K2248), and N789–N793 (found in T37's last layers). Still hard reasons: the new screens' shell (N672); every deployment or measurement no T38 entry takes; Bob's open questions (N748).

## Legacy census (§5.2 (2))

`modules.json` marks exactly one module `legacy: true`.

| legacy module (`modules.json`) | in T38 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`; `app.html` 26,551 lines, its `.mjs`/`.js` 13,444 lines incl. tests, as T37 measured) | stays | No T38 entry retires or touches it. Hard reasons: Bob's (UX), K633 (it stays until the new interface replaces it); and a dependency not yet built: the new member screens and their shell (N672, N559). T37's red 21 cleared with T37-33; red 22's earlier cause (M0-107) stood and is N794, left out (K633). |

## Rules at the opening

1. T37's rules hold. Merge order within a layer is `modules.json` order, except where a layer's merge-order line says otherwise. Each entry reads its module as T37 merged it; its wording is checked against T37's requirement text at the opening.
2. **N783: membership is split before any job adds to it (K617, K624).** membership is 3,970 lines (K2186; 3,970 again on `tranche/T37` @ `5fd61bfb68`). BOB fixes the boundary at the START of L2 (which functions move, the new module's name, its place in L2's order before or after membership as the `uses` direction requires, and each moved id retired "moved to <module> R<n>"), with no change to any requirement's meaning. At the opening, the new module enters `modules.json` (layer 2, its place, empty `paths`) and the same act carries a membership `MODULE_ORDER` (R83) entry (K657, K1185): T38-4 below. Copy, then delete, in this tranche: the new module's copy job merges first in L2, then membership's job deletes its copy and re-points (K624). No other job adds to membership in T38.
3. **N782: BOB's choice (K2179) is that image-codecs R1 states the header shape it answers** (`readJpegHeader`'s `hts.dc[i]`, `hts.ac[i]`: `maxcode`, `valptr`, `mincode`, `symbols`, `fast`, `FAST`), not a DHT parser in image-cover: one owner of the shape, no duplicated parsing, image-cover reading it under R1. Recorded at the opening.
4. **N788 enters (DEC-183 on `main`).** Its packaging is BOB's (P17): the gate and its refusal in case-disclosures (the state) and case-authoring (signing); `obscuremarkwithdraw` in case-carriage; its declaration, grade and route at L11. Its words are `words.json`'s `photo.*`, read by key (K2220). Its screens (the Photos step's surface) stay out (N672).
5. **`modules.json` edges (BOB's, P17), at each START:** the split's (rule 2); none else expected (agent-model already reached by agent-worker; N788's ops follow T37's `obscuremark` edges). Each START confirms against `modules.json`.
6. **Accepted reds expected at the opening, by name (BOB confirms them):**
   1. Coverage: every id marked `*(not yet met: T38)*`, until its module's merge.
   2. Row census: rows T37's L3–L11 jobs added or re-worded (among them conformance's seven C-113 `where`s, K2231, K2232: `row-census.test.mjs` fixture lines 206, 212, 222, 225, 226, 228, 229; case-carriage's C-141; case-disclosures' `PHOTO_NOT_COVERABLE` C-120 row) stay `awaiting stamp` until T38-6; rows T38's L3–L11 jobs add stay awaiting until T39's promotion job (P4).
   3. The UI's DEC-88 tests (Bob's), carried.
   4. membership R83's `MODULE_ORDER` test (and its sister tests reading the order), from the opening's addition of the split's new module until T38-4 re-pins it (K1185).
   5. bundler `fleetbundles.test.mjs`:232 (agent-worker's 23 inputs; T37's red 20), until T38-1 (N787).
   6. host-governor `ops.test.mjs`'s nine tests (T37's red 17 share, C-38.10, C-38.11), until T38-7 (N784).
   7. legacy-ui `statement-ack.test.mjs` (T37's red 22; its earlier M0-107 cause stood at T37's L11 close, K2257): N794, held by K633's hard reason; accepted red by name.
   8. `case-checker/program.mjs` and the plane bundle, staled by any T38 L8 merge, regenerated at L8's close (§5.6 (1)).
   9. file-safety tests that read file-scanner's `config` lists (`securityToolAdd`'s required check after it deletes `cfg.host`/`cfg.region`), from T38-17's merge until T38-18 (K2264): 29 of its 49 tests (FILE-SCANNER #3 J3: R4, R5, R8–R10, R12–R16, R18, R21–R23, R25, R27–R33, R35, R37, R39–R41, each through a tool add answering `CONFIG_MISSING` host/region); named in T38-18's START.
   10. `system/resolveversion.test.mjs` ARM 7 (file-scanner at 0.79.0 against the plane's 0.81.0), until file-scanner's re-merge (K2266).
   11. From membership's second merge (its copy of the moved project acts deleted) until T38-26 (plane, L11): the plane registers no project-roster listener (R15, R16) and spreads none of its ops (`projectrequest*`, `projectdirectory`, `projectowner*`, `projectvisibility`, `projectparticipants`); a test that drives those ops or that closing through the plane is red by name, named in its owner's START (MEMBERSHIP #29 J2, K2276). At membership's second merge (J4, K2281): affordances `plane.test.mjs` (28, `op=projectowneradd`), promotion `d526-refusal-order.test.mjs` section 4 (`op=projectparticipants`), plane `stats.test.mjs` (2, `projectOwnerVotes`), all until T38-26; answer-envelope `catalogue-end.test.mjs` (`LAST_OWNER`'s row), until T38-25; bias `debt.test.mjs`:103 (its setup calls the moved `projectOwnerAdd`), until T38-27. plane `test/system/migrate-released.test.mjs` (every release: a fresh store lacks project-roster's three tables, which no schema assembly loads yet), until T38-26 (K2294). ai-runs `scheduler.test.mjs`:171–175 (a `subscription` reference, refused since T38-5), until T38-28 (K2283).
   12. project-roster `figures-purge.test.mjs`'s two tests over the real record-core (R17, R18: `TABLE_DECLARED`, membership's copy still declares the moved tables), until membership's second merge (its R115) (PROJECT-ROSTER #1 J2, K2278).
   13. answer-envelope `families.test.mjs`'s two totality tests (R2/R7, and T37's case-carriage one), naming `src/project-roster/checks.mjs` as unreached, from project-roster's merge until T38-25 (L11) (PROJECT-ROSTER #1 J2, K2278).
   14. scheduler `files.test.mjs`:288 (render's `RENDERER_ABSENT` tick with no scanner bound), from T38-18's merge until T38-30 (FILE-SAFETY #3 J1, K2293).
   15. affordances `t36.test.mjs`:40 (R48: 204 texts since PR #15, the table 203), until T38-31; op-declarations `t37.test.mjs`:175 and `t34` (R21, R27: `obscuremarkwithdraw` owed, no spec), until T38-15 (both from PR #15 on `main` at T37's close; K2300).
   16. bundler `fleetbundles.test.mjs`:237 (agent-worker's 23 inputs pinned by name; agent-model's T38-9 renamed `src/subscription.mjs` to `src/signin.mjs`), from T38-10's merge until N802 (T39; bundler's L1 closed, P10) (AGENT-WORKER #14 J2, K2302).
7. **BOB's acts (no module job):** at the opening, rule 2's boundary (at L2's START), rule 3's choice, rule 4's packaging, every L1 requirement change, the questions to Bob ("For BOB" below). (N781; K1763, K2171) the terms register gains, as AT entries quoted verbatim, the paragraphs "Using the Claude Code name and logo" and "Claude Code remains governed by Anthropic's standard terms … regardless of the platform" (found under "Can customers offer Claude Code in their products?"), at the opening's register edit. T38's release is BOB's (K1501), decided at its close. (N795; K2259, K2273) done: mechanics §5.7 (3), §16, §11 changed on Bob's approval; T38's close is the first by a pull request merged with the GitHub merge tool, its proof (V6).
8. **N779 (Bob, K2248; BOB's details, P17):** every photo a published case carries travels as a copy without its metadata, made by `image-cover.coverAreas` with the photo's marks, or with no areas for an unmarked photo (its R1's empty `areas`, R2: nothing of the original but its pixels), so no L1 change; a photo `image-cover` cannot take (R3, e.g. HEIC) refuses the publication as DEC-183's B103 (b) does a marked one, naming it. The group keeps the original with its metadata and fingerprint.
9. **N793 (K231; BOB's):** `NO_SUCH_MEMBER` (C-64) has one site: membership (T38-4, with its split) provides the helper and the row; instance-setup drops its row; credentials, tasks, setup-page and control-plane call membership's helper in place of minting the code.

## Entries

Each line is one job (P8): every T38 entry for that module. Fields: module · (N-ids) what · rulings · `req:` the requirement change BOB writes before the layer starts · depends. Sizes (P6) measured on `tranche/T37` @ `5fd61bfb68` (own code in `paths`, tests and built bundles excluded, K1821).

### L1

- **T38-1 · bundler** (test only) · (N787) `bio-plane/test/system/fleetbundles.test.mjs`:232–235 re-pins agent-worker's bundle inputs from the committed manifest (23 since T37-17's `src/signin.mjs`), as BUNDLER #10 did, clearing red 5 (AGENT-WORKER #13 J2) · K2218 · req: none · depends —. **P6:** 3,298.
- **T38-2 · image-codecs** · (N782; rule 3) R1 states the header shape `readJpegHeader` answers (its Huffman tables `hts.dc[i]`, `hts.ac[i]`: `maxcode`, `valptr`, `mincode`, `symbols`, `fast`, `FAST`), with a test pinning it, so a change to it is a requirement change image-cover sees (IMAGE-COVER #1 J2) · K2179 · req: R1 amended, BOB's wording · depends —. **P6:** 2,981.

- **T38-17 · file-scanner** · (N791, its share; SETUP-PAGE #4 J1, J2) the template list: a generic template (`icap`) names `host`; `engine_family` and `handling` are stated as structured values; entries that need an address (`splunk-hec` among them) list `host` (and `region` where it applies) in their `config`, labelled · K2239 · req: its template list's R, BOB's wording · depends —.

**L1 merge order:** `modules.json` order: bundler → image-codecs → file-scanner. (image-cover takes no job: it reads R1 as written, and N779 needs none of it, rule 8.)

### L2

- **T38-3 · project-roster** (new, split from membership; K2270) · (N783) builds by copy what the boundary moves: membership's project working-group acts but the setup acts (C1′ of `plan/membership-split.md`: R37, R39–R42, R46, R48–R53, R63 and the roster halves of R59, R82, R96; `index.mjs` 977–1852 in part, their rows and the requests, votes, decisions and removals tables), reaching membership's tables only through its services and a stated read contract, its own requirements taking the moved ids (each retired in membership as "moved to <module> R<n>"), with the moved tests; no change to any requirement's meaning · K617, K624, K2186 · req: the new module's file, BOB's (the moved text) · depends —.
- **T38-4 · membership** · (N783) deletes its copy of what T38-3 moved and re-points its callers (and any module's `uses` the split touches); (K657, K1185) R83's `MODULE_ORDER` re-pinned to `modules.json` as the opening left it (the new module in L2), clearing red 4; (N793) the `NO_SUCH_MEMBER` helper and its row (rule 9), in whichever of the two modules the boundary puts member lookup · K617, K624, K657 · req: the moved ids retired, BOB's · depends T38-3. **P6:** 3,970 before the split; reported after it.
- **T38-5 · credentials** · (N785, its share; K2200) R35 answers a connected member (R43) with a `signin` account (agent-runner R2's `{kind: "signin", member}`, T37-16). (N708's remainder) R22's `subscription` kind retired, its replacement built in T37's L6. (N793) calls membership's `NO_SUCH_MEMBER` helper (rule 9) · K1819, K2134, K2200, K231 · req: R35, R22, BOB's wording · depends T38-4 (N793's helper). **P6:** 2,793.
- **T38-6 · promotion** · (T37's rule 6 item 2) stamps every row awaiting stamp at T37's close (rows T37's L3–L11 jobs added or re-worded, conformance's seven C-113 rows among them) and the rows T38's L1–L2 jobs add or re-code (T38-5's, the split's moved rows if any `where` moves), so `row-census.test.mjs` is green; the catalogue version moves, any pinned digest moves in its owner's job · K1542, K2231, K2232 · req: none (a stamp) · depends T38-4, T38-5. **P6:** 3,473 (its table grows by rows, not logic).

**L2 merge order (K2275):** membership (R113–R121, N793, R83; its copy still in place) → project-roster (copy) → membership again (delete)  → credentials → promotion last (it stamps the layer's rows). Then the regeneration order (`case-checker/program.mjs`, the plane bundle).

### L3

- **T38-7 · host-governor** (test only) · (N784) `test/m/host-governor/ops.test.mjs`'s helper sends `Authorization` (C-38.10) and its three `T.member` uses become a member's session (C-38.11; as K2182), clearing red 6's nine · K2189 · req: none · depends —. **P6:** 434.

- **T38-18 · file-safety** · (N789) R39's render wake (and its safe-copy part) is null while no renderer (`FILE_SCANNER`) is bound, as its scan wake is with no scanner, with a test of both arms, clearing scheduler `plane.test.mjs`:177; (N791, its share) R28 takes the template's `host`, and `handlingDigest` is computed from the stated handling · K2235, K2239 · req: R39, R28, BOB's wording · depends T38-17 (L1).

**L3 merge order:** `modules.json` order: host-governor → file-safety.

### L4

- **T38-8 · extraction** · (N786) `n26MigratedReading.moveCells` (`extraction/index.mjs`:213–224) moves a doc-table cell's sources but not its `paras` ordinals (office-readers R11): the job checks which holds and R66 states it (a migrated reading's `paras` renumbered with its paragraphs, or no reading carrying `paras` predates N26), with a test (RETRIEVAL #15 J2) · K2203 · req: R66, BOB's wording at the START · depends —. **P6:** 2,741.

### L5

- **T38-27 · bias** (test only) · (N783) `test/m/bias/debt.test.mjs`:103's setup makes an owner through project-roster's R3 (or membership R118 `participationWrite("ownerOn", …)`), not the moved `membership.projectOwnerAdd` · K2281 · req: none · depends T38-3, T38-4 (L2).

### L6

- **T38-9 · agent-model** · (N785, its share) R2 takes credentials' `signin` account (T38-5) and opens that member's named instance, not `newUniqueId` (`subscription.mjs`:106) · K2200 · req: R2 amended, BOB's wording · depends T38-5 (L2). **P6:** 766.
- **T38-28 · ai-runs** (test only) · (N708's remainder) `test/m/ai-runs/scheduler.test.mjs`:171–175 sets a `subscription` reference, now refused `UNKNOWN_ACCOUNT_KIND` (credentials R22, T38-5): drop that case or carry the `signin` account as agent-model's R2 takes it (T38-9) · K2283 · req: none · depends T38-5 (L2).
- **T38-10 · agent-worker** · (N785, its share) R6 carries the `signin` account to agent-model (T38-9), so a conversation runs on the member's own stored sign-in · K2200 · req: R6 amended, BOB's wording · depends T38-9. Adds no `src/` file, or its START names the bundler pin's red until T39 (bundler's L1 job is merged). **P6:** 2,767 (`dist/` bundle excluded).

**L6 merge order:** `modules.json` order: agent-model → agent-worker.

### L8

- **T38-19 · case-grammar** · (N779) R12 states that a published photo is carried as its metadata-free copy (rule 8), the original's fingerprint kept · K2248 · req: R12, BOB's wording · depends —.
- **T38-11 · case-carriage** · (N779) R1, R8, R11: every photo a published case carries is its copy without metadata (rule 8; R11's derivation with no areas for an unmarked photo); a photo `image-cover` cannot take refuses the publication, named; (N790) `MACHINE_CANNOT_MARK` re-coded `MACHINE_CANNOT_MARK_PHOTO`, with a test that the catalogue holds each code once; (N788 (2); DEC-183) `obscuremarkwithdraw` (`op=obscuremarkwithdraw`): a mark withdrawn by a later reasoned act of its maker or any member who may act on the case, recorded beside the mark, never erased; the copy re-derived from the marks that stand; R12's append-only rule amended; its refusals' words `words.json`'s `photo.*` · K2220; DEC-183 · req: R12 amended, a new R, BOB's wording · depends —. **P6:** 815.
- **T38-20 · public-read** · (N779) R23 serves a published photo only as its metadata-free copy · K2248 · req: R23, BOB's wording · depends T38-11.
- **T38-12 · case-disclosures** · (N779) states the copy as it states an obscured one; (N788 (1); DEC-183, superseding K2206's "never blocks") `photosOf`'s unchecked state is a gate: R6/R22 re-worded so a photo the case relies on that is unchecked blocks signing, named (`photo.refused.unchecked`); a withdrawn mark read as withdrawn (T38-11) · K2206, K2220; DEC-183 · req: R6, R22 amended, BOB's · depends T38-11. **P6:** 1,918.
- **T38-13 · case-authoring** · (N788 (1)) signing refused while any photo the case relies on is unchecked, naming it (R34's `blockers`; words `photo.refused.unchecked`) · K2220; DEC-183 · req: R34 amended, BOB's · depends T38-12. **P6:** 3,460; small.

- **T38-29 · publication** · (N788; DEC-183 (4)) C-122.6 `PHOTO_MARKS_CHANGED_SINCE` takes `words.json`'s `photo.refused.changed` (quoted verbatim, citing the key); a withdrawal since preparation (case-carriage R14) is such a change · K2291; DEC-183 · req: its C-122.6 row's words, BOB's · depends T38-11. Joined before L8's START (K1741).

**L8 merge order:** `modules.json` order: case-grammar → case-carriage → publication → public-read → case-disclosures → case-authoring.

### L10

- **T38-30 · scheduler** (test only) · (N789's other share) `test/m/scheduler/files.test.mjs`:288 asserts render's `RENDERER_ABSENT` tick with no scanner bound; file-safety R39 (T38-18) makes render want no wake then, as scan: the test asserts no `filerender` key and `nextAt` from R39 (FILE-SAFETY #3 J1) · K2293 · req: none · depends T38-18 (L3). Joined at L3 (K1741).

### L11

- **T38-14 · op-grades** · (N788) grades `obscuremarkwithdraw` (a member's act, as `obscuremark`) · DEC-183 · req: BOB's wording · depends —. **P6:** 2,233.
- **T38-15 · op-declarations** · (N788) declares `obscuremarkwithdraw` (`by` stamped, `machineClasses: []`; `OP_FAMILIES`), clearing `t37.test.mjs`:175 (R21: PR #15's registry owes the act); R34 re-read, any op without a text named in one QUESTION to UX-DESIGN · DEC-183 · req: R21 amended, a new R40, BOB's wording (K2300; not R27, the library) · depends T38-11 (L8). **P6:** 3,245.
- **T38-21 · tasks** · (N793) calls membership's `NO_SUCH_MEMBER` helper (rule 9) · K231 · req: BOB's wording · depends T38-4 (L2).
- ~~T38-22 · setup-page~~ dropped (K2300): setup-page mints no `NO_SUCH_MEMBER`; it only words the code in browser script (`setup-page/index.mjs`:1845).
- **T38-23 · instance-setup** · (N793) drops its `NO_SUCH_MEMBER` row and calls membership's helper · K231, K2249 · req: BOB's wording · depends T38-4.
- **T38-24 · admission** · (N792) `sourceOf` answers the store window's fallback (the instance's key) when `KNOCK_FINGERPRINT_KEY` is unbound, so `setpassword` and `login` count as one source · K2247 · req: its `sourceOf` R, BOB's wording · depends —.
- **T38-25 · answer-envelope** · (N783) `families.mjs`:126 lists project-roster's checks file after membership's, as the split leaves the rows · K2270 · req: none · depends T38-3 (L2).
- **T38-26 · plane** · (N783) `store.mjs`:509 and `stats.mjs`:25 reach the moved acts through project-roster; the plane's schema assembly takes project-roster's `schema.mjs` (its three tables), so a fresh store holds them as a migrated one does (FILE-SAFETY #3 J2, K2294) · K2270 · req: none · depends T38-3 (L2). Merges last in L11.
- **T38-16 · control-plane** · (N788; K2300) no route code: the plane spreads `caseCarriageOps` and the `by` stamp comes from op-declarations' `OP_FAMILIES`; R67 amended to name `obscuremarkwithdraw`, with a door test in `t37-door.test.mjs`'s pattern (`by` from the session); (N793) no share: control-plane mints no `NO_SUCH_MEMBER` · DEC-183, K231 · req: a route R, BOB's wording · depends T38-15. **P6:** 3,263 (K2255).

- **T38-31 · affordances** · (DEC-183; PR #15) `ACT_HELP` regenerated from PR #15's `mock-acts.js` (204 texts, the `setpassword` text among them), clearing `t36.test.mjs`:40 (R48) · K2300 · req: none · depends —. Joined at L6 (K1741).

**L11 merge order:** `modules.json` order (affordances among them, before op-declarations; T38-22 dropped), plane last (K2300).

## Left out of T38 (one hard reason each)

| entry | item | hard reason |
|---|---|---|
| N748 (N592) | the investigation engine's requirements (stages 1–2; K2075's plan construct) | Bob's (P17): D1–D4, D6–D8, D12–D14, D16–D24 open with him (K2064) |
| N751 | doctypes R35's out-of-sample measure (coordinator, review_due, revision_cycle) | a measurement: no fresh policies beyond the 74 read (K2079) |
| N794 | legacy-ui `statement-ack.test.mjs` (T37's red 22) | Bob's (K633, K1849): `legacy-ui` is touched only where he names it |
| N780 | agent-runner's and file-scanner's images published where Containers pull | a deployment: the next release cut (BOB's, K1501); `agent-runner-image.yml` lives on `dist/cut-0.81.0`, not on the tranche, so no job prepares it |
| N788 (part), N757 (part), N776 (part), N708 (sign-in surface, M-Q2), N669 (screens) | the Photos step's and the reminder's screens; "Change your password"; "Sign in with Claude"; the translation workspace's screens | a dependency not yet built: the new screens' shell (N672); Bob (K2147): no interim control |
| N757 (later) | an assistant proposing areas to obscure | Bob's (cost and keep-away, DEC-180) |
| N670 | DEC-127 (3), (6): "read in my language"; offering a translation to the library | a dependency not yet built: its surface is the new screens' (N672). The T37 reason (the order, after N669) ended with T37-30; BOB re-reads it at the opening |
| N551 (part), N572 | the wizards' ordering by self-description; "Show me where" | a dependency not yet built: the wizard runner |
| N559, N654, N672, N673, N683, N688 (part), N698 (part), N703 (part), N710, N714 (screens), N719 (part), N721 (part), N726 (part), N728 (screens), N732, N734, N735 (screens) | the new member screens, their shell and stylesheet, and every screen T37 named | a dependency not yet built: the new screens (N672) |
| N563, N579, N632, N641, N643 (part), N645 (part), N652 (part), N698 (part) | gold sets, prompt arms, registries, sources, fetch terms, the extract rung | a measurement (each as T37's table names it) |
| N703 (part) | Cloudflare's blocked-request counts | a deployment or measurement: a zone and read token per group |
| N647, N650 | the Lookup's policy proposals; case-import's shared sets | a dependency not yet built: investigate mode and the live account (N647); LAW L5's pack path (N650) |
| N666 | a group's own place's rules | Bob's (DEC-151): after the first public release |
| N747 | a promoting screen skips one marked `promoted` | Bob's: UX (`legacy-ui` frozen, K633, K1849) |

**Carried from T37 and earlier:** the measurement, real-group, Bob's UX, dependency, trigger and deployment rows keep their reasons unchanged; BOB re-reads them at the opening.

## Entries carried from `next.md` (N748, N751, N779–N795) and T37's table

Wholly in T38: N779, N781 (BOB's act), N782, N783, N784, N785 (with N708's remainder), N786, N787, N789, N790, N791, N792, N793, N795 (BOB's act). In part: N788 (its screens out). Left out: N748, N751, N780, N794, and T37's carried rows.

## P6 notes

Measured on `tranche/T37` @ `5fd61bfb68` (K1821). **membership** 3,970: split first (rule 2). Near about 4,000 among T38's modules: **promotion** 3,473 (rows only), **case-authoring** 3,460 (a blocker), **bundler** 3,298 (a test), **op-declarations** 3,245, **control-plane** 3,103 (one op each). Each job reports if it would pass about 4,000.

## Summary

**Jobs per layer:** L1 3, L2 4, L3 2, L4 1, L5 1, L6 3, L7 0, L8 6, L9 0, L10 1, L11 9 (T38-22 dropped, T38-31 joined). **Total 30** (K2291, K2293, K2300).

## For BOB

None at the opening: N779 is answered (K2248, rule 8); N748's D-questions stay with Bob in the investigation design lane (K2076). N795 (the close's refusals) is brought to him rendered as soon as it is drafted.

Settled, not Bob's: N782's shape owner (rule 3); N783's boundary (rule 2, at L2's START); N788's packaging (rule 4); N779's details (rule 8); N793's site (rule 9); N781's register edit; T38-16's route (checked at L11's START).
