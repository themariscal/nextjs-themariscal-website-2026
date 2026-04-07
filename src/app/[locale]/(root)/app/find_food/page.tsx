"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, MapPin, Loader2, Search } from "lucide-react";
import { FindFoodResult } from '@/components/elements/find_food/find-food-result';
import apiRoutes from '@/lib/api_routes';

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

const Page = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [city, setCity] = useState<string>("");
    const [findFoodData, setFindFoodData] = useState<FindFoodData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('La imagen debe ser menor a 10MB');
                return;
            }

            setSelectedImage(file);
            setError(null);
            setFindFoodData(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFindRestaurants = async () => {
        if (!selectedImage) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        if (!city.trim()) {
            setError('Por favor especifica la ciudad donde quieres comer');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            formData.append('city', city);

            const response = await fetch(apiRoutes.ai.findRestaurants, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al buscar restaurantes');
            }

            const result = await response.json();
            setFindFoodData(result.findFoodData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setCity("");
        setFindFoodData(null);
        setError(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Encuentra Restaurantes</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Sube una foto de la comida que quieres probar y descubre los mejores restaurantes en tu ciudad
                    </p>
                </div>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Subir Imagen de Comida
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="image-upload" className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Seleccionar Imagen
                            </Label>
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="cursor-pointer"
                            />
                            <p className="text-sm text-muted-foreground">
                                Formatos soportados: JPG, PNG, GIF, WebP (máximo 10MB)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Ciudad donde quieres comer
                            </Label>
                            <Input
                                id="city"
                                type="text"
                                placeholder="Ej: Madrid, Barcelona, Valencia, París..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Especifica la ciudad para recibir recomendaciones de restaurantes
                            </p>
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                                    />
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={handleFindRestaurants}
                                        disabled={loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4" />
                                                Encontrar Restaurantes
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
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {findFoodData && (
                    <FindFoodResult findFoodData={findFoodData} />
                )}
            </div>
        </div>
    );
};

export default Page;
