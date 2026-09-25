/* anchordry.mjs — M0-197's TRIPWIRE, preloaded (`node --import`) into a control driver the reader asks for its
 * anchor table. The reader must never ARM anything: it counts. So before the driver's first line runs, every
 * builtin that writes, removes, makes a directory or spawns a process is replaced by one that prints
 * `ANCHOR-DRY-SIDE-EFFECT <name>` and exits 3. A driver whose `anchorTable()` call sits AFTER a side effect is
 * therefore stopped AT that side effect and named UNREADABLE by the reader — never allowed to arm, write a pen,
 * or run its suite. Reads stay open: a table is built from reads.
 *
 * ONE EXCEPTION, and it is the reader's own: a path inside `$TMPDIR` passes. The reader points `$TMPDIR` at a
 * throwaway directory of its own for each dry read and removes it after, so a driver that makes its temp pen and
 * copies pristine sources into it before building its table (`controlPen`, `mkdtempSync(tmpdir())`) is still read
 * — those writes land in a directory nobody else sees. A write ANYWHERE else, and every spawn, trips.
 *
 * `fs.writeSync` to fd 1 or 2, or to a descriptor opened inside the sandbox, passes; to any other fd it trips.
 * The ESM named bindings (`import { writeFileSync } from "node:fs"`) are updated by `syncBuiltinESMExports`.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SANDBOX = process.env.BIO_ANCHOR_SANDBOX ? resolve(process.env.BIO_ANCHOR_SANDBOX) : null;
const inside = (p) => {
  if (!SANDBOX || p === undefined || p === null) return false;
  const s = p instanceof URL ? fileURLToPath(p) : Buffer.isBuffer(p) ? p.toString() : String(p);
  const r = resolve(s);
  return r === SANDBOX || r.startsWith(SANDBOX + sep);
};
/* Which arguments are PATHS the call writes: the destination for a copy, both ends of a rename, else the first. */
const WRITES = { copyFileSync: [1], cpSync: [1], copyFile: [1], cp: [1], renameSync: [0, 1], rename: [0, 1],
  symlinkSync: [1], symlink: [1], linkSync: [1], link: [1] };

const trip = (name) => function tripped() {
  try { process.stderr.write(`ANCHOR-DRY-SIDE-EFFECT ${name}\n`); } catch { /* stderr gone */ }
  process.reallyExit ? process.reallyExit(3) : process.exit(3);
};
const FS = ["writeFileSync", "appendFileSync", "copyFileSync", "cpSync", "renameSync", "unlinkSync", "rmSync",
  "rmdirSync", "mkdirSync", "mkdtempSync", "truncateSync", "ftruncateSync", "symlinkSync", "linkSync", "chmodSync",
  "chownSync", "utimesSync", "createWriteStream", "writeFile", "appendFile", "copyFile", "cp", "rename", "unlink",
  "rm", "rmdir", "mkdir", "mkdtemp", "truncate", "symlink", "link", "chmod", "chown", "utimes", "write", "writev"];
const guard = (obj, k, name) => {
  const real = obj[k];
  if (typeof real !== "function") return;
  const at = WRITES[k] || [0];
  obj[k] = function (...a) {
    if (!["write", "writev", "ftruncateSync"].includes(k) && at.every((i) => inside(a[i]))) return real.apply(this, a);
    return trip(name)();
  };
};
for (const k of FS) guard(fs, k, `fs.${k}`);
/* A descriptor opened INSIDE the sandbox may be written (`writeFileSync` itself opens and writes through these). */
const boxed = new Set([1, 2]);
const writeSync = fs.writeSync;
fs.writeSync = function (fd, ...rest) { return boxed.has(fd) ? writeSync.call(fs, fd, ...rest) : trip("fs.writeSync")(); };
const openSync = fs.openSync;
fs.openSync = function (p, flags, ...rest) {
  if (flags === undefined || flags === "r" || flags === fs.constants.O_RDONLY) return openSync.call(fs, p, flags, ...rest);
  if (!inside(p)) return trip("fs.openSync(write)")();
  const fd = openSync.call(fs, p, flags, ...rest);
  boxed.add(fd);
  return fd;
};
const closeSync = fs.closeSync;
fs.closeSync = function (fd, ...rest) { if (fd > 2) boxed.delete(fd); return closeSync.call(fs, fd, ...rest); };
for (const k of ["writeFile", "appendFile", "copyFile", "cp", "rename", "unlink", "rm", "rmdir", "mkdir", "mkdtemp",
  "truncate", "symlink", "link", "chmod", "chown", "utimes"]) guard(fsp, k, `fs/promises.${k}`);
if (typeof fsp.open === "function") { const o = fsp.open; fsp.open = function (p, flags, ...r) { return !flags || flags === "r" || inside(p) ? o.call(this, p, flags, ...r) : trip("fs/promises.open(write)")(); }; }
for (const k of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"])
  if (typeof cp[k] === "function") cp[k] = trip(`child_process.${k}`);
syncBuiltinESMExports();
