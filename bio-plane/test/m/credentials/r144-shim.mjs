/* TEMPORARY (T49-3, CREDENTIALS #16): membership's R144 (`founderHandleSet`, `founderHandle`, and the founder's handle in
   `sessionRights("admin")`) is membership's job's (T49-1) and not yet merged into this branch. Until the tranche branch
   is merged here after BOB's CHANGE, this stands in for it in the test world so this module's own acts can be run; it
   is deleted in the same commit that merges the real one. It judges as R144 states (R16's pattern, `admin` and every
   member's handle taken, a second set HANDLE_FIXED) and is held in memory only. */
export function installFounderHandle(m) {
  if (typeof m.founderHandleSet === "function") return false;
  let held = null;
  m.founderHandle = () => held;
  m.founderHandleSet = ({ handle = null, by = null } = {}) => {
    if (by !== "admin" && by !== "member:admin") return { ok: false, reason: "FOUNDER_HANDLE_NOT_FOUNDER" };
    if (held !== null) return { ok: false, reason: "HANDLE_FIXED" };
    const h = typeof handle === "string" ? handle : "";
    if (!h) return { ok: false, reason: "NO_HANDLE" };
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(h)) return { ok: false, reason: "BAD_HANDLE" };
    if (h === "admin" || m.memberByHandle(h)) return { ok: false, reason: "HANDLE_TAKEN", handle: h };
    held = h;
    return { ok: true, handle: h };
  };
  const rights = m.sessionRights.bind(m);
  m.sessionRights = (role) => { const r = rights(role); return role === "admin" ? { ...r, handle: held } : r; };
  return true;
}
