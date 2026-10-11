/* store-door: THE DOORBELL'S PULL (R7, was control-plane R36's pull; N364, DEC-78 item 1; copied whole at the split,
   K1974). `op=inboxpull` brings a knock into the record as a capture (`doorbell` R13, `pullKnock`; was capture R65;
   T42, N826) and, in the same act, promotes the pulled document as a new `information` bundle at `collected`
   (promotion's `promote`), the puller its author. Run in the record store's door (`dispatch.mjs`), where the doorbell,
   promotion and record-core are in process.

   ONE ACT (N380, K559). `pullKnock` is async (it holds the bytes under their own digest and profiles them before it
   writes), and record-core's `transact` is synchronous, so no caller can wrap both writes in one transaction. The
   doorbell therefore offers a seam: `within(document)`, called inside the pull's own transaction after its receipt, the
   knock's `pulled` update and the actor are written (doorbell R13). The promotion runs there, so a refusal of either
   (no recorded group, C-64.1; a mint exhausted; a package refused; a store fault, answered `PULL_WITHIN_FAILED`) leaves
   neither written. A knock already pulled does not call `within`: its bundle is the one holding its capture, and a pulled knock
   whose capture no bundle holds (pulled through the doorbell's own route) is promoted by this door's next pull. */
import { createSha256 } from "../record-grammar/index.mjs";
import { stampInstant } from "../record-core/index.mjs";

/* The id's stem is record-core's `INFO-<year>-NNNN`; the slug says where the material came from. */
export const PULL_BUNDLE_SLUG = "doorbell-knock";

const hexOf = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
const enc = (text) => {
  const b = new TextEncoder().encode(text);
  return { text, bytes: b.length, sha256: createSha256().update(b).hex() };
};

/* The bundle, capture-requests R38's shape: the document as `bio/bundle.md`, the doorbell's provenance document as
   `data/provenance.json`, the bytes as a blob at the document's own `file`, and one register row. No contact is in any
   of it (doorbell R13, R16): the document carries none, and nothing here reads the inbox's `contact`. */
function filing(record, doc, { knockId, by, identity, viewer, at }) {
  const cap = doc.capture || {};
  const id = `${record.allocId("INFO", at.slice(0, 4)).id}-${PULL_BUNDLE_SLUG}`;
  const title = `Material handed in at the doorbell (${knockId})`.replace(/[\p{Cc}]+/gu, " ").slice(0, 200);
  const md = ["---",
    `id: ${id}`, "object_type: information", "schema: information@2",
    `title: ${JSON.stringify(title)}`, "current_state: collected", "prior_state: null",
    `created: "${at}"`, `last_updated: "${at}"`,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "criticality: supporting", "source_status: unchanged",
    `content_hash: sha256:${cap.sha256}`,
    "source:", `  locator: ${JSON.stringify(String(doc.locator || `knock:${knockId}`))}`,
    `  retrieved: ${doc.retrieved || at}`,
    "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "",
    `Material handed to the group at its doorbell as knock ${knockId} by an unnamed knocker, and brought into the `
    + `record by ${by}. Its bytes are \`${doc.file}\`, exactly as received; nothing here summarises them.`, "",
    "## Provenance Notes", "",
    `Received, not fetched from any address: its digest was taken as it arrived at the doorbell. The knocker's note `
    + `travels in data/provenance.json as the knocker's words, not as evidence of their truth. Filed at collected and `
    + `never higher: releasing it is a named member's decision.`, "",
    "## Session Log", "",
    `### Session ${at} | Collected | ${by}`,
    `Trigger: knock ${knockId} brought in`,
    "Changes: created from the pulled knock.", "",
    "## Review Notes", ""].join("\n");
  const files = [{ path: "bundle.md", ...enc(md) },
                 { path: "data/provenance.json", ...enc(JSON.stringify({ documents: [doc] }, null, 2)) },
                 { path: doc.file, blobSha: cap.sha256, sha256: cap.sha256, bytes: cap.bytes }];
  const raw = new Uint8Array(4);
  crypto.getRandomValues(raw);
  return {
    bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${hexOf(raw)}`,
    /* The puller is the author, and the session's two identity stamps are op=promote's (control-plane R17). */
    author: by, actorMemberId: by, actorIdentity: identity, actorViewer: viewer,
    files,
    meta: { object_type: "information", title, current_state: "collected", prior_state: null,
            created: at, last_updated: at, criticality: "supporting" },
    register: [{ sha256: cap.sha256, path: doc.file, encoding: "binary", bytes: cap.bytes }],
  };
}

/* The promotion of a document, its id drawn in the same transaction; a refusal rolls both back. */
const promoteIn = ({ record, promotion }, doc, who) =>
  record.transact(() => {
    const pkg = filing(record, doc, who);
    const p = promotion.promote(pkg);
    return p && p.ok === true ? { ...p, bundleId: p.bundleId ?? pkg.bundleId } : (p || { ok: false, reason: "PROMOTE_FAILED" });
  });

/* Inside the pull: a throw still rolls the pull back, and the doorbell answers `PULL_WITHIN_FAILED` with its own fixed
   sentence (doorbell R13), never the thrown message (R6's rule for a thrown error); it is thrown here with no message of
   the store's in it all the same, so nothing of the store's could reach an answer by any route. */
function promoteOrFault(deps, doc, who) {
  try { return promoteIn(deps, doc, who); }
  catch { throw new Error("the promotion did not complete"); }
}

const bundleOf = (p) => ({ bundleId: p.bundleId, bundleSha: p.bundleSha ?? null });

/** R7: `op=inboxpull`. `deps` is `{doorbell, promotion, record, provenance}` of one record (T42, N826: the doorbell's
 *  instance, `doorbellOf`, never capture's copy); `by`, `identity` and `viewer` are the control plane's stamps. Answers
 *  the doorbell's pull answer with `bundle: {bundleId, bundleSha}` beside it, or the first refusal, with nothing written.
 *  `resolve` marks `op=inboxresolve` at `pulled` (doorbell R3, DEC-88 (2)): the same pull reached as the doorbell's
 *  resolve, which takes the member's `reason`, so it is asked of the doorbell's `inboxResolve` (N499, K1117), whose
 *  refusals come first and in its order (`NO_SUCH_KNOCK`; a reason absent, not a string, blank or over its bound
 *  `RESOLVE_NO_REASON`, C-118.7, 400), each before anything is written, and which records the reason on the knock's
 *  row inside the pull, one act with the promotion through the same `within`. A direct pull is
 *  `pullKnock`'s and takes no reason (doorbell R13). */
export async function pullAndFile(deps, { knockId, by, identity, viewer, resolve = false, reason, now = Date.now } = {}) {
  const { doorbell, provenance } = deps;
  /* N386: the pull's instant, to the second, through record-core's one stamping helper (its R47). */
  const at = stampInstant("second", +now());
  const who = { knockId, by, identity, viewer, at };
  /* The pull and its promotion, one transaction (doorbell R13's `within`): a refusal of either writes nothing. */
  const within = (doc) => promoteOrFault(deps, doc, who);
  const pulled = await (resolve ? doorbell.inboxResolve({ knockId, status: "pulled", by, reason, at, within })
                                : doorbell.pullKnock({ knockId, by, at, within }));
  if (!pulled || pulled.ok !== true) return pulled;
  const { within: filed, ...answer } = pulled;
  if (!pulled.existed) return { ...answer, bundle: bundleOf(filed) };
  /* A knock already pulled: its bundle is the one holding its capture. */
  const home = provenance.homeOf(pulled.capture && pulled.capture.sha256);
  if (home) return { ...answer, bundle: { bundleId: home.bundleId, bundleSha: null, existed: true } };
  /* A pulled knock no bundle holds (pulled through the doorbell's own route, or before N380): its document is promoted now,
     in a transaction of its own; the knock is already pulled, so a refusal leaves it as it was. */
  if (!pulled.document) return { ...answer, bundle: null };
  let again;
  try { again = promoteIn(deps, pulled.document, { ...who, at: pulled.pulled_at || at }); }
  catch { again = { ok: false, reason: "PROMOTE_FAILED", status: 502, detail: "the promotion did not complete." }; }
  if (again && again.ok === true) return { ...answer, bundle: bundleOf(again) };
  return { ...(again || { ok: false, reason: "PROMOTE_FAILED" }), ok: false, knockId,
           detail: `the knock was already brought in, and its record was not filed; nothing was written. `
                 + String((again && again.detail) || "").slice(0, 300) };
}
