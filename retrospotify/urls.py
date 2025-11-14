from django.urls import path
from retrospotify1.views import musicPlayer
from retrospotify1.views import download_youtube
from retrospotify1.views import create_playlist
from retrospotify1.views import delete_playlist
from retrospotify1.views import add_to_playlist
from retrospotify1.views import get_playlist_songs #stupid django


urlpatterns = [
    path('', musicPlayer, name='music_player'),
    path('api/download-youtube/', download_youtube, name='download_youtube'),
    path('api/playlist/create/', create_playlist, name='create_playlist'),
    path('api/playlist/<int:playlist_id>/delete/', delete_playlist, name='delete_playlist'),
    path('api/playlist/<int:playlist_id>/add/', add_to_playlist, name='add_to_playlist'),
    path('api/playlist/<int:playlist_id>/songs/', get_playlist_songs, name='get_playlist_songs'),
]