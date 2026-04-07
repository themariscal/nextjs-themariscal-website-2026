import { NextRequest, NextResponse } from 'next/server';
import { streamText } from "ai";
// import type { Message } from "ai";
import { z } from "zod";
import { geminiProModel } from "@/lib/ai";
import { getSuggestionsForPage } from "@/data/chat-suggestions";
import { generateSampleFlightSearchResults } from "@/lib/flight-actions";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  pathname?: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

// Simple response logic based on message content
function generateResponse(message: string, pathname?: string): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return {
      message: "¡Hola! Soy tu asistente de The Mariscal. ¿En qué puedo ayudarte hoy?",
      suggestions: pathname?.includes('jobs') ? [
        "¿Cómo buscar trabajos?",
        "¿Cómo postular a un empleo?",
        "¿Qué tipos de trabajos hay?"
      ] : pathname?.includes('music') ? [
        "¿Cómo escuchar música?",
        "¿Cómo subir mi música?",
        "¿Qué géneros están disponibles?"
      ] : pathname?.includes('videos') ? [
        "¿Cómo ver videos?",
        "¿Cómo subir un video?",
        "¿Qué tipos de contenido hay?"
      ] : [
        "¿Qué es The Mariscal?",
        "¿Cómo funciona la plataforma?",
        "¿Qué puedo hacer aquí?"
      ]
    };
  }
  
  // Jobs related responses
  if (lowerMessage.includes('trabajo') || lowerMessage.includes('empleo') || lowerMessage.includes('job')) {
    return {
      message: "En The Mariscal puedes encontrar una gran variedad de oportunidades laborales. Puedes buscar trabajos por categoría, ubicación o tipo de contrato. ¿Te gustaría que te ayude con algo específico sobre búsqueda de empleo?",
    };
  }
  
  // Music related responses
  if (lowerMessage.includes('música') || lowerMessage.includes('music') || lowerMessage.includes('canción')) {
    return {
      message: "¡La música es una parte fundamental de The Mariscal! Aquí puedes descubrir nuevos artistas, crear playlists, subir tu propia música y conectar con otros amantes de la música. ¿Qué te interesa más sobre la música?",
    };
  }
  
  // Videos related responses
  if (lowerMessage.includes('video') || lowerMessage.includes('vídeo') || lowerMessage.includes('contenido')) {
    return {
      message: "En The Mariscal puedes disfrutar de una gran variedad de contenido en video. Desde tutoriales hasta entretenimiento, hay algo para todos. ¿Qué tipo de contenido te interesa más?",
    };
  }
  
  // Account related responses
  if (lowerMessage.includes('cuenta') || lowerMessage.includes('registro') || lowerMessage.includes('account')) {
    return {
      message: "Crear una cuenta en The Mariscal es muy fácil. Solo necesitas un email y algunos datos básicos. Una vez registrado, podrás acceder a todas las funcionalidades de la plataforma. ¿Te gustaría que te guíe en el proceso?",
    };
  }
  
  // Travel and flights related responses
  if (lowerMessage.includes('viajar') || lowerMessage.includes('vuelo') || lowerMessage.includes('vuelos') || 
      lowerMessage.includes('viaje') || lowerMessage.includes('aeropuerto') || lowerMessage.includes('avión') ||
      lowerMessage.includes('zagreb') || lowerMessage.includes('bogotá') || lowerMessage.includes('bogota')) {
    
    // Extract origin and destination if mentioned
    let origin = '';
    let destination = '';
    
    if (lowerMessage.includes('zagreb')) {
      origin = 'Zagreb';
    }
    if (lowerMessage.includes('bogotá') || lowerMessage.includes('bogota')) {
      destination = 'Bogotá';
    }
    
    if (origin && destination) {
      return {
        message: `¡Perfecto! Te ayudo con información sobre vuelos de ${origin} a ${destination}.\n\n✈️ **Opciones de vuelos disponibles:**\n\n• **Vuelo directo:** No disponible actualmente\n• **Vuelos con escala:** Múltiples opciones disponibles\n\n🕐 **Duración del viaje:**\n• Con escala: 14-18 horas aproximadamente\n• Aerolíneas principales: Lufthansa, Air France, KLM\n\n💰 **Precios estimados:**\n• Económico: €800-1200\n• Business: €2000-3500\n\n📅 **Mejor época para viajar:**\n• Diciembre a Marzo (temporada seca en Bogotá)\n• Evitar temporada alta de verano europeo\n\n¿Te gustaría que busque precios específicos para fechas concretas?`,
      };
    } else {
      return {
        message: "¡Te ayudo con información sobre vuelos! 🛫\n\nPara darte la mejor información, necesito saber:\n\n• **Origen:** ¿Desde qué ciudad quieres viajar?\n• **Destino:** ¿A dónde quieres ir?\n• **Fechas:** ¿Cuándo planeas viajar?\n• **Pasajeros:** ¿Cuántas personas?\n\nUna vez que me proporciones estos detalles, podré darte información detallada sobre:\n\n✈️ Vuelos disponibles\n💰 Precios estimados\n🕐 Duración del viaje\n📅 Mejores fechas para viajar\n\n¿Qué información necesitas?",
      };
    }
  }
  
  // Trending related responses
  if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('tendencia')) {
    return {
      message: "En The Mariscal puedes descubrir qué está trending en música, videos y contenido. Nuestro algoritmo te muestra lo más popular basado en las interacciones de la comunidad. ¿Quieres ver qué está de moda hoy?",
    };
  }
  
  // Default response
  return {
    message: "Gracias por tu mensaje. The Mariscal es una plataforma social donde puedes descubrir música, videos, encontrar trabajos y conectar con otros usuarios. ¿Hay algo específico en lo que pueda ayudarte?",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, pathname, conversationHistory } = body;
    
    // Debug: Check if API key is available
    console.log('Gemini API Key available:', !!process.env.GEMINI_API_KEY);
    console.log('GOOGLE_GENERATIVE_AI_API_KEY available:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Use Gemini AI for responses
    try {
      const messages: Message[] = [
        {
          id: "1",
          role: "system",
          content: `Eres un asistente especializado en información de vuelos y viajes. Responde siempre en español y proporciona información detallada sobre vuelos, precios, aerolíneas y recomendaciones de viaje.

Contexto de la página actual: ${pathname || 'página principal'}

Instrucciones:
- Responde siempre en español
- Sé amigable y útil
- Proporciona información detallada sobre vuelos cuando se pregunte
- Incluye precios estimados, aerolíneas, duración del viaje
- Da recomendaciones prácticas sobre fechas y temporadas
- Si no tienes información específica, admítelo pero ofrece alternativas
- Fecha actual: ${new Date().toLocaleDateString('es-ES')}`
        },
        ...(conversationHistory || []).map(msg => ({
          id: msg.id,
          role: msg.isUser ? "user" as const : "assistant" as const,
          content: msg.text
        })),
        {
          id: Date.now().toString(),
          role: "user",
          content: message
        }
      ];

      // Convert messages to the format expected by the AI SDK
      const coreMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

      // Check if the message is asking for flights
      const lowerMessage = message.toLowerCase();
      const isFlightQuery = lowerMessage.includes('vuelo') || lowerMessage.includes('viajar') || 
                           lowerMessage.includes('zagreb') || lowerMessage.includes('paris') ||
                           lowerMessage.includes('bogota') || lowerMessage.includes('madrid');

      if (isFlightQuery) {
        // Extract origin and destination from the message
        let origin = '';
        let destination = '';
        
        if (lowerMessage.includes('zagreb')) origin = 'Zagreb';
        if (lowerMessage.includes('paris')) destination = 'Paris';
        if (lowerMessage.includes('bogota')) destination = 'Bogotá';
        if (lowerMessage.includes('madrid')) destination = 'Madrid';
        
        if (origin && destination) {
          try {
            const flightResults = await generateSampleFlightSearchResults({ origin, destination });
            
            return NextResponse.json({
              message: `¡Perfecto! He encontrado varios vuelos de ${origin} a ${destination}. Aquí tienes las opciones disponibles:`,
              suggestions: getSuggestionsForPage(pathname || ''),
              flights: flightResults.flights
            });
          } catch (error) {
            console.error('Error generating flights:', error);
          }
        }
      }

      const result = await streamText({
        model: geminiProModel,
        messages: coreMessages,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "mariscal-chat",
        },
      });

      const text = await result.text;
      
      return NextResponse.json({
        message: text,
        suggestions: getSuggestionsForPage(pathname || '')
      });
      
    } catch (geminiError) {
      console.error('Gemini error:', geminiError);
      
      // Fallback to predefined responses if Gemini fails
      const response = generateResponse(message, pathname);
      
      return NextResponse.json({
        message: response.message,
        suggestions: getSuggestionsForPage(pathname || '')
      });
    }
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for health check)
export async function GET() {
  return NextResponse.json({ 
    status: 'Chat API is running',
    timestamp: new Date().toISOString()
  });
}
