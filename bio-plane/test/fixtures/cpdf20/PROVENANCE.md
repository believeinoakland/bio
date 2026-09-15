# CPDF-20 / D-283 — the fixture of partially-decodable PDFs

D-283 says, and it was right when written: *"measuring it needs pdf.js against a corpus of
partially-decodable PDFs, **which no fixture in this repository has**."* This directory is
that fixture. It was drawn 2026-09-14 from the same census sample CPDF-12's corpus probe
draws from — the attachments of the most recently modified Oakland Legistar matters — by
running Tier 1 over 50 readable documents and keeping the class D-283 names: **a document
some of whose pages Tier 1 read and some of whose pages it flagged.** 28 of the 50 were in
that class; four are committed here, each for a stated arm.

## Where each one came from, and what it is for

Every document is a **public council attachment** published by the City of Oakland through
Legistar. Nothing here is a secret, a credential, or a private record.

| file | sha256 | Legistar | pages | serves |
| --- | --- | --- | --- | --- |
| `legistar-73450.pdf` | `d1493f5305887a1d5ae9b629adc27b7ce01c7fe9a945008ae86f57bb6be85ef6` | matter 37501, attachment 73450 ("View Report") | 3 | **the over-strictness arm** — fully decodable, zero undetermined markers. Tier 1 must be kept on every page and the chain must come out byte-identical to a pristine run. |
| `legistar-73545.pdf` | `f2882ecee13500255688db02355f4af3e9dce61b28fee8b5438a0f5a95199812` | matter 37530, attachment 73545 ("View Attachment B") | 7 | **the genuinely MIXED document, and the reason the rule exists** — pages 0–5 go to Tier 2, page 6 stays with Tier 1. One document, two tiers, and the chain has to say so per page. |
| `legistar-73550.pdf` | `79cf1e93eae23e10cf91cd9fda0d4ee11c5731e7b04704784394837fdfe45fb0` | matter 37545, attachment 73550 ("View Legislation") | 3 | **the clean recovery arm** — `no_tounicode` throughout; Tier 2 wins all three pages and the rule must let it. |
| `legistar-73618.pdf` | `2ef726ffb0532deb58f98f8be64633ff437d751a86eb218e4d59cbdd189f0acd` | matter 37554, attachment 73618 ("View Legislation") | 2 | **the DEGRADATION control, and the page that falsified the design** — page 1: Tier 1 decodes 709 characters with **one** unmapped code; Tier 2 decodes 580. §5.2's rule as written hands this page to Tier 2 and loses 129 characters of real text. The shipped rule keeps it. |

## The exact source URL of each file, so a reader can fetch the same bytes

| file | source |
| --- | --- |
| `legistar-73450.pdf` | `https://oakland.legistar1.com/oakland/attachments/01b7a2b6-04d4-479f-bf18-6f25d63bfd7d.pdf` |
| `legistar-73545.pdf` | `https://oakland.legistar1.com/oakland/attachments/586a9dc4-ab52-4a07-874c-5211ce1d43c7.pdf` |
| `legistar-73550.pdf` | `https://oakland.legistar1.com/oakland/attachments/f55d8bc4-bd6b-4b6e-9a0b-6ca36cc13972.pdf` |
| `legistar-73618.pdf` | `https://oakland.legistar1.com/oakland/attachments/b06792eb-2662-4900-8c2a-9d8f7a228d7a.pdf` |

**These four matter ids and page counts were RE-READ from the prospecting run's own JSON
rather than written from memory — and two of the four were wrong on the first pass** (73545
was recorded as matter 37548 and 73550 as 37549). A fixture's provenance is the whole reason
it is admissible, so it is taken from the instrument, never recalled.

Source URLs follow the shape `https://oakland.legistar1.com/oakland/attachments/<guid>.pdf`, reachable
from the Legistar Web API (`webapi.legistar.com/v1/oakland/matters/<id>/attachments`).
`tier-pagewise.probe.mjs --census` rebuilds the wide sample from that API; this directory
is the committed slice so the suite needs no network.

## One document was deliberately NOT taken, and that is part of the fixture's design

By its numbers the most attractive mixed document in the sample was attachment 73615 — six
pages carrying **both** `no_text_layer` and `no_tounicode` markers, the only document in the
sample to mix a scanned page with an unmappable-font page. It is titled "View Resume" and it
is **a private individual's resume**, attached to a council appointment matter.

It is a public record and it was not taken. A test fixture is committed forever, copied into
every checkout, and read by people who are not looking for a person — and the arm it would
have served is served by `legistar-73545` instead, at no cost to the measurement. The rule
this fixture exists to prove is about text loss, not about whose text it is.

## `tier2-recorded.json`

Tier 2's decode of these four documents, per page, recorded by
`node bio-plane/test/tier-pagewise.probe.mjs --record`. It exists so
`tier-pagewise.test.mjs` is **hermetic**: the suite runs Tier 1 for real (it is pure JS and
in-plane) and reads Tier 2's side from here, because `unpdf` is the **fleet member's**
dependency and the plane neither has it nor may grow it (CPDF-6 — putting `unpdf` in the
plane's module graph broke 21 miniflare suites, which is why Tier 2 is a separate Worker).

It is a RECORDING, not an assumption, and drift from it is detectable rather than silent:
`--verify` re-derives Tier 2 live and diffs page character counts against this file. Run it
when `unpdf` is upgraded — a decoder that changes its output is exactly the thing this file
would otherwise hide.
