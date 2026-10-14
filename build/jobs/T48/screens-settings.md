# screens-settings (T48)

**Status** · session_016pGtSfZzasM34bygFE6WEP · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

QUESTION (best reading given; I carry on with it).

R31 (languages by name, no tags) needs a language's name in the member's language, and no op or `WORD_ROWS` key gives one (`grouplanguages` answers tags only; `words.json` has no language names). My reading: the screens call `Intl.DisplayNames` (ECMAScript's own, locale = the member's language, else English) inside `account`, `group` and `translations` render functions. `Intl` is a language global but is not among the ones interface-shell R21 lists (JSON, Math, String, Number, Array, Object, Date). If you would rather have the kit supply it (`cs.language(tag)`, interface-shell's), say so and I will call that instead; until then I use `Intl.DisplayNames` and the test runs in Node, where it exists.

Also owed to the design stream (words I have written in `SCREEN_WORDS`, none in `words.json`): `screen.members.count` re-worded to "Active members: {members} · Administrators: {administrators}" (R29), `screen.connect.way.{field,subscription,apikey,later}` (R30), `settings.set.setup` ("set at setup", R33, the named interim), `screen.updates.admins` and `screen.updates.skip.noreason` (R27). `screen.account.language.help` re-worded to name no tag.

Blocked on merges, not on you: `updates` and `elsewhere` need the registry re-take (wizard-scripts) and `aiuseovertime`, `updatenotice`, `updatestart`, `updatelater`, `updateskip` need op-declarations. Until they merge I keep `updates` out of `SCREENS` in my working tree (marked TEMP-UPDATES) and test it after.

## Job record (SCREENS-SETTINGS #3, T48)

**Read, whole:** `build/requirements/screens-settings.md`; the plan's entries T48-71, T48-87 and the L11 notes; `build/layers.md` (layer 11); every file of `bio-plane/src/screens-settings/` (`words.mjs` by its keys, as data); `kit.mjs`, `common.test.mjs` and the tests that name the requirements I changed (`members`, `panel`, `connect`, `places`, `settings`, `account`, `group`, `identity`, `notes`, `translations`, `contract`, `words`); of the modules I use, only what my entries touch: `interface-shell` R21, R27, R47, R56, R61, R62 and its kit (`cs.field`, `cs.choice`, `cs.copy`, `cs.checks`, `cs.rows`), `wizard-scripts` R37 (the `elsewhere` route), `ai-use` R14, `instance-setup` R89, R90, `op-grades` R40.

**Entries applied (all in `bio-plane/src/screens-settings/`, tests beside):**
- R29 (T48-87): `members` reads `bootstrap` and counts the founder once claimed beside the roster's active administrators (membership R64, R86), with the roster alone never the count; the word says "Active members". Tests: founder with no roster row, a member who does not administer, an unclaimed instance, an empty cell.
- R26 and B2 (K3293): `aiUsageBars(cs, view, {owner, value})` in `panel.mjs`, a part of every screen (`view.parts`), over an `aiuseovertime` answer already read (the answer or the screen's read of it); `aiPanel` draws it from the part. Thirty bars, the newest "today, so far", the summary line, a meter per limit (`near` at four fifths), `nolimit`; `unreadable`, a refusal or a failed read is drawn failed. `members` and `connect` read `aiuseovertime` over their owner (administrators only for the group); `ailimitset` reads it again.
- R25: `places` (administrators) reads `startfrom` and draws "Where else to go": the count and the reference to `elsewhere`; none listed draws the reference alone; a null pointer is drawn failed.
- R27: new `updates.mjs` (the screen `updates`), in `SCREENS` and in the settings list after Security. Update (primary, outward; the answered address offered in a new context, https only), the hand-off for an administrator who does not hold the hosting account (the address `updatestart` answers, copied by `cs.copy`), Not now, Skip under a disclosure (reasoned, one line of 1 to 1,000), the notes as escaped text, a member who does not administer reads nothing.
- R30: `connect` asks one `cs.choice` first (subscription preselected, API key, Not now) and draws only the chosen path.
- R31: `account` (a language chosen by name among the group's), `group` (languages ticked by name), `translations` (languages by name, the source English not offered, a row shows its English and meaning and never its key, a member not granted sees the refusal alone). Names come from `Intl.DisplayNames` in the member's language (B3 allows it).
- R32: `settings` draws the design's link list (`mk-links`): icon and name as the reference, the purpose as a box of its own beneath.
- R33: a value recorded at setup or by the system (`admin`, `token:`, `class:`, none) is `settings.set.setup` ("set at setup") in `group`'s hosting record and in `updates`.
- R28: every class these screens write is defined by a served stylesheet (`mk-note`, `mk-table`, `mk-msg`, `mk-dl`, `mk-tag`); every labelled field is `cs.field` or `cs.choice`; no `cs-form`; sections, lists and sentences that hold nothing are not drawn (notes, offices, the group's none-sentences, empty security tables, uses and changes of the panel, no count at zero). A failed read is still drawn failed.
- Words I hold as `SCREEN_WORDS` rows (BOB is asking UX-DESIGN, B3): `screen.members.count` (re-worded), `screen.connect.way.*`, `settings.set.setup`, `screen.updates.admins`, `screen.updates.skip.noreason`, `screen.security.field`, `screen.security.field.optional`; `screen.group.languages.{field,help,count}` and `screen.account.language.help` re-worded to name no tag.

**Deferred:** none. R29 says invitations are counted by status as listed: no invitation count is drawn, so there is none to agree.

**Found in other modules:** `interface-shell`'s `cs.rows` pick box draws `cs-pickc` (R28's list renames it `mk-pickc`; R56's check will name it); my R28 test lists it as kit-drawn until then. `cs.field` has no `inputmode`, so the numeric fields (`mw-cap`, `mw-days`) are plain text fields.

**State at this post:** with `wizard-scripts`, `op-grades` and `interface-assets` merged, and a scratch merge of `op-declarations`, the module's 108 tests pass. `updates` is out of `SCREENS` in this branch (marked TEMP-UPDATES in `index.mjs`) only because `op-declarations` is not merged into `tranche/T48` yet (the shell refuses a screen whose op `OPS` lacks); the next step is to merge `tranche/T48`, restore `updates` in `SCREENS`, run the module's tests and the checks, and post COMPLETE. Checks now: format 0 failures; architecture 0 failures; coverage 33 of 33; ownership 0 failures.

## J2 · REPORT

REPORT: all entries are built and tested except that `updates` waits on `op-declarations`.

State: R25, R26 (with B2's `aiUsageBars` part), R28–R33 and T48-87 are met with tests; R27's screen and tests are written and pass in a scratch merge of `tranche/T48` + `op-declarations` (108 tests, 0 fail). In my branch `updates` is out of `SCREENS` (marked TEMP-UPDATES) because the shell refuses a screen naming an op `OPS` lacks until `op-declarations` is merged. Checks on my branch: format 0, architecture 0, coverage 33 of 33, ownership 0.

What I need: the `op-declarations` merge into `tranche/T48`. Then I merge it, restore `updates`, run tests and `checks/run.mjs`, and post COMPLETE. Ring me (or RESUME) when it is in.

Context: this session is at about half its window, so the record names the next step; a restart can pick it up from there.

**Completion (B4, K3298):** `tranche/T48` merged (op-declarations, wizard-scripts); `updates` restored to `SCREENS`. Tests: `node --test bio-plane/test/m/screens-settings/` 108 pass, 0 fail. Checks (`checks/run.mjs`): format 0 failures; architecture 0 failures; coverage names every live id of screens-settings (the failures it prints are other modules'); ownership 0 failures; channels 0 failures.
Size (session_016pGtSfZzasM34bygFE6WEP): test runs 24, module lines 2305

## J3 · COMPLETE

COMPLETE: R25–R33, T48-87 and B2 applied; 108 tests pass; format, architecture, coverage (this module), ownership 0 failures. Details in the record.
