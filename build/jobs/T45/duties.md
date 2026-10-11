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
