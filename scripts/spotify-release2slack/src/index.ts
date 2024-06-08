import { postSlack_ } from './slack';
import SpotifyClient from './spotify';
import type { Album } from './types/spotify';

function main() {
  const today = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd');
  const propertiesService = PropertiesService.getScriptProperties();
  const accessToken =
    propertiesService.getProperty('SPOTIFY_ACCESS_TOKEN') || '';

  if (accessToken) {
    const spotifyClient = new SpotifyClient();
    spotifyClient.initialize();

    const followingArtists = spotifyClient.getAllFollowedArtists();
    if (followingArtists.length === 0) {
      console.log('No following artists');
      return;
    }
    const artistIds = followingArtists.map(artist => artist.id);

    let allReleaseAlbums: Album[] = [];
    for (const artistId of artistIds) {
      const allArtistAlbums = spotifyClient.getAllArtistAlbums(artistId);
      const todayReleasedAlbum = allArtistAlbums.filter(
        album => album.release_date === today
      );
      const formattedAlbum = todayReleasedAlbum.map(album => {
        const artistNames = album.artists.map(artist => artist.name);
        return {
          name: album.name,
          artist: artistNames.join(', '),
          releaseDate: album.release_date,
          url: album.external_urls.spotify,
        };
      });
      allReleaseAlbums = [
        ...formattedAlbum,
        ...allReleaseAlbums,
      ];
    }
    if (allReleaseAlbums.length === 0) {
      console.log('No release albums');
      return;
    }
    postSlack_(allReleaseAlbums);
  }
}
