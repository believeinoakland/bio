# capture (T43)

**Status** · session_012qi9yvQTQeqGH156Kzdsx8 · depth 2 · WORKING · handled B1

## J1 · QUESTION

N849's user check found one live user of the doorbell copy not re-pointed: `admission`'s `src/admission/window.mjs`:82 builds its door window's fingerprint as `captureOf(ctx).sourceFingerprint(address)` (capture's retired R56, now doorbell R12), and `plane/store.mjs`:390 calls `admissionOf(ctx)` with no `deps.fingerprint`, so the plane's public-door window (admission R21, `doorwindow`, every public op's count and `sourceOf`) reaches it. Deleting it whole makes every stated-address `doorwindow` call throw from L3 until admission re-points. No other user remains: `git grep` over `bio-plane/src` finds no other import of `capture/doorbell.mjs`, `KNOCK_CHECKS` or the copy's methods (sources, actions, store-door, plane, answer-envelope re-pointed in T42; `answer-envelope/families.mjs` reads `capture/checks.mjs` as a family file, which stays).

Options: (a) delete it with the rest, and accept admission's window red from T43-8 until an admission entry re-points it to `doorbellOf(ctx).sourceFingerprint` (admission gains `uses: doorbell`; a T43 L11 entry or the plane's composition handing `deps.fingerprint`); (b) K625's pattern: capture keeps `sourceFingerprint` and its key read (`#knockKey`, over `knock_key`, the same DDL doorbell creates; not declared by capture, since doorbell declares it) as a named held copy answering no requirement, deleted by capture's next job once admission has re-pointed.

My best reading, which I am building meanwhile: (b), since (a) breaks the public door, not only a test, and K625 is the stated pattern for a delete a later layer's user still needs. Everything else of the copy is deleted. Say (a) and I drop the two methods.
