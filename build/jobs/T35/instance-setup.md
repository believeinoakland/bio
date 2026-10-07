# instance-setup (T35)

**Status** · session_01QZZgwL4ojyBbUL3VUYqwZM · depth 2 · RUNNING until 2026-10-07T21:31:59Z (users' suites (op-declarations, control-plane, plane, installer) on my branch and on tranche/T35, compared) · handled B2

## J1 · QUESTION

R47 (F10): the block's guide name is a link on the page (setup-page R14) to setup-page R27's guide. The link needs the guide element's id, which is setup-page's, and setup-page (before me in the order) does not export one yet (job/T35/setup-page has no guide so far).

My best reading, on which I am building: setup-page exports one constant naming the guide's element id, `ROTATION_GUIDE_ID` (setup-page/index.mjs), and the guide is the element with that id. This module imports it and renders the guide's name as `<a href="#${ROTATION_GUIDE_ID}">`. The words are held once in `setup-fleet.mjs`, as `HOSTING_CONTROL.guide = {sentence, name}`: one sentence, the same for the page and the installer, "If the one-time password may have been seen, replace it: follow the guide “Replace the one-time password” in your group's Civicsmith, on its first page and in its members and keys section." On the page the quoted name is the link; `hostingControlBlock(cls)` with no href (the installer's call, unchanged) renders it as plain text. The leaf still imports nothing.

Please confirm the name `ROTATION_GUIDE_ID` with SETUP-PAGE, or name another. Until setup-page merges, my code reads it as `ROTATION_GUIDE_ID` through a namespace import, and the page test checks that the link's target is an element on the composed page, so it will be red until setup-page's guide exists. I merge the tranche branch after setup-page's merge, when you say so.
