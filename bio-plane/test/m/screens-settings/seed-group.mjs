/* The seeds of the `group`, `group-identity` and `translations` tests over the world (store-request's `storeWorld`): what no act can make. */

/** The record's size, which the platform states and no act sets (the world's storage states 0): the world's storage stating `bytes`
 *  (a number, or null for a storage that states none). The real `stats` then answers it as `dbBytes` to the founder. */
export function sized(w, bytes) {
  Object.defineProperty(w.sql, "databaseSize", { get: () => bytes, enumerable: true, configurable: true });
  return w;
}

/** `stats` answers a founder always carry `dbBytes` (a number, or null): these two answers are what the owner never gives and the screen still
 *  has to read as it does (an answer without the key; a size that is not a number). */
export const STATS_WITHOUT_SIZE = { stats: { ok: true, result: { documents: 12 }, store: "bio", tokenClass: "member" } };
export const STATS_NOT_A_NUMBER = { stats: { ok: true, result: { documents: 12, dbBytes: "big" }, store: "bio", tokenClass: "member" } };
