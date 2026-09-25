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

### D-563 · queued — **`op=promote` TAKES A BUNDLE'S TITLE AND STATE FROM THE ENVELOPE, NOT THE DOCUMENT: it projects `bundles.title`, `current_state`, `prior_state`, `created` and `last_updated` from the envelope, and 7.1's name scan, 7.11's owner test and REC-181's retirement arm read `meta.title` / `meta.current_state`; MEASURED: a second project whose bytes name a TAKEN title LANDED when `meta.title` named another, and the projection shows the envelope's title over the bytes'.** D-526's class one field over; found by D-526's worker (00:48Z). — owner RECORD.
order: at the head of the backlog with the promote corrections: a name fence and an owner test a caller can steer with a label are authority defects, which outrank features (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — refusals on op=promote for a contradicting envelope; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation (the document states what it is; the envelope is a label).
depends-on: D-526.
scope: extend D-510's derivation to title and state: derive both from the document, refuse an envelope that contradicts it by name, and make 7.1's name scan, 7.11's owner test and REC-181's retirement arm read the derived values; the projection writes the derived values.
accepts-when: the taken-title promotion is refused NAME_TAKEN whatever meta.title says, and the projection shows the document's title (moves: a taken name landing under another label). NEGATIVE CONTROL: read meta.title in the name scan again and the taken-title arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-526's worker).

### D-578 · queued — **A PROMOTE REVISION WHOSE DOCUMENT AND ENVELOPE BOTH STATE NO TYPE LEAVES `promotedType` UNDEFINED, and the INSERT throws "NOT NULL constraint failed: bundles.object_type": the caller gets a raw error with a store.mjs stack instead of a named refusal (reproduced through op=promote on the D-547 tree; the transaction rolls back, nothing lands).** Found by D-547's worker (01:36Z). — owner RECORD.
order: after D-563, with the promote corrections: a raw stack on a public op breaks DEC-49 and leaks internals (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — a typeless revision carries the head's type forward, stated; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5, D-510's derivation and D-547's retype fence (C-86.2).
depends-on: D-547.
scope: a revision that states no type takes the head's `cur.object_type` (the only type D-547 admits), stated on the answer, never silent; a CREATION that states no type keeps its existing refusal.
accepts-when: a typeless revision lands carrying the head's type and says so; no op=promote answer carries a stack (moves: a raw NOT NULL error). NEGATIVE CONTROL: drop the carry-forward and the typeless-revision arm reads the raw error, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-547's worker).

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

### D-546 · queued — **`op=promote` ASKS NO STATE-EDGE TABLE EXCEPT FOR BIAS: D-468 fenced a bias set's moves against its STATES edges, and every other type with a head can still move along an edge its table does not declare.** D-468's worker. BOB #34 RULED 2026-09-24 23:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #21; cite until folded): *the fence governs moves MADE FROM NOW ON; the history stays as it was written, and is COUNTED and SAID.* — owner RECORD.
order: after D-547, with the promote corrections: a disallowed move lands in the record (CLAUDE.md §2); BOB #34 ruled it product order (SCHEDULER #21, 2026-09-24)
milestone: M7
interface: I3 — refusal codes on op=promote for types other than bias; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas and state machines), with BOB #34's 23:55Z ruling, folded into §4 by this row.
depends-on: D-468.
scope: (1) MEASURE the corpus first: per type, the count of recorded moves whose edge is undeclared today, with dates, in `measurements/<id>.md`; (2) lift D-468's fence to every type with a head: promote refuses any move its type's table does not declare, for every caller by a named DEC-49 code; (3) never rewrite, reverse or repair a stored move; where a reader meets one it is stated "made by a path the current rules do not allow (before <fence date>)", neither valid nor invalid, and never larger or smaller than the count shows; (4) `STATES` keeps its valid-but-unreachable states for reading old records, unreachable by promote.
accepts-when: an undeclared move on a non-bias type is refused by name, a stored undeclared move reads with the dated sentence and is unchanged, and the measurement states the per-type counts (moves: promote asks no table but bias). NEGATIVE CONTROL: drop the fence for one type and its undeclared-move arm lands, failing by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-556 · queued — **A WHOLE-HASH REGISTER ROW HELD IN PARTS CANNOT RATIFY: the gate refuses it PLANE_HELD_IN_PARTS (D-530) because publication copies a capture by its whole hash, while the audit calls the same bytes SOUND (D-533).** Found by D-533's worker (M-150). BOB #34 RULED YES 2026-09-25 00:00Z (drained to `BOB-INBOX-drained.md`; cite until folded): BOTH halves in ONE landing, never the gate alone. — owner RECORD.
order: after D-546, with the corrections: a gate that treats sound bytes as missing contradicts the record, but D-530's refusal is honest until both halves land (BOB #34 00:00Z) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — publication's copy and the gate's verdict; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (D-530's parted capture), with BOB #33's D-533 ruling and BOB #34's 00:00Z ruling, folded by this row.
depends-on: D-530, D-533.
scope: (1) publication copies a parted capture part by part and re-verifies each digest at the destination; (2) the gate admits the row when every part is present and verifies, and refuses by name (the missing part, or the digest that failed) otherwise; reuse D-533's parts helper, never a third copy.
accepts-when: a parted capture ratifies AND publishes, byte-verified; one missing a part is refused naming it (moves: PLANE_HELD_IN_PARTS on sound bytes). NEGATIVE CONTROL: drop the part-copy from publication and the publish arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-533's worker).

### D-561 · queued — **FIVE REFUSAL CODES STILL REACH AN ANONYMOUS CALLER UNTRANSLATED ON THE PUBLIC `op=publishedbytes` AND `op=publishedcase`, after D-549 translated NO_PUBLISHED_STORE (C-68.5).** Found by D-549's worker (land/worker/D-549 @ afcf1128; codes named in its report, not on the branch). Its sibling D-562 (check-refusal-codes grades public-op codes out of reach) is D-542's reach-by-op class and rides D-542. — owner RECORD.
order: after D-567, with the corrections: a public caller shown a machine token is DEC-49's failure on the surface a stranger meets (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 additive — code, check and translation on the two public ops' refusals; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the public door), with DEC-49 (every refusal a member or the public can meet carries a canned translation).
depends-on: D-549.
scope: enumerate at the code every code the two ops mint to an anonymous caller that has no catalogue row (D-549 counted five), and mint each at one governed site with a DEC-49 row written for a member of the public.
accepts-when: each of the enumerated codes reaches a stranger with its translation, driven through the op (moves: five untranslated public codes). NEGATIVE CONTROL: strip one translation and that code's arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-549's worker).

### D-557 · queued — **THE DECODE CENSUS NEVER CLASSIFIES TIER-3 TEXT, AND ITS READER LABEL SAYS IT DOES: `fw20-decode-census.mjs` labels the reader from the acquire reading's `text_tier` but judges the PLAIN `op=pdfstructure` text, which stops at tier 2, so 34 of 38 documents labelled "plane (text tier 3)" were judged on EMPTY text while their OCR text exists (M-152).** Found by D-536's worker. — owner CONTENT-PDF (the instrument).
order: after D-561, with the corrections: M-143's "38 tier 3" states a reading that never reached `judge`, so the record claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-536's reading provenance and M-152.
depends-on: D-536.
scope: the census judges the text the acquire reading classified (its `text_units`), or calls `op=pdfstructure&ocr=1` for a document read at tier 3; the reader label comes from `structure_provenance.producers`, never `text_tier`; re-run the sample and record the moved figures in a new measurement.
accepts-when: the 34 documents are judged on their tier-3 text, and no document is labelled tier 3 unless tier-3 text was judged (moves: 34 of 38 judged on empty text). NEGATIVE CONTROL: judge the plain answer again and the tier-3 arm reads empty, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-536's worker).

### D-573 · queued — **A REVIEW COPY'S `last_change` PICKS SILENTLY BETWEEN TWO ACTS IN THE SAME SECOND when one carries a whole-second stamp from before D-543, so the one in-band date claims an order the record cannot support.** Found by D-543's worker. BOB #34 RULED (1) 2026-09-25 01:05Z (drained to `BOB-INBOX-drained.md`; cite until folded): keep the instant-order pick as the ONE in-band date (DEC-31), and STATE the tie in `last_change.stated` ("which of <act A> and <act B> came later is undetermined: <act A> was recorded to the second"), naming the tied act in `last_change.undetermined_within`. — owner RECORD.
order: after D-557, with the corrections: a date that claims an order it cannot know is the record claiming more than it holds (CLAUDE.md §2; BOB #33's D-516 band rule) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 additive — two keys on `last_change`; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 1, with BOB #34's 01:05Z ruling, folded by this row.
depends-on: D-543.
scope: when the two newest candidates fall in one second and one is whole-second, keep the pick, add the statement and the tied act; acts in different seconds carry no statement.
accepts-when: a legacy whole-second ack and a millisecond comment in one second give the pick PLUS the statement; acts in different seconds give none (moves: a silent pick). NEGATIVE CONTROL: drop the statement and the tie arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-543's worker).

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

### D-568 · queued — **A DRAFT THAT NAMES NO CASE AND DOES NOT SET `newCase` STILL ANSWERS `edition: 1` on op=casedraft, casedrafts, reviewcopy and reviewgrant, the minted-case edition for a case publication will DERIVE (draft DD would be C1's next edition).** Found by D-538's worker (01:04Z). — owner RECORD, then UI.
order: after D-573, with the review-copy corrections: an edition stated for a case the record has not chosen claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: I3 — `edition` reads null on the wire for a derived draft; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with BOB #32's 2026-09-23 23:08Z newCase ruling.
depends-on: D-538.
scope: keep the internal (case_id NULL, edition 1) key that grants and statement acknowledgements bind to, and answer `edition: null` (undetermined) on the wire for a derived draft in all four answers.
accepts-when: DD answers `edition: null` in all four while its grant and acknowledgements still bind (moves: edition 1 stated for a derived case). NEGATIVE CONTROL: answer the internal edition again and the DD edition arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-538's worker).

### UI-108 · queued — **THE PROGRESSION PAGE SHOWS A DISMISSED FINDING AS AN OPEN QUESTION: `progPaintInstance()` renders `inst.findings` verbatim and cannot say a member decided it.** The surface half of D-552. — owner UI.
order: directly after D-552, which it consumes (SCHEDULER #20, 2026-09-24)
milestone: M4
interface: I3 consumer (D-552's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §12 "age rather than vanish" (D-79), with D-552's published view.
depends-on: D-552.
scope: on the progression page, render each finding's disposition as the plane states it (who, when, the reason, and whether the decision still applies to the current definition_version), in the plane's words; the finding stays listed.
accepts-when: against a real-plane suite a dismissed finding renders its decision beside it (the measured failure it moves: an answered question shown as open). NEGATIVE CONTROL: render `inst.findings` without the view and the decided-finding arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs UI`).

### UI-106 · queued — **THE REVIEW-COPY SURFACE LOSES `newCase` AND WILL SHOW THE CORRECTED IDENTITY SENTENCE UNREAD: `app.html`'s `rvcFormFromCopy` does not read `case.newCase` (DELEGATION RECORD (WORKER REC-199) -> UI on coord CLAIMS.md), and UI-92's draft list draws `#caseIdentitySentence`, which D-538 changes.** — owner UI.
status: queued — D-538 (01:04Z): civicos-ui preauth-vocabulary.test.mjs ~941 and review-copy.test.mjs ~479 mock the OLD identity sentence for a copy with no newCase; correct both mocks to the plane's new wording
order: after D-539, the surface half of the review-copy corrections (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:43Z)
milestone: M10
interface: I3 consumer (REC-199's IC-285 and D-538's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling.
depends-on: D-538, UI-92.
scope: `rvcFormFromCopy` reads `case.newCase` so a read-then-write keeps it; the draft list re-reads the plane's identity sentence as stated; discharge REC-199's DELEGATION block.
accepts-when: against a real-plane suite a round trip through the form keeps `newCase`, and draft DD shows the derivation sentence (the measured failure it moves: `newCase` lost at the surface). NEGATIVE CONTROL: drop the read and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### UI-110 · queued — **NO MEMBER CAN SELECT A PROJECT-SCOPED FINDING INTO A QUEUE SET: `civicos-ui/app.html`'s `queueSetOpFor` (~14393 on main 9f8b69e6; UI-94 renames it `queueSetOpsFor`) returns null for scope=project, though REC-205 makes the plane carry each item's project.** The DELEGATION RECORD (REC-205) → UI on coord `CLAIMS.md` (06b86e6d). — owner UI.
order: after UI-106, the surface half of REC-205, in product order behind its plane half (SCHEDULER #21, 2026-09-24; via CONDUCT #20 23:45Z)
milestone: M8
interface: none (reads REC-205's I3 set act).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with D-266's NO_PROJECT_SCOPE.
depends-on: REC-205, UI-94.
scope: the set act sends each project-scoped item's own project; where an item has several homes the surface asks the member and NEVER defaults one (D-266); the plane's NO_PROJECT_SCOPE reaches the member in its DEC-49 words.
accepts-when: a project-scoped finding joins a selection and the set act carries its project; an item with two homes is not sent until the member names one (the measured failure it moves: null for scope=project). NEGATIVE CONTROL: return null again and the selection arm fails by name.
added: 2026-09-24 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### UI-113 · queued — **NO SURFACE RENDERS A PUBLISHED CASE'S FROZEN `bias_manifest` BLOCK AT ALL (0 hits in civicos-ui), so REC-219's pending-adoption statement reaches no page.** Found by REC-219's worker (02:38Z). — owner UI.
order: after UI-110, with the surface halves of landed record rows (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: none (reads REC-219's /4 block).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 18, with Declared Bias "Bias bundles and adoption".
depends-on: REC-219.
scope: the published case page renders the frozen bias_manifest as the document states it, verbatim (DEC-8): the stated sentence, and pins_proposed_stated with each pending revision; /3, /2 and /1 documents render what they carry, never a default.
accepts-when: a /4 case with a pending adoption shows it; a /3 case shows its own statement and nothing invented (moves: no surface). NEGATIVE CONTROL: drop the block and the pending arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### D-576 · queued — **THE `op=connect` RECEIPT CLAIMS THE WHOLE SET WHEN THE DERIVATION WAS CUT: `app.html` `connectGo` reads "The record derived N connections among the documents that concern this subject" and ignores the answer's `truncated`, which store.mjs documents as "whether the DERIVATION was cut".** Found by UI-95's worker (01:10Z); UI-95 states the cut on the subject panel beneath it. — owner UI.
order: after UI-110, with the surface corrections: a receipt reading a cut set as whole claims more than the record holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads op=connect's existing `truncated` and `documents`).
design: `docs/development/CONTENT-SEARCH-DESIGN.md` (D-241's derivation statement, as UI-95 renders it).
depends-on: UI-95.
scope: when `r.truncated === true`, the receipt adds that the derivation was cut at its bound after `r.documents` of the subject's documents, so the connections are part of the set.
accepts-when: a truncated connect answer's receipt states the cut; an untruncated one does not (moves: a cut receipt reading as whole). NEGATIVE CONTROL: ignore `truncated` again and the cut-receipt arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-95's worker).

### D-592 · queued — **A REOPENED FINDING CANNOT SAY WHO REOPENED IT: `op=queue`'s `prior_disposition` names who DECIDED, and nothing publishes who REVISED the declared flow, so UI-109's item states that name is not on it.** Found by UI-109's worker (02:57Z). — owner RECORD, then UI.
order: after D-576, with the surface corrections: the reopened question's own account is incomplete where the record holds the fact (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — the revising version's number, declared_by and at beside prior_disposition; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions".
depends-on: UI-109.
scope: proposalsFeed publishes, from progression_def_versions, the revising version's number, `declared_by` and `at` beside `prior_disposition`; UI-109's item renders them in the plane's words.
accepts-when: a reopened item names who revised the flow and when (moves: "not on it"). NEGATIVE CONTROL: drop the revising fields and the reopener arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-109's worker).

### D-575 · queued — **A CONNECTION'S PAIR SAYS "which nobody has chosen" WHILE A MEMBER'S CHOICE STANDS, AND NEVER STATES A LAPSE: `Store#pairSelection`'s `says` ends that way on every row on `op=connections&id=`/`&sha256=`, including one carrying a current `on_point`; that arm's `on_point` never states a lapse (only the `content=` arm does).** Found by UI-91's worker (01:25Z). — owner RECORD.
order: after D-576, with the connection corrections: the record contradicting itself about a member's act (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — `lapsed`/`why` on `on_point[side]`, and the selection sentence's content; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with REC-122's on-point choice (IC-232, C-74).
depends-on: UI-91.
scope: in `connectionsFor`'s `withChoice` (store.mjs, REC-122 block) check each current choice's ref against resolutions as `connectionGradeForContent` does and carry lapsed/why on `on_point[side]`; pass the choice state into `#pairSelection` so the sentence does not say "nobody has chosen" where a choice exists.
accepts-when: a chosen pair's sentence names the choice, and a choice whose resolution is gone reads lapsed with its why, on both arms (moves: a self-contradicting sentence). NEGATIVE CONTROL: drop the choice state from `#pairSelection` and the chosen-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-91's worker).

### UI-112 · queued — **UI-91's ON-POINT CHOICE WILL BE REFUSED FOR A MENTION READ ON SEVERAL PAGES ONCE D-454 LANDS: D-454 makes `op=connectionchoose` take `occurrence=` and refuse C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED when a string read at several places is named alone, and UI-91's `docChooseOnPoint` (both integrated, neither on main) sends no occurrence.** Found at SCHEDULER #21's reading of both reports (01:38Z). — owner UI.
order: after D-575, with the connection surface: a chooser that the plane refuses for the common case offers an act that fails (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads D-454's I3: `occurrence=`, `occurrences` on the act and on connections&content= mentions).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with D-454's occurrence key and REC-122's choice (C-74).
depends-on: UI-91, D-454.
scope: the chooser offers each OCCURRENCE (page and position, from the plane's `occurrences`), sends `occurrence=` on the act, renders C-74.4 in its DEC-49 words, and shows a pre-D-454 choice the plane states AMBIGUOUS as it says.
accepts-when: a subject string read on three pages offers three choices and each is accepted (moves: C-74.4 on every multi-page mention). NEGATIVE CONTROL: omit `occurrence=` and the three-page arm reads C-74.4, failing by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

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

### UI-104 · queued — **THE ACTION PAGE OFFERS NO RISK-TIER REVISION AND SHOWS NO TIER HISTORY.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), the surface half of REC-214. — owner UI.
order: directly after REC-214, which it consumes (BOB #33: plane, then UI) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 consumer (REC-214's IC).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20) (folded by REC-214).
depends-on: REC-214.
scope: on the action page, beside UI-90's governing-laws list, the revise act (tier plus a required reason, words from the plane's vocabulary) and the tier history as the plane states it.
accepts-when: against a real-plane suite a member revises a tier with a reason and the history renders "revised from … to …: <reason>"; the act cannot submit without a reason (the measured failure it moves: no surface for the act). NEGATIVE CONTROL: submit without a reason and the required-reason arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### REC-215 · queued — **NO MACHINE PROPOSAL OF A RISK TIER EXISTS, LABELLED AND APART FROM THE MEMBER'S VALUE.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), item 3: `actionriskpropose` (not yet an op), REC-195's shape. — owner RECORD.
order: after UI-104 (BOB #33: after (1), the proposal half last) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a proposal read labelled machine work; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with REC-195's labelled-proposal shape and BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: REC-214.
scope: a proposal of a tier with its basis, stored apart from the member's value and labelled machine work; it never sets the tier.
accepts-when: a proposal reads labelled machine work and the tier is unchanged until a member acts (the measured failure it moves: no proposal read). NEGATIVE CONTROL: let the proposal write the tier and the "the tier is the member's" arm fails by name.
context: REC-216's audit (F1-F4, SCHEDULER #19's worker) and BOB #33's 21:55Z ruling: every `*propose` op is NON_ACTS in `bio-plane/src/affordances.mjs` (REC-195's reasoning) and a member states the value with their own act; so this proposal is a machine READ, never a member act in ACTS, and its surface SHOWS it beside the member's tier with no adopt control, as UI-102 (a2d974aa) does for the governing-laws proposal.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

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

### D-542 · queued — **THE DEC-49 GUARD SCORES A CODE "OUT OF REACH" WHEN ITS SURFACE RENDERS THE PLANE'S OWN WORDS: `check-refusal-codes.mjs` puts a code in reach only by R1 (a catalogue row), R2 (a code LITERAL in `app.html`) or R3 (a harness mock), so UI-68's review-copy surface, which renders `detail` and keys on no literal, left TEN of D-448's eleven codes scored out of reach for a day while a member could meet them.** Found by D-448's worker (branch `land/worker/D-448` 5eadd905: the Publication front matter and `13.review-copy` both carry "D-542 carries that fix (reach-by-op) and is NOT BUILT"). — owner M0 (the guard).
order: after D-550, with the DEC-49 instrument rows behind the product rows: it makes a false gate result (a reachable code read as unreachable) visible, which is product quality, but nothing regresses today since D-448 catalogues all eleven (Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a guard's verdict is a statement about its walk, never about the member), with DEC-49's rule that every refusal a member can meet carries a canned translation.
depends-on: D-448.
scope: teach the walk REACH-BY-OP: a code minted on an op that a surface in `civicos-ui/app.html` calls (by the op's name through its request helpers) is IN REACH whether or not the surface names the code literally; an op no surface calls stays out of reach.
accepts-when: on D-448's parent (origin/main 9f8b69e6's review-copy mints) the walk sorts the ten review-copy codes IN REACH rather than F6 (the measured failure it moves: ten of eleven scored out of reach while UI-68's surface existed). NEGATIVE CONTROL: remove the surface's call to `reviewcopy`, and those codes fall back to out of reach by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-448's worker).

### D-574 · queued — **D-550's ONE-MINT-SITE GUARD (arm G) AND ITS SWEEP WALK ONLY `store.mjs` AND `index.mjs`, so multi-site codes in other plane files go unwatched: AI_RUN_BOUND_UNKNOWN (4 sites, airun.mjs), TEXT_ATTEST_EXTENT (4) and TEXT_ANCHOR_MISSING (4, textchain.mjs), CAL_SIGNAL_SHAPE (3, calibration.mjs), AI_RUN_SKILL_VERSION_UNNAMED (2, skillpack.mjs) among them; the whole of `bio-plane/src` reads 93 candidates, not 62.** Found by D-550's worker (00:42Z). — owner M0 (the guard).
order: after D-542, with the DEC-49 instrument rows behind the product rows: it widens a guard, and no gate result is false today (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads), with DEC-49's one-code-one-condition rule as D-484 settled it.
depends-on: D-550.
scope: widen `MULTI_SITE_FILES` to every `bio-plane/src` file, excluding by stated reason each file that PUBLISHES codes as data rather than minting them (affordances.mjs first); move the ceiling and candidate set to the printed figures.
accepts-when: arm G reads every src mint site and names the codes above (moves: two files walked of the plane's many). NEGATIVE CONTROL: plant a second site of a single-site code in textchain.mjs and arm G fails naming it.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-550's worker).

### D-590 · queued — **FIVE CODES A REAL-PLANE UI SUITE READS IN A PANE CARRY NO CANNED TRANSLATION: BAD_REQUIRED (intent-write #pg-pf), NO_JUSTIFICATION (#rel-pf), NO_KIND (#ent-pf), each one mint site; NOT_CONCERNED (#pg-th-pf) and NO_REASON (conclude-reading, intent-write #pg-dis-pf, queue-peritem), multi-site (NO_REASON at 13 store.mjs sites + 1 affordances.mjs).** Found by D-485's worker (its ARM H/R4, 02:37Z; owed by name in R4_OWED). — owner RECORD.
order: after D-574, with the DEC-49 rows: a member meets these untranslated today (DEC-49), and the two multi-site codes are consolidated first (D-550/D-574's class) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 additive — code, check and translation on each; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: D-485.
scope: a *_CHECKS row (ACT_SHAPE_CHECKS the natural family) with a canned translation for each; consolidate NOT_CONCERNED and NO_REASON behind one mint site first; remove each from R4_OWED and lower CEILING.reachGap in the same landing.
accepts-when: ARM H lists the five as reached AND translated, R4_OWED holds none of them (moves: five untranslated codes in panes). NEGATIVE CONTROL: strip one translation and ARM H fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-485's worker).

### D-560 · queued — **`tools/release-assemble.mjs` (~140) STILL NAMES THE ONE-BUNDLE COMMAND: its NO_ARTIFACT detail says "Run `npm run build` in <dir>/", and the assembler dies on the FIRST missing artifact, so a releaser fixes one bundle at a time.** M0-188's sibling site (found by M0-188's worker, via CONDUCT #20 23:45Z). — owner DIST (the path), M0.
order: after D-548, with the process rows behind the product rows: it costs a release round, not a gate round, and no release is cut until the plan's current scope is done (BOB #34 22:30Z) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a remedy an instrument prints must be the whole remedy), with M0-178's `node tools/bundles.mjs`.
depends-on: M0-188.
scope: the NO_ARTIFACT sentence names `node tools/bundles.mjs`, and the assembler reports every missing artifact before it dies; extend fleetbundles' TOTAL arm to cover it, or give release-assemble its own arm.
accepts-when: with two artifacts missing, one run names both and the one command (the measured failure it moves: one-at-a-time, the wrong command). NEGATIVE CONTROL: restore the old sentence and the arm fails by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by M0-188's worker).

### D-566 · queued — **THREE MORE HAND-KEPT TOOL COPY LISTS SURVIVE M0-170: `bio-plane/test/gates.test.mjs` ~924 (`["coord.mjs", "statepaths.mjs"]`) and `bio-plane/test/status.test.mjs` ~343 and ~565 (`["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"]`, status.mjs's closure), so a new import in the subject breaks its fixture with a false red.** Found by M0-170's worker (F2, 00:14Z). — owner M0.
order: after D-560 (D-569 is running), with the process rows: a false red costs a gate round only when the subject gains an import (M0-170's precedent, Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-170.
scope: replace each list with `moduleClosure({ repo, roots: [<tool>], dynamic: false })` as M0-170 did; state the sweep's reach (literal-name copies only).
accepts-when: an import added to coord.mjs or status.mjs leaves both suites green (moves: three hand lists). NEGATIVE CONTROL: restore one list, add an import, and that suite fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by M0-170's worker).

### D-564 · queued — **SEVEN MORE SUITES END AT THEIR FIRST FIXTURE FAILURE ("FIXTURE ABORTED": dispose and exit), so one broken fixture hides every later section: casesearched, casesign, d150-statement-acknowledgement, d507-statement-ack-translation, rec212-statement-writer, reviewcopy, reviewcopy-inband.** Found by D-548's worker (00:33Z); 3 of 351 suites carry a `block()` recorder. — owner RECORD (the suites).
order: after D-566, with the process rows behind the product rows: it hides later failures for a round but no gate result is false (D-548's precedent) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares).
depends-on: D-548.
scope: adopt `block()` and the per-section tally, -1 for a section that died, a section never reported a FAIL by name, as D-548 did; state the matcher's reach (the literal "FIXTURE ABORTED" only).
accepts-when: in each suite, one section's fixture broken leaves every other section reporting its tally (moves: 7 suites ending at the first failure). NEGATIVE CONTROL: break one fixture per suite and the others still report; disarm the recorder and the foot is missing, by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-548's worker).

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

### DIST-7 · integrated — **THE INSTALLER UPLOADS EVERY GROUP'S PLANE WITH NO `limits`, SO EACH INSTANCE RUNS AT CLOUDFLARE'S DEFAULT SUBREQUEST LIMIT WHATEVER THE SIGNED RELEASE CARRIES.** Re-read on `91bcea6b`: `newgroup/src/index.mjs` `uploadInstall` and `uploadUpdate` hard-code `main_module`, `compatibility_date` and `compatibility_flags` and send no `limits`. — owner DIST.
status: integrated — CONDUCT #20 verified 23:45Z, tip c1cc9d90, for c20-batch28
order: after D-443, the first installer row: a sovereign group's instance runs under a ceiling its own release does not set, so the project's measured subrequest figure does not reach a group (D-54's finding); product (M7), below the record-integrity rows (SCHEDULER #16, 2026-09-23; D-54's worker via CONDUCT #17)
milestone: M7
interface: I5 (the installer's upload metadata); the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` from the signed release as the precedent.
depends-on: D-54 (its `limits.subrequests` and `15.subrequest-limit` claim; on `land/conduct/c17-batch3`).
scope: `uploadInstall` and `uploadUpdate` carry `limits.subrequests` from the signed release, as `compat` is carried, never falling back to the default; at the next cut DIST reads `deploy.mjs`'s `limits.subrequests` read-back line (or its UNDETERMINED line) and moves `15.subrequest-limit` to match. UNDETERMINED: whether `/settings` reports `limits` once set; if not, the read-back uses the script-versions API.
accepts-when: `newgroup`'s wizard suite (`newgroup/test/`) asserts both uploads send the release's `limits.subrequests`, and a release without it is refused by name; `status.mjs --check` 0 drift. NEGATIVE CONTROL: drop `limits` from `uploadUpdate`, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-54's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs DIST`).

### DIST-15 · queued — **THE INSTALLER'S `limits.subrequests` IS PINNED TO `wrangler.jsonc`, NOT CARRIED FROM THE SIGNED RELEASE, and a release without it is not refused: the signed manifest has no plane-limits field.** DIST-7's residue (DIST #6, 23:15Z): adding the field to the fleet statement (`bio-release-fleet/2`) would break every older installer's fleetSig reconstruction and degrade its updates to a plane-only install. — owner DIST.
order: directly after DIST-7's place, in product order; the release-format choice is DIST's own (SCHEDULER #20, 2026-09-24)
milestone: M7
interface: I5 — a release-format change; the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` as the precedent.
depends-on: DIST-7.
scope: DIST decides the format first and records it in Distribution: a SEPARATELY signed plane-limits field, or a `/3` statement older installers are told to skip; then the installer carries `limits.subrequests` from the signed release and refuses a release without it by name.
accepts-when: `newgroup/test/` asserts both uploads send the RELEASE's `limits.subrequests`, a release without it is refused by name, and an older installer still verifies its fleet signature (the measured failure it moves: the value read from `wrangler.jsonc`, not the signed release). NEGATIVE CONTROL: strip the field from a signed release and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs DIST`).

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
scope: stamp the caller's principal server-side in a new column beside `measured_by` (session: its member; bearer: token:<class>), and label `measured_by` on every read as the caller's statement, never the record's attribution.
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

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · queued — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-76 · queued — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-235 · queued — **`op=basisversions` DOES NOT PUBLISH A VERSION'S `kind`: `basisVersions` selects every column of `inquiry_basis_versions`, `kind` among them, and the answer carries no `kind` key, so the same version reads a kind from `op=suggest` and none from here.** — owner RECORD.
order: after D-241 (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §9 (what a SUGGESTION is).
depends-on: none.
scope: `kind` in each version of the answer. Extend `bio-plane/test/suggest.test.mjs`'s cross-op arm. The row's other half (the sweep's reach) is stated in `rec75-sweep.mjs`'s header and is not rowed.
accepts-when: a version with a kind reads the same kind from both ops. NEGATIVE CONTROL: drop the key, and the cross-op arm fails on `kind`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-191 · queued — **A CAPTURE ASSEMBLED FROM REUSED PARTS DOES NOT STATE ITS TEMPORAL SPREAD: `subresources.mjs` records each part's `reused_from_fetched_at`, and nothing computes the earliest and latest fetch instants of the composite.** — owner CAPTURE.
order: after D-235, with the product rows before the M0 group: the record holds the instants and does not say what they add up to (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M2
interface: I5 additive — the manifest's spread; the integrator mints and classifies the IC.
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same" and §"Re-fetch at ratification is mandatory".
depends-on: CAP-14 (`reused_from`, `integrated` on c17-batch5).
scope: the capture manifest (or its reading) states the earliest and latest part-fetch instants of a composite. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a composite whose parts were fetched at two instants states both. NEGATIVE CONTROL: drop the spread, and the two-instant arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-320 · queued — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · queued — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-460 · queued — **DIAGNOSIS: SOME TIER-3 AGENDAS AND MINUTES READ AS GENERIC, AND NOBODY KNOWS WHY.** FW-20 observed it on its walk (M-121, on c18-batch8) without diagnosing it; one suspected cause is that the OCR member transcribes one page per invocation and the plane reads only the first. Its finder's session is archived and no CONTENT-PDF lane is live, so the diagnosis is rowed. — owner CONTENT-PDF.
order: after D-312, with the M2 extraction measurements: a possible silent under-read of scanned civic records, the class CLAUDE.md §2 ranks worst if confirmed (SCHEDULER #17, 2026-09-23; CONDUCT #18 23:51Z)
milestone: M0 (a diagnosis — a measurement)
interface: none until the fix is named.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for FW-20's M-121 walk.
depends-on: FW-20 (`integrated` on c18-batch8; M-121 lists the walk).
scope: take the tier-3 walk documents M-121 names as agendas or minutes that read generic; establish whether the member transcribes one page per invocation and the plane keeps only the first; name the fix, or show the documents are generic.
accepts-when: the named fix (then placed as its own row) or the refutation, recorded with date and instrument. NEGATIVE CONTROL: a two-page scanned fixture whose second page alone carries the agenda heading reads generic before the fix, or the refutation shows it read whole.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-465 · queued — **D-447's FIX COSTS SEARCH TIME: over 2,000 visible documents `q=culvert` takes 210 ms against 74 ms on `main`, because `highlight()` re-tokenises.** Measured by D-447's worker; its size at a real instance is UNDETERMINED. — owner RECORD.
order: with the M0 measurements, behind the product rows: fix only if it matters at real size (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a measurement, then a fix if owed)
interface: none unless the fix is built.
design: `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-447 (`integrated` on c18-d456).
scope: measure the query time at a real instance's size; if it matters, compute per-term tf from an `fts5vocab` instance table instead.
accepts-when: the figure is recorded with date, instrument and size, and either the fix brings it back or the record states why none is owed. NEGATIVE CONTROL: the measurement at 2,000 documents reproduces the 210 ms figure within tolerance.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-473 · queued — **`.odt` AND `.odp` EXPORTS STAY UNDETERMINED FOR BYTE STABILITY: D-351's `.odt` normalisation (strip `xml:id` on `text:list`) was never re-measured over the population, because the worker's pull of CAP-11's scratch captures was refused (PII) and it did not route around the refusal.** — owner CAPTURE.
order: with the M0 measurements, after D-465: widening to `.odt` is a measurement first (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19)
milestone: M0 (a measurement)
interface: none until widened.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for D-351's normalisation.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: re-measure the `.odt` and `.odp` normalisation over a population the lane may read (never by routing around a refusal); widen only on the figure.
accepts-when: the stability figure is recorded with date, instrument and population, and the formats are widened or stated undetermined on it. NEGATIVE CONTROL: skip the `xml:id` strip, and the re-fetch pair reads unstable by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #19 (D-472's worker F2, via CONDUCT #20 20:14Z): the monitor's cry-wolf survives for Google Docs and Slides (.odt, .odp) because only .ods has a measured container digest; land the .odt normalisation with an ODF_EVIDENTIARY_MEASURED row once measured, and name a census target for .odp.

### D-515 · queued — **NO COMMITTED FIXTURE IS A PDF WHERE TIER 2 GENUINELY DECODES FEWER GLYPHS THAN TIER 1, so D-501's degradation arm is proved on synthetic input only.** Found by D-501's worker (F1). — owner CONTENT-PDF.
order: after D-473, with the measurements: the case is covered synthetically; a real page raises the evidence, not the behaviour (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:51Z)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-501.
scope: search the bytes already held for a page where tier 2 decodes fewer glyphs; commit one as a fixture and drive D-501's award over it, or record with date and instrument that the corpus holds none.
accepts-when: a real page's award keeps tier 1 by glyph count, or the search is recorded empty. NEGATIVE CONTROL: award by raw length and the real-page arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### FW-24 · queued — **THE WHOLE-CORPUS DOCUMENT-TYPE CENSUS IS NOW TAKEABLE AND NOT TAKEN: Legistar answered during FW-22, so the census can run over the whole corpus (`M032_HALVES=bucket`) instead of the sampled halves.** FW-22's worker (finding 3, via CONDUCT #20 21:21Z). — owner FRAMEWORK.
order: after D-515, with the measurements: EXTRACTION-BREADTH §2's rule that a count comes before any reader (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none — a measurement.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 "Readers beyond three — the rule, and the order".
depends-on: FW-22.
scope: run the census instrument over the whole corpus with `M032_HALVES=bucket`, FINANCIAL REPORT counted apart (FW-22); record each class's count with interval, date and instrument; restate §2's order if the counts move it.
accepts-when: MEASUREMENTS carries the whole-corpus counts with their instrument and date (the measured failure it moves: the order resting on sampled halves only). NEGATIVE CONTROL: fold FINANCIAL REPORT back into budget and the class count moves, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs FW`).

### DIST-14 · queued — **THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap applying.** FW-23's worker (finding 2, via CONDUCT #20 21:52Z). — owner DIST.
order: after FW-24, with the measurements: the deciding figure needs a deployed plane, so it follows FW-23's landing and DIST's next deploy (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the bound moves (the integrator classifies).
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32", with `docs/development/VERIFICATION.md` (measure; do not recall; a vendor's documentation is their claim).
depends-on: FW-23.
scope: on the DEPLOYED plane, read a CSV just over 20 MiB in the scratch namespace (store=scratch named, counters witnessed before and after), record memory outcome and time in `measurements/<id>.md`; if it fails, set the bound from the measured ceiling and state it at the site. Costs 1 of 166 keys.
accepts-when: the measurement is recorded with date, instrument and the build that answered, and the bound is either confirmed or re-set from it (the measured failure it moves: a bound resting on a node heap figure and a vendor claim). NEGATIVE CONTROL: a CSV just under the bound reads clean, so a failure above it is attributable to size.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs DIST`).

### D-321 · queued — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-346 · queued — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-204 · queued — **AN OFFICE DOCUMENT'S ENVELOPE IS EXTRACTED AND NEVER CONTENT: tracked-change authors, comments, core properties and speaker notes are emitted by the format parsers and never projected, indexed or searchable (`textUnitsFor`: *"SPEAKER NOTES ARE NOT INDEXED"*).** Under DEC-5, surface it all. — owner RECORD.
order: with the M2 extraction rows, after D-346 (SCHEDULER #17, 2026-09-23; D-124's first row, placed under a new id because D-124 names two rows)
milestone: M2
interface: I2/I5 — a NINTH extent kind, `envelope`, with an item-kind field; the integrator mints the IC for the extent census.
design: `docs/development/OFFICE-FORMATS.md` "THE ENVELOPE AS CONTENT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): the extent carries the capture's grade, `cited_as` distinguishes it, and it is indexed LABELLED as envelope.
depends-on: none.
scope: the `envelope` extent and its projection; index each item labelled as its kind. Extend `bio-plane/test/search.test.mjs`.
accepts-when: a passage search finds a tracked-change author and speaker-note text, each labelled as envelope. NEGATIVE CONTROL: drop the envelope arm, and the tracked-change-author search returns 0 by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-375 · queued — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · queued — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · queued — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · queued — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
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

### REC-206 · queued — **AN AGENDA ITEM'S MEMBERSHIP IN A FILE EXISTS ONLY AS RECT CO-LOCATION AN INSTRUMENT INFERS: tier-1 text units carry no position and a LinkRecord carries no anchor text.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *DESIGN IT — I2 gains position on tier-1 text units (page and rect) and anchor text plus a rect on LinkRecord; membership is DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-246; I2 PROVISIONAL, RECORD after PDF, as ruled (SCHEDULER #17, 2026-09-23, LED-7 S17-4; CPDF-3's worker)
milestone: M2
interface: I2 PROVISIONAL — positions and anchors; I3 — the derived membership; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (BOB folds it), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: CPDF-3 (`integrated`).
scope: the PDF member emits page and rect per tier-1 unit and anchor text plus rect per link; the plane derives item-to-file membership by containment, labelled and graded inferred.
accepts-when: an agenda's item-to-file membership reads derived, labelled machine work, graded inferred. NEGATIVE CONTROL: present it as a publisher link, and the labelling arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-340 · queued — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · queued — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · queued — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · queued — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

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
scope: move the D-263 PROVENANCE block (~2.4 KB, marked at both ends) to `docs/archive/`, and move `bio-plane/test/register-grammar.test.mjs`'s pin to the archived copy in the same landing. ALSO (M0-169's design gap, via CONDUCT #20 19:37Z): one sentence in "The battery runs every suite"'s Incomplete sections — a fixture's carry-list is DERIVED, once (`moduleclosure.mjs`, `gatedeps.mjs`).
accepts-when: VERIFICATION.md reads ≥ 2 KB under budget and register-grammar stays green (the measured failure it moves: 7 B of headroom). NEGATIVE CONTROL: point the pin back at VERIFICATION.md and register-grammar fails by name.
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
