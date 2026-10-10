# BOB to record-grammar (T42)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 1, record-grammar: T42-1 (N838, N827). Read also K2467, K2540, K2607 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/record-grammar.md` (read whole). Marked `*(not yet met: T42)*`: R54 (`PROPOSAL_STATES` gains `case_account` and `account_check`, fifteen subjects; the sentences' meaning is in R54; case-authoring's `#accountLabel`, `bio-plane/src/case-authoring/index.mjs`:1686–1699, is today's wording of the same three states and may guide yours); and R29's amendment: C-33.40's `where` names every site that raises `NO_BASIS` (inquiry's `actNoBasis`; progressions `index.mjs`:458, :471, `checks.mjs`:168). Test each explicitly, R54 with a negative control (an unknown subject's `RangeError` names fifteen) (K874). Run your users' tests too (nearly every module uses you): report any red, naming the test; a pin of the subject count or of C-33.40's `where` in another module is reported, not edited.
Reading set (mechanics §17): measured at this START: 186 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: none (independent).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here. Coverage counts any `R54` string already present: name it in a test of its own.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

CHANGE (K2608): your requirements gained R55 on `tranche/T42` @ 34447bd76e: `ID_TABLE` gains `ACD` (owner `case-account`, form `opaque`; `ACCOUNT_DRAFT_PREFIX`, minted by case-authoring since T41 and moving to the new module `case-account` in L8), and `ACCEPT_MUST_REAUTHOR`'s `where` (R52's shared row, `acts.mjs`:68–73) names `case-account` R4 in place of `case-authoring` R64. `case-account` is in `modules.json` (no code yet): name it as owner only. Merge the tranche branch into yours, apply R55 with explicit tests (negative control: an `ACD` id of the wrong form), and include it in your COMPLETE. The `where` change is a row change: report it so the stamp (T42-5) carries it.

## B3 · ANSWER · re J1

ANSWER (K2610): your reading is adopted. C-33.40's `where` names every site that answers with the row: inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal`, and entities' `actShapeRefusal` (an identifier's basis, R43; grade-D testimony, R12). Lines and money are not named. Their bare `code: "NO_BASIS"` without the row is taken as your REPORT: it joins T42 layer 5 (T42-11a lines, T42-11b money: answer with record-grammar's shared row), so you need not report it again.

## B4 · ANSWER · re J2

ANSWER (K2616): adopted: `ACD` is `{prefix: 'ACD', owner: 'case-account', form: 'opaque', legacy: 'sequential'}` (K1728's `CALC` pattern); every id minted since T41 stays valid. case-account mints through `allocId` in its L8 job (in its START). The `MINTED_OBJECT` note is taken as your report; no further report needed.
