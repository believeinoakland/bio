# legistar-reader (T51)

**Status** · session_01GrpZ7hbCEnkMsZxbADVkHJ · depth 2 · WORKING · handled B1

## J1 · REPORT

Findings in other modules, found by the words check while I ran it on my module (not changed by me):
- events `bio-plane/src/events/follow.mjs:127` [plain] "the capture is not one legistar-reader read" and `:167` [plain] "legistar-reader: EventDate and EventTime joined in the profile's zone". Both are in events' module; they are developer/diagnostic-style strings in code, so the events owner decides: key them or list them as unkeyed.
- instance-setup `bio-plane/src/setup.mjs:1856`, `:1857`, `:1868` [plain], and `:1976` (a sentence with `{}`), all Legistar-related sentences in instance-setup's code. Not mine to change.
These are for BOB to route to the owning modules' jobs; legistar-reader has zero words findings now.
