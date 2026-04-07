import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prompts } from "@/data/prompts/promps";
import config from "@/lib/config";

const apikey = config.env.gemini.apiKey!;

const genAI = new GoogleGenerativeAI(apikey);

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!apikey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "Configuración de API no encontrada" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
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
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = prompts.imageAnalysis.placeHistory;

    console.log("Sending request to Gemini with image type:", mimeType);
    
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
    
    console.log("Gemini response received, length:", text.length);

    // Parse JSON response
    let placeHistory;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        placeHistory = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo extraer JSON de la respuesta");
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw response:", text);
      
      // Fallback response
      placeHistory = {
        name: "Lugar Histórico",
        location: "Ubicación no identificada",
        history: "No se pudo analizar la historia de este lugar específicamente. La imagen muestra un lugar de interés histórico o cultural, pero se requiere más información para proporcionar detalles precisos.",
        significance: "Este lugar tiene importancia histórica o cultural, aunque no se pudo identificar específicamente.",
        architecture: "La arquitectura del lugar muestra características históricas, pero se requiere más contexto para una descripción detallada.",
        culturalContext: "Este lugar forma parte del patrimonio cultural, aunque se necesita más información para contextualizar su importancia específica.",
        interestingFacts: [
          "El lugar muestra características arquitectónicas históricas",
          "Parece ser un sitio de interés cultural o turístico",
          "La imagen sugiere importancia histórica o cultural"
        ],
        bestTimeToVisit: "Consultar horarios locales",
        coordinates: {
          latitude: 0.0,
          longitude: 0.0
        }
      };
    }

    return NextResponse.json({
      placeHistory,
      success: true,
    });

  } catch (error) {
    console.error("Error analyzing image:", error);
    
    // More specific error handling
    let errorMessage = "Error al analizar la imagen. Por favor, intenta con otra imagen.";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Error de configuración de API. Contacta al administrador.";
        statusCode = 500;
      } else if (error.message.includes("quota")) {
        errorMessage = "Límite de uso de API alcanzado. Intenta más tarde.";
        statusCode = 429;
      } else if (error.message.includes("invalid")) {
        errorMessage = "Formato de imagen no válido.";
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: statusCode }
    );
  }
}
