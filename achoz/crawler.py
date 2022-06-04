
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
        global_var.logger.warn(f'CRAWLING: issues while crawling {path}')
        return None
    # adding more keys like id, abspath, title, content, type, kind, extracinfo, ctime, atime
    fileinfo = dict()
    fileinfo['id'] = uniqueid(path)
    fileinfo['title'] = os.path.basename(path)
    fileinfo['abspath'] = path
    fileinfo['content'] = text.get('content')
    fileinfo['type'] = text.get('extension')
    fileinfo['kind'] = text.get('kind')
    fileinfo['extrainfo'] = text.get('extrainfo')
    fileinfo['ctime'] = os.path.getctime(path)
    fileinfo['atime'] = os.path.getatime(path)

    return fileinfo


def crawling():
    if global_var.crawling_locked:
        return

    global_var.crawler_locked = True
    list_of_patterns_to_be_ignore = None

    file_lister.main(global_var.dir_to_index, global_var.dir_to_ignore)

    for file_which_contains_full_path in os.listdir(global_var.data_dir + "/filelist"):
        to_crawl_filepath = global_var.data_dir + \
            '/filelist/' + file_which_contains_full_path
        filelist = lw.text2list(to_crawl_filepath)

        filename_in_crawled = global_var.data_dir + \
            '/crawled/' + file_which_contains_full_path
        if os.path.exists(filename_in_crawled) and os.stat(filename_in_crawled).st_size != 0:
            already_crawled_file = lw.text2list(filename_in_crawled)
            filelist = list(set(filelist) - set(already_crawled_file))

        try:
            os.mkdir(global_var.data_dir + '/crawled')
            os.mkdir(global_var.data_dir + "/crawled_data")
        except:
            pass

        crawled_data_file = open(
            global_var.data_dir + "/crawled_data" + "/" + file_which_contains_full_path, 'a')
        crawled_list_filepath = global_var.data_dir + \
            "/crawled/" + file_which_contains_full_path
        crawled_list = []
        global_var.logger.debug(f'FILELIST:{to_crawl_filepath} {filelist}')
        for filepath in filelist:

            fileinfo = crawling_and_adding_more_var(filepath)

            try:
                os.mkdir(global_var.data_dir + "/crawled_data")
            except:
                pass
            if fileinfo:

                crawled_list.append(filepath)
                json.dump(fileinfo, crawled_data_file)
                crawled_data_file.write('\n')

        lw.list2text(crawled_list, crawled_list_filepath, 'a')
        crawled_data_file.close()

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

        # open that specifice file from where file belongs to in crawled_data
        crawled_data_file = global_var.data_dir + \
            "/crawled_data/" + os.path.dirname(path)
        write_file = open(crawled_data_file, 'a')
        json.dump(fileinfo, write_file)
        write_file.write('\n')
        write_file.close()

        # note this file into crawled dir since it has crawled
        file_contains_crawled_list = global_var.data_dir + \
            '/crawled/' + uniqueid(os.path.dirname(path))
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
    main('/home/kcubeterm/alchemist')
