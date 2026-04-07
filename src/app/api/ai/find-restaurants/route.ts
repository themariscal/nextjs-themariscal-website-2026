import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prompts } from "@/data/prompts/promps";
import config from "@/lib/config";

const apikey = config.env.gemini.apiKey!;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!apikey) {
      return NextResponse.json(
        { error: "Configuración de API no encontrada" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const city = formData.get("city") as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    if (!city || !city.trim()) {
      return NextResponse.json(
        { error: "No se proporcionó la ciudad" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen válida" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe ser menor a 10MB" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type;

    // Initialize Gemini model
    const genAI = new GoogleGenerativeAI(apikey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = prompts.imageAnalysis.findRestaurants(city);

    console.log("Sending request to Gemini for restaurant search with image type:", mimeType);
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received for restaurant search, length:", text.length);

    // Try to parse JSON from the response
    let findFoodData;
    try {
      // Extract JSON from markdown if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      findFoodData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.log("Raw response:", text);
      
      // Fallback response
      findFoodData = {
        dishName: "Comida no identificada",
        description: "No se pudo identificar completamente la comida en la imagen.",
        cuisineType: "No especificado",
        restaurantRecommendations: [
          {
            name: "Restaurantes no disponibles",
            address: "Información no disponible",
            priceRange: "N/A",
            rating: "N/A",
            specialty: "No especificado",
            description: "No se pudo obtener recomendaciones de restaurantes específicos.",
            googleMapsLink: "https://maps.google.com/",
            phone: "N/A",
            hours: "N/A",
            features: ["Información no disponible"]
          }
        ],
        generalInfo: {
          bestTimeToVisit: "Consultar horarios locales",
          averagePrice: "Información no disponible",
          tips: ["Se requiere más información para proporcionar consejos específicos"]
        }
      };
    }

    return NextResponse.json({
      findFoodData,
    });

  } catch (error) {
    console.error("Error in find-restaurants API:", error);
    
    let errorMessage = "Error interno del servidor";
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Error de configuración de API";
      } else if (error.message.includes("quota")) {
        errorMessage = "Límite de uso de API excedido";
      } else if (error.message.includes("format")) {
        errorMessage = "Formato de imagen no válido";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
