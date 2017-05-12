#!C:\Python27\python.exe
import sys, re
from pdfminer.pdfdocument import PDFDocument, PDFNoOutlines
from pdfminer.pdfparser import PDFParser
from pdfminer.psparser import PSKeyword, PSLiteral, LIT
from pdfminer.pdfpage import PDFPage
from pdfminer.pdftypes import PDFStream, PDFObjRef, resolve1, stream_value
from pdfminer.utils import isnumber


ESC_PAT = re.compile(r'[\000-\037&<>()"\042\047\134\177-\377]')
def e(s):
    return ESC_PAT.sub(lambda m:'&#%d;' % ord(m.group(0)), s)

# dumpxml
def dumpxml(out, obj, codec=None):
    if obj is None:
        out.write('<null />')
        return

    if isinstance(obj, dict):
        out.write('<dict size="%d">\n' % len(obj))
        for (k,v) in obj.iteritems():
            out.write('<key>%s</key>\n' % k)
            out.write('<value>')
            dumpxml(out, v)
            out.write('</value>\n')
        out.write('</dict>')
        return

    if isinstance(obj, list):
        out.write('<list size="%d">\n' % len(obj))
        for v in obj:
            dumpxml(out, v)
            out.write('\n')
        out.write('</list>')
        return

    if isinstance(obj, str):
        out.write('<string size="%d">%s</string>' % (len(obj), e(obj)))
        return

    if isinstance(obj, PDFStream):
        if codec == 'raw':
            out.write(obj.get_rawdata())
        elif codec == 'binary':
            out.write(obj.get_data())
        else:
            out.write('<stream>\n<props>\n')
            dumpxml(out, obj.attrs)
            out.write('\n</props>\n')
            if codec == 'text':
                data = obj.get_data()
                out.write('<data size="%d">%s</data>\n' % (len(data), e(data)))
            out.write('</stream>')
        return

    if isinstance(obj, PDFObjRef):
        out.write('<ref id="%d" />' % obj.objid)
        return

    if isinstance(obj, PSKeyword):
        out.write('<keyword>%s</keyword>' % obj.name)
        return

    if isinstance(obj, PSLiteral):
        out.write('<literal>%s</literal>' % obj.name)
        return

    if isnumber(obj):
        out.write('<number>%s</number>' % obj)
        return

    raise TypeError(obj)

# dumpoutline
def dumpoutline(outfp, fname, objids, pagenos, password='',
                dumpall=False, codec=None, extractdir=None):
    fp = file(fname, 'rb')
    parser = PDFParser(fp)
    doc = PDFDocument(parser, password)
    pages = dict( (page.pageid, pageno) for (pageno,page)
                  in enumerate(PDFPage.create_pages(doc)) )

    #if pdf file has been delete cover
    adjuststep = False
    step = 0

    def resolve_dest(dest):
        if isinstance(dest, str):
            dest = resolve1(doc.get_dest(dest))
        elif isinstance(dest, PSLiteral):
            dest = resolve1(doc.get_dest(dest.name))
        if isinstance(dest, dict):
            dest = dest['D']
        return dest
    try:
        outlines = doc.get_outlines()
        outfp.write('<outlines>\n')
        for (level,title,dest,a,se) in outlines:
            pageno = None
            if dest:
                dest = resolve_dest(dest)
                pageno = pages[dest[0].objid]
            elif a:
                action = a.resolve()
                if isinstance(action, dict):
                    subtype = action.get('S')
                    if subtype and repr(subtype) == '/GoTo' and action.get('D'):
                        dest = resolve_dest(action['D'])
                        if not pages.has_key(dest[0].objid):
                            step += 1
                            pageno = step
                            adjuststep = True
                        else:
                            if adjuststep: pageno = pages[dest[0].objid]+step
                            else: pageno = pages[dest[0].objid]
            s = e(title).encode('utf-8', 'xmlcharrefreplace')
            outfp.write('<outline level="%r" title="%s">\n' % (level, s))
            if dest is not None:
                outfp.write('<dest>')
                dumpxml(outfp, dest)
                outfp.write('</dest>\n')
            if pageno is not None:
                outfp.write('<pageno>%r</pageno>\n' % pageno)
            outfp.write('</outline>\n')
        outfp.write('</outlines>\n')
    except PDFNoOutlines:
        pass
    parser.close()
    fp.close()
    return

# dumpoutlinejson
def dumpoutlinejson(outfp, fname, objids, pagenos, password='',
                dumpall=False, codec=None, extractdir=None):
    fp = file(fname, 'rb')
    parser = PDFParser(fp)
    doc = PDFDocument(parser, password)
    pages = dict( (page.pageid, pageno) for (pageno,page)
                  in enumerate(PDFPage.create_pages(doc)) )

    #if pdf file has been delete cover
    adjuststep = False
    step = 0

    def resolve_dest(dest):
        if isinstance(dest, str):
            dest = resolve1(doc.get_dest(dest))
        elif isinstance(dest, PSLiteral):
            dest = resolve1(doc.get_dest(dest.name))
        if isinstance(dest, dict):
            dest = dest['D']
        return dest
    try:
        outlines = doc.get_outlines()

        writeonlyonce = True


        for (level,title,dest,a,se) in outlines:
            pageno = None
            if dest:
                dest = resolve_dest(dest)
                pageno = pages[dest[0].objid]
            elif a:
                action = a.resolve()
                if isinstance(action, dict):
                    subtype = action.get('S')
                    if subtype and repr(subtype) == '/GoTo' and action.get('D'):
                        dest = resolve_dest(action['D'])
                        if not pages.has_key(dest[0].objid):
                            step += 1
                            pageno = step
                            adjuststep = True
                        else:
                            if adjuststep: pageno = pages[dest[0].objid] + step
                            else: pageno = pages[dest[0].objid]
            s = e(title).encode('utf-8', 'xmlcharrefreplace')
            if writeonlyonce:
                writeonlyonce = False
                outfp.write('{ adjuststep: %r' % adjuststep)
                outfp.write(', skippageno: %r' % step)
                outfp.write(', outlines: [ ')

            outfp.write('{ level: "%r", title: "%s"' % (level, s))
            if pageno is not None:
                outfp.write(', pageno: %r' % pageno)
            outfp.write(' },')
        outfp.write(' }\n')
    except PDFNoOutlines:
        pass
    parser.close()
    fp.close()
    return

# main
def main(argv):
    if len(argv) != 2:
        print "need a pdf file"
        return

    objids = []
    pagenos = set()
    codec = None
    password = ''
    dumpall = False
    outfp = sys.stdout
    extractdir = None

    dumpoutlinejson(outfp, argv[1], objids, pagenos, password=password,
         dumpall=dumpall, codec=codec, extractdir=extractdir)

    return

if __name__ == '__main__': sys.exit(main(sys.argv))
