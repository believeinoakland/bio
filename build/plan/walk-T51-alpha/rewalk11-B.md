# Re-walk 11, area B (walker B)

Copy biosmoke8, walked 2026-10-26 about 18:48Z to 18:53Z. Reached only through the environment proxy (Chromium via `playwright-core`, proxy `HTTPS_PROXY`, default HOME); signed in through the sign-in screen as administrator and as member, each in its own context, at 1280 and 390 px. No credential, token or link printed. Nothing refused by a safety check. The deployed tip could not be confirmed by me: the unauthenticated `/version` and `bootstrap` answer only "0.86.0", no commit name. Column 2 and 3: none for B; F-B14 (ZIP64) and B's three MINORs (the "200 of 1773 files" count line, "1 documents", "safe view needs no check") are known gaps, not walked.

Times: from Enter to the page quiet (my fixed 2.5 s wait included), about 2.55 s each; every call answered 200 (`search;dur` 558 to 563 ms, `meaningrows;dur` 559 to 564 ms).

| row | 1280 admin | 1280 member | 390 admin | 390 member |
| --- | --- | --- | --- | --- |
| F-B10 (a) `alpha-B-6-u3-kbody zzzqqq` | FIXED | FIXED | FIXED | FIXED |
| F-B10 (a) `ordinance zzzqqq` | FIXED | FIXED | FIXED | FIXED |
| F-B14 | known gap (not walked) | | | |

## F-B10 (a), `alpha-B-6-u3-kbody zzzqqq`: FIXED (all four)
Case: Find (`/app/finder`), typed the words, Enter. Before (re-walk 10): the heading "When some documents hold only some of the words" with nothing under it. Now, under that heading: "Passages holding at least one of the words: 1." and a button "Search for any of the words". Pressing it: the box becomes `alpha-B-6-u3-kbody OR zzzqqq`, the page sends `op=search&q=alpha-B-6-u3-kbody OR zzzqqq` and `op=meaningrows&q=passage:alpha-B-6-u3-kbody OR passage:zzzqqq` (both 200) and draws "IN WHAT THE DOCUMENTS SAY ... 1 passage in 1 document matches." with the passage "alpha-B-6-u3-kbody ordinance" from `docx-8d42d898652f5a8b1020d342.docx`. No horizontal scroll at 390. Same at all four role/width pairs. Shots: `shots/rewalk11-B/member-1280-alpha-B-6-before.png`, `-after.png`, and the same for admin-1280, member-390, admin-390.

## F-B10 (a), `ordinance zzzqqq`: FIXED (all four)
Case as above. Now under the heading: "Documents holding at least one of the words: 8." and a button. Pressing it: the box becomes `ordinance OR zzzqqq`, the page sends `op=search&q=ordinance OR zzzqqq` (200) and draws "IN TITLES, NOTES AND DETAILS ... 8 documents match." with the 8 documents listed (opening them is possible). Shots: `shots/rewalk11-B/<role>-<width>-ordinance-before.png` and `-after.png`.

## New findings
- MINOR (Find, wider reading): the button under the documents-grain count is labelled just "Search" (the passage-grain one reads "Search for any of the words"); two different labels for the same act, and a bare "Search" beside the page's main Search button is ambiguous. Seen at all four pairs.

Rows fixed of rows walked: 2 of 2 (the two cases of F-B10 (a)); F-B14 and the three MINORs are known gaps, not walked.
