/* A record's title as its document names it (screens-daily R26; K3254), a screen part (interface-shell R21, K3002) handed to
   `find-in` as `view.parts.frontTitle`. `frontTitle(image)` answers the `title` of the front matter of the `bundle.md` an
   `image` read answers, or the `objective` of a project started before its title was written (R25), else `null`: a record
   with no title is never named by its address. Self-contained: it refers only to its parameter. */

export function frontTitle(image) {
  const text = image && typeof image === "object" && typeof image["bundle.md"] === "string" ? image["bundle.md"] : "";
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const field = function (name) {
    const line = new RegExp("^" + name + ":[ \\t]*(.*)$", "m").exec(m[1]);
    if (!line) return null;
    let v = line[1].trim();
    if (v.charAt(0) === '"') { try { v = JSON.parse(v); } catch (e) { v = v.replace(/^"|"$/g, ""); } }
    else if (v.charAt(0) === "'") v = v.replace(/^'|'$/g, "").replace(/''/g, "'");
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  return field("title") || field("objective");
}
