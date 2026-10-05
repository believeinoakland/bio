// @ts-check
/* connection-grammar (layer 1; T33-5, K1470, K1486, K1487): the one shape every relationship the record holds is
   presented in, the registry of who owns each kind and what members call it, and the bounds and rules of walking
   them. It holds no relationship and walks nothing (R16). This is the module's one entry; the default registry is
   the one the plane wires (R5), and each part is in its own file. */
import { createRegistry } from './registry.mjs';

export { CLASSES, DECLARED_LABEL, HUNCH_LABEL, LOWEST_GRADE, derivedId, isRecordId } from './shape.mjs';
export { FORBIDDEN_WORDS, createRegistry } from './registry.mjs';
export { BOUNDS, depthOf, exhausted, EXHAUSTION_REASONS } from './bounds.mjs';
export { chainGrade, chainLabel, orderPaths } from './walk.mjs';
export { ownerConformance } from './conformance.mjs';

/** The default registry, which the plane wires and every owner registers into at load (R5). */
export const defaultRegistry = createRegistry();
export const { registerOwner, owners, kindOf, checkConnection, neighbours } = defaultRegistry;
