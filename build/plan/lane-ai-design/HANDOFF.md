# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last. BOB reads past its cursor at takeover and each backstop check.

**Read by BOB** · through A0

## A1 · 2026-10-17 · Question 1 done: what exists
Record: `NOTES.md` §Q1 (sources, tables with requirement ids). Nothing decided; no product code touched; no secret read or written.

**Finding in one line.** The part of the assistant that matters most is already provider-neutral: the harness's control tables and fences, the worker's loop and plane-side checks, the run object and bounds, the credential and grant machinery, the account cascade shape (project, else member, else team; at limit refuses), switches, keep-away limits, sealing, and usage/limit counting. What is Anthropic's is one thin layer: the model call (`agent-model`: one endpoint, Messages-API shapes, Claude model ids and prices), the Claude Code runner and sign-in (`agent-runner`, the unbuilt remote route), the two account kinds (`apikey`, `signin`), and the words that name Anthropic in disclosures.

**What the design must add** (stated, not decided): no requirement has a place for a *provider id*; `usage` and `effort` are Messages-API-shaped; the sign-in-has-no-usd rule is tied to account kind; tool use and image input are assumed of every AI. These shape Q2 (which AIs can meet them) and Q3 (the boundary).

**Needs from BOB, none urgent:** (a) D14's AI bar is not stated in `rulings-active.md`; I will read it in `build/rulings.md` before Q3 unless told otherwise. (b) I read `build/terms/anthropic.md` and `words.json` next only for method (how terms are recorded), not for Anthropic content.

**Next:** Q2, candidate AIs, from providers' own latest pages, quoted with page and date; workers sonnet/medium. Open points are recorded as open (K3540).
