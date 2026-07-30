# Document profiles: recognising what kind of document this is

Written 2026-07-30 at Bob's direction, after the incremental handling of each
newly-discovered variation began spreading through the capture path in an
unstructured way. This is the design of record for that structure. Implemented as
`docprofile/`, with `civicos-ui/test/docprofile.test.mjs` as its harness.

## The two requirements this serves

Both are Bob's and both are about credibility rather than tidiness.

**A rendition must be perceived as rendering meaningfully the same as the document
does on its host.** A member will present portions of a capture as evidence, so
the system has to be able to say that the evidentiary portions of the rendition
are the same as the original, and be believed when it says so.

**The system must recognise when something meaningful in the evidentiary portions
has changed, and equally must recognise when it has NOT.** Both directions carry
weight. A checker that only ever reports change is as useless as one that only
ever reports stability, and the second is worse because it is quiet.

Neither requirement can be met by comparing bytes.

## What the measurements showed

Three real sources, three fundamentally different situations. This is the evidence
the architecture rests on, and it is small: it is what a few days of fetching real
pages produced, and it will grow.

| Source | Stack | Two fetches | What that means |
| --- | --- | --- | --- |
| `oakland.legistar.com` | ASP.NET WebForms on IIS | 114,177 bytes differ, 31.4% of the document, all of it inside `__VIEWSTATE` and `__EVENTVALIDATION`; the other 68.6% byte-identical | byte comparison reports change on every fetch and therefore reports nothing |
| `oaklandside.org` | WordPress behind nginx | BYTE-IDENTICAL | churn is a property of the stack, not of the web; a handler looking for mechanism here finds none and should say none |
| `oaklandca.opengov.com` | client-rendered app | stable bytes, zero anchors, no prose | a technically perfect capture that is evidentially worthless, and the only failure here that is silent |

A single comparison rule cannot serve those three. Before this package each was
handled by another branch bolted onto the capture path.

Two further facts that shaped the design rather than the table:

- Legistar emits **no** `<nav>`, `<header>` or `<footer>`. Its furniture is ASP.NET
  control divs with generated ids. A rule that guessed at those ids normalised 303
  bytes of a 369KB page and looked like it worked. What the page does carry is one
  `<main role="main">`.
- Two Legistar fetches minutes apart differed in total LENGTH as well, which
  viewstate does not explain: the calendar's own content varies with the date
  window. That is a real change and no rule may hide it.

## The model: three kinds of region

Everything follows from separating these, and the middle one is the correction over
the single "stable digest" that preceded this package.

- **Evidentiary.** The substance. What a member would quote, cite, or put in front
  of a council. Change here is meaningful and must be reported.
- **Presentational.** Furniture: navigation, headers, footers, related-story rails.
  Really on the page, captured, rendered, and not the document's claim about its own
  subject. Change here is recorded and is not a change to the evidence.
- **Mechanical.** Per-render machinery: page state, security tokens, session
  identifiers, cache stamps, ad and analytics slots. Varies on every fetch by
  design. Never evidence, never a change, never shown.

## Three digests, not one

- **identity** — sha256 of the raw bytes. The capture's name. Never changes, never
  recomputed, and raw bytes are never rewritten.
- **rendition** — mechanical normalised. Answers "would this look the same?", which
  is what the fidelity claim rests on.
- **evidentiary** — presentational and mechanical normalised. Answers "has the
  substance changed?", which is what monitoring asks.

Five verdicts fall out, and the harness asserts all of them on real bytes:
`identical`, `unchanged` (only machinery moved), `restyled` (furniture moved),
`changed` (the substance differs), `undetermined` (no handler was confident enough
to say).

## Two rule shapes, and the boundary is the better one

A handler may list furniture with patterns, or it may declare the document's own
**boundary** and have everything outside it become presentational in one stroke.
The boundary is preferred, and the Legistar measurement is why: listing furniture
means anything not listed silently counts as substance, while naming the boundary
means anything outside it counts as furniture. The boundary is one structural fact
that is either present or not, rather than a growing catalogue of theme-specific
guesses.

A boundary that does not match normalises **nothing** and records that it missed.
A boundary that missed must never be read as a document with no content.

## The failure asymmetry, which governs every default

Reporting a change that did not happen costs a member some attention. Failing to
report a change that did happen puts a false claim in the record, and it is
discovered, if ever, by the party the claim is aimed at.

So:

- An unrecognised document gets the **conservative** handler, which claims almost
  nothing is machinery and nothing at all is decoration, and therefore reports any
  difference. Its only rules are definitional rather than observed: a nonce that
  repeated would not be a nonce.
- A handler applied without **certainty** declines to say the substance is
  unchanged, returning `undetermined`. Certainty requires a signal only that stack
  emits; a header alone is `likely`, because ASP.NET also serves pages with no
  viewstate and confident application of the wrong framework's rules is how a
  handler starts hiding what it should report.
- A family or rule is added only on **measurement**. A careless rule hides a real
  change, which is the only failure mode here that matters.
- The noise the conservative handler makes is a **signal**: a source that reports
  change on every fetch is a source that needs measuring and a handler writing, and
  the pattern is visible rather than buried.

## Fidelity has levels

The predecessor refused a render when any part was missing, reasoning that a page
missing a piece is a different page. That is right for a stylesheet and wrong for a
footer icon, and the requirement is that a rendition be perceived as MEANINGFULLY
the same, which is a claim about the document rather than about every byte of
furniture.

- **faithful** — everything render-critical is held.
- **degraded** — only decoration is missing. The evidence renders and the shortfall
  is named on screen rather than hidden.
- **insufficient** — something render-critical is missing. The render is refused,
  because showing it would misrepresent the source.

Which parts are critical is the handler's judgment. Under the conservative handler
every missing part is critical, which is correct in ignorance.

## The handlers today

| Handler | Recognised by | Notes |
| --- | --- | --- |
| `client_rendered` | an empty mount point, a hydration payload, or structurally: a body with no links and no prose | asked FIRST, because any stack can serve a shell and profiling a shell as a page with content is the silent failure. Carries a member-facing warning that the capture is a frame and not the figures. |
| `aspnet_webforms` | `__VIEWSTATE` (certain); ASP.NET headers alone (likely) | page state, anti-forgery, session, ad slots as mechanical; `<main>` as the boundary. Distinguishes an index from a record by address, because a changed index is expected and a changed record is not. |
| `wordpress` | generator tag, or two of `wp-content` / `wp-includes` / `wp-json` / block markup | nonces, `?ver=` asset stamps, ad slots as mechanical. Furniture only on an ARTICLE: on a listing the articles are the substance, and normalising them would report every front page as unchanged forever. |
| `conservative` | never matches; reached by falling through | the safe default described above. |

Adding a stack means adding a file and a line in `registry.mjs`. That is the point
of the exercise; the alternative was another branch inside the capture path.

## Monitoring is a different contract per kind

RULED by Bob, 2026-07-30: `index` versus `record` changes monitoring's BEHAVIOUR,
not just which normalisation rules apply.

A Legistar calendar changing is the calendar working. A `LegislationDetail.aspx`
page changing is an event somebody should look at. Applying the record's contract
to an index is what turns monitoring into noise on exactly the pages BIO watches
most closely: an index moves whenever the body it indexes does anything, so a
substance check on it fires constantly, gets ignored, and then the one change that
mattered arrives in the same undifferentiated stream as the rest.

The inversion is the point. On a record, the question is "did the substance
change", and the answer is normally no. On an index, the substance IS a list, and
the question is not whether the list changed but what happened to its members.

| Contract | Applies to | What it watches |
| --- | --- | --- |
| `substance` | a record, an article, a page | the evidentiary digest. Any change is an event; furniture moving is a notice. |
| `membership` | an index whose handler can read its entries | which entries are present, and whether each entry's own line still says what it said |
| `unmonitorable` | a client-rendered shell | nothing, and it says so. A substance check here reports "unchanged" forever while the figures behind it move freely, which is the system lying quietly. |

Membership events, ordered so a report leads with the worst thing rather than the
first thing:

- **removed**, an EVENT. A public record that was on a public list and is no longer
  on it. This is close to the reason this system exists, and no substance check
  anywhere would surface it: not on the index, where it is one row among dozens,
  and not on the record's own page, which may still serve perfectly.
- **altered**, an EVENT. A meeting cancelled, an item's status moved, or a document
  swapped under a heading that did not move. The last is the quiet substitution, and
  it is caught because a Legistar row's digest folds in its `View.ashx` document
  links: an agenda replaced under an unchanged title changes nothing else on the
  page.
- **added**, ROUTINE. The list doing its job.

MEASURED on `oakland.legistar.com/Calendar.aspx`: 41 table rows inside `<main>`, 18
carrying a stable `MeetingDetail.aspx?ID=`, and five of those eighteen reading
CANCELLED. A member watching the Rules and Legislation Committee needs that
cancellation. It is an alteration to one row of an index, and it is invisible to
both of the checks that existed before this.

Two safeguards, both of them about the negative case:

- **Confirmation is reported positively.** On an index, "all 18 entries are still
  present and unchanged" is a STRONGER claim than the same words about a record,
  precisely because an index is expected to move, and it is a dated first-party
  statement that nothing was quietly withdrawn. A diff normally throws that half
  away; this does not.
- **Extraction failure claims nothing.** A member reader that finds no entries has
  failed; it has not discovered an empty list. Reporting a mass removal there would
  be catastrophic and confident, so a failed read returns `null` for changed and
  says it is degraded.

An index whose handler cannot read entries falls back to a substance check and
declares itself `degraded`, so the gap is visible rather than passing as coverage.

## Where this runs

`docprofile/` is the canonical package and the plane should import it directly when
monitoring, `op=audit`'s duplicate sweep and `resolveLinks`' bracket arm adopt it,
rather than growing a second copy. `civicos-ui/app.html` carries a flattened copy
because its runtime is one self-contained file; `tools/bundle-docprofile.mjs`
produces it and `check-semantics.mjs` fails the build on any drift between the two.

## Known gaps

- **The plane has not adopted it.** Monitoring, the duplicate sweep and the
  contemporaneity bracket arm still compare raw hashes (D-60).
- **A shell is recognised and not yet captured properly.** Per the standing ruling
  JS-rendered content IS the content and must be captured at the same grade as the
  rest of the document, which needs the browser-rendering path. Until then this
  package's job on a shell is to say what was collected is a frame.
- **Only three stacks are measured.** Drupal, plain static HTML, Squarespace,
  Granicus, CivicPlus and NextRequest are all in Oakland's orbit and none has been
  fetched twice and diffed. Every one of them is a handler waiting for evidence.
- **Per-document-kind handling is coarse.** `index` versus `record` is a useful
  distinction that currently only changes which rules apply; it should also change
  monitoring's expectations, because a changed index is news and a changed record is
  an event.
