/* R38, R23 (T46; N897 (4); `draft-T46-trial.md` §3.2) — WHETHER A CONTAINER MEMBER'S IMAGE CAN BE PULLED, AND WHAT YOUR
 * GROUP'S CIVICSMITH LACKS WITHOUT IT, held once for the fleet step (index.mjs) and the install and update pages (ui.mjs).
 *
 * A container member installs under the default scheduling policy only from a registry that policy pulls from: Docker
 * Hub, Amazon ECR, Google Artifact Registry (the Cloudflare registry is the `durable_object` policy's, which this installer
 * never uses), and only pinned to one exact build by its sha256 digest. A release whose image sits anywhere else (GitHub's
 * registry, today: there is no public registry yet, K2816 (4)) is left out by name, in words a group can read: never "not
 * a public registry image". The member names stay as the fleet statement gives them; what each provides is said beside.
 */

const PINNED = /^[a-z0-9][a-z0-9.-]*(?::[0-9]{1,5})?\/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$/;
const PULLABLE = /^(?:docker\.io|registry-1\.docker\.io|[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com|[a-z0-9-]+-docker\.pkg\.dev)\/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$/;

export const IMAGE_UNPINNED = "this release does not pin its image to one exact build (a sha256 digest), so it cannot be checked";
export const IMAGE_UNPULLABLE = "this release's image is not yet published where your Cloudflare account can pull it";

/* null when the image installs; else why not, in words. */
export function imageWhy(image) {
  if (typeof image !== "string" || !PINNED.test(image)) return IMAGE_UNPINNED;
  if (!PULLABLE.test(image)) return IMAGE_UNPULLABLE;
  return null;
}

/* R38 (T36): what your group's Civicsmith lacks while a container member is left out, said beside its reason. */
export const CONTAINER_LACKS = Object.freeze({
  "agent-runner": "your group's Civicsmith offers the assistant only through an API key (a member's own, or your group's) until it is installed",
  "file-scanner": "your group's Civicsmith has no file scanner and no safe view until it is installed: files are kept and shown but not "
    + "scanned, and a high-risk file opens only in its safe view once one can be made",
});
export const lacksOf = (member) => CONTAINER_LACKS[member] || "what it provides is missing from your group's Civicsmith until it is installed";

/* R23 (T46): what each container member provides, as the install page's prerequisites name it. */
const PROVIDES = Object.freeze({
  "agent-runner": "The assistant through a member's own Claude subscription",
  "file-scanner": "The built-in file scanner and safe view",
});

/* R23 (T46): for a release's container classes ([{member, class_name, image}], as the embed records them from the signed
   fleet statement's `Container` parts), each member whose image will not install, once, with why and what it then lacks.
   [] when every image installs. */
export function partsLeftOut(containers) {
  const out = [];
  for (const c of Array.isArray(containers) ? containers : []) {
    const why = imageWhy(c && c.image);
    if (why && !out.some((o) => o.member === c.member)) out.push({ member: c.member, why, lacks: lacksOf(c.member) });
  }
  return out;
}

const escText = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* R23 (T46): the statement the install and update pages carry before the install begins, per member; "" when nothing is
   left out. `version` is the release this installer carries. */
export function leftOutNotice(containers, version) {
  const parts = partsLeftOut(containers);
  if (!parts.length) return "";
  return `<div class="notice" id="left-out"><p style="margin:0 0 .6em"><b>What the release this installer carries
(${escText(version)}) cannot install yet.</b> Everything else installs, and the install goes ahead without these:</p>
<ul>${parts.map((p) => `<li id="left-out-${escText(p.member)}">${escText(PROVIDES[p.member] || "A capability worker")} (${escText(p.member)}): `
    + `${escText(p.why)}, so it is left out, and ${escText(p.lacks)}.</li>`).join("\n")}</ul>
<p class="small" style="margin:0">If the public repository holds a newer release when you continue, the installer uses it, and the
progress page says again, part by part, what was installed and what was left out.</p></div>`;
}
