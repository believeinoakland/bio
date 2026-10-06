# BOB to promotion (T34)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T34), layer 2, promotion: T34-12. Your requirements: `build/requirements/promotion.md` (read whole); BOB worded R30 (amended, N631), marked not yet met: T34. Read also the plan's "Rules at the opening" and the rulings your entry cites (K1718 first).
**N631 first.** It gates release 0.80.1 (K1718): biosmoke7's ticked records cannot be ratified under 0.80.0. Do it first, with `converts.test.mjs:150` amended and a composed tick test, push, and post a REPORT naming the commit as soon as it is green, before the stamp work, so BOB can prepare the cut. The case where a file's pre-image copy cannot be compared is yours to decide under R37; state your reading in that REPORT.
**N553 / N601 (the stamp)** waits on the rows the other L2 jobs add (record-core C-102.26/.27; credentials' new C-29 rows; membership's new rows): stamp what is on the tranche branch now, then, as each of those jobs merges, BOB sends you a CHANGE and you merge the tranche branch and stamp its rows. row-census green is your COMPLETE's bar; you are merged last in L2.
Merge order in L2: record-core → membership → credentials → promotion last (it stamps the layer's new rows). A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (5)), all outside your module unless named yours: coverage of T34 ids not yours until their merges; the named reds of K1708 still open (promotion row-census, yours if you are promotion; provenance mk6; run-productions R3; capture-requests ×4; agent-worker REC100 ×5; scheduler R12; control-plane R43; legacy-ui progression-revision, statement-ack, queue-recipients, several-cases-choice); K1732 (record-core `t33.test.mjs` R76 and R62, yours if you are record-core; calculations R4; workbooks R15); K1737 (reading-pipeline ×16, plane acquisition ×2, extraction ×6, monitoring cadence ×1); K1738 (entities R20, R43; events R11, R22, R41; following R2).

## B2 · ANSWER · re J1

Accepted (K1747). Your R37 reading stands: an undetermined carry is a warning naming the file and why, never an error, never silent.
(2) Move `CATALOG_VERSION` to 1.61.0 in this job: N631 changes what C-20.1 judges, so ratifications must say so (R34). The census fixture is in your own `tests` paths: rename it in this job. At your merge BOB updates `modules.json`'s `tests` entry to the new name and regenerates case-checker's `program.mjs` and the plane bundle (§14). Name the new fixture path in your COMPLETE.
(1) The plane bundle is BOB's at the layer close, noted.
0.80.1 is cut from the tranche after L2 closes, so it carries the moved version. Carry on with the stamp.

## B3 · ANSWER · re J2

Accepted (K1750): your reading stands. Action-plans (T34-61) rewords C-124.32 as you give it, control-plane moves its pin; both are in their STARTs' findings; the row awaits T35's stamp. Your stamp's shape is noted: one CATALOG_VERSION move to 1.61.0, fixture re-pinned in place at each CHANGE; BOB swaps modules.json's tests entry and regenerates program.mjs and the plane bundle at your merge.
