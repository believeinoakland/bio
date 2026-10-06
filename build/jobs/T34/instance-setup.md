# instance-setup (T34)

**Status** · session_01S3X36eJb4QMNJh8gf2c6jK · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on (carrying on with each; none blocks me yet except (1), which I need before my merge):

1. **`modules.json`: `queue-producers` is missing from instance-setup's `uses`.** R62 registers `placeArrivals` with `queue-producers` (`registerPlaceArrivals`, its R38), so this module must import `queueProducersOf` from `bio-plane/src/queue-producers/index.mjs`; architecture check 1 refuses that import until `uses` names it. Please add `queue-producers` to instance-setup's `uses` on `tranche/T34` (BOB's file).
2. **R50 on the first profile as held:** its counterparties carry `ids.body` (Legistar BodyIds) and no `ids.office`, and `within.ids` is `[]`. My reading: each entity is seeded when, and only when, the profile gives its own identifier: the body is seeded under `ids.body` even when the office has none; the office is answered could-not-be-seeded (no `ids.office`), and so are `post_in` (no office) and `part_of` (`within` has no identifier). R51 then finds the body through a new ledger of seeded bodies (`seed_bodies`, purge-clear like the other seed tables), not only through a seeded office.
3. **R52's `member_types` with `organisation` (jurisdictions R60, K1729):** the seat's body's organisation is the matched profile counterparty's `organisation`, else the Legistar body's form under the body-variant map; an entry for that organisation is read before one with no `organisation`. Today's code ignores `organisation`, so on the first profile every Council seat would read undetermined.
4. **R65's `assistant` (control-plane R57 resolves it at the door):** my route reads it from the query as `assistant` (JSON `{on, account}`), a stamp like `by`, never from the body. CONTROL-PLANE #23 needs the same; tell me if you rule another channel.
5. **R65, an `answers` list that is not a list of `{question, text}` with each `text` a string of at most 1,000 characters:** refused `GROUP_DRAFT_NO_ANSWERS` only when every text is empty; a malformed list or an over-long text is refused by a new row `GROUP_DRAFT_ANSWERS_MALFORMED` ("The questions are answered in a short list, each answer at most 1,000 characters. Nothing was saved."). R65 names no code for it.
6. **Row numbering:** `PLACE_NAME_MALFORMED` C-64.8 and `GROUP_DRAFT_NO_ANSWERS` C-64.9 (then (5)'s row C-64.10); R64's `MACHINE_CANNOT_SET_LANGUAGE` C-119.11 and `LANGUAGE_MALFORMED` C-119.12; all `awaiting stamp`.
7. **R62's registration shape:** I register `({viewer}) => placeArrivals({viewer})` once at start through `queueProducersOf(ctx).registerPlaceArrivals(read)`; R62 compares at each start only (not on an administrator's read).
8. **R64:** a `by` that is absent or a machine (`class:…`) is refused `MACHINE_CANNOT_SET_LANGUAGE`; a tag is kept as given (trimmed) when `Intl.getCanonicalLocales` reads it as one tag, as jurisdictions' `isLocale` does (not exported, so the reading is repeated here; noted for jurisdictions).
