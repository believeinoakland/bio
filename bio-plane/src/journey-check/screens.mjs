/* journey-check R1 (b), R2: the registry's screens, read from the design stream's registry file (data, never imported),
   and whether the interface drew one. `site` (civicsmith.org, not built in T47, N1011) and the treatments DEC-214 (4)
   names are excepted (K3137); `install` and `update` are the installer's own pages, walked in the local arm's journey. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const REGISTRY_FILE = join(ROOT, "docs", "development", "ux-substrate", "screens", "registry.json");
export const EXCEPTED = Object.freeze(["site", "dash-home", "dash-action", "dash-project"]);
export const INSTALLER_SCREENS = Object.freeze(["install", "update"]);

export function registryScreens(file = REGISTRY_FILE) {
  const r = JSON.parse(readFileSync(file, "utf8"));
  return r.screens.map((s) => ({ id: s.id, frame: s.frame, name: s.name }));
}

/* The screens a sweep opens on the copy: every registry screen but the excepted and the installer's. */
export function sweepScreens(file) {
  return registryScreens(file).filter((s) => !EXCEPTED.includes(s.id) && !INSTALLER_SCREENS.includes(s.id));
}

/* The address a screen opens at (interface-shell R9; the dock's panel is drawn over its question). */
export const addressOf = (id) => (id === "home" ? "/app" : `/app/${id}`);

/* Whether the page drew screen `id`, read from the page as it stands: `{drawn, why}`. When the frame marks the screen it
   drew (`data-screen`), that mark decides. Otherwise the shell's own fallbacks are read: a failed draw, a draw still
   loading, the "Nothing here" it draws for a screen it does not hold (its path a single unlinked step and one empty
   state), or the page saying a place comes later (a title and one empty state). */
export async function drawnState(page, id) {
  return page.evaluate((id) => {
    const marked = document.querySelector("[data-screen]");
    if (marked) {
      const at = document.querySelector(`[data-screen="${CSS.escape(id)}"]`);
      return at ? { drawn: true, why: "marked" } : { drawn: false, why: `the frame marks ${marked.getAttribute("data-screen")}, not ${id}` };
    }
    const main = document.getElementById("cs-main") || document.querySelector("main") || document.body;
    if (!main || !main.textContent.trim()) return { drawn: false, why: "the page is blank" };
    if (main.querySelector('[data-state="failed"]')) return { drawn: false, why: "the screen failed to draw" };
    if (main.querySelector('[data-state="loading"]')) return { drawn: false, why: "the screen is still loading" };
    const kids = [...main.children].filter((k) => k.textContent.trim());
    const crumbs = main.querySelector("nav.cs-crumbs");
    const steps = crumbs ? crumbs.querySelectorAll("li").length : 0;
    const empty = (k) => k.matches('.cs-state[data-state="empty"]');
    if (kids.length === 2 && kids[0] === crumbs && steps === 1 && empty(kids[1]))
      return { drawn: false, why: "the shell drew \"Nothing here\": it holds no such screen" };
    if (kids.length === 3 && kids[0] === crumbs && kids[1].matches("h1.t-title") && empty(kids[2]))
      return { drawn: false, why: "the shell says this place comes later" };
    return { drawn: true, why: "drawn" };
  }, id);
}
