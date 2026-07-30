# Source access: when a public body refuses the record

Written 2026-07-29. The evidence is measured and current; the practice and legal
sections are research compiled for Bob to take to journalists and lawyers, not
advice. Nothing here is settled and no user-agent change has been made.

**Standing position while this is open: BIO does not disguise its requests.** A
system whose entire subject is provenance does not lie about who is asking. That
is not a policy waiting on counsel; it is the reason the project exists.

## What was measured

Every result below is from the deployed plane on 2026-07-29, not from a browser
and not from a developer machine.

```
https://www.oaklandca.gov/                                    403
https://www.oaklandca.gov/robots.txt                          403
https://www.oaklandca.gov/sitemap.xml                         403
https://www.oaklandca.gov/Government/Finance-Budget/...       403
https://www.oaklandca.gov/files/assets/.../acfr-fy-2023-24.pdf 403

https://data.oaklandca.gov/api/views/vmzx-e5fe/rows.csv       200   5,519,343 bytes
https://oaklandca.opengov.com/                                200      79,971 bytes
https://oakland.legistar.com/Calendar.aspx                    200     368,904 bytes
https://oaklandside.org/                                      200     596,282 bytes
https://www.acgov.org/                                        200      67,568 bytes
```

Four things follow, and each matters separately.

**It is not path-specific.** A static PDF asset and an HTML page refuse
identically, so this is not a rule about document types or directories.

**It is not "Oakland".** `data.oaklandca.gov` (Socrata) and
`oaklandca.opengov.com` (OpenGov) answer normally. Those are third-party
platforms on different infrastructure. It is specifically the city's own web
host.

**It changed.** The record holds ten bundles sourced from `www.oaklandca.gov`,
retrieved around 2026-07-1x. Re-running those exact locators today returns 403.
Something moved between mid-July and now.

**No crawl policy is being violated, because none can be read.** `robots.txt`
itself returns 403. The city is not publishing a rule BIO is failing to honour;
it is refusing at the edge before any rule could be consulted. That distinction
is worth putting in front of a lawyer, because "we declined to follow a published
policy" and "we were refused before a policy could be consulted" are different
postures with different answers.

The shape of it (a blanket edge refusal including `robots.txt`, on a site whose
sibling platforms are unaffected) is consistent with a managed WAF product
running default rules rather than a deliberate anti-archival decision by anyone
at the city. If that is right, somebody can simply add an exception, and the
first move is a named human rather than a technical one.

## The thing this demonstrates

The record currently holds captures of city pages that **can no longer be
re-fetched by anyone**. That is the circumstance the project exists for,
demonstrated by accident rather than by argument, and it is the strongest single
piece of evidence for why an accountability record needs to hold bytes rather
than links.

It also sharpens a ruling already made. Re-fetch at ratification is mandatory,
meaning the attempt and its outcome are recorded rather than that ratification
requires a matching answer. A mandatory-agreement rule would refuse to ratify
exactly these captures, at the moment their value is highest.

## Practice: what archival crawlers do

Identifying yourself is the norm rather than a concession. Bots conventionally
carry a contact URL or address in the user-agent so an operator can reach the
people running them, and the UK Web Archive's crawler identifies plainly as
`bl.uk_lddc_bot`.

Archive-It, the institutional web-archiving service, ships a custom user-agent
feature for this exact failure. Their documentation notes that sites will
sometimes return an error to a crawler where a browser would be served normally,
and that archivists set a custom agent per account or per collection to resolve
it. So a named, contactable agent is the standard archival move, and it is also
the one that gives a sympathetic administrator something concrete to allowlist.

## Legal ground, and where it stops

Compiled for counsel. Not advice, and deliberately including the parts that cut
against the project.

The Ninth Circuit in **hiQ Labs v. LinkedIn**, decided after the Supreme Court's
**Van Buren** ruling, held that accessing a public website cannot be "without
authorization" under the Computer Fraud and Abuse Act. The Reporters Committee
for Freedom of the Press described the decision as carrying major implications
for data journalists, who scrape routinely to build datasets. Fenwick read it as
a win for archivists, academics, researchers and journalists collecting publicly
accessible information not behind a login, while explicitly not a green light on
all data harvesting.

Three cautions a lawyer will care about more than the headline.

**hiQ settled in 2022**, so there is no Supreme Court ruling squarely on
scraping, and the Ninth Circuit's holding is not universal.

**The CFAA is not the only theory.** Breach of contract, trespass to chattels,
and copyright are separate, and companies do sue over publicly available data;
defence costs alone can exceed six figures regardless of outcome.

**Technical circumvention is the line nobody has disclaimed.** EFF's long-running
position is that CFAA liability should require circumventing an effective
technical barrier. A WAF returning 403 is arguably such a barrier. Defeating it
by disguising the client walks toward the one theory the case law has left open,
and it contradicts what BIO is for. This is the strongest reason the standing
position at the top of this document is what it is.

## Questions the research does not answer, for Bob's counsel

**Does a public agency blocking anonymous archival collection of public records
raise a state public-records question distinct from the CFAA?** A city refusing
programmatic access to documents it is obligated to publish is a different animal
from a company protecting a commercial asset, and California's public records
framework may matter here far more than federal computer-crime law. None of the
research above touches this, and it looks like the most promising angle.

**Is there a named contact at the city, or at its vendor, who can allowlist an
identified agent?** The `robots.txt` 403 suggests default WAF rules rather than
policy, which usually means somebody can add an exception. This is a phone call
before it is a legal question.

**What do reporters who hit this actually do?** That is knowledge Bob's
journalists have and the published literature mostly does not.

## The options, if identifying does not resolve it

- **A named agent with a contact URL**, e.g. `bio-acquire
  (+https://believeinoakland.org/crawler)`. The archival norm, and the only
  option that makes an allowlist request possible.
- **A member-driven capture path.** The member's own browser reaches the site
  normally. A browser-side capture that serialises what was served and uploads
  it needs no change to the plane's posture at all, and the grade honestly
  reflects that the capture chain ran through a person's machine. This is the
  SAME mechanism client-rendered sources need (see CLIENT-RENDERED.md), so it is
  one path solving two problems and is probably the right investment regardless
  of how the user-agent question resolves.
- **Accept the gap and record it.** The city's own host is uncapturable; its data
  platforms are not. The record says so. Thinner, and truthful.

## Related

- `CLIENT-RENDERED.md`: the member-driven path, and why it is the same mechanism.
- `CAPTURE-SCALING.md`: what capture costs and where the platform stops it.
- `MEASUREMENTS.md`: the numbers behind every figure quoted here.
- `UI-PLAN.md`: standing dependencies, including this one.
