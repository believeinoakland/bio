# Causes of the T51 build walk on biosmoke8 (diagnosis for BOB, 2026-10-21)

Branch `tranche/T51`, read-only. Sources read whole: `BRIEF.md`, `bob.md`, `setup-team.md` (S-01..S-48), `find-capture.md` (FC-01..FC-31), `conclusions-action.md` (CA1..CA70), `evidence-connections.md` (E01..E61), `walk-T51-live/CAUSES-live.md` (L1..L30), `build/modules.json`. Code paths are under `bio-plane/src/` unless stated. Every CODE cause was checked against the source; where a line could not be tied, the cause says UNCONFIRMED and why. Nothing was run on the live copy. `evidence-connections` 390 px checks were by DOM measurement only. Findings that are works/confirmations (S-12, S-17, S-23, S-38, FC-30 census, CA5, CA11, CA13, CA15, CA17, CA20, CA22, CA52, CA64, CA65, E09, E11, E17, E32, E38, E40, E45, E47, E51) need no cause; E61 and CA59 are not walked. S-21 is an unconfirmed note (not reproduced) and has no cause.

Classes: CODE (a job), TEST (none found: no finding is a stale test), WORDS (goes to T52 `later-ux.md` unless it stops a member; none of those below stops one, so all go), DESIGN (UX design lane), DATA, PERF.

## Causes

Severity is the highest of the cause's findings. "Prev" says whether it is an L1-L30 cause still open.

**C1** [BLOCKER · CODE] Conclude refuses any question that holds a leg cutting against: the version grammar counts a cutting leg as an unplaced ground, though `inquiry-grammar` already exempts it (R68) and the screen's partition omits it.
- Findings: CA12, E21, E22 (words half: C41 below)
- Module: basis-version-grammar (with basis-versions, which builds the version)
- Previous walk: L9 still open (second half)
- Fix: Exempt `role: cuts_against` legs from the totality count in `basisVersionFindings`, as `checkGrounds` does; test: 1 supporting + 1 cutting leg, one-part partition, concludes.
- Source: `basis-version-grammar/grammar.mjs:417` (`unlabelled++` at :394 counts every leg with no ground); contrast `inquiry-grammar/grammar.mjs:870-877`. Screen sends supporting legs only: `screens-inquiry/question.mjs:1306`.

**C2** [BLOCKER · CODE] A published finding is drawn as the literal text "## Conclusion" and never its words: `sectionText` returns the slice WITH its heading, so the screens' `body.conclusion || authored.conclusion` never reaches the authored claim.
- Findings: CA37 (and the reader-facing half of CA16/CA21 is C46)
- Module: public-read (publication/worker.mjs is under its paths); screens-publish
- Previous walk: L15 family, still open
- Fix: Return the section body without the heading (null when empty) so the fallback reaches `authored.conclusion` / the signed `case_conclusions.claim`; prefer the signed claim; draw the falsifier likewise. Test: concluded finding publishes and the page shows the claim.
- Source: `record-grammar/document.mjs:435-441` (returns `body.slice(idx,…)` incl. heading); `publication/worker.mjs:686-687`; `screens-publish/published-pages.mjs:96`, `published-parts.mjs:73`. `op=conclude` writes the words to front matter, not the section (`inquiry/index.mjs`: `## Conclusion` is set only by divide, :2355).

**C3** [BLOCKER · CODE] The signing ceremony cannot be passed for a captured address: when `op=publish` refuses (CO_ATTESTATION_UNACKNOWLEDGED) the pre-flight step 3 is answered `{stated: notReached}` so it carries no `not_co_attested`, and the ceremony draws its retry / self-attested-with-reason controls only from that list.
- Findings: CA26
- Module: case-authoring (pre-flight); screens-publish (ceremony)
- Previous walk: C1 / UC-153 dead end, still open
- Fix: Fill `not_co_attested` (and `self_attested`) in step 3 whenever captures are known, whether or not publish refused; test: a pre-flight of a refused publish lists the unacknowledged captures and the ceremony draws Retry and the reason box.
- Source: `case-authoring/index.mjs:1721-1734` (`ok ? {…, not_co_attested…} : {stated: notReached}`); `screens-publish/ceremony.mjs:76,159-203` (controls only when `stepWith("not_co_attested")`). Confirmed by reading; the live pre-flight answer was not re-read.

**C4** [BLOCKER · CODE] Endorsing the last administrator from the Queue/Home throws the invitation link away: the `adminendorse` act in both screens has no `done` that keeps `result.invite`; only Settings > Members keeps it.
- Findings: S-26
- Module: screens-daily
- Previous walk: L21 pattern (screen discards a result)
- Fix: Add the same `done` as `screens-settings/members.mjs:302-307` (keep `invite`, show once) to queue and home, and say so in the Done note.
- Source: `screens-daily/queue.mjs:499-501`, `home.mjs:403-404`.

**C5** [BLOCKER · CODE] A captured 21 MB PDF is filed with no readable bytes: the member is told nothing is wrong, the document has "held until vouched for", no reading, no vouch box and OCR 404; later captures say "already holds this document" with no link.
- Findings: E07
- Module: acquisition (multipart arm); capture / sources (read side) - which half fails is unconfirmed
- Previous walk: new
- Fix: Either keep and serve a multipart capture under the document's fingerprint, or refuse in words and file nothing; never offer vouch/OCR for a document with no stored copy.
- Source: `acquisition/index.mjs:1037` (`multipart = parts.length > 1`), :979 (parts named by part sha), :1228-1232. UNCONFIRMED: whether the reading/serving side or the promote side drops the parts; one live `op=capture` of the INFO-2026-0042 sha settles it.

**C6** [BLOCKER · CODE] A member cannot record a determination: Matter asks for an event id, passage content ids and published-finding ids in free-text boxes with no picker and no way to learn those ids; the Timeline's "Record an event" yields only an id.
- Findings: CA53, E33
- Module: screens-action (matter); screens-investigate (timeline, for the event picker)
- Previous walk: C44 / UC-065 dead end, still open
- Fix: Pickers for the event (the project's events), the passage (from a chosen document) and the finding (concluded questions of the project); refuse in words which id is missing. If BOB holds that the design draws id boxes, this is DESIGN.
- Source: `screens-action/matter.mjs:130-132` (`mt-d-event`, `mt-d-evidence`, findings box are plain `cs.field`).

**C7** [BLOCKER · CODE] A registered organisation's page offers "Add a fact from a document" and the plane refuses every press with NOT_A_PERSON.
- Findings: E25
- Module: screens-investigate (person); people (if organisation facts are wanted)
- Previous walk: L10 act half still open
- Fix: Either serve organisation facts (people job) or do not draw the act on an organisation page and draw the organisation fact form that works; the screen already swallows NOT_A_PERSON for reads only.
- Source: `screens-investigate/person.mjs:36-39,195,316` vs `people/index.mjs:289-295`.

**C8** [BLOCKER · CODE] The money trail cannot hold a figure: a figure read in is shown from page memory (`ui.recent`) and is in no trail's inclusions/proposals after a reload, so "Include" can never be pressed on it.
- Findings: E36 (E37 below)
- Module: screens-investigate (money); money (if the fact must be proposed to the trail by the plane)
- Previous walk: none
- Fix: On `recordfact` success, propose/include the fact into the trail (or read the trail's facts) and draw it from the record, not from memory; also name the "follow" days field as required with words.
- Source: `screens-investigate/money.mjs:58-61` (`proposals`/`inclusions` from the trail, else `ui.recent`). Plane side (does recordfact attach to the trail?) unconfirmed.

**C9** [MAJOR · CODE] Document captured by address is not filed under the member's project: after "already held" the screen links the other copy and files nothing; when the bytes have another home the member gets a sentence with no link.
- Findings: FC-07 (address half), E04, FC-06(c)
- Module: screens-intake (capture)
- Previous walk: L3 still open (address arm: link exists, filing does not)
- Fix: After a visible copy is found, file it under the question's project as a second sighting (as the file arm's sentence promises); name and link the holder in the "another record" case.
- Source: `screens-intake/capture.mjs:411-422` (R49: link only, nothing written), :424.

**C10** [MAJOR · CODE] Upload whose bytes the store already holds promotes nothing and links nothing; a retry after an interrupted upload leaves the bytes stored and no document anywhere.
- Findings: FC-08, FC-29, E19
- Module: screens-intake (capture)
- Previous walk: L3 still open (file arm)
- Fix: Same as the address arm: ask the record for the viewer-visible document; if none, promote one for the viewer under the project; link it.
- Source: `screens-intake/capture.mjs` `doneUpload` (`if (a.existed === true) { … bundleId: null }`, ~:518).

**C11** [MAJOR · CODE] The capture screen's `acquire` has no `failed` hook: a refusal sets no result and `working` stays true (the "Fetching… up to 25 seconds" note stays for ever, cleared only by a 90 s timer) and the refusal beside the button is lost when the page redraws after the `heldcaptures` re-read.
- Findings: FC-03
- Module: screens-intake (capture); interface-shell (refusal slot kept across redraw)
- Previous walk: L23 family
- Fix: Add `failed(view, answer, cs)` clearing `working` and keeping the refusal in state so the redraw draws it; shell: keep act slots across `draw()`.
- Source: `screens-intake/capture.mjs:368` (`begin` sets working), :623-628 (act spec has no `failed`); shell hook exists at `interface-shell/browser.mjs:1946`.

**C12** [MAJOR · PERF] The independent co-attestation (timestamp + co-archive) runs inside the 25 s capture bound, so a page of 50-150 KB takes 9.6-21.5 s in that stage alone; the 504 then says "kept nothing" (not true: the bytes were held, a retry returned `existed`).
- Findings: FC-04, CA1, E03, E03a, E18 (and the wording of the 504 sentence)
- Module: acquisition (+ attestation)
- Previous walk: L4 still open; measured: attest 9.6-21.5 s (ca.gov 20.9, wikipedia 21.6, example.org 15.6), captures 11.8-32 s
- Fix: Run co-attestation after the document is kept (or in the background, recorded as an attempt per R20 - a failure "never a failed capture"), keep the 25 s bound for the fetch/read only; correct the 504 sentence to say what was kept.
- Source: `acquisition/index.mjs:1204` (`await timed(t,"attest",…coAttest…)`), :540-562; bound `control-plane/index.mjs:197,2288`.

**C13** [MAJOR · PERF] The "as a visitor saw it" render stage is slow (3.3-17.5 s; legistar Departments render 17.5 s) and, with the attest stage, exceeds the bound.
- Findings: FC-04 (render half)
- Module: capture-sources (browserrender); acquisition
- Previous walk: L4 (render half) still open; measured render 3.3-17.5 s
- Fix: Measure the container render (cold start vs page) and cut it, or run it as a continuation (acquisition R31 "Finish it") instead of inside the bound.
- Source: `acquisition/index.mjs:1042` area (render), `capture-sources` `browserrender.mjs`. Cause inside the stage unconfirmed.

**C14** [MAJOR · PERF] `heldcaptures` is slow (2.3-14.6 s for 24-59 rows) because each row costs an examination, a question lookup and capture facts, and many screens call it (twice per open, plus the larger `held_and_vouched` list for pickers); acts re-read it.
- Findings: S-31(slow half), S-37, FC-20(slow), CA2, CA19, CA45(8 s per press), CA56, E24, E29, E36
- Module: capture (reads); screens-investigate / screens-settings / screens-intake (reads they make)
- Previous walk: L13 partly fixed; measured 2.3-8.4 s (24 rows), 5-14.6 s (59 rows); Home 3.5-9 s, Queue 3-12 s, pickers empty 10-14 s
- Fix: Per-row work off the list path (batch `#pageAnswers`/`#questionsOf`/`#captureFacts`), a cheap picker read (id, title, sha only), read pickers when opened, one read per screen; per-act re-reads must not re-read the whole list.
- Source: `capture/index.mjs:1281-1345` (per-row `#questionsOf`, `#captureFacts`, `#pageAnswers`); callers `screens-intake/todos.mjs:12` (limit 500), `screens-settings/grouprules.mjs:21`, `screens-investigate/money.mjs:19`.

**C15** [MAJOR · PERF] `op=interfacewords` is 6.2 MB raw and sent again on every screen with no cache header.
- Findings: S-37
- Module: interface-shell (with control-plane's route)
- Previous walk: L13
- Fix: Serve the words with a long-lived versioned cache header (the release is the version) and compress.
- Source: `control-plane/index.mjs:620` sets `no-store` for a capture; the words route has no cache header (unconfirmed which file sets it); measured 1.4-3 s.

**C16** [MINOR · PERF] Document page opens with ~50 reads, 12 identical `projectquestions` (one per project) and `heldcaptures` twice.
- Findings: FC-11
- Module: screens-inquiry (document)
- Previous walk: G3 family; measured 6.4-7.6 s
- Fix: One read of the questions the cite picker needs (this project first), one `heldcaptures`.
- Source: `screens-inquiry/document.mjs:169,174` (two `heldcaptures`).

**C17** [MAJOR · CODE] A photograph's "Read this document again with OCR" sends `pdfstructure` (a PDF reader) and is always refused; the page offers no re-read that works for pictures, says nothing of what share of words was read, and a page typed by hand is not shown in the reading.
- Findings: FC-13, FC-14
- Module: screens-inquiry (document)
- Previous walk: L26 / C21 (door fixed, behaviour not); I-17 silence still open
- Fix: Offer the picture re-read the plane has (or hide the control for pictures); draw "read N of M words" when the reader gives it; draw the typed words as the page's reading.
- Source: `screens-inquiry/document.mjs:1007-1010` (always `pdfstructure&ocr=1`, three refusals mapped, 422 "not a PDF" unmapped).

**C18** [MAJOR · CODE] Photograph OCR quality: a hard photo is read at ~60 of 234 words; engine gets upright grey image with no deskew/contrast/upscale.
- Findings: FC-13(quality)
- Module: pdf-reader / ocr-worker (see L26: picture preparation `pdf-worker` then engine)
- Previous walk: L26 still open
- Fix: Picture preparation (deskew, contrast, scale) then re-measure; BOUNDARY ruling for BOB already named in L26.
- Source: L26 citations (`pdf-worker/src/picturepixels.mjs`, `ocr-worker/src/member.mjs:96-98`); not re-read here.

**C19** [MAJOR · CODE] The reading of a captured web page is drawn as every visible text unit of the page (furniture, "Quick Links", "opens in new tab") with a Cite button each.
- Findings: FC-10, CA4, E20
- Module: text-chain (visibleTextOfHtml)
- Previous walk: L6 still open (REQUIREMENT question for BOB first)
- Fix: BOB rules whether the reading is the main content; then drop landmarks/nav in `visibleTextOfHtml`.
- Source: `text-chain/textchain.mjs:854-866` (per L6). Paging (L5) is fixed.

**C20** [MAJOR · CODE] The declared provenance a member types at capture (where/when, what it shows) is kept but never drawn on the document page.
- Findings: FC-12
- Module: screens-inquiry (document)
- Previous walk: new
- Fix: Draw the statement the upload stored ('Where and when', 'What it shows', 'How obtained') on the document page.
- Source: `screens-inquiry/document.mjs` (no read of the capture statement; searched). Not traced to the plane's answer field name.

**C21** [MAJOR · CODE] Find: a passage hit does not name its document and a question hit shows the bundle's raw markdown, internal ids and hash as its excerpt.
- Findings: FC-15
- Module: screens-daily (finder); retrieval (excerpt)
- Previous walk: I-13 still open
- Fix: Name the document on every hit; excerpt from the question's title/conclusion, never `bundle.md`.
- Source: `screens-daily/finder.mjs` hit rows; the excerpt is the plane's `retrieval` field. Site unconfirmed.

**C22** [MAJOR · CODE] Find's "See where nobody looked" draws empty bullet lists (about 26 blank `<li>`) and raw level codes (LOOKED_INDETERMINATE, PRESENT).
- Findings: FC-17
- Module: screens-daily (finder-states)
- Previous walk: L8 partly fixed; C33
- Fix: Draw each place by name; map every look state to a word.
- Source: `screens-daily/finder-states.mjs` (frontier draw). Site not traced line by line.

**C23** [MINOR · CODE] Find / Held / Add small defects: kind filter leaves count at 50, 'Only: New since' says nothing when empty, two vocabularies for one state, table has no checkboxes, three documents titled alike, search box 220 px with button above, help lines with no control, Held lists every project's captures with a tall squeezed 'Open the file'.
- Findings: FC-18, FC-19, FC-20(layout, I-09 'Refused'), FC-02
- Module: screens-daily (finder); screens-intake (held)
- Previous walk: I-09 still open
- Fix: Fix each in its screen.
- Source: finder.mjs, held.mjs; layout items are CSS (see C81).

**C24** [MAJOR · CODE] The sidebar/rail "Find" opens a place that says "Find comes later" while the top search opens the working finder; the place `find` is mapped to two screens (`finder`, `answers`).
- Findings: E06
- Module: interface-shell (place mapping)
- Previous walk: new (UNCONFIRMED which link the rail uses)
- Fix: Point the rail to the built screen.
- Source: `interface-shell/index.mjs:43` (`finder: ["find"], answers: ["find",…]`), `browser.mjs:970-973` (`placeHref` takes the first built); rail list at :1178.

**C25** [MAJOR · CODE] Document names are the host ("A PDF from www.oaklandca.gov", "A web page from www.foia.gov", "Untitled capture"), so documents cannot be told apart in the Cite list, the connection picker, Find and the question.
- Findings: E08, CA3, FC-06(a), FC-18(d), E18, CA11
- Module: screens-intake (capture `titleOf`); acquisition (reading.title)
- Previous walk: I-03 partly fixed
- Fix: Name by the document's own title (reading.title), file name, then host+date; one rule for web page, PDF and upload.
- Source: `screens-intake/capture.mjs` `view.parts.titleOf(cs,{reading,doc,address})` (~:393).

**C26** [MINOR · CODE] Change detection for a live address compares raw bytes (baseline recorded no determined digest), so a static page re-checked minutes later is called "changed" and the member is offered "Capture the new copy".
- Findings: FC-06(b), CA55
- Module: monitoring; capture (heldat `changed`)
- Previous walk: A3 still open
- Fix: Judge change on the determined (substance) digest; say "cannot tell" when the baseline has none.
- Source: `screens-intake/capture.mjs:366-376` (`heldat … changed.state`); plane side per CA55 text (unconfirmed line).

**C27** [MAJOR · CODE] Vouch box (and "held until you vouch") is drawn only when the document has a project AND the viewer's `heldcaptures(member=)` row matches; a capture outside any project, or by a member whose id differs from the handle she was matched on, gets none.
- Findings: FC-28 (confirmed), E58 (unconfirmed which)
- Module: screens-inquiry (document)
- Previous walk: L1 half open (member role)
- Fix: Draw the box for the viewer's own held copy wherever the project is; test member with handle != id.
- Source: `screens-inquiry/document.mjs:169,174-178` (`project && sha`; `member: String(view.me.member)`).

**C28** [MAJOR · CODE] Inbox detail does not show the file (no name, type, fingerprint, no way to open it) before the member decides; list rows are named by size and date; no way to put a discarded knock back.
- Findings: FC-22
- Module: screens-intake (inbox)
- Previous walk: UC-013 partial
- Fix: Show name, type, fingerprint and a safe-view/open door on the knock; put back.
- Source: `screens-intake/inbox.mjs`.

**C29** [MINOR · CODE] Observation / doorbell results give a raw record number and no link to the new document.
- Findings: FC-09
- Module: screens-intake (capture)
- Previous walk: A4
- Fix: Link the document.
- Source: `screens-intake/capture.mjs` (`screen.capture.saw.done` with `id`).

**C30** [MAJOR · CODE] Cite on a passage of a document already cited in the question (or with the other role) answers 200 `cited: []`, `alreadyCited` and the screen says nothing, so the member believes she cited; the question keeps resting on the first passage.
- Findings: CA6, E15
- Module: screens-inquiry (document)
- Previous walk: none
- Fix: `done` for `cite` reading `alreadyCited`/`cited` and saying which passage the question rests on, with a way to narrow.
- Source: `screens-inquiry/document.mjs:911-918` (no `done`); contrast `project.mjs:730` which reads `alreadyCited`.

**C31** [MINOR · CODE] The cite act is a GET that writes (a refresh or prefetch repeats it) and leaves no mark at the passage; the only trace is far down in "Your citations".
- Findings: CA7
- Module: screens-inquiry (document); citation
- Previous walk: none
- Fix: Send as POST body; mark the passage cited.
- Source: `screens-inquiry/document.mjs:917` (`query: {project, role, found}`).

**C32** [MAJOR · CODE] "Check whether its route can be shown" always fails: the screen sends `bundleId` in the body, the plane arm reads it from the query.
- Findings: FC-26, E50
- Module: screens-inquiry (document)
- Previous walk: UC-020 / C24
- Fix: Send `query: {bundleId}` (the arm reads `q("bundleId")`).
- Source: `screens-inquiry/document.mjs:1026` vs `provenance-routes/ops.mjs:18`. Same pattern as C85 below.

**C33** [MAJOR · CODE] "Stop using this copy" answers a held (unvouched) copy with the release act's sentence and a copy cited by questions with 'no explanation of this refusal yet… CITED'; there is no way to drop a wrong held capture.
- Findings: FC-24, E48, E49
- Module: screens-inquiry (document); promotion (rule: only verified Information may be retired - requirement question)
- Previous walk: L11 (vouched case fixed)
- Fix: Act-specific refusal map for `retire` (ILLEGAL_TRANSITION, CITED naming the citing questions with doors to remove them); BOB: how a wrong held capture is set aside (the plane allows only verified).
- Source: `screens-inquiry/document.mjs:946-960` (no `refusals`); shared code word `refusal.ILLEGAL_TRANSITION` is the release sentence.

**C34** [MAJOR · CODE] "Reopen this finding" is drawn on a concluded finding but refused with the release act's sentence (`ILLEGAL_TRANSITION` from open to open); the question's state stays open though concluded.
- Findings: CA63, E60
- Module: screens-inquiry (question); inquiry (state of a concluded finding)
- Previous walk: none
- Fix: Do not draw reopen where the plane refuses, or give the act its own refusal map; check why a concluded finding reads state open.
- Source: `screens-inquiry/question.mjs` reopen act; plane `inquiry` state unconfirmed.

**C35** [MINOR · CODE] Document-page forms: Watch for changes shows "Every day" but sends an empty first option; 'For which question' lists the same two titles twice with no project.
- Findings: FC-27, E52
- Module: screens-inquiry (document); screens-daily (find-in)
- Previous walk: A6 / I-11 still open
- Fix: Preselect the shown value; show project names.
- Source: document.mjs, find-in.mjs.

**C36** [MAJOR · CODE] The question page's legs name only the document ("A PDF from www.oaklandca.gov · Page 1", twice for two different documents); the cited words of a web-page leg are shown nowhere.
- Findings: CA8, E13
- Module: screens-inquiry (question)
- Previous walk: none
- Fix: Draw the cited passage's first words with the document name and page/paragraph.
- Source: `screens-inquiry/question.mjs:539` (`legRow`).

**C37** [MINOR · CODE] Text runs together with no separator ("Page 1If this turned out…", "fails if any one of these fails:Read it back").
- Findings: CA10, CA14(c), E13
- Module: screens-inquiry (question)
- Previous walk: H1 family
- Fix: Add the separators in markup.
- Source: question.mjs strength/legs blocks.

**C38** [MAJOR · CODE] A removed (severed) citation is still counted in the partition and named in the strength sentence ("Not counted yet: …foia.gov").
- Findings: CA14
- Module: strength; screens-inquiry (question)
- Previous walk: L29 partly fixed
- Fix: Compute strength and the partition over live legs only.
- Source: `screens-inquiry/question.mjs:539` handles `!severed` for the row but the partition/strength sentence is the plane's (`strength/index.mjs:788-874`); unconfirmed which module counts it.

**C39** [MAJOR · CODE] The publish gate counts a removed citation as load-bearing: it names captures I had removed from the question and not the live leg.
- Findings: CA27
- Module: case-disclosures
- Previous walk: none
- Fix: Filter severed legs in `restingCaptures`.
- Source: `case-disclosures/index.mjs:273-283` (`SELECT … FROM inquiry_basis` with no severed filter; whether severed rows are kept there is unconfirmed).

**C40** [MAJOR · CODE] The document page's only door gives a timestamp; the gate needs BOTH a trusted timestamp and a co-archive (`co_attested = ts && ca`), so doing what the screen offers never satisfies it (pre-flight still timestamp_at null).
- Findings: CA28
- Module: screens-inquiry (document); case-disclosures
- Previous walk: I-34 (14 s, no progress) still open
- Fix: Offer the co-archive with the timestamp (one "Get independent confirmation" act) or say what is still missing.
- Source: `case-disclosures/index.mjs:338`; `screens-inquiry/document.mjs:940-942` (`attest` only). Whether `attest` also writes the co-archive is unconfirmed; the pre-flight said co_archive null.

**C41** [MAJOR · CODE] Refusals of a basis version (Conclude, Adopt newer version) draw only 'Fix the points listed' and list no point: the findings-drawing handler exists for BASIS_REFUSED only.
- Findings: CA12(words), CA58(words), E22
- Module: screens-inquiry (question, document)
- Previous walk: L9 / A7
- Fix: Map `BASIS_VERSION_REFUSED` to the first finding's translation/repair like `BASIS_REFUSED`, and name the unplaced legs.
- Source: `screens-inquiry/question.mjs:1297-1302` (only BASIS_REFUSED); word `setup-words/rows.mjs:7696`.

**C42** [MAJOR · CODE] "Move my citations to this copy" is refused (C-45.2 CONTENT_EXTENT_NO_CHAIN): the newer copy offered is the change observation (nothing captured), not the copy the member captured and vouched.
- Findings: CA58
- Module: screens-inquiry (document); basis-versions / reevaluation
- Previous walk: UC-038 partial
- Fix: Offer only a held copy that has an extraction chain, or say what is missing.
- Source: Per CA58 text; site not traced (unconfirmed).

**C43** [MAJOR · CODE] The project page's question cards still name the raw record id in the strength sentence and repeat the Unrated paragraph twice.
- Findings: E55
- Module: screens-inquiry (project)
- Previous walk: L29 still open (project page)
- Fix: Reuse the question page's title rendering.
- Source: `screens-inquiry/project.mjs` strength block (~:350-420).

**C44** [MAJOR · CODE] Question page head reads "Undetermined, because" and stops; breadcrumb "Projects › Question" with no project.
- Findings: E01
- Module: screens-inquiry (question)
- Previous walk: L7 family, L24
- Fix: Draw the reason sentence (field name mismatch as in L7) and the project crumb.
- Source: UNCONFIRMED site (question.mjs head); L7 was `levels.meaning.why` vs `.reason`.

**C45** [MINOR · CODE] 'For which question' shows the raw question id after a capture.
- Findings: E02
- Module: screens-intake (capture)
- Previous walk: none
- Fix: Show the title.
- Source: capture.mjs `ci-for`.

**C46** [MAJOR · CODE] Case editor and the review copy read by the outside reader draw a finding as the question's whole bundle text (markdown headings, session log, record ids, hashes, members' reasons) with an empty Conclusion: `statement` prefers the file body over the front-matter conclusion that `op=conclude` wrote.
- Findings: CA16, CA21
- Module: review (statement); screens-publish (case-editor, review-outside)
- Previous walk: L15 still open
- Fix: In `findingWords`, take front-matter `conclusion`/`statement` first; never expose the session log to an outside reader (disclosure).
- Source: `review/index.mjs:250-260` (`statement: body.trim() ? body : own`), :351; `screens-publish/review-outside.mjs:44`.

**C47** [MAJOR · CODE] The published case shows "LEFT OUT OF THIS CASE" with the sentence the member typed under "What it says" and an empty EVIDENCE list; the sign step says "0 pieces of evidence".
- Findings: CA38, CA36
- Module: screens-publish (case-editor label); case-authoring / public-read (evidence list)
- Previous walk: none
- Fix: Label the editor box for what it is; list the cited documents/passages (or say they are not published and why - BOB: is that the design?).
- Source: UNCONFIRMED whether empty evidence is by design ("A document, not published with the case").

**C48** [MAJOR · CODE] The ceremony's confirmation says it will publish and can never be unpublished although the press only prepares the edition; the page keeps 'reasons that stop the signing' beside 'Edition 1 is prepared'; a reload loses the prepared state.
- Findings: CA33
- Module: screens-publish (ceremony)
- Previous walk: none
- Fix: Weight/confirmation for 'prepare' separate from 'sign'; one state per page; keep the prepared edition.
- Source: `screens-publish/ceremony.mjs` prepare act (weight of `publish` op).

**C49** [MAJOR · DESIGN] The ceremony and the review copy show only the NEWEST draft; the draft a reader commented on or the earlier draft's readers (and their live links) cannot be reached or stopped except by typing the address; the editor lists two drafts with identical titles.
- Findings: CA32, CA62, CA61(drafts)
- Module: screens-publish (ceremony, review-copy, case-editor)
- Previous walk: none
- Fix: UX design lane: a chooser among the project's drafts (named by scope + date) on ceremony, review copy and editor; every live grant stoppable from the screen.
- Source: `screens-publish/ceremony.mjs` takes `drafts[last]`; no chooser control exists in the screens.

**C50** [MAJOR · CODE] Ceremony reopened after publishing offers the published draft as unpublished and would prepare edition 2; no word that edition 1 is public, no link.
- Findings: CA41
- Module: screens-publish (ceremony)
- Previous walk: none
- Fix: Read the draft's published editions; draw 'Published: edition N' and the link.
- Source: ceremony.mjs identity block.

**C51** [MAJOR · CODE] Signing key: without "Keep this key on this device" a new key must be registered at every signing (four keys for one administrator); the Sign step cannot load the key file made a minute before.
- Findings: CA34
- Module: screens-publish (keys, ceremony); credentials
- Previous walk: UC-157 partial, C80/T-04 family
- Fix: Offer 'load my key file' and default to keeping the key; one key per member per device.
- Source: `screens-publish/keys.mjs`.

**C52** [MAJOR · CODE] Owner's "Reply" to a reader's comment is refused NO_REVIEW_COPY for the signed-in owner.
- Findings: CA24
- Module: review; control-plane (door)
- Previous walk: none (UNCONFIRMED)
- Fix: Read the live answer of `reviewcomment` for the owner; the member door exists in `comment()`.
- Source: `review/index.mjs:839-845` accepts a `member:` viewer; `control-plane/index.mjs:857-897` derives the viewer via `caseReader`; `screens-publish/review-copy.mjs:179-185` posts `draft` in the query. Why the door says none is not shown by reading (candidate: draft not the one the door sees for this viewer, CA62).

**C53** [MAJOR · CODE] Plan: "Remind me as a date comes near" has no button after an option is chosen; a reminder set while choosing is recorded but the plan never says "reminder on …".
- Findings: CA43, E43(reminder), E44
- Module: screens-action (plan)
- Previous walk: L21 plan side still open
- Fix: Draw a Set-reminder act on a chosen option and the date it holds, read from the record.
- Source: `screens-action/plan.mjs:403-` (reminder fields sent with choose); due-date.mjs:33 keeps `reminded` in page memory.

**C54** [MAJOR · CODE] State kept in page memory instead of read from the record: the Timeline lists an event recorded here only until the next visit (events come from the project document's references plus `ui.added`), so Add who took part, Record a dated fact and Link events are then unusable.
- Findings: E56
- Module: screens-investigate (timeline); events
- Previous walk: none
- Fix: Attach the new event to the project (reference) or read the project's events; draw from the record.
- Source: `screens-investigate/timeline.mjs:81-82` (`set` = refs + `view.ui.added`).

**C55** [MAJOR · DESIGN] Timeline events have no description, date or participants at creation (document + kind only) and read "Undetermined, because its owner does not settle its validity"; progressions are defined by typing bar-separated lines.
- Findings: E34, E35
- Module: screens-investigate (timeline)
- Previous walk: none
- Fix: UX design lane: an event form with words, date, participants; a rows form for progression steps.
- Source: timeline.mjs / timeline-parts.mjs forms (single box).

**C56** [MAJOR · CODE] "Record an event" lists 'A decision' and the plane refuses it as UNKNOWN_EVENT_KIND.
- Findings: CA54
- Module: screens-investigate (timeline) / events
- Previous walk: none (UNCONFIRMED list)
- Fix: Offer only kinds the plane accepts.
- Source: The list in `timeline.mjs:92` lacks 'decision'; the offending list is another form (unconfirmed).

**C57** [MAJOR · CODE] "Committed against paid" with a contract name sends nothing and says nothing.
- Findings: E37
- Module: screens-investigate (money)
- Previous walk: none
- Fix: Refuse in words (needs a record id) or give a picker.
- Source: `screens-investigate/money.mjs:55`.

**C58** [MAJOR · CODE] Objective: first try with a typed flow name fails in words a member does not know (progression, entity); choosing the flow redraws and collapses the open form; 'How it is going' stays empty.
- Findings: E39
- Module: screens-investigate (objective); screens-inquiry (objective.mjs)
- Previous walk: L23 family still open
- Fix: Tell the member a flow must exist first; keep the fold open across redraw; read progress.
- Source: `screens-inquiry/objective.mjs`. Site unconfirmed.

**C59** [MAJOR · CODE] Person page: after choosing a document no 'Choose the passage' control is drawn, and the fact is recorded with the placeholder phrase 'the source passage' and no document shown.
- Findings: E26
- Module: screens-investigate (person)
- Previous walk: I-31 / F5
- Fix: Draw the passage picker from the document's reading; show document and words on the fact.
- Source: `screens-investigate/person.mjs:316` act; picker `parts.mjs:75`.

**C60** [MAJOR · CODE] "Connect the documents that name them" answers 0 documents / 0 resolution rows although a vouched memo names the person, and says nothing.
- Findings: E27
- Module: screens-investigate (person); entities
- Previous walk: none (UNCONFIRMED: indexing lag vs fault)
- Fix: Say 'no document names him yet' and why; re-test after reading completes.
- Source: person.mjs `connect` act.

**C61** [MAJOR · CODE] Standard: the page of one standard shows the 64-char content id as 'its words' and links to a document page that says 'Nothing is here'; the project Standard screen lists no held standard (Open/Adopted/All all 'Nothing here') and no door.
- Findings: E30, E31
- Module: screens-investigate (standard)
- Previous walk: I-31 still open
- Fix: Read the passage's words; list held standards (op=standards) with a door from the project.
- Source: `screens-investigate/standard.mjs`.

**C62** [MINOR · CODE] Breadcrumbs lose the project name on several pages (page of one standard, Objective, Start and send step 2, Question).
- Findings: E01(crumb), E29, E39, E46
- Module: screens-investigate; screens-action; screens-inquiry
- Previous walk: L24 partly fixed
- Fix: Resolve the project title in `place` as the case editor does.
- Source: `screens-investigate/standard.mjs:9-12` (L24) and its siblings.

**C63** [MINOR · CODE] Plan: 'Plan what to do' stays on the project page without a receipt/plan page; Start-and-send step 1 prints a Brown Act line for a records-request option; checks print 'opt-1', 'p1', 'not_met'.
- Findings: E42, E46
- Module: screens-inquiry (project); screens-action (start-send, plan)
- Previous walk: E1 family
- Fix: Open the plan page; show the clause only for a Brown Act option.
- Source: project.mjs:335 (planopen); send-steps.mjs.

**C64** [MAJOR · DESIGN] The records request screen cannot name a federal office: no office is known and only an administrator can add one under Settings > Places.
- Findings: CA51
- Module: screens-action (request); screens-settings (places)
- Previous walk: F2 / C67 / C68 still open
- Fix: UX design lane + BOB: a member names the office (type + law) in the request, or federal offices are seeded.
- Source: `screens-action/request.mjs` (office picker lists the team's offices).

**C65** [MAJOR · CODE] "Keep as a template" is refused for the owner and a joined member alike (TEMPLATE_SCOPE_REFUSED).
- Findings: CA66
- Module: filing-templates; screens-action (start-send)
- Previous walk: UC-168 / C75 door drawn, dead
- Fix: Make the scope rule and the act agree.
- Source: Per CA66; site not traced (unconfirmed).

**C66** [MINOR · CODE] Small action-side gaps: reply words/quote not shown back, 'Show the routes' silent when none, review-copy page for a member shows the share boxes with no button and no sentence, console 400 on `op=queue&limit=500`.
- Findings: CA49, CA68, CA70, CA46
- Module: screens-action; screens-publish; queue
- Previous walk: E4 still open
- Fix: Show back, say none, hide the form, cap the limit at 200.
- Source: queue `limit` cap 200 (`queue/index.mjs` queueFeed default).

**C67** [MINOR · CODE] Ceremony: 'minutes … can't be read' on a case relying on none; case citations of an earlier draft's question leak into the signed case.
- Findings: CA30, CA40
- Module: screens-publish; case-authoring
- Previous walk: none
- Fix: Say nothing when no minutes are relied on; cite only the draft's own findings.
- Source: unconfirmed sites.

**C68** [MINOR · CODE] Proposed clock for a request to a FEDERAL office offers the California Public Records Act profile first.
- Findings: CA47
- Module: jurisdictions (profile order); action-clocks
- Previous walk: none
- Fix: Choose profile by the office's jurisdiction.
- Source: unconfirmed.

**C69** [MAJOR · CODE] Queue: the same obligation appears four times (once per status of the fact) and two identical NOTICED items.
- Findings: CA60
- Module: queue-producers
- Previous walk: G1 / L12 fixed; duplicates new
- Fix: One item per matter.
- Source: `queue-producers/index.mjs` local-facts/ notice feeds (unconfirmed line).

**C70** [MINOR · CODE] Queue/Home vouch rows come from a separate slow read (`heldcaptures member=, limit 500`), appear ~1.6 s after the list and are not in the count or grouped.
- Findings: S-03, S-16(part)
- Module: screens-daily (todos, queue, home)
- Previous walk: C14 fixed (drawn); count not
- Fix: Put the vouch to-dos in `op=queue`, or count them and draw once.
- Source: `screens-daily/todos.mjs:11-13,31-50`; `queue.mjs:373`; `home.mjs:244-246`.

**C71** [MAJOR · CODE] Queue 'set' acts: items the set act does not reach (e.g. confirm-expertise) come back 'Not handled, stays here' with no reason, where UC-147 asks per-item reasons.
- Findings: S-33
- Module: screens-daily (queue-states)
- Previous walk: none
- Fix: Give each unhandled row its reason ("needs your own reason, do it one at a time").
- Source: `screens-daily/queue-states.mjs:58-63` (`reaches`), :66-110 (`run`); outcome rows lack `why`.

**C72** [MINOR · CODE] Queue 'What you answered' omits acts on derived items (e.g. expertise confirm) and names the founder by internal id.
- Findings: S-34
- Module: queue; screens-daily
- Previous walk: UC-044 / G4
- Fix: Record and list every answered obligation.
- Source: `queue/index.mjs:1805-1858` (tasks, forwards, snoozes, dispositions only).

**C73** [MINOR · CODE] Queue 'Sort by' leaves the 'N items · grouped by case' line and keeps vouch rows above whatever the sort.
- Findings: S-48
- Module: screens-daily (queue)
- Previous walk: UC-040
- Fix: Say how it is sorted.
- Source: queue.mjs:382.

**C74** [MINOR · CODE] Home shows one invitation twice (Needs you / Needs the team); status row 'Open' goes to /app/queue.
- Findings: S-10, S-47
- Module: screens-daily (home, routed)
- Previous walk: C61 family
- Fix: Once; open the subject.
- Source: `home.mjs:244-262`.

**C75** [MINOR · CODE] Forward to a member is a free-text handle box and forwarding to oneself is accepted silently.
- Findings: S-36
- Module: screens-daily (queue)
- Previous walk: UC-041
- Fix: Pick list; say so.
- Source: queue.mjs `taskforward`.

**C76** [MINOR · CODE] Acts carry marks that are false: 'Asks for a reason' on acts that ask nothing (invite, grant, sign out everywhere, open question, start project, cover-handle choice, tie declare) and 'Irreversible' on a read (`bootstrap`'s 'Show what each part runs').
- Findings: S-02, S-06, S-20, S-45, FC-01(mark), CA31, E28(mark), E09
- Module: interface-shell (markAsks); op-grades (marks of reads)
- Previous walk: T-07 still open
- Fix: Either put every Reasoned-marked act in `markAsks` or remove the mark; give reads no mark.
- Source: `interface-shell/index.mjs:177,302` (`markAsks` = ADMIN_ACTS + 2), `op-grades/marks.mjs:62,154,162,208`.

**C77** [MINOR · CODE] Join page: both password boxes are emptied when 'See whether a handle is free' succeeds (R21 clears every password after any successful act).
- Findings: S-13
- Module: interface-shell
- Previous walk: L23 still open for password fields
- Fix: Clear passwords only after acts that send one.
- Source: `interface-shell/browser.mjs` `run()` password loop after success (~:1939-1941); restore at :1291-1296 keeps typed values.

**C78** [MINOR · CODE] A tip stays open after the press and covers the result sentence; the explanation under 'Show the stored logins' sits under the wrong button.
- Findings: FC-05, S-40(d)
- Module: interface-shell (tip); screens-intake
- Previous walk: A2 / T-10 still open
- Fix: Close the tip on press; place the explanation under its control.
- Source: `browser.mjs:1944-1990` openTip/closeTip.

**C79** [MINOR · CODE] New project page opens scrolled (list scroll kept); no sentence says the project was started.
- Findings: S-07, FC-01
- Module: interface-shell (scroll); screens-daily (start-project)
- Previous walk: none
- Fix: Scroll to top on navigation; confirm and open the project.
- Source: start-project.mjs.

**C80** [MINOR · CODE] Masthead reads 'Your team' for 1-3 s until `groupidentity` answers.
- Findings: S-41
- Module: interface-shell
- Previous walk: none
- Fix: Draw nothing (or the last known name from the device) until known.
- Source: browser.mjs masthead.

**C81** [MAJOR · CODE] At 390 px: Home/Projects/Project/Question/Document main area runs wider than the screen (up to 523 px) and 'Remove a citation' / 'Reinstate' are cut so they cannot be pressed; touch targets under 30 px (Find 83 of 121, Queue, Members, Security); hover tip covers roster rows; Home loading rule; case-editor strip numbers print over words; project list rows do not align. (E walker: DOM measure only.)
- Findings: S-40, FC-31, FC-02, FC-19, CA18, CA61, E53, E54
- Module: interface-assets (styles) / interface-shell; the affected screens
- Previous walk: T-13, H1, G3, T-10 still open
- Fix: Constrain card/button widths and 44 px targets in the shared styles; test with measured widths.
- Source: `interface-assets/index.mjs`, `browser.mjs`; CA61/E53 (control cut off) MAJOR, rest MINOR.

**C82** [MINOR · CODE] Reset-link page prints the raw placeholder '{name}': the screen fills nothing into the word.
- Findings: S-19
- Module: screens-entry (reset)
- Previous walk: none
- Fix: Pass the fills or reword.
- Source: `screens-entry/reset.mjs:31`; word `setup-words/rows.mjs:2042`.

**C83** [MAJOR · CODE] Security and Setup pages say 'Files are checked… every file when it arrives and again each week' whenever the scanner part is installed, while nothing is being scanned.
- Findings: S-01
- Module: screens-settings (security); screens-entry (setup)
- Previous walk: I-18 / L25 still open
- Fix: Draw the true state: since when no signatures, why in words (not 'status 403'), what the administrator can do.
- Source: `screens-settings/security.mjs:80` (`part_scanner === true` -> `files.on`); Setup step 7 likewise.

**C84** [MAJOR · DATA] The scanner has no signatures (signature service refused the download, 403) and 48-82 files wait.
- Findings: S-01
- Module: file-scanner (FR-06) / deployment
- Previous walk: L25 / I-18 / FR-06 still open
- Fix: Check whether the deployed image carries `freshclam` (commit bf97a18595); after redeploy call `POST /mirror` once; confirm the waiting files scan.
- Source: UNCONFIRMED whether the 05:21 deploy contains bf97a18595; the copy still shows 403 after it.

**C85** [MAJOR · CODE] 'Take a copy of the record' sends the note in the body but the arm reads it from the query (log note null), and the answer (the whole corpus) is discarded: no file, no link, no labelled counts.
- Findings: S-29
- Module: screens-settings (group); corpus-export
- Previous walk: C30 still open (copy not delivered)
- Fix: Send `query: {note}`; offer the returned manifest as a download; label the three counts.
- Source: `screens-settings/group.mjs:282-284` (body) vs `corpus-export/index.mjs:444` (`q("note")`); `done` re-reads `exportlog` only.

**C86** [MINOR · CODE] 'Verify the website' draws the same line as before, with no time and no 'file not found (404)'.
- Findings: S-30
- Module: screens-settings (group)
- Previous walk: T-11 still open (outcome)
- Fix: Draw checked_at and the plane's verdict.
- Source: group.mjs website block.

**C87** [MINOR · CODE] Main buttons answer nothing when required boxes are empty (Add a court, Draft the rule, Propose statements from it); 'Save who your team is' saves an empty description.
- Findings: S-32
- Module: screens-settings (places, grouprules, bias, identity)
- Previous walk: none
- Fix: Refuse naming the box; do not save empty.
- Source: places.mjs, grouprules.mjs, bias.mjs, identity.mjs.

**C88** [MINOR · CODE] Hosting sentence reads 'Recorded when your team's Civicsmith was set up, on <date of re-recording>'.
- Findings: S-43
- Module: screens-settings (group)
- Previous walk: T-18 date half
- Fix: Say 'Recorded on <date>'.
- Source: `screens-settings/group.mjs:185` (`nowLine`).

**C89** [MINOR · CODE] Third-administrator proposal is drawn as a red refusal ('Your endorsement is recorded…') and the roster is not re-read.
- Findings: S-24
- Module: screens-settings (members)
- Previous walk: UC-137
- Fix: Success style, re-read the roster.
- Source: members.mjs `memberadd` done (unconfirmed line).

**C90** [MINOR · CODE] Acts drawn where the plane will refuse: removal vote at two administrators (S-27); 'Pause the watching' for a member (S-39); sole owner's 'Stand down' panel with a vote that can never carry (S-44).
- Findings: S-27, S-39, S-44
- Module: screens-settings (members); screens-intake (watching); screens-inquiry (project)
- Previous walk: T-06 (panel built, misleading)
- Fix: Do not draw the act / say 'add another first'.
- Source: `screens-intake/watching.mjs`; `screens-inquiry/project.mjs:341-410`.

**C91** [MAJOR · CODE] Watched addresses and Leads screens exist but no screen links to them (only typed addresses).
- Findings: S-28
- Module: screens-settings (settings entries); screens-intake
- Previous walk: C56 door still missing (DEAD END by door)
- Fix: Add the doors (Settings; Add) for administrators and members.
- Source: registry screens `watching`, `leads` exist; no `data-nav` link found.

**C92** [MAJOR · CODE] Assistant's not-ready state: `RemoteSession` answers every request 503 including its version request, so `part_signin` reads false and 'Ask the assistant' draws 'a reason this panel has no words for yet'.
- Findings: B1, E59
- Module: agent-runner (or instance-setup's reading of the part)
- Previous walk: K3717 not-ready; BOB found cause
- Fix: As BOB's note: `RemoteSession` answers version 200; plus a word row for its 503 UNAVAILABLE refusal.
- Source: `agent-runner/dist/agent-runner.bundled.mjs:1781`; `agent-worker/src/remote.mjs:32-44`. E59 words are WORDS.

**C93** [MINOR · CODE] Agent-runner reads UNBOUND from the members bootstrap although agent-worker is SERVING.
- Findings: B2
- Module: bundler / deploy-fleet
- Previous walk: none
- Fix: BOB to confirm against K4178 (bindings only).
- Source: unconfirmed.

**C94** [MINOR · CODE] A member id (`admin`, the founder) is shown where her handle belongs: 'Answered by admin', 'Agreed: admin', 'added by admin', 'declared by admin', 'opened … by admin', member link /app/members/admin vs /app/members/sparky, 'already on this project' refused as 'No member has that handle'.
- Findings: S-25, S-34(name), S-46, FC-06(c), E28, E43
- Module: screens-daily; queue-producers; screens-settings; screens-action; screens-inquiry (one helper in interface-shell)
- Previous walk: L30 (link fixed in Members; not elsewhere)
- Fix: One kit helper `memberName(id)`; use it in every screen.
- Source: `screens-daily/queue-states.mjs` `queue.answered.bymember` with `String(r.by)`; other sites per the findings (unconfirmed).

**C95** [MINOR · CODE] Cite / connection / project pickers list every document and question of the team, many titled alike, with no search; slow to fill.
- Findings: E10, E24(long), E29(picker)
- Module: screens-investigate (parts); screens-inquiry (document)
- Previous walk: L2 fixed (vouched offered)
- Fix: This project first, search box, title+date.
- Source: `screens-investigate/parts.mjs:75`.

**C96** [MINOR · CODE] The held queue lists a 'Join' button for several invitations with the same label.
- Findings: CA25
- Module: screens-daily (home)
- Previous walk: none
- Fix: Add the project name to the label.
- Source: home.mjs.


## WORDS items (move to T52 `build/plan/later-ux.md`; none stops a member completing an act, K4270)

- W1 [MINOR] S-04: Vouch rows say 'photo' for web pages and name a knock by raw id
- W2 [MAJOR] S-05: Status row 'archive fallback may fetch a replay'
- W3 [MAJOR] S-08: Stage needs in internal words ('held question', 'leg in its basis', 'ratified case edition'); Forming has none
- W4 [MINOR] S-11: 'Yours: sparky' does not say administrator
- W5 [MINOR] S-14: Join page promises a guided start
- W6 [MINOR] S-16: 'held captures', 'Inbox items' for a new member
- W7 [MAJOR] S-22: Admin-invite warning says a vote takes it back (impossible at two); long confirm route
- W8 [MAJOR] S-28: 'Read what is due' prints a prompt for an AI
- W9 [MAJOR] S-31: Raw word keys 'screen.action.kind.records_petition' etc. in the kind list
- W10 [MINOR] S-35: 'Mute a kind' mutes 'this item only'
- W11 [MINOR] S-42: ICAP, RFC 5424, Splunk HEC… on Add another checker (advanced)
- W12 [MINOR] FC-10: 'upload:<hash>' source line; 'Added by The team's founder'
- W13 [MAJOR] FC-16: 'What this search covered' sentence uses level words and code names
- W14 [MINOR] FC-21: Doorbell small points
- W15 [MAJOR] FC-25, E49: Refusal rows missing: C-2.8 grouping sentence; 'no explanation… CITED'
- W16 [MINOR] CA9, CA23, CA44, CA45, CA50, CA57, CA67, CA69: raw ids / 'dependency' / role said twice / '(from read)' / 'opt-1'
- W17 [MINOR] CA35: Sign step raw strings ('bio-ratify-case…') and a 'device window' that does not exist
- W18 [MAJOR] E12: Strength says 'rests on nothing established' without what would make it count
- W19 [MINOR] E14, E23: 'The team's founder' for the acting member; 'What would change it' twice
- W20 [MAJOR] E34: 'Undetermined, because its owner does not settle its validity'
- W21 [MINOR] E57: Plan checks print 'p1', 'not_met'
- W22 [MAJOR] E59: 'a reason this panel has no words for yet' (add the word row for 503 UNAVAILABLE)
- W23 [MINOR] CA21: Reader's heading in capitals (internal words)

## DESIGN items (to the UX design lane; what is missing)

- [MINOR] S-09: Close form as the first large block on a new project
- [MINOR] S-15: Welcome wizard side trip: six steps point at nothing
- [MINOR] S-18: Inactive member told 'password does not match' (policy: oracle vs help)
- [MINOR] FC-23: No control to give a stored login (DEC-381); no list of 'Ask for a capture later' requests
- [MINOR] FC-30: No control to say a passage names a subject (C28-C31)
- [MINOR] E41: No manual way to flag two documents as contradicting (UC-155)
- [MAJOR/MINOR] FC-07/E05: Project page draws no list of its documents
- [MAJOR] CA32, CA62: Draft chooser (see cause)
- [MAJOR] E34, E35: Event and progression forms (see cause)
- [MAJOR] CA51: Member names the office on a records request (see cause)

## Counts

Causes in CODE/PERF/DATA/DESIGN: 96. Plus WORDS items: 23 (MAJOR 10, MINOR 13).

| class | BLOCKER | MAJOR | MINOR | total |
|---|---|---|---|---|
| CODE | 8 | 47 | 32 | 87 |
| PERF | 0 | 4 | 1 | 5 |
| DESIGN | 0 | 3 | 0 | 3 |
| DATA | 0 | 1 | 0 | 1 |
| TEST | 0 | 0 | 0 | 0 |
| WORDS (items, not causes) | 0 | 10 | 13 | 23 |

BLOCKER causes: C1, C2, C3, C4, C5, C6, C7, C8.


## Modules with CODE/PERF causes (one job per module, or per cause)

- acquisition: C5, C12, C13, C25
- action-clocks: C68
- agent-runner: C92
- attestation: C12
- basis-version-grammar: C1
- basis-versions: C1, C42
- bias: C87
- bundler: C93
- capture: C5, C9, C10, C11, C14, C25, C26, C29, C45
- capture-sources: C13
- case-authoring: C3, C47, C67
- case-disclosures: C39, C40
- citation: C31
- control-plane: C15, C52
- corpus-export: C85
- credentials: C51
- entities: C60
- events: C54, C56
- filing-templates: C65
- inquiry: C34
- instance-setup: C92
- interface-assets: C81
- interface-shell: C11, C15, C24, C76, C77, C78, C79, C80, C81, C94
- jurisdictions: C68
- money: C8, C57
- monitoring: C26
- ocr-worker: C18
- op-grades: C76
- pdf-reader: C18
- pdf-worker: C18
- people: C7
- plane: C8
- promotion: C33
- public-read: C2, C47
- publication: C2
- queue: C66, C70, C72, C73, C75
- queue-producers: C69, C94
- reevaluation: C42
- retrieval: C21
- review: C46, C52
- screens-action: C6, C53, C62, C63, C65, C66, C94
- screens-daily: C4, C21, C22, C23, C35, C70, C71, C72, C73, C74, C75, C79, C94, C96
- screens-entry: C82, C83
- screens-inquiry: C16, C17, C20, C27, C30, C31, C32, C33, C34, C35, C36, C37, C38, C40, C41, C42, C43, C44, C58, C62, C63, C90, C94, C95
- screens-intake: C9, C10, C11, C14, C23, C25, C28, C29, C45, C78, C90, C91
- screens-investigate: C6, C7, C8, C14, C54, C56, C57, C58, C59, C60, C61, C62, C95
- screens-publish: C2, C3, C46, C47, C48, C50, C51, C66, C67
- screens-settings: C14, C83, C85, C86, C87, C88, C89, C90, C91, C94
- sources: C5
- strength: C38
- text-chain: C19

(Module names are `build/modules.json` ids; a cause naming a module in parentheses as a secondary owner is listed under it too. Causes whose owner is a plane op in `plane`/`control-plane` are listed under that id when named.)

Caveat on the module list: it was generated by matching `modules.json` ids in each cause's "Module" line, so a screen name inside a parenthesis (for example `queue` in "screens-daily (queue)") can list that module too; the primary owner is the first name on the line. Cause numbers C1-C8 are the BLOCKERs and come first; the rest are in order of module group, not severity.
