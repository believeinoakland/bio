# Fix round 3 of T51: the plan

**Status** · In force (K4356): drafted 2026-10-21 by a planning worker for BOB #241, reviewed whole by BOB with K4356's changes; planned whole (K4297 (3)): every STILL and NEW row of the targeted re-walk grouped by cause, one job per module, one redeploy, a targeted re-walk, one final pass. Replaces the seed (BOB #241, K4350, K4353). Sources read whole: the seed, `fix-round-2-T51.md`, `walk-T51-rewalk/A.md` and `B.md`, `fix-round-3-diagnosis.md`, `lane-performance/HANDOFF.md` (P1-P6), `walk-T51-build/CAUSES.md`, `rulings-active.md` (K4297, K4269/K4270, K4164, K4354, §5), `later-ux.md`, the tail of `rulings.md`, `modules.json` (owners and order). The START bodies are written from this plan to `build/plan/starts-T51-F3/<job>.txt` (BOB's step).

## 1. The round in numbers

- **41 causes in jobs** (38 open from the 96 causes of the build walk, which the re-walk found STILL, plus 3 new: N2, N3, N4 below), in **28 jobs** (+1 conditional): wave 1 has **20** (the limit), wave 2 has **8** (+ `membership`, only if the C17 probe says so). Models: **27 sonnet, 1 haiku** (`wizard-scripts`), 0 opus (no new module; no new provided service of more than three ids). The four small close items of the seed are inside the jobs of their modules.
- Re-walk rows: A 96 rows (46 FIXED, 33 STILL, 4 NEW), B 38 FIXED, 28 STILL, 5 NEW. Every STILL and NEW row is placed in section 2; none is left out without a reason.
- Fixed by the re-walk and not touched again: C1, C2, C3, C6, C7, C10, C11, C12 (attest stage), C18, C20, C21, C24, C26, C27, C29 (but the ".."), C30, C31, C32, C34, C37-C39, C43-C45, C54, C56-C58, C61, C62, C66 (400), C67, C73-C75, C77, C79, C80, C82, C86, C88, C90-C93, C96, C49 (chooser; one check, section 2). Measured only after the redeploy: C13 and the bar of C12/C14/C15/C16 (section 9).
- Wording-only (never stops an act): 11 lines to `later-ux.md` (section 6). DESIGN to UX-DESIGN: one HANDOFF of 3 asks (section 7). Requirement changes: 17 (section 5), **none changes what a requirement means in Bob's sense**; two are named for BOB to confirm (RC-9, RC-12).
- No job holds a module held by another job of the same wave. Causes with a part in another job are marked `*`.

## 2. Every STILL and NEW row, placed

Placement key: job name (module that owns the cause, K4164); `LU` = wording only → `later-ux.md` (K4269, K4270); `DESIGN` = UX-DESIGN handoff; `NR` = not a defect / not reproducible / not exercised, with why. Ids are those of the rows (A = rewalk A, B = rewalk B).

| cause | rows (finding ids) | what remains | placed |
|---|---|---|---|
| C84 | A S-01 data | stored `REFUSED:main.cvd:403` is the old Worker code's; `freshclam` never ran; no door starts a run; CDN may refuse full downloads | `file-scanner` (async mirror, seeded dir) + `file-safety` (`scanmirror`, self-start, words) + `screens-settings` (button); image republished at redeploy (section 9) |
| C83 | A S-01 words, C76 S-01-adjacent | "(status 403)" printed (stale string, new error form unparsed); the administrator's step printed twice | `file-safety` (parse `MIRROR_REFUSED`) + `screens-settings` (once) |
| C5 | A E07, NEW x2, B none | multi-part PDF over ~8 MB: 504 in `read` (double write and read-back, `keepWhole`); a registered parts-only home is never read (INFO-2026-0042: no reading, 409 on OCR) | `acquisition` (no read-back, `keep` stage) + `extraction` (`readHeld`) + `control-plane` (door calls it); `STORE_DID_NOT_ANSWER` at 20 s (A) is the load of the same double write: gone with it, re-measured |
| C9 | A FC-07/FC-06(c), B E04 | "Open it" is drawn, nothing is filed under the member's project | `capture` (`seen_in` row, listing) + `screens-intake` (call it, say it) |
| C17 | A NEW (project-less photo), FC-14 typed words | OCR act drawn on an unread picture (409); no reading and no word at capture; "Nothing here" above typed words | `screens-inquiry` + `screens-intake` (result line) + probe → `control-plane` or conditional `membership` |
| C64 | B CA51 (+ CA47, CA66 not exercised: they wait on it) | member cannot name a federal office | `entities`, `cause-shell-3` (op-grades), `screens-action`, `screens-settings`, `wizard-scripts` (seed) |
| C19 | A FC-10, B FC-10/CA4/E20 | reading lists in-page furniture ("Official websites use .gov", "Exiting nps.gov", "Cancel", "Share", "Facebook") with a Cite each; R32 only drops landmarks | `cause-reading-3` |
| C25 | A FC-06(a)/FC-18(d), B E08/CA3/E18 | web page named "index.htm" or "A page from <host>, captured <date>"; a PDF's file name on one screen, host on another | `cause-reading-3` (HTML title in the reading), `acquisition` (answer carries the document's own title), `screens-intake` (name from it at capture; one rule), `screens-inquiry` (document page uses the record's name) |
| C12 | A FC-04 stage, B CA45 acts | a fixed 3.000 s attest wait on every capture; acts 5-7 s | `acquisition` (P4a), `cause-shell-3` (P6) |
| C13 | A FC-04 render | render 16.7-19.2 s, 504 at the door | `host-governor` (P4b), `acquisition` (P4b, answer when kept), `capture-sources` (P5) |
| C14 | A S-31/S-37/FC-20, B CA2/CA19/CA45/CA56/E24/E29/E36, pickers, Add 7.2 s, Held 13 s, Inbox 8.9 s, Project 9.6 s | screens 5-13 s, 81-124 reads; pickers fill after 6 s | `cause-shell-3` (P2.1, P6), `project-roster` (P2.2), `capture` (P2.3), `screens-daily`, `screens-intake`, `screens-inquiry`, `screens-investigate` (their reads), re-measured against K4354's bar |
| C15 | A S-37 | `interfacewords` 6.2 MB re-downloaded on every load, no cache header on the signed-in request (the version is not in hand when the shell asks) | `cause-shell-3` (P1; P2.4) + `control-plane` (page policy for P2.4) |
| C16 | A FC-11, B FC-11 | document page 50-124 reads: one `projectquestions` per project, `heldcaptures` full rows | `screens-inquiry` (P3) + `capture` (picker row, one row by bundle) |
| C8 + N1 | B E36 (money trail unreachable after reload, MAJOR NEW) | "No money trail is open here yet" though four exist; no op lists a project's trails | `money` (a read of a project's trails by `concerns`) + `screens-investigate` |
| C36 | B CA8/E13 | question legs name the document and page, not the cited words | `screens-inquiry` |
| C35 | A FC-27 fixed; B FC-27/E52 | the same two question titles twice, no project, in "For which question" (Add) and "Draw on a question from elsewhere" (project) | `screens-intake`, `screens-inquiry` |
| C95 | B E10/E24/E29 | cite list holds all 19 team questions, none preselected though the note says so | `screens-inquiry` (document), `screens-investigate` (parts) |
| N2 | B C31 aside | "Cite this" with no question chosen sends nothing, says nothing | `screens-inquiry` |
| C40 | B CA28 | after "Ask for the confirmation again" the page still says "no trusted time stamp, no outside copy" and not that one was made late | `case-disclosures` (the pre-flight reads a late attestation as the attempt it is, R20) + `screens-publish` (re-read, say it) |
| C46 | B CA16, CA21 | case editor and outside reader still draw the file's headings (`## Question ... ## Conclusion`) with an empty Conclusion; the editor lists a raw question id | `review` (`findingWords`: front-matter conclusion first) + `screens-publish` (id → title, no headings) |
| C47 | B CA36/CA38 | published EVIDENCE lists "Capture B, Capture B" with no name; "What would change it" not drawn on the public page | `public-read` (entries carry the document's name and page; falsifier served) + `screens-publish` (draw) |
| C48, C50 | B CA33, CA41 | reload loses "Edition 1 is prepared"; reopened ceremony does not say edition 1 is published, no link | `case-authoring` (`casedrafts`/pre-flight carry each draft's prepared and published edition and its address) + `screens-publish` (draw from the record) |
| C49 | B CA32/CA62 | chooser FIXED; after choosing the earlier draft the headings did not change (unconfirmed) | `screens-publish` (test: the chosen draft's scope and date head the page; if it holds, nothing) |
| C51 | B CA34 | registration 37.6 s with no progress; no control to load a key file | `credentials` (time `signerregister`, cut it) + `screens-publish` (load my key file; a progress line; reuse the key the device holds) + `screens-settings` (Account's key section, same helper) |
| C53 | B CA43/E43/E44 | no reminder button once an option is chosen; the action page's reminder is gone after reload | `screens-action` (plan, due-date: read `reminded` from the record) |
| C59 | B E26 | no "Choose the passage" control on a person or organisation page; Money shows "Nothing here" and Timeline "Could not read this" for the passage pickers | `screens-investigate` (parts: one passage picker, N3) |
| C63 | B E42/E46 | "Plan what to do" opens no plan page | `screens-inquiry` (project) |
| C66 | B CA68 | "Show the routes" silent when none | `screens-action` |
| C69 | B CA60 | two identical NOTICED items for one newer version (Queue, member Home) | `queue-producers` |
| C70 | A S-03 | 28 vouch rows are not in the bell and the sidebar number (34 vs 47-48) | `screens-daily` (the band counts and says) + `cause-shell-3` (the badge adds the band's count) |
| C78 | A FC-05/S-40(d) | the tip stays open after the press; the stored-logins explanation sits under the other button | `cause-shell-3` (close on press) + `screens-intake` (place the text) |
| C81 | A S-40/FC-31/FC-02/FC-19, B CA18/CA61/E53/E54 | 390 px: main area 401-523 px, "Remove a citation", "Narrow the question", "Check whether its route can be shown", "Comment" cut; targets under 30 px; the people chip to 426; case-editor strip numbers over the words | `cause-shell-3` (shared styles) then each screen job fixes its own cut control after measuring (screens-inquiry, screens-publish, screens-daily, screens-intake) |
| C94 | A FC-06(c), B S-25/E28/E43 | member link `/app/members/admin` (id) where the handle belongs; reply "admin"; published "Written by admin and published by admin" | `cause-shell-3` (`memberHref(id)` beside `memberName`), `screens-intake`, `screens-publish`, `public-read` (the byline names the member's cover handle, R2-era rule; QUESTION if no field) |
| C22 | A FC-17 | frontier counts but places not named ("Nobody has looked yet at 9 places") | `screens-daily` |
| C23 | A FC-02, FC-20 | stage boxes at different left edges; Held lists every project mixed; "Open the file" box 54 x 40 px | `screens-daily`, `screens-intake` (Held: filter by project, layout) |
| C28 | A FC-22 | Inbox detail: no file name, no type, no way to open before deciding | `screens-intake` (adopt DEC-399 name/type) + `doorbell` (answers carry them; check). The safe view is LU (K4332: needs a drawing) |
| C29 | A FC-09 | result ends ".." | `screens-intake` |
| C85 | A S-29 | counts bare "112 · 312 · 600", comma missing | `screens-settings` |
| C87 | A S-32 (c), (d) | (c) not reproducible, boxes hold text; (d) `grouprules` has no door in Settings | `screens-settings` (door if the screen is built; refusal-before-reason test for (c)) |
| FC-23 | A FC-23 (MINOR), NEW silent | logins button draws no list or "none stored"; "Show my requests for later" draws nothing when none; no control to give a stored login | `screens-intake` (say none; DEC-381 list) + DESIGN (the control that gives a login, section 7) |
| N4 | A NEW (see FC-23) | same two silent buttons | `screens-intake` |
| small 1 | seed (K4320) | inbox list routed `inboxlist`, hand-declared `inbox` (plane R71 alias) | `doorbell` (declare `inboxlist`, keep `inbox` as the alias) |
| small 2 | seed (K4230) | `wizards` declares `state`, the arm reads it from the query | `wizard-scripts` |
| small 3 | seed (K4332) | case-authoring R77's not-reached minutes shape | `case-authoring` |
| small 4 | seed (K4334) | `impact.mjs` lists `plane/r42-entry.mjs` as a test | BOB's tooling, not a job (BOB edits `build/plan/impact.mjs` before wave 1) |
| C76 | B CA31/E09 ("Vouch for this copy" marked, asks nothing) | false mark | LU: joins the K4199 line (section 6); S-45's mark is true: NR |
| C33 | A FC-24 gap, B FC-24 | a wrong held capture is set aside from Held (`heldsetaside`, capture R79, drawn) | LU: the door on the document page is already in `later-ux.md` (K4328); the cited-copy sentence names the question: NR |
| C55 | B E34/E35 | event form without words/date/participants | LU (already listed; the operation completes) |
| W1, W2, W3, W4, W6, W8, W12, W13, S-09 | A | words and one layout | LU, all already in `later-ux.md` (no new line) |
| CA35 (W17), E12 (W18), CA22/CA23 role twice, E14/E23 | B | words | LU, already listed |
| C12 render-stage 504 sentence | A FC-04 | "site took longer" though our render took 16 s | LU (already listed: the sentence is the design's); the cause is C13 |
| C41, C42, C60 (matching), C65, C68, C96 | B (not exercised) | fixes of round 2 not yet seen | NR: no known defect; the re-walk exercises C65/C68 after C64 (a fixture), C42 with a newer copy, C41 by a contrived refusal; `entities` adds one test for C60's fault half (a vouched memo naming a registered organisation is found by `connect`) |
| C4, C71, C89, C90 (S-27), C87c | A (not exercised) | would change shared state | NR: tests only in their jobs; BOB prepares a fixture (a pending endorsement of the last administrator, a second member) for the re-walk |
| store timeouts | B NEW (first-try 502 `STORE_DID_NOT_ANSWER` after a pause) | the sentence is honest; the retry works; not reproduced on later addresses | NR as a code defect; the performance lane watches it in the re-measure and reports a cause if it recurs (cold start of the store) |
| C13 container cold start | A | whether the container start or the page decides | measured in the re-measure (section 9) |
| C17 coverage figure | A FC-13 | "Read N of M" counts words returned, not words right | LU (new line; needs OCR confidence and a drawing) |
| C23 two words for one state | A FC-18 | "Awaiting review" (table) vs "held until you vouch" (Held) | LU (new line) |
| Held "Refused / Open it to vouch for it by itself" | A FC-20 (I-09) | label on doorbell and observation rows | LU (new line) |

## 3. Jobs

Every job: medium effort, its own suites then `build/plan/impact.mjs tranche/T51 HEAD` for its users; "declare every census op you own" in each START (K4208); new member-facing sentences are word rows the design stream writes first (each job lists its keys and posts one QUESTION; BOB sends one batch; jobs do not wait). `*` = the cause has a part elsewhere.

| job | model | wave | merge | modules held | causes |
|---|---|---|---|---|---|
| file-scanner | sonnet | 1 | 1 | file-scanner | C84 |
| credentials | sonnet | 1 | 2 | credentials | C51* |
| project-roster | sonnet | 1 | 3 | project-roster | C14* (P2.2) |
| host-governor | sonnet | 1 | 4 | host-governor | C13* (P4b) |
| capture-sources | sonnet | 1 | 5 | capture-sources | C13* (P5) |
| acquisition | sonnet | 1 | 6 | acquisition | C5*, C12, C13*, C25* |
| capture | sonnet | 1 | 7 | capture | C9*, C14*, C16* |
| doorbell | sonnet | 1 | 8 | doorbell | C28*, small 1 |
| file-safety | sonnet | 1 | 9 | file-safety | C84*, C83* |
| cause-reading-3 | sonnet | 1 | 10 | text-chain, reading-pipeline | C19, C25* |
| extraction | sonnet | 1 | 11 | extraction | C5* |
| entities | sonnet | 1 | 12 | entities | C64*, C60 test |
| money | sonnet | 1 | 13 | money | C8* (N1) |
| wizard-scripts | haiku | 1 | 14 | wizard-scripts | C64*, small 2 |
| queue-producers | sonnet | 1 | 15 | queue-producers | C69 |
| case-disclosures | sonnet | 1 | 16 | case-disclosures | C40* |
| public-read | sonnet | 1 | 17 | public-read | C47*, C94* |
| case-authoring | sonnet | 1 | 18 | case-authoring | C48*, C50*, small 3 |
| review | sonnet | 1 | 19 | review | C46* |
| cause-shell-3 | sonnet | 1 | 20 | op-grades, interface-assets, interface-shell | C15*, C14* (P1, P2.1, P6), C64*, C70*, C78*, C81*, C94* |
| screens-settings | sonnet | 2 | 1 | screens-settings | C83*, C84*, C85, C87, C64*, C51*, C81* |
| screens-intake | sonnet | 2 | 2 | screens-intake | C9*, C14*, C17*, C23*, C25*, C28*, C29, C35*, C78*, C94*, FC-23, N4, C81* |
| screens-daily | sonnet | 2 | 3 | screens-daily | C14* (P2.2, P2.3), C22, C23*, C70*, C81* |
| screens-inquiry | sonnet | 2 | 4 | screens-inquiry | C16* (P3), C17, C25*, C35*, C36, C63, C95*, N2, C81* |
| screens-investigate | sonnet | 2 | 5 | screens-investigate | C8*, C14*, C59, C95*, N3 |
| screens-publish | sonnet | 2 | 6 | screens-publish | C40*, C46*, C47*, C48*, C49, C50*, C51*, C94*, C81* |
| screens-action | sonnet | 2 | 7 | screens-action | C64*, C53, C66 |
| control-plane | sonnet | 2 | 8 | control-plane | C5*, C15* (P2.4), C17* |
| membership (conditional) | sonnet | 2 | 0 | membership | C17* only if the probe shows (b) |

**Wave 1** (20, providers first, merge order as the table): file-scanner > credentials > project-roster > host-governor > capture-sources > acquisition > capture > doorbell > file-safety > cause-reading-3 > extraction > entities > money > wizard-scripts > queue-producers > case-disclosures > public-read > case-authoring > review > cause-shell-3. (Layers: 1; 2; 2; 3; 3; 3; 3; 3; 3; 1+4; 4; 5; 5; 11 (data); 11 (producers); 8; 8; 8; 8; 11. Merge order follows the highest module index of the job, so `cause-reading-3` merges before `extraction`.)
**Wave 2** (8 + conditional): (membership) > screens-settings > screens-intake > screens-daily > screens-inquiry > screens-investigate > screens-publish > screens-action > control-plane. Wave 2 starts when wave 1 is merged: its screens adopt wave 1's providers (project-roster's fields, capture's cheap picker and `seen_in`, entities' office, money's trail list, case-authoring's editions, the shell's `memberHref`, public-read's names, file-safety's `scanmirror`). Why not wave 1 for the independent screens: the 20-job limit.
**Reserve wave 3** for halves a job finds in a module it does not hold (QUESTION, P9): C46's second plane half, C53's read of reminders (action-clocks/action-plans), C25 (reading title for PDF), C28 (a knock's name/type in doorbell), C94's cover-handle field, C48's ledger (ratification).
**Impact.** BOB runs the whole suite on the merged tranche once per wave (the biggest users: `plane`, `control-plane`, `op-declarations`, `answer-envelope`).

## 4. START essentials per job (2-5 lines each; BOB's STARTs carry the full text)

**file-scanner** (C84; R6, R8, R12, R34 unchanged). `POST /mirror?async=1` starts the run (`ctx.waitUntil(runMirror)`) and answers 202 `{ok, started}`; a full download inside a service-binding request is too long. The updater's `DatabaseDirectory` is seeded with the current mirrored set (the Worker holds it in R2) so `freshclam` fetches `.cdiff`s, not 160 MB again. Tests: `/mirror?async=1` answers 202 at once and the outcome lands in `/version` `signatures`; a seeded run asks for no full `main.cvd`. R6 amended (RC-1).

**credentials** (C51 timing; `signerregisterown`). Time the arm stage by stage (the walker saw 37.6 s, the stages are unknown), cut the dominant stage (suspect: the administrator notification fan-out or a hash), keep it under the bar; time and the stage go in the answer's `timings`. Tests: a registration answers within a bounded count of store calls; an administrator is still told. Ask (QUESTION) if the cost is in a module it does not hold.

**project-roster** (P2.2). `projectlist` answers each project's question count and its drafts-shared-for-review summary (`shared_drafts`: count and the newest), by one query inside the plane. Adds fields, removes none. Tests: the roster answer carries both for a fixture of three projects; no extra read per project. Requirement: new R (RC-2).

**host-governor** (P4b; C13). Admission without booking: `admit({peek:true})` answers admission or refusal and spends no token, no `last_grant_at`; or the render path hands its admission to the fetch so a host visit books once. Tests: render-path admit then fetch books once; the gap of a plain fetch is unchanged. Requirement: RC-3.

**capture-sources** (P5; C13; `browserrender.mjs`). Collect sub-resource bodies concurrently (a handful at a time) and from the start of the load, cap the body phase to what the door's bound leaves, time each phase (session, load, quiet, bodies) in the answer. Tests: a page with 20 slow sub-resources finishes inside the cap; phases are reported. Requirement: RC-4.

**acquisition** (C5 read, C12, C13, C25; R10, R11, R20, R95). (a) Keep each part's bytes in memory while the total is under `MULTIPART_KEEP_MAX`; put the whole once under the whole sha when the stream ends (no read-back, no second digest of parts); time `keep` apart from `read`. (b) No fixed 3 s attest wait: answer with the attempt pending, the late outcome recorded as today (capture R68). (c) One governor booking per host visit on the render path (host-governor's peek); the visitor-view capture answered when the page is kept, the render continuing as the second part (`render_pending`). (d) The answer carries the document's own title (HTML title, first heading, PDF Title) for the name (C25). (e) **K4356:** no keep ceiling: past what memory holds, the whole is written through the object store's own multipart upload (each part streamed once into one whole object, no read-back), so a large PDF is kept whole and usable; a refusal only above the store's own object bound, in words. Tests: a 16 MiB three-part fixture whose store `put` costs 1.5 s answers inside the bound; `keep` timed; a second press during the first keeps one object. RC-5.

**capture** (C9, C14, C16; R77, R83, R94). `recordSeenIn({captureSha, project, by})` into `seen_in(capture_sha, project, by, at)`, idempotent on (sha, project), declared to record-core's purge (R74, R87); `heldCaptures({project})` also lists a document seen there (`also_here`, its home project named), still gated by the viewer's sight of the home bundle. A picker row answers `whole` from the size the register recorded at keeping (no evidence-store `head` per row; `head` kept for single-document screens), and a read for one bundle (`bundle_id`) for the document page. Tests: the project list shows the acgov-type document filed from another project, and not to a viewer who cannot see its home; picker rows make no store call per row. RC-6.

**doorbell** (C28, small 1). Declare `inboxlist` where the route is and keep `inbox` as the alias (plane R71). Check the knock answers (`knocksof`, `inboxget`) carry file name and type (DEC-399); add them if missing. Tests: the declaration census agrees with the route; a knock answers name and type. Ask if the name is held elsewhere.

**file-safety** (C84, C83; R5, R46). A new administrator op `scanmirror` ("Check for new signatures now"): calls `/mirror?async=1` through the binding, refuses when `last_attempt` is under 15 minutes old, answers "started". Self-start: when `scanStatus` or the scan batch reads `/version` with no published set and `last_attempt` null or older than 6 h, it starts the run once (so the 86 queued files scan after the redeploy with no human act). `#noSignatures` parses `MIRROR_REFUSED:exit N: ...` as well as the old form (a status number found in the text, else "refused"). Tests: the three cases; the 15 min and 6 h guards; the words stay true for both forms. RC-7.

**cause-reading-3** (C19, C25; text-chain, reading-pipeline R32). The furniture list grows beyond landmarks: dialogs and `aria-modal`, banners (government/cookie banners by role, class and id), share bars, blocks of only controls or only links, "skip" and "exiting" notices; the evidentiary region (`main`/`article`) when present still wins; script/style/template/head stay dropped. HTML readings also carry a `title` (title element, else first heading) for C25. Tests: fixtures of nps.gov, justice.gov and acgov pages (saved) read without the walker's listed furniture; extents already cited still resolve (R32's check). RC-8.

**extraction** (C5 repair; R1, R19, R20, R31). `readHeld({sha})`, idempotent, writes no bundle: when the register has a home bundle, no `readings` row for the sha, and the store now holds the object under the sha, read the stored document and write the reading for that bundle. Called by the door after an `acquire` or `captureupload` that answers `existed: true`, and after `keepWhole`. Tests: a parts-only home gets its reading once the whole is held; a second call changes nothing; OCR re-read (R31) then works. RC-9 (BOB confirms).

**entities** (C64, C60 test; DEC-401, DEC-402 @ 43379a1a44). `entitycreate` admits an office to a member when sent from `request`, saved for the team with the mark "Named by a member" (`screen.request.nameoffice.mark`) until an administrator confirms; an administrator's confirm (a provided service: new op id or new act on the existing one). Tests: a member names a federal office and files; the office appears marked; confirm clears the mark; a member cannot do it from another screen. RC-10.

**money** (C8/N1). A read of a project's trails (`moneysets`, by `concerns`), newest first, so a trail started in a project is found again after a reload; no write change. Tests: four trails started in one project are all listed; a hidden project's are not shown to a non-member. RC-11.

**wizard-scripts** (C64, small 2; haiku, mechanical). The registry re-taken at 43379a1a44 (request's acts gain `entitycreate`, `screen-registry.mjs` and data); `wizards` stops declaring `state` (the arm reads it from the query). Tests: registry check, declaration census.

**queue-producers** (C69; R52, R53). One NOTICED item per (subject, newer version): the second identical item is not produced (key on the item's subject and version, not on the watcher). Identical-looking pairs of "Who issued a document", "A full export" and the administrator's key notices are distinct events: untouched. Tests: two notices of one version give one item; a new version gives a new one.

**case-disclosures** (C40; R20 attempts). The pre-flight counts an attempt made late by `reattest` as the timestamp it is, marked "late: proves the bytes existed by <time>, not at capture", and its `co_attested` says which of the two (timestamp, co-archive) is still missing. Tests: after `reattest` the pre-flight shows `timestamp_at` and the missing one. Ask (QUESTION) if the attempt is held by attestation.

**public-read** (C47, C94, C2 residual; R39). Evidence entries on the published page carry the document's name and the page/paragraph (the leg "named only", never its bytes, B318 4), the falsifier ("What would change it") is served beside the claim, and the byline names the member's cover handle, never the member id. Tests: two entries are told apart; the falsifier is served; no member id on the page. RC-12 (BOB confirms the byline source).

**case-authoring** (C48, C50, small 3; R34, R77). `casedrafts` and the pre-flight carry each draft's prepared edition (number) and, once published, its edition and public address; R77's not-reached minutes shape is stated, never filled. Tests: a reloaded draft reads "prepared"; a published draft reads its number and address; a second prepare answers the same edition without minting. RC-13.

**review** (C46; R41, R18). `findingWords` takes the front-matter `conclusion`/`statement` first, never the section headings, and never the session log; an empty conclusion is told as "not concluded yet". Tests: a concluded finding's reader copy and editor row show its words with no `## ` heading; the outside reader sees no log or ids.

**cause-shell-3** (op-grades 141, interface-assets 157, interface-shell 158; P1, P2.1, P2.4 shell half, P6, C78, C64 grade, C70, C81, C94). (P1) `loadWords` reads the release version from the served page (put in the page at serve time), so `interfacewords` names `v` and the year cache applies; (P2.1) `loadReach` redraws without re-reading the screen; (P6) an act re-reads only the reads its screen marks as depending on it or whose request changed, "all" only for an act that says so, the fallback kept for undeclared acts; (P2.4) the shell served as a versioned `immutable` script, its hash exported for the CSP in place of the per-response nonce; (C78) the tip closes on press; (C70) the badge adds the vouch band's count; (C94) `memberHref(id)` (the handle in the link); (C81) shared styles: cards and buttons within the screen at 390 px, 44 px targets, the people chip, strip numbers, with measured-width tests; (C64) the grade of `entitycreate` from `request`. Tests: the second load asks `interfacewords` with `v`; an act's repeat set equals what its screen declares; measured widths at 390 px. RC-14 (P6 default), RC-15 (versioned script).

**screens-settings** (C83, C84, C85, C87, C64, C51, C81). Security: the true state once (the administrator's step printed one time), a "Check for new signatures now" button calling `scanmirror`; group: counts labelled and the comma; places: "Named by a member" offices with the administrator's confirm; Account: the key section uses the same load-key-file helper; a door to `grouprules` if the screen is built and nothing links it (census first). Tests: refusal-before-reason with an empty box; the button; the confirm.

**screens-intake** (C9, C14, C17, C23, C25, C28, C29, C35, C78, C94, FC-23, N4, C81; R2, R22, R49, R50). `doneAcquire`/`doneUpload` call `recordSeenIn` for the subject's project (and `recordCapturedFor` for a question) and say "Filed here as well; it stays held under <project>"; a project-less upload's result line states whether it was read and what to do; names come from the answer's title (C25: title, file name, host and date; one rule); Held filters by project, the "Open the file" box gets its width, the picker reads `fields=picker`; Inbox shows name and type (DEC-399); "none stored" and "no requests for later" are said; the explanation under its own button; "Add for which question" shows the project; member link by handle; no ".." Tests: the acgov-type address shows in the project's list; a held copy shown once.

**screens-daily** (P2.2, P2.3, C22, C23, C70, C81). Rows read the roster's question count and shared-drafts summary (no per-project `projectquestions`/`casedrafts`); `todos.mjs` asks `fields=picker` and shares one `heldcaptures` read with `doors.mjs`; Find names the places the frontier counts; Projects stage boxes align; the vouch band is counted in the page's own count. Tests: Home makes no per-project read; the count equals the rows.

**screens-inquiry** (P3/C16, C17, C25, C35, C36, C63, C95, N2, C81). Document: an unread copy says so and why and draws no re-read (`rv0 !== null` only), picture-ness from the record's own type; the citation picker's questions in one read (or when opened) with their projects, this one's question preselected, a sentence if none is chosen (N2); `heldcaptures` for this copy's row only; the record's name; typed words without "Nothing here". Question: legs show the cited words. Project: "Plan what to do" opens the plan; "Draw on a question" names the project. Tests: no `projectquestions` per project; the re-read act absent for an unread picture. The C17 probe decides section 8's follow-up.

**screens-investigate** (C8/N1, C14, C59, C95, N3). Money reads the project's trails (money's new read) and lists them; one passage picker (parts.mjs) used by person, Money and Timeline says why it is empty ("this document has no reading yet") instead of "Nothing here"/"Could not read this"; pickers fill when opened with `fields=picker`. Tests: the trail is found after a reload; the picker names its reason.

**screens-publish** (C40, C46, C47, C48, C49, C50, C51, C94, C81). Ceremony: reads the draft's prepared/published edition ("Edition 1 is prepared", "Published: edition 1" + link), re-reads the pre-flight after `reattest` and says which proof now exists; case editor: finding words and titles, never `## ` or a question id; published page draws the evidence names and the falsifier; sign step: load my key file, reuse the device's key, a progress line during registration; the chosen draft's scope and date head the page (C49 test); reply author by `memberName`; 390 px cut controls ("Comment", strip numbers).

**screens-action** (C64, C53, C66). `request.mjs`: "Name the office yourself" as DEC-402 draws it, `entitycreate` in request's acts, the reworded `screen.request.nooffice.admin`; plan: a reminder act on a chosen option and the date read from the record (also after reload); "Show the routes" says none. Tests: a member files a request to a federal office; the reminder survives a reload.

**control-plane** (C5 door, C15 P2.4 policy, C17 door). After an `acquire`/`captureupload` answering `existed: true`, call `extraction.readHeld` (and after `keepWhole`); serve the shell as the versioned `immutable` script with its hash in the CSP in place of the nonce (R105, R116 and the page policy); C17: if the probe shows the door promoted an upload whose reading failed, refuse or say so (R100). Tests: INFO-2026-0042-type record gains its reading; the CSP matches the script hash; a second load is cached.

**membership** (conditional; C17(b)). Only if the probe shows a project-less member capture's reading withheld by `projectGate` (a bundle with `project = ''` outside every carried project): a project-less bundle the member captured is in that member's reach (R43, R149). If the probe shows (a) the door, `control-plane` carries it.

## 5. Requirement changes (BOB writes them before the wave that needs them; jobs read them)

"Provided service" = marked `PS`. All wording or detail of existing doctrine unless marked.

| id | module, line | proposed text (one line) | kind |
|---|---|---|---|
| RC-1 | file-scanner R6 (PS) | `POST /mirror?async=1` starts a signature run and answers 202; the updater is seeded with the current mirrored set. | BOB's |
| RC-2 | project-roster, new (PS) | `projectlist` answers each project's question count and a summary of its drafts shared for review. | BOB's |
| RC-3 | host-governor, new (PS) | An admission may be asked without booking (a peek); one host visit books once. | BOB's |
| RC-4 | capture-sources, new | Sub-resource bodies are collected concurrently from the start of the load, the body phase capped to what the door's bound leaves, each phase timed. | BOB's |
| RC-5 | acquisition R10/R11/R20/R95 | A multipart capture is kept whole from the parts held in memory with no read-back (stage `keep` timed); no fixed wait for the timestamp (the answer returns with the attempt pending); one governor booking per host visit; the answer carries the document's own title; a large capture is kept whole through the store's multipart upload, with no ceiling below the store's own bound (K4356). | BOB's (supersedes RC-1 of round 2's order of steps) |
| RC-6 | capture R77, R94, picker | A project's list also holds documents seen there (`seen_in`, `also_here`) while the document keeps one home; a picker row answers `whole` from the recorded size. | BOB's, **borderline**: provenance R2 and Intake Doctrine §8 unchanged (a reference, not a second home). If BOB reads it as widening §8, it goes to Bob with the options of the diagnosis: (a) this row, (b) refuse and tell the member where it lives, (c) copy |
| RC-7 | file-safety R5, R46 (PS) | Op `scanmirror` (administrator) starts a signature run, refused within 15 minutes of the last attempt; a scan batch finding no signatures starts one run per 6 hours; both error forms are worded. | BOB's |
| RC-8 | reading-pipeline R32 | Furniture also includes dialogs, banners, share bars, notices and blocks of only controls or links; a reading of an HTML page carries its title. | BOB's: applies K4194/K4303 ("content less its furniture"); told to Bob because it changes which passages a member may cite, second time |
| RC-9 | extraction R20 | A reading is also written for a registered home that has none once its bytes are held whole (`readHeld`). | BOB's |
| RC-10 | entities, new (PS) | A member may name an office from a request; it is saved for the team marked "Named by a member" until an administrator confirms it; the administrator's confirm. | BOB's: DEC-401/402 (Bob) already ruled this; it changes who may create an office, which Bob ruled |
| RC-11 | money, new (PS) | A project's money trails are listed by what they concern. | BOB's |
| RC-12 | public-read R39 | The published page names each evidence entry (document and place), serves the falsifier, and names the author by cover handle. | BOB's; the byline is policy-adjacent: if the cover handle is not already the public name (K3079 line), BOB asks Bob |
| RC-13 | case-authoring, new | Drafts and the pre-flight carry each draft's prepared and published edition and its address; R77's not-reached shape is stated. | BOB's |
| RC-14 | interface-shell, new (P6) | An act re-reads the reads its screen marks as depending on it or whose request changed; "all" only when the act says so. | BOB's |
| RC-15 | interface-shell, control-plane R105/R116 | The shell is a versioned immutable script; the page policy names its hash. | BOB's (K4353: placed, not waiting) |
| RC-16 | screens-inquiry R96/R3, screens-intake R2 | An act that re-reads is drawn only when a reading is held; an unread copy says so and why; a project-less upload's result line says whether it was read. | BOB's |
| RC-17 | screens-intake R49/R22, R55 | A found document is also recorded for the question and filed here as a reference ("Filed here as well"), the holder named and linked when hidden. | BOB's |

Told only: RC-8. RC-5(e) changed by K4356 (no ceiling: nothing a member may capture is narrowed). **C17's rule:** if the probe shows a deliberate "a copy is read only when filed in a project" rule, that is doctrine (reading visible to every member, project-less bundles visible to all): Bob's, with options (a) read regardless of project, recommended, (b) require a project at capture. Nothing is asked until the probe is read.

## 6. WORDS: new lines for `later-ux.md` (BOB appends; nothing here stops a member completing an act)

- Held, Doorbell and observation rows · "Refused / Open it to vouch for it by itself" on rows never refused · A FC-20, I-09 · 2026-10-21
- Find, Held · two words for one state ("Awaiting review", "held until you vouch") · A FC-18 · 2026-10-21
- Document · "Read N of M words" counts words returned, not words right; no warning when many are misread (needs the reader's confidence and a drawing) · A FC-13 · 2026-10-21
- Document · the cited-copy refusal names the question but offers no door to remove its citations · B FC-24 (C33) · 2026-10-21
- Money · the period sentence says "A follow names the days it covers" · B E36 · 2026-10-21
- Vouch for this copy · marked "Asks for a reason" and asks nothing: joins the K4199 line with CA31, E09 · B C76 · 2026-10-21
- Already listed, no new line: W1, W2, W3, W4, W6, W8, W12, W13, S-09, C55 (E34, E35), CA35, E12, the role said twice, the 504 render-stage sentence, C33's door on the document page (K4328), the inbox safe view (K4332), C72 (K4307).

## 7. DESIGN: one HANDOFF to the UX design lane (BOB posts it)

> **HANDOFF to the UX design lane from BOB (T51 fix round 3).** The re-walk found these operations a member still cannot finish. Please draw them; BOB gives the code to a job when your drawing exists. (1) **A stored login (FC-23, DEC-381):** "Show the stored logins" lists none and no control gives one; draw the control and the list. (2) **A passage that names a subject (FC-30) and two documents flagged as contradicting by hand (E41, UC-155):** still no control; tell us whether they are drawn since round 2's HANDOFF 3, and where. (3) **Name the new sentences:** BOB sends the batch of word rows the round's jobs need (scanner state and button, "Filed here as well", "this document has no reading yet", "Named by a member", edition and key-file sentences). Not asked: C55, S-09, S-15, S-18 (`later-ux.md`), C64 (drawn, DEC-402).

## 8. Before wave 2, beside wave 1: the C17 probe (read-only, BOB's walker)

On the live copy: `op=reading&sha256=<the project-less photo's sha>` as the member and as the administrator. (b) the administrator sees a reading, the member does not → membership gates it: open the conditional `membership` job in wave 2. (a) neither sees one → `control-plane`'s C17 part (the door promoted a failed reading). The screen half is in `screens-inquiry` either way.

**Probe result (K4358, `fix-round-3-c17-probe.md`):** (a). `op=reading` for INFO-2026-0080's sha answers `found:false` to both roles (before any redaction); an earlier project-less photo is read, so project-lessness is not the cause. A second upload of the same bytes answers `existed:true` with a document; `readUploaded` (control-plane index.mjs:2349) returns it unread and `doneUpload` promotes it without a reading, discarding the first upload's. `control-plane` carries it (read when `existed:true` carries a document and no reading is held for the sha, through extraction's `readHeld`); the `membership` job is not opened.

## 9. After the round

1. BOB merges each wave in the order above and runs the whole suite on the merged tranche before the next wave opens (never as a gate for the deploy, K4297 (1)).
2. Regenerate in the manifest's order (K1540, K4355): member-roster `order.mjs`, setup-words `rows.mjs`, then `program.mjs`, `court-data.mjs`, wizard-scripts' data, then `node bio-plane/scripts/bundles.mjs`, then `newgroup`. Verify: `fleetbundles.test.mjs` and `newgroup-bundle-fresh.test.mjs`, each `0 fail`, no `SKIP`; ownership, coverage and words checks clean; stale tests fixed by BOB, test files only (K4297 (2)).
3. **Scanner image:** `container/scanner.mjs` changes, so publish the scanner image from the tranche tip with `container-images.yml`, write its digest and `source_sha256` into the marker and `wrangler.jsonc` (bundler R36/R37); BOB checks mechanics §16 for whether that dispatch is Bob's to approve; then redeploy; the scan batch starts the first signature run by itself, or an administrator presses "Check for new signatures now"; read `scanstatus` `last_error`. If it reads `MIRROR_REFUSED:exit 1 ... 403`, the host refuses Cloudflare egress and the choice (a mirror the team controls) goes to Bob with options.
4. Redeploy biosmoke8.
5. **Targeted re-walk of exactly what changed** (two walkers, as K4348): every cause above by its Findings line; plus the fixtures for the not-exercised rows (a pending endorsement of the last administrator, a set act, a federal-office request to its reply and template, a newer copy for C42), the live probe of section 8, and INFO-2026-0042 re-captured (it should gain its reading).
6. **The performance lane re-measures against K4354's bar** (screen and act within 2 s on the test copy at 1280 px, a web capture within 15 s): Home, Queue, Project, Held, Inbox, Document, Add, the acts of C12, the iana and legistar visitor captures, the 8.8 and 15.9 MB PDFs, `interfacewords` on a second load, key registration; it reports P-numbers for what misses, which the next round carries; it watches `STORE_DID_NOT_ANSWER`.
7. One final pass (K4297 (3)) after the re-walk is clean; then T51's close.

## 10. Counts

- Causes in jobs: **41** (38 open + N2, N3, N4); seed's small items 4 (3 in jobs, 1 BOB's tooling); performance items P1-P6 all placed (shell 4, project-roster 1, screens-daily 2, capture 1, screens-inquiry 1, acquisition 3, host-governor 1, capture-sources 1, control-plane 1).
- Jobs: **28** (+1 conditional): wave 1 **20**, wave 2 **8**. Models: **27 sonnet, 1 haiku, 0 opus**.
- Wording-only to `later-ux.md`: **6 new lines** (+ 13 rows already listed). To UX-DESIGN: **1 handoff, 3 asks** (stored login, subject passage and manual flag status, the batch of word rows).
- Not a defect, not reproducible or not exercised (each with its reason in section 2): the first-try `STORE_DID_NOT_ANSWER`, C87c, S-45's true mark, C4/C71/C89/S-27, C41/C42/C65/C68/C96.
- Could not place: none. Halves not traced to a line (the START says so; each job asks, P9): C25 for PDFs (reading title), C28 (a knock's name and type), C46's plane half, C53 (the read of reminders), C94's cover-handle field, C51's 37 s stage, C40 (who holds the late attempt).
