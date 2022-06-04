import os
import textract
from mimetypes import guess_extension
class extractor:
    def __init__(self):
        self.self = None


    def pdfhandler(self,pdfpath):
        text = textract.process(pdfpath)
        if type(text) == type(bytes()):
            return text.decode()
            
        return text
    def htmlhandler(self,htmlpath):
        text = textract.process(htmlpath)
        return text

    def texthandler(self,txtpath):
        text = open(txtpath,'rt')
        return text.read()

    def dochandler(self,docpath):
        return textract.process(docpath)

    def docxhandler(self,docx):
        return textract.process(docx)

    def pptxhandler(self,pptx):
        return textract.proxess(pptx)
    
    def csvhandler(self,csv):
        return textract.process(csv)

    def epubhandler(self,epub):
        return textract.process(epub)

    def csvhandler(self,csv):
        return textract.process(csv)

    def defaulthandler(self,_):
        return 'null'

extension_and_determined_handler = {
    ".pdf": "pdfhandler",
    ".html": "htmlhandler",
    ".txt": "texthandler",
    ".doc": "dochandler",
    ".docx": "docxhandler",
    ".pptx": "pptxhandler",
    ".csv": "csvhandler",
    ".epub": "epubhandler"
}

def init(filepath,extension=None):
    """
    extract text from file:
    
    Arguements:
        filepath: an string
        extension: an string

    Returns:
        return a dictionary with value content  and extesion which contains 
        extracted text and extenstion respectively.
    """
    if not os.path.isfile(filepath):
            return filepath + "doesn't exist"

    if extension is None:
        mime = os.popen(f"file --mime-type  '{filepath}'").read()
        print(mime)
        
        mime_type = mime.split(' ')[-1][:-1]
        
        extension = guess_extension(mime_type)
       
    get_handler = extension_and_determined_handler.get(extension,'defaulthandler')
    raw_text_from_file = getattr(extractor(),get_handler)(filepath)
    output = dict()
    output['content'] = 'null'
    if raw_text_from_file:
        ascii_only_string = raw_text_from_file.encode('ascii','ignore').decode()
        output['content'] = " ".join(ascii_only_string.split())

    output['extension'] = extension
            
    return output


