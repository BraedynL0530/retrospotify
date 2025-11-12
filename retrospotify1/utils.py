from pytube import YouTube
from pydub import audio_segment
import os
from retrospotify1 import models
def downloadYtVideo(ytUrl):
    try:
        yt = YouTube(ytUrl)
        print(f"Title: {yt.title}")
        ys = yt.streams.filter(only_audio=True).first()
        audioFile = ys.download()
        print(f"Download complete")

        base,ext = os.path.splitext(audioFile)
        audio = audio_segment.from_file(audioFile)
        audio.export(f"{base}.mp3",format="mp3")
        print(f"Converted to mp3")

        os.remove(audioFile)

    except Exception as e:
        print(f"Error: {e}")

#videoUrl=""
#downloadYtVideo(videoUrl)

def getYtData():
    #.join or something  to find artist and title from the - or by in yt titles
    models.Music.objects.create(
        title=title,
        artist=artist,
        filepath=audio
    )
    return  #for author + title later