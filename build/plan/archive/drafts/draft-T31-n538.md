# Draft: N538, DEC-124's development share (CivicOS → Civicsmith), for T31

**Status** · DRAFT by a drafting worker for BOB, 2026-10-03, on `tranche/T30` (up to date with `main`), for BOB's review (K1362). Read: `build/modules.json`, `build/requirements/README.md`, every `build/requirements/<module>.md` naming CivicOS or civicos, DEC-124 (`docs/development/DECISIONS.md`), `BIO_Publication_v0_1.md` §7's RULED passage, `build/manifest.md`, `plan/next.md` N538. The code was searched with `git grep -i civicos` over every product path and test path in `modules.json`. Each hit is given to its most specific owner, so `pdf-worker/test/pagepixels-corpus.probe.mjs` counts once, under `pdf-pixels`, and `publication/worker.mjs` counts under `public-read`. Not renamed, and listed only as kept: BIO, Believe in Oakland, the `bio-*` signature namespaces, `civicos-ui/` (legacy-ui, Bob's UX stream: a count only), historical records and Bob's quoted words. Addresses are marked **after the domains**.

## 1. Summary

- **Hits outside `civicos-ui/`:** 237 lines. 139 are in product source and 98 in tests.
  - Of the source lines, 99 carry the name or a label. The other 40 only name the path `civicos-ui/…` in a comment; that folder is not renamed, so they stay.
  - Of the test lines, 84 carry the name or a label and 14 are `civicos-ui/` path comments.
  - Two lines hold many hits each: `newgroup/src/release.mjs:3` has 33 and `case-checker/program.mjs:4` has 3. Both files are generated.
- **legacy-ui (`civicos-ui/`)**, count only: 89 lines in 29 files. "CivicOS" itself appears on 9 lines in 5 files. Nothing is proposed for it.
- **Requirements:** 18 files mention the name.
  - 13 R-ids change: acquisition R9, R16, R24; capture-requests R14; case-checker R16; docket R6; installer R22; instance-setup R8; network-notices R3, R12, R13; signatures R32; strength R15.
  - 11 lines outside an R-id change: interface headings, Terms, Uses, Satisfies, Suggestions and intros.
  - 5 files stay unchanged: docprofile, site-profiles, skills and promotion name only `civicos-ui/` paths, and bundler R17 names a worker (after the domains).
- **Signed or hashed labels found:** 10 type labels or hash tags, all in two modules (`network-notices` 9, `docket` 1).
- **Other identifiers that need care:**
  - an HKDF salt (`capture-sources`);
  - a well-known path (`instance-setup`);
  - a feed URN (`docket`);
  - a stored enum value, `ua_mode` `civicos` (`capture-requests`).
- **One hazard that is not a label:** the complete edition's rendered words (`case-grammar` and `strength`) are re-rendered and compared byte for byte by `case-checker` R10 (§3.4).
- **Modules with code or test changes**, by layer:
  - L1: signatures, pdf-pixels and ocr-worker (probe constants only); bundler after the domains.
  - L3: acquisition (provider), capture; host-governor, provenance and attestation only optionally (test samples).
  - L4: reading-pipeline (a probe constant).
  - L6: capture-requests, strength, skills.
  - L8: case-grammar, case-checker, docket, network-notices.
  - L10: monitoring.
  - L11: instance-setup, installer.
- **Requirement text only:** host-governor (L3), capture-sources (L3), case-import (L8).
- **Comments only, no change:** record-grammar, docprofile, membership, promotion, content, bias, observation-log, query-language, run-rules, agent-worker, public-read, review, action-grammar, affordances, queue, queue-producers (tests: `ua_mode` values, §2 L11), admission, control-plane.
- **Not in product code:** `civicos.believeinoakland.workers.dev` appears in no product file. `civicos-process` appears only in `.claude/` (not_product: `.claude/hooks/session-start.sh:59`, `.claude/settings.json:11,12,22`). The UI worker's script name `civicos` is in bundler (§2 L1). All of these are after the domains.

Kinds used below:
- **VISIBLE**: text a member or the public sees, including user agents and record text.
- **LABEL**: a type label or domain tag inside signed or hashed bytes.
- **IDENTIFIER**: a code name, stored enum value, salt or path.
- **ADDRESS**: a host or worker name.
- **COMMENT**: a historical note or a comment.

## 2. Per module, in `modules.json` order

### L1 · record-grammar
(b) `labels.mjs:203` COMMENT (`civicos-ui/app.html`). (c) None.

### L1 · signatures
(a) **R32**
- Current: "The page's visible text names the product CivicOS, never BIO (`layers.md` rule 4)"
- Proposed: "The page's visible text names the product Civicsmith, never BIO (`layers.md` rule 4; DEC-124)". The rest of R32 is unchanged: the `BIOKEY…` prefixes, the `bio-release`/`bio-ratify` namespaces and the download filename stay.

(b) All VISIBLE:
- `src/sign-release.html:3` `<title>CivicOS signing keys</title>`
- `:14` "OpenSSH and no CivicOS code:"
- `:85` `<h1>CivicOS signing keys</h1>`
- `:291` "that does not look like a CivicOS private key"
- `:398` "When CivicOS goes to real groups"
- `src/signpage.mjs:2`, the same five strings. It is generated from `sign-release.html` by `scripts/embed-signpage.mjs`.

(c) Replace all five in `sign-release.html` with Civicsmith, then regenerate `signpage.mjs` with `embed-signpage.mjs`.

### L1 · bundler
(a) **R17** "refuses (exit 3) a slug that names a non-plane worker (`civicos`, `pdf-worker`)". This is an ADDRESS (the UI worker's script name): **after the domains**, no change now.

(b)
- `scripts/deploy.mjs:106,118`: ADDRESS (the `civicos` worker); `:119` COMMENT (`civicos-ui/deploy-ui.mjs`).
- `scripts/deploy-fleet.mjs:7,81`: ADDRESS (refuses `civicos`); `:88` COMMENT (path).
- `scripts/provenance.mjs:14`: COMMENT.

(c) None now. The worker name moves with the address, after the domains.

### L1 · docprofile
(a) The Suggestions line ("The `legacy-ui` edge", `civicos-ui/app.html`) stays.
(b) `doctypes/meeting-minutes.mjs:81`, `test/doctype-breadth.test.mjs:2,13` and `test/staff-directory.test.mjs:2,21` are all COMMENT (path).
(c) None.

### L1 · pdf-pixels
(b) `pdf-worker/test/pagepixels-corpus.probe.mjs:53` `const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; …)"`. VISIBLE: it is a user agent the probe sends, a hand copy of acquisition R24's form.
(c) Change it to `Civicsmith/…`. Optional: it is a probe, not a test, but it is sent to real hosts.

### L1 · ocr-worker
(b) `bio-plane/test/ocr-measure-probe.mjs:50`, the same UA constant. VISIBLE.
(c) As pdf-pixels.

### L2 · membership
(b) `bio-plane/test/members.test.mjs:5,100,418`: COMMENT (path). (c) None.

### L2 · promotion
(a) **R50**'s `civicos-ui/check-*.mjs` and `civicos-ui/deploy-ui.mjs` are paths and stay.
(b) `src/gate.mjs:342` COMMENT. `test/system/row-census.mjs:7,18` COMMENT; `:32,33,35` IDENTIFIER (regexes over the `civicos-ui/` paths, which stay).
(c) None.

### L3 · host-governor
(a) Satisfies, line 78: "the honest CivicOS agent by default" → "the honest Civicsmith agent by default". This is a paraphrase of SOURCE-ACCESS.md, not a quotation.
(b) `test/m/host-governor/governor.test.mjs:346,351` `userAgent: "CivicOS/1 (+https://x)"`. This is an arbitrary sample string the test chose; nothing in the module checks it.
(c) Optionally change the sample to `Civicsmith/1`. No code changes.

### L3 · provenance
(b) `test/m/provenance/register-checks.test.mjs:194` `who: "instance test-instance (CivicOS/0.0.0)"`. A fixture sample of an existing record shape.
(c) None needed; it can stand as an old-record sample.

### L3 · attestation
(b) `test/m/attestation/attest.test.mjs:174` and `instance-key.test.mjs:22,36,69,71,111,120,137,151` use `"civicos-working-on-attestation/1"` only as a sample `kind`. `instance-key.test.mjs:27` uses `"civicos"` and `"Civicos/1"` as malformed kinds.
(c) No source change. `instanceStatement` accepts any `^[a-z][a-z0-9-]*\/[0-9]+$` (`index.mjs:223`), so `civicsmith-working-on-attestation/1` is accepted with no change. Optionally switch the samples. The negative samples at `:27` stay.

### L3 · capture-sources
(a) Suggestions, line 193: "not as the legible CivicOS agent" → "not as the legible Civicsmith agent".
(b) `src/capture-sources/credentials.mjs:173` `salt: utf8("civicos capture-sources")`. IDENTIFIER: the HKDF salt that derives the AES key every stored credential is encrypted under.
(c) **Keep the salt unchanged, permanently.** Changing it makes every stored credential undecryptable. If BOB wants this pinned as a requirement, add one sentence to the module's requirements: "the key-derivation salt never changes".

### L3 · acquisition (a provider: its users change with it)
(a)
- Interface heading, line 66: "**civicosUserAgent(version, instance, purpose), CIVICOS_CONTACT_URL**" → "**civicsmithUserAgent(version, instance, purpose), CIVICSMITH_CONTACT_URL**".
- **R9**: "The user agent names CivicOS, the instance and the purpose" → "The user agent names Civicsmith, the instance and the purpose".
- **R16**: "(`who`: instance name, CivicOS and version; …)" → "(`who`: instance name, Civicsmith and version; …)". A document captured before keeps its `who`.
- **R24**: "`civicosUserAgent` answers `CivicOS/<version> (+<CIVICOS_CONTACT_URL>; instance <instance>; <purpose>)` … `CIVICOS_CONTACT_URL` is the project's public address … every module that sends or judges the CivicOS agent …" → "`civicsmithUserAgent` answers `Civicsmith/<version> (+<CIVICSMITH_CONTACT_URL>; instance <instance>; <purpose>)` … `CIVICSMITH_CONTACT_URL` is the project's public address … every module that sends or judges the Civicsmith agent …". The URL's value (`https://github.com/believeinoakland/bio`) is unchanged.
- The Status/Size line 5 names the old identifiers historically and stays.

(b)
- `checks.mjs:1,15`: COMMENT.
- `checks.mjs:22` `CIVICOS_CONTACT_URL` and `:23` `civicosUserAgent`: IDENTIFIER.
- `checks.mjs:24` `` `CivicOS/${version…}` ``: VISIBLE (the user agent sent to every source).
- `index.mjs:16,34,88`: IDENTIFIER (import, re-export, call). `:83` COMMENT.
- `index.mjs:1085` `` who: `instance … (CivicOS/${…VERSION})` ``: VISIBLE (record text in a new capture's `provenance_chain`).

(c)
- Rename both identifiers and change the UA string and the `who` text.
- Export the old names as aliases of the same function and constant until the last user has moved (§7, point 6).
- Nothing in product code parses `CivicOS/` out of a `who` or a UA. Checked: no regex or `startsWith` over it in `bio-plane/src`, `newgroup/src` or the workers.

### L3 · capture
(b) `src/capture/index.mjs:845` `` who: `instance … (CivicOS/${…})` ``: VISIBLE (record text).
(c) Change it to Civicsmith, matching acquisition R16. This module has no requirement line naming the name.

### L4 · content
(b) `extent-core.mjs:36,604`: COMMENT. (c) None.

### L4 · reading-pipeline
(b) `bio-plane/test/tier-pagewise.probe.mjs:196`, the UA constant `CivicOS/0.58.0 (…)`. VISIBLE (probe).
(c) As pdf-pixels.

### L5 · bias, observation-log, query-language
(b) `bias/checks.mjs:471`, `observation-log/vocabulary.mjs:59,258` and `query.mjs:2680` are all COMMENT (path). (c) None.

### L6 · strength
(a) **R15**
- Current: "Its answer's `note` carries the bar's honest note in DEC-105's words: "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (DEC-105; H12; K1038)"
- Proposed: "… in DEC-105's words, with the product named as DEC-124 names it: "Civicsmith has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (DEC-105; DEC-124; H12; K1038)". The canon already reads this way: Publication, line 673.

(b)
- `index.mjs:113` `BAR_HONEST_NOTE`: VISIBLE.
- `method.mjs:227` `` `How CivicOS grades a finding (method ${GRADING_METHOD_VERSION}).` ``: VISIBLE, and **rendered into every complete edition** through `gradingMethodText` (§3.4).
- `test/m/strength/vocabulary.mjs:4`: COMMENT.

(c)
- `BAR_HONEST_NOTE`: change it.
- `method.mjs:227`: depends on §7 point 1. Either change it outright, or let `gradingMethodText(version, {product})` take the name, defaulting to Civicsmith, so `case-grammar` can render an old case's words exactly.

### L6 · capture-requests
(a)
- Interface line 17: "`ua_mode` (default `civicos`)". Changes only if §7 point 4 renames the value.
- **R14**: "`ua_mode` in `CAPTURE_UA_MODES` (`civicos`, `member-browser`) … for `civicos`, `civicosUserAgent(version, instance, purpose)`" → "… for `civicos`, `civicsmithUserAgent(version, instance, purpose)`", with the value as §7 point 4 decides.
- The Status line 3 (a historical code map) stays.

(b)
- `checks.mjs:10,67,68`: COMMENT ("The CivicOS agent's one composer", "`civicos` is the honest product string").
- `checks.mjs:73` `CAPTURE_UA_MODES = ['civicos', 'member-browser']`: IDENTIFIER. It is a stored enum value (`capture_requests.ua_mode`), an op argument, and it is answered in reads and feed items.
- `index.mjs:305` default `"civicos"`: IDENTIFIER.
- `index.mjs:32,697` import and call of `civicosUserAgent`: IDENTIFIER.
- `index.mjs:678` and `schema.mjs:55`: COMMENT.

(c) Re-point to `civicsmithUserAgent`, and update the comments that name "the CivicOS agent". For the `ua_mode` value, see §7 point 4.

### L6 · skills
(b)
- `skilldoctrine.mjs:812` "CivicOS takes no position on what policy should be (Operational Principle 1).": VISIBLE (doctrine words in the rendered pack the assistant reads).
- `skillpack.mjs:106,117`: COMMENT (path).

(c) Change it to "Civicsmith takes no position …". The pack's version digest moves by itself (R6/R11, by design), and `DOCTRINE_EDITION` does not need a bump. No requirement line names the word.

### L6 · agent-worker, run-rules
(b) `agent-worker/src/index.mjs:231` and `subsession.mjs:87`, and `run-rules/checks.mjs:251,378,399` and `rules.mjs:320,680,716,773`, are all COMMENT (path). (c) None. The agent-worker bundle does not go stale.

### L8 · case-grammar
(a) None. R14 leaves the words to the UX stream and does not quote "Made with". The credit is DEC-118's.

(b)
- `complete.mjs:47` `MADE_WITH_LINE = "Made with CivicOS"`: VISIBLE (the complete edition's foot).
- `complete.mjs:243` "You can check this case yourself, without CivicOS and without a network connection.": VISIBLE.
- `complete.mjs:46` and `formats.mjs:16`: COMMENT.

(c) Change both to "Made with Civicsmith" and "without Civicsmith". Both are inputs to a byte-compared render, so the order and form depend on §3.4 and §7 point 1.

### L8 · docket
(a) **R6**
- Current: "`format` (`civicos-docket-entry/1`), …"
- Proposed: "`format` (`civicsmith-docket-entry/1`; an entry published before T31 keeps `civicos-docket-entry/1`, and a case's chain may hold both: R6's `previous` is the prior entry's digest over its own stored bytes), …" (DEC-124)

(b)
- `index.mjs:63` `ENTRY_FORMAT = "civicos-docket-entry/1"`: LABEL.
- `feed.mjs:34` `<id>urn:civicos:docket:<group>:<case></id>` and `:47` `…:<seq>`: IDENTIFIER (Atom ids). No requirement names them.

(c) New label written; for the URN, see §7 point 3.

### L8 · public-read, review
(b) `public-read/index.mjs:851`, `publication/worker.mjs:296` and `review/checks.mjs:25`: COMMENT. (c) None.

### L8 · network-notices
(a)
- Terms, line 19: "in the format `civicos-working-on/1`" → "in the format `civicsmith-working-on/1` (`civicos-working-on/1` for a revision published before T31; DEC-124)".
- Terms, line 20: the same for `civicos-working-on-attestation/1` → `civicsmith-working-on-attestation/1`.
- **R3**: "`format` (`civicos-working-on/1`)" → "`format` (`civicsmith-working-on/1`; a revision published before keeps `civicos-working-on/1`, and a notice's revisions may hold both)".
- **R12**: "`format` (`civicos-working-on-attestation/1`)" → "`format` (`civicsmith-working-on-attestation/1`; an attestation issued before keeps its label)".
- **R13**: "`attestation.instanceStatement("civicos-working-on-attestation/1", sha256(attestation))`" → "`attestation.instanceStatement(<R12's format>, sha256(attestation))`". An attestation signed before verifies over its own label.
- Satisfies, line 172: "§5B, the CivicOS half" → "§5B, the Civicsmith half".
- **R10/R18:** no change if §7 point 2 keeps the seal construction. Under option B, see §3.3.

(b)
- `index.mjs:70` `NOTICE_FORMAT`, `:71` `ATTESTATION_FORMAT` and `:72` `OPENING_FORMAT`: LABEL.
- `index.mjs:672` `` userAgent: `CivicOS/${VERSION||"0"} (working-on seal)` ``: VISIBLE (the UA sent to the RFC 3161 authorities). It does not go through acquisition's composer and carries no contact URL; that is noted, not proposed.
- `seals.mjs:72` `ACTIVITY_METHOD_VERSION`: LABEL.
- `seals.mjs:101` `SEAL_METHOD.version`: LABEL.
- `seals.mjs:103–105`: the `SEAL_METHOD` text.
- `seals.mjs:110,112,113,114`: hash tags `civicos-seal-leaf/1`, `civicos-seal-node/1`, `civicos-week-leaf/1`, `civicos-seal-dummy/1`. LABEL.

(c) See §3. The UA becomes `Civicsmith/…`.

### L8 · case-checker
(a)
- Intro, line 11: "without a CivicOS copy … a pure function that CivicOS runs on import … the same check code CivicOS runs" → Civicsmith in all three places.
- **R16**: "on a CivicOS copy and in the standalone program alike" → "on a Civicsmith copy …".
- **R13**'s parenthesis quotes DEC-112 (3) ("…without CivicOS"). DEC-112 is a historical record. Keep the quote verbatim, or re-cite Publication §5C, which now reads "without Civicsmith" (§7 point 7).

(b)
- `build-program.mjs:2`: COMMENT (the quote).
- `build-program.mjs:27` `` `// CivicOS case checker (bio-case-file/1). SHA-256 of everything after this line: …` ``: VISIBLE (the program's first line).
- `program.mjs:4`: generated; holds that header plus the bundled `MADE_WITH_LINE`, "without CivicOS" and the method text.
- `spec.mjs:11` "without a copy of CivicOS … the checker CivicOS runs": VISIBLE (served by `casefilespec`).
- `index.mjs:4,7` and `main.mjs:5`: COMMENT.

(c)
- Change the header line and the spec text.
- Regenerate `program.mjs` (`node bio-plane/src/case-checker/build-program.mjs`) after case-grammar's and strength's changes. Its SHA moves.
- See §3.4: a checker program already handed out renders the old words, so a newly published case "differs" under that old program. A person gets the matching program from the publishing copy's `casechecker` read.

### L8 · case-import
(a) Intro, line 11: "A CivicOS copy imports another group's case file" → "A Civicsmith copy imports …". (b) None. (c) Requirement text only.

### L9 · action-grammar
(b) `checks.mjs:405`: COMMENT. (c) None.

### L10 · monitoring
(a) Uses, line 127: "`civicosUserAgent` (its R24)" → "`civicsmithUserAgent` (its R24)".
(b)
- `index.mjs:56,670`: IDENTIFIER (import, call).
- `index.mjs:257` `SLATE_FRAMING_OPEN = "This is the due slate of a CivicOS instance: …"`: VISIBLE (the framing a member or the assistant reads; R30 "the due slate's fixed framing").

(c) Re-point the import; change the framing to "a Civicsmith instance". `ticks.test.mjs:422` compares against the constant and needs no edit.

### L11 · affordances, queue, admission, control-plane
(b) `affordances.mjs:356,763,1294`, `queuestate.mjs:279,281`, `queue/index.mjs:1024,1256,1329`, `admission/checks.mjs:129` and `control-plane/checks.mjs:15` / `index.mjs:731,2280`: all COMMENT (path).
(c) None.

### L11 · queue-producers, queue (tests only)
(b) `queue-producers` tests `feeditems.test.mjs:25,28`, `lead.test.mjs:13`, `conditions.test.mjs:132`, `producers.test.mjs:26,156`, and `queue` test `feed.test.mjs:275`. All are `ua_mode: "civicos"` fixture rows: IDENTIFIER.
(c) None if §7 point 4 keeps the stored value or accepts both. These rows are then also old-row samples.

### L11 · instance-setup
(a)
- **R8**: "fetches `https://<domain>/.well-known/civicos-group.json`": §7 point 5. Recommended text: "fetches `https://<domain>/.well-known/civicsmith-group.json`, and, when that answer is `absent`, `…/civicos-group.json` (the file a group published before T31); either verifies".
- Uses, line 76: "`acquisition`: `civicosUserAgent`" → "`civicsmithUserAgent`".

(b)
- `setup.mjs:23`: COMMENT ("The CivicOS agent's one composer").
- `setup.mjs:24,2121`: IDENTIFIER (import, call).
- `setup.mjs:963`: COMMENT (path).
- `setup.mjs:1839` `GROUP_WELL_KNOWN_PATH = "/.well-known/civicos-group.json"`: IDENTIFIER (a path on the group's own domain). It is also VISIBLE in the refusal detail at `:2131` ("the domain serves no …").

(c) Re-point the import and update the comment; the path follows §7 point 5. The setup page itself names no product (checked: no other hit).

### L11 · legacy-ui
89 lines in 29 files under `civicos-ui/` (9 with "CivicOS", in 5 files). Bob's: UX (K633). Nothing is proposed.

### L11 · installer
(a) **R22**
- Current: "Every page names CivicOS and the installing group. … the pages say it is run by the publisher of CivicOS releases (K102)."
- Proposed: "Every page names Civicsmith and the installing group. … the pages say it is run by the publisher of Civicsmith releases (K102; DEC-124)."
- Believe in Oakland stays the publisher; Civicsmith is the software, never the publisher.

(b) All VISIBLE unless marked:
- `src/ui.mjs`:
  - `:12` `PRODUCT = "CivicOS"`.
  - `:159` "Set up your group's copy of CivicOS".
  - `:160` "Install your group's own copy of CivicOS, the accountability record, …".
  - `:161` "CivicOS &middot; installer".
  - `:162` "its own copy of CivicOS".
  - `:187` "the publisher of CivicOS releases".
  - `:205` "Update your copy of CivicOS".
  - `:206` "Bring your group's existing copy of CivicOS …".
  - `:207` "CivicOS &middot; software update".
  - `:208` "the copy of CivicOS your group already runs".
  - `:4,5`: COMMENT.
- `src/index.mjs`:
  - `:127` "This is worth mentioning to the publisher of CivicOS releases."
  - `:879` and `:1494` "CivicOS &middot; installer".
  - `:949` "Your Cloudflare account already holds a copy of CivicOS".
  - `:1008` and `:1303` "…for the publisher of CivicOS releases to fix…".
  - `:1172` `NO_KEY` "…the publisher of CivicOS releases included."
  - `:1490` "Setting up your group&#39;s copy of CivicOS."
  - `:1486`: COMMENT.
- `bio-plane/public/newgroup/index.html`:
  - `:6` `<title>Start your group's copy — CivicOS</title>`.
  - `:7` meta description.
  - `:49` eyebrow.
  - `:52` "CivicOS is a public, tamper-evident record".
  - `:60` "Your own copy of CivicOS".
  - `:63` and `:96` "publisher of CivicOS releases".
  - `:104` "the CivicOS setup assistant, run by the publisher of CivicOS releases".
  - `:117` "This installer is run by the publisher of CivicOS releases."
- `src/release.mjs:3`: generated. It embeds signed plane release 0.79.0, with 33 hits including `civicosUserAgent`, `"CivicOS/…"` and `civicos-group.json`.

(c)
- Change all of these.
- `release.mjs` is not edited by hand: it comes from the next signed release (`scripts/embed-release.mjs`, R26 `checkSignedAsset`).
- `newgroup.believeinoakland.workers.dev` (`index.html:103,110,114`, `src/index.mjs:3,41`) is the installer's own address and has no "civicos" in it. It is unchanged by DEC-124.

## 3. Signed-record labels

Every label below is written by the plane; the network site and strangers read it outside the product. No product code compares a `format` field on read: `git grep` finds no comparison against `NOTICE_FORMAT`, `ATTESTATION_FORMAT`, `OPENING_FORMAT` or `ENTRY_FORMAT`. The only in-product verifier is `verifyOpening` (seals). The signature namespaces are `bio-working-on` (`sshsig.mjs:352`) and `bio-docket` (`:383`). They are BIO and stay.

| label | written by (file:line) | where it enters bytes | verified / read | changes bytes? |
| --- | --- | --- | --- | --- |
| `civicos-working-on/1` | network-notices `index.mjs:70`, used `:331` | `format` in the revision. The canonical JSON → `digest` → `noticeStatement(nid, n, digest)`, signed by the owner (NS `bio-working-on`) | Signature checked at post (`index.mjs:377`) over the held digest. Served as stored. The directory reads it | yes: in the signed digest |
| `civicos-working-on-attestation/1` | network-notices `index.mjs:71`, used `:461`, `:469` | `format` in the attestation JSON, **and** the first line of the instance-signed statement (`instanceStatement(kind, sha)`, attestation `index.mjs:230`) | Tests: `reads.test.mjs:179`, `activity.test.mjs:102`. Outside readers | yes: directly in the signed statement |
| `civicos-working-on-opening/1` | network-notices `index.mjs:72`, used `:735` | `format` in the stored opening (`nn_openings.json`). Not signed itself; bound through seals and the TSA token | `verifyOpening` ignores `format` | stored bytes only |
| `civicos-working-on-activity/1` | network-notices `seals.mjs:72` | `activity.method` inside every attestation (signed). The `activitymethod` public read | `reads.test.mjs:189,312`, `activity.test.mjs:65–81` (via the constant) | yes: in attestations' signed digest |
| `civicos-working-on-seal/1` | network-notices `seals.mjs:101` (`SEAL_METHOD.version`) | `method` in every opening | `verifyOpening` does not read it | stored bytes |
| `civicos-seal-leaf/1`, `civicos-seal-node/1`, `civicos-week-leaf/1`, `civicos-seal-dummy/1` | network-notices `seals.mjs:110–114` (`tagged`) | **Hash input** of every leaf, node, dummy slot and week leaf. The week root is RFC 3161-timestamped | `verifyOpening` (`seals.mjs:176–186`, tags hard-coded). Re-derived at **opening time** from stored leaves and secret (`index.mjs:730–733`) | yes: every seal and root |
| `civicos-docket-entry/1` | docket `index.mjs:63`, used `:589` | `format` in the entry. The canonical JSON → `digest` → `docketStatement(case, seq, digest)`, signed (NS `bio-docket`), and the next entry's `previous` | Signature at post (`index.mjs:654`). Feed and JSON reads. The network-notices fixture (`fixture.mjs:194`) | yes: in the signed digest and the chain |

Not signed, but permanent: `urn:civicos:docket:` feed ids (docket `feed.mjs:34,47`), `/.well-known/civicos-group.json` (instance-setup `setup.mjs:1839`) and the HKDF salt (capture-sources `credentials.mjs:173`).

### 3.1 The proposed rule (for every record format above)
- A record written from the T31 deploy carries `civicsmith-…`, with the same `/<version>` number.
- A record already written keeps its bytes and its `civicos-…` label. It is never re-signed or rewritten.
- Every reader accepts both, forever, as the same format. In the product this binds `verifyOpening` (§3.3) and any future reader. In the requirements it is stated in network-notices R3, R12 and R13 and docket R6 (§2).
- Chains may mix labels:
  - A notice's revisions (`previous`) and a case's docket entries (`previous`) each link by digest over stored bytes. So a chain whose first entries say `civicos-…` and later ones `civicsmith-…` is valid.
  - The switch is per record, at the first record written after the deploy.
  - A revision or docket entry *prepared* under the old code and posted under the new one, within the 60-minute TTL, posts with its prepared bytes, so it carries the old label. That is correct.
- Tests (owned by the writer):
  - For each format, a fixture record with the **old** label, signed in the test, still verifies: the owner signature over `noticeStatement`, `docketStatement`, and the instance signature over `instanceStatement("civicos-working-on-attestation/1", …)`.
  - A new record carries the new label.
  - For the docket, a chain holding both labels reads whole and in order.

### 3.2 `civicos-working-on-activity/1` (a method version, not a record type)
- R10: "A change to the method is a new version. An earlier attestation keeps naming the version it was computed under."
- Renaming the label is not a change to the method. If it is renamed, R10 must say that `civicos-working-on-activity/1` and `civicsmith-working-on-activity/1` name the same method. `activityMethod()` should answer the current label with the earlier one listed as the same method (a small interface addition), so that a reader holding an old attestation can find its method.
- Recommended: rename, with that sentence in R10 (§7 point 2).

### 3.3 The seal construction: **mixing is unsafe as the code stands**
- The four tags are hash domain separators. Changing them changes every seal, week root and path.
- `openSeals` (`index.mjs:730–733`) recomputes a sealed week's tree **at opening time** from the stored leaves and secret, using the current `leafHash`, `weekLeafHash` and `dummyHash`. With renamed tags, an opening of any week sealed before the switch would:
  - compute paths that do not reach the stored `s.seal`;
  - compute a week tree that does not reach the timestamped `root.root`.
  Every such opening would then fail `verifyOpening`.
- `verifyOpening` also hard-codes the tags and ignores `o.method`, so it would reject every opening published before.
- One tree must never mix tags. The project-seal tree and the week tree it feeds must use the same construction.
- **Recommended (option A):** keep the four tags and `SEAL_METHOD.version` (`civicos-working-on-seal/1`) unchanged permanently. They are the name of a published construction, like the `bio-release`/`bio-ratify` namespaces that signatures R32 keeps. No reader would see a mixed tree, and no data needs migrating.
- **Option B**, if BOB wants every label renamed:
  - Store the method per sealed week (`nn_week_seals` and `nn_week_roots` gain `method`, with existing rows read as `civicos-working-on-seal/1`).
  - Switch only at a week boundary, for both trees together.
  - Parameterise `leafHash`, `nodeHash`, `weekLeafHash` and `dummyHash` by method.
  - `verifyOpening` dispatches on `o.method` and answers "not an opening" for an unknown one.
  - R14, R17 and R18 state all this.
  - Tests: an opening of a week sealed under the old method, made after the switch, still verifies; a week sealed after the switch uses the new tags throughout.

### 3.4 Not a label, but the same hazard: the complete edition's words
- `case-checker` R10 re-renders the complete edition with `case-grammar.completeEditionOf` and compares SHA-256 with the carried file (`check.mjs:476–484`).
- The render includes three strings that name CivicOS:
  - `MADE_WITH_LINE` (`complete.mjs:47`);
  - the "without CivicOS" line (`complete.mjs:243`);
  - `strength.gradingMethodText("bio-grading/1")` (`method.mjs:227`).
- Changing them makes every complete edition already published "differ" on import and under the new checker.
- Whether any `/6` complete edition has left a copy (published on a deployed plane, or exported) is not visible from what I read. It is §7 point 1.

## 4. Tests that pin the old strings

| owner | file:line | what |
| --- | --- | --- |
| signatures | `bio-plane/test/m/signatures/signatures.test.mjs:1160` (title), `:1165`, `:1166`, `:1168`, `:1179` | page title, h1, error text, the note |
| bundler | `bio-plane/test/m/bundler/release.test.mjs:269` | `"civicos"` as a non-plane worker: after the domains |
| pdf-pixels | `pdf-worker/test/pagepixels-corpus.probe.mjs:53` | probe UA |
| ocr-worker | `bio-plane/test/ocr-measure-probe.mjs:50` | probe UA |
| reading-pipeline | `bio-plane/test/tier-pagewise.probe.mjs:196` | probe UA |
| host-governor | `bio-plane/test/m/host-governor/governor.test.mjs:346,351` | sample UA (optional) |
| provenance | `bio-plane/test/m/provenance/register-checks.test.mjs:194` | sample `who` (keep) |
| attestation | `attest.test.mjs:174`; `instance-key.test.mjs:22,27,36,69,71,111,120,137,151` | sample kinds (optional; `:27` negatives stay) |
| acquisition | `subresources-walk.test.mjs:119`; `memento.test.mjs:114`; `acquire.test.mjs:13,284,292,296,426,572,642,812,841`; `checks.test.mjs:1,8,9,88–100` | `^CivicOS\/`, `who` "(CivicOS/9.9.9)", the identifiers |
| capture | `bio-plane/test/m/capture/knocker.test.mjs:202` | `who` `/^instance inst \(CivicOS\/9\.9\.9\)$/` |
| strength | `bio-plane/test/m/strength/reads.test.mjs:238` | `HONEST_NOTE` literal |
| capture-requests | `drain.test.mjs:9,151,173,177,179,182,185`; `door.test.mjs:138,156,161`; `reads.test.mjs:23,138,294`; `retry.test.mjs:50`; `fixture.mjs:99` | the identifier, `ua_mode` `civicos` (`:179` pins `["civicos","member-browser"]`), sample `who` |
| case-grammar | `bio-plane/test/m/case-grammar/complete.test.mjs:110` (title), `:122` | `MADE_WITH_LINE === "Made with CivicOS"` |
| case-checker | `bio-plane/test/m/case-checker/program.test.mjs:19–24` | `program.mjs` must equal a fresh build (goes stale) |
| docket | `bio-plane/test/m/docket/reads.test.mjs:228` | `urn:civicos:docket:` |
| network-notices | `bio-plane/test/m/network-notices/fixture.mjs:194` | a docket entry literal with `civicos-docket-entry/1` (keep: an old-label sample) |
| queue-producers | `feeditems.test.mjs:25,28`; `lead.test.mjs:13`; `conditions.test.mjs:132`; `producers.test.mjs:26,156` | `ua_mode: "civicos"` rows |
| queue | `bio-plane/test/m/queue/feed.test.mjs:275` | `ua_mode: "civicos"` row |
| instance-setup | `bio-plane/test/m/instance-setup/identity.test.mjs:6,87,90` | identifier, the well-known URL |
| installer | `newgroup/test/requirements.test.mjs:697` (title), `:700,704,705,706,715,721` | R22's page texts |

Tests that use the constants and need no edit: network-notices `prepare`, `activity`, `reads`, `seals`; docket `place`; monitoring `ticks.test.mjs:422`. New tests are owed under §3.1–§3.4.

## 5. Generated artifacts that go stale (manifest "Generated artifacts")

- `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` (not_product; BOB at each layer close): goes stale from every plane source change above.
- `bio-plane/src/signpage.mjs` (signatures; `scripts/embed-signpage.mjs`, also run by the plane's `npm run build`): goes stale from `sign-release.html`.
- `bio-plane/src/case-checker/program.mjs` (case-checker; `node bio-plane/src/case-checker/build-program.mjs`): goes stale from case-grammar (`complete.mjs`), strength (`method.mjs`) and case-checker's own header. Regenerate after L6 and L8's case-grammar merge. Its `PROGRAM_SHA256` moves.
- `newgroup/dist/newgroup.bundled.mjs` (installer): goes stale from `newgroup/src/ui.mjs` and `index.mjs`. Verify with `newgroup-bundle-fresh.test.mjs`.
- `newgroup/src/release.mjs` (installer; generated by `newgroup/scripts/embed-release.mjs` from a **signed release**, not listed in the manifest's table): it carries plane 0.79.0's `CivicOS` strings until the next signed release is embedded. It is not regenerated at a layer close. Recommend adding it to the manifest's table as "at a release".
- Not stale:
  - `pdf-worker`, `ocr-worker` and `agent-worker` dists: their inputs carry only comments or test probes here.
  - `bio-plane/public/newgroup/index.html`: hand-written, not generated.

## 6. Proposed entries by layer (N538 (1)+(3), with (2)'s identifiers)

- **L1 · signatures:**
  - R32's text.
  - `sign-release.html` five strings, then regenerate `signpage.mjs`.
  - Tests at `signatures.test.mjs:1160–1179`.
- **L1 · pdf-pixels, ocr-worker:** probe UA constants to `Civicsmith/…`. Optional; fold into any job of theirs, or skip.
- **L3 · acquisition (provider, merges first in L3; its users are in L6, L10 and L11):**
  - R9, R16 and R24 and the interface heading.
  - `civicosUserAgent` → `civicsmithUserAgent`, `CIVICOS_CONTACT_URL` → `CIVICSMITH_CONTACT_URL`, keeping the old names as aliases of the same objects (§7 point 6).
  - UA and `who` text to Civicsmith.
  - Tests re-keyed.
  - Users pick up: capture-requests, monitoring, instance-setup.
- **L3 · capture:** `who` text (`index.mjs:845`) and `knocker.test.mjs:202`.
- **L3 · host-governor, capture-sources (requirement text only), attestation, provenance (optional samples):** no job needed. BOB folds the text. capture-sources' salt stays (§2).
- **L4 · reading-pipeline:** probe UA, optional.
- **L6 · strength:**
  - R15's note and `BAR_HONEST_NOTE`.
  - `method.mjs:227` per §7 point 1. Under option (b) this is a provided-service change, `gradingMethodText(version, {product})`; its user, case-grammar, picks it up in L8.
- **L6 · capture-requests:** R14 and the interface line; re-point to `civicsmithUserAgent`; `ua_mode` per §7 point 4.
- **L6 · skills:** doctrine rule 9's sentence. The pack digest moves by itself.
- **L8 · case-grammar (merges before case-checker):** `MADE_WITH_LINE` and the check line per §7 point 1. New test: an old-words complete edition still renders byte-identical, if option (b).
- **L8 · docket:** R6; `ENTRY_FORMAT` → `civicsmith-docket-entry/1`; old-label verification test and mixed-chain test (§3.1); the URN per §7 point 3.
- **L8 · network-notices:**
  - Terms, R3, R12 and R13, and Satisfies.
  - The three formats renamed, and the activity label with R10's sentence (§3.2).
  - The seal construction kept (§3.3 option A), or option B.
  - The TSA UA.
  - Old-label verification tests.
- **L8 · case-checker (after case-grammar, in L8's order):** intro and R16; header line and `spec.mjs` text; regenerate `program.mjs`; R10 test for an old complete edition, if option (b).
- **L8 · case-import:** intro text only (BOB folds; no job).
- **L10 · monitoring:** Uses line; re-point the import; `SLATE_FRAMING_OPEN`.
- **L11 · instance-setup:** R8 per §7 point 5 and the Uses line; re-point the import; tests at `identity.test.mjs:6,87,90`.
- **L11 · installer:** R22; `ui.mjs`, `index.mjs` and `public/newgroup/index.html` texts; `requirements.test.mjs:697–721`; regenerate `newgroup/dist`. `release.mjs` waits for the next signed release.
- **Last, after every user of acquisition has merged:** the old aliases are removed by acquisition in a later tranche (or kept; §7 point 6).
- **After the domains (not T31):**
  - bundler R17 and the `civicos` worker name (`deploy.mjs:106,118`, `deploy-fleet.mjs:7,81`, `release.test.mjs:269`);
  - the workers.dev address;
  - the `civicos-process` repository (only `.claude/`, not_product);
  - `civicos-ui/` (legacy-ui, Bob's: UX).

## 7. Open points for BOB

1. **The complete edition's words (§3.4).** Has any `bio-case-document/6` complete edition been published on a deployed copy or exported as a case file?
   - **If none (recommended, if so):** change the three strings outright and record it as a ruling. There is no signed record to keep.
   - **If any:** the rendered name is chosen by the case document's format:
     - `/6` renders "CivicOS";
     - a new `/7`, identical in fields, renders "Civicsmith";
     - `strength.gradingMethodText` takes the name as an argument;
     - a test proves an old `/6` complete edition still re-renders byte-identical.
   - An old checker program, already downloaded, will report a new case as "differs". The matching program is served by each copy (`casechecker`), so I recommend stating this, not engineering around it.
2. **The seal construction (§3.3) and the activity label (§3.2).**
   - Recommended: keep the four seal tags and `civicos-working-on-seal/1` permanently. They are a published construction's name, mixing is unsafe as the code stands, and renaming needs per-week method storage (option B).
   - Rename `civicos-working-on-activity/1`, with R10 saying both labels name one method.
3. **The docket feed URN (`urn:civicos:docket:…`).** Atom ids must be permanent: a changed id makes every reader show every entry again as new. Recommended: keep `urn:civicos:` as an identifier, permanently. The alternative is a per-entry id chosen by the entry's own `format`, with the feed id kept.
4. **`ua_mode` `civicos`.** This is a stored enum value, an op argument, and appears in reads and feed items; no UI sends it (no hit in `civicos-ui/`). Recommended: accept `civicsmith` and `civicos` on input and in stored rows as the same mode, write `civicsmith` as the default, and state in R14 that the two names are one form. The cheaper alternative is to keep `civicos` as a code.
5. **The well-known file.** Recommended: R8 fetches `/.well-known/civicsmith-group.json`. On `absent` it falls back to `/.well-known/civicos-group.json`, so a group that already published one stays verified. That is two governed fetches only when the first is absent. Tell administrators the new name.
6. **The renamed acquisition exports.** A job may not edit another module's files, and acquisition's users merge two to eight layers later. Recommended: acquisition keeps `civicosUserAgent` and `CIVICOS_CONTACT_URL` as aliases of the same function and constant, which is still R24's "one spelling", not a copy. A later acquisition job removes them once `git grep` finds no user.
7. **DEC-112 (3)'s quote in case-checker R13 and `build-program.mjs:2`.** These quote a historical ruling. Recommended: keep the quote verbatim, as one of Bob's quoted words.
8. **The user-agent change is outward conduct.** SOURCE-ACCESS.md measured that admission depends on the contact URL, which stays. No measurement covers the product token. Recommended: after the first deploy carrying it, one live acquisition on the deployed copy against the sources measured before, to confirm the token change is neutral.
