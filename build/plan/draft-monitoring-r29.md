# monitoring R29: what a sweep's query is, and how it runs (DRAFT for T23)

**Status** · DRAFT by a read-only worker for BOB #90, 2026-10-01, on `tranche/T22`, for BOB's review and then Bob's approval as requirements (P5). Owed by:
- K1019 (`build/rulings.md`:1021: "R29: BOB drafts the sweep design during T22 for T23");
- `build/plan/t22-check.md`:134 (question 6) and :120 (A31);
- the inventory row A31 (`build/plan/t22-inventory.md`:41; `next.md`:38).

It replaces R29's placeholder sentence, "Sweeps wait for a design of what a sweep's query is; until then only named requests (R28) are run" (`build/requirements/monitoring.md`:63).

## What the canon fixes, and what it leaves open

**Fixed:**
- **Intake Doctrine §4** (`docs/architecture/BIO_Intake_Doctrine_v1_1.md`:508–616):
  - a sweep "names a query, not a document: scope, source-class constraints, cadence, and a breadth budget". Within its scope, the daemon or an AI session may fetch "what matches and what it deems relevant nearby", recording the deeming actor and the matched sweep (:534–538);
  - what a sweep brings "always lands at collected, never higher". The scope is ratified up front; each document is ratified afterward (:540–548);
  - fetching is "policy-governed, never caller-governed" (:517–523);
  - the source-class constraints are "explicit origin allowlists, https-only, public hosts only". The breadth budget is "per-tick fetch caps, a ceiling on the collected backlog awaiting ratification … and an anomaly note when a sweep's yield departs its history", all "part of a sweep's ratified definition". The fields have "a bounded grammar the gate checks", and the slate renders them as quoted data (:600–616);
  - the due slate includes every sweep due (:594–599).
- **Intake Doctrine §7** (:694–704): a blanket direction "is bounded exactly as a sweep is: it names its scope, it is recorded".
- **Intake Doctrine §9** (:852–863): the daemon creates Information bundles "from named standing intent only, always at collected".
- **State Rules** (`BIO_State_Rules_Consistency_v1_5.md`:774–775): a sweep-origin register entry carries `matched_sweep` and `deeming_actor`. I-18 (:1247) says such a bundle never stands at verified without a member's transition.

**Already built:**
- `gathering.json` `sweeps[]` with `id`, `ratified` and `sources` (C-18.5, `bio-plane/src/monitoring/checks.mjs`:145–155);
- the slate lists ratified sweeps (`monitoring/index.mjs`:1819–1866);
- `acquisition` R21 files `origin: {kind: "sweep", matched_sweep, deeming_actor}` (`acquisition.md`:51);
- `capture-requests` R38 files AI requests at `collected` with a sweep origin (`capture-requests.md`:44);
- `capture` R57's `links` read contract (`capture.md`:112);
- `capture` R77's held-captures read (`capture.md`:100).

**Not fixed:** what the "query" is (the open question).

## Rationale (short)

A CivicOS copy has no search index of the web, and a third-party search engine would:
- make a caller (the provider) choose what is fetched;
- disclose the group's interests to that provider;
- be unreproducible.

All three cut against §4's identity and auditability reasons. What a copy can do honestly is read pages the group names as **listings** (an agenda index, a records portal's list, a feed, a sitemap) and fetch the documents those listings link to that match the group's ratified terms, inside an origin allowlist.

This is a **link sweep**: seeds, then one hop, then a match. It reuses what exists: the acquisition act, the links capture already records, the sweep origin, the held-captures list and batch release. Each run is then auditable: "why does the group hold this?" is answered by the seed capture that listed it, the sweep that matched it, and the ratification that authorised the sweep.

## Requirement text for `monitoring` (replaces R29; new ids R52–R60)

**Standing intent** (Intake Doctrine §4)
- **R29** A ratified sweep is run by R53–R58 within its scope (R52) and breadth budget. What it brings is filed at `collected`, never higher. *(not yet met: T23)*

**The sweep's definition** (an entry of `data/gathering.json` `sweeps[]`, checked by C-18.5 at the gate, R27)
- **R52** A sweep is `{id, title, ratified, sources, seeds, match, cadence, budget}` and nothing else. C-18.5 refuses (`GATHERING_REFUSED`, one finding per field) an entry that breaks any of the following *(not yet met: T23)*:
  - **`id`**: `^[a-z0-9][a-z0-9-]{0,39}$`, unique within the file.
  - **`title`**: a non-empty single line of at most 200 characters.
  - **`ratified`**: boolean.
  - **`sources`**: the origin allowlist. 1–20 public https prefixes (`isPublicHttpsLocator`), each a scheme and host with an optional path prefix, and no query or fragment. An address is **in scope** when its normalised form equals a prefix or continues it at a `/`.
  - **`seeds`**: 1–10 public https locators, each in scope. These are the listing pages read on every run.
  - **`match`**: `{terms?, paths?, formats?}`.
    - `terms`: 0–20 single-line strings of 1–80 characters.
    - `paths`: 0–20 in-scope prefixes.
    - `formats`: 0–10 of `format-registry`'s format names.
  - **`cadence`**: one of `daily`, `weekly`, `monthly`.
  - **`budget`**: `{per_run, backlog}`.
    - `per_run`: an integer 1–100, default 20.
    - `backlog`: an integer 1–1,000, default 100.

  No field is free text that a surface interpolates; `title` and `terms` are shown only as quoted data.
- **R53** Ratification is a member's act. A non-replay promotion is refused `SWEEP_RATIFY_NOT_A_MEMBER` (C-18.5) when its author is not a member (outside `record-grammar`'s non-member set) and it does either of these *(not yet met: T23)*:
  - sets a sweep's `ratified` to `true`;
  - changes any field of a sweep that is ratified before or after the write.

  A member's change to a ratified sweep is its re-ratification. Setting `ratified: false` is open to any writer, since stopping breadth is never refused. See "Open for Bob", question 2, for which members may ratify.

**The run** (`sweepDue(now)`, `sweepWake(now)`, `sweepTick(now, rank?)` for `scheduler`; the same epoch claims as R21)
- **R54** A sweep is due when all of the following hold *(not yet met: T23)*:
  - it is ratified;
  - the daemon is not paused (R30);
  - its bundle's `daemon.enabled` is not `false`;
  - its last run plus its cadence's interval (R14's intervals) is at or before `now`, or it has never run;
  - it is not held (R57).

  A tick runs at most 5 due sweeps, longest-overdue first. Given the scheduler's rank, it reads at most ten times that number in this order and takes its batch in the rank's order, each offered as `{kind: "sweep", id: "<bundle>#<id>", waitingSince}` (N224's pattern). Not re-entrant (R22).
- **R55** **Seeds.** Each seed is fetched through `capture.acquire` (paced by `host-governor`), with `origin: {kind: "sweep", matched_sweep: "<bundle>#<id>", deeming_actor: "bio-monitor"}`. Its capture is filed in the sweep's own bundle as a monitor snapshot, as R9 files a changed tick's bytes. *(not yet met: T23)*
  - A seed whose bytes equal its last capture is recorded as unchanged, and its candidates are re-read from that capture.
  - A seed that fails is recorded with `capture`'s reachability (R25), and the run continues with the other seeds.
- **R56** **Candidates and the match.** The candidates are the links of this run's seed captures: HTML anchors with their text, feed items with their titles, and sitemap entries (address only). A link is a candidate when *(not yet met: T23)*:
  - its normalised address is in scope;
  - it lies under one of `match.paths`, if any are given;
  - one of `match.terms`, if any are given, appears case-insensitively in its text or its decoded address.

  Nothing beyond one hop is followed, and a redirect that leaves scope is not followed (stated as `out_of_scope_redirect`). A candidate is skipped, with its reason stated, when:
  - this sweep already filed a capture at that address (`already_swept`);
  - the record already holds a capture at it (`already_held`);
  - the per-run budget is spent (`budget_spent`; seeds count toward `per_run`).

  The rest are fetched in seed order, then in link order, each through `capture.acquire` with R55's origin.
- **R57** **Filing.** Each fetched candidate whose detected format is in `match.formats` (any, when none are given) is filed as a new Information bundle at `collected`. It goes in the project of the sweep's bundle, with the register entry's `origin` as R55 states and the seed capture that listed it in Provenance Notes. A fetched document outside `match.formats` is not filed (`format_excluded`), and its fetch still counts. *(not yet met: T23)*
- **R58** **Backlog and anomaly.** *(not yet met: T23)*
  - **Backlog** is the number of this sweep's documents at `collected`, not released and not set aside (`capture.heldCaptures`, its R77, by `matched_sweep`).
  - When the backlog is at or over `budget.backlog`, the sweep is **held**: it does not run, every read (R59) states `held: backlog`, and R31 publishes a `sweep-backlog-held` item.
  - **Anomaly:** after each run, when at least 4 runs exist, it notes an anomaly in either case:
    - the run's filed count is over three times the median of the last 8 runs and over 5;
    - it is 0 while that median is at least 2.

    The note is kept on the run, shown in R59, and published as a `sweep-yield-anomaly` item. The note changes nothing else.
- **R59** **Reads.** Two reads, both credentialed *(not yet met: T23)*:
  - `sweeps({viewer})` (`op=sweeps`; read) answers every sweep in a `gathering.json` the viewer may see, each with:
    - its definition (as quoted data);
    - `ratified`, the ratifying member and instant (from the promotion's history);
    - `next`, `held` and the backlog;
    - its last 20 runs, each with seeds fetched, candidates, filed, skipped by reason and anomaly.
  - R30's slate carries each due sweep's definition as quoted data inside the fixed framing.
- **R60** **Looks.** Each seed fetch and each candidate fetched writes one observation row (`observation-log`), with these fields *(not yet met: T23)*:
  - authority kind `sweep`;
  - authority `"<bundle>#<id>"`;
  - level `document`;
  - subject the address;
  - state `PRESENT` referring to the capture, or `LOOKED_INDETERMINATE` with the reason.

  A skipped candidate writes nothing (OBSERVATION-LOG-DESIGN §7's edge rule).

**Invariants (amended)**
- **R36** (amended) The daemon fetches only what store state authorizes: a bundle that asks, a named request's locators, and a ratified sweep's seeds and the in-scope candidates R56 admits. No caller names what is fetched. *(the sweep arm not yet met: T23)*
- **R40** (unchanged) Bias never shapes what is swept: no sweep field is a lens.

**Satisfies** (adds): Intake Doctrine §4 (the ratified sweep, the fence, constraints as security controls), §7 (bounded breadth), §9; State Rules §4.1 (the register's sweep origin) and I-18.

## In other modules

- **`monitoring` R31** (amended): add the items `sweep-backlog-held` and `sweep-yield-anomaly`, kind CONDITION (shown as "Signal", DEC-110), with their options. *(not yet met: T23)*
- **`scheduler`:** a `sweep` consumer over R54's due, wake and tick. *(not yet met: T23)*
- **`capture`:** nothing new if R56 reads the link text from the seed's own bytes. If BOB prefers the `links` table, R57's contract gains the anchor text (a change to `capture`).
- **`capture-requests`: the AI's "relevant nearby" arm** (§4 :536–538). A run may name a sweep (`sweep: "<bundle>#<id>"`) on a request. The drain files it with `matched_sweep` that sweep and `deeming_actor` the run (R38), only when a scope check that `monitoring` registers once at start (K31 pattern; `capture-requests` is earlier, P4) answers that the address is in scope and the sweep is ratified and not held. Otherwise it is refused `CAPTURE_SWEEP_OUT_OF_SCOPE`. *(T23 or later: BOB's, by tranche)*

## Open for Bob (each with a recommendation)

1. **What a sweep's query is** (requirements).
   - *(A) A link sweep:* listing pages the group names, one hop, matched by terms, paths and formats, inside an origin allowlist (R52–R58).
   - *(B) A search-engine query:* sent to a third-party search provider.
   - *(C) A crawl:* a site crawl to depth N.

   **Recommended: A.**
   - B makes the provider the chooser, tells it what the group is investigating, and cannot be reproduced.
   - C multiplies breadth faster than a budget can explain it.
   - A is auditable link by link, and a later tranche can add depth if practice asks for it.
2. **Who may ratify a sweep.** Any member who may write its bundle, or only an owner of its project.
   - **Recommended: an owner of the project.** Any joined member may draft one, unratified. A sweep is the group fetching broadly under its own name (§4's identity reason), as a case is the group speaking. Named requests stay open to every member, as today.
3. **What members see** (UX): a sweep's row on the project's monitoring page (R59), and two Signal items.
   - **Recommended wording:** "Sweep '⟨title⟩' paused: ⟨n⟩ documents wait for review (limit ⟨backlog⟩). Review or set some aside to resume." and "Sweep '⟨title⟩' brought ⟨n⟩ documents this run, against a usual ⟨m⟩. Check the listing has not changed."
4. **Doctrine reading** (quick confirm). Intake Doctrine §9 lets the daemon create Information bundles "from named standing intent only".
   - **Recommended: confirm** that a ratified sweep is named standing intent in that sense (it is named in the store and ratified by a member), so R57 may file each found document as its own Information bundle at `collected`. Otherwise sweep finds would have to be packed into one bundle, which breaks the per-document release that §4 and I-18 require.

Decided by BOB (P17; for the rulings, reported to Bob):
- the default budgets (20 per run, a backlog of 100) and the anomaly rule (3× or zero, against the median of the last 8 runs);
- one hop only;
- `already_held` addresses skipped (watching held documents for change is R28 and the cadence's job);
- at most 5 sweeps per tick;
- seed captures filed in the sweep's own bundle;
- the AI nearby arm's tranche.
