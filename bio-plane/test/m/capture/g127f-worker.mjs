/* The Worker the platform check of capture R113 (G127f) runs under Miniflare: a minimal Durable Object over REAL DO SQLite and a REAL R2 bucket binding that holds
   capture's `Capture` as the plane's store does (record-core's tables, the evidence bucket, capture's own tables), with the real provenance over the same storage and the governor stood in
   (this check is of the multipart path, not of provenance). One command per request, so the parts of one upload arrive in separate requests, as they do from
   a browser; the object lives between them. A test helper, not product code. */
import { DurableObject } from "cloudflare:workers";
import { Capture } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";

const KEY = (d) => `bio/captures/${d}`;

export class Probe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const core = recordOf(ctx, { evidence: env.CAPTURES, evidencePrefix: "bio/captures/" });
    core.migrate();
    membershipOf(ctx, { record: core }).migrate();
    const credentials = credentialsOf(ctx, { record: core });
    credentials.migrate();
    const provenance = provenanceOf(ctx, { record: core, membership: membershipOf(ctx, { record: core }) });
    provenance.migrate();
    this.c = new Capture(ctx.storage, { record: core, env: { ...env, INSTANCE_NAME: "probe", VERSION: "0" }, governor: {}, provenance, credentials });
    this.c.migrate();
    this.c.evidenceKey = KEY;
    this.inst = crypto.randomUUID();   /* which in-memory object answered: it changes when workerd took the object out of memory */
  }

  async fetch(request) {
    const url = new URL(request.url), q = (k) => url.searchParams.get(k);
    const by = q("by") || "m1";
    const json = async () => await request.json();
    let out;
    if (q("cmd") === "begin") { const b = await json(); out = await this.c.beginPartedUpload({ ...b, by, bounds: b.bounds ?? null }); }
    else if (q("cmd") === "part")
      out = await this.c.putUploadPart({ upload: q("upload"), index: Number(q("index")), sha256: q("sha256"), bytes: request.body, by,
                                         declared: request.headers.has("content-length") ? Number(request.headers.get("content-length")) : null });
    else if (q("cmd") === "complete") { const b = await json(); out = await this.c.completePartedUpload({ upload: b.upload, parts: b.parts, by, at: "2026-10-24T12:00:00Z" }); }
    else if (q("cmd") === "abort") out = await this.c.abortPartedUpload({ upload: q("upload"), by });
    else if (q("cmd") === "state") {
      const h = await this.env.CAPTURES.head(KEY(q("sha256")));
      const listed = await this.env.CAPTURES.list({ prefix: "bio/captures/" });
      out = { ok: true, inst: this.inst, size: h ? h.size : null, objects: listed.objects.map((o) => o.key), receipts: [...this.ctx.storage.sql.exec(`SELECT capture_sha FROM captured_locators`)].map((r) => r.capture_sha),
              rows: [...this.ctx.storage.sql.exec(`SELECT count(*) AS n FROM parted_uploads`)][0].n };
    // fixtures-own: harness the probe Worker's own reply to a command it was not sent, not any module's answer
    } else out = { ok: false, reason: "UNKNOWN_COMMAND" };
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  }
}

export default {
  async fetch(request, env) { return env.PROBE.get(env.PROBE.idFromName("one")).fetch(request); },
};
