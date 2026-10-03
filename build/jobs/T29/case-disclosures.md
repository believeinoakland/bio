# case-disclosures (T29)

**Status** · session_01KGf5pxXzTcDPj2Jf6NWLvV · depth 2 · WORKING · handled B2

## J1 · QUESTION

R23 says every service "never throws on a failed read of another module (that read states less, never more)". Every moved read already has a stated failure answer except R16's: `hunchDebt` calls `inquiry.basisFor` unguarded (case-authoring's #hunchDebt, body unchanged). If that read throws, "states less" would mean naming no hunch for that member, so the case passes R16 unchecked: fail open on the one bias that must be cleared.

My best reading, on which I proceed: R16's read fails closed and still never throws. A member whose basis cannot be read is answered as C-120.7 (UNCLEARED_HUNCH), carried in the same refusal under `undetermined: [{target, why}]` beside `hunches`, its detail saying the basis could not be read so whether it rests on a hunch is not known (R18: undetermined is stated, never filled). With every basis read whole, the answer is byte-for-byte today's. No new code or row.

The alternative is to keep #hunchDebt's body exactly as it is (a throw propagates out of publishCase's transaction, which also fails closed) and read R23 as covering only the reads that have a stated failure answer (R1, R2, R4, R13–R15). Say which you want; the rest of the job does not wait on it.

Other readings I have taken (no answer needed unless you object): `disclosureBlocks` takes the judgments as the caller holds them, `{resting, facts, selfAttested (R2's judgment or its byCapture), reached (R6's), flags (R14's), withheld, attributionOf, project, author, at}`, and answers `{captures, materials: {rows, attestations}, flags, group}`. `withheldOf` and `tensionsUndetermined` are instance methods (they were static). The `where`s name the public methods (tensionsUndetermined for C-120.3). The moved code's comments cite this module's ids.

## J2 · REPORT

Findings in other modules (none blocks my merge; each is the seam read's expected consequence or pre-existing).

1. control-plane (its R22, `CHECK_FAMILY_FILES`): with my `modules.json` paths in place, `test/m/control-plane/families.test.mjs` "R22 (K585 (1)): CHECK_FAMILIES is total" fails, because `src/case-disclosures/checks.mjs` exports CASE_DISCLOSURE_CHECKS and the list does not read it. Accepted red until control-plane's L11 entry adds `["src/case-disclosures/checks.mjs", …]` directly before case-authoring's (seam read §5; the N512 precedent). The C-120 codes are held twice (mine and case-authoring's copy) only until case-authoring's job deletes its copy (K529); `dec49Row` keeps reading case-authoring's identical rows until then. That file's other failing arm (R22, R43 … docket's C-129) fails the same with my paths removed: pre-existing, not mine.
2. promotion: the `where`s of C-120.1–C-120.7 now name `src/case-disclosures/index.mjs <method> > <region>` (C-120.3's method is `tensionsUndetermined`), joining C-120.8 and C-120.10–C-120.13 for the stamp (R22). Codes, checks and translations unchanged.
3. case-authoring (its job, after my merge): import from `../case-disclosures/index.mjs` — the renderers `tensionFrontmatterLines`, `tensionBodyLines`, `tensionSentence`, `captureBodyLines`, `carriesBodyLines`, `acceptedBodyLines`, and `FLAG_SENTENCE`, `FLAGS_SAY`, `SELF_ATTESTED_SENTENCE`, `NOT_SHOWN_WORDS`, `TENSIONS_DEPTH_STATED`, `TENSION_TEMPLATES`, `HIGHLIGHT_SENTENCE`, `tensionSide`, `CASE_DISCLOSURE_CHECKS` (`CEREMONY_HIGHLIGHT_SENTENCE` stays its own). Byte identity is pinned in my seam test against its pre-split renderers. Its R32 calls `tensionsRead` and, when its own read throws, `tensionsUndetermined`. `disclosureBlocks({resting, facts, selfAttested: selfJ, reached, flags: flagsJ, withheld, attributionOf, project: proj, author: who, at: when})` answers `{captures, materials, flags, group}` = today's `captureRows`, `materialBlocks`, `flagRows`, `group`. Note R16 now answers C-120.7 with `undetermined` when a basis read fails (K1346); with every read whole its answer is unchanged.
4. Test fixtures: `strength` reaches basis-versions lazily on the host, and its tables are not created unless someone migrates them; my fixture calls `strength.versions.migrate()` so contradiction's pairing works without my tests importing basis-versions (not in my Uses). No change asked.
