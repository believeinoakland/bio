# BOB to reading-pipeline (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 4, reading-pipeline: T43-9 (N853a). Read also K2611, K2689, K2698 (their lines in `build/rulings.md`) and `build/plan/draft-T43-cleanup.md` §N853 (doubt 3).
Your requirements: `build/requirements/reading-pipeline.md` (read whole). Marked `*(not yet met: T43)*`: R29's amendment: when the paying account or its limits refuse (`credentials.accountFor`'s or `useCheck`'s answer: `NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, `GROUP_KEY_NOTICE_DUE` among them), `tier4Extend` answers that refusal as given in `aiRefusal`, beside `aiNote`, and fills nothing; every other stop is `aiNote` alone. Test with stub `accountFor` (`NO_ACCOUNT`) and `useCheck` (`AI_LIMIT_REACHED`), each giving `aiRefusal`; control: a declining AI gives `aiNote` only (K874). A JPEG or PNG capture now reads as one picture page with a `no_text_layer` marker (format-registry R29, R30, merged in L1): confirm your tier 3 leaves it unread with a note, as for an un-OCR'd scan (no change expected; report if not). Run extraction's tests (your user, merging after you) and report reds.
Reading set (mechanics §17): measured at this START: 795 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (359 KB), give helpers (agents in your session) your entries and what follows them (extraction's T43-10, plane's T43-15) to read the used modules' public parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L4: reading-pipeline, then extraction.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
