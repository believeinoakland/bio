# capture (T32)

**Status** · session_01GSh98oKfBHUNDu5vj9XCLy · depth 2 · WORKING · handled B1

## J1 · QUESTION

N541 / acquisition R33: R33 states `firstHopWho(instanceName)` answering `instance <name> (Civicsmith/<version>)`, but names no source for `<version>`. Today both spellings (capture `index.mjs` 847, acquisition `index.mjs` 1087) read it from the instance's `env.VERSION` (default `0.0.0`), as `civicsmithUserAgent` takes its version as an argument (acquisition R24).

My best reading: the call is `firstHopWho(instanceName, version)`, a missing name read as `unnamed` and a missing version as `0.0.0` (R24's defaults), so the first hop keeps naming the version the instance runs. I am building capture R65 as `firstHopWho(this.env.INSTANCE_NAME, this.env.VERSION)`. If acquisition's R33 is one argument with the version taken elsewhere, my call still works (the extra argument is ignored), but please confirm with ACQUISITION so the version is not lost. Not blocking: I carry on and wait for your CHANGE after acquisition merges.
