# BOB #111's review of the synthesis (2026-10-05)

`synthesis/constructs.md` was read whole and checked against the six studies, the three reviews and `BOB-NOTES.md`, all read whole by BOB #111.

## Checked and found sound
- **Every decision the studies put to Bob is carried or settled.** TIME D1–D10, ORGANISATIONS D1–D8, LAW 1–7, COURTS D-C1–D-C7, ANALYSIS 1–11, QUESTIONS Q1–Q7, plus the reviews' additions (case-checker R13, consequences R2, sampling under DEC-22, the asking scope) map onto B1–B20. ANALYSIS 8 is reported as ruled (DEC-67), LAW 2 as no change (K102), and ANALYSIS 11 (order of work) as BOB's.
- **All twelve BOB-NOTES conflicts are settled.** The obligation construct is one, in `duties`/`DUT-`, with DEC-107's word and code kept and the reserved queue kind produced. There is one layer-5 order. The relation stores are split by their ends (`lines` for entities, `standards` for law). The doctrines on private individuals, the machine's words and outside sources are each one. The DO storage figure is 10 GB.
- **The layer-5 order** (entities, lines, local-facts, connections, standards, chronology, progressions, duties, bias, observation-log, query-language, retrieval, calculations) was re-checked against `build/modules.json` @ 8fa5ab4e3d. `standards` and `local-facts` use only layers 1–4. `consequences` and `action-clocks` use `conformance` (layer 9), so they cannot move; `conformance` uses `publication`. Nothing breaks.
- **The corrections** taken from the reviews are cited. R-1 T-E1 (`starts: received`) was verified by BOB in code (`action-clocks/index.mjs:695–698`).
- **K1425 is respected.** Stages only, with no tranche plan and no dates.

## Corrected by BOB
1. **The governing day goes back to Bob, as B9 (iii).** TIME D7 had become a "correction" (§7 item 3). actions R12 says "UTC calendar day", so reading it as the local day changes what a requirement means, which is Bob's (P17; R-1 T-P17). §7 item 3's fix now follows B9 (iii).
2. **Stage 0's list of corrections.** Items 2, 4, 5 and 6 need `civil-time` and come in stage 1; fixing them module by module first would rebuild the engine twelve times (G10). Item 3 is fixed at its two reachable sites in stage 0, once B9 (iii) is ruled.
3. **Following a court register now respects B15 (b).** The draft let monitoring use a member's credential on its unattended tick, against B15 (b) and D13. Public rendered or cookie-only registers are re-rendered on the tick; a register behind a member's account is refreshed only by the member's act.

## Left as the draft has it, noted
- **Stage 1's size** (5 new modules, about 195–225 requirements) is a sum of the studies' own estimates, not a measurement. It is a description, not a plan (K1425).
- **B2 recommends moving now** rather than the registration bridge, because B13 (iii) (a leg on a held standard) needs `standards` below `inquiry` in code from stage 1. This is consistent with R-2 L-E6, which asked only that Bob be shown the alternative.

## Corrected after Bob's review (2026-10-05)
Bob corrected three points, recorded as K1429–K1431 on `tranche/T32`, and the synthesis is amended to match:
1. **K1429, the account.** A Claude subscription can run the assistant, as Bob established at DEC-55 (2026-08-04). Anthropic's Agent SDK article (Agent SDK and third-party app usage "still draw from your subscription's usage limits") and its legal-and-compliance page confirm it. R-3 read the 15 June pause as withdrawing subscription use; it withdrew only a planned separate credit. My review should have caught this against DEC-55 and did not. The defect is in the code (an API key only), not in the setup page. The subscription path runs through the Agent SDK in a container.
2. **K1430, substrate first.** The stages build services, not screens; the design stream designs against them once they are in. A screen is never a precondition of a stage.
3. **K1431, dates from dependencies.** A due date's basis may be a rule, a commitment, a dependency (the event it must precede, and why) or the group's window. A dependency date is derived from the event it serves, and missing it is a dated fact about sequence, never a violation.
