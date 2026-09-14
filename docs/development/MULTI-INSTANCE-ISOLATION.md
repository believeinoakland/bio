# Multi-instance-per-account isolation — the plan, PLANNED NOT BUILT

**Status** · An audit and plan, 2026-09-15, by session BOB at Bob's direction: what collides when several BIO instances share one Cloudflare account (buckets, fleet script names, the members' missing R2 binding, the freshness check, the central UI's fixed pointer), the cleanliness verdict, the lane map and interfaces crossed, the ordering constraints, and Bob's sequencing. **Planned, not built; no lane engaged.** Complete as a plan at `origin/main` `51d128a`, with Bob's steer folded in (shared stateless workers are acceptable if partitioning is structural). as of 2026-09-14.

**Place in the system** · A level-2 design serving construct 15 of `BIO_System_Design.md` §3 (distribution) and §6 (the runtime shape). It crosses I6, I8 and I9 (the fleet interfaces) and the installer↔plane binding contract; DIST #2 holds its lane on it until the member surfaces are designed.

**Incomplete sections** ·
- §Lane map and interfaces — no IC has been proposed; the per-request instance identity for a shared `agent-worker` is named as the hard case and not designed.
- §Sequencing (Bob's) — waits on the member-surface design; nothing here is scheduled.

**Contents**
- [What collides, and what does not](#what-collides-and-what-does-not)
- [Cleanliness verdict](#cleanliness-verdict)
- [Lane map and interfaces](#lane-map-and-interfaces)
- [Ordering constraints](#ordering-constraints)
- [Sequencing (Bob's)](#sequencing-bobs)

---

**Basis: audit + plan, 2026-09-15, written by BOB at Bob's direction. Nothing here is built
and no lane is engaged.** Bob, 2026-09-14/15: fix per-group isolation in the installer and
operating environment so several BIO instances can live in ONE Cloudflare account; make the
evidence-bucket names group-relative and find every other single-instance naming
assumption; plan it rigorously BEFORE engaging lanes — and design the MEMBER SURFACES first,
so that this is built after that design, not before. The steer that reshaped the plan
(Bob, 2026-09-15): **a shared stateless worker is acceptable — "I don't have a problem with
all instances using a single OCR worker" — as long as results are RIGOROUSLY partitioned by
instance, and "structural isolation so that a shared worker is incapable of writing to the
wrong partition."** So: isolate by partitioning DATA structurally, not by duplicating compute.
This sharing applies WITHIN one Cloudflare account running several instances; the sovereign
deployment (one group, one account) is already isolated by the account boundary.

Why it exists: Bob chose his own (Paid) account for the bond-measure shakedown instance, and
the audit found a second install into that account would share `biosmoke7`'s evidence buckets
and overwrite its fleet workers, silently. Measured at `origin/main` `51d128a`.

## What collides, and what does not

The plane's runtime is clean: it reads every resource through a binding (`env.CAPTURES`,
`env.PUBLISHED`, `env.STORE`, `env.SELF`, `env.INSTANCE_NAME`), hardcoding no account-global
name in `src/`. The collision surface is entirely DEPLOYMENT WIRING — fixed names the
installer and the wrangler configs bake in.

**Do NOT collide (state them so no lane wastes work):** the Durable Object namespace and
class `Store` + migration tag (scoped to the worker script — two planes under two slugs each
get their own); the `*.workers.dev` subdomain prefix (one-per-account and permanent,
`ensureSubdomain` `newgroup/src/index.mjs:515-538`, but each instance is
`https://<slug>.<prefix>.workers.dev` and the slug is uniqueness-checked — shared harmlessly).

| # | surface | file:line | fixed name | why it collides | group-relative form | lockstep consumers |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | installer buckets | `newgroup/src/index.mjs:244` (`ensureBuckets`), `:314`, `:349` | R2 `bio-captures` | account-global; second install treats "already exists" as success and SHARES instance #1's working corpus | `bio-captures-<slug>` (or one bucket with structurally enforced per-instance key prefixes — see the steer) | plane `env.CAPTURES`; `pdf-worker/src/index.mjs:127` and `ocr-worker/src/index.mjs:116` read it directly; the members' own R2 binding (#6) |
| 2 | installer buckets | `:244`, `:315`, `:350` | R2 `bio-published` | same for the ratified/public corpus — breaks the publication fence across groups | `bio-published-<slug>` | plane `env.PUBLISHED` |
| 3 | plane config | `bio-plane/wrangler.jsonc:40-41` | `CAPTURES→bio-captures`, `PUBLISHED→bio-published` | `derive-bindings.mjs:74-76` copies `bucket_name` verbatim, every deploy binds the same two buckets | slug-suffixed `bucket_name` | `derive-bindings.mjs`; `deploy.mjs`; installer `uploadInstall`/`uploadUpdate` |
| 4 | fleet member config | `pdf-worker/wrangler.jsonc:29-31`, `ocr-worker/wrangler.jsonc:71-73` | `CAPTURES→bio-captures` | members read the shared bucket | per-slug, or shared-with-partition | members; installer `uploadMember` (#6) |
| 5 | fleet script names | `agent-worker/fleet-member.json` `name`, each member's `wrangler.jsonc:3`; installer upload `newgroup/src/index.mjs:427` (`/workers/scripts/${m.member}`); plane bindings `bio-plane/wrangler.jsonc:109-111` | `agent-worker`, `ocr-worker`, `pdf-worker` | **the hard collision as-built**: a second install re-`PUT`s the same three names, overwriting #1's fleet; `agent-worker`'s `PLANE` binding is templated to ONE slug (`:417-418`; `agent-worker/wrangler.jsonc:83`) so a shared agent-worker calls back only the last-installed plane | EITHER `*-<slug>` per instance, OR (Bob's steer) shared stateless members that receive the instance identity per request and are structurally unable to write the wrong partition; `agent-worker` is the hard case (credential cascade + plane callback) | plane service-binding targets; `derive-bindings.mjs:77-79`; `deploy-fleet.mjs` PHANTOM map (`tools/deploy-fleet.mjs:65,102-109`); installer `uploadMember` (`:427`) |
| 6 | installer (member R2 gap) | `newgroup/src/index.mjs:411-419` | — (a MISSING binding) | installed members get NO `CAPTURES` binding at all today (latent bug); when buckets go per-slug the templated binding must be ADDED in the same change or members silently read nothing | add `r2_bucket CAPTURES→<instance bucket>` | `pdf-worker`/`ocr-worker` runtime |
| 7 | freshness check | `:207-210` (`scriptExists`), used at `:652` | checks ONLY the plane slug | a colliding second install passes the gate, then clobbers buckets/fleet | probe the instance buckets and the three members too | installer flow |
| 8 | plan probe | `:221` (`PLAN_PROBE = "bio-plan-probe"`) | fixed throwaway script | two CONCURRENT installs race on the name; low severity | leave (converges) or `-<slug>` | none |
| 9 | central UI | `civicos-ui/worker.template.mjs:14`, `civicos-ui/deploy-ui.mjs:17` (`service: "biosmoke7"`) | hard-wired instance `biosmoke7` | not a per-account collision (central UI, not group-installed) but a fixed single-instance pointer | build-time `--instance <slug>` templating of proxy URL + `PLANE` binding | `deploy-ui.mjs`; UI build |

## Cleanliness verdict

Achievable, but not by a pure rename — a slug-substitution pass everywhere a resource name is
minted (the plane's own `SELF`/worker name and the members' `PLANE` binding are ALREADY
templated from `slug`, so the precedent exists; `derive-bindings.mjs` and `deploy-fleet.mjs`
already funnel every name through one substitution point), PLUS a data story for the one live
instance. **Not clean without a fight:** R2 has no rename and no sub-namespacing (N buckets per
account, each created before the plane binds it — `workers-r2.write` is already in the
installer's OAuth scope, `:39`); **`biosmoke7`'s live data** — its buckets already hold real
captures, published bytes and timestamp certificates, and R2 = copy not rename — so the plan
GRANDFATHERS `biosmoke7` on the legacy unsuffixed names and applies isolation only to new
installs, never a copy-migration of the live smoke instance (a live-record hazard). Under
Bob's steer the "shared-fleet temptation is a trap" finding is REPLACED by a requirement:
sharing is allowed, partitioning must be STRUCTURAL — the shared worker is handed the instance
identity per request and cannot address another instance's partition; for `agent-worker` that
means the instance and its credential scope travel with the request and never cross.

## Lane map and interfaces

| change | lane | interface crossed |
| --- | --- | --- |
| bucket naming/creation (#1, #2, #7), `uploadMember` R2 add (#6), fresh-check widening (#7), fleet upload names or shared-with-partition (#5) | DIST (`newgroup/` is out of bounds without instruction) | installer↔plane binding contract; **I6/I9** because members read `bio-captures` directly (`INTERFACES.md:852,1257`) |
| `bio-plane/wrangler.jsonc` bucket + service targets (#3), `derive-bindings.mjs`, `deploy.mjs`, `deploy-fleet.mjs` (#5) | DIST (deploy tooling); plane runtime unchanged (reads bindings) | — |
| fleet member configs (#4, #5) and the per-request instance identity if shared | FLEET | **I6** (plane→pdf-worker), **I8** (plane↔agent-worker), **I9** (plane→ocr-worker) — via `INTERFACE-CHANGES.md` |
| `civicos-ui` instance templating (#9) | UI | none numbered |

## Ordering constraints

1. **Buckets before bind, same change.** Installer order is plan-probe → `ensureBuckets`
   (`:711`) → `uploadInstall` (`:730`); per-slug creation and per-slug binding land together or
   the plane binds a missing bucket.
2. **Fleet name substitution is a triple-site lockstep** — uploaded script name (`:427`),
   plane binding target (`bio-plane/wrangler.jsonc:109-111` → `derive-bindings.mjs:77-79`),
   `deploy-fleet.mjs` PHANTOM map — or the plane binds a name the installer never uploaded
   (Cloudflare `10143`, the defect `deploy-fleet.mjs` exists to pre-empt).
3. **`uploadMember` R2 add (#6) precedes or accompanies per-slug buckets.**
4. **Do not break `biosmoke7`:** land the smoke-slug grandfather before general suffixing
   reaches a `biosmoke7` deploy; `civicos-ui` still points at it (#9).
5. **Fresh-check widening (#7) lands WITH suffixing**, or the installer's own guard is blind to
   exactly the collisions being removed.

## Sequencing (Bob's)

Design the member surfaces first (the journey canvas and the content design), then engage
lanes on this plan. DIST #2 is holding its lane on exactly this instruction (told 2026-09-14).
