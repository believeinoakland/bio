# Bob's product rulings: tests

**Status** · Bob's product rulings on tests, by subject (Bob, K5323), read whole by the work that writes, runs or judges a test (with `build/situations/job.md` for every job). Each line keeps its source ids; `build/rulings.md` is the full log. Moved from `rulings-active.md` when the process redesign was adopted; a ruling of Bob's on this subject is added here in the commit that records it.

- No load-dependent tests (Bob, K4787): a test red on a busy machine is fixed to assert work or a same-run control, or is a product defect when slow; the whole suite runs alone in its own session and container. A pass never clears a red seen under load: reproduce it under named load, instrument it to its timing cause, fix it, prove it green under that load (K4966). A run under `--test-force-exit` can lose reports; the close's runner, without it, is the authority (K5124).
