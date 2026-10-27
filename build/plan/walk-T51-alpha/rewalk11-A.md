# Re-walk 11, area A (setup, sign-in, the team, the daily queue)

Walker A, 2026-10-26 (about 13:00 to 13:40 UTC), https://biosmoke8.believeinoakland.workers.dev (`/api/?op=bootstrap` answers 0.86.0), branch `walk/T51-rewalk11-A`. Chromium through the environment proxy only, own context per width and role (1280 and 390 px; touch at 390), administrator and member signed in through the sign-in screen. Signed acts at 1280, read at 390. No credential, token or invitation link is written here. Screenshots: `build/plan/walk-T51-alpha/shots/rewalk11-A/`.

**Leftovers on the shared copy:** the member `walker` registered two signing keys (the "bio-ratify" kind, Account page); the administrator answered both items with "I know about this key" (the keys themselves are still registered; revoking is the member's act on Members and was not done). No review grant was made (see N-1).

| row | width / role | verdict |
| --- | --- | --- |
| A-03 | 1280 admin (press), 390 admin (read), 1280 member (register) | FIXED |
| N-1 | 1280 admin | FIXED |
| A-06 | - | NOT WALKED |
| Setup time-zone step | 1280 and 390 admin | NOT FIXED (unwalkable: part 3 never leaves "Still loading") |

## A-03 "registered a signing key": "I know about this key"

Case of the original: a member registers a signing key; the administrators get an item.
- Member `walker`, 1280, Account > "Register your signing key": "YOUR KEY IS MADE ... Key ending ..Vzs1oO+, registered October 26, 2026".
- Administrator 1280, Queue: item "walker registered a signing key for themselves: bio-ratify", detail "A member registered their own signing key, held in their browser, from a signed-in session, and it is active. Nothing here changes the key. If you did not expect it, open Members and withdraw the key." with the two answers "I know about this key" and "Open Members". The sentence "if you did, mark it done" is gone (rewalk 10's words complaint is fixed). Queue "7 items wait on you".
- Administrator 390, same item and both answers drawn, no horizontal overflow. Shot `a03-queue-ADMIN-390.png`.
- Administrator 1280, pressed "I know about this key": "Done: I know about this key. It has left your queue." Count 7 to 6 items, 3.0 s wall. Reloaded the queue: the item stays gone. Administrator 390, after: item absent. Shot `a03-after-known-ADMIN-1280.png`.
- A second key registered by the member ("Key ending ..IFI5Czus"): a new item with the same words and the same two answers appeared in the administrator's queue (count 6 to 7). Shot `a03-second-key-ADMIN-1280.png`. Pressed "I know about this key" on it too: "Done: I know about this key. It has left your queue."; gone at 1280 and 390.
- Not checked: that the item leaves a second administrator's queue (I have no second administrator's session; see A-06). One administrator's queue was the only one read. FIXED for what I could read.

## N-1 Share for review pressed while loading

Case: Walk alpha D, Projects > Review copy (`/app/review-copy/PROJ-2026-3570-walk-alpha-d`), administrator 1280. To make the loading window long enough to press in, the `reviewcopy` read was held back 6 s in the browser (a slow-network stand-in); name, role and a date three days on were filled while "NAMED READERS" read "Still loading".
- "Share for review" pressed: the reason box opened ("Asks for a reason"); a reason typed and "Send with this reason" pressed while the copy was still loading: beside the button, "Still loading". No request left the page, and after the copy loaded the readers list holds no new reader. Before the fix the press did nothing and said nothing. FIXED. Shot `n1-loading-press-1280.png`.
- Not walked at 390 (a signed act, done at 1280 by the brief; a press after load would have made a live link).

## A-06 Administrators counted in "Agreed: ..."

NOT WALKED: needs a second administrator's session; the credentials given are the founder's and the one member's. Not judged.

## Setup time-zone step (part 3 "Where your team works")

Case: `/app/setup` as the administrator (sparky; whoami `rootOfTrust: true`, `administer: true`), opened part 3.
- 1280 and 390: the page draws; part 1 reads "Claimed. Your team is yours, and you're signed in as sparky on this device. Done"; parts 2 to 8 each read "Optional". Part 3 opened (waited 3, 8, 15 and 30 s): the body is two lines "Still loading" and then "Skip for now"; the zone step ("Pacific Time (Los Angeles)", done) is never drawn. No console error. The network shows only the shell's own calls (`whoami`, `interfacewords`, `wizardsat`, `bootstrap`, `assistantstate`, `accountreference`, `subscriptionsignin`, `groupkeystate`); none of the screen's reads (`profiles`, `factstatus` on `@team/time_zone`, `groupidentity`, `entitieskind`, ...) is ever sent, and no call is slow. Same on a navigation inside the app (`pushState`).
- The brief expects "done and no act"; I can neither see the zone nor the step. NOT FIXED (cannot be confirmed): the same "Still loading" would greet a founder after the claim, for every part that reads (3 to 8). Severity MAJOR (the setup parts after the claim cannot be used). Possible cause, not verified: `screens-entry/setup.mjs` `reads(view)` returns `{}` unless `view.me.rootOfTrust === true && view.me.handle` (lines 33-34), and the reads are not sent here though whoami answers both. Shots `setup-zone-ADMIN-1280.png`, `setup-zone-ADMIN-1280-open.png`, `setup-zone-ADMIN-390.png`, `setup-zone-ADMIN-390-open.png`.

## Known gap (not walked)

DEC-443 held (K5315); A-17 Defer/Grant and the publish schedule: no such item or edition.

## New findings

- **S-1 (MAJOR)** Setup parts after the claim stay "Still loading" for the signed-in founder; see the time-zone step above.

## Result

Rows fixed of rows walked: 2 of 3 (A-03, N-1 fixed; the setup time-zone step NOT FIXED); A-06 not walked.
