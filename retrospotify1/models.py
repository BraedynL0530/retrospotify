from django.db import models

# Create your models here.
class Music(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    filepath = models.CharField(max_length=500)
    added_on = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
class Playlist(models.Model):
    name = models.CharField(max_length=100)
    music = models.ManyToManyField(Music, related_name='playlists')
    def __str__(self):
        return self.name