# control-plane (T42)

**Status** · session_017Td7k1YMLLrLUpRB4yBYq4 · depth 2 · WORKING · handled B1

## Completion (T42-29)

**Read whole (mechanics §17, K2304).** The START measured 1,960 KB, over 300 KB. Read whole myself: `build/requirements/control-plane.md`; layer 11's row and its split section in `build/layers.md`; plan entry T42-29, K2611, K2613, K2631, K2635, K2656, `draft-T42-l11.md` (T42-29 and the doubts), `draft-T42-transcribe.md` §7; the code and tests this entry changes: `owner-ops.mjs`, `owner-ops.test.mjs`, `doorbell.test.mjs`, `inbox-door.test.mjs`, `harness.mjs`, `record.mjs`; the used services named: `extraction/ops.mjs` (`pageTranscribeOp`), `doorbell/index.mjs` and `checks.mjs` exports, `case-account`'s `accountPropose`/`accountDrafts`, `store-door/pull.mjs`, plane `door.mjs`'s `gatedOp`. One worker read the rest of the code whole (`index.mjs` 3,108 lines, `archive.mjs`, `draft.mjs`, `signin.mjs`) and wrote a summary of about 7 KB, each statement citing file and line. It found the flaw fixed under R74 below.

**Entries applied.**
- R71 (N839): `owner-ops.mjs` reaches `accountpropose`/`accountdrafts` through `of.caseAccount()`, never `case-authoring`.
- R72 (CAPTURE #26 J2, K2631): `captureupload` passes no `within`. The caller's `within` in the address reaches nothing.
- R74 (N832): this needs no op-specific admission code. Once op-declarations R47 declares the spec, the generic path does the work: `OPS` (UNKNOWN_OP otherwise), `admit` (session only, since `machineClasses: []`), the declared stamps, and `hooks.gatedOp` with the door's ctx.
- R74 flaw fixed (found by the worker). Should plane's hook decline, the generic forward would have carried the caller's `cls`, `caps` and `session` to the store's `pagetranscribe` route (or `pdfstructure`'s), because none of them is in `QUERY_STAMPS`. The forward now sets them, with `viewer` (R17's expression), `author` and `store`, from the door (`index.mjs`, the block after `unpack`'s).
- R36, R58: the wording was already written by BOB. Tests re-pointed (N826, K2656):
  - `doorbell.test.mjs` and `inbox-door.test.mjs` now read `doorbellOf`, `PULL_WITHIN_FAILED_DETAIL`, `REASON_MAX` and `DOORBELL_CHECKS` from `doorbell`, and hand `pullAndFile` `deps.doorbell`.
  - `record.mjs` builds `doorbellOf` and routes `doorbellOps`.
  - No control-plane file imports capture's doorbell copy now, so capture's T43 delete is clean on this side.

**Tests added.**
- `t42-door.test.mjs`, 6 tests for R74:
  - the spec;
  - the stamps for a member and the founder, forged or not;
  - each refusal (bindings CLASS_FORBIDDEN, agent AI_BEYOND_TASK_SCOPE, no `contribute` NOT_CAPABLE, anonymous 401), with neither the hook nor the store asked;
  - the owner's answers relayed as given;
  - the declined-hook forward, for `pagetranscribe` and `pdfstructure`.
- `owner-ops.test.mjs`: R71 (only the `caseAccount` getter asked; negative control `caseapprove` reaches `review`) and R72 (exactly `{bytes, statement, name, by}`).
- Negative controls are in each test. The `pdfstructure` forward test was seen to fail without the fix.

**Depends on providers merging first (L11 order).**
- 5 R74 tests need op-declarations R47's spec. They were run green against a local stand-in spec (`family({owner: "extraction", ops: {pagetranscribe: "member"}})`, not committed).
- 4 R36 tests need store-door R7's `deps.doorbell`. They were run green against a local stand-in `pull.mjs` (`deps.doorbell ?? deps.capture`, not committed).
- On this branch now: 214/223, those 9 red.

**For BOB.**
- (1) `modules.json` edges `control-plane → case-account, doorbell` (the ownership check refuses a job's edit). Architecture shows 4 failures until then, all of them the `doorbell` imports in tests.
- (2) plane: `store.mjs`:677 still hands `of.caseAuthoring`. Until plane R35's `caseAccount` getter lands, `accountpropose`/`accountdrafts` through the plane would throw `of.caseAccount is not a function`. This is plane's T42-30 share, and it merges after this job.
- (3) plane's `door.mjs`:54 hook `viewer` for an `ai` credential is `class:ai`, where R17 says the principal. This matters for pdfstructure (and pagetranscribe, which an `ai` credential cannot reach). It is reported, not changed.

**Deferred:** none.

**Tests and checks.**
- control-plane suite: 214 pass, 9 fail (above). With both stand-ins: 223/223, apart from affordances' R41 census, which flags the stand-in op as unranked.
- plane (users, P11): `test/m/plane/` and `migrate-released`: 167/167.
- legacy-ui: 35/38. The reds are `statement-ack.test.mjs` (rule 4 (4)) and `progression-revision.test.mjs` and `queue-recipients.test.mjs`. The last two are red on `origin/tranche/T42` without this change too (fixture FAILs), so they are not this job's.
- Checks: format 0 failures; coverage 47/47 0 failures; ownership 0 failures; architecture 4 failures (the missing `doorbell` edge, item (1)).

Size (session_017Td7k1YMLLrLUpRB4yBYq4): test runs 16, module lines 3529
