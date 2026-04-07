"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Navigation,
    Clock,
    DollarSign,
    Accessibility,
    Lightbulb,
    ExternalLink,
    Info
} from "lucide-react";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
    ssr: false,
    loading: () => (
        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
        </div>
    )
});

interface PlaceData {
    placeName: string;
    description: string;
    location: {
        address: string;
        city: string;
        country: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    placeType: string;
    significance: string;
    bestTimeToVisit: string;
    visitingInfo: {
        hours: string;
        entranceFee: string;
        accessibility: string;
        tips: string[];
    };
    nearbyAttractions: Array<{
        name: string;
        distance: string;
        description: string;
    }>;
}

interface FindPlaceResultProps {
    placeData: PlaceData;
}

export function FindPlaceResult({ placeData }: FindPlaceResultProps) {
    const handleGetDirections = () => {
        const { latitude, longitude } = placeData.location.coordinates;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(googleMapsUrl, '_blank');
    };

    const handleViewOnMaps = () => {
        const { latitude, longitude } = placeData.location.coordinates;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(googleMapsUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Place Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {placeData.placeName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {placeData.placeType}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                            {placeData.location.city}, {placeData.location.country}
                        </Badge>
                    </div>

                    <p className="text-muted-foreground">
                        {placeData.description}
                    </p>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                            Dirección
                        </h4>
                        <p className="text-sm">{placeData.location.address}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                            Importancia
                        </h4>
                        <p className="text-sm">{placeData.significance}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Map */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        Ubicación en el Mapa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <MapComponent
                            latitude={placeData.location.coordinates.latitude}
                            longitude={placeData.location.coordinates.longitude}
                            placeName={placeData.placeName}
                        />

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={handleGetDirections}
                                className="flex items-center gap-2"
                            >
                                <Navigation className="h-4 w-4" />
                                Cómo Llegar
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleViewOnMaps}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Ver en Google Maps
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Visiting Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Información para Visitantes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Horarios
                            </h4>
                            <p className="text-sm">{placeData.visitingInfo.hours}</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Costo de Entrada
                            </h4>
                            <p className="text-sm">{placeData.visitingInfo.entranceFee}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                            <Accessibility className="h-4 w-4" />
                            Accesibilidad
                        </h4>
                        <p className="text-sm">{placeData.visitingInfo.accessibility}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                            Mejor momento para visitar
                        </h4>
                        <p className="text-sm">{placeData.bestTimeToVisit}</p>
                    </div>

                    {placeData.visitingInfo.tips && placeData.visitingInfo.tips.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <Lightbulb className="h-4 w-4" />
                                Consejos
                            </h4>
                            <ul className="space-y-1">
                                {placeData.visitingInfo.tips.map((tip, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Nearby Attractions */}
            {placeData.nearbyAttractions && placeData.nearbyAttractions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Lugares Cercanos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {placeData.nearbyAttractions.map((attraction, index) => (
                                <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-semibold text-primary">{attraction.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {attraction.distance}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {attraction.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
