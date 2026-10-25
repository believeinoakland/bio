# Reading files: the decisions that are Bob's (READING-ARCHITECTURE, deliverable 5)

**Status** · Written by READING-ARCHITECTURE #2, 2026-10-23, from `OPTIONS.md`, `REQUIREMENTS.md` §6, `CHALLENGES.md` §6, and the questions in SHEET #1's report (`envelope-sheets-T51.md` §4.3, B-1 to B-8) and DOCS #1's report (`envelope-docs-T51-s4.md` §4.3, Q1 to Q11), which K4815 queued. It holds only what is Bob's under P17: the architecture at its high level, money, what members experience, and what a requirement means. Nothing here repeats a question his rulings already answer (K4628, K4630, K4632, K4803, K4809). The lane decides nothing. BOB renders this for Bob and records his answers as rulings.

---

## What this is about, in plain words

You asked us to step back from fixing reading problems one at a time and to understand the whole problem first (K4812). That work is done: the requirements, Cloudflare's limits, why reading keeps failing, and four ways to build it.

**Why reading keeps failing.** Today, all of a team's reading runs inside one small, shared space on Cloudflare: the team's record, which has about 128 MB of memory and does one thing at a time. The record itself already uses 50 to 87 MB of that. A large file therefore has to be read in a sliver of memory, on the same line of work that draws the member's screens. Our own software keeps track of what still needs reading and restarts it after interruptions. Each fix so far made one path work. The same failure then came back on another path, or in another kind of file. Nothing larger than 41.5 MB or 1,354 pages has ever been read on the live system. Your standard is 100 MB or 5,000 pages.

**What every option shares.** Every option below starts the same way. Each file gets one durable "reading job" before the member gets an answer. The answer comes within 2 seconds. The file is then read piece by piece, and each piece lands in the record as it is read. The member sees "being read, 1,200 of 5,000 pages", and can search what has landed so far. Each kind of file has one limit, and it is yours. This shared part removes about half of the failure types on its own.

The options differ in one thing: where the actual reading happens.

---

## 1. Where reading runs (the architecture)

**The choice.**
- **A. Keep reading inside the team's record, and harden it.** This adds the least that is new. It keeps the cramped memory and keeps screens slowing down while a file is read (Home took 7.7 seconds against about 3). Four rounds of hardening have not held.
- **B. Give each file its own small reading space, built by us.** Screens stay fast and there is more memory. We still build and maintain the machinery that restarts reading after interruptions.
- **C. Hand the "keep going until done" part to Cloudflare Workflows.** Workflows is a Cloudflare service built to carry long jobs through crashes and updates. Our own JavaScript still does the reading. Screens stay fast and interruptions cost seconds, not the whole read. Our hand-written readers remain, and they are where most failures come from. They would also have to be extended to the kinds your list requires that we cannot read today: .doc, .xls, RTF, email files, TIFF, HEIC, GIF and WebP.
- **D. As C, but the heavy files (PDFs, scans, Office files, archives, images) are read by long-established open-source tools on a larger Cloudflare machine (a "container", 4 GB or more).** These are the tools the rest of the world uses for these formats. Light files such as text, CSV and web pages stay as in C. Memory stops being the limit. Most of the kinds your list requires come with the tools rather than as new code we would write. About 900 KB of our most fragile code is retired, not repaired.

**Recommendation: D, built in stages.** The shared part comes first, then the Workflows carrier (C) for the light files. Then the heavy kinds move one at a time to the larger machine, each only after it has been shown on test files at your standard's sizes, and on a live trial, to read at least as faithfully as today's reader. C is the fallback if the larger machine disappoints. A is not a fallback: it keeps the cause of the failures.

**What would change it:** live trials showing the larger machine is unreliable or slow to start; Workflows losing work during updates; or you preferring to have no container charge at all. In that case the answer is C.

**Your decision:** A, B, C or D.

## 2. Money

**What it costs.** Reading is cheap under every option. A 100 MB PDF costs about 3 cents. A 5,000-page scan costs about 20 cents to $1.20, almost all of it the text recognition (OCR). At a modest team's month of about 1,000 files, the reading costs about $1 to $2.50 before Cloudflare's included allowances, and most of it falls inside them. The $5 monthly minimum is paid anyway. D adds one new line on the bill: the larger machine, about 7 cents an hour while awake, which sleeps when idle. At that load it comes to well under a dollar a month beyond the allowance. Cost does not decide between the options.

**The choice:** (a) accept the container line, with a cap on how many machines may run at once (BOB sets it) and the monthly figure reported to you; (b) no container charges (this means option C).

**Recommendation: (a).**

## 3. The alpha against your standard

**The situation.** Your standard (100 MB or 5,000 pages, and so on) is for the beta (K4632). You also said that, now, a file inside its limit is read whole and never fails (K4630, K4785). Today's alpha has seven smaller safety limits, set by BOB and reported to you but never put to you as cuts to your standard. For example, CSV files are read only up to 17 MB, images up to 24 MB, and the PDF reader up to 64 MB. The new architecture meets your standard, but it is built in stages.

**The choice:** (a) the alpha waits until your full standard is met; (b) the alpha ships with its current limits. Each limit is told to members in plain words, with the file's size and the limit, and is never shown as "read". Your standard is met by the beta through the stages above. (c) The alpha ships with its current limits, unstated.

**Recommendation: (b).** It is honest with members and does not hold the alpha hostage to the larger build. (c) would break K4571 (never a false expectation).

## 4. What two phrases in your standard mean

**"100 MB or 5,000 pages", "50 MB or about 1 million rows".** "Or" can mean "refused if over either limit" or "refused only if over both". *Options:* (a) refused above either one, with the reason stated ("6,200 pages, more than the 5,000 your team's Civicsmith reads"); (b) only above both; (c) bytes only. *Recommendation:* **(a).** A 50 MB file of 40 million short rows, or a small PDF of 20,000 pages, would take many hours and could not usefully be cited row by row or page by page.

**"Archives 500 MB total".** "Total" can mean the archive file as uploaded, or everything inside it once unpacked. Compressed files often unpack to several times their size. *Options:* (a) the archive file up to 500 MB, its unpacked contents up to 2 GB, and each file inside within its own kind's limit; (b) 500 MB unpacked; (c) keep today's 256 MB. *Recommendation:* **(a)**, DOCS #1's recommendation: a 500 MB zip of scanned records unpacks to more than 500 MB.

## 5. Time: what a member is told while a big file is read

**The facts.** On a quiet system, a 5,000-page text PDF takes minutes under D. A 5,000-page scan takes hours under every option, because recognising text in a picture is slow. It takes about 2 to 14 hours if pages go one at a time, and under 2 hours if several run side by side, which C and D can do. Nothing large has yet been timed on the live system. A 17 MB CSV has taken anywhere from 64 seconds to 19 minutes, for a reason not yet found.

**The choice:** (a) no promised time: the member sees "read 1,200 of 5,000 pages", an estimate marked "about" once the reading has gone far enough to measure, and a notice when it finishes or stops; (b) a promised maximum per kind (the family reports proposed 15 minutes for the largest text file and 2.5 hours for the largest scan); (c) progress only, no estimate.

**Recommendation: (a) now.** A promise like (b) can be considered once the live trials have measured real rates. A promise made before then would be a false expectation.

## 6. Safety and reading

**Does a safety hold stop reading?** Today a file is read and searchable whatever the virus scan says; only opening the original waits for the scan. The scanner has never yet run with virus signatures on the live system. *Options:* (a) keep this, and say it plainly; (b) read only after a clean scan, which would mean every file waits, possibly for a scanner that cannot yet answer; (c) read at once, but take a file's text out of search if the scan later finds a threat. *Recommendation:* **(a) for the alpha, (c) once the scanner has signatures.**

**Password-protected files.** You already ruled that such a file is marked as needing a password (K4803). Still open is whether a member may type the password so the file can be read. That password would be a secret the record must never keep. *Options:* (a) no, the file is stated "needs a password" and the member can upload an unprotected copy; (b) yes, used once and never stored. *Recommendation:* **(a) for the beta**; (b) can be revisited if members ask for it.

## 7. What counts as a document's text

**The situation.** Your standard says every document is read whole and searchable to the last line. Today only the body of a Word or OpenDocument file is read. Footnotes, headers, footers, comments, tracked deletions, text boxes and speaker notes are not, yet the reading says "whole". A footnote in a staff report is often where the dollar figure is. So these parts will be read; the question is how members meet them. *Options:* (a) everything is searchable by default, and each result says what it is ("a footnote", "a comment", "deleted wording"), so a citation names it; (b) read, but left out of search unless the member asks; (c) not read, stated. *Recommendation:* **(a).**

**Dates in Excel files.** Inside an Excel file a date is stored as a number (45123), so a search for "2024-05-01" finds it in a CSV or a Google Sheet but not in an Excel file. Fixing this means reading the cell's format, which reverses an earlier rule that a date implied only by formatting is not inferred. *Options:* (a) keep the rule and say so on the document's page; (b) treat such cells as dates and keep the original number beside them. *Recommendation:* **(b).**

## 8. Safety limits inside your standard

**The situation.** Within your size limits, a file can still be built to break a reader: a sheet with a million columns, a single cell of 50 million characters, a zip nested inside zips, or a picture of a billion pixels. Under K1881, a limit that changes what a member may do is yours. These limits are set at or beyond what ordinary programs ever produce, for example the 16,384 columns and 32,767 characters a cell that Excel itself allows. *Options:* (a) you accept them as a class: BOB sets each at or beyond what ordinary programs produce, a file over one is stated with its own figure (never silently cut), and the full list is reported to you; (b) each is brought to you one by one. *Recommendation:* **(a).**

## 9. Beyond your list

**The situation.** Your list for the beta is set (K4628), and every option must read it. Option D's tools can also cheaply read a few things the list does not name: TAR, GZ and 7z archives, which public bodies sometimes use for record exports, RAR, and text recognition in languages other than English. Searching Chinese, Japanese and Thai is a separate question, already queued with you (B-6), and is not repeated here. *Options:* (a) add TAR, GZ and 7z with the archive work, plus text recognition in the languages Oakland's public bodies publish in, Spanish first, but not RAR, whose licence restricts it; (b) your list only, for now; (c) all of them. *Recommendation:* **(a).** (BOB checks the tools' licences before any is used.)

## 10. Smaller choices about what members see (each can be accepted as recommended)

- **A large spreadsheet's preview** shows its first 1,000 cells and says so. *Recommendation:* add a "show more" that pages through the rest (a screen for the design stream).
- **The safe view of a very long document** shows the first 500 pages and says so. A safe view of 5,000 pages would be about 2 GB of pictures; the whole text stays searchable. *Recommendation:* keep 500 pages as a stated view.
- **"As a visitor saw it"** captures the page as it first loaded: not scrolled, banners not dismissed, no embedded frames. *Recommendation:* say exactly that in the copy's words now; add bounded scrolling and frames later.
- **A page that cannot be made out** (blurred, sideways, faint). *Recommendation:* turn it upright automatically. If under a fifth of it is legible, store no text and say "this page couldn't be read". If under four-fifths, keep the text and mark it partly legible.
- **Analysis workbooks over 50,000 cells.** Today a member cannot add a larger workbook for analysis, though it is still read as a document; the city budget books have 130,000 to 143,000 cells. Under K4632, adding is not interpreting. *Recommendation:* hold the workbook whole and work out only the cells a calculation or citation touches, up to 250,000 cells.

---

## Not asked, and why

**Already answered by your rulings.** These are applied, not asked:
- The largest file read per kind, and that nothing inside it is refused or left to fail (K4628, K4630; DOCS Q1, Q2; SHEET B-1's figures).
- That scans are documents with a 5,000-page limit (K4803).
- That .doc, .xls, RTF, TSV, JSON, XML, email files and the six image types are read (K4628 point 1; SHEET B-5; DOCS Q5; the image-types question B-S1).
- That an uploaded zip is opened and each file in it read (K4628).
- That a within-limit scan's unusual pages (tiled, progressive or CMYK pictures) are read or named page by page, never refused whole (K4630).
- That a large web capture answers at once and continues as "being fetched" (K4562).

**BOB's under P17, decided and reported, not asked.** Workflows, containers, tools, step sizes and thresholds. Which text encodings are read: older Windows and Latin-1 files will be read with the assumed encoding shown on the page, because your standard's "every file a member is likely to hold" requires it (SHEET B-8, DOCS Q4). How a 100 MB or 500 MB upload reaches storage if Cloudflare's plan caps it: straight to storage, not through the server. The doorbell's size cap. That an upload answers within 2 seconds (the architecture removes reading from the answer). The order of work, the live trials, and the migration.

**Queued with you elsewhere, not reading's architecture.** These stay in their own queue:
- Choosing and showing selective interpretation (N1269, N1272).
- The record split and capacity study (N1271, N1274), including what happens when a team's 10 GB record fills.
- The region picker (N1273).
- Chinese, Japanese and Thai search (B-6).
- Whether a member may see another project's name on a shared copy.
