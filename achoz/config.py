
from distutils.util import execute
import json
import os
import meilisearch
from pytz import common_timezones
import global_var
import sqlite3

def path_expander(list_of_path):
    output=[]
    for dir in list_of_path:
        output.append(os.path.abspath(os.path.expanduser(dir)))
    return output

def configure(user_dir_to_index = None,user_defined_config_file=None, user_defined_data_dir=None, user_defined_web_port=None, user_defined_meili_port=None):
    if os.environ.get('ACHOZ_ENV') == 'developement':
        project_root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        global_var.meili_api_port = '8989'
        global_var.web_port = '8990'
        global_var.data_dir = '/tmp'

        global_var.dir_to_index = [project_root_dir + "/sample"]


    else:
        config_path = os.path.expanduser('~') + '/.achoz/config.json'
        if user_defined_config_file:
            config_path = os.path.abspath(user_defined_config_file)


        config_bytes = open(os.path.abspath(config_path),'r')
        config = json.load(config_bytes)

       
        global_var.meili_api_port = config.get('meili_api_port')
        global_var.web_port = config.get('web_port')
        global_var.data_dir = os.path.abspath(config.get('data_dir'))
        
        global_var.dir_to_index = config.get('dir_to_index')
        if user_dir_to_index:
            global_var.dir_to_index = global_var.dir_to_index + user_dir_to_index
            global_var.dir_to_index = path_expander(global_var.dir_to_index)

        # avoid duplicate directory name
        global_var.dir_to_index = list(set(global_var.dir_to_index))
        global_var.dir_to_ignore = config.get('dirToBeIgnored')

        if user_defined_data_dir:
            global_var.data_dir = user_defined_data_dir

        if not global_var.data_dir:
            global_var.data_dir = os.path.expanduser('~') + "/" + ".achoz"

        if user_defined_web_port:
            global_var.web_port = user_defined_web_port

        if user_defined_meili_port:
            global_var.meili_api_port = user_defined_meili_port

    
    global_var.meili_client = meilisearch.Client('http://127.0.0.1:' + str(global_var.meili_api_port))
    
    # adding variable in logging. 
    global_var.logger.info(f'data_dir:{global_var.data_dir}')
    global_var.logger.info(f'web_port={global_var.web_port}')
    global_var.logger.info(f'meili_api_port={global_var.meili_api_port}')
    global_var.logger.info(f'dir_to_index={global_var.dir_to_index}')

    ## load data from config.data_dir/indexed/uid into index_uid_collector if any:
    uid_fie = os.path.join(global_var.data_dir,'indexed/uid')
    if os.path.exists(uid_fie) and os.stat(uid_fie).st_size != 0:
        file_lines = open(uid_fie).readlines()
        for line in file_lines:
            key = line.split(' ')[0]
            value = line.split(' ')[1][:-1]
            global_var.index_uid_collector[key] = value
            

    return 


