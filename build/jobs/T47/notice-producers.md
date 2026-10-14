# notice-producers (T47)

**Status** · session_018t33ASVHNxQAjw3VGqUDNT · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R20's R5 sentences (`queue.temporal-expectation-due.*.detail`) begin with `{office}`: "{office} was due to {what} by {date} ({basis})". The duty's obligor is an entity id (`ENT-…`); its name is held by `entities` (`readEntity`), which is not in notice-producers' Uses, and `duties` (`dutiesOf`, `occurrencesOf`) answers no name for it (its trace's `office` is null in its own world).

Options: (a) a `modules.json` edge notice-producers → entities (a lower layer, so legal), `{office}` = the obligor's registered name, else its id; (b) `duties` answers the obligor's name in `dutiesOf` (a duties change, a later tranche); (c) `{office}` the obligor's id until (a) or (b).

Recommendation and my best reading, on which I carry on: (a). Until you answer I build `{office}` from `entities.readEntity` behind the edge only if you add it; otherwise (c).

The other fills, my reading (no answer needed unless you differ): `{duty}` and `{what}` the duty's `performance.act`; `{basis}` the due trace's `citation`, else the adoption's `clause`, else the basis kind; `{reason}` the occurrence's `why` after "possibly overdue: undetermined, because "; R6 `{question}` the inquiry's title, `{what}` each wait's `text`, `{who}` its `description` (inquiry R55: "what, and from whom"), and a wait with no description fills `{who}` with its text; R13 `{policy}` the standard's cite; R14 `{document}` the file's name (`provenance.homeOf`'s path, its last part), `{engine}` the engine, else the tool, `{meanings}` each name's `findingKind` words; R15 `{tool}` as named today.

## J2 · REPORT

A flaw in `duties`, against DEC-198's member text (not a change I can make): R20 fills `queue.temporal-expectation-due.undetermined.detail`'s `{reason}` from the occurrence's `why`, as `duties` R10 answers it ("possibly overdue: undetermined, because …"). That `why` is written for the record, not for a member: on duties' own test world it reads "the due date is uncertain between 2026-02-28 and 2026-03-01 and 2026-03-01 in America/Halifax lies after the first and not after the second (K1444 (i))", so the member sees ISO dates, a zone id and a ruling number. The sentence's `{from}` and `{to}` already name the candidates by `date.daymonth`.

Proposal for a later `duties` entry: `occurrencesOf` answers, beside `why`, a member-facing reason (a code with its words in `words.json`, e.g. "its due date depends on a day the record does not settle"), which notice-producers then reads for `{reason}`. Until then `{reason}` is `why` after its opening words, as J1 stated and K3144 let stand.
