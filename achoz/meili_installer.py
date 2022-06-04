import zipfile
from requests import get
import platform
import os
import stat

def main(bin_dir):
    system = platform.system()
    machine = platform.machine()
    supported_os = ['linux', 'Linux']
    if not system in supported_os:
        print(f'Sorry your {system} dont support yet')

    if not machine in ['aarch64', 'x86_64']:
        print(f'{machine} do not have support yet. ')

    BIN_DIR = '/usr/local/bin'
    TMPDIR = os.environ.get('TMPDIR')
    if not TMPDIR:
        TMPDIR = '/tmp'

    URL = "https://github.com/kcubeterm/achoz/releases/download/0.2.0/meilisearch_amd.zip"
    if bin_dir:
        BIN_DIR = os.path.abspath(bin_dir)

    if os.environ.get('TERMUX_VERSION'):
        BIN_DIR = os.path.join(os.environ.get('PREFIX'), 'bin')
        TMPDIR = os.environ.get('TMPDIR')
        URL="https://github.com/kcubeterm/achoz/releases/download/0.2.0/meilisearch_aarch64.zip"

    ## download zipped file in tmpdir
    r = get(URL)
    zip_file = os.path.join(TMPDIR,"z")
    with open(zip_file,"wb") as zf:
        zf.write(r.content)

    binary_path = os.path.join(BIN_DIR,'meilisearch')
    with zipfile.ZipFile(zip_file) as z:
        with open(binary_path,'wb') as bin:
            bin.write(z.read('meilisearch0.27.1'))

    os.chmod(binary_path,stat.S_IXOTH)
    os.remove(zip_file)
    return

if __name__ == "__main__":
    main('.')

    