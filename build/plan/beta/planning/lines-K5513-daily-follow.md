# K5513 — a followed court case checked daily on the team's key: the amended line

**Status** · READY for BOB · PLANNING #3 (L18), 2026-10-27. K5513 (Bob, C22, option A): "following a court case is the member's ask under K5498: Civicsmith checks a followed case for new filings once a day on the team's own free CourtListener key, only for cases a member chose to follow, and stops when they unfollow; PLANNING amends credentials R29's draft ("never one a daemon uses") to match." Ids as in the requirement files; BOB writes the line.

## Where the words are

The sentence "never one a daemon uses" (K1449) is in **`acquisition` R36** (`keyedFetch`), not in `credentials` R29. R29 says only that "a paid account is not a keyed service" and that `keyedServiceFor` answers the key to its in-plane caller while the service is on: both stay true under K5513, so **R29 is unchanged**. The amendment is R36's closing sentence. CAPABILITIES' lines marked "CONDITIONAL on C8-poll" (`N1259-a` R130, `N1259-e` §5 point 10, §6 point 6, §7 point 1) now take their "if Bob amends" arm; that is CAPABILITIES' to apply.

## acquisition

- **R36** (T53; K5513; K5498; amends R36's last sentence, K1449) `keyedFetch(store, {service, request, purpose})` fetches from a keyed outside service under the group's own key, read at the moment of the call from `credentials.keyedServiceFor({service})` (its R29). While the service is off or holds no key it answers that refusal (`KEYED_SERVICE_OFF`) and fetches nothing; nothing in the copy needs a service to be on (D201). Every request goes through the host governor under R9's user agent, to a public locator on the service's own host only; the key goes only to that host, and is never carried in an answer, a receipt, a document, an error or a log (a thrown fetch's message is not carried when a key rode it, as R23). It runs for an in-plane caller's act, and is not a paid account. A daemon uses it in one case only: the daily check of a court case a member chose to follow (`purpose: "follow"`, K5513), on a free keyed service, once a day per followed case, only while at least one member still follows that case, stopping at the last unfollow; any other daemon call is refused `NOT_PERMITTED` and fetches nothing (K1449 still holds for paid accounts and for every other service). Test: with the CourtListener service on, a case followed by one member is fetched once on the day's alarm with `purpose: "follow"`, and not again that day; after the member unfollows, the next alarm fetches nothing. Control: a daemon call with any other purpose, or for a case no member follows, is `NOT_PERMITTED` and sends nothing; with the service off the follow check answers `KEYED_SERVICE_OFF` and the follow stands, reported unchecked; the key appears in no answer, receipt or log (sentinel scan).

## For BOB (technical)

1. K5513 names `credentials` R29; the sentence is `acquisition` R36's. [rec: amend R36 as above, R29 unchanged; record the correction in K5513's note.]
2. "Free keyed service": CourtListener today. [rec: the daemon arm is bound to the service of a followed docket (`courtlistener`), not to any free service, so a future keyed service needs its own ruling.]
3. `NOT_PERMITTED` is CAPABILITIES' refusal (K5469, replacing `KEYED_DAEMON_NOT_ALLOWED`). [rec: the same code here.]
