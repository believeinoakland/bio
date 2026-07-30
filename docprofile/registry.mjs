/* The registry, in priority order. Most specific first; the first CERTAIN
   detection wins and the conservative handler is last because it never matches
   and is only ever reached by falling through.

   Adding a stack means adding a file and a line here, which is the whole point of
   the exercise: the alternative was another branch inside the capture path. */
import { register } from "./index.mjs";
import aspnetWebforms from "./handlers/aspnet-webforms.mjs";
import wordpress from "./handlers/wordpress.mjs";
import clientRendered from "./handlers/client-rendered.mjs";
import conservative from "./handlers/conservative.mjs";

/* client_rendered goes FIRST. A shell can also be served by ASP.NET or WordPress,
   and if either of those matched first the document would be profiled as a page
   with content when it has none, which is the one failure that is silent. */
register(clientRendered);
register(aspnetWebforms);
register(wordpress);
register(conservative);

export { aspnetWebforms, wordpress, clientRendered, conservative };
export * from "./index.mjs";
export * from "./monitoring.mjs";
