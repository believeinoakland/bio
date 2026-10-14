# screens-settings (T48)

**Status** · session_016pGtSfZzasM34bygFE6WEP · depth 2 · WORKING · handled B2

## J1 · QUESTION

QUESTION (best reading given; I carry on with it).

R31 (languages by name, no tags) needs a language's name in the member's language, and no op or `WORD_ROWS` key gives one (`grouplanguages` answers tags only; `words.json` has no language names). My reading: the screens call `Intl.DisplayNames` (ECMAScript's own, locale = the member's language, else English) inside `account`, `group` and `translations` render functions. `Intl` is a language global but is not among the ones interface-shell R21 lists (JSON, Math, String, Number, Array, Object, Date). If you would rather have the kit supply it (`cs.language(tag)`, interface-shell's), say so and I will call that instead; until then I use `Intl.DisplayNames` and the test runs in Node, where it exists.

Also owed to the design stream (words I have written in `SCREEN_WORDS`, none in `words.json`): `screen.members.count` re-worded to "Active members: {members} · Administrators: {administrators}" (R29), `screen.connect.way.{field,subscription,apikey,later}` (R30), `settings.set.setup` ("set at setup", R33, the named interim), `screen.updates.admins` and `screen.updates.skip.noreason` (R27). `screen.account.language.help` re-worded to name no tag.

Blocked on merges, not on you: `updates` and `elsewhere` need the registry re-take (wizard-scripts) and `aiuseovertime`, `updatenotice`, `updatestart`, `updatelater`, `updateskip` need op-declarations. Until they merge I keep `updates` out of `SCREENS` in my working tree (marked TEMP-UPDATES) and test it after.
