# Source access: why oaklandca.gov refused us, measured

**Status** · A measurement record and the rulings that followed it, rewritten 2026-07-30 to replace a version whose central claim was wrong, amended 2026-08-07 (DEC-47's access-parity amendment) and closed on its allowlist arm 2026-07-31. The measurements are the reason the document exists and they stand. [BUILT] at plane 0.58.0: the one legible user-agent, now composed in `checks/bio-checks.mjs` as `civicosUserAgent` with `index.mjs:122` delegating to it (PL-4), the resolving contact URL that D-94's nine-rung ladder proved load-bearing, the per-host governor, and — since PL-4/BOB-3 — the member-browser UA delegation this document's body still frames as held in reserve: permitted for publicly available documents, read only from a `capture_requests` row the drain has already judged and never from a request body (`index.mjs:122-129`, `schema.mjs:2245`). [ABSENT]: egress diversity, which is the point of D-120 — a member-driven capture path now exists and its fetches still leave from Cloudflare's shared egress. The 2026-07-31 allowlist ruling is settled and the ask is CLOSED, not held. as of 2026-09-14.

**Place in the system** · A level-2 design serving construct 2, **intake, capture and provenance**, whose level-1 home is `BIO_Intake_Doctrine_v1_1.md` (`BIO_System_Design.md` §3 names it there). It owns one question for the whole system — on what terms a source admits this instance — and it is where the measurements behind D-94, D-100 and D-120 live; `MEASUREMENTS.md` holds the full ladder. Its 2026-07-31 ruling is what promotes `ARCHIVE-FALLBACK.md` to the primary resilience mechanism and what puts member-driven egress beside it, and the doctrine it defends — BIO does not disguise its requests — is `CLAUDE.md`'s stance applied to the wire.

**Incomplete sections** ·
- §What is reachable now — a 2026-07-30 table, never re-measured. Admission still rests on `CivicOS` not being recognised by Akamai's bot directory, which this document says plainly is not a position; the table is therefore a fact about that day and not a statement about today.
- §The fix, and why it is not durable — the site it names is stale: the string is no longer composed in `bio-plane/src/userAgent()` but in `checks/bio-checks.mjs`, so the Durable Object's capture-request drain can check the agent it is about to cause to be sent rather than a second copy of it (PL-4) — which is this section's own "two bare tokens that did not agree" defect closed one layer down.
- §Open — stale as a list of open items: two of its three were answered in the update written the same day, and the third, telling the City, was CLOSED by the ruling at the foot of this document.
- §the allowlist is NOT a viable mechanism — its "What this promotes" list was stale in both limbs and **item 1 was CORRECTED IN PLACE on 2026-09-14 (M0-27)**: the archive fallback said *"and IDLE. Nothing invokes it (QUEUE `CAP-3`)"*, and CAP-3 has since landed the monitoring consumer that invokes it. **Item 2 keeps this section on the list**: egress diversity is still [ABSENT] (D-120), though the member-driven capture path and its UA delegation now exist — so what is missing is the EGRESS, not the path, and item 2's bare "Not built" does not say which.

**Contents**
- [The measurement](#the-measurement)
- [Corroborating evidence from before the measurement](#corroborating-evidence-from-before-the-measurement)
- [What is in front of the site](#what-is-in-front-of-the-site)
- [Two findings about the City, recorded as facts and not as claims](#two-findings-about-the-city-recorded-as-facts-and-not-as-claims)
- [What is reachable now](#what-is-reachable-now)
- [The fix, and why it is not durable](#the-fix-and-why-it-is-not-durable)
- [Open](#open)
- [Update, 2026-07-30, same day: the component that matters, measured](#update-2026-07-30-same-day-the-component-that-matters-measured)
- [RULED, 2026-07-31: the allowlist is NOT a viable mechanism, and the reason is structural rather than tactical](#ruled-2026-07-31-the-allowlist-is-not-a-viable-mechanism-and-the-reason-is-structural-rather-than-tactical)

---

Rewritten 2026-07-30. **The previous version of this document was wrong in its
central claim**, and it is replaced rather than amended so that nobody reads the
old framing and acts on it. It recorded that `www.oaklandca.gov` refuses the
record, which read as a public body taking a position on archiving. The refusal
was ours. We were sending an illegible user-agent and a commercial bot manager
was declining it.

**The standing position survives and is now vindicated rather than asserted:
BIO does not disguise its requests.** Legibility was the fix. The agent that
works is the honest one.

**Refinement, RULED 2026-07-30 (Bob): delegating the operator's OWN browser
user-agent to their OWN instance is a legitimate act, not disguise.** The
distinction is authorship. A fabricated Mozilla string invents a client that
does not exist; an operator configuring their instance to present the
user-agent of the browser they personally use is speaking as themselves through
a tool they run, which is what a person hitting "save to my archive" already
does. This is HELD IN RESERVE, not adopted: it is used only if and when
measurement shows the honest CivicOS agent no longer gains admission, because
the honest agent works today and reserve options stay in reserve. The position
is also explicitly REVISABLE on outside counsel: Bob is consulting journalists
and lawyers, and their read on how a court or a newsroom would characterise
UA delegation governs whether this stays available. Until then: the honest
CivicOS string is what ships and what runs; browser-UA delegation is a
documented fallback with a named trigger (admission stops) and a named veto
(counsel), not a default.

**AMENDED 2026-08-07 (Bob; DECISIONS.md DEC-47 (access-parity amendment), IS-SWEEP-2026-08-07.md §4c) — the
paragraph above is retained as the historical record but is superseded IN PART.**
For PUBLICLY AVAILABLE documents fetched as part of the workflow, the member-browser
UA (the UA the member's browser was using when the inquiry was created) is now
PERMITTED by ruling — the reserve's trigger-and-counsel-veto framing no longer
governs that path. Bob: publicly available documents may be accessed without regard
for whether they are captured directly by users or indirectly (mechanically) as part
of this workflow, including with the member's own browser UA. Everything else
stands: the CivicOS-UA identification rule remains the default for all other
traffic, and D-94's measured finding — that admission turns on the contact URL —
stands for the CivicOS UA path.

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
- **The retired data plane**, 2026-07-19, its host's egress, retrieved five
  documents including deep PDF paths. Its agent is a self-declared bot with a
  version and a contact URL, structurally the same shape as ours now.
- **The Internet Archive**, per its own CDX index, 200s across the host
  throughout 2026.

That row is the one that should have broken the network theory
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

## Update, 2026-07-30, same day: the component that matters, measured

The note above that Akamai's unknown-token scoring follows no rule we
established stands, and is now refined by D-94's mechanical probe
(`scripts/ua-probe.mjs`, built and validated this session): within OUR
component space the rule is measurable. A nine-rung ladder removing one
component per rung, second-path confirmed: purpose and instance are droppable,
and **removing the contact URL flips admission 200 to 403 uniformly**, all the
way down to the bare token. `curl/8.x` still passes with no contact at all, so
the crawler-shaped `(+url)` heuristic applies to strings scored as bots, not to
strings recognised as tools. Full table in `MEASUREMENTS.md`.

Two of the three open items above moved the same day. **The contact URL now
resolves**: the agent advertises `https://github.com/believeinoakland/bio` in
place of the pending-domain path, measured before shipping (8/8 and 4/4 on two
paths) and shipped in 0.46.0; given the ladder, that fix was load-bearing
rather than cosmetic, and the sovereign-instance question (what another group's
agent should advertise) inherits the same answer shape: a URL that resolves and
names THAT group. **The plane can now reach the City from its own egress**:
eleven captures through the deployed 0.46.0, ten admitted, one 403 on a cold
back-to-back pair, which is burst-shaped rather than categorical; the per-host
governor shipped in 0.47.0 in response. What remains open is the first item,
telling the City, and it now carries a measured, specific ask.

## RULED, 2026-07-31: the allowlist is NOT a viable mechanism, and the reason is structural rather than tactical

Bob, answering DEC-1: **"We expect Oakland to view us as hostile to the
administration's interests. Besides, every CivicOS instance, and there could be a
number of them running at some point, would each have to request inclusion on that
allowlist."**

Two things settle here, and the second is the one that closes the question rather
than postponing it.

**CORRECTED 2026-08-01. This paragraph originally read "the adversary posture is now a standing
expectation", which drifted from what Bob actually said and inverted its direction.** He said we expect
to be VIEWED as hostile. That is a statement about how we may be PERCEIVED and a fact to plan around;
it is not a posture we hold. BIO's doctrine contains nothing resembling "stick it to the man" — the
objective is BETTER GOVERNMENT, and the working assumption is that at the highest level all
stakeholders want better outcomes in the public interest, bad actors being the exception identified by
evidence rather than the default assumed by role. Access caution survives that assumption intact,
because being misread is an operational fact whatever anyone's intentions are.

**Being seen as hostile is a standing expectation, not an inference.** Earlier
sessions recorded that the City is "non-supportive". The position is stronger: we
expect to be seen as hostile to the administration's interests. That is not a
prediction about any individual and it is not a grievance — it is the assumption the
access strategy must survive. A system whose subject is holding an institution to
account should not plan on that institution's goodwill.

**The allowlist does not compose with the sovereignty model, and the asymmetry is
what kills it.** BIO's distribution model is that any group runs its own instance in
its own Cloudflare account. So the arithmetic runs one way:

| | cost to them | cost to us |
| --- | --- | --- |
| block the `CivicOS/` product token | ONE action, once | every instance, everywhere, at once |
| allowlist our instances | one review per instance, forever | one request per instance, forever |

Blocking is O(1) for them and total for us. Allowlisting is O(n) for both, forever,
and n grows exactly as the project succeeds. **A mitigation that gets more expensive
the better the project does is not a mitigation.** The allowlist would also have to
be re-won at every administration, every vendor change, and every WAF reconfiguration.

And the request itself is a disclosure. The 2026-07-30 ladder measured that admission
turns on the contact URL component; an allowlist request hands a party we expect to be
hostile the exact string to filter, in writing, with a named point of contact. We
would be paying an O(n) cost to reduce our own defensibility.

**So the ask is CLOSED, not held.** D-94's allowlist arm is answered and no session
should re-raise it. What D-94 records remains true and unmitigated on that axis: we
are admitted because Akamai does not recognise `CivicOS`, and that will change.

**What this promotes.** Only two mitigations scale, and both are already named:

1. **The archive fallback** — built, live-verified, and **INVOKED**. It is the only
   path that survives the City refusing us outright, and this ruling makes it the
   primary resilience mechanism rather than a backstop.
   **CORRECTED 2026-09-14 (M0-27): this said "and IDLE. Nothing invokes it (QUEUE
   `CAP-3`)", and CAP-3 has since landed** — the `archive-monitor` consumer on the
   single reconciling Durable Object alarm fires the fallback for documents that have
   become `fallback_eligible` (`SCHEDULER.md`'s registry; `ARCHIVE-FALLBACK.md`). It is
   **[BUILT] and wired**, and INERT rather than idle on an instance not configured with
   `env.SELF` and a daemon token — which is a configuration state, not a missing
   mechanism.
2. **Egress diversity via the member-driven capture path** — many member addresses
   rather than one Cloudflare egress. Not built.

**What does NOT change: BIO does not disguise its requests.** That position stands and
is not weakened by expecting hostility. A system whose product is the trustworthiness
of a record does not lie about who is asking, and browser-UA delegation remains HELD
IN RESERVE with a named trigger, not adopted pre-emptively *(AMENDED 2026-08-07: for
publicly available documents fetched as part of the workflow, the member-browser UA is
now PERMITTED by ruling — see the amendment note above; DEC-52, IS-SWEEP §4c)*. Being
blocked honestly is
a fact we can record; being admitted dishonestly is a claim we could not defend.

One consequence worth stating so it is not discovered later: the instance-name
component of the user-agent was justified as letting a third party throttle ONE
operator rather than a provider. Under a hostile expectation that same component lets
them block one group precisely. It stays, because the dominant risk is the product
token — blocking `CivicOS/` catches every instance regardless of instance names, so
removing the instance name would buy nothing while costing the accountability the
component exists for.
