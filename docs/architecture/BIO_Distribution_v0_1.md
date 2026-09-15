# BIO Distribution

**Status** · v0.1 DRAFT, written 2026-09-14 by session BOB #11 as the level-1 home of construct 15 of `BIO_System_Design.md` §3 (distribution: installer, releases, fleet, multi-instance), which that map named as having no level-1 document describing the deployed topology. Awaiting Bob's review. It RULES NOTHING: the rules below are restated from where they were ruled — D-297 (closed), D-292, D-106, D-108, D-118, DEC-42, `CLAUDE.md`'s account and release sections, `PARALLELISM.md`'s fleet rules — and the mechanisms are those `newgroup`, `deploy.mjs`, the fleet build and `release/RELEASE.json` implement at 0.58.0. Completeness: complete at its level for the topology as deployed; multi-instance isolation is PLANNED NOT BUILT and sequenced after the member surfaces (§7); the fleet reaching a sovereign group is Bob's gate (§4). The one caveat: `BIO_Technical_Architecture_Decisions_v10.md` still carries the general rules this construct runs under (integrity, the manifest contract, promotion posture) and explicitly disclaims its own retired mechanisms; this document is their live replacement for distribution and cites the rules rather than restating them. as of 2026-09-14

**Place in the system** · Level 1; the authority for construct 15. Depends on `BIO_Technical_Architecture_Decisions_v10.md` (§10.2 integrity rules, §10.10 the manifest contract, §10.11 promotion gate posture, §5 distribution risk tiering — the decisions that survived the substrate change), `BIO_State_Rules_Consistency_v1_5.md` (the record an instance holds — construct 3), `BIO_Content_Framework_v0_10.md` Part II §16 (the three extraction tiers the fleet serves — construct 5), `BIO_Assistant_and_AI_Roles_v0_1.md` §6 (`agent-worker` — construct 11). Level-2 beneath it: `docs/development/MULTI-INSTANCE-ISOLATION.md` (the partition plan), `kickoffs/DIST.md` (the release gate as a process), `docs/development/VERIFICATION.md` (what a green battery does and does not claim), `docs/development/SCHEDULER.md` where it cites the distribution model, `docs/development/CAPTURE-SCALING.md` §Workers Paid. Depended on by `BIO_Publication_v0_1.md` (the published bucket per instance), `INVESTIGATIVE-SESSION.md` §14a (the account cascade decides sovereignty too), `MILESTONES.md` M6 and M7. Supersedes `BIO_Technical_Architecture_Decisions_v10.md` §9, §10.1, §10.5 and §10.6 as the live description (they are marked retired in their own front matter) and the fleet/multi-instance paragraph of `BIO_System_Design.md` §6, which becomes a pointer.

**Incomplete sections** ·
- §7 — multi-instance isolation is planned, not built, and no queue row exists; the collision table and ordering constraints live in `MULTI-INSTANCE-ISOLATION.md` and are pointed at, not restated.
- §4 — the fleet reaches a sovereign group only when Bob deploys the installer that carries it (D-297's last act); until then a group's instance takes the honest branch and this section says what that costs.
- §6 — the account cascade's instance level is built and D-260 (a woken run re-entered; an instance-held credential) is open in the assistant's document; the distribution half of that question is named here and not answered.

**Contents**
- [1. What the construct is, and why it is major](#1-what-the-construct-is-and-why-it-is-major)
- [2. The sovereign instance](#2-the-sovereign-instance)
- [3. The release](#3-the-release)
- [4. The fleet](#4-the-fleet)
- [5. The installer](#5-the-installer)
- [6. The deploy-to-serve ladder](#6-the-deploy-to-serve-ladder)
- [7. Several instances in one account — planned, not built](#7-several-instances-in-one-account-planned-not-built)
- [8. Where it stands, and the frontier](#8-where-it-stands-and-the-frontier)
- [9. What this document does not own](#9-what-this-document-does-not-own)

---

## 1. What the construct is, and why it is major

**The distribution model IS the product.** A group — as small as one person — installs its own sovereign instance into its own Cloudflare account, and from then on holds its own record, its own captured bytes and its own published corpus under its own credentials. There is no hosted service, no central record, no operator who can read a group's evidence: *"the sovereign installer puts instances into other groups' accounts"* (D-118), and REC-64's reasoning names the consequence — *"a sovereign instance on an older surface would freeze the sentence at ITS build, so two instances would tell a member different things. That is the distribution model deciding an implementation question."* Every rule below exists so that an instance installed by a stranger, into an account we never see, behaves exactly as the record describes and can prove it.

Four things follow and are the sections of this document: the RELEASE (what a version is, and how a group can know it is authentic — §3); the FLEET (what a Worker beside the plane is, what it may do, and how it reaches a group — §4); the INSTALLER and the DEPLOY-TO-SERVE ladder (how bytes get into an account and how anyone knows they are serving — §5, §6); and ISOLATION (how one account holding several instances stays honest — §7).

## 2. The sovereign instance

An instance is: one plane Worker (`bio-plane`, the control plane and the OPS table) fronting one Durable Object `Store` with SQLite that holds the record; two R2 buckets, `CAPTURES` for captured bytes and `PUBLISHED` for the public projection; service bindings to the fleet members it has (`PDF_WORKER`, `OCR_WORKER`, `AGENT_WORKER`) and to itself (`SELF`); the member surfaces (`civicos-ui`) proxied to it; a front page. It runs on the group's own account under **Workers Paid** — a requirement, not an optimisation: DEC-42 corrected the premise, *"the honest description of the change is $0/month plus a card becomes $5/month plus a card — not free becomes paid"*, and *"a registered domain is NOT required."* The instance keeps its own record current unattended on one reconciling alarm (construct 14) and tells the truth about what it is and can do.

What the boundary buys is the whole product's trust: a group's evidence never transits a server we run; a group can be left, mirrored and outlived (M6); and a stranger can verify what it published without the instance's cooperation (`BIO_Publication_v0_1.md` §3.10).

## 3. The release

A release is a signed statement about bytes, and nothing about a release is decided by what a tool said — only by what was read back.

- **One version, one authority.** `package.json` is the declared authority; the embed step refuses on ANY disagreement in either direction (D-106: *"Sovereign instances are the whole distribution model, so this is not cosmetic"*). The rule generalises to every fleet member (`PARALLELISM.md` fleet rule 5).
- **The object** (`release/RELEASE.json` at 0.58.0): `version`, `sha256`, `bytes`, `asset`, `sig`, `signer` for the plane; then `fleet[]`, one entry per member — `member`, `asset`, `sha256`, `bytes`, `compat{date, flags}`, `services[]`, `parts[{path, type, sha256, bytes}]` — copied from each member's own manifest, never defaulted; then `fleetSig` over the fleet statement, in its own namespace.
- **Two keys' worth of meaning in one key, kept apart by namespace.** The release signer's public half is compiled into the installer's `ARMED_SIGNERS`, so *"anyone holding the private half can sign a release that every sovereign installer accepts as authentic"* — a supply-chain key for every group that installs BIO. Namespaces (`bio-release`, `bio-release-fleet`, `bio-ratify`) are what stop a ratification signature installing software, and the wizard suite asserts it.
- **Only DIST cuts a release, only from a green `main`** (`CLAUDE.md`; `PARALLELISM.md`): full battery, the installer suite, hygiene, the dual version bump, signing with its four negative controls, deploy with the rollout wait, live verification in the scratch namespace, `op=audit`, the installer re-cut with `bindings: []` confirmed, tag and push — `kickoffs/DIST.md`'s ten steps, which are the process and not the construct.

## 4. The fleet

A fleet member is a Worker beside the plane that does one heavy, dependency-laden thing the plane calls over a service binding: `pdf-worker` (tier-2 text), `ocr-worker` (tier-3 OCR with tesseract-wasm, reading captured bytes from R2 itself), `agent-worker` (the assistant's credential cascade and plane callback). Each is one area's code and DIST's release object: its own `wrangler.jsonc` pinning `account_id`, its own build to a committed bundle guarded byte-identical by the fleet-bundle suite (FL-9/10), its own `fleet-member.json` naming its entry, surface, tests and parts.

The rules a member lives under:

1. **A member versions and rolls out on its own, so D-108 applies per member** — a verification must establish which build ANSWERED, for the member as well as the plane (`PARALLELISM.md` fleet rule 4).
2. **A binding names the instance being installed, never a name in a file** (D-292): the slug becomes the binding target at install and at deploy, and hardcoding the smoke instance's name into installable configs is the defect inverted.
3. **An installable fleet requires one bundled, hashed, signed artifact per member**, and the installer never skips verification for a member — *"an unverified artifact installed into a group's account is the one thing `ARMED_SIGNERS` exists to prevent"* (D-297).
4. **A member being absent is stated, per member, and costs a named branch.** A sovereign instance with no OCR member takes the honest branch that claims nothing about a scan's text (Part II §16); an instance with no agent member has an assistant that says the capability is unavailable (`BIO_Assistant_and_AI_Roles_v0_1.md` §6). Degradation is per member, at install and at update, never silent (D-297, closing).
5. **A shared stateless member across instances is acceptable if results are rigorously partitioned by instance** — Bob: *"I don't have a problem with all instances using a single OCR worker"*, with *"structural isolation so that a shared worker is incapable of writing to the wrong partition"* (`MULTI-INSTANCE-ISOLATION.md`). That is §7's design.

**How the fleet reaches a group.** D-297 closed on 2026-09-14: the release carries the per-member upload facts inside the signed statement; `newgroup` fetches, verifies (the fleet signature rebuilt from the manifest, plane pairing checked) and uploads every member with services slug-templated and parts typed. **The one remaining act is Bob's: deploying the `newgroup` worker that carries it** — installer releases are his gate — so until he clicks, no group receives the fleet, and its instance runs the honest branches above. This document states that as the deployed truth rather than as a plan.

## 5. The installer

`newgroup` is a Worker a group opens in a browser. It carries the release embedded (the embed step, D-106's refusal) and, step by step, with each step an emitted id: `auth` (OAuth into the group's account), `acct`, `fresh` (refuse if a plane of that name already exists), `plan` (probe and require Workers Paid — refuse rather than half-install, DIST-3), `r2` (the two buckets, per instance), `gen` (credentials), `install` (the plane, byte-verified on read-back), `fleet` (each member fetched, verified against the signed statement, uploaded — §4), `addr` (the subdomain), `verify` (the whole read back). An update path mirrors it. Its contract with the account is deliberately minimal and stated: the installer's own configuration carries `bindings: []` — it holds nothing of the group's, and the wizard suite asserts it — and it is deployed by dashboard paste (`newgroup/DEPLOY.md`), the structural guarantee being that empty binding list.

What the installer installs is exactly the topology §2 names, and D-115's lesson is the reason the fleet is in it: an installer that installs the plane and not the fleet produces *"an instance whose PDFs silently do less than every description of it — which is D-106's failure exactly."*

## 6. The deploy-to-serve ladder

**A deploy verified is not a build serving** (D-108; `CLAUDE.md`). The ladder, every rung read back rather than believed:

1. **The account is the repository's, not the machine's.** Both `wrangler.jsonc` files pin `account_id`; `deploy.mjs` takes the account from the environment and talks to the REST API directly; a wrangler command reporting any other account is a stop.
2. **The baton is fetched from the remote and the deploy fails closed if it cannot be** — no deploy from a tree main has not seen.
3. **Version skew is refused** before upload (`resolve-version.mjs`).
4. **The bytes are read back and hashed against the signed asset**; *"this never reports success from what the API said … That comparison is the only thing here that decides anything."* Byte-identical and already SERVING the target version is *nothing to do*; byte-identical alone is a metadata deploy and proceeds.
5. **The rollout is waited for**: `confirmServing()` polls `/version` until the new build answers, prints `ROLLOUT NOT CONFIRMED` if it does not within its budget, and says out loud that Durable-Object-routed ops can still lag after the Worker answers.
6. **Live verification in the scratch namespace, never the real record, swept after; `op=audit` clean** — then the version is serving.
7. **Per member, the same ladder** (`tools/deploy-fleet.mjs`, one at a time), because each member rolls out on its own.

If a live probe contradicts the suite, establish which build answered before believing either — the rule was paid for on 0.52.0, when a probe answered by the old build looked exactly like a security defect in the new one.

## 7. Several instances in one account — planned, not built

Today several instances in one account collide on bucket names, plane and member configuration names, and — the hard collision as built — the fleet script names; the shared `bio-published` bucket breaks the publication fence across groups; the freshness check and the plan probe assume one instance. `MULTI-INSTANCE-ISOLATION.md` carries the nine-row collision table, the cleanliness verdict that grandfathers the smoke instance on legacy names, and the ordering constraints (buckets before bind; the triple-site fleet-name lockstep; the member R2 binding added before suffixing; the freshness check landing with suffixing; the smoke instance never broken). The design is structural partition by instance slug at every site, so that a shared worker is INCAPABLE of writing to the wrong partition (Bob's steer). It is sequenced after the member surfaces (Bob, 2026-09-14) and DIST #2 holds its lane on that instruction; no queue row exists, deliberately, until Program B has run.

## 8. Where it stands, and the frontier

| | status |
| --- | --- |
| the sovereign model; Workers Paid required; no domain required | RULED (D-118, DEC-42) |
| version authority; signing and namespaces; byte-verification; the rollout wait; the account pin | BUILT and asserted (D-106, D-108, `deploy.mjs`, the wizard suite) |
| the installer: OAuth, plan probe, buckets, plane and fleet uploaded and verified, `bindings: []` | BUILT and verified (D-297 closed; DIST-2/3/4 done) |
| the fleet: three members, bundles guarded byte-identical, deployed one at a time | BUILT (FL-6, FL-9, FL-10); 0.58.0 deployed on the project's instance |
| the fleet reaching a sovereign group | WAITS on Bob's click (the installer deploy) |
| multi-instance isolation | PLANNED NOT BUILT; sequenced after Program B |
| DS-1 (installer installs the fleet), DS-2 (version authority spans the fleet), DS-3 (account cascade configuration) | rows not marked done in the build-plan table; DS-1 and DS-2 are satisfied by D-297's closing and owe their rows' reconciliation |
| an instance-held `ai` credential; a woken run re-entered | OPEN (D-260) |
| WARC/Memento interchange; capture-byte custody at scale | M6's absorbed debt (D-99; the R2 growth question) — not designed |
| the front page a group sees; the wizard saying what an absent member costs | built as `newgroup`'s UI; the cost sentence per member is D-115's residue and is stated on install |

## 9. What this document does not own

The record an instance holds (`BIO_State_Rules_Consistency_v1_5.md`); the extraction tiers the fleet serves (Part II §16); the assistant's cascade semantics (`BIO_Assistant_and_AI_Roles_v0_1.md`); the release PROCESS step by step (`kickoffs/DIST.md`); the test battery (`VERIFICATION.md`); the scheduler (`SCHEDULER.md`); the collision table (`MULTI-INSTANCE-ISOLATION.md`); and every ruling, which stays in the ledger it was ruled in.
