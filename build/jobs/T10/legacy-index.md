# legacy-index (T10)

**Status** · session_013Fr8m2QkVBUm76bvxapWas · depth 2 · COMPLETE · handled B1

**Job** · LEGACY-INDEX #7, session `session_013Fr8m2QkVBUm76bvxapWas`, branch `job/T10/legacy-index`, the legacy-index bullet of layer 11 (`build/plan/current.md`). A legacy module: no requirements file and no `tests` path. Its contract is the bullet, BOB's START (B1), N290 and N265's text in `next.md`, and inquiry R44 (the stamp's reader).

## Completion

### Entries applied

1. **N290 (K334).** `op=promote` (`index.mjs`, the promote block, after the `migrationReplay` stamp): `delete b.memberUserAgent` for every caller, then, only when `viaSession && b.base === null` (a creation through a member's session), `b.memberUserAgent` = that request's own `User-Agent` header, trimmed, cut to 512 characters (and trimmed again at the cut), set only when non-empty. A deploy token, an `ai` key and a verified migration replay (admin, no session) carry none. Inquiry R44 records it at the creation (`inquiry_member_agents`). Reading: "at most 512 characters" cuts a longer header rather than dropping it; inquiry's `agentOf` would drop one over 512, so the cut is what lets a real long agent be recorded.
2. **N265, my share.** The `op=acquire` block already hands the reading to extraction (`acquireReadingOp`, extraction R1, `op=extractread` in the Durable Object) and runs none of its own; only the comment was stale. It now says so, and "until `extraction` takes the block (K49)" is gone. No code change was needed.

### Tests (no `tests` path: none committed)

Tested at the op in a scratch suite (Miniflare, `op=promote` through a member session, a member deploy token and an admin deploy token, each sending a forged `memberUserAgent` in the body, then the store's `inquiry_member_agents` read from the persisted SQLite):
- a member session's creation records its own `User-Agent`, trimmed; the body's forged value is gone;
- a member deploy token's creation and an admin deploy token's creation (each inside an open run with a `surfaces` bound) record none;
- a 600-character header records 512 characters; a blank header records none; every promotion landed.
- `6 pass, 0 fail`; negative control (the same suite on the tree without the change): 4 arms fail.

**Proposed for legacy-tests** (it owns `bio-plane/test/`): the scratch suite, if BOB wants N290 pinned in the battery. It is at this session's scratchpad (`zz-n290-scratch.test.mjs`); it can be handed over on request.

Suites run on the changed tree: `acquire` 97 pass, 0 fail; `admission-gate` 57/0; `airun-principal` 27/0; `risk-tier` 90/0; `capturerequests` 138/2 (the same two source-scan reds on the tree without the change: not mine, legacy-tests'); `node --test test/m/inquiry/ test/m/extraction/ test/m/promotion/` 202 pass, 0 fail.

### Checks

- `format: 69 modules, 64 requirements files; 0 failures`
- `architecture: 29 product files, 53 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by legacy-index between tranche/T10 and HEAD; 0 failures`

### Deferred

Nothing.

### Found in other modules

1. **capture-requests (R14, its private note at line 112).** `#memberAgent` reads only the inquiry document's `member_user_agent` frontmatter. With N290 the member's agent is now recorded by inquiry (R44, `memberUserAgent(id)`), and R14's `member-browser` form never sees it: it still refuses C-28.7 for every inquiry created through the plane. R14 and its Uses line ("inquiry: … its recorded `member_user_agent`") should read inquiry's R44 instead; that is a requirements change for BOB.
2. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` is stale from `index.mjs` (both edits). Not rebuilt (§14); BOB regenerates at the layer close.

Size (session_013Fr8m2QkVBUm76bvxapWas): test runs 11, module lines 7,041

## J1 · COMPLETE

LEGACY-INDEX #7 complete at 836f85e9b2 (record's Completion). N290: op=promote deletes memberUserAgent for every caller and stamps it only on a creation through a member's session, from that request's User-Agent, trimmed, at most 512 (cut, not dropped); tested at the op in a scratch suite, 6/0, control 4 arms red (no tests path, none committed; offered to legacy-tests). N265: the acquire op already hands the read to extraction (acquireReadingOp); the stale K49 comment corrected, no code change. Checks: format, architecture, coverage, ownership 0 failures. Found: (1) capture-requests R14's #memberAgent reads only the document's member_user_agent, so inquiry R44's recorded stamp never reaches the member-browser form (a requirements change for BOB); (2) bio-plane bundle stale from index.mjs, for the layer close.
