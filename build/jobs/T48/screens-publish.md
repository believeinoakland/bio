# screens-publish (T48)

**Status** · session_01SX1xX1uwfBATDKqW7WH95V · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R18 needs the group's time zone and no read names it for review-copy. Best reading: review-copy also reads `publishpreflight` for the chosen draft (already in my Uses), takes `publish_at.zone` from it (case-authoring R75; the ceremony does the same), and computes the end of the chosen day in that zone in the browser (Intl) as a stamp-form instant. With `publish_at` null or `zone: null` (PUBLISH_AT_NO_ZONE) the screen refuses to share, with a new word of mine (`screen.review-copy.until.nozone`: "Set the group's time zone first, then share."), because a bare UTC end of day would silently end the link at the wrong hour. If you want a different source (a zone on `groupidentity`, UTC, the browser's zone), say which; I carry on with this reading.
Also, a note on R19: "Download the complete edition" through `publishedcase` with `cs.download`: `cs.download` saves only a non-JSON answer. If `publishedcase` answers JSON, nothing is saved and the screen draws the answer's refusal words or a "could not be downloaded" word of mine. I build it as written and will report what the test fixture shows.

## J2 · QUESTION

This replaces J1 (same questions, one more, and my best reading of each).
1. Zone for R18. No read names the group's time zone for review-copy. Best reading: when the member presses "Share with a named reader", the screen calls `publishpreflight` for the draft (already in my Uses), takes `publish_at.zone` (case-authoring R75, as the ceremony does), and computes the end of the chosen day in that zone in the browser as a stamp-form UTC instant. With no zone (`PUBLISH_AT_NO_ZONE`) it refuses with a new word of mine (`screen.review-copy.until.nozone`), because a bare UTC end of day would end the link at the wrong hour. The rows read the same preflight to show the chosen day in that zone.
2. The outside reader's date. `cs.date` draws an instant's UTC day. For a group west of Greenwich the end of 20 October is already 21 October in UTC, so `review-outside` (no session, no zone) would show the day after the one the member chose. Best reading: `review`'s copy answer for the recipient carries the group's zone beside `grant.until` (a plane change, `review`'s, not mine); until then `review-outside` draws the UTC day and I note the off-by-one in my record. If you prefer, tell me to draw the date and time with "UTC" named.
3. "Download the complete edition" through `publishedcase`. `cs.download` hands the browser a file only for a non-JSON answer; `publishedcase` answers JSON, so nothing would be saved. Best reading: build as written (so it draws the answer's refusal words, or "could not be downloaded") and you correct me if the intended bytes are the case file, `publishedbytes` with `sha256=<manifest_sha>&format=zip` (public-read R5, R23), which `cs.download` does save. I would then use that.

## J3 · COMPLETE

screens-publish T48 complete. R18, R19, R20, R21 met (merged origin/tranche/T48 through K3295 first).

Read (whole): build/requirements/screens-publish.md; my T48-75 entries in the plan; my module's src (all ten files) and the tests that name R1, R2, R6, R10, R17; interface-shell R10, R21, R30, R35, R49, R56, R61 and its kit (`cs.sec`, `state`, `act`, `download`, `date`); review R34; public-read R3, R5; case-authoring R75; civil-time (to not import it); the design's civicsmith.css and page.src.html for class names. Not read: other tests (run only).

Entries applied
- R18: `reviewgrant` calls `publishpreflight` for the draft, takes `publish_at.zone`, computes the end of the chosen day in that zone in the browser (Intl) and sends `until` as `YYYY-MM-DDTHH:MM:SSZ`; `recipient` is now "name · role" (the date is the grant's own field). Rows draw "can read Edition n until <date>" with the day in the group's zone (same preflight), "could read … until <date>: ended" for a lapsed grant, "until you stop sharing" with none. No zone, or a date that is no day, sends nothing and says why (`screen.review-copy.until.nozone`). `REVIEW_BAD_UNTIL` is drawn by `screen.review-copy.until.bad`; the form keeps what was typed. review-outside draws date and time with UTC named (K3295), from `copy.grant.until` only.
- R19: an evidence row with a full 64-hex sha opens its bytes through `publishedbytes` (public, no header); a row without one draws no hash and no link. "Download the complete edition" is `publishedbytes` with `sha256=<manifest_sha>&format=zip` (K3295), offered only with a full manifest hash. Both go through the registry's `publishedcase` act (its `send` branches on data attributes), because the registry lists the screen's acts as `verify`, `publishedcase` and a test checks that; I did not add an act. Refusals are drawn by their words; nothing is saved on a refusal. No "Verify any hash" panel.
- R21: `published` with no id draws "Nothing is here" with "Go to the group's public page" (`/`), never "Go to Home".
- R20: `cs-actrow`→`mk-acts`, `cs-note`→`mk-note`, `cs-list`→`mk-list`, `grp`→`mk-grp`, `ends`→`mk-explain`; the said-refusal is `cs-gap` as the shell draws one (R61). Sections that hold nothing are not drawn (readers, comments, leaves-out, people, disclosed, photos, findings, people named, evidence, imported findings, review-outside draft); no count at zero; a list with nothing draws the screen's one empty state (case-editor, imported, docket), their words now name the first step. A read that failed is still drawn failed.

A flaw of my own, fixed (P8): `casedrafts` (case-editor, review-copy) and `docket` were marked `subject: true` with an `empty` test, so the shell drew "Nothing is here" for a project with no draft or a case with no docket entry, never the designed empty state or the form that makes the first one. The subject is now the project's `image` read; `docket` keeps `subject: true` without `empty`. The old empty-read test passed only because the unavailable block also carries `data-state="empty"`.

New words (mine, inline in SCREEN_WORDS, for UX-DESIGN to key): screen.review-copy.reads.until / .ended / until.bad / until.nozone; screen.review-outside.until (now {date} at {time} UTC); screen.published.evidence.open / download / download.done / download.failed / grouppage. Reworded: review-copy.until.help, imported.none, docket.none. Removed as no longer drawn: noreaders, nocomments, leavesout.none, ack.none, people.none, changed.none, photos.none, published.nopeople / noevidence / nofindings, imported.nofindings.

Deferred: none.

Found in another module
- interface-shell: the kit's `cs.areas` draws `cs-areas`, which no served stylesheet defines (R56's list spells it `mk-areas`). The ceremony's Photos step draws it. My style test excuses that one class by name (KIT_OWN) until the shell's job renames it; remove the excuse then.
- interface-shell R35 (browser.mjs line 260): a `subject: true` read that answers empty draws "Nothing is here". R61 as worded covers refusals only; if empty is meant to stay "nothing", say so in the requirement so screens know not to mark list reads as the subject.
- review (N1081, next tranche): the copy answer should carry the group's zone beside `grant.until`; until then review-outside shows the UTC day and time, named.
- publishedcase still answers JSON, so it is not a download; I used publishedbytes as K3295 says.

Tests and checks
- node --test bio-plane/test/m/screens-publish/: tests 68, pass 68, fail 0 (new: style.test.mjs for R20; R18 and R19, R21 in review.test.mjs and public.test.mjs; common.test.mjs updated for the sections no longer drawn when empty).
- format: 168 modules, 167 requirements files; 0 failures
- architecture: 3307 product files, 10054 relative imports (29 naming no tracked file, not judged); 0 failures
- coverage (screens-publish): 21 of 21 live requirement ids named by a test; 0 failures (run.mjs shows 20 failures, none in screens-publish)
- ownership: 16 files changed by screens-publish between tranche/T48 and HEAD; 0 failures

Size (session_01SX1xX1uwfBATDKqW7WH95V): test runs 14, module lines 1622
