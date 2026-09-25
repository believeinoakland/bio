# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-633 · queued — **WHEN TIER 2 WINS A PAGE, `mergeTier2Text` REPLACES ITS MARKERS, SO D-627's `image_content_unread` IS LOST AND THE PAGE ROUTES NOWHERE.** Reproduced through op=acquire with an answering tier-2 stub (the held INFO-2026-0301 does not escalate, so D-627's own pages are routed today). Found by D-627's worker (minted on land/worker/D-627). — owner CONTENT-PDF.
order: head of the backlog, before D-635 — a correction to just-landed work (D-627 integrated) outranks new work, and D-635 builds on the same routed pages (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: none expected (a marker kept, not a new one); the integrator classifies if the chain's wire moves.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (tier markers; D-627's image-content rule, folded there by D-627).
depends-on: D-627 (integrated, land/worker/D-627 @ 056d3092, stacked on D-608 @ ffcc300b).
scope: in `textchain.mjs`, carry the base page's `image_content_*` markers onto a page tier 2 wins — they are facts about its images, not about the decode; tier-2's own markers otherwise unchanged.
accepts-when: a page carrying `image_content_unread` that tier 2 wins keeps the marker and still routes to OCR through op=acquire (moves: the marker dropped at the tier-2 merge). NEGATIVE CONTROL: drop the carry and the tier-2-wins arm fails by name, reading no marker.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-627's worker).

### D-635 · queued — **A PAGE ROUTED TO OCR WHOSE FOLIO DECODED LOSES ITS DERIVATION-PART PLACEMENT: BOB #35 RULED 06:25Z APPEND — the page keeps its layer text, the transcription is appended, and the page is listed in BOTH derivation parts, because D-252's guarantee that layer text is never lost outranks the parts' partition.** Minted by D-627's worker (its full finding rides its report). — owner CONTENT-PDF.
order: directly after D-627, which creates the routed-with-folio pages it concerns (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a page may appear in both derivation parts; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-252's guarantee and BOB #35's 06:25Z ruling (this row's worker folds it).
depends-on: D-627.
scope: append the transcription to the page's layer text and list the page in both parts; FIND EVERY READER that assumes the parts partition pages (the "who else reads it" rule, CLAUDE.md §5), list each by name in the landing, and correct or prove each one.
accepts-when: a routed page with a decoded folio keeps its folio and gains its transcription, appears in both parts, and every named partition reader reads it correctly (moves: layer text lost or a page in one part only). NEGATIVE CONTROL: list the page in one part only and the both-parts arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-627's worker; BOB #35 06:25Z).

### D-665 · queued — **A CHART OR TABLE PAINTED AS AN IMAGE UNDER A TEXT TITLE IS NEVER ROUTED TO OCR, AND NO SIGNAL YET SEPARATES IT FROM A PHOTO: BOB #35 RULED 06:25Z that the per-image `image_unread` marker states the truth without a classifier, and that ROUTING waits on one measured signal.** — owner CONTENT-PDF.
order: after D-635, the follow-up BOB #35 named after D-627: routing is a cost question, measured before it is switched on (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 only if a routing rule is set (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #35's 06:25Z ruling and M-178.
depends-on: D-627.
scope: over M-178's 49 classified pages MEASURE one signal (image pixel dimensions against the page's text area, or glyph density outside the painted rects) and set the routing rule where the classes separate; if none separates, routing stays off and the measurement says so. If D-627 did not carry the per-image `image_unread` marker (rect and area share, above D-420's size floor), build it here.
accepts-when: the signal's separation is recorded with date and instrument, and either a routing rule routes the chart-under-title pages or the record states none separates (moves: the class unrouted with no measurement). NEGATIVE CONTROL: invert the rule and the chart arm routes nowhere, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 06:25Z).

### D-615 · queued — **`op=promote` STILL PROJECTS `bundles.created` AND `last_updated` FROM THE ENVELOPE, though the document states both (CORE_FIELDS): D-563's class, the last two fields.** Found by D-563's worker (05:47Z). — owner RECORD.
order: after D-546, the same promote function one worker at a time: the envelope is a label, the document states what it is (SCHEDULER #22, 2026-09-25)
milestone: M7
interface: I3 — the projection's two dates; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510/D-563's derivation.
depends-on: D-546 (same promote function; SCHEDULER #22).
scope: derive created and last_updated from the document as D-563 derives title and state; take a read-only census of live drifts FIRST (as M-172 did) before refusing a contradicting envelope; envelope as fallback only where the bytes state none.
accepts-when: the projection shows the document's dates, and a contradicting envelope is refused by name or recorded per the census (moves: envelope dates over the document's). NEGATIVE CONTROL: project the envelope's dates again and the date arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-563's worker).

### D-628 · queued — **`op=promote` STILL THROWS A RAW NOT NULL STACK WHEN `current_state` (document and envelope), `meta.created` OR `meta.last_updated` IS STATED NOWHERE — for creations and revisions, and for `meta` sent as a string.** Found by D-578's worker (minted on land/worker/D-578). — owner RECORD.
order: after D-615 — the same promote function as D-546, D-578 and D-615: one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — a named DEC-49 refusal on op=promote for a creation missing a required field; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas), with D-578's carry-or-refuse shape (C-86.5).
depends-on: D-615 (same function).
scope: a revision carries the head's value for each field; a creation missing one is refused by a named DEC-49 code BEFORE the first write; a string `meta` is read or refused by name, never thrown.
accepts-when: each of the four fields absent on a creation is refused by name and on a revision is carried, with no stack in any answer (moves: a raw NOT NULL stack from promote). NEGATIVE CONTROL: remove the pre-write check and the creation arms fail by name, reading a stack.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-578's worker).

### D-641 · queued — **107 REFUSAL CODES A MEMBER CAN RECEIVE HAVE NO CANNED TRANSLATION: D-542's R5/R6 walk brought them into reach (reach 488->595) and they are the whole reachGap rise 39->146 — e.g. relationdeclare NO_ENDS / SELF_RELATION, queuemute NO_KINDS, progressiondefine NO_STAGES; the publishedbytes codes overlap D-561.** Listed by check-refusal-codes' `IN REACH ONLY BY OP` line. Found by D-542's worker (minted on land/worker/D-542). — owner RECORD (REC-64's sweep).
order: after D-628 — a member told a bare code instead of words is DEC-49's own defect and product, ahead of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 additive — translations only; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (member-facing refusals carry canned words), with `docs/development/VERIFICATION.md` (the DEC-49 guard) and D-542's R5/R6 arms as built.
depends-on: D-542 (integrated, land/worker/D-542 @ fac514e0; the reach walk that lists them).
scope: for each of the 107, a DEC-49 row with its translation, OR show at the code that it never leaves on the wire and narrow the walk at that op; lower CEILING.reachGap in the same commit to the measured remainder. Batches of about 20 per commit are fine; the row closes when the gap is 39 or below and each exception is stated.
accepts-when: reachGap reads the measured remainder and every in-reach code carries words or a stated not-on-the-wire reason (moves: reachGap 146). NEGATIVE CONTROL: strip one new translation and the guard names that code.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### D-664 · queued — **`civicos-ui/test/refusal-codes.control.mjs` IS STALE ON MAIN: on 5e8a65a8 arms (c), (e) and (r2) fail and (r5) THROWS on a moved anchor (store.mjs ~18517), so no arm after (r5) runs — the negative control for the refusal-code guard is not controlling anything.** Found by D-542's worker (minted on land/worker/D-542). — owner M0.
order: after D-641 — the control of the guard D-641 moves; a check that cannot fail is worse than none, so it precedes the rest of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control), CLAUDE.md §5 (re-run a subject's control after changing it).
depends-on: none (D-542's R5/R6, integrated at fac514e0, adds arms; re-measure on the union if it lands first).
scope: re-anchor (r5) by its region marker, not a line; re-measure (c), (e) and (r2) and correct each with a comment saying why the old anchor was wrong; record the result on the suite's NEGATIVE CONTROL line.
accepts-when: every arm runs and each fails by name when its subject is broken, restored by hash (moves: three arms failing and one throwing on main). NEGATIVE CONTROL: this row is one — its record is the arm table.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### D-667 · queued — **ELEVEN MORE SUITES CAN ABORT A FIXTURE WITHOUT REPORTING WHICH SECTIONS NEVER RAN: four print "FIXTURE ABORTED" (d448-review-copy-translation, d543-instant-precision, rec213-reviewcopy-writer, rec217-draft-binding) and seven reach `process.exit` through a bail/abort/die const (case-edition-conclusion, case-project-conclusion, caselifecycle, caseratify-conclusion, current-shared-question, d442-publish-writes-nothing, rec170-manifest-pair).** D-548 and D-564 fixed eight; this is the sweep's remainder. Found by D-564's worker (minted on land/worker/D-564). — owner M0 (the suites).
order: after D-628, behind the head's product corrections: a process row that cuts false-green risk in the gate, placed near the head but never above product (CLAUDE.md §2, Bob 2026-09-22; SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares), with D-548's block() recorder as built.
depends-on: D-564 (integrated, land/worker/D-564 @ ae807e25; its d564-block.control.mjs SUITES table is extended here).
scope: adopt D-548's block() recorder and needs() in the eleven suites; add each to d564-block.control.mjs's SUITES table; state the matcher's blind spot (an abort under another name, an inline top-level process.exit) on the control's line.
accepts-when: each of the eleven, with one fixture broken, names the sections that never ran and its totals are unchanged when whole (moves: an abort that hides unrun sections). NEGATIVE CONTROL: disarm the recorder in one suite and its broken-fixture arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-564's worker).

### REC-224 · queued — **AN OWNER'S STANDING REQUEST TO LEAVE CAN BECOME ONE THAT CAN NEVER BE HONOURED: if two owners both hold `leaving`, the first honoured strands the other; and `projectOwnerRemove` (§7.10) can remove the last committed owner while the rest hold `leaving`.** REC-186's two gaps (its worker, 02:28Z). BOB #34 RULED 2026-09-25 02:35Z (drained to `BOB-INBOX-drained.md`; cite until folded): the floor counts COMMITTED owners (owners holding no `leaving`); an owner's leave is REFUSED LAST_COMMITTED_OWNER when no OTHER committed owner exists; `projectOwnerRemove` is REFUSED when it would leave only leaving owners, naming them; one helper on Store.ownerMath's floor. — owner RECORD.
order: right after REC-186, in product order: a request that can never be honoured is an overclaim (BOB #31's reason, BOB #34 02:35Z) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 — two named refusals; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.6 and §7.10, with BOB #34's 02:35Z ruling, folded by this row with REC-186's fold.
depends-on: REC-186.
scope: as ruled; both refusals carry DEC-49 rows; one committed-owner helper serves projectLeave and projectOwnerRemove.
accepts-when: of two owners, the second to ask is refused while the first's request stands; removing the last committed owner while the others are leaving is refused by name (moves: an unhonourable request). NEGATIVE CONTROL: count owner flags instead of committed owners and both arms fail by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs REC`).

### D-586 · queued — **AN `ai` CREDENTIAL'S SCOPE ACCEPTS OPS NO CREDENTIAL CAN EVER PERFORM: `aiReachesAsMember` admits any op whose classes include `member` with no machineClasses, which covers GOVERNANCE_ACTIONS (adminendorse, adminremove, membercaps) and IDENTITY_ACTIONS (groupnameset, groupdomainset), whose `!viaSession` fences refuse every credential; so `op=aicredentialmint` records a permission that can never be honoured (MEASURED for adminendorse: mint ok:true, the act refused OPERATOR_TOKEN_CANNOT_GOVERN).** Found by REC-162's worker (02:37Z). — owner RECORD.
order: after REC-224, with the authority corrections: a recorded permission that can never be honoured is an overclaim on an authority surface (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 — the mint refuses those five ops; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (administrators do not run the instance) and §4.10, with the AI-credential scope's AI_SCOPE_BEYOND_MEMBER_REACH (C-29.9).
depends-on: REC-162.
scope: `aiReachesAsMember` returns false for ops fenced to sessions, expressed as one property of the op rather than two lists; the mint refuses them AI_SCOPE_BEYOND_MEMBER_REACH.
accepts-when: a machine-attest arm minting each of the five is refused by name, and a member op still mints (moves: a mint that records the impossible). NEGATIVE CONTROL: drop the session-fence test and the five arms mint, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-162's worker).

### D-613 · queued — **`op=publishedbytes` WITH format=zip ANSWERS `DUPLICATE_PATH` AT HTTP 413: every `serialiseContainer` refusal is sent as 413, so a stranger is told a request is too large when it names a path twice.** Found by D-561's worker (04:43Z). — owner RECORD.
order: after D-586 (D-605 moved to the cache), with the public-door corrections: a status that states the wrong reason misleads a stranger on the public door (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — an HTTP status on one public refusal; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §4 (the public reads; §7 is attribution, per D-561's worker).
depends-on: D-561 (land/worker/D-561 @ 1ab197c5; it renames container TOO_LARGE to CONTAINER_TOO_LARGE).
scope: status by code in the serialiseContainer refusal path: 409 for DUPLICATE_PATH, 413 only for CONTAINER_TOO_LARGE; grep the path for any other code it returns and give each its own status.
accepts-when: a zip request naming a path twice answers 409 DUPLICATE_PATH, and an over-large one 413 (moves: a duplicate path reported as too large). NEGATIVE CONTROL: send 413 for every refusal again and the duplicate arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-561's worker).

### D-618 · queued — **A DRAFT THAT NAMES A CASE AND ALSO SETS `newCase` STILL ANSWERS THAT CASE'S NEXT EDITION beside a sentence saying its case is UNDETERMINED (publication refuses the pair CASE_IDENTITY_AMBIGUOUS), so the answer states an edition for a case the record has not chosen.** Found by D-568's worker (05:36Z). — owner RECORD.
order: after D-613, with the review-copy corrections: D-568's class, one branch over (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — `edition` reads null for that pair; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling and D-568's `#statedEdition`.
depends-on: D-568 (land/worker/D-568 @ d5da99bb).
scope: #statedEdition answers null when caseId and newCase are both set, in the same five answers D-568 covers.
accepts-when: a case-naming newCase draft answers edition null in all five (moves: an edition beside an undetermined case). NEGATIVE CONTROL: answer the named case's next edition again and the ambiguous-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### UI-117 · queued — **A DRAFT HOLDING BOTH `caseId` AND `newCase` IS NOT SURFACED ON THE REVIEW-COPY FORM: BOB #35 RULED 2026-09-25 06:45Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded) — SURFACE it, never refuse to load, never drop `newCase` silently.** The form loads such a draft and shows BOTH values exactly as stored, with one plain line: this draft names an existing case AND a new one, and cannot be published until an owner keeps one (the plane refuses the pair, CASE_IDENTITY_AMBIGUOUS). Keeping one is the owner's own act — a save that clears the other field — offered with neither preselected (DEC-69). Found as UI-106's form gap. — owner UI.
order: after D-618 — the same both-identity pair, its plane half first (BOB #35's placement, 06:45Z; SCHEDULER #23, 2026-09-25)
milestone: M10
interface: none expected (UI only; reads what the draft already carries).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #35's 06:45Z ruling, folded into §6A.4 by this row.
depends-on: UI-106 (integrated, land/worker/UI-106; rides batch30).
scope: the review-copy form round-trips a both-valued draft unchanged, renders both values and the one line, and offers "keep the existing case" / "keep the new case" as saves that clear the other field; nothing prefilled.
accepts-when: a both-valued draft loads, shows both, and a save without an owner's choice keeps both (moves: the form drops `newCase` silently). NEGATIVE CONTROL: restore the silent drop, and the arm that round-trips a both-valued draft fails by name, reading `newCase` gone.
added: 2026-09-25 · SCHEDULER #23 (BOB #35's inbox entry of 06:45Z).

### REC-226 · queued — **AN OWNER'S `projectinvite` OF A MEMBER WHOSE REQUEST TO JOIN IS OPEN LEAVES THE REQUEST OPEN, so the record holds a stale request the owner has in fact answered.** BOB #35 RULED 04:30Z on REC-150's gap (a), CHANGING the provisional: the invite CLOSES the request as `granted`, by the inviting owner, at that act. — owner RECORD.
order: after D-586, with the membership corrections: a request the owner answered still reading open is the record claiming less than happened (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I3 — the request's state after an invite; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.14, with BOB #35's 04:30Z ruling (this row's worker folds it).
depends-on: REC-150 (land/worker/REC-150 @ 1d02811f).
scope: one UPDATE through `Store#closeJoinRequests` in projectInvite, one suite arm. FOLD both rulings into §7.14: (a) as above; (b) KEEP: an administrator and the founder cannot ask to join (their sight is custodial), and C-95.2's refusal says so and names the invite path; remove the front matter's UNDECIDED (a) entry REC-150 added.
accepts-when: after an owner invites a member with an open request, the request reads granted by that owner (moves: a stale open request). NEGATIVE CONTROL: drop the UPDATE and the request reads open after the invite, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs REC`; BOB #35 04:30Z).

### D-570 · queued — **`networkidle` NEVER FIRES ON THE FOUNDING CLIENT-RENDERED SOURCE: on oaklandca.opengov.com it fired in 0 of 16 runs (60 s cap; load at 3.6-9.0 s), so every render of it ends on its timeout reading "may be incomplete" and burns its whole reservation.** Found by D-520's worker (M-151). BOB #34 RULED (c) 2026-09-25 02:00Z (drained to `BOB-INBOX-drained.md`; cite until folded): load, then a 500 ms quiet window with no request YOUNGER than N seconds in flight, N MEASURED; `render.wait` records which rule fired (`networkidle` / `quiet_excluding_long_lived` / `timeout`), N, and the ignored requests' count and URLs; a quiet-window settle reads "settled; N long-lived request(s) still open were not waited for", never "complete". — owner CAPTURE.
order: after D-585, with the capture corrections: a render stated incomplete that the record could settle says less than it knows (BOB #34 02:00Z) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3/I5 — `render.wait`'s rule, N and ignored requests; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md`, beside BOB #32's render rulings, with BOB #34's 02:00Z ruling, folded by this row.
depends-on: D-520.
scope: measure request lifetimes on the client-rendered corpus sources (extend M-151) and set N from them; implement the quiet window in the driver; record and state as ruled.
accepts-when: an opengov fixture settles by the quiet window with its open long-poll named; a page that never quiets still times out reading incomplete (moves: 16 of 16 timeouts). NEGATIVE CONTROL: drop the age exclusion and the opengov arm times out by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-520's worker).

### D-593 · queued — **A `text/csv` BODY'S READING TEXT AT ACQUIRE IS THE INTAKE LOSSY-UTF-8 DECODE, NEVER csv.mjs's `text()`: an undetermined-encoding byte reaches the content-type reader as U+FFFD, the sheet's cells are not the reader's units, and a csv over 8 MiB (multipart) is not read at all; only `application/csv` reached the format entry.** Found by REC-218's worker (02:51Z). — owner FRAMEWORK, RECORD.
order: after D-585, with the reader corrections: a reading of bytes the record cannot decode stated as text claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I1 — the reading text of a csv capture changes source; the integrator classifies.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (the entry IS the csv reader), with REC-218's `reading.dialect`.
depends-on: REC-218.
scope: in op=acquire, when the detected format's registry entry has a `text()` slot, route the single-part body to the format wire instead of the intake decode, naming no format in index.mjs (the D-70 pin holds); the multipart case stays a stated undetermined.
accepts-when: a `text/csv` capture's reading units are the sheet's cells with the dialect recorded, and a latin-1 byte never becomes U+FFFD in them (moves: the intake decode for csv). NEGATIVE CONTROL: route text/csv back to the intake decode and the cell-units arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-218's worker).

### D-591 · queued — **Tier 1 inflate (pdfstructure.mjs, DecompressionStream "deflate") refuses a Flate stream with bytes after the zlib end ("Trailing junk"), and the page then reads 0 chars with NO page marker: CAFR-2002 has 163 of 199 pages read empty that are in fact undecoded.** Found by D-585's worker (M-160). — owner CONTENT-PDF.
order: after D-593, with the reader corrections: an undecoded page that reads as empty claims more than the record holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I1 — the per-page reading of a Flate PDF with trailing bytes changes; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: D-585.
scope: (1) Tier 1 inflate tolerates bytes after the compressed stream's end (keep the decoded output, record the trailing count); (2) a page whose content stream Tier 1 could not decode carries a page marker so it cannot read as empty.
accepts-when: CAFR-2002's pages read with text where their streams decode, and no page reads 0 chars without a marker (measured into a measurements/ file). NEGATIVE CONTROL: restore the strict inflate and the trailing-bytes arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-585's worker).

### D-614 · queued — **`tier3Note`'s THIRD CLAUSE SAYS REFUSED PAGES "were dropped rather than allowed to overwrite text this document already had", BUT `mergeTier3Text` REFUSES FOR THREE REASONS (no such page; not asked about; carries glyphs) AND ONLY THE THIRD HAD TEXT, so the record can state text a page never had.** Found by D-607's worker (05:23Z). Not reachable with today's member, which answers only pages it is asked for: defence in depth. — owner CONTENT-PDF.
order: after D-591, with the reader corrections but behind the reachable ones: the same note class as D-607, unreachable today (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: none (a note's wording).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: D-607 (land/worker/D-607 @ 3206221a, the same function).
scope: mergeTier3Text returns refused split by reason (refusedHadText apart); tier3Note says "overwrite text" only for that count, and neutral wording ("were not pages it was asked about, and were dropped") for the rest; test through op=acquire with a stub OCR member that answers for an unasked empty page.
accepts-when: a stub answer for an unasked empty page yields the neutral clause, and one for a page with glyphs the overwrite clause (moves: a stated overwrite of text that never existed). NEGATIVE CONTROL: collapse the reasons again and the unasked-page arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-607's worker).

### D-321 · blocked — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
status: blocked — SCHEDULER #22 06:10Z: NARROWED, NOT MET: no real scanned agenda page is held (git: M-170; instance biosmoke7 store=bio: 24 image-only pages, none agenda-shaped, M-170 part 2). Unblocks when a Legistar-shaped scanned agenda is held, or non-Legistar agenda breadth lands in the readers. land/worker/D-321b @ 5ebea344 (385/385 GREEN, carries D-321 3d7ad5a4) rides the train as a partial; minted D-622
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-622 · queued — **NO TIER READS A JBIG2 OR JPX IMAGE-ONLY PAGE: `pdf-worker/src/pagepixels.mjs` `decodeImage` has no JBIG2Decode or JPXDecode decoder, so tier 3 refuses them UNSUPPORTED_FILTER while tiers 1-2 read 0 glyphs (M-166). The instance now holds 10 JBIG2 pages of enacted City legislation (Ordinance 13035 C.M.S.; a fund-amendment resolution) and 4 single-image JPX pages; CPDF-12 measured 0 of either in 2026-08.** Found by D-321 part 2's worker (06:00Z). — owner CONTENT-PDF.
order: after D-614, with the reader corrections: enacted legislation held and unread by every tier (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — the member's pixel route widens; the integrator classifies.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6, with CPDF-12's refusal as the landing pad and D-320's DCT decoder as the pattern.
depends-on: D-320 (land/worker/D-320 @ 46b43c35, the decoder seam).
scope: a JBIG2 generic-region decoder (MMR and arithmetic, with JBIG2Globals) and a JPX decoder in decodeImage, each checked pixel-exact against an independent decoder (jbig2dec or PyMuPDF; openjpeg) as D-320 was against Pillow; what they cannot decode is refused by name; measure CPU and memory in-isolate.
accepts-when: Ordinance 13035's JBIG2 page and one JPX page transcribe at tier 3 with pixel digests matching the reference decoder (moves: 14 held pages unread by every tier). NEGATIVE CONTROL: a no-op decoder fails the digest arms by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-321 part 2's worker).

### D-669 · queued — **M-167's POPULATION CANNOT BE RE-ADDRESSED: it committed only truncated file ids and the measuring pen is gone, so D-612's widening (fonts discounted) could not be re-measured and its moved count stands UNDETERMINED (predicted from M-167's refs column: 4 of 8 Docs move to determined).** Found by D-612's worker (06:31Z). — owner CAPTURE.
order: after D-622, with the measurement rows: a figure the record cannot re-take is weaker evidence, but no gate result is false (SCHEDULER #22, 2026-09-25)
milestone: M0 (a measurement)
interface: none (a measurement).
design: `docs/development/VERIFICATION.md` (measure; do not recall; a measurement names its population so it can be re-taken).
depends-on: D-612 (land/worker/D-612 @ f2dcbc6c).
scope: take a fresh public-government Google Docs and Slides population with FULL target ids committed in the measurement log, re-run tools/measure-odf-stability.mjs through the plane with store=scratch (witness counters before and after), and record the moved .odt count under D-612; never CAP-11's captures.
accepts-when: the .odt determined count after D-612 is measured on a re-addressable population, date and instrument stated (moves: an undetermined moved count). NEGATIVE CONTROL: count fonts again and the moved count falls back, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; D-612's worker's finding).

### D-572 · queued — **A MULTI-QUESTION PROJECT RUN HAS NO TARGET FOR A LEVEL-EMPTY CANDIDATE: after D-451 a project citing SEVERAL questions still seeds none, so its table-made candidates are refused SUGGEST_NO_TARGET.** Found by D-451's worker. BOB #34 RULED (c) 2026-09-25 02:05Z (drained to `BOB-INBOX-drained.md`; cite until folded): a level observation NAMES the question(s) its search was for; one candidate per NAMED question, never per cited question; an observation naming none keeps today's provisional (UNDETERMINED with the count, refused, logged) and the instrument states "N empty levels not attributed to a question". — owner RECORD, agent-worker.
order: after D-570, in product order: a candidate claiming a search the log does not show overclaims (BOB #34 02:05Z) (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: I3 additive — the skill pack's observation shape gains `question`; the integrator classifies.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5 and §15, with BOB #34's 02:05Z ruling, folded by this row.
depends-on: D-451.
scope: the level observation carries `question` (one or several); the table targets each named question; an unnamed one stays provisional and is counted as unattributed by §15's instrument.
accepts-when: a run whose level observation names Q2 files exactly one level-empty candidate on Q2; one naming nothing is refused and counted unattributed (moves: SUGGEST_NO_TARGET on every multi-question run). NEGATIVE CONTROL: target every cited question and the named-only arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-451's worker).

### D-582 · queued — **A RENDER RESULT CODE IS TREATED AS "fetched nothing": C-83.6 RENDER_NOT_A_PAGE and C-83.7 RENDER_FAILED are decided AFTER the shell was fetched (index.mjs `is-render-result`), yet the drain gives the host slot back and holds the row, so a PDF asked for as a render is re-fetched every tick until expiry.** Found by D-523's worker (02:02Z). — owner CAPTURE.
order: after D-572, with the capture corrections: a fetch repeated every tick spends a source's courtesy for nothing (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: none unless a request's state changes on the wire (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: split admit codes from result codes in the drain; a result code spends the slot; RENDER_NOT_A_PAGE is terminal (refused).
accepts-when: a PDF asked as a render is fetched once and refused RENDER_NOT_A_PAGE (moves: a re-fetch every tick). NEGATIVE CONTROL: treat result codes as admit codes again and the once-only arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-583 · queued — **A RUN WAITING ON A RENDER THAT EXPIRES IS NOT WOKEN: FL-4's `#aiRunWakeRuns` reads `captured` and `refused` only, so D-523's `expired` reaches the run's log and never wakes it.** Found by D-523's worker (02:02Z). — owner RECORD (FL-4's wake).
order: after D-582, with the capture corrections: a run left waiting on an ask that has ended (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: none unless the wake detail's vocabulary is published (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: count `expired` as a completion under its own name in the wake detail, driven in scheduler.test.mjs.
accepts-when: a run waiting on a render request that expires is woken with "expired" named (moves: a run never woken). NEGATIVE CONTROL: drop `expired` from the wake set and the expiry arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-584 · queued — **CAPTURE_FETCH_FAILED IS WRITTEN TO `capture_requests.code` AND CATALOGUED IN NO DEC-49 FAMILY, so D-523's render-deferred condition and op=capturerequests can show a member a code with no canned translation.** Found by D-523's worker (02:02Z). — owner CAPTURE.
order: after D-583, with the capture corrections: a code reaching a member untranslated is DEC-49's failure (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3 additive — code, check and translation; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: catalogue CAPTURE_FETCH_FAILED as a C-28 row at one governed site, or keep it off the code column and say why.
accepts-when: a failed fetch's row carries a catalogued code with its translation (moves: an uncatalogued code on the column). NEGATIVE CONTROL: strip the row and the translation arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-581 · queued — **A PLAIN CAPTURE REQUEST PAST ITS `expires` IS STILL DRAINED AND FETCHED: the drain reads `expires` only for render rows (D-523); and `#conditionsRenderDeferred` and `#conditionsCaptureRequested` walk `capture_requests` unbounded while terminal rows stay forever.** Found by D-523's worker (02:02Z; the unbounded walks admitted in derivation-bounds' census note, folded here). — owner CAPTURE, RECORD.
order: after D-584, with the capture corrections: an ask that has lapsed is still acted on (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3 — a plain request's terminal `expired` state and op=queue's cut; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: release an expired plain row as D-523 released a render row (state `expired`, its code kept, LOOKED_INDETERMINATE in the run log); bound both condition producers and publish the cut on op=queue. If what a lapsed PLAIN ask records needs a ruling, send it to BOB and build the render rule meanwhile.
accepts-when: a plain request past `expires` is not fetched and reads expired; the producers state their bound (moves: a lapsed ask fetched; unbounded walks). NEGATIVE CONTROL: skip the expiry test for plain rows and the lapsed-ask arm fetches, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-603 · queued — **EVERY SUBRESOURCE RECORD IN A CAPTURE MANIFEST CARRIES `fetched_at` FROM THE LOOP STEM, INCLUDING RECORDS NEVER FETCHED: a reused part (`fetched_this_capture: false`, whose real fetch instant is `reused_from_fetched_at`) and every policy-skipped, DEFERRED, CAP_REACHED, BUDGET_EXHAUSTED or refused reference, so the record claims a fetch at an instant nothing was fetched.** Found by D-191's worker (03:56Z). — owner CAPTURE.
order: after D-581, with the capture corrections ahead of features: a manifest stating a fetch that never happened is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I5 — a manifest field narrowed; the integrator classifies (consumers checked by the finder: civicos-ui reads only reused_from_fetched_at; partFetchSpread reads fetched_at only for fetched parts).
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same", with D-191's per-clock spread.
depends-on: D-191 (land/worker/D-191 @ 9351b715; the spread that reads fetched_at).
scope: keep `fetched_at` only on records whose request was ISSUED; stamp the others under a name that claims no fetch (`considered_at`) or drop it. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a reused part and a policy-skipped reference carry no fetched_at (moves: every unfetched record claiming a fetch). NEGATIVE CONTROL: restore the stem's fetched_at and that arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-191's worker).

### UI-113 · queued — **NO SURFACE RENDERS A PUBLISHED CASE'S FROZEN `bias_manifest` BLOCK AT ALL (0 hits in civicos-ui), so REC-219's pending-adoption statement reaches no page.** Found by REC-219's worker (02:38Z). — owner UI.
order: after UI-110, with the surface halves of landed record rows (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: none (reads REC-219's /4 block).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 18, with Declared Bias "Bias bundles and adoption".
depends-on: REC-219; D-597 (the citations half, built on REC-219's branch at b9528b03).
scope: the published case page renders the frozen bias_manifest as the document states it, verbatim (DEC-8): the stated sentence, and pins_proposed_stated with each pending revision; /3, /2 and /1 documents render what they carry, never a default. ALSO (REC-219's report 03:40Z: no surface renders case_citations either): render the signed case_citations[] with each edge's state (pinned, only_capture, undetermined, no_capture, no_bytes) from op=casedocument's `citations`, and a /3 case's "version undetermined (signed before capture pins)".
accepts-when: a /4 case with a pending adoption shows it; a /3 case shows its own statement and nothing invented (moves: no surface); a /4 citation shows its pin state.  NEGATIVE CONTROL: drop the block and the pending arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### UI-115 · queued — **UI-69's EXPORTED REVIEW COPY OMITS D-573's TIE STATEMENT: the export prints "Date … the copy's last change" from the in-band quartet and carries no `last_change`, so a file that leaves the instance claims an order of two same-second acts the record cannot support.** Found by D-573's worker (05:23Z). — owner UI.
order: after UI-113, with the surface halves of landed record rows: a file read away from the instance holds only the page (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: none (reads D-573's I3 key).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 1 (D-573's fold) and point 2 (UI-69's export).
depends-on: UI-69, D-573.
scope: beside the export's Date line, draw last_change.stated's tie sentence verbatim when last_change.undetermined_within is non-empty; the in-band quartet unchanged; the same on the member door's copy view if it shows the date.
accepts-when: an exported copy whose pick ties a whole-second act carries the plane's tie sentence beside its date, and an untied one carries none (moves: a tied date exported as ordered). NEGATIVE CONTROL: drop the sentence and the tied-export arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; D-573's finding).

### UI-116 · queued — **NO SURFACE SHOWS A MACHINE'S RISK-TIER PROPOSAL BESIDE THE MEMBER'S TIER: REC-215 built the plane half (op=projection's action block carries risk_tier_proposals, labelled), and the action page shows only the member's tier and history (UI-104).** The surface half of REC-215. — owner UI.
order: after UI-115, with the surface halves of landed record rows (BOB #33's risk-tier ruling: plane, then UI) (SCHEDULER #22, 2026-09-25)
milestone: M7
interface: none (I3 consumer of REC-215's projection block).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with UI-102's shape for the governing-laws proposal (shown beside, no adopt control).
depends-on: REC-215, UI-104.
scope: on the action page beside UI-104's tier block, render each proposal as the plane labels it (machine work, its basis, its proposer), with NO adopt control; the member's own revise act stays the only way to set a tier; the plane's truncation stated.
accepts-when: against the real plane a proposal renders labelled beside the tier, and no control on the page sets the tier from it (moves: no surface for the proposal). NEGATIVE CONTROL: add an adopt control and the no-adopt arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; REC-215's worker's note).

### D-624 · queued — **THE SINGLE-ITEM DEFER/DISMISS DIALOG (`doProposalDispose` via `openProposalAct`) STILL SENDS `{key, to, reason}` FOR A PROJECT-SCOPED FINDING AND IS REFUSED NO_PROJECT_SCOPE: D-266's DELEGATION RECORD -> UI (2026-08-10), open since 2026-09-16 with no plan row.** Found by UI-110's worker (06:19Z). — owner UI.
order: after UI-115, with the surface halves of landed rows: the one-item act fails for every project-scoped finding (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none (consumes REC-205's per-item project).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with D-266's NO_PROJECT_SCOPE.
depends-on: UI-110 (land/worker/UI-110 @ ba126d29; queueHomeFor and the picker); D-623 (the refusal's words).
scope: the dialog reads disposition.scope/projects, sends {project, finding}, reuses queueHomeFor and the ask-never-default picker; discharge D-266's DELEGATION block.
accepts-when: against the real plane a single project-scoped finding is deferred or dismissed through the dialog; a two-home finding is not sent until the member names one (moves: NO_PROJECT_SCOPE on every project-scoped dialog act). NEGATIVE CONTROL: send {key,to,reason} again and the dialog arm reads NO_PROJECT_SCOPE, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-110's worker).

### D-609 · queued — **A MEMBER CAN PLACE A DOCUMENT OR PASSAGE IN A THEME ONLY FROM THE THEME'S PAGE, BY TYPING ITS BUNDLE ID OR CONTENT ID: the document page and the passage row offer no "place in a theme" entry.** Found by UI-76's worker (04:05Z). — owner UI.
order: after UI-113, with the surface halves of landed rows: the act exists and is reachable only by an id a member must copy by hand (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none (I3 consumer of op=themeread and op=themeplace).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1-3, as UI-76 built the Themes screen.
depends-on: UI-76 (land/worker/UI-76 @ 37035a59).
scope: on openBundle's page and on the passage row, a "Place in a theme" control that lists themes through op=themeread (its limit named, the bound stated by thmBoundHtml) and sends op=themeplace with that bundle id or content id; nothing preselected; the plane's canned refusal on failure.
accepts-when: against the real plane a member places a document and a passage from their own pages without typing an id (moves: placement by typed id only). NEGATIVE CONTROL: preselect a theme and the nothing-prefilled arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-76's worker).

### REC-225 · queued — **NOTHING SETTLES A DOCUMENT'S ORIGIN SYSTEM WHEN ITS HOST SERVES MANY OFFICES: a multi-office host names no system, so M-157's 24 CIP matches read SYSTEM_UNDETERMINED through idmatch, and no member act can declare where a document came from.** BOB #35 RULED 2026-09-25 04:20Z on REC-203's gap (2): *"A HOST IS NOT AN ORIGIN"*. — owner RECORD.
order: after D-609, with the features over landed record rows: REC-203's matcher cannot count the pairs it was built for until an origin can be declared (SCHEDULER #22, 2026-09-25)
milestone: M4
interface: I3 — a new member act; the builder names the op and registers it in PLANNED_OPS; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 as BOB #35 folded it 04:20Z (land/bob/batch-0925c @ fc85cb3c).
depends-on: REC-203 (on main).
scope: a MEMBER'S ATTRIBUTED act declaring a document's origin system: per document, dated, append-only, latest wins; idmatch reads a declared origin before the host; a machine credential declaring is refused by name.
accepts-when: the CIP to Legistar pairs of M-157 count through idmatch once each side's origin is declared, and a machine credential declaring is refused by name (moves: 24 pairs SYSTEM_UNDETERMINED). NEGATIVE CONTROL: idmatch ignores the declaration and the declared-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs REC`; BOB #35 04:20Z).

### UI-114 · queued — **NO SURFACE LETS A MEMBER DECLARE A DOCUMENT'S ORIGIN SYSTEM, OR SHOWS WHO DECLARED IT AND WHEN.** The surface half of REC-225 (BOB #35 04:20Z). — owner UI.
order: directly after REC-225, which it consumes (SCHEDULER #22, 2026-09-25)
milestone: M4
interface: I3 consumer (REC-225's op).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 as BOB #35 folded it 04:20Z, with REC-225's act.
depends-on: REC-225.
scope: on the document page, a declare-origin control (nothing preselected; the plane's canned refusal on failure) and the declaration history: who, when, which system, latest marked as standing; an undeclared multi-office host reads "origin undetermined", never the host's name as a system.
accepts-when: against the real plane a member declares an origin and sees it attributed and dated; an undeclared document reads undetermined (moves: no surface). NEGATIVE CONTROL: render the host as the system and the undetermined arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; BOB #35 04:20Z).

### D-604 · queued — **THE CONTRADICTION JUDGEMENT HAS NO GATE THAT DISCRIMINATES: M0-71's 26-pair synthetic corpus is scored perfectly by both model families (M-162: 0/17 false conflicts, recall 9/9), so it cannot rank judgements or speak to real documents.** Found by REC-147's worker; BOB #35 RULED 04:50Z: M0-71's corpus is now a FLOOR, not a gate; THRESHOLD 0 stays PROVISIONAL. — owner the contradiction area (RECORD).
order: after UI-114, with the M9 contradiction rows: it is the gate before any PRESENT surface puts a machine candidate in front of a member; BOB #35: *"make PRESENT's first row depend on it"* (no PRESENT row exists yet: it is not designed) (SCHEDULER #22, 2026-09-25)
milestone: M9
interface: none (a corpus, its labels and a measurement).
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §8 and §9, with BOB #35's 04:50Z ruling (this row's worker folds it).
depends-on: REC-147 (on main).
scope: a labelled corpus from REAL captured documents (minutes, staff reports, budget books), several times M0-71's size, with REC-147's hard negatives (a figure legitimately changed between dates; a summary dropping a qualifier; a rule and a compliant act reading opposite; across pages). Two independent labellers, each blind to the other and to the judgement's output, neither the prompt's author; a disagreed pair is EXCLUDED and reported undetermined; every label records who made it and whether a machine did. FOLD into §8: the ruling, plus REC-147's two gaps KEPT as built (version identity = frozen name + claim sha256; run context = the §6 viewer gate only), clearing their Incomplete entries.
accepts-when: the corpus size, its hard-negative count and the labellers' agreement are measured into a measurement, and the judgement's score over it is reported against the lexical baseline. NEGATIVE CONTROL: score the judgement with the disagreed pairs included and the reported figure moves, by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by REC-147's worker; BOB #35 04:50Z).

### D-592 · queued — **A REOPENED FINDING CANNOT SAY WHO REOPENED IT: `op=queue`'s `prior_disposition` names who DECIDED, and nothing publishes who REVISED the declared flow, so UI-109's item states that name is not on it.** Found by UI-109's worker (02:57Z). — owner RECORD, then UI.
order: after D-576, with the surface corrections: the reopened question's own account is incomplete where the record holds the fact (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — the revising version's number, declared_by and at beside prior_disposition; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions".
depends-on: UI-109.
scope: proposalsFeed publishes, from progression_def_versions, the revising version's number, `declared_by` and `at` beside `prior_disposition`; UI-109's item renders them in the plane's words.
accepts-when: a reopened item names who revised the flow and when (moves: "not on it"). NEGATIVE CONTROL: drop the revising fields and the reopener arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-109's worker).

### UI-107 · queued — **THE MUTE REPORT CANNOT OFFER A PER-CASE UNDO FOR A MUTED KIND THAT HOLDS NOTHING BACK TODAY: UI-97 draws no control there and states the named limit (member-respect SETS).** The surface half of D-534. — owner UI.
status: queued — D-534 (02:33Z): read mute.case_kinds (beside mute.cases, unchanged) and drop the per-case narrowing; correct the UI quotes of 'the muted KINDS nowhere' (member-respect.test, notifications.test/control, queue-unmute.test, CIVICOS_UI_STATE.md, construct-status 12.unmute's note)
order: directly after D-534, which it consumes (SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 consumer (D-534's IC).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-534.
scope: `queueMuteReportHtml`'s per-case undo names every kind the member muted from D-534's published kinds, not only `suppressed[]`'s; retire the named limit in member-respect's SETS row.
accepts-when: against a real plane a member undoes a case mute whose kind holds nothing back today (the measured failure it moves: no control drawn). NEGATIVE CONTROL: read `suppressed[]` alone again and the quiet-kind arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### D-580 · queued — **`#captureForContent`'s "earliest" ORDERS TWO DIFFERENT CLOCKS IN ONE COLUMN: `register.registered` (the server's instant) and `readings.at` (a reading's OWN date from provenance bytes), so a capture held LATER of an older-dated document sorts first and the record presents the wrong version as the one it held first.** Found by REC-220's worker (measured in rec220-version-pin; a re-registration does not move it). — owner RECORD.
order: before REC-222, with the version-pinning corrections: the version a reference resolves to must be the one the record first held (Bob's 2026-09-25 00:40Z doctrine, rule 1) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none unless a resolved capture changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with Bob's 00:40Z doctrine as REC-220 built it.
depends-on: REC-220.
scope: order by when the record first held the bytes (a server stamp for the readings arm, or `captured_locators.first_retrieved`), never by a date read from the document.
accepts-when: an older-dated document captured later sorts after the earlier-held capture (moves: the wrong earliest). NEGATIVE CONTROL: order by `readings.at` again and the held-order arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-220's worker).

### D-579 · queued — **AN ACTION'S BASIS LEG NAMES ONLY A BUNDLE: `action_basis[]` records no capture, so a later capture changes what the leg resolves to.** Found by REC-220's worker (item (b) of D-579; (a), the case edge, rides REC-219's `/4`; (c) is D-595). BOB #34 RULED 2026-09-25 02:30Z under Bob's 00:40Z version doctrine (drained to `BOB-INBOX-drained.md`; cite until folded): an action's basis leg gains an `extent_capture` slot in its frontmatter grammar, I5 ADDITIVE; legs without it read "version undetermined". — owner RECORD.
order: before REC-222, in the version-pinning chain: the notice needs pins to compare against (BOB #34 02:30Z) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I5 additive — `extent_capture` on an action basis leg; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1, with Bob's 00:40Z doctrine and BOB #34's 02:30Z ruling.
depends-on: REC-220.
scope: stamp the capture the record presents at the act on each action basis leg, as REC-220's op=cite does; a leg without it reads "version undetermined", never back-filled.
accepts-when: a new action basis leg carries its capture, and a later capture on the bundle does not change what it resolves to (moves: bundle-only legs). NEGATIVE CONTROL: drop the stamp and the pin arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-220's worker).

### D-595 · queued — **A RUN'S SUGGESTED VERSION LEGS NAME ONLY A BUNDLE: `op=suggest`'s `suggestVersion` composes legs without `extent_capture`, so a suggestion does not say which capture the run read.** Item (c) of D-579 (REC-220's worker). BOB #34 RULED 2026-09-25 02:30Z under Bob's 00:40Z version doctrine (drained to `BOB-INBOX-drained.md`; cite until folded): suggested version legs carry `extent_capture` through C-25.11's composition. — owner RECORD, agent-worker.
order: after D-579, before REC-222, in the version-pinning chain (BOB #34 02:30Z) (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: I3 additive — `extent_capture` on a suggested leg; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 with C-25.11 (basis versions are frozen, composed without carry-forward), and BOB #34's 02:30Z ruling.
depends-on: REC-220.
scope: C-25.11's composition carries the capture the run read onto each suggested leg; a leg composed without one reads "version undetermined".
accepts-when: a run's suggestion names the capture it read, and an accepted suggestion keeps it (moves: bundle-only suggested legs). NEGATIVE CONTROL: drop `extent_capture` from the composition and the suggested-pin arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### D-597 · queued — **A CASE'S CITATION EDGE IS NOT PINNED INSIDE THE SIGNED DOCUMENT: `references[] rel: cites` names a bundle only.** D-579(a). BOB #34 RULED 2026-09-25 02:30Z (drained to `BOB-INBOX-drained.md`; cite until folded): pinned INSIDE the signed case document, riding REC-219's `bio-case-document/4` (ONE bump); a /3 document is never re-signed and its edges read "version undetermined (signed before capture pins)". REC-219 landed /4 without it (its report of 02:38Z). — owner RECORD.
status: queued — HELD, DO NOT SPAWN: SCHEDULER #22 03:42Z: BUILT by REC-219's worker on land/worker/REC-219 @ b9528b03 (c2524ad8 + b9528b03 over REC-219's bf7e69ac), GATE 78/78 GREEN FULLREUSE on tree b191859d; C-41.15, signed case_citations[] in /4, CATALOG 1.30.0 (468 checks), derivation-bounds census 117->118; five-arm negative control. Take the branch at b9528b03 to land both.
order: directly after REC-219, and trained WITH it if the batch allows: /4 must not be released twice (BOB #34 02:30Z) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — each cites edge in /4 carries `extent_capture`; the integrator classifies (with REC-219's /4 IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 18 (REC-219's fold) and §18.1 of the Framework, with BOB #34's 02:30Z ruling.
depends-on: REC-219, REC-220.
scope: op=cite's case arm stamps the capture the record presents at the act (REC-220's stamp); op=publish writes it into each cites edge of a /4 document; C-41.14's family refuses a /4 cites edge without it where the record held one; /3 edges read as ruled.
accepts-when: a /4 case's cites edge carries its capture and ratifies; one without it where the record held one is refused by name; a /3 still ratifies (moves: bundle-only case edges). NEGATIVE CONTROL: drop the pin from publish and the /4 edge arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### REC-222 · queued — **A MEMBER HOLDING A REFERENCE IS NEVER TOLD A NEWER VERSION AFFECTS IT: `op=versionnotice` is a PULL read, and nothing is pushed.** Bob's 00:40Z doctrine, rule 2 (item 3). — owner RECORD.
status: queued — REC-221 (01:51Z): notice-level affects reads 'undetermined' for chain_unread; REC-222 DECIDES whether chain_unread raises a notice (rule 2 says never silence; every address-less capture may be noisy) and states the decision
order: after REC-221, whose grade it reads (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — a `newer_capture` reevaluation source, a queue kind and a mute kind; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-221.
scope: `Store#reevaluations` gains `newer_capture`, raised per member-held reference graded AFFECTED or UNDETERMINED, never for A or B; one notice per (reference, newer capture), a yet newer capture raising a new one; queue and mute kinds on D-534's model; published cases tell the OWNERS once (Framework §18.1, Bob's 2026-09-24 option D).
accepts-when: an AFFECTED reference raises one notice and an A-graded one raises none (moves: nothing pushed). NEGATIVE CONTROL: raise for A and the silence arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### REC-223 · queued — **A MEMBER CANNOT ADOPT A NEWER VERSION OR RECORD KEEPING THE EARLIER ONE, so a notice can never close.** Bob's 00:40Z doctrine, rule 3 (item 4). — owner RECORD.
status: queued — REC-220 (02:20Z): KEEP can write extent_capture to pin an UNDETERMINED leg; use it
order: after REC-222, which raises the notice these acts close (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — two member acts; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-220, REC-222.
scope: ADOPT writes a NEW basis, cite or claim version pinned to the newer capture and retains the old; KEEP records "stays on the earlier version" with who, when, an optional why and both captures; both close the notice; a machine credential is refused (D-394's design, §5.8, §14.4).
accepts-when: adopt leaves the old version readable and the new one pinned; keep closes the notice and a re-read does not re-raise it for the same capture (moves: no act). NEGATIVE CONTROL: let a machine credential adopt and the refusal arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### UI-111 · queued — **NO SURFACE TELLS A MEMBER A NEWER VERSION AFFECTS WHAT THEY REFERENCED, OR OFFERS ADOPT / KEEP.** Bob's 00:40Z doctrine (item 5); construct 4.cross-version-ui. UI-96 draws the PULL notice where a citation shows; this row adds the pushed notice and the two acts. — owner UI.
order: after REC-223, the surface half of the version-doctrine chain (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads REC-222's and REC-223's I3).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-222, REC-223, UI-96.
scope: where the member meets a reference, and in the queue, show "a newer version of this document exists", the grade in the plane's words, and ADOPT / KEEP; show nothing for A and B.
accepts-when: an AFFECTED reference shows the notice and both acts, an A-graded one shows nothing (moves: no surface). NEGATIVE CONTROL: render for A and the silence arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### M0-142 · queued — **`meaning-bounds.test.mjs`'s BOUND_KEY HAS NO `max`: `/^(?:limit|cap|bound|page_size|[a-z_]*_limit)$/` (line 382), so a read bounded by a `max`/`*_max` key (bounded actionquotes) is counted BARE and correct work reads unbounded.** Found by c18-batch7fix's worker; verified at 548eb2c5 by CONDUCT #20 and SCHEDULER #18. — owner M0.
order: (held behind c20-batch11fix, SCHEDULER #18 03:47Z) after D-484, with the rows that cut gate time: an over-strict instrument fails correct work (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:37Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds.test.mjs's segmenter; CONDUCT #20 03:46Z).
scope: add `max|[a-z_]*_max` to BOUND_KEY.
accepts-when: actionquotes' `max` counts as a bound. NEGATIVE CONTROL: remove actionquotes' published max, and the arm names it bare.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-611 · queued — **THE AGENT-WORKER'S SEGMENT BOUND IS A TURN COUNT (120), BUT ITS CPU CEILING SCALES WITH BYTES RE-SERIALISED (about turns squared times bytes per turn): M-168 measured no memory wall (P99 flat at 95-123 MB from 400 to 1,400 turns) and CPU binding at ~7-10 ms per MB re-serialised, so 120 is safe today by ~8x headroom but a heavier turn payload moves the ceiling with no bound noticing.** Found by D-312's worker (05:39Z). — owner FLEET.
order: after D-620, with the measured-bound rows: the shipped bound is safe today, so nothing fails; its unit is wrong (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none unless the shipped bound's unit changes (the integrator classifies; FLEET deploys).
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: D-312 (land/worker/D-312 @ 223766d9; M-168).
scope: bound a segment on cumulative bytes re-serialised, with a margin under ~3 GB (M-168); state the unit at BOUND_SOURCE.
accepts-when: a segment whose turns are few but heavy is cut by the byte bound before the CPU ceiling (moves: a turn count blind to payload size). NEGATIVE CONTROL: bound on turns again and the heavy-turn arm runs past the byte margin, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-312's worker).

### D-590 · queued — **FIVE CODES A REAL-PLANE UI SUITE READS IN A PANE CARRY NO CANNED TRANSLATION: BAD_REQUIRED (intent-write #pg-pf), NO_JUSTIFICATION (#rel-pf), NO_KIND (#ent-pf), each one mint site; NOT_CONCERNED (#pg-th-pf) and NO_REASON (conclude-reading, intent-write #pg-dis-pf, queue-peritem), multi-site (NO_REASON at 13 store.mjs sites + 1 affordances.mjs).** Found by D-485's worker (its ARM H/R4, 02:37Z; owed by name in R4_OWED). — owner RECORD.
order: after D-574, with the DEC-49 rows: a member meets these untranslated today (DEC-49), and the two multi-site codes are consolidated first (D-550/D-574's class) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 additive — code, check and translation on each; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: D-485.
scope: a *_CHECKS row (ACT_SHAPE_CHECKS the natural family) with a canned translation for each; consolidate NOT_CONCERNED and NO_REASON behind one mint site first; remove each from R4_OWED and lower CEILING.reachGap in the same landing.
accepts-when: ARM H lists the five as reached AND translated, R4_OWED holds none of them (moves: five untranslated codes in panes). NEGATIVE CONTROL: strip one translation and ARM H fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-485's worker).

### D-599 · queued — **`NOT_CONCLUDED` IS IN REACH (preauth-vocabulary's published-case mock) WITH NO CANNED TRANSLATION: `store.mjs`'s NOT_CONCLUDED site has no DEC-49 row, so a member can meet the plane's raw code.** Found by M0-148's worker (F4, 03:40Z), once its R3-fed walk followed bindings. NO_REVIEW_COPY, the other new gap code, is D-448's. — owner RECORD.
order: after D-590, with the DEC-49 translation rows: the same class, one more code a member meets untranslated (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: M0-148 (the walk that sees it; land/worker/M0-148 @ 07f38280, carrying D-485).
scope: a DEC-49 row for store.mjs's NOT_CONCLUDED site in a *_CHECKS family, and CEILING.reachGap lowered by one from the guard's print (at union with D-448, re-read reach and reachGap from --strict).
accepts-when: check-refusal-codes --strict reads NOT_CONCLUDED translated and reachGap one lower (moves: 1 code in reach untranslated). NEGATIVE CONTROL: drop the row and the guard fails naming NOT_CONCLUDED.
added: 2026-09-25 · SCHEDULER #22 (id minted by M0-148's worker).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-587 · queued — **`op=calibrate`'s `measured_by` IS A CALLER-SUPPLIED FREE STRING ("who or what ran the probe"), for bearers already and for sessions since REC-155, so the record can attribute a measurement to anyone.** Found by REC-155's worker (02:37Z). — owner RECORD.
order: after REC-158, with the calibration-write rows: an attribution a caller can hand the record is one a caller can invent (CLAUDE.md §5) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3/I5 — a server-stamped principal column beside `measured_by`; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (the five session-reachable judgement and calibration acts), with the calibration register's provenance rules.
depends-on: REC-155.
scope: stamp the caller's principal server-side in a new column beside `measured_by` (session: its member; bearer: token:<class>), and label `measured_by` on every read as the caller's statement, never the record's attribution. RULED BOB #34 02:40Z: `measured_by` names the INSTRUMENT (a probe's or tool's name), as the caller states it, labelled as the caller's claim, never a person; WHO measured is the server-stamped principal in the new column; a reading that shows who measured shows the stamped principal, never measured_by; existing rows read "measured by: undetermined (recorded before the principal was stamped)". REC-155's provisional (all five joined ops need `contribute`) is CONFIRMED: fold both into Membership v2 §4.10 with this landing.
accepts-when: a calibration written through op=calibrate carries the server-stamped principal, and a reader sees measured_by as the caller's words (moves: attribution by free string). NEGATIVE CONTROL: drop the stamp and the principal arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-155's worker).

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### DIST-14 · blocked — **THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap applying.** FW-23's worker (finding 2, via CONDUCT #20 21:52Z). — owner DIST.
status: blocked — SCHEDULER #22 04:23Z: BLOCKED until DIST deploys a build carrying FW-23 (live /version 0.79.0 at 04:18Z, cut dd324152; csvCellRef and csvEntry 0 hits in its bundle); releases held by Bob; re-spawn after that deploy with DIST-14 arms in the live checks; 0 keys spent
order: after FW-24, with the measurements: the deciding figure needs a deployed plane, so it follows FW-23's landing and DIST's next deploy (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the bound moves (the integrator classifies).
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32", with `docs/development/VERIFICATION.md` (measure; do not recall; a vendor's documentation is their claim).
depends-on: FW-23.
scope: on the DEPLOYED plane, read a CSV just over 20 MiB in the scratch namespace (store=scratch named, counters witnessed before and after), record memory outcome and time in `measurements/<id>.md`; if it fails, set the bound from the measured ceiling and state it at the site. Costs 1 of 166 keys.
accepts-when: the measurement is recorded with date, instrument and the build that answered, and the bound is either confirmed or re-set from it (the measured failure it moves: a bound resting on a node heap figure and a vendor claim). NEGATIVE CONTROL: a CSV just under the bound reads clean, so a failure above it is attributable to size.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs DIST`).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-246 · queued — **A RENDERING'S FILE HASH IS RUNTIME-DEPENDENT, AND DEC-41 ASKS FOR A HASH ANY COPY CAN CHECK.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *BOTH, LABELLED: `published_shas` carries the PIXEL hash (`pixels_sha256`, identical across node, workerd and Pillow) as the verifying value; the file hash is recorded beside it as "this file's bytes", for information only.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-419 (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M2
interface: I3/I5 — `published_shas` for renderings; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop), with DEC-41 and BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: D-419 (renderings reach the plane).
scope: when renderings join `published_shas`, the verifying value is `pixels_sha256`, the file hash beside it labelled; `imagecrop.mjs` already emits both.
accepts-when: a rendering published from workerd verifies against a Pillow-computed pixel hash. NEGATIVE CONTROL: verify by the file hash, and the cross-runtime arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### REC-201 · queued — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · queued — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-139 · queued — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### M0-171 · queued — **`versions.test.mjs` HARVESTS SCHEMA TABLES WITH A LOOSE PATTERN (`/CREATE TABLE IF NOT EXISTS (\w+)/g`, ~line 719), so it still counts the prose phantom `would` that M0-155 removed from the census.** Found by M0-155's worker. — owner M0.
order: after M0-160, beside the probe-accuracy rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:07Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument counts code, not prose).
depends-on: M0-155.
scope: add the `\s*\(` tail `hygiene.test.mjs` (~line 685) uses; re-read the table count from its print.
accepts-when: versions.test's table census equals M0-155's 114. NEGATIVE CONTROL: drop the tail and the `would` phantom returns, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-172 · queued — **`status.control.mjs` LEAVES ITS PEN BEHIND (`.status-harness/`, 25 KB `pristine.status`), and `.gitignore`'s pen preamble mis-cites WORKER.md.** BOB #33 RULED (17:12Z): a control driver's PEN is not a session's SCRATCH; in-worktree, gitignored, item-named pens STAND. — owner M0 (fold into any open M0 batch).
order: after M0-171, small; fold into an open M0 batch rather than its own gate (BOB #33, 17:12Z; SCHEDULER #18) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a driver cleans up after a clean run), with BOB #33's ruling of 17:12Z (cite until folded).
depends-on: M0-155.
scope: (1) status.control.mjs removes `.status-harness/` on a clean run; (2) `.gitignore`'s pen preamble says pens are a driver's mechanism, gitignored and item-named, distinct from session scratch; (3) WORKER.md's scratch bullet adds "a control driver's declared, gitignored pen is not scratch".
accepts-when: a clean status.control.mjs run leaves no `.status-harness/`. NEGATIVE CONTROL: remove the cleanup and the pen-gone arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:12Z; `node tools/mintid.mjs M0`).
scope-add: 2026-09-24 by SCHEDULER #19 (via CONDUCT #20, 17:25Z and 18:17Z): control drivers writing `${file}.pristine-<arm>` beside the source, an UNDECLARED pen BOB's ruling does not stand — battery-residue, contradiction-overstrict, d249-port, d301-census, d389-fullfetch, dec65-strength-reach, m041-instrument-census, m057-authority, rec174-supplyfetch, tally-through-pipe, walkfloor, and every `nc-*.mjs` harness (D-499 fixed nc-d64). Fix: a PEN from `mkdtempSync(join(tmpdir(), "<tag>-control-"))`.

### D-594 · queued — **`bio-plane/test/delegations.control.mjs` ARM A6 (~265) READS TODAY'S LOCAL DATE IN THE DRIVER AND COMPARES IT WITH THE DATE ITS CHILD `plancheck` READS FOR ITSELF (the cohort regex ~287), so the control fails on a correct tool across local midnight.** Found by M0-147's worker's class sweep (03:15Z). Latent; control driver only. — owner M0.
order: after M0-172, with the control-driver rows behind the product rows: no gate verdict is false today, it only reddens a control run that straddles midnight (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md`, the instant-independence rule M0-184's landing folds (BOB #35 03:25Z; the instant-dependent class D-231, D-487, M0-147).
depends-on: none.
scope: read the date ONCE in the driver and hand it to the child (a `--today` flag on plancheck), or accept iso or iso+1 in the cohort regex; prefer the flag.
accepts-when: under M0-147's clockpin at 23:59:59.999 local, A6 stays green across the straddle (moves: a midnight false red). NEGATIVE CONTROL: restore the driver's own date read under the pin and A6 fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by M0-147's worker).

### D-600 · queued — **`bio-plane/test/nc-cap12.mjs` ARM `dropslides` NEVER ARMS (its patch matches 0 times, on origin/main too): its anchor `slides: sl ? slideExtents(sl) : null,` in `index.mjs` now reads `slides: sl || deckLen ? slideExtents(sl || []) : null,`, so capture-container-extent's slides control refutes nothing.** Found by D-535's worker (03:16Z). The control fails loudly (ARMED NO), so no gate result is wrong today. — owner M0.
order: after D-594, with the control-driver rows behind the product rows: a control that cannot arm is loud, not false (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: re-anchor `dropslides` on the current line (prefer an anchor keyed on `slideExtents(` so the next rewording is caught), re-run nc-cap12, and record the result on capture-container-extent's NEGATIVE CONTROL line.
accepts-when: nc-cap12 reports `dropslides` ARMED and the slides arm fails by name (moves: 1 arm that never armed). NEGATIVE CONTROL: the re-anchored patch itself; revert the anchor and the driver reports ARMED NO again.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-535's worker).

### D-666 · queued — **`bio-plane/test/rec168-capturerequest-principal.control.mjs`'s ARMS drop-gate, gate-sessions-only AND gate-credentials-only DO NOT ARM: their anchor matches 2 sites (since D-85), so the capture-request principal gate's controls refute nothing.** Found by CONDUCT #22 at batch29's union (06:28Z); the union re-anchored the no-stamp arm onto REC-147's RUN_PRODUCTION_ACTIONS literal. M0-197 (running) may have minted the same drift; if so, close this as its duplicate. — owner M0.
order: after D-600, with the control-driver rows: a control that cannot arm is loud, not false (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: give the three arms a single-site anchor each; re-run the driver AS DECLARED and record it on the suite's NEGATIVE CONTROL line.
accepts-when: all three arms report ARMED and fail by name (moves: 3 arms that never armed). NEGATIVE CONTROL: the arms themselves.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; CONDUCT #22's union finding).

### M0-174 · queued — **`mintid`'s `D` NAMESPACE STILL GRADES DUPLICATES ACROSS TWO SHAPES AS ONE: since DEBT's retirement (M0-140) a `D-` is minted as a PLAN ROW, so its allocation site is the heading `### D-n ·`; the DEBT-table rows `| D-n |` are LEGACY allocations frozen at D-443. A heading and a legacy row for one id (M-57's 17 pairs) are the item and the row it closed, never a duplicate.** BOB #33 RULED, 2026-09-24 17:35Z (drained to `BOB-INBOX-drained.md`; cite until folded). — owner M0.
order: low in the M0 group, beside M0-172: small; fold into an open M0 batch if one fits (BOB #33, 17:35Z; SCHEDULER #19)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses), with BOB #33's ruling of 17:35Z (cite until folded).
depends-on: M0-140.
scope: `mintid`'s allocation site for `D` is the plan-row heading in QUEUE, BACKLOG and their archives; the legacy table rows count toward the floor only; the duplicate check grades EACH shape within itself.
accepts-when: two `### D-n ·` headings are refused; the 17 cross-shape pairs pass; the floor reads 508 on coord f3ca0ad8. NEGATIVE CONTROL: collapse the two patterns into one, and the arm counting 120 false duplicates fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:35Z; `node tools/mintid.mjs M0`).

### M0-184 · queued — **`VERIFICATION.md` IS 24,569 B AGAINST ITS 24,576 B BUDGET (readbudget's CUT set), so it cannot absorb a new rule: M0-166's section cannot land.** Found by M0-173's worker (C). — owner M0.
order: directly before M0-166, which it unblocks (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the reading budget), with `docs/archive/` as the home for finished provenance.
depends-on: none.
scope: move the D-263 PROVENANCE block (~2.4 KB, marked at both ends) to `docs/archive/`, and move `bio-plane/test/register-grammar.test.mjs`'s pin to the archived copy in the same landing. ALSO (M0-169's design gap, via CONDUCT #20 19:37Z): one sentence in "The battery runs every suite"'s Incomplete sections — a fixture's carry-list is DERIVED, once (`moduleclosure.mjs`, `gatedeps.mjs`). ALSO (BOB #35 03:25Z, M0-147's gap): beside M0-169's sentence, the instant-independence rule verbatim from the drained entry ("A suite's verdict must not depend on the instant it starts ... never a flake."). ALSO (BOB #35 04:25Z): D-485's R4 arm, written from D-485's report in the DEC-49 section, in as few lines as state it.
accepts-when: VERIFICATION.md reads ≥ 2 KB under budget and register-grammar stays green (the measured failure it moves: 7 B of headroom). NEGATIVE CONTROL: point the pin back at VERIFICATION.md and register-grammar fails by name. And `grep -c "instant it starts" docs/development/VERIFICATION.md` reads 1. And DEC-49's section names R4.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-166 · queued — **`VERIFICATION.md` HAS NO PROSE ON HOW THE GATE CLASSIFIES A DIFF OR SELECTS UNITS: the rule lives only in `gates.mjs`'s header comments, and M0-116, M0-143 and M0-153 each had to rediscover it.** Found by M0-153's worker. — owner M0 (the document's owner).
order: after M0-165, the same subject; prose, small (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:33Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (this row adds its missing section).
depends-on: M0-153, M0-184.
scope: a VERIFICATION.md section stating the classes, the reader derivation (comment-blanked), the doc-facing rule and its edge rule, citing `gates.mjs` sections, with front matter moved. ALSO (M0-154's F3): beside the D-93 sentence, \"a fixture DERIVES what it must carry from its subject's own imports, never a copy kept by hand (M0-154, `bio-plane/test/gatedeps.mjs`)\".
accepts-when: the section is on `main` and `corpuscheck` reads 0 fail. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-168 · queued — **`control-register.mjs` `declarationAt` ENDS A DECLARATION AT ANY LINE CONTAINING THE MARKER PHRASE, so a mere citation truncates it and LOWERS the recorded arms count (measured: coverage --strict 2093 → 2081).** Found by M0-157's worker. — owner M0.
order: after M0-166 and AHEAD of M0-167: a register that under-counts is a false floor (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: break only where `markerPositions` says a marker BEGINS (the phrase followed by one of MARKER_SEPARATORS); re-read the coverage floor from the print. ALSO (REC-199's worker, via CONDUCT #20 21:43Z): `declarationAt` ends a declaration at the first blank line whose next paragraph does not open with an ordinal; measured reviewcopy.test.mjs credited 5 arms of 14 + baseline (`arms: 5, lines: 38`, main and branch), REC-133's and REC-198's arms never counted. Cross a blank line when ANY later paragraph of the same comment opens a list item; reviewcopy 5 -> 15 is its negative control; re-read REGISTER_FLOOR from the print. ALSO (M0-176 F3, CONDUCT #20 22:40Z): only a suite's FIRST `NEGATIVE CONTROL:` block is read, so `gates.test.mjs`'s later blocks go uncounted; count every block.
accepts-when: coverage --strict counts the full arms again, later blocks included. NEGATIVE CONTROL: a citation mid-declaration does not truncate it, and a real second marker still ends it — each arm by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-167 · queued — **`gates.control.mjs` NEVER ASSERTS THE ABSENCE OF UNDECLARED FAILURES: an arm measuring more than its subject is described, not caught — G2 fails 29 where 3 are declared, G17 fails 11 where 5 are.** Found by M0-157's worker. — owner M0.
order: after M0-166, with the gate instruments (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (break only the thing).
depends-on: M0-157.
scope: enumerate each arm's true failure set, then adopt nc-rec111.mjs's subset check (s.failed ⊆ mustBreak ∪ alsoBreak ∪ a per-arm alsoExpected).
accepts-when: every arm's failures are declared and the check passes. NEGATIVE CONTROL: widen one arm's break and the subset check names the undeclared failure.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-162 · queued — **M0-99's DELEGATION BLOCK STAYS OPEN ON THREE STALE SENTENCES: `kickoffs/DIST.md` lesson 20, `kickoffs/SKILL.md`'s "Design sources" list, and FLEET-NEXT's "Carried memory" ("Regenerate docs/DECIDED.md; never merge it") still describe DECIDED.md as it was.** M0-158's one residue; the candidate words are written in the block on coord `CLAIMS.md`. — owner M0.
order: after M0-160, small: the last open item of a closed contradiction sweep (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a sentence other sessions read is a claim to keep true).
depends-on: M0-158.
scope: apply the block's candidate words to the three sentences (FLEET-NEXT on coord, the kickoffs on main); close M0-99's block.
accepts-when: the block reads closed and none of the three sentences says to regenerate or merge DECIDED.md. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-163 · queued — **`tools/delegations.mjs` HAS NO GRAMMAR FOR A PER-ITEM CLOSURE: `**Items <range> CLOSED <date>**` reads as neither affirm nor discharge, which produced three of M0-158's five contradictions.** Found by M0-158's worker. — owner M0.
order: after M0-162, the same register (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses).
depends-on: none.
scope: recognise the per-item closure form; plancheck §8's warning names a block whose per-item closures cover every item.
accepts-when: a block closed item by item reads closed. NEGATIVE CONTROL: drop the form from the grammar and that block reads open, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-149 · queued — **A PUBLISHED `limit` HAS ONE GUARD: only `bounds.test` checks it; `meaning-bounds` grades the row source, not whether an op in the BOUNDED roster publishes its bound.** Found by D-479's worker. — owner M0.
order: after M0-142, the same suite (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds' segmenter).
scope: a meaning-bounds arm asserting every op in the BOUNDED roster publishes a non-empty `bound`.
accepts-when: the arm lists the roster and passes. NEGATIVE CONTROL: drop the directory's published bound and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-150 · queued — **AN OP LEAVING THE BARE ROSTER INTO THE UNJUDGED BUCKET IS INVISIBLE TO THE FLOOR, which counts only what it still sees: `op=caseratify` was lost that way on `main`, found only by c20-batch11fix's RETURN-DELEGATE rule.** — owner M0.
order: after M0-149, the same suite; the class behind a silent loss (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a floor that cannot see a departure is not a floor).
depends-on: land/conduct/c20-batch11fix on `main`.
scope: an arm asserting every op the walk files is in exactly one judged bucket, or a ratchet on the UNJUDGED bucket's size.
accepts-when: the walk's buckets partition its ops. NEGATIVE CONTROL: hide one op's body behind an unfollowed delegate and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-156 · queued — **`check-refusal-codes` ARM C READS ONLY THE SPANS A `where` NAMES, so a code re-minted OUTSIDE every governed region is invisible, for all 170 governed sites.** Found by D-484's worker. — owner M0 (RECORD reviews).
order: after M0-155, the same class (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: D-484.
scope: an arm counting `reason:"CODE"` / `code:"CODE"` literals across `bio-plane/src` per region row, failing on any outside its claimed span.
accepts-when: every governed code's literals sit inside its region. NEGATIVE CONTROL: D-484's arm 1 (a mint outside the helper) fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-161 · queued — **NO SWEEP FINDS A CONSTRUCT CLAIM THAT DESCRIBES A CAPPED READ WITHOUT SAYING IT IS CAPPED (D-498's class): D-498's heuristic (op = the lowercased method name, `store.mjs` only) left 17 of 27 capped methods UNCLASSIFIED and cannot see caps applied in `index.mjs`.** Found by D-498's worker. — owner M0 (RECORD reviews the claims it names).
order: low in the M0 group: a sweep for further instances of a closed defect (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:13Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a claim states its bound).
depends-on: D-498.
scope: walk the OPS table's dispatch (not method names) to every capped read, then list each construct claim describing it without its cap; each hit is placed as a row.
accepts-when: the sweep classifies all 27 capped methods and names every uncapped claim. NEGATIVE CONTROL: strip "at most" from D-498's claim and the sweep names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-175 · queued — **`tools/train.mjs` READS A FLAG AS A VALUE: `--trailer --full` takes `--full` as the trailer's text, and `--branch` does the same.** Found by M0-159's worker (optional, cosmetic). — owner M0.
order: after M0-161, behind the product rows: cosmetic, no effect on gate time, gate verdicts or product (Bob's 17:41Z rule, via BOB #33: tracked and built, placed after product; SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:46Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument refuses what it cannot read, never silently takes it).
depends-on: M0-159.
scope: `--branch` and `--trailer` refuse a value starting with `--` by name, with an escape for a literal one.
accepts-when: `--trailer --full` is refused by name, and the escaped form is taken literally. NEGATIVE CONTROL: drop the check and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-177 · queued — **A SUITE CAN NAME A `docs/` BASENAME ONLY IN A SLASH-FREE STRING, which the gate reads as a reader edge (M0-165: "MEASUREMENTS" alone is a quoted token); the worker's sweep lists 40 candidates, none confirmed.** Found by M0-165's worker. — owner M0.
order: after M0-175, behind the product rows: a sweep of candidates after M0-176 narrows the door (Bob's 17:41Z rule; SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-176.
scope: an estate-wide arm failing a suite that names a docs basename only in a slash-free string with no other edge; confirm or clear each of the 40.
accepts-when: the arm passes with each candidate fixed or stated legitimate. NEGATIVE CONTROL: plant a bare "MEASUREMENTS" label in one suite and the arm names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-185 · queued — **`derivation-bounds`' TRUNCATION GRADER CANNOT SEE A `this.#rows(` WRAPPED IN A TERNARY, so a capped read written that way leaves the graded roster silently (REC-194 fixed its own instance).** Found by REC-194's worker (F2). — owner M0.
order: after M0-177, behind the product rows: latent, no live instance (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a floor that cannot see a departure is not a floor).
depends-on: none.
scope: the grader follows each branch of a ternary to the rows call.
accepts-when: a ternary-wrapped capped read is graded (the measured failure it moves: REC-194's read leaving the roster unseen). NEGATIVE CONTROL: plant a ternary-wrapped read and the roster names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-186 · queued — **A BATTERY RUN BY HAND OUTSIDE THE GATE IS UNPINNED: nothing records which `origin/main` it measured.** Found by M0-173's worker (D), the half M0-173 left. — owner M0.
order: after M0-185, behind the product rows (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate measures ONE tree), with M0-173's coord pin as the precedent.
depends-on: M0-173.
scope: a hand-run battery prints and records the `origin/main` (and coord) sha it read, as M0-173's gate does.
accepts-when: a hand run's completion line names the main sha (the measured failure it moves: an unpinned hand verdict). NEGATIVE CONTROL: drop the pin and the provenance arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-532 · queued — **`bio-plane/test/d280-strengthbar.control.mjs` ARM C2 HAS BEEN STALE SINCE CASE-2 AND UNTRACKED: three of its mustFail entries name d280's §3 shapes, which no longer exist; REC-141 reported it on 2026-09-19 (the note at d280-strengthbar.test.mjs:4) and no row was made.** Id minted by its finder (via CONDUCT #20 21:21Z). — owner RECORD (the control).
order: after M0-186, behind the product rows: a hand-run driver, no battery effect (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (correct superseded tests, never exempt them).
depends-on: none.
scope: drop the three stale mustFail entries naming d280's §3 shapes, with a comment saying why; keep the severedhomes arm; re-run the driver.
accepts-when: the control reports every arm as declared (the measured failure it moves: C2 reading NOT as declared). NEGATIVE CONTROL: the driver's own arms, recorded on its line.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-532` minted by its finder).

### M0-189 · queued — **THE CONTROL REGISTER'S GRAMMAR IS INVISIBLE TO THE WRITER: `readControl` returns `arms: null` or UNDETERMINED when an arm mark is not a lowercase parenthesised ordinal or the NEGATIVE CONTROL marker appears twice, and nothing says which.** Found by M0-178's worker (F3). — owner M0.
order: after M0-186, behind the product rows (Bob's 17:41Z rule: tracked and built) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: `coverage.mjs`'s report names each cause per suite: "no lowercase parenthesised ordinal found"; "declaration split at a second marker at line N".
accepts-when: each UNDETERMINED suite in the report carries its cause (the measured failure it moves: a bare null). NEGATIVE CONTROL: plant a second marker in a fixture and the report names its line.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-190 · queued — **THE GATE-RESULTS DESCENT RECORD IS PER-CLONE, so a fresh clone cannot judge a rewrite of `origin/gate-results` that predates it.** Found by M0-179's worker, who RECOMMENDS NOT BUILDING IT: no measured need, and it is process tooling. — owner M0.
order: after M0-189, behind the product rows and last of the group: tracked by Bob's 17:41Z rule, with its finder's advice against it recorded; build only on a measured need (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:25Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate record is trusted only by its descent), with TREE-SHARING §3a (the gate-results branch is append-only) and M0-179's refutation.
depends-on: M0-179.
scope: pin a known-good gate-results tip in the tree, which a fresh clone's gate checks its descent from; FIRST re-measure whether any clone has met a pre-clone rewrite, and if none has, close this row as not owed with that measurement.
accepts-when: the pin is checked by a fresh clone, OR the measurement closes the row (the measured failure it moves: none yet, which is why the measurement comes first). NEGATIVE CONTROL: a fixture tip not descending from the pin is refused by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-446 · queued — **`nc-m040.mjs` ARM 1 DECLARES FIVE FAILURES AND MEASURES ONE (derivation-bounds 71/1 on `main`), AND FIVE SUITES NAME INFORMATION FIXTURES `INF-…` WHERE `OBJECT_TYPES` HAS `INFO`.** The fixtures: `frontier-chunk` (D-390's), `d389-fullfetch`, `observation-content`, `observation-log`, `cap14-reused-from`. — owner M0.
order: after M0-139, among the control-hygiene rows; after c17-batch7 lands (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:27Z (4), measured by SCHEDULER #17's verifier)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures; correct superseded tests, never exempt them).
depends-on: D-443 (`integrated`; its branch moved ARM 1's anchor).
scope: rewrite ARM 1's declaration to the measured outcome with a comment saying why the old one was wrong; rename every `INF-` fixture id to `INFO-`.
accepts-when: `node bio-plane/test/nc-m040.mjs` reports every arm as declared, and no suite names an `INF-` id. NEGATIVE CONTROL: restore the five-failure declaration, and ARM 1 reads NOT as declared by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-449 · queued — **`project-sight.control.mjs`'s `promote-stamp-dropped` ARM CANNOT RUN: it throws SURFACE_NO_RUN (0/1), identically on `main` `02603e88`, because since REC-171 removing the stamp also breaks the harness's surfacing-run creation.** — owner M0.
order: after D-446, among the control-hygiene rows (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (break only the thing: a control that moves a second variable refutes nothing).
depends-on: none.
scope: narrow the arm's patch to revisions, keeping the stamp when the base is null.
accepts-when: the arm runs and fails as declared. NEGATIVE CONTROL: the arm itself, recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-369 · queued — **FIVE IN-MEMORY `truncated` SHAPES ARE NEVER DRIVEN PAST THEIR CEILING: only `op=connect` has a live over-the-ceiling arm in `derivation-bounds.test.mjs`; `queueFeed`, `biasInhale`, `documentsNamingEntity` and `#backfillLegContent` are pinned by roster alone (now 10 names).** — owner RECORD.
order: with the M0 control rows: a verification instrument (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (test through the op), with `INVESTIGATIVE-SESSION.md` §14c.
depends-on: none.
scope: a live driven arm per shape. In `bio-plane/test/derivation-bounds.test.mjs`.
accepts-when: each shape is driven past its ceiling and states `truncated`. NEGATIVE CONTROL: drop a paging LIMIT in `queueFeed`, and its live arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-441 · queued — **`tools/decided.mjs` CANNOT SEE A RULING WHOSE MARKER OPENS A LINE IN TITLE CASE: `MARKER` is uppercase only, so `decided.mjs "severance"` misses Case Making's ruling and two Bob rulings read "No RULING".** — owner M0.
order: with the M0 instrument rows; M0-97, M0-99 and D-341, which it waited on, are done (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"WHAT COMPOSES THE INSTRUMENTS".
depends-on: none.
scope: the marker admits a title-case label arm; `**Settled by:**` stays unfiled. Extend `tools/decided.test.mjs`.
accepts-when: the three missed rulings are found. NEGATIVE CONTROL: remove the label arm, and those rulings go unfiled by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-304 · queued — **`walkfloor.mjs`'s HEADER STATES HALF ITS LEXICAL-SCOPE BLIND SPOT: it names same-named locals in different blocks, and omits a `let` reassigned in a branch and a site reading GUARDED off a neighbour's `*Repro` key.** — owner M0 (walkfloor's owner).
order: with the M0 instrument rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (an instrument states its limits), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *the missing statements belong in walkfloor.mjs's own HEADER; VERIFICATION.md gets no line (no budget).*
depends-on: none.
scope: add the two items to the header's CANNOT SEE list.
accepts-when: the header names both. NEGATIVE CONTROL: a grep arm over the header fails by name if either is missing.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-342 · queued — **A CLAIMS.md RELEASE HAS FOUR SPELLINGS AND NO TOOL READS ANY OF THEM: a `### RELEASED` heading, a `released:` line at the file end, a dated release, and the one grammar.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *the one release grammar is a `released: <date> …` line INSIDE the claim's block; the three historical forms are read as released and brought to it; the planning-hygiene pin is a row.* — owner M0.
order: with the M0 instrument rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a pin over a ledger), for `docs/development/PARALLELISM.md` §"Claiming an area" (BOB folds the grammar), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: none.
scope: bring the three historical forms to the grammar; a `planning-hygiene` arm pins it.
accepts-when: every released block carries the in-block line. NEGATIVE CONTROL: plant a `### RELEASED` heading, and the pin fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-459 · queued — **`case-opened.test.mjs` IS UNCLASSIFIED IN THE COVERAGE REGISTER, AND WAS BEFORE D-241.** — owner M0.
order: with the M0 instrument rows, after D-342 (SCHEDULER #17, 2026-09-23; D-241's worker via CONDUCT #18 00:15Z)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: none.
scope: classify the suite in `coverage.mjs`'s register, with its control or its stated reason for none.
accepts-when: `coverage --strict` names no unclassified suite. NEGATIVE CONTROL: remove the classification, and `--strict` names the suite.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-466 · queued — **D-394's OFFICE EXTENT ARMS ARE UNDRIVEN BY ITS SUITE: the worker states it — the cross-version notice's office-format arms have no fixture reaching them.** — owner RECORD.
order: with the M0 control rows, after D-459 (SCHEDULER #17, 2026-09-23; D-394's worker via CONDUCT #18)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (test through the op).
depends-on: D-394 (`integrated` on c18-batch8).
scope: office fixtures (docx, xlsx) driving each office extent arm of the notice.
accepts-when: each office arm is driven and asserted. NEGATIVE CONTROL: break one office arm's extent match, and its fixture arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-467 · queued — **`nc-m038.mjs` ARM (15) DOES NOT ARM ON `main`: its anchor no longer occurs, so the arm cannot fail.** Found by REC-187's worker (F2). — owner M0.
order: with the M0 control rows, after D-466 (SCHEDULER #17, 2026-09-24; REC-187's worker via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control that cannot fail refutes nothing).
depends-on: none.
scope: re-anchor arm (15) on frontier's `(n) => this.#frontierLatest(level, …)` closure.
accepts-when: `node bio-plane/test/nc-m038.mjs` reports arm (15) run and failing as declared. NEGATIVE CONTROL: the arm itself, recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-471 · queued — **`status.test` §6's UI_HELPERS CENSUS MISSES `queueApplySet` AND `queueSelFor`.** — owner M0 (`tools/status.mjs`).
order: with the M0 instrument rows, after D-467 (SCHEDULER #17, 2026-09-24; REC-188's worker via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a census states what it reads).
depends-on: none.
scope: add both to `UI_HELPERS` in `tools/status.mjs`.
accepts-when: the census names both. NEGATIVE CONTROL: remove one, and the §6 arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-474 · queued — **`machine-fences.control.mjs` STILL DECLARES FIGURES FOR 12 OR 13 FENCES, AND THERE ARE NOW 14 (REC-189 added MACHINE_CANNOT_SET_RISK_TIER); the driver is REC-73's and is not in the battery.** — owner RECORD.
order: with the M0 control rows, after D-471 (SCHEDULER #17, 2026-09-24; REC-189's worker F3 via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures).
depends-on: REC-189 (finished; rides the train after c19-batch9).
scope: re-run the driver and move its declared figures to 14 fences.
accepts-when: `node bio-plane/test/machine-fences.control.mjs` reports every arm as declared at 14. NEGATIVE CONTROL: the driver's own arms, recorded on its `NEGATIVE CONTROL:` line.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-477 · queued — **`existed`-STYLE ANSWERS COMPUTED FROM THE DURABLE OBJECT'S SQLITE (`INSERT OR IGNORE` then `changes()`) IN `store.mjs` WERE NEVER SWEPT FOR D-469's CLASS: an answer read after the write that decides it.** — owner RECORD.
order: with the M0 sweeps, after D-474: D-469's class may recur where no suite looks (SCHEDULER #17, 2026-09-24; D-469's worker via CONDUCT #19)
milestone: M0 (a class sweep)
interface: none unless a site is wrong.
design: `docs/development/VERIFICATION.md` (a class is swept, not one site).
depends-on: none.
scope: enumerate every `existed`/`created`/`new` answer in `store.mjs` derived after its own write; for each, show it is read before the write or fix it; name each site in the sweep's verdict list.
accepts-when: the verdict list names every site with its evidence, and any wrong site is fixed with a first-call arm. NEGATIVE CONTROL: for a fixed site, move the read after the write again, and its first-call arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-457 · queued — **CPDF-20's PER-PAGE TIER IS SHIPPED AND UNRECORDED: `mergeTier2Text` has emitted `text.pages[].tier` since `1240af81` with no IC on I2, and Framework §16's closing table and front matter still list "a per-page rule for tier-2 replacement" ABSENT, though it is built and was watched live (D-283, M-120).** — owner CONTENT-PDF.
order: with the M0 record-hygiene rows, after D-441: a record that says less than is built (SCHEDULER #17, 2026-09-23; CPDF-3's worker via CONDUCT #18 23:12Z)
milestone: M0 (the record of what is built)
interface: I2 additive MINOR — filed by CONTENT-PDF, resolved by CONDUCT.
design: `docs/development/VERIFICATION.md` (the construct record is checked against the code), for `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: none.
scope: file the I2 IC for `tier`; correct §16's table and front matter; add a construct-5 claim in `construct-status.json` probing `export function mergeTier2Text(` in `textchain.mjs`.
accepts-when: `node tools/status.mjs 5` reads the per-page rule BUILT by its probe, and I2 documents `tier`. NEGATIVE CONTROL: rename the probed function, and the status check fails naming the claim.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-458 · queued — **C-77 EXISTS AND NOTHING RUNS IT OVER A RECORD: Membership §11 item 9's live recheck of project-name uniqueness has a check (D-50) and no op hands the store's project bundles to `checkProjectNameUniqueness`.** — owner RECORD.
order: after D-457, with the record-hygiene rows (SCHEDULER #17, 2026-09-23; D-50's worker via CONDUCT #18 23:55Z)
milestone: M7
interface: I3 additive — one admin/probe read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.1) and §11 item 9.
depends-on: D-50 (`integrated` on c18-batch8).
scope: a read-only op running C-77 over the instance's project bundles and naming each collision.
accepts-when: two projects with one name are named; a clean record reads none; counters unchanged. NEGATIVE CONTROL: feed the check one bundle, and the collision arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-208 · queued — **TWO PROJECT TITLES A MEMBER CANNOT TELL APART ON SCREEN CAN BE TWO NAMES: the project-name key does not fold Unicode-equivalent forms (NFC and NFD), so a lookalike project could claim a name that is taken.** BOB #32's ruling of 2026-09-23 23:44Z (cite until folded into Membership §7.1): *Unicode-equivalent titles are ONE name; the key normalises to NFC before §7.1's existing comparison; existing titles stay as written, and a pair that collides after normalising is STATED by the census, never renamed.* — owner RECORD.
order: after D-458, the same name check (SCHEDULER #17, 2026-09-23; D-50's worker)
milestone: M7
interface: I3 — the name refusal widens; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.1), with BOB #32's ruling of 2026-09-23 23:44Z (cite until folded into Membership §7.1).
depends-on: D-50 (`integrated` on c18-batch8).
scope: NFC normalisation in the name key at the write and in C-77; D-458's census states any post-normalisation pair.
accepts-when: an NFD title equivalent to a taken NFC title is refused by name; existing titles read byte-unchanged. NEGATIVE CONTROL: drop the normalisation, and the NFD-lookalike arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-87 · queued — **THE ANALYST-VOCABULARY GATE FIRES ON PLAIN ENGLISH: `civicos-ui/test/analyst-vocabulary.mjs`'s `BANNED` connective rule `(AND|OR)\s+(of|…|set|sets)` carries `/i`, so "reason 1 and set 2" and "two or more sets" fail as analyst jargon.** Measured with node (CONDUCT #17, re-measured by SCHEDULER #17 on c17-batch5 @ 7c4f6b5f); the file's other connective rules are case-sensitive and its own header, finding (i), says a case-insensitive `AND` fires on correct English. — owner UI.
order: after M0-139, among the verification rows: a gate that refuses correct member copy pushes surface authors toward worse words, so it goes ahead of pure process tooling (SCHEDULER #17, 2026-09-23, CONDUCT #17's 22:00Z finding (4))
milestone: M0
interface: none — a test rule.
design: `docs/development/VERIFICATION.md` (a suite asserts what it claims), with DEC-32 clause 1 as the file itself states it.
depends-on: none.
scope: drop the `i` flag on that one rule; keep "the OR set" and "AND of the legs" caught. Extend `civicos-ui/test/analyst-vocabulary.test.mjs` with a must-pass fixture.
accepts-when: "reason 1 and set 2" passes and "the OR set" is still refused. NEGATIVE CONTROL: restore `/i`, and the plain-English must-pass arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-272 · queued — **THE REFUSAL-CODE CENSUS IS STILL A FLOOR READ AS A TOTAL: `check-refusal-codes.mjs` arm F resolves codes held in constants (`STORE_SILENT_REASON` in `index.mjs`, `const REASON = {…}` in `store.mjs`) and prints them, but they never join the census union the floors are measured over.** — owner UI (the refusal-code guard).
order: after UI-87, first of the census rows: a member-facing refusal can go untranslated while the census reads complete (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0 (the census instrument; the translations it surfaces are DEC-49 work)
interface: none — the census and its floors.
design: `docs/development/VERIFICATION.md` (a census states what it reads), with DEC-49 for the translation of any code it recovers.
depends-on: none.
scope: promote arm F's identifier resolution to a seventh matcher in the union; re-read the six `FLOOR` figures from one printed green run in the same turn; translate the recovered codes under DEC-49 (`STORE_DID_NOT_ANSWER` among them). Suite `civicos-ui/test/refusal-codes.test.mjs`, driver `refusal-codes.control.mjs`.
accepts-when: both recovered codes are in the union and the floors carry no slack. NEGATIVE CONTROL: remove the seventh matcher, and a named floor arm fails.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; D-272's DEBT row of 2026-08-09, verified at the code on `02603e88`; keeps its `D-` id).

### D-273 · queued — **NINETY-THREE-PLUS REFUSAL CODES ARE WRITTEN INLINE AT SEVERAL SITES (`check-refusal-codes.mjs` F4 MULTI-SITE, last partition 103), SO NONE CAN TAKE ONE DEC-49 ROW.** — owner RECORD, with UI.
order: after D-272, the same census (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (the guard's shape)
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard), following REC-79's single-helper shape for `NOT_CAPABLE` (`admission-gate.test.mjs`).
depends-on: none.
scope: consolidate each multi-site code behind one helper, one code per slice, starting with `NO_SUCH_BUNDLE` (15 sites); re-read the partition each slice.
accepts-when: the sliced code reads single-site and the F4 count falls by one. NEGATIVE CONTROL: restore one inline literal, and arm F fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-344 · queued — **THE CONTROL REGISTER CANNOT SEE A QUALIFIED `NEGATIVE CONTROL` DECLARATION: `control-register.mjs` `markerPositions` counts the phrase only when a separator follows it directly, so `NEGATIVE CONTROL (…)` (over sixty suites) and `NEGATIVE CONTROL, …` (three in `corpuscheck.test.mjs`) are invisible, and `register-grammar.test.mjs` C5e works around the blind spot rather than fixing it.** — owner M0 (VERIFICATION).
order: after D-272: the register every suite's control is counted by under-reads, so coverage is claimed on less than it reads (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"The negative-control register".
depends-on: none.
scope: `markerPositions` admits one parenthesised or comma qualifier before a separator on the same line; a bare phrase with no separator still does not count; C5e corrected in the same change.
accepts-when: `corpuscheck.test.mjs` reads five declarations and C5e's workaround falls, in `register-grammar.test.mjs`. NEGATIVE CONTROL: restore the strict separator check, and the "a qualified marker is a declaration" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-357 · queued — **THE DEC-49 GUARD'S REGION MATCHER ENDS IN A WORD BOUNDARY, SO A REGION NAMED `x-y` OPENS REGION `x` TOO: `civicos-ui/check-refusal-codes.mjs` `REGION_START`/`REGION_END`.** A live latent pair exists (`is-capture-request` in `store.mjs`, `is-capture-request-arm` in `index.mjs`), harmless only while they sit in different files. — owner UI.
order: after D-344 (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard's section, *what a refusal is in principle*).
depends-on: none.
scope: end both patterns in a lookahead for whitespace, a comment close or end of line instead of the word boundary; a sibling-region fixture.
accepts-when: a file holding regions `x` and `x-y` passes with one opener each, and the `regionLines` floors do not move. NEGATIVE CONTROL: restore the word boundary, and the "one opener per name" arm fails naming two opening markers.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-300 · queued — **A SUITE THAT READS THE WALL CLOCK CAN TURN RED UNTOUCHED, AND THE SWEEP THAT WOULD SAY SO IS RUN BY NOBODY: three suites of about three hundred bind `BIO_NOW_MS`; `clockadvance.control.mjs` exists and no tool, script or gate runs it.** — owner M0.
order: after D-357; the cheap half (run the sweep) first; threading the clock through every constructor is a later row if the sweep finds decay (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`.
depends-on: none.
scope: `gates.mjs` (or the battery) runs the clock-advanced sweep at plus one year on the full class and prints its result line; each suite it turns red is named.
accepts-when: the sweep runs without anyone starting it and its line is printed on a full gate. NEGATIVE CONTROL: plant a fixture dated thirty days ahead, and the sweep arm fails naming the suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### M0-135 · queued — **A LANE'S OWN `gates.mjs` ON A TREE ALREADY RECORDED GREEN TAKES §2d's TREE-KEYED SHORTCUT AND RUNS NO NEVER-CACHED UNIT (with `BIO_GATE_RESULTS=off`), SO A HISTORY- OR REF-READING CHECK IS SKIPPED ON A LANE'S PUSH.** M0-131 closed this for the TRAIN (`gates.mjs --never-cached` on a reused tree, so `main` is covered); a lane's gate is not. M0-131's worker's finding, verified in its report (CONDUCT #16); RE-READ 2026-09-23 by SCHEDULER #16 on `0e7cc03e` (M0-131 landed): NARROWED — with the per-unit record on (the default) §2d does not take the shortcut and the never-cached units run; the bare shortcut stands only with `BIO_GATE_RESULTS=off` (or no `tools/gateresults.mjs`) and no `--with-never-cached`. — owner M0.
order: behind the product rows, first of the process block (moved 2026-09-23 by SCHEDULER #16): re-read at the code, the default path already runs the never-cached units, so this closes a non-default mode, neither cutting gate time nor unblocking product — Bob, 2026-09-22: *"The goal is BIO work; process is overhead"* (was: directly after REC-176, SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 1 (never-cached units always run) and §2 (M0-122's reuse), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-131 (its derived never-cached set and `--never-cached` run are reused).
scope: with the per-unit record off, §2d's shortcut on a recorded-GREEN tree behaves as `--with-never-cached`: it runs the derived never-cached set and records the tree GREEN only when they pass; the printed line says which units ran.
accepts-when: `gates.mjs` on a recorded-GREEN tree with a planted history defect reads RED naming the never-cached unit. NEGATIVE CONTROL: restore the bare shortcut, and the planted arm reads GREEN and fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-131's worker's finding via CONDUCT #16; `node tools/mintid.mjs M0`).

### M0-137 · queued — **SUITES PASS ABBREVIATED COMMIT IDS TO GIT, SO A FETCH THAT BRINGS A COLLIDING PREFIX TURNS A GREEN SUITE RED WITH NO CODE CHANGE.** Re-read on `origin/main` @ `38b49c50`: `bio-plane/test/ledger.test.mjs` `PRE_MIGRATION = "9ea2eb02"` and `STATE_PIN = "de40aa56"`; `bio-plane/test/mergecarry.test.mjs` passes `"e241672"` to `git cat-file`, `auditMerge`, `git show` and the `tools/mergecarry.mjs --commit` CLI. — owner M0.
order: first of the process block, directly after M0-135: a red on `main` from a git object, not the code, is TREE-SHARING §3's alarm to Bob, but no collision has happened, so it sits behind the product rows (SCHEDULER #16, 2026-09-23; M0-136's worker via CONDUCT #16)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-136 (touches the same history readers; on `land/conduct/c16-batch6`).
scope: every commit id a suite passes to git in CODE is the full 40-hex id (`9ea2eb022b5d6490c9e9e96b93037040193084d3`, `de40aa56f5d397666228502132d56756f51ff6b9`, `e2416725d2504485443ea24bb68a00009e886570`); a sweep of `bio-plane/test/` and `tools/` for other short ids passed to git, each lengthened or listed. Prose citations may stay short.
accepts-when: `ledger.test.mjs` and `mergecarry.test.mjs` green with only 40-hex ids in their git calls, and a hygiene arm in `mergecarry.test.mjs` that fails by name on a short id passed to git. NEGATIVE CONTROL: shorten one id back, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (M0-136's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs M0`).

### M0-104 · queued — **A GATE RUN ON A DIRTY TREE RECORDS NOTHING, SO D-293's OWN SHAPE — A RED GATE, THEN `git add -A && git commit && git push`** … (whole text: the cut archive)
order: behind the product rows, the first process row after D-50 (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; it neither cuts gate time nor unblocks product, as a commit-then-gate is recorded already); a correction to D-293 (SCHEDULER #11 on BOB #25's word)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its push-guard section; the dirty-tree … (whole text: the cut archive)
depends-on: none — D-293 is on `main`.
accepts-when: a RED gate on a dirty tree, then `git add -A && git commit` and a push, is refused by name; a dirty run whose tree changes mid-run records nothing and says so; a GREEN dirty … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-104» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-105 · queued — **`docs/development/VERIFICATION.md` STANDS AT 24,572 OF ITS 24,576 B, SO A RULING ABOUT VERIFICATION CANNOT BE FOLDED INTO IT** … (whole text: the cut archive)
order: directly after M0-104, whose line it folds, behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; SCHEDULER #11 on BOB #25's word); RETURNED here by SCHEDULER #14 after M0-107 folded its ruling within budget (`VERIFICATION.md` 24,319 B at `14f1b75e`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §1's reading budget and … (whole text: the cut archive)
depends-on: M0-97 (on CONDUCT #12's batch), whose second specimen this cut folds (BOB #25, 2026-09-22).
accepts-when: the file is at most 22,528 B; every sentence the cut removes is in the archive file verbatim (moved, never lost); the register-grammar suite and its control pass. How a liar … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-105» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-84 · queued — **NOTHING NOTICES WHEN A RETIRED INSTANCE OF A LANE LANDS AFTER ITS SUCCESSOR.** BOB #17 landed `aa5cc98d` (00:48) after BOB #18 … (whole text: the cut archive)
order: behind the product rows, first of the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: a detector neither cuts gate time nor unblocks product; SCHEDULER #12); after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting `kickoffs/BOB.md` rules 4 and 12.
depends-on: none.
accepts-when: a fixture log with an older instance landing after a newer one WARNs naming both; the same log whose late commit touches only the `-NEXT` file does not. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-84» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-85 · blocked — **THE HEARTBEAT MEASURES A STALE TREE.** `conduct-heartbeat` STEP 3 greps `QUEUE.md` in the MAIN CHECKOUT's working tree and … (whole text: the cut archive)
order: behind the product rows with the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*; SCHEDULER #12), M0-81's class (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the heartbeat's own STEP 3 warning … (whole text: the cut archive)
depends-on: Bob's approval of the definition edit (BOB #19 took it to him, 2026-09-21).
accepts-when: a heartbeat run's `queued`/`running` counts equal those of `node tools/coord.mjs read docs/development/QUEUE.md` read at that run, and its sweep names the tip it judged.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-85» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-412 · queued — **THE ESTATE AUDITS EXPOSURE AND NOBODY AUDITS RESIDUE: a worktree that is registered, clean, merged and owned by no live session** … (whole text: the cut archive)
order: with the session-hygiene instruments, after M0-84: disk is CONDUCT's binding constraint (M-80 and M-81 each measure ~286 MiB per retired tree) and this names the residue nothing reclaims; below M0-81 and M0-84, which prevent and detect a lane fault rather than a cost (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-398's three conditions asked of a TREE rather than a session.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT in the repo where a suite drives it, the ACT in the harness.
accepts-when: a fixture tree registered, clean, merged and unowned is named RECLAIMABLE with its size; **one a live worker is using is NEVER named** — the over-strictness arm IS the item. … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-412» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-154 · queued — **`kickoffs/RECORD.md` IS 36,709 B AGAINST THE 24,576 B READING BUDGET**, so the lane whose kickoff it is cannot read its own … (whole text: the cut archive)
order: behind the product rows, first of the reading-budget rows (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: an over-budget kickoff costs every RECORD spawn context, not gate time, and blocks no product; SCHEDULER #12); not a defect in the product, cheap and mechanical (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` with CLAUDE.md §1's reading budget — *a file is either READ WHOLE … (whole text: the cut archive)
depends-on: none.
accepts-when: `node tools/readbudget.mjs` no longer warns on RECORD.md; the archived text is byte-identical to what left the live file; no RECORD worker was live during the cut. How a liar … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-154» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### CPDF-21 · queued — **`kickoffs/CONTENT-PDF.md` IS 25,863 B AGAINST THE 24,576 B READING BUDGET**, so the lane cannot read its own instructions … (whole text: the cut archive)
order: directly after REC-154, its class and its precedent: it breaks CLAUDE.md §1's reading budget for a build lane, every CONTENT-PDF worker pays it on every spawn, and it is cheap and mechanical (SCHEDULER #6, 2026-09-21; SCHEDULER #5's handoff)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a … (whole text: the cut archive)
depends-on: none. **Same line as REC-154** (`CUT` in `tools/readbudget.mjs`): whichever lands second re-reads the first.
accepts-when: `node tools/readbudget.mjs` no longer warns on CONTENT-PDF.md and lists it in `CUT`; the archived text is byte-identical to what left the live file. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CPDF`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CPDF-21» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-82 · queued — **NARROWED TWICE ON 2026-09-21: WHAT IS LEFT IS THE OCCUPANCY RULE AT THE INTEGRATOR'S NO-BOB FALLBACK START.** The … (whole text: the cut archive)
order: beside REC-154, the reading-budget class, and after M0-81, which builds the occupancy judgement this rule points at (SCHEDULER #4, 2026-09-21, re-measured; placed by SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget … (whole text: the cut archive)
depends-on: none. Sequence after M0-81.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; the kickoff states the check at the fallback start and cites BOB.md; anything cut is byte-identical in the archive.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry); narrowed 2026-09-21 by BOB #19 and SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-82» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-120 · queued — **`mintid --audit --base` DIFFS `main` ONLY, SO AN ID ALLOCATED ON `coord` IS INVISIBLE TO THE INTEGRATION-SIDE CHECK.** `audit()` (`tools/mintid.mjs`) reads `git diff <base>...HEAD`; since M0-110's cutover every DEBT row, plan heading and ledger archive — the allocation sites — lands on `coord`. Found by M0-110's worker (CONDUCT #14). — owner M0.
order: first of the ledger tooling, before LED-8: an id collision check blind to where ids are now minted is the costs-nothing green, latent until two lanes mint the same id on `coord`; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23; M0-110's finding)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §1 (the state moves to `coord`; every reader follows it), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-110 is done.
scope: the audit also diffs the `origin/coord` range (the ids a branch's coord writes added since its base), reading through `tools/coord.mjs`, and says which side each allocation came from.
accepts-when: an id allocated twice, once on `main` and once on `coord`, is reported as a collision by name. NEGATIVE CONTROL: drop the coord range, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-110's finding, via CONDUCT #14; `node tools/mintid.mjs M0`).
