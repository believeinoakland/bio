# docprofile (T17)

**Status** · session_01PzNztiLm9r2dBH43cVX69y · depth 2 · COMPLETE · handled B1

## Completion (DOCPROFILE #2)

**Entry applied: N390** (B1; K573). `civicos-ui/test/staff-directory.test.mjs` (FW-20, 160 assertions) converted to `docprofile/test/staff-directory.test.mjs`: 11 requirement-named tests at the module's interface (`docprofile/registry.mjs`), over the same real fixtures, copied whole into `docprofile/test/fixtures/` (`fw20-staff-directory.json`, and `fw18-doctypes.json` for the multi-class packet and the landed types' pins), so the new suite does not depend on files the old battery's retirement removes. No product code changed. The old suite is not deleted (legacy-tests' act).

**Which old assertions each new test carries:**

| new test | old suite section and assertions |
| --- | --- |
| R4 the real corpus is present and whole | §1 all: the nine-document floor; per document present, source URL, sha256, tier, text > 500 chars, producer page indices; a reading produced and the reader not throwing |
| R4 every real directory reads as staff_directory | §2 all: four directories as `staff_directory`; CERTAIN for nss, nsd, benefits; LIKELY for cro; the density signal first; identify() then doctypeFor() |
| R4 R5 no real look-alike reads as staff_directory | §3 all: five negatives neither primary nor `also`; the traps armed (candidates' addresses and phones; the schedule's one-domain density, now computed by the test against the floor and share rather than importing `DIRECTORY_FLOOR`; its dated rows; the recycling directory's self-naming and City contact) |
| R4 the recognition floors are fixed | §7 "the thresholds are the measured ones" (5, 0.8), carried as behaviour at the interface (4 vs 5 addresses, 8/10 vs 7/10 at one domain, dated rows) instead of reading the two constants, which the interface does not export |
| R5 also is asked of every real directory | §6 all: the `also` list answered and carried into `also_satisfies`; the regulation+directory packet (regulation first, `staff_directory` in `also` and in the reading). Added: `also` equals exactly the types whose own `detect` matches |
| R4 R5 the landed types answer on FW-18's real documents | §7 over-strictness: the five FW-18 pins, byte-identical |
| R6 the directory takes no local fact from the view | new: all nine real documents give the same verdict and entry keys under Port Alder's, Lakemont's and an empty view as with none; each real directory with its organisation's domain replaced by a made-up one reads the same |
| R29 staff_directory is registered … MEMBERSHIP | §7: registered, `CONTRACT.MEMBERSHIP`, integer version, after the substance types and before `generic` |
| R19 R35 a real directory's reading | §4: NSS's 12 entries, domain, `entries`; keyed by address, `contact` kind; Moore's line and phone; the NSS title and null `title_why`; CRO's null title and its why; NSD's two-column line verbatim; `organisation` boolean on every entry; an off-domain address kept and marked |
| R20 R34 every real directory entry says where it was read | §4: every entry's `pdf-page` source, null rect, a page the document emitted; the benefits sheet on both pages. Added: the address is on the page named |
| R14 R16 R33 assess on a real directory | §5 all: `item_pulled`, `item_added`, `item_changed`, meaningful; unchanged says so; nothing read claims nothing. Added: significance from the catalogue, `confirmed` counts, a one-sided empty read |

**Dropped:** §8, the three assertions on `civicos-ui/app.html`'s flattened copy: they read source text (P7; B1).

**Negative control**, the old suite's four arms each armed alone on `docprofile/doctypes/staff-directory.mjs` and restored byte-identical (`cmp`): DECIDE (density at one domain neutered) 7 tests fail; REFERENCE (schedule fence removed) 2 fail; ONEORG (one-organisation share removed) 2 fail; OVERSTRICT (fence re-spelled over all addresses) 0 fail, green as the old suite declared.

**Deferred:** nothing.

**Found, for BOB (this module's own requirements, no other module):** the private Uses list names "directory recognition floors" (address count, domain share, self-naming words) among facts taken from the view, while R6 keeps measured structural floors and place-free words in code, which is what the code does (the new R6 test pins it). A wording mismatch in `build/requirements/docprofile.md`, BOB's to settle; no behaviour depends on it. Also for legacy-tests: `civicos-ui/test/fixtures/fw20-staff-directory.json` and `fw18-doctypes.json` are still read by `nc-fw20.mjs`, `doctype-breadth.test.mjs` and `nc-fw18.probe.mjs`; the new suite reads its own copies.

**Tests and checks run:**
- `node --test docprofile/test/`: tests 46, pass 46, fail 0 (35 existing, 11 new).
- `node civicos-ui/test/staff-directory.test.mjs` (baseline, old suite): 160 pass.
- `node checks/format.mjs`: 72 modules, 67 requirements files; 0 failures.
- `node checks/architecture.mjs … docprofile`: 21 product files, 51 relative imports; 0 failures.
- `node checks/coverage.mjs … docprofile`: 35 of 35 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … docprofile tranche/T17`: 4 files changed by docprofile between tranche/T17 and HEAD; 0 failures.
- Layer tests: none named in `build/manifest.md`. No provided service changed.

Size (session_01PzNztiLm9r2dBH43cVX69y): test runs 12, module lines 5274
