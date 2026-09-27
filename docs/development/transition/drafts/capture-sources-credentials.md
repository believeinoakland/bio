# capture-sources: the credentials members supply (K103, K109 (3)) — draft for BOB

Drafted for BOB from `origin/tranche/T5`: K103 (Bob's (3) and BOB's reading), K109 (3), capture-requests R2 and R38–R42. Next free id after capture-sources' R54: R55. Every statement is not yet met. Where a statement depends on an "Open for BOB" item it says so. Those items are answered at the end, each with a recommended answer, and nothing in the draft decides them.

---

## To add under Public › Provides (new subsection, after "Google Drive")

#### Credentials members supply for a refused capture (K103, K109 (3))

Terms. A **credential** is what a member supplies so that a source's refusal (capture-requests R40) can be retried (R42): its **kind** is `login` (login credentials), `user-agent` (a user-agent setting) or `other` (another authorisation). Its **secret** is the supplied value. Its **scope** is `member` (the supplier's own), `project` (one project, named) or `group`. Every refusal is an answer `{ok: false, reason, code, check, translation, detail}`, never a throw. Its catalogue rows are allocated with the job, as K109 (3) allocates C-28's. A refusal's `detail` never contains a secret.

**credentialSupply({kind, host, secret, scope, project, by}) → `{ok: true, credential}` | refusal**
- **R55** Stores a credential under the declared scope and answers its listing entry (R58). It never answers the secret. Refusals, in order: `CAPTURE_CREDENTIAL_NOT_A_MEMBER` when `by` names no active member (`memberFacts`); `CAPTURE_CREDENTIAL_BAD_KIND` for a kind not in the three; `CAPTURE_CREDENTIAL_BAD_SCOPE` for a scope not in the three, or for `project` given with any scope but `project`; `CAPTURE_CREDENTIAL_NO_PROJECT` when the scope is `project` and `project` names no held project (`bundleInfo`); `CAPTURE_CREDENTIAL_NO_SECRET` for an empty or non-string secret; `CAPTURE_CREDENTIAL_NOT_PERMITTED` when R63 does not let `by` supply at that scope. `host` is the lower-cased host the credential is for (Open 1). A refusal writes nothing. *(not yet met: K103, K109)*

**credentialsForFetch({host, principalPlane, target}) → [entry]**
- **R56** Answers the unwithdrawn credentials whose scope admits a fetch for a request with plane principal `principalPlane` and target inquiry `target`: a `member` credential only when its supplier is `principalPlane`; a `project` credential only when `bundleInfo(target).project` is its project; a `group` credential for any request. Each is also limited to `host` (Open 1). Each entry is `{credential, kind, secret, supplied_by, scope, project}`: the facts a capture fetched with it records in its provenance (that credentials were used, whose they were, and at which scope). The capture is also marked not reproducible by the public. Recording both is the caller's (Suggestions). Order and how many: Open 3. The answer is `[]` when none is admitted and when a secret cannot be decrypted (Open 5). Never throws. *(not yet met: K103, K109)*

**credentialWithdraw({credential, by}) → `{ok: true, withdrawn}` | refusal**
- **R57** Withdraws a credential. From that call on, R56 never answers it. `CAPTURE_CREDENTIAL_NO_SUCH` covers an unknown id and one `by` may not see (R58); both cases get the same answer. `CAPTURE_CREDENTIAL_NOT_PERMITTED` applies when R63 does not let `by` withdraw it. Withdrawing twice answers `already: true`. What stays held afterwards: Open 4. *(not yet met: K103, K109)*

**credentialList({viewer, scope, project}) → [entry]**
- **R58** Lists the credentials the viewer may see (Open 6), filtered by `scope` and `project` when given. Each entry is `{credential, kind, host, scope, project, supplied_by, supplied_at, withdrawn_at, withdrawn_by}`. It never contains the secret, any part of it, its length or its digest. Never throws. *(not yet met: K103, K109)*

---

## To add under Private › Invariants

- **R59** A secret is held encrypted at rest. No row of this module's tables holds a secret's bytes in plaintext. A test that supplies a known secret and reads the tables raw never finds it. *(not yet met: K103)*
- **R60** Never shown back. No service or op of this module answers a secret, except R56. R56 is an in-process service and is never an op. A secret does not reach an observation, a log line or a refusal. *(not yet met: K103)*
- **R61** Never exported. Credentials live in this module's own table and never in a bundle, a file, a manifest entry or a snapshot. No export, publication or image of the record (`readImage`) carries a secret. *(not yet met: K103)*
- **R62** Read only for fetches within scope. A credential's scope and project are the ones declared at supply and are never changed afterwards: to change them, withdraw the credential and supply it again. R56 is the only read that answers a credential for use, and only under R56's scope rule. *(not yet met: K103, K109 (3))*
- **R63** Who may supply and withdraw. The credential's owner must be an active member (R55). A `member` credential is its supplier's own, so no member supplies one for another member. Who may supply a `project` or `group` credential, and who may withdraw at each scope, is Open 2. *(not yet met: K103; pending Open 2)*
- **R47** (amended; Open 7) No binding of its own, and no store but the credentials of R55–R63. Every fetch, hash and write of a capture is the caller's (`put`, `sha256`, the binding or service passed in). The pure functions give the same answer for the same inputs.

## To add under Private › Uses

- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge` (the credentials table, Open 4), and `bundleInfo` (a project's existence, R55, and a target's project, R56).
- `membership`: `memberFacts` (an active member, R55), and the facts R63 and R58 read once Open 2 and Open 6 are answered (`isProjectEditor`, `isProjectOwner`, `isAdministrator`, `sight`).

*(Neither is yet in `modules.json`'s uses for capture-sources. Both are layer 2, so both come earlier in the order (P4). capture-requests' use of capture-sources is also undeclared there.)*

## To add under Private › Satisfies

- `docs/development/SOURCE-ACCESS.md`, DEC-47 as K103 extends it beyond publicly available documents: a member may supply what a retry needs and declare its scope (R55–R63). This includes BOB's reading of K103 (3): the secrets are encrypted, never shown back or exported, and used only under their scope (R59–R62). Placement is K109 (3): the credentials' home is this module, each credential is scoped to its member, one project or the group, and it is read only for requests within that scope.

## To add under Private › Suggestions

- **The key.** Keep it outside the store, as a Worker secret (for example `CAPTURE_CREDENTIALS_KEY`, set with `wrangler secret put` on account `20b533579290b9b93168345edd3b7f72`). Encrypt with AES-GCM through WebCrypto, using a fresh IV for each row. Use the row's id, scope and project as associated data, so that a ciphertext copied into another row or scope fails to decrypt. To rotate the key, re-encrypt every row under the new key.
- **Obligations only callers can keep** (P7):
  - capture-requests checks that the supplier can see the request's target before it calls R55 (its R41).
  - capture-requests passes `principalPlane`, `target` and `host` to R56 from the row, never from a body.
  - `capture` (or `provenance`) records R56's facts on the capture, marks it not reproducible by the public, and never writes the secret into the capture's record or receipt.
- **Ops**, which are the control plane's to route: `capturecredentialsupply` and `capturecredentialwithdraw` (admin and member with `contribute`, mutating), and `capturecredentials` (admin and member, carrying the viewer stamp). R56 has no op.
- **Tests:** `bio-plane/test/m/capture-sources/`. Cover a raw-table scan for a known secret (R59), a sweep of every answer shape for the secret (R60, R61), and one admitted and one refused request for each scope (R56).

---

## Open for BOB

1. **Host binding.** K103 and R41 scope a credential by who, not by where. Unbound, a login supplied for one site would be offered to every site a request names. *Recommend:* each credential is for one host, exact and lower-cased, taken from the refused request's host. R56 answers it only for that host, and it is never sent after a redirect to another host.
2. **Who may supply and withdraw at each scope.** K103 establishes only that "a member" declares the scope, and R41 that the member can see the request's target. *Recommend:*
   - `member`: the member supplies. The member or an administrator withdraws.
   - `project`: a project editor supplies (`isProjectEditor`). The supplier or any owner of the project withdraws.
   - `group`: any active member supplies (Bob's words). The supplier or any administrator withdraws.
3. **Several credentials admitted for one fetch.** *Recommend:* use the narrowest scope first (member, then project, then group), and the newest within a scope. Make one fetch with one credential. If the source refuses again, the request is refused under R40 as before, with no cascade through the others.
4. **Retention.** *Recommend:*
   - Withdrawal destroys the ciphertext at once and keeps the secretless entry (R58).
   - Credentials have no expiry of their own.
   - A member's revocation (membership R8, R20) withdraws their `member` credentials. Their `project` and `group` credentials are kept, since they were given to the project or the group.
   - For purge, `member` and `group` credentials are exempt, as membership R59 exempts credentials. `project` credentials are keyed to the project and cleared with its purge.
5. **No key bound, or a secret that will not decrypt.** *Recommend:*
   - With no key, supply is refused (`CAPTURE_CREDENTIAL_NO_KEY`) and nothing is stored in the clear.
   - R56 answers `[]` with the reason, so the drain fetches without credentials and the source's refusal stands.
6. **Who sees the listing (R58).** *Recommend:*
   - A member sees their own `member` credentials.
   - A project's credentials are visible to viewers at `FULL` sight of it.
   - `group` credentials are visible to every member.
   - Administrators see every entry, so they can withdraw under Open 2 and 4. No one ever sees a secret.
7. **Capture-sources gains a store.** Its Purpose ("with no store of their own") and R47 contradict R55–R63. *Recommend:* amend the Purpose to add "and the credentials members supply for a refused capture (K103)", and amend R47 as drafted above. Also:
   - add `record-core` and `membership` to its uses in `modules.json`, and `capture-sources` to capture-requests' uses;
   - drop "pending BOB's placement of its home" from capture-requests R41 and its Uses line, since K109 (3) placed it.
8. **A supplied user-agent and DEC-47's legible agent** (a capture-requests question that R56 feeds). *Recommend:* judge a `user-agent` credential at the drain as capture-requests R14 judges the member-browser form (DEC-47's access-parity amendment), not as the legible CivicOS agent. The capture's provenance names it.
