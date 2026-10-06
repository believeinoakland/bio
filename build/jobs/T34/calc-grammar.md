# calc-grammar (T34)

**Status** · session_01RfhvynYE7q2SRyDdV5krf8 · depth 2 · WORKING · handled B0

## J1 · QUESTION

R22, the shape of a table result over a streamed input. R22 asks for "the same `result`" over a streamed table as over row objects, and also for heap growth under 35 MB for any recipe over 1,000,000 cells. A recipe whose output is a table step (a `select` keeping most rows, a `sort`, a `span`, a `join`) would put the whole table back in the heap if its result were answered as row objects, so both cannot hold literally.

My best reading, which I am building on: a table result whose source was bound streamed is answered as a streamed table, `{fields, rows}`, `rows` a function answering a new iterator over the same rows as arrays in `fields` order. It holds the same table as the row-object answer, and the tests compare the two after reading the stream as objects. A table result whose sources are all bound as row objects is answered exactly as today. A join of a row-object table with a streamed one is answered streamed. `undetermined_rows` and `trace` are identical either way. `calculations` (T34-27) reads a streamed table result through `rows()` when it stores one.

If you want the result as row objects anyway, I will do that and state that the heap bound covers only recipes whose output is a figure, ratio or comparison.
