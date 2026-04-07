"use client";

import React, { useState, useEffect } from "react";
import { TripPlanningForm } from "@/components/elements/trips/trip-planning-form";
import { TripResult } from "@/components/elements/trips/trip-result";
import { TripFormData, Country, Trip } from "@/lib/types/trip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import apiRoutes from "@/lib/api_routes";

const Page = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [tripResult, setTripResult] = useState<Trip | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [flightInfo, setFlightInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingCountries, setLoadingCountries] = useState(true);

    // Load countries on component mount
    useEffect(() => {
        const loadCountries = () => {
            // Use a comprehensive static list of countries to avoid API issues
            const countriesList: Country[] = [
                { name: "🇪🇸 Spain", coordinates: [40.0, -3.0] as [number, number], value: "Spain" },
                { name: "🇫🇷 France", coordinates: [46.0, 2.0] as [number, number], value: "France" },
                { name: "🇮🇹 Italy", coordinates: [41.9, 12.5] as [number, number], value: "Italy" },
                { name: "🇩🇪 Germany", coordinates: [51.0, 9.0] as [number, number], value: "Germany" },
                { name: "🇬🇧 United Kingdom", coordinates: [55.4, -3.4] as [number, number], value: "United Kingdom" },
                { name: "🇺🇸 United States", coordinates: [39.8, -98.6] as [number, number], value: "United States" },
                { name: "🇯🇵 Japan", coordinates: [36.2, 138.3] as [number, number], value: "Japan" },
                { name: "🇦🇺 Australia", coordinates: [-25.3, 133.8] as [number, number], value: "Australia" },
                { name: "🇨🇦 Canada", coordinates: [56.1, -106.3] as [number, number], value: "Canada" },
                { name: "🇧🇷 Brazil", coordinates: [-14.2, -51.9] as [number, number], value: "Brazil" },
                { name: "🇦🇷 Argentina", coordinates: [-38.4, -63.6] as [number, number], value: "Argentina" },
                { name: "🇲🇽 Mexico", coordinates: [23.6, -102.6] as [number, number], value: "Mexico" },
                { name: "🇮🇳 India", coordinates: [20.6, 78.9] as [number, number], value: "India" },
                { name: "🇨🇳 China", coordinates: [35.9, 104.2] as [number, number], value: "China" },
                { name: "🇰🇷 South Korea", coordinates: [35.9, 127.8] as [number, number], value: "South Korea" },
                { name: "🇹🇭 Thailand", coordinates: [15.9, 100.9] as [number, number], value: "Thailand" },
                { name: "🇻🇳 Vietnam", coordinates: [14.1, 108.3] as [number, number], value: "Vietnam" },
                { name: "🇮🇩 Indonesia", coordinates: [-0.8, 113.9] as [number, number], value: "Indonesia" },
                { name: "🇵🇭 Philippines", coordinates: [12.9, 121.8] as [number, number], value: "Philippines" },
                { name: "🇸🇬 Singapore", coordinates: [1.4, 103.8] as [number, number], value: "Singapore" },
                { name: "🇲🇾 Malaysia", coordinates: [4.2, 101.9] as [number, number], value: "Malaysia" },
                { name: "🇳🇿 New Zealand", coordinates: [-40.9, 174.9] as [number, number], value: "New Zealand" },
                { name: "🇿🇦 South Africa", coordinates: [-30.6, 22.9] as [number, number], value: "South Africa" },
                { name: "🇪🇬 Egypt", coordinates: [26.8, 30.8] as [number, number], value: "Egypt" },
                { name: "🇲🇦 Morocco", coordinates: [31.6, -7.1] as [number, number], value: "Morocco" },
                { name: "🇹🇷 Turkey", coordinates: [38.9, 35.2] as [number, number], value: "Turkey" },
                { name: "🇬🇷 Greece", coordinates: [39.1, 21.8] as [number, number], value: "Greece" },
                { name: "🇵🇹 Portugal", coordinates: [39.4, -8.2] as [number, number], value: "Portugal" },
                { name: "🇳🇱 Netherlands", coordinates: [52.1, 5.3] as [number, number], value: "Netherlands" },
                { name: "🇧🇪 Belgium", coordinates: [50.5, 4.5] as [number, number], value: "Belgium" },
                { name: "🇨🇭 Switzerland", coordinates: [46.8, 8.2] as [number, number], value: "Switzerland" },
                { name: "🇦🇹 Austria", coordinates: [47.5, 14.6] as [number, number], value: "Austria" },
                { name: "🇨🇿 Czech Republic", coordinates: [49.8, 15.5] as [number, number], value: "Czech Republic" },
                { name: "🇵🇱 Poland", coordinates: [51.9, 19.1] as [number, number], value: "Poland" },
                { name: "🇭🇺 Hungary", coordinates: [47.2, 19.5] as [number, number], value: "Hungary" },
                { name: "🇷🇴 Romania", coordinates: [45.9, 25.0] as [number, number], value: "Romania" },
                { name: "🇧🇬 Bulgaria", coordinates: [42.7, 25.5] as [number, number], value: "Bulgaria" },
                { name: "🇭🇷 Croatia", coordinates: [45.1, 15.2] as [number, number], value: "Croatia" },
                { name: "🇷🇸 Serbia", coordinates: [44.0, 21.0] as [number, number], value: "Serbia" },
                { name: "🇸🇮 Slovenia", coordinates: [46.2, 14.8] as [number, number], value: "Slovenia" },
                { name: "🇸🇰 Slovakia", coordinates: [48.7, 19.7] as [number, number], value: "Slovakia" },
                { name: "🇱🇹 Lithuania", coordinates: [55.2, 23.9] as [number, number], value: "Lithuania" },
                { name: "🇱🇻 Latvia", coordinates: [56.9, 24.6] as [number, number], value: "Latvia" },
                { name: "🇪🇪 Estonia", coordinates: [58.6, 25.0] as [number, number], value: "Estonia" },
                { name: "🇫🇮 Finland", coordinates: [61.9, 25.7] as [number, number], value: "Finland" },
                { name: "🇸🇪 Sweden", coordinates: [60.1, 18.6] as [number, number], value: "Sweden" },
                { name: "🇳🇴 Norway", coordinates: [60.5, 8.5] as [number, number], value: "Norway" },
                { name: "🇩🇰 Denmark", coordinates: [56.3, 9.5] as [number, number], value: "Denmark" },
                { name: "🇮🇸 Iceland", coordinates: [64.9, -19.0] as [number, number], value: "Iceland" },
                { name: "🇮🇪 Ireland", coordinates: [53.4, -8.2] as [number, number], value: "Ireland" },
                { name: "🇷🇺 Russia", coordinates: [61.5, 105.3] as [number, number], value: "Russia" },
                { name: "🇺🇦 Ukraine", coordinates: [48.4, 31.2] as [number, number], value: "Ukraine" },
                { name: "🇵🇪 Peru", coordinates: [-9.2, -75.0] as [number, number], value: "Peru" },
                { name: "🇨🇱 Chile", coordinates: [-35.7, -71.5] as [number, number], value: "Chile" },
                { name: "🇨🇴 Colombia", coordinates: [4.6, -74.1] as [number, number], value: "Colombia" },
                { name: "🇻🇪 Venezuela", coordinates: [6.4, -66.6] as [number, number], value: "Venezuela" },
                { name: "🇪🇨 Ecuador", coordinates: [-1.8, -78.2] as [number, number], value: "Ecuador" },
                { name: "🇧🇴 Bolivia", coordinates: [-16.3, -63.6] as [number, number], value: "Bolivia" },
                { name: "🇵🇾 Paraguay", coordinates: [-23.4, -58.4] as [number, number], value: "Paraguay" },
                { name: "🇺🇾 Uruguay", coordinates: [-32.5, -55.8] as [number, number], value: "Uruguay" },
                { name: "🇬🇾 Guyana", coordinates: [4.9, -58.9] as [number, number], value: "Guyana" },
                { name: "🇸🇷 Suriname", coordinates: [3.9, -56.0] as [number, number], value: "Suriname" },
                { name: "🇬🇫 French Guiana", coordinates: [3.9, -53.1] as [number, number], value: "French Guiana" },
            ];

            setCountries(countriesList);
            setLoadingCountries(false);
        };

        loadCountries();
    }, []);

    const handleSubmit = async (formData: TripFormData) => {
        setLoading(true);
        setError(null);
        setTripResult(null);

        try {
            const response = await fetch(apiRoutes.ai.tripsCreate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    country: formData.country,
                    originCity: formData.originCity,
                    numberOfDays: formData.duration,
                    travelStyle: formData.travelStyle,
                    interests: formData.interest,
                    budget: formData.budget,
                    groupType: formData.groupType,
                    userId: "anonymous", // In a real app, get from auth
                }),
            });

            if (!response.ok) {
                throw new Error("Error al generar el plan de viaje");
            }

            const result = await response.json();

            if (result.tripDetail) {
                setTripResult(result.tripDetail);
                setImageUrls(result.imageUrls || []);
                setFlightInfo(result.flightInfo || null);
            } else {
                throw new Error("No se pudo generar el plan de viaje");
            }
        } catch (error) {
            console.error("Error generating trip:", error);
            setError("Error al generar el plan de viaje. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTripResult(null);
        setImageUrls([]);
        setFlightInfo(null);
        setError(null);
    };

    if (loadingCountries) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Cargando países...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Planificador de Viajes IA</h1>
                    <p className="text-muted-foreground">
                        Crea itinerarios personalizados con inteligencia artificial
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Content */}
                {!tripResult ? (
                    <TripPlanningForm
                        countries={countries}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Back Button */}
                        <div className="flex justify-start">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Crear Nuevo Viaje
                            </Button>
                        </div>

                        {/* Trip Result */}
                        <TripResult trip={tripResult} imageUrls={imageUrls} flightInfo={flightInfo} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
