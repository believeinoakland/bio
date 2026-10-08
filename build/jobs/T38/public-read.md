# public-read (T38)

**Status** · session_017MDGGaJitGyMMpHwkiKVY2 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R23's "no route of this module serves a photo's original", against what is already published. My worker found that, before this job, the original was refused only because nothing registered it. Two paths still served it:
(a) another included row at the original's digest (the T37 "twin"), which publication registers as a `document`;
(b) a photo an earlier edition (or another case) carried whole, together with its extracted text and any archive holding it.

**What I built (fail closed, about 40 lines in `index.mjs`).** It takes the hashes every published edition's signed `materials:` rows state as `obscured` originals: their `sha` and `text_sha`, plus each archive the projection shows holding one, outward. For those hashes:
- `verifySha` answers as for a hash never published;
- so `publishedbytes` answers NO_PUBLISHED_PART;
- `publishedManifest().shas` leaves them out.

This applies whatever registered them, earlier editions included. Each signed document is read once per instance.

**Two things I am leaving as they are; say if you read either otherwise.**
1. A case-file zip that an earlier edition built with the photo whole is still served by its manifest hash. Hiding the file would leave the part `PART_MISSING` and break that edition's signed bag. Withdrawing it is the docket's or a court order's job (R28), not a serving filter.
2. A photo that no published document states as a copy (one an edition before T38 carried whole and no later edition obscured) is still served. Public-read has no notion of "photo": case-carriage's image test is not in my Uses. Closing this would need a back-dated rule, which I take to be Bob's doctrine (K2248 says only "published photos do not" carry metadata), not a BOB detail.

I carry on with this reading.
