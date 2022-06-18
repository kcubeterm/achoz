function search() {
    var json_data
    const params = new URLSearchParams(window.location.search);
    input = params.get('q');
    page_no = params.get('page') || 1;
    document.getElementById("input").value = input;
    url = `/search-api?q=${input}&page=${page_no}`;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            appendData(data);
        })
        .catch(function (err) {
            console.log(err);
        });

}

function appendData(data) {
    //  query info 
    number_of_documents = data.nbHits
    query_info = document.getElementById('query-info')
    query_string = data.query
    processing_time = data.processingTimeMs
    query_info.innerHTML = `<p> Found ${number_of_documents} Documents. Query: ${query_string}. Time: ${processing_time}ms`

    if (number_of_documents == 0) {
        console.log('zero douments found')
        return
    }
    var out = document.getElementById("results");
    out.innerHTML = ""
    var search_list = ""
    for (var i = 0; i < data.hits.length; i++) {
        var id = data.hits[i].id;
        var mime = data.hits[i].mime;
        var div = document.createElement("div");
        var abspath = data.hits[i].abspath;
        var filename = data.hits[i].title;
        var description = '';
        try {

            if (data.hits[i]._formatted.hasOwnProperty('content')) {
                description = data.hits[i]._formatted.content
            }
        } catch (error) {
            console.log(error)
        }
        let abspathHtml = `<span class="abspath"> <i class="fas fa-plane-departure" style='color:green' aria-hidden="true"></i>  ${abspath} </span> </br>`
        let fileNameHtml = `<a class="filename"> ${filename} </a>`
        let descriptionHtml = `<p class="description" > ${description} </p>`

        switch (mime) {
            case mime.match(/video/)?.input:
                search_list += `<div class="result"> ${abspathHtml}
                ${fileNameHtml}
                ${descriptionHtml}
                <p class="type" ><i class="fa fa-file-video" aria-hidden="true"></i> ${mime} </p> </div>`

                break;
            case mime.match(/audio/)?.input:
                search_list += `<div class="result"> ${abspathHtml}
                ${fileNameHtml}
                <audio controls src=/file?id=${id} > Your browser dont support this audio </audio>
                ${descriptionHtml}
                <p class="type" > <i class="fa fa-file-audio" aria-hidden="true"></i>${mime}</p> </div>
                `
                break;

            case mime.match(/image/)?.input:
                search_list += `<div class="result"> ${abspathHtml}
                ${fileNameHtml}
                <div class=result-img><img width=30% src=/file?id=${id}></div>
                ${descriptionHtml}
                <p class="type" > <i class="fa fa-file-image" aria-hidden="true"></i>${mime} </p> </div>
                `
                break;

            case mime.match(/pdf/)?.input:
                search_list += `<div class="result"> ${abspathHtml}
                ${fileNameHtml}
                ${descriptionHtml}
                <p class="type" style="color:red"><i class="fa fa-file-pdf" aria-hidden="true"></i> ${mime}</p></div>`
                break;

            case mime.match(/text/)?.input:
                search_list += `<div class="result"> ${abspathHtml}
                ${fileNameHtml}
                ${descriptionHtml}
                <p class="type" style="color:white"><i class="fa fa-file-text" aria-hidden="true"></i> ${mime}</p></div>`
                break;

            default:
                search_list += `<div class="result"> ${abspathHtml}
                ${filePathHtml}
                ${descriptionHtml}
                <p class="type" style="color:red"><i class="fa fa-file-pdf" aria-hidden="true"></i> ${mime}  </p></div>`
                break;
        }

        out.innerHTML = search_list;

    }
    if (input == "") {
        out.innerHTML = "virgin";

    }
    console.log('starting nexthandler')
    nextHandler();
}

function nextHandler() {

    page_no++;
    console.log(page_no)
    previous_no = page_no - 2;
    console.log('done')

    next_pre = document.getElementById('next-pre')
    next_pre.innerHTML = `
        <a id="previous" href = /search?q=${input}&page=${previous_no}> <i class="fa fa-angle-double-left"></i></a>
        <a id="next" href=/search?q=${input}&page=${page_no}><i class="fa fa-angle-double-right"></i></a`
}

search();