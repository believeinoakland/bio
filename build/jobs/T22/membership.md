# membership (T22)

**Status** · session_01LdQT1TKUB5SDgdFi5gE5ik · depth 2 · COMPLETE · handled B1

MEMBERSHIP #16, T22 layer 2. Entries from BOB's B1 START (`build/plan/current.md` L2 membership).

## Completion

**Applied**
- **N478** (K1006). `"legacy-tests"` dropped from `MODULE_ORDER` (`index.mjs`, the layer-11 line now ends at `"installer"`). R83 (`module-order.test.mjs`) and R79 (`t9-notice-sight-bounds.test.mjs`) green; promotion's ordering test green.
- **N480** (G1). The five named sites re-worded to today's homes: `resolveSession` (admission, `src/admission/index.mjs`); `CUSTODIAL_ACTIONS` and `GOVERNANCE_ACTIONS` (op-declarations', applied by control-plane); the `administer` stamp and the `by` stamp's custodial disjunct (control-plane). Re-scan of the whole path found more of the same kind, each handled the same way:
  - `index.mjs`: R88's "the legacy store's internal call" (now "an internal caller"); `membershipOps`' header ("the legacy store's op map", now the plane's, spread by `plane`); comments naming retired private names as live (`#inSight`, `#sight`, `#visibilityOf`, `#isProjectOwner`, `#participation`, `#positionalMember`, `#projectAuthority`, `#rosterInSight`, `#reindexProjectSight`, `#existenceAct`, `#viewerSees`, `#isAdminMember`, `#activeAdmins`, `#owners`) re-pointed to the public methods; `projectLeave`'s REC-186 note, which claimed `ownerMath` still decides, put in the past (R35's committed-owners count replaced it).
  - `checks.mjs`: `Store.ROOT_ADMIN` -> `Membership.ROOT_ADMIN`; `#isAdminMember`/`#activeAdmins` -> `isAdministrator`/`activeAdmins`; `dec49Decorate` "(index.mjs)" -> control-plane; the custodial family's "those sites carry no DEC-49 region yet" (they do) re-worded.
  - `schema.mjs`: `Store#reindexProjectSight`, `Store#sight`, `Store#seedProjectSight` -> `Membership#reindexProjectSight`, `Membership#sight`, `Membership#migrate`.
  - `members.test.mjs`: "the full Worker (index.mjs)" -> plane's `src/plane/index.mjs`; the deleted `membership.test.mjs` -> `test/m/membership/`; `store.mjs LOGIN_REFUSAL_DETAIL` and `Store.#payLoginCost` -> credentials' `Credentials.*` (one test title's pointer re-worded, its assertion unchanged). The dated NEGATIVE CONTROL records stay (provenance, past tense).
  - `hidden-bundles.test.mjs` header ("the legacy store's counts" -> record-core R63's figure sources); `t14-rows-remedy-order.test.mjs` header (R62 is credentials' since T19).
  - Provenance notes kept ("moved from query.mjs", "extracted from the legacy store", `converts.test.mjs`'s T17 legacy-tests rows).
- **Improvement in my own tests.** R57's test (`administrators.test.mjs`) read `Membership.prototype`'s source for `DELETE FROM members`, a source-text check; it now drives every act that ends or changes a member's standing (a carried removal, reactivation, revocation, an endorsement refused, a project removal) and holds every member row and handle unchanged.

**Deferred.** None.

**Found in other modules.** Generated artifact made stale: the plane's bundle, `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`fleetbundles.test.mjs` red until L2's close; accepted red 2). Not regenerated. Requirement wording in `build/requirements/membership.md` (BOB's): R88 names the legacy store's count subtraction as a live reader; R30 and R70 say the `aiCredentialLook` and `attestingKeys` copies stay here (gone since T21 N453); the Status line's "Code today: inside the legacy modules". No meaning changed by any. Both in REPORT J1.

**Tests and checks**
- `node --test test/m/membership/`: before 137 pass, 2 fail (R83 and the R79 order test: the accepted red); after 139 pass, 0 fail.
- `test/m/credentials/` 33/33; `test/m/promotion/` 101/101; `node --test test/members.test.mjs`: members 96 pass, 0 fail.
- Whole `bio-plane/test/m`: 4815 tests, 4795 pass, 0 fail, 20 todo (test-support R2 passed in this environment). No red at all, so no baseline comparison was needed.
- `checks/format.mjs`: 85 modules, 0 failures. `checks/architecture.mjs bio membership`: 0 failures. `checks/coverage.mjs bio membership`: 79 of 79 live ids named, 0 failures. `checks/ownership.mjs bio membership tranche/T22`: 8 files, 0 failures.

Size (session_01LdQT1TKUB5SDgdFi5gE5ik): test runs 7, module lines 3341

## J1 · REPORT

Generated artifact made stale by this job (accepted red 2): the plane's bundle, bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (inputs src/membership/index.mjs, checks.mjs, schema.mjs changed; MODULE_ORDER loses legacy-tests). bio-plane/test/system/fleetbundles.test.mjs is red from my merge until BOB regenerates at L2's close. Not regenerated (mechanics §14). Also, requirement wording (BOB's file, build/requirements/membership.md), seen while re-scanning, no meaning changed: R88 names 'legacy-store's count subtraction' as a live reader (the legacy store is gone; the figure sources through record-core R63 subtract it now); R30 and R70 say aiCredentialLook and attestingKeys 'stay here as a named copy until T19' (both copies are gone, T21 N453); the Status line's 'Code today: inside the legacy modules store.mjs and schema.mjs' is history.
