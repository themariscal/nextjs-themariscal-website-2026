"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, Loader2, MapPin, Navigation } from "lucide-react";
import { FindPlaceResult } from "@/components/elements/find_place/find-place-result";
import apiRoutes from '@/lib/api_routes';

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

const Page = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [placeData, setPlaceData] = useState<PlaceData | null>(null);
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
            setPlaceData(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIdentifyPlace = async () => {
        if (!selectedImage) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch(apiRoutes.ai.identifyPlace, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al identificar el lugar');
            }

            const result = await response.json();
            setPlaceData(result.placeData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setPlaceData(null);
        setError(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Identifica Lugares</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Sube una foto de un lugar y descubre información detallada, ubicación exacta y cómo llegar
                    </p>
                </div>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Subir Imagen del Lugar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="image-upload" className="flex items-center gap-2 text-sm font-medium">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Seleccionar Imagen
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            />
                            <p className="text-sm text-muted-foreground">
                                Formatos soportados: JPG, PNG, GIF, WebP (máximo 10MB)
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
                                        onClick={handleIdentifyPlace}
                                        disabled={loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Identificando...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="h-4 w-4" />
                                                Identificar Lugar
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
                {placeData && (
                    <FindPlaceResult placeData={placeData} />
                )}
            </div>
        </div>
    );
};

export default Page;
