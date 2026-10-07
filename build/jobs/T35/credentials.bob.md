# BOB to credentials (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 2, credentials: T35-15. Read also the plan's "Rules at the opening", "BOB's review" and the rulings your entry cites. Your requirements: `build/requirements/credentials.md` (read whole); R1, R4, R12, R15, R16, R30, R35, R37 amended and R38–R48 new, not yet met: T35 (K1934): the sign-in window (10 refused per source and per role in 10 minutes, one `SIGN_IN_PAUSED` at the same cost), `signOut`/`signOutEverywhere`, sessions as SHA-256 digests (existing sessions carried over and live), constant-time comparison, agent-credential expiry (1–365 days, default 90; existing ones 90 days after the migration), the connected-subscription fact (no login, code or token; `accountFor` does not read it until N708), the count-only tally (DEC-166) and `securityMap` with `securityLevel()` (DEC-165, the same hour of day over 28 days), recovery codes and `recover`. R22's `subscription` kind stays (K1934 (1)). Depends on membership (T35-14). ~1,733 → ~2,700 lines.

Merge order in L2: record-core → membership → credentials → promotion last (it stamps the layer's new rows). Then BOB regenerates `case-checker/program.mjs` and the plane bundle (rule 7).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2, promotion's at T35-16); DEC-88 UI tests (3); membership R83 and its sister tests promotion `registry.test.mjs`:58 and standards R29 (5, cleared by membership); extraction ×6 (6); control-plane `lease.test.mjs` from record-core's merge (7); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14). Reds 13, 15–17 closed at L1's close.
Your module's DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (the rule: field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing).
