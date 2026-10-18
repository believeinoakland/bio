# What signing provides today: the facts the signing ceremony is designed around

For the UX design session (D9, K3060). This was read on `tranche/T47`. Each point cites its requirement or ruling. Where it says "today", it describes the code and requirements as they stand.

## 1. What a signature is

- **Key type.** The key is Ed25519. The signature is a detached OpenSSH signature (SSHSIG, version 1, sha512), so anyone can check it with stock `ssh-keygen -Y verify` and no Civicsmith code (signatures R2, R31, R33; DEC-80 item 4).
- **What is signed.** A member never signs a document's bytes directly. She signs a one-line statement that names an id and a SHA-256, in a fixed namespace. The namespaces are distinct, so a signature valid in one never counts in another (R1, R28):
  - A case edition: `bio-ratify-case <case> <edition> <docSha>`, in `bio-ratify` (R6, R7).
  - A finding or an evidence bundle: `bio-ratify <id> <sha>`, in `bio-ratify` (R5).
  - A docket entry: `bio-docket <case> <seq> <digest>`, in `bio-docket` (R39, R40).
  - A "working on" notice: `bio-working-on <id> <rev> <sha>`, in `bio-working-on` (R37, R38).
  - A capture account: `bio-capture-account <sha>\n<text>`, in `bio-ratify` (R41; capture R69).

  The hash pins the exact revision. If the document changes, the signature is refused and the member must sign again.
- **Where the key lives.** Never on the server. Bob ruled that the member makes the key on her own device, that no one else makes it for her, and that each use is confirmed by passphrase or device unlock (K509 (2); DEC-80 item 4). The N345 draft names the intended form: "a non-extractable Ed25519 key, confirmed by passphrase or device unlock". It adds that the plane cannot test that part (`plan/draft-N345-dec78-80-81.md`).

  Today the key is a text blob that the signer page makes:
  - `BIOKEY1.` is protected by a passphrase (PBKDF2 at 600k iterations, then AES-GCM).
  - `BIOKEY-RAW1.` is the raw form.

  The member keeps the blob herself and pastes it back to load it. The page holds the key only in the tab's memory and stores nothing (signatures R43; `sign-release.html`). The server holds only the public line: the member registers it, and `attestingKeys()` answers the active ones (credentials R9, R11).
- **What a reader sees.**
  - The published case shows `signed_at` and `published_at` (publication R70).
  - Signer and deliverer are two separate facts (publication R27).
  - "Check the signature" is drawn (screens-publish R6).
  - The case checker verifies the case signature and each finding's signature offline, and says whether each key is among the group's published keys or that the keys were not checked (case-checker R3).

## 2. Who signs what, and when

| Act | Who signs | Key |
|---|---|---|
| Case edition: `caseratify` publishes now; `publishat` publishes at a set time | An owner of the project (`CASE_SIGNER_NOT_AN_OWNER`, ratification R18). The founder or a joined member *delivers* it (R3) | Her registered attesting key |
| Each finding, and each piece of evidence it rests on (`ratify`) | Under the case's authority, **after** the case document is ratified (Publication §5, D-431; ratification R5). An edition is `complete` only when every pinned member has landed (publication R53, `awaiting`) | Same key |
| Docket public entry, a court order included (`docketprepare` → `docketpost`) | The case's manager only. No machine, AI or administrator (docket R4, R18, R25) | Keys registered to `by` |
| "Working on" notice | A project owner (network-notices) | Same key |
| Capture account | The capturing member (capture R69) | Same key |
| The group's own attestations (activity level, seals) | The instance key, held by the server: a machine signing, not a member (network-notices; K59) | Instance key |
| Releases | Bob, offline: release key and recovery key, never a member (R43, R44; K1936, K2930) | Release key |

- **One signer per case edition.** `caseratify` takes one signature. K1490 speaks of "each publishing member" attesting, but in practice the signer is the publisher. Nothing today collects more than one signature for an edition.
- **The no-undeclared-tie attestation (K1490; case-disclosures R27; K3041).** Every signer attests that she holds no undeclared tie to any entity the case names, including the payers and payees of the money facts it cites. Without the attestation the act is refused `TIE_ATTESTATION_MISSING`. It is recorded inside the document she signs (signer and instant), so the signature covers it.

  As built at T47-32, it is `tieAttested: true` on `op=publish`, the *unsigned preparation* (`case-authoring/index.mjs` `attestedBy`). It is not on `caseratify`. Her declared ties are disclosed as `member_ties:` rows at the attribution level she chose.
- **Publish at a set time (ratification R40–R44; DEC-147).** "Publish at…" signs now. The time is not signed, so moving or cancelling it needs no new signature (publish-schedule R3). At the set time every check runs again, and the publication stops on any change to sources, ties, holds or approvals, or on any refusal (R42). It is offered only when the group has a time zone (R44, `publish_at.offered`). While an edition waits, `caseratify` is refused `PUBLISH_AT_ALREADY_SET`.
- **Re-asking for the password (K3061, D3).** Signing or publishing a case always asks for the sign-in password again.

## 3. The acts: inputs, refusals, what the member must have ready

- **Before anything: `signerregister` (credentials R9).**
  - Input: the public line (`ssh-ed25519 AAAA… label`).
  - Refusals: `BAD_KEY`, `SIGNER_KEY_HELD_BY_ANOTHER`, `SIGNER_KEY_REVOKED`, `MACHINE_CANNOT_REGISTER_KEY`, and `SIGNER_MEMBER_NOT_ENROLLED` or `_NOT_ACTIVE`.
  - Every administrator is notified, and an administrator can revoke the key (R7).
  - `signerrevoke` is never refused (R10). A lost key is revoked and a new one registered.
  - The Settings screen today has a field for pasting this line.
- **`publishpreflight` (case-authoring R34, R75; ratification R18, R44).** It writes nothing. It answers `{ready, first, blockers[], steps, publish_at}`. Among the blockers:
  - `NO_ATTESTING_KEY`
  - `CASE_SIGNER_NOT_AN_OWNER`
  - `TIE_ATTESTATION_MISSING`
  - `APPROVAL_MISSING`
  - the case gate's findings
- **`publish` (case-authoring).** It stores the unsigned document, `tieAttested` included, and answers `caseDocument.doc_sha`, the hash to sign. While an edition waits it is refused `CASE_EDITION_WAITING`.
- **`caseratify` (ratification R2, R3).**
  - Input: case, edition, signature.
  - Refusals, in order: machine or operator token; `MALFORMED`; attribution (C-92.10/.11); C-58.5; `CASE_RATIFY_STALE` (the document changed); `APPROVAL_MISSING`; `NO_SIGNERS`; `SIG_<reason>` (`NAMESPACE`, `UNKNOWN_KEY`, `BAD_SIGNATURE`, `MALFORMED`); `GATE_REFUSED`; authority; `CASE_EDITION_ALREADY_RATIFIED`; `CASE_CONCLUSION_MOVED`; `CASE_PRODUCTION_DIVERGED`.
  - Sending the same signature again answers `existed: true`.
- **`publishat` (R40).** Input: the same as `caseratify`, plus `at: {date, time}`. It adds `SCHEDULE_UNCHECKABLE` and `PUBLISH_AT_*`.
- **`ratify`, once per finding or bundle (R4, R5).**
  - Input: id, `expectedSha`, signature.
  - Refusals: `RATIFY_STALE`, `SIG_<reason>`, `GATE_REFUSED`, and `RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE` if the case is not signed first.
- **`docketprepare` → `docketpost` (docket R4, R5).**
  - The prepare step answers `{entry, statement, digest, warning, expires}`. The statement **expires in 60 minutes**.
  - The post step needs `{digest, signature, acknowledged: true}`.
  - Refusals: `DOCKET_WARNING_NOT_ACKNOWLEDGED`, `DOCKET_STALE`, and `DOCKET_SIGNATURE_REFUSED` (a key not registered to the poster).
- **What the member must have ready:**
  - an active registered key;
  - the private key, on this device or as a blob, with its passphrase;
  - her sign-in password (D3);
  - the tie confirmation;
  - for "Publish at", a date and time.

## 4. Fixed by doctrine vs open for design

**Fixed. The design cannot change these:**
- Signing happens in the member's browser, with a key she holds, made on her own device and never by another, confirmed by passphrase or device unlock. Founder delivery (D-421) stays as a fallback (DEC-80 item 4; K509).
- The output is an SSHSIG over the statements above, so strangers can verify with `ssh-keygen` (R1–R7, R31).
- The order: the case is signed first, then each finding crosses by its own signature (Publication §5; DEC-72; D-431).
- The tie attestation is the signer's own, recorded in the signed document (K1490).
- The publish-at time is not signed. It is checked again at publish time, and any change stops it (DEC-147).
- Docket entries are placed only by the manager, with an outward-act warning that must be acknowledged (DEC-116).
- Signing a case asks for the password again (K3061 D3).
- No secret travels in a web address (K1874 F1). No signature key is written to the browser's storage, an address or a later request (screens-publish R11).
- DEC-2 (the root of trust is the hosting operator) is not reopened (K1874 Q6).
- Every outward-act warning, label and shelf word belongs to the UX stream (docket; network-notices).

**Open (design, or BOB's detail):**
- Where the ceremony's key comes from: made inside the shell, imported from the blob, or a hand-off to `/sign`.
- How "device unlock" is realised (e.g. WebAuthn as a gate; it cannot itself produce Ed25519 SSHSIG).
- Whether one confirmation covers the case signature *and* all N finding and evidence signatures.
- Where the tie confirmation sits: the Ties step before Sign (screens-publish R5) versus inside the act.
- How a key is recovered or replaced.
- Whether a case could carry more than one signer.

## 5. Gaps between today's flow and an in-interface ceremony

1. **The signer page cannot sign a case.** `/sign` (signatures R25–R31, served by control-plane R1) has tabs for release, ratification, notice and docket only. Its "ratification" tab signs `bio-ratify <id> <sha>`, the *finding* statement. Nothing in the product makes a `bio-ratify-case` signature, and nothing makes a capture account. **`caseratify` cannot be completed through the product today.**
2. **Pasting by hand.** Today the member copies an id, an edition or sequence number, and a hash from the app into `/sign`, signs, then copies the signature back. screens-publish's Suggestions say the hand-over of the signature "is BOB's to fix", and the in-shell signer is Bob's question (K3041; screens-publish R5, R8).
3. **Signature count.** A case of N findings plus evidence needs 1+N+E signatures. Today each would be pasted separately.
4. **The key is a blob.** The page's Generate makes a release key *and* a ratify key; a member needs only the ratify key. Nothing persists, so she pastes the blob and passphrase every session. The "non-extractable key on the device" in K509 is not built.
5. **Tie confirmation.** This is now built: `tieAttested: true` goes on `publish` (T47-32). But the registry labels `publish` "Publish, with your confirmation…" and `caseratify` "Sign with your key". `publish` only *prepares*; `caseratify` signs **and publishes now**. The design's labels should follow that.
6. **The op name differs.** Requirements say `op=signerregister`. The screen code uses `signerregisterown`. This is BOB's to reconcile.
7. **The docket statement expires 60 minutes after it is prepared**, so the signing must finish within that time.

**What an in-interface signer needs:**
- **Ed25519 in WebCrypto.** `crypto.subtle.sign("Ed25519")` is already used by the page. It needs a current browser.
- **A non-extractable `CryptoKey`.** To persist one across visits it must live in IndexedDB on the plane's origin. That conflicts with screens-publish R11 as written, so it needs a BOB ruling on whether a non-extractable handle is a "key written to storage".
- **Trust in the code that holds the key.** Any key on the plane's origin can be used by whatever script the operator serves (DEC-2). The offline page's selling point, "open it from a local copy", is lost. The page's strict CSP (answer-envelope R6, nonce scripts, no outside connections) mitigates this.
- **The statement shown before signing.** The shell must build the statement locally from `doc_sha` exactly as `caseRatifyStatement` does, and show the member what she signs.
- **A confirmation per use** (passphrase or device unlock), and the password re-ask (D3).
- **Answers for each step.** Every refusal above must be drawn by its words, and nothing is drawn as signed before the answer arrives (screens-publish R10).
