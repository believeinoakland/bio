# Re-walk after fix round 10, area B (re-walker B)

Copy biosmoke8, walked 2026-10-26 about 11:35Z to 11:50Z. Reached only through the environment proxy (Chromium `/opt/pw-browsers/chromium`, `playwright-core`, proxy `HTTPS_PROXY`, default HOME); signed in through the sign-in screen as administrator and as member, each in its own context, at 1280 and 390 px. No credential, token or link printed. Nothing refused by a safety check. Find was walked read-only (no capture made); F-B15 on two held PNGs found by search (INFO-2026-0097, INFO-2026-0071). Times are wall (proxy included) from Enter to the page quiet (my fixed 2 s wait included); every call below answered 200, `meaningrows;dur` 296 to 1500 ms on the common words.

| row | 1280 admin | 1280 member | 390 admin | 390 member |
| --- | --- | --- | --- | --- |
| F-B8 common word (`budget`, `council`, `ordinance`, `ledger`, `café`, `alpha`) | FIXED | FIXED | FIXED | FIXED |
| F-B9 `ordinance OR zzzqqq`, `"alpha-B-1-p1-l1 council"` | FIXED | FIXED | FIXED | FIXED |
| F-B10 (a) widen, `alpha-B-6-u3-kbody zzzqqq`, `ordinance zzzqqq` | NOT FIXED | NOT FIXED | NOT FIXED | NOT FIXED |
| F-B10 (c) NOT / `(a OR b) AND NOT c` | FIXED | FIXED | FIXED | FIXED |
| F-B11 words of "What this search covered" | FIXED | FIXED | FIXED | FIXED |
| F-B15 a picture's safe view says so once | FIXED | FIXED | FIXED | FIXED |
| F-B14 | not live (not walked) | | | |

## F-B8: FIXED (all four)
Case: Find, typed each of `budget`, `council`, `ordinance`, `ledger`, `café`, `alpha`, Enter. Before: "This could not be read. Try again in a moment." (502 `STORE_DID_NOT_ANSWER`). Now: the passage call `op=meaningrows&q=passage:<word>&rows=passage&limit=200` answers 200 every time for all six words, at all four role/width pairs (`budget` `meaningrows;dur=1454`, `council` 814, `ordinance` 1081, `ledger` 1345, `café` 1150, `alpha` 328); the page draws "IN WHAT THE DOCUMENTS SAY", "200 of 1773 files shown." for `budget` (1751 for `ledger`, 1755 for `café`) and, for `alpha`, "46 passages in 12 documents match"; no "could not be read" on any screen. About 2.1 s wall each. No horizontal scroll at 390.

## F-B9: FIXED (all four)
Case: `ordinance OR zzzqqq`: the page sends `meaningrows&q=passage:ordinance OR passage:zzzqqq` (200) and draws the 5 title matches and the passage rows (no false "Nothing"). `"alpha-B-1-p1-l1 council"`: sends `meaningrows&q=passage:"alpha-B-1-p1-l1 council"` (200) and draws "Looks at what the documents say, passage by passage. 1 passage in 1 document matches." with the passage "alpha-B-1-p1-l1 council alpha-B-1-p1-l2 council ..." from "Material handed in at the doorbell on 26 October 2026". About 2.1 s.

## F-B10 (a): NOT FIXED (all four; shots/rewalk-B/F-B10a-member-1280.png, F-B10a-member-390.png)
Case: `alpha-B-6-u3-kbody zzzqqq` (words only in passages). The page now asks the passage route (`meaningrows&q=passage:alpha-B-6-u3-kbody passage:zzzqqq`, 200) but draws: "No document holds all of the words “alpha-B-6-u3-kbody zzzqqq” together. ... Capture it" then the heading **"When some documents hold only some of the words" with nothing under it** (the next thing is "What this search covered"). No wider reading is offered and nothing can be opened. This is the K5275 state (the passage widening's count withheld pending a design sentence), so the member sees an orphan heading. `ordinance zzzqqq` shows the fields-grain count only: "Documents holding at least one of the words: 5." with no list or button to open them (the former F-B10 (b), not a round-10 row). Severity MAJOR for the walker's case as before (no wider reading offered; plus a heading with an empty body, MINOR).

## F-B10 (c): FIXED (all four)
Case `council NOT zzzqqq alpha-B-1-p1-l1`: now finds "2 passages in 1 documents match" (passages of the doorbell material), so no widening is drawn and the old "Documents holding at least one of the words: 109" (the whole record) does not appear. `(ordinance OR council) AND NOT zzzqqq`: "11 documents match" titles/notes plus passages; none of the documents holding `zzzqqq` is a problem (none exist), no all-record count. Empty NOT cases (`council NOT zzzqqq qqqnotthere`, `ordinance zzzqqq NOT budget`) answer plain "Nothing your team holds matches ..." with no widening, so no wrong count is drawn.

## F-B11: FIXED (all four)
"What this search covered", row "Findings and connections", now: "Undetermined, because nobody has yet said whether a finding rests on what was found here; the Cited column beside each result says it for that result". No backtick, no `content:cited`, no "meaning level", no "rows" on any screen of the 48 searches.

## F-B15: FIXED (all four)
Case: a held PNG (INFO-2026-0097 and INFO-2026-0071), Document page, then "Open the file" (Opening a file). Now the page has no "Read it in the safe view below", no "each page as a picture" and no "Show the safe view" button (count 0); the safe-view section says once: "Your team's Civicsmith makes safe views of documents, presentations, spreadsheets and plain text, and this file is none of them, so it has no safe view." followed by "Ask for a deeper check" and "Open the original on your own device" with the warning. 3.4 to 5.8 s wall including the Document page's load. No horizontal scroll at 390.

## New findings
- MINOR (Find, passage section): the count line reads "200 of 1773 files shown." for passages (a count of passages, not files); and "2 passages in 1 documents match" (grammar).
- MINOR (Opening a file, a picture): the deeper-check paragraph still says "The safe view needs no check." beside a sentence that this file has no safe view.
- MINOR (F-B10 (a) above): the empty "When some documents hold only some of the words" heading.

Rows fixed of rows walked: 5 of 6 (F-B8, F-B9, F-B10 (c), F-B11, F-B15 fixed; F-B10 (a) NOT FIXED); F-B14 not walked (not live).
