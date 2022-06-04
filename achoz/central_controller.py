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






            



def watcher():
    """
    collects the list of  changes/modifed file in config.watch_file_changes_list,

    it watches only directory that is listed in config.dir_to_index
    """
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
        wm.add_watch(dir, mask, rec=True)

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
    its crawls only those files that has listed by watcher in config.
    """
    if len(global_var.watcher_file_changes_list) > 10:
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

    return isServerStarted


def Invoke_web_server_script():
    Thread(target=server.main).start()
    time.sleep(1)
    started = False
    res = get('http://localhost:'+str(global_var.web_port) + "/health").json()
    if res.get("status") == 'available':
        global_var.logger.info(f'Web server started succesfully  on Port: {global_var.web_port}')
        started = True
    return started

def crawled_data_remover():
    """it will regularly removes crawled file once it indexed."""
    for i in global_var.index_uid_collector:
        try:
            status = global_var.meili_client.get_task(i).status
        except:
            global_var.logger.exception("UID stats fetcher(central_controller")

        if status == 'succeeded':
            os.remove(global_var.index_uid_collector.get(i))
            del global_var.index_uid_collector[i]

def Invoke_indexer():
    if not global_var.is_ready_for_indexing:
        return
    
    index_mngr.init()

def invoke_schedular():
    schedule.every(1).minutes.do(Invoke_crawler)
    schedule.every(1).minutes.do(Invoke_indexer)
    schedule.every(20).minutes.do(secondary_crawling)
    schedule.every(25).minutes.do(crawled_data_remover)
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
            try:
                os.kill(global_var.meili_search_engine_pid,signal.SIGTERM)
                exit(1)
            except:
                pass

