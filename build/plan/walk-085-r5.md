# WALK-085 r5: live walk of 0.85.0 on biosmoke8 (2026-10-16, 13:45-14:25 UTC; BOB #192's walk worker)

Signed in as administrator (sparky) with the environment credential, read by variable inside scripts; as a member (walker) with the handle and password written to `member-sign-in.txt` (git-excluded, mode 600, not committed). Direct to the instance, no proxy. No repository product file was edited.

**Limit of this walk: no browser.** Chromium refused the instance's certificate (`ERR_CERT_AUTHORITY_INVALID` through the direct path). Trusting the session's egress CA in a private NSS store was refused by the permission system ("TLS/Auth Weaken"), and I did not work around it. So **no screenshot was taken**; (c), (d) and Part B's screens are judged from the ops the screens read (node, which verifies TLS), not from what is drawn. `build/plan/walk-085-r5/` therefore holds no pictures.
The acts were done by the same ops the screens call (`captureupload` with `type=text/plain` as the shipped screen sends, `promote`, `drawquestion`, `release`, `findin`, `cite`, `airunopen`, `airundispatch`), not by clicking.

## Part A: what was made
- Project "WALK-085 project" (PROJ-2026-5304-walk-085-project). Question INQ-2026-0002 "How many days passed between the Marlowe Street crosswalk lights failing and their repair?".
- Fresh `.txt` of invented council minutes plus timestamp: INFO-2026-0006-council-minutes-20261016135119-txt (443 bytes; says lights failed 3 Sept, repaired 21 Sept, "eighteen days later"). Vouched (`release`), then read as text (2 units); `passage:crosswalk` finds it. Cited as a supporting leg (¶2) to the question.
- Run RUN-d0faeebbefd9123a, mode check, opened 13:51:45Z, dispatched 13:51:47Z (`dispatched: true`). Ended **14:21:18Z**, `finished`, condition `completed`, **37 ticks, pass 3, 29 min 33 s**. Wallclock consumed 1,766,762 of 1,800,000 ms (98%).
- Leftovers: INFO-2026-0004 (uploaded without `type`, so never read as text) and INFO-2026-0005 (id ends in a hyphen, see D1) are in the project, uncited.

## Per item
- **(a) PASS.** Sub-sessions' passage reads returned rows: log:3, 7, 11 "Passage search 'Marlowe' ... hit 2 docs (INFO-0005 and INFO-0006 council minutes, ¶2)"; log:2, 6: one document "fully indexed", ¶2 matched. (But see D3, D4.)
- **(b) PASS for the drop, FAIL for the answer.** No candidate answer was composed. The drop is logged: log:13 `dedup -> candidate dropped`, LOOKED_INDETERMINATE, "dropped before any write: 'level-empty-meaning' already held on the question". The text it names exists: one machine proposal `level-empty-meaning` (state suggested, run = this run) is on the question.
- **(c) NOT VERIFIED on screen.** Data the page reads: `airuns` for the question showed the run `running` with ticks rising 3 -> 37 (polled every ~30 s from 13:52), then `finished` with condition `completed` at 14:21:26. Expected by the cut's code (R45, R47) but no screenshot at 1280.
- **(d) NOT VERIFIED on screen.** `airuns` lists the ended run as the question's newest run of the member's, which is what the dock's R48 reads on a fresh load. Not drawn-checked.
- **(e) FAIL.** The new proposal's member-facing description reads: "...The sub-session reported: Meaning-level leg read over INQ-2026-0002 and INFO-2026-0006-council-minutes returned 0 rows...". Two raw record ids (shortened, but raw) are in the text a member sees on the question page ("Rests on" is empty).
- **(f) PASS.** `GET /favicon.ico` answers 204 (checked twice, direct).
- **Cost (as the product reports it, `airun` `session.cost`):** 83 calls, 1,698,344 tokens, **$1.482223**, first call 13:54:20Z, last 14:21:18Z, `final: true`. Budget: subsessions consumed 12, runtime 96, fetches 0.
- **Expiry:** the open answer gave `expires` 2026-10-16T14:01:45Z. The run was still running past it (ticks 9 at 14:00, 17 at 14:05, 37 at the end); the session's `expires` at the end read 14:31:18Z, so it is extended as the run ticks. It ended before the 14:30 cap.

## Result of the run
The run did not answer. The minutes say eighteen days; the assistant never read the date. Pass 1-3 content reports: "Marlowe Street crosswalk lights failed on 3..." (snippet truncated), "so I did not read the full date". Final state: meaning LOOKED_ABSENT, content and document partial, internet NEVER_LOOKED. The only output is a "found nothing supportable" proposal, which is wrong for this question.

## Part B: member `walker`
Created through the product's own flow as administrator: `memberadd` (id walker, capability "contribute" only, the screen's default) -> invitation -> `handlecheck` ("walker is free") -> `enroll` -> ok. Sign-in by `login` works. `member-sign-in.txt` written in `/home/user/bio` (handle and password; not shown, not committed).
Screens at 1280 and 390 were **not looked at** (no browser). From the ops Home reads, as walker: `whoami` member, administer false, capabilities ["contribute"]; `projectlist` empty (the admin's project is correctly hidden); `search "crosswalk"` 0 hits; `airuns` on the question empty; `queue` 0 items; `startfrom` offers the group-setup wizards "Say who your group is", "Invite a member", "Update your group's Civicsmith" and "Connect your Claude account" to a plain member; `queue.sections` carries `civicsmith: ["update-ready"]` for a member; `memberlist` and `bootstrap` (version, `claimed`, `consumedAt`) answer a plain member in full, with other members' handles, roles, `invited_by`, created times. Whether Home hides these cards for a member is the thing to check on screen.

## Defects
- **D1. A file name can make a record id that cannot be cited.** Capture > "A file or photo" > file `eastlake-council-minutes-<14 digits>.txt` > then "Cite" on its passage. The id is built from the name cut at 40 characters, and the cut fell on a hyphen: `INFO-2026-0005-eastlake-council-minutes-20261016135054-`. The cite is refused `BASIS_REFUSED`: "basis[0].target 'INFO-2026-0005-eastlake-council-minutes-' is not a canonical record id". The member sees a raw id and a refusal; the file looks captured and cannot be cited. (screens-intake `promoteDocument` trims before cutting, not after.)
- **D2. A file whose type the browser leaves empty is stored unread.** The screen sends `type` only when the browser gives one. Sent without it, the same bytes were "not read as text (non-textual or too large)", no words, no passages, and a vouch (`release`) did not change that (INFO-0004). A `.md` or `.csv` the browser types as "" would be affected. Ops-level observation; not tried in a browser.
- **D3. Passages reach the assistant cut off.** The passage hit is a snippet ending "failed on 3...", and the run read nothing further in three passes, so it never saw "21 September" or "eighteen days". The one place the answer was is never read. Where: run log 2, 6, 10.
- **D4. The meaning level contradicted itself.** log:1 (13:55:47) "returned 0 rows: no legs, findings or connections recorded", log:9 later "only one leg (ord 0, supports ...)" on the same question, which had the leg from before the run opened.
- **D5. A false absence proposal is written to the member.** Proposal `level-empty-meaning`, "found nothing supportable ... at the meaning level", on a question whose cited passage holds the answer. It carries raw ids (e).
- **D6. The log disagrees with the record.** log:13 says the candidate was "dropped before any write ... already held", yet the one version on the question belongs to this run. Nothing in the log says when it was written (a pass-1 compose is not logged, as r4 also found).
- **D7. A run costs 29.5 minutes and $1.48 and ends at 98% of its wallclock** with no answer; a longer text would hit the 30-minute bound. The open answer's `expires` (10 min) is passed 20 minutes before the end while the run is still "running".
- **D8. Held text needs a vouch first.** A just-uploaded file has no words until someone vouches (`release`); the question's run cannot read it before. Earlier walks (F1) said the same; nothing on the question says so.
- **D9. Member-facing exposure to check on screen:** the wizards offered to a plain member (above), the "update-ready" queue section, and the full member roster with `invited_by`.

## Not done
(c), (d) on screen; every Part B screenshot; Home at 1280 and 390 for walker. Needed: a Chromium that trusts the session's egress CA, set up by the person who owns that environment.
