import os 
from unique_id_generator import uniqueid
from fnmatch import fnmatch
import list_write as lw  
import global_var



def ignore_filter(list_of_files, list_of_patterns):
    def modify_patterns(patterns):
        modified_patterns = []
        for pattern in patterns:
            if os.path.exists(pattern) and os.path.isdir(pattern):
                modified_patterns.append(os.path.normpath(pattern) + "/*")

        return modified_patterns

    patterns = modify_patterns(list_of_patterns)
    for pattern in patterns:
        filteredFiles = [n for n in list_of_files if not fnmatch(n, pattern)]
        exclude_dirs = [dir for dir in filteredFiles if not os.path.isdir(dir)]
    return exclude_dirs

def main(list_of_dir, path_to_be_written, list_of_patterns_to_be_ignore=None):
    
    """
    It will create a top-down file list with in files. filename will be hash of root directory.

    Arguments:
        whereToWrite: path
        dirTobelisting: path
        list_of_patterns_to_be_ignore: list

    returns: 
        
    """

    for dir in list_of_dir:
        print(dir)
        for root,dirs,files in os.walk(dir,topdown=True):
            root = os.path.normpath(root)
            if list_of_patterns_to_be_ignore:
                files_abspaths = [ os.path.join(root,f) for f in files]
                dirs_abspaths = [os.path.join(root,d) for d in dirs]
                files_and_dir_abspath = dirs_abspaths + files_abspaths
                files = ignore_filter(files_and_dir_abspath,list_of_patterns_to_be_ignore)
                    
                    

        
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

            rootPath = os.path.join(PathToBewritten,uniqueid(root))
        
            
            filespath_list = []
            for file in files:
                
                filespath_list.append(root + "/" + str(file))
                print(file)

            lw.list2text(filespath_list,rootPath)

    return

print(__file__)
if __name__ == "__main__":
    index = ['/home/kcubeterm/sample']
    ignore = ['/home/kcubeterm/sample/ignore']
    target = '/tmp/sample'   
    print('invoke')                           
    main(index,target,ignore)


