
import text_extractor
import file_lister
import os
from unique_id_generator import uniqueid
import global_var
import json
import list_write as lw


def crawling_and_adding_more_var(path):

    text = text_extractor.init(path)
    if not type(text) == type(dict()):
        global_var.logger.warning(f'crawling_and_adding_more_var: {text}')
        global_var.logger.warning(f'CRAWLING: issues while crawling {path}')
        return None
    # adding more keys like id, abspath, title, content, type, kind, extracinfo, ctime, atime
    fileinfo = dict()
    fileinfo['id'] = uniqueid(path)
    fileinfo['title'] = os.path.basename(path)
    fileinfo['abspath'] = path
    fileinfo['content'] = text.get('content')
    fileinfo['ext'] = text.get('extension')
    fileinfo['mime'] = text.get('mime')
    fileinfo['extrainfo'] = text.get('extrainfo')
    fileinfo['ctime'] = os.path.getctime(path)
    fileinfo['atime'] = os.path.getatime(path)

    return fileinfo


def crawling():
    global_var.logger.debug('Crawling function Invocation')
    if global_var.crawling_locked:
        return

    global_var.crawler_locked = True
    list_of_patterns_to_be_ignore = None

    file_lister.main(global_var.dir_to_index, global_var.dir_to_ignore)

    for base,_,files in os.walk(global_var.data_dir + "/filelist",topdown=True):
       if files:
            for file in files:
                contains_abspath = os.path.join(base,file)
                filelist = lw.text2list(contains_abspath)

                files_already_crawled_path = os.path.join(global_var.data_dir,'crawled',file[:2],file)
                if os.path.exists(files_already_crawled_path) and os.stat(files_already_crawled_path).st_size != 0:
                    already_crawled_files = lw.text2list(files_already_crawled_path)
                    filelist = [ file for file in filelist if not file in already_crawled_files ]

                try:
                    os.mkdir(global_var.data_dir + '/crawled')
                    os.mkdir(global_var.data_dir + "/crawled_data")
                except:
                    pass

                crawled_data_file = os.path.join(global_var.data_dir,"crawled_data",file[:2],file)
                try:
                    os.mkdir(os.path.join(global_var.data_dir,"crawled_data",file[:2]))
                except:
                    pass

                crawled_data_file_io = open(crawled_data_file,'a')
                crawled_list_filepath = os.path.join(global_var.data_dir,'crawled',file[:2],file)
                try:
                    os.mkdir(os.path.join(global_var.data_dir,'crawled',file[:2]))
                except:
                    pass
                crawled_list = []
                
                for filepath in filelist:
                   
                    fileinfo = crawling_and_adding_more_var(filepath)
                    if fileinfo:

                        crawled_list.append(filepath)
                        json.dump(fileinfo, crawled_data_file_io)
                        crawled_data_file_io.write('\n')

            lw.list2text(crawled_list, crawled_list_filepath, 'a')
            crawled_data_file_io.close()
            # delete the file if it contatins nothing. 
            if os.stat(crawled_data_file).st_size == 0:
                os.remove(crawled_data_file)

    global_var.crawler_locked = False
    global_var.is_ready_for_indexing = True
    return

# it could crawl files and update filelist without invoking filelister function. especiaally
# used in while user create files and watcher decept it and invoke this funtion instead of checking all
# files from start.


def individual_file_crawl(list_of_filepath: list):
    if global_var.crawling_locked:
        return

    global_var.crawler_locked = True

    for path in list_of_filepath:
        fileinfo = crawling_and_adding_more_var(path)
        id = uniqueid(os.path.dirname(path)) 
        # open that specifice file from where file belongs to in crawled_data
        crawled_data_file = os.path.join(global_var.data_dir,"crawled_data",id[:2],id)
        write_file = open(crawled_data_file, 'a')
        json.dump(fileinfo, write_file)
        write_file.write('\n')
        write_file.close()
        global_var.logger.debug(f'INDIVIDUAL INDEX: {path} ,{crawled_data_file}')
        # note this file into crawled dir since it has crawled
        file_contains_crawled_list = os.path.join(global_var.data_dir,"crawled",id[:2],id)
        lw.list2text([path], file_contains_crawled_list, 'a')

    global_var.crawler_locked = False
    return


def main(path):
    f = open("/tmp/hell", "w")
    for file in os.listdir(path):
        fileinfo = crawling_and_adding_more_var(os.path.join(path,file))
        json.dump(fileinfo, f)
        f.write('\n')

    f.close()
    return


if __name__ == '__main__':
    print('hello.')
    main('/home/kcubeterm/sample/pdf')
