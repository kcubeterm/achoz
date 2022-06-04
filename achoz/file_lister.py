import os 
from unique_id_generator import uniqueid
from fnmatch import fnmatch
import list_write as lw  
import global_var

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


def main(list_of_dir, path_to_be_written, list_of_patterns_to_be_ignore=None):
    l.debug(f'Filelister invocation with option, list_of_dir={list_of_dir},\
    path_to_be_written={path_to_be_written}, list_of_patterns_to_ignore={list_of_patterns_to_be_ignore}')
    """
    It will create a top-down file list with in files. filename will be hash of root directory.

    Arguments:
        whereToWrite: path
        dirTobelisting: path
        list_of_patterns_to_be_ignore: list

    returns: 
        
    """

    for dir in list_of_dir:
        for root,dirs,files in os.walk(dir,topdown=True):
            ## prevent listing those dirs which must be ignore
            root = os.path.normpath(root)
            root_id = uniqueid(root)
            ign = ignore_filter()
            dirs[:] = ign.directory(dirs,root,list_of_patterns_to_be_ignore)
            files = ign.files(root,files,list_of_patterns_to_be_ignore)
            if len(files) == 0:
                continue

            if path_to_be_written:
                PathToBewritten =  path_to_be_written
            else:
                PathToBewritten = os.path.join(global_var.data_dir,'filelist')
            
            try:
                os.mkdir(PathToBewritten)
            except:
                pass

            try:
                os.mkdir(os.path.join(PathToBewritten,root_id[:2]))
            except:
                pass
            # filepath in which list of paths written
            filepath = os.path.join(PathToBewritten,root_id[:2],root_id)
        
            
            filespath_list = []
            for file in files:
                
                filespath_list.append(root + "/" + str(file))

            lw.list2text(filespath_list,filepath)

    return

if __name__ == "__main__":
    index = ['/home/kcubeterm/sample']
    ignore = ['/home/kcubeterm/sample/pdf']
    target = '/tmp/sample'   
    print('invoke')                           
    main(index,target,ignore)


