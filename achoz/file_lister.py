import os
from threading import local 
from unique_id_generator import uniqueid
import list_write as lw  
import global_var
import sqlite3
import time
import re
l = global_var.logger

class ignore_filter:
    def files(self,list_of_files,root=None):
        filtered_ext = []
        filtered_files = []
        ## Deal with extesnsion which need to ignore
        if global_var.extension_to_ignore:
            ext_ignore = global_var.extension_to_ignore
            
            ignore_files = []
            for ext in ext_ignore:
                ignore_files = [file for file in list_of_files if re.match(ext,file)]

            filtered_ext = [file for file in list_of_files if file not in ignore_files]

        patterns = global_var.file_to_ignore
        if patterns:
            files_with_abspath = list_of_files
            if root:
                files_with_abspath = [os.path.join(root,file) for file in list_of_files]
            ignore_files = []
            for pattern in patterns:
                ignore_files = [file for file in files_with_abspath if re.match(pattern,file)]
                filtered_files = [file for file in files_with_abspath if file not in ignore_files]
            
            if root:
                # return filename only, not full path.
                filtered_files = [ os.path.basename(name) for name in filtered_files]
                filtered_files = [file for file in filtered_files if not filtered_ext]
        
        list_of_files = filtered_files + filtered_ext
        return list_of_files

    def directory(self,dirs,root,ignore_patterns=None):
        ign_hidden_dirs = []
        filtered_dir = []
        if global_var.dir_to_ignore:
            ign_dir = global_var.dir_to_ignore
            dir_name_with_rootpath = [ os.path.join(root,dir) for dir in dirs ]
            i_dirs = []
            for i in ign_dir:
                i_dirs = [dir for dir in dir_name_with_rootpath if re.match(i,dir)]

            filtered_dir = [dir for dir in dir_name_with_rootpath if dir not in i_dirs]
            # return list of dir basename only, not full path
            filtered_dir = [os.path.basename(dir) for dir in filtered_dir]

        if global_var.ignore_hidden:
            [dir for dir in dirs if not dir.startswith('.')]
            if filtered_dir:
                filtered_dir  = [dir for dir in filtered_dir if not dir.startswith('.')]
            else:
                ign_hidden_dirs = [dir for dir in dirs if not dir.startswith('.')]
        dirs = filtered_dir + ign_hidden_dirs
        return dirs


def main(list_of_dir=None,list_of_patterns_to_be_ignore=None,files=None,create=None,modify=None):
    l.debug(f'Filelister invocation with option, list_of_dir={list_of_dir},\
     list_of_patterns_to_ignore={list_of_patterns_to_be_ignore}')
    """
    It will create a top-down file list with in files. filename will be hash of root directory.

    Arguments:
        whereToWrite: path
        dirTobelisting: path
        list_of_patterns_to_be_ignore: list

    returns: 
        
    """

    ## sqlite 
    while global_var.db_locked:
        time.sleep(1)
    global_var.db_locked = True
    db_connect = sqlite3.connect(os.path.join(global_var.data_dir,'metadata.db'))
    db = db_connect.cursor()
    table = '''
    create table if not exists metadata(
        id text primary key not null,
        filepath text not null,
        crawled int default 0 not null,
        error int default 0 not null,
        indexed int default 0 not null,
        meili_indexed_uid int default null
    );
    '''
    db.execute(table)
    db_connect.commit()
    if files:
        # list_out_ignore_file
        files = ignore_filter().files(files) 
        for f in files:
            uid = uniqueid(f)
            insert_cmd = f"INSERT OR IGNORE INTO METADATA VALUES ('{uid}','{f}',0,0,0,null);"
            if modify:
                insert_cmd = f"update metadata set crawled = 0,indexed=0,error=0,meili_indexed_uid = null where id = '{uid}';"
            db.execute(insert_cmd)
    if list_of_dir:
        for dir in list_of_dir:
            for root,dirs,files in os.walk(dir,topdown=True):
                ## prevent listing those dirs which must be ignore
                root = os.path.normpath(root)
                ign = ignore_filter()
                dirs[:] = ign.directory(dirs,root)
                files = ign.files(files,root)
                if len(files) == 0:
                    continue

                for file in files:
                    path = os.path.join(root,file)
                    uid = uniqueid(repr(path))

                    insert_values = (uid,path,0,0,0,None,)
                    try:
                        db.execute("INSERT OR IGNORE INTO METADATA VALUES (?,?,?,?,?,?)",insert_values)
                    except Exception as e:
                        print(e)
                        print('error')
                        continue


            
    db_connect.commit()
    db.close()
    global_var.db_locked = False
    return

if __name__ == "__main__":
    # only for testing purpose. 
    index = ['/home/kcubeterm/sample']
    ignore = ['*.config','*.txt']
    target = '/tmp'   
    print('invoke')
    global_var.data_dir = target 
    global_var.dir_to_ignore = ['/home/kcubeterm/sample/pdf']
    global_var.extension_to_ignore = ['txt']  
    files = ['/home/kcubeterm/sample/kcubeterm.txt','/home/kcubeterm/lol.etc']                  
    main(files=files,modify=True)


