# case-account (T42)

**Status** · session_013SsuCWXrqvdc7FcZ7KSRjJ · depth 2 · COMPLETE · handled B2

## J1 · REPORT

K2616's open point: record-core's `mintExhausted` `MINTED_OBJECT` table does NOT need `ACD` from this job: it already holds `ACD: "case account draft"` (`bio-plane/src/record-core/index.mjs`:108–112, T42-2a), and `OPAQUE_PREFIXES` reads `ACD` from record-grammar's `ID_TABLE` (`ids.mjs`:75, opaque, `legacy: 'sequential'`), so `allocId("ACD", year)` mints `ACD-<year>-<16 chars>` and answers `mintExhausted("ACD")` itself when 64 draws collide. Nothing to route.
Wording only, for BOB: my requirements' Uses names `record-core`'s `mintOpaqueId`; the plan's entry and my START say `allocId` (R55's opaque form). I mint through `allocId` (best reading; `mintOpaqueId` would draw the old four-digit shape). Uses may want `allocId` in place of `mintOpaqueId`.
