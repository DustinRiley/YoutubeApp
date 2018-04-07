
function populateSearch() {
    var searchTerm= $("input[name=query]").val();
    if(searchTerm===""){
        return;
    }
    $("#searchContainer").empty();
    getRequest(searchTerm);
}

//creates a JSON request from search term
function getRequest(searchTerm) {
    var url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        key: 'AIzaSyCNe2YcTQ6A96ni2C_7bxyoucT8mN0pQ9Q',
        maxResults: '10',
        q: searchTerm
    };

    $.getJSON(url, params, function (searchTerm) {
        showResults(searchTerm);
    });
}

function showResults(results) {
    var entries = results.items;

    $.each(entries, function (index, value) {
        if(value.id.kind==="youtube#channel"){
            return true;
        }
        var resultContainer= document.createElement('div');
        var title = value.snippet.title;
        var id = value.id.videoId;
        resultContainer.appendChild(createSearchThumbnail(id));
        resultContainer.appendChild(createSearchTitle(title));
        $(resultContainer).addClass("resultsContainer");
        $("#searchContainer").append(resultContainer);
    });

}

//Creates a Thumbnail element from a youtube ID
function createSearchThumbnail(id){
    var thumbnailElem= YTIDToImg(id);
    $(thumbnailElem).attr({width:"133", height: "100"});
    $(thumbnailElem).addClass("searchThumbnail");
    $(thumbnailElem).click(function () {
        populatePlaylist(id);
    });

    return thumbnailElem;
}

//Creates video title element
function createSearchTitle(title){
    var searchTitle = document.createElement('span');
    $(searchTitle).text(title);
    $(searchTitle).attr('id', 'videoInfoTitle');
    return searchTitle;
}
