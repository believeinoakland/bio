# Parked for T52 (K4269, K4270)

Design changes that do not meet T51's bar (an operation that does not work, or a required screen that cannot be reached). Each line: what, where, source. Taken up when T52 opens.


- `screen.money.proposed` says "proposed by the machine": "the assistant" (house word). Money trail. Seen at DEC-396 (B444 10).
- Draw `heldsetaside` (set a held capture aside) on `document` as well as on Held. B448, K4269. Seen at DEC-398.
- Counts read wrongly at 1 (each needs a `.one` row and the code choosing it): `screen.findin.searched` ("of 1 documents"), `screen.capture.supporting.toolarge` ("1 were"), `screen.capture.supporting.unavailable` (no subject), `screen.document.reading.notext` ("Pages 12"), `case-authoring.*.case_document_too_large` ("1 materials"). Seen at DEC-427.
- `money.ingest.partial` ends "Background reading: {ingest}", and {ingest} is the reading's internal key: drop the sentence, or fill it with the reading's plain name. Seen at DEC-427.
- One wording for one fact: `screen.document.reading.stated` and `.toolarge`; `reading-pipeline.index.classified_over_sample` and `docprofile.readtext...judged_from_a_view`; `notice-producers.index.fetch_done_detail` ("page you asked for") and `notice.fetch.done` ("file you captured"). Seen at DEC-427.
- `money.index.events_is_not_wired_here` says "Events" without saying which: "Contract awards and change orders aren't connected here yet." Seen at DEC-427.
- Fix round 7's 14 code keys (DEC-428) are word for word the code's English, which the jobs' tests assert. Reword at T52 with their tests: sentence case and contractions; "this surface" → "your team's Civicsmith"; "digest" → "fingerprint"; "evidence store" → "your team's record"; "{fmt} entry" → "{fmt} reader"; `reading_not_composed` ends "The reading failed; the document isn't empty." Draft wording in DEC-428. Seen at DEC-428.
