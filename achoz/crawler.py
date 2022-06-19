
import text_extractor
import os
from unique_id_generator import uniqueid
import global_var
import sqlite3
import time

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

def update_id_status(crawled_done_id:list=None,crawled_failed_id:list=None):
    if crawled_done_id:
        for id in crawled_done_id:
            metadata_db.execute(f"update metadata set crawled == 1 where id =='{id}';")
    if crawled_failed_id:
        for id in crawled_failed_id:
            metadata_db.execute(f"update metadata set error = 1 where id = '{id}';")
            

def crawling():
    global_var.logger.debug('Crawling function Invocation')
    if global_var.crawling_locked:
        return

    global_var.crawler_locked = True

    global_var.db_locked = True
    start_time = time.time()
    global metadata_db_connect
    global metadata_db
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

    limit = 50
    offset = 0
    metadata_db.execute(crawled_data_table)
    data = metadata_db.execute(f"select id,filepath from metadata where crawled != 1 and error == 0 limit {limit} offset {offset};").fetchall()

    crawled_done_id = []
    crawled_failed_id = []
    while len(data) != 0 and time.time() - start_time < global_var.crawling_max_time:
        for row in data:
            id = row[0]
            filepath = row[1]
            global_var.logger.debug(f'CRAWLING: {filepath}')
            crawled_content = crawling_and_adding_more_var(filepath)
            if not crawled_content:
                crawled_failed_id.append(id)
                continue
            values = ( id,crawled_content.get('ctime'),crawled_content.get('mtime'),crawled_content.get('atime'),crawled_content.get('extrainfo'),crawled_content.get('mime'),crawled_content.get('ext'),crawled_content.get('content'),)
            metadata_db.execute("insert or ignore into crawled_data values (?,?,?,?,?,?,?,?)",values)
            crawled_done_id.append(id)
            if time.time() - start_time > global_var.crawling_max_time:
                global_var.logger.debug("CRAWLING(SKIPPING) DUE TO MAXIMUM TIME LIMIT")
                break
        
        offset = limit + offset
        data = metadata_db.execute(f"select id,filepath from metadata where crawled != 1 and error == 0 limit {limit} offset {offset};").fetchall()

    update_id_status(crawled_done_id=crawled_done_id,crawled_failed_id=crawled_failed_id)
    metadata_db_connect.commit()
    metadata_db_connect.close()
    global_var.db_locked = False
    global_var.crawling_locked = False
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
