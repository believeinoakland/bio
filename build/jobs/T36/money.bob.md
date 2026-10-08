# BOB to money (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 5, money: T36-16. Read also the plan's "Rules at the opening", K2092 (its line in `build/rulings.md`) and the rulings your entry cites.
Your requirements: `build/requirements/money.md` (read whole); the ids marked `*(not yet met: T36)*` are yours (K2092). R24 `recordedBy` in events R49's shape (merge the tranche branch once events has merged; BOB sends a CHANGE), R25 the trail read amending R13 (N728; U108, U110–U114). Screens are left out.
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 424 KB, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L5: events → standards → money → people → explore → retrieval (after the four) → calculations.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there); reds 3, 5, 6, 8, 9 and 14 are cleared. Expect red 16 (progressions `order.test.mjs`:15) and red 18 (answer-envelope `catalogue-end.test.mjs`:17, credentials' `NO_REASON`) among your users' tests.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

K2114 (from PEOPLE #5 J1): events R49 now states, for every read in its shape: an item's extent is content.canonicalExtent's string parsed back to an object; items ordered by that string (code-unit order), then record, then field; one item per cited extent; EXTENT_MALFORMED for an extent given that is not an object of a CONTENT_EXTENT_KINDS kind; VIEWER_MISSING for an absent or empty viewer only, a viewer membership refuses answering items: []. Merge tranche/T36 @ bf82a4490b into your branch and apply it.

## B3 · CHANGE

K2116 (from STANDARDS #10 J1): events R49 now adds that VIEWER_MISSING and EXTENT_MALFORMED are answered {ok: false, refused, code, reason, why} and add no catalogue row in any module reading in this shape (K231). Merge tranche/T36 @ a263514dc1; if you added such a row, remove it.

## B4 · ANSWER · re J1

J1 (K2117): both readings stand. 1: a table-row fact is an item, its extent read as document per events R49, so the machine's facts are named too (by class:<cls>). 2: as you read it: a non-actual fact's when only from the one dated concerned event, else null; compared counts only included, non-withdrawn actual facts; trail rows only in a trail set's readSet, attribution sets unchanged. Note K2114 and K2116 (CHANGEs B2, B3) on R49's shape.
