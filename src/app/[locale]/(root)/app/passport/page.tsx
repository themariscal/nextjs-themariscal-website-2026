"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Plane, FileText } from "lucide-react";
import { VisaAnalysisResult } from "@/components/elements/passport/visa-analysis-result";
import apiRoutes from '@/lib/api_routes';

// Lista de países disponibles basada en los archivos JSON
const availableCountries = [
    "Argentina", "Andorra", "Austria", "Belgium", "Bolivia", "Bosnia and Herzegovina",
    "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Costa Rica",
    "Croatia", "Cuba", "Czech Republic", "Denmark", "Ecuador", "El Salvador",
    "Finland", "France", "Germany", "Greece", "Guatemala", "Honduras", "Hungary",
    "India", "Israel", "Italy", "Japan", "Kosovo", "Lithuania", "Luxembourg",
    "Malta", "Mexico", "Montenegro", "Netherlands", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "North Macedonia", "Norway", "Panama", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Russian Federation",
    "Saudi Arabia", "Serbia", "Slovakia", "Slovenia", "South Africa",
    "South Korea", "Spain", "Sweden", "Switzerland", "Ukraine",
    "United Kingdom", "United States of America", "Uruguay", "Venezuela"
];

interface VisaData {
    originCountry: string;
    destinationCountry: string;
    visaRequirement: string;
    stayDuration: string;
    requirements: string[];
    documentsNeeded: string[];
    applicationProcess: {
        whereToApply: string;
        processingTime: string;
        cost: string;
        validity: string;
    };
    tips: string[];
    additionalInfo: string;
    officialLink: string | null;
}

const Page = () => {
    const [originCountry, setOriginCountry] = useState<string>("");
    const [destinationCountry, setDestinationCountry] = useState<string>("");
    const [visaData, setVisaData] = useState<VisaData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyzeVisa = async () => {
        if (!originCountry || !destinationCountry) {
            setError('Por favor selecciona tanto el país de origen como el destino');
            return;
        }

        if (originCountry === destinationCountry) {
            setError('El país de origen y destino no pueden ser el mismo');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(apiRoutes.ai.visaAnalysis, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originCountry,
                    destinationCountry,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al analizar los requisitos de visa');
            }

            const result = await response.json();
            setVisaData(result.visaData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setOriginCountry("");
        setDestinationCountry("");
        setVisaData(null);
        setError(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Análisis de Visas</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Descubre qué visa necesitas para viajar desde tu país al destino que elijas
                    </p>
                </div>

                {/* Form Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Información del Viaje
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Origin Country */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    País de Origen
                                </label>
                                <Select value={originCountry} onValueChange={setOriginCountry}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tu país de origen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCountries.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Destination Country */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Plane className="h-4 w-4 text-primary" />
                                    País de Destino
                                </label>
                                <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tu destino" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCountries.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={handleAnalyzeVisa}
                                disabled={loading || !originCountry || !destinationCountry}
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analizando...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4" />
                                        Analizar Visa
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Limpiar
                            </Button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {visaData && (
                    <VisaAnalysisResult visaData={visaData} />
                )}
            </div>
        </div>
    );
};

export default Page;
