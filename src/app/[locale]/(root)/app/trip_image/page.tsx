"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, MapPin, Clock, BookOpen, Loader2 } from "lucide-react";
import { PlaceHistoryResult } from "@/components/elements/trips/place-history-result";
import apiRoutes from '@/lib/api_routes';

interface PlaceHistoryData {
    name: string;
    location: string;
    history: string;
    significance: string;
    architecture: string;
    culturalContext: string;
    interestingFacts: string[];
    bestTimeToVisit: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

const Page = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [placeHistory, setPlaceHistory] = useState<PlaceHistoryData | null>(null);
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
            setPlaceHistory(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyzeImage = async () => {
        if (!selectedImage) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await fetch(apiRoutes.ai.analyzePlace, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al analizar la imagen');
            }

            const result = await response.json();
            setPlaceHistory(result.placeHistory);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setPlaceHistory(null);
        setError(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Descubre la Historia de un Lugar</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Sube una imagen de un lugar histórico, monumento o sitio de interés y descubre su fascinante historia
                    </p>
                </div>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Subir Imagen
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
                                        onClick={handleAnalyzeImage}
                                        disabled={loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Analizando...
                                            </>
                                        ) : (
                                            <>
                                                <BookOpen className="h-4 w-4" />
                                                Descubrir Historia
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
                {placeHistory && (
                    <PlaceHistoryResult placeHistory={placeHistory} />
                )}
            </div>
        </div>
    );
};

export default Page;
