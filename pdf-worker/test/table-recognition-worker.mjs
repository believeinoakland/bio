/* CPDF-18 — a throwaway workerd entry for the table-recognition MEASUREMENT.
 * `pagepixels-worker.mjs`'s pattern: it exists so the candidate runs INSIDE
 * WORKERD, the runtime the GO/NO-GO is about, rather than only in node. It is
 * NOT the member's surface and no route is added to `src/index.mjs`. Imported
 * only by `table-recognition.probe.mjs`, which bundles it into a temp dir. */
if (typeof Math.sumPrecise !== "function") {
  Math.sumPrecise = (values) => { let s = 0; for (const v of values) s += v; return s; };
}
import { getDocumentProxy } from "unpdf";
import { recogniseTables } from "./table-candidate.mjs";

export async function tablesOnPage(bytes, pageIdx) {
  const pdf = await getDocumentProxy(bytes);
  const page = await pdf.getPage(pageIdx + 1);
  const tc = await page.getTextContent();
  const items = tc.items.filter((i) => typeof i.str === "string")
    .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width }));
  return { items: items.length, tables: recogniseTables(items, pageIdx) };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== "/tables") return new Response("not found", { status: 404 });
    const page = Number(url.searchParams.get("page") ?? "0");
    const bytes = new Uint8Array(await request.arrayBuffer());
    try {
      return Response.json({ ok: true, ...(await tablesOnPage(bytes, page)) });
    } catch (e) {
      return Response.json({ ok: false, reason: "THREW", message: String(e && e.message || e) }, { status: 500 });
    }
  },
};
