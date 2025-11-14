import json
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from retrospotify1.models import Playlist, Music
from retrospotify1.utils import downloadYtVideo

def musicPlayer(request):
    # Grab all songs
    music = list(Music.objects.values('title', 'artist', 'filepath'))
    music_json = json.dumps(music)

    playlists = Playlist.objects.all()

    return render(request, "musicPlayer.html", {
        "musicData": music_json,
        "playlists": playlists
    })


@csrf_exempt
def download_youtube(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            yt_url = data.get('url')
            title = data.get('title', 'YouTube Track')
            artist = data.get('artist', 'YouTube')

            if not yt_url:
                return JsonResponse({'success': False, 'error': 'No URL provided'})

            # Download and convert
            filepath = downloadYtVideo(yt_url)

            if not filepath:
                return JsonResponse({'success': False, 'error': 'Download failed'})

            # Save to database
            music = Music.objects.create(
                title=title,
                artist=artist,
                filepath=filepath
            )

            return JsonResponse({
                'success': True,
                'song': {
                    'title': music.title,
                    'artist': music.artist,
                    'filepath': music.filepath
                }
            })

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})