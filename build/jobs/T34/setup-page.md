# setup-page (T34)

**Status** · session_01WfW58j4sjUPP7j6BfdTRs3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings I am building on; each is the page's own detail unless you say otherwise.

1. **R21 voice before sign-in (K1821 (2)).** Strings shown at `/` to a reader with no session (the unread and none group lines, loading, unarmed, claim, sign-in, "not answering", already-claimed, enrolment) say "this group's Civicsmith" or need no name; R1's *recorded* line keeps R1's own words, "your group's Civicsmith". Signed-in strings say "your group's Civicsmith". E.g. "Claim this group's Civicsmith", crumbs "Your group's Civicsmith".
2. **R20, the offices section.** No op lists a group's offices, and `op=profiles` carries no counterparties. Reading: the section treats "no active profile names an office" as `op=profiles` answering no active profile, or an answer whose `offices` field (if a later `instance-setup` adds one) is empty; it names R60's place from `op=placewantedstate`; the offices it lists are the ones added through `op=entitycreate` (kind `office`, label, the administrator's note) in this visit, each marked "added by your group". A read of the group's offices (entities by kind) would be another module's op: I report it, not build it.
3. **R22, "once `enroll` has signed the new member in".** `enroll` answers no session. Reading: on `enroll`'s success the page signs the member in with `op=login` (`member:<handle>`, the password just set; a public op R3 already allows), then sends `op=memberlanguageset {language}` with that session, then shows the panel. The choice is a BCP 47 tag field filled from the device's setting (`navigator.language`). "The account screen" on this page is the healthy panel (every signed-in member); members and keys offers it too.
4. **R23, "Who your group is".** This page has no such section today. Reading: I add it to members and keys (administrators only): focus and purpose read from `op=groupdescription`, kept through `op=groupdescriptionset` carrying the latest record's `kinds`, `otherKind` and `visibility` unchanged (R109 appends a whole record). The "help write" act appears only while `assistantstate` reads on, asks the questions (plain words until the design stream's), and sends `op=groupdescriptiondraft {answers}`.
