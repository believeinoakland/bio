# T13: promotion's stamp list (N318, K425)

**Status** · Written by a worker for BOB #65, 2026-09-29, from T12's job records and rulings; checked by BOB. Rows changed since 1.42.0 (`gate.mjs` 280–300 names 1.42.0's). Promotion still diffs every row table since `f955769afc` (as PROMOTION #12 did); a row found there and missing here is stamped and reported.

- **C-96.13 was not taken by 1.42.0.** It is absent from the note, because membership and promotion ran in parallel at layer 2 (K382). It must be stamped: membership `EXPERTISE_NO_LABEL`, **new**.
- capture: **new** C-118.1 `NOT_FOUND` (evidenceAbsent), C-118.2 `NO_SUCH_KNOCK`.
- extraction: **new** C-51.6 `NO_SHA` (`EXTRACTION_CHECKS`).
- entities: **new** C-91.5 `NO_ENTITY`, C-91.6 `ENTITY_NO_LABEL`.
- progressions: **new** C-100.20 `NOT_A_DISPOSITION`; **renamed** C-100.2 → `PROGRESSION_NO_LABEL` and C-100.8 → `PROGRESSION_VERSION_NOT_HELD`; **retired** C-100.9, C-100.19.
- intent: **retired** C-111.5.
- review: **new** C-87.12 `MINT_EXHAUSTED`. It retires again in T13 under N322, so the pair shows up across two stamps.
- standards: C-112.10, **`where` only** (standards record line 19: "no row added").
- conformance: **new** C-113.23 `DETERMINATION_SUPERSEDED`; C-113.15 `where` changed; **renamed** C-113.3 `DETERMINATION_NOT_A_PARTICIPANT` and C-113.20 `NO_SUCH_COMPARISON`; **retired** C-113.9, C-113.18.
- consequences: **retired** C-114.1; **renamed** C-114.2 `CONSEQUENCE_NOT_NONCOMPLIANT` (its translation also changed) and C-114.3 `CONSEQUENCE_NOT_A_PARTICIPANT`.
- escalation: **retired** C-116.3, C-116.4; **renamed** C-116.6 `ESCALATION_NOT_A_PARTICIPANT` and C-116.30 `EDGE_NOT_PROPOSED`.
- queue (K409), 8 rows **moved** out of the catalogue: C-31.1–.3 (`QUEUE_MINT_CHECKS`), C-32.10, C-32.11, C-33.27, C-33.44, C-76.1. **New**: C-33.50 `NO_PROJECT_SCOPE` (D-623).
- instance-setup (K414, J5 item 5): **moved** C-64.2, .3, .5, .6, .7. **New**: C-119.1–.4 (`PROFILES_NOT_ADMIN`, `NOT_A_LIST`, `UNKNOWN_PROFILE`, `PROFILE_IS_TEST`).
- control-plane (record J4 item 1a and J6), 24 rows **moved**:
  - whole families: C-38.1–.8 (`ADMISSION`), C-78.1–.3 (`NAMESPACE`), C-69.1–.2 (`DISPATCH`);
  - split out: C-68.2–.4 (`BOOTSTRAP_CHECKS`), C-29.6–.10 (`AI_SCOPE`), C-32.17 (`OPERATOR_FENCE`), C-64.4 (`GROUP_IDENTITY_FENCE`), C-66.6 (`REPLAY`).
  - **New**: C-69.3 `PLANE_INTERNAL_ERROR` only (J6).
- No row changes in: actions, publication, ratification, monitoring, affordances, installer, legacy-store (each record says "nothing for N318").
- The 37 moves (8 + 24 + 5) are what legacy-tests' d470 `moved` declaration holds under 1.42.0 (legacy-tests record line 27). T13's stamp replaces that declaration with a new row.
- Promotion should still diff every row table since `f955769afc`, as PROMOTION #12 did. The moved rows' `where`s changed, and queue's N301 work may have touched translations.
- Add T13's own layer-2 rows: record-core C-59.6 (new); C-96.1 into membership's table (K408 (4)); (N335 and N128 are not in T13). Promotion merges record-core and membership as they merge, and stamps last (K425); T12's parallel stamp is how C-96.13 was missed.
- Post-stamp T13 rows, to be named `awaiting stamp` under R50: review C-87.12 retired (layer 8); control-plane C-69.4 `STORE_INTERNAL_ERROR` (layer 11).
