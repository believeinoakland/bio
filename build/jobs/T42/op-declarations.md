# op-declarations (T42)

**Status** · session_01Wu8uik71zHTxjU6oJ3EtBz · depth 2 · COMPLETE · handled B1

## Completion (OP-DECLARATIONS #17)

**Reading (mechanics §17, K2304).** The measured set (1435 KB) is over 300 KB. I read these whole: `build/requirements/op-declarations.md`; layer 11's row and the control-plane split section of `build/layers.md`; T42-26 in `build/plan/current.md` and the plan's rule 4; K2611, K2613, K2635 and K2656; the op-declarations section and doubts of `draft-T42-l11.md`; §7 of `draft-T42-transcribe.md`; the public R1–R3 of `case-account.md` and R71 and R72 of `extraction.md`; extraction's `ops.mjs` (`pageTranscribeOp`, `pdfStructureOp`, `EXTRACTION_OPS`); and the parts of `index.mjs` this entry changes (`OP_KINDS`, `family`, `OP_FAMILIES`, `OP_STAMPS`, `ACT_HELP_ABSENT`). I also read `t41.test.mjs` whole. A worker read the rest of `index.mjs` and all 15 test files in full and wrote a summary of about 6 KB, citing file and line.

**Entries applied (T42-26; N832, N839).**
- **R47:** `pagetranscribe` is declared in a new family of extraction's own (`owner: "extraction"`, kind `member`, actor `QUERY("by")`). The table entries follow from it:
  - spec `{classes: [admin, member], machineClasses: [], mutating: true}`;
  - in both session sets;
  - `NEEDS` `contribute`;
  - stamps `by` and `viewer`;
  - in no act list, neither bearer fence, and no grant's list.
  - The op reads `sha256` and the optional `project` from the address, through extraction's `pageTranscribeOp`; neither is a stamp.
  - `ACT_HELP_ABSENT` names it under the last ground (`unexplained`).
- **R48:** `accountpropose` and `accountdrafts` move to a `case-account` family (cite `case-account R1, R3; R43; K2569, K2608`) with their specs, rows and stamps unchanged. No family names `case-authoring` any longer.
- **Edges:** I added `op-declarations` → `extraction` and → `case-account` to `build/modules.json`, as K2656 and B1 direct.
- **Own flaw fixed:** the file header said R1–R46; it now says R1–R48.

**Tests.**
- New file `t42.test.mjs` has 5 tests, naming R47, R48, R34 and R6, each with a negative control. They check:
  - the whole spec, rows, sets, stamps and family;
  - that `pageTranscribeOp` reads `sha256` and `project` from the address only, as `pdfstructure` does: a body copy does not reach it, and a malformed digest never reaches the store;
  - that the op is not in `EXTRACTION_OPS`;
  - R34's totality over the member set;
  - that case-account exports no ops map and serves both account ops.
- Re-pointed in existing tests:
  - `t33.test.mjs`: the family-owner list gains `case-account` and `extraction` and loses `case-authoring`;
  - `t41.test.mjs`: the R43 rows and `DOOR` list now name `case-account`.

**Runs.** Test runs and checks, each with its summary line:
- op-declarations: `tests 133, pass 133, fail 0`.
- Users (P11):
  - admission: `pass 41, fail 0`.
  - plane: `pass 166, fail 0`.
  - control-plane: `pass 215, fail 1`. The red is `test/m/control-plane/totality.test.mjs`:17 (R2, R41), where affordances' unaccounted lists `pagetranscribe` as unpublished and unranked. It passes on the tranche tip without this change. It is the expected red until op-grades R31 (T42-25a) and affordances (T42-25b) merge, and both come before this job in L11's order.
  - legacy-ui `civicos-ui/test/`: `pass 35, fail 3`. One is `statement-ack.test.mjs`, inherited (rule 4 (4)). The other two, `progression-revision.test.mjs` and `queue-recipients.test.mjs`, also fail on the `origin/tranche/T42` tip without this change, so they are not this job's.
- Checks:
  - format: `0 failures`.
  - architecture: `0 failures`.
  - coverage: `47 of 47 live requirement ids named by a test; 0 failures`.
  - ownership: `1 failure`. The failure is `build/modules.json`, the edge edit B1 directs; it is for BOB to check.

**Found in other modules (for BOB).**
1. **extraction:** the handler reads the actor from the query's `author`: `pageTranscribeOp` takes `author` (`extraction/ops.mjs`:74, :82), and `extractionOps` has `by: q("author")` (`extraction/index.mjs`:1739). R47 stamps `by` (with `viewer`), as R43's member acts do. So control-plane R74's hook must hand `author`: the door sets `author` from the session, as `pdfstructure`'s already does. Nothing here changes for it; it is for CONTROL-PLANE's T42 job.
2. **control-plane:** `src/control-plane/owner-ops.mjs`:37–38 still call `of.caseAuthoring().accountPropose` and `accountDrafts`. R48 relies on control-plane R71's re-point to `of.caseAccount()`, which is its T42 job's (K2656).

**Deferred.** None. The `ACT_HELP_ABSENT` comment's "28 aliases" describes the PR #13 reading, so I left it; the list holds 27 today.

Size (session_01Wu8uik71zHTxjU6oJ3EtBz): test runs 9, module lines 3426
