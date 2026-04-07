import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToJson } from "@/lib/utils/trip-utils";
import { prompts } from "@/data/prompts/promps";
import config from "@/lib/config";

const apikey = config.env.gemini.apiKey!;

export async function POST(request: NextRequest) {
  try {
    const {
      country,
      originCity,
      numberOfDays,
      travelStyle,
      interests,
      budget,
      groupType,
      userId,
    } = await request.json();

    if (!country || !originCity || !numberOfDays || !travelStyle || !interests || !budget || !groupType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apikey);
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

    const prompt = prompts.tripPlanning.main(country, originCity, budget, interests, travelStyle, groupType, numberOfDays);

    const textResult = await genAI
      .getGenerativeModel({
        model: "gemini-2.0-flash",
      })
      .generateContent([prompt]);
    
    const trip = parseMarkdownToJson(textResult.response.text());

    // Generate flight information
    let flightInfo = null;
    try {
              const flightPrompt = prompts.tripPlanning.flightInfo(originCity, country, budget);

      const flightResult = await genAI
        .getGenerativeModel({
          model: "gemini-2.0-flash",
        })
        .generateContent([flightPrompt]);
      
      flightInfo = parseMarkdownToJson(flightResult.response.text());
    } catch (error) {
      console.error("Error generating flight info:", error);
    }

    let imageUrls: string[] = [];
    if (unsplashApiKey) {
      try {
        const imageResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
        );
        const imageData = await imageResponse.json();
        imageUrls = imageData.results
          .slice(0, 3)
          .map((result: any) => result.urls?.regular || null)
          .filter(Boolean);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }

    // For now, we'll return the trip data directly
    // In a real app, you'd save this to a database
    const result = {
      id: `trip_${Date.now()}`,
      tripDetail: trip,
      flightInfo: flightInfo,
      createdAt: new Date().toISOString(),
      imageUrls,
      userId: userId || "anonymous",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating travel plan:", error);
    return NextResponse.json(
      { error: "Failed to generate travel plan" },
      { status: 500 }
    );
  }
}
