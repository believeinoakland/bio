# DEBT

Known defects, deferred obligations, and unverified claims. Stable IDs so a
session can reference an item without restating it. Nothing is removed from this
file; resolved items keep their row and gain a resolution.

Severity: `defect` (shipped and wrong), `gap` (missing and known), `drift`
(two sources disagree), `unverified` (claimed but not independently established),
`design` (a decision deliberately deferred).

| ID | Sev | Found | Item | Status |
|---|---|---|---|---|





## How to use this file

> **110 CLOSED debt rows were rolled to `docs/archive/ledgers/DEBT-closed-2026-08.md` on
> 2026-08-10**, unedited — 217 KB of the 532 KB this file had reached. Every OPEN row
> stayed. `planning-hygiene` asserts a disposition token per row and names each one, so
> it now checks 171 rows rather than 281 and checks them all; `mintid` reads the D floor
> from both files, and the floor is unchanged. A closed row's reasoning is still indexed
> — `node tools/decided.mjs "<subject>"`.


Reference items by ID in commit messages and in session notes. When a step in
`PLAN.md` resolves an item, change its status to the commit that did it rather
than deleting the row: the history of what was wrong is worth as much as the
record of what was fixed, and a ledger that only shows current problems teaches
nobody anything.

Items marked `accepted` are known, judged tolerable, and carry the reasoning in
the row. They are not resolved and should be re-read when circumstances change.
<!-- D-124's SECOND row is kept LIVE beside its twin deliberately: D-124 is a REGISTERED PRE-EXISTING ID COLLISION (tools/mintid.mjs KNOWN_COLLISIONS). Rolling the closed half to the archive on 2026-08-10 split the pair across two files and mintid read the collision as RESOLVED — a defect made invisible by relocating half of it, which is the laundering shape this record refuses. Both rows stay here until the renumber happens. -->














## Dispositions, added 2026-07-31

Every open row now carries a leading DISPOSITION token in its Status column: a
milestone from `MILESTONES.md`, or `DOCTRINE (Bob)`, `ACCEPTED`, `WATCH, no task`, or
`NOT OURS TO MEASURE`. The reason is that this file had become the de facto backlog
while `QUEUE.md` held six items, so forward work was invisible inside a ledger nobody
could sort. **A row with no disposition is invisible work** — which is how Bob's
ruling that reused parts must be re-fetched at ratification went two design revisions
with nothing scheduling it and no row recording it.

The token says where the work is placed, not that it is scheduled. Only `QUEUE.md`
schedules. A new row takes a disposition at the moment it is written.

Two ledger corrections this pass found, both stale rather than wrong when written:

- **D-48** said `open, S-12 step 6`. It was closed by 0.28.0 (`PLAN.md` S-12 item 6
  names it explicitly) and the residue is D-50, the catalog half.
- **D-53** said it blocks S-11 step 5. That block is STALE: bulk release shipped in
  0.34.0 under Bob's 2026-07-27 ruling, which decoupled the operation from trust
  inheritance entirely. D-53 remains open as doctrine and blocks nothing today.

| D-313 | gap | 2026-09-10 | **THE IMAGE-ONLY PAGE CLASS IS RARE AND CLUMPED, SO A CORPUS ARM'S REACH IS LUCK — TWO INDEPENDENT HARVESTS OF THE SAME SURFACE ON THE SAME DAY RETURNED ZERO.** MEASURED 2026-09-10 by CPDF-15, running the harvest CPDF-12's census and CPDF-14 both used (the attachments of the 40 most recently modified Oakland Legistar matters): **1,377 pages censused, 1,374 carrying a text layer, 3 with neither text nor image, and ZERO image-only** — twice, in two separate runs hours apart. CPDF-14's pass over the same surface weeks earlier found **13 image-only of 1,458, concentrated in TWO documents**. Nothing changed in the harvest code; what changed is which matters are recent. **So a probe that needs image-only pages cannot rely on harvesting them**, and a corpus arm reporting n=0 is a statement about Legistar's recent traffic rather than about the engine. CPDF-15 handled it with a NAMED FALLBACK — the anchor exhibit's other three pages, which are image-only and carry no human ground truth — and said in its row that one document, one scanner and one day is a weaker reach than three unrelated documents. WHAT CLOSING IT TAKES: a small committed set of image-only page IMAGES (not PDFs to re-harvest) held as a fixture corpus, so every future engine measurement has the same reach as every other one and reaches are comparable across items. RELATION: D-306 (one page of human ground truth) is the adjacent gap and a fixture corpus is the natural place to transcribe more. | M2 · open — RAISED by CPDF-15, which reported the empty harvest rather than quietly shrinking its corpus, and named its fallback's weakness beside the figure. |
| D-391 | gap | 2026-09-16 | **TWO PUBLISHED FIGURES ARE DENOMINATED IN A RUNTIME THAT IS NOT THE ONE THEIR CEILING WAS MEASURED IN, AND NEITHER IS RE-TAKEN BY THE ITEM THAT FOUND IT.** Raised by M0-35 as D-368's residue rather than left inside the row that closed it — the D-227 failure D-365 was written to name, obeyed again. **(1) CONTENT-PDF's OCR row** (`MEASUREMENTS.md`, "CPU per page", 2026-08-03) converts node-proxy OCR milliseconds at the node rate (26,036 iter/ms) and compares the result to the 40M kill window, which `op=cpuprobe` measured on a DEPLOYED Worker. That prices the ceiling at 1,536 ms where FL-1's deployed billed-CPU figure makes it **1,071 ms**, so every per-page cost is understated by **1.43x**: page 1 best_int reads 134% of the window and is 193%; page 4 tessdata_fast reads 42% and is 60%. **The row's VERDICT SURVIVES** — one page per invocation is still at the ceiling's order, model- and content-dependent — which is why this is a `gap` and not a `defect`, and it is 1.43x rather than the 6x D-368 predicted because D-368 measured node against MINIFLARE. **(2) M0-31's promote figures** (`MEASUREMENTS.md` M-20, 2026-09-14) convert the 40M ceiling at the MINIFLARE rate, giving a 257 ms window against a deployed 1,071 ms — 4.16x too small, so every percentage-of-the-window figure is up to 4.16x too PESSIMISTIC (worst docx 84.8% -> 20.4%). **But the promote was measured in miniflare too and deployed SQLite promote speed is UNMEASURED, so the two errors partly cancel by an amount nobody has bounded.** The honest reading is UNDETERMINED between ~20% and ~85%, and M0-31's conclusion — *THE CEILING IS NEAR*, §4.1's chunking remedy REQUIRED rather than optional — rests on the miniflare end of that range. **WHY NEITHER IS CORRECTED HERE:** re-denominating another area's measurement from outside it is how a wrong number acquires a second author. M0-31 declined exactly this for the OCR row and was right to; M0-35 declines it for both. **WHAT CLOSING IT TAKES:** for (1), CONTENT-PDF re-states its per-page costs against the 1,071 ms deployed ceiling, or measures tesseract in deployed workerd — five JS workloads say non-LCG work is within 0.82–1.00x of node, which supports the substitution without settling it, and **wasm was not measured by M0-35 in either runtime**. For (2), one measurement settles it: the same promote ladder run against a DEPLOYED Worker, which would establish whether the 3.15–4.16x miniflare-vs-deployed gap holds for SQLite writes or is, like the 6.4x, specific to the LCG loop. **COST WHILE OPEN:** a reader taking either percentage at face value is out by a bounded, stated factor in a known direction — which is strictly better than the unstated cross-runtime comparison D-368 named, and is why this row exists rather than a silent correction. | M4 · CONTENT-PDF owns (1), M0 owns (2) · open — **open as of 2026-09-16**, raised by M0-35 with the measurement attached (`MEASUREMENTS.md` 2026-09-16); neither figure edited, both delegated in `CLAIMS.md` |
| D-388 | question | 2026-09-16 | **THREE FILES UNDER `docs/development/` ARE CLASSIFIED BY NOTHING, AND M0-43 LISTED THEM RATHER THAN ASSIGNING THEM.** M0-43 made `corpuscheck` walk `docs/development/` recursively and require every `.md` to be governed (§5), excluded with a reason (§6) or UNDECIDED. **The population, measured at `f3f2acba`: 62 files — 29 governed, 30 excluded by class, 3 classified by nothing.** They are `MILESTONES.md` (behaves like a ledger, but carries the construct-set reasoning a level-2 design document would), `CIVICOS_UI_STATE.md` (a 2,229-line prepended UI ledger whose own backfill note says it went 45 days unwritten; overlaps `kickoffs/UI.md`; possibly archive rather than either class) and `SESSION-KICKOFF-UI.md` (an 18-line tombstone saying only *this file is now `kickoffs/UI.md`* — neither design nor ledger). **WHICH FILES ARE GOVERNED IS NOT THE CHECKER'S DECISION AND WAS NOT M0-43'S** — the row said so and CORPUS-STANDARD's scope says so; Bob owns that document. **THE HOLE IS CLOSED, NOT OPEN:** §6's UNDECIDED table is LITERAL PATHS ONLY, every row must name a file that EXISTS, and a new document does not land there by default — it FAILS by name. So this row bounds a set of three that cannot grow while it waits. WHAT CLOSING IT TAKES: three rulings, each one line — for each file, governed (and then it owes front matter, an act per owner), excluded with its reason (and §6 gains a row, possibly a new *redirect* class for the tombstone), or archived. **RECOMMENDATION, offered because the row is a question and not a determination:** `SESSION-KICKOFF-UI.md` is a redirect and wants deleting with its inbound links repointed, or a `redirect` exclusion class if any reader still needs it; `CIVICOS_UI_STATE.md` is a ledger by behaviour and wants the ledger exclusion, or archiving if `kickoffs/UI.md` has fully replaced it; `MILESTONES.md` is the genuinely ambiguous one and is the only one worth Bob's attention, because governing it would put front matter over the capability ladder every session reads. | M0 · BOB · open — raised by M0-43 2026-09-16 as the item's own routed output, per its accepts-when (*"routed" means an entry somebody drains, not a sentence in a report*). Each disposition is an edit to `docs/architecture/CORPUS-STANDARD.md` §5 or §6; `corpuscheck` re-classifies on the next run with no code change. |

