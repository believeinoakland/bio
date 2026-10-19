/* op-grades' tests: the ops of other modules, read from their owners' declaration (K3268, BOB K4069), never typed here.
   `OP_FAMILIES` in op-declarations is the product's declaration of each owner's ops, by kind. A test names a requirement's
   ops by intersecting the owners' declared ops with the op-grades table that grades them (this module's own data). */
import { OP_FAMILIES } from "../../../src/op-declarations/index.mjs";

const FIELDS = ["kinds", "acts", "proposals", "reads", "extra"];

/** Every op the named owners declare, in declaration order, without repeats. */
export const declaredOps = (...owners) => [...new Set(owners.flatMap((owner) => {
  const family = OP_FAMILIES[owner];
  if (!family) throw new Error(`op-declarations declares no family for ${owner}`);
  return FIELDS.flatMap((field) => {
    const v = family[field];
    return !v ? [] : Array.isArray(v) ? v : Object.keys(v);
  });
}))];
