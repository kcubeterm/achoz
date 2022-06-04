import signal 
import os 
import subprocess
import sys
import time
from requests import get
import global_var
import crawler
import schedule
import time
import index_mngr
import pyinotify
from threading import Thread
import server



def sigterm_handler(_signo,_noimp):
    os.kill(global_var.meili_search_engine_pid,signal.SIGTERM)
    sys.exit(0)

for sig in [signal.SIGHUP,signal.SIGINT,signal.SIGTERM,signal.SIGQUIT]:
    signal.signal(sig,sigterm_handler)




def setting_up_meili():
    """"This is one time process to adding some rule to indexed, this must be 
    run before any documents gonna indexed in meilisearch"""
    
    lock_file = os.path.join(global_var.data_dir,'rule.lock')
    if not os.path.exists(lock_file):
        global_var.meili_clientclient.index(global_var.index_name).update_sortable_attributes([
          'atime',
          'mtime'])
        global_var.meili_client.index(global_var.index_name).update_searchable_attributes([
        'title',
        'content',
        'abspath'])
    
    return  


            



def watcher():
    """
    collects the list of  changes/modifed file in config.watch_file_changes_list,

    it watches only directory that is listed in config.dir_to_index
    """
    patterns_to_be_ignore=[]
    if global_var.dir_to_ignore:
        patterns_to_be_ignore = [pattern for pattern in global_var.dir_to_ignore if not pattern.startswith('*')]
    if global_var.ignore_hidden:
        patterns_to_be_ignore.append('.*')

    exclude = pyinotify.ExcludeFilter(patterns_to_be_ignore)
    class eventHandler(pyinotify.ProcessEvent):
        def add_pathname_in_list(self,event):
            if event.dir:
                return
            
            global_var.watcher_file_changes_list.append(event.pathname)

        def process_IN_CLOSE_WRITE(self, event):
            self.add_pathname_in_list(event)
        
        def process_IN_CREATE(self,event):
            self.add_pathname_in_list(event)

    wm = pyinotify.WatchManager()
    mask = pyinotify.IN_CLOSE_WRITE | pyinotify.IN_CREATE
    for dir in global_var.dir_to_index:
        wm.add_watch(dir, mask, rec=True,exclude_filter=exclude)

    # notifier
    notifier = pyinotify.Notifier(wm, eventHandler())
    notifier.loop()
    return
# fwatcher in thread
def Invoke_watcher():
    watcher_thread = Thread(target=watcher,daemon=True)
    watcher_thread.start()
    return

def Invoke_crawler():
    crawler.crawling()

def secondary_crawling():
    """
    its crawls only those files that has listed by watcher in global_var.watcher_file_changes_list.
    """
    if len(global_var.watcher_file_changes_list) > 1:
        crawler.individual_file_crawl(global_var.watcher_file_changes_list)

def Invoke_search_engine():
    command = ['meilisearch','--db-path',  global_var.data_dir + '/db.ms' ,'--http-addr' ,'127.0.0.1:'+str(global_var.meili_api_port) ]
    try:
        server = subprocess.Popen(command,stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    except:
        global_var.logger.exception("MEILISEARCH ENGINE FAILED TO START")

    
    global_var.meili_search_engine_pid = server.pid
    time.sleep(3)

    isServerStarted = False
    if not server.poll():
        res = get('http://localhost:'+ str(global_var.meili_api_port) +'/health').json()
        if res.get('status') == 'available':
            global_var.logger.info("Meilisearch started successfully")
            isServerStarted = True
        else:
            global_var.logger.error("Meilisearch is failed to start:")
    return isServerStarted


def Invoke_web_server_script():
    Thread(target=server.main,daemon=True).start()
    time.sleep(1)
    started = False
    res = get('http://localhost:'+str(global_var.web_port) + "/health").json()
    if res.get("status") == 'available':
        global_var.logger.info(f"Web server started succesfully  on Port: { global_var.web_port }" )

        started = True

    return started

def crawled_data_remover():
    """it will regularly removes crawled file once it indexed."""
    index_uid_dict = {**global_var.index_uid_collector}
    for i in index_uid_dict:
        try:
            status = global_var.meili_client.get_task(i).get('status')
        except:
            global_var.logger.exception("UID stats fetcher(central_controller")

        if status == 'succeeded':
            global_var.logger.info(f'SUCCESSFULLY INDEXED: {global_var.index_uid_collector.get(i)} ')
            try:
                os.remove(global_var.index_uid_collector.get(i))
            except:
                global_var.logger.exception('CRAWLED_DATA_REMOVER')
                
            del global_var.index_uid_collector[i]

def Invoke_indexer():
    if not global_var.is_ready_for_indexing:
        return
    
    index_mngr.init()

def invoke_schedular():
    schedule.every(1).minutes.do(Invoke_crawler)
    schedule.every(1).minutes.do(Invoke_indexer)
    schedule.every(2).minutes.do(secondary_crawling)
    schedule.every(2).minutes.do(crawled_data_remover)
    while True:
        schedule.run_pending()
        time.sleep(2)


def init():
        isWebServerStarted = Invoke_web_server_script()
        isSearchEngineStarted = Invoke_search_engine()
        
       
        if isSearchEngineStarted and isWebServerStarted:
        
            global_var.logger.info('Now you are ready to chill')
            Invoke_watcher()
            invoke_schedular()
            
                

        else:
            if not isSearchEngineStarted:
                global_var.logger.error('Meilisearch Failed to start, probably port already occupied')
            try:
                os.kill(global_var.meili_search_engine_pid,signal.SIGTERM)
                exit(1)
            except:
                pass

