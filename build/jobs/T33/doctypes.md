# doctypes (T33)

**Status** · session_01XZrZmtoRays9vT3h9cANPd · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two points on R9–R11/R17 that depend on `jurisdictions` (T33-2), with my best reading; I am building on it now.

1. **The `sections` shape.** I read jurisdictions R6's `codes[].sections` `{number, separators, markers}` as: `number` a pattern `{re, flags}` matching one whole section number of that code as printed (OMC: `\d+\.\d+\.\d+[A-Z]?`); `separators` a string of the characters that divide its parts (OMC: `.`), from which R10's `path` is the parts in order; `markers` the subsection levels from the top down, each `letter` (`A.`), `numeral` (`1.`), `paren_letter` (`(a)`), `paren_numeral` (`(1)`) or `roman` (`i.`/`(i)`) (OMC: `["letter","numeral","paren_letter"]`, measured on the codifier's HTML). A heading is that number at a line's start, optionally after the place-free words `Section`/`Sec.`/`§`, then a title (OMC `2.20.030 - Definitions.`; Charter `Section 200. Composition of the Council.`).
2. **The Charter.** R12/R17 test charter articles. The first profile has one code today (`omc`). I read that T33-2 adds the Charter as its own `codes` entry (key e.g. `charter`, number `\d{3,4}`, no subsection markers), and the test profile (`test-port-ellery`) a code with `sections`. Until jurisdictions merges, `validate` refuses `sections`, so my tests build their views with the sections facts added to the combined view; R17's "test profile's code" test reads the held test profile and stays red until T33-2 merges (inherited red 1's kind). If T33-2 will not carry the Charter or the test profile's `sections`, say so and I will ask that job's owner through you.
