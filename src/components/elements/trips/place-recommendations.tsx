"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Home,
    Utensils,
    MapPin,
    Activity,
    ExternalLink,
    Star,
    DollarSign
} from "lucide-react";
import { Recommendations } from "@/lib/types/trip";

interface PlaceRecommendationsProps {
    recommendations: Recommendations;
}

export function PlaceRecommendations({ recommendations }: PlaceRecommendationsProps) {
    const RecommendationCard = ({
        place,
        icon: Icon,
        title
    }: {
        place: any;
        icon: any;
        title: string;
    }) => (
        <Card className="h-full">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-sm">{place.name}</h4>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open(place.googleMapsLink, '_blank')}
                    >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground mb-2">{place.description}</p>

                <div className="flex flex-wrap gap-1">
                    {place.type && (
                        <Badge variant="secondary" className="text-xs">
                            {place.type}
                        </Badge>
                    )}
                    {place.cuisine && (
                        <Badge variant="secondary" className="text-xs">
                            {place.cuisine}
                        </Badge>
                    )}
                    {place.priceRange && (
                        <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {place.priceRange}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const RecommendationSection = ({
        places,
        icon: Icon,
        title,
        color
    }: {
        places: any[];
        icon: any;
        title: string;
        color: string;
    }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <h3 className="font-semibold text-lg">{title}</h3>
                <Badge variant="outline" className="text-xs">
                    {places.length} lugares
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {places.map((place, index) => (
                    <RecommendationCard
                        key={index}
                        place={place}
                        icon={Icon}
                        title={title}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Recomendaciones de Lugares
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {/* Accommodation */}
                    {recommendations.accommodation && recommendations.accommodation.length > 0 && (
                        <RecommendationSection
                            places={recommendations.accommodation}
                            icon={Home}
                            title="Alojamiento"
                            color="text-primary"
                        />
                    )}

                    {/* Restaurants */}
                    {recommendations.restaurants && recommendations.restaurants.length > 0 && (
                        <RecommendationSection
                            places={recommendations.restaurants}
                            icon={Utensils}
                            title="Restaurantes"
                            color="text-primary"
                        />
                    )}

                    {/* Attractions */}
                    {recommendations.attractions && recommendations.attractions.length > 0 && (
                        <RecommendationSection
                            places={recommendations.attractions}
                            icon={MapPin}
                            title="Atracciones"
                            color="text-primary"
                        />
                    )}

                    {/* Activities */}
                    {recommendations.activities && recommendations.activities.length > 0 && (
                        <RecommendationSection
                            places={recommendations.activities}
                            icon={Activity}
                            title="Actividades"
                            color="text-primary"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
