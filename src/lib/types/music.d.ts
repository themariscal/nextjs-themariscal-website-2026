export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
  genres: string[];
  isVerified?: boolean;
}

export interface Album {
  id: string;
  name: string;
  artist: Artist;
  image: string;
  releaseDate: string;
  totalTracks: number;
  type: 'album' | 'single' | 'compilation';
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number; // in milliseconds
  explicit: boolean;
  popularity: number;
  previewUrl?: string;
  isPlaying?: boolean;
  isLiked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  image: string;
  owner: {
    name: string;
    id: string;
  };
  totalTracks: number;
  isPublic: boolean;
  isCollaborative: boolean;
  tracks: Track[];
}

export interface MusicCategory {
  id: string;
  name: string;
  description?: string;
  image: string;
  color: string;
  tracks?: Track[];
  playlists?: Playlist[];
  artists?: Artist[];
}

export interface RecentlyPlayed {
  track: Track;
  playedAt: string;
}

export interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}

export interface MusicContextType {
  state: MusicState;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}
