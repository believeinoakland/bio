import random, sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
random.seed(7)
words = "the council approved budget amendment ordinance resolution district member public comment housing transit zoning permit hearing minutes agenda motion second vote carried".split()
c = canvas.Canvas(sys.argv[1], pagesize=letter)
for p in range(300):
    c.setFont("Helvetica", 10)
    y = 750
    c.drawString(40, 770, f"Page {p+1} of 300")
    for l in range(62):
        c.drawString(40, y, " ".join(random.choice(words) for _ in range(14))); y -= 11.5
    c.showPage()
c.save()
