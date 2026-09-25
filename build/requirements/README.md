# Module requirements: conventions

**Status** · Written by BOB #37, 2026-09-25, from the T6 sample (`id-spaces.md`). The format is PROCESS-MECHANICS §3; these are the conventions every file follows. A module job reads its own file whole, and the public part of each module it uses.

1. **Written for the job that implements and tests the module.** Each statement is precise enough to write a test from, and only as long as that needs.
2. **Every requirement is testable at the module's interface (P7).** An obligation that only a caller can keep goes in the caller's requirements, and this file names it under Suggestions.
3. **Each service states its inputs, its outputs, and its errors.** Errors include "never throws" and "returns null when …". A service's precondition is stated with what happens when it is broken.
4. **Requirements state outcomes, never an implementation (P5).** Names of functions and fields are the interface. Anything else about how is a Suggestion.
5. **An id is written exactly `**Rn**`**, first on its line, so the coverage check (PROCESS-MECHANICS §8) finds it. A requirement main does not yet meet is marked right after it: `*(not yet met: <row or entry>)*`.
6. **Ids are permanent once Bob approves the file.** A retired id is marked retired and never reused. Before approval, a draft may renumber.
7. **No jurisdiction (`layers.md`, "No jurisdiction in the product").** Local facts come from a jurisdiction profile. Only the `jurisdictions` module's profile data names a place.
8. **Satisfies cites the canon by section** (`requirements/README.md`), never by line.
