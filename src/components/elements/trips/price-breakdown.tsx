"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Home,
    Utensils,
    Car,
    MapPin,
    ShoppingBag,
    DollarSign,
    TrendingUp
} from "lucide-react";
import { PriceBreakdown } from "@/lib/types/trip";

interface PriceBreakdownProps {
    priceBreakdown: PriceBreakdown;
    totalPrice: string;
}

export function PriceBreakdownComponent({ priceBreakdown, totalPrice }: PriceBreakdownProps) {
    const priceItems = [
        {
            key: "accommodation",
            label: "Alojamiento",
            icon: Home,
            description: "Hoteles, hostales o alojamiento"
        },
        {
            key: "food",
            label: "Comida y Bebidas",
            icon: Utensils,
            description: "Restaurantes, comidas y bebidas"
        },
        {
            key: "transportation",
            label: "Transporte",
            icon: Car,
            description: "Vuelos, transporte local y taxis"
        },
        {
            key: "activities",
            label: "Actividades",
            icon: MapPin,
            description: "Tours, atracciones y entretenimiento"
        },
        {
            key: "miscellaneous",
            label: "Varios",
            icon: ShoppingBag,
            description: "Compras, propinas y gastos extras"
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Desglose de Precios
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {priceItems.map((item, index) => {
                        const Icon = item.icon;
                        const price = priceBreakdown[item.key as keyof PriceBreakdown];

                        return (
                            <div key={item.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{item.label}</h4>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-sm font-medium">
                                        {price}
                                    </Badge>
                                </div>
                                {index < priceItems.length - 1 && <Separator />}
                            </div>
                        );
                    })}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                                <TrendingUp className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Total Estimado</h4>
                                <p className="text-sm text-muted-foreground">Precio total del viaje</p>
                            </div>
                        </div>
                        <Badge variant="default" className="text-lg font-bold px-4 py-2">
                            {totalPrice}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
