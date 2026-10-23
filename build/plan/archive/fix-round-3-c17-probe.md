# Fix round 3: C17 probe (read-only, live copy biosmoke8, 2026-10-21)

Question (fix-round-3-T51.md section 8): the project-less photo `member-photo-rewalk.jpg` has no reading. (a) no reading was written, or (b) one exists and membership withholds it from the member?

## Answer: neither of the two as posed, and not about projects at all. It is (a), with a more exact cause: no reading row exists, because the upload that was promoted was an `existed:true` answer, which the door does not read.

## How I reached it
Direct (proxy variables unset, `curl --noproxy '*'`). Signed in with `POST /api?op=login` body `{handle,password,device:"own"}` using JOURNEY_ADMIN_* and JOURNEY_MEMBER_* by variable (never printed; the token goes in `Authorization: Bearer`). Both answered 200: admin `role:"admin"`, member `role:"member:walker"`, `administer:false`, capabilities `["contribute"]`.

The photo: bundle `INFO-2026-0080-member-photo-rewalk-jpg` (from `op=list&type=information`, same row for both roles), capture sha256 `f021bf80521cb89e9472263ae59d33fe087d3ea16a1699a343c1bd19c3f0d485` (46691 bytes; from the document page screenshot `walk-T51-rewalk/shots/A/member-projectless-doc-1280.png` and confirmed by `op=bundlehistory`).

## Requests and answers
| request | as | status | relevant answer |
|---|---|---|---|
| `GET /api?op=reading&sha256=f021bf80...d485` | administrator | 200 | `result: {ok:true, found:false, capture_sha:..., reading:null}` |
| same | member | 200 | identical: `found:false, reading:null` |
| `op=reading&sha=...` (wrong name, control) | both | 200 | `NO_SHA` (so the parameter is `sha256`) |
| `op=list&type=information&limit=500` | both | 200 | the bundle is listed for both, `current_state:"collected"` |
| `op=image&id=INFO-2026-0080-...` | both | 200 | `bundle.md` has NO `project:` line; `data/provenance.json` documents[0] keys: `file,locator,retrieved,profile,authority_state,...,attestation_attempts`: **no `reading`, no `text_units`**; profile `format: jpeg (certain)`, `digests.determined:false` |
| `op=bundlehistory&bundle=INFO-2026-0080-...` | admin | 200 | one revision, `kind:"promotion"`, 12:32:19Z, author `walker`, `capture_sha` as above |
| `op=capturegrade&capture=f021bf80...` | admin | 200 | `received.at: "2026-10-21T12:31:42Z"` (the FIRST receipt of these bytes) |
| `op=links&capture=f021bf80...` | admin | 200 | `links: []` |

`readingFor` (extraction/index.mjs:951-960) returns `found:false, reading:null` when the `readings` table has no row for the sha, BEFORE any viewer redaction (the redactor is applied only after the row is found, :965+). So `found:false` for the administrator means there is no row; this is not a membership withholding. (b) is ruled out: the administrator, who sees everything, sees no reading either.

## Controls (same live copy)
| bundle | project | provenance.json has `reading` | `op=reading` admin / member |
|---|---|---|---|
| INFO-2026-0063-member-photo-jpg (member, NO project, 05:59 UTC) | none | yes (+1 text unit) | found:true / found:true, 1 unit both |
| INFO-2026-0078-hardphoto-jpg (project) | PROJ-2026-1948 | yes | found:true both |
| INFO-2026-0081-stripes-rewalk-jpg (project) | PROJ-2026-1948 | yes (0 units, a picture with no words) | found:true both |
| INFO-2026-0080-member-photo-rewalk-jpg | none | NO | found:false both |

A project-less member photo IS read and seen by the member (0063). So "a copy is read only when filed in a project you are part of" is not the rule the code follows, and the page sentence (`screen.document.ocr.refused.unread`) states something untrue of the system; it is only true that THIS copy was never read.

## Why this copy has no reading (cause found, one step inferred)
Reading is stored only by promotion: extraction `projectPromotion` (extraction/index.mjs:631-646) writes a `readings` row for each document in `data/provenance.json` that carries a `reading` object. 0080's promoted `provenance.json` carries none, so no row was written.

The document the screen promoted came from an upload answered `existed:true` WITH a document:
- capture/index.mjs:758-763 (and the doc comment at :632-634, "T51 fix round 2; C10"): when a receipt already names the bytes but the register files them under no document ("an interrupted upload"), `uploadCapture` answers `{ok:true, existed:true, document}` so the screen can file it.
- control-plane/index.mjs:2349 (`readUploaded`, R100): `if (!r || r.ok !== true || r.existed === true || !r.document ...) return got;` returns an `existed` answer UNREAD ("Bytes already held (`existed`) ... are relayed unread", :2340-2342). That is correct when the earlier copy has a home and a reading; it is wrong for the fix-round-2 case, where the earlier upload was never filed, so no reading was ever kept.
- screens-intake/capture.mjs:425 / :573-577 (`doneUpload`): `existed:true` with no home (`homeOf` empty) and a document falls through and promotes that document, so it is filed with no reading.

Evidence it happened to this photo: the bytes' first receipt is 12:31:42Z (`op=capturegrade` `received.at`), but the bundle's `retrieved` is 12:32:18Z and its promotion 12:32:19Z, 36 s later. So the same bytes were uploaded twice; the first upload (a new upload, read at the door) was never promoted, and its reading was discarded because readings are stored only at promotion. The second upload answered `existed:true`, was not read, and was promoted. I cannot see the upload's raw answer from outside, so "the second answer was `existed:true`" is inferred from the two timestamps and the code, not observed; the missing `reading` in the promoted record and the absent row are observed.

(a)'s other candidate, a reading that failed and was relayed as the failed reading, would have returned early (control-plane/index.mjs:2351 `if (read.response) return { early: read.response }`) and the screen would not have promoted; it does not fit a promoted bundle.

## Conclusion
1. (a), not (b): no reading row exists for the photo (administrator and member both get `found:false`); membership `projectGate` (membership/index.mjs:121-131) is not involved, and project-less photos are read and shown to the member (control 0063).
2. Cause: the door does not read an `existed:true` upload (control-plane/index.mjs:2349) even when the answer carries a document to file (capture/index.mjs:758-763), because the earlier, unpromoted upload's reading was thrown away; the screen then promotes it unread (screens-intake/capture.mjs:425, :573). Fix belongs in `control-plane` readUploaded: also read when `existed:true` and a `document` is present (and no reading is held for the sha).
3. The screen half stands: do not draw the OCR act for an unread copy, and drop or correct the "filed in a project you are part of" sentence, which is not the rule.
