let currentsong = new Audio();  // Initialize a new Audio object for playing songs
let songs;  // Variable to store the list of songs
let currfolder;  // Variable to store the current folder
let vol = false;
// Function to format time in minutes:seconds format
function formatTime(seconds) {
    let totalSeconds = Math.floor(seconds);  // Round the total seconds to the nearest whole number
    let minutes = Math.floor(totalSeconds / 60);  // Calculate minutes
    let remainingSeconds = totalSeconds % 60;  // Calculate remaining seconds
    remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;  // Add leading zero if needed
    return `${minutes}:${remainingSeconds}`;  // Return formatted time
}

// Function to fetch songs from the specified folder
async function getsongs(folder) {
    currfolder = folder;  // Set the current folder
    let a = await fetch(`/${folder}/`);  // Fetch the folder content
    let response = await a.text();  // Convert response to text
    let div = document.createElement("div");  // Create a temporary div to parse HTML
    div.innerHTML = response;  // Set the HTML content of the div
    let as = div.getElementsByTagName("a");  // Get all anchor tags (links) in the div
    songs = [];  // Initialize the songs array
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {  // Check if the link ends with .mp3
            songs.push(element.href.split(`/${folder}/`)[1]);  // Add song to the list
        }
    }
    updateSongList();  // Update the song list in the UI
}

// Function to update the song list in the UI
function updateSongList() {
    let songUl = document.querySelector(".songlist ul");  // Get the song list element
    songUl.innerHTML = "";  // Clear the current list
    for (const song of songs) {  // Loop through each song
        songUl.innerHTML += `<li>
                                <img class="invert" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Diljit Dosanjh</div>
                                </div>
                                <div class="playnow">
                                    <span> Play now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div>
                            </li>`;  // Add song to the UI list
    }
    attachSongClickListeners();  // Attach click listeners to the songs
}

// Function to attach click listeners to each song in the list
function attachSongClickListeners() {
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());  // Play the clicked song
        });
    });
}

let currentIndex = 0;  // Initialize the current song index

// Function to play the selected song
function playMusic(track, pause = false) {
    currentsong.src = `/${currfolder}/` + track;  // Set the song source
    if (!pause) {
        currentsong.play();  // Play the song if not paused
        play.src = "img/pause.svg";  // Change the play button to pause
    } else {
        currentsong.play();  // Ensure the song plays even if paused is true
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);  // Update song information display
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";  // Reset song time display
    currentIndex = songs.indexOf(track);  // Update the currentIndex based on the current track
}

async function displayalbums() {
    let a = await fetch("/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);
    let anchors = div.getElementsByTagName("a")
    let cardcont = document.querySelector(".cardcont")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")&& !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardcont.innerHTML = cardcont.innerHTML + `<div class="rom"><div data-folder="${folder}" class="card">
                                <div class="play">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="54" height="54"
                                        color="#000000" fill="green">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                                        <path
                                            d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                            fill="currentColor" />
                                    </svg>
                                </div>
                                <img src="/songs/${folder}/cover.jpeg" alt="">
                                <h2>${response.title}</h2>
                                <p>${response.description} </p>
                            </div></div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {  // Event listener for card clicks to load a new playlist
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);  // Load songs from the selected folder
            playMusic(songs[0], true);  // Play the first song in the new folder in paused mode
        });
    });

}

// Main function to initialize the music player
async function main() {

    await getsongs("songs/cs");  // Get the songs from the "ncs" folder
    playMusic(songs[0], true);  // Play the first song in paused mode
    //display all the albums on the page
    displayalbums()

    play.addEventListener("click", () => {  // Event listener for play/pause button
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {  // Event listener for updating the song time
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {  // Event listener for the seek bar
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {  // Event listener for the hamburger menu
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {  // Event listener for closing the menu
        document.querySelector(".left").style.left = "-120%";
    });

    prev.addEventListener("click", () => {  // Event listener for the previous button
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);  // Play the previous song
        }
    });

    next.addEventListener("click", () => {  // Event listener for the next button
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);  // Play the next song
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {  // Event listener for volume control
        currentsong.volume = parseInt(e.target.value) / 100;
        if(currentsong.volume>0){
            document.querySelector(".volume > img").src =   document.querySelector(".volume > img").src.replace("vol-off.svg", "volume.svg");
        }
    });
    
    // add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click", e => {
        
        if (vol == false) {
            currentsong.volume = 0;
            vol = true;
           e.target.src =  e.target.src.replace("volume.svg","vol-off.svg");
           document.querySelector(".range input").value = 0;
        } else {
            currentsong.volume = 1;
            vol = false;
            e.target.src =   e.target.src.replace("vol-off.svg", "volume.svg");
            document.querySelector(".range input").value = 100;
        }
    });


}

main();  // Call the main function to start the music player
