# ratification (T50)

**Status** · session_01N7Me7i7bgRgiga2wsADLMV · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T50-83 ratification: complete. Commit 8f11130dff on job/T50/ratification.

Entries applied
- R44 (T50, N1203): the pre-flight's publish_at zone is now the governing zone as retrieval R69 reads it: local-facts' governing time_zone first, else the active profiles' through jurisdictions.combine. Should retrieval be unreadable, the profiles answer as before. Unchanged: no zone offers only "Publish now" (PUBLISH_AT_NO_ZONE), never UTC, writes nothing, never throws.
- Test (R44, named): a local correction governs; retrieval holding no zone offers nothing even when a profile holds one; an unreadable retrieval falls back to the profiles. Fixture: world() takes an optional `retrieval` stand-in.

Deferred: nothing.

Found in another module: none.

Requirement marker: R44 carries "(not yet met: T50)" on the tranche branch. Its test passes here; clearing the marker is BOB's.

Tests and checks
- node --test test/m/ratification/*.test.mjs: 246 pass, 0 fail.
- node --test test/m/case-authoring/*.test.mjs test/m/action-holds/*.test.mjs (dependents): 229 pass, 0 fail.
- checks/format.mjs /home/user/bio: 0 failures.
- checks/architecture.mjs /home/user/bio ratification: 0 failures.
- checks/coverage.mjs /home/user/bio ratification: 51 of 51 live ids named by a test; 0 failures.
- checks/ownership.mjs /home/user/bio ratification tranche/T50: 0 failures.
- checks/run.mjs /home/user/bio: architecture 0 failures for all files; coverage 33 failures, all in other modules (none ratification); format and channels 0 failures.

Size (session_01N7Me7i7bgRgiga2wsADLMV): test runs 3, module lines 3849
