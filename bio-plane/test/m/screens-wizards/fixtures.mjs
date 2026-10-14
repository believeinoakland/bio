/* The fake plane's answers, each in its owner's documented shape (wizard-scripts R3–R11, R15, R26; project-roster R26),
   wrapped as the door wraps them (`answer-envelope` R1: `{ok: true, result}`). */
import { CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";

export const env = (result) => ({ ok: true, result, store: "bio", tokenClass: "member" });
export const refuse = (code, extra = {}) => env({ ok: false, reason: code, code, translation: `translated ${code}`, ...extra });

export const VOCAB = ["contribute", "publish", "create_projects"];
export const ADMIN = Object.freeze({ member: "rosa", handle: "rosa", administer: true, capabilities: VOCAB, vocabulary: VOCAB, tokenClass: "session" });
export const MEMBER = Object.freeze({ member: "mai", handle: "mai", administer: false, capabilities: ["contribute"], vocabulary: VOCAB, tokenClass: "session" });
export const READER = Object.freeze({ member: "teo", handle: "teo", administer: false, capabilities: [], vocabulary: VOCAB, tokenClass: "session" });

/* Civicsmith's "Get a record" and "Welcome a new member", as the library carries them */
const lib = (id) => CIVICSMITH_LIBRARY.find((s) => s.id === id);
export const GET_RECORD = lib("WIZ-cb0ad18a17a04233");
export const WELCOME_SCRIPT = lib("WIZ-7db08189cc0e58c3");
export const FIRSTQ_SCRIPT = lib("WIZ-86b7f4007e3b0e3c");

export const CIV = { id: GET_RECORD.id, origin: "civicsmith", name: GET_RECORD.name, scope: "group", required: false, based_on: null,
  versions: [{ id: `${GET_RECORD.id}@1`, version: 1, state: "approved", author: { name: "civicsmith" }, contributors: [],
    approved: { by: { name: "Bob" }, at: "2026-10-06" }, created_at: "2026-10-06", broken: false, use: { start: 20, finish: 14 } }] };
export const COPY = { id: "WIZ-0000000000000aaa", origin: "group", name: "Get a record, Oakland style", scope: { project: "P1" }, required: false,
  based_on: { version: `${GET_RECORD.id}@1`, name: "Get a record" },
  versions: [
    { id: "WIZ-0000000000000aaa@2", version: 2, state: "draft", author: { id: "mai", name: "mai" }, contributors: [], approved: null, created_at: "2026-10-12", broken: false, use: { start: 0, finish: 0 } },
    { id: "WIZ-0000000000000aaa@1", version: 1, state: "approved", author: { id: "dev", name: "dev" }, contributors: [], approved: { by: { id: "rosa", name: "rosa" }, at: "2026-10-10" }, created_at: "2026-10-09", broken: false, use: { start: 5, finish: 3 } },
  ] };
export const SUBMITTED = { id: "WIZ-0000000000000bbb", origin: "group", name: "Our council-meeting checklist", scope: { project: "P1" }, required: false, based_on: null,
  versions: [{ id: "WIZ-0000000000000bbb@1", version: 1, state: "submitted", author: { id: "dev", name: "dev" }, contributors: [], approved: null, created_at: "2026-10-11", broken: false, use: { start: 0, finish: 0 } }] };
export const RETIRED = { id: "WIZ-0000000000000ccc", origin: "group", name: "Old checklist", scope: "group", required: false, based_on: null,
  widened: { by: { id: "rosa" }, at: "2026-10-01" }, retired: { by: { id: "rosa" }, at: "2026-10-12", reason: "replaced" },
  versions: [{ id: "WIZ-0000000000000ccc@1", version: 1, state: "approved", author: { id: "dev", name: "dev" }, contributors: [], approved: { by: { id: "rosa", name: "rosa" } }, created_at: "2026-10-01", broken: false, use: { start: 1, finish: 1 } }] };

export const LIST = { ok: true, state: "offered", scripts: [CIV, COPY, SUBMITTED], truncated: false };
export const UPDATES = { ok: true, entries: [{ copy: COPY.id, copy_version: "WIZ-0000000000000aaa@2", name: COPY.name, project: "P1", base: GET_RECORD.id,
  base_name: GET_RECORD.name, based_on: `${GET_RECORD.id}@1`, base_version: `${GET_RECORD.id}@2`, found_at: "2026-10-13", recipients: ["mai"],
  steps: { copy: [{ screen: "finder", act: "search", what: "Look for it", why: "It may be public" }], base: [{ screen: "finder", act: "search", what: "Look first", why: "It may be public" }] } }],
  cursor: null, truncated: false };
export const PROJECTS = { ok: true, projects: [{ id: "P1", name: "Pothole repairs", stage: null }, { id: "P2", name: "The Coliseum lease", stage: "open" }], count: 2, limit: 200, truncated: false };
export const PROPOSALS = { ok: true, state: "proposed", truncated: false,
  proposals: [{ id: "WZP-0000000000000001", project: "P1", script: null, steps: [{ screen: "finder", act: "search", what: "Search", why: "First" }], sha: "x", why: "Members keep missing the search", at: "2026-10-12", label: { kind: "machine" } }] };
export const DRAFTS = { ok: true, state: "draft", truncated: false, scripts: [{ ...COPY, versions: [COPY.versions[0]] }] };

export const COPY_STEPS = [
  { screen: "finder", act: "search", what: "Look for it", why: "It may be public" },
  { screen: "request", act: "actioncreate", what: "Ask for it", why: "It is not public" },
  { screen: "request", act: null, what: "", why: "" },
];

/** `wizardread` for a version id: its steps, as R10 answers them. */
export function read(q) {
  const vid = q.version;
  if (vid === `${GET_RECORD.id}@1`) return env({ ok: true, script: { id: GET_RECORD.id, origin: "civicsmith", name: GET_RECORD.name }, version: { id: vid, state: "approved", steps: GET_RECORD.steps } });
  if (vid && vid.startsWith(COPY.id)) return env({ ok: true, script: { id: COPY.id, origin: "group", name: COPY.name }, version: { id: vid, state: vid.endsWith("@2") ? "draft" : "approved", steps: COPY_STEPS } });
  return refuse("NO_SUCH_WIZARD");
}

/** The plane for the library screen, as `me` reads it. */
export function libraryTable(over = {}) {
  return {
    wizards: (q) => env(q.state === "proposed" ? PROPOSALS : q.state === "draft" ? DRAFTS : q.state === "retired" ? { ok: true, state: "retired", scripts: [RETIRED], truncated: false } : LIST),
    baseupdates: env(UPDATES),
    projectlist: env(PROJECTS),
    wizardread: (q) => read(q),
    wizarddraft: env({ ok: true, script: "WIZ-0000000000000ddd", version: "WIZ-0000000000000ddd@1", sha: "s", state: "draft" }),
    wizardrevise: env({ ok: true }),
    wizardsubmit: env({ ok: true }),
    wizardapprove: env({ ok: true }),
    wizardretire: env({ ok: true }),
    ...over,
  };
}
