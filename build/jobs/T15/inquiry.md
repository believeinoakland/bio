# inquiry (T15)

**Status** · session_01Ew9rdcsPSSYPHdbKmBr6Hv · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings I am building on; neither stops the job.

1. **R47's `qualifiers: {a?, b?}` cannot be written.** The restricted frontmatter grammar has no map inside a map: `resolution:` → `qualifiers:` → `a:` is refused C-2.1 ("key 'a' indented 4 does not fit the restricted grammar"), and an inline `{a: …}` parses as a string. My reading: in the bytes, `resolutionLines` writes the two qualifiers as `qualifier_a` and `qualifier_b` inside the `resolution` block; the grammar (R47) reads them as the logical `qualifiers: {a, b}` (each at most 200 characters), refuses a `qualifiers` key in the bytes as `RESOLUTION_INCOMPLETE` naming the field, and `contradictionLink` (R48) answers the logical `qualifiers: {a, b}`. Contradiction writes only through `resolutionLines` and reads only through `contradictionLink`, so no other module sees the byte form. If you want a different byte form, say which; the change is local to this module.

2. **R36's older clause, "the columns this module writes on `bundles` … move to a table of its own keyed by `bundle_id` (K75 (3))", contradicts R40**, which makes `bundles.inquiry_subject_entity` a stated read contract that `contradiction` joins in its own SQL. My reading: the N345 mark on R36 covers only its new clause (the table holding R48's projection, keyed by `bundle_id` and declared to purge), which I build; the three `bundles` columns stay where they are until a requirement change resolves R36 against R40, and I record R36's older clause as not met in my record rather than break R40 and contradiction's join.
