import os 
from unique_id_generator import uniqueid
from fnmatch import fnmatch
import list_write as lw  
import global_var
import sqlite3
import time
l = global_var.logger

class ignore_filter:
    def modify_patterns(self,patterns):
        modified_patterns = []
        for pattern in patterns:
            if os.path.exists(pattern) and os.path.isdir(pattern):
                modified_patterns.append(os.path.normpath(pattern) + "/*")

        return modified_patterns
    def files(self,root,list_of_files, list_of_patterns=None):
        if list_of_patterns:
            files_with_abspath = [os.path.join(root,file) for file in list_of_files]
            patterns = self.modify_patterns(list_of_patterns)
            for pattern in patterns:
                list_of_files = [n for n in files_with_abspath if not fnmatch(n, pattern)]
                
            # return filename only, not full path. 
            list_of_files = [ os.path.basename(name) for name in list_of_files]
        return list_of_files

    def directory(self,dirs,root,ignore_patterns=None):
        
        if global_var.ignore_hidden:
            dirs  = [dir for dir in dirs if not dir.startswith('.')]
        if ignore_patterns:
            dir_name_with_rootpath = [ os.path.join(root,dir) for dir in dirs ]
            patterns = self.modify_patterns(ignore_patterns)
            for pattern in patterns:
                dirs = [dir for dir in dir_name_with_rootpath if not fnmatch(dir,pattern)]
            
            # return list of dir basename only, not full path
            dirs = [os.path.basename(dir) for dir in dirs]
        return dirs


def main(list_of_dir,list_of_patterns_to_be_ignore=None,file=None):
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
    if file:
        path = file
        uid = uniqueid(file)
        insert_cmd = f"INSERT OR IGNORE INTO METADATA VALUES ('{uid}','{path}',0,0,0,null);"
        db.execute(insert_cmd)
    else:
        for dir in list_of_dir:
            for root,dirs,files in os.walk(dir,topdown=True):
                ## prevent listing those dirs which must be ignore
                root = os.path.normpath(root)
                ign = ignore_filter()
                dirs[:] = ign.directory(dirs,root,list_of_patterns_to_be_ignore)
                files = ign.files(root,files,list_of_patterns_to_be_ignore)
                if len(files) == 0:
                    continue

                for file in files:
                    path = os.path.join(root,file)
                    uid = uniqueid(repr(path))

                    insert_cmd = f"INSERT OR IGNORE INTO METADATA VALUES ('{uid}','{path}',0,0,0,null);"
                    try:
                        db.execute(insert_cmd)
                    except Exception as e:
                        print(e)
                        print('error')
                        continue


            
    db_connect.commit()
    db.close()
    global_var.db_locked = False
    return

if __name__ == "__main__":
    index = ['/home/kcubeterm/sample']
    ignore = ['*.config','*.git']
    target = '/tmp/sample'   
    print('invoke')
    global_var.data_dir = '/tmp'                         
    main(index,target,ignore)


