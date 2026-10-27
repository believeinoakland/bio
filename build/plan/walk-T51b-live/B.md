# Live walk of 0.87.0, area B (walker B): finding documents and capturing content

Copy biosmoke8, `/version` reads `0.87.0`. Walked 2026-10-27 from about 05:50Z (my clock). Reached through the environment proxy only (Chromium `/opt/pw-browsers/chromium`, `playwright-core`, `proxy: HTTPS_PROXY`, default HOME), one browser launch per act, own context per role and width. Signed in through the sign-in screen as administrator ("sparky") and member ("walker"); credentials, tokens and links never printed or committed (the knock secret phrase of the 390 px knock is not recorded here). My project: "Walk 087 B" (PROJ-2026-2526-walk-087-b, findable). Files: `bio-plane/test/corpus.mjs`, seeds `live087-B-<n>`. Four other walkers worked at the same time, so the copy was not quiet. Times: wall clock from the act to the page quiet (proxy included) and `Server-Timing` `dur` of the act's own call; K4354 bars are 2 s (drawn or answered) and 15 s (web capture); MAJOR over 5 s.

Severity: BLOCKER a journey cannot complete; MAJOR wrong result, error, over 5 s, or a member would not understand; MINOR layout, wording, or over the 2 s bar but under 5 s.

## Journey (f) From a knock to the record

| step | width | role | result |
| --- | --- | --- | --- |
| f1 Someone knocks (`/app/doorbell`, no account) | 1280 | knocker | OK. Page drawn in 2.4 s on a warm second load (7.2 s on the very first cold load, proxy included, one `bootstrap` 478 ms and `groupidentity` 133 ms). A PDF (3.3 kB) with a note and my own secret phrase: "Received on October 27, 2026. A member of the team will read it. Keep the reference and the date ...", "Fingerprint of what you sent: 86961f12…3a8d3c35", "Size: 3.3 kB", "Your pseudonym: knocker-...", "Your reference: KNOCK-2026-10-27-66ca56e2". Click to receipt 2.6 s wall. shots/B/f1-receipt-1280.png |
| f1 | 390 | knocker | OK. A PNG (6.4 kB) with "Make one for me": receipt shows the secret phrase once with "Write it down now. This page shows it once and nobody can show it to you again; without it you cannot answer a request to publish something about you.", reference KNOCK-2026-10-27-83158184. `knock;dur=421`, click to receipt 0.54 s. No horizontal scroll. (shot withdrawn: it showed the knock secret phrase) |
| f2 Member reads the inbox (`/app/inbox`) | 1280 | administrator | OK. Both new knocks listed first ("6 KB handed in on October 27, 2026 / New / png-....png · image/png / Their note: ..."). 2.3 s wall, `inbox;dur=133`. shots/B/f2-inbox-admin-1280.png |
| f2 open one knock | 1280 | member | OK. 0.53 s; `inboxget;dur=380`. Fingerprint, the five-level strip (Unknown ... Public) with its sentence, "Move into the record", "Why discard it? (asked before anything is discarded)", "Discard with a reason". shots/B/f2-knock-MEMBER-1280.png. See LB-5 |
| f2 Discard with no reason | 1280 | member | OK. "Say why first: a knock is discarded only with a reason, and it stays as it was until you give one." Nothing changed |
| f2 Discard with a reason | 1280 | member | OK. State "Discarded", "Discarded: “live087-B walk: testing discard”", `inboxresolve;dur=186`. shots/B/f2-discarded-1280.png |
| f2 Put it back, no reason, then with a reason | 1280 | member | OK for the refusal ("Say why first ..."). The put-back with a reason did not show its answer within 1.8 s (no call had answered yet); the later look showed "Put back in the inbox as new. The discard and its reason stay on the record." and a `inboxresolve;dur=2870` on the next act (see LB-4) |
| f2 Pull ("Move into the record") | 390 | member | OK in result: "Moved into the record. It waits in Held captures until a member vouches for it." Result drawn 3.1 s after the press; `inboxpull;dur=2600` (over the 2 s bar). shots/B/f2-pulled-member-390.png. LB-4 |
| f2 Pull | 1280 | member | State read afterwards "In the record"; the screen at 4.1 s after the press still showed the knock "New" with the "Move into the record" button and the old "Put back ..." line (the pull was done: a reload read "In the record"). LB-4 |
| f3 What is known of the source grows (`/app/about-knocker/<fingerprint>`, reached by the "A source" link on the pulled knock) | 1280 | member | OK with findings. Page drawn 3.1 s wall. A disclosure (Occupation, "The source said it themselves", one member, my evidence) recorded: `sourcedisclose;dur=193`, 1.6 s; the page then lists "Occupation / Told by the source themselves · known to the team". LB-2 (the "Which person" list), LB-19 |
| f3 | 390 | member | OK (read): no horizontal scroll, `[object Object]` also here (LB-2) |
| f3 | 1280 | administrator | read only: same page, same LB-2 |

## Journey (b), capture steps and Find

### Find (`/app/finder`), 1280 and 390, administrator and member

| step | result |
| --- | --- |
| Open Find | OK at all four pairs: "Search everything your team holds, then hold a set together to act on it." No horizontal scroll. First h1 0.8 to 2.6 s, network idle 2.1 to 4.4 s (five walkers working; over the 2 s bar on several loads, LB-15) |
| Show (Documents, Questions, Actions, People and organizations, Plans, Everything), Only (New since you last looked, Watched by you, Flagged for a second look, Anything), Show as (A list, One table) | OK, member 390 and administrator 1280: each answers by itself, `browse;dur` 133 to 366 ms, wall 2.2 s (my fixed 2.2 s wait). Counts: member "156 items · 101 awaiting review" documents, "16 items" questions; administrator "244 items", "20 items". "Watched by you" and "Flagged for a second look": "Nothing here". No overflow |
| A rare word (`live087-B-6-u1-kbody`, `live087-B-4-R201-C1`) | OK at all four pairs: "IN WHAT THE DOCUMENTS SAY ... 1 passage in 1 document matches." and the passage with its source; wall 1.5 s (2.5 s with my fixed wait), `search;dur` 138 to 400 |
| A common word (`council`, `ordinance`) | OK, F-B8 of the alpha walk (a 502 on a common word) is gone: "IN TITLES, NOTES AND DETAILS ... 13 documents match." and "IN WHAT THE DOCUMENTS SAY" with passages; `search;dur` 509 to 1091 ms, `meaningrows;dur` 548 to 1173. But LB-1 (raw record text in the matches) and LB-9 ("200 of 1809 files shown.") |
| A quoted phrase (`"live087-B-6-u1-kbody council"`) | OK: "1 passage in 1 document matches." |
| `live087-B-6-u1-kbody OR zzzqqq` | OK: the passage is found |
| `council NOT zzzqqq live087-B-6-u1-kbody` | OK after a delay: 1.5 s after Enter the screen read "Still loading" with no call in flight; settled at 2.0 s with "2 passages in 1 documents match." (LB-10, LB-18) |
| An AND that finds nothing (`live087-B-6-u1-kbody zzzqqq`, `ordinance zzzqqq`) | OK: "No document holds all of the words “...” together. ... Try fewer or other words, or capture the record from where it is published." with "Capture it", then "When some documents hold only some of the words / Passages holding at least one of the words: 1." and the button "Search for any of the words" (documents grain: "Documents holding at least one of the words: 13." and a button labelled only "Search", LB-11). Pressing it: box becomes `... OR zzzqqq`, results drawn in 3.0 s wall (`search;dur` 147 to 211, once 2420 while another walker acted). At all four pairs, no overflow |
| A word nobody holds (`zzzqqqnothing`) | OK: "Nothing your team holds matches “zzzqqqnothing”. Search finds only what has been captured ..." |
| What this search covered | "Findings and connections / Undetermined, because nobody has yet said whether a finding rests on what was found here; the Cited column beside each result says it for that result" (the F-B11 code words are gone), "Passages were read from 129 of the 200 documents searched. The other 71 have not been read passage by passage yet, so their words were not searched." and a fourth row "10 / we looked and got part of it" (LB-8). shots/B/find-covered-1280.png |
| See where nobody looked (member 1280) | OK: "Nobody has looked yet at 66 places your team holds." then a list of addresses; six calls, 3.0 s wall (`frontier;dur` 202 to 415) |

### Add

| step | width | role | result |
| --- | --- | --- | --- |
| Add (`/app/capture`) tabs: From an address, A file or photo, What I saw or heard, Watched addresses, Leads | 1280/390 | both | OK, drawn; first h1 2.0 to 2.8 s on the three Add screens under load (LB-15) |
| A file: PDF (3.3 kB, the knock's file again) | 1280 | administrator | OK: "Your team's record already held exactly this file. Nothing new was written; your account of it is kept as a second sighting." with "Open it". `captureupload;dur=945`, 2.6 s wall |
| A file: scanned PDF (10 kB, 2 pages) | 1280 | administrator | OK: "Captured: pdf-....pdf. It waits in Held captures until you or another member vouches for it." then "Kept. The reading follows: its words can be found and cited once it has been read." `captureupload;dur=1257`, `promote;dur=274` |
| A file: spreadsheet (XLSX 10.7 kB, 200 rows) | 1280 | administrator | OK: `captureupload;dur=1789`, 3.1 s wall; the Document page says "Read 1005 of 1005 words" |
| A file: office file (DOCX) | 1280 | administrator | OK in result; `captureupload;dur=3923` (over the 2 s bar, under 5 s), 5.6 s wall (LB-15) |
| A file: picture (PNG, the knock's file again) | 390 | member | OK ("already held ... second sighting"), 1.0 s |
| A file: CSV (13 kB), PowerPoint (PPTX 9.9 kB), plain text (4 kB) | 390 | member | OK: each "Captured: ... It waits in Held captures until you or another member vouches for it."; `captureupload;dur` 998 to 1162, 2.6 s wall (my fixed wait) |
| A file: every file | both | both | no project field on the form; every capture is "No project yet" (LB-16) |
| From an address: a text page (rfc-editor.org rfc6761.txt) | 1280 | member | OK: "Captured: A page from www.rfc-editor.org, captured October 27, 2026. It waits in Held captures until a member vouches for it." `acquire;dur=2614`, about 3.5 s wall |
| From an address: a PDF (irs.gov f8821.pdf) | 1280 | administrator | OK: "Captured: Form 8821 (Rev. January 2021)." `acquire;dur=2021`, 3.1 s wall |
| From an address: a page as a visitor saw it (iana.org/domains/reserved) | 1280 | member | OK: "Captured:" in 6.9 s wall (`acquire;dur=5263`, inside the 15 s bar) |
| From an address: an address already held, as a visitor (iana example-domains) | 390 | member | OK: "Already in the record as Example Domains / captured by / walker, October 26, 2026 · whether the site still gives the same document isn't known yet / Open it / Capture the new copy / Leave it"; after "Capture the new copy": "Already in the record as Example Domains: your team holds exactly this document. Nothing new was saved." |
| From an address: a site that refuses (w3.org/TR/PNG/) | 390 | administrator | OK: "The site refused to give the page to your team's Civicsmith. Try again later, or save the page yourself and add it as a file." (`acquire` 502 in 320 ms) |
| From an address: empty | 1280 | administrator | OK: "Fill in the Address first: it is needed to capture." |
| From an address: "not an address" | 390 | administrator | FAIL, LB-6 |
| What I saw or heard: empty, words only, a time later than now, a good account | 1280 / 390 | member / administrator | OK: "Before it is recorded, say: In your own words, Where, When." then "Before it is recorded, say: Where, When." then "Give the day and time you saw or heard it, no later than now." then "Recorded as your testimony: live087-B walk MEMBER 1280: I saw the pothole on Telegraph near 40th still unfil…. It waits in Held captures like any capture." No overflow. LB-17 |
| Leads: empty, then a lead | 390 | member | the lead is written ("YOUR LEADS ... Open a lead / Nobody has looked yet", `lead;dur=165`, 2.6 s wall); the empty press says "Say why first: this act is sent only with your reason." LB-7 |
| Watched addresses (`/app/watching`) | 1280/390 | administrator | drawn; `namedrequests;dur=3268`, network idle 8.4 s at 1280 under load (LB-15) |

### Held captures, the Document page, vouching and the safe view

| step | width | role | result |
| --- | --- | --- | --- |
| Held captures (`/app/held`), "Whose captures: Mine / Everyone's" | 1280/390 | member | OK in result: my uploads and address captures are listed with "Awaiting review · Received, not fetched: it earns no capture grade of its own. Captured today · No project yet · uploaded by walker, October 27, 2026 · 13 KB". The list is oldest first, so today's captures are the last of 33 rows with no way to search it (LB-20); the two pulled knocks read "Material handed in at the doorbell on 27 October 2026 ... From knock:KNOCK-2026-10-27-66ca56e2 / Refused / Open it to vouch for it by itself." (LB-14). No overflow |
| Document page (xlsx, docx, csv, pdf, knock pdf) | 1280/390 | both | drawn 1.3 to 2.7 s; read count ("Read 1005 of 1005 words"), fingerprint, the words with "Cite this", the record of the copy, no overflow at 390. LB-5 |
| Vouch for this copy: empty, ack only, both | 1280 admin (docx), 390 member (pptx) | | OK: "Say what you checked, and what the team does about what remains." twice, then "Vouched for by sparky, October 27, 2026. Your team can use this copy." (`release;dur=251` to 252, 0.85 s) |
| Opening a file (`/app/open-file/<sha>`) | 1280/390 | both | page read: "HIGH RISK / Added by you, not fetched by your team's Civicsmith: every such file is high risk, yours included.", "What to do next", "THE SAFE VIEW", "ASK FOR A DEEPER CHECK", "CHECKS", "OR OPEN IT NOW, WITHOUT A DEEPER CHECK". No overflow |
| Safe view of a Word file, a PowerPoint, a scanned PDF | 1280/390 | | LB-3. The call answers (`safeview;dur` 622 to 736 ms) and a 73 to 204 kB PDF is downloaded; the screen says "The safe view is open below: each page as a picture, so nothing in it can run." and nothing is below. The F-B14 failure ("could not be made") is gone for new files |
| Safe view of a CSV, an XLSX, a plain-text file | 1280 | administrator | OK: "Sheet: csv / CELL VALUE / A1 café_1 ...", a table, `safeview;dur` 472 to 550 ms; for text "Your own plain-text file, shown as text. Nothing in it is run." |
| Safe view of a picture | 390 | member | "Your team's Civicsmith makes safe views of documents, presentations, spreadsheets and plain text, and this file is none of them, so it has no safe view." The button is gone, the "Read it in the safe view below" line of the alpha walk is gone. LB-13 |
| Doorbell as administrator and member (not a knocker) | both | | pages drawn 0.1 s first content, 1.3 s idle |

## Re-walk 11, area B rows not FIXED (each at its exact case)

| row | 1280 admin | 1280 member | 390 admin | 390 member |
| --- | --- | --- | --- | --- |
| F-B10 (a) `alpha-B-6-u3-kbody zzzqqq` (re-checked as a regression) | FIXED | FIXED | FIXED | FIXED |
| F-B10 (a) `ordinance zzzqqq` (regression) | FIXED | FIXED | FIXED | FIXED |
| F-B14 (a Word file's safe view; the walker's own `docx-8d42d898652f5a8b1020d342.docx`, INFO-2026-0192) | NOT FIXED | NOT FIXED | not walked at this width | not walked |
| "200 of 1773 files" count line (now "200 of 1809 files shown.", query `ordinance`, member 1280) | NOT FIXED | | | |
| "1 documents" (now "2 passages in 1 documents match.") | NOT FIXED | | | |
| "The safe view needs no check." | NOT FIXED (still on every Opening a file page, also on one that says the file has no safe view) | | | |
| widen buttons: bare "Search" under the documents count vs "Search for any of the words" | NOT FIXED at all four | | | |

F-B14 detail: at the exact case the Opening-a-file page says "Civicsmith cannot make a safe view of this kind of file. It is kept as it was handed in. Nothing was shown." for the old Word file, while a Word file I captured today (`docx-bb75402a5b60e285bfebb17c.docx`) makes a safe view. So the renderer works; the old failed record stays failed (the retry for a file failed under an earlier renderer, file-safety R59, has not made its view). Rows fixed of rows walked: 2 of 4 distinct cases (F-B10 (a) both cases); the other five rows are NOT FIXED. shots/B/safeview-MEMBER-1280-oldalphadocx.png was not taken; the text is quoted from the run.

## Dead-end census

- The source page ("A source") is reached only from a pulled knock's inbox page: the Document page and Held captures of a pulled knock carry no link to it ("Material handed in at the doorbell ..." row offers only "Open it").
- A photograph cannot be looked at in the app: its Opening a file page has no safe view and says so, leaving "Open the original on your own device" (LB-13).
- Safe view of a Word file, a PowerPoint, a PDF: the press shows nothing; the result is a downloaded file the screen never mentions (LB-3). The act's result is nowhere to be seen.
- A pulled knock in Held captures carries the word "Refused" beside it (LB-14); a member reads it as the knock having been refused.
- A mistyped address: a sentence about "an argument" and "the shape it must take" with nothing beside it (LB-6).
- Add a file: no project field and no word on how to put the capture into a project (LB-16).
- Held captures: no search or sort; today's captures are at the foot of the list (LB-20).
- Words a member would not understand, quoted: "recorded 2026-10-27T05:57:00Z for resolution through the task list", "no authority is asserted", "xlsx text-layer text (tier 1)", "the tier-2 decoder", "recorded as an empty reading, never an emptied document", "Undetermined" (Document page); "Dana Reyes, [object Object]" (source page); "## Session Log ### Session 2026-10-26T06:56:34Z | Recorded | member:admin Changes: standard recorded." and "(object Object)" (Find results); "From knock:KNOCK-2026-10-27-66ca56e2" (Held); "10 / we looked and got part of it" (Find, what this search covered).

## (e) Delegating to the assistant

Not walked. The banner on every screen says "This is a test Civicsmith. Parts of its assistant haven't yet passed Civicsmith's tests, and each answer they give says so." which states plainly it is not ready.

## Findings

Seeds `live087-B-<n>` are in the file names. No BLOCKER: every journey step of (f) and of (b)'s capture and find steps completed.

### MAJOR
- LB-1 (Find, query `ordinance`, member 1280, and the same at the other pairs; 05:5x to 06:1xZ): the documents grain "IN TITLES, NOTES AND DETAILS" shows raw record text as the match: "## Citation Alpha Roof Maintenance Ordinance, section 3 ## Issuer ENT-2026-0005 ## Reason The council minutes state this rule ## Source Undetermined: your team's Civicsmith has no active jurisdiction profile ... ## Session Log ### Session 2026-10-26T06:56:34Z | Recorded | member:admin Changes: standard recorded.", and "(whether it was in force is undetermined: the act's event is placed nowhere (object Object))" (design: a match shows the words that matched, in sentences). Time `search;dur` 1091.
- LB-2 (source page `/app/about-knocker/<fingerprint>`, "Say who this is", "Which person", all four pairs, 06:0xZ): the list reads "Dana Reyes, [object Object]" and "Miguel Alvarez, [object Object]".
- LB-3 (Opening a file, "Show the safe view on this page" for a Word file, a PowerPoint, a scanned PDF; 1280 and 390): after the press the screen says "The safe view is open below: each page as a picture, so nothing in it can run." and nothing is drawn below it; the browser is handed a PDF download (73 618 B for the docx, 151 571 B scan, 204 579 B pptx) the screen never mentions (design: the safe view is read on the page, journey (f)/(b) "Opening a file"). `safeview;dur` 622 to 1360 ms.
- LB-4 (F-B14, the walker's exact case, Opening a file for `docx-8d42d898652f5a8b1020d342.docx`, member 1280, 06:08Z): "Civicsmith cannot make a safe view of this kind of file. It is kept as it was handed in. Nothing was shown." while a new Word file works (see the re-walk table). A member's older Word files stay unviewable.
- LB-5 (Document page, every document, 1280 and 390): "Undetermined / a file a member brought into the record, which no one fetched; no authority is asserted; recorded 2026-10-27T05:57:00Z for resolution through the task list October 27, 2026"; "the generic reader found no entities in this document's xlsx text-layer text (tier 1); recorded as an empty reading, never an emptied document"; for a PDF "3 page(s) were re-read by the tier-2 decoder, which recovered text tier 1 could not map and more of it; the other 0 page(s) kept tier 1's reading": a member would not understand.
- LB-6 (Add, From an address, the text "not an address", 390 administrator, 06:2xZ): "This request left out an argument the operation cannot run without, or sent one in a shape it does not accept. Nothing was changed. The argument and the shape it must take are named beside this message." and nothing is beside it (design: say the address is not one and what to do). 1.6 s.
- LB-7 (Add, Leads, "Write down the lead" with both boxes empty, 390 member): "Say why first: this act is sent only with your reason." The form has no reason box (the button says "Asks for a reason").
- LB-8 (Find, "What this search covered", no match, all pairs): a fourth row with no heading: "10 / we looked and got part of it" beside the list of what was searched, so the member cannot tell what is ten. shots/B/find-covered-1280.png.

### MINOR
- LB-9 (Find, passage grain, `ordinance`, member 1280): "200 of 1809 files shown." counts passages as files (known gap, NOT FIXED).
- LB-10 (Find, `council NOT zzzqqq live087-B-6-u1-kbody`): "2 passages in 1 documents match." (known gap, NOT FIXED).
- LB-11 (Find, widen under the documents count): the button reads "Search" beside the page's own Search button; the passage one reads "Search for any of the words" (NOT FIXED, all four pairs).
- LB-12 (Opening a file): "The safe view needs no check." under "Ask for a deeper check", also on a page that says the file has no safe view (NOT FIXED).
- LB-13 (Opening a file, a picture, member 390): "so it has no safe view": a member cannot look at their own photograph in the app (the alpha's F-B15 misleading line is gone).
- LB-14 (Held captures, pulled knocks): the row title is "Material handed in at the doorbell on 27 October 2026" (the file name is lost), beside it "Refused" and "From knock:KNOCK-2026-10-27-66ca56e2" (F-B13 of the alpha walk, still).
- LB-15 (times): inbox "Move into the record" `inboxpull;dur=2600` (bar 2 s); `captureupload;dur=3923` for a DOCX; Watching `namedrequests;dur=3268`, idle 8.4 s at 1280; first heading of Find, Add, Held, Inbox and a Document 2.0 to 2.8 s at 1280 (others working at the same time, every call 130 to 700 ms). All under 5 s except the watching idle.
- LB-16 (Add, A file or photo): no project field; "No project yet" on every capture and the Document page says nothing of how to add it to one (alpha F-B17, still).
- LB-17 (Add, What I saw or heard): the form carries the photo paragraph "Frame what you are checking, and leave out people's faces and number plates ... in the public copy" although there is no photo.
- LB-18 (Find): "Still loading" shown for about 1.5 s after Enter with no call in flight, once (the `NOT` query), at 1280 member.
- LB-19 (source page): a recorded entry shows only "Occupation / Told by the source themselves · known to the team", not what was recorded, and the page does not say how to read it (alpha F-B6, still).
- LB-20 (Held captures): no search, oldest first: a member's own captures of today are the last rows of 33.
- LB-21 (inbox, "Move into the record" at 1280, 05:5xZ): 4.1 s after the press the knock still read "New" with the button and the old "Put back in the inbox as new" line; a reload showed "In the record". Seen once, not reproduced at 390 (there it read "Moved into the record." in 3.1 s).

Journeys completed of journeys walked: 2 of 2 ((f) From a knock to the record, and (b)'s capture and find steps), plus Find, Add (address, PDF, scan, picture, spreadsheet, office file, observation, lead), held captures, Inbox, the Document page and its safe view as screens; all at 1280 and 390, administrator and member where the screen has both.

Leftovers I made: project "Walk 087 B" (PROJ-2026-2526-walk-087-b, findable, empty), two knocks (one discarded then put back, both pulled), one disclosure on a source, uploads (xlsx, docx, scan pdf, csv, pptx, text), three address captures (rfc6761.txt, f8821.pdf, iana reserved domains), three testimonies, one lead, two vouched copies (docx by administrator, pptx by member).

Credential note: the 390 px knock receipt shows a throwaway knock phrase; its screenshot was withdrawn in a later commit (it stays in the earlier commit of this branch).
