# public-read (T23)

**Status** · session_013j3rKMqpomA79mCkzoNc9j · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

Job complete (759c10fffc; tranche/T23 @ 34e366ce39 merged in at 97d8fdb5fc). B2 handled with the rest.

**Entries applied.**
- **R18 met (DEC-111; network-notices R10, R20, R21).** Its `*(not yet met: T23)*` mark can be struck (the file is yours).
  - Store side (`public-read/index.mjs`): `registerPublicReads(module, reads)`. `reads` maps each name to `fn(args)` or `{params, read}`. The registration is checked whole and is all or nothing. A malformed one is refused `PROVIDER_MALFORMED` with `problems`: a name that is not an op's spelling (`^[a-z][a-z0-9]{0,63}$`), one of this module's own ops, a read that is no function, or a parameter that is malformed or carries a credential or a stamp. A name already held by any module is refused `PROVIDER_DECLARED` with `taken: [{name, module}]`, and the first registration stands.
  - Also on the store side: `publicReads()` lists every read; `publicRead(name, query)` serves one. A read is handed a frozen object of only the parameters it declared, as strings. It answers `{ok:true, read, module, result}`. A read's own `ok:false` is relayed with `read` and `module` added. An unregistered name answers `PUBLIC_READ_NOT_REGISTERED` with a sentence saying it is not registered. A read that throws is not caught, so the store's internal error (with its correlation id) answers it, never an absence. A read that answers a promise is answered as one.
  - New store op `publicread` (`?name=<n>&<params>`) in `publicReadOps`.
  - Shared terms are in the new file `public-read/reads.mjs`: the name grammar, the reserved parameters (credentials, `op`, `store`, `name`, `control-plane`'s query stamps, `principal`, `proposedBy`) and this module's own op names.
- **How a caller reaches one (for control-plane R45 and op-declarations R10).** The door (`public-read/door.mjs`) serves:
  - `op=publicread&name=<name>`: `PUBLIC_READ_DOOR_OPS` now has 5 ops, adding `publicread`;
  - `op=<name>` itself, when the plane hands `publicReadDoorOp` the declared names as `helpers.publicReads` (an array or Set). Your own ops can never be shadowed by a read's name.
  - Control-plane can also call `publicReadDoorRead(name, url, env, stub, helpers)` directly.
  - Either route serves the read under R10's terms. It reads the stub it is handed, which the plane pins to `bio`. No header is forwarded, and no reserved parameter. Status codes: 200 for an answer, 404 for not registered, 400 for a malformed name (required-argument) or for the read's own refusal. Relays follow R9 (`storeRefusal`, then `storeSilent("publicread", correlation)`).
  - So op-declarations declares either `publicread` or each of network-notices' three names with `classes: null`; control-plane L11 passes `publicReads` if it routes by name.
  - For network-notices: register in `networkNoticesOf` at start, e.g. `publicReadOf(host).registerPublicReads("network-notices", { noticespublic: { params: ["after","limit"], read }, groupkeyspublic: read, activitymethod: read })`.
- **R19 met (B2; DEC-111, case-grammar R10, K1144).** Its mark can be struck. `publishedCase` carries `project_reference`, next to `project`. It is read from the signed document with `case-grammar`'s `workingOnOf`, so it is null when the document names no notice, names a malformed one, or is not `/5`. The key is always present. A loose record answers null. The signed document is now parsed once per read and shared with `#editionStatements`.

**Tests.**
- New `public-reads.test.mjs`, 6 tests named R18, each with negative controls:
  - served with no credential at the store op and through the door, by name and by its own op; only declared parameters are handed, frozen; nothing is written;
  - no credential or stamp can be declared, and the door forwards none and no header;
  - a second registration of one name is refused, the first stands, the registration is all or nothing, and a fresh name alone still registers;
  - a malformed registration is refused whole;
  - an unregistered name says it is not registered (404), and a malformed name is refused 400;
  - a read's own refusal answers 400, a throw answers 502 with its correlation id and no stack, and an empty answer is a silence.
- `door.test.mjs`: the R9 relay arm now covers `publicread`, and the ops list has 5.
- New `project-reference.test.mjs`, 3 tests named R19: a `/5` document with the field (by case, by finding, by hash, and through the Worker route; not live); without it, or with a malformed value; a `/4` document carrying the line; a loose record.
- Mutation check: 5 seeded faults turned a test red (credentials forwarded, a second registration accepted, not-registered at 400, an undeclared parameter filled, the raw `working_on` read without the `/5` gate). One seeded change was a no-op and could not be caught.

**Runs.**
- `test/m/public-read/`: 86 pass, 0 fail.
- Whole `bio-plane/test/m`, which includes the user suites you named (`filings`, `plane`, `ratification`, `control-plane`, `publication`): 5069 tests, 5054 pass, 3 fail, 12 todo. All 3 reds are accepted by name: control-plane `inbox-door.test.mjs`:81 (red 9), and queue `catalogue.test.mjs`:34 and :116 (R1, R5). No red is new. test-support R2 passes in this environment.
- Checks: format, 87 modules, 0 failures; architecture, 29 files, 81 imports, 0 failures; coverage, 19 of 19 live ids, 0 failures; ownership, 7 files, 0 failures.

**Deferred / for BOB.**
- `PUBLIC_READ_NOT_REGISTERED`, `PROVIDER_DECLARED` and `PROVIDER_MALFORMED` have no catalogue row. R17 fixes this module's rows, and the last two already had none at R8. The first reaches a stranger at the public door with a plain sentence but no `translation`. If you want a C-98.10 row, that is a change to R17 (and to `CATALOG_VERSION`), and it is yours to make.
- R10's text names R1–R5. R18 says its reads are served under R10's terms, which they are; you may want R10 to name R18 too.

**Another module / generated artifact.** These changes stale the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, red 12). I regenerated nothing. Nothing found in another module.

Size (session_013j3rKMqpomA79mCkzoNc9j): test runs 9, module lines 2427
