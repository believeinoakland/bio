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

## 2026-08-04, UI-31: the plane vocabulary standing on the PRE-AUTHENTICATION surfaces (evidence for DEC-49)

DEC-49 asks who owns member-facing refusal wording. D-174's trigger fired when
REC-41 gave `op=login` a refusal SENTENCE and UI-30 rendered it verbatim at the
sign-in gate. Until this measurement the tension was UNMEASURED rather than
accepted: UI-4's vocabulary guard and its siblings are each scoped to their own
rendered surface and every one of those surfaces is behind a credential, so **no
guard in this repository covered any pre-authentication surface at all**. This is
what is actually there. It is evidence for a ruling, not an argument for one, and
nothing in `app.html` was changed to produce it.

**Instrument.** `civicos-ui/test/preauth-vocabulary.test.mjs`, in the harness
`node civicos-ui/test/run.mjs` runs. It drives `app.html` in a VM with no
credential and prints `PRE-AUTH VOCABULARY REPORT:` lines. Re-run it rather than
reasoning about the numbers below.

**What was walked**, and the walk is discovered rather than listed: the gate's own
markup names its controls, `publishedRouteFromHash`'s own body names the addresses
that resolve at load, and the sibling suites' own sweeps supply the terms.
**12 surfaces, 10 scenarios, 33,412 characters** — the gate as served, its token
panel, its address field, a refused sign-in, a sign-in against an unreachable
plane, an empty token, the public record, the design preview, and both published
addresses (`#published`, `#case/<id>`) resolved AT LOAD by `app.html`'s own
top-level code for somebody holding nothing.

**Subjects: 74 terms inherited from the sibling sweeps, plus two structural rules**
(SCREAMING_SNAKE identifiers; bare 2–4 character acronyms that never appear in
ordinary case on the same surface). Matching is substring matching, exactly as
every sibling sweep matches, so `register` matches *registered*.

**Result: 13 terms, on 5 of the 12 surfaces, 67 occurrences in the rendered HTML
and 56 of them in text a member reads.**

| Term | ×HTML (visible) | Owner | Where it comes from |
| --- | --- | --- | --- |
| `sha256` | 30 (26) | BOTH | plane on the case page; surface on the index and the case page |
| `op=` | 12 (8) | BOTH | plane's `bytes`/`verification` pointers; surface's own verify links |
| `manifest` | 7 (7) | INCIDENTAL | the case page, surface-authored |
| `this instance` | 4 (4) | BOTH | the login refusal AND the case page's `detail`; also surface-authored |
| `bundle.md` | 3 (3) | UNAVOIDABLE | the plane's `parts[].path` on the case page |
| `handle` | 3 (1) | INCIDENTAL | the gate's own field label, "Member handle" |
| `MEMBER_TOKEN` | 2 (1) | INCIDENTAL | the gate's own field LABEL, printed to a member |
| `a salted derivation` | 1 (1) | UNAVOIDABLE | `Store.LOGIN_REFUSAL_DETAIL`, at the gate |
| `CORS` | 1 (1) | INCIDENTAL | `teach()`'s unreachable-plane fallback, at the gate |
| `its stored hash` | 1 (1) | UNAVOIDABLE | `Store.LOGIN_REFUSAL_DETAIL`, at the gate |
| `no active credential` | 1 (1) | UNAVOIDABLE | `Store.LOGIN_REFUSAL_DETAIL`, at the gate |
| `R2` | 1 (1) | INCIDENTAL | the design preview's own note |
| `register` | 1 (1) | UNAVOIDABLE | `Store.LOGIN_REFUSAL_DETAIL` ("never registered") |

**UNAVOIDABLE / INCIDENTAL is a statement about WHO WOULD HAVE TO ACT, not about
whether a word is bad.** It is mechanical: each occurrence is located in the
rendered HTML and attributed to the plane if it sits inside a run of text the
plane supplied (raw or escaped) and to the surface otherwise. UNAVOIDABLE means
plane-sourced — DEC-8 forbids this surface translating it or blanking it, so
nothing UI can do removes it and only DEC-49 can. INCIDENTAL means the surface
wrote the word and could word it differently tomorrow without touching a ruling.

### The three things in this that bear on DEC-49

1. **The refusal sentence is FIVE of the thirteen and is the only UNAVOIDABLE
   group at the gate itself.** Everything else UNAVOIDABLE is on the published
   case page, where the vocabulary is hashes and file paths a stranger needs in
   order to verify without this instance's cooperation — which is the product
   claim, not an accident of wording. So the wording question DEC-49 asks is
   narrower than the count suggests: at the gate it is one constant.
2. **More than half of what a member meets before authenticating is the SURFACE's
   own vocabulary, not the plane's** — 8 of 13 terms are INCIDENTAL or have an
   incidental half, including `MEMBER_TOKEN` printed as a field LABEL and `CORS`
   and `R2` in prose. **Neither answer to DEC-49 touches any of them.** Answer (a)
   rewords the plane; answer (b) licenses surfaces to translate what the plane
   sent. A surface's OWN words are outside both, and if the ruling is expected to
   fix what a member reads at the gate, that is a separate piece of work.
3. **`this instance` arrives by both routes** — the plane says it in the refusal
   and the case page's `detail`, and the surface also says it — so a ruling that
   moves it in one place leaves it standing in the other.

### What this does not establish

The plane-sourced column is a LOWER BOUND on the two published ops. The login
refusal is exact (read textually out of `bio-plane/src/store.mjs`, never typed),
but `op=publishedmanifest` and `op=publishedcase` are driven from wire-shaped
fixtures in the suite, so a live instance's `detail` sentences may carry terms
these do not. The surface-authored column is exact everywhere: it is read off the
shipped `app.html`. The acronym rule stops at four characters, because at five it
reports emphasis (`SERVE`, `WHOLE`) more often than acronyms.

**This measurement settles nothing about who owns the wording.** The guard REPORTS
and does not fail, because a guard failing on a state Bob has not ruled on would
leave the surface only the two moves DEC-8 forbids — compose a translation, or
blank what the plane said. When DEC-49 is answered it becomes a failing arm by
setting `REPORT_ONLY` to `false` at the arm; `UI31_ENFORCE=1` runs that arm today
and it fails naming all thirteen terms with their sources.

**SUPERSEDED IN PART BY UI-33, 2026-08-04 — see the next entry.** The thirteen
above are the state UI-31 measured. The eight INCIDENTAL / part-incidental terms
have since been closed at their source, and the table below this line is now a
HISTORICAL reading rather than the current one. **The UNAVOIDABLE column did not
move at all**, which is the half DEC-49 is about, so nothing in the reasoning
this entry supplied to that decision is invalidated — only its headline count.

## 2026-08-04, UI-33: the same instrument after the SURFACE-AUTHORED half was closed

Same instrument, same walk, same day: `civicos-ui/test/preauth-vocabulary.test.mjs`,
run as `UI31_ENFORCE=1 node civicos-ui/test/preauth-vocabulary.test.mjs`. This is a
re-reading, not a new measurement design. UI-33 reworded the words `app.html` writes
ITSELF and changed no plane-sourced string, so this entry is what a member meets
before signing in once the half that no ruling would have fixed is fixed.

**Result: 13 terms -> 9. 67 occurrences -> 55; 56 visible -> 45. 5 surfaces -> 4.**
The walk is unchanged at 12 surfaces, 10 scenarios and 74 inherited terms; the
harvest grew 33,412 -> 33,535 characters because two rewordings are longer than
what they replaced.

| Term | ×HTML (visible) | Owner | Change |
| --- | --- | --- | --- |
| `sha256` | 30 (26) | BOTH | unchanged — KEPT deliberately, see below |
| `op=` | 12 (8) | BOTH | unchanged — KEPT deliberately, see below |
| `bundle.md` | 3 (3) | UNAVOIDABLE | unchanged (the plane's `parts[].path`) |
| `this instance` | 3 (3) | **UNAVOIDABLE** | was BOTH ×4 — the SURFACE's occurrence closed, the plane's two untouched |
| `handle` | 3 (1) | INCIDENTAL | unchanged — KEPT deliberately, see below |
| `a salted derivation` | 1 (1) | UNAVOIDABLE | unchanged |
| `its stored hash` | 1 (1) | UNAVOIDABLE | unchanged |
| `no active credential` | 1 (1) | UNAVOIDABLE | unchanged |
| `register` | 1 (1) | UNAVOIDABLE | unchanged |
| ~~`manifest`~~ | — | was INCIDENTAL ×7 | **GONE** — prose reworded; `MANIFEST.json` kept as the file's real name |
| ~~`MEMBER_TOKEN`~~ | — | was INCIDENTAL ×2 | **GONE** — the gate's field label now reads "Access token" |
| ~~`CORS`~~ | — | was INCIDENTAL ×1 | **GONE** — the clause already said "cross-origin reads" |
| ~~`R2`~~ | — | was INCIDENTAL ×1 | **GONE** — a vendor product name in the preview note |

**EVERY PLANE-SOURCED ROW IS UNCHANGED IN NUMBER AND IN SOURCE**, and that is the
load-bearing half of this reading rather than a footnote: a reword that had quietly
edited a plane string would have shrunk the report too, and would have looked
exactly like success. DEC-49's subject is therefore the SAME eight rows it was, and
this item pre-empted nothing.

**THREE TERMS WERE KEPT ON PURPOSE, each with its reason recorded at the site in
`app.html` (`pubVerifyPanel`).** They are named here so a later reader does not
read them as misses. `sha256` names the ALGORITHM a reader is invited to run —
"check this without us" is only true if they know which digest to compute, and it
is the same prefix the record, the container and `ssh-keygen` all write.
`op=publishedbytes&sha256=…` is an ADDRESS, not a description; a reworded address
is a broken one. `handle` is the name of that identifier everywhere in the product,
so rewording it at the gate alone would give a member one word before signing in
and another after — renaming it everywhere is a product-vocabulary decision and is
routed rather than taken in passing.

**AND ONE GAP IN THE INSTRUMENT, FOUND BY RUNNING THE CONTROL RATHER THAN READING
THE FILE, AND CLOSED.** UI-31 pinned the plane's refusal sentence verbatim at the
GATE, so a surface editing that is caught by name. Nothing pinned the same thing on
the published CASE PAGE. Measured: with `verification.detail` rendered through a
`.replace("this instance","this group")`, the suite ran **31 of 31 GREEN, exit 0**,
and only the report moved. A surface silently translating a plane sentence on the
largest pre-authentication surface in the product — the precise move DEC-8 forbids
— was invisible to every assertion. One REACH assertion now pins it; the same
mutation fails **1 of 32**, naming `verification.detail` and DEC-8.

Also measured in passing and NOT acted on: `op=publishedcase`'s top-level `detail`
is rendered NOWHERE for a case that was FOUND (`app.html` prints it only on the
not-found and not-a-case branches). Whether a found case should show the plane's
own one-line description is a rendering question inside UI-29's ground.

**SUPERSEDED IN PART BY UI-34, 2026-08-04 — see the next entry, and the part
superseded is the BASIS rather than a number.** The reading above was taken over
TEN scenarios. UI-34 added an eleventh (`pubVerifyPanel`, a pre-authentication
pane no scenario drove) so the walk is larger, and the counts below this line are
therefore not comparable term-for-term with the ones above it. The TERM SET is
identical at nine, and **every plane-sourced row is unchanged in number and in
source**, so nothing this entry supplied to DEC-49 is invalidated — only the
occurrence totals and the character count it was measured over.

## 2026-08-04, UI-34: the same instrument over a LARGER BASIS — one pre-authentication surface that no scenario drove

**This entry exists because the BASIS moved, and a measurement whose basis moves
silently is worse than no measurement.** DEC-49 is being answered against the two
readings above. UI-33 found a pre-authentication surface outside them, reworded
its words, and deliberately did NOT add a scenario, because enlarging the walk
inside an item whose subject was wording would have made the two changes
indistinguishable in the report. UI-34 makes the move on its own, with the
reading taken before and after.

**Instrument.** `civicos-ui/test/preauth-vocabulary.test.mjs`, unchanged in how it
measures: walk 3's term harvest, `planeRanges`, `countIn`, the HITS loop, the
report and `REPORT_ONLY` are byte-for-byte the same computation. What changed is
what it walks. Run it rather than reasoning about the numbers below; it is in the
harness `node civicos-ui/test/run.mjs` runs.

**THE SURFACE THAT WAS MISSING, AND WHY NOBODY HAD NOTICED.** `pubVerifyPanel()`
renders the pane a stranger reaches by clicking "Verify" on the published rail —
"Check this without us", the sha256 paragraph, the tamper-EVIDENT claim this
whole product rests on. It is reached with NO credential. UI-31's walk discovers
pre-authentication controls by reading `#gate`'s own markup, and this control is
on `#pub`'s masthead: **the published space's own links were discovered by
nothing at all.** That is a class, not one omission — the published space is
entered without a credential by design, and until now only its BODY was measured,
never its controls.

**THE NEW BASIS.** 11 scenarios, up from 10. 12 surfaces (unchanged). 34,375
characters, up from 33,535. 74 inherited terms plus two structural rules
(unchanged). Walk 1b now reads the published masthead's inline handlers the way
walk 1 reads the gate's ids, and every one must be driven by a scenario — so a
third link on that rail fails the suite until somebody opens it.

**Result: 9 terms -> 9 terms. 4 surfaces -> 4. 55 occurrences -> 57; 45 visible -> 47.**

| Term | before (10 scenarios) | after (11 scenarios) | Change |
| --- | --- | --- | --- |
| `sha256` | 30 (26) BOTH | **32 (28) BOTH** | +2, ALL of it SURFACE-authored, from the verify pane's own two sentences; its plane source list is identical |
| `op=` | 12 (8) BOTH | 12 (8) BOTH | unchanged |
| `bundle.md` | 3 (3) UNAVOIDABLE | 3 (3) | unchanged |
| `this instance` | 3 (3) UNAVOIDABLE | 3 (3) | unchanged |
| `handle` | 3 (1) INCIDENTAL | 3 (1) INCIDENTAL | unchanged — **KEPT product-wide by decision, see below** |
| `a salted derivation` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `its stored hash` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `no active credential` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `register` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |

**THE WHOLE DELTA IS ONE ROW AND IT IS SURFACE-AUTHORED.** The verify pane writes
`sha256` twice in text a member reads; no plane string reaches that pane at all,
which is why UI-33 was able to reword it under DEC-8 in the first place.
**EVERY PLANE-SOURCED ROW IS UNCHANGED IN NUMBER AND IN SOURCE**, and that is no
longer a claim a worker checked by hand: `DEC49_SUBJECT` in the instrument pins
the eight rows by TERM and by SOURCE, and any movement in them FAILS the suite,
naming what vanished, what newly arrived, and what now arrives from somewhere
else. The hard constraint every item on these surfaces inherits — leave every
plane-sourced term exactly as it is — is machine-checked from this date.

That pin earned its place immediately. The DEC-8 overstep UI-33 caught only by
adding a bespoke reach assertion for one named field (`verification.detail`
rendered through a `.replace`) is now caught GENERICALLY: the same mutation makes
the subject arm report `this instance` arriving only from the gate, with nobody
having had to anticipate the field.

**WHAT THIS DOES NOT ESTABLISH**, and it is UI-31's limit unchanged: the
plane-sourced column for the two published ops is a LOWER BOUND, because those
answers are wire-shaped fixtures rather than a live instance's. The new scenario
does not change that — it drives no op at all; the pane is entirely this
surface's own prose.

### The `handle` decision, recorded here because the measurement is where it will be re-opened

UI-31 measured `handle` at the gate and classed it INCIDENTAL. UI-33 kept it and
routed the product-wide question. **UI-34 answered it: KEPT, product-wide**, with
the four-part argument recorded in `civicos-ui/app.html` at the gate, where a
reader meets the word. In short: it is the PLANE's field name, a declared
parameter of thirteen `store.mjs` methods, so a surface-only rename would give
the product two names for one field and moving the wire is an I3 change; every
candidate replacement is wrong and two collide with the `member`/`cover`
distinction the members screen depends on; unlike the four terms UI-33 closed it
is vocabulary the audience already holds rather than our implementation leaking;
and the word's genuine overloading — the selection lease is also a `handle` on
the wire — is already solved by never printing it, which a rename here would undo.

**Measured while deciding, and it is the number that matters most here: there are
NINE member-visible sites, not eight.** A careful read of `app.html` produced
eight. The ninth — `projectParticipantsHtml`'s column header, `<th>Handle</th>` —
was found by RUNNING the complete-rename control, which failed with one word left
standing on the project workspace. A bare capitalised word in a table header is
invisible to an inventory keyed on the phrasings a person searches for, and it is
precisely the site a rename would have left behind. **A new instrument,
`civicos-ui/test/identifier-vocabulary.test.mjs`, now asserts that every
member-visible site naming that identifier uses the SAME word — and pins no value
at all**, so it enforces "everywhere or nowhere" rather than "handle". Renaming
all nine keeps it green (measured, twice, in two capitalisations); renaming some
fails naming the ones that did not move.

**SUPERSEDED IN PART BY UI-36, 2026-08-04 — see the next entry, and what is
superseded is BOTH the basis AND the headline of "every plane-sourced row
unchanged".** The reading above was taken over a walk that never asked a public
op. UI-36 drove `op=verify` from the case page's own five Verify buttons, and
**DEC-49's subject GREW from eight plane-sourced rows to ELEVEN**. The three
readings above stand as readings; their counts are not comparable term-for-term
with the ones below, and the sentence "every plane-sourced row is unchanged in
number and in source" is true of UI-33 and UI-34 and is NOT true of UI-36 — by
design, because harvesting a public op's answers is what UI-36 was for.

## 2026-08-04, UI-36: the same instrument over a walk that finally ASKS A PUBLIC OP — and DEC-49's subject grows

**This entry exists because the ruling's SUBJECT moved, which is a larger event
than a basis moving.** UI-31, UI-33 and UI-34 all ended with "every plane-sourced
row is unchanged in number and in source". This one does not, and the growth is
the result rather than a regression: there was a whole PUBLIC OP whose answers no
scenario had ever harvested, so the plane-sourced column was a lower bound in a
second way that had nothing to do with the two wire-shaped fixtures UI-31 named.

**Instrument.** `civicos-ui/test/preauth-vocabulary.test.mjs`, in the harness
`node civicos-ui/test/run.mjs` runs. **The measurement itself is UNCHANGED** —
walk 3's term harvest, `planeRanges`, `countIn`, the HITS loop, the report and
`REPORT_ONLY` are the same computation, and that is PROVED rather than asserted:
this file run with the new drive hidden (`UI31_HIDE=case-verify`) reproduces
UI-34's report **character-identically**, so every number that moved was moved by
the drive. Run it rather than reasoning about the numbers below.

**WHAT WAS MISSING, AND IT IS THE SAME CLASS AS UI-34'S ONE LEVEL DOWN.**
`pubVerify(sha, into)` renders **five times** on the published case page — beside
the finding, beside the manifest, beside each of the two parts, and on the
container row — is reached by a stranger holding nothing, and is the ONLY place a
pre-authentication surface CALLS the plane on the reader's behalf. It asks
`op=verify` (`classes: null` in the plane's OPS table) and prints the answer
back: `matches[0].path`, `.kind`, `.bundle_id`. **No scenario had clicked it.**
UI-34 taught this file to discover the published masthead's SERVED controls; the
case page's controls are written by SCRIPT out of what the plane answered, so no
read of `app.html` discovers them at all. **WALK 1c** now reads the case page AS
RENDERED and requires every control on it to be driven by a scenario or named by
the load-time router's own body — which is how `pubOpen` is accounted for, read
out of `publishedRouteFromHash` rather than assumed.

**THE NEW BASIS.** 11 scenarios (UNCHANGED — the drive was added to the scenario
that already opens the case address, because a second scenario opening the same
address would double-count every plane-sourced occurrence on the largest
pre-authentication surface in the product and the delta would be a re-render
rather than this control). **12 surfaces -> 19**, the seven new ones being the
verify panes the page's own buttons write into. **34,375 -> 35,835 characters.**
74 inherited terms plus two structural rules (unchanged).

**Result: 9 terms -> 13. 57 occurrences -> 67; 47 visible -> 57. 4 surfaces
carrying terms -> 10.**

| Term | before (no public op driven) | after (op=verify driven) | Change |
| --- | --- | --- | --- |
| `sha256` | 32 (28) BOTH | 32 (28) BOTH | unchanged |
| `op=` | 12 (8) BOTH | 12 (8) BOTH | unchanged |
| `bundle.md` | 3 (3) UNAVOIDABLE | **6 (6) UNAVOIDABLE** | **+3, ALL plane-sourced, from THREE new surfaces** — `op=verify` echoes back the same `parts[].path` the case page already showed |
| `FIND` | — | **4 (4) UNAVOIDABLE [structural]** | **NEW** — the acronym rule on the bundle id in the verify panes |
| `this instance` | 3 (3) UNAVOIDABLE | 3 (3) | unchanged |
| `handle` | 3 (1) INCIDENTAL | 3 (1) | unchanged |
| `a salted derivation` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `CASE` | — | **1 (1) UNAVOIDABLE [structural]** | **NEW** — the same rule on the case id |
| `its stored hash` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `manifest` | — | **1 (1) UNAVOIDABLE** | **NEW, and the one that is a WORD** — the plane's `kind` VALUE printed in a sentence |
| `no active credential` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |
| `NOT` | — | 1 (1) INCIDENTAL [structural] | NEW, surface-authored ("NOT PUBLISHED.") |
| `register` | 1 (1) UNAVOIDABLE | 1 (1) | unchanged |

**DEC-49'S SUBJECT: EIGHT PLANE-SOURCED ROWS -> ELEVEN**, and each movement is
named in `DEC49_SUBJECT` in the instrument, in the commit message and here.
`manifest` is the one that matters most to the ruling, because it is an ENGLISH
WORD the plane chose and printed at a stranger — and UI-33 had removed the
surface-authored `manifest` from these surfaces entirely, so it is back, from the
other side. `bundle.md` is not new vocabulary but three new places it arrives.
`CASE` is the plane's real minted identifier prefix (`allocId("CASE", year)`
mints `CASE-<year>-<seq>`). **`FIND` is the FIXTURE's own id spelling and is
labelled as such** — the product's real prefixes are INFO/INQ/FOCUS/PROB/PROJ/
ACTN — and it is pinned anyway because the pin's job is to make movement visible,
not to be a claim about a live instance.

**An instrument property, reported and not corrected.** Both new structural rows
appear because the discriminator separating an ACRONYM from EMPHASIS is
per-SURFACE: an emphasis word is suppressed when the same surface also uses it in
ordinary case. The verify panes are one sentence long, so `CASE`, `FIND` and
(surface-authored) `NOT` have nowhere to be suppressed from. The rule is
unchanged; the granularity of the surfaces it runs over is what moved.

### THE FINDING THAT CONTRADICTS THE ITEM THAT ROUTED IT, AND IT IS A LIVE DEFECT

UI-36 was queued on the reading that `pubVerify`'s error branch "prints
`e.error || e.reason` verbatim under DEC-8". **MEASURED: it cannot, and no plane
word can ever reach that branch.** `apiQ` reaches the plane through `api`, which
is `fetch(...).then(r => r.json())`; it rejects only on a transport failure or a
body that is not JSON, and neither carries an `error` or a `reason`. The branch
always renders this surface's own fallback. Measured by the arm rather than read
off the source: translating that expression — a DEC-8 overstep — leaves the suite
**48/48 green and the report character-identical**.

**The consequence is worse than the dead branch.** Because `apiQ` does not throw
on `ok:false` (unlike `rec`, which does), a REFUSAL from `op=verify` arrives as an
ordinary value with `published` undefined and falls into the NOT-PUBLISHED branch.
So a reader who asked a question the plane DECLINED to answer — the control plane
answers `{ok:false, error:"verify requires sha256=<64 lowercase hex>"}` with HTTP
400 — is told **"No published part answers to that hash. A hash that was never
ratified and a hash that never existed are the same answer here, deliberately."**
That is a substantive claim about the record standing in for a refusal to answer,
on the one surface whose entire purpose is "check this without us", to somebody
holding no credential. **It is reachable by a click**: the container row composes
its hash as `bundle_sha || ""`, so a case whose `verification` block names a
finding the case body does not carry sends an empty hash and gets exactly this.
Measured through the op, with the plane's refusal read textually out of
`bio-plane/src/index.mjs` rather than typed.

**The surface was NOT changed to fix it**, and that is deliberate: DEC-49 is open,
and every reading in this chain is worth what it is worth because nothing on the
surface moved while the reading was taken. The state is pinned by an assertion in
the instrument with a comment saying it pins a DEFECT and is the assertion to
CORRECT (never exempt) when the fix lands, and it is routed.

**WHAT THIS STILL DOES NOT ESTABLISH.** UI-31's limit is unchanged for the two
published READ ops — `op=publishedmanifest` and `op=publishedcase` are driven from
wire-shaped fixtures, so their plane-sourced column remains a lower bound. What
has changed is that `op=verify` is no longer a THIRD, unnamed lower bound: it is
driven, its answers are harvested, and its rows are in the subject. The three
call-site paths its answers carry (`bundle.md`, `snapshots/memo.bin`,
`MANIFEST.json`) are this fixture's, so a live instance's part paths may carry
terms these do not.

**SUPERSEDED IN PART BY UI-37, 2026-08-04 — and the part that is superseded is
the SURFACE, not the reading.** Every number in this entry stands: it was taken
against an app.html this item did not touch, which is exactly why it was worth
taking. What no longer describes the shipped product is the DEFECT recorded
above — UI-37 fixed it, and the assertion this entry says pins a defect has been
corrected at the site. Read the next entry before quoting the refusal behaviour
described here as current. One reading in this entry did move and it moved for a
good reason: the plane-sourced source list for `sha256` now includes
`case-address-at-load #v-refused`, because the refusal this entry found being
SWALLOWED is now RENDERED.

## 2026-08-04, UI-37: the same instrument after the refusal is rendered — and the subject barely moves

**Why this entry is short where UI-36's was long: the interesting number is the
one that did NOT move.** UI-37 fixed D-195 — a plane REFUSAL rendered as a
substantive negative on the public verification surface — which necessarily puts
plane wording in front of an uncredentialed reader where none stood before. The
expectation going in was that DEC-49's subject would grow again. It did not, or
barely: **11 plane-sourced rows -> 11, with ONE new SOURCE on one existing term.**

**Instrument.** `civicos-ui/test/preauth-vocabulary.test.mjs`, in the harness
`node civicos-ui/test/run.mjs` runs. The measurement itself — walk 3's term
harvest, `planeRanges`, `countIn`, the HITS loop, the report and `REPORT_ONLY` —
is UNCHANGED. `UI31_HIDE` was widened to take a comma list so the four new
scenarios can be hidden together; that is a change to the CONTROL, not to the
measurement.

**THE BASIS MOVED AND IT IS STATED RATHER THAN ABSORBED (UI-34's rule, applied to
a bigger step).** 11 scenarios -> 15. The four new ones drive the two SIBLING
public reads on this page, each in BOTH directions — the published index refused
and the published index genuinely empty, a case address refused and a case
address the record genuinely does not hold.

| reading | UI-36 | UI-37 |
| --- | --- | --- |
| scenarios | 11 | 15 |
| surfaces walked | 19 | 22 |
| characters harvested | 35,835 | 38,637 |
| plane-vocabulary terms | 13 | 13 |
| occurrences in rendered HTML | 67 | 68 |
| occurrences a member READS | 57 | 58 |
| DEC-49's plane-sourced rows | 11 | 11 |

**THE FOUR NEW SCENARIOS MOVE NO NUMBER IN THE VOCABULARY REPORT, MEASURED.**
Run against the FINAL app.html with all four hidden: 54/54 green, 11 scenarios,
22 surfaces, 36,527 characters, 13 terms, **68 occurrences and 58 visible — the
same figures as the full run** — and the DEC-49 subject arm PASSES. So the four
add 2,110 characters of harvest and four assertions, and everything that moved in
the report came from the FIX, on surfaces this walk already covered.

### THE SUBJECT, ROW BY ROW

- `sha256` gains `case-address-at-load #v-refused` as a PLANE source. That is
  `op=verify`'s own refusal — "verify requires sha256=<64 lowercase hex>" —
  rendered instead of swallowed. **It is the whole of the movement.**
- Nothing vanished, nothing arrived, no other source moved. `manifest`, `CASE`,
  `FIND` and `bundle.md`'s four sources are exactly as UI-36 left them.

### WHAT THE INSTRUMENT CANNOT PIN, NAMED HERE RATHER THAN LEFT TO BE FOUND

"We added plane wording to a pre-authentication surface and the subject did not
move" is a claim a reader should distrust until it is itemised, so:

- The control plane's `unknown op` refusal now renders on THREE pre-authentication
  surfaces (`#v-unknownop`, the published index and a case address). It is real
  plane wording standing in front of a stranger. It contains none of the 74
  inherited terms and trips neither structural rule, so the sweep has nothing to
  pin — a fact about the sweep's vocabulary, not evidence the wording is harmless.
- The store's own `NOT_PUBLISHED` sentence now renders WHOLE at a case address the
  record does not hold, replacing a surface-authored stand-in. Same finding.
- `NOT_PUBLISHED`, the bare reason CODE, briefly DID reach the subject while this
  item was being written, because the first version of the surface's selector
  joined `reason` with `detail`. The instrument caught it. It was corrected to
  prefer the plane's PROSE and keep the bare code only when the plane sent nothing
  else — UI-30's rule — so a SCREAMING_SNAKE wire code does not stand in front of
  a stranger when a sentence was available. Recorded because the near miss is the
  argument for the guard.

### WHAT THIS STILL DOES NOT ESTABLISH

UI-31's limit is unchanged and UI-36's is unchanged: `op=publishedmanifest` and
`op=publishedcase` are still driven from wire-shaped fixtures, so their
plane-sourced column remains a lower bound. UI-37 drives their REFUSAL arms from
sentences read textually out of `index.mjs` and `store.mjs`, which is stronger
than a fixture for those arms and says nothing about their success answers.

## 2026-08-04, DIST: the first deploy of the accumulated session work (plane 0.56.0 + UI)

Instrument: `bio-plane/scripts/deploy.mjs` and `civicos-ui/deploy-ui.mjs`, both of which
hash the local asset and compare it against the bytes read back from the account; plus
`curl` against the live origins. Authorised by Bob 2026-08-04.

| | before | after |
| --- | --- | --- |
| plane `biosmoke7` `/version` | 0.55.0 | **0.56.0** |
| UI `civicos` `/build` | `0310e07894d8` | **`74cc1646044b`** |

**Verified, not assumed.** The plane's deployed bytes were confirmed hash-identical to the
built asset and the rollout gate waited for 0.56.0 to actually serve (4s, 2 checks). The UI's
deployed module was confirmed hash-identical after extracting it from the multipart envelope
the account returns, and **the served page is byte-identical to `civicos-ui/app.html` on
`main`** (sha256 `74cc1646044b9429`, 940,664 bytes). The service binding survived: the UI's
`/api/?op=instance` returns the plane's own `{"ok":false,"error":"unauthenticated"}` at HTTP
401 — the plane answering through the binding rather than the UI inventing a reply.

**What is now live that was not.** Grepped in the served bytes, not inferred: `Access token`
present and `MEMBER_TOKEN` gone from anything a member reads (UI-33 — its two remaining
occurrences are inside a source comment describing the change); `NOT ANSWERED` present
(UI-37's refusal branch); `the group that published it` present (UI-33); `BAD_PASSWORD`
absent (UI-30, the code REC-41 retired).

**What this measurement does NOT establish**, stated because the gate says to. (1) It is a
DEPLOY, not a RELEASE: `BIO_RELEASE_SEED` is not on this machine, so nothing was signed,
`release/RELEASE.json` and its asset are untouched at 0.55.0, and **a group installing
through `newgroup` still receives 0.55.0**. (2) `op=audit` is NOT clean — 10 `C-18.9`
findings, recorded as D-200, and measured to be pre-existing record state rather than
anything this deploy caused. (3) Durable-Object-routed ops can lag the Worker rollout, and
no behavioural probe was run beyond the unauthenticated envelope above.

## 2026-08-05 — REC-54 / D-200: the ten bundles that claim a route they cannot show

Instrument: `op=audit` and `op=image` against the live plane (store `bio`), read-only;
then the REAL derivation run over the REAL registers in a local Miniflare store, never
against the record.

**The live audit, re-measured before any change** (confirming 2026-08-04's figure):
31 checked · 21 clean · **10 with errors, tally `{"C-18.9": 10}`**.

**All ten have the `provenance_chain` key ABSENT, not empty.** This was measured rather
than assumed, and it matters: the check collapsed *no chain recorded* and *a chain
recorded and empty* into one message, so the audit could not have told the difference.
Zero of the ten are the empty case.

**What the register ALREADY held for each of the ten**, which is what made them
reconstructible rather than lost:

| what | count | note |
| --- | --- | --- |
| `locator` + `retrieved` + `capture.method` (the fetched route) | 9 | all `daemon-fetch`, `actor_class: daemon`, `grade: B` |
| a `custody` block naming holder and instant (the member route) | 1 | `INFO-2026-5460`, `member-upload`, `grade: A`, `locator: "in hand"` |
| an RFC3161 token from `freetsa.org` over the bytes | 10 | binds the BYTES to an instant, never the address |
| a `co_archive` archive.org replay URL | 8 | **corroboration, NOT a hop** — see below |
| documents per register | 1 each | no multi-document register among the ten |

**The chain requirement POST-DATES the bundles, and that is the whole explanation.**
The ten were captured 2026-07-19..22; C-18.9's chain arm was written 2026-07-31. The
field was never populated because it did not exist when the bytes landed — while the
FACTS a hop carries were recorded at capture time in the same register. This is why all
ten reconstruct and none is lost, and it is a cohort fact rather than a lucky one.

**`co_archive` is not a hop, and reading it as one would understate the route.** Eight
of the ten carry an archive.org replay URL. It records that we ALSO asked an archive to
keep a copy, not that the bytes REACHED US through one. Writing it as a second hop would
state an archive-sourced capture — a WEAKER route than what happened — and would
contradict the `grade: B` those same registers carry, B being what a direct capture by
this instance earns (`EARNED_CAPTURE_CEILING`). The recorded grade is itself evidence the
route was direct and single-hop.

**The write path, measured:** `runGate` — the only thing that runs the check catalog —
has exactly ONE call site in `src/index.mjs`, `op=ratify`. `op=release`, the other way an
Information document reaches `verified`, checked three of C-2.7's entry requirements and
never asked C-18.9's question at all.

**Repair advice that names an impossible transition:** 5 occurrences in
`checks/bio-checks.mjs` advise returning a bundle to `collected`;
`STATES.information.edges.verified` is `["retired"]`, and C-4.2 refuses the transition by
name. Recorded as D-203; the missing retraction route is D-204. (RENUMBERED at integration 2026-08-05: this worker allocated D-202/D-203 while the DIST session allocated D-202 for the declared-vs-deployed config gap and landed on main first, so the established collision protocol applies and the later allocation moves.)

**Battery, measured in this worktree:** 100/100 at 5,664 before any edit; 101/101 at
5,730 after. The +66 is ATTRIBUTED per suite by diffing per-suite counts, not estimated:
`provenance-chain.test.mjs` +63 (new) and `hygiene.test.mjs` 423 -> 426 (its three
per-file assertions over the new file). **No other suite moved by one assertion.**
`node scripts/coverage.mjs --strict` run directly with `$?` read unpiped: exit 0,
131/131 ops, 53/53 checks, 101/101 suites declaring a control, 300 arms.

## REC-56 · repair advice measured against what the plane can do (2026-08-05, rec56-agent)

Instrument: `bio-plane/test/repair-reachability.test.mjs` — a source-level walk over
every `f(...)` call in `checks/bio-checks.mjs`, judged against `STATES` (the edge
tables) and `deriveActs` (the plane's own published act derivation). Every figure below
is read out of those tables at run time rather than written down, so it moves when they
move.

**The catalogue, measured by the walk itself (it prints the figure on every run, so a
corpus that SHRANK is visible):** **213 repair strings across 41 of the 53 checks**, of
which **6 are MOVE DIRECTIVES** after this item's corrections. **SEVEN sites in THREE
state machines advised an act nobody can perform** — the routing predicted four.

| site | machine | why it could not be followed |
| --- | --- | --- |
| C-18.1 ×2 (`checkReleaseAuthority`) | information | `verified -> collected` is not an edge |
| C-18.8 ×2 (`checkSignedRelease`) | information | same |
| C-2.8 (`checkPublishedExtension`) | inquiry | `published -> concluded` is not an edge (`published: ['open','surfaced']`) |
| C-2.8 (`checkDividedExtension`) | inquiry | `divided` is TERMINAL (`divided: []`) |
| C-2.8 (`checkConcludedExtension`) | inquiry | **the edge IS legal and the OP SURFACE refuses it**: `REOPENABLE_FROM` excludes `concluded`, `deriveActs` does not publish `reopen` there, and `store.reopen()` answers NOT_SET_DOWN |

**The `collected` advice was unfollowable in BOTH readings, not one** — measured rather
than assumed. Appending the transition fires C-4.2's edge arm; setting `current_state`
without appending fires C-4.2's agreement arm (`current_state 'collected' disagrees with
last transition to 'verified'`). There was no careful way to comply.

**`op=release` is not repeatable, so the FIRST repair in each C-18.1 array was as
unreachable as the second.** Both arms fire only at or past `verified`, and `release()`
refuses anything already there (ILLEGAL_TRANSITION). Recorded as D-210; it is the same
question as DEC-56 and is not decided here.

**Battery, measured in this worktree:** 102/102 at **5,801** before any edit — the brief
said 5,799, and the measurement governs, the same way REC-55's did. 103/103 at **5,845**
after. The +44 is ATTRIBUTED per suite by diffing per-suite counts, not estimated:
`repair-reachability.test.mjs` +39 (new), `hygiene.test.mjs` 429 -> 432 (its three
per-file assertions over the new file), `planning-hygiene.test.mjs` 243 -> 245 (the two
new DEBT rows). **No other suite moved by one assertion.**
`node scripts/coverage.mjs --strict` run directly with `$?` read unpiped: exit 0,
131/131 ops, 53/53 checks, 103/103 suites declaring a control, 309 arms (303 before).
## 2026-08-05, UI-35: who reads what `op=publishedcase` publishes

Instrument: the op DRIVEN under miniflare against the real plane (a probe built
from `bio-plane/test/publishedcase.test.mjs`'s own fixture, dumping the answer's
key paths), plus a consumer walk over `civicos-ui/`, `newgroup/`, `docprofile/`,
`pdf-worker/`, `bio-plane/test/` and `civicos-ui/test/`. The standing assertion
is `civicos-ui/test/publishedcase.test.mjs` block 16, which re-reads the plane's
own success return rather than trusting any fixture.

**THE ITEM'S PREMISE IS CONTRADICTED, and this is the measurement.**
`op=publishedcase` publishes **NO top-level `detail` for a case that was FOUND**:

| path | top-level keys | `detail` present |
| --- | --- | --- |
| found, a case | 21 | **no** |
| found, ratified bytes in no case (`#looseEditionState`) | same single success return | **no** |
| refused | 3 (`ok`, `reason`, `detail`) | yes — and `pubOpen` renders it (UI-37) |

So the field UI-33 measured as "rendered nowhere for a case that was found" is
not published on that path at all. Neither branch the item offered applies:
there is nothing to render and nothing to withdraw. What was actually there is
the MIRROR of the premise — the SURFACE read `c.detail` in `pubStateHtml`'s
not-a-case branch, for a field the wire never sends, and the suite's `LOOSE`
fixture INVENTED that field, so the dead branch rendered as though it were alive.
196 assertions never noticed; the paired negative control measures exactly that.

**FOUR PUBLISHED TOP-LEVEL FIELDS NO SURFACE READS**, which is the sweep and is
larger than the one field the item named. Counts exclude vendored copies of the
plane — `newgroup/src/release.mjs` embeds the whole of `store.mjs` as a STRING,
and counting it reported the plane as its own consumer, which made every key look
consumed on the first pass:

| field | surface | installer | fleet | plane battery | reading |
| --- | --- | --- | --- | --- | --- |
| `opened` | 0 | 0 | 0 | 0 | **zero consumers anywhere.** The surface renders `ratified_at` and never this |
| `case_detail` | 0 | 0 | 0 | 0 | the plane's account of why a case has no case-level strength (DEC-44) |
| `graph_detail` | 0 | 0 | 0 | 0 | the plane's account of `serves[]`/`names[]`/`unresolved[]` — all three of which this surface renders |
| `bias_acknowledgement` | 0 | 0 | 0 | 7 | **a SURFACE GAP, not an unconsumed publication**: the gate enforces it (C-21.1) and the battery asserts it |

`bias_acknowledgement` is the one that bears on the record's honesty. It carries
the GROUP's own acknowledgement of the bias the case was produced under (REC-47,
DEC-46 (a)) — a DISCLOSURE the reader weighs. DEC-34's per-page header does show
a `Declared bias`, but it is computed from HUNCH legs in `pubDeclaredBias`, which
is a DIFFERENT fact. **A reader of the public record never meets the group's own
sentence.** Not fixed here: rendering it adds plane wording to a pre-authentication
surface, which is DEC-49's SUBJECT, and UI-33's precedent is that the measurement
basis is not moved as a side effect of another item.

**WHAT THIS DOES NOT ESTABLISH.** The loose (`#looseEditionState`) answer is
measured at SOURCE level and by the shared success return, not driven end to end:
no suite in the plane's battery drives that branch at all, which is itself a gap
and is reported. The consumer walk is anchored on the wire name and reads
property access, computed access and destructuring; a field consumed through a
SPREAD would be invisible to it, so the one spread in the return
(`...(asked ? { asked } : {})`) is enumerated and pinned by its own assertion.

## 2026-08-05 · UI-40 · the `op=publishedcase` consumer walk, RE-MEASURED across the whole repository

Instrument: `civicos-ui/test/publishedcase.test.mjs`, the UI-40 consumer-walk
block — **it is IN THE SUITE rather than in prose, so it can be RE-RUN rather
than quoted.** The 2026-08-05 UI-35 table above was taken by hand and recorded as
prose; this re-measurement exists because REC-41's precedent is that an item's
claim about consumers is a claim until somebody measures it again, and REC-41's
own item was WRONG ABOUT ITS OP while right about its field.

**Corpus, printed on every run so a corpus that shrank is visible:** 226 files,
7,730,838 characters, after comments are blanked and with newlines preserved so a
reported line number is one a person can check by hand.

| field | surface | installer | fleet | tools | plane battery | producer | reading |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `opened` | 0 | 0 | 0 | 0 | 0 | 2 | **zero consumers outside the producer.** Both reads are `store.mjs` reading its own SQL row. **CONFIRMS UI-35** — removed under IC-22 |
| `case_detail` | **1** | 0 | 0 | 0 | 0 | 1 | now RENDERED verbatim by `pubPlaneAccount` (UI-40) |
| `graph_detail` | **1** | 0 | 0 | 0 | 0 | 1 | now RENDERED verbatim per finding, beside the arrays it accounts for (UI-40) |
| `bias_acknowledgement` | 0 | 0 | 0 | 0 | 7 | — | unchanged; DEC-59's, deliberately out of UI-40's scope |

**THE RE-MEASUREMENT AGREES WITH UI-35 ON `opened` AND CONTRADICTS THE ITEM ON
SOMETHING ELSE.** UI-40 states that this surface "already renders"
`serves[]`/`names[]`/`unresolved[]`. It rendered **none of them**: measured ZERO
reads of `.serves`, ZERO of `.names`, and the only two reads of `.unresolved` in
`civicos-ui` belong to the subresource and reference surfaces and have nothing to
do with this op. What the surface rendered was `division` — the PLANE's own
derivation of `names[]` — and each basis leg's `served` flag, which the CONTROL
PLANE derives from `publishedTargets`. Two derivations of the graph, and never
the graph. A comment at the head of the published-case section asserted the split
came from "its own `serves[]`/`names[]` arrays"; no line of the file read either.
Corrected by BUILDING what the comment claimed (`pubGraphHtml`), not by softening
the sentence.

**THREE COUNTING TRAPS, and the second is the one no brief named.**

1. `newgroup/src/release.mjs` embeds the whole bundled plane AS A STRING — a
   3-line file whose second line is 1,737,506 characters — so a naive walk counts
   the plane as its own consumer and every key looks consumed.
2. **`release/bio-plane.bundled.mjs` is a SECOND embed of the same bytes
   (1,681,700 characters).** A walk excluding only the file it was warned about
   would still have counted the plane as its own consumer, through a different
   file. Both are excluded STRUCTURALLY — by the generator's banner AT BYTE 0 and
   by the bundler's own first line — and never by filename.
   **AND THE FIRST VERSION OF THAT EXCLUSION WAS ITSELF WRONG IN THE DANGEROUS
   DIRECTION:** testing whether a file CONTAINED the banner also excluded
   `newgroup/scripts/embed-release.mjs`, the GENERATOR, which contains the banner
   because it writes it. Excluding real source is the worst failure available to
   this walk — a consumer living there would have been invisible and the answer
   would still have read "zero". Caught by the arm that requires exactly two
   exclusions, each over a megabyte.
3. REGEX LITERALS. A scanner treating `'` as a string delimiter runs through
   `/won't/` and swallows everything to the next apostrophe. The first version did
   exactly that and reported FEWER sites than exist — a confident wrong answer in
   the generous direction, the same shape as UI-35's 27,059-character "return
   statement".

**THE SPREAD, and it is why the removal is asserted through the op.** The control
plane answers `json({ ok: true, ...c, findings, verification })`. `opened` reached
the wire **without `index.mjs` ever naming it**, so grepping the control plane for
the field returns nothing while the field ships. A source-level assertion that it
was gone would have proved nothing about what a caller receives.

**WHAT THIS DOES NOT ESTABLISH.** The walk reads property and computed access. A
field consumed by DESTRUCTURING (`const { opened } = c`) is not matched by the
read pattern; no such site exists for these fields today, but the walk does not
prove it for a field added later. The `#looseEditionState` branch is still driven
by no suite in the plane's battery — UI-35 reported that gap and it is unchanged
here (M0-11).

**AND THE MEASUREMENT THAT COST THE MOST TO GET RIGHT, recorded because it is the
argument for the paired arm:** with the walk neutered so it collects no files, the
headline assertion — *"`opened` has ZERO consumers"* — **STILL PASSES**. Zero
consumers over an empty corpus is an outcome that costs nothing to produce. It is
caught only by the PAIRED arm requiring the producer's own reads to still be
found, and by the positive control requiring a key that IS read (`ratified_at`)
to be found in `civicos-ui/app.html` on the same corpus.

---

## `case.opened` — WHICH OP PUBLISHES IT: none · 2026-08-05 · REC-58 (rec58-agent)

**Instrument:** `bio-plane/test/case-opened.test.mjs`, in the standing battery, so
it is RE-RUN rather than quoted. **Corpus MEASURED at 228 files / 7,817,469
characters** (UI-40 measured 226 / 7,730,838 the day before; the corpus is printed
on every run so a corpus that SHRANK is visible).

**Exclusion rule, stated because a walk's exclusions are the walk:** the two files
that embed the whole bundled plane as a string — `newgroup/src/release.mjs`
(1,737,506 chars) and `release/bio-plane.bundled.mjs` (1,681,700) — are excluded
**STRUCTURALLY, by what stands at byte 0**, and never by filename, because the next
generated artifact will have a third name. **The GENERATOR is KEPT IN:**
`newgroup/scripts/embed-release.mjs` contains the banner because it WRITES it, and
an exclusion that tested for the banner *anywhere* would drop a real source file —
UI-40's first version did exactly that, which is the dangerous direction: a
consumer living in the generator would have been invisible while the answer still
read "zero". Asserted as an arm, not as a comment.

**THE FINDING, AND IT CONTRADICTS THE ITEM THAT COMMISSIONED IT.** REC-58 was
queued to remove `case.opened` from `op=publishcase`. **`op=publishcase` does not
publish it and never did.** It dispatches to `Store.publishCase()`, which computes
no `opened`, reads none and returns none; the only occurrence of the letters in
that method is the word **"reopened"** inside a refusal sentence — so a scanner
that does not blank string bodies reports the field present and agrees with the
item. This is REC-41's lesson a third time: **right about the FIELD, wrong about
the OP.** IC-22 measured the field correctly and then wrote the wrong op into the
comment it left behind; REC-58 inherited that comment as its premise.

**Where it actually goes, measured:** `#caseEditionState()` returns `opened` and has
exactly TWO callers. `Store.publish()` — the ratification committer — returns the
state WHOLE (`case: caseState`), and that is an **INTERNAL Durable Object hop**:
`http://do/publish` is fetched **exactly once** in the whole control plane, inside
`if (op === "ratify")`. The control plane then builds `op=ratify`'s answer by naming
five fields (`edition`, `complete`, `awaiting`, `findings`, `detail`) and the
container manifest by naming its own list; `opened` is in **neither**.
`Store.publishedCase()` is the other caller and picks its fields likewise (IC-22).
And **`op=publish` is an ALIAS**: `DO_PATH` maps it to `publishcase`, so no op
reaches the spreading method through the generic passthrough either.

**So: ZERO consumers, and ZERO published surfaces.** `opened` is an unconsumed
**COMPUTATION** on an internal accessor, not an unconsumed **PUBLICATION**. No
`INTERFACE-CHANGES.md` entry was filed, because no published shape moves by a byte.
**RULING: KEEP** — `published_cases.opened` is a real recorded fact and
`#caseEditionState` is the one accessor whose job is to answer what a case edition
is; the risk is not that the field IS published but that it BECOMES published, by
one `...state` spread. All three picks are pinned, and the state is held as a
RELATION (computed here AND published nowhere) so that deleting the computation and
publishing the field both fail.

**WHAT THIS DOES NOT ESTABLISH.** As UI-40 recorded, the walk reads property and
computed access; a field consumed by DESTRUCTURING is not matched. It also does not
prove the *control plane* would drop a field added to `#caseEditionState` later —
only that it drops this one, by name.

**THE TWO MEASUREMENTS THAT COST THE MOST, both about the instrument:**

1. **The neutered walk reproduces UI-40's failure exactly.** With the corpus
   emptied, the headline *"`opened` has ZERO consumers"* assertion **STILL PASSES**.
   Caught only by the paired producer arm and the positive control on
   `ratified_at`. Asserted in-suite so the failure mode cannot be lost.
2. **The over-strictness arm found a defect in the instrument rather than
   confirming it.** Deleting the case-level `ratified_at` from the container
   manifest left the suite **fully green**, because the manifest's `findings:`
   array maps each member to an object that also declares `ratified_at` and a
   region-wide regex cannot tell the case's field from a member's. Replaced with a
   depth-1 key reader; the arm now fails 2. **A source-level pin still cannot see a
   field arriving by SPREAD** — that is caught only by the no-spread arm and by the
   through-the-op drive in `multifinding.test.mjs`, which is why both instruments
   exist.

---

## 2026-08-07, the consistency sweep (session BOB, instruments: grep/ls/wc against the tree at 81d3dc3)

The numbers `IS-SWEEP-2026-08-07.md` cites, recorded here with their instruments so
the sweep's citations rest on measurements rather than on prose. Each was re-run by
the recording session against the current worktree and answered identically.

- **105 of 105 test suites declare a `NEGATIVE CONTROL:` line.** Instruments:
  `ls bio-plane/test/*.test.mjs | wc -l` → 105;
  `grep -l 'NEGATIVE CONTROL' bio-plane/test/*.test.mjs | wc -l` → 105. The suite
  count and the declaring count are the SAME number, measured separately — the
  0/42 floor `VERIFICATION.md` carried before the sweep was stale on both terms.
- **`query.mjs` FIELDS = 34 entries; FTS_COLUMNS = 5** (`title`, `body`, `meta`,
  `locator`, `authority`, the literal at `src/query.mjs:113`). Instrument: grep of
  `src/query.mjs` — the `FIELDS` object's top-level keys counted, the
  `FTS_COLUMNS` array read whole.
- **`compile()` registers SIX statement builders** — `page`, `count`, `ids`,
  `snapshot`, `facets`, `facetScan`, the `statements:` return at
  `src/query.mjs:827`. Instrument: grep for the `statements:` literal.
- **OPS table = 131 entries, 63 non-mutating.** Instrument: grep over the
  `const OPS` literal in `src/index.mjs` — `mutating: false` → 63,
  `mutating: true` → 68, and 63 + 68 = 131 is the arithmetic check that no entry
  escaped the count.
- **STATES = FIVE machines** (`information`, `inquiry`, `focus`, `project`,
  `action` — `checks/bio-checks.mjs:127`; `STATES.problem` at line 253 is an ALIAS
  of `focus`, not a sixth machine). Instrument: grep/count of the `STATES`
  export's top-level keys.
- **The register's decision count is 59, and DEC-38 is ABSENT from the
  sequence** — 59 unique DEC-ids, the maximum is DEC-60, and exactly one number in
  1..60 never appears: 38. Instrument:
  `grep -o 'DEC-[0-9]*' docs/development/DECISIONS.md | sort -u`, gap-checked
  against the full 1..60 range. A reader counting headings and a reader reading
  "DEC-60" as a count of sixty will disagree by one; this row is which of them is
  right.


## 2026-08-07 — the meaning-layer grade indexes (PL-8 / D-222 (ii), D-223)

Instrument: `bio-plane/test/meaning-index-probe.mjs`, run as
`node test/meaning-index-probe.mjs [bundles] [reps]`. It is a PROBE, not a suite.
Engine `node:sqlite` (Node 26.5.0), NOT workerd — what is measured is the query
PLANNER's use of an index, which is SQLite core; the compound-SELECT ceiling is the
known workerd difference and is measured live in `meaningquery.test.mjs` instead.

**The statements are DRIVEN out of `compile()` and the pre-existing indexes are
DRIVEN out of `schema.mjs` AND `store.mjs`, neither typed into the probe.** That is
not a stylistic note: the FIRST version hand-wrote the indexes on `bundles`, MISSED
`bundles_fts_id` because it is created in `store.mjs`'s migration (`store.mjs:465`)
rather than in the schema text, and therefore reported a full scan of the bundle
table on every query and a **97% saving from an index the product has had for
months**. The corrected probe throws if the sweep does not find `bundles_fts_id`.

Corpus: synthetic, printed every run. At 20,000 bundles: 1,000 inquiries, 4,000
legs of which 80 hunch, 100,000 resolutions of which 25,000 grade C.

| query | no grade index | with | delta |
| --- | --- | --- | --- |
| `leg:hunch` @ 20,000 | 0.241 ms | 0.145 ms | −39.8% |
| `leg:hunch` @ 100,000 | 0.969 ms | 0.440 ms | −54.6% |
| `resolves:C` @ 20,000 | 14.35 ms | 8.45 ms | −41.1% |
| `resolves:C` @ 100,000 | 83.74 ms | 48.65 ms | −41.9% |
| `resolves:>=B` @ 20,000 | 20.67 ms | 16.35 ms | −20.9% |
| `concerns:ENT-7` @ 20,000 | 0.254 ms | 0.262 ms | +3.0% (already indexed on `entity_id`) |
| `leg:cuts_against` @ 20,000 | 0.752 ms | 0.684 ms | −9.1% (CANDIDATE index, DECLINED) |

**Decided and shipped:** `inquiry_basis(grade_source, bundle_id)` and
`resolutions(grade, bundle_id)`, both covering. The proportion on `leg:hunch` GROWS
with the corpus (−39.8% → −54.6%), which is the property being bought: the seek is
O(matching legs), the scan is O(all legs).

**Decided and NOT shipped, with the number:** `inquiry_basis(role, bundle_id)` at
−9.1% / −10.1% — a write cost on every leg of every promote for a read saving inside
the noise, because `role` has two values and an index is worth least where the value
is commonest. `connections(grade)` — no arm reads it; `concerns:` joins
`resolutions`, which is the base relation a connection is derived from, and
`meaningquery.test.mjs` DEMONSTRATES the superset rather than asserting it.

---

## 2026-08-07 — REC-70: how much of the plane `meaning-bounds.test.mjs` could actually see

**Instrument:** `bio-plane/test/meaning-bounds.test.mjs`'s own readers (`segments`,
`collectionReads`, and a new unfiltered `dispatchedOps` denominator), run over
`bio-plane/src/store.mjs` at 17,643 lines. Not an estimate — the same functions the suite
asserts with, re-run with the success-marker gate as the only variable.

**THE HEADLINE: a walk built to catch unbounded collection reads was grading 55 of the
plane's 156 dispatched ops, and read as a complete sweep.**

| | ops reached | BARE | BOUNDED | UNJUDGED | OPAQUE¹ |
| --- | --- | --- | --- | --- | --- |
| gate = `ok: true` (REC-60, as shipped) | **55** / 156 | 27 | 8 | 20 | **24** |
| gate = not `ok: false` (REC-70) | **82** / 156 | 41² | 10 | 31 | **8** |

¹ OPAQUE = DISPATCHED **and** calls `#rows(` **and** the walk reaches no verdict. This is the
blind-spot count, and `op=airunlog` was in it.
² 40 after REC-70 bounds `op=airunlog`. The ratchet moved **27 → 40**: the old figure was
never a smaller problem, it was a smaller measurement.

**THE CAUSE, and it was one line.** `collectionReads` graded only return objects containing
the literal `ok: true`. **27 dispatched ops answer success another way** — `found: true`
(`op=airunlog`, `op=airun`, `op=airuntick`) or **no marker at all**: `op=signerlist` →
`{ signers }`, `op=publishedlist` → `{ bundles, cases }`, `op=inboxlist` → `{ inbox }`.
**The 27, by the bucket they landed in once the gate was inverted:**

- **BARE (14)** — `airun`, `airunlog`, `airuntick`, `inboxlist`, `index`, `memberlist`,
  `publishedlist`, `readingnameplan`, `reusedparts`, `reuseverdicts`, `selection`,
  `signerlist`, `thread`, `verify`. **Every one a real unbounded collection read, hidden
  by one literal.**
- **BOUNDED (3)** — `projection`, `searchindexcheck`, and `airunlog` after REC-70 bounded it.
- **UNJUDGED (11)** — `cpuprobestate`, `discharge`, `governorstate`, `linksto`,
  `projectlinks`, `recordlinkverdict`, `recordsiteassets`, `resolvelinks`,
  `runtimeobservations`, `searchfields`, `sitechrome`.

The literal sat **four lines after** the same file's `BOUND_KEY`/`MORE_KEY` regexes, which
were deliberately written as SETS *"because the plane answers the second in five spellings
on purpose"*. **The instrument avoided the one-vocabulary mistake in its leaves and
committed it at its root.**

**A THIRD FIGURE, from the same run and not asked for:** under a NEUTERED walk
(`collectionReads` returning nothing) the RATCHET **stayed green at 0 of 40** while the
corpus printed as zero. A ceiling passes trivially over nothing. A FLOOR was added beside
it, and the neutering control now fails.

**Related:** D-227 (open) reproduces on this op — dropping only `LIMIT ?` and leaving the
envelope honest left `meaning-bounds` at 80/1 and `bounds` at **112/0, fully green**, with
only the direct SQL-bound pin firing. And `airun.test.mjs`, the op's OWN suite, stayed
**GREEN under the full restore**: it drives `op=airunlog` at six sites and none asks for
more than 200 rows, so it could never have caught this.

---

## 2026-08-07, VF-2: THE PLANE'S REFUSAL-CODE CORPUS, AND HOW MUCH OF IT A MEMBER CAN MEET UNTRANSLATED

**Instrument:** `civicos-ui/check-refusal-codes.mjs` (DEC-49's harness guard, built by VF-2), run
from `node civicos-ui/test/run.mjs`. It prints every figure below on every run, so none of
this is a snapshot somebody has to remember to re-take.

| | measured | how |
| --- | --- | --- |
| distinct refusal codes the plane can mint | **311** | union of six matchers over `bio-plane/src/**` (24 files) |
| — a plain `reason: "CODE"` grep alone | 294 | **the narrow answer, and it is 17 short** |
| codes IN REACH of a surface | **98** | 11 DEC-49 family rows + 50 named by `app.html` + 65 sent by a harness mock, R2/R3 intersected with the census |
| — of those, with NO canned translation | **74** | named individually on every run; a CEILING that may only fall |
| — of those, translated | 24 | 11 plane rows + 13 in `PART_REASON`, no overlap |
| codes NOT in reach and untranslated | 287 | REC-64's remaining sweep. Reported, never gated |
| DEC-49 families / rows | 3 / 11 | `AI_RUN_CHECKS` (C-22.x), `MEANING_READ_CHECKS` (C-23.x), `VERSION_CHAIN_CHECKS` (C-24.x) |
| governed (file, function) sites | 5 | derived from the rows' own `where` fields; 208 lines of body read, 8 refusals judged |
| the plane's own vocabulary texts | 8 vocabularies / 50 terms | `src/airun.mjs` + `src/queuestate.mjs` — DEC-49's UI-47 input |

**THE 17 THE NARROW MATCHER CANNOT SEE ARE THE POINT, and this is a receipt for writing a
vocabulary matcher as a SET.** They arrive three ways, and the guard prints each matcher's own
yield so a matcher that goes blind is visible rather than merely absent from a union:

1. **A TERNARY.** `subresources.mjs` mints `reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED"`.
   Both codes are ones `PART_REASON` translates and a member reads; neither is visible to
   `reason: "CODE"`. The first draft of this walk missed them.
2. **A COMPARISON SITE** (21 codes), where the plane or the surface branches on a code.
3. **A FAMILY LOOKUP where the code is a VARIABLE** — `MEANING_READ_CHECKS[key]` in
   `store.mjs`. **No source-text matcher can ever see these**, and all five `C-23`/`C-24`
   codes were missing from a confident-looking 306 until the family tables were made a
   matcher in their own right. The sixth matcher reads the DECLARATION rather than the call.

This is REC-70's failure one file over — a classifier admitting one spelling — and it was
found by the guard on itself rather than by a later reader.

**TWO FIGURES THE GUARD MEASURED ON ITS OWN INSTRUMENT, recorded because an instrument is
the most likely thing to be wrong:**

- **Arm C read a PARAMETER LIST as a function body and reported green.** Walking to the
  first `{` after a name lands on the default value in `meaningRows(input = {})` and on the
  destructuring pattern in `versionChain({ addressNorm = null, … })`. `meaningRows` failed
  loudly; **`versionChain` did NOT** — its pattern is long enough to look like a body, so
  the arm judged 0 refusals in it and passed. Fixed by balancing the parens first; the
  per-site body line count (`checkObservation 47L, checkCondition 7L, checkBound 8L,
  meaningRows 43L, versionChain 103L`) is now **printed every run** with a floor beneath it.
- **A CHARACTER FLOOR ON A TRANSLATION IS OVER-STRICT.** 20 characters failed the real
  `RUN_ENDINGS.cancelled` — *"a member stopped it"*, 19 characters, and a complete,
  accurate, member-readable sentence. The rule is a WORD floor now (three words for a
  vocabulary term, six for a DEC-49 translation, alongside this repository's existing
  40-character bar). A guard that only accepts the wording its author wrote gets switched off.

---

## REC-71 · WHAT A `where` GOVERNS — measured 2026-08-08, worktree agent-ab9e84c9e27f4eff7

Instrument: `civicos-ui/check-refusal-codes.mjs` (VF-2's DEC-49 guard) and a throwaway
sweep probe over every `where` in every `*_CHECKS` family. Tree: `a24f2b0` (PL-1 only).

**THE DEFECT WAS SCOPE, AND IT IS A NUMBER.** PL-1's two store-side rows carried
`where: 'src/store.mjs promote (the basis-version freeze arm)'`. The parenthesis said
"a region" to a human and nothing at all to the guard, whose `where` parser reads a FILE
and a FUNCTION. So the governed site became `promote` — **870 lines, the largest function
in the plane** — and **32 long-standing refusals that pre-dated the rows instantly owed
canned translations.** `node civicos-ui/test/run.mjs` exited 1 with exactly those 32.

**THE SWEEP OVER ALL EIGHT GOVERNED SITES, and it found more than the item predicted:**

| site | body | rows | refusals JUDGED | codes actually COMPARED to a row |
| --- | --- | --- | --- | --- |
| `src/airun.mjs checkObservation` | 47L | 4 | 4 | 4 |
| `src/airun.mjs checkCondition` | 7L | 1 | 1 | 1 |
| `src/airun.mjs checkBound` | 8L | 1 | 1 | 1 |
| `checks/bio-checks.mjs basisVersionFindings` | 213L | 14 | **0** | **0** |
| `src/store.mjs promote` | **870L** | 2 | 34 | 34 — **32 of them not the family's** |
| `src/store.mjs basisVersions` | 90L | 2 | 1 | **0** |
| `src/store.mjs meaningRows` | 43L | 2 | 1 | **0** |
| `src/store.mjs versionChain` | 103L | 3 | 1 | **0** |

**ONE `where` of the eight OVERSTATES — `promote`, and only `promote`.** No other family
holds a row whose function refuses something the family does not govern. The seven others
are exact *today*; UI-51's general point still stands about all of them, and `promote` is
where it bit because it is the widest function any row names.

**BUT FOUR OF THE EIGHT ARE UNFALSIFIABLE RATHER THAN EXACT, and that was not predicted.**
Arm C reads 449 lines across `basisVersionFindings`, `basisVersions`, `meaningRows` and
`versionChain` and **compares ZERO codes against a row** in any of them. Two causes, both
outside REC-71's fix:

- `basisVersionFindings` **PUSHES FINDINGS** and never returns an `ok:false` object, so
  arm C's matcher sees no refusal at all in 213 lines.
- The other three refuse through a local `refuse(key, detail)` helper — `return { ok:false,
  reason: key, … }` — where **the code is a VARIABLE**, so arm C records the refusal as
  "coded" and checks nothing. Any key at all passes. (It is not unsafe today: the helper
  reads `MEANING_READ_CHECKS[key].check` and an unknown key throws. It is unproven, not
  broken.)

**LINES READ IS NOT THE MEASURE, and the guard now prints both.** 546 lines of governed
span, 11 refusals judged, **10 codes actually compared**. `codesChecked` is a new floor.

**THE FLOORS WERE STALE IN THE GENEROUS DIRECTION, and it cost a control.** PL-1 grew the
census 311 -> 330 and the reach 98 -> 116 while VF-2's floors stayed at 311/98. That left
**19 codes of slack** — enough that neutering the widest matcher (M2) dropped the census to
325, still above the floor, and **negative control (e) went from RED to GREEN**: the guard
passed a reader that had lost an entire spelling. A floor with slack is not a ratchet. All
corpus floors are now the MEASURED figure. `bodyLines` is deliberately NOT ratcheted and
says why at the site: it FALLS whenever a `where` is correctly narrowed, which is the work
REC-71 licensed, and a gate that fires on correct work gets switched off.

**AFTER THE NARROWING**: 9 governed sites (7 whole functions, 2 regions of 19L and 16L),
`node civicos-ui/test/run.mjs` exit **0** read unpiped, battery **111/111 at 6,607 with
ZERO delta** (the `store.mjs` edit is comments only, proved by stripping comments from both
revisions and comparing byte for byte), `node scripts/coverage.mjs --strict` exit **0** run
directly, OPS 139/139, CHECKS 82/82.

### REC-71 · THE SAME DEFECT IN THE FAMILY NEXT DOOR — re-measured 2026-08-08 on the merged tree

Re-integrated onto `main` carrying **PL-1 + PL-12 + UI-51**. `node civicos-ui/test/run.mjs`
exited **1 with 36 failures, every one `NOT a row in BIAS_CHECKS`.** REC-71's original 32
were gone; these were **PL-12's `BIAS_CHECKS.BIAS_REFUSED` carrying `where: 'src/store.mjs
promote'` at whole-function granularity** and conscripting the same refusals. PL-12 was
rebased onto PL-1 but neither could see the region mechanism, which did not exist yet.
**A second overstating family within hours of the first is the measurement saying the
convention needed to exist.**

**36 AND NOT 34, and the extra two are the sharpest part.** A whole-function `where` also
conscripts the refusals **the other family's regions correctly govern** — `VERSION_FROZEN`
and `VERSION_LEG_UNRESOLVED` failed against `BIAS_CHECKS`. Two families naming one function
means each one's rows judge the other's refusals.

**THE JUDGEMENT CONDUCT ASKED FOR: `BIAS_REFUSED` GETS A REGION.** PL-12 named `promote`
deliberately, and its reasoning was right — the code fires there rather than in
`checkBiasExtension` with its ten siblings, and naming the site is what puts it inside the
guard's governed set. **Only the GRAIN was wrong. Being an ENVELOPE is a fact about the
refusal's SHAPE — it wraps per-finding codes — and says nothing about its SPAN.**
`BIAS_REFUSED` fires at one statement inside one `if`. What WOULD justify the wider
spelling is stated at the marker: a `where` may name a whole function when every refusal
that function makes is the family's business — true of `airun.mjs`'s three check functions,
and unlikely ever to be true of a function that both validates and writes.

**THE SWEEP, RE-RUN — 5 families, 13 governed sites:**

| | before the fix | after |
| --- | --- | --- |
| whole functions / regions | 11 / 2 | 10 / 3 |
| **OVERSTATING** (span holds refusals the family does not govern) | **1** (`promote`, 970L, 34 conscripted) | **0** |
| **UNFALSIFIABLE** (span read in full, ZERO codes compared) | **7** | **7** |
| total span lines | 1,843 | 896 |

**SEVEN OF THIRTEEN GOVERNED SITES ARE UNFALSIFIABLE, and PL-12 added three of them** —
`checkBiasExtension` (158L), `biasInhale` (111L), `biasAdopt` (58L), alongside
`basisVersionFindings`, `basisVersions`, `meaningRows`, `versionChain`. **776 lines read,
zero codes compared.** Arm C's teeth reach **5 of 13 sites**. That is a measurement, not an
impression, and the guard now prints it every run with a `codesChecked` floor beneath it.

**THE FLOORS HAD GONE STALE AGAIN WITHIN HOURS** — census 330 → 341, reach 116 → 127,
11 codes of slack in each. Remeasured. **A floor with slack is not a ratchet, and a family
added without moving the floors is a family whose codes buy slack for everybody else's
walk.**

**A PIN CORRECTED, NOT EXEMPTED, and it is the defect in miniature.** Control (r2) pinned
**32** — `main`'s figure on the PL-1-only tree — and measured **33** once PL-12 landed,
because PL-12 added a refusal to `promote`. **A whole-function `where` conscripts refusals
that arrive AFTER the row is written: the set it claims is not fixed when it is written, it
grows with the function.**

**AFTER**: 13 governed sites (10 functions, 3 regions of 19L/16L/23L), `node
civicos-ui/test/run.mjs` exit **0** read unpiped at **40 suites**, battery **112/112 at
6,746 with ZERO delta**, `--strict` exit **0** run directly, OPS 143/143, CHECKS 93/93.
The `store.mjs` edit is comments only, proved by stripping comments from both revisions and
comparing byte for byte.
## 2026-08-08, FLEET FL-1: can a fleet-member Worker hold a WHOLE investigative run inside the paid CPU ceiling? (D-218) — and the DO storage-ceiling posture that rides the same measurement (D-190)

**D-218's reasoning, which the row itself said must not be trusted until measured:** an
agent loop spends most of its time WAITING on API responses, and Workers bill CPU rather
than wall time, so a run of many minutes may sit well inside the paid ceiling. **Measured
today, and it is CORRECT — but it is not the finding that matters.** The ceiling that
decides FL-3's shape is not CPU at all. See "what actually binds" below.

### Instrument, and the rule that shaped the whole probe

**`bio-plane/test/fl1-cpu-probe.mjs`** — a DEPLOYED probe. Throwaway `fl1-*` Worker scripts
uploaded over the Cloudflare REST API to account `20b533579290b9b93168345edd3b7f72`,
invoked through the account's own `*.workers.dev` egress, then DELETED and confirmed gone by
re-listing (`["biosmoke7","civicos","newgroup"]` before and after, every pass). The plane and
the installer were NOT deployed and not touched. Precedent: `free-tier-fleet-probe.mjs`
(2026-07-31) and `scratchpad/plan-probe.mjs` (2026-08-04).

**THE NUMBER COMES FROM THE PLATFORM, NEVER FROM THE WORKER.** `src/cpu.mjs` records the
fabrication: Cloudflare freezes `Date.now()` during synchronous execution as a timing-attack
defence, so a Worker cannot time its own compute (D-56). The instrument is therefore the
**Cloudflare GraphQL Analytics API**, `viewer.accounts.workersInvocationsAdaptive`,
`sum { cpuTimeUs requests subrequests errors wallTime }` and
`quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 memoryUsageBytesP50 memoryUsageBytesP99 }` —
the platform's own observation of what it billed, taken from outside the isolate.

**THE PLAN, re-confirmed today by provocation rather than inherited from 2026-08-04:** a
throwaway uploaded with `limits.cpu_ms: 50000` was **ACCEPTED, HTTP 200, `{"cpu_ms":50000}`
echoed back**. Workers **PAID**. Every arm below was then deployed with `limits.cpu_ms:
300000` — also accepted — so the arms ran under the 5-minute maximum, not the 30 s default.

**The payloads are REAL.** `bio-plane/test/fl1-real-payload-sweep.mjs` sweeps the LIVE plane's
non-mutating ops and THROWS if fewer than 8 answer or the median body is under 200 B. Corpus
on the day: **23 real op responses, 159,350 B, median 470 B, max 77,839 B** (`projection`
77,839 · `search` 36,795 · `list` 10,238 · `index` 10,223 · `affordances` 6,482 · down to
`dangling` 90). No body was embedded without first proving it contained no credential.

### The five subjects, five-plus invocations each — MEASURED

Every figure is `sum.cpuTimeUs / sum.requests` from the surface above. Nothing here is a
vendor number and nothing here is self-timed.

| Arm | What it does | Wall (platform) | **Billed CPU / invocation** | Memory P50 |
| --- | --- | --- | --- | --- |
| `fl1-idle` | returns immediately — the empty case | 0 ms | **0.30 ms** | 0.75 MB |
| `fl1-wait` | 25 subrequests each held open 2 s | **50,038 ms** | **4.29 ms** | 1.28 MB |
| `fl1-agent` | 25-turn loop, real payloads, growing transcript | 5,095 ms | **24.29 ms** | 9.8 MB |
| `fl1-agentx4` | the same loop at 100 turns | 10,643 ms | **189.28 ms** | 51.2 MB |
| `fl1-burn` | 40,000,000 reference iterations | 1,078 ms | **1,071.01 ms** | 1.75 MB |

**D-218's claim is CONFIRMED, and the arm that could have falsified it is `fl1-wait`:
50.0 SECONDS of wall time cost 4.29 ms of billed CPU.** Net of the 0.30 ms floor that is
**~0.16 ms per awaited subrequest, independent of how long the wait lasts**. Waiting is
effectively free, exactly as the row reasoned — now measured rather than argued.

**Calibration into this file's existing currency.** The 2026-07-29 row records *40,000,000
reference iterations fit* on Free, found by `op=cpuprobe` walking into the kill. **Those same
40,000,000 iterations are 1,071 ms of billed CPU here.** The two rows are now in the same
units: what Free killed at ~1.07 s of compute, Paid bills as 3.6% of the 30 s default.

### The curve — and WHAT ACTUALLY BINDS

Run separately with `--curve`, same instrument, same corpus:

| Turns | **Billed CPU / invocation** | Memory P50 | Memory P99 | Bytes serialised & sent |
| --- | --- | --- | --- | --- |
| 25 | 24.29 ms | 9.8 MB | — | 2.6 MB |
| 50 | **56.26 ms** | 15.7 MB | 20.3 MB | 9.6 MB |
| 100 | 189.28 ms | 51.2 MB | — | 36.7 MB |
| 200 | **757.65 ms** | 81.0 MB | **120.4 MB** | 144.1 MB |
| 400 | **4,488.9 ms** | 58.1 MB | — | 568.8 MB |

**CPU grows as roughly n^1.9 in turns** — 16× the turns cost 184.8× the CPU, and the 25-turn
and 400-turn points independently imply the same exponent. That is the transcript being
re-serialised every turn, which is O(n²) by construction and is what a real agent loop pays.

**Extrapolated on the measured exponent: ~1,100 model turns fit the 30 s default ceiling and
~3,700 fit the 5-minute maximum.** Labelled as an extrapolation from measured points, not a
measurement.

**BUT CPU IS NOT WHAT BINDS, AND THIS IS THE FINDING FL-3 SHOULD BE BUILT ON.** At 200 turns
the platform reports **memoryUsageBytesP99 = 120.4 MB against the 128 MB isolate**, while CPU
is still 757 ms — **2.5% of the 30 s ceiling**. Memory reaches the wall roughly an order of
magnitude sooner than CPU does. All seven 400-turn invocations nevertheless COMPLETED, so
this is pressure rather than a kill: the runtime collects hard instead of dying. The honest
statement is that **a single invocation is bounded near 200–400 turns by MEMORY, with CPU
headroom to spare** — and the naive reading, that CPU is the thing to design against, is
wrong on this evidence.

### Two other ceilings, measured in passing

- **EXTERNAL subrequests per invocation: at least 160, with NO refusal** (`fl1-subreq`, 160
  sequential fetches to an off-account origin, `MAX_REACHED_WITHOUT_REFUSAL`, 24.88 ms CPU).
  On Free this file records **51**, found by being refused. The walk stopped at its own cap,
  so 160 is a FLOOR on the ceiling, not the ceiling. Cloudflare's docs claim 1,000 on Paid —
  **theirs, not ours.**
- **A WORKER CANNOT FETCH ANOTHER WORKER ON THIS ACCOUNT'S OWN `*.workers.dev` NAME.**
  Measured 2026-08-08 (`fl1-attribution-diag.mjs`): **404, body `error code: 1042`, in 7 ms**,
  every time. The SERVICE BINDING to the same script answered **200 in 1,885 ms with a
  1,500 ms delay honoured**. This cost two probe passes: the arms looked like a CPU story and
  were a routing story. **A fleet member reaches the plane by service binding (I6's pattern)
  or not at all.**

### NEGATIVE CONTROL — RUN, and the fabrication demonstrated rather than asserted

FL-1's row names the control: *the probe timing itself in-Worker is REFUSED as the fabrication
`cpu.mjs` records.* It is STRUCTURAL, not a promise. Every cpu figure enters the findings
through one function, `recordCpuMs()`, which throws `FabricatedMeasurement` unless the
reading's provenance is the platform's observed surface.

- **`fl1-selftimed` is a deployed arm whose only job is to be refused.** It times a
  20,000,000-iteration burn with `Date.now()` and declares its own provenance. The gate threw,
  every pass.
- **And it would have LIED.** The Worker's own clock reported **0 ms**. The platform billed the
  same script **498.57 ms** for the same work. The frozen clock is not a caveat inherited from
  2026-07-29; it is re-demonstrated here on Paid, at 5 invocations.
- **The gate's own empty case is guarded**, because a control that refuses everything asserts
  nothing: seven bad shapes — `undefined`, `null`, `{}`, a reading with no source, one sourced
  to `vendor-docs`, one with no `cpu_ms` — are ALL refused, while a real platform reading is
  still accepted. Both halves are asserted on every run.

### D-190 — the DO storage-ceiling posture, recorded in this row because it rides the same measurement

D-190 records the **vendor claim** (10 GB per object on Paid, 1 GB on Free) and says the growth
curve per captured document has never been measured by us. It is measured now, and by a
per-object instrument rather than a vendor page.

**Instrument:** the plane's own `op=stats` → `dbBytes`, which is workerd's
`ctx.storage.sql.databaseSize` (`src/store.mjs:11209`) — the runtime reporting the object's
size, which is not the refused class. Read live, read-only, on both namespaces:

| Namespace | `dbBytes` | bundles | files | register | history | connections / entities / resolutions |
| --- | --- | --- | --- | --- | --- | --- |
| `scratch` (empty) | **925,696** | 0 | 0 | 0 | 0 | 0 / 0 / 0 |
| `bio` | **6,402,048** | 31 | 142 | 88 | 244 | **0 / 0 / 0** |

- **Empty-schema baseline: 925,696 B.** That is what an instance costs before it holds anything.
- **Marginal cost: 176,657 B per bundle** with its files, register rows and history.
- **Against the vendor's 10 GB claim that is ~60,800 bundles; against 1 GB, ~6,073.** The
  denominator is theirs; the numerator is ours.

**WHAT THIS INSTRUMENT CANNOT SEE, and it matters more than the number:**

- **The platform's own storage surface cannot answer D-190 at all.**
  `durableObjectsStorageGroups` carries **no per-object dimension** (only dates) and on this
  account returned **zero rows**. `durableObjectsPeriodicGroups` IS per-object (`objectId`,
  `name`) and reports `cpuTime`, `rowsRead`, `rowsWritten` and — usefully —
  `exceededCpuErrors` / `exceededMemoryErrors`, **but no stored bytes**. So the ceiling D-190
  is about has no platform reading; `dbBytes` off the object itself is the only handle.
- **Two points are a line, not a curve.** It cannot show super-linear growth.
- **AND THE LOADED POINT HAS AN EMPTY MEANING LAYER — `connections`, `entities` and
  `resolutions` are all ZERO.** D-190's row says three IS mechanisms and D-224's quadratic
  `connections` table grow the SAME object, and **not one of them is in this number.** So
  176,657 B/bundle is a **FLOOR on the cost and an OVERSTATEMENT of capacity**, and D-224's
  measurement is the one that would move it. Recorded so nobody reads 60,800 as headroom.

### What the instrument cannot see (the CPU half), stated because every measurement here states its own limits

- **The billing surface cannot NAME a fresh script.** For a script created minutes ago BOTH
  `scriptName` AND `scriptTag` come back as the literal `"__unknown__"`, and an exact
  `scriptName` filter therefore matches nothing. Attribution here is by **disjoint time window
  plus a declared per-arm signature** (subrequests and wall ms per invocation); an arm whose
  row cannot be identified unambiguously reports **NO NUMBER**, and several did across the
  passes rather than being guessed at.
- **The dataset SAMPLES** — it is `workersInvocationsAdaptive` for a reason. Six invocations of
  `fl1-wait` were reported as four on one pass while every other arm came back 1:1. Per-
  invocation means survive that; exact counts do not, which is why counts are reported
  (sent vs seen) rather than used as the handle.
- **Ingestion lags, and ORDER is part of the instrument.** An arm run last had its window come
  back empty inside a 10-minute polling budget. The negative control and the ceiling walk are
  now run FIRST for that reason.
- **`cpuTimeUs` is Cloudflare's own statement of what it billed.** We cannot verify it
  independently; it is the surface the bill is computed from, which is what D-218 asks about.
- **The waited-on "API" is our own responder Worker, not Anthropic.** It reproduces a turn's
  SHAPE — a real network wait, a real response of a real size, really parsed — not Anthropic's
  latency or payload distribution.
- **The corpus is ONE development instance's real op responses.** A loaded instance's
  `projection` and `search` bodies would be larger, so every agent arm is a FLOOR on the work.
- **Five-plus invocations per subject, five subjects, and the key arms reproduced across four
  independent passes** (`fl1-agent` 19.73 / 20.84 / 20.36 / 24.29 ms; `fl1-burn` 1,185.59 /
  1,000.03 / 969.31 / 1,071.01 ms). Enough to expose an outlier, not enough for a tail.

## 2026-08-08, CONDUCT: `store.mjs`'s line count, and why the figure moved out of CLAUDE.md

Instrument: `wc -l < bio-plane/src/store.mjs`, on `main` at PL-4's integration.

**21,248 lines.** `CLAUDE.md` said ~16,300, itself a correction of ~4,900.

**The number has been wrong in that file FOUR times**, which is the finding rather than the figure:
it read ~4,900 for weeks against a real 16,287 — more than three times out, and unmeasured
precisely because it read as a rough order of magnitude; REC-52 corrected two files on
2026-08-04 and a THIRD site was found still stale the next day; and it has now drifted again
by ~5,000 lines in four days as the investigative-session build lands.

**So the line in `CLAUDE.md` no longer carries a number — it carries the command.** A
hand-carried figure in a document nobody re-measures goes stale silently, and this session
has met that class repeatedly in instruments: a roster pin corrected to a number two items
already disagreed about, a census floor sitting 19 codes low that had ALREADY flipped a
control from RED to GREEN, and three separate floors going stale within hours of each other.
The durable fix is the same everywhere: **do not carry the answer, carry the way to get it.**

What the size actually costs a reader is unchanged and stays stated: a stray byte makes plain
`grep` treat the file as binary and silently match nothing, so `grep -a` is required.

## 2026-08-08 · D-216 · does a shared inquiry have ONE stance, or a PER-PROJECT one? — the W0 model check that decides whether PL-13 is the right item

**THE ANSWER: PER-PROJECT. `INVESTIGATIVE-SESSION.md` §7 IS CORRECT AND CLONING IS NOT THE
HONEST ANSWER — driven, not read.** Two projects stood on two different readings of one shared
inquiry simultaneously, the plane refused neither, and after the divergence each team still saw
every version and every leg of the other's reading. **Nothing in the model requires one shared
stance.** PL-13 is the right item and is UNBLOCKED, with one scope change stated below.

### The instrument, and it is the deliverable

| What | Where |
| --- | --- |
| The probe | `bio-plane/test/d216-sharing.probe.mjs` — `node bio-plane/test/d216-sharing.probe.mjs` |
| Its negative controls | `bio-plane/test/d216-sharing.control.mjs` — edits `src/store.mjs`, restores verified by sha256 AND by content |
| Result | **38 assertions, 38 pass, 0 fail**, 2026-08-08, node v26.5.0 |
| Battery cost | **ZERO.** Neither file ends `.test.mjs`, and both `scripts/battery.mjs` and `scripts/coverage.mjs` discover on exactly that suffix |

**NEITHER FILE IS A DESIGN DOCUMENT AND THAT IS THE POINT.** The design documents are what
RAISED this question, so they were not allowed to answer it. Every row below is the real
control plane (`src/index.mjs` under miniflare, not the store alone) answering an op a caller
holds: `op=select` · `op=cite` · `op=promote` · `op=backlinks` · `op=stats` ·
`op=strengthbarof` · `op=basisversions` · `op=versionaccept` · `op=versioncurrent` ·
`op=versionhide` · `op=inquirystrength` · `op=image`.

### What was established, and how

| Question | Answer | How it was driven |
| --- | --- | --- |
| Is there a real edge by which two projects reference one inquiry? | **Yes** | Two project bundles carrying `references[] {rel: cites, target: INQ-…}`; `op=backlinks` on the inquiry returns both, `from_type: project` |
| What is it called? | **`cites`**, a row in `refs` | `op=backlinks` reports `rel: "cites"`; §7's *"a `refs` edge"* names the right family and `cites` is the member of it |
| Is the edge REAL or only frontmatter? | **Real** — `refs` grew by exactly **2** across the two project writes | `op=stats.refs` **3 → 5**, measured as a delta with the baseline taken after every unrelated write |
| Does the plane WALK it many-to-one? | **Yes, and it composes over both at once** | Crossed bars: A declares capture `A`/connection `C`, B declares capture `C`/connection `B`. `op=strengthbarof` answers `source: project`, `projects: [A, B]`, **capture `A` (from A) and connection `B` (from B)** — an answer no single-project walk can produce |
| Can two projects stand on DIFFERENT readings? | **Yes, simultaneously, with no refusal** | `op=versioncurrent` A → "opening account", B → "the audit alone"; `op=basisversions&project=` reads back both, and they differ |
| Does one team's act move the other's? | **No** | A's pointer is byte-identical across B's act, and NON-NULL on both sides of it |
| Is the investigation still shared after divergence? | **Yes** — the property cloning destroys | After divergence both projects still read the IDENTICAL version set, both readings, all legs |
| Does the inquiry itself hold a stance? | **No** — §7's forbidden place is empty in the bytes | The inquiry's `bundle.md` carries no `current_versions` and no `current`; a read naming no project gets **no `current` field at all**, not a default |
| Where does the per-project pointer hang? | **A `current_versions[]` row on the PROJECT's own `bundle.md`**, dated and attributed | `op=image` on each project; A's row says `version: "opening account", by: "ruth"`, B's says `"the audit alone"`; the Session Log carries `| Stands on | ruth` |
| Is it a settings row? | **No, and no stance table exists at all** | One writer (`#setProjectCurrentVersion`) which PROMOTES the project; `op=stats` counts every table the store keeps and none is a stance counter |

### DOES ANYTHING *REQUIRE* ONE SHARED STANCE? — the arm that would have killed PL-13

**No.** Three facts, each driven:

1. **The edge is LOAD-BEARING rather than decorative.** Marking B's citation `severed` in B's own
   document — the row STAYS in `refs`, because a severed edge is a recorded judgement and never a
   deletion, and `op=backlinks` reports its status as `severed` — makes `op=versioncurrent` refuse
   B with `VERSION_CURRENT_UNRELATED`. A project that never cited the question is refused in the
   same words. So a stance is not something any project may take about any question, and it is not
   a property of the question either.
2. **The mechanism is not two-only and divergence is not compulsory.** A third citing project also
   stood on a reading, and two projects standing on the SAME reading is permitted.
3. **The one place the model composes across projects is the BAR, not the STANCE** —
   `#requiredStrengthFor`'s strictest-wins, and the site says so in its own words. The distinction
   is right: a bar is a floor two teams must both clear, a stance is what one team reads the
   evidence to say.

### THE FINDING THIS CHECK DID NOT GO LOOKING FOR, AND IT OUTRANKS THE ANSWER

**`op=cite` REFUSES TO CITE AN INQUIRY INTO A PROJECT, SO THE EDGE §7 RESTS ON HAS NO CURATED
PRODUCER.** Measured: `op=cite` with a project as the citing object and an inquiry in the
selection answers `NOT_INFORMATION` — *"citing Information means Information."* The rule is one
line in `cite()`:

    ontoInquiry ? !(ty === "information" || ty === "inquiry") : ty !== "information"

REC-37 widened the act so a QUESTION may cite another question — **driven here and it lands** —
and left the PROJECT arm exactly as it was. So today a project draws on a question only by
authoring its own `bundle.md` and calling `op=promote`. That route works and is a real op a member
holds; `refs` is re-derived from the document inside promote's transaction (D-21), so it writes
the same table `op=cite` would have. But the curated act, the affordance, the four beats and the
`ACT_FLOW` entry are all absent for the one relationship the whole IS build hangs on.

**WHY NOBODY SAW IT.** `versionstate.test.mjs`'s fixture hand-authors the project's `references[]`
and promotes — so PL-2's own suite drove the gate without ever asking whether a member can reach
it. **A fixture that authors the precondition cannot discover that the precondition has no door.**

**AND IT MAKES §7's AND D-216's CITED VERIFICATION WRONG.** Both say *"linking a bundle to a
project creates an EDGE (`linkproject` sits with the other edge-creating acts in `index.mjs`)"*.
`op=linkproject` is **link + project-as-a-VERB**: it takes a `capture=<sha256>` and projects that
capture's resolved links into `links_to` edges (`projectLinks`, `src/store.mjs`). It has nothing
to do with a project bundle, it cannot take one, and it never writes a `cites` edge. The
conclusion §7 drew is right; the evidence it cited for it is a name collision.

### WHAT PL-13 BECOMES

**PL-13 IS THE RIGHT ITEM AND SURVIVES — but half of its stated scope has ALREADY LANDED, and it
inherits one thing that has not.**

- **Already built by PL-2 and CONFIRMED here:** the dated, project-authored `current_versions[]`
  frontmatter row, its one writer, its one reader, the no-default-project refusal, the
  current-implies-accepted refusal, and the `VERSION_CURRENT_UNRELATED` gate. **PL-2's pointer
  SURVIVES this answer unchanged.** PL-13's row should be rewritten to say so rather than
  re-specifying it.
- **Genuinely outstanding:** the two FINDING-class notification slugs. Asserted ABSENT here —
  `queuestate.mjs` contains neither `stance-changed` nor `new-version-arrived` — so nobody can
  read this measurement as evidence the notification half exists.
- **NEW, and it is the scope change:** a project must be able to draw on a question **through an
  act**, not only by authoring a document. Either widen `op=cite`'s project arm to admit
  `inquiry` (one predicate, the shape REC-37 already used on the other arm) or record deliberately
  that a project's interest in a question is authored and never acted. Whichever is chosen,
  `op=sever` needs the same treatment — it is refused identically, so a project cannot withdraw
  from a question through an act either.

### WHAT THIS INSTRUMENT CANNOT SEE — stated, because a measurement without its blind spot overclaims

1. **ONE ISOLATE, ONE STORE.** Two projects here are two bundles in one Durable Object. This says
   nothing about two INSTANCES, which is a different sharing question and is not what §7 asks.
2. **TODAY'S CODE, NOT TOMORROW'S — and this is the sharpest limit.** `#strengthWalk` reads the
   inquiry's own `inquiry_basis` and **never a version's legs** (asserted over real source). So
   `op=inquirystrength` takes no project parameter, both teams read ONE derived pair, and **a
   per-project stance is INERT for strength today.** §6 rule 5 says current *"is what the effective
   strength pair is computed over"* — that half is NOT built. When PL-16 makes strength
   version-relative, re-run this probe: that is the change that could make the answer differ.
3. **AN ABSENCE OF REFUSAL IS NOT A PROOF OF PERMISSION.** "Nothing requires one shared stance" was
   established by driving divergence over the ops that EXIST and finding no refusal. An op nobody
   has written could still introduce one — which is exactly what `#requiredStrengthFor`'s
   cross-project composition shows is possible.
4. **IT DOES NOT MEASURE THE NOTIFICATION.** §7's two slugs do not exist; the probe asserts their
   absence rather than pretending to test them.
5. **THE PROBE DRIVES EVERY ACT AS ONE ADMINISTRATOR MEMBER.** Administrators see all projects
   (7.3), which is what lets one credential act for both teams. That is a convenience of the
   instrument and NOT a claim about the model; every stance is re-read through the plane rather
   than through that credential's privileges.

### The negative controls, RUN — and the third one is the reason to trust arm B

`node bio-plane/test/d216-sharing.control.mjs` — **3 arms, all AS DECLARED**, each armed alone,
every restore verified by sha256 AND by content, polarity re-checked green at the end.

| Arm | What was broken | Measured |
| --- | --- | --- |
| 1 | the make-current gate's `draws` predicate → `true`, so any project may stand on any question | **36 pass, 2 FAIL** — exactly the two arms asserting the edge is load-bearing, and NOTHING else |
| 2 | **D-216's literal alternative**: `#currentVersionOf` reads the FIRST citing project instead of the named one — *one stance every referencing project must share* | **33 pass, 5 FAIL** — the ANSWER arm, the they-genuinely-DIFFER arm, both vacuity guards and the third-project arm |
| 3 | `op=basisversions` answers an EMPTY version list | **35 pass, 3 FAIL** — see below |

**ARM 3 IS THE DEMONSTRATION THIS ITEM WAS WARNED ABOUT, and it behaved exactly as the warning
said it would.** With NOTHING to see, the arm *"BOTH PROJECTS SEE THE IDENTICAL VERSION SET"*
**STILL PASSED** — two empty lists agree at zero cost. Only the NON-EMPTY guards failed. So the
equality was never the evidence; the guard is, and that is why it is there.

**TWO CORRECTIONS THE CONTROLS FORCED, both recorded as findings rather than smoothed away:**

- **ARM 2's declaration was WRONG and the control was right.** It predicted that *"the SAME field
  on project B carries B's own different row"* would fail. It did not — that arm reads B's
  `bundle.md` through `op=image` and never through `#currentVersionOf`, so breaking the READER
  cannot touch it. **That is the property worth having:** the per-project fact lives in the
  project's own bytes and survives a reader that stops honouring it, which is precisely why §7 puts
  the pointer in authored frontmatter instead of in a settings row.
- **THE HARNESS REFUSED TO ARM BLIND, correctly.** Arm 3's first anchor
  (`versions, count: versions.length, total,`) occurs TWICE in `store.mjs`, and an unguarded
  harness would have armed both. It was re-anchored on three lines rather than one.

**AND THE PROBE'S OWN FIXTURE CARRIED THE VACUITY DEFECT ONCE.** Its first draft gave BOTH
strictest axes to one project, so the many-to-one composition arm passed while proving nothing
about composition. The bars were crossed and the arm now takes capture from A and connection from
B. Recorded because it is this item's own warning arriving inside its own instrument.

## 2026-08-08 · REC-73 / D-229 — THE TWELVE `MACHINE_CANNOT_*` FENCES, UNDER COMPLETE PAYLOADS

**Instrument:** `bio-plane/test/machine-fences.test.mjs` (45 assertions, new) and its harness
`bio-plane/test/machine-fences.control.mjs` (5 arms, all RUN, all as declared). Driven through the
control plane against Miniflare, under an `ai` credential a member authored with a scope naming the
twelve acts — the credential layer deliberately held OPEN, so what answers is the identity fence.
The credential is MEMBER-SCOPED, so its viewer stamp is `member:ruth` and it sees exactly what she
sees; that is what makes "complete payload" mean what it says.

**THE MEASUREMENT, AND IT IS LARGER THAN THE ITEM PREDICTED. Neutering REC-46's ONE predicate under
COMPLETE payloads lets TEN of the twelve acts GO ALL THE WAY THROUGH.** PL-11 ran the same edit and
saw ONE success and eleven payload complaints, because its payloads were incomplete and each act
fell through to the complaint sitting behind the fence. With payloads that would otherwise succeed,
a machine credential: released a collected document to `verified`; concluded a question; reopened
one; published a case at edition 1; moved an action; wrote a correspondence entry at ord 0; divided
a question into two children; grouped a basis; set the group's required evidentiary strength (the
row reads back `author: token:ai`); and accepted a reading of the evidence. Every one of those is
recorded in the harness's own output.

**THE TWO THAT DID NOT, AND NOBODY KNEW THIS: `taskforward` and `taskresolve` answered `NOT_YOURS`.**
REC-4's assignee fence caught what the machine fence let past, so those two verbs are the only pair
in the family carrying a SECOND independent fence behind the first. It could not have been seen
before, because a payload that never reached the task could never reach the second fence either.

**What the fences themselves needed: nothing.** All twelve fire today and always did; REC-46's
predicate is untouched. The defect was in the CONTROLS — a refusal driven under a payload the plane
would have refused anyway has been shown to refuse, and has not been shown to be the thing that
refuses.

**THE SWEEP, and what it cannot see.** A walk over `store.mjs` computes, for every refusal, how many
distinct refusals sit BEHIND it in the same method — its SHADOW — and whether any suite pins it.
Measured: **380 methods, 111 identity-flavoured refusals, 66 of them shadowing something outside the
twelve.** The deepest are `NOT_THE_OWNER` (in `promote`, shadows 18), `CAS_STALE` (17),
`NO_SUCH_BUNDLE` (in `divide`, 14; in `groundInquiry`, 12). **Eight identity refusals shadow
something and are pinned by NO suite at all** — `BAD_HANDLE`, `EDITION_NOT_INCREMENTED`,
`LEASE_HELD`, `NOT_ACTIVE`, `NOT_AN_OWNER`, `NO_AUTHOR`, `NO_CASE`, `NO_OWNERS` — which is worse
than believed on half its evidence; it is not measured at all. The set is pinned as a SET rather
than a ceiling, so it cannot drift in either direction without somebody moving it deliberately.
The walk CANNOT tell a complete payload from an incomplete one — that judgement was made by hand
for twelve acts and no source walk can make it — it attributes a nested helper's refusal to the
enclosing method, and it reads "pinned" as a quoted literal in `test/`, so a code asserted through
a variable reads as unpinned. Every one of those errs towards reporting MORE work than exists.

**AND THE INSTRUMENT FAILED FIRST, INSIDE ITS OWN SWEEP.** The unpinned-set arm reads `test/` for
quoted codes and on its first run it read ITS OWN FILE, whose expected set is a literal array of
exactly those codes — so all eight counted as pinned and the arm reported an empty set, which would
have read as an estate with no gap in it. REC-73's subject arriving inside REC-73's sweep, found
the only way it could be: by running it. The walk now excludes itself and says why.

## 2026-08-08 · REC-78 / D-230 — THE EIGHT SHADOWED REFUSALS NO SUITE PINNED, DRIVEN

**Instrument:** `bio-plane/test/shadowed-refusals.test.mjs` (44 assertions, new) and its harness
`bio-plane/test/shadowed-refusals.control.mjs` (11 arms, all RUN). Driven through the control plane
against Miniflare, except `NO_AUTHOR` — see (a) below. `bio-plane/src/**` was NOT changed.

**THE SHAPE, and it is a GENERALISATION of REC-73's rather than a copy.** REC-73 varied the CALLER
because the twelve `MACHINE_CANNOT_*` fences guard WHO is acting; only some of these eight do. So
the rule one layer out is: drive the refusal under a payload complete in every respect EXCEPT the
one condition it names, then flip ONLY that condition and show the act complete. The success arm is
what makes the payload provably complete — measured rather than asserted.

**THE MEASUREMENT, AND IT IS LARGER THAN THE ROW PREDICTED, exactly as D-229's was. With its own
guard removed under a complete payload, FIVE OF THE EIGHT ACTS WENT ALL THE WAY THROUGH.** A member
ENROLLED under the handle `Hilda Krause`; a second member WROTE INTO a correspondence ledger another
member was holding, taking `ord` 0 so the lock-holder's own entry landed at 1 — two accounts of one
exchange interleaved, the precise harm `LEASE_HELD`'s detail names; a REVOKED member BECAME A
PROJECT OWNER; an administrator's 7.13 rescue CARRIED on a project that never had an owner; and a
published case was RE-RATIFIED at edition 2 while edition 3 already stood. **The other three fell to
the complaint sitting directly BEHIND the fence — `NO_CASE`→`NO_SUCH_CASE`,
`NOT_AN_OWNER`→`LAST_OWNER`, `NO_AUTHOR`→`NO_REGISTER`.** That is D-230's own thesis demonstrated
rather than argued: an instrument driving those three with an incomplete payload would have read the
refusal behind them and reported the fence proved.

**THE SWEEP'S FIGURES MOVED, AND THE PART THE ROW RESTS ON DID NOT.** D-230 quotes REC-73's sweep as
380 methods / 111 identity refusals / 66 shadowing. Re-measured on 2026-08-08 at `bb426ac`: **394
methods, 114 identity-flavoured refusals, 68 shadowing outside the twelve** — unrelated growth in
`store.mjs`. **The eight unpinned codes are unchanged.** REC-78's own walk prints **394 methods and
497 refusal sites** and floors both, as BLINDNESS floors rather than ratchets: a ratchet over the
plane's refusal count would fail whenever unrelated work retires a refusal, while a blind walk does
not drop by ten but to nearly nothing.

**THREE FINDINGS THE ROW DID NOT PREDICT, all about the SWEEP rather than the plane.**

**(a) `NO_AUTHOR` IS UNREACHABLE THROUGH ITS OP.** `op=provenancechain` is not in `SESSION_OPS`, so
a signed-in session is refused it outright (`"this operation requires a machine credential, not a
signed-in session"`), and every machine class that CAN reach it is stamped `token:<class>` by the
control plane, which is never blank. Measured at all four caller classes: session → refused the op;
admin class → `NO_REGISTER`; member class → `NO_REGISTER`; probe class → `NO_SUCH_BUNDLE`. **Not one
reaches `NO_AUTHOR`.** It is pinned at the Durable Object route where it IS reachable, and the
op-level unreachability is pinned beside it, structurally and behaviourally. **The consequence,
raised to CONDUCT rather than acted on: the act REC-54's own comment calls "a named member's
judgement" is one NO MEMBER CAN PERFORM.** REC-65 left this verb's identity claim OPEN and routed it
to CONDUCT; this is that question with a measurement attached.

**(b) FOUR OF THE EIGHT ARE NOT IDENTITY GUARDS AT ALL.** The sweep's classifier reads the 300
characters in front of a refusal for `author`/`owner`/`viewer`/`who`. In `enroll` the word `author`
occurs inside the DETAIL STRING of `NO_HANDLE`, the refusal directly in front of `BAD_HANDLE`; in
`#queueCaseFor` the word `viewer` is the method's own PARAMETER; `NOT_ACTIVE` and
`EDITION_NOT_INCREMENTED` are state and bytes checks that sat near ownership vocabulary. It errs in
the direction REC-73 declared — reporting MORE work than exists. **The pins are worth having anyway:
three of those four went ALL THE WAY THROUGH when neutered.**

**(c) `EDITION_NOT_INCREMENTED` CANNOT BE REACHED THROUGH THE PUBLICATION CEREMONY AT ALL.**
`publishCase` mints `MAX(published_cases.edition)+1` and a non-case ratification auto-increments, so
the number never regresses and never leaves a hole below itself. The ONLY route is an edition
AUTHORED INTO THE RATIFIED BYTES lower than the highest published — which is exactly what DEC-12
makes possible (the edition comes from the bytes the signature covers) and exactly what the refusal
guards. Two costs recorded at the site: **C-21.1 refuses a completeness claim carried forward**, so a
new edition's four sentences must be authored or the GATE answers and the refusal is never reached;
and **C-12.2 reads the snapshot key out of the history FILENAME** and demands
`<YYYYMMDD>T<HHMMSS>Z_<8 hex>`, so a free-form `snapKey` promotes fine and then fails the gate.

**AND THE INSTRUMENT FAILED FIRST, INSIDE ITS OWN CONTROL.** Arm (10) — blind the walk — came back
not as three clean failures but as `THE SUITE NEVER REACHED ITS FOOT`: with no refusal sites found,
the shadow table's print loop dereferenced a null and a `TypeError` ended the MODULE through no
assertion at all, taking all eight pins with it. Caught only because the harness READS THE FOOT LINE
instead of trusting the tally and reports a missing one as `-1`. Corrected at the site; the arm then
behaved exactly as declared. **REC-73's own five arms were re-run unedited and all five still behave
as declared; its arm (3) moved from 42/3 to 43/2 because REC-78 pinned the set that arm's third
failure came from, and the figure in its header was corrected in the same turn.**

## 2026-08-08 · M0-13 / D-231 — the intermittently red suite, and it was a live plane defect

**Instrument:** `bio-plane/.nc/probe-substance.mjs` (a driven probe against a real Miniflare plane,
written in this worktree and not landed), `bio-plane/test/suggest.control.mjs`, and
`bio-plane/scripts/control-register.mjs`'s own `readControl` over all 119 suites.

**Baseline measured in this worktree before anything changed: 119/119 suites green, 7,285
assertions, 101.1s.** The brief's figure was right for once — and it was still measured rather
than believed, because the worktree arrived with NO `node_modules` and the first battery run
reported `14/119 green` with 105 suites dying on `Cannot find package 'miniflare'`. **A battery
that cannot import its harness reports a shape indistinguishable from a catastrophic regression,**
and the only thing that separated the two was running `npm ci` and measuring again.

**THE CAUSE OF D-231 IS A WALL CLOCK INSIDE A COMPARISON THAT HAD TO BE TIME-FREE.**
`suggestVersion`'s local `substanceOf` excluded `name` and `derived_from` from PL-1's canonical
composition and nothing else. A composition's ground rows are
`ground<TAB>ground<TAB>asserted_by<TAB>at<TAB>statement`, and `#suggestionFrontmatter` stamps that
`at` with the server's clock at second resolution. The candidate is stamped NOW, every held reading
was stamped when written, so §6 rule 8's duplicate gate fired **only inside a one-second bucket.**

Driven, four scenarios, one inquiry each so none could contaminate another:

| gap between the two identical submissions | result |
| --- | --- |
| 0 ms | refused `SUGGEST_NOT_DIFFERENT`, `same_as` named |
| 100 ms | refused `SUGGEST_NOT_DIFFERENT` |
| 1,200 ms | **LANDED as a second version — the write gate did not fire** |
| 2,500 ms | **LANDED** |

**THE FLAKE WAS THE CHEAP HALF.** `suggest.test.mjs` runs in 510 ms and usually stayed inside one
second standalone; under a loaded battery it crossed. A duplicate that lands makes the version
count 7 where block 3 asserts 6, so CHECK 3 and `STRUCTURALLY NOTHING MOVED` go red together —
**exactly the 59 pass / 2 fail CONDUCT measured** — while a boundary crossed only by the later
renamed submission gives **the 60/1 PL-14 measured.** Both historical observations fall out of one
mechanism. Re-arming the cause reproduces the 2-failure signature ON DEMAND, which is what makes
this a diagnosis rather than a story.

**THE BRIEF'S SUSPECT WAS WRONG, and it is recorded because it is the obvious answer.** F10's
verbatim-resubmit key is CLEAN: `submission` is built from caller-derived fields twenty-one lines
BEFORE `nowIso` exists, and `nowIso` reaches only `first_at`/`last_at`. **There was no concurrency
in it at all** — `scripts/battery.mjs` runs its suites SEQUENTIALLY (`for (const file of suites) {
await run(file) }`), so no suite of ours was ever running beside another. Concurrency was never more
than the machine load that made the suite slow enough to cross a second, and that load comes from
other worktrees' batteries rather than from this one.

**THE CLASS SWEPT, and the class is one.** A read of every equality comparison over composed or
digested bytes in `src/**` found exactly ONE instance of *a server clock inside bytes compared
against stored bytes*: this one. The freeze (`prior.composition === v.composition`) is
document-derived-vs-stored and safe; the publish, manifest, bias-drift, selection-drift and CAS
comparisons carry no clock. Two sites are the class **recognised and closed on purpose** and are
worth naming as the house style: `container.mjs` pins ZIP entries to the DOS epoch *"never
`new Date()`… a serving clock in the bytes would change the container's hash on every request"*,
and `monitor_fired` REMEMBERS its tick epoch in `monitor_tick_epoch` because *"`now` cannot be the
epoch — a retry arrives with a new `Date.now()`."* `link_verdicts`/`reuse_verdicts` carry a clock
in a PRIMARY KEY by intent (append-only, `INSERT OR IGNORE`), which is the mirror image and is
documented as accepted.

**WHAT THE SWEEP COULD NOT SEE, stated rather than implied.** It was a source read over `src/**`
plus `checks/bio-checks.mjs`; it did not drive anything but the one endpoint. It cannot tell whether
any `bundle.md` in the wild carries `basis_version_grounds[].at` written by something other than
`suggestVersion` — a hand-authored document's stamp is document-derived and the gate behaves
correctly for it, so the defect was always suggest-vs-suggest. And **`sandbox.mjs`'s `$TMPDIR`
ownership (D-186) was never in play**: it is per-process and the battery is sequential, so nothing
here tests it either way. What this run CAN say about it is only what the battery printed —
`this run left 0 directories holding 0 miniflare sandboxes (was 0/0 before the suites ran)`, with
**44 host orphans present before and after, unchanged, belonging to other worktrees**. That the
count is unchanged is evidence the sweep spares a foreign owner as designed; it is NOT evidence
that per-process isolation holds under genuine concurrency, and no instrument here measured that.

**TWO RESIDUALS RAISED RATHER THAN FIXED.** D-232: the same gate is ALSO defeated by a quotation
mark, deterministically and with no clock — the candidate is composed from raw args while the bytes
it is compared against went through `#fmSafe`, which rewrites `"` and `\`, folds newlines and trims.
Driven, all within one second: a duplicate carrying a quote LANDED, one carrying a backslash LANDED,
one with trailing spaces LANDED. D-233: **the negative-control register's "arms stated" tally cannot
see a declaration written in the numbered style.** `countArms` counts ` -> ` arrows;
`suggest.test.mjs` declares TWELVE arms in `(1) … (2) …` prose and the register scores it **ZERO**.
Four of 119 suites score zero. Nothing is red because the arms count is reported and never gated —
which is precisely why the figure (388 on this tree, unmoved by adding two more arms) means less
than it appears to.

---

## 2026-08-08 — THE NEGATIVE-CONTROL REGISTER'S ARMS TALLY, REMEASURED AFTER D-233 (M0-14)

Instrument: `node bio-plane/scripts/coverage.mjs --strict`, run directly with `$?` read
unpiped, and `bio-plane/scripts/control-register.mjs`'s `readControl` over the corpus.
Tree: worktree `agent-ade8942ff3bb6367b`, at `e424af1` plus this item.

| figure | before this item | after | note |
| --- | --- | --- | --- |
| suites the register reads (corpus) | 120 | 120 | unchanged — the matcher's REACH did not narrow |
| suites declaring a control | 120 | 120 | unchanged |
| arms stated | **395** | **462** | **no suite's declaration was touched: the +67 is INSTRUMENT, not estate** |
| arms stated, final | — | **470** | the further +8 is this item writing its own six-arm control into `hygiene.test.mjs`'s declaration |
| declarations scored ZERO | 4 | 0 | zero is now a measurement; the absence of one is `null` |
| declarations UNCLASSIFIED and NAMED | 0 (the defect) | 1 (`case-opened.test.mjs`) | |

**The figure in this file's D-233 entry above — 388 — was itself stale by the time it was
acted on; the tree measured 395.** That is the sixth consecutive hand-carried figure in this
family to be wrong when re-measured, and it is why the instruction is now the command.

Per-suite, the 17 declarations whose count moved (measured by running the OLD detector and
the NEW one over the same sources, never by subtraction):

    bias 0 → 13 · strengthpair 0 → 17 · suggest 0 → 8 · case-opened 0 → null (UNCLASSIFIED)
    versionstate 1 → 10 · meaningread 5 → 9 · meaning-bounds 9 → 12 · bounds 7 → 9
    versionchain 5 → 7 · versions 5 → 7 · plane-envelope 11 → 12 · ratify-envelope 11 → 12
    capturerequests 9 → 10 · skillpack 8 → 9 · leadslug 7 → 8 · aicredential 5 → 6
    refuse-gate 3 → 4

Two of those are checkable against the suites' own prose and both land exactly:
`strengthpair.test.mjs` says *"THE SEVENTEEN ARMS"* and reads 17; `bias.test.mjs` says
*"THIRTEEN arms"* and reads 13.

**Stated as a limit rather than left to be discovered:** the tally is a FLOOR on arms
stated. `suggest.test.mjs` reads 8 against a real 10 because two of its arms carry LABELS
(`(D-231a)`) rather than ordinals, and widening the ordinal to any bracketed token would
count every `(D-113)` and `(DEC-46)` this prose is full of.

## The op-claim corpus, 2026-08-08 (M0-12)

Instrument: `bio-plane/scripts/op-claims.mjs`, driven by `bio-plane/test/op-claims.test.mjs`.
**Printed on every battery run**, so a corpus that SHRANK is visible rather than silent —
three separate walks this week reported a clean verdict over an empty corpus.

| | measured | note |
| --- | --- | --- |
| files scanned | **401** | walked, never hand-listed; `.mjs .js .md .html .json .jsonc .txt .sh` |
| characters scanned | **16,940,634** | |
| generated embeds excluded | **2** · `newgroup/src/release.mjs` (1,737,506) and `release/bio-plane.bundled.mjs` (1,681,700) | recognised STRUCTURALLY at byte 0, never by filename — REC-58's predicate reused verbatim. The GENERATOR is kept IN and asserted |
| `op=` mentions checked | **7,063** | over **199** distinct names |
| template-built names skipped | **79** | `op=version${act}` cannot be resolved from source; counted, not guessed at |
| ops declared (`OPS`, index.mjs) | **158** | the strict whitelist — the entire set of names `op=` may take |
| store dispatch routes (`map`, store.mjs) | **180** | DO paths, resolved from `pathname`. **No `op=` reaches this level** |
| `DO_PATH` aliases | **4** | `inbox→inboxlist`, `memberlist`, `signerlist`, **`publish→publishcase`** |
| sites naming a NON-op, first run | **135** over 93 `(file,name)` pairs in 38 files | 23 CORRECTED in `bio-plane/**`, which now reads **zero**; the rest ledgered and delegated |
| ledger registrations after the item | **64** pairs · **79** sites | held EXACTLY, in both directions |
| routing attributions found and checked | **6** | prose of the form "op=X dispatches to `Y()`" |

**The two language-reading drafts, measured and discarded** (kept because the number is
the argument): a 220-character negation window called **141** mentions of real ops claims
that they do not exist; tightened to +110/-40 it still called **48**, and every one
inspected was noise. See `VERIFICATION.md`'s section for the four worked examples.

## REC-72, 2026-08-08 — the curated-producer census, and a battery baseline the brief got wrong by four

**Instrument for the battery: `cd bio-plane && npm run test:battery`, exit read unpiped.**
Measured in REC-72's worktree at `722c37b` BEFORE any edit: **124/124 suites green ·
7,811 assertions · exit 0**. REC-72's brief carried *"around 124/124 · ~7,815 assertions"*.
**The suite count agreed and the assertion count was four high** — the tenth consecutive
item to find a figure in its brief stale by measuring it, and the smallest miss yet, which
is worth recording precisely because a near-miss is the kind a session waves through.

After the item: **125/125 green · 7,851 · exit 0.** The +40 is attributed per suite by
DIFFING the two runs' own per-suite lines, never by subtraction:

    citeproject-inquiry.test.mjs   new, 35   (the act driven through the control plane)
    citeinquiry.test.mjs           48 → 49   (REC-37's §8 case arm, corrected not exempted)
    repair-reachability.test.mjs   39 → 40   (its act oracle now proves it did not swallow a throw)
    hygiene.test.mjs              504 → 507  (its detector-reach arms are deltas over the real
                                              corpus, so a new suite with a control moves them)

**Instrument for the census: `node bio-plane/test/curated-producer.probe.mjs`** (a probe and
not a suite: it measures the estate and must not pin it). Over `REL_VOCAB` read out of
`checks/bio-checks.mjs`, **9 relations, 5 source files, 1,963,450 bytes walked, comments
blanked before matching**:

    WITH a curated producer  (5)  cites · derived_from · supersedes · links_to · responds_to
    WITHOUT one, authored-only (4)  relates_to · elevated_into · initiates · corroborates

`links_to` is the only one of the five written by an `INSERT INTO refs` rather than through
a document. **The first draft of this matcher read PROSE and scored two comment paragraphs
as producers of `cites`** — wrong in the generous direction, which is the one direction a
sweep for missing producers must never be wrong in; the blanking pass and an arm asserting
no hit falls inside a comment are the fix.

**And a figure the census could not have produced, because a source read cannot tell an
unreachable arm from an absent one — DRIVEN against the real control plane:**
`op=sever` on a QUESTION withdrawing a leg of its own basis answers
`{ok:false, reason:"NOT_A_PROJECT", got:"inquiry"}`, and `op=reinstate` answers identically.
`#spliceBasis` has exactly ONE caller in the plane. **A basis leg has a producer and no
withdrawal**, which is REC-72's own shape one altitude up and is delegated open.

## 2026-08-08 · D-224 — THE CONNECTION CURVE, MEASURED AT LAST (REC-66, worktree agent-a6c072dccb45cdaae)

**D-224 was raised on 2026-08-06 with an explicit instruction — *"a measurement first, and it
is cheap … Do not cap it before measuring; the point of the row is that nobody knows the
curve"* — and it had never been taken.** REC-66 took it before choosing a bound, and the
figures decided the bound rather than confirming one.

INSTRUMENT: `bio-plane/test/connections-growth.measure.mjs`, run directly
(`cd bio-plane && node test/connections-growth.measure.mjs 10 100 500 1000`). It promotes k
synthetic documents, testifies each onto one synthetic subject, and drives **one `op=connect`**
per subject. Bytes are the STORE's own (`op=stats` → `dbBytes`, i.e. workerd's
`ctx.storage.sql.databaseSize`); the duration is the harness's wall clock around the single
call. Miniflare on a laptop, so **the duration is an order of magnitude and never a latency
budget; `dbBytes` is the figure that transfers.** Measured against the UNBOUNDED derivation —
the state the op was in — with the bound removed by simply predating it.

| k (documents on one subject) | connection rows | k(k−1)/2 | dbBytes delta | bytes/row | one derive |
| --- | --- | --- | --- | --- | --- |
| 10 | 45 | 45 | 28,672 | 637 | 1 ms |
| 50 | 1,225 | 1,225 | 974,848 | 796 | 15 ms |
| 100 | 4,950 | 4,950 | 3,948,544 | 798 | 53–65 ms |
| 200 | 19,900 | 19,900 | 15,872,000 | 798 | 268 ms |
| 500 | 124,750 | 124,750 | 100,155,392 | 803 | 2,038 ms |
| 1,000 | 499,500 | 499,500 | 397,930,496 | 797 | 10,348 ms |

**THE ROW COUNT IS EXACTLY k(k−1)/2 AT EVERY LEVEL** — the curve D-224 predicted, now
measured rather than argued — and the cost per row is FLAT at ~798 bytes, so the storage
curve is the pair curve times a constant.

**WHAT THE NUMBERS DECIDE, and they are the reason the bound is where it is:**

- **ONE subject at k=1,000 consumes 398 MB — about 4% of the 10 GB per-object ceiling
  D-190 records as a VENDOR CLAIM — and takes 10.3 s inside a single synchronous
  `transactionSync`.** On a Durable Object that is one thread. D-190's own row says its
  slope "prices CAPTURE ONLY … a FLOOR on cost / an OVERSTATEMENT of capacity" precisely
  because its measured store had an EMPTY meaning layer; this is the missing half.
  **60,800 bundles of headroom is not headroom** if one heavily-covered subject can take a
  twenty-fifth of the object.
- **The bound REC-66 shipped is 500 pairs by default and 5,000 at the ceiling** —
  `#MEANING_LIMIT_DEFAULT`/`#MEANING_LIMIT_MAX`, the pair REC-60 already brought
  `op=concerns`, `op=resolutions` and `op=connections` to, so no figure is invented. Read
  against this table: the ceiling is **~4 MB and ~65 ms of write in one transaction**
  (k=100, 4,950 pairs) and the default is **~400 KB and under 2 ms** (32 documents, 496
  pairs). What it refuses to do in one call is the k=1,000 row above.
- **The DOCUMENT bound is not a second figure**: it is the inverse of the quadratic taken
  from the pair bound (`#maxEndsForPairs`), so 500 pairs admits 32 documents and 5,000
  admits 100, and the two can never disagree.

**WHAT THIS DOES NOT MEASURE, stated rather than left to be assumed:** the alarm-driven
sweep's cost across MANY dirty entities in one tick (this measures one entity per call);
read-side cost of `op=connections` over a large connection table; and whether pairs should
be materialised at all above some k, which is D-224's remaining design question and is
NOT closed by this measurement — the bound makes the cost knowable and refusable, it does
not decide the model.

---

## REC-63 · DEC-56's route marker — the numbers, 2026-08-08

Worktree `agent-ac23d92b0d07c1ab5`. Every figure below was PRINTED by the instrument named
beside it on a green run of that tree, never arrived at by adding to the number that was in
the file.

**THE BRIEF'S BATTERY FIGURE WAS 4 HIGH, found by measuring it before any edit** — the tenth
consecutive item to find a hand-carried figure in its brief stale. Measured baseline on this
tree at HEAD (`722c37b`), after `npm ci` (the worktree arrived with no `bio-plane/node_modules`;
`npm ci` exit read UNPIPED, 0):

| | brief said | measured | instrument |
| --- | --- | --- | --- |
| battery | ~7,815 assertions | **124/124 green · 7,811 assertions · 106.4s** | `npm run test:battery` |

**AFTER THE ITEM** (`npm run test:battery`, whole battery, clean run with nothing else touching the tree):

| | before | after | delta |
| --- | --- | --- | --- |
| suites | 124 | **125** | +1 · `provenance-marker.test.mjs` |
| assertions | 7,811 | **7,927** | +116, fully attributed below |
| ops declared / reached | 158 / 158 | **159 / 159** | `op=provenanceroute`, reached through the control plane |
| checks in catalog / named | 201 / 201 | **205 / 205** | C-34.1..4, every one named by an assertion |

Per-suite delta, and **every other suite is byte-identical**:

    provenance-marker.test.mjs   +113   (new)
    hygiene.test.mjs             +3     (one row each in three per-suite loops, for the new suite)

**THE DEC-49 GUARD** (`node civicos-ui/check-refusal-codes.mjs` from the repo root, exit 0
unpiped). Every floor was found sitting EXACTLY at the value REC-64 left — **no pre-existing
slack, the third item running for which that is true** — and every one was moved to the
figure this run printed:

| floor | before | after |
| --- | --- | --- |
| families | 13 | **14** (`ROUTE_MARK_CHECKS`) |
| rows | 145 | **149** |
| census | 406 | **410** |
| reach | 200 | **204** |
| governedSites | 59 | **60** |
| regions | 46 | **47** (`is-route-mark`) |
| regionLines | 1,263 | **1,289** (+26, the region's own span) |
| codesChecked | 115 | **119** (all four codes COMPARED, not merely read) |
| vocabularies / terms | 8 / 51 | **8 / 51** — unchanged, and deliberately |
| CEILING `reachGap` | 42 | **42** — unchanged, and deliberately |

**Two of those non-moves are decisions rather than accidents.** (i) The item reuses D-129's
`OBSERVATION_STATES` from `src/airun.mjs` instead of minting a private absence vocabulary,
so arm E's floors do not move and there is no second spelling of "which absence" to drift.
(ii) All four new codes arrive TRANSLATED, so `reachGap` neither falls nor rises — a ceiling
nudged for bookkeeping stops measuring the gap it was set to measure.

**THE REGISTER** (`node scripts/coverage.mjs --strict`, run directly, `$?` unpiped, exit 0):
arms 471 → **480**, classified 119 → **121**, corpus 120 → **122**.

**THE CLASS SWEEP'S OWN FIGURE**, measured by `provenance-marker.test.mjs` section I over
comment-stripped `src/store.mjs`: **23 swallowed reads** (a `catch` that turns something the
plane could not establish into a normal-looking answer), of which one is this item's own and
publishes what it met (`register_state`). **A hand count of `catch {` answers 18 and is FIVE
SHORT** — it cannot see `catch (e) {`, which is REC-70's one-vocabulary trap arriving in a
sweep whose whole subject is unstated absence.

## `git stash` IS REPOSITORY-WIDE, NOT PER-WORKTREE — 2026-08-08, M0-15

**Instrument:** `git stash push -u` run inside the worktree
`bio/.claude/worktrees/agent-a0e79024273135242`, then the filesystem inspected for
where the ref landed. Re-armed independently in a throwaway repository with two
worktrees (`.m015-harness/arm2-rearm-stash.sh`).

| what | measured |
| --- | --- |
| checkouts of this repository sharing one object store | **60** (`git worktree list`: `bio`, `bio-worktrees/BOB`, 58 agent worktrees) |
| where a worktree's `git stash push` writes the ref | **`bio/.git/refs/stash` and `bio/.git/logs/refs/stash` — the COMMON git directory** |
| the same worktree's own `.git/worktrees/<id>/refs/` afterwards | **EMPTY** |
| git's per-worktree refs (for contrast) | `HEAD`, `refs/bisect/*`, `refs/worktree/*`, `refs/rewritten/*` — `refs/stash` is not among them |
| does `push -u` carry UNTRACKED files across | **yes** — A's untracked `bio-plane/test/m015-phantom.test.mjs` appeared in worktree B after B popped, sha256 `a10e94a7059b7b180b178cb6421b0f1925fe20ff635768ebc7ef51e1c07257f9` on both sides |
| what `git status` in B then calls it | `?? bio-plane/` — **the DIRECTORY, not the file**, when the parent is wholly untracked. `git status` is the wrong instrument for "is this suite in a commit"; `git ls-tree HEAD` is the right one |
| an instance in this repository's object database | stash commit `8706832`, headed `On worktree-agent-a773e28c7c7d0fb8b: RESTORED BY UI-50 SESSION: another session's D-228 work, accidentally popped from stash by ui50`, containing `src/query.mjs`, `test/search.test.mjs`, `test/meaningquery.test.mjs` |

**Why it is a measurement rather than a git fact quoted from a manual:** the
consequence is local. Every worker here is briefed to re-measure a true baseline,
and the recipe most of them reach for is `git stash` — so the count of checkouts
sharing the stack is the number that matters, and it is 60. See D-238 and
`ORCHESTRATION.md`'s corrected recipe.

## THE BATTERY'S DISCOVERY PATHS AND WHAT FEEDS THEM — 2026-08-08, M0-15

**Instrument:** read out of `bio-plane/scripts/battery.mjs`,
`bio-plane/scripts/coverage.mjs` and `bio-plane/test/hygiene.test.mjs`.

| walk | discovers by | fed by | provenance checked? |
| --- | --- | --- | --- |
| `battery.mjs` plane suites | filename `*.test.mjs` in `bio-plane/test/` | anything that can write a file there without a commit | **YES (M0-15)** |
| `battery.mjs` fleet members | `fleet-member.json` at a repo-root directory | an untracked manifest enrols a whole DIRECTORY of suites | **YES (M0-15)** |
| `coverage.mjs` plane suites | same directory, independently | same | no — NAMED in D-238 |
| `coverage.mjs` fleet members | same manifest, independently, and **without** battery's `!d.startsWith(".")` filter | same | no — NAMED in D-238 |
| `hygiene.test.mjs` corpus (3 walks) | same directory | same | no — NAMED in D-238 |

**Neither battery walk can reach a sibling worktree**, checked rather than assumed:
the plane walk does not descend, and the fleet walk filters `!d.startsWith(".")`
while worktrees live under `.claude/worktrees/`. The phantom did not arrive by a
walk reaching out; it arrived by a write reaching in.

## 2026-08-08 · M-4 — do REFERENCE STRINGS vary the way LABELS do? The number REC-40's third tier shipped without

**Why measured.** REC-40 widened the name index from the label alone to all three
strings a reading reference carries, and gave the two PARTIAL correspondences —
a registered name sitting INSIDE a longer string, `name_in_reference` and
`name_in_label` — their own ranks below every whole match, with no grade. **The
posture was honest and the number behind it did not exist.** REC-36's n=41
variance probe (2026-08-04, above) was run over **labels**; its findings were
then quoted for the reference tiers, and nobody had established that reference
strings vary the same way. A number taken over one population and quoted about
another is not a measurement of the second. That is M-4, and it is `CLAUDE.md`'s
*measure, do not assume* applied to this project's own record.

**Instrument.** `bio-plane/test/ref-variance-probe.mjs`, re-runnable
(`node test/ref-variance-probe.mjs`, exit 0 = every gate held). NOT in the
battery — `scripts/battery.mjs` and `scripts/coverage.mjs` both discover
`*.test.mjs` and this is a `.probe.mjs`, so it joins nothing and no skip marker
exists to rot. Its controls are `bio-plane/test/ref-variance.control.mjs`
(`node test/ref-variance.control.mjs`), four arms, RUN — see below.

**It measures BOTH populations in ONE run, deliberately.** REC-36's label
findings are RE-MEASURED here rather than cited, so the comparison is between two
measurements taken by one matcher on one day and not between a measurement and a
figure carried in a document. **REC-36's headline numbers still hold exactly:
0 whole-label matches, 15 substring, 15 all-terms, over 33 names x 41 labels.**

**Population, stated because the item exists for a population error.** The same
ONE real captured document REC-36 used — `test/fixtures/legistar-agenda-1425405.pdf`,
oakland.legistar.com `View.ashx?M=A&ID=1425405`, the *Rules & Legislation
Committee supplemental agenda for 2026-07-16, fetched 2026-08-03, 276,421 bytes,
33 pages — read through the plane's own Tier-1 extraction (`src/pdfstructure.mjs`)
and the REAL reader (`docprofile`'s `meeting_agenda` doctype, detected `certain`).
**n = 41 reading references**, each contributing up to three strings: `ref` (41),
`ref_key` (41), `label` (41). These are the exact strings `#writeReadings`
persists, including the `ref` it COMPOSES. The 33 probe names are REC-36's own
construction, taken FROM the document (its body name, its `From:` offices, the
counterparties and places its item titles name); the alias strings used to probe
the reference population are taken from the reference population itself. Nothing
is a fixture written to agree.

### The numbers

| # | finding | measured |
| --- | --- | --- |
| 1 | **A subject name taken from the document is never anywhere in a reference string** — not whole, not as a substring, not as a term subset. Over labels the same 33 names hit 15. | ref **0 / 0 / 0**, key **0 / 0 / 0**, label **0 / 15 / 15** (whole / substring / all-terms), over 33 names x 41 strings |
| 2 | **A term of a reference reaches most of the corpus; a term of a label reaches a twelfth of it.** Row-weighted mean document frequency — draw a term at random from a string of the population and ask how much of the corpus it reaches. | ref **67.5%** (27.67 of 41), key **51.2%** (21.00 of 41), label **8.3%** (3.40 of 41). **An 8.1x difference in selectivity between the two populations.** |
| 3 | **Two of the reference population's 43 distinct terms reach EVERY string, and they carry two thirds of the index.** No label term reaches every label. | ref: **2/43** terms corpus-wide (`legislation`, `26`), carrying **82 of 123 rows (66.7%)**; key: **1/42** (`26`), **41 of 82 (50.0%)**; label: **0/194**, **0 of 305** |
| 4 | **The worst single-term alias reaches the WHOLE corpus at the partial-reference tier, and NOTHING at the label tier.** | `"legislation"` → **41/41 (100%)** references at `name_in_reference`; the same string → **0/41** labels. `"26"` → 41/41. The label population's worst term, `"and"`, reaches **15/41 (36.6%)** |
| 5 | **The partial-reference class is BIMODAL, and that is the finding the ranking turns on.** A firing alias is either the source's own identifier respelled — the strongest correspondence in the corpus in substance — or a vocabulary token that corresponds to nothing at all. Nothing sits between them. | `"legislation 26-0844"` (the reference with a space for its colon) → **1/41**; `"0844"` → 1/41; `"legislation"`, `"26"` → 41/41 |
| 6 | **Every variance class REC-36 measured over labels is ABSENT from the reference populations.** They are not noisy strings; they are not natural language. | comma, apostrophe, ALLCAPS token, non-ASCII, whitespace, line-wrap truncation: **0/41 on both ref and key**; on labels 7, 0, 17, 1, 41, 3 of 41 respectively |
| 7 | Terms per string, and what REC-40's widening cost this document's index | ref **3/3/3**, key **2/2/2**, label **2/8/12** (min/median/max). **510 index rows where REC-36's label-only index wrote 305 — +205, +67.2%**, for this one document |
| 8 | **STRUCTURAL, and a different kind of evidence: it reads the tree, not the corpus.** `docprofile`'s `entity(key, kind, label, facts)` helper emits no `ref` of its own, and `#writeReadings` composes `kind:key`. Two of five doctype files emit entities at all, with one kind value each. | `entity()` emits a ref: **false**; composition confirmed **true**; kinds in the whole tree: `legislation`, `meeting` |

### What it means, and it is loud

**REC-36's n=41 DOES NOT TRANSFER, and the reason is structural rather than
statistical.** A label is prose the reader transcribed out of the document; a
reference string in this tree is **machine-composed from a closed kind vocabulary
plus a source-assigned key**, and it is not sampled from the same kind of thing at
all. Findings 1 and 6 are not sampling artefacts — no amount of extra corpus puts
a person's name inside `legislation:26-0844`.

**THE TIER'S POSTURE IS VINDICATED, and by more than REC-40 claimed for it.** A
partial match inside a reference string is not a weak name correspondence; on this
corpus it is not a name correspondence at all. Carrying no grade is correct, and
finding 1 says so from the other direction: the 33 names a member could plausibly
register against this document reach the reference populations zero times by any
method.

**THE RANKING BETWEEN THE TWO PARTIAL TIERS IS CONTRADICTED BY THE ONLY NUMBER WE
HAVE.** `Store.#CORRESPONDENCE_RANK` places `name_in_reference` ABOVE
`name_in_label`, so a partial-reference candidate is offered to a member first.
Measured, a term of a reference is **8.1x less selective** than a term of a label
(finding 2), two reference terms reach the entire corpus where no label term does
(finding 3), and the single worst alias reaches **41/41 references and 0/41
labels** (finding 4). **On this corpus the partial-reference tier is the weakest
evidence available, not the second-weakest, and it is ranked as the second
strongest of the three name tiers.**

**But swapping the two ranks is NOT what this measurement recommends**, because
finding 5 says one rank cannot represent the class: the same tier holds
`legislation 26-0844` (one reference, the source's own identifier respelled around
a punctuation mark `#normAlias` does not fold) and `legislation` (all 41,
corresponding to nothing). **What separates them is SELECTIVITY, which is
measurable at read time and is not a property of the tier.** The exposure is the
record OVER-OFFERING rather than over-claiming — no grade is minted, nothing is
established — but a member offered 41 candidates for a subject whose only
correspondence is the reader's own kind word is being invited to confirm a
correspondence no string ever made, which is the direction `src`-in-the-key
already refuses one level down.

**ROUTED TO CONDUCT for a queue row** (`QUEUE.md` has one writer): rank or gate the
partial tiers by measured selectivity rather than by a fixed order, with this
measurement as the evidence and finding 5 as the reason a rank swap alone is the
wrong fix. **No code was changed by this item and none should be** — M-4 is
measurement work, it commits no behaviour, and the battery moved by zero.

### The gates, and the control that makes them evidence

**This probe's most likely lie is a triumphant row of zeroes**, so the gates run
before any number is printed and the controls break each gate's subject:

- **G1 the corpus is real and non-empty**, and `ratio()` **REFUSES** a denominator
  of zero rather than printing `0/0`. That guard is RUN on every run (gate (f)),
  not asserted — one control in this project once passed while asserting nothing
  because its loop body was never entered.
- **G2 the fold measured is the fold the plane performs — and it is the plane's own
  source text, EXECUTED.** The probe reads `Store.#normAlias` and
  `Store.#labelTerms` out of `src/store.mjs`, refuses to run unless they are the
  text it was written against, and then runs THAT text; the five correspondence
  names and their order are read from `Store.#CORRESPONDENCE` /
  `#CORRESPONDENCE_RANK` rather than restated. REC-36's probe copied the normaliser
  and relied on a suite elsewhere to hold the pair equal; for an item whose whole
  subject is a figure carried between populations, one copy was one too many.
- **G3 a five-arm positive control**, because a broken matcher and a real absence
  print the same line: the corpus's own first reference must match WHOLE, its key
  must match at the key tier, **the same reference respelled must reach the
  partial-reference tier** (the arm this item turns on), a string the corpus cannot
  contain must reach nothing, and a name that normalises to no terms must reach
  nothing rather than everything.

**Controls RUN 2026-08-08, `node test/ref-variance.control.mjs` → 4 pass, 0 fail**,
every edited file restored and the restore ASSERTED by sha256 rather than
eyeballed:

| arm | broken | the probe's answer |
| --- | --- | --- |
| (a) | `.toLowerCase()` dropped from `Store.#normAlias` in `src/store.mjs` | REFUSES — *Store.#normAlias has changed* |
| (b) | pointed at a fixture that does not exist | REFUSES — *the corpus could not be read* |
| (c) | `candidates()` returns nothing | REFUSES at positive control (a) — **the arm that turns finding 1's zeroes from a printout into a measurement** |
| (d) | the every-term subset test dropped, so any alias matches any string | REFUSES at positive control (d) — without it a matcher that matched EVERYTHING would pass (a)–(c) and inflate finding 4 to 41/41 for every term, manufacturing this entry's headline |

### WHAT THIS DOES NOT SETTLE

- **It does not decide the ranking.** It makes the cost of the current one
  knowable; the design — rank swap, selectivity floor, or dropping the kind token
  from the `ref` term source — is a decision the queue row must make, and each has
  a different casualty. (Dropping the kind token would remove the `legislation`
  row and also stop an alias registered as the whole reference from being offered
  at all, which is the tier REC-40 exists to restore.)
- **One corpus, one doctype, one institution, one reader, ONE kind value.** Every
  selectivity figure is corpus-relative and will move with the corpus. That is
  itself an argument for measuring selectivity at read time rather than freezing a
  rank against this document.
- **No entity registry was sampled, because there is no real one to sample.**
  Finding 4 is what WOULD happen to a member who registers `Legislation` as an
  alias of the *Rules & Legislation Committee* — plausible, and not observed.
  Nothing here says any registry contains such an alias.
- **It does not say whether a SOURCE spells its own identifiers consistently.**
  Each of the 41 keys occurs exactly once in this document (1.0 occurrences per
  string), so the zero on that arm is arithmetic, not evidence — **the instrument
  prints `UNINFORMATIVE` on that row itself** rather than letting the zero be read
  as a finding. Answering it needs a second capture of the same body.
- **It measures nothing about the A/B/C WHOLE tiers' precision**, which are
  unaffected: `#recogniseTier` reads `reading_refs` directly and never the term
  index, so what is offered and what would be graded are different questions.
- **Finding 8 expires the day a reader supplies its own `ref`.** `#writeReadings`
  honours `e.ref` when a reading carries one; no reader in this tree does, and the
  probe FAILS rather than reprinting the conclusion if that changes.

## HOW THIS PLANE SPELLS A REFUSAL, AND WHAT ONE-LITERAL CLASSIFIERS COST — 2026-08-08, REC-76 (D-236, D-240)

**Instrument:** `civicos-ui/check-refusal-codes.mjs`'s own printed output, plus
two read-only sweeps over `bio-plane/src` and the repository's instrument files.
Every figure below is one an instrument PRINTED, not one carried by hand.

**THE SPELLINGS, over `bio-plane/src`:**

| shape | count |
| --- | --- |
| `ok: false` | **704** |
| `started: false` | **5** |
| computed `ok: !<expr>` | **3** |

That is the whole of D-236: arm C of the DEC-49 guard graded a refusal by the
first of those three, so **eight refusal objects were invisible to the one arm
whose job is to fail on a codeless refusal**, and `SET_MOVED` went untranslated
because a region drawn around a computed verdict would have judged zero.

**WHAT THE INVERSION CHANGED, at the 60 governed sites (guard's own print):**

| | before | after |
| --- | --- | --- |
| refusals judged | 119 | **124** |
| codes COMPARED against a row | 119 | **122** (118 on the same tree before the 3 new rows — see below) |
| `aiRunOpen` | `92L (0 judged, 0 checked)` | `113L (4 judged, 3 checked)` — **2 of its 4 refusals were CODELESS** |
| return-position outcome corpus | not measured | **70** (124 refusals, 7 declared successes, 3 unclassified) |
| governed sites / regions / region lines | 60 / 47 / 1289 | **61 / 48 / 1310** |
| `reachGap` | 42 | **41** — the fall is `SET_MOVED` |

**AND ONE FALL THAT IS NOT SLACK, measured so the next reader need not re-derive
it:** `codesChecked` read 119 old / 118 new on the *same* tree. The old walk found
TWO `ok: false` inside `captureRequestArm`'s NESTED refusal envelope
(`{ok:false, silent:false, refusal:{ok:false, reason, code}}`) and graded the same
return twice — `2 judged, 4 checked` over ONE return. **A figure that falls
because an instrument stopped counting one thing twice is not slack; a figure that
falls for any other reason is.**

**MEASURED BEFORE THE WIDENING WAS TRUSTED — it lost nothing:** every `ok: false`
the old matcher judged at a governed site sits inside a return-position object
literal. **0 of 60 governed sites** build a refusal into a variable and return it
later, which is the one shape the new walk cannot see (`subresources.mjs` does
write refusals that way, outside any governed site).

**THE CLASS SWEEP (D-240).** Corpus: **232 instrument-candidate files across 8
directories, 6,309,940 chars**, 214 of them reading or matching source text.
Reach: **36 regex literals** naming a verdict-shaped field beside a boolean
literal, hand-verified down to **2 real classifiers**; the rest are single-site
pins or `NEGATIVE CONTROL:` prose.

| instance | corpus | graded | not graded |
| --- | --- | --- | --- |
| `meaning-bounds.test.mjs`'s `REFUSAL_RETURN = /\bok\s*:\s*false/` (the EXCLUDER REC-70 left) | `store.mjs` return-object literals | 489 excluded as refusals | **72 refusal-shaped and NOT excluded, across 37 distinct verdict fields** |
| `plane-envelope.test.mjs` DETECTOR A's `/^\s*\{\s*ok:\s*true\b/` | 152 `json()` calls in `index.mjs` | 26 | **126 skipped, 4 of which spread a Durable Object `.result`** — one, `index.mjs:4587`, under a COMPUTED verdict |

## 2026-08-08 · REC-77 — M-4's probe RE-RUN, and the discriminator that replaces its ranking

**Why re-measured.** REC-77's brief supplied M-4's figures and said to re-run the
instrument rather than trust them, which is what the instrument was committed for.

**AND THE FIRST FINDING IS ABOUT THE DEPENDENCY, NOT THE NUMBERS. M-4 IS NOT IN THIS
WORKTREE'S BASE.** REC-77's row says `depends-on: M-4 (landed; its probe and its gate are
committed)`. At this worker's base commit `73fca8b`, `MEASUREMENTS.md` had **no M-4
section**, `QUEUE.md`'s `### M-4 · done` row carried **no `landed:` line**, and neither
`bio-plane/test/ref-variance-probe.mjs` nor `bio-plane/test/ref-variance.control.mjs`
existed. M-4 landed on commit **`911821c`**, which `git merge-base --is-ancestor 911821c
HEAD` reports is **NOT an ancestor** of this branch — a sibling worktree's commit that has
not been merged. The probe was therefore re-run from `git show 911821c:…` into this
worktree, run, and **deliberately NOT committed here**, so that CONDUCT's merge of M-4
brings its own files rather than meeting a second copy.

**Instrument.** M-4's own `ref-variance-probe.mjs`, unmodified, run 2026-08-08 against
`src/store.mjs` at this worker's base. Exit 0 — every gate held, including G2 (the fold is
`Store.#normAlias`/`#labelTerms` read out of the shipped source and EXECUTED) and all six
G3 positive-control arms.

### M-4's figures HELD, every one of them

| M-4's figure | re-measured 2026-08-08 |
| --- | --- |
| corpus n=41 reading references, `meeting_agenda` @ `certain` | **identical** |
| a name against `ref` / `key` / `label`: 0/0/0, 0/0/0, 0/15/15 | **identical** |
| row-weighted mean reach: ref 67.5%, key 51.2%, label 8.3% | **identical** (27.67 / 21.00 / 3.40 of 41) |
| the 8.1x selectivity difference | **identical** (27.67 ÷ 3.40 = 8.14) |
| terms reaching EVERY string: ref 2/43 (`legislation`, `26`) carrying 82/123 = 66.7% | **identical** |
| `"legislation"` → 41/41 references, 0/41 labels | **identical** |
| `"0844"` → 1/41; the label population's worst term `"and"` → 15/41 (36.6%) | **identical** |
| index rows 123 + 82 + 305 = 510 against REC-36's 305 | **identical** |
| structural: `entity()` emits no `ref`; kinds in the tree are `legislation`, `meeting` | **identical** |

**Twelve consecutive items have found a briefed figure stale by measuring it. This is the
thirteenth and it did not** — which is worth recording precisely because the streak makes
the opposite result the expected one. The one figure the brief carried that did NOT hold is
M-4's own commit message's battery (125/125 · 7,872); this worktree's measured baseline is
**130/130 · 8,142**, and M-4 simply branched earlier.

### The discriminator this item ships, and why it is not any of M-4's numbers

`Store.#isUninformative(reach, corpus)` → `corpus > 1 && reach >= corpus`.

- **`reach`** is how many distinct reading references the alias's term set reaches at that
  source, UNCAPPED, taken by wrapping the read's OWN statement (`#refReachSql` wraps
  `#refTermsSql` as a subquery with `LIMIT -1`) rather than by respelling the subset test.
  A second statement "doing the same thing" would be a claim about a twin query.
- **`corpus`** is how many distinct reading references exist at that source in the corpus
  the READER can see — the same gate, the same table.
- **Nothing is pinned.** No percentage, no threshold, no figure from this document.
  `corpus > 1` is the condition for the question to have an answer, not a threshold.

**Measured over the same 41-reference corpus, driven through `op=readingname` in
`readingname.test.mjs`:**

| alias | correspondence | reach / corpus | outcome |
| --- | --- | --- | --- |
| `"legislation 26-0844"` | `name_in_reference` | **1 / 41** (selectivity 0.9756) | **OFFERED**, ungraded, first |
| `"Legislation"` | `name_in_reference` | **41 / 41** (selectivity 0) | **WITHHELD**, and STATED in `names_uninformative` |

Both are the same correspondence at the same source, which is why a rank swap could not
have separated them.

### WHAT THIS DOES NOT SETTLE, and it is M-4's list plus two

- **Every selectivity figure remains corpus-relative** — one corpus, one doctype, one
  institution, one reader, one kind value. That is now a property of the mechanism rather
  than a caveat on a number: the plane computes it over the corpus in front of it.
- **No entity registry was sampled, because there is still no real one.** The 41/41 blast
  is what WOULD happen; nothing here says any registry holds such an alias.
- **NEW: the figure is VIEWER-relative, not only corpus-relative.** Both counts are taken
  over the gated corpus, so two members compute different selectivity for the same alias on
  the same document. This is required — a figure over the whole store would publish the
  size of a hidden corpus as an integer — and it is asserted (dave reach 1, carol reach 2).
  A consumer must not compare one viewer's figure with another's.
- **NEW: the rule catches only the CEILING case, `reach == corpus`.** An alias reaching 40
  of 41 is still offered. That is the deliberate fail-open direction, and it is the honest
  cost of refusing to hard-code a threshold. A corpus with a genuinely graded distribution
  might want more, and would need a measurement this repository cannot take today.
- **This corpus cannot exhibit a MIDDLING reference partial**, and the suite says so where
  it matters: the 41 keys are distinct, so at `src=ref` an alias reaches either 1 or all 41
  and nothing in between. The ordering arm is therefore driven over the synthetic corpus,
  where a reference partial reaching 3 of 13 can be built.

### The class sweep, its corpus, and what the matcher cannot see

**Corpus printed on every run: `bio-plane/src/store.mjs`, 23,4xx lines, 67 `.sort(` sites,
128 SQL `ORDER BY` clauses. Reach: 3 sites rank by position in a named constant.**

| site | constant | ordered by | verdict |
| --- | --- | --- | --- |
| `#requiredStrengthFor` | `BASIS_GRADES` | framework §8.1's grade order | a RULING, and it is a MIN over a vocabulary, not a presentation |
| `queueFeed` | `Store.QUEUE_CLASSES` | obligations before conditions | a RULING, and it orders WORK not evidence: nothing is claimed about correspondence and there is nothing to confirm |
| `documentsNamingEntity` | `#CORRESPONDENCE_RANK` | **candidate evidence** | **the only one that asserted one correspondence was better than another with no ground for the claim.** Whole tiers keep their fixed positions; the partial band defers to the measurement |

**WHAT THE MATCHER CAN SEE:** the source text of ONE file, and within it the shape
`SOME_CONSTANT.indexOf(x)`. **WHAT IT CANNOT SEE, stated rather than left to be assumed:**
an ordering expressed as a SQL `ORDER BY` (there are 128 in this file and it reads none of
them); an ordering expressed as a hand-written comparator with no constant to index into;
an ordering a SURFACE applies after the plane answers; and any ordering in any other module
(`index.mjs` has 0 `ORDER BY` and 0 ranked sorts, checked; `affordances.mjs`, `cdx.mjs`,
`subresources.mjs` and `civicos-ui/` were not walked by this detector). **It is a shape
detector over one file, not a census of every order in BIO.**

## 2026-08-08 · M0-17 · the id-collision class: how many shared namespaces, and does a race actually race

**Instrument:** `tools/mintid.mjs` (its `--list` mode and its `corpusFloor`), `bio-plane/test/mintid.test.mjs`
(the driven race), and the M0-17 negative-control harness. Tree: `47b4199` plus this item's files.
**Population:** every id space this repository allocates into by reading a file and incrementing.

### HOW MANY NAMESPACES — SIXTEEN, NOT FOUR

The queue row named four (C, IC, D, queue item ids). Enumerated over the repository, the class is
**sixteen**, and the queue "item id" is not one namespace but **ten sibling families** that happen to
share a corpus:

| kind | namespaces | corpus the floor is read from | floor measured 2026-08-08 |
| --- | --- | --- | --- |
| code-referenced | `C` | `bio-plane/checks/bio-checks.mjs` | 34 |
| prose-referenced | `D` | `DEBT.md` (+ `QUEUE.md`, `CLAIMS.md`) | 241 |
| prose-referenced | `DEC` | `DECISIONS.md` (+ `QUEUE.md`) | 66 |
| prose-referenced | `IC` | `INTERFACE-CHANGES.md` (+ `QUEUE.md`) | 37 |
| prose-referenced | `M` | `MEASUREMENTS.md` (+ `QUEUE.md`) | 4 |
| prose-referenced | `REC UI CPDF FL PL SK IS VF M0 DIST` | `QUEUE.md`, `MILESTONES.md`, `IS-BUILD-PLAN.md`, `UI-PLAN.md`, `PLAN.md` | 77 · 52 · 13 · 6 · 16 · 4 · 9 · 5 · 17 · 3 |
| structural | `I` | `INTERFACES.md` | 8 |

**DO THEY NEED DIFFERENT ANSWERS? THE MECHANISM, NO. THE CORPUS, YES — and the difference is
measured rather than asserted.** A `C`-number is named by the catalog, by suites, by
`coverage.mjs`'s harvester and by at least one **regex literal**; a `D`-number is named almost
entirely by prose, but that prose includes **claims and reports written by sessions that have
ENDED and cannot correct themselves**; an `I`-number is a contract identity two areas build
against. All three collide the same way and are protected the same way. What each needs
separately is **where its floor is read from**, and that is the only per-namespace knowledge the
tool holds.

### THE FLOOR CANNOT BE READ REPOSITORY-WIDE — MEASURED, AND IT IS WHY THE CORPUS IS PER-NAMESPACE

A naive repo-wide scan for `\bC-(\d+)` over 425 files returns **2026**, not 34. The hits are
fixture ids shaped `…C-2024-…` in `progression-instance.test.mjs`, `progression-exception.test.mjs`
and `CLAIMS.md`. **A floor poisoned by a year hands out `C-2027` and orphans the catalog
permanently.** So the corpus is where a namespace ALLOCATES, and matches above a per-namespace
ceiling are discarded **and named in the output** rather than dropped in silence.

A second finding about the same throwaway probe, recorded because the practice is to distrust the
instrument first: it reported `M max=7`, and `grep -r` over the whole tree finds **no `M-5` or
higher anywhere**. The probe over-reported and the tool's own corpus scan (max 4) agrees with grep.
**Two instruments, one subject, one of them wrong — and it was the ad-hoc one.**

### DOES THE RACE ACTUALLY RACE — YES, AND IT IS MEASURED FROM BOTH SIDES

Eight real processes (the standing concurrency budget), started together, minting `D` from one
ledger, driven by `bio-plane/test/mintid.test.mjs`:

- last child started **+4 ms** after the first; first child finished **+51 ms** — an
  **every-child-alive overlap of 47 ms**, so the eight are genuinely contended and not serialised
  by spawn latency.
- **7 of the 8 reported LOSING a take and stepping over an id another child already held.** Eight
  distinct ids came out.
- **The negative control closes it from the other side, and this is what makes the arm a
  diagnosis rather than a demonstration: with the exclusive create neutered (`wx` -> `w`), the
  SAME driver gave ALL EIGHT PROCESSES `D-242`.** The collision is reproducible on demand, which
  is what nobody had done for the seven real ones.

### THE PRICE, STATED AS A NUMBER

The ledger is not committed, so every id it hands out is a potential **gap**: two `D`-numbers were
minted for this item's own debt rows and both were used, but an abandoned item leaves its number
dead forever. **Against that: two of 2026-08-08's renumbers were already found defective** — one
missed a regex literal (`C-29\.` is not the text `C-29.`), one mangled the worked example inside
the very comment warning about renumbering, which `coverage.mjs` then read as a catalog check
nobody names. **A mint has no failure mode that produces a WRONG id, only a SKIPPED one**, and
that asymmetry — not throughput — is the measurement the design rests on.

### ADDENDUM, SAME DAY: THE TOOL CAUGHT ITS OWN DOCUMENTATION POISONING ITS OWN CORPUS

Minutes after `tools/mintid.mjs` landed, `--list` reported `D floor 244` when the highest debt
row was `D-243`. **The cause was the debt row this item had just written**: it explained the
gap cost with a WORKED EXAMPLE naming the next free number, and `DEBT.md` is `D`'s own corpus.
The floor read that number off the PROSE.

**This is the C-29 catalogue comment's lesson arriving a second time on the same day, in a
different file, to a different author.** That comment's first draft spelled its warning with
real C-numbers; the integration's own sweep renumbered THE EXAMPLE along with the code, and
`coverage.mjs` — which harvests C-numbers by pattern, comments included — then reported a
catalog check no assertion names. **An instrument cannot tell a number in a sentence from a
number in a row, and neither can a sweep.**

**The behaviour was NOT changed, and that is the judgement worth recording.** Over-counting
costs a GAP; under-counting costs a COLLISION; only one of those is recoverable, so the floor
stays generous. What changed is that it now SAYS so: each namespace may declare what an actual
allocation site looks like (`| D-n |` for a debt row, `check: 'C-n.m'` for a catalog entry), the
strict floor is read beside the generous one, and any number above it is **named as
prose-driven** with the gap it will cost. A namespace that has not declared one answers `null`,
never 0 — undetermined is first-class, and a strict floor guessed wrong would be wrong in the
dangerous direction. The example itself is gone from every file that is a corpus.

Driven both ways: over a scratch corpus holding `| D-100 |` and the sentence `D-150`, floor 150
· strict floor 100 · prose-driven **true**; over the same corpus with the sentence removed,
100 · 100 · **false**; over this repository's live corpus, `D` 243/243 and `C` 34/34, **neither
prose-driven**. Control arm (7): drop the allocation pattern and three arms fail.

## FW-14 · the weight ladder over the whole mutating op set — 2026-08-08

**Instrument:** `bio-plane/test/rung-ladder.test.mjs`, which derives the op set from the
`mutating: true` rows of the `OPS` dispatch table in `src/index.mjs` through
`readDispatch()` in `scripts/op-claims.mjs` (the same reader M0-12 uses; grown by one
returned field rather than copied). Re-run it rather than reasoning about the figures
below — every one of them is PRINTED on each run.

| What | Measured | Date |
| --- | --- | --- |
| ops in the dispatch table | **159** | 2026-08-08 |
| of those, declared `mutating: true` | **84** | 2026-08-08 |
| carry a rung | **24** | 2026-08-08 |
| carry a STATED absence | **60** | 2026-08-08 |
| unclassified | **0**, asserted in both directions | 2026-08-08 |

**THE FIGURE THIS CORRECTS.** `src/affordances.mjs` carried *"CAPABILITIES.md measures 7 of
57 mutating ops with a rung assigned by any document"* from REC-19 until this item. The
denominator was never re-measured and the real one is **84** — a hand-carried number in a
comment nobody re-ran, which is this project's most-repeated finding. Both figures now come
out of the instrument and neither is written in prose.

### The rungs, and what backs each one

| rung | ops | what backs it |
| --- | --- | --- |
| `reversible` | 3 — `cite`, `versionrevert`, `versionhide` | the plane publishes an act that takes the result back |
| `reasoned` | 17 | the store refuses the act for want of an authored account |
| `terminal` | 1 — `retire` | `STATES.information.edges.retired` is `[]` — no outgoing edge |
| `attested` | 2 — `attest`, `ratify` | Constructs:275; an authority outside the group (a key, a TSA) |
| `irreversible` | 1 — `publish` | DEC-19 as amended; derived as the op routing to `publishcase` |

**`reasoned` IS NOT COUNTED BY ONE SPELLING.** The refusal family is `NO_REASON`,
`VERSION_NO_REASON`, `NO_ACKNOWLEDGMENT`, `NO_MITIGATION`, `NO_CONCLUSION`, `NO_FALSIFIER`,
`NO_JUSTIFICATION`. Grading by `NO_REASON` alone would have missed `op=release` (which
demands an acknowledgment and a mitigation) and `op=conclude` (a conclusion and a
falsifier) — the same requirement wearing the word the act uses for it.

**THE SIX VERSION ACTS ARE THE MEASUREMENT MOST EASILY GOT WRONG.** All six route through
one `#moveVersionState` carrying one `VERSION_NO_REASON` refusal, and the branch fires only
when `versionNeedsReason(to)`. A textual classifier reports **6** ops demanding a reason;
the truth read off `Store.VERSION_ACT_TO` and `VERSION_REASON_REQUIRED` is **2**
(`versionreject`, `versionconsider`). The suite reads the predicate, never the helper's
text. Backing scan reach, printed each run: **69 store method bodies read · 18 ops refuse
for want of an authored account.**

### The 60 stated absences, by ground — and what they have in common

| ground | ops | what the ground means |
| --- | --- | --- |
| `credential` | 19 | the subject is WHO MAY ACT, not what the record says |
| `substrate` | 18 | machinery a decided act rides on; the member never chooses it |
| `undetermined` | 18 | **a real act on the record with NO rung** — stated, never guessed |
| `caller-owned` | 4 | the caller's own selection or feed preference; not in the record |
| `observational` | 1 | records what was OBSERVED; corrected by observing again |

**THE FINDING: 42 of the 60 are absences of APPLICABILITY, not gaps.** The ladder is a
property of an act ON THE RECORD — it tells a member what performing it costs to undo — and
most mutating ops are not that. Keeping those four grounds apart from `undetermined` is
what stops a real gap from hiding inside a category error.

**AND THE GAP THE REMAINING 18 NAME IS IN THE LADDER, NOT IN THE TABLE.** The shape they
share: a member performs the act once, the record keeps it attributed and dated, and it is
corrected by a further act moving FORWARD rather than by anything moving back — **and it is
not signed.** DEC-19 named exactly that property (*"it cannot be undone SILENTLY"*) and
attached it to `attested`, the rung that requires a key. These acts have the property
without the key, so `attested` would claim a signature that does not exist and `reversible`
would promise a way back that does not exist. `versionaccept`, `inboxresolve`, `taskresolve`
and `actioncorrespond` are the clearest cases.

### C-7, checked rather than assumed

The FW-14 row claims its derivation method already yields C-7's answer. **It holds.**
`op=cite` writes `{ rel: "cites", status: "confirmed" }` and `op=sever`'s `from` set is
`["confirmed", "proposed"]`, so the plane publishes an act that takes a citation back —
which is `reversible`, the answer UI-20 recorded as *"C-7 derives reversible"* while
rendering the rung as ABSENT because FW-14 had not yet assigned it. Both halves are read
out of `store.mjs` by the suite rather than pinned by hand. Note what it does not claim:
severing is not erasure, and the edge stays in the record carrying the member's reason.

## 2026-08-08, session CONTENT-PDF (cpdf12-pagepixels): A PDF PAGE TURNED INTO PIXELS INSIDE WORKERD — and the rasteriser nobody needed to build (CPDF-12, DEC-42)

**The question.** Moondream and tesseract both consume IMAGES, so the in-account OCR
route needs a PDF page rendered to pixels, and CPDF-9 measured that nothing in Workers
renders one: pdf.js's renderer wants a `canvas` workerd does not have. DEC-42 re-scoped
the item with ONE observation to be **verified, not assumed** — *for the image-only
class a page is typically ONE embedded image, so image EXTRACTION may serve where
rasterising was assumed; check it across the corpus BEFORE building a renderer.*

**It was checked first, and it held.**

**Instrument.** `pdf-worker/test/pagepixels-corpus.probe.mjs` (committed, re-runnable,
NOT in the battery — a `.probe.mjs` is discovered by neither `battery.mjs` nor
`coverage.mjs`). Subject: `pdf-worker/src/pagepixels.mjs`. Corpus: **59 real Oakland
PDFs, 27.3 MB, 622 pages** — the attachments of the 40 most recently modified Legistar
matters (`webapi.legistar.com/v1/oakland/matters`), plus the two documents CPDF-5 named
by hand, fetched 2026-08-08 and cached with their sha256.

### 1. The census — is a page-of-pixels an EXTRACTION problem or a RASTERISATION problem?

| | pages |
| --- | --- |
| carrying a TEXT layer (Tier 1 / the pdf-worker already read these) | 590 |
| no text and no image (vector marks, or empty) | 8 |
| **IMAGE ONLY — the class OCR is FOR** | **24** |
| … of those, composed of exactly **ONE** image | **24 (100.0%)** |
| … of those, composed of several images | **0** |

Filter chains on the image-only pages, crossed with the page's own `/Rotate`:

| | pages |
| --- | --- |
| `DCTDecode` @ `/Rotate 0` | 14 |
| `DCTDecode` @ `/Rotate 270` | 3 |
| `CCITTFaxDecode` @ `/Rotate 270` | 7 |
| `JBIG2Decode`, `JPXDecode` | **0** |

**DEC-42's observation is VERIFIED on this corpus: 24 of 24. A page-to-pixels renderer
for the image-only class is an image EXTRACTOR plus two decoders, and the canvas
rasteriser CPDF-9's finding implied is not needed for this class at all.** Stated as
what it is: a measurement of ONE corpus, not a property of PDF. The renderer therefore
REFUSES the cases it did not measure (`MULTIPLE_IMAGES_ON_PAGE`, `NOT_IMAGE_ONLY`) by
name rather than guessing at them, so the day the corpus produces one it is visible.

### 2. Fidelity — and the gate that would have caught the instrument lying

A decoder is the one subject whose failure looks exactly like success: right
dimensions, right byte count, ink roughly where ink belongs, "all 2550 rows decoded".
Every summary statistic is satisfied by a picture that is subtly and permanently wrong.
So **no fidelity figure in this measurement was produced by the subject.**
`recordFidelity()` THROWS unless the reading's provenance is an INDEPENDENT decoder —
one sharing no line of source with `pagepixels.mjs`. The independent decoder is
**Pillow 11.3.0** (libtiff's CCITT G4) reached through **pypdf 6.14.2**, and its version
string is printed beside every figure. Absent it, the probe reports NO NUMBER; it does
not fall back to checking its own output against itself.

| | pages |
| --- | --- |
| rendered and INDEPENDENTLY checked | **23** |
| `passthrough-dct` — our bytes vs the raw stream read by pypdf: **BYTE-IDENTICAL** | 16 |
| `decoded-ccitt-g4` — our pixels vs Pillow's: **PIXEL-EXACT** | 7 |
| disagreeing with the independent decoder | **0** |
| refused by the renderer, with a stated reason | 1 (`ENCRYPTED`) |

**CONTROL, RUN: the refused-provenance arm.** Offering the gate a fidelity reading whose
provenance is `pagepixels.mjs` comparing its own output to itself — declared MUST THROW,
and it threw. **CONTROL, RUN: the blank-page arm.** A uniform page and a page with ink
produce different bytes, so a decoder that silently emitted white would be visible rather
than reported as a clean decode.

**AND THE GATE EARNED ITSELF ON A DIFFERENCE NO VISIBLE FIGURE COULD SEE:** the packed
1-bit rows disagreed with Pillow's by exactly **10,200 bits — 4 per row x 2550 rows, the
WASTED PADDING BITS at the end of each scanline**, which a PNG reader must ignore and
which no dimension, byte count or ink fraction can reach. They are now zeroed so the two
representations are identical.

### 3. Placement — it runs in workerd, and the DECODE is runtime-independent

The renderer was bundled and driven **inside workerd** (miniflare), which is the runtime
the placement question is actually about — CPDF-5 paid for that distinction when pdf.js
threw `Math.sumPrecise is not a function` on node and ran clean on workerd.

| | |
| --- | --- |
| bundled, raw | **45,324 B** (against the 10 MB Paid script limit — **Cloudflare's figure**, DEC-42) |
| dependencies | **zero** (PNG written by hand: CRC32 + `CompressionStream("deflate")`, which is zlib-wrapped and therefore exactly what an IDAT holds) |
| the scanned page, in workerd | rendered: 2550x3300, upright, `pixels_sha256 ac4eb57f…` |
| the same bytes, in node | **the same `pixels_sha256`** — and the same value the INDEPENDENT decoder produces |

**A FINDING FROM THE CROSS-RUNTIME ARM, AND IT REACHES DEC-41 RATHER THAN THIS ITEM:
THE FILE DIGEST IS RUNTIME-DEPENDENT.** The same code over the same input produced
**129,366 B on workerd and 132,691 B on node** — both valid PNGs of identical pixels.
`CompressionStream("deflate")` is a platform service and the two runtimes emit different
deflate streams. **DEC-41 requires each published rendering's hash to join
`published_shas` so any copy is checkable against the instance; a hash of the FILE is a
value no verifier on a different runtime can reproduce.** The renderer therefore also
emits `pixels_sha256`, taken over the normalised samples before any container is built,
and that value is stable across node, workerd and an independent decoder. Which of the
two a manifest should carry is stated as a decision in `kickoffs/CONTENT-PDF.md`.

**WHAT THIS DOES NOT MEASURE, and it is the figure the queue row asked for:** there is
**no Worker CPU number and no isolate memory number here.** Every millisecond in the
probe is harness WALL time and is labelled as such — a Worker cannot time itself (D-56),
and the only honest instrument is the platform's own billing surface on a DEPLOYED
script (FL-1's method). What CAN be said is arithmetic rather than a measurement, and is
offered as arithmetic: the bilevel path never allocates an RGBA frame. A 3300x2550 page
costs **1,053,150 B packed** plus the PNG, against the **33.6 MB** an RGBA frame of the
same page would cost — and memory binds before CPU in a Worker by an order of magnitude
(MEASUREMENTS: 120.4 MB of a 128 MB isolate while CPU sat at 2.5% of its ceiling). The
`passthrough-dct` route allocates nothing at all beyond the stream. **D-245.**

### 4. END TO END: the pixels into an OCR engine, scored against CPDF-9's ground truth

The whole point of the item. PDF bytes -> `pagepixels` -> a real OCR engine -> scored
against the **committed** ground truth of CPDF-9's page 2. Comparability is ENFORCED,
not claimed: the probe READS `GT_PAGE2` out of `bio-plane/test/ocr-measure-probe.mjs`
and reports NO NUMBER if that constant has moved, because two copies of a transcription
drift and two accuracy figures from drifted ground truths are not comparable however
alike they look.

| | characters | digits | minted digits |
| --- | --- | --- | --- |
| **pagepixels -> tesseract.js 7.0.0 (default `eng`)** | **99.93%** | **90/90** | **1** |
| the floor: CPDF-9, python+Pillow rasterisation -> tesseract `tessdata_fast` | 99.96% | 90/90 | 0 |

**Read the comparison honestly: these are DIFFERENT MODELS.** CPDF-9's floor is
`tessdata_fast`; this arm ran tesseract.js's default `best_int`, which CPDF-9 itself
measured minting a digit ($ -> 5). The claim this arm supports is **"the pixels this
renderer produces are as legible to an OCR engine as a conventional rasterisation of the
same page"**, and no more.

**AND THE ARM'S FIRST RUN IS THE MOST USEFUL NUMBER IN THIS ENTRY. It scored 8.67%
characters with 355 MINTED DIGITS, and the engine announced nothing.** The cause was
`/Rotate 270`: the embedded image is 3300x2550 landscape and the page a reader sees is
portrait, so the engine was handed a sideways page and returned fluent, confident,
wholly invented prose. **A page is not its image.** That is CPDF-10's
output-looks-better-than-its-input hazard arriving one layer BELOW where the chain rule
was looking for it — before any OCR step exists to record. `upright` is now a
first-class field of every result, the bilevel routes apply the rotation exactly (a
quarter turn lands a bit on a bit), and a route that CANNOT rotate says so.

**Which leaves a measured, named gap rather than a hidden one: 3 of the 24 image-only
pages are `DCTDecode` at `/Rotate 270`.** Rotating a JPEG means decoding and re-encoding
it, which destroys the one property the pass-through route has — that the bytes in the
record are the publisher's own. Those pages come back `upright: false` with `rotate_deg`
stated. **D-244.**

### 5. Negative controls on the battery-resident half

`node pdf-worker/test/pagepixels.control.mjs` — **7 arms, each run ALONE**, every restore
verified by sha256 AND by byte comparison against a per-arm pristine copy whose byte
count is printed and floored. Baseline 63 pass / 0 fail. Final run: **7 of 7 behaved as
declared.** Two of them are worth carrying:

- **Arm (e) came back a SURPRISING GREEN the first time (63 pass, 0 fail) and that was a
  finding about the SUITE, not the subject.** Dropping the string/inline-image masking
  should make a naive `Tj` scan read the scanned page as carrying text — but the real
  scanned page's content stream is `q … cm /Im0 Do Q` and contains no strings at all, so
  the masking pass changed nothing and the arm tested nothing. Recorded rather than
  smoothed; a fixture carrying a marked-content string with the letters `Tj` un-absorbs
  it, and the arm then read 61 pass, 2 fail.
- **Arm (b) is the one that proves the digests are doing the work**: inverting the padding
  mask moves the independent-provenance digests and NOTHING ELSE — every dimension, byte
  count and row count still agrees (59 pass, 4 fail).

**And the FOOT SENTINEL fired during the controls**, printing `53 pass, 2 fail — SUITE
ENDED BEFORE ITS OWN FOOT` where a TypeError inside an assertion would otherwise have
ended the module through no assertion at all.

## 2026-08-08 · D-243 / D-242 · SIX IDS ARE ALREADY ALLOCATED TWICE IN `origin/main`, AND NOTHING HAD EVER LOOKED

**Instrument:** `tools/mintid.mjs` — `allocations()` / `collisions()` / `unregisteredNamespaces()`,
read at commit `a777538`, on a quiet tree. **Reproduce in one step:**
`node tools/mintid.mjs --audit`.

**THE HEADLINE, and it is the reason the item exists rather than a by-product of it.**
The first run of an in-commit duplicate detector over the live planning surface found
**SIX ids allocated twice**, none of them known to anybody, all of them in `origin/main`:

| id | what collides |
| --- | --- |
| `D-121` | two unrelated debt rows, both dated 2026-07-31 — a stale-`surfaced_by` defect and the office-formats capture gap |
| `D-124` | two unrelated design rows — **and the first reads "(renumbered from a colliding D-122 by CONDUCT 2026-07-31)", so it was renumbered ONTO a second collision** |
| `IC-30` | two different PROPOSED interface changes — **the THIRD live IC collision after the IC-33/IC-35 pair M0-17 recorded** |
| `CPDF-9` | two different queue items: the M0 pdf-worker dark-suite item and the M2 OCR-reachability measurement |
| `FW-15` | two different queue items: the C-7.1 deletion-ledger retirement and the L2→L3 PDF-text wire |
| `M0-16` | a duplicated `### M0-16 · done` heading with an empty body above the real one — an integration merge artefact |

**REACH, printed and floored: 593 allocation sites across 18 graded namespaces**
(`D` 249 · `DEC` 65 · `IC` 39 · `REC` 77 · `UI` 52 · `CPDF` 13 · `COFF` 7 · `CAP` 4 ·
`FW` 14 · `FL` 6 · `PL` 16 · `SK` 4 · `IS` 9 · `VF` 5 · `M0` 18 · `DIST` 3 · `DS` 4 ·
`I` 8). **What the matcher CANNOT see, stated rather than left to be assumed:** `C`,
whose dotted members repeat a family number by design, and `M`, which declares no
allocation site — both NAMED as ungradable in the instrument's own output rather than
scored clean; an un-minted id that has not collided yet; and a collision between two
branches nobody has merged.

**AN ALLOCATION SITE HAS EXACTLY TWO SHAPES, AND THE SECOND WAS FOUND BY ASKING THE
CORPUS.** A heading-only matcher (`### NS-n · state`, QUEUE.md's own item shape) reads
five prefixes as clean zeros — `PL`, `FL`, `SK`, `VF` and `DS` allocate as TABLE ROWS in
`IS-BUILD-PLAN.md`, and so do four of `UI`'s items. Measured across the five queue-corpus
files: QUEUE.md yields ten prefixes as headings and no rows; IS-BUILD-PLAN.md yields six
as rows and no headings; MILESTONES.md, UI-PLAN.md and PLAN.md yield neither. **Zero noise
in either shape.** Five of the six collisions were visible to the heading-only draft; the
sixth arrived with the row shape.

**THE REGISTRATION PROMPT GAP WAS REAL AND HAD ALREADY COST A COLLISION.** Four prefixes
allocated ids with no register row — `FW` (14 items), `COFF` (7), `CAP` (4) and `DS` (4) —
so `mintid` refused them by name and those families stayed on the convention. **`FW-15` is
one of the six.** M0-17 left this open on a measurement: a wide census over every
prefix-number TOKEN returns `INFO`, `SHA`, `UTF`, `RFC`, `FY2023` and thirty more. **That
census asked the wrong question.** Over allocation SITES the same scan returns fifteen
prefixes and no noise at all, which is the difference between a list of spellings and a
statement of what makes something recognisable in principle.

**D-242's "there is no cheap local test" — HALF TRUE, MEASURED.** True of the two-clone
half: nothing on this machine can see a second ledger, and that stays open. **Not true of
the non-atomic-filesystem half**, which is now a three-way probe against the real ledger
directory (exclusive create · a second exclusive create that must be refused `EEXIST` ·
a re-read proving the first writer's bytes did not move) and refuses `EXCL_NOT_HONOURED`
rather than minting. Measured on the live ledger `/Users/sparky/ClaudeCodeBIO/bio/.git/bio-idalloc`:
**honoured.** The probe is ONE process and cannot speak for atomicity across hosts, which
is why a ledger seen from more than one host warns instead.

**THE LEDGER HAD ALREADY OUTGROWN THE RESERVATION THAT DEFERRED THIS.** D-243 said the
audit was not owed yet because the ledger held 2 ids. Measured at `a777538`: it holds
**9 in `D` (242..250), 1 in `C`, 2 in `IC`, 1 in `REC`** — and `--audit --base HEAD~8`
already classifies M0-17's own `D-242` and `D-243` as **HELD** against `IC-38`, `FW-15`,
`FW-14` and `M0-17` as **PRE-LEDGER**, which is the classification working in both
directions on real history.

**BATTERY, and the baseline was re-measured rather than carried.** True baseline at
`origin/main` (`86f0e73`), run in a scratch worktree: **134/134 suites green · 8,386
assertions · 128.9 s · exit 0**. Final at `a777538`: **134/134 · 8,431 · 130.3 s · exit 0**.
**Delta +45 attributed by DIFFING the two runs per suite, never by subtraction:**
`mintid.test.mjs` 33 → 77 (+44), `planning-hygiene.test.mjs` 282 → 283 (+1, the new debt
row), **130 of 132 suites identical in count**. `REGISTER_FLOOR.arms` moved **570 → 576**
from the figure the green run PRINTED (`GREW by 6 arm(s)`); `classified` 129 and `corpus`
130 unmoved.

**THREE INSTRUMENT FINDINGS, recorded rather than smoothed — the controls found the
instrument wrong three times and the subject none.**

- **A CONTROL ARM READ `-1 pass, -1 fail` AND THE SUITE HAD NOT DIED.** The loose-matcher
  arm made the suite print 5,276 sites, and `process.exit()` TRUNCATES a large PIPED
  stdout, losing the suite's own tally line. The harness now writes to a file. **The `-1`
  convention is the only reason this was distinguishable from a clean zero.**
- **A REFUSAL IS NOT A THROW, and M0-17's own hardening covered only the throw.** Neutering
  the exclusivity probe makes every `mint` refuse; `a.ids.length` on a refusal raised a
  TypeError and ended the module with the arm's declared failures never reaching an
  assertion. Two sites hardened, and `scopeLines` no longer throws on a partial scope —
  a formatter for a safety statement is the last thing that should take a process down.
- **THE ESTATE CAUGHT PROSE IN A COMMENT BEING READ AS A PRODUCER, which is the
  documentation-poisons-a-corpus class for the THIRD time in two days and in a THIRD
  instrument.** A collision's explanatory string named the file path C-7.1 governs;
  `check-firing.test.mjs`'s estate walk covers `tools/`, read this file as a producer for
  a retired shape, and went RED. It failed in the SAFE direction. The lesson generalises
  past id-shaped examples: **a prose mention inside a file an estate walk covers is
  indistinguishable from the real thing.** **AND THE SAME CLASS LANDED A FOURTH TIME, IN
  THIS ITEM'S OWN RELEASE NOTE:** the `released:` line quoted the id its legacy control arm
  printed, in `CLAIMS.md`, which is `D`'s own corpus — and the prose-driven-floor arm went
  RED on the next battery. The number is gone; the sentence saying why is in its place.
  **Four instruments, four authors, four days: the rule is not "do not write a next-free-
  number example", it is "an id-shaped token in a file that is a corpus is an allocation
  as far as any matcher can tell".** Separately, `hygiene.test.mjs`'s walk-class
  ratchet named this item's new sandbox walk on the first full battery, before anyone read
  the diff — the ratchet working for the third recorded time.

**AND ONE FINDING ABOUT THE PRACTICE ITSELF:** the scratch worktree used to measure the
true baseline was created INSIDE the worker's own worktree, where `op-claims.test.mjs`'s
repo-wide walk found it and reported 15,007 op mentions from a nested second copy of the
repository. A scratch checkout for measurement belongs OUTSIDE the tree the estate walks.
## D-240 · the last two classifiers that graded a return by one literal — 2026-08-08

**Instruments:** `bio-plane/test/meaning-bounds.test.mjs` and
`bio-plane/test/plane-envelope.test.mjs`, each printing its own census every run;
`bio-plane/test/verdict-excluder.control.mjs` for the arms; a throwaway estate walk for the
class sweep. Taken on a QUIET tree (no battery running), on a worktree verified byte-identical
to `origin/main` for every file below.

### The corpus, and three figures that were stale

| | carried in the row / the file | measured 2026-08-08 |
| --- | --- | --- |
| `store.mjs` lines | ~16,300 (CLAUDE.md's old note), 21,248 (2026-08-08) | **23,523** |
| ops dispatched by `store.mjs` | 156 (`meaning-bounds`'s own comments) | **179** |
| `store.mjs` return-object literals | — | **843** |
| `index.mjs` `json()` call sites | 152 (D-240's row) | **117** |

The `json()` figure is not a shrinking corpus: it predates **REC-67**'s anchor correction,
which found `/\bjson\(/` matching `await r.json()` METHOD calls and took a 19%-inflated corpus
off this same walk. The spelling-only anchor still reads 144 here.

### (1) The excluder — `meaning-bounds.test.mjs`

Over `store.mjs`'s 843 return-object literals:

| bucket | count |
| --- | --- |
| excluded by the OLD `/\bok\s*:\s*false/` | 487 |
| excluded by the DECLARED-REFUSAL rule shipped | **520** |
| **newly excluded (+)** | **33, in 14 verdict spellings** |
| excluded by the OLD rule and NOT the new one | **0** |
| carrying a COMPUTED verdict — GRADED on purpose | 23 |
| carrying NO boolean-shaped property — GRADED (REC-70's inversion) | 115 |

The 14 spellings: `found` x10, `recorded` x4, `started` x4, `admitted` x3, `targetMayVote` x2,
`configured` x2, and `declared`, `applies`, `ungrouped`, `bounded`, `rootOfTrust`, `repeated`,
`saved`, `known` once each.

**Every roster is unchanged: BARE 38, BOUNDED 20, UNJUDGED 29, OPAQUE 10, 87 of 179 ops
judged.** The correction costs nothing today and is a hardening; its value is shown by the
control rather than by a moved number.

### The measurement that chose the policy, and it went the way that looks like a regression

Applying **REC-76's own policy** (a COMPUTED verdict is a refusal) to this corpus:

| | REC-76's policy | shipped (`false` only) |
| --- | --- | --- |
| suite | **82 pass / 3 fail** | 92 / 0 |
| BARE | 36 | 38 |
| **BOUNDED** | **16** | **20** |
| OPAQUE | 16 | 10 |
| methods publishing a collection | 131 | 143 |

Four correctly-bounded reads lose their clean bill, because a COMPARISON in this plane is
usually a **cursor** or a **truncation flag**: `projection` and `listBundles`
(`bundles.length === cap ? … : null`), `aiCredentials` and `captureRequests`
(`truncated: found.length > cap`), `searchIndexCheck`, `verifySha`
(`published: matches.length > 0`), `selectionResolve` (`ok: !stopped`). **REC-76's reading is
right in REC-76's guard and wrong here**, because the two ask different questions of the same
verdict: *does this refusal owe a code* versus *does this method publish an unbounded
collection*. One reader, two stated polarities.

**And the ordering rule is a property of REC-76's corpus, not of the plane.** *The first
boolean-shaped property is the verdict* was measured true over its 60 governed sites. Over 843
returns it fails twice in the `false` direction as well: `#sessionRights` (`rootOfTrust: false`)
and `#conditionHomes` (`ungrouped: false`) are SUCCESS answers leading with a datum and are now
excluded. Both are pinned by name, and neither is reached by a dispatched op.

### (2) The gate — `plane-envelope.test.mjs` DETECTOR A

Over `index.mjs`'s 117 `json()` sites: **23** declare a success, **2** carry a computed verdict,
**78** declare a refusal, **14** are UNCLASSIFIED (11 hand `json()` a VARIABLE; 3 are literals
with no boolean property). Graded **23 -> 25**; violations **0 -> 0**.

**The reach delta is where the widening shows: with all 30 answered-guards mechanically removed,
the old gate finds 9 unguarded spreads and the new gate finds 15.** The six extra are all
`index.mjs:4608`, `json({ ok: !!promoted.result?.ok, …, ...promoted.result… })` — D-240's own
cited site. It was correctly guarded all along; nothing was checking that it stayed so.

Three sites skipped by the old gate spread a store `.result`: `2569` and `5980` are declared
refusals (`{ ok: false, ...rec.result }`, `{ ok: false, ...(minted.result || {}) }`) and are
outside this detector's subject, pinned by site; `4608` is the computed one. **No unclassified
site spreads a `.result`, gated at zero.**

### The class sweep, re-run rather than inherited — and 2 is the number

**280 instrument-candidate files across 10 roots, 8,674,710 chars, 251 of them reading or
matching source or answer text. 33 regex literals name a verdict-shaped field beside a boolean
literal; 30 are in classifier position.** `newgroup/src/release.mjs` is excluded BY NAME — it
holds a whole copy of the bundled plane inside a string, and including it turns 33 candidates
into 101 (FW-13 paid for this once already).

Hand-verified: **2 real classifiers**, both fixed here. Of the other 31 —

- **13 are the `mutating:` DECLARATION-TABLE family** (`coverage.mjs` x2, `op-claims.mjs`,
  `capability.test.mjs` x2, `gate-reads`, `bias`, `inquirystrength`, `meaningread`,
  `publishedcase`, `strengthpair`, `versionchain`, plus the two fleet workers). **This is the
  same SHAPE closed BY CONSTRUCTION and is named rather than counted as an instance:** `mutating`
  is one field of one hand-maintained table, **159 of 159 `OPS` rows write the literal**, nothing
  computes it, and `capability.test.mjs` holds the table total. A declaration table with an
  enforced grammar is not a return whose verdict has several spellings.
- the rest are **single-site PINS** — a regex anchoring one named return so it cannot change
  shape unnoticed (`plane-envelope`'s `doAnswer` pin, `ratify-envelope`'s container pin,
  `preauth-vocabulary`'s three wording extractors, `case-opened`, `refusal-codes`,
  `bias-vocabulary`, `mechanical`'s frontmatter flag, `gate-reads`' `ms:` absence pin).

A second sweep for the NON-regex form (`includes` / `indexOf` / `startsWith` / `new RegExp` over
a verdict) found two further hits, both single-site anchors, plus bundled `dist/` output.

**What neither sweep can see, stated rather than implied:** a classifier assembled from a string
into a `RegExp` at runtime; one whose verdict field is held in a variable; one that tests a
PARSED value rather than source text. And neither can tell a classifier from a pin without a
human reading it — which is why 33 were hand-verified rather than reported as the answer.

### The arms

Ten, in `bio-plane/test/verdict-excluder.control.mjs`, **10 of 10 as declared**, each armed
alone, every restore verified by sha256 **and** by content against uniquely-named per-arm
pristine copies with printed byte counts under a floor, every arm reading the suite's own FOOT
line. Baseline meaning-bounds 92/0 and plane-envelope 60/0, restored exactly after every arm.
**Run twice — once on the spawn tree and once on the shipped tree after the rebase onto
`origin/main` — and 10 of 10 came back as declared both times, with `git status` byte-clean
afterwards.** Battery figures, both baselines RE-RUN rather than subtracted: spawn tree
133/133 · 8,319 -> 133/133 · 8,332; shipped tree 134/134 · 8,387 -> 134/134 · 8,400. **The +13 is
the same on both** — meaning-bounds 85 -> 92, plane-envelope 54 -> 60, no other suite moving.

The two pairs are the receipts:

- **(5)/(5b)** — the SAME planted `found: false` refusal publishing a collection off an
  unbounded scan: **ratchet GREEN at BARE 38** under the new excluder, **RED at 39 of 38 over a
  NON-DEFECT** under the old one.
- **(4)/(4b)** — the SAME removed `promoted.answered` guard: **DETECTOR A fires naming
  `promoted`** under the new gate, **ZERO violations** under the old one.

**Two defects the control found in this item's own instruments, recorded rather than smoothed.**
Both new censuses first read `verdictOf` DIRECTLY instead of asking the gate/excluder in use, so
arm (1) left every printed figure UNCHANGED over a REVERTED classifier — a report about a
subject nobody was running. And the harness's own arm register first compared declared
SENTENCES with observed ones and reported all ten arms, including the working ones, as NOT AS
DECLARED.
## 2026-08-08 — D-237: the shared temp space this battery does NOT own

Instrument: `bio-plane/scripts/residue.mjs` and three purpose-written probes, run on the
development machine (darwin 25.5.0) while other worktrees were active. Every figure below
decided a design choice in the reporting half of D-237, and each is recorded because the
choice is otherwise indistinguishable from a preference.

**THE SPACE ITSELF, and it is the reason the report is careful rather than loud.**

| Figure | Measured |
| --- | --- |
| shared temp roots after realpath dedup | **3** — `/private/tmp`, `/private/var/folders/…/T`, `/private/var/tmp` |
| top-level entries across all three | **861** |
| bytes in `/tmp` alone, depth 4 | **236.4 MB** across 647 dirs / 2,081 files |
| bytes in `$TMPDIR` alone, depth 4 | **575.3 MB** across 1,303 dirs / 2,707 files |
| `bio-battery-*` fences belonging to OTHER pids, during one run | **2** |
| legacy-prefixed orphans spared by the sweep, during one run | **64**, holding **115.1 MB** |

`os.tmpdir()` answers `/var/folders/3_/…/T` on this machine while both historical offenders
wrote to the literal `/tmp`, and `lsof` answers in the `/private`-resolved spelling of both.
**Three different names for two directories is precisely why counting inside `$TMPDIR` could
not see either offender**, and it is why the roots are deduplicated by REALPATH rather than
by string.

**IDLE CHURN, over a 150 s window with no battery of ours running** — the figure that decides
whether "something changed in a shared root while we ran" is signal or a flood:
**3 arrivals, 4 changed entries, 0 vanished.** Of the four changed, **three moved by ZERO
BYTES** (`TemporaryItems`, `com.apple.icloud.searchpartyuseragent`, `duetexpertd` — macOS
daemons touching directories they own). So the report names a byte delta or an arrival and
SUMMARISES an mtime touch, and that rule is measured rather than tidy.

**THE COST OF THE ONLY CONCLUSIVE ARM.** `lsof -n -P -FpRn` unscoped: **276 / 118 / 117 ms**
over three calls, 1,261,760 bytes of output. Scoped `-c node -c workerd`: **17 / 17 / 17 ms**,
46,739 bytes. Every process in this battery's own tree is one of those two commands, so the
scope costs nothing in reach and 7× in time — 2 samples × 133 suites is ~4.5 s on a 113 s run.

**THE BOUNDED WALK.** Depth 4, one pass per root: `/tmp` **134 ms / 3,478 ops**,
`$TMPDIR` **170 ms / 5,233 ops**, `/var/tmp` **0 ms / 15 ops**. ~300 ms total, which is why
the deep scan runs TWICE per battery (before and after) and never per suite — per suite would
be ~40 s on a 113 s run.

**SUITE DURATIONS, which set the sampling cadence.** 133 suites: minimum **32 ms**, median
**505 ms**, maximum ~1.6 s. Suites finishing before a first sample at 200 ms: **13**; at
100 ms: **11**; at 60 ms: **10**. The floor is the handful of suites shorter than an `lsof`
call, so the cadence is 60 ms / 700 ms and **the suites the arm never covered are COUNTED and
PRINTED** rather than assumed sampled.

**WHAT WAS STANDING ON THE MACHINE, unreported, when this was written:** `/tmp/mfp`
**10.9 MB / 18 files**, written 2026-07-31 17:36 .. 2026-08-05 05:13 — D-237's own subject,
eight days on; and `/tmp/mfp-m0-10-arm` **2.7 MB / 18 files**, written 2026-08-08 17:55, the
residue of **M0-10's own control arm**. Neither is inside any `$TMPDIR` this estate owns,
neither matches any prefix the orphan sweep knows, and no instrument in the repository had
ever mentioned either.

## 2026-08-08 · REC-68 · BRANCH REACHABILITY OF THE SELECTOR LANGUAGE, measured rather than read

Instrument: `NODE_V8_COVERAGE` over a driver that exercises `compile()` from its own
entry point, plus a reporter that names every range V8 says was NEVER ENTERED and prints
its source text. **This is the one module in the plane where line coverage is a real
measurement rather than a fabrication:** `VERIFICATION.md` declines to report line
coverage because the plane runs inside workerd, and `query.mjs`'s own header says it is
deliberately pure and holds no database handle — so it runs in node and the instrument
measures the SUBJECT rather than the harness.

Corpus driven: **644 query strings × 12 viewers × 2 implicit operators × 5 row arms =
77,280 `compile()` calls**, each statement in the returned shape invoked, plus `textOf`,
`viewerPredicate`, `ambiguousBareWords` and `meaningVocabulary`.

| pass | never-entered ranges | what closed them |
| --- | --- | --- |
| 1 | 43 | — |
| 2 | 30 | **the viewer is a STRING**; the driver passed the object shape the fixtures use elsewhere, so all 43,400 compilations ran against the DENY gate and the whole participant branch was unreachable BY THE HARNESS |
| 3 | 22 | statements take a MODE; a call with no argument only ever drives the default. Facet lists that filter to empty. Chains of exactly 5 and 9 arms, which is the only way into `chain()`'s non-compound regroup tail |
| 4 | 15 | `textOf` file shapes: the `content` fallback, a malformed frontmatter, an array in frontmatter, a nested scalar/array/null |
| 5 | 14 | **THE FIX** — the D-228 branch left the list and has not returned |
| 6 | 11 | `sort:` with an empty value; `compile({q: null})` |

**SIX BRANCHES ARE GENUINELY UNREACHABLE IN THE COMPILER, AND ONLY ONE OF THEM MATTERED.**
That distinction is the finding, and inflating it to "six defects" would be the wrong
report:

1. `tokenize`'s `field:"value"` branch — **D-228.** A defence that was supposed to do
   work, documented by its own comment, that had never run. Its unreachability WAS the
   defect. **Fixed.**
2. `primary()`'s trailing `eat(); return null;` — the tokenizer emits exactly seven token
   kinds and all seven are handled above it.
3. `ftsExpr`'s `if (!node) return null` — no call site passes null.
4. `chain`'s `if (!parts.length)` — no call site passes an empty array.
5. `setSql`'s `if (node.op === "text")` — **shadowed by the pure-text short circuit two
   lines above it, which returns byte-identical SQL.** Dead, and harmlessly so.
6. `setSql`'s final `return { sql: ALL }` — all six node ops are handled above it.

2 through 6 are belt-and-braces returns at points where the input cannot arrive; none of
them changes an answer and none is a documented promise to a reader. **The class D-229 and
REC-73 found — a mechanism believed on the strength of its existence — has exactly one
member here, and it is the one this item was sent for.**

**WHAT THIS MATCHER CANNOT SEE, stated rather than left to be discovered:**

- It measures `query.mjs` and nothing else. `store.mjs` and `index.mjs` run inside workerd
  and are as unmeasurable as they were; this technique does not extend to them and should
  not be quoted as if it did.
- V8 range coverage is per-BLOCK, not per-CONDITION: `a && b` reports as entered when the
  block runs, so a conjunct that is never independently decisive does not show up. **The
  D-228 guard was found by READING, not by this instrument** — the instrument confirmed
  it. A second unsatisfiable conjunction inside an otherwise-entered block would not
  appear in this table.
- A range this driver did not happen to reach is indistinguishable from an unreachable one
  WITHOUT reading it. Six passes were spent narrowing 43 to 11 for exactly that reason,
  and the residue was classified by hand, which is why the source text is printed.
- The eleven remaining include five trivia in `textOf`/`bareIndex` (`?? ""`, `|| []`) that
  are reachable in principle and not worth a fixture.
## 2026-08-08 · UI-38 — the running-session panel published three conditions and rendered one; and two QUEUE rows are ahead of the tree

Instrument: `grep` over `bio-plane/src`, `bio-plane/test`, `bio-plane/checks`, `bio-plane/scripts`
and `civicos-ui/`; `git log --all -S` and `git branch -a --contains`; `node civicos-ui/test/run.mjs`;
`cd bio-plane && npm run test:battery`; `node scripts/coverage.mjs --strict`. Tree: `origin/main` at
`57b5067`, fast-forwarded, `npm ci` run in `bio-plane/`.

### The two figures a brief carried that were wrong, both measured rather than argued

| claim | measured | where it came from |
| --- | --- | --- |
| the UI harness is RED at 8 (briefed) / 12 (UI-51) failures | **exit 1 with 3 failures, all `Cannot find module 'miniflare'`; exit 0 with 40/40 after `npm ci`** | a worktree arriving without `bio-plane/node_modules` — WORKER.md's own first warning |
| `op=airuns` (REC-69) and `op=airun`'s `standard` (REC-74) are landed inputs | **NEITHER IS ON `main`.** No `airuns` anywhere in `bio-plane/**` outside `airunspawn`; `aiRunRead` publishes no `standard`. Both on unmerged worker branches (`2d9c57b`, `a3af6bb`), neither an ancestor of `57b5067` | `QUEUE.md` marks both `· done`, and names REC-69 in a *"FIVE ITEMS INTEGRATED … verified at 129/129 GREEN"* line |

### What the surface actually rendered, before this item

`op=airun` publishes TWO of §11's three conditions today — the **bias manifest** (PL-12/D-84) and the
**skill version** (SK-1, inside `principal`). A member could see **one**. `aiSessionPairsHtml` skipped
every object, and the panel compensated with one renderer per nested field somebody had named:
`principal`, `budget`, `condition`. `bias` carried no such name, so **not one of its fields reached a
member**; `context` was invisible for the same reason, so the panel never said which inquiry the run
was in.

**The instrument had the identical defect and that is why it was never seen.**
`ai-session-wire.test.mjs`'s `wireFailures` enumerated the same three nestings by name and skipped
every other object, so ARM W1 answered `[]` — *nothing is missing* — over a panel missing a whole
published condition. Two hand-kept lists of the same three names, one in the subject and one in the
instrument, invalidating each other's evidence.

Corpus after inverting the walk: **24 scalars** reached across the whole record at every depth
(floor 20), over 4 nested blocks the record publishes (`context`, `principal`, `budget`, `bias`).
Before: the walk reached 3 of those 4.

### Instrument reach, stated plainly

The consumer sweep for the three deleted renderer names is a **literal text match** over
`bio-plane/`, `agent-worker/`, `civicos-ui/`, `docprofile/`, `pdf-worker/`, `tools/` and `newgroup/`.
It sees every source and test file that spells a name out. **It cannot see a name built at runtime**
(`"aiSession" + kind + "Html"`), and nothing in this repository does that today — but that is a
statement about today, not a property of the matcher. Three consumers were found; the third
(`bio-plane/test/airun.test.mjs`) is in another area and is filed as **IC-41**.

### Figures

- UI harness: **exit 0 (unpiped), 40/40.** `ai-session-wire` 72 → 81, `surface-registry` 382 → 393,
  `ai-session-context` 77 → 77 — each measured by re-running the true baseline from
  `git show HEAD:`, never by subtraction, with every restore verified by sha256 **and** `cmp`.
- Plane battery: **133/133 green · 8,323 assertions · exit 0.** The only plane file this item
  touches is `bio-plane/test/airun.test.mjs`, true baseline re-run at **103 → 107**.
- `node scripts/coverage.mjs --strict` run DIRECTLY, `$?` read UNPIPED: **exit 0.**
- Two suite headers found stale by measuring them: `ai-session-wire` says "Clean tree: 70" against a
  real 72; `airun.test.mjs` says "Clean tree: 101" against a real 103.
## 2026-08-08 · REC-74 — THE RUN OBJECT'S STORED-VS-PUBLISHED MATRIX

**Instrument:** `bio-plane/test/run-conditions.test.mjs`, ARM W and ARM P. The
column corpus is parsed live out of `schema.mjs`'s one `CREATE TABLE IF NOT
EXISTS ai_runs (...)` literal; the reader corpus is walked out of `store.mjs`
after comments are stripped, by segmenting method signatures at two-space indent
and testing each body for `FROM ai_runs`. Neither figure is typed. Re-run it
rather than reasoning about it.

| What | Measured | Date |
| --- | --- | --- |
| Columns `ai_runs` stores | **20** | 2026-08-08 |
| Methods in `store.mjs` reading `ai_runs` | **12** of 336 methods scanned | 2026-08-08 |
| Of those, methods that PUBLISH about the row | **3** — `aiRunRead`, `aiRunSpawnPayload`, `aiRunLog` | 2026-08-08 |
| Corpus judged | **240** (method, column) pairs; **60** cells owed a declared disposition | 2026-08-08 |
| Columns every publishing reader publishes | **1** — `run` | 2026-08-08 |
| Columns some publish and some do not | **18** | 2026-08-08 |
| Columns NO reader publishes | **1** — `state` | 2026-08-08 |

**THE FIGURE THAT MATTERS IS THE 18.** Two readers of one row disagreeing about
which of its facts exist was the defect REC-74 was routed for, and the missing
standard pair was one instance of a pattern that covers nearly every column. The
disagreements are now DECLARED, with a reason per cell, and the matrix is total
in both directions: a column added to `ai_runs` tomorrow fails the suite, and a
disposition naming a column the schema does not have fails it too.

**AND THE 1 IS A SECOND INSTANCE, FOUND BY THE SWEEP AND NOT FIXED BY IT.**
`ai_runs.state` is written by `aiRunOpen` and `aiRunTick` and published by no
reader. `loadCaptureSession` — the model §11 says the run object extends — does
publish its `state`, and `airun.test.mjs`'s ARM P resumes from the LOG. It is
SCRATCH rather than a CONDITION, so REC-74's doctrine sentence does not bind it;
the resumability question is delegated in `CLAIMS.md`.

**WHAT THE MATCHER CANNOT SEE, measured rather than assumed.** It cannot see a
read of `ai_runs` built by string concatenation, one inside a nested function
expression assigned elsewhere, a reader outside `store.mjs` (ARM W6 asserts
there is none today), or a column added by `#migrate` rather than by the CREATE
TABLE literal. Its withholding check is two-layer and the second layer is not
total: **21 of the withheld cells got a VALUE scan, 9 got the path check alone**
(enum-like, short, or itself withheld by `op=airun` so there is no reference to
scan for), and cells whose value is shared with a column the same reader does
publish are UNRESOLVABLE by value and are counted separately. ARM P3 prints all
three sets on every run.

## 2026-08-08 · REC-74 — DEC-49 ARM E, AFTER `STANDARD_BASIS`

Measured by `node civicos-ui/check-refusal-codes.mjs` on a green run, and the
floors moved in the same turn from the figures it PRINTED.

| What | Before | After | Date |
| --- | --- | --- | --- |
| Plane vocabularies arm E finds | 8 | **9** | 2026-08-08 |
| Terms across them | 51 | **56** | 2026-08-08 |

Every other floor was RE-MEASURED and is unchanged: census 405, families 11 /
rows 105, REACH 191, ratchet ceiling 73, arm C 28 sites / 60 lines / 16 regions
/ 953 region lines / 76 codes. **REC-74 mints no refusal and no C-number** — it
publishes a condition and refuses nothing, which is why the refusal floors did
not move and why its own over-strictness arm is that a projectless run READS
CLEANLY.
## 2026-08-08 · D-235a — how far `op=suggest`'s answer diverged from the record, driven

**Instrument:** `bio-plane/test/suggest.test.mjs` block 8, driven through the control plane
against miniflare; every figure below is the suite's own output on the tree BEFORE the fix
and then after it. Nothing here is read off the source.

### The divergence, measured before the fix

`op=suggest`'s success answer was asserted field by field against what `op=basisversions`
publishes for the same version, over a submission carrying characters the restricted
frontmatter grammar cannot hold. **Pre-fix: 9 of the block's 11 assertions FAILED.** The two
that passed were the over-strictness arm and a walk guard, which is what those are for.

| field | submitted | the record holds | the answer said | verdict |
| --- | --- | --- | --- | --- |
| `version` | `the folded\nreading name` | `the folded reading name` | the submission | **DIVERGED** |
| `grounds` | `["paper\ntrail"]` | `["paper trail"]` | the submission | **DIVERGED** |
| `legs` | — | rows carrying `ord` | candidate legs, no `ord` | **DIVERGED (shape)** |
| `composition` | — | the record's | the record's | agreed (REC-75) |
| `run`, `state`, `author`, `at`, `count` | — | — | — | agreed |

**`#fmSafe`'s `[\r\n]+` -> SPACE is the whole of the reachable gap**, because a space is the
one character it produces that `VERSION_NAME_RE` (`^[a-z0-9][a-z0-9 ._-]{0,63}$/i`) and
`GROUND_LABEL_RE` (`^[a-z0-9][a-z0-9 _-]{0,47}$/i`) both admit. Every other transform it
performs is excluded by those grammars on the written side.

### Reachability of the blank part label, measured rather than assumed

`basisVersionsOf` writes `ground: ""` for a leg that names no part. Driven:

- **through `op=suggest`: UNREACHABLE.** A version whose leg names no part is refused at
  `promote` — `ok=false code=BASIS_VERSION_REFUSED` — by C-25.5's totality rule.
- **through a REPLAYED promotion: REACHABLE, and driven end to end.** The shape arm is
  `!pkg.replay` (*the record's own history must be holdable verbatim*), so a replayed
  document carrying such a leg projects it, and `op=basisversions` published
  `grounds: [""]` — a part nobody declared, inside a list of the parts a reading declares.

### Consumer blast radius, measured over the estate

`grep -rn` for `op=suggest`, `composition_of`, `ground_count`, `shared_origins`,
`origins_complete` over `civicos-ui/`, `agent-worker/`, `newgroup/`, `docprofile/`,
`pdf-worker/`: **0 hits** outside `civicos-ui/check-refusal-codes.mjs`, which reads refusal
codes and never a success answer. `agent-worker/src/index.mjs` is the only consumer of
either op and reads `wrote`, `repeated`, `repeats`, `code`, `reason` and
`versions[].name` — **none of which moves.** Measured blast radius inside the repository:
**zero**.

### The battery

**True baseline measured in this worktree before any edit: 133/133 suites green · 8,319
assertions · exit 0**, HEAD `bb426ac`, `git status --short` empty. **After: 133/133 · 8,333 ·
exit 0.** Delta **+14**, attributed by DIFFING the two full runs rather than by subtraction:
`suggest.test.mjs` 80 -> 93, `versions.test.mjs` 77 -> 78, **nothing else moved**.

### A sixth confirmation of D-233, unasked for

Six negative-control arms were added to `suggest.test.mjs`'s declaration block and
`node scripts/coverage.mjs --strict` printed **`570 arms stated`** both before and after —
the register's floor met EXACTLY, with the six new arms scoring zero. They are LABELLED
(`(D-235a)`) rather than numbered, and the register says in its own output that a labelled
arm is not counted. **This is the same blindness REC-75 measured on the same file and the
same day, reproduced by an item that did not set out to measure it.**

## 2026-08-09 · UI-42 — version review: rotation and diff, measured

Instruments: `node civicos-ui/test/run.mjs` (repo root, exit read UNPIPED),
`cd bio-plane && npm run test:battery`, `node bio-plane/scripts/coverage.mjs --strict`
(run DIRECTLY, `$?` read with nothing piped after it), `node tools/plancheck.mjs`, and
`node civicos-ui/test/version-review.control.mjs` (this item's own nine-arm driver).
Worktree `agent-a8c8ed9c32eb56980`, HEAD `ad87db7`.

### The UI harness

**True baseline measured in this worktree BEFORE any edit: 41 suites PASS · 0 FAIL · three
guards green · exit 0.** After: **42 suites · 0 FAIL · exit 0.**

Per-suite attribution by **DIFFING two full per-suite runs** — the working tree against a
`git worktree add --detach HEAD` scratch checkout — never by subtraction:

| suite | baseline | final | why |
| --- | --- | --- | --- |
| `surface-registry.test.mjs` | 393 pass | 405 pass | one more surface described, walked and act-checked |
| `preauth-vocabulary.test.mjs` | 62 | 65 | WALK 2's router census 5 → 6, plus two classification pins |
| `bound-sweep.test.mjs` | 202 | 202 | count unchanged; ARM G's walk gains one site, classified STATED-HERE |
| `version-review.test.mjs` | — | 89 | new |
| every other suite | unchanged | unchanged | — |

**TWO INSTRUMENT FINDINGS FROM THAT DIFF, BOTH RECORDED RATHER THAN SMOOTHED.**

- **The scratch checkout has no `bio-plane/node_modules`,** so `ai-session-context`,
  `ai-session-wire` and `intent-write` reported **NO TALLY (-1)** at baseline and a real
  figure in the working tree. That is the SCRATCH TREE missing miniflare
  (*"the real plane could not be started — miniflare is not installed"*), not a delta, and
  a subtraction would have booked +299 assertions this item never wrote. It is WORKER.md's
  own `npm ci` warning arriving through the back door of a baseline checkout.
- **A per-suite tally reader that takes the last `<n> assertions` in a suite's output is
  blind to `preauth-vocabulary.test.mjs`,** whose footer prose contains *"5,544
  assertions"*: it read **544 in BOTH trees** and would have reported that suite as
  unmoved while it went 62 → 65. The true figures above come from running that suite
  ALONE in each tree. A reader that answers the same wrong number on both sides of a
  comparison is the shape a diff cannot catch.

### The battery and coverage — UNMOVED, and that is measured rather than assumed

No file under `bio-plane/`, `checks/` or `scripts/` is touched by this item
(`git status --short` names only `civicos-ui/**`, `docs/development/**` and `.gitignore`),
so the run below is baseline and final at once:

- **138/138 suites green · 8,827 assertions · 133.8s · exit 0.**
- `coverage.mjs --strict` **exit 0**: OPS **162 declared / 162 reached (100.0%) / 0
  unreached**; CHECKS **219 / 219 named**; NEGATIVE CONTROLS **134 of 134 suites declare
  one**, **621 arms stated**; REGISTER FLOOR arms 621/621 · classified 133/133 · corpus
  134/134; FLEET 2 members · 4/4 surface ops. Provenance: 144 of 144 items at HEAD.

### Five floors moved in `civicos-ui/test/surface-registry.test.mjs`

Every one from the figure the arm PRINTED, taken by raising the floor to a value that
could not pass and reading the failure line, then setting the printed number:

| arm | was | now | measured |
| --- | --- | --- | --- |
| A3 act placements | 18 | 19 | 19 |
| A4d catalogue outside the register | 15 | 16 | 16 |
| A4e distinct hosted acts | 15 | 16 | 16 |
| D1 ops called statically from app.html | 50 | **64** | 64 |
| D5 declared reads | 30 | **39** | 39 |

**D1 and D5 were slack BEFORE this item touched them — 13 and 7 respectively.** This item
added one op call and two reads; the other 13 and 7 had been sitting unmeasured since those
arms were written. REC-71's finding (*a floor with slack is not a ratchet*) in two more
arms, and D1 at 50 would have sat green through the deletion of a fifth of app.html's
static op calls.

The ACT REGISTER (`ACTS_AWAITING_SURFACE`) drained one row: **7 outstanding → 6**.
`versionhide` is now hosted. ARM A4c fired on the FIRST run of this item, naming the row and
the item that owed it, before anything else was measured — the drain working as designed.

### The negative control — 9 arms, 9 as declared, and one of them found this item's own suite wrong

Full declarations and results are in `civicos-ui/test/version-review.control.mjs`'s header.
The headline: **arm 3 (the hide offer cut in half) came back RED but NOT AS DECLARED on its
first run, because the "asserted verbatim" arm was comparing the rendered page against the
RUNTIME'S OWN constant** — an equality that costs nothing to produce, and therefore the one
arm the item's acceptance names could never have failed. DEC-29(b) is a ruling about a
sentence; the sentence is now typed into the suite. Second run: RED as declared, 6 of 85.

Arm 1 (**make hide delete** — the surface drops hidden readings at the load): **10 of 85
fail**, five of them the ACTS-PERSIST arms, and the address `#versions/<INQ>/<name>` stops
resolving. Arm 7 (**the sweep goes blind**): 2 of 85, failing on the FLOOR with *"0
phases"* rather than reporting the ban clean over nothing.

### One hazard this harness cannot see, closed anyway

A real browser fires `hashchange` **after** `versionRotate` writes the new address, and
asynchronously — so the `*_HASH_LOCK` pattern every other routed surface in `app.html` uses
does not cover it, and re-opening on that event would rebuild the state with nothing to
compare against, silently undoing the member's own rotation on every move. The router now
returns early when the address already IS what is shown. **The DOM stub in every UI suite
here fires no events, so no suite can reproduce the event**; the router is driven directly
at the address rotation just wrote, which is what the event would do, and the substitution
is labelled as one at the site and in the suite.
## 2026-08-09 · FL-5 — A FENCE'S ONLY WITNESS COULD NOT FAIL: `harness.test.mjs`'s §14 ARM, MEASURED

**Instrument:** `agent-worker/test/harness.test.mjs`, run unmodified except for ONE patch to the
plane MOCK it carries. Worktree `agent-a0b07bfdf348ecea8`, HEAD `ad87db7`, tree otherwise clean.

**What was patched.** The mock's `op=airunspawn` SEARCH-half payload was given a full bias block —
`bias: { in_force: true, manifest: { statements_sha: "LEAKED-LENS-SHA" } }` — which is exactly the
state §14's fence exists to make impossible: *the search half never receives the lens.*

**Result: 194 pass / 0 fail.** The suite's own arm, `no search-half spawn payload carried a bias
field`, **PASSED while the fence was defeated.**

**Mechanism, and it is not subtle once seen.** The driver computed `manifest_field_present` into a
local (`spawned`) that was never published, and the arm read `out.trace` for notes matching the
literal `manifest_field_present` — a phrase the notes never carry. The assertion could only ever
fail if somebody wrote those nineteen characters into a trace note. Restore verified by sha256
(`e4ca9f14…`, identical before and after) and by `cmp`.

**Why it is recorded here rather than only fixed.** This is the project's most-repeated finding —
*a mechanism believed on the strength of its EXISTENCE rather than its behaviour* — arriving inside
a FENCE rather than inside a document, in a member that was asserting the property ABOUT ITSELF
over a value nothing outside it could read. **The general rule it pays for: a component asserting a
fence about its own behaviour must PUBLISH the thing the fence is about, or the assertion is over a
value nobody can see.** FL-5 publishes the spawn contracts on `POST /run` and asserts on the
manifest's own `statements_sha` BYTES, which no spelling can dodge; and arm F4b of
`fanout.control.mjs` exists solely to prove that replacement arm CAN fail — with the field added,
the second witness removed and the driver made to fetch the composing half, the suite goes to
**151 pass / 21 FAIL** and the value-level arms are among the failures.
## 2026-08-09 · D-255 — IS THIS FIELD READ BY ANYBODY? asked of the field itself, not of a grep

**Instrument:** `bio-plane/test/fieldread.control.mjs`, run from `bio-plane/`. It transiently
rewrites `src/query.mjs` so that every object the query language constructs — tokens, AST
nodes, the parser's `ctx`, the `compile()` plan and its three sub-objects — is wrapped in a
Proxy whose `get`/`has` traps RECORD, then drives a synthetic corpus and three real suites
through it and prints, per field, how many were WRITTEN and how many times anything asked
for one. The source is restored and verified by sha256 AND `cmp`.

**Why not a grep, which is the whole finding.** D-255 is an instance of a KIND — a field
computed and read by nobody — and the obvious matcher grades a SPELLING. `a["ph" + "rase"]`,
`const { phrase } = atom`, `{ ...atom }` into a published envelope and `JSON.stringify(plan)`
are all reads no list of spellings catches, and a classifier that misses one REPORTS A LIVE
FIELD DEAD. A property read is exactly what a Proxy traps, so the question is asked of the
field rather than of its name.

### The sweep, 2026-08-09, on the tree at `ad87db7` plus this item

| | |
|---|---|
| corpus | 210 queries × 11 viewers × 18 option sets = **41,580 compilations**, plus `query.test.mjs`, `meaningquery.test.mjs` and `bounds.test.mjs` driven THROUGH the probe |
| reach | **59 distinct constructed fields** before the fix, 58 after |
| `atom.phrase` | **written 6,517 · read 0** |
| every other atom field | `op` 11,559 reads · `column` 14,677 · `value` 19,556 · `prefix` 13,039 |
| never read in node | 8 fields: `atom.phrase` and all seven of `plan.meaning.*` |

**REC-68's figure, re-measured before it was acted on, HELD EXACTLY** — one write site, zero
read sites. Twelve items have found a briefed figure stale; this one was right. Stated
because the practice is to trust the measurement, not the streak.

### What the sweep cannot see, and the arm that proves it matters

`query.mjs` is pure and runs in node — that is what makes this instrument possible at all,
and `query-reach.control.mjs` rests on the same fact. But its OUTPUT is consumed by
`store.mjs` INSIDE WORKERD, where the recorder cannot be read back out. **Five of the eight
never-read fields were exactly that case:** `plan.meaning.table`, `.grain`, `.identity`,
`.limit` and `.offset` are read at `store.mjs:1330-1336` and published by `op=meaningrows`.
A sweep that stopped at the node result would have deleted five live fields.

So a never-read result here is a CANDIDATE, and what settles it is the TRIPWIRE: the field
is restored as a getter that THROWS, and the WHOLE battery is run. A throw does not need to
be read back out of workerd — the battery goes red. `plan.meaning.table` armed that way
takes the battery RED; `atom.phrase` armed that way leaves it GREEN.

### Nothing an answer depends on moved

An answer-determining digest — `match`, `terms`, `warnings`, `widenable`, and the page
statement's SQL and bound arguments over 360 compilations across every field and meaning arm
— is **`b1e0392b7c1b1440…` before the deletion and `b1e0392b7c1b1440…` after it**.

### The arms, 2026-08-09 — seven, each armed ALONE, restores verified by sha256 AND `cmp`

Baseline for every one of them: **138 suites (134 plane · 4 fleet) · 138/138 green · 8,835
assertions** with this item's four new pins in place (8,827 before them).

| arm | what was armed | declared | actual |
|---|---|---|---|
| BASE | nothing — the tree as it stands | GREEN | GREEN · 138/138 · 8,835 |
| P | `phrase` restored as a THROWING getter **and** a read injected as `a["ph" + "rase"]` in `ftsAtom` | RED | RED · exit 7 · 131/138 · 8,234 |
| O1 | the genuine read of `prefix` rewritten `a["pre" + "fix"]` — over-strictness, SPELLING | GREEN | GREEN · 138/138 · 8,835 |
| O2 | tripwire on `plan.meaning.table`, which the node sweep calls never-read — over-strictness, RUNTIME | RED | RED · exit 3 · 135/138 · 8,793, and the three failures are `bounds.test.mjs`'s three `op=meaningrows` assertions, exactly as declared |
| D | `phrase` restored as a THROWING getter, no injected read | *(first run: GREEN — **wrong**)* | RED · 137/138 · 8,832, **and the only failures anywhere in the battery are `query.test.mjs`'s four D-255 pins** |
| C | tripwire on `plan.meaning.columns` | GREEN | GREEN · 138/138 |
| R | `phrase` re-added as an ORDINARY field — the ratchet | RED | RED · `query.test.mjs` 121 pass, 4 fail |

**ARM D CAME BACK NOT AS DECLARED, AND THE DECLARATION WAS WRONG RATHER THAN THE SUBJECT.**
It was declared green on the reasoning that a field nothing reads cannot make anything fail.
That was true of the estate as it stood BEFORE this item and false after it: the item's own
pins are STRUCTURAL — they read `Object.keys(ast)` — so they fire on the field's PRESENCE and
cannot care whether anything reads it. Re-adding the field is precisely what they exist to
catch. The declaration is corrected in `fieldread.control.mjs` into something stronger than
the boolean it replaced — the arm now declares the exact SET of suites permitted to fail,
because `RED` alone would also be satisfied by a field read in forty places, which is the
opposite of the claim being made. The original declaration is kept at the site. **The
corrected arm was RE-RUN, not merely re-worded** (`node test/fieldread.control.mjs --arm=D`):
suites that failed `query.test.mjs`, declared exactly `query.test.mjs`, AS DECLARED.

**What P, O1 and O2 are for, together.** P proves the tripwire fires at all, through a
spelling no grep would have found. O1 proves a live field in an unanticipated spelling is
NOT reported dead. O2 proves the same for a live field in a RUNTIME the sweep cannot enter —
and it is the arm that matters most, because five of the eight never-read fields the node
sweep reported are exactly that case.

**A ONE-ASSERTION DIFFERENCE BETWEEN TWO GREEN RUNS WAS FIRST WRITTEN UP HERE AS
CONTENTION, AND THAT WAS WRONG.** ARM BASE reported 8,835 and ARM C reported 8,836 on what
looked like the same tree, and with four to six `npm run test:battery` processes from other
worktrees of this clone running against the same machine throughout (observed directly with
`ps`/`lsof`, one of them writing its output into the SHARED scratchpad root) contention was
the easy explanation. It is not the true one, and the arithmetic says so: the D-258 row was
appended to `DEBT.md` BETWEEN those two runs, and `planning-hygiene.test.mjs` asserts one
line per debt row. 8,827 baseline + 8 (this item's pins) = **8,835**, + 1 (the D-258 row) =
**8,836**, which is the final figure. Recorded because "a plausible cause reached for before
the arithmetic was checked" is the failure this project meets most often, and it arrived
here inside a sentence that claimed to be reporting an instrument.

### Battery, attributed per suite rather than by subtraction

Baseline on this worktree at `ad87db7`: **138 suites (134 plane · 4 fleet) · 138/138 green ·
8,827 assertions · exit 0**, `npm ci` run first because the worktree arrived without
`bio-plane/node_modules`. Final: **138/138 · 8,836 · exit 0**. Delta **+9, all of it
attributed against a re-measured true baseline for each suite that moved:**
`query.test.mjs` **117 → 125** (measured at 117 by driving the pre-fix suite through the
read probe, before any edit to it) and `planning-hygiene.test.mjs` **292 → 293** (measured at
292 by running that suite alone after the D-255 disposition and before the D-258 row). No
other suite's file was touched. `node scripts/coverage.mjs --strict` run DIRECTLY with `$?`
read UNPIPED: **exit 0** · OPS 162/162 · CHECKS 219/219 · REGISTER FLOOR arms **627/627**
(moved 621 → 627 from the printed figure, in the same turn) · classified 133/133 · corpus
134/134. `node civicos-ui/test/run.mjs` from the repo root, exit read unpiped: **0**;
`check-refusal-codes` floors did NOT move (REACH stays 217, census 424, ceiling 41) and no
refusal code is named anywhere in this item.

**TWO SUITES REPORT `assertions unknown` IN EVERY RUN** — `bundle.test.mjs` and
`livefire.test.mjs`. That is a missing tally, not a zero, and it is named here rather than
folded into the totals above.
---

## 2026-08-08 · REC-69 · `op=airuns`, and FOUR figures measured rather than carried

**Instrument: `bio-plane/scripts/battery.mjs`, `bio-plane/test/airuns.control.mjs`,
`bio-plane/test/airuns.test.mjs`'s own index sweep, `civicos-ui/check-refusal-codes.mjs`.**

**1 · THE BATTERY, ATTRIBUTED BY RE-RUNNING THE TRUE BASELINE IN THIS WORKTREE.**
`124/124 green · 7,811 assertions` → `125/125 green · 7,864`. The brief carried ~7,815;
**the measured figure is 7,811, and the item's brief was stale — the tenth consecutive
item to find that by measuring.** The delta is `+53` and every unit of it is attributed:
`airuns.test.mjs` NEW at 46, `bounds.test.mjs` 147 → 152 (the roster pin and the new op's
four live arms), `hygiene.test.mjs` 504 → 507 (a per-file sweep, and this item adds files
to `test/`). **120 counted suites moved by ZERO.** The baseline was produced by reverting
the item's eight files to HEAD in this worktree and re-running, then restoring and
verifying every restore by sha256 AND by `cmp` against uniquely-named pristine copies.

**A MEASUREMENT HAZARD WORTH RECORDING, because it nearly produced a false number.** The
first "after" run was written to a generically-named scratchpad file that ANOTHER
concurrent checkout was also writing. The tail read `125/125 · 7,864` — the right answer
by coincidence — while the file's body listed a suite this worktree does not have
(`provenance-marker.test.mjs`), no `airuns.test.mjs`, and a RED `hygiene`. **A tally read
from a file another process is writing is not a measurement of your tree**, and the only
reason it was caught is that the per-suite attribution disagreed with the headline. Every
figure here was re-produced with uniquely-named files.

**2 · THE INDEX SWEEP — 11 ACCESS PATHS BUILT FOR A QUESTION NO OP ASKS.** REC-69's own
shape, generalised and made mechanical: **79 indexes are declared in `schema.mjs`; 68
have a statement in `store.mjs`/`query.mjs` filtering their leading column; 11 do not.**
`ai_runs_context ON ai_runs(context_id)` was one of them — declared the day IS-6 landed,
with nothing in the plane filtering `ai_runs` by `context_id` until this op. Three of the
remaining eleven were read by hand rather than trusted to the regex:
`links(source_bundle)` appears only in an INSERT's column list and one projected field;
`tasks(assignee)` appears only as a field set to `null`; `inquiry_basis(grade_source)`
appears only where a row is PROJECTED. **What the sweep can see: an index whose leading
column no `WHERE`/`AND` clause names. What it CANNOT: an index reached only through a
JOIN's ON clause, one filtered through a dynamically composed fragment, and — the big one
— a missing question that nobody built an index for. It is a FLOOR on the class, never a
census.** Ratcheted both ways in `airuns.test.mjs`.

**3 · THE DEC-49 GUARD'S FLOORS, ALL MOVED FROM PRINTED FIGURES.** families 13 → 14, rows
145 → 148, census 406 → 409, reach 200 → 203, governedSites 59 → 60, regions 46 → 47,
regionLines 1263 → 1281, codesChecked 115 → 118, vocabularies 8 → 9, vocabularyTerms
51 → 53. **The `reachGap` CEILING did NOT move and stands at 42** — three new codes
arrived already translated, which is the property a new family owes. **`regionLines` is a
property of the MERGED source**: several workers are in `store.mjs` concurrently, so if
any lands a line inside one of the other 46 spans this figure must be re-read from a
green run of the merged tree.

**4 · THE CONTROL REGISTER, RAISED AND NOT MOVED.** `scripts/coverage.mjs --strict`
prints `arms 481/471 · classified 121/119 · corpus 122/120`. **The floor was already 4
arms behind on `main` before this item touched anything** (it read `475/471` on the
untouched tree), and this item's one new suite takes it to 481. It is NOT edited here:
`bio-plane/scripts/coverage.mjs` is M0-14's ground and two items moving one shared floor
in parallel is the collision UI-48 and CPDF-9 each declined to cause. Raised for CONDUCT.

---

## 2026-08-09 · REC-69's REPLAY onto `main` — five figures re-measured rather than carried

**Instruments:** `bio-plane/scripts/battery.mjs`, `bio-plane/scripts/coverage.mjs --strict` (run
DIRECTLY, `$?` read UNPIPED), `bio-plane/test/airuns.test.mjs`'s own index sweep replayed over
three git trees, `bio-plane/test/bounds.test.mjs`'s capped-op walk, `node civicos-ui/test/run.mjs`.
Every figure below is what an instrument PRINTED on the tree named beside it.

**BASELINE, MEASURED ON `main` (`ad87db7`) BEFORE ANYTHING WAS RESTORED — and the brief's figure
was stale, as the practice predicts.** The QUEUE row records the 2026-08-08 rebuild at
**129/129 green · 8,116 assertions**. `main` today measures **138/138 green · 8,827 assertions**;
ten items landed in between. Trust the measurement, not the brief.

**FINAL, ON THE REPLAYED TREE: 139/139 green · 8,887 assertions.** Delta **+1 suite, +60
assertions**, ATTRIBUTED PER SUITE by re-running the true baseline and diffing the per-suite
tallies — never by subtracting two headline totals. **Exactly four suites moved:**

| suite | baseline | final | why |
| --- | --- | --- | --- |
| `airuns.test.mjs` | ABSENT | 49 | REC-69's own suite, plus three arms this replay added to its SWEEP |
| `bounds.test.mjs` | 151 | 156 | REC-69's live arms for `op=airuns` on the capped-op roster |
| `hygiene.test.mjs` | 553 | 556 | REC-69's new source arms |
| `run-conditions.test.mjs` | 51 | 54 | this replay's ARM W8, W8 GUARD and W8b |

**THE UNREAD-INDEX ROSTER: 11 → 13, AND IT WAS ATTRIBUTED BY REPLAYING THE SWEEP OVER THREE TREES
RATHER THAN BY ADJUSTING A NUMBER.** 11 + 2 agreeing with 13 is a coincidence, not evidence.

| tree | indexes declared | UNREAD |
| --- | --- | --- |
| REC-69's branch tip `2d9c57b` | 79 | **11** |
| `main` `ad87db7`, without this item | 84 | **14** — and `ai_runs_context` is BACK on the list, which is this item's whole premise measured a second time |
| the replayed tree | 84 | **13** |

So 11 was true of a tree that no longer exists and 14 of one without `op=airuns`; neither is the
merged figure. **The two arrivals, both LOOKED AT, per the roster's own rule that a rise needs
somebody to have looked at the new one:**

- **`provenance_route_marks(finding)` — A REAL INSTANCE.** `finding` is in no `WHERE` anywhere in
  the plane; every reader takes the latest mark per bundle by `seq` and classifies in JS.
  **THE QUESTION NO OP ASKS: "which documents carry a standing `LOOKED_INDETERMINATE` marker."**
- **`reading_text_source(transcribed)` — NOT AN INSTANCE. IT IS THE SWEEP'S OWN DECLARED BLIND
  SPOT FIRING.** `op=textprovenance` filters BOTH columns of that index, through a `WHERE`
  composed at runtime — which the sweep's header names in advance as something it cannot see.
  Measured three ways so the exculpation is evidence rather than an excuse: unread by this reader,
  READ by a fragment-aware reader, and the op is dispatched. **The matcher was deliberately NOT
  widened**: broadening it to match a bare `col=?` would also match an `UPDATE`'s `SET` clause and
  would SHRINK this roster by hiding real gaps, which is the one direction a ratchet must never
  move by accident.

**THE CAPPED-OP ROSTER: 29, from what the walk PRINTED on the replayed tree.** REC-69 measured 26
from a base of 25 in its own worktree; `main` independently reached 28 while REC-69 sat reverted.
Both were true of trees that are not this one.

**THE CONTROL REGISTER: `arms 629 · classified 134 · corpus 135`**, from a green `--strict` run,
`$?` read UNPIPED as `0`. `REGISTER_FLOOR` moved 621/133/134 → **629/134/135 in the same turn**,
and now sits EXACTLY at measured with no slack in any of the three. **AND THE +8 IS SMALLER THAN
THE ARMS THIS ITEM DECLARED, which is a property of the register and not a shrinking declaration —
see the DELEGATION in `CLAIMS.md`:** it records the block STATING THE MOST ARMS and never the sum,
so a suite carrying TWO DIFFERENT controls reports only the larger. `airuns.test.mjs` reports 7 of
its 11; `run-conditions.test.mjs` moved 5 → 6 because the new block became the larger and REC-74's
five stopped being counted.

**OPS 163/163 reached · CHECKS 219/219 named**, both 100%, so `op=airuns` and the C-34 family
arrive already driven through the control plane.

**UI harness: `node civicos-ui/test/run.mjs` from the repo root, exit 0 read UNPIPED.**

**NEGATIVE CONTROLS: 7 arms, ALL RUN, `node bio-plane/test/nc-rec69-selects.mjs`, final exit 0,
0 came back wrong, opening and closing baseline rows identical (54/0 and 49/0).** **ONE CAME BACK
WRONG ON THE FIRST RUN and it is the most useful figure here:** the OVER-STRICTNESS arm rewrote the
projection as the equally correct `SELECT DISTINCT r.run AS run FROM ai_runs r`; ARM W8 stayed
GREEN as it should, and **ARM W8b — the POLARITY GUARD — went RED**, because it built its cases by
string-replacing the LIVE segment and its anchor no longer matched, so its mutation silently
produced a segment identical to its input. **An arm that did not arm, inside the guard whose only
job is to prove the arm arms**, and it had been falling as collateral in the two arms that worked.
W8b now constructs synthetic segments the suite owns outright.

**A FOURTH CROSS-ITEM RATCHET, AND THE BATTERY CANNOT SEE IT.** `C-34.1-3` was claimed by
BOTH `AI_RUNS_CONTEXT_CHECKS` (REC-69) and `ROUTE_MARK_CHECKS` (REC-63, already on `main`).
**The battery ran 139/139 green at 8,887 assertions over that collision.** `node
civicos-ui/test/run.mjs` failed it three times — *"Two conditions behind one C-number are one
condition as far as `op=audit` can see"* — and it is the only instrument that did.
REC-69's family renumbered to **C-36.1-3** with `node tools/mintid.mjs C` (floor C-35, MINTED
not read-and-incremented); REC-63 keeps C-34 because it landed first. After the renumber:
battery 139/139 at 8,887, UI harness exit 0.

**THE FOUR RATCHETS THIS PAIR FIRES, since the 2026-08-08 backout listed two.** (1)
`run-conditions.test.mjs` ARM W3 — answered by minting `SELECTS`. (2) `airuns.test.mjs`'s index
roster — re-measured 11 → 13 with both arrivals looked at. (3) `op-claims.test.mjs`'s
`PLANNED_OPS` expiry — M0-12 landed BETWEEN the two merge attempts. (4) the C-number collision
above, which no plane suite can see. **A backout that lists the ratchets it failed is listing
the ones that existed that day**, and the queue moves underneath it.

**A FIFTH FINDING, AND IT IS ABOUT THE INTEGRATION RATHER THAN THE ITEM: THE 2026-08-08 MERGE
DROPPED `civicos-ui/check-refusal-codes.mjs` ENTIRELY.** REC-69's branch changed 12 files
(`git diff 722c37b 2d9c57b --stat`); the merge commit carried 11 (`git diff 7e5f9b0 e241672
--stat`), and the missing one holds every DEC-49 floor the new C-family invalidated. **Nothing
failed** — a dropped floor move goes SLACK, not red. Ten floors were sitting stale on the
replayed tree with the battery green, `--strict` exit 0 and the UI harness exit 0:
families 15→**16**, rows 163→**166**, census 424→**427**, reach 217→**220**, governedSites
66→**67**, regions 53→**54**, regionLines 1407→**1425**, codesChecked 141→**144**,
refusalsJudged 143→**146**, vocabularies 9→**10**, vocabularyTerms 56→**58**. All eleven moved
in one turn from the figures the guard PRINTED; every one now sits EXACTLY at measured.
`reachGap` 41/41 and `unclassifiedOutcomes` 3/3 did NOT move, correctly — REC-69's three codes
arrive TRANSLATED, which is the property a new family owes rather than the number.
**`regionLines` has now moved at integration five times out of six**, and neither prior number
was ever true of this tree: REC-69's branch computed 1281 from a base of 1263 while `main`
independently reached 1407 without it.

**CHECKS 219 → 222 after the C-34→C-36 renumber.** The collision was not only ambiguous, it was
UNDERCOUNTING the catalog by three: two families claiming one set of numbers are one set of
checks as far as the register can see.

## 2026-08-09 — UI-45: the notification surface, measured; and two live defects in the queue

**Instruments:** `node civicos-ui/test/run.mjs` from the repo root, exit read UNPIPED;
`cd bio-plane && npm run test:battery`; `node bio-plane/scripts/coverage.mjs --strict` run
DIRECTLY with `$?` read UNPIPED; `node civicos-ui/test/notifications.control.mjs`.
Worktree `agent-a4f9c3083de5f28e3`, fast-forwarded to `main` at `d579ae8` before measuring,
`npm ci` run in `bio-plane/` first.

**EVERY FIGURE WAS TAKEN TWICE, BECAUSE `main` MOVED UNDER THIS ITEM WHILE IT RAN.** The
item was built and measured on `d579ae8`; by the time it was committed, `origin/main` had
advanced to `ae34ec8` (eight merges, including REC-69, FL-4, FL-5, D-255, D-257 and PL-17).
`main` was merged in, `npm ci` re-run, and **the whole gate re-run on the merged tree** —
which is the only figure CONDUCT can integrate against. Both are recorded, because a figure
measured on a base that no longer exists is not a claim about the tree anybody will merge.

| figure | baseline (`d579ae8`) | final (`d579ae8`) | **final, MERGED (`ecf8743`)** | attribution |
| --- | --- | --- | --- | --- |
| UI harnesses | **42, exit 0** | **43, exit 0** | **43, exit 0** | `notifications.test.mjs`, 67 assertions |
| plane battery | 139/139 · 8,869 | 139/139 · 8,869 | **142/142 · 9,179** | **ZERO delta from this item, and structurally so — it modifies no file under `bio-plane/`.** The +3 suites and +310 assertions are the eight merges', not this item's |
| `coverage.mjs --strict` | exit 0 | exit 0 | **exit 0** | merged: OPS 163/163 · CHECKS 222/222 · controls 137/137, 654 arms |
| negative control | — | 12/12 as declared | **12/12 as declared** | re-run on the merged tree, every restore re-verified |

**The battery delta is attributed rather than subtracted.** This item touches no file under
`bio-plane/`, which is checkable from the diff and is the attribution: 139→142 suites and
8,869→9,179 assertions are entirely the eight merges that landed between the two runs.
`preauth-vocabulary.test.mjs` was the one file both this item and `main` edited; it
auto-merged, and its own run confirms both sets of arms — 68 assertions, all green (65
before this item's three).

**The baseline was measured in this worktree before any edit and it was not taken on trust:**
the first `ls` of `bio-plane/node_modules` came back MISSING, which is `WORKER.md`'s named
hazard — a scratch checkout without it made three suites read `NO TALLY (-1)` for an earlier
worker. `npm ci` ran before anything was measured, and again after the merge.

### Two live defects the item was not sent for, both in the queue, both found by asking what a control is keyed on

1. **Adopt / Defer / Dismiss were drawn on EVERY FINDING.** `op=proposedispose` is keyed on
   (`progression_key`, `stage_key`) and refuses a pair that is not a real stage of a defined
   progression, so on PL-15's `out-of-inquiry-lead` — whose basis carries neither, by design —
   **all three controls could only ever have been refused**, and the act dialog behind them was
   built from a context row carrying two nulls. PL-15's delegation states the rule for the MUTE
   one control over (*"a surface that shows a mute control it cannot honour is worse than one
   that shows none"*); the queue honoured it for the mute and not for the disposition.
2. **A disposed finding vanished from the screen.** The plane ages it out of the open feed
   correctly and returns the disposition beside it; the surface showed the receipt inside a
   dialog that then closed, so after `renderQueue()` the item was simply gone with nothing said.
   *"A finding that disappears is indistinguishable from one never made"* — the plane's own
   sentence, and the surface was the half that did not hold it.

**Both fixes are properties rather than lists.** The disposition test asks the ITEM whether it
carries the identity the act is keyed on, so a finding kind nobody has written yet is judged
correctly the day it arrives — *invert, do not lengthen a list*.

### The negative control — 12 arms, 12 as declared, and the one that came back wrong was the ARM

Full declarations and results are in `civicos-ui/test/notifications.control.mjs`'s header.
**Arm 8 was RED and correct on its first run and the driver called it NOT AS DECLARED**,
because its `says` string quoted **the sentence the patch deletes** rather than the assertion
that fires when it is gone — an expectation that could only ever be wrong. Recorded rather than
smoothed; the rule (`says` quotes the ASSERTION, never the source) is now written at the arm.

Arm 5 (**draw the disposition controls on every finding** — the pre-UI-45 surface exactly):
**5 of 67 fail**, naming the lead. Arm 1 (**surface-authored wording**, the item's first named
NC): 4 of 67, the verbatim arms. Arm 3 (**a dismissed proposal vanishes**, the second named NC):
4 of 67. Arm 10 (**the sweep goes blind**): fails on its FLOOR at *"0 phases were kept"* rather
than reporting the vocabulary ban clean over nothing. Two over-strictness arms and the baseline
came back GREEN at 67/67.

### The five floors moved, and NO SLACK ANYWHERE — the opposite of the day before

`surface-registry.test.mjs`: ARM A3 19→**20**, A4d 16→**17**, A4e 16→**17**, D1 64→**65**,
D5 39→**41**. Every figure was taken by driving the arm to fail on an absurd floor so it would
PRINT, then restoring the file and verifying by `cmp` before the real number was written.
**Every one of the five sat exactly where UI-42 left it a day earlier** — each move is exactly
the delta this item created (one act placement, one struck register row, one new op call, two
declared reads). UI-42 found 13 and 7 of slack in D1 and D5; this item found none, which is what
a just-re-measured ratchet looks like and is worth recording because the other finding would
have been the interesting one.

### What the instrument could NOT see, stated

The suite drives eleven rendered phases and asserts its own corpus floor, but it **cannot see a
producer that does not exist**: PL-13's two slugs are asserted ABSENT rather than fixtured into
existence, so nothing here measures how they will render. It **cannot judge the plane's answer** —
that `op=queue` files a lead under inquiry B's ancestors is PL-15's acceptance. And, as with every
UI suite here, **the DOM stub fires no events**, so the stance router is driven directly at its
address rather than through `hashchange`, and the substitution is labelled at the site.

---

## M0-18 · the provenance floors in `bio-plane/`, 2026-08-09

**Instruments:** `bio-plane/scripts/provenance.mjs` (via each suite), `npm run test:battery`,
`node scripts/coverage.mjs --strict`, `node civicos-ui/test/run.mjs`,
`bio-plane/test/provenance-floor.control.mjs`. **Tree:** `worktree-agent-a62aec7acd493144e`
at `d579ae8`, a fast-forward to `main`.

### The class, and what the sweep found

A suite that reads its corpus off the WORKING TREE and then FLOORS on what it found. The
brief named five instances plus one different exposure. **Measured, there are seven floors
and one different exposure, and two of the floors the brief did not name.**

| site | the floor | in the brief? |
| --- | --- | --- |
| `test/bounds.test.mjs` | `corpus > 200 files && > 5,000,000 chars` (whole repo) | yes |
| `test/case-opened.test.mjs` | `corpus > 200 files && > 5,000,000 chars` (whole repo) | yes |
| `test/identity-claims.test.mjs` | `files >= 24` **and `wide >= 80`** (`src/`+`checks/`) | partly — the second floor is at the same walk |
| `test/machinefences-dec49.test.mjs` | `minted.size >= 12` (`src/`) | yes |
| `test/planning-hygiene.test.mjs` | `found.length >= 2` (`docs/`) | yes |
| `test/check-firing.test.mjs` | `estate.length >= 50` (7 roots) | **no** |
| `scripts/op-claims.mjs` + `test/op-claims.test.mjs` | `files >= 300`, `chars >= 10,000,000`, `mentions >= 5000`, `names >= 150` | **no** |
| `test/machine-fences.test.mjs` | *no floor* — the walk feeds `pinned()`, a SATISFACTION | yes, as the sixth |

**`op-claims` is the one worth reading twice: the WALK and the FLOOR live in different
files.** `hygiene.test.mjs`'s class census grades a file by whether IT contains a
`readdirSync(`, so it named `scripts/op-claims.mjs` as merely *"reports a claim census"* and
never enumerated `test/op-claims.test.mjs` at all. Four floors sat behind a walk the census
had graded as harmless.

### The figures, contaminated and reproducible, both printed at every site

| site | contaminated | reproducible | floor moved? |
| --- | --- | --- | --- |
| bounds | 331 files / 12,355,924 chars | **331 / 12,355,924** | no |
| case-opened | 331 files / 12,372,578 chars | **331 / 12,372,578** | no |
| identity-claims | 27 files / 106 claim lines | **27 / 106** | no |
| machinefences-dec49 | 12 fence codes | **12** | no |
| planning-hygiene | 92 docs / 2 headings | **92 / 2** | no |
| check-firing | **129 estate files** | **127** | no (floor 50, slack) |
| op-claims | 456 files / 19,618,821 chars / 7,760 mentions / 204 names | **456 / 19,618,821 / 7,760 / 204** | no |
| machine-fences (pin roster) | 193 suites | **193** | n/a |

**NO FLOOR MOVED, and that is a measurement rather than nothing happening.** Six of the
seven reproducible figures equalled their contaminated one on a clean tree, so there was
nothing to move — which is what D-257 measured one estate over and is now measured twice.

**THE SEVENTH DID NOT.** `check-firing.test.mjs`'s estate walk counted **129** files of
which only **127** are in any commit: `agent-worker/.wrangler/cache/cf.json` and
`pdf-worker/.wrangler/cache/cf.json`, wrangler's local cache, present only because a deploy
ran on this machine. Not a stash phantom, and the same class — a printed corpus figure that
no other checkout reproduces. The floor of 50 has enough slack that it did not move; the
printed figure did.

### `hygiene.test.mjs`'s class census — the matcher, measured before and after

| | files matched |
| --- | --- |
| OLD (raw source, `readdirSync(` only) | 27 |
| NEW (comment-blind, five primitives) | 27 |

Same total, and **neither set is the other**: the widening ADDED
`bio-plane/test/query-reach.report.mjs` (an `fs/promises` `readdir`, invisible to every
previous run of this census) and the comment-blinding DROPPED
`bio-plane/test/op-claims.test.mjs`, which had matched only on a *sentence describing the
matcher*. Census GUARDED **3 → 11**; NAMED 18 → 16 (seven bio-plane entries removed as no
longer applying, two added with their reasons).

### `scripts/op-claims.mjs` and the dot-directory ruling

`corpus()` descended into dot-directories where its two sibling whole-repo walks
(`bounds`, `case-opened`) never would. **Measured cost of the new rule: ZERO tracked files.**
The corpus holds 459 files on a tree with scratch present; exactly one tracked
dot-DIRECTORY exists in this repository (`.claude/`, already skipped by name), and every
other tracked dot-path is a FILE whose extension is not in `TEXT_EXT`. Corpus 459 → 456,
the three lost being this item's own untracked scratch directory.

### The gates

| gate | result |
| --- | --- |
| `npm run test:battery` baseline | 139/139 green · **8,869** assertions · exit 0 |
| `npm run test:battery` final | 139/139 green · **8,880** assertions · exit 0 |
| per-suite attribution (re-run, never subtracted) | bounds +1, case-opened +1, check-firing +1, identity-claims +1, machine-fences +2, machinefences-dec49 +1, op-claims +2, planning-hygiene +2 = **+11**, and no other suite moved |

**ONE OF THE ELEVEN IS NOT THIS ITEM'S GUARD AND IS ATTRIBUTED RATHER THAN ABSORBED.**
`planning-hygiene` reads +2. An intermediate run measured it at +1; the second unit appeared
when this item added the **D-265** row to `DEBT.md`, because that suite asserts one arm per
open debt row. So: +1 from the provenance floor, +1 from a debt row this item wrote. Recorded
because a delta nobody can account for is how a real one gets lost inside a plausible total.
| `node scripts/coverage.mjs --strict` | exit **0**, read unpiped |
| `node civicos-ui/test/run.mjs` (from repo root) | 42 harnesses, **all green**, exit 0 — but see below |
| `node test/provenance-floor.control.mjs` | **58 of 58 as declared** |

**THE UI HARNESS CAUGHT THIS ITEM, WHICH IS WHY WORKER.md SAYS TO RUN IT ANYWAY.** The first
run was RED at 224/226: `civicos-ui/test/publishedcase.test.mjs` runs UI-40's consumer walk,
which blanks COMMENTS and deliberately KEEPS STRINGS, and this item had written the field
name `case` + `.` + `opened` as prose inside a STRING LITERAL in `test/case-opened.test.mjs`.
The walk counted the sentence as a consumer of the very field that suite exists to prove
nobody reads. **The walk was right and the prose was wrong**; it is reworded with the reason
at the site, never exempted.

## 2026-08-09 · PL-19 — DEC-65 shape (b): the single-part licence, measured at both sites

Instrument: `bio-plane/scripts/battery.mjs`, `bio-plane/scripts/coverage.mjs --strict`,
`bio-plane/test/dec65-single-part.control.mjs`, `civicos-ui/check-refusal-codes.mjs`, all run
in worktree `agent-a875e2afd837947d7` at `7844e16`.

### The battery

Baseline MEASURED IN THIS WORKTREE BEFORE ANY EDIT — the brief carried no figure, so there
was nothing to agree or disagree with: **140 suites (136 plane + 4 fleet) · 140/140 green ·
8,907 assertions · 135.9 s · exit 0.** The worktree arrived ONE MERGE BEHIND `main` (PL-17's)
and WITHOUT `bio-plane/node_modules`; both were fixed before anything was measured.

Final: **141/141 green · 8,953 assertions · 141.2 s · exit 0.** Delta **+46, attributed by
DIFFING the two full runs PER SUITE and never by subtraction** — 135 of 139 shared suites
byte-identical in count:

| suite | before | after | why |
| --- | --- | --- | --- |
| `dec65-single-part.test.mjs` | (new) | 37 | this item's suite |
| `hygiene.test.mjs` | 558 | 561 | its per-file walks gain rows for two new files |
| `sufficiency-state.test.mjs` | 35 | 39 | §7's three superseded pins CORRECTED, one replaced by three |
| `suggest.test.mjs` | 93 | 95 | CHECK 6's machine arm replaced by three, F10's count re-measured |

### The floors, and one of them was already stale on arrival

`REGISTER_FLOOR` **632 → 647 arms / 134 → 136 classified / 135 → 137 corpus**, all three in
the same turn, from the figure a green `--strict` run PRINTED AS REPRODUCIBLE, read only
after the new files were in a commit.

**ONLY 7 OF THE 15 ARMS ARE THIS ITEM'S.** `main` at `8096452` was checked out into a scratch
`git worktree` (never `git stash`) and `--strict` run there on a quiet tree with nothing
uncommitted: **`arms 640/632 · classified 135/134 · corpus 136/135 · GREW by 8`**, provenance
`146 of 146 discovered item(s) are in the commit at HEAD`, no contamination note. So the
merged tree read **8 arms / 1 classified / 1 corpus above its own floor before PL-19 touched
anything** — the sixth consecutive item to find a floor stale by measuring it. The cause is
this block's oldest hazard in a subtler form: the VF-1/PL-17 collapse-to-one-key kept a
figure true of one branch and never re-read it on the merge.

`regionLines` **1407 → 1436** in `civicos-ui/check-refusal-codes.mjs`, and here the
attribution is exact and the floor was NOT stale: `suggestVersion > is-suggest-checks` grew
314L → 343L, and 1436 − 29 = 1407, the figure already in the file.

### DEC-65's arithmetic argument, driven rather than restated

The ruling rests on *with exactly one part there is no maximum to take*. Measured on the
plane's own pair, through `op=suggest`, over the same single leg: a machine's single-part
reading and a member's single-part reading both derive **`capture graded/B · connection
unrated/null`** — identical. The state widens what the record can SAY and nothing about what
it may CLAIM.

### Three control arms that came back other than declared

- **(2) the licence widened** — declared 1 failure, got 5. Widening the endpoint guard also
  stops it refusing the zero-part and duplicate-label submissions, which then travel on to
  `promote` and are refused there **in another family's words about a document the endpoint
  had already composed**. The two sites are not redundant: the guard's job is to refuse the
  ACT in the words of the act, the check's is to hold the BOUND at the document.
- **(4) C-25.6's licence removed** — declared "the value is refused again"; it is not. With
  `noClaim` false the machine arm asks only *non-blank and not a machine*, which the value
  satisfies, so the patch returns C-25.6 to PL-17's inert state. **The check half's
  contribution is the BOUND, not the admission** — the endpoint's stamp would land a
  single-part reading either way.
- **(5) PL-17's recorded WRONG FIX no longer works as a fix.** Adding `none:` to
  `MACHINE_STAMP_PREFIXES` made `C-25.6` refuse the minted value while the check asked
  `isMachineIdentity` directly. PL-19 asks `isSufficiencyUnclaimed`, and
  `sufficiencyClaimState` tests the minted value BEFORE `isMachineIdentity` — so the value
  is still admitted and only the identity pin falls. **PL-17's comment claims that arm
  ordering is load-bearing; this is that claim measured against the exact patch it was
  written to survive.** The one-line change is now purely a defect and buys nothing.

### What the class sweep found, and what it could not see

Over `checks/bio-checks.mjs` (528,453 chars) and `src/store.mjs` (1,511,107 chars), matching
any statement that mentions an `asserted_by` within one statement of a judging predicate, on
FLATTENED source: **4 sites — 3 in the catalog, 1 in the store.** One consumes the third
state (C-25.6). **The declaration predicted ZERO in the store and was wrong**: the fourth
site is the STAMP in `#suggestionPersisted`, which decides what goes INTO an `asserted_by`.
**The matcher cannot see PL-3's endpoint guard at all** — that guard judges the SESSION and
the PART COUNT and names no `asserted_by`, so it shares no shape with these sites. It is
pinned structurally and DRIVEN through the op instead of being scored zero.
## 2026-08-09 · PL-18 · TWO SWEEPS OVER THE PLANE, AND THE SECOND WAS EARNED BY A REGRESSION

Instrument: two one-shot walks over `bio-plane/src/index.mjs` and `src/store.mjs`, run in
worktree `agent-a4e2eff5ca09197e2` on a quiet tree. **Both are reported here rather than
kept as suites, deliberately: neither answers a question that can go stale silently, and a
new suite buys a ratchet three other items would then have to maintain.**

### (1) WHICH ACTS CONSULT PROJECT PARTICIPATION AT ALL

**Corpus: 74 ops in `NEEDS` · 184 routes in the Durable Object's dispatch table · 11
consult participation · 56 do not · 7 UNCLASSIFIED AND NAMED** (`acquire`, `attest`,
`capture`, `linkproject`, `monitor`, `promote`, `ratify` — each handled in `index.mjs`
rather than through a named store method, so this walk cannot follow them and says so
instead of scoring them zero).

**The finding is the split, and it is sharper than the count.** Of the 11, EIGHT are the
project ROSTER's own acts — invite, join, leave, remove, the three owner acts, fork. In
other words, **before PL-18 participation was a fence over PARTICIPATION ITSELF and fenced
no WORK anywhere in the plane.** The three that now do are DEC-63's run verbs. Every other
corpus act — `cite`, `conclude`, `suggest`, the six version acts, `inquiryground`,
`biasadopt` — is gated on a capability alone.

**Reach, stated: the walk follows `this.#private(` calls TRANSITIVELY.** Its first shape
read one level and **scored PL-18's own three verbs as ungated**, because their gate is
reached through `#aiRunProjectGate`. A matcher that cannot see the fix it was written to
check would report every properly-factored gate as absent, so the reach was INVERTED rather
than taught the one name it was missing (REC-70's lesson). What it still cannot see:
whether an op's subject is project-scoped at all (semantic), and `viewerPredicate` gating,
which is a VISIBILITY fence and a different question from an authority one.

### (2) SERVER-SIDE QUERY STAMPS THAT CAN COLLIDE — the sweep a regression earned

PL-18 shipped an UNCONDITIONAL `inner.searchParams.delete("actor")` on the `ownerMemberId`
precedent and **broke `op=lease`**, which has stamped its own `actor` since REC-21's
neighbourhood. One assertion in `members.test.mjs` caught it. The precedent was safe and the
copy of it was not, for a reason worth keeping: **`ownerMemberId` is a name only `promote`
uses; `actor` is not.**

**Corpus: 11 distinct query keys stamped server-side in `index.mjs` across 17 sites. FIVE
keys are stamped from more than one site** — `actor`, `author`, `member`, `viewer`, `who`.
**All of the other four are conditional SETs and none is a DELETE**, so the failure they
could produce is an overwrite (loud, and caught by the op that loses its value) rather than
a wipe. **After PL-18's fix there is no unconditional stamp of any kind in the file.**

Cannot see: whether two sites naming one key are mutually exclusive by their conditions;
keys stamped through a variable; and body-field deletions (`delete b.author` and its
neighbours), which are the same class one layer over and were not walked.
## 2026-08-09 · PL-2 verification pass · one DEC-49 code, two conditions — the census

**Instrument:** `bio-plane/test/dec49-onecode-twoconditions.sweep.mjs`, deliberately not a
`.test.mjs` (it is a census, not a suite; the battery must not discover it). **TWO RUNS, AND BOTH
FIGURES ARE KEPT because the second is the one that is true.** First on `1081a6a` plus this item's
change (16 families · 166 codes · 17,369 stripped lines · 16 multi-site candidates · 41 siteless);
then RE-RUN after `origin/main` moved under the item and was merged, at `08cefb8` (16 families ·
**168 codes** · 17,462 stripped lines · **16 multi-site candidates** · **42 siteless**). The
JUDGEMENTS below were made on the first corpus and re-confirmed against the second: the candidate
count did not move, and the one extra siteless code arrived with main. It harvests every `*_CHECKS` family the catalog
exports — the RESERVED SUFFIX the DEC-49 guard already keys on, so the corpus cannot go stale by
somebody forgetting to add a seventeenth family to a list — and counts the LITERAL return sites of
each code in `src/store.mjs` and `src/index.mjs` over comment-stripped source.

**The corpus, printed rather than assumed:** 16 `*_CHECKS` families · **166 DEC-49 codes** (167
after this item's row) · 17,369 comment-stripped lines walked, out of 1,537,543 + 418,916 raw
bytes. These two sources are MORE COMMENT THAN CODE — they strip to roughly a third — so the
stripper is guarded **by content and not by a ratio**: a string that exists only inside a block
comment must be gone, and a real return site must survive, both asserted before any count is made.

**What it found: 16 multi-site candidates, of which exactly ONE is a defect.** A multi-site code is
a CANDIDATE and never a verdict — the instrument prints the guard expression and makes no
judgement, because "same condition at two altitudes" and "two different conditions" look identical
to a matcher. Judged by hand: `VERSION_ACT_UNWRITABLE` (4 real sites) is one condition — the file
could not be rewritten. `VERSION_ACT_NO_SUCH_VERSION` and `VERSION_CURRENT_UNRELATED` are
**DELIBERATE CLOSURES, not defects**: D-15's fail-closed posture is stated in a comment at each
site, and a question or a project the caller may not see must answer exactly as an absent one does.
`CAPTURE_CONDUCT_UA_ILLEGIBLE` (PL-4's family) is one condition at two altitudes — an unknown agent
MODE and an illegible composed agent STRING are both "this instance will not say who is asking in a
form anyone can read", which is what its translation says. The defect is
`VERSION_NO_REASON`: see below.

**Two figures for the correct construct, because the point is that it already exists.**
`store.mjs` carries **12** `NO_REASON` sites and **8** `BAD_REASON` sites — absent versus malformed,
split everywhere this plane asks for authored prose (`#moveAction`, `#divide`, `#ground` and their
siblings). PL-2's `#moveVersionState` was the one place that collapsed them, so this is not a
second spelling of an existing rule but a **missing spelling of an existing distinction**.

**What the instrument CANNOT see, and the sentence is load-bearing.** (a) A code returned through a
VARIABLE rather than a string literal — DEC-49's own floor already refuses that shape, so the guard
covers it and this walk does not. (b) Whether two sites are one condition or two: that is a
judgement, and 16 candidates went to a human. (c) Refusals composed outside a `*_CHECKS` family
(the older `reason:`/`detail:` shape) — they carry no canned translation to be wrong, so they are
outside the class BY SHAPE, and they are printed as the population the class is measured AGAINST.
(d) **41 codes have no literal site in `store.mjs` or `index.mjs` at all** — they are NAMED in the
output rather than silently scored zero; most are catalog rows raised through `checkBundle`
findings, which is a different composition path, and this walk says nothing about them. (e) Its
first draft matched only three spellings (`refuse(`, `reason:`, `code:`) and scored **94** codes as
siteless, including the whole of `SUGGEST_CHECKS` and `VERSION_STRENGTH_CHECKS`, which reach their
rows through locally-named helpers — the list-of-spellings failure this repository already names,
committed by the instrument and corrected by inverting to *any quoted occurrence*.
