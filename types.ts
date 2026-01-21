
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  duration?: string;
}

export interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  COVERFLOW = 'COVERFLOW',
  LIBRARY = 'LIBRARY',
  LYRICS = 'LYRICS'
}

export enum RepeatMode {
  NONE = 'NONE',
  ONE = 'ONE',
  ALL = 'ALL'
}
