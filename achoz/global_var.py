import logging
import sys
import os

logging.basicConfig(format='%(levelname)s %(asctime)s %(message)s',handlers=[
        logging.FileHandler(os.path.expanduser('~/.achoz.log'),mode='w'),
        logging.StreamHandler(sys.stdout)
    ])
    
logger = logging.getLogger('achoz')
# exporting variable that gonna use throughout the process
meili_search_engine_pid = None
watcher_file_changes_list = []
index_uid_collector = {} # collect uid, meilisearch respond with uid while indexing.
# that uid could be use for status. like indexing completed or not, or still in queue. 
index_name = 'I_love_my_mommy'
is_ready_for_indexing = False
indexing_locked = False
crawling_locked = False

data_dir = None
web_port = None
dir_to_index = []
dir_to_ignore = []
meili_api_port = None

meili_client = None

is_web_server_started = True
ignore_hidden = True
db_locked = False

# stats
meili_settings_configured = None
no_of_total_files = 0
no_of_crawled_files = 0
no_of_indexed_files = 0 