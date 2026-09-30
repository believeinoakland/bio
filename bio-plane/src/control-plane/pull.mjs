/* control-plane: THE DOORBELL'S PULL (R36; N364, DEC-78 item 1). `op=inboxpull` brings a knock into the record as a
   capture (capture R65, `pullKnock`) and, in the same act, promotes the pulled document as a new `information` bundle at
   `collected` (promotion's `promote`), the puller its author. Run in the record store's door (`dispatch.mjs`), where
   capture, promotion and record-core are in process.

   ONE ACT, AND WHAT KEEPS IT ONE. `pullKnock` is async (it holds the bytes under their own digest and profiles them
   before it writes), and record-core's `transact` is synchronous, so no transaction can span both writes. The order is
   therefore chosen so that every refusal either can give lands before anything is written: (1) the knock is read and a
   knock that cannot be pulled answers `pullKnock`'s own refusal; (2) the promotion is run over the same package with a
   provisional document inside `transact` and rolled back, so its refusal (no recorded group, C-64.1; a mint exhausted;
   a package refused) answers with nothing written; (3) the pull; (4) the promotion of the pulled document, in one
   `transact` with its id. Only a store fault, or another act landing between (2) and (4), can leave a pulled knock
   without its bundle; the answer then says so, and pulling the knock again files it, because a pulled knock whose
   capture no bundle holds (`provenance.homeOf`) is promoted by the next pull. */
import { createSha256 } from "../../checks/bio-checks.mjs";

/* The id's stem is record-core's `INFO-<year>-NNNN`; the slug says where the material came from. */
export const PULL_BUNDLE_SLUG = "doorbell-knock";

const DRY = Symbol("pull: the promotion's dry run");
const hexOf = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
const enc = (text) => {
  const b = new TextEncoder().encode(text);
  return { text, bytes: b.length, sha256: createSha256().update(b).hex() };
};
const instantOf = (d) => d.toISOString().replace(/\.\d+Z$/, "Z");

/* What `pullKnock` will write as the document's `file`, so the provisional package names the same path. */
const fileOf = (knockId) => `snapshots/${String(knockId).replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100)}`;

/* The provisional document the dry run promotes: the pulled document's shape, minus what only the pull computes (the
   profile and the receipt); every field a promotion's steps read is present. */
function provisionalDocument(row, { by, at }) {
  return {
    file: fileOf(row.knock_id), locator: `knock:${row.knock_id}`, retrieved: at,
    authority_state: "undetermined",
    authority_basis: `material handed to the group through its doorbell by an unnamed knocker; no authority is asserted`,
    capture: { method: "doorbell knock, received, hashed at receipt", grade: null,
               grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED", actor_class: "member", actor: by,
               sha256: row.sha256, encoding: "binary", bytes: row.bytes },
    source: { kind: "knocker", named: false, pseudonym: row.pseudonym ?? null,
              receipt: { knock_id: row.knock_id, sha256: row.sha256, bytes: row.bytes, received: row.received } },
    origin: { kind: "doorbell", knock_id: row.knock_id },
    attestation_attempts: [],
  };
}

/* The bundle, capture-requests R38's shape: the document as `bio/bundle.md`, capture's provenance document as
   `data/provenance.json`, the bytes as a blob at the document's own `file`, and one register row. No contact is in any
   of it (capture R70): the document carries none, and nothing here reads the inbox's `contact`. */
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
    /* The puller is the author, and the session's two identity stamps are op=promote's (R17). */
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

/* The dry run: the same promotion, rolled back whatever it answers. Answers the refusal, or null when it would land. */
function dryRun(deps, doc, who) {
  try {
    const r = deps.record.transact(() => {
      const p = promoteIn(deps, doc, who);
      if (!p || p.ok !== true) return p || { ok: false, reason: "PROMOTE_FAILED" };
      throw DRY;
    });
    return r && r.ok === false ? r : null;
  } catch (e) {
    if (e === DRY) return null;
    throw e;
  }
}

const bundleOf = (p) => ({ bundleId: p.bundleId, bundleSha: p.bundleSha ?? null });

/** R36: `op=inboxpull`. `deps` is `{capture, promotion, record, provenance}` of one record; `by`, `identity` and `viewer`
 *  are the control plane's stamps. Answers capture's pull answer with `bundle: {bundleId, bundleSha}` beside it, or the
 *  first refusal, with nothing written. */
export async function pullAndFile(deps, { knockId, by, identity, viewer, now = () => new Date() } = {}) {
  const { capture, provenance } = deps;
  const at = instantOf(now());
  const who = { knockId, by, identity, viewer, at };
  /* (1) the knock as it stands; any knock that cannot be pulled answers capture's own refusal, which writes nothing */
  const got = typeof knockId === "string" && knockId && typeof by === "string" && by.trim() ? capture.inboxGet(knockId) : null;
  const row = got && got.ok ? got.item : null;
  if (!row || row.status === "discarded") return capture.pullKnock({ knockId, by, at });
  if (!row.capture_sha) {
    /* (2) the promotion's refusal before anything is written */
    const refused = dryRun(deps, provisionalDocument(row, { by, at }), who);
    if (refused) return { ...refused, knockId };
  }
  /* (3) the pull (a refusal writes nothing: capture R65) */
  const pulled = await capture.pullKnock({ knockId, by, at });
  if (!pulled || pulled.ok !== true) return pulled;
  /* a knock already pulled: its bundle is the one holding its capture, or, when none does, it is filed now */
  if (pulled.existed) {
    const home = provenance.homeOf(pulled.capture && pulled.capture.sha256);
    if (home) return { ...pulled, bundle: { bundleId: home.bundleId, bundleSha: null, existed: true } };
    /* capture keeps the document in the same write that pulls the knock, so a pulled knock always has one */
    if (!pulled.document) return { ...pulled, bundle: null };
  }
  /* (4) the promotion of the pulled document; a fault here is answered as the residue it leaves, never thrown past the
     pull, so the answer says the knock was pulled */
  let filed;
  try { filed = promoteIn(deps, pulled.document, { ...who, at: pulled.pulled_at || at }); }
  catch { filed = { ok: false, reason: "PROMOTE_FAILED", detail: "the promotion did not complete." }; }
  if (filed && filed.ok === true) return { ...pulled, bundle: bundleOf(filed) };
  return { ...(filed || { ok: false, reason: "PROMOTE_FAILED" }), ok: false, knockId, status: 502,
           pulled: { capture: pulled.capture, pulled_by: pulled.pulled_by, pulled_at: pulled.pulled_at },
           detail: "the knock was brought in and its bundle was not filed; pulling the knock again files it. "
                 + String((filed && filed.detail) || "").slice(0, 300) };
}
