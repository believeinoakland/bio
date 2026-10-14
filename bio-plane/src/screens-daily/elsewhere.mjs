/* Where else to go (registry screen `elsewhere`, Home › Where else to go; screens-daily R15, R16, R21; N847; DEC-227).
   Where a member is sent when what she needs is a matter hers alone: the places her group's place lists, read from
   `startfrom`'s `elsewhere` route (`wizard-scripts` R37), each kind under its heading in DEC-227's order, each place with
   what it does, how to reach it and where that came from. The record's data (names, sentences, addresses) is drawn as
   data, HTML-escaped. Opening it records nothing and tells nobody: its only read is `startfrom`, it has no acts, and it
   sends no `wizardprogress` (R16). Every function is self-contained (interface-shell R21 (1)). */

export const elsewhere = Object.freeze({
  id: "elsewhere",

  reads: function () {
    return { door: { op: "startfrom" } };
  },

  render: function (cs, view) {
    // DEC-227's order, this module's data.
    const KINDS = ["legalaid", "selfhelp", "service", "agency", "representative", "tipline"];
    const HOW = ["phone", "web", "email", "address", "mail"];
    const head = cs.title(cs.w("elsewhere.title"), {}) + '<p class="mk-sub">' + cs.w("elsewhere.says") + "</p>"
      + '<p class="mk-note">' + cs.w("elsewhere.records_nothing") + "</p>";
    const back = '<p class="mk-acts"><a class="cs-btn" data-tone="quiet" data-nav href="/app">' + cs.w("elsewhere.back") + "</a></p>";
    const danger = '<p class="mk-note">' + cs.w("elsewhere.danger") + "</p>";

    // A web value is an outside link; any other value is the record's text.
    const reach = function (c) {
      const how = String(c && c.how || "");
      const value = String(c && c.value !== undefined && c.value !== null ? c.value : "");
      if (HOW.indexOf(how) < 0 || !value) return "";
      let v = cs.esc(value);
      if (how === "web") {
        const href = /^https?:\/\//i.test(value) ? value : /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value) ? "https://" + value : null;
        if (href) v = '<a href="' + cs.esc(href) + '" target="_blank" rel="noopener noreferrer">' + cs.esc(value) + "</a>";
      }
      return '<span><span class="muted">' + cs.w("elsewhere.reach." + how) + "</span> " + v + "</span>";
    };
    const pointerRow = function (p) {
      const contacts = (Array.isArray(p.contacts) ? p.contacts : []).map(reach).filter(Boolean).join(" · ");
      const day = cs.date(String(p.basis || ""));
      const source = p.source ? '<span class="muted">' + cs.w("elsewhere.source", { source: String(p.source), date: { html: day } }) + "</span>" : "";
      return cs.row("", "<b>" + cs.esc(String(p.name || "")) + "</b>" + (p.does ? '<span class="meta">' + cs.esc(String(p.does)) + "</span>" : "")
        + (contacts ? '<span class="meta">' + contacts + "</span>" : ""), source, "");
    };

    const body = cs.state("door", function (v) {
      const routes = Array.isArray(v && v.routes) ? v.routes : [];
      const route = routes.filter(function (r) { return r && r.route === "elsewhere"; })[0];
      const pointer = route && route.pointer && typeof route.pointer === "object" && !Array.isArray(route.pointer) ? route.pointer : null;
      // A pointer of null is a read that could not be made, never "nothing listed" (interface-shell R10).
      if (!pointer) return cs.state({ state: "failed", refusal: null }, null);
      const places = Array.isArray(pointer.places) ? pointer.places.map(String) : [];
      const pointers = Array.isArray(pointer.pointers) ? pointer.pointers.filter(function (p) { return p && typeof p === "object"; }) : [];
      if (!places.length) return cs.sec("elsewhere.none.head", '<p class="mk-note">' + cs.w("elsewhere.none.noplace") + "</p>" + danger);
      const held = KINDS.filter(function (k) { return pointers.some(function (p) { return p.kind === k; }); });
      if (!held.length) return cs.sec("elsewhere.none.head", '<p class="mk-note">' + cs.w("elsewhere.none.says", { place: places.join(", ") }) + "</p>" + danger);
      return held.map(function (k) {
        return cs.sec("elsewhere.kind." + k, cs.sheet(pointers.filter(function (p) { return p.kind === k; }).map(pointerRow).join("")), { help: "elsewhere.kind." + k + "_says" });
      }).join("");
    });
    return head + body + back;
  },

  acts: [],
});
