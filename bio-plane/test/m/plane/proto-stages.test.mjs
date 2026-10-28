/* PROTO STAGES (throwaway): with PROTO_STAGES=1 an `op=captureupload` through the real Worker and `Store` (workerd under Miniflare) answers `up-*` entries in its Server-Timing; with the flag
   unset the answer carries none and is otherwise the same. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { textBytes } from "./r8-wave-kit.mjs";

const ENTRY = fileURLToPath(new URL("./r8-headofline-entry.mjs", import.meta.url));
const world = (extra) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Headline", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: "adm-st", DAEMON_TOKEN: "dmn-st", PROBE_TOKEN: "prb-st", ...extra },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-stages-")),
});
const worlds = [];
after(() => Promise.all(worlds.map((w) => w.dispose())));
const upload = async (mf) => {
  const ns = await mf.getDurableObjectNamespace("STORE"), stub = ns.get(ns.idFromName("bio"));
  const token = (await (await stub.fetch("http://do/r8/session?as=member")).json()).token;
  const r = await mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: textBytes(300_000) });
  const j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j).slice(0, 300));
  return { timing: r.headers.get("server-timing") || "", body: j };
};

test("PROTO_STAGES=1: the upload's answer states the up-* stages; unset it states none", { timeout: 120_000 }, async () => {
  const on = world({ PROTO_STAGES: "1" }), off = world({});
  worlds.push(on, off);
  const a = await upload(on), b = await upload(off);
  for (const n of ["up-door", "up-room-wait", "up-body-read", "up-hash-put", "up-profile", "up-promote-within", "up-registrar", "up-read", "up-answered"])
    assert.match(a.timing, new RegExp(`(^|, )${n};dur=\\d+`), `${n} in ${a.timing}`);
  assert.doesNotMatch(b.timing, /up-/);
  assert.equal((a.body.result ?? a.body).ok, true);
});
