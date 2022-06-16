
import text_extractor
import os
from unique_id_generator import uniqueid
import global_var
import sqlite3


def crawling_and_adding_more_var(path):

    text = text_extractor.init(path)
    if not type(text) == type(dict()):
        global_var.logger.warning(f'crawling_and_adding_more_var: {text}')
        global_var.logger.warning(f'CRAWLING: issues while crawling {path}')
        return None
    # adding more keys like id, abspath, title, content, type, kind, extracinfo, ctime, atime
    fileinfo = dict()
    fileinfo['id'] = uniqueid(path)
    fileinfo['title'] = os.path.basename(path)
    fileinfo['abspath'] = path
    if text.get('content'):
        fileinfo['content'] = text.get('content')
    else:
        fileinfo['content'] = "Nothing......"
    fileinfo['ext'] = text.get('extension')
    fileinfo['mime'] = text.get('mime')
    fileinfo['extrainfo'] = text.get('extrainfo')
    fileinfo['ctime'] = os.path.getctime(path)
    fileinfo['atime'] = os.path.getatime(path)
    fileinfo['mtime'] = os.path.getmtime(path)
    return fileinfo

def crawling():
    global_var.logger.debug('Crawling function Invocation')
    if global_var.crawling_locked:
        return

    global_var.crawler_locked = True

    global_var.db_locked = True
    metadata_db_connect = sqlite3.connect(os.path.join(global_var.data_dir,'metadata.db'))
    metadata_db = metadata_db_connect.cursor()
    # sqlite table creation, 
    crawled_data_table = """CREATE TABLE IF NOT EXISTS crawled_data(
        id CHARACTER(12) PRIMARY KEY not null,
        ctime real ,
        mtime real ,
        atime real ,
        extrainfo text,
        mime text,
        ext text,
        content blob);"""
    metadata_db.execute(crawled_data_table)
    data = metadata_db.execute('select id,filepath from metadata where crawled != 1 and error == 0;')
    rows = data.fetchall()
    for row in rows:
        id = row[0]
        filepath = row[1]
        global_var.logger.debug(f'CRAWLING: {filepath}')
        crawled_content = crawling_and_adding_more_var(filepath)
        if not crawled_content:
            metadata_db.execute(f"update metadata set error = 1 where id = '{id}';")
            metadata_db_connect.commit()
            continue
        values = ( id,crawled_content.get('ctime'),crawled_content.get('mtime'),crawled_content.get('atime'),crawled_content.get('extrainfo'),crawled_content.get('mime'),crawled_content.get('ext'),crawled_content.get('content'),)
        metadata_db.execute("insert or ignore into crawled_data values (?,?,?,?,?,?,?,?)",values)
        metadata_db.execute(f"update metadata set crawled == 1 where id =='{id}';")
        metadata_db_connect.commit()

    metadata_db_connect.close()
    global_var.db_locked = False
    global_var.crawler_locked = False
    global_var.is_ready_for_indexing = True
    return

# it could crawl files and update filelist without invoking filelister function. especiaally
# used in while user create files and watcher decept it and invoke this funtion instead of checking all
# files from start.


def main(path):
    # global_var.data_dir = '/tmp/sample'
    # crawling(False)
    print(crawling_and_adding_more_var('/home/kcubeterm/alchemist/56 FC List 16th Feb 22_compressed.pdf').get('content'))
    return


if __name__ == '__main__':
    print('hello.')
    main('/home/kcubeterm/sample/pdf')
