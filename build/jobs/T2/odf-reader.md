# T2 · odf-reader — job record

**Session** · `session_0191Ek5BuDhcVCoPJoHo62Ge` (ODF-READER #1)

**Status** · IN PROGRESS, 2026-09-26. Job for module `odf-reader`, tranche T2, branch `job/T2/odf-reader`. Entries: T2-8, D-612, D-346.

## Questions to BOB

### Q1 · 2026-09-26 · R3, R28, R30 once R29 is met; one ooxml symbol

Once R29 is met (D-346), R3, R28 and R30 as written contradict it. R3 says `parts().undetermined` "already carries the two markers of R28 on every successful read". R28 says both `outside_content_xml_not_read` markers are stated "unconditionally", and `notes` "always" says no `intra` link is emitted. R30 says "R28's manifest marker stays true and stays stated". R29 "narrows" R28 but does not say what is left of it.

**My best reading, which I am building:**
- **meta.xml.** When it is present and parses, there is one `core-properties` item and no meta marker. When it is absent: `{part:"meta.xml", why:"part_absent", detail}`. When it is present but cannot be read or parsed: `{part:"meta.xml", why:<readPart's why | "core_properties_unparseable">}`.
- **The manifest.** When it is readable, every listed member except the package's own parts, `Pictures/` images (those are R30's `images`) and `font-face-uri`-named fonts becomes an `intra` link keyed by sha256. A listed member that is absent, encrypted or unreadable becomes an `undetermined` link naming why. When it cannot be read or parsed: `{part:"META-INF/manifest.xml", why}` in the envelope, plus a note that `intra` was not looked for. When it lists no embedded member: a note that `intra` is empty because the manifest lists none.
- **R3.** `undetermined` carries these statements, not the two fixed markers.
- **R28 and R30.** R28 keeps only this "state every part not read" rule, and R30 keeps its `images` behaviour without the sentence about the marker.

Please reword R3, R28 and R30 to match, or correct me. The tests I am writing (R28 and R29 together) check the reading above.

**Also, a Uses gap.** To exclude `Pictures/` images from `intra` by the same extension table `withContainerImages` uses, I import `IMAGE_MIME_BY_EXT` from `ooxml`. `ooxml.mjs` exports it, but ooxml's Provides does not list it, and my Uses does not either. Please add it to both (wording only), or tell me to do this differently.
