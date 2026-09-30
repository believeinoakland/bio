# jurisdictions — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §6 (K597 (3), K600 (b)), against `build/requirements/jurisdictions.md` on `tranche/T17` (highest id R38). Id final: **R39** (the draft's, free). The Status line gains: "Action layer folded 2026-09-30 (K608): R28, R29, R36 widened; R39 added, not yet met."

**A new `uses` edge (P4).** R39's `grade` is "a letter of `provenance`'s `BASIS_GRADES`", which lives in `legacy-checks` (`bio-checks.mjs`:2500) until T18's `record-grammar` takes the grade vocabulary (K585 (4); `draft-T18.md` §2, "T18's stage"). `jurisdictions` uses nothing today ("Uses: None") and is bundled into the installer (`newgroup`). So: `jurisdictions` gains `uses: ["record-grammar"]` if T18 forms `record-grammar` (first in the order, a leaf of ~640 lines, harmless to the installer bundle); otherwise this R39 waits for it rather than import the 10,659-line catalogue into the installer. Both modules are layer 1 and `record-grammar` is first in the order, so P4 holds. BOB's (placement).

## Replacements

**R28** — the current line ends

> `DUPLICATE_KIND` (one kind twice). `LEVEL_UNKNOWN` also covers a `records_laws` or `standard_sources` level outside R31, and a `standard_sources` entry with no level.

and becomes

> `DUPLICATE_KIND` (one kind twice); `GRADE_UNKNOWN` (an `evidence` grade outside `BASIS_GRADES`, R39) and `EVIDENCE_NO_STANDARD` (an `evidence` with no `standard`, or an empty `accepts`). `LEVEL_UNKNOWN` also covers a `records_laws` or `standard_sources` level outside R31, and a `standard_sources` entry with no level.

**R29** — in the current line, the sentence

> A kind's `advisory`, and an office's `oversight` under one `role` and `body`, are one value per key (R15).

becomes

> A kind's `advisory` and `evidence` (R39), and an office's `oversight` under one `role` and `body`, are one value per key (R15).

**R36** — the current line's first sentence

> The test profile supplies R31's levels on its laws and standard sources, `oversight` on at least one office, `advisory` on a Tier 2 kind, `legal_organisations` and `holidays` (R22).

becomes

> The test profile supplies R31's levels on its laws and standard sources, `oversight` on at least one office, `advisory` on a Tier 2 kind, `evidence` with a `contestable` grade on at least one kind (R39), `legal_organisations` and `holidays` (R22).

## Addition (after R38, in the action sections)

- **R39** An `action_kinds` entry (R25) may carry `evidence: {standard, accepts, contestable?, basis}`: `standard` in words (at most 200 characters, naming the rule or practice, for example a rule of evidence by its number); `accepts` a non-empty list of `{grade, coattested?}` the venue admits, `grade` a letter of `BASIS_GRADES` and `coattested: true` requiring the capture's co-attestation (its trusted timestamp and co-archive); `contestable` a list in the same form of what the venue admits but the opposition may contest; `basis` as every fact's (R30). Refusals join R28. Combined as one value per kind (R29). Absent, the venue's standard reads undetermined (R27) and `filings` R25 shows the grades alone. *(not yet met: new, K597 (3))*

## Uses (replace)

> None.

becomes

> - `record-grammar`: `BASIS_GRADES` (R39). *(K585 (4); until `record-grammar` is formed, R39 is not built)*

## Data (no requirement change; the first profile's facts, R36's "as far as a measurement or the canon names them")

Confirmed 2026-09-30 in `jurisdictions/profiles/oakland-alameda.mjs`: no `action_kinds` entry carries a `template` (so `filings` R1 refuses every draft `KIND_NO_TEMPLATE` against the real profile; the test profile has two, `test-port-ellery.mjs`:139, :143); `holidays` is absent (:244, stated in a comment); all five `counterparties` and the one `deadlines` entry carry `basis: "UNMEASURED"`. Templates for the Tier 1–2 kinds are text a group files in its own name: no canon names their wording, so each needs a source (a measurement of the venue's own form, or Bob's text) before a job writes it. The holiday calendar needs a measurement (the offices' published closure days). The evidence standard of any real venue likewise (`GRADE-A-CAPTURE.md` names Federal Rule of Evidence 902(13)–(14) for federal courts, not a venue of this profile).
