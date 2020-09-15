const playPauseButton = document.querySelector("#playPauseButton");
const playPauseButtonImage = document.querySelector("#playPauseButtonImage");
const volumeSlider = document.querySelector("#volumeSlider");
const volumeSliderValueText = document.querySelector("#volumeSliderValueText");
const artworkImage = document.querySelector("#artworkImage");
const titleText = document.querySelector("#titleText");
const listeningTimeText = document.querySelector("#listeningTimeText");
const listenerAmountText = document.querySelector("#listenerAmountText");
const artistText = document.querySelector("#artistText");
const mainAudioElement = document.querySelector("audio");
mainAudioElement.crossOrigin = "anonymous";
const _URL = new URL(window.location.href);

const URL_PREFIX = _URL.searchParams.has("URL_PREFIX") ? _URL.searchParams.get("URL_PREFIX") : window.location.protocol+"//"+window.location.host;
const RADIO_SRC = URL_PREFIX+"/stream.mp3";

let TOTAL_LISTENING_TIME = 0;

artworkImage.src = URL_PREFIX+"/songInfo/Snip_Artwork.jpg";

(()=>{
    let volume = parseFloat(localStorage.getItem("app.radyoma.radioVolume"));
    volume = volume ? volume : 1;
    volumeSlider.value = volume;
    mainAudioElement.volume = volume;
    volumeSliderValueText.textContent = (volume * 100).toFixed(0);
})();

playPauseButton.addEventListener("click",()=>{
    if (mainAudioElement.paused) {
        startRadio();
    } else {
        pauseRadio();
    }
})

document.body.addEventListener("keyup",(e)=>{
    if (e.key == " ") {
        playPauseButton.click();
    }
})

function setButtonType(playing,loading=false) {
    (loading ? playPauseButtonImage.classList.add("loading") : playPauseButtonImage.classList.remove("loading"));
    (playing ? playPauseButtonImage.setAttribute("src","./pause.svg") : playPauseButtonImage.setAttribute("src","./play.svg"));
}

async function startRadio() {
    setButtonType(false, true);
    mainAudioElement.src = RADIO_SRC;
    await mainAudioElement.play();
    setButtonType(true, false);
}

function pauseRadio() {
    mainAudioElement.pause();
    mainAudioElement.src = "";
    setButtonType(false, false);
}

async function updateDetails() {
    let songData = (await (await fetch(URL_PREFIX+"/songInfo/Snip.txt")).text());
    songData = parseEnvTypeTextBody(songData);
    artworkImage.src = URL_PREFIX+songData.artwork;
    titleText.textContent = songData.title;
    artistText.textContent = songData.artist;

    let {icestats: iceStats} = (await (await fetch(URL_PREFIX+"/status-json.xsl")).json());
    listenerAmountText.textContent = `${iceStats.source.listeners}/${iceStats.source.listener_peak} listener.`;

    let otherData = (await (await fetch(URL_PREFIX+"/otherData.txt")).text());
    otherData = parseEnvTypeTextBody(otherData);

    (otherData.radyomaNightMode == "true" ? document.body.classList.add("night-mode") : document.body.classList.remove("night-mode"));
}

volumeSlider.addEventListener("input",()=>{
    mainAudioElement.volume = volumeSlider.value;
    volumeSliderValueText.textContent = (volumeSlider.value * 100).toFixed(0);
})

volumeSlider.addEventListener("change",()=>{
    localStorage.setItem("app.radyoma.radioVolume", volumeSlider.value);
})

function parseEnvTypeTextBody(text="") {
    return Object.fromEntries(text.split("\n").map(vk=>vk.split("=",2)));
}

setInterval(updateDetails,5000);
updateDetails();

setInterval(()=>{
    if (mainAudioElement.played.length) {
        TOTAL_LISTENING_TIME += 1000;
        let m = moment.duration(TOTAL_LISTENING_TIME,"milliseconds")
        listeningTimeText.textContent = m.format("hh:mm:ss",{trim:false});
    }
},1000)

startRadio();
window.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
        document.body.classList.remove("hidden");
        setTimeout(()=>{
            document.body.classList.remove("hidden-main");
        },2500)
    },2500)
})

function arrayAverage(arr){
    //Find the sum
    var sum = 0;
    for(var i in arr) {
        sum += arr[i];
    }
    //Get the length of the array
    var numbersCnt = arr.length;
    //Return the average / mean.
    return (sum / numbersCnt);
}