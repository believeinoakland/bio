/* Where the platform keeps the team's room (runtime-limits R27, R28; fix round 7 G83, K4746, K4747, K4752, K4754).
 *
 * Cloudflare creates a record object wherever its first get() runs and never moves it afterwards, so every
 * place that names or obtains the team's room goes through this file: the hint (a plain-text binding,
 * STORE_LOCATION) is passed at every get(), and a generation (STORE_GENERATION) names a development copy's
 * new room without touching the old one. A hint is where the hosting platform runs the room, never a
 * jurisdiction (R25). Pure over `env`; nothing at load beyond the frozen list. */

export const STORE_HINTS = Object.freeze(["wnam", "enam", "sam", "weur", "eeur", "apac", "apac-ne", "apac-se", "oc", "afr", "me"]);

export const storeHint = (env) => {
  const v = env?.STORE_LOCATION;
  return typeof v === "string" && STORE_HINTS.includes(v) ? v : null;
};

/* The grammar is /^[1-9][0-9]*$/ (K4754): "02", "2.0" and " 2" are not a second room. 1 is the room as it
   always was; a number past a safe integer is no generation. */
export const storeGeneration = (env) => {
  const v = env?.STORE_GENERATION;
  if (typeof v !== "string" || !/^[1-9][0-9]*$/.test(v)) return 1;
  const n = Number(v);
  return Number.isSafeInteger(n) && n >= 2 ? n : 1;
};

/* The suffix is on the object's name only; the logical names (`bio`, `scratch`, a `store=` value, an R2 prefix) stay. */
const roomName = (env, name) => {
  const g = storeGeneration(env);
  return g === 1 ? name : `${name}~g${g}`;
};

export const storeId = (env, name) => env.STORE.idFromName(roomName(env, name));

export const storeStub = (env, name) => {
  const id = storeId(env, name);
  const hint = storeHint(env);
  return hint ? env.STORE.get(id, { locationHint: hint }) : env.STORE.get(id);
};
