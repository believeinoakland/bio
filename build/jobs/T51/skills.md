# skills (T51)

**Status** · session_01K9Zb4DmgqUt5XwdxVRzjzu · depth 2 · COMPLETE · handled B1

## Completion (T51-135)

- **Entry applied as far as the canon allows: no code change.** `skilldoctrine.mjs`' clauses are spans of `BIO_Action_v0_2.md` §4, `BIO_Publication_v0_1.md` §5A, `BIO_Interaction_Constructs_v0_1.md` §L and P, `BIO_Assistant_and_AI_Roles_v0_1.md`, `ASSISTANT-PILOT.md`. I merged `tranche/T51` (DEC-281, c2b8b5802b) and searched each source: none of those sentences says "team" for the people of a Civicsmith. DEC-281 (Interaction Constructs §L, line 838) rules that words people read say "team", keeps "group" in identifiers, and states "Where this document says 'group', members read 'team'": the canon sentences were left saying "group". Each clause whose canon still says "group" for the team stays as it is (BOB's note 1). The remaining "team" hits in canon are Anthropic's Team plan (Roles line 103), not the group.
- **Pack's own words** (task descriptions, `load_when` and `absent_because` of R39, R49 and others, not clauses; R21 binds clauses only) still say "group" for the team. They are text a run reads, not words people read; left as they are, noted for BOB.
- **Digest and pin tests (BOB's note 2):** nothing moved; the pack's version is unchanged. `node --test bio-plane/test/m/skills/`: tests 130, pass 130, fail 0.
- **Deferred:** none.
- **Found in other modules:** none. REPORT to BOB (canon wording belongs to the design stream): the clause sources above still read "group" for the team; once the canon sentences are re-worded to "team", this job (or a successor) re-spans the clauses, the pack's version then moves.
- **Checks:** format 174 modules, 0 failures; architecture (skills) 19 product files, 0 failures; coverage (skills) 51 of 51 live ids named, 0 failures (full-product coverage shows 24 failures in other modules, none skills); ownership: 1 file changed by skills, 0 failures; channels 0 failures.

Size (session_01K9Zb4DmgqUt5XwdxVRzjzu): test runs 3, module lines 0

## J1 · REPORT

T51-135: no clause re-spanned. Canon sources (Action v0.2 §4, Publication §5A, Constructs §L/P, Roles, PILOT) still say 'group' for the team; DEC-281 rules members read 'team' where canon says 'group'. Per your note 1 the clauses stay; canon wording is the design stream's. Pack version unchanged; skills tests 130/130.

## J2 · COMPLETE

T51-135 complete, no code change; details in my record. Checks: format, architecture, coverage (skills 51/51), ownership 0 failures. Tests 130/130.
