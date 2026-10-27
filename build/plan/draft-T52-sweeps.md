# Plan T51

**Status** · DRAFT · for BOB's review; written by a planning worker for BOB #206 (2026-10-17) from `next.md` as it stands at T50's L11; first review by BOB #206 (K3764): settled below; the marks still open wait on T50's close (its census, sizes, reds, walks) and are settled at the opening; nothing here is opened.

**BOB #207's fold (K3791): N1229–N1241, found in T50's L11, are placed below as T51-10, -12, -20, -27, -40 (extended) and T51-92 to T51-97 (new); N1231, N1233, N1234's words and N1237 wait on the design lane's answer to the L11-close HANDOFF (`draft-handoff-ux-L11.md`).

**BOB's first review (K3764).**** (1) The split names stand: `retrieval-browse`, `agent-steps`; each sits first in its layer (K624) and its map must show the moved code uses only modules earlier in the order (P4), else the new module is placed after the module it uses. (2) The agent-worker split stays: P6 binds every later agent-worker job, N1220's included (4,421 lines is past one reading). (3) N1198, N1199, N1219 are left out on Bob's K3717 ("Just don't put any more effort into getting it to work"), a ruling of his, not a new question. (4) N1074, N898 and N1073's registries are not product entries: BOB's process-repository work between tranches (P3), certified on a dry run; they leave the table for BOB's acts. (5) N1215 (which legs a version copies) is read at the fold against basis-versions R51's text; if it changes what R51 means, it goes to Bob with options. (6) N1216: inquiry-grammar merges before basis-versions (already the order). Still open until the opening: (7) N1207's definition (BOB's detail, at the fold), (8) case-checker R27 and DEC-328's keys landed, (9) case-account's placeholders, (10) setup-page HTML's owner, (11) the base reds, (12) unplaced walk defects, (13) sizes past ~4,000, (14) the sweep census, (15) legacy-ui's surface check, (16) N858/N880's hand-off.

**Sources** · `build/plan/next.md` (every entry placed below or left out with its hard reason, P19); T50's `current.md` "Left out of T50" rows that say T51 or "by T51", and its accepted reds cleared in T51; `rulings-active.md` (K3717, K3718: N1220 is left out, no assistant work, no API-key work, K3347); `layers.md`; `modules.json`; `docs/development/ux-substrate/screens/words-reads.json` for the modules the words sweep reaches; `PROCESS-DESIGN.md` (P10, P19). The census of modules with no T50 job was taken from `modules.json` against T50's Jobs line.

**Aim.** T51 carries everything left over from T50 that has no hard reason to wait (P19): the retirement of legacy-ui (N1002) now that T50's screens are built; the words-by-key sweep of the modules with no T50 job (N1116, N1075, N1160's residue, N1068, N1073's rest; the "3 of 3 by T51" waits, one Haiku job per module); the accepted reds T50 named for T51 (N1221, N1224–N1228, N1208, the row-census stamp); the size splits (retrieval, agent-worker, P6); and the L1–L5 entries T50's layers had closed on (N1200, N1202, N1206, N1207, N1209, N1210, N1213, N1226). Bob's focus after T50 is N1220, the multi-AI assistant; it waits on the AI-DESIGN lane and his rulings (left out below), so T51 adds no assistant work and no API-key work, and disables nothing.

## Legacy census (§5.2 (2))

| legacy module | in T51 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **retires** (T51-91, L11, after plane) | none now: the screens replacing S2–S4 were built in T50's L11 (N1101, N1127, N1102). BOB's check first (Measure first M-T51-4); if a surface is found unserved, it stays and the unserved surface becomes a T51 entry for its screen module (BOB: check). Its reds N794, N865, N1057 go with it; the biosmoke7 Worker's retirement is a deploy act (BOB's acts). |

## Rules

1. **Merge order.** Within a layer, `modules.json` order; a provider merges before its users; a new module first in its layer (K624): **retrieval-browse first in L5, agent-steps first in L6**; promotion's stamp last in L2. L11: `modules.json` order (plane before legacy-ui).
2. **Reading (K3271, P20).** As T50's rule 2: a job reads whole its requirements, entries, layer contract, own code, the used services its entries touch and the tests naming a requirement its entries change; each START measures the set against 600 KB (`reading-sets.py`); a job that would read only part of a document stops and tells BOB (K3586, K3588).
3. **Models and effort (rulings-active §5).** claude-haiku-5-5 for test-only, wording-only and mechanical jobs; claude-sonnet-5-5 otherwise; no job here qualifies for the default model (the two splits are by copy, not fresh modules). Medium effort; every worker names its model and effort.
4. **The opening act (BOB's, P17).** `tranche/T51` from `main` after T50's close PR; `modules.json`: `retrieval-browse` (L5, before `retrieval`), `agent-steps` (L6, before `agent-worker`) and `installer-steps` (L11, before `installer`), empty `paths`, `tests`, `uses` (K1043), each with a membership `MODULE_ORDER` (R83) entry in the same act and `layers.md` saying both; each split map written by a worker and reviewed before its layer's START (P18). Both names are BOB's to confirm (BOB: check).
5. **Accepted reds at the opening**, each until the entry named (K2704):
   1. Coverage: every id marked *(not yet met: T51)*, until its module's merge.
   2. Row census: rows T50's L3+ jobs added or changed, until T51-13 (the stamp); rows T51's L3+ jobs add, until T52's stamp.
   3. legacy-ui's N794, N865, N1057, until T51-91.
   4. N1221 (case-authoring `standards.test.mjs`:96, :140) until T51-73; N1224 (case-inputs) until T51-72; N1225 until T51-75 (consequences), T51-79 (escalation), T51-85 (action-producers); N1227 (action-holds) until T51-76; N1208 (escalation) until T51-79; N1228 until T51-78 (filings) and T51-82 (following); N1226 (people, screens-investigate) until T51-38 and T51-89.
   5. Every other base red K3543 and K3557 name that had no T50 job: it joins the T51 job of its module, which diagnoses it there (T50 rule 5 (14)); BOB lists them at the opening from the T50 close audit (BOB: check).
   6. The plane bundle and `program.mjs`, staled by any merge, until each layer's close (K1540); test-support R2 run as root under a 0700 directory: environment only (K3192 E).
6. **The sweep clause** (K3366, K3368, K3417; N1116, N1075, N1160, N1068, N1073), for every job marked "sweep (rule 6)", in its own module only: it holds no member-facing English (each sentence read through setup-words' `word(key, vars)`, its keys its `reads` in `words-reads.json`; verbatim-copy tests replaced by key tests, `hasWord`); "labeled", never "labelled"; "team", never "group", in any text people read (identifiers stay); its tests that hand-list another module's ops, rows or words read the owner's declaration (the four registries wait, N1074); a sentence no key holds is a REPORT to BOB for the design lane, never inline English. A module the START finds with none of these to do ends its job as a no-op, recorded. The three-tranche wait (P19) ends here.
7. **Wording only (K3259): BOB's edits, no job.**
8. **Walks.** A defect T50's walks found in a closed layer becomes an entry here (BOB: check the walk files for any not placed); layout, wording, flow and look go to UX-DESIGN as one HANDOFF.
9. **No assistant work.** No entry adds to or changes the Anthropic assistant beyond the agent-worker split; none adds API-key support (K3347); nothing is disabled (K3717).

## Entries

Each entry: id · module · what (N ids, rulings) · requirements · model. "Text: fold" means BOB writes its requirement lines on the tranche branch before the layer's START (P18); "Text: none" a test-only, wording-only or confirm-only entry.

### L1
- **T51-1 · record-grammar** · sweep (rule 6); N1068: R42, R49, R50, R54, R60, R61's quoted text "labeled" · Text: none · claude-haiku-5-5
- **T51-2 · civil-time** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-3 · calc-grammar** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-4 · connection-grammar** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-5 · bundler** · (N1210, K3674; installer R68's release half, S11) when a container member's code changes, the release builds its image and writes the new digest into the member's configuration in the same step; a release whose container code changed under an unchanged digest is refused · Text: fold · claude-sonnet-5-5
- **T51-6 · office-readers** · (N1202, K3627) a docx or pptx reading states its document's own title (the core part's `title`) in its `metadata`, so reading-pipeline R34 titles it · Text: fold · claude-sonnet-5-5
- **T51-7 · pdf-reader** · (N1202, K3627) a PDF reading states its `/Title` in its `metadata` · Text: fold · claude-sonnet-5-5
- **T51-8 · image-cover** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-9 · doc-clean** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-10 · file-scanner** · (N1061, K3225) `store.mjs` `targetBytes` and `captureKey` have no callers: removed or the reason they stay stated; the stale comment at `render.mjs`:12; BOB corrects the **Uses** line (`runtime-limits` `makeMeter`) at START; (N1241, K3784) `providers/catalogue.mjs`' handling entries say "team" ("the team's own account", "Where chosen by the team"), each entry's `handling_digest` moving with its text · Text: none (Uses line: BOB's edit) · claude-haiku-5-5

### L2
- **T51-11 · record-core** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-12 · project-roster** · (N1209, K3667 doubt 14, K3674) `projectInvitations`: the invited member reads who invited her (by handle; the founder as `member.founder.unnamed`); (N1230, K3766) `projectList` pages past 200 projects by a cursor, and `projectRequests` names a requester by member id beside the handle, so none is skipped · Text: fold · provider for queue-producers (L11) · claude-sonnet-5-5
- **T51-98 · membership** · (N1243) `t19-enrol-boot` R12, R57 assert the key · Text: none · claude-haiku-5-5
- **T51-13 · promotion** · the stamp: every row T50's L3+ jobs added, moved or changed, and T51's L2 jobs' · Text: none · last in L2 · claude-sonnet-5-5

### L3
- **T51-14 · host-governor** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-15 · provenance** · (N1200, K3617; membership R150) registers its reader of a project's reach (its captures) through `membership.registerProjectReach`; sweep (rule 6) · Text: fold · claude-sonnet-5-5
- **T51-16 · attestation** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-17 · provenance-routes** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-18 · capture-sources** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-19 · acquisition** · (N1206, DEC-305, U319) reads the keys for `asked_note`, `authority_basis.caller`, `basis.multipart`, `basis.combined_view_none` (in place of `combined_view` when no profile is chosen), `text.continue_session`, `act.set_archive_copy`; sweep (rule 6) (N1068) · Text: none · claude-haiku-5-5
- **T51-20 · capture** · (N1206) reads `upload.asserts`, `upload.evidence`, `reuse.posthoc_changed`, `render.defer.no_reservation`, `chrome.basis.*`, `chrome.ref.*` by key; (N1235, K3771, K3774) R77's held rows also answer an upload's uploader (`actor`) and `bytes`, and `heldcaptures` lists a project's vouched documents beside the collected ones; sweep (rule 6) · Text: fold · provider for screens-intake, screens-investigate · claude-sonnet-5-5
- **T51-21 · file-safety** · (N1206) reads `file-safety.kind.<kind>` for the 14 kinds of `kinds.mjs` by key; sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-22 · sources** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L4
- **T51-23 · calibration** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-24 · extraction** · (N1213, DEC-309, DEC-312, U323, U327) reads the keys for its fragments B279's L4 list names; (N1068) sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-25 · content** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L5
- **T51-26 · retrieval-browse (new, by copy from retrieval; N1212, P6, K624)** · `browse.mjs` and the find-in reads (`findin`) as a module of its own, retrieval delegating; the name is BOB's (BOB: check) · Text: the split map · first in L5 (K624) · claude-sonnet-5-5
- **T51-27 · entities** · (N1207, K3665) a read of how many documents name an entity only by an identifier, so the graph's unnamed node can draw `screen.explore.unnamed.why` with its `{n}` (BOB: check the definition of "named only by an identifier", BOB's details); (N1213) its unkeyed fragments by key (`entities.considered.name`, `entities.relation.*`, `refusal.UNKNOWN_FORUM_KIND`, `refusal.FORUM_KIND_NOT_FOR_KIND`); (N1236, K3771) `namingDocuments` candidates carry their page · Text: fold · provider for screens-investigate · claude-sonnet-5-5
- **T51-28 · events** · (N1213) `events.grade_why.unplaced` by key; its cache-stale `grade_why` stays unkeyed until the design lane keys it · Text: none · claude-haiku-5-5
- **T51-29 · lines** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-30 · connections** · (N1200, K3617) registers its reader of a project's reach (the records it cites) through `membership.registerProjectReach`; sweep (rule 6) · Text: fold · claude-sonnet-5-5
- **T51-31 · observation-log** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-32 · law-relations** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-33 · standards** · (N1213) its unkeyed fragments by key · Text: none · claude-haiku-5-5
- **T51-34 · progressions** · (N1213) its unkeyed fragments by key · Text: none · claude-haiku-5-5
- **T51-35 · money** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-36 · money-checks** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-37 · duties** · sweep (rule 6); N1068; (N1244) `checks.mjs`:31's "group" read by key · Text: none · claude-haiku-5-5
- **T51-38 · people** · (N1226, K3742; screens-investigate R32 (2)) an undetermined fact's `why` answers a key with its fills, never English; sweep (rule 6) · Text: fold · provider for screens-investigate · claude-sonnet-5-5
- **T51-39 · bias** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-40 · retrieval** · (N1212) deletes the moved code, delegating to the new module; (N1213) `refusal.NO_SET`, `refusal.SET_TOO_LARGE.read`, `retrieval.syntax.*`, `retrieval.notread.*` by key; its frontier notes stay unkeyed until the design lane keys them; (N1238, K3775) R83 names the field holding a sheet match's row · Text: the split map, fold · after the new module · claude-sonnet-5-5
- **T51-41 · calculations** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-42 · workbooks** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L6
- **T51-43 · inquiry-grammar** · sweep (rule 6); (N1216, BASIS-VERSIONS #18) `golden.json` and the corpus regenerated: a malformed version name is `VERSION_NAME_MALFORMED`/C-25.36; basis-versions' `amended()` in its R43 test then goes (BOB: check the order with basis-versions); N1068 · Text: none · claude-haiku-5-5
- **T51-44 · accepted-work** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-45 · leg-earning** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-46 · hypotheses** · sweep (rule 6); (N1244) `notes.test.mjs` R11 asserts the key · Text: none · claude-haiku-5-5
- **T51-47 · steps** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-48 · citation** · (N1071, K3264) the sever-inquiry relay test confirmed against the real answer of a sever of a divided question (`target`, `from: "divided"`, `children`); sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-49 · basis-versions** · (N1215, BASIS-VERSIONS #18 J1 (4), K3697) a question resting on a leg the version grammar does not take (a standard, a calculation): R51 copies only the legs it takes and says which it left, never refusing `BASIS_VERSION_REFUSED` for the whole (BOB: check this option against "the grammar takes those legs"; a requirement's meaning); START re-measures (3,782+): past ~4,000 its `conclude` family into its own file (P6) · Text: fold · claude-sonnet-5-5
- **T51-50 · strength** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-51 · contradiction** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-52 · run-productions** · (N1070, K3264) relays inquiry R64's `DIVIDED_CANNOT_RESTRUCTURE` on a divided question, the relayed refusal named in its requirements and a test writing one; sweep (rule 6) · Text: fold · claude-sonnet-5-5
- **T51-53 · answers** · sweep (rule 6); N1068 · Text: none · claude-haiku-5-5
- **T51-99 · capture-requests** · (N1243) `plane.test.mjs` R48's fixture and ghost arm follow control-plane R105 (`BAD_FOR`) · Text: none · claude-haiku-5-5
- **T51-100 · agent-runner** · (N1243) `worker.test.mjs` R12 follows agent-worker R109 (no `RUNNER` binding); test only, no assistant work (rule 9) · Text: none · claude-haiku-5-5
- **T51-54 · agent-steps (new, by copy from agent-worker; N1205, N1218, P6, K617, K624)** · `index.mjs`'s segment driver, `performStep` and sub-sessions as a module of its own, agent-worker delegating; the name is BOB's (BOB: check; the split moves code N1220 will rewrite) · Text: the split map · first in L6 · claude-sonnet-5-5
- **T51-55 · agent-worker** · (N1205, N1218) deletes the moved code (4,421 lines before the split), delegating; nothing else (no assistant work, K3717) · Text: the split map, fold · after the new module · claude-sonnet-5-5

### L7
- **T51-56 · intent** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-57 · investigation** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L8
- **T51-58 · case-grammar** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-59 · corpus-export** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-60 · case-carriage** · sweep (rule 6); (N1244) `checks.mjs`:28–34's "group" read by key, clearing case-disclosures' two R22 tests · Text: none · claude-haiku-5-5
- **T51-61 · case-tensions** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-62 · publication** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-63 · docket** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-64 · public-read** · (N1223, PUBLIC-READ #23 J2, K3731) the `bar_detail` sentence when a bar is recorded read by key (its other English is builders' text) · Text: none · claude-haiku-5-5
- **T51-65 · project-stage** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-66 · network-notices** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-67 · case-catalogue** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-68 · case-checker** · (N1222, CASE-CHECKER #13 J1 (2), K3725) the ~60 inline sentences of `check.mjs`, `account.mjs`, `lens.mjs`, `zip.mjs`, `index.mjs` carried as data with their keys (`case-checker.*`), answer bytes unchanged (R16); BOB writes R27 before L8's START (BOB: check it is written; if not, this entry waits for it) · Text: R27, BOB's · claude-sonnet-5-5
- **T51-69 · case-import** · (its `words.test.mjs` R14, R4, R19, R21 red until this entry, K3797) (N1223, DEC-327, U343, K3729) its three `importCaseFile` departures (no part given, a part not bytes, a manifest naming no team, case and edition) by key · Text: none · claude-haiku-5-5
- **T51-70 · case-disclosures** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-71 · case-account** · (N1223, DEC-327) the keys for field-level `BAD_ACCOUNT`, four `BAD_STATEMENT_CITES`, `ACCOUNT_CHECK_UNDETERMINED`, `ACCEPT_MUST_REAUTHOR`, the counsel-matter per-case sentence, the second sentences of `MACHINE_CANNOT_CHECK_ADVOCACY` and `ADVOCACY_NOT_OWN_PROJECT`, `BAD_REVIEW_COMMENTS`, `REVIEW_COMMENTS_UNREAD`, `REVIEW_COMMENT_NOT_FOUND`, `NO_SUCH_CASE`, `NO_SUCH_RUN`, `document.mjs`' left-out count and placeholders (signed bytes, K1333: BOB: check the placeholders); `MALFORMED`, `REVIEW_COMMENTS_DECLARED` stay inline · Text: none · claude-sonnet-5-5
- **T51-72 · case-inputs** · (N1224, ACTION-REPLIES #5 J3 (2), K3738) `signing.openrequest.unread` read by key ("team"), clearing `openrequests.test.mjs`:150 (R17), `t46-words.test.mjs`:45 (R10, R12); sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-73 · case-authoring** · (N1221, CASE-CHECKER #13 J1 (1), K3725) R61's tests (`standards.test.mjs`:96, :140) expect case-checker R26's `says: {key, vars}` and read it through `word`; sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-74 · case-check** · sweep (rule 6) · Text: none · claude-haiku-5-5

- **T51-92 · review** · (N1229, K3765) R35 also answers `zone` at a member copy's top level, so its first share (no grant, no roster row yet) reads its team zone; screens-publish R27's fallback to `publishpreflight` stays until its own next entry (K3268) · Text: fold · claude-sonnet-5-5

### L9
- **T51-75 · consequences** · (N1225, K3739) its own table's sentences read by key ("team"): R25 (2 tests); sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-76 · action-holds** · (N1227, ACTIONS #21 J1 (2), K3743) `hidden.test.mjs`:64 (R2), `readers.test.mjs`:46 (R4) and any refusal it relays follow actions R106 (`NO_SUCH_ACTION`); sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-77 · action-clocks** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-78 · filings** · (N1228, FILINGS #21 J1 (3), (4), K3751) the value tokens and the packet's section titles read by key once DEC-328's batch holds them; `words-reads.json` gains `stake.inmatter`, `stake.source.action`, `stake.source.project`, `stake.unreadable`, `state.undetermined` (BOB: check the keys have landed; if not, this entry waits on them) · Text: none · claude-haiku-5-5
- **T51-79 · escalation** · (N1225) R30, R31, R33 (3 tests) by key; (N1208, EVENTS #8 J1, K3672) `structure.test.mjs`:270, :275 assert `screen.timeline.lane.ours`/`.world` (`hasWord`); sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-80 · plan-work** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L10
- **T51-81 · monitoring** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-82 · following** · (N1228, FOLLOWING #9 J1 (2), K3758) the gated-register `unscheduled` line in `follows` and the `following.why.key_repeated_row` fragments by key; its `words-reads.json` entry gains the five refusal keys `words.json` holds (BOB: check as filings) · Text: none · claude-haiku-5-5
- **T51-83 · link-sweep** · sweep (rule 6) · Text: none · claude-haiku-5-5

### L11
- **T51-84 · tasks** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-85 · action-producers** · (N1225) R24 (3 tests) by key; sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-86 · queue-producers** · (N1209) R41's item names its inviter from project-roster's read (its key only changes) · Text: none · after project-roster (L2) · claude-haiku-5-5
- **T51-87 · op-capabilities** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-88 · signin-door** · sweep (rule 6) · Text: none · claude-haiku-5-5
- **T51-89 · screens-investigate** · (N1207, DEC-308) the graph's unnamed node draws `screen.explore.unnamed.why` with entities' `{n}`; (N1226) the Person page draws an undetermined fact's `why` by `word` · Text: fold · after entities, people · claude-sonnet-5-5
- **T51-90 · plane** · (N1002, K3052) R24's copied screen list removed; the routes to `civicos-ui`; nothing else (BOB: check whether any setup-page HTML a user can meet remains, and whose module it is) · Text: fold · before legacy-ui · claude-sonnet-5-5
- **T51-93 · interface-shell** · (N1232, K3767, K3775; N1236's kit part) a kit choice control that redraws its screen on `change` with no op; `cs.act` taking an explanation key (`act.<op>.here.<place>`); `cs.strip` readings with an explanation line; `cs.field` with a placeholder; a selecting-words control for `form.choose.passage`; each screen re-points when its own entry next touches it (K3268) · Text: fold (a provided service gains options; no meaning changes) · before every screen · claude-sonnet-5-5
- **T51-94 · queue** · (N1238, K3775) R55's muted row carries its item's title, so `queue.muted.item` draws it (DEC-299 (8)) · Text: fold · claude-sonnet-5-5
- **T51-95 · instance-setup** · (N1239, K3777) the copy's `bootstrap` states `team_name`, `installed_at`, `last_used_at` and the counts of projects, documents, published cases and members as flat values (installer R63); (N1238) its `detail`/`note` strings and `setup-fleet.mjs`' three texts say "team", by key where the leaf bundle can carry one · Text: fold · provider for installer · claude-sonnet-5-5
- **T51-96 · installer-steps (new, by copy from installer; N1240, P6, K624)** · `newgroup`'s `index.mjs` split by copy (4,008 lines at T50's close); the name and the cut are BOB's at the map (BOB: check), and the map also settles R71's memory margin (hold hashes, fetch again at upload: 120 of 128 MB today) · Text: the split map · first among installer's parts in L11 (K624) · claude-sonnet-5-5
- **T51-97 · installer** · (N1240) deletes the moved code, delegating; (N1239) draws `bootstrap`'s facts from T51-95; DEC-328's `installer.fact.unknown.*` read once the design lane re-words them · Text: the split map, fold · after T51-95, T51-96 · claude-sonnet-5-5
- **T51-91 · legacy-ui** · (N1002, K3052; N794, N865, N1057) retires `civicos-ui/` and its tests (`bio-plane/test/budget.mjs`, `caseceremony.mjs`) once BOB's check finds every surface served by the T50 screens; its reds go with it; nothing is repaired · Text: fold · after plane · claude-sonnet-5-5

**Merge orders.** L2: project-roster, promotion (stamp last). L5: retrieval-browse first, then `modules.json`'s (entities before people and screens-investigate's L11 read; retrieval after the new module). L6: agent-steps first, then `modules.json`'s (inquiry-grammar before basis-versions; agent-worker after agent-steps). L11: `modules.json`'s (interface-shell before every screen; instance-setup and installer-steps before installer; plane before legacy-ui).

## Count

**100 job ids, 100 jobs** (T51-1 to T51-100): L1 10, L2 4, L3 9, L4 3, L5 17, L6 15, L7 2, L8 18, L9 6, L10 3, L11 13. Models: default 0, Haiku 73, Sonnet 27. Of the 91, 51 are bare sweeps (rule 6) and 15 more carry the clause with other entries. Three are new modules by copy (T51-26, T51-54, T51-96); one retires a legacy module (T51-91).

## BOB's acts (no job)

- **Before each layer's START:** its "Text: fold" lines folded (P18); L5's and L6's split maps reviewed; R27 of case-checker written (T51-68); the DEC-328 batch's keys checked as landed before L9 and L10 (T51-78, T51-82).
- **At the opening:** the sweep's cost told to Bob first (T50's undertaking), after a census that drops any sweep module with nothing to do; `modules.json`, `MODULE_ORDER` and `layers.md` for the two split modules; the base reds with no T50 job listed (rule 5.5).
- **At each layer close:** the generated artifacts (§14); at L1's close `rows.mjs` if setup-words' words changed.
- **N1184:** one HANDOFF to UX-DESIGN (page titles, the project page's order and tooltips, the person page's empty graph, 390 px truncation and touch targets, unnamed controls), folded when its DECs return; and the T50 walks' look findings, as rule 8.
- **Legacy-ui's retirement (deploy):** removing `civicos` Worker from biosmoke7 is a deploy act that Bob approves in session (K1716); BOB also removes `regression.yml`'s `civicos-ui` glob (`.github/` is not a module) and, after the job merges, the `legacy-ui` row of `modules.json`, `layers.md`'s legacy table and the matching `MODULE_ORDER` entry.
- **N1242 (container images pullable, K3793):** BOB chooses the registry, sets up publishing in the image workflow, and re-cuts the release so `file-scanner` and `agent-runner` install; a registry account only Bob can open is named to him as one act.
- **The meter:** Bob told T51 has opened (the opening ring) and asked nothing else.
- **stewards (N1159):** BOB's routing acts on account 20b5…7f72 as T50's; no T51 entry until the route works.

## Left out of T51 (one hard reason each)

| entry | hard reason |
|---|---|
| N1220, the multi-AI assistant (agent-runner, agent-worker, agent-harness, agent-model, ai-accounts, ai-use, ai-runs, credentials, the screens drawing it) | Bob's (P17): the AI-DESIGN lane's outcome and his rulings on it |
| N1198 (ai-accounts' 30-day sign-in lifetime), N1199 (bundler's second class, signin-door's `check`, op-declarations' check steps, instance-setup's `part_signin`) | Bob's (P17): the remote route was not pursued (K3717) and N1220 rewrites or retires the ids T50 left unmet (K3718 (2)) (BOB: check) |
| N1219 (observation-log's `read`/`disagree` fields; ai-runs R12/R24, agent-worker R114/R116, screens-inquiry R58) | Bob's (P17): T50 left R58 unmet, which N1220 rewrites (K3718 (2)); a generic run-log field may be split out then (BOB: check) |
| N842, N829 | a dependency not yet built: the interactive AI paths (N829's test set has no matters); N1220 |
| N1214 (agent-runner's image words) | no behaviour (P19): 1 of 3, by T53; waits for R35 lifted or the image next rebuilt |
| N1211 (instance-setup's delegates and nine route lines) | no behaviour (P19): 2 of 3, by T52, each when its own entry next touches it; none of instance-setup, store-door has a T51 entry |
| N1217 (run-rules, C-33.29, C-109.1, R20 "your group's Civicsmith") | a dependency not yet built: the design lane's keys; no T51 entry for run-rules (by T52) |
| N889 (notice-producers' ISO dates), N1108's events vocabularies | a dependency not yet built: the design stream's keys, and the owner composed (by T52) |
| N1074 (`build/services.md`), N898 (`mail done`), and N1073 for the four registries | none of P19's list fits (BOB: check): BOB's own between-tranche process-repository work, certified on a dry run (P3); N1073's registries follow N1074 |
| N1088 (Home's remaining DEC-218 readings) | a dependency not yet built: no provider read names them; BOB names them first (P18) |
| N1046 | a dependency not yet built: no offered script carries a `{template}` draft |
| N858, N880 | a dependency not yet built: the ACTIONS-DESIGN lane's hand-off (the lane has ended: BOB: check whether it is folded); N858's templates also Bob's (the reviewer) |
| N1110 | a dependency not yet built: the directory |
| N1231 (queue-producers' summaries and details by key), N1234's words (`refusal.ACQUIRE_TIMED_OUT`, the action kinds, the question field's label) for control-plane and screens-action, N1237 (`plan` on a project) | a dependency not yet built: the design lane's answer to the L11-close HANDOFF (`draft-handoff-ux-L11.md`); each joins its module's T51 job by CHANGE, or its START, if the DEC lands before that layer starts (K279) |
| N1236's read of the active profiles' `proceeding_kinds` | its owner (jurisdictions, L1, or affordances, L11) is BOB's at the fold (BOB: check); if affordances, a T51 entry in L11 |
| N1028 | Bob's (P17): S20, the dashboards |
| N1105 | Bob's (P17), closed (K3347): after subscription is proven live |
| N824 | Bob's (P17): "D42 - email: A", after upload is in use |
| N1094's translation part | Bob's (P17): K3190 |
| N923, stewards R7, N1159 | Bob's (P17): the stewards' address (K2799) |
| N1151 | Bob's act: registering the Logpush scope on the OAuth client (his dashboard); joins installer's next job if done first |
| N751, N853c | a measurement (N853c: OCR's accuracy on members' photos; N751: no fresh policies) |
| DEC-265's `.dated` photo date | a dependency not yet built: `photosOf` answers no date |
| N933's preparation prompt screen | a dependency not yet built: the design's screen and words (UX-DESIGN B191) |

**Applied or closed at the fold (to `archive/next-applied.md`):** N1201 (jurisdictions R93, R94 in T50-54); N1108 (affordances, standards in T50); N1094 (all but its translation part in T50); N1160, N1116, N1075, N1068, N1073, N1061, N1070, N1071 (carried above, not left out).

## Measure first

- **M-T51-1** (P6): membership, inquiry, basis-versions, control-plane, screens-inquiry, screens-investigate, retrieval and agent-worker re-measured at the opening from T50's close; a module past ~4,000 lines gets a split entry before its layer's START (BOB: check which; the plan names only the two splits above and basis-versions' conditional file).
- **M-T51-2** (P14, K3269): tokens per job and per layer beside the work done; the sweep's per-module cost counted separately, the meter at the open and close.
- **M-T51-3** (N1116): a census of inline English, `labelled`, `group` and hand-lists in each sweep module before the opening; a module with none leaves the plan.
- **M-T51-4** (N1002): BOB's check, both roles, of every surface of the old setup page and `civicos-ui` served by the T50 screens, on the T50 release, before legacy-ui's job starts.
