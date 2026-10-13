"""Render a design note to the HTML page shown to Bob. Needs the `markdown` package:
PYTHONPATH=<dir with markdown> python3 build_view.py [INVENTORY|ACTION-PLAN|MATRIX|DRAFTS|PATH|BIO_Action_v0_1|UX-ANSWERS]"""
import pathlib, re, sys, markdown

PAGES = {"INVENTORY": ("inventory.html", "Action Layer Inventory"),
         "ACTION-PLAN": ("action-plan.html", "The Action Plan"),
         "MATRIX": ("matrix.html", "Action Completeness Matrix"),
         "DRAFTS": ("drafts.html", "Action Requirement Drafts"),
         "PATH": ("path.html", "Acting on a Plan"),
         "BIO_Action_v0_1": ("action-home.html", "BIO Action v0.1"),
         "UX-ANSWERS": ("ux-answers.html", "Action UX Answers")}
here = pathlib.Path(__file__).parent
name = sys.argv[1] if len(sys.argv) > 1 else "INVENTORY"
out, title = PAGES[name]
src = ((here / "drafts" / "action-plans.md").read_text() + "\n\n" + (here / "drafts" / "deltas.md").read_text()
       + "\n\n" + (here / "drafts" / "tests.md").read_text()
       if name == "DRAFTS" else (here / f"{name}.md").read_text())
body = markdown.markdown(src, extensions=["tables"])

# The verdict column: a chip for each verdict's first bold phrase.
body = re.sub(r"<strong>(Gap[^<]*)</strong>", r'<strong class="v gap">\1</strong>', body)
body = re.sub(r"<strong>(Partly[^<]*)</strong>", r'<strong class="v part">\1</strong>', body)
body = re.sub(r"<strong>(Wiring)</strong>", r'<strong class="v wire">\1</strong>', body)
body = re.sub(r"<strong>(Designed)</strong>", r'<strong class="v design">\1</strong>', body)
body = re.sub(r"<strong>(Built)</strong>", r'<strong class="v ok">\1</strong>', body)
body = re.sub(r"<strong>(Covered[^<]*)</strong>", r'<strong class="v ok">\1</strong>', body)
# Every table scrolls in its own box on a narrow screen.
body = body.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>")
# A table of seven or more columns gets a wider measure.
body = re.sub(r'<table>(\s*<thead>\s*<tr>(?:\s*<th[^>]*>(?:(?!</th>).)*</th>){7,}\s*</tr>)', r'<table class="wide">\1', body, flags=re.S)
# The status paragraph becomes the lede.
body = body.replace("<p><strong>Status</strong> · ", '<p class="lede"><span class="eyebrow">Status</span> ', 1)

page = f"<title>{title}</title>\n" + """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<style>
/* One reading column; tables break out to a wider measure. Tokens from build/layers-view.html. */
:root{
  --bg:#F4F6F8; --panel:#FFFFFF; --ink:#18202B; --muted:#5B6676; --rule:#D8DEE6; --chip:#E9EEF3;
  --accent:#1D6A86;
  --ok:#2F6B3A; --ok-bg:#DCEEDD; --part:#8A5A12; --part-bg:#F5E6C8; --gap:#9A3B2E; --gap-bg:#F6E0DA;
  --serif:"Source Serif 4",Georgia,serif; --sans:"IBM Plex Sans",system-ui,sans-serif; --mono:"IBM Plex Mono",ui-monospace,monospace;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  color-scheme:dark; --bg:#11161D; --panel:#18202A; --ink:#E4E9EF; --muted:#9AA6B5; --rule:#2B3542; --chip:#222C38;
  --accent:#5FB3CF; --ok:#8FD19B; --ok-bg:#1C3822; --part:#E0B060; --part-bg:#43341A; --gap:#F09A86; --gap-bg:#472019;
}}
:root[data-theme="dark"]{
  color-scheme:dark; --bg:#11161D; --panel:#18202A; --ink:#E4E9EF; --muted:#9AA6B5; --rule:#2B3542; --chip:#222C38;
  --accent:#5FB3CF; --ok:#8FD19B; --ok-bg:#1C3822; --part:#E0B060; --part-bg:#43341A; --gap:#F09A86; --gap-bg:#472019;
}
body{background:var(--bg);color:var(--ink);font:15.5px/1.6 var(--sans)}
.wrap{max-width:1120px;margin:0 auto;padding-inline:16px;padding-block:32px 64px}
.wrap > *:not(.tw){max-width:74ch}
h1{font:600 clamp(28px,4vw,36px)/1.15 var(--serif);margin:0 0 12px;text-wrap:balance}
h2{font:600 22px/1.25 var(--serif);margin:44px 0 12px;padding-top:18px;border-top:1px solid var(--rule);text-wrap:balance}
p,ul,ol{margin:0 0 14px}
li{margin:0 0 8px}
li > ul{margin-top:8px}
a{color:var(--accent)}
code{font:0.88em var(--mono);background:var(--chip);padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
.lede{color:var(--muted);font-size:14.5px;background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:14px 16px}
.eyebrow{display:block;font:500 11.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}
.tw{overflow-x:auto;margin:6px 0 20px;border:1px solid var(--rule);border-radius:8px;background:var(--panel)}
table{border-collapse:collapse;width:100%;min-width:760px;font-size:13.5px;line-height:1.5}
th{font:500 11.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 12px;border-bottom:1px solid var(--rule);background:color-mix(in srgb,var(--chip) 60%,var(--panel))}
td{padding:10px 12px;border-bottom:1px solid var(--rule);vertical-align:top}
tr:last-child td{border-bottom:0}
td:first-child{min-width:150px}
.v{display:inline-block;font:500 12px/1.3 var(--mono);padding:3px 7px;border-radius:5px;margin-bottom:4px}
.v.gap{color:var(--gap);background:var(--gap-bg)}
.v.part{color:var(--part);background:var(--part-bg)}
.v.ok{color:var(--ok);background:var(--ok-bg)}
.v.wire{color:var(--part);background:var(--part-bg);outline:1px dashed var(--part)}
.v.design{color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,var(--panel))}
table.wide{min-width:1180px}
</style>
<div class="wrap">
""" + body + "\n</div>\n"
(here / out).write_text(page)
print("wrote", len(page), "bytes")
