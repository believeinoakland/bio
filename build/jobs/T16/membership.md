# membership (T16)

**Status** · session_01Nism1JK1EosdBHAiFXkWHn · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings of R89/R90 I am building on now; tell me if any is wrong.

1. **"every administrator (R86) is notified".** Membership has no notice store and no module before layer 11 delivers notices. My reading: R89's answer carries `notified`, the R86 list at that instant, and the registration stays on the signer row (`origin: "self"`, `registered_by`, `added`), which is what the notice is read from; delivering an item to each administrator (an inbox or queue item) is layer 11's (tasks, queue-producers or control-plane), which I name in my record as a report. I add no listener slot, since R89 names none. I notify on every accepted call, `existed: true` included.
2. **A key `by` already holds.** R89 answers `existed: true`, and the key is left `active` with `origin: "self"` and `registered_by: by`, even when it was revoked or registered by an administrator. Re-activating a revoked key gives the member nothing beyond what registering a new key would, and every administrator is notified and can revoke it again (R26).
3. **Refusals outside R89's list.** A `by` that is absent (unstamped) is `MACHINE_CANNOT_REGISTER_KEY`, because nobody is behind it. The founder (`admin`, no member row) answers R25's `NO_SUCH_MEMBER` through the same member bar: a key on no member row would never attest (R27). R90 answers `NO_SUCH_KEY` for every key `by` does not hold, including when `by` is a machine or absent. `MACHINE_CANNOT_REGISTER_KEY` gets no row (only C-96.15 is required); R89's `BAD_KEY` relays R25's own region, so C-96.8 keeps its one site. The ops (`op=signerregister`, `op=signerrevoke`) are not added to `membershipOps`; their routes and stamps are control-plane's.
