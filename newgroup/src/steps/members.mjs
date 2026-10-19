/* R16, R24: one file of a release fetched and checked against its hash, and one member's upload. */
import { word } from "../../../bio-plane/src/setup-words/index.mjs";
import { cf, patiently } from "./api.mjs";
import { hex, relHeaders } from "./bytes.mjs";
import { DESCRIPTOR_PARTS } from "./containers.mjs";

/* ---------------------------------------------------- the fleet (IC-82/D-297) */

/* A part's module type maps to the upload content type. COPY-NEVER-DEFAULT on
   the verifier side too: a type this map does not know refuses that member by
   name rather than guessing — an inferred loader is the 3607b5c defect
   arriving inside a team's account. */
const PART_MIME = { CompiledWasm: "application/wasm", Data: "application/octet-stream",
                    Text: "text/plain", ESModule: "application/javascript+module" };

/* R71 (F5): the software source (the public release repository) is waited on like Cloudflare's API: a slow or unavailable
   answer (5xx, rate limit, no answer) is retried within the bound and then ends the run with `screen.install.stopped.source`,
   BEFORE anything is created; an answer that is not transient (not found, bytes that fail their hash) is the member's own
   refusal, as before. `onWait` draws the wait. */
export class SourceUnavailable extends Error {
  constructor(what, cause) { super(`${what}: ${cause.message}`); this.source = true; this.cause = cause; }
}
async function fetchVerified(url, wantSha, what, onWait = null) {
  let bytes;
  try {
    bytes = await patiently(async () => {
      let r;
      try { r = await fetch(url, { redirect: "follow", headers: relHeaders }); }
      catch (e) { throw Object.assign(new Error(what + " " + String(e && e.message || e)), { network: true }); }
      if (!r.ok) throw Object.assign(new Error(what + " http " + r.status), { fleetWhy: word("installer.fleet.why.http", { status: r.status }) }, { status: r.status });
      return new Uint8Array(await r.arrayBuffer());
    }, { onWait });
  } catch (e) { if (e && e.lasting) throw new SourceUnavailable(what, e); throw e; }
  const got = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (got !== wantSha) throw Object.assign(new Error(what + " failed its integrity check"), { fleetWhy: word("installer.fleet.why.integrity") });
  return bytes;
}

/* R59 (T50; N1162; K3704; `agent-worker` R91, R109 and its configuration): the Durable Objects agent-worker holds of its own,
   bound and migrated by the install and the update: `SEGMENTS` (class `SegmentDriver`, migration `v1`), so a run's segment
   outlives the request that started it, and `CHECKS` (class `CheckRecord`, migration `v2`), the member's check record. The
   migrations are the member's own configuration's, in its order, each a tag with the class it creates. */
export const MEMBER_OBJECTS = Object.freeze({
  "agent-worker": Object.freeze({
    bindings: Object.freeze([{ name: "SEGMENTS", class_name: "SegmentDriver" }, { name: "CHECKS", class_name: "CheckRecord" }]),
    migrations: Object.freeze([{ tag: "v1", classes: ["SegmentDriver"] }, { tag: "v2", classes: ["CheckRecord"] }]),
  }),
});
/* The migration a member's upload carries, given the tag the script holds now (null: it holds none): every step after that
   tag, in order, in one `steps` list ending at the last tag; nothing when it already holds the last. */
export function objectMigrations(member, heldTag, objects) {
  const o = objects ?? MEMBER_OBJECTS[member];
  if (!o) return null;
  const at = heldTag ? o.migrations.findIndex((x) => x.tag === heldTag) : -1;
  const rest = o.migrations.slice(at + 1);
  if (!rest.length) return null;
  return { ...(heldTag ? { old_tag: heldTag } : {}), new_tag: rest.at(-1).tag, steps: rest.map((x) => ({ new_sqlite_classes: [...x.classes] })) };
}
const objectBindings = (member, objects) => ((objects ?? MEMBER_OBJECTS[member])?.bindings || []).map((b) => ({ type: "durable_object_namespace", name: b.name, class_name: b.class_name }));

async function uploadMember(token, acct, slug, m, version, bundle, partBytes, extra = {}) {
  const names = extra.names;
  /* R59: the member's own Durable Objects (agent-worker), migrated from the tag the script holds. */
  const held = extra.heldTag ?? null;
  const migrations = extra.migrations ?? objectMigrations(m.member, held, extra.objects);
  const meta = {
    main_module: "index.mjs",
    /* COPIED from the signed manifest, which copied it from the member's own
       config at cut time (IC-82). Nothing here is defaulted. */
    compatibility_date: m.compat.date,
    ...(m.compat.flags.length ? { compatibility_flags: m.compat.flags } : {}),
    /* R39: the member's own limits, exactly as its signed bundle states them; none stated, none sent. */
    ...(extra.limits ? { limits: { ...extra.limits } } : {}),
    bindings: [
      { type: "plain_text", name: "VERSION", text: version },
      /* D-292: the manifest carries the phantom exactly as the config wrote
         it, and the SLUG is substituted here — the same selfBinding shape the
         plane's own install has used since 2026-08-05. The slug never arrives
         over the network; it is the name the group chose. R64: another member is the Worker under this copy's names. */
      ...(m.services || []).map((sv) => ({ type: "service", name: sv.binding,
        service: sv.service === "bio-plane" ? slug : (extra.fleet && extra.fleet.has(sv.service) ? names.member(sv.service) : sv.service) })),
      /* R59 (agent-worker's own objects). */
      ...objectBindings(m.member, extra.objects),
      /* R38: a container member's Durable Object class, bound cross-script into each member its descriptor names. */
      ...(extra.bindings || []),
    ],
    /* R38: a container member's class is created by its first upload's migration, and never restated after it. */
    ...(extra.migrations ? { migrations: extra.migrations } : migrations ? { migrations } : {}),
  };
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([bundle], { type: "application/javascript+module" }), "index.mjs");
  /* A container or Worker descriptor is read here, never uploaded as a module. */
  for (const p of (m.parts || []).filter((pp) => !DESCRIPTOR_PARTS.has(pp.type))) {
    fd.append(p.path, new Blob([partBytes[p.path]], { type: PART_MIME[p.type] }), p.path);
  }
  return cf(token, `/accounts/${acct}/workers/scripts/${names.member(m.member)}`, { method: "PUT", body: fd });
}
export { PART_MIME, fetchVerified, objectBindings, uploadMember };
