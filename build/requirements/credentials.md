# credentials — requirements

**Status** · DRAFT by a worker for BOB #80, 2026-10-01, on `tranche/T19` before layer 2 starts, for BOB's review; split from `membership` by K617, K636 BOB-1 and K637 (a module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning), placed after membership (K653 BOB-2, rule 3's later-new case). R1–R15 are `membership` R1, R72, R73, R2, R3 (its sessions half), R25–R27, R89, R90, R70, R28, R62, R29 and R30, moved without change of meaning and renumbered (each marked "was"); they are retired in `membership.md` with pointers here. R16 and R17 state K637's seam: the half of `membership` R8 and R20 that ends sessions and revokes keys, now done by this module's `onRevoked` listener inside the same act, and the founder's claim as a fact this module states and membership reads (`membership` R64, R86, R94). R18 and R19 are `membership` R59's and R91's shares. Every id is not yet met until CREDENTIALS #1 copies the code (T19 layer 2). Layer 2. Code: `bio-plane/src/credentials/` (copied from `bio-plane/src/membership/index.mjs` and `schema.mjs`; `from: ["legacy-checks", "legacy-store"]`, K636 BOB-2). N505 folded by a worker for BOB #98 at T24's opening, 2026-10-02: R21 (`signers` records `status_at`, when a key's status changed) new and R8's `signerList` answers it; not yet met (T24).

## Public

### Purpose

Holds the credentials a member or the instance acts by: the founder's password and claim, members' passwords and sessions, the signer keys whose signatures the record accepts, and the credentials AI work runs under. Who the members are, and what each may do, is `membership`'s; this module reads it through membership's services and never decides it.

### Provides

Terms as `membership` states them (administrators, `by` the control plane's stamp). Every refusal names its reason; no service throws.

**Sign-in and sessions**
- **R1** (was `membership` R1) `claim({password, tokenFp})` sets the founder's password once: `PASSWORD_TOO_SHORT` under 12 characters; `ALREADY_CLAIMED` once claimed, unless `tokenFp` differs from the one recorded at the claim (the bootstrap credential was replaced), which re-arms the claim.
- **R2** (was `membership` R72) `bootstrapState(tokenFp)` answers `{claimed, rearmed, consumedAt}`: `claimed` once the bootstrap credential is spent, unless `tokenFp` differs from the one recorded at the claim (`rearmed`, R1); `consumedAt` is the instant the instance was claimed, `null` when re-armed. It names nobody and returns no secret.
- **R3** (was `membership` R73) `setPassword({role, password})` stores a salted, derived hash for `role`, replacing any earlier one, and never the password. Who may call it is the control plane's rule (the `setpassword` op).
- **R4** (was `membership` R2) `login({role, password, ttlSeconds})` returns `{token, expires}` for a role holding a credential whose password matches and, for `member:<id>`, whose member is `active` (`membership.memberFacts`, its R68). Every other case (no credential, inactive member, wrong password) answers the one refusal `SIGN_IN_REFUSED` with one fixed detail, at the same cost, so a refusal never tells which roles exist.
- **R5** (was `membership` R3, its sessions half) `session(token)` returns `null` for an unknown or expired token, else `{role, expires, capabilities, administer, member, handle, rootOfTrust}`, the last five being `membership.sessionRights(role)` (its R92) read at that call, so a capability change or revocation takes effect on the next request.

**Signing keys**
- **R6** (was `membership` R25) `signerAdd({keyB64, memberId, comment, by})`: `NOT_AN_ADMIN` as `membership` R12 (through `membership.notAnAdmin`, its R84); `BAD_KEY` unless the base64 field of an SSH public key; `NO_SUCH_MEMBER`; `SIGNER_MEMBER_NOT_ENROLLED` (no handle) or `SIGNER_MEMBER_NOT_ACTIVE`. Registering a known key rebinds it and makes it `active`, never a second row.
- **R7** (was `membership` R26) `signerSet({keyB64, status, by})`: `NOT_AN_ADMIN` (`membership` R84); `BAD_STATUS`; `NO_SUCH_KEY`; activating is refused as R6 for the owning member; revoking is never refused.
- **R8** (was `membership` R27) `signerList()` gives each key's `status`, `status_by`, `status_at` (R21), `member_status` and `attests`: true exactly when the key and its member are both `active`. When false, `attests_why` is `key_revoked`, `member_absent` or `member_<status>`. The set of keys the ratification gate accepts is exactly those with `attests` true, from this one predicate. Each key also states `origin` (`admin` for a key R6 registered, `self` for one R9 registered) and `registered_by`. *(not yet met: T24)*
- **R9** (was `membership` R89) **signerRegisterOwn({keyB64, comment, by})** (`op=signerregister`). A member session registers its own browser-held key. `MACHINE_CANNOT_REGISTER_KEY` (C-96.17) for a machine credential or an operator token; `BAD_KEY` as in R6; `SIGNER_MEMBER_NOT_ENROLLED` or `SIGNER_MEMBER_NOT_ACTIVE` for `by`; `SIGNER_KEY_HELD_BY_ANOTHER` (C-96.15) when another member holds the key, which is never rebound. A key `by` already holds and that is `active` answers `existed: true`, unchanged (its `origin` and `registered_by` stay as first registered); one `by` holds that is revoked is refused `SIGNER_KEY_REVOKED` (C-96.16) and stays revoked, since only an administrator re-activates a key (R7). A new key is `active`, with `origin: "self"` and `registered_by: by`. Every administrator is notified: the answer's `notified` names `membership.activeAdmins()` (its R86) at that instant, and the self-registration is read from the key's row (`origin`, `registered_by`, the instant) for the notice the feed delivers (N375).
- **R10** (was `membership` R90) **signerRevokeOwn({keyB64, by})** (`op=signerrevoke`). A member revokes their own key, and this is never refused for a key they hold. Another member's key answers `NO_SUCH_KEY`, identically to a key no one holds. A replacement is a new R9. An administrator revokes any key by R7.
- **R21** (N505) Each key records `status_at`, the instant its `status` last changed: set when a key is first registered (R6, R9), and each time an act changes its status (R6's re-activation, R7, R10, R16). An act that leaves the status as it was (R6 on an `active` key, R7 setting the status it has, R9's `existed: true`) leaves `status_at` unchanged. A key registered before `status_at` was recorded holds null ("not recorded"; never back-filled, D-85), until an act changes its status. *(not yet met: T24)*
- **R11** (was `membership` R70) `attestingKeys()` answers the signer keys that attest, the one predicate R8 states, for every reader that splices it today (`signerList`, the gate's facts, a case's document facts).

  Row C-96.15 (R9; N364): `SIGNER_KEY_HELD_BY_ANOTHER`, "This key is registered to another member, so it cannot be yours. Make a new key in this browser. Nothing was changed."
  Row C-96.16 (R9; K535): `SIGNER_KEY_REVOKED`, "This key was revoked, so it cannot be registered again. Make a new key in this browser, or ask an administrator. Nothing was changed."

**AI credentials**
- **R12** (was `membership` R28) `aiCredentialMint({who, tokenId, secretSha, principalKind, principalMember, taskScope, writes, note, confinedTo})`: `AI_CREDENTIAL_MINT_NOT_A_MEMBER` when `who` is absent or a machine; `AI_CREDENTIAL_PRINCIPAL_UNSTATED` unless `principalKind` is `organisation` or `member`; `AI_CREDENTIAL_IDENTITY_TAKEN` for an empty or used `tokenId`. Records the credential with `minted_by` = `who`; never stores a secret, only its hash.
- **R13** (was `membership` R62) An organisation-scoped credential (`principalKind: organisation`) is minted only by an active administrator (the founder included; `membership.isAdministrator`, its R64); anyone else is refused `NOT_AN_ADMIN` (`membership` R84), its `remedy` naming the member-scoped credential open to every member.
- **R14** (was `membership` R29) A member-scoped credential's principal is `who` itself; naming another member is refused.
- **R15** (was `membership` R30) `aiCredentialRevoke({who, tokenId})`: refuses a machine or absent `who` and an unknown id; revoking twice answers `already: true`. `aiCredentialLook({secretSha})` and `aiCredentials({limit})` never return the secret; the list is capped (default 200, at most 500) with a measured `truncated`.

**The seam with membership (K637)**
- **R16** (`membership` R8's and R20's sessions-and-keys half) At start this module registers one listener with `membership.onRevoked` (its R79). Each time a member becomes `revoked` (a carried removal, `membership` R8; a revocation, `membership` R20), the listener ends every session of that member and revokes every signer key registered to them, inside the revoking act (the caller's transaction), so the member's sessions and keys end in the same act as the revocation.
- **R17** (`membership` R64's and R86's "once claimed") At start this module registers with `membership.registerClaimed` (its R94) the one fact `claimed()`: true exactly when the founder's credential is held (R1 has run and has not been re-armed since). It writes nothing and never throws.

## Private

### Uses

- `membership`: `memberFacts` (R68: a member's handle and status, for R4, R6, R7, R8, R9 and R11), `sessionRights` (R92, for R5), `isAdministrator` (R64, for R13), `activeAdmins` (R86, for R9), `notAnAdmin` (R84), `onRevoked` (R79, for R16), `registerClaimed` (R94, for R17), `listenerRefusal` (R81) and `MODULE_ORDER` (R83).
- `record-core`: `transact`, `declarePurge` (R21, for R18).
- `record-grammar`: `isMachineIdentity` and `MACHINE_CLASS_PREFIX`.
- `legacy-checks`: `SIGNER_ENROLMENT_CHECKS` (C-63) and `AI_CREDENTIAL_CHECKS` (C-29), until they move into this module's `checks.mjs` (✱, family names kept), after which the catalogue's copies are deleted.

### Invariants

- **R18** (`membership` R59's share) Credentials, sessions, signer keys and AI credentials are declared exempt from `purge`.
- **R19** (was `membership` R91) R8's `attests` predicate does not look at `origin`: a self-registered key attests exactly as an administrator-registered one.
- **R20** At start credentials registers its `setPassword` with membership's R95, so `enroll` sets the member's password inside the one act, as today (K774).

### Satisfies

- `BIO_Membership_Architecture_v2.md` §5 (sessions and capabilities, as read here), §9 (the founder as root of trust: the claim), and the signing keys and AI credentials of §4 and §11 that `membership.md` cited for R25–R30 and R62.
- DEC-80 item 4 and Bob's ruling K509 (2): a member registers their own browser-held key (R9, R10, R19).
- `BIO_System_Design.md` §3, construct 1 ("Membership and authority").

### Suggestions

- **The copy (K624 (1), K637).** The code is copied from `membership/index.mjs` (`bootstrapState`, `claim`, `setPassword`, `login`, `session`; `signerAdd` … `signerSet`, `signerRegisterOwn`, `signerRevokeOwn`, `signerList`, `attestingKeys`; `aiCredentialMint` … `aiCredentials`) with the tables `credentials`, `sessions`, `bootstrap`, `signers` and `ai_credentials` from `membership/schema.mjs`, and their tests. Membership's same job then deletes its copy, keeping `attestingKeys` and `aiCredentialLook` as named copies (K636 BOB-1) until capture (L3), ai-runs (L6), ratification and publication (L8), admission and control-plane (L11) re-point here.
- **Rows.** C-96.15, C-96.16 and C-96.17 (R9), today in `membership/checks.mjs`, move into this module's `checks.mjs` with their ids, their `where`s naming this module's functions (a row change for promotion's stamp this layer).
- **Routes.** `aicredentialmint`, `aicredentialrevoke`, `aicredentials`, `aicredentiallook`, `bootstrap`, `claim`, `login`, `setpassword`, `session`, `signeradd`, `signerlist` and `signerset` leave `membershipOps` for this module's own ops map; `dispatch.mjs`' `signerregister` and `signerrevoke` re-point here in control-plane's job (L11). The legacy store's delegates (`store.mjs` about 2456–2469, 2613–2620, 2722–2728) are rewired here (§12.2).
- **Converts:** `signer-enrolment` and `aicredential` (this module's shares).
- **R16's listener and R5's fail-closed read.** A listener that throws changes neither the revocation nor its answer (`membership` R79); a session still open then holds no capability, since `membership` R92 resolves a revoked member to none at every request, and a key still `active` does not attest, since R8 asks the member's status.
