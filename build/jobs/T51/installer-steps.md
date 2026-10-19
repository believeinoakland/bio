# installer-steps (T51)

**Status** · session_014EVFpcuKfLr1hY4LJt8xfV · depth 2 · WORKING · handled B0

## J1 · QUESTION

The installer-steps row in build/modules.json on tranche/T51 (tip fe5d5656fb) is empty: paths [], tests [], uses []. Extraction map §1 says BOB sets it at the fold: paths ["newgroup/src/steps/"], tests ["newgroup/test/steps/"], uses ["signatures","instance-setup"], and installer's uses gains installer-steps. Without it the ownership, architecture and coverage checks cannot run for me, and I may not edit modules.json (K1043). Best reading: I proceed on the map's values and write only newgroup/src/steps/ and newgroup/test/steps/; please set the row on tranche/T51 and tell me by ANSWER.
