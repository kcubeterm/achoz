function search() {
    var json_data
    const params = new URLSearchParams(window.location.search)
    input = params.get('q')

    url = `/search-api?q=${input}`
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
        filename = data.hits[i].document.FileName
        search_list += `<li id=result> <p> ${filename} </p> </li>`
    }
    out.innerHTML = search_list
    if (input == "") {
        out.innerHTML = ""

    }
}
search()