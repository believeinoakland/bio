# Draft: T29's carried rows and entries N530, N531

**Status** · DRAFT for BOB #106, 2026-10-03, uncommitted. Written by a worker on `tranche/T28`. Three sections: the re-read of `current.md`'s left-out row T28-1; N530; N531. Nothing here is folded; every requirement text below is proposed.

## 1. T28-1 re-read

**The row.** `build/plan/current.md`:89 carries "H1, H6b, J4's remaining shares (DEC-96, DEC-101 (3), DEC-92) beyond N522", hard reason "dependency not yet built" ("nothing brings another group's edition into this copy", `build/plan/archive/T22.md`:179). The old-plan rows are `build/plan/t22-inventory.md`:161 (H1, DEC-96 acceptance and flags), :183 (H6b, DEC-101 (3) watching other groups' cases) and :197 (J4, DEC-92 the origin mark and the acceptance act). K1268 (`build/rulings.md`:1270) already said H1 and J4 are met by case-import and that H6b stays; the row was carried whole all the same. `case-import` (`build/requirements/case-import.md`; `bio-plane/src/case-import/`) and `accepted-work` are now merged, so that reason has gone for every share. Share by share:

| Share (canon) | Outcome | Where it is met, or what it needs |
|---|---|---|
| DEC-96 (1): accept and withdraw, reasoned, naming one edition, no regrade; the withdrawal sends notices (`docs/development/DECISIONS.md`:1554) | **Met** | case-import R6, R7 (`case-import.md`:52, :61); reevaluation R31 (`reevaluation.md`:83); accepted-work R3, R4 (the leg check); strength's leg on accepted work (`strength.md`:52). One defect in the withdrawal's notice: N531, §3 below. |
| DEC-96 (2): flag and clear, a member's evaluation, kept inside the group (:1555) | **Met** | case-import R8 (`case-import.md`:65), R9 (:69), R16 (:73). |
| DEC-96 (3): "Meets standards" (:1556) | **Deferred by Bob's ruling**, not owed | Not a missing module. DEC-96 (3) defers it "until an evaluator of incoming work exists". No such evaluator is planned, and building one would be a new requirement, so it is Bob's. |
| DEC-96 (4): the case states the acceptance and discloses open flags, disclosed but never blocked (:1557) | **Met** | case-authoring R51, R52 (`case-authoring.md`:196, :202); case-grammar R16 (`case-grammar.md`:86); publication R59 (`publication.md`:98). |
| DEC-96 "Next step, when triggered": a public list of acceptances and flags (option B) (:1558) | **Not owed** | Bob's trigger ("when a second group asks") has not fired. |
| DEC-92: the origin mark's facts for imported work (:1489, owed :1493 "inquiry, publication, affordances") | **Met (server side)** | case-import R4's `another_groups`, acceptance in force and open flags (`case-import.md`:41); a leg on a ref (inquiry, N522 L6); publication R59; affordances R35 (the four acts `reasoned`, T28 L11). |
| DEC-92: the mark as shown (labels, hover, its place) | **UX** | Screens belong to Bob's UX stream (K633), not this process. |
| DEC-92 "still open (Bob's, later)": how the mark travels when a group republishes accepted work (:1490) | **Mostly answered by DEC-96 (4)** | Met as above. Anything beyond that is Bob's open question and not owed. |
| DEC-101 (3): watching other groups' editions (:1647; Publication §5A, `docs/architecture/BIO_Publication_v0_1.md`:315), with DEC-116 (8)'s citing side (`DECISIONS.md`:1889; Publication §5D :371) | **Now buildable; needs a draft first (P18)** | See the entry below. |

**DEC-101 (3) is buildable: why.** Every dependency now exists, earlier in the order (`build/modules.json`):

- The publisher's side is built. `docket` (index 61) has `docketPublic` (R14) and `docketFeed` (R15, `docket.md`:88). Both carry signed `edition` and `withdrawal` entries, and the module exports `DOCKET_UNREADABLE` (`bio-plane/src/docket/index.mjs`:90).
- The editions this copy cites are held by `case-import` (index 67), each with its source group, case and edition.
- What rests on a cited edition is read through `accepted-work` (index 44), which `reevaluation` (index 57) already reads for R31.
- `monitoring` (index 81, L10) fetches on a cadence and already tells `reevaluation` (its R33). It sits after all of these, so its new `uses` edges on `case-import` and `docket` point earlier (P4).

`docket.md`:127 keeps "the citing side of DEC-101 (3)" undrafted, and `plan/draft-T24-dec116.md`:177 says it waited only on rows H1, H6b and J4.

**Readings for the draft (BOB's under P17; none needs Bob):**

- (a) **Where the address comes from.** The case file names no address for the publisher's docket (`case-grammar.md`:53–54, R13). A member gives the publisher's docket address when configuring a watch on an import. DEC-101 (3) says a copy "can be configured", so the watch is a member's act, never a default. No change to the case-file format.
- (b) **Which keys sign an entry.** A docket entry is verified with `NS_DOCKET` over `docketStatement` (signatures R39, R40) against the keys the imported case file lists. Where no key matches, the notice says the keys were not checked, as `case-checker` R3 does. It is never dropped.
- (c) **A new edition is not imported automatically.** The response is the notice and a queue item ("telling the members"). The member then imports the new edition (case-import R1).
- (d) **An unreachable docket** answers `DOCKET_UNREADABLE`, never "nothing changed".
- (e) **A followed case that nothing rests on** gets a queue item to the watch's owner, with no re-evaluation dependents.

**Proposed entry (T29 `next.md`):**

> - N5xx · 2026-10-03 · **DEC-101 (3) and DEC-116 (8)'s citing side: watching other groups' published cases** (T28-1's last share; K1268). Draft first (P18), then fold. **monitoring** (L10): a member's watch on an import, naming the publisher's docket address. It reads `docketPublic` at the watch's cadence, verifies each new `edition` or `withdrawal` entry (`NS_DOCKET`, the case file's keys), and records what it saw as a look, deciding nothing (Intake Doctrine §4, §6). An unreachable docket is `DOCKET_UNREADABLE`. New `uses` edges: `case-import`, `docket` (both earlier, P4). **reevaluation** (L7): R2 gains the cause arm `cited_edition`, derived on read. A live leg on a ref at edition *n* of a case whose publisher has since placed a newer `edition` entry, or a `withdrawal` naming *n*, carries it. A telling `citedCaseMoved({import, entry})` called by monitoring, R31's pattern, read as the plane. **case-import** (L8): R4 answers the watch, and the latest edition seen at the publisher, beside the editions held. **queue-producers** (L11): an item to the watch's owner and to the owners of the dependents. **op-declarations, affordances, control-plane** (L11): the watch act's op, graded. **Hard reason before the fold:** none; the requirements are drafted from DEC-101 (3), DEC-116 (8) and Publication §5A and §5D with readings (a)–(e). **Why next:** its dependency is merged (P8).

**T28-1's row then closes:** DEC-96 (1), (2), (4) and DEC-92's server share are met; DEC-96 (3) and option B are Bob's triggers; the display is UX (K633); DEC-101 (3) moves to the entry above.

## 2. N530 draft: one spelling of the capture account statement

**The entry and ruling.** `build/plan/next.md`:13 and K1317 (3) (`build/rulings.md`:1319). The same bytes are spelled twice:

- `capture`'s `CAPTURE_ACCOUNT_TOKEN` and `captureAccountStatement`, at `bio-plane/src/capture/index.mjs`:66–68 (used at :935);
- `case-checker`'s `accountStatement`, at `bio-plane/src/case-checker/check.mjs`:57 (used at :422, re-exported by `case-checker/index.mjs`:21).

A literal copy is also in `case-checker/spec.mjs`:72, which is the readable specification (R14) and stays prose. The bundled program in `program.mjs` is regenerated.

**Proposed home: `signatures`, not either option N530 names.** `signatures` (index 4, layer 1; code `bio-plane/src/sshsig.mjs`) is pure and offline (R26, `signatures.md`:103). It already holds every other signed statement: `ratifyStatement` R5, `caseRatifyStatement` R6, `noticeStatement` R38, `docketStatement` R40 (`signatures.md`:24–36). `capture` (index 30) and `case-checker` (index 66) both already use it (`capture.md`:139; `case-checker.md`:56). `case-checker/check.mjs`:20 already imports from `sshsig.mjs`, so the standalone program gains no new import.

The alternatives were weighed:

- `record-grammar` (index 0) also satisfies the order, but signed statements are not record grammar.
- A pure file of `capture` would add a `uses` edge from the standalone checker onto a store-bound module, the very thing K1317 (3) avoided.

Under P17 the choice is BOB's: it is the module that holds the statement.

**Requirement edits:**

- **signatures** (`build/requirements/signatures.md`): add after R40 (:36):
  > `captureAccountStatement(captureSha, text) → Uint8Array`
  > - **R41** Returns exactly `` `bio-capture-account ${captureSha}\n${text}` `` (each argument as `String(…)`), the text unchanged after the first newline. `CAPTURE_ACCOUNT_TOKEN` is `"bio-capture-account"`. Its leading token differs from every other statement's (R5, R6, R38, R40), so no capture account and no other signed statement can be the same signed bytes. It is signed in `NS_RATIFY`. Same inputs always give byte-identical output. (DEC-81 item 3(c); `capture` R69, `case-checker` R3; N530, K1317 (3))

  Also extend R28 (:105) "over one message (R2, R5–R7)" to "(R2, R5–R7, R41)", and add to Status "AMENDED … N530: R41 added; not yet met (T29)".
- **capture** (`build/requirements/capture.md`):
  - In R69 (:91), replace "verifies (`signatures.verifySshsig`) over the text and digest" with "verifies (`signatures.verifySshsig`, `NS_RATIFY`) over `signatures.captureAccountStatement(captureSha, text)` (its R41)".
  - Change the Uses line (:139) to "`signatures`: `verifySshsig`, `captureAccountStatement`, `NS_RATIFY` (R69)."
  - `capture/index.mjs` keeps `CAPTURE_ACCOUNT_TOKEN` and `captureAccountStatement` only as a re-export from `signatures`, with no spelling of its own. Its tests and `affordances`' `sources.test.mjs` import them from there unchanged.
- **case-checker** (`build/requirements/case-checker.md`):
  - In R3 (:21), replace "verified over its account and the material's digest" with "verified over `signatures.captureAccountStatement(sha, text)` (its R41) in the ratify namespace".
  - Change the Uses line (:56) to "`signatures`: `verifySshsig`, `ratifyStatement`, `caseRatifyStatement`, `captureAccountStatement`, the ratify namespace (R3)."
  - `check.mjs`:53–57's own spelling is deleted. `accountStatement` stays exported only as an alias of the import, for `test/m/case-checker/fixture.mjs`. R13's program is rebuilt and R16's identity holds.

These are wording changes; meaning is unchanged (the same bytes).

**Entries per module (T29 jobs):**

- **signatures** (L1): R41, `captureAccountStatement` and `CAPTURE_ACCOUNT_TOKEN` added to `sshsig.mjs`, with a byte-pinned test and the distinct-token test (R28) (N530).
- **capture** (L3): R69 wording. The local spelling (`index.mjs`:62–68) is replaced by a re-export from `signatures`; the tests are unchanged (N530).
- **case-checker** (L8): R3 wording. `check.mjs`'s own `accountStatement` spelling is replaced by the import; the program and its SHA are regenerated (`program.mjs`) (N530).

## 3. N531 draft: reevaluation's detail read for an acceptance withdrawn

**The entry and ruling.** `build/plan/next.md`:15; K1319 (`build/rulings.md`:1321). Case-import R16 (`case-import.md`:73–78) says a viewer not sent is the plane, and a viewer sent must be an active member; anyone else is answered null.

**The defect.** `acceptanceWithdrawn` (`bio-plane/src/reevaluation/index.mjs`:1679) passes `MACHINE_ADMIN` (`machine:class:admin`, :156) as the viewer of `#acceptanceOn` (:1689). That reaches `accepted-work.acceptedFinding({ref, edition, viewer})` (:733), which case-import R16 answers with null, so the telling's `group` and `case` read null. R31's cause (`reevaluation.md`:84–85) promises "`detail` is the source group, case and edition". The code comment at :1676 already says "as the plane reads them (no viewer)", R30's precedent.

**Reading (BOB's):**

- **The telling reads as the plane.** A listener is the plane's own (R30, R28's precedent). The dependents it names are not filtered by any viewer here either (`(x) => x ?? null`).
- **The read paths keep the asking viewer.** These are `changesOf` and the obligation (:1213, :1515). Reading as the plane there would show an import's group and case to a viewer who is not an active member, which case-import R4 and R16 forbid. So the read path is not changed.

**Requirement wording change** (`build/requirements/reevaluation.md`, R31 "The telling", :88). Replace "It tells R8's listeners once, as `kind: "acceptance"`, with the dependents R31's arm answers for that withdrawal at that instant." with:

> It tells R8's listeners once, as `kind: "acceptance"`, with the dependents R31's arm answers for that withdrawal at that instant, read as the plane (no viewer; R30's telling, `case-import` R16), so each dependent's `detail` names the source group and case.

**Meaning:** unchanged. R31's cause already promises the group and case. The sentence states how the telling meets that promise; it is a wording change.

**Entry (T29 job):**

- **reevaluation** (L7): R31 wording. In `acceptanceWithdrawn` (`index.mjs`:1689), read the acceptance detail with no viewer in place of `MACHINE_ADMIN`. Add a test that a withdrawal's telling names the source group and case for a dependent, and that a non-member's `changesOf` still reads them null (N531, K1319).
