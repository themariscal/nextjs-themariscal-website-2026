export interface ChatSuggestions {
  home: string[];
  jobs: string[];
  music: string[];
  videos: string[];
  default: string[];
}

export const chatSuggestions: ChatSuggestions = {
  home: [
    "¿Qué es The Mariscal?",
    "¿Cómo funciona la plataforma?",
    "¿Qué puedo hacer aquí?",
    "¿Cómo crear una cuenta?",
    "¿Qué es trending hoy?",
  ],
  jobs: [
    "¿Cómo buscar trabajos?",
    "¿Cómo postular a un empleo?",
    "¿Qué tipos de trabajos hay?",
    "¿Cómo crear mi perfil profesional?",
    "¿Cómo contactar a los empleadores?",
  ],
  music: [
    "¿Cómo escuchar música?",
    "¿Cómo subir mi música?",
    "¿Qué géneros están disponibles?",
    "¿Cómo crear una playlist?",
    "¿Cómo descubrir nuevos artistas?",
  ],
  videos: [
    "¿Cómo ver videos?",
    "¿Cómo subir un video?",
    "¿Qué tipos de contenido hay?",
    "¿Cómo crear un canal?",
    "¿Cómo interactuar con videos?",
  ],
  default: [
    "¿Qué es The Mariscal?",
    "¿Cómo funciona la música?",
    "¿Dónde están los trabajos?",
    "¿Cómo crear una cuenta?",
    "¿Qué es trending?",
    "¿Cómo subir contenido?",
  ],
};

export const getSuggestionsForPage = (pathname: string): string[] => {
  // Extract the main section from the pathname
  const segments = pathname.split('/').filter(Boolean);
  
  // Check for specific page types
  if (pathname.includes('/jobs') || segments.includes('jobs')) {
    return chatSuggestions.jobs;
  }
  
  if (pathname.includes('/music') || segments.includes('music')) {
    return chatSuggestions.music;
  }
  
  if (pathname.includes('/videos') || segments.includes('videos')) {
    return chatSuggestions.videos;
  }
  
  // Check if it's the home page
  if (pathname === '/' || pathname === '/es' || pathname === '/en' || 
      pathname.match(/^\/[a-z]{2}$/) || segments.length === 0) {
    return chatSuggestions.home;
  }
  
  // Default suggestions for any other page
  return chatSuggestions.default;
};
