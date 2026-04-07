import { generateObject } from "ai";
import { z } from "zod";
import { geminiFlashModel } from "./ai";

export interface Flight {
  id: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
  };
  airlines: string[];
  priceInUSD: number;
  numberOfStops: number;
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}): Promise<{ flights: Flight[] }> {
  const { object: flightSearchResults } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate realistic search results for flights from ${origin} to ${destination}, limit to 4 results. Use realistic prices in euros (€) and include popular airlines.`,
    output: "array",
    schema: z.object({
      id: z
        .string()
        .describe("Unique identifier for the flight, like BA123, AA31, etc."),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
      }),
      airlines: z.array(
        z.string().describe("Airline names, e.g., Lufthansa, Air France, KLM"),
      ),
      priceInUSD: z.number().describe("Flight price in euros (€)"),
      numberOfStops: z.number().describe("Number of stops during the flight"),
    }),
  });

  return { flights: flightSearchResults as Flight[] };
}
