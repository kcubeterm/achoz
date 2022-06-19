from distutils import extension
import logging
import sys
import os

__program__ = 'achoz'
__version__ = '0.3.65'
logging.basicConfig(format='%(levelname)s %(asctime)s %(message)s',handlers=[
        logging.FileHandler(os.path.expanduser('~/.achoz.log'),mode='w'),
        logging.StreamHandler(sys.stdout)
    ])
    
logger = logging.getLogger('achoz')
# exporting variable that gonna use throughout the process
meili_search_engine_pid = None
watcher_file_changes_list = [] 
index_name = 'I_love_my_mommy'
indexing_locked = False
crawling_locked = False

data_dir = os.path.join(os.path.expanduser('~'),'.achoz')
web_port = 8990
dir_to_index = []
dir_to_ignore = []
file_to_ignore = []
meili_api_port = 8989
extension_to_ignore = []
meili_client = None

is_web_server_started = False
ignore_hidden = True
db_locked = False

priority = 'low'
# stats
meili_settings_configured = None
no_of_total_files = 0
no_of_crawled_files = 0
no_of_indexed_files = 0 

# Watcher
modified_files = []
created_files = []

# meili indexing
# max one time size of batch file in bytes for meilisearch ingest. 
max_batch_size = 10*1000*1000

# Crawler.

## Maximum time crawler could run. after that it will terminate. and run after schedular
crawling_max_time = 300

## remove process data

remove_processed_data = True