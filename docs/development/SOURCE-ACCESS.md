# Source access: why oaklandca.gov refused us, measured

Rewritten 2026-07-30. **The previous version of this document was wrong in its
central claim**, and it is replaced rather than amended so that nobody reads the
old framing and acts on it. It recorded that `www.oaklandca.gov` refuses the
record, which read as a public body taking a position on archiving. The refusal
was ours. We were sending an illegible user-agent and a commercial bot manager
was declining it.

**The standing position survives and is now vindicated rather than asserted:
BIO does not disguise its requests.** Legibility was the fix. The agent that
works is the honest one.

## The measurement

2026-07-30, from Anthropic egress, `curl`, one URL
(`/Government/Finance-Budget/Financial-Reporting/Annual-Comprehensive-Financial-Reports`),
varying ONLY the user-agent. Eight consecutive requests per string; every string
returned the same status all eight times. Verdicts confirmed identical on a
second, unrelated path, so the result follows the agent and not the URL.

| User-agent | Result |
| --- | --- |
| `CivicOS/0.46.0 (+https://…; instance biosmoke7; acquire)` | **200** |
| `Mozilla/5.0 (compatible; Google-Apps-Script; beanserver; +https://script.google.com)` | 200 |
| `curl/8.x` | 200 |
| `Wget/1.21.4` | 200 |
| `python-requests/2.31.0` | 200 |
| `bio-acquire` (what the plane sent) | **403** |
| `bio-monitor` (what monitoring sent) | **403** |
| no user-agent header at all | 403 |
| `archive.org_bot` | 403 |
| `ia_archiver` | 403 |
| `Googlebot` | 403 |
| `Bingbot` | 403 |
| `GPTBot` | 403 |

**The discriminator is the user-agent. It is not the source address.** One
network produced both outcomes. Three sessions of reasoning about Cloudflare
Workers egress reputation were wrong, and the reasoning was wrong because every
client we had compared shared BOTH a reputable network and a legible agent, so
the two variables were perfectly confounded until one was varied alone.

## Corroborating evidence from before the measurement

Three independent clients reached the same host while the plane could not, and
all three were dismissed as network effects at the time:

- **Bob's browser**, 2026-07-30, residential address, 200.
- **The Apps Script data plane**, 2026-07-19, Google egress, retrieved five
  documents including deep PDF paths. Its agent is a self-declared bot with a
  version and a contact URL, structurally the same shape as ours now.
- **The Internet Archive**, per its own CDX index, 200s across the host
  throughout 2026.

The Apps Script row is the one that should have broken the network theory
earlier: `UrlFetchApp` is not a browser by any measure and it was admitted.

## What is in front of the site

The `server-timing: ak_p` response header identifies **Akamai**, so this is
Akamai Bot Manager. That accounts for the shape of the results: agents in its
categorised bot directory are denied by category, while unrecognised agents are
scored heuristically. It also accounts for what could NOT be derived: some
unknown tokens pass (`xyzzy-fetch`, `biofetch`) and others do not (`foobarbaz`,
`wombat`), which is Akamai's internal scoring. **No rule for that was
established and none should be invented.**

## Two findings about the City, recorded as facts and not as claims

**Oakland's CDN denies archival and search crawlers by name.** `archive.org_bot`,
`ia_archiver`, `Googlebot`, `Bingbot` and `GPTBot` are all refused. Whoever
configured this denied whole bot categories. IA's own index shows the
consequence: a twice-daily scheduled crawl of the root running on a clock through
2026-02-04, then collapsing to scattered singletons, with the first archived 403
on 2026-02-14.

**`robots.txt` disallows the City's own transparency publications.** Retrieved
for the first time on 2026-07-30, 85 lines, a single `User-agent: *` stanza, 82
`Disallow` rules. **63 of the 82 are Public Ethics Commission publications**,
including sixteen years of annual reports and
`/Government/Boards-Commissions/Public-Ethics-Commission/Publications/Open-by-Default-A-Best-Practices-Analysis-for-Meaningful-Transparency-in-the-City-of-Oakland`.

Whether that is deliberate or a CMS artifact is UNKNOWN and should not be
assumed. It is recorded because it is true and dated, not because it is
explained.

**None of the material this project needs was ever excluded by robots.txt.** The
finance and budget paths and `/files/assets/` carry no `Disallow`. The 403 was
never a statement about crawling.

## What is reachable now

All six previously-frozen documents, verified 2026-07-30 with the honest agent:

| Path | Status | Bytes |
| --- | --- | --- |
| `/Government/Finance-Budget/Financial-Reporting/Annual-Comprehensive-Financial-Reports` | 200 | 213,375 |
| `/Government/Finance-Budget/Budget/Fiscal-Year-2025-2027-Budget` | 200 | 207,476 |
| `/Government/Finance-Budget/Financial-Reporting/Revenue-Expenditure-Reports` | 200 | 208,172 |
| `/files/…/2024-city-of-oakland-acfr_final-121324.pdf` | 200 | 5,995,747 |
| `/files/…/fy25-27-adopted-budget-book-full-10.10.25-reduced-size.pdf` | 200 | 32,521,404 |
| `/robots.txt` | 200 | 11,687 |

The budget book at 32.5 MB will capture multipart and skip subresource parsing,
which is correct behaviour and should not be read as a failure.

**The archive fallback is not needed for these documents.** It remains worth
building for historical depth, which nothing else supplies.

## The fix, and why it is not durable

`bio-plane/src/userAgent()` now produces one legible string for every outbound
fetch, replacing two bare tokens that were spread across three call sites and did
not agree with each other:

```
CivicOS/<version> (+<contact URL>; instance <name>; <purpose>)
```

Product and version, a contact URL, the instance name so a third party can
throttle one operator instead of a provider, and the purpose so a source can
tell a capture from a monitoring re-check. It does not impersonate a browser and
the suite asserts that it never starts to.

**We currently pass because Akamai does not recognise CivicOS.** If the project
succeeds and the string enters the bot directory it will be categorised, and the
same denial that catches `archive.org_bot` will catch us. Passing by being
unknown is not a position. The durable answer is an allowlist entry, which
requires asking. See D-94.

## Open

- Whether to tell the City. We now have something specific and checkable to say.
  A request to allowlist a named civic agent is one a public body has little
  reason to refuse, and a refusal would itself be a finding.
- What the contact URL resolves to. It currently names a path that does not
  exist on a domain whose registrar transfer is pending, and a user-agent
  advertising a contact address that 404s is worse than one with none.
- What a sovereign instance run by another group puts there, since it should
  name that group and not Believe in Oakland.
