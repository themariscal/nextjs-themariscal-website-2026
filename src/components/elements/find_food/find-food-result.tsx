"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Utensils,
    MapPin,
    Star,
    Clock,
    Phone,
    ExternalLink,
    Info,
    Lightbulb
} from "lucide-react";

interface FindFoodData {
    dishName: string;
    description: string;
    cuisineType: string;
    restaurantRecommendations: Array<{
        name: string;
        address: string;
        priceRange: string;
        rating: string;
        specialty: string;
        description: string;
        googleMapsLink: string;
        phone: string;
        hours: string;
        features: string[];
    }>;
    generalInfo: {
        bestTimeToVisit: string;
        averagePrice: string;
        tips: string[];
    };
}

interface FindFoodResultProps {
    findFoodData: FindFoodData;
}

export function FindFoodResult({ findFoodData }: FindFoodResultProps) {
    return (
        <div className="space-y-6">
            {/* Dish Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        {findFoodData.dishName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {findFoodData.cuisineType}
                        </Badge>
                    </div>

                    <p className="text-muted-foreground">
                        {findFoodData.description}
                    </p>
                </CardContent>
            </Card>

            {/* General Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Información General
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                Mejor momento para visitar
                            </h4>
                            <p className="text-sm">{findFoodData.generalInfo.bestTimeToVisit}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                Precio promedio
                            </h4>
                            <p className="text-sm">{findFoodData.generalInfo.averagePrice}</p>
                        </div>
                    </div>

                    {findFoodData.generalInfo.tips && findFoodData.generalInfo.tips.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <Lightbulb className="h-4 w-4" />
                                Consejos
                            </h4>
                            <ul className="space-y-1">
                                {findFoodData.generalInfo.tips.map((tip, index) => (
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

            {/* Restaurant Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Restaurantes Recomendados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {findFoodData.restaurantRecommendations.map((restaurant, index) => (
                            <div key={index} className="p-4 bg-muted rounded-lg space-y-4">
                                {/* Restaurant Header */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-primary">{restaurant.name}</h4>
                                            <p className="text-sm text-muted-foreground">{restaurant.specialty}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                            <span className="text-sm font-medium">{restaurant.rating}</span>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className="text-xs">
                                        {restaurant.priceRange}
                                    </Badge>
                                </div>

                                {/* Restaurant Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{restaurant.address}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{restaurant.hours}</span>
                                    </div>

                                    {restaurant.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{restaurant.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground">
                                    {restaurant.description}
                                </p>

                                {/* Features */}
                                {restaurant.features && restaurant.features.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold text-sm text-muted-foreground mb-2">
                                            Características
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                            {restaurant.features.map((feature, featureIndex) => (
                                                <Badge key={featureIndex} variant="secondary" className="text-xs">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(restaurant.googleMapsLink, '_blank')}
                                    className="flex items-center gap-2 w-full"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver en Google Maps
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
