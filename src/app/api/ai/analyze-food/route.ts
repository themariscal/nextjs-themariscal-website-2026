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

    const prompt = prompts.imageAnalysis.foodCalories;

    console.log("Sending request to Gemini for food analysis with image type:", mimeType);
    
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
    
    console.log("Gemini response received for food analysis, length:", text.length);

    // Parse JSON response
    let foodCalories;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foodCalories = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No se pudo extraer JSON de la respuesta");
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw response:", text);
      
      // Fallback response
      foodCalories = {
        dishName: "Comida no identificada",
        description: "No se pudo analizar específicamente esta comida. La imagen muestra alimentos, pero se requiere más información para proporcionar un análisis nutricional preciso.",
        totalCalories: 0,
        servingSize: "Porción no especificada",
        calorieBreakdown: {
          carbohydrates: {
            calories: 0,
            percentage: 0,
            sources: ["No identificado"]
          },
          proteins: {
            calories: 0,
            percentage: 0,
            sources: ["No identificado"]
          },
          fats: {
            calories: 0,
            percentage: 0,
            sources: ["No identificado"]
          }
        },
        macronutrients: {
          carbohydrates: {
            grams: 0,
            percentage: 0
          },
          proteins: {
            grams: 0,
            percentage: 0
          },
          fats: {
            grams: 0,
            percentage: 0
          }
        },
        ingredients: [
          {
            name: "Ingredientes no identificados",
            estimatedAmount: "No especificado",
            calories: 0,
            category: "unknown"
          }
        ],
        healthInfo: {
          healthScore: 50,
          healthNotes: [
            "No se pudo realizar un análisis nutricional completo de esta comida específica."
          ],
          dietaryRestrictions: ["Información no disponible"],
          benefits: ["Se requiere más información para determinar beneficios específicos"]
        },
        recommendations: {
          bestTimeToEat: "Consultar con un nutricionista",
          portionAdvice: "Consumir con moderación",
          pairingSuggestions: ["Se requiere más información para sugerencias específicas"]
        }
      };
    }

    return NextResponse.json({
      foodCalories,
      success: true,
    });

  } catch (error) {
    console.error("Error analyzing food image:", error);
    
    // More specific error handling
    let errorMessage = "Error al analizar la imagen de comida. Por favor, intenta con otra imagen.";
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
