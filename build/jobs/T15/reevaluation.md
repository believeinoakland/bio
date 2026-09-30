# reevaluation (T15)

**Status** · session_01BVhTdCZJui5ZfRQKTiN1bW · depth 2 · WORKING · handled B2

## Completion

**Applied** (on `tranche/T15` at fd35ffcc8f; readings confirmed by BOB, B2, K493):
- **N345, R27 and R2's `corrected` arm.** `#corrected` derives the cause on read. For each live leg (`inquiry.restsOnLive`'s `all`: a divided citer and a severed leg carry none), it asks `contradiction.tensionsOn`, under the reading viewer, about the leg's content row at its capture (`{ref: content_id, version: capture_sha}`; this covers the stale leg's own inquiry and any inquiry with a leg on the stale leg's or extent's row) and, when the target is an inquiry, about each claimed version of it (`{ref: "<inq>|<name>", version: sha256(claim)}`, read through basis-versions' `inquiry_basis_versions` contract, its R38). Referents are deduplicated and asked in chunks of contradiction's own bound (`TENSIONS_REFERENTS_MAX`, 200). Each stale mark gives one cause per (leg, candidate) on the obligation (dependent, the leg's own target): `{source: "corrected", since, ord, candidate, kind, reason, member, act | inquiry, side, detail}`. `since` is the mark's instant; a mark set by a contradiction inquiry states none, so `since` is null with `since_why` (contradiction's gap is N359). Stances are not asked: a K5 side can never be marked stale (contradiction R33, R36; K493).
- **`reevaluations`** lists a target whose only cause is R27's, with its own state and type. It also answers `corrections_read` (and `corrections_why` when a tensions read failed or was undetermined), so an unread read never reads as none (R21).
- **`changesOf` (R9)** answers the `corrected` causes each named finding carries on its own legs, each with its `target`, less those R16 closed, and `corrections_read`.
- **`correctedDependents({after, limit, viewer})`** (new) lists each standing (dependent, candidate) in dependent then candidate order after `<dependent>#<candidate>`. `limit` is 1–200 (default 200), with `truncated` and `cursor`. Dependents are read a page at a time until one entry past the limit is found. A hidden dependent is withheld and not counted. Each entry carries the mark's fields and its `legs` (`target`, `ord`, `side`). It writes nothing.
- **R16:** `CAUSE_SOURCES` gains `corrected`, so `recordReevaluation` closes a corrected cause as any other; a null `since` matches a null record.
- **Uses:** `contradiction` (`contradictionOf`, `TENSIONS_REFERENTS_MAX`); its edge is in `modules.json` (K481). The instance reaches it lazily on the same host, or takes `contradiction` in `deps`.

**Tests** (`bio-plane/test/m/reevaluation/`, 59 pass, 0 fail, 0 todo). New `corrected.test.mjs`, 10 tests, all against the real `contradiction` (the fixture now wires it, with a run-gate stand-in; candidates are made through its own `pairs`, `propose` and `clarify`):
- **R27, R2:** K1 over two passages. The stale leg's own inquiry and an inquiry with a leg on its row are caused; a whole-document leg and a leg on the other side are not. Every field is pinned, and it is asked of the target.
- **R27 (claim arm):** K2 over two claimed versions. A leg naming the stale claim's inquiry is caused; the other claim's dependent is not.
- **R27 (live):** a severed leg and a divided citer carry no cause.
- **R27, R20:** a hidden dependent is withheld and not counted, and no count key appears. A viewer shown no mark on the side (a `tensionsOn` stand-in) is told no cause, though the dependent is seen.
- **R27 (listing):** order over two candidates, paging with `cursor`, and limit clamping.
- **R27, R16:** a machine is refused; a member's record closes the cause for that dependent only; the listing and `changesOf` drop it.
- **R27, R9:** `changesOf` answers the cause with its target; unseen is absent.
- **R27, R18, R19:** no table changes across all four reads; strength and document unchanged.
- **R27, R21:** a thrown or undetermined tensions read answers `corrections_read: false` with why. A mark by a contradiction inquiry gives `since: null` with `since_why`, and R16 closes it.
- **R27 (K493):** a real K5 candidate cannot have a side named wrong, and yields no cause.
- **Negative controls:** each of these turned the suite red, and each was reverted: no live-leg filter, no R16 close, an unread read said as read, the viewer ignored (red once its test was added), no claim arm, and no `after`.

**Tests of the modules that use reevaluation** (all 0 fail): publication 91 pass, 2 todo; case-authoring 39; conformance 36; monitoring 65 pass, 6 todo; scheduler 46 pass, 2 todo; queue 69; control-plane 52.

**Checks** (civicos-process): `format: 69 modules, 64 requirements files; 0 failures` · `architecture: 12 product files, 50 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 27 of 27 live requirement ids named by a test; 0 failures` · `ownership: 4 files changed by reevaluation between tranche/T15 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`.

**Please strike** (my work meets these marks): R2's `*(not yet met: N345)*` and R27's `*(not yet met: N345)*`.

**Rows awaiting stamp:** none; no check row was added, moved or retired. **New ops:** none. `correctedDependents` is an in-process service, read by `queue` (its R44), so there are no route or stamps for control-plane. **Grep:** `civicos-ui/` and `affordances` have no hits for the code added; nothing was retired.

**Generated artifacts made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; its inputs are the plane's source, `src/reevaluation/index.mjs` among them). Reported, not rebuilt.

**Deferred:** nothing.

**Found in other modules:** contradiction's stale mark by an inquiry carries no member or instant, against its R27. BOB has confirmed this and routed it to N359; I did not change contradiction. Observed, not a defect against a requirement I can name: `inquiry.divide` gives a child the leg on the whole document, not the passage the divided leg named. So a child does not inherit a passage-level `corrected` cause, nor R14's pushed notice.

Size (session_01BVhTdCZJui5ZfRQKTiN1bW): test runs 24, module lines 1812

## J1 · QUESTION

R27, my best reading; I am building on it now unless you answer otherwise.

1. **Referents asked.** For each live leg (restsOnLive's `all`) I ask `contradiction.tensionsOn` about: the leg's content row, when it names one (`{ref: content_id, version: capture_sha}`), which covers both "the stale leg's own inquiry" and "an inquiry with a leg on the stale leg's or extent's content row" (a leg side and an extent side share that referent, contradiction R14); and, when the leg's target is an inquiry, each claimed version of that inquiry (`{ref: "<inq>|<name>", version: sha256(claim)}`), read through basis-versions' `inquiry_basis_versions` read contract (its R38). My requirements' Uses names basis-versions only for R15's write: please add "the `inquiry_basis_versions` read contract (R27)" there.
2. **Stances.** A stance side is never marked stale (contradiction R33 and R36 refuse a CORRECTED kind on K5, `PLURALITY_HAS_NO_WRONG_SIDE`), so I do not ask stance referents: the stance arm is met vacuously. Say if you want it asked anyway (it costs `projectsDrawingOn` + `conclusionOf` per inquiry target).
3. **The obligation's target** for a `corrected` cause is the leg's own target (the inquiry, or the information bundle holding the content row); the cause also carries `ord`, the `side` referent and the mark's `candidate`, `reason`, `member`, `kind`, `inquiry` or `act`.
4. **`since`.** contradiction's `tensionsOn` answers `member` and `at` only for a `one_wrong` act; a stale mark set by a contradiction inquiry's CORRECTED conclusion carries `member: null, at: null` (contradiction/index.mjs:1430–1433), though its R27 says every stale mark carries "the member, the instant". I answer `since: null` there with a sentence saying the instant was not stated, and report contradiction's gap. R16 closes it (null matches null) until the mark's instant is readable.
5. **Viewer.** I pass the reading viewer to `tensionsOn`, so a viewer who may not see both sides of the candidate gets no `corrected` cause from it (contradiction R10/R19); the dependent itself is withheld by R20 as today.
6. **`correctedDependents`** lists the standing (not R16-closed) causes, one entry per (dependent, candidate), `after` being `<dependent>#<candidate>`; `changesOf` answers, for each named finding, the `corrected` causes it carries as a dependent (with each target), beside R2's arms of it as target.
