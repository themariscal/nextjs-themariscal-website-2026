import { Artist, Album, Track, Playlist, MusicCategory, RecentlyPlayed } from '@/lib/types/music';

// Artists data
export const artists: Artist[] = [
  {
    id: '1',
    name: 'Indio Solari',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face',
    followers: 1250000,
    genres: ['Rock', 'Alternative Rock'],
    isVerified: true,
  },
  {
    id: '2',
    name: 'Skay Beilinson',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    followers: 850000,
    genres: ['Rock', 'Blues Rock'],
    isVerified: true,
  },
  {
    id: '3',
    name: 'Patricio Rey y sus Redonditos de Ricota',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    followers: 2100000,
    genres: ['Rock', 'Alternative Rock'],
    isVerified: true,
  },
  {
    id: '4',
    name: 'La 25',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    followers: 650000,
    genres: ['Rock', 'Punk Rock'],
    isVerified: true,
  },
  {
    id: '5',
    name: 'Los Piojos',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
    followers: 1800000,
    genres: ['Rock', 'Reggae'],
    isVerified: true,
  },
  {
    id: '6',
    name: 'lisandro skar',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    followers: 374369,
    genres: ['Indie', 'Alternative'],
    isVerified: false,
  },
  {
    id: '7',
    name: 'Terapia',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
    followers: 450000,
    genres: ['Rock', 'Alternative'],
    isVerified: true,
  },
  {
    id: '8',
    name: 'Barbi Recanati',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    followers: 320000,
    genres: ['Indie', 'Pop'],
    isVerified: true,
  },
];

// Albums data
export const albums: Album[] = [
  {
    id: '1',
    name: 'El Regreso',
    artist: artists[0],
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    releaseDate: '2023-05-15',
    totalTracks: 12,
    type: 'album',
  },
  {
    id: '2',
    name: 'Lima',
    artist: artists[4],
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    releaseDate: '2022-08-20',
    totalTracks: 10,
    type: 'album',
  },
  {
    id: '3',
    name: 'DISCOTECA',
    artist: artists[6],
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
    releaseDate: '2024-01-10',
    totalTracks: 8,
    type: 'album',
  },
  {
    id: '4',
    name: 'Único y Nuestro',
    artist: artists[7],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    releaseDate: '2023-11-03',
    totalTracks: 11,
    type: 'album',
  },
];

// Tracks data
export const tracks: Track[] = [
  {
    id: '1',
    name: 'alguien que yo no es',
    artists: [artists[5]],
    album: {
      id: '5',
      name: 'Single',
      artist: artists[5],
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      releaseDate: '2024-02-01',
      totalTracks: 1,
      type: 'single',
    },
    duration: 177000, // 2:57
    explicit: false,
    popularity: 85,
    isPlaying: true,
    isLiked: true,
  },
  {
    id: '2',
    name: 'Cordero Atado',
    artists: [artists[2]],
    album: {
      id: '6',
      name: 'La Pasión de San Miguel de Tucumán',
      artist: artists[2],
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      releaseDate: '1990-01-01',
      totalTracks: 15,
      type: 'album',
    },
    duration: 245000, // 4:05
    explicit: false,
    popularity: 92,
    isLiked: false,
  },
  {
    id: '3',
    name: 'SHOC',
    artists: [artists[3]],
    album: {
      id: '7',
      name: 'SHOC',
      artist: artists[3],
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      releaseDate: '2019-03-15',
      totalTracks: 12,
      type: 'album',
    },
    duration: 198000, // 3:18
    explicit: true,
    popularity: 78,
    isLiked: true,
  },
  {
    id: '4',
    name: 'Azul',
    artists: [artists[4]],
    album: albums[1],
    duration: 223000, // 3:43
    explicit: false,
    popularity: 88,
    isLiked: false,
  },
  {
    id: '5',
    name: 'Despertate',
    artists: [artists[0]],
    album: {
      id: '8',
      name: 'Despertate',
      artist: artists[0],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      releaseDate: '2023-09-10',
      totalTracks: 1,
      type: 'single',
    },
    duration: 189000, // 3:09
    explicit: false,
    popularity: 76,
    isLiked: true,
  },
];

// Playlists data
export const playlists: Playlist[] = [
  {
    id: '1',
    name: 'Tus me gusta',
    description: 'Canciones que te gustan',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    owner: {
      name: 'Usuario',
      id: 'user-1',
    },
    totalTracks: 721,
    isPublic: false,
    isCollaborative: false,
    tracks: tracks.slice(0, 3),
  },
  {
    id: '2',
    name: 'Descubrimiento semanal',
    description: 'Tu playlist personalizada de descubrimiento semanal',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    owner: {
      name: 'Spotify',
      id: 'spotify',
    },
    totalTracks: 30,
    isPublic: false,
    isCollaborative: false,
    tracks: tracks.slice(0, 5),
  },
  {
    id: '3',
    name: 'Riviera Paradise',
    description: 'Una selección de música relajante',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    owner: {
      name: 'Usuario',
      id: 'user-1',
    },
    totalTracks: 45,
    isPublic: true,
    isCollaborative: false,
    tracks: tracks.slice(1, 4),
  },
];

// Music categories
export const musicCategories: MusicCategory[] = [
  {
    id: '1',
    name: 'Similares a Indio Solari',
    description: 'Artistas similares a Indio Solari',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    color: '#1db954',
    artists: [artists[1], artists[0], artists[2], artists[3], artists[4]],
  },
  {
    id: '2',
    name: 'Mejores selecciones de música nueva',
    description: 'Lo mejor de la música nueva',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
    color: '#ff6b6b',
    albums: [albums[2], albums[3]],
  },
  {
    id: '3',
    name: 'Artistas populares',
    description: 'Los artistas más populares del momento',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    color: '#4ecdc4',
    artists: artists.slice(0, 5),
  },
];

// Recently played
export const recentlyPlayed: RecentlyPlayed[] = [
  {
    track: tracks[0],
    playedAt: '2024-01-15T10:30:00Z',
  },
  {
    track: tracks[1],
    playedAt: '2024-01-15T09:15:00Z',
  },
  {
    track: tracks[2],
    playedAt: '2024-01-14T20:45:00Z',
  },
  {
    track: tracks[3],
    playedAt: '2024-01-14T18:20:00Z',
  },
  {
    track: tracks[4],
    playedAt: '2024-01-14T16:10:00Z',
  },
];

// Featured content
export const featuredContent = {
  recentlyPlayed: recentlyPlayed,
  madeForYou: playlists.slice(0, 2),
  categories: musicCategories,
  newReleases: albums,
  popularArtists: artists.slice(0, 5),
};
