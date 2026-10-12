/* The fake plane's answers, each in its owner's documented shape (membership R6–R24, R98–R107; credentials R8–R10,
   R22–R60; ai-use R2–R12; instance-setup R53–R81; hypotheses R11–R13; wizard-scripts R27; control-plane R18, R65),
   wrapped as the door wraps them (`answer-envelope` R1: `{ok: true, result}`), except `bootstrap` and
   `subscriptionsignin`, answered at the top level as the door relays them. */

export const env = (result) => ({ ok: true, result, store: "bio", tokenClass: "member" });
export const refuse = (code, extra = {}) => env({ ok: false, reason: code, code, translation: `translated ${code}`, ...extra });

export const VOCAB = ["contribute", "publish", "create_projects"];
export const ADMIN = Object.freeze({ member: "rosa", handle: "rosa", administer: true, capabilities: VOCAB, vocabulary: VOCAB, tokenClass: "session" });
export const MEMBER = Object.freeze({ member: "dev", handle: "dev", administer: false, capabilities: ["contribute"], vocabulary: VOCAB, tokenClass: "session" });
export const READER = Object.freeze({ member: "teo", handle: "teo", administer: false, capabilities: [], vocabulary: VOCAB, tokenClass: "session" });

const exp = (label, confirmed) => ({ label, state: confirmed ? "confirmed" : "declared", confirmed, by: confirmed ? "rosa" : null, at: "2026-10-05T10:00:00Z", history: [] });

export const ROSTER = [
  { member_id: "rosa", handle: "rosa", role: "admin", status: "active", capabilities: VOCAB, cover: "R. Medina", expertise: [], invitation: "spent", created: "2026-10-01T00:00:00Z" },
  { member_id: "dev", handle: "dev", role: "member", status: "active", capabilities: ["contribute"], cover: "Dev from 60th", expertise: [], invitation: "spent" },
  { member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana the CPA", expertise: [exp("CPA", false)], invitation: "spent" },
  { member_id: "lu", handle: "lu", role: "admin", status: "active", capabilities: VOCAB, cover: "Lu", expertise: [], invitation: "spent" },
  { member_id: "kim", handle: "kim", role: "admin", status: "proposed", capabilities: VOCAB, cover: "Kim", expertise: [], invitation: null },
  { member_id: "old", handle: "old", role: "member", status: "revoked", capabilities: ["contribute"], cover: "Old", expertise: [], invitation: "spent" },
  { member_id: "mai-k", handle: null, role: "member", status: "invited", capabilities: ["contribute"], cover: "Mai K., from the Seminary Ave block", expertise: [], invitation: "live" },
];
/** The roster as a member who does not administer reads it (membership R18: no cover, no invitation). */
export const ROSTER_MEMBER = ROSTER.map(({ cover, invitation, ...r }) => r);

export const ALL_USES = { ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true, read: true, transcribe: false, account: true, suggestions: false };

export const LIMITS = { ok: true, owner: "group", zone: "UTC", limits: [
  { scope: "overall", use: null, unit: "usd", period: "month", amount: 60, inclusive: null, on_top: null, used: 31.4, reached: false, set_by: "member:rosa", set_at: "2026-10-06T09:00:00Z" },
  { scope: "per_member", use: null, unit: "usd", period: "day", amount: 5, inclusive: null, on_top: null, used: 0.8, reached: false, set_by: "member:rosa", set_at: "2026-10-06T09:00:00Z" },
  { scope: "run", use: "run", unit: "tokens", period: "month", amount: 2000000, inclusive: false, on_top: true, used: 2700000, reached: true, set_by: "member:lu", set_at: "2026-10-07T09:00:00Z" },
], history: [
  { change: "set", scope: "overall", unit: "usd", period: "month", amount: 60, inclusive: null, by: "member:rosa", at: "2026-10-06T09:00:00Z" },
  { change: "removed", scope: "draft", unit: "calls", period: "day", amount: null, inclusive: true, by: "member:lu", at: "2026-10-08T09:00:00Z" },
] };

export const USAGE = (owner) => ({ ok: true, owner, month: "2026-10", zone: "UTC", uses: [
  { use: "ask", calls: 220, tokens: 1900000, total_cost_usd: 12.6, cost_unstated: false },
  { use: "draft", calls: 35, tokens: 400000, total_cost_usd: 2.3, cost_unstated: false },
  { use: "run", calls: 41, tokens: 2700000, total_cost_usd: 16.5, cost_unstated: false },
] });

export const HISTORY = (owner) => ({ ok: true, owner, count: 3, limit: 200, truncated: false, changes: [
  { at: "2026-10-06T08:00:00Z", by: "rosa", change: "key_set", kind: "apikey" },
  { at: "2026-10-06T08:01:00Z", by: "member:rosa", change: "switched", on: true },
  { at: "2026-10-07T08:00:00Z", by: "member:lu", change: "use_set", switch: "explore", value: "ask" },
] });

/** members, read by an administrator: every read answering. */
export function membersTable(over = {}) {
  return {
    memberlist: env({ members: ROSTER }),
    adminrecoverystep: env({ ok: true, administrators: 1, codes_held: false, remaining: 0, met: false }),
    groupkeystate: env({ ok: true, held: true, on: true, set_at: "2026-10-06T08:00:00Z", by: "member:rosa", suggestions: false, standing: false, uses: ALL_USES }),
    aikeepawaystate: env({ on: false, reason: null, set_by: null, set_at: null, uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: (ROSTER.find((m) => m.member_id === q.memberId) || { expertise: [] }).expertise, gates: "nothing" }),
    accountuses: (q) => env({ ok: true, owner: q.owner, held: true, uses: ALL_USES, keptAway: [] }),
    ailimits: () => env(LIMITS),
    aiusage: (q) => env(USAGE(q.owner)),
    accounthistory: (q) => env(HISTORY(q.owner)),
    memberadd: (q, b) => env({ ok: true, memberId: b.memberId, invite: "0123456789abcdef0123456789abcdef", expires: "2026-10-19T10:00:00Z", role: b.role || "member", capabilities: b.capabilities, invited_by: "rosa" }),
    membercaps: (q, b) => env({ ok: true, memberId: b.memberId, capabilities: b.capabilities, by: "rosa" }),
    memberset: (q, b) => env({ ok: true, memberId: b.memberId, status: b.status, by: "rosa" }),
    adminendorse: (q, b) => env({ ok: true, memberId: b.memberId, invite: "fedcba9876543210fedcba9876543210", expires: "2026-10-19T10:00:00Z", endorsedBy: ["rosa", "lu"] }),
    adminremove: (q, b) => env({ ok: true, memberId: b.memberId, removed: true }),
    expertiseconfirm: (q, b) => env({ ok: true, memberId: b.memberId, label: b.label, state: "confirmed", confirmed: true, by: "rosa" }),
    invitewithdraw: (q, b) => env({ ok: true, memberId: b.memberId, status: "revoked", invitation: "withdrawn", by: "rosa", at: "2026-10-12T00:00:00Z" }),
    websitekeycreate: () => env({ ok: true, keyId: "wk1", key: "a".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    joinlinkenable: () => env({ ok: true, linkId: "jl1", link: "b".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    groupkeyset: () => env({ ok: true, set_at: "2026-10-12T00:00:00Z" }),
    groupkeyswitch: (q, b) => env({ ok: true, on: b.on === true }),
    groupkeyremove: () => env({ ok: true, removed: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    aikeepaway: (q, b) => env({ ok: true, on: b.on, reason: b.reason || null, set_by: "rosa", set_at: "2026-10-12T00:00:00Z", uses: b.uses || [] }),
    ...over,
  };
}

/** members, read by a member who does not administer: the projections the owners answer them. */
export function membersTableMember(over = {}) {
  return membersTable({
    memberlist: env({ members: ROSTER_MEMBER }),
    groupkeystate: env({ ok: true, on: true }),
    adminrecoverystep: refuse("NOT_AN_ADMIN"),
    accountuses: refuse("NOT_AN_ADMIN"), ailimits: refuse("NOT_AN_ADMIN"), aiusage: refuse("NOT_AN_ADMIN"), accounthistory: refuse("NOT_AN_ADMIN"),
    ...over,
  });
}

export const KEEPAWAY_ON = { on: true, reason: "We hold tips from city employees; none of it may go to an AI service.", set_by: "rosa", set_at: "2026-10-02T10:00:00Z", uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] };

/** account, read by `me`. */
export function accountTable(me, over = {}) {
  return {
    whoami: env(me),
    memberlanguage: env({ ok: true, language: "es", set_at: "2026-10-03T00:00:00Z" }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: [exp("Tenant organiser", true), exp("Interpreter", false)], gates: "nothing" }),
    signerlist: env({ signers: [
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001", member_id: me.member, comment: "laptop", status: "active", added: "2026-10-04T00:00:00Z" },
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIOther0000000000000000000000000000000000002", member_id: "someone", comment: "", status: "active", added: "2026-10-04T00:00:00Z" },
    ] }),
    infolevel: env({ ok: true, level: "pause", set_at: "2026-10-05T00:00:00Z", asked_at: null }),
    memberlanguageset: (q, b) => env({ ok: true, member: me.member, language: b.language, set_at: "2026-10-12T00:00:00Z" }),
    infolevelset: (q, b) => env({ ok: true, level: b.level }),
    expertisedeclare: (q, b) => env({ ok: true, memberId: me.member, label: b.label, state: "declared", confirmed: false }),
    setpassword: () => env({ ok: true, role: "member:" + me.member, ended: 2 }),
    signerregisterown: (q, b) => env({ ok: true, keyB64: b.keyB64, memberId: me.member, status: "active", origin: "self" }),
    signerrevokeown: (q, b) => env({ ok: true, keyB64: b.keyB64, status: "revoked", by: me.member, already: false }),
    ...over,
  };
}

/** connect, read by `me`, in one of the four situations: "group" (the group's key on, no account of one's own), "own"
 *  (one's own API key), "subscription" (one's own sign-in), "none" (nothing serves), "keptaway". */
export function connectTable(me, situation = "group", over = {}) {
  const kept = situation === "keptaway";
  const ownKey = situation === "own";
  const sub = situation === "subscription";
  return {
    assistantstate: env(kept ? { ok: true, on: false, set_by: KEEPAWAY_ON.set_by, set_at: KEEPAWAY_ON.set_at, reason: KEEPAWAY_ON.reason } : { ok: true, on: true, set_by: null, set_at: null, reason: null }),
    aikeepawaystate: env(kept ? KEEPAWAY_ON : { on: false, reason: null, set_by: null, set_at: null, uses: [] }),
    groupkeystate: env({ ok: true, on: situation === "group" || ownKey }),
    groupkeynotice: env({ ok: true, due: true, text: "notice" }),
    disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: true, shown_at: "2026-10-05T00:00:00Z" }),
    accountreference: env({ ok: true, held: ownKey, kind: ownKey ? "apikey" : null, set_at: null, suggestions: false, standing: false, uses: ownKey ? ALL_USES : null, subscription: { connected: sub, since: null, uses: null } }),
    subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: sub, member: "member:" + me.member }
      : b.step === "start" ? { ok: true, address: "https://claude.ai/oauth/authorize?code=true&state=s" }
      : { ok: true, connected: true, member: "member:" + me.member },
    bootstrap: { ok: true, service: "bio-plane", version: "0.82.0", parts: [{ part: "signin", present: true }, { part: "scanner", present: false }, { part: "safe_view", present: false }] },
    accountuses: (q) => env({ ok: true, owner: q.owner, held: ownKey || sub, uses: ownKey || sub ? ALL_USES : null, keptAway: [] }),
    ailimits: (q) => env({ ...LIMITS, owner: q.owner, limits: [{ scope: "overall", use: null, unit: "tokens", period: "day", amount: 100000, inclusive: null, on_top: null, used: 4000, reached: false, set_by: "member:" + me.member, set_at: "2026-10-06T09:00:00Z" }], history: [] }),
    aiusage: (q) => q.owner ? env(USAGE(q.owner)) : env({ ok: true, member: "member:" + me.member, month: "2026-10", zone: "UTC", payers: [
      { owner: "group", whose: "group", uses: [{ use: "ask", calls: 9, tokens: 61000 }], limits: [{ scope: "overall", unit: "usd", period: "month", amount: 60, inclusive: null, reached: false }, { scope: "per_member", unit: "usd", period: "day", amount: 5, inclusive: null, reached: false }] },
    ] }),
    accounthistory: (q) => env({ ...HISTORY(q.owner), changes: [{ at: "2026-10-06T08:00:00Z", by: "member:" + me.member, change: "key_set", account: "reference", kind: "apikey" }] }),
    groupkeynoticeseen: () => env({ ok: true, seen: true, already: false }),
    disclosureshown: (q, b) => env({ ok: true, member: b.member, version: b.version, shown_at: "2026-10-12T00:00:00Z", shown: true }),
    accountreferenceset: () => env({ ok: true, kind: "apikey", set_at: "2026-10-12T00:00:00Z" }),
    accountreferenceremove: () => env({ ok: true, removed: true }),
    subscriptiondisconnect: () => env({ ok: true, disconnected: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

export const NOTES = [
  { note: 2, text: "Ask the crew foreman on 60th what “closed” means to them.", at: "2026-10-04T00:00:00Z", revised: null, turned: [] },
  { note: 1, text: "The potholes on Seminary keep opening.", at: "2026-10-02T00:00:00Z", revised: "2026-10-03T00:00:00Z", turned: [{ into: "observation", id: "OBS-0001", at: "2026-10-03T00:00:00Z" }] },
];

/** notes, read by `me`. */
export function notesTable(me, over = {}) {
  return {
    notes: env({ ok: true, notes: NOTES, limit: 200, truncated: false, next: null }),
    courtnotice: env({ choice: "tell", history: [] }),
    notewrite: () => env({ ok: true, note: 3, at: "2026-10-12T00:00:00Z" }),
    noterevise: (q, b) => env({ ok: true, note: b.note, at: "2026-10-12T00:00:00Z" }),
    notedelete: (q, b) => env({ ok: true, note: b.note, deleted: true }),
    noteturn: (q, b) => env({ ok: true, note: b.note, into: b.into, id: b.made || "HYP-0001", at: "2026-10-12T00:00:00Z" }),
    writinghelp: () => env({ ok: true, text: "The potholes on Seminary Avenue between 59th and 62nd reopened three times since spring.", label: { kind: "machine", asked_by: "member:" + me.member }, withheld: [], note: "" }),
    ...over,
  };
}
