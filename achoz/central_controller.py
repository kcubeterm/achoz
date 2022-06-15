import file_lister
import os
import signal
import sqlite3
import subprocess
import sys
import time
from threading import Thread

import pyinotify
import schedule
from requests import get

import crawler
import global_var
import index_mngr
import server
from unique_id_generator import uniqueid


def sigterm_handler(_signo,_noimp):
    os.kill(global_var.meili_search_engine_pid,signal.SIGTERM)
    sys.exit(0)

for sig in [signal.SIGHUP,signal.SIGINT,signal.SIGTERM,signal.SIGQUIT]:
    signal.signal(sig,sigterm_handler)




def setting_up_meili():
    """"This is one time process to adding some rule to indexed, this must be 
    run before any documents gonna indexed in meilisearch"""
    db_con = sqlite3.connect(os.path.join(global_var.data_dir,'metadata.db'))
    db = db_con.cursor()
    # create tables in db if not already exist
    create_stats_table = "create table if not exists  stats(key int unique,value int default 0);"
    db.execute(create_stats_table)
    db.execute("insert or ignore into stats values('meili_settings_configured',0);")
    db_con.commit()
    setting_status = db.execute("select value from stats where key='meili_settings_configured';").fetchall()[0][0]
    if setting_status == 1:
        return

    try:
        global_var.meili_client.index(global_var.index_name).update_sortable_attributes(['atime','mtime','ctime'])
        global_var.meili_client.index(global_var.index_name).update_searchable_attributes([
        'title',
        'content',
        'abspath'])
    except:
        global_var.logger.error('Setting Up meili not succeeded, please report the issue')
        exit(1)
    db.execute("update stats set value = 1 where key='meili_settings_configured'")
    db_con.commit()
    db.close()
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
            file_lister.main(file=event.pathname)

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

def remove_processed_data():
    global_var.logger.debug('REMOVE PROCESSED DATA FUNC INVOKED')
    """it will regularly removes crawled file once it has indexed."""
    if global_var.crawling_locked or global_var.indexing_locked or global_var.db_locked:
        return
    
    global_var.db_locked = True
    db_con = sqlite3.connect(os.path.join(global_var.data_dir,'metadata.db'))
    db = db_con.cursor()
    def delete_row(ids:list):
        db.executemany("delete from crawled_data where id = ?",ids)
        return

    meili_uid = db.execute("select distinct meili_indexed_uid from metadata;").fetchall()
    for uid in meili_uid:
        uid = uid[0]
        status = global_var.meili_client.get_task(uid).get('status')
        if status == 'succeeded':
            id_of_indexed_doc = db.execute(f"select id from metadata where meili_indexed_uid = {uid};").fetchall()
            delete_row(id_of_indexed_doc)

    db_con.commit()
    db.close()
    global_var.db_locked = False
    global_var.logger.debug('REMOVE PROCESSED DATA FUNC EXITED')
    return


def Invoke_indexer():
    if not global_var.is_ready_for_indexing:
        return
    
    index_mngr.init()

def invoke_schedular():
    schedule.every(20).minutes.do(Invoke_crawler)
    schedule.every(3).minutes.do(Invoke_indexer)
    schedule.every(5).minutes.do(remove_processed_data)
    while True:
        schedule.run_pending()
        time.sleep(2)


def init():
        isWebServerStarted = Invoke_web_server_script()
        isSearchEngineStarted = Invoke_search_engine()
        
       
        if isSearchEngineStarted and isWebServerStarted:
        
            global_var.logger.info('Now you are ready to chill')
            setting_up_meili()
            ## list all file in database.

            file_lister.main(global_var.dir_to_index, global_var.dir_to_ignore)
            Invoke_crawler()
            Invoke_indexer()
            remove_processed_data()
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

