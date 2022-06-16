import logging
import argparse
import json
import os
import sys
sys.path.insert(1,os.path.dirname(__file__))
import central_controller
import config
import global_var
import meili_installer
import signal

def config_creator(args,config_path):
    sample_config=dict()
    sample_config['dir_to_index'] = args.add_dirs[0].split(",") if args.add_dirs else []    
    sample_config['dir_to_ignore'] = ['*.git',"*.db",]
    sample_config['web_port'] = 8990
    sample_config['meili_api_port'] = 8989
    sample_config['data_dir'] = os.path.expanduser("~") + "/.achoz"
    sample_config['priority'] = 'low'

    new_config = open(config_path,'w')
    json.dump(sample_config,new_config,indent=4)
    return

def main():
    parser = argparse.ArgumentParser(prog=global_var.__program__, description='Search through all your personal data efficiently like web search.')
    parser.add_argument('start',nargs='?',help='start server')
    parser.add_argument('-a','--add-dirs',nargs=1,help="Provide comma seprated list of directory which will index. eg: dir1,dir2,dir3")
    parser.add_argument('-c','--config',nargs=1,help="Provide config file path. default:~/.achoz/config.json")
    parser.add_argument('-p','--port',nargs=1,type=int,help="port for web server. default:8990")
    parser.add_argument('-d','--data-dir',nargs=1,required=False, help="Provide data dir where programme will keep database etc, default:~/.achoz/")
    parser.add_argument('--install-meili',nargs='?',const='/usr/local/bin',help="Specify where to put meilisearch binary.")
    parser.add_argument('-v','--verbose',nargs='?',const='verbose',help='verbose output')
    parser.add_argument('--version',nargs='?',const=global_var.__version__,help='print version of program.')
    args = parser.parse_args()
    config_path=os.path.expanduser('~') + '/.achoz/config.json'
    data_dir = None
    web_port = None
    
    if args.install_meili:
        print("*"*50)
        print("installing meilisearch, please wait...")
        meili_installer.main(args.install_meili)
        exit(0)
    
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
    
    if args.version:
        print(f"{global_var.__program__}: {global_var.__version__}")

    dirs_to_index = []
    if args.add_dirs:
        to_index = args.add_dirs[0].split(",")
        for dir in to_index:
            dir = os.path.abspath(os.path.expanduser(dir))
            print(dir)
            dirs_to_index.append(dir)
            

    if args.start == 'start':
        # logger for debug
        global_var.logger.setLevel(logging.INFO)
        if args.verbose:
            global_var.logger.setLevel(logging.DEBUG)
        global_var.logger.info('Hello from mars')

        config.configure(user_dir_to_index=dirs_to_index,
                user_defined_config_file=config_path,
                user_defined_data_dir=data_dir,
                user_defined_web_port=web_port,)
        # global_var.logger.info(f"COMMAND LINE OPTIONS: {args}")
        if not global_var.dir_to_index:
            print(global_var.dir_to_index)
            global_var.logger.error('There is no directory specified for indexing')
            exit()
        central_controller.init()

def kill_meili():
    if global_var.meili_search_engine_pid:
            os.kill(global_var.meili_search_engine_pid,signal.SIGTERM)
    return
def cli():
    try:
        main()
    except KeyboardInterrupt:
        kill_meili()
    except SystemExit:
        kill_meili()
    except:
        kill_meili()
        global_var.logger.exception("<==============:APPLICATION CRASH:================>")
        global_var.logger.error("<==============:APPLICATION CRASH:================>")
    
if __name__ == "__main__":
    cli()