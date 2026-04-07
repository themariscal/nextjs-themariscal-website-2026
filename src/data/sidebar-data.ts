import { SidebarData } from "@/lib/types/sidebar";

// Reddit-style sidebar data with translation keys
export const appSidebarData: SidebarData = {
  popular: {
    title: "popular",
    icon: "rotate-ccw",
    url: "/popular",
  },
  sections: [
    {
      title: "sections.reciente",
      icon: null,
      items: [
        {
          title: "recent.discordapp",
          icon: "discord", // Custom Discord icon
          url: "/r/discordapp",
        },
      ],
    },
    {
      title: "sections.temas",
      icon: null,
      items: [
        {
          title: "categories.culturaInternet",
          icon: "smile",
          isExpanded: true,
          subitems: [
            { title: "subcategories.increible", url: "/temas/increible" },
            { title: "subcategories.animales", url: "/temas/animales" },
            { title: "subcategories.cringe", url: "/temas/cringe" },
            { title: "subcategories.humor", url: "/temas/humor" },
            { title: "subcategories.interesante", url: "/temas/interesante" },
            { title: "subcategories.memes", url: "/temas/memes" },
            { title: "subcategories.satisfactorio", url: "/temas/satisfactorio" },
            { title: "subcategories.meta", url: "/temas/meta" },
            { title: "subcategories.reconfortante", url: "/temas/reconfortante" },
          ],
        },
        {
          title: "categories.juegos",
          icon: "gamepad2",
          isExpanded: true,
          subitems: [
            { title: "subcategories.juegosAccion", url: "/juegos/accion" },
            { title: "subcategories.juegosAventura", url: "/juegos/aventura" },
            { title: "subcategories.esports", url: "/juegos/esports" },
            { title: "subcategories.consolas", url: "/juegos/consolas" },
            { title: "subcategories.noticiasJuegos", url: "/juegos/noticias" },
            { title: "subcategories.juegosMoviles", url: "/juegos/moviles" },
            { title: "subcategories.otrosJuegos", url: "/juegos/otros" },
            { title: "subcategories.juegosRol", url: "/juegos/rol" },
            { title: "subcategories.juegosSimulacion", url: "/juegos/simulacion" },
            { title: "subcategories.juegosDeportes", url: "/juegos/deportes" },
            { title: "subcategories.juegosEstrategia", url: "/juegos/estrategia" },
            { title: "subcategories.juegosMesa", url: "/juegos/mesa" },
          ],
        },
        {
          title: "categories.preguntasRespuestas",
          icon: "message-circle-question",
          isExpanded: true,
          subitems: [
            { title: "subcategories.preguntasRespuestas", url: "/preguntas/respuestas" },
            { title: "subcategories.historias", url: "/preguntas/historias" },
          ],
        },
        {
          title: "categories.tecnologia",
          icon: "cpu",
          isExpanded: true,
          subitems: [
            { title: "subcategories.impresion3d", url: "/tecnologia/impresion-3d" },
            { title: "subcategories.inteligenciaArtificial", url: "/tecnologia/ia" },
            { title: "subcategories.hardware", url: "/tecnologia/hardware" },
            { title: "subcategories.electronica", url: "/tecnologia/electronica" },
            { title: "subcategories.bricolaje", url: "/tecnologia/bricolaje" },
            { title: "subcategories.programacion", url: "/tecnologia/programacion" },
            { title: "subcategories.software", url: "/tecnologia/software" },
            { title: "subcategories.streaming", url: "/tecnologia/streaming" },
            { title: "subcategories.noticiasTecnologia", url: "/tecnologia/noticias" },
            { title: "subcategories.realidadVirtual", url: "/tecnologia/realidad-virtual" },
          ],
        },
        {
          title: "categories.culturaPop",
          icon: "star",
          isExpanded: true,
          subitems: [
            { title: "subcategories.famosos", url: "/cultura-pop/famosos" },
            { title: "subcategories.influencers", url: "/cultura-pop/influencers" },
            { title: "subcategories.nostalgia", url: "/cultura-pop/nostalgia" },
            { title: "subcategories.podcasts", url: "/cultura-pop/podcasts" },
            { title: "subcategories.streamers", url: "/cultura-pop/streamers" },
            { title: "subcategories.tarot", url: "/cultura-pop/tarot" },
          ],
        },
        {
          title: "categories.peliculasTV",
          icon: "film",
          isExpanded: true,
          subitems: [
            { title: "subcategories.peliculasAccion", url: "/peliculas/accion" },
            { title: "subcategories.peliculasAnimadas", url: "/peliculas/animadas" },
            { title: "subcategories.peliculasComedia", url: "/peliculas/comedia" },
            { title: "subcategories.peliculasSobre", url: "/peliculas/sobre" },
            { title: "subcategories.peliculasDocumentales", url: "/peliculas/documentales" },
            { title: "subcategories.peliculasDrama", url: "/peliculas/drama" },
            { title: "subcategories.peliculasFamilia", url: "/peliculas/familia" },
            { title: "subcategories.peliculasTerror", url: "/peliculas/terror" },
            { title: "subcategories.noticiasPeliculas", url: "/peliculas/noticias" },
            { title: "subcategories.realityShows", url: "/peliculas/reality" },
            { title: "subcategories.peliculasRomanticas", url: "/peliculas/romanticas" },
            { title: "subcategories.peliculasCienciaFiccion", url: "/peliculas/ciencia-ficcion" },
            { title: "subcategories.peliculasSuspense", url: "/peliculas/suspense" },
          ],
        },
        // Additional categories that show when "Ver más" is clicked
        {
          title: "categories.anime",
          icon: "eye",
          url: "/anime",
        },
        {
          title: "categories.artes",
          icon: "palette",
          url: "/artes",
        },
        {
          title: "categories.negocios",
          icon: "trending-up",
          url: "/negocios",
        },
        {
          title: "categories.coleccionables",
          icon: "truck",
          url: "/coleccionables",
        },
        {
          title: "categories.educacion",
          icon: "wrench",
          url: "/educacion",
        },
        {
          title: "categories.moda",
          icon: "sparkles",
          url: "/moda",
        },
        {
          title: "categories.comida",
          icon: "utensils",
          url: "/comida",
        },
        {
          title: "categories.hogar",
          icon: "tree-pine",
          url: "/hogar",
        },
        {
          title: "categories.humanidades",
          icon: "scale",
          url: "/humanidades",
        },
        {
          title: "categories.musica",
          icon: "headphones",
          url: "/musica",
        },
        {
          title: "categories.naturaleza",
          icon: "tree",
          url: "/naturaleza",
        },
        {
          title: "categories.noticias",
          icon: "newspaper",
          url: "/noticias",
        },
        {
          title: "categories.viajes",
          icon: "plane",
          url: "/viajes",
        },
        {
          title: "categories.ciencia",
          icon: "flask-conical",
          url: "/ciencia",
        },
        {
          title: "categories.deportes",
          icon: "tennis",
          url: "/deportes",
        },
        {
          title: "categories.espeluznante",
          icon: "ufo",
          url: "/espeluznante",
        },
        {
          title: "categories.vehiculos",
          icon: "steering-wheel",
          url: "/vehiculos",
        },
        {
          title: "categories.bienestar",
          icon: "heart",
          url: "/bienestar",
        },
      ],
      showMore: true,
    },
    {
      title: "sections.recursos",
      icon: null,
      items: [
        {
          title: "resources.acercaReddit",
          icon: "reddit", // Custom Reddit icon
          url: "/about",
        },
        {
          title: "resources.anunciarse",
          icon: "megaphone",
          url: "/advertise",
        },
        {
          title: "resources.redditPro",
          icon: "bar-chart3",
          url: "/pro",
          badge: "BETA",
        },
        {
          title: "resources.ayuda",
          icon: "help-circle",
          url: "/help",
        },
        {
          title: "resources.blog",
          icon: "book-open",
          url: "/blog",
        },
        {
          title: "resources.empleo",
          icon: "wrench",
          url: "/jobs",
        },
        {
          title: "resources.prensa",
          icon: "mic",
          url: "/press",
        },
      ],
    },
    {
      title: "sections.comunidades",
      icon: null,
      items: [
        {
          title: "communities.comunidades",
          icon: "r-logo", // Custom r/ logo
          url: "/communities",
        },
        {
          title: "communities.mejorReddit",
          icon: "hourglass", // Custom hourglass icon
          url: "/best",
        },
        {
          title: "communities.traducidas",
          icon: "globe",
          url: "/translated",
        },
        {
          title: "communities.temas",
          icon: "grid3x3",
          url: "/topics",
        },
      ],
    },
    {
      title: "sections.legal",
      icon: null,
      items: [
        {
          title: "legal.reglas",
          icon: "scroll-text",
          url: "/rules",
        },
        {
          title: "legal.privacidad",
          icon: "scale",
          url: "/privacy",
        },
        {
          title: "legal.acuerdo",
          icon: "file-check",
          url: "/user-agreement",
        },
        {
          title: "legal.accesibilidad",
          icon: "accessibility",
          url: "/accessibility",
        },
      ],
    },
  ],
};
