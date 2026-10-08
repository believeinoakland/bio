# Plan T38

**Status** · DRAFT (P18), prepared by a helper for BOB #140, 2026-10-08; not binding until BOB opens T38.

**Sources** · `next.md` N748, N751, N779–N788 (every open entry); `current.md` (T37): its "Left out of T37" table, its rules at the opening (rule 6's accepted reds still open: 2, 3, 20, 22; the host-governor nine of red 17), "P6 notes"; `modules.json` (order, layers); `rulings-active.md` (K617, K624, K657, K1821); rulings K2171, K2179, K2186, K2189, K2200, K2203, K2218, K2220, K2226–K2232; PR #15 (UX-DESIGN's MERGE U132: DEC-183, `words.json`'s `photo.*`), on `main` at T37's close. PROCESS-MECHANICS §5.2, §12.2; PROCESS-DESIGN P4, P6, P8, P10, P17, P18, P19.

**At T38's opening (assumed):** every T37 entry is merged and T37 closed; T38 opens from `tranche/T37`'s tip; PR #15 (DEC-183) is on `main` at T37's close, so "a DEC folds only once on `main`" is no hard reason in T38 and N788 enters. T37-16 and T37-17 (N708's sign-in, L6) are built, so N708's remainder (credentials R22's `subscription` retirement) enters with N785. Still hard reasons: the new screens' shell (N672); every deployment or measurement no T38 entry takes; Bob's open questions (N748, N779).

## Legacy census (§5.2 (2))

`modules.json` marks exactly one module `legacy: true`.

| legacy module (`modules.json`) | in T38 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`; `app.html` 26,551 lines, its `.mjs`/`.js` 13,444 lines incl. tests, as T37 measured) | stays | No T38 entry retires or touches it. Hard reasons: Bob's (UX), K633 (it stays until the new interface replaces it); and a dependency not yet built: the new member screens and their shell (N672, N559). Its two rule-4 reds (T37's 21, 22) close with T37-33, or red 22's earlier cause (M0-107) goes to `next.md` at T37's L11 close. |

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
7. **BOB's acts (no module job):** at the opening, rule 2's boundary (at L2's START), rule 3's choice, rule 4's packaging, every L1 requirement change, the questions to Bob ("For BOB" below). (N781; K1763, K2171) the terms register gains, as AT entries quoted verbatim, the paragraphs "Using the Claude Code name and logo" and "Claude Code remains governed by Anthropic's standard terms … regardless of the platform" (found under "Can customers offer Claude Code in their products?"), at the opening's register edit. T38's release is BOB's (K1501), decided at its close.

## Entries

Each line is one job (P8): every T38 entry for that module. Fields: module · (N-ids) what · rulings · `req:` the requirement change BOB writes before the layer starts · depends. Sizes (P6) measured on `tranche/T37` @ `5fd61bfb68` (own code in `paths`, tests and built bundles excluded, K1821).

### L1

- **T38-1 · bundler** (test only) · (N787) `bio-plane/test/system/fleetbundles.test.mjs`:232–235 re-pins agent-worker's bundle inputs from the committed manifest (23 since T37-17's `src/signin.mjs`), as BUNDLER #10 did, clearing red 5 (AGENT-WORKER #13 J2) · K2218 · req: none · depends —. **P6:** 3,298.
- **T38-2 · image-codecs** · (N782; rule 3) R1 states the header shape `readJpegHeader` answers (its Huffman tables `hts.dc[i]`, `hts.ac[i]`: `maxcode`, `valptr`, `mincode`, `symbols`, `fast`, `FAST`), with a test pinning it, so a change to it is a requirement change image-cover sees (IMAGE-COVER #1 J2) · K2179 · req: R1 amended, BOB's wording · depends —. **P6:** 2,981.

**L1 merge order:** `modules.json` order: bundler → image-codecs. (image-cover takes no job: it reads R1 as written; its START check, if any, is BOB's.)

### L2

- **T38-3 · <new module> (split from membership; name BOB's)** · (N783) builds by copy the functions BOB's boundary moves (BOB fixes the boundary at the START), its own requirements taking the moved ids (each retired in membership as "moved to <module> R<n>"), with the moved tests; no change to any requirement's meaning · K617, K624, K2186 · req: the new module's file, BOB's (the moved text) · depends —.
- **T38-4 · membership** · (N783) deletes its copy of what T38-3 moved and re-points its callers (and any module's `uses` the split touches); (K657, K1185) R83's `MODULE_ORDER` re-pinned to `modules.json` as the opening left it (the new module in L2), clearing red 4 · K617, K624, K657 · req: the moved ids retired, BOB's · depends T38-3. **P6:** 3,970 before the split; reported after it.
- **T38-5 · credentials** · (N785, its share; K2200) R35 answers a connected member (R43) with a `signin` account (agent-runner R2's `{kind: "signin", member}`, T37-16). (N708's remainder) R22's `subscription` kind retired, its replacement built in T37's L6 · K1819, K2134, K2200 · req: R35, R22, BOB's wording · depends —. **P6:** 2,793.
- **T38-6 · promotion** · (T37's rule 6 item 2) stamps every row awaiting stamp at T37's close (rows T37's L3–L11 jobs added or re-worded, conformance's seven C-113 rows among them) and the rows T38's L1–L2 jobs add or re-code (T38-5's, the split's moved rows if any `where` moves), so `row-census.test.mjs` is green; the catalogue version moves, any pinned digest moves in its owner's job · K1542, K2231, K2232 · req: none (a stamp) · depends T38-4, T38-5. **P6:** 3,473 (its table grows by rows, not logic).

**L2 merge order:** <new module> (copy) → membership (delete, R83) → credentials → promotion last (it stamps the layer's rows). Then the regeneration order (`case-checker/program.mjs`, the plane bundle).

### L3

- **T38-7 · host-governor** (test only) · (N784) `test/m/host-governor/ops.test.mjs`'s helper sends `Authorization` (C-38.10) and its three `T.member` uses become a member's session (C-38.11; as K2182), clearing red 6's nine · K2189 · req: none · depends —. **P6:** 434.

### L4

- **T38-8 · extraction** · (N786) `n26MigratedReading.moveCells` (`extraction/index.mjs`:213–224) moves a doc-table cell's sources but not its `paras` ordinals (office-readers R11): the job checks which holds and R66 states it (a migrated reading's `paras` renumbered with its paragraphs, or no reading carrying `paras` predates N26), with a test (RETRIEVAL #15 J2) · K2203 · req: R66, BOB's wording at the START · depends —. **P6:** 2,741.

### L6

- **T38-9 · agent-model** · (N785, its share) R2 takes credentials' `signin` account (T38-5) and opens that member's named instance, not `newUniqueId` (`subscription.mjs`:106) · K2200 · req: R2 amended, BOB's wording · depends T38-5 (L2). **P6:** 766.
- **T38-10 · agent-worker** · (N785, its share) R6 carries the `signin` account to agent-model (T38-9), so a conversation runs on the member's own stored sign-in · K2200 · req: R6 amended, BOB's wording · depends T38-9. Adds no `src/` file, or its START names the bundler pin's red until T39 (bundler's L1 job is merged). **P6:** 2,767 (`dist/` bundle excluded).

**L6 merge order:** `modules.json` order: agent-model → agent-worker.

### L8

- **T38-11 · case-carriage** · (N788 (2); DEC-183) `obscuremarkwithdraw` (`op=obscuremarkwithdraw`): a mark withdrawn by a later reasoned act of its maker or any member who may act on the case, recorded beside the mark, never erased; the copy re-derived from the marks that stand; R12's append-only rule amended; its refusals' words `words.json`'s `photo.*` · K2220; DEC-183 · req: R12 amended, a new R, BOB's wording · depends —. **P6:** 815.
- **T38-12 · case-disclosures** · (N788 (1); DEC-183, superseding K2206's "never blocks") `photosOf`'s unchecked state is a gate: R6/R22 re-worded so a photo the case relies on that is unchecked blocks signing, named (`photo.refused.unchecked`); a withdrawn mark read as withdrawn (T38-11) · K2206, K2220; DEC-183 · req: R6, R22 amended, BOB's · depends T38-11. **P6:** 1,918.
- **T38-13 · case-authoring** · (N788 (1)) signing refused while any photo the case relies on is unchecked, naming it (R34's `blockers`; words `photo.refused.unchecked`) · K2220; DEC-183 · req: R34 amended, BOB's · depends T38-12. **P6:** 3,460; small.

**L8 merge order:** `modules.json` order: case-carriage → case-disclosures → case-authoring.

### L11

- **T38-14 · op-grades** · (N788) grades `obscuremarkwithdraw` (a member's act, as `obscuremark`) · DEC-183 · req: BOB's wording · depends —. **P6:** 2,233.
- **T38-15 · op-declarations** · (N788) declares `obscuremarkwithdraw` (`by` stamped, `machineClasses: []`); the `setpassword` text as the screens already have it (DEC-183); R34 re-read, any op without a text named in one QUESTION to UX-DESIGN · DEC-183 · req: R27, a new R, BOB's wording · depends T38-11 (L8). **P6:** 3,245.
- **T38-16 · control-plane** · (N788) routes `obscuremarkwithdraw` to case-carriage, `by` from the session · DEC-183 · req: a route R, BOB's wording · depends T38-15. **P6:** 3,103.

**L11 merge order:** `modules.json` order: op-grades → op-declarations → control-plane.

## Left out of T38 (one hard reason each)

| entry | item | hard reason |
|---|---|---|
| N748 (N592) | the investigation engine's requirements (stages 1–2; K2075's plan construct) | Bob's (P17): D1–D4, D6–D8, D12–D14, D16–D24 open with him (K2064) |
| N751 | doctypes R35's out-of-sample measure (coordinator, review_due, revision_cycle) | a measurement: no fresh policies beyond the 74 read (K2079) |
| N779 | photo metadata on a photo a published case carries unmarked | Bob's (a private person's exposure; For BOB 1) |
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

## Entries carried from `next.md` (N748, N751, N779–N788) and T37's table

Wholly in T38: N781 (BOB's act), N782, N783, N784, N785 (with N708's remainder), N786, N787. In part: N788 (its screens out). Left out: N748, N751, N779, N780, and T37's carried rows.

## P6 notes

Measured on `tranche/T37` @ `5fd61bfb68` (K1821). **membership** 3,970: split first (rule 2). Near about 4,000 among T38's modules: **promotion** 3,473 (rows only), **case-authoring** 3,460 (a blocker), **bundler** 3,298 (a test), **op-declarations** 3,245, **control-plane** 3,103 (one op each). Each job reports if it would pass about 4,000.

## Summary

**Jobs per layer:** L1 2, L2 4, L3 1, L4 1, L5 0, L6 2, L7 0, L8 3, L9 0, L10 0, L11 3. **Total 16.**

## For BOB (Bob's questions; brought rendered at the opening)

1. **Photo metadata in published photos** (N779), unchanged from T37's For BOB 2 unless Bob has answered: (A) as today; (B) every published photo travels as a metadata-free copy, the group holding the original; (C) the Photos step shows what the metadata reveals and the member chooses. Recommendation: B. If answered before L8's START, its entry joins case-carriage's T38-11.
2. **N748:** unchanged: D1–D4, D6–D8, D12–D14, D16–D24 and K2075's plan construct open with Bob.

Settled, not Bob's: N782's shape owner (rule 3); N783's boundary (rule 2, at L2's START); N788's packaging (rule 4); N781's register edit.

**BOB #140's review notes (to settle at the opening):** T38-16's route: since K2226 `obscuremark`/`photomarks` reach case-carriage through its own ops map routed by the plane (R18), so `obscuremarkwithdraw` joins `caseCarriageOps` (T38-11) and control-plane may need no entry; check at the opening. N788's possible shares in affordances (`ACT_HELP`), wizard-scripts (the ceremony script) and answer-envelope (none: C-141 is read whole since T37-50) are checked against PR #15's text on `main`. N670's reason re-read at the opening.
- (added by BOB #140, K2235) N789 · file-safety (L3): R39's render wake null while no renderer is bound; clears scheduler `plane.test.mjs`:177 (red 23). Number it at the opening.
- (added by BOB #140, K2238) N790 · case-carriage (L8): re-code `MACHINE_CANNOT_MARK` (C-141.1, shared with sources' C-121.7); joins T38-11.
- (added by BOB #140, K2239) N791 · file-scanner (L1), file-safety (L3): a generic template's list names host; structured values; the digest from the stated handling.
- (BOB #140, K2246) N779 is closed (Bob: A, as today): drop it from the left-out table at the opening.
- (added by BOB #140, K2247) N792 · admission (L11), credentials (L2): one sign-in source for setpassword and login when KNOCK_FINGERPRINT_KEY is unbound.
- (BOB #140, K2248, replacing the K2246 line above) N779 enters T38 (Bob: the group keeps the metadata, published photos do not): a metadata-free copy for every published photo; shares in image-cover/image-codecs (L1), case-grammar, case-carriage, case-disclosures, public-read (L8), with T38-11–13.
