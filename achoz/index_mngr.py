import json
import global_var
import os
import sqlite3
from sys import getsizeof


def uid_updater(id:list,uid:str):
    for i in id:
        db.execute(f"update metadata set meili_indexed_uid = {uid} where id = '{i}';")
    

def indexer(documents):
    print(len(documents))
    index = global_var.meili_client.index(global_var.index_name)
    response_uid = index.add_documents(documents) # => { "uid": 0 }
    if response_uid.get('uid'):
        return response_uid.get('uid')
    return
# WILL INDEX 80 MB OF DOCUMENTS EVERY TIME. 
def init():
    global_var.logger.debug('INDEXER INVOCATION')
    if global_var.crawling_locked or global_var.indexing_locked or global_var.db_locked:
       return
    global db_con
    global db
    db_path = os.path.join(global_var.data_dir,'metadata.db')
    db_con = sqlite3.connect(db_path)
    db = db_con.cursor()

    global_var.indexing_locked = True
    global_var.db_locked = True
    max_size = 80*1000*1000
    current_size = 0
    documents = []
    id_list = []
    limit = 30
    offset = 0
    fetch_data_statement = f"select metadata.id,filepath,atime,ctime,mtime,mime,ext,extrainfo,content from metadata inner join crawled_data on metadata.id = crawled_data.id where meili_indexed_uid is null limit {limit} offset {offset};"
    raw_data = db.execute(fetch_data_statement).fetchall()
    
    while current_size <= max_size and len(raw_data) != 0:
        document = dict()
        for row in raw_data:
            document['id'] = row[0]
            document['title'] = os.path.basename(row[1])
            document['abspath'] = row[1]
            document['content'] = row[8]
            document['ext'] = row[6]
            document['mime'] = row[5]
            document['extrainfo'] = row[7]
            document['ctime'] = row[4]
            document['atime'] = row[3]
            document['mtime'] = row[4]

            documents.append((document))
            current_size = current_size + getsizeof(document)
            id_list.append(row[0])

        offset = limit + offset
        fetch_data_statement = f"select metadata.id,filepath,atime,ctime,mtime,mime,ext,extrainfo,content from metadata inner join crawled_data on metadata.id = crawled_data.id where meili_indexed_uid is null limit {limit} offset {offset};"
        raw_data = db.execute(fetch_data_statement).fetchall()
    
    uid = None
    if len(documents) != 0:
        uid = indexer(documents)
        if not uid:
            global_var.logger.warning('Detected non indexing content')

    if uid:
        uid_updater(id_list,uid)
        
    db_con.commit()
    db_con.close()
    global_var.indexing_locked = False
    global_var.db_locked = False
    global_var.logger.debug('INDEXER EXECTION EXIT')
    return 
    


