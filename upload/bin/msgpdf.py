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
                outfp.write('{"adjuststep":"%r"' % adjuststep)
                outfp.write(',"skippageno":"%r"' % step)
                outfp.write(',"outlines":[')

            outfp.write('{"l":"%r","t":"%s"' % (level, s))
            if pageno is not None:
                outfp.write(',"n":"%r"' % pageno)
            outfp.write('},')
        outfp.write(']}\n')
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
