/* What the installer finds in a Cloudflare account, and the names a copy's parts carry there (R62–R65, R69, R70).
 *
 * A COPY IS NAMED BY ITS SLUG (R64): the plane is the Worker `<slug>`, its evidence buckets are `bio-captures-<slug>` and
 * `bio-published-<slug>`, each fleet member is the Worker `<member>-<slug>` and each container application carries the slug
 * too, so two copies in one account share nothing. A copy installed before this under the fixed names (`bio-captures`,
 * `bio-published`, `pdf-worker`, …) keeps them; it is told apart by its plane's own `CAPTURES` binding. The installer keeps
 * nothing between requests (R27): everything here is read from the account, once, as it is asked.
 *
 * Every function takes `api(path, init)`, the Cloudflare call already bound to the run's permission and account path
 * prefix (`/accounts/<id>`), so this file holds no token and no address of its own. */

import { patiently } from "./api.mjs";

export const SLUG_SCHEME = "slug";
export const LEGACY_SCHEME = "legacy";
export const LEGACY_BUCKETS = Object.freeze({ captures: "bio-captures", published: "bio-published" });

/* R69 (K3747): the mark the installer writes LAST. A copy that carries it was finished; a copy under per-slug names that does
   not was begun by this installer and not finished. It is a secret binding (an update keeps secrets), its value the
   release the install completed. */
export const MARK = "INSTALL_COMPLETE";

/* R69 (F9): the lock one run holds on the account while it works, a throwaway Worker whose only content is when it was last
   touched. A lock not touched for LOCK_LIVE_MS belongs to a run that died. */
export const LOCK_SCRIPT = "bio-install-lock";
export const LOCK_LIVE_MS = 3 * 60 * 1000;

export function namesFor(slug, scheme = SLUG_SCHEME) {
  const legacy = scheme === LEGACY_SCHEME;
  return Object.freeze({
    slug, scheme,
    captures: legacy ? LEGACY_BUCKETS.captures : `bio-captures-${slug}`,
    published: legacy ? LEGACY_BUCKETS.published : `bio-published-${slug}`,
    /* A fleet member's Worker. */
    member: (m) => (legacy ? m : `${m}-${slug}`),
    /* A container application: a member with one class is named by the member, with several by member and class. */
    app: (m, cls, multi) => (legacy ? (multi ? `${m}-${cls.toLowerCase()}` : m) : (multi ? `${m}-${cls.toLowerCase()}-${slug}` : `${m}-${slug}`)),
    role: (r) => (r === "captures" ? (legacy ? LEGACY_BUCKETS.captures : `bio-captures-${slug}`) : (legacy ? LEGACY_BUCKETS.published : `bio-published-${slug}`)),
  });
}

/* Which naming a plane's bindings show: its `CAPTURES` bucket. null when they name neither. */
export function schemeOf(bindings, slug) {
  const b = (bindings || []).find((x) => x && x.name === "CAPTURES" && x.type === "r2_bucket");
  if (!b) return null;
  if (b.bucket_name === LEGACY_BUCKETS.captures) return LEGACY_SCHEME;
  if (b.bucket_name === `bio-captures-${slug}`) return SLUG_SCHEME;
  return null;
}

const arr = (x) => (Array.isArray(x) ? x : []);

/* The scripts the account holds, by name, with their migration tag where the platform states one. */
export async function listScripts(api) {
  return new Map(arr(await api("/workers/scripts")).filter((s) => s && typeof s.id === "string").map((s) => [s.id, s]));
}
export async function listBuckets(api) {
  const r = await api("/r2/buckets");
  return arr(r && !Array.isArray(r) ? r.buckets : r).map((b) => b && b.name).filter((n) => typeof n === "string");
}
export async function listNamespaces(api) {
  return arr(await api("/workers/durable_objects/namespaces?per_page=1000"));
}
export async function listApps(api) { return arr(await api("/containers/applications")); }

/* The bindings a script holds, as {name, type, ...}: names and types (a secret's value is never readable). null when the
   settings cannot be read or state none: unknown, never "none". */
export async function bindingsOf(api, name) {
  try {
    const s = await api(`/workers/scripts/${name}/settings`);
    return s && Array.isArray(s.bindings) ? s.bindings.filter((b) => b && typeof b.name === "string") : null;
  } catch { return null; }
}

/* R62, R69: every copy the account holds, and every part of one that stands alone.
     planes    [{slug, scheme, finished, bindings}]   each Worker that holds the record store (the class `Store`)
     orphans   {legacy: [names], slugged: Map(slug -> [names])}   buckets and members no plane of that copy holds
   `memberNames` are the fleet members' own names (instance-setup's table and what the release names). A lookup that fails
   throws: an absence not established is not established. */
export async function inventory(api, memberNames) {
  const [scripts, buckets, spaces] = await Promise.all([listScripts(api), listBuckets(api), listNamespaces(api)]);
  const planeNames = [...new Set(spaces.filter((n) => n && n.class === "Store" && typeof n.script === "string").map((n) => n.script))];
  const planes = [];
  for (const slug of planeNames) {
    const bindings = await bindingsOf(api, slug);
    if (bindings === null) throw new Error(`the settings of ${slug} could not be read`);
    const scheme = schemeOf(bindings, slug) ?? SLUG_SCHEME;
    planes.push({ slug, scheme, bindings, finished: scheme === LEGACY_SCHEME || bindings.some((b) => b.name === MARK) });
  }
  const held = new Set(planes.flatMap((p) => [namesFor(p.slug, p.scheme).captures, namesFor(p.slug, p.scheme).published]));
  const legacy = [];
  const slugged = new Map();
  const add = (slug, what) => slugged.set(slug, [...(slugged.get(slug) || []), what]);
  const legacyOwned = planes.some((p) => p.scheme === LEGACY_SCHEME);
  for (const b of buckets) {
    if (held.has(b)) continue;
    if (b === LEGACY_BUCKETS.captures || b === LEGACY_BUCKETS.published) { if (!legacyOwned) legacy.push(b); continue; }
    const m = /^bio-(?:captures|published)-(.+)$/.exec(b);
    if (m) add(m[1], b);
  }
  for (const m of memberNames) {
    if (scripts.has(m) && !legacyOwned) legacy.push(m);
    for (const w of scripts.keys()) {
      if (!w.startsWith(m + "-")) continue;
      const slug = w.slice(m.length + 1);
      if (slug.length >= 3 && !scripts.has(slug)) add(slug, w);
    }
  }
  return { scripts, buckets, planes, orphans: { legacy, slugged } };
}

/* R70 (F7): a free name beside the one that was taken. */
export function freeName(slug, taken, validate) {
  for (let n = 2; n < 100; n++) {
    const tail = `-${n}`;
    const c = slug.slice(0, 40 - tail.length).replace(/-+$/, "") + tail;
    if (!taken.has(c) && validate(c)) return c;
  }
  return null;
}

/* ------------------------------------------------------------------ R63: what is already here */

/* The facts a copy's own worker answers to the installer's one request (`op=bootstrap`, no credential). Each is stated or
   not; a fact not stated carries why. The wire names are flat scalars (membership R132's pre-auth rule). */
export const FACT_KEYS = Object.freeze({ team: "team_name", installed: "installed_at", used: "last_used_at", release: "version",
  projects: "count_projects", documents: "count_documents", published: "count_published", members: "count_members" });

/* A rate limit or a server error is waited out (R1's back-off, a minute at most, drawn through `onWait`); no answer at all is not
   waited on, since an address that is not there is the usual state of a copy that was removed. It never throws. */
export async function readCopyFacts(address, onWait = null) {
  let reply = null;
  if (address) {
    try {
      const j = await patiently(async () => {
        let r;
        try { r = await fetch(`${address}/api/?op=bootstrap`); } catch { return null; }
        if (r.status === 429 || r.status >= 500) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status,
          retryAfter: Number(r.headers.get("retry-after")) || undefined });
        return r.ok ? await r.json().catch(() => null) : null;
      }, { onWait, minutes: 1 });
      if (j && typeof j === "object") reply = j;
    } catch { reply = null; }
  }
  const facts = {};
  for (const [name, wire] of Object.entries(FACT_KEYS)) {
    const v = reply ? reply[wire] : undefined;
    const ok = typeof v === "string" ? v.length > 0 : Number.isInteger(v) && v >= 0;
    facts[name] = ok ? { known: true, value: v }
      : { known: false, why: reply === null ? "silent" : (reply.version === undefined || name === "release" ? "silent" : "older") };
  }
  return facts;
}

/* The installer's own counts from Cloudflare's API for one copy: its Workers, its container applications, the objects in
   its two buckets. A count that cannot be read is null. */
export async function countsViaApi(api, copy, memberNames, scripts, spaces, apps) {
  const n = namesFor(copy.slug, copy.scheme);
  const workers = [copy.slug, ...memberNames.map((m) => n.member(m))].filter((w) => scripts.has(w));
  const mine = new Set(spaces.filter((s) => workers.includes(s.script)).map((s) => s.id));
  const containers = apps.filter((a) => a && a.durable_objects && mine.has(a.durable_objects.namespace_id)).length;
  const objects = async (bucket) => {
    try { const u = await api(`/r2/buckets/${bucket}/usage`); return Number.isInteger(u?.objectCount) ? u.objectCount : null; }
    catch { return null; }
  };
  return { workers: workers.length, containers, captured: await objects(n.captures), published: await objects(n.published) };
}

/* ------------------------------------------------------------------ R65: removal */

/* Everything one copy holds in the account, as a list of {kind, name} in the order they are deleted: container
   applications (they hold the Durable Object classes), fleet members, the plane (each with its Durable Objects), then
   the two buckets (emptied first). */
export async function resourcesOf(api, copy, memberNames) {
  const n = namesFor(copy.slug, copy.scheme);
  const [scripts, spaces, apps, buckets] = await Promise.all([listScripts(api), listNamespaces(api), listApps(api), listBuckets(api)]);
  const workers = [...memberNames.map((m) => n.member(m)), copy.slug].filter((w) => scripts.has(w));
  const mine = new Set(spaces.filter((s) => workers.includes(s.script)).map((s) => s.id));
  const out = [];
  for (const a of apps) if (a && a.durable_objects && mine.has(a.durable_objects.namespace_id)) out.push({ kind: "app", name: a.name, id: a.id });
  for (const w of workers) out.push({ kind: "worker", name: w });
  for (const b of [n.captures, n.published]) if (buckets.includes(b)) out.push({ kind: "bucket", name: b });
  return out;
}

async function emptyBucket(api, bucket) {
  for (let round = 0; round < 1000; round++) {
    const page = await api(`/r2/buckets/${bucket}/objects?per_page=1000`);
    const keys = arr(page).map((o) => o && (o.key ?? o.name)).filter((k) => typeof k === "string");
    if (!keys.length) return;
    for (const k of keys) await api(`/r2/buckets/${bucket}/objects/${encodeURIComponent(k)}`, { method: "DELETE" });
  }
}

/* Deletes `resources` in order. `done(resource)` is told after each. Throws {remaining, cause} at the first refusal,
   `remaining` being the names not yet deleted. */
export async function deleteResources(api, resources, done) {
  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    try {
      if (r.kind === "app") await api(`/containers/applications/${r.id}`, { method: "DELETE" });
      else if (r.kind === "worker") await api(`/workers/scripts/${r.name}?force=true`, { method: "DELETE" });
      else { await emptyBucket(api, r.name); await api(`/r2/buckets/${r.name}`, { method: "DELETE" }); }
    } catch (cause) {
      if (cause && cause.approveAgain) throw cause;
      throw Object.assign(new Error(cause.message), { remaining: resources.slice(i).map((x) => x.name), cause, status: cause.status });
    }
    if (done) await done(r);
  }
}

/* ------------------------------------------------------------------ R69 (F9): one run at a time */

/* Takes the account's lock for this run, or answers that another run holds it (touched within LOCK_LIVE_MS). `lock` is
   `{id, again}`: the run's own id, and the id of the run this one continues, when the founder was asked to approve again
   (R71, F6): a revoked permission cannot drop its lock, and the continuing run must not be stopped by it. */
export async function takeLock(api, lock, now = Date.now()) {
  const held = await bindingsOf(api, LOCK_SCRIPT);
  if (held) {
    const at = Number((held.find((b) => b.name === "T") || {}).text);
    const owner = (held.find((b) => b.name === "ID") || {}).text;
    if (Number.isFinite(at) && now - at < LOCK_LIVE_MS && !(lock.again && owner === lock.again)) return false;
  }
  await touchLock(api, lock.id, now);
  return true;
}
export async function touchLock(api, id, now = Date.now()) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify({ main_module: "index.mjs", compatibility_date: "2026-07-01",
    bindings: [{ type: "plain_text", name: "T", text: String(now) }, { type: "plain_text", name: "ID", text: String(id) }] })], { type: "application/json" }));
  fd.append("index.mjs", new Blob(['export default { fetch() { return new Response("bio install lock"); } };'],
    { type: "application/javascript+module" }), "index.mjs");
  return api(`/workers/scripts/${LOCK_SCRIPT}`, { method: "PUT", body: fd });
}
export async function dropLock(api) {
  try { await api(`/workers/scripts/${LOCK_SCRIPT}?force=true`, { method: "DELETE" }); } catch { /* it goes stale by itself */ }
}

/* R62, R65: every copy the inventory shows, a plane and what it holds, or what is left of one that has no plane (a copy under
   its slug's names, or one under the fixed names, whose short name is then "bio-captures": no plane names it). */
export const LEGACY_ORPHAN = "bio-captures";
export function allCopies(inv) {
  const out = inv.planes.map((p) => ({ slug: p.slug, scheme: p.scheme, finished: p.finished, plane: true }));
  for (const slug of inv.orphans.slugged.keys()) if (!inv.planes.some((p) => p.slug === slug)) out.push({ slug, scheme: SLUG_SCHEME, finished: false, plane: false });
  if (inv.orphans.legacy.length && !inv.planes.some((p) => p.scheme === LEGACY_SCHEME)) out.push({ slug: LEGACY_ORPHAN, scheme: LEGACY_SCHEME, finished: false, plane: false });
  return out;
}
