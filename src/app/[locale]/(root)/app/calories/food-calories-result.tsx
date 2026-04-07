"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Utensils,
    Zap,
    Target,
    Apple,
    Beef,
    Droplets,
    Heart,
    Clock,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    Info
} from "lucide-react";

interface FoodCaloriesData {
    dishName: string;
    description: string;
    totalCalories: number;
    servingSize: string;
    calorieBreakdown: {
        carbohydrates: {
            calories: number;
            percentage: number;
            sources: string[];
        };
        proteins: {
            calories: number;
            percentage: number;
            sources: string[];
        };
        fats: {
            calories: number;
            percentage: number;
            sources: string[];
        };
    };
    macronutrients: {
        carbohydrates: {
            grams: number;
            percentage: number;
        };
        proteins: {
            grams: number;
            percentage: number;
        };
        fats: {
            grams: number;
            percentage: number;
        };
    };
    ingredients: Array<{
        name: string;
        estimatedAmount: string;
        calories: number;
        category: string;
    }>;
    healthInfo: {
        healthScore: number;
        healthNotes: string[];
        dietaryRestrictions: string[];
        benefits: string[];
    };
    recommendations: {
        bestTimeToEat: string;
        portionAdvice: string;
        pairingSuggestions: string[];
    };
}

interface FoodCaloriesResultProps {
    foodCalories: FoodCaloriesData;
}

export function FoodCaloriesResult({ foodCalories }: FoodCaloriesResultProps) {
    const getHealthScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getHealthScoreBg = (score: number) => {
        if (score >= 80) return "bg-green-100";
        if (score >= 60) return "bg-yellow-100";
        return "bg-red-100";
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'carbohydrates':
                return <Apple className="h-4 w-4" />;
            case 'proteins':
                return <Beef className="h-4 w-4" />;
            case 'fats':
                return <Droplets className="h-4 w-4" />;
            default:
                return <Utensils className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'carbohydrates':
                return "text-orange-600";
            case 'proteins':
                return "text-red-600";
            case 'fats':
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl text-primary flex items-center gap-2">
                                <Utensils className="h-6 w-6" />
                                {foodCalories.dishName}
                            </CardTitle>
                            <p className="text-muted-foreground">{foodCalories.description}</p>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-sm">
                                    Porción: {foodCalories.servingSize}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span className="text-2xl font-bold text-primary">
                                        {foodCalories.totalCalories} cal
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${getHealthScoreBg(foodCalories.healthInfo.healthScore)}`}>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getHealthScoreColor(foodCalories.healthInfo.healthScore)}`}>
                                    {foodCalories.healthInfo.healthScore}/100
                                </div>
                                <div className="text-xs text-muted-foreground">Puntuación de Salud</div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Macronutrients Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Macronutrientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Carbohydrates */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Apple className="h-5 w-5 text-orange-600" />
                                <span className="font-medium">Carbohidratos</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{foodCalories.macronutrients.carbohydrates.grams}g</span>
                                    <span>{foodCalories.macronutrients.carbohydrates.percentage}%</span>
                                </div>
                                <Progress
                                    value={foodCalories.macronutrients.carbohydrates.percentage}
                                    className="h-2"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {foodCalories.calorieBreakdown.carbohydrates.calories} cal
                                </div>
                            </div>
                        </div>

                        {/* Proteins */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Beef className="h-5 w-5 text-red-600" />
                                <span className="font-medium">Proteínas</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{foodCalories.macronutrients.proteins.grams}g</span>
                                    <span>{foodCalories.macronutrients.proteins.percentage}%</span>
                                </div>
                                <Progress
                                    value={foodCalories.macronutrients.proteins.percentage}
                                    className="h-2"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {foodCalories.calorieBreakdown.proteins.calories} cal
                                </div>
                            </div>
                        </div>

                        {/* Fats */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Grasas</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{foodCalories.macronutrients.fats.grams}g</span>
                                    <span>{foodCalories.macronutrients.fats.percentage}%</span>
                                </div>
                                <Progress
                                    value={foodCalories.macronutrients.fats.percentage}
                                    className="h-2"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {foodCalories.calorieBreakdown.fats.calories} cal
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ingredients Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        Ingredientes y Calorías
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {foodCalories.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={getCategoryColor(ingredient.category)}>
                                        {getCategoryIcon(ingredient.category)}
                                    </div>
                                    <div>
                                        <div className="font-medium">{ingredient.name}</div>
                                        <div className="text-sm text-muted-foreground">{ingredient.estimatedAmount}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary">{ingredient.calories} cal</div>
                                    <Badge variant="secondary" className="text-xs">
                                        {ingredient.category}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Health Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-primary" />
                            Información de Salud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {foodCalories.healthInfo.healthNotes.map((note, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-sm text-muted-foreground">{note}</p>
                            </div>
                        ))}

                        {foodCalories.healthInfo.benefits.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Beneficios
                                </h4>
                                <ul className="space-y-1">
                                    {foodCalories.healthInfo.benefits.map((benefit, index) => (
                                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {foodCalories.healthInfo.dietaryRestrictions.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    Restricciones Dietéticas
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {foodCalories.healthInfo.dietaryRestrictions.map((restriction, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {restriction}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Recomendaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <div className="font-medium text-sm">Mejor momento para consumir</div>
                                <div className="text-sm text-muted-foreground">{foodCalories.recommendations.bestTimeToEat}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <div className="font-medium text-sm">Consejo de porción</div>
                                <div className="text-sm text-muted-foreground">{foodCalories.recommendations.portionAdvice}</div>
                            </div>
                        </div>

                        {foodCalories.recommendations.pairingSuggestions.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Sugerencias de acompañamiento</h4>
                                <ul className="space-y-1">
                                    {foodCalories.recommendations.pairingSuggestions.map((suggestion, index) => (
                                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
