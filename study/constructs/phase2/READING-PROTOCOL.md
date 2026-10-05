# Reading protocol, phase 1 of the second study (BOB #112, 2026-10-05; adapted from BOB #110's)

Bob, the product owner, requires that every source in this study be READ WHOLE, never scanned. You are one of twenty-three readers; between you, every document bearing on the question is read in full once. Analysts in phase 2 will rely on your note instead of the source, so anything you skip is lost to the study.

## The question the study serves
Read `constructs-brief.md` (same folder) first, whole. In short: how much support does Civicsmith need, and have, for three more constructs, and how do they change the six already studied?
- **PEOPLE**: individuals of every kind (officials, staff, contractors' principals, lobbyists, donors, parties, witnesses, members of the public a document names); names and aliases; identity and same-name ambiguity; posts held and careers inside and outside government; staffing of organisations over time; education, degrees, licences, military service and other credentials; memberships; statements and acts; interests, gifts, money given and received; family ties; who knows who; privacy, safety, publication and legal exposure; the group's own members' ties to those it examines.
- **EVENTS**: things that happen in the world (meetings, votes, adoptions, signings, awards, payments, filings, communications, statements, inspections, appointments, orders, hearings); their dates (exact, approximate, uncertain), places and participants; sequence and timelines; processes and their steps; how events relate (authorises, answers, amends, reverses, part of, follows from, causes); what should have happened against what did; who knew what when; patterns and anomalies of sequence. (Not the group's own "actions" in response to a finding, which are a separate, taken word.)
- **MONEY**: amounts and their stages (budgeted, appropriated, committed, encumbered, spent, received, transferred, owed); sources (taxes, fees, grants, bonds, settlements) and destinations; funds, accounts, programs; flows and transfers; budgets, actuals, fund balances; the rules that govern movement (restricted funds, fee limits, procurement thresholds, transfer authority, grant conditions, appropriation); commitments (contracts, change orders, encumbrances, grants, debt, promises); what money buys (goods, services, deliverables, quantities) and what is delivered for it (outputs, unit costs); campaign and political money; ledgers, checkbooks and registers.
- **THE SIX AS THEY MEET THE THREE**: anything in a source about TIME, ORGANISATIONS, LAW, COURTS, ANALYSIS or QUESTIONS that bears on people, events or money, or that a design for the three would have to change.
- **SYSTEM REQUIREMENTS** (record them under DOCTRINE, kind DOCTRINE or DESIGN): every non-functional requirement any construct's design must meet: performance and the everyday path, scale and storage limits, the runtime, security, privacy and safety, sovereignty and vendor independence, reproducibility, publication, testability (K1460).
- **DOCTRINE**: any rule, principle or ruling that constrains how any of the three may be built (the machine never concludes; grades; undetermined; personal data and privacy; relations not traversed; cause; jurisdiction-free product; layer order; etc.).

## How to read
1. Your sources are plain-text copies in `src/` (folded at 900 characters, HTML markup removed; nothing else removed). For each assigned file, run `wc -l` to get its line count N.
2. Read it with the Read tool in consecutive chunks (offset/limit, at most 500 lines per call) from line 1 to line N. Never skip a range. Never use grep, head, tail, a script or a summary in place of reading. You may grep only AFTER the full read, to re-locate a passage you want to cite.
3. Extract as you go, after each chunk, into your note, so nothing read is lost to a later chunk.
4. If you cannot finish a file, write exactly the ranges you read. Never imply a full read you did not do.
4a. **Checkpoint (the study may be resumed in another session).** Save your note to disk after every chunk you read, with the certificate updated to the ranges read so far (`read 1–500, 501–1000 (in progress)`); mark a file `complete` only when its last line is read. **If your note already exists when you start**, you are resuming: keep everything in it, and continue each file from the first line its certificate does not cover.
5. Read-only: never edit, commit or push anything in /home/user/bio or /home/user/civicos-process.

## What to extract
For every passage that bears on a construct, one bullet under that construct's heading:
`- [KIND] <where: § heading or id, and src line> — <the gist, precise> — "<verbatim quote, at most 30 words, for anything an analyst may need to cite>"`
KIND is one of: NEED (work members must be able to do), EXAMPLE (a concrete case, use case or journey step), DESIGN (how it is meant to work), RULING (a DEC or K ruling, with its number), DOCTRINE (a constraint), BUILT (a statement that it exists), GAP (a stated gap, deferral or limit), OPEN (an open question), CONFLICT (sources disagree).
Be exhaustive within relevance: one passage may yield bullets under several constructs. Precision over paraphrase: keep numbers, ids, section names and conditions. If a construct has nothing in a document, write "none in <file>".

## The note
Write `notes/<your reader id>.md`, in exactly this shape:

```
# <reader id>: <files>
## Reading certificate
- <file>: N lines; read 1–500, 501–1000, …, x–N (complete | stopped at line y because …)
## What these documents are (3–6 lines each)
## PEOPLE
## EVENTS
## MONEY
## THE SIX AS THEY MEET THE THREE
## DOCTRINE
## Cross-construct observations (connections between the nine constructs these documents make or imply)
```
Keep every heading even when empty ("none"). No length limit: completeness is the point, but no padding. Return, as your final message, the reading certificate and a 10-line summary of the most important findings.
