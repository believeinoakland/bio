/* plane T43 (T43-15; N853b, N862, N866; DEC-190; K2611, K2691, K2692, K2716): the `bundle` screen's new acts (R24), a
   picture file's page rendered by pdf-pixels' picture renderer for the AI (R36), and an `ai` caller's author on the
   gated hook (R6). Each is checked at the plane's interface (the registry it carries, the transcriber's page rendering,
   the object's door, the Worker's gated hook) with a negative control (K874). The fixtures are made for this suite with
   Pillow 12.3.0: `t43-photo-o6.jpg`, a 3200×2400 baseline colour JPEG whose EXIF Orientation is 6, and `t43-page.png`,
   an 800×600 colour PNG. */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { storage } from "./fixture.mjs";
import { SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";

const fixture = (rel) => new Uint8Array(readFileSync(fileURLToPath(new URL(rel, import.meta.url))));
const SENTINEL = "sk-ant-SENTINEL-T43-0000";

/* ===== R24 ===== */

/* (T51; K3807) the registry is the design's (`wizard-scripts`' `SCREEN_REGISTRY`): the `document` screen carries what the
   old `bundle` screen did, and lists the acts itself. `reading` is no act of that screen in the registry. */

/* ===== R36: the picture route ===== */

/* The evidence bucket, in memory. */
function bucket() {
  const held = new Map();
  const object = (k, b) => ({ key: k, size: b.length, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) });
  return { held,
    async put(k, v) { held.set(k, v); return { key: k, size: v.length }; },
    async get(k) { return held.has(k) ? object(k, held.get(k)) : null; },
    async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async delete(k) { held.delete(k); },
    async list() { return { objects: [...held.keys()].map((key) => ({ key })), truncated: false }; } };
}
/* A plane over a fresh storage with a one-matter set passed, `ann` holding an API-key account, and `bytes` filed as an
   uploaded capture with its reading (one page, not read as text), as a promotion leaves it. */