/* D-490's negative control for `browser-render.test.mjs`. Run: `node test/nc-d490.mjs [arm]`.
 *
 * Each arm breaks ONE thing in ONE file, runs the suite, records its tally and the
 * FAIL labels against what this file DECLARES must and must not fail, and restores
 * the file from a uniquely-named pristine copy, verified by sha256 AND by content
 * with the byte count printed and floored. A baseline row runs first and last, so
 * six-arms-broken is distinguishable from six-arms-working.
 *
 * THE PRISTINE COPIES ARE OUTSIDE THE WORKTREE (BOB #32, 2026-09-24, superseding
 * the older harnesses here which keep a dot-directory inside it): a file in the
 * worktree is walked by repository-walking suites, trips `gates.mjs` §2e's
 * under-inclusion check, and makes the tree dirty so D-293 refuses to record a green
 * verdict. `BIO_NC_SCRATCH` names the directory; otherwise one is made under the
 * OS temp root under a name unique to THIS RUN, because a shared unqualified name
 * is an identity nobody owns.
 *
 * An arm whose patch matched anything but exactly once is reported as NOT ARMED,
 * never as a result. */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUITE = `${ROOT}test/browser-render.test.mjs`;
const PRISTINE = process.env.BIO_NC_SCRATCH
  ? join(process.env.BIO_NC_SCRATCH, `nc-d490-${randomUUID().slice(0, 8)}`)
  : join(tmpdir(), `nc-d490-${process.pid}-${randomUUID().slice(0, 8)}`);
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* DECLARED BEFORE ARMING. `must` is what the arm is FOR; `mustNot` is the
   over-strictness half — an arm that also breaks these broke more than one thing. */
const ARMS = {
  /* THE ROW'S CONTROL (QUEUE.md D-490): take the driver back out, so a BROWSER
     binding is once more a binding with nothing behind it. Every arm that needs a
     render must fail; the two arms that assert the UNBOUND case (A9, A10) and every
     arm that drives the driver directly (B–F, through the harness worker) must not. */
  nodriver: { file: "src/render.mjs",
    from: `  if (env && env.BROWSER && typeof env.BROWSER.fetch === "function")\n    return browserBindingRenderer(env.BROWSER);`,
    to:   `  if (env && env.BROWSER && typeof env.BROWSER.fetch === "function")\n    return { kind: "browser-binding-without-driver", render: null };`,
    must: ["A1", "A2", "A3", "A3b", "A4", "A5", "A6", "A7", "A8", "A8b", "A8c", "A8d", "A8e", "A8f", "A8g"] },
  /* A request ledger nobody could record, read as "the page made no requests". */
  emptyrequests: { file: "src/browserrender.mjs", from: `      requests: sawNetwork ? `, to: `      requests: true ? `,
    must: ["C1"] },
  /* A script set nobody could record, read as "none ran" (BOB #31's exact case). */
  emptyscripts: { file: "src/browserrender.mjs", from: `      scripts: sawDebugger ? scripts : null,`, to: `      scripts: scripts,`,
    must: ["C3"] },
  /* A rule that stopped a request, reported as the request failing. */
  blockedasfailed: { file: "src/browserrender.mjs", from: `            r.outcome = p.blockedReason ? "blocked" : "failed";`,
    to: `            r.outcome = "failed";`, must: ["B1"] },
  /* The session left open — the leak that spends the allowance BOB #32 rests on. */
  noclose: { file: "src/browserrender.mjs",
    from: `      if (targetId) { try { await conn.send("Target.closeTarget", { targetId }, undefined, 5000); } catch`,
    to:   `      if (false) { try { await conn.send("Target.closeTarget", { targetId }, undefined, 5000); } catch`,
    must: ["F2", "F3"] },
  /* OVER-STRICTNESS, and it EARNED ITS PLACE: a browser sending CDP resource types
     lowercase is correct in a spelling this driver did not anticipate, and NOTHING
     may fail. Its first run found a real defect — `p.type === "Document"` compared
     against the capitalised literal, so the main document's status read `null` on a
     correct render — which is now routed through `resourceType`. */
  lowercasetypes: { file: "test/browser-render.test.mjs",
    from: `              const r = page.requests[i], id = "R" + i;`,
    to:   `              const r0 = page.requests[i], r = { ...r0, type: String(r0.type || "").toLowerCase() }, id = "R" + i;`,
    must: [] },
};

const run = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf-8", timeout: 900000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/browser-render: (\d+) pass, (\d+) fail/);
  const fails = [...out.matchAll(/^\s+FAIL\s+(\S+)/gm)].map((x) => x[1]);
  /* A SUITE THAT NEVER REACHED ITS OWN FOOT REPORTS -1, NEVER 0: a TypeError inside
     an assertion ends the module with the tally reading clean. */
  return { exit: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, fails };
};

mkdirSync(PRISTINE, { recursive: true });
const want = process.argv[2];
const rows = [];
rows.push({ arm: "baseline", ...run() });
for (const [name, a] of Object.entries(ARMS)) {
  if (want && want !== name) continue;
  const path = `${ROOT}${a.file}`;
  const keep = join(PRISTINE, `${name}.${a.file.replace(/\//g, "_")}`);
  copyFileSync(path, keep);
  const before = sha(keep);
  const src = readFileSync(path, "utf-8");
  const count = src.split(a.from).length - 1;
  if (count !== 1) { rows.push({ arm: name, armed: false, matches: count }); continue; }
  writeFileSync(path, src.replace(a.from, a.to));
  const res = run();
  copyFileSync(keep, path);
  const after = sha(path);
  const same = Buffer.compare(readFileSync(keep), readFileSync(path)) === 0;
  const bytes = readFileSync(path).length;
  if (bytes < 1000 || before !== after || !same) { console.error(`RESTORE FAILED for ${name}`); process.exit(3); }
  const missing = a.must.filter((x) => !res.fails.includes(x));
  const extra = res.fails.filter((x) => !a.must.includes(x));
  rows.push({ arm: name, armed: true, ...res, declared: a.must, missing, extra,
              verdict: missing.length === 0 && extra.length === 0 ? "AS DECLARED" : "NOT AS DECLARED",
              restore: `sha256 ${after.slice(0, 12)} MATCH, cmp IDENTICAL, ${bytes} bytes` });
}
rows.push({ arm: "baseline-last", ...run() });
rmSync(PRISTINE, { recursive: true, force: true });
for (const r of rows) console.log(JSON.stringify(r));
