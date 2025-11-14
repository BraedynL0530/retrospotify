from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from retrospotify1.views import musicPlayer, download_youtube

urlpatterns = [
    path("", musicPlayer, name="music_player"),
    path("api/download-youtube/", download_youtube, name="download_youtube"),#django feels glitchy? idk y i cant use views
]

urlpatterns += static("/music/", document_root=settings.BASE_DIR / "music")