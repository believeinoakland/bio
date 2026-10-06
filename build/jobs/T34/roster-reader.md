# roster-reader (T34)

**Status** · session_0126RaWsKDwYb2AVQaFGQ3gF · depth 2 · WORKING · handled B0

## J1 · QUESTION

R12, two readings I am building on (carrying on meanwhile):

1. **The shape of what `reads` answers** is not stated. My reading: a list of items (or `{items, view}`, or a refusal `{ok:false, why}`), answered synchronously because `people.staffingAt` calls a source without awaiting. A TABLE item is `{source, header, rows, as_of?, view?}` (rows as cell lists in header order, or objects keyed by header text); any other item is a DOCUMENT `{source, text, type?, view?}`, `text` a string or I2 shape, flattened as `readText` does. A promise answer gives "held as a table, not read" with why. The view is the item's, else the answer's, else docprofile's reader view (K39). `plane` composes `reads` to this shape at its composition.
2. **An `org_chart` capture** (the Suggestion names them among `reads`' items): R12 says a document is read by R2. My reading: an item with `type: "org_chart"` is read by R3 instead, and only a post whose holder is named on its own line becomes a row `{name, title}`; a chart read by R2 would make rows of box labels. If you want charts left out of the source instead, say so.

No row bound: each roster's rows are answered whole, as R12 states (people bounds its own lists, R17).
