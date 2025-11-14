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


@csrf_exempt
def create_playlist(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')

            if not name:
                return JsonResponse({'success': False, 'error': 'No name provided'})

            playlist = Playlist.objects.create(name=name)

            return JsonResponse({
                'success': True,
                'playlist': {
                    'id': playlist.id,
                    'name': playlist.name
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def delete_playlist(request, playlist_id):
    if request.method == 'DELETE':
        try:
            playlist = Playlist.objects.get(id=playlist_id)
            playlist.delete()
            return JsonResponse({'success': True})
        except Playlist.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Playlist not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def add_to_playlist(request, playlist_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            music_id = data.get('song_id')
            if not music_id:
                return JsonResponse({'success': False, 'error': 'No song ID provided'})

            music = Music.objects.get(id=music_id)
            playlist = Playlist.objects.get(id=playlist_id)

            if playlist.music.filter().exists():
                return JsonResponse({'success': False, 'error': 'Playlist already has this song!'})

            playlist.music.add(music)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

        return JsonResponse({'success': True})

def get_playlist_songs(request, playlist_id):
    if request.method == 'GET':
        try:
            playlist = Playlist.objects.get(id=playlist_id)
            songs = list(Playlist.objects.get(id=playlist_id).music.values('title', 'artist', 'filepath'))

            return JsonResponse({
                'success': True,
                'playlist_name': playlist.name,
                'songs':songs
             })
        except Exception as e:
             return JsonResponse({'success': False, 'error': str(e)})