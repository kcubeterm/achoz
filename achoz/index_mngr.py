import json
import global_var
import os


def indexer(jsonln_file_path):
   
    if os.stat(jsonln_file_path).st_size == 0:
        return 
    # An index is where the documents are stored.
    index = global_var.meili_client.index(global_var.index_name)

    documents = []
    jsonfile = open(jsonln_file_path).readlines()
   
    for i in jsonfile:
        documents.append(json.loads(i))
        
        
    global_var.logger.info(f'INDEXING:{jsonln_file_path} started')
    response_uid = index.add_documents(documents) # => { "uid": 0 }
    if response_uid.get('uid'):
        global_var.index_uid_collector[response_uid.get('uid')] = jsonln_file_path
        global_var.logger.info(f'INDEXING(enqueued):{jsonln_file_path} ')

    return response_uid.get('uid')

def init():
    if global_var.indexing_locked:
        return

    global_var.indexing_locked = True

    crawled_data_dir = global_var.data_dir + "/crawled_data"
    indexed_uid_file = global_var.data_dir + "/indexed/uid"
    if not os.path.exists(indexed_uid_file):
        try:
            os.mkdir(os.path.dirname(indexed_uid_file))
        except:
            pass
    
    uid_file = open(indexed_uid_file,'a')

    for file in os.listdir(crawled_data_dir):
        global_var.logger.debug(f'indexed_uid_collector {global_var.index_uid_collector}')
        jsonln_pathname = crawled_data_dir + "/" + file
        if jsonln_pathname in [*global_var.index_uid_collector.values()]:
            continue
       
        uid = indexer(jsonln_pathname)
        if uid:
            global_var.index_uid_collector[uid] = jsonln_pathname
            uid_file.write(f'{uid} {jsonln_pathname}')
            uid_file.write('\n')
        else:
            global_var.logger.warning(f"{jsonln_pathname} does't pushed to meilisearch for some reason")

    uid_file.close()
    global_var.indexing_locked = False
    return 
    


