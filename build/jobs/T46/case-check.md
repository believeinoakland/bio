# case-check (T46)

**Status** · session_01BBg9JuWWPT7LYa7vpffQYT · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · REPORT

T46-28 built on my branch (2e80f39477) against case-carriage R19–R21 as worded: R2's three lapse reads are now sourcesLapsedSince(text, checked_at), acceptedWorkLapsedSince(fm, by, checked_at), marksLapsedSince(fm, checked_at); a provider lacking them reads undetermined (fail closed). Also fixed in my module (P8): R3's LIKE narrowing dropped _ and % from the id instead of escaping them, so an id holding either was never listed; now escaped, with a test. Read my code and tests whole, and my requirements, case-carriage R19–R21 and my Uses' public parts. Controlled tests 32/32 pass; real.test.mjs's two tests read undetermined until case-carriage's T46-20 merges (expected). format, architecture, coverage (5/5), ownership: 0 failures. Waiting on your CHANGE announcing case-carriage's merge to merge tranche/T46, re-run, and complete.
