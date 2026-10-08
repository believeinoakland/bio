# events (T36)

**Status** · session_01Lpr5zoWzhMTrc3S8CRoaGd · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R49's rows, three points where the wording leaves a choice. My best reading, which I am building now:
1. "attestations citing a capture extent (R7)": both forms that carry a capture extent, an `extent` attestation and a `dated_fact` attestation (it cites the fact's capture and extent, and was added by its own act and author, distinct from the dated fact's row). Testimony never.
2. A relation's citation (R17, held as an attestation with `serves='relation'`): an item `kind: "relation"`, `record` the relation id, `field: "attestation"`, `withdrawn` per R20. It is an attestation citing a capture extent, but its record is the relation, not an event.
3. `withdrawn` for an event's attestation: true when the event is a use withdrawn (R45), since the record named is then shown withdrawn; otherwise false (attestations themselves are never withdrawn). A merged-away event's rows answer the kept event (alias), and are not marked withdrawn.
Also: `EXTENT_MALFORMED` when `extent` is given and is not an object of a kind `content` knows (`CONTENT_EXTENT_KINDS`); `canonicalExtent` itself never throws, so "cannot read" is read as that.
