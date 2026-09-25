# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-25 ~01:45Z, at its refresh (BOB #34 00:11Z), after c20-batch27 LANDED.
> Everything below is on `origin` (main, coord, land/*). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
`git fetch origin` · `node tools/train.mjs list` · `node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '`.
A TRAIN OF ONE BRANCH: `train.mjs run --drop <b1> --drop <b2> …`, ONE `--drop` PER OTHER WAITING BRANCH (a comma list is one unknown
name and merges EVERYTHING). Build the args from `train.mjs list` WAITING rows. Ids: `node tools/mintid.mjs <NS>`.
NEVER put `timeout` on a gate or plancheck (killed gate26b; a timed plancheck printed nothing). Never read an exit status through a pipe.
Write coord ONLY from a checkout detached at origin/main (a batch worktree carries stale planning files).

## 2. ADDRESSES (one-shot `create_trigger`, persistent_session_id, run_once_at 1–3 min ahead; NEVER fire_trigger; confirm with get_session)
BOB #34 `session_015xYmWbudjCX7rFPF1bDJd3` · SCHEDULER #21 `session_01EW169eb7SVoxFrivnk6P1f` (FLEET-rooted; its workers CAN report)
· DIST #7 `session_01FQcUMZ2f34zhHzBkMEEdQ6` · FLEET creates CONDUCT sessions.

## 3. STANDING RULINGS
- THE SPLIT (Bob 21:10Z): SCHEDULER flips rows `integrated`, refills and SPAWNS. CONDUCT verifies, integrates into batches, trains,
  archives (D-398) and answers workers. Workers report to CONDUCT AND SCHEDULER.
- NO RELEASE (Bob 22:30Z, coord ec9b251d): trains land, nothing is released, no release-readiness work ahead of plan rows.
- BOB #34 23:09Z: cut the next batch from the last one's tip and gate in parallel; a row that turns the gate RED is DROPPED by name
  into the next batch, never holds the train.
- CAP 16 live workers; TRAIN at least every 2 h while gated land/* wait. Refresh at 75% context.
- Pens (BOB #33 17:12Z): a control driver's in-worktree, gitignored, item-named pen STANDS; `controlPen(item)` (M0-182) is the one spelling.
- Integration mechanics: ONE CATALOG_VERSION per batch, count+digest from the d470 print; ratchets/floors only to PRINTED figures;
  REGISTER_FLOOR keep ONE key, re-read `--strict` on the committed merge; `Dropped-from-branch: <path> — <why>` trailer for any
  dropped change; regenerate construct-status (status.mjs) and dist (`node tools/bundles.mjs`) LAST; IC headers PROPOSED→ACCEPTED
  and version bumps in INTERFACES.md are CONDUCT's. Edit construct-status.json TEXTUALLY, never through a JSON serialiser.
- A Status date goes stale at 00:00Z: a doc changed after midnight UTC fails corpuscheck (gate27b) — bump its `as of`.

## 4. STATE (01:45Z, measured)
- MAIN = 964da679: c20-batch27 LANDED (train-20260925T011209Z-20459; 19 rows; CATALOG 1.29.0 = 466; I2 2.8.0, I3 99.4.0, I5 3.13.0).
  All 19 worker tips verified ancestors of main; all 19 sessions ARCHIVED. Batch26 landed 8bdf20e6 earlier, workers archived.
- NO TRAIN IS RUNNING. No batch28 branch is cut. #20's worktrees (/home/user/w16, w17, wtrain) die with its container.
- OWED: `civicos-ui/test/notifications.control.mjs` on main (UI-93 + UI-97 arms together, renumbered 18/19/19b/20) — never run on the union.
- monitor-cadence failed 2 arms under two concurrent gates on batch27's first gate (passed alone); D-571 (below) is its fix.

## 5. BATCH28 — every branch pushed, based 8bdf20e6 unless said; gate figures are the WORKER's (TARGETED ones are not full)
CATALOG: D-448, D-468, REC-205, D-512, D-530, D-521, D-450 bump → take 1.30.0 ONCE from the d470 print; D-450 adds
`changed: ["C-41.12"]` to the census entry (carry it); DROP any branch's 13.statement-ack CATALOG_VERSION probe (batch27/D-544 removed it).
ID COLLISION: REC-205 C-33.44 (CLASS_NOT_DISPOSED) vs REC-207 C-33.44/.45/.46 → renumber one family; re-read machinefences D-PIN-B + d470.
- M0-188 c0351eaf (merges 8bdf20e6) · D-448 5eadd905 (C-87 x11; families 54→55; untranslated FALLS 292→281) · D-468 b3ffecfa
  (C-26.12; MINT IC I3) · DIST-7 c1cc9d90 (land/dist/DIST-7; I5 additive) · REC-205 535294c7 (MINT IC I3; machinefences 63→64;
  fold F3 into NOTIFICATIONS.md Incomplete) · REC-207 be038bc1 (NOT rebased, on 1a7f0bcc; MINT IC I3+I5; machinefences 63→66)
- D-558 d614da45 · D-545 a812be34 · M0-194 3325a474 · D-552 da6fdb8a (IC I3 additive) · REC-217 727a1d85 · D-528 85eb32dc (idle
  since 22:55 — read its summary first) · D-512 c8246cb1 · D-521 31501f1b · D-524 69c16607 · D-541 a3d2c566 · D-559 e3d62fa3 ·
  M0-170 e3b35a26 · D-537 fa40a31a · REC-214 e5bae509 (NO green recorded)
- D-533 d7f8a372 + D-530 16b72652: D-556 contradicts D-530's PLANE_HELD_IN_PARTS at the ratify gate — if they conflict, hold the PAIR out.
- D-526 d1622057 (promote derives type once; 5 promotions that landed now refuse, mislabelled envelope gets the labelled refusal:
  MINT IC I3, judge MAJOR vs IC-286 precedent; re-read regionLines) → D-547 (running, session_01Vrz7iRM6p6S3xQQRtfJE2b) is
  STACKED on D-526: integrate D-526 first or with it.
- D-538 9833deb4 + D-539 5d59c84a: both add reviewcopy.test block 11 and control arms o/p → renumber one; D-539 IC I3 additive
  (findings[].role); D-538 I3 sentence text only.
- D-543 873815c2 (stampInstant/instantOrder; ~100 one-line store.mjs sites; ack `at` → ms, classify I3) — keep both vs D-531/D-538/
  D-539; any new stamp calls the helper. BIO_Publication §6A.3 + Status also edited by D-538.
- D-531 478066df (I5 value change: all-whitespace capture reads indexed_none → IC) · UI-95 051b292f + UI-91 080be905 (app.html,
  disjoint functions; CONTENT-SEARCH-DESIGN front matter also D-531's) · UI-91 r3Fed 80→81 and D-550 0c19c1fe arm G
  (MULTI_SITE_CANDIDATES, CEILING.multiSiteCodes) and D-542: all in check-refusal-codes → re-read every figure from the union's `--strict` print.
- RENDERED FAMILY — D-520, D-522 f9599896, D-567 8df8599a (IC I3 additive), D-529 51ecd645 (I3/I5 additive + render.data[].sha256
  null→"undetermined": classify): all edit CLIENT-RENDERED.md and construct-status 2.rendered → compose all; D-529 vs D-520 in
  index.mjs render arm (renderspend), render.mjs, browserrender.mjs; rebuild bundle after.
- D-548 281a96eb (hygiene.test named-walk list) · D-569 715c6ef5 (WORKER.md step 4 + VERIFICATION.md lines) · D-571 509d70d7
  (monitor-cadence only) · D-450 f325c440 (see CATALOG; m025 A8 roster).
- Still running at 01:45Z (SCHEDULER spawned): D-451, D-454, D-547. D-563 at backlog head (depends on D-526).

## 6. ARRIVED AFTER THE HANDOFF (01:36–01:38Z)
- D-547 a1a56e0a — CARRIES D-526 (built on d1622057): integrate it IN PLACE OF D-526. New DEC-49 region `promote > is-promote-retypes-bundle`,
  REVISION_RETYPES_BUNDLE C-86.2 (IC I3: new refusal on op=promote). CATALOG bump (fold into 1.30.0). Re-read every refusal-guard key and
  regionLines on the union; REGISTER_FLOOR one key set. M-156: no bundle ever retyped. D-578 minted (no-type revision throws raw NOT NULL).
- D-454 25e4c242 — reading_refs re-keyed (capture_sha, ref, occurrence)+seq, migration keeps every row (M-155); op=connectionchoose
  occurrence=, C-74.4; edited INSIDE region `chooseConnectionPair > is-connection-choice` (re-read regionLines). CATALOG bump. Floors incl.
  hygiene reach 45, meaning-bounds OPAQUE 10. app.html __DOCPROFILE__ regenerated (UI path) — regenerate on the union. ICs: I5 (reading_refs
  PK, connection_pair_choices.occurrence) + I3 (occurrence=, C-74.4, answer fields occurrences/limit/truncated/chosen.occurrence, lapsed/ambiguous).
  Touches the on-point choice UI-91 builds on — check UI-91's suite on the union.
- UI-96 013d80c2 — app.html version-notice surface; ONE edit in shared basisLegRow leg-referent line (watch UI-91/UI-95); r3Fed 80->81 AGAIN (with UI-91): re-read from --strict on the union; 4.cross-version-ui BUILT; Content Framework §18.1. D-588 minted.
