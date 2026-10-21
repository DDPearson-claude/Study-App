import sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
W,H=A4
def text_pdf(txt,out):
    c=canvas.Canvas(out,pagesize=A4); y=H-50
    t=c.beginText(40,y); t.setFont('Helvetica',9); t.setLeading(12)
    for line in txt.split('\n'):
        t.textLine(line.encode('latin-1','replace').decode('latin-1'))
    c.drawText(t); c.save()
def sheet_pdf(img,txt,out):
    c=canvas.Canvas(out,pagesize=A4); ir=ImageReader(img); iw,ih=ir.getSize()
    s=min((W-40)/iw,(H-40)/ih); c.drawImage(ir,20,H-20-ih*s,iw*s,ih*s)
    t=c.beginText(20,H-20-ih*s-20); t.setFont('Helvetica',6); t.setTextRenderMode(3); t.setLeading(8)
    for line in txt.split('\n'): t.textLine(line)
    c.drawText(t); c.save()
if sys.argv[1]=='text': text_pdf(open(sys.argv[2],encoding='utf8').read(),sys.argv[3])
else: sheet_pdf(sys.argv[2],open(sys.argv[3],encoding='utf8').read(),sys.argv[4])
