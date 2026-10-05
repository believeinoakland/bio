// ../bio-plane/src/cpu.mjs
function makeMeter() {
  const seg = /* @__PURE__ */ Object.create(null);
  const bump = (label, bytes) => {
    const e = seg[label] || (seg[label] = { calls: 0, bytes: 0 });
    e.calls++;
    if (typeof bytes === "number" && Number.isFinite(bytes)) e.bytes += bytes;
  };
  return {
    /** Run a synchronous block, counting it. `bytes` is the size of what it
     *  worked on, when that is known and meaningful. */
    sync(label, fn, bytes) {
      bump(label, bytes);
      return fn();
    },
    /** Same, for an await that is compute rather than I/O: a crypto digest is
     *  async in the Workers API and is not a network wait. */
    async cpuAwait(label, fn, bytes) {
      bump(label, bytes);
      return await fn();
    },
    report() {
      const calls = Object.values(seg).reduce((a, e) => a + e.calls, 0);
      const bytes = Object.values(seg).reduce((a, e) => a + e.bytes, 0);
      const segments = Object.fromEntries(Object.entries(seg).map(([k, e]) => [k, { calls: e.calls, bytes: e.bytes }]));
      return {
        work_calls: calls,
        work_bytes: bytes,
        segments,
        measured_ms: null,
        note: "COUNTS, not times. Cloudflare freezes Date.now() during synchronous execution as a timing-attack defence, so a Worker cannot measure its own compute and any millisecond figure reported from inside one is meaningless. These are the quantities that DRIVE the cost and that would explain a kill afterwards. The ceiling is measured separately, in reference iterations, by op=cpuprobe."
      };
    }
  };
}

// src/contract.mjs
var ENGINE_NAME = "ironcalc";
var ENGINE_VERSION = "4deab8f6e6a858744f8966f67f70f4ed8d29c78d";
var WASM_BYTES = 1866957;
var WASM_SHA256 = "6cb03bcc9e5cf23e189b45fd88373b44576ec297b76db1675a430ee1254ced3d";
var ENGINE_SECTION = "bio-engine";
var ENGINE_EXPORTS = Object.freeze([
  "memory",
  "book_load",
  "book_evaluate",
  "inspect",
  "engine_commit",
  "__wbg_book_free"
]);
var MAX_UNZIPPED_BYTES = 9e6;
var MAX_CELLS = 25e4;
var TIME_BUDGET_MS = 12e4;
var SETTING = "SHEET_RECOMPUTE";
var enabledIn = (env) => (env && env[SETTING]) === "on";
var NAMESPACES = Object.freeze(["bio", "scratch"]);
var PLANE_OPS = Object.freeze({});
var NOT_RECOMPUTED = "not recomputed here";
var VOLATILE_FUNCTIONS = Object.freeze([
  "NOW",
  "TODAY",
  "RAND",
  "RANDBETWEEN",
  "OFFSET",
  "INDIRECT",
  "CELL",
  "INFO"
]);
var CAUSES = Object.freeze([
  "unsupported_function",
  "implicit_intersection",
  "circular",
  "not_implemented",
  "undetermined"
]);
var WORKBOOK_REFUSALS = Object.freeze([
  "ENGINE_ABSENT",
  "NOT_A_WORKBOOK",
  "OVER_BOUND",
  "EXTERNAL_LINKS",
  "ENGINE_FAILED",
  "TIME_LIMIT"
]);
var REFUSALS = Object.freeze({
  BAD_SHA: "capture_sha must be 64 hex characters",
  BAD_STORE: "store must be named: this member reads a capture from one namespace and guesses none",
  NAMESPACE_UNKNOWN: "no namespace by that name exists, so nothing was read; the two that exist are listed beside this message. This is not NOT_FOUND, which says the namespace exists and holds no such capture",
  R2_NOT_CONFIGURED: "this member holds no CAPTURES binding, so it cannot read the bytes",
  NOT_FOUND: "no capture with that sha in that store",
  NOT_ENABLED: "workbook recompute is not enabled on this instance; an administrator enables it after the release deploys this member",
  ENGINE_ABSENT: "the engine did not load as the pinned build, so no workbook is recomputed",
  NOT_A_WORKBOOK: "the bytes are not an OOXML spreadsheet",
  OVER_BOUND: "the workbook is larger than this member recomputes; nothing of it was recomputed",
  EXTERNAL_LINKS: "the workbook refers to other workbooks, whose values are not here",
  ENGINE_FAILED: "the engine refused or failed on this workbook",
  TIME_LIMIT: "loading the workbook took longer than the time budget, so evaluation was not started",
  UNKNOWN: "POST /recompute or GET /version only"
});

// src/member.mjs
var json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
var nextTurn = () => new Promise((resolve) => setTimeout(resolve, 0));
var refusal = (reason, why, extra = {}) => ({ ok: false, reason, not_recomputed: NOT_RECOMPUTED, why, detail: REFUSALS[reason], ...extra });
var engineMessage = (e) => String(e && e.message || e);
function makeMember(engine, {
  bounds = { maxUnzippedBytes: MAX_UNZIPPED_BYTES, maxCells: MAX_CELLS, timeBudgetMs: TIME_BUDGET_MS },
  now = () => Date.now(),
  turn = nextTurn
} = {}) {
  async function recompute(bytes) {
    const meter = makeMeter();
    const absent = engine.open();
    try {
      if (absent) return refusal("ENGINE_ABSENT", absent);
      const seen = meter.sync("inspect", () => engine.inspect(bytes, bounds), bytes.length);
      if (!seen.zip || !seen.workbook) return refusal("NOT_A_WORKBOOK", seen.why);
      if (seen.over_unzipped)
        return refusal(
          "OVER_BOUND",
          `the workbook unzips to more than ${bounds.maxUnzippedBytes} B, this member's bound; reading stopped at ${seen.unzipped_bytes} B`,
          { measure: "unzipped_bytes", measured: seen.unzipped_bytes, measured_is: "at_least", bound: bounds.maxUnzippedBytes }
        );
      if (seen.over_cells)
        return refusal(
          "OVER_BOUND",
          `the workbook holds ${seen.cells} cells; this member's bound is ${bounds.maxCells}`,
          { measure: "cells", measured: seen.cells, measured_is: "exact", bound: bounds.maxCells }
        );
      const ext = seen.external;
      const links = ext.parts + ext.formulas + ext.defined_names;
      if (links > 0)
        return refusal("EXTERNAL_LINKS", `the workbook refers to other workbooks: ${ext.parts} external-link part(s), ${ext.formulas} formula(s) and ${ext.defined_names} defined name(s)`, { links, external: ext });
      const t0 = now();
      try {
        meter.sync("load", () => engine.load(bytes), bytes.length);
      } catch (e) {
        return refusal(
          "ENGINE_FAILED",
          `the engine refused the workbook while loading it`,
          { stage: "load", engine_error: engineMessage(e) }
        );
      }
      await turn();
      const elapsed = now() - t0;
      if (elapsed > bounds.timeBudgetMs)
        return refusal(
          "TIME_LIMIT",
          `loading took ${elapsed} ms; the budget is ${bounds.timeBudgetMs} ms`,
          { elapsed_ms: elapsed, budget_ms: bounds.timeBudgetMs }
        );
      let out;
      try {
        out = meter.sync("evaluate", () => engine.evaluate());
      } catch (e) {
        return refusal(
          "ENGINE_FAILED",
          `the engine failed while evaluating the workbook`,
          { stage: "evaluate", engine_error: engineMessage(e) }
        );
      }
      return answer(out, seen, { ...meter.report(), wasm_memory_bytes: engine.memoryBytes() });
    } finally {
      engine.close();
    }
  }
  function answer(out, seen, work) {
    const cells = out.cells.map((c) => {
      const ref = `${c.sheet}!${c.cell}`;
      const entry = {
        source: { kind: "sheet-cell", ref, sheet: c.sheet, cell: c.cell },
        formula: c.formula,
        value: c.value,
        type: c.type
      };
      if (c.type === "error") {
        entry.error = c.error;
        entry.cause = c.cause;
        if (c.function) entry.function = c.function;
        if (c.via) entry.via = c.via;
        if (c.message) entry.engine_message = c.message;
        entry.not_recomputed = NOT_RECOMPUTED;
      }
      entry.volatile = c.volatile;
      return entry;
    });
    const notes = [];
    if (seen.macros)
      notes.push("the workbook carries a VBA project; macros are never run, so it was recomputed by its formulas alone");
    if (out.counts.errors)
      notes.push(`${out.counts.errors} formula cell(s) gave an error value and are marked "${NOT_RECOMPUTED}" with a cause; an error here is not a disagreement with the file`);
    if (out.counts.volatile)
      notes.push(`${out.counts.volatile} formula cell(s) call a volatile function, whose value now is not the value the file cached`);
    if (out.spill_cells)
      notes.push(`${out.spill_cells} cell(s) hold an array formula's spilled values and are not listed; the formula is listed at its anchor`);
    return {
      ok: true,
      engine: engine.name,
      engine_version: engine.version,
      wasm_sha256: engine.wasm.sha256,
      macros_present: seen.macros,
      counts: out.counts,
      notes,
      cells,
      work
    };
  }
  async function handleRecompute(req, env) {
    const body = await req.json().catch(() => null);
    const sha = typeof body?.capture_sha === "string" ? body.capture_sha.toLowerCase() : "";
    if (!/^[0-9a-f]{64}$/.test(sha)) return json({ ok: false, reason: "BAD_SHA", detail: REFUSALS.BAD_SHA }, 400);
    if (typeof body.store !== "string") return json({ ok: false, reason: "BAD_STORE", detail: REFUSALS.BAD_STORE }, 400);
    const store = body.store;
    if (!NAMESPACES.includes(store))
      return json({
        ok: false,
        reason: "NAMESPACE_UNKNOWN",
        detail: REFUSALS.NAMESPACE_UNKNOWN,
        asked: store.slice(0, 80),
        namespaces: [...NAMESPACES]
      }, 400);
    if (!enabledIn(env))
      return json({ ok: false, reason: "NOT_ENABLED", not_recomputed: NOT_RECOMPUTED, detail: REFUSALS.NOT_ENABLED });
    if (typeof env?.CAPTURES?.get !== "function")
      return json({ ok: false, reason: "R2_NOT_CONFIGURED", detail: REFUSALS.R2_NOT_CONFIGURED }, 503);
    const obj = await env.CAPTURES.get(`${store}/captures/${sha}`);
    if (!obj) return json({ ok: false, reason: "NOT_FOUND", detail: REFUSALS.NOT_FOUND, capture_sha: sha, store }, 404);
    const bytes = new Uint8Array(await obj.arrayBuffer());
    return json(await recompute(bytes));
  }
  function handleVersion(env) {
    const why = engine.check();
    return json({
      ok: true,
      name: "sheet-worker",
      version: env?.VERSION ?? null,
      engine: engine.name,
      engine_version: engine.version,
      wasm_bytes: engine.wasm.bytes,
      wasm_sha256: engine.wasm.sha256,
      engine_loaded: why == null,
      ...why ? { engine_unavailable: why } : {},
      enabled: enabledIn(env),
      bounds: { max_unzipped_bytes: bounds.maxUnzippedBytes, max_cells: bounds.maxCells, time_budget_ms: bounds.timeBudgetMs }
    });
  }
  async function fetch2(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === "GET" && path === "/version") return handleVersion(env);
    if (req.method === "POST" && path === "/recompute") return handleRecompute(req, env);
    return json({ ok: false, reason: "UNKNOWN", detail: REFUSALS.UNKNOWN }, 404);
  }
  return { fetch: fetch2, recompute };
}

// src/engine.mjs
import wasmModule2 from "../assets/sheet-engine.wasm";

// src/enginelib-tz.mjs
var _fmtCache = /* @__PURE__ */ new Map();
function getFormatter(tz) {
  let f = _fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    _fmtCache.set(tz, f);
  }
  return f;
}
function ic_tz_validate(name) {
  try {
    getFormatter(name);
    return true;
  } catch (_) {
    return false;
  }
}
function ic_tz_all() {
  try {
    const list = Intl.supportedValuesOf("timeZone");
    const zones = new Set(list);
    const extras = ["UTC", "GMT"];
    for (const tz of extras) {
      zones.add(tz);
    }
    return Array.from(zones);
  } catch (e) {
    console.log(e);
    return [];
  }
}
function ic_tz_parts(ms, tz) {
  const p = {};
  for (const x of getFormatter(tz).formatToParts(new Date(ms))) p[x.type] = x.value | 0;
  return [p.year, p.month, p.day, p.hour, p.minute, p.second];
}

// src/enginelib.mjs
var Book = class _Book {
  static __wrap(ptr) {
    const obj = Object.create(_Book.prototype);
    obj.__wbg_ptr = ptr;
    BookFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BookFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_book_free(ptr, 0);
  }
  /**
   * Evaluate every formula and answer each formula cell (R4-R6) as JSON.
   * @returns {string}
   */
  evaluate() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.book_evaluate(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export3(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * IronCalc's own xlsx import. Locale "en", timezone "UTC" and language "en" are fixed: the answer names no
   * place (R16), and a workbook stores its numbers and formulas independently of the locale that wrote it.
   * @param {Uint8Array} bytes
   * @returns {Book}
   */
  static load(bytes) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
      const len0 = WASM_VECTOR_LEN;
      wasm.book_load(retptr, ptr0, len0);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return _Book.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
};
if (Symbol.dispose) Book.prototype[Symbol.dispose] = Book.prototype.free;
function engine_commit() {
  let deferred1_0;
  let deferred1_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.engine_commit(retptr);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    deferred1_0 = r0;
    deferred1_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_export3(deferred1_0, deferred1_1, 1);
  }
}
function inspect(bytes, max_unzipped, max_cells) {
  let deferred2_0;
  let deferred2_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
    const len0 = WASM_VECTOR_LEN;
    wasm.inspect(retptr, ptr0, len0, max_unzipped, max_cells);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    deferred2_0 = r0;
    deferred2_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_export3(deferred2_0, deferred2_1, 1);
  }
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    },
    __wbg___wbindgen_number_get_394265ed1e1b84ee: function(arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof obj === "number" ? obj : void 0;
      getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_get_507a50627bffa49b: function(arg0, arg1) {
      const ret = getObject(arg0)[arg1 >>> 0];
      return addHeapObject(ret);
    },
    __wbg_get_unchecked_6e0ad6d2a41b06f6: function(arg0, arg1) {
      const ret = getObject(arg0)[arg1 >>> 0];
      return addHeapObject(ret);
    },
    __wbg_ic_tz_all_226d418cbbbea3ce: function() {
      const ret = ic_tz_all();
      return addHeapObject(ret);
    },
    __wbg_ic_tz_parts_2b239fa8002bfad9: function(arg0, arg1, arg2) {
      const ret = ic_tz_parts(arg0, getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    },
    __wbg_ic_tz_validate_79634f1397393595: function(arg0, arg1) {
      const ret = ic_tz_validate(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_length_370319915dc99107: function(arg0) {
      const ret = getObject(arg0).length;
      return ret;
    },
    __wbg_now_86c0d4ba3fa605b8: function() {
      const ret = Date.now();
      return ret;
    },
    __wbg_random_039a7d5d06e0d333: function() {
      const ret = Math.random();
      return ret;
    },
    __wbindgen_object_drop_ref: function(arg0) {
      takeObject(arg0);
    }
  };
  return {
    __proto__: null,
    "./sheet_engine_bg.js": import0
  };
}
var BookFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_book_free(ptr, 1));
function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
function dropObject(idx) {
  if (idx < 1028) return;
  heap[idx] = heap_next;
  heap_next = idx;
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function getObject(idx) {
  return heap[idx];
}
var heap = new Array(1024).fill(void 0);
heap.push(void 0, null, true, false);
var heap_next = heap.length;
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  return wasm;
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
function resetEngine() {
  wasm = void 0;
  wasmInstance = void 0;
  wasmModule = void 0;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  heap = new Array(1024).fill(void 0);
  heap.push(void 0, null, true, false);
  heap_next = heap.length;
}

// src/enginecore.mjs
var lebLength = (n) => {
  let k = 0;
  do {
    n >>>= 7;
    k++;
  } while (n);
  return k;
};
function moduleCheck(mod) {
  if (!(typeof WebAssembly === "object" && mod instanceof WebAssembly.Module))
    return "the engine did not arrive as a compiled WebAssembly.Module; this member must be installed with its `assets/sheet-engine.wasm` part";
  const exported = new Set(WebAssembly.Module.exports(mod).map((e) => e.name));
  const missing = ENGINE_EXPORTS.filter((n) => !exported.has(n));
  if (missing.length) return `the wasm module lacks the engine's exports (${missing.join(", ")}), so it is not this engine`;
  const sections = WebAssembly.Module.customSections(mod, ENGINE_SECTION);
  if (sections.length !== 1) return `the wasm module carries ${sections.length} \`${ENGINE_SECTION}\` sections, not one`;
  let facts;
  try {
    facts = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(sections[0]));
  } catch {
    return `the wasm module's \`${ENGINE_SECTION}\` section does not parse`;
  }
  if (!facts || facts.engine !== ENGINE_NAME || facts.commit !== ENGINE_VERSION)
    return `the wasm module names ${facts && facts.engine} at ${facts && facts.commit}; the pinned build is ${ENGINE_NAME} at ${ENGINE_VERSION}`;
  const nameBytes = new TextEncoder().encode(ENGINE_SECTION).length;
  const body = lebLength(nameBytes) + nameBytes + sections[0].byteLength;
  const length = facts.code_bytes + 1 + lebLength(body) + body;
  if (!Number.isInteger(facts.code_bytes) || length !== WASM_BYTES)
    return `the wasm module is ${length} B; the pinned build is ${WASM_BYTES} B`;
  return null;
}
function makeEngine(mod) {
  let opened = false;
  let book = null;
  let exports = null;
  function open() {
    close();
    const why = moduleCheck(mod);
    if (why) return why;
    try {
      resetEngine();
      exports = initSync({ module: mod });
      const commit = engine_commit();
      if (commit !== ENGINE_VERSION) return `the engine reports commit ${commit}; the pinned build is ${ENGINE_VERSION}`;
    } catch (e) {
      return `the engine module did not instantiate: ${String(e && e.message || e)}`;
    }
    opened = true;
    return null;
  }
  function need() {
    if (!opened) throw new Error("the engine is not open");
  }
  return {
    name: ENGINE_NAME,
    version: ENGINE_VERSION,
    wasm: { bytes: WASM_BYTES, sha256: WASM_SHA256 },
    /** Null when the module is the pinned build and instantiates, else why not. Leaves no instance behind. */
    check() {
      const why = open();
      close();
      return why;
    },
    open,
    /** R3 checks 2-4: the container read without the engine loading it. */
    inspect(bytes, { maxUnzippedBytes, maxCells }) {
      need();
      return JSON.parse(inspect(bytes, maxUnzippedBytes, maxCells));
    },
    /** IronCalc's own xlsx import. Throws the engine's error. */
    load(bytes) {
      need();
      book = Book.load(bytes);
    },
    /** Evaluate the loaded workbook and answer every formula cell. Throws the engine's error. */
    evaluate() {
      need();
      if (!book) throw new Error("no workbook is loaded");
      return JSON.parse(book.evaluate());
    },
    /** The instance's linear memory now, in bytes: what the workbook has cost it so far. */
    memoryBytes() {
      return exports && exports.memory ? exports.memory.buffer.byteLength : null;
    },
    close
  };
  function close() {
    opened = false;
    if (book) {
      try {
        book.free();
      } catch {
      }
    }
    book = null;
    exports = null;
    resetEngine();
  }
}

// src/engine.mjs
var SHEET_ENGINE = makeEngine(wasmModule2);

// src/index.mjs
var SURFACE = {
  recompute: { method: "POST", mutating: false },
  version: { method: "GET", mutating: false }
};
var member = makeMember(SHEET_ENGINE);
var index_default = {
  fetch: (req, env) => member.fetch(req, env)
};
export {
  SURFACE,
  index_default as default
};
