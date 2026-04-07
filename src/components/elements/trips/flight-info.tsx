"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Plane,
    Clock,
    MapPin,
    DollarSign,
    Calendar,
    Info
} from "lucide-react";

interface Flight {
    airline: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: string;
    stops: string;
}

interface FlightInfo {
    departureFlights: Flight[];
    returnFlights: Flight[];
    totalFlightCost: string;
    bestBookingTime: string;
    airports: {
        departure: string;
        arrival: string;
    };
}

interface FlightInfoProps {
    flightInfo: FlightInfo;
}

export function FlightInfoComponent({ flightInfo }: FlightInfoProps) {
    const FlightCard = ({ flight, title }: { flight: Flight; title: string }) => (
        <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{flight.airline}</h4>
                <Badge variant="outline">{flight.price}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{flight.departureTime} - {flight.arrivalTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span>{flight.duration}</span>
                </div>
            </div>
            <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                    {flight.stops}
                </Badge>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Información de Vuelos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Airports */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Origen</p>
                                <p className="text-sm text-muted-foreground">{flightInfo.airports.departure}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Destino</p>
                                <p className="text-sm text-muted-foreground">{flightInfo.airports.arrival}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Cost */}
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                                <h4 className="font-semibold">Costo Total de Vuelos</h4>
                                <p className="text-sm text-muted-foreground">Precio estimado por persona</p>
                            </div>
                        </div>
                        <Badge variant="default" className="text-lg font-bold">
                            {flightInfo.totalFlightCost}
                        </Badge>
                    </div>

                    {/* Departure Flights */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Plane className="h-4 w-4 text-primary" />
                            Vuelos de Ida
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {flightInfo.departureFlights.map((flight, index) => (
                                <FlightCard key={index} flight={flight} title="Ida" />
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Return Flights */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Plane className="h-4 w-4 text-primary" />
                            Vuelos de Vuelta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {flightInfo.returnFlights.map((flight, index) => (
                                <FlightCard key={index} flight={flight} title="Vuelta" />
                            ))}
                        </div>
                    </div>

                    {/* Booking Tip */}
                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h4 className="font-medium mb-1">Consejo de Reserva</h4>
                            <p className="text-sm text-muted-foreground">{flightInfo.bestBookingTime}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
