# consequences (T8)

**Status** · session_011yhNE6j88pmjeN8wq7pUjm · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three questions; I am building on the best reading of each and will align when you answer.

1. **conformance's read (R1) and an early merge.** R1 reads `conformance.determinationRead`. Its answer's shape is not fixed by conformance R9 in field names. My reading: `{ok: true, id, project, outcomes: [{standard, outcome}] (or a map standard → outcome), superseded_by | live}`, `NO_SUCH_DETERMINATION` when absent or invisible. I take conformance as an injected dependency (`deps.conformance`) and read it through a small adapter tolerant of those spellings, and I test against a stand-in honouring conformance R9. Please merge conformance early when it lands, and tell me (or CONFORMANCE #1) the exact field names for the project, the per-standard outcome and supersession, so the adapter is one spelling.

2. **The passage text of an operand (R2).** My Uses give me `content.contentRow` "and its passage text", but content's Provides has no read of a passage's text (`contentRow` has none; the units are extraction's, not in my Uses). My reading: I take a `passageText(contentId) → string | null` dependency, defaulting to `content.passageText` if content provides it, else null; with no text read, an operand is "held in a form not read" and the part is `undetermined` with that why (R4), never computed on the author's word. Proposal: content provides `passageText(contentId)` (the typed text for a typed row, else extraction's units at the row's extent), a small change to content, through you (§4).

3. **R9 with R5 and K172.** R9: any `unproven` part makes overall `undetermined`. K172's route for "no consequence" is an assessed part saying so, addressed; but that part names no causation inquiry, so it is `unproven` (R5, R12) and `addressed` stays `undetermined` forever, so escalation R14 never ends on it. My reading, until you rule: literal (unproven gives undetermined), tested so. Two readings that would fix it, for you (or Bob, since it changes when an escalation can end): (a) a part whose measure is zero (value 0 or range [0, 0]) answers causation `not_applicable` and is not counted unproven; (b) R9 counts `unproven` only for parts not addressed. I recommend (a).

Also, lower-level choices I am making (for your rulings file, reported as done): overall `addressed` precedence is `undetermined` over `not_addressed` (an undetermined part is almost always never addressed, so otherwise R9's undetermined clause could never show); a machine or empty author may record only a computation (anything else `MACHINE_CANNOT_ASSESS`, asked after R1's list); an evidence or rests-on id that resolves to nothing the author may see is refused `NO_SUCH_EVIDENCE`; a superseded part is not revised or addressed again (`ALREADY_SUPERSEDED`); a revision needs a reason (`NO_REASON`, `BAD_REASON` over 500), as conformance R7.
