function search() {
    var json_data
    const params = new URLSearchParams(window.location.search)
    input = params.get('q')
    page_no = params.get('page') || 1;
    document.getElementById("search_input").value = input
    url = `/search-api?q=${input}&page=${page_no}`
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
        var div = document.createElement("div");
        filename = data.hits[i].document.name
        description = data.hits[i].highlights[0].snippet
        abspath = data.hits[i].document.abspath
        search_list += `<div class="result"> <span class="abspath"> ${abspath} </span> 
        <h3 class="filename"> ${filename} </h3>
        <p class="description" > ${description} </p></div>`
    }
    out.innerHTML = search_list
    if (input == "") {
        out.innerHTML = "virgin"

    }
    nextHandler()
}

function nextHandler() {
    page_no++;
    document.getElementById('next').href = `/search?q=${input}&page=${page_no}`
    page_no = page_no - 2;
    document.getElementById('previous').href = `/search?q=${input}&page=${page_no}`

}
search()