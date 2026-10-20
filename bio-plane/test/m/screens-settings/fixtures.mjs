/* The fake plane's answers, each in its owner's documented shape (membership R6–R24, R98–R107; credentials R8–R10,
   R22–R60; ai-use R2–R12; instance-setup R53–R81; hypotheses R11–R13; wizard-scripts R27; control-plane R18, R65),
   wrapped as the door wraps them (`answer-envelope` R1: `{ok: true, result}`), except `bootstrap` and
   `subscriptionsignin`, answered at the top level as the door relays them. */

export const env = (result) => ({ ok: true, result, store: "bio", tokenClass: "member" });
export const refuse = (code, extra = {}) => env({ ok: false, reason: code, code, translation: `translated ${code}`, ...extra });

export const VOCAB = ["contribute", "publish", "create_projects"];
export const ADMIN = Object.freeze({ member: "rosa", handle: "rosa", administer: true, capabilities: VOCAB, vocabulary: VOCAB, tokenClass: "member" });
export const MEMBER = Object.freeze({ member: "dev", handle: "dev", administer: false, capabilities: ["contribute"], vocabulary: VOCAB, tokenClass: "member" });
/** The founder's session (the shell's `tokenClass: "admin"`, interface-shell R12): hers alone reaches `export` (corpus-export). */
export const FOUNDER = Object.freeze({ member: "admin", handle: "sparky", administer: true, capabilities: VOCAB, vocabulary: VOCAB, tokenClass: "admin" });
export const READER = Object.freeze({ member: "teo", handle: "teo", administer: false, capabilities: [], vocabulary: VOCAB, tokenClass: "member" });

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

/** `aiuseovertime` (ai-use R14): thirty local days, oldest first, and a period for each limit set. */
export const OVER = (owner, over = {}) => ({ ok: true, owner,
  days: Array.from({ length: 30 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, 15 + i)).toISOString().slice(0, 10), calls: i === 29 ? 12 : (i % 7) * 3, dollars: i === 29 ? 1.5 : (i % 7) * 0.4 })),
  periods: [
    { scope: "overall", unit: "usd", period: "month", period_start: "2026-10-01", used: 31.4, limit: 60 },
    { scope: "overall", unit: "usd", period: "day", period_start: "2026-10-14", used: 1.5, limit: 1.8 },
  ], ...over });

export const HISTORY = (owner) => ({ ok: true, owner, count: 3, limit: 200, truncated: false, changes: [
  { at: "2026-10-06T08:00:00Z", by: "rosa", change: "key_set", kind: "apikey" },
  { at: "2026-10-06T08:01:00Z", by: "member:rosa", change: "switched", on: true },
  { at: "2026-10-07T08:00:00Z", by: "member:lu", change: "use_set", switch: "explore", value: "ask" },
] });

/** `adminarith` (membership R5): the table for 1 to 9 administrators and the live row for `n`. */
const arithRow = (n) => { const votesNeeded = Math.floor(n / 2) + 1, eligibleVoters = Math.max(0, n - 1); return { administrators: n, votesNeeded, eligibleVoters, possible: votesNeeded <= eligibleVoters }; };
export const ARITH = (n) => env({ ok: true, table: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(arithRow), live: arithRow(n) });

/** `signerlist` rows (credentials R8): the founder's, an administrator's own, one an administrator registered for lu, dev's active key and a key of dev's withdrawn
 *  by rosa; ana has none. */
const KEY = (n) => "AAAAC3NzaC1lZDI1NTE5AAAAI" + String(n).padEnd(40, "0");
export const SIGNER_KEYS = Object.freeze({ founder: KEY("F"), rosa: KEY("R"), lu: KEY("L"), dev: KEY("D"), devOld: KEY("X") });
export const SIGNERS = [
  { key_b64: SIGNER_KEYS.founder, member_id: "admin", comment: "", status: "active", added: "2026-10-02T00:00:00Z", status_by: "admin", status_at: "2026-10-02T00:00:00Z", origin: "self", registered_by: "admin", member_status: "active", attests: true },
  { key_b64: SIGNER_KEYS.rosa, member_id: "rosa", comment: "laptop", status: "active", added: "2026-10-03T00:00:00Z", status_by: "rosa", status_at: "2026-10-03T00:00:00Z", origin: "self", registered_by: "rosa", member_status: "active", attests: true },
  { key_b64: SIGNER_KEYS.lu, member_id: "lu", comment: "", status: "active", added: "2026-10-05T00:00:00Z", status_by: "rosa", status_at: "2026-10-05T00:00:00Z", origin: "admin", registered_by: "rosa", member_status: "active", attests: true },
  { key_b64: SIGNER_KEYS.dev, member_id: "dev", comment: "", status: "active", added: "2026-10-04T00:00:00Z", status_by: "dev", status_at: "2026-10-04T00:00:00Z", origin: "self", registered_by: "dev", member_status: "active", attests: true },
  { key_b64: SIGNER_KEYS.devOld, member_id: "dev", comment: "old phone", status: "revoked", added: "2026-10-01T00:00:00Z", status_by: "rosa", status_at: "2026-10-12T00:00:00Z", origin: "self", registered_by: "dev", member_status: "active", attests: false, attests_why: "key_revoked" },
];

/** members, read by an administrator: every read answering (R47: the roster only; the team's key is `teamai`'s). */
export function membersTable(over = {}) {
  return {
    // the founder's row is the roster's own (membership R147; screens-settings R51)
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER] }),
    adminrecoverystep: env({ ok: true, administrators: 1, codes_held: false, remaining: 0, met: false }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: (ROSTER.find((m) => m.member_id === q.memberId) || { expertise: [] }).expertise, gates: "nothing" }),
    memberadd: (q, b) => env({ ok: true, memberId: b.memberId, invite: "0123456789abcdef0123456789abcdef", expires: "2026-10-19T10:00:00Z", role: b.role || "member", capabilities: b.capabilities, invited_by: "rosa" }),
    membercaps: (q, b) => env({ ok: true, memberId: b.memberId, capabilities: b.capabilities, by: "rosa" }),
    memberset: (q, b) => env({ ok: true, memberId: b.memberId, status: b.status, by: "rosa" }),
    adminendorse: (q, b) => env({ ok: true, memberId: b.memberId, invite: "fedcba9876543210fedcba9876543210", expires: "2026-10-19T10:00:00Z", endorsedBy: ["rosa", "lu"] }),
    adminremove: (q, b) => env({ ok: true, memberId: b.memberId, removed: true }),
    expertiseconfirm: (q, b) => env({ ok: true, memberId: b.memberId, label: b.label, state: "confirmed", confirmed: true, by: "rosa" }),
    invitewithdraw: (q, b) => env({ ok: true, memberId: b.memberId, status: "revoked", invitation: "withdrawn", by: "rosa", at: "2026-10-12T00:00:00Z" }),
    websitekeycreate: () => env({ ok: true, keyId: "wk1", key: "a".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    joinlinkenable: () => env({ ok: true, linkId: "jl1", link: "b".repeat(64), capabilities: ["contribute"], dailyCap: 5, expiresInDays: 7, warning: "" }),
    // T47 (R23): the signing keys an administrator withdraws, and the reset link (credentials R10, R69)
    signerlist: env({ signers: SIGNERS }),
    signerset: (q, b) => env({ ok: true, keyB64: b.keyB64, status: b.status, by: "rosa" }),
    signeradd: (q, b) => env({ ok: true, keyB64: b.keyB64, memberId: b.memberId, status: "active", origin: "admin", registered_by: "rosa" }),
    // R56: three administrators are listed (the founder's row, rosa, lu) and three are counted
    adminarith: ARITH(3),
    // member-roster R75: none under way
    adminremovalsopen: env({ ok: true, removals: [] }),
    passwordresetlink: (q, b) => env({ ok: true, member: b.member, link: "rl-0123456789", expiresAt: "2026-10-19T00:00:00Z" }),
    ...over,
  };
}

/** members, read by a member who does not administer: the projections the owners answer them. */
export function membersTableMember(over = {}) {
  return membersTable({
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER_MEMBER] }),
    adminrecoverystep: refuse("NOT_AN_ADMIN"),
    ...over,
  });
}

/** The founder's row as `memberlist` answers it (membership R147): first, `member_id: "admin"`, `founder: true`; `handle` null until she chooses one. */
export const FOUNDER_ROW = Object.freeze({ member_id: "admin", handle: null, role: "admin", status: "active", capabilities: VOCAB, cover: "The founder", expertise: [], invitation: null, founder: true });

/** teamai, read by an administrator (R48): the team's key and its account, every read answering. */
export function teamaiTable(over = {}) {
  return {
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER] }),
    groupkeystate: env({ ok: true, held: true, on: true, set_at: "2026-10-06T08:00:00Z", by: "member:rosa", suggestions: false, standing: false, uses: ALL_USES }),
    aikeepawaystate: env({ on: false, reason: null, set_by: null, set_at: null, uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] }),
    accountuses: (q) => env({ ok: true, owner: q.owner, held: true, uses: ALL_USES, keptAway: [] }),
    ailimits: () => env(LIMITS),
    aiusage: (q) => env(USAGE(q.owner)),
    accounthistory: (q) => env(HISTORY(q.owner)),
    aiuseovertime: (q) => env(OVER(q.owner)),
    groupkeyset: () => env({ ok: true, set_at: "2026-10-12T00:00:00Z" }),
    groupkeyswitch: (q, b) => env({ ok: true, on: b.on === true }),
    groupkeyremove: () => env({ ok: true, removed: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    aikeepaway: (q, b) => env({ ok: true, on: b.on, reason: b.reason || null, set_by: "rosa", set_at: "2026-10-12T00:00:00Z", uses: b.uses || [] }),
    ...over,
  };
}

export const KEEPAWAY_ON = { on: true, reason: "We hold tips from city employees; none of it may go to an AI service.", set_by: "rosa", set_at: "2026-10-02T10:00:00Z", uses: ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "explore"] };

/** account, read by `me`. */
export function accountTable(me, over = {}) {
  return {
    whoami: env(me),
    memberlanguage: env({ ok: true, language: "es", set_at: "2026-10-03T00:00:00Z" }),
    grouplanguages: env({ ok: true, languages: ["en", "es", "vi"] }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: [exp("Tenant organiser", true), exp("Interpreter", false)], gates: "nothing" }),
    signerlist: env({ signers: [
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIMine00000000000000000000000000000000000001", member_id: me.member, comment: "laptop", status: "active", added: "2026-10-04T00:00:00Z", origin: "self", registered_by: me.member },
      { key_b64: "AAAAC3NzaC1lZDI1NTE5AAAAIOther0000000000000000000000000000000000002", member_id: "someone", comment: "", status: "active", added: "2026-10-04T00:00:00Z", origin: "self", registered_by: "someone" },
    ] }),
    // who registered a key for the member, by handle (R57)
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER] }),
    infolevel: env({ ok: true, level: "pause", set_at: "2026-10-05T00:00:00Z", asked_at: null }),
    // member-roster R19: what the viewer may see of the pairings (her own, and the published); the stored choice is hers
    memberpairings: env({ ok: true, pairings: [{ handle: "ana", cover: "Ana the CPA", published: true }, { handle: me.handle, cover: "Mai K.", published: false }], limit: 200, truncated: false }),
    memberpairingset: (q, b) => env({ ok: true, memberId: b.memberId, published: b.published === true, by: me.member }),
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
    accountreference: env({ ok: true, held: ownKey, kind: ownKey ? "apikey" : null, set_at: ownKey ? "2026-10-06T09:00:00Z" : null, suggestions: false, standing: false, uses: ownKey ? ALL_USES : null, subscription: { connected: sub, since: sub ? "2026-10-04T00:00:00Z" : null, held: sub, valid_until: sub ? "2036-11-04T00:00:00Z" : undefined, uses: null } }),
    subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: sub, member: "member:" + me.member }
      : b.step === "start" ? { ok: true, address: "https://claude.ai/oauth/authorize?code=true&state=s" }
      : { ok: true, connected: true, member: "member:" + me.member },
    // instance-setup R82: the parts as three flat keys
    bootstrap: { ok: true, service: "bio-plane", version: "0.83.0", part_signin: true, part_scanner: false, part_safe_view: false },
    accountuses: (q) => env({ ok: true, owner: q.owner, held: ownKey || sub, uses: ownKey || sub ? ALL_USES : null, keptAway: [] }),
    ailimits: (q) => env({ ...LIMITS, owner: q.owner, limits: [{ scope: "overall", use: null, unit: "tokens", period: "day", amount: 100000, inclusive: null, on_top: null, used: 4000, reached: false, set_by: "member:" + me.member, set_at: "2026-10-06T09:00:00Z" }], history: [] }),
    aiusage: (q) => q.owner ? env(USAGE(q.owner)) : env({ ok: true, member: "member:" + me.member, month: "2026-10", zone: "UTC", payers: [
      { owner: "group", whose: "group", uses: [{ use: "ask", calls: 9, tokens: 61000 }], limits: [{ scope: "overall", unit: "usd", period: "month", amount: 60, inclusive: null, reached: false }, { scope: "per_member", unit: "usd", period: "day", amount: 5, inclusive: null, reached: false }] },
    ] }),
    aiuseovertime: (q) => env(OVER(q.owner)),
    accounthistory: (q) => env({ ...HISTORY(q.owner), changes: [{ at: "2026-10-06T08:00:00Z", by: "member:" + me.member, change: "key_set", account: "reference", kind: "apikey" }] }),
    groupkeynoticeseen: () => env({ ok: true, seen: true, already: false }),
    disclosureshown: (q, b) => env({ ok: true, member: b.member, version: b.version, shown_at: "2026-10-12T00:00:00Z", shown: true }),
    accountreferenceset: () => env({ ok: true, kind: "apikey", set_at: "2026-10-12T00:00:00Z" }),
    accountreferenceremove: () => env({ ok: true, removed: true }),
    subscriptiondisconnect: () => env({ ok: true, disconnected: true }),
    accountusesset: (q, b) => env({ ok: true, owner: b.owner, switch: b.switch, on: b.on }),
    ailimitset: (q, b) => env({ ok: true, ...b, change: b.amount === null ? "removed" : "set", set_at: "2026-10-12T00:00:00Z" }),
    reauth: () => env({ ok: true }),
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

// ---- T47: the new screens (R14–R20) ----

/** One `time_zone` fact as `factstatus` lists it (local-facts R2): the path is the fact's own, `governs` the value in force. */
export const tzFact = (profile, zone, origin = "profile") => ({ path: `${profile}/time_zone`, fact: { fact: "time_zone", profile }, status: origin === "corrected" ? "corrected" : "unconfirmed",
  profile: { value: zone, status: "verified", basis: "x" }, governs: origin === "corrected" ? { value: zone, origin, source: "the county site", says: "corrected locally by rosa, 2026-10-10" } : { value: zone, origin } });
/** corpus-export R2: the copies taken, newest first. */
export const EXPORTS = [
  { seq: 2, at: "2026-10-18T14:05:00Z", scope: "working-corpus", bundles: 38, files: 112, note: "Before the Coliseum lease hearing", tables: 14, rows: 800, format: "json" },
  { seq: 1, at: "2026-09-02T09:40:00Z", scope: "working-corpus", bundles: 31, files: 87, note: null, tables: 14, rows: 700, format: "json" },
];
/** group, read by `me` (instance-setup R10, R11, R84, R85; membership R107; strength's bar). */
export function groupTable(over = {}) {
  return {
    groupidentity: env({ group: "eastoak", declared_stake: { stake: "Several of our members rent from landlords the city regulates.", set_by: "member:rosa", set_at: "2026-10-04T00:00:00Z" }, declared_stake_history: [{ stake: null, set_by: "member:rosa", set_at: "2026-10-01T00:00:00Z" }, { stake: "Several of our members rent from landlords the city regulates.", set_by: "member:rosa", set_at: "2026-10-04T00:00:00Z" }], display_name: "East Oakland Watch", domain: "eastoak.example", domain_verified_at: "2026-10-03T00:00:00Z", logo: false,
      display_name_recorded: "East Oakland Watch", display_name_history: [], domain_claim: { domain: "eastoak.example", set_at: "2026-10-02T00:00:00Z", set_by: "rosa", latest: { domain: "eastoak.example", verdict: "verified", checked_at: "2026-10-03T00:00:00Z" } }, domain_history: [], domain_checks: [] }),
    grouplanguages: env({ ok: true, languages: ["en", "es"] }),
    // R45: the facts of the active profiles and the places' names
    factstatus: env({ ok: true, facts: [tzFact("us-ca-oakland", "America/Los_Angeles")] }),
    profiles: env({ ok: true, profiles: [{ id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }], conflicts: [], choices: [], view: "main" }),
    factconfirm: (q, b) => env({ ok: true, path: b.path, status: "corrected", governs: { value: b.value, origin: "corrected" } }),
    memberlanguage: env({ ok: true, language: null }),
    declaredstakeset: (q, b) => env({ ok: true, stake: b.stake, set_by: "member:rosa", set_at: "2026-10-12T00:00:00Z" }),
    writinghelp: () => env({ ok: true, text: "The group's members rent in East Oakland.", label: { kind: "machine", asked_by: "member:rosa" }, withheld: [], note: "" }),
    courtnotice: env({ choice: "tell", history: [] }),
    hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa and Lu", note: "the shared vault", recorded_by: "rosa", at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }),
    strengthbarof: env({ ok: true, group: "eastoak", bar: { group_id: "eastoak", capture: "B", connection: "C", author: "rosa", at: "2026-10-05T00:00:00Z", reason: "Most of our sources are records." }, seeds_new_projects: true }),
    groupnameset: (q, b) => env({ ok: true, display_name: b.name, set_at: "2026-10-12T00:00:00Z", set_by: "rosa" }),
    grouplogoset: () => env({ ok: true, logo: true }),
    groupdomainset: (q, b) => env({ ok: true, domain: b.domain, check: { verdict: "absent" } }),
    grouplanguagesset: (q, b) => env({ ok: true, languages: b.languages }),
    courtnoticeset: (q, b) => env({ ok: true, choice: b.choice, by: "rosa", at: "2026-10-12T00:00:00Z" }),
    hostingaccessset: (q, b) => env({ ok: true, holders: b.holders, note: b.note || null, recorded_by: "rosa", at: "2026-10-12T00:00:00Z" }),
    strengthbarset: (q, b) => env({ ok: true, group: "eastoak", capture: b.capture, connection: b.connection, author: "rosa", at: "2026-10-12T00:00:00Z", reason: b.reason }),
    // corpus-export R1, R2: the copy is the answer itself (a manifest); the list is the copies taken, newest first
    export: (q, b) => env({ ok: true, at: "2026-10-20T10:00:00Z", scope: "working-corpus", counts: { bundles: 40, files: 120, tables: 15, rows: 900 }, logged: true, verify: "v" }),
    exportlog: env({ ok: true, exports: EXPORTS, limit: 200, truncated: false }),
    ...over,
  };
}

const OFFICES = ["", "Office of the City Clerk", "Department of Public Works", "Office of the City Auditor"];
const office = (i, by = "class:daemon") => ({ entity_id: "ENT-" + String(i).padStart(4, "0"), kind: "office", label: OFFICES[i], note: "n", declared_by: by, at: "2026-10-01T00:00:00Z" });
/** The courts held (`entitieskind` of kind body, forum_kind court): one the place's rules seeded, one a member added (R46). */
export const COURTS = [
  { entity_id: "ENT-0101", kind: "body", forum_kind: "court", label: "Alameda County Superior Court", note: "n", declared_by: "class:daemon", at: "2026-10-01T00:00:00Z" },
  { entity_id: "ENT-0102", kind: "body", forum_kind: "court", label: "Oakland Small Claims", note: "Oakland Small Claims", declared_by: "member:lu", at: "2026-10-09T00:00:00Z" },
];
/** places: two pages of offices, the second answered only when asked `after` the first's last. */
export function placesTable(over = {}) {
  return {
    profiles: env({ ok: true, profiles: [{ id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }], conflicts: [], choices: [{ id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }, { id: "us-ca", name: "California", covers: ["California"] }], view: "main" }),
    placewantedstate: env({ ok: true, name: "Alameda County", set_by: "rosa", set_at: "2026-10-04T00:00:00Z", matches: [] }),
    entitieskind: (q) => q.kind === "body" ? env({ ok: true, kind: "body", entities: COURTS, count: COURTS.length, limit: 500, truncated: false, next: null })
      : q.after === "ENT-0002" ? env({ ok: true, kind: "office", entities: [office(3, "lu")], count: 1, limit: 500, truncated: false, next: null })
      : env({ ok: true, kind: "office", entities: [office(1), office(2)], count: 2, limit: 500, truncated: true, next: "ENT-0002" }),
    // wizard-scripts R37: the routes, the `elsewhere` one carrying the places' pointers (three listed)
    startfrom: env({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }], routes: [{ route: "blank" }, { route: "elsewhere", pointer: { places: ["Oakland, California"], pointers: [{ kind: "legal-help" }, { kind: "courts-self-help" }, { kind: "city-line" }] } }], blank: true, matches: [] }),
    profilesset: (q, b) => env({ ok: true, profiles: b.profiles.map((id) => ({ id, name: id })), choices: [] }),
    placewanted: (q, b) => env({ ok: true, name: b.name, set_by: "rosa", set_at: "2026-10-12T00:00:00Z" }),
    officesseed: () => env({ ok: true, seeded: [{ what: "office" }], already: [{ what: "office" }, { what: "body" }], unseeded: [], by: "rosa" }),
    entitycreate: (q, b) => env({ ok: true, entity_id: "ENT-0009", kind: b.kind, label: b.label, alias_count: 0, at: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

/** recovery, read by `me`. */
export function recoveryTable(over = {}) {
  return {
    recoverycodesstate: env({ ok: true, held: true, remaining: 7, issuedAt: "2026-10-02T00:00:00Z" }),
    adminrecoverystep: env({ ok: true, administrators: 1, codes_held: true, remaining: 7, met: false }),
    // the one administrator is named (screens-settings R35): the founder alone, claimed
    memberlist: env({ members: [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }] }),
    bootstrap: { ok: true, claimed: true },
    recoverycodesissue: () => env({ ok: true, codes: Array.from({ length: 10 }, (_, i) => "CODE-" + String(i).padStart(4, "0") + "-SENTINEL"), issuedAt: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

/** group-identity (membership R109, R110; instance-setup R65). */
export function identityTable(over = {}) {
  return {
    groupdescription: env({ description: { kinds: ["community", "other"], otherKind: "a tenants' union", focus: "Street repair on Seminary.", purpose: "We keep the city to its word.", visibility: "members", by: "rosa", at: "2026-10-02T00:00:00Z" }, history: [] }),
    groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_verified_at: null }),
    groupdescriptionset: (q, b) => env({ ok: true, ...b, by: "rosa", at: "2026-10-12T00:00:00Z" }),
    groupdescriptiondraft: () => env({ focus: { text: "Potholes and street repair in East Oakland.", label: { kind: "machine", asked_by: "member:rosa" } }, purpose: { text: "To hold the city to its repair promises.", label: { kind: "machine", asked_by: "member:rosa" } } }),
    ...over,
  };
}

export const CATALOGUE_ENTRY = { provider_id: "acme-scan", vendor: "Acme", product: "Scan", kinds: ["scan"], transport: "https", reach: "file", template: false,
  credentials: ["api_key"], config: [{ name: "region", label: "The region your account is in", required: true }, { name: "tag", label: "A tag for its reports", required: false }],
  handling: { on_own: false, sends: ["file_bytes"], never_sends: ["member_identity"], recipient: "Acme Inc.", sub_processors: [], region: "EU", file_retention: "30 days", result_retention: "1 year", sample_sharing: "vendor_internal_research" },
  handling_digest: "d".repeat(64) };
export const OWN_ENTRY = { ...CATALOGUE_ENTRY, provider_id: "own-scan", vendor: "Our", product: "Scanner", credentials: [], config: [],
  handling: { ...CATALOGUE_ENTRY.handling, on_own: true, recipient: "the organization (our own hosting)", sample_sharing: "none" }, handling_digest: "e".repeat(64) };
/** security (credentials R45; file-safety R5, R27–R31; instance-setup R82). */
export function securityTable(over = {}) {
  return {
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER_MEMBER] }),
    securitymap: (q) => env({ ok: true, from: q.from, to: q.to, step: "day", level: "Raised", levelAt: q.to, note: "",
      buckets: [{ start: q.from, counts: { signin: 4, credential: 1, rate: 2, handover: 0, through: 3, total: 10 }, usual: { signin: 1, credential: 0, rate: 1, handover: 0, through: 1, total: 3 } }],
      totals: { count: 10, usual: 3, busiest: q.from }, countries: [{ country: "XX-SENTINEL-COUNTRY", count: 9 }], unplaced: 1 }),
    bootstrap: { ok: true, service: "bio-plane", part_signin: true, part_scanner: true, part_safe_view: true },
    scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, queued: 3, overdue: 0, held: 1, tools: [] }),
    securitytools: env({ ok: true, tools: [{ tool_id: "T1", provider_id: "acme-scan", kinds: ["scan"], use: "on_request", state: "on", handling_digest: "d".repeat(64), added_by: "rosa", added_at: "2026-10-03T00:00:00Z" }] }),
    securitytoolevents: env({ ok: true, events: [{ tool_id: "T1", event: "test_passed", at: "2026-10-03T00:00:00Z", reason: null }], cursor: null, truncated: false }),
    securitytoolcatalogue: env({ ok: true, offered: [CATALOGUE_ENTRY, OWN_ENTRY], refused: [], held: [] }),
    securitytooladd: (q, b) => env({ ok: true, tool_id: "T2", state: "added" }),
    securitytooltest: (q, b) => env({ ok: true, tool_id: b.toolId, state: "on", passed: true, detail: "", tested_at: "2026-10-12T00:00:00Z" }),
    securitytoolremove: (q, b) => env({ ok: true, tool_id: b.toolId, state: "removed" }),
    ...over,
  };
}

/** translations, for `es` (instance-setup R67–R74). */
export const TWORDS = [
  { key: "rail.home.name", en: "Home", note: "The first place", means: null, protected: false, state: "shown", text: "Inicio", adopted_by: "ana", adopted_by_name: "ana", adopted_at: "2026-10-03T00:00:00Z", english_changed: false, drafts: [], acts: [{ act: "adopt", seq: 1 }], marks: [] },
  { key: "mark.outward.means", en: "Outward: this leaves…", note: null, means: null, protected: true, state: "awaiting", text: "Hacia fuera", adopted_by: "ana", adopted_by_name: "ana", adopted_at: "2026-10-04T00:00:00Z", english_changed: true, drafts: [], acts: [{ act: "adopt", seq: 2 }], marks: [] },
  { key: "rail.queue.name", en: "Queue", note: null, means: null, protected: false, state: "missing", text: null, adopted_by: null, adopted_at: null, english_changed: false, drafts: [{ id: "D1", text: "Cola", label: "Draft", asked_by: "member:ana", asked_by_name: "ana", at: "2026-10-05T00:00:00Z" }], acts: [], marks: [] },
];
export function translationsTable(over = {}) {
  return {
    grouplanguages: env({ ok: true, languages: ["en", "es", "vi"] }),
    translations: (q) => env({ ok: true, language: q.language, words_commit: "x", counts: { missing: 1, shown: 1, awaiting: 1 }, local_names: [], words: TWORDS }),
    interfacewords: (q) => env({ ok: true, language: q.language, words: [] }),
    translationadopt: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "shown" }),
    translationconfirm: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "shown", confirmed_by: "rosa" }),
    translationrevert: (q, b) => env({ ok: true, language: b.language, key: b.key, state: "missing" }),
    translationgrant: (q, b) => env({ ok: true, existed: false, member: b.member, language: b.language, granted: !b.revoke }),
    translationdraft: (q, b) => b.direction === "to_english" ? env({ ok: true, key: b.key, language: b.language, english: "Outward: this goes outside", label: { kind: "machine", asked_by: "member:rosa" } })
      : env({ ok: true, language: b.language, drafted: b.keys.map((k) => ({ id: "D9", key: k, text: "x" })), not_drafted: [], offered_official: [] }),
    ...over,
  };
}

/** `updatenotice` (instance-setup R89): what Settings › Updates draws. */
export const UPDATE = Object.freeze({ ok: true,
  running: { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: "member:rosa" },
  last_check: { at: "2026-10-14T06:10:00Z", outcome: "ok" },
  ready: { version: "0.84.0", date: "2026-10-11", security: true, signed: true, found_at: "2026-10-11T06:00:00Z", decision: null,
    notes: { members: "Searching the record now finds words inside scanned pages.", administrators: "New releases are checked for once a day.", must_do: "After it, open Translations once." } },
  earlier: [
    { version: "0.83.1", skipped_at: "2026-10-02T10:00:00Z", skipped_by: "member:rosa", reason: "Changes nothing for us; we wait for 0.84." },
    { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: "member:rosa" },
    { version: "0.82.0", installed_at: "2026-09-02T10:00:00Z", allowed_by: null },
  ],
  holder: { holders: "Rosa Medina", note: null, recorded_by: "rosa", at: "2026-10-04T00:00:00Z" }, viewer_holds: true });
export function updatesTable(notice = {}, over = {}) {
  return {
    // a member who does not administer is told whose screen it is: the administrators, from the roster (R43, R37)
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER_MEMBER] }),
    updatenotice: env({ ...UPDATE, ...notice }),
    updatestart: (q, b) => env({ ok: true, version: b.version, address: "https://civicsmith.org/update?release=" + b.version }),
    updatelater: (q, b) => env({ ok: true, version: b.version, kind: "later" }),
    updateskip: (q, b) => env({ ok: true, version: b.version, kind: "skip" }),
    // an administrator's bootstrap carries the copy's facts (instance-setup R95: `installed_at` is when it was set up); with `members=1` each part's own build (R17)
    bootstrap: (q) => ({ ok: true, service: "bio-plane", version: "0.83.0", part_signin: true, part_scanner: false, part_safe_view: false, installed_at: "2026-09-02T10:00:00Z",
      ...(q.members === "1" ? { memberVersions: MEMBER_VERSIONS } : {}) }),
    // instance-setup R18: the deployment's own check
    selftest: { ok: true, service: "bio-plane", version: "0.83.0", time: "2026-10-14T06:10:00Z", tokenClass: "admin", bindings: { STORE: true, CAPTURES: "not configured", PUBLISHED: "not configured", ADMIN_TOKEN: true, PROBE_TOKEN: true, DAEMON_TOKEN: "not configured" }, r2Configured: false, store: { bundles: 4 }, captures: "not configured", bindingsAllPresent: true },
    // instance-setup R37: what the instance was measured to cost
    runtime: env({ ok: true, measured: { metrics: [{ metric: "capture_work_bytes", unit: "bytes", peak: 800000, peak_at: "2026-10-12T00:00:00Z", peak_detail: null, last: 1200, last_at: "2026-10-13T00:00:00Z", samples: 40, total: 2000000, mean: 50000 },
      { metric: "request_work", unit: "ms", peak: 1840, peak_at: "2026-10-12T00:00:00Z", peak_detail: null, last: 90, last_at: "2026-10-13T00:00:00Z", samples: 5200, total: 1612000, mean: 310, peak_ms: 1840, last_ms: 90, total_ms: 1612000, mean_ms: 310 }], note: "units" },
      cpu_probe: { steps: 0, highest_completed: 0, elapsed_at_highest_ms: 0, rows: [], note: "nothing is known about the ceiling by measurement" }, subrequests: { runtime: "subrequests", observed: 50, probeDue: false, probeEvery: 20 }, asymmetry: "the subrequest ceiling is known by having been refused" }),
    ...over,
  };
}
/** `bootstrap`'s `memberVersions` (instance-setup R17): each part's own build, as it answered. */
export const MEMBER_VERSIONS = Object.freeze({
  "agent-worker": { binding: "AGENT_WORKER", state: "SERVING", version: "0.83.0" },
  "pdf-worker": { binding: "PDF_WORKER", state: "SERVING", version: "0.83.0" },
  "ocr-worker": { binding: "OCR_WORKER", state: "SILENT", why: "timed out" },
  "sheet-worker": { binding: "SHEET_WORKER", state: "MISNAMED", name: "other-worker", version: "0.83.0" },
  "agent-runner": { binding: "AGENT_WORKER", via: "agent-worker", state: "UNBOUND" },
  "file-scanner": { binding: "FILE_SCANNER", state: "SERVING", version: "0.82.0" },
});

/** grouprules, read by a member (local-facts R12, R19): rules drafted and waiting (tiers 1, 2 and none; one the viewer drafted), one in force, one withdrawn. */
const SHA = (c) => c.repeat(64);
const rule = (n, over) => ({ rule: "GR-" + String(n).padStart(4, "0"), section: "deadlines", state: "drafted", entry: {}, source: { captureSha: SHA("a"), extent: "p1" }, reason: "r", applies_to: null, tier: 1,
  drafter: "ana", drafted_at: "2026-10-09T00:00:00Z", confirmer: null, confirmed_at: null, ...over });
export const GROUP_RULES = [
  rule(1, { entry: { rule: "Parks Commission: written comments close five days before the meeting", applies_to: "request_for_comment", starts: "hearing", citation: "Parks Commission Rule 4(b)", effective_from: "2026-07-01" }, applies_to: "request_for_comment", tier: 1 }),
  rule(2, { entry: { rule: "Rent Board: a party's written statement is due ten days before the hearing", applies_to: "party_participation", starts: "hearing", citation: "Hearing Rule 6(a)", effective_from: "2026-01-01" }, applies_to: "party_participation", tier: 2, drafted_at: "2026-10-10T00:00:00Z" }),
  rule(3, { section: "legal_facts", drafter: "dev", drafted_at: "2026-10-11T00:00:00Z", entry: { key: "council-speakers", trigger: "pending_measure_or_candidate", statement: "Speakers register by noon on the meeting day", citation: "Council Rules of Procedure 3.2", applies_to: ["public_comment"], effective_from: "2026-03-01" }, applies_to: ["public_comment"], tier: 1 }),
  rule(4, { section: "legal_facts", entry: { key: "city-clerk-office-hours", trigger: "recording", statement: "A recording needs notice", citation: "Clerk Rule 2", effective_from: "2026-10-01" }, applies_to: null, tier: null }),
  rule(5, { section: "legal_facts", state: "confirmed", entry: { key: "three-minutes", trigger: "pending_measure_or_candidate", statement: "Each speaker gets three minutes", citation: "Planning Commission Bylaws, Article 5", applies_to: ["public_comment"], effective_from: "2026-01-01" }, applies_to: ["public_comment"], tier: 1, drafted_at: "2026-09-22T00:00:00Z", confirmer: "lu", confirmed_at: "2026-09-24T00:00:00Z" }),
  rule(6, { state: "withdrawn", entry: { rule: "A withdrawn rule never drawn", starts: "filed", citation: "x", effective_from: "2026-01-01" }, withdrawn: { by: "lu", at: "2026-10-01T00:00:00Z", reason: "wrong" } }),
];
/** `rulefields` (local-facts R18) for deadlines: the kinds of action, claim first; `heldcaptures` rows and a `reading`'s text units for the draft form (DEC-357). */
export const RULE_KINDS = ["claim", "request_for_comment", "public_comment", "party_participation"];
export const DOC_SHA = "d".repeat(64);
/** A document a member has vouched for (capture R88): listed only when `heldcaptures` is asked `state: "held_and_vouched"`. */
export const VOUCHED_DOC = { title: "Planning Commission bylaws (vouched)", capture: { sha256: "f".repeat(64) } };
export const UNITS_OF_DOC = [{ seq: 1, text: "Comments close five days\nbefore the meeting.", extent: { kind: "pdf-page", page: 2 } }, { seq: 2, text: "Speakers register by noon.", extent: { kind: "pdf-page", page: 3 } }];
export function grouprulesTable(over = {}) {
  return {
    rulefields: env({ ok: true, section: "deadlines", count: 2, fields: [{ field: "rule", required: true, kind: "text" }, { field: "applies_to", required: true, kind: "choice", choices: RULE_KINDS }] }),
    // capture R77, R88: the documents at `collected` by default; `state: "held_and_vouched"` adds those a member has vouched for
    heldcaptures: (q) => env({ ok: true, held: [{ title: "Parks Commission rules of procedure", capture: { sha256: DOC_SHA } }, { title: "Untitled", capture: { sha256: "e".repeat(64) } }, ...(q.state === "held_and_vouched" ? [VOUCHED_DOC] : [])] }),
    reading: env({ ok: true, text_units: UNITS_OF_DOC }),
    ruledraft: (q, b) => env({ ok: true, rule: "GR-0009", state: "drafted" }),
    grouprules: env({ ok: true, rules: GROUP_RULES, count: GROUP_RULES.length }),
    memberlist: env({ members: [FOUNDER_ROW, ...ROSTER] }),
    ruleconfirm: (q, b) => env({ ok: true, rule: b.rule, state: "confirmed", at: "2026-10-12T00:00:00Z", tier: 1, with_statement: !!b.statement }),
    rulewithdraw: (q, b) => env({ ok: true, rule: b.rule, state: "withdrawn", already: false, at: "2026-10-12T00:00:00Z" }),
    ...over,
  };
}

/** bias (bias R11–R21, R35, R36; the owner's shapes): the lens in force for the team and for a project, a set offered and adopted, an outside
 *  policy read into proposals, and a work product under an earlier lens. */
export const PROJ_BIAS = { id: "PROJ-2026-0001-coliseum", title: "The Coliseum lease" };
const ST = (id, over) => ({ statement_id: id, bundle_id: "BIAS-2026-0001-team", scope: "instance", kind: "scrutiny", subject: "ENT-2026-0007", text: "We read the Department's own reports closely, because it reports on its own conduct.", justification: "It writes the figures it is judged by.", locked: true, nullifies: null, ...over });
export const LENS_TEAM = { ok: true, scope: "instance", scope_id: "", in_force: true,
  bundles: [{ bundle_id: "BIAS-2026-0001-team", revision: "a".repeat(64), scope: "instance", adopted_by: "member:rosa", adopted_at: "2026-10-08T00:00:00Z", source_url: null, retrieved: null, source_sha256: null }],
  statements_sha: "9f3a" + "0".repeat(56) + "c07e", statements: [ST("s1")], residue: [{ bundle_id: "BIAS-2026-0001-team", scope: "instance", text: "It sets no bar for how strong support must be, and it never rules that a source is false.", stated: true }],
  lock_violations: [], interactions: [], count: 1, total: 1, limit: 200, offset: 0, truncated: false };
export const LENS_PROJECT = { ...LENS_TEAM, scope: "project", scope_id: PROJ_BIAS.id,
  bundles: [...LENS_TEAM.bundles, { bundle_id: "BIAS-2026-0002-proj", revision: "b".repeat(64), scope: "project", adopted_by: "member:dev", adopted_at: "2026-10-08T00:00:00Z" }],
  statements: [ST("s1"), ST("p1", { bundle_id: "BIAS-2026-0002-proj", scope: "project", kind: "inference", subject: "ENT-2026-0009", text: "A late reply to a request is not read as a refusal.", justification: "Offices miss dates for many reasons.", locked: false })],
  residue: [...LENS_TEAM.residue, { bundle_id: "BIAS-2026-0002-proj", scope: "project", text: "", stated: false }], total: 2, count: 2 };
export const POLICY = { ok: true, installed: false, adopted: false, writes: 0, proposes: "p",
  bars: [{ text: "A single source is not confirmation.", construct: "required_strength", detail: "d" }], bars_count: 1,
  statements: [{ id: "prop-1", kind: "scrutiny", subject: null, text: "Staff verify every claim against two sources.", justification: null, citations: [], proposed: true, authored: false },
    { id: "prop-2", kind: "inference", subject: null, text: "We do not treat silence as agreement.", justification: null, citations: [], proposed: true, authored: false }], statements_count: 2,
  residue: [{ text: "All sources are unreliable.", why: "w", check: "C-26.5" }, { text: "Our editors meet on Mondays at nine.", why: "This states a property of the source." }], residue_count: 2,
  coverage: { sentences_read: 4, sentences_total: 4, input_truncated: false }, pin: { source_url: "Bay Courier standards page", retrieved: "October 8, 2026" }, limit: 200, truncated: false };
export const DEBT_OPEN = { ok: true, run: "RUN-2026-0042", found: true, open: true, context: { type: "project", id: PROJ_BIAS.id }, raised: "2026-10-09T00:00:00Z", observed: "2026-10-09T00:00:00Z",
  moved_basis: "a statement about the City Housing Department was added", lens_then: "41be" + "0".repeat(56) + "a2d0", lens_now: "9f3a" + "0".repeat(56) + "c07e", settled: { settled: false }, settlements: [], limit: 50, truncated: false };
export const DEBT_SETTLED = { ...DEBT_OPEN, open: false, settled: { settled: true, at: "2026-10-10T00:00:00Z", kind: "resolved", kind_state: "determined" },
  settlements: [{ seq: 1, kind: "resolved", at: "2026-10-10T00:00:00Z", actor: "member:mai", reason: "The new statement is about the Department's reports; this finding cites none.", by_run: null, lens_then: null, lens_now: null }] };
/* The bias sets `list` answers, in the owner's rows (retrieval R63): two offered, one adopted already, and a bundle of another type. */
export const BIAS_SETS = [
  { bundle_id: "BIAS-2026-0001-earlier", object_type: "bias", current_state: "proposed", title: "Earlier set: how we read the county", last_updated: "2026-10-01T10:00:00Z", bundle_sha: "a".repeat(64), route: null },
  { bundle_id: "BIAS-2026-0002-adopted", object_type: "bias", current_state: "adopted", title: "Already adopted", last_updated: "2026-09-01T10:00:00Z", bundle_sha: "b".repeat(64), route: null },
  { bundle_id: "STD-2026-0001-other", object_type: "standard", current_state: "proposed", title: "Not a bias set", last_updated: "2026-10-02T10:00:00Z", bundle_sha: "c".repeat(64), route: null },
  { bundle_id: "BIAS-2026-0004-second", object_type: "bias", current_state: "proposed", title: "Second offered set", last_updated: "2026-10-03T10:00:00Z", bundle_sha: "d".repeat(64), route: null },
];

export function biasTable(over = {}) {
  return {
    list: () => env({ bundles: [], limit: 50, cursor: null, total: 0 }),
    biasmanifest: (q) => env(q.scope === "project" ? (q.scopeId === PROJ_BIAS.id ? LENS_PROJECT : { ok: true, scope: "project", scope_id: q.scopeId, in_force: false, note: "none" }) : LENS_TEAM),
    projectlist: env({ ok: true, projects: [PROJ_BIAS] }),
    biasdebt: (q) => env(q.run === "RUN-2026-0042" ? DEBT_OPEN : { ok: true, run: q.run, found: false, note: "none" }),
    biasinhale: () => env(POLICY),
    promote: (q, b) => env({ ok: true, bundleId: "BIAS-2026-0003-lakeshore", revision: "c".repeat(64), state: b.meta.current_state }),
    biasadopt: (q, b) => env({ ok: true, bundle_id: b.bundleId, scope: b.scope || "instance", in_force: false, pins_proposed: true, adopted_by: "member:rosa" }),
    biasdebtresolve: (q, b) => env({ ok: true, run: b.run, settled: { settled: true, kind: "resolved" } }),
    entitybyalias: (q) => env({ ok: true, entities: q.alias === "City Housing Department" ? [{ entity_id: "ENT-2026-0007", label: "City Housing Department" }] : [] }),
    writinghelp: () => env({ ok: true, text: "We read it closely.", label: { kind: "machine", asked_by: "member:rosa" }, withheld: [], note: "" }),
    ...over,
  };
}
