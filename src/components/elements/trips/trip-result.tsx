"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, DollarSign, Users, Clock, Star } from "lucide-react";
import { Trip } from "@/lib/types/trip";
import { PriceBreakdownComponent } from "./price-breakdown";
import { FlightInfoComponent } from "./flight-info";
import { PlaceRecommendations } from "./place-recommendations";

interface TripResultProps {
    trip: Trip;
    imageUrls?: string[];
    flightInfo?: any;
}

export function TripResult({ trip, imageUrls = [], flightInfo }: TripResultProps) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Trip Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl mb-2">{trip.name}</CardTitle>
                            <CardDescription className="text-base">{trip.description}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                            {trip.estimatedPrice}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.duration} días</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.groupType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.travelStyle}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            {imageUrls.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${trip.country} ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Best Time to Visit */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Mejor Época para Visitar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trip.bestTimeToVisit.map((season, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">{season}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Weather Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Información del Clima
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trip.weatherInfo.map((weather, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">{weather}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Price Breakdown */}
            {trip.priceBreakdown && (
                <PriceBreakdownComponent
                    priceBreakdown={trip.priceBreakdown}
                    totalPrice={trip.estimatedPrice}
                />
            )}

            {/* Flight Information */}
            {flightInfo && (
                <FlightInfoComponent flightInfo={flightInfo} />
            )}

            {/* Place Recommendations */}
            {trip.recommendations && (
                <PlaceRecommendations recommendations={trip.recommendations} />
            )}

            {/* Itinerary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Itinerario Detallado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {trip.itinerary.map((day, dayIndex) => (
                            <div key={dayIndex} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                        {day.day}
                                    </div>
                                    <h3 className="text-lg font-semibold">{day.location}</h3>
                                </div>

                                <div className="ml-11 space-y-3">
                                    {day.activities.map((activity, activityIndex) => (
                                        <div key={activityIndex} className="space-y-2">
                                            <div className="flex gap-3">
                                                <Badge variant="outline" className="shrink-0">
                                                    {activity.time}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                            </div>
                                            {activity.place && (
                                                <div className="ml-16">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs text-primary hover:text-primary-foreground"
                                                        onClick={() => {
                                                            // Extract Google Maps link from place string
                                                            const mapsLink = activity.place?.includes('https://maps.google.com')
                                                                ? activity.place
                                                                : `https://maps.google.com/search/${encodeURIComponent(activity.place || '')}`;
                                                            window.open(mapsLink, '_blank');
                                                        }}
                                                    >
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {activity.place.includes('https://maps.google.com')
                                                            ? 'Ver en Google Maps'
                                                            : activity.place}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {dayIndex < trip.itinerary.length - 1 && (
                                    <Separator className="ml-11" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Viaje</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Intereses</h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(trip.interests)
                                    ? trip.interests.map((interest, index) => (
                                        <Badge key={index} variant="secondary">
                                            {interest}
                                        </Badge>
                                    ))
                                    : trip.interests
                                        ? <Badge variant="secondary">{trip.interests}</Badge>
                                        : <Badge variant="secondary">No especificado</Badge>
                                }
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Presupuesto</h4>
                            <Badge variant="outline" className="text-lg">
                                {trip.budget}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
