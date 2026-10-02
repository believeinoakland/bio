# T27: DEC-116's text for the five modules another worker is editing (N520)

**Status** · PROPOSED by a worker for BOB #103, 2026-10-02, with the fold of N520's DEC-116 share (with DEC-100) into `build/requirements/docket.md` and the other owning modules. Five modules were being edited concurrently by another worker (DEC-113–115, N518): `actions`, `control-plane`, `op-declarations`, `affordances`, `queue-producers`. Their DEC-116 text is written here for BOB to fold after that worker's edits land. Each `R?` takes its module's next free id at the fold (never reused). Every line ends `*(not yet met: T27)*` and cites DEC-116 or DEC-100. Words members see are the UX design stream's, cited and never decided.

The ops `docket` adds (`docket` R1–R8, R12): `docketfile`, `docketpressure`, `docketdecline`, `docketpost` (mutating, a member's session only); `docket`, `docketprepare` (it writes nothing), `docketinvitation` (reads, a member's session only); and the two public reads `public-read` serves for it (its R21): `docketpublic` and `docketfeed`. `coreDue` (`docket` R9) is read by `queue-producers` and inside `op=docket`, and has no op of its own.

---

## queue-producers (layer 11)

- **R?a** (`docket` R9; DEC-116 item 2) OBLIGATIONs `docket-core-due`: one per item `docket.coreDue` answers the viewer (its R9), keyed `OBLIGATION::docket-core-due::<case>::<kind>::<ref>`, to the case's manager (its project's owners, `membership` R65) and to nobody else; its subject the case, naming the item (a response, a statement, a newer edition, an undisclosed tension) and its edition; offering placement (`op=docketprepare`) and, for a submission, the decline (`op=docketdecline`); its `age` from the item's `since`. It leaves when the item is done (placed, declined, receipted or disclosed). It is raised once and never repeated unless the member asks (DEC-69, DEC-94). *(not yet met: T27)*
- **R?b** (`reevaluation` R30; DEC-116 items 3, 7) FINDINGs `edition-withdrawn` and `edition-contested`: one per (dependent, entry) `reevaluation.docketDependents` answers (its R30), keyed `FINDING::<kind>::<dependent>::<case>#<seq>`, homed under the dependent's ancestors (`queue` R7); it leaves when the cause closes (as R5). *(not yet met: T27)*
- **R8 becomes:** "Answers every item R1–R7, R9, R14, R15–R23, R26, R27, R?a and R?b derive …" (the rest unchanged). *(not yet met: T27)*
- **Uses gains:** "`docket` (N520): `coreDue` (its R9)." `reevaluation` is already a use (`correctedDependents`); `docketDependents` joins it.
- **`modules.json`:** `queue-producers` uses `docket`.
- `queue` R1 and R50 (classes and dispositions of the three kinds) are folded already; they name these items as "`queue-producers`' docket items" until the ids are given.

## op-declarations (layer 11)

- **R?** (DEC-116, DEC-100; `docket` R1–R8, R12; N520) `OPS` holds a spec for each op `docket` adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin` unless it is public, with `NEEDS` `contribute` for every mutating op a member's session reaches, and the stamps the act lists name:
  - `docketfile` (`docket` R1, stamped `author` and `viewer`), `docketpressure` (its R2, `author` and `viewer`), `docketdecline` (its R7, `by`) and `docketpost` (its R5, `by`): mutating; `docket` (its R3), `docketprepare` (its R4; it writes nothing; `viewer` and `by`) and `docketinvitation` (its R8): reads; each for a member session only, classes `admin`, `member` and `machineClasses: []` (no machine, AI credential or operator token files, places, declines or signs a docket entry, `docket` R1, R4, R18), `viewer` (or `author`, `by`) stamped;
  - the public reads `docketpublic` and `docketfeed` (`public-read` R21; `docket` R14, R15): `classes: null`, not mutating, nothing stamped.

  R6 holds over them. *(not yet met: T27)*
- **`modules.json`:** `op-declarations` uses `docket` only if its specs import the op names from `docket`'s map, as it does for `link-sweep`; otherwise no edge.

## affordances (layer 11)

- **R?** (DEC-116, DEC-100; N520) The ops `docket` adds (`op-declarations` R?), by R7 and R27, R12's totality holding with them:
  - `RUNGS` assigns `reasoned` to `docketfile` (`docket` R1 requires the member's reason for the record/public/both choice, refused `DOCKET_NO_REASON`) and `docketdecline` (`docket` R7 requires a reason, refused `DOCKET_NO_REASON`); `DOCKET_NO_REASON` joins `JUSTIFICATION_REFUSALS` (R19).
  - `RUNGS` assigns `attested` to `docketpost` (the manager's own signature publishes it, `docket` R5, R18, as `noticepost` and `caseratify`; an entry is taken back only by a later entry, R11, and nothing published is altered, R16). The draft's "signed" is this rung: the ladder has no rung of that name, and R27 adds none.
  - `RUNG_ABSENT` holds `docketpressure`, ground `undetermined`, on R27's rule, as `actionpressure` (it asks no authored reason, and no published act takes it back).
  - `NON_ACTS` gives each its reason: `docketfile`, `docketpressure`, `docketdecline` and `docketpost` "case-directed: keyed by a published case, reached from its docket; never evidence, moves no bundle"; the reads `docket`, `docketprepare` (it writes nothing) and `docketinvitation` "read: …"; and the public reads `docketpublic` and `docketfeed` "read: public, no credential".
  - `VOCABULARIES` gains `docket_shelves`, `docket_entry_kinds`, `docket_proposals` and `docket_pressure_kinds` (`docket` R1, R2, R6), each the owner's object (R4).

  *(not yet met: T27)*
- **R31's consequence statements:** whether `docketpost` (above all a withdrawal, which is never lifted) opens R31's full dialog is the UX design stream's (DEC-88 (4) names six acts; a docket post is not one). Not drafted; for the UX stream.
- **Uses gains:** "`docket` (N520): its op map, the ops this R? grades, and the backing of each rung (R19)."
- **`modules.json`:** `affordances` uses `docket`.

## control-plane (layer 11)

- **R?** (DEC-116, DEC-100; N520) The door routes, through `docket`'s own map (R26), with the stamps `op-declarations` R? declares and none taken from the caller (R29):
  - `docketfile`, `docketpressure`, `docket`, `docketprepare`, `docketpost`, `docketdecline` and `docketinvitation` (`docket` R1–R8, R12), each refused to any caller not arriving by a member's session;
  - `docketpublic` and `docketfeed` (`public-read` R21), credential-free on the public path, through `public-read`'s map as `publishedcase` is.

  *(not yet met: T27)*
- **Uses gains:** "`docket`: its ops map (R?; T27)."
- **`modules.json`:** `control-plane` uses `docket`.

## actions (layer 9)

No change. The docket keeps its own pressure mark with `actions` R48's four kinds and its 500-character note (`docket` R2); `actions` is cited, never changed. Whether a `legal` mark on a docket entry also asks for a litigation hold (`actions` R52, `queue-producers` R19) is not ruled and not drafted (the draft's unresolved reading 5).
