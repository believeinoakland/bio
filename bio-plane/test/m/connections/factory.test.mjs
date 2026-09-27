/* connections: the modules it creates (K155). `connectionsOf` is reached from the store's constructor before capture's
   own creation, and capture, extraction and host-governor keep the FIRST instance per storage, so whatever this
   module creates is what the whole plane reaches. Driven at the factory, on a fresh host, before anything else. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage } from "./fixture.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { rendererFor } from "../../../src/render.mjs";

test("R24, R18, K155: the capture and extraction connections creates carry the env it was given, so the plane's capture has its renderer and its governor its bindings", () => {
  const renderer = { fetch: async () => new Response(JSON.stringify({ ok: true })) };
  const env = { RENDERER: renderer, GOVERNOR_APPETITE_PER_MIN: "7", CONNECTION_DERIVE_DELAY_MS: "5" };
  const host = { storage: storage() };
  const k = connectionsOf(host, { env });
  /* The capture connections reaches (R24's `resolveLinks`) is the one every later caller gets, with this env. */
  assert.equal(k.capture.env, env);
  assert.equal(captureOf(host, { env: {} }), k.capture, "capture keeps its first instance");
  assert.equal(captureOf(host).env, env);
  assert.equal(captureOf(host).governor.env, env, "host-governor is created from capture with the same env");
  /* What a rendered acquire asks first: with the env, a renderer is found (RENDER_NO_RENDERER is its absence). */
  assert.equal(rendererFor(captureOf(host).env).kind, "service");
  assert.equal(extractionOf(host).env, env);
  /* R18's bindings are read from the same env. */
  k.migrate();
  assert.equal(k.wake(1000), null);
  k.markDirty("ENT-2026-0001");
  assert.equal(k.wake(1000), 1005);
});

test("R24, K155: with no env, the modules connections creates are created with none, and a module passed in is used as given", () => {
  const host = { storage: storage() };
  const capture = { env: { MINE: true }, resolveLinks: () => ({ links: [] }) };
  const k = connectionsOf(host, { capture });
  assert.equal(k.capture, capture);
  const bare = connectionsOf({ storage: storage() });
  assert.deepEqual(bare.capture.env, {});
  assert.equal(rendererFor(bare.capture.env).kind, "none");
});
