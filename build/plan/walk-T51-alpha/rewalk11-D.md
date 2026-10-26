# Re-walk 11, area D (tip 07a3dfe6a1 on biosmoke8; walked 2026-10-26)

Chromium through the environment proxy; reader (no sign-in) and administrator "sparky" each in own context. Case: edition 1 of CASE-2026-1046; project "Walk alpha D" (PROJ-2026-3570). Other walkers were active. No edition published.

| row | width | role | result |
| --- | --- | --- | --- |
| D-M1 (2): no `INFO-...` id in the frozen edition 1 sentence | 1280, 390 | reader | **FIXED.** `/app/published/CASE-2026-1046/1`, body text searched for `INFO-\d{4}-\d+`: no match at either width. Both findings read "Capture Not graded yet: no member has graded this." / "Connection Not graded yet: no member has graded this." (the old "Not counted yet: INFO-2026-0177-..." sentence is gone). Loaded 7.7 s (1280) / 5.9 s (390) to idle with other walkers active; no horizontal overflow. Shots: shots/rewalk11-D/pub-1280.png, pub-390.png (text: pub-*.txt). |
| New: "tamper-EVIDENT" paragraph drawn by key (`verify.detail`) | 1280, 390 | reader | **FIXED.** Page text and HTML hold no "tamper" at either width, before or after pressing "Check the signature" (3.1 s). The signature section reads "Anyone can check that these files are the ones your team signed, using the signature and the public key shown here. A check proves the files were not changed after signing. It does not prove that what they say is true." Shots: sig-1280.png, sig-390.png. |
| Shell R135 unsaved line: a typed field | 1280 | admin | **FIXED.** Case editor of Walk alpha D: typing then deleting one character in "Why the team took this position" (and typing in "Something else it leaves out") draws `data-unsaved`: "Changes here are not saved yet." (about 1.5 s). "Save these details" (3.5 s) answers "The draft is prepared." and the line is gone. Shot: unsaved-typed-1280.png. |
| Shell R135 unsaved line: a role/position radio, and "This case leaves nothing material out" | 1280, 390 | admin | **NOT FIXED.** In the drafted case editor, changing the position radio ("We asked, and they answered"), the role radio ("Supporting") and ticking "This case leaves nothing material out", by `check()` and by a real click on the label: no line, no `data-unsaved` element, body text unchanged after 0.8-1.5 s, at both widths. Cause found in the source (tip 07a3dfe6a1): the shell now passes a changed radio/box group to a `typing` handler (interface-shell/browser.mjs, `data-typing-group`), but `bio-plane/src/screens-publish/case-editor.mjs` calls `cs.checks("ce-role-" + i ...)` (line 121), `cs.checks("ce-pos" ...)` (126) and `cs.checks("ce-exnone" ...)` (178) with no `typing: edited`, so nothing sets `ui.unsaved`. Fix is screens-publish's: pass `typing: edited` in those three calls. Shots: unsaved-click-1280.png, unsaved-click-390.png, unsaved-all-1280.png. Severity MINOR (the edits are not lost by this; only the warning is missing). |
| Two `ce-ackreason` ids; "reading-1" | | | known gap (not walked). |

Left behind: the draft of "Walk alpha D" was saved twice by me ("Save these details") with the radios first changed then put back to their original values (role Relied on, position "We chose not to give notice", nothing-left-out unticked); the data is as before. Nothing deleted.

## New findings
None beyond the NOT FIXED row above.

Rows fixed of rows walked: 3 of 4 (the radio/tick part of the R135 unsaved line is NOT FIXED).
