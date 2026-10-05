# Analysis protocol, phase 2 (BOB #110, 2026-10-05)

You are the analyst for ONE construct. Phase 1's seventeen readers have read every source document whole and written notes; `digest/<CONSTRUCT>.md` gathers every reader's section on your construct, plus the DOCTRINE and cross-construct sections. Your job is to come to real-world conclusions about how to proceed, which Bob, the product owner, will rule on.

## Read first, whole (by `READING-PROTOCOL.md`'s method: consecutive chunks to the end, no scanning)
1. `constructs-brief.md`.
2. `digest/<CONSTRUCT>.md`, all of it.
3. `digest/DOCTRINE.md` and `digest/CROSS.md`, all of it.
4. The `## Modules` sections of `notes/M1.md` … `notes/M5.md` for every module your digest names.
Then go to primary sources (in `src/`, `src/req/`, or the code under /home/user/bio) wherever a claim your conclusions rest on needs confirming, or the digest shows a reader's note is thin or ambiguous. Read the relevant section whole, not a grep hit. Say in your study which primary sources you opened.

## Ground it in the real world
The product must work for real civic watchdog groups, against real governments, with real data. Before proposing anything, research with WebSearch and WebFetch (several searches, sent together):
- **How the work is actually done:** how watchdog groups, investigative journalists, auditors, legal-aid and civic-tech groups handle this construct in practice. Name the methods and the failure modes.
- **Established standards and data models** that already solve part of the problem. Adopt or adapt them rather than inventing, and say which and why. Starting points, by construct: TIME: iCalendar RRULE (RFC 5545), ISO 8601 intervals and partial dates, temporal-validity ("as of") modelling, government notice and deadline rules. ORGANISATIONS: Popolo (organizations, posts, memberships), Open Civic Data, OCD-IDs, org-chart and contract data standards such as OCDS. LAW: Akoma Ntoso, USLM, ELI and the FRBR work/expression model for versions in force; how code publishers and legislative management systems publish. COURTS: CourtListener / RECAP and Free Law Project APIs, PACER and state court access and their costs, citation formats and parsers, how consent decrees are monitored. ANALYSIS: reproducible analysis practice (cited inputs, recorded method), spreadsheet engines that run in JavaScript (e.g. HyperFormula), Datasette, open-data portal APIs (Socrata/SODA, CKAN, ArcGIS), PDF table extraction and its accuracy. QUESTIONS: grounded question answering with citations and abstention, tool-using assistants, evaluation of hallucination, and the unauthorised-practice-of-law line for explaining law to the public.
- **Real availability and cost:** which sources a group can actually get, in which formats, at what cost, with what legal limits. Check them; don't assume.
- **The runtime:** this product runs on Cloudflare Workers and Durable Objects with per-request limits (see the Technical Architecture Decisions notes in the digest). A proposal that won't fit that runtime must say how it would run.
Cite each external fact with its URL.

## Write `studies/<CONSTRUCT>.md`, in exactly these sections
1. **Anticipated needs.** The concrete work, from the digest (cite the note's source and §) and from the real-world research (cite the URL). Group it; give each item a one-line example in a member's words, and mark how central it is: core, regular or occasional.
2. **Levels of support.** A ladder, L0 to L4 or L5, specific to this construct, each level defined by what a member can do. Map each need from §1 to the lowest level that serves it.
3. **What exists now.** Per module: what it provides (R ids), whether it is built, reachable by a member (op and screen) and touched by an AI; its layer. Place the system on the ladder, separately for "built" and "a member can actually use it today".
4. **Gaps.** Each need → the missing capability, with severity: blocks core work, degrades it, or nice to have.
5. **Proposed architecture.** The target level and why; what to adopt from the real world; the data model (objects, fields, relations, versions and as-of); module changes (extend X; a new module Y with purpose, layer and uses); any change to the total order and its effect on the modules that use the moved one (check `build/modules.json`); the AI's role (skills, run modes; what the machine proposes, what the member decides); the doctrine kept, each rule cited; what it needs at runtime and in deployment.
6. **How to proceed.** Staged: stage 1 (what it unlocks, named journeys or use cases, a rough size in modules and requirements, and what must be measured first), then later stages, each with the trigger that justifies it. Name the risks and how each is contained.
7. **Interfaces with the other constructs**, specifically what yours needs from each and supplies to each.
8. **Decisions for Bob.** Only policy and doctrine, the meaning of requirements, architecture at the level of layers and product modules, and UX. Each with options and a recommendation, and why. Every lower-level choice is BOB's: state it as decided, not as a question.
9. **Sources opened.** The primary sources and URLs you read beyond the digest.

**Checkpoint (the study may be resumed in another session).** Keep `studies/<CONSTRUCT>.md.work` as your working notes (what you have read, searches run, findings so far), saved after each step; write `studies/<CONSTRUCT>.md` section by section as each is finished. If either file exists when you start, you are resuming: read both whole, keep what is there, and continue from the first unfinished step.

Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Return a 20-line summary as your final message.
