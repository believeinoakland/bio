# capture-requests (T35)

**Status** · session_01PzYjuzUZfjcPzgKVMKJo96 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two `modules.json` edges for capture-requests (requirements Uses mark them "a new edge; BOB's"):

1. `standards` (layer 5): R51–R53 read `standardRead` (sight, issuer, `held`, the citation). My best reading: the instance is reached as `standardsOf(host)` by default (K61), and `noSuchStandard`'s answer is relayed from `standardRead`'s own refusal, so no code is minted here.
2. `subresources` (layer 1): R49 compares an address to `captured_locators.address`/`retrieval_locator` and to `links.address` with its fragment, after lower-casing scheme and host. To find the candidates on the indexed `address_norm` columns, and not by scanning both tables on every request, I import `normalizeAddress`, then compare exactly in code.

`provenance` is not needed as an import: R49 reads `captured_locators` and `register` through provenance R48's stated read contract, in SQL. `capture`'s `links` is read the same way (capture R57; already a use).

Best reading: BOB adds `standards` and `subresources` to capture-requests' `uses`. I am writing the code on that reading. Until the edges are on `tranche/T35`, the architecture check will report the two imports.
