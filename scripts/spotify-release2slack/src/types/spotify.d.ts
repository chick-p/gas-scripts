export type AccessTokenResponse = {
  access_token: string;
  refresh_token: string;
};

export type Image = {
  url: string;
  height: number;
  width: number;
};

export type Artist = {
  external_urls: {
    spotify: string;
  };
  name: string;
  genres: string[];
  id: string;
  images: Image[];
  uri: string;
  type: 'artist';
};

export type FollowedArtistsResponse = {
  artists: {
    items: Artist[];
    total: number;
    cursors: {
      after: string;
      before: string;
    };
  };
};

export type ArtistAlbumsResponse = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: ArtistAlbum[];
};

export type ArtistAlbum = {
  album_type: 'album' | 'single' | 'compilation';
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  images: Image[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  artists: Artist[];
};

export type Album = {
  artist: string;
  name: string;
  releaseDate: string;
  url: string;
}
