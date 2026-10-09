# retrieval (T41)

**Status** · session_0118UenKBjeUnhTTyRDVfooR · depth 2 · COMPLETE · handled B1

## Completion (RETRIEVAL #16)

**Reading set** (mechanics §17, K2304): measured over 300 KB (requirements 54 KB, own code 225 KB, own tests 382 KB, plus the used modules' public parts). Read whole myself: `build/requirements/retrieval.md`; layer 5's row of `build/layers.md`; the plan's entry T41-12a, rule 4 (11)'s list (retrieval: `selections.test.mjs:326`), K2442 and K2448; membership's Purpose and the services my Uses names for R17, R21, R60: `viewerPredicate` (its R43, as D54 amends it), `hiddenBundles` (R88), `inSight` (R80); `selections.test.mjs` and `fixture.mjs`. One worker read the rest whole (the eight source files and the twenty other test files) and wrote a ~9 KB summary citing file:line. Its findings: no code in `src/retrieval/` treats an administrator or the founder as see-all. Every gate is membership's `viewerPredicate`, `hiddenBundles` or `inSight`, read live (`index.mjs`:499–509 `sight`, :987–1036 `searchIndexCheck`, :1044–1057 `counts`, :1358–1360 `selectionList`, :1140–1143 `#sees`; `frontier.mjs`:198–392). No other test asserts an administrator's or the founder's sight of a hidden project. `roster.test.mjs`:14, :37–40 and :252–256 compare against the gate itself; `frontier.test.mjs`:288 is positional; `t33.test.mjs`:236–242 asserts only `NOT_YOUR_QUERY`. Nothing it left out mattered: all 168 tests pass.

**Entry applied (T41-12a, tests only).** The N352 test (R17, R21, R29, R60; was :302–:331) is re-stated for D54. The hidden project's index row and selection bytes now leave for the administrator adele and the founder (`admin`), neither invited nor joined, exactly as for vera, a member outside the project. The participant and the machine credential still read whole, and refused viewers keep only the orphan. Negative controls: once invited (`projectInvite`), adele reads the project whole while the founder and vera stay outside; once the owner sets it discoverable, every administrator, the founder included, reads it whole and vera still does not. Each figure is still checked equal to the one taken through `hiddenBundles` for every viewer. No code changed. No requirement text assumes the old sight (R17, R21 and R60 defer to membership R43 and R88), so there was no QUESTION.

**Tests and checks.**
- `node --test test/m/retrieval/*.test.mjs`: tests 168, pass 168, fail 0. No layer tests are named in the manifest. No provided service changed, so users' suites were not run.
- `format`: 0 failures. `architecture` retrieval: 0 failures. `coverage`: 77 of 77. `ownership`: 1 file, 0 failures.

**Deferred.** None. **Found in other modules.** None. **Generated artifacts:** none made stale (tests only).

Size (session_0118UenKBjeUnhTTyRDVfooR): test runs 5, module lines 50
