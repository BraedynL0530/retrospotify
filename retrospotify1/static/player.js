// =================== SONGS DATA ===================
let songs = typeof musicData !== 'undefined' ? musicData : [
  { title: "Summer Nights", artist: "Neon Dreams", filepath: "music/SummerNights.mp3" },
  { title: "Retro Wave", artist: "Synthwave Studio", filepath: "music/RetroWave.mp3" },
  { title: "Digital Love", artist: "Cyber Beats", filepath: "music/DigitalLove.mp3" }
];

let currentIndex = 0;
let isPlaying = false;
let currentPlaylistId = null; // Track if we're playing from a playlist

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

// Add to playlist button
document.getElementById('add-to-playlist-btn').addEventListener('click', () => {
    showAddToPlaylistMenu();
});

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
                id: data.song.id,
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

document.getElementById('create-playlist').addEventListener('click', async () => {
    const playlistName = document.getElementById('new-playlist').value.trim();
    if (!playlistName) {
        alert('Please enter a playlist name');
        return;
    }

    try {
        const response = await fetch('/api/playlist/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playlistName })
        });

        const data = await response.json();

        if (data.success) {
            const playlistList = document.getElementById('playlist-list');
            const emptyMessage = playlistList.querySelector('li');
            if (emptyMessage && emptyMessage.textContent === 'No playlists yet.') {
                playlistList.innerHTML = '';
            }

            const li = document.createElement('li');
            li.dataset.playlistId = data.playlist.id;
            li.className = 'playlist-item';
            li.innerHTML = `
                <span class="playlist-name">${data.playlist.name}</span>
                <button class="delete-playlist" data-playlist-id="${data.playlist.id}">🗑️</button>
            `;

            // Add click handler for the new playlist item
            li.querySelector('.playlist-name').addEventListener('click', () => loadPlaylist(data.playlist.id));
            li.querySelector('.delete-playlist').addEventListener('click', (e) => {
                e.stopPropagation();
                deletePlaylist(data.playlist.id);
            });

            playlistList.appendChild(li);

            document.getElementById('new-playlist').value = '';
            alert(`✅ Playlist "${playlistName}" created!`);
        } else {
            alert(`❌ Failed to create playlist:\n${data.error}`);
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        alert(`❌ Network error:\n${error.message}`);
    }
});

// =================== OVERLAY CLOSE ===================
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// =================== PLAYLIST FUNCTIONS ===================
async function loadPlaylist(playlistId) {
    try {
        const response = await fetch(`/api/playlist/${playlistId}/songs/`);
        const data = await response.json();

        if (data.success && data.songs.length > 0) {
            // Load playlist songs into player
            songs = data.songs;
            currentIndex = 0;
            currentPlaylistId = playlistId;
            isPlaying = true;
            updateSong();

            document.getElementById('playlist-overlay').classList.remove('active');
            alert(`🎵 Now playing: ${data.playlist_name}\n${data.songs.length} song(s)`);
        } else if (data.success && data.songs.length === 0) {
            alert('⚠️ This playlist is empty!\n\nAdd songs by clicking "Add to Playlist" while playing a song.');
        } else {
            alert(`❌ Failed to load playlist:\n${data.error}`);
        }
    } catch (error) {
        console.error('Error loading playlist:', error);
        alert(`❌ Network error:\n${error.message}`);
    }
}

async function deletePlaylist(playlistId) {
    if (!confirm('Are you sure you want to delete this playlist?')) {
        return;
    }

    try {
        const response = await fetch(`/api/playlist/${playlistId}/delete/`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            // Remove from DOM
            const playlistItem = document.querySelector(`li[data-playlist-id="${playlistId}"]`);
            if (playlistItem) {
                playlistItem.remove();
            }

            // Check if playlist list is empty
            const playlistList = document.getElementById('playlist-list');
            if (playlistList.children.length === 0) {
                playlistList.innerHTML = '<li>No playlists yet.</li>';
            }

            alert('✅ Playlist deleted successfully!');
        } else {
            alert(`❌ Failed to delete playlist:\n${data.error}`);
        }
    } catch (error) {
        console.error('Error deleting playlist:', error);
        alert(`❌ Network error:\n${error.message}`);
    }
}

async function addToPlaylist(playlistId) {
    const currentSong = songs[currentIndex];

    if (!currentSong || !currentSong.id) {
        alert('⚠️ Cannot add this song to playlist.\n\nMake sure you\'re playing a saved song.');
        return;
    }

    try {
        const response = await fetch(`/api/playlist/${playlistId}/add/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ music_id: currentSong.id })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Song added to playlist!');
        } else {
            alert(`❌ Failed to add song:\n${data.error}`);
        }
    } catch (error) {
        console.error('Error adding to playlist:', error);
        alert(`❌ Network error:\n${error.message}`);
    }
}

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

// Add click handlers to existing playlists on page load
document.addEventListener('DOMContentLoaded', () => {
    const playlistItems = document.querySelectorAll('#playlist-list li[data-playlist-id]');
    playlistItems.forEach(item => {
        const playlistId = item.dataset.playlistId;
        const playlistName = item.querySelector('.playlist-name');
        const deleteBtn = item.querySelector('.delete-playlist');

        if (playlistName) {
            playlistName.addEventListener('click', () => loadPlaylist(playlistId));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePlaylist(playlistId);
            });
        }
    });
});

updateSong();