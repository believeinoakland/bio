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
