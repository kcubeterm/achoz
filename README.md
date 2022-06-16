# achoz

like a web search, but for your personal files. demo [here](https://achoz.ahoxus.org)

what it will do is just normalize your all documents, and later it will be easy to search. Like suppose you read something fantastic in any of your pdf file, but after sometime you forgot the name of that pdf. Here web search may not help you but achoz surely gonna help you to find that file. 

### Story 
> cregox have a lot of data. files, emails, messages, web links, web content, etc. they also are of different kinds; text, video, audio, apps, etc.
when trying to find something they do remember to be there, sometimes it gets impossible!
the goal of achoz is making cregox self-data-searching-life not only easier, but enable a new world of possibilities, in which they don’t have to worry anymore how to store data for themselves (as long as it’s stored with open and free standards).

more details at http://ahoxus.org/achoz

# Installation.
## Linux (x86_64,aarch64)
### Requirement.
`python3.8+`
`meilisearch` 

User must have to ensure that you are using same meilisearch version as achoz. Since meilisearch database is not compatible over different version. so achoz have option to install meilisearch for you. 

following packages must be installed in your system. Instructions for Debian and ubuntu. use your own package manager to install it. 
```
apt-get install python-dev libxml2-dev libxslt1-dev antiword unrtf poppler-utils pstotext tesseract-ocr \
flac ffmpeg lame libmad0 libsox-fmt-mp3 sox libjpeg-dev swig
```

After that. use pip to install achoz.

```
pip install achoz
```

### Meilisearch
Once you have done with above. achoz executable should be in your PATH. Now lets install meilisearch. 

`sudo achoz --install-meili`

it will download and install meilisearch binary at `/usr/local/bin/` you could specify another path to install. just make sure that path should be cover by $PATH Environment.

`achoz --install-meili path/to/dir`


## Usage 

### Quick start

 
```
achoz start -a ~/Documents
```

for adding more directory, provide comma sepatated list of dirs. like `~/Documents,~/music` 

what above command gonna do is, it will start crawling all documents and file in `documents` directory. and it will start a web server at default port 8990. It will create an config.json at `~/.achoz` , you could add more options at config file or with command-line itself. 

Also using configuration file is recommended way to go with achoz. 
### Configuration. 

Config file at `~/.achoz/config.json` will create automatically if you run `achoz` with or without option at first time. 

**Sample config file**
```json
{
    "dir_to_index": ["/home/kcubeterm/Documents","/home/kcubeterm/books"],
    "dir_to_ignore": ["/home/kcubeterm/secrets/","*.git","*.db","*.achoz","*.config"],
    "web_port": 8990,
    "meili_api_port": 8989,
    "data_dir": "/home/kcubeterm/.achoz",
    "priority": "low"
}
```
#### Explain config

**dir_to_index**: contains list of directory which you are willing to normalize(crawl,index,searchable). command line option `-a dir1,dir2,dir3` does the same.

**dir_to_ignore**: contains list of patterns and directory which you are willing to ignore. one can use this option to ignore specifice extension too. suppose user want to ignore all .db extension, then using *.db will help to ignore any files or directory which has .db extension.
By Default It will ignore any hidden files or directory (directory which start form period '.') 

**web_port** : Specify on which port web server gonna listen. Default:8990


**meili_api_port**: The backend api Meilisearch server gonna listen on it. Default:8989


**data_dir**: Directory where program will keep metadata and database. Default: ~/.achoz


**priority**: (High or Low) It will decide priority of CPU time to be given to achoz program. Default: low

### Command-line options
`achoz -h` is enough to know about all command line option. 






