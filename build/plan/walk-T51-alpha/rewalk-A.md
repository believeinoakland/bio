# Re-walk A after fix round 10 (plan item 131 (5)): setup, sign-in, the team, the daily queue

Re-walker A, 2026-10-26 (about 11:30 to 12:20 UTC), https://biosmoke8.believeinoakland.workers.dev (`/version` answers 0.86.0), branch `walk/T51-rewalk10-A`. Own browser contexts per width and role, through the environment proxy only (R-PROXY); Chromium 1280 and 390 px (touch at 390); administrator and member sign-in through the sign-in screen. Times are wall times from navigation start (frame = the screen's `data-screen` drawn; settled = no "Still loading" left) and `Server-Timing` of the call; other re-walkers were acting at the same time. Screenshots: `build/plan/walk-T51-alpha/shots/rewalk-A/`. No credential, token or invitation link is written here (the review link was never printed or kept).

**Leftovers on the shared copy:** the team's time zone is now set to Pacific Time (Los Angeles) (D-B1, as the brief asks; the form's reason "rewalk10 A: re-walk of D-B1"); two review-copy grants for "Rewalk ten reader A" on Walk alpha D, both stopped by me ("Stop sharing"); captures of `https://httpbin.org/status/429?r=1..7` (refused by the site, nothing kept; they made the pacing item for the check A-04, which I muted and turned back on, and which leaves by itself); one signing key registered by the member `walker` and revoked again; three forwards of "Who issued" obligations (member to founder, member to second administrator, founder to second administrator twice) which now sit in those administrators' queues.

| row | width / role | verdict |
| --- | --- | --- |
| A-01 | 1280 admin | FIXED |
| A-01 | 390 admin | FIXED (settled 2.0 to 3.2 s, see note) |
| A-01 | 1280 member | OK (read-only Your team, no `stats` call; settled 0.7 s) |
| A-02 | 1280 member to founder; 390 member to second administrator; 1280 and 390 administrator to second administrator | FIXED |
| A-03 | 1280 and 390 admin; 1280 member | NOT FIXED (half fixed) |
| A-04 | 1280 and 390, admin and member | FIXED |
| A-06 | - | NOT WALKED |
| A-17 | 1280 member, 390 admin | FIXED for Mute / Turn back on; Defer and Grant/Decline not walked |
| D-B1 | 1280 and 390 admin | FIXED (Settings, Share for review, Find's zone read); publish schedule not walked |

## A-01 Settings > Your team: `stats` cheap

Case: Settings > Your team as administrator, nine-load walk of the original (4.3 to 8.9 s settle, `stats` 5.8 to 13 s).
- 1280 admin, three loads, 11:4x UTC: frame 0.29, 1.22 and 0.35 s, settled 1.26, 1.70, 1.28 s. `Server-Timing`: `stats;dur=200, do-stats;dur=134`; `dur=141, do-stats;dur=74`; `dur=220, do-stats;dur=120`. The card reads "Your team's record holds 0.5 GB of the 10 GB one record can hold (5%)." FIXED. Shot `a01-group-admin-1280.png`.
- 390 admin, three loads: frame 1.80, 1.74, 1.75 s, settled 3.20, 2.68, 2.06 s; `stats;dur=177`, `401` (do-session 295 ms that once), `192`. No horizontal overflow. FIXED for `stats` (the 5.7 to 13 s is gone: 0.18 to 0.4 s). Note (MINOR, not a fault of the fix): at 390 the frame takes 1.7 to 1.8 s on this copy at this hour (the 1280 frame took 0.3 s), so the settle is just over 2 s on two loads.
- 1280 member: three loads, settled 0.71, 2.51, 2.46 s; no `stats` call (member sees the read-only card). OK.

## A-02 Forward to a member, including administrators

Case: the queue's "Who issued a document your team captured is not known yet" obligation, "Forward to a member", choosing an administrator.
- Wire now: the field's options carry the member id (`admin` for "sparky", `walk-a-admin2b` for "walk-a-admin2"), the list shows handles.
- 1280 member to the founder: "Done: Forward to a member. It has left your queue." `taskforward;dur=451, do-taskforward;dur=329`. FIXED.
- 390 member to the second administrator: same words, `taskforward;dur=380`. FIXED.
- 1280 administrator to the second administrator: same words, `dur=180`. FIXED.
- 390 administrator to the second administrator: same words, `dur=167`. FIXED.
- The original refusal "No member of your team answers to the name or id given" no longer appears. (The act is sent as soon as the name is chosen in the list; there is no separate button press after choosing: unchanged from the original, not a regression.)

## A-03 "registered a signing key" items

Case: an item for a self-registered signing key, to the administrators.
- The registrant is no longer told: the founder (who made the 14 keys) has no such item in the queue (Home count and Queue 8 items, none of this kind); the member `walker`, after registering a key on Account ("Key ending …BgqLRwjB, registered October 26, 2026"; `signerregisterown;dur=176`), has none in `walker`'s queue. FIXED half.
- The item now names the key's owner and kind: "walker registered a signing key for themselves: bio-ratify" (administrator, 1280 and 390). FIXED half (the original items could not be told apart).
- The item cannot be cleared by the administrator: the detail still says "A member registered their own signing key, held in their browser, from a signed-in session, and it is active. Nothing here changes the key. If you did not expect it, open Members and withdraw the key; if you did, mark it done." The item offers only the link "Open Members"; there is no "mark it done" and no revoke on the item. The item left only when `walker` revoked the key. NOT FIXED for the walker's case (the sentence names an act that does not exist; an administrator who keeps the key has an item that stays and counts in the badge). The design owes the "I know about this key" answer (rulings K5265, HANDOFF); the sentence "if you did, mark it done" should not ship until it exists. Severity MAJOR (unchanged, words promise a missing act). Shots `a03-queue-ADMIN-1280.png`, `a03-queue-ADMIN-390.png`, `a03-register-member.png`.

## A-04 Pacing item in plain words

Case: the status item for a host the governor holds (the original was web.archive.org; made live here with httpbin.org, refused with 429 three times, then "Civicsmith is holding off asking that website for now so it is not overloaded.").
- 1280 and 390, administrator and member (four reads, about 11:5x UTC): summary "Your team's Civicsmith is spacing out its captures from this site on purpose: they are paced, not broken"; detail "Civicsmith will try httpbin.org again in 1 minute and 11 seconds. It has been turned away 2 times in a row, so it is waiting before it sends more. This says nothing about whether the site is working." (later reads: "53 seconds", "45 seconds", "37 seconds"). Capital letter, a time in words, no "governor", "cool-off", "PACED", no milliseconds, no status code. FIXED. Shot `a04-queue-ADMIN-1280.png`.

## A-06 Administrators counted in "Agreed: ..."

NOT WALKED. The walker's case is the proposal item in the second administrator's queue; I have no session of the second administrator (an account another walker made, and I did not reset or take over another person's account), and the founder never receives an item for a proposal the founder made. Not judged. (The founder's own queue showed no proposal item, as it should.) Needs a session as `walk-a-admin2`, or a second administrator the re-walker is given.

## A-17 The Done note names the button pressed

- Mute then Turn back on, on the pacing status item: 1280 member: "Done: Mute a kind. It has left your queue." then "Done: Turn back on. It has left your queue." 390 administrator: the same two notes. The original said "Done: Mute a kind." after Turn back on. FIXED. Shots `a17-mute-MEMBER-1280.png`, `a17-unmute-MEMBER-1280.png`, `a17-mute-ADMIN-390.png`, `a17-unmute-ADMIN-390.png`.
- Forward to a member: "Done: Forward to a member." (correct, as before).
- Defer (a finding or a notice) and Grant / Decline (a project join request): NOT WALKED: no such item exists on the copy and I have no outsider account to ask to join. Only the Mute pair is confirmed live.

## D-B1 The team's time zone with no place profile

Case: the walker's: Settings > Your team has no zone; Share for review refused with "Your team's time zone isn't set ...".
- Before (1280 admin): the zone card read "No time zone is held yet. Choose one below."; the Correct button now carries `data-path="@team/time_zone"` (the original posted an empty path).
- Set (1280 admin): chose "Pacific Time (Los Angeles)", filled "How you checked it" and "Where you checked it", "Correct the time zone", reason; `factconfirm;dur=173, do-factconfirm;dur=106`, 2.6 s wall. The card now reads "Pacific Time (Los Angeles), corrected by your team" (1280 admin, 390 admin; the member sees the same line read-only at 390). FIXED. No overflow at 390.
- Share for review (Walk alpha D, draft DRAFT-2026-1029): 1280 admin: name, role, end date three days on, reason: no refusal; "NAMED READERS Rewalk ten reader A · re-walker, test reader. It is not public: only people with this link can read it, until October 29, 2026 at 11:59 PM (Pacific Time, Los Angeles)." and the link drawn once with "This link is shown once. It is not kept here" (`reviewgrant;dur=165`). 390 admin: the same sentence and result (`dur=207`). FIXED. Both grants stopped afterwards.
- Find: "Find in this" on Walk alpha D (1280 admin) reads `factstatus` of `@team/time_zone`: `governs: America/Los_Angeles, origin: corrected` (wire read; no date search run). The screen draws, no overflow.
- Publish schedule: NOT WALKED (needs a prepared, unpublished edition in the ceremony; the only case on the copy is published and the ceremony's "publish at" step does not draw). Not judged.

## New findings

- **N-1 (MINOR) Review copy, Share for review pressed before the copy has loaded does nothing and says nothing.** Pressing it at once after the page draws (about 0.5 s after navigation, "Still loading" gone) with name, role and date filled: no reason box, no message; the code returns silently when its copy read has not come back (`review-copy.mjs`, `if (!view.ui.draft || !copy) return null`). After the `reviewcopy` read answered (about 1 s) it worked. A fast member would think the button is broken. Shot `d-b1-click2.png`.
- **N-2 (MINOR) A-03's words** (above) remain after the fix; counted under A-03.

## Result

Rows walked 6 (A-01, A-02, A-03, A-04, A-17, D-B1); A-06 not walked. Rows fixed of rows walked: 5 of 6 (A-01, A-02, A-04, A-17 (Mute pair only), D-B1); NOT FIXED: A-03 (half). A-06 not walked, Defer and Grant of A-17 and the publish schedule of D-B1 not walked.
