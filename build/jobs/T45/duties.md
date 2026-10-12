# duties (T45)

**Status** · session_01MExgKh3t6GhAjLf6UXLh5d · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

The edge `duties` → `local-facts` is not in `modules.json` (duties' `uses` lacks `local-facts`), but R5 and R30 read `local-facts.governingView` (its R12), and duties' Private Uses lists it ("(T45) `local-facts`: `governingView` …"). The draft (lower §3) said "no new edge", and K2787's edges did not add it. Today duties reaches local-facts only through an injected `factOf` (no import), so the edge never existed.

My best reading: BOB adds `local-facts` to duties' `uses` (positions 55 → 63, earlier; the architecture check refuses the import without it). I build R5 with `dutiesOf(host)` reaching `localFactsOf(host).governingView()` by default (an injected `view`/`localFacts` still wins, as the other services), and carry on; my architecture check will name this import until the edge is added.

## J2 · QUESTION

Three seams in R30 (`proposeFromResponse`), each with my best reading; I am building on these readings now.

(1) **No public read of a `standards` R9 proposal by id.** R30's `adopt` refusal `DUTY_SOURCE_NOT_HELD` "until that proposal is adopted as a standard, the duty then naming the adopted standard" needs to know, from a proposal id (`STDP-…`), whether it was adopted and as which `STD-`. standards' `#proposalAnswer` (`adoption: {standard, by, at}`) is private; `standard_proposals`/`standard_adoptions` are no read contract; no op reads one. Best reading: standards (T45-7, running) gains a read, e.g. `standardProposalRead({proposal, viewer}) → {ok, proposal: {id, kind, …, adoption: null | {standard, by, at}}}` or `NO_SUCH_PROPOSAL`-style refusal, and I call it. Until it exists I fail closed: an unreadable proposal is `DUTY_SOURCE_NOT_HELD` at adopt, and `proposeFromResponse` refuses a `standardProposal` it cannot read with standards' own no-such-proposal answer. Please route the read to STANDARDS #12 (or rule another way).

(2) **"The profile's deadline for that office" (required_response).** No `deadlines` entry names an obligor office (jurisdictions R26, R75): the first profile's `grand_jury_body_comment` (90 days) and `grand_jury_officer_comment` (60 days) differ only by `rule` and citation, both `owed_by: body`, `starts: third_party`, `starter: {role, body}` the grand jury. Best reading: the candidates are the governing view's deadlines with `owed_by: "body"` whose `starter.body` (or `role`) names the report's issuer (the court standard's `issuer` / `owner.label`); one candidate is used; several leave the due date `undetermined` naming them, unless the caller names one with an optional `rule` argument (an addition to R30's signature, so yours to word); none: `undetermined`, never defaulted. 

(3) **The trigger of a required response.** R30 names none. Best reading: trigger `date`, the report's date as the court standard holds it (`period.from`, the member's declared date of the report, never a capture time, R9); with no such date the proposal is refused `UNKNOWN_TRIGGER` naming why. (Alternative: an `event` trigger on the report's issuance event, which the caller would have to name.)

Mine, done (recorded in my record, told as done): a held `standard` whose kind is not `commitment` (for a promise), or a `court` source whose standard is not of kind `court`, is refused `UNKNOWN_SOURCE_KIND` as R1 refuses a court source today; the duty records `response: {kind, quote}` so R31 answers each duty's `response_kind` (following and plan-work R13 read "promise-duties").

## J3 · COMPLETE

**T45-8 applied on `job/T45/duties`** (a59b0bb16c, cd42fffb0a, 01a1633624, 7fbe8c65ac; tranche/T45 merged in, last after B5). Files: `bio-plane/src/duties/{index,checks,schema,vocab}.mjs`, `bio-plane/test/m/duties/{response.test.mjs (new),contract.test.mjs}`; nothing outside my paths.

**Read whole by me (P20; K2730):** `build/requirements/duties.md`; all four files of `src/duties/` and all eight files of `test/m/duties/`; T45-8 and the plan's Rules at the opening (rule 4); K2780, K2781, K2787; `BIO_Action_v0_2.md` §3 and §4 (rules 1–21, among them 6, 16, 17); `draft-T45-lower.md` §2, §3, §4, §9, §10, §11; layer 5's contract; later standards R54 and local-facts' `governingView` as merged. The used modules' public parts (18 requirement files, Public parts whole, and jurisdictions' R74–R87) were read in full by one helper agent in this session. It was given my entries and their readers (`following`, `plan-work`) and wrote a digest citing each section (mechanics §17 (3)); its three seams became J2.

**Entries applied**
- **R30** `proposeFromResponse` (op `dutyfromresponse`).
  - Refusals in order: `DUTY_MEMBER_ACT_ONLY` (unstamped); `RESPONSE_KIND_UNKNOWN`; `ARISING_IN_NOT_HELD`; content's extent refusals (`NO_SHA`, `CAPTURE_NOT_HELD`, `NO_EXTENT`, `EXTENT_NOT_IN_CAPTURE`); `RESPONSE_EXTENT_NOT_IN`; `PROMISE_DATE_UNREAD` (R28's whole-date reader, words kept as written); then the source, and R1/R29 through `propose`.
  - A promise is a proposal of a commitment-basis duty, its trigger the quote's date, resting on a held `commitment` standard or a `standards` R9 proposal. That proposal is read through `standards` R54 `standardProposalRead`. An unadopted or unreadable one is `DUTY_SOURCE_NOT_HELD` at adopt (and at declare), and the adopted duty names the standard, with `adopted_from`.
  - A required response rests on the `court` standard. Its trigger is `date` = `period.from` (else `UNKNOWN_TRIGGER`). Its due date is chosen on each read from the governing view: the `owed_by: "body"` deadline whose `starter` names the report's issuer. One is used; several or none are undetermined, naming them. An optional `rule` names one (else `BAD_TIME`) (K2806).
  - The duty records `response: {kind, quote: {capture_sha, extent, content_id}}`.
- **R31** `dutiesArisingIn` (op `dutiesarising`): adopted, unwithdrawn duties by `arising_in` (new index `duties_arising`), each with its occurrences as R9 derives them, its `response_kind`, and `all_met` as the text says (`met_late` counts). `partial: true` when sight left any out. It writes nothing and never throws.
- **R5** `view()` reads `local-facts.governingView()` (the real one on the host by default, through the edge K2804), unwrapping combine's `{ok, view}`. A view that does not combine, or throws, is `{}`. The test runs over the real local-facts: a confirmed group rule governs, a drafted one does not, a withdrawn one leaves.
- **R23** a `stated` basis (action-clocks R7's spelling, `STATED_BASIS` exported) is refused `UNKNOWN_BASIS_KIND`, naming the four kinds and saying it is a deadline on the group. The control is `commitment` accepted.

**BOB's readings applied:** K2804 (edge), K2806 (J2's three).

**Mine, done (told as done):**
- New rows C-133.40–44: `BAD_CAPTURES` (R31's 1–200 capture ids; R31 names no code for a malformed list), `RESPONSE_KIND_UNKNOWN`, `RESPONSE_EXTENT_NOT_IN`, `PROMISE_DATE_UNREAD`, `DUTY_SOURCE_NOT_HELD`.
- A non-`commitment` standard or proposal under a promise is `UNKNOWN_SOURCE_KIND`.
- `#policyWords` is generalised into `#extentWords`, shared by R28 and R30.

**Deferred:** nothing.

**Found in other modules / owed (REPORT):**
- `op-declarations`, `op-grades` and `affordances`: the two new ops `dutyfromresponse` (a proposal; the machine may call it, R2) and `dutiesarising` (a read) need their spec, grade and `OP_STAMPS`. They now redden op-declarations R53, op-grades R12 and affordances' T33 R19/R6 ("duties: dutyfromresponse has no spec").
- The UX stream: translations of C-133.40–44.
- Row census: those five rows await promotion's stamp (rule 4 (2)).
- `following`/`plan-work` may filter R31's answer by `response_kind === "promise"`. `following` reads with `class:daemon` (sees all).
- The plane bundle is stale (rule 4 (5)).

**Tests**
- duties: 62 pass, 0 fail (`node --test bio-plane/test/m/duties/`).
- Every module that uses duties (its 19 test paths plus `test/system/migrate-released.test.mjs`) on the merged tree: 2019 tests, 2013 pass, 6 fail.
  - The 3 op-spec reds above are owed.
  - Local-facts' new ops (`ruledraft`…) have no spec or route: 2 reds (control-plane R11/R5; filing-templates/local-facts R1/R12/R24), not mine.
  - `roster.test.mjs` R5/R9 is accepted red rule 4 (9).
  - `migrate-released` alone: 1 pass, 0 fail.

**Checks** (from civicos-process, on the merged head):
- format: 153 modules, 152 requirements files; 0 failures
- architecture: 13 product files, 53 relative imports; 0 failures
- coverage: 31 of 31 live requirement ids named by a test; 0 failures
- ownership: 7 files changed by duties between tranche/T45 and HEAD; 0 failures

Size (session_01MExgKh3t6GhAjLf6UXLh5d): test runs 14, module lines 2192
