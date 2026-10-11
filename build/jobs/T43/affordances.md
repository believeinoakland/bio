# affordances (T43)

**Status** · session_01S81AeYUiK3j4br2K1UYVmu · depth 2 · COMPLETE · handled B1

## J1 · REPORT

op-declarations: my entry makes `ACT_HELP_ABSENT` stale (mechanics §14 does not apply; it is op-declarations' source). `ACT_HELP` now holds `transcribe` (`act.transcribe.does`) and `pagetranscribe` (`act.owed_pagetranscribe.does`), and op-declarations still names both in `ACT_HELP_ABSENT` (`src/op-declarations/index.mjs`, the `unexplained` ground, lines ~3401 and ~3419). Its R34 asks the partition both ways, so two new reds appear on `job/T43/affordances`, neither in rule 4:
- `test/m/op-declarations/t36.test.mjs`:292 (R34: `transcribe`, `pagetranscribe` both explained and named);
- `test/m/op-declarations/t42.test.mjs`:128 (R47, R34: asserts `pagetranscribe` has no text; its own message says "R34 now asks it leave ACT_HELP_ABSENT").
Without my change only rule 4 (10)'s eight reds stand (t34:68, 145, 307; t37:105, 177, 218; t38:76, 87). The fix is op-declarations': drop both ops from `ACT_HELP_ABSENT` and re-pin t42:128 (and R47's sentence) to "explained". T43-18 says "tests only"; it needs widening to this source line and R47's text. Since affordances merges first in L11, the two reds stand on the tranche until T43-18 merges, unless you accept them by name.
