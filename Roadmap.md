## Roadmap 

[broad view](ahoxus.org/achoz#roadmap)

#### Search
* **Better and _useful_ results**.

lower priority, in priority order:
* Link to directly open the found file in browser itself. 
    - [x] Video preview
    - [x] Audio preview
    - [ ] Text and source code preview
    - [ ] PDF preview 
* Watch directory for changes and then update search engine documents. 
* Docker image
* Meilisearch support
* Endless scrolling for the results.
* Admin panel 
* Provide functionality to open files with system apps (could use xdg-open in linux)

#### Magictill: Slim down files.
mostly focused on image and audio content. such as photos, videos, music, and pdf or container files which include such content.

during the search crawling of files, apply this script (easy to configure and change its settings directly on it):

older files bigger than 2mb in selected folders will get moved away and progressively further reduced, based on last time accessed (not the creation date).     

audio content (both from pure audio files and videos) simply get reduced to the bare minimum since the first scan: opus 16kbps stereo. from a usual 128kbps MP3, this offers nearly 90% compression with minimal audio quality loss.

in the first year...

photos: 1mp (perhaps 2mp)
videos: 720p (perhaps 1080p)

| Files older than | Slim down size (by default)            |
|---------|-------------------------------------------------|
| 1 year  | 50% (1mp turns 0.5mp)                           |
| 2 years | 25% (360p turns 180p)                           |
| 4 years | 12%                                             |
| 8 years | 6% (hard to see them at this point)             |
|16 years | deleted: keep checksum, metadata, and file name |
    
#### AI task
Implement *computer vision* to detects faces, objects, locations, etc to sort files with better tag. 

another example: 
    Suppose, user clicks lots of photos in his/her last night birthday parties. achoz will tag those photos with keyword '[ai] birthday party' etc.
    It will help to give better search results, and it will allow to easily sort out automated tags for manually improving them if needed.

    
