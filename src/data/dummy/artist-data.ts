export interface Artist {
    id: string;
    name: string;
    displayName: string;
    monthlyListeners: string;
    description: string;
    backgroundImage: string;
    profileImage: string;
    isFollowing: boolean;
    topTrack: {
        title: string;
        artist: string;
        isLiked: boolean;
    };
    credits: {
        role: string;
        name: string;
    }[];
    genres: string[];
    location: string;
    verified: boolean;
    popularTracks?: {
        title: string;
        plays: string;
        duration: string;
        isPlaying: boolean;
    }[];
    releases?: {
        title: string;
        type: string;
        year: string;
        image: string;
    }[];
}

export const lisandroSkar: Artist = {
    id: 'lisandro-skar',
    name: 'lisandro skar',
    displayName: 'lisandro skar',
    monthlyListeners: '374,369',
    description: 'Lisandro Skar, cantautor, compositor y artista integral nacido en Santa Fe, Argentina, destaca por su versatilidad y creatividad única. Dueño de un estilo que fusiona elementos del rock, pop y música alternativa, Skar ha logrado crear un sonido distintivo que resuena con audiencias de todas las edades. Su música refleja experiencias personales y sociales, conectando con los oyentes a través de letras profundas y melodías envolventes.',
    backgroundImage: '/images/cover.jpg',
    profileImage: '/images/cover.jpg',
    isFollowing: false,
    topTrack: {
        title: 'alguien que yo no es',
        artist: 'lisandro skar',
        isLiked: true,
    },
    credits: [
        {
            role: 'Artista Principal',
            name: 'lisandro skar'
        },
        {
            role: 'Composición, Letrista',
            name: 'Lisandro Oscar Baruffato'
        },
        {
            role: 'Producción',
            name: 'Rama Molina'
        },
        {
            role: 'Mezcla',
            name: 'Estudio Los Andes'
        },
        {
            role: 'Masterización',
            name: 'Carlos Álvarez'
        }
    ],
    genres: ['Rock', 'Pop', 'Alternativo', 'Indie'],
    location: 'Santa Fe, Argentina',
    verified: true,
};

// Otros artistas de ejemplo
export const andresCalamaro: Artist = {
    id: 'andres-calamaro',
    name: 'andres calamaro',
    displayName: 'Andrés Calamaro',
    monthlyListeners: '1.2M',
    description: 'Andrés Calamaro es uno de los músicos más influyentes del rock argentino. Con una carrera que abarca décadas, ha sido parte de bandas legendarias como Los Abuelos de la Nada y ha desarrollado una prolífica carrera solista.',
    backgroundImage: '/images/cover.jpg',
    profileImage: '/images/cover.jpg',
    isFollowing: true,
    topTrack: {
        title: 'El regreso',
        artist: 'Andrés Calamaro',
        isLiked: false,
    },
    credits: [
        {
            role: 'Artista Principal',
            name: 'Andrés Calamaro'
        },
        {
            role: 'Composición, Letrista',
            name: 'Andrés Calamaro'
        },
        {
            role: 'Producción',
            name: 'Gustavo Santaolalla'
        }
    ],
    genres: ['Rock', 'Pop Rock', 'Tango'],
    location: 'Buenos Aires, Argentina',
    verified: true,
};

export const kapanga: Artist = {
    id: 'kapanga',
    name: 'el mariscal',
    displayName: 'El Mariscal',
    monthlyListeners: '892K',
    description: 'El Mariscal es un artista argentino que combina elementos del rock nacional con influencias del ska y el reggae. Conocido por su energía en vivo y sus letras que reflejan la cultura argentina.',
    backgroundImage: '/images/cover.jpg',
    profileImage: '/images/cover.jpg',
    isFollowing: false,
    topTrack: {
        title: 'Lima',
        artist: 'El Mariscal',
        isLiked: true,
    },
    credits: [
        {
            role: 'Artista',
            name: 'El Mariscal'
        },
        {
            role: 'Voz Principal',
            name: 'El Mariscal'
        },
        {
            role: 'Guitarra',
            name: 'El Mariscal'
        },
        {
            role: 'Composición',
            name: 'El Mariscal'
        }
    ],
    genres: ['Rock', 'Ska', 'Reggae'],
    location: 'Buenos Aires, Argentina',
    verified: true,
    popularTracks: [
        { title: 'Abu Dhabi', plays: '6,274,038', duration: '2:29', isPlaying: false },
        { title: 'Forza', plays: '20,981,976', duration: '2:40', isPlaying: false },
        { title: 'Fantazija', plays: '21,931,284', duration: '2:24', isPlaying: true },
        { title: 'Urban Flow', plays: '15,234,567', duration: '2:55', isPlaying: false },
        { title: 'City Lights', plays: '8,765,432', duration: '3:12', isPlaying: false },
    ],
    releases: [
        { title: 'Urban Dreams', type: 'Álbum', year: '2024', image: '/images/cover.jpg' },
        { title: 'City Vibes', type: 'EP', year: '2023', image: '/images/cover.jpg' },
        { title: 'Street Stories', type: 'Sencillo', year: '2023', image: '/images/cover.jpg' },
    ]
};

export const grse: Artist = {
    id: 'grse',
    name: 'grse',
    displayName: 'Grše',
    monthlyListeners: '612,294',
    description: 'Grše es un artista emergente que combina elementos del hip-hop y el trap con influencias urbanas. Conocido por su estilo único y letras que reflejan la vida urbana moderna.',
    backgroundImage: '/images/cover.jpg',
    profileImage: '/images/cover.jpg',
    isFollowing: false,
    topTrack: {
        title: 'Fantazija',
        artist: 'Grše',
        isLiked: false,
    },
    credits: [
        {
            role: 'Artista Principal',
            name: 'Grše'
        },
        {
            role: 'Producción',
            name: 'Studio Urban'
        },
        {
            role: 'Mezcla',
            name: 'Audio Pro'
        }
    ],
    genres: ['Hip-Hop', 'Trap', 'Urban'],
    location: 'Zagreb, Croacia',
    verified: true,
};

export const artists = [lisandroSkar, andresCalamaro, kapanga, grse];
