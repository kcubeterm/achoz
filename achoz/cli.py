
import argparse
import json
import os
import sys
sys.path.insert(1,os.path.dirname(__file__))
import central_controller
import config
import global_var


def config_creator(args,config_path):
    sample_config=dict()
    sample_config['dir_to_index'] = args.add_dirs[0].split(",") if args.add_dirs else []    
    sample_config['dir_to_ignore'] = ['*.git',"*.db",]
    sample_config['web_port'] = 8990
    sample_config['meili_api_port'] = 8989
    sample_config['data_dir'] = os.path.expanduser("~") + "/.achoz"

    new_config = open(config_path,'w')
    json.dump(sample_config,new_config,indent=4)
    return

def main():
    parser = argparse.ArgumentParser(prog='achoz', description='Search through all your personal data efficiently like web search.')
    parser.add_argument('-a','--add-dirs',nargs=1,help="Provide comma seprated list of directory which will index. eg: dir1,dir2,dir3")
    parser.add_argument('-c','--config',nargs=1,help="Provide config file path. default:~/.achoz/config.json")
    parser.add_argument('-p','--port',nargs=1,type=int,help="port for web server. default:8990")
    parser.add_argument('-d','--data-dir',nargs=1,help="Provide data dir where programme will keep database etc, default:~/.achoz/")
    args = parser.parse_args()

    config_path=config_path = os.path.expanduser('~') + '/.achoz/config.json'
    data_dir = None
    web_port = None

            

        




    if not args.config and not os.path.exists(config_path):
        try:
            os.mkdir(os.path.dirname(config_path))
        except:
            pass
        
        ## write smaple config on default location
        config_creator(args,config_path)



    if args.config:
        config_path = args.config[0]



    if args.port:
        web_port=args.port[0]


    if args.data_dir:
        data_dir = args.data_dir[0]

    dirs_to_index = []
    if args.add_dirs:
        to_index = args.add_dirs[0].split(",")
        for dir in to_index:
            dir = os.path.abspath(os.path.expanduser(dir))
            dirs_to_index.append(dir)

    config.configure(dirs_to_index, config_path,data_dir,web_port)


    if not global_var.dir_to_index:
        print(global_var.dir_to_index)
        print(type(global_var.logger.error()))
        global_var.logger.error('There is no directory specified for indexing')
        exit()
    central_controller.init()


if __name__ == "__main__":
    main()
