/* screens-publish's tests: the scripted plane behind each screen, over interface-shell's served page (its tests'
 * harness, `harness.mjs`, and document stand-in, `dom.mjs`). Each fixture answers its screen's reads in their owners'
 * documented shapes (review, case-inputs, case-authoring, case-check, case-tensions, case-carriage, ratification,
 * publish-schedule, public-read, case-import, docket, doorbell); a test overrides any op. */
import { webcrypto } from "node:crypto";
import { SCREENS, SCREEN_WORDS } from "../../../src/screens-publish/index.mjs";
import { boot, ok, refused, refusedIn, silent, pending, textNodes, settle, bytes, MEMBER } from "../interface-shell/harness.mjs";

export { SCREENS, SCREEN_WORDS, ok, refused, refusedIn, silent, pending, settle };

export const P = "PROJ-2026-0012";
export const DR = "RVD-2026-0001";
export const C = "CASE-2026-0012";
export const SHA = "3b9f" + "0".repeat(56) + "c210";
export const B1 = "7d0e" + "1".repeat(56) + "91ab";
export const E1 = "c41a" + "2".repeat(56) + "0f57";
export const PHOTO = "ab12" + "3".repeat(56) + "ef90";
export const DIGEST = "d".repeat(64);
export const GRANT_SECRET = "SENTINEL-GRANT-9f2cb7e1";

const projectMd = ["---", `id: ${P}`, "object_type: project", "title: \"The Coliseum lease\"", "---", ""].join("\n");

export const COPY = (o = {}) => ({ kind: "review-copy", reader: "member", draft: DR, project: P,
  case: { case_id: C, edition: 2, identity: "The Coliseum lease", newCase: false },
  authored: { scope: "Rent adjustments under the Coliseum lease, 2024 to 2026.", statement: "The rents rose without the vote the lease requires.",
    excluded: [{ target: "INFO-9", description: "Whether the rents are fair", reason: "outside the lease's terms" }] },
  findings: [{ target: "FND-2026-0031", present: true, text: "The 2024 adjustments had no council vote." }],
  gates: "passed",
  statement_acknowledgements: { acknowledgements: [{ by: "mai", reason: "The fairness question is another project's.", at: "2026-10-05T10:00:00Z" }] },
  observations: [{ observation: "OBS-2026-0001", chosen: { level: "name" }, stated: "signed the March 2024 adjustment" },
    { observation: "OBS-2026-0002", chosen: null, stated: null }],
  grants: [{ grant_id: "GRT-1", recipient: "Prof. N. Iyer · housing law · 2026-10-20", until: "2026-10-20" }],
  ...o });

export const PREFLIGHT = (o = {}) => ({ wrote: false, ready: false,
  first: { ok: false, code: "PHOTO_UNCHECKED", reason: "PHOTO_UNCHECKED", translation: "Photo 1 is not yet checked." },
  blockers: [{ ok: false, code: "TENSION_NOT_DISCLOSED", translation: "A contradiction is not yet disclosed." }],
  steps: [{ case: C, edition: 2, pinned: [{ target: "FND-2026-0031", bundleSha: B1 }] }, { roles: {}, required: null }, { tensions: [] },
    { photos: [{ ref: "INFO-2026-0007", sha: PHOTO, taken_by: "dev", relied_on_by: [{ member: "FND-2026-0031", role: "relied" }], state: "unchecked", marks: [], copy: null, refused: false, words: "photo.refused.unchecked" }], unchecked: 1 },
    { case: C, edition: 2, minted: false }, { sentences: [] }, { rule: null }, { signer: "dev", open_requests: [], publish_at: { zone: "America/Los_Angeles" } }],
  ...o });

export const DOCUMENT = (o = {}) => ({ case_id: C, edition: 2, doc_sha: SHA, text: "…", published_at: null,
  sign: { namespace: "bio-ratify", statement: `bio-ratify-case ${C} 2 ${SHA}\n` },
  citations: [{ target: "INFO-2026-0004", version: E1, capture: "x" }, { target: "FND-2026-0031", version: B1 }, { target: "INFO-2026-0005", version: "undetermined" }],
  ...o });

/** The plane every screen reads from, keyed by op. */
export function plane(o = {}) {
  return {
    whoami: ok({ ...MEMBER, member: "dev", handle: "dev", capabilities: ["contribute", "create_projects", "publish"] }),
    image: ok({ "bundle.md": projectMd }),
    openoriginal: bytes("PNG", "image/png"),
    casedrafts: ok({ kind: "review-drafts", project: P, drafts: [{ draft_id: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" }] }),
    reviewcopy: ok(COPY()),
    casecheck: ok({ state: "held", case: C, edition: 2 }),
    casedocument: ok(DOCUMENT()),
    whatchangeddrafts: ok({ case: C, truncated: false, drafts: [{ id: "WCD-2026-0001", text: "Adds the 2025 rent schedules.", label: { machine: true }, at: "2026-10-06T09:00:00Z" }] }),
    reviewcomments: ok({ kind: "review-comments", comments: [{ comment_id: "RVC-1", draft_id: DR, reviewer: "Prof. N. Iyer", reviewer_kind: "recipient", text: "Finding 1 should say which schedule the council approved.", at: "2026-10-07T09:00:00Z" }] }),
    publishpreflight: ok(PREFLIGHT()),
    publishtensions: ok({ wrote: false, project: P, count: 2, candidates: [{ says: "Two documents date the rent notice differently." }], says: "" }),
    photomarks: ok({ capture: PHOTO, photo: true, state: "unchecked", copy: null, refused: false, marks: [] }),
    publishschedule: ok({ editions: [], limit: 500, cursor: null }),
    publish: ok({ caseId: C, edition: 2, minted: false, caseDocument: { case_id: C, edition: 2, doc_sha: SHA, bytes: 10 }, findings: [{ target: "FND-2026-0031", bundleSha: B1 }] }),
    caseratify: ok({ caseId: C, edition: 2, sitting: [{ bundleId: "FND-2026-0031" }, { bundleId: "INFO-2026-0004" }] }),
    publishat: ok({ case: C, edition: 2, state: "waiting", at: { date: "2026-11-19", time: "06:00", zone: "America/Los_Angeles" } }),
    publishedcase: ok({ caseId: C, edition: 2, scope: "The Coliseum lease", signed_at: "2026-11-18T10:00:00Z", published_at: "2026-11-19T14:00:00Z",
      editions: [{ edition: 1 }, { edition: 2 }], manifest_sha: SHA,
      findings: [{ bundle_id: "FND-2026-0031", body: { conclusion: "The 2024 adjustments were made without the council vote the lease requires." },
        strength: [{ axis: "capture", grade: "B" }, { axis: "connection", grade: "C" }], meets_bar: true }],
      method: { timeline: [{ what: "Council approves amendment 1", at: "2024-01-12" }] },
      people: [{ shown: "The City Administrator", reason: "signed the March 2024 adjustment" }],
      captures: [{ title: "Council minutes, 12 January 2024", sha256: E1 }] }),
    verify: ok({ published: true, sha256: SHA, matches: [{ bundle_id: C, path: "manifest", kind: "manifest", published: true }] }),
    importedcases: ok({ imports: [{ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease revenue" }], count: 1, wrote: false }),
    importedcase: ok({ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease revenue",
      edition: { edition: 2, imported_by: "dev", imported_at: "2026-10-01T09:00:00Z",
        findings: [{ finding: "FND-W-1", title: "Port lease revenue fell short of the adopted budget", result: "recreated" },
          { finding: "FND-W-2", title: "The shortfall was not reported to council", result: "partial" },
          { finding: "FND-W-3", title: "The 2025 calculation of arrears", result: "not_recreated" }] }, wrote: false }),
    docket: ok({ case: C, project: P, entries: [
      { shelf: "public", entry: 1, kind: "edition", summary: "Edition 2 published, superseding Edition 1", published_at: "2026-11-19T14:00:00Z" },
      { shelf: "record", entry: 2, kind: "court-order", summary: "Order of 20 November: seal exhibit 4", proposed: "public", state: "filed", filed_at: "2026-11-20T09:00:00Z" }], wrote: false }),
    docketprepare: ok({ entry: "{}", digest: DIGEST, statement: `bio-docket ${C} 3 ${DIGEST}\n`, warning: "Posting is public and permanent.", expires: "2999-01-01T00:00:00Z" }),
    docketpost: ok({ case: C, seq: 3, entry: 2, published_at: "2026-11-21T09:00:00Z" }),
    knock: ok({ ok: true, knockId: "KNOCK-1", sha256: SHA, bytes: 3, received: true, pseudonym: null }),
    ...o,
  };
}

/** An IndexedDB holding a signing key kept on this device (interface-shell R40's form), and its public wire key. */
export async function keptKey() {
  const pair = await webcrypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
  const raw32 = new Uint8Array(await webcrypto.subtle.exportKey("raw", pair.publicKey));
  const idb = new Map([["civicsmith-signer", new Map([["keys", new Map([["own", { priv: pair.privateKey, raw32: raw32.buffer.slice(0), label: "bio-ratify" }]])]])]]);
  return idb;
}
/** Waits for the page's own work (WebCrypto, the kit's dialogs) until `f()` holds. */
export async function until(p, f) { for (let i = 0; i < 400 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); await p.settle(); }
/** The kit's "What your key signs, exactly" dialog (interface-shell R41): its listed lines, then confirmed or declined. */
export const signDialog = (p) => p.root().querySelector('[data-overlay="sign"]');
export async function answerSign(p, yes = true, sent = null) {
  await until(p, () => signDialog(p));
  const lines = signDialog(p) ? signDialog(p).textContent : "";
  await p.click(`[data-shell="${yes ? "dialog-yes" : "dialog-no"}"]`);
  await until(p, () => (sent ? p.byOp(sent).length > 0 : !signDialog(p)));
  return lines;
}

/** The served page at `path` with this module's screens, over the plane. */
export async function open(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o.plane || {}), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}

export const main = (p) => p.doc.getElementById("cs-main") || p.root();
export const text = (p, el = main(p)) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();
export const ops = (p, el = main(p)) => el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
export const button = (p, op, nth = 0) => main(p).querySelectorAll(`button[data-act="${op}"]`)[nth] || null;
export function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (el.type === "checkbox" || el.type === "radio") el.checked = !!v; else el.value = v;
  }
}
/** Ticks the option `value` of a `cs.checks` group. */
export function tick(p, id, value) {
  const box = p.doc.getElementById(id).querySelectorAll("input").find((i) => i.getAttribute("value") === value);
  box.checked = true;
}
/** Presses an act: a reasoned act's reason field answered with `reason`, a dialog confirmed. */
export async function press(p, op, { nth = 0, values = {}, reason, confirm = true } = {}) {
  fill(p, values);
  const b = button(p, op, nth);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const ok2 = slot && slot.querySelector('[data-shell="confirm"]');
  if (ok2 && confirm) await p.click(ok2);
  await p.settle();
  return { b, slot: () => p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`) };
}
export const last = (p, op) => p.byOp(op).at(-1);
/** Every text node drawn that reads as a word key: a key the page holds no word for is drawn as itself (interface-shell R5). */
export const rawKeys = (root) => textNodes(root).map((t) => String(t.data).trim()).filter((t) => /^[a-z][\w-]*(\.[\w-]+){2,}$/.test(t));
/** A file chosen in a file field (the stand-in's `files`). */
export function choose(p, id, bytes) {
  const el = p.doc.getElementById(id);
  el.files = [{ name: "f.pdf", size: bytes.length, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }];
}
