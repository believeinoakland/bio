# record-grammar — requirements

**Status** · WORDED by BOB #74, 2026-09-30 (K585, K589), from a worker's draft; placed at T18's opening by a worker for BOB #75, 2026-09-30, when `modules.json` named the module (K624): R1 and R3 amended for the Action fold's `PLN` prefix (N-A1, K608), marked not yet met. Layer 1, first in the order, before `legacy-checks` (`from: legacy-checks`, PROCESS-MECHANICS §12.2: the catalogue, later in the order, re-exports each moved name from this module's paths). Code today: inside the legacy catalogue `bio-plane/checks/bio-checks.mjs` (map: `build/extraction/legacy-checks.md`, rows `shared:record-grammar`). This file covers T18's stage only (`build/plan/draft-T18.md` §2, "T18's stage"); T19's parts (`STATES`, `HEADINGS`, the machine-work labels, …) and `checkBundle` are added when they move. Line numbers below are the catalogue's at this draft.

## Public

### Purpose

The record's shared grammar, below every module that reads or writes a document: the id and type vocabulary, the restricted front-matter parser, canonical JSON, actor identity, the grade vocabulary, the public-locator test and the one SHA-256. It holds no store, no network and no clock.

### Provides

**Id grammar: `BUNDLE_ID_RE`, `ANN_ID_RE`, `FILENAME_RE`, `ISO_TS_RE`** (catalogue 28–31)
- **R1** `BUNDLE_ID_RE` matches exactly `<PREFIX>-<4 digits>-<4 digits>-<slug>`, PREFIX one of `INFO PROB FOCUS INQ PROJ ACTN BIAS STD CONF CONS ESC ASP GOAL PLN`, slug one or more `-`-joined runs of `[a-z0-9]`. `ANN_ID_RE` matches exactly such an id followed by `.ann-<8 digits>T<6 digits>Z-<slug>`. Both carry the same prefix set. *(not yet met: `PLN`, the Action fold's action plan, N-A1, K608)*
- **R2** `FILENAME_RE` matches a non-empty string of `[A-Za-z0-9._-]` only. `ISO_TS_RE` matches exactly `YYYY-MM-DDTHH:MM:SSZ` (no fraction, no offset).

**Type vocabulary: `OBJECT_TYPES`, `LEGACY_TYPE_ALIASES`, `normalizeType(t)`** (catalogue 48–51)
- **R3** `OBJECT_TYPES` maps each id prefix of R1 to its canonical type: `PROB`, `FOCUS` and `INQ` to `inquiry`; the others one each (`information`, `project`, `action`, `bias`, `standard`, `determination`, `consequence`, `escalation`, `aspiration`, `goal`), and `PLN` to `action_plan` (`action-plans`' record). Its keys are exactly R1's prefix set. *(not yet met: `PLN` → `action_plan`, N-A1, K608)*
- **R4** `LEGACY_TYPE_ALIASES` is `{problem: 'inquiry', focus: 'inquiry'}`, flat (no alias points at another alias).
- **R5** `normalizeType(t)` returns the alias's target for an own key of `LEGACY_TYPE_ALIASES` and `t` unchanged for anything else, including `undefined` and a name of an `Object.prototype` member. Never throws. *(not yet met: `normalizeType('constructor')` answers `Object`, an inherited key.)*

**`parseFrontmatter(text) → {data, findings, body}`** (catalogue 842–974, with `f`, `stripComment`, `parseScalar`)
- **R6** A `text` whose first line is not `---`, or whose opening fence is never closed by a later `---` line, answers `data: null`, one finding `C-2.1` (`severity: 'error'`), and `body` the whole text. Lines split on `\n` or `\r\n`.
- **R7** Otherwise `body` is the text after the closing fence, and `data` holds the grammar: top-level keys at column 0; a key with no value opens a block whose first child decides it: a map (keys at 2 spaces) or an array (`- ` items at 2 spaces, scalars or objects begun `- key: value` with further keys at 4 spaces). A block with no child is `[]`.
- **R8** Scalars: blank is `''`; `null` and `~` are `null`; `true`/`false` booleans; a value wrapped in matching `"` or `'` is its inside, unescaped; `[a, b]` an array of scalars split on commas (`[]` empty); `-?\d+` an integer; `-?\d+\.\d+` a float; anything else the trimmed string. A ` #` comment outside quotes is dropped, and a whole-line comment or blank line is skipped.
- **R9** Every line outside the grammar is a `C-2.1` error finding naming its line number, and parsing continues: a duplicate top-level key (the later value wins), an array item outside a block or not at indent 2, an item inside a map block, an unfit indented key, an unparseable line.
- **R10** An indented key that fits no slot and is a core field or a forbidden alias (`CORE_FIELDS` and `FORBIDDEN_ALIASES`, provided here and moved with the parser in T18, catalogue 84–95) is instead a `C-2.4` error finding, `repairable: true`, `repairs: ["re-indent '<key>' to column 0"]`, and the key is recovered into `data` at top level.
- **R11** Each finding is `{check, severity, message}`, with `repairable` and `repairs` only when a repair is named. Throws only when `text` is not a string.

**`canonicalJson(v) → string`** (catalogue 1298–1305)
- **R12** Returns compact JSON with every object's keys sorted (default string order), recursively, array order kept; scalars as `JSON.stringify` gives them. Equal values give byte-identical strings. An object member whose value is `undefined` is omitted, as `JSON.stringify` omits it, so the answer is always JSON. *(not yet met: `{a: undefined}` answers `{"a":undefined}`.)*

**Actor identity** (catalogue 1439–1518)
- **R13** `NON_MEMBER_AUTHORS` (1442) is the closed list of surface and AI identities; `ACTOR_CLASSES` is `['daemon', 'session', 'member']`; `MACHINE_AUTHOR_PREFIX` is `'token:'`, `MACHINE_CLASS_PREFIX` is `'class:'`, and `MACHINE_STAMP_PREFIXES` is those two, in that order.
- **R14** `isMachineStamp(who)` is `true` exactly when `who`, stringified, trimmed and lower-cased, is non-empty and begins with a stamp prefix.
- **R15** `isMachineIdentity(who)` is `true` exactly when the same folded value is non-empty and is a stamp (R14), an actor class or a non-member author. An absent or blank identity is `false` (absent is not machine). Neither throws.

**Grade vocabulary** (catalogue 2499–2584)
- **R16** `BASIS_ROLES` is `['supports', 'cuts_against']`; `BASIS_GRADES` is `['A', 'B', 'C', 'D']`, strongest first (a lower index is stronger); `GRADE_AXES` is `['capture', 'connection', 'testimony']` in that order; `TESTIMONY_GRADE` is `'D'`.
- **R17** `GRADE_SOURCES` is `['resolution', 'testimony', 'hunch', 'inherited', 'capture']`; `EARNED_GRADE_SOURCES` is `['resolution', 'capture']`, a subset of it.
- **R18** `EARNED_CAPTURE_CEILING` is `'B'`. `UNREACHABLE_CAPTURE_GRADE` is the letter one rank stronger than the ceiling in `BASIS_GRADES` (`'A'` today), or `null` when the ceiling is the strongest; it is derived, never typed.

**`isPublicHttpsLocator(url) → boolean`** (catalogue 3990–4001)
- **R19** `true` only for a string whose scheme is `https` (any case) and whose authority has no `@` and whose host (port dropped, lower-cased, one trailing dot dropped) is not `localhost`, does not end in `.local` or `.localhost`, not a bracketed IPv6 literal, not a dotted-quad IPv4 address, and contains a dot. Everything else, a non-string included, is `false`. Never throws. It judges the text only; what a name resolves to is the fetcher's to check (Intake Doctrine §4). *(not yet met: an upper-case scheme, `localhost.` and `.local` hosts.)*

**Digests: `createSha256()`, `sha256HexSync(str)`, `b64ToBytes(s)`** (catalogue 4018–4129, 10548–10634)
- **R20** `createSha256()` returns a stream `{update(chunk), hex()}`: `update` takes a `Uint8Array` or a byte array-like (values taken mod 256) and returns the stream, and throws a `TypeError` for a string or any other input; *(not yet met: a string is hashed as zero bytes)* `hex()` returns the lowercase 64-character FIPS 180-4 SHA-256 of every byte fed, in order, however it was chunked. `update` or `hex` after `hex` throws `sha256 stream already finalized`.
- **R21** `sha256HexSync(str)` returns synchronously the lowercase hex SHA-256 of the UTF-8 encoding of `String(str)`, equal to `createSha256().update(utf8(str)).hex()` for every input.
- **R22** Both agree with `crypto.subtle.digest('SHA-256')` over known vectors, including the empty input, `abc`, and lengths 55, 56, 63, 64 and 65 bytes (the padding boundaries).
- **R23** `b64ToBytes(s)` decodes standard base64 (`A–Z a–z 0–9 + /`), ignoring whitespace and `=`, to a `Uint8Array`, with no platform decoder; a character outside the alphabet throws `invalid base64 at position <i>`.

**T19 layer 1's additions** (rule 6 of `build/plan/current.md`; worded at T19's fold, K653 BOB-6, K720). The rest of T19's stage (`STATES`, `HEADINGS`, the machine-work labels, `checkBundle` and its structural arms) is worded by the same fold.
- **R28** `EXTENSION_ARMS` moves here with `checkBundle` (rule 2, K653 BOB-6): a frozen list of frozen `{name, ids}` entries, one per type arm `checkBundle` runs that a registered grammar (`opts.grammars`, record-core R67) may take the place of, claimed whole by its `ids`: `checkInfo2Contract` (`C-18.6`, `C-18.7`), `checkInquiryExtension` (`C-2.8`), `checkProjectExtension` (`C-2.9`, `C-9.1`). No id is in two entries. C-2.7's entry (`checkInformationExtension`) is not here: C-2.7 is capture's (registered in T18) and leaves the catalogue's list in this layer. The catalogue keeps a re-export (§12.2), and record-core reads this module's list (layer 2). *(not yet met: T19 layer 1)*
- **R29** The shared act rows `NO_BASIS` (C-33.40) and `NO_CITATION` (C-33.41), each `{check, where, translation}` with its number and translation unchanged, move here from the catalogue's `ACT_SHAPE_CHECKS` (entities, progressions and inquiry read them). C-33.41's `where` names the entities and progressions sites that raise `NO_CITATION` (entities' declared relation; progressions' revision of a declared flow and exception document), not `src/store.mjs actNoCitation`, deleted by LEGACY-STORE #8 (N430, K720); the row change is `awaiting stamp` (promotion, layer 2). *(not yet met: T19 layer 1)*

## Private

### Uses

None. It is first in the order.

### Invariants

- **R24** Pure: no I/O, no store, no network, no clock, no randomness; the same input always gives the same answer, in Node, a Worker and the browser alike.
- **R25** One SHA-256 implementation: `createSha256` and `sha256HexSync` are two names over one compression function and one round-constant table (map §4.4, K6).
- **R26** Parity until the re-export goes: every name above that `legacy-checks` re-exports is the same binding (`===`), so a reader of either path gets identical answers.
- **R27** No place is named (`layers.md`, "No jurisdiction in the product").

### Satisfies

- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §1.2 (canonical id grammar), §1.3 (file naming), §3.1 and §3.3 (core fields, drift defense, the restricted front-matter grammar), §8 (the Mechanical Verification Law: a stored digest is of the stored bytes).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3 (capture grades, Grade B the direct-capture ceiling), §4 (https-only, public hosts only), §9 (the actor classes).
- `docs/architecture/BIO_Case_Making_v0_1.md` §Resolutions, R2 (capture and connection grade are two scales); `BIO_Content_Framework_v0_10.md` §8.1 (connection grade); `BIO_Declared_Bias_v0_1.md` §Bias debt, and HUNCH DEBT (the `hunch` source).
- `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §P and `BIO_Membership_Architecture_v2.md` §4 (a machine is stamped `token:<class>`, never a person's name).

### Suggestions

- Paths: `bio-plane/src/record-grammar/` (e.g. `ids.mjs`, `types.mjs`, `frontmatter.mjs`, `json.mjs`, `actors.mjs`, `grades.mjs`, `locator.mjs`, `sha256.mjs`, and an `index.mjs` exporting all); tests in `bio-plane/test/m/record-grammar/`.
- The catalogue keeps `export { … } from '../src/record-grammar/index.mjs'` for each moved name (PROCESS-MECHANICS §12.2), and imports what its own code still reads; importers re-point at leisure. `b64ToBytes` loses its export if only the catalogue reads it (map, "Exports used only inside the file").
- Before changing `canonicalJson`'s answer for `undefined` (R12), check no stored digest was taken over such an answer; report one if found.
- Keep `sha256HexSync`'s streaming twin: `sha256HexSync(s) = createSha256().update(new TextEncoder().encode(String(s))).hex()`, dropping `SHA256_K`. The parity test drives both against `crypto.subtle` over R22's vectors and random chunkings.
- Move each part's explanatory comment with it; the tests pin R1's prefix set against `OBJECT_TYPES`' keys (R3).
