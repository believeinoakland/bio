# Fix round 5, step 0 reads on biosmoke8 (2026-10-22)

Read-only reads of biosmoke8 as the administrator (JOURNEY_ADMIN) and the member (JOURNEY_MEMBER, handle `walker`), 08:33Z to 08:49Z. No credential recorded. Every request is `GET /api/?op=...` with the page session's bearer unless stated. One write only: the capture of item 3. Ledger times are the server's epoch milliseconds turned to UTC. 

## 1. E2 / E6: owedwork and reading

Requests (administrator, then member, 08:33:24Z to 08:33:59Z; the answers are the same except where said):
`op=owedwork` and, for each digest, `op=owedwork&sha=<64 hex>` and `op=reading&sha256=<64 hex>`. The ledger and the reading are keyed by the digest the document was **registered under**: for a fetched capture its capture digest; for an upload the digest in `source.address upload:<sha>`, which is not the `capture.sha256` that `heldcaptures` shows for 0107, 0121, 0125 (the reading under `capture.sha256` answers `found:false`; under the upload digest it answers the real reading).

**Counts (`owedwork` with no sha), 08:33:24Z:** `reading` owed 11, final 0; `keep` owed 2, final 0; `subresources` owed 2, final 0. No row anywhere is `final`.

| document (digest used) | ledger row (`owedwork&sha=`) | `reading` answer |
|---|---|---|
| INFO-2026-0111, 15.9 MB (capture `6e0b3dc5f2f3...`) | one row: kind `reading`, state `owed`, **attempts 0**, registered 05:57:09.369, **last_try 05:57:09.391**, next_try (due_at) 05:57:10.474, **why `NO_HOME`** | `found:false` |
| 0115, 41.5 MB (capture `161911ac86c6...`) | **no row** (`owed: []`) | `found:false`; heldcaptures says `whole:true` |
| 0116, 40 MB upload (`0c6517250571...`) | `keep` owed, attempts 0, last_try null, registered 06:21:41; `reading` owed, attempts 0, last_try null, registered 06:21:42 | found, `failure:"final"`, basis "the capture is 39787329 bytes in 5 parts, over the 25165824 B a format entry is handed here, so it was not read", 0 units |
| 0117, 60-page scan (`1fc8a22d4847...`) | `reading` owed, attempts 0, last_try null, registered 06:22:32, due 06:22:34; **no `ocr` row** | found, 60 units (admin); the member's answer omits `text_units` |
| B 0107 (upload `612d60774c5c...`) | `owed: []` | found, final, "29116371 bytes in 4 parts, over 25165824 B", 0 units |
| B 0114 (`c8b2dbd683bf...`) | `owed: []` | found, 31 units |
| B 0121 (upload `a0285d92bf5d...`) | `reading` owed, attempts 0, last_try null, registered 06:39:36 | found, final, "26535906 bytes in 4 parts, over 25165824 B", 0 units |
| B 0123 (`1bdd50f051ae...`) | `owed: []` | found, 4 units |
| B 0125 (upload `d10edee0133a...`) | `reading` owed, attempts 0, last_try null, registered 06:52:00 | found, final, **"the document was not read as text (multipart), so no reading was attempted"**, 0 units |
| B 0127, 10 MB (`0cd1baa483d5...`) | `reading` owed, attempts 0, last_try null, registered 07:03:22 | found, final, **"not read as text (multipart)"**, 0 units |

Ledger rules (`plane/pending.mjs`): `attempts`, `last_try`, `why` are written **only after an owner returns**; re-registering an entry (`put`) resets `attempts` to 0 and `due_at` to now and keeps `last_try`/`last_why`.

**What the 0111 row says.** The only try ever recorded is `NO_HOME` at 05:57:09.391, 22 ms after registration (the door's immediate try, before the document was promoted). Re-armed 1.1 s later (attempts back to 0). In the 3 h 36 min since then nothing more is written: no attempt, no `why`, no `final`. A returned failure would have written attempts of 1 or more and a new `why`, so **a returned failure is excluded** for every run after 05:57:10. What remains is a run that started and never returned, or no run at all. The ledger cannot tell **OOM, CPU limit or wall time** apart, and cannot tell them from "the alarm did not run this row".
**Every other row is also untouched:** The 14 other owed rows (10 readings, 2 keeps, 2 `subresources` at that time; those I can name by digest are 0116 keep and reading, 0117, 0121, 0125, 0127) show `last_try: null`, and none of the ones I can read has any try, for up to 2 h 30 min while due. The rows are ordered by `due_at` and 0111's is the oldest, so every tick starts with it and a run that kills the isolate leaves all of them waiting. That is the shape E2 (d) describes.
**Unexplained:** 0115 has no row and `whole:true` (something finished its keep after the walker saw `NO_WHOLE_OBJECT`) yet no reading exists and no row owes one.

**Per document:** 0111, no returned failure, OOM/CPU/wall cannot be told. 0115, nothing owed and nothing read (E3: no statement without a whole). 0116, 0107, 0121: returned `final` size statements (E3, by design over 24 MiB). 0117: first pass inline; the owed `reading` row never ran, so no `ocr` row was ever made; `OCR_NO_PROGRESS` is not supported (no `why`). 0125, 0127: returned `final` "(multipart)" statements with no text: **E1 confirmed live** (their rows are untried). 0114, 0123: read.

**Conclusion (item 1).** The ledger supports one cause with confidence: the owed work is not being run. The oldest row (0111, due since 05:57) has no attempt recorded after its first 22-ms try, and the rows behind it show no try. That fits a head-of-queue run that starts and never returns, which is E2 (d) and also explains E6 (the scan's `ocr` row never created) and E8 (item 3). It does **not** say whether the killer was memory, CPU or wall time. What would name it: per-row logging of start, end and a memory marker (already in the plan's deploy), or one read of the object's alarm log in the platform's dashboard for 05:57 onward; or the decisive local test, a 15.9 MB many-object PDF through `readHeld` in workerd with the real limits.

## 2. E4: casedocument for CASE-2026-8024 edition 1

Requests: `op=casedocument&case=CASE-2026-8024&edition=1` (08:35:58Z, 200, 0.97 s); `op=publishedcase&id=CASE-2026-8024&caseId=CASE-2026-8024&edition=1` (08:35:59Z, 200); the same with CASE-2026-6644 (the complete case, 08:36:26Z) for comparison.

**Shape of `citations`: an object, not an array:**
`"citations": {"state":"signed","rows":[{"target":"INQ-2026-0022-what-records-does-the-eeoc-say-it-will-n","version":"no_bytes","capture":null}]}`. Signed and published 06:28:43Z (`ratified:true`, doc_sha `1728e5aa0dfd...`). So the screen's `Array.isArray(rec.citations)` (ceremony.mjs:108-120) is false on the live answer.

**The roster is in the signed text, not in `citations`.** The `text` (format `bio-case-document/8`) holds, at lines 21-30:
```
case_citations:
  - target: INQ-2026-0022-...   version: no_bytes   capture: null
case_findings: [INQ-2026-0022-what-records-does-the-eeoc-say-it-will-n]
case_roles:
  - target: INQ-2026-0022-...   role: load_bearing   version_sha: 5eb46418ba3c...(64 hex)   edition: 1   subject_entity: null
```
So the pinned roster is `case_findings` (targets) and `case_roles` (target, role, **`version_sha`** where the plan says `bundle_sha`, edition). The finding rows in `citations.rows` carry the target and no sha (`version: no_bytes`), as the plan expected. CASE-2026-6644 has the same two blocks and one finding with a `bundle_sha`/`version_sha` in `publishedcase`.

**`publishedcase` for 8024:** `complete:false`, `awaiting:["INQ-2026-0022-what-records-does-the-eeoc-say-it-will-n"]`, `findings:[]`, `editions:[1]`. For 6644: `complete:true`, `awaiting:[]`, `findings` 1.

**Conclusion (item 4 of E4, the field to confirm).** Confirmed: `citations` is `{state, rows}`, so a reload rebuilds no findings; and the signed edition **does pin** the finding (`case_findings`, `case_roles`), but the finding itself was never sat/ratified with the edition, so the published case stands incomplete. The provider must answer the roster from the signed bytes as the plan says; use the document's real names: `case_roles[].{target, role, version_sha, edition}` and `case_findings`. The plan's `bundle_sha` is the document's `version_sha` (check against the `publish` answer's `findings[].bundle_sha` when writing the shape test).

## 3. E8: capture with the visitor view, "Finish it"

**Deviation, stated.** The Arches page is already held and unchanged: pressing the capture with the visitor view on at 08:37:58Z sent only `GET op=heldat&address&check` (200, 0.6 s, `held:true`, INFO-2026-0118, `changed.state:"unchanged"`), and the screen drew "Already in the record as Arches National Park ... the site still gives the same document · nothing was added" with no "Capture the new copy" button (that button is drawn only for a *changed* page, capture.mjs:279-284). No acquire was sent; nothing was fetched. The one capture was therefore made of `https://www.nps.gov/acad/index.htm` (held:false), which is the same site and kind as the plan's. Screen controls used: `#ci-address`, radio `#ci-render-1` ("The page as a visitor saw it", checked: true), the primary `[data-act=acquire]` "Capture from an address".

**Request log** (Chromium `page.on('request')`, `/api` only, body key names):

| time (UTC) | method, op, query keys | body keys | status, time |
|---|---|---|---|
| 08:41:44.6 | GET heldat (address, check) | none | 200, 0.5 s, `held:false` |
| 08:41:45.2 | POST acquire | `locator, render` | 200, 13.0 s, `existed:false` |
| 08:41:58.2 | GET allocid (prefix, year) | none | 200, `INFO-2026-0131` |
| 08:41:58.7 | POST promote | `bundleId, base, snapKey, meta, files, register` | 200, 0.9 s, bundle INFO-2026-0131-acadia-national-park-u-s-national-park-s |
| 08:41:59.7 | GET opencaptures | none | 200: one capture, session `rs_af6c46c7d9ab1c80_mvjalfx2`, primary_sha `af6c46c7d9ab...`, started 08:41:56Z, **outstanding 1** |
| 08:42:02.7 | **"Finish it" pressed** -> POST acquire | **`continue`** (only) | **answer not captured** (no response event within my 8 s wait; the script then closed) |

So **"Finish it" does send a request** (`POST op=acquire`, body `{continue: <session>}`), which the walker did not see. After the press the page showed the first capture's result text again ("Captured: Acadia ... It waits in Held captures ...", "this is the page as it was served; the page as a visitor saw it is still being made"). I did not press a second time (one capture only), so the continue answer is unread.

**After the press:**
- `opencaptures` was empty at 08:43:26Z (85 s after), 08:47:23Z and 08:49:16Z.
- `owedwork` counts: `subresources` owed **2 before the capture, 3 at 08:43:27Z, 08:47:24Z and 08:49:17Z** (final 0): the capture's entry exists and has not been worked in 7 min. `owedwork&sha=rs_af6c46c7d9ab1c80_mvjalfx2` answers `{ok:false, reason:"BAD_SHA"}` (the op accepts only a 64-hex digest, `pending.mjs` DIGEST test, though a `subresources` row is keyed by the session); `owedwork&sha=<primary_sha>` answers `owed: []`. So the plan's "owedwork for that session's key" cannot be done; only the count is readable.
- `heldcaptures` (fields=picker, default and `state=held_and_vouched`) at 08:47:24Z and 08:49:17Z, 5 and 7 min after the press: **one** Acadia document (INFO-2026-0131, via `direct`); **no second document "as a visitor saw it"**.

**Conclusion (item 3).** Not as the plan guessed: the press is not silent, it sends `acquire {continue}`. The visitor copy is missing and the capture's `subresources` entry is still owed 7 minutes on, while 0111 and the others sit untried too; the most likely cause is the same wedged ledger as E2 (the alarm never reaches the entry that would `deliverOwedRender`). It is **not proven**: the continue's answer is unread, and the line vanishing in under 85 s (A saw 3-4 min) says the `continue` finished or dropped the session. What would name it: the `acquire {continue}` answer (rerun the press once with the response logged; one more capture of an unheld nps.gov page) and the `subresources` row's attempts via a session-keyed owedwork (the op must accept the session key), or the per-row logging of the deploy.

## 4. E9: ACTN-2026-0008

Requests (08:40Z to 08:44Z): `op=action&id=ACTN-2026-0008` (admin); `op=filingsfor&action=ACTN-2026-0008` (admin and member, same); `op=projectparticipants&projectId=PROJ-2026-4538-walk-t51-rewalk4-b` (admin 08:44:11Z, member 08:44:25Z, same); `op=whoami` (member: `member:"walker"`, `capabilities:["contribute"]`, `administer:false`).

- The action's project: **PROJ-2026-4538-walk-t51-rewalk4-b**; kind `records_request`; `current_state: "planned"`; `basis: []` (empty).
- The draft: FIL-2026-0003, prepared and approved by `member:walker` (07:16:15Z, approval 07:16:42Z), sending recorded by walker 07:17:24Z (`reference RW4B-0001`). The draft's own basis project is not exposed by any read; with `basis: []` the code (`filings/index.mjs:2837-2880`) never reaches it, because `act.project` is set and is the project above.
- Participants of that project: `sparky` founder, **joined**, owner; **`walker`: state `invited`, owner 0, `joined_at: null`**, created 07:11:16Z. So walker was invited and has not joined, and prepared, approved and recorded the sending 5-6 minutes after being invited.

**Conclusion (item 4).** The plan's first cause: **invited and not joined**. The action's project and the basis agree (one project), and the member is invited there and not joined. The refusal `TEMPLATE_SCOPE_REFUSED` (`isJoinedParticipant`) is the rule working; the defect is the door drawn to a member the rule refuses (`cs.can("templatesave")` is a class test). The policy point in the plan's section 6 (2) is triggered: should an invited member who made and sent the request keep it as the team's template. The same invited member could prepare, approve and send the filing.

## 5. Timeline: "Could not read this, because your team's Civicsmith did not answer"

The Timeline screen (`screens-investigate/timeline.mjs:25`) reads `vocab: { op: "affordances", query: {} }` and takes the kinds from `vocabularies.event_kinds` (:98); an unread vocabulary draws `state.failed` with `shell.noanswer` (:101).

Request: `GET /api/?op=affordances` as member, 08:44:47Z: **200 in 0.68 s, 149,436 bytes**, keys `target, catalog, vocabularies, capture_acts, set_acts, detail, screens, wizard_scripts, answer_checks, writing_help_refused, act_help`. As administrator 08:45:00Z: the same (200, 0.69 s, 149,435 bytes). No error.

`vocabularies` holds action_kind ... connection_kinds (the product's list and the `lines` ones) but **none of the events' five**: `event_kinds`, `dated_fact_kinds`, `event_statuses`, `participant_roles`, `event_relation_kinds`. In the code those five are added only if `composed.has("events")` (`affordances/words.mjs:117-122`), where the events owner is registered "once per process" by `events.start()` (`events/index.mjs:229-233`) in the isolate that composes the answer.

**Conclusion (item 5).** The read **does answer** (200); the screen's "did not answer" is its reaction to a vocabulary that is absent, so the words are wrong as well as the data. The likely cause, from the code and not proven: the `affordances` answer is composed in the Worker (the door), where the `events` module has not been started, so its owner is not in that isolate's registry; the Durable Object, where `events` starts, is not the one composing. What would name it: a test composing the answer with the events module not started (no events keys, as seen), then with it started; or a log of `owners()` at the door.
