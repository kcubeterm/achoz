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
logger = None

is_web_server_started = True

