/* ratification R6, R39, R57 (T51 fix round 6, G54), the platform check L: the plane's own Worker and `Store` booted on workerd by
   `g54-l.test.mjs` under Miniflare, with a real Durable Object, real R2 buckets and the real storage. `G54Held` is the plane's
   `Store` plus debug routes (`/g54/...`) that lay a case edition through the modules' own commits (what a ceremony's store half
   writes, `publication`'s `storeCaseDocument`, `commitCaseEdition`, `commitEdition`) and read its state. The default export is the
   plane's Worker with routes (`/g54w/...`) that run the Worker half's post-commit block, the one `op=caseratify` and `op=ratify`
   run after their commit (`copyMaterials`, then `assembleCaseContainer`, over the object's own door and the real buckets), with
   one fault made at a time: a bucket `put` that throws, a store that does not answer `recordcasemanifest`, a request cancelled by
   its caller after the commit. Every other request is the plane's own door. */
import { Store } from "../../../src/plane/store.mjs";
import plane from "../../../src/plane/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { materialsLines, materialAttestationLines } from "../../../src/case-grammar/index.mjs";
import { copyMaterials } from "../../../src/ratification/ops.mjs";
import * as publicationWorker from "../../../src/publication/worker.mjs";

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
const V = (id) => `member:${id}`;
const NOW = "2026-10-22T20:00:00Z";
const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIKEY";
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha = async (s) => hex(await crypto.subtle.digest("SHA-256", typeof s === "string" ? new TextEncoder().encode(s) : s));

const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "references: []", "state_history: []", 'objective: "Find out."', "---", "", "## Objective", "", "Find out.", ""].join("\n");
const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Is ${id} answered?"`,
  "current_state: open", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "references: []", "state_history: []", "surfaced_by: human", 'disposition_reason: ""', "---", "", "## Question", "",
  `Is ${id} answered?`, "", "## Session Log", "", "## Review Notes", ""].join("\n");
const caseDocText = (caseId, edition, project, target, pin) => ["---", "format: bio-case-document/6", `case_id: ${caseId}`,
  `case_edition: ${edition}`, `case_project: ${project}`, "case_roles:", `  - target: ${target}`, `    version_sha: ${pin}`,
  "    edition: 1", "    role: load_bearing", "case_findings:", `  - ${target}`, "case_strength: []", "completeness:",
  "  author: member:olive", `  at: "${NOW}"`, "completeness_excluded: []", "case_citations: []",
  "method:", '  grading: "grading/1"', '  checks: "1.0.0"', ...materialsLines([]), ...materialAttestationLines([]), "---", "",
  "## Scope", "", "The question.", "", "## What This Excludes", "", "Nothing else.", "", "## What Was Searched", "", "Everything.", ""].join("\n");

export class G54Held extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/g54/")) return super.fetch(req);
    const ctx = this.ctx, step = url.pathname.slice(5), q = (k) => url.searchParams.get(k);
    const record = recordOf(ctx), promotion = promotionOf(ctx), pub = publicationOf(ctx);
    let n = 0;
    const key = () => `k${Date.now()}-${++n}`;
    if (step === "seed") {
      /* an owner, her project, one question and its case edition (the case document stored and its commit made, as a
         ceremony's store half makes it); the finding's own signature is laid separately (`finding`), because the act that
         lays it is the one that completes the edition */
      const caseId = q("case"), edition = Number(q("edition") || 1), F = `INQ-2026-${caseId.slice(-4)}`;
      ctx.storage.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                            VALUES ('olive', 'Cover olive', 'h_olive', 'member', 'active', '["contribute"]', 't', 't')`);
      const proj = promotion.promote({ base: null, snapKey: key(), author: V("olive"), ownerMemberId: "olive",
        files: [{ path: "bundle.md", text: projMd(`Team ${caseId}`) }], meta: { object_type: "project" } });
      if (!proj.ok) return json({ error: "project", detail: proj }, 500);
      const inq = promotion.promote({ bundleId: F, base: null, snapKey: key(), author: V("alice"),
        files: [{ path: "bundle.md", text: inquiryMd(F) }], meta: { object_type: "inquiry" } });
      if (!inq.ok) return json({ error: "inquiry", detail: inq }, 500);
      const pin = record.head(F).bundleSha;
      const text = caseDocText(caseId, edition, proj.bundleId, F, pin);
      const stored = pub.storeCaseDocument({ case: caseId, edition, text, author: V("olive"), at: NOW });
      if (!stored.ok) return json({ error: "storeCaseDocument", detail: stored }, 500);
      const signed = record.transact(() => pub.commitCaseEdition({ case: caseId, edition, project: proj.bundleId,
        scope: "The question.", completeness: { statement: "It leaves out the minutes.", author: V("olive") },
        biasAcknowledgement: "none declared", bar: null,
        roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }], sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig\n-----END SSH SIGNATURE-----",
        attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", deliveredBy: V("olive"), at: NOW }));
      if (!signed.ok) return json({ error: "commitCaseEdition", detail: signed }, 500);
      return json({ caseId, edition, finding: F, pin, project: proj.bundleId });
    }
    if (step === "finding") {
      /* the act that completes the edition: the finding's own commit, and its bytes in the published bucket */
      const F = q("finding"), pin = record.head(F).bundleSha, text = record.readFile(F, "bundle.md").text;
      const done = record.transact(() => pub.commitEdition({ bundleId: F, bundleSha: pin, title: `Finding ${F}`, completeness: null,
        strength: null, memberCarriesBlocks: false, group: "test-group", edges: [],
        shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: text.length }],
        attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig9\n-----END SSH SIGNATURE-----",
        deliveredBy: V("olive"), at: NOW }));
      if (!done.ok) return json({ error: "commitEdition", detail: done }, 500);
      await this.env.PUBLISHED.put(`bio/published/${pin}`, new TextEncoder().encode(text));
      return json({ ok: true, case: done.case ?? null });
    }
    if (step === "state") {
      const cs = pub.caseEditionState(q("case"), Number(q("edition") || 1), "test-group");
      const listed = await this.env.PUBLISHED.list({ prefix: "bio/published/" });
      return json({ complete: !!(cs && cs.complete), manifest_sha: cs ? cs.manifest_sha ?? null : null,
                    awaiting: cs ? cs.awaiting ?? null : null, objects: listed.objects.length,
                    rows: [...ctx.storage.sql.exec(`SELECT name FROM pragma_table_info('published_cases')`)].map((r) => r.name) });
    }
    if (step === "cs") return json(pub.caseEditionState(q("case"), Number(q("edition") || 1), "test-group"));
    return json({ error: "unknown g54 step" }, 404);
  }
}

/* The Worker half's post-commit block, as `op=caseratify` runs it after its commit: the materials copied, then the edition's
   container assembled by the one assembly, over the object's own door and the real buckets. One fault at a time. */
async function postCommit(env, ctx, { fault, caseId, edition, waitMs }) {
  const ns = env.STORE, stub = ns.get(ns.idFromName("bio"));
  const door = { fetch: (u, init) => stub.fetch(u, init) };
  const asked = [];
  const stubbed = fault === "record_silent"
    ? { fetch: async (u, init) => { const r = u instanceof Request ? u : new Request(u, init);
                                    asked.push(new URL(r.url).pathname);
                                    return new URL(r.url).pathname === "/recordcasemanifest" ? new Response("down", { status: 500 }) : door.fetch(r); } }
    : door;
  const published = fault === "put_throws" || fault === "manifest_put_throws"
    ? new Proxy(env.PUBLISHED, { get(t, k) {
        if (k !== "put") { const v = t[k]; return typeof v === "function" ? v.bind(t) : v; }
        return async (key, value, opts) => {
          const text = value instanceof Uint8Array ? new TextDecoder().decode(value.slice(0, 80)) : "";
          const isManifest = text.trimStart().startsWith("{") && text.includes("\"format\"");
          if (fault === "put_throws" || isManifest) throw new Error("bucket refused (injected)");
          return t.put(key, value, opts);
        };
      } })
    : env.PUBLISHED;
  const env2 = { ...env, PUBLISHED: published };
  const cs = await (await stub.fetch(`http://do/g54/state?case=${caseId}&edition=${edition}`)).json();
  if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
  await copyMaterials(env2, "bio", []);
  const edState = await (await stub.fetch(`http://do/g54/cs?case=${caseId}&edition=${edition}`)).json();
  let out;
  try { out = await publicationWorker.assembleCaseContainer({ env: env2, stub: stubbed, storeName: "bio", cs: edState, via: "caseratify" }); }
  catch (e) { out = { threw: String((e && e.message) || e) }; }
  return { out, asked, was: cs };
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/g54w/")) return plane.fetch(req, env, ctx);
    const step = url.pathname.slice(6);
    const ns = env.STORE, stub = ns.get(ns.idFromName("bio"));
    if (step === "run") {
      const r = await postCommit(env, ctx, { fault: url.searchParams.get("fault") || "none", caseId: url.searchParams.get("case"),
        edition: Number(url.searchParams.get("edition") || 1), waitMs: Number(url.searchParams.get("wait") || 0) });
      return json(r);
    }
    if (step === "complete") {
      /* the completing act, as the Worker runs it: the commit in the object, a pause where the copies take their time, and the
         post-commit block; a caller that disconnects in the pause cancels this request */
      const caseId = url.searchParams.get("case"), edition = Number(url.searchParams.get("edition") || 1);
      const fin = await (await stub.fetch(`http://do/g54/finding?finding=${url.searchParams.get("finding")}`)).json();
      globalThis.__g54 = { committed: true };
      const r = await postCommit(env, ctx, { fault: "none", caseId, edition, waitMs: Number(url.searchParams.get("wait") || 1500) });
      globalThis.__g54.after = true;
      return json({ fin, ...r });
    }
    if (step === "flag") return json(globalThis.__g54 || {});
    return json({ error: "unknown g54w step" }, 404);
  },
  scheduled: plane.scheduled,
};
