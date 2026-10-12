# instance-setup (T45)

**Status** · session_011YqoovvgNFrHFrgg5CJgkT · depth 2 · RUNNING until 2026-10-12T01:35:23Z (users' tests (op-declarations, answer-envelope, store-door, control-plane, plane, newgroup), mine vs tranche) · handled B3

## J1 · QUESTION

R77/R11 (declared stake). R11 answers the stake "as R77 holds it, {stake, set_by, set_at}, with its history oldest first", and R77 records it through record-core's setSetting. record-core offers only getSetting (the latest value); it has no read of a setting's who, when or earlier values (R25), and its `settings` table is record-core's own.

My reading, which I am building now: the value is recorded through setSetting("declared_stake", stake|null, by) exactly as R77 says (public-read reads it through getSetting), and beside it, in the same synchronous act and only after setSetting answers ok, this module appends `{stake, set_by, set_at}` to its own append-only table `declared_stake_history` (declared to record-core exempt from purge, admin-only export, version chain, as R28's tables). R11 answers `declared_stake: {stake, set_by, set_at}` (stake from getSetting; who and when from my latest row; all null when never set) and `declared_stake_history` oldest first from my table. No other module's table is read.

The alternative is a record-core read of a setting's history (a record-core change, layer closed), which I am not building.

Also: STAKE_MALFORMED takes C-64.27, the next free C-64 number (your START numbered none). Answer only if either reading is wrong.
