/* admission: T43-21 (K2708, K2710, K2719; N870) — R21's window builds its fingerprint through the doorbell's
   `sourceFingerprint` (doorbell R12), no longer through capture's held copy, which T44 deletes; so no admission file
   imports anything of `capture`. Driven at the module's interface: the window's answers over a real SQLite storage,
   and the imports each of admission's files resolves when it is loaded (a module resolution hook, never its text). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { W, storeWorld } from "./harness.mjs";

const { doorbellOf } = await import("../../../src/doorbell/index.mjs");
const T0 = Date.UTC(2026, 9, 11, 12, 0, 0);

/* A bare storage over node:sqlite, as the harness's, with nothing created in it yet. */
function bareStorage() {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...a) { const st = db.prepare(q); return st.columns().length ? st.all(...a).map((r) => ({ ...r })) : (st.run(...a), []); } };
  return { sql, transactionSync(fn) {
    db.exec("SAVEPOINT t");
    try { const r = fn(); db.exec("RELEASE t"); return r; } catch (e) { db.exec("ROLLBACK TO t"); db.exec("RELEASE t"); throw e; }
  } };
}

test("R21 (T43; doorbell R12): the window's fingerprint is the doorbell's for the same storage and source — counted and asked alone (count: false), with the key bound and unbound (the doorbell's instance key in its knock_key) — and a different source, or another storage's instance key, gives a different one", async () => {
  const addrs = ["203.0.113.9", "2001:db8::1"];
  for (const env of [{ KNOCK_FINGERPRINT_KEY: "bound-key-t43" }, {}]) {
    const w = storeWorld({ env });
    /* the doorbell the window reaches is the storage's one instance (doorbell R25) */
    assert.equal(doorbellOf(w.ctx), w.doorbell);
    for (const addr of addrs) {
      const fp = await w.doorbell.sourceFingerprint(addr);
      assert.match(fp, /^[0-9a-f]{32}$/);
      assert.deepEqual(await w.ops({ address: addr, now: T0 }).doorwindow(), { source: fp, refused: false }, "counted");
      assert.deepEqual(await w.ops({ address: addr, count: false }).doorwindow(), { source: fp }, "asked alone");
    }
    /* control: a different source differs */
    const [a, b] = await Promise.all(addrs.map(async (addr) => (await w.ops({ address: addr, count: false }).doorwindow()).source));
    assert.notEqual(a, b);
    if (!env.KNOCK_FINGERPRINT_KEY) {
      /* unbound: the key is the doorbell's own, generated once in its knock_key, never answered */
      const held = w.sql.exec("SELECT key_hex FROM knock_key");
      assert.equal(held.length, 1);
      assert.equal(JSON.stringify(await w.ops({ address: addrs[0], count: false }).doorwindow()).includes(held[0].key_hex), false);
      /* control: another storage's doorbell holds another instance key, so the same address is another fingerprint */
      const other = storeWorld({ env: {} });
      assert.notEqual((await other.ops({ address: addrs[0], count: false }).doorwindow()).source, a);
    }
  }
  /* the doorbell is reached at the first fingerprint, not at creation: a window over a storage whose doorbell is made
     afterwards answers that doorbell's fingerprint */
  const storage = bareStorage();
  const ctx = { storage };
  const a = W.admissionOf(ctx, { record: { declareTable: () => ({ ok: true }) } });
  const doorbell = doorbellOf(ctx, { capture: { env: { KNOCK_FINGERPRINT_KEY: "late-key" } } });
  const ops = W.admissionOps(a, new URL("http://do/doorwindow"), { address: "198.51.100.4", count: false });
  assert.deepEqual(await ops.doorwindow(), { source: await doorbell.sourceFingerprint("198.51.100.4") });
});

test("R21 (T43; N870): no admission file imports capture — each file of src/admission, loaded afresh, resolves no import into src/capture/, and window.mjs resolves the doorbell's; the hook sees an import of capture where there is one (control: the doorbell's own index.mjs)", async () => {
  const srcDir = new URL("../../../src/admission/", import.meta.url);
  const files = readdirSync(srcDir).filter((f) => f.endsWith(".mjs")).sort();
  assert.deepEqual(files, ["checks.mjs", "index.mjs", "window.mjs"]);
  const resolved = [];
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const r = next(specifier, context);
      resolved.push({ parent: String(context.parentURL || "").split("?")[0], url: r.url });
      return r;
    },
  });
  const capture = new URL("../../../src/capture/", import.meta.url).href;
  const doorbell = new URL("../../../src/doorbell/", import.meta.url).href;
  try {
    for (const f of files) {
      const url = new URL(f, srcDir).href;
      resolved.length = 0;
      await import(`${url}?t43-${f}`);
      const own = resolved.filter((r) => r.parent === url);
      assert.ok(f === "checks.mjs" || own.length > 0, `${f}: its imports were seen`);
      assert.deepEqual(own.filter((r) => r.url.startsWith(capture)).map((r) => r.url), [], `${f} imports nothing of capture`);
      if (f === "window.mjs") assert.ok(own.some((r) => r.url === `${doorbell}index.mjs`), "window.mjs reaches the doorbell");
    }
    /* control: a file that does import capture is seen to */
    const db = `${doorbell}index.mjs`;
    resolved.length = 0;
    await import(`${db}?t43-control`);
    assert.ok(resolved.some((r) => r.parent === db && r.url.startsWith(capture)), "the hook sees an import of capture");
  } finally { hooks.deregister(); }
});
