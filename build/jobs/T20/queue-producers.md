# queue-producers (T20)

**Status** · session_01RohbFEqsGMN7F4XD4dQZEP · depth 2 · COMPLETE · handled B1

## Completion (QUEUE-PRODUCERS #4, T20 layer 11)

**Entries applied** (B1, K899 (7), K899 (1), K902):
- **R19** `litigation-hold` OBLIGATIONs (`#obligationsLitigationHold`, `src/queue-producers/index.mjs`): one per mark `actions.holdsDue` answers the viewer (reached as `#actions`, `actionsOf(host)`, beside `#actionClocks`; paged with `#actionPages`), keyed `OBLIGATION::litigation-hold::<action>::<position>`; to every administrator member (membership R64) or the `admin` machine credential (as R14), and to the member who marked it, to nobody else (`recipients` = the active administrators and the marker); subject the action with the entry's position and the mark's note (and its project); aged from the mark's instant; homed as R15's (`#actionHomes`); options `{id: "actionhold", label: "Record whether a litigation hold is in place", weight: "single"}` (`HOLD_STATE`, beside `REMINDER_ANSWER`) then `#optionsOf([action])`. It leaves when any hold is stated (the read no longer answers the mark). R11 belt-and-braces: a mark on an action, or a project, the viewer may not see is dropped/blanked here even if the provider answered it.
- **K899 (1)** "record" for "bundle": `index.mjs`:1470 export-performed summary now reads "`${r.bundles} records`" (`r.bundles` stays). **Re-scan of `paths`** for other member-read strings holding the word (comments, SQL and identifiers aside): none. Kept as identifiers: `subject.kind: "bundle"` values (:424, :510, :1668, :2066), the `bundles` fields (:345, :1477, :1721, :2156, `proposals.mjs`:95), `held_by: "the project's own bundle.md"` (:1058, names the file), and the developer-facing `Error` at :98–:99 (thrown on a coding fault, never served to a member). No test pinned the old words; R2's export-performed test now pins the new summary.

**Tests:** `action.test.mjs` gains R19 (one item per unanswered legal mark; the cursor followed; administrators, the admin credential and the marker only, never the project's owner or another credential; never for an invisible action and named nowhere; gone once a hold is stated); `feeditems.test.mjs` R8 covers `litigation-hold` and its options; `producers.test.mjs` R2 pins the "records" summary; `world.mjs` gains the `actions.holdsDue` default fake.

**Deferred:** none.

**Found in other modules (REPORT):**
- `queue`: `Queue.PRODUCER_DEPS` (`src/queue/index.mjs`:96) does not list `actions`, so a caller's fake `actions` cannot reach the producers through queue (queue's tests pass today because queue-producers reaches the real `actionsOf(host)` lazily). Its T20 L11 job (K902: R1, R12) is the natural place to add it.
- Generated artifact staled: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`), rebuilt at layer close.
- `build/requirements/queue-producers.md`: R19's "*(not yet met: T20 layer 11)*" mark is BOB's to strike; the Status line still says "The litigation-hold item (K613 (2)) is not folded", now superseded by R19 (BOB's text).

**Tests and checks run:**
- `node --test bio-plane/test/m/queue-producers/`: tests 47, pass 47, fail 0.
- `node --test bio-plane/test/m/queue/` (the user of this module): tests 74, pass 74, fail 0.
- `checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs queue-producers`: 11 product files, 44 relative imports; 0 failures.
- `checks/coverage.mjs queue-producers`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs queue-producers tranche/T20`: 6 files changed; 0 failures.

Size (session_01RohbFEqsGMN7F4XD4dQZEP): test runs 4, module lines 2743
