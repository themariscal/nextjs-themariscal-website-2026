import { Category, VideoData, ShortsData } from "@/lib/types/videos"

// Mock data - In a real app, this would come from an API
export const mockCategories: Category[] = [
    { id: 'all', name: 'Todo', isActive: true },
    { id: 'music', name: 'Música' },
    { id: 'gaming', name: 'Videojuegos' },
    { id: 'tv', name: 'Series de televisión' },
    { id: 'podcasts', name: 'Pódcasts' },
    { id: 'mixes', name: 'Mixes' },
    { id: 'disney', name: 'The Walt Disney Company' },
    { id: 'live', name: 'En directo', isLive: true },
    { id: 'code', name: 'Código fuente' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'framework', name: 'Framework' },
    { id: 'history', name: 'Historia' },
    { id: 'ai', name: 'Inteligencia artificial' },
]

export const mockVideos: VideoData[] = [
    {
        id: '1',
        title: 'ATENDIENDO BOLUD*S - LO QUE PASA CUANDO SOS UN CHORRO Y TE HACES EL CATEDRATICO - Simioteca',
        channel: 'Leandro Serodino',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
        duration: '35:14',
        views: '1.1K',
        publishedAt: 'hace 2 horas',
        category: 'Entretenimiento'
    },
    {
        id: '2',
        title: 'AGNES: EL MEJOR personaje de MERLINA Temporada 2',
        channel: 'CharlieTales',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
        duration: '9:16',
        views: '10K',
        publishedAt: 'hace 1 día',
        verified: true,
        category: 'Series'
    },
    {
        id: '3',
        title: 'Historias Innecesarias: Torres Gemelas',
        channel: 'Historias Innecesarias',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
        duration: '12:45',
        views: '600K',
        publishedAt: 'hace 1 día',
        verified: true,
        category: 'Historia'
    },
    {
        id: '4',
        title: 'INVIERNO DEL 92 CUARTETO DE NOS',
        channel: 'Música Clásica',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
        duration: '4:32',
        views: '25K',
        publishedAt: 'hace 3 días',
        category: 'Música'
    },
    {
        id: '5',
        title: 'OTRO DÍA PERDIDO PROGRAMA 10/09/25',
        channel: 'Programa TV',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
        duration: '45:20',
        views: '8.5K',
        publishedAt: 'hace 4 días',
        isLive: true,
        category: 'En Vivo'
    },
    {
        id: '6',
        title: 'MILCI - Análisis de Mercado Financiero',
        channel: 'Finanzas Pro',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
        duration: '18:30',
        views: '15.2K',
        publishedAt: 'hace 5 días',
        verified: true,
        category: 'Finanzas'
    }
]

export const mockShorts: ShortsData[] = [
    {
        id: 's1',
        title: 'Esta fue la acción más inteligente que Wednesday hizo mientras intercambiaba cuerpos con Enid.',
        channel: 'Wednesday Fan',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=355&fit=crop',
        views: '494K',
        publishedAt: 'hace 2 horas',
        likes: '45K',
        comments: '2.1K'
    },
    {
        id: 's2',
        title: 'Al pequeño George le gusta ver comedias de situación. #comedy #sitcom',
        channel: 'Comedy Central',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=355&fit=crop',
        views: '76K',
        publishedAt: 'hace 4 horas',
        likes: '8.2K',
        comments: '456'
    },
    {
        id: 's3',
        title: '#ArqueroPro #futbol #soccer #goalkeeper #meme',
        channel: 'Fútbol Mundial',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=355&fit=crop',
        views: '5.3M',
        publishedAt: 'hace 6 horas',
        verified: true,
        likes: '520K',
        comments: '12.5K'
    },
    {
        id: 's4',
        title: '¿Por qué Enid tiene el cabello multicolor en "Miércoles", pero no en LA familia Addams?',
        channel: 'Wednesday Theories',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=355&fit=crop',
        views: '689K',
        publishedAt: 'hace 8 horas',
        likes: '67K',
        comments: '3.2K'
    },
    {
        id: 's5',
        title: 'Todo sobre el iPhone 17 Pro',
        channel: 'Tech Review',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=355&fit=crop',
        views: '4.6K',
        publishedAt: 'hace 12 horas',
        verified: true,
        likes: '890',
        comments: '156'
    }
]