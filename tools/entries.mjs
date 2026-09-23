#!/usr/bin/env node
/* THE ONE READER OF THE MEASUREMENT AND INTERFACE-CHANGE LEDGERS (M0-100, 2026-09-23).
 *
 * WHY. Under M0-111's train two `land/*` branches that each APPEND an entry to the tail of `MEASUREMENTS.md` or
 * `INTERFACE-CHANGES.md` collide inside the integrator's merge: both edit the same last lines, so git cannot order them
 * and the train returns one branch by name (`ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 3, narrowed
 * by BOB #27 to these two files; `TREE-SHARING.md` §1). So from this landing:
 *
 *   - A NEW entry is its OWN FILE: `docs/development/measurements/M-<n>.md`, `docs/development/interface-changes/IC-<n>.md`,
 *     the id minted with `node tools/mintid.mjs M|IC`. Its first line is the entry's heading in the ledger's own grammar
 *     (`## M-<n> · <date> · <title>`, `## IC-<n> · <interface>: <change> · <STATE>`), so every reader that already knew the
 *     heading reads the file unchanged.
 *   - A later STATE of an entry (an IC's RESPONSES, RESOLUTION, CHANGED …) is appended to THAT entry's file. For an entry
 *     in a frozen file, the file `<id>.md` is created holding only the continuation — it opens with a `### <id> · …`
 *     heading and carries no `## <id> ·` allocation heading — and this reader joins it after the frozen text.
 *   - The two old files are FROZEN HISTORY: a line at their head says where new entries go, and `audit()` fails a new
 *     allocation in either (run by `plancheck` §2e and `bio-plane/test/entries.test.mjs`).
 *
 * WHY ONE FILE PER ID, NAMED BY THE ID. The id is the one key minted atomically (`mintid`), so two branches with
 * distinct ids never touch the same path and merge with no conflict; two branches that both bypassed the allocator and
 * took one id create the SAME path, and git refuses that add/add loudly instead of interleaving two entries. A date or
 * lane prefix would not be unique; a directory per lane would split one namespace's order across places.
 *
 * WHAT THIS YIELDS. `entries(kind)` — every entry, frozen and new, IN ID ORDER, each with the file and line of every
 * part; `view(kind)` — the generated single-file view (the frozen text, then each file in id order); `corpus(kind)` —
 * the paths a corpus-reading tool names (the frozen file and the directory, trailing slash); `kindOf(rel)` — which
 * ledger a repo path belongs to, so a walker that treats the frozen file specially treats the new files the same.
 *
 * WHAT IT CANNOT SEE, stated: a frozen-file section with no `## <NS>-<n> ·` heading (the prose sections of
 * `MEASUREMENTS.md`, and the one legacy date-first `## 2026-08-08 · M-4 —` heading) is not an entry here — `unnumbered`
 * counts those sections rather than dropping them silently; and `audit()` catches a new ALLOCATION in a frozen file,
 * not a state line appended there without a heading of its own. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const KINDS = {
  M: { ns: "M", what: "measurement", frozen: "docs/development/MEASUREMENTS.md", dir: "docs/development/measurements" },
  IC: { ns: "IC", what: "interface change", frozen: "docs/development/INTERFACE-CHANGES.md", dir: "docs/development/interface-changes" },
};

/* THE FREEZE, read off the files at `30475ca6` (2026-09-23) and never edited to fit a later tree: the highest id each
   frozen file allocates and how many `## <NS>-<n> ·` sites it carries (IC-30 twice: `mintid` KNOWN_COLLISIONS).
   ADMITTED names the entries a branch cut BEFORE the freeze appends to a frozen file, each by id and branch, so that
   branch lands in a train beside this one instead of reddening it; nothing else may be admitted. */
export const FROZEN = {
  M: { max: 107, sites: 87 },
  IC: { max: 178, sites: 157 },
};
export const ADMITTED = [
  { id: "M-108", why: "D-442's branch `worktree-agent-af1478b0c650efa08` (cut before the freeze) appends it to MEASUREMENTS.md" },
  { id: "IC-179", why: "D-442's branch `worktree-agent-af1478b0c650efa08` (cut before the freeze) appends it to INTERFACE-CHANGES.md" },
];

/* The head line each frozen file carries, verbatim; `audit()` requires it, so a merge that drops it fails by name. */
export const frozenMark = (kind) =>
  `**FROZEN HISTORY since 2026-09-23 (M0-100): add nothing here.** A new ${KINDS[kind].what} entry is its own file, `
  + `\`${KINDS[kind].dir}/<id>.md\` (the id from \`node tools/mintid.mjs ${KINDS[kind].ns}\`); a later state of an entry `
  + `is appended to that entry's file. \`node tools/entries.mjs\` reads both in id order.`;

const alloc = (ns) => new RegExp(`^##\\s+${ns}-(\\d+)\\s+·`, "gm");
const FILE_RE = (ns) => new RegExp(`^${ns}-(\\d+)\\.md$`);

const readRel = (repo, rel) => { try { return readFileSync(join(repo, rel), "utf8"); } catch { return null; } };

/** Which ledger a repo-relative path belongs to: `{ kind, part: "frozen" | "entry" }`, or null. */
export function kindOf(rel) {
  for (const [kind, k] of Object.entries(KINDS)) {
    if (rel === k.frozen) return { kind, part: "frozen" };
    if (rel.startsWith(`${k.dir}/`) && !rel.slice(k.dir.length + 1).includes("/")) return { kind, part: "entry" };
  }
  return null;
}

/** The paths a corpus-reading tool names for this ledger: the frozen file and the entry directory (trailing slash). */
export const corpus = (kind) => [KINDS[kind].frozen, `${KINDS[kind].dir}/`];

/** The entry directory's file names, sorted by id then name (an absent directory is an empty one). */
export function entryFiles(kind, { repo = REPO_ROOT } = {}) {
  const k = KINDS[kind];
  let names = [];
  try { names = readdirSync(join(repo, k.dir)); } catch { names = []; }
  const num = (n) => { const m = FILE_RE(k.ns).exec(n); return m ? Number(m[1]) : Infinity; };
  return names.filter((n) => n.endsWith(".md")).sort((a, b) => num(a) - num(b) || (a < b ? -1 : 1)).map((n) => `${k.dir}/${n}`);
}

/* The frozen file cut into its allocated entries: each runs from its `## <NS>-<n> ·` heading to the next `## ` line. */
function frozenEntries(kind, text) {
  const k = KINDS[kind];
  const lines = text.split("\n");
  const out = [];
  let unnumbered = 0, cur = null;
  const head = new RegExp(`^##\\s+${k.ns}-(\\d+)\\s+·`);
  lines.forEach((l, i) => {
    if (!/^## /.test(l)) { if (cur) cur.lines.push(l); return; }
    const m = head.exec(l);
    if (cur) out.push(cur);
    cur = null;
    if (m) cur = { id: `${k.ns}-${m[1]}`, n: Number(m[1]), line: i + 1, lines: [l] };
    else unnumbered++;
  });
  if (cur) out.push(cur);
  return { list: out.map((e) => ({ id: e.id, n: e.n, file: k.frozen, line: e.line, text: e.lines.join("\n") })), unnumbered };
}

/** Every entry of `kind`, frozen and new, in id order. Each: { id, n, source: "frozen"|"file"|"frozen+file", parts:
    [{ file, line }], text }. A frozen entry with a continuation file is ONE entry, its text joined. `unnumbered` and
    `unreadable` are returned beside the list so a caller can name what it did not read. */
export function read(kind, { repo = REPO_ROOT } = {}) {
  const k = KINDS[kind];
  if (!k) throw new Error(`unknown ledger kind ${kind} (M or IC)`);
  const ft = readRel(repo, k.frozen);
  const unreadable = ft === null ? [k.frozen] : [];
  const fz = ft === null ? { list: [], unnumbered: 0 } : frozenEntries(kind, ft);
  const byId = new Map();
  const out = [];
  for (const e of fz.list) {
    const rec = { id: e.id, n: e.n, source: "frozen", parts: [{ file: e.file, line: e.line }], text: e.text };
    out.push(rec);
    if (!byId.has(e.id)) byId.set(e.id, rec);
  }
  for (const f of entryFiles(kind, { repo })) {
    const t = readRel(repo, f);
    if (t === null) { unreadable.push(f); continue; }
    const m = FILE_RE(k.ns).exec(f.slice(k.dir.length + 1));
    const id = m ? `${k.ns}-${m[1]}` : null;
    const prior = id && byId.get(id);
    const own = new RegExp(`^##\\s+${k.ns}-${m ? m[1] : "x"}\\s+·`, "m").test(t);
    if (prior && !own) { prior.source = "frozen+file"; prior.parts.push({ file: f, line: 1 }); prior.text += `\n${t}`; continue; }
    out.push({ id: id ?? f, n: m ? Number(m[1]) : Infinity, source: "file", parts: [{ file: f, line: 1 }], text: t });
  }
  /* A stable sort: equal ids (IC-30, registered) keep the frozen file's order, and a frozen entry precedes a file. */
  out.sort((a, b) => a.n - b.n);
  return { entries: out, unnumbered: fz.unnumbered, unreadable };
}

export const entries = (kind, opts) => read(kind, opts).entries;

/** One entry by id (`M-104`, `IC-178`), joined across its parts; [] when absent (more than one: a collision). */
export function find(id, { repo = REPO_ROOT } = {}) {
  const m = /^(M|IC)-(\d+)$/.exec(id);
  if (!m) return [];
  return entries(m[1], { repo }).filter((e) => e.id === id);
}

/** The generated single-file view: the frozen text verbatim, then each entry file in id order. Never committed. */
export function view(kind, { repo = REPO_ROOT } = {}) {
  const k = KINDS[kind];
  const parts = [readRel(repo, k.frozen) ?? ""];
  for (const f of entryFiles(kind, { repo })) parts.push(`<!-- ${f} -->\n${readRel(repo, f) ?? ""}`);
  return parts.join("\n");
}

/** THE FREEZE AND THE LAYOUT, CHECKED. Returns { ok, fails[], notes[] }; `plancheck` §2e and the suite read this. */
export function audit({ repo = REPO_ROOT, frozen = FROZEN, admit = ADMITTED } = {}) {
  const fails = [], notes = [];
  const admitted = new Set(admit.map((a) => a.id));
  for (const [kind, k] of Object.entries(KINDS)) {
    const t = readRel(repo, k.frozen);
    if (t === null) { fails.push(`${k.frozen}: the frozen ${k.what} ledger is missing — it is history and stays`); continue; }
    if (!t.includes(frozenMark(kind)))
      fails.push(`${k.frozen}: its head line saying it is frozen is missing or altered — restore \`frozenMark("${kind}")\` from tools/entries.mjs`);
    const sites = [...t.matchAll(alloc(k.ns))].map((m) => Number(m[1]));
    const late = sites.filter((n) => n > frozen[kind].max && !admitted.has(`${k.ns}-${n}`));
    const admittedHere = sites.filter((n) => admitted.has(`${k.ns}-${n}`)).length;
    if (late.length)
      fails.push(`${k.frozen}: NEW ENTRY IN A FROZEN FILE — ${late.map((n) => `${k.ns}-${n}`).join(", ")}. Move each to its own file `
        + `with \`node tools/entries.mjs carry\` (or by hand: ${k.dir}/<id>.md, the entry verbatim from its heading).`);
    else if (sites.length !== frozen[kind].sites + admittedHere)
      fails.push(`${k.frozen}: its allocation sites moved — ${sites.length}, the freeze recorded ${frozen[kind].sites}`
        + `${admittedHere ? ` plus ${admittedHere} admitted` : ""}. An entry was added under an id at or below ${k.ns}-${frozen[kind].max}, or one was removed.`);
    const frozenIds = new Set(sites.map((n) => `${k.ns}-${n}`));
    let files = 0;
    let names = [];
    try { names = readdirSync(join(repo, k.dir)); } catch { names = []; }
    for (const name of names.sort()) {
      const rel = `${k.dir}/${name}`;
      const m = FILE_RE(k.ns).exec(name);
      if (!m) { fails.push(`${rel}: not an entry file — the directory holds only \`${k.ns}-<n>.md\`, one per entry`); continue; }
      files++;
      const id = `${k.ns}-${m[1]}`;
      const body = readRel(repo, rel) ?? "";
      const heads = [...body.matchAll(alloc(k.ns))].map((x) => `${k.ns}-${x[1]}`);
      const first = body.split("\n")[0];
      if (frozenIds.has(id)) {
        /* A continuation of a frozen entry: a state heading naming the id, and no allocation of any id. */
        if (heads.length)
          fails.push(`${rel}: ${id} is allocated in ${k.frozen}, so this file continues it and must not allocate (found ${heads.join(", ")}) — two allocations of one id is a collision`);
        else if (!new RegExp(`^###\\s+${id}\\b`).test(first))
          fails.push(`${rel}: a continuation of the frozen entry ${id} opens with its own \`### ${id} · <state>\` heading; it opens "${first.slice(0, 60)}"`);
        continue;
      }
      if (!new RegExp(`^##\\s+${id}\\s+·`).test(first))
        fails.push(`${rel}: an entry file opens with its own heading \`## ${id} · …\`; it opens "${first.slice(0, 60)}"`);
      const foreign = heads.filter((h) => h !== id);
      if (foreign.length)
        fails.push(`${rel}: holds another entry's heading (${[...new Set(foreign)].join(", ")}) — each entry is WHOLE IN ITS OWN FILE; a merge that interleaved two entries put this here`);
      if (heads.filter((h) => h === id).length > 1)
        fails.push(`${rel}: allocates ${id} ${heads.filter((h) => h === id).length} times — once, on its first line`);
    }
    notes.push(`${kind}: ${sites.length} frozen site(s) (max ${k.ns}-${Math.max(0, ...sites)}), ${files} entry file(s) in ${k.dir}/`);
  }
  return { ok: fails.length === 0, fails, notes };
}

/** Move every entry allocated in a frozen file past the freeze (and not admitted) into its own file, verbatim, and cut
    it from the frozen file. What a branch cut before the freeze needs after rebasing. Refuses when a target exists. */
export function carry({ repo = REPO_ROOT, dryRun = false, write = null, frozen = FROZEN, admit = ADMITTED } = {}) {
  const { writeFileSync, mkdirSync } = write ?? { writeFileSync: null, mkdirSync: null };
  const admitted = new Set(admit.map((a) => a.id));
  const moved = [];
  for (const [kind, k] of Object.entries(KINDS)) {
    const t = readRel(repo, k.frozen);
    if (t === null) continue;
    const lines = t.split("\n");
    const head = new RegExp(`^##\\s+${k.ns}-(\\d+)\\s+·`);
    const cut = [];
    for (let i = 0; i < lines.length; i++) {
      const m = head.exec(lines[i]);
      if (!m || Number(m[1]) <= frozen[kind].max || admitted.has(`${k.ns}-${m[1]}`)) continue;
      let j = i + 1;
      while (j < lines.length && !/^## /.test(lines[j])) j++;
      cut.push({ id: `${k.ns}-${m[1]}`, from: i, to: j });
    }
    if (!cut.length) continue;
    for (const c of cut) if (existsSync(join(repo, k.dir, `${c.id}.md`)))
      throw new Error(`carry REFUSED: ${k.dir}/${c.id}.md exists — ${c.id} would be allocated twice; renumber one with mintid first`);
    const keep = lines.filter((_, i) => !cut.some((c) => i >= c.from && i < c.to));
    for (const c of cut) {
      let body = lines.slice(c.from, c.to);
      while (body.length && body[body.length - 1] === "") body.pop();
      moved.push({ kind, id: c.id, file: `${k.dir}/${c.id}.md`, lines: body.length });
      if (!dryRun) { mkdirSync(join(repo, k.dir), { recursive: true }); writeFileSync(join(repo, k.dir, `${c.id}.md`), body.join("\n") + "\n"); }
    }
    let kept = keep.join("\n");
    if (!kept.endsWith("\n")) kept += "\n";
    kept = kept.replace(/\n{3,}$/, "\n");
    if (!dryRun) writeFileSync(join(repo, k.frozen), kept);
  }
  return moved;
}

/* ------------------------------------------------------------------------------------------ the CLI */
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === "list" && KINDS[arg]) {
    const r = read(arg);
    for (const e of r.entries) console.log(`${e.id} · ${e.source} · ${e.parts.map((p) => `${p.file}:${p.line}`).join(" + ")}`);
    console.log(`${r.entries.length} ${KINDS[arg].what} entr${r.entries.length === 1 ? "y" : "ies"} · ${r.unnumbered} unnumbered section(s) in ${KINDS[arg].frozen}`
      + (r.unreadable.length ? ` · UNREADABLE ${r.unreadable.join(", ")}` : ""));
  } else if (cmd === "show" && arg) {
    const f = find(arg);
    if (!f.length) { console.log(`${arg}: not found in ${Object.values(KINDS).map((k) => `${k.frozen} or ${k.dir}/`).join(", ")}`); process.exit(1); }
    for (const e of f) console.log(`${e.id} · ${e.parts.map((p) => `${p.file}:${p.line}`).join(" + ")}\n\n${e.text}\n`);
  } else if (cmd === "view" && KINDS[arg]) {
    process.stdout.write(view(arg));
  } else if (cmd === "check") {
    const a = audit();
    for (const n of a.notes) console.log(n);
    for (const f of a.fails) console.log(`FAIL ${f}`);
    console.log(a.ok ? "entries: OK" : `entries: ${a.fails.length} failure(s)`);
    process.exit(a.ok ? 0 : 1);
  } else if (cmd === "carry") {
    const fs = await import("node:fs");
    const dry = arg === "--dry-run";
    const moved = carry({ dryRun: dry, write: fs });
    for (const m of moved) console.log(`${dry ? "would move" : "moved"} ${m.id} (${m.lines} lines) -> ${m.file}`);
    console.log(moved.length ? `${moved.length} entr${moved.length === 1 ? "y" : "ies"} ${dry ? "would move" : "moved"} out of the frozen files` : "nothing to carry — no entry past the freeze in a frozen file");
  } else {
    console.error("usage: node tools/entries.mjs list M|IC · show <M-n|IC-n> · view M|IC · check · carry [--dry-run]");
    process.exit(2);
  }
}
