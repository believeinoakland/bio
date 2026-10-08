# credentials (T38)

**Status** · session_011Sz476u5szTBqKpR6HExC4 · depth 2 · RUNNING until 2026-10-08T15:43:17Z (the user modules' tests, head and base) · handled B2

## J1 · QUESTION

R27 (and R32) for a member served by a sign-in (R35's new `signin` branch), as B1 asks.

My reading: R27 mints for such a member. R27 refuses `NO_ACCOUNT` only for "a member whom no account serves (R35 answers `NO_ACCOUNT`)", and from T38 R35 serves a connected member (R43) with `{kind: "signin", level: "member", member}`; an ask grant is what lets that member's ask read the record, so refusing it would leave the sign-in serving nothing. The notice (R36, `GROUP_KEY_NOTICE_DUE`) is not asked, since the group key does not serve them. The order stays R35's: own `apikey` reference, then the sign-in, then the group key. So R27's text would read, in its NO_ACCOUNT sentence: "(R35 answers `NO_ACCOUNT`: no reference of their own, not connected through their subscription (R43), and the group key not held or off)".

R32, the same reading carried through: a sign-in serves a standing question too (R35 serves "asks, runs and standing questions"), but no `standing` switch governs it: R25's switches belong to the member's reference and are set only while one is held (R25 answers `NO_ACCOUNT` without one), and R37's govern only the group key. So a member served by a sign-in is refused `STANDING_SWITCH_OFF` ("the switch that governs that member's account ... off"), minting nothing, until a requirement gives the sign-in switches of its own. Its `suggestions` likewise reads off (`agent-worker`'s carrying of it is that module's).

Building on this reading now; R27/R32 code changes held until your answer. Migration detail (mine, P17, recorded in my record): the `subscription` rows are deleted from `account_references` and, as R22's removal does, any standing grant minted for those members ends with them.
