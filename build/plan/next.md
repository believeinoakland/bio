# Plan: next (T24)

**Status** · Entries for the tranche after T23, written as T23 runs (P18). Started at T23's opening by BOB #94, 2026-10-02 (K1113): the `next.md` entries T23 leaves out, with their full text, and every row T23 leaves out with its one hard reason (P19), re-checked when T24 is planned.

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

## Left out of T23, carried here (one hard reason each)

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
| N481 | DEC-112 published case in three forms | Bob's | on the design branch, not `main` |
| N488 | DEC-113 litigation hold of transcripts | Bob's | on PR #7, not `main` |
| N489 | DEC-114 "Matters" | Bob's | on PR #7, not `main` |
| N490 | DEC-115 action redesign | Bob's | on PR #7, not `main` |
| N491 | DEC-116 withdrawal, docket | Bob's | on PR #7, not `main`; home BOB's once landed |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| S1 | T23's L3–L11 new or changed rows stamped | one job per module (P8) | promotion's one job is L2; T24's L2 |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |
