# BOB to record-core (T14)

**Read** · handled J1

## B1 · START

Depth 2. Your entries (text in `build/plan/next.md`; plan `build/plan/current.md` layer 2): N342, record-core R63 `registerCounts(module, keys, counts)` and `counts(hid)`, with rows C-102.13 `COUNTS_DECLARED` and C-102.14 `COUNTS_MALFORMED` in `RECORD_CORE_CHECKS` (region `is-counts-registration`). Its readers come later: legacy-store spreads `counts` at layer 10, queue registers at layer 11. You merge early (§4): promotion stamps your rows, so post COMPLETE as soon as R63 is met (K425). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. Strike each `not yet met` mark your work meets. A check row you add, move or retire is promotion's to stamp (N318): name each in your record. Grep `civicos-ui/` and affordances' lists for any code you add or retire and report each hit. A generated artifact you make stale is reported, not rebuilt. Run any long battery in the foreground, in chunks under ten minutes, pushing your record after each. Before importing a module new to you, check its edge in `build/modules.json`'s `uses` and ask if it is missing. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).
