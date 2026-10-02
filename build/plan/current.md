# Plan T24

**Status** · OPEN · BOB #99 · session_018izoMzBnxzbQ3iFikEiEZw · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #6 session_01MJZEvGTGHSBLGCua1Zuqbw; record-core: RECORD-CORE #15 session_01GDBx64mMFCCwSytRPN41WV; credentials: CREDENTIALS #2 session_012kvJP8Do5Px8VoiLziW6ao; promotion: PROMOTION #25 session_01SwJ6zqWV8DAK53y4TjpSJf; membership: MEMBERSHIP #18 session_01TsMiP8QXjZwgw1wxMGupxs; host-governor: HOST-GOVERNOR #6 session_01WL11uZnbncFsdu25U9t5UL; provenance: PROVENANCE #13 session_01Tohc8CMuv7F1WY3Kqsr8dU; acquisition: ACQUISITION #6 session_01GsZuQ1S3yT7423mnGkM1qi; capture: CAPTURE #16 session_01Ev99X9H9nsfjJtVzKww84u; extraction: EXTRACTION #11 session_01AQZyjhWKrMBRZzo1DUJGjm; content: CONTENT #11 session_016WvxZ5ZiEqVj1hSGUB3iYd; entities: ENTITIES #8 session_01Q3vbEeshhzkF2FWhbGhGtN; inquiry-grammar: INQUIRY-GRAMMAR #4 session_01EiWceaitg5TS7zKu7vUTrg; basis-versions: BASIS-VERSIONS #10 session_01NkLoN8Ah4BKszfLxPWghva; strength: STRENGTH #9 session_01JLVcCP57HYy8VAoyoUW9LD; run-rules: RUN-RULES #5 session_01XiDMY8V5iF59Evun86B5pi; citation: CITATION #7 session_01TasX3GZYCSBrEwigadjHZN; capture-requests: CAPTURE-REQUESTS #8 session_01Pnb3SM27ciwpMBZEp624EU; intent: INTENT #11 session_018EJne5wLRcdGmdoAicVMZ6; publication: PUBLICATION #14 session_011EAWfk12CZpKfp2bDZSvBW; public-read: PUBLIC-READ #7 session_01RQeoV3bSk9w1uyvNraCojZ; project-stage: PROJECT-STAGE #4 session_01L8ir9KbcAPMN6ngfi6mBKg; network-notices: NETWORK-NOTICES #2 session_01B5YxsxHcGCqJ2SrKiS63S6; ratification: RATIFICATION #16 session_01FzkbVm8E9gu1PeRiKPLsQE; local-facts: LOCAL-FACTS #2 session_01ATMXx59tM5rnPagFzWPRyT; standards: STANDARDS #6 session_017ZU53EPj6iAyW7n2FBQQTi

**Opened** 2026-10-02 ~12:31 UTC by BOB #98 from `main` @ f193c1ac3b (T23 closed, K1178), from `draft-T24.md` and T23's `next.md` (K1180). **Bob's weekly meter** · asked at the opening; 61% at T23's close.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T24 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares wait on the UX stream: N487, the left-out table's legacy-ui rows, three N508-kind notes. |

No other module is marked `legacy`; no extraction is open.

## Folds at the opening (BOB, on this branch, K1180)

1. **N506**: `requirements/link-sweep.md` (R1–R12 = monitoring R53–R64, retired there, no change of meaning); monitoring provides the seam (the sweep host and the registration of the sweep's grammar arm and slate, R65 onward); `modules.json` gains `link-sweep` after monitoring in layer 10; scheduler, queue-producers, plane gain the edge; every reference re-pointed; `layers.md` lists it.
2. **N503, N504, N505, N507, N509**: record-core R75 `recordOpaqueId`, provenance R57 `instanceKeyBound`, credentials R21 `status_at` (R8 answers it), network-notices R1, R4, R14, R17, R21, R22.
3. **N489** (DEC-114): action-plans R36, queue-producers R28 ("matter" in member-facing words). **N490** (DEC-115): action-plans R37 `optionStartPreview`, op-declarations R11, the action-design HANDOFF line.
4. **N502/N508's scan**: `plan/t24-stale-notes.md`; each START names its lines.

Not folded: **N481, N488, N491** (DEC-112, DEC-113, DEC-116): Bob's, K1134's Q1–Q6 unanswered (asked again at the opening). N489 and N490 depend on none of the six, so they are carried (P19).

## Rules at the opening

T23's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted). A job re-scans its own module for the N502/N508 kind and re-words what it finds (N469's rule). A row a T24 job adds or changes after L2's stamp is `awaiting stamp` until T25's L2 (S2) and listed in its COMPLETE.

**Accepted reds, by name, at the opening:**
1. `row-census.test.mjs`: T23's L3–L11 rows `awaiting stamp` (T23's red 7), until promotion's L2 merge (S1).
2. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.
3. Coverage: each id folded at the opening (record-core R75, provenance R57, credentials R21, action-plans R36, R37, queue-producers R28, op-declarations R11, link-sweep R1–R12, monitoring's seam ids), until its module's merge.
4. Format: `link-sweep`'s `paths` and `tests` directories do not exist until link-sweep's L10 merge.
5. Rows T24's L3–L11 jobs add or change: `awaiting stamp` until T25's L2 (S2).
6. Totality of affordances and op-declarations over `optionstartpreview`, from action-plans' L9 merge until their L11 merges.
7. The sweep's composition (plane's `sweeps` route, scheduler's `gathering-sweep`), from monitoring's L10 merge until link-sweep's and scheduler's (L10) and plane's and control-plane's (L11).
8. `test/m/scheduler/consumers.test.mjs`:161: after the only act is sealed, network-notices' `sealWake` is null (N507, R14; scheduler R15), so no alarm follows; from network-notices' L8 merge until scheduler's L10 merge (K1200).
9. `test/m/plane/notices.test.mjs`:39: network-notices holds no mint seed (N503, R4, record-core R75); from network-notices' L8 merge until plane's L11 merge (K1200).

## Roster (by layer; 42 jobs)

**L1** · record-grammar: N502.
**L2** (merge order: record-core, credentials, membership, then promotion) · record-core: N503 (R75). · credentials: N505 (R21, R8), N508. · membership: R83, `MODULE_ORDER` equal to `modules.json` after the opening's N506 fold (added in L2, K1185). · promotion: S1, the stamp 1.53.0 → 1.54.0 over T23's L3–L11 rows (each record's `awaiting stamp`, `t24-stale-notes.md` "S1's"), `ROW_CENSUS` re-pinned, its fixture; `gate.mjs`:557 re-worded.
**L3** · host-governor: N508. · provenance: N504 (R57). · acquisition: N510, N502, S1's note. · capture: N508.
**L4** · extraction: N508. · content: N502.
**L5** · entities: N502.
**L6** · inquiry-grammar, basis-versions, strength, run-rules: N502. · citation: N508. · capture-requests: N502, S1's note.
**L7** · intent: N502.
**L8** · publication: N501. · public-read: N508 (test fixture), S1's notes. · project-stage: N508. · network-notices: N503–N505's consumers (R4, R1, R21), N507 (R14, R17), N509 (R1, R22), S1's note. · ratification: N502 (test).
**L9** · local-facts, standards, action-grammar, filing-templates: N502. · filings: N502, N508. · actions, action-clocks: N508. · action-plans: N489 (R36), N490 (R37), N502.
**L10** (merge order: monitoring, link-sweep, scheduler) · monitoring: N506's removal side and the seam services, its test world's `refs` and `inquiry_bundle_facts` (N506's tail), N502, S1's note. · link-sweep: N506, the new module from the moved files and tests. · scheduler: N506, `gathering-sweep` through link-sweep.
**L11** · affordances: `optionstartpreview` in its totality (R7's rule). · queue-producers: N489 (R28), `sweepConditions` through link-sweep. · queue: N508. · op-declarations: R11, `sweeps` declared through link-sweep. · admission: N502. · control-plane: N502, `sweeps` and `optionstartpreview` routed. · plane: link-sweep composed.


## Entries

- N481 · 2026-10-01 · **publication**, **case-grammar**, **case-authoring**, **public-read**, and a case-file import home (the UX stream's U21, DEC-112, Bob's question 30): a published case in three forms (the page's first line per finding naming its role and the project's bar; the complete edition in every case file; the case-file format as an open specification with a standalone checker; the method version inside the signed case; publication refused while a relied-on finding rests on material that cannot travel whole; off-the-record attestations; import into a new read-only project with recreation, acceptance gated on it). **Hard reason:** DEC-112 is on the design session's branch, not `main`; folded as requirements once it lands (manifest "Parallel work"), then placed by BOB (publication's split, K617, and DEC-111's new module bear on its home). **Drafted** (K1134): `plan/draft-T24-dec112.md`; folds once PR #7 is on `main` and Bob answers K1134's questions.
- N487 · 2026-10-02 · **legacy-ui** (K1030; `plan/t22-dec88-callers.md`): the UI sends DEC-88 acts without their new reason: `civicos-ui/app.html` `entityDraft` (~:17128), `progDefineDraft` (~:17767), `statementack` (:25792, :25802), and its tests `progression-revision.test.mjs`:208, `queue-recipients.test.mjs`:160, `statement-ack.test.mjs`:277, :342, `check-mock-envelope.mjs`:206. **Hard reason:** Bob's: UX (K633; manifest "Parallel work"). Those UI tests are red from each provider's merge, accepted by name (K1030).
- N488 · 2026-10-02 · **actions**, **control-plane**, the assistant-transcript home (DEC-113, U22): a litigation hold stops both scheduled deletions of stored assistant transcripts on every member's device for the action's project and the projects the statement names; a device checks before deleting and deletes nothing if it cannot check; the heavier release (its form states what will be deleted, administrators and placer told once); a held-project strip for members who can see it; the control plane's wipe of a real record refused while any hold is in place (supersedes actions R52's "Nothing here suspends a purge"). **Hard reason:** DEC-113 is on the design session's PR #7, not `main` (manifest "Parallel work"). **Drafted** (K1134): `plan/draft-T24-dec113-115.md §1`; folds once PR #7 is on `main` and Bob answers K1134's questions.
- N489 · 2026-10-02 · **action-plans**, **queue-producers**, the glossary (DEC-114, U23): members see "Matters"/"matter" for what an action plan addresses; the internal term stays "subject". **Hard reason:** on PR #7, not `main`. **Drafted** (K1134): `plan/draft-T24-dec113-115.md §2`; folds once PR #7 is on `main` and Bob answers K1134's questions.
- N490 · 2026-10-02 · the action redesign (DEC-115, U24): `build/plan/action-design/start-and-send.html` and `surfaces.html`'s tier 2 and tier 3 panels bind content, step order and wording; the HANDOFF's approval line extended to them (BOB's, in `build/`). **Hard reason:** on PR #7, not `main`. **Drafted** (K1134): `plan/draft-T24-dec113-115.md §3`; folds once PR #7 is on `main` and Bob answers K1134's questions.
- N491 · 2026-10-02 · **publication**, **reevaluation**, **queue-producers**, a docket home (DEC-116 with DEC-100, U25; answers N470): withdrawal of a ratified edition (signed docket entry, published reason, stamp, never lifted, re-evaluation notices: reevaluation R16's missing trigger); the docket and its three shelves, the manager's core To-dos, the outside-response path, the private-name receipt, standing grants, the manager's signing step, the per-case feed. **Hard reason:** on PR #7, not `main`; its home is BOB's to place once it lands (publication's size, K1024). **Drafted** (K1134): `plan/draft-T24-dec116.md`; folds once PR #7 is on `main` and Bob answers K1134's questions.
- N501 · 2026-10-02 · **publication** (K1119): retire the constant re-exports `queue-producers/index.mjs`:41 imported from publication, once queue-producers re-points to corpus-export (T23 L11). **Hard reason:** publication's one T23 job (L8) precedes queue-producers' (L11) (P8, P10).
- N502 · 2026-10-02 · the modules whose source comments still say a catalogue row is `awaiting stamp` from tranches before T23 (PROMOTION #24's record, `jobs/T23/promotion.md`, lists them): re-word to the stamp that took them (N469's rule). **Hard reason:** those modules' T23 layers are closed or their jobs carry other entries (P8); wording only.
- N503 · 2026-10-02 · **record-core** (K1151; NETWORK-NOTICES #1 J2 (1)): a service recording a chosen opaque id in `minted_ids` inside the caller's transaction, refusing one already spent (`recordOpaqueId(id)`, or `mintOpaqueId` taking a chosen id); then **network-notices** R4 records its notice id through it instead of the boot-time mint seed. **Hard reason:** record-core's T23 job (L2) is closed (P8, P10).
- N504 · 2026-10-02 · **provenance** (K1151; NETWORK-NOTICES #1 J2 (2)): `instanceKeyBound()`, answering whether an instance key is bound without signing; then **network-notices** R1 drops its probe signature, which can set `receipt_keys.first_used` before the key's first real statement. **Hard reason:** provenance's T23 job (L3) is closed (P8, P10).
- N505 · 2026-10-02 · **credentials** (K1151; NETWORK-NOTICES #1 J2 (3)): `signers` records when a key's status changed (`status_at`) and R8's `signerList` answers it; then **network-notices** R21 gives a revoked key's own date, not the date this copy first saw it. **Hard reason:** credentials has no T23 job and its layer is closed (P10).
- N506 · 2026-10-02 · **monitoring** → new module **link-sweep** (K617, K1159): split the link sweep out along the seam MONITORING #12 builds in T23: `bio-plane/src/monitoring/sweep.mjs` and `sweep-match.mjs` with their tests move to `bio-plane/src/link-sweep/`; monitoring R53–R64 move to `requirements/link-sweep.md` with no change of meaning; `link-sweep` placed after monitoring in layer 10, using it where the moved code calls `Monitoring`; scheduler's `gathering-sweep` consumer and every other reader of the moved services re-pointed. **Hard reason:** monitoring's one T23 job is running (P8); splitting mid-layer would move a provided service scheduler is building on in the same layer (P10). First in T24's L10. With it, monitoring's test world (`test/m/monitoring/fixture.mjs`) creates the tables its other wakes' promotion steps read (`refs`, `inquiry_bundle_facts`), so a promotion after a wake is asked does not fail there (SCHEDULER #25's record; test-only, K1164).
- N507 · 2026-10-02 · **network-notices** (K1161; SCHEDULER #25 J2 (1)): `sealWake` answers null when the instance has nothing to seal (no project with sealable acts, R14), and `attestWake` null when no notice is open and no opening is kept (R17), so an idle instance holds no timer (scheduler's Purpose, R15). State it in R14/R15 and test it. **Hard reason:** network-notices' one T23 job (L8) is closed (P8, P10).
- N508 · 2026-10-02 · **credentials**, **host-governor**, **extraction**, **citation**, **actions** (K1167; TASKS #6's record): their op-map notes still say the ops are "entries of the legacy store's op map (its dispatcher spreads them in)" (`credentials/index.mjs`:669, `host-governor/index.mjs`:266, `extraction/index.mjs`:1474, `citation/index.mjs`:736, `actions/index.mjs`:2368); the legacy store is retired and control-plane's routes spread them: re-word (N469's rule), re-scanning each module for the same kind. **Hard reason:** those modules have no T23 job, their layers closed (P8, P10); wording only.
- N509 · 2026-10-02 · **network-notices** (K1170; CONTROL-PLANE #14 J1): `#callerRefusal` (`index.mjs`:218) answers `NO_SUCH_PROJECT` to a caller whose sight of a discoverable project is `existence`; REC-149's ruling (a) (`BIO_Membership_Architecture_v2.md`:1235) answers an act on such a project positionally, C-70.1. Answer C-70.1 there for `noticeprepare` and `noticepost` (and `notices`, a read naming the project's own id), state it in R1/R22, test it. **Hard reason:** network-notices' one T23 job (L8) is closed (P8, P10).
- N510 · 2026-10-02 · **acquisition** (K1178; ACQUISITION #5's deferral, `jobs/T23/acquisition.md`:25): an empty 200 memento met during a capture ends the archive arm with `NO_USABLE_CAPTURE` instead of trying an older candidate; emptiness is known only after the body is streamed, so trying another needs `acquire`'s single fetch restructured. Measured empties so far were redirects (skipped before any body is read). **Hard reason:** acquisition's one T23 job is closed (P8); the restructure is the job's own.
- P1 · 2026-10-02 · **the process** (K1177; Bob's direction): research every approval a session has asked of Bob (§16), why the session reached that state, and what process change stops each cause recurring; bring the recommendation to Bob (a process change, P3, P16). Findings brought to Bob by BOB #97 ("Why Sessions Ask Bob"). **Done** (K1183): the revision is on the process repository's `main` (c84579d).

## Left out of T24 (one hard reason each; carried to `next.md`)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | 61.3 MB bound |
| B3 | N34 (pdf-worker) | deployment | JPX bound; JBIG2 fixture encoder; 4,277 lines (P6) |
| B11, C9 | N461 release share; N471's release copies | deployment | the next signed release, Bob's act |
| B16 | N473 (`filing_templates` table) | deployment | migration run at every instance |
| C1 | office-readers R28/R29 retired | deployment | migrations at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | newgroup installer deployed, N336 | deployment | a signed release |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement | a measured recommender run (K488) |
| C8 | first profile's facts without a source | measurement | K925, K934, K941 |
| B4, B5 | N144, N232 | Bob's (UX) | K899 (2) |
| A54 | skills R10 | Bob's | N144 |
| B13 | N470 | Bob's | K943; DEC-116 answers it, off `main` (N491) |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A | Bob's | K1019: "nothing new" |
| H13 | DEC-105 audience guidance | Bob's | waits for its trigger |
| C5 | `PLN-` affordances, plan page, joint action | Bob's | K608 (4), K600 (c) |
| H5 | DEC-100 | Bob's | awaits Bob; DEC-116 (N491) off `main` |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| N481 | DEC-112 published case in three forms | Bob's | on `main` (PR #7); K1134 Q2, Q3, Q6 unanswered |
| N488 | DEC-113 litigation hold of transcripts | Bob's | on `main` (PR #7); K1134 Q4, Q5 unanswered |
| N491 | DEC-116 withdrawal, docket | Bob's | on `main` (PR #7); K1134 Q1 unanswered (its home) |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |
