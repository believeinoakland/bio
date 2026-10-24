/* R45: which of the scopes an install needs the permission the founder granted does not carry. */

/* `granted` is the token response's space-separated `scope`; `needed` the scopes asked. An answer that states no scope is not
   evidence of a missing one (R20 reads the Containers API in that case), so it names none. */
export function missingScopes(granted, needed) {
  if (typeof granted !== "string" || !granted.trim()) return [];
  const held = new Set(granted.split(/\s+/).filter(Boolean));
  return (needed || []).filter((s) => !held.has(s));
}
