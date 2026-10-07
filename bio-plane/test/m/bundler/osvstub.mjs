/* Preloaded (`node --import`) into `release-advisories.mjs` under test (R29), or installed in-process by
 * `installOsv`: a stand-in for OSV (`api.osv.dev`), so no test reaches the real database. Every request is
 * appended to `$OSV_STUB_LOG` (or the in-process log) as `{method, path, body}`.
 *
 * Scenario: { vulns: { "<ecosystem>|<name>|<version>": [<id>, …] }, details: { <id>: <OSV vuln> },
 *             pages: { "<ecosystem>|<name>|<version>": [[<id>, …], …] }  (further pages, behind next_page_token),
 *             unreachable?: true, batchStatus?: <status>, batchShort?: true, entryUnreadable?: [<key>],
 *             detailFail?: [<id>], pageFail?: true } */
import { readFileSync, appendFileSync } from "node:fs";

export function osvFetch(S, log) {
  S.vulns ||= {}; S.details ||= {}; S.pages ||= {};
  const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
  const key = (q) => `${q.package.ecosystem}|${q.package.name}|${q.version}`;
  return async (input, init = {}) => {
    const url = new URL(String(input instanceof Request ? input.url : input));
    const method = (init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;
    log({ method, host: url.host, path: url.pathname, body });
    if (url.host !== "api.osv.dev") throw new TypeError(`osvstub: no route to ${url}`);
    if (S.unreachable) throw new TypeError("fetch failed");
    if (url.pathname === "/v1/querybatch") {
      if (S.batchStatus) return json(S.batchStatus, { code: 13, message: "internal" });
      const results = body.queries.map((q) => {
        const k = key(q);
        if ((S.entryUnreadable || []).includes(k)) return { vulns: "not a list" };
        const ids = S.vulns[k] || [];
        const r = ids.length ? { vulns: ids.map((id) => ({ id, modified: "2026-01-01T00:00:00Z" })) } : {};
        if ((S.pages[k] || []).length) r.next_page_token = `${k}#1`;
        return r;
      });
      return json(200, { results: S.batchShort ? results.slice(1) : results });
    }
    if (url.pathname === "/v1/query") {
      if (S.pageFail) return json(500, {});
      const [k, n] = body.page_token.split("#");
      const page = (S.pages[k] || [])[Number(n) - 1] || [];
      const r = { vulns: page.map((id) => ({ id })) };
      if (Number(n) < (S.pages[k] || []).length) r.next_page_token = `${k}#${Number(n) + 1}`;
      return json(200, r);
    }
    const m = url.pathname.match(/^\/v1\/vulns\/(.+)$/);
    if (m && method === "GET") {
      const id = decodeURIComponent(m[1]);
      if ((S.detailFail || []).includes(id) || !S.details[id]) return json(404, { code: 5, message: "Bug not found." });
      return json(200, S.details[id]);
    }
    return json(404, {});
  };
}

if (process.env.OSV_STUB) {
  const S = JSON.parse(readFileSync(process.env.OSV_STUB, "utf8"));
  globalThis.fetch = osvFetch(S, (e) => { if (process.env.OSV_STUB_LOG) appendFileSync(process.env.OSV_STUB_LOG, JSON.stringify(e) + "\n"); });
}
