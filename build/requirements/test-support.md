# test-support — requirements

**Status** · In force: a helper module, its requirements BOB's (K20). Last changed T35 (T35-3: R10–R14; K1844, K1852); every requirement met (K1919).

## Public

### Purpose

Gives any test process a temporary-file sandbox it owns and removes, and standard output that cannot lose a test's final tally when the process exits. A test takes both by importing the sandbox module. It also writes ZIP archives in memory, conforming or deliberately hostile, for the tests of every module that reads one (`bio-plane/test/make-zip.mjs`; importing it has no side effect).

### Provides

**Importing the sandbox (a side effect).**
- **R1** On import, one directory is created under the host's temporary directory, named with the process id, and the process's temporary directory (`$TMPDIR`, and so `os.tmpdir()`) points inside it for the rest of the process.
- **R2** When the process exits by any path that runs exit handlers (a normal end, `process.exit()`, an uncaught error), the directory and everything in it are removed synchronously before the process ends, including a subdirectory or file a test left read-only, also when the process does not run as root: a removal refused for permission (`EACCES`) makes that part of the tree writable and is retried, so the directory never outlives the process.
- **R3** Importing it more than once in one process creates one directory and removes it once, and never throws.

**`SANDBOX` → string.**
- **R4** The absolute path of the directory R1 created.

**`sweepSandbox()` → void.**
- **R5** Removes the directory at once; a later exit does not fail because it is gone. Never throws.

**`synchronousStdio()` → `{streams, already}`.**
- **R6** Makes the process's standard output and standard error write synchronously where the stream allows it, so everything written before `process.exit()` reaches the reader, including through a pipe. `streams` names the streams it changed.
- **R7** A second call changes nothing and returns `already: true` with the same `streams`. A stream that cannot be changed (a file, which is already synchronous, or an absent stream) is left as it is and is no error. Never throws.
- **R8** Importing the sandbox module also applies R6.

**`makeZip(entries, options = {})` → `Uint8Array`** (N688; K1844, K1852)
- **R10** `entries` is an array of `{name, data, method = 8}`: `name` a string or the raw name bytes (a `Uint8Array`), `data` a `Uint8Array` or a string (written as UTF-8), `method` 0 (stored) or 8 (deflate; any other number is written as declared over the data as given). With no override (R12), the answer is one conforming archive in APPNOTE 6.3's form: for each entry in order a local header and its data, then the central directory, then the end-of-central-directory record; each entry's CRC-32 and sizes true; general-purpose bit 11 set exactly when a string `name` is not ASCII; one fixed MS-DOS time when none is given.
- **R11** A conforming archive (R10) with at least one entry passes both oracles (K1917; Info-ZIP refuses an empty archive, which R10 and `zipfile` still cover): Info-ZIP `unzip -t` exits 0 over it, and Python's `zipfile` lists the entries in order with their names and gives back each entry's `data` byte for byte.
- **R12** Every hostile shape below is written by an override and nothing else changes: the bytes say exactly what the override names, and the rest stays as R10 writes it.
  - **Duplicate names:** two entries with one `name` are written as two entries; nothing is merged or renamed.
  - **Unsafe and non-UTF-8 names:** a `name` is written verbatim (`../`, a leading `/`, a drive letter, `\`); `utf8: false` on an entry clears bit 11 over non-ASCII raw bytes (a CP437 name).
  - **Central directory and local header disagree:** an entry's `local: {name, method, flags, crc32, compressedSize, uncompressedSize}` (any subset) is what that entry's local header states; its central-directory record keeps the true values. `central: {…}` (the same fields, and `localOffset`) does the reverse, and a `localOffset` past the archive's end writes an entry out of range.
  - **Bit 3:** `dataDescriptor: true` sets bit 3, writes zero CRC and sizes in the local header and a data descriptor after the data; `descriptor: {crc32, compressedSize, uncompressedSize, signature}` overrides what the descriptor states, and `signature: false` omits its optional signature.
  - **ZIP64:** an entry's `zip64: true` writes its sizes and offset as `0xFFFFFFFF` with the true values in a `0x0001` extra field; `options.zip64: true` also writes the ZIP64 end record and its locator, with the end record's 16- and 32-bit fields at their sentinels. `zip64Record: {…}` overrides what the ZIP64 end record states.
  - **Encrypted:** an entry's `encrypted` is `"traditional"` (bit 0), `"strong"` (bits 0 and 6), `"aes"` (method 99 with a `0x9901` extra field) or `"directory"` (bit 13); the data is written as given, never actually encrypted.
  - **Overlap:** an entry's `sameDataAs: <index>` points its central-directory record at the local header and data of an earlier entry, so two entries' byte ranges coincide.
  - **The end record:** `options.eocd: {entries, diskEntries, cdSize, cdOffset}` (any subset) is what the end record states; `options.comment` is the archive comment (a string or bytes); `options.secondEocd: true` writes a second, well-formed end-record candidate inside the comment.
  - **Nesting:** an entry's `data` may itself be `makeZip`'s output.
- **R13** Deterministic: the same `entries` and `options` give the same bytes on every call. No clock, no randomness, nothing written to disk. A spec it cannot write (an entry without `name` or `data`, a `sameDataAs` naming no earlier entry, an unknown `encrypted` value) throws an `Error` naming the field.

**`zipBomb({kernel, entries})` → `Uint8Array`, `nestedZip({depth, fanout, leaf})` → `Uint8Array`** (N688; F7)
- **R14** `zipBomb` writes one deflated kernel of `kernel` zero bytes once and `entries` central-directory entries that all point at it (R12's overlap), each declaring `kernel` uncompressed bytes, so the declared total is `kernel × entries` while the archive stays near one kernel's compressed size. `nestedZip` writes an archive `depth` levels deep (1 is a plain archive of leaves): each level holds `fanout` entries, each the next level's archive, and the deepest holds `fanout` copies of `leaf` (bytes, written stored or deflated as R10). Both are deterministic and built on `makeZip` alone (R13).

## Private

### Uses

None.

### Invariants

- **R9** Nothing outside the sandbox directory is created or removed by this module.

### Satisfies

- `build/layers.md`, "Helper modules": the shared test sandbox the workers' tests and the kept suites use.
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3, "Members of a captured archive" (K1852): R10–R14 are the archives, conforming and hostile, on which "cut out unambiguously" and "over a published limit" are tested (N688, K1844; F7 of `build/plan/draft-T35-security-review.md`, the nested tree).

### Suggestions

- A test of R2 spawns a child process that imports the module, writes a file, and exits through `process.exit()`, then checks the directory is gone; R2's read-only case is tested by running that child as a non-root user (`setpriv` or `runuser`) with a read-only subdirectory left in the sandbox, and at the interface with an injected `EACCES` (N22); a test of R6 floods a pipe from a child and checks the final line arrives.
- `make-zip.mjs` runs only in Node tests, so deflate may be Node's `zlib.deflateRawSync`. R11's oracles run as child processes (`unzip -t`, `python3 -I -c` with `zipfile`); a host lacking either skips that check by name rather than passing it. A test of R12 reads each hostile fixture back at the byte level (Python's `zipfile` or `struct`) and checks the one field the override names.
- The ooxml job (T35-8) checks its `listArchive` verdicts against the same two oracles over these fixtures (K1844's oracles): where `unzip -t` or `zipfile` extract other bytes than the central directory states, `listArchive` must not answer `ok`.
