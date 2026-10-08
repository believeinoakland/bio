# case-carriage (T38)

**Status** · session_01FXB67DiZhzve12wNqAWQcY · depth 2 · WORKING · handled B3

## J1 · QUESTION

R8 (T38; K2291 (2)): "an archive that also holds any image is carried for no material". To know what an archive holds, case-carriage needs the archive's listing. None of its Uses gives one: provenance's register has no reverse link from an archive to its members, record-core has no read contract over provenance.json, and the archive's own bytes are only in the evidence store, which is async, while R1 is synchronous. The listing is `acquisition`'s `archive_entries` (R38's record, written whole when the archive is first opened; a member is only filed from an opened archive).

My best reading, which I am building now:
(a) A `uses` edge case-carriage → acquisition (layer 3 → layer 8, allowed by P4). `acquisition` states `archive_entries` as a read contract, read in case-carriage's own SQL as it reads `register`: columns `archive_sha`, `idx`, `name`, `kind`, `state`, `sha256`. That is BOB's: `modules.json` and acquisition's requirements.
(b) An archive **holds an image**, judged fail closed, when any of these holds:
  - its listing is not recorded (no row at idx −1);
  - an entry of kind `file` has no name, or a name with an image extension (R9's list);
  - an entry's filed or already-held capture is a photo (R9's term);
  - an entry is itself an archive that holds an image by this rule, recursively. An entry is itself an archive when it has its own listing, or its name ends `.zip` and it was never opened.
(c) The rule applies wherever an archive would leave: in R8's walk, and in R1 when an included document is itself such an archive (`unheld` `kind` `document`, why "the archive holds an image, and an image leaves only as its copy"). Otherwise a photo inside a zip that a case cites directly would leave whole.
If you prefer a narrower reading (for example, only the photos this edition carries, as T37 did), answer and I will narrow it. If `archive_entries` must not be read here, the only fail-closed alternative inside my Uses is that no archive is carried, which defeats R8's purpose.
