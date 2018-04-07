
//This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//This function creates an <iframe> (and YouTube player)
//after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

//The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

//The API calls this function when the player's state changes.
//The function indicates that when playing a video (state=1),
//the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data === 0) {
        playNextVideo();
    }
}

var counter=0;
var vidInfoList=[];
var vidHeight=105;

//Video Info Prototype
function YoutubeVideoInfo(YTID, thumbnailID){
    this.YTID=YTID;
    this.thumbnailID=thumbnailID;

    var vidInfo=getVidInfo(YTID);

    this.vidTitle=vidInfo.title;
    this.duration=vidInfo.duration;
}

//Retrieves youtube ID from a url and populates the playlist
function getYTID() {
    var YTURL = document.YoutubeID.YTURL.value;
    document.YoutubeID.reset();
    var YTID=extractYTID(YTURL);
    populatePlaylist(YTID);
}

function populatePlaylist(YTID){

    //Create new youtube video info prototype
    var thumbnailID= YTID+"thumbnailID"+String(counter);
    var YTVidInfo = new YoutubeVideoInfo(YTID, thumbnailID);

    //Autoplay next video if there is none in playlist queue
    if(player.getCurrentTime()===player.getDuration()){
        playNewVideo(YTID);
        return;
    }

    //Creating and populating thumbnail Container element
    var thumbnailContainer =document.createElement('div');
    thumbnailContainer.classList.add("thumbnailContainer");
    thumbnailContainer.appendChild(createThumbnail(YTVidInfo));
    thumbnailContainer.appendChild(createRemoveSign(YTVidInfo));

    //Creating and populating the video container element
    var vidInfoContainer = document.createElement('div');
    vidInfoContainer.id=thumbnailID;
    vidInfoContainer.classList.add("vidInfoContainer");
    vidInfoContainer.appendChild(createVidInfoTitle(YTVidInfo));
    vidInfoContainer.appendChild(createDragSign());
    vidInfoContainer.appendChild(thumbnailContainer);

    //Position element to correct y pos in playlist
    vidInfoContainer.style.top=(document.getElementById("playlistContainer").childElementCount*vidHeight)+"px";

    //make element draggable
    dragElement(vidInfoContainer);

    document.getElementById("playlistContainer").appendChild(vidInfoContainer);

    counter++;
    vidInfoList.push(vidInfoContainer);
    //Sort all vidInfoContainers by y pos
    vidInfoList.sort(function(a,b){return a.offsetTop-b.offsetTop});

}

//Creates the 3 bar drag sign img
function createDragSign(){
    var dragSign=document.createElement('img');
    dragSign.src= 'img/dragSign.png';
    dragSign.classList.add("dragSign");
    return dragSign;
}
//Gets video title and creates span element with text
function createVidInfoTitle(vidInfo) {
    var titleSpan = document.createElement('span');
    titleSpan.id="videoInfoTitle";
    titleSpan.innerHTML=vidInfo.vidTitle
    return titleSpan;
}
//Makes clickable video thumbnail element
function createThumbnail(vidInfo) {
    var thumbnail= YTIDToImg(vidInfo.YTID);

    thumbnail.onclick= function(){
        playNewVideo(vidInfo.YTID);
        removeThumbnail(vidInfo.thumbnailID);
        //Changes title of header to match that of curr video playing
        document.getElementById("videoTitle").innerHTML=vidInfo.vidTitle;};
    thumbnail.classList.add("thumbnail");

    return thumbnail;
}
//Creates clickable remove sign img
function createRemoveSign(vidInfo) {
    var removeSign =document.createElement('img');
    removeSign.src= 'img/removeSign.png';
    removeSign.classList.add("removeSign");
    removeSign.onclick=function(){
        removeThumbnail(vidInfo.thumbnailID) ;};
    return removeSign;
}

//Parse out title and length of video from a given youtube ID
function getVidInfo(YTID) {
    try {
        var URL = 'https://www.googleapis.com/youtube/v3/videos?id=' + YTID + '&key=AIzaSyCNe2YcTQ6A96ni2C_7bxyoucT8mN0pQ9Q&part=snippet,contentDetails,statistics,status';
        var jsonVidInfo = JSON.parse(GetURL(URL));
        return {
            title: jsonVidInfo.items[0].snippet.title,
            duration: jsonVidInfo.items[0].contentDetails.duration
        };
    }
    catch(err) {
        //Best error handling practice
    }

}

//Gets a given URL
function GetURL(Url){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",Url,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

//Plays next video and delete the appropriate vidInfoContainer
function playNextVideo(){
    var ID= vidInfoList[0].id;

    if(typeof ID==='undefined'){
    }
    else{
        var YTID=ID.substring(0,11);
        playNewVideo(YTID);
        removeThumbnail(ID);
   }
}

//Given a youtube url returns youtube ID
function extractYTID(str) {
    var n = str.search("=");
    return str.substring(n+1,n+12);
}

//Given youtube ID returns the thumbnail image as a HTML element
function YTIDToImg(YTID){
    var img = document.createElement('img');
    img.src = 'http://img.youtube.com/vi/'+YTID+'/sddefault.jpg';
    return img;
}

//Deletes specified thumbnail from DOM and list of video containers
function removeThumbnail(thumbnailID){
  var thumbnail=document.getElementById(thumbnailID);
  var index= vidInfoList.indexOf(thumbnail);
    if (index > -1) {
        vidInfoList.splice(index, 1);
    }
  var topPixel = thumbnail.style.top;
  thumbnail.parentNode.removeChild(thumbnail);
  decrementVidInfoContainers(topPixel);

}

//decreases all vidInfoContainers by video height that are higher then param
function decrementVidInfoContainers(pixelVal){
   //regex expersion to get rid of non-int values
   var deletedVid = pixelToInt(pixelVal);
   var allChildren=  document.getElementById("playlistContainer").childNodes;

   for(var i=0; i<=allChildren.length; i++){
       var child =allChildren[i];
       if(child!=null&&pixelToInt(child.style.top)>deletedVid){
           child.style.top=pixelToInt(allChildren[i].style.top)-vidHeight+"px";
       }
   }
}

//turns css pixel value to int
function pixelToInt(str){
   return str.replace(/\D+$/g, "");
}

//Loads and plays new video
function playNewVideo(YTID){
    player.loadVideoById(YTID, 0, "large");
    player.playVideo();
}

//Makes elements draggable
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0;
    var startingTop;
    var el = document.getElementById('playlistContainer');
    var elCurrPos= el.scrollTop;

        elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        startingTop =elmnt.offsetTop;
        pos2 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        elCurrPos= el.scrollTop;
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos2 - e.clientY;
        pos2 = e.clientY;

        //move sibiling elements when dragged element overlaps too much
        rearrangeChildren(elmnt,  (elmnt.offsetTop - pos1) );
        //move scroll bar down with dragged element
        adjustScrollBar(el,(elmnt.offsetTop - pos1),elCurrPos, elmnt);
        elmnt.style.top = (elmnt.offsetTop - pos1) + "px"
    }

    function closeDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
        //snaps element back to a correct pos
        correctElemntPos(elmnt);
        startingTop=elmnt.offsetTop;
        //sort vidInfoList after dragging is done to reflect correct order
        vidInfoList.sort(function(a,b){return a.offsetTop-b.offsetTop});

    }
}

//Moves the scroll bar down with the element being dragged
function adjustScrollBar(barPos, elmntY, startPos, elmnt) {
    try {
        if (elmntY + 75 > startPos + 390) {
            barPos.scrollTop += 5;
            elmnt.style.top = elmntY + 1 + "px";
        }
    }
    catch (err){

    }
}

//If element is moved overlapping another element switch that elements place accordingly
function rearrangeChildren(elmnt, elemntYPos) {
    try {
            //loop through every video in playlist
        for (var i = 0; i <= vidInfoList.length; i++) {
            var sibiling = vidInfoList[i];
            //if element being moved is not the same as the one being checked continue
            if(elmnt!=sibiling) {
                //Decreasing elements y case
                //if elem y pos is halfway through sibiling increase sibiling by height of sibiling
                if (elemntYPos - sibiling.offsetTop > 20 && elemntYPos - sibiling.offsetTop < 50) {
                    sibiling.style.top = sibiling.offsetTop + vidHeight + "px";
                }
                //increasing elements y case
                //if elem y pos is halfway through sibiling decrease sibiling by height of sibiling
                if (elemntYPos - sibiling.offsetTop < -20 && elemntYPos - sibiling.offsetTop > -50) {
                    sibiling.style.top = sibiling.offsetTop - vidHeight + "px";
                }
            }
        }
    }
    catch(err){
    }

}

//Snaps element back to correct pos
function correctElemntPos(elmnt){
   try {
       var x = elmnt.offsetTop / vidHeight;
       var xCeil = Math.ceil(x);
       var xFloor = Math.floor(x);
       //checks to see if element was dragged past last vid y pos
       if(elmnt.offsetTop>(vidInfoList.length-1)*vidHeight){
           elmnt.style.top = (vidInfoList.length -1)* vidHeight + "px";
           return;
       }
       //if element pos is outbounds snap to in bounds
       if(elmnt.offsetTop<0){
           elmnt.style.top=0+"px";
           return;
       }
       //if closer to floor snap to lower pos
       else if (xCeil - x > 0.5) {
           elmnt.style.top = xFloor * vidHeight + "px";
       }
       //else if closer to ceiling snap to higher pos
       else {
           elmnt.style.top = xCeil * vidHeight + "px";
       }
   }
   catch (err){

   }

}
