/* capture-sources: the group's own hosts (`capture-sources/own-hosts.mjs`), tested at the module's interface
 * (build/requirements/capture-sources.md R65). The hosts below are this file's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isOwnHost } from "../../../src/capture-sources/own-hosts.mjs";

const OWN = ["plane.grp.example", ".acct.workers.dev"];

test("R65: isOwnHost is true exactly for an entry or a host under a suffix entry, case, port and trailing dot aside", () => {
  for (const host of ["plane.grp.example", "PLANE.GRP.EXAMPLE", "plane.grp.example.", "plane.grp.example:443", " Plane.Grp.Example ",
                      "agent.acct.workers.dev", "deep.agent.acct.workers.dev", "AGENT.ACCT.WORKERS.DEV:8443", "agent.acct.workers.dev."])
    assert.equal(isOwnHost(host, OWN), true, host);
  for (const host of ["grp.example", "x.plane.grp.example", "plane.grp.example.evil.example", "acct.workers.dev",
                      "agent.acct.workers.dev.evil.example", "other-acct.workers.dev", "workers.dev", "records.example.gov"])
    assert.equal(isOwnHost(host, OWN), false, host);
  /* An entry written with a capital or a trailing dot is the same host. */
  assert.equal(isOwnHost("plane.grp.example", ["Plane.Grp.Example."]), true);
  /* A bracketed IPv6 literal is compared whole. */
  assert.equal(isOwnHost("[::1]:8787", ["[::1]"]), true);
  assert.equal(isOwnHost("[::2]", ["[::1]"]), false);
});

test("R65: false for a host that is not a non-empty string and for an absent, empty or non-list ownHosts; never throws", () => {
  for (const host of [null, undefined, 7, "", "   ", {}, [], ":443"]) assert.equal(isOwnHost(host, OWN), false, String(host));
  for (const list of [undefined, null, [], "plane.grp.example", { 0: "plane.grp.example", length: 1 }, 5])
    assert.equal(isOwnHost("plane.grp.example", list), false, String(list));
  /* Entries that are not strings, or empty, stand for nothing; a bare "." is not every host. */
  assert.equal(isOwnHost("plane.grp.example", [null, 5, "", "  ", "."]), false);
  assert.equal(isOwnHost("plane.grp.example", [null, "plane.grp.example"]), true);
  const hostile = new Proxy([], { get() { throw new Error("boom"); } });
  assert.equal(isOwnHost("plane.grp.example", hostile), false);
  /* Pure: the same answer for the same inputs, and the list is not changed. */
  const list = [...OWN];
  assert.equal(isOwnHost("agent.acct.workers.dev", list), isOwnHost("agent.acct.workers.dev", list));
  assert.deepEqual(list, OWN);
});
