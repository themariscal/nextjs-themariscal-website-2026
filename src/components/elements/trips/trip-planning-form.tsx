"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Calendar, Users, DollarSign, Heart, Plane } from "lucide-react";
import { TripFormData, Country } from "@/lib/types/trip";
import { comboBoxItems, selectItems } from "@/lib/constants/trip-constants";
import { formatKey } from "@/lib/utils/trip-utils";

interface TripPlanningFormProps {
    countries: Country[];
    onSubmit: (formData: TripFormData) => Promise<void>;
    loading?: boolean;
}

export function TripPlanningForm({ countries, onSubmit, loading = false }: TripPlanningFormProps) {
    const [formData, setFormData] = useState<TripFormData>({
        country: "",
        originCity: "",
        travelStyle: "",
        interest: "",
        budget: "",
        duration: 0,
        groupType: "",
    });

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        // Validation
        if (!formData.country || !formData.originCity || !formData.travelStyle || !formData.interest || !formData.budget || !formData.groupType) {
            setError("Por favor completa todos los campos");
            return;
        }

        if (formData.duration < 1 || formData.duration > 30) {
            setError("La duración debe estar entre 1 y 30 días");
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            setError("Error al generar el plan de viaje. Inténtalo de nuevo.");
            console.error("Error submitting form:", error);
        }
    };

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formData, [key]: value });
    };

    const countryOptions = countries.map((country) => ({
        text: country.name,
        value: country.value,
    }));

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Plane className="h-6 w-6 text-primary" />
                    Planifica tu Viaje
                </CardTitle>
                <CardDescription>
                    Cuéntanos sobre tu destino y presupuesto, y crearemos un itinerario personalizado para ti
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Country Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="country" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Destino
                        </Label>
                        <Select
                            value={formData.country}
                            onValueChange={(value) => handleChange("country", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                            <SelectContent>
                                {countryOptions.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        {country.text}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Origin City */}
                    <div className="space-y-2">
                        <Label htmlFor="originCity" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Ciudad de Origen
                        </Label>
                        <Input
                            id="originCity"
                            type="text"
                            placeholder="Ej: Madrid, Barcelona, Valencia..."
                            value={formData.originCity}
                            onChange={(e) => handleChange("originCity", e.target.value)}
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Duración (días)
                        </Label>
                        <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="30"
                            placeholder="Ej: 7 días"
                            value={formData.duration || ""}
                            onChange={(e) => handleChange("duration", Number(e.target.value))}
                        />
                    </div>

                    {/* Travel Style */}
                    <div className="space-y-2">
                        <Label htmlFor="travelStyle" className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Estilo de Viaje
                        </Label>
                        <Select
                            value={formData.travelStyle}
                            onValueChange={(value) => handleChange("travelStyle", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu estilo de viaje" />
                            </SelectTrigger>
                            <SelectContent>
                                {comboBoxItems.travelStyle.map((style) => (
                                    <SelectItem key={style} value={style}>
                                        {style}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interests */}
                    <div className="space-y-2">
                        <Label htmlFor="interest" className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Intereses
                        </Label>
                        <Select
                            value={formData.interest}
                            onValueChange={(value) => handleChange("interest", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="¿Qué te interesa más?" />
                            </SelectTrigger>
                            <SelectContent>
                                {comboBoxItems.interest.map((interest) => (
                                    <SelectItem key={interest} value={interest}>
                                        {interest}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Presupuesto
                        </Label>
                        <Select
                            value={formData.budget}
                            onValueChange={(value) => handleChange("budget", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu rango de presupuesto" />
                            </SelectTrigger>
                            <SelectContent>
                                {comboBoxItems.budget.map((budget) => (
                                    <SelectItem key={budget} value={budget}>
                                        {budget}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Group Type */}
                    <div className="space-y-2">
                        <Label htmlFor="groupType" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Tipo de Grupo
                        </Label>
                        <Select
                            value={formData.groupType}
                            onValueChange={(value) => handleChange("groupType", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="¿Con quién viajas?" />
                            </SelectTrigger>
                            <SelectContent>
                                {comboBoxItems.groupType.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generando tu viaje...
                            </>
                        ) : (
                            <>
                                <Plane className="mr-2 h-4 w-4" />
                                Crear Plan de Viaje
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
