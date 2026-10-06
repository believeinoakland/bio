# notice-producers (T34)

**Status** · session_012wmGJBMsuXoaxegV5EZNMd · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R11, "every member-facing sentence ... (its summary and detail, and the words of its options) marks it Hint · machine work". My reading, which I am building now: the summary and the detail of each R2/R3 item open with "Hint · machine work" and call what the machine raised "this hint"; the one option (TAKE_UP) does not repeat the mark (a button reading "Hint · machine work" says nothing) but calls it a hint: "Take this hint up as your own hunch or hypothesis". No member text of the module says "signal". The label `noticed`, kinds and keys unchanged. I also export the mark as `HINT_MARK` and set it on each R2/R3 item as `mark` so a screen can draw the chip without parsing words (an added field; queue reads items unchanged). If you read R11 as requiring the mark inside the option label too, say so and I will add it.

## J2 · COMPLETE

T34-55 and its T34-87 rows applied on `job/T34/notice-producers`.

**Applied.** (1) MONEY-CHECKS #2 J2 (K1787): `detectors.test.mjs` switches its detector on for P before the run (`w.switchOn`, money-checks R5: off until switched on, and R6 runs only detectors switched on somewhere); the second project Q is switched on by carol, its member (alice may not see Q, so her act is refused `NO_SUCH_PROJECT`). The five reds (R3, R8, R9) are green. (2) R11 (DEC-131, K1536): each R2/R3 item's summary and detail open with "Hint · machine work" and call what the machine raised "this hint"; the option reads "Take this hint up as your own hunch or hypothesis"; no member text says "signal". `label` `noticed`, kinds and keys unchanged. Exported `HINT_MARK`; each R2/R3 item also carries `mark: "Hint · machine work"` (an added field). R4/R5/R6 items carry no mark and never say hint. Built on J1's reading (the option calls it a hint, without repeating the mark); if your answer differs I apply it as a CHANGE. (3) DEC-149 rows `index.mjs:357` and `:360`: "switched off in your group's Civicsmith", "not available in your group's Civicsmith". Not a check translation (this module holds no check rows), so no catalogue version moves.

**Tests.** New: R11 in checks, detectors (hint, mark, label/kind/key unchanged), standing, duties (overdue and possibly overdue), waits (no mark, no hint); DEC-149 in standing (both strings named, no "this copy/plane/instance/server" in any held-back sentence). `node --test bio-plane/test/m/notice-producers/`: pass 45, fail 0 (was 34/5). Users of my items: `test/m/queue/` and `test/m/plane/t33.test.mjs`: pass 140, fail 0 (same as before the change).

**Checks.** format: 129 modules, 0 failures. architecture notice-producers: 0 failures. coverage notice-producers: 11 of 11 live ids named; 0 failures. ownership notice-producers tranche/T34: 8 files; 0 failures.

**Found in other modules (REPORT).** (a) Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (holds this module's old words); regenerated at the layer's close. (b) `people` `#resultView` (`src/people/index.mjs`:1348) answers a check result's own `label: "Noticed"` and `detail: "Noticed by a check: ..."`, with no "Hint · machine work" mark. This module does not relay it to members (it writes its own words), but wherever people's result view reaches a member (its `checkResults`/listener answers through an op), R11's meaning (DEC-131) would want the mark there too; people's requirements have no such line. Likewise money-checks' `NOTICED = "Noticed"` label on its answers. BOB's to judge whether those reach a member.

**Deferred.** None.

Size (session_012wmGJBMsuXoaxegV5EZNMd): test runs 9, module lines 1356
