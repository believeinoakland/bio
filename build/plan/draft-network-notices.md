# network-notices — requirements (DRAFT for T23)

**Status** · DRAFT by a read-only worker for BOB #90, 2026-10-01, on `tranche/T22`, for BOB's review and then Bob's approval as requirements (P5; a new product module, P4, P17). Source: DEC-111 (`docs/development/DECISIONS.md`:1791–1809, its owed line :1809), folded into `BIO_Publication_v0_1.md` §5B (:315–333); K1019 (`build/rulings.md`:1021: "DEC-111 agreed (a new layer-8 module after public-read, drafted during T22, built in T23)"); `build/plan/t22-check.md`:53 (H21: "it needs a home, and the only existing one is publication (4,408 lines, P6); a new product module is Bob's to add") and :120. Nothing in the tree implements any of it. Every Provides line is new work.

**Placement.** Layer 8, Publication (`build/layers.md`:14, contract "What the group stands behind leaves one way"). A notice is an outward act of the group, signed as a case is, and served on the public read path, so it belongs in layer 8.
- **Position in the total order:** directly after `project-stage` and before `ratification`. Layer 8 becomes `case-grammar, publication, public-read, project-stage, network-notices, ratification, case-authoring, review`. In `modules.json` it is the new entry between `project-stage` (line 62) and `ratification` (line 63), so 0-based index 58, and every later index moves down one.
- **Why after `project-stage`, not directly after `public-read`:** "while the project is open" and "closing its project says so" (§5B) need the project's `closed` stage, and `project-stage` R1/R2 is the one reader of it. K1019's "after public-read" still holds.
- **Why before `ratification` and `case-authoring`:** the publish act has to open the seals (R14) and write the notice reference into the case (R16). Those modules come later in the order, so they can use this one (P4).
- **`uses`** (all earlier): `record-grammar`, `record-core`, `signatures`, `membership`, `credentials`, `promotion`, `host-governor`, `publication`, `public-read`, `project-stage`.
- **Size (P6):** an estimate of 1,200–1,800 lines, well under 4,000.

## Public

### Purpose

This module lets a project's owner tell the network that the group is working on something, and keeps that notice honest. It holds the "working on" notices: each is prepared from a real project, signed by one of the project's owners as a published case is signed, and published at the group's own public address. It computes the notice's activity level from members' own work and re-signs that level monthly. It seals each week of a project's work under an independent timestamp, and opens the related seals when the project publishes. It also serves the group's public signing keys without names. It sends nothing anywhere. Directories read what it publishes.

### Provides

Terms.
- A **notice** is one "working on" statement of one project, in the format `civicos-working-on/1`.
- A **revision** is one signed version of a notice.
- A **week** is a UTC ISO week, Monday 00:00Z to Sunday 24:00Z.
- A **counted week** is a week with at least one **member act** on the project (R7).
- The **activity window** is the 13 complete weeks before a revision's `as_of`.
- A **seal** is the digest that commits to one week's member acts on one project (R12).

**prepareNotice({project, wording, body?, matter?, since, collaborate, by, viewer}) → `{ok, notice, statement, digest, warning, expires}`** (`op=noticeprepare`; member session; writes nothing)
- **R1** Refusals, in order, each writing nothing *(not yet met: T23)*:
  - no `project` gives the required-argument refusal;
  - a project absent or invisible to `by` gives `membership`'s `noSuchProject`, identically;
  - a machine or AI credential, or an operator token, gives `MACHINE_CANNOT_POST_NOTICE`;
  - `by` not an owner (`membership.isProjectOwner`, its R54) gives `NOTICE_NOT_THE_OWNER`;
  - a project at stage `closed` (`project-stage` R2) gives `NOTICE_PROJECT_CLOSED`;
  - no producing-group slug recorded gives `NOTICE_NO_GROUP_SLUG`, since there are no anonymous notices;
  - `wording` empty, multi-line or over 280 characters, or `body` or `matter` multi-line or over 120 characters, gives `NOTICE_WORDING_MALFORMED`;
  - `since` not a date gives `NOTICE_SINCE_MALFORMED`;
  - `since` earlier than the project's creation date (the UTC date of the first entry of its history) gives `NOTICE_SINCE_BEFORE_PROJECT`, naming that date;
  - `since` later than today (UTC) gives `NOTICE_SINCE_IN_FUTURE`;
  - while the project already has an open notice, `NOTICE_ALREADY_OPEN` names it (a change is a new revision, R5).

  Each refusal carries a catalogue row (DEC-49).
- **R2** Otherwise it answers the notice that would be published and changes nothing *(not yet met: T23)*:
  - `notice` is canonical JSON (`record-grammar`'s) with exactly the fields R3 names;
  - `statement` is `signatures.noticeStatement(noticeId, revision, sha256(notice))`;
  - `digest` is that SHA-256;
  - `warning` is the fixed outward-act sentence: the public, including anyone being examined, will see it, and stopping later will not unsay it;
  - `expires` is 60 minutes on.

  The answer is identical, byte for byte, for the same inputs within the same `as_of` day.
- **R3** A notice carries these fields and nothing else *(not yet met: T23)*:
  - `format` (`civicos-working-on/1`);
  - `group` (the producing group's slug);
  - `notice` (an opaque id minted for the notice, never the project's id);
  - `revision` (1, 2, …) and `previous` (the prior revision's digest, or null);
  - `wording`, `body` and `matter` as the owner gave them (absent ones omitted), never filled in from the project's contents;
  - `since` and `posted` (dates);
  - `activity` (R8);
  - `collaborate` (true only if the owner chose it), and with it the group's doorbell address;
  - `cases`, the public reference (case id and edition) of every case edition the project has published (`publication`'s `cases.project_id` and `published_cases`, under its R40);
  - `seals`, each counted week's `{week, seal, timestamp_sha}` (R12);
  - `status` (`open`, `stopped`, `closed`, `lapsed`) and `handoff` (R10);
  - `others_welcome`, a fixed sentence.

  No member's name, handle or id appears in a notice.

**postNotice({digest, signature, acknowledged, by}) → `{ok, notice, revision, published_at}`** (`op=noticepost`; member session; mutating)
- **R4** Refusals, in order, each writing nothing *(not yet met: T23)*:
  - R1's caller refusals, re-checked at this instant;
  - `acknowledged` not exactly `true` gives `NOTICE_WARNING_NOT_ACKNOWLEDGED`;
  - no prepared answer with this `digest` from `by`, or one past `expires`, gives `NOTICE_STALE` (prepare again);
  - a signature that `signatures.verifySshsig` rejects in namespace `NS_NOTICE` over exactly `statement`, against `credentials.attestingKeys()` (its R11) restricted to the keys registered to `by`, gives `NOTICE_SIGNATURE_REFUSED` with the verifier's reason.

  Otherwise the revision is stored with its armored signature and its first-published instant, and it is served by R17 from that instant on.
- **R5** A change to an open notice (wording, body, matter, `collaborate`, or a later `since` within R1's bounds) is a new revision through R1–R4. It names the prior revision in `previous`, and the prior revision stays served. A revision never changes `group` or `notice` *(not yet met: T23)*.

**The activity level** (§5B "The activity level"; the method published as R9)
- **R6** The level is one of five words, decided by the number of counted weeks in the activity window: `Very active` (10–13), `Active` (7–9), `Some work` (4–6), `Quiet` (1–3), `Dormant` (0). The cut-offs are this module's constants *(not yet met: T23)*.
- **R7** A **member act** is a write to one of the project's bundles (`record-core.listBundles({project})`) whose history entry names a member author: an identity outside `record-grammar`'s non-member set, and a writer that is neither `mechanical` nor an AI run *(not yet met: T23)*.
  - A member's adoption of a machine draft counts; the draft does not.
  - The number of acts in a week never changes the level; only whether the week has one.
- **R8** `activity` is `{level, weeks_counted, window: 13, as_of, method}`. `as_of` is the date it was computed, and `method` is the version of R9's published method *(not yet met: T23)*.
- **R9** `activityMethod()` answers, without a credential, the method as fixed text with its version: the window, the cut-offs, R7's definition of a member act, and what is never counted. A change to the method is a new version, and an older revision keeps naming the version it was computed under *(not yet met: T23)*.

**Keeping a notice current, stopping it, and lapse**
- **R10** `stopNotice({notice, handoff?, by})` (`op=noticestop`; owner only, R1's caller refusals) and the project's close (`project-stage` stage `closed`) each end the notice with a final revision. That revision has `status` `stopped` or `closed`, and `handoff` is the owner's optional note (single line, at most 280 characters; it may name another group or an open lead). It is signed as R4 signs. A close whose final revision no owner has yet signed is served as R17 states, with `pending_final: closed`. A stopped or closed notice stays served and is never deleted *(not yet met: T23)*.
- **R11** While a notice is open, its activity is re-computed and re-signed once each calendar month (see "Open for Bob", question 1, for whose key). A notice whose level has been `Dormant` for a full month after a monthly revision lapses: a final revision with `status` `lapsed` is published and served, unless an owner renewed it (a new revision, R5) or stopped it first. The lapse also goes into the group's record *(not yet met: T23)*.

**Seals: proof of activity** (§5B "Proof of activity")
- **R12** After each week ends, for every project not `closed`, this module commits to that week's member acts (R7) *(not yet met: T23)*:
  - each act is a leaf: the bundle id, the bundle digest after the act, the act's operation and its instant, never the author, each with its own random 256-bit salt;
  - the project's week **seal** is the SHA-256 Merkle root over those leaves, padded to a fixed size with salted dummy leaves, so the root reveals neither the acts nor their number;
  - one RFC 3161 timestamp per instance per week is requested (`signatures.timestampRequest`, `TSA_ENDPOINTS` in order, through `host-governor`) over the root of all the week's project seals, and the token is kept;
  - a week with no member act has no seal;
  - a week whose timestamp failed after every authority keeps its seal, marked `untimestamped`, and is still counted.
- **R13** Salts and leaves are never served, exported or put in any answer until opened (R14). A seal reveals nothing to anyone holding candidate documents *(not yet met: T23)*.
- **R14** `openSeals({case, edition})` (called by the publish act of `case-authoring` or `ratification`; see "Open for Bob", question 2) publishes, for each sealed week of the case's project, the leaves for acts on bundles the edition publishes, with their salts, their Merkle paths to the project seal and on to the week root, and the timestamp token. Nothing else of any week is revealed. The opening is idempotent per (case, edition, week), and it is listed on the notice's next revision and in R17 *(not yet met: T23)*.
- **R15** `verifyOpening(opening)` is pure and answers whether the leaves hash to the sealed root and the token is bound to it (`signatures.parseTimestampResponse`). So a stranger, or this module's own tests, can check an opening without this instance *(not yet met: T23)*.

**The project reference a later case carries**
- **R16** `noticeReferenceOf(project)` answers the open or most recent notice id of a project, or null. `case-authoring` writes it into the case document so that a case and the notice are visibly the same work (owed by DEC-111; a fold to `case-grammar` and `case-authoring`) *(not yet met: T23)*.

**Public reads** (no credential; served on the group's public address through `public-read`'s registration, R18 of the public-read fold below)
- **R17** `noticesPublic({after, limit})` answers every revision of every notice ever published, in (notice, revision) order. Each comes with its notice JSON, its armored signature, its first-published instant and any openings (R14). It answers at most `limit` (200 by default, 1,000 at most), with `truncated` and `next`. Nothing is ever removed from it. A notice still at R1's prepared stage is never in it *(not yet met: T23)*.
- **R18** `groupKeysPublic()` answers the group slug and the public signing keys that can sign a notice or a case: every key that `credentials.signerList` (its R8) shows registered to a member who owns a project now, or who signed a published edition or a notice. Each comes with `status` (`attests`, or `revoked` with its date) and the date it was first listed, never the member's name, handle or id. A revoked key stays listed, so older signatures can still be checked *(not yet met: T23)*.

**Member reads**
- **R19** `noticesOf({project, viewer})` (`op=notices`) answers, to a viewer who can see the project, its notices and revisions, the next monthly re-sign date, the lapse date when one is running, and its sealed weeks (week, seal, timestamped or not), never the salts *(not yet met: T23)*.
- **R20** `directorySubmission({case, edition, viewer})` answers prefilled fields for the network directory after publication (the case's public link, title and summary, and the group slug), for a member to copy or open. It sends nothing *(not yet met: T23)*.

## Private

### Uses
- `record-grammar`: canonical JSON, `createSha256`, the non-member author set (R7), the id grammar.
- `record-core`: `transact`, `listBundles({project})` (its R35), the history and manifest read (its R15, R16, R42; R7, the creation date in R1), `mintOpaqueId` (its R6; notice ids), `stampInstant` and `instantOrder` (its R47, R48), `declarePurge` (its R21), `registerCounts` (its R63).
- `signatures`: `verifySshsig` (its R2), `timestampRequest` (R15), `parseTimestampResponse` (R17), `TSA_ENDPOINTS`, `TSA_CONTENT_TYPE`, `TSA_ACCEPT` (R20, R21), and **new**: `NS_NOTICE` and `noticeStatement(noticeId, revision, sha)` (fold below).
- `membership`: `isProjectOwner` (its R54), `projectOwners` (its R65), `sight` (its R44), `noSuchProject`.
- `credentials`: `attestingKeys` (its R11), `signerList` (its R8).
- `promotion`: the `producingGroup` fact (its R40, registered by `instance-setup` R1). If that fact cannot be read from layer 8, BOB places the slug reader earlier (Suggestions).
- `host-governor`: `governedFetch` (the timestamp authorities).
- `publication`: `cases` and `published_cases` under its R40; `publishedEditionsOf` (its R37) and `caseCitedParts` (its R41), for R3 and R14.
- `public-read`: `publishedCase` (its R3), and its new public-read registration (fold below).
- `project-stage`: `projectStage` (its R1, R2: `closed` and its `since`).

### Invariants
- **R21** Only an owner's own signature publishes a revision. No machine, AI run or administrator can post, re-word or back-date a notice for a project they do not own *(not yet met: T23)*.
- **R22** No answer of this module names a member: there are no names in notices, keys, leaves or openings *(not yet met: T23)*.
- **R23** A published revision is never altered or deleted. Purge clears this module's tables only in a whole-store purge; a bundle purge leaves a published notice standing *(not yet met: T23)*.
- **R24** `since` is never earlier than the project's creation and never later than the day it was signed, in every revision *(not yet met: T23)*.
- **R25** The assistant's work never counts toward activity, and volume never moves the level *(not yet met: T23)*.
- **R26** No place is named in this module's behaviour or outward text (`layers.md`, "No jurisdiction in the product") *(not yet met: T23)*.
- **R27** This module makes no outbound call except to the timestamp authorities, and it pushes nothing to any directory *(not yet met: T23)*.

### Satisfies
- `docs/architecture/BIO_Publication_v0_1.md` §5B (all of it, the CivicOS half), §3 rule 10 (the credential-free public read), §5 (DEC-80: an owner signs in the browser), §7 (the slug is the group's public identity).
- `docs/architecture/BIO_Complete_Roadmap_v5.md` §11 "Inter-group awareness".
- `docs/architecture/BIO_Design_Requirements_v2.md` §3, §9, §10, §13, §14.
- DEC-111; DEC-49 (catalogue rows); DEC-80.

### Suggestions
- **Folds in other modules** (each a requirement change, cited to DEC-111 and K1019):
  - `signatures` (layer 1): R37 `NS_NOTICE = "bio-working-on"`, distinct from the other namespaces (R1's rule); R38 `noticeStatement` giving exactly `` `bio-working-on ${noticeId} ${revision} ${sha}\n` ``. The offline signer page and the browser signer sign it.
  - `public-read`: R18, a later module registers once at start named credential-free reads served on the public path (K31 pattern, like its R8); it is unregistered, it says so.
  - `case-grammar` and `case-authoring`: the notice reference in the case document (R16); the publish act calls R14.
  - `scheduler`: weekly `notice-seal` and monthly `notice-resign` consumers.
  - `queue-producers`: to-dos for a re-sign due (if Bob chooses option B in question 1), a lapse a week away, and a close awaiting its final revision.
  - `control-plane` and `op-declarations`: `op=noticeprepare`, `op=noticepost`, `op=noticestop`, `op=notices`, and the public reads.
- **Two-step signing:** the same pattern as case ratification: prepare, sign in the browser, post.
- **Tables:** `notices`, `notice_revisions`, `week_seals` (leaves and salts held privately), `week_roots` (token), `seal_openings`. All are declared to purge, whole-store only (R23).
- **Weeks before T23 ships cannot be proven.** A notice's `seals` begins at the first sealed week, and its first revisions show fewer timestamped weeks than counted ones. That is honest and needs nothing more.
- **Tests:**
  - each R1 and R4 refusal, with a negative control;
  - a back-dated `since` and a future `since`;
  - the cut-offs at 0/1, 3/4, 6/7 and 9/10;
  - an AI-only week counting zero;
  - a Merkle opening that verifies, and a tampered leaf that fails;
  - that no member id appears in any public answer (a sweep over every answer).

## Open for Bob (meaning and UX; each with a recommendation)

1. **Whose key re-signs the monthly activity level.** DEC-111 says both "signed by a project owner as a published case is signed" and "re-signed monthly". The owners' keys are browser-held (DEC-80), so the copy cannot sign with them unattended.
   - *Option A:* the owner signs the notice (who, what, since). Each month the copy signs a short activity statement that names the notice's digest, using the instance's own signing key (`provenance` R34 already holds one per instance), and that key is listed on the public page as "this copy's key".
   - *Option B:* the copy prepares the monthly revision, and an owner signs it from a to-do. A notice nobody re-signs shows its last level with its date.
   - **Recommended: A.** The level is the copy's computation, not the owner's statement, so the copy's key says truthfully who computed it. An active group's notice also never goes stale through a missed chore. A false level is no easier than the honest limit already admits. Under A, R11's re-sign uses the instance key and R18 also lists the copy's key.
2. **Opening the seals at publication.** Either automatic, or the owner's choice at signing.
   - **Recommended: automatic.** It is stated on the ceremony's "What becomes permanent" step: "The sealed weeks of work on the material this case publishes will be opened, so anyone can confirm they were real." Only the acts on published material are revealed (R14). Declining would leave a notice at "Reported" for no gain.
3. **Third and later notices with no published work.** The network site shows at most two (§5B, network half). The copy can refuse a third, or warn and post it.
   - **Recommended: warn, not refuse.** The cap is the directory's policy, not CivicOS's. The copy says before signing: "Directories may show only two open notices from a group that has not yet published."
4. **The act's screens and words** (UX):
   - where "Tell the network" sits on the project;
   - the warning's exact wording (R2);
   - how the five levels and "Others welcome" read;
   - the stop and handoff form;
   - the after-publication links out and the prefilled submission (R20).

   **Recommended:** offer "Tell the network" only on the project page to owners. Show the notice exactly as a directory will show it before signing. The warning reads: "Anyone, including whoever you are examining, will see this. Stopping later will not unsay it."

Decided by BOB (P17; for the rulings, reported to Bob):
- **The module:** id `network-notices`, its position and its `uses`.
- **Weeks and cut-offs:** UTC ISO weeks; the cut-offs as DEC-111 proposed them.
- **Member acts:** R7's definition (member-authored writes on the project's bundles, with machine-draft adoption counting).
- **Notice id:** an opaque notice id as the public project reference, never the internal project id.
- **Seals:** padded Merkle seals and one instance-wide timestamp per week, sealing every open project whether or not it has a notice, so proof exists for weeks before a notice is posted. The timestamp authority sees only a digest.
- **Keys:** revoked keys stay listed.
