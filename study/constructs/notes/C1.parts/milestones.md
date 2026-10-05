# MILESTONES extracts (MILESTONES.txt)

## chunk 1-300
TIME
- [DESIGN] M1 L101-109 — instance "left alone continues to monitor its sources, drain its inbox, and fall back to the archive when a source goes dark"; acceptance "a source dark past the D-104 threshold produces a grade-C archive capture"; "Time-pinned in a suite, then confirmed once live."
- [BUILT] M1 correction L118-125 (2026-08-01) — "One reconciling Durable Object alarm now serves FIVE consumers (selection-sweep, task-drain, archive-monitor, connection-derive, overdue-scan)"; live gaps then: env.SELF unbound so archive-monitor INERT; op=monitor had no caller (overdue-scan = time consumer)
- [DESIGN] M1 L127-133 — "Monitoring, the fallback's eligibility clock, cadence by volatility and the ageing of temporal expectations (M4) each presuppose a periodic actor." (ageing of temporal expectations)
- [DESIGN] M1 absorbs L112-113 — "per-document cadence from observed volatility (ARCHIVE-FALLBACK.md, and D-65's frequency-by-kind half)"
- [NEED] M4 L257-264 — "a progression with a missing predecessor is visible"; acceptance "the meeting → agenda → minutes sequence AND the need → award → contract sequence are both expressible as rows in one table; an award with no solicitation surfaces as a finding carrying its grade." (chronological sequences; procurement lifecycle)
- [DESIGN] M4 L281 — "RECORD (schema and the ageing mechanism)"
- [GAP] M4 absorbs L269 — "D-73 (the table models a pair, the domain needs a chain)"
ORGANISATIONS
- [NEED] M4 L262-264 — "need → award → contract sequence"; "an award with no solicitation surfaces as a finding" (contracts, procurement)
- [DESIGN] M4 absorbs L266-275 — "D-83 (the entity axis IS the bias doctrine's subject registry; building them twice is the live risk)"; "D-74 (Oakland's shared identifiers — the highest value-per-hour measurement available)"; "office-document metadata as a first-class ENTITY-AXIS INPUT (DEC-5: creator/lastModifiedBy/tracked-change attribution are 'the actions of people and departments' — readings resolved ACROSS documents)" (people and departments as actors resolved across documents)
- [EXAMPLE] M3 L241-243 — "a re-captured Legistar page" (legislative management system)
- [GAP] M4 L270-272 — "D-75, D-76 (the framework and the object catalogue have never been connected; aspiration and goal do not exist)"
LAW
- [NEED] M4 L258 — "'every document that concerns this ordinance' is one query" (ordinance as an entity linking documents)
- [EXAMPLE] M2 L135-142 — "agenda packets, budget exhibits, portal pages" become citable bundles
COURTS
- none in 1-300
ANALYSIS
- [DESIGN] M2 office formats L154-177 — "Spreadsheets, Word-format and presentation documents are ONE container problem"; "Two element references land BETTER than PDF's page+rect: Sheet1!B14 and slide+shape are stable and human-meaningful — the first time the record can cite finer than a whole document" (cell-level citation = basis for calculations)
- [DESIGN] M2 topology L218-226 — extraction tiered; "3. Tables, visuals, OCR — later tiers, deferred by name rather than forgotten."
- [DOCTRINE] M2 L231-232 — "Every tier states what it could not do; undetermined stays first-class and text is never silently truncated."
- [EXAMPLE] M2 L135-136 — "budget exhibits"
QUESTIONS
- [NEED] M4 L258 — "'every document that concerns this ordinance' is one query"
- [NEED] M5 L284-297 — "search reaches the text of the documents the record holds"; gap: "bundles_fts indexes bundle.md frontmatter and inline .md/.txt files only ... a group that captures 500 agenda packets can search its notes about them and not the packets"; Design: CONTENT-SEARCH-DESIGN.md "the answer naming its level and the content-axis state"
- [DESIGN] M5 L288-289 — "the index never leaves the Durable Object and stays member class and above"
DOCTRINE
- [DOCTRINE] preamble L11-18 — two constructs QUEUE and ACT; "see what it will refuse BEFORE it runs, author the reason, get a receipt"; weight ladder "reversible · reasoned (never prefilled) · terminal · attested"; "UNDETERMINED is a display primitive rendered identically everywhere."
- [DOCTRINE] L74-78 — "Milestones are capabilities, never phases ... acceptance is stated in terms of the RECORD rather than the code"
- [RULING] M2 D-55 L182-206 — Bob RULED: content produced by a third-party script "is recorded as produced by THAT party and not by the hosting site"; attribute by ORIGIN; "authority_state that is undetermined unless something asserted it"; SETTLED 2026-09-21 (CLIENT-RENDERED.md) — authorship of content by organisation (host vs third party)
- [RULING] M4 L276-279 — "REGRADE IS A MEMBER CAPABILITY (DEC-46 (c), 2026-08-04)": "a member re-runs a grade against a declared bias and reads the structured diff with its causal chain"
- [DESIGN] L42-78 — process split (QUEUE.md, DEBT.md etc.) — now retired process per CLAUDE.md (old process retired 2026-09-25); MILESTONES is history of the old process

## chunk 301-602
TIME
- [NEED] M10 L481-488 — "an outward action can say which findings justified it and what came back"; acceptance: "an action names the finding it rests on, records what was sent and what returned, and its non-response is itself a finding" (non-response over time as finding)
- [DESIGN] M10 absorbs L492 — "D-147 / D-148 (the records-request lifecycle and the fee quote as evidence)"
- [DESIGN] M10 DEC-72 L502-511 — case "published by a project OWNER against the PROJECT'S bar at act time, members pinned by version like a commit" (as-of: bar at act time; version pinning)
- [DESIGN] M6 L318 — "a Memento interface that answers" (Memento = time-based access to archived versions)
- [DESIGN] M7 absorbs — none on time
ORGANISATIONS
- [DESIGN] M7/M8 L372-374, L395 — "D-78 / D-82 (both bundle writers hardcode surfaced_by: human, and an assistant-surfaced focus must look like one)"
- [DESIGN] M8 L383-387 — task inbox, project ownership, expertise declared and confirmed (group's own organisation)
- none on government organisations in 301-602
LAW
- [DESIGN] M10 L485-488 — published case: "a ceremony that refuses before it signs and cannot be signed before the exclusion is authored"
- none further on law in 301-602
COURTS
- none in 301-602
ANALYSIS
- [GAP] M6 L323-326 — "capture-byte custody at scale ... no plan for R2 growth, the free tier's storage ceiling, retention, or a second copy, while one budget book measured 39.6MB" (budget books are large)
- [DESIGN] M8 L407-408 — "B · BALLOT is a multi-party act with computed arithmetic (the adminarith/projectownerarith ops exist so the tally is computed rather than transcribed)" (computed vs transcribed numbers)
- [DESIGN] M9 L446-451 — "the page states BOTH derived strengths — capture and connection — each as its own weakest leg, BY NAME; never as a score, never as an average, never composed into one letter; and an ungraded leg SUSPENDS its axis, which then reads undetermined and names the leg that is why." (grade of a derived thing)
- [OPEN] M10 watched L494-496 — "re-read D-159 (how many legs are ungraded and why — op=versionstrength's ungraded[])"
QUESTIONS
- [DESIGN] M5 L307-312 — "a truncated index entry must SAY it is truncated, per bundle. A search that silently under-reports ... is a record claiming more coverage than it has"
- [RULING] M5 L300-305 — Bob 2026-07-25: document text searchable "on the grounds that searching is mining and mining is the workflow"; op=search member class and above; FTS5 index never leaves the DO
- [DESIGN] M8 L405-416 — constructs T TASK, B BALLOT, "P · PROPOSAL is a derived finding awaiting an authored act — D-90's 'derived informs, authored binds' is its charter, and D-82 requires it to LOOK derived", J JUSTIFIED TRANSITION "must NEVER prefill it", A ATTESTATION, S SELECTION-SCOPED, U UNDETERMINED
- [DESIGN] M8 L429-433 — "A record that must ask a person something, and cannot, will either invent an answer or stay silent — and both are failures this project has already named."
- [DESIGN] M9 L446 — "a member asks a question and gets an inquiry" (question = inquiry object, not a natural-language answer)
- [DESIGN] M9 DEC-60 L459-472 — investigative session placed on M9: IS-1/2/4/7 versions, state machine, "the suggest endpoint", strength; IS-5/6/9 "the ai credential's scope, the run object and its observation log, the run harness"; IS-3 and running-session surface M8; IS-8 M10
- [DESIGN] M8 L380-381 — "where the plane knows something a person would otherwise have to work out, the surface says it instead of asking"
DOCTRINE
- [RULING] M6 DEC-46(b) L328-334 — import lands in "a NEW PROJECT PER DISTINCT SOURCE BIAS ... may NOT merge an imported lens into an existing project"
- [RULING] M6 DEC-45 L336-347 — "A published case imported elsewhere is a FINDING and gets no inherited standing (DEC-40's determination 4)"; regrade against destination's effective bias; "The import may not author a project objective or a bias statement on the member's behalf — the never-prefill rule"
- [RULING] M10 DEC-72 L502-511 — case = production of a project; "at least one load-bearing member required"; "A finding serves many cases across projects"
- [DOCTRINE] M10 L513-519 — "M0–M8 are substrate and surfaces ... and not one of them is a member can make a case"
- [DOCTRINE] Dependencies L537-542 — "M9 depends on nothing ... the rung the whole system is for is not waiting on the substrate" (the claim layer needs no capture/framework; analogous structural point: inquiry is not waiting on substrate)
- [DESIGN] L564-569 — "store.mjs is ~4,900 lines" (module size context; history)
- [DESIGN] L586 — Placement lives on branch coord (retired process)
