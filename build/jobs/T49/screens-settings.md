# screens-settings (T49)

**Status** · session_01VgMT6xBjEGeP2RQvFHHZjs · depth 2 · WORKING · handled B3

## J1 · QUESTION

QUESTION (my best reading is carried out meanwhile). Seven of the 551 keys DEC-257 reworded now hold a `{fill}` that nothing the plane answers today can fill. R37 forbids drawing a sentence with an empty or default fill, and R39 forbids inline English, so I cannot draw them as the design words them.

1. The founder's name for other readers (R35; `screen.members.recovery.one` `{name}`). `memberlist` is the members table and holds no founder row. Only the founder's own `whoami` carries her handle (membership R144, `sessionRights("admin").handle`); `bootstrap` names no one (R132). So an administrator who is not her has no read that gives the founder's handle, and R35's "named by her handle" cannot be met for them. Best reading: I draw her row and name her by `whoami.handle` when the reader is the founder, else by her handle if a read answers one, else `member.founder.unnamed`. For that I need `memberlist` (or another read of mine) to answer a founder row `{member_id: "admin", handle: founderHandle() or null, founder: true, role: "admin", status: "active"}`, as project-roster R29 answers it. That is a membership change (T49-1, already COMPLETE).

2. Fills with no data behind them (`connect`):
   - `screen.connect.own.subscription` `{plan}`: `accountreference.subscription` answers `{connected, since, held, valid_until?, refused_at?}`, no plan.
   - `screen.connect.own.apikey` `{last4}`: `accountreferenceset` / `accountreference` answers `{held, kind, set_at, suggestions, standing}`, no last four characters, and ai-accounts R2 says no digest or part of the secret is answered.
   - `screen.connect.group.allowance` and `screen.connect.grouplimits` `{used}` (and `{when}`, `{suggestions}`): `aiusage` without `owner` answers each limit as `{scope, unit, period, amount, inclusive, reached}`, no `used`; a dollar cost is answered only to an account's owners (ai-use R4, R10), so a member's own dollars on the group's key are never answered to them.
   Best reading: I draw each of these sentences only when every one of its fills is read from an answer, and otherwise draw the situation by the keys whose fills I have (`screen.connect.own.since` / `.until`, `.group`, `.group.allowance.reached` `{period}`, `screen.connect.grouplimits.heading`), leaving the rest out, never with an empty or default fill. I will name the answer fields I read (`plan`, `last4`, `used`) in my record, so the owner can add them if you want the sentences drawn in full. The alternative is that the design lane re-words these keys without the fill. Which do you want?

3. The translations empty state (R37): `words.json` already holds `screen.translations.languages.none` ("Your group uses no language but English yet."). I draw it by key when the group has no language but English; the module's own row R37 allowed is not needed.

Also: after R39 this module's `words.mjs` rows are gone (`SCREEN_WORDS` stays exported, empty). `screens-inquiry/projectai.mjs`:16 and :160 filter that list for the rows `screen.panel.*`; they must read keys instead. I export the panel's keys as `PANEL_KEYS` from `screens-settings/panel.mjs` for them. That is a change for the screens-inquiry job, not mine.
