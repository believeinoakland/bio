/* journey-check R11: the stub city site the local arm's copy captures by address. It answers the copy's own outbound
   requests to `CITY_ORIGIN` (local.mjs routes them here) with a small public notice, as a council's site serves one;
   any other path answers 404 as a site does. Its words are a fixture, read by the walk only to find them again in the
   held document (R9 step 7). */
export const CITY_ORIGIN = "https://www.lakeshore-city.example";
export const NOTICE_PATH = "/housing/notices/2026-118";
export const NOTICE_ADDRESS = CITY_ORIGIN + NOTICE_PATH;
/* The passage the walk finds in the held notice (R9 step 7) and cites (step 8). */
export const NOTICE_PASSAGE = "The landlord must repair the roof of 14 Lakeshore Row within 28 days of this notice.";

/* The reading the walk writes as its own on the notice's question (R9 step 12): the notice, put as a member puts it. */
export const NOTICE_READING = "The landlord must repair the roof within 28 days of the city's notice 2026-118.";

/* R16: a second notice, for the question the walk answers without the assistant (heating, flat 6). */
export const HEAT_PATH = "/housing/notices/2026-131";
export const HEAT_ADDRESS = CITY_ORIGIN + HEAT_PATH;
export const HEAT_PASSAGE = "The landlord must restore heating to flat 6 of 14 Lakeshore Row within 7 days of this notice.";
export const HEAT_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Housing notice 2026-131: heating order, 14 Lakeshore Row</title></head>
<body><main><h1>Housing notice 2026-131</h1>
<p>Issued by the City of Lakeshore housing department on 5 October 2026, after tenants of flat 6 reported no heating for nine days.</p>
<p>${HEAT_PASSAGE}</p>
<p>If the heating is not restored in that time, the department may carry out the work itself and recover the cost from the landlord.</p>
</main></body></html>
`;

export const NOTICE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Housing notice 2026-118: repair order, 14 Lakeshore Row</title></head>
<body><main><h1>Housing notice 2026-118</h1>
<p>Issued by the City of Lakeshore housing department on 2 October 2026, after an inspection of 14 Lakeshore Row
prompted by tenants' reports of water coming through the ceilings of flats 4 and 6.</p>
<p>${NOTICE_PASSAGE}</p>
<p>If the repair is not made in that time, the department may carry it out itself and recover the cost from the landlord.</p>
</main></body></html>
`;

/* The answer to one request of the copy to the city's site. */
export function cityAnswer(req) {
  const u = new URL(req.url);
  const html = u.pathname === NOTICE_PATH ? NOTICE_HTML : u.pathname === HEAT_PATH ? HEAT_HTML : null;
  if (html && (req.method === "GET" || req.method === "HEAD"))
    return new Response(req.method === "HEAD" ? null : html, { status: 200, headers: { "content-type": "text/html; charset=utf-8",
      "last-modified": "Fri, 02 Oct 2026 09:00:00 GMT" } });
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain" } });
}
