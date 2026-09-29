# inquiry (T12)

**Status** · session_01SF3BCxa5TAs5uVuri45pJU · depth 2 · WORKING · handled B1

## J1 · QUESTION

R20 (N285) has `dispose` answer `NOT_A_DISPOSITION` through `progressions.notADisposition`, and the private Uses in `build/requirements/inquiry.md` name `progressions` (`notADisposition` and `DISPOSITIONS`, its R35). But `build/modules.json` does not list `progressions` in inquiry's `uses`. So the import fails `checks/architecture.mjs` ("does not declare in uses"), even though progressions (layer 5) comes before inquiry in the order.

My best reading, which I am building on: you add `"progressions"` to inquiry's `uses` in `build/modules.json` on `tranche/T12`. I will then merge the tranche and re-run the check. My change imports `notADisposition` and `DISPOSITIONS` from `../progressions/index.mjs`. It re-exports progressions' frozen `DISPOSITIONS` as inquiry's own (R35 calls it "the one list"), so inquiry's literal copy goes and `affordances`' re-export still resolves.
