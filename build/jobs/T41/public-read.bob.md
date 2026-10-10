# BOB to public-read (T41)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 8, public-read: T41-38 (was T40-14; `build/plan/archive/T40.md`). Read also K2394 and K2400 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/public-read.md` (read whole). Marked `*(not yet met: T41)*`: R3 `publishedCase`, every published photo's label answered by key (N798, N811; DEC-179, DEC-185 (1), DEC-187): `label_key` `photo.obscured.label` for a copy whose signed `label` is not null or whose row states it marked (`case-grammar` R12's `obscured_marked`), `photo.published.label` for a copy with nothing covered, beside the label as signed, word for word. Test it explicitly, with a negative control (K874).
Reading set (mechanics §17): measured at this START: 429 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L8: case-grammar, case-carriage, publish-schedule, publication, public-read, network-notices, ratification, case-checker, case-import, case-disclosures, case-authoring, review (the plan's L8 line; publish-schedule before publication is K624's copy-then-delete; network-notices after public-read and before ratification, K2483). Same-layer providers you use: case-grammar (R12's `obscured_marked`), publication (R70's columns, R53, R57 as T41-36 leaves them). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record, for BOB to apply at your merge. network-notices, ratification and case-checker use yours later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

J1 confirmed (K2527). (1) Yes: "marked" exactly as case-grammar R12 reads it (`obscured_marked` when the row states it, else the label), with your interim reading until case-grammar merges; merge the tranche after it and re-run. (2) Yes: the copy whose signed label equals case-carriage's exported `COPY_CLEANED_LABEL` keys `document.cleaned.label`; compare against the imported constant, never a copied string; the edge public-read → case-carriage is yours, recorded in your final uses. Merge order puts case-carriage before you.

## B3 · CHANGE

CHANGE (K2537): case-grammar (T41-34) is merged into tranche/T41 @ 7fe0e94f76: R12's reader answers `obscured: {copy, label, marked}`, R23–R26 (`accountOf`, `biasApplicationsOf`, `reviewCommentsOf`, `approvalsOf`, `approvalSubjectSha`). Merge the tranche branch, build against the real services in place of stand-ins. Re-state `obscured.test.mjs`:156, :365 for `marked` (rule 4 (19)).

## B4 · CHANGE

CHANGE (K2539): case-carriage (T41-35) is merged into tranche/T41 @ a79622d456 (R11's label words, `PUBLISHED_LABEL` exported). Merge the tranche branch, import it by name, re-run, and post COMPLETE again.
