# notice-producers (T47)

**Status** · session_018t33ASVHNxQAjw3VGqUDNT · depth 2 · RUNNING until 2026-10-14T00:51:54Z (plane tests (test/m/plane, a user of noticeItems)) · handled B2

## J1 · QUESTION

R20's R5 sentences (`queue.temporal-expectation-due.*.detail`) begin with `{office}`: "{office} was due to {what} by {date} ({basis})". The duty's obligor is an entity id (`ENT-…`); its name is held by `entities` (`readEntity`), which is not in notice-producers' Uses, and `duties` (`dutiesOf`, `occurrencesOf`) answers no name for it (its trace's `office` is null in its own world).

Options: (a) a `modules.json` edge notice-producers → entities (a lower layer, so legal), `{office}` = the obligor's registered name, else its id; (b) `duties` answers the obligor's name in `dutiesOf` (a duties change, a later tranche); (c) `{office}` the obligor's id until (a) or (b).

Recommendation and my best reading, on which I carry on: (a). Until you answer I build `{office}` from `entities.readEntity` behind the edge only if you add it; otherwise (c).

The other fills, my reading (no answer needed unless you differ): `{duty}` and `{what}` the duty's `performance.act`; `{basis}` the due trace's `citation`, else the adoption's `clause`, else the basis kind; `{reason}` the occurrence's `why` after "possibly overdue: undetermined, because "; R6 `{question}` the inquiry's title, `{what}` each wait's `text`, `{who}` its `description` (inquiry R55: "what, and from whom"), and a wait with no description fills `{who}` with its text; R13 `{policy}` the standard's cite; R14 `{document}` the file's name (`provenance.homeOf`'s path, its last part), `{engine}` the engine, else the tool, `{meanings}` each name's `findingKind` words; R15 `{tool}` as named today.
