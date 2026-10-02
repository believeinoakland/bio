# capture (T22)

**Status** · session_01WP7uNR1V8GPqjyrKhjKhiS · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; none blocks me. Answer only if a reading is wrong.

1. R77 "its source as provenance records it" and "its age since it was collected". Reading: the source is the earliest acquisition receipt (`captured_locators`, provenance R48) of a capture the document's register rows name: `{address, via, retrieved}`, null when none; sorting by source sorts on that address. The age runs from `bundles.created` (record-core R37) when the document has never left `collected` (`prior_state` null), else from `bundles.last_updated`, since record-core keeps no per-state instant capture may read.
2. R79/R81 "an empty or machine author". Reading: a machine author is one whose stamp carries record-grammar's `MACHINE_CLASS_PREFIX` (`class:`) or is the bare founder's viewer `admin` (membership R43's machine-or-founder arm without a member id); `member:<id>` and a bare member id are members. The id-count, absent/invisible and wrong-state refusals have no catalogue row in R79 and none is minted: they answer uncatalogued codes `NO_IDS`, `TOO_MANY_IDS` (with `max`, record-core's `PER_ITEM_MAX`), `NO_SUCH_DOCUMENT`, `NOT_INFORMATION`, `NOT_COLLECTED`, `ALREADY_SET_ASIDE`, `NOT_SET_ASIDE`, each naming its ids.
3. R80 "how many of them found the whole-doorbell limit reached (R48)". Reading: a refused knock whose instance estimate had reached R48's limit when the rate was asked: every `RATE_GLOBAL`, and a `RATE_IP` whose instance window was also full. Refusals the Worker makes before the store (R49–R51, the two required-argument refusals, R66's weak secret) reach the tally through one new store route, `doorbellrefused`, whose failure is ignored. `doorbellTally` answers a viewer that is not a member session (`member:<id>`) `MEMBER_SESSION_REQUIRED` and reads nothing.
