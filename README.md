# achoz

like a web search, but for your personal files. demo [here](https://achoz.ahoxus.org)
### Story 
> cregox have a lot of data. files, emails, messages, web links, web content, etc. they also are of different kinds; text, video, audio, apps, etc.
when trying to find something they do remember to be there, sometimes it gets impossible!
the goal of achoz is making cregox self-data-searching-life not only easier, but enable a new world of possibilities, in which they don’t have to worry anymore how to store data for themselves (as long as it’s stored with open and free standards).

more details at http://ahoxus.org/achoz

## Installation 

As of now achoz supports linux 64 bit architecure only.

you need to install typesense server https://typesense.org/downloads/

poppler-utils,jq and antiword.

```
npm install -g achoz
```
use sudo if you are not root.

## Usage 

Lets suppose you want to make your all file and directories in your home directory searchable. we call it normalize. Just follow four steps and boom. 


Step 1: Add dir in list. 

  `achoz add ~/`

Step 2: Lets invoke crawler to crawl it.

  `achoz crawl `

Step 3: Now start achoz engine. 

  `achoz engine `

  if it runs successfully, open another terminal for next step. let it run. 

Step 4: Now index all crawled file. 

  `achoz index`

Boom. you have normalize your home directory. It means you can search any documents, pdf, music, videos, and everthing that was there. Now browse and search string at http://localhost:9097

If you face issues in any of above steps, feel free to report it [here](https://github.com/kcubeterm/achoz/issues)



