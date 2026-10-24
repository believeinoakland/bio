/* R84 (fix round 9, K4937; G144-G150; amends R4, R7, R14, R70) — THE ACCOUNT MADE READY BEFORE ANYTHING IS CREATED.
 *
 * Each check here answers `null` (the account is ready for that condition) or a stop: `{ said, d, retry }`, one sentence, the way
 * on beside it, and the label of the one act that begins the run again with the founder's choices kept ("Check again": `retry`).
 * A check that needs the founder to choose (the account, the address) answers a panel instead. Nothing here writes to the account
 * but `registerSubdomain`, which `addressReady` calls only for a name the founder chose with a click.
 *
 * Cloudflare offers no permission to buy a plan or turn R2 on for the founder (its OAuth scope list, read 2026-10-24, holds no
 * billing scope), so these stay walk-throughs. Every Cloudflare answer shape below is "documented shape; BOB measures on the
 * rehearsal account (K4942)". The sentences are written first here (`localize`, K3930): the design reviews every new row. */
import { word, localize } from "../../bio-plane/src/setup-words/index.mjs";
import { storageEntitlement, addressState, registerSubdomain, missingScopes, listScripts, listNamespaces, listBuckets, special } from "./steps/index.mjs";
import { RELEASE_MANIFEST, RELEASE_CONTAINERS } from "./release.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const CHECK_AGAIN = () => localize("installer.ready.checkagain", "Check again");

/* ---------------------------------------------------------------- (5) the permission granted */

/* The scopes every install needs before its first call: the installer's own, less the two that have a step of their own
   (`account-logs.read`: R46's check; `connectivity-directory.bind`: the Workers VPC binding, R45). */
export const neededScopes = (scopes) => scopes.filter((s) => s !== "account-logs.read" && s !== "connectivity-directory.bind");
/* `granted` is the token response's scope string (null when it states none: nothing can be compared, the later steps judge). */
export function scopesStop(granted, scopes) {
  if (typeof granted !== "string") return null;
  const missing = missingScopes(granted, neededScopes(scopes));
  if (!missing.length) return null;
  return { said: localize("installer.ready.scopes", "Stopped: the permission you gave Cloudflare does not include everything the installer needs ({missing}). Nothing was created. Approve again, and keep every permission Cloudflare lists switched on.", { missing: missing.join(", ") }), approveAgain: true };
}

/* ---------------------------------------------------------------- (6) the account */

/* The sign-in's accounts; `chosen` the id the founder chose (from the cookie). One account: it is used. Several: the founder
   chooses one by name; a choice that names none of them is asked again. Answers `{acct}` or `{choose: [{id, name}]}`. */
export function pickAccount(accts, chosen) {
  if (accts.length === 1) return { acct: accts[0] };
  const hit = chosen ? accts.find((a) => a.id === chosen) : null;
  return hit ? { acct: hit } : { choose: accts };
}
export const accountSentence = () => localize("installer.ready.account.which", "Your Cloudflare sign-in can reach more than one account. Choose the one your team's Civicsmith is for. Nothing has been created.");
export function accountPanel(accts, body) {
  const b = (a) => esc(JSON.stringify({ ...body, account: a.id }));
  return `<section id="account-choice"><h2>${esc(localize("installer.ready.account.head", "Which Cloudflare account?"))}</h2>
<p>${esc(accountSentence())}</p>
${accts.map((a) => `<div class="cs-sheet ng-block"><h3>${esc(a.name)}</h3><div class="ng-acts"><button type="button" class="cs-btn" data-tone="primary" data-account="${esc(a.id)}" data-begin="${b(a)}">${esc(localize("installer.ready.account.use", "Use {name}", { name: a.name }))}</button></div></div>`).join("\n")}
<p class="err" id="begin-err" role="alert"></p></section>`;
}

/* ---------------------------------------------------------------- (1) storage */

export async function storageReady(token, acct) {
  const s = await storageEntitlement(token, acct);
  if (s.state === "on") return null;
  if (s.state === "not_entitled") {
    return { said: localize("installer.ready.storage.off", "Stopped: your Cloudflare account has not turned on R2, the storage your team's Civicsmith keeps its evidence in. Nothing was created."),
      d: localize("installer.ready.storage.do", "In the Cloudflare dashboard open Storage & databases, then R2, then Overview, and complete the checkout that adds an R2 subscription to the account. Then come back and choose Check again."), retry: CHECK_AGAIN() };
  }
  if (s.state === "permission") {
    return { said: localize("installer.ready.storage.permission", "Stopped: the permission you gave does not let the installer look at your account's storage. Nothing was created. Approve again, and keep every permission Cloudflare lists switched on."), approveAgain: true };
  }
  return { said: localize("installer.ready.storage.unknown", "Stopped: Cloudflare would not say whether your account's storage is turned on ({said}). Nothing was created.", { said: s.said ?? "" }),
    d: localize("installer.ready.unknown.do", "Choose Check again in a moment. If it keeps happening, the message above is what to give whoever helps you with Cloudflare."), retry: CHECK_AGAIN() };
}

/* ---------------------------------------------------------------- (2) Containers */

/* Cloudflare's answer to the Containers list, decided by its CODE and never by its words (K4937). Documented shape; BOB
   measures on the rehearsal account (K4942): the codes below are the ones in hand (10000 and 9109 are Cloudflare's own
   "not authenticated for this" answers; 100328 is the plan refusal measured for Workers on Free), to be replaced by the measured
   ones in this one table. There is no "off" state: no switch to turn Containers on is documented. */
export const CONTAINERS_CODES = Object.freeze({ permission: Object.freeze([10000, 9109]), plan: Object.freeze([100328]) });
/* "on" (the list answered), "plan", "permission", or "unknown" with Cloudflare's words. */
export async function containersState(api) {
  try { await api("/containers/applications"); return { state: "on" }; }
  catch (e) {
    if (special(e)) throw e;
    if (CONTAINERS_CODES.plan.includes(e && e.code)) return { state: "plan" };
    if (CONTAINERS_CODES.permission.includes(e && e.code)) return { state: "permission" };
    return { state: "unknown", said: e && e.message || String(e) };
  }
}
/* `planStop` is the plan's own stop (R6), drawn when the cause is the plan. */
export function containersStop(c, planStop) {
  if (c.state === "on") return null;
  if (c.state === "plan") return planStop;
  if (c.state === "permission") {
    return { said: localize("installer.ready.containers.permission", "Stopped: the permission you gave does not let the installer look at your account's Containers. Nothing was created. Approve again, and keep every permission Cloudflare lists switched on."), approveAgain: true };
  }
  return { said: localize("installer.ready.containers.unknown", "Stopped: the installer could not tell whether your Cloudflare account can run Containers ({said}). Nothing was created.", { said: c.said }),
    d: localize("installer.ready.unknown.do", "Choose Check again in a moment. If it keeps happening, the message above is what to give whoever helps you with Cloudflare."), retry: CHECK_AGAIN() };
}

/* ---------------------------------------------------------------- (3) the account's limits */

/* Cloudflare's published ceilings for a Workers Paid account (read 2026-10-24), each with its source:
   workers      500  developers.cloudflare.com/workers/platform/limits/ ("Workers per account | 100 | 500")
   classes      500  developers.cloudflare.com/durable-objects/platform/limits/ ("Maximum Durable Object classes (per account): 500 (Workers Paid)")
   buckets  1000000  developers.cloudflare.com/r2/platform/limits/ ("Maximum number of buckets per account | 1,000,000")
   crons        250  developers.cloudflare.com/workers/platform/limits/ ("Number of Cron Triggers per account | 5 | 250")
   Containers' applications have no documented count ceiling (only memory, vCPU, disk and image storage), so none is checked. */
export const ACCOUNT_LIMITS = Object.freeze({
  workers: { ceiling: 500, need: 1 + RELEASE_MANIFEST.fleet.length + 2 },
  classes: { ceiling: 500, need: 1 + 2 + RELEASE_CONTAINERS.length },
  buckets: { ceiling: 1_000_000, need: 2 },
  crons: { ceiling: 250, need: 1 + RELEASE_MANIFEST.fleet.length },
});
const limitSentence = (k, ceiling) => k === "crons"
  ? localize("installer.limit.crons.other", "{n} scheduled jobs", { n: ceiling })
  : word(`installer.limit.${k}.${ceiling === 1 ? "one" : "other"}`, { n: ceiling });

/* The scheduled jobs the account's Workers already hold, read per Worker (Cloudflare lists none account-wide); a Worker whose
   schedule cannot be read is not counted (the ceiling is far, and the platform refuses what it will not hold). */
async function cronCount(api, scripts) {
  let n = 0;
  const names = [...scripts.keys()];
  for (let i = 0; i < names.length; i += 8) {
    await Promise.all(names.slice(i, i + 8).map(async (name) => {
      try { const r = await api(`/workers/scripts/${name}/schedules`); n += (Array.isArray(r) ? r : r?.schedules || []).length; }
      catch (e) { if (special(e)) throw e; }
    }));
  }
  return n;
}
/* `needs` is what the act adds to each count: the install's table, or (an update) what the chosen release adds to the copy.
   Answers the limit's sentence, or null. */
export async function limitReached(api, needs = null) {
  const [scripts, spaces, buckets] = await Promise.all([listScripts(api), listNamespaces(api), listBuckets(api)]);
  const have = { workers: scripts.size, classes: spaces.length, buckets: buckets.length };
  const add = needs ? needs({ scripts, spaces, buckets }) : null;
  const wantsCrons = (add ? add.crons : ACCOUNT_LIMITS.crons.need) > 0;
  have.crons = wantsCrons && scripts.size ? await cronCount(api, scripts) : 0;
  for (const [k, l] of Object.entries(ACCOUNT_LIMITS)) {
    const need = add ? (add[k] ?? 0) : l.need;
    if (need > 0 && have[k] + need > l.ceiling) return limitSentence(k, l.ceiling);
  }
  return null;
}
/* F3 (R70): what an update adds to the account. Only the members and container classes the copy does not hold already, and the
   storage buckets it lacks, count: an update that adds nothing needs no room. */
export const updateNeeds = (names, loaded) => ({ scripts, spaces, buckets }) => {
  const inFleet = (loaded?.members || []).filter((L) => !L.error);
  const newClasses = inFleet.flatMap((L) => (L.classes || []).filter((c) => !spaces.some((s) => s && s.script === names.member(L.m.member) && s.class === c.class_name)));
  return { workers: inFleet.filter((L) => !scripts.has(names.member(L.m.member))).length, classes: newClasses.length,
    buckets: [names.captures, names.published].filter((n) => !buckets.includes(n)).length, crons: 0 };
};

/* ---------------------------------------------------------------- (4) the address */

/* A name valid as a workers.dev prefix: letters, digits and dashes, not starting or ending with a dash, 63 or fewer. */
export const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
/* `chosen` the name the founder chose with a click (the cookie). Answers `{ok: true, registered?}` (the account has a prefix, or
   the chosen name was registered now) or `{ask: {name, taken}}`: nothing is registered without the click. */
export async function addressReady(token, acct, slug, chosen) {
  const st = await addressState(token, acct, slug);
  if (st.sub) return { ok: true };
  if (!chosen) return { ask: { name: st.proposed || slug, taken: false } };
  const r = await registerSubdomain(token, acct, chosen);
  return r.ok ? { ok: true, registered: chosen } : { ask: { name: chosen, taken: true } };
}
export const addressSentence = (taken, name) => taken
  ? localize("installer.ready.address.taken", "The name {name} is already taken on Cloudflare. Choose another. Nothing has been created.", { name })
  : localize("installer.ready.address.none", "Your Cloudflare account has no workers.dev address yet. Choose the name your team's Civicsmith will be reached at. Nothing has been created.");
export function addressPanel({ name, taken }, body) {
  return `<section id="address-choice"><h2>${esc(localize("installer.ready.address.head", "Choose your account's address"))}</h2>
<p id="address-says">${esc(addressSentence(taken, name))}</p>
<p>${esc(localize("installer.ready.address.permanent", "This name is permanent for the whole Cloudflare account: every address in it ends with the name, and changing it later breaks every address already given out."))}</p>
<div class="cs-field"><label for="address-name">${esc(localize("installer.ready.address.label", "Address name"))}</label>
<input id="address-name" class="cs-input id" type="text" autocomplete="off" spellcheck="false" value="${esc(name)}"></div>
<div class="ng-acts"><button type="button" class="cs-btn" data-tone="primary" data-sub-from="address-name" data-begin="${esc(JSON.stringify(body))}">${esc(localize("installer.ready.address.use", "Use this address"))}</button></div>
<p class="err" id="begin-err" role="alert"></p></section>`;
}

/* ---------------------------------------------------------------- (7) size */

/* Cloudflare's uncompressed Worker size limit, 64 MiB on Free and Paid (developers.cloudflare.com/workers/platform/limits/,
   read 2026-10-24: "There is no compressed size limit. Only the uncompressed bundle size counts."). */
export const WORKER_SIZE_LIMIT = 64 * 1024 * 1024;
export const planeTooBig = (release) => (release.blob && release.blob.size > WORKER_SIZE_LIMIT) || release.bytes > WORKER_SIZE_LIMIT
  ? { said: localize("installer.ready.size.plane", "Stopped: the Civicsmith program of this release is larger than the 64 MiB Cloudflare allows for one Worker, so it cannot be installed. Nothing was created."), d: "" } : null;
/* A member whose bundle is over the limit is left out by name, as any member the release cannot install is (R38). Answers the
   fleet with that member's entry carrying its reason, so the fleet step names it. */
export function leaveOutOversize(loaded) {
  if (!loaded || !loaded.members) return loaded;
  return { ...loaded, members: loaded.members.map((L) => (!L.error && Number(L.m.bytes) > WORKER_SIZE_LIMIT
    ? { m: L.m, error: localize("installer.ready.size.member", "its program is larger than the 64 MiB Cloudflare allows for one Worker") } : L)) };
}
