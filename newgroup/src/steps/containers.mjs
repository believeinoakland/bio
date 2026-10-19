/* R20, R22, R23, R25: a container member, and the description a Worker member states of its own buckets and schedule. */
import { cf, special } from "./api.mjs";
import { establishPlan } from "./probes.mjs";
import { imageWhy, lacksOf } from "./images.mjs";

/* R38 (M-Q8) — THE CONTAINER MEMBER (agent-runner: Claude Code in a container, a member's own subscription path;
 * file-scanner: ClamAV and the safe view, two containers, T36).
 *
 * The signed fleet statement (`bio-release-fleet/2`) has no image field, and adding one would make every older
 * installer's rebuilt statement disagree with the signature. So a container member is an ordinary member (its asset is
 * the Worker that exports the Container Durable Object classes, K1615) carrying one more part of type `Container` per
 * class: a JSON descriptor, fetched and hashed like any part, which the fleet signature therefore covers:
 *   {class_name, image: "<repository>@sha256:<64 hex>", scheduling_policy: "default", max_instances, bind: [{member, binding}]}
 * One class is the part `container.json`, as before; two or more (T36, bundler R25) are `container/<class_name>.json`
 * each, the path naming the class its descriptor names. An older installer meets a part type it does not know and
 * leaves that one member out by name (R11's rule).
 *
 * It installs only when all of these hold: the permission granted carries the Containers write scope (R2), the account
 * is on Workers Paid (R6), and every descriptor names an image the default scheduling policy can pull, pinned by digest
 * (images.mjs; T46: one it cannot pull is named "not yet published where your Cloudflare account can pull it"). Then:
 * the Worker is uploaded (with its classes' migration when the script is new, and bound to each class it reaches
 * itself), the Containers application of each class is created for that class's namespace with its image, or, when it
 * exists, rolled out to the image; and each other member a descriptor names is uploaded with a cross-script binding to
 * the class. Any condition failing leaves the member out, named with what the copy then lacks (images.mjs, CONTAINER_LACKS): the
 * install never fails over it. The Containers API calls are wrangler's own (`/accounts/<id>/containers/applications`,
 * `…/rollouts`); like the install's SELF binding, they are confirmed only by a real install, which is deploy-gated. */
export const CONTAINER_PART = "Container";
/* R44 (T36; K2155, N772): a member's own bucket bindings and scheduled triggers, which the fleet statement's `services`
   cannot carry, ride as one more signed part of type `Worker` (`worker.json`, bundler's), read like a container's
   descriptor:
     {r2_buckets: [{binding, bucket: "captures" | "published"}], crons: ["<five fields>"]}
   A bucket is named by its role and bound to the copy's own bucket of that role. A member without the part gets
   neither, as before, and the page names what it then lacks. */
export const WORKER_PART = "Worker";
const DESCRIPTOR_PARTS = new Set([CONTAINER_PART, WORKER_PART]);
const containerPartsOf = (m) => (m.parts || []).filter((pp) => pp.type === CONTAINER_PART);
/* R57: what a container member left out then lacks, said after its reason; nothing for a member the assistant does not need. */
const withLacks = (m, why) => { const l = containerPartsOf(m).length ? lacksOf(m.member) : ""; return l ? `${why}; ${l}` : why; };
const CLASS_NAME = /^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{0,63}$/;
const INSTANCE_TYPE = /^[a-z][a-z0-9-]{0,31}$/;
const CLASS_PATH = /^container\/([A-Za-z_$][A-Za-z0-9_$]{0,63})\.json$/;

/* The descriptor, read and checked; `{ok: true, d}` or `{ok: false, why}` in words. */
export function containerDescriptor(bytes) {
  let d;
  try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, why: "its container description does not parse" }; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return { ok: false, why: "its container description is not an object" };
  if (typeof d.class_name !== "string" || !CLASS_NAME.test(d.class_name)) return { ok: false, why: "its container description names no class" };
  /* R38 (T46): an image the account cannot pull, or one not pinned by digest, is said in words a group can read. */
  const imageNot = imageWhy(d.image);
  if (imageNot) return { ok: false, why: imageNot };
  if (d.scheduling_policy !== "default") return { ok: false, why: "its scheduling policy is not the default one" };
  if (!Number.isInteger(d.max_instances) || d.max_instances < 1 || d.max_instances > 1000)
    return { ok: false, why: "its container description states no maximum number of instances" };
  /* R60 (T50; N1170; `bundler` R33): the size the member's configuration declares, passed on as stated; none stated, none sent. */
  if (d.instance_type !== undefined && (typeof d.instance_type !== "string" || !INSTANCE_TYPE.test(d.instance_type)))
    return { ok: false, why: "its container description states its size unreadably" };
  const bind = d.bind === undefined ? [] : d.bind;
  if (!Array.isArray(bind) || !bind.every((b) => b && typeof b.member === "string" && b.member
      && typeof b.binding === "string" && BINDING_NAME.test(b.binding)))
    return { ok: false, why: "its container description names its bindings unreadably" };
  return { ok: true, d: { class_name: d.class_name, image: d.image, max_instances: d.max_instances, bind,
    ...(d.instance_type === undefined ? {} : { instance_type: d.instance_type }) } };
}

/* R38 (T36): every class a container member carries, one descriptor per `Container` part; `{ok: true, classes}` or
   `{ok: false, why}`. With two or more, each part's path names its class and the class names differ; any part that
   does not read leaves the whole member out (a member missing a part its statement names never reaches here: the
   part's fetch fails first). Each class's why names the class. */
export function containerClasses(parts, bytesOf) {
  if (parts.length === 1) return ((r) => r.ok ? { ok: true, classes: [r.d] } : r)(containerDescriptor(bytesOf(parts[0].path)));
  const classes = [];
  for (const p of parts) {
    const at = CLASS_PATH.exec(p.path);
    if (!at) return { ok: false, why: `its container part ${p.path} is not named for its class (container/<class_name>.json)` };
    const r = containerDescriptor(bytesOf(p.path));
    if (!r.ok) return { ok: false, why: `${r.why} (class ${at[1]})` };
    if (r.d.class_name !== at[1]) return { ok: false, why: `its container part ${p.path} describes the class ${r.d.class_name}` };
    if (classes.some((c) => c.class_name === r.d.class_name)) return { ok: false, why: `it describes the class ${r.d.class_name} twice` };
    classes.push(r.d);
  }
  return { ok: true, classes };
}

/* R44 (T36): the `Worker` part, read and checked; `{ok: true, d}` or `{ok: false, why}` in words. */
const BUCKET_ROLES = Object.freeze({ captures: "bio-captures", published: "bio-published" });
const CRON = /^(?:[0-9*,/?LW#A-Za-z-]+\s){4}[0-9*,/?LW#A-Za-z-]+$/;
export function workerDescriptor(bytes) {
  let d;
  try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, why: "its Worker description does not parse" }; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return { ok: false, why: "its Worker description is not an object" };
  const list = (k) => d[k] === undefined ? [] : d[k];
  const r2 = list("r2_buckets"), crons = list("crons");
  if (!Array.isArray(r2) || !r2.every((b) => b && typeof b.binding === "string" && BINDING_NAME.test(b.binding) && Object.hasOwn(BUCKET_ROLES, b.bucket)))
    return { ok: false, why: "its Worker description names its buckets unreadably" };
  if (!Array.isArray(crons) || crons.length > 3 || !crons.every((c) => typeof c === "string" && CRON.test(c)))
    return { ok: false, why: "its Worker description states its schedule unreadably" };
  return { ok: true, d: { r2_buckets: r2.map(({ binding, bucket }) => ({ binding, bucket })), crons: [...crons] } };
}

/* R44 (T36): what file-scanner then lacks, when its release carries no `Worker` part. */
const WORKER_PART_LACKS = Object.freeze({
  "file-scanner": "its release does not yet state its bucket and its daily schedule, so it was installed without them: it cannot read "
    + "captured files or refresh its virus signatures, and files are not scanned until a release that states them is installed",
});

/* R45 (T36; K1946 T4): the member a tool reached through a tunnel is called through, and the binding name it reads the
   operator's Workers VPC service by, as R45 names them. */
export const VPC_MEMBER = "file-scanner";
export const VPC_BINDING = "SECURITY_VPC";

/* R45 (T36): a Workers VPC service is named by its id, 32 hexadecimal digits with or without the dashes of a UUID. */
const VPC_ID = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
export const vpcServiceOk = (v) => typeof v === "string" && VPC_ID.test(v);

/* Whether this act may install a container (R38's first two conditions), asked once, only when the release names one.
   `scope` is what the token response stated (null: it stated none, and one read of the Containers API decides). On an
   update the plan is established here as R6 establishes it, and a Free or unknown answer only leaves the container out:
   an update never grows a refusal. */
async function containerConditions(token, acct, { scope, plan }) {
  if (scope !== null && scope !== undefined) {
    if (!scope.split(/[\s,]+/).includes("containers.write"))
      return { ok: false, why: "the permission you approved does not include Workers Containers" };
  } else {
    try { await cf(token, `/accounts/${acct}/containers/applications`); }
    catch (e) { return { ok: false, why: "the permission you approved could not be shown to include Workers Containers (" + e.message + ")" }; }
  }
  let p = plan;
  if (!p) {
    try { p = await establishPlan(token, acct); } catch (e) { p = { plan: "unknown", detail: e.message }; }
  }
  if (p.plan === "free") return { ok: false, why: "your account is on Workers Free, and containers need Workers Paid" };
  if (p.plan !== "paid") return { ok: false, why: "your account's Workers plan could not be verified (" + (p.detail || "no answer") + ")" };
  return { ok: true, leftover: !!p.leftover };
}

/* The Containers application for one class's namespace, created with the image, or rolled out to it. The application is named
   under the copy's own names (R64: a member with one class by the member and the slug, with several by member, class and slug).
   R60: the size the descriptor states is passed per class, to the create call and to a rollout. R68 (S11): the image the
   platform then holds for the application is read back and compared with the digest the release names; where it is another
   (a rollout answered "no changes" and kept the old one), one further rollout is asked, and an image still another is
   returned as a lag, never success. Answers `{action, lag}`, `lag` null when the image deployed is the release's. */
async function placeContainer(token, acct, m, d, appName, names) {
  const spaces = await cf(token, `/accounts/${acct}/workers/durable_objects/namespaces?per_page=1000`);
  const script = names.member(m.member);
  const ns = (Array.isArray(spaces) ? spaces : []).find((n) => n && n.script === script && n.class === d.class_name);
  if (!ns || !ns.id) throw new Error("its Durable Object class " + d.class_name + " was not found after the upload");
  const apps = await cf(token, `/accounts/${acct}/containers/applications`);
  const app = (Array.isArray(apps) ? apps : []).find((a) => a && a.name === appName);
  const config = { image: d.image, ...(d.instance_type ? { instance_type: d.instance_type } : {}) };
  const rollout = (id) => cf(token, `/accounts/${acct}/containers/applications/${id}/rollouts`, { method: "POST", body: JSON.stringify({
    description: "Civicsmith installer: " + appName, strategy: "rolling", kind: "full_auto", step_percentage: 100,
    target_configuration: config }) });
  const deployed = async (id) => { try { return (await cf(token, `/accounts/${acct}/containers/applications/${id}`))?.configuration?.image ?? null; }
    catch (e) { if (special(e)) throw e; return null; } };
  let id, action;
  if (!app) {
    const made = await cf(token, `/accounts/${acct}/containers/applications`, { method: "POST", body: JSON.stringify({
      name: appName, scheduling_policy: "default", instances: 0, max_instances: d.max_instances,
      configuration: config, durable_objects: { namespace_id: ns.id } }) });
    id = made && made.id; action = "created";
  } else { id = app.id; await rollout(id); action = "rolled out"; }
  if (!id) return { action, lag: null };
  let got = await deployed(id);
  if (got !== d.image && action === "rolled out") { await rollout(id); got = await deployed(id); }
  const short = (x) => (x ? x.slice(x.indexOf("@") + 1, x.indexOf("@") + 20) + "…" : "no image");
  return { action, lag: got === d.image ? null
    : `the container ${appName} of your team's Civicsmith still runs ${got ? "another image (" + short(got) + ")" : "an image that could not be read"}, not the one this release names (${short(d.image)})` };
}

/* R44: a member's scheduled triggers, set exactly as its `Worker` part states them. */
async function setSchedules(token, acct, script, crons) {
  return cf(token, `/accounts/${acct}/workers/scripts/${script}/schedules`,
    { method: "PUT", body: JSON.stringify(crons.map((cron) => ({ cron }))) });
}
export { DESCRIPTOR_PARTS, containerPartsOf, withLacks, WORKER_PART_LACKS, containerConditions, placeContainer, setSchedules };
