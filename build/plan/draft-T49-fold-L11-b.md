# T49's fold, L11 (b): the screens, their providers, the site and the walk (draft)

**Status** · A worker's draft for BOB #177 (2026-10-14), on `tranche/T49`. Not folded: BOB reviews it and writes the lines into the requirement files at the fold (P5). Covers T49-14, -15, -19 to -28, -31 and -32. Sources read: `requirements/README.md`; `current.md` (rules, those entries, "Settled by BOB #177", "To fold before START"); `draft-T49-fold-dec235-240.md` (its lines for these modules, "as drafted", renumbered here); `draft-T49-N1072-founder-handle.md` (screens-entry, journey-check); `draft-T49-walk.md`; DECISIONS DEC-230, DEC-241, DEC-245, DEC-246 (and DEC-206, DEC-223 for the site); each target module's requirements whole; the code each entry cites; the design at `f498560a37` (`origin/main`, PR #37's merge: `words.json`, `mock-acts.js`, `mock-screens.js`, `mock-shell.js`, `page.src.html`, `civicsmith.css`).

Ids were checked against each file's highest id, retired ids included (README 5, 6).

| module | highest id now | ids taken here | plan's ids |
|---|---|---|---|
| affordances | R59 | R60, R61 | same |
| setup-words | R8 | R9 | same |
| interface-assets | R7 | R8 | same |
| interface-shell | R64 | R65–R69 | same |
| screens-entry | **R15** (T48 took R12–R15 after the N1072 draft was written) | **R16–R20**; R2, R4, R6 re-worded | R17–R21: **off by one** |
| screens-settings | R33 | R34–R38 | same |
| screens-intake | R20 | R21–R25 | same |
| screens-daily | R23 | R24–R33 | same |
| screens-inquiry | R22 | R23–R43 (R43 moved here from screens-daily R33, finding 4) | R23–R42 |
| screens-investigate | R26 | R27–R29 | same |
| screens-publish | R21 | R22, R23 | same |
| screens-action | R14 | R15–R18 | same |
| site | (new file) | R1–R11 (R10, R11 invariants) | "R1 onward" |
| journey-check | R6 | R7–R13 | same |

Design facts used (at `f498560a37`): `words.json` holds **2,473** words, **741** protected; `mock-acts.js`' `ACT_HELP` holds **338** entries, its `owed_` keys `passwordresetlink`, `updatestart`, `updatelater`, `updateskip`, `readtranslate`, `projectstakeset`, `actionstake`, `founderhandleset`, `projectfork`, `watchitem`, `secondlook`, `actioninquiry`, `versionconsider`, `versionreject`, `versionrevert`, `versioncurrent`; there is no text for `projectownervotes`. `signin.founderhint` is gone from `words.json`; DEC-230's keys (`screen.setup.handle`, `.help`, `signin.handle.help`, `forgot.handle.help`, `founder.handle.*`, `member.founder.unnamed`, `refusal.HANDLE_*`) are present. `civicsmith.css` holds `.cs-band[data-band="test"]`; `page.src.html` holds every class DEC-236 and DEC-241 name and `.mk-lvlbtn`.

---

## 0. Findings (errors in the plan against code, design or requirements)

1. **screens-entry's ids.** The N1072 draft took R12–R14 when R11 was highest; T48 then wrote R12–R15. The next free id is R16, so the entry's five lines are R16–R20, not R17–R21. R6 itself also has to change ("then `login` as handle `admin`"): DEC-246's owed line says R6 follows K3265. It is re-worded below rather than patched by a new id, as are R2's and R4's help keys.
2. **interface-shell R68's third clause is wrong against the design.** "The header draws no explanation-level name" contradicts `mock-shell.js`:47, where the masthead's `mk-lvlbtn` draws "Explain promptly" or "On a longer pause". It also contradicts R17 and R60, which require that name. The clause is dropped. If D30's "Explain promptly" complaint meant something else, it goes to the channel act. R65 gains `mk-lvlbtn`, the design's class for that control, which the shell does not draw today.
3. **screens-inquiry R33 must amend R6's K3003 clause, not only R13.** That clause *requires* `fetches` 0 and `subsessions` 0, so D3's cause is the requirement itself (`assistant.mjs`:228 obeys it).
4. **The first question is on `project`, not on Projects.** DEC-245's "Your first question" (`project.firstquestion`) is `SCR.project` state b (`mock-screens.js`:951), which is screens-inquiry's screen (its R11). screens-daily R33 keeps only Projects' empty state. The first question is screens-inquiry R43.
5. **affordances R61's owed list (fold §7) is stale.** It names `actioninquiry`, `watchitem` and `secondlook` as "held once declared", but all three are left out of T49. It omits `projectstakeset` and `actionstake` (N933, left out). It also omits `founderhandleset`, which T49-17 declares *after* affordances merges. Corrected below. A partition red follows: `op-declarations`' `ACT_HELP_ABSENT` names `readtranslate`, `planask`, `stepsource`, `stepsourcewithdraw`, `actionreplyquoting`, `lookedsince`, `proceedingdates`, `updatenotice`, `aiuseovertime`, `exploregraph`, `standardproposals`, `filingread` and `pressurefor`, and `mock-acts.js` now gives each a text, so R34's "never both" is red from affordances' merge until T49-17 re-pins it. This red is not in rule 5.
6. **screens-settings R34 and R38 overlap.** DEC-236's keys (`screen.connect.way.field`, `.subscription`, `.apikey`, `.later`) *are* R30's four words. R38 is reduced to what DEC-246 adds: the sign-in refusals beside the code, `connect.ifnot`, and the reference. R36's "subscription only while installed" is already R13's rule. The defect is that R30 (T48) preselects the subscription regardless, so R36 amends R30.
7. **screens-intake R25: `capturerequest` is the deferred "Ask for this later".** The journey's capture is `acquire` or `captureupload`. `captured_for` reaches R77 through capture R83's reader, which is registered by `capture-requests` R48 and matches requests to capture digests. Whether a request sent beside an immediate `acquire` is matched to it is unmeasured. It is a START measure (with M-T49-5). If it fails, a provider line is owed through BOB (P9). The upload path has no address, so only R22's filing applies there.
8. **site: "words by key" cannot hold.** `words.json` keys only `screen.site.name` and `.purpose`, and the site uses nothing, so it cannot read `setup-words`. The site carries the design's text at a named commit. DEC-223 (14 October, after BOB #174's text) made the site three pages joined by one menu: "Start your group" became "Start a group's Civicsmith" / "Create your group". **No provider serves "Groups at work"**: there is no network directory service (`network-notices` R23 prepares a submission, R30 pushes to none). The mock's groups and its published case (Lakeshore Tenants, the Coliseum lease) are fictional and cannot be shipped as real. The installer's public address is not recorded anywhere. See the site's doubts.
9. **journey-check R7 vs DEC-230.** DEC-230 (3)'s step for a founder with no handle *says* "admin" ("Until now you've signed in as admin…", "You still sign in as admin until you choose"). R7 admits exactly those keys on that step.
10. **setup-words R9 removes `signin.founderhint`**, which `screens-entry/front.mjs`:78 and `index.mjs`:31 still read. From T49-15's merge until T49-21's, the front door's help falls back as an unknown key. This red is not in rule 5. It is named below.

---

## 1. affordances (T49-14)

Place under a new heading after R59: **T49: the help re-taken; `step_source` grouped** (T49).

- **R60** (T49; N1090; DEC-236 (B204 (3)); amends R59) The vocabulary's `connection_kinds` answers `step_source` in its own group, `step_source`, never `ment`. R59's groups are now six: `pos`, `part`, `money`, `ment`, `same` and `step_source`. A step backed by a passage is neither "Mentioned together" nor a position. Test: totality over the registry, with `step_source` in its own group. Control: no `step_source` kind is answered `ment`. *(not yet met: T49)*
- **R61** (T49; DEC-229 to DEC-241, DEC-245, DEC-246; N1072; K2999's rule; amends R48, R57) `ACT_HELP` is re-generated from `mock-acts.js` as it stands on `main` at the commit named at START (`f498560a37`, PR #37's merge, 338 entries, or a later `main` commit), by R48's reading:
  - `owed_versionconsider`, `owed_versionreject`, `owed_versionrevert`, `owed_versioncurrent`, `owed_projectfork` and `owed_readtranslate` are held under those ops, which are declared and spelled `op=` (plan rule 7);
  - `owed_updatestart`, `owed_updatelater`, `owed_updateskip` and `owed_passwordresetlink` are held under those ops (declared);
  - `owed_founderhandleset` is held under `founderhandleset`, which `op-declarations` R71 declares in T49 (K2999's rule: the partition holds at both merges);
  - `owed_projectstakeset`, `owed_actionstake`, `owed_watchitem`, `owed_secondlook` and `owed_actioninquiry` stay under their `owed_` keys (their ops are not declared in T49);
  - `queuemute`'s text is the re-worded one.

  `projectownervotes` has no text in the file, so it is given none here (`op-declarations` names it in `ACT_HELP_ABSENT`). The counts and named keys of R48's clauses move to this commit. Test: equality with the file, read from git at the commit. Control: no held key starts `owed_` but the five named. *(not yet met: T49)*

**START must say:**
1. Measure first: read `mock-acts.js` at the named commit and list each key by R48's reading (held under its op, held under `owed_`, an alias, not held), with the count. List the ops `op-declarations`' `ACT_HELP_ABSENT` names that now have text (finding 5). That red opens at this merge, is named at it (K2704), and clears at T49-17.
2. Inherited reds: R48's design-file red, which this job clears (rule 5 (7)(B)); the registries' census for `founderhandleset` and `projectownervotes` (affordances R1/R12, 5 (3)), which clears here; coverage on R60–R61 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START.

---

## 2. setup-words (T49-15)

Place under a new heading after R8: **T49 (T49-15)**.

- **R9** (T49; DEC-229 to DEC-241, DEC-245, DEC-246; N1072, DEC-230; amends R8) `WORD_ROWS` is `words.json` as it stands on `main` at the commit named at START (`f498560a37`, PR #37's merge, or a later `main` commit), and `WORDS_COMMIT` is that commit: 2,473 rows, 741 of them protected at `f498560a37`, by R1's rule. The counts as read at the named commit bind. This carries every key the T49 screen requirements name. It no longer carries `signin.founderhint` (DEC-230 withdrew it). Test: equal word by word. Control: no row's key is `signin.founderhint`, and no row's `en` holds "labelled". *(not yet met: T49)*

**START must say:**
1. Measure first: the named commit's row and protected counts, and the keys R8 carried that the file dropped. For each dropped key, grep `bio-plane/src` for a reader. `signin.founderhint` is read by `screens-entry` (`front.mjs`:78, `index.mjs`:31) until T49-21 (finding 10). Name each reader's red at this merge.
2. Inherited reds: coverage on R9 (rule 5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). On Haiku: rule 6's N1068 and the `admin` grep only apply to words this module carries verbatim, so they are a check, not an edit.

---

## 3. interface-assets (T49-19)

Place under a new heading after R7: **T49 (T49-19)**.

- **R8** (T49; N1090, N1094, N1099; DEC-236 (B204 (1), (3)), DEC-240 (N1049), DEC-241; amends R5, R7) `ASSETS_COMMIT` is the `main` commit named at START (`f498560a37`, PR #37's merge, or later). `ASSET_FILES` is read there by R1's and R7's rules. By them:
  - `shell.css` carries DEC-236's design classes: `.mk-menuwrap`, `.mk-menu`, `.mk-actwrap`, `.mk-slot`, `.mk-rowname`, `.mk-scrim`, `.mk-image`, `.mk-imgareas`, `.mk-imgarea`, `button.mk-avatar` and `.mk-grp`. It also carries the graph's `.e-step_source` and DEC-241's `.mk-morerows` and `.mk-morerow`;
  - `civicsmith.css` carries `.cs-band[data-band="test"]`.

  Test: R1's byte equality and R7's transform. A scan finds each named rule. Control: no selector names `mk-device` or `mk-scaler`. *(not yet met: T49)*

**START must say:**
1. Measure first: at the named commit, confirm each named rule is in its source (`page.src.html` for `shell.css`, `civicsmith.css` itself for the band), and state the change in `ASSET_FILES`' size against `bundler` R31's warning.
2. Inherited reds: coverage on R8 (rule 5 (1)); the plane bundle (5 (5)). No rule 5 (7) red is this module's.

---

## 4. interface-shell (T49-20)

Place under a new heading after R64: **T49 (T49-20)**. R65–R67 are as drafted (fold §2, §3, §6), with the commit and R65's one addition marked.

- **R65** (T49; N1090; DEC-236 (B204 (1)); K3250's rule; amends R56) The shell draws its own elements with the design's classes, never its own, and drops its own rules for them from `STYLE`:
  - the member menu: `mk-menuwrap`, `mk-menu` (a `cs-dialog` under the avatar);
  - an act with its refusal slot: `mk-actwrap`, `mk-slot`;
  - a row's name cell: `mk-rowname`;
  - the scrim behind a blocking dialog: `mk-scrim`;
  - an image at its width: `mk-image`;
  - areas marked on an image: `mk-imgareas`, `mk-imgarea`;
  - the avatar as a button: `button.mk-avatar`;
  - the group's name: `mk-grp`;
  - the explanation-level control: `mk-lvlbtn` (`mock-shell.js`:47; added at this fold, finding 2).

  These replace `cs-menuwrap`, `cs-menu`, `cs-actwrap`, `cs-slot`, `cs-rowname`, `cs-overlay`, `cs-image`, `cs-areas-box`, `cs-area` and `.cs-mast .grp`. `STYLE` keeps only these:
  - the page's height settings (`body.cs`, `#cs-root` and the frame's scrolling; the frame's own fixed height is the design's `.cs-frame`);
  - stopping motion under reduced motion.

  R56's list of styles the shell carries is that, and nothing else. A failure with no words of its own (R61 (3)) is drawn as `shell.unread` with R39's reference. `shell.level` is not drawn (R60). Test: the composed page's `class` attributes name none of the replaced classes. `STYLE` holds no rule for them. Control: the dialog over a locked screen still blocks the screen behind it. *(not yet met: T49)*
- **R66** (T49; N1078, N1091; DEC-237 (1), DEC-234; amends R27, R47) `REF_SCREENS` gains the kinds `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony` and `docket`, each card its `shell.card.<kind>` word. `proceeding` and `standard` read `shell.card.proceeding` and `.standard`. Test: each kind opens its screen with its card. Control: an unknown kind is still refused. *(not yet met: T49)*
- **R67** (T49; N1094, N1049; DEC-240 (N1049); `interface-assets` R8; amends R53, R58) The test-instance band is the design's `.cs-band[data-band="test"]`. It is drawn with the machine icon, `instance.test.band` ("Test Civicsmith") and then `instance.test.notice`. `.cs-testband` and its rule in `STYLE` go. R53's span of the frame and R58's first-paint rule are unchanged. Test: the served page's band carries `data-band="test"` and both words. Control: no `cs-testband` class is drawn. *(not yet met: T49)*
- **R68** (T49; D31 **m**, D28 **m**; K3324 (1); amends R14, R22, R34) Three rules, each over a fixture:
  - **Explanations close.** A card or explanation opened by a control closes when that control is pressed or the focus leaves it. It is never left open over the next field (R14's closing rule, on press as well as on leaving).
  - **Nothing clipped at 390 px.** No chip, label or digest the shell draws is clipped. Long text wraps, or is cut with its full text in its card (R16).
  - **No console line for an expected refusal.** An act answered `REAUTH_DUE` that the shell handles (R34) writes nothing to the console from the page's own script. If START finds the line is the browser's own network log of the 403, this clause is dropped, and `journey-check`'s console check admits that line (doubt 10).

  The plan's third clause ("the header draws no explanation-level name") is not written (finding 2). Test: each rule over its fixture. Control: a card opened by hover still opens after 0.5 s (R14). *(not yet met: T49)*
- **R69** (T49; N1099, N1100; DEC-241, DEC-246; amends R39, R63) Two changes:
  - **The More page.** The phone's More page (R63) heads with `screen.more.sub`. Beneath each place's name it draws `rail.<k>.line`, in place of `rail.<k>.holds`, which stays its explanation. It uses the design's classes `mk-morerows` and `mk-morerow`, with the More tab lit.
  - **A refusal's reference.** It is drawn by `refusal.reference` ("Reference: {ref}") with the trace's first 8 characters (R39), in place of `shell.trace`.

  Test: `/app/more` at 390 px draws Projects, People and Settings, each with its line. Control: a refusal carrying `trace` draws "Reference: " and eight characters, and stores nothing. *(not yet met: T49)*

**START must say:**
1. Measure first: D28's console line on the local arm. Is it the page's own `console` call, or Chromium's network log of the 403 (doubt 10)? Record which, since R68's third rule depends on it. Re-measure the module (2,414 lines).
2. Inherited reds: coverage on R65–R69 (rule 5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). The screen modules' tests that pin `shell.trace` or `cs-testband` go red at this merge until their own jobs; name them (K2704). Rule 6 at START, and the N1073 lines `kit:398`, `session:210` and `frame:51`.

---

## 5. screens-entry (T49-21)

**Re-worded lines (finding 1).** These are BOB's edits at the fold, each marked not yet met.

- **R2**: "(`signin.founderhint` its help)" becomes "(`signin.handle.help` its help, DEC-230 (2))". The rest is unchanged. *(not yet met: T49)*
- **R4**: its handle field's help is `forgot.handle.help` (DEC-230 (2)). The rest is unchanged. *(not yet met: T49)*
- **R6**: "sends `claim`, then `login` as handle `admin` (device own)" becomes "sends `claim` with the handle R17 asks, then `login` with that handle (device own, R17)". The rest is unchanged. *(not yet met: T49)*

**New lines.** Place them under a new heading after R15: **T49 (T49-21)**. R16–R18 are the N1072 draft's R12–R14, renumbered and settled against DEC-230 (#174 doubt 5).

- **R16** (T49; N1072; K3265; DEC-201, DEC-230 (2); amends R2, R4) The sign-in panel's handle field and `forgot`'s handle field carry no founder hint. Their help is `signin.handle.help` and `forgot.handle.help`. `signin.founderhint` and `screen.forgot.handle.help` are neither read nor held here, and no word drawn here names a handle. Test: `front` and `forgot`, drawn in every state, hold neither withdrawn key and no text naming `admin`. Control: both handle fields are still drawn and send `handle`. *(not yet met: T49)*
- **R17** (T49; N1072; K3265; DEC-230 (1); amends R6) **setup**'s claim asks "Choose your handle" (`screen.setup.handle`, help `screen.setup.handle.help`) between the one-time password and the founder's password. The password's help is DEC-230's. None of these is held in `SCREEN_WORDS`.
  - **Sending.** It sends `claim` with `password` and `handle` in the body only.
  - **Refusals.** `refusal.NO_HANDLE`, `refusal.BAD_HANDLE`, `refusal.HANDLE_TAKEN` and `refusal.HANDLE_FIXED` are drawn by their keys, keeping the handle and clearing the passwords.
  - **Success.** It sends `login` with the `handle` the claim answers (device own), never `admin`. `screen.setup.claimed` is drawn with `{group}` and `{handle}`.

  Test: a fake plane walked from the claim with a chosen handle sends that handle to `claim` and to `login`. Controls: a refused handle keeps the step and sends no `login`; no request or drawn word in the flow holds `admin` as a handle. *(not yet met: T49)*
- **R18** (T49; N1072; K3265; DEC-230 (3); `membership` R144; `credentials` R75) **A founder whose group was claimed before T49 chooses her handle once.** After a sign-in whose session is the founder's with no handle (`whoami`: `rootOfTrust: true`, `handle: null`), the setup frame draws DEC-230's step before Home: `founder.handle.title`, `founder.handle.says`, the handle field with `screen.setup.handle.help`, "Choose this handle" (`founder.handle.choose`) and "Later" (`founder.handle.later`).
  - **Choose.** "Choose this handle" sends `founderhandleset` with `handle` in the body only. R17's four refusals are drawn by their keys. On success it draws `founder.handle.done` with `{handle}` and opens Home.
  - **Later.** "Later" sends nothing and opens Home with `founder.handle.later.help`.
  - **When offered.** The step is offered at each such sign-in until a handle is held, and to no one else.

  This is no longer provisional: DEC-230 (3) drew it, option (c). Test: a fake plane answering `handle: null` for the founder draws the step, and a chosen handle is sent. Controls: a member's session, and a founder holding a handle, never see it; "Later" sends nothing. *(not yet met: T49)*
- **R19** (T49; D23 **M**; K3324 (1); amends R12, R6) `/app/setup` reached by a signed-in member, or by an administrator who is not the founder, draws that reader's own state: that the group is set up, with a link to Home. It never draws `screen.setup.claimed`, "you are your group's first administrator", or any `admin` name. It offers "Show my recovery codes" (`recoverycodesissue`) only to the founder, and only before she has seen her codes. Test: a member opening setup sees her own state with no founder words and no codes act. Control: the founder at her first sign-in sees the claim's next step (`screens-entry/setup.mjs`). *(not yet met: T49)*
- **R20** (T49; N1100; DEC-246; amends R6, R15) Two setup states as DEC-246 draws them:
  - **The ten codes.** Shown once under `setup.codes.once`, with "Copy them" (`setup.codes.copy`, `cs.copy`) and "Save them as a file" (`setup.codes.save`, `cs.save`).
  - **State c, "Already claimed".** `setup.claimed.heading`, `setup.claimed.sub` and `refusal.ALREADY_CLAIMED`'s words, with "Sign in" opening `front`. It is drawn for a claim refused `ALREADY_CLAIMED` and for an unclaimed-looking visit to a claimed instance. It replaces `screen.setup.taken`.

  Test: both states over a fake plane. Control: the codes are drawn once and are in no storage (R8). *(not yet met: T49)*

**START must say:**
1. Measure first: the founder states `whoami` answers on a pre-T49 group and on a fresh claim, with T49-1 and T49-3 merged (`rootOfTrust`, `handle`). Then grep the module for `admin` reaching a reader (`setup.mjs`:4, :189–196; `words.mjs`:81).
2. Inherited reds: R9's design-file red, which this job clears (rule 5 (7)(B)); setup-words' dropped `signin.founderhint`, which this job clears (finding 10); coverage on R16–R20 and the re-worded R2, R4, R6 (5 (1)); legacy-ui's `{role}` sign-in tests (5 (4), N1057); the plane bundle (5 (5)).

---

## 6. screens-settings (T49-22)

Place under a new heading after R33: **T49 (T49-22)**. R34 is as drafted (fold §2).

- **R34** (T49; N1090; DEC-236 (B203); amends R27, R29, R30) `updates`' "Skip this version" sent without a reason is refused in place by `refusal.UPDATE_SKIP_NO_REASON`, and the row `screen.updates.skip.noreason` goes. `screen.members.count`, `screen.connect.way.field`, `.subscription`, `.apikey`, `.later` and `screen.updates.admins` are read by key in DEC-236's words, and their inline rows go. Test: a skip with an empty reason draws the refusal's words and sends nothing. Control: no `SCREEN_WORDS` row holds those keys. *(not yet met: T49)*
- **R35** (T49; D26 **M**; N1072; `membership` R144, R64, R86; `project-roster` R29; amends R29, R1) On `members`:
  - **Counts.** "Active members" counts the founder, once claimed, among the active members, so it is never fewer than the administrators it counts.
  - **The founder's row.** Her row is drawn whether or not the roster holds one, named by her handle, or by `member.founder.unnamed` (explained by `member.founder.unnamed.help`) while she has none. Never by `admin`.

  Test: a founder with no roster row and one roster member read "Active members: 2 · Administrators: 1", with her row drawn. Control: with a handle held, the row draws it. *(not yet met: T49)*
- **R36** (T49; D27 **M**; amends R30, R13) On `connect`, to an administrator, the screen points to the group's key on Members: a reference opening `members` at the group key's panel, with its card, by key (the words owed by the channel act; until given, this module's own row). R30's choice offers "My Claude subscription" only while `part_signin` answers `true` (R13). Otherwise it is not drawn, and "My own Claude API key" is preselected. Test: `part_signin: false` draws no subscription choice and preselects the key. Control: `true` preselects the subscription (DEC-156's order). *(not yet met: T49)*
- **R37** (T49; D30 **m**; amends R27, R4, R16) Two rules:
  - **Every fill filled.** Each sentence `updates` and `connect` draw is read by key with every `{fill}` filled from its read. No sentence is drawn with an empty or default fill: no "allowed by set at setup", no "you held the key".
  - **Translations' empty state.** `translations` with nothing to show draws its empty state by key, never a bare screen. The key is owed by the channel act; until given, this module's own row.

  Test: each over a fixture. Control: a filled `who` draws the member's handle. *(not yet met: T49)*
- **R38** (T49; N1100; DEC-246; `interface-shell` R69; amends R5, R24) Beside the code field, under `connect.ifnot`, `connect` draws the sign-in's refusals by their keys. These are `refusal.NO_SIGNIN_WAITING`, `refusal.SIGNIN_REFUSED` (with `{detail}`), `refusal.SIGNIN_UNAVAILABLE`, `refusal.SIGNIN_ADDRESS_UNEXPECTED`, `refusal.AGENT_WORKER_UNBOUND` and `instance.part.signin.absent`, each with its reference (`refusal.reference`, `interface-shell` R69). The `SCREEN_WORDS` rows R5 held for these codes go. R30's four words are R34's keys (finding 6). Test: each refusal over a fixture draws its key's words and reference. Control: the typed code is never drawn. *(not yet met: T49)*

**START must say:**
1. Measure first: on the local arm with T49-1 merged, what `memberlist`, `bootstrap` and `adminrecoverystep` answer for a fresh founder with and without a handle (`members.mjs`:66–68), and `part_signin` on the local arm.
2. Inherited reds: its design-file red, which this job clears (rule 5 (7)(B)); coverage on R34–R38 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START, and N1073's five test files.

---

## 7. screens-intake (T49-23)

Place under a new heading after R20: **T49 (T49-23)**.

- **R21** (T49; D9 **B**; K3324 (1); `capture` R86; `control-plane` R72; amends R2) An upload's answer (a provenance document, `capture` R86) is promoted as an information bundle at `collected`, exactly as R1 promotes `acquire`'s document (`allocid`, then `promote` with the same composition, R23's files included). Its refusals are drawn on the tab. "It waits in Held captures" is said only once that promotion answers. An answer with `existed: true` promotes nothing new. Test: an upload draws its document in `heldcaptures`. Control: a refused promotion draws its refusal and not "It waits". *(not yet met: T49)*
- **R22** (T49; D12 **M**; M-T49-5; amends R1, R2) `capture` opened with a project or a question as its subject (`/app/capture/<tab>?for=<id>`, from screens-inquiry R38) files what it captures there. The promoted bundle names that project in the field M-T49-5 finds the project's reads count (the question's project, for a question). The result offers "Cite a passage", which opens `find-in` over the document with the question chosen. Test: a capture from a question is held under the question's project (`heldcaptures` with `project`), and the project's Find counts it. Control: a capture with no subject is filed under no project. *(not yet met: T49)*
- **R23** (T49; D13 **M**; `ratification` R22's entry requirements; amends R1, R2, R4) Two rules:
  - **The bundle meets `verified`'s entry.** The bundle R1 and R21 compose carries every file `verified`'s entry requirements name: `data/dataset.json`, at least one file under `snapshots/`, and a well-formed `content_hash` (`ratification/release.mjs`:192–197). So `release` of a well-formed capture is not refused `ENTRY_REQUIREMENTS`.
  - **Refusals in words.** A held row's refusal (`eligible: false`, or a `release` refusal) is drawn by its words (`interface-shell` R61), never as raw catalogue text (`held.mjs`:21).

  Test: a captured address and an upload are each vouched for. Control: a crucial capture is still refused `CRUCIAL_IN_BATCH`, in words. *(not yet met: T49)*
- **R24** (T49; D22 **M**, its first half) The capture's result links the document it made: a reference to `document` at the bundle the promotion answered. Test: the result's link opens the document. Control: a refused promotion draws no link. *(not yet met: T49)*
- **R25** (T49; N1100; DEC-245, DEC-246; K3327 (BOB's: `capturerequest`'s `lead_inquiry`); `capture-requests` R48, `capture` R83; amends R1, R2) Two parts:
  - **"For which question".** Opened from a question, "From an address" draws "For which question" (`capture.forquestion`, help `capture.forquestion.help`), preset to that question and changeable among the questions the member may see (`cs.choice` over record data). Before `acquire`, the screen sends `capturerequest` with the address and `lead_inquiry` the chosen question, so the held row's `captured_for` names it. It is filed as R22 files it, and once vouched for it opens beside that question (DEC-245). The measure in START line 1 governs this clause (finding 7).
  - **Refusals beside the address.** `refusal.BAD_LOCATOR`, `refusal.SOURCE_REFUSED`, `refusal.FETCH_FAILED`, `refusal.EMPTY` and `refusal.TOO_LARGE` are drawn by key beside the address. An empty required field draws `capture.fieldneeded` with `{field}` its label. R1's own `screen.capture.refusal.*` rows go.

  Test: a capture from a question answers `captured_for` with that question. Each refusal draws its key's words. Controls: no subject, no request; an empty address draws `capture.fieldneeded`. *(not yet met: T49)*

**START must say:**
1. Measure first M-T49-5: which field places a promoted information bundle in a project (the project's Find's `captures`; `heldcaptures`' `project` through `provenance.homeOf`). Then measure whether a `capturerequest` with `lead_inquiry`, sent before an immediate `acquire` of the same address, is matched by `capture-requests` R48's reader to that capture. If either cannot be done from what the screen writes, stop: the provider line goes through BOB (P9) before this job builds R22 or R25.
2. Inherited reds: coverage on R21–R25 (rule 5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). None of rule 5 (7)'s reds is this module's. Rule 6 at START, and N1073's `common:121`.

---

## 8. screens-daily (T49-24)

Place under a new heading after R23: **T49 (T49-24)**. R30 and R31 are as drafted (fold's R25, R28), renumbered.

- **R24** (T49; D7 **B**; `citation` R14's `found` form; amends R5) On `find-in`, "Cite in the question" draws the choice "supports" or "against" (`role`, none preselected) beside each result. It sends `cite` with that `role`, and with the question and that question's project as `citation` takes them. It is refused in place until a role is chosen. Test: a cite sends `role: "supports"`. Control: with no role chosen, nothing is sent (`find-in.mjs`:223–231). *(not yet met: T49)*
- **R25** (T49; D11 **M**, D30 **m**, D31 **m**; amends R1, R9, R10, R23) Four rules:
  - **The title.** Home's blank start and "Start a project" write the project's `title` (`home.mjs`:318 writes `objective` only), so every screen reads it as the project's title.
  - **Door cards.** Each card draws its title and its description as separate elements.
  - **Counts.** Every count picks its singular or plural key ("1 question", never "1 questions").
  - **Closed doors.** Each closed door's button carries an accessible name.

  Test: each over a fixture. Control: a project started on Home draws its title on `project`. *(not yet met: T49)*
- **R26** (T49; D16 **M**; amends R5) `find-in` names its scope by the document's title, and each result by its document's title and its place in it, never by a digest or a 12-hex label. A testimony's page reaches `find-in` by a link (screens-inquiry R32), never by typing its address. Test: a scope and a result each draw a title. Control: no drawn text matches a 12-hex or 64-hex run. *(not yet met: T49)*
- **R27** (T49; D17 **M**; `agent-worker` R89; amends R6) `answers` draws a refusal of `ask` by its words (`interface-shell` R61), never "This could not be read". It draws an answer's `not_established` as the design does. Test: an `ANSWER_MALFORMED` refusal draws its words, and a `not_established` answer draws its sentences. Control: a full answer is drawn as before. *(not yet met: T49)*
- **R28** (T49; D21 **M**; amends R2, R17) Each `queue` and Home item names its subject by its title (a reference) and its act by the act's label (`act.<op>.label.queue`). Never a bare address with "Act on an item". Test: a to-do on a document reads the document's title and the act's label. Control: an item whose subject has no title draws `queue.source.untitled`. *(not yet met: T49)*
- **R29** (T49; D25 **M**; `project-roster` R26, R29; amends R10, R17) A project the member is invited to, as `projectlist`'s participation state answers (confirmed at START), is drawn on `projects` and in Home's "Needs you" with "Join" (`projectjoin`). The queue item for an invitation waits on a queue kind from the design stream (channel act). Test: an invited project offers Join. Control: a joined project does not. *(not yet met: T49)*
- **R30** (T49; N1091; DEC-237 (projects); `promotion` R19; amends R1, R10, R23) "Start a project", on `projects` and on Home's blank start, opens a form on press:
  - "What it is about" (`project.start.title`, help `.title.help`);
  - "Who can find it": `project.visibility.start.hidden` (preselected) or `.start.discoverable`;
  - `project.visibility.start.later`;
  - "Start the project" (`project.start.go`).

  The last sends `promote` with the title (R25) and the chosen `visibility` (absent meaning hidden), and opens the new project on success. `PROJECT_VISIBILITY_NO_OWNER` and `NAME_TAKEN` are drawn by their words. Test: choosing findable sends `visibility: "discoverable"`. Control: an untouched form sends hidden. *(not yet met: T49)*
- **R31** (T49; N1093; DEC-239 ("everywhere"); `action-producers` R1; amends R2, R17) A reply owed by another side whose date has passed is drawn as "no reply recorded", never "overdue": `action.noreply.title` with `{date}` in a row, and in Home's strip as a reading's label. The rows `screen.home.strip.overdue` and `screen.queue.due.overdue` go, and the strip counts no item as overdue. How a group's own passed date is drawn is owed by the design stream (channel act). Until it is drawn, such a date is drawn with its date and no word. Test: Home and the queue draw a passed reply as "no reply recorded". Control: no drawn text contains "overdue". *(not yet met: T49)*
- **R32** (T49; N1072; DEC-230 (4); `project-roster` R29; amends R10) `projects`' rows draw a member answered `founder: true, handle: null` by `member.founder.unnamed`, never by the member id (`project-rows.mjs`:64–65). Test: such a member draws "The group's founder". Control: no row draws `admin`. *(not yet met: T49)*
- **R33** (T49; N1100; DEC-245; amends R10, R12) `projects` with no project draws its designed empty state: `projects.empty.sub` and `projects.empty.note`, with "Start a project" (R30) below. The new project's first question is the project page's (`screens-inquiry` R43; finding 4). Test: no project draws the empty state and the act. Control: one project draws its row and no empty state. *(not yet met: T49)*

**START must say:**
1. Measure first: confirm `projectlist`'s participation state for an invited member (R29). Confirm `citation`'s `found` form takes the question and its project, not the question twice as `find-in.mjs`:229 sends it. Confirm which record field `project.mjs`:93 reads as the title.
2. Inherited reds: coverage on R24–R33 (rule 5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). None of rule 5 (7)'s reds is this module's. Rule 6 at START, and N1073's `contract:123`.

---

## 9. screens-inquiry (T49-25)

Place under a new heading after R22: **T49 (T49-25)**. R23–R31 are as drafted (fold §1, §3, §6), with cross-references renumbered: project-roster R30 (not R32), the founder by its R29 (not R31). "Doubt 9" becomes "the channel act". `owed:versionconsider` becomes `versionconsider` (plan rule 7).

**The question page (N1089, DEC-235)**
- **R23** (T49; N1089; DEC-235 (1), (3); DEC-32 clauses 2, 4, 5; `inquiry` R27, R28; amends R2) On `question`, each passage cited in Supports carries, beneath it, what the member answered for it. It reads `question.falls` ("If this turned out to be wrong: your answer falls"), or `question.holds`, with `{others}` filled by the passages named as holding it up. These answers are read from the inquiry's partition (its grounds). While the question cites at least one passage and its document carries no partition, the page draws **state b**:
  - `question.ask.first.title` and `question.ask.first.says`. No strength mark and no strength sentence are drawn in state b (clause 5).
  - "What each passage carries" (`question.ask.title`, explained by `question.ask.help`), with one `question.ask` choice per cited passage (`question.ask.no` / `question.ask.yes`, a radio group, none preselected).
  - For "yes", `question.ask.which`: the member ticks among the other cited passages.
  - Beneath, the read-back in R24's two shapes, then `question.rests.readback`.
  - "Save the answers" (`question.ask.save`) sends `inquiryground` (`inquiry.ground`) with a partition. In it, each passage answered "No, my answer falls" is a part of its own. The passages the member names as holding each other up are one part together. Each part's `statement` is left empty.

  Until the member saves, every passage counts as one the answer cannot do without (clause 4), and nothing on the page says otherwise. No drawn word is AND, OR, or a word `strength` R28 forbids. Refusals are drawn by their words (`interface-shell` R13). Test: a question with three cited passages and no partition draws state b with no strength mark. Saving sends the partition the answers give. Control: a question with a partition draws state a. *(not yet met: T49)*
- **R24** (T49; N1089; DEC-235 (2); DEC-32 clauses 3, 5, 6; `inquiry` R28; `strength` R11, R12; amends R2) Under Supports, once the question has a partition, "What your answer rests on" (`question.rests.title`) reads the partition back:
  - `question.rests.any`, listing each part of one passage, and each part of several passages as `question.rests.all` with `{passages}`;
  - one `question.origin.shared` line for each pair of parts that `partitionindependence` (`strength.partitionIndependence`, for the reading shown, R25) answers as sharing an origin, with `{passages}` and `{origin}` filled from its `shared` entries. An origin named `undetermined` is drawn as undetermined, never as independence, and `complete: false` is said;
  - `question.rests.set` with who set it and when, from the grounds' `asserted_by` and `at`;
  - each later change as `question.rests.changed`: who, when, the reason, and the strength before and after, as the inquiry's Session Log records them (`inquiry` R28);
  - "Change what a passage carries…" (`question.rests.change`) reopens R23's questions in place. It sends `inquiryground` with the member's reason, since the strength is already shown (`NO_REASON`, `inquiry` R27).

  Test: a partition of one single part and one two-passage part reads back in both shapes. A shared Public Works origin draws its line. Control: `partitionindependence` answering no shared origin draws no such line. *(not yet met: T49)*
- **R25** (T49; N1089; DEC-235 (4); DEC-40; `basis-versions` R4, R8–R15; `strength` R7, R8; amends R2) **Readings.**
  - **The chooser.** Supports opens with "Reading shown" (`question.reading.shown`, explained by `.shown.help`), a `cs.choice` over the readings `basisversions` answers (record data). It defaults to the reading the screen's project stands on (`current`, read with `project`), else the first accepted one. The passages of Supports, and R24's read-back, are drawn as the chosen reading counts them.
  - **The section.** "Readings" (`question.readings.title`, explained by `.readings.help`) lists each reading that is neither hidden nor rejected, with:
    - its name and description;
    - its state: `question.reading.accepted` (`state_by`, `state_at`), `question.reading.weighing` (with its reason), or `question.reading.suggested`. A reading a machine authored is drawn `mark.origin.machine`, and only while the assistant is reachable (`interface-shell` R20);
    - its strength from `versionstrength` (`strength.versionStrength`) with that `version`. An accepted reading is drawn as `question.reading.strength`. Any other reading is drawn as `question.reading.whatif`, its `states` naming the reading's own state, so the answer is a what-if (`strength` R8). Two grades, never one figure;
    - `question.reading.standson` for the screen's project's CURRENT;
    - its acts: `versionaccept` "Accept", `versionconsider` "Weigh it…", `versionreject` "Reject…", `versionrevert` "Undo the decision…", `versioncurrent` "Stand on this one for {project}…" and `versionhide` "Hide". Stand on is sent with `project`, and offered only on an accepted reading, to a member joined to the project (`basis-versions` R13). Weigh it, Reject, Undo and Stand on each take the member's reason (`basis-versions` R4, R12).
  - **Rejected and hidden.** A line `question.readings.more` with the counts of rejected and hidden readings shows them on press. A hidden reading is still listed then (`basis-versions` R9: never deleted).
  - **Refusals.** Each act's refusal is drawn by its words, `VERSION_AFFIRMATION_INCOMPLETE` among them. The affirmation is asked in the channel act.

  Test: three readings drawn with their states, one a what-if, and "stands on" on the project's CURRENT. Each act sends its op with the version. Control: a machine-authored reading is not drawn while the assistant is not reachable. *(not yet met: T49)*
- **R26** (T49; N1089; DEC-235 (5); K960; `connections` R20; `basis-versions` R11) "What relies on this" (`question.relies.title`, explained by `.relies.help`) reads `backlinks` (`connections.backlinks`) for the question and draws each citing bundle as a reference (`interface-shell` R16):
  - a project as `question.relies.project`, `{reading}` the name of the reading it stands on (`basisversions` with that `project`), or no reading named when it stands on none;
  - any other bundle as `question.relies.cites`, `{kind}` its type's word.

  When the answer carries `out_of_view: true`, the section ends with `question.relies.outofview`, and nothing says what or how many. The section is not drawn when nothing is answered and `out_of_view` is not true (R20). Test: a project, a question and a published case are each drawn. `out_of_view: true` draws the sentence. Control: with `out_of_view` absent, the sentence is not drawn. *(not yet met: T49)*

**The project page (N1091, DEC-237; N1078)**
- **R27** (T49; N1091, N1078; DEC-237 (1); `interface-shell` R66; amends R18) On `project`, "This project's work" (`project.work.title`, explained by `project.work.help`) links the project's `plan`, `timeline`, `money`, `calculation`, `proceeding` and `standard` screens as the kit's reference links, each with its card `shell.card.<kind>`. A kind the project has none of, as the screen's reads answer, is not listed, and the section is not drawn when none is listed. On `question`, Concluding links "The case being prepared", "Review copies", "Publishing" and "The published case's record" (`case.links.editor`, `.review`, `.ceremony`, `.docket`; cards `shell.card.case-editor`, `.review-copy`, `.ceremony`, `.docket`) with the question's case as subject. Each is drawn only where a read names such a case (R18's rule). This replaces R18's interim drawing. Test: each link and card. Control: a project with no plan lists no plan. *(not yet met: T49)*
- **R28** (T49; N1091; DEC-237 (2); `project-roster` R8, R22; `membership` R45) On `project`, "Who can find it" (`project.visibility.title`):
  - It reads `projectvisibility` and draws the setting as `project.visibility.hidden` or `.discoverable`.
  - Its history follows, newest first, each record as `project.visibility.history` (the change, who, when, the reason), ending with `project.visibility.started`.
  - "Change who can find it…" (`projectvisibilityset`, reasoned) is offered to an owner only.
  - A refusal is drawn by its words: `PROJECT_SCOPE_KEEPS_HIDDEN` (a member's own project, or one kept for counsel) or `PROJECT_VISIBILITY_NOT_THE_OWNER`.

  Test: a project made findable draws its history, and an owner sees the act. Control: a member who is not an owner does not see it. *(not yet met: T49)*
- **R29** (T49; N1091; DEC-237 (3); `project-roster` R3, R4, R7, R29, R30; `membership` R35, R36, R38; `promotion` R41–R44; amends R1) On `project`, Members draws one row per participant, with role (`project.member.owner` / `.member`) and date (`project.member.since` / `.joined`). The founder is named as `project-roster` R29 answers her, and by `member.founder.unnamed` while she has no handle (R40). The row's acts are:
  - for an owner's own row, "Stand down as owner…" (`projectownerremove`, reasoned);
  - on a member's row, to an owner: "Make an owner" (`projectowneradd`) and "Remove from the project…" (`projectremove`). Its reason is asked and shown, and not refused when empty, as `membership` R36 has it.

  Each change waiting on owners (`projectownervotes`, `project-roster` R30) is drawn as `project.owners.pending` or `.pending.remove`. To an owner who has not agreed, it offers `project.owners.agree` (the same act, sent by her). The rule is one line, `project.owners.rule`. A `CONSENSUS_REQUIRED` answer redraws the pending line from its `have` and `awaiting`.

  Beneath the rows:
  - "Invite a member to the project" (`projectinvite`);
  - "Join" (`projectjoin`, as R1);
  - "Ask to leave this project" (`projectleave`);
  - "Start a project from this one…" (`projectfork`), with the new title and the visibility (hidden preselected), opening the new project on success.

  Test: three owners with one change agreed by one draw "waiting for" the other two. Control: a non-owner sees no owner act. *(not yet met: T49)*
- **R30** (T49; N1091; DEC-237 (4); K2578, K2782; `project-roster` R5, R22) **State c.** An administrator opening a hidden project at its existence only, whose owners are all inactive, sees:
  - `project.rescue.title` with the date, and `project.rescue.says` with `{owners}`;
  - "Why", explained;
  - "Become its owner" (`projectownerrescue`, reasoned, naming herself);
  - `project.rescue.own`.

  Nothing else of the project is drawn. `PROJECT_SCOPE_OWN` and `OWNERS_ARE_ACTIVE` are drawn by their words. Test: the rescue drawn at existence. Control: a project whose scope is `own` is refused and drawn by its words. *(not yet met: T49)*

**Read in my language (N1094, DEC-240)**
- **R31** (T49; N1094; DEC-240 (N670); DEC-232; `plane` R50) On `question`, "Read in my language" (`translate.read`) sends `readtranslate` with `subject` `{kind: "question", id, project}`. The answer is drawn in place, labeled `translate.label` (`{language}` the original's) and explained by `translate.label.help`, with "Show the original" (`translate.original`) and back (`translate.back`). Nothing is saved. No control is drawn on a document or a passage (R50's kinds only). `LANGUAGE_NOT_SET` and the AI refusals are drawn by their words. The control is drawn only while the assistant is reachable (`interface-shell` R20). N670's R88 is not touched. Test: the act sends the question as subject, and the original returns by one press. Control: no control on a passage. *(not yet met: T49)*

**Text to write**
- **R32** (T49; N1077, DEC-229; D15 **M**; amends R3) **The document page.**
  - **Acts and reads.** Its acts gain `adoptversion`, `keepversion`, `connectionchoose` and `explore`. Its reads gain capture R57's `links`, connections R24's `links_to` and connections R4's `on_point`.
  - **The grade.** It is the capture's own grade object, drawn as one mark (R5), never "Unrated" beside a B note.
  - **"Its versions".** It draws its refusal by its words (`interface-shell` R61).
  - **The address.** It is drawn as an outside link, unquoted.
  - **The title.** It is the document's title, never the address's last segment.
  - **A testimony.** It offers `find-in` (a link, `screens-daily` R26) and its words, and offers neither `monitorset` nor `monitor`.
  - **Times.** They are drawn by `cs.date`, never in ISO form.

  Test: each over a fixture. Control: a capture graded B draws B. *(not yet met: T49)*
- **R33** (T49; D3 **B**, D18 **M**; amends R6's K3003 clause, R13, R4) **The dock** (finding 3).
  - **Bounds.** `airunopen` is sent with the bounds the run's mode needs, as the plane states them for that mode. It sends no zero `fetches` or `subsessions` allowance for a mode that uses them. R6's "`fetches` 0, `subsessions` 0" is retired.
  - **Not started.** An answer of `started: false` is a refusal, drawn by its words, and `airundispatch` is not called after it.
  - **Withheld.** A dispatch answered withheld (`AGENT_WORKER_UNBOUND`, `MEMBER_PRINCIPAL_RUN` and the rest) is drawn with its reason by key, never blank. The withheld reasons' keys are owed by the channel act; until given, this module's rows.
  - **Running.** "A run of yours is working on this" is drawn only while a dispatched run is running, as the last `airun` read answers it (R8).

  Test: over a fake plane running `run-rules`' check, `airunopen` is not refused `AI_RUN_BOUND_NO_ALLOWANCE`. Controls: `started: false` sends no dispatch; a withheld dispatch draws its reason. *(not yet met: T49)*
- **R34** (T49; D14 **M**; amends R2) Supports lists every passage the question cites, from the inquiry's own cited legs, whether or not any reading exists (today it reads `basisversions` alone, `question.mjs`:160–196). The strength sentence is drawn by its words, never as raw grade text. Test: a question with two citations and no reading lists both. Control: a severed leg is drawn severed (R12). *(not yet met: T49)*
- **R35** (T49; D8 **B**; amends R2) Concluding offers `conclude` once the question's project stands on an accepted reading (R25's `versioncurrent`), carrying that reading. Until then it draws `question.empty.conclude` (or its successor key): what is owed first, accepting a reading and standing on it. So `NO_CLAIM` is never the first a member learns of it. The form is R41's. Test: before a reading stands, no `conclude` is offered and the sentence is drawn. Control: after `versioncurrent`, `conclude` is offered. *(not yet met: T49)*
- **R36** (T49; D19 **M**; amends R2, R1) After `planopen`, the question links its plan by name, a reference opening `plan`, never "Its screen comes later". The project lists its plans (R27). Test: `planopen` then a plan link. Control: no plan, no link. *(not yet met: T49)*
- **R37** (T49; D32 **m**; amends R14) `projectai` opened by a member not joined to the project draws the not-joined state by key, with "Join" where she may (`projectjoin`). It never draws "What pays" failed with "No project answers to that id". Test: a non-participant sees the state. Control: a joined member sees the panel. *(not yet met: T49)*
- **R38** (T49; D12 **M**, its half; `screens-intake` R22) `question` and `project` offer "Add a document" (`question.empty.capture` on an empty question), opening `capture` with that subject (`screens-intake` R22). Test: the link carries the subject. *(not yet met: T49)*
- **R39** (T49; D11 **M**, its half; amends R1, R2, R14) No screen of this module draws a record id as a title (project, question, `projectai`, and `find-in`'s project). The title is read from the record (`screens-daily` R25), and a record with none draws `state.undetermined`. Test: no heading matches `PROJ-`, `INQ-` or `INFO-`. *(not yet met: T49)*
- **R40** (T49; N1072; DEC-230 (4); `project-roster` R29) `project`'s participants, and any `{member, handle}` this module draws, draw `founder: true, handle: null` by `member.founder.unnamed`, never `admin`. Test: the unnamed founder drawn. Control: with a handle, the handle. *(not yet met: T49)*
- **R41** (T49; N1100; DEC-245; `basis-versions` R12, R16–R20; amends R2, R4) The question's states as `SCR.question` draws them (`Q_ST`):
  - **c, new and empty:** `question.empty.heading` and `.note`, with "Capture a document for it" (R38), "Find one the group already holds" (`search`) and "Ask the assistant to look" (`airunopen`, only while reachable);
  - **d, the assistant at work:** machine work, "You can leave this page…", and "Stop the run" (`airunclose`);
  - **e, its proposal:** `question.proposal.heading`, the reading and the passages it rests on, marked machine work. "Accept this reading" (`versionaccept`) or "Decline…" (`versionreject`, reasoned);
  - **f, its limit:** `ai.refused.limit.overall`'s words with `question.limit.note`, naming no cost;
  - **g, concluded:** `question.concluded.by` (who, when), the reading's words, `question.concluded.falsifier`, its strength, "Withdraw the conclusion…" (`withdrawconclusion`) and "Plan what to do" (`planopen`).

  State a's "Conclude" is a form: "The reading you conclude on" (`question.conclude.reading`), "What would change it" (`question.conclude.falsifier`, required, or `question.conclude.nofalsifier`, R16), and "Commentary" (`question.conclude.commentary`, marked not evidence). It is sent by a member, never the assistant.

  Test: each state over a fixture. Control: an empty falsifier with the box unticked sends nothing. *(not yet met: T49)*
- **R42** (T49; N1100; DEC-246; amends R4, R7) The dock, and the question's state f, list under "Other reasons the assistant can't work here", each by key: switched off, kept away, no account, not installed, and whose account serves the member (R4's `ai.account.*`). On a test instance the proposal names `ai.label.untested` (R7). The dock says which account serves the member. Test: each reason over a fixture. Control: a reachable assistant draws none. *(not yet met: T49)*
- **R43** (T49; N1100; DEC-245; amends R11; moved here from `screens-daily` R33, finding 4) `project` with no question (state b) draws "Your first question" (`project.firstquestion`, help `project.firstquestion.help`) before "Open a question". The act sends `promote` and then `drawquestion` (R11) with the member's words as the question's title, and opens the new question. Test: a new project's first question is opened and listed. Control: a project with questions draws no state b. *(not yet met: T49)*

**START must say:**
1. Measure first: re-measure the module (1,723 lines). It grows most, to about 3,000 lines estimated. If it is past ~4,000 before its work, BOB splits it first (P6). Read from the plane the bounds a `check` and a `plan` run need (`run-rules`), for R33.
2. Inherited reds: R5's design-file red, which this job clears (rule 5 (7)(B)); coverage on R23–R43 and the re-worded R6 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START, rule 6's D29 check on every `ok: true` it draws, and N1073's `common:23`, `projectai:39` and `question:65`.

---

## 10. screens-investigate (T49-26)

Place under a new heading after R26: **T49 (T49-26)**. R27 and R28 are as drafted (fold's R28, R29). The fold's R27 (the unnamed node) is left out (N1086).

- **R27** (T49; N1090; DEC-236 (B204 (3)); `affordances` R60; amends R18, R24) The graph draws a `step_source` step in its own class (`.e-step_source`, a bold line), named by `connection.kind.step_source.name` ("Stated in a source") and explained by `.means`. `explore`'s "Follow" offers six groups: R24's five and "Stated in a source", which sends its kinds by `affordances` R60's group. Test: ticking "Stated in a source" sends exactly its kinds. Control: "Mentioned together" sends no `step_source` kind. *(not yet met: T49)*
- **R28** (T49; N1094; DEC-240 (proceeding); DEC-232; `following` R30; amends R6) On `proceeding`, "Dates" (`proceeding.dates.title`, explained by `.dates.help`):
  - It reads `proceedingdates` and draws `proceeding.dates.stage`.
  - It draws two lanes, `proceeding.dates.lane.proceeding` and `.lane.group`, never interleaved, each date by `cs.date`.
  - With no dates, it draws `proceeding.dates.none`.
  - Nothing is drawn as late.

  Test: two lanes over a fixture. Control: a body's own deadline is never in the group's lane. *(not yet met: T49)*
- **R29** (T49; D30 **m**; amends R2) `explore` opened with no centre draws its sentence by key, never "no centre is named…". The key is owed by the channel act; until given, this module's own `SCREEN_WORDS` row in plain words. Test: a bare `explore` draws the keyed sentence. Control: with a centre, the graph. *(not yet met: T49)*

**START must say:**
1. Measure first: whether `affordances` R60's merged vocabulary answers `step_source` in its own group on the composed plane (T49-14 merged), and the module's size (2,559 lines).
2. Inherited reds: R10's design-file red, which this job clears (rule 5 (7)(B)); coverage on R27–R29 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START, and N1073's `common:23`.

---

## 11. screens-publish (T49-27)

Place under a new heading after R21: **T49 (T49-27)**. Both lines are as drafted (fold's R23, R24). The fold's R22 (the imported list) is left out (N1087).

- **R22** (T49; N1094; DEC-240 (P1); `public-read` R1, R3; amends R6, R19) On `published`, "Check a file you hold" (`published.check.title`, explained by `published.check.help`):
  - a field "Its SHA-256" (`published.check.field`, help `.field.help`), 64 hexadecimal characters, case-folded;
  - "Check it" (`published.check.go`), which sends `verify` with it as a public op with no `Authorization` header.

  A match in this edition reads `published.check.yes`, with `{n}` and `{finding}` from `publishedcase` read by that `sha256`. No match reads `published.check.no`. No file is read or sent: the page takes the fingerprint only. R19's "the Verify any hash panel is not drawn" is retired. Test: a pinned evidence hash draws the finding. Control: an unknown hash draws `.no`, and no request carries anything but the hash. *(not yet met: T49)*
- **R23** (T49; N1094; DEC-240 (C2); `case-inputs` R1, R5; `review` R15, R28; amends R17) On `review-outside`, "What the case says it does not cover" (`review.statement.title`, explained by `review.statement.help`) draws the group's statement from `reviewcopy`. Beneath it are "Your note" (`review.statement.note`, help `.note.help`, required) and "Acknowledge it" (`review.statement.ack`). That act sends `statementack` with the draft, the note as `reason`, and the grant's secret through the grant door as `reviewcomment` sends it, never in an address. `STATEMENT_ACK_NO_REASON` and the dead answer are drawn by their words, and the note is kept. A copy whose statement is absent draws no section. Test: the acknowledgement sends the note and the secret in the body only. Control: an empty note is refused, and nothing is sent. *(not yet met: T49)*

**START must say:**
1. Measure first: that `verify` and `publishedcase` by `sha256` answer as R22 reads them on the composed plane, and that `statementack` is admitted at the grant door (`control-plane` R20).
2. Inherited reds: R10's design-file red, which this job clears (rule 5 (7)(B)); coverage on R22–R23 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START, and N1073's `common:17`.

---

## 12. screens-action (T49-28)

Place under a new heading after R14: **T49 (T49-28)**. R15–R17 are as drafted (fold §2, §5). The fold's R18 (the no-reply question) is left out (DEC-239's `actioninquiry`).

- **R15** (T49; N1090; DEC-236 (B203); amends R13) On `plan`, "Ask the assistant for options" is explained by `act.planask.does`, never `act.optionpropose.does`. Test: the help drawn is `act.planask.does`'s. *(not yet met: T49)*
- **R16** (T49; N1093; DEC-239 (1); `actions` R18, R25; `action-records` R1; amends R5) On `action`, "The law it goes under" (`law.title`, explained by `law.help`):
  - **The law chosen.** It draws the action's `governing_laws` from `action`: each law by level and citation, with its window as `action` answers it, then `law.stated` (who, when). An undetermined list is drawn as `law.undetermined`.
  - **Change the law.** "Change the law…" (`law.change`) sends `actionlaws` with the laws chosen from those the group's places name.
  - **The proposals.** "Proposed, not chosen:" (`law.proposed`) lists each of `governing_laws_proposals` as `law.proposal.not` (who, when).
  - **Propose.** "Propose another law…" (`law.propose`) sends `actionlawspropose`.

  Refusals are drawn by their words. Test: a stated law and one proposal drawn apart. Control: a proposal is never drawn as the law. *(not yet met: T49)*
- **R17** (T49; N1093; DEC-239 (2); `actions` R23–R25; `action-records` R2) On `action`, "Its risk" (`risk.title`, explained by `risk.help`):
  - **The tier.** It draws `risk_tier` as `risk.tier` with the tier's own words, `risk.tier.1`, `.2`, `.3` or `risk.tier.undetermined`, read by key in place of `RISK_TIERS`' English.
  - **Its history.** The latest history entry is drawn as `risk.set` (who, when, the reason, the prior tier's words).
  - **Revise.** "Revise, with a reason…" (`risk.revise`) sends `actionrisktier` with the tier and the reason.
  - **The proposals.** A machine proposal in `risk_tier_proposals` is drawn only while the assistant is reachable, under "Proposed, not set:" (`risk.proposed`), each as `risk.proposal` with `risk.proposal.not` and `mark.origin.machine`. A member's proposal is drawn there whether or not the assistant is reachable.

  `RISK_TIER_UNCHANGED` and the others are drawn by their words. Test: tier 2 with its history, drawn by key. Control: a machine proposal is not drawn while the assistant is unreachable. *(not yet met: T49)*
- **R18** (T49; D5 **B**, its half; D20 **M**; `ai-runs` R81; amends R13, R1) On `plan`, four rules:
  - **The run.** `planask`'s refusal is drawn by its words. "The assistant is looking for options" is drawn only while its run is running, as `airun` answers it. An answer of `ok: true` that carries `started: false`, `dispatched: false` or `withheld` is drawn as its refusal (rule 6).
  - **Titles.** The plan names its project and question by their titles, each a reference, never `INQ-…` or `inquiry:INQ-…`.
  - **References.** A reference is picked from a list the record answers (`cs.choice` over record data), never typed.
  - **Categories.** These are drawn by their words, never as lowercase codes.

  Test: each over a fixture. Control: a running plan run draws the sentence, and an ended one does not. *(not yet met: T49)*

**START must say:**
1. Measure first: with T49-8 merged, `planask` for a project's owner and a joined member on the composed plane (D5's other half), and what `plan` answers for its project and question (titles or ids).
2. Inherited reds: R1–R6's design-file reds, which this job clears (rule 5 (7)(B)); coverage on R15–R18 (5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 6 at START, and N1073's `matter:39`.

---

## 13. site (T49-31): `build/requirements/site.md`, the whole file

```markdown
# site — requirements

**Status** · New in T49 (T49-31; K657, K1043; registered at T49's opening act, layer 11 after `installer`, `uses` empty): a module built fresh, carrying civicsmith.org as the design stream draws it (N1011; DEC-206, DEC-223; Bob's K3060 D6, D14, K3296). Drafted in `build/plan/draft-T49-fold-L11-b.md` §13, worded here by BOB (P5). Not yet met (T49).

**Size (P6).** Estimated 400–700 lines of code and generated text, plus the visual language's files as generated data; measured at its START (K617).

## Public

### Purpose

Civicsmith's own website, civicsmith.org, kept by its stewards: what Civicsmith is, how a group starts its own, and the groups that chose to be listed. A static Cloudflare Worker that serves fixed pages and files. It holds no accounts, reads no group's record, sends nothing anywhere and stores nothing.

### Provides

**The Worker: `fetch(request, env)`** (a Workers module's default export)

- **R1** (DEC-223) **Three pages joined by one menu.** `GET /` serves "What Civicsmith is", `GET /start` serves "Start a group", and `GET /groups` serves "Groups at work". Each is one HTML document, and each opens with the same menu (`mk-sitenav`: the three pages in that order, the current one marked `aria-current="page"`) under the wordmark. `HEAD` answers as `GET` with no body. Any other path answers 404 with a page in the same frame and a link to `/`. Any other method answers 405. Test: each page and its marked menu item. Control: `/nonesuch` answers 404 with the link.
- **R2** (DEC-206 (1), DEC-223; `installer` R42) **The front page** draws, in the design's order: "Hold your government to its own word" over the design's two lines, exactly (`SITE_LINE1`, `SITE_LINE2`); "Start a group's Civicsmith" (to `/start`) and "See what groups have published" (to `/groups`); "How a group uses it" (five steps); "What a group gets"; "What Civicsmith does not do"; "One group's work" (R5); "Already a member of a group?" (civicsmith.org holds no accounts); and "Questions" (R6). Test: the page against the design's state `a`, element by element. Control: no form and no field is drawn.
- **R3** (DEC-206 (2), DEC-223) **Start a group** draws, in the design's order: "Is it right for your group?"; "What you need"; "Decide first: who holds the Cloudflare account"; "What happens, step by step"; and "What it costs". Then come "Create your group", a link to the installer's address (R7), and "Back to the front page". Test: the page against the design's state `b`. Control: "Create your group" opens exactly `INSTALLER_ADDRESS`.
- **R4** (DEC-206 (3), DEC-132 (3), DEC-223) **Groups at work** draws the heading and its sentence, then one row per group in `LISTED_GROUPS`, in its order. Each row has the group's name, its place, its focus and its published cases as listed, and "Visit" linking the group's own public page. Then comes the note that a group chooses whether it is listed. With no group listed, the page draws its empty state (the heading, its sentence, the note, and no rows), never a sample group. Test: two listed groups draw two rows. Control: an empty list draws no row and no made-up group.
- **R5** **One group's work.** The front page's section is drawn only while `FEATURED_CASE` names a real published edition: its title, edition, group, signer and date, linking that edition's public page (`/app/published/<case>` on the group's own address). Otherwise the section is not drawn. Test: a set value draws its row and link. Control: `null` draws no section.
- **R6** (K3060 D14; N923, K2799) **The stewards' address** is one marked value, `STEWARDS_ADDRESS`, drawn in "Questions" as a `mailto:` link. While it is unset, the page draws the design's marked placeholder, and the Worker answers every page with a header saying it is not yet public (`X-Robots-Tag: noindex`). It does not go public without the address (K3296). Test: unset draws the placeholder and the header. Control: set draws the link and no header.
- **R7** **The installer hand-off.** `INSTALLER_ADDRESS` is one value, the `https:` address of the released installer's first page (`installer` R50), set at deploy. "Create your group" is a plain link to it in the same browsing context. Nothing about the visitor is passed: no query, fragment or referrer (`Referrer-Policy: no-referrer`). Test: the link equals the value. Control: the link carries no query or fragment.
- **R8** (DEC-122 (3), principle 9.6) **Served from itself.** Every page links only the site's own stylesheet and icons (`/assets/…`, from R9). It loads no resource from another origin and runs no script, and every response carries a `Content-Security-Policy` of `default-src 'self'` with no script source. Test: a scan of every page finds no outside `src`, `href` for a resource, `@import` or `url()`, and no `<script>`. Control: the outside links drawn (the installer, a group's page, `mailto:`) are anchors only.
- **R9** **The text and the look are the design's, at a named commit.** `SITE_COMMIT` names the `main` commit the pages are generated from (`f498560a37`, or a later `main` commit named at START). Two things come from it:
  - **The pages.** Each page's words and structure are `mock-screens.js`' `SCR.site` at that commit (states `a`, `b` and `c`), with the mock's controls removed (`mk-mockctl`, the `onclick` page switching), the menu's links made real (R1), and R4's to R7's values put in place of the mock's samples and placeholder.
  - **The look.** The stylesheet holds the visual language's rules (`civicsmith.css`) and the design page's rules the pages draw (`mk-sitenav`, `mk-setuphead`, `mk-wordmark`, `mk-list`, `mk-acts`, `mk-links`), with the faces and icons, read at that commit.

  Both are generated, never edited by hand, and a later design is a re-generation. Test: each page against the design's drawing of its state at `SITE_COMMIT`, at 1280 and 390 px, pair by pair (`journey-check` R6's method). Control: no page is wider than the viewport at 390 px.

## Private

### Uses

None. It imports nothing from another module. Its tests read the design's files at `SITE_COMMIT` from git, as `interface-assets`' do.

### Invariants

- **R10** No request is logged, counted or stored, and no cookie or browser storage is written: the site holds nothing about who visited (K1888). Test: no `Set-Cookie`, and no binding beyond the Worker's own.
- **R11** No place is named in the site's code or its behaviour. A place appears only in the design's own words (the installer's step that lists the places ready now) and in the listed groups' data (R4) (`build/requirements/README.md` rule 7).

### Satisfies

- N1011; DEC-206 (1)–(3), DEC-223 (R1–R4); DEC-132 (3) (R4); Bob's K3060 D6 (the founding journey starts on civicsmith.org) and D14 (the stewards' address, R6); K3296 (built and tested before Bob's domain is set up); DEC-122 (3) and principle 9.6 (R8).

### Suggestions

- **Deployment.** It is a static Worker on Believe in Oakland's Cloudflare account (`20b533579290b9b93168345edd3b7f72`), on its `workers.dev` address until Bob's domain is set up (K3296). Each deploy is Bob's approval in session (K1715). `STEWARDS_ADDRESS`, `INSTALLER_ADDRESS`, `FEATURED_CASE` and `LISTED_GROUPS` are plain-text bindings or a data file set at deploy, never secrets.
- **Generation.** A script beside the module (not imported, so not bundled) turns `SCR.site`'s three states into the pages, and reuses `interface-assets`' transform for the stylesheet. Its header names R9 and its test.
- **Listed groups.** Until a directory exists, the stewards keep `LISTED_GROUPS` by hand from groups' submissions (`network-notices` R23), each with the group's consent as it chose (DEC-132 (3)).
- **Tests.** Under Miniflare, as `journey-check`'s local arm runs the installer; the design pairs as `journey-check` R6 makes them.
```

**START must say:**
1. Measure first: `SCR.site` at the named commit (three states, every class it draws, and whether `shell.css`' rules cover them). Ask BOB for the four values' first settings: the installer's released address, `FEATURED_CASE` (`null` until a group publishes), `LISTED_GROUPS` (`[]`), and the stewards' address (unset, Bob's, N923). Measure the generated size.
2. Inherited reds: coverage on R1–R11 (rule 5 (1)); `membership` R145's `MODULE_ORDER` tolerates `site` as not yet built until this merge, with its `paths` (R140's form). No other rule 5 red is this module's.

---

## 14. journey-check (T49-32)

Place under a new heading after R6: **T49 (T49-32)**. R7 is the N1072 draft's R5, renumbered, with DEC-230's exception (finding 9).

- **R7** (T49; N1072; K3265, "never shown"; DEC-230 (3)) A walk through every screen, signed in as the founder with a handle held and with none, finds no drawn text naming `admin` as a person's name or handle. There is one exception: DEC-230's step for a founder with no handle (`founder.handle.says`, `founder.handle.later.help`), which says she signs in as admin until she chooses. Test: the walk as stated. Control: a screen fixture drawing `admin` as a name fails it. *(not yet met: T49)*
- **R8** (T49; D29 **M**; amends R2) A step fails on a refusal carried inside an HTTP 200, anywhere in its answer, where the step expects success. That is `ok: false` at any depth, or `started: false`, `dispatched: false`, `found: false` or `withheld` (`walker.mjs`:73 reads only the top level). The refusal a step expects is excused by its code wherever it sits. Test: fixtures of D1's, D3's and D5's answers each fail the step. Control: the expected refusal of a step that tests a refusal passes. *(not yet met: T49)*
- **R9** (T49; K3320, K3324 (2); amends R1 (a)) **The journey as administrator**, each step through the screens' own controls only, with ops called only to observe:
  1. claim with her own handle, and sign in by it;
  2. start a project with a title, and open it;
  3. open a question in it (its first question, `screens-inquiry` R43);
  4. connect an assistant by API key on `connect`;
  5. capture by address into the question (from its "Add a document"), and capture by upload into the question;
  6. see both held, and vouch for one;
  7. open the document, see its words, and Find-in a passage;
  8. cite it with a role (supports);
  9. run the assistant on the question from the dock;
  10. read its run's answer and its suggested reading;
  11. Ask, and read the answer;
  12. accept a reading, stand on it for the project, and conclude.

  Each step asserts what the design says the screen then shows, and the walk fails on any refused or missing step (R8). *(not yet met: T49)*
- **R10** (T49; K3320, K3324 (2), (3); `ai-runs` R80) **The same journey as a member** invited to the group and joined to the project. She is on her own API key, with her own run dispatched on that key, and with `projectai`, plan help (`planask`) and Ask walked as hers. *(not yet met: T49)*
- **R11** (T49; K3324 (2); amends R1 (a)) The local arm binds three things:
  - the plane's `AGENT_WORKER` to `agent-worker`, run under Miniflare with a fake model that answers the answers contract and the run modes' tools. The fake is served by this module at `agent-worker`'s model address, so `uses` stays empty;
  - a stub city site for captures by address;
  - the test-instance mark, set as its deployer, as `local.mjs`:42 does.

  This replaces the walk worker's scratch harness. Its seam for the fake model is confirmed at START (doubt 11). Test: the local arm walks R9. Control: with no fake model bound, step 9 fails by name. *(not yet met: T49)*
- **R12** (T49; K3296; amends R1 (b), R5) The live arm walks R9 and R10 on a named test instance, with an API key read from the environment and never printed. It must pass before BOB's own live walk (K3296). Test: a missing key fails before any act. Control: the key in no output. *(not yet met: T49)*
- **R13** (T49; N1099, N1100; DEC-241, DEC-245; amends R6) R6's comparison covers two things:
  - design journey 29 ("From installing to a first conclusion", DEC-245), step by step;
  - `/app/more` at 390 px, against `more` (DEC-241).

  Every step of R9 and R10 is screenshotted (R2), and R6's design pairs are taken for each screen of the journey. Test: the pairs are made for each of journey 29's steps. Control: a missing pair fails. *(not yet met: T49)*

**START must say:**
1. Measure first: the fake model's seam in `agent-worker` (a configurable model address, doubt 11), and whether `site` can be served on the local arm so journey 28's first two steps run (BOB's choice to add them). Run the composed walk once before writing, and list each step that fails with its owner. A lower module's defect goes through BOB as a CHANGE or to T50 (doubt 16).
2. Inherited reds: coverage on R7–R13 (rule 5 (1)); legacy-ui (5 (4)); the plane bundle (5 (5)). Rule 5 (7)(A) has cleared at T49-29 by this job's turn. If D28's console line is the browser's own (T49-20's START), R2's console check admits it for an expected status.

---

## 15. Questions that look like Bob's (requirement meaning or UX), not BOB's

1. **The site's content of record (UX, values).** "One group's work" and "Groups at work" show real groups. Until a group publishes and agrees to be listed, should the front page drop the section (as R5 drafts it), or show an explained example? Who decides a group's listing, and from what? There is no directory service, only `network-notices` R23's submission. Recommended: as drafted (not drawn, an empty list), and asked through the design stream.
2. **A place named on the site.** The design's "Start a group" page says "Oakland, Alameda County and California are ready now". README rule 7 bars places from a module's behaviour. Is civicsmith.org, the stewards' site, under that rule? If it is, the sentence needs a place-free wording from the design stream, or the list read from the released `jurisdictions` profiles at generation. R11 as drafted allows it only as the design's words. Recommended: ask the design stream.
3. **The stewards' address (N923)** stays Bob's. The site is built with it unset and not public (R6).
4. **D30's "Explain promptly" in the header** (finding 2): the design draws it on purpose. If Bob meant to remove it, that is a design change for the stream.

Every other point here is BOB's (P17): the ids, R6's re-wording, the R34/R38 split, R43's move, and the site's values held at deploy. One more is BOB's too: the site's own copy of the look (Uses none, as the plan rules) versus a `uses: interface-assets` edge, which avoids a second ~1.1 MB of faces. Recommended: the edge, since interface-assets is pure data with no plane code.
