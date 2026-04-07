export const prompts = {
  // Trip Planning Prompts
  tripPlanning: {
    main: (country: string, originCity: string, budget: string, interests: string, travelStyle: string, groupType: string, numberOfDays: number) => `
Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
Origin City: '${originCity}'
Budget: '${budget}'
Interests: '${interests}'
TravelStyle: '${travelStyle}'
GroupType: '${groupType}'
IMPORTANT: Provide realistic and specific price estimates based on the budget level (${budget}) and travel style (${travelStyle}). 
For Budget: use lower-end estimates, for Luxury: use higher-end estimates, for Mid-range: use moderate estimates.

CRITICAL: For all recommendations (accommodation, restaurants, attractions, activities), provide REAL places that exist in Google Maps.
Include actual Google Maps links (https://maps.google.com/...) for each recommended place.
Research and suggest specific hotels, restaurants, museums, landmarks, and activities that are actually available in ${country}.
Make sure all places are real and can be found on Google Maps.

Return the itinerary and detailed price breakdown in a clean, non-markdown JSON format with the following structure:
{
"name": "A descriptive title for the trip",
"description": "A brief description of the trip and its highlights not exceeding 100 words",
"estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
"priceBreakdown": {
  "accommodation": "Specific estimated cost for ${numberOfDays} nights accommodation in ${country} (e.g., '$800-1200' for luxury hotels, '$200-400' for budget options)",
  "food": "Specific estimated cost for meals and dining in ${country} (e.g., '$300-500' for fine dining, '$100-200' for budget meals)",
  "transportation": "Specific estimated cost for local transportation and flights to/from ${country} (e.g., '$600-1000' for flights, '$100-200' for local transport)",
  "activities": "Specific estimated cost for tours, attractions, and activities in ${country} (e.g., '$200-400' for guided tours, '$50-150' for entrance fees)",
  "miscellaneous": "Specific estimated cost for shopping, tips, and other expenses in ${country} (e.g., '$100-300' for souvenirs and tips)"
},
"duration": ${numberOfDays},
"budget": "${budget}",
"travelStyle": "${travelStyle}",
"country": "${country}",
"interests": ["${interests}"],
"groupType": "${groupType}",
"bestTimeToVisit": ["Best months to visit with brief explanation"],
"weatherInfo": ["Weather conditions and what to expect"],
"location": {
  "city": "name of the city or region",
  "coordinates": [latitude, longitude],
  "openStreetMap": "link to open street map"
},
"itinerary": [
{
  "day": 1,
  "location": "City/Region Name",
  "activities": [
    {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk", "place": "Castle Name - Google Maps link"},
    {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour", "place": "Museum Name - Google Maps link"},
    {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine", "place": "Restaurant Name - Google Maps link"}
  ]
}
],
"recommendations": {
  "accommodation": [
    {"name": "Hotel/Hostel Name", "type": "Luxury/Budget/Mid-range", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."},
    {"name": "Hotel/Hostel Name 2", "type": "Luxury/Budget/Mid-range", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."}
  ],
  "restaurants": [
    {"name": "Restaurant Name", "cuisine": "Local/International", "priceRange": "$$$", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."},
    {"name": "Restaurant Name 2", "cuisine": "Local/International", "priceRange": "$$", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."}
  ],
  "attractions": [
    {"name": "Attraction Name", "type": "Museum/Landmark/Park", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."},
    {"name": "Attraction Name 2", "type": "Museum/Landmark/Park", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."}
  ],
  "activities": [
    {"name": "Activity Name", "type": "Tour/Experience/Adventure", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."},
    {"name": "Activity Name 2", "type": "Tour/Experience/Adventure", "description": "Brief description", "googleMapsLink": "https://maps.google.com/..."}
  ]
}
}`,

    flightInfo: (originCity: string, country: string, budget: string) => `
Based on the travel itinerary from ${originCity} to ${country}, provide flight information in JSON format:
{
  "departureFlights": [
    {
      "airline": "Airline name",
      "departureTime": "HH:MM",
      "arrivalTime": "HH:MM",
      "duration": "Xh Ym",
      "price": "$XXX",
      "stops": "Direct" or "X stops"
    }
  ],
  "returnFlights": [
    {
      "airline": "Airline name",
      "departureTime": "HH:MM",
      "arrivalTime": "HH:MM",
      "duration": "Xh Ym",
      "price": "$XXX",
      "stops": "Direct" or "X stops"
    }
  ],
  "totalFlightCost": "$XXX-XXX",
  "bestBookingTime": "When to book for best prices",
  "airports": {
    "departure": "Airport code and name",
    "arrival": "Airport code and name"
  }
}

Provide 2-3 flight options for each direction. Consider the budget level: ${budget}.`
  },

  // Image Analysis Prompts
  imageAnalysis: {
    placeHistory: `
Analiza esta imagen de un lugar histórico, monumento, edificio o sitio de interés cultural. 
Proporciona información detallada sobre la historia, arquitectura y significado cultural del lugar.

Responde en español y en formato JSON con la siguiente estructura:
{
  "name": "Nombre del lugar o monumento",
  "location": "Ciudad, país donde se encuentra",
  "history": "Historia detallada del lugar (mínimo 200 palabras)",
  "significance": "Significado histórico y cultural del lugar (mínimo 150 palabras)",
  "architecture": "Descripción arquitectónica y características del edificio/lugar (mínimo 150 palabras)",
  "culturalContext": "Contexto cultural y su importancia en la sociedad (mínimo 150 palabras)",
  "interestingFacts": [
    "Dato curioso 1",
    "Dato curioso 2",
    "Dato curioso 3"
  ],
  "bestTimeToVisit": "Mejor época del año para visitar",
  "coordinates": {
    "latitude": 0.0,
    "longitude": 0.0
  }
}

IMPORTANTE: 
- Si puedes identificar el lugar específico, incluye coordenadas reales
- Si no puedes identificar el lugar exacto, deja las coordenadas en 0.0
- Proporciona información histórica precisa y verificable
- Incluye detalles arquitectónicos específicos
- Menciona eventos históricos importantes relacionados con el lugar
- Si es un lugar famoso, incluye información sobre su construcción, arquitectos, o eventos históricos
- Responde SOLO en formato JSON válido, sin texto adicional`,

    foodCalories: `
Analiza esta imagen de comida y proporciona un desglose detallado de las calorías y información nutricional.

Responde en español y en formato JSON con la siguiente estructura:
{
  "dishName": "Nombre del plato o comida",
  "description": "Descripción breve de la comida (máximo 100 palabras)",
  "totalCalories": 0,
  "servingSize": "Tamaño de la porción estimada",
  "calorieBreakdown": {
    "carbohydrates": {
      "calories": 0,
      "percentage": 0,
      "sources": ["fuente 1", "fuente 2"]
    },
    "proteins": {
      "calories": 0,
      "percentage": 0,
      "sources": ["fuente 1", "fuente 2"]
    },
    "fats": {
      "calories": 0,
      "percentage": 0,
      "sources": ["fuente 1", "fuente 2"]
    }
  },
  "macronutrients": {
    "carbohydrates": {
      "grams": 0,
      "percentage": 0
    },
    "proteins": {
      "grams": 0,
      "percentage": 0
    },
    "fats": {
      "grams": 0,
      "percentage": 0
    }
  },
  "ingredients": [
    {
      "name": "Ingrediente",
      "estimatedAmount": "Cantidad estimada",
      "calories": 0,
      "category": "carbohydrates/proteins/fats"
    }
  ],
  "healthInfo": {
    "healthScore": 0,
    "healthNotes": ["Nota 1", "Nota 2"],
    "dietaryRestrictions": ["restricción 1", "restricción 2"],
    "benefits": ["beneficio 1", "beneficio 2"]
  },
  "recommendations": {
    "bestTimeToEat": "Mejor momento para consumir",
    "portionAdvice": "Consejo sobre el tamaño de porción",
    "pairingSuggestions": ["sugerencia 1", "sugerencia 2"]
  }
}

IMPORTANTE:
- Proporciona estimaciones realistas basadas en los ingredientes visibles
- Calcula las calorías totales sumando las de cada macronutriente
- Los porcentajes deben sumar 100% para macronutrientes
- Incluye ingredientes principales que puedas identificar visualmente
- Proporciona información de salud basada en la composición nutricional
- Responde SOLO en formato JSON válido, sin texto adicional`,

    findRestaurants: (city: string) => `
Analiza esta imagen de comida y proporciona recomendaciones de restaurantes en la ciudad especificada.

Ciudad donde el usuario quiere comer: ${city}

Responde en español y en formato JSON con la siguiente estructura:
{
  "dishName": "Nombre del plato o comida",
  "description": "Descripción breve de la comida (máximo 100 palabras)",
  "cuisineType": "Tipo de cocina (ej: italiana, mexicana, asiática, etc.)",
  "restaurantRecommendations": [
    {
      "name": "Nombre del restaurante",
      "address": "Dirección del restaurante",
      "priceRange": "$$$",
      "rating": "4.5/5",
      "specialty": "Especialidad del restaurante",
      "description": "Descripción breve del restaurante",
      "googleMapsLink": "https://maps.google.com/...",
      "phone": "Teléfono del restaurante",
      "hours": "Horarios de atención",
      "features": ["característica 1", "característica 2"]
    }
  ],
  "generalInfo": {
    "bestTimeToVisit": "Mejor momento para visitar restaurantes",
    "averagePrice": "Precio promedio en ${city}",
    "tips": ["consejo 1", "consejo 2"]
  }
}

IMPORTANTE:
- Busca restaurantes REALES en ${city} que sirvan este tipo de comida
- Incluye enlaces reales de Google Maps para cada restaurante
- Proporciona 4-6 recomendaciones de restaurantes específicos en ${city}
- Incluye información práctica como horarios, teléfonos y características
- Proporciona consejos generales sobre comer este tipo de comida en ${city}
- Responde SOLO en formato JSON válido, sin texto adicional`,

    identifyPlace: `
Analiza esta imagen y identifica el lugar que se muestra. Proporciona información detallada sobre la ubicación.

Responde en español y en formato JSON con la siguiente estructura:
{
  "placeName": "Nombre del lugar",
  "description": "Descripción detallada del lugar (máximo 200 palabras)",
  "location": {
    "address": "Dirección completa del lugar",
    "city": "Ciudad",
    "country": "País",
    "coordinates": {
      "latitude": 0.0,
      "longitude": 0.0
    }
  },
  "placeType": "Tipo de lugar (monumento, edificio, paisaje, etc.)",
  "significance": "Importancia histórica, cultural o turística",
  "bestTimeToVisit": "Mejor momento para visitar",
  "visitingInfo": {
    "hours": "Horarios de visita",
    "entranceFee": "Costo de entrada (si aplica)",
    "accessibility": "Información de accesibilidad",
    "tips": ["consejo 1", "consejo 2", "consejo 3"]
  },
  "nearbyAttractions": [
    {
      "name": "Nombre del lugar cercano",
      "distance": "Distancia aproximada",
      "description": "Descripción breve"
    }
  ]
}

IMPORTANTE:
- Identifica el lugar con la mayor precisión posible
- Proporciona coordenadas GPS exactas si es posible
- Incluye información práctica para visitantes
- Menciona lugares de interés cercanos
- Si no puedes identificar el lugar exacto, proporciona la mejor estimación posible
- Responde SOLO en formato JSON válido, sin texto adicional`,

  },

  // Visa Analysis Prompts
  visaAnalysis: (originCountry: string, destinationCountry: string, passportData: any) => `
Analiza los requisitos de visa para viajar de ${originCountry} a ${destinationCountry} basándote en la información del pasaporte proporcionada.

Información del pasaporte de ${originCountry}:
${JSON.stringify(passportData, null, 2)}

Responde en español y en formato JSON con la siguiente estructura:
{
  "originCountry": "${originCountry}",
  "destinationCountry": "${destinationCountry}",
  "visaRequirement": "Requisito de visa específico (ej: visa-free, visa required, eVisa, etc.)",
  "stayDuration": "Duración máxima de estadía permitida",
  "requirements": [
    "Requisito 1",
    "Requisito 2",
    "Requisito 3"
  ],
  "documentsNeeded": [
    "Documento 1",
    "Documento 2",
    "Documento 3"
  ],
  "applicationProcess": {
    "whereToApply": "Dónde solicitar la visa",
    "processingTime": "Tiempo de procesamiento",
    "cost": "Costo aproximado",
    "validity": "Validez de la visa"
  },
  "tips": [
    "Consejo 1",
    "Consejo 2",
    "Consejo 3"
  ],
  "additionalInfo": "Información adicional relevante",
  "officialLink": "Enlace oficial si está disponible"
}

IMPORTANTE:
- Busca específicamente la información para ${destinationCountry} en los datos del pasaporte
- Proporciona información precisa basada en los datos oficiales
- Incluye todos los requisitos y documentos necesarios
- Da consejos prácticos para el proceso de solicitud
- Si hay un enlace oficial, inclúyelo
- Responde SOLO en formato JSON válido, sin texto adicional`,

  // Chat Prompts (if needed for future use)
  chat: {
    general: "Eres un asistente de viajes experto. Ayuda a los usuarios con información sobre destinos, planificación de viajes, y consejos de turismo.",
    
    travelAdvice: "Proporciona consejos de viaje útiles y prácticos basados en la experiencia y mejores prácticas de turismo.",
    
    destinationInfo: "Ofrece información detallada sobre destinos turísticos, incluyendo atracciones, cultura, clima, y recomendaciones locales."
  }
};