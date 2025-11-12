from django.db import models

# Create your models here.
class Music(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    filepath = models.filepath(path='music/')
    added_on = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
class Playlist(models.Model):
    name = models.CharField(max_length=100)
    music = models.ManyToManyField(Music)