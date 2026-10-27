# DEC-460: the photo data kept as data and the photo data left out of the safe picture

**Status** · READY for PLANNING and `file-safety`'s security review (FILES #1, F12, 2026-10-27). Owed by DEC-460 and DEC-467 (the design fills `{what}` in "Left out of the safe picture: {what}" from this list). The security call on each row is `file-safety`'s review (A4-R1 to A4-R6); the one policy question is at the end.

**The rule (Bob, DEC-460):** the safe picture is redrawn from the pixels and carries nothing from the file; only metadata that must be dropped for safety is dropped from the **display**; what can be carried safely is read from the original as data and shown beside the picture, never as part of the file. The original is kept whole in the record whatever is shown.

## 1. Read as data and shown beside the picture

| data | source in the file | shown as | note |
|---|---|---|---|
| when taken | EXIF DateTimeOriginal (+ offset, sub-seconds) | "Taken {date}" | the time as the camera wrote it; with its time zone if the file gives one, else stated "no time zone" |
| where taken | EXIF GPS latitude, longitude, (altitude, direction if present) | "near {place}" | position rounded for the place name; the exact figures kept in the record's data, not rendered in the sentence |
| orientation | EXIF Orientation | applied to the pixels (the redraw is upright); "turned upright" noted | the stored number is kept as data |
| size | pixel width and height | "{w} × {h} pixels" | from the decoder, not the file's claim |
| camera | EXIF Make and Model | "Camera: {make} {model}" | provenance; a model name, not a serial number |
| editing | Software tag; XMP "CreatorTool"/history marker that the file was saved by an editor | "Saved by {software}" | useful provenance (an edited photo); shown as text, never as markup |
| caption | IPTC caption/description, XMP description, EXIF ImageDescription, user comment | "Caption in the file: {text}" | untrusted text: shown as plain text, length-limited, never rendered as markup or followed as a link |

## 2. Left out of the safe picture (and stated: "Left out of the safe picture: …")

| data | why left out | still kept? |
|---|---|---|
| embedded thumbnail and preview images | a second image that can differ from the main one; a parser path | in the original only |
| maker notes (opaque camera data) | undocumented binary; a parser risk; can hold device identifiers | original only |
| camera and lens serial numbers; owner name, artist, copyright holder, host computer name | identify a person or device beyond what the picture needs | read into the record as data, not shown by default; BOB decides if shown |
| XMP packet, IPTC block and ICC profile as embedded blocks | scripts, links and large structures can ride in them; the profile is applied by converting the pixels to sRGB | original only |
| face regions, depth maps, gain maps, embedded audio, motion-photo video | extra payloads | original only |
| file path or document IDs and edit history lists | can reveal a person's folders or other files | original only |
| anything else not in section 1 | the safe picture carries nothing else | original only |

The safe picture is a fresh JPEG or PNG written by the redraw with no metadata block at all; section 1 is data in the record next to it.

## 3. Open (policy, so BOB to Bob if BOB agrees)
- **Place in a published case.** A member's photo may show where they live or where a witness stood. In the member's own record "near {place}" is shown (Bob's rule). Whether a **published edition** shows a photo's place by default, or only when the author chooses, is a publishing policy; I recommend the author chooses, with the default off. (Not decided here.)
- Whether the exact GPS figures are shown to the member or only the place name (recommend: the place name, with the figures one step away).
