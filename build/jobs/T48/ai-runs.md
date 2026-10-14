# ai-runs (T48)

**Status** · session_01PAii9y1tiSd27iVMyxGeXg · depth 2 · COMPLETE · handled B0

## Completion

**How the reading set was read (mechanics §17).** I read these whole myself:
- `build/requirements/ai-runs.md`;
- `bio-plane/src/ai-runs/index.mjs` (3,504 lines at START) and `schema.mjs`;
- every file under `bio-plane/test/m/ai-runs/`;
- the public part of `ai-accounts` (R1–R34);
- the `ai-accounts` code this entry reads (`accountUses`, `accountUsesOf`, `#usesAnswer`, `groupKeyState`, `groupKeySwitches`, `aiAccountsOf`);
- `credentials`' factory and its R72 and R73.

The rest of the set was over the limit. Two helpers in this session read those parts whole and wrote digests citing each id:
- the public parts of the other 15 used modules (record-grammar, civil-time, runtime-limits, record-core, membership, promotion, connections, bias, observation-log, retrieval, inquiry, contradiction, run-rules, ai-use, steps);
- the public part of `credentials`, with §5 of `build/extraction/credentials-split.md`.

The sources stay binding. The digests confirmed the reading below (split map §5: the ai-runs row) and found nothing else in the used modules that this entry touches. This module reads no C-29 row.

**Entries applied (T48-30; N996 §5).**
- **The five reads now go to `ai-accounts`**, through a new `#aiAccounts()` (`deps.aiAccounts`, else `aiAccountsOf(ctx)`, the one instance `credentials`' factory made with the seal secret, ai-accounts R32):
  - `accountFor` (`#accountFor`: R52, R18, R79);
  - `accountReferenceState` and `groupKeyState` (`#accountServing`: the wake's decision);
  - `accountUses` and `groupKeySwitches` (`#aiRunDispatch`'s `suggestions`).
- **`credentials` is reached only for** `aiRunCredentialMint`, `aiRunCredentialsEnd` (R18, R14) and `aiCredentialLook` (R18).
- **Behaviour is unchanged.** The calls and answer shapes are identical, because the `credentials` delegates were byte-identical (credentials R72). The comments now cite `ai-accounts` ids (R2, R6, R7, R9, R11, R14, R15, R18, R19, R20) where they cited `credentials`' retired ones.
- **The tests follow.**
  - `world.mjs` exposes `aiAccounts`, and sets members' keys and sign-ins through it.
  - `scheduler`, `t46`, `usage` and `reexam` set group keys, switches, project accounts and keep-away through `w.aiAccounts`, never through credentials' transitional delegates.
  - New `t48.test.mjs`: with every `credentials` account delegate made to throw, the open (R52), the wake's decision and dispatch with each switch (R18, R79) and a member's dispatch at her act, through to the end of its segment credential (R18, R79, R14), all answer as before, and no delegate is asked.
  - Controls: the same read failing in `ai-accounts` changes the answer (`AI_NO_ACCOUNT`; suggestions off; withheld `NO_ACCOUNT`).

**Own code read whole (P20).** I found no flaw beyond the stale citations, which are now corrected. Nothing is deferred.

**Found in other modules (REPORT).**
- `credentials` R72: ai-runs no longer calls any of the delegates. Once the other users re-point, the delegates can be retired (split map §5).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` includes ai-runs and is now stale; BOB regenerates it at the layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/ai-runs/`: tests 105, pass 105, fail 0. The baseline before the change was 102/102.
- No layer tests are named (manifest). No service this module provides changed, so there are no users' tests to run.
- `format`: 0 failures.
- `architecture . ai-runs`: 20 product files, 0 failures.
- `coverage . ai-runs`: 49 of 49 live ids named, 0 failures.
- `ownership . ai-runs tranche/T48`: 8 files, 0 failures.
- `checks/run.mjs`:
  - architecture 0 failures (0 for my files);
  - format 0;
  - channels 0;
  - coverage 37 failures, all in other modules (inherited), none in ai-runs.

Size (session_01PAii9y1tiSd27iVMyxGeXg): test runs 2, module lines 3672

## J1 · COMPLETE

T48-30 applied: groupKeySwitches, accountUses, accountReferenceState, groupKeyState and accountFor read from ai-accounts (#aiAccounts, the one instance credentials' factory made); credentials kept only for aiRunCredentialMint, aiRunCredentialsEnd, aiCredentialLook. Behaviour unchanged. Tests follow: fixture and setups through w.aiAccounts; new t48.test.mjs shows every credentials account delegate unasked, with controls. Module tests 105/105; coverage 49/49; format, architecture, ownership 0 failures; run.mjs architecture 0, coverage reds all other modules'. REPORT: ai-runs no longer uses credentials' R72 delegates; bio-plane.bundled.mjs stale. Details in my record.
