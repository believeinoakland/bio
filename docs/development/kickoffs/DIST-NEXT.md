# DIST — resume here. Rewritten 2026-08-10. The previous contents were FIVE DAYS STALE and described a world that no longer exists.

**Read this box before anything else.** The file you would otherwise have read was written
2026-08-04 and said the release seed was missing and the plane was deployed-but-unreleased.
**Both were resolved on 2026-08-05.** A session starting from that text would spend its first
hour re-solving a solved problem and might reach for a key rotation that is not needed. It has
been replaced rather than appended to, because a stale resume prompt is not a document with an
error in it — it is a wrong instruction to the one session that must act on it.

Everything below was MEASURED on 2026-08-10 against `origin/main` at `0432308` and against the
live account, not remembered. **Verify it yourself anyway** — that is the standing rule and it
is what caught the staleness above.

## What is TRUE right now, measured

**The release is coherent and serving.** All four version sources agree, and `hygiene`'s D-106
check (the authority, not a grep) exits 0:

| source | reads |
| --- | --- |
| `bio-plane/package.json` | 0.56.0 |
| `bio-plane/wrangler.jsonc` `vars.VERSION` | 0.56.0 |
| `release/RELEASE.json` | 0.56.0, signed, `sha256 da67aa4d…` |
| the live plane `biosmoke7` `/version` | 0.56.0 |
| what `raw.githubusercontent.com` serves installers | 0.56.0, same sha |

So a group installing through `newgroup` today receives the same bytes the smoke instance is
running, and the signature over them verifies against the `ARMED_SIGNERS` trust root. **The
seed is present and is the EXISTING signer** — no rotation, no `ARMED_SIGNERS` edit. It lives
at `~/Downloads/bio-signing-keys.txt`, NOT in `.env`; `.env` is populated from it and is
machine-local, so if `.env` is ever empty again that file is the answer.

## THE ONE THING THAT REFRAMES YOUR WHOLE LANE, and it is measured

**THE FLEET HAD NEVER BEEN DEPLOYED. ONE HALF OF IT NOW IS.** Measured on 2026-08-10: the
account held only `biosmoke7`, `civicos` and `newgroup` — listed, not probed by guessed name.
`pdf-worker` was then built and deployed and is serving; **`agent-worker` cannot be deployed
as configured** and the reason is D-292 below.

```
before          biosmoke7 200   civicos 200   newgroup 200   pdf-worker 404   agent-worker 404
after           biosmoke7 200   civicos 200   newgroup 200   pdf-worker 200   agent-worker REFUSED
```

And the plane's own configuration declares three service bindings that the deployed plane does
not have:

```
wrangler.jsonc declares : PDF_WORKER -> pdf-worker, AGENT_WORKER -> agent-worker, SELF -> bio-plane
live biosmoke7 has      : []          (zero service bindings of any kind)
```

**DS-1 is written as "the installer installs the fleet". Read against the tree it is larger
than that, and the deploy above is why: half the fleet could not go up at all.** Both members exist in
the repo with `fleet-member.json`, both carry suites, and a great deal of work has been built
against them — FL-2 through FL-5, D-262, D-276 — with **no member ever having run outside a
test harness.**

**That is D-202, still open, and its remaining half is yours**: `deploy.mjs` sends a HARDCODED
binding list and its `keep_bindings` gained `service` (the protective half, landed 2026-08-05)
but it still does not DERIVE its bindings from `wrangler.jsonc`. So the file the repository
treats as authoritative and the configuration that actually ships have no mechanism keeping
them equal. Arming `SELF` also arms two monitoring consumers that are inert today — REC-26's
and CAP-3's — whose semantics are RECORD's and CAPTURE's, so that is a change to make
deliberately and with them told, not as a side effect of a deploy.

**MEASURED 2026-08-10 BY ACTUALLY TRYING IT, and it changes DS-1's content: `pdf-worker` IS
NOW DEPLOYED and serving `{"ok":true,"name":"pdf-worker","version":"0.1.0"}`. `agent-worker`
was REFUSED by Cloudflare** — *"Service binding 'PLANE' references Worker 'bio-plane' which was
not found"*. **Every service binding in the repo names `bio-plane`, and no worker is ever
deployed under that name**: `deploy.mjs` takes the slug as an argument, this instance is
`biosmoke7`, and a group's instance is named by the group. That is **D-292**, and it corrects
D-202's stated remainder — deriving bindings from `wrangler.jsonc` alone would make every plane
deploy fail identically. The binding target must be the INSTANCE SLUG. **Do not fix it by
writing `biosmoke7` into the configs**; that hardcodes the smoke instance into files meant for
arbitrary group accounts.

**Sequencing consequence worth stating before you plan:** DS-2 (version authority spans the
fleet) and DS-4 (the gated deploy) both assume a fleet that can be versioned and deployed.
Neither is meaningful until a member has been deployed once. **DS-1 is therefore not merely
first in the dependency list; it is the row that makes the other three real.**

## Your rows, and what waits on them

| row | what | blocked on |
| --- | --- | --- |
| **DS-1** | D-115 — the installer installs the FLEET; an instance that cannot get it SAYS SO rather than silently doing less (D-106's class). `bindings: []` stays structural on the installer itself | FL-2 — landed. **Unblocked now** |
| **DS-2** | D-116 — version authority spans the fleet | DS-1 |
| **DS-3** | the account cascade config — an instance-level token; **minting stays a MEMBER act** | DS-1 |
| **DS-4** | the gated deploy, then hand to VF-4 | DS-1, DS-2, FL-2 |
| FL-6 | FLEET's — the Claude-account cascade at runtime | **DS-3** |
| VF-4 | VERIFY's — live verification in scratch, a full CHECK run against a concluded inquiry. **The arc's finale** | **SK-4 and DS-4** |

`QUEUE.md`'s `## IS BUILD PLAN — STATUS` is the tracker; `IS-BUILD-PLAN.md` owns the rows and
the ids. **Do not write these ids as `### <ID> ·` or `| <ID> |` in `QUEUE.md`** — those are
`mintid`'s two allocation-site shapes and doing so allocates them a second time. `plancheck`
already failed that way once and the refusal is correct.

## Authority, and where it stops

Bob, 2026-08-10: **the smoke-instance deploy authority is STANDING. Only REAL-record and
installer releases come back to him.** So deploying `biosmoke7` to exercise the fleet is yours
to do; putting an installer in front of real groups is not.

`deploy.mjs` refuses a plane release without the baton and reads the baton from the REMOTE. It
also now REFUSES the `civicos` and `pdf-worker` slugs by name (D-201) — it deploys the plane's
metadata and would DELETE bindings a different worker needs. **If you deploy a fleet member,
do not reach for `deploy.mjs`.**

## The gate, unchanged and not optional

`kickoffs/DIST.md` holds the ten steps. The ones that have actually caught things:

- **Regression is DIST's own**, run on the merged `main`, not trusted from the contributing area.
- **Sign with four negative controls** — altered bytes, wrong namespace, wrong key, and the
  previous release's signature against the new bytes. All four must FAIL to verify. Stock
  `ssh-keygen -Y verify` is the acceptance; the repo's own signer is browser-only.
- **A deploy verified is not a build serving.** `deploy.mjs` reads the bytes back and then WAITS
  for the version to serve. If it prints ROLLOUT NOT CONFIRMED, do not measure behaviour yet.
- **Re-cut the installer and read it back**, confirming the embedded version AND that
  `bindings: []` is still empty. That empty binding set is a structural security guarantee.
- **`op=audit` clean before anything is called done.** It is NOT clean today — see below.

## What you inherit that is not yours to fix

- **D-200** — `op=audit` on the live instance is not clean: ten `C-18.9` findings, documents at
  or past `verified` naming no provenance chain. Measured pre-existing and identical in the
  0.55.0 and 0.56.0 bundles, so no release caused it. It is RECORD's to fix and **yours to
  decide whether it blocks a release — and to SAY SO rather than deciding it silently.** 0.56.0
  shipped with it stated rather than passed.
- The `.env` `BIO_ADMIN_TOKEN` and `BIO_MEMBER_TOKEN` did not authenticate against the live
  instance when last tried (2026-08-05), so `op=audit` could not be run from here. Establish
  whether that is still true before planning around it; D-205's rotation has since happened.

## Which account you are talking to

`wrangler` authenticates from an OAuth session stored on the MACHINE, and **this machine's
OAuth is the `neo` persona** — measured 2026-08-05: `npx wrangler whoami` reported
`neocloudflare@neologic.com` / `2f4cabcc…`, not this project's account. Both `wrangler.jsonc`
files pin `account_id`, so the repository decides where a Worker goes — but **run wrangler with
`CLOUDFLARE_API_TOKEN` from `.env`**, which resolves to `Biocloudflare@neologic.com's Account`
/ `20b533579290b9b93168345edd3b7f72`. `scripts/deploy.mjs` was never exposed: it takes the
account from `CF_ACCT` and calls the REST API directly.

**If any wrangler command reports a different account, stop and say so.**
