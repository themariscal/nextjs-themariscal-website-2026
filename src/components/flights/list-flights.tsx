"use client";

import { differenceInHours, format } from "date-fns";

interface Flight {
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

interface ListFlightsProps {
    flights: Flight[];
    onFlightSelect?: (flight: Flight) => void;
}

export function ListFlights({ flights, onFlightSelect }: ListFlightsProps) {
    return (
        <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col space-y-2">
            <h4 className="font-semibold text-sm mb-2">✈️ Vuelos disponibles:</h4>
            {flights.map((flight) => (
                <div
                    key={flight.id}
                    className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-3 last-of-type:border-none group hover:bg-muted/50 rounded-md px-2 transition-colors"
                    onClick={() => onFlightSelect?.(flight)}
                >
                    <div className="flex flex-col w-full gap-1 justify-between">
                        <div className="flex flex-row gap-1 text-sm font-medium group-hover:underline">
                            <div className="text">
                                {format(new Date(flight.departure.timestamp), "HH:mm")}
                            </div>
                            <div className="no-skeleton">–</div>
                            <div className="text">
                                {format(new Date(flight.arrival.timestamp), "HH:mm")}
                            </div>
                        </div>
                        <div className="text w-fit text-xs text-muted-foreground flex flex-row gap-2">
                            <div>{flight.airlines.join(", ")}</div>
                        </div>
                        <div className="text text-xs text-muted-foreground flex flex-row gap-2">
                            {flight.numberOfStops === 0 ? "Vuelo directo" : `${flight.numberOfStops} escala${flight.numberOfStops > 1 ? 's' : ''}`}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 justify-between">
                        <div className="flex flex-row gap-2">
                            <div className="text-sm">
                                {differenceInHours(
                                    new Date(flight.arrival.timestamp),
                                    new Date(flight.departure.timestamp),
                                )}{" "}
                                h
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-row">
                            <div>{flight.departure.airportCode}</div>
                            <div>–</div>
                            <div>{flight.arrival.airportCode}</div>
                        </div>
                    </div>

                    <div className="flex flex-col w-24 items-end gap-1">
                        <div className="flex flex-row gap-2">
                            <div className="text-sm text-emerald-600 dark:text-emerald-500 font-semibold">
                                €{flight.priceInUSD}
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-row">
                            Ida y vuelta
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
