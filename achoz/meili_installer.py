import zipfile
from cv2 import DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMINGLUT
from requests import get
import platform
import os
import sys
def main(bin_dir):
    # check if meiliseaevh is already on path
    if bin_dir == 'none':
        bin_dir = None
        BIN_DIR = '/usr/local/bin'

    system = platform.system()
    machine = platform.machine()
    supported_os = ['linux', 'Linux']
    if not system in supported_os:
        print(f'Sorry your {system} dont support yet')
        exit(0)

    if not machine in ['aarch64', 'x86_64']:
        print(f'{machine} do not have support yet. ')
        exit(0)

    TMPDIR = os.environ.get('TMPDIR')
    if not TMPDIR:
        TMPDIR = '/tmp'

    if machine == 'x86_64':
        URL = "https://github.com/kcubeterm/achoz/releases/download/0.2.0/meilisearch_amd.zip"
    else:
        URL = "https://github.com/kcubeterm/achoz/releases/download/0.2.0/meilisearch_aarch64.zip"
    if bin_dir:
        BIN_DIR = os.path.expanduser(bin_dir)
    Binary_name_in_zipfile = 'meilisearch0.27.1'
    if os.path.expanduser('~') == '/data/data/com.termux/files/home':
        
        BIN_DIR = os.path.join(os.environ.get('PREFIX'), 'bin')
        if bin_dir:
            BIN_DIR=os.path.expanduser(bin_dir)
        TMPDIR = os.environ.get('TMPDIR')
        Binary_name_in_zipfile = 'meilisearch'
        URL= "https://github.com/kcubeterm/achoz/releases/download/0.2.0/meilisearch_0.27.2_termux_aarch64.zip"

    binary_path = os.path.join(os.path.abspath(os.path.expanduser(BIN_DIR)),'meilisearch')
    if os.path.exists(os.path.join(binary_path,'meilisearch')):
        print("seems like meilisearch is already installed. ")
        exit(0)
    print(f"Binary would be install at --> {binary_path}")
    ## download zipped file in tmpdir
    zip_file = os.path.join(TMPDIR,"z")
    with open(zip_file,"wb") as zf:
        r = get(URL,stream=True)
        total_length = r.headers.get('content-length')
        if total_length is None:
            zf.write(r.content)
        else:
            dl = 0
            for data in r.iter_content(chunk_size=4096):
                dl += len(data)
                zf.write(data)
                done = int(50 * int(dl) / int(total_length))
                sys.stdout.write("\r[%s%s]" % ('=' * done, ' ' * (50-done)) )    
                sys.stdout.flush()

    with zipfile.ZipFile(zip_file) as z:
        with open(binary_path,'wb') as bin:
            bin.write(z.read(Binary_name_in_zipfile))

    os.chmod(binary_path,0o755)
    os.remove(zip_file)
    print(f"\nMeilisearch has been successfully installed at {binary_path}")
    return

if __name__ == "__main__":
    main('.')

    