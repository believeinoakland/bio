# Digest: ANALYSIS

Every phase-1 reader's ANALYSIS section, in reader order (20 notes).

## From C1 (C1: BIO_Complete_Roadmap_v5.txt, BIO_Design_Requirements_v2.txt, BIO_Functional_Architecture_v3.txt, BIO_System_Design.txt, BIO_Action_v0_1.txt, MILESTONES.txt, UI-KICKOFF.txt)

- [EXAMPLE] RM §1 L219-223 — aggregate over fiscal years and a percentage of revenue — "$52.6 million in sewer maintenance fees had been diverted … over nine fiscal years"; "at approximately 10% of sewer service charge revenues"
- [EXAMPLE] RM §1 L234-239 — a time series from a portal dataset; budget figure vs actuals — "OpenGov portal data shows transfers from the Sewer Service Fund continue at $1.6M to $2.8M annually, trending upward"
- [EXAMPLE] RM §1 L246-250 — financial statements requested as analysis inputs — "the Statement of Revenues, Expenses, and Changes in Fund Net Position for the Sewer Service Fund from each year's ACFR, the city's cost allocation plan"
- [EXAMPLE] RM §1 L270-271 — "cost information, burden of proof analysis"
- [DESIGN] RM §9 Skill 3 L587-589 — "Pulls structured information from public sources: ACFRs, OpenGov, budget documents, court records. Lowers the barrier to producing analytical work products."
- [DESIGN] RM §9 Skill 7 L621-624 — evaluates "methodological standards (reproducibility, source documentation). Output is descriptive, not pass/fail."
- [DOCTRINE] RM §5 OP2 L372 — "Show your work. Always."
- [DESIGN] RM §12 L778 — "Compliance dashboard"
- [EXAMPLE] RM §14 L877-879 (history) — "Write one Data Extraction adapter against the sewer-fund OpenGov data and one ACFR PDF"
- [DESIGN] RM §15 resolved L1000-1003 — "JSON tidy/long core with provenance, hashes, criticality, and classification; .md/.svg as derived views"
- [NEED] DR §6 L139-143 — reproducibility as metadata — "content classification (facts, analysis, judgment, or combination)"; "methodology documentation sufficient for an independent group to reproduce the analytical results"
- [DOCTRINE] DR §5 L129-133 — "Forks at the fact or analysis layer signal a reproducibility issue for the network to investigate"
- [DESIGN] DR §12 L333-341 — "data extraction skills … (ACFRs, budget documents, OpenGov portals)"; "comparison skills that analyze where two groups' analyses of the same data diverge"
- [DESIGN] DR §10 L271-272 — directory data "in a downloadable structured format (CSV or JSON)"
- [NEED] DR §2 L89-93 — one person must be able to "access public data, produce a standards-compliant work product"; "useful to one person with a few hours a week."
- [NEED] FA L1 Fn2 L149-154 — "An ACFR is a 180-page PDF. The OpenGov portal is a JavaScript application … Budget documents are formatted for reading, not analysis."
- [DESIGN] FA L1 Fn2 resolution L156-163 — "The structured core is JSON in tidy/long form for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification"
- [DESIGN] FA L1 Fn3 L183-188 — dataset snapshot: raw capture, "canonicalized normalized dataset (hashed and diffed)", rendered view; "The hash is taken over the normalized dataset."
- [NEED] FA L2 Fn2 L271-276 — cross-source reconciliation and budget against actuals — "The ACFR may show a transfer amount that doesn't match the OpenGov data. The budget narrative may describe a program that the actual expenditure data doesn't support."
- [DESIGN] FA L2 Fn2 L278-281 — partly supported by extraction and the compliance-analysis skill; "the judgment about what discrepancies are significant is human work."
- [DESIGN] FA L2 Fn3 L292-307 — "facts are verifiable, analysis is reproducible, and judgment is debatable"; classification "travels with the data through the pipeline"
- [DESIGN] FA L2 Fn4 L313-315 — significance "informed by context, scale, pattern, and consequences"
- [DESIGN] FA L3 Fn1 L369-375; resolution L377-382 — "methodology documentation sufficient for reproduction"; "a machine-checked citation register grounding every load-bearing claim in archived, hashed primary sources"
- [DESIGN] FA pipeline L465-477 — "retrieval …, extraction …, normalization (convert to consistent format for comparison), and storage"; "Layer 2 skills consume Information bundles through the store's read interface"
- [DESIGN] FA change detection L484-487, L496-499 — numeric tolerance — "meaningful change versus noise (rounding differences, formatting changes)"; resolved "keyed field-level diff with numeric tolerances for structured data"
- [DESIGN] FA trust L506-512 — grade per data point travels — "A data point extracted from an ACFR has different trust characteristics than a data point from another group's analysis."
- [DESIGN] FA three-layer workflow L606-609 — "graded by the epistemics ladder: evidence identified from Information, analysis built from evidence, conclusions graded on how they follow only from evidence and analysis"
- [BUILT] SD §3 row 4 L96-98 — cell-level addressing — content extents "document, pdf-page, sheet-cell, slide-shape, doc-para"; "the content extent kinds are exactly these eight"
- [BUILT] SD §3 row 5 L100 — tables as content — "the sheet-range, doc-table and image extent arms are landed (FW-19)"
- [BUILT] SD §3 row 5 L100-101 — datasets as captured material — "the CSV format entry (FW-23 …)"; "a CSV reading's DIALECT, persisted (REC-218)"
- [RULING] SD §7 L302-303 — the only arithmetic over grades — "Legs compose by AND/OR; weakest governs across AND, strongest across OR; sufficiency only by an attributed act — DEC-32."
- [BUILT] SD §3 row 9 L115 — "relevance … published as an ORDER, never a score (D-447, IC-238)"
- [DOCTRINE] SD §1 L42-44 — "an equality or outcome that costs nothing to produce is not evidence"
- [DOCTRINE] SD §4 L150-152 — "grade tracks directness and never composes across scales"
- [DESIGN] AC §3 Consequence L22 — calculation from the record, causation separate — "computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed" — module `consequences`.
- [RULING] AC §4 rule 1 L32 — the machine "may find, compare, compute, propose and draft, always labelled as machine work"
- [RULING] AC §4 rule 3 L34 — "No significance, no score. … No field holds significance, severity, priority or a score."
- [RULING] AC §4 rule 8 L39 — the plan "holds no costs, assignees or hours" (the group's own budgets; not government budgets)
- [DESIGN] MS M2 L154-177 — spreadsheets as one container problem; cell citation — "Sheet1!B14 and slide+shape are stable and human-meaningful — the first time the record can cite finer than a whole document"
- [GAP] MS M2 L226 — "Tables, visuals, OCR — later tiers, deferred by name rather than forgotten." (2026-07-31; SD shows tables since landed)
- [DOCTRINE] MS M2 L231-232 — "Every tier states what it could not do; undetermined stays first-class and text is never silently truncated."
- [GAP] MS M6 L323-326 — budget books are large and custody is unplanned — "no plan for R2 growth, the free tier's storage ceiling, retention, or a second copy, while one budget book measured 39.6MB"
- [DESIGN] MS M8 L407-408 — computed not transcribed numbers — "the adminarith/projectownerarith ops exist so the tally is computed rather than transcribed"
- [DESIGN] MS M9 L446-451 — derived strength rules — "each as its own weakest leg, BY NAME; never as a score, never as an average, never composed into one letter; and an ungraded leg SUSPENDS its axis"
- [DESIGN] UK UX principles L177-179 — "Include meaningful, insightful, and relevant interactive visuals that tell stories"
- [DESIGN] UK Refinements L212-216 — charts in publications must survive print — "Interactive story visuals DO extend to the published surface"; "The PRINTED version of a publication is first-class and must carry the full narrative"

## From C10 (C10: OBSERVATION-LOG-DESIGN.txt, BIO_Technical_Architecture_Decisions_v10.txt, BIO_Distribution_v0_1.txt, PRACTICE-SURVEY.txt, CONSTRUCTS.txt)

**OBSERVATION-LOG-DESIGN.txt**
- [DOCTRINE] OLD Status l.16: a coverage percentage must be computed over subjects drawn from the case, never from the log. Otherwise it "would read 100% searched BY CONSTRUCTION". D-196's ancestor is Blair & Maron (~20% recall measured against 75% believed). `SEARCHED_SUBJECT_SOURCES` lives in bio-checks.mjs.
- [DOCTRINE] OLD Status l.17: honest negatives `never_looked`, `undetermined` and `no_subjects` are published. — "zero of zero is not 100%, which is the costs-nothing rule wearing a percentage"
- [DESIGN] OLD Incomplete §6 l.31: an unresolvable basis leg (nullable `inquiry_basis.content_id`) is counted `unidentified`, the count is published, and the level is CAPPED at `partial`. A derived coverage figure carries its own grade.
- [RULING] OLD §6 l.278–312 (REC-110, D-386 closed (a)): the tally is UNGATED at three levels, on four stated premises (`op=stats` already publishes the log size; no bundle column; amplification class; IC-118/IC-25). — "if any one of them stops being true, this ruling is the thing to reopen."
- [DOCTRINE] OLD §6 l.314–318: reproducibility of a signed number. — "A viewer-dependent tally would make a signed completeness claim depend on who computed it — two signings of one case disagreeing about what was searched."
- [GAP] OLD §6 l.321–326, l.386–389: "`searchedSection` in `airun.mjs` takes its `levels` FROM THE CALLER and does not read this tally". No live consumer depends on the tally's viewer-independence.
- [RULING] OLD §6 l.368–391, BOB #32 2026-09-24 02:30Z (D-486, IC-258, M-131): every tally, plus `observationsNonLead` and `aiRunLog`, drops `run` rows of projects the caller cannot see (`Store#hiddenSets`). — "a hidden project's run output is the PROJECT'S THINKING until something outside uses it"
- [RULING] OLD §6 l.349–356, BOB #15: a count discloses existence. — "that a COUNT is a disclosure of existence". The internet tally is `tally_scope: "visible_to_viewer"`.
- [BUILT] OLD Incomplete §6 l.28–29: the `op=provenanceroutes` census is computed THROUGH the gate. — "the count of withheld rows is deliberately NOT published, because that count is the disclosure". Empty answers carry a cause from a four-member ladder.
- [BUILT] OLD Incomplete §6 l.58–59 (D-389, REC-174): `truncated` = `gated.length > cap || raw.length === limit`. Over-reporting is the fail-safe direction.
- [BUILT] OLD §6 l.345–347, l.438–440: reproducibility is checked byte-for-byte (hash `19cdc8d2bbecf173`, 945,145 B; six driven answers "byte-for-byte what they were").
- [EXAMPLE] OLD Incomplete §7 l.65: an in-code measurement with a stated floor (`tools/measure-office-corpus.py sweepvolume`, 43,283 keys). §7 l.505: the table is sized on the busiest day.
- [DESIGN] OLD §4.2 l.198–210: content-level outcomes include "over the 20 MiB office bound", plus a re-extraction candidate list (`tier3_candidate`, chain older than calibration). The frontier "makes D-319's opt-in re-read a choice a member can make from a list".

**BIO_Technical_Architecture_Decisions_v10.txt** (spreadsheet and data processing)
- [DESIGN] TAD §7.1 l.693–696: extraction output — "The structured core is JSON (tidy/long for line items, carrying provenance, source locator, content hash, criticality, and fact/analysis/judgment classification)". .md/.svg companions are derived views.
- [DESIGN] TAD §7.1 l.696–699: tooling and source preference. — "Tooling (June 2026): Tabula and Camelot for native PDFs, cloud ML extractors for scanned or irregular documents; prefer a source's published spreadsheet over re-parsing its PDF."
- [BUILT, historic] TAD §7.1 l.701–709: Socrata full-file exports and Granicus Legistar REST were "proven mechanically capturable" on July 19, 2026, on the retired daemon. A source outside a proven class "needs a session with its own tools until its class is proven".
- [DESIGN] TAD §7.2 l.713–718: a snapshot of a dynamic source is "keyed to a stable query definition: a raw capture ..., a canonicalized normalized dataset (hashed and diffed), and a rendered view". — "Hash the normalized dataset, not raw HTML."
- [DESIGN] TAD §7.4 l.731–733: dataset change detection — "keyed field-level diff with numeric tolerances for structured data". A detected change propagates a re-evaluation flag to every citing object.
- [DESIGN] TAD §8.3 l.929–931: spreadsheets appear only as an OUTPUT surface. — "outbound/rendering (slide decks, spreadsheets, exports)". Inbound surfaces (surveys, forms) are "heavier, with a backend and an attack surface".
- [DESIGN] TAD §8.3 l.934–937: "the Analysis layer is intent-driven (a group expresses interests, objectives, and requirements and the system shapes its process and products)".
- [DESIGN] TAD §9 l.1017–1022 (retired stack per l.16): "Python, scoped to the information layer's document/data extraction, run as in-sandbox tool-scripts a skill invokes. The agent shells out to Python". The Decision l.1058–1060 reads "Python for what touches data".
- [DESIGN] TAD §9 l.1032–1037: the bundle substrate is "Never a spreadsheet, and no substrate as any central surface."
- [DESIGN] TAD §4 l.439–446: the fact/commentary firewall ("anything not 100% factual is explicitly labeled as commentary"). — "Reproducible: the conclusions and their supporting data are complete enough that a recipient can rebuild the conclusion with fidelity (show your work)."
- [DESIGN] TAD §4 l.448–449: "Dual-mode metadata: highly structured, processable both algorithmically and by a properly skilled AI."
- [DESIGN] TAD §4 l.469–471, §5 l.532–538: verification is "finite and local: do the cited primary sources say what is claimed, and does the synthesis validly carry that data to the conclusion".
- [EXAMPLE] TAD §11 l.1586–1590: "Write one Data Extraction adapter against the sewer-fund OpenGov data and one ACFR PDF; confirm the JSON core round-trips". §0 l.129–133: the sewer fund is "an exemplar pilot ... not a call to act publicly".
- [DESIGN] TAD §3 l.384–387: description-as-truth for rendered artifacts (SVG diagrams). The machine-readable description is authoritative, the rendering is regenerable, and staleness is detected at write time. This is relevant to charts in publications.
- [DOCTRINE] TAD §10.2 l.1106–1113: the Mechanical Verification Law. — "a correct prose contract does not reliably produce conforming output; only a mechanical check run against the written artifact does."
- [DESIGN] TAD §10.3 l.1132–1133: "Preselection/triage: a cheap first pass chooses which detectors or lenses this job needs."
- [DESIGN] TAD §10.8 l.1489–1497: "the WHOLE id is the identity, a component of it that exists to make the id legible is a hint". §10.9 l.1510–1513: absence (null) is distinguished from failure (throw).

**BIO_Distribution_v0_1.txt**
- [DOCTRINE] DIST §3 l.47: "nothing about a release is decided by what a tool said — only by what was read back."
- [DESIGN] DIST §6 rung 4 l.94, rung 8 l.142: unknown values state "UNDETERMINED — never a match".
- [RULING] DIST §6 rung 6 l.107–119, BOB #32 2026-09-24 06:07Z (D-506, IC-265): — "`ok` says THE OP ANSWERED, and `ok:false` is reserved for a catalogued refusal". The result is `verdict` (`pass`/`fail`), with failures named in `failing`.
- [EXAMPLE] DIST §6 rung 6 l.100–102: left-over identity rows change "the next run's membership arithmetic" ("7 VF-4 member rows, 6 `proposed`").

**PRACTICE-SURVEY.txt**
- [EXAMPLE] PS §1 l.58, NVivo: codebook definitions with inclusion/exclusion criteria, and computed inter-coder agreement ("percentage agreement, Cohen's kappa"). But "agreement statistics are easy to read as validity" (CLAUDE.md: "an equality that costs nothing to produce is not evidence").
- [NEED] PS ADOPT 8 l.223–225: "A defined catalogue entry before a category is applied, and a recorded change to the definition" (the `C-`/`N-` discipline).
- [DOCTRINE] PS §3 l.110–113: scored relevance is rejected. — "A confidence score smooths an undetermined leg into a number. BIO's strength is weakest-link over graded connections (D-72), and `undetermined` must survive the composition"
- [DOCTRINE] PS VIOLATE 3 l.244–246 (BUILT, SK-3): "No single confidence score". — "an `undetermined` leg must remain visible as undetermined rather than being smoothed into a number."
- [DOCTRINE] PS VIOLATE 4 l.247–249 (BUILT, SK-3): no connection-density or centrality ranking ("Connectedness is a property of the drawing, not evidence"). §2 l.72: "centrality metrics rank a node's importance by graph shape, which is compellingness, not support".
- [DOCTRINE] PS VIOLATE 6 l.256–258, §5 l.137–138: "a count is a volume proxy and volume is not meaning".
- [GAP] PS NO PRECEDENT l.285–287: "Strength composing along a basis chain, where a case built on a case cannot be stronger than the case beneath it ... nothing computes over the link."

**CONSTRUCTS.txt**
- [DESIGN] CON Step 8a l.296–305 (UNSCHEDULED): "Satisfaction conditions, on projects AND on bias statements. One evaluator, two consumers (D-88)". — "progress is computed from the record rather than reported by whoever is doing the work". A machine-readable condition sits beside `objective`.
- [DESIGN] CON Step 8a l.298–301: on a `pattern` bias statement, the evaluator gives "a standing measure of how far the evidence still bears the statement out, which is the inverse of bias debt" (D-87). "The measure never edits the statement".
- [GAP] CON header l.11–12: "the budget-or-dataset type is OWED, measured first" (EXTRACTION-BREADTH-DESIGN §2).
- [EXAMPLE] CON Step 5a l.280–281: budget documents in the record share project numbers (7) and fund codes (3) with Legistar.
- [DESIGN] CON overlap 3 l.143–146: `diffEntities` with named facts "can say WHICH fact moved". Overlap 6 l.158–159: "Keep the grade, derive the boolean."
- [DESIGN] CON inventory l.80, l.89–91: the confidence ladder (certain / likely / possible / none); `compare` verdicts (identical / unchanged / restyled / changed / undetermined); `fidelity` (faithful / degraded / insufficient).
- [BUILT] CON Step 1 l.236–241: the profile is recorded on the capture. — "a judgment whose author and version are unrecorded cannot be revised when the author turns out to be wrong."
- [DOCTRINE] CON plan l.220–221: "no step is done until something CONSUMES its output".

## From C11 (C11: src/DECISIONS-archive-part1.txt)

- [DOCTRINE] DEC-4 second amendment, src 228–232 — human checking of transcriptions fails on digits, "precisely where OCR fails"; CPDF-9 must measure it. Bears on the grade of any figure read from an image (budgets). — "digits, which is precisely where OCR fails and where skimming fails too"
- [DOCTRINE] DEC-4, src 125–127 — a member reading a figure must know whether the document said it or a machine guessed it. — "A member reading a figure must be able to tell whether the document said it or a machine guessed it."
- [EXAMPLE] DEC-4 second amendment, src 220–222 — "a 200-page scanned budget attested wholesale is a weaker claim than one figure checked against its rect"; a leg citing outside the attested extent does not inherit the grade.
- [NEED] DEC-5, src 256–263 — the evidentiary patterns "are only visible ACROSS documents", so metadata must be on indexes and facets: cross-document aggregation/faceting over metadata (counts by editor, department, instant). — "Withholding it from the index would have withheld exactly the capability the material is valuable for."
- [EXAMPLE] DEC-11, src 589–593 — figure change $4.2M→$2.8M found from tracked changes: comparing superseded wording/figures to the published version is an analysis need (diff of figures across versions).
- [DOCTRINE, tension] DEC-11, src 597–600 — aggregation over person-identifying metadata creates "a pattern ABOUT A PERSON ... created by INDEXING rather than by holding" — the recommendation would have barred facets/digests/exports; Bob's DEC-5 answer surfaces and indexes it. Any analysis over editor metadata sits on this ruling.
- [RULING] DEC-14, src 953–960, 991–996 — causal inference from sequence is refused: Worthy's FOI study (53% sought accountability, "few elicited a response", 40% reported leverage DECREASED); Metaketa I trials "pool to approximately zero"; ProPublica: impact "easier to identify than to conclusively prove". — "Publication is not reliably the active ingredient."
- [DOCTRINE] DEC-14 determinations, src 998–1000 — "UNPROVEN IS A STATED STATE, NOT A LOW GRADE. It reuses the R1 shape — the chain has no computed strength on that axis and names why — rather than minting a fifth grade or floating an impact claim at D."
- [EXAMPLE] DEC-16, src 1176–1179 — fund-misuse inquiry over a $2.1m transfer: budget/fund analysis nested as inquiries resting on inquiries.
- [DESIGN] DEC-15, src 1040–1044, 1049–1050 — R2: a document leg has TWO grades, CAPTURE (earned from how bytes arrived; "grade A for a direct capture is forbidden and enforced") and CONNECTION; "Earned grades also make weakest-link composition do its work without anyone policing it."
- [DOCTRINE] DEC-14 determinations, src 1002–1005 — "THE OUTCOME/IMPACT LINE IS STRUCTURAL, AT THE WRITE PATH": an action's recorded consequence is an OUTCOME by default; promoting it to impact "requires a basis leg pointing at evidence that is not our own action. Same discipline as `grade_source`: the machine never mints the stronger one."
- [RULING] DEC-18 (Bob, 2026-08-02), src 1398–1415 — composition of grades: "AN UNGRADED LEG IS INERT, NOT UNRATING" — it "is not weighed, it is not averaged, it does not floor, and it does not unrate"; the conclusion is graded on its load-bearing legs; if EVERY leg is ungraded the conclusion is UNRATED naming all of them; "every such leg will be named". REC-12's comparator excludes the ungraded leg from the population. — "An ungraded leg doesn't contribute to a conclusion, but if there are other graded legs, then it doesn't suspend the conclusion either."
- [DESIGN] DEC-17 determinations, src 1312–1314 — the declared strength is "a PAIR, per R2 — a required capture strength and a required connection strength — because a scalar would re-collapse the two axes".
- [RULING] DEC-21 (Bob definitions; BOB derivation, 2026-08-02), src 1519–1551 — "THEY ARE NOT COMBINED": CAPTURE = "the weakest capture grade among all the DOCUMENTS the conclusion reaches" ("how well do we know these are the bytes the body published?"); CONNECTION = "the weakest connection grade among all the EDGES the conclusion rests on"; "a leg is an edge carrying both grades"; "no rendering may reduce them to one letter"; thresholds are two independent floors (§4 Q6). — "A capture is the act of reading a document in. A connection is an edge between 2 or more pieces of information… They're different things."
- [GAP] DEC-21/DEC-23 — the grade system ranges over documents and edges only; no third population (a computed figure, a dataset row, a calculation step) is named in this half.
- [DESIGN] DEC-26, src 1770–1776 — each plan element carries a support status: "**established** (meets the project's declared required strength) · **short of the standard** (real findings, gap named per leg) · **hypothetical** (rests on a finding that does not yet exist) — rendered identically everywhere, as `undetermined` is."
- [DESIGN] DEC-27 OBJECTIVE checks, src 1920–1923 — an advisory count check against the member's goal: "*you said you wanted three claims and there are two*".

## From C12 (C12: DECISIONS-archive-part2.txt)

- [RULING] DEC-35 (L74–78, L100–113) — OCR fidelity floor stated numerically: tesseract fast-model "99.96% character accuracy, 90/90 digits, zero minted digits on the ground-truthed page"; digit fidelity is the bar a transcription must beat — the root of any derived number's reliability. — "zero minted digits on the ground-truthed page"
- [RULING] DEC-35 (L100–113) — a confidence-less engine states `confidence: none` first-class; fidelity CAP set lower by measurement; pseudo-confidence forbidden. Grade of extracted numbers rests on measured engine fidelity, not on a model's self-report. — "pseudo-confidence (asking the model how sure it is, thresholded as if calibrated) is FORBIDDEN as the costs-nothing class"
- [RULING] DEC-40 (L252–255, L259–269) — Q6's FORM survives: a bar over strengths is a PAIR OF INDEPENDENT FLOORS, never one value; a reader may supply two floor values and gets "A VIEW THAT READER CONSTRUCTED, labelled as such"; a bar may never drop a determining or suspending leg. Filters/views over graded material must label themselves. — "a bar over the pair is a PAIR OF INDEPENDENT FLOORS, never one value, never one axis with the other silently free"
- [RULING] DEC-44 det. 1 (L473–477) — a case MUST NOT derive a single case-level strength over its findings; composing grades upward is "R2's forbidden composition at a new altitude" (no aggregate grade from many derived grades). — "MUST NOT derive a single case-level strength — that would be R2's forbidden composition at a new altitude"
- [RULING] DEC-42 (L394–410) — measured scale figures: ~500 docs/month, ~14% scanned ≈ 70 OCR pages ≈ 105,000 CPU-ms vs 30,000,000 included (0.35%); tesseract 99.96% char accuracy, 90/90 digits, zero minted; classic engine supplies per-word confidence + coordinates that Moondream failed (2 of 24 box-checks; "a confident box for a figure not on the page"). Digit fidelity of OCR is the floor for any number later calculated from scanned records. — "a confident box for a figure not on the page"
- [RULING] DEC-44 enactment (L506–509) — negative control: "publish a case of two findings whose strengths differ, and the harness must FAIL if any surface, rendering or export presents a single case-level strength" (REC-44, UI-29). No aggregate grade across findings. — "the harness must FAIL if any surface, rendering or export presents a single case-level strength"
- [RULING] DEC-45 det. 3 / DEC-46 (4) (L605–612, L700–707) — REGRADE = a structured, computed comparison: hold evidence and analysis fixed, swap effective bias B1→B2, re-run evaluations, and diff "for each conclusion, its grade under each lens, and the causal chain from each differing statement to the finding it produced to the premise it touched to the conclusion it moved". DEC-46 makes REGRADE "a first-class member capability over any finding set and any two effective biases" (named on M4; import is one CALLER). A reproducible derived comparison carrying its basis (causal chain). — "CROSS-BIAS COMPARISON IS A CAPABILITY, NOT A DIAGNOSTIC."
- [GAP] DEC-45 det. 4 / DEC-46 (4) (L613–618, L704–707) — regrade's honest limit must travel with every use: "it cannot synthesize the analysis a different group would have written under a different lens"; a clean diff means the analysis that EXISTS survives. — "a clean diff means the analysis that EXISTS survives, not that the finding survives the new lens intact."
- [EXAMPLE] DEC-54 (L1117–1125) — measured declared/enacted gap from research/SEARCH-COMPLETENESS.md: Blair & Maron (attorneys stipulated 75% recall, believed it, measured ~20%); TREC 2011 (teams' self-estimated recall erred up to +95 points). A self-reported number is a claim until checked. — "A stated standard nobody checks is not a standard; it is a claim, and it fails silently."
- [EXAMPLE] DEC-54 (L1080–1082, L1137–1139) — "in four of five documented verification failures the organisation's COUNTABLE rules were formally SATISFIED while the uncountable properties failed" (source independence, adversarial contact, chain of custody, non-denial read as confirmation). Countable checks alone overstate conformance. — "the countable rules were formally satisfied while the uncountable properties failed."
- [RULING] DEC-57 (L1185–1195, L1215) — a bounded check states its bound: `heldMatch` read the plane at a cap of 50; when the walk cannot reach the end, the bundle body records "that the held-check was bounded, what it examined and out of what" (via the `CHANGED_FROM` mechanism). Any count/search over a partial set records denominator and reach. — "what it examined and out of what"
- [RULING] DEC-58 (L1257, L1264–1276, L1296) — standing rule: "numbers come from measurement and never from the surface"; REC-57 made eleven capped ops publish the bound they APPLIED and whether they truncated; UI-41 made every surface read the record's number instead of composing one, enforced as a CLASS; where the record publishes no bound, the surface SAYS it does not know. `op=readingname` caps at 100/500. Rule stands unamended. Direct doctrine for any count/aggregate shown to members. — "This project's standing rule is that numbers come from measurement and never from the surface."
- [DESIGN] DEC-58 (L1266, L1269) — an unstated bound reads as completeness; UI-26 measured the completeness-WORD screen stays green over a sentence with no bound; a requested bound is true as an upper statement "since a clamp can only make the list shorter than the claim, never longer". — "an unstated bound reads as completeness"
- [RULING] DEC-60 (L1585–1589) — **operative: "Effective strength is computed on ACCEPTED legs only"**; the strength function takes an argument naming which states to factor in (default `accepted`); "the return carries the state set that produced it, because a number travels and a strength separated from its filter is the misread DEC-40 exists to prevent"; a what-if value is exploration and never a record value. Template for any derived number: it carries its filter. — "a number travels and a strength separated from its filter is the misread DEC-40 exists to prevent"
- [RULING] DEC-60 (L1623–1628) — **operative**: the AI forms and weights legs; "The calculation stays as simple as it already is. The intelligence goes into how the legs are formed and weighted, never into relationships the record computes over." Calculation in code stays simple and deterministic; judgement lives in AI-formed inputs, which are suggestions until accepted. — "assign strength values that when calculated are supported by the evidence."
- [RULING] DEC-60 (L1641–1643) — reproducibility: the published bundle carries "the leg configuration for reproducibility, the description for readability, and the version's NAME". — "the leg configuration for reproducibility"
- [RULING] DEC-65 (L1728–1734, L1757–1766) — strength arithmetic: C-25.5 makes a version's ground partition TOTAL; C-25.6 `VERSION_GROUND_UNASSERTED` requires a named member to assert every declared part; with exactly one part "there is no maximum to take", so the weakest-leg reading is DEC-32's conservative default; PL-14 re-measures "the strength pair over grounds" after. — "with exactly one part there is no maximum to take, so DEC-32's conservative default is what you get either way"
- [RULING] DEC-65 (L1740–1741, L1751) — an empty-handed background run is COUNTABLE: §9's `level-empty` is produced deterministically by the control-flow table; refused candidates DROPPED with `repeats` at zero and the refusal in the plane's own words. — "an empty-handed background run is a countable object and not a silence."
- [RULING] DEC-65 PL-17/19/20 (L1785–1889) — enactment in three steps: PL-17 minted `SUFFICIENCY_UNCLAIMED = 'none:independent-sufficiency'` (namespace deliberately neither `token:` nor `class:` — "this value means *nobody did*"); `isSufficiencyClaimed()` TRUE for a named member only (where DEC-32's "only ever reached by an affirmative, attributed act" now lives); PL-19: `C-25.6` admits the no-claim value on exactly one part, refuses on two+; endpoint stamps it instead of the composer; "WHO COMPOSED and WHO ASSERTED are different facts and only the second is a claim"; `C-2.8`/`MACHINE_CANNOT_GROUND` left closed. PL-20: the strength walk's transitive callee closure is 8 functions, 47 property names, none reads `asserted_by` — "the arithmetic is attribution-BLIND", so the defence is entirely at WRITE time. — "*the maximum is never taken over a part nobody claimed* is a WRITE-TIME fact and nothing else."
- [EXAMPLE] DEC-65 PL-20 (L1875–1885) — a live defect measured on main: a two-part reading with an unclaimed second part was admitted at `op=promote`, reporting "connection A where the parts anybody signed for support only C, with nothing in the answer saying so" — a derived grade overclaiming silently; closed by PL-19. — "over SEVERAL it is the overclaim this project ranks worst."
- [DESIGN] DEC-65 PL-20 (L1852–1867) — method standard for a negative result: "a measurement with its reach printed rather than an absence of findings" — closure COMPUTED, never listed; recogniser re-run on a positive control; driven at both altitudes (`op=inquirystrength` over a three-part finding, `op=versionstrength` over two-part) with attribution facts rewritten (pair unmoved) vs a changed part LABEL (pair moves) — "so the equalities are not the free agreement this project refuses to count as evidence". Derived pair example `["graded","B","unrated",null]`. — "THE REACH ANSWER IS TREE-INVARIANT AND WAS MEASURED ON BOTH TREES"
- [RULING] DEC-64 (L1895–1924) — **operative: "KEEP (a) — the bound is stated always."** Every answer states the bound the record APPLIED, whether or not it truncated; one shared function words it. — "a bound a member is told about only sometimes is one they cannot rely on."
- [GAP] whole file — no DEC on datasets, spreadsheets, filters/aggregates over records, budget-vs-actuals or charts. ANALYSIS content is doctrine about numbers: measured not surface-composed (DEC-58), bound always stated (DEC-64), carries its state filter (DEC-60), never composed upward into a case-level strength (DEC-44), OCR digit fidelity (DEC-35/42), and the attribution-blind strength walk defended at write time (DEC-65).

## From C13 (C13: src/plan/ (research-oakland-calendar, draft-planning-skill, draft-filing-templates, action-design_PATH, action-design_UX-ANSWERS, action-design_action-plans, action-design_deltas, action-design_HANDOFF, action-design_tests))

### research-oakland-calendar.txt
- none in research-oakland-calendar.txt (no calculation, dataset or aggregate; the only arithmetic is counts of holiday dates per list).
### draft-planning-skill.txt
- [DOCTRINE] §1, L8; agent-worker R52, L27; §3 choice 2, L45 — the assistant may never "rank or score options"; "the table assigns no rank, order of merit or score"; proposals "answered in id order, never ranked" (R32, L39).
- [DESIGN] §1, L7 — "the consequences recorded" are read as an input (consequences = calculation module, layer 9); no calculation is performed by the run.
- [DESIGN] §2 run-rules R1, L14 — `RUN_BOUNDS` gains `proposals` (a count); §3 choice 2, L45 — "at most 5 proposals per run".
### draft-filing-templates.txt
- [EXAMPLE] §3, L97 — module size measurement as an architecture input: "`filings` is already 1,876 lines (`bio-plane/src/filings/`, measured) with nine services; this adds about eight acts and five tables; one session should read a module whole (P6)."
- none otherwise in draft-filing-templates.txt (no calculation, dataset or aggregate design).
### action-design_PATH.txt
- [DOCTRINE] §3, L33 — the plan page must never show "a cost, budget, assignee, score or priority".
- [EXAMPLE] §2 step 2, L14 — "a plan resting only on hypothetical subjects says so at the top, as hunch debt" (a qualitative, not numeric, measure).
### action-design_UX-ANSWERS.txt
- [RULING] OQ-8, L9 — judgment "never in a score"; none otherwise (no calculation design).
### action-design_action-plans.txt
- [RULING] R26, L88 (rulings 3, DEC-24) — "No field, input or answer holds a cost, budget, amount of money to be spent, assignee, hours or significance score"; keys `budget`, `cost`, `assignee`, `hours`, `significance`, `priority`, `score` refused `OPTION_KEY_REFUSED`.
- [DESIGN] Terms, L15; Uses L75 — support `short` derived from `strength.projectBar` (project's bar against a finding's strength): a graded comparison, not a number shown.
- [DESIGN] R7, L28 — `plansFor` paging at most 200, "`truncated` measured by reading one past".
- [CONFLICT] Size L5 vs Uses L68–81 — Size says one session reads it "with the public parts of `conformance`, `consequences`, ..."; the Uses list omits `consequences` (the Suggestions L104 list consequences among the AI's inputs). Minor inconsistency about whether action-plans reads `consequences` directly.
### action-design_deltas.txt
- none in action-design_deltas.txt (no calculation, dataset or aggregate; grades are capture grades, not computed numbers).
### action-design_HANDOFF.txt
- [RULING] rulings 1–10, L7 — "no budgets"; "no catalogue of response options".
- none otherwise in action-design_HANDOFF.txt.
### action-design_tests.txt
- [DESIGN] R26, L36 — "each refused key (`budget`, `cost`, `assignee`, `hours`, `significance`, `priority`, `score`) refuses `OPTION_KEY_REFUSED`".
- [DESIGN] R7, L15 — "pages of 200, `truncated` by reading one past".
- none otherwise in action-design_tests.txt.

## From C2 (C2: DECISIONS-design-branch.txt)

- [RULING] DEC-68 (src 156–181) — a measurement whose quantity is not in the record is published as `undetermined` (VF-6, MEASUREMENTS.md) with what the instrument cannot observe stated beside it; proxies biased toward alarming answer rejected — "every available proxy is wrong in the direction that manufactures a scandal."
- [RULING] DEC-32 (src 549–597) — the grade arithmetic for any derived strength: min over necessary (AND) legs, max over independently sufficient (OR) branches; R1: a suspended leg suspends its ground, finding suspends only when every ground is suspended (DEC-18 pattern) — "strength is the MINIMUM over AND-related legs and the MAXIMUM over OR-related branches (minimum within each branch, since a branch is itself an AND)."
- [RULING] DEC-72 (src 223–227) — derived claim strength displayed beside the case's standard; a claim may exceed the bar — "a claim could be even stronger than required for that case."
- [RULING] DEC-32 research finding (src 692–703, D-195) — OR-max is sound only if branches are independent; the system can DERIVE from content-addressed provenance that two branches share an upstream origin and surface it (circular reporting; NYT Iraq, Buttry, Berkeley Protocol) — "The arithmetic is not wrong; the missing piece is the independence check"
- [DESIGN] DEC-32 (src 666–671) — the system "may NOTICE the pattern (a weak leg moved into its own branch immediately after a strength drop) and surface it to the member and the reader" — derived pattern detection that informs, never refuses.
- [RULING] DEC-32 amendment (src 719–726) — derived-result vocabulary: a branch the walk could not finish = `undetermined`; nothing established = UNRATED (built at `#groundResult` in `store.mjs`, REC-42) — "a branch the walk could not finish reads `undetermined`; a branch with nothing established reads UNRATED."
- [DESIGN] DEC-32 (src 676–678) — the elicitation is itself to be measured on first real inquiries (falsifiable design) — "measure it on the first real inquiries rather than predicting it."
- [RULING] DEC-53 enactment (VF-6, src 945–955) — any measurement must STATE what its proxy measures and what it would MISS before shipping a figure; a stated `undetermined` is a legitimate result; an absent signal never reads as a measured zero — "a proxy presented as the thing itself is this record's overclaim class arriving in an instrument" / "an absent signal must never read as a measured zero."
- [RULING] DEC-51 (src 1007–1009) — the surface must never render a grade letter it computed itself; it renders the plane's sentence (UI-32's removal of the surface-COMPUTED grade letter pinned) — derived grades come only from the plane.
- [RULING] DEC-50 (src 1017–1059, session BOB 2026-08-10 on DEC-32) — a GROUPED (structured AND/OR) basis refuses a new leg via `op=cite`; route is ungroup with a reason → cite → regroup (REC-45); keeps the derived strength from resting on an incomplete authored partition.
- [RULING] DEC-77.3 (src 1272) — a derived statistic is the guard against steering: acceptance rate of recommendations per kind, reported; also "the detector's false-conflict rate" and dismissals feeding "the over-strictness measurement" (DEC-76.3, src 1252).
- [RULING] DEC-79 (src 1311) — a derived status display must be computed by the same rule that states what is still needed; "never promise a stage the computation would not give".
- [RULING] DEC-84.10 (src 1387) — in the CCCER published form, Effect comes "from `consequences`" (the layer-9 calculation module); Criteria and Condition filled as facts from the two sides; Cause member-authored, published only when evidenced ("cause not established"); Recommendation "limited to a proposed action, never a policy position".
- [RULING] DEC-82 (src 1364–1367) — never one combined badge or score (DEC-44); two axes (capture, connection) shown separately with the weakest leg named on hover — derived grade presentation.
- [RULING] DEC-84.17 (src 1388) — dismissal reasons fixed; only "same fact at different precision" and "not about the same matter" count as false conflicts (detector's measured false-conflict rate); "precision" is also a DISSOLVED coordinate (DEC-76.3).
- [DOCTRINE] DEC-89 (src 1458) — no derived or stored significance, severity, priority, urgency or rank anywhere (conformance R8, escalation R19) — constrains any analysis that would score or rank breaches — "no field, value or vocabulary for significance, severity, priority, urgency or rank exists anywhere"
- [RULING] DEC-88 (src 1441–1442) — `comparisonpropose` (machine proposal, reversible) and `consequencerecord` (member's reasoned claim) are the analysis-bearing acts in the inventory.
- [DESIGN] DEC-90 (src 1472) — the assistant panel expands "for a long answer or a table of results" — tabular results are an expected assistant output.
- [RULING] DEC-92 (src 1502–1503) — the origin mark "is never composed with grades or strength into one trust score" (no composite scores).
- [RULING] DEC-102.2 (src 1678–1682) — testimony grade becomes a function of identity level (group/project anonymous; cover, name identify, in that order), replacing MEMBER-KNOWLEDGE-DESIGN §3's one-grade rule; the mapping of level → grade and how anonymous testimony counts in strength is owed — "In order for testimony or evidence to have greater strength, the member must identify themselves"
- [RULING] DEC-104 (src 1698–1710, Bob 2026-10-01) — a hunch counts for nothing in any strength reading, and "strength says how many hunches it left out"; the hunch's letter appears only on the link as the member's stated confidence when the guess was made, beside "not counted" — a derived reading states what it excluded.
- [RULING] DEC-111.6(3) (src 1820–1821) — a published derived indicator: the activity level "counts weeks in the last 13 with real work by members (never the assistant's, never volume) by a published method", five steps (cut-offs proposed 10–13, 7–9, 4–6, 1–3, 0, src 1825), re-signed monthly; "each group's record is facts, never a score" (src 1822).
- [RULING] DEC-112 (src 1827–1847, Bob 2026-10-01) — REPRODUCIBILITY is doctrine: the case file is "a complete structured archive that is rich and conformant enough that the results can be recreated"; an open specification and standalone open checker let anyone recreate a case without CivicOS; "the version of the method and checks inside the signed case"; import recreates each finding (Recreated; Recreated in part, naming what is missing; Did not recreate, naming what differs), shown against the importing group's own bar; "recreating is not endorsing" — "The important use case is that ANYBODY can review, and even recreate, the case for themselves without using a CivicOS instance to do so."
- [RULING] DEC-112.4(1) (src 1840) — public strength display: "a case has two strengths, never one"; each finding opens with role and bar, "never a bare \"meets\"".
- [RULING] DEC-121.6 (src 1990) — per-script use counts (started, finished, where abandoned) shown to the script's owner; "how often members finish it" shown at the flow's starting mark — derived usage counts about flows, not about members' diligence (contrast DEC-68).
- [RULING] DEC-122 (src 2007) — print and the complete edition are always light; "every colour is checked for contrast in both" themes — constrains charts/figures in publications.
- [RULING] DEC-125 (src 2050) — voice trait "neutral on policy" and DEC-84.10's "never a policy position" constrain how analytical results are worded in publications.

## From C3 (C3: BIO_Content_Framework_v0_10.txt)

- [BUILT] Front matter src 10–11 (FW-19, IC-124/125) — tables and images BUILT for office containers: `sheet-range` and `doc-table` arms and the `image` reference; content row admits them with `covers` per arm and `cited_as` — tables are citable extents.
- [GAP] Incomplete §16, src 45 — "table extraction on PDF measured NO-GO, M-55; office tables built by FW-19".
- [BUILT] Front matter src 7–8 (COFF-11/12) — a sheet's grid bound is the format's CAPACITY, not the used range; an impossible cell address refused C-45.1 by name; an empty cell inside the grid still mints; `.ods` carries an honestly NULL bound.
- [GAP] Incomplete §16, src 47 (D-608, M-174) — "Nine pages of the FY23-25 budget book are page images with a three-digit page number drawn as text"; no rule says whether a folio-only page wants OCR (budget documents as scans) — DESIGN GAP routed to BOB.
- [GAP] Incomplete §16, src 48 — "FW-23's CSV `reading.dialect` (REC-218) is the named seam beside it, not built here" (CSV datasets).
- [GAP] Incomplete §12, src 61 — an objective's satisfaction-condition vocabulary is scoped to record VALUES "entity, progression, stage, grade, and an amount or a fund only once the budget-or-dataset type exists (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5)" — no budget/dataset type exists.
- [GAP] Incomplete §13.1, src 65 (D-87, D-88) — a bias statement's MEASURABLE FORM (same construct as a satisfaction condition) and evidence accruing over time are a STATED DEFERRAL; "The `measure-decay` finding is catalogued (`queuestate.mjs`) with no producer".
- [BUILT] Incomplete §14.5, src 36–37 (REC-105) — `strengthOf()` is the single authority computing a leg's capped letter grade across "SIX consumers"; a third reader (projection CACHE `bundles.inquiry_capture_strength`, `query.mjs`'s `capture:` selector) answers stale letters, rowed D-379 (derived numbers/grades must have one authority).
- [NEED] §1.1 "Two directions", src 314–317 — a member works top down: "a goal becomes objectives, objectives become collection and analysis, and the analysis is supposed to answer the question they started with".
- [DESIGN] §1.1, src 321–324 — "an objective states what would satisfy it IN THIS FRAMEWORK'S OWN TERMS, so progress is computed from the record rather than asserted by whoever is doing the work".
- [DOCTRINE] §2 invariants 4–5, src 360–365 — "A rule requires a measurement"; "Uncertainty is carried, not resolved. Every judgment records how sure it was and on what signal. Confidence below the bar changes the ANSWER".
- [DESIGN] §3 ENTITY, src 405 — a FUND is an entity (budgets enter as entities, not as datasets).
- [DESIGN] §4, src 506–507 — candidate FORMAT axis "(HTML, PDF, dataset, scanned image needing OCR)" — datasets named as a format, not as an analysis object.
- [DESIGN] §6, src 617 — "Outcomes are graded once and the boolean derived, never carried twice" (derived values have one authority).
- [NEED/DESIGN] §8.2 junction checks, src 909–921 — quantitative checks members want: "a solicitation with **exactly one response**", "a **signed amount that differs from the awarded amount**", "**amendments accumulating** past a threshold of the original", "**payments past the contract term**"; "Junction checks are rules over a progression instance, they are DATA like the table" (needs amounts, counts, thresholds held as values; build status not stated here).
- [DESIGN] §8.2 progression table, src 892–893 — "cardinality — `1`, `0..1`, `0..n` ... Cardinality is where several of the sharpest questions live" (counting instances).
- [DOCTRINE] §8.2, src 927–930 — "a progression instance inherits the WEAKEST connection grade along its chain ... a nine-stage chain assembled by name correspondence is not evidence of anything" (grade of a derived result = weakest input).
- [DESIGN] §12 satisfaction condition, src 1199–1209 — the objective as a computable query: "entity fund 3100 / progression procurement / filter award amount > 250000, award date >= 2019-07-01 / required instance grade >= B, stages 3..8 present / satisfied when 100% of matched instances meet it" — filters on amounts and dates, a percentage threshold.
- [DESIGN] §12, src 1213–1216 — "Progress is derived, not reported. "41 of 58 contracts are at Grade B; 12 are Grade C for want of a shared identifier; 5 have no solicitation and no exception document" is computed from the record." (counts and aggregates over progression instances) — DEFERRED per Incomplete §12 (intent-layer objects absent at code; vocabulary "an amount or a fund only once the budget-or-dataset type exists").
- [DESIGN] §12, src 1217–1219 — "The gaps are the work list": 12 grade-C instances name the measurement that would raise them; 5 missing solicitations are records requests "with the request already specified".
- [EXAMPLE] §12 goal, src 1173 — "Account for the sewer fund transfers, FY2019 to FY2026" (budget/fund flow analysis across fiscal years).
- [EXAMPLE] §8.3 M-119/M-132, src 1056–1059, 1082 — measurements are analyses over corpora: "fund code ... stable in the budget across ten years (34 values)"; "Oakland's project numbers over the whole Legistar corpus (32,976 matters)" (done by workers, not a member-facing analysis capability).
- [EXAMPLE] §12 discovery loop, src 1226–1227 — unasked-for findings include "a contract amended past its original value" (an amount comparison).
- [DESIGN] §12 "Aggregate, do not multiply", src 1293–1296 — "One junction check firing across 58 contracts is ONE focus with 58 instances, not 58 focuses" (aggregation of a rule's results; built for derived findings per Incomplete §12 src 62, REC-6).
- [EXAMPLE] §12.2, src 1398–1400 — a pursuit-record dead end: "We assumed the fund code would appear in the procurement portal and it does not".
- [EXAMPLE] §12.2, src 1432 — claim with an amount: "the city moved $2.1m from the sewer fund without authorisation".
- [DESIGN] §13.1 measurable form, src 1558–1567 — a bias statement may carry a machine-checkable measure in the satisfaction-condition vocabulary: "the proportion whose minutes appeared later than 21 days after the meeting / standing 38 of 41 (93%), last computed 2026-07-30" — a percentage over a registry-defined population, dated (DEFERRED, D-88).
- [DOCTRINE] §13.1, src 1571–1580 — "The measure never edits the statement ... the standing measure is a derived, dated attachment"; "A cherry-picked denominator would let a group manufacture authority for a bias"; "It is reported whichever way it cuts."
- [DOCTRINE] §13.1, src 1554–1556 — "Most pattern statements are not mechanically measurable, and pretending otherwise would be the same error as claiming to detect contradiction"; narrative judgment "is analysis and stays analysis".
- [DESIGN] §13.1, src 1631–1634 — "minutes appeared later than 21 days in 38 of 41 meetings since 2024" is "checkable, is bounded, decays if the behaviour changes, and survives being read aloud by an adversary" — the legitimate form of a verdict.
- [GAP] §11 bends, src 1695–1698 — "Documents that are not pages. PDFs, spreadsheets, scanned images ... a PDF's evidentiary region is a page range or a table".
- [GAP] §11 bends, src 1711–1712 — "Aggregate claims. "The city moved $2.1m from the sewer fund" is a claim across documents."
- [DESIGN] §14.2 class diagram, src 1792–1799 — Extent kinds "document | page | region | cell | paragraph | shape" (a spreadsheet CELL is an addressable extent); ExtractionChain steps "layer | pixels | ocr(engine) | ai(function)", "cap = min over steps".
- [DOCTRINE] §14.2, src 1827–1837 — "every derivation step weakens and none strengthens"; "A leg citing the content may claim no more than the weaker of the two" (capture grade, derivation cap); unmeasured → "undetermined and is *stated* as such, never resolved into a letter"; "an AI that cleans a garbled OCR line produced more readable text, not more reliable text" (the grade-propagation rule a derived number would inherit).
- [BUILT/GAP] §15 structured dataset row, src 2007 — "an information bundle's data file, hashed whole | whole file | at the file only | BUILT — the pre-DEC-23 sense of "content"" (a dataset is citable only as a whole file).
- [BUILT/GAP] §15 tables row, src 2021 (FW-19, IC-124/125) — `sheet-range` (a workbook range or a sheet) and `doc-table` BUILT for office containers; "a workbook's defined tables are not yet emitted as units (D-415)"; PDF tables: "the one table step the runtime can run was MEASURED NO-GO on 2026-09-18 (CPDF-18, `MEASUREMENTS.md` M-55: blind to a ruled table), so no `table(engine)` step exists".
- [BUILT] §15 structure shape row, src 2008 — interface I2 yields per-page text, paragraphs, cells, shapes and "the evidentiary envelope (tracked changes, comments, formulas beside values, hidden rows, columns, sheets and slides)"; only sheet LIST, paragraph COUNT, slide LIST persisted; "everything else is still recoverable only by re-running the structure op".
- [DESIGN] §15 content-extent row, src 2019 — "an address INSIDE the container mints — including an EMPTY cell that exists, which in this product is routinely the finding" (absence of a value in a spreadsheet is evidence).
- [BUILT] §16 office formats, src 2052–2057 — "formulas beside their cached values" read; text bound "measured on a census of 43,282 city assets"; legacy binary (0.32%) and ODF not built.
- [GAP] Incomplete §14.4/§14.5 src 38 — "the `sheet-cell` and `slide-shape` arms have no per-cell or per-shape text in the I2 text shape, so a reading over an xlsx or pptx honestly answers nothing" (no entity references read from spreadsheet cells).
- [GAP] §16 limits, src 2195–2197 — PDF tables lose cell structure: "**A CELL BOUNDARY IS STILL NOT MARKED**: two table columns on one baseline read as two tokens separated by a space, and nothing says they were two cells — that is §15's table question".
- [EXAMPLE] §16 tier table / limits, src 2157, 2227–2232 — financial reports in the corpus: `0201-cafr-2002` "held 161 of its 175 scanned pages as zero characters of TEXT" (now admitted to OCR, M-160); "ACFR FY2023-24 page index 38 read 80 glyphs ... where tier 2 read 546" (fixed by D-608 Form XObject walk); "Budget Basics" among the corpus.
- [DOCTRINE/GAP] §16, src 2241–2249 (BOB #17, D-306, 2026-09-19) — "EVERY CORPUS-SCALE FIDELITY FIGURE IS AGREEMENT, NOT ACCURACY ... Human ground truth exists for exactly ONE page ... **Where both engines are wrong the same way, the agreement figure reads high and nothing notices.**" (digits read from scanned financial documents carry agreement, not accuracy; closing it is NOT FUNDED, DEC-74).
- [BUILT] §16 tier 3, src 2159–2165 — OCR (`pixels → ocr(tesseract-wasm 0.11.0)`) taken on the project's instance, "both steps capped at C"; "A sovereign group's instance has no OCR member until the fleet is deployed to it".
- [BUILT] §16 Google Drive, src 2101–2107, 2118–2123 — Drive exports include "CSV and TSV"; OpenDocument `.ods` read with "formulas beside values, hidden sheets"; conversion is a derivation step `convert(google-export, <format>)`, cap undetermined until calibrated (DEC-75, CAP-10, C-35.13).
- [RULING] §16, src 2259–2274 (BOB #17, D-284; DEC-32) — `reading.text_tier` is a document-level FLOOR: "A document's text is the conjunction of its pages' text, weakest governs across AND"; option (b) null REJECTED because it "misapplies "undetermined is first-class", which is for a fact that is NOT KNOWN — this one is known and summarisable"; "THE CHAIN IS THE AUTHORITY" for per-page claims (summary values vs their basis).
- [RULING] §16, src 2326–2337 (BOB #17, D-356) — NULL `page_count` "means UNDETERMINED, STATED"; "What a consumer must therefore not do: read a NULL `page_count` as zero pages, or as an error" (null ≠ zero in any computation); instance size measured 2026-09-19: "31 bundles, 88 distinct `capture_sha`".
- [DOCTRINE] §16 chain rule 3, src 2351–2352 — "Confidence where the engine supplies it, `none` stated otherwise; pseudo-confidence is refused by basis, because a self-reported 0.99 and a computed 0.99 are the same bytes."
- [GAP] §16, src 2321–2324 — CSV seam: "a re-read of a CSV will want its `reading.dialect` (FW-23's delimiter and encoding, REC-218) beside this provenance" (CSV decoding choice changes the text classified; not built here).
- [DESIGN] §17, src 2381–2386 — Route 1 query compiler: "thirty-four filterable fields, full text over the bundle's own columns"; it carries "scalar summaries of the meaning layer onto the bundle row (a strength number, a leg count), so *the meaning layer is visible as a number and unreachable as a structure*".
- [BUILT] §18.1 grade, src 2555–2557 (REC-221) — grade C "similar text (a word-multiset Dice at or above a published floor, `similarity` stated)" — a computed similarity measure published with its floor.
- [BUILT] Appendix A.2 structured dataset row, src 2681 — schema `data/dataset.json`; reachable only by "`hash:` in `query.mjs:65`"; check C-2.7 (a dataset is a hashed file, not a queryable table).

## From C4 (C4: BIO_Case_Making_v0_1.txt, BIO_Declared_Bias_v0_1.txt, BIO_Interaction_Constructs_v0_1.txt, BIO_Assistant_and_AI_Roles_v0_1.txt)

- [BUILT] CM §2 D-148 (CM 4, 207–216) — fee quote structured on a received correspondence entry: amount and currency as quoted, stated basis verbatim (hours, rate, per page), projected to indexed `action_quotes`, read by op=actionquotes; set side by side by counterparty and by request — "the machine may set quotes side by side and never judges one"
- [DOCTRINE] CM §2 D-148 (CM 214) — the record asserts only what was quoted, by whom, when, for which request; comparison conclusions are a member's — "**The record asserts only what was quoted, by whom, when, for which request.**"
- [BUILT] CM §2 D-147 (CM 256–258, 263) — derived elapsed days between lifecycle entries, and overdue status (stated due date passed with no answering entry) — the only computations; "D-128's declared-versus-observed flow measured on our own request"
- [DESIGN] CM §3 (CM 296–298) — composition rule: a case's strength is the weakest link along its chain; D-72 connection grades (A–D) — "a case's strength being **the weakest link along its chain** is the natural composition rule"
- [DOCTRINE] CM §4 (CM 327–329) — "an equality that costs nothing to produce is not evidence, grade tracks directness and never technique" (binds derived numbers/matches)
- [DESIGN] CM §Division 4–5 (CM 659–676) — weakest-link composition: an inquiry mixing strong and thin legs is worth the thin one; division lets strong claim publish at its own strength; a citing inquiry inherits a cited case's STRENGTH as one leg (case on case cannot be stronger) — "an inquiry mixing one well-supported claim with one thin one is worth exactly the thin one"
- [DESIGN] CM §What a CLAIM is (CM 708–712) — strength is DERIVED and names its weakest legs; DEC-15 project-declared required strength published beside what was reached — "strength is DERIVED and names its weakest legs"
- [EXAMPLE] CM §several claims (CM 763–764) — "the balance fell below the statutory floor": a computed comparison of a balance to a statutory threshold as a proposition
- [DESIGN] CM §DEC-32 (CM 807–812) — strength arithmetic: grounds disjunctive (max of sufficient grounds), legs conjunctive (min within ground); a suspended leg suspends its ground (DEC-18 pattern)
- [OPEN] CM §several claims 1 (CM 776–778) — ergonomics cost of stating every proposition as a full inquiry is MEASURABLE once M9 ships — "That is observable once M9 ships and should be measured, not predicted."
- [EXAMPLE/DESIGN] CM §THE three cases (CM 845, 856–861) — "spending was reduced a little" vs "spending dropped a lot" is NOT a contradiction (precision difference); IDENTIFY's acceptance test is its OVER-STRICTNESS ARM (false-conflict rate over a fixture) — "**So the acceptance test for IDENTIFY is its OVER-STRICTNESS ARM, not its recall.**"
- [RULING] CM §DEC-77 (CM 884) — acceptance rate of recommendations is MEASURED as guard against steering; competing-hypotheses matrix and auditor's Criteria/Condition/Cause/Effect are forms — "the acceptance rate is measured as the guard against steering"
- [DOCTRINE] CM §6b Resources (CM 1085–1096) — resources are a free-form attached list, no categories, no required fields, "no arithmetic over it"; don't write a constant nobody measured (MEASUREMENTS.md instinct) — "No enumerated categories, no required fields, no arithmetic over it."
- [RULING] CM §R1 + DEC-18 (CM 1169–1230) — UNDETERMINED leg: never ignored, never floored; DEC-18: an ungraded leg is INERT (contributes nothing), conclusion graded on load-bearing legs; UNRATED only if every leg ungraded; every ungraded leg named; `#weakerGrade` (store.mjs:3444-3446, unknown ranked `|| 0` below D) must not be reused unchanged — "**An ungraded leg contributes NOTHING.** Not weighed, not averaged, does not floor, does not unrate."
- [RULING] CM §R2 + DEC-21 (CM 1232–1294) — capture grade (property of an INFORMATION object, ranges over every document reached) and connection grade (property of an EDGE, ranges over every edge) are two independent measurements reported side by side, never composed into one letter; no surface displays Grade A for a direct capture — "Reported side by side because a reader needs both. Side by side is not composition."
- [RULING] CM §R3 (CM 1308–1310) — basis graph is a DAG enforced at write; refusal names the cycle; derivation has a depth bound, exhaustion → `undetermined`
- [GAP] CM §R1 residual D-159 (CM 1222–1229) — leaving a leg ungraded is the cheapest way to exclude an inconvenient one; sufficiency of three guards is D-159, "a question for use rather than for argument"
- [RULING] DB §no credence ledger D-53 (DB 281–284) — no computed or authored score for a source; findings about a source are evidence with their own grade
- [BUILT] DB §REC-207 (DB 372–375) — lens comparison by manifest hash; two absent hashes "agree on nothing" → UNDETERMINED (derived comparisons never default to equal) — "two absent hashes agree on nothing"
- [RULING] DB §HUNCH DEC-15 / DEC-104 (DB 421–468) — a hunch is the only authored grade above D (`grade_source: 'hunch'` beside `'resolution'` and `'testimony'`); DEC-104 (2026-10-01): a hunch counts for nothing in any strength reading (strength R5), which says how many hunches it left out; letter shown on the link "beside the words "not counted"" — "a hunch counts for nothing in any strength reading (strength R5), which says how many hunches it left out"
- [DESIGN] DB §Differential traversal: Regrade (DB 576–585) — mechanical regrade: hold evidence and analysis fixed, swap lens B1→B2, re-run evaluations, structured diff per conclusion with causal chain; prose only, no op (DB 17); honest limit: cannot synthesize the analysis another group would write — "regrade re-grades conclusions against the analysis that exists; it cannot synthesize the analysis a different group would have written"
- [DESIGN] DB §Sequencing (DB 605–610) — "Not a build order": bulk release (S-11 step 5) first; anchored citations → evidence attribution → mechanical bias binding; regrade last
- [BUILT] IC §B · BALLOT (IC 367–370) — arithmetic is an op "precisely so it is computed rather than transcribed" (`adminarith`, `projectownerarith`); the interface never restates the rule — principle: calculation lives in the plane, surface renders — "The arithmetic already exists as an op precisely so it is computed rather than transcribed"
- [EXAMPLE] IC §P (IC 396–397) — "one check across 58 contracts is ONE proposal with 58 instances, never 58 tasks" (aggregation of a check across a dataset of contracts)
- [RULING] IC §M DEC-82 (IC 655–675) — "letters grade evidence, bars show progress, weights mark acts"; taught: "An answer is only as strong as the weakest thing it depends on" (document copy and link side by side, never merged); "A grade tells you how easily someone else could check it for themselves; it never tells you whether it is true."; project workspace phrases ("Meets the bar", "Short on connection", "Short on capture", "Unrated"); never one combined badge (DEC-44) — "*A grade tells you how easily someone else could check it for themselves; it never tells you whether it is true.*"
- [RULING] IC §M (IC 663–665) — colour marks the scale never the value; scales never take disjoint letters (relevant to any chart/graded number display)
- [RULING] IC §L DEC-99 (IC 679–683) — WCAG 2.2 AA for every screen and the published case (page, print, file); colour never the only signal — binds charts in publications
- [RULING] IC §L DEC-122 (IC 697–698) — everything the interface needs ships inside the group's copy: "no outside fonts, analytics or trackers" (any charting library must be bundled)
- [DOCTRINE] AR §3 rule 9 (AR 84) — skill prohibition set: "no single confidence score; no connection-density ranking; machine-proposed connections never presented as connections"
- [DOCTRINE] AR §3 rule 3 (AR 67) — machine work labelled and graded as machine work; machine-read text never presented as publisher text (DEC-4); a machine-minted content row is part of a finding only when a member cites it (Bob 5.7)
- [DOCTRINE] AR §4 (AR 95) — control flow deterministic in code; judgement inside a step (model); TREC 2011: searchers' self-estimated recall erred by up to +95/−87 points, so "the model never decides when the loop stops" — "searchers' self-estimated recall erred by up to +95/−87 points, so the model never decides when the loop stops"
- [BUILT] AR §4 (AR 96) — the run verifies its own work with the PLANE'S checks: legs cite existing addresses; strengths compute per axis; version differs in substance; OR-branches pass the independence check (D-195); each refusal a C-number
- [GAP] AR §7.3 / §8 (AR 129, 139, 170) — EXTRACT production "a proposed table structure once an engine is measured" NOT BUILT (waits on EXTRACTION-BREADTH-DESIGN §3.3 engine measurement); cleaned/normalised text no producer — tables from documents are not yet machine-proposed — "a proposed table structure once an engine is measured"
- [BUILT] AR §7.3 point 6 / §8 (AR 145, 170) — instrument: minted-to-cited RATIO per run and per project/document, published — "**if it never falls, the assistant is manufacturing citable-looking passages and the ratio is how anyone finds out.**"
- [BUILT] AR §8 (AR 170) — proposed reading grade COMPUTED from what the reference names: B for an identifier, C for a name, never A
- [DESIGN] AR §4 (AR 99) — running-session surface: budget recorded and never SHOWN (F11)

## From C5 (C5: INVESTIGATIVE-SESSION.txt, ASSISTANT-PILOT.txt, RETRIEVAL-SUBSTRATE.txt, CONTRADICTION-IDENTIFY-DESIGN.txt, FINDINGS-WORKPLAN.txt, RETRIEVAL-PROBE.txt)

- [BUILT] INVESTIGATIVE-SESSION §3, src 237–243 — the run publishes a `holdings` count that counts a document once with its versions (grouped by `address_norm`); an item with no captured version counts as itself; a refused read is published UNDETERMINED — counting with a stated basis.
- [DESIGN] INVESTIGATIVE-SESSION §3, src 218–222 — evidence standard is per-project and "a pair, never a single number" (`required_strength`, DEC-17/21); there is no single "current evidence standard" for a shared inquiry.
- [BUILT] INVESTIGATIVE-SESSION Incomplete §12(c)/(a)–(b), src 22–25 — D-195 shared-origin independence is computed in code (`Store#independenceOf`; `op=partitionindependence`, `op=versionstrength`'s `independence`), shown before the member's per-set affirmation (UI-74, UI-75, UI-88).
- [DESIGN] INVESTIGATIVE-SESSION §5, src 367–378 — Bob: composition cannot be computed from typed relationships; "The calculation stays as simple as it already is. The intelligence goes into how the legs are formed and weighted, not into a richer set of relationships for the record to compute over."
- [DESIGN] INVESTIGATIVE-SESSION §3, src 294–299 — DEC-32's "settled arithmetic runs over the partition and the AND/OR relationship"; a version carries the ground partition and relationship, not a flat leg set (REC-42, SWEEP C5).
- [DOCTRINE] INVESTIGATIVE-SESSION §5, src 383–397 — "ASSIGN STRENGTH VALUES" MEANS COMPOSING, NEVER MINTING: a leg's grade is a fact about METHOD — A source's own identifier, B identifier matched in content, C correspondence, D testimony; grades arrive from the record (`earnedBasisRegistry`, `store.mjs:8808`); DEC-18 ungraded leg is INERT and NAMED.
- [DESIGN] INVESTIGATIVE-SESSION §6 rules 5–6, src 486–494 — the effective strength pair is computed over the CURRENT version; exploring an unaccepted version is done "by CALCULATING OVER IT, never by making it current" — "the strength function takes an argument naming which states to include."
- [DESIGN] INVESTIGATIVE-SESSION §7, src 513–516 — a project's `required_strength` is read with "strictest-wins" (`#requiredStrengthFor`, `store.mjs:5154`).
- [DESIGN] INVESTIGATIVE-SESSION §7.1 BOB #16 design, src 689–690 — one reader, two reads, "so the two cannot disagree; the builder proves it byte for byte" (BOB.md rule 7: "the same quantity, from the code") — reproducibility discipline for any derived quantity.
- [DESIGN] INVESTIGATIVE-SESSION §11 rule 2, src 872–874, 885–886 — AI question creation counts against a declared `surfaces` bound (`RUN_BOUNDS`, `mints` precedent); refused when none declared (C-66.3/.4) — bounded machine output counted in code.
- [DOCTRINE] INVESTIGATIVE-SESSION §12, src 1072–1081 — "STRENGTH IS A PAIR" over the capture axis and the connection axis, "never composed into one value" (DEC-21/DEC-44); DEC-32 arithmetic: "MIN over AND-related legs, MAX over OR-related branches, MIN within a branch"; default AND, the conservative direction.
- [DESIGN] INVESTIGATIVE-SESSION §12, src 1082–1093 — anti-gaming keystone: structure authored BEFORE strength shown; D-195 independence derived from content-addressed provenance and surfaced — "derived informs, authored binds"; the accept ceremony shows "your answer fails only if ALL of these fail" and the member affirms independent sufficiency per branch.
- [DESIGN] INVESTIGATIVE-SESSION §12, src 1123–1132 — the strength function takes an argument naming which states to include (default accepted); "The return carries the state set that produced it" ("a strength separated from its filter is a misread waiting to happen"); a what-if value "is member-facing exploration and never a record value", its presentation IN-BAND (DEC-40: a filtered rendering states its filter; negative control strips the filter line).
- [DOCTRINE] INVESTIGATIVE-SESSION §13, src 1157–1161 — "No case-level strength exists — that is R2's refused composition at case altitude (DEC-44's own negative control)"; each finding carries its leg configuration "so it can be reproduced in BIO".
- [DESIGN] INVESTIGATIVE-SESSION §13, src 1162–1168 — DEC-34's per-page header puts case id, edition, authors, declared bias, both floors, hash and verification pointer on every page, plus the basis-version name — a page separated from its document still names what it renders (relevant to charts/tables in publications).
- [DESIGN] INVESTIGATIVE-SESSION §14b.2, src 1449–1468 — two retrieval routes: Route 1 query compiler (`query.mjs`) "34 filterable fields, 5 FTS columns (`title`, `body`, `meta`, `locator`, `authority`)"; Route 2 meaning tables (`readings`, `reading_refs`, `resolutions`, `connections`, `inquiry_basis`) not reachable by the compiler; scalar summaries on the bundle row mean "the meaning layer is visible as a number and unreachable as a structure" — "the session can see that a conclusion scores 0.7 and cannot see what it rests on." (D-222 precondition.)
- [GAP] INVESTIGATIVE-SESSION §14b.2, src 1475–1484 — D-164: legs are document-grain; "the record cannot yet cite the sentence" (DEC-23 extent and extraction method); D-168: `op=cite` is type-only so RETIRED information is citable. (Front matter src 27–28 says D-164 CLOSED 2026-09-22 and leg `content_id` built; whether composition reads it is UNDETERMINED.)
- [DESIGN] INVESTIGATIVE-SESSION §14b.4 table, src 1514–1527 — "do not let the model decide control flow that should be guaranteed": deterministic code decides passes, loop stop, fan-out, `suggested`-only writes, dedup, log writing, fences; the model judges what to search for, what reports mean, what a version says — evidence: "TREC 2011 found searchers estimating their own recall erred by up to +95/−87 points".
- [DESIGN] INVESTIGATIVE-SESSION §14b.5, src 1553–1569 — plane-side pre-write checks with named C-codes: legs exist and are reachable at the address (beyond type, D-168); "the strengths compute — the version's arithmetic runs PER AXIS over its declared ground partition and produces a pair"; differs in substance; OR-branches pass D-195 independence ("the Judith Miller error with arithmetic behind it"); nothing boilerplate.
- [DESIGN] INVESTIGATIVE-SESSION §14c constraints table, src 1631–1640 — one visibility compilation point (`viewerPredicate`, `query.mjs:189`; `GATE_MARK` throw); gate as WHERE predicate "283 ms against 5 ms for a facet sidebar at 20,000 bundles"; meaning-layer answer is a CANDIDATE LIST (REC-36 withholds whole row); envelope never bare array; `limit` = cap actually applied; "Hidden and absent answer identically; a published `total` is gated with the rows"; "MAX_COMPOUND = 4" (workerd ceiling FIVE, `query.mjs:588`); every arm keys on `fts_id`.
- [DESIGN] INVESTIGATIVE-SESSION §14c options, src 1644–1669 — A set-algebra arm (`leg:hunch`, `resolves:>=B`, `concerns:ENT-1`; grain collapse; grade columns unindexed); B second surface (not recommended: contradicts D-15 and `query.mjs:701-705`); C new statement shape (seventh beside `{page, count, ids, snapshot, facets, facetScan}`, `query.mjs:827`) returning meaning-grain rows; D hybrid; E per-question ops (131-entry table). Recommendation D staged A then C. Front matter src 26: A LANDED (PL-8), C BUILT (9.content-search).
- [NEED] INVESTIGATIVE-SESSION §14c recommendation, src 1667 — A discharges D-223 (enumeration of hunch debt) "at inquiry grain, which is the grain a group asking "what is our exposure?" actually wants" — an aggregate question members ask.
- [BUILT] INVESTIGATIVE-SESSION §14c Related finding, src 1671–1676 — `resolutionsForCapture`, `documentsConcerning`, `connectionsFor` clamp to 500 default / 5,000 ceiling, publish `limit` after clamping beside `truncated` (REC-60, IC-25); residue: six `truncated` figures over in-memory collections ungraded (D-369).
- [DESIGN] INVESTIGATIVE-SESSION §15, src 1682–1692 — instruments: does a run ever return nothing supportable ("If it never returns empty it is manufacturing"); accepted-to-suggested ratio; rejection record read as a pattern; where/why the run stopped.
- [DESIGN] INVESTIGATIVE-SESSION §16, src 1705 — withdrawn: recording that a run reproduced an existing version as corroboration — "Two runs of the same skill over overlapping evidence are heavily correlated, so their agreement is weak evidence".
- [DESIGN] INVESTIGATIVE-SESSION §16, src 1708 — withdrawn: "Effective strength" as one number — "The refused single number — DEC-21/DEC-44's four refusals: a PAIR over two populations, never composed".
- [DESIGN] INVESTIGATIVE-SESSION §18 IS-7, src 1790 — strength pair per axis, MIN/MAX per DEC-32, state-set argument and state set on return, ungraded inert-and-named, hunches excluded, what-if in-band; NC: strip the filter/state-set line and the harness fails (DEC-40).
- [DESIGN] INVESTIGATIVE-SESSION §18 IS-8, src 1791 — NC: a two-finding case must never show a single case-level strength (DEC-44); DEC-34 page header including version name.
- [GAP] ASSISTANT-PILOT §2, src 88 — FIND is "run read ops → ANSWER with record citations + the LEVEL searched"; no calculation, aggregation or dataset step is designed for the assistant (none in ASSISTANT-PILOT beyond reads).
- [BUILT] ASSISTANT-PILOT Incomplete §1, §4, src 13, 16 — measured 2026-09-14: 614 authored `detail:` strings (511 in `store.mjs`); 171 entries in `index.mjs`'s `OPS` table; all 12 `MACHINE_CANNOT_*` codes carry a canned translation (SK-1 measured 1 of 12 on 2026-08-08).
- [BUILT] RETRIEVAL-SUBSTRATE Status/Actuals, src 3, 167–188 — facet counts (aggregates over the whole filtered set) shipped; probe actuals 3–11ms at 20,000 synthetic rows ("a facet count is an aggregate over the whole filtered set and does not track result size"); probe actuals never re-measured against shipped ops.
- [DESIGN] RETRIEVAL-SUBSTRATE "Why probe 2 exists", src 45–56 — "Searching is mining, and mining is a component of the research, analysis, reporting, and action workflow"; five verbs search, filter, list, sort, select (select = "a stable, complete result set, not just the visible page").
- [DESIGN] RETRIEVAL-SUBSTRATE Findings 1–3, src 63–126 — engine has AND/OR/NOT, phrases, prefix, `NEAR`, `bm25()`, `snippet()`, column scope, `json_extract`/`json_each`, generated columns, `EXPLAIN QUERY PLAN`; frontmatter heterogeneous (`information@1/@2`, `problem@1`, `project@1`); WIDE typed columns beat EAV (build ~28us vs ~258us; index ~430B vs ~2.4KB); JSON column for the long tail.
- [GAP] RETRIEVAL-SUBSTRATE Incomplete §Recommendation, src 10 — "NO generated column and NO expression index has ever been promoted"; "The long per-schema tail is reachable and is not indexed."
- [GAP] RETRIEVAL-SUBSTRATE Incomplete §Actuals, src 11–12 — substrate limits: workerd binds ~100 variables per statement and five terms per compound SELECT (`SELECTION_ID_CHUNK` 64, `MAX_COMPOUND = 4`, `npm run probe:limits`); "The CLASS stays open by its nature" — relevant to any heavy analytic query in the DO.
- [DESIGN] RETRIEVAL-SUBSTRATE Recommendation, src 213–229 — one substrate in the DO: FTS5 rowid-aligned with metadata; typed indexed columns; JSON column with promoted generated columns; AND=intersect, OR=union, NOT=except with stable id tiebreak; "Facet counts as `GROUP BY` on an indexed column over the current filtered set"; maintained transactionally in the same write (D-26: "one call in, one answer out, run where the data is").
- [RULING] RETRIEVAL-SUBSTRATE Settled design item 4, src 246–249 — "A selection is a server-side construct ... The plane snapshots a result set and an action refers to it by handle, so the set an operator selected is the set the action lands on even if the corpus moves in between" — stable sets for acting on (and computing over) a selection.
- [DESIGN] RETRIEVAL-SUBSTRATE "What the measurements constrain", src 201–209 — select-all is a distinct operation (37ms, ~400KB ids at 20k); "the result set must be stable between the moment of selection and the moment of action".
- [EXAMPLE] CONTRADICTION-IDENTIFY §1, §7, src 36–37, 129–131 — numeric imprecision is NOT contradiction: "spending was reduced a little" vs "spending dropped a lot"; fixture `precision` pairs: "rounded against exact figures, "approximately" against a stated number, a summary against the table it summarises" — comparing figures across documents is part of the work.
- [BUILT] CONTRADICTION-IDENTIFY §7, §9, src 140–150, 178–193 — gate = FALSE-CONFLICT RATE "stated with the corpus size and per key", recall reported beside it ("A detector that ABSTAINS escapes a false-conflict gate"); M0-71 baseline 0/17 false conflicts, recall 2/9, 14/26 `undetermined`; REC-147 judgement 0/17 and 9/9 over three runs by two model families (M-162); THRESHOLD 0 PROVISIONAL (BOB #31).
- [GAP] CONTRADICTION-IDENTIFY Incomplete §7, src 9, 13 — the 26-pair SYNTHETIC corpus "NO LONGER DISCRIMINATES"; a real-document corpus "several times larger and with hard negatives" is the binding gap.
- [DESIGN] FINDINGS-WORKPLAN Family B3, src 46–47 — MEASUREMENTS.md entries for verified numbers (105/105 suites; 34 fields/5 FTS; MAX_COMPOUND rationale) "with date + instrument" — the reproducibility discipline for any stated figure.
- [DOCTRINE] RETRIEVAL-PROBE "What was measured", src 71–79 — agreement standard from `op=audit`: "an index that disagrees with a scan is worse than no index"; the harness first plants a divergence and confirms the check catches it; the 30-document corpus "first passed for a reason that was not verified ... which is the whole argument for measuring rather than asserting."
- [DESIGN] RETRIEVAL-PROBE "What the numbers say", src 109–122 — scan cost is linear in corpus (~22ms at 20k, ~1s at a million per search); FTS5 tracks result size; exported index "Its speed is bought with movement and staleness" — informs where whole-corpus computation is affordable.
- [GAP] RETRIEVAL-PROBE Incomplete §Actuals, src 9 — never re-measured against the built FTS5 path; Conversion Plan step 6 benchmark owed; prediction table not in corpus (D-28).

## From C6 (C6: BIO_Publication_v0_1.txt, BIO_Intake_Doctrine_v1_1.txt, SOURCE-ACCESS.txt, AUTHORITY-AND-TRUST.txt, BIO_Communications_Platforms.txt)

- [DESIGN] Pub §2 L80, §3 rule 14 L210-218 (D-450, BOB #32) — a grade/bar is a PAIR of axes; "an axis nobody set is null"; "it never defaults a value and never omits the key"; requiring both "would force a member to invent a bar ... a gate pressuring an invention"
- [BUILT] Pub §3 rule 12, L156-160 (D-442, REC-170) — frozen strength pair per member per case; where cases disagree, `strengthByCase`, `strength: null`, `strengthUndetermined: CASES_DISAGREE` — derived values keep their basis and conflict is stated, not resolved
- [RULING] Pub §3 rule 5, L132 (C-21.2, D-598) — inheritance is per axis: a leg on a published case "cannot be stronger than the case beneath it on either axis"; evidence documents graded on their own axis (C-2.8 testimony, capture grade)
- [RULING] Pub §3 rule 16, L229-235 (D-246, BOB #32) — a published rendering is verified by its pixels (`pixels_sha256`), file hash informative only — "A check that fails honestly on another runtime is a check that gets switched off." NOT BUILT (bears on reproducibility of rendered artefacts such as charts)
- [RULING] Pub §3 rule 17, L236-242 (D-470, BOB #35) — gate stamp names the check-catalogue version; any changed check moves the version — reproducibility principle for what judged a document
- [RULING] Pub §5C L397 (DEC-112, DEC-82) — public page: each finding "Relied on · meets this project's bar (capture B, connection C)", never a bare "meets"; "a case has two strengths, never one"
- [RULING] Pub §5C L399 — the complete edition carries "the grading method, so a grade can be recomputed by hand" and "How to check this case yourself"
- [RULING] Pub §5C L401 — case file carries "the version of the grading method and publication checks, carried inside the signed case document"; "An open specification and a standalone open checker let anyone recreate a case without Civicsmith"; split into fingerprinted parts, "never trimmed"
- [RULING] Pub §5C L408 (DEC-112 import) — recreation: "each grade recomputes the same by the stated method version"; outcomes Recreated / Recreated in part / Did not recreate; "Recreating is not endorsing" — the reproducibility standard any derived number in a case would need to meet
- [RULING] Pub §5B L380 — the activity level is a computed measure whose "method is published"; "Only acts members take count, never the assistant's work, and volume does not count"
- [BUILT] Pub §6A.3 L520-525 (REC-148, IC-229) — in-band quartet from ONE function `inbandQuartet` (`bio-plane/src/inband.mjs`): SHA-256 over answer, date, author, both floors from `required_strength`; "no second hasher exists" (single-source computation discipline)
- [DESIGN] Pub §6A.3 L528-531 (UI-69) — the surface "computes none of the four"; stamp byte-equal to the plane's (surface never computes derived values itself)
- [GAP] Pub §9 L769 — complete edition, case file, standalone open checker and import-with-recreation "NOT BUILT (today's container holds no rendering and no capture bytes)"
- [EXAMPLE] Int §1 L166-173 — the Sewer Service Fund transfer series (auditor report, fund statements, a budget) as one line of evidence; "consumers of the store reason about evidence, and the reference graph (cites edges) should carry evidentiary dependency, not file management" (the canonical early example is financial: fund transfers across budget/statements)
- [DESIGN] Int §2 L243-246 — classification per State Rules Information schema: "fact, analysis, or judgment; crucial or supporting" (analysis is a recorded class of information)
- [DESIGN] Int §2 L248-251 — "The normalized dataset with its content hash, where the document yields structured content. The hash is over the normalized dataset, never the raw capture (State Rules 4.1)" — structured data identity is the normalised dataset
- [DESIGN] Int §3a L442-444 — "weight is the same everywhere in this doctrine: source authority, times chain integrity, times corroboration"
- [DESIGN] Int §3a L446-451 — "Corroboration is a first-class provenance concept: an edge between independent records attesting the same fact"; "evidentiary weight is readable from the store, not asserted in prose"
- [DESIGN] Int §3 L340-342 — "a claim about evidence is only as strong as its weakest named layer" (weakest-link grading)
- [RULING] Int §4 L553-559 (operator ruling 2026-07-27) — "Verification does not promise that anyone has confirmed the accuracy of anything stated in a document ... it APPEARS to be what it claims to be"
- [GAP] Int §4 L558-559 — "Accuracy and credence are separate questions the catalog does not yet model"
- [DESIGN] Int §5 L670-675 — slugs name the evidence, "not the document (sewer-transfer-series, not auditor-report-2022)"; criticality "editorial judgment recorded, not computed"
- [DESIGN] Int §3c L496-502 — the honest limit: single-step verification covers structure and integrity; inner-layer semantics need each layer's own standard tool; "Depth of verification is the outsider's choice, and every depth has a non-BIO path" (reproducibility discipline)
- [DESIGN] Int §3b L474-475 — "Manifests and provenance blocks are documented plain JSON, readable without software"
- [DESIGN] Int §7 L712-717 — the session "verifies the capture against archived bytes, extracts the canonical dataset, computes the hashes, runs the gate locally"; C-2.7 rebase: "the dataset's canonical hash becomes content_hash, the capture hash stays authoritative in the register"
- [DESIGN] Int §10 L881-883 — the staging/expunge decision rests on "the observed rate of may-not-hold discoveries in real sweep yield and the observed cost of expunge" (decisions deferred to measured rates)
- [DESIGN] Int §Cross-reference L898-904 — "Declared bias ... binds ABOVE this doctrine, at evidence, analysis and conclusions"; intake and release are lens-independent
- [EXAMPLE] SA §The measurement L68-94 — controlled measurement: one URL, "varying ONLY the user-agent. Eight consecutive requests per string"; "the two variables were perfectly confounded until one was varied alone" — the record's model of a reproducible measurement
- [EXAMPLE] SA §What is reachable now L150-154 — the financial corpus the project needs: Annual Comprehensive Financial Reports, Fiscal Year 2025-2027 Budget, Revenue-Expenditure Reports, the 2024 ACFR PDF (6.0 MB), the adopted budget book (32.5 MB) — budget-vs-actuals source material
- [DESIGN] SA L157-158 — "The budget book at 32.5 MB will capture multipart and skip subresource parsing, which is correct behaviour" (large financial documents)
- [EXAMPLE] SA §Two findings L131-133 — robots.txt "85 lines, a single `User-agent: *` stanza, 82 `Disallow` rules. 63 of the 82 are Public Ethics Commission publications" (counts stated exactly)
- [EXAMPLE] SA §Update L197-205 (D-94, `scripts/ua-probe.mjs`) — "A nine-rung ladder removing one component per rung, second-path confirmed"; "removing the contact URL flips admission 200 to 403 uniformly" — measurement with a script, full table in MEASUREMENTS.md
- [EXAMPLE] SA §Update L213-216 — "eleven captures through the deployed 0.46.0, ten admitted, one 403 on a cold back-to-back pair, which is burst-shaped rather than categorical"
- [DESIGN] SA §RULED L249-256 — cost arithmetic table: blocking "O(1) for them and total for us"; allowlisting "O(n) for both, forever" — "A mitigation that gets more expensive the better the project does is not a mitigation"
- [EXAMPLE] A&T §renderer L57-58, L66 — GIS data and CAD drawings ("a city parcel layer") as captured material whose authority follows the data
- [RULING] A&T §transitive L139-142 — "Grade becomes a function of the chain, not of the method. A direct fetch is one hop. An archive-sourced capture is two, with the weaker hop unsigned, and grades below a direct capture"
- [DOCTRINE] A&T §transitive L150-154 — "what is inherited is the FACT OF PUBLICATION, never the CREDIBILITY OF THE CONTENT. An archive attests that a server sent these bytes at this instant. It attests nothing about whether the figures in them are right" — avoids "a shared reputation score, which `BIO_Design_Requirements_v2` section 4 rules out"
- [DESIGN] A&T §transitive L147-148 — "Confidence is recorded per hop, not as one number, so the reason stays legible"
- [DESIGN] A&T §alternative source L210-211 — "Two sources agreeing is STRONGER evidence than one source repeating"
- [DESIGN] CP §Function 2 L141-149 — Function 2 hosts "published analyses, evidence packages, and other work products"; supports "all file types (spreadsheets, PDFs, documents, images)"
- [DESIGN] CP §Function 2 L163-176 — OSF "purpose-built for transparent, reproducible research"; "For groups doing rigorous analytical work that want formal version control and reproducibility infrastructure, OSF is the stronger choice"
- [DESIGN] CP §Function 3 L212-215 — "The directory data should be maintained in a structured, downloadable format (CSV or JSON) so that any group can maintain a local mirror"
- [EXAMPLE] CP §Next Steps L348-350 — "OpenGov data" (municipal financial open-data portal) in the sewer-fund evidence; Risk L287 "The evidence itself (facts, source documents, analysis) should be fully public"

## From C7 (C7: BIO_State_Rules_Consistency_v1_5.txt, BIO_Membership_Architecture_v2.txt)

- [DESIGN] SR §2.2, src 388–391 — all structured payloads ("extraction outputs, normalized datasets, reference-heavy registers") are JSON under `data/`; YAML only in frontmatter — the record's only stated home for datasets.
- [DESIGN] SR §2.3, src 400–407 — description-as-truth: for every rendered artifact (SVG or otherwise) the authoritative content is a machine-readable description in frontmatter (the `visuals` array); the rendered file is a regeneratable view; stale visuals flagged at write — "the authoritative content is a machine-readable description in frontmatter (the visuals array); the rendered file is a regeneratable view." (charts in publications).
- [EXAMPLE] SR §1.1, src 264–274 — `INFO-2026-0001-sewer-acfr-fy24`, `INFO-2026-0002-opengov-transfers-fy20-25`, `PROB-2026-0001-transfer-relabeling`, `PROJ-2026-0001-sewer-fund-diversion`: the founding example is a budget/fund-transfer analysis across fiscal years (ACFR vs OpenGov).
- [DESIGN] SR banner, src 5, 16, 29 — census operations count and never rewrite (`op=digestcensus`, `op=snapkeycensus`); a lost creation row is stated as undetermined — counts with stated undetermined, a reproducible-count pattern.
- [RULING] SR §2.4 D-256, src 482–484 — enumeration of the affected set sorts each as provably wrong, provably right or undetermined, and "reports the three counts separately".
- [DESIGN] SR §4.1, src 679–681, 697–698 — Information record files: `data/*.json` "extraction outputs in tidy/long form", `snapshots/*` (raw captures: WACZ, PDF, exported datasets); `content_hash` is the hash "of the canonicalized normalized dataset, not raw capture".
- [DESIGN] SR §4.1 snapshot rule (Tech Arch 7.2), src 761–764 — three-layer capture "keyed to a stable query definition": raw capture (evidentiary), canonicalized normalized dataset (hashed and diffed), rendered view — "Hash the normalized dataset." (a reproducibility basis for dataset-derived numbers).
- [DESIGN] SR §4.1, src 753–756 — change detection on a verified item records `modified` with both versions preserved and "a change record appended" (dataset diffing over time).
- [EXAMPLE] SR §3.1 / §3.4, src 566, 665–666 — Focus title "ACFR transfers-out disagrees with OpenGov FY23-24"; "Cluster of three transfer-labeling focuses elevated together into PROJ-2026-0001." (reconciling two financial datasets).
- [EXAMPLE] SR §4.5, src 945–956 — claim C-014: "Transfers from the Sewer Service Fund continued in FY 2023-24 under cost-allocation labels." cites INFO-2026-0002, snapshot `opengov-fy24.json`, hash, as_of — a derived budget claim cited to a dataset snapshot.
- [EXAMPLE] SR §4.6, src 990–991 — annotation: "The FY24 number may include a one-time insurance true-up; check note 14 of the ACFR before treating this as the pattern continuing." (analysis caveat on a derived number).
- [DESIGN] SR §4.3, src 844–846 — Project record files: `analysis.md` "the cumulative analytical record, revised in place, never a changelog"; `workproduct.md` the derived view.
- [GAP] SR §4.1–4.5 — no record of a calculation (code, inputs, formula, result, grade) is defined: derived numbers live in prose (analysis.md) or as claims citing a snapshot.
- [DESIGN] SR §5.1 v1.5a, src 1035–1041 — `corroborates` (independent support) distinct from `cites` (dependency): "Two documents that agree without either deriving from the other are corroborating" — independence of sources as a recorded relation.
- [RULING] SR §5.4 DEC-70, src 1086–1092 — strength arithmetic (DEC-32): "relative contributions shift under DEC-32's arithmetic"; "a severed leg contributes nothing to strength, gates nothing and counts toward no bar; the connection INFORMS, never binds."
- [DESIGN] SR §6 I-8, src 1197–1200 — every load-bearing claim at internally_checked or above has a citation-register entry with cites, snapshot, hash and as_of; "every verified Information object has a snapshot and a hash that matches its normalized dataset."
- [DESIGN] SR §6 I-20, src 1298–1299 — the mechanical envelope includes the append-only `data/changes.json` (change records) and `data/provenance.json`.
- [GAP] SR §7 D-209 (BOB #32), src 1321–1325 — the repair-reachability walk checks only op existence where a repair names no state move; "that is buildable, and it is not built."
- [DESIGN] SR amendment Action layer (K171), src 1804 — `CONS-` (consequences) is a layer-9 record type (where calculation of consequences lives); no schema here.
- [RULING] SR cross-reference (DEC-15, DEC-20, D-188), src 1670–1688 — HUNCH DEBT ("a connection graded ahead of its evidence", DEC-15) blocks ratification until evaluations re-run; ordinary bias debt is DISCLOSED and blocks nothing — "a hunch inflates a GRADE, so publishing over one states a strength that is not true".
- [DESIGN] SR §8, src 1577–1593 — C-18.3 (same capture.sha256 in two registers = missed corroboration), C-18.4 (warn: crucial document with neither co_archive nor timestamp), C-18.2 reserved "verified-requires-Grade-B-or-better floor, recorded and deliberately not entered".
- [DESIGN] MA status, src 13 (D-447; M-122) — `op=search` "computes relevance over the rows the viewer can see and publishes an ORDER, never a score".
- [DESIGN] MA status/Incomplete §7.9, src 14, 39 (D-464; M-124) — every count a member session is served (`op=stats`, `op=searchindexcheck` counts, `op=selectionlist` bytes) is taken through the caller's `viewerPredicate`: counts are viewer-relative.
- [DESIGN] MA status/Incomplete §7.9, src 14–15 (D-479, D-497) — the project directory answers at most `PROJECT_DIRECTORY_LIMIT`, "publishes the bound it applied and says whether more exists — measured by reading one past the cap, so a cut page and a complete one can never read alike" (a bounded aggregate states its own truncation).
- [EXAMPLE] MA §1.3, src 140 — "who can read an ACFR" (financial-statement analysis needs a CPA-type expert).
- [DOCTRINE] MA §4.10 (BOB #19; REC-155), src 576–580 — calibration: "The fence that matters here is therefore NOT about who may measure; it is that a measurement may never move a GRADE" (`CAL_CANNOT_REGRADE`); a scheduled re-probe is a machine act by construction.
- [DESIGN] MA §6 D-158 (C-63), src 663–672 — `op=signerlist` serves a derived `attests` "computed from the SAME predicate the two gate readers use", with `attests_why` naming a stored fact "and carrying the literal `undetermined` for a combination the plane cannot account for" (a derived value from the deciding predicate, with undetermined).
- [DESIGN] MA §4.7, src 300–317 — removal arithmetic stated as a table and argued ("Counting the target in the denominator is what makes removal impossible at two without needing a special case").
- [RULING] MA §7.9 BOB #15 (MEMBER-KNOWLEDGE-DESIGN §5), src 907–908 — "a COUNT is a disclosure of existence": every aggregate shown to a member is subject to that member's sight.
- [DESIGN] MA §7.9 D-480 (M-142), src 891–905 — "where a bounded read publishes what it could not reach, the BOUND is an answer, so whatever is allowed to fill the page is subject to this section exactly as the rows are." A hidden project's citations displaced a member's own divergence finding from her queue (`item_count` 1 → 0) before the fix.
- [RULING] MA §7.9 BOB #32 (D-486, M-131), src 876–889 — evidence produced by a hidden project's run stays in the shared corpus "and in every count of it"; only the observation-log ATTRIBUTION rows leave tallies (a count of run rows is "*not its existence* arriving as an aggregate").
- [DESIGN] MA §7.9 BOB #23, src 979–980 — the spent counter range is not counted or listed: "a count is how many gated objects were ever minted, hidden ones included (BOB #16)".
- [GAP] MA §7.9 REC-153 (M-68), src 1030–1038 — runs stored under a mislabelled kind are "UNDETERMINED — not counted" ("no op enumerates runs"): a stated undetermined count rather than an estimate.
- [DESIGN] MA §7.14 D-479, src 1290–1298 — the directory "publishes beside its list the bound it APPLIED and whether more exists. `truncated` is MEASURED, by looking one project past the cap, never derived from the list returned — a full page and a complete answer read alike otherwise." "A cut that is not said turns an owner's choice into its opposite." (General rule for any bounded result set.)
- [DESIGN] MA §7.14 REC-150, src 1357–1358 — `PROJECT_REQUESTS_LIMIT` lists also publish `limit` and `truncated`.
- [DESIGN] MA §8, src 1425–1431 — a verified export "carries its own manifest and is checked on both sides: every file hashed on the way out, every bundle's history chain and base links re-derived on the way in, every registered capture byte-compared. The receiving instance trusts nothing the sending instance asserts." (reproducibility by re-derivation).
- [DESIGN] MA §8.2, src 1409–1415 — published material is content-addressed; "Any member, or any stranger, can rebuild and independently verify the published record" with `ssh-keygen` and the doorbell.

## From C8 (C8: MEMBER-KNOWLEDGE-DESIGN.txt, EXTRACTION-BREADTH-DESIGN.txt, DOCUMENT-PROFILES.txt, OFFICE-FORMATS.txt, CONTENT-SEARCH-DESIGN.txt, SCHEDULER.txt)

- [DESIGN] MKD §3 L113. Grade composition — "DEC-32's weakest leg across AND, strongest branch across OR — and simply sees one more axis."
- [RULING] MKD §5 L233–261, BOB #15 2026-09-18 — "A COUNT IS A DISCLOSURE OF EXISTENCE, so the rule above binds counters too". `leads` was removed from `op=stats` for every class. `observationsNonLead` counts non-lead rows for every caller. "A SIZE IS A SIGNAL TOO": `dbBytes` is admin-only.
- [RULING] MKD §5 L256–261, BOB #32 2026-09-24 (D-464, D-486). The rule's scope is existence-private constructs (the lead, a HIDDEN project). "counts and frontier tallies served outside its sight subtract those rows". Other aggregates "naming no bundle, subject or address" are operator facts (REC-110).
- [DOCTRINE] MKD §5 L253–255 — "one name, one quantity" (BOB.md rule 7). The wire key `observationsNonLead` "names its predicate".
- [GAP] EBD §2 row 5 L61. Budget or dataset (Bob named it, D-66): ~520±238. Two arms: budgets (money density) and datasets ("a table of distinct, value-carrying records"); 6 of the 10 datasets are one series (parcel-exemption CSVs). "No reader is written."
- [GAP] EBD §2 row 6 L63, Incomplete L15. Financial report ~58±80 (~89±71 whole corpus); no reader. `2024-Single-Audit-Report-PDF.pdf` and `CAFR-2020.pdf` "carry NO TEXT LAYER and are invisible to the instrument".
- [DESIGN] EBD §2 row 5 L62 — "a dataset is a FORM and the ruling is about a subject, so a workbook of audited figures is honestly both and is reported multi-class."
- [DESIGN] EBD §3.1 L79. In an office container "the cells ARE the structure". On a PDF, table structure would be a `table(engine)` derivation "calibrated like OCR".
- [BUILT] EBD Status L5, §3.2 L86–90 (FW-19, 2026-09-18). The `sheet-range` `{sheet, range}` (A1-style), `doc-table` `{table, cell?}` and `image` reference exist, with the `cited_as` column.
- [GAP] EBD Status L5 — "a workbook's defined tables and named ranges as units (D-415)" are NOT built.
- [CONFLICT] EBD §3.3 item 1 L99 says `sheet-range` comes "where a defined table or a named range exists in the workbook, from it". The Status (L5) says that part is not built.
- [GAP] EBD Incomplete L16, Status L7, §3.3 L103. PDF table recognition was MEASURED NO-GO (M-55): it recovered the unruled table "and the RULED one not at all". "a table on a PDF page is a `pdf-page` rectangle whose text is the page's — content, honestly, without the structure claim."
- [DESIGN] EBD §3.1 L80. A chart or map cited AS ITSELF is bytes (`cited_as: bytes`) with no extraction chain. Text read off it is separate OCR content, capped at C.
- [RULING] EBD §6 L158–159, DEC-74 (BOB #11, 2026-09-14). An external OCR tier above C is not funded. It is reconsidered "only when an image-only document is LOAD-BEARING in a real case and C is below that project's bar".
- [DOCTRINE] EBD §5.2 L145–147. Two producers publish an `undetermined` field that counts different things (characters versus page markers), so the rule "performs NO COMPARISON" — "A same-named field is the likeliest place it fails, because the name is what makes the comparison look already checked." From D-283: "a character count is not a quality measure."
- [NEED] OF L117–122 — "A formula is different evidence from its result." "For accountability work the DERIVATION is frequently the finding — how a total was reached, which cells feed a projection, what a "budgeted" figure is actually computed from." "The record should hold both and say which is which."
- [DESIGN] OF L127–128 — "A hidden XLSX sheet is a first-class finding, and it is invisible in every rendered form of the document."
- [DOCTRINE] OF L133–136 — "None of this is CAPTURE deciding what things MEAN ... A formula is structure; whether a formula matters is content."
- [BUILT] OF Status L3–4, L50–61, Incomplete L18. The FORMAT axis is built: nine `registerFormat` entries. Extracted: text, links with element refs, "formulas beside cached values, tracked changes, comments, speaker notes, hidden rows, columns, sheets and slides, core properties".
- [DESIGN] OF L97, L107–110. A cell reference such as `Sheet1!B14` — "the first time the record can cite something finer than a document without inventing an anchor scheme."
- [GAP] OF Incomplete L18 — "a workbook's grid is reachable as cells and as text and never as a table". Charts and drawings "are not read at all"; the content of embedded files is never opened. (This is partly stale against EBD FW-19.)
- [GAP] OF Incomplete L11, L305–310. The office text bound is 20 MiB of declared uncompressed text. It excludes "the 2019/2020 police Stop-Data workbooks, which read `text-undetermined` honestly". The streaming extractor for these is DEFERRED. "A published budget workbook can be tens of megabytes and hundreds of thousands of cells".
- [BUILT] OF §CSV L217–234 (FW-23, 2026-09-24). One sheet. "Row 1 is row 1 whether or not it looks like a header, because a header is a reading and is never assumed". Cells use `sheet-cell`/`sheet-range`, 1-based, at the capture's grade. M-144: 166 of 166 files read, 778,830 cells.
- [DESIGN] OF L236–251. CSV is not byte-detectable ("prose wears that shape"), so it is claimed from the declared content type only. An undetermined encoding nulls only the high-byte cells, each named — "never mojibake" (`data/20230609update2.csv`, 138 cells).
- [RULING] OF L265–276, BOB #33 2026-09-24. `reading.dialect = {delimiter, encoding}` is its own key — "A latin-1 body reads its ENCODING UNDETERMINED, never "latin-1"".
- [GAP] OF Incomplete L20–30, L278–286 (D-593). A `text/csv` body ≤8 MiB is read at intake as lossy UTF-8; above 8 MiB it is "read by neither path" — "the sheet's cells are not the units the reader sees". The CSV size bound is NOT SETTLED (254.5 MiB heap against a 128 MiB isolate limit).
- [CONFLICT] EBD row 5 L61 (M-126, 2026-09-24) says the office entries "read NO `.csv` or `.xls` at all". OF Status L4 says the `csv` entry landed the same day (FW-23). `.xls` stays unread: 50 keys wait (OF L288). OLE2 prevalence is 0.32%, with the trigger "a group actually needing one inspected" (OF L12).
- [GAP] CSD Incomplete L51 — "288 workbooks in COFF-6's census hold 72,651,441 bytes of extracted text over 1,056 sheets and not one indexable unit between them". §4.1 L183: "Workbooks are not indexed per cell ... a cell is not a passage". The `indexed` state says `none: no unit arm for this container`.
- [GAP] CSD Incomplete L81–88. Speaker notes have no indexable unit — "they are the most candid text in a deck".
- [DESIGN] CSD §1 L117. Row queries over the record's own grades: "every OCR'd region below cap C", "every stale row", "every machine-minted row no member has cited". These are counts and filters over the record, not over data.
- [DOCTRINE] CSD §4.4 L380–397, UI-62. Rules "the next surface to show a bounded figure inherits":
  1. The denominator is named in the heading.
  2. "NO PROPORTIONS, EVER — no percentages, no bars, no "most of". A percentage computed over a sample and shown against a scope is the invisible under-report".
  3. The word SAMPLE appears beside the figures, and captures past the bound are in NO bucket.
  4. The bucket sentences come from the plane's vocabulary, "NEVER A COPY".
- [DOCTRINE] CSD §4.4 L362–363 — "a number that looks like a census and is a sample is worse than a smaller number that says what it is."
- [DOCTRINE] CSD REC-115 L17–18. A second count was a tautology — "an equality that cost nothing to produce" — and this was found on the `content:`, `leg:`, `resolves:` and `concerns:` arms (M-44).
- [DOCTRINE] CSD §4.3 L249–254 (D-391, BOB #32). A derived figure is stated as a range when its inputs disagree — "The honest reading is UNDETERMINED between ~20% and ~85%".
- [GAP] CSD §7 item 2 L433. "`leg:grade>=B` had compiled to `grade = 'GRADE>=B'` since PL-8, silently, on every arm" (fixed at REC-90).
- [DESIGN] CSD §5 L418. Storage: 176,657 B per bundle; the 10 GB per-object claim corresponds to ~60,800 bundles (the shard point is M6's).
- [DESIGN] SCH L145–160. Cost statements: one probe per engine per cadence, "twelve probe runs a year"; zero cost when nothing is registered.

## From C9 (C9: src/action-design/{ACTION-PLAN,INVENTORY,MATRIX,sources_build-state,sources_canon-constructs,sources_canon-mission,sources_code}.md.txt; src/NOTIFICATIONS.txt)

- [RULING] ACTION-PLAN ruling 3, line 13 — "**No budgets.** Neither money nor licensed resources are costed."; A15 line 55 — "no assignees, hours, costs or task lists".
- [DESIGN] ACTION-PLAN §Where it sits, line 72 — uses `consequences` ("what is at stake"); A5 uses "the recorded consequences".
- [EXAMPLE] ACTION-PLAN worked example, line 65 — "$100M school bond measure" not reaching "the required two-thirds vote" (a count/percentage test underlying a determination).
- [BUILT] INVENTORY §4 consequences row, line 51 — "What a breach did, to whom (a class, fund, program, service or body, never a person), measured, computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed." 24 tests pass; "None structural" gaps.
- [BUILT] INVENTORY §4 actions row, line 52 — "fee quotes" held on the action.
- [OPEN] INVENTORY §6 item 8, line 93 — meaning of "consequences addressed".
- [BUILT] MATRIX §3 affected residents row, line 46 — residents "counted as a class in consequences (`consequences` R10)".
- [DESIGN] MATRIX §7 Awareness row, line 94 — "reach is not measured, by design (no metrics)".
- [RULING] MATRIX §7, line 107 — bring resources "Resolved: a note on a step, no budgets (ruling 3)".
- [DESIGN] MATRIX §7 lines 91-92 — "grades" shown beside the venue's standard (`actions` R48) — grade of evidence compared with a threshold.
- [BUILT] build-state §1.3 consequences, lines 104-109 — "Computed from the record where figures exist. Otherwise assessed by a member, with a rationale, or undetermined." "Causation is a finding that needs evidence and is never assumed." "No significance".
- [BUILT] build-state §1.3 Services, line 114 — "`consequencesOf`: the parts, totals within one state, unit and currency, and the undetermined and unproven lists (R7)."
- [BUILT] build-state §1.3 Record, line 121 — "**Measure** `{unit, currency?, value | range}`, unit ∈ {money, benefits, services, time, count}."
- [BUILT] build-state §1.3 Record, line 123 — "computed: `basis {op ∈ sum, difference, count, product, ratio; operands = content ids}`. The module does the arithmetic, and the grade is the weakest of the operands' captures (R2)."
- [BUILT] build-state §1.3, lines 124-125 — assessed: member's value with rationale, "a machine is refused (R3)"; "undetermined: never read as zero (R4)."
- [BUILT] build-state §1.3, line 126 — "**Causation** ∈ {established (names an inquiry), unproven, not_applicable (zero measure)} (R5, R12; K283; N257)."
- [BUILT] build-state §1.3, lines 127-128 — Addressed needs evidence; "With no parts it is `undetermined` (R9; K172)"; "A machine may record a *computed* part only (R2; K102)."
- [RULING] build-state §0, line 9 — K172 (Bob): "a determination with no recorded consequence is `undetermined`, so an escalation cannot end on it."
- [GAP] build-state §1.3 — calculation is limited to five ops (sum, difference, count, product, ratio) over content ids, inside layer 9, attached to one standard's noncompliant outcome; no datasets, filters, aggregates beyond these, trends.
- [BUILT] build-state §1.4, line 143 — fee quotes (`actionQuotes`, R25–R27).
- [BUILT] build-state §2(b) Consequences vocab, lines 306-312 — affected kinds class, fund, program, service, body, other; units money, benefits, services, time, count; ops sum, difference, count, product, ratio; states computed, assessed, undetermined; causation established, unproven, not_applicable; addressed/not_addressed/undetermined.
- [BUILT] build-state §2(e), line 387 — a machine may "record a **computed** consequence part, labelled, with operands shown (cons R2; K102)".
- [DOCTRINE] build-state §2(e), line 401 — "Significance, severity, priority, urgency and scores are refused as inputs and absent from answers (conf R8; cons R11; esc R19; K12)."
- [BUILT] build-state §1.5, line 221 — approval with SHA-256 (reproducibility of the approved draft).
- [RULING] canon-constructs §4.2, line 89 — D-148 (Bob): "*Yes, a price quote is evidence*"; lives on a `received` correspondence entry; "The record asserts only what was quoted, by whom, when, for which request."
- [BUILT] canon-constructs §4.2, line 91 — plane derives elapsed time between entries and passed due dates (D-128 declared-versus-observed flow measured on our own request) — a derived timing measure; cross-action index not built.
- [DESIGN] canon-constructs §3, line 59 — CF §12 "The 12 Grade C instances name exactly what measurement would raise them" (grades of measured claims).
- [DESIGN] canon-constructs §4.7, line 127 — DEC-14: impact claim requires a basis leg pointing at evidence that is not our own action (a derived claim's basis rule).
- [OPEN] canon-constructs §6, line 180 — OQ-8: significance not allowed as a field (no ranking/scores).
- [GAP] canon-constructs — no analysis/calculation content in the construct docs beyond consequences and timing derivations; "none" otherwise.
- [EXAMPLE] canon-mission §1b, line 44 — MEM §1.3 expertise routing: "who should look at a franchise-fee question, who can read an ACFR" (financial-report reading as member expertise, not machine).
- [DESIGN] canon-mission §3, line 87 — DEC-14 impact claims "unproven" absent outside evidence.
- [DESIGN] canon-mission §4f, line 161 — evidence package carries "all factual findings, source documents, and analysis … fully public".
- [DESIGN] canon-mission §4f, line 171 — Roadmap §12 surfaces: Projects "Compliance dashboard. **Escalation tracker**"; Communications "**Compose actions**".
- [GAP] canon-mission §6 item 17, line 221 — "Funding and cost of actions: Req 8 "does not provide or manage funding". The resources list is free-form and has no arithmetic."
- [DESIGN] canon-mission §4f, line 170 — DEC-77 item 2: "Effect" in Criteria-Condition-Cause-Effect-Recommendation (effect is where measured consequence lives).
- [BUILT] code §1.3, lines 66-87 — consequences 1,032 lines source; "`figures.mjs` holds the arithmetic: `compute` over `OPS` sum, difference, count, product, ratio (:10)"; `consequencesOf` :649; `addressed` :707 rollup; tables `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- [BUILT] code §1.3, lines 78-83 — `UNITS` = money, benefits, services, time, count; `PART_STATES` = computed, assessed, undetermined; `UNDETERMINED_WHY` = not_in_record, form_not_read, not_assessed, not_computable (:62); causation inquiry id / unproven / not_applicable.
- [BUILT] code §1.3, lines 85-86 — refused `CONSEQUENCE_NOT_NONCOMPLIANT` unless live determination's noncompliant outcome; "A machine may record only a *computed* part (:395-397)."
- [BUILT] code §1.4, line 107 — `actionQuotes` reads quotes across actions by counterparty (a cross-record aggregation of fee quotes).
- [BUILT] code §0, line 7 — 181 tests, 181 pass (standards 18, conformance 36, consequences 24, actions 40, filings 34, escalation 29).
- [BUILT] code §1.5, line 152 — `deadlineDate` (calendar or business days with holidays) — date arithmetic in code.
- [BUILT] code §1.6, line 170 — `escalationsDue` sorted oldest first (age of proposals).
- [GAP] code — no dataset, spreadsheet, aggregate or chart facility in layer 9 beyond consequences' five ops and quotes-by-counterparty; "none" further in this chunk.
- [DESIGN] NOTIFICATIONS, lines 71-78 — Bob: "**FINDING is the substrate of case-making.** *"The system is about developing grounded, justified, and meaningful analysis and conclusions. These are built upon evidence and findings from that evidence..."*" "a finding is not a message — it is a unit the analysis layer composes with." (D-127)
- [DESIGN] NOTIFICATIONS, line 105 — "the analytic product is the DELTA. Declared flow versus observed flow, and what the difference implies." (an analysis of timing/patterns over progressions; D-128)
- [DESIGN] NOTIFICATIONS "Analysis (M4)", lines 248-257 — "each of which is a PROPOSAL in queue terms": "assistant-surfaced focus `[FINDING]` (D-78, D-82 — must LOOK derived)"; "missing predecessor in a progression `[FINDING]` (D-73 — the sharper of the two)"; "a connection whose grade is improvable `[FINDING]` (D-72)"; "gap list derived from an objective's satisfaction condition `[FINDING]` (D-76)"; "measure decay on a bias statement `[FINDING]` (D-87, D-90 — reports, never blocks)"; the out-of-inquiry lead (LIVE).
- [DESIGN] NOTIFICATIONS "Data-flow driven", line 230 — "duplicate document detected `[FINDING]` (D-60)".
- [DOCTRINE] NOTIFICATIONS rule 3, lines 313-317 — D-57 cautionary case: "`resolveLinks` reported a self-reference as "the target changed", the UI printed the plane's basis verbatim, and a member read a fabricated claim about a source." Any derived claim (e.g. "21 days overdue") must show its derivation or state it cannot.
- [DESIGN] NOTIFICATIONS §Applying a handler to a selection, lines 329-358 — weights `refuse` (all-or-nothing), `report`, `single`, `per-item` ("each item independently succeeds or is RETAINED WITH A REASON"); retention reasons: capability, drift, doctrine refusal (`SEVERED_EDGE`, retire-refuses-cited, dispose-refuses-`elevated`), absent precondition.

## From D1 (D1: design-journeys.txt, design-ux-audiences.txt, design-ux-useCases.txt, design-ux-journeyExperience.txt)

*design-journeys.txt*
- [EXAMPLE] §3 potholes, L96 — claim vs city's own records; sample not census: "Members' photos are a sample that tests those records, not a count of every pothole." Question: "Do the city's own records support its claim, and do members' spot-checks show that "closed" means "repaired"? (journey 6)"
- [EXAMPLE] §3 police overtime, L99 — budget-vs-actuals: "How do the actuals compare with what was budgeted and what policy allows? An accountant member checks (journeys 8 and 7)."
- [EXAMPLE] §3 financial report, L108 — "The annual financial report shows an unexplained fund transfer." → "A question, and a check from an accountant member".
- [EXAMPLE] §3 dataset, L112 — "The city's open data on service requests; records returned from a request." / "Capture it as received, fingerprinted." / "Compare it with what was promised or required (journeys 7 and 5)."
- [GAP] journey 6 "What changed", L230 — no in-product computation over spreadsheets: "Civicsmith can capture and read a spreadsheet, but the requirements show no way to compute over one inside the product, so for now the calculation is the assistant's or a member's, shown with its method. A built-in, repeatable calculation step may be needed."
- [NEED] journey 6 step 4, L236 (Reasoned) — "Works out whether the records support the claim, with the method shown: the assistant's calculation labelled as machine work, or a member's own, checked by a second member."
- [NEED] journey 6 step 5–6, L237–238 — sampling and a derived finding with counts: "the city's records show 90% closed; of 40 closed reports members visited, 11 were not repaired". Strength shown against the project's bar.
- [DESIGN] journey 6 sources L241 — "office-readers (CSV and spreadsheets read); strength and Undetermined (measures map)".
- [DESIGN] wizard "Check a claim", L472–477 — five steps incl. "Work out whether they support it, with the method shown, and have a second member check." / "Plan a spot-check: which sample of records members will visit".
- [EXAMPLE] journey 6 Who, L226 — "often an analyst or accountant member"; "Civicsmith does not count potholes itself".
- [GAP] §6 row "Calculating over a dataset", L528 — needed by journey 6 and "the police-overtime and bond-measure rows"; exists: "Spreadsheets are read as text and structure; their formulas are kept but not worked out. The only calculation in the product comes after a breach has been determined." → "Waiting on the development process's answer to the capability question you sent".
- [DESIGN] §6 L536 — "journey 6 says that the calculation is the assistant's or a member's, shown with its method."
*design-ux-audiences.txt*
- [DOCTRINE] audiences "Member, experienced investigator" mustNeverSee L443 — "Never shown a single confidence score or a composed case strength." (AI Roles §3 rule 9; strength R18; case-authoring R24)
- [DESIGN] audiences "Public reader" L978 — "Sees each finding's strength per axis, never one case score".
- [DESIGN] audiences "Partner group" stakes L1163 — "Forks at the judgment layer are legitimate; forks at fact or analysis signal a reproducibility issue." (Design Requirement 5) — reproducibility of analysis.
- [DESIGN] audiences "Partner group" goals L1125 — "rerun it under its own declared bias" (Declared Bias 'Differential traversal and the cross-group rerun').
- [OPEN] audiences "Partner group" L1176 — "How strength composes across an instance boundary when one group cites another's published case is unanswered."
- [DESIGN] audiences "Described audience" L1648 — "Reach is not measured, by design (no metrics)." (MATRIX.md §7)
- [DESIGN] audiences "AI run" goals L1493 — assistant proposes "comparisons".
*design-ux-useCases.txt*
- [EXAMPLE] UC-002, L28 — "city data" among outside sources to search; covered partial.
- [DESIGN] UC-001 "Search the record", L20 — outcome "Rows the viewer may see, with facets, a note of what could not be seen, and widening when an AND finds nothing." (facets = counts); covered yes (retrieval R5-R17, R28-R29; query-language R1-R25).
- [GAP] UC-027 "Classify material as fact, analysis or judgment", L606–626 — "Keep facts, analysis and judgment separate so each is treated correctly."; layer "2 Analysis", function "Classify findings"; covered no; "No module requirement names the fact / analysis / judgment classification." (src Functional Architecture Layer 2 Function 3; Design Requirement 6 content classification in metadata).
- [DESIGN] UC-053 "Read how strong a question or version is", L1192–1213 — "See the pair (weakest capture, weakest connection) with testimony beside it, and what is not load-bearing."; "Per-axis grades; unrated and undetermined stated; what-ifs labelled."; covered yes (strength R1-R10, R18-R20; DEC-21, DEC-44, DEC-82, DEC-86).
- [DESIGN] UC-052 "Check whether grounds share an origin", L1170–1189 — "Make sure 'independent' grounds do not trace to one source."; "An independence answer per pair of parts."; covered yes (strength R11-R12, R27; D-195).
- [DOCTRINE] UC-065 L1483 — "never one verdict; no significance or score".
- [DESIGN] UC-064 — structured comparison (requires, did, align, diverge, unknown) as analysis output, partial.
- [EXAMPLE] UC-067, L1521 — significance judged by a human "from context, scale, pattern and consequences"; "no significance field anywhere".
- [GAP] UC-076 "Regrade a case under another lens, or rerun another group's work", L1733–1750 — "See conclusions side by side with disagreement localised to named lens differences."; outcome "A structured diff per conclusion."; covered no (Declared Bias "Differential traversal"; System Design row 7 absent).
- [EXAMPLE] UC-077 "Set the objective's success condition and read progress and gaps", L1754–1773 — "see what is short, derived and never reported"; "Matched and short instances with why; one gap per short instance."; covered yes (intent R1-R7, R19, R28).
- [EXAMPLE] UC-080 — "over-full stages" (counts per stage) derived from threaded instances.
- [EXAMPLE] UC-068 "Detect candidate contradictions", L1542–1565 — cross-reference: "Pair assertions worth comparing; a run proposes labels (world, record, precision, unrelated, undetermined)."; covered yes (contradiction R1-R24, R57); "K1-K4 built with the over-strictness gate; K5 is not shown until a measured recommender run (K488)."
- [EXAMPLE] UC-099 "Prepare a case", L2277 — "An unsigned case document with a computed searched section, citations pinned, per-member pairs frozen." (computed absence section; frozen strength pairs).
- [GAP] UC-101 — "methodology" field in standard metadata only partly required.
- [GAP] UC-100 — methodology/support-gap opinion absent.
- [EXAMPLE] UC-107 — findings shown "with per-axis strength"; coverageNote "The case carries each capture's grade and co-attestation, capture accounts, sources and disclosed or highlighted contradictions (publication R10, R20)."
- [EXAMPLE] UC-112 "Record what the breach did and to whom", L2555–2576 — "State consequences as computed, assessed or undetermined, with causation established or unproven."; "Parts never composed into one figure; no individual singled out."; covered yes (consequences R1-R8, R10-R14; Operational Principle 6). (This is the "only calculation in the product… after a breach has been determined" named by journeys §6 L528.)
- [EXAMPLE] UC-128 "Record consequences addressed and end the escalation", L2933–2955 — "Close only when compliance is restored and consequences are addressed."; covered yes (consequences R9; escalation R3, R14).
- [GAP] UC-110 "List published work in the public directory", L2511–2530 — "with compliance status"; covered no.
- [EXAMPLE] UC-151 "See where a project stands: its stage and its cases' readiness", L3482–3500 — "Stage bars and readiness rungs computed from the record, each unreached step stating what it still needs" (continues next chunk).
- [EXAMPLE] UC-137 "Add or remove an administrator by ballot", L3163 — "A carried or pending ballot with the denominator shown." (shown arithmetic).
- [GAP] UC-148 — "data-source… guides" uncovered.
- [EXAMPLE] UC-151 "See where a project stands", L3482–3506 — "Stage bars and readiness rungs computed from the record"; covered yes (publication R44-R49; basis-versions R41; State Rules §4.3; K362; K364; DEC-79); "the stacked bars (DEC-79) are not built in the interface."
- [EXAMPLE] UC-156, L3623 — "the acceptance rate is measured" (measurement of machine recommendations).
- [EXAMPLE] UC-160, L3722 — defects "shown beside the resolution with a count".
- [EXAMPLE] UC-152 "Publish a case resting on co-attested Grade B copies", L3508–3530 — "The case discloses each document's capture grade and whether it is co-attested." (DEC-81 item 1).
*design-ux-journeyExperience.txt*
- [DESIGN] (c) step 3 "Record consequences", L487–500 — whatTheyKnow "What the record can compute; what must be assessed."; decision "Computed, assessed or undetermined; causation."; whatCanGoWrong "NOT_NONCOMPLIANT." / "A part naming an individual: refused." / "Totals only within one state."; feelingRisk "Composing harm into one headline figure (refused)." (consequences R1-R12).
- [DESIGN] (b) step 12 "Prepare the case", L357–371 — "the searched section computed from the log"; failure "CASE_SEARCHED_UNCOMPUTABLE".
- [DESIGN] (b) step 10 "Check strength against the bar", L327–339 — "BELOW_PROJECT_STRENGTH naming member, axis, required and reached (case-authoring R6)."
- [DESIGN] (b) step 16 "Read and verify by hash", L431–444 — "Cases disagree on a finding's pair: CASES_DISAGREE, each case's pair shown."; feelingRisk "Reading strength as a single score, or authenticity into a hash."
- [DESIGN] (b) step 7 "Accept a version", L283 — "Versions with legs and per-axis strength; suggested ones labelled."
- [DESIGN] (c) end escalation, L641–653 — "COMPLIANCE_NOT_RESTORED." / "CONSEQUENCES_NOT_ADDRESSED." / "CONSEQUENCES_UNDETERMINED."; "the exit condition is specific (Operational Principle 6)."
- [DESIGN] (d) "Open the queue", L665–677 — "Truncated at the bound (said)."; feelingRisk "A truncated set indistinguishable from nobody caring (DEC-16)." (counts/limits stated).
- [DESIGN] (d) "Resolve a tension in our own record", L766 — "the acceptance rate is measured and reviewed (DEC-77 item 3)."
- [DOCTRINE] (k) step "Add an option", L1243–1247 — "OPTION_KEY_REFUSED (budget, cost, assignee, hours, significance, priority, score)."; feelingRisk "Wanting to record cost or who does it; the plan refuses both by design."
- [DESIGN] (j) L1152 — arithmetic shown ("'2 of 3'").
- [DESIGN] (i) L1110 — "Withheld dependents stated without a count."
- [DESIGN] (g) L1020 — "Readings on a draft not named at publish are counted UNDETERMINED, never listed (Publication section 3 rule 13)."
- [DESIGN] (k) step "Get suggestions", L1230 — "the five strongest first… with no score, rank figure or strength (action-plans R34; K660 (2))".

## From D2 (D2: design-ux-surfaceRules.txt, design-principles.txt, design-brand.txt, design-measures.txt, design-HANDOFF.txt, design-view-matter-page.txt, design-view-plan-page.txt, design-view-start-and-send.txt, design-view-surfaces.txt)

- [DESIGN] PR §3 "Never one score", L60 (DEC-44; DEC-82) — "Capture B · connection C", never "B-".
- [DESIGN] PR §3 "Each kind of measure has its own form", L62 (DEC-82; DEC-79) — "Letters grade evidence, bars show progress, weights mark acts; no form is borrowed across them."
- [DOCTRINE] PR §3 "A grade is about checking, not truth", L64 (DEC-82).
- [DESIGN] PR §8 "Accessible", L135 (DEC-99) — WCAG 2.2 AA for every member screen and published form; "Every chart and badge has a text equivalent a screen reader can speak." (charts are anticipated).
- [DESIGN] PR §8 "The public reads least", L147 (DEC-112) — reproducibility of the case outside the product: "The complete edition carries every layer, so anyone can review or recreate the case without Civicsmith."
- [DOCTRINE] PR §9 "Nothing loaded from outside the group's copy", L165 (DEC-122 G3) — scripts/fonts ship inside the copy (constrains any charting or spreadsheet UI library choice).
- [DESIGN] MS strength, L17, L54–L66 — weakest-link combination: lowest capture letter and lowest connection letter, side by side, judged against the project's declared bar; "An answer is only as strong as the weakest thing it depends on."
- [DESIGN] MS letters, L23–L52 — four evidence scales only (capture, connection, testimony, subject match); no scale for a calculated or derived figure appears on the map (observation; see cross-construct).
- [GAP] MS capture A, L36 — "An archive-grade copy with a full record of how it was served (no route builds one yet)".
- [GAP] MS project stage "Matured", L79 — "the exact rule is still being worded (N300)"; MS readiness L86–L87 — internal and external checks "don't exist yet, so this step can't be judged" (K364).
- [GAP] HO §3 journeys, L61 — journey 6 (checking a claim about the city's performance): "Civicsmith checks claims against the city's own records plus members' spot-check samples; it does not log every pothole; gap: no in-product calculation over a dataset".
- [OPEN] HO §3, L63 — requirements to hand BOB after step 3 include "a calculation step if Bob wants it".
- [BUILT] HO §4 U41 "Arithmetic", L72 (second-hand) — "the only calculation is consequences R2 (sum, difference, count, product, ratio over cited figures, weakest-input grade)"; "spreadsheets read as text and structure, formulas kept not evaluated (office-readers R10)".
- [GAP] HO §4 U41 "Arithmetic", L72 — calculation "reachable only after a noncompliant determination"; "no budget reader, no general or reproducible calculation."
- [EXAMPLE] VM determination, L18 — percentage compared against a threshold: "certified as passed at 61.8% in favour (canvass report)" vs "at least two-thirds of votes cast in favour".
- [DESIGN] VM consequences, L27–L33 — consequence measures with provenance and grade: "$100,000,000 of bond debt authorised | computed from the resolution and the bond schedule · grade B, co-attested"; "undetermined · the program's budget has not been captured"; "Undetermined is never read as zero."
- [EXAMPLE] VS step 2, L55 — a cited figure in a filing: "The official canvass [source: canvass report, capture grade B, co-attested] records 61.8% in favour".
- [DESIGN] SR "Queue" mustShow, L18–L20 (queue R16; D-82) — derived items show their derivation: "A queue finding must look derived: its source and derivation, and that nobody has judged it yet."
- [DOCTRINE] SR "Queue" mustNever, L110–L112 (Interaction Constructs §P; D-79) — a bulk machine check is one proposal with N instances, never an obligation: "Never present a machine finding as an obligation; one check across 58 contracts is one proposal with 58 instances."
- [DESIGN] SR "Queue"/"ACT" truncated, L166–L169, L353–L356 (inventory display primitive; queue R6; membership R48) — "Every list says when it was cut at a stated bound." (counts must state bounds).
- [DESIGN] SR "ACT" mustShow, L280–L282 (Interaction Constructs §S) — "For a set: whether the act is all-or-nothing, report-and-proceed, or per-item, before acting."
- [DESIGN] SR "ACT" mustShow, L285–L287 (Interaction Constructs §B) — counts shown with denominator: "'2 of 3', never 'pending approval'".
- [DESIGN] SR "ACT" stale/expired, L366–L379 (retrieval R19–R20) — selections (sets) can move: "report says what moved; refuse hands over nothing (SET_MOVED)"; "NO_SUCH_SELECTION".
- [DESIGN] SR "Question workspace" mustShow, L433–L440 (inquiry R13–R14, R32; strength R1–R10, R18–R20, R3) — legs with role and "earned grade, what it was capped from and why"; strength pair per axis; "what-ifs labelled as exploration".
- [DOCTRINE] SR "Question workspace" mustNever, L480–L482 (AI Roles rule 9; strength R18) — "Never a single confidence score or a case-level strength."
- [DOCTRINE] SR "Question workspace" mustNever, L495–L497 (DEC-82; DEC-44) — "Never hide grades … never one combined badge."
- [DESIGN] SR "Tension mark…" mustShow, L667–L669 (DEC-77 item 2; K447 point 9) — structured analytic tools in the contradiction inquiry: assumptions checklist, timeline, competing-hypotheses matrix.
- [DESIGN] SR "Tension mark…" clarifier, L657–L659 — "observer or method" and "part or scope" as legitimate reasons two figures differ (relevant to numbers computed differently).
- [DOCTRINE] SR "Tension mark…" mustNever, L694–L696 (CONTRADICTION-PRESENT-RESOLVE-DESIGN.md §4; contradiction R10) — "Never show a precision or unrelated label as a tension" (a rounding/precision difference is not a conflict).
- [DESIGN] SR "Document page" mustShow, L813–L815 (provenance R24–R27) — "Capture grade earned (direct at most B, archive at most C, observation none) and what it rests on."
- [DESIGN] SR "Document page" mustShow, L823–L825 (observation-log R12) — "Content-axis state: indexed full / partial / none, not extracted, undetermined."
- [DESIGN] SR "Project home" mustShow, L968–L970 (intent R3–R7, R19) — "The objective's condition, progress and gaps, derived and never reported."
- [DESIGN] SR "Project home" mustShow, L973–L975 (strength R14, R21) — "The declared bar per axis beside the strength reached."
- [DESIGN] SR "Project home" mustShow, L998–L1000 (K364; publication R46) — case readiness by its own evidence; "Internally checked and Externally compliant read 'not yet evaluated'".
- [DESIGN] SR "Project home" mustShow, L1003–L1005 (DEC-82) — "Each question with its capture and connection badges (testimony beside), one phrase against the bar and 'Undetermined' with its reason; never one combined badge."
- [DOCTRINE] SR "Project home" mustNever, L1040–L1042 (DEC-79; K448) — computed states must state the rule that computes them: "Never promise a stage the computation would not give: what the next stage needs is stated from the rule that computes it."
- [DOCTRINE] SR "Project home" mustNever, L1035–L1037 (intent R21) — "Aspirations never filter or reorder evidence."
- [DESIGN] SR "Case editor" mustShow, L1143–L1145 (case-authoring R6) — "Each load-bearing finding's pair against the project bar, and which fall short by axis."
- [DOCTRINE] SR "Case editor" mustNever, L1180–L1187 (case-authoring R24; DEC-72) — "Never compose a case-level strength."; "Never present a supporting finding as load-bearing."
- [DESIGN] SR "Review copy" mustShow, L1470–L1472 (Publication §3 rule 13, REC-213) — "Withheld acknowledgements counted with the reason (the writer's own)."
- [DESIGN] SR "Standards…" mustShow, L1614–L1617 (consequences R2–R7) — "Consequence parts by state (computed, assessed, undetermined), causation established or unproven, totals only within a state." (aggregation rule: never sum across computed/assessed/undetermined).
- [DOCTRINE] SR "Standards…" mustNever, L1706–L1709 (conformance R8; consequences R11; escalation R19) — "Never a significance, severity, priority, urgency, rank or score."
- [DOCTRINE] SR "Standards…" mustShow, L1689–L1692 — "undetermined never read as zero".
- [DESIGN] SR "Standards…" primaryActs, L1824–L1829 — "addressedrecord / consequencerevise": reasoned.
- [DOCTRINE] SR "Standards…" mustNever, L1731–L1734 (actions R7, R26) — never "an outcome that claims impact without a leg outside the group's own actions." (impact claims need external evidence).
- [DESIGN] SR "Members…" mustShow, L2270–L2272 (membership R5, R38) — "Ballot arithmetic: votes needed, eligible, have, awaiting." (counts shown with their components).
- [DESIGN] SR "Monitoring" mustShow, L2014–L2016 — monitoring keeps a "detection history" per address (a time series of observed changes; no analysis over it is specified).
- [DESIGN] SR "Published case" purpose, L2578–L2581 (UI-KICKOFF item 5; Publication §1) — reproducibility outside the product: "The group's face: the case, verifiable by a stranger without the instance."
- [DESIGN] SR "Published case" mustShow, L2620–L2623 (UI-KICKOFF refinements) — visuals in publications: "Interactive story visuals with progressive disclosure; a print version carrying the full narrative."; L2736–L2739 "Print is first-class."
- [DESIGN] SR "Published case" mustShow, L2585–L2588 (publication R10–R11, R26) — "Each finding's frozen pair per axis and role (load-bearing or supporting); where cases disagree, each case's own pair."
- [DOCTRINE] SR "Published case" mustNever, L2657–L2660 (publication R26) — "Never compose a case score."
- [DESIGN] SR "Doorbell" mustShow, L2755–L2757 (Intake Doctrine §2a; capture R31) — "The published rate bound with its method." (a published number states its method).
- [DESIGN] SR "Search and frontier" mustShow, L2906–L2909 (retrieval R7, R9) — "Facets; widening when an AND finds nothing." (filtering by facets).
- [DESIGN] SR "Search and frontier" mustShow, L2916–L2919 (query-language R11) — "Only the order of relevance, never a relevance score."
- [DOCTRINE] SR "Search and frontier" mustNever, L2923–L2926 (retrieval R29) — "Never count what the viewer may not see in totals, tallies or cursors." (counts are visibility-scoped).
- [DESIGN] SR "Search and frontier" stale + primaryActs, L2964–L2980 (retrieval R18–R20) — a selection carries a query digest; acting on a set reports or refuses (reproducible selection).
- [DOCTRINE] SR "Action plan" mustNever, L3076–L3079 (action-plans R26; PATH.md §3; Bob's ruling 3) — "Never a cost, budget, assignee, hours, score or priority." (no costing on plans).
- [DOCTRINE] SR "Assistant tray" mustNever, L3260–L3263 (action-plans R34; agent-worker R52; K660 (2)) — "A score, rank figure or strength on any suggestion: the order is the only sign of strength."
- [DESIGN] SR "Action plan" truncated, L3123–L3126 (action-plans R7) — "200 per page".
- [DESIGN] BR §3 "Exact", L52 (Operational principle 2) — numbers stated exactly: "Dates, numbers, names and sources, not adjectives."; BR §4 L86 public reader tone: "A case has two strengths, never one."
- none in design-view-plan-page.txt; none in design-view-surfaces.txt (beyond exhibit grades, listed under COURTS).

## From M1 (M1: src/req/local-facts.txt, standards.txt, conformance.txt, consequences.txt, action-grammar.txt, actions.txt, action-clocks.txt, filing-templates.txt, filings.txt, escalation.txt, action-plans.txt (layer 9, Action))

- [DESIGN] consequences Purpose (consequences.txt:14) — "Computed from the record where the record holds the figures, each with its basis and grade; otherwise undetermined, and members determine it from the record and their own assessment"
- [DESIGN] consequences R2 (consequences.txt:22) — a computed part is `{op: sum|difference|count|product|ratio, operands}`, each operand a content id whose passage holds the figure. The part's grade is the weakest operand's capture grade (DEC-21). A machine may record a computed part, labelled (K102) — "The value is the module's own arithmetic over the operands, never the author's"
- [BUILT] consequences/figures.mjs — `parseFigure`, `compute`, `addMeasures`.
- [GAP] consequences/figures.mjs — the computation has these limits:
  - figures are digits, separators, $€£¥ and scale words; there is no percent;
  - a figure must appear verbatim in the passage;
  - `count` is the number of operands given;
  - one operation per part, with no chains;
  - product and ratio keep 15 significant digits.
- [DESIGN] consequences R3–R4 (consequences.txt:23–24) — an assessed part is a member's value or range with a rationale. It is never summed or graded as computed, and a machine cannot assess (MACHINE_CANNOT_ASSESS) — "An undetermined part is never read as zero."
- [DESIGN] consequences R7 (consequences.txt:29) — "`totals` are summed only within one state, one unit and one currency, each labelled with its state and the parts it counts"
- [DOCTRINE] consequences R11 (consequences.txt:53) — no single composed figure, and no significance, severity, priority or score (K12).
- [GAP] consequences Status (consequences.txt:5) — "The record holds no amounts or fund figures as values (`EXTRACTION-BREADTH-DESIGN.md` §2 rows 5–6: no budget or financial-report reader …)" and "until such readers exist most consequences will be assessed or undetermined". This still holds: T32 left-out A37 (progressions R32, "no amounts or funds as values", dependency not built).
- [DESIGN] consequences Suggestions (consequences.txt:77) — "a spreadsheet cell or table extent (`content`'s `sheet-range` and `doc-table` arms) is the natural operand". "a budget or financial-report reader, when written, belongs to `extraction`/`docprofile`, not here."
- [GAP] (implied) — calculation exists only as the consequences of a noncompliant determination (layer 9, after publication). These modules have no datasets, filters, counts over records, trends, budget-against-actuals, tables or spreadsheet working medium, and no derived-number service an inquiry can use.
- [DESIGN] actions R27 (actions.txt:68) — actionQuotes gives each quote's parsed value and currency; an empty answer says which level was empty (no_request, no_reply, no_quote, no_quote_by_name) — "No field compares one quote to another."
- [DESIGN] action-grammar R4 — fee quotes are the only money values held (consequences Status) — "A waiver is a revision to zero"
- [DESIGN] conformance R9 (conformance.txt:32) — each finding's strength pair frozen at publication is shown beside its live pair, "each per axis and never composed (DEC-44)". `outcomes_differ` is a quiet mark (DEC-84 item 3).
- [DOCTRINE] conformance R8 (conformance.txt:29) — "No input or answer carries a significance, severity, priority, urgency, rank or score"
- [DOCTRINE] escalation R3, R19 — the two exit conditions are never composed "into a score".
- [DOCTRINE] action-plans R26 (action-plans.txt:109) — Bob's ruling 3 of 2026-09-29; the refused keys are budget, cost, assignee, hours, significance, priority and score (values.mjs:14) — "No field, input or answer holds a cost, budget, amount of money to be spent, assignee, hours or significance score"
- [DESIGN] action-plans R34 (action-plans.txt:76) — "No score, rank figure or strength is recorded or answered: the order is the only sign of it."
- [DESIGN] filings R25 — exhibit grades are compared with the venue's stated evidence standard and flagged below it, never refused.
- [DESIGN] conformance R18 (conformance.txt:38) — caps (K249): 50 findings, 50 standards, 200 rows, 20 questions, 50 evidence ids.

## From M2 (M2: src/req/jurisdictions.txt, id-spaces.txt, docprofile.txt, office-readers.txt, odf-reader.txt (layer 1); extraction.txt, content.txt (layer 4); entities.txt, connections.txt, progressions.txt, bias.txt (layer 5))

### from jurisdictions.txt
- [DESIGN] jurisdictions R3, l.17 — `fund` and `parcel` identifier spaces (keys for joining budget and property records)
- [BUILT] jurisdictions R21, l.86 — "the budget data set" is a named system of the first profile
- [DESIGN] jurisdictions R3 `floor`, l.19 — coverage floor: the first enactment number a system's record holds (what a count over that system can and cannot cover)
### from id-spaces.txt
- [DESIGN] id-spaces R20, l.50 — `fund` joins require fund names equal after normalising (case, punctuation, the word "fund") — joins budget datasets across publications
- [DESIGN] id-spaces R18, R22, l.48, l.52 — `VALUES_DIFFER` with `near_miss` for leading-zero differences — "A near miss is never counted."; `counts` true only for `SHARED`
- [DESIGN] id-spaces R25, l.68 — "Every "no" says which kind of no: outside the reach, undetermined, unjoined, a different value, or one system."
### from docprofile.txt
- [EXAMPLE] docprofile R5, l.34–36 — a document satisfying more than one class "(measured: about one in twelve)" states all of them in `also`
- [DESIGN] docprofile Uses, l.163–165 — report-template headings include "fiscal impact" (a staff report's budget section is recognised as a section only)
- [DESIGN] docprofile R18, R24, l.93–95, l.116–117 — refuses a reading when undetermined characters outnumber decoded ones; undetermined counts are "never invented from the text alone"
### from office-readers.txt
- [DESIGN] office-readers Purpose, l.9 — XLSX and CSV are read into the I2 structure and text shapes (spreadsheets enter the record as readings, not as computable tables)
- [DESIGN] office-readers R11 xlsx, l.153–161 — `document` "every sheet's text, tab-joined per row"; `sheets` `[{sheet, name, hidden, rows, cols, usedRows, usedCols, range, text, undetermined}]`; rows/cols the fixed format bound (1,048,576 / 16,384); an unresolvable shared string is a stated `undetermined`, "never an invented string"
- [DESIGN] office-readers R10 xlsx, l.113–116 — `{kind:"formula", source, formula, value}`: the cached value "held BESIDE `formula`, never substituted for it"; no formula is recalculated (pure, R20)
- [DESIGN] office-readers R10, l.115–120; R23, l.268–270 — hidden rows, columns, sheets (`hidden`/`veryHidden`) surfaced as evidence; "Nothing this module marks `hidden` ... is ever omitted from `text()`'s output"
- [BUILT] office-readers R9, l.88–97 (D-415, K36, built T2) — each workbook defined name and table part that is one rectangle on one sheet becomes a `sheet-range` `rangeUnit`; others listed in `rangeUnitsSkipped` with a reason (`multi_area`, `external_workbook`, …)
- [DESIGN] office-readers R11 csv, l.162–170 — "Row 1 is always row 1: no record is consumed, skipped or reinterpreted as a header." Empty field = measured emptiness; an unreadable field is `undetermined` "never mojibake"
- [DESIGN] office-readers R14, l.193–207 — CSV `dialect()`: encoding (BOM certain; us-ascii certain; utf-8 likely; else undetermined) and delimiter (comma/semicolon/tab/pipe over first 50 lines; ties or none → undetermined); persisted as `reading.dialect` (REC-218, l.291–292)
- [DESIGN] office-readers R12–R13, l.174–189 — size guard: over 20 MiB declared uncompressed text bytes, text is refused (`document:null`, marker in `undetermined`), "never a silent truncation"
- [GAP] office-readers status, l.3; Suggestions l.319–322 — "R11's csv bound stays the OOXML figure (20 MiB) until measured on a deployed plane (DIST-14)"
- [DESIGN] office-readers R17, R18, R26, R27, l.222–234 (N27, K279) — cell and range references (`Sheet!B4`, `Sheet!A1:D20`) via one builder; `rangeUnitFor` refuses `outside_grid`, `no_such_sheet`
- [GAP] (observation) office-readers whole — no cell typing (number, date, currency), no column/header semantics, no formula evaluation, no table-as-data service; cells are text and references only
### from odf-reader.txt
- [EXAMPLE] odf-reader Satisfies, l.263–265 — ODF was "deliberately not built" until "CAP-8/COFF-10's 2026-09-14 ruling made a Google Drive export ODF's harvest format" (a published Google Sheet arrives as .ods)
- [DESIGN] odf-reader R15, l.100–104 — `.ods` formula verbatim ("its OpenFormula `of:` prefix kept") beside the displayed value — "The formula is never collapsed into, or substituted for, the cell's displayed text."
- [DESIGN] odf-reader R16, l.105–111 — hidden rows/cols as ranges whose `table:visibility` is `collapse` or `filter` (a publisher's filter is surfaced as evidence); hidden sheets
- [DESIGN] odf-reader R18–R19, l.118–129 — sheets' used extent and range; text tab-joined "by their displayed value (never their formula)"; counts `cells` (non-empty) and `formulas`
- [DESIGN] odf-reader R42, l.249–251 — a `.ods` capacity is always `null`; never borrows XLSX's grid
- [DESIGN] odf-reader R44, l.222–223 (N27, D-415; K278) — named ranges and database ranges that are one rectangle become `sheet-range` `rangeUnits`; named expressions skipped as `not_a_range_reference`
- [DESIGN] odf-reader R45, l.224–225 (N30, K428) — repeats expanded within `ODF_REPEAT_EXPANSION_MAX` (262,144 units) and the 20 MiB text bound; past it the read stops "as over the size guard" with `over_repeat_bound`
- [GAP] (observation) odf-reader whole — as office-readers: no typed values, no column semantics, no recomputation; a spreadsheet is text plus references
### from extraction.txt
- [DESIGN] extraction R22, l.46 — text-index bounds: units capped at 128 KiB, at most 4,096 units and 2 MiB per capture; the answer counts `offered`, `written`, `truncated`, `over_bound`, `unaddressable` (a spreadsheet's text is indexed within these bounds)
- [DESIGN] extraction R48, l.138 — "Every list read is bounded and says when it was cut (`limit`, `truncated`)." R29: default 200, max 5,000
- [DESIGN] extraction R67, l.106–107 — the module's figure `textUnits` for `op=stats` via `record-core.registerCounts`; R43 l.102 `mintRatio` "answers `ratio: null` when nothing was minted"
- [DESIGN] extraction R45, l.135 — "absent, empty and null stay three facts (page count, container extent, units, provenance, dialect)"
### from content.txt
- [DESIGN] content Terms and R1, l.17, l.20 — `sheet-cell` `{sheet, cell}`, `sheet-range` `{sheet, range}`, `doc-table` `{table, cell?}` are citable extents: a member can cite a cell or range of a published spreadsheet; R7 l.26 a cell "past the format's grid capacity (never the used range: an empty cell exists)" is refused
- [DESIGN] content R46, l.92 (N215, K249) — `passageText`: the text at exactly a row's extent; null when stale, `bytes`, or not held whole — "a caller reads `null` as the passage held in a form not read (`consequences` R2: `undetermined`), never as empty text" (the hand-off from cited passage to layer-9 calculation)
- [DESIGN] content R31, l.68 — similarity grade "word-multiset Dice at or above 0.7"
- [DESIGN] content R51, l.112 — figures `content` and `contentStale` for `op=stats`; R20 l.47 standings for at most 200 ids; R41 `STALE_GRADED_MAX` 200
### from entities.txt
- [DESIGN] entities R17, l.45 — `selectivity` = "1 − reach ÷ corpus over the references this viewer can see"; uninformative names reported "with its arithmetic"
- [DESIGN] entities R39, l.76 (N351, K477) — collections bounded (500; relations 1,000, the walk bound intent R4 reads) — "a truncated collection never answers a count as whole"
- [DESIGN] entities R41, l.86 — figures `entities`, `entityAliases`, `entityRelations`, `resolutions` for `op=stats`
- [DESIGN] entities Terms, l.17; R21 — `fund` and `parcel` kinds; idMatch answers a parcel's standing "over the vintages the record holds"
### from connections.txt
- [DESIGN] connections R2, l.22 — pair arithmetic stated: bound 500 (max 5,000) pairs; at most 5,000 resolution rows read; "a trailing partly-read capture dropped rather than graded weaker"
- [DESIGN] connections R13, R52, l.37, l.90 — `portionGrades` (≤200 rows, set-based) and `portionAxes` for the earned-basis registry; undetermined causes `NO_CONNECTION`, `CONNECTION_OUTSIDE_PORTION`, `CONNECTION_PORTION_UNDETERMINED` "never read as none"
- [DESIGN] connections R60–R61, l.105–107 — figures `connections`, `connectionPairChoices`, `connectionDirty`, `themes`, `themePlacements`, `refs` for `op=stats`
### from progressions.txt
- [GAP] progressions R32, l.102 — junction checks are "data over an instance" yielding findings, deferred "until the record holds amounts and funds as values, `EXTRACTION-BREADTH-DESIGN.md` §2 row 5, its stated trigger" — the record holds no amounts as values
- [DESIGN] progressions R18, l.52 — `proposalsFeed`: one walk; proposals aggregated one per (progression, stage) with instance counts, weakest grade (null if any undetermined), `overdue_count`, ordered by instance count
- [DESIGN] progressions R31 interface, l.67 — `cardinality_exceeded` finding (`document_count` vs `cardinality`), "**not aggregated into `proposals[]`**"
- [DESIGN] progressions R24, l.94 — "Grades, findings, deadlines and aggregates are derived on every read and never stored."
### from bias.txt
- [DESIGN] bias R6, l.25 (DEC-17) — "text setting a threshold (a count of sources, a grade floor): a bar, not a lens" is refused (C-26.6); a bar is `required_strength`
- [DESIGN] bias R17, l.42 — `statements_sha` over the whole effective set before paging — "so two computations of one lens give one hash whatever the page" (a reproducibility hash)
- [DESIGN] bias R20, l.47 — `coverage` states how many policy sentences were read, of how many (≤500), and whether the input was cut
### from the repository check (Modules)
- [BUILT] consequences/index.mjs:27–28, :247 — layer-9 calculation reads its operands' figures through `content.passageText` (content R46), so a cell or range cited from a captured spreadsheet can be an operand; nothing at layers 4–8 computes over cell values
- [GAP] content's own ops (`content`, `contentmint`, `textattest`, `transcribe` …) have UI 0: a member cites a sheet range only inside a citing act, with no screen of its own
- [GAP] T32 left-out B1 — the CSV text bound (20 MiB) is unmeasured until a deployed plane (DIST-14); A37 — progressions R32 junction checks wait for "amounts or funds as values"

## From M3 (M3: src/req/inquiry-grammar.txt, inquiry.txt, citation.txt, strength.txt, basis-versions.txt, run-rules.txt, ai-runs.txt, run-productions.txt, skills.txt, agent-worker.txt, capture-requests.txt)

- [DESIGN] strength Purpose l.14 — "Strength is what a claim is worth, derived and never stated: a pair of independent measurements... never composed into one value (DEC-44)"
- [DESIGN] strength R4 l.24 — derived arithmetic: ground = weakest (AND), grounds compose by strongest (OR), the axis the weaker of the two parts (DEC-32); "The member that sets the grade is named"
- [DESIGN] strength R2 l.22 — recursion to depth bound 6; past it `undetermined` with why
- [DESIGN] strength R8/R20 l.32,99 — what-if state sets: "A what-if is exploration, never a record value, and says so in the answer"
- [DESIGN] strength R31, R32, R35 l.51–53 — reproducibility: method text "complete enough to recompute a grade by hand"; `recomputePair` from a case file's facts; Publication §5C "each grade recomputes the same by the stated method version"
- [DOCTRINE] strength R10 l.34 — an answer with a single composed figure (`strength`, `grade`, `score`, `overall`...) is refused (C-30.7)
- [DOCTRINE] skills R17 l.50 — prohibitions "no single confidence score; no connection-density ranking"; R28 rule 3 "(no significance, no score)"
- [DESIGN] agent-worker R52 l.57 — plan options in "the assistant's order of strength... carried only by the list's order: no candidate carries a score, rank figure or strength"
- [DESIGN] run-productions R5 l.26 — answer fields labelled `record` / `derived` ("computed over this submission and not stored") / `call`
- [DESIGN] run-productions R12 l.35 — minted-to-cited ratio over ≤64 documents (a measure of EXTRACT's usefulness)
- [GAP] (inferred) layer 6 holds no calculation over data (counts, sums, budgets, tables, spreadsheets) and no grade for a derived number. Strength grades evidence chains, not computations; no AI tool or mode computes. agent-worker's only read tools are `meaningrows`, `search`, `versionchain`, `basisversions`

## From M4 (M4: src/req/retrieval.txt, query-language.txt, observation-log.txt (layer 5); intent.txt, reevaluation.txt (layer 7); monitoring.txt, scheduler.txt (layer 10); acquisition.txt, sources.txt (layer 3))

- [DESIGN] retrieval R6, retrieval.txt:37 — modes `page`, `ids`, `count`; `total`; ids capped at `IDS_MAX` with `truncated`.
- [DESIGN] retrieval R7, retrieval.txt:38 — facet counts per field `{value, n}`; the scan and groupby forms are identical.
- [DESIGN] retrieval R9, retrieval.txt:40 — an empty conjunction is widened to its OR reading, offered only when that finds something.
- [DESIGN] retrieval R14, retrieval.txt:47 — the content-axis tally per state over at most 500 captures, with truncation stated.
- [DESIGN] retrieval R39, retrieval.txt:84 — the frontier tally per state over the whole level, naming no subject.
- [DESIGN] retrieval R60, retrieval.txt:105 — `counts(hid)` `{indexed, selections, selectionItems}` for the queue.
- [DESIGN] retrieval R18–R20, R59, retrieval.txt:58–65 — reproducibility of a set an action refers to — "A query selection is re-run and its digest compared: `added`, `removed`, `digestChanged` and the sentence that which rows moved is not recoverable."
- [DESIGN] retrieval R25, retrieval.txt:72 — "A workbook's text is found by `passage:` at sheet grain: one unit per sheet whose used range the reader names" (D-672).
- [GAP/RULING] retrieval Suggestions, retrieval.txt:163 — "A workbook's named tables and ranges are not their own search hits for now ... revisit when a member asks (K102)."
- [DESIGN] retrieval R12, retrieval.txt:45 — a leg's grade is resolved against what the target earns (`grade_authored`, `grade_why`).
- [DESIGN] query-language R14/R16, query-language.txt:32, :34 — bundle-grain shapes (count, ids, snapshot, facets); level counts — "a miss never empties its own denominator".
- [DESIGN] query-language R12, query-language.txt:30 — bounds: limit 1–500 (default 50), select-all at most 50,000, meaning rows 1–1,000.
- [DESIGN] query-language R4, query-language.txt:22 — "`capture:` and `connection:` are two fields over two columns, never one composed strength (DEC-21)".
- [DESIGN] query-language R6, query-language.txt:24 — `content:` sub-fields `cap` (letter; `undetermined`; `does-not-apply`), `chain`, `minted`, `cited`/`uncited`.
- [GAP] retrieval and query-language (inferred) — counting and faceting only. No arithmetic over values (sums, means, budget figures, percentages, trends) in the grammar or in retrieval.
- [DESIGN] observation-log R6/R7, observation-log.txt:34–36 — extraction outcome counts; a document with `text_chars` 0 and no unread pages is `LOOKED_ABSENT` (K328); an index row is `partial` with the bound that stopped it.
- [DESIGN] observation-log R32, observation-log.txt:70 — figures `observations`, `leads` (purge proof only).
- [DESIGN] intent R4, intent.txt:30 — a three-valued proportion — "`satisfied` is true when `meeting / matched` reaches `share`, false when it cannot reach it even if every undetermined instance met it, else null."
- [DESIGN] intent Bounds, intent.txt:38 — "past 1,000 matched instances `satisfied` is null with its reason".
- [DOCTRINE] intent R19, intent.txt:90 — "Progress is derived, never reported: no service accepts a progress figure, count, share or completion, and nothing stores one".
- [DESIGN] intent R8/R14, intent.txt:46, :56 — a goal "carries no progress figure"; `pursuitOf` "carries no completion figure".
- [DESIGN] reevaluation R4, reevaluation.txt:25 — an obligation carries the strength pair per axis, "unaltered"; the stored triple sits beside the derived one, "never merged".
- [DESIGN] reevaluation R13, reevaluation.txt:42 — three totals; "undetermined is never evidence the sentence was right".
- [DESIGN] monitoring R19, R26, R46, monitoring.txt:49, :65, :61 — operational counts only (ticked, skipped, failed, gathered; Drive shell classes; table counts).
- [DESIGN] acquisition R17, acquisition.txt:46 — office formats (spreadsheets included) are identified at intake from their bytes ("an office file's format and container digest are judged from its bytes; K659").
- none in scheduler.txt or sources.txt.

## From M5 (M5: src/req/affordances.txt, op-declarations.txt, wizard-scripts.txt, tasks.txt, queue.txt, control-plane.txt, publication.txt, corpus-export.txt)

- [DOCTRINE] publication R26 l152 — "No answer, document or row this module serves composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21)."
- [DESIGN] publication R37 l34 — strength frozen pair "per axis, never composed".
- [DESIGN] publication R50 l88 — caseTensions: undisclosed contradictions on published members; "composes no strength".
- [DESIGN] affordances R2 l27 — consequencerecord and consequencerevise `reasoned`, comparisonpropose reversible, strengthbar reasoned ("a gate on the whole group", R31 dialog).
- [DESIGN] affordances R19 l148 — consequencerecord backed "by its arms (`consequences` R2–R4), its assessed arm's rationale refused as any reason is".
- [DESIGN] affordances R16 l112 — "Facts are counts, never ids".
- [DESIGN] queue R1 l24, l27 — measure-decay, objective-gap, grade-improvable; sweep-yield-anomaly "filed far more or far fewer than its recent runs" (a trend check on machinery).
- [DESIGN] tasks R2 l18 — per-status counts over the visible set; queue R6 l35 item_count, bounds, truncated.
- [DESIGN] wizard-scripts R16 l67 — candidates "where offered scripts' step counts drop most and the (op, code) pairs most refused" (usage analytics, unattributed).
- [DESIGN] corpus-export R1 l16–20 — export of every bundle, files, register, "the counts": a whole-corpus dump.
- [GAP] corpus-export — no export of a filtered dataset, table or spreadsheet; R3 verification only, "Writing a verified corpus into a receiving store is not stated here" (l59).
- [GAP] publication — no chart, table or derived-number construct in a case document (findings, materials, attributions only); R30 rendering verification not yet met (D-246).
- [GAP] legacy UI — consequences, comparisons, objectives and stats ops have no caller; a consequence shows only as projection's derived state ("never a letter, never a low one", l9468–9471).
- [GAP] T32 left-out A37 (not my module) — "progressions R32 … no amounts or funds as values".
- none in op-declarations, control-plane (op=stats is store counts, not member analysis).
