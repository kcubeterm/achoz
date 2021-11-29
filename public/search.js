function search() {
    var json_data
    const params = new URLSearchParams(window.location.search);
    input = params.get('q');
    page_no = params.get('page') || 1;
    document.getElementById("search_input").value = input;
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

    var out = document.getElementById("results");
    out.innerHTML = ""
    var search_list = ""
    for (var i = 0; i < data.hits.length; i++) {
        var id = data.hits[i].document.id;
        var type = data.hits[i].document.type;
        var div = document.createElement("div");
        var abspath = data.hits[i].document.abspath;
        var filename = data.hits[i].document.name;
        var description = '';
        try {

            if (data.hits[i].highlights[0].hasOwnProperty('snippet')) {
                description = data.hits[i].highlights[0].snippet
            }
        } catch (error) {
            console.log(error)
        }
        switch (type) {
            case type.match(/video/)?.input:
                search_list += `<div class="result"> <span class="abspath"> ${abspath} </span> </br>
                    <a class="filename" href=/video?id=${id}> ${filename} </a>
                    <p class="description" > ${description} </p>
                         <p class="type" > ${type} </p> </div>
                        `

                break;
            case type.match(/audio/)?.input:
                search_list += `<div class="result"> <span class="abspath"> ${abspath} </span> </br>
                <p class="filename"> ${filename} </p>
                <audio controls src=/filereq?id=${id} > Your browser dont support this audio </audio>
                <p class="description" > ${description} </p>
                <p class="type" > ${type}</p> </div>
                `
                break;
            case type.match(/image/)?.input:
                search_list += `<div class="result"> <span class="abspath"> ${abspath} </span> </br>
                <p class="filename"> ${filename} </p>
                <div class=result-img>  
                <img width=300 src=/filereq?id=${id} >
                </div>
                <p class="description" > ${description} </p>
                <p class="type" > ${type} </p> </div>
                `
                break;
            default:
                search_list += `<div class="result"> <span class="abspath"> ${abspath} </span> </br>
        <a class="filename"> ${filename} </a>
        <p class="description" > ${description} </p>
        <p class="type" > ${type}  </p> </div>
        `
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
    document.getElementById('next').href = `/search?q=${input}&page=${page_no}`
    page_no = page_no - 2;
    document.getElementsById('previous').href = `/search?q=${input}&page=${page_no}`
    console.log('done')
}
search();