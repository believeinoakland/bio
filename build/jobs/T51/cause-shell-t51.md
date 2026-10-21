# cause-shell-t51 (T51)

**Status** · session_013bNQKD9Hm7fy4unt8sjgMn · depth 2 · WORKING · handled B1

## J1 · QUESTION

QUESTION · cause-shell-t51 · one word, one request field, and the requirement lines my work relies on (carry on meanwhile; nothing blocks)

1. **A word for an unknown member (C94, R111).** `memberName(id)` answers a handle, else a plain word by key. No row says "a member": I used the rows that exist, `member.founder.unnamed` ("The team's founder") for the founder's id with no handle known, and `shell.card.member` ("A member of your team") for any other id with no handle. Best reading: the design stream writes `shell.member.unknown` (a short "a member"), and the one line in `browser.mjs` `memberName` changes to it. Until then the interim rows read acceptably ("Answered by A member of your team").
2. **The request field for the words' version (C15).** The shell now sends `op=interfacewords&v=<release version>` (the `version` that `op=bootstrap` answers; no `v` when it answers none, and the words are never held back for it). Best reading: control-plane (wave 2, C15) keys its `Cache-Control: immutable` on `v`; `interfacewords` has no owner declaration (`translations` `DECLARED_OPS` lists no row for it), so its fields `language`, `viewer`, `v` are declared by `translations` or `control-plane`, BOB's call.
3. **Requirement lines I could not write (my paths hold no requirements); proposed wording for BOB, each met and tested in `fixround2.test.mjs`:**
   - R7/R9 (C24): an address `/app/<place>` of a place that holds a built screen (`PLACE_SCREENS`) is rewritten to that screen's address; "comes later" is drawn only for a place with no built screen. (The rail's Find already opened the finder in the source here; the walk's `/app/find` came from an address of the place itself.)
   - R11/R107 (C76): an act drawn with the Reasoned mark is one the shell asks a reason for (`markAsks`); every other Reasoned mark is not drawn; a read draws no mark and `op-grades` marks every read Reversible.
   - R60 (C80): while `groupidentity` has not answered, the masthead draws the last name this device was shown (`cs-group`, the public team name, device only), else no name and no link; once it answers with none, the word.
   - R13 (C11): a refusal drawn beside an act is drawn again by every redraw, until the act is pressed again, anything else is drawn in its slot, or the screen is left.
   - R68/R9 (C78, C79): the focus put back after a redraw neither opens an explanation nor scrolls; a navigation opens the screen at the top; scroll and focus are carried only across redraws of the same screen.
   - R84/R108 (C81): the phone block of `STYLE` also gives the main column `overflow-wrap: anywhere` and 44 px targets to a row's tick and panel control, the masthead search and a box ticked beside words (its label).
