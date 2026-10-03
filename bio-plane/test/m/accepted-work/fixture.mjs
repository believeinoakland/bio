/* accepted-work over the modules it uses, each the real one (record-core, membership, promotion), on a real SQLite
   database (node:sqlite) standing in for a Durable Object's storage, at the plane's shape (`sql.exec` answers a cursor).
   `case-import`'s registration (R1) is a stand-in the test controls: what another group's case holds, which editions
   this group has accepted, the open flags and the withdrawals. Every test drives `accepted-work` at its interface:
   its registration, its reads, its leg check, and an inquiry's promotion through `promotion`. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}

function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    db, sql, rows: (q, ...a) => [...sql.exec(q, ...a)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const IMPORT = "a".repeat(64);
export const OTHER_IMPORT = "b".repeat(64);
export const REF = importedFindingRef(IMPORT, "INQ-2026-0007-found");
export const REF2 = importedFindingRef(OTHER_IMPORT, "INQ-2026-0003-other");
export const ALICE = "member:alice";
export const NOW = "2026-10-03T01:00:00.000Z";

/** The bare world: a host with record-core, membership and promotion, and `accepted-work` made over them. */
export function world({ register = true } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => NOW });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const aw = acceptedWorkOf(host, { record, promotion });
  const source = importer();
  if (register) {
    const r = aw.registerAcceptedWork("case-import", source.fns);
    if (!r.ok) throw new Error(`fixture registration refused: ${JSON.stringify(r)}`);
  }
  let n = 0;
  const w = {
    st, host, record, membership, promotion, aw, source,
    count: () => st.rows(`SELECT COUNT(*) AS n FROM bundles`)[0].n,
    tables: () => st.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name),
    sha: (id) => record.head(id)?.bundleSha ?? null,
    /** A promotion of an inquiry document with these legs, over its head (or a creation). */
    promote(id, legs, extra = {}) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`, author: ALICE,
        files: [{ path: "bundle.md", text: inquiryMd(id, legs, extra.question) }], meta: { object_type: "inquiry" },
        ...(extra.pkg || {}) });
    },
  };
  return w;
}

/** A stand-in for `case-import`'s registration (its R16): `held` maps `ref\0edition` to the finding as published;
 *  `accepted` holds the `ref\0edition` pairs whose acceptance is in force; `calls` records each call. */
export function importer() {
  const s = {
    held: new Map(), accepted: new Set(), flags: [], withdrawn: [], calls: [], throws: null, hidden: new Set(),
    publish(ref, edition, extra = {}) {
      s.held.set(`${ref}\u0000${edition}`, { ref, import: ref.slice(9, 73), group: "other-group", case: "CASE-1", edition,
        finding: ref.slice(74), manifest_sha: "c".repeat(64), result: "recreated", pair: { evidence: "B", inference: "B" },
        ...extra });
    },
    accept(ref, edition) { s.accepted.add(`${ref}\u0000${edition}`); },
    withdraw(ref, edition) {
      s.accepted.delete(`${ref}\u0000${edition}`);
      s.withdrawn.push({ withdrawal: `W${s.withdrawn.length + 1}`, import: ref.slice(9, 73), edition, refs: [ref], at: NOW });
    },
    fns: {
      finding(args) {
        s.calls.push(["finding", args]);
        if (s.throws) throw new Error(s.throws);
        const { ref, edition, viewer } = args;
        if (s.hidden.has(viewer)) return null;
        const f = s.held.get(`${ref}\u0000${edition}`);
        if (!f) return null;
        return { ...f, acceptance: s.accepted.has(`${ref}\u0000${edition}`)
          ? { by: ALICE, at: NOW, reason: "We recreated it.", checked: ["evidence"], gaps: [] } : null };
      },
      openFlags(args) {
        s.calls.push(["openFlags", args]);
        if (s.throws) throw new Error(s.throws);
        return { flags: s.flags.filter((f) => f.ref === args.ref && f.edition === args.edition)
          .map(({ flag, finding, issue, at }) => ({ flag, finding, issue, at })), complete: true };
      },
      withdrawals(args) {
        s.calls.push(["withdrawals", args]);
        if (s.throws) throw new Error(s.throws);
        const after = typeof args.after === "string" ? s.withdrawn.findIndex((x) => x.withdrawal === args.after) + 1 : 0;
        const limit = Number.isInteger(args.limit) ? args.limit : 100;
        const page = s.withdrawn.slice(after, after + limit);
        return { withdrawals: page, cursor: after + limit < s.withdrawn.length ? page[page.length - 1].withdrawal : null };
      },
    },
  };
  return s;
}

/** A leg on an imported finding at an edition, as `inquiry-grammar` R11 spells it. */
export const onRef = (ref, edition, extra = {}) => ({ target: ref, target_edition: edition, role: "supports", ...extra });

/** An inquiry document whose basis is `legs` ({target, target_edition?, role?}); a ref is never in `references[]`. */
export function inquiryMd(id, legs = [], question = `Is ${id} answered?`) {
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    "current_state: open", "prior_state: null", `created: "2026-10-03T00:00:00Z"`,
    `last_updated: "2026-10-03T00:00:00Z"`, "group: test-group", "references: []", "state_history: []",
    "surfaced_by: human", 'disposition_reason: ""',
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`,
      ...(l.target_edition !== undefined ? [`    target_edition: ${l.target_edition}`] : [])])] : []),
    "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}
