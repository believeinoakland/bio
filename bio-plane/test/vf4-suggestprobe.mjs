#!/usr/bin/env node
/* DATED NOTE, 2026-09-13, ADDED BY D-323 — NOTHING BELOW IS EDITED. This is a
   MEASUREMENT OF RECORD and the candidate shapes it probes are the ones VF-4
   handed the live plane at 0.57.0. D-323/D-324 landed the same day: the harness
   now mints `level-empty-<reporting level>`, so the `level-empty:content` shape
   this file probes is the PRE-FIX one and is kept as the exhibit. Re-running it
   still measures what the deployed plane does with that spelling, which is the
   question it was written to answer. The local equivalent, driven against the
   plane's own expressions with no network, is
   `agent-worker/test/wire-vocabulary.test.mjs` (W8). */
/* VF-4 diagnostic: seed scratch, open a run, and print `op=suggest`'s FULL
   answer for each candidate shape. Scratch only; sweeps at exit. */
import { createHash } from "node:crypto";
import { loadEnv, ORIGIN, redact } from "./vf4-call.mjs";
import * as FIX from "./vf4-fixture.mjs";

const env = loadEnv(); const ADMIN = env.BIO_ADMIN_TOKEN;
const sha = (v) => createHash("sha256").update(v).digest("hex");
const S = "scratch";
const RUN = `RUN-2026-9740-vf4-diag-${Date.now()}`;
async function op(name, { query = {}, body = null, token = ADMIN } = {}) {
  let url = `${ORIGIN}/api/?op=${name}&token=${encodeURIComponent(token)}&store=${S}`;
  for (const [k, v] of Object.entries(query)) if (v != null) url += `&${k}=${encodeURIComponent(String(v))}`;
  const r = await fetch(url, body == null ? { cache: "no-store" }
    : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch {}
  return { status: r.status, body: j, raw: redact(txt) };
}
try {
  await op("purge", { query: { confirm: S }, body: {} });
  await FIX.fixtureOrThrow();
  for (const [id, text, type, state] of [[FIX.DOC, FIX.infoMd(), "information", "collected"],
                                         [FIX.INQ, FIX.inquiryMd(), "inquiry", "concluded"]]) {
    const p = await op("promote", { body: { bundleId: id, base: null, snapKey: `${id}-diag`, author: "seed",
      meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`, current_state: state,
              created: FIX.NOW, last_updated: FIX.LATER },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] } });
    console.log(`promote ${id} -> ${p.status} ok=${p.body?.ok}`);
  }
  const o = await op("airunopen", { body: { run: RUN, contextType: "inquiry", contextId: FIX.INQ,
    label: "diag", mode: "check", principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 } });
  console.log(`airunopen -> ${o.status} ok=${o.body?.ok}`);

  const cands = [
    ["new-version", { kind: "new-version", target: FIX.INQ, name: "diag-alt-reading", relationship: "and",
      description: "The 1998 resolution is cited for an authority it does not state on its face; the basis "
        + "may instead rest on the adopted budget's own transfer schedule." }],
    ["level-empty", { kind: "level-empty", target: FIX.INQ, level: "content",
      observed_at: "observation:diag-content-1", name: "level-empty:content",
      description: "Every extracted passage held at content grain was read and none names a rescinding resolution." }],
  ];
  for (const [label, c] of cands) {
    const r = await op("suggest", { body: { ...c, run: RUN } });
    console.log(`\n--- suggest ${label} -> HTTP ${r.status}`);
    console.log(r.raw.slice(0, 1800));
  }
  const bv = await op("basisversions", { query: { id: FIX.INQ, limit: 50 } });
  console.log(`\nbasisversions -> ${bv.status}`); console.log(bv.raw.slice(0, 1500));
  const st = await op("stats");
  console.log(`\nstats basisVersions=${st.body?.result?.basisVersions} legs=${st.body?.result?.basisVersionLegs} refusals=${st.body?.result?.suggestRefusals}`);
} finally {
  const p = await op("purge", { query: { confirm: S }, body: {} });
  console.log(`\nswept: ${p.status} ok=${p.body?.ok}`);
}
