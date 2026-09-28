# membership (T9)

**Status** · session_01LbMiZGKaADvtuykNWkWcTu · depth 2 · WORKING · handled B1

## J1 · REPORT

R78 is built and tested (N208, N146), on `job/T9/membership` @ the commit before this entry, so you can merge me early for promotion's `NO_SUCH_PROJECT` site (§4).

- **Service:** `noSuchProject(projectId, extra?)`, a module-level export of `bio-plane/src/membership/index.mjs`. Answers `{ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check: "C-70.5", translation, project, …extra, detail}`: `project` the id as asked (null when none); `detail` one fixed sentence (today's `#noSuchProject` sentence); `extra`'s fields sit between `project` and `detail` (the legacy `finding` position) and never replace a fixed field. Writes nothing, never throws.
- **Its row:** `C-70.5` (the next free in C-70, the sight family), held in membership's own new file `bio-plane/src/membership/checks.mjs` as `MEMBERSHIP_CHECKS.NO_SUCH_PROJECT` (K174's pattern, as intent and conformance hold theirs), `where` = `src/membership/index.mjs noSuchProject > is-project-seen`. Re-exported from `index.mjs`. The catalogue (`bio-checks.mjs`) is not touched; C-70.1–.4 stay there.
- **Inside membership:** every site answering the condition now calls it: the nine sight lines (the old `Membership.#noSuchProject`, removed), `projectClaimOwner`'s bare `NO_SUCH_PROJECT` (R31) and `projectParticipants`' own sentence (R37). Their answers gain `code`, `check`, `translation`; R37's detail becomes the fixed sentence.
- **Tests:** `bio-plane/test/m/membership/no-such-project.test.mjs` (4 tests naming R78: shape and row, `extra`, writes nothing / never throws, every membership act byte for byte for absent, hidden and unseen ids). Module suite 85/85; format, architecture, coverage (78 of 78), ownership: 0 failures.
- **For the other sites (not mine):** citation's `noSuchProject` (index.mjs 82), legacy-store's `Store.#noSuchProject` (store.mjs 6765) and 5602, strength (777), promotion (867), case-authoring (187), intent's `refuseNoSuchProject` (C-111.2), conformance's `#projectRefusal` (C-113.2). Legacy tests that compare a store answer byte for byte with a membership one may now differ by the three added fields until legacy-store converges.
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (not rebuilt, manifest §14).
