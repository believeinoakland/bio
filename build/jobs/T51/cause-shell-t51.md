# cause-shell-t51 (T51)

**Status** · session_013bNQKD9Hm7fy4unt8sjgMn · depth 2 · COMPLETE · handled B3

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

## J1 · QUESTION

Answered by B3 (interim rows accepted, `shell.member.unknown` to the design lane; the shell sends `v`; six requirement lines written).

## J2 · COMPLETE

Fix round 2, wave 1: C24, C76, C77, C78 (shell part), C79 (shell part), C80, C81 (partly, below), C94 (shell part), C11 (shell part), C15 (shell part), and B2's C66 look. Tranche T51 merged at B3's lines.

**Applied (requirement ids; tests in `interface-shell/fixround2.test.mjs` and `phone390.test.mjs`, each seen failing first):**
- C24 (R7, R9): `/app/<place>` of a place holding a built screen is rewritten to that screen's address. The rail, tab and search already opened the finder in the source (`PLACE_SCREENS.find` is `["finder"]` since T47); the walk's `/app/find` was the place's own address.
- C76 (R11, R107; op-grades R42): the Reasoned mark is drawn only where the shell asks (`markAsks`); a read draws no mark; `op-grades` marks the nine reads whose kit weight was above Reversible (bootstrap's "Irreversible" among them) Reversible by the K4259 read ruling. A test over every act of every working screen the registry lists, no hand list.
- C77 (R109): a password field is emptied only when the act's request carried its value.
- C78 (R68): the focus put back after a redraw opens no explanation. C79 (R9): scroll and focus are carried only across redraws of the same screen; the put-back focus never scrolls. C80 (R60): no placeholder name (no link) until `groupidentity` answers; the last name this device was shown (`cs-group`) meanwhile.
- C94 (R111): `cs.memberName(id)`; the roster (`memberlist`) is read lazily, only when a screen asks for a name not held (a first version read it in the frame and broke screens-intake and screens-settings tests that count requests).
- C11 (R13): the refusal beside an act is drawn again by every redraw. C15 (R5): `op=interfacewords&v=<bootstrap's version>`.
- C81 (R84, R89, R108): phone block of `STYLE`: `overflow-wrap: anywhere` on the main column, 44 px for row ticks, panel controls, the masthead search and boxes ticked beside words; measured in Chromium at 390 px (main width, nothing past the edge, every target) with a 1280 px control.

**Changed existing tests (requirement changed by C76/C80, not weakened):** `acts.test.mjs`, `design.test.mjs` R64 case, `t51.test.mjs` R90/R102 (promote draws no mark now; a mark that still draws is tested on `memberadd`); `session.test.mjs` R24 allows the device key `cs-group`; `op-grades` `t48`/`t50` take the read ruling as an exception by its source, not by name.

**B2 (C66):** not found. The queue module clamps `limit` 1–500 (`clampLimit`), its door passes it through, `tasks` clamps to 1000; no declared bound or door check refuses 500. The shell's call is unchanged. Likely the walk's build or another read; the console 400 needs the live request's response body.

**Deferred / reported:**
- C81's other minor items (case-editor strip numbers over words, project list rows aligning, Home loading rule, tip over roster rows) could not be reproduced without the screens' live data; wave-2 screen jobs read `phone390.test.mjs`.
- REPORT: acts marked Terminal/Signed by the kit with no weight (e.g. `subscriptiondisconnect`, `accountreferenceremove`, `reviewrevoke`, `signerrevokeown`) draw the mark and run on press: the same disagreement as C76 for those marks; untouched.
- `interface-assets`: nothing changed (generated; the phone rules live in `STYLE`, R108).
- `phone390.test.mjs` needs `playwright-core` (found in `site/node_modules`, journey-check's, or `/opt/node-tools`) and Chromium; without them it fails saying so.

**Suites (merged tree):** interface-shell 262 tests, 261 pass, 1 fail (R23, fails identically on `origin/tranche/T51`); op-grades 142/142; interface-assets 22/22. Users: screens-entry 93, screens-wizards 75, screens-daily 242, screens-inquiry 384, screens-investigate 178, screens-publish 179, screens-action 214, screens-intake 181, affordances 271, queue 206, admission 58, tasks 131, op-declarations 246, control-plane 324: all pass. screens-settings 209/210 (R39 fails on the tranche too), store-door 52/53 (R17 `groupdescriptiondraft`, same on the tranche), plane 279/280 (R24, same on the tranche).
**Checks:** format 1 failure (`build/rulings.md:4298`, BOB's); architecture 0, coverage 0 (shell 108/108, op-grades 51/51, assets 11/11); words 0 for my files; ownership (list form) 0 failures over 13 files.

Size (session_013bNQKD9Hm7fy4unt8sjgMn): test runs 14, module lines 3224

## J3 · COMPLETE

COMPLETE: C24 C76 C77 C78 C79 C80 C81 C94 C11 C15 (shell parts as stated) met; B2 (C66 limit 500) not reproducible, queue/tasks accept it; details, counts and Size in the record (J2). Requirement lines R9 R11 R13 R60 R68 R108 and op-grades R42 met as B3 wrote them.

## J4 · COMPLETE

B4 (K4319, C48; R90, R11): an act drawn with a here word confirms with that word in the confirmation dialog, in place of `act.<op>.does`; with none, `.does`. Test `fixround2.test.mjs` (publish on `ceremony`), seen failing first. interface-shell 263 tests, 262 pass, 1 fail (R23, same on the tranche). Ownership unchanged (shell files and tests only).
