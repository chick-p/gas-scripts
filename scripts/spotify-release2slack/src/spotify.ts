import type {
  AccessTokenResponse,
  Artist,
  ArtistAlbum,
  ArtistAlbumsResponse,
  FollowedArtistsResponse,
} from './types/spotify';

const propertiesService = PropertiesService.getScriptProperties();
const authorizedCode =
  propertiesService.getProperty('SPOTIFY_AUTHORIZED_CODE') || '';
const callbackUrl = 'http://localhost:8888/callback';

export default class SpotifyClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string;
  private apiBaseUrl = 'https://api.spotify.com/v1';

  constructor() {
    this.clientId = propertiesService.getProperty('SPOTIFY_CLIENT_ID') || '';
    this.clientSecret =
      propertiesService.getProperty('SPOTIFY_CLIENT_SECRET') || '';
    this.accessToken =
      propertiesService.getProperty('SPOTIFY_ACCESS_TOKEN') || '';
  }

  public initialize() {
    if (!this.accessToken) {
      const resp = this.getAccessToken();

      this.accessToken = resp.access_token;

      propertiesService.setProperty('SPOTIFY_ACCESS_TOKEN', resp.access_token);
      propertiesService.setProperty(
        'SPOTIFY_REFRESH_TOKEN',
        resp.refresh_token
      );
    }
  }

  getAccessToken(): AccessTokenResponse {
    const headers = {
      Authorization: `Basic ${Utilities.base64Encode(`${this.clientId}:${this.clientSecret}`)}`,
    };
    const payload = {
      contentType: 'application/x-www-form-urlencoded',
      grant_type: 'authorization_code',
      code: authorizedCode,
      redirect_uri: callbackUrl,
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers,
      payload,
    };
    const resp = UrlFetchApp.fetch(
      'https://accounts.spotify.com/api/token',
      options
    );
    const respContent = resp.getContentText();

    return JSON.parse(respContent);
  }
  refreshAccessToken() {
    const headers = {
      'Authorization': `Basic ${Utilities.base64Encode(`${this.clientId}:${this.clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const refreshToken =
      propertiesService.getProperty('SPOTIFY_REFRESH_TOKEN') || '';
    if (!refreshToken) {
      throw new Error('Refresh token is not found');
    }
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers,
      payload,
    };
    const resp = UrlFetchApp.fetch(
      'https://accounts.spotify.com/api/token',
      options
    );
    const respContent = resp.getContentText();
    const respJson = JSON.parse(respContent);
    this.accessToken = respJson.access_token;
    propertiesService.setProperty('SPOTIFY_ACCESS_TOKEN', this.accessToken);
    if (respJson.refresh_token) {
      propertiesService.setProperty(
        'SPOTIFY_REFRESH_TOKEN',
        respJson.refresh_token
      );
    }
  }

  fetchFollowedArtists({
    nextArtistId = '',
  }: {
    nextArtistId: string;
  }): FollowedArtistsResponse {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'get',
      headers,
      muteHttpExceptions: true,
    };
    const resp = UrlFetchApp.fetch(
      `${this.apiBaseUrl}/me/following?type=artist&limit=50` +
        (nextArtistId ? `&after=${nextArtistId}` : ''),
      options
    );
    const statusCode = resp.getResponseCode();
    if (statusCode === 401) {
      this.refreshAccessToken();
      return this.fetchFollowedArtists({ nextArtistId });
    }
    if (statusCode !== 200) {
      throw new Error('Failed to fetch followed artists');
    }
    const respContentText = resp.getContentText();
    return JSON.parse(respContentText);
  }

  getFollowedArtistsRecursive({
    artists = [],
    nextArtistId = '',
  }: {
    artists?: Artist[];
    nextArtistId?: string;
  }): Artist[] {
    const resp = this.fetchFollowedArtists({ nextArtistId });
    const newArtists = artists.concat(resp.artists.items);
    if (resp.artists.cursors.after) {
      return this.getFollowedArtistsRecursive({
        artists: newArtists,
        nextArtistId: resp.artists.cursors.after,
      });
    }
    return newArtists;
  }

  public getAllFollowedArtists() {
    return this.getFollowedArtistsRecursive({});
  }

  fetchArtistAlbums(
    artistId: string,
    {
      limit,
      offset,
    }: {
      limit: number;
      offset: number;
    }
  ): ArtistAlbumsResponse {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept-Language': 'ja',
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'get',
      headers,
      muteHttpExceptions: true,
    };
    const resp = UrlFetchApp.fetch(
      `${this.apiBaseUrl}/artists/${artistId}/albums?offset=${offset}&limit=${limit}`,
      options
    );
    const statusCode = resp.getResponseCode();
    if (statusCode === 401) {
      this.refreshAccessToken();
      return this.fetchArtistAlbums(artistId, { limit, offset });
    }
    if (statusCode !== 200) {
      throw new Error('Failed to fetch artist albums');
    }

    const respContentText = resp.getContentText();
    return JSON.parse(respContentText);
  }

  getArtistAlbumsRecursive(
    artistId: string,
    {
      albums = [],
      offset = 0,
    }: {
      albums?: ArtistAlbum[];
      offset?: number;
    }
  ): ArtistAlbum[] {
    const limit = 50;
    const resp = this.fetchArtistAlbums(artistId, { limit, offset });
    const newAlbums = albums.concat(resp.items);
    if (resp.next) {
      return this.getArtistAlbumsRecursive(artistId, {
        albums: newAlbums,
        offset: offset + limit,
      });
    }
    return newAlbums;
  }

  getAllArtistAlbums(artistId: string) {
    return this.getArtistAlbumsRecursive(artistId, {});
  }

  getAllFollowedArtistAlbums(artistIds: string[]): ArtistAlbum[] {
    let albums: ArtistAlbum[] = [];
    artistIds.forEach(artistId => {
      const artistAlbums = this.getAllArtistAlbums(artistId);
      albums = albums.concat(artistAlbums);
    });
    return albums;
  }
}
