# record-grammar (T42)

**Status** · session_01TfvYox4Sw4X6dSjqk6M1oK · depth 2 · RUNNING until 2026-10-10T23:56:30Z (users' suites, still running) · handled B3

## J1 · QUESTION

R29's amendment (C-33.40's `where` names every site that raises `NO_BASIS`). B1 names inquiry's `actNoBasis` and progressions' index.mjs:458, :471 (through checks.mjs:168 `refusal`). A sweep of `bio-plane/src` finds two more kinds of raiser:
(a) entities raises `NO_BASIS` with this very row (C-33.40, its translation) through `actShapeRefusal` (entities/index.mjs:209), at :755, :760 (an identifier's basis, R43) and :1194 (grade-D testimony, R12); R29 already names entities as a reader, and C-33.41's `where` already names this helper.
(b) lines (index.mjs:420–470, seven sites, local `refuse`) and money (index.mjs:1162, local `refusal`) answer a bare `code: "NO_BASIS"` with no `check` and no `translation`: they do not raise C-33.40, they reuse its code.
My best reading, which I am building: the `where` names every site that answers with the C-33.40 row, i.e. inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal` (first declaration and revision of a declared flow), and entities' `actShapeRefusal` (a held identifier's basis, grade-D testimony); lines and money are not named, and (b) goes to you as a REPORT against those modules (a code shared with a row that carries no row's translation, DEC-49's shape). If you mean the `where` to name only inquiry and progressions, or to name lines and money too, say so and I will change it.

## J2 · QUESTION

R55 (B2): `ID_TABLE` gains `ACD` (owner `case-account`, form `opaque`). The ids minted since T41 are not opaque in form: case-authoring (index.mjs:1746) mints them with record-core's `mintOpaqueId`, which draws four random digits (`ACD-2026-0417`), the shape the table already lists as `sequential` for `CASE`, `WCD`, `DRAFT`, `RVG`, `TASK` (record-grammar ids.mjs, "drawn at random by record-core's opaque minter"). As `opaque` alone, `idPattern('ACD')` would refuse every account draft id a copy holds today, against R46/R47 (every id valid before stays valid).
My best reading, which I am building: `ACD` is `{prefix: 'ACD', owner: 'case-account', form: 'opaque', legacy: 'sequential'}`, K1728's `CALC` pattern: `case-account` mints it opaque through `allocId` (record-core R76 reads `form` alone) once it holds the code in L8, and the four-digit ids minted since T41 stay readable. Today nothing changes at runtime: case-authoring mints through `mintOpaqueId`, not `allocId`, and adding `ACD` to record-core's opaque set changes no answer of `mintExhausted` (its `MINTED_OBJECT` has no `ACD`; a report for record-core/case-account, not a defect). If you mean `opaque` with no legacy form (the T41 ids no longer valid), or `sequential` like `CASE`, say so and I will change it.
