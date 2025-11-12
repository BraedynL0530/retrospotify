from pytube import YouTube
from pydub import AudioSegment
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
        
        outpuDir ="music/"
        baseName = os.path.basename(base)
        mp3Path = oa.path.join(outputdir,f"{baseName}.mp3")
        audio.export(mp3Path,format="mp3")
        print(f"Converted to mp3")

        os.remove(audioFile)

    except Exception as e:
        print(f"Error: {e}")

#videoUrl=""
#downloadYtVideo(videoUrl)

def getYtData(): 
    musicPath ="music/"
    for file in os.listdir(musicPath):
        if '-' in file:
            title, artist = file.rsplit("-",1) #Right most incase of -Remix
            title = title.strip($
            artist = artist.replace(".mp3","").strip
            
            filePath = os.path.join(musicPath, file)
            models.Music.objects.create(
               title=title,
               artist=artist,
               file_path=filePath                    
            )
    return  #for author + title later