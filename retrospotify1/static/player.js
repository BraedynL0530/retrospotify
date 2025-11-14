// =================== SONGS DATA ===================
let songs = typeof musicData !== 'undefined' ? musicData : [
  { title: "Summer Nights", artist: "Neon Dreams", filepath: "music/SummerNights.mp3" },
  { title: "Retro Wave", artist: "Synthwave Studio", filepath: "music/RetroWave.mp3" },
  { title: "Digital Love", artist: "Cyber Beats", filepath: "music/DigitalLove.mp3" }
];

let currentIndex = 0;
let isPlaying = false;

const audio = document.getElementById('audio-player');
const cdDisc = document.getElementById('cd-disc');
const scrollText = document.getElementById('song-info');
const pauseIcon = document.getElementById('pause-icon');

// =================== SONG DISPLAY & PLAY ===================
function updateSong() {
    const song = songs[currentIndex] || { title: "No song playing", artist: "", filepath: "" };
    scrollText.textContent = song.artist ? `${song.title} - ${song.artist}` : song.title;

    if (song.filepath) {
        const audioPath = song.filepath.startsWith('/') ? song.filepath : `/${song.filepath}`;
        audio.src = audioPath;
        audio.load();

        console.log('Loading audio from:', audioPath);

        if (isPlaying) {
            audio.play().catch(err => {
                console.error("Autoplay blocked or file not found:", err);
                isPlaying = false;
                cdDisc.classList.add('paused');
                pauseIcon.textContent = '▶';
            });
        }
    } else {
        audio.src = "";
        audio.pause();
        isPlaying = false;
        cdDisc.classList.add('paused');
        pauseIcon.textContent = '▶';
    }
}

function togglePlay() {
    if (!audio.src) {
        console.error('No audio source');
        alert('No song loaded!');
        return;
    }

    if (isPlaying) {
        audio.pause();
        cdDisc.classList.add('paused');
        pauseIcon.textContent = '▶';
        isPlaying = false;
    } else {
        audio.play()
            .then(() => {
                cdDisc.classList.remove('paused');
                pauseIcon.textContent = '⏸';
                isPlaying = true;
            })
            .catch(err => {
                console.error("Play failed:", err);
                alert(`Cannot play: ${audio.src}\n\nCheck console for details`);
                isPlaying = false;
                cdDisc.classList.add('paused');
                pauseIcon.textContent = '▶';
            });
    }
}

function nextSong() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex + 1) % songs.length;
    isPlaying = true;
    updateSong();
}

function prevSong() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    isPlaying = true;
    updateSong();
}

// =================== BUTTON EVENTS ===================
document.getElementById('pause').addEventListener('click', togglePlay);
document.getElementById('next').addEventListener('click', nextSong);
document.getElementById('prev').addEventListener('click', prevSong);

// =================== YOUTUBE DOWNLOAD ===================
document.getElementById('add-yt').addEventListener('click', () => {
    document.getElementById('yt-overlay').classList.add('active');
});

document.getElementById('close-yt').addEventListener('click', () => {
    document.getElementById('yt-overlay').classList.remove('active');
});

document.getElementById('yt-submit').addEventListener('click', async () => {
    const ytLink = document.getElementById('yt-link').value.trim();
    if (!ytLink) {
        alert('Please enter a YouTube URL');
        return;
    }

    // Validate YouTube URL
    if (!ytLink.includes('youtube.com') && !ytLink.includes('youtu.be')) {
        alert('Please enter a valid YouTube URL');
        return;
    }

    const title = prompt("Enter song title:", "YouTube Track");
    if (!title) return;

    const artist = prompt("Enter artist name:", "YouTube");
    if (!artist) return;

    // Show loading state
    const submitBtn = document.getElementById('yt-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Downloading...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/download-youtube/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: ytLink,
                title: title,
                artist: artist
            })
        });

        const data = await response.json();

        if (data.success) {
            // Add to songs array
            songs.push({
                title: data.song.title,
                artist: data.song.artist,
                filepath: data.song.filepath
            });

            document.getElementById('yt-link').value = '';
            document.getElementById('yt-overlay').classList.remove('active');

            alert(`✅ "${title}" downloaded successfully!\n\nIt's now in your playlist.`);

            // Optionally start playing the new song
            currentIndex = songs.length - 1;
            isPlaying = true;
            updateSong();
        } else {
            alert(`❌ Download failed:\n${data.error}\n\nPlease try again or check the URL.`);
        }
    } catch (error) {
        console.error('Download error:', error);
        alert(`❌ Network error:\n${error.message}\n\nCheck your connection and try again.`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// =================== PLAYLIST ===================
document.getElementById('playlist-btn').addEventListener('click', () => {
    document.getElementById('playlist-overlay').classList.add('active');
});

document.getElementById('close-playlist').addEventListener('click', () => {
    document.getElementById('playlist-overlay').classList.remove('active');
});

document.getElementById('create-playlist').addEventListener('click', () => {
    const playlistName = document.getElementById('new-playlist').value.trim();
    if (!playlistName) {
        alert('Please enter a playlist name');
        return;
    }

    const playlistList = document.getElementById('playlist-list');
    const emptyMessage = playlistList.querySelector('li');
    if (emptyMessage && emptyMessage.textContent === 'No playlists yet.') {
        playlistList.innerHTML = '';
    }

    const li = document.createElement('li');
    li.textContent = playlistName;
    playlistList.appendChild(li);

    document.getElementById('new-playlist').value = '';
    alert(`Playlist "${playlistName}" created!`);
});

// =================== OVERLAY CLOSE ===================
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// =================== AUTO NEXT ===================
audio.addEventListener('ended', nextSong);

// =================== ERROR HANDLING ===================
audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    console.error('Failed to load:', audio.src);
    isPlaying = false;
    cdDisc.classList.add('paused');
    pauseIcon.textContent = '▶';
});

audio.addEventListener('loadeddata', () => {
    console.log('Audio loaded successfully:', audio.src);
});

// =================== INITIALIZE ===================
console.log('Available songs:', songs);
updateSong();