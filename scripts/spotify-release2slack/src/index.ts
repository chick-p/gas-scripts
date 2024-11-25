import { postSlack_ } from './slack';
import SpotifyClient from './spotify';

export type Album = {
  artist: string;
  followingArtist: string;
  name: string;
  releaseDate: string;
  url: string;
}

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

    let allTodayReleaseAlbums: Album[] = [];
    for (const { id: artistId, name: followingArtistName } of followingArtists) {
      const allArtistAlbums = spotifyClient.getAllArtistAlbums(artistId);
      const todayReleasedAlbum = allArtistAlbums.filter(
        album => album.release_date === today
      );
      const formattedAlbum = todayReleasedAlbum.map(album => {
        const artistNames = album.artists.map(artist => artist.name);
        return {
          name: album.name,
          artist: artistNames.join(', '),
          followingArtist: followingArtistName,
          releaseDate: album.release_date,
          url: album.external_urls.spotify,
        };
      });
      allTodayReleaseAlbums = [...formattedAlbum, ...allTodayReleaseAlbums];
    }
    if (allTodayReleaseAlbums.length === 0) {
      console.log('No release albums');
      return;
    }
    postSlack_(allTodayReleaseAlbums);
  }
}
