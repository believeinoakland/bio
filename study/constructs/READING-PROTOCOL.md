# Reading protocol, phase 1 (BOB #110, 2026-10-05)

Bob, the product owner, requires that every source in this study be READ WHOLE, never scanned. You are one of seventeen readers; between you, every document bearing on the question is read in full once. Analysts in phase 2 will rely on your note instead of the source, so anything you skip is lost to the study.

## The question the study serves
Read `constructs-brief.md` (same folder) first, whole. In short: how much support does Civicsmith need, and have, for six constructs, and what architecture would give it?
- **TIME**: deadlines of every origin, business days, holidays, time zones, effective and in-force dates, as-of reasoning, fiscal periods, recurring meetings and notice rules, limitation windows, timelines and chronologies, lateness and patterns, dates in text.
- **ORGANISATIONS**: governments and public bodies of every kind and the private bodies acting for them; departments, boards, offices and positions versus their holders over time; relationships, responsibilities, OBLIGATIONS (who owes what to whom, by when, under what authority), reporting lines of every type, contracts, accountability chains, change over time.
- **LAW**: charters, statutes, codes and their structure, ordinances, resolutions, regulations, policies, budgets as law, contracts and commitments as binding; definitions, cross-references, amendments, versions in force, applicability, hierarchy; obligations law imposes; conformance; explaining a provision.
- **COURTS**: court cases (the group's own and others'), dockets, parties, filings, orders, judgments, appeals, settlements and consent decrees, precedent and interpretation; administrative and quasi-judicial proceedings (hearings, commissions, inspectors general, audits, grand jury reports, AG opinions).
- **ANALYSIS**: calculation in code, datasets, filters, counts, aggregates, percentages, trends, budget against actuals, tables, spreadsheets as a working medium, reproducibility, the grade of a derived number, charts in publications.
- **QUESTIONS**: natural-language questions and the assistant: what members ask, what the assistant and AI roles are designed and built to do, how answers cite, state absence and stay labelled, what the machine may and may not do.
- **DOCTRINE**: any rule, principle or ruling that constrains how any of the six may be built (the machine never concludes; grades; undetermined; private individuals; relations not traversed; jurisdiction-free product; layer order; etc.).

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
## TIME
## ORGANISATIONS
## LAW
## COURTS
## ANALYSIS
## QUESTIONS
## DOCTRINE
## Cross-construct observations (connections between constructs these documents make or imply)
```
Keep every heading even when empty ("none"). No length limit: completeness is the point, but no padding. Return, as your final message, the reading certificate and a 10-line summary of the most important findings.
