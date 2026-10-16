# DRAFT · T46 (and T47): a usable test instance (N896)

**Status** · DRAFT for BOB, written 2026-10-11 by a worker of BOB #156 on `tranche/T45` (P18), on Bob's direction K2803 ("the next tranche or two should get us to the point where I can actually setup and use the test instance with as complete functionality as is reasonable"). It rules nothing; §4 holds Bob's questions, the rest is BOB's (P17). Nothing was run live; reachability is read from source (§2).

**Sources:** rulings-active; manifest; `next.md`; `archive/next-applied.md` N821; `archive/next-T35.md` N559, N672; `archive/T41.md` Left out; `current.md`; `draft-T33-release.md` (runbook); `newgroup/DEPLOY.md`; Distribution v0.1 §3–§5, §8; mechanics §11; the three workflows; `dist/cut-*` logs (0.64.0–0.81.0); the rulings cited inline; `civicos-ui/`; control-plane's `/` route; setup-page; `op-declarations` `OPS`; `ux-substrate/` README, HANDOFF §0′, `screens/registry.json`.

---

## 1. Where `biosmoke7` stands, and the road to a fresh release

### 1.1 What is deployed

| part | deployed | source |
| --- | --- | --- |
| plane `biosmoke7` | **0.81.0** (plane `db904311…7ec4`, 13,904,050 bytes), deployed 2026-10-08 | K2110, from `dist/cut-0.81.0` @ `23cc7807f7` |
| what 0.81.0 contains | `main` @ `0ced0143a8`, T35's close (re-cut K2074; merged into `main` at T36's close, K2240) | K2074 |
| agent-runner (container) | 0.81.0, image `ghcr…agent-runner@sha256:a187d554…` copied by digest into `registry.cloudflare.com/20b5…/`; container app `agent-runner-agentrunner` | K2110 |
| agent-worker (with `RUNNER` binding), pdf-worker, ocr-worker, sheet-worker | 0.81.0 | K2110 |
| file-scanner (virus scan, safe view; two containers) | **never deployed**: built in T36, after the 0.81.0 cut; its images read `docker.io/civicos/file-scanner-{scanner,renderer}@sha256:UNPUBLISHED` (`file-scanner/wrangler.jsonc`:39, :45) | K2155, N773 → N780 |
| UI worker `civicos` (legacy-ui, `civicos.believeinoakland.workers.dev`, proxies `/api/*` to `biosmoke7` only, `civicos-ui/worker.template.mjs`) | **pre-T36**: not moved at K2110 ("`app.html` unchanged since 0.80.0"); `app.html` changed after, at T36-38 (`bf315323ce`, the session in a header, N711) | K2110; `git log -- civicos-ui/app.html` |
| installer `newgroup` | 0.81.0 embedded (`bd130ee0…`); asks four OAuth scopes | K2110; installer R2 now asks five (K2164) |
| live checks | `/version` 0.81.0, `whoami` member, `audit` ok (31 checked, 10 known C-18.9) with the test member credential; M-Q2 not measurable by a machine credential | K2133 |

**The gap to the tranche:** nine tranches (T36–T44) have closed onto `main` (@ `a969c420b2`, K2784) with no release since; T45 is open. Everything those tranches built (the investigation engine N820, upload N821, the AI account panel DEC-188, transcription, file-safety, the action layer's rebuild in T45, membership's project roster, the stewards' service) exists only in source. `bio-plane/package.json` still reads 0.81.0; the next release is **0.82.0**.

### 1.2 The steps to 0.82.0 and its deployment

When (BOB's, K1501, K1759, §11 as K2273 amended it): the release is cut **from `tranche/T45` after its last layer closes and before its PR to `main`**, so its version bumps and `release/` reach `main` only through T45's close; that is the T45/T46 boundary, the one release that boundary may carry. K1501's test is met: the deployment is what lets Bob's trial use and the next design stage proceed (K2803). A second release at T46's close (0.83.0) carries T46's interface work (§3); a third at T47's close only if T47 runs.

The runbook is `plan/draft-T33-release.md` §2, read with these changes since: the cut is from the tranche, not `main` (K2273); the image is built by the workflow, never in a session (rulings-active §4); file-scanner joins the fleet.

| # | step | who |
| --- | --- | --- |
| 1 | **Regression** `regression.yml` (dispatch on the cut; it now runs every module's tests from `modules.json`, K1692); triage each red against the tranche's accepted reds (K2084's form) | S |
| 2 | **Rollback targets**: `wrangler deployments list` for `biosmoke7`, agent-worker, pdf-, ocr-, sheet-worker, agent-runner, `civicos`, `newgroup` (0.81.0's are the versions K2110 deployed) | S |
| 3 | **Cut** `dist/cut-0.82.0` from `tranche/T45`: every version site `resolve-version.mjs` names at 0.82.0 (file-scanner's `package.json` and `wrangler.jsonc` among them, K2266); `migrate-released.test.mjs` `RELEASES` gains `["0.81.0", "23cc7807f7…"]` (its last row is 0.80.0, :150: biosmoke7's store was last written on 0.81.0, and nine tranches of schema change sit between); artifacts regenerated in K1540's order | S |
| 4 | **Images (N780)**: extend `agent-runner-image.yml` (or a sibling) to build file-scanner's two images (`Dockerfile.scanner`, `Dockerfile.renderer`) as well as agent-runner's, on the cut's push; publish by digest; write each digest into `fleet-member.json` and `wrangler.jsonc`. **Where** depends on Q4 (§4): GHCR is pullable by `deploy-fleet` (which copies by digest into the account's own `registry.cloudflare.com`, as K2110 did) but **not by the installer**, whose `PUBLIC_IMAGE` (`newgroup/src/index.mjs`:759) admits only Docker Hub, ECR or Artifact Registry; `docker.io/civicos/*` has no account or credential (K1893 (2)) | S (workflow); Docker Hub account: Bob (Q4) |
| 5 | **Assemble and sign** `release-assemble.mjs --version 0.82.0 --sign` (the seed in the session's environment signed 0.79.0–0.81.0); container parts for both container members | S |
| 6 | **The seven `ssh-keygen -Y verify` controls** | **Bob's approval in the session**, every time (K1910, K2109) |
| 7 | **Installer** `newgroup`: `npm run build` (embeds the signed 0.82.0), `npm test` | S |
| 8 | **Push the cut branch**, no tag (K1433) | S |
| 9 | **Deploy to `biosmoke7`**, in order: agent-runner (`deploy-fleet`), file-scanner (first time: container apps, bucket binding), agent-worker, pdf-, ocr-, sheet-worker, then the plane (`deploy.mjs`; the store migrates on boot from 0.81.0) | **Bob's approval in the session** ("Production Deploy", K1715–K1717, K2110: one approval line may name the sequence, as K2110's did) |
| 10 | **Live verification**: `/version` 0.82.0 per member from the deployments API; headline ops in `store=scratch`; `op=audit`; the signed-in checks with the test member credential (K2131's approval form, again in session) | S, Bob's approval for the credential |
| 11 | **UI worker `civicos`**: moves, since `app.html` changed after 0.80.0's cut (T36-38); `civicos-ui/deploy-ui.mjs` | Bob's approval (a deploy) |
| 12 | **Installer deploy** `newgroup`: before it, the OAuth client's registered scopes must include `connectivity-directory.bind` (R2's fifth scope, K2155, K2164; DEPLOY.md §4: "add each … BEFORE deploying"); no ruling records that dashboard change (searched) | the scope: Bob's dashboard act unless the token can edit the client; the deploy: Bob's approval |
| 13 | **Record** one ruling (version, hashes, digests, rollback targets, controls, checks); `release/` reaches `main` with T45's close | S |

**BOB's reading, reported, not asked (K2799):** a release deployed only to the project's own account, with an installer whose OAuth client is private to that account (DEPLOY.md §4), is not "a public release"; the stewards' contact address (installer R48) is not needed for it. A public release still waits on Bob's address.

**What the deploy alone does not give Bob:** every AI part refuses `AI_RUN_MODE_NOT_DEPLOYED` or `TRANSCRIBE_NOT_DEPLOYED` on any deployment, by design, until `CIVICSMITH_TEST_SET` holds matters with people's answers and each part passes its bar (`run-rules` R19, D14; N829; N865 records the effect since T41-23). See Q2.

---

## 2. What is built, and what a person can reach

**Method.** Today's interfaces are two: (1) **the setup page** (`setup-page`, served by every group's own plane at `/`, `control-plane` index.mjs:589–598): claim, sign-in, enrolment (`#invite=`, `#join=`), the healthy panel, the group's settings (who the group is, places and profiles, offices, members and keys, recovery codes, security tools, language, translations, keeping material from AI, the group's AI key), a simple intake form (`acquire`, typed bundles, `action_kind: other`, R5–R10) and the record browser (K102); (2) **legacy-ui** (`civicos-ui/app.html`, 1.7 MB, frozen by K633, touched only where Bob names it, K1849), served by the separate `civicos` dev worker wired to `biosmoke7` alone, so **a group installed by `newgroup` gets no legacy-ui**. Built screens of the new interface: **none**; the UX stream's 48 screens exist as mockups (`ux-substrate/screens/mock-*.js`, `registry.json`, the layouts page, DEC-139), and the visual language (DEC-138) as `civicsmith.css`; `bio-plane/public/` holds only `newgroup/`.

The plane declares **886 ops** (`op-declarations` `OPS`). legacy-ui names about 105 of them; the setup page about 60. The registry's 48 screens name about 300 acts, all declared except three marked `owed` (and one of those, `subscriptionsignin`, is now served: the registry is stale there). Counts per screen below are "acts reached / acts on the screen" (L = legacy-ui, S = setup page), matched by op name; legacy-ui's reach is **unverified on the current plane** (untested since K633; its three tests red, N794, N865; its bodies were written against older op shapes).

Gap kinds: **(a)** wiring only (the op exists and an existing surface needs only to call it); **(b)** a change to legacy-ui (Bob's, K633); **(c)** a new screen (the UX stream's design, built by this process); **(d)** deployment or measurement.

| area | built in the substrate (modules) | reachable today (route) | closing the gap |
| --- | --- | --- | --- |
| **Setup / installation** | installer, instance-setup, setup-page, setup-words, credentials, jurisdictions, local-facts (L1–L11) | **Yes**, on a fresh install: `newgroup` → the group's `/` (claim, name, profiles, offices, places, the AI key, security tools, hosting) · screens `install` 2/2, `setup` 11/15 (S), `group-identity` 2/2 (S), `join` 3/4 (S; `handlecheck` missing) | (d) the release (§1.2), Q4 for containers on fresh installs, the OAuth scope; (a) `groupnameset`, `groupdomainset`, `officesseed`, `ailimitset` on the page if not already called under other words (check at START) |
| **Membership & administration** | membership, project-roster, credentials, ai-use, admission | **Partial**: setup page's members and keys (`memberadd`, `memberset`, `signeradd`, recovery codes); legacy-ui's project ops (`projectinvite`, `projectjoin`, `projectfork`, owners) · `members` 5/15, `account` 1/7, `security` 3/4, `ties` 0/2, `projectai` 0/8 | (a) for an administrator's acts on the setup page (`adminendorse`, `adminremove`, `invitewithdraw`, `joinlinkenable`, `accountusesset`, `ailimitset`, `groupkeyremove`, `membercaps`): its R4 already shows "only the acts `whoami` reports"; (c) `account`, `ties`, `projectai`, project screens; (b) if legacy-ui is the vehicle |
| **Capture / intake** | capture (upload R86), acquisition, provenance, doorbell, file-safety, file-scanner, capture-requests, sources | **Partial**: URL capture (`acquire`) on the setup page and legacy-ui; **no upload** (`captureupload` on no surface; not on the registry's `capture` screen either); no doorbell page; no held-capture or open-file screens · `capture` 2/6, `held` 1/4, `archive` 1/4, `open-file` 0/5, `inbox` 1/3 (S), `doorbell` 0/1 | (c) `capture` (+ upload), `held`, `open-file`, `inbox`, `doorbell`; (d) file-scanner's first deploy (§1.2 step 9); email capture stays out (Bob, "D42 - email: A", N824) |
| **Investigation** | inquiry, hypotheses, steps, citation, strength, contradiction, investigation, explore, question-explorer, entities, events, money, calculations, workbooks, people, standards, duties, connections, retrieval | **Partial, old forms only** through legacy-ui (`search`, `cite`, `conclude`, `strength`, `entitycreate`, `progression`); the T41 investigation engine (N820) has no surface · `finder` 2/6, `document` 3/10, `find-in` 2/9, `project` 3/6, `question` 4/11, `person` 0–1/6, `timeline` 0/6, `money` 1/14, `calculation` 0/8, `explore` 1/5, `proceeding` 1/5, `standard` 0/3 | (c) for all of these; (b) only for the old forms legacy-ui already holds |
| **Analysis / questions (asking)** | answers, query-language, retrieval, question-explorer, ai-runs | **Partial**: legacy-ui `search`, `airunopen`; no Ask screen · `answers` 1/4, `assistant` 1/3 | (c) `answers`, the assistant dock; (d) AI parts barred until N829 (Q2) |
| **Publication** | case-grammar, case-authoring, case-account, review, ratification, publication, publish-schedule, public-read, docket, case-import, case-checker, network-notices | **Partial**: legacy-ui's case draft, review copy, ratify, publish, published case, verify (`casedraft`, `reviewgrant`, `caseratify`, `publish`, `publishedcase`, `verify`); the public read pages are the plane's; no docket, import, schedule or obscuring surface · `case-editor` 2/5, `review-copy` 3/3, `ceremony` 2/7, `published` 2/2, `imported` 0/4, `docket` 0/2 | (c) `ceremony` (preflight, tensions, `publishat`, `obscuremark`), `imported`, `docket`; (b) if legacy-ui's publication path is to be repaired (its `statement-ack` test is red, N794) |
| **Action** | conformance, consequences, action-grammar, actions, action-holds, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work (**rebuilt to canon v0.2 in T45**, K2780–K2791) | **Barely**: setup page's intake writes an action bundle of kind `other` (R7); legacy-ui's `actionmove`, `actioncorrespond`, `actionlaws` (pre-v0.2 shapes) · `plan` 0/9, `start-send` 0/6, `request` 1/6, `action` 2/5, `matter` 0/4, `due-date` 0/3 | (c) all of them, after T45 merges (their ops change in T45); the screens of v0.2's new constructs (holds, replies, plan work, the "where it stands" view) are not yet designed: the UX stream's (the lanes' screens are owed to it, manifest) |
| **AI assistant** | agent-worker, agent-runner, agent-harness, agent-model, ai-runs, ai-use, run-rules, skills, credentials, wizard-scripts | **Group key only**: the setup page sets the group's API key (`groupkeyset`, `groupkeyswitch`) and keep-away; a member's own key or **Claude sign-in** has no surface (K2147: "Wait for new members screen"); every AI part refused by the test bar (N829) · `connect` 0/7, `projectai` 0/8, `assistant` 1/3, `wizards` 0/6 | (d)+Bob: Q2 (the test bar); (c) `connect` (with `subscriptionsignin`, DEC-156), the dock, the wizard runner (N821's runner, screen-side); N842 (interactive `enquire`) and N852 (transcription by sign-in) are later substrate |
| **Queue, notes, wizards** | queue, tasks, queue-producers, notice-producers, action-producers, hypotheses (notes), wizard-scripts | **Partial**: legacy-ui `queue`, `tasks`, `taskresolve`, `taskforward`, `queuemute` · `queue` 5/11, `notes` 0/5, `wizards` 0/6, `home` 1/2 | (c) `home`, `notes`, `wizards`, the queue's newer acts |
| **Settings** | instance-setup, setup-page, credentials, security tools (file-safety), translations, profiles | **Yes, mostly**: the setup page is the settings surface · `translations` 1–5/5 (S), `security` 3/4 | (a) `securitymap`, explanation level (`infolevelset`, owed DEC-162) |

**Reading the table.** Setup and settings are usable once 0.82.0 is deployed. Elsewhere the substrate is far ahead of its surface: of about 300 designed acts a member reaches about 70, most through a frozen, untested interface wired to one instance. Wiring (a) closes only the administrators' and settings gaps; day-to-day work (capture, investigation, questions, publication, action, the assistant) needs a member interface (b or c).

---

## 3. Recommended scope

### T46 (opens at T45's close, on 0.82.0 deployed)

1. **The release and deploy at the T45/T46 boundary** (§1.2): 0.82.0 with N780's images and file-scanner's first deploy; `biosmoke7` updated; the UI worker and installer moved. BOB's at the cut; each deploy act Bob's in session. The live verification lists every surface failure found on 0.82.0 as T46 entries (P18).
2. **The member interface's first part, as Q1 decides.** On the recommendation (Q1 = B): a new layer-11 interface module (BOB names it and places it after `setup-page`; K617's bound means several modules: the shell and the screens split by area, BOB's packaging), served by the group's own plane, never from outside (N559, principle 9.6), built from the layouts design (DEC-139), its words (`words.json`, DEC-179) and the visual language (DEC-138, N559), every act calling a served op. T46 carries the shell (frame, path N672, rail, sign-in from the setup page's session, the explanation levels as far as built ops allow) and the screens of Bob's first journeys: `home`, `members`, `account`, `connect` (with `subscriptionsignin`: Bob's own Claude sign-in first appears here, as K2147 ruled), `capture` (with upload), `held`, `open-file`, `inbox`, `finder`, `document`, `find-in`, `project`, `question`, `answers`, the assistant dock, `queue`, `notes`. The registry's acts are its test list (wizard-scripts R13 registers it).
3. **Setup-page wiring (a):** the administrators' acts above, `handlecheck` at enrolment, `securitymap`; setup-page and instance-setup jobs, BOB's wording.
4. **The registry and words, kept in step:** `captureupload` on `capture`, `subscriptionsignin` re-pointed from `owed`: a HANDOFF to UX-DESIGN (its files are its own, manifest), not a precondition of any substrate stage (K1430).
5. **Q2's answer** applied to `run-rules` and `ai-runs` (if A or B), so the assistant can be tried.
6. Carried T46 entries as usual (`next.md`); the action lanes' folds land in T45, so T46's action entries are only what T45 leaves.

### T47 (if needed; on 0.83.0 deployed at T46's close)

The rest of the screens: investigation tools (`person`, `timeline`, `money`, `calculation`, `explore`, `proceeding`, `due-date`, `standard`), publication (`case-editor`, `review-copy`, `ceremony`, `published`, `imported`, `docket`, `doorbell`), action (`plan`, `start-send`, `request`, `action`, `matter`, and the v0.2 constructs once the UX stream has drawn them), `wizards` with the runner (N821's runner, N847's pointer), `ties`, `projectai`, `translations`, `security`; then a release at T47's close.

**Hard reasons that stay (named):** email capture (Bob, N824); interactive `enquire` and the assistant's interactive drafts (N842, needs N829); transcription by sign-in (N852, after N780's images are live); legacy-ui's reds (N794, N865) unless Q1 = A or C; v0.2 screens the UX stream has not drawn.

**Pause rule:** both tranches run under K2341's 80% pause and the account-switch rule; Bob's meter was 43% at T45's L2 (K2798).

---

## 4. Questions only Bob can answer

### Q1 · Which interface do you use for the trial? (UX; K633, K1849, K2147)

*Why it is yours:* it is UX, and two options touch rulings of yours: legacy-ui stays frozen until the new interface replaces it (K633, K1849), and your own Claude sign-in waits for the new member screens, with no interim control (K2147).

*The situation:* a group's own Civicsmith shows only the setup page (settings). The old interface (legacy-ui) reaches about 100 ops in older forms, works only against `biosmoke7`, is untested since K633, and predates every design ruling from DEC-96 on. The new design (your layouts page: 48 screens, their words and visual language) is drawn but not built.

- **A · Extend the old interface.** You name legacy-ui for repair and extension (current op shapes, its three red tests, upload, the AI account, the newer acts). Fastest to something clickable (T46). But it is the old design: using it teaches little about the screens the dashboards would sit over; the work is thrown away when the new interface replaces it; it serves `biosmoke7` only.
- **B · Build the designed screens now (recommended).** This process builds your layouts page's screens as the real interface, served by each group's own Civicsmith: the shell and the everyday screens in T46 (§3), the rest in T47. You try the design you have been reviewing, on any instance; your Claude sign-in arrives in it as K2147 ruled; the screens below the future dashboards are kept when the entry points are recentred. Slower: the first screens are usable at T46's close, not its opening.
- **C · Both.** A minimal legacy-ui repair in T46 for immediate use, B through T46–T47. Most use soonest, most work, and part of it discarded.

*Recommendation:* **B.** Your aim is to learn which recentering suits Civicsmith; that is best learned on the design the recentering will change, and none of B's work is lost when the dashboards come. Until T46's close you can use the setup page on 0.82.0 for setup and settings.

### Q2 · May the test instance run the assistant before Civicsmith's test bar is held? (D14; run-rules R19; N829)

*Why it is yours:* your D14 ruling makes every AI part (each mode, exploring, drafts, transcription, reading) deployable only after it passes its bar on Civicsmith's test investigations, real public matters with answers written by people. The set ships with no matters, so the assistant refuses everything on every deployment.

- **A · Write the first matters now.** People (you, or people you name) write a few matters and their answers as the set's version 2; parts that pass their bars open everywhere. Right, but slow: it needs your time or others' before the assistant can be tried.
- **B · A test-instance exception (recommended).** An instance set by its deployer (never by the installer, never in a group's install) as a test instance runs the AI parts without the bar; every AI output there says, in plain words, that this part has not yet passed Civicsmith's test bar. The bar stays in force for every group.
- **C · No assistant in the trial.** Try everything else; the assistant waits for A.

*Recommendation:* **B**, for `biosmoke7` and the instance you set up (Q5), with A started in parallel so the bar can be held before any public release.

### Q3 · Paying for the assistant during the trial (money; K1547, K1755)

- **A · Your own Claude sign-in (recommended once B of Q1 lands)**: as a member, through the new `connect` screen; it is also how M-Q2 is finally measured (K2133, K2134).
- **B · A group API key** you fund (Console credit), set on the setup page today.
- **C · Both**, B first (usable on 0.82.0), A when the screen arrives.

*Recommendation:* **C** if you want the assistant before T46's close; else **A**.

### Q4 · Where the container images are published (an account; K1893 (2))

The assistant's runner and the file scanner run as containers. For `biosmoke7` this process can copy images into the Cloudflare account's own registry (as for 0.81.0, K2110), with no act of yours. A group's install by the installer can pull only from Docker Hub, Amazon ECR or Google Artifact Registry; there the images have no home yet.

- **A · A Docker Hub organisation `civicos` (recommended)**: you create it (free for public images) and add an access token to the repository's GitHub secrets; the workflow publishes there (`docker.io/civicos/...`, the names the tranche already uses).
- **B · Google Artifact Registry**: a Google Cloud project with billing, a public repository.
- **C · Not yet**: `biosmoke7` gets its containers by copy; a fresh install works without the assistant's own-sign-in container and the file scanner, and says so per part.

*Recommendation:* **A** if you set up a fresh instance (Q5 B or C); otherwise C is enough for now.

### Q5 · Which instance you set up and use (values: your test data and your own setup experience)

- **A · Update `biosmoke7` in place.** It keeps its record and test data (and its ten known audit findings); you sign in as a member or administrator it already holds; there is no setup to experience.
- **B · A fresh instance, installed by you with the installer** (a new short name in the same Cloudflare account): you go through install, claim, naming, members and settings yourself, on a clean record.
- **C · Both (recommended):** `biosmoke7` updated as the release's verification instance (BOB's, §1.2), and your own trial on a fresh instance you install.

*Recommendation:* **C**: it gives you the real setup experience you asked for while keeping `biosmoke7`'s history for verification. With Q4 = C, your fresh instance has no file scanner or own-sign-in container until the images are published.

### Acts only you can do, wherever the answers land
- Each deploy act and the signature controls, approved in the session that runs them (K1715–K1717, K2109, K2110).
- Adding `connectivity-directory.bind` to the installer's OAuth client in the Cloudflare dashboard, unless the project's token can (§1.2 step 12).
- Q4 A's Docker Hub organisation and token; Q3's credit or sign-in.
- The stewards' contact address before any public release (K2799), not before this one.

---

## 5. Risks and unknowns

- **Migration across nine tranches.** `biosmoke7`'s store is 0.81.0's; `migrate-released` lacks a 0.81.0 row (§1.2 step 3). A failure is caught by the regression before any deploy; rollback targets are recorded first.
- **legacy-ui after the update.** The deployed `civicos` worker predates T36-38; 0.82.0's credential rules (`CREDENTIAL_IN_ADDRESS`, admission R20) may refuse its older forms until it moves (step 11). Its reach in §2 is by op name only; under Q1 = B, BOB does not repair it (K633), and it stays as Bob left it.
- **The registry's freshness.** T45's v0.2 rebuild changes action-layer ops and adds constructs with no screens; those wait on the stream's drawings (K1430).
- **Size of B.** About 48 screens and 300 acts; BOB splits by area (K617) and measures each START's set (K2053).
