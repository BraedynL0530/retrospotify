import yt_dlp#i hate you pydub
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sanitize_filename(filename):
    """Remove invalid characters from filename"""
    # Remove invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Replace multiple spaces with single space
    filename = re.sub(r'\s+', ' ', filename)
    # Trim and limit length
    return filename.strip()[:100]


def downloadYtVideo(ytUrl):
    try:
        print(f"Starting download: {ytUrl}")

        # Set up output directory
        outputDir = os.path.join(BASE_DIR, "music")
        os.makedirs(outputDir, exist_ok=True)

        # Configure yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '128',  # Lower quality = faster conversion on Pi
            }],
            'concurrent_fragment_downloads': 1,  # Reduce memory usage
            'outtmpl': os.path.join(outputDir, '%(title)s.%(ext)s'),
            'quiet': False,
        }

        # Download and extract info
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(ytUrl, download=False)
            video_title = info.get('title', 'Unknown')
            print(f"Title: {video_title}")

            # Sanitize the title for filename
            safe_title = sanitize_filename(video_title)

            # Update output template with safe title
            ydl_opts['outtmpl'] = os.path.join(outputDir, f'{safe_title}.%(ext)s')

            # Now download with the safe filename
            with yt_dlp.YoutubeDL(ydl_opts) as ydl2:
                ydl2.download([ytUrl])

        # The file should now be saved as MP3
        mp3_filename = f"{safe_title}.mp3"
        mp3_path = os.path.join(outputDir, mp3_filename)

        # Check if file exists
        if not os.path.exists(mp3_path):
            print(f"Error: File not found at {mp3_path}")
            return None

        print(f"Successfully downloaded: {mp3_path}")
        return f"music/{mp3_filename}"

    except Exception as e:
        print(f"Error downloading YouTube video: {e}")
        import traceback
        traceback.print_exc()
        return None


def getYtData():
    """Scan music folder and add to database"""
    from retrospotify1.models import Music

    musicPath = os.path.join(BASE_DIR, "music")
    if not os.path.exists(musicPath):
        print("Music directory doesn't exist")
        return

    for file in os.listdir(musicPath):
        if file.endswith(".mp3"):
            # Try to parse title and artist from filename
            if "-" in file:
                parts = file.rsplit("-", 1)
                title = parts[0].strip()
                artist = parts[1].replace(".mp3", "").strip()
            else:
                title = file.replace(".mp3", "").strip()
                artist = "Unknown"

            filePath = f"music/{file}"

            # Check if already exists
            if not Music.objects.filter(filepath=filePath).exists():
                Music.objects.create(
                    title=title,
                    artist=artist,
                    filepath=filePath
                )
                print(f"Added: {title} - {artist}")

    print("Database updated with songs.")