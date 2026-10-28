# Test-side only, through LibreOffice's own UNO bridge:
#   macro_doc.py author <profile> <marker> <out.odt|out.ods>  a document whose open event runs a Basic macro writing <marker>
#     (OpenDocument: the format LibreOffice saves a Basic macro in; .doc and .xls drop it)
#   macro_doc.py run <profile> <doc>                           the control: opens <doc> and runs its macro explicitly
import sys, time, subprocess, os, uno
from com.sun.star.beans import PropertyValue

mode, prof = sys.argv[1], sys.argv[2]
pipe = 'rcmacro%d' % os.getpid()
office = subprocess.Popen(['soffice', f'-env:UserInstallation=file://{prof}', '--headless', '--norestore',
                           f'--accept=pipe,name={pipe};urp;'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
ctx = None
for _ in range(240):
    try:
        ctx = resolver.resolve(f'uno:pipe,name={pipe};urp;StarOffice.ComponentContext'); break
    except Exception:
        time.sleep(0.5)
if ctx is None:
    office.kill(); raise SystemExit('LibreOffice did not start')
desk = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)

def pv(n, v):
    x = PropertyValue(); x.Name = n; x.Value = v; return x

SCRIPT = 'vnd.sun.star.script:Standard.Module1.Mark?language=Basic&location=document'
try:
    if mode == 'author':
        marker, out = sys.argv[3], sys.argv[4]
        calc = out.endswith('.ods')
        d = desk.loadComponentFromURL('private:factory/scalc' if calc else 'private:factory/swriter', '_blank', 0, (pv('Hidden', True),))
        if calc:
            d.Sheets.getByIndex(0).getCellByPosition(0, 0).setString('A document with a macro')
        else:
            d.Text.setString('A document with a macro')
        libs = d.BasicLibraries
        if not libs.hasByName('Standard'):
            libs.createLibrary('Standard')
        lib = libs.getByName('Standard')
        code = f'Sub Mark\n  Dim n As Integer\n  n = FreeFile\n  Open "{marker}" For Output As #n\n  Print #n, "ran"\n  Close #n\nEnd Sub\n'
        (lib.replaceByName if lib.hasByName('Module1') else lib.insertByName)('Module1', code)
        ev = (pv('EventType', 'Script'), pv('Script', SCRIPT))
        uno.invoke(d.Events, 'replaceByName', ('OnLoad', uno.Any('[]com.sun.star.beans.PropertyValue', ev)))
        d.storeToURL(uno.systemPathToFileUrl(out), (pv('FilterName', 'calc8' if calc else 'writer8'),))
        d.close(True)
    else:
        d = desk.loadComponentFromURL(uno.systemPathToFileUrl(sys.argv[3]), '_blank', 0, (pv('Hidden', True), pv('MacroExecutionMode', 4)))
        d.getScriptProvider().getScript(SCRIPT).invoke((), (), ())
        d.close(True)
finally:
    try:
        desk.terminate()
    except Exception:
        pass
    try:
        office.wait(timeout=30)
    except Exception:
        office.kill()
