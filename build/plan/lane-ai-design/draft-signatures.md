# signatures — requirements (delta draft: the AI catalogue's signed statements)

**Status** · READY for PLANNING, AI-DESIGN #3 (revision), 2026-10-27. Owed to `draft-ai-catalogue.md` (Uses) and `draft-ai-issuer.md` (R12). Layer 1 (unchanged); `uses` unchanged. New ids **R49–R56**, numbered on from `signatures.md`'s highest id (R48, T48); R25, R30–R32, R42–R44 stay retired. The catalogue's own R49–R53 are `ai-catalogue`'s and do not collide: every reference to these lines names this module. Ids are this draft's and may be renumbered before Bob approves (README 6). Not in force and not yet met (all of it).

## What changes, in one paragraph
`signatures` gains what a copy's `ai-catalogue` and Civicsmith's `ai-issuer` need to sign and verify the catalogue channel: two namespaces and a third for a test container's run key, a key list of its own (`CATALOGUE_KEYS`) that is not `RELEASE_KEYS`, three statements (payload, advisory, seal key) and their verifiers on `verifyReleaseNotice`'s pattern (R48), and the run-key check the issuer's envelope test calls. Pure and offline as the rest of the module (R26); no place named (R27); no new dependency.

## Provides (additions)

**Namespaces** (SR84, AIR33)

`NS_AI_CATALOGUE`, `NS_AI_ADVISORY → strings`
- **R49** (T53; AIR33, AD25, SR84; amends R1) `NS_AI_CATALOGUE` is `"bio-ai-catalogue"` and `NS_AI_ADVISORY` `"bio-ai-advisory"`, compiled constants, each distinct from every other namespace (R1's rule, R46), so a signature over a release, a release notice, a fleet statement or anything else never verifies as a catalogue payload or an advisory, nor a catalogue's as any of them. R1's count becomes nine with R55. Test: all namespace constants are pairwise unequal and a signature made in `NS_RELEASE` over a catalogue statement's bytes is `NAMESPACE` through R53; control: the same bytes signed in `NS_AI_CATALOGUE` verify.

`CATALOGUE_KEYS → string[]`
- **R50** (T53; AIR33, AD25, SR84) A frozen list, the one place the keys that sign the AI catalogue, its advisories and its seal key are held: public lines (R35's form) of the catalogue signing key and the catalogue recovery key, **a list of its own, separate from `RELEASE_KEYS` (R45)**: no line of one is a line of the other, so a release key cannot sign the catalogue nor a catalogue key a release. `ai-catalogue`, `ai-issuer` and the test container verify against this list and hold no copy. Adding or removing a key is a requirement change made in this module alone, after the catalogue key ceremony (BOB's act). Test: each line normalises as R2 reads an allowed key, the lines differ, none equals a `RELEASE_KEYS` line after normalisation, and the list is frozen; control: a list holding a `RELEASE_KEYS` line fails the test, and a signature by a release key over a catalogue statement is `UNKNOWN_KEY` through R53.

**Statements** (AIR33, AIR24)

`aiCatalogueStatement({seq, schema_version, issued_at, sha256, bytes}) → Uint8Array`
- **R51** (T53; AIR33, AD25) Returns exactly `` `bio-ai-catalogue/1\nseq ${seq}\nschema ${schema_version}\nissued ${issued_at}\nsha256 ${sha256}\nbytes ${bytes}\n` `` (UTF-8). It throws `Error` reading `REFUSED [AI_STATEMENT_FIELD]: <field>` before any byte is built when `seq`, `schema_version` or `bytes` is not a whole number of at least 1, `issued_at` is not an existing UTC instant `YYYY-MM-DDTHH:MM:SSZ`, or `sha256` is not 64 lowercase hex. Its leading token differs from every other statement's (R5, R6, R38, R40, R41, R47), so no catalogue payload and no other signed statement can be the same signed bytes. Same inputs always give byte-identical output; changing any field changes the bytes. Test: the exact bytes for a fixture; control: `seq: 0` and an uppercase `sha256` are each refused naming the field, and one changed field changes the bytes.

`aiAdvisoryStatement(advisory) → Uint8Array`
- **R52** (T53; AIR24, AIR33) `advisory` is `{seq, target, kind, reason, effective_at, issued_at}` with `target` exactly `{entry_id}` or `{plan_id}`. Returns exactly `` `bio-ai-advisory/1\nseq ${seq}\ntarget ${entry|plan} ${id}\nkind ${kind}\nreason ${reason}\neffective ${effective_at}\nissued ${issued_at}\n` ``, so every field is signed. It throws `REFUSED [AI_STATEMENT_FIELD]: <field>` when `seq` is not a whole number of at least 1, `target` is neither shape or its id is not a lowercase `[a-z0-9._:-]` token, `kind` or `reason` is not a lowercase `[a-z_]` token, or an instant is not R51's form. The closed lists of kinds and reasons are `ai-catalogue`'s (its R26, `ADVISORY_REASONS`); this module checks the shape only, being in a lower layer. Leading token distinct as R51's. Test: exact bytes for a fixture with an `entry_id` target and with a `plan_id` target; control: a target holding both ids is refused, and changing `reason` changes the bytes.

**Verifiers** (on `verifyReleaseNotice`'s pattern, R48)

`verifyAiCatalogue(statement, armored, heldSeq, allowedKeys = CATALOGUE_KEYS) → Promise<{ok:true, statement} | {ok:false, reason, ...}>`, `verifyAiAdvisory(advisory, armored, heldSeq, allowedKeys = CATALOGUE_KEYS)`
- **R53** (T53; AIR33, AD25) `ok:true` only when the fields are well formed (R51, R52), `armored` verifies by R2 in `NS_AI_CATALOGUE` (payload) or `NS_AI_ADVISORY` (advisory) over the statement's bytes against `allowedKeys`, and `seq` is higher than `heldSeq` (a whole number of at least 0; 0 when none is held). The answer's `statement` is a frozen copy of the fields. Otherwise `ok:false` with `reason`: `MALFORMED` (with `field`), R3's `NAMESPACE`, `UNKNOWN_KEY`, `BAD_SIGNATURE`, `CRYPTO_UNAVAILABLE` as `verifySshsig` names them, or `NOT_NEWER` (with `seq` and `heldSeq`) for a correctly signed statement at or below `heldSeq`, so a replayed old payload or advisory is not accepted. The signature is judged before `seq`. Never throws. Test: a payload statement and an advisory each signed with a throwaway key in `allowedKeys` are accepted; controls: one changed digit of `sha256` is `BAD_SIGNATURE`; the same bytes signed in `NS_RELEASE`, or in the other of the two new namespaces, are `NAMESPACE`; a key outside `allowedKeys` is `UNKNOWN_KEY`; `seq` equal to `heldSeq` is `NOT_NEWER`.

`aiSealKeyStatement({key_id, public_key, not_before, not_after, seq}) → Uint8Array`, `verifyAiSealKey(doc, armored, allowedKeys = CATALOGUE_KEYS)`
- **R54** (T53; SR62, SR84) The seal-key document of `ai-issuer` R8 is signed in `NS_AI_CATALOGUE` over exactly `` `bio-ai-seal-key/1\nkey_id ${key_id}\npublic ${public_key}\nnot_before ${not_before}\nnot_after ${not_after}\nseq ${seq}\n` `` (`key_id` a lowercase `[a-z0-9._:-]` token; `public_key` the base64 of a 32-byte public key; instants R51's form; `seq` a whole number of at least 1; else `REFUSED [AI_STATEMENT_FIELD]: <field>`). Its leading token differs from R51's and R52's, so a payload and a seal key are never the same signed bytes. `verifyAiSealKey` answers `ok:true` with a frozen copy when well formed and verified by R2 against `allowedKeys`, else `ok:false` with R53's reasons except `NOT_NEWER`; validity at an instant is the caller's. A container verifies the key it seals to with this, so an address swapped by an attacker is `UNKNOWN_KEY`. Never throws. Test: a seal-key document signed by a throwaway key in the list is accepted; control: a changed `public_key` is `BAD_SIGNATURE`, a payload's signature over the same fields is `BAD_SIGNATURE`, and a key outside the list is `UNKNOWN_KEY`.

**The test container's run key** (SR60–SR64, AD8)

`NS_AI_RUN → string`, `runBundleStatement(manifestBytes, payloadSha256) → Uint8Array`
- **R55** (T53; SR60, SR61, AD8; amends R1) `NS_AI_RUN` is `"bio-ai-run"`, a compiled constant distinct from every other namespace (R1's rule; R49). `runBundleStatement` returns exactly `` `bio-ai-run/1\nmanifest ${H(manifestBytes)}\npayload ${payloadSha256}\n` `` where `H` is SHA-256 in lowercase hex of the exact manifest bytes and `payloadSha256` is 64 lowercase hex (else `REFUSED [AI_STATEMENT_FIELD]: payloadSha256`; `manifestBytes` a `Uint8Array` else `REFUSED [AI_STATEMENT_FIELD]: manifestBytes`). A manifest or payload changed by one byte changes the statement. Test: exact bytes for a fixture; control: the same manifest with one character changed gives different bytes, and `payloadSha256` in uppercase is refused.

`verifyRunBundle({manifestBytes, payloadSha256, armored, runPublicKey}) → Promise<{ok:true, keyB64} | {ok:false, reason, ...}>`
- **R56** (T53; SR60, SR61, AD8) The check `ai-issuer` R12 makes of a test container's bundle. `ok:true` only when `armored` verifies by R2 in `NS_AI_RUN` over `runBundleStatement(manifestBytes, payloadSha256)` against `[runPublicKey]`, the one public key (R35's form, or bare base64) the challenge was issued against; so only the container that holds the matching private run key can have signed. Otherwise `ok:false` with R3's `MALFORMED`, `NAMESPACE`, `UNKNOWN_KEY` (a different run key signed), `BAD_SIGNATURE` or `CRYPTO_UNAVAILABLE`; a malformed `runPublicKey` is `MALFORMED` with `field`. It holds no key and no record. Never throws. Test: a bundle signed with a throwaway run key verifies against that key; controls: one changed manifest character is `BAD_SIGNATURE`, a second throwaway key signing is `UNKNOWN_KEY`, the same bytes signed in `NS_AI_CATALOGUE` are `NAMESPACE`.

## Private

### Uses
- `record-grammar` and Web platform primitives as `signatures.md` states; nothing added.

### Invariants
- All of R26–R29 hold for R49–R56 unchanged: pure, offline, no place named, a signature never verifies in another namespace or over another message, every "no" names its kind.

## Satisfies
AIR33, AD25, SR60–SR62, SR84, AD8; `build/plan/lane-ai-design/draft-ai-catalogue.md` R33, R35, R39 and `draft-ai-issuer.md` R3, R4, R8, R12.

## Suggestions
- **Callers.** `ai-catalogue` calls R53 with `heldSeq` the highest it holds; `ai-issuer` calls R53 with its highest published `seq`, R54 when it publishes the seal key, R56 on every bundle (nonce lookup gives `runPublicKey`); the container calls R54 before sealing. None holds a key list of its own.
- **Tests.** Throwaway keys only; one negative control per R, as R48's test does.

## For BOB
1. **A third namespace (R55).** The drafts named two namespaces; the run-key check needs its own so a run key's signature can never pass as a catalogue one. Recommended as written (the container's format, SR60, then signs in `NS_AI_RUN`).
2. **Seal key statement (R54)** is added: `ai-issuer` R8 signs the seal key in the catalogue namespace and no statement was listed. Recommended as written.
3. **`CATALOGUE_KEYS` lines (R50)** are written at the catalogue key ceremony, before layer 1's START; until then the list is a test fixture only.
