# membership (T48)

**Status** · session_01KrD6WmMfAZRSQ5NFkMjLDS · depth 2 · WORKING · handled B2

## J1 · QUESTION

R143 (`lookedSince`) re-tested at START (K3189): no module holds a Home "last looked" mark (`queue_state.last_seen` is a per-case anchor; credentials' `group_key_notices`/`project_key_notices.seen_at` are one-time notice marks; capture's `site_assets.last_seen` and setup's `place_seen` are not a member's look). So R143 is built.

Question: R143 names no op, and its Suggestion says the op is op-declarations' and control-plane's. My reading: membership provides the service `lookedSince({by})` and its table only, and adds NO arm to `membershipOps` now; the arm (`lookedsince`, `by` from the query) is added when op-declarations declares the op, so no undeclared route appears in the plane's map (op-declarations' "store-internal routes" census). I am building on this reading. If you want the arm in `membershipOps` in this job, answer and I will add it.

Also, for the record: `by` is read as a member id (`ann`), also accepted as `member:ann`; the founder as `admin` (or `member:admin`) only while the instance is claimed (R94), else nothing is recorded.
