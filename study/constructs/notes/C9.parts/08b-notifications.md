@@FILE NOTIFICATIONS.txt (chunk 121-280)
@@TIME
- [DESIGN] NOTIFICATIONS §The catalogue "Clock-driven", lines 199-223 — "the generator is time passing, with no new evidence": "overdue required successor in a progression `[FINDING]` (DEC-10)"; "temporal expectation coming due `[FINDING]` (framework §8.2, D-73)"; "a re-run owed after a lens change `[OBLIGATION]` (D-86 ...)" LIVE 2026-09-23; "monitoring recheck due / deadline sweep `[CONDITION]` (S-7)"; "archive-fallback eligibility reached — three failures or fourteen days `[CONDITION]` (D-104)"; "capture session TTL expiring with work outstanding `[CONDITION]`".
- [RULING] NOTIFICATIONS DEC-110 (Bob 2026-10-01), lines 157-163 — queue may be re-sorted by "**time added**, **time due**, **case** or **kind**" (items carry a due time).
- [DESIGN] NOTIFICATIONS §The classes, lines 182-184 — severity is orthogonal: "an unhandled obligation past its deadline is what \"warning\" means here".
- [EXAMPLE] NOTIFICATIONS, lines 186-188 — "an overdue minutes finding is evidence about a public body; a subrequest ceiling is a limitation of our own run." (lateness of a body = evidence/FINDING).
- [DESIGN] NOTIFICATIONS, line 237 — render deferred: "at its request's `expires` recorded UNDETERMINED and released `[CONDITION]`" (LIVE).
- [DESIGN] NOTIFICATIONS, line 254 — "measure decay on a bias statement `[FINDING]` (D-87, D-90 — reports, never blocks)" (time-based decay of a measure).
@@ORGANISATIONS
- [EXAMPLE] NOTIFICATIONS, line 187 — "an overdue minutes finding is evidence about a public body".
- [DESIGN] NOTIFICATIONS §The classes table, line 177 — (as written, before DEC-107) OBLIGATION = "something a named person must do for the record to proceed" / "its assignee, or whoever it is forwarded to" / "resolved — record state, so it leaves EVERYONE's list".
- [DESIGN] NOTIFICATIONS §Presented and treated differently, lines 147-149 — "obligations populate a **flow model** of the institution, declared against observed (D-128)".
- [DESIGN] NOTIFICATIONS "Data-flow driven", line 227 — "authority undetermined at capture `[OBLIGATION]` (D-98, RULED: created automatically)" (the issuing authority of a document unknown).
- [DESIGN] NOTIFICATIONS "Governance and membership", lines 241-246 — member-side organisational items: endorsement owed on pending administrator or owner vote; "expertise declaration awaiting an administrator's confirmation"; membership request; "an export was performed — every administrator is notified" (N-1 LIVE); "every owner of a project is inactive; rescue is available (D-47)"; invitation spent/expired.
@@LAW
@@COURTS
@@ANALYSIS
- [DESIGN] NOTIFICATIONS "Analysis (M4)", lines 248-257 — "each of which is a PROPOSAL in queue terms": "assistant-surfaced focus `[FINDING]` (D-78, D-82 — must LOOK derived)"; "missing predecessor in a progression `[FINDING]` (D-73 — the sharper of the two)"; "a connection whose grade is improvable `[FINDING]` (D-72)"; "gap list derived from an objective's satisfaction condition `[FINDING]` (D-76)"; "measure decay on a bias statement `[FINDING]` (D-87, D-90 — reports, never blocks)"; the out-of-inquiry lead (LIVE).
- [DESIGN] NOTIFICATIONS "Data-flow driven", line 230 — "duplicate document detected `[FINDING]` (D-60)".
@@QUESTIONS
- [DESIGN] NOTIFICATIONS line 250 — assistant-surfaced focus "must LOOK derived" (D-78, D-82) — machine output visibly labelled as derived.
- [BUILT] NOTIFICATIONS, lines 255-271 — out-of-inquiry lead (D-213, DEC-60, LIVE PL-15, `store.mjs #findingsOutOfInquiryLead`): a FINDING not a CONDITION; its case set "derives from the ancestors of the inquiry the evidence BEARS ON, never from the ancestors of the inquiry the run was working"; "the document is CAPTURED and **no basis entry is made**, and the item's `basis` says so as a MEASUREMENT"; "absence at one level is not evidence of absence at the next, and saying which is a first-class obligation".
- [BUILT] NOTIFICATIONS, lines 208-220 — bias-debt: "ONE item per run whose lens `moved`, as `op=airun` computes it and never recomputed, its basis naming the lens then and now".
@@DOCTRINE
- [DESIGN] NOTIFICATIONS, lines 121-134 — CONDITION dispositions: recorded (no surface), shown in place (worth seeing, not acting), actionable (earns a queue item); "The middle disposition is the one a naive implementation loses" (renamed from "noticed" 2026-10-02, K1114, N493, DEC-110).
- [RULING] NOTIFICATIONS, lines 157-160 — DEC-110 (Bob 2026-10-01): member names "To do", "Noticed", "Signal" ("Signal" replacing "Condition", "which the auditor's findings use for \"what happened\""); "until the flow model and the signal history exist, the link goes to the thing the item is about. The queue stays one list."
- [DESIGN] NOTIFICATIONS, lines 144-156 — one queue, three homes (case, flow model, signal history); "The queue is the attention layer INTO those homes".
- [DOCTRINE] NOTIFICATIONS, lines 166-172 — severity ladders rejected: they "encode how LOUD a thing is rather than what it MEANS ... everything becomes a warning".
- [DOCTRINE] NOTIFICATIONS, lines 186-192 — FINDING and CONDITION must not be merged; "a technical complication the system can classify is never surfaced to a member as a choice"; "A CONDITION earns a queue item only when a member's action can change it."
- [DESIGN] NOTIFICATIONS, lines 196-197 — "Ids are allocated when a generator is built, not now".
- [DOCTRINE] NOTIFICATIONS, line 203 — bias debt "**DISCLOSED, never blocking**" (DEC-20 / D-188); "Only an uncleared HUNCH disqualifies."
@@CROSS
- NOTIFICATIONS line 159: DEC-110 notes "Condition" is the word "the auditor's findings use for \"what happened\"" — the audit-finding vocabulary (Criteria, Condition, Cause, Effect; DEC-77, cited in canon-mission line 170) is reserved for findings about bodies; signals about our machinery must not borrow it.
- The clock-driven FINDINGS (overdue required successor; temporal expectation coming due) are TIME findings about ORGANISATIONS' declared obligations (progressions); action-clock (our own act's legal deadlines) and plan-checkpoint items are absent from this catalogue (confirmed by canon-constructs line 117).
- "Analysis (M4)" items are machine-derived proposals (QUESTIONS/ANALYSIS) surfaced as FINDINGs that a member adopts/defers/dismisses — the general proposal-then-adopt pattern.
