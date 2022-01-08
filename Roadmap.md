## Roadmap 
* Better results (require some basic algorithm to show useful results.)
* Endless scrolling of results.
* Page navigation on the top (for easier navigation).
* Link to directly open the found file in browser itself. 
    - [x] Video preview
    - [x] Audio preview
    - [ ] Text and source code preview
    - [ ] PDF preview 

* Provide functionality to open files with system apps (could use xdg-open in linux)
* Admin panel 
* Meilisearch support
* Docker image
* Watch directory for changes and then update search engine documents. 

#### Magictill: Slim down files.
Slim down files on the basis of:
    How old it is and how frequently those files are access by user. 
     If any file is older than 1 year and did't access/used/open by user, then magictill script will slim down the quality of files into 85% by default
     
     
| Files older than | Slim down quality(by default)        |
|-------|-------------------------------------------------|
|2 year | 75%                                             |
|3 year | 65%                                             |
|5 year | 50%                                             |
|10 year|zipped and notify user to keep it in magnetic tap|
    
#### AI task
Implement computer vision to detects faces, objects and user status to sort files with better tag. 
example: 
    Suppose, user clicks lots of photos in his/her last night birthday parties. achoz will tag those photos with keyword 'birthday party' etc.
    It will help to give better search results. 

    
