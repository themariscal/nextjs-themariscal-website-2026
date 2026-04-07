import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prompts } from "@/data/prompts/promps";
import fs from 'fs';
import path from 'path';
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

    const { originCountry, destinationCountry } = await request.json();

    if (!originCountry || !destinationCountry) {
      return NextResponse.json(
        { error: "País de origen y destino son requeridos" },
        { status: 400 }
      );
    }

    // Load passport data for the origin country
    const passportFileName = originCountry.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const passportFilePath = path.join(process.cwd(), 'src', 'data', 'passport', `${passportFileName}.json`);

    let passportData;
    try {
      const fileContent = fs.readFileSync(passportFilePath, 'utf8');
      passportData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: `No se encontraron datos de pasaporte para ${originCountry}` },
        { status: 404 }
      );
    }

    // Initialize Gemini model
    const genAI = new GoogleGenerativeAI(apikey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = prompts.visaAnalysis(originCountry, destinationCountry, passportData);

    console.log(`Sending request to Gemini for visa analysis: ${originCountry} -> ${destinationCountry}`);
    
    const result = await model.generateContent([prompt]);

    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received for visa analysis, length:", text.length);

    // Try to parse JSON from the response
    let visaData;
    try {
      // Extract JSON from markdown if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      visaData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.log("Raw response:", text);
      
      // Fallback response
      visaData = {
        originCountry,
        destinationCountry,
        visaRequirement: "Información no disponible",
        stayDuration: "Consultar con embajada",
        requirements: ["Se requiere más información específica"],
        documentsNeeded: ["Pasaporte válido", "Documentos adicionales según el caso"],
        applicationProcess: {
          whereToApply: "Embajada o consulado correspondiente",
          processingTime: "Consultar con la embajada",
          cost: "Consultar costos actuales",
          validity: "Según el tipo de visa"
        },
        tips: ["Contactar la embajada para información actualizada"],
        additionalInfo: "No se pudo obtener información específica para este destino",
        officialLink: null
      };
    }

    return NextResponse.json({
      visaData,
    });

  } catch (error) {
    console.error("Error in visa-analysis API:", error);
    
    let errorMessage = "Error interno del servidor";
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Error de configuración de API";
      } else if (error.message.includes("quota")) {
        errorMessage = "Límite de uso de API excedido";
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
