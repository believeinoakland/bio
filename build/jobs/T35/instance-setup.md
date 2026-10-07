# instance-setup (T35)

**Status** · session_01QZZgwL4ojyBbUL3VUYqwZM · depth 2 · COMPLETE · handled B3

## Completion

**Entries applied (T35-69; N700, K1868 (3); K1888, K1943; F10, K1874 (Q6), K2038; K1974).**
- R64 (N700): `memberLanguageSet` reads a tag through `jurisdictions.isLocale` (its R37); this module's own `isLanguageTag` is gone. Tested: one case over 23 tags, each accepted exactly when `isLocale` accepts it, and `isLanguageTag` no longer exported.
- R66 (K1888): `adminRecoveryStep({viewer})`, route `adminrecoverystep` (viewer from the control plane's stamp): `{ok, administrators, codes_held, remaining, met}` from `membership.activeAdmins` and `credentials.recoveryCodesState` for the viewer's own role; `NOT_AN_ADMIN` through `membership.notAnAdmin` for anyone else, machine classes included; a provider that throws or answers no list or state is `STORE_DID_NOT_ANSWER`, never `met: false`; it writes nothing and gates nothing. Tested over the real membership and credentials (credentials' test world).
- R47 (F10, K2038): `HOSTING_CONTROL.guide` holds the block's last sentence, the same words for the page and the installer: "If the one-time password may have been seen, replace it: follow the guide “Replace the one-time password” in your group's Civicsmith, on its first page and in its members and keys section." `hostingControlBlock(cls, {guideHref})` makes the guide's name a link when given an href. The page passes setup-page's `ROTATION_GUIDE_HREF`. The installer's call is unchanged and renders the sentence as text. Until setup-page's merge brings the name, the page reads it through a namespace import.
- R65 (K1974): `groupDescriptionDraft` takes the door's call to agent-worker's `/draft` per request (`turn`), used only after every refusal. A draft that cannot be served answers `ASSISTANT_DRAFT_UNAVAILABLE`: no turn, a turn that throws or answers nothing, or a draft over the limits. Comments and the sentence re-worded for T35. DEC-172 is not folded, so K1757's wording stands.

**Deferred.** None. The page's guide link test (R47, `page.test.mjs` "setup-page R14 …") is red until setup-page's T35 merge brings `ROTATION_GUIDE_HREF` and the guide; I merge tranche/T35 after that merge when BOB says so, and switch the namespace read to a named import.

**Found in other modules (to BOB).**
- plane `test/m/plane/door.test.mjs`:110 pins instance-setup's routes at twenty-four and drives each one. There are now 25 (`adminrecoverystep`), so the test is red from this merge until plane's job (T35-73) counts and drives the new route. op-declarations (T35-70) declares the op: a read, administrators' sessions, `NEEDS` null (requirements' Suggestions), and control-plane (T35-72) routes it.
- Stale generated artifact: `newgroup/dist/newgroup.bundled.mjs` embeds `setup-fleet.mjs` (R47's sentence), so installer's `newgroup-bundle-fresh.test.mjs` is red until the layer close regenerates it (mechanics §14). The installer's screen then shows the guide sentence as text with no code change (installer R34).
- control-plane (T35-72): R57's door may pass its `/draft` call to `groupDescriptionDraft` as `turn`, which keeps the refusal order and the `{focus, purpose}` shape in one place. Or it may build the answer itself, as R57 words it. Either meets R65.

**Tests and checks run** (on the commit below):
- `node --test bio-plane/test/m/instance-setup/`: ℹ tests 108 ℹ pass 107 ℹ fail 1 . The one failure is the R47 guide-link case, waiting on setup-page.
- The users' suites (op-declarations, control-plane, plane with migrate-released, installer with newgroup-bundle-fresh), mine against tranche/T35 @ 301119dbe8: the same failures, plus the two above.
- `format`: 0 failures. `architecture instance-setup`: 0 failures. `coverage instance-setup`: 48 of 48. `ownership instance-setup tranche/T35`: 0 failures.

Size (session_01QZZgwL4ojyBbUL3VUYqwZM): test runs 9, module lines 2522

## Completion of B4 (K2065)

**Applied.** Merged tranche/T35 (control-plane and plane merged). `worker-reports.test.mjs`'s `call` now takes a `token=` out of the address and sends it as `Authorization: Bearer` (admission R20). Every call through it asserts the answer carries no `deprecated: "CREDENTIAL_IN_ADDRESS"` (control-plane R59). No code change. Red 44 is cleared.

**Tests and checks** (on the commit below): `node --test bio-plane/test/m/instance-setup/`: tests 108, pass 108, fail 0 (the real plane's suites included). `format`: 0 failures. `architecture instance-setup`: 0 failures. `coverage instance-setup`: 48 of 48. `ownership instance-setup tranche/T35`: 1 file, 0 failures.

Size (session_01QZZgwL4ojyBbUL3VUYqwZM): test runs 12, module lines 2519

## Completion of B3 (K2054)

**Applied.** Merged tranche/T35 (setup-page merged). R47's page link now reads setup-page's `ROTATION_GUIDE_HREF` as a named import; the namespace read is gone. Red 41 cleared. Its cause was my test, not the code. setup-page shows the guide as its section `#s-rotate`, which its script opens at the address `#replace-one-time-password`. There is no element with that id, and my test asked for one. The test now checks three things: the block's one link is the guide's name, to setup-page's exported address; the composed page carries the guide's section once; and the page's script opens it at that address.

**Tests and checks** (on the commit below): `node --test bio-plane/test/m/instance-setup/`: tests 108, pass 108, fail 0. `format`: 0 failures. `architecture instance-setup`: 0 failures. `coverage instance-setup`: 48 of 48. `ownership instance-setup tranche/T35`: 2 files, 0 failures.

Size (session_01QZZgwL4ojyBbUL3VUYqwZM): test runs 11, module lines 2519

## J1 · QUESTION

R47 (F10): the block's guide name is a link on the page (setup-page R14) to setup-page R27's guide. The link needs the guide element's id, which is setup-page's, and setup-page (before me in the order) does not export one yet (job/T35/setup-page has no guide so far).

My best reading, on which I am building: setup-page exports one constant naming the guide's element id, `ROTATION_GUIDE_ID` (setup-page/index.mjs), and the guide is the element with that id. This module imports it and renders the guide's name as `<a href="#${ROTATION_GUIDE_ID}">`. The words are held once in `setup-fleet.mjs`, as `HOSTING_CONTROL.guide = {sentence, name}`: one sentence, the same for the page and the installer, "If the one-time password may have been seen, replace it: follow the guide “Replace the one-time password” in your group's Civicsmith, on its first page and in its members and keys section." On the page the quoted name is the link; `hostingControlBlock(cls)` with no href (the installer's call, unchanged) renders it as plain text. The leaf still imports nothing.

Please confirm the name `ROTATION_GUIDE_ID` with SETUP-PAGE, or name another. Until setup-page merges, my code reads it as `ROTATION_GUIDE_ID` through a namespace import, and the page test checks that the link's target is an element on the composed page, so it will be red until setup-page's guide exists. I merge the tranche branch after setup-page's merge, when you say so.

## J2 · COMPLETE

T35-69 applied (R64 isLocale, R66 op=adminrecoverystep, R47 guide sentence linked to setup-page's ROTATION_GUIDE_HREF per K2038, R65's per-request /draft turn). Module tests 107 of 108: the one red is R47's page link, waiting on setup-page's merge; I merge tranche/T35 after it when you say so. Checks: format, architecture and ownership 0 failures; coverage 48 of 48. Reported: plane door.test.mjs:110 pins 24 routes (now 25, T35-73); the newgroup bundle is stale (setup-fleet.mjs), to be regenerated at the layer close. Details in the record's Completion.

## J3 · COMPLETE

B3 (K2054) done: merged tranche/T35. R47's link now reads setup-page's ROTATION_GUIDE_HREF as a named import. Red 41 cleared: my test looked for an element with the guide's id, but setup-page shows the guide as section #s-rotate opened at that address. The test now checks the link, the section and the script's address. instance-setup 108 of 108; format, architecture and ownership 0 failures; coverage 48 of 48. Record: 'Completion of B3'.
