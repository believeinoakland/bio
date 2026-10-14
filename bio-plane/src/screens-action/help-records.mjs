/* How a records request works (registry screen `help-records`; screens-action R9; DEC-209 (5)), reached from `request`:
   what the office must do, the faster request where the group's places hold one (`profiles`' `view`), what a public
   portal shows, and what the group's Civicsmith does with the due date; its sources listed. No place is named in this
   screen's words (interface-shell R23): the laws and their windows are the profile's own, drawn as the record's data.
   Every function here is self-contained (interface-shell R21 (1)). */

export const helpRecords = Object.freeze({
  id: "help-records",

  reads: function () {
    return { profiles: { op: "profiles", empty: function () { return false; } } };
  },

  render: function (cs, view) {
    const must = cs.sec("screen.help-records.must", '<ul class="mk-list">' + [1, 2, 3, 4, 5, 6, 7].map(function (n) {
      return "<li>" + cs.w("screen.help-records.must." + n) + "</li>";
    }).join("") + "</ul>");
    const faster = cs.sec("screen.help-records.faster", cs.state("profiles", function (p) {
      const v = p && p.view ? p.view : {};
      const ds = (Array.isArray(v.deadlines) ? v.deadlines : []).filter(function (d) { return d && d.applies_to === "records_request" && d.citation; });
      if (!ds.length) return '<p class="cs-state" data-state="empty">' + cs.w("screen.help-records.nolaws") + "</p>";
      const days = function (d) { return (Number(d.amount) || 0) * (d.count === "business" ? 1.4 : 1); };
      const fastest = ds.slice().sort(function (a, b) { return days(a) - days(b); })[0];
      return cs.sheet(ds.map(function (d) {
        return cs.row("", cs.esc(d.citation) + " · " + cs.w("screen.request.window." + (d.count === "business" ? "business" : "calendar"), { n: String(d.amount) }),
          ds.length > 1 && d === fastest ? '<span class="meta">' + cs.w("screen.help-records.thefaster") + "</span>" : "", "");
      }).join("")) + (ds.length > 1 ? '<p class="mk-note">' + cs.w("screen.help-records.faster.when") + "</p>" : "");
    }));
    const portal = cs.sec("screen.help-records.portal", '<ul class="mk-list">' + [1, 2, 3].map(function (n) {
      return "<li>" + cs.w("screen.help-records.portal." + n) + "</li>";
    }).join("") + "</ul>");
    const does = cs.sec("screen.help-records.does", '<p class="mk-note">' + cs.w("screen.help-records.does.text") + "</p>");
    const sources = cs.sec("screen.help-records.sources", cs.state("profiles", function (p) {
      const v = p && p.view ? p.view : {};
      const cites = (Array.isArray(v.deadlines) ? v.deadlines : []).filter(function (d) { return d && d.applies_to === "records_request" && d.citation; })
        .flatMap(function (d) { return [d.citation].concat(d.extension && d.extension.citation ? [d.extension.citation] : []); });
      return cites.length ? '<p class="src">' + cs.esc(cites.filter(function (c, i) { return cites.indexOf(c) === i; }).join("; ")) + "</p>"
        : '<p class="cs-state" data-state="empty">' + cs.w("screen.help-records.nolaws") + "</p>";
    }));
    return cs.title(null) + must + faster + portal + does + sources;
  },

  acts: [],
});
