### from jurisdictions.txt
- [DESIGN] jurisdictions R7, l.30 — `search_terms`: "the terms a search uses when its caller names none" (first profile: `readingNamePlan`'s default terms, R21)
- [DESIGN] jurisdictions R16, l.68 — no active profile is valid — "every consumer answers undetermined wherever it needs a local fact"
### from id-spaces.txt
- [DESIGN] id-spaces R8, l.29 — "`OUTSIDE_REACH` is never reported as "not found"."; R12 l.36 — "The answer is never "no such parcel"." (how an answer states absence)
- [DESIGN] id-spaces R21, l.51 — a `SHARED` verdict on an `agrees` reading states it rests on the caller's reading — "which this module did not make and cannot check"
### from docprofile.txt
- [DESIGN] docprofile R11, l.60–62 — `assess` carries `stopped_at` and `trail` — "so how far the reasoning got is always visible"
- [DESIGN] docprofile R20, R34, l.101–103, l.207 — a reference's position only where `locate` says — "never at a position it composed itself" (basis for citing a place in a document)
### from office-readers.txt
- [DESIGN] office-readers R8, R15–R19, l.81–87, l.215–229 — IC-1 element references (`¶n`, `table n, A1`, `Sheet!A1`, `slide n`) produced only by this module; they are what a citation can point to inside an office file
- [DESIGN] office-readers R7, R22, l.79–80, l.264–267 — an unreadable `.rels` "states that links MAY be missing; it is never read as zero links"
### from odf-reader.txt
- [DESIGN] odf-reader R43, l.253–255 — "the C-45.x checks that validate a citation against them are owned by `content`" (citations inside ODF files validated in layer 4)
### from extraction.txt
- [DESIGN] extraction R41–R43, l.100–102 — the EXTRACT AI role: `EXTRACT_RUN_MODE` "extract", one function `propose-reading`; `proposedReadingGrade` "computed, never taken: a kind and key earn B, a label alone C"; refusals `GRADE_OFFERED`, `PROPOSAL_ABOVE_CEILING`; `proposalChain` appends `ai(fn, version)` to the text chain (AI proposals labelled in provenance)
- [DESIGN] extraction R32, l.68 — an `ai` credential cannot trigger an OCR re-read: `REEXTRACT_AGENT_REFUSED` (C-51.2, 403)
- [DESIGN] extraction R36, l.74 — the index state `whole`/`partial`/`none`/null — "The four are never read alike." (search can say whether a capture was fully indexed)
- [DESIGN] extraction R62, l.84 — a failed index notice fails the write "because an index with no index observation would read NOBODY LOOKED"
- [DESIGN] extraction R61, l.83 (N294, K337) — a member's authored observation is indexed as its capture's text, with no reading (searchable testimony)
- [DESIGN] extraction Satisfies, l.149 — `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3
### from content.txt
- [DESIGN] content R16, l.41 — every row read carries its mint label `member_marked` / `plane_minted` / `machine_marked` / `unstated` — "A machine-marked row is machine work, never attested by a machine, and part of a finding only when a member cites it."
- [DESIGN] content R19, l.46 — a row read states its axes: transcription (R21), capture grade "stated as the document's", connection axis `NO_SUBJECT_IN_THIS_READ`
- [DESIGN] content R8, l.27 (CPDF-22) — an extent admitted without its bound answers "exactly one field, `undetermined: {level, why}`"
- [DESIGN] content R29, l.66 — the notice "states the chains are the ones this viewer sees"
- [DESIGN] content Suggestions, l.155 — `extractPropose` (AI) is `ai-runs`', "minting through R12"; `op=versionnotice` and its question arm go to `reevaluation`
### from entities.txt
- [DESIGN] entities R19, l.48 — `namingPlan` with no terms uses the profiles' `search_terms`; "with none held it answers undetermined, never a default"
- [DESIGN] entities R18, l.47 — a withheld candidate "is not offered, and nothing counts what was withheld"
- [DESIGN] entities R5, l.27 — an absent entity answers `{ok: true, found: false}`, "never a refusal"
- [DESIGN] entities R4, R28, l.24, l.105 (DEC-52) — a machine may declare, resolve and testify, and is named `class:<cls>`, "never as a person"
- [DESIGN] entities R13, l.37 — `onResolveAttempt` runs once per reference tried, matched or not (observation-log records the attempt)
### from connections.txt
- [DESIGN] connections Themes Terms, l.73–74 — `proposeForTheme` takes "`ai` when its minted writes name it"; the proposer is `class:ai/<tokenId>` "for an assistant's proposal"; a proposal is a `hunch` grade `C`
- [DESIGN] connections R48, l.134 — "A hunch becomes membership only through R40's act by a member, and no proposal changes membership."
- [DESIGN] connections R10, l.34 — the `why` tells apart "no connection, an unchosen mention, unplaced connections, and every connection outside. Undetermined is never read as none."
- [DESIGN] connections R6, l.28 — when a member's choice stands, "it names the choice, never "nobody has chosen""
- [DESIGN] connections R20, l.50 (DEC-36, K903 (4); N459, K935) — a hidden citer withheld whole, the answer states only `out_of_view: true`; status l.5 "not yet met: T21"
### from progressions.txt
- [DESIGN] progressions R18, l.52 — proposals carry `surfaced_by: machine`; consumed by `op=queue`'s FINDING class (NOTIFICATIONS.md, l.108)
- [DESIGN] progressions R10, l.38 — with fewer than two placed stages "the grade is null and `grade_determined: false`, never invented"
- [DESIGN] progressions R9, l.37 — no definition answers `found: false, defined: false`; nothing threaded `found: false, defined: true`
### from bias.txt
- [DESIGN] bias R33, l.59 — "A **work product** is what a lens shaped: today an AI run, registered by `ai-runs` (its R30) with its context, principals, the lens recorded when it began"; R40 l.68 inquiry findings under a project lens are work products too (K102)
- [DESIGN] bias Suggestions, l.113 — "The run's bias block (`#biasForRun`) is `ai-runs`', calling R18" (every AI run carries the lens in force); the published case's frozen manifest is `publication`'s
- [DESIGN] bias R21, l.48 — inhale answers `installed: false`, `adopted: false`, `writes: 0`, statements `proposed: true, authored: false`
- [DESIGN] bias R15, l.40 — with nothing in force: "no manifest was in force", "never an empty lens"
