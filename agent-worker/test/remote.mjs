/* R109, R110 — THE `REMOTE` AND `CHECKS` BINDINGS AS THE SUITES STAND THEM UP.
 *
 * `REMOTE` is a Durable Object namespace that names instances (the member's, or `version`) and answers the one route the
 * readiness gate asks of the remote class (`GET /remote/version`) itself, passing every other request to the recording
 * namespace it wraps. The wrapped namespace sees the conversation's and the sign-in's requests only, never the gate's, so a
 * suite that counts the instances named or the frames sent counts what the member's act did.
 *
 * `CHECKS` stands for this member's own `CheckRecord` (BOB's K3693): `GET /check` states `{ok, checked, version}`; with
 * `passed: false` the member's check has not passed, and `checkedVersion` is the version it passed at.
 * `remoteBindings(ns, opts)` is both, to be spread into an `env`. */
export const REMOTE_VERSION = "remote-test-1";

export function gated(ns, { version = REMOTE_VERSION } = {}) {
  return {
    idFromName: (name) => ({ name, inner: null }),
    newUniqueId: () => ({ name: "<unique>", inner: null }),
    get: (id) => ({
      fetch: async (url, init) => {
        const path = new URL(String(url)).pathname;
        if (path === "/remote/version") return Response.json({ ok: true, name: "agent-runner", version, capabilities: ["image"] });
        id.inner ??= ns.idFromName(id.name);
        return ns.get(id.inner).fetch(url, init);
      },
    }),
  };
}

export function checks({ version = REMOTE_VERSION, passed = true, checkedVersion = version } = {}) {
  const recorded = [];
  return { recorded, idFromName: (name) => ({ name }),
    get: (id) => ({ fetch: async (url, init = {}) => {
      if ((init.method ?? "GET") === "POST") { recorded.push({ instance: id.name, body: JSON.parse(init.body) }); return Response.json({ ok: true }); }
      return Response.json({ ok: true, checked: passed, version: passed ? checkedVersion : null });
    } }) };
}

export const remoteBindings = (ns, opts = {}) => ({ REMOTE: gated(ns, opts), CHECKS: checks(opts) });
