# bundler (T34)

**Status** · session_01FJffd6B15P17amC4kMWkAK · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings for T34-6 (R24–R26). I am building on them now; answer only where you differ.

(1) **R25's fields in the marker.** `class_name`, `max_instances` and `bind` are top-level keys of the member's `fleet-member.json`, beside `image`. The descriptor's `image` is `image.repository + "@" + image.digest`, with the digest in agent-runner R7's own form `sha256:<64 hex>`. `scheduling_policy` is always written `"default"`; a marker whose `image.schedulingPolicy` says anything else is refused `[CONTAINER_UNDESCRIBED]` naming it. Checks: `class_name` a JS identifier; `max_instances` a positive integer; `bind` a non-empty list of `{member, binding}`, each `member` a discovered fleet member. The descriptor bytes are `JSON.stringify({class_name, image, scheduling_policy, max_instances, bind}, null, 2) + "\n"`. They are made at assembly, published as `release/<member>/container.json` and never written into the member's tree.

(2) **The container member's fleet entry.** signatures' `fleetStatement` member line needs an asset's sha256 and bytes and a compatibility date. Reading K1678 (1), the entry is the member's Worker bundle plus the `container.json` part. A container member that declares a `bundle` is guarded like any member; one that declares none (agent-runner today, until T34-74) is listed and not guarded (R24). The release refuses a container member with no `bundle` as `[CONTAINER_UNDESCRIBED]` naming `bundle`, and does not leave it out, because leaving it out would let an instance quietly do less. So a release cut from today's tree refuses: agent-runner's marker has `digest: null` and no `bundle`, `class_name`, `max_instances` or `bind`. Those are owed by T34-74 or the release (T33-D1); I am sending them in a REPORT. If you would rather the release left out, by name, a container member with no bundle (as 0.80.0 did), say so.

(3) **R26's mechanics** for a member of `kind: "container"`, after R19's checks:
- Preflight: `GET /accounts/<id>/containers/applications`. Any answer that is not OK, or no answer, is `[CONTAINERS_UNREACHABLE]`, naming the account and saying that the token needs Containers access (`containers.write`). This happens before any push and before `--dry-run` exits.
- A marker with no pinned digest is `[CONTAINER_UNDESCRIBED]`.
- Push: `docker pull <repository>@<digest>`, `docker tag` it `<member>:<first 12 hex of the digest>`, then `wrangler containers push` that tag with the account's token. A failed pull or push exits with its status, and nothing is deployed.
- Then R20's `wrangler deploy`, with the generated config's `containers[].image` set to the pushed `registry.cloudflare.com/<account>/<tag>`. The tracked config is never written.

(4) **R1's listed shape.** Each member gains `kind` (`"worker"` when the marker states none) and `image` (`null` for a worker). The ARM 7b red is agent-runner's `package.json` version, an 11th version site, and I re-pin it to 11. R12 already reads every discovered member.
