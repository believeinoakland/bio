/* R27, R28, R29, R32: whether the copy answers, what each part of it serves, and the way back. */
import { cf, approve, sleep, WAIT_BOUND_MINUTES } from "./api.mjs";
import { ascii, find } from "./bytes.mjs";
import { BINDING_OF } from "./bindings.mjs";

/* R15 (T35; F1, K1874): the probe credential travels only in the request's `Authorization: Bearer` header, the form
   admission R20 reads first, so it is in no address this installer makes, logs or shows. */
/* R66 (S5, S8): a new address takes a while to wake, so the check waits for it within the stated bound, drawing the wait,
   and never reports a not-yet-ready address as failed before the bound has passed. The wait is counted in nominal seconds. */
const WAKE_EVERY_S = 3;
async function verifyInstall(base, probe, onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60;
  for (let waited = 0; ; waited += WAKE_EVERY_S) {
    try {
      const r = await fetch(`${base}/api/?op=selftest`, { headers: { authorization: "Bearer " + probe } });
      const j = await r.json();
      if (j.ok === true && j.bindings?.STORE === true) return j;
    } catch {}
    if (waited >= bound) return null;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(WAKE_EVERY_S * 1000);
  }
}

/* D-116 — WHAT EACH PART OF THE COPY ACTUALLY SERVES, NOT WHAT WAS UPLOADED (`BIO_Distribution_v0_1.md` §6, §8;
 * `CLAUDE.md` §5: a deploy verified is not a build serving).
 *
 * `op=bootstrap`'s `version` is the ROUTING isolate's build. Until D-116 that was the only thing this checked, so an
 * update whose Durable Object — the part holding the record — still ran the previous build, or whose capability
 * worker never took the new one, reported "Updated" all the same. A plane carrying D-116 answers three readings,
 * each from where it runs: `version` (the isolate), `storeVersion` (the DO's own env, never the isolate's), and on
 * `members=1`, `memberVersions` (each member's own `/version`, asked THROUGH the plane's binding). Every one must
 * equal the release, and the one that does not is NAMED; the update and the install do not report success until
 * none lags.
 *
 * WHETHER THE RELEASE CAN ANSWER is read from the plane bytes this act uploaded (`reportsBuilds`), never from a
 * version number: a release cut before D-116 landed has neither field in its source, so its store's build and its
 * members' are UNDETERMINED and the page says so in the same breath as the isolate's confirmation (UNDETERMINED_BUILDS)
 * — never a silent "confirmed", and never a refusal for lacking a field that release could not have. A plane that SHOULD answer and does not is a lag, not an absence:
 * after uploading a release that carries the fields, a reply without `storeVersion` is a DO still on older code. */
const BUILD_FIELDS = ["storeVersion", "memberVersions"];
const WORD_BYTE = (b) => (b >= 48 && b <= 57) || (b >= 65 && b <= 90) || b === 95 || (b >= 97 && b <= 122);
const hasWord = (bytes, word) => {
  const pat = ascii(word);
  for (let i = find(bytes, pat); i !== -1; i = find(bytes, pat, i + 1))
    if (!(i > 0 && WORD_BYTE(bytes[i - 1])) && !(i + pat.length < bytes.length && WORD_BYTE(bytes[i + pat.length]))) return true;
  return false;
};
export function reportsBuilds(source) {
  if (source instanceof Uint8Array) return BUILD_FIELDS.every((f) => hasWord(source, f));
  return typeof source === "string" && BUILD_FIELDS.every((f) => new RegExp("\\b" + f + "\\b").test(source));
}

/* DIST-6: `failed` is the members the fleet step could NOT upload ({member, why}). A member the plane binds whose upload
   failed is named here whatever the plane answers, because the plane's own reading of it (UNBOUND, or a previous
   build) cannot say that THIS act tried and failed — and on a release that cannot report members it is the only
   place the failure reaches the verdict. A member the plane does not bind is named at the fleet step and not here. A member
   R38 left out (`out`: its upload was never attempted) is named at the fleet step, never a lag here (R15; K3793). */
const failedLags = (failed = []) => failed.filter((l) => l && !l.out && BINDING_OF.has(l.member))
  .map((l) => `the capability worker ${l.member} could not be installed, so your team's Civicsmith has no ${BINDING_OF.get(l.member)}`
    + ` connection to use (${l.why})`);

function servingVerdict(j, want, installed, capable, failed = []) {
  const lags = [];
  if (!j || typeof j !== "object") {
    lags.push("the address of your team's Civicsmith did not answer", ...failedLags(failed));
    return { confirmed: false, lags, capable };
  }
  if (j.version !== want) lags.push(`the address of your team's Civicsmith answers ${j.version ? j.version : "with no version"}`);
  lags.push(...failedLags(failed));
  if (!capable) return { confirmed: lags.length === 0, lags, capable };
  if (!("storeVersion" in j)) lags.push("the record store of your team's Civicsmith has not reported its version, so it is still running a release from before this one");
  else if (j.storeVersion === null) lags.push("the record store of your team's Civicsmith cannot say which version it runs");
  else if (j.storeVersion !== want) lags.push(`the record store of your team's Civicsmith still runs ${j.storeVersion}`);
  const mv = j.memberVersions;
  if (!mv || typeof mv !== "object") {
    lags.push("your team's Civicsmith did not report its capability workers");
  } else {
    for (const [name, st] of Object.entries(mv)) {
      const s = st && st.state;
      if (s === "SERVING" && st.version !== want) lags.push(`the capability worker ${name} still runs ${st.version}`);
      else if (s === "MISNAMED") lags.push(`the connection of your team's Civicsmith to ${name} reaches a different worker (${st.name || "unnamed"})`);
      else if (s === "SILENT") lags.push(`your team's Civicsmith cannot get an answer from the capability worker ${name}`
        + (installed.includes(name) ? ", which this step installed" : ""));
      else if (s === "UNBOUND" && installed.includes(name))
        lags.push(`the capability worker ${name} was installed, but your team's Civicsmith holds no connection to it, so it cannot use it`);
    }
    for (const name of installed)
      if (!(name in mv)) lags.push(`the capability worker ${name} was installed, but your team's Civicsmith does not know it`);
  }
  return { confirmed: lags.length === 0, lags, capable };
}

async function verifyServing(base, want, installed, capable, failed = [], onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60, every = 2.5;
  let last = null;
  for (let waited = 0; ; waited += every) {
    let j = null;
    try { j = await (await fetch(`${base}/api/?op=bootstrap&members=1`)).json(); } catch {}
    last = servingVerdict(j, want, installed, capable, failed);
    if (last.confirmed || waited >= bound) return last;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(every * 1000);
  }
}

/* R67 (S9): the new version has to answer at all. Waits within the stated bound; answers the reply or null. */
async function waitForAnswer(base, onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60, every = 2.5;
  for (let waited = 0; ; waited += every) {
    try { const r = await fetch(`${base}/api/?op=bootstrap`); if (r.ok) { const j = await r.json(); if (j && typeof j === "object") return j; } } catch {}
    if (waited >= bound) return null;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(every * 1000);
  }
}
/* The version a Worker runs now, as its deployments list names it (newest first), or null when that cannot be read. */
async function currentDeployment(token, acct, slug) {
  try {
    const r = await cf(token, `/accounts/${acct}/workers/scripts/${slug}/deployments`);
    const list = Array.isArray(r) ? r : Array.isArray(r?.deployments) ? r.deployments : [];
    return list[0]?.versions?.[0]?.version_id ?? null;
  } catch (e) { if (approve(e)) throw e; return null; }
}
/* Puts that version back, at 100%. true when Cloudflare accepted it. */
async function rollBack(token, acct, slug, versionId) {
  try {
    await cf(token, `/accounts/${acct}/workers/scripts/${slug}/deployments`, { method: "POST", idem: true,
      body: JSON.stringify({ strategy: "percentage", versions: [{ percentage: 100, version_id: versionId }] }) });
    return true;
  } catch (e) { if (approve(e)) throw e; return false; }
}

/* R33 with R15: the read-back's lags join the serving verdict's, first; a verdict with any is never confirmed. With no
   serving verdict (the address unread) the read-back's lags still make one, so a mismatch is always named. */
function withByteLags(verdict, byteLags, capable) {
  if (!byteLags.length) return verdict;
  if (!verdict) return { confirmed: false, lags: [...byteLags], capable };
  return { ...verdict, confirmed: false, lags: [...byteLags, ...verdict.lags] };
}
export { WAKE_EVERY_S, verifyInstall, failedLags, servingVerdict, verifyServing, waitForAnswer, currentDeployment, rollBack, withByteLags };
