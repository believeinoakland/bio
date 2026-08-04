# Measurements

Every number this project's limits and defaults rest on, with the date and the
instrument. Kept in one place because the alternative is what happened before it
existed: a cap of 40 written from a guess, a comment claiming "50 on this
account" that was a guess about somebody else's infrastructure, and a CPU worry
based on a documented figure that turned out not to be what was enforced.

**The rule this file exists to enforce: a number in the source that nobody
measured is a guess wearing a constant's clothes.** If a value here goes stale,
re-run the instrument named beside it rather than reasoning about it.

All figures below are from the deployed plane on biosmoke7 (Workers **Free**,
account `20b533579290b9b93168345edd3b7f72`) unless stated otherwise. Measured
against plane 0.36.0 through 0.45.0 on 2026-07-29; a later session has shipped
UI work on top of these releases without changing the plane figures.

## Runtime limits

| What | Measured | How | Date |
| --- | --- | --- | --- |
| External subrequests per invocation | **51** including the primary fetch | `op=acquire` hit it; recorded by calibration as `capture_limits` | 2026-07-29 |
| Cloudflare-service subrequests | not hit; documented as 1,000 | R2 and Durable Object calls draw on a separate budget, which is why calibration reads 51 while the code counts 42 fetches | 2026-07-29 |
| CPU | **40,000,000 reference iterations fit**; killed during the next 2,000,000 | `op=cpuprobe`, 20 steps completed, HTTP 503 `error code: 1102`, checkpoint trail intact | 2026-07-29 |

The CPU line is the one to read carefully. The documented Workers Free figure is
10ms of CPU per invocation, and forty million modular multiplications is not 10ms
of anything. **What is enforced on this account is not the documented number.**
That is the entire argument for this file.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution as a timing-attack defence, so a first attempt to measure
per-segment compute reported zero for every segment of every real capture. Any
millisecond figure produced inside a Worker is a fabrication. Consumption is
counted in work; the ceiling is measured in reference iterations. See
`bio-plane/src/cpu.mjs`.

## What real pages cost

Captured through the deployed plane with `subresources: true`.

| Page | Subresources discovered | Links | Compute calls | Bytes worked |
| --- | --- | --- | --- | --- |
| `www.acgov.org/` | 54 | — | 42 | 1.96 MB |
| `oakland.legistar.com/Calendar.aspx` | 309 | 116 | 42 | 1.96 MB |
| `oaklandside.org/` | 566 | 128 | 49 | 16.97 MB |
| `oaklandca.opengov.com/` | 142 | **0** | — | — |

**The original cap of 40 truncated every one of these**, including the 54-item
page, which needed one more fetch than it had. A capture rendered from 39 of 634
parts is a capture of a fraction of a page.

**OpenGov's zero is not an error.** It serves a JS-rendered shell with no anchors
in its HTML. See `CLIENT-RENDERED.md`.

## What the policy removes, and what it does not

Measured on the same pages after 0.37.0 and 0.40.0.

| Page | Collapsed srcset | Third-party | Furniture | Reused from the host record |
| --- | --- | --- | --- | --- |
| `oaklandside.org/` | **383 of 566** | 12 | 8 | 30 on a later pass |
| `oakland.legistar.com/Calendar.aspx` | 0 | 4 | **0** | 51 by the fifth pass |
| `www.acgov.org/` | 0 | 3 | 2 | — |

**srcset collapse does the heavy lifting**: two thirds of a news front page's
references were duplicate renditions of the same pictures.

**Structural furniture detection barely fires on the sites that matter**: zero on
Legistar, two on acgov. Municipal sites write `<div class="nav">`, not `<nav>`.
The mechanism is correct on well-structured HTML and finds almost nothing on
legacy CMSes, which is why recurrence-based detection across a host exists.

## Convergence: what reuse and continuation buy

Five successive passes over two Legistar pages, each pass costing the same
subrequest budget.

```
pass 1  Calendar     fetched 42  reused  0  outstanding 232
pass 3  Calendar     fetched 69  reused 31  outstanding 168
pass 5  Calendar     fetched 89  reused 51  outstanding 118
pass 5  Legislation  fetched 80  reused 60  outstanding   0   COMPLETE
```

A heavy first capture, driven across ticks by continuation on a page with no
prior host record:

```
oaklandside.org  tick 1  fetched  75  reused 30  outstanding 72
                 tick 2  fetched 120  reused  0  outstanding 26
                 tick 3  fetched 146  reused  0  outstanding  0   COMPLETE
```

Reuse needs **two distinct documents** on a host before an asset counts as the
site's, so it does nothing until the third capture of a host. That is by design
and it is why pass 1 and pass 2 show zero.

## Link partitions on real pages

| Page | Links | anchor | deferred | refused | resolving to a held capture | naming an element |
| --- | --- | --- | --- | --- | --- | --- |
| `oaklandside.org/` | 128 | 1 | 126 | 0 | 1 | — |
| `oakland.legistar.com/Calendar.aspx` | 116 | 27 | 81 | 6 | 2 | 26 |

**Every resolved verdict came back `undetermined`**, which is the shape the
design predicted and the reason the verdict is three-valued rather than boolean.

**One resource on the Legistar calendar was cited 28 different ways.** Under the
pre-0.43.0 key, which dropped the fragment, those 28 citations were one row.

## Source access

See `SOURCE-ACCESS.md` for the full picture. In short: `www.oaklandca.gov`
returns 403 to the plane on every path including `robots.txt`, while
`data.oaklandca.gov`, `oaklandca.opengov.com`, `oakland.legistar.com`,
`oaklandside.org` and `www.acgov.org` all answer normally.

## Instruments

- `op=runtime` — measured work, the CPU probe trail, and the subrequest ceiling
- `op=cpuprobe` — walks into the CPU ceiling, checkpointing durably per step
- `op=acquire` with `subresources: true` — every per-page figure above
- `op=links&capture=<sha>` — link partitions and verdicts

## User-agent admission at www.oaklandca.gov

Measured **2026-07-30**, thread CAPTURE. Instrument: `curl` from Anthropic
container egress against
`/Government/Finance-Budget/Financial-Reporting/Annual-Comprehensive-Financial-Reports`,
varying ONLY the `User-Agent` header. Eight consecutive requests per string, all
eight identical every time. Verdicts re-confirmed on a second unrelated path, so
the result follows the agent and not the URL.

| User-agent | Result |
| --- | --- |
| `CivicOS/0.46.0 (+https://…; instance biosmoke7; acquire)` | **200** |
| `Mozilla/5.0 (compatible; Google-Apps-Script; beanserver; …)` | 200 |
| `curl/8.x`, `Wget/1.21.4`, `python-requests/2.31.0` | 200 |
| `bio-acquire`, `bio-monitor` (what the plane sent) | **403** |
| no user-agent header at all | 403 |
| `archive.org_bot`, `ia_archiver` | 403 |
| `Googlebot`, `Bingbot`, `GPTBot` | 403 |

**The discriminator is the user-agent, not the source address.** One network
produced both outcomes. The `server-timing: ak_p` header identifies Akamai, so
this is Akamai Bot Manager. Some unrecognised tokens pass (`xyzzy-fetch`,
`biofetch`) and others do not (`foobarbaz`, `wombat`); that is Akamai's internal
scoring and **no rule for it was established**.

Full narrative, including the robots.txt findings, in `SOURCE-ACCESS.md`.

### Documents reachable with the honest agent, same date

| Path | Status | Bytes |
| --- | --- | --- |
| `/Government/Finance-Budget/Financial-Reporting/Annual-Comprehensive-Financial-Reports` | 200 | 213,375 |
| `/Government/Finance-Budget/Budget/Fiscal-Year-2025-2027-Budget` | 200 | 207,476 |
| `/Government/Finance-Budget/Financial-Reporting/Revenue-Expenditure-Reports` | 200 | 208,172 |
| `/files/…/2024-city-of-oakland-acfr_final-121324.pdf` | 200 | 5,995,747 |
| `/files/…/fy25-27-adopted-budget-book-full-10.10.25-reduced-size.pdf` | 200 | 32,521,404 |
| `/robots.txt` | 200 | 11,687 |

## Live instance census, biosmoke7

Read **2026-07-30** via `op=list` and `op=file` with a read-only member token.

**31 bundles**, not 30: 8 `verified`, 1 `elevated` (`PROB-2026-0001`), 1
`forming` (`PROJ-2026-0001`), the rest `collected`.

Primary source hosts across 28 readable provenance documents (archive.org
locators excluded):

| Count | Host |
| --- | --- |
| 6 | `www.oaklandca.gov` |
| 5 | `oakland.legistar1.com` |
| 4 | `webapi.legistar.com` |
| 2 | `oaklandca.opengov.com` |
| 2 | `cao-94612.s3.us-west-2.amazonaws.com` |
| 1 each | `oakland.legistar.com`, `www.oaklandauditor.com`, `data.oaklandca.gov`, `scocal.stanford.edu` |

The six `www.oaklandca.gov` bundles were all retrieved **2026-07-19** by the
Apps Script data plane, method `daemon-fetch`, each carrying an RFC3161 timestamp
token from `freetsa.org`. Every one also carries a `save-page-now` attestation
attempt and **all of those failed** (four HTTP 302, one 520).

## Chosen constants, ours and not measured

Recorded here so they are visibly chosen and revisable rather than mistaken for
findings.

| Value | Setting | Why |
| --- | --- | --- |
| Archive fallback threshold | 3 consecutive direct failures, or 14 days | see `AUTHORITY-AND-TRUST.md` |
| Archive request appetite | 24/min | matches the stricter of two third-party figures; ours because it is our appetite |

Third-party rate-limit figures for archive.org, with their sources, are in
`ARCHIVE-FALLBACK.md`. They are **not** measurements of ours.

## User-agent component ladder at www.oaklandca.gov: the discriminator is the CONTACT URL

Measured **2026-07-30**, thread CAPTURE. Instrument: `scripts/ua-probe.mjs`
(built this session as D-94's mechanical probe), Anthropic container egress,
against the ACFR path, two requests per rung, human-paced, agent varied alone,
ONE component removed per rung so a transition names the component that
mattered. Boundary re-confirmed on a second unrelated path (2/2 each side), so
the result follows the component and not the URL.

| Rung | User-agent | Results |
| --- | --- | --- |
| full | `CivicOS/0.46.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)` | 200, 200 |
| no purpose | `CivicOS/0.46.0 (+…/bio; instance biosmoke7)` | 200, 200 |
| no instance | `CivicOS/0.46.0 (+…/bio; acquire)` | 200, 200 |
| **no contact** | `CivicOS/0.46.0 (instance biosmoke7; acquire)` | **403, 403** |
| bare comment | `CivicOS/0.46.0 (acquire)` | 403, 403 |
| product+version | `CivicOS/0.46.0` | 403, 403 |
| product only | `CivicOS` | 403, 403 |
| historic token | `bio-acquire` | 403, 403 |
| no header | (none) | 403, 403 |

Purpose and instance are droppable; **removing the contact URL flips admission
uniformly and everything below stays refused.** Within OUR component space the
contact URL is the admission key, which makes the resolvable-URL fix shipped in
0.46.0 load-bearing rather than cosmetic. This refines, and does not overturn,
the earlier note that Akamai's unknown-token scoring follows no rule we
established: `curl/8.x` still passes with no contact URL at all, so the
crawler-shaped `(+url)` heuristic applies to strings scored as bots, not to
strings recognised as tools.

### Contact-URL variant, measured before it shipped

Same date, same instrument as the SOURCE-ACCESS table: the agent string with
`+https://github.com/believeinoakland/bio` (which resolves) in place of
`+https://believeinoakland.org/civicos` (which 404s while the registrar
transfer is pending), 8/8 200 on the ACFR path and 4/4 on a second path.
Shipped in 0.46.0.

## Workers-egress admission at www.oaklandca.gov, deployed 0.46.0

Measured **2026-07-30**, the first runs of the honest agent from Cloudflare
egress rather than a test container, through `op=acquire` on the deployed
plane, scratch store. **Eleven captures: ten admitted, one `SOURCE_REFUSED`
403** on the second of the only cold back-to-back pair; six paced (2 to 5s
gaps) and three warmed burst requests thereafter all 200. Intermittent and
burst-shaped, not categorical. Pre-governor: 0.46.0 carried no pacing, which
is D-95's case observed live; the governor shipped in 0.47.0 the same day.

## Chosen constants: the per-host governor (D-95, 0.47.0)

Ours, not measured, recorded so they are visibly chosen and revisable. In
`Store.GOVERNOR`, overridable per host via `governorconfig` and per instance
via the `GOVERNOR_APPETITE_PER_MIN` binding.

| Value | Setting | Why |
| --- | --- | --- |
| Default appetite | 12/min per host | one document fetch every ~5s on average; half the archive appetite, cautious for municipal hosts |
| Burst allowance | 3 tokens | a person opens a few tabs; a loop opens forty |
| Grant jitter | 0.6 to 1.5 × base gap | a person is not a metronome |
| 429 cool-off | max(Retry-After, 60s × 2^n), cap 1h | the counterparty names its capacity; we never undercut it |
| 403/503 cool-off | 30s × 2^n, cap 30min | refusal is discovered capacity |
| Escalation reset | one success zeroes n | mirrors the counterparty relenting |
| Subresource stagger | 50 to 250ms jittered | a browser's connection pool, riding the primary admission |

## What could NOT be measured this session, and why

Recorded so the gap is visible rather than silently inherited as fact.

**Wayback CDX, from the Anthropic container egress: unreachable.**
`web.archive.org` returns HTTP 403 `x-block-reason: hostname_blocked` at the
egress proxy on 2026-07-30, so none of the CDX claims in `ARCHIVE-FALLBACK.md`
(record field shape, the `id_` raw-bytes suffix, `warc/revisit` dedup records,
the 24-to-60/min ceilings) were verified. The PLANE'S egress is Cloudflare and
does reach the archive; the archive session should measure these through the
deployed plane before building on them. See D-105.

## docprofile bundling into the plane (D-60 adoption feasibility)

Measured **2026-07-30**, thread CAPTURE, container esbuild matching the plane's
build flags (`--bundle --format=esm --platform=neutral`).

| Fact | Value |
| --- | --- |
| docprofile raw source | 37,709 bytes, 5 files (index + 4 handlers) |
| External dependencies | none; zero npm, zero `node:` builtins, only internal cross-imports |
| Bundled + tree-shaken cost | **5,436 bytes** (the plane needs only `digests`/`compare`; the rest drops) |
| Plane bundle headroom | ~2,490 KB under the 3 MB Free-worker limit |
| Import path from `bio-plane/src/` | `../../docprofile/index.mjs` (docprofile is at repo root, outside bio-plane/) |
| Installer impact | none: `build` inlines all imports into one self-contained `dist/bio-plane.bundled.mjs`, so the cross-directory location matters only at BUILD time, and a clean checkout has `docprofile/` present |

Conclusion: the "measure bundle size before believing it fits" instruction on
D-60 is discharged. It fits with room to spare, and the bundle-size concern that
genuinely applies to `unpdf` (D-91) does not apply to docprofile. D-60 adoption
is a build task.

## A live governor config standing on the instance (NOT our measurement)

Set **2026-07-30** while verifying D-103's ops on the deployed 0.48.0:
`web.archive.org` has a configured appetite of **24/min** on the live instance.

Recorded here so it is not mistaken for a finding. 24/min is the LOW end of the
third-party rate figures quoted in `ARCHIVE-FALLBACK.md`, which are the
archive's own published/observed numbers and not something this project
measured. D-105 stands: those figures remain unverified from our side, because
`web.archive.org` was unreachable from this session's egress. The value is a
deliberately conservative placeholder chosen so that if the archive session
begins fetching before it re-measures, it does so under the gentlest figure
available rather than the most permissive. Re-set it from OUR OWN measurement,
through the plane's Cloudflare egress, once D-105 is discharged.

## 2026-07-31, thread CAPTURE: the release-verification window (D-108)

Instrument: `curl` against `biosmoke7.believeinoakland.workers.dev`, immediately
after `scripts/deploy.mjs` reported `verified: deployed bytes are hash-identical
to the signed asset` for 0.49.0.

| What was asked | Answer | Served by |
| --- | --- | --- |
| `GET /version` | `0.49.0` | the Worker |
| `op=audit` | 31/31, 0 findings | the Durable Object |
| `op=tasks` (new in 0.49.0) | `unknown op: tasks` | the Durable Object |
| `op=tasks`, minutes later, no redeploy | `ok: true` | the Durable Object |

NOT a measurement of the window's LENGTH, which was not instrumented: the two
`op=tasks` calls were minutes apart with other work between them, so all that is
established is that the window is longer than one request and shorter than a few
minutes. Anyone who needs the actual figure should poll at a known interval; do
not quote a duration from this row, because there is not one here.

What IS established, and is the point: `op=audit` answered CLEANLY from the same
Durable Object that did not yet know `op=tasks`. So a post-deploy verification
consisting of `/version` plus `op=audit` passes completely while a newly shipped
op is still unreachable. Both checks were run this session and both were green
while the release's headline feature answered `unknown op`.

The error string is what located it: `unknown op: tasks` with the colon is the
Durable Object's format (`store.mjs`), and `unknown op` without one is the
control plane's (`index.mjs`). A fresh Worker isolate had the new `OPS` table and
forwarded correctly; the DO behind it was still running the 0.48.0 route map.

## 2026-07-31, thread CAPTURE: the signing path, re-verified from scratch

The out-of-tree Node SSHSIG reconstruction was rebuilt at `/tmp/sign/sign.mjs`
from `src/signpage.mjs`'s own algorithm and checked against stock
`ssh-keygen 9.6p1` before any signature was trusted. One positive control and
FOUR negative controls, all as expected:

| Control | Result |
| --- | --- |
| the 0.49.0 signature over the 0.49.0 asset | `Good "bio-release" signature` |
| one appended line of bytes | `incorrect signature`, rc 255 |
| namespace `bio-ratify` instead of `bio-release` | `namespace does not match`, rc 255 |
| the same message signed with the RATIFICATION key | refused, rc 255 |
| the 0.48.0 signature against the 0.49.0 bytes | `incorrect signature`, rc 255 |

The reconstructed signer's public half is byte-identical to the entry already in
the installer's `ARMED_SIGNERS`, which is the property that matters: the
installer will accept what this produced without any change to its trust set.

Separately, the 0.48.0 release already in `release/` was verified the same way
before being relied on, which is what established that D-106's blast radius was
narrower than the item claimed: the repository fallback was sound throughout.

## 2026-07-31, thread CAPTURE: the Wayback CDX claims, MEASURED at last (D-105)

Instrument: `op=acquire` against the deployed plane at 0.49.0, `store=scratch`,
which fetches through the plane's OWN Cloudflare egress and records the full
transport block. THREE requests to archive.org in total, deliberately.

First, D-105's premise reconfirmed: `https://web.archive.org/...` from the
Anthropic container returns `Blocked by egress policy`. The plane reaches it
fine. So every figure below is the plane's observation, which is the egress that
will actually run the fallback.

### The record shape: CONFIRMED, field for field

`GET /cdx/search/cdx?url=www.oaklandca.gov&limit=5&output=json` → HTTP 200,
690 bytes, `application/json`.

    [["urlkey","timestamp","original","mimetype","statuscode","digest","length"],
     ["gov,oaklandca)/","20180427023914","http://www.oaklandca.gov:80/","text/html","200","3BCPSIHGOCJ7ZRCJRSF5DRI5AD7BDOR6","6093"],
     ...]

Every field ARCHIVE-FALLBACK.md asserted is present and shaped as claimed: SURT
urlkey, 14-digit timestamp, original, mimetype, statuscode, base32 SHA-1 digest,
length. One shape detail the document did not state: `output=json` returns an
ARRAY OF ARRAYS with a header row, not an array of objects, so a consumer reads
by column index or maps the header itself.

### The `id_` raw-bytes suffix: CONFIRMED, and Memento comes free

`GET /web/20180427140438id_/https://www.oaklandca.gov/` → HTTP 200, 32,564
bytes, `text/html`, not redirected. Response headers carry:

- `Memento-Datetime: Fri, 27 Apr 2018 14:04:38 GMT`
- `Link: <https://www.oaklandca.gov/>; rel="original", <.../timemap/link/...>; rel=...`
- `x-archive-src: ARCHIVEIT-10368-ONE_TIME-JOB568626-...warc.gz`

This matters for the "build to Memento, not to Wayback" ruling: the standard
Memento headers are ALREADY on the replay response, so the archive datetime and
the original URL can be read from RFC 7089 fields rather than from a
Wayback-specific API. The recommendation is not merely principled; it is the
lower-effort path. `x-archive-src` additionally NAMES the WARC the bytes came
from, which is a provenance field worth recording even though the WARC itself is
not retrievable.

### THREE CORRECTIONS to ARCHIVE-FALLBACK.md as written

**1. CDX `length` is not the body length, and must never be used as one.** The
CDX row for the capture fetched above declares `length` 6255. The `id_` fetch of
that exact capture returned 32,564 bytes. `length` is the compressed WARC record
size, not the size of what a client receives. The design document says "a content
digest and the length" without saying which, which invites exactly the wrong use.
It is not a fixity check and not a size check on our bytes.

**2. A shared digest can mean an EMPTY body, not identical content.** Two rows in
the five-row sample carry the same digest, `3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ`.
Computed here: that is base32(SHA-1(empty)), verified against
`da39a3ee5e6b4b0d3255bfef95601890afd80709`. Both rows are 301 redirects with
empty bodies. So digest equality across two CDX rows is NOT by itself evidence
that a document was unchanged: for empty-bodied responses it is trivially and
meaninglessly equal. This bears directly on the best part of the design, the
`warc/revisit` record read as "a dated, third-party, identical-bytes observation
across an interval". That reading holds ONLY where the body is non-empty and the
status is a real 200. A revisit on an empty body attests nothing about content.
Any contemporaneity claim built on archive digests must exclude the empty digest
explicitly, the same way the governor excludes its own refusals from failures.

**3. The status code in a CDX row is the ORIGIN's, and rows are mostly not 200.**
Three of five sampled rows are usable captures; two are 301s with nothing in
them. A fallback that takes "the most recent CDX row" without filtering on
`statuscode == 200` and a non-empty digest will fetch a redirect and record it as
the document.

### What was deliberately NOT measured

**The rate limits.** ARCHIVE-FALLBACK.md's 24-to-60 per minute figures and the
one-hour firewall block on ignored 429s remain THIRD-PARTY DESCRIPTION and are
still unverified. Establishing them requires provoking a 429, and the documented
consequence of getting that wrong is an hour-long block applied to Cloudflare's
shared egress, which would fall on unrelated people who have no idea we exist.
That is not a cost this project gets to impose to satisfy its own curiosity. The
figures stay flagged as theirs, our appetite stays the conservative 24/min, and
their capacity is discovered the way D-95 already discovers capacity: by being
refused in the ordinary course of polite use, and recording it.

## 2026-07-31, thread CAPTURE: the fallback thresholds are CHOSEN (D-104)

`Store.FALLBACK_CONSECUTIVE_FAILURES = 3` and `Store.FALLBACK_STALE_DAYS = 14`
are the RULED numbers from `AUTHORITY-AND-TRUST.md`, recorded here so they have
one home and are not restated inline. They are a DECISION about when the record
is entitled to go elsewhere, not an observation of anything, and nothing should
present them as measured.

What IS measured, live on biosmoke7 0.50.0 in `store=scratch`:

| Attempt | Outcome recorded | consecutive_failures | eligible |
| --- | --- | --- | --- |
| `raw.githubusercontent.com/.../README.md` → 200 | `success` | 0 | false |
| `raw.githubusercontent.com/.../no-such-file-d104.txt` → 404 | `source_refused`, status 404 | 1 | false |

Both through the real `op=acquire` path, so what is verified is the wiring and
not a unit fixture. The counter keys on the FULL normalised address
(`normalizeAddress`, an absolute URL), not a host-and-path abbreviation; a read
using the abbreviated form answers `known: false`, which is correct and worth
knowing before someone reads it as a missing record.

The exclusion itself is asserted in `test/reachability.test.mjs` rather than
live, because provoking a governed refusal against a real host means driving
that host to its cool-off, which is the opposite of the point. Negative control:
letting a governed refusal fall through to the failure path breaks 17 of the 34
assertions.

## 2026-07-31, thread CAPTURE: the archive fallback, live on 0.51.0

The governor's own accounting, read back from `biosmoke7` (`store=scratch`)
after the fallback's decision half ran for the first time:

| host | appetite_per_min | granted | refused_total | cooloff_until |
| --- | --- | --- | --- | --- |
| `web.archive.org` | **24** | 3 | 0 | 0 |
| `raw.githubusercontent.com` | null (instance default) | 5 | 0 | 0 |

The 24 is THEIRS, not ours to have measured: it is the figure the maintained
`wayback` client reduced to, recorded in ARCHIVE-FALLBACK.md as a third-party
number, and applied here as a per-host override the moment the plane first
speaks to that host. Three requests granted, none refused, no cool-off. Nothing
about their actual ceiling was learned and nothing was meant to be (D-111).

The eligibility fence, live and in order:

| Step | Result |
| --- | --- |
| `archivelookup` on a healthy address | `NOT_ELIGIBLE`, basis "no attempt on this address has ever been recorded" |
| one origin 404 | `consecutive_failures: 1`, not eligible |
| three origin 404s | `consecutive_failures: 3`, eligible, basis names count and threshold |
| `archivelookup` once eligible | ran, governed, and refused `NO_USABLE_CAPTURE` |

That last refusal is the correct answer and worth stating plainly: the address
driven to eligibility was a file that never existed in the repository, so the
Internet Archive holds nothing for it and the index came back empty. The path
was exercised end to end — fence, governor, CDX query, parse, selection — and it
declined to invent a document. What was NOT exercised live is a SUCCESSFUL
selection, because arranging one would mean finding an address that is both
genuinely unreachable and archived, and manufacturing that state means either
faking failures or hammering a real source until it refuses. Neither is worth
doing. The selection logic is instead asserted against the VERBATIM CDX response
measured earlier the same day, 37 assertions in `test/cdx.test.mjs`, including
that the newest row overall (a 301) is not chosen while the newest usable row is.

## 2026-07-31, thread CAPTURE: the deploy rollout is NOT atomic (D-108, corrected)

The 0.49.0 observation was diagnosed as a Durable Object lagging behind a fresh
Worker isolate. Deploying 0.52.0 showed that diagnosis was too narrow.

Immediately after `deploy.mjs` reported byte-identical verification:

| Call | Answer | Which build answered |
| --- | --- | --- |
| `GET /version` | `0.51.0` | the PREVIOUS release |
| `op=acquire` with `via=archive.org` (fence test) | `BAD_LOCATOR` | previous |
| same, with a forged `locator` | `SOURCE_REFUSED` | previous, and it FETCHED the forged locator |
| `op=acquire` with `via=archive.org` on an eligible address | `NO_USABLE_CAPTURE` | the NEW build |

Those four calls were seconds apart in one shell command. The third and fourth
disagree about which code is running, so the rollout is **per-isolate and not
atomic**: a verification issued in that window can receive a MIX of old and new
answers, and reach opposite conclusions about the same property depending on
which request landed where.

A poll of `/version` answered `0.52.0` on its first attempt moments later, and
three subsequent rounds of the same two probes were stable and correct. So the
window is short. It is also long enough to have produced, in this session, a
result that looked exactly like a security defect: the forged-locator probe
appeared to show the new code honouring a caller-supplied replay locator, when
in fact the old code was answering.

The lesson is sharper than the original entry's. It is not enough to retry until
a NEW op appears; a verification must confirm it is talking to the new build
before it believes ANY answer, including a failure. `/version` is the cheapest
such confirmation and it was already available and already wrong when first
asked. Nothing here is a fault in `deploy.mjs`, which verified the bytes
correctly both times. The gap is entirely in what is done after it returns.

## 2026-07-31, thread CAPTURE: the fallback thresholds, revised (0.54.0)

`FALLBACK_CONSECUTIVE_FAILURES = 3`, `FALLBACK_STALE_DAYS = 14`,
`FALLBACK_MIN_FAILURES_FOR_AGE = 2`. All CHOSEN, none measured. Bob framed
three-or-fourteen as a suggestion and left the metric to this thread on
2026-07-31; the third constant is the thread's own, and the reason it exists is
that without it a document that failed ONCE and was never retried becomes
eligible after a fortnight. That reads our own monitoring neglect as the source
being unreachable, which is D-104's mistake one level up: an outcome that cost
nothing to produce turning into evidence about somebody else.

All three are overridable per instance at DEPLOY time via bindings of the same
names, never at runtime, exactly as `GOVERNOR_APPETITE_PER_MIN` is. A test
instance can be told to fail fast so the fallback is exercisable without waiting
a fortnight. A runtime op would be a fence any credential holder could lower,
which is not a fence. Bad values fall back to the constants rather than being
obeyed, and the thresholds actually in force are reported in every verdict so a
result can be audited against them rather than against the shipped defaults.

## 2026-07-31, thread CONTENT-PDF: `unpdf` text extraction — bundle size and node-proxy cost (D-91 phase 2, CPDF-1)

The phase-2 go/no-go measurement for PDF text extraction (glyph→Unicode). This
records TWO numbers behind one decision: the bundled size of `unpdf` against the
Free-worker limit (authoritative, ours), and the extraction time on a real
Oakland agenda (a NODE PROXY, explicitly not Worker CPU). It commits no text
extractor; the extractor is CPDF-2, and it is now unblocked — see the
recommendation. Reproduce with `bio-plane/test/unpdf-measure-probe.mjs` (a probe,
not in the battery: it `npm install`s `unpdf` into an OS temp dir and changes
nothing in the repo).

**Instrument.** `unpdf` **1.8.0** (its bundled serverless pdf.js), bundled with
**esbuild 0.25.12** using the plane's OWN `build` flags verbatim —
`--bundle --format=esm --platform=neutral --external:cloudflare:workers
--external:node:*`, unminified, exactly as `npm run build` ships. Installed into a
scratch temp dir OUTSIDE the repo; `unpdf` was never added to `bio-plane/package.json`
or the shipped bundle. Plane baseline built the same turn from `src/index.mjs` at
version 0.55.0. Extraction timed on this machine (node v26.5.0, darwin/arm64).

### Bundle size — OURS, and it FITS

`unpdf`'s default text path does `await import("unpdf/pdfjs")`; under a single
`--outfile` (no code-splitting, as the plane builds) esbuild inlines that into one
file, so the figure below is the whole shippable payload, not a stub.

| Bundle | Raw | Gzip-9 |
| --- | --- | --- |
| plane baseline (0.55.0, `src/index.mjs`) | 668,027 B (0.637 MB) | 181,887 B (0.173 MB) |
| tiny module importing `unpdf` text entry (`extractText`+`getDocumentProxy`) | 2,379,943 B (2.270 MB) | 566,998 B (0.541 MB) |
| **plane + unpdf, additive** | **3,047,970 B (2.907 MB)** | **747,680 B (0.713 MB)** |

The additive row is an UPPER BOUND: a single integrated build tree-shares runtime
helpers between the two, so the real combined bundle is no larger than this.

The **3 MB Free-worker limit is the VENDOR'S figure** (Cloudflare Workers, Free
plan), and Cloudflare states it is applied **after gzip**. Against that:

- **Headroom with `unpdf`, gzip: 2,398,048 B (2.287 MB) under the limit.** The
  compressed plane+unpdf is 0.713 MB — under a quarter of the 3 MB budget.
- Even on the most conservative reading (comparing the RAW uncompressed payload to
  3 MB, which is stricter than the vendor's own rule), it still fits: 2.907 MB
  raw, **97,758 B (0.093 MB) of raw headroom**. Thin, but positive — and the
  binding limit is the gzip one, where the margin is 2.29 MB.
- Neither bundle is minified (the plane doesn't minify). Minifying would roughly
  halve the raw size and shrink the gzip further, so a large additional safety
  margin is available on demand and was NOT needed to clear the limit.

**Bundle size is therefore NOT the blocker D-91 flagged it might be.** The single
constraint that could have killed text extraction regardless of CPU — busting the
3 MB limit — is cleared, on both the vendor's rule and the stricter raw reading.

### Extraction cost — a NODE PROXY, NOT Worker CPU

Timed on real Oakland City Council agenda PDFs fetched from `oakland.legistar.com`
(`View.ashx?M=A&ID=…`, `application/pdf`, honest CivicOS user-agent) — the exact
document class D-91 exists for. Median of 5 warm runs after a warm-up run:

| Document (source: oakland.legistar.com) | Bytes | Pages | Chars extracted | Median warm | ms/page |
| --- | --- | --- | --- | --- | --- |
| agenda, ID 1423518 | 363,924 | 60 | 108,156 | **43.0 ms** | 0.72 |
| agenda, ID 1425405 | 276,421 | 33 | 60,029 | **28.4 ms** | 0.9 |

Plus a **one-time ~80–100 ms** cost on the first extraction in a process for
pdf.js module load/init (the warm-up run: 100.6 ms and 81.5 ms respectively).
Extracted text is clean and correct (verified: the first agenda's leading text is
the real meeting header, "Tuesday, July 21, 2026 3:30 PM City of Oakland …").

**These milliseconds are a Node figure and MUST NOT be read as Worker CPU.** A
Worker cannot time itself — `Date.now()` is frozen during synchronous execution
(the rule already established for `cpu.mjs` and recorded above) — so any in-Worker
ms would be a fabrication. Nor do these ms map onto the enforced CPU ceiling
recorded above, which is denominated in **reference iterations** (40,000,000 fit,
killed in the next 2,000,000), not milliseconds; the two are not comparable. What
the proxy establishes is only order of magnitude: extracting a typical 30–60-page
agenda is **tens of milliseconds of CPU-bound work on warm node, ~0.7–0.9 ms/page**,
i.e. NOT pathological (not seconds). Linear in pages on this evidence, so a
~250-page ACFR extrapolates to ~180 ms warm on node — still not pathological, but
an EXTRAPOLATION, not a measurement.

**Authoritative Worker CPU vs the enforced ceiling remains UNMEASURED and is a
gated follow-on.** It needs a deployed probe on the plane's own egress (the
`op=pdfstructure` wiring is already a recorded DELEGATION to CAPTURE), timed the
way `op=cpuprobe` walks the ceiling in reference iterations — not node ms. Until
that runs, the CPU dimension is "encouraging on proxy, unconfirmed on Worker."

### Recommendation: GO — pursue `unpdf` text extraction (CPDF-2 unblocked)

The one constraint that would have been decisive regardless of CPU — bundle size
against the 3 MB limit — is cleared with 2.29 MB of gzip headroom, and the
node-proxy extraction cost is modest and not pathological. So phase 2 is worth
building. Two conditions ride with the GO, and both are build/verify items, not
size blockers:

1. **Confirm Worker CPU against the ceiling on a deployed probe before adoption is
   final** — the node ms do not establish it, and a large ACFR/budget PDF (the
   32 MB budget book in the source-access table is the worst case) is where a
   Worker CPU or memory limit, not the bundle, would bite first.
2. **Reconcile with I1's range-reading design.** `unpdf`/pdf.js takes the whole
   document as one `Uint8Array` in memory; I1 §3 was written so a PDF is read in
   ranges and never pulled whole into a Worker. Link-annotation extraction (phase 1)
   honours that; whole-document text extraction as `unpdf` is called here does not.
   That tension is a phase-2 design question (stream/range-feed pdf.js, or cap the
   document size text extraction attempts), not a bundle-size finding.

## 2026-07-31 · Test coverage of the plane, measured for the first time (session BOB)

Instrument: `bio-plane/scripts/coverage.mjs` (`npm run test:coverage`) and
`bio-plane/scripts/battery.mjs` (`npm run test:battery`), both written this session.
Machine: darwin, node v26.5.0, local miniflare/workerd. Method and its limits in
`VERIFICATION.md`.

**Line coverage is NOT reported, and the reason is structural rather than a choice.**
36 of the 42 suites drive the plane through Miniflare, so `src/**` executes inside
WORKERD and not in the node harness. `NODE_V8_COVERAGE` would instrument the test
files and report nothing about `store.mjs`; a line-coverage figure produced that way
would be a fabrication in the same sense as a Worker timing itself (D-56). Coverage is
therefore measured in ops, checks and negative controls.

| figure | measured | exactness |
| --- | --- | --- |
| battery suites | 42 | discovered from `test/`, not a hand-kept list |
| assertions passing | 2,252 · 42/42 green | 33–35s wall clock |
| ops declared in `OPS` | 85 | read out of the module |
| ops reached through the control plane | 81 (95.3%) | **upper bound** — a suite using both routes is credited to the worker |
| ops reached only at the Durable Object | 1 · `sourcereach` | exact · the D-43 class |
| ops unreached by any suite | 3 · `archivelookup`, `linkproject`, `signerlist` | exact |
| checks in the catalog | 51 | |
| checks NAMED by an assertion | 18 (35.3%) | the other 33 execute, but only in the direction that passes |
| suites declaring a negative control | 0 of 42 | the discipline is real and was never recorded |

**Three defects the instruments found on their first run**, all in the test estate
rather than the plane: `bundle.test.mjs` was in `test/` and absent from the
hand-maintained `npm test` chain of 38, so nothing ran it; it read an absolute
container path (`/home/claude/work/...`) and could not run on any other machine; and
once running it failed, because its fixture configured an 11-character probe token
where `livefire` asserts a 16-character floor. The fixture was corrected rather than
the assertion relaxed.

**Do not read 95.3% as a coverage claim.** The two exact buckets are the ones that
mean anything: 3 ops no suite reaches at all, and 1 reached only where a real caller
cannot. The 35.3% check figure is the one with the most room, and it is the S-7
defect class exactly — a check exercised only in the passing direction is a check that
was never proven to fire.

## 2026-07-31 · unpdf inside the plane breaks the battery (CONTENT-PDF, via CONDUCT)

Recorded here because it is the measurement that decided the Worker topology, and it
belongs beside the CPDF-1 bundle figures rather than only in a decision summary.

**Adding `unpdf` to the plane's module graph broke 21 miniflare test suites.** Cause:
a bare npm specifier cannot resolve in un-bundled source, and the suites load
`src/index.mjs` directly rather than the built artifact. So the dependency is not
merely large, it is incompatible with how this project tests — the battery drives
source, and source with a bare specifier does not load.

Taken with CPDF-1's sizes (plane ~0.64 MB alone; plane + unpdf ~2.9 MB raw / 0.71 MB
gzip against the 3 MB Free limit), the three costs of putting unpdf in the plane are:
bundle headroom consumed, whole-document-in-memory extraction sharing the plane's CPU
and 128 MB, and 21 suites unable to load their subject. Isolation into `pdf-worker`
removes all three at once.

**NOT measured, and it gates the design:** whether Workers Free permits a second
script and service bindings at all, and what they cost against the request and CPU
budgets. See D-118. Do not build the Tier 2 path on an assumption here — this is the
same category as the subrequest ceiling before calibration.

## 2026-07-31, thread CONTENT-PDF: Workers Free — a second script, a service binding, and what a cross-Worker call costs (D-118, CPDF-7)

The go/no-go measurement for the whole `pdf-worker` fleet path (I6). D-118 named
three assumptions the tiering rests on and asked them to be MEASURED, not believed:
whether a Free account may run a SECOND Worker script, whether SERVICE BINDINGS
between Workers are available on Free, and what a cross-Worker call costs against
the request / CPU / subrequest budgets. Measured through this project's OWN
Cloudflare account and its own egress, as D-105 was measured rather than believed —
not read out of a pricing page. It commits no shipped code and changes no
dependency. Reproduce with `bio-plane/test/free-tier-fleet-probe.mjs` (a probe, NOT
in the battery: it deploys two throwaway Workers, invokes across the binding, and
tears them down; it reads the token from `.env` and never prints it).

**Instrument.** The Cloudflare REST API (`api.cloudflare.com/client/v4`),
authenticated with the project token from `.env` (`CLOUDFLARE_API_TOKEN`), against
account `20b533579290b9b93168345edd3b7f72` (subdomain `believeinoakland`), on this
machine (node v26.5.0, darwin/arm64). Throwaway script names `cpdf7-probe-callee` /
`cpdf7-probe-caller` / `cpdf7-cpu-probe`, guarded against the three real script
names (`biosmoke7`, `civicos`, `newgroup`) and DELETED after; teardown confirmed by
re-listing scripts (back to exactly those three). No R2 binding was attached to
either throwaway and the real plane, the record and the installer were never
touched.

### The account plan — MEASURED as Workers FREE (not merely assumed)

The token cannot read billing (`/accounts/{a}/subscriptions` and
`/user/subscriptions` both answer HTTP 403 — scope, not plan). So the plan was
established the way a limit is: by provoking the platform. Deploying a throwaway
Worker with `limits.cpu_ms: 50000` in its metadata was **rejected by the vendor's
own API** for THIS account:

> HTTP 400, code 100328 — "CPU limits are not supported for the Free plan. Switch
> to a paid plan … to set CPU limits." (Cloudflare API, verbatim)

That is the platform stating the account's plan against the account itself, which is
a measurement of the plan and not a vendor doc. **This account is on Workers Free.**
It corroborates the vendor's "Free = 10 ms CPU/invocation, not raisable" claim
below: the 10 ms ceiling is real here and cannot be lifted without changing plan.
(The account nonetheless already runs three scripts, a SQLite Durable Object and two
R2 buckets — so all of those are within Free today.)

### What a Free account CAN do — MEASURED on this Free account

| Question (D-118) | Measured result |
| --- | --- |
| Run a SECOND Worker script? | **YES.** `cpdf7-probe-callee` deployed alongside the three existing scripts (four coexisted momentarily; teardown returned to three). |
| A SERVICE BINDING between two Workers? | **YES.** `cpdf7-probe-caller` deployed carrying `{ type: "service", name: "CALLEE", service: "cpdf7-probe-callee" }` and the binding resolved. |
| Does a cross-Worker call actually execute? | **YES.** The caller invoked `env.CALLEE.fetch(...)` and received the callee's JSON marker back, verified end-to-end through the account's own `*.workers.dev` egress. |
| 25 service-binding calls in ONE invocation? | **Succeeded** — a single Free-plan invocation made 25 binding calls without hitting a subrequest wall (Free's per-invocation Cloudflare-service subrequest budget is 1,000; see vendor claims). |

**Cross-Worker call cost (MEASURED, wall-clock, caller-side).** 25 sequential
service-binding calls in one caller invocation: **total 46 ms; median 1 ms; min
1 ms; max 13 ms per call** (the max is the first warm-up call). Measured as the
`Date.now()` delta across each awaited `env.CALLEE.fetch()` — i.e. wall clock across
the binding, NOT Worker CPU. A Worker cannot time its own synchronous CPU
(`Date.now()` is frozen during sync execution, the rule already established for
`cpu.mjs`), so no CPU figure is claimed here; what this establishes is that the
binding hop itself is ~1 ms and not pathological, consistent with the vendor's
"zero added latency" claim. The first call after deploy returned HTTP 500 once
(cold rollout / D-108's per-isolate rollout window); it succeeded on the next
attempt and every attempt after.

### Vendor CLAIMS (Cloudflare docs — THEIRS, labelled, retrieved 2026-07-31)

Not measured except where the row says so. Sources: developers.cloudflare.com
`/workers/platform/limits/`, the service-bindings runtime doc, and the 2026-02-11
subrequests-limit changelog.

| Budget | Free (vendor claim) | Paid (vendor claim) |
| --- | --- | --- |
| Worker scripts / account | 100 | 500 |
| Requests / day | 100,000 | no limit |
| CPU time / invocation | 10 ms, not raisable | 30 s default, up to 5 min |
| Subrequests / invocation | 50 external + 1,000 to Cloudflare services | 10,000 default, configurable to 10M |

- **Service bindings, per Cloudflare:** "there is zero overhead or added latency"
  when calling over a binding — BUT "Each request to a Worker via a Service binding
  counts toward your subrequest limit." So a plane→`pdf-worker` call spends ONE of
  the plane invocation's Cloudflare-service subrequests (budget 1,000 on Free);
  one PDF call per capture is negligible against that.
- **Availability of service bindings on Free** is NOT stated plan-restricted in the
  docs we read; rather than rest on the omission, we MEASURED it works (above).
- The **10 ms CPU / invocation** Free claim is the one corroborated by our own plan
  probe: the API refused to raise it on this account.

### What a Free account CANNOT do (re: this path), and the one thing still open

- **CANNOT raise the per-invocation CPU ceiling above 10 ms** on Free (measured —
  the API said so). This is NOT a binding or second-script limitation; both of
  those work. It is a separate axis, and it is the real remaining Free-plan risk to
  `pdf-worker`, because each Worker — the plane AND `pdf-worker` — independently
  gets only 10 ms CPU. The topology split actually HELPS here (the pdf-worker gets
  its OWN fresh 10 ms rather than sharing the plane's), but whether pdf.js text
  extraction FITS in 10 ms of Worker CPU is UNMEASURED: CPDF-1 timed extraction at
  tens of ms on a warm NODE proxy (43 ms for a 60-page agenda) and explicitly did
  not establish Worker CPU. That question is CPDF-1's already-recorded gated
  follow-on (a deployed CPU-vs-ceiling probe walked in reference iterations, like
  `op=cpuprobe`), and it is out of D-118's scope. It applies to BOTH tiers, so it
  does not favour one over the other.

### Recommendation — the pdf-worker path IS viable on Free; D-118's conditional does NOT fire

D-118 framed the priority hinge conditionally: *if a Free instance cannot reach a
second Worker, Tier 1 (CPDF-4) is not an optimisation but the FLOOR, which raises
CPDF-4 over CPDF-6.* **A Free instance CAN reach a second Worker over a service
binding, cheaply (one subrequest, ~1 ms), and the call executes end-to-end
(measured).** So that conditional does not fire:

- **`pdf-worker` (CPDF-6) is architecturally viable on Free**, which is where most
  installer instances land. It is central, not marginal, on these grounds.
- **Tier 1 (CPDF-4) is NOT forced to be the floor by any binding or second-script
  limitation.** CONDUCT need not re-prioritise CPDF-4 above CPDF-6 on D-118's
  grounds. CPDF-4 retains independent value (a pure-JS in-plane path that needs no
  second Worker at all), but the reason to keep it is now the shared 10 ms CPU
  ceiling, not a broken binding — and that ceiling constrains an in-plane Tier 1
  just as much, so it is not a differentiator.

**D-118 is CLOSED on its own terms** (second script: yes; service bindings: yes;
cost against request/subrequest budgets: one subrequest, ~1 ms, ample headroom).
The residual Free-plan concern — pdf.js against the 10 ms Worker-CPU ceiling — is a
DIFFERENT question that already lives as CPDF-1's gated Worker-CPU follow-on; D-118
does not need to carry it, and narrowing it there avoids a second home for one
number (D-106's class).

## 2026-07-31, thread CONTENT-PDF: Tier-1 text-extraction coverage on real Oakland PDFs, and the Tier-2 sizing (CPDF-5)

The measurement that SIZES Tier 2 (the `unpdf` pdf-worker, CPDF-6): how much of
Oakland's real output the in-plane pure-JS Tier-1 extractor (CPDF-4,
`src/pdfstructure.mjs`) already decodes for free, versus how much genuinely needs
the library. It commits no extractor and changes no shipped code. Reproduce with
`bio-plane/test/tier1-coverage-probe.mjs` (Tier 1) and
`bio-plane/test/tier1-coverage-tier2-oracle.mjs` (Tier 2); neither is in the
battery — they fetch real documents and (the oracle) `npm install`s `unpdf` into
an OS temp dir, touching nothing in the repo.

**Instrument.** 14 real documents fetched 2026-07-31 across Oakland's document
classes, each with its SOURCE URL below, using the honest CivicOS contact-URL
agent that the user-agent ladder above measured admissible at `oaklandca.gov`
(Legistar needs the per-file `GUID`, established this session — a bare
`View.ashx?M=A&ID=` returns a "Confirmation/Gone" HTML interstitial, not the PDF).
Tier 1 is `extractPdfStructure(bytes).text`, run in node v26.5.0. Tier 2 is
`unpdf`'s serverless pdf.js `extractText`, run as an ORACLE on the same bytes so
"the residue is recoverable by the pdf-worker" is MEASURED, not assumed. The
`chars` columns are non-whitespace character counts, comparable across the two
extractors; the `cover` column is Tier 1's decoded chars over decoded +
undecodable code-points (the extractor's own per-region `undetermined[].count`),
an approximate fraction because injected inter-run whitespace is counted as
decoded.

### The corpus and the two-tier outcome (MEASURED)

| # | Document (id) | Class | Source | Size | Pages | T1 chars | T1 cover | T1 outcome | Residue cause | T2 (unpdf) chars | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | acfr-2024 | ACFR | oaklandca.gov `…/annual-comprehensive-financial-reports/2024-city-of-oakland-acfr_final-121324.pdf` | 5.7 MB | 224 | 493,342 | 99.9% | **FULLY** | trivial (583 no-ToUnicode glyphs) | 378,589 | Tier 1 suffices |
| 2 | acfr-2025 | ACFR | oaklandca.gov `…/2025-city-of-oakland-acfr_final-123025.pdf` | 2.2 MB | 224 | 0 | 0% | **nil** | **ENCRYPTED** (permission-only) | ERR* | **Tier 2** |
| 3 | cafr-2003 | ACFR (legacy) | oaklandca.gov `…/2003-comprehensive-annual-financial-report-cafr-audit-pdf.pdf` | 3.2 MB | 167 | 739 | 0.2% | **nil** | fonts w/o /ToUnicode (342k) + undecodable streams | 278,758 | **Tier 2** |
| 4 | budget-adopted-book-full | Budget book | oaklandca.gov `…/2025-2027-budget/fy25-27-adopted-budget-book-full-10.10.25-reduced-size.pdf` | 31 MB | 911 | 1,737,312 | 87.7% | **PARTIAL** | no-ToUnicode 235k + unmapped 6k + width 2k | 1,613,178 | Tier 1 usable; T2 polish |
| 5 | budget-proposed-book | Budget book | oaklandca.gov `…/fy25-27-proposed-budget-book-final-revised-5.8.25-reduce-size.pdf` | 24 MB | 787 | 1,488,694 | 87.7% | **PARTIAL** | unmapped 97k + width 113k | 1,469,930 | Tier 1 usable; T2 polish |
| 6 | budget-transmittal | Budget exhibit | oaklandca.gov `…/2025-2027-transmittal-letter-final.pdf` | 225 KB | 7 | 6,099 | 40.7% | **PARTIAL** | code_width_misaligned 6.7k + unmapped 2.1k | 14,364 | **Tier 2** recovers rest |
| 7 | budget-2pager | Budget exhibit | oaklandca.gov `…/v1-fy25-27-2-pager-oakland-budget-basics-fy-3.pdf` | 3.6 MB | 2 | 0 | — | **nil** | image-only (0 fonts, 2 images) | 0 | **OCR only** |
| 8 | budget-deepdive-presentation | Budget exhibit | oaklandca.gov `…/finance-2025-deep-dive-presentation.pdf` | 6.4 MB | 77 | 35,554 | 98.2% | **FULLY** | trivial | 29,738 | Tier 1 suffices |
| 9 | budget-council-amendments | Budget exhibit | oaklandca.gov `…/city-council-budget-team-amendments.pdf` | 157 KB | 11 | 0 | 0% | **nil** | fonts w/o /ToUnicode (39k) | 17,167 | **Tier 2** |
| 10 | legistar-agenda-1425405 | Agenda packet | oakland.legistar.com `View.ashx?M=A&ID=1425405&GUID=86B6D25C-…` | 270 KB | 33 | 60,865 | 99.9% | **FULLY** | trivial (45 unmapped) | 51,105 | Tier 1 suffices |
| 11 | legistar-agenda-1425401 | Agenda packet | oakland.legistar.com `View.ashx?M=A&ID=1425401&GUID=4CF4BEBA-…` | 172 KB | 9 | 17,182 | 99.8% | **FULLY** | trivial (31 unmapped) | 14,437 | Tier 1 suffices |
| 12 | legistar-staffrep-15579526 | Staff report | oakland.legistar.com `View.ashx?M=F&ID=15579526&GUID=E64EA1B6-…` | 175 KB | 6 | 0 | 0% | **nil** | **ENCRYPTED** (AES-128 permission-only) | 13,012 | **Tier 2** |
| 13 | legistar-attach-15579527 | Staff report | oakland.legistar.com `View.ashx?M=F&ID=15579527&GUID=3C720652-…` | 180 KB | 1 | 41 | 2.1% | **nil** | fonts w/o /ToUnicode + images | 1,792 | **Tier 2** |
| 14 | legistar-attach-15721260 | Staff report | oakland.legistar.com `View.ashx?M=F&ID=15721260&GUID=8F04A287-…` | 918 KB | 4 | 0 | — | **nil** | scanned CCITT fax (0 fonts) | 0 | **OCR only** |

\* acfr-2025 threw `Math.sumPrecise is not a function` inside pdf.js on this
node v26.5.0 + unpdf build — a library/runtime artifact, NOT an encryption
failure (see the caveat below). Its Tier-2 recovery is inferred from doc 12, an
identically permission-only-encrypted PDF that unpdf DID decode to 13,012 clean
chars; it is not separately measured.

### The four buckets (per-document count is the honest sizing)

| Bucket | Count | Documents |
| --- | --- | --- |
| **Tier 1 FULLY** — no Tier 2 needed | 4 / 14 (29%) | acfr-2024, budget-deepdive-presentation, both agenda packets |
| **Tier 1 PARTIAL** — usable text in-plane, Tier 2 a marginal improvement | 3 / 14 (21%) | both budget books (~88%), transmittal (41%) |
| **Tier 2 REQUIRED** — Tier 1 yields ~nil, unpdf recovers real text | 5 / 14 (36%) | acfr-2025, cafr-2003, budget-council-amendments, legistar-staffrep-15579526, legistar-attach-15579527 |
| **Neither tier — OCR only** — no text layer at all | 2 / 14 (14%) | budget-2pager, legistar-attach-15721260 |

A corpus-wide code-point figure (81.9% of code-points decoded by Tier 1) exists
but is dominated by the two multi-hundred-page budget books, so it flatters Tier 1
and is not the sizing number. The per-document buckets are.

### The residue, by cause — read off the extractor's own `undetermined` markers

Tier 1 never guesses: every undecodable run is a `text.undetermined` marker naming
its cause, per the first-class-undetermined doctrine. Summed across the corpus:

| Cause (extractor's `reason`) | Undecodable code-points | Regions | Docs | What Tier 2 does |
| --- | --- | --- | --- | --- |
| `no_tounicode` | 618,517 | 99,596 | 5 | pdf.js maps glyphs by embedded font encoding — RECOVERS (measured) |
| `code_width_misaligned` | 121,375 | 121,375 | 4 | pdf.js reads the true code width — RECOVERS (measured) |
| `unmapped_code` | 105,794 | 105,794 | 6 | pdf.js falls back to font cmap — mostly RECOVERS |
| `cid_font_no_tounicode` | 418 | 194 | 3 | pdf.js CID handling — RECOVERS |
| **ENCRYPTION** (not surfaced as a `reason` — see below) | — | — | 2 | pdf.js decrypts permission-only PDFs transparently — RECOVERS (measured, doc 12) |
| **no text layer** (scanned image) | — (0 markers) | — | 2 | nothing — needs OCR, which neither tier provides |

The two Tier-1-failure causes that actually matter — because they zero out whole
documents, not glyph fringes — are **encryption** and **fonts without /ToUnicode**,
and Tier 2 was MEASURED to fix both.

### Encryption is permission-only, and Tier 1 does not NAME it (an extractor gap)

Docs 2 and 12 carry the Standard Security Handler with permission flags set
(`/P -1340` and `/P -1324`, `/U` and `/O` present, AES-128 on doc 12) and an empty
user password — the ubiquitous municipal "no-copy/no-print but readable by anyone"
pattern. pdf.js opens these with the empty password automatically, which is why the
oracle decoded doc 12 to clean agenda text. **Tier 1 has no decryption at all**, so
it fails on the encrypted streams — but it fails SILENTLY as to cause: it degrades
to a swarm of `objstm_undecodable` / `content_stream_undecodable` NOTES with no
`undetermined` marker saying "encrypted", even though `/Encrypt` is right there in
the trailer. Per "undetermined is first-class and must be STATED," this is a real
gap: a `reason: "encrypted"` marker (readable from the trailer without decrypting
anything) would tell the record WHY, and let the plane route straight to the
pdf-worker instead of emitting hundreds of undifferentiated undecodable notes. A
recommendation for CPDF-4/CPDF-6, not fixed here.

### CAVEATS on the Tier-2 oracle, labelled

- **`Math.sumPrecise is not a function`** was thrown by pdf.js on doc 2 (acfr-2025)
  on this node v26.5.0 + `unpdf` build, and pdf.js emitted it as a warning on most
  other docs while still extracting. This is a library/runtime-compatibility
  artifact of THIS bench, not a property of the document. It is a live warning for
  CPDF-6: **the pdf-worker must pin an `unpdf`/pdf.js version verified to run on the
  Workers runtime** (and the battery's node), or it will hard-fail on exactly the
  documents Tier 1 already cannot read — turning a Tier-2 recovery into a double
  failure. The tiering conclusion does not rest on doc 2; doc 12 carries it.
- The oracle establishes RECOVERABILITY (does real text come out), not Worker CPU
  or memory. pdf.js pulls the whole document into memory — the CPDF-1 gated
  follow-on (Worker CPU vs the 10 ms ceiling, in reference iterations) and I1's
  range-read tension both still stand and are out of CPDF-5's scope.
- 14 documents is a PURPOSIVE sample across classes, not a random draw from the
  live capture stream. It sizes the PROBLEM SHAPE — which classes need which tier —
  rather than a precise corpus percentage.

### Tier-2 sizing conclusion: the pdf-worker is CENTRAL, not marginal

By document CLASS the pattern is sharp and it decides CPDF-6's priority:

- **Agenda packets (Legistar `M=A`): Tier 1 handles them FULLY, free, in-plane.**
  They are generated with /ToUnicode. This is the class the citation graph is
  keyed on, and Tier 1 already reads it.
- **Modern un-encrypted ACFRs and slide decks: Tier 1 FULLY.** Budget BOOKS: Tier 1
  PARTIAL at ~88% — usable for indexing and citation with a stated residue, Tier 2
  an optional polish.
- **Staff reports / attachments (Legistar `M=F`): the HARDEST class — all three
  sampled failed Tier 1**, split across encryption, font-mapping gaps, and a scan.
  This is precisely the agenda→staff-report→exhibit graph CAPTURE exists to build:
  the agenda decodes free, but the substance it links to is where Tier 1 stops.
- **The 2025 ACFR is encrypted.** An entire flagship financial document yields zero
  text without Tier 2 — and no amount of Tier-1 font work touches encryption.

So **CPDF-6 is on the critical path for the record's substance.** ~5/14 (36%) of a
class-spread sample produce essentially NO usable text without the pdf-worker, and
those are not fringe documents — they are an ACFR and the entire encrypted-staff-
report class. Tier 1 (CPDF-4) remains genuinely valuable: it fully serves the
agenda class and modern books/decks (~50% of the sample usable in-plane with no
second Worker), which is real Free-tier savings. But the earlier open question —
whether the fleet member is urgent or marginal — resolves to **urgent/central**.

**One residue neither tier addresses: OCR.** 2/14 (a design-heavy 2-pager rendered
as images, and a scanned CCITT-fax attachment) have no text layer; unpdf returns
zero characters exactly as Tier 1 does. Doctrine already answers what to DO with
them — mark `text-undetermined: no text layer (scanned)` and stop, never invent —
and the extractor already emits nothing rather than mojibake, which is correct.
Whether the record should ever grow a Tier-3 OCR path for this class is a roadmap
question, noted for BOB/CONDUCT, low-urgency: on this sample it is ~14%, and it is
disproportionately the design/scan documents rather than the deliberative record.

## 2026-07-31, thread CONTENT-PDF: unpdf/pdf.js on workerd — the Math.sumPrecise runtime artifact PINNED and VERIFIED (CPDF-6)

The go-decision detail CPDF-5 flagged as a live warning: the pdf-worker "must pin
an unpdf/pdf.js version verified to run on the Workers runtime," because an unpdf
oracle threw `Math.sumPrecise is not a function` inside pdf.js on node v26.5.0.
MEASURED here, not assumed, by probing each runtime directly and then extracting
real text through the member's actual runtime.

**Instrument.** node v26.5.0, darwin/arm64; `miniflare` 4.20260722.0 driving
`workerd` (the same harness the plane's op suites use); `unpdf` **1.8.0** installed
into `pdf-worker/node_modules` and bundled by `pdf-worker/scripts/build.mjs`
(esbuild, the plane's own build flags). The extraction subject is a valid
(xref+trailer) PDF whose one font is base-14 Helvetica / WinAnsiEncoding with NO
`/ToUnicode` — the `no_tounicode` residue class, run THROUGH the built worker
bundle under workerd, i.e. exactly as it will serve.

### `Math.sumPrecise` is present on workerd, absent on node — MEASURED

| Runtime | `typeof Math.sumPrecise` |
| --- | --- |
| node v26.5.0 (the battery harness, and the CPDF-5 oracle) | `undefined` |
| workerd (via miniflare; the pdf-worker's ACTUAL runtime) | `function` |

So the CPDF-5 throw was a NODE artifact, not a Workers one: pdf.js calls a TC39
Stage-4 builtin that node v26.5.0's V8 does not yet expose but workerd's does. The
pdf-worker runs on workerd, where it resolves natively. Belt-and-suspenders, the
worker carries a **guarded** `Math.sumPrecise` polyfill (defined only when the
runtime lacks it), so the extractor is also safe in node and against a future
workerd change — the runtime artifact is neutralised in either direction.

### unpdf 1.8.0 extracts on workerd — MEASURED end-to-end

Through the built bundle under workerd: Tier 1 (in-plane, pure JS) returns
`text.document: ""` with one `no_tounicode` undetermined marker naming the font;
`unpdf` 1.8.0 on the same bytes returns `"Hello Oakland 2026"`. The plane's
`op=pdfstructure`, given the pdf-worker service binding, escalates the same doc and
returns tier-2 text; without the binding it returns tier-1, named, no crash
(pdf-worker-binding.test.mjs, in the battery). **unpdf 1.8.0 is PINNED** (exact, not
`^`) on this evidence.

### Sizes — the member FITS the Free limit alone (corroborates CPDF-1)

| Bundle | Raw | Gzip-9 |
| --- | --- | --- |
| pdf-worker (worker + shared extractor + inlined unpdf 1.8.0) | 2,422,573 B (2.31 MB) | 578,121 B (0.55 MB) |

Under the 3 MB Free gzip limit with ~2.45 MB of headroom, and unpdf stays OUT of
the plane's own bundle entirely — the whole point of the fleet split. Each member
versions and deploys separately (fleet rule 4); the committed bundle is what
deploys and what the battery loads under workerd, as the plane ships its own.

## 2026-08-02, session BOB: what `op=signerlist` tells a surface before the act (RECONCILED §4 Q11)

RECONCILED `§4` Q11 asks whether a surface can know, BEFORE the act, that a MEMBER
holds no active signing key, and states explicitly that it is *"settled by a
MEASUREMENT, not a ruling"*. This is that measurement. **Q11 is settled: YES, with one
divergence that is a defect rather than a limit** (D-158).

**Instrument.** node v26.5.0, darwin/arm64; `miniflare` 4.20260722.0 driving `workerd`,
running the real `bio-plane/src/index.mjs` with the `STORE` Durable Object bound — the
same harness the op suites use, so every answer crosses the op registry, the session
gate and the class gate. Real `ssh-keygen` ed25519 keys and real `bio-ratify`
signatures for the ratify half. Roster: `ruth` and `gus` administrators (4.2 — the
second member of a group must be an administrator), `tam` the first ordinary member.
The probe asserts nothing; it prints what a surface actually receives, because the
question is what CAN be known.

### Reachability — an ordinary member's SESSION reaches it

| Credential | `op=signerlist` |
| --- | --- |
| `ADMIN_TOKEN` | OK |
| `MEMBER_TOKEN` | OK |
| `PROBE_TOKEN` | OK (confined to the `scratch` store) |
| **ordinary member SESSION** (`tam`, `administer: false`) | **OK** |
| admin session | OK |
| unauthenticated | REFUSED |

`signerlist` is `mutating: false`, and the `SESSION_OPS` gate at `index.mjs:1075` is
applied only to MUTATING ops — so a session falls through to the class check and
`classes: ["admin","member","probe"]` admits it. Worth stating because the opposite is
the natural reading of the source: `signerlist` appears in NEITHER `SESSION_OPS.member`
nor `SESSION_OPS.admin`, which looks like a refusal and is not one.

### The payload, and it is not filtered by caller

An ordinary member's session receives the WHOLE list, byte-identical to the
`ADMIN_TOKEN` view — `key_b64`, `member_id`, `comment`, `status`, `added` for every
signer, revoked ones included. `op=whoami` on the same session returns
`member: "tam"`, so the caller can identify its own rows.

**So the pre-flight a surface needs is computable client-side, with no new op:**

    signers.filter(s => s.member_id === me && s.status === "active").length === 0

### The divergence: `signerlist`'s view is NOT the predicate `ratify` enforces

`signerList()` (`store.mjs:5884`) reads the `signers` table alone. `gateFacts()`
(`store.mjs:5920`) joins `members` and requires `s.status='active' AND m.status='active'`.
Two paths, and only one of them is reconciled:

| Case | `signerlist` says | `ratify` with that key | agree? |
| --- | --- | --- | --- |
| member REVOKED after enrolling | `status: "revoked"` | `SIG_UNKNOWN_KEY` | **yes** |
| member INVITED, never enrolled | `status: "active"` | `SIG_UNKNOWN_KEY` | **no** |

The first agrees by CASCADE and not by the join: `memberSet` (`store.mjs:5857-5861`)
explicitly deletes the member's sessions and sets their signers to `revoked`. The
second has no cascade to reconcile it — a member is `status='invited'` until they
enrol (`store.mjs:5731`), and `signerAdd` checks only that the member EXISTS
(`store.mjs:5874`), so a key registered for someone who has never enrolled reads
`active` on one view and is absent from the other. **MEASURED, both rows.** Recorded as
D-158.

**What this means for Q11 and for REC-15.** The surface's answer is RELIABLE in the
direction Q11 asks about — *"you hold no active signing key"* is never a false alarm,
because a key that `signerlist` does not show active is one `ratify` will not accept
either. It is unreliable in the optimistic direction, in exactly one reachable case:
`signerlist` can show an active key for a never-enrolled member whose signature
`ratify` refuses. C-4's instance-wide `NO_SIGNERS` wording in UI-17 is unaffected;
what becomes available is the per-member pre-flight UI-17 could not previously offer.

## 2026-08-02, session BOB: `op=memberlist` hands the cover↔handle PAIRING to non-administrators (D-157)

Found while measuring Q11 and verified separately, because the claim is sharp.

`BIO_Membership_Architecture_v1.md` §3 and `v2` §3, identical wording: **"Pairing. Only
administrators see cover and handle together."** The cover/handle split is the
anti-deanonymisation mechanism — `schema.mjs` on the `members.cover` column: *"the
cover-and-handle split exists precisely so that a roster seized or subpoenaed does not
deanonymise the group."*

Same instrument as above. Covers chosen to look like the ones §3 tells groups to use.

| Credential | store | sees `handle = cover` for every member? |
| --- | --- | --- |
| **ordinary member SESSION** (`administer: false`) | `bio` | **YES — all three** |
| **`MEMBER_TOKEN`** (shared machine credential) | `bio` | **YES — all three** |
| `ADMIN_TOKEN` | `bio` | yes (correct) |
| `PROBE_TOKEN` | `scratch` | no — empty roster |

**`PROBE_TOKEN` is NOT an exposure**, and this is the claim that would have been wrong
without measuring: `scopeFor` (`index.mjs:862`) confines probe class to the `scratch`
namespace, a different Durable Object with its own member table. The credential
`package.json` documents as *"safe to share"* is in fact safe here.

The exposure is `MEMBER_TOKEN` and ordinary member sessions on the LIVE store, and the
source contradicts itself in three places at once — `index.mjs:407` grants
`classes: ["admin","member","probe"]` while the comment eight lines below it says *"All
admin-only: memberlist pairs cover with handle and only administrators see those
together (section 3)"*, and `store.mjs:5810` says *"Every op that reaches this is
admin-only at the control plane."* Neither comment is true. Recorded as D-157.

## 2026-08-03, session BOB: BACKFILL — the OOXML container is readable in workerd with zero dependency (measured 2026-07-31)

Backfilled: this measurement ran 2026-07-31 (session BOB, the office-formats research
turn) and was recorded only in `OFFICE-FORMATS.md`, against the rule that numbers live
HERE with date and instrument. The numbers are unchanged; only their home was wrong.

**Instrument.** miniflare driving workerd (the same harness the plane's op suites
use), probing `DecompressionStream` support directly in the Workers runtime.

- `DecompressionStream` accepts `deflate`, `deflate-raw` AND `gzip` on workerd.
- A `deflate-raw` round trip succeeds: 480 raw bytes → 29 compressed → back intact.

Consequence, as `OFFICE-FORMATS.md` draws it: ZIP members are stored raw-deflated, so
an OOXML container (`.docx`/`.xlsx`/`.pptx`, and ODF's identical shape) is readable in
the plane with ZERO dependency — a central-directory walk plus
`DecompressionStream("deflate-raw")`. The same finding class as `FlateDecode` making
PDF phase 1 dependency-free. The primitive is also already exercised in shipped code:
`pdfstructure.mjs:77` inflates through `DecompressionStream("deflate-raw")` today.

## 2026-08-03, session COFF-6 (measurement worker): the real Oakland office corpus

COFF-6 — the measurement that SETS COFF-2's extraction bound, sizes the evidentiary
extras, and answers the legacy-format and ODF questions empirically. Measurement only;
no product code.

**Instrument.** `tools/measure-office-corpus.py` (python3 stdlib: `zipfile` +
`xml.etree`, magic-bytes classification), run 2026-08-03. Classification is by BYTES,
never extension: `PK\x03\x04` + `[Content_Types].xml` + a flavour part = OOXML;
`PK` + ODF `mimetype` = ODF; `D0 CF 11 E0 A1 B1 1A E1` = OLE2; `PK` with neither =
plain ZIP. The sampling method is part of the instrument (`census` / `sample` /
`analyze` / `control` modes; sample seed 20260803 fixed, so the draw is reproducible).

**What was sampled, exactly.** Two sources in Oakland's orbit, both public, fetched
politely (0.25–0.4 s pacing):

1. **The full population of `www.oaklandca.gov` document assets**: the site's asset
   store is the S3 bucket `cao-94612` (every `oaklandca.gov/files/assets/...` URL
   serves from it) and it answers public `ListObjectsV2`, so the extension, size and
   upload-date census below is the WHOLE population — 43,282 keys, 44 list requests —
   not a sample. From it, a stratified random download of 40 docx + 30 xlsx + 12
   pptx/pptm + 6 doc + 4 xls + 1 ppt (93 files; one 84.8 MB pptx initially skipped by
   a politeness cap, fetched separately), plus a DELIBERATE tail probe: the top-3
   docx and top-3 xlsx by container size.
2. **Oakland Legistar** (`webapi.legistar.com/v1/oakland`): every attachment of the
   200 most-recently-modified matters (715 attachments, census 2026-08-03) and of 50
   matters introduced 2015-H1/2016-H1 (77 attachments).

**Stated bias.** The bucket holds what the city uploaded since the 2018 site
migration (upload dates run 2018-10-31 .. 2025-06-17); older publications are
underrepresented except as re-uploads. Artefact frequencies come from the
oaklandca.gov population only, because Legistar contributes no office files at all
(next paragraph). The random sample is stratified per extension, not size-weighted.

### Format prevalence — the legacy and ODF answers

| Where | pdf | OOXML (docx/xlsx/pptx/pptm) | legacy OLE2 (doc/xls/ppt) | ODF | docm/xlsm | rtf |
| --- | --- | --- | --- | --- | --- | --- |
| oaklandca.gov assets (n=43,282, population) | 27,783 | **762** (389/289/83/1) | **139** (88/50/1) | **0** | 0 | 2 |
| Legistar recent (715 att.) | 715 | 0 | 0 | 0 | 0 | 0 |
| Legistar 2015-16 (77 att.) | 77 | 0 | 0 | 0 | 0 | 0 |

- Legacy OLE2 is **0.32 % of all published assets** and **15.4 % of office documents**
  (139 of 901). It is not fossil traffic: 9 legacy files were uploaded 2024-01 or
  later, the newest 2025-05-21. Legistar's attachment pipeline emits PDF exclusively —
  792 of 792 across both eras.
- **ODF is ZERO in 43,282 assets.** Not one odt/ods/odp.
- All 11 sampled legacy-extension files verified OLE2 by magic; all 82
  OOXML-extension sample files verified OOXML by bytes — in this corpus the extension
  census is trustworthy.

**Recommendation, legacy deferral: KEEP DEFERRED.** 139 mostly-small forms (median
74 KB) do not justify an OLE2 container reader; the honest interim stands — capture
the bytes, record content `undetermined`. The trigger for revisiting should be a
group actually needing one inspected, not prevalence, because prevalence is now
measured and low. **ODF: do not build.** Keep the design accommodation (same
container shape, near-free) but no registry entry until one is observed in the wild.

### Size distribution (population, from the bucket listing) — and the bound

| | n | p50 | p75 | p90 | p95 | p99 | max |
| --- | --- | --- | --- | --- | --- | --- | --- |
| docx | 389 | 44,941 | 149,666 | 444,278 | 909,871 | 6,101,140 | 11,283,396 |
| xlsx | 289 | 64,349 | 247,405 | 1,519,758 | 3,997,853 | 7,739,671 | 15,423,523 |
| pptx | 83 | 3,553,267 | 19,550,530 | 37,770,309 | 51,519,813 | 84,779,570 | 84,779,570 |

**Container size is a bad proxy for extraction cost in BOTH directions** — measured
on the 88 distinct downloaded OOXML files by summing the central directory's declared
uncompressed sizes of the text-bearing parts (document.xml / sheets+sharedStrings /
slides+notesSlides):

- The 84.8 MB pptx (the population maximum) carries only **629,670 bytes** of text
  XML — it is images.
- The 9.1 MB `Stop-Data_2019-Public-Release.xlsx` inflates to **63,593,960 bytes** of
  sheet XML (7.0×); its 2020 sibling to 52,082,120. Worst docx: 16,380,261 (from a
  7.8 MB container).

**Recommended bound (COFF-2 ships this provisionally): 20 MiB (20,971,520 bytes) of
DECLARED UNCOMPRESSED text-part bytes per document**, summed from the ZIP central
directory — which is readable BEFORE any inflation, so the guard costs one directory
walk and cannot be gamed by a compression bomb (the declared size, not the container
size, is what the bound reads; a lying declared size surfaces as an inflation
overrun, which must also abort into the same refusal). Sensitivity, measured:

| bound on text-XML bytes | passes (of 88 measured, incl. the deliberate tail) | excluded |
| --- | --- | --- |
| 16 MiB | 86 | stop-data 2019+2020; 397 KB headroom over worst docx — too thin |
| **20 MiB** | **86** | **stop-data 2019+2020 only; 28 % headroom over worst docx** |
| 64 MiB | 88 | nothing — but a 63.6 MB parse in a 128 MB isolate is the envelope |

Over-bound documents are recorded `text-undetermined` with the reason, never
truncated (OFFICE-FORMATS.md's rule). The two police stop-data workbooks are the
NAMED test cases for raising the bound later: if COFF-2's extractor proves
memory-flat (streaming, not DOM), 64 MiB admits the entire measured population and
they are exactly the documents an accountability group wants. A container-size guard
is NOT recommended as the primary bound — it would pass the 63.6 MB-XML workbook
(9.1 MB container) while refusing the all-images 84.8 MB deck whose text costs 630 KB.

### Per-artefact frequency (random sample: 40 docx, 30 xlsx, 12 pptx/pptm)

| artefact | docx | xlsx | pptx |
| --- | --- | --- | --- |
| external hyperlinks (≥1) | 17/40 (total 195; max 64/doc) | 7/30 (total 1,063; max 489/doc) | 5/12 (total 19) |
| formulas | — | **18/30** (median 17, max 38,831 `<f>` per doc) | — |
| tracked changes | **7/40** (3,256 ins/del runs total) | — | — |
| comments | 1/40 | **11/30** (354 total) | 1/12 (7) |
| hidden sheets | — | **3/30** (11 sheets) | — |
| speaker-notes parts | — | — | 7/12 (substantive text >20 chars: 4/12) |

Across the whole random OOXML sample: 29/82 documents carry at least one external
hyperlink, 1,277 external links total. The evidentiary extras are REAL in this
corpus, not hypothetical: a sixth of the docx population carries tracked changes the
published file still contains, a tenth of spreadsheets hides sheets, and 60 % of
spreadsheets carry live formulas — the derivation evidence a PDF of the same sheet
destroys.

**NEGATIVE CONTROL (run 2026-08-03):** `tools/measure-office-corpus.py control`
builds a plain ZIP (one `readme.txt` member) renamed to `.xlsx`; the classifier
reports `(zip, None)` — NOT OOXML, not counted. PASS. The same run is repeatable in
one step; the mode exits 1 if the masquerade is ever counted.


## 2026-08-03, thread CONTENT-PDF: is OCR reachable at all? — bundle, CPU, accuracy and text-layer provenance on a real scanned Oakland exhibit (D-152, DEC-4 as twice amended, CPDF-9)

The measurement that gates CPDF-10's whole design. Bob overruled the
accept-the-limit recommendation: image-only PDFs must be extracted AND
investigated, so before anything is designed, this measures whether OCR is
reachable at all — bundle against the Worker limit, CPU against the isolate
ceiling, character accuracy (DIGITS separately) on a real scan, and whether a
machine-generated text layer is detectable from metadata. It commits no product
code and holds no slot. **Grade VALUES are not set here and this measurement
must not be read as permission** — fidelity bounds the capture axis, no machine
mints the grade, member attestation is the only route to the top; those are
already doctrine.

**Instrument.** `bio-plane/test/ocr-measure-probe.mjs` (a probe, NOT in the
battery: it npm-installs the engines into an OS temp dir and changes nothing in
the repo; `--provenance` adds the metadata sample). Engines: **tesseract.js
7.0.0** with **tesseract.js-core 7.0.0** (the runtime instrument — runs on
node) and **tesseract-wasm 0.11.0** (artifact-size instrument; both wrap
upstream Tesseract compiled to WASM). Trained models: the tesseract.js default
**eng 4.0.0_best_int** and **tessdata_fast eng** (tesseract-ocr/tessdata_fast).
Machine: node v26.5.0, darwin/arm64. All timings are a **NODE PROXY, not
Worker CPU** (a Worker cannot time itself — the D-56 rule), calibrated into the
enforced ceiling's own currency by running `cpu.mjs`'s `burn()` on the same
machine. Every number below was produced by the committed probe on 2026-08-03.

### The named document — a real scanned Oakland exhibit

**`legistar-attach-15721260.pdf`** — Oakland Legistar staff-report attachment
(`oakland.legistar.com View.ashx?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2`),
939,552 B, CPDF-5's doc 14 ("scanned CCITT fax, 0 fonts"). Verified image-only
with pypdf 6.14.2 before use, and re-verified by the probe on every run: 4
pages, **zero fonts, zero extractable text**, each page one full-page 3300×2550
scan at 300 dpi (`/Rotate 270`; pages 1/4 JPEG `DCTDecode`, pages 2/3 CCITT G4
`CCITTFaxDecode`). It is a scanned City Council resolution awarding a paving
contract — typewritten body, stamps and signatures, dense in exactly the digits
that matter: three bid amounts to the cent, dates, and five CEQA section
numbers. DocInfo carries **empty `/Producer` and `/Creator`** — only
CreationDate/ModDate.

### 1. Bundle size against the Worker limit — the engine fits nowhere useful in-account except alone

Actual artifact bytes, measured with esbuild-independent byte counts (the WASM
binary is the payload; no build step shrinks it):

| Artifact | Raw | Gzip-9 |
| --- | --- | --- |
| tesseract-wasm 0.11.0 `tesseract-core.wasm` (SIMD) | 1,839,004 | 729,254 |
| tesseract-wasm 0.11.0 `lib.js` glue | 97,684 | 25,476 |
| eng traineddata, **tessdata_fast** (smallest usable) | 4,113,088 | 1,967,599 |
| **minimal deployable OCR payload (engine + glue + eng fast)** | **6,049,776** | **2,722,329** |
| tesseract.js-core 7.0.0 `tesseract-core-simd-lstm.wasm` (for reference) | 2,857,601 | 1,055,812 |
| eng **4.0.0_best_int** (tesseract.js's default model; the accuracy champion below is NOT this) | — | 2,952,873 (CDN gz, vendor-served) |

Against the **3 MB post-gzip Free-worker limit (the VENDOR'S figure**, as
labelled at the CPDF-1 entry; 3,145,728 B):

- **Into `pdf-worker` (I6): DOES NOT FIT.** 578,121 gz (measured at CPDF-6)
  + 2,722,329 = 3,300,450 gz — **over by ~155 KB**. OCR cannot join the
  existing fleet member.
- **Into the plane: fits arithmetically and is ruled out anyway.** 181,887 gz
  + 2,722,329 = 2,904,216 — 92.3% of the whole budget, leaving ~241 KB for all
  future plane growth; and the unpdf lesson applies doubly (a bare specifier
  broke 21 suites; tesseract.js additionally spawns worker threads and fetches
  its model at runtime).
- **A DEDICATED third fleet member fits, barely: 2,722,329 gz = 86.5% of its
  own 3 MB budget**, ~423 KB headroom, one language, no unpdf. Moving the
  traineddata to R2 (read at init: one Cloudflare-service subrequest, 4.1 MB
  into memory per cold start) shrinks the shipped bundle to **754,730 gz
  (0.72 MB)** — comfortable, at the price of a cold-start fetch.
- The model the accuracy run below crowns (tessdata_fast) is the ONLY variant
  that ships: the tesseract.js default best_int model is 2,952,873 gz — 94% of
  a Worker budget before any engine bytes.

### 2. CPU per page — the same order as the ENFORCED per-invocation ceiling, not comfortably under it

Node-proxy medians (5 warm runs/page), calibrated: **40,000,000 reference
iterations (`cpu.mjs` `burn()`) = 1,536 ms on this machine (26,036 iter/ms)**.
The enforced Free ceiling was measured 2026-07-29 by `op=cpuprobe` as **40M
iterations fit, killed during the next 2M** — so the ceiling's currency
converts on this machine to ~1.54 s of single-thread work per invocation.

| Page (content) | best_int ms | ≈ ref-iter | tessdata_fast ms | ≈ ref-iter |
| --- | --- | --- | --- | --- |
| 1 (JPEG, cover, stamps) | 2,064 | ~54M | 1,421 | ~37M |
| 2 (CCITT, dense text) | 1,760 | ~46M | 1,054 | ~27M |
| 3 (CCITT, dense text) | 1,602 | ~42M | 953 | ~25M |
| 4 (JPEG, signatures) | 935 | ~24M | 646 | ~17M |
| engine init (wasm + model) | 846 | — | 93 | — |

**Reading: one 300-dpi page costs ~17–54M reference-iteration equivalents
against a measured kill window of ~40–42M per invocation.** Not the two orders
of magnitude the documented 10 ms would suggest — the enforced ceiling is the
one that matters (the whole argument of this file) — but not clearance either:
a multi-page document in one invocation is OVER; a single page per invocation
is AT the ceiling's order, model- and content-dependent. Caveats, stated
plainly: this is a same-machine, same-V8 calibration, and an LCG loop and
wasm OCR stress different silicon, so it is a **CPU-ORDER figure only**;
authoritative Worker CPU needs a deployed wasm probe walked in reference
iterations (the `op=cpuprobe` pattern) before any in-account design is drawn.
Memory is also unmeasured (a 3300×2550 RGBA frame is 33.6 MB against the
128 MB isolate).

### 3. Character accuracy on the real exhibit — digits separately, and the one error that matters

Ground truth: PDF page 2 (CCITT G4, the dense resolution page), transcribed by
a human reader from the 300-dpi scan during this session, digit strings
adjudicated at 2× zoom, embedded in the probe. 2,687 characters, **90 digit
characters, 17 number tokens** (bid amounts to the cent, dates, CEQA section
numbers). Normalization: curly→straight quotes, whitespace collapsed;
Levenshtein alignment.

| Model | Char accuracy | GT digits correct | Digits MINTED | The actual errors |
| --- | --- | --- | --- | --- |
| eng 4.0.0_best_int | 99.93% (2 edits/2,687) | 90/90 (100%) | **1** | `$`→`5`, `l`→`{` |
| eng tessdata_fast | **99.96%** (1 edit/2,687) | 90/90 (100%) | 0 | `s`→`S` |

**The finding that decides doctrine: the risk is not accuracy, it is what the
rare error looks like.** best_int's single substantive error read
`($26,181,434.00)` as `(526,181,434.00)` — a dollar sign minted into a digit,
turning a $26M bid into a plausible-looking 526-million figure that no
spell-check flags and a skimming human misses. 99.93% character accuracy and
100% of ground-truth digits correct, and the record would still have carried a
20× wrong number. This is the attestation-ceiling case made by measurement:
per-region confidence and never-machine-attested digits are load-bearing, not
caution. (Tesseract's own confidence DID signal the hard page: 77–78 on the
signature/stamp page vs 92–95 on typescript — a usable per-page floor signal.
Accuracy on the stamps/handwriting themselves was not ground-truthed; the
ABBYY overlays below show what it looks like: garbage.)

### 4. NEGATIVE CONTROL — RUN: a blank page yields nothing

Both models OCR'd a blank white 3300×2550 page (same dimensions as the scan):
**`text=""`, confidence 0, zero words, both runs** (~67 ms). The engine does
not hallucinate on empty input — the one failure mode that would put invented
text in the record is absent. The probe exits non-zero if this ever regresses.

### 5. Text-layer provenance — the machine-generated layer IS detectable, and Oakland's certified resolutions all have one

`--provenance`: 14 PDF attachments across the 5 most recently modified Legistar
matters (web API), DocInfo `/Producer` + `/Creator` read with pypdf (plus, in
this session's wider 19-doc sweep, XMP `CreatorTool` — it never disagreed):

- **3 of 14 name OCR software: `Creator: ABBYY FineReader Engine 11`** — and
  the three are exactly the City Clerk's **enacted certified resolutions
  ("89484 CMS", "89498 CMS", "89518 CMS")**: full-page 300-dpi JBIG2 scans with
  an OCR text overlay. The overlay is somebody else's unverified transcription,
  garbage included — page 1 of 89518 CMS's layer reads
  `2022 NOV 23 AM 9* 59 p|{ £0OFFICE OF THE CITY CLERK` where the stamp is.
  Today that text is indistinguishable in our pipeline from publisher-authored
  text; one metadata read fixes that (DEC-4's third amendment, confirmed real
  on the first sample taken).
- The remaining 11 name authoring software (Word, Acrobat
  Distiller/PDFMaker/Sign, Quartz, Crystal Reports for Legistar agendas) — no
  false positives for the scanner/OCR pattern.
- The named scanned exhibit itself carries **no metadata at all** (empty
  Producer/Creator): a wholly image-only scan may say nothing about its
  scanner — and needs no metadata to be caught, because 0 fonts/no text layer
  already detects it structurally (CPDF-5). Detection is therefore two cheap
  reads that compose: **structure catches the layerless scan; metadata catches
  the machine-made text layer.**

### 6. Recommendation across the FOUR placements (facts first; values are CONDUCT/Bob's)

1. **In-plane Tier 1: ruled out.** 92.3% of the plane's whole bundle budget,
   ~one full invocation-ceiling of CPU per page shared with capture's own
   work, and the unpdf/battery incompatibility class, worse.
2. **The pdf-worker fleet member (I6): ruled out as-is** — over the member's
   bundle limit by ~155 KB even with the smallest model.
3. **External SERVICE: the only placement reachable today**, and priced as
   Bob's amendment demands: the transcription becomes a **third-party claim we
   cannot re-run** once the service changes its model, so the `text_source`
   chain must pin **service identity and date** exactly as it would pin engine
   and version; the captured bytes also leave the sovereign account, which is
   a consequence to state, not hide. Service accuracy was NOT measured here;
   **the pinned local engine's 99.96%/100%-digits is the floor a service must
   beat to justify that cost.**
4. **Service-plus-AI post-processing: not as a default chain.** Raw engine
   output on this document class leaves almost nothing for an AI step to add —
   and the one observed error ($→5) is precisely the class a post-processor
   would silently "fix", the output-looks-better-than-input hazard CPDF-10's
   chain rule exists for. If a chain ever carries an `ai(...)` step it records
   it as weakening, per the already-stated doctrine.

**Recommendation: run CPDF-10 against the external-service placement first**
(chain names the service and date; digits never machine-attested; per-region
confidence kept), **and hold a dedicated `ocr-worker` fleet member as the
preferred end-state** — a pinned, re-runnable, first-party tesseract
(2.72 MB gz alone, or 0.72 MB with the model in R2) keeps the transcription
inside the sovereign account and out of the third-party-claim trap — **gated
on two things that do not exist yet**: a deployed workerd probe of wasm OCR
against the enforced ceiling in reference iterations (single-page-per-
invocation is borderline on today's proxy), and the page-to-pixels path (scan
images are DCT/CCITT/JBIG2 streams; pdf.js's renderer wants a canvas workerd
does not have — the renderer item CPDF-9's placement was to name goes with
that gate, not before it).

## 2026-08-03, session FRAMEWORK (fw15-agent): the ITEM SHAPE of a real Legistar agenda packet's Tier-1 text (FW-15's meeting_agenda doctype)

**Instrument.** The real Oakland agenda packet the CPDF-5 corpus already measured
for decode coverage — `oakland.legistar.com/View.ashx?M=A&ID=1425405&GUID=
86B6D25C-4D38-4101-BD37-13DF930A7950` (the *Rules & Legislation Committee
supplemental agenda for 2026-07-16) — re-fetched 2026-08-03 (276,421 bytes,
byte count identical to the 2026-07-31 fetch; sha256
`16cb1adf6d35116dbc475ae39ac1757f28cd549e7ff5b7f6d5bb7c660503570c`, now
committed as `bio-plane/test/fixtures/legistar-agenda-1425405.pdf`), Tier-1
text via `extractPdfStructure(bytes).text` in node v26.5.0: 33 pages, 60,865
chars, 45 undetermined code points (unmapped), matching the recorded CPDF-5 row.

**What the text's STRUCTURE is** — the facts the `meeting_agenda` content type
(docprofile/doctypes/meeting-agenda.mjs, FW-15) is written from, per the
standing rule that an unmeasured content type is not written:

- **41 legislation file numbers**, each `\d{2}-\d{4}` ALONE ON ITS OWN LINE,
  each exactly once (grep over the extracted text). These are Legistar's own
  stable file ids — the entity keys.
- **37 `Subject:` blocks and 37 `Recommendation:` labels** (equal counts). The
  `Subject:`/`From:` labels sit on their own line with the VALUE on the next
  line; `Recommendation:` runs inline on its own line.
- **The item number (`2`, `3.1` … `3.29`) sits on its own line immediately
  before the file-number line.** Section items (e.g. "Determination Of Schedule
  Of Outstanding Committee Items" / `2` / `26-0844`) carry NO Subject block;
  their heading is the nearest substantive line above the item number.
- **Page furniture repeats and can interleave an item at a page break**:
  `Page N`, `City of Oakland`, `Printed on …`, the meeting date line, the body
  name (`*Rules & Legislation Committee`), the ` Agenda - SUPPLEMENTAL` banner.
- **The meeting date is the first line** (`Thursday, July 16, 2026`); the body
  name repeats as a header with a leading `*`.

**What was NOT established** (and the doctype therefore does not claim): any
per-item action result (the minutes' business, not the agenda's); the item
shape of NON-Legistar agendas — the type's detect() is written to this
publisher's shape and an unrecognised agenda falls to `generic`, honestly.

## 2026-08-03, session RECORD (rec25-agent): the F-8 read-path leak, measured BEFORE and AFTER the D-15 stamp (REC-25)

**Why measured.** `CAPABILITIES.md` marks F-8 as a DERIVATION FROM SOURCE, not a
measurement. This is the measurement.

**Instrument.** Miniflare over `bio-plane/src/index.mjs` — the control plane,
a real caller's only route (D-43) — with the same fixture
`test/gate-reads.test.mjs` now pins: four enrolled members (two admins, carol
holding create_projects, dave holding contribute only), one shared information
bundle, one shared problem, and `PROJ-2026-0001-secret` created by CAROL'S
SESSION (so the plane stamps her as owner), citing the shared information.
Every read below is DAVE'S identified session — a member never invited to the
project. Probe script preserved in this session's scratchpad; the AFTER run is
re-runnable forever as `npm run test:gate-reads`.

**BEFORE (worktree commit f99a952, pre-fix), dave's session:**

| op | answer |
| --- | --- |
| `op=list` | the project's FULL ROW: id, object_type, current_state, title, last_updated, bundle_sha |
| `op=index` | the same row under `{id, ..., sha256}` |
| `op=projection&id=PROJ…` | id, title, current_state (and the whole projected tail) |
| `op=image&id=PROJ…` | **the entire document** — `bundle.md` text including the body ("Secret plan") |
| `op=file&id=PROJ…&path=bundle.md` | the document text again (same class, found in passing; not in the item's five) |
| `op=affordances&target=PROJ…` | target, object_type, current_state — existence and state |
| `op=search` (control) | NO project hit — the one stamped path held, proving the gate itself was sound and only the stamping was partial |

No plane-side backlink read existed; the UI rebuilt reverse edges client-side
by walking every project's projection (`app.html` reverseRefs), i.e. through
the leaking `op=projection` above.

**AFTER (this item's commit):** all six ops above answer dave EXACTLY as they
answer for a bundle that does not exist — asserted byte-identically
(status + body) in `test/gate-reads.test.mjs` — the enumerations carry only
the shared corpus with totals to match, `op=backlinks` (new) filters the
citing project by the viewer's position, and owner/admin/machine scopes are
unchanged. 36/36 assertions; battery and coverage figures in the suite run.

**Posture note, measured not assumed:** the store now FAILS CLOSED on these
paths — a read reaching the Durable Object without a server-stamped viewer
gets the deny predicate (empty/absent), which is the same posture `op=search`
has had since D-15 shipped. So the failure mode of a future missing stamp is
an outage, never a leak; the suite's negative control runs BOTH arms.

## 2026-08-04, session RECORD (rec36-agent): how `reading_refs.label` actually varies against a subject's names (REC-36)

**Why measured.** REC-36's queue item names a real fork — a normalised-label
INDEX against an alias-JOINed read — and says MEASURE FIRST. The two are not
interchangeable, and choosing by intuition is how a lookup ships that answers
nothing on a real document while passing every synthetic test written to agree
with it.

**Instrument.** `bio-plane/test/label-variance-probe.mjs`, re-runnable
(`node test/label-variance-probe.mjs`). It reads the ONE real captured document
this repository holds — `test/fixtures/legistar-agenda-1425405.pdf`,
oakland.legistar.com `View.ashx?M=A&ID=1425405`, the *Rules & Legislation
Committee supplemental agenda for 2026-07-16, fetched 2026-08-03, 276,421 bytes,
33 pages — through the PLANE'S OWN Tier-1 extraction (`src/pdfstructure.mjs`,
60,865 chars decoded / 45 undetermined) and the REAL reader (`docprofile`'s
`meeting_agenda` doctype, detected `certain`). The 41 labels below are the exact
strings `#writeReadings` persists; nothing is a fixture written to agree. The
probe names are taken FROM the document (its body name, its `From:` offices, and
the counterparties and places its item titles name), because a hand-written probe
set measures the author's imagination.

**THE CORPUS IS ONE DOCUMENT, ONE DOCTYPE, ONE INSTITUTION, and that is stated
rather than papered over.** It is too thin to characterise a DISTRIBUTION of
name-spelling variance, and this measurement claims no distribution. What n=41
does settle is the SHAPE question, because finding 1 is not a sampling artefact —
it is a fact about what a label IS in this corpus.

| # | finding | measured |
| --- | --- | --- |
| 1 | **A subject name is NEVER the whole label.** The label is the document ITEM's title (the agenda's `Subject:` line), not a name. | **0** whole-label matches, over 33 names x 41 labels, after case-fold + whitespace-collapse |
| 2 | The name, where present, is **EMBEDDED in a longer title** — and every-term-present finds exactly what substring finds, so the indexable form loses nothing | substring **15**, all-terms-present **15**, over the same 33x41 |
| 3 | **Abbreviations are reachable by NO normalisation of spelling.** `OPD`, `HUD`, `REAP`, `CSBG`, `MOU` appear in labels; their full names appear in none | 7 label hits by short form, **0** by full name |
| 4 | **Case varies for one name inside one document** — so case-folding is measured-necessary, not assumed | `City of Oakland` 36, `City Of Oakland` 14, in the same document |
| 5 | The same office is spelled **three ways in one document** (`Office Of The City Administrator`, `… And Council President Jenkins`, `Office Of The Mayor And The City Administrators Office`) | 3 of 20 distinct `From:` values |
| 6 | **Labels are truncated at the source's line wrap** — a label can end on `And`, `For` or a comma, so a name in the tail is simply not in the stored label | **3/41** end mid-phrase |
| 7 | Punctuation is ordinary and varied; a diacritic occurs, and case-folding does not fold it | comma 7/41, hyphen 7/41, digit 12/41, ALLCAPS token 17/41, non-ASCII **1/41** (`Mentor-Protégé`) |
| 8 | A normalised-term projection of the label is cheap | 2 / 8 / 12 terms per label (min/median/max); **305 rows** for this whole document |

**WHAT THE MEASUREMENT DECIDED, and the reasoning, so nobody re-derives it.**
Finding 1 kills the normalised-label index ON ITS OWN: keying the whole label and
looking a name up answers **nothing** on the only real document we hold. Finding
3 kills a pure normalisation approach in the other direction: no amount of
case-folding, punctuation-stripping or diacritic-folding reaches
`Oakland Police Department` from `OPD` — only a REGISTERED ALIAS does. So the
shape is **both, and neither alone**: an INDEX on the label's normalised TERMS
(not on the whole label, which measured 0), read through an ALIAS JOIN (the
registry's names walked into that index, because the abbreviation class lives
only there). Finding 2 says the indexable form costs nothing against the scan it
replaces; finding 8 says the projection is cheap. Findings 4-7 are what the
tokeniser must actually handle, and each has an assertion in
`test/readingname.test.mjs` rather than a promise here.

**Adjacent, and NOT measured here (D-74 stays open).** D-74's Oakland
shared-identifier spaces are the neighbouring question — which identifiers
Oakland reuses ACROSS systems, converting a progression from Grade C to Grade B.
This measurement is about the §8.1 grade-C tier itself (a NAME correspondence
inside one system) and moves D-74 not at all. One observation is worth carrying
to whoever takes D-74: the Legistar file number (`26-0910`) is on **41/41** items
here, alone on its line, and is already the A/B tier's key — so the D-74 question
for this institution is not whether Legistar has a stable identifier but whether
the finance and procurement systems carry the SAME one.

## 2026-08-04, thread CONTENT-PDF: is Moondream 3.1 on Workers AI a usable IN-ACCOUNT OCR path? — accuracy, coordinates, controls and the degradation ladder (DEC-35, CPDF-11)

The measurement DEC-35 reframed the external-service question into. The
in-account path would remove a whole vendor account, a standing credential and a
new third party from every instance the installer ever creates, so it is worth a
real probe before anything is funded. **Nothing was funded, no account was
created, no credential was issued, and no signup happened** — `env.AI` rides the
account the project already has. **THIS COMMITS NO PRODUCT CODE.** Grade VALUES
are not set here: fidelity bounds the capture axis, no machine mints the grade,
and this measurement must not be read as permission (DEC-4 as twice amended).

**Instrument.** `bio-plane/test/ocr-moondream-probe.mjs` plus the scratch Worker
it uploads, `bio-plane/test/ocr-moondream-worker.mjs`. Probes, NOT in the
battery — the runner discovers `*.test.mjs` and neither file is one, so nothing
joins the battery and no skip marker exists to rot. Re-runnable end to end:
`node test/ocr-moondream-probe.mjs`. Every number below is from ONE run of the
committed probe on **2026-08-04**.

- **The exact model id: `@cf/moondream/moondream3.1-9B-A2B`.** Reached through
  the `AI` binding on a scratch Worker uploaded to the pinned project account
  (`20b533579290b9b93168345edd3b7f72`, asserted by the probe before a byte is
  uploaded) and DELETED on the way out. **The REST route
  (`/accounts/<id>/ai/run/<model>`) is NOT usable with the project token:**
  measured HTTP 403 code 10000 on `/ai/models/search` and `/ai/models/schema`
  while `/workers/scripts` answers 200 — the token carries Workers Scripts and
  not Workers AI. The binding needs no token permission at all, which is both
  the workaround and the production shape a sovereign instance would use.
- **The same page, the same ground truth, the same arithmetic as the floor** —
  and not by copying. The probe READS `GT_PAGE2` and the `norm`/`levenshteinPairs`
  sources out of `test/ocr-measure-probe.mjs` at run time, and asserts all four
  of CPDF-9's scoring expressions are still literally present there, stopping
  with a named error if they are not. A copied ground truth is one that drifts,
  and two OCR numbers from drifted machinery are not comparable however alike
  they look.
- Page images are CPDF-9's recipe unchanged (pypdf 6.14.2 + Pillow 11.3.0,
  including the `/Rotate 270` correction), so the pixels this model saw are the
  pixels tesseract saw: `legistar-attach-15721260.pdf` page 2, 2550x3300
  upright, 202,177 B PNG, image-only re-verified on every run.
- **The floor it is measured against** (MEASUREMENTS.md 2026-08-03, local
  tesseract, eng tessdata_fast): **99.96% character accuracy, 90/90 digits, ZERO
  minted digits**, blank page yields `""`.
- **No pseudo-confidence anywhere.** The model is never asked how sure it is and
  no self-reported number is thresholded — FORBIDDEN by DEC-35. The one prompt
  used at every rung and on both controls asks for a transcription and offers a
  one-word refusal, and that refusal is what the ladder scores.

### 1. ACCURACY on the ground-truthed page — close to the floor, and NOT the same claim

Three runs, PDF page 2, scored against the 2,687-character human ground truth:

| Run | Char accuracy | Edits | GT digits correct | Digits MINTED | Latency |
| --- | --- | --- | --- | --- | --- |
| 1 | 99.44% | 15 | 89/90 | 0 | 6,680 ms |
| 2 | 99.40% | 16 | 89/90 | 0 | 6,127 ms |
| 3 | 99.44% | 15 | 89/90 | 0 | 5,960 ms |
| **local tesseract fast (the floor, 2026-08-03)** | **99.96%** | **1** | **90/90** | **0** | — |

**The single digit "error" is an OMISSION, not a misread.** The full edit list
for the worst run is: one dropped `and`, one dropped `s`, **nine inserted `"`
characters** in the CEQA section list, and the page-number `2` at the foot of
the page dropped. Every one of the 17 number tokens the page turns on — all
three bid amounts to the cent (`$21,180,436.10`, `$20,881,650.00`,
`$26,181,434.00`), the dates, all five CEQA section numbers — is correct in all
three runs. **This is the exact place the floor's best_int model failed**
(`($26,181,434.00)` read as `(526,181,434.00)`, a minted `5` turning a $26M bid
into $526M). Moondream did not make that error at full resolution in any run.

**But the transcription is NOT REPRODUCIBLE, and that is a property of the
claim, not of the run.** Three runs of the identical bytes produced **2 distinct
transcriptions** (and the two earlier probe runs produced different splits
again). A classic engine pinned to a version returns the same characters
forever; this one does not, so "the engine and its version" does not identify
the transcription the way `text_source` assumes. Re-running does not reproduce
the record — it produces a second, differently-wrong record.

Latency is **6,127 ms median round trip from this machine**, including a 270 KB
base64 upload. It is NOT a CPU figure and is NOT comparable to CPDF-9's
node-proxy medians (1,054 ms for the same page); it is recorded because it is
what a caller would actually wait, and it says the in-account path is a queued
job and not an inline step.

### 2. COORDINATES — VERIFIED, AND THEY DO NOT ALIGN. This is the finding.

The one non-negotiable structural requirement (DEC-4: an OCR citation carries
its image region; DEC-35: Moondream claims coordinates, CPDF-11 verifies them).
Verified rather than assumed: **every box the model returned was cropped out of
the page and read by the LOCAL TESSERACT the floor was measured with.** The
referee says whether a box aligns; the model does not grade its own boxes.

**(a) The API shape, before any number: no call returns text WITH its
coordinates.** `task=query` returns `answer` and nothing else — no boxes.
`task=detect`/`point` return `objects`/`points` and no text. The transcription
and the geometry come from different calls about different things, so the anchor
DEC-4 requires does not exist as a single answer from this model at all.

**(b) Localising a literal string that IS on the page — 2 of 24 box-checks
align**, three runs per target:

| Target | On the page? | Boxes over 3 runs | Referee finds the target |
| --- | --- | --- | --- |
| `$21,180,436.10` | yes | 3 | **0/3** — every box read `competitive ser…`, a different part of the page |
| `$26,181,434.00` | yes | 15 | **0/15**, and 3 boxes were too small to contain any readable text |
| `Notice of Exemption` | yes | 3 | 2/3 |
| `$99,999,999.99` | **NO** | 3 | 0/3 — **it returned a box on every run for text that is not on the page** |

The absent-target row is the one that settles it: a localiser that answers
regardless has localised nothing, and it put its confident box on a real,
unrelated line (`WHEREAS, on April 30, 2026, after a competitive bidding
process…`). The box count is also unstable — the same target returned 1 box on
one run and 7 on another.

**(c) Layout blocks — partially real, and the criterion is only trustworthy
because its own control fails.** Target `paragraph of text`: **7 of 11 boxes
align**, reading order monotone. A box counts as aligned only if the referee
recovers 40+ characters of the ground truth from inside it AND finds them within
10% of the page of where the box's own vertical midpoint predicts. **NEGATIVE
CONTROL, RUN: the same boxes displaced a quarter-page down, same criterion —
0/9 align.** The criterion discriminates. It was not always so: the first
version of this check asked only "did the referee recover 40+ characters", and
**7 of 10 DISPLACED boxes passed it**, because a page that is dense text top to
bottom will hand you ground truth wherever you crop. That criterion was
measuring the page's density, not the box's position, and it is recorded here
because the wrong instrument produced the more flattering number.

**(d) The composed shape — the only in-account shape that could carry an anchor,
and it is a hint rather than a result.** Detect the block, crop it, transcribe
the crop. Of the three largest blocks, only ONE had a region ground truth the
referee could place with confidence (the other two: the referee's own read of
the crop was 66% and 35% placeable, so any score would have been about the
window and not about the model, and the probe refuses to score them). The one
scored region: **99.62% character accuracy, 10/10 digits, 0 minted.** n=1. It
says the composition is not obviously broken; it does not say it works.

### 3. NEGATIVE CONTROLS — RUN, and the path PASSES this one cleanly

Blank white page and uniform-noise page, both at the ground-truthed page's own
2550x3300 dimensions, three runs each, same prompt:

| Control | Runs | Output | Verdict |
| --- | --- | --- | --- |
| blank white page | 3 | `ILLEGIBLE` every run | **PASS** |
| uniform noise page | 3 | `ILLEGIBLE` every run | **PASS** |

**Zero non-empty transcriptions on six control runs.** The failure mode that
would put invented text in the record from nothing is ABSENT, and the probe
exits non-zero if that ever regresses. This matches the floor engine's behaviour
(tesseract: `text=""`, confidence 0) and it is the strongest result on the
in-account path's side.

### 4. THE DEGRADATION LADDER — IT INVENTS BEFORE IT REFUSES, and that decides the confidence question

Five rungs of one axis (resolution, then resolution plus blur), every rung the
same pixel dimensions so "smaller image" and "less legible" are not confounded,
every rung asked THREE times with the same refusal-offering prompt. C1 is
deliberately **off the ladder**: contrast collapse is a different axis, not a
sixth rung, and numbering it as one implied a monotone ordering the measurement
then contradicted.

| Rung | What it is | REFUSED | Verdicts (3 runs) | Median char | GT digits | MINTED |
| --- | --- | --- | --- | --- | --- | --- |
| R0 | 300 dpi, the original page | 0/3 | FAITHFUL x3 | 99.59% | 89/90 | 0 |
| R1 | 150 dpi equivalent | 0/3 | FAITHFUL x3 | 99.44% | 89/90 | 0 |
| R2 | 75 dpi equivalent | 0/3 | FAITHFUL x3 | 99.59% | 89/90 | 0 |
| **R3** | **75 dpi + gaussian blur 2.0** | **0/3** | **PARTIAL x3** | **84.96%** | **36/90** | **20** |
| R4 | 37.5 dpi + gaussian blur 3.0 | **3/3** | REFUSED x3 | — | — | — |
| C1 | OFF-LADDER: contrast collapsed to 16 greys | 0/3 | FAITHFUL x3 | 99.78% | 89/90 | 0 |

Verdicts are defined in the probe, not eyeballed: REFUSED (said it could not
read it, or said nothing), FAITHFUL (>=95% of ground-truth characters), PARTIAL
(50-95%), INVENTED (<50% and still >=100 characters of confident text).

**R3 IS THE WHOLE MEASUREMENT.** At 75 dpi with a modest blur the model refused
**zero times out of three**. It returned 2,650-2,750 characters of fluent,
correctly-punctuated, structurally perfect legal prose — and **16 to 20 MINTED
DIGITS per run**, with 36 of 90 ground-truth digits correct. What it minted is
exactly what a reader would never catch: `$50,000` became `$10,000` and
`$100,000` across runs, `lowest responsible bidder` became `least responsible
bidder`, `bidder` became `builder`. Nothing in the output distinguishes an R3
transcription from an R0 one. There is no garble, no mojibake, no dropped
region — the mojibake rule DEC-4 applies one layer up has nothing to fire on,
because the output of a generative model on an illegible input is not garbled,
it is WRONG AND FLUENT.

**So refusal is real but it is a FLOOR alarm, not a BOUNDARY alarm.** It fires
3/3 at R4, one full rung PAST the band where the damage happens. DEC-35's test
was whether measured refusal-reliability licenses structured self-refusal as a
per-region trigger. **It does not.** A trigger that stays silent through the
entire invention band and speaks only once the image is unusable protects
nothing; wiring it in would produce a system that reports "the model did not
refuse" about precisely the pages where it minted the numbers. The Moondream
path therefore has **NO per-region refusal trigger**, which is DEC-35's own
named alternative — a statable limit rather than a hidden one — and the cap
carries everything.

C1 is a smaller finding worth keeping: pushing ink and paper into 16 adjacent
grey levels cost nothing at all (99.78%). Contrast is recoverable; resolution
and blur are not. A degradation ladder for any future engine should be built on
the second axis.

### 5. COST — real, and small

41 model calls in the run of record: 31,454 input tokens, 9,488 output tokens,
**1,720 neurons**. At the **vendor-stated** price for this model ($0.30 per M
input tokens, $1.00 per M output tokens, retrieved 2026-08-04) the entire
measurement cost **~$0.019**. The survey's Cloudflare section cites a free
allocation of 10,000 neurons/day on the Free plan; that figure is the vendor's
and this account's plan could not be read (`/subscriptions` answers 403 to the
project token), so it is NOT established here. What IS established: the whole
probe ran inside the existing account with no new credential of any kind.

### 6. THE RECOMMENDED TRANSCRIPTION-FIDELITY CAP FOR THIS ENGINE

DEC-4(c): a leg's capture grade is the weakest link of (byte provenance,
transcription fidelity); DEC-4(d): no machine mints the transcription grade, and
the measurement sets the ceiling. The capture axis is A/B/C with A structurally
unreachable and B the ceiling (REC-18). **The measurement sets this engine's cap
at C, and adds one rule the cap alone does not cover:**

1. **CAP: C.** Never B. Three independent reasons, any one of which would be
   enough: the transcription is **not reproducible** (2 distinct texts from 3
   runs of identical bytes), so the record cannot be re-derived from what it
   names; **no checkable image region exists** for the transcribed text, so
   DEC-4's anchor — the thing that lets a reader check the claim against pixels
   instead of trusting us — is absent; and the **R3 band is indistinguishable
   from R0 in the output**, so no property of a transcription tells anyone which
   band it came from.
2. **AND: a digit transcribed by this engine may not carry a leg at all without
   member attestation.** This is narrower and harder than the cap because the
   cap does not reach it: at R3 the engine mints 16-20 digits per page while
   producing text a reader will accept, and the digits are where OCR fails and
   where human checking fails too (DEC-4). Digits from this engine are a
   candidate for a member to check against the image, never a recorded value.

### 7. GO / NO-GO on the in-account path

**NO-GO for Moondream 3.1 as the DEFAULT in-account transcription path, as
CPDF-11 scoped it.** It fails the one requirement DEC-35 called non-negotiable
and it fails it outright: the boxes do not land on the text they are returned
for (2 of 24 checks), the transcription call returns no boxes at all, and the
model returns a confident box for a string that is not on the page. Accuracy
does not rescue this — the image-region anchor is not a nice-to-have that a good
character score buys off, it is the mechanism by which the record stops
depending on being trusted, and 99.44% is anyway BELOW the floor set by an
engine that is free, pinned, deterministic and already measured.

The degradation ladder independently confirms it. DEC-35 made structured
self-refusal EARNABLE by measurement; this engine did not earn it, because it
invents through the entire band where inventing matters and refuses only after.

**What this does NOT rule out, stated so nobody reads the verdict wider than it
is:**

- The **negative controls PASS cleanly** — this is not an engine that
  hallucinates text out of nothing, and that was the loudest worry.
- **Layout-block detection is partly real** (7/11 with a control that
  discriminates at 0/9), and the **composed shape** — detect the block, crop it,
  transcribe the crop — scored 99.62% with 10/10 digits and 0 minted on the one
  region that had a trustworthy ground truth. That is the ONLY in-account shape
  that could carry an image-region anchor, and it is **UNPROVEN AT n=1**, not
  refuted. Proving or killing it needs a second measurement with a
  multi-region ground truth, and it would still be capped at C by reason 1
  (non-reproducibility) alone.
- Nothing here is a finding about Workers AI generally, or about any other model
  in the catalog. It is one model, one page, one day, named exactly.

**Consequence for the queue, for CONDUCT to weigh rather than for this
measurement to decide:** DEC-35 clause 3 makes the external service the
escalation tier and the fallback if the probe fails — this is a probe failing on
the structural requirement, so the external tier is now the only measured route
to a checkable region, and Azure DI Read remains the primary external candidate
(survey, 2026-08-03) with its accuracy still unmeasured against this same page.
CPDF-12 (the page-to-pixels renderer) was scoped to re-scope on NO-GO; note that
the composed shape, if anyone wants it measured, needs the same renderer, so
closing CPDF-12 outright and measuring the composed shape are alternatives
rather than independent choices.

## 2026-08-04, session BOB: the account is now on Workers PAID — MEASURED, not taken on trust (DEC-42)

Bob upgraded the project's Cloudflare account after DEC-42. The plan is established
the same way the FREE plan was on 2026-07-31 — **by provoking the platform**, so the
two entries are comparable line for line and neither rests on a dashboard reading or
a vendor claim.

**Instrument.** `scratchpad/plan-probe.mjs` (throwaway, not committed): a Worker
uploaded over the REST API with `limits.cpu_ms: 50000` in its metadata — a value the
Free plan refuses outright. The account id is pinned to
`20b533579290b9b93168345edd3b7f72` and the probe EXITS before touching anything if it
does not match (the wrong-account hazard in `CLAUDE.md`). The probe worker was
uploaded, read back, DELETED and verified gone (404).

| Date | Upload with `limits.cpu_ms: 50000` | Verdict |
| --- | --- | --- |
| 2026-07-31 | **HTTP 400, code 100328** — *"CPU limits are not supported for the Free plan"* | Workers FREE |
| **2026-08-04** | **HTTP 200 ACCEPTED**, `limits: {"cpu_ms":50000}` echoed back | **Workers PAID** |

**Sweep confirmed:** `DELETE` 200, re-read 404. Nothing left behind on the account.

### What this unblocks, and what it does NOT establish

**Unblocked:** the DEPLOYED wasm CPU probe for the tesseract fleet member (the BOB
INBOX entry of 2026-08-04, CPDF-12 as re-scoped). CPDF-9's CPU figures are a NODE
PROXY calibrated into reference iterations and its own text says authoritative Worker
CPU needs a deployed wasm probe — that probe can now run, and the 10 ms ceiling that
blocked it is gone.

**NOT established here, and it must not be read as established:** that tesseract
actually FITS the CPU envelope in workerd, or that memory holds (a 3300×2550 RGBA
frame is 33.6 MB against a 128 MB isolate). This entry measures the PLAN and nothing
else. The engine's numbers are CPDF-12's to produce, on the runtime, in reference
iterations — the `op=cpuprobe` pattern, because a Worker cannot time itself (D-56).
